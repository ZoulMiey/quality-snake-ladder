// Projector lobby for Quality Clash: choose Quick Match (Team or Single) and see who is on Red and Blue.
import { useMemo } from "react";
import { useDbValue } from "../lib/useDb.ts";
import type { Player } from "../lib/types.ts";
import { creatureById } from "./creatures.ts";
import CreatureImg from "./CreatureImg.tsx";
import { lineUp, type Format, type Side } from "./sim.ts";

type RawPick = { side: Side; c: string[] | Record<string, string>; at?: number };

export function useLineUp(format: Format, players: Record<string, Player>) {
  const picksRaw = useDbValue<Record<string, RawPick>>("clash/pick");
  return useMemo(() => {
    const picks = Object.entries(picksRaw ?? {})
      .filter(([u]) => players[u])
      .map(([uid, p]) => ({ uid, side: p.side, c: Array.isArray(p.c) ? p.c : Object.values(p.c ?? {}), at: p.at ?? 0 }));
    const { fighters } = lineUp(format, picks);
    const fighting = new Set(Object.values(fighters).map((f) => f.uid));
    const sides = new Set(Object.values(fighters).map((f) => f.side));
    return { fighters, ready: sides.has("red") && sides.has("blue"), watching: Object.keys(players).filter((u) => !fighting.has(u)) };
  }, [picksRaw, players, format]);
}

export function ClashFormatPick({ format, onFormat }: { format: Format; onFormat: (f: Format) => void }) {
  return (
    <div className="clash-format">
      <div className="cf-label">
        <span className="en">Quick Match</span>
        <span className="ms">Perlawanan Pantas</span>
      </div>
      <div className="cf-btns" role="radiogroup" aria-label="Quick Match mode">
        {(
          [
            ["team", "Team 3 v 3", "Pasukan 3 lawan 3"],
            ["solo", "Single 1 v 1", "Single 1 lawan 1"],
          ] as [Format, string, string][]
        ).map(([f, en, ms]) => (
          <button key={f} role="radio" aria-checked={format === f} className={`cf-btn ${format === f ? "on" : ""}`} onClick={() => onFormat(f)}>
            <span className="en">{en}</span>
            <span className="ms">{ms}</span>
          </button>
        ))}
        <button className="cf-btn soon" disabled title="Coming soon">
          <span className="en">Mini Tournament</span>
          <span className="ms">Coming soon / Akan datang</span>
        </button>
      </div>
    </div>
  );
}

export function ClashRoster({ format, players }: { format: Format; players: Record<string, Player> }) {
  const { fighters, watching } = useLineUp(format, players);
  const col = (side: Side) => {
    const fs = Object.values(fighters).filter((f) => f.side === side);
    const uids = [...new Set(fs.map((f) => f.uid))];
    const cap = format === "solo" ? 1 : 3;
    return (
      <div className={`cr-col ${side}`}>
        <h3>
          {side === "red" ? "RED" : "BLUE"} <span className="ms">{side === "red" ? "Merah" : "Biru"}</span> <span className="cr-n">{uids.length}/{cap}</span>
        </h3>
        {!uids.length && <p className="cr-empty">Waiting for a player… / Menunggu pemain…</p>}
        {uids.map((u) => (
          <div key={u} className="cr-row">
            <div className="cr-mons">
              {fs
                .filter((f) => f.uid === u)
                .map((f) => (
                  <CreatureImg key={f.id} id={f.c} size={format === "solo" ? 52 : 64} title={creatureById(f.c).en} />
                ))}
            </div>
            <div className="cr-who">
              <div className="cr-name">{players[u]?.name}</div>
              <div className="cr-cn">{fs.filter((f) => f.uid === u).map((f) => creatureById(f.c).en).join(" · ")}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="clash-roster">
      <div className="cr-cols">
        {col("red")}
        {col("blue")}
      </div>
      {watching.length > 0 && (
        <p className="cr-watch">
          Watching / Menonton: {watching.map((u) => players[u]?.name).join(", ")}
        </p>
      )}
    </div>
  );
}
