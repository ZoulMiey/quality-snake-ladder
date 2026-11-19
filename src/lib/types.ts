export type Text = { en: string; ms: string };

/** A question as stored in the database (host only). For multiple choice, `ans` is the index of the correct option. */
export type Question = {
  id: string;
  cat: string;
  /** Question set (quality, world, logo, malaysia, general). Missing = quality. */
  set?: "quality" | "world" | "logo" | "malaysia" | "general";
  type: "mc" | "tf";
  q: Text;
  opts?: Text[];
  ans: number;
  enabled: boolean;
};

/** What a player's phone sees: no correct answer inside. */
export type PublicQuestion = {
  id: string;
  type: "mc" | "tf";
  q: Text;
  opts: Text[];
};

export type QuestionKind = "turn" | "snake" | "ladder";

export type Outcome =
  | "move" // normal move
  | "win" // reached box 50
  | "noroll" // wrong answer: no roll, penalty
  | "climb" // ladder question correct
  | "nolad" // ladder question wrong
  | "safe" // snake question correct
  | "slide"; // snake question wrong

export type Result = {
  kind: QuestionKind;
  correct: boolean;
  timeout: boolean;
  choice: number | null;
  correctIdx: number;
  dice: number[];
  from: number;
  to: number;
  outcome: Outcome;
  bonus: boolean; // 2-dice bonus roll (5 right in a row)
  penalty?: boolean; // wrong answer: wait 5 seconds before the next question
  special?: string; // landed on a quality event box (id from specials.ts)
  land?: number; // the box the dice landed on, before the special box moved the player
  next: QuestionKind | null; // question that follows because of where they landed
};

export type PlayerState = {
  pos: number;
  streak: number;
  phase: "wait" | "question" | "result" | "won";
  kind: QuestionKind;
  q: PublicQuestion | null;
  deadline: number;
  until: number;
  result: Result | null;
  seq: number;
  rank: number | null;
  correct: number;
  answered: number;
};

export type Player = { name: string; token: string; joinedAt: number };

export type GameMode = "snake" | "kart" | "clash" | "fish";

export type Game = {
  status: "lobby" | "playing" | "ended";
  /** Which game the host picked: Snake & Ladder, Quality Cart or Quality Clash. */
  mode?: GameMode;
  /** Quality Clash only: Single 1 v 1, Team 3 v 3 or Boss Raid. */
  clashFormat?: "team" | "solo" | "boss";
  /** Boss Raid only: Time Attack or High Score. */
  bossMode?: "ta" | "hs";
  /** Which question set this game uses (missing = quality). */
  qset?: "quality" | "world" | "logo" | "malaysia" | "general" | "mix";
  engine: string | null;
  paused: boolean;
  pausedAt: number | null;
  startedAt: number | null;
  /** When the "get ready" countdown ends and the first questions appear. */
  goAt?: number | null;
  endedAt: number | null;
  winners: string[] | null;
  /** This game's quality event boxes (placed at random when the game starts). */
  specials?: { box: number; id: string }[] | null;
  /** Fishing Derby: open play (Teams later). */
  fishMode?: "open" | "teams";
  /** Fishing Derby: when the 5 minutes are up (moved on when the game is paused). */
  endsAt?: number | null;
  /** Fishing Derby: everyone's place, refreshed every few seconds (uid → 1, 2, 3…). */
  ranks?: Record<string, number> | null;
};

export type FeedItem = {
  at: number;
  uid: string;
  text: string;
  tone: "good" | "bad" | "info" | "win";
  /** Fishing Derby: what was caught (phones show other players' catches from the feed). */
  k?: "fish" | "big" | "gold" | "snap" | "frenzy";
  kg?: number;
  name?: string;
};

/** The database drops empty lists, so fill them back in after reading. */
export function fixState(st: PlayerState | null | undefined): PlayerState | null {
  if (!st) return null;
  return {
    ...st,
    q: st.q ? { ...st.q, opts: st.q.opts ?? [] } : null,
    result: st.result ? { ...st.result, dice: st.result.dice ?? [], next: st.result.next ?? null, choice: st.result.choice ?? null } : null,
    rank: st.rank ?? null,
  };
}
export function fixStates(m: Record<string, PlayerState> | null | undefined): Record<string, PlayerState> {
  const out: Record<string, PlayerState> = {};
  for (const [k, v] of Object.entries(m ?? {})) out[k] = fixState(v)!;
  return out;
}
