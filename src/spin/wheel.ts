// The Quality Spin wheel, drawn on a canvas (projector, lobby preview, phone). Gold rim with lights, 12
// coloured sections, a gold "Q" hub. The pointer sits at the top; `rot` is the wheel's turn in radians.
import { WHEEL, SEG_ANGLE } from "./rules.ts";

const DISP = '"Orbitron", "Arial Black", system-ui, sans-serif';

export function drawWheel(c: CanvasRenderingContext2D, cx: number, cy: number, R: number, rot: number, t = 0, glow = 0) {
  c.save();
  c.translate(cx, cy);
  // Rim with lights (they chase while the wheel turns).
  if (glow > 0) {
    c.shadowColor = `rgba(255, 213, 74, ${0.6 * glow})`;
    c.shadowBlur = R * 0.18;
  }
  c.beginPath();
  c.arc(0, 0, R, 0, Math.PI * 2);
  c.fillStyle = "#f5c542";
  c.fill();
  c.shadowBlur = 0;
  const lights = 24;
  for (let i = 0; i < lights; i++) {
    const a = (i / lights) * Math.PI * 2;
    const on = (i + Math.floor(t * 8)) % 2 === 0;
    c.beginPath();
    c.arc(Math.cos(a) * R * 0.955, Math.sin(a) * R * 0.955, R * 0.022, 0, Math.PI * 2);
    c.fillStyle = on ? "#fff8d6" : "#b9811c";
    c.fill();
  }
  c.rotate(rot);
  const r = R * 0.9;
  WHEEL.forEach((s, k) => {
    const a0 = -Math.PI / 2 + k * SEG_ANGLE - SEG_ANGLE / 2;
    c.beginPath();
    c.moveTo(0, 0);
    c.arc(0, 0, r, a0, a0 + SEG_ANGLE);
    c.closePath();
    c.fillStyle = s.c;
    c.fill();
    c.strokeStyle = "rgba(255,255,255,0.85)";
    c.lineWidth = Math.max(1, R * 0.008);
    c.stroke();
    c.save();
    c.rotate(a0 + SEG_ANGLE / 2);
    c.textAlign = "right";
    c.textBaseline = "middle";
    c.fillStyle = "#fff";
    c.shadowColor = "rgba(0,0,0,0.5)";
    c.shadowBlur = R * 0.02;
    const long = s.t.length > 5;
    c.font = `900 ${R * (long ? 0.075 : 0.12)}px ${DISP}`;
    c.fillText(s.t, r - R * 0.06, 0);
    c.restore();
  });
  c.rotate(-rot);
  // Hub.
  const g = c.createRadialGradient(-R * 0.05, -R * 0.05, R * 0.02, 0, 0, R * 0.24);
  g.addColorStop(0, "#fff6c4");
  g.addColorStop(0.6, "#f5c542");
  g.addColorStop(1, "#8a5a0c");
  c.beginPath();
  c.arc(0, 0, R * 0.2, 0, Math.PI * 2);
  c.fillStyle = g;
  c.fill();
  c.lineWidth = R * 0.016;
  c.strokeStyle = "#6b4708";
  c.stroke();
  c.fillStyle = "#3a2400";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `900 ${R * 0.13}px ${DISP}`;
  c.fillText("Q", 0, R * 0.01);
  // Pointer at the top.
  c.beginPath();
  c.moveTo(-R * 0.09, -R * 1.06);
  c.lineTo(R * 0.09, -R * 1.06);
  c.lineTo(0, -R * 0.84);
  c.closePath();
  c.fillStyle = "#f5c542";
  c.shadowColor = "rgba(0,0,0,0.6)";
  c.shadowBlur = R * 0.03;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = "#6b4708";
  c.lineWidth = R * 0.01;
  c.stroke();
  c.restore();
}
