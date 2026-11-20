// Pull the Rope lobby: players pick Red or Blue on their phone (they can talk it over first); the host sees both
// teams on the projector and can move anyone to the other side. Sides are saved in clash/pick/{uid}
// (the same place as Quality Clash teams), so no new security rules are needed.
import { useMemo, useState } from "react";
import { ref, remove, set, serverTimestamp } from "firebase/database";
import { db } from "../lib/firebase.ts";
import { useDbValue } from "../lib/useDb.ts";
import { unlockAudio } from "../lib/sound.ts";
import type { Player } from "../lib/types.ts";
import { sidesFrom } from "./engine.ts";
import { SIDES, SIDE_NAME, other, teamsFor, type Side } from "./rules.ts";

type RawPick = { side?: string; at?: number; c?: unknown };

export function useRopeSides(players: Record<string, Player>) {
  const raw = useDbValue<Record<string, RawPick>>("clash/pick");
  return useMemo(() => {
    const { side, at } = sidesFrom(raw);
    for (const u of Object.keys(side)) if (!players[u]) delete side[u];
    const teams = teamsFor(players, side);
    const count = { red: 0, blue: 0 };
    for (const s of Object.values(teams)) count[s]++;
    const unpicked = Object.keys(players).filter((u) => !side[u]);
    return { side, at, teams, count, unpicked, ready: count.red > 0 && count.blue > 0 };
  }, [raw, players]);
}

async function saveSide(uid: string, side: Side | null) {
  if (!side) await remove(ref(db, `clash/pick/${uid}`));
  else await set(ref(db, `clash/pick/${uid}`), { side, c: ["rope"], at: serverTimestamp() });
}

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

/** Phone: pick your side. */
export function RopePick({ uid }: { uid: string }) {
  const players = useDbValue<Record<string, Player>>("players");
  const sides = useRopeSides(players ?? {});
  const mine = sides.side[uid] ?? null;
  const [msg, setMsg] = useState("");
  async function pick(s: Side) {
    unlockAudio();
    setMsg("");
    try {
      await saveSide(uid, s);
    } catch {
      setMsg("Could not save. The game may have started. / Tidak dapat disimpan.");
    }
  }
  const picked = Object.values(sides.side);
  const n = (s: Side) => picked.filter((x) => x === s).length;
  return (
    <div className="clash-pick rope-pick">
      <Bi en="Pull the Rope: pick your side" ms="Tarik Tali: pilih pihak anda" className="cp-title" />
      <div className="cp-sides">
        {SIDES.map((s) => (
          <button key={s} type="button" className={`cp-side ${s} ${mine === s ? "on" : ""}`} onClick={() => pick(s)} aria-pressed={mine === s}>
            <span className="en">{SIDE_NAME[s].en.toUpperCase()}</span>
            <span className="ms">{SIDE_NAME[s].ms}</span>
            <span className="cp-count">
              {n(s)} {n(s) === 1 ? "player" : "players"}
            </span>
          </button>
        ))}
      </div>
      <p className="muted small-note">
        {mine
          ? `You are on ${SIDE_NAME[mine].en}. You can change until the game starts. / Anda di pihak ${SIDE_NAME[mine].ms}. Boleh tukar sebelum mula.`
          : "Talk it over with your friends, then tap a side. Not picked = the smaller team. / Bincang dengan rakan, kemudian pilih. Tidak pilih = pasukan yang lebih kecil."}
      </p>
      {msg && <p className="error">{msg}</p>}
    </div>
  );
}

/** Projector: both teams, with a button to move a player to the other side. */
export function RopeRoster({ players }: { players: Record<string, Player> }) {
  const sides = useRopeSides(players);
  const byJoin = Object.keys(players).sort((a, b) => (players[a].joinedAt ?? 0) - (players[b].joinedAt ?? 0));
  const col = (s: Side) => {
    const picked = byJoin.filter((u) => sides.side[u] === s);
    return (
      <div className={`cr-col ${s}`}>
        <h3>
          {SIDE_NAME[s].en.toUpperCase()} <span className="ms">{SIDE_NAME[s].ms}</span> <span className="cr-n">{picked.length}</span>
        </h3>
        {!picked.length && <p className="cr-empty">Nobody yet… / Belum ada…</p>}
        <div className="rope-chips">
          {picked.map((u) => (
            <span key={u} className="rope-chip">
              {players[u]?.name}
              <button type="button" title={`Move to ${SIDE_NAME[other(s)].en}`} aria-label={`Move ${players[u]?.name} to ${SIDE_NAME[other(s)].en}`} onClick={() => saveSide(u, other(s))}>
                {s === "red" ? "→" : "←"}
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="clash-roster rope-roster">
      <div className="cr-cols">
        {col("red")}
        {col("blue")}
      </div>
      {sides.unpicked.length > 0 && (
        <div className="cr-watch rope-unpicked">
          <span>
            Not picked yet / Belum pilih ({sides.unpicked.length}) · they join the smaller team at Start:
          </span>
          <div className="rope-chips">
            {sides.unpicked.map((u) => (
              <span key={u} className="rope-chip none">
                <button type="button" className="red" aria-label={`Put ${players[u]?.name} on Red`} onClick={() => saveSide(u, "red")}>
                  ←
                </button>
                {players[u]?.name}
                <button type="button" className="blue" aria-label={`Put ${players[u]?.name} on Blue`} onClick={() => saveSide(u, "blue")}>
                  →
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="cr-stats">
        At Start: Red <b>{sides.count.red}</b> · Blue <b>{sides.count.blue}</b>
        {sides.count.red !== sides.count.blue && sides.count.red && sides.count.blue ? " · uneven teams are fine: each pull is shared out by team size" : ""}
      </p>
    </div>
  );
}
