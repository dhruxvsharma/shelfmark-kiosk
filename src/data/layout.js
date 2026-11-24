/**
 * Physical layout of the library floor.
 *
 * Location model:  Level → Zone → Aisle (shelf unit) → Side (A/B) → Row (1 = top) → Call number
 *
 * The floor has four zones in a 2×2 grid. Each zone holds four double-sided
 * shelf units ("aisles"), numbered 01–16 left to right, back to front.
 * Coordinates are in scene units (1 unit ≈ 1.5 m, see CONFIG.metresPerUnit).
 * +z points towards the entrance and the kiosk.
 */

export const ZONES = {
  A: { id: 'A', name: 'Knowledge & Mind', cx: -9, cz: -8 },
  B: { id: 'B', name: 'Society & Science', cx: 9, cz: -8 },
  C: { id: 'C', name: 'Technology, Design & Arts', cx: -9, cz: 5 },
  D: { id: 'D', name: 'Literature & History', cx: 9, cz: 5 },
};

/** Shelf-unit geometry */
export const STACK_LEN = 5;     // length of a shelf unit along z
export const ROWS = 6;          // shelves per side
export const ROW_GAP = 0.34;    // vertical distance between shelves
export const BASE_Y = 0.12;     // height of the bottom shelf

/** Height of the shelf board for row r (1 = top row). */
export const rowY = (r) => BASE_Y + (ROWS - r) * ROW_GAP;

/** Offsets of the four units inside a zone, along x. */
const UNIT_OFFSETS = [-3.6, -1.2, 1.2, 3.6];

/** [aisle number, zone, Dewey from (inclusive), Dewey to (exclusive)] */
const STACK_TABLE = [
  [1, 'A', 0, 100], [2, 'A', 100, 150], [3, 'A', 150, 200], [4, 'A', 200, 300],
  [5, 'B', 300, 340], [6, 'B', 340, 500], [7, 'B', 500, 540], [8, 'B', 540, 600],
  [9, 'C', 600, 686], [10, 'C', 686, 700], [11, 'C', 700, 740], [12, 'C', 740, 800],
  [13, 'D', 800, 823], [14, 'D', 823, 900], [15, 'D', 900, 954], [16, 'D', 954, 1000],
];

export const STACKS = STACK_TABLE.map(([n, zoneId, lo, hi]) => {
  const zone = ZONES[zoneId];
  const k = (n - 1) % 4; // position inside the zone, 0–3
  return { n, zone: zoneId, lo, hi, k, x: zone.cx + UNIT_OFFSETS[k], z: zone.cz };
});

/** Where the kiosk stands on the floor. */
export const KIOSK_POS = { x: 0, z: 13.2 };
