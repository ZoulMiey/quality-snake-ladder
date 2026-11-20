// The referee's clock. Browsers slow down timers in hidden pages (Chrome: down to once a minute after a few
// minutes in a background tab or a covered/minimised window), which would freeze the game for everyone when
// the projector page is not on screen (owner's Pull the Rope test, Nov 2026: "it hang, no question appear").
// A timer inside a Web Worker is not slowed down like that, so the engines tick through one.
export function startTicker(fn: () => void, ms: number): () => void {
  try {
    const url = URL.createObjectURL(new Blob([`setInterval(() => postMessage(0), ${ms});`], { type: "text/javascript" }));
    const worker = new Worker(url);
    worker.onmessage = () => fn();
    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
  } catch {
    // No workers (very old browser): fall back to a normal timer.
    const id = window.setInterval(fn, ms);
    return () => clearInterval(id);
  }
}
