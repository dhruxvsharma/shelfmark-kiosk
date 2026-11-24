/**
 * Shelf units ("aisles") and their books.
 * Each unit is a group of simple boxes plus ONE InstancedMesh holding every
 * filler book on both faces, so ~13,000 books cost 16 draw calls.
 * A gap is left wherever a catalogue book sits, for the highlighted book.
 */
import * as THREE from 'three';
import { STACKS, STACK_LEN, ROWS, rowY } from '../data/layout.js';
import { BOOKS, formatDewey } from '../lib/catalogue.js';
import { seededRandom, pad2 } from '../lib/util.js';
import { COLORS, SPINE_PALETTE, canvasTexture } from './materials.js';

/** Z position of a point t (0 = left, 1 = right) along a face, as the reader sees it. */
export function zAlongFace(side, t) {
  return side === 'A' ? -STACK_LEN / 2 + t * STACK_LEN : STACK_LEN / 2 - t * STACK_LEN;
}

/** The sign on each end of a unit: aisle number, Dewey range, which side is which. */
function signTexture(s) {
  return canvasTexture(256, 384, (g, w) => {
    g.fillStyle = '#121211';
    g.fillRect(0, 0, w, 384);
    g.textAlign = 'center';
    g.fillStyle = '#9C978C';
    g.font = '500 26px "JetBrains Mono", monospace';
    g.fillText('AISLE', w / 2, 58);
    g.fillStyle = '#F1EDE4';
    g.font = '700 150px "Inter Tight", sans-serif';
    g.fillText(pad2(s.n), w / 2, 205);
    g.fillStyle = '#C9C3B6';
    g.font = '500 25px "JetBrains Mono", monospace';
    g.fillText(`${formatDewey(s.lo)}–${formatDewey(s.hi - 1)}`, w / 2, 262);
    g.fillStyle = '#34322E';
    g.fillRect(28, 296, w - 56, 2);
    g.fillStyle = '#9C978C';
    g.font = '700 28px "JetBrains Mono", monospace';
    g.textAlign = 'left';
    g.fillText('◂ A', 34, 346);
    g.textAlign = 'right';
    g.fillText('B ▸', w - 34, 346);
  });
}

function fillerBooks(s) {
  const rnd = seededRandom(s.n * 7919);
  const reserved = BOOKS.filter((b) => b.stack.n === s.n);
  const items = [];

  for (const side of ['A', 'B']) {
    const sx = side === 'A' ? -1 : 1;
    for (let r = 1; r <= ROWS; r++) {
      const gaps = reserved.filter((b) => b.side === side && b.row === r).map((b) => b.t);
      let t = 0.02;
      while (t < 0.985) {
        const thick = (0.034 + rnd() * 0.045) / STACK_LEN; // as a fraction of the shelf
        const centre = t + thick / 2;
        if (gaps.some((g) => Math.abs(g - centre) < 0.016)) { t += thick + 0.0008; continue; } // keep space for a catalogue book
        if (rnd() < 0.025) { t += 0.02 + rnd() * 0.03; continue; } // the odd natural gap
        const h = 0.2 + rnd() * 0.085;
        const d = 0.2 + rnd() * 0.07;
        items.push({
          pos: [sx * (0.02 + d / 2 + 0.005), rowY(r) + 0.012 + h / 2, zAlongFace(side, centre)],
          size: [d, h, thick * STACK_LEN],
          color: SPINE_PALETTE[Math.floor(rnd() * rnd() * SPINE_PALETTE.length * 1.6) % SPINE_PALETTE.length],
        });
        t += thick + 0.0008;
      }
    }
  }
  return items;
}

export function buildShelves(scene) {
  const bookGeo = new THREE.BoxGeometry(1, 1, 1);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const scl = new THREE.Vector3();
  const col = new THREE.Color();

  return STACKS.map((s) => {
    const group = new THREE.Group();
    group.position.set(s.x, 0, s.z);
    scene.add(group);

    // frame
    const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.shelf, roughness: 0.88 });
    const part = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), frameMat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    };
    part(0.04, 2.2, STACK_LEN, 0, 1.1, 0); // centre divider
    part(0.72, 2.3, 0.06, 0, 1.15, STACK_LEN / 2 + 0.03); // end panels
    part(0.72, 2.3, 0.06, 0, 1.15, -STACK_LEN / 2 - 0.03);
    part(0.76, 0.05, STACK_LEN + 0.16, 0, 2.32, 0); // top cap
    part(0.72, 0.1, STACK_LEN, 0, 0.05, 0); // plinth
    for (let r = 1; r <= ROWS; r++) {
      part(0.34, 0.024, STACK_LEN, -0.19, rowY(r), 0);
      part(0.34, 0.024, STACK_LEN, 0.19, rowY(r), 0);
    }

    // end signs
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture(s) });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.9), signMat);
    sign.position.set(0, 1.55, STACK_LEN / 2 + 0.065);
    const signBack = sign.clone();
    signBack.position.z = -STACK_LEN / 2 - 0.065;
    signBack.rotation.y = Math.PI;
    group.add(sign, signBack);

    // books
    const items = fillerBooks(s);
    const bookMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.8 });
    const books = new THREE.InstancedMesh(bookGeo, bookMat, items.length);
    items.forEach((it, i) => {
      m4.compose(pos.set(...it.pos), q, scl.set(...it.size));
      books.setMatrixAt(i, m4);
      books.setColorAt(i, col.set(it.color));
    });
    books.instanceMatrix.needsUpdate = true;
    books.instanceColor.needsUpdate = true;
    books.receiveShadow = true;
    group.add(books);

    // the scene fades units in and out (x-ray view) through these materials
    return { s, group, materials: [frameMat, bookMat, signMat], opacity: 1, target: 1 };
  });
}

/** Ease every unit's opacity toward its target. Call once per frame. */
export function updateShelfFades(units, dt) {
  for (const u of units) {
    u.opacity += (u.target - u.opacity) * Math.min(1, dt * 6);
    const transparent = u.opacity < 0.995;
    for (const m of u.materials) {
      if (m.transparent !== transparent) {
        m.transparent = transparent;
        m.needsUpdate = true;
      }
      m.opacity = u.opacity;
      m.depthWrite = u.opacity > 0.5;
    }
    u.group.visible = u.opacity > 0.02;
  }
}
