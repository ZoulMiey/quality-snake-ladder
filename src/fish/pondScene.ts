// The phone's 3D pond (owner's pick: camera A, behind your own boat; bright cartoon, low-poly).
// Draft: https://claude.ai/artifact/BemgFLNobDesu7PfzxprQq. Loaded only by Fishing Derby phones.
import * as T from "three";
import { boatSpot } from "./rules.ts";
import type { BoatInfo, LeapKind, PondApi } from "./pondApi.ts";

const RX = 40;
/** Fixed camera behind my boat: how far back, how high, and where it aims (towards the camera and down). */
const CAM_BACK = 9;
const CAM_UP = 6.2;
const CAM_AIM = 0;
const CAM_LOW = -0.8;
const RZ = 27;
const PI = Math.PI;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const lam = (c: T.ColorRepresentation) => new T.MeshLambertMaterial({ color: c, flatShading: true });

type Boat3 = { info: BoatInfo; i: number; g: T.Group; pos: T.Vector3; bob: T.Vector3; bobber: T.Group; line: T.Line; av: T.Sprite; me: boolean };
type Actor =
  | { type: "fish"; f: T.Group; b: Boat3; t0: number; dur: number; h: number; hold: number; doneAt?: number; label?: string; gold?: boolean }
  | { type: "spark"; m: T.Mesh; b: Boat3; t0: number; i: number }
  | { type: "ring"; m: T.Mesh; t0: number; s: number }
  | { type: "drop"; m: T.Mesh; t0: number; p: T.Vector3; vx: number; vy: number; vz: number }
  | { type: "float"; el: HTMLDivElement; world: T.Vector3; t0: number };

function circleTex(draw: (x: CanvasRenderingContext2D) => void, w = 128, h = 128) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
function avatarTex(emoji: string, col: string) {
  return circleTex((x) => {
    x.fillStyle = "#fff";
    x.beginPath();
    x.arc(64, 64, 54, 0, 7);
    x.fill();
    x.lineWidth = 12;
    x.strokeStyle = col;
    x.stroke();
    x.font = '64px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillStyle = "#000";
    x.fillText(emoji, 64, 70);
  });
}
function labelTex(text: string, col: string) {
  return circleTex(
    (x) => {
      x.font = '700 34px "Figtree",system-ui,sans-serif';
      const w = Math.min(240, x.measureText(text).width + 28);
      const l = 128 - w / 2;
      x.fillStyle = col;
      x.beginPath();
      x.moveTo(l + 12, 8);
      x.arcTo(l + w, 8, l + w, 56, 12);
      x.arcTo(l + w, 56, l, 56, 12);
      x.arcTo(l, 56, l, 8, 12);
      x.arcTo(l, 8, l + w, 8, 12);
      x.fill();
      x.fillStyle = "#fff";
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillText(text, 128, 33, 230);
    },
    256,
    64,
  );
}

export class PondScene implements PondApi {
  private R: T.WebGLRenderer;
  private scene = new T.Scene();
  private cam = new T.PerspectiveCamera(50, 1, 0.1, 400);
  private camLook = new T.Vector3();
  private waterMat: T.MeshPhongMaterial;
  private water: T.Mesh;
  private inside: boolean[] = [];
  private shadows: T.Mesh[] = [];
  private reeds: T.Group[] = [];
  private boats: Boat3[] = [];
  private byUid = new Map<string, Boat3>();
  private me: Boat3 | null = null;
  private arrow: T.Mesh;
  private actors: Actor[] = [];
  private snapped = false;
  private frenzy = false;
  private raf = 0;
  private ro: ResizeObserver;
  private started = performance.now();
  private hull: T.ExtrudeGeometry;
  private deck: T.ShapeGeometry;
  private mats = { hull: lam("#8b5a2b"), deck: lam("#c08a45"), rod: lam("#3b2a1a"), red: lam("#ef4444"), white: lam("#ffffff") };

  constructor(
    private canvas: HTMLCanvasElement,
    private floats: HTMLElement,
  ) {
    this.R = new T.WebGLRenderer({ canvas, antialias: true });
    this.R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const sky = new T.Color("#9fd8f5");
    this.scene.background = sky;
    this.scene.fog = new T.Fog(sky, 70, 150);
    this.scene.add(new T.HemisphereLight(0xffffff, 0x4a7a3a, 0.7 * PI));
    const sun = new T.DirectionalLight(0xffffff, 0.75 * PI);
    sun.position.set(20, 40, 15);
    this.scene.add(sun);

    const ground = new T.Mesh(new T.PlaneGeometry(500, 500), lam("#5fae4e"));
    ground.rotation.x = -PI / 2;
    this.scene.add(ground);
    this.ellipse(RX + 3, RZ + 2.6, 0.02, lam("#e6cf98"));
    this.waterMat = new T.MeshPhongMaterial({ color: "#2a8cc8", shininess: 40, specular: 0x6699bb, flatShading: true });
    this.water = new T.Mesh(new T.PlaneGeometry(2 * RX, 2 * RZ, 40, 28), this.waterMat);
    this.water.rotation.x = -PI / 2;
    this.water.position.y = 0.08;
    this.scene.add(this.water);
    const wp = this.water.geometry.attributes.position;
    for (let i = 0; i < wp.count; i++) this.inside.push((wp.getX(i) / RX) ** 2 + (wp.getY(i) / RZ) ** 2 <= 1.02);
    this.ellipse(RX + 0.2, RZ + 0.2, 0.06, this.waterMat);
    this.scenery();

    const shape = new T.Shape();
    shape.moveTo(-1.6, 0);
    shape.quadraticCurveTo(-1.1, -0.8, 1.0, -0.65);
    shape.quadraticCurveTo(1.9, 0, 1.0, 0.65);
    shape.quadraticCurveTo(-1.1, 0.8, -1.6, 0);
    this.hull = new T.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: false });
    this.hull.rotateX(-PI / 2);
    this.deck = new T.ShapeGeometry(shape);
    this.deck.rotateX(-PI / 2);
    this.deck.scale(0.82, 1, 0.78);

    this.arrow = new T.Mesh(new T.ConeGeometry(0.3, 0.6, 3), new T.MeshLambertMaterial({ color: "#facc15", emissive: 0x6b5200 }));
    this.arrow.rotation.x = PI;
    this.scene.add(this.arrow);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas);
    this.resize();
    this.raf = requestAnimationFrame(this.frame);
  }

  private ellipse(rx: number, rz: number, y: number, mat: T.Material) {
    const m = new T.Mesh(new T.CircleGeometry(1, 64), mat);
    m.rotation.x = -PI / 2;
    m.scale.set(rx, rz, 1);
    m.position.y = y;
    this.scene.add(m);
  }

  private scenery() {
    const trunk = lam("#7c4a1e");
    const leaves = [lam("#2f7d32"), lam("#43a047"), lam("#388e3c")];
    for (let i = 0; i < 70; i++) {
      const a = rnd() * PI * 2;
      const r = 1.5 + rnd() * 0.9; // well behind the boats, so no tree stands in front of the camera
      const g = new T.Group();
      const h = 2 + rnd() * 2;
      const tr = new T.Mesh(new T.CylinderGeometry(0.25, 0.35, h, 6), trunk);
      tr.position.y = h / 2;
      g.add(tr);
      const big = 1.6 + rnd() * 1.6;
      const lf = new T.Mesh(rnd() < 0.5 ? new T.IcosahedronGeometry(big, 0) : new T.ConeGeometry(big, big * 2.2, 7), leaves[i % 3]);
      lf.position.y = h + big * 0.7;
      g.add(lf);
      g.position.set(Math.cos(a) * RX * r, 0, Math.sin(a) * RZ * r);
      this.scene.add(g);
    }
    const reedM = lam("#2e6b2a");
    const catM = lam("#7c4a1e");
    for (let i = 0; i < 90; i++) {
      const a = rnd() * PI * 2;
      const r = 1.02 + rnd() * 0.07;
      const g = new T.Group();
      const h = 1 + rnd() * 1.2;
      const s = new T.Mesh(new T.CylinderGeometry(0.04, 0.05, h, 4), reedM);
      s.position.y = h / 2;
      g.add(s);
      const c = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.45, 6), catM);
      c.position.y = h;
      g.add(c);
      g.position.set(Math.cos(a) * RX * r, 0, Math.sin(a) * RZ * r);
      g.userData.ph = rnd() * 6;
      this.scene.add(g);
      this.reeds.push(g);
    }
    const pad = lam("#3f9d4a");
    const flower = lam("#f9a8d4");
    for (let i = 0; i < 30; i++) {
      const a = rnd() * PI * 2;
      const r = 0.12 + rnd() * 0.5;
      const p = new T.Mesh(new T.CircleGeometry(0.6 + rnd() * 0.6, 10, 0, PI * 1.75), pad);
      p.rotation.x = -PI / 2;
      p.rotation.z = rnd() * 6;
      p.position.set(Math.cos(a) * RX * r, 0.14, Math.sin(a) * RZ * r);
      this.scene.add(p);
      if (rnd() < 0.35) {
        const f = new T.Mesh(new T.IcosahedronGeometry(0.22, 0), flower);
        f.position.set(p.position.x, 0.3, p.position.z);
        this.scene.add(f);
      }
    }
    const sm = new T.MeshBasicMaterial({ color: 0x0b3a5a, transparent: true, opacity: 0.25 });
    for (let i = 0; i < 26; i++) {
      const m = new T.Mesh(new T.CircleGeometry(1, 10), sm);
      m.rotation.x = -PI / 2;
      const s = 0.8 + rnd();
      m.scale.set(s * 1.4, s * 0.5, 1);
      m.position.y = 0.12;
      m.userData = { a: rnd() * 6.28, r: 0.1 + rnd() * 0.55, sp: (0.04 + rnd() * 0.07) * (rnd() < 0.5 ? -1 : 1) };
      this.scene.add(m);
      this.shadows.push(m);
    }
  }

  setBoats(list: BoatInfo[], me: string) {
    const key = list.map((b) => `${b.uid}:${b.emoji}:${b.name}`).join("|") + "#" + me;
    if (this.scene.userData.boatsKey === key) return;
    this.scene.userData.boatsKey = key;
    for (const b of this.boats) {
      this.scene.remove(b.g, b.bobber, b.line);
      (b.av.material as T.SpriteMaterial).map?.dispose();
    }
    this.boats = [];
    this.byUid.clear();
    list.forEach((info, i) => {
      const { a, r } = boatSpot(i, list.length);
      const isMe = info.uid === me;
      const pos = new T.Vector3(Math.cos(a) * RX * r, 0.05, Math.sin(a) * RZ * r);
      const bob = new T.Vector3(Math.cos(a) * RX * r * 0.66, 0.2, Math.sin(a) * RZ * r * 0.66);
      const g = new T.Group();
      g.position.copy(pos);
      g.add(new T.Mesh(this.hull, this.mats.hull));
      const deck = new T.Mesh(this.deck, this.mats.deck);
      deck.position.y = 0.56;
      g.add(deck);
      g.rotation.y = Math.atan2(pos.z, -pos.x);
      const av = new T.Sprite(new T.SpriteMaterial({ map: avatarTex(info.emoji, info.color), transparent: true }));
      const s = isMe ? 1.4 : 1.25;
      av.scale.set(s, s, 1);
      av.position.y = 1.4;
      g.add(av);
      const lb = new T.Sprite(new T.SpriteMaterial({ map: labelTex(info.name, info.color) }));
      lb.scale.set(2.4, 0.6, 1);
      lb.position.y = isMe ? 2.45 : 2.3;
      g.add(lb);
      const rod = new T.Mesh(new T.CylinderGeometry(0.03, 0.06, 3.2, 5), this.mats.rod);
      rod.position.set(0.9, 1.6, 0);
      rod.rotation.z = -0.9;
      g.add(rod);
      this.scene.add(g);
      const bobber = new T.Group();
      bobber.add(new T.Mesh(new T.SphereGeometry(0.22, 10, 6, 0, PI * 2, 0, PI / 2), this.mats.red));
      bobber.add(new T.Mesh(new T.SphereGeometry(0.22, 10, 6, 0, PI * 2, PI / 2, PI / 2), this.mats.white));
      bobber.position.copy(bob);
      this.scene.add(bobber);
      const line = new T.Line(new T.BufferGeometry().setFromPoints(Array.from({ length: 12 }, () => new T.Vector3())), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
      this.scene.add(line);
      const b: Boat3 = { info, i, g, pos, bob, bobber, line, av, me: isMe };
      this.boats.push(b);
      this.byUid.set(info.uid, b);
      if (isMe) this.me = b;
    });
    const p = this.pose();
    this.cam.position.copy(p.pos);
    this.camLook.copy(p.look);
    // Reeds on the shore right in front of the camera would hide my boat: leave those out.
    if (this.me) {
      const a = new T.Vector2(p.pos.x, p.pos.z);
      const b = new T.Vector2(this.me.pos.x, this.me.pos.z);
      const ab = b.clone().sub(a);
      for (const r of this.reeds) {
        const q = new T.Vector2(r.position.x, r.position.z);
        const u = Math.max(0, Math.min(1, q.clone().sub(a).dot(ab) / ab.lengthSq()));
        r.visible = q.distanceTo(a.clone().addScaledVector(ab, u)) > 3;
      }
    }
  }

  catchAt(uid: string, kind: LeapKind, delayMs = 0, label?: string, gold?: boolean) {
    const b = this.byUid.get(uid);
    if (!b) return;
    const t0 = performance.now() + delayMs;
    const big = kind !== "fish";
    const f = this.makeFish(kind === "gold" ? "#f5c542" : kind === "big" ? "#0e7490" : ["#94a3b8", "#a3a3a3", "#7dd3fc", "#fca5a5"][Math.floor(Math.random() * 4)], kind === "gold");
    const s = kind === "gold" ? 2.6 : big ? 2.1 : 1.1;
    f.scale.set(s, s, s);
    f.visible = false;
    this.scene.add(f);
    this.actors.push({ type: "fish", f, b, t0, dur: big ? 1700 : 1200, h: big ? 6 : 3.4, hold: big ? 2000 : 600, label, gold });
    this.splash(b.bob, t0, big ? 2 : 1);
    if (kind === "gold")
      for (let i = 0; i < 12; i++) {
        const m = new T.Mesh(new T.OctahedronGeometry(0.2), new T.MeshBasicMaterial({ color: 0xfde047 }));
        m.visible = false;
        this.scene.add(m);
        this.actors.push({ type: "spark", m, b, t0: t0 + 900, i });
      }
  }

  setSnapped(on: boolean) {
    this.snapped = on;
  }
  setFrenzy(on: boolean) {
    this.frenzy = on;
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    for (const a of this.actors) if (a.type === "float") a.el.remove();
    this.scene.traverse((o) => {
      const m = o as T.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as T.Material | T.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose?.();
    });
    this.R.dispose();
  }

  private makeFish(color: string, gold: boolean) {
    const g = new T.Group();
    const m = gold ? new T.MeshStandardMaterial({ color: 0xf5c542, metalness: 0.65, roughness: 0.25, emissive: 0x6b4700, flatShading: true }) : lam(color);
    const body = new T.Mesh(new T.SphereGeometry(0.5, 10, 8), m);
    body.scale.set(1, 0.5, 0.28);
    g.add(body);
    const tail = new T.Mesh(new T.ConeGeometry(0.3, 0.45, 4), m);
    tail.rotation.z = -PI / 2;
    tail.position.x = -0.6;
    tail.scale.set(1, 1, 0.3);
    g.add(tail);
    const fin = new T.Mesh(new T.ConeGeometry(0.14, 0.3, 4), m);
    fin.position.set(0.02, 0.28, 0);
    fin.scale.set(1.4, 1, 0.3);
    g.add(fin);
    for (const s of [-1, 1]) {
      const ey = new T.Mesh(new T.SphereGeometry(0.07, 6, 4), this.mats.white);
      ey.position.set(0.3, 0.07, 0.12 * s);
      g.add(ey);
      const pu = new T.Mesh(new T.SphereGeometry(0.04, 6, 4), lam("#111111"));
      pu.position.set(0.34, 0.07, 0.15 * s);
      g.add(pu);
    }
    g.userData.tail = tail;
    return g;
  }

  private splash(p: T.Vector3, t0: number, s: number) {
    const ring = new T.Mesh(new T.RingGeometry(0.7, 1, 24), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: T.DoubleSide }));
    ring.rotation.x = -PI / 2;
    ring.position.set(p.x, 0.2, p.z);
    this.scene.add(ring);
    this.actors.push({ type: "ring", m: ring, t0, s });
    for (let i = 0; i < 9; i++) {
      const d = new T.Mesh(new T.SphereGeometry(0.12 * s, 5, 4), new T.MeshBasicMaterial({ color: 0xe0f2fe }));
      d.visible = false;
      this.scene.add(d);
      const a = (i / 9) * PI * 2;
      this.actors.push({ type: "drop", m: d, t0, p: p.clone(), vx: Math.cos(a) * (1.5 + Math.random()) * s, vz: Math.sin(a) * (1.5 + Math.random()) * s, vy: (4 + Math.random() * 3) * s });
    }
  }

  private floatAt(world: T.Vector3, text: string, gold?: boolean) {
    const el = document.createElement("div");
    el.className = `fp-float ${gold ? "gold" : ""} ${this.frenzy ? "fr" : ""}`;
    el.textContent = text;
    this.floats.appendChild(el);
    this.actors.push({ type: "float", el, world: world.clone(), t0: performance.now() });
  }

  private remove(o: T.Object3D) {
    this.scene.remove(o);
    const m = o as T.Mesh;
    m.geometry?.dispose?.();
  }

  /**
   * The camera never moves (owner, Nov 2026): fixed behind my boat, close, aimed a little low so the
   * boat sits in the top half of the screen and the question card never covers it.
   */
  private pose() {
    const me = this.me;
    if (!me) return { pos: new T.Vector3(0, 40, 45), look: new T.Vector3() };
    const out = me.pos.clone().setY(0).normalize();
    const side = new T.Vector3(-out.z, 0, out.x);
    return {
      pos: me.pos.clone().addScaledVector(out, CAM_BACK).add(new T.Vector3(0, CAM_UP, 0)).addScaledVector(side, 1.4),
      look: me.pos.clone().addScaledVector(out, CAM_AIM).setY(CAM_LOW),
    };
  }

  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.R.setSize(w, h, false);
    this.cam.aspect = w / h;
    this.cam.updateProjectionMatrix();
  }

  private rodTip(b: Boat3) {
    return b.g.localToWorld(new T.Vector3(0.9 + Math.sin(0.9) * 1.6, 1.6 + Math.cos(0.9) * 1.6, 0));
  }

  private frame = (t: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const time = t - this.started;
    this.waterMat.color.set(this.frenzy ? "#14b8a6" : "#2a8cc8");
    const wp = this.water.geometry.attributes.position as T.BufferAttribute;
    for (let i = 0; i < wp.count; i++) {
      const x = wp.getX(i);
      const y = wp.getY(i);
      wp.setZ(i, this.inside[i] ? Math.sin(x * 0.45 + time / 700) * 0.12 + Math.cos(y * 0.5 + time / 900) * 0.1 : -0.5);
    }
    wp.needsUpdate = true;
    this.water.geometry.computeVertexNormals();
    for (const s of this.shadows) {
      const u = s.userData as { a: number; r: number; sp: number };
      const a = u.a + (time / 1000) * u.sp * (this.frenzy ? 2.5 : 1);
      s.position.x = Math.cos(a) * RX * u.r;
      s.position.z = Math.sin(a) * RZ * u.r;
      s.rotation.z = -a + (u.sp > 0 ? 0 : PI);
    }
    for (const r of this.reeds) r.rotation.z = Math.sin(time / 800 + r.userData.ph) * 0.08;
    for (const b of this.boats) {
      b.g.position.y = 0.05 + Math.sin(time / 600 + b.i) * 0.08;
      b.g.rotation.z = Math.sin(time / 900 + b.i) * 0.04;
      const snapped = b.me && this.snapped;
      b.bobber.position.y = 0.2 + Math.sin(time / 420 + b.i * 2) * 0.08 + (snapped ? -0.6 : 0);
      (b.av.material as T.SpriteMaterial).opacity = snapped ? 0.55 : 1;
      b.line.visible = !snapped;
      if (b.line.visible) {
        const tip = this.rodTip(b);
        const end = b.bobber.position;
        const pts = b.line.geometry.attributes.position as T.BufferAttribute;
        for (let k = 0; k < 12; k++) {
          const u = k / 11;
          pts.setXYZ(k, tip.x + (end.x - tip.x) * u, tip.y + (end.y - tip.y) * u - Math.sin(PI * u) * 0.6, tip.z + (end.z - tip.z) * u);
        }
        pts.needsUpdate = true;
      }
    }
    if (this.me) {
      this.arrow.visible = true;
      this.arrow.position.set(this.me.pos.x, 3.3 + Math.sin(time / 250) * 0.2, this.me.pos.z);
      this.arrow.rotation.y = time / 600;
    } else this.arrow.visible = false;
    this.step(t);
    const p = this.pose();
    this.cam.position.copy(p.pos);
    this.camLook.copy(p.look);
    this.cam.lookAt(this.camLook);
    this.R.render(this.scene, this.cam);
  };

  private step(t: number) {
    for (let k = this.actors.length - 1; k >= 0; k--) {
      const a = this.actors[k];
      const age = t - a.t0;
      if (a.type === "fish") {
        if (age < 0) continue;
        a.f.visible = true;
        const u = clamp(age / a.dur);
        const p = easeOut(u);
        const from = a.b.bob;
        const to = a.b.pos.clone().setY(1.6);
        a.f.position.set(from.x + (to.x - from.x) * p, 0.2 + (to.y - 0.2) * p + Math.sin(PI * p) * a.h + (u >= 1 ? 1.4 + Math.sin(t / 180) * 0.25 : 0), from.z + (to.z - from.z) * p);
        a.f.rotation.y = Math.atan2(-(to.z - from.z), to.x - from.x);
        a.f.rotation.z = u < 1 ? Math.cos(PI * p) * 0.9 : Math.sin(t / 200) * 0.2;
        (a.f.userData.tail as T.Mesh).rotation.y = Math.sin(t / 60) * 0.6;
        if (u >= 1 && a.doneAt === undefined) {
          a.doneAt = t;
          if (a.label) this.floatAt(a.b.pos.clone().setY(4.6), a.label, a.gold);
        }
        if (a.doneAt !== undefined && t - a.doneAt > a.hold) {
          this.scene.remove(a.f);
          this.actors.splice(k, 1);
        }
      } else if (a.type === "spark") {
        if (age < 0) continue;
        a.m.visible = true;
        const ang = t / 300 + a.i * 0.52;
        const r = 2.2 + 0.4 * Math.sin(t / 150 + a.i);
        a.m.position.set(a.b.pos.x + Math.cos(ang) * r, 3 + Math.sin(t / 200 + a.i) * 0.8, a.b.pos.z + Math.sin(ang) * r);
        a.m.rotation.y = t / 200;
        if (age > 3500) {
          this.remove(a.m);
          this.actors.splice(k, 1);
        }
      } else if (a.type === "ring") {
        if (age < 0) continue;
        const u = age / 900;
        if (u > 1) {
          this.remove(a.m);
          this.actors.splice(k, 1);
          continue;
        }
        const sc = (0.6 + u * 2.6) * a.s;
        a.m.scale.set(sc, sc, sc);
        (a.m.material as T.MeshBasicMaterial).opacity = 0.9 * (1 - u);
      } else if (a.type === "drop") {
        if (age < 0) continue;
        const s = age / 1000;
        if (s > 1.1) {
          this.remove(a.m);
          this.actors.splice(k, 1);
          continue;
        }
        a.m.position.set(a.p.x + a.vx * s, 0.2 + a.vy * s - 9.8 * s * s, a.p.z + a.vz * s);
        a.m.visible = a.m.position.y > 0;
      } else if (a.type === "float") {
        const v = a.world.clone().project(this.cam);
        a.el.style.left = `${((v.x + 1) / 2) * 100}%`;
        a.el.style.top = `${((1 - v.y) / 2) * 100}%`;
        if (age > 1900) {
          a.el.remove();
          this.actors.splice(k, 1);
        }
      }
    }
  }
}

/** Can this phone draw 3D? */
export function canDo3D(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export { ease };
