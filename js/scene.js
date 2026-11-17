// A diorama: one set of the story, built from the kit and lit by its mood (sky, fog, moon or sun, the colour grade,
// bloom and rain). Each set (sets.js) fills the group, names its marks (spots the script can stand people on), says
// where the floor is (so people on a rocking boat or a sloping roof stand on it), and answers triggers (a bridge
// falls, a candle goes out, a door is broken in).
import { THREE } from './render.js?v=3';

export const MOODS = {
  rain:  { sky: ['#0a1222', '#2a3a58'], fog: ['#121a28', 16, 70], hemi: ['#4a5e8a', '#0c0c14', 0.75], key: ['#9ab4f0', 0.8, [-10, 22, 12]], exposure: 1.18, tint: [0.88, 0.97, 1.16], sat: 0.92, contrast: 1.08, bloom: [0.62, 0.5, 0.78], lift: [0.0, 0.01, 0.03] },
  hall:  { sky: ['#0a0606', '#1a100a'], fog: ['#1a1008', 30, 80], hemi: ['#a88a6a', '#2a1a10', 0.62], key: ['#ffd8a8', 0.75, [6, 20, 16]], exposure: 1.12, tint: [1.08, 1.0, 0.88], sat: 1.06, contrast: 1.06, bloom: [0.55, 0.5, 0.8], lift: [0.02, 0.01, 0.0] },
  dim:   { sky: ['#050508', '#101018'], fog: ['#0c0c14', 24, 70], hemi: ['#7a7a9a', '#2a1a14', 0.85], key: ['#8aa0e0', 0.45, [-4, 18, -14]], exposure: 1.18, tint: [1.0, 0.98, 1.04], sat: 0.96, contrast: 1.08, bloom: [0.65, 0.5, 0.75], lift: [0.01, 0.01, 0.03] },
  dawn:  { sky: ['#6a7a98', '#e8c4b0'], fog: ['#a8b0c0', 24, 90], hemi: ['#c0c8e0', '#4a4a50', 1.0], key: ['#ffd2b0', 1.5, [-24, 14, 10]], exposure: 1.06, tint: [0.98, 1.0, 1.04], sat: 0.86, contrast: 1.02, bloom: [0.35, 0.5, 0.85], lift: [0.03, 0.03, 0.05] },
  day:   { sky: ['#7ab0e0', '#e8e0c8'], fog: ['#d8d0c0', 40, 120], hemi: ['#e0e8f0', '#6a5a40', 1.05], key: ['#fff0d8', 2.2, [-14, 22, 10]], exposure: 1.06, tint: [1.04, 1.0, 0.94], sat: 1.04, contrast: 1.05, bloom: [0.32, 0.5, 0.88], lift: [0.01, 0.0, 0.0] },
  golden:{ sky: ['#3a5a8a', '#f0b880'], fog: ['#d8b898', 46, 140], hemi: ['#c8d0e8', '#5a4a30', 0.95], key: ['#ffd098', 2.1, [-26, 18, 14]], exposure: 1.08, tint: [1.06, 1.0, 0.92], sat: 1.08, contrast: 1.06, bloom: [0.4, 0.5, 0.85], lift: [0.0, 0.0, 0.02] },
  // book two: brighter, clearer light
  sunset:  { sky: ['#2a3a6a', '#ff9a5a'], fog: ['#e8a070', 50, 170], hemi: ['#d8c8e8', '#6a4a3a', 1.15], key: ['#ffb070', 2.6, [-30, 12, 10]], exposure: 1.16, tint: [1.08, 0.98, 0.9], sat: 1.12, contrast: 1.06, bloom: [0.5, 0.55, 0.8], lift: [0.02, 0.0, 0.03] },
  valley:  { sky: ['#6ab0e8', '#e8f0e8'], fog: ['#cfe2e0', 34, 130], hemi: ['#e8f4f0', '#5a6a48', 1.3], key: ['#fff4dc', 2.5, [-14, 24, 12]], exposure: 1.14, tint: [1.0, 1.02, 1.0], sat: 1.1, contrast: 1.05, bloom: [0.36, 0.5, 0.86], lift: [0.01, 0.02, 0.02] },
  sunrise: { sky: ['#4a6aa8', '#ffc8a0'], fog: ['#f0c8b0', 30, 130], hemi: ['#e0d8f0', '#5a5040', 1.15], key: ['#ffc890', 2.4, [-26, 10, 14]], exposure: 1.14, tint: [1.06, 1.0, 0.96], sat: 1.08, contrast: 1.04, bloom: [0.48, 0.55, 0.82], lift: [0.02, 0.01, 0.03] },
  rainday: { sky: ['#5a6878', '#a8b4bc'], fog: ['#98a4ac', 18, 90], hemi: ['#c0ccd8', '#3a4038', 1.25], key: ['#dce4f0', 1.3, [-10, 24, 10]], exposure: 1.14, tint: [0.96, 1.0, 1.04], sat: 0.95, contrast: 1.05, bloom: [0.3, 0.5, 0.88], lift: [0.01, 0.02, 0.03] },
  night:   { sky: ['#0a1430', '#2a3a6a'], fog: ['#1a2440', 26, 110], hemi: ['#8aa0d8', '#1a1a2a', 1.0], key: ['#b8ccff', 1.4, [12, 24, -6]], exposure: 1.22, tint: [0.92, 0.98, 1.12], sat: 0.98, contrast: 1.06, bloom: [0.6, 0.55, 0.78], lift: [0.0, 0.02, 0.05] },
  snownight: { sky: ['#0e1a3a', '#3a4a7a'], fog: ['#2a3456', 24, 100], hemi: ['#b0c4f0', '#3a4058', 1.25], key: ['#d0dcff', 1.8, [14, 22, -4]], exposure: 1.2, tint: [0.94, 0.98, 1.1], sat: 0.95, contrast: 1.06, bloom: [0.55, 0.55, 0.8], lift: [0.01, 0.02, 0.05] },
  cave:    { sky: ['#050a10', '#0a1a24'], fog: ['#0a1820', 14, 50], hemi: ['#6a9ab0', '#1a1410', 1.0], key: ['#9ad0e8', 1.2, [0, 14, 18]], exposure: 1.22, tint: [0.94, 1.02, 1.08], sat: 1.0, contrast: 1.08, bloom: [0.65, 0.55, 0.76], lift: [0.0, 0.02, 0.04] },
  maple:   { sky: ['#3a1a3a', '#ff7a4a'], fog: ['#c8604a', 36, 140], hemi: ['#f0c0b0', '#4a2020', 1.1], key: ['#ff9a60', 2.4, [-26, 14, 12]], exposure: 1.14, tint: [1.08, 0.96, 0.92], sat: 1.12, contrast: 1.08, bloom: [0.5, 0.55, 0.8], lift: [0.03, 0.0, 0.02] },
  dusk:    { sky: ['#1a2450', '#e88a6a'], fog: ['#6a5a70', 30, 120], hemi: ['#b8b0d8', '#3a2a2a', 1.05], key: ['#ffb080', 1.6, [-24, 10, 12]], exposure: 1.18, tint: [1.04, 0.98, 0.98], sat: 1.06, contrast: 1.06, bloom: [0.55, 0.55, 0.78], lift: [0.02, 0.01, 0.04] },
  bright:  { sky: ['#5aa0e0', '#e8f0f4'], fog: ['#d8e4ea', 40, 150], hemi: ['#eef4f8', '#6a5a40', 1.3], key: ['#fff2dc', 2.6, [-16, 24, 12]], exposure: 1.12, tint: [1.02, 1.0, 0.98], sat: 1.1, contrast: 1.05, bloom: [0.32, 0.5, 0.88], lift: [0.01, 0.01, 0.02] },
  close: { sky: ['#0a0604', '#140c08'], fog: ['#0a0604', 20, 60], hemi: ['#a88a6a', '#1a1008', 0.55], key: ['#ffd0a0', 0.9, [-4, 10, 8]], exposure: 1.14, tint: [1.08, 1.0, 0.88], sat: 1.02, contrast: 1.08, bloom: [0.5, 0.5, 0.8], lift: [0.0, 0.0, 0.0] },
};
function skyTex([a, b]) { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, a); g.addColorStop(1, b); x.fillStyle = g; x.fillRect(0, 0, 4, 256); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

export class Diorama {
  constructor(V) { this.V = V; this.group = null; this.ticks = []; this.marks = {}; this.name = ''; }
  clear() {
    const sc = this.V.scene;
    if (this.group) { sc.remove(this.group); const texs = new Set(); this.group.traverse((o) => { o.geometry?.dispose?.(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { for (const k of ['map', 'alphaMap', 'emissiveMap', 'normalMap', 'bumpMap', 'roughnessMap', 'lightMap', 'aoMap']) if (m[k] && m[k].isTexture) texs.add(m[k]); m.dispose(); }); });
      // the old set's textures leave the GPU too (iPhone and iPad have little memory to spare); a texture used again is simply uploaded again
      for (const t of texs) t.dispose(); }
    this.group = new THREE.Group(); sc.add(this.group); this.ticks = []; this.marks = {}; this.triggers = {}; this.state = {}; this.water = null; this.flakes = null; this.birds = null; this.river = null; this.reflect = []; this.floorAt = () => 0; this.rain = 0; this.wind = 1; this.lightning = 0; this.cam0 = { x: 0, y: 1.5, z: 0, d: 18, yaw: 0, pitch: 20, fov: 30 };
  }
  add(o, at) { if (at) o.position.set(...at); this.group.add(o); if (o.userData.tick) this.ticks.push(o.userData.tick); return o; }
  tick(f) { this.ticks.push(f); }
  mark(name, x, z, face = 1) { this.marks[name] = [x, z, face]; }
  build(name, builder, opts = {}) {
    this.clear(); this.name = name; this.opts = opts;
    const moodName = opts.mood || builder.mood || 'rain', M = MOODS[moodName]; this.mood = moodName; this.M = M;
    const V = this.V, sc = V.scene;
    sc.background = skyTex(M.sky); sc.fog = new THREE.Fog(M.fog[0], M.fog[1], M.fog[2]);
    V.renderer.toneMappingExposure = M.exposure;
    const G = V.grade.uniforms; G.tint.value.set(...M.tint); G.sat.value = M.sat; G.contrast.value = M.contrast; G.lift.value.set(...M.lift);
    V.bloom.strength = M.bloom[0]; V.bloom.radius = M.bloom[1]; V.bloom.threshold = M.bloom[2];
    this.hemi = this.add(new THREE.HemisphereLight(M.hemi[0], M.hemi[1], M.hemi[2])); this.hemiBase = M.hemi[2];
    const key = new THREE.DirectionalLight(M.key[0], M.key[1]); key.position.set(...M.key[2]); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; key.shadow.normalBias = 0.03;
    const s = key.shadow.camera; s.left = -22; s.right = 22; s.top = 16; s.bottom = -16; s.near = 1; s.far = 80; this.add(key); this.add(key.target); this.key = key; this.keyBase = M.key[1];
    builder(this, opts);
    return this;
  }
  trigger(ev, instant = false, arg) { const f = this.triggers[ev]; if (f) f(instant, arg); }
  // lightning: everything flashes cold for a moment
  flash(k) {
    this.hemi.intensity = this.hemiBase + k * 2.4; this.key.intensity = this.keyBase + k * 3;
    if (this.water) this.water.uniforms.flash.value = k * 0.8;
  }
  update(dt, t) {
    for (const f of this.ticks) f(dt, t, this.wind);
    if (this.water) { this.water.uniforms.time.value = t; }
  }
}
