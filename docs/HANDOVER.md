# Handover: Quality Month Games

Written at the end of the first build session (18 Nov 2026). It covers this repository only.

## What this is

A web app with three live, projector-based games for Quality Month 2026. Players scan a QR code on the projector, type their name and pick a piece, then play on their phones while the projector shows the shared game.

| Game | Phone | Projector |
|---|---|---|
| **Snake & Ladder** (Ular & Tangga) | Answer questions, see dice and moves | 100-box board, all pieces, latest roll, live feed |
| **Quality Cart** (Kart Kualiti) | Tilt to steer, use items, answer pop-up questions, 16-bit driver's view | Top-down race track with all carts, positions, live feed |
| **Quality Clash** (Pertempuran Kualiti) | Pick a team and creature(s), answer questions to attack | 16-bit 3 v 3 battle arena with HP bars, attacks, shields |

The host chooses the game in the projector lobby: the big QR code stays on the left; on the right is a list of game cards (with a small preview picture). Picking one hides the others and shows that game's options, players, rules and Start button; "← Change game" goes back to the list. Until a game is picked, phones that join see "Waiting for the host to choose a game". The picked game is `game.mode` (no mode = the list); "New game" keeps the picked game. Everything is bilingual: English on top, Malay underneath.

## Where things are

| What | Where |
|---|---|
| Code | GitHub `ZoulMiey/quality-snake-ladder`, branch `claude/eloquent-allen-cekztv` (the only branch, and therefore the default) |
| Live site | Vercel project linked to the repo: `https://quality-snake-ladder.vercel.app` (`/` = projector, `/join` = phones). Every push deploys automatically. |
| Database and login | Firebase project `quality-snake-ladder` (Realtime Database in Singapore + Anonymous sign-in). Kept separate from the FG Tracker on purpose. |
| Question review page | claude.ai artifact `https://claude.ai/artifact/NeXwos6p8Q56VtvzrQRVsN` (keep/drop/edit the 63 draft questions). The choices made there are **not yet** copied into the game. |

The Firebase web settings are in `src/lib/firebase.ts`. They are not secret; the security rules protect the data.

## How it works

- **No server.** The projector window is the referee: it runs the game engine in the browser, gives out questions, checks answers, rolls dice or moves carts, and writes the results to Firebase. Phones only write their own name/piece, answers and steering.
- **Host PIN.** The first visit to `/` creates a host PIN; other computers need the PIN to open the projector screen. The rules check it (`secret/pin` is never readable).
- **Reloading the projector** during a game resumes it (the window remembers it is the referee via `sessionStorage`; Quality Cart also saves a snapshot every 1.5 s). Another window can take over with "Run it from this window".
- **Up to 20 players** (one per piece; 20 pieces in `src/lib/tokens.ts`).

### Snake & Ladder rules (current)
- 5-second "Get ready" countdown after Start; 30 seconds per question with a beep/vibration in the last 5.
- Right = roll 1 dice. 5 right in a row = 2 dice (count restarts). Wrong or timeout = no roll + 5-second penalty (always 5 s), and the right answer is shown.
- Snake head: question, right = stay, wrong = slide + penalty. Ladder foot: right = climb, wrong = stay + penalty.
- 12 **quality event boxes** placed at random each game (e.g. "Viscosity within range +2", "New CSO (customer complaint) −3"); the move is instant; a snake/ladder at the new box still asks its question.
- Reaching or passing box 100 finishes. Game ends at 5 finishers (or everyone if fewer play).
- Board layout: `src/lib/board.ts`; event boxes: `src/lib/specials.ts`; rules: `src/lib/rules.ts`; referee: `src/lib/engine.ts`.

### Quality Cart rules (current)
- Tilt the phone to steer (or hold ◀ ▶). Carts drive forward by themselves; tilt moves them across the road. iPhones need a one-time "Turn on tilt steering" tap.
- Questions pop up every 6–12 s (12 s to answer): right = turbo, wrong/timeout = slow down.
- Q boxes give items: PPE Shield, Kaizen Turbo, Oil spill, Audit (slows the leader). Carts further back get more turbos/audits.
- Cones/potholes spin you out; out-of-spec zones slow you down.
- 3 laps (about 2½–3 min). Ends when all finish or 60 s after the winner.
- Track: `src/kart/track.ts`; race rules: `src/kart/sim.ts`; referee: `src/kart/engine.ts`; projector map: `src/kart/KartView.tsx`; phone: `src/kart/KartPhone.tsx` + 16-bit view `src/kart/Chase3D.tsx` (pixel art in `src/kart/pixel.ts`).
- The projector sends all cart positions ~6×/second to `kart/pos`; phones smooth movement in between.

### Quality Clash rules (added 18 Nov 2026, second session)
- Lobby: host picks **Quality Clash**, then Quick Match **Team 3 v 3** or **Single 1 v 1** (Mini Tournament shows "coming soon"). Phones pick Red/Blue and a monster (Team) or 3 monsters (1 v 1); players who don't get a place watch. Team mode also works with fewer players (1 v 1, 2 v 2, 2 v 3).
- 15 equal **monsters** (on screen: "monster" / "raksasa"; the code still calls them creatures) (`src/clash/creatures.ts`, pixel art in `src/clash/sprites.ts`), 300 HP each; the type only sets colours and the attack animation. No type advantage.
- Each fighter gets their own question stream (15 s). Right = attack at once. A side's attack power is always **60**, shared by its creatures still standing: 3 left = 20 per hit, 2 left = 30 per hit, the last one = 3 hits of 20. Team: only the answering player's creature attacks. 1 v 1: all the player's creatures still standing attack (20+20+20, 30+30 or 3 × 20). Every hit goes to a **random** opponent creature (several hits can land on the same one).
- FAST (answer within 3 s) +25%. 5 right in a row = super move ×2, count restarts. Wrong/timeout = stunned 3 s, right answer shown, streak 0.
- Team only: every 5 right answers by the team = +50 shield for the teammate with the lowest HP; shields take damage first.
- No time limit: the battle ends when one side is eliminated. "End game" by the host gives the win to the side with more HP + shield.
- Simulated length (`npm test`): Team median about 4 min, 1 v 1 about 2.5 min.
- Phones show the full battle arena from their own side (their team at the bottom, a "YOU" arrow), with the question popping up over it. The arena drawing is shared: `ArenaCanvas` in `src/clash/ClashView.tsx` (wide = projector, tall = phone).
- Code: rules `src/clash/sim.ts`; referee `src/clash/engine.ts`; projector `src/clash/ClashView.tsx`; lobby `src/clash/ClashLobby.tsx`; phone `src/clash/ClashPhone.tsx`. Data: `clash/pick/{uid}` (phones, lobby only), `clash/b` (battle), `clash/ev` (last 16 events for animations), `clash/q/{uid}`, `private/clash`.
- **Security rules:** a new `clash` section was added to `database.rules.json`. Paste the whole file into Firebase before playing Quality Clash.
- End-to-end: `node scripts/e2e/clash.cjs` (Team, 6 fighters + 1 watcher) and `MODE=solo node scripts/e2e/clash.cjs`.

### Boss Raid (third Quality Clash mode, added 18 Nov 2026)
- Lobby order: Single 1 v 1 · Team 3 v 3 · **Boss Raid** · Mini Tournament (soon). Boss Raid then offers **Time Attack** or **High Score**. Phones only pick a monster (duplicates allowed), 1–20 players, no minimum.
- HP grows with the group (n = players): **Defect Titan 700 + 600 per extra player**, **each monster 300 + 200 per extra player**, **stomp 11 + 9.8 per extra player** (rounded).
- **Counter-stomp:** every time the Titan loses another 10% of its HP, it strikes back with an extra stomp about 1.2 s later ("⚡ COUNTER!" warning; several are spaced 1.5 s apart). This keeps fast, strong players under pressure: in simulation an expert solo player (all right, 1.5–3 s) now ends at about 40% HP instead of 70%.
- **ENRAGED at 30% Titan HP:** red glow and banner "ENRAGED! / MENGAMUK!", a shield of 10% of the Titan's total HP (shown in blue on its HP bar; it takes damage first), and stomps 30% harder. Constants `RAGE_AT`, `RAGE_SHIELD`, `RAGE_STOMP` in `src/clash/boss.ts`.
- Tuned (after the owner's first real test, where a solo all-correct run felt too easy) so the **Titan wins about 1 raid in 3 for average players and any group size** (owner's target 30–40%) and raids last about 2.5–2.7 minutes (simulated; `npm test` checks it). Re-tune after real games if players answer much faster or slower than the simulation (70% right, 2–10 s per answer).
- Right answer = 50 damage to the Titan (FAST 63, super move 100, both 125). Wrong = 3 s stun.
- Both modes: every 8 s the Titan stomps every monster still standing, after a 3-second warning (red flashing Titan, projector shake, phone shake + vibration). A fainted monster gets **one revive question per raid**: right = back with half its total HP, wrong/timeout = out.
- Time Attack: clock counts up (paused time is left out). Win screen: time, top 3 damage, best time today. The best time is in `clash/records/best` and stays until the host presses **Clear records** in the lobby ("New game" keeps it). Only wins count.
- High Score: points = damage dealt; podium top 3, tie = more right answers. If every monster is out, the Titan wins (top scorer still shown).
- Host "End game" before the Titan falls = Titan wins; the table is shown as it stands.
- Code: rules `src/clash/boss.ts`; referee `src/clash/bossEngine.ts`; drawing `src/clash/raidDraw.ts` (wide projector / tall phone); projector + results `src/clash/RaidView.tsx`; phone + monster pick `src/clash/RaidPhone.tsx`; the Titan's pixel art `src/clash/titan.ts`. Data: `clash/raid`, `clash/rev` (last 24 events), `clash/q/{uid}` (with `revive: true` for the revive question), `clash/result`, `clash/records/best`. No new database rules were needed.
- End-to-end: `MODE=ta N=12 node scripts/e2e/boss.cjs`, `MODE=hs N=1 ACC=0.3 node scripts/e2e/boss.cjs` (one weak player: tests fainting and the revive).

### Data in Firebase (Realtime Database)
`game` (status, mode, countdown, winners, event boxes) · `players` · `tokens` (who has which piece) · `questions` (host only) · `state` (Snake & Ladder per player) · `private` and `used` (host only: correct answers, used questions, race snapshot) · `answers` (each phone writes its own) · `feed` · `kart/me`, `kart/q`, `kart/pos`, `kart/input` (phones write their own steering), `kart/results`.

## Important when changing things

- **Security rules:** `database.rules.json` is not deployed automatically. After any change, paste the whole file into Firebase console → Realtime Database → Rules → Publish. The last change (adding `kart`) must be pasted before Quality Cart steering works. Confirm with the owner that this was done.
- **Questions:** stored in the database. The first projector visit loads the 63 defaults from `src/lib/defaultQuestions.ts`. The host can switch questions on/off, edit, add or restore them with the **Questions** button (lobby only).
- Firebase drops empty lists when saving; `fixState`/`fixStates` in `src/lib/types.ts` fill them back in. Keep this in mind for new fields.
- A Firebase multi-path update cannot contain a path and its own child (e.g. `state` and `state/uid`); the engines avoid this.

## Testing

```bash
npm install
```

```bash
npm test
```

Runs 17 Snake & Ladder rule checks and 9 Quality Cart race checks (including a simulated 20-cart race).

End-to-end tests use the local Firebase emulator (needs Java) and Playwright:

```bash
npx firebase-tools emulators:start --only auth,database --project demo-qsl
```

```bash
npm run dev:emu
```

```bash
node scripts/e2e/snake.cjs
```

Also `scripts/e2e/snake-20-players.cjs` and `scripts/e2e/cart.cjs`. They clear the emulator database, create host PIN `2468`, join phones, play a full game and save screenshots to `scripts/e2e/shots/`. In a network-restricted sandbox, start the emulator with proxy variables unset so it can load its own rules.

## State at handover

Done and pushed: everything above. All checks passed and full emulator games ran without errors for both games (Snake & Ladder with 3 and 20 phones, Quality Cart with 6 phones).

Not yet done / to confirm with the owner:
1. **Paste the latest security rules** into Firebase (needed for Quality Cart).
2. **Real-phone test of Quality Cart:** tilt was only tested with simulated signals. Check steering sensitivity (`/ 25` in `useTilt` and `STEER_RATE` in `sim.ts`/`Chase3D.tsx`), the iPhone permission button, and whether the driver's view should be larger (e.g. landscape).
3. **Question review:** load the owner's keep/drop/edit choices from the review artifact into `defaultQuestions.ts` (or the database), and have them check the Malay wording.
4. Optional ideas raised: more winners for big groups (`MAX_WINNERS` in `src/lib/engine.ts`), a random snake/ladder layout per game, 16-bit look/chiptune music, other games (Spot the Defect, Quality Bingo, Horse Race).

Owner preferences learned in this session: wants to discuss and align before building; answers often in short numbered lists; prefers simple, bold, readable screens for a projector; English on top with Malay underneath.
