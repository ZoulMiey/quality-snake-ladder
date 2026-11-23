// Quality Cart asks the phone to go full screen and lock sideways ("⛶ Full screen" on the turn-sideways screen).
// Leaving the race (🏠 Home or ✕, owner 23 Nov 2026) undoes both, so the phone is back to its normal upright screen.
export function leaveFullscreen() {
  try {
    (screen.orientation as unknown as { unlock?: () => void } | undefined)?.unlock?.();
  } catch {}
  try {
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {});
  } catch {}
}
