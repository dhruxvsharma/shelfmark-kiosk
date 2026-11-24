/** Small DOM and colour helpers shared across the app. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Escape text before putting it into an HTML string. */
export const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Relative luminance of a #RRGGBB colour (0–1). */
export function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ink or paper text, whichever reads better on the given background. */
export const textOn = (hex) => (luminance(hex) > 0.5 ? '#0E0E0D' : '#F1EDE4');

/** Deterministic random numbers, so the 3D shelves look the same every time. */
export function seededRandom(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pad2 = (n) => String(n).padStart(2, '0');
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
