// The driver's view on each phone in real 3D (owner's pick "A · chase cam", 24 Nov 2026; draft
// https://claude.ai/artifact/TBjdD5iyXwezKQzsGvGXFs). Same data as the old pseudo-3D view (Chase3D.tsx):
// every cart's position from `kart/pos` 5 times a second, filled in between, with your own steering applied
// straight away. Drawn with three.js on the phone itself (no extra Firebase traffic). Phones without WebGL,
// or any error while setting up, fall back to Chase3D (see KartView3D below).
import { Component, useEffect, useRef, useState, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";
import { onValue, ref } from "../lib/store.ts";
import { db } from "../lib/firebase.ts";
import { tokenById } from "../lib/tokens.ts";
import type { Player } from "../lib/types.ts";
import { BOX_LANES, BOX_ROWS, HAZARDS, HALF, PATH_POINTS, TRACK_LEN, TRACK_W, wrap } from "./track.ts";
import { decodePos, type CartPos, type CartPosWire } from "./engine.ts";
import { BASE_SPEED } from "./sim.ts";
import Chase3D, { drawSpeedo } from "./Chase3D.tsx";
import { kartSounds } from "./kartSound.ts";

const STEER_RATE = 1.7; // same as Chase3D
const ROAD = TRACK_W;
const KERB = 12;
// Camera A: behind and above your cart, looking a little ahead.
const CAM_BACK = 52;
const CAM_UP = 24;
const CAM_AHEAD = 40;
const FOV = 62;
const MAX_SHOWN = 12; // other carts drawn at once (the nearest ones ahead and just behind)
/** The factory zone (grey ground, yellow-and-black kerbs, halls), the same stretch as in Chase3D. */
const FACTORY = [0.42, 0.68];
const inFactory = (s: number) => {
  const f = wrap(s) / TRACK_LEN;
  return f >= FACTORY[0] && f < FACTORY[1];
};

// ---- Track geometry (world = the projector's 1600 x 900 map, y on the map = z here, y up) ----
const P = PATH_POINTS;
const NP = P.x.length;
const STEP = TRACK_LEN / NP;
type Spot = { x: number; z: number; tx: number; tz: number; nx: number; nz: number };
/** A point on the road: s = distance along it, d = -1 (left edge) .. 1 (right edge), like place() in track.ts. */
function spot(s: number, d = 0): Spot {
  const u = wrap(s) / STEP;
  const i = Math.floor(u) % NP;
  const j = (i + 1) % NP;
  const f = u - Math.floor(u);
  let dh = P.h[j] - P.h[i];
  while (dh > Math.PI) dh -= 2 * Math.PI;
  while (dh < -Math.PI) dh += 2 * Math.PI;
  const h = P.h[i] + dh * f;
  const tx = Math.cos(h);
  const tz = Math.sin(h);
  const nx = -tz;
  const nz = tx; // right-hand side of the driver (matches place(): d > 0 = right)
  const cx = P.x[i] + (P.x[j] - P.x[i]) * f - 800;
  const cz = P.y[i] + (P.y[j] - P.y[i]) * f - 450;
  return { x: cx + nx * d * HALF, z: cz + nz * d * HALF, tx, tz, nx, nz };
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** A strip along the road between two side offsets (world units), coloured per sample. */
function ribbon(off0: number, off1: number, y: number, colour: (i: number, s: number) => string) {
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const c = new THREE.Color();
  for (let i = 0; i <= NP; i++) {
    const k = i % NP;
    const s = k * STEP;
    const a = spot(s, off0 / HALF);
    const b = spot(s, off1 / HALF);
    pos.push(a.x, y, a.z, b.x, y, b.z);
    c.set(colour(k, s));
    col.push(c.r, c.g, c.b, c.r, c.g, c.b);
    if (i < NP) {
      const q = i * 2;
      idx.push(q, q + 2, q + 1, q + 1, q + 2, q + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
}

type Kart = { g: THREE.Group; paint: THREE.MeshLambertMaterial; wheels: THREE.Mesh[]; steerers: THREE.Group[]; flames: THREE.Mesh[]; shield: THREE.Mesh; tag: THREE.Sprite | null; tagFor: string; colour: string };

function buildWorld(scene: THREE.Scene) {
  const SKY = new THREE.Color("#8fd3ff");
  scene.background = SKY;
  scene.fog = new THREE.Fog(SKY, 420, 1300);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x5a8a3a, 1.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-300, 500, 200);
  scene.add(sun);

  const grass = canvasTex(256, 256, (g, w, h) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? "#6cbf4a" : "#62b343";
      g.fillRect(0, (i * h) / 8, w, h / 8);
    }
  });
  grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set(30, 30);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshLambertMaterial({ map: grass }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  scene.add(ground);

  // Road, kerbs (red/white; yellow/black in the factory zone), dashed lane lines, grey verge in the factory zone
  scene.add(ribbon(-HALF - 40, HALF + 40, -0.2, (_i, s) => (inFactory(s) ? "#a8adb3" : "#6cbf4a")));
  scene.add(ribbon(-ROAD / 2, ROAD / 2, 0, (i, s) => (inFactory(s) ? (Math.floor(i / 5) % 2 ? "#4f5359" : "#55595f") : Math.floor(i / 5) % 2 ? "#5c6068" : "#62666e")));
  const kerb = (i: number, s: number) => (Math.floor(i / 3) % 2 ? (inFactory(s) ? "#2b2f36" : "#d33a3a") : inFactory(s) ? "#f5c542" : "#ffffff");
  scene.add(ribbon(ROAD / 2, ROAD / 2 + KERB, 0.5, kerb));
  scene.add(ribbon(-ROAD / 2 - KERB, -ROAD / 2, 0.5, kerb));
  for (const lane of [-ROAD / 6, ROAD / 6])
    scene.add(ribbon(lane - 1.2, lane + 1.2, 0.25, (i, s) => (Math.floor(i / 4) % 2 ? (inFactory(s) ? "#4f5359" : "#5c6068") : inFactory(s) ? "#f5c542" : "#f4f1e6")));

  // Start line + gantry
  const st = spot(0);
  const chk = canvasTex(128, 16, (g) => {
    for (let x = 0; x < 16; x++)
      for (let y = 0; y < 2; y++) {
        g.fillStyle = (x + y) % 2 ? "#111" : "#fff";
        g.fillRect(x * 8, y * 8, 8, 8);
      }
  });
  const line = new THREE.Mesh(new THREE.PlaneGeometry(ROAD, 12), new THREE.MeshBasicMaterial({ map: chk }));
  line.rotation.x = -Math.PI / 2;
  line.rotation.z = -Math.atan2(st.tz, st.tx) + Math.PI / 2;
  line.position.set(st.x, 0.8, st.z);
  scene.add(line);
  const postM = new THREE.MeshLambertMaterial({ color: 0x334155 });
  for (const sg of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(4, 66, 4), postM);
    post.position.set(st.x + st.nx * sg * (ROAD / 2 + 16), 33, st.z + st.nz * sg * (ROAD / 2 + 16));
    scene.add(post);
  }
  const banner = canvasTex(512, 64, (g, w) => {
    g.fillStyle = "#0f5a3a";
    g.fillRect(0, 0, w, 64);
    g.fillStyle = "#f6c343";
    g.font = "bold 40px 'Baloo 2', sans-serif";
    g.textAlign = "center";
    g.fillText("QUALITY CART · START", w / 2, 46);
  });
  const bm = new THREE.MeshBasicMaterial({ map: banner });
  const ban = new THREE.Mesh(new THREE.BoxGeometry(ROAD + 36, 12, 2), [postM, postM, postM, postM, bm, bm]);
  ban.position.set(st.x, 64, st.z); // high enough that the camera passes well under it
  ban.lookAt(st.x + st.tx, 64, st.z + st.tz);
  scene.add(ban);

  // Q boxes (hidden when someone took them: kart/pos.b)
  const qtex = canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = "#f6c343";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#a86f12";
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = "#3a2a00";
    g.font = "bold 44px sans-serif";
    g.textAlign = "center";
    g.fillText("Q", w / 2, 48);
  });
  const qMat = new THREE.MeshLambertMaterial({ map: qtex, emissive: 0x553300 });
  const qGeo = new THREE.BoxGeometry(10, 10, 10);
  const boxes: THREE.Mesh[] = [];
  const cones: THREE.Group[] = [];
  BOX_ROWS.forEach((row) =>
    BOX_LANES.forEach((lane) => {
      const p = spot(row, lane);
      const b = new THREE.Mesh(qGeo, qMat);
      b.position.set(p.x, 10, p.z);
      scene.add(b);
      boxes.push(b);
    }),
  );

  // Hazards: cones, potholes, out-of-spec zones (orange stripes)
  const coneM = new THREE.MeshLambertMaterial({ color: 0xff7a1a });
  const coneWhite = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const holeM = new THREE.MeshLambertMaterial({ color: 0x2b2b2b });
  const oosTex = canvasTex(64, 64, (g, w, h) => {
    for (let k = -2; k < 6; k++) {
      g.fillStyle = k % 2 ? "#ff8a1a" : "#ffd23f";
      g.beginPath();
      g.moveTo(k * 16, 0);
      g.lineTo(k * 16 + 16, 0);
      g.lineTo(k * 16 + 16 + h, h);
      g.lineTo(k * 16 + h, h);
      g.fill();
    }
    void w;
  });
  oosTex.wrapS = oosTex.wrapT = THREE.RepeatWrapping;
  for (const hz of HAZARDS) {
    const p = spot(hz.s, hz.d);
    if (hz.kind === "cone") {
      for (const off of [-0.12, 0.12]) {
        const q = spot(hz.s, hz.d + off);
        const c = new THREE.Group();
        c.add(new THREE.Mesh(new THREE.ConeGeometry(4, 11, 10), coneM).translateY(5.5));
        c.add(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.9, 2, 10), coneWhite).translateY(6));
        c.position.set(q.x, 0, q.z);
        scene.add(c);
        cones.push(c);
      }
    } else if (hz.kind === "pothole") {
      const h = new THREE.Mesh(new THREE.CircleGeometry(hz.wide * HALF, 16), holeM);
      h.rotation.x = -Math.PI / 2;
      h.position.set(p.x, 0.4, p.z);
      h.scale.set(1, 0.7, 1);
      scene.add(h);
    } else {
      const t = oosTex.clone();
      t.repeat.set((hz.wide * 2 * HALF) / 16, hz.len / 16);
      t.needsUpdate = true;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(hz.wide * 2 * HALF, hz.len), new THREE.MeshLambertMaterial({ map: t, transparent: true, opacity: 0.85 }));
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = -Math.atan2(p.tz, p.tx) + Math.PI / 2;
      m.position.set(p.x, 0.35, p.z);
      scene.add(m);
    }
  }

  // Scenery: factory halls (mostly by the factory zone), trees elsewhere; never next to the road.
  const near = (x: number, z: number, m: number) => {
    for (let i = 0; i < NP; i += 3) {
      const dx = P.x[i] - 800 - x;
      const dz = P.y[i] - 450 - z;
      if (dx * dx + dz * dz < m * m) return true;
    }
    return false;
  };
  const wallTex = canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = "#cfd8e3";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#9fb3c8";
    for (let x = 6; x < w; x += 18) g.fillRect(x, 14, 10, 18);
    g.fillStyle = "#0f5a3a";
    g.fillRect(0, h - 10, w, 10);
  });
  const wallM = new THREE.MeshLambertMaterial({ map: wallTex });
  const roofM = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
  const chimM = new THREE.MeshLambertMaterial({ color: 0xb91c1c });
  const hall = (x: number, z: number, w: number, d: number, hgt: number, turn: boolean) => {
    const rw = turn ? d : w;
    const rd = turn ? w : d;
    for (let gx = -rw / 2; gx <= rw / 2; gx += 20) for (let gz = -rd / 2; gz <= rd / 2; gz += 20) if (near(x + gx, z + gz, HALF + 34)) return;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, hgt, d), wallM);
    body.position.y = hgt / 2;
    g.add(body);
    const teeth = Math.max(2, Math.round(w / 40));
    for (let i = 0; i < teeth; i++) {
      const tooth = new THREE.Mesh(new THREE.CylinderGeometry(0, d / 2, 14, 3, 1), roofM);
      tooth.rotation.z = Math.PI / 2;
      tooth.rotation.y = Math.PI / 2;
      tooth.scale.set(1, w / teeth / 14, 1);
      tooth.position.set(-w / 2 + (i + 0.5) * (w / teeth), hgt + 6, 0);
      g.add(tooth);
    }
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, hgt * 1.6, 10), chimM);
    ch.position.set(w / 2 - 10, hgt * 0.8, d / 2 - 10);
    g.add(ch);
    g.position.set(x, 0, z);
    if (turn) g.rotation.y = Math.PI / 2;
    scene.add(g);
  };
  for (const [x, z, w, d, hg, t] of [
    [-80, -30, 220, 110, 50, 0], [240, 30, 160, 100, 44, 0], [-420, 20, 110, 150, 40, 1], [820, -90, 150, 220, 56, 1], [380, 560, 240, 110, 48, 0],
    [-60, 560, 200, 100, 44, 0], [-900, -60, 160, 120, 46, 1], [900, 380, 180, 120, 50, 0], [-560, -560, 220, 110, 48, 0], [600, -560, 240, 110, 50, 0],
  ] as number[][])
    hall(x, z, w, d, hg, !!t);
  // Trees: one shared shape, drawn with instancing (cheap on phones)
  const trunkGeo = new THREE.CylinderGeometry(2, 3, 12, 6).translate(0, 6, 0);
  const leafGeo = new THREE.ConeGeometry(12, 30, 7).translate(0, 26, 0);
  const spotsT: THREE.Matrix4[] = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let k = 0; k < 1200 && spotsT.length < 240; k++) {
    const x = -1200 + rnd() * 2400;
    const z = -900 + rnd() * 1800;
    if (near(x, z, HALF + 40)) continue;
    if (x > -320 && x < 360 && z > -110 && z < 110) continue; // inner factory yard
    const s = 0.8 + rnd() * 0.8;
    spotsT.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion(), new THREE.Vector3(s, s, s)));
  }
  const trunks = new THREE.InstancedMesh(trunkGeo, new THREE.MeshLambertMaterial({ color: 0x7a4a14 }), spotsT.length);
  const leaves = new THREE.InstancedMesh(leafGeo, new THREE.MeshLambertMaterial({ color: 0x2f8a3a }), spotsT.length);
  spotsT.forEach((m, i) => {
    trunks.setMatrixAt(i, m);
    leaves.setMatrixAt(i, m);
  });
  scene.add(trunks, leaves);

  return { boxes, cones };
}

const shadowTex = () =>
  canvasTex(64, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 4, 32, 32, 30);
    r.addColorStop(0, "rgba(0,0,0,.45)");
    r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
  });

function buildKart(scene: THREE.Scene, shadow: THREE.Texture): Kart {
  const g = new THREE.Group();
  const paint = new THREE.MeshLambertMaterial({ color: 0xe3263a });
  const dark = new THREE.MeshLambertMaterial({ color: 0x1f2937 });
  const tyre = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };
  // The kart faces +z in its own space (lookAt points +z at the target).
  add(new THREE.BoxGeometry(13, 3.5, 20), paint, 0, 4, 0);
  add(new THREE.BoxGeometry(11, 2.5, 6), paint, 0, 3.5, 12);
  add(new THREE.BoxGeometry(15, 2, 2), dark, 0, 3, 15.5);
  add(new THREE.BoxGeometry(7, 6, 5), dark, 0, 8, -3);
  add(new THREE.BoxGeometry(6, 6, 4), new THREE.MeshLambertMaterial({ color: 0xf8fafc }), 0, 10, -1);
  add(new THREE.SphereGeometry(3.4, 14, 10), paint, 0, 15.5, -1);
  add(new THREE.BoxGeometry(4.6, 1.6, 1), new THREE.MeshLambertMaterial({ color: 0x0f172a }), 0, 15.6, 2.2);
  add(new THREE.BoxGeometry(14, 1, 3), paint, 0, 10, -10);
  for (const sx of [-1, 1]) add(new THREE.BoxGeometry(1, 5, 1), dark, sx * 5, 7.5, -10);
  const wheels: THREE.Mesh[] = [];
  const steerers: THREE.Group[] = []; // front wheels turn left and right on these
  for (const [x, z, r] of [[-8, 8, 3], [8, 8, 3], [-8.5, -7, 3.6], [8.5, -7, 3.6]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 3.2, 14), tyre);
    w.rotation.z = Math.PI / 2;
    if (z > 0) {
      const pivot = new THREE.Group();
      pivot.position.set(x, r, z);
      pivot.add(w);
      g.add(pivot);
      steerers.push(pivot);
    } else {
      w.position.set(x, r, z);
      g.add(w);
    }
    wheels.push(w);
  }
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(26, 32), new THREE.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2;
  sh.position.y = 0.9;
  g.add(sh);
  const flames: THREE.Mesh[] = [];
  const flameM = new THREE.MeshBasicMaterial({ color: 0xffa31a, transparent: true, opacity: 0.9 });
  for (const sx of [-3, 3]) {
    const f = add(new THREE.ConeGeometry(2.2, 9, 8), flameM, sx, 4, -15);
    f.rotation.x = -Math.PI / 2;
    f.visible = false;
    flames.push(f);
  }
  const shield = new THREE.Mesh(new THREE.SphereGeometry(18, 18, 12), new THREE.MeshBasicMaterial({ color: 0x5ac8ff, transparent: true, opacity: 0.25, depthWrite: false }));
  shield.position.y = 8;
  shield.visible = false;
  g.add(shield);
  scene.add(g);
  return { g, paint, wheels, steerers, flames, shield, tag: null, tagFor: "", colour: "" };
}

function setTag(k: Kart, name: string, colour: string) {
  if (k.tagFor === name + colour) return;
  k.tagFor = name + colour;
  if (k.tag) {
    k.g.remove(k.tag);
    (k.tag.material as THREE.SpriteMaterial).map?.dispose();
    k.tag.material.dispose();
  }
  const t = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = colour;
    g.globalAlpha = 0.9;
    g.beginPath();
    if (g.roundRect) g.roundRect(8, 8, w - 16, h - 16, 18);
    else g.rect(8, 8, w - 16, h - 16);
    g.fill();
    g.globalAlpha = 1;
    g.fillStyle = "#fff";
    g.font = "bold 32px Figtree, sans-serif";
    g.textAlign = "center";
    g.fillText(name.slice(0, 14), w / 2, 44);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false }));
  s.scale.set(18, 4.5, 1);
  s.position.y = 25;
  k.g.add(s);
  k.tag = s;
}

/** How fast the road bends to the driver's right at s (radians per unit of road; negative = to the left). */
function bendAt(s: number) {
  const a = spot(s - 12);
  const b = spot(s + 12);
  return ((b.tx - a.tx) * a.nx + (b.tz - a.tz) * a.nz) / 24;
}

/** How a kart sits on the road, smoothed from frame to frame so it really turns instead of sliding sideways. */
type Pose = { d: number; yaw: number; roll: number; wheel: number };
const newPose = (d: number): Pose => ({ d, yaw: 0, roll: 0, wheel: 0 });
const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));

/**
 * Puts a kart on the road at s, d, facing along the road, then turns it the way it is really going:
 * the nose points where the kart moves (sideways moves from steering included) and a little into bends,
 * the front wheels steer, and the body leans out of the turn. `steer` (-1..1) is the driver's input (own cart only).
 */
function placeKart(k: Kart, pose: Pose, s: number, d: number, speed: number, dt: number, steer = 0) {
  const a = spot(s, d);
  const b = spot(s + 14, d);
  k.g.position.set(a.x, 0, a.z);
  k.g.lookAt(b.x, 0, b.z);
  const fwd = Math.max(25, speed);
  const side = dt > 0 ? ((d - pose.d) / dt) * HALF : 0; // sideways speed, + = to the right
  pose.d = d;
  const bend = bendAt(s);
  // + yaw = nose to the driver's right (rotateY turns the nose left, hence the minus below)
  const yawTo = clamp(Math.atan2(side, fwd) * 0.7 + bend * fwd * 0.22 + steer * 0.1, 0.5);
  const f = Math.min(1, dt * 9);
  pose.yaw += (yawTo - pose.yaw) * f;
  pose.wheel += (clamp(yawTo * 1.5 + bend * 18 + steer * 0.25, 0.6) - pose.wheel) * Math.min(1, dt * 14);
  pose.roll += (clamp(bend * fwd * fwd * 0.0032 + pose.yaw * 0.12, 0.16) - pose.roll) * Math.min(1, dt * 6);
  k.g.rotateY(-pose.yaw);
  k.g.rotateZ(-pose.roll); // lean out of the turn
  for (const w of k.steerers) w.rotation.y = -pose.wheel;
}

function Kart3DView({ uid, players, steer, onFail }: { uid: string; players: Record<string, Player>; steer: MutableRefObject<number>; onFail: () => void }) {
  const glRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLCanvasElement>(null);
  const posRef = useRef<{ pos: CartPos; at: number } | null>(null);
  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => {
    let ids: string[] | null = null;
    const offIds = onValue(ref(db, "kart/ids"), (s) => (ids = (s.val() as string[] | null) ?? null));
    const offPos = onValue(ref(db, "kart/pos"), (s) => {
      const pos = decodePos(s.val() as CartPosWire | null, ids);
      if (pos) posRef.current = { pos, at: performance.now() };
    });
    return () => {
      offIds();
      offPos();
    };
  }, []);

  useEffect(() => {
    const cv = glRef.current;
    const hud = hudRef.current;
    if (!cv || !hud) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" });
    } catch {
      onFail();
      return;
    }
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 1, 1500);
    let world: ReturnType<typeof buildWorld>;
    let me: Kart;
    const pool: Kart[] = [];
    const shadow = shadowTex();
    try {
      world = buildWorld(scene);
      me = buildKart(scene, shadow);
      for (let i = 0; i < MAX_SHOWN; i++) {
        const k = buildKart(scene, shadow);
        k.g.visible = false;
        pool.push(k);
      }
    } catch {
      renderer.dispose();
      onFail();
      return;
    }
    const hctx = hud.getContext("2d")!;
    const resize = () => {
      const r = cv.getBoundingClientRect();
      const w = Math.max(2, Math.round(r.width));
      const h = Math.max(2, Math.round(r.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      hud.width = Math.round(w * dpr);
      hud.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const colourOf = (u: string) => tokenById(playersRef.current[u]?.token).color;
    const shown = new Map<string, number>(); // smoothed distance of each other cart
    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();
    let snap = true;
    let pMe = 0;
    let dMe = 0;
    const myPose = newPose(0);
    const poses = new Map<string, Pose>(); // other carts, by player
    const sounds = kartSounds();
    let camHead = 0; // the camera's direction (radians on the map), follows the kart a little late
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const live = posRef.current;
      const mine = live?.pos.c[uid];
      const since = live ? Math.min(0.5, (now - live.at) / 1000) : 0;
      const flags = mine?.[3] ?? 0;
      const spinning = (flags & 1) !== 0;
      const speed = mine?.[2] ?? 0;
      if (mine) {
        // Same smoothing as Chase3D: predict from the last update, steer locally, drift back to the referee's line.
        const predicted = mine[0] + speed * since;
        pMe += speed * dt;
        if (Math.abs(predicted - pMe) > 150) pMe = predicted;
        else pMe += (predicted - pMe) * 0.12;
        if (!spinning && !(flags & 16)) dMe = Math.max(-1, Math.min(1, dMe + steer.current * STEER_RATE * dt));
        dMe += (mine[1] - dMe) * 0.08;
        sounds.frame(speed, flags, pMe, dMe);
      }

      // My cart
      const myColour = colourOf(uid);
      if (me.colour !== myColour) {
        me.paint.color.set(myColour);
        me.colour = myColour;
      }
      const st = steer.current;
      placeKart(me, myPose, pMe, dMe, speed, dt, spinning ? 0 : st);
      if (spinning) me.g.rotateY(((now / 1000) * 9) % (Math.PI * 2));
      for (const w of me.wheels) w.rotation.x += (speed * dt) / 3.3;
      const turbo = (flags & 2) !== 0;
      const sup = (flags & 32) !== 0;
      for (const f of me.flames) {
        f.visible = turbo || sup;
        f.scale.setScalar((sup ? 1.6 : 1) * (0.8 + Math.random() * 0.5));
      }
      me.shield.visible = (flags & 4) !== 0;

      // Other carts: the nearest ones ahead (and just behind) get a kart from the pool
      const others = live ? Object.entries(live.pos.c).filter(([u]) => u !== uid) : [];
      const near: [string, number, number, number][] = [];
      for (const [u, c] of others) {
        const target = c[0] + c[2] * since;
        const prev = shown.get(u);
        const s = prev === undefined || Math.abs(target - prev) > 150 ? target : prev + c[2] * dt + (target - prev) * 0.15;
        shown.set(u, s);
        // Sides arrive 5 times a second: glide towards the latest one so other carts do not jump across.
        let pose = poses.get(u);
        if (!pose) poses.set(u, (pose = newPose(c[1])));
        let gap = wrap(s) - wrap(pMe);
        if (gap > TRACK_LEN / 2) gap -= TRACK_LEN;
        if (gap < -TRACK_LEN / 2) gap += TRACK_LEN;
        // A cart on top of yours (start grid, passing) would hide your own cart: leave it out until it is clear.
        const dShown = pose.d + (c[1] - pose.d) * Math.min(1, dt * 7);
        if (Math.abs(gap) < 22 && Math.abs(dShown - dMe) < 0.4) {
          pose.d = dShown;
          continue;
        }
        if (gap > -40 && gap < 650) near.push([u, s, dShown, gap]);
        else pose.d = dShown;
      }
      near.sort((a, b) => Math.abs(a[3]) - Math.abs(b[3]));
      pool.forEach((k, i) => {
        const n = near[i];
        if (!n) {
          k.g.visible = false;
          return;
        }
        const [u, s, d] = n;
        const fl = live!.pos.c[u][3] ?? 0;
        const col = colourOf(u);
        if (k.colour !== col) {
          k.paint.color.set(col);
          k.colour = col;
        }
        setTag(k, playersRef.current[u]?.name ?? "", col);
        k.g.visible = true;
        placeKart(k, poses.get(u)!, s, d, live!.pos.c[u][2] ?? 0, dt);
        if (fl & 1) k.g.rotateY(((now / 1000) * 9) % (Math.PI * 2));
        for (const w of k.wheels) w.rotation.x += ((live!.pos.c[u][2] ?? 0) * dt) / 3.3;
        for (const f of k.flames) f.visible = (fl & 34) !== 0;
        k.shield.visible = (fl & 4) !== 0;
      });

      for (const n of near.slice(pool.length)) poses.get(n[0])!.d = n[2];

      // Q boxes spin; taken ones are hidden until they come back
      const hidden = new Set(live?.pos.b ?? []);
      world.boxes.forEach((b, i) => {
        b.visible = !hidden.has(i);
        b.rotation.y += dt * 1.6;
        b.rotation.x += dt * 0.6;
      });

      // Camera A: behind and above your kart, looking ahead. It turns with the kart a little late,
      // so you see the kart swing into a bend or a lane change before the view follows it.
      const here = spot(pMe, dMe);
      const roadHead = Math.atan2(here.tz, here.tx);
      const headTo = roadHead + (spinning ? 0 : myPose.yaw * 0.5);
      if (snap) camHead = headTo;
      let dh = headTo - camHead;
      while (dh > Math.PI) dh -= 2 * Math.PI;
      while (dh < -Math.PI) dh += 2 * Math.PI;
      camHead += dh * Math.min(1, dt * 3.2);
      const cx = Math.cos(camHead);
      const cz = Math.sin(camHead);
      const behind = new THREE.Vector3(here.x - cx * CAM_BACK, CAM_UP, here.z - cz * CAM_BACK);
      const look = new THREE.Vector3(here.x + cx * CAM_AHEAD, 4, here.z + cz * CAM_AHEAD);
      if (snap) {
        camPos.copy(behind);
        camLook.copy(look);
        snap = false;
      }
      const k = Math.min(1, dt * 8);
      camPos.lerp(behind, k);
      camLook.lerp(look, k);
      camera.position.copy(camPos);
      camera.lookAt(camLook);
      // Cones between the camera and your cart would block the view: hide the ones right by the camera.
      const myDist = me.g.position.distanceTo(camPos) + 8;
      for (const c of world.cones) c.visible = c.position.distanceTo(camPos) > myDist;
      const fov = FOV + (sup ? 9 : turbo ? 5 : 0);
      if (Math.abs(camera.fov - fov) > 0.05) {
        camera.fov += (fov - camera.fov) * Math.min(1, dt * 4);
        camera.updateProjectionMatrix();
      }
      renderer.render(scene, camera);

      // Speedometer on the 2D layer (same dial as before), plus speed lines in SUPER TURBO
      const W = hud.width;
      const H = hud.height;
      hctx.clearRect(0, 0, W, H);
      if (sup) {
        hctx.strokeStyle = "rgba(255,255,255,.55)";
        hctx.lineWidth = Math.max(2, H * 0.006);
        for (let n = 0; n < 10; n++) {
          const y = ((n * 97 + now * 1.4) % (H * 0.9)) + H * 0.05;
          const side = n % 2 ? 1 : -1;
          const x0 = side > 0 ? W - (n % 3) * H * 0.04 : (n % 3) * H * 0.04;
          hctx.beginPath();
          hctx.moveTo(x0, y);
          hctx.lineTo(x0 - side * H * 0.12, y + H * 0.04);
          hctx.stroke();
        }
      }
      drawSpeedo(hctx, W - H * 0.15, H - H * 0.15, H * 0.13, (speed / BASE_SPEED) * 120, (flags & 34) !== 0);
    };
    raf = requestAnimationFrame(frame);
    const lost = (e: Event) => {
      e.preventDefault();
      onFail();
    };
    cv.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      sounds.stop();
      cv.removeEventListener("webglcontextlost", lost);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
    };
  }, [uid, steer, onFail]);

  return (
    <div className="chase kr3d">
      <canvas ref={glRef} className="kr3d-gl" aria-label="Your view of the race" />
      <canvas ref={hudRef} className="kr3d-hud" aria-hidden="true" />
    </div>
  );
}

function webglOK(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class Guard extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** The 3D view, or the old view on phones that cannot draw 3D (or if anything goes wrong). */
export default function Kart3D(props: { uid: string; players: Record<string, Player>; steer: MutableRefObject<number> }) {
  const [failed, setFailed] = useState(() => !webglOK());
  const fail = useRef(() => setFailed(true)).current;
  const old = <Chase3D {...props} />;
  return failed ? old : <Guard fallback={old}><Kart3DView {...props} onFail={fail} /></Guard>;
}
