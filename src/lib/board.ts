// The board: 100 boxes, 10 rows of 10, zig-zag from box 1 (bottom left) to box 100 (top left).

export const LAST_BOX = 100;
/** Boxes 96–99: a total of 6 or more is needed to finish. */
export const FINAL_ZONE_START = 96;
export const FINAL_ZONE_NEED = 6;
export const COLS = 10;
export const ROWS = 10;

/** bottom of ladder -> top of ladder (mostly straight up, so the board stays easy to read) */
export const LADDERS: Record<number, number> = {
  4: 37,
  9: 32,
  21: 60,
  26: 55,
  43: 78,
  50: 71,
  66: 86,
};

/** snake head -> snake tail */
export const SNAKES: Record<number, number> = {
  30: 11,
  36: 5,
  47: 14,
  48: 28,
  62: 39,
  87: 54,
  89: 69,
  97: 64,
};

export const inFinalZone = (box: number) => box >= FINAL_ZONE_START && box < LAST_BOX;

/** Column (0 = left) and row (0 = top) of a box on screen. Box 0 = start, shown beside box 1. */
export function cellOf(box: number): { col: number; row: number } {
  const b = Math.max(1, Math.min(LAST_BOX, box));
  const i = b - 1;
  const rowFromBottom = Math.floor(i / COLS);
  const inRow = i % COLS;
  const col = rowFromBottom % 2 === 0 ? inRow : COLS - 1 - inRow;
  return { col, row: ROWS - 1 - rowFromBottom };
}
