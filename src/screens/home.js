/** Home: headline, search entry, popular searches and category spines. */
import { CONFIG } from '../config.js';
import { CATEGORIES } from '../data/categories.js';
import { $, $$, esc } from '../lib/util.js';
import { barcode } from '../ui/components.js';
import { show } from '../app/router.js';
import { openCategory } from './category.js';
import { setQuery } from './search.js';

export function initHome() {
  $('#spines').innerHTML = CATEGORIES.map((c, i) => {
    const lean = i === CATEGORIES.length - 1 ? 'transform:rotate(4deg) translateX(14px);' : '';
    const outline = c.outline ? 'box-shadow:inset 0 0 0 1.5px #3A3834;' : '';
    return `<button class="spine" data-cat="${c.key}" aria-label="${esc(c.name)}, ${c.lo}–${c.hi - 1}"
        style="width:${c.w}px;height:${c.h}px;background:${c.bg};color:${c.fg};${outline}${lean}">
      <span class="rng">${String(c.lo).padStart(3, '0')}–${c.hi - 1}</span>
      <span class="nm${c.serif ? ' serif' : ''}">${esc(c.name)}</span>
      <span class="zone">${c.zone}</span>
      ${barcode(i + 1, c.fg)}
    </button>`;
  }).join('');
  $$('.spine').forEach((s) => s.addEventListener('click', () => openCategory(s.dataset.cat)));

  $('#homeChips').innerHTML =
    '<span class="eyebrow" style="width:100%;margin-bottom:4px">Popular this week</span>' +
    CONFIG.popularSearches.map((p) => `<button class="chip" data-q="${esc(p)}">${esc(p)}</button>`).join('');
  $$('#homeChips .chip').forEach((c) =>
    c.addEventListener('click', () => {
      setQuery(c.dataset.q);
      show('s-search');
    }),
  );

  $('#openSearch').addEventListener('click', () => show('s-search'));
}
