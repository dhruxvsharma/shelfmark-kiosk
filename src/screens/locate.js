/**
 * Location viewer: the side panel (location chain, shelf elevation, QR)
 * plus the 3D library scene on the right.
 */
import { CONFIG } from '../config.js';
import { ROWS, ZONES } from '../data/layout.js';
import { $, $$, esc } from '../lib/util.js';
import { aisleNo, formatDewey, routeText } from '../lib/catalogue.js';
import { qrSVG } from '../lib/qr.js';
import { cover } from '../ui/components.js';
import { show, onScreen } from '../app/router.js';
import { stageScale } from '../app/stage.js';
import { createLibraryScene } from '../three/LibraryScene.js';

let scene = null;

/** Light up the first n rows of the location chain. */
function setSteps(n) {
  $$('#pSteps .step').forEach((s, i) => s.classList.toggle('on', i < n));
}
function setActiveView(v) {
  $$('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.view === v));
}

/** Front view of the shelf face: six rows, target row and book marked. */
function elevationSVG(b) {
  const w = 512, rowH = 14, gap = 3.6;
  let svg = '';
  for (let r = 1; r <= ROWS; r++) {
    const y = (r - 1) * (rowH + gap);
    const on = r === b.row;
    svg += `<rect x="0" y="${y}" width="${w}" height="${rowH}" rx="2" fill="${on ? 'rgba(255,77,26,.18)' : '#232220'}" ${on ? 'stroke="#FF4D1A" stroke-width="1.5"' : ''}/>`;
    svg += `<text x="8" y="${y + rowH - 3}" font-family="JetBrains Mono, monospace" font-size="11" fill="${on ? '#FF4D1A' : '#6E6A62'}">${r}</text>`;
  }
  const bx = 28 + b.t * (w - 48);
  const by = (b.row - 1) * (rowH + gap);
  svg += `<rect x="${bx}" y="${by - 4}" width="10" height="${rowH + 8}" rx="1.5" fill="#FF4D1A"/>`;
  return svg;
}

export function openLocate(b) {
  const lib = CONFIG.library;
  $('#pCover').innerHTML = cover(b);
  $('#pTitle').textContent = b.title;
  $('#pAuthor').textContent = `${b.author} · ${b.available > 0 ? `${b.available} of ${b.copies} on shelf` : 'all borrowed'}`;

  $('#pSteps').innerHTML = [
    ['Level', lib.level, 'Main reading floor'],
    ['Zone', b.zone, ZONES[b.zone].name],
    ['Aisle', aisleNo(b), `${formatDewey(b.stack.lo)}–${formatDewey(b.stack.hi - 1)}`],
    ['Side', b.side, b.side === 'A' ? 'left face as you enter' : 'right face as you enter'],
    ['Row', b.row, `of ${ROWS}, counted from the top`],
    ['Spine', b.call, '', true],
  ]
    .map(
      ([k, v, sub, mono]) =>
        `<div class="step"><div class="k"><i></i>${k}</div><div class="v${mono ? ' mono' : ''}"><b>${esc(v)}</b><span>${esc(sub)}</span></div></div>`,
    )
    .join('');

  $('#pElevL').textContent = `Aisle ${aisleNo(b)} · side ${b.side}`;
  $('#pElev').innerHTML = elevationSVG(b);
  $('#qr').innerHTML = qrSVG(routeText(b, lib));

  show('s-locate');
  if (scene) {
    const { metres } = scene.focus(b);
    showWalk(metres);
  } else {
    setSteps(6);
  }
}

function showWalk(metres) {
  $('#pDist').textContent = `${metres} m`;
  const seconds = Math.max(15, Math.round(metres / CONFIG.walkingSpeedMps / 5) * 5);
  $('#pMin').textContent = `${seconds} s`;
}

export function initLocate() {
  try {
    scene = createLibraryScene({
      canvas: $('#gl'),
      tags: { here: $('#tagHere'), dest: $('#tagDest'), destText: $('#tagDestTxt') },
      getScale: stageScale,
      onSteps: setSteps,
      onView: setActiveView,
    });
  } catch (err) {
    console.error('3D view failed to start', err);
    $('#glErr').style.display = 'flex';
    $('#gl').style.display = 'none';
  }

  $$('#seg button').forEach((btn) => btn.addEventListener('click', () => scene?.setView(btn.dataset.view)));
  $('#replay').addEventListener('click', () => scene?.replay());

  // only render while the viewer is on screen
  onScreen('s-locate', { enter: () => scene?.start(), leave: () => scene?.stop() });
}
