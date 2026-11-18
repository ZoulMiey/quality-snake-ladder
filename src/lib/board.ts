// The board: 100 boxes, 10 rows of 10, zig-zag from box 1 (bottom left) to box 100 (top left).

export const LAST_BOX = 100;
export const COLS = 10;
export const ROWS = 10;

/** bottom of ladder -> top of ladder (different angles and lengths; none of them cross) */
export const LADDERS: Record<number, number> = {
  7: 17,
  12: 30,
  21: 41,
  24: 42,
  28: 51,
  44: 61,
  55: 74,
  70: 92,
};

/** snake head -> snake tail (straight down, sideways, 45°, short and long) */
export const SNAKES: Record<number, number> = {
  22: 18,
  26: 9,
  45: 25,
  69: 35,
  79: 57,
  85: 82,
  93: 88,
  94: 56,
};

/** Column (0 = left) and row (0 = top) of a box on screen. Box 0 = start, shown beside box 1. */
export function cellOf(box: number): { col: number; row: number } {
  const b = Math.max(1, Math.min(LAST_BOX, box));
  const i = b - 1;
  const rowFromBottom = Math.floor(i / COLS);
  const inRow = i % COLS;
  const col = rowFromBottom % 2 === 0 ? inRow : COLS - 1 - inRow;
  return { col, row: ROWS - 1 - rowFromBottom };
}
