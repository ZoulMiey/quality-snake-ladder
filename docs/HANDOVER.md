# Handover: Quality Month Games

Last updated 18 Nov 2026, at the end of the second build session. It covers this repository only. Read it fully before changing anything.

## What this is

A web app with live, projector-based quiz games for Quality Month 2026. Players scan a QR code on the projector, type their name and pick a piece, then play on their phones while the projector shows the shared game. Everything is bilingual: **English on top, Malay underneath**.

| Game | Phone | Projector |
|---|---|---|
| **Snake & Ladder** (Ular & Tangga) | Full board with all pieces; question card pops up over the bottom; piece moves on the board | 100-box board, all pieces, latest roll, live feed |
| **Quality Cart** (Kart Kualiti) | Tilt to steer, use items, answer pop-up questions, 16-bit driver's view | Top-down race track with all carts, positions, live feed |
| **Quality Clash** (Pertempuran Kualiti) | Pick a side and monster(s), answer to attack; full 16-bit arena from the player's own side | 16-bit battle arena: **Single 1 v 1**, **Team 3 v 3**, or **Boss Raid** against the Defect Titan |

## Where things are

| What | Where |
|---|---|
| Code | GitHub `ZoulMiey/quality-snake-ladder` |
| Live branch | `claude/eloquent-allen-cekztv` (default branch; **every push deploys to Vercel**) |
| Work branch | `claude/new-session-r5myv3` (second session worked here, then fast-forwarded the live branch after tests; both point at the same commit at handover) |
| Live site | `https://quality-snake-ladder.vercel.app` (`/` = projector, `/join` = phones) |
| Database and login | Firebase project `quality-snake-ladder` (Realtime Database, Singapore, Anonymous sign-in). Separate from the FG Tracker on purpose. Web settings in `src/lib/firebase.ts` (not secret; the security rules protect the data). |
| Review page, new question sets | `https://claude.ai/artifact/8tjZ3iFsHVqQ7GYNjWUcWb`: owner's keep/drop/edit choices for the 343 new questions, saved in its `reviews` collection (read with the ArtifactData tool). **Not applied yet** (see Open items). |
| Review page, original 63 Quality questions | `https://claude.ai/artifact/NeXwos6p8Q56VtvzrQRVsN` (first session). Choices **never applied**. |
| Design drafts shown to the owner | Quality Clash: `https://claude.ai/artifact/MsKWky43BaatKzXceNy7Uh`; Boss Raid: `https://claude.ai/artifact/RBEvDFjp5RZJQURPZzyMFC` |

## How it works

- **No server.** The projector window is the referee: it runs the game engine in the browser, gives out questions, checks answers, moves pieces/carts/monsters and writes results to Firebase. Phones only write their own name/piece, picks, answers and steering.
- **Host PIN.** The first visit to `/` creates a host PIN; other computers need the PIN to open the projector. `secret/pin` is never readable.
- **Reloading the projector** during a game resumes it (the window remembers it is the referee via `sessionStorage`; engines keep a snapshot in `private/`). Another window can take over with "Run it from this window".
- **Up to 20 players** (one per piece; `src/lib/tokens.ts`).
- **Lobby (projector):** big QR code on the left. On the right, a list of game cards with small preview pictures (`src/components/GamePreview.tsx`). Picking one hides the others and shows: the game name with **"← Change game"**, the **question set** picker, the game's options (Clash modes), the players, the rules tiles and **Start game**. No game picked = `game.mode` is empty; phones that join then see "Waiting for the host to choose a game", and the header says "Quality Games". "New game" keeps the picked game and set.
- **Question sets:** each question has a `set`: `quality`, `world`, `logo`, `malaysia` or `general` (missing = quality). The host picks Quality · World · Logo · Malaysia · General Knowledge · **Mix** (= all except Quality) in the lobby; it is saved as `game.qset`, and every engine asks only switched-on questions from that set (`poolFor` in `src/lib/questionSets.ts`). Start is blocked if the set has none switched on.

## The games

### Snake & Ladder
- 5-second "Get ready" countdown; 30 s per question, beep/vibration in the last 5.
- Right = roll 1 dice; 5 right in a row = 2 dice (count restarts). Wrong/timeout = no roll + 5 s penalty, right answer shown.
- Snake head: right = stay, wrong = slide. Ladder foot: right = climb, wrong = stay.
- **16 random event boxes** per game (6–90, never on a snake/ladder end, at least 3 apart). Each question set has its own 16 events, 8 good and 8 bad (`EVENT_SETS` in `src/lib/specials.ts`): Quality (e.g. "Viscosity within range +2", "New CSO −3"), World (flight upgrade, passport expired…), Logo, Malaysia (teh tarik break, haze…), General Knowledge. Mix = 8 good + 8 bad picked from all sets except Quality. The owner should check the Malay wording.
- Landing on an event box (phone): zoomed in on the piece, full-screen "LUCKY BOX! / OH NO!" alert, zoom back in, piece moves forward/back, zoom out.
- Box 100 finishes; game ends at 5 finishers (`MAX_WINNERS`) or everyone if fewer play.
- **Phone = full board** (owner's request, Nov 2026; draft `https://claude.ai/artifact/N45T6TBJXmJvBo6uCkg6Ho`): canvas board with every piece (others small, no names; own piece big with a yellow YOU arrow). Question card pops up over the bottom with a "🗺 Board" button to drop it and see the whole board (timer keeps running). Get ready = big full-screen 5-second countdown. Right answer: card slides away, board full screen, zoom in, dice, piece moves box by box, zoom out, then board + next question. Wrong answer: full-screen WRONG ANSWER (or TIME'S UP) with the right answer, then board + "Next question in X s". Snake/ladder: full-screen SNAKE!/LADDER! alert, then a close-up of that snake/ladder + question; right = full-screen SAFE! / CORRECT! (piece climbs), wrong = full-screen WRONG ANSWER then the piece slides down / stays (shake).
- Timings live in `src/lib/phoneTiming.ts`, shared by the referee and the phone: a right-answer turn now lasts ~4–6 s (depends on the dice) so the animation fits; the 30 s timer of a snake/ladder question starts after the 2 s alert (deadline + `SL_ALERT_MS`); wrong answers stay 5 s.
- Files: board `src/lib/board.ts`, event boxes `src/lib/specials.ts`, rules `src/lib/rules.ts`, referee `src/lib/engine.ts`, phone `src/pages/SnakePhone.tsx` + canvas board `src/components/PhoneBoard.tsx` (join/lobby still in `src/pages/Join.tsx`), projector `src/pages/Screen.tsx` + `src/components/Board.tsx`.

### Quality Cart
- Tilt the phone to steer (or hold ◀ ▶); carts drive forward by themselves. iPhones need a one-time "Turn on tilt steering" tap.
- Questions every 6–12 s (12 s to answer): right = turbo, wrong = slow down. Q boxes give items (PPE Shield, Kaizen Turbo, Oil spill, Audit). Cones/potholes spin out; out-of-spec zones slow down.
- 3 laps (~2½–3 min). Ends when all finish or 60 s after the winner.
- Files: `src/kart/` (track, sim, engine, KartView, KartPhone, Chase3D 16-bit view, pixel art).

### Quality Clash (shared by all three modes)
- **15 equal monsters** (`src/clash/creatures.ts`, pixel art `src/clash/sprites.ts`), shown as "monster / raksasa" on screen (the code calls them creatures). 5 types (fire, water, wind, earth, electric) only set colours and attack animation; **no type advantage**.
- Each fighter gets their own question stream (15 s). **FAST** (within 3 s) = +25%. **5 right in a row = super move ×2** (count restarts). Wrong/timeout = stunned 3 s, right answer shown, streak 0.
- Phones show the **full arena from the player's own side** (their team at the bottom, a yellow "YOU" arrow) with the question card popping up over the bottom.
- **No time limit**; a battle ends when one side is eliminated. Host "End game" early: the side with more HP (+ shield) wins.

**Single 1 v 1 and Team 3 v 3**
- 300 HP per monster. A side's attack power is always **60**, shared by its monsters still standing: 3 left = 20 per hit, 2 left = 30, the last one = 3 hits of 20. Every hit goes to a **random** opponent monster (repeats allowed).
- 1 v 1: each player has 3 monsters, all still-standing ones attack on a right answer. Team: one monster per player; only the answering player's monster attacks (with the same scaling). Team mode also works 1 v 1, 2 v 2, 2 v 3.
- Team only: every 5 right answers by the team = **+50 shield** for the teammate with the lowest HP (takes damage first).
- Simulated length: Team ~4 min, 1 v 1 ~2.5 min.
- Files: rules `src/clash/sim.ts`, referee `src/clash/engine.ts`, projector + shared arena drawing `src/clash/ClashView.tsx` (`ArenaCanvas`, wide = projector, tall = phone), lobby `src/clash/ClashLobby.tsx`, phone + pick screen `src/clash/ClashPhone.tsx`.

**Boss Raid (Defect Titan / Gergasi Kecacatan)**
- 1–20 players, no minimum; phones only pick a monster (duplicates allowed). Host picks **Time Attack** or **High Score**.
- n = players: **Titan HP 700 + 600 per extra player**; **each monster 300 + 200 per extra player**; **stomp 11 + 9.8 per extra player** (rounded).
- Right answer = 50 to the Titan (FAST 63, super 100, both 125).
- Every 8 s the Titan **stomps every monster**, after a 3-second warning (red flashing Titan, screen shake, phones shake + vibrate).
- **Counter-stomp:** each time the Titan loses another 10% of its HP it strikes back with an extra stomp ~1.2 s later ("⚡ COUNTER!"). Added so fast, strong players also feel pressure.
- **ENRAGED at 30% HP:** red glow + banner, a **shield of 10% of its HP** (blue on its HP bar, takes damage first), stomps 30% harder.
- A fainted monster gets **one revive question per raid**: right = back with half its total HP, wrong = out.
- Time Attack: clock counts up (pauses left out). Win screen: time, top 3 damage, **best time today** (`clash/records/best`, kept until the host presses **Clear records**; only wins count). High Score: points = damage dealt, podium top 3 (tie = more right answers). Everyone out = Titan wins. Host "End game" early = Titan wins.
- Balance (simulated, average players 70% right, 2–10 s): **Titan wins ~1 raid in 3 for any group size** (owner's target 30–40%; ~20 players came out up to ~49% in one run), raids ~2.5–2.7 min. An expert solo player (all right, fast) wins with ~40% HP.
- **Owner's real test:** solo Time Attack, all correct and fast: won in **1:01 with ~50–60% HP**. Owner decided to **keep the current setting**. Option discussed but not chosen: timed stomp ×0.7 + counter-stomp ×1.6 (expert would end ~25–35% HP).
- Files: rules + constants `src/clash/boss.ts`, referee `src/clash/bossEngine.ts`, drawing `src/clash/raidDraw.ts`, projector + results `src/clash/RaidView.tsx`, phone + monster pick `src/clash/RaidPhone.tsx`, Titan pixel art `src/clash/titan.ts`.

## Questions

- Stored in the database (`questions`), managed with the **Questions** button in the lobby: set tabs (All, Quality, World, Logo, Malaysia, General Knowledge), switch on/off, edit (with a **Set** field), add, delete, "Switch all on" per set, "Restore original questions" (replaces everything with all 406 defaults).
- Defaults: original 63 Quality in `src/lib/defaultQuestions.ts`; 343 added in `src/lib/moreQuestions.ts` (17 more Quality → 80, World 80, Logo 84, Malaysia 82, General Knowledge 80). Right answer is listed first (`ans: 0`); options are shuffled per player in the game.
- World uses **flag emoji** (phones show real flags; Windows PCs show two letters). Logo questions **describe** logos in words (no images, no trademarks).
- An existing database receives the 343 new questions **once**, on the next projector visit (flag `setup/qsetsAdded`), without touching the host's own questions. This already ran on the live database.

## Data in Firebase (Realtime Database)

`game` (status, mode, qset, clashFormat, bossMode, countdown, winners, event boxes) · `players` · `tokens` · `questions` (host only) · `state` (Snake & Ladder) · `private`, `used` (host only) · `answers` (each phone its own) · `feed` · `kart/*` · `clash/pick/{uid}` (phones, lobby only) · `clash/b`, `clash/ev`, `clash/q/{uid}` (1 v 1 / Team) · `clash/raid`, `clash/rev`, `clash/result`, `clash/records/best` (Boss Raid) · `setup` (pinSet, qsetsAdded).

## Important when changing things

- **Security rules** (`database.rules.json`) are **not deployed automatically**. After any change, the owner must paste the whole file into Firebase console → Realtime Database → Rules → Publish. The current file (with the `clash` section) is already published; the owner played Clash and Boss Raid on the live site. Boss Raid and question sets needed no rule changes.
- Firebase drops empty lists/objects; `fixState`/`fixBoard`/`fixRaid` etc. fill them back in. Keep this in mind for new fields.
- A Firebase multi-path update cannot contain a path and its own child; the engines avoid this.
- Engines write the whole `game` object on start: include new `game.*` fields there (as done for `qset`, `clashFormat`, `bossMode`), or they get wiped.
- `resetGame` clears Clash paths one by one so `clash/records` (best time) survives "New game".

## Testing

```bash
npm install
```

```bash
npm test
```

Runs 5 suites: Snake & Ladder rules (18, including "phone animations finish before the next question"), Quality Cart race (9), Quality Clash battles (11), Boss Raid (10, including simulated win rate and length) and the question bank (4: complete in both languages, unique ids, ~80 per set, Mix excludes Quality).

End-to-end tests use the Firebase emulator (needs Java) and Playwright. In this cloud sandbox: download the emulator once with the proxy, then run it with the proxy variables unset:

```bash
npx -y firebase-tools@14.27.0 setup:emulators:database
```

```bash
env -u HTTPS_PROXY -u HTTP_PROXY -u https_proxy -u http_proxy -u JAVA_TOOL_OPTIONS npx -y firebase-tools@14.27.0 emulators:start --only auth,database --project demo-qsl
```

```bash
npm run dev:emu -- --port 5173 --strictPort
```

Scripts (host PIN `2468`; screenshots to `scripts/e2e/shots/` or `$SHOTS`):
- `node scripts/e2e/snake.cjs`, `snake-20-players.cjs` and `snake-phone.cjs` (screenshots every phone screen: countdown, question, dice, snake/ladder alerts, verdicts, penalty, win). These do **not** clear the database first: start from a fresh emulator
- `node scripts/e2e/cart.cjs`
- `node scripts/e2e/clash.cjs` (Team, 6 fighters + 1 watcher) and `MODE=solo node scripts/e2e/clash.cjs`
- `MODE=ta N=12 node scripts/e2e/boss.cjs`; `MODE=hs N=1 ACC=0.3 node scripts/e2e/boss.cjs` (weak player: fainting + revive); options `ACC` (right-answer chance) and `SKIP` (how often bots skip a turn)

The sandbox cannot reach `vercel.app`, so a deploy can't be checked from here; ask the owner to open the live site.

## Working with the owner

- Wants to **discuss and align before building**; answers in short numbered lists. For bigger features, show a **draft artifact first** (they liked this), unless they say "just build it".
- When they say "build": build, test on the emulator, then **merge to the live branch** (they asked for auto-merge/live after testing).
- Likes **simulations with numbers** to justify game balance, and tests on real phones afterwards, then reports results.
- Prefers simple, bold, readable projector screens; 16-bit pixel style for Clash; bilingual English/Malay everywhere.
- Asked to call them **monsters** ("raksasa"), not creatures.

## Open items

1. **Apply the question review** when the owner says so: read `reviews` from `https://claude.ai/artifact/8tjZ3iFsHVqQ7GYNjWUcWb` (docs keyed by question id: `{d: "keep"|"drop"|"edit", q?: [en, ms], o?: [[en, ms] ×4, right first], set}`; unmarked = keep). The live database already holds these questions, so changes must be written **to the database** (e.g. a second one-time migration flag), not only to `moreQuestions.ts`. The original-63 review (`NeXwos6p8Q56VtvzrQRVsN`) was never applied either. Owner should also check the Malay wording.
2. **Mini Tournament** for Quality Clash: shown as "coming soon" in the lobby. Owner wants a bracket style.
3. **Real-phone checks:** Quality Cart tilt sensitivity (`/ 25` in `useTilt`, `STEER_RATE`) and iPhone permission; Boss Raid balance with real groups (re-tune `src/clash/boss.ts` if needed; large groups may be a bit hard).
4. **Ideas discussed, not built:** cheer meter for watchers (they answer to heal or shield a team), revive in Team mode, MVP screen (most damage, fastest answer, longest streak), Hall of Fame across the day, chiptune music and per-type attack sounds, host settings (e.g. HP 200/300/500), more winners for big Snake & Ladder groups (`MAX_WINNERS`), random snake/ladder layout, other games (Spot the Defect, Quality Bingo, Horse Race).
