// Draws a Boss Raid frame: "wide" for the projector (16:9), "tall" for phones (9:16, from one player's view).
import type { Game, Player } from "../lib/types.ts";
import { ELEMENTS, creatureById } from "./creatures.ts";
import { sprite } from "./sprites.ts";
import { titan } from "./titan.ts";
import { STOMP_WARN_MS, raiderState, type Raider } from "./boss.ts";
import type { RaidBoard, RaidEvent } from "./bossEngine.ts";

type Ctx = CanvasRenderingContext2D;
/** Seconds from the answer to the hit landing on the Titan. */
const HIT = 0.7;
const PX = '"Press Start 2P", ui-monospace, monospace';
const BODY = '"Figtree", system-ui, sans-serif';

function setFont(c: Ctx, size: number, font: string) {
  const m = font.match(/^(\d+)\s+(.*)$/);
  c.font = m ? `${m[1]} ${size}px ${m[2]}` : `${size}px ${font}`;
}
function txt(c: Ctx, s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "left", font = PX, shadow = false) {
  setFont(c, size, font);
  c.textAlign = align;
  if (shadow) {
    c.fillStyle = "#000";
    c.fillText(s, x + 2, y + 2);
  }
  c.fillStyle = color;
  c.fillText(s, x, y);
}
function fit(c: Ctx, s: string, max: number, size: number, min: number, font = PX) {
  let fs = size;
  setFont(c, fs, font);
  while (fs > min && c.measureText(s).width > max) {
    fs -= 0.5;
    setFont(c, fs, font);
  }
  return fs;
}
function rr(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const hpCol = (f: number) => (f > 0.5 ? "#4ade80" : f > 0.2 ? "#facc15" : "#ef4444");
const name = (players: Record<string, Player>, uid: string) => players[uid]?.name ?? "Player";

/** What the frame shows right now, with HP still to drop for hits in flight. */
type View = {
  titanHp: number;
  titanSh: number;
  rageAge: number;
  titanFlash: boolean;
  hp: Record<string, number>;
  flash: Record<string, boolean>;
  hop: Record<string, number>;
  down: Record<string, boolean>;
  warn: number;
  counter: boolean;
  shake: number;
  stompAge: number;
  revived: Record<string, number>;
  pops: { at: "titan" | string; text: string; age: number; col: string; big: boolean }[];
  shots: { uid: string; age: number; sup: boolean }[];
  msg: [string, string];
  /** Stunned raiders: true = ran out of time, false = answered wrong (from the latest "wrong" event). */
  wrongTimeout: Record<string, boolean>;
};

function view(r: RaidBoard, events: RaidEvent[], players: Record<string, Player>, game: Game, now: number): View {
  const V: View = {
    titanHp: r.titan.hp,
    titanSh: r.titan.sh,
    rageAge: -1,
    titanFlash: false,
    hp: {},
    flash: {},
    hop: {},
    down: {},
    warn: -1,
    counter: false,
    shake: 0,
    stompAge: -1,
    revived: {},
    pops: [],
    shots: [],
    wrongTimeout: {},
    msg: r.mode === "hs" ? ["Answer fast! Every right answer hits the Titan.", "Jawab cepat! Setiap jawapan betul menyerang Titan."] : ["Beat the Titan as fast as you can!", "Kalahkan Titan secepat mungkin!"],
  };
  for (const x of Object.values(r.raiders)) {
    V.hp[x.uid] = x.hp;
    V.down[x.uid] = raiderState(x) !== "alive";
  }
  const t = now / 1000;
  let msgAt = -Infinity;
  const say = (at: number, en: string, ms: string) => {
    if (at >= msgAt) {
      msgAt = at;
      V.msg = [en, ms];
    }
  };
  for (const e of events) {
    const age = t - e.at / 1000;
    if (age < 0 || age > 4) continue;
    if (e.kind === "atk") {
      const k = clamp01((age - HIT) / 0.4);
      const blk = e.blk ?? 0;
      V.titanHp += (e.dmg - blk) * (1 - k);
      V.titanSh += blk * (1 - k);
      if (age < HIT + 0.2) V.shots.push({ uid: e.uid, age, sup: e.sup });
      if (age < 0.3) V.hop[e.uid] = Math.sin((age / 0.3) * Math.PI);
      if (age >= HIT && age < HIT + 0.3) V.titanFlash = Math.floor((age - HIT) * 14) % 2 === 0;
      if (age >= HIT && age < HIT + 1.1) V.pops.push({ at: "titan", text: `-${e.dmg}`, age: age - HIT, col: "#fff", big: e.sup });
      if (age < 1.6) {
        const c = creatureById(r.raiders[e.uid]?.c);
        if (e.sup) say(e.at, `SUPER MOVE! ${name(players, e.uid)} hits for ${e.dmg}!`, `Gerakan super! ${e.dmg} kerosakan!`);
        else say(e.at, `${name(players, e.uid)}'s ${c.en} used ${c.move.en}!`, `${c.ms} guna ${c.move.ms}!`);
      }
      if ((e.blk ?? 0) > 0 && age > HIT && age < 1.8) say(e.at + 1, `The shield blocked ${e.blk}! Keep hitting to break it.`, `Perisai menahan ${e.blk}! Terus serang.`);
    } else if (e.kind === "rage") {
      if (age >= 0) {
        V.titanSh -= e.sh * (1 - clamp01(age / 0.5));
        if (age < 2.4) V.rageAge = age;
        if (age < 0.5) V.shake = Math.max(V.shake, (1 - age / 0.5) * 7);
        if (age < 3) say(e.at, `ENRAGED! The Titan raises a ${e.sh} shield and stomps harder!`, `MENGAMUK! Titan dapat perisai ${e.sh} dan menghentak lebih kuat!`);
      }
    } else if (e.kind === "wrong") {
      V.wrongTimeout[e.uid] = e.timeout;
      if (age < 1.6) say(e.at, `${name(players, e.uid)} ${e.timeout ? "ran out of time" : "answered wrong"}. Stunned!`, `${name(players, e.uid)} ${e.timeout ? "kehabisan masa" : "salah"}. Pening!`);
    } else if (e.kind === "stomp") {
      if (age < 1.5) V.stompAge = age;
      if (age < 0.5) V.shake = (1 - age / 0.5) * 9;
      const k = clamp01(age / 0.4);
      for (const u of e.hit) {
        if (V.hp[u] !== undefined) V.hp[u] = Math.min(r.raiders[u].max, V.hp[u] + e.dmg * (1 - k));
        if (age < 0.4) V.flash[u] = Math.floor(age * 14) % 2 === 0;
        if (age < 1.1) V.pops.push({ at: u, text: `-${e.dmg}`, age, col: "#ff8a8a", big: false });
      }
      for (const u of e.fainted) if (age < 0.5) V.down[u] = false;
      if (age < 1.8)
        if (e.counter) say(e.at, `COUNTER-STOMP! The Titan strikes back: ${e.dmg} to everyone.`, `SERANG BALAS! Semua raksasa terkena ${e.dmg}.`);
        else say(e.at, `STOMP! Every monster takes ${e.dmg} damage.`, `HENTAKAN! Semua raksasa terkena ${e.dmg}.`);
      if (e.fainted.length && age > 0.6 && age < 3.5) {
        const who = e.fainted.map((u) => name(players, u)).join(", ");
        say(e.at + 1, `${who} fainted! Revive question sent.`, "Pengsan! Soalan hidup semula dihantar.");
      }
    } else if (e.kind === "revive") {
      if (e.ok && age < 1.5) V.revived[e.uid] = age;
      if (age < 1.8) say(e.at, e.ok ? `${name(players, e.uid)} answered right: REVIVED with half HP!` : `${name(players, e.uid)} missed the revive. Out of the raid.`, e.ok ? "Betul: hidup semula dengan separuh HP!" : "Salah: keluar daripada serangan.");
    }
  }
  if (game.status === "playing" && !game.paused && !r.winner && game.goAt && now >= game.goAt) {
    const left = r.nextStomp - now;
    if (left > 0 && left <= STOMP_WARN_MS) {
      V.warn = left / 1000;
      if (now - msgAt > 1200) V.msg = ["The Titan is about to STOMP!", "Titan akan menghentak!"];
    }
  }
  if (!r.winner && (r.counters ?? 0) > 0 && r.counterAt && now < r.counterAt && game.status === "playing") {
    V.counter = true;
    if (now - msgAt > 900) V.msg = ["The Titan strikes back!", "Titan menyerang balas!"];
  }
  if (r.winner === "players") V.msg = ["DEFECT TITAN DEFEATED!", "Gergasi Kecacatan tumpas!"];
  else if (r.winner === "titan") V.msg = ["The Defect Titan wins this time!", "Gergasi Kecacatan menang kali ini!"];
  V.titanHp = Math.min(r.titan.max, Math.max(0, V.titanHp));
  V.titanSh = Math.max(0, V.titanSh);
  return V;
}

function floor(c: Ctx, W: number, H: number, wall: number) {
  const g = c.createLinearGradient(0, 0, 0, wall);
  g.addColorStop(0, "#2a1030");
  g.addColorStop(1, "#4a1d3a");
  c.fillStyle = g;
  c.fillRect(0, 0, W, wall);
  c.fillStyle = "rgba(255,255,255,.05)";
  for (let x = 0; x < W; x += 80) c.fillRect(x, wall - 90, 2, 90);
  for (let x = -20; x < W; x += 24) {
    c.fillStyle = "#ffcf40";
    c.beginPath();
    c.moveTo(x, wall - 10);
    c.lineTo(x + 12, wall - 10);
    c.lineTo(x + 20, wall);
    c.lineTo(x + 8, wall);
    c.fill();
  }
  const fg = c.createLinearGradient(0, wall, 0, H);
  fg.addColorStop(0, "#3a3550");
  fg.addColorStop(1, "#5d5a7c");
  c.fillStyle = fg;
  c.fillRect(0, wall, W, H - wall);
  c.strokeStyle = "rgba(255,255,255,.07)";
  c.lineWidth = 2;
  for (let i = -14; i <= 14; i++) {
    c.beginPath();
    c.moveTo(W / 2 + i * 40, wall);
    c.lineTo(W / 2 + i * 160, H);
    c.stroke();
  }
  let y = wall;
  let step = 10;
  while (y < H) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(W, y);
    c.stroke();
    y += step;
    step *= 1.25;
  }
}

function drawTitan(c: Ctx, V: View, r: RaidBoard, cx: number, feet: number, scale: number, t: number, endAge: number) {
  const w = 64 * scale;
  let y = feet - 63 * scale;
  if (V.warn >= 0) y -= (1 - V.warn / 3) * 14;
  if (V.counter) y -= 10;
  if (r.winner === "players") {
    c.globalAlpha = Math.max(0, 1 - endAge / 1.6);
    y += Math.min(endAge, 2) * 30;
  }
  y += Math.sin(t * 2) * 2;
  c.fillStyle = "#2a2440";
  c.beginPath();
  c.ellipse(cx, feet, w * 0.7, w * 0.14, 0, 0, 7);
  c.fill();
  const raging = r.titan.rage && r.winner !== "players";
  if (raging) {
    const g = c.createRadialGradient(cx, y + w * 0.5, w * 0.1, cx, y + w * 0.5, w * 0.75);
    g.addColorStop(0, `rgba(255,40,60,${0.35 + 0.15 * Math.sin(t * 5)})`);
    g.addColorStop(1, "rgba(255,40,60,0)");
    c.fillStyle = g;
    c.fillRect(cx - w, y - w * 0.3, w * 2, w * 1.6);
  }
  c.imageSmoothingEnabled = false;
  const blink = V.warn >= 0 && Math.floor(t * 6) % 2 === 0;
  const mode = V.titanFlash || (r.winner === "players" && Math.floor(endAge * 10) % 2 === 0) ? "white" : raging ? (blink ? "" : "red") : blink ? "red" : "";
  c.drawImage(titan(mode), cx - w / 2, y, w, w);
  c.globalAlpha = 1;
  if (V.titanSh > 0.5 && r.winner !== "players") {
    c.save();
    c.globalAlpha = 0.35 + 0.15 * Math.sin(t * 6);
    c.strokeStyle = "#7ae0ff";
    c.lineWidth = 5;
    c.fillStyle = "rgba(122,224,255,.10)";
    c.beginPath();
    c.ellipse(cx, y + w * 0.52, w * 0.58, w * 0.56, 0, 0, 7);
    c.fill();
    c.stroke();
    c.restore();
  }
  if (V.stompAge >= 0)
    for (let k = 0; k < 3; k++) {
      const a = V.stompAge - k * 0.15;
      if (a < 0) continue;
      c.strokeStyle = `rgba(255,207,64,${Math.max(0, 1 - a / 1.2)})`;
      c.lineWidth = 6;
      c.beginPath();
      c.ellipse(cx, feet, 60 + a * 520, 14 + a * 120, 0, 0, 7);
      c.stroke();
    }
}

function shot(c: Ctx, from: [number, number], to: [number, number], type: string, age: number, big: number, t: number) {
  const u = (age - 0.1) / 0.6;
  if (u < 0 || u > 1.05) return;
  const [ax, ay] = from;
  const [bx, by] = to;
  const T = ELEMENTS[type as keyof typeof ELEMENTS] ?? ELEMENTS.fire;
  const L = (k: number): [number, number] => [ax + (bx - ax) * k, ay + (by - ay) * k];
  if (type === "elec") {
    const [ex, ey] = L(Math.min(1, u * 1.4));
    const seed = Math.floor(t * 24);
    for (const [lw, col] of [[7 * big, "#ffd84a"], [2.5 * big, "#ffffff"]] as [number, string][]) {
      c.strokeStyle = col;
      c.lineWidth = lw;
      c.beginPath();
      c.moveTo(ax, ay);
      for (let i = 1; i < 8; i++) {
        const q = i / 8;
        c.lineTo(ax + (ex - ax) * q + Math.sin(seed * 13.1 + i * 7.7) * 14 * big, ay + (ey - ay) * q);
      }
      c.lineTo(ex, ey);
      c.stroke();
    }
    return;
  }
  const cols = type === "fire" ? ["#ffe066", "#ffb347", "#e8552d"] : type === "water" ? [T.a, T.l, T.a] : type === "wind" ? ["#fff", T.ui, "#fff"] : ["#8f97a3", "#a8805a", "#8f97a3"];
  for (let i = 0; i < 10; i++) {
    const k = u - i * 0.05;
    if (k < 0 || k > 1) continue;
    const [x, y] = L(k);
    const j = Math.sin(i * 7 + t * 30) * 6 * big;
    const sz = (11 - i * 0.6) * big;
    c.fillStyle = cols[i % 3];
    c.fillRect(x + j - sz / 2, y - sz / 2, sz, sz);
  }
}

function raider(c: Ctx, V: View, x: Raider, px: number, feet: number, scale: number, t: number, stunned: boolean, players: Record<string, Player>, opts: { me?: boolean; label?: boolean }) {
  const w = 40 * scale;
  const dead = V.down[x.uid];
  let y = feet - 37 * scale - (V.hop[x.uid] ?? 0) * 10 + Math.sin(t * 3 + x.slot) * 1;
  c.fillStyle = "rgba(0,0,0,.25)";
  c.beginPath();
  c.ellipse(px, feet, w * 0.3, w * 0.07, 0, 0, 7);
  c.fill();
  c.save();
  c.imageSmoothingEnabled = false;
  // Owner: a fainted (or out) monster loses its colour; a stunned one keeps it (the red circle shows the stun).
  if (dead) {
    c.globalAlpha = 0.6;
    c.filter = "grayscale(1) brightness(0.8)";
    y += 4 * scale;
  }
  c.drawImage(sprite(x.c, true, V.flash[x.uid] ? "white" : ""), px - w / 2, y, w, w);
  c.restore();
  if (dead) txt(c, "💫", px, y + 6 * scale, 9 * scale, "#fff", "center", BODY);
  if (stunned && !dead)
    for (let k = 0; k < 3; k++) {
      const a = t * 5 + k * 2.1;
      c.fillStyle = "#ffcf40";
      c.fillRect(px + Math.cos(a) * w * 0.25 - 3, y + 6 + Math.sin(a) * 4 - 3, 6, 6);
    }
  const rv = V.revived[x.uid];
  if (rv !== undefined) {
    c.strokeStyle = `rgba(122,255,170,${1 - rv / 1.5})`;
    c.lineWidth = 4;
    c.beginPath();
    c.arc(px, y + w / 2, 14 + rv * 40, 0, 7);
    c.stroke();
    txt(c, "REVIVED!", px, y - 6 - rv * 14, Math.max(8, 5 * scale), "#7affaa", "center", PX, true);
  }
  if (opts.me) {
    const ay = y - 6 + Math.sin(t * 5) * 3;
    c.fillStyle = "#ffcf40";
    c.beginPath();
    c.moveTo(px - 9, ay - 12);
    c.lineTo(px + 9, ay - 12);
    c.lineTo(px, ay);
    c.fill();
    txt(c, "YOU", px, ay - 16, 10, "#ffcf40", "center", PX, true);
  }
  if (opts.label) {
    const bw = Math.max(44, w * 0.8);
    const nm = name(players, x.uid);
    txt(c, nm, px, feet + 15, fit(c, nm, bw + 18, 6 * scale + 3, 9, `700 ${BODY}`), "#fff", "center", `700 ${BODY}`, true);
    c.fillStyle = "#1b1530";
    c.fillRect(px - bw / 2 - 2, feet + 20, bw + 4, 9);
    const f = (V.hp[x.uid] ?? 0) / x.max;
    c.fillStyle = "#3a3560";
    c.fillRect(px - bw / 2, feet + 22, bw, 5);
    c.fillStyle = hpCol(f);
    c.fillRect(px - bw / 2, feet + 22, bw * f, 5);
  }
}

function titanBar(c: Ctx, V: View, r: RaidBoard, x: number, y: number, w: number, fz: number) {
  rr(c, x, y, w, 46 * fz, 8);
  c.fillStyle = "rgba(16,10,30,.92)";
  c.fill();
  c.strokeStyle = "#ff5a5f";
  c.lineWidth = 3;
  c.stroke();
  txt(c, "DEFECT TITAN", x + 12, y + 18 * fz, 10 * fz, "#ff8a8a");
  if (r.titan.rage && r.winner !== "players") txt(c, "ENRAGED", x + 12 + 130 * fz, y + 18 * fz, 9 * fz, Math.floor(Date.now() / 300) % 2 ? "#ff3b3b" : "#ffcf40");
  else txt(c, "Gergasi Kecacatan", x + 12 + 130 * fz, y + 18 * fz, 12 * fz, "#cfc8f0", "left", `600 ${BODY}`);
  const shTxt = V.titanSh > 0.5 ? `  🛡${Math.ceil(V.titanSh)}` : "";
  txt(c, `${Math.ceil(V.titanHp).toLocaleString()} / ${r.titan.max.toLocaleString()}${shTxt}`, x + w - 12, y + 18 * fz, 9 * fz, "#fff", "right");
  const bx = x + 12;
  const bw = w - 24;
  const by = y + 26 * fz;
  c.fillStyle = "#1b1530";
  c.fillRect(bx - 2, by - 2, bw + 4, 14 * fz + 4);
  c.fillStyle = "#3a1530";
  c.fillRect(bx, by, bw, 14 * fz);
  const f = V.titanHp / r.titan.max;
  c.fillStyle = "#ff3b5c";
  c.fillRect(bx, by, bw * f, 14 * fz);
  c.fillStyle = "rgba(255,255,255,.25)";
  c.fillRect(bx, by, bw * f, 4 * fz);
  // 30% mark and the shield (blue, on top of the HP bar)
  c.fillStyle = "rgba(255,255,255,.6)";
  c.fillRect(bx + bw * 0.3 - 1, by - 3, 2, 14 * fz + 6);
  if (V.titanSh > 0.5) {
    c.fillStyle = "#7ae0ff";
    c.fillRect(bx, by + 8 * fz, bw * Math.min(1, V.titanSh / r.titan.max) , 6 * fz);
  }
}

function rageBanner(c: Ctx, V: View, W: number, y: number, fz: number) {
  if (V.rageAge < 0) return;
  const k = V.rageAge;
  if (k < 0.3) {
    c.fillStyle = `rgba(255,40,60,${0.45 * (1 - k / 0.3)})`;
    c.fillRect(0, 0, W, 2000);
  }
  const sl = Math.min(1, k * 5);
  c.globalAlpha = k > 1.9 ? Math.max(0, 1 - (k - 1.9) * 2) : 1;
  c.fillStyle = "rgba(170,10,30,.94)";
  c.fillRect(0, y, W * sl, 70 * fz);
  if (sl >= 1) {
    txt(c, "ENRAGED!", W / 2, y + 32 * fz, 24 * fz, "#ffcf40", "center", PX, true);
    txt(c, "MENGAMUK! Shield up · stomps hit harder", W / 2, y + 56 * fz, 13 * fz, "#fff", "center", `700 ${BODY}`);
  }
  c.globalAlpha = 1;
}

function warnText(c: Ctx, V: View, cx: number, y: number, size: number) {
  if (V.counter) {
    if (Math.floor(Date.now() / 120) % 2 === 0) {
      txt(c, "⚡ COUNTER!", cx, y, size, "#ff9a3b", "center", PX, true);
      txt(c, "Serang balas!", cx, y + size + 8, size * 0.7, "#ffe0c0", "center", `700 ${BODY}`, true);
    }
    return;
  }
  if (V.warn < 0) return;
  const n = Math.ceil(V.warn);
  if (Math.floor(V.warn * 6) % 2 === 0) {
    txt(c, `⚠ STOMP IN ${n}`, cx, y, size, "#ff3b3b", "center", PX, true);
    txt(c, `Hentakan dalam ${n}`, cx, y + size + 8, size * 0.7, "#ffd0d0", "center", `700 ${BODY}`, true);
  }
}

function messageBox(c: Ctx, V: View, cx: number, y: number, w: number, fz: number) {
  rr(c, cx - w / 2, y, w, 48, 8);
  c.fillStyle = "rgba(16,14,40,.9)";
  c.fill();
  c.strokeStyle = "#ffcf40";
  c.lineWidth = 3;
  c.stroke();
  txt(c, V.msg[0], cx, y + 20, fit(c, V.msg[0], w - 24, 10 * fz, 6), "#fff", "center");
  txt(c, V.msg[1], cx, y + 40, fit(c, V.msg[1], w - 24, 14 * fz, 9, `600 ${BODY}`), "#cfc8f0", "center", `600 ${BODY}`);
}

export const raidElapsed = (r: RaidBoard, game: Game, now: number) => {
  if (!game.goAt) return 0;
  const end = game.status === "ended" && game.endedAt ? game.endedAt : game.paused && game.pausedAt ? game.pausedAt : now;
  return Math.max(0, end - game.goAt - r.pausedMs);
};
export const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms / 1000) % 60)).padStart(2, "0")}`;

/**
 * A stunned raider on the projector (owner: like Fishing Derby, the room sees who answered wrong):
 * a pulsing red ring at the feet, a red outline around the monster and a "WRONG / SALAH" or "TIME'S UP" tag.
 * Fades out over the last half second of the 3 s stun.
 */
function stunMark(c: Ctx, p: { x: number; feet: number; scale: number }, left: number, timeout: boolean, t: number, low = false, compact = false) {
  const a = Math.min(1, left / 500);
  const pulse = 1 + 0.08 * Math.sin(t * 10);
  const w = 40 * p.scale;
  c.save();
  c.globalAlpha = a;
  c.strokeStyle = "#ff3b4e";
  c.lineWidth = 3;
  c.beginPath();
  c.ellipse(p.x, p.feet - 2, w * 0.62 * pulse, w * 0.2 * pulse, 0, 0, 7);
  c.stroke();
  c.setLineDash([5, 4]);
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(p.x, p.feet - w * 0.48, w * 0.66 * pulse, w * 0.66 * pulse, 0, 0, 7);
  c.stroke();
  c.setLineDash([]);
  const [en, ms] = timeout ? ["TIME'S UP", "Masa tamat"] : ["WRONG", "Salah"];
  if (compact) {
    // More than 30 raiders (4 rows): one short line on the monster, so neighbours' tags do not overlap.
    const ty = p.feet - w * 0.5;
    c.font = `6px ${PX}`;
    const tw = c.measureText(en).width + 6;
    rr(c, p.x - tw / 2, ty - 6, tw, 11, 3);
    c.fillStyle = "#ff3b4e";
    c.fill();
    txt(c, en, p.x, ty + 2, 6, "#fff", "center", PX);
    c.restore();
    return;
  }
  // With 3 rows the tag sits on the monster itself, so it does not cover the name of the raider above.
  const ty = low ? p.feet - w * 0.5 - 6 : p.feet - w * 1.2 - 14;
  c.font = `8px ${PX}`;
  const tw = Math.max(c.measureText(en).width, 40) + 12;
  rr(c, p.x - tw / 2, ty - 9, tw, 24, 4);
  c.fillStyle = "#ff3b4e";
  c.fill();
  txt(c, en, p.x, ty + 1, 8, "#fff", "center", PX);
  txt(c, ms, p.x, ty + 12, 9, "#ffe1e4", "center", `700 ${BODY}`);
  c.restore();
}

/** Phones show this many other raiders around you (the rest are counted, not drawn). */
const PHONE_NEIGHBOURS = 8;

/** Big raids (more than 20) use 3 rows; the Titan is drawn a little smaller and the message box moves up. */
const ROOMY = 20;
/** Very big raids (more than 30, up to 50: owner, eighth session) use 4 rows of up to 13 and compact stun tags. */
const HUGE = 30;
/**
 * Where each raider stands on the projector: one row for up to 8, two rows up to 20,
 * three rows of up to 10 above that (owner's pick A for 30 raiders), back rows a little smaller.
 */
function wideSpots(n: number): { x: number; feet: number; scale: number }[] {
  const left = 30;
  const width = 660;
  if (n > HUGE) {
    const per = Math.ceil(n / 4);
    const gap = width / per;
    return Array.from({ length: n }, (_, i) => {
      const row = Math.floor(i / per);
      const k = i % per;
      const count = Math.min(per, n - row * per);
      const start = left + (width - gap * count) / 2 + gap / 2 + (row % 2 === 1 ? gap / 4 : 0);
      return { x: start + k * gap, feet: [368, 417, 466, 515][row], scale: [0.8, 0.86, 0.92, 0.98][row] };
    });
  }
  if (n > ROOMY) {
    const per = Math.ceil(n / 3);
    const gap = width / per;
    return Array.from({ length: n }, (_, i) => {
      const row = Math.floor(i / per);
      const k = i % per;
      const count = Math.min(per, n - row * per);
      const start = left + (width - gap * count) / 2 + gap / 2 + (row === 1 ? gap / 4 : 0);
      return { x: start + k * gap, feet: [380, 445, 510][row], scale: [0.92, 1.0, 1.08][row] };
    });
  }
  if (n <= 8) {
    const gap = Math.min(110, width / Math.max(1, n));
    const start = left + (width - gap * n) / 2 + gap / 2;
    return Array.from({ length: n }, (_, i) => ({ x: start + i * gap, feet: 470, scale: n <= 4 ? 2.3 : 1.9 }));
  }
  const per = Math.ceil(n / 2);
  const gap = width / per;
  return Array.from({ length: n }, (_, i) => {
    const row = i < per ? 0 : 1;
    const k = row ? i - per : i;
    const count = row ? n - per : per;
    const start = left + (width - gap * count) / 2 + gap / 2 + (row ? gap / 4 : 0);
    return { x: start + k * gap, feet: row ? 492 : 420, scale: 1.35 };
  });
}

export function drawRaidWide(c: Ctx, r: RaidBoard, events: RaidEvent[], players: Record<string, Player>, game: Game, now: number) {
  const W = 960;
  const H = 540;
  const V = view(r, events, players, game, now);
  const t = now / 1000;
  const endAge = game.endedAt ? (now - game.endedAt) / 1000 : 0;
  c.setTransform(2, 0, 0, 2, 0, 0);
  c.clearRect(0, 0, W, H);
  if (V.shake) c.translate((Math.random() - 0.5) * V.shake * 2, (Math.random() - 0.5) * V.shake * 2);
  floor(c, W, H, 170);
  const TX = 360;
  const list = Object.values(r.raiders).sort((a, b) => a.slot - b.slot);
  const roomy = list.length > ROOMY;
  const huge = list.length > HUGE;
  const TF = huge ? 238 : roomy ? 262 : 300;
  drawTitan(c, V, r, TX, TF, huge ? 2.55 : roomy ? 2.85 : 3.4, t, endAge);
  const spots = wideSpots(list.length);
  const at: Record<string, { x: number; feet: number; scale: number }> = {};
  list.forEach((x, i) => (at[x.uid] = spots[i]));
  for (const s of V.shots) {
    const p = at[s.uid];
    if (p) shot(c, [p.x, p.feet - 20 * p.scale], [TX, 190], creatureById(r.raiders[s.uid]?.c).type, s.age, s.sup ? 2 : 1, t);
  }
  const stun = r.stun ?? {};
  // Front rows last, so they overlap the rows behind them.
  for (const x of [...list].sort((a, b) => at[a.uid].feet - at[b.uid].feet)) raider(c, V, x, at[x.uid].x, at[x.uid].feet, at[x.uid].scale, t, (stun[x.uid] ?? 0) > now, players, { label: true });
  // Owner: like Fishing Derby, show the room who answered wrong: a red circle and a tag on every stunned raider.
  for (const x of list) {
    const until = stun[x.uid] ?? 0;
    if (until <= now || x.hp <= 0) continue;
    stunMark(c, at[x.uid], until - now, V.wrongTimeout[x.uid] ?? false, t, list.length > ROOMY, list.length > HUGE);
  }
  for (const p of V.pops) {
    const pos = p.at === "titan" ? [TX + 60, 150] : at[p.at] ? [at[p.at].x, at[p.at].feet - 48 * at[p.at].scale] : null;
    if (!pos) continue;
    c.globalAlpha = Math.min(1, (1.1 - p.age) * 3);
    txt(c, p.text, pos[0], pos[1] - p.age * 40, p.big ? 26 : p.at === "titan" ? 16 : 11, p.col, "center", PX, true);
    c.globalAlpha = 1;
  }
  titanBar(c, V, r, 16, 10, 680, 1);
  warnText(c, V, TX, 140, 22);
  messageBox(c, V, TX, huge ? 252 : roomy ? 280 : 312, 600, 1);
  rageBanner(c, V, 700, 200, 1);
  // leaderboard
  rr(c, 712, 10, 236, 520, 10);
  c.fillStyle = "rgba(16,10,30,.85)";
  c.fill();
  txt(c, r.mode === "hs" ? "HIGH SCORE" : "TIME ATTACK", 726, 36, 11, "#ffcf40");
  txt(c, clock(raidElapsed(r, game, now)), 934, 36, 13, "#fff", "right");
  txt(c, r.mode === "hs" ? "Points / Mata" : "Damage / Kerosakan", 726, 60, 13, "#cfc8f0", "left", `600 ${BODY}`);
  const order = [...list].sort((a, b) => b.pts - a.pts || b.rights - a.rights);
  const rows = Math.min(order.length, 15);
  const rowH = Math.min(36, 440 / Math.max(1, rows));
  order.slice(0, rows).forEach((x, i) => {
    const y = 72 + i * rowH;
    c.fillStyle = i < 3 ? "rgba(255,207,64,.14)" : "rgba(255,255,255,.04)";
    c.fillRect(722, y, 216, rowH - 4);
    const mid = y + (rowH - 4) / 2 + 5;
    txt(c, String(i + 1), 734, mid, 10, i < 3 ? "#ffcf40" : "#aaa", "center");
    c.imageSmoothingEnabled = false;
    const sz = rowH - 8;
    c.drawImage(sprite(x.c), 746, y + 2, sz, sz);
    const nm = name(players, x.uid);
    txt(c, nm, 752 + sz, mid, fit(c, nm, 100, 14, 9, `700 ${BODY}`), raiderState(x) === "alive" ? "#fff" : "#888", "left", `700 ${BODY}`);
    txt(c, x.pts.toLocaleString(), 930, mid, 10, "#fff", "right");
  });
  if (order.length > rows) txt(c, `+${order.length - rows} more`, 830, 72 + rows * rowH + 14, 12, "#aaa", "center", `600 ${BODY}`);
  c.setTransform(1, 0, 0, 1, 0, 0);
}

export function drawRaidTall(c: Ctx, r: RaidBoard, events: RaidEvent[], players: Record<string, Player>, game: Game, now: number, me: string) {
  const W = 540;
  const H = 960;
  const V = view(r, events, players, game, now);
  const t = now / 1000;
  const endAge = game.endedAt ? (now - game.endedAt) / 1000 : 0;
  c.setTransform(2, 0, 0, 2, 0, 0);
  c.clearRect(0, 0, W, H);
  if (V.shake) c.translate((Math.random() - 0.5) * V.shake * 2, (Math.random() - 0.5) * V.shake * 2);
  floor(c, W, H, 200);
  // Everything important sits in the top ~45%, so the question card never hides it.
  const TX = 270;
  const TF = 288;
  drawTitan(c, V, r, TX, TF, 2.4, t, endAge);
  const mine = r.raiders[me];
  const all = Object.values(r.raiders).sort((a, b) => a.slot - b.slot);
  // Owner: with up to 30 raiders the phone shows only you and your nearest neighbours (the raiders who
  // joined just before and after you, up to PHONE_NEIGHBOURS), plus "+ N raiders" for everyone else.
  const meAt = Math.max(0, all.findIndex((x) => x.uid === me));
  const near = new Set<string>();
  for (let d = 1; near.size < Math.min(PHONE_NEIGHBOURS, all.length - 1) && d < all.length; d++) {
    for (const j of [meAt - d, meAt + d]) {
      const x = all[((j % all.length) + all.length) % all.length];
      if (x && x.uid !== me && near.size < PHONE_NEIGHBOURS) near.add(x.uid);
    }
  }
  const others = all.filter((x) => near.has(x.uid));
  const hidden = all.length - 1 - others.length;
  // Other players stand on both sides of yours, in two rows.
  const cols = Math.max(1, Math.ceil(others.length / 4));
  const scale = others.length <= 4 ? 1.15 : others.length <= 8 ? 0.95 : 0.78;
  const pos: Record<string, [number, number, number]> = {};
  others.forEach((x, i) => {
    const row = Math.floor(i / (cols * 2));
    const k = i % (cols * 2);
    const right = k % 2 === 1;
    const col = Math.floor(k / 2);
    const span = 150;
    const gx = cols === 1 ? span / 2 : (col * span) / (cols - 1);
    const px = right ? 360 + gx : 180 - gx;
    pos[x.uid] = [px, row ? 372 : 340, scale];
  });
  const myX = 270;
  const myFeet = 398;
  for (const s of V.shots) {
    const p = s.uid === me ? [myX, 340] : pos[s.uid] ? [pos[s.uid][0], pos[s.uid][1] - 18] : null;
    if (p) shot(c, p as [number, number], [TX, 200], creatureById(r.raiders[s.uid]?.c).type, s.age, s.sup ? 2 : 1, t);
  }
  const stun = r.stun ?? {};
  for (const x of others) raider(c, V, x, pos[x.uid][0], pos[x.uid][1], pos[x.uid][2], t, (stun[x.uid] ?? 0) > now, players, {});
  if (mine) raider(c, V, mine, myX, myFeet, 2.3, t, (stun[me] ?? 0) > now, players, { me: true });
  if (hidden > 0) {
    const tag = `+ ${hidden} raiders · penyerang`;
    c.font = `700 12px ${BODY}`;
    const tw = c.measureText(tag).width + 16;
    rr(c, W - tw - 10, 300, tw, 20, 10);
    c.fillStyle = "rgba(16,14,40,.75)";
    c.fill();
    txt(c, tag, W - tw / 2 - 10, 314, 12, "#cfc8f0", "center", `700 ${BODY}`);
  }
  for (const p of V.pops) {
    if (p.at !== "titan" && p.at !== me) continue;
    const [x, y] = p.at === "titan" ? [TX + 70, 170] : [myX + 70, 330];
    c.globalAlpha = Math.min(1, (1.1 - p.age) * 3);
    txt(c, p.text, x, y - p.age * 40, p.big ? 28 : 20, p.col, "center", PX, true);
    c.globalAlpha = 1;
  }
  titanBar(c, V, r, 10, 10, 520, 1.1);
  if (mine) {
    rr(c, 150, 406, 240, 52, 8);
    c.fillStyle = "rgba(16,14,40,.9)";
    c.fill();
    const label = `${name(players, me)} · ${creatureById(mine.c).en}`;
    txt(c, label, 162, 425, fit(c, label, 216, 15, 10, `700 ${BODY}`), "#fff", "left", `700 ${BODY}`);
    c.fillStyle = "#3a3560";
    c.fillRect(162, 432, 216, 8);
    const hp = V.hp[me] ?? 0;
    c.fillStyle = hpCol(hp / mine.max);
    c.fillRect(162, 432, (216 * hp) / mine.max, 8);
    txt(c, `${Math.ceil(hp)}/${mine.max} HP · ${mine.pts.toLocaleString()} ${r.mode === "hs" ? "pts" : "dmg"}`, 162, 452, 12, "#cfc8f0", "left", `600 ${BODY}`);
  }
  warnText(c, V, TX, 196, 26);
  messageBox(c, V, W / 2, 66, 500, 1.2);
  rageBanner(c, V, W, 190, 1.2);
  rr(c, W - 92, 120, 82, 28, 6);
  c.fillStyle = "rgba(16,10,30,.85)";
  c.fill();
  txt(c, clock(raidElapsed(r, game, now)), W - 51, 140, 12, "#ffcf40", "center");
  c.setTransform(1, 0, 0, 1, 0, 0);
}

/** Seconds until the next stomp while the warning is showing, else -1 (for the phone's vibration). */
export function stompWarning(r: RaidBoard | null, game: Game, now: number) {
  if (!r || r.winner || game.status !== "playing" || game.paused || !game.goAt || now < game.goAt) return -1;
  const left = r.nextStomp - now;
  return left > 0 && left <= STOMP_WARN_MS ? Math.ceil(left / 1000) : -1;
}
