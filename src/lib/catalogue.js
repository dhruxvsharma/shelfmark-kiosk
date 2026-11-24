/**
 * The catalogue: loads the book records and works out where each one sits.
 *
 * In a real deployment these records would come from the library system
 * (Koha, an OPAC API, etc.). Here they come from data/books.json.
 *
 * Placement rule: a shelf unit holds a Dewey range. That range is spread across
 * 12 shelves — side A rows 1–6, then side B rows 1–6 — read left to right.
 */
import RAW_BOOKS from '../data/books.json';
import { STACKS, ZONES } from '../data/layout.js';
import { CATEGORIES } from '../data/categories.js';
import { pad2 } from './util.js';

/** 6.7 → "006.7", 745.2 → "745.2" */
export const formatDewey = (d) => {
  const [whole, frac] = String(d).split('.');
  return whole.padStart(3, '0') + (frac ? '.' + frac : '');
};

function locate(book, taken) {
  const stack = STACKS.find((s) => book.dewey >= s.lo && book.dewey < s.hi);
  const f = Math.min(0.999, (book.dewey - stack.lo) / (stack.hi - stack.lo));
  const slot = Math.floor(f * 12);
  // position along the shelf (0 = left end, 1 = right end), kept off the very ends
  let t = (f * 12 - slot) * 0.84 + 0.08;

  // two books with the same call number would overlap: nudge the later one right
  const key = `${stack.n}-${slot}`;
  taken[key] = taken[key] || [];
  taken[key].forEach((other) => {
    if (Math.abs(other - t) < 0.06) t = Math.min(0.95, other + 0.07);
  });
  taken[key].push(t);

  return {
    stack,
    zone: stack.zone,
    side: slot < 6 ? 'A' : 'B',
    row: (slot % 6) + 1,
    t,
  };
}

const taken = {};
export const BOOKS = RAW_BOOKS.map((raw) => {
  const book = { ...raw, call: `${formatDewey(raw.dewey)} ${raw.cutter}` };
  Object.assign(book, locate(book, taken));
  book.category = CATEGORIES.find((c) => book.dewey >= c.lo && book.dewey < c.hi);
  return book;
});

export const getBook = (id) => BOOKS.find((b) => b.id === id);
export const zoneName = (id) => ZONES[id].name;
export const aisleNo = (book) => pad2(book.stack.n);

/** Short code for cards, e.g. "C · 12A · R2" */
export const shortLocation = (b) => `${b.zone} · ${aisleNo(b)}${b.side} · R${b.row}`;

/** Plain-text route summary, used for the QR code. */
export const routeText = (b, lib) =>
  [
    `SHELFMARK · ${lib.name}, ${lib.building}`,
    `${b.title} — ${b.author}`,
    `Level ${lib.level} › Zone ${b.zone} › Aisle ${aisleNo(b)} › Side ${b.side} › Row ${b.row}`,
    `Call no. ${b.call}`,
  ].join('\n');
