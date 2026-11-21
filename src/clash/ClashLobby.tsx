// Projector lobby for Quality Clash: choose Single 1 v 1, Team 3 v 3 / 5 v 5 or Boss Raid, and see who is in.
// The host can move a player to the other team (→ / ←), like Pull the Rope.
import { useMemo } from "react";
import { ref, set, update } from "../lib/store.ts";
import { db } from "../lib/firebase.ts";
import { useDbValue } from "../lib/useDb.ts";
import type { Player } from "../lib/types.ts";
import { CREATURE_IDS, creatureById } from "./creatures.ts";
import CreatureImg from "./CreatureImg.tsx";
import { TEAM_SIZES, lineUp, other, teamSize, type Side, type TeamSize } from "./sim.ts";
import { MAX_RAIDERS, newRaid, raiderHp, titanHp } from "./boss.ts";
import type { RaidBest } from "./bossEngine.ts";
import { removePlayer } from "../lib/engine.ts";
import { clock } from "./raidDraw.ts";

export type ClashFormat = "team" | "solo" | "boss";
export type BossMode = "ta" | "hs";
type RawPick = { side: Side; c: string[] | Record<string, string>; at?: number };

function usePicks(players: Record<string, Player>) {
  const picksRaw = useDbValue<Record<string, RawPick>>("clash/pick");
  return useMemo(
    () =>
      Object.entries(picksRaw ?? {})
        .filter(([u]) => players[u])
        .map(([uid, p]) => ({ uid, side: p.side, c: Array.isArray(p.c) ? p.c : Object.values(p.c ?? {}), at: p.at ?? 0 })),
    [picksRaw, players],
  );
}

/** Team mode size (3 v 3 or 5 v 5), saved as game.clashSize. */
export function useTeamSize(): TeamSize {
  return teamSize(useDbValue<number>("game/clashSize"));
}

type LinePick = { uid: string; side: Side; c: string[]; at: number };

/**
 * Host: move a player to a team. They keep their monster if nobody on that team has it,
 * otherwise they get the first free one. They keep their place in the queue (`at`).
 */
async function moveTo(uid: string, side: Side, picks: LinePick[]) {
  const mine = picks.find((p) => p.uid === uid);
  const taken = new Set(picks.filter((p) => p.side === side && p.uid !== uid).map((p) => p.c[0]));
  const own = mine?.c[0];
  const c = own && CREATURE_IDS.includes(own) && !taken.has(own) ? own : CREATURE_IDS.find((id) => !taken.has(id)) ?? CREATURE_IDS[0];
  await set(ref(db, `clash/pick/${uid}`), { side, c: [c], at: mine?.at || Date.now() });
}

/** Who is in the battle, whether it can start, and who only watches. */
export function useLineUp(format: ClashFormat, players: Record<string, Player>) {
  const picks = usePicks(players);
  const size = useTeamSize();
  return useMemo(() => {
    if (format === "boss") {
      const raid = newRaid("ta", picks);
      const inRaid = new Set(Object.keys(raid.raiders));
      return { ready: inRaid.size > 0, watching: Object.keys(players).filter((u) => !inRaid.has(u)), raiders: Object.values(raid.raiders).sort((a, b) => a.slot - b.slot) };
    }
    const { fighters } = lineUp(format, picks, size);
    const fighting = new Set(Object.values(fighters).map((f) => f.uid));
    const sides = new Set(Object.values(fighters).map((f) => f.side));
    return { ready: sides.has("red") && sides.has("blue"), watching: Object.keys(players).filter((u) => !fighting.has(u)), fighters, picks, size };
  }, [picks, players, format, size]);
}

export function ClashFormatPick({ format, onFormat, bossMode, onBossMode }: { format: ClashFormat; onFormat: (f: ClashFormat) => void; bossMode: BossMode; onBossMode: (m: BossMode) => void }) {
  const best = useDbValue<RaidBest>("clash/records/best");
  const size = useTeamSize();
  return (
    <div className="clash-format">
      <div className="cf-btns" role="radiogroup" aria-label="Quality Clash mode">
        {(
          [
            ["solo", "Single 1 v 1", "Single 1 lawan 1"],
            ["team", "Team 3 v 3 / 5 v 5", "Pasukan 3 lawan 3 / 5 lawan 5"],
            ["boss", "Boss Raid", "Serangan Bos"],
          ] as [ClashFormat, string, string][]
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
      {format === "team" && (
        <div className="cf-boss">
          <div className="cf-btns" role="radiogroup" aria-label="Team size">
            {TEAM_SIZES.map((n) => (
              <button key={n} role="radio" aria-checked={size === n} className={`cf-btn small ${size === n ? "on" : ""}`} onClick={() => update(ref(db, "game"), { clashSize: n })}>
                <span className="en">{n} v {n}</span>
                <span className="ms">{n} lawan {n}</span>
              </button>
            ))}
          </div>
          <div className="cf-best">{size} players a team, the rest watch · Battles about 3–4 min / {size} pemain sepasukan, yang lain menonton · kira-kira 3–4 minit</div>
        </div>
      )}
      {format === "boss" && (
        <div className="cf-boss">
          <div className="cf-btns" role="radiogroup" aria-label="Boss Raid mode">
            {(
              [
                ["ta", "Time Attack", "Serangan Masa"],
                ["hs", "High Score", "Mata Tertinggi"],
              ] as [BossMode, string, string][]
            ).map(([m, en, ms]) => (
              <button key={m} role="radio" aria-checked={bossMode === m} className={`cf-btn small ${bossMode === m ? "on" : ""}`} onClick={() => onBossMode(m)}>
                <span className="en">{en}</span>
                <span className="ms">{ms}</span>
              </button>
            ))}
          </div>
          <div className="cf-best">
            {best ? (
              <>
                ⏱ Best today / Terbaik hari ini: <b>{clock(best.ms)}</b> ({best.n} {best.n === 1 ? "player" : "players"})
              </>
            ) : (
              <>⏱ No best time yet / Tiada masa terbaik lagi</>
            )}
            {best && (
              <button className="btn" onClick={() => set(ref(db, "clash/records/best"), null)}>
                Clear records
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Host: remove a player from the game (same as × in the other games' lists). */
function RemoveBtn({ uid, name }: { uid: string; name?: string }) {
  return (
    <button type="button" className="x" aria-label={`Remove ${name ?? "player"}`} title="Remove" onClick={() => removePlayer(uid)}>
      ×
    </button>
  );
}

/** Projector lobby: the teams (Red on top, Blue below) or the raiders, as compact chips. */
export function ClashRoster({ format, players }: { format: ClashFormat; players: Record<string, Player> }) {
  const lu = useLineUp(format, players);
  if (format === "boss") {
    const n = lu.raiders?.length ?? 0;
    return (
      <div className="clash-roster">
        <div className="cr-col boss">
          <h3>
            RAIDERS <span className="ms">Penyerang</span> <span className="cr-n">{n}/{MAX_RAIDERS}</span>
          </h3>
          {n > 0 && (
            <p className="cr-stats">
              Defect Titan HP <b>{titanHp(n).toLocaleString()}</b> · each monster HP <b>{raiderHp(n).toLocaleString()}</b>
            </p>
          )}
          {!n && <p className="cr-empty">Waiting for players to pick a monster… / Menunggu pemain…</p>}
          <div className="rope-chips">
            {lu.raiders?.map((x) => (
              <span key={x.uid} className="rope-chip cr-chip">
                <CreatureImg id={x.c} size={26} title={creatureById(x.c).en} />
                {players[x.uid]?.name}
                <RemoveBtn uid={x.uid} name={players[x.uid]?.name} />
              </span>
            ))}
          </div>
        </div>
        {lu.watching.length > 0 && (
          <div className="cr-watch rope-unpicked">
            <span>Not picked yet / Belum pilih ({lu.watching.length}):</span>
            <div className="rope-chips">
              {lu.watching.map((u) => (
                <span key={u} className="rope-chip cr-chip">
                  {players[u]?.name}
                  <RemoveBtn uid={u} name={players[u]?.name} />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  const fighters = lu.fighters ?? {};
  const col = (side: Side) => {
    const fs = Object.values(fighters).filter((f) => f.side === side);
    const uids = [...new Set(fs.map((f) => f.uid))];
    const cap = format === "solo" ? 1 : lu.size ?? 3;
    const to = other(side) === "red" ? "Red" : "Blue";
    return (
      <div className={`cr-col ${side}`}>
        <h3>
          {side === "red" ? "RED" : "BLUE"} <span className="ms">{side === "red" ? "Merah" : "Biru"}</span> <span className="cr-n">{uids.length}/{cap}</span>
        </h3>
        {!uids.length && <p className="cr-empty">Waiting for a player… / Menunggu pemain…</p>}
        <div className="rope-chips">
          {uids.map((u) => (
            <span key={u} className="rope-chip cr-chip">
              {fs
                .filter((f) => f.uid === u)
                .map((f) => (
                  <CreatureImg key={f.id} id={f.c} size={26} title={creatureById(f.c).en} />
                ))}
              {players[u]?.name}
              {format === "team" && (
                <button type="button" className={`mv ${other(side)}`} title={`Move to ${to}`} aria-label={`Move ${players[u]?.name} to ${to}`} onClick={() => moveTo(u, other(side), lu.picks ?? [])}>
                  {side === "red" ? "→" : "←"}
                </button>
              )}
              <RemoveBtn uid={u} name={players[u]?.name} />
            </span>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="clash-roster">
      <div className="cr-cols">
        {col("red")}
        {col("blue")}
      </div>
      {lu.watching.length > 0 && (
        <div className="cr-watch rope-unpicked">
          <span>
            Watching / Menonton ({lu.watching.length}){format === "team" ? ": use ← / → to put a player on a team" : ""}
          </span>
          <div className="rope-chips">
            {lu.watching.map((u) => {
              const pk = lu.picks?.find((p) => p.uid === u);
              return (
                <span key={u} className={`rope-chip none ${pk?.side ?? ""}`}>
                  {format === "team" && (
                    <button type="button" className="red" aria-label={`Put ${players[u]?.name} on Red`} onClick={() => moveTo(u, "red", lu.picks ?? [])}>
                      ←
                    </button>
                  )}
                  {players[u]?.name}
                  {format === "team" && (
                    <button type="button" className="blue" aria-label={`Put ${players[u]?.name} on Blue`} onClick={() => moveTo(u, "blue", lu.picks ?? [])}>
                      →
                    </button>
                  )}
                  <RemoveBtn uid={u} name={players[u]?.name} />
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
