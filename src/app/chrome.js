/** Kiosk chrome: top bar, clock, toast messages and the idle reset. */
import { CONFIG } from '../config.js';
import { $ } from '../lib/util.js';
import { home } from './router.js';

export function initTopBar() {
  const { name, building, level, kioskId } = CONFIG.library;
  $('#libName').textContent = name;
  $('#libMeta').textContent = `${building} · Level ${level} · ${kioskId}`;

  const tick = () => {
    const d = new Date();
    $('#clockT').textContent = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    $('#clockD').textContent = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };
  tick();
  setInterval(tick, 10_000);
}

let toastTimer;
export function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/** Go back to the start screen after a period with no touches. */
export function initIdleReset(onReset) {
  let timer;
  const reset = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      home();
      onReset?.();
    }, CONFIG.idleTimeoutMs);
  };
  ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, reset));
  reset();
}
