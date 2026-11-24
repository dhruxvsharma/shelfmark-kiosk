/** Book detail: cover, summary, availability and the location chain. */
import { CONFIG } from '../config.js';
import { $, esc, textOn } from '../lib/util.js';
import { BOOKS, getBook, aisleNo, formatDewey } from '../lib/catalogue.js';
import { cover } from '../ui/components.js';
import { show } from '../app/router.js';
import { toast } from '../app/chrome.js';
import { openLocate } from './locate.js';

const ICON_PHONE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>`;
const ICON_BELL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0"/></svg>`;

let book = null;

export function openBook(id) {
  book = getBook(id);
  const b = book;
  const out = b.available === 0;

  $('#bCover').innerHTML = cover(b);
  $('#bCat').textContent = `${b.category.name} · ${formatDewey(Math.floor(b.dewey))}`;
  $('#bTitle').textContent = b.title;
  $('#bBy').innerHTML = `by <b>${esc(b.author)}</b>`;
  $('#bSum').textContent = b.summary;
  $('#bFacts').innerHTML = `
    <div><dt>Call number</dt><dd class="mono">${b.call}</dd></div>
    <div><dt>First published</dt><dd>${b.year < 1000 ? `c. ${b.year} CE` : b.year}</dd></div>
    <div><dt>Pages</dt><dd>${b.pages}</dd></div>`;

  $('#bWhere').classList.toggle('out', out);
  $('#bAvail').textContent = b.available;
  $('#bAvailOf').textContent = `of ${b.copies} on shelf`;
  $('#bStat span').textContent = out ? `All copies borrowed · next back ${b.nextDue}` : 'Checked 2 min ago';
  $('#bChain').innerHTML = [
    ['Level', CONFIG.library.level],
    ['Zone', b.zone],
    ['Aisle', aisleNo(b)],
    ['Side', b.side],
    ['Row', b.row],
  ]
    .map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`)
    .join('');

  $('#bGoLabel').textContent = out ? 'Show its shelf anyway' : 'Show me where';
  $('#bReserve').innerHTML = out ? `${ICON_BELL}Reserve — notify me when back` : `${ICON_PHONE}Send route to my phone`;

  // same shelf unit first, then the rest of the zone
  const nearby = BOOKS.filter((x) => x.stack === b.stack && x !== b)
    .concat(BOOKS.filter((x) => x.zone === b.zone && x.stack !== b.stack))
    .slice(0, 9);
  $('#bAlso').innerHTML = nearby
    .map((x) => {
      const h = 118 + ((x.id * 37) % 46);
      return `<button class="mini" data-book="${x.id}" style="height:${h}px;background:${x.coverColor};color:${textOn(x.coverColor)}" aria-label="${esc(x.title)}"><span>${esc(x.title)}</span></button>`;
    })
    .join('');

  show('s-book');
}

export function initBook() {
  $('#bGo').addEventListener('click', () => openLocate(book));
  $('#bReserve').addEventListener('click', () => {
    if (book.available === 0) toast(`Reserved. We'll text you when ${book.title} is back.`);
    else openLocate(book);
  });
}
