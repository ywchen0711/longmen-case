// The weather and the light of the HD-2D dioramas, and the effects of the story: rain streaks with splashes, a
// flowing pixel river that mirrors the lanterns and rings with raindrops, mist, light shafts, hanging lanterns that
// sway, candles that flicker (and can be snuffed), emote marks over heads, and the moves (sword qi, palm wind,
// whirlwind ball, iron chain, ink darts, a dart from the dark).
import { THREE, PX, cutout, cutoutMesh, pxTex, rng } from './render.js?v=1';

const canvasTex = (c, nearest = true) => { const t = new THREE.CanvasTexture(c); if (nearest) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; } t.colorSpace = THREE.SRGBColorSpace; return t; };
const softTex = (() => { let t; return () => t || (t = canvasTex(cutout(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }), false)); })();
export function glow(color = '#ffb060', size = 1.4, opacity = 0.6) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  s.scale.set(size, size, 1); s.renderOrder = 5; return s;
}

// ---------------------------------------------------------------- rain
export class Rain {
  constructor(scene) {
    this.scene = scene; this.n = 1600; this.level = 0; this.center = new THREE.Vector3(); this.floor = () => 0; this.wind = 0.18;
    const g = new THREE.BufferGeometry(); this.pos = new Float32Array(this.n * 6); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    this.lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#b8cce8', transparent: true, opacity: 0.42, depthWrite: false, fog: true }));
    this.lines.frustumCulled = false; this.lines.renderOrder = 6; scene.add(this.lines);
    this.d = []; const r = rng(77); for (let i = 0; i < this.n; i++) this.d.push({ x: (r() - 0.5) * 34, y: r() * 16, z: (r() - 0.5) * 22, v: 15 + r() * 6 });
    // splashes: little points that pop and fade
    this.sn = 220; const sg = new THREE.BufferGeometry(); this.sp = new Float32Array(this.sn * 3); this.sl = new Float32Array(this.sn).fill(1);
    sg.setAttribute('position', new THREE.BufferAttribute(this.sp, 3)); sg.setAttribute('life', new THREE.BufferAttribute(this.sl, 1));
    this.splash = new THREE.Points(sg, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { scale: { value: 300 } },
      vertexShader: 'attribute float life; varying float vL; uniform float scale; void main(){ vL = life; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = (2.0 + life * 7.0) * scale / -mv.z * 0.06; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'varying float vL; void main(){ vec2 p = gl_PointCoord - 0.5; float d = length(p * vec2(1.0, 2.2)); float ring = step(abs(d - 0.36 * vL - 0.08), 0.07); if (ring < 0.5 || vL >= 1.0) discard; gl_FragColor = vec4(0.82, 0.88, 1.0, (1.0 - vL) * 0.85); }',
    }));
    this.splash.frustumCulled = false; this.splash.renderOrder = 6; scene.add(this.splash); this.si = 0;
    this.set(0);
  }
  set(v) { this.level = v; this.lines.visible = this.splash.visible = v > 0; }
  update(dt, center) {
    if (this.level <= 0) return; this.center.copy(center);
    const n = Math.floor(this.n * Math.min(1, this.level)), P = this.pos, len = 0.55, w = this.wind;
    for (let i = 0; i < this.n; i++) {
      const d = this.d[i], o = i * 6;
      if (i >= n) { P[o + 1] = P[o + 4] = -999; continue; }
      d.y -= d.v * dt; d.x += d.v * w * dt;
      const wx = this.center.x + d.x, wz = this.center.z + d.z, fy = this.floor(wx, wz);
      if (d.y < fy - this.center.y + 0.0 || d.x > 17) {
        if (d.y < fy - this.center.y + 0.0 && Math.random() < 0.5) { const k = this.si++ % this.sn; this.sp[k * 3] = wx; this.sp[k * 3 + 1] = fy + 0.03; this.sp[k * 3 + 2] = wz; this.sl[k] = 0; }
        d.y += 14 + Math.random() * 3; d.x = (Math.random() - 0.5) * 34;
      }
      const y = this.center.y + d.y; P[o] = wx; P[o + 1] = y; P[o + 2] = wz; P[o + 3] = wx - w * len; P[o + 4] = y + len; P[o + 5] = wz;
    }
    for (let k = 0; k < this.sn; k++) if (this.sl[k] < 1) this.sl[k] = Math.min(1, this.sl[k] + dt * 4.5);
    this.lines.geometry.attributes.position.needsUpdate = true; this.splash.geometry.attributes.position.needsUpdate = true; this.splash.geometry.attributes.life.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- the river: a pixel-quantised flowing surface
export function waterMaterial(o = {}) {
  const lp = [], lc = []; for (let i = 0; i < 6; i++) { lp.push(new THREE.Vector3(0, -99, 0)); lc.push(new THREE.Color(0, 0, 0)); }
  const m = new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
      time: { value: 0 }, rain: { value: o.rain ?? 0 }, flash: { value: 0 }, flow: { value: new THREE.Vector2(...(o.flow || [0.9, 0.15])) },
      deep: { value: new THREE.Color(o.deep || '#0e2236') }, shallow: { value: new THREE.Color(o.shallow || '#2a5a76') }, hi: { value: new THREE.Color(o.hi || '#9ac4dc') }, rough: { value: o.rough ?? 1 },
      lp: { value: lp }, lc: { value: lc }, nl: { value: 0 },
    }]),
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
      }`,
    fragmentShader: `uniform float time, rain, flash, rough; uniform vec2 flow; uniform vec3 deep, shallow, hi; uniform vec3 lp[6]; uniform vec3 lc[6]; uniform int nl; varying vec3 vW;
      #include <fog_pars_fragment>
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec2 p = floor(vW.xz * 16.0) / 16.0;
        vec2 q = p - flow * time;
        float w = sin(q.x * 1.3 + sin(q.y * 0.8 + time * 0.3) * 1.6) * 0.5 + sin(q.y * 2.7 + q.x * 0.5 + time * 0.9) * 0.5 * rough;
        vec3 c = mix(deep, shallow, smoothstep(-0.7, 0.9, w));
        vec2 gq = floor(q * vec2(1.2, 5.0));
        float cell = h(gq);
        if (cell > 0.9 && fract(q.x * 1.2) < 0.55) c = mix(c, hi, 0.5);
        else if (cell < 0.06 && fract(q.x * 1.2) < 0.4) c = mix(c, deep * 0.7, 0.6);
        for (int i = 0; i < 6; i++) { if (i >= nl) break; vec3 L = lp[i]; float dx = abs(p.x - L.x); float dz = p.y - L.z;
          float col = exp(-dx * dx * 4.0) * exp(-max(0.0, dz - 0.5) * 0.22) * step(-0.3, dz);
          float br = step(0.42, fract(p.y * 3.0 + w * 0.9 + time * 0.6 + dx));
          c += lc[i] * col * br; }
        if (rain > 0.0) { vec2 g = p * 1.4; vec2 id = floor(g); float ph = fract(time * 0.8 + h(id) * 7.0); vec2 o = vec2(h(id + 3.1), h(id + 7.7)) * 0.6 + 0.2; float d = length(fract(g) - o); float ring = 1.0 - smoothstep(0.0, 0.045, abs(d - ph * 0.34)); c += vec3(0.45, 0.55, 0.68) * ring * (1.0 - ph) * rain * 0.8; }
        c += flash * vec3(0.45, 0.5, 0.65);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  m.setLights = (arr) => { arr.slice(0, 6).forEach((l, i) => { lp[i].copy(l.pos); lc[i].set(l.color).multiplyScalar(l.k ?? 0.8); }); m.uniforms.nl.value = Math.min(6, arr.length); };
  return m;
}

// ---------------------------------------------------------------- mist, light shafts
const mistTex = (() => { let t; return () => t || (t = (() => { const r = rng(5); const c = cutout(256, 64, (x) => { for (let i = 0; i < 70; i++) { const cx = r() * 256, cy = 18 + r() * 28, rr = 10 + r() * 26, g = x.createRadialGradient(cx, cy, 0, cx, cy, rr); g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 64); } }); const tx = canvasTex(c, false); tx.wrapS = THREE.RepeatWrapping; return tx; })()); })();
export function mist(w, h, color = '#c8d4e0', opacity = 0.5) {
  const t = mistTex().clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping;
  // soft at every edge: the plane's vertices fade to nothing at its border
  const g = new THREE.PlaneGeometry(w, h, 12, 4), n = g.attributes.position.count, col = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) { const x = g.attributes.position.getX(i) / (w / 2), y = g.attributes.position.getY(i) / (h / 2); const a = Math.max(0, 1 - Math.abs(x) ** 3) * Math.max(0, 1 - Math.abs(y) ** 2); col.set([1, 1, 1, a], i * 4); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 4));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t, color, transparent: true, opacity, depthWrite: false, fog: true, vertexColors: true }));
  m.renderOrder = 4; m.userData.tick = (dt) => { t.offset.x += dt * 0.012; }; return m;
}
const shaftTex = (() => { let t; return () => t || (t = canvasTex(cutout(32, 128, (x) => { const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 128); const h = x.createLinearGradient(0, 0, 32, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.3, 'rgba(0,0,0,0)'); h.addColorStop(0.7, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 32, 128); }), false)); })();
export function shaft(w, h, color = '#ffe0a8', opacity = 0.25) {
  const g = new THREE.PlaneGeometry(w, h); g.translate(0, -h / 2, 0);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: shaftTex(), color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.renderOrder = 5; const base = opacity; m.userData.tick = (dt, t) => { m.material.opacity = base * (0.85 + Math.sin(t * 0.7 + w) * 0.15); }; return m;
}

// ---------------------------------------------------------------- lanterns and candles
const lanternTex = (() => { const cache = {}; return (col = '#d8302a', text = '') => cache[col + text] || (cache[col + text] = canvasTex(cutout(32, 24, (x) => {
  x.fillStyle = col; x.fillRect(0, 0, 32, 24); x.fillStyle = 'rgba(255,220,140,0.55)'; x.fillRect(0, 6, 32, 12);
  x.fillStyle = 'rgba(0,0,0,0.28)'; for (let i = 0; i < 32; i += 4) x.fillRect(i, 0, 1, 24);
  x.fillStyle = '#e8c048'; x.fillRect(0, 0, 32, 2); x.fillRect(0, 22, 32, 2);
  if (text) { x.fillStyle = '#2a0a06'; x.font = '900 12px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 8, 12); x.fillText(text, 24, 12); }
}))); })();
export function lantern(o = {}) {
  const pivot = new THREE.Group(), len = o.len ?? 0.6, col = o.color || '#d8302a';
  const string = new THREE.Mesh(new THREE.BoxGeometry(0.03, len, 0.03), new THREE.MeshBasicMaterial({ color: '#2a1a10' })); string.position.y = -len / 2; pivot.add(string);
  const tex = lanternTex(col, o.text || '');
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24 * (o.s || 1), 0.24 * (o.s || 1), 0.44 * (o.s || 1), 10), new THREE.MeshLambertMaterial({ map: tex, emissive: new THREE.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: 1.1 }));
  body.position.y = -len - 0.22 * (o.s || 1); pivot.add(body);
  for (const dy of [0.25, -0.25]) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 8), new THREE.MeshLambertMaterial({ color: '#2a1a10' })); cap.position.y = body.position.y + dy * (o.s || 1); pivot.add(cap); }
  const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), new THREE.MeshBasicMaterial({ color: '#e8c048' })); tassel.position.y = body.position.y - 0.36 * (o.s || 1); pivot.add(tassel);
  const halo = glow(o.glow || '#ff9a50', 1.6 * (o.s || 1), 0.55); halo.position.y = body.position.y; pivot.add(halo);
  let light = null;
  if (o.light !== false) { light = new THREE.PointLight(o.lightColor || '#ff9a58', o.intensity ?? 5, o.range ?? 8, 1.6); light.position.y = body.position.y - 0.2; pivot.add(light); }
  const ph = Math.random() * 6, base = o.intensity ?? 5;
  pivot.userData.tick = (dt, t, wind = 1) => { pivot.rotation.z = Math.sin(t * 1.3 + ph) * 0.1 * wind; pivot.rotation.x = Math.sin(t * 0.9 + ph * 2) * 0.05 * wind; if (light) light.intensity = base * (0.92 + Math.sin(t * 9 + ph) * 0.05 + Math.sin(t * 23 + ph) * 0.03); };
  pivot.userData.light = light; pivot.userData.body = body;
  return pivot;
}
const flameCanvas = () => cutout(6, 10, (x) => { x.fillStyle = '#ff8a2a'; x.fillRect(1, 3, 4, 6); x.fillRect(2, 1, 2, 2); x.fillStyle = '#ffe070'; x.fillRect(2, 4, 2, 4); x.fillStyle = '#ffffff'; x.fillRect(2, 6, 1, 2); });
export function candle(o = {}) {
  const g = new THREE.Group(), h = o.h ?? 0.32;
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 8), new THREE.MeshLambertMaterial({ color: '#efe6d0', emissive: new THREE.Color('#5a4a30') })); stick.position.y = h / 2; g.add(stick);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.04, 10), new THREE.MeshLambertMaterial({ color: '#8a6a3a' })); dish.position.y = 0.02; g.add(dish);
  const flame = cutoutMesh(flameCanvas(), PX * 0.9, { glow: '#ffb050', shadow: false }); flame.position.y = h; g.add(flame);
  const halo = glow('#ffb860', 0.9, 0.7); halo.position.y = h + 0.12; g.add(halo);
  const light = new THREE.PointLight('#ffb060', o.intensity ?? 3, o.range ?? 6, 1.5); light.position.y = h + 0.3; g.add(light);
  const ph = Math.random() * 6, base = o.intensity ?? 3; let lit = true;
  g.userData.tick = (dt, t) => { if (!lit) return; const f = 0.85 + Math.sin(t * 11 + ph) * 0.08 + Math.sin(t * 27 + ph) * 0.06; light.intensity = base * f; flame.scale.y = 0.9 + (f - 0.85) * 1.6; };
  g.userData.snuff = (on = false) => { lit = on; flame.visible = halo.visible = on; light.intensity = on ? base : 0; light.visible = on; };
  return g;
}

// ---------------------------------------------------------------- emote marks over heads
const EMO = {
  '!': (x) => { x.fillStyle = '#fff4e0'; x.fillRect(5, 1, 6, 10); x.fillRect(5, 12, 6, 3); x.fillStyle = '#d83a2a'; x.fillRect(6, 2, 4, 8); x.fillRect(6, 13, 4, 1); },
  '?': (x) => { x.fillStyle = '#fff4e0'; x.fillRect(3, 1, 10, 4); x.fillRect(9, 4, 4, 5); x.fillRect(6, 8, 5, 3); x.fillRect(6, 12, 4, 3); x.fillStyle = '#3a6ad8'; x.fillRect(4, 2, 8, 2); x.fillRect(10, 4, 2, 4); x.fillRect(7, 8, 3, 2); x.fillRect(7, 13, 2, 1); },
  '…': (x) => { x.fillStyle = '#fff4e0'; for (const cx of [1, 6, 11]) x.fillRect(cx, 10, 4, 4); x.fillStyle = '#3a3a4a'; for (const cx of [2, 7, 12]) x.fillRect(cx, 11, 2, 2); },
  sweat: (x) => { x.fillStyle = '#e8f4ff'; x.fillRect(6, 2, 4, 2); x.fillRect(5, 4, 6, 6); x.fillRect(6, 10, 4, 2); x.fillStyle = '#5aa8e8'; x.fillRect(7, 3, 2, 2); x.fillRect(6, 5, 4, 5); x.fillStyle = '#ffffff'; x.fillRect(7, 6, 1, 2); },
  anger: (x) => { x.fillStyle = '#d82a2a'; for (const [a, b, c, d] of [[2, 2, 4, 6], [10, 2, 4, 6], [2, 9, 4, 5], [10, 9, 4, 5]]) x.fillRect(a, b, c, d); x.fillStyle = '#ff8a7a'; x.fillRect(3, 3, 2, 3); x.fillRect(11, 3, 2, 3); },
  note: (x) => { x.fillStyle = '#fff4e0'; x.fillRect(8, 1, 3, 11); x.fillRect(3, 9, 7, 6); x.fillStyle = '#3a3a5a'; x.fillRect(9, 2, 1, 10); x.fillRect(4, 10, 5, 4); x.fillRect(10, 2, 3, 2); },
  shock: (x) => { x.fillStyle = '#fff4e0'; for (const [a, b] of [[2, 4], [7, 1], [12, 4]]) x.fillRect(a, b, 2, 6); },
};
const emoTex = {}; const emoteTex = (k) => emoTex[k] || (emoTex[k] = canvasTex(cutout(16, 16, EMO[k] || EMO['!'])));
export function emote(kind) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: emoteTex(kind), transparent: true, depthTest: false, fog: false }));
  s.renderOrder = 20; s.scale.set(0.62, 0.62, 1); s.userData.age = 0; return s;
}

// ---------------------------------------------------------------- the moves
const crescentTex = (() => { let t; return () => t || (t = canvasTex(cutout(24, 64, (x) => { for (let y = 0; y < 64; y++) { const k = Math.sin((y / 63) * Math.PI), w = Math.round(2 + k * 9), off = Math.round(k * 9); x.fillStyle = '#7ab8ff'; x.fillRect(2 + off, y, w, 1); x.fillStyle = '#d8ecff'; x.fillRect(4 + off, y, Math.max(1, w - 4), 1); x.fillStyle = '#ffffff'; x.fillRect(6 + off, y, Math.max(1, w - 8), 1); } }))); })();
const palmTex = (() => { let t; return () => t || (t = canvasTex(cutout(48, 48, (x) => { const P = (c, s) => { x.fillStyle = c; x.beginPath(); x.ellipse(24, 30, 12 * s, 13 * s, 0, 0, 7); x.fill(); for (const [fx, fy, a] of [[11, 14, -0.5], [18, 8, -0.15], [26, 7, 0.1], [33, 11, 0.35], [40, 24, 1.0]]) { x.save(); x.translate(24 + (fx - 24) * s, 30 + (fy - 30) * s); x.rotate(a); x.fillRect(-3 * s, -8 * s, 6 * s, 14 * s); x.restore(); } }; P('#7a0a10', 1.05); P('#d8202a', 0.92); P('#ff7a5a', 0.6); }))); })();
const ballCanvas = () => cutout(12, 12, (x) => { x.fillStyle = '#3a2210'; x.beginPath(); x.arc(6, 6, 6, 0, 7); x.fill(); x.fillStyle = '#c87a3a'; x.beginPath(); x.arc(6, 6, 5, 0, 7); x.fill(); x.fillStyle = '#e8a860'; x.fillRect(3, 3, 3, 2); x.fillStyle = '#5a3018'; x.fillRect(1, 6, 10, 1); x.fillRect(6, 1, 1, 10); });
export const ballTex = (() => { let t; return () => t || (t = canvasTex(ballCanvas())); })();
const whirlTex = (() => { let t; return () => t || (t = canvasTex(cutout(32, 32, (x) => { x.strokeStyle = '#d8f0ff'; x.lineWidth = 2; for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(16, 16, 6 + k * 4, k * 2, k * 2 + 3.6); x.stroke(); } }))); })();
const inkTex = (() => { let t; return () => t || (t = canvasTex(cutout(16, 4, (x) => { x.fillStyle = '#0a0a10'; x.fillRect(4, 1, 12, 2); x.fillRect(14, 0, 2, 4); x.fillStyle = '#3a3a4a'; x.fillRect(0, 1, 4, 1); }))); })();
const dartTex = (() => { let t; return () => t || (t = canvasTex(cutout(16, 4, (x) => { x.fillStyle = '#c8ccd8'; x.fillRect(8, 1, 8, 2); x.fillStyle = '#ffffff'; x.fillRect(14, 1, 2, 1); x.fillStyle = '#e82a2a'; x.fillRect(0, 0, 8, 4); x.fillStyle = '#ff8a6a'; x.fillRect(1, 1, 5, 1); }))); })();
const burstTex = (() => { let t; return () => t || (t = canvasTex(cutout(32, 32, (x) => { x.fillStyle = '#ffffff'; for (let a = 0; a < 8; a++) { x.save(); x.translate(16, 16); x.rotate(a * Math.PI / 4); x.fillRect(-1, -15, 2, 10); x.restore(); } x.beginPath(); x.arc(16, 16, 4, 0, 7); x.fill(); }))); })();
const linkTex = (() => { let t; return () => t || (t = canvasTex(cutout(8, 6, (x) => { x.fillStyle = '#5a5a64'; x.fillRect(0, 0, 8, 6); x.fillStyle = '#b8b8c4'; x.fillRect(1, 1, 6, 1); x.clearRect(2, 2, 4, 2); }))); })();
const boltTex = (() => { let t; return () => t || (t = canvasTex(cutout(32, 128, (x) => { let px = 16; x.fillStyle = '#ffffff'; for (let y = 0; y < 128; y += 6) { const nx = Math.max(3, Math.min(29, px + (Math.random() - 0.5) * 12)); for (let k = 0; k < 6; k++) x.fillRect(Math.round(px + (nx - px) * k / 6), y + k, 2, 1); px = nx; if (Math.random() < 0.15) x.fillRect(px, y, 8, 1); } }))); })();

const sprite = (tex, w, h, o = {}) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, color: o.color || '#ffffff', fog: false })); s.scale.set(w, h, 1); s.renderOrder = 8; return s; };
const plane = (tex, w, h, o = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, side: THREE.DoubleSide, fog: false })); m.renderOrder = 8; return m; };

// Each effect: an object added to the scene with tick(dt) -> false when it is done.
export class Effects {
  constructor(scene) { this.scene = scene; this.list = []; this.binds = new Map(); }
  clear() { for (const e of this.list) this.scene.remove(e.o); this.list = []; for (const b of this.binds.values()) this.scene.remove(b); this.binds.clear(); }
  add(o, tick) { this.scene.add(o); this.list.push({ o, tick, t: 0 }); return o; }
  update(dt) { const cur = this.list; this.list = []; const keep = cur.filter((e) => { e.t += dt; const alive = e.tick(e.t, dt, e.o); if (!alive) { this.scene.remove(e.o); e.o.material?.dispose?.(); } return alive; }); this.list = keep.concat(this.list); }
  // a travelling shape from a to b over dur seconds (a and b are Vector3)
  travel(o, a, b, dur, opts = {}) {
    o.position.copy(a); const trail = [];
    return this.add(o, (t, dt) => {
      const k = Math.min(1, t / dur); o.position.lerpVectors(a, b, k); if (opts.grow) o.scale.multiplyScalar(1 + dt * opts.grow); if (opts.spin) o.material.rotation += dt * opts.spin;
      if (opts.trail) { o.userData.tr = (o.userData.tr || 0) + dt; if (o.userData.tr > 0.035) { o.userData.tr = 0; const g = o.clone(); g.material = o.material.clone(); g.material.opacity = 0.3; this.add(g, (tt) => { g.material.opacity = 0.3 - tt * 1.6; return tt < 0.18; }); } }
      if (k >= 1 && opts.end) opts.end(b);
      return k < 1;
    });
  }
  burst(p, color = '#ffffff', size = 2.0) { const s = sprite(burstTex(), size, size, { add: 1, color }); s.position.copy(p); return this.add(s, (t) => { const k = t / 0.35; s.scale.setScalar(size * (0.4 + k * 1.4)); s.material.opacity = 1 - k; s.material.rotation = k; return k < 1; }); }
  ring(p, color = '#ffffff', size = 3) { const s = sprite(whirlTex(), size, size, { add: 1, color }); s.position.copy(p); return this.add(s, (t) => { const k = t / 0.5; s.scale.setScalar(size * (0.5 + k * 2)); s.material.opacity = 1 - k; s.material.rotation = t * 8; return k < 1; }); }
  crescent(a, b, dur = 0.45, end) { const m = sprite(crescentTex(), 1.1, 3, { add: 1 }); return this.travel(m, a, b, dur, { trail: 1, end: (p) => { this.burst(p, '#bfe0ff', 3); end?.(p); } }); }
  palm(a, b, dur = 0.6, end) { const m = sprite(palmTex(), 1.6, 1.6, { add: 1 }); return this.travel(m, a, b, dur, { grow: 1.6, trail: 1, end: (p) => { this.burst(p, '#ff6a5a', 4); end?.(p); } }); }
  ball(a, b, dur = 0.5, end) { const m = sprite(ballTex(), 0.5, 0.5); const w = sprite(whirlTex(), 1.6, 1.6, { add: 1, color: '#cfe8ff' }); this.travel(w, a, b, dur, { spin: 14 }); return this.travel(m, a, b, dur, { spin: 20, end: (p) => { this.ring(p, '#cfe8ff', 2.6); end?.(p); } }); }
  ink(a, b, n = 3, end) { for (let i = 0; i < n; i++) { const m = sprite(inkTex(), 0.7, 0.18); const off = new THREE.Vector3(0, (i - (n - 1) / 2) * 0.35, 0); const bb = b.clone().add(off); m.material.rotation = Math.atan2(bb.y - a.y, bb.x - a.x); setTimeout(() => this.travel(m, a.clone().add(off), bb, 0.32, { end: i === n - 1 ? end : null }), i * 60); } }
  dart(a, b, dur = 0.25, end) { const m = sprite(dartTex(), 0.7, 0.18); m.material.rotation = Math.atan2(b.y - a.y, b.x - a.x); return this.travel(m, a, b, dur, { end }); }
  // a cut of sword qi left glowing on a wall, fading slowly
  mark(p) { const m = sprite(crescentTex(), 0.5, 1.6, { add: 1, color: '#9ac8ff' }); m.position.copy(p); m.material.rotation = 0.5; return this.add(m, (t) => { m.material.opacity = Math.max(0, 1 - t / 8); return t < 8; }); }
  bolt(p, h = 14) { const m = plane(boltTex(), 3.5, h, { add: 1 }); m.position.copy(p); return this.add(m, (t) => { m.visible = t < 0.08 || (t > 0.14 && t < 0.24); return t < 0.3; }); }
  // the iron chain shoots out and coils around whoever it binds; it stays until unbind(id)
  chain(a, b, id) {
    const g = new THREE.Group(), n = 16; for (let i = 0; i < n; i++) { const s = sprite(linkTex(), 0.22, 0.16); g.add(s); }
    this.binds.get(id) && this.scene.remove(this.binds.get(id)); this.binds.set(id, g); this.scene.add(g);
    const st = { t: 0 }; g.userData.tick = (dt) => { st.t += dt; const k = Math.min(1, st.t / 0.35); g.children.forEach((s, i) => { const f = i / (n - 1); if (f > k) { s.visible = false; return; } s.visible = true; const coil = Math.max(0, (f - 0.6) / 0.4); const p = new THREE.Vector3().lerpVectors(a, b, Math.min(1, f / 0.6)); if (coil > 0) { const ang = coil * Math.PI * 4 + st.t * 2; p.set(b.x + Math.cos(ang) * 0.45, b.y - 0.6 + coil * 1.2, b.z + Math.sin(ang) * 0.2); } s.position.copy(p); }); };
    return g;
  }
  unbind(id) { const g = this.binds.get(id); if (g) { this.scene.remove(g); this.binds.delete(id); } }
  tickBinds(dt) { for (const g of this.binds.values()) g.userData.tick(dt); }
}
