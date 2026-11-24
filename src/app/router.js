/**
 * Screen router with a back stack.
 * Each screen is a <section class="screen" id="s-…">. Screens can register
 * enter/leave hooks (the 3D viewer uses them to start and stop rendering).
 */
import { $, $$ } from '../lib/util.js';

const FADE_MS = 350;
const stack = [];
const hooks = {};
let current = null;

export const currentScreen = () => current;

export function onScreen(id, { enter, leave } = {}) {
  hooks[id] = { enter, leave };
}

export function show(id, { push = true } = {}) {
  if (current === id) return;
  if (push && current) stack.push(current);

  const prev = current ? $('#' + current) : null;
  if (prev) {
    hooks[current]?.leave?.();
    prev.classList.remove('vis');
    setTimeout(() => {
      if (current !== prev.id) prev.classList.remove('on');
    }, FADE_MS);
  }

  current = id;
  const el = $('#' + id);
  el.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('vis')));
  hooks[id]?.enter?.();
}

export function back() {
  show(stack.pop() || 's-home', { push: false });
}

export function home() {
  stack.length = 0;
  show('s-home', { push: false });
}

export function initRouter() {
  $$('[data-back]').forEach((b) => b.addEventListener('click', back));
  $('#homeBtn').addEventListener('click', home);
}
