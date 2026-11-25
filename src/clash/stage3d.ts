// Quality Clash in 3D, look A "voxel" (owner, 24 Nov 2026): the arena, the monsters and the Defect Titan are
// drawn by three.js underneath the old 2D canvas, which now only draws the HUD (HP boxes, numbers, messages).
// The 2D drawing code calls this "stage" with the same screen positions it used for its pictures, so every monster
// stands exactly where its 2D picture stood and all the HUD still lines up. Each pixel of a monster's 16-bit
// picture becomes a small block, thicker in the middle so the monster looks rounded.
import * as THREE from "three";
import { sprite } from "./sprites.ts";
import { titan } from "./titan.ts";
import { ELEMENTS, creatureById } from "./creatures.ts";

type Theme = "clash" | "raid";

/** Blocks for one picture: position (in blocks, feet at y = 0), depth and colour of every pixel. */
type VoxelData = { n: number; pos: Float32Array; depth: Float32Array; col: Float32Array };
const voxCache = new Map<string, VoxelData>();

function voxels(key: string, cv: HTMLCanvasElement, feetRow: number): VoxelData {
  const hit = voxCache.get(key);
  if (hit) return hit;
  const N = cv.width;
  const data = cv.getContext("2d")!.getImageData(0, 0, N, N).data;
  const solid = (i: number, j: number) => i >= 0 && j >= 0 && i < N && j < N && data[(j * N + i) * 4 + 3] > 0;
  // distance to the edge: two chamfer passes
  const dist = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (solid(i, j)) dist[j * N + i] = 99;
  const at = (i: number, j: number) => (solid(i, j) ? dist[j * N + i] : 0);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (dist[j * N + i]) dist[j * N + i] = Math.min(dist[j * N + i], at(i - 1, j) + 1, at(i, j - 1) + 1);
  for (let j = N - 1; j >= 0; j--) for (let i = N - 1; i >= 0; i--) if (dist[j * N + i]) dist[j * N + i] = Math.min(dist[j * N + i], at(i + 1, j) + 1, at(i, j + 1) + 1);
  const cells: number[] = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (solid(i, j)) cells.push(j * N + i);
  const pos = new Float32Array(cells.length * 3);
  const depth = new Float32Array(cells.length);
  const col = new Float32Array(cells.length * 3);
  const c = new THREE.Color();
  cells.forEach((k, n) => {
    const i = k % N;
    const j = Math.floor(k / N);
    pos.set([i - (N - 1) / 2, feetRow - j - 0.5, 0], n * 3);
    depth[n] = Math.min(1 + dist[k] * 1.4, 9);
    c.setRGB(data[k * 4] / 255, data[k * 4 + 1] / 255, data[k * 4 + 2] / 255, THREE.SRGBColorSpace);
    col.set([c.r, c.g, c.b], n * 3);
  });
  const v = { n: cells.length, pos, depth, col };
  voxCache.set(key, v);
  return v;
}

const BOX = new THREE.BoxGeometry(1, 1, 1);

type Actor = {
  g: THREE.Group;
  mesh: THREE.InstancedMesh;
  mat: THREE.MeshLambertMaterial;
  shadow: THREE.Mesh;
  src: string;
  vox: VoxelData;
  /** world height of the picture and the point the shots aim at */
  h: number;
  head: THREE.Vector3;
};

/** Options for how a monster looks this frame (all optional). */
export type Look3 = { flash?: boolean; alpha?: number; grey?: number; red?: number; lift?: number };

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export class Stage3D {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private actors = new Map<string, Actor>();
  private used = new Set<string>();
  private plats = new Map<string, THREE.Group>();
  private usedPlats = new Set<string>();
  private pools: Record<string, { items: THREE.Mesh[]; n: number; make: () => THREE.Mesh }> = {};
  private shadowTex: THREE.Texture;
  private ray = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private rage: THREE.PointLight;
  private shakePx = 0;
  private boom: { vel: Float32Array; settled: boolean } | null = null;
  readonly VW: number;
  readonly VH: number;

  constructor(canvas: HTMLCanvasElement, VW: number, VH: number, wallPx: number, theme: Theme) {
    this.VW = VW;
    this.VH = VH;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(canvas.width, canvas.height, false);
    // Camera behind the near side, looking across the arena fairly side-on (so monsters stand up at full height).
    // The horizon sits halfway up the 2D back wall: everything drawn on the floor (below the wall) maps onto it.
    const tall = VH > VW;
    this.camera = new THREE.PerspectiveCamera(tall ? 58 : 35, VW / VH, 0.5, 900);
    const half = (this.camera.fov / 2) * (Math.PI / 180);
    const horizon = wallPx * 0.5;
    const pitch = Math.atan(Math.tan(half) * ((VH / 2 - horizon) / (VH / 2)));
    this.camera.position.set(0, 10, 0);
    this.camera.rotation.set(-pitch, 0, 0, "YXZ");
    this.camera.updateMatrixWorld();
    this.camera.updateProjectionMatrix();
    // Light mostly from the upper left side, so the edges of the blocks catch light and shade (they look solid).
    this.scene.add(new THREE.HemisphereLight(0xe6ecff, theme === "raid" ? 0x4a2440 : 0x2a3150, 1.15));
    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(-12, 9, 4);
    this.scene.add(sun);
    this.rage = new THREE.PointLight(0xff2a3a, 0, 60);
    this.scene.add(this.rage);
    const sc = document.createElement("canvas");
    sc.width = sc.height = 64;
    const sg = sc.getContext("2d")!;
    const grad = sg.createRadialGradient(32, 32, 2, 32, 32, 32);
    grad.addColorStop(0, "rgba(0,0,0,.45)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 64, 64);
    this.shadowTex = new THREE.CanvasTexture(sc);
    this.buildRoom(wallPx, theme);
  }

  /** The floor point under a 2D screen point (virtual coordinates). */
  ground(x: number, y: number): THREE.Vector3 {
    this.ray.setFromCamera(new THREE.Vector2((x / this.VW) * 2 - 1, 1 - (y / this.VH) * 2), this.camera);
    const p = new THREE.Vector3();
    if (!this.ray.ray.intersectPlane(this.plane, p)) p.set(0, 0, -200);
    return p;
  }

  /** World size of one 2D pixel at a point (so things keep their 2D size on screen). */
  px(p: THREE.Vector3): number {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const depth = p.clone().sub(this.camera.position).dot(dir);
    return (2 * depth * Math.tan((this.camera.fov * Math.PI) / 360)) / this.VH;
  }

  private buildRoom(wallPx: number, theme: Theme) {
    const raid = theme === "raid";
    const bg = new THREE.Color(raid ? "#2a1030" : "#1a1840");
    this.scene.background = bg;
    // floor with the same perspective grid as the 2D arena
    const fc = document.createElement("canvas");
    fc.width = fc.height = 256;
    const fg = fc.getContext("2d")!;
    fg.fillStyle = raid ? "#4a4566" : "#46557f";
    fg.fillRect(0, 0, 256, 256);
    fg.strokeStyle = "rgba(255,255,255,.09)";
    fg.lineWidth = 3;
    fg.strokeRect(0, 0, 256, 256);
    const ft = new THREE.CanvasTexture(fc);
    ft.wrapS = ft.wrapT = THREE.RepeatWrapping;
    ft.repeat.set(150, 150);
    ft.colorSpace = THREE.SRGBColorSpace;
    ft.anisotropy = 4;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({ map: ft }));
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
    // back wall where the 2D wall met the floor, with the yellow-and-black hazard strip
    const back = this.ground(this.VW / 2, wallPx);
    const wc = document.createElement("canvas");
    wc.width = 512;
    wc.height = 128;
    const wg = wc.getContext("2d")!;
    const grad = wg.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, raid ? "#2a1030" : "#1a1840");
    grad.addColorStop(1, raid ? "#4a1d3a" : "#2c2a5e");
    wg.fillStyle = grad;
    wg.fillRect(0, 0, 512, 128);
    wg.fillStyle = "rgba(255,255,255,.06)";
    for (let x = 0; x < 512; x += 64) wg.fillRect(x, 40, 3, 80);
    for (let x = -16; x < 512; x += 24) {
      wg.fillStyle = "#ffcf40";
      wg.beginPath();
      wg.moveTo(x, 118);
      wg.lineTo(x + 12, 118);
      wg.lineTo(x + 20, 128);
      wg.lineTo(x + 8, 128);
      wg.fill();
    }
    const wt = new THREE.CanvasTexture(wc);
    wt.wrapS = THREE.RepeatWrapping;
    wt.repeat.set(6, 1);
    wt.colorSpace = THREE.SRGBColorSpace;
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(600, 80), new THREE.MeshBasicMaterial({ map: wt }));
    wt.repeat.set(40, 1);
    wall.position.set(0, 40, back.z);
    this.scene.add(wall);
    // the floor only shows in front of the wall
    floor.position.z = back.z + 300;
    // lights along the top of the wall
    for (let i = -6; i <= 6; i++) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffe9a8 : raid ? 0xff8ac8 : 0x9ad8ff }));
      l.position.set(i * 9, 22, back.z + 0.3);
      this.scene.add(l);
    }
  }

  /** Start a frame. */
  begin() {
    this.used.clear();
    this.usedPlats.clear();
    for (const p of Object.values(this.pools)) p.n = 0;
    this.shakePx = 0;
    this.rage.intensity = 0;
  }

  shake(px: number) {
    this.shakePx = Math.max(this.shakePx, px);
  }

  private actor(key: string, src: string, make: () => HTMLCanvasElement, feetRow: number): Actor {
    let a = this.actors.get(key);
    if (a && a.src !== src) {
      this.scene.remove(a.g);
      a.mesh.dispose();
      a.mat.dispose();
      a = undefined;
    }
    if (!a) {
      const vox = voxels(src, make(), feetRow);
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true });
      const mesh = new THREE.InstancedMesh(BOX, mat, vox.n);
      const m = new THREE.Matrix4();
      const c = new THREE.Color();
      for (let i = 0; i < vox.n; i++) {
        m.makeScale(1, 1, vox.depth[i]).setPosition(vox.pos[i * 3], vox.pos[i * 3 + 1], 0);
        mesh.setMatrixAt(i, m);
        mesh.setColorAt(i, c.setRGB(vox.col[i * 3], vox.col[i * 3 + 1], vox.col[i * 3 + 2]));
      }
      const g = new THREE.Group();
      g.add(mesh);
      const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false }));
      shadow.rotation.x = -Math.PI / 2;
      this.scene.add(shadow);
      this.scene.add(g);
      a = { g, mesh, mat, shadow, src, vox, h: 1, head: new THREE.Vector3() };
      this.actors.set(key, a);
    }
    this.used.add(key);
    return a;
  }

  private placeActor(a: Actor, x: number, feet: number, wPx: number, blocks: number, look: Look3) {
    const p = this.ground(x, feet);
    const unit = this.px(p);
    const h = wPx * unit;
    const s = h / blocks;
    a.h = h;
    a.g.visible = true;
    a.g.position.set(p.x, (look.lift ?? 0) * unit, p.z);
    a.g.scale.setScalar(s);
    // Facing the camera, turned a little towards the middle and swaying gently, so the blocks show their depth.
    const turn = -((x - this.VW / 2) / this.VW) * 1.1 + Math.sin(performance.now() / 1100 + x * 0.05) * (blocks > 40 ? 0.42 : 0.28);
    a.g.rotation.set(0, Math.atan2(this.camera.position.x - p.x, this.camera.position.z - p.z) + turn, 0);
    a.head.set(p.x, a.g.position.y + h * 0.5, p.z);
    a.shadow.visible = (look.alpha ?? 1) > 0.05;
    a.shadow.position.set(p.x, 0.02, p.z);
    a.shadow.scale.set(h * 0.75, h * 0.35, 1);
    const alpha = look.alpha ?? 1;
    a.mat.opacity = alpha;
    a.mat.depthWrite = alpha > 0.95;
    const grey = look.grey ?? 0;
    a.mat.color.setRGB(1 - grey * 0.45, 1 - grey * 0.45, 1 - grey * 0.4);
    if (look.flash) a.mat.emissive.setRGB(1, 1, 1);
    else if (look.red) {
      // a red tint that keeps the light and shade on the blocks (a full red glow made the Titan look flat)
      a.mat.emissive.setRGB(look.red * 0.45, 0, look.red * 0.04);
      a.mat.color.setRGB(1, 1 - look.red * 0.55, 1 - look.red * 0.55);
    }
    else a.mat.emissive.setRGB(0, 0, 0);
  }

  /** A monster: its 2D picture was w px wide, bottom of the feet at (x, feet); `lift` px raises it (hops). */
  monster(key: string, creature: string, back: boolean, x: number, feet: number, w: number, look: Look3 = {}) {
    const a = this.actor(key, `${creature}|${back ? "b" : "f"}`, () => sprite(creature, back), 37);
    this.placeActor(a, x, feet, w, 40, look);
  }

  /**
   * The Defect Titan (64×64 picture, w px wide, feet at the bottom row). `boom` = seconds since it blew apart:
   * its blocks fly out, bounce and settle.
   */
  titan(x: number, feet: number, w: number, look: Look3 & { rage?: boolean; boom?: number; jitter?: number }) {
    const a = this.actor("titan", "titan", () => titan(""), 64);
    this.placeActor(a, x + (look.jitter ?? 0) * (Math.random() - 0.5), feet, w, 64, look);
    if (look.rage) {
      this.rage.position.set(a.g.position.x, a.h * 0.6, a.g.position.z + a.h * 0.4);
      this.rage.intensity = 60 + Math.sin(performance.now() / 160) * 25;
      this.rage.distance = a.h * 3;
    }
    const v = a.vox;
    if (look.boom !== undefined && look.boom >= 0) {
      if (!this.boom) {
        const vel = new Float32Array(v.n * 3);
        for (let i = 0; i < v.n; i++) {
          vel[i * 3] = (seeded(i) - 0.5) * 70 + v.pos[i * 3] * 1.2;
          vel[i * 3 + 1] = 30 + seeded(i + 7) * 80;
          vel[i * 3 + 2] = (seeded(i + 13) - 0.5) * 70 + 20;
        }
        this.boom = { vel, settled: false };
      }
      a.shadow.visible = false;
      // Every block has landed by ~2 s: after one last update nothing moves, so stop recalculating them
      // (doing it every frame behind the results screen made laptops lag).
      if (this.boom.settled) return;
      const t = look.boom;
      if (t > 2.4) this.boom.settled = true;
      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const at = new THREE.Vector3();
      const one = new THREE.Vector3(1, 1, 1);
      const vel = this.boom.vel;
      for (let i = 0; i < v.n; i++) {
        let y = v.pos[i * 3 + 1] + vel[i * 3 + 1] * t - 0.5 * 150 * t * t;
        const settle = y < 0.5;
        if (settle) y = 0.5;
        const k = settle ? Math.min(t, (vel[i * 3 + 1] + Math.sqrt(vel[i * 3 + 1] ** 2 + 300 * Math.max(0, v.pos[i * 3 + 1]))) / 150) : t;
        e.set(vel[i * 3] * k * 0.1, 0, vel[i * 3 + 2] * k * 0.1);
        m.compose(at.set(v.pos[i * 3] + vel[i * 3] * k, y, vel[i * 3 + 2] * k), q.setFromEuler(e), one);
        a.mesh.setMatrixAt(i, m);
      }
      a.mesh.instanceMatrix.needsUpdate = true;
    } else if (this.boom) {
      // a new raid: put the Titan back together
      this.boom = null;
      const m = new THREE.Matrix4();
      for (let i = 0; i < v.n; i++) {
        m.makeScale(1, 1, v.depth[i]).setPosition(v.pos[i * 3], v.pos[i * 3 + 1], 0);
        a.mesh.setMatrixAt(i, m);
      }
      a.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  /** A round platform under a monster (Quality Clash), rx × ry px like the 2D ellipse. */
  platform(key: string, x: number, y: number, rxPx: number, side: "red" | "blue") {
    let g = this.plats.get(key);
    if (!g) {
      g = new THREE.Group();
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.12, 0.22, 40), new THREE.MeshLambertMaterial({ color: 0x1d2340 }));
      rim.position.y = 0.11;
      const top = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.3, 40), new THREE.MeshLambertMaterial({ color: 0xc9d3ea }));
      top.position.y = 0.15;
      const tint = new THREE.Mesh(new THREE.CircleGeometry(0.72, 40), new THREE.MeshLambertMaterial({ color: side === "red" ? 0xff5a5f : 0x4aa8ff, transparent: true, opacity: 0.55 }));
      tint.rotation.x = -Math.PI / 2;
      tint.position.y = 0.31;
      g.add(rim, top, tint);
      this.scene.add(g);
      this.plats.set(key, g);
    }
    const p = this.ground(x, y);
    const r = rxPx * this.px(p);
    g.position.set(p.x, 0, p.z);
    g.scale.set(r, r * 0.6, r);
    g.visible = true;
    this.usedPlats.add(key);
  }

  /** A stomp shock ring on the floor around (x, y), rx px across (like the 2D ellipse). */
  ring(x: number, y: number, rxPx: number, alpha: number) {
    const m = this.take("ring", () => new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 6, 64), new THREE.MeshBasicMaterial({ color: 0xffcf40, transparent: true })));
    const p = this.ground(x, y);
    const r = rxPx * this.px(p);
    m.position.set(p.x, 0.1, p.z);
    m.rotation.set(Math.PI / 2, 0, 0);
    m.scale.set(r, r, r * 1.6);
    (m.material as THREE.MeshBasicMaterial).opacity = alpha;
  }

  /** A shield bubble around an actor. */
  bubble(key: string, alpha: number) {
    const a = this.actors.get(key);
    if (!a) return;
    const m = this.take("bubble", () => new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x7ae0ff, transparent: true, wireframe: true })));
    m.position.copy(a.head);
    m.scale.setScalar(a.h * 0.62);
    m.rotation.y = performance.now() / 1500;
    (m.material as THREE.MeshBasicMaterial).opacity = alpha;
  }

  private take(kind: string, make: () => THREE.Mesh): THREE.Mesh {
    let p = this.pools[kind];
    if (!p) p = this.pools[kind] = { items: [], n: 0, make };
    let m = p.items[p.n];
    if (!m) {
      m = make();
      this.scene.add(m);
      p.items.push(m);
    }
    p.n++;
    m.visible = true;
    return m;
  }

  private cube(at: THREE.Vector3, size: number, colour: string, spin = 0) {
    const m = this.take("cube", () => new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ transparent: true })));
    m.position.copy(at);
    m.scale.setScalar(size);
    m.rotation.set(spin, spin * 0.7, 0);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.color.set(colour);
    mat.opacity = 1;
    return m;
  }

  /**
   * An attack flying from one actor to another: u = 0 → 1 over the flight (past 1: the impact burst).
   * big = 2 for a SUPER move. seed varies the jitter per event.
   */
  shot(from: string, to: string, type: string, u: number, big: number, seed: number) {
    const A = this.actors.get(from);
    const B = this.actors.get(to);
    if (!A || !B || !this.used.has(from) || !this.used.has(to) || u < 0 || u > 1.4) return;
    const a = A.head.clone();
    const b = B.head.clone();
    const unit = this.px(b);
    const L = (k: number) => a.clone().lerp(b, k);
    const T = ELEMENTS[type as keyof typeof ELEMENTS] ?? ELEMENTS.fire;
    const t = performance.now() / 1000;
    const dist = a.distanceTo(b);
    if (u <= 1) {
      if (type === "elec") {
        const k = Math.min(1, u * 1.4);
        const end = L(k);
        let prev = a.clone();
        for (let i = 1; i <= 8; i++) {
          const q = i / 8;
          const p = a.clone().lerp(end, q);
          if (i < 8) p.add(new THREE.Vector3(Math.sin(Math.floor(t * 24) * 13.1 + i * 7.7 + seed), Math.cos(i * 5.3 + seed), 0).multiplyScalar(14 * big * unit));
          const seg = this.take("bolt", () => new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0xffd84a })));
          seg.position.copy(prev).lerp(p, 0.5);
          seg.scale.set(6 * big * unit, 6 * big * unit, prev.distanceTo(p));
          seg.lookAt(p);
          const core = this.take("boltCore", () => new THREE.Mesh(BOX, new THREE.MeshBasicMaterial({ color: 0xffffff })));
          core.position.copy(seg.position);
          core.scale.set(2.4 * big * unit, 2.4 * big * unit, prev.distanceTo(p));
          core.lookAt(p);
          prev = p;
        }
      } else if (type === "wind") {
        for (let i = 0; i < 3; i++) {
          const k = u - i * 0.12;
          if (k < 0 || k > 1) continue;
          const m = this.take("ring2", () => new THREE.Mesh(new THREE.TorusGeometry(1, 0.22, 6, 20), new THREE.MeshBasicMaterial({ transparent: true })));
          m.position.copy(L(k));
          m.scale.setScalar(16 * big * unit);
          m.rotation.set(t * 3, t * 14 + i, 0);
          (m.material as THREE.MeshBasicMaterial).color.set(i % 2 ? "#ffffff" : T.ui);
          (m.material as THREE.MeshBasicMaterial).opacity = 0.95;
        }
      } else {
        const cols = type === "fire" ? ["#ffe066", "#ffb347", "#e8552d"] : type === "water" ? [T.a, T.l, "#e8fbff"] : ["#8f97a3", "#a8805a", "#6b4f35"];
        const n = type === "fire" ? 14 : type === "water" ? 6 : 5;
        for (let i = 0; i < n; i++) {
          const k = u - i * (type === "fire" ? 0.035 : 0.08);
          if (k < 0 || k > 1) continue;
          const p = L(k);
          const arc = type === "water" ? 0.35 : type === "earth" ? 0.55 : 0.08;
          p.y += Math.sin(k * Math.PI) * dist * arc;
          if (type === "fire") p.add(new THREE.Vector3(Math.sin(i * 7 + t * 30 + seed), Math.cos(i * 5 + t * 26), 0).multiplyScalar(6 * big * unit));
          const size = (type === "fire" ? 14 - i * 0.6 : type === "earth" ? 16 - i : 13 - i) * big * unit;
          this.cube(p, size, cols[i % 3], type === "earth" ? t * 8 + i : t * 4);
        }
      }
    } else {
      // impact: a burst of blocks in the attack's colours
      const k = (u - 1) / 0.4;
      const cols = type === "fire" ? ["#ffe066", "#ff7a1a"] : type === "water" ? [T.l, T.a] : type === "wind" ? ["#ffffff", T.ui] : type === "elec" ? ["#ffffff", "#ffd84a"] : ["#a8805a", "#8f97a3"];
      for (let i = 0; i < 10; i++) {
        const dir = new THREE.Vector3(seeded(seed + i) - 0.5, seeded(seed + i + 50) * 0.9 + 0.1, seeded(seed + i + 90) - 0.5).normalize();
        const m = this.cube(b.clone().addScaledVector(dir, k * 40 * big * unit), (9 - k * 6) * big * unit, cols[i % 2], k * 6 + i);
        (m.material as THREE.MeshBasicMaterial).opacity = 1 - k;
      }
    }
  }

  /** Finish the frame: hide anything not drawn this frame, shake the camera, render. */
  end() {
    for (const [k, a] of this.actors)
      if (!this.used.has(k)) {
        a.g.visible = false;
        a.shadow.visible = false;
      }
    for (const [k, g] of this.plats) if (!this.usedPlats.has(k)) g.visible = false;
    for (const p of Object.values(this.pools)) for (let i = p.n; i < p.items.length; i++) p.items[i].visible = false;
    const base = this.camera.position.clone();
    if (this.shakePx) {
      const u = this.px(this.ground(this.VW / 2, this.VH / 2)) * this.shakePx;
      this.camera.position.x += (Math.random() - 0.5) * u * 2;
      this.camera.position.y += (Math.random() - 0.5) * u * 2;
    }
    this.renderer.render(this.scene, this.camera);
    this.camera.position.copy(base);
  }

  dispose() {
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry && m.geometry !== BOX) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
        (x as THREE.MeshBasicMaterial).map?.dispose();
        x.dispose();
      });
    });
    this.renderer.dispose();
    // Give the browser its 3D drawing surface back now (it only allows a few at once, and each new game makes one).
    this.renderer.forceContextLoss();
  }
}

/** Can this browser draw 3D at all? */
export function webgl3dOK(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** The monster type of a creature id (for shots). */
export const typeOf = (c: string) => creatureById(c).type;
