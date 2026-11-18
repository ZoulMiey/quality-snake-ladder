# Quality Snake & Ladder

A live 100-box Snake & Ladder quiz game for Quality Month 2026. Everyone plays at the same time on their phones, and the board is shown on the projector.

## How it works

| Screen | Address | Who uses it |
|---|---|---|
| Projector + host controls | `https://<your-site>/` | The host. Protected by a host PIN. |
| Phone | `https://<your-site>/join` | Players. The QR code on the projector opens it. |

**Game rules**
- After Start, a 5-second "Get ready" countdown shows on the projector and phones.
- Each player answers a question (30 seconds, a warning beep in the last 5 seconds).
- Right answer: roll 1 dice. 5 right answers in a row: roll 2 dice, then the count starts again from 0.
- Wrong answer or no answer: no roll, the right answer is shown, and the player waits 5 seconds (penalty) before the next question. The penalty is always 5 seconds.
- Land on a 🐍 snake head: answer a question. Right = stay, wrong = slide down + 5-second penalty.
- Land at the bottom of a 🪜 ladder: answer a question. Right = climb, wrong = stay + 5-second penalty.
- Reaching or passing box 100 finishes.
- A player never gets the same question twice (until they have had them all).
- The game ends when 5 players have finished (or everyone, if fewer than 5 play).
- Up to 20 players. Each player picks a different piece.

The rules are in `src/lib/rules.ts` and the board (snakes and ladders) in `src/lib/board.ts`.

## What is in here

| Folder / file | What it is |
|---|---|
| `src/pages/Screen.tsx` | Projector: host PIN, lobby with QR code, live board, winners |
| `src/pages/Join.tsx` | Phone: join, answer questions, see dice and moves |
| `src/lib/engine.ts` | The referee. It runs inside the projector window: gives questions, checks answers, rolls dice |
| `src/lib/rules.ts` | The game rules |
| `src/lib/board.ts` | Board size, snakes, ladders, final zone |
| `src/lib/defaultQuestions.ts` | The starting question bank (63 questions, English + Malay) |
| `database.rules.json` | Security rules for the Firebase Realtime Database |
| `scripts/engine.test.ts` | Checks for the game rules (`npm test`) |

## Important for the event

- **Keep the projector window open** for the whole game. It is the referee. If it is reloaded, it carries on by itself.
- Players' phones need internet (Wi-Fi or mobile data).
- Questions can be switched on/off, edited and added from **Questions** on the projector (before the game starts).

## One-time setup

1. **Firebase security rules**: Firebase console → Realtime Database → Rules → paste the whole of `database.rules.json` → Publish.
2. **Firebase anonymous sign-in**: Authentication → Sign-in method → Anonymous → Enable.
3. **Vercel**: import this GitHub repository at vercel.com. No settings need changing (Vite is detected).
4. Open the Vercel address on the projector computer and create the host PIN.

## Run it on a computer (for developers)

```bash
npm install
```

```bash
npm run dev
```

Test without touching the real database, using the Firebase emulator (needs Java):

```bash
npx firebase-tools emulators:start --only auth,database --project demo-qsl
```

```bash
npm run dev:emu
```

```bash
npm test
```
