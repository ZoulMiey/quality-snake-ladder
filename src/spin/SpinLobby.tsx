// Quality Spin lobby. Phones pick Red or Blue (3 a team, the rest watch) and a teammate taps "I'm the captain"
// (first tap wins; owner). The projector shows both teams with the captain's crown; the host can move players,
// make someone captain or send a player back to watching. Picks are saved in clash/pick/{uid} =
// { side, c: ["spin"] or ["spin", "cap"], at } like Pull the Rope, so no new security rules are needed.
import { useMemo, useState } from "react";
import { ref, remove, set, update, serverTimestamp } from "firebase/database";
import { db } from "../lib/firebase.ts";
import { useDbValue } from "../lib/useDb.ts";
import { unlockAudio } from "../lib/sound.ts";
import type { Player } from "../lib/types.ts";
import { spinPicksFrom } from "./engine.ts";
import { SIDES, SIDE_NAME, TEAM_MAX, other, teamsFrom, type Side } from "./rules.ts";

type RawPick = { side?: string; at?: number; c?: unknown };

export function useSpinTeams(players: Record<string, Player>) {
  const raw = useDbValue<Record<string, RawPick>>("clash/pick");
  return useMemo(() => {
    const picks = spinPicksFrom(raw);
    for (const u of Object.keys(picks)) if (!players[u]) delete picks[u];
    const teams = teamsFrom(picks, (u) => !!players[u]);
    const watching = Object.keys(players)
      .filter((u) => !picks[u])
      .sort((a, b) => (players[a].joinedAt ?? 0) - (players[b].joinedAt ?? 0));
    return { picks, teams, watching, ready: teams.red.members.length > 0 && teams.blue.members.length > 0 };
  }, [raw, players]);
}

async function savePick(uid: string, side: Side | null, cap: boolean, at?: number) {
  if (!side) await remove(ref(db, `clash/pick/${uid}`));
  else await set(ref(db, `clash/pick/${uid}`), { side, c: cap ? ["spin", "cap"] : ["spin"], at: at ?? serverTimestamp() });
}

/** Host: make `uid` the captain of their team (and nobody else). */
async function makeCaptain(uid: string, side: Side, members: string[]) {
  const updates: Record<string, unknown> = {};
  for (const u of members) updates[`clash/pick/${u}/c`] = u === uid ? ["spin", "cap"] : ["spin"];
  updates[`clash/pick/${uid}/side`] = side;
  await update(ref(db), updates);
}

function Bi({ en, ms, className }: { en: string; ms: string; className?: string }) {
  return (
    <div className={`bi ${className ?? ""}`}>
      <div className="en">{en}</div>
      <div className="ms">{ms}</div>
    </div>
  );
}

/** Phone: pick a team, then a captain. */
export function SpinPick({ uid }: { uid: string }) {
  const players = useDbValue<Record<string, Player>>("players");
  const { picks, teams } = useSpinTeams(players ?? {});
  const mine = picks[uid] ?? null;
  const [msg, setMsg] = useState("");
  const name = (u: string) => players?.[u]?.name ?? "Player";
  async function act(fn: () => Promise<void>) {
    unlockAudio();
    setMsg("");
    try {
      await fn();
    } catch {
      setMsg("Could not save. The game may have started. / Tidak dapat disimpan.");
    }
  }
  const myTeam = mine ? teams[mine.side] : null;
  const inTeam = !!myTeam && myTeam.members.includes(uid);
  const captain = myTeam?.captain ?? "";
  const hasCaptain = !!myTeam && myTeam.members.some((u) => picks[u]?.cap);
  return (
    <div className="clash-pick rope-pick spin-pick">
      <Bi en="Quality Spin: join a team (3 players)" ms="Putaran Kualiti: sertai pasukan (3 pemain)" className="cp-title" />
      <div className="cp-sides">
        {SIDES.map((s) => {
          const n = teams[s].members.length;
          const full = n >= TEAM_MAX && mine?.side !== s;
          return (
            <button key={s} type="button" className={`cp-side ${s} ${mine?.side === s ? "on" : ""}`} disabled={full} onClick={() => act(() => savePick(uid, s, false))} aria-pressed={mine?.side === s}>
              <span className="en">{SIDE_NAME[s].en.toUpperCase()}</span>
              <span className="ms">{SIDE_NAME[s].ms}</span>
              <span className="cp-count">{full ? "Full · Penuh" : `${n} / ${TEAM_MAX}`}</span>
            </button>
          );
        })}
      </div>
      {myTeam && inTeam && (
        <div className={`sp-team ${mine!.side}`}>
          <div className="sp-members">
            {myTeam.members.map((u) => (
              <span key={u} className={`sp-member ${u === captain && hasCaptain ? "cap" : ""}`}>
                {u === captain && hasCaptain ? "👑 " : ""}
                {name(u)}
                {u === uid ? " (you)" : ""}
              </span>
            ))}
          </div>
          {!hasCaptain && (
            <button type="button" className="big-btn sp-cap-btn" onClick={() => act(() => savePick(uid, mine!.side, true, mine!.at))}>
              👑 I'm the captain <small>Saya kapten</small>
            </button>
          )}
          {hasCaptain && captain === uid && (
            <>
              <p className="sp-cap-note">
                👑 You are the captain: you answer, flick the phone to spin, pick the letters and solve. Your team helps you!
                <br />
                <span className="muted">Anda kapten: anda jawab, lontar telefon, pilih huruf dan selesaikan. Pasukan anda membantu!</span>
              </p>
              <button type="button" className="link-btn" onClick={() => act(() => savePick(uid, mine!.side, false, mine!.at))}>
                Stop being captain / Berhenti jadi kapten
              </button>
            </>
          )}
          {hasCaptain && captain !== uid && (
            <p className="sp-cap-note">
              👑 {name(captain)} is your captain. Help them on your phone: you see the same screen.
              <br />
              <span className="muted">{name(captain)} kapten anda. Bantu kapten: anda nampak skrin yang sama.</span>
            </p>
          )}
        </div>
      )}
      {mine && !inTeam && <p className="muted small-note">This team is full. You are watching. / Pasukan penuh. Anda menonton.</p>}
      <p className="muted small-note">
        {mine ? (
          <button type="button" className="link-btn" onClick={() => act(() => savePick(uid, null, false))}>
            Just watch / Tonton sahaja
          </button>
        ) : (
          "Not on a team = you watch the game on the big screen. / Tiada pasukan = anda menonton di skrin besar."
        )}
      </p>
      {msg && <p className="error">{msg}</p>}
    </div>
  );
}

/** Projector: both teams with the captain, buttons to move players, make a captain or send back to watching. */
export function SpinRoster({ players }: { players: Record<string, Player> }) {
  const { picks, teams, watching } = useSpinTeams(players);
  const col = (s: Side) => {
    const t = teams[s];
    const hasCaptain = t.members.some((u) => picks[u]?.cap);
    const room = teams[other(s)].members.length < TEAM_MAX;
    return (
      <div className={`cr-col ${s}`}>
        <h3>
          {SIDE_NAME[s].en.toUpperCase()} <span className="ms">{SIDE_NAME[s].ms}</span>{" "}
          <span className="cr-n">
            {t.members.length}/{TEAM_MAX}
          </span>
        </h3>
        {!t.members.length && <p className="cr-empty">Nobody yet… / Belum ada…</p>}
        <div className="rope-chips">
          {t.members.map((u) => {
            const cap = u === t.captain && hasCaptain;
            return (
              <span key={u} className={`rope-chip spin-chip ${cap ? "cap" : ""}`}>
                <button type="button" className="crown" title={cap ? "Captain" : "Make captain"} aria-label={cap ? `${players[u]?.name} is captain` : `Make ${players[u]?.name} captain`} onClick={() => makeCaptain(u, s, t.members)}>
                  {cap ? "👑" : "♔"}
                </button>
                {players[u]?.name}
                <button type="button" title="Back to watching" aria-label={`${players[u]?.name} watches`} onClick={() => savePick(u, null, false)}>
                  ×
                </button>
                <button type="button" disabled={!room} title={`Move to ${SIDE_NAME[other(s)].en}`} aria-label={`Move ${players[u]?.name} to ${SIDE_NAME[other(s)].en}`} onClick={() => savePick(u, other(s), false)}>
                  {s === "red" ? "→" : "←"}
                </button>
              </span>
            );
          })}
          {t.extra.map((u) => (
            <span key={u} className="rope-chip none" title="Team full: watching">
              {players[u]?.name} · waiting
            </span>
          ))}
        </div>
        {t.members.length > 0 && <p className="sp-cap-line">{hasCaptain ? `👑 Captain: ${players[t.captain]?.name}` : `No captain yet: ${players[t.captain]?.name} if nobody taps / Belum ada kapten`}</p>}
      </div>
    );
  };
  return (
    <div className="clash-roster rope-roster spin-roster">
      <div className="cr-cols">
        {col("red")}
        {col("blue")}
      </div>
      {watching.length > 0 && (
        <div className="cr-watch rope-unpicked">
          <span>Watching / Menonton ({watching.length}):</span>
          <div className="rope-chips">
            {watching.slice(0, 30).map((u) => (
              <span key={u} className="rope-chip none">
                <button type="button" className="red" disabled={teams.red.members.length >= TEAM_MAX} aria-label={`Put ${players[u]?.name} on Red`} onClick={() => savePick(u, "red", false)}>
                  ←
                </button>
                {players[u]?.name}
                <button type="button" className="blue" disabled={teams.blue.members.length >= TEAM_MAX} aria-label={`Put ${players[u]?.name} on Blue`} onClick={() => savePick(u, "blue", false)}>
                  →
                </button>
              </span>
            ))}
            {watching.length > 30 && <span className="rope-chip none">+ {watching.length - 30} more</span>}
          </div>
        </div>
      )}
    </div>
  );
}
