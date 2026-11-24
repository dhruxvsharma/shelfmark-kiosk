/**
 * Shelfmark — entry point.
 * Loads fonts and styles, wires up every screen, then starts on Home.
 */
import '@fontsource/inter-tight/400.css';
import '@fontsource/inter-tight/500.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/700.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './styles/index.css';

import { initStage } from './app/stage.js';
import { initRouter, show } from './app/router.js';
import { initTopBar, initIdleReset } from './app/chrome.js';
import { initHome } from './screens/home.js';
import { initSearch, setQuery } from './screens/search.js';
import { initBook, openBook } from './screens/book.js';
import { initLocate, openLocate } from './screens/locate.js';
import { openCategory } from './screens/category.js';
import { BOOKS } from './lib/catalogue.js';

initStage();
initRouter();
initTopBar();
initHome();
initSearch();
initBook();
initIdleReset(() => setQuery(''));

// any element with data-book="<id>" opens that book
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-book]');
  if (el) openBook(Number(el.dataset.book));
});

show('s-home', { push: false });

// The 3D scene paints text onto canvases, so wait for the fonts first.
const fontsReady = Promise.race([
  Promise.all(['700 40px "Inter Tight"', '500 20px "JetBrains Mono"'].map((f) => document.fonts.load(f))),
  new Promise((r) => setTimeout(r, 2500)),
]);
fontsReady.catch(() => {}).finally(initLocate);

// handy for demos and debugging from the browser console
window.shelfmark = { BOOKS, openBook, openLocate, openCategory, show };
