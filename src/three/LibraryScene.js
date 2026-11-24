/**
 * LibraryScene — puts the 3D pieces together and runs the guided sequence:
 *
 *   1. Floor plan   — establishing shot; the route draws from the kiosk
 *   2. Aisle        — fly into the aisle; the unit in front turns see-through
 *   3. Shelf        — face the shelf; the row lights up and the book slides out
 *
 * The screen passes callbacks so the side panel can light up in step.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { rowY } from '../data/layout.js';
import { pad2, wait } from '../lib/util.js';
import { addLights, buildRoom } from './environment.js';
import { buildShelves, updateShelfFades } from './shelves.js';
import { createRoute } from './route.js';
import { createHighlight } from './highlight.js';
import { CameraRig } from './cameraRig.js';

const PANEL_WIDTH = 640; // the side panel covers this much of the canvas

export function createLibraryScene({ canvas, tags, getScale, onSteps, onView }) {
  const W = canvas.width;
  const H = canvas.height;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, W / H, 0.05, 200);
  // shift the projection so the scene centres in the area right of the panel
  camera.setViewOffset(W, H, -PANEL_WIDTH / 2, 0, W, H);

  addLights(scene);
  const { hereRing, kiosk } = buildRoom(scene);
  const units = buildShelves(scene);
  const route = createRoute(scene, kiosk);
  const highlight = createHighlight(scene);
  const rig = new CameraRig(camera);

  let info = null; // the book being shown + its route geometry
  let view = 'floor';
  let seq = 0; // bumps whenever a new sequence starts, so old ones stop

  /* ---------- views ---------- */

  function presets() {
    const { b, gapX, bookZ, sideSign: sg } = info;
    const faceX = b.stack.x + sg * 0.36;
    return {
      floor: { tx: 0, ty: 0, tz: 1.6, r: 49, yaw: 0, pitch: 1.0 },
      aisle: { tx: gapX, ty: 0.8, tz: bookZ, r: 15, yaw: sg * 0.38, pitch: 0.62 },
      shelf: { tx: faceX, ty: rowY(b.row) + 0.14, tz: bookZ, r: 3.3, yaw: sg * (Math.PI / 2 - 0.32), pitch: 0.16 },
    };
  }

  /** In aisle/shelf views, make the neighbouring unit see-through so it doesn't block the camera. */
  function xray(mode) {
    const { b, sideSign } = info;
    for (const u of units) {
      const isNeighbour = u.s.zone === b.stack.zone && u.s.k === b.stack.k + sideSign;
      u.target = mode !== 'floor' && isNeighbour ? (mode === 'shelf' ? 0 : 0.22) : 1;
    }
  }

  async function goTo(v, my) {
    view = v;
    onView(v);
    xray(v);
    await rig.tweenTo(presets()[v], v === 'floor' ? 1500 : 1700);
    if (my !== seq) return false;
    if (v === 'aisle') onSteps(4);
    if (v === 'shelf') {
      onSteps(6);
      highlight.slideOut(true);
    }
    return true;
  }

  /** The guided fly-through. */
  async function play() {
    const my = ++seq;
    highlight.slideOut(false);
    route.reset();
    onSteps(0);
    view = 'floor';
    onView('floor');
    xray('floor');

    await rig.tweenTo(presets().floor, 900);
    if (my !== seq) return;
    onSteps(2); // level + zone
    route.draw();
    await wait(1700);
    if (my !== seq) return;
    onSteps(3); // aisle
    if (!(await goTo('aisle', my))) return;
    await wait(700);
    if (my !== seq) return;
    await goTo('shelf', my);
  }

  /** Manual view switch from the Floor plan / Aisle / Shelf buttons. */
  function setView(v) {
    if (!info) return;
    const my = ++seq;
    route.draw(true);
    if (v !== 'floor') onSteps(v === 'aisle' ? 4 : 6);
    highlight.slideOut(v === 'shelf');
    goTo(v, my);
  }

  function focus(b) {
    const r = route.build(b);
    info = { b, ...r, destLabel: `Aisle ${pad2(b.stack.n)} · Side ${b.side}` };
    highlight.place(b, r);
    rig.jump({ tx: 0, ty: 0, tz: 1.2, r: 62, yaw: -0.35, pitch: 1.15 }); // wide shot, then play
    play();
    return { metres: Math.round(r.length * CONFIG.metresPerUnit) };
  }

  /* ---------- touch / mouse ---------- */

  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, yaw: rig.user.yaw, pitch: rig.user.pitch };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('drag');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const k = 1 / (getScale() * 420);
    rig.drag(drag.yaw - (e.clientX - drag.x) * k * 1.4, drag.pitch + (e.clientY - drag.y) * k);
  });
  const endDrag = () => {
    drag = null;
    canvas.classList.remove('drag');
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); rig.zoom(1 + e.deltaY * 0.001); }, { passive: false });

  /* ---------- floating HTML labels ---------- */

  const v3 = new THREE.Vector3();
  function placeTag(el, point, visible) {
    v3.copy(point).project(camera);
    const onScreen = visible && v3.z < 1 && Math.abs(v3.x) < 1 && Math.abs(v3.y) < 1;
    el.style.opacity = onScreen ? 1 : 0;
    el.style.transform = `translate(${((v3.x + 1) / 2) * W}px, ${((1 - v3.y) / 2) * H}px) translate(-50%,-100%)`;
  }
  function updateTags() {
    if (!info) return;
    placeTag(tags.here, new THREE.Vector3(kiosk.x, 1.7, kiosk.z), view === 'floor');
    if (view === 'shelf') {
      tags.destText.textContent = `Your book · ${info.b.call}`;
      placeTag(tags.dest, highlight.book.position.clone().setY(highlight.book.position.y + 0.2), highlight.slide > 0.5);
    } else {
      tags.destText.textContent = info.destLabel;
      placeTag(tags.dest, new THREE.Vector3(info.gapX, 3.5, info.bookZ), true);
    }
  }

  /* ---------- render loop ---------- */

  let running = false;
  let last = performance.now();
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    rig.update(now);
    route.update(now, view !== 'shelf');
    updateShelfFades(units, dt);
    highlight.update(dt, now, view);
    hereRing.scale.setScalar(1 + 0.15 * Math.sin(now / 400));
    updateTags();

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  return {
    focus,
    setView,
    replay: play,
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    },
    stop() {
      running = false;
    },
  };
}
