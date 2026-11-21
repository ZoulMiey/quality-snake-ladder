# Handover: Quality Month Games

Last updated **21 Nov 2026, end of the fifth session**. It covers this repository only. Read it fully before changing anything.

## Starting a new session

- **Best: start the session with only `ZoulMiey/quality-snake-ladder` as its repository.** Do not add the FG repository (`ZoulMiey/FG`, the FG Tracker): it is a separate project and is not needed here.
- If a session was started with the wrong repository (the third session was started with only FG), the owner can ask Claude to attach this one. Attaching it with **push** access worked (after the owner asked for it explicitly); clone it to `/home/user/quality-snake-ladder` and push to the live branch from there.
- Read "Working with the owner" and "Open items" first, then ask the owner what to do next.

## History, session by session

1. **First session:** Snake & Ladder, the lobby, the host PIN, the question bank (63 Quality questions).
2. **Second session:** Quality Cart, Quality Clash (Single 1 v 1, Team 3 v 3, Boss Raid), question sets (+343 questions), lobby redesign.
3. **Third session (19 Nov 2026):** game-by-game polish.
   - Question review: both review pages checked; **nothing saved to apply**.
   - Snake & Ladder: phone shows the **full board**; full-screen alerts (get ready, snake, ladder, safe, correct, wrong); zoomed moves; **16 event boxes** with **themed events per question set** (80 events); **winners = players − 1 (max 5)**; distinct **vibrations** + shake/flash.
   - Quality Cart: phone **held sideways, full screen, "32-bit smooth" look**; countryside + factory scenery; dashboard; **answers at the thumbs**; "QUESTION IN 3, 2, 1"; **SUPER TURBO**; 8 rows of Q boxes; circuit **"Factory Block"** (picked from 10 drafts).
   - Owner on real phones: Snake & Ladder "all good"; Quality Cart "so far all good".
4. **Fourth session (19–20 Nov 2026):**
   - Status check: Quality Cart latest changes "all good for now"; Quality Clash "KIV, so far all good"; question review KIV; Malay wording of the event boxes "all good".
   - **Projector effects for snake & ladder moments** (picked from 5 drafts): spotlight for 1–8 players, glow + side-panel cards for 9+. Not yet checked by the owner on the real projector.
   - **Step 1 of 3: up to 50 players + random pieces** (all games). Players type only their name; at Start everyone gets a different random piece. Per-game limits. Projector lists only 15 names.
   - **Step 2 of 3: new game Fishing Derby, open play.** Built, then tweaked twice after the owner's real-phone tests: first the 3D phone camera (closer, then fixed and lower), then the owner picked a **side view ("cartoon cutaway")** that replaced the 3D view; then catch labels, boat in the middle, frenzy countdown and last-10-seconds countdown. Owner's last test: "all good, but need some tweaks" → tweaks done and pushed (20 Nov), **not yet re-tested by the owner**.
   - **Step 3 of 3 (agreed, not started):** check each game with 30–50 players, add **Quality Clash 5 v 5**, raise Boss Raid to **30 raiders** (re-tune with a simulation).
   - Owner asked how names are remembered: the name box is filled from the phone's own browser storage (`localStorage` key `qsl-name`, set in `Join.tsx`), not from Firebase. Offered to turn it off; owner did not ask for it.

5. **Fifth session (20 Nov 2026): new game Pull the Rope (Tarik Tali).**
   - Discussed rules with the owner (numbered answers), then drafts: projector (2 top views, 2 side views) → owner picked **B2 river crossing, with a wider river**; phone (3 over-the-shoulder cameras) → **P2 high behind the team**; characters (5 styles) → **wooden peg dolls**.
   - Simulation shown to the owner before building (pull strength scaled by players; table in "Pull the Rope" below). Owner: "yes. build".
   - Built, tested on the emulator with 8 and 50 phones, pushed live.
   - Owner's first test → tweaks (done, pushed): **READY button between rounds** (everyone ready → 5-second countdown → "ROUND 2!"; host "Start round now" for missing phones), **HEAVE! every minute for 30 s** (was 10 s). Owner asked for new **phone camera drafts** ("from behind, from shoulder"): draft `https://claude.ai/artifact/Lgum79xpfXb8EKWPccE3d9` (A right behind you, B over your shoulder, C behind a little higher, D low wide). Owner picked **C, moved a little to the side** "so the player can see the opponent (splash into river)" → built and pushed (replaces P2).
   - Owner's 1 v 1 test (projector and two "phones" as browser windows on one computer) → 2 bugs, fixed and pushed: (1) "it hang, no question appear… until HEAVE time": not reproducible with the projector on screen (4 min of 1 v 1, no stall); most likely Chrome slowing the hidden projector page's timers to once a minute. **All six engines now tick through a Web Worker** (`src/lib/ticker.ts`, `startTicker`), which hidden pages do not slow down. (2) Blue player saw no river: with the side camera the river's far corners were behind the camera and the whole shape was skipped; ground shapes are now cut at the camera (`quad` in `phone3d.ts`). **Not yet re-tested by the owner**; Claude asked whether the projector window was hidden during the test (no answer yet).
   - **All games, end screen:** three buttons **Play again / New game / Change game** (Change game asks "same players / new players"); the header's "New game" is hidden on the end screen. See "End of every game".
   - **Lobby previews:** every game's preview now plays a short gameplay loop; the chosen game's page shows a **big** preview with a description; **phones** show the preview in their lobby card (cycling through all games before the host picks).
   - Everything above is pushed live; the owner has not re-tested the last four changes yet (READY/HEAVE already tested once, then camera, bug fixes, end buttons, previews).

## What this is

A web app with live, projector-based quiz games for Quality Month 2026. Players scan a QR code on the projector, type their name, and play on their phones while the projector shows the shared game. Everything is bilingual: **English on top, Malay underneath**.

| Game | Phone | Projector |
|---|---|---|
| **Snake & Ladder** (Ular & Tangga) | Full board with all pieces; question card pops up over the bottom; piece moves on the board; full-screen alerts | 100-box board, all pieces, snake/ladder spotlight or glow + cards, latest roll, top 15, live feed |
| **Quality Cart** (Kart Kualiti) | Held sideways, full screen: smooth driver's view, tilt to steer, items, questions at the thumbs | Top-down "Factory Block" circuit with all carts, top 15 positions, live feed |
| **Quality Clash** (Pertempuran Kualiti) | Pick a side and monster(s), answer to attack; full 16-bit arena from the player's own side | 16-bit battle arena: **Single 1 v 1**, **Team 3 v 3**, or **Boss Raid** against the Defect Titan |
| **Fishing Derby** (Pertandingan Memancing) | Side view: your boat on the surface, fish under the water; a fish bites and is reeled into your boat; question card at the bottom | Cartoon pond with every boat, catches, zoom or notice cards, clock, frenzy, top 15 |
| **Pull the Rope** (Tarik Tali) | Camera behind and above you, moved to one side so you see past your team to the other team; question card at the bottom; PULL! / WRONG / HEAVE! / round result | Side view of a river crossing: Red and Blue peg dolls pulling, players slip into the river with a SPLASH, score, MVP list, feed |

## Where things are

| What | Where |
|---|---|
| Code | GitHub `ZoulMiey/quality-snake-ladder` |
| Live branch | `claude/eloquent-allen-cekztv` (default branch; **every push deploys to Vercel**) |
| Work branch | Fifth session: `claude/sleepy-edison-q31w24`, pushed to the live branch after each tested change (owner's standing instruction: live after testing). Both are on the same commit at the end of the session. Older: `claude/determined-franklin-aibcmp` (fourth), `claude/new-session-r5myv3` (second, behind). A new session gets its own work branch name: push it, then push the same commit to the live branch (fast-forward). |
| Live site | `https://quality-snake-ladder.vercel.app` (`/` = projector, `/join` = phones) |
| Database and login | Firebase project `quality-snake-ladder` (Realtime Database, Singapore, Anonymous sign-in). **Blaze plan, but the owner wants to spend nothing** (hence the 50-player limit). Separate from the FG Tracker on purpose. Web settings in `src/lib/firebase.ts` (not secret; the security rules protect the data). |
| Question review pages | New sets: `https://claude.ai/artifact/8tjZ3iFsHVqQ7GYNjWUcWb`; original 63: `https://claude.ai/artifact/NeXwos6p8Q56VtvzrQRVsN`. Both hold no choices to apply (checked 19 Nov). |

**Design drafts shown to the owner** (all claude.ai artifacts):

| Draft | Link | Owner's pick |
|---|---|---|
| Quality Clash | `https://claude.ai/artifact/MsKWky43BaatKzXceNy7Uh` | built |
| Boss Raid | `https://claude.ai/artifact/RBEvDFjp5RZJQURPZzyMFC` | built |
| Snake & Ladder phone board | `https://claude.ai/artifact/N45T6TBJXmJvBo6uCkg6Ho` | built |
| Quality Cart sideways view (8-bit … 32-bit) | `https://claude.ai/artifact/Pr87rRCqaR24r59AZvcaxs` | 32-bit smooth |
| Quality Cart circuits (10) | `https://claude.ai/artifact/LJCAkaK66ToqxFBQ3pxeFx` | Factory Block |
| Snake & Ladder projector moments (5 options) | `https://claude.ai/artifact/6xNL7kT8ZfdQN5Dxq5cHqc` | 1–8 players C spotlight, 9+ A glow + B cards |
| Fishing Derby (rules, projector, first phone) | `https://claude.ai/artifact/ULUpjtsYfFVsYN2chpj1Ah` | projector as drawn |
| Fishing Derby 3D phone (3 cameras) | `https://claude.ai/artifact/BemgFLNobDesu7PfzxprQq` | camera A (later replaced) |
| Fishing Derby side view (A cartoon / B 3D aquarium) | `https://claude.ai/artifact/VUt4haXB4DsLVBd9Av9G3t` | **A cartoon cutaway** (live) |
| Pull the Rope first draft (4 projector views, 3 phones; now shows the picks B2 wider river + P2) | `https://claude.ai/artifact/RLvgyFjDMdjX5ZmychENwp` | projector **B2 river**, phone **P2** (built) |
| Pull the Rope phone cameras (A–D) | `https://claude.ai/artifact/Lgum79xpfXb8EKWPccE3d9` | **C**, moved to the side (built) |
| Pull the Rope characters (5 styles) | `https://claude.ai/artifact/CN6FXNQsQbSJseefWpXHeQ` | **5 wooden peg dolls** (built) |

## How it works

- **No server.** The projector window is the referee: it runs the game engine in the browser, gives out questions, checks answers, moves pieces/carts/monsters/fish and writes results to Firebase. Phones only write their own name, picks, answers and steering.
- **Host PIN.** The first visit to `/` creates a host PIN; other computers need the PIN to open the projector. `secret/pin` is never readable.
- **Reloading the projector** during a game resumes it (the window remembers it is the referee via `sessionStorage`; engines keep a snapshot in `private/`). Another window can take over with "Run it from this window".
- **Players and pieces (fourth session):** up to **50 players** (`MAX_PLAYERS` = 50 pieces in `src/lib/tokens.ts`, all emoji from 2018 or earlier). Phones join with a **name only** (`token: ""`); the 51st phone sees "The game is full (50 players)". When the host presses **Start**, `start()` in `Screen.tsx` gives every player a **different random piece** (`assignPieces`; players who already have one keep it, so **"Play again" keeps the pieces**), then starts the engine. The phone countdown shows "You are / Anda ialah 🦊 Fox" (`you` prop of `Countdown`). Before Start, the phone lobby shows a ❔ and "Your piece is given at random when the game starts". The `tokens/` database node is no longer used (rules unchanged).
- **Per-game limits** (`gameMaxPlayers` in `tokens.ts`): Snake & Ladder 50, Fishing Derby 50, Pull the Rope 50, Clash 1 v 1 50 (2 fight, the rest watch), **Quality Cart 30**, **Clash Team 30**, **Boss Raid 30** (but `MAX_RAIDERS` is still 20 until Step 3). Too many players: Start is blocked with "Quality Cart: max 30 players (45 joined). Remove players or pick another game."
- **Top 15 on the projector:** the lobby lists the 15 players who joined last, with "+ 35 more" and a "50/50" counter; in-game lists show the top 15 (Snake & Ladder, Quality Cart, Fishing Derby) with "+ N more".
- **Game page in the lobby = one screen, no scrolling (sixth session; owner's pick B2 from `https://claude.ai/artifact/TTUQ7tec5tgqpMhsWjYTM1`, then tweaked):** top row: **QR** (as big as its column allows, no white card, only the white edge the code needs; `container-type: size`) | **preview, name, description, Change game + Start game**, warnings (QR and preview tops aligned) | **Questions / Game mode / How to play** with dividers. Bottom strip across the screen: **Players** — Red team left, Blue team right (Clash, Pull the Rope; chips with → / ← and ×), raiders for Boss Raid, or the player list (last 15 + "+ N more"). The page is laid out at its natural size and the **whole page is scaled (CSS `zoom`, 0.5–1.8) to fill the screen exactly** (owner: no blank space in full screen): `useFitZoom` in `Screen.tsx` binary-searches the biggest zoom whose `scrollHeight × zoom` fits `.lobby-fitbox`, and refits when players join/leave or the window resizes (not below 1100 px wide). Typical zoom: 1.2–1.5 at 1920×1080, 0.8–1.0 at 1280×720. Styles: `.lobby-fitbox`, `.lobby-game`, `.gd-mid`, `.gd-right`, `.gd-players` at the end of `styles.css`. The **game list** page (no game picked) is unchanged; the owner will tweak it next.
- **Lobby (projector):** big QR code on the left; on the right, game cards with **moving preview loops** (`src/components/GamePreview.tsx`, owner's tweak: pieces hop and take ladders/snakes, carts race, monsters hit the Titan, fish leap into boats, the rope swings and a player splashes in). Picking a game shows a **big** preview (`big` prop, 4× pixels) next to the name, a one-line description and "Change game". **Phones** show the chosen game's preview in their lobby card too (`LobbyPreview` in `Join.tsx`; for Pull the Rope and Clash it sits under the side/monster picker); before the host picks, they cycle through all games every 4 s ("Games today"). The game's page also has the **question set** picker, the game's options (Clash modes; Fishing mode: **Open play**, Teams "coming soon"), the players, the rules tiles and **Start game**. "New game" keeps the picked game and set.
- **Question sets:** each question has a `set`: `quality`, `world`, `logo`, `malaysia` or `general` (missing = quality). The host picks Quality · World · Logo · Malaysia · General Knowledge · **Mix** (= all except Quality); saved as `game.qset`; engines ask only switched-on questions from that set (`poolFor` in `src/lib/questionSets.ts`). Start is blocked if the set has none switched on.
- **Names on phones:** the join form is pre-filled from the phone's own browser storage (`qsl-name`), not from Firebase. Firebase keeps names only for the current game (`players/`), cleared by "New game".

## The games

### Snake & Ladder
- 5-second "Get ready" countdown; 30 s per question, beep/vibration in the last 5.
- Right = roll 1 dice; 5 right in a row = 2 dice (count restarts). Wrong/timeout = no roll + 5 s penalty, right answer shown.
- Snake head: right = stay, wrong = slide. Ladder foot: right = climb, wrong = stay.
- **16 random event boxes** per game (6–90, never on a snake/ladder end, at least 3 apart). Each question set has its own 16 events, 8 good and 8 bad (`EVENT_SETS` in `src/lib/specials.ts`). Mix = 8 good + 8 bad from all sets except Quality. Malay wording checked by the owner: all good.
- Box 100 finishes. The game ends when **players − 1** have finished, at most 5 (`winnersNeeded` in `src/lib/rules.ts`). A winner whose win ends the game still sees their last move and the trophy screen.
- **Phone = full board** (canvas, every piece; own piece big with a yellow YOU arrow). Question card pops up over the bottom with a "🗺 Board" button. Full-screen alerts: get ready, WRONG / TIME'S UP (with the right answer), SNAKE! / LADDER!, SAFE! / CORRECT!, LUCKY BOX! / OH NO!. Zoom in on moves, zoom out after.
- **Vibration + shake** (`HAPTIC` in `SnakePhone.tsx`): snake = three long buzzes, ladder = quick taps, lucky box = two short taps, bad box = one long buzz, wrong = one buzz. Android only; iPhones get the shake + flash.
- Timings in `src/lib/phoneTiming.ts`, shared by referee and phone (a right-answer turn ~4–6 s; snake/ladder question timer starts after the 2 s alert; wrong answers 5 s).
- **Projector snake & ladder moments** (`src/lib/moments.ts`; owner's pick): **1–8 players = spotlight** (board darkens except an ellipse around that snake/ladder, label "SNAKE! / ULAR! · name · Box · 24s", then the result SAFE! / SLIDE! 94 → 56 / CLIMB! / NO CLIMB; several spotlights at once). **9+ players = glow + side cards** (the snake/ladder glows, "SNAKE! / ULAR!" pops up, then the result word, then "−38" / "+22"; alert cards at the top of the side panel, newest first, max 3). In both, the piece **slides along the snake's body** or **climbs rung by rung** with a trail, after the phone's 2 s verdict, in step with the phone. Answer times are recorded during render by `useVerdicts` in `Screen.tsx` so the piece never starts its old straight move. Drawing in `Board.tsx` (`moments`, `spotlight` props); cards: `MomentCards` in `Screen.tsx`.
- Files: board `src/lib/board.ts`, event boxes `src/lib/specials.ts`, rules `src/lib/rules.ts`, referee `src/lib/engine.ts`, phone `src/pages/SnakePhone.tsx` + `src/components/PhoneBoard.tsx`, projector `src/pages/Screen.tsx` + `src/components/Board.tsx`. Join/lobby on phones: `src/pages/Join.tsx`.

### Quality Cart (max 30 players)
- Tilt the phone to steer (or hold ◀ ▶); carts drive forward by themselves. iPhones need a one-time "Turn on tilt steering" tap.
- Questions every 6–12 s (12 s to answer), each announced by "QUESTION IN 3, 2, 1": right = turbo, wrong = slow down. **3 right in a row = SUPER TURBO** (4 s at ×1.9). Q boxes (8 rows a lap) give items (PPE Shield, Kaizen Turbo, Oil spill, Audit). Cones/potholes spin out; out-of-spec zones slow down.
- Circuit **"Factory Block"** (control points in `src/kart/track.ts`; the other 9 circuits are in the circuits draft). 3 laps (~2½–3 min); ends when all finish or 60 s after the winner.
- **Phone held sideways, full screen, "32-bit smooth"** (canvas 540 px high). Dashboard: position + lap, race time + best lap, item box, speedometer, ◀ ▶. Questions: card at the top, answers at the thumbs. Held upright: "Turn your phone sideways" screen.
- Limited to 30 because cart positions go to every phone ~6 times a second (data cost grows fast with players).
- Files: `src/kart/` (track, sim, engine, KartView, KartPhone, Chase3D = race view, pixel art).

### Quality Clash (shared by all three modes)
- **15 equal monsters** (`src/clash/creatures.ts`, pixel art `src/clash/sprites.ts`), called "monster / raksasa" on screen (the code says creatures). 5 types set colours and attack animation only; **no type advantage**.
- Each fighter has their own question stream (15 s). **FAST** (within 3 s) = +25%. **5 right in a row = super move ×2**. Wrong/timeout = stunned 3 s, right answer shown.
- Phones show the **full arena from the player's own side** with the question card popping up over the bottom.
- **No time limit**; ends when one side is out. Host "End game" early: more HP (+ shield) wins.

**Single 1 v 1 and Team 3 v 3 / 5 v 5** (1 v 1: 2 fight, up to 50 in the room; Team: max 30 players, 3 v 3 or 5 v 5 fight, the rest watch)
- **Team size (sixth session):** the host picks **3 v 3 or 5 v 5** under the Team card (`game.clashSize`, default 3; `lineUp(format, picks, size)`, `Battle.size`). Players pick a side + monster on the phone; the first 3/5 on each side fight. **Host arrows (owner: like Pull the Rope):** → / ← on each fighter in the projector roster moves them to the other team; watchers (team full or nothing picked) have ← / → chips to put them on Red / Blue. A moved player keeps their monster (or gets the first free one) and their place in the queue (`moveTo` in `ClashLobby.tsx`); the phone follows the move.
- 300 HP per monster. A side's attack power is **60** (1 v 1, 3 v 3) or **110 in 5 v 5** (`POWER_5V5`, `powerOf`; owner wanted 5 v 5 to end within 5 min: with 60 the team shield made 5 v 5 last ~12 min; with 110 ~3.6 min, longest ~4.2 min, better team wins ~95%), shared by its monsters still standing. Every hit goes to a random opponent monster.
- 1 v 1: each player has 3 monsters. Team: one monster per player; works 1 v 1 to 3 v 3. Team only: every 5 right answers = **+50 shield** for the teammate with the lowest HP.
- Simulated length: Team 3 v 3 ~4 min (longest ~5.2), 5 v 5 ~3.6 min, 1 v 1 ~2.5 min.
- Arena with 4–5 a side: monsters and platforms shrink (`shrink` in `ClashView.tsx`), HP boxes share the row evenly in a compact form (player name, streak dots, HP bar).
- Files: `src/clash/sim.ts`, `engine.ts`, `ClashView.tsx`, `ClashLobby.tsx`, `ClashPhone.tsx`.

**Boss Raid (Defect Titan / Gergasi Kecacatan)** (max 30 players; raiders still capped at 20 = `MAX_RAIDERS`)
- Phones pick a monster (duplicates allowed). Host picks **Time Attack** or **High Score**.
- n players: Titan HP 700 + 600 per extra player; each monster 300 + 200 per extra; stomp 11 + 9.8 per extra.
- Right answer = 50 to the Titan (FAST 63, super 100, both 125). Every 8 s the Titan stomps everyone after a 3 s warning. **Counter-stomp** each time it loses another 10% HP. **ENRAGED at 30% HP** (shield of 10% HP, stomps 30% harder). One **revive question** per raid per monster.
- Time Attack: best time today (`clash/records/best`, kept until "Clear records"). High Score: damage points, podium top 3.
- Balance (simulated): Titan wins ~1 raid in 3; raids ~2.5–2.7 min. Owner's solo test: won in 1:01 with ~50–60% HP; owner kept the setting.
- Files: `src/clash/boss.ts`, `bossEngine.ts`, `raidDraw.ts`, `RaidView.tsx`, `RaidPhone.tsx`, `titan.ts`.

### Fishing Derby (Pertandingan Memancing): open play (built 19–20 Nov 2026)
**Rules** (`src/fish/rules.ts`)
- Modes: **Open play** (built); **Teams** later ("coming soon" in the lobby). Up to 50 players.
- **5:00 minutes**, **20 s per question**. Everyone vs everyone. No late joining. Host pause freezes the clock.
- Every right answer = a fish 1–6 kg (Tilapia, Keli, Lampam, Sepat, Puyu). **3 right in a row = BIG FISH** 10–18 kg (Toman, Patin, Kelah). **5 right in a row = SUPER BIG GOLDEN FISH** 30–45 kg (Kelisa Emas), then the row count restarts. No speed bonus.
- Wrong or time out = **line snaps**: right answer shown, wait 5 s, row count 0.
- **Fishing Frenzy** at 1:00, 2:00, 3:00, 4:00 for **30 s**: every fish weighs ×2. A **5-second "FRENZY IN 5…1" countdown** comes before each one.
- **Last 10 seconds count down** (phones and projector, with ticks).
- Winner = heaviest **total** catch (tie: more right answers). Podium top 3 + shout-outs **Biggest single fish** and **Most golden fish**, then the end buttons.
- Result times (`RESULT_MS`): fish 2.6 s, BIG 4.0 s, GOLDEN 4.2 s, snap 5 s.
- Simulation (5 min): weak 50% right ≈ 95 kg, average 70% ≈ 210 kg, strong 90% ≈ 520 kg, expert ≈ 925 kg.

**Projector** (`src/fish/FishView.tsx`, drawing in `src/fish/pond2d.ts`)
- Bright cartoon pond (like Snake & Ladder) with every boat around the edge, in joining order (`boatOrder`); two rings and no name tags above 24 players.
- Small catches: splash, fish leaps into the boat, "+3.4 kg". **1–8 players:** BIG/GOLDEN zoom in on that boat with a banner. **9+ players:** pop-up over the boat + notice cards in the side panel (max 3).
- ⏱ clock + "Next frenzy in 0:42"; frenzy banner; big purple "FISHING FRENZY IN 5" and big red "Time's almost up! 10" boxes; top 15 by kg; live feed.
- Sounds (`src/lib/sound.ts`): splash, reel, big fish, golden chime, snap, frenzy jingle, countdown beeps.

**Phone** (`src/fish/FishPhone.tsx`, side view in `src/fish/pondSide.ts`)
- **Side view, "cartoon cutaway"** (owner's pick, replaced the earlier 3D view; three.js was removed). Your boat floats on the surface **in the middle of the area above the question card**, your two neighbours (players before/after you in `boatOrder`) at the edges. Under the water: sunlight rays, bubbles, seaweed, fish swimming around your hook; bigger fish deep under the card. **The view never moves** (owner did not want zooms).
- Right answer: a fish swims to the hook, bites ("!"), is reeled up and flips into your boat (`SIDE_BEATS`). A big label **"🐟 Keli +2.5 kg"** shows at the top of the pond and the kg in the top bar flashes.
- **BIG / GOLDEN:** the alert shows as a **card in the bottom half at the same time** as the catch (owner: alert first, then catch, took too long). The big fish rises from the deep and fights before landing.
- **Wrong:** full-screen **SNAP! alert straight away** with the right answer (owner: no bite animation, it took too long); then no line for the rest of the 5 s.
- Frenzy: 2 s full-screen alert, then brighter water and a school of fish around the hook, plus a "🌀 ×2 · 12s" pill. The clock always stays in the top bar.
- Countdown pills (slim, above the boat): "🌀 FRENZY IN 5" (purple) and the last 10 s (red; the top-bar clock turns red too). `FRENZY_WARN_MS`, `FINAL_MS` in `FishPhone.tsx`.
- Top bar: "#rank name", kg, clock. Streak dots (3rd = BIG, 5th = GOLDEN). "Get this right for a BIG FISH / GOLDEN FISH!" on the question card.
- Vibration: fish = short tap, big = quick taps, golden = long celebration, snap = long buzz + shake, frenzy = two taps. End screen: rank, kg, fish counts, biggest fish, Exit.

**How it is built**
- Referee `src/fish/engine.ts` (`FishEngine`, same pattern as Snake & Ladder). It reuses `state/{uid}` (a `FishState`), `private`, `used`, `answers` and `feed`, plus `game.endsAt` / `game.ranks` / `game.fishMode`: **no rules change was needed**.
- The feed is written one item at a time (`feed/{n}`, last 12 kept) so phones only download new items; feed items carry `k` (fish/big/gold/snap/frenzy), `kg`, `name`, which phones use for the neighbours' catches. The database then returns the feed as a list with gaps; `Screen.tsx` filters them out.
- `game.ranks` (everyone's place) is refreshed every 3 s for the phones' "#rank". Pause moves `endsAt`.

### Pull the Rope (Tarik Tali): built 20 Nov 2026
**Rules** (`src/rope/rules.ts`; owner's answers in the fifth session)
- Two teams, **Red and Blue**. Players **pick a side on the phone** in the lobby (they can talk it over first); the **host can move anyone** to the other side on the projector (→ / ← buttons). Players who did not pick join the smaller team at Start. Start needs at least 1 player per side. Up to 50 players, no joining mid-game.
- Everyone answers their own questions (**15 s**). Right = your team pulls. Wrong / time out = no pull, right answer shown, **wait 3 s**. After a right answer a 1 s "PULL!" before the next question.
- **Pull** = 0.3 × √(total players ÷ 24) ÷ (players in your team). Shared by team size, so **4 v 2 is fair** (owner's question); scaled by players so rounds last about as long with 2 or 50 players. **FAST** (right within 3 s, +0.3 s network allowance) ×1.25 · **POWER PULL** (every 3rd right answer in a row) ×2 · **HEAVE!** every minute (1:00 and 2:00) for **30 s** ×2 (owner's tweak; 5 s "HEAVE IN 5…1" countdown first).
- The centre flag goes from 0 to ±1. **Flag reaches your bank = you win the round**; otherwise the flag's side at **3:00** (tie: more right answers this round; still tied = draw, which adds a round, max 5). **Best of 3** (same teams, same sides).
- **Between rounds (owner's tweak):** the result shows and every phone gets a **READY** button. When everyone still in the game is ready → **5-second countdown, then "ROUND 2!" (1.5 s)**, then play (`READY_COUNT_MS`, `ROUND_BANNER_MS`). The projector shows "11 / 12 ready", who it is waiting for, and a host button **"▶ Start round now"** (only in the window running the game). A phone says ready by writing `answers/{uid} = {qid: "ready", choice: round}` (`READY_QID`), so no rules change; the engine keeps `game.rope.ready` and sets `breakUntil` when the countdown starts.
- End: winning team, **MVP = most right answers** (tie: faster fastest answer), best player on each team, fastest answer, longest streak, then the end buttons ("Play again" keeps the teams).
- Simulation (`npm test`, 1,500 rounds each) with the 30 s HEAVE!: even 12 v 12 → ~52% of rounds reach a bank (~1:53), 50/50; 70% v 80% right → ~85% reach a bank (~1:19), better team wins 94%; 25 v 25 70% v 80% → 96% (~1:10), 99%; 4 v 2 and 20 v 10 at the same skill → ~50/50; 1 v 1 ~1:48. (With the first 10 s HEAVE! it was ~35% / ~2:00 for even teams.)

**Projector** (`src/rope/RopeView.tsx`, drawing in `src/rope/scene.ts`)
- Side view (owner's B2, river ~⅓ of the width). Peg dolls (owner's pick 5) in team colour with their piece on the belly; 1 row up to 8 per side, 2 rows up to 16, 3 rows above (25 a side). Names hidden above 24 players.
- As the flag moves, the losing side's front players slide into the river (**SPLASH!** + drops + sound), waist-deep, still holding on; they climb out if the rope swings back. The winning side only steps back 30% of the way so it stays in view.
- Round end: the whole losing team is **dragged into the river one after another**, winners cheer; banner "BLUE WINS ROUND 1! · BIRU MENANG PUSINGAN 1!" with the score, "11 / 12 ready", who it is waiting for and "▶ Start round now"; then a big 5…1 and "ROUND 2!".
- HUD: clock, round, "HEAVE! in 0:42"; big orange "HEAVE IN 5" and red "Round almost over! 10"; orange sky + banner during HEAVE!. Side panel: best-of-3 score with players and right answers per team, top 15 by right answers (MVP list), live feed (power pulls, HEAVE!, rounds).

**Phone** (`src/rope/RopePhone.tsx`, 3D view in `src/rope/phone3d.ts`)
- Owner's **C, moved to the side** (replaced the first pick P2): camera 2.9 behind, 2.5 up and 1.3 to the side of you (`CAM_OFF`, `CAM_TGT`, `LENS`, `HORIZON` in `phone3d.ts`), fixed (no zoom; the field slides as the rope moves). Your team forms a diagonal line and the other team shows beside it, so their splashes are visible. The rope behind you is not drawn. Your team is always on your side of the screen; YOU · ANDA arrow. Teammates standing between you and the camera are left out (they would block the view). Peg dolls as flat cut-outs; your team from behind (piece on the back), the other team from the front.
- Top bar: team chip, flag meter, clock. POWER dots (3rd = power pull). Toast "💪 PULL! TARIK! ⚡ FAST / ×2 / HEAVE ×2". WRONG / TIME'S UP card with the right answer (2.4 s of the 3 s wait). HEAVE! 1.5 s flash then an orange pill; countdown pills. Round break card (won / SPLASH! / draw, score, **READY** button, "3 / 12 ready"); then a full-screen 5…1 and "ROUND 2!". Countdown shows "Your team: RED · MERAH". End screen: result, score, right answers, fastest, streak, MVP.
- Vibration (Android): pull tap, power quick taps, wrong long buzz, heave three taps, round won / lost.

**How it is built**
- Referee `src/rope/engine.ts` (`RopeEngine`, same pattern as Fishing). Reuses `state/{uid}` (a `RopeState`), `private`, `used`, `answers`, `feed`, plus **`game.rope`** (round, wins, phase play/break/done, endsAt, breakUntil, last, right, champion, teams, order) and **`game.ropeX`** (the flag, written at most 4×/s when it moves). `fixRope` / `fixRopeState` fill dropped values back in.
- **Sides are stored in `clash/pick/{uid}` = `{side, c: ["rope"], at}`**, the same place as Quality Clash teams, so **no rules change was needed** (Clash ignores the "rope" monster). "New game" clears them, "Play again" keeps them; players auto-assigned at Start are written there too.
- Phones read only their own state, the game and the feed (not everyone's state), to keep downloads small with 50 phones. Other players' power pulls reach phones through the feed (`k: "power"`).

## Questions

- Stored in the database (`questions`), managed with the **Questions** button in the lobby: set tabs, switch on/off, edit (with a **Set** field), add, delete, "Switch all on" per set, "Restore original questions" (all 406 defaults).
- Defaults: 63 Quality in `src/lib/defaultQuestions.ts`; 343 in `src/lib/moreQuestions.ts` (Quality 80, World 80, Logo 84, Malaysia 82, General Knowledge 80 in total). Right answer listed first (`ans: 0`); options shuffled per player.
- World uses flag emoji; Logo questions describe logos in words (no images, no trademarks).
- An existing database received the 343 new questions once (flag `setup/qsetsAdded`); already ran on the live database.

## Data in Firebase (Realtime Database)

`game` (status, mode, qset, clashFormat, bossMode, fishMode, goAt, endsAt, ranks, winners, event boxes, rope, ropeX) · `players` (name, token = piece, joinedAt) · `questions` (host only) · `state` (Snake & Ladder, Fishing or Pull the Rope per-player state) · `private`, `used` (host only) · `answers` (each phone its own) · `feed` · `kart/*` · `clash/pick/{uid}` (phones, lobby only; also Pull the Rope sides) · `clash/b`, `clash/ev`, `clash/q/{uid}` (1 v 1 / Team) · `clash/raid`, `clash/rev`, `clash/result`, `clash/records/best` (Boss Raid) · `setup` (pinSet, qsetsAdded) · `tokens` (no longer used).

## End of every game (owner, Nov 2026)

Every game's end screen shows three buttons (`src/components/EndButtons.tsx`; the actions come from `Screen.tsx` through `EndActionsContext`):
- **Play again**: same game, same players (`playAgain`; pieces and Pull the Rope sides are kept).
- **New game**: same game, new players (asks "Yes, new players" first; `resetGame`, everyone scans again).
- **Change game**: back to the game list, then **with the same players** (`playAgain` + `game.mode = null`) or **with new players** (`resetGame` + `game.mode = null`).
The header's "New game" button is hidden on the end screen (it is in the screen now); it still shows in the lobby and during a game.

## Important when changing things

- **The projector page is the referee.** Engines tick through a Web Worker (`startTicker` in `src/lib/ticker.ts`) so a hidden or covered projector window does not freeze the game; keep using it for new engines. Sounds and animations still pause while the page is hidden.
- **Security rules** (`database.rules.json`) are **not deployed automatically**. After any change, the owner must paste the whole file into Firebase console → Realtime Database → Rules → Publish. The current file is already published. **The fourth and fifth sessions changed no rules** (random pieces use the host's existing right to write `players/*`; Fishing and Pull the Rope reuse existing paths: sides in `clash/pick`, READY in `answers`).
- Firebase drops empty lists/objects; `fixState` / `fixFishState` / `fixRopeState` / `fixRope` / `fixBoard` / `fixRaid` fill them back in. Keep this in mind for new fields.
- A Firebase multi-path update cannot contain a path and its own child; the engines avoid this.
- Engines write the whole `game` object on start: include new `game.*` fields there, or they get wiped. `LOBBY_GAME` in `src/lib/engine.ts` clears game fields on "New game" / "Play again".
- `resetGame` clears Clash paths one by one so `clash/records` survives "New game".
- Keep downloads small: with 50 phones, write small changes (e.g. one feed item) rather than rewriting big lists every second.
- `scripts/*.test.ts` run with Node's type stripping: no TypeScript-only syntax such as `constructor(private x)` in files they import.

## Testing

```bash
npm install
```

```bash
npm test
```

Runs 7 suites: Snake & Ladder rules (22, including phone timings, event boxes, winners, projector moments, 50 unique pieces and per-game limits), Quality Cart (11), Quality Clash (11), Boss Raid (10), questions (4), Fishing Derby (9: catch rules, frenzy windows, ranking, shout-outs, result times vs the side-view catch, simulation), Pull the Rope (14: timings, pull sharing, bonuses, HEAVE! windows, round and match winners, team filling, MVP, simulations).

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
- `node scripts/e2e/snake.cjs` and `snake-phone.cjs` (every phone screen; options `QSET`, `PLAYERS=1-3`, `ACC`). These do **not** clear the database first: start from a fresh emulator.
- `node scripts/e2e/snake-50-players.cjs` (50 phones: 51st refused, Quality Cart blocked above 30, lobby lists 15, "You are …" countdown, 50 unique pieces, ~90 s of play; options `N`, `SECS`). Clears the database first.
- `N=3 node scripts/e2e/snake-moments.cjs` (spotlight) and `N=12 …` (glow + cards). Clears the database first.
- `N=4 node scripts/e2e/fish.cjs` (zoom mode) and `N=12 ACC=0.75 node scripts/e2e/fish.cjs` (notice cards): a full 5-minute Fishing Derby, screenshots of every moment (question, catch label, BIG, leap, GOLDEN, snap, frenzy countdown, frenzy, last 10 s, podium, end screen). Clears the database first. Last runs passed with no errors.
- `node scripts/e2e/rope.cjs` (default 8 phones; `N=50 R1_SECS=20 …` for 50): side picking, the host moving a player, countdown, a full 3-round match (round 1 even until HEAVE!, round 2 won by the round-1 loser, round 3 by Blue), READY presses between rounds (after round 2 one phone does not press and the host uses "Start round now"), screenshots of every moment (question, PULL!, WRONG, HEAVE countdown and pill, river view, splash, round banner, READY, countdown, ROUND 2, podium, end screen). Clears the database first. Last runs passed with no errors.
- `node scripts/e2e/cart.cjs`; `node scripts/e2e/clash.cjs` and `MODE=solo …`; `MODE=ta N=12 node scripts/e2e/boss.cjs`, `MODE=hs N=1 ACC=0.3 …`.
- Sandbox notes: background servers stop after their time limit; restart when needed. To reset the emulator, stop it (`pkill -f "firebase-tools@14.27.0 emulators"`, `pkill -f firebase-database-emulator`) and start again; don't use a broad `pkill -f emulator` (it also stops `vite --mode emulator`). The first page load after installing/removing packages can be slow (Vite re-optimises): if a script times out waiting for the PIN field, run it again. Headless browsers report "AudioContext" errors (no sound card): the scripts ignore them.
- The sandbox cannot reach `vercel.app`, so a deploy can't be checked from here; ask the owner to open the live site.

## Working with the owner

- Wants to **discuss and align before building**; answers in short numbered lists. For bigger features, show a **draft artifact first**, preferably with **several options side by side** (they pick one), unless they say "just build it".
- When they say "build" / "start": build, test on the emulator, then **push to the live branch** (standing instruction: live after testing).
- Likes **simulations with numbers** to justify game balance; tests on real phones afterwards and sends screenshots with numbered tweaks.
- Often tests with the projector and "phones" as browser windows on one computer (hence the Web Worker clock).
- Prefers simple, bold, readable screens; bright cartoon for Snake & Ladder and Fishing Derby; 16-bit pixel style for Clash; "32-bit smooth" for Quality Cart; bilingual English/Malay everywhere.
- Dislikes waiting: shorten animations that delay play (e.g. BIG/GOLDEN alert and catch together, SNAP straight away). Dislikes the camera zooming/moving on the phone.
- Wants max **50 players** and **no Firebase cost**.
- Calls them **monsters** ("raksasa"), not creatures.

## Open items

1. **Pull the Rope, re-test on real phones** (all built and pushed, 20–21 Nov): READY between rounds, 30 s HEAVE!, the side camera (C moved to the side), the two fixes (no-river bug; questions stopping, worker clock), end buttons. Things to watch: whether questions still stop (if so: when, and was the projector window on screen?); the phone camera at the very front or back of a big team; the live feed fills with POWER PULL lines in a big game (offer: show fewer); balance with real groups (simulation numbers above).
2. **Lobby previews and end buttons (all games):** owner to check on the projector and phones. Offered: preview above the side/monster picker on phones for Pull the Rope / Clash; a bigger preview or a different moment per game.
3. **Fishing Derby, tweaks of 20 Nov to re-test on real phones:** catch label, boat in the middle, frenzy countdown, last 10 s countdown. Known small thing: a SNAP!/FRENZY full-screen alert (up to 2.4 s) covers the phone's countdown pill while it shows.
4. **Fishing Derby Teams mode:** after open play is final. Not designed yet: discuss first (team count, how teams are picked, scoring), then draft.
5. **Step 1 (50 players, random pieces) and the Snake & Ladder projector moments:** built, not yet checked by the owner on the real projector / with a big group.
6. **Step 3 (sixth session: Clash 5 v 5 built and pushed, not yet tested by the owner; Boss Raid 30 next, draft first; then the 30–50 player check):** check each game with 30–50 players (Snake & Ladder board crowding, projector lists); add **Quality Clash 5 v 5** (Team mode: 3 v 3 or 5 v 5, max 30 in the room, the rest watch; needs a balance simulation); raise **Boss Raid to 30 raiders** (`MAX_RAIDERS` in `src/clash/boss.ts`, re-tune HP/stomp with a simulation; target Titan wins 30–40%).
7. **Question review (owner: KIV):** if the owner reviews again, read `reviews` from the review pages (docs keyed by question id: `{d: "keep"|"drop"|"edit", q?: [en, ms], o?: [[en, ms] ×4, right first], set}`; unmarked = keep). The live database already holds the questions, so changes must be written **to the database** (e.g. a second one-time migration flag), not only to `moreQuestions.ts`.
8. **Quality Clash (owner: KIV, "so far all good"):** Boss Raid balance with real groups still unchecked. **Mini Tournament** (bracket style, "coming soon" in the lobby): on hold.
9. **Possible later:** circuit picker for Quality Cart (9 more circuits in the circuits draft); turning off the remembered name on phones (offered, not requested).
10. **Ideas discussed, not built:** cheer meter for watchers, revive in Team mode, MVP screen, Hall of Fame across the day, chiptune music and per-type attack sounds, host settings (e.g. HP 200/300/500), random snake/ladder layout, other games (Dragon Boat Race, Capture the Factory, Spot the Defect, Quality Bingo, Horse Race; Tug of War became Pull the Rope).
