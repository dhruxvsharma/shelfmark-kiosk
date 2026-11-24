/** Search: on-screen keyboard (and physical keyboard), live results. */
import { CONFIG } from '../config.js';
import { $, esc } from '../lib/util.js';
import { searchBooks } from '../lib/search.js';
import { bookCard, emptyState } from '../ui/components.js';
import { currentScreen } from '../app/router.js';

const KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const MAX_RESULTS = 6;
let query = '';

export function setQuery(q) {
  query = q;
  render();
}

function render() {
  $('#qText').textContent = query;
  $('#qPh').style.display = query ? 'none' : '';

  if (!query) {
    $('#qCount').textContent = 'Try';
    $('#results').innerHTML = CONFIG.popularSearches
      .slice(0, 3)
      .map((p) => searchBooks(p)[0])
      .filter(Boolean)
      .map(bookCard)
      .join('');
    return;
  }

  const results = searchBooks(query);
  $('#qCount').textContent = results.length
    ? `${results.length} ${results.length === 1 ? 'title' : 'titles'} on this floor`
    : '0 titles';
  $('#results').innerHTML = results.length
    ? results.slice(0, MAX_RESULTS).map(bookCard).join('')
    : emptyState(
        `Nothing matches “${esc(query)}”.`,
        "Try an author's surname, a single word from the title, or browse the shelves from the start screen.",
      );
}

export function initSearch() {
  $('#kbd').innerHTML =
    KEY_ROWS.map(
      (row, i) =>
        `<div class="row">${row
          .split('')
          .map((k) => `<button data-k="${k}">${k}</button>`)
          .join('')}${i === 2 ? '<button class="wide" data-k="del">Delete</button>' : ''}</div>`,
    ).join('') +
    `<div class="row"><button class="wide" data-k="clear">Clear</button><button class="space" data-k=" ">Space</button><button class="wide" data-k="done">Done</button></div>`;

  $('#kbd').addEventListener('click', (e) => {
    const key = e.target.closest('[data-k]')?.dataset.k;
    if (!key) return;
    if (key === 'del') query = query.slice(0, -1);
    else if (key === 'clear') query = '';
    else if (key === 'done') return $('#results [data-book]')?.focus();
    else query += key;
    render();
  });

  // physical keyboard, handy when testing on a laptop
  document.addEventListener('keydown', (e) => {
    if (currentScreen() !== 's-search') return;
    if (e.key === 'Backspace') query = query.slice(0, -1);
    else if (e.key.length === 1 && /[\w '\-&]/.test(e.key)) query += e.key;
    else return;
    render();
  });

  render();
}
