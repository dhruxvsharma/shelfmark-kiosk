/**
 * Everything that marks the chosen book: the glowing book that slides out,
 * the orange strip along its row, the beam over the aisle and the floor ring.
 */
import * as THREE from 'three';
import { STACK_LEN, rowY } from '../data/layout.js';
import { ACCENT } from './materials.js';

const BOOK = { thick: 0.065, height: 0.275, depth: 0.25 };

export function createHighlight(scene) {
  const bookMat = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.35, roughness: 0.6 });
  const book = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), bookMat);
  const outline = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#FFC2A8', side: THREE.BackSide }));
  outline.scale.setScalar(1.12);
  book.add(outline);
  book.scale.set(BOOK.depth, BOOK.height, BOOK.thick);

  const rowStrip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, STACK_LEN), new THREE.MeshBasicMaterial({ color: ACCENT }));
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 3.4, 10),
    new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 }),
  );
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.46, 40), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true }));
  ring.rotation.x = -Math.PI / 2;
  scene.add(book, rowStrip, beam, ring);

  const base = new THREE.Vector3();
  let dir = 1;
  let slide = 0;
  let slideTarget = 0;

  return {
    book,
    place(b, { gapX, bookZ, sideSign }) {
      const s = b.stack;
      dir = sideSign;
      base.set(s.x + sideSign * (0.02 + BOOK.depth / 2 + 0.005), rowY(b.row) + 0.012 + BOOK.height / 2, bookZ);
      book.position.copy(base);
      rowStrip.position.set(s.x + sideSign * 0.37, rowY(b.row) + 0.01, s.z);
      beam.position.set(gapX, 1.7, bookZ);
      ring.position.set(gapX, 0.03, bookZ);
      slide = slideTarget = 0;
    },
    /** 1 = book pulled out of the shelf, 0 = in line with its neighbours. */
    slideOut(on) {
      slideTarget = on ? 1 : 0;
    },
    get slide() {
      return slide;
    },
    update(dt, now, view) {
      const pulse = 0.5 + 0.5 * Math.sin(now / 260);
      slide += (slideTarget - slide) * Math.min(1, dt * 5);
      book.position.copy(base);
      book.position.x += dir * 0.16 * slide;
      bookMat.emissiveIntensity = 0.25 + pulse * 0.45;
      ring.material.opacity = 0.55 + 0.45 * pulse;
      rowStrip.visible = view !== 'floor';
      beam.visible = ring.visible = view !== 'shelf'; // the beam would block the shelf view
    },
  };
}
