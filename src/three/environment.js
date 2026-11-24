/** The room: lights, floor, zone carpets, walls, furniture and the kiosk itself. */
import * as THREE from 'three';
import { ZONES, KIOSK_POS } from '../data/layout.js';
import { COLORS, matte, floorText, monoLabel } from './materials.js';

export function addLights(scene) {
  // three r155+ uses physical light units, hence the × π
  scene.add(new THREE.HemisphereLight('#FFF7EA', '#26231F', 0.75 * Math.PI));

  const sun = new THREE.DirectionalLight('#FFF4E4', 0.85 * Math.PI);
  sun.position.set(12, 26, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 70 });
  sun.shadow.bias = -0.0008;
  sun.shadow.radius = 3;
  scene.add(sun);

  const fill = new THREE.DirectionalLight('#DCE4FF', 0.25 * Math.PI);
  fill.position.set(-14, 10, -12);
  scene.add(fill);
}

function box(scene, [w, h, d], [x, y, z], material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  scene.add(m);
  return m;
}

export function buildRoom(scene) {
  scene.background = new THREE.Color(COLORS.background);
  scene.fog = new THREE.Fog(COLORS.background, 70, 120);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(34, 0.4, 32), matte(COLORS.floor));
  floor.position.set(0, -0.2, 1.5);
  floor.receiveShadow = true;
  scene.add(floor);

  // zone carpets + painted zone names
  Object.values(ZONES).forEach((z) => {
    const carpet = new THREE.Mesh(new THREE.PlaneGeometry(11, 7.4), matte(COLORS.zoneCarpet));
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(z.cx, 0.005, z.cz);
    carpet.receiveShadow = true;
    scene.add(carpet);

    floorText(scene, { x: z.cx, z: z.cz + 4.35, w: 11, h: 1.4 }, (g, w, h) => {
      g.textBaseline = 'middle';
      g.fillStyle = '#A29C90';
      g.font = `700 ${h * 0.78}px "Inter Tight", sans-serif`;
      g.fillText(z.id, 6, h * 0.54);
      g.fillStyle = '#8A857A';
      g.font = `600 ${h * 0.3}px "JetBrains Mono", monospace`;
      g.fillText(z.name.toUpperCase(), h * 0.72, h * 0.55);
    });
  });

  // low perimeter walls, with a gap for the entrance
  const wall = matte(COLORS.wall);
  box(scene, [34, 0.5, 0.3], [0, 0.25, -14.4], wall);
  box(scene, [0.3, 0.5, 32], [-16.9, 0.25, 1.5], wall);
  box(scene, [0.3, 0.5, 32], [16.9, 0.25, 1.5], wall);
  box(scene, [13.5, 0.5, 0.3], [-10.25, 0.25, 17.4], wall);
  box(scene, [13.5, 0.5, 0.3], [10.25, 0.25, 17.4], wall);

  // landmarks
  box(scene, [3.4, 2.6, 2.4], [-12.5, 1.3, 14.2], matte(COLORS.core)); // lifts & stairs
  box(scene, [3.2, 0.9, 0.9], [6.5, 0.45, 13.2], matte(COLORS.desk)); // help desk
  [[-2.6, -10], [0, -9.2], [2.6, -10]].forEach(([x, z]) => {
    box(scene, [1.8, 0.08, 1.1], [x, 0.72, z], matte(COLORS.table)); // reading tables
    box(scene, [1.2, 0.7, 0.5], [x, 0.36, z], matte(COLORS.core));
  });
  [[-14.6, -11.5], [14.6, -11.5], [-14.6, 9.5], [14.6, 9.5]].forEach(([x, z]) => {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.28, 0.6, 20), matte(COLORS.core));
    pot.position.set(x, 0.3, z);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), matte(COLORS.plant));
    leaves.position.set(x, 0.95, z);
    leaves.scale.y = 1.2;
    scene.add(pot, leaves);
  });

  floorText(scene, { x: 0, z: -11.2, w: 6, h: 0.7 }, monoLabel('READING LOUNGE'));
  floorText(scene, { x: -12.5, z: 11.4, w: 5, h: 0.6 }, monoLabel('LIFTS & STAIRS'));
  floorText(scene, { x: 6.5, z: 11.6, w: 4, h: 0.6 }, monoLabel('HELP DESK'));
  floorText(scene, { x: 0, z: 16.6, w: 4, h: 0.55 }, monoLabel('ENTRANCE'));

  // the kiosk and its "you are here" ring
  box(scene, [0.9, 1.5, 0.18], [KIOSK_POS.x, 0.75, KIOSK_POS.z], matte(COLORS.paper));
  const hereRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.68, 48),
    new THREE.MeshBasicMaterial({ color: COLORS.paper, transparent: true }),
  );
  hereRing.rotation.x = -Math.PI / 2;
  hereRing.position.set(KIOSK_POS.x, 0.02, KIOSK_POS.z - 0.7);
  scene.add(hereRing);

  return { hereRing, kiosk: new THREE.Vector3(KIOSK_POS.x, 0, KIOSK_POS.z) };
}
