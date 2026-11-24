/**
 * The orange walking route from the kiosk to the aisle, drawn as dashes on the
 * floor that appear one by one, plus a dot that keeps walking the route.
 *
 * Path: kiosk → main corridor → cross corridor in front of the zone → into the aisle.
 */
import * as THREE from 'three';
import { STACK_LEN } from '../data/layout.js';
import { ACCENT } from './materials.js';
import { zAlongFace } from './shelves.js';

const DASH_SPACING = 0.52;
const DRAW_SECONDS = 1.5;

export function createRoute(scene, kiosk) {
  const group = new THREE.Group();
  scene.add(group);
  const dashMat = new THREE.MeshBasicMaterial({ color: ACCENT });
  const dashGeo = new THREE.PlaneGeometry(0.2, 0.36);
  dashGeo.rotateX(-Math.PI / 2);
  const runner = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), new THREE.MeshBasicMaterial({ color: '#FFE1D6' }));
  scene.add(runner);

  let dashes = [];
  let points = [];
  let length = 0;
  let progress = 0;
  let drawing = false;
  let drawStart = 0;

  /** Rebuild the path for a book. Returns where to stand and where the book is. */
  function build(b) {
    group.clear();
    dashes = [];
    const s = b.stack;
    const sideSign = b.side === 'A' ? -1 : 1;
    const gapX = s.x + sideSign * 1.2; // middle of the aisle beside the right face
    const bookZ = s.z + zAlongFace(b.side, b.t);
    const frontZ = s.z + STACK_LEN / 2;
    const crossZ = s.z > 0 ? frontZ + 1.9 : -1.5; // front zones: walk in front; back zones: middle corridor

    points = [
      new THREE.Vector3(kiosk.x, 0.02, kiosk.z - 0.7),
      new THREE.Vector3(0, 0.02, crossZ),
      new THREE.Vector3(gapX, 0.02, crossZ),
      new THREE.Vector3(gapX, 0.02, bookZ),
    ];

    length = 0;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const c = points[i];
      const seg = a.distanceTo(c);
      const n = Math.max(1, Math.floor(seg / DASH_SPACING));
      const angle = Math.atan2(c.x - a.x, c.z - a.z);
      for (let k = 0; k < n; k++) {
        const f = (k + 0.5) / n;
        const d = new THREE.Mesh(dashGeo, dashMat);
        d.position.lerpVectors(a, c, f);
        d.position.y = 0.025;
        d.rotation.y = angle;
        d.userData.at = length + f * seg;
        d.visible = false;
        group.add(d);
        dashes.push(d);
      }
      length += seg;
    }
    reset();
    return { gapX, bookZ, sideSign, length };
  }

  function pointAt(dist) {
    let acc = 0;
    for (let i = 1; i < points.length; i++) {
      const seg = points[i - 1].distanceTo(points[i]);
      if (dist <= acc + seg) return new THREE.Vector3().lerpVectors(points[i - 1], points[i], (dist - acc) / seg);
      acc += seg;
    }
    return points[points.length - 1].clone();
  }

  function reset() {
    progress = 0;
    drawing = false;
    dashes.forEach((d) => (d.visible = false));
  }

  return {
    build,
    reset,
    /** Start drawing; pass instant=true to show the whole route at once. */
    draw(instant = false) {
      drawing = true;
      drawStart = performance.now();
      if (instant) progress = 1;
    },
    update(now, showRunner) {
      // timed by the clock, not by frames, so slow devices draw at the same pace
      if (drawing && progress < 1) progress = Math.min(1, (now - drawStart) / (DRAW_SECONDS * 1000));
      const shown = progress * length;
      dashes.forEach((d) => (d.visible = drawing && d.userData.at <= shown));
      runner.visible = drawing && progress >= 1 && showRunner;
      if (runner.visible) {
        const p = pointAt(((now / 1000) * 3.2) % (length + 3));
        runner.position.set(p.x, 0.18, p.z);
      }
    },
  };
}
