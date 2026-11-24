/**
 * HTML builders for repeated pieces of UI.
 * They return strings so screens can render lists in one go.
 */
import { esc, textOn, seededRandom } from '../lib/util.js';
import { shortLocation } from '../lib/catalogue.js';

/**
 * Typographic cover, generated from the book's colour and style
 * (no cover art is reproduced). Sizes use cqw, so the parent needs
 * `container-type: inline-size` (the .cv class sets it).
 *   style 0 — serif title over a colour field
 *   style 1 — heavy grotesque title, bottom-left
 *   style 2 — colour band on top, italic serif below
 */
export function cover(b) {
  const fg = textOn(b.coverColor);
  const len = b.title.length;
  const size = (long, mid, short) => (len > 24 ? long : len > 14 ? mid : short);
  const author = `<div class="c-a" style="font-size:5.4cqw">${esc(b.author)}</div>`;

  if (b.coverStyle === 2) {
    return `<div class="cover s2" style="background:#F1EDE4;color:#0E0E0D">
      <div class="c-band" style="background:${b.coverColor}"></div>
      <div class="c-in"><div class="c-t" style="font-size:${size(12, 15, 18)}cqw">${esc(b.title)}</div>${author}</div>
    </div>`;
  }
  if (b.coverStyle === 1) {
    return `<div class="cover s1" style="background:${b.coverColor};color:${fg}">
      <div class="c-in"><div class="c-t" style="font-size:${size(10.5, 13, 17)}cqw">${esc(b.title)}</div>${author}</div>
    </div>`;
  }
  return `<div class="cover s0" style="background:${b.coverColor};color:${fg}">
    <div class="c-in">
      <div class="c-t" style="font-size:${size(13, 16, 20)}cqw">${esc(b.title)}</div>
      <div style="height:1.5px;background:currentColor;opacity:.5;margin:7% 0;width:30%"></div>
      ${author}
    </div>
  </div>`;
}

/** Decorative barcode for category spines. */
export function barcode(seed, color) {
  const rnd = seededRandom(seed * 97 + 13);
  let x = 0;
  let bars = '';
  while (x < 96) {
    const w = 1 + Math.floor(rnd() * 3.2);
    if (rnd() > 0.38) bars += `<rect x="${x}" y="0" width="${w}" height="34"/>`;
    x += w + 1;
  }
  return `<svg class="bc" viewBox="0 0 96 34" preserveAspectRatio="none" fill="${color}" aria-hidden="true">${bars}</svg>`;
}

export function availability(b) {
  return b.available > 0
    ? `<span class="status"><i></i>On shelf</span>`
    : `<span class="status out"><i></i>Borrowed · due ${esc(b.nextDue)}</span>`;
}

/** Result card used on search and category screens. Tapping opens the book. */
export function bookCard(b) {
  return `<button class="rcard" data-book="${b.id}">
    <div class="cv">${cover(b)}</div>
    <div class="tx">
      <div class="tt">${esc(b.title)}</div>
      <div class="au">${esc(b.author)}</div>
      <div class="meta">${availability(b)}<span class="loc">${shortLocation(b)}</span></div>
    </div>
  </button>`;
}

export const emptyState = (title, body) => `<div class="empty"><strong>${title}</strong>${body}</div>`;
