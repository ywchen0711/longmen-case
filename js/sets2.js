// The sets of book two, built to be seen up close in bright light: layered depth (swaying grass and branches in the
// foreground, people in the middle, mountains fading into aerial haze behind), many props, a waterfall and lakes with
// foam, god rays, falling leaves, petals, snow or fireflies, birds crossing the sky.
//   cliff   斷魂崖: a plateau ending in a sheer drop to the river far below (prologue, chapter one, the title)
//   village 龍門刀莊: the saber manor's courtyard in the village (chapter one, the last scene at dusk)
//   valley  the hidden valley under the cliff: a waterfall into a lake, the old fisherman's hut (chapters two to four)
//   cave    behind the waterfall: a wall carved with a hundred-year-old master's sword marks
//   ledge   the high ledge where the red fruit grows above a sea of clouds
//   road    a mountain road (forest, or along a cliff, or by a lake at sunset)
//   maple   血楓谷: the Blood Saber hall among red maples (chapter six)
import { THREE, PX, rng, cutout, T, sh, box, lam, std, texMat, floor, wall, roof, lattice, pillar, railing, sign, jar, barrel, tree } from './kit.js?v=4';
import { waterMaterial, mist, shaft, lantern, glow } from './fx.js?v=4';
import { SETS } from './sets.js?v=4';

const V3 = THREE.Vector3;
// a pixel-art cut-out; far ones use mip-maps so they don't shimmer
function cut(c, scale = PX, o = {}) {
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace;
  if (o.far) { t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true; } else { t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; }
  const g = new THREE.PlaneGeometry(c.width * scale, c.height * scale); g.translate(0, c.height * scale / 2 - (o.sink || 0), 0);
  const mat = o.basic ? new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, fog: o.fog ?? true, color: o.color || '#ffffff' }) : new THREE.MeshLambertMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, emissive: new THREE.Color(o.glow || '#262626'), emissiveMap: t });
  const m = new THREE.Mesh(g, mat); m.castShadow = o.shadow !== false && !o.basic; if (m.castShadow) m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: 0.5 });
  return m;
}
const blob = (x, cx, cy, rx, ry, c) => { x.fillStyle = c; for (let yy = -ry; yy <= ry; yy++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (yy * yy) / (ry * ry)))); x.fillRect(Math.round(cx - w), Math.round(cy + yy), w * 2, 1); } };
// a swaying thing: turns a little about its foot
function sway(D, m, k = 0.03, sp = 1) { const ph = Math.random() * 6; D.tick((dt, t) => { m.rotation.z = Math.sin(t * sp + ph) * k + Math.sin(t * sp * 2.3 + ph) * k * 0.3; }); return m; }

// ---------------------------------------------------------------- nature
// far mountain ridges: each layer a silhouette tinted toward the haze, nearer layers darker and more detailed
function ridges(D, layers) {
  for (const L of layers) {
    const r = rng(L.seed || 5), W = 512, H = 96, c = cutout(W, H, (x) => {
      const ph = [r() * 6, r() * 6, r() * 6], pk = L.peaks || 3;
      const hAt = (i) => { const u = i / W; let h = 0.45 + 0.22 * Math.sin(u * Math.PI * pk + ph[0]) + 0.12 * Math.sin(u * Math.PI * pk * 2.7 + ph[1]) + 0.06 * Math.sin(u * Math.PI * pk * 7 + ph[2]); return Math.max(0.08, Math.min(0.98, h * (L.amp || 1))); };
      for (let i = 0; i < W; i += 2) {
        const h = Math.round(hAt(i) * H), top = H - h;
        x.fillStyle = L.col; x.fillRect(i, top, 2, h);
        x.fillStyle = sh(L.col, 1.12); x.fillRect(i, top, 2, 2);
        if (L.lit) { const sl = hAt(i + 4) - hAt(i - 4); if (sl < 0) { x.fillStyle = sh(L.col, 1.08); x.fillRect(i, top + 2, 2, Math.round(h * 0.4)); } }
        if (L.snow && h > H * L.snow) { x.fillStyle = L.snowC || '#e8eef6'; x.fillRect(i, top, 2, Math.round((h - H * L.snow) * 0.6) + 2); }
        if (L.trees && r() < 0.5) { x.fillStyle = sh(L.col, 0.8); x.fillRect(i, top - 2, 2, 3); }
      }
      if (L.fade) { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, L.fade); x.globalCompositeOperation = 'source-atop'; x.fillStyle = g; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over'; }
    });
    const m = cut(c, (L.w || 300) / W, { basic: true, fog: false, far: true, shadow: false }); m.scale.y = (L.h || 40) / (H * (L.w || 300) / W); m.position.set(L.x || 0, L.y || -4, L.z); m.renderOrder = -1; D.add(m);
  }
}
function sun(D, at, col = '#ffd890', size = 9, o = {}) {
  const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cutout(32, 32, (x) => blob(x, 16, 16, 12, 12, '#ffffff'))), color: o.disc || '#fff6e0', fog: false, transparent: true })); disc.scale.set(size * 0.35, size * 0.35, 1); disc.position.set(...at); D.add(disc);
  const g = glow(col, size * 2.2, o.op ?? 0.75); g.position.set(...at); g.material.fog = false; D.add(g);
  const g2 = glow(col, size * 5, (o.op ?? 0.75) * 0.35); g2.position.set(...at); D.add(g2);
}
function clouds(D, list, col = '#ffffff', op = 0.9) {
  for (const [x, y, z, w, seed] of list) {
    const r = rng(seed || 3), c = cutout(64, 20, (cx) => { for (let i = 0; i < 9; i++) blob(cx, 10 + r() * 44, 12 + r() * 4, 5 + r() * 9, 3 + r() * 4, sh(col, 0.88)); for (let i = 0; i < 7; i++) blob(cx, 12 + r() * 40, 10 + r() * 3, 4 + r() * 7, 2 + r() * 3, col); });
    const m = cut(c, w / 64, { basic: true, fog: false, far: true, shadow: false }); m.material.transparent = true; m.material.opacity = op; m.position.set(x, y, z); m.renderOrder = -1; D.add(m);
    const sp = 0.15 + r() * 0.2, x0 = x; D.tick((dt, t) => { m.position.x = x0 + Math.sin(t * 0.01 + seed) * 6 + t * sp * 0.02; });
  }
}
// trees: the kit's pine and broad-leaf, plus red and gold maples, a gnarled cliff pine, bamboo
function maple(seed = 1, s = 1, cols = ['#7a1410', '#b8241a', '#e04a24', '#f08a3a']) {
  const r = rng(seed), c = cutout(80, 96, (x) => {
    x.fillStyle = '#3a2418'; x.fillRect(37, 50, 6, 46); x.fillRect(30, 58, 8, 3); x.fillRect(43, 54, 10, 3); x.fillStyle = '#5a3a24'; x.fillRect(37, 50, 2, 46);
    const P = []; for (let i = 0; i < 9; i++) P.push([16 + r() * 48, 18 + r() * 36, 9 + r() * 9]);
    for (const [cx, cy, rr] of P) blob(x, cx, cy + 2, rr, rr * 0.8, cols[0]);
    for (const [cx, cy, rr] of P) blob(x, cx - 1, cy - 1, rr - 2, (rr - 2) * 0.8, cols[1]);
    for (const [cx, cy, rr] of P) blob(x, cx - 3, cy - 3, Math.max(2, rr - 6), Math.max(2, rr - 6) * 0.7, cols[2]);
    for (let i = 0; i < 60; i++) { x.fillStyle = r() < 0.5 ? cols[3] : cols[1]; x.fillRect(Math.floor(10 + r() * 60), Math.floor(8 + r() * 50), 2, 1); }
  });
  return cut(c, PX * s);
}
function cliffPine(seed = 2, s = 1) {
  const r = rng(seed), c = cutout(96, 80, (x) => {
    x.fillStyle = '#3a2a1e'; let px = 30, py = 80; for (let i = 0; i < 26; i++) { x.fillRect(Math.round(px), Math.round(py) - 3, 5, 4); px += 1.6; py -= 1.9; }
    x.fillStyle = '#4e3a28'; px = 30; py = 80; for (let i = 0; i < 26; i++) { x.fillRect(Math.round(px), Math.round(py) - 3, 2, 4); px += 1.6; py -= 1.9; }
    for (const [cx, cy, w] of [[70, 26, 26], [52, 36, 18], [80, 16, 16], [40, 46, 14]]) { blob(x, cx, cy + 2, w, 5, '#1a3424'); blob(x, cx - 1, cy, w - 3, 4, '#2a4e34'); blob(x, cx - 3, cy - 2, w - 9, 2, '#4a7a4a'); }
  });
  return cut(c, PX * s);
}
function bamboo(seed = 3, s = 1) { return tree('bamboo', seed, s); }
function tuftCanvas(seed, cols = ['#4a7a2e', '#6a9a3a', '#8aba4a'], h = 14) {
  const r = rng(seed); return cutout(24, h, (x) => { for (let i = 0; i < 12; i++) { const gx = 2 + Math.floor(r() * 20), hh = 4 + Math.floor(r() * (h - 4)), lean = r() < 0.5 ? -1 : 1; x.fillStyle = cols[i % 3]; for (let y = 0; y < hh; y++) x.fillRect(gx + Math.round(lean * y * y / (hh * 3)), h - 1 - y, 1, 1); } if (r() < 0.4) { x.fillStyle = ['#f0e070', '#f0a0c0', '#ffffff', '#e8604a'][Math.floor(r() * 4)]; x.fillRect(4 + Math.floor(r() * 16), 2 + Math.floor(r() * 4), 2, 2); } });
}
// a field of grass tufts that sway in the wind (one tick for all of them)
function grass(D, n, box3, o = {}) {
  const r = rng(o.seed || 11), list = [], cvs = [0, 1, 2, 3].map((k) => tuftCanvas(k + (o.seed || 1) * 5, o.cols, o.h || 14));
  for (let i = 0; i < n; i++) { const x = box3[0] + r() * (box3[1] - box3[0]), z = box3[2] + r() * (box3[3] - box3[2]); if (o.avoid && o.avoid(x, z)) continue; const m = cut(cvs[i % 4], PX * (o.s || 0.62) * (0.8 + r() * 0.5), { shadow: false }); m.position.set(x, o.y ? o.y(x, z) : 0, z); D.add(m); list.push([m, r() * 6]); }
  // tufts right in front of the lens step out of the picture, so a close camera never looks through a wall of grass
  const cp = new V3();
  D.tick((dt, t, w = 1) => { const cam = D.V.camera; cp.copy(cam.position); for (const [m, ph] of list) { m.rotation.z = Math.sin(t * 1.6 + ph + m.position.x * 0.3) * 0.12 * w; const dx = m.position.x - cp.x, dz = m.position.z - cp.z; m.visible = dx * dx + dz * dz > (o.near || 30); } });
}
function rock(r = 1, col = '#7a7468', o = {}) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), lam({ map: T.rock(col), flatShading: true, color: o.tint || '#ffffff' })); m.scale.set(o.sx || 1.3, o.sy || 0.8, o.sz || 1); m.rotation.set(Math.random(), Math.random() * 3, Math.random() * 0.4); m.castShadow = m.receiveShadow = true; return m;
}
// a campfire: logs, flickering flames, a warm light, sparks rising
function fire(D, x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); D.add(g);
  for (let i = 0; i < 4; i++) { const l = box(1.0 * s, 0.16 * s, 0.16 * s, lam({ color: '#4a3020' })); l.rotation.y = i * 0.8; l.position.y = 0.08; g.add(l); }
  for (let i = 0; i < 7; i++) { const st = rock(0.18 * s, '#6a6460'); st.position.set(Math.cos(i * 0.9) * 0.6 * s, 0.08, Math.sin(i * 0.9) * 0.45 * s); g.add(st); }
  const frames = [0, 1, 2].map((k) => cutout(12, 18, (c) => { const r = rng(k + 3); blob(c, 6, 13, 5, 5, '#e84a1a'); for (let i = 0; i < 4; i++) blob(c, 3 + r() * 6, 6 + r() * 6, 2, 4, '#ff8a2a'); blob(c, 6, 12, 3, 4, '#ffd060'); blob(c, 6, 13, 1, 2, '#ffffff'); }));
  const texs = frames.map((c) => { const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace; return t; });
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: texs[0], transparent: true })); fl.scale.set(0.75 * s, 1.1 * s, 1); fl.position.y = 0.6 * s; g.add(fl);
  const h = glow('#ff8a3a', 3.2 * s, 0.6); h.position.y = 0.7; g.add(h);
  const L = new THREE.PointLight('#ff9a4a', 9 * s, 9 * s, 1.6); L.position.y = 1.0; g.add(L);
  D.tick((dt, t) => { fl.material.map = texs[Math.floor(t * 9) % 3]; const f = 0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 31) * 0.06; L.intensity = 9 * s * f; h.scale.setScalar(3.2 * s * f); if (D.fx2 && Math.random() < dt * 8) D.fx2.bits.spawn(new V3(x + (Math.random() - 0.5) * 0.3, 0.8, z), new V3((Math.random() - 0.5) * 0.4, 1.4 + Math.random(), 0), { color: Math.random() < 0.5 ? '#ffb040' : '#ff6a20', size: 0.06, life: 1.2, alpha: 1 }); });
  return g;
}
// the waterfall: a pixel-quantised curtain of falling water that can part around someone (trigger part/unpart)
function waterfall(D, x, z, w, h, o = {}) {
  const mat = new THREE.ShaderMaterial({ fog: true, transparent: false,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { t: { value: 0 }, part: { value: 0 }, px: { value: 0.5 }, size: { value: new THREE.Vector2(w * 16, h * 16) }, c1: { value: new THREE.Color(o.c1 || '#5aa0c8') }, c2: { value: new THREE.Color(o.c2 || '#8ac8e4') }, c3: { value: new THREE.Color(o.c3 || '#f4fbff') }, dark: { value: new THREE.Color(o.dark || '#1a2a30') } }]),
    vertexShader: `varying vec2 vUv;
      #include <fog_pars_vertex>
      void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `uniform float t, part, px; uniform vec2 size; uniform vec3 c1, c2, c3, dark; varying vec2 vUv;
      #include <fog_pars_fragment>
      float h(float x){ return fract(sin(x * 127.1) * 43758.5453); }
      void main(){
        vec2 q = floor(vUv * size); vec2 p = q / size;
        float col = q.x, sp = 0.7 + h(col) * 0.9;
        float f = fract(p.y * 2.6 + t * sp * 0.9 + h(col + 7.0));
        float g = fract(p.y * 7.0 + t * sp * 2.1 + h(col + 2.0));
        vec3 c = mix(c1, c2, step(0.45, h(col + 3.0)));
        if (f > 0.84) c = mix(c, c3, 0.9); else if (g > 0.9) c = mix(c, c3, 0.5); else if (h(col + 11.0) < 0.12) c = mix(c, c1 * 0.75, 0.6);
        float e = min(vUv.x, 1.0 - vUv.x); if (e < 0.02 + 0.03 * h(floor(q.y * 0.25) + 3.0)) discard;
        float gap = part * 0.16 * smoothstep(0.0, 0.18, vUv.y), dx = abs(vUv.x - px);
        if (dx < gap) { gl_FragColor = vec4(dark, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
          return; }
        if (part > 0.0 && dx < gap + 0.025) c = c3;
        if (vUv.y < 0.05 + 0.03 * h(col + floor(t * 6.0))) c = mix(c, c3, 0.85);
        gl_FragColor = vec4(c * 1.08, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }` });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, (o.y0 || 0) + h / 2, z); D.add(m);
  const st = { part: 0, to: 0 };
  D.tick((dt, t) => { mat.uniforms.t.value = t; st.part += (st.to - st.part) * Math.min(1, dt * 3); mat.uniforms.part.value = st.part;
    if (D.fx2 && Math.random() < dt * 40) { const sx = x + (Math.random() - 0.5) * w; D.fx2.bits.spawn(new V3(sx, (o.y0 || 0) + 0.2, z + 0.4), new V3((Math.random() - 0.5) * 1.5, 1.5 + Math.random() * 2.5, 0.6 + Math.random()), { color: Math.random() < 0.5 ? '#ffffff' : '#d8ecf8', size: 0.12 + Math.random() * 0.14, size1: 0.3, life: 0.9, g: 3, drag: 1, alpha: 0.8, round: true }); } });
  D.triggers.part = (inst, arg) => { st.to = 1; if (inst) st.part = 1; if (arg != null) mat.uniforms.px.value = arg; };
  D.triggers.unpart = (inst) => { st.to = 0; if (inst) st.part = 0; };
  // foam where it lands, mist rising
  for (let i = 0; i < 3; i++) { const fm = mist(w * 1.8, 3, '#ffffff', 0.5 - i * 0.12); fm.position.set(x, (o.y0 || 0) + 0.8 + i * 1.6, z + 0.8 + i * 0.4); D.add(fm); }
  return m;
}
function lake(D, w, d, at, o = {}) {
  const mat = waterMaterial({ deep: o.deep || '#1a4a5a', shallow: o.shallow || '#3a8a96', hi: o.hi || '#c8ecf0', flow: o.flow || [0.15, 0.25], rough: 0.8, rain: o.rain || 0 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(...at); D.add(m); D.water = mat; return m;
}
// a pixel bird-free foreground branch hanging into the top corner
function branch(D, at, s = 1, flip = 1, cols = ['#1e3a22', '#2e5a32', '#4a7e42']) {
  const r = rng(at[0] * 7 + 3), c = cutout(96, 48, (x) => { x.fillStyle = '#2a1e16'; for (let i = 0; i < 90; i++) x.fillRect(i, Math.round(4 + i * 0.12 + Math.sin(i * 0.1) * 2), 1, 3); for (let i = 0; i < 16; i++) { const cx = 10 + r() * 80, cy = 10 + r() * 22; blob(x, cx, cy, 8 + r() * 6, 4 + r() * 3, cols[0]); blob(x, cx - 1, cy - 1, 6 + r() * 4, 3 + r() * 2, cols[1]); blob(x, cx - 3, cy - 2, 3, 1.5, cols[2]); } });
  const m = cut(c, PX * s, { shadow: false }); m.position.set(...at); m.scale.x = flip; m.rotation.z = Math.PI; D.add(m); sway(D, m, 0.02, 0.7); D.tick(() => { const cp = D.V.camera.position; m.visible = Math.hypot(m.position.x - cp.x, m.position.z - cp.z) > 6; }); return m;
}
function birdsAndLeaves(D, o) { if (o.birds !== 0) D.birds = { n: 6, y: o.by || 16, z: o.bz || -50, span: 120, period: 22, color: o.bc }; }

// ================================================================ 斷魂崖: the cliff over the river
function cliff(D, o) {
  const mood = D.mood, eve = mood === 'sunset' || mood === 'golden' || mood === 'dusk';
  D.cam0 = { x: 0, y: 1.6, z: 0, d: 16, yaw: 0, pitch: 8, fov: 30 };
  // the plateau and the sheer face
  const top = box(48, 46, 30, lam({ map: (() => { const t = T.rock('#6a6258').clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 12); return t; })() }));
  top.position.set(-17.5, -23, -3); D.add(top);
  D.add(floor(T.grass(eve ? '#7a7a3e' : '#6a8a3e'), -18, -3, 47.6, 30, 0.01, { unit: 2 }));
  for (let z = -16; z < 12; z += 1.3) { const big = z < -1.5; const rk = rock(big ? 0.6 + Math.random() * 0.7 : 0.25 + Math.random() * 0.2, '#7a7062', { sy: big ? 0.7 : 0.5 }); rk.position.set(6.3 + Math.random() * 0.4, 0, z); D.add(rk); }
  for (let i = 0; i < 9; i++) { const rk = rock(0.6 + Math.random(), '#6e665a', { sy: 0.6 }); rk.position.set(-14 + Math.random() * 14, 0.1, -12 + Math.random() * 5); D.add(rk); }
  // the face going down, with ledges and hanging roots
  for (let i = 0; i < 14; i++) { const rk = rock(1.5 + Math.random() * 2, '#5e564e', { sx: 1, sy: 1.6, sz: 1.2 }); rk.position.set(5.6 + Math.random() * 0.8, -4 - i * 3, -12 + Math.random() * 10); D.add(rk); }
  // a warm fill from the open side, so the sheer face isn't a black wall
  { const fl = new THREE.DirectionalLight(eve ? '#ffb890' : '#e8f0ff', 1.6); fl.position.set(40, 10, 20); D.add(fl); D.add(fl.target); fl.target.position.set(0, -20, 0); }
  // the river far below, its banks, the mist between
  lake(D, 260, 200, [60, -42, -40], { deep: '#1a3a4a', shallow: '#3a7a88', hi: '#e0f0f0', flow: [0.9, 0.2] });
  for (let i = 0; i < 10; i++) { const fm = mist(30, 2, '#ffffff', 0.35); fm.position.set(14 + i * 6, -41.6, -30 + i * 6); fm.rotation.x = -1.3; D.add(fm); }
  D.add(at(box(120, 30, 40, lam({ map: T.rock('#5a5a4e') })), [80, -27, -70]));
  for (let i = 0; i < 26; i++) { const t2 = tree(i % 3 ? 'pine' : 'broad', i * 13, 2.2); t2.position.set(40 + i * 3.2, -12, -52 - (i % 4) * 2); D.add(t2); }
  for (const [y, op] of [[-30, 0.45], [-22, 0.35], [-14, 0.22]]) { const m = mist(200, 9, eve ? '#f8d8c0' : '#f0f4f8', op); m.position.set(40, y, -20); D.add(m); }
  // far mountains in layers of haze, the low sun, clouds, birds
  const haze = eve ? ['#c86a5a', '#a85a5a', '#7a4a52', '#4a3442'] : ['#a8c0d0', '#7a98a8', '#5a7a7a', '#3a5a4a'];
  ridges(D, [{ z: -190, y: -30, w: 520, h: 70, col: haze[0], seed: 3, peaks: 4, snow: 0.78, snowC: eve ? '#ffd8c0' : '#f0f4f8' }, { z: -150, y: -34, w: 420, h: 56, col: haze[1], seed: 8, peaks: 5 }, { z: -110, y: -38, w: 320, h: 44, col: haze[2], seed: 11, peaks: 6, trees: 1, lit: 1 }, { z: -75, y: -44, w: 220, h: 34, col: haze[3], seed: 19, peaks: 7, trees: 1 }]);
  if (eve) sun(D, [70, 6, -185], '#ffb070', 16); else sun(D, [-60, 60, -190], '#fff2d0', 10, { op: 0.4 });
  clouds(D, [[-40, 34, -170, 60, 2], [30, 40, -180, 80, 5], [90, 26, -175, 50, 9], [-90, 46, -185, 70, 13]], eve ? '#ffc8a8' : '#ffffff', 0.85);
  birdsAndLeaves(D, { by: 10, bz: -60 });
  // the gnarled pine leaning out over the drop; pines and rocks behind; the stone with the cliff's name
  const cp = cliffPine(4, 1.9); cp.position.set(5.2, 0, -4); D.add(cp); sway(D, cp, 0.012, 0.6);
  for (const [x, z, s, k] of [[-6, -10, 2.4, 'pine'], [-11, -12, 2.8, 'pine'], [-16, -9, 2.2, 'broad'], [-3, -13, 2.6, 'pine'], [-21, -12, 3, 'pine'], [-26, -8, 2.4, 'broad']]) { const t2 = tree(k, x * 3 + 7, s); t2.position.set(x, 0, z); D.add(t2); sway(D, t2, 0.012, 0.5); }
  const stone = box(1.2, 2.4, 0.5, lam({ map: T.stone('#8a8478') })); stone.position.set(-3.5, 1.2, -5); stone.rotation.z = 0.06; D.add(stone);
  const vc = cutout(32, 80, (x) => { x.fillStyle = '#2a1810'; x.font = '900 22px "Noto Serif TC", serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; [...'斷魂崖'].forEach((ch, i) => x.fillText(ch, 16, 14 + i * 26)); });
  const vt = new THREE.CanvasTexture(vc); vt.colorSpace = THREE.SRGBColorSpace; const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2), lam({ map: vt, transparent: true })); sg.position.set(-3.5, 1.25, -4.74); sg.rotation.z = 0.06; D.add(sg);
  grass(D, 120, [-26, 5.5, -12, 9], { seed: 3, cols: eve ? ['#6a7a2e', '#8a9a3a', '#b8b04a'] : undefined });
  grass(D, 16, [-12, 4, 5.5, 8], { seed: 9, s: 1.1, h: 16 });
  D.flakes = { kind: 'leaf', k: 0.4, box: [30, 12, 16] };
  D.floorAt = () => 0;
  D.mark('a', -4, 1, 1); D.mark('b', 1.5, 1, -1); D.mark('edge', 5.6, 0.8, 1);
}
cliff.mood = 'golden';

// ================================================================ 龍門刀莊: the manor courtyard in the village
function village(D, o) {
  const dusk = D.mood === 'dusk';
  D.cam0 = { x: 0, y: 1.6, z: 0, d: 17, yaw: 0, pitch: 10, fov: 30 };
  D.add(floor(T.mud('#9a8058'), 0, 0, 90, 60, 0, { unit: 2 }));
  D.add(floor(T.pave('#a8a092'), 0, -1, 22, 10, 0.012, { unit: 2 }));
  // the hall of the saber manor
  const H = new THREE.Group(); H.position.set(0, 0, -8); D.add(H);
  H.add(at(box(17, 0.5, 5.6, lam({ map: T.stone('#9a9488') })), [0, 0.25, 0.3]));
  const lo = box(16, 3.6, 4.6, texMat(T.plaster('#e8dcc4'), 8, 1.8)); lo.position.y = 2.1; H.add(lo);
  for (const x of [-5.4, -2.7, 0, 2.7, 5.4]) { const d = lattice(2.1, 2.6, dusk ? '#ffc070' : '#d8c8a0', { k: dusk ? 0.8 : 0.15 }); d.position.set(x, 1.9, 2.32); H.add(d); }
  for (const x of [-7.6, -4.05, -1.35, 1.35, 4.05, 7.6]) { const p = pillar(3.8, 0.2, '#9a2a1e'); p.position.set(x, 0.5, 3.0); H.add(p); }
  const rf = roof(16, 5, 2.2, '#2e3a4a', { over: 1.2 }); rf.position.y = 4.1; H.add(rf);
  const sg = sign('龍門刀莊', 4.4, 1.1, { bg: '#1a120a', fg: '#f4d070', emit: dusk ? '#8a6a3a' : '#4a3a1a' }); sg.position.set(0, 3.95, 3.4); H.add(sg);
  for (const x of [-1.2, 1.2]) { const st = box(1.6, 0.25, 0.6, lam({ map: T.stone('#a8a094') })); st.position.set(x * 0, 0.12, 3.4 + Math.abs(x) * 0); H.add(st); }
  // side houses, the wall with the gate, the bell, the well
  const house = (x, z, w, d, h, ry, col) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; D.add(g); const b = box(w, h, d, texMat(T.plaster(col || '#e0d4bc'), w / 2, h / 2)); b.position.y = h / 2; g.add(b); const r2 = roof(w, d, h * 0.5, '#3a4654', { over: 0.6 }); r2.position.y = h; g.add(r2); const wi = lattice(1.2, 1, dusk ? '#ffc070' : '#c8b890', { k: dusk ? 0.9 : 0.15 }); wi.position.set(0, h * 0.55, d / 2 + 0.02); g.add(wi); return g; };
  house(-15, -5, 6, 4, 3, 0.35); house(15, -5, 6, 4, 3, -0.35, '#d8ccb4'); house(-22, -12, 7, 5, 3.4, 0.1); house(22, -13, 7, 5, 3.4, -0.1);
  for (const [x0, x1, z] of [[-30, -11.5, -1], [11.5, 30, -1]]) { const w2 = box(x1 - x0, 1.8, 0.5, texMat(T.plaster('#d8cbb0'), (x1 - x0) / 2, 1)); w2.position.set((x0 + x1) / 2, 0.9, z - 3); D.add(w2); const cap = box(x1 - x0 + 0.3, 0.2, 0.8, lam({ color: '#3a4654' })); cap.position.set((x0 + x1) / 2, 1.9, z - 3); D.add(cap); }
  const bellF = new THREE.Group(); bellF.position.set(-9, 0, -4.8); D.add(bellF); for (const sx of [-0.8, 0.8]) { const p = box(0.18, 3, 0.18, lam({ color: '#5a3a22' })); p.position.set(sx, 1.5, 0); bellF.add(p); } bellF.add(at(box(2, 0.2, 0.25, lam({ color: '#4a2a18' })), [0, 3, 0])); const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.8, 10), std({ color: '#8a6a3a', metalness: 0.6, roughness: 0.4 })); bell.position.set(0, 2.4, 0); bell.castShadow = true; bellF.add(bell);
  D.triggers.bell = () => { const t0 = D.t || 0; D.tick((dt, t) => { const k = t - t0; bell.rotation.z = k < 3 ? Math.sin(k * 9) * 0.4 * (1 - k / 3) : 0; }); };
  const well = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.85, 0.8, 12, 1, true), lam({ map: T.stone('#8a847a'), side: THREE.DoubleSide })); well.position.set(-12, 0.4, 2.6); D.add(well);
  // the training ground: posts, a weapon rack, a drum, haystack and barrels
  for (const [x, z] of [[5.6, -2.6], [7.4, -3.2], [9.2, -2.4]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 2.2, 10), lam({ map: T.planks('#8a6038') })); p.position.set(x, 1.1, z); p.castShadow = true; D.add(p); const arm = box(1.0, 0.14, 0.14, lam({ color: '#6a4a2a' })); arm.position.set(x, 1.6, z); D.add(arm); }
  const rack = new THREE.Group(); rack.position.set(-5.5, 0, -4.4); D.add(rack); rack.add(at(box(2.6, 0.12, 0.3, lam({ color: '#4a2a18' })), [0, 1.8, 0])); rack.add(at(box(2.6, 0.12, 0.3, lam({ color: '#4a2a18' })), [0, 0.5, 0])); for (const sx of [-1.2, 1.2]) rack.add(at(box(0.12, 2, 0.12, lam({ color: '#4a2a18' })), [sx, 1, 0])); for (let i = 0; i < 5; i++) { const sp = box(0.06, 2.6, 0.06, lam({ color: i % 2 ? '#c8ccd8' : '#7a5028' })); sp.position.set(-1 + i * 0.5, 1.4, 0.1); sp.rotation.z = 0.05; rack.add(sp); }
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.9, 16), lam({ color: '#9a2a1e' })); drum.rotation.x = Math.PI / 2; drum.position.set(8.5, 1.6, -5.6); D.add(drum); D.add(at(box(1.6, 1.2, 0.3, lam({ color: '#4a2a18' })), [8.5, 0.6, -5.6]));
  const hay = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.0, 10), lam({ map: T.thatch() })); hay.position.set(10.6, 1.0, 1.8); hay.castShadow = true; D.add(hay);
  for (const [x, z] of [[12.2, 0.4], [12.6, 2.6], [-11, -1.8]]) { const b = barrel(0.4, 0.9); b.position.set(x, 0, z); D.add(b); }
  for (const [x, z] of [[-13.5, 0.2], [-13.2, 1.3]]) D.add(at(box(0.9, 0.7, 0.9, lam({ map: T.planks('#8a6a40') })), [x, 0.35, z]));
  // trees: a great broad-leaf by the hall, a golden ginkgo, pines on the hills
  for (const [x, z, s, k] of [[-8.5, -6.5, 2.4, 'broad'], [12.5, -6.5, 2.2, 'broad'], [-19, -4, 2.2, 'pine'], [19, -4, 2.4, 'pine']]) { const t2 = tree(k, x * 5 + 3, s); t2.position.set(x, 0, z); D.add(t2); sway(D, t2, 0.012, 0.6); }
  const gk = maple(7, 2.1, ['#8a6a10', '#c8a020', '#e8c840', '#fff080']); gk.position.set(-17, 0, 0.5); D.add(gk); sway(D, gk, 0.012, 0.5);
  // lanterns on a line across the yard (one of them is 奕碩's target at the end)
  const lamps = [];
  for (const [x, z] of [[-6, -2.2], [-2, -2.2], [2, -2.2], [6, -2.2]]) { const l = lantern({ len: 0.5, intensity: dusk ? 6 : 0, range: 9, light: dusk, text: '龍', color: '#c8302a' }); l.position.set(x, 3.6, z); D.add(l); lamps.push(l); if (!dusk) { l.userData.body.material.emissiveIntensity = 0.25; l.children.forEach((c) => { if (c.isSprite) c.visible = false; }); } }
  for (const x of [-8, 8]) D.add(at(box(0.14, 3.9, 0.14, lam({ color: '#4a2a18' })), [x, 1.95, -2.2])); { const ln = box(16, 0.03, 0.03, lam({ color: '#2a1a10' })); ln.position.set(0, 3.88, -2.2); D.add(ln); }
  D.triggers.lantern = (inst, k = 2) => { const l = lamps[k]; if (!l) return; const t0 = D.t || 0; if (inst) { l.visible = false; return; } D.tick((dt, t) => { const u = t - t0; if (u < 0.6) { l.rotation.z = Math.sin(u * 30) * 0.8; l.userData.body.scale.set(1 + u, 1 - u * 0.5, 1); } else if (u < 2) { l.position.y = 3.6 - (u - 0.6) ** 2 * 6; l.rotation.z = 1.2; } else l.visible = false; }); if (D.fx2) for (let i = 0; i < 16; i++) D.fx2.bits.spawn(l.getWorldPosition(new V3()).add(new V3(0, -0.6, 0)), new V3((Math.random() - 0.5) * 4, Math.random() * 3, (Math.random() - 0.5) * 2), { color: Math.random() < 0.5 ? '#d8402a' : '#f4d890', size: 0.1, life: 1.4, g: 6, floor: 0.03 }); };
  // far hills, sky
  ridges(D, [{ z: -150, y: -8, w: 420, h: 46, col: dusk ? '#7a5a7a' : '#9ab4c8', seed: 2, peaks: 4 }, { z: -110, y: -8, w: 320, h: 36, col: dusk ? '#4a3a5a' : '#6a8a8a', seed: 6, peaks: 6, trees: 1, lit: 1 }, { z: -70, y: -6, w: 220, h: 24, col: dusk ? '#2e2a3a' : '#4a6a4a', seed: 14, peaks: 8, trees: 1 }]);
  if (dusk) sun(D, [-60, 8, -160], '#ff9a6a', 12); clouds(D, [[-50, 30, -140, 50, 3], [20, 36, -150, 70, 6], [70, 28, -140, 40, 8]], dusk ? '#f0a890' : '#ffffff', 0.85);
  grass(D, 60, [-26, 26, 4, 9], { seed: 5, avoid: (x) => Math.abs(x) < 9 });
  grass(D, 40, [-26, 26, -6, -3.6], { seed: 6 });
  birdsAndLeaves(D, { by: 14, bz: -60 });
  D.flakes = dusk ? { kind: 'fireflies', k: 0.5, box: [26, 5, 12], floor: 0.5 } : { kind: 'leaf', k: 0.5, box: [28, 10, 14] };
  D.mark('center', 0, 1, 1); D.mark('gate', -10, 1.6, 1); D.mark('door', 0, -4.2, 1); D.mark('hay', 10, 1.4, 1); D.mark('post', 6, -1.4, 1);
}
village.mood = 'bright';
const at = (o, p) => { o.position.set(...p); return o; };

// ================================================================ the hidden valley under the cliff
function valley(D, o) {
  const mood = D.mood, night = mood === 'night' || mood === 'snownight', snow = mood === 'snownight' || o.snow, rain = mood === 'rainday';
  D.cam0 = { x: 0, y: 1.6, z: 0, d: 16, yaw: 0, pitch: 9, fov: 30 };
  if (rain) D.rain = 0.7;
  D.river = 1.3;
  const gcol = snow ? '#e8ecf4' : '#5e8a3a';
  D.add(floor(snow ? T.mud('#dfe6f0') : T.grass(gcol), 0, 8, 90, 22, 0, { unit: 2 }));
  // the lake, its stony shore, the pool where the falls land
  lake(D, 120, 60, [0, -0.18, -30], { deep: night ? '#0a2034' : '#16485a', shallow: night ? '#1a3a5a' : '#2e8a96', hi: night ? '#a8c8f0' : '#d8f4f4', rain: rain ? 1 : 0 });
  for (let x = -30; x < 30; x += 0.9) { const rk = rock(0.35 + Math.random() * 0.35, snow ? '#a8aab4' : '#8a8274', { sy: 0.5 }); rk.position.set(x + Math.random() * 0.4, -0.05, -2.2 + Math.random() * 0.8); D.add(rk); }
  // cliffs closing the valley in, the falls in a notch at the back
  const cliffM = lam({ map: (() => { const t = T.rock(night ? '#4a4a58' : '#6e6a5e').clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 8); return t; })() });
  for (const [x, z, w, h, d] of [[-14, -24, 16, 26, 8], [16, -24, 18, 28, 8], [-30, -14, 10, 22, 30], [32, -14, 10, 24, 30], [1.5, -27, 9, 30, 4]]) { const b = box(w, h, d, cliffM); b.position.set(x, h / 2 - 1, z); D.add(b); }
  for (let i = 0; i < 30; i++) { const rk = rock(1.5 + Math.random() * 2.5, night ? '#4a4a56' : '#6a665a', { sx: 1.2, sy: 1.3 }); const side = i % 2 ? -1 : 1; rk.position.set(4 + side * (6 + Math.random() * 18), Math.random() * 18, -20 + Math.random() * 1.5); D.add(rk); }
  // moss and vines hanging on the cliffs
  for (let i = 0; i < 14; i++) { const vc = cutout(10, 40, (x) => { const r = rng(i + 5); for (let k = 0; k < 4; k++) { let px = 2 + k * 2; for (let y = 0; y < 40 - k * 6; y++) { x.fillStyle = r() < 0.3 ? '#4a7a3a' : '#2e5a2a'; x.fillRect(Math.round(px), y, 1, 1); px += (r() - 0.5) * 0.6; if (r() < 0.12) { x.fillStyle = '#6a9a4a'; x.fillRect(Math.round(px) - 1, y, 3, 1); } } } }); const v = cut(vc, PX * 2.4, { shadow: false }); v.position.set((i % 2 ? -1 : 1) * (4 + i * 1.2), 6 + (i % 3) * 3, -19.6); v.rotation.z = Math.PI; D.add(v); sway(D, v, 0.03, 0.8); }
  waterfall(D, 4, -19.4, 5.5, 17, { y0: -0.2, c1: night ? '#3a6a9a' : '#5aa4cc', c2: night ? '#6a9ac8' : '#94d0ea', dark: night ? '#0a1018' : '#1a2a2a' });
  // the cave mouth behind the falls, dark
  D.add(at(box(4.2, 5, 0.2, lam({ color: '#0a0c10' })), [4, 2.3, -19.8]));
  // the standing stone in the pool
  const ps = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.6, 1.0, 8), lam({ map: T.rock('#7a7468'), flatShading: true })); ps.position.set(4, 0.1, -16.2); ps.castShadow = ps.receiveShadow = true; D.add(ps);
  for (const [x, z] of [[3.4, -4], [4.2, -6.6], [3.6, -9.2], [4.4, -11.8], [3.8, -14]]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.4, 7), lam({ map: T.rock('#8a8274'), flatShading: true })); st.position.set(x, -0.05, z); st.castShadow = st.receiveShadow = true; D.add(st); }
  // the old man's hut: thatch, a drying rack of fish, a boat pulled up
  const hut = new THREE.Group(); hut.position.set(-11, 0, -0.5); D.add(hut);
  hut.add(at(box(4.4, 2.4, 3, lam({ map: T.boards('#7a5a3a') })), [0, 1.2, 0]));
  const tr = roof(4.4, 3, 1.4, '#9a8050', { over: 0.6, gable: '#5a4028' }); tr.position.y = 2.4; tr.children.forEach((c) => { if (c.material && c.material.map) { c.material.map = T.thatch(); } }); hut.add(tr);
  hut.add(at(box(0.9, 1.8, 0.1, lam({ color: '#2a1a10' })), [0.6, 0.9, 1.52]));
  const winH = lattice(0.8, 0.6, night ? '#ffb860' : '#a89070', { k: night ? 1 : 0.1 }); winH.position.set(-1.2, 1.4, 1.52); hut.add(winH);
  const rackF = new THREE.Group(); rackF.position.set(-7.6, 0, -1.6); D.add(rackF); for (const sx of [-0.9, 0.9]) rackF.add(at(box(0.08, 1.8, 0.08, lam({ color: '#5a3a22' })), [sx, 0.9, 0])); rackF.add(at(box(2, 0.06, 0.06, lam({ color: '#5a3a22' })), [0, 1.7, 0])); for (let i = 0; i < 5; i++) { const fsh = cut(cutout(6, 12, (x) => { x.fillStyle = '#9aa0a8'; x.fillRect(1, 2, 4, 8); x.fillStyle = '#c8ccd4'; x.fillRect(2, 3, 1, 6); x.fillStyle = '#6a7078'; x.fillRect(0, 10, 6, 2); x.fillRect(2, 0, 2, 2); }), PX * 1.4); fsh.position.set(-0.8 + i * 0.4, 0.95, 0.05); rackF.add(fsh); sway(D, fsh, 0.08, 1.4); }
  const boat = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 1.0), lam({ map: T.boards('#6a4a2a') })); boat.position.set(-4.6, -0.05, -3.4); boat.rotation.y = 0.2; boat.castShadow = true; D.add(boat); D.tick((dt, t) => { boat.position.y = -0.05 + Math.sin(t * 1.2) * 0.03; });
  // trees: maples gold and red, broad-leaves, willow over the water, bamboo, the tree of the falling leaves
  const tcol = snow ? ['#5a6a7a', '#c8d0dc', '#e8eef6', '#ffffff'] : ['#7a3a10', '#c86a1e', '#e8a03a', '#f8d070'];
  for (const [x, z, s] of [[-15, 1.5, 2.2], [13, -1, 2], [-22, -4, 2.4], [22, -5, 2.6], [9, -7, 1.6]]) { const t2 = maple(x * 3 + 11, s, tcol); t2.position.set(x, 0, z); D.add(t2); sway(D, t2, 0.012, 0.6); }
  for (const [x, z, s] of [[-18.5, 3.5, 1.6], [-26, 0, 1.8], [24, 2, 1.8]]) { const b = bamboo(x * 7, s); b.position.set(x, 0, z); D.add(b); sway(D, b, 0.03, 0.9); }
  { const w2 = tree('willow', 5, 2.2); w2.position.set(-3, 0, -2.8); D.add(w2); sway(D, w2, 0.015, 0.6); }
  fire(D, -6, 2.4, 1);
  D.add(at(box(1.2, 0.4, 0.5, lam({ map: T.planks('#6a4a2a') })), [-7.6, 0.2, 3.2])); D.add(at(rock(0.5, '#7a7468', { sy: 0.6 }), [-4.4, 0.2, 3.4]));
  // light: rays down through the spray, mist on the water, birds; fireflies at night, leaves or snow by day
  if (!night && !rain) for (const [x, rz] of [[1, 0.25], [6, 0.3], [-4, 0.2]]) { const sf = shaft(4, 26, '#fff4d0', 0.16); sf.position.set(x, 24, -12); sf.rotation.z = rz; D.add(sf); }
  for (const [z, op] of [[-8, 0.3], [-13, 0.4], [-17, 0.5]]) { const m = mist(60, 4, night ? '#8aa0c8' : '#f4f8fa', op); m.position.set(2, 0.8, z); D.add(m); }
  if (night) { sun(D, [-30, 30, -60], '#d8e4ff', 7, { disc: '#f4f6ff', op: 0.5 }); }
  else clouds(D, [[-30, 34, -60, 40, 4], [30, 38, -66, 50, 7]], rain ? '#c8ccd4' : '#ffffff', rain ? 0.7 : 0.9);
  ridges(D, [{ z: -80, y: 8, w: 260, h: 30, col: night ? '#1a2440' : '#7aa0b0', seed: 21, peaks: 5, snow: snow ? 0.4 : 0.85 }]);
  grass(D, snow ? 12 : 140, [-28, 28, -1.2, 10], { seed: 7, cols: snow ? ['#a8b4a0', '#c8d4c8', '#e8f0f0'] : undefined, avoid: (x, z) => Math.hypot(x + 6, z - 2.4) < 1.4 || (Math.abs(x + 11) < 3 && z < 1.5) });
  grass(D, 14, [-14, 14, 6, 9], { seed: 8, s: 1.1, h: 16, cols: snow ? ['#a8b4a0', '#c8d4c8', '#e8f0f0'] : undefined });
  if (!night) birdsAndLeaves(D, { by: 22, bz: -50 });
  D.flakes = snow ? { kind: 'snow', k: 1, box: [30, 14, 18] } : night ? { kind: 'fireflies', k: 1, box: [26, 4, 14], floor: 0.3 } : rain ? null : { kind: 'leaf', k: 0.6, box: [30, 12, 16] };
  if (snow) { const cap = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.4), lam({ color: '#eef2f8' })); cap.rotation.x = -Math.PI / 2; cap.position.set(-11, 2.42 + 1.4, -0.5); D.add(cap); }
  D.floorAt = (x, z) => (Math.hypot(x - 4, (z + 16.2) * 1.2) < 1.5 ? 0.6 : 0);
  D.mark('shore', 0, 1, 1); D.mark('fire', -6, 2.4, 1); D.mark('hut', -9.2, 1.4, 1); D.mark('tree', -13.4, 2.2, 1); D.mark('stone', 4, -16.2, 1); D.mark('pool', 4, -1.4, 1);
}
valley.mood = 'valley';

// ================================================================ behind the falls: the carved wall
function cave(D, o) {
  D.cam0 = { x: 0, y: 2, z: 0, d: 13, yaw: 0, pitch: 6, fov: 32 };
  D.river = 1.0;
  const rm = (col, rx, ry) => lam({ map: (() => { const t = T.rock(col).clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; })() });
  D.add(floor(T.rock('#4a4a48'), 0, 0, 40, 20, 0, { unit: 1.5 }));
  // the carved wall: rough stone with nine long gouges and four great characters
  const W = 256, H = 128, wc = cutout(W, H, (x) => {
    const r = rng(33); x.fillStyle = '#6a665e'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 900; i++) { x.fillStyle = r() < 0.5 ? '#5a564e' : '#7a766c'; x.fillRect(Math.floor(r() * W), Math.floor(r() * H), 2 + Math.floor(r() * 4), 1); }
    for (let i = 0; i < 30; i++) { x.fillStyle = '#4a4640'; x.fillRect(Math.floor(r() * W), Math.floor(r() * H), 1, 3 + Math.floor(r() * 5)); }
    x.fillStyle = '#2a2622'; x.font = '900 34px "Noto Serif TC", serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('刀不在手', 196, 40); x.fillText('在心', 196, 86);
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillText('刀不在手', 195, 39); x.fillText('在心', 195, 85);
  });
  const wt = new THREE.CanvasTexture(wc); wt.magFilter = THREE.NearestFilter; wt.minFilter = THREE.LinearMipmapLinearFilter; wt.colorSpace = THREE.SRGBColorSpace;
  const wallM = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), lam({ map: wt })); wallM.position.set(0, 4, -6); wallM.receiveShadow = true; D.add(wallM);
  // the nine marks: each a glowing gouge that can light up (trigger glow k)
  const marks = [], MK = [[-6.4, 6.4, -4.6, 1.8], [-5.8, 6.8, -3.2, 2.0], [-5.0, 7.0, -2.6, 1.4], [-4.0, 6.6, -1.2, 2.2], [-3.2, 7.2, -0.4, 1.0], [-2.4, 6.2, 0.4, 2.6], [-6.6, 4.4, -1.6, 4.2], [-5.4, 3.0, 0.6, 5.6], [-7, 7.2, 1.2, 0.8]];
  MK.forEach(([x0, y0, x1, y1], k) => {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
    const groove = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.16), lam({ color: '#1e1a16' })); groove.position.set((x0 + x1) / 2, (y0 + y1) / 2, -5.98); groove.rotation.z = Math.atan2(dy, dx); D.add(groove);
    const gm = new THREE.Mesh(new THREE.PlaneGeometry(L, 0.22), new THREE.MeshBasicMaterial({ color: '#9ad8ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); gm.position.set((x0 + x1) / 2, (y0 + y1) / 2, -5.95); gm.rotation.z = Math.atan2(dy, dx); D.add(gm); marks.push(gm);
  });
  const chars = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ map: (() => { const c = cutout(128, 128, (x) => { x.fillStyle = '#ffffff'; x.font = '900 34px "Noto Serif TC", serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('刀不在手', 64, 40); x.fillText('在心', 64, 86); }); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), color: '#ffd890', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  chars.position.set(4.25, 4.0, -5.95); D.add(chars);
  const st = { lit: 0, chars: 0 };
  D.tick((dt, t) => { marks.forEach((m, k) => { const on = k < st.lit; m.material.opacity += ((on ? 0.85 + Math.sin(t * 5 + k) * 0.1 : 0) - m.material.opacity) * Math.min(1, dt * 6); }); chars.material.opacity += (st.chars * (0.7 + Math.sin(t * 2) * 0.1) - chars.material.opacity) * Math.min(1, dt * 3); });
  D.triggers.glow = (inst, k = 9) => { st.lit = k; if (inst) marks.forEach((m, j) => { m.material.opacity = j < k ? 0.85 : 0; }); };
  D.triggers.chars = (inst, on = 1) => { st.chars = on; if (inst) chars.material.opacity = on * 0.7; };
  // the chamber: side walls, a low ceiling, rocks, a pool that glints, drips
  for (const [x, ry] of [[-8.6, 0.5], [8.6, -0.5]]) { const s2 = new THREE.Mesh(new THREE.PlaneGeometry(10, 9), rm('#545048', 3, 3)); s2.position.set(x, 4.5, -2); s2.rotation.y = ry; D.add(s2); }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 14), rm('#3a3834', 4, 3)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 8.2, -1); D.add(ceil);
  for (let i = 0; i < 16; i++) { const rk = rock(0.4 + Math.random() * 0.9, '#5a564e', { sy: 0.6 }); rk.position.set((Math.random() - 0.5) * 16, 0, -5 + Math.random() * 9); if (Math.abs(rk.position.x) < 3 && rk.position.z > -3) continue; D.add(rk); }
  for (let i = 0; i < 10; i++) { const sl = new THREE.Mesh(new THREE.ConeGeometry(0.15 + Math.random() * 0.2, 0.6 + Math.random() * 1.2, 5), lam({ color: '#5a5650' })); sl.rotation.x = Math.PI; sl.position.set((Math.random() - 0.5) * 16, 7.8, -5 + Math.random() * 8); D.add(sl); }
  const pool = lake(D, 6, 3, [-3.5, 0.02, 1.8], { deep: '#0e2a34', shallow: '#2a5a6a', hi: '#bfe8f8', flow: [0.02, 0.02] });
  // the curtain of the falls at the cave's mouth, off to the right: daylight pours through it
  { const wf = waterfall(D, 9.6, 1, 6, 9, { y0: 0 }); wf.rotation.y = -Math.PI / 2.4; }
  for (const [x, z, rz] of [[6, 0, -0.5], [4, -2, -0.6], [7, 2, -0.45]]) { const sf = shaft(2.5, 14, '#d8f0ff', 0.22); sf.position.set(x, 8, z); sf.rotation.z = rz; D.add(sf); }
  const L = new THREE.PointLight('#a8e0ff', 14, 18, 1.4); L.position.set(7, 3, 1); D.add(L);
  const L2 = new THREE.PointLight('#ffd8a0', 4, 10, 1.6); L2.position.set(-3, 3, -2); D.add(L2);
  D.tick((dt, t) => { if (D.fx2 && Math.random() < dt * 3) { const x = (Math.random() - 0.5) * 12; D.fx2.bits.spawn(new V3(x, 7.6, -3 + Math.random() * 6), new V3(0, -6, 0), { color: '#c8ecff', size: 0.05, life: 1.3, g: 4, floor: 0.02, bounce: 0 }); } });
  D.flakes = { kind: 'spray', k: 0.4, box: [16, 8, 10] };
  D.mark('wall', -2, -3.8, 1); D.mark('in', 5, 1.2, -1); D.mark('mid', 0, 0, 1);
}
cave.mood = 'cave';

// ================================================================ the ledge of the red fruit, above a sea of clouds
function ledge(D, o) {
  D.cam0 = { x: 0, y: 1.6, z: 0, d: 16, yaw: 0, pitch: 8, fov: 30 };
  const ledgeTop = box(22, 6, 10, lam({ map: (() => { const t = T.rock('#7a7266').clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 2); return t; })() })); ledgeTop.position.set(0, -3, -1); D.add(ledgeTop);
  D.add(floor(T.grass('#6a8a44'), 0, -1, 21, 9.6, 0.01, { unit: 2 }));
  for (let x = -11; x < 11; x += 1.1) { const rk = rock(0.5 + Math.random() * 0.5, '#7a7266', { sy: 0.6 }); rk.position.set(x, -0.1, 3.8 + Math.random() * 0.4); D.add(rk); }
  // the cliff face behind, vines, a crack with a trickle of water
  const face = box(40, 30, 3, lam({ map: (() => { const t = T.rock('#9a9080').clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 8); return t; })() })); face.position.set(0, 12, -7.5); D.add(face);
  for (let i = 0; i < 14; i++) { const rk = rock(1 + Math.random() * 1.8, '#665e54', { sy: 1.2 }); rk.position.set(-18 + i * 2.8, 2 + Math.random() * 14, -5.9); D.add(rk); }
  // the red fruit tree: gnarled, small, the one fruit glowing
  const tc = cutout(64, 64, (x) => { x.fillStyle = '#3a2618'; let px = 30, py = 64; for (let i = 0; i < 22; i++) { x.fillRect(Math.round(px), Math.round(py) - 3, 4, 4); px += Math.sin(i * 0.5) * 1.2; py -= 1.8; } for (const [cx, cy, w] of [[30, 20, 16], [18, 26, 10], [44, 24, 11]]) { blob(x, cx, cy, w, w * 0.6, '#1e4a26'); blob(x, cx - 1, cy - 2, w - 3, (w - 3) * 0.5, '#3a7a3a'); blob(x, cx - 3, cy - 4, w - 8, 2, '#6aaa4a'); } });
  const ft = cut(tc, PX * 2.2); ft.position.set(6.5, 0, -2.5); D.add(ft); sway(D, ft, 0.012, 0.8);
  const fruit = new THREE.Sprite(new THREE.SpriteMaterial({ map: (() => { const t = new THREE.CanvasTexture(cutout(10, 12, (x) => { blob(x, 5, 7, 4, 4, '#c8180e'); blob(x, 4, 6, 3, 3, '#f0301e'); x.fillStyle = '#ffd0b0'; x.fillRect(3, 4, 2, 1); x.fillStyle = '#3a8a2a'; x.fillRect(5, 0, 2, 3); })); t.magFilter = t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; })() })); fruit.scale.set(0.55, 0.66, 1); fruit.position.set(6.7, 2.4, -2.2); D.add(fruit);
  const fg = glow('#ff4a2a', 2.2, 0.8); fg.position.copy(fruit.position); D.add(fg); const fl = new THREE.PointLight('#ff5a3a', 5, 6, 1.6); fl.position.copy(fruit.position); D.add(fl);
  D.tick((dt, t) => { fg.scale.setScalar(2.2 + Math.sin(t * 3) * 0.3); fruit.position.y = 2.4 + Math.sin(t * 1.4) * 0.03; });
  D.triggers.fruit = (inst, on = 0) => { fruit.visible = fg.visible = !!on; fl.visible = !!on; };
  // the sea of clouds below, peaks rising out of it, the far falls
  for (let i = 0; i < 6; i++) { const m = mist(260, 16, '#ffffff', 0.8 - i * 0.08); m.position.set(0, -10 + i * 1.2, -20 - i * 14); m.rotation.x = -1.2; D.add(m); }
  ridges(D, [{ z: -160, y: -6, w: 460, h: 60, col: '#9ab8d0', seed: 31, peaks: 4, snow: 0.7, fade: 'rgba(255,255,255,0.8)' }, { z: -100, y: -10, w: 300, h: 40, col: '#6a8a9a', seed: 37, peaks: 6, trees: 1, fade: 'rgba(255,255,255,0.9)' }]);
  for (const [x, z, s] of [[-40, -60, 7], [30, -70, 9], [60, -50, 6], [-70, -80, 8]]) { const pk = new THREE.Mesh(new THREE.ConeGeometry(s, s * 2.4, 6), lam({ map: T.rock('#6a7a6a'), flatShading: true })); pk.position.set(x, -6 + s * 0.6, z); D.add(pk); const pt = tree('pine', x, 1.4); pt.position.set(x - 0.5, -6 + s * 1.7, z + 0.6); D.add(pt); }
  sun(D, [-50, 40, -150], '#fff4d8', 10, { op: 0.5 });
  clouds(D, [[-30, 30, -120, 50, 21], [40, 26, -130, 60, 23]], '#ffffff', 0.9);
  for (const [x, z, s] of [[-9, -4, 1.8], [-6, -5, 1.4]]) { const t2 = tree('pine', x * 9, s); t2.position.set(x, 0, z); D.add(t2); sway(D, t2, 0.015, 0.7); }
  grass(D, 60, [-10, 10, -4, 3.6], { seed: 13 }); grass(D, 12, [-12, 12, 5, 8], { seed: 14, s: 1.1, h: 16 });
  birdsAndLeaves(D, { by: 4, bz: -40, bc: '#3a3a44' });
  D.flakes = { kind: 'petal', k: 0.5, box: [26, 10, 14] };
  D.floorAt = (x, z) => (Math.abs(x) < 11 && z > -6 && z < 4 ? 0 : -12);
  D.mark('a', -5, 1, 1); D.mark('b', 3, 1, -1); D.mark('tree', 5.6, -1.2, 1); D.mark('edge', -10, 1.5, 1);
}
ledge.mood = 'bright';

// ================================================================ a mountain road: through the forest, along a cliff, or by a lake at sunset
function road(D, o) {
  const kind = o.kind || 'forest', eve = D.mood === 'golden' || D.mood === 'sunset' || D.mood === 'dusk';
  D.cam0 = { x: 0, y: 1.6, z: 0, d: 16, yaw: 0, pitch: 9, fov: 30 };
  D.add(floor(T.grass(eve ? '#7a8a3e' : '#5a8238'), 0, 4, 100, 30, 0, { unit: 2 }));
  D.add(floor(T.mud('#a88a5e'), 0, 1, 100, 3.6, 0.012, { unit: 2 }));
  for (let x = -40; x < 40; x += 2.2) for (const z of [-0.95, 2.95]) { if (Math.random() < 0.5) continue; const st = rock(0.18 + Math.random() * 0.15, '#8a8070', { sy: 0.5 }); st.position.set(x + Math.random(), 0.02, z + (Math.random() - 0.5) * 0.3); D.add(st); }
  if (kind === 'forest') {
    for (let i = 0; i < 40; i++) { const x = -40 + i * 2.1 + Math.random(), z = -5 - Math.random() * 12; const t2 = tree(Math.random() < 0.6 ? 'pine' : 'broad', i * 17, 1.8 + Math.random() * 1.2); t2.position.set(x, 0, z); D.add(t2); sway(D, t2, 0.01, 0.5); }
    for (let i = 0; i < 6; i++) { const t2 = maple(i * 5 + 1, 1.8, ['#6a4a10', '#a8781e', '#d8a83a', '#f0d070']); t2.position.set(-30 + i * 12 + Math.random() * 3, 0, -4.5); D.add(t2); sway(D, t2, 0.012, 0.6); }
    for (const [x, z, r] of [[-9, -3.2, 1.2], [11, -3.6, 1.6], [16, -2.6, 0.9], [-17, -3, 1.4]]) { const rk = rock(r, '#7a7466', { sy: 0.9 }); rk.position.set(x, 0.4, z); D.add(rk); }
    // a little roadside shrine, a fallen log
    const sh2 = new THREE.Group(); sh2.position.set(-5, 0, -3); D.add(sh2); sh2.add(at(box(0.9, 1.0, 0.7, lam({ map: T.stone('#9a9488') })), [0, 0.5, 0])); const sr = roof(1, 0.8, 0.4, '#3a4654', { over: 0.2 }); sr.position.y = 1; sh2.add(sr); sh2.add(at(box(0.3, 0.3, 0.05, lam({ color: '#c8302a', emissive: new THREE.Color('#3a0a0a') })), [0, 0.6, 0.36]));
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 4, 8), lam({ map: T.planks('#6a4a2a') })); log.rotation.z = Math.PI / 2; log.rotation.y = 0.3; log.position.set(8, 0.3, -2.6); log.castShadow = true; D.add(log);
    for (let i = 0; i < 10; i++) { const s2 = shaft(1.6, 18, '#fff4c8', 0.12); s2.position.set(-30 + i * 7, 14, -6); s2.rotation.z = 0.35; D.add(s2); }
    ridges(D, [{ z: -140, y: -4, w: 420, h: 50, col: eve ? '#b87a6a' : '#9ab8c8', seed: 41, peaks: 4, snow: 0.8 }, { z: -90, y: -4, w: 300, h: 34, col: eve ? '#7a5a52' : '#6a8a7a', seed: 43, peaks: 7, trees: 1 }]);
  } else if (kind === 'cliff') {
    // the road along a drop: rock wall on the left, the void and far peaks beyond
    const wl = box(30, 14, 6, lam({ map: (() => { const t = T.rock('#7a7062').clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 4); return t; })() })); wl.position.set(-22, 6, -6); wl.rotation.y = 0.25; D.add(wl);
    for (let i = 0; i < 12; i++) { const rk = rock(0.8 + Math.random() * 1.5, '#7a7062', { sy: 1 }); rk.position.set(-10 + i * 2.5, 0, -4.4 - Math.random() * 1.5); D.add(rk); }
    const dropM = box(100, 40, 6, lam({ map: T.rock('#5e564e') })); dropM.position.set(0, -20, -11); D.add(dropM);
    for (let i = 0; i < 8; i++) { const cp = cliffPine(i + 3, 1.2 + Math.random() * 0.6); cp.position.set(-30 + i * 9, 0, -7.5); cp.scale.x = i % 2 ? -1 : 1; D.add(cp); sway(D, cp, 0.012, 0.5); }
    for (let i = 0; i < 6; i++) { const m = mist(120, 8, '#fff0e0', 0.35); m.position.set(0, -14 + i * 2.4, -30 - i * 10); D.add(m); }
    ridges(D, [{ z: -180, y: -40, w: 520, h: 90, col: eve ? '#d08a6a' : '#a8c0d0', seed: 51, peaks: 4, snow: 0.75, snowC: eve ? '#ffd8b8' : '#f4f8fc' }, { z: -130, y: -44, w: 400, h: 70, col: eve ? '#9a6a62' : '#7a98a8', seed: 53, peaks: 6, lit: 1 }, { z: -80, y: -46, w: 260, h: 50, col: eve ? '#5a4448' : '#4a6a6a', seed: 57, peaks: 8, trees: 1 }]);
    D.floorAt = (x, z) => (z > -8 ? 0 : -40);
  } else {
    // the lake road home at sunset: rice paddies, a willow, the lake and a far boat
    lake(D, 200, 70, [0, -0.15, -42], { deep: '#3a3a5a', shallow: '#c8786a', hi: '#ffe0b0', flow: [0.1, 0.06] });
    D.add(at(box(200, 0.4, 4, lam({ map: T.mud('#6a5a40') })), [0, -0.1, -6.8]));
    for (let i = 0; i < 6; i++) { const w2 = tree('willow', i * 9, 1.8); w2.position.set(-30 + i * 12, 0, -5.5); D.add(w2); sway(D, w2, 0.015, 0.6); }
    for (let i = 0; i < 40; i++) { const rd = tree('reeds', i, 1.6); rd.position.set(-40 + i * 2 + Math.random(), -0.1, -8 - Math.random() * 1.5); D.add(rd); sway(D, rd, 0.04, 1); }
    const boat = new THREE.Group(); boat.position.set(14, -0.1, -34); D.add(boat); boat.add(at(box(3.2, 0.35, 0.9, lam({ color: '#3a2a1e' })), [0, 0.1, 0])); D.marks.boat = [14, -34, -1];
    D.tick((dt, t) => { boat.position.y = -0.1 + Math.sin(t * 1.1) * 0.04; boat.position.x = 14 - t * 0.05; D.marks.boat[0] = boat.position.x; });
    D.triggers.boat = (inst, on = 1) => { boat.visible = !!on; };
    for (let i = 0; i < 4; i++) { const m = mist(160, 5, '#ffd8c0', 0.3); m.position.set(0, 0.6, -20 - i * 8); D.add(m); }
    ridges(D, [{ z: -150, y: -6, w: 480, h: 50, col: '#c87a72', seed: 61, peaks: 4, snow: 0.8, snowC: '#ffe0c8' }, { z: -100, y: -6, w: 340, h: 34, col: '#8a5a62', seed: 63, peaks: 6, trees: 1 }, { z: -75, y: -4, w: 260, h: 20, col: '#4a3446', seed: 67, peaks: 9, trees: 1 }]);
    D.floorAt = (x, z) => (z > -7 ? 0 : z > -9 ? -0.1 : -0.15);
  }
  if (eve) sun(D, kind === 'lake' ? [20, 8, -140] : [60, 10, -150], '#ffa060', 16); else sun(D, [-50, 50, -150], '#fff4d8', 9, { op: 0.4 });
  clouds(D, [[-40, 30, -130, 60, 31], [20, 36, -140, 70, 33], [70, 28, -135, 50, 37]], eve ? '#ffb898' : '#ffffff', 0.85);
  grass(D, 120, [-30, 30, 3.2, 10], { seed: 17, cols: eve ? ['#6a7a2e', '#8a9a3a', '#c8b84a'] : undefined });
  if (kind !== 'cliff') grass(D, 50, [-30, 30, -4, -1.2], { seed: 18 });
  grass(D, 16, [-14, 14, 7, 9.5], { seed: 19, s: 1.1, h: 16 });
  branch(D, [-9, 8.6, 5], 2.4, 1, eve ? ['#3a3a1e', '#6a5a2a', '#a88a3a'] : undefined); branch(D, [10, 9.2, 4.5], 2.2, -1, eve ? ['#3a3a1e', '#6a5a2a', '#a88a3a'] : undefined);
  birdsAndLeaves(D, { by: 16, bz: -60 });
  D.flakes = kind === 'lake' ? { kind: 'petal', k: 0.4, box: [30, 10, 16] } : { kind: 'leaf', k: 0.6, box: [30, 12, 16] };
  D.mark('a', -6, 1, 1); D.mark('b', 0, 1, 1); D.mark('c', 6, 1, -1); D.mark('far', 14, 1, -1);
}
road.mood = 'bright';

// ================================================================ 血楓谷: the Blood Saber hall among red maples
function mapleHall(D, o) {
  D.cam0 = { x: 0, y: 1.8, z: 0, d: 17, yaw: 0, pitch: 9, fov: 30 };
  const leafFloor = (() => { const r = rng(71); return T.pave('#8a7a70'); })();
  D.add(floor(T.mud('#6a4a3a'), 0, 0, 100, 60, 0, { unit: 2 }));
  D.add(floor(leafFloor, 0, -0.5, 28, 13, 0.012, { unit: 2 }));
  // fallen leaves on the stones
  { const r = rng(5); const lc = cutout(16, 16, (x) => { for (let i = 0; i < 6; i++) { x.fillStyle = ['#b8241a', '#e04a1e', '#e8901e', '#8a1410'][i % 4]; x.fillRect(Math.floor(r() * 14), Math.floor(r() * 14), 2, 2); } }); for (let i = 0; i < 70; i++) { const m = cut(lc, PX * (1 + r()), { shadow: false }); m.rotation.x = -Math.PI / 2; m.geometry.translate(0, -0.5, 0); m.position.set(-14 + r() * 28, 0.02, -7 + r() * 13); D.add(m); } }
  // the hall: black roof, red lacquer pillars, banners of 血
  const H = new THREE.Group(); H.position.set(0, 0, -10); D.add(H);
  H.add(at(box(20, 0.8, 7, lam({ map: T.stone('#5a4a48') })), [0, 0.4, 0.5]));
  for (let i = 0; i < 4; i++) H.add(at(box(6, 0.2, 0.5, lam({ map: T.stone('#6a5a56') })), [0, 0.1 + i * 0.2, 4.2 - i * 0.4]));
  const lo = box(18, 4.4, 5, texMat(T.lacquer('#4a1014'), 9, 2.2)); lo.position.y = 3; H.add(lo);
  for (const x of [-6, -3, 0, 3, 6]) { const d = lattice(2.2, 3, '#ffa860', { k: 0.6, wood: '#2a0a0a' }); d.position.set(x, 2.6, 2.52); H.add(d); }
  for (const x of [-8.4, -4.5, -1.5, 1.5, 4.5, 8.4]) { const p = pillar(4.6, 0.24, '#8a1418'); p.position.set(x, 0.8, 3.3); H.add(p); }
  const rf = roof(18, 6, 2.8, '#1a1418', { over: 1.4, gable: '#2a0a0e' }); rf.position.y = 5.2; H.add(rf);
  const sg = sign('血刀門', 3.6, 1.2, { bg: '#0a0606', fg: '#e8302a', emit: '#5a1010' }); sg.position.set(0, 5.0, 3.8); H.add(sg);
  for (const x of [-9.6, 9.6]) { const bc = cutout(16, 48, (c) => { c.fillStyle = '#9a1018'; c.fillRect(1, 0, 14, 44); c.fillStyle = '#5a0a0e'; c.fillRect(1, 0, 14, 2); c.fillRect(1, 42, 14, 2); for (let k = 0; k < 4; k++) c.fillRect(1 + k * 4, 44, 2, 4); c.fillStyle = '#f0d8a0'; c.font = '900 12px serif'; c.textAlign = 'center'; c.fillText('血', 8, 16); c.fillText('刀', 8, 32); }); const bn = cut(bc, PX * 2.6); bn.position.set(x, 1.0, -6.0); D.add(bn); sway(D, bn, 0.03, 1.2); D.add(at(box(0.12, 6.4, 0.12, lam({ color: '#2a0a0a' })), [x, 3.2, -6.1])); }
  // braziers burning before the hall
  for (const x of [-5, 5]) { const br = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.3, 0.6, 10), std({ color: '#3a3030', metalness: 0.6 })); br.position.set(x, 1.3, -5.2); D.add(br); D.add(at(box(0.2, 1.0, 0.2, lam({ color: '#2a2224' })), [x, 0.5, -5.2])); fire(D, x, -5.2, 0.7).position.y = 1.5; }
  // the post 奕碩 is tied to
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 3.6, 10), lam({ map: T.planks('#5a3420') })); post.position.set(-7.4, 1.8, -2.4); post.castShadow = true; D.add(post);
  const ropes = new THREE.Group(); ropes.position.set(-7.4, 0, -2.4); D.add(ropes); for (const y of [0.9, 1.3]) { const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 4, 12), lam({ color: '#c8b080' })); r2.rotation.x = Math.PI / 2; r2.position.y = y; ropes.add(r2); }
  D.triggers.rope = (inst, on = 0) => { ropes.visible = !!on; if (!on && !inst && D.fx2) for (let i = 0; i < 10; i++) D.fx2.bits.spawn(new V3(-7.4, 1.1, -2.2), new V3((Math.random() - 0.5) * 3, Math.random() * 2, 0), { color: '#c8b080', size: 0.08, life: 1, g: 8, floor: 0.03 }); };
  // weapon racks of sabers
  for (const x of [-12, 11.5]) { const rk = new THREE.Group(); rk.position.set(x, 0, -4.5); D.add(rk); rk.add(at(box(2.4, 0.1, 0.25, lam({ color: '#2a0a0e' })), [0, 1.6, 0])); for (const sx of [-1.1, 1.1]) rk.add(at(box(0.1, 1.8, 0.1, lam({ color: '#2a0a0e' })), [sx, 0.9, 0])); for (let i = 0; i < 4; i++) { const sb = box(0.08, 1.8, 0.04, lam({ color: '#c8ccd8' })); sb.position.set(-0.8 + i * 0.55, 1.0, 0.1); sb.rotation.z = 0.1; rk.add(sb); } }
  // red maples all round; one of them (right) can be split by a cut
  const trees = [];
  for (const [x, z, s] of [[-14.5, -6, 2.6], [-17, 0, 2.2], [15, -6.5, 2.4], [17.5, 0.5, 2.2], [-21, -9, 2.8], [21, -10, 3], [-11, -11, 2], [11.5, -11.5, 2], [-25, 2, 2.4], [25, 3, 2.6]]) { const t2 = maple(x * 7 + z, s); t2.position.set(x, 0, z); D.add(t2); sway(D, t2, 0.014, 0.6); trees.push(t2); }
  // the tree that a deflected cut splits: two halves that slide and fall
  const cutTree = new THREE.Group(); cutTree.position.set(12.5, 0, -3.2); D.add(cutTree);
  const halfC = (top) => cutout(80, 96, (x) => { const m = maple(99, 1).material.map.image; x.drawImage(m, 0, 0); x.globalCompositeOperation = 'destination-in'; x.beginPath(); if (top) { x.moveTo(0, 0); x.lineTo(80, 0); x.lineTo(80, 50); x.lineTo(0, 74); } else { x.moveTo(0, 74); x.lineTo(80, 50); x.lineTo(80, 96); x.lineTo(0, 96); } x.closePath(); x.fill(); });
  const tTop = cut(halfC(1), PX * 2.2), tBot = cut(halfC(0), PX * 2.2); cutTree.add(tBot); cutTree.add(tTop); sway(D, cutTree, 0.01, 0.6);
  D.triggers.treecut = (inst) => { if (inst) { tTop.visible = false; return; } const t0 = D.t || 0; D.tick((dt, t) => { const u = t - t0; if (u < 0) return; if (u < 1.6) { tTop.position.x = u * u * 1.6; tTop.position.y = -u * u * 1.2; tTop.rotation.z = -u * u * 0.8; } else tTop.visible = false; }); if (D.fx2) { D.fx2.debris(new V3(12.5, 2.4, -3.2), 18, { colors: ['#5a3a24', '#b8241a', '#e04a1e'], floor: 0, speed: 4 }); D.fx2.gust(new V3(12.5, 3, -3), 8, 8); } };
  // the sky of the valley: crimson dusk, red ridges, rays through the leaves
  ridges(D, [{ z: -150, y: -6, w: 440, h: 60, col: '#a8505a', seed: 81, peaks: 4, snow: 0.82, snowC: '#ffc8b0' }, { z: -110, y: -6, w: 340, h: 44, col: '#7a3446', seed: 83, peaks: 6, trees: 1, lit: 1 }, { z: -70, y: -6, w: 240, h: 30, col: '#4a1e2e', seed: 87, peaks: 8, trees: 1 }]);
  sun(D, [-50, 10, -140], '#ff7a4a', 14); clouds(D, [[-30, 30, -130, 60, 41], [30, 36, -140, 70, 43], [80, 26, -135, 40, 47]], '#ff9a7a', 0.8);
  for (const [x, rz] of [[-10, 0.3], [-2, 0.32], [7, 0.3]]) { const sf = shaft(3, 26, '#ffb070', 0.14); sf.position.set(x, 20, -6); sf.rotation.z = rz; D.add(sf); }
  grass(D, 50, [-30, 30, 6, 10], { seed: 21, cols: ['#6a4a2a', '#9a6a2a', '#c88a3a'] });
  branch(D, [-10, 9, 5], 2.4, 1, ['#6a0e0e', '#b8241a', '#e86a2a']); branch(D, [11, 9.4, 4.5], 2.2, -1, ['#6a0e0e', '#b8241a', '#e86a2a']);
  D.birds = { n: 5, y: 18, z: -70, span: 120, period: 26, color: '#1a0a10' };
  D.flakes = { kind: 'maple', k: o.storm ? 1.6 : 0.8, box: [30, 14, 18], wind: 0.9 };
  D.mark('pillar', -7.4, -1.8, 1); D.mark('gate', 13, 2, -1); D.mark('c', 0, 1, 1); D.mark('steps', 0, -5, 1); D.mark('l', -4, 1, 1); D.mark('r', 4, 1, -1);
}
mapleHall.mood = 'maple';

Object.assign(SETS, { cliff, village, valley, cave, ledge, road, maple: mapleHall });
