// Building blocks for the dioramas: pixel textures (16 texels to a unit of the world, nearest filtered), boxes and
// planks, tiled roofs with upturned eaves, lattice windows that glow, tables, benches, beds, stairs, railings,
// doors with a bolt, the eight-foot screen, signboards, cut-out plants, and a few props from the Ninja Adventure
// pack (CC0) cut out of its tile sheets.
import { THREE, PX, pxTex, rng, groundTex, paveTex, wallTex, roofTex, thatchTex, signTex, cutout, cutoutMesh } from './render.js?v=1';
export { THREE, PX, rng, cutout, cutoutMesh, signTex };

export const sh = (c, f) => { const n = parseInt(c.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; const m = (v) => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f))); return `rgb(${m(r)},${m(g)},${m(b)})`; };
const cache = new Map();
const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };
const rep = (t, x, y) => { const c = t.clone(); c.needsUpdate = true; c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(x, y); return c; };

// ---------------------------------------------------------------- textures
export const T = {
  planks: (col = '#8a5a34') => memo('pl' + col, () => { const r = rng(31); return pxTex(32, 32, (x) => { for (let i = 0; i < 4; i++) { x.fillStyle = sh(col, 0.88 + r() * 0.22); x.fillRect(0, i * 8, 32, 8); x.fillStyle = sh(col, 0.62); x.fillRect(0, i * 8 + 7, 32, 1); x.fillStyle = sh(col, 1.12); x.fillRect(0, i * 8, 32, 1); const j = Math.floor(r() * 28); x.fillStyle = sh(col, 0.62); x.fillRect(j, i * 8, 1, 7); for (let k = 0; k < 5; k++) { x.fillStyle = sh(col, 0.8); x.fillRect(Math.floor(r() * 30), i * 8 + 2 + Math.floor(r() * 4), 3, 1); } } }); }),
  boards: (col = '#6a4a2a') => memo('bo' + col, () => wallTex('boards', col)),
  plaster: (col = '#e8dcc0') => memo('pa' + col, () => wallTex('plaster', col)),
  stone: (col = '#8a8478') => memo('st' + col, () => wallTex('stone', col)),
  brick: (col = '#9a5a40') => memo('br' + col, () => wallTex('brick', col)),
  roof: (col = '#3a4a5a') => memo('ro' + col, () => roofTex(col)),
  thatch: () => memo('th', () => thatchTex()),
  mud: (col = '#5a4a3a') => memo('mu' + col, () => groundTex(col, { stones: 5, n: 120, seed: 9 })),
  grass: (col = '#5a7a3a') => memo('gr' + col, () => groundTex(col, { tufts: 12, flowers: 3, seed: 4 })),
  pave: (col = '#7a7468') => memo('pv' + col, () => paveTex(col, { seed: 3 })),
  cloth: (col) => memo('cl' + col, () => wallTex('cloth', col)),
  lattice: (glow = '#ffcf80', wood = '#3a2414') => memo('la' + glow + wood, () => pxTex(16, 16, (x) => { x.fillStyle = glow; x.fillRect(0, 0, 16, 16); x.fillStyle = wood; for (let i = 0; i < 16; i += 4) { x.fillRect(i, 0, 1, 16); x.fillRect(0, i, 16, 1); } x.fillRect(0, 15, 16, 1); x.fillRect(15, 0, 1, 16); x.fillStyle = 'rgba(255,255,255,0.18)'; x.fillRect(1, 1, 3, 3); })),
  lacquer: (col = '#7a2018') => memo('lq' + col, () => pxTex(16, 16, (x) => { x.fillStyle = col; x.fillRect(0, 0, 16, 16); x.fillStyle = sh(col, 1.25); x.fillRect(0, 0, 16, 1); x.fillRect(0, 0, 1, 16); x.fillStyle = sh(col, 0.7); x.fillRect(0, 15, 16, 1); x.fillRect(15, 0, 1, 16); })),
  rock: (col = '#6a6660') => memo('rk' + col, () => { const r = rng(41); return pxTex(32, 32, (x) => { x.fillStyle = col; x.fillRect(0, 0, 32, 32); for (let i = 0; i < 40; i++) { x.fillStyle = sh(col, r() < 0.5 ? 0.8 : 1.15); x.fillRect(Math.floor(r() * 30), Math.floor(r() * 30), 2 + Math.floor(r() * 4), 1); } for (let i = 0; i < 8; i++) { x.fillStyle = sh(col, 0.6); x.fillRect(Math.floor(r() * 30), Math.floor(r() * 30), 1, 3); } }); }),
  screen: () => memo('scr', () => pxTex(64, 64, (x) => {
    // an ink landscape on pale paper: mountains, a river, a boat, a moon
    x.fillStyle = '#efe6cc'; x.fillRect(0, 0, 64, 64); x.fillStyle = '#e4d8b8'; for (let i = 0; i < 64; i += 3) x.fillRect(0, i, 64, 1);
    const hill = (cx, w, h, c) => { x.fillStyle = c; for (let y = 0; y < h; y++) { const hw = Math.round(w * (y / h)); x.fillRect(cx - hw, 44 - h + y, hw * 2 + 1, 1); } };
    hill(14, 14, 26, '#a8a490'); hill(40, 18, 30, '#8a8878'); hill(54, 10, 18, '#6a6a5e'); hill(26, 9, 14, '#4a4a44');
    x.fillStyle = '#c8c4b0'; x.fillRect(0, 44, 64, 3); x.fillStyle = '#d8d4c4'; x.fillRect(0, 47, 64, 17);
    x.fillStyle = '#3a3a36'; x.fillRect(30, 52, 8, 1); x.fillRect(31, 51, 6, 1); x.fillRect(34, 46, 1, 5);
    x.fillStyle = '#b84a3a'; x.fillRect(52, 6, 5, 5); x.fillStyle = '#efe6cc'; x.fillRect(53, 7, 3, 3); x.fillStyle = '#b84a3a'; x.fillRect(54, 8, 1, 1);
    x.fillStyle = '#2a2a2a'; for (const [a, b] of [[6, 4], [6, 8], [6, 12], [6, 16]]) x.fillRect(a, b, 2, 3);
  })),
};

// ---------------------------------------------------------------- geometry helpers
export const at = (o, p) => { o.position.set(...p); return o; };
export function box(w, h, d, mat, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = o.cast !== false; m.receiveShadow = o.recv !== false;
  if (o.at) m.position.set(...o.at); return m;
}
export const lam = (o) => new THREE.MeshLambertMaterial(o);
export const std = (o) => new THREE.MeshStandardMaterial({ roughness: 0.9, metalness: 0, ...o });
export function texMat(tex, w, h, o = {}) { return (o.wet ? std : lam)({ map: rep(tex, w, h), ...(o.wet ? { roughness: o.wet } : {}), ...(o.color ? { color: o.color } : {}), ...(o.emissive ? { emissive: new THREE.Color(o.emissive) } : {}) }); }
// a flat floor of size w x d at height y, centred at (x, z)
export function floor(tex, x, z, w, d, y = 0, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), texMat(tex, w / (o.unit || 2), d / (o.unit || 2), o)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true; return m;
}
// an upright wall facing +z (or rotated), textured
export function wall(tex, x, y, z, w, h, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), texMat(tex, w / (o.unit || 2), h / (o.unit || 2), o)); m.position.set(x, y + h / 2, z); if (o.ry) m.rotation.y = o.ry; m.receiveShadow = true; m.castShadow = !!o.cast; if (o.side) m.material.side = THREE.DoubleSide; return m;
}
// a tiled roof: two slopes meeting at a ridge along x, eaves overhanging, the ridge ends and corners curling up
export function roof(w, d, rise, col = '#3a4a5a', o = {}) {
  const g = new THREE.Group(), over = o.over ?? 0.8, slope = Math.hypot(d / 2 + over, rise), ang = Math.atan2(rise, d / 2 + over);
  const tex = rep(T.roof(col), (w + 2 * over) / 1.4, slope / 1.4), mat = lam({ map: tex, side: THREE.DoubleSide });
  for (const sgn of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w + 2 * over, slope), mat); p.rotation.order = 'YXZ'; p.rotation.x = sgn > 0 ? -(Math.PI / 2 - ang) : Math.PI + (Math.PI / 2 - ang); p.position.set(0, rise / 2, sgn * (d / 2 + over) / 2); p.castShadow = p.receiveShadow = true; g.add(p); }
  const dark = lam({ color: sh(col, 0.55) });
  const ridge = box(w + 2 * over + 0.4, 0.3, 0.36, dark); ridge.position.y = rise + 0.08; g.add(ridge);
  for (const sx of [-1, 1]) {
    const tip = box(0.36, 0.7, 0.36, dark); tip.position.set(sx * (w / 2 + over + 0.3), rise + 0.32, 0); tip.rotation.z = -sx * 0.55; g.add(tip);
    for (const sz of [-1, 1]) { const c = box(0.9, 0.18, 0.22, dark); c.position.set(sx * (w / 2 + over - 0.1), 0.18, sz * (d / 2 + over - 0.05)); c.rotation.z = sx * 0.45; g.add(c); }
  }
  const eave = box(w + 2 * over, 0.12, 0.16, dark); for (const sz of [-1, 1]) { const e = eave.clone(); e.position.set(0, 0, sz * (d / 2 + over)); g.add(e); }
  // gable ends
  const gs = new THREE.Shape(); gs.moveTo(-d / 2, 0); gs.lineTo(d / 2, 0); gs.lineTo(0, rise); gs.lineTo(-d / 2, 0);
  for (const sx of [-w / 2, w / 2]) { const gm = new THREE.Mesh(new THREE.ShapeGeometry(gs), lam({ color: o.gable || '#4a3020', side: THREE.DoubleSide })); gm.rotation.y = Math.PI / 2; gm.position.x = sx; g.add(gm); }
  return g;
}
export function lattice(w, h, glow = '#ffcf80', o = {}) {
  const t = rep(T.lattice(glow, o.wood), w / 0.5, h / 0.5); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam({ map: t, emissive: new THREE.Color(o.emit ?? '#ffffff'), emissiveMap: t, emissiveIntensity: o.k ?? 0.55 }));
  const fr = lam({ color: '#2a1a10' }); const g = new THREE.Group(); g.add(m);
  for (const [fx, fy, fw, fh] of [[0, h / 2, w + 0.12, 0.08], [0, -h / 2, w + 0.12, 0.08], [-w / 2, 0, 0.08, h], [w / 2, 0, 0.08, h]]) { const b = box(fw, fh, 0.08, fr, { cast: false }); b.position.set(fx, fy, 0.02); g.add(b); }
  return g;
}
export function table(w = 1.8, d = 1.1, h = 1.0, col = '#6a3a1e') {
  const g = new THREE.Group(), m = lam({ map: T.planks(col) });
  const top = box(w, 0.1, d, m); top.position.y = h; g.add(top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = box(0.1, h, 0.1, lam({ color: sh(col, 0.7) })); l.position.set(sx * (w / 2 - 0.12), h / 2, sz * (d / 2 - 0.12)); g.add(l); }
  return g;
}
export function bench(w = 1.8, h = 0.55, col = '#5a3418') { const g = new THREE.Group(); const top = box(w, 0.08, 0.36, lam({ map: T.planks(col) })); top.position.y = h; g.add(top); for (const sx of [-1, 1]) { const l = box(0.08, h, 0.3, lam({ color: sh(col, 0.7) })); l.position.set(sx * (w / 2 - 0.15), h / 2, 0); g.add(l); } return g; }
export function stool(h = 0.55, col = '#5a3418') { const g = new THREE.Group(); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 10), lam({ color: col })); top.position.y = h; top.castShadow = true; g.add(top); const l = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, h, 8), lam({ color: sh(col, 0.7) })); l.position.y = h / 2; l.castShadow = true; g.add(l); return g; }
export function pillar(h, r = 0.18, col = '#8a2a1e') { const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, 10), lam({ color: col })); p.position.y = h / 2; p.castShadow = true; p.receiveShadow = true; return p; }
export function railing(len, h = 0.9, col = '#5a3418', o = {}) {
  const g = new THREE.Group(), m = lam({ color: col });
  for (let x = -len / 2; x <= len / 2 + 0.01; x += o.gap || 1.1) { const p = box(0.1, h, 0.1, m); p.position.set(x, h / 2, 0); g.add(p); }
  for (const y of [h - 0.05, h * 0.45]) { const b = box(len, 0.07, 0.07, m); b.position.y = y; g.add(b); }
  return g;
}
export function stairs(w, n, rise, run, col = '#6a4020') { const g = new THREE.Group(), m = lam({ map: T.planks(col) }); for (let i = 0; i < n; i++) { const s = box(w, rise * (i + 1), run, m); s.position.set(0, rise * (i + 1) / 2, -i * run); g.add(s); } return g; }
// the eight-foot screen: four painted panels in a zigzag
export function screen(o = {}) {
  const g = new THREE.Group(), pw = o.pw ?? 1.05, h = o.h ?? 2.7, t = T.screen(), fr = lam({ color: '#3a1a10' });
  for (let i = 0; i < 4; i++) {
    const tex = t.clone(); tex.needsUpdate = true; tex.repeat.set(0.25, 1); tex.offset.set(i * 0.25, 0);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(pw, h - 0.3), lam({ map: tex, side: THREE.DoubleSide })); p.castShadow = true; p.receiveShadow = true;
    const pg = new THREE.Group(); pg.add(p); p.position.set(pw / 2, h / 2 + 0.1, 0);
    for (const [fx, fy, fw, fh] of [[pw / 2, h - 0.03, pw, 0.1], [pw / 2, 0.22, pw, 0.1], [0, h / 2, 0.08, h], [pw, h / 2, 0.08, h]]) { const b = box(fw, fh, 0.08, fr); b.position.set(fx, fy, 0); pg.add(b); }
    pg.position.set(-2 * pw + i * pw * 0.92, 0, (i % 2) * 0.32); pg.rotation.y = (i % 2 ? 0.32 : -0.32);
    g.add(pg);
  }
  return g;
}
export function bed(o = {}) {
  const g = new THREE.Group(), w = o.w ?? 2.4, d = o.d ?? 1.3;
  const frame = box(w, 0.5, d, lam({ map: T.planks('#5a2e18') })); frame.position.y = 0.45; g.add(frame);
  const quilt = box(w - 0.5, 0.18, d - 0.12, lam({ map: T.cloth(o.quilt || '#7a3a4a') })); quilt.position.set(0.2, 0.78, 0); g.add(quilt);
  const pillow = box(0.45, 0.16, d - 0.4, lam({ color: '#e8dcc0' })); pillow.position.set(-w / 2 + 0.35, 0.8, 0); g.add(pillow);
  const back = box(w, 1.1, 0.1, lam({ map: T.planks('#4a2412') })); back.position.set(0, 0.85, -d / 2); g.add(back);
  for (const sx of [-1, 1]) { const p = box(0.12, 2.2, 0.12, lam({ color: '#3a1a0a' })); p.position.set(sx * w / 2, 1.1, -d / 2); g.add(p); }
  const canopy = box(w + 0.1, 0.12, 0.5, lam({ map: T.cloth('#8a4a3a') })); canopy.position.set(0, 2.2, -d / 2 + 0.25); g.add(canopy);
  return g;
}
// a door in a wall: a dark leaf that can swing open (pivot on its left edge) and a bolt bar on its inside face
export function door(w = 1.3, h = 2.4, col = '#5a2e16') {
  const g = new THREE.Group(), pivot = new THREE.Group(); pivot.position.x = -w / 2; g.add(pivot);
  const leaf = box(w, h, 0.1, lam({ map: rep(T.boards(col), w / 1.2, h / 1.2) })); leaf.position.set(w / 2, h / 2, 0); pivot.add(leaf);
  const knob = box(0.08, 0.08, 0.06, lam({ color: '#c8a040' })); knob.position.set(w - 0.2, h / 2, 0.08); pivot.add(knob);
  const bolt = box(0.5, 0.08, 0.08, lam({ color: '#4a4a52' })); bolt.position.set(w - 0.15, h / 2 + 0.2, -0.1); pivot.add(bolt);
  const frm = lam({ color: '#2a1608' }); for (const [fx, fy, fw, fh] of [[0, h + 0.06, w + 0.24, 0.14], [-w / 2 - 0.07, h / 2, 0.14, h], [w / 2 + 0.07, h / 2, 0.14, h]]) { const b = box(fw, fh, 0.18, frm); b.position.set(fx, fy, 0); g.add(b); }
  g.userData.open = (a) => { pivot.rotation.y = a; };
  g.userData.leaf = leaf;
  return g;
}
export function sign(text, w, h, o = {}) { const t = signTex(text, o.bg || '#2a1a10', o.fg || '#f4d878', Math.max(64, text.length * 40 + 24), 36); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam({ map: t, emissive: new THREE.Color(o.emit || '#3a2a1a'), emissiveMap: t })); m.castShadow = true; return m; }
export function jar(r = 0.3, h = 0.6, col = '#6a4a3a') { const pts = []; for (let i = 0; i <= 8; i++) { const t = i / 8; pts.push(new THREE.Vector2(r * (0.55 + Math.sin(t * Math.PI) * 0.5) * (t > 0.9 ? 0.7 : 1), t * h)); } const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 10), lam({ color: col })); m.castShadow = true; m.receiveShadow = true; return m; }
export function barrel(r = 0.4, h = 0.9) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 12), lam({ map: rep(T.boards('#7a5030'), 2, 1) })); m.position.y = h / 2; m.castShadow = true; m.receiveShadow = true; const g = new THREE.Group(); g.add(m); for (const y of [0.15, h - 0.15]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.06, 12), lam({ color: '#3a3a3a' })); b.position.y = y; g.add(b); } return g; }
// cut-out trees, bamboo, reeds
export function tree(kind = 'pine', seed = 1, s = 1) {
  const r = rng(seed);
  const c = kind === 'pine' ? cutout(56, 96, (x) => { x.fillStyle = '#3a2618'; x.fillRect(26, 70, 5, 26); for (let i = 0; i < 6; i++) { const y = 8 + i * 11, w = 10 + i * 4.5; x.fillStyle = '#1a3024'; x.beginPath(); x.moveTo(28, y - 6); x.lineTo(28 - w, y + 12); x.lineTo(28 + w, y + 12); x.fill(); x.fillStyle = '#2a4a34'; x.beginPath(); x.moveTo(28, y - 4); x.lineTo(28 - w + 3, y + 10); x.lineTo(30, y + 10); x.fill(); x.fillStyle = '#3e6a46'; x.fillRect(22 - i, y + 4, 3, 1); } })
    : kind === 'bamboo' ? cutout(40, 110, (x) => { for (let k = 0; k < 4; k++) { const bx = 6 + k * 9 + Math.floor(r() * 3); x.fillStyle = '#4a7a3a'; x.fillRect(bx, 6 + k * 4, 3, 104); x.fillStyle = '#7aaa5a'; x.fillRect(bx, 6 + k * 4, 1, 104); for (let y = 14; y < 110; y += 13) { x.fillStyle = '#2a4a2a'; x.fillRect(bx - 1, y, 5, 1); } for (let j = 0; j < 6; j++) { const ly = 8 + Math.floor(r() * 60); x.fillStyle = '#3a6a2e'; x.fillRect(bx + 3, ly, 7, 2); x.fillRect(bx - 6, ly + 5, 6, 2); } } })
    : kind === 'reeds' ? cutout(30, 26, (x) => { for (let i = 0; i < 16; i++) { const gx = Math.floor(r() * 28), hh = 8 + Math.floor(r() * 16); x.fillStyle = i % 3 ? '#6a7a4a' : '#9aa86a'; x.fillRect(gx, 26 - hh, 1, hh); if (i % 4 === 0) { x.fillStyle = '#8a6a3a'; x.fillRect(gx - 1, 26 - hh, 3, 3); } } })
    : kind === 'willow' ? cutout(72, 88, (x) => { x.fillStyle = '#3a2a1c'; x.fillRect(32, 40, 7, 48); const blob = (cx, cy, rad, c) => { x.fillStyle = c; for (let yy = -rad; yy <= rad; yy++) { const w = Math.round(Math.sqrt(rad * rad - yy * yy)); x.fillRect(cx - w, cy + yy, w * 2, 1); } }; for (const [cx, cy, rr] of [[36, 26, 18], [22, 32, 12], [50, 32, 12]]) blob(cx, cy, rr, '#3a6a32'); for (const [cx, cy, rr] of [[34, 22, 12], [24, 28, 7], [48, 28, 7]]) blob(cx, cy, rr, '#5a8a42'); for (let i = 0; i < 16; i++) { const sx = 10 + i * 3.4; x.fillStyle = i % 2 ? '#5a8a42' : '#3a6a32'; x.fillRect(sx, 30, 1, 20 + Math.floor(r() * 22)); } })
    : cutout(72, 88, (x) => { x.fillStyle = '#4a3222'; x.fillRect(32, 46, 7, 42); const blob = (cx, cy, rad, c) => { x.fillStyle = c; for (let yy = -rad; yy <= rad; yy++) { const w = Math.round(Math.sqrt(rad * rad - yy * yy)); x.fillRect(cx - w, cy + yy, w * 2, 1); } }; const P = [[36, 30, 18], [22, 38, 13], [50, 38, 13], [30, 20, 12], [44, 22, 12]]; for (const [cx, cy, rr] of P) blob(cx, cy + 2, rr, '#2e5a2a'); for (const [cx, cy, rr] of P) blob(cx - 2, cy - 1, rr - 3, '#4a7a36'); for (const [cx, cy, rr] of P) blob(cx - 4, cy - 4, Math.max(2, rr - 9), '#7aa84a'); });
  const m = cutoutMesh(c, PX * s); return m;
}
// the Ninja Adventure (CC0) tile sheets: cut a piece out as a standing cut-out
const sheets = {};
export function loadSheet(name) { if (sheets[name]) return sheets[name]; const img = new Image(); const p = new Promise((res) => { img.onload = () => res(img); img.onerror = () => res(null); }); img.src = 'assets/tiles/' + name + '.png'; sheets[name] = p; return p; }
export function ninja(group, name, sx, sy, sw, sh2, pos, scale = PX * 1.6, o = {}) {
  loadSheet(name).then((img) => { if (!img) return; const c = cutout(sw, sh2, (x) => x.drawImage(img, sx, sy, sw, sh2, 0, 0, sw, sh2)); const m = cutoutMesh(c, scale, o); m.position.set(...pos); if (o.ry) m.rotation.y = o.ry; if (o.rx != null) m.rotation.x = o.rx; group.add(m); });
}
