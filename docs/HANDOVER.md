# Handover: Quality Month Games

Written at the end of the first build session (18 Nov 2026). It covers this repository only.

## What this is

A web app with two live, projector-based games for Quality Month 2026. Players scan a QR code on the projector, type their name and pick a piece, then play on their phones while the projector shows the shared game.

| Game | Phone | Projector |
|---|---|---|
| **Snake & Ladder** (Ular & Tangga) | Answer questions, see dice and moves | 100-box board, all pieces, latest roll, live feed |
| **Quality Cart** (Kart Kualiti) | Tilt to steer, use items, answer pop-up questions, 16-bit driver's view | Top-down race track with all carts, positions, live feed |

The host chooses the game in the projector lobby. Everything is bilingual: English on top, Malay underneath.

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
