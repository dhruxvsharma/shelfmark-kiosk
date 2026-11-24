/**
 * Shared colours, materials and canvas-text textures.
 * three.js manages colour spaces itself (r152+), so hex values here are plain sRGB.
 */
import * as THREE from 'three';
import { CONFIG } from '../config.js';

export const ACCENT = CONFIG.accent;

export const COLORS = {
  background: '#0B0B0A',
  floor: '#1B1A18',
  zoneCarpet: '#22211E',
  wall: '#2A2926',
  furniture: '#3A3834',
  core: '#2E2D2A',
  desk: '#D8D1C2',
  table: '#8A7660',
  shelf: '#E9E3D6',
  plant: '#3F6E5B',
  paper: '#F1EDE4',
};

/** Book spine colours used for the filler books on every shelf. */
export const SPINE_PALETTE = [
  '#E8E2D4', '#DCD4C3', '#CFC6B3', '#2B3A55', '#9E2B25', '#E2B857', '#3F6E5B', '#B9A6D9',
  '#E99AAE', '#1E1E1E', '#4F6BD8', '#8C9A4B', '#F3EFE7', '#6F8FAF', '#C9B79C',
];

export const matte = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0 });

/** Draws onto a 2D canvas and returns it as a texture. */
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Flat text painted on the floor, readable from the entrance. */
export function floorText(scene, { x, z, w, h }, draw) {
  const tex = canvasTexture(w * 64, h * 64, draw);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, 0.012, z);
  scene.add(mesh);
  return mesh;
}

/** Small uppercase mono label (lounge, lifts, help desk…). */
export const monoLabel = (text) => (g, w, h) => {
  g.fillStyle = '#6E6A62';
  g.font = `500 ${h * 0.5}px "JetBrains Mono", monospace`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2);
};
