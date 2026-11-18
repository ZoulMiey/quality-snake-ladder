// The board: 50 boxes, 5 rows of 10, zig-zag from box 1 (bottom left) to box 50 (top left).

export const LAST_BOX = 50;
/** Boxes 46–49: a total of 6 or more is needed to finish. */
export const FINAL_ZONE_START = 46;
export const FINAL_ZONE_NEED = 6;
export const COLS = 10;
export const ROWS = 5;

/** bottom of ladder -> top of ladder */
export const LADDERS: Record<number, number> = {
  3: 18,
  9: 32,
  13: 28,
  21: 40,
  26: 35,
};

/** snake head -> snake tail */
export const SNAKES: Record<number, number> = {
  19: 2,
  30: 11,
  34: 14,
  44: 24,
  47: 33,
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
