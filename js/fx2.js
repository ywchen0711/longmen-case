// Book two's effects: the things a fight is made of. Slash arcs (bright crescents that sweep and leave a fading tail),
// afterimages, sword qi that travels, sparks (streaks), dust, debris and blood (pixel particles), shockwave rings on
// the ground, cracks and furrows left in it, the vertical river of light of 一刀・天河, glowing meridians and an aura,
// and the weather of a living set: falling leaves, petals, snow and fireflies that blade wind can blow away, and birds
// crossing the sky. Everything runs on game time (slow motion and hit-stop slow or freeze it).
import { THREE, PX, cutout, rng } from './render.js?v=3';

const V3 = THREE.Vector3;
const nearest = (c) => { const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace; return t; };

// ---------------------------------------------------------------- the slash arc: a swept band with a bright edge
// u runs along the sweep (0 at its start), v across the band (0 inside, 1 at the edge)
function bandGeo(kind, r, w, a0, a1, n = 40) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    if (kind === 'line') { const x = (t - 0.5) * r; pos.push(x, -w / 2, 0, x, w / 2, 0); }
    else { const a = (a0 + (a1 - a0) * t) * Math.PI / 180; const ri = r - w * (0.25 + 0.75 * Math.sin(t * Math.PI)); pos.push(Math.cos(a) * ri, Math.sin(a) * ri, 0, Math.cos(a) * r, Math.sin(a) * r, 0); }
    uv.push(t, 0, t, 1); if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g;
}
function bandMat(color, o = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: o.depthTest ?? true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { head: { value: 0 }, len: { value: o.len ?? 0.75 }, fade: { value: 1 }, col: { value: new THREE.Color(color) }, core: { value: new THREE.Color(o.core || '#ffffff') }, k: { value: o.k ?? 1.25 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float head, len, fade, k; uniform vec3 col, core; varying vec2 vUv;
      void main(){
        float u = floor(vUv.x * 56.0) / 56.0, v = floor(vUv.y * 8.0) / 8.0;
        float d = head - u; if (d < 0.0) discard;
        float tail = 1.0 - d / len; if (tail <= 0.0) discard;
        float edge = smoothstep(0.35, 1.0, v);
        vec3 c = mix(col * (0.35 + 0.65 * v), core, edge * tail);
        float a = (0.25 + 0.75 * v) * tail * fade;
        gl_FragColor = vec4(c * a * k, 1.0);
      }`,
  });
}
// the shapes of the cuts, as angles in the plane that faces the camera (0 = forward, 90 = up)
const ARCS = {
  down: { a0: 80, a1: -80, r: 1.3, w: 0.5, y: 1.25, x: 0.45 }, up: { a0: -95, a1: 75, r: 1.3, w: 0.5, y: 1.2, x: 0.45 },
  h: { a0: 170, a1: -20, r: 1.6, w: 0.6, y: 1.25, sy: 0.3, x: 0.2 }, spin: { a0: 0, a1: 380, r: 1.7, w: 0.55, y: 1.1, sy: 0.28 },
  aerial: { a0: 90, a1: -90, r: 1.5, w: 0.6, y: 1.2, x: 0.5 }, thrust: { line: 1, r: 2.4, w: 0.18, y: 1.45, x: 1.5 },
  draw: { a0: -70, a1: 60, r: 1.7, w: 0.6, y: 1.2, x: 0.4 }, big: { a0: 95, a1: -85, r: 2.0, w: 0.8, y: 1.35, x: 0.6 },
};

// ---------------------------------------------------------------- pixel particles: square points, or round ones
class Bits {
  constructor(scene, n = 1400) {
    this.n = n; this.i = 0; const g = new THREE.BufferGeometry();
    this.p = new Float32Array(n * 3).fill(-999); this.c = new Float32Array(n * 3); this.s = new Float32Array(n); this.a = new Float32Array(n); this.sh = new Float32Array(n);
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.c, 3)); g.setAttribute('size', new THREE.BufferAttribute(this.s, 1)); g.setAttribute('alpha', new THREE.BufferAttribute(this.a, 1)); g.setAttribute('shape', new THREE.BufferAttribute(this.sh, 1));
    this.mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { scale: { value: 600 } },
      vertexShader: 'attribute float size, alpha, shape; attribute vec3 color; varying vec3 vC; varying float vA, vS; uniform float scale; void main(){ vC = color; vA = alpha; vS = shape; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = clamp(size * scale / -mv.z, 1.0, 64.0); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'varying vec3 vC; varying float vA, vS; void main(){ if (vA <= 0.01) discard; vec2 q = floor(gl_PointCoord * 6.0) / 5.0 - 0.5; if (vS > 0.5 && dot(q, q) > 0.26) discard; gl_FragColor = vec4(vC, vA); }' });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = 7; scene.add(this.pts);
    this.list = new Array(n).fill(null);
  }
  spawn(p, v, o = {}) {
    const k = this.i++ % this.n; const col = new THREE.Color(o.color || '#ffffff');
    this.list[k] = { p: p.clone(), v: v.clone(), life: o.life || 0.6, t: 0, g: o.g ?? 0, drag: o.drag ?? 0, s0: o.size || 0.12, s1: o.size1 ?? (o.size || 0.12), a0: o.alpha ?? 1, floor: o.floor, bounce: o.bounce ?? 0.3 };
    this.c.set([col.r, col.g, col.b], k * 3); this.sh[k] = o.round ? 1 : 0;
  }
  update(dt) {
    for (let k = 0; k < this.n; k++) {
      const q = this.list[k]; if (!q) continue; q.t += dt; const f = q.t / q.life;
      if (f >= 1) { this.list[k] = null; this.a[k] = 0; this.p[k * 3 + 1] = -999; continue; }
      q.v.y -= q.g * dt; q.v.multiplyScalar(Math.max(0, 1 - q.drag * dt)); q.p.addScaledVector(q.v, dt);
      if (q.floor != null && q.p.y < q.floor) { q.p.y = q.floor; q.v.y = -q.v.y * q.bounce; q.v.x *= 0.6; q.v.z *= 0.6; }
      this.p.set([q.p.x, q.p.y, q.p.z], k * 3); this.s[k] = q.s0 + (q.s1 - q.s0) * f; this.a[k] = q.a0 * (f < 0.7 ? 1 : 1 - (f - 0.7) / 0.3);
    }
    const at = this.pts.geometry.attributes; at.position.needsUpdate = at.size.needsUpdate = at.alpha.needsUpdate = true; at.color.needsUpdate = true; at.shape.needsUpdate = true;
  }
  clear() { this.list.fill(null); this.a.fill(0); this.p.fill(-999); this.update(0); }
}
// sparks: short bright streaks drawn along their velocity
class Streaks {
  constructor(scene, n = 500) {
    this.n = n; this.i = 0; const g = new THREE.BufferGeometry(); this.p = new Float32Array(n * 6).fill(-999); this.c = new Float32Array(n * 6);
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.c, 3));
    this.lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    this.lines.frustumCulled = false; this.lines.renderOrder = 9; scene.add(this.lines); this.list = new Array(n).fill(null);
  }
  spawn(p, v, o = {}) { const k = this.i++ % this.n; this.list[k] = { p: p.clone(), v: v.clone(), life: o.life || 0.35, t: 0, g: o.g ?? 9, col: new THREE.Color(o.color || '#ffe6a0'), len: o.len ?? 0.05 }; }
  update(dt) {
    for (let k = 0; k < this.n; k++) {
      const q = this.list[k], o = k * 6; if (!q) continue; q.t += dt; const f = q.t / q.life;
      if (f >= 1) { this.list[k] = null; this.p[o + 1] = this.p[o + 4] = -999; continue; }
      q.v.y -= q.g * dt; q.p.addScaledVector(q.v, dt); const b = 1 - f;
      this.p.set([q.p.x, q.p.y, q.p.z, q.p.x - q.v.x * q.len, q.p.y - q.v.y * q.len, q.p.z - q.v.z * q.len], o);
      this.c.set([q.col.r * b * 1.6, q.col.g * b * 1.6, q.col.b * b * 1.6, q.col.r * b * 0.4, q.col.g * b * 0.4, q.col.b * b * 0.4], o);
    }
    const at = this.lines.geometry.attributes; at.position.needsUpdate = at.color.needsUpdate = true;
  }
  clear() { this.list.fill(null); this.p.fill(-999); this.update(0); }
}

// ---------------------------------------------------------------- textures drawn in code
const crackTex = (() => { let t; return () => t || (t = nearest(cutout(64, 64, (x) => { const r = rng(9); const arm = (cx, cy, a, len, w) => { let px = cx, py = cy; for (let i = 0; i < len; i++) { a += (r() - 0.5) * 0.7; const nx = px + Math.cos(a) * 2, ny = py + Math.sin(a) * 2; x.fillStyle = '#1a120c'; x.fillRect(Math.round(nx), Math.round(ny), w, w); x.fillStyle = 'rgba(255,220,160,0.25)'; x.fillRect(Math.round(nx) + w, Math.round(ny), 1, 1); px = nx; py = ny; if (r() < 0.12 && len > 6) arm(px, py, a + (r() < 0.5 ? 0.9 : -0.9), Math.floor(len / 2), 1); } }; for (let k = 0; k < 7; k++) arm(32, 32, k * 0.9 + r(), 10 + Math.floor(r() * 6), 2); x.fillStyle = '#100a06'; x.fillRect(28, 28, 8, 8); }))); })();
const ringTex = (() => { let t; return () => t || (t = nearest(cutout(64, 64, (x) => { for (let y = 0; y < 64; y++) for (let xx = 0; xx < 64; xx++) { const d = Math.hypot(xx - 31.5, y - 31.5); if (d > 24 && d < 31) { const a = d > 28 ? 1 : (d - 24) / 4; x.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; x.fillRect(xx, y, 1, 1); } } }))); })();
const leafCanvas = (c1, c2) => cutout(8, 8, (x) => { x.fillStyle = c1; x.fillRect(2, 1, 4, 6); x.fillRect(1, 2, 6, 3); x.fillStyle = c2; x.fillRect(3, 2, 1, 5); x.fillRect(2, 3, 3, 1); });
const leafTex = (() => { const c = {}; return (col, half) => { const k = (col || 'g') + (half || 0); if (c[k]) return c[k]; const cc = col || '#d89a2a'; return (c[k] = nearest(cutout(12, 12, (x) => { x.fillStyle = cc; for (let y = 1; y < 11; y++) { const w = Math.round(5 * Math.sin((y / 11) * Math.PI)); x.fillRect(6 - w, y, w * 2, 1); } x.fillStyle = '#7a4a10'; x.fillRect(6, 1, 1, 11); x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(3, 4, 2, 1); if (half) x.clearRect(half < 0 ? 6 : 0, 0, 6, 12); }))); }; })();
const birdTex = (() => { let t; return () => t || (t = [0, 1].map((k) => nearest(cutout(12, 6, (x) => { x.fillStyle = '#1a1a22'; if (k) { x.fillRect(0, 0, 2, 1); x.fillRect(2, 1, 2, 1); x.fillRect(4, 2, 4, 1); x.fillRect(8, 1, 2, 1); x.fillRect(10, 0, 2, 1); } else { x.fillRect(0, 3, 2, 1); x.fillRect(2, 2, 2, 1); x.fillRect(4, 2, 4, 1); x.fillRect(8, 2, 2, 1); x.fillRect(10, 3, 2, 1); } })))); })();
// the meridians: a figure of glowing channels, spine to fingertips and toes
const meridianTex = (() => { let t; return () => t || (t = nearest(cutout(48, 96, (x) => {
  const line = (pts, c) => { x.fillStyle = c; for (let i = 0; i + 1 < pts.length; i++) { const [a, b] = [pts[i], pts[i + 1]]; const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); for (let k = 0; k <= n; k++) x.fillRect(Math.round(a[0] + (b[0] - a[0]) * k / n), Math.round(a[1] + (b[1] - a[1]) * k / n), 2, 2); } };
  const paths = [[[24, 18], [24, 36], [24, 52]], [[24, 26], [16, 30], [12, 44], [10, 56]], [[24, 26], [32, 30], [36, 44], [38, 56]], [[24, 52], [20, 68], [18, 86]], [[24, 52], [28, 68], [31, 86]], [[24, 40], [18, 46]], [[24, 40], [30, 46]]];
  for (const p of paths) line(p, '#ffffff');
  for (const [cx, cy] of [[24, 44], [24, 30], [24, 20], [10, 56], [38, 56], [18, 86], [31, 86]]) { x.fillStyle = '#ffffff'; x.fillRect(cx - 1, cy - 1, 3, 3); }
}))); })();

// ---------------------------------------------------------------- the effects of a fight
export class Fx2 {
  constructor(scene, V) {
    this.scene = scene; this.V = V; this.list = []; this.bits = new Bits(scene); this.sparks = new Streaks(scene); this.flakes = null; this.birds = null; this.camYaw = 0;
  }
  clear() { for (const e of this.list) this.scene.remove(e.o); this.list = []; this.leafs = []; this.bits.clear(); this.sparks.clear(); this.setFlakes(null); this.setBirds(0); }
  add(o, tick) { this.scene.add(o); this.list.push({ o, tick, t: 0 }); return o; }
  update(dt, camYaw) {
    this.camYaw = camYaw; const cur = this.list; this.list = [];
    const keep = cur.filter((e) => { e.t += dt; const alive = e.tick(e.t, dt, e.o); if (!alive) { this.scene.remove(e.o); e.o.traverse?.((m) => { if (m.material && !m.userData.shared) m.material.dispose?.(); if (m.geometry && !m.userData.sharedGeo) m.geometry.dispose?.(); }); } return alive; });
    this.list = keep.concat(this.list);
    this.bits.update(dt); this.sparks.update(dt); if (this.flakes) this.flakes.update(dt); if (this.birds) this.birds.update(dt);
  }
  // ---- anything that changes over time: fn(k) with k going 0 to 1 over dur seconds
  tween(dur, fn) { return this.add(new THREE.Group(), (t) => { fn(Math.min(1, t / dur)); return t < dur; }); }
  // ---- a slash: kind of ARCS, at an actor (x, y, z, face), coloured
  arc(a, kind = 'down', o = {}) {
    const A = ARCS[kind] || ARCS.down, r = (o.r || A.r) * (o.s || 1), w = (o.w || A.w) * (o.s || 1);
    const geo = A.line ? bandGeo('line', r, w) : bandGeo('arc', r, w, A.a0, A.a1), mat = bandMat(o.color || '#8ac8ff', { core: o.core, len: o.len ?? (kind === 'spin' ? 0.45 : 0.8), k: typeof o.k === 'number' ? o.k : undefined });
    const m = new THREE.Mesh(geo, mat); m.renderOrder = 9; m.frustumCulled = false;
    const g = new THREE.Group(); g.add(m); g.position.set(a.x + (A.x || 0) * a.face * (o.s || 1), a.y + (o.y ?? A.y) * (o.s || 1), a.z + 0.25); g.scale.set(a.face, A.sy || 1, 1); if (o.rot) m.rotation.z = o.rot * Math.PI / 180;
    const dur = o.dur || (A.line ? 0.08 : 0.13), hold = o.hold || 0.22;
    return this.add(g, (t) => { g.rotation.y = this.camYaw; const h = Math.min(1, t / dur); mat.uniforms.head.value = h * (1 + (A.line ? 0.0 : 0.05)); if (A.line) mat.uniforms.head.value = 0.2 + h; mat.uniforms.fade.value = t < dur ? 1 : Math.max(0, 1 - (t - dur) / hold); return t < dur + hold; });
  }
  // ---- an afterimage of a sprite: a tinted copy that fades
  ghost(body, color = '#7ab0ff', life = 0.28, op = 0.55) {
    const src = body.mesh; const m = new THREE.Mesh(src.geometry, new THREE.MeshBasicMaterial({ map: src.material.map, color, transparent: true, opacity: op, depthWrite: false, alphaTest: 0.05, side: THREE.DoubleSide }));
    m.userData.sharedGeo = true; m.position.copy(src.position); m.rotation.copy(src.rotation); m.scale.copy(src.scale); m.renderOrder = 3;
    return this.add(m, (t) => { m.material.opacity = op * (1 - t / life); return t < life; });
  }
  // ---- sparks, dust, debris, blood, chips of anything
  sparkBurst(p, n = 18, o = {}) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, e = (Math.random() - 0.3) * 1.4, sp = (o.speed || 7) * (0.4 + Math.random() * 0.8); const dir = o.dir ? o.dir.clone().multiplyScalar(0.6).add(new V3(Math.cos(a) * 0.6, e * 0.6, Math.sin(a) * 0.3)) : new V3(Math.cos(a), e, Math.sin(a) * 0.5); this.sparks.spawn(p, dir.normalize().multiplyScalar(sp), { color: o.color || (Math.random() < 0.5 ? '#ffe2a0' : '#fff8e8'), life: 0.18 + Math.random() * 0.3 }); } }
  dust(p, n = 10, o = {}) { const fl = o.floor ?? p.y; for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = (o.speed || 1.6) * (0.3 + Math.random()); this.bits.spawn(new V3(p.x + (Math.random() - 0.5) * (o.spread || 0.6), fl + 0.1 + Math.random() * 0.2, p.z + (Math.random() - 0.5) * 0.3), new V3(Math.cos(a) * sp + (o.vx || 0), 0.4 + Math.random() * (o.up || 0.8), Math.sin(a) * sp * 0.4), { color: o.color || (Math.random() < 0.5 ? '#b8a88a' : '#d6c8aa'), size: (o.size || 0.32) * (0.6 + Math.random() * 0.6), size1: (o.size || 0.32) * 2.2, life: (o.life || 0.9) * (0.6 + Math.random() * 0.6), drag: 2.4, alpha: o.alpha ?? 0.7, round: true }); } }
  debris(p, n = 14, o = {}) { const fl = o.floor ?? 0; for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = (o.speed || 5) * (0.3 + Math.random() * 0.8); const d = new V3(Math.cos(a) * sp * (o.sx ?? 1) + (o.vx || 0), 2 + Math.random() * (o.up || 5), Math.sin(a) * sp * 0.5); this.bits.spawn(p, d, { color: (o.colors || ['#7a6a5a', '#5a4a3e', '#9a8a76'])[i % (o.colors || [0, 0, 0]).length], size: (o.size || 0.13) * (0.6 + Math.random()), life: 1.2 + Math.random(), g: 14, floor: fl + 0.04, bounce: 0.35, drag: 0.4 }); } }
  blood(p, dir, n = 12) { for (let i = 0; i < n; i++) { const v = dir.clone().multiplyScalar(2 + Math.random() * 3).add(new V3((Math.random() - 0.5) * 2, Math.random() * 2.5, (Math.random() - 0.5))); this.bits.spawn(p, v, { color: Math.random() < 0.5 ? '#c01818' : '#7a0a0a', size: 0.08 + Math.random() * 0.06, life: 0.7, g: 12, floor: 0.03, bounce: 0 }); } }
  // ---- a flat shockwave ring on the ground and one standing up, facing us
  ring(p, o = {}) {
    const R = o.r || 4, col = o.color || '#ffffff', dur = o.dur || 0.45;
    const flat = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: ringTex(), color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flat.rotation.x = -Math.PI / 2; flat.position.set(p.x, (o.floor ?? 0) + 0.05, p.z); flat.renderOrder = 6;
    this.add(flat, (t) => { const k = t / dur; flat.scale.setScalar(0.2 + R * (1 - (1 - k) ** 3)); flat.material.opacity = 1 - k; return k < 1; });
    if (o.up !== false) { const up = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: ringTex(), color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); up.position.copy(p); up.renderOrder = 9; this.add(up, (t) => { up.rotation.y = this.camYaw; const k = t / (dur * 0.8); up.scale.set(0.2 + R * 0.6 * k, 0.2 + R * 0.45 * k, 1); up.material.opacity = 0.9 * (1 - k); return k < 1; }); }
  }
  // ---- marks left in the ground: a crack (stays a while), furrows along a skid
  crack(p, o = {}) { const s = o.s || 2.4, m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshLambertMaterial({ map: crackTex(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 6; m.position.set(p.x, (o.floor ?? 0) + 0.03, p.z); m.renderOrder = 2; const life = o.life || 14; return this.add(m, (t) => { m.scale.setScalar(s * Math.min(1, 0.4 + t * 8)); m.material.opacity = t > life - 2 ? Math.max(0, (life - t) / 2) : 1; return t < life; }); }
  furrow(a, b, o = {}) {
    const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz) || 0.01, life = o.life || 12;
    for (const off of [-0.18, 0.18]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 1), new THREE.MeshBasicMaterial({ color: o.color || '#2a2016', transparent: true, opacity: 0.75, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.atan2(dx, dz); const g = new THREE.Group(); g.add(m); g.position.set(a.x, (o.floor ?? 0) + 0.025, a.z + off); g.userData.tick = null; m.position.y = 0; const st = { L: 0 };
      this.add(g, (t) => { st.L = Math.min(L, L * t / (o.dur || 0.4)); m.scale.y = st.L; m.position.set(dx / L * st.L / 2, 0, dz / L * st.L / 2); m.material.opacity = t > life - 2 ? 0.75 * Math.max(0, (life - t) / 2) : 0.75; return t < life; }); }
  }
  // ---- sword qi that flies from a to b (a vertical crescent), leaving a trail and sparks; end(p) when it lands
  qi(a, b, o = {}) {
    const face = Math.sign(b.x - a.x) || 1, s = o.s || 1, col = o.color || '#8ac8ff';
    const mk = (op) => { const geo = bandGeo('arc', 1.6 * s, 0.75 * s, -80, 80), mat = bandMat(col, { len: 2, core: o.core, k: (o.k || 1.8) * op }); mat.uniforms.head.value = 1.2; const m = new THREE.Mesh(geo, mat); m.renderOrder = 9; m.frustumCulled = false; const g = new THREE.Group(); g.add(m); g.scale.x = face; if (o.flat) { m.rotation.x = -Math.PI / 2.4; } return g; };
    const g = mk(1), dur = o.dur || 0.5, st = { tr: 0 }; g.position.copy(a);
    return this.add(g, (t, dt) => {
      g.rotation.y = this.camYaw; const k = Math.min(1, t / dur); g.position.lerpVectors(a, b, k); const sc = 1 + k * (o.grow || 0.3); g.scale.set(face * sc, sc, 1);
      st.tr += dt; if (st.tr > 0.04) { st.tr = 0; const tg = mk(0.35); tg.position.copy(g.position); tg.scale.copy(g.scale); this.add(tg, (tt) => { tg.rotation.y = this.camYaw; tg.children[0].material.uniforms.fade.value = Math.max(0, 1 - tt / 0.12); return tt < 0.12; }); if (o.ground !== false) { const gp = g.position.clone(); gp.y = o.floor ?? 0; this.dust(gp, 1, { speed: 0.8, size: 0.25, life: 0.6, floor: o.floor ?? 0 }); if (Math.random() < 0.6) this.sparks.spawn(new V3(gp.x, gp.y + 0.1, gp.z), new V3(-face * 3, 2 + Math.random() * 2, (Math.random() - 0.5) * 2), { color: col, life: 0.3 }); } }
      if (k >= 1) { this.sparkBurst(b, 22, { color: '#d8ecff' }); o.end?.(b); }
      return k < 1;
    });
  }
  // ---- 一刀・天河: a vertical river of light, top of the sky to the ground
  column(p, o = {}) {
    const H = o.h || 40, col = new THREE.Color(o.color || '#bfe4ff'), dur = o.dur || 2.4;
    const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
      uniforms: { t: { value: 0 }, w: { value: 0 }, a: { value: 1 }, col: { value: col } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float t, w, a; uniform vec3 col; varying vec2 vUv;
        float h(float x){ return fract(sin(x * 91.7) * 43758.5); }
        void main(){
          float x = abs(vUv.x - 0.5) * 2.0; float qx = floor(vUv.x * 64.0); float y = floor(vUv.y * 220.0) / 220.0;
          if (x > w) discard;
          float core = 1.0 - smoothstep(0.0, w * 0.45, x);
          float streak = step(0.72, h(qx + floor(y * 18.0 + t * 26.0 * (0.6 + h(qx) ))));
          vec3 c = mix(col * 0.7, vec3(1.0), core) + col * streak * 0.6 * (1.0 - core);
          float edge = 1.0 - smoothstep(w * 0.7, w, x);
          gl_FragColor = vec4(c * (0.4 + 0.9 * core + 0.3 * streak) * edge * a, 1.0);
        }` });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(o.width || 3.4, H), mat); m.position.set(p.x, (o.floor ?? 0) + H / 2 - 2, p.z); m.renderOrder = 10; m.frustumCulled = false;
    return this.add(m, (t) => { m.rotation.y = this.camYaw; mat.uniforms.t.value = t; const k = t / dur; mat.uniforms.w.value = k < 0.08 ? k / 0.08 : 1 - Math.max(0, k - 0.25) * 0.9; mat.uniforms.a.value = k < 0.7 ? 1 : Math.max(0, 1 - (k - 0.7) / 0.3); return k < 1; });
  }
  // ---- a body in the grip of 赤陽果's heat: glowing channels that pulse from red to gold to a calm blue
  meridians(actor, o = {}) {
    const mat = new THREE.MeshBasicMaterial({ map: meridianTex(), color: o.color || '#ff4020', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, alphaTest: 0.05 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 2.5), mat); m.renderOrder = 11; const dur = o.dur || 6;
    const cols = (o.cols || ['#ff3010', '#ffb020', '#80d0ff']).map((c) => new THREE.Color(c));
    return this.add(m, (t) => { m.rotation.y = this.camYaw; m.position.set(actor.x + 0.1 * actor.face, actor.y + 1.05 + (actor.air || 0), actor.z + 0.15); m.scale.x = actor.face; const k = Math.min(1, t / dur) * (cols.length - 1), i = Math.min(cols.length - 2, Math.floor(k)); mat.color.copy(cols[i]).lerp(cols[i + 1], k - i); mat.opacity = (0.55 + 0.45 * Math.sin(t * 9)) * (t > dur ? Math.max(0, 1 - (t - dur) / 1.2) : Math.min(1, t * 3)); return t < dur + 1.2; });
  }
  aura(actor, o = {}) {
    const col = o.color || '#9ad4ff', dur = o.dur || 4, st = { k: 0 };
    return this.add(new THREE.Group(), (t, dt) => { st.k += dt; if (st.k > 0.03) { st.k = 0; const a = Math.random() * Math.PI * 2; const p = new V3(actor.x + Math.cos(a) * 0.55, actor.y + (actor.air || 0) + Math.random() * 2.4, actor.z + Math.sin(a) * 0.25); this.bits.spawn(p, new V3(0, 1.5 + Math.random() * 1.5, 0), { color: Math.random() < 0.5 ? col : '#ffffff', size: 0.07 + Math.random() * 0.06, life: 0.6 + Math.random() * 0.4, alpha: 0.9 }); } return t < dur; });
  }
  // ---- a chunk thrown off by a blow: a box that tumbles and lands
  chunk(p, v, o = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(o.s || 0.4, (o.s || 0.4) * 0.7, (o.s || 0.4) * 0.8), new THREE.MeshLambertMaterial({ color: o.color || '#7a6e62' })); m.castShadow = true; m.position.copy(p); const vel = v.clone(), spin = new V3(Math.random() * 8, Math.random() * 8, Math.random() * 8), fl = (o.floor ?? 0) + (o.s || 0.4) * 0.35;
    return this.add(m, (t, dt) => { vel.y -= 14 * dt; m.position.addScaledVector(vel, dt); if (m.position.y < fl) { m.position.y = fl; vel.multiplyScalar(0.4); vel.y = Math.abs(vel.y) * 0.3; spin.multiplyScalar(0.5); } m.rotation.x += spin.x * dt; m.rotation.y += spin.y * dt; m.rotation.z += spin.z * dt; return t < (o.life || 8); });
  }
  // ---- big leaves that drift down in front of someone, to be cut: cutLeaves('one') halves the nearest and leaves the
  // rest untouched; cutLeaves('all') blows every one of them away
  dropLeaves(p, n = 5, o = {}) {
    this.leafs = this.leafs || []; const tex = leafTex(o.color);
    for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.4 })); s.scale.set(0.42, 0.42, 1); const L = { s, p: new V3(p.x + (i - (n - 1) / 2) * (o.gap || 0.55) + (Math.random() - 0.5) * 0.2, p.y + 1.6 + i * (o.stagger ?? 0.35), p.z + 0.4), v: new V3(0, -(o.fall || 0.45), 0), ph: Math.random() * 6, cut: 0 }; this.leafs.push(L);
      this.add(s, (t, dt) => { if (!L.cut) { L.p.x += Math.sin(t * 2 + L.ph) * dt * 0.3; } L.p.addScaledVector(L.v, dt); if (L.cut) { L.v.multiplyScalar(Math.max(0, 1 - dt * 1.5)); L.v.y -= dt * 2; } s.position.copy(L.p); s.material.rotation = Math.sin(t * 3 + L.ph) * 0.6 + (L.spin || 0) * t; const alive = L.p.y > (o.floor ?? 0) + 0.05 && t < 14; if (!alive) this.leafs = this.leafs.filter((x) => x !== L); return alive; }); }
  }
  cutLeaves(mode, at) {
    const L = (this.leafs || []).filter((l) => !l.cut); if (!L.length) return;
    if (mode === 'all') { for (const l of L) { l.cut = 1; l.v.set((Math.random() - 0.3) * 6, 2 + Math.random() * 3, (Math.random() - 0.5) * 2); l.spin = (Math.random() - 0.5) * 20; } return; }
    const tgt = at ? L.reduce((a, b) => (a.p.distanceTo(at) < b.p.distanceTo(at) ? a : b)) : L[0];
    tgt.cut = 1; tgt.s.visible = false; tgt.p.y = -99;
    for (const side of [-1, 1]) { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: leafTex(null, side), transparent: true, alphaTest: 0.4 })); h.scale.set(0.42, 0.42, 1); const p = tgt.s.position.clone(), v = new V3(side * 0.6, 0.3, 0); this.add(h, (t, dt) => { v.y -= dt * 0.8; v.x *= 1 - dt; p.addScaledVector(v, dt); h.position.copy(p); h.material.rotation = side * t * 2; return p.y > 0.05 && t < 6; }); }
    this.sparks.spawn(tgt.s.position.clone(), new V3(1, 0, 0), { color: '#ffffff', life: 0.2, g: 0, len: 0.1 }); this.sparks.spawn(tgt.s.position.clone(), new V3(-1, 0, 0), { color: '#ffffff', life: 0.2, g: 0, len: 0.1 });
  }
  // ---- the weather of a set: leaves, petals, snow or fireflies around the camera; gust() blows them away
  setFlakes(o) { if (this.flakes) { this.flakes.dispose(); this.flakes = null; } if (o) this.flakes = new Flakes(this.scene, o); }
  gust(p, power = 6, radius = 6) { this.flakes?.gust(p, power, radius); }
  setBirds(n, o = {}) { if (this.birds) { this.birds.dispose(); this.birds = null; } if (n) this.birds = new Birds(this.scene, n, o); }
}

// ---------------------------------------------------------------- falling things
const FLAKE = {
  maple: { n: 260, cols: [['#c8241a', '#8a1410'], ['#e04a1e', '#9a2a10'], ['#e8901e', '#a85a10'], ['#b01828', '#6a0a14']], fall: 0.9, sway: 1.2, size: 0.2 },
  leaf: { n: 120, cols: [['#c8a030', '#8a6a1a'], ['#9aa040', '#5a6a20'], ['#d87a28', '#8a4a10']], fall: 0.8, sway: 1, size: 0.17 },
  petal: { n: 140, cols: [['#f8c8d8', '#e090a8'], ['#ffe0ea', '#f0a8c0']], fall: 0.6, sway: 1.4, size: 0.12 },
  snow: { n: 420, cols: [['#ffffff', '#dfe8f4']], fall: 0.7, sway: 0.5, size: 0.09 },
  fireflies: { n: 60, cols: [['#e8ff90', '#a8e040']], fall: 0, sway: 0.4, size: 0.11, glow: 1 },
  spray: { n: 160, cols: [['#e8f4ff', '#c0d8ec']], fall: 0.3, sway: 0.8, size: 0.08 },
};
class Flakes {
  constructor(scene, o) {
    const K = FLAKE[o.kind] || FLAKE.leaf, n = Math.round(K.n * (o.k ?? 1)); this.K = K; this.o = o; this.n = n; this.scene = scene; this.wind = o.wind ?? 0.6; this.box = o.box || [26, 12, 16]; this.center = new V3(...(o.center || [0, 0, 0])); this.follow = !o.center;
    const g = new THREE.BufferGeometry(); this.p = new Float32Array(n * 3); this.col = new Float32Array(n * 3); this.ph = new Float32Array(n);
    this.d = []; const r = rng(o.seed || 17);
    for (let i = 0; i < n; i++) { const c = K.cols[i % K.cols.length], cc = new THREE.Color(c[0]); this.col.set([cc.r, cc.g, cc.b], i * 3); this.ph[i] = r() * 6.28; this.d.push({ x: (r() - 0.5) * this.box[0], y: r() * this.box[1], z: (r() - 0.5) * this.box[2], vx: 0, vy: 0, vz: 0, s: 0.6 + r() * 0.8 }); }
    g.setAttribute('position', new THREE.BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.BufferAttribute(this.col, 3)); g.setAttribute('ph', new THREE.BufferAttribute(this.ph, 1));
    this.mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: K.glow ? THREE.AdditiveBlending : THREE.NormalBlending, uniforms: { t: { value: 0 }, size: { value: K.size * 600 }, glow: { value: K.glow ? 1 : 0 }, kind: { value: o.kind === 'snow' || o.kind === 'spray' ? 1 : 0 } },
      vertexShader: 'attribute float ph; attribute vec3 color; varying vec3 vC; varying float vP; uniform float t, size; void main(){ vC = color; vP = ph; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = clamp(size / -mv.z, 2.0, 14.0); gl_Position = projectionMatrix * mv; }',
      fragmentShader: `uniform float t, glow, kind; varying vec3 vC; varying float vP;
        void main(){
          vec2 q = floor(gl_PointCoord * 8.0) / 7.0 - 0.5;
          if (glow > 0.5) { float d = length(q); float b = 0.5 + 0.5 * sin(t * 3.0 + vP * 3.0); if (d > 0.5) discard; gl_FragColor = vec4(vC * (d < 0.18 ? 1.6 : 0.5) * b, (d < 0.18 ? 1.0 : 0.35) * b); return; }
          if (kind > 0.5) { if (length(q) > 0.42) discard; gl_FragColor = vec4(vC, 0.9); return; }
          float a = vP + t * 2.0; float c = cos(a), s = sin(a); vec2 r = vec2(c * q.x - s * q.y, s * q.x + c * q.y);
          float flip = abs(sin(t * 3.0 + vP)); r.x /= max(0.25, flip);
          if (abs(r.x) + abs(r.y) * 0.8 > 0.42) discard;
          float vein = abs(r.y) < 0.07 ? 0.7 : 1.0;
          gl_FragColor = vec4(vC * vein * (0.75 + 0.25 * flip), 1.0);
        }` });
    this.pts = new THREE.Points(g, this.mat); this.pts.frustumCulled = false; this.pts.renderOrder = 5; scene.add(this.pts); this.t = 0;
  }
  gust(p, power, radius) { for (const d of this.d) { const wx = this.base.x + d.x, wy = this.base.y + d.y, wz = this.base.z + d.z, dx = wx - p.x, dy = wy - p.y, dz = wz - p.z, L = Math.hypot(dx, dy, dz); if (L < radius && L > 0.01) { const k = power * (1 - L / radius); d.vx += dx / L * k; d.vy += Math.abs(dy / L) * k * 0.6 + k * 0.3; d.vz += dz / L * k * 0.4; } } }
  get base() { return this.follow && this.target ? this.target : this.center; }
  update(dt) {
    this.t += dt; this.mat.uniforms.t.value = this.t; const K = this.K, B = this.box, c = this.base, P = this.p;
    for (let i = 0; i < this.n; i++) {
      const d = this.d[i];
      if (K.glow) { d.x += Math.sin(this.t * 0.7 + i) * dt * 0.4; d.y += Math.cos(this.t * 0.9 + i * 2) * dt * 0.25; }
      else { d.y -= K.fall * d.s * dt; d.x += (this.wind + Math.sin(this.t * K.sway + i) * 0.5) * dt; d.z += Math.cos(this.t * 0.7 + i) * 0.2 * dt; }
      d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; const dm = Math.max(0, 1 - 1.6 * dt); d.vx *= dm; d.vy *= dm; d.vz *= dm;
      if (d.y < 0) { d.y += B[1]; d.x = (Math.random() - 0.5) * B[0]; } if (d.y > B[1]) d.y -= B[1];
      if (d.x > B[0] / 2) d.x -= B[0]; if (d.x < -B[0] / 2) d.x += B[0]; if (d.z > B[2] / 2) d.z -= B[2]; if (d.z < -B[2] / 2) d.z += B[2];
      P[i * 3] = c.x + d.x; P[i * 3 + 1] = (this.o.floor || 0) + d.y; P[i * 3 + 2] = c.z + d.z;
    }
    this.pts.geometry.attributes.position.needsUpdate = true;
  }
  dispose() { this.scene.remove(this.pts); this.pts.geometry.dispose(); this.mat.dispose(); }
}
// a few birds that cross the sky now and then
class Birds {
  constructor(scene, n, o) {
    this.scene = scene; this.o = o; this.g = new THREE.Group(); scene.add(this.g); this.t = 0; this.list = [];
    for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: birdTex()[0], color: o.color || '#20202a', fog: false, transparent: true })); s.scale.set(0.9 * (o.s || 1), 0.45 * (o.s || 1), 1); this.g.add(s); this.list.push({ s, dx: (i % 3) * 1.6 + Math.random(), dy: Math.floor(i / 3) * 0.9 + Math.random() * 0.4, ph: Math.random() * 6 }); }
    this.period = o.period || 16;
  }
  update(dt) {
    this.t += dt; const o = this.o, k = (this.t % this.period) / this.period, span = o.span || 80;
    const x = -span / 2 + span * k, y = (o.y || 14) + Math.sin(k * 6) * 1.2, z = o.z ?? -30;
    for (const b of this.list) { b.s.position.set((o.dir || 1) * (x - b.dx * 2), y + b.dy, z - b.dx); b.s.material.map = birdTex()[Math.floor(this.t * 6 + b.ph) % 2]; }
  }
  dispose() { this.scene.remove(this.g); }
}
