/**
 * Orbit-style camera: a target point plus distance, yaw and pitch.
 * Views are presets of those six numbers; moving between them is a single
 * eased tween. Dragging adds a limited offset on top of the current view.
 */
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.state = { tx: 0, ty: 0, tz: 1.2, r: 62, yaw: -0.35, pitch: 1.15 };
    this.user = { yaw: 0, pitch: 0, zoom: 1 };
    this.tween = null;
  }

  jump(preset) {
    Object.assign(this.state, preset);
    this.user = { yaw: 0, pitch: 0, zoom: 1 };
  }

  /** Move to a preset. Resolves when the move ends. */
  tweenTo(preset, duration = 1600) {
    return new Promise((resolve) => {
      const s = this.state;
      const u = this.user;
      // start from wherever the user has dragged to
      const from = { ...s, yaw: s.yaw + u.yaw, pitch: s.pitch + u.pitch, r: s.r * u.zoom };
      this.user = { yaw: 0, pitch: 0, zoom: 1 };
      // turn the short way round
      let dy = preset.yaw - from.yaw;
      while (dy > Math.PI) dy -= 2 * Math.PI;
      while (dy < -Math.PI) dy += 2 * Math.PI;
      this.tween = { from, to: { ...preset, yaw: from.yaw + dy }, t0: performance.now(), duration, resolve };
    });
  }

  drag(dYaw, dPitch) {
    this.user.yaw = Math.max(-1.1, Math.min(1.1, dYaw));
    this.user.pitch = Math.max(-0.5, Math.min(0.6, dPitch));
  }

  zoom(factor) {
    this.user.zoom = Math.max(0.55, Math.min(1.5, this.user.zoom * factor));
  }

  update(now) {
    const tw = this.tween;
    if (tw) {
      const t = Math.min(1, (now - tw.t0) / tw.duration);
      const e = easeInOutCubic(t);
      for (const k in tw.to) this.state[k] = tw.from[k] + (tw.to[k] - tw.from[k]) * e;
      if (t >= 1) {
        this.tween = null;
        tw.resolve();
      }
    }
    const s = this.state;
    const u = this.user;
    const yaw = s.yaw + u.yaw;
    const pitch = Math.max(0.05, Math.min(1.45, s.pitch + u.pitch));
    const r = s.r * u.zoom;
    this.camera.position.set(
      s.tx + r * Math.cos(pitch) * Math.sin(yaw),
      s.ty + r * Math.sin(pitch),
      s.tz + r * Math.cos(pitch) * Math.cos(yaw),
    );
    this.camera.lookAt(s.tx, s.ty, s.tz);
  }
}
