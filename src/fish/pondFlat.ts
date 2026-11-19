// Fallback for phones that cannot draw 3D: the projector's cartoon pond, zoomed on your own boat.
import type { BoatInfo, LeapKind, PondApi } from "./pondApi.ts";
import { CX, CY, PH, PW, clamp, drawBoat, drawPond, floatText, layoutBoats, leapingFish, outlined, splash, star, type Boat } from "./pond2d.ts";

type Leap = { b: Boat; kind: LeapKind; at: number; label?: string; gold?: boolean };

export class PondFlat implements PondApi {
  private boats: Boat[] = [];
  private me: Boat | null = null;
  private leaps: Leap[] = [];
  private snapped = false;
  private frenzy = false;
  private card = true;
  private shift = 1;
  private closer = false;
  private zoom = 1.6;
  private raf = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.raf = requestAnimationFrame(this.frame);
  }

  setBoats(list: BoatInfo[], me: string) {
    this.boats = layoutBoats(list);
    this.me = this.boats.find((b) => b.uid === me) ?? null;
  }
  catchAt(uid: string, kind: LeapKind, delayMs = 0, label?: string, gold?: boolean) {
    const b = this.boats.find((x) => x.uid === uid);
    if (b) this.leaps.push({ b, kind, at: performance.now() + delayMs, label, gold });
  }
  setSnapped(on: boolean) {
    this.snapped = on;
  }
  setFrenzy(on: boolean) {
    this.frenzy = on;
  }
  setCard(shown: boolean) {
    this.card = shown;
  }
  setCloser(on: boolean) {
    this.closer = on;
  }
  dispose() {
    cancelAnimationFrame(this.raf);
  }

  private frame = (t: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const cv = this.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(cv.clientWidth * dpr);
    const H = Math.round(cv.clientHeight * dpr);
    if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) {
      cv.width = W;
      cv.height = H;
    }
    const c = cv.getContext("2d")!;
    this.shift += ((this.card ? 1 : 0) - this.shift) * 0.1;
    this.zoom += ((this.closer ? 2.3 : 1.6) - this.zoom) * 0.08;
    const k = (W / 720) * this.zoom;
    const fx = this.me ? this.me.x + (CX - this.me.x) * 0.25 : CX;
    const fy = this.me ? this.me.y + (CY - this.me.y) * 0.25 : CY;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.translate(W / 2, H * (0.5 - 0.22 * this.shift));
    c.scale(k, k);
    c.translate(-clamp(fx, 0, PW), -clamp(fy, 0, PH));
    drawPond(c, t, this.frenzy);
    const many = this.boats.length > 24;
    for (const b of this.boats) drawBoat(c, b, t, { snapped: b === this.me && this.snapped ? 0.0001 : 0, tags: !many || b === this.me, scale: b === this.me ? 1.2 : many ? 0.8 : 1 });
    if (this.me) {
      const ay = this.me.y - 70 + Math.sin(t / 250) * 6;
      c.fillStyle = "#facc15";
      c.strokeStyle = "#3a2a00";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(this.me.x, ay + 16);
      c.lineTo(this.me.x - 14, ay - 4);
      c.lineTo(this.me.x + 14, ay - 4);
      c.closePath();
      c.fill();
      c.stroke();
      outlined(c, "YOU", this.me.x, ay - 20, 22, "#3a2a00", 800, 6);
    }
    this.leaps = this.leaps.filter((l) => t - l.at < 3_200);
    for (const l of this.leaps) {
      const age = t - l.at;
      if (age < 0) continue;
      splash(c, l.b.bx, l.b.by, age / 800, l.kind === "fish" ? 1 : 2);
      if (age < 1400) leapingFish(c, l.b, age / 1200, t, l.kind);
      if (l.kind === "gold") for (let i = 0; i < 8; i++) star(c, l.b.x + Math.cos(t / 300 + i * 0.8) * 64, l.b.y - 30 + Math.sin(t / 300 + i * 0.8) * 44, 8);
      if (l.label) floatText(c, l.label, l.b.x, l.b.y - 70, (age - 1200) / 1800, l.gold ? "#b45309" : this.frenzy ? "#7c3aed" : "#0369a1", 34);
    }
  };
}
