/**
 * The whole UI is designed on a fixed 1920×1080 stage and scaled to fit
 * the screen, letterboxed. Pointer maths in the 3D view reads the scale.
 */
import { CONFIG } from '../config.js';
import { $ } from '../lib/util.js';

let scale = 1;
export const stageScale = () => scale;

export function initStage() {
  const stage = $('#stage');
  const { width, height } = CONFIG.stage;
  const fit = () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    scale = Math.min(vw / width, vh / height);
    stage.style.transform = `translate(${(vw - width * scale) / 2}px, ${(vh - height * scale) / 2}px) scale(${scale})`;
  };
  window.addEventListener('resize', fit);
  fit();
}
