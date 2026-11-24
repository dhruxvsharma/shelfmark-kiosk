/** Category list: every title in one Dewey range, with its location code. */
import { CATEGORIES } from '../data/categories.js';
import { $, esc, pad2 } from '../lib/util.js';
import { BOOKS, zoneName } from '../lib/catalogue.js';
import { bookCard, emptyState } from '../ui/components.js';
import { show } from '../app/router.js';

export function openCategory(key) {
  const c = CATEGORIES.find((x) => x.key === key);
  const list = BOOKS.filter((b) => b.category === c).sort((a, b) => a.dewey - b.dewey);
  const aisles = [...new Set(list.map((b) => b.stack.n))].map(pad2).join(', ');

  $('#lBand').style.background = c.bg;
  $('#lBand').style.boxShadow = c.outline ? 'inset 0 0 0 1.5px #3A3834' : '';
  $('#lTitle').textContent = c.name;
  $('#lFacts').innerHTML = `
    <dt>Dewey</dt><dd style="font-family:var(--mono)">${String(c.lo).padStart(3, '0')}–${c.hi - 1}</dd>
    <dt>Zone</dt><dd>${c.zone} · ${esc(zoneName(c.zone))}</dd>
    <dt>Aisles</dt><dd style="font-family:var(--mono)">${aisles || '—'}</dd>
    <dt>Titles</dt><dd>${list.length} in this prototype</dd>`;
  $('#lGrid').innerHTML = list.length
    ? list.map(bookCard).join('')
    : emptyState('No titles yet.', 'This section is being restocked.');

  show('s-list');
}
