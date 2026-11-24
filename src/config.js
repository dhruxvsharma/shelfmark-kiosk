/**
 * Kiosk configuration.
 * Everything that changes from one installation to another lives here.
 */
export const CONFIG = {
  library: {
    name: 'Manipal University Jaipur',
    building: 'Central Library',
    level: 2,
    kioskId: 'Kiosk 02',
  },

  /** Fixed design canvas. The stage is scaled to fit any screen. */
  stage: { width: 1920, height: 1080, topBar: 96 },

  /** Return to the start screen after this long without a touch. */
  idleTimeoutMs: 120_000,

  /** Converts 3D scene units to real-world metres for the walk estimate. */
  metresPerUnit: 1.5,
  walkingSpeedMps: 1.2,

  /** Shortcuts shown under the search bar on the home screen. */
  popularSearches: ['Everyday Things', 'Typography', 'Indian history', 'Kahneman'],

  /** The one accent colour. Used only for "your book is here". */
  accent: '#FF4D1A',
};
