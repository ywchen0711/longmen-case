// The sets of the story. Each builder fills a Diorama (scene.js): geometry, lights, marks, floor, triggers.
// Coordinates: x across the screen, z toward the camera, y up; a person is about three units tall.
import { THREE, PX, rng, cutout, cutoutMesh, T, sh, at, box, lam, std, texMat, floor, wall, roof, lattice, table, bench, stool, pillar, railing, stairs, screen, bed, door, sign, jar, barrel, tree, ninja } from './kit.js?v=2';
import { waterMaterial, mist, shaft, lantern, candle, glow } from './fx.js?v=2';

const V3 = THREE.Vector3;
// the river: a flowing plane, with the lights that shine on it reflected
function river(D, w, d, at, o = {}) {
  const mat = waterMaterial(o); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.position.set(...at); D.add(m); D.water = mat;
  const tmp = new V3();
  D.tick(() => { if (!D.reflect.length) return; mat.setLights(D.reflect.map((r) => ({ pos: r.obj.getWorldPosition(tmp).clone(), color: r.color, k: r.k }))); });
  return m;
}
const reflectOn = (D, obj, color = '#ffa860', k = 0.7) => D.reflect.push({ obj, color, k });
// a house with walls, a door, glowing windows and a tiled roof (small, for the map and far shores)
function cottage(D, x, z, w, d, h, o = {}) {
  const g = new THREE.Group(); g.position.set(x, o.y || 0, z); D.add(g);
  const walls = box(w, h, d, texMat(o.wall === 'boards' ? T.boards(o.col || '#6a4a2a') : T.plaster(o.col || '#e0d4b8'), w / 2, h / 2)); walls.position.y = h / 2; g.add(walls);
  const r = roof(w, d, o.rise ?? h * 0.55, o.roof || '#3a4a5a', { over: o.over ?? 0.5 }); r.position.y = h; g.add(r);
  if (o.glow) for (const sx of o.wins || [-w / 4, w / 4]) { const wi = lattice(w * 0.18, h * 0.32, o.glow, { k: 0.9 }); wi.position.set(sx, h * 0.55, d / 2 + 0.02); g.add(wi); }
  return g;
}

// ================================================================ 序章: the map of the Longmen region, a table-top diorama
function map(D) {
  D.cam0 = { x: 0, y: 0, z: 2, d: 54, yaw: 0, pitch: 52, fov: 30 };
  const R = rng(3);
  // the table under the map, and the map ground
  D.add(box(70, 1.2, 50, lam({ map: T.planks('#4a2a16') })), [0, -0.62, 0]);
  const gt = T.grass('#6a8a44').clone(); gt.needsUpdate = true; gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(32, 22);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(64, 44), lam({ map: gt })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; D.add(ground);
  // the frame of the map
  for (const [x, z, w, d] of [[0, -22.4, 65, 0.8], [0, 22.4, 65, 0.8], [-32.4, 0, 0.8, 45.6], [32.4, 0, 0.8, 45.6]]) D.add(box(w, 0.5, d, lam({ map: T.planks('#7a4a22') })), [x, 0.15, z]);
  // the river: a ribbon along a curve
  const pts = [[30, -21], [22, -17], [14, -10], [6, -3], [1, 1], [-4, 6], [-10, 11], [-20, 15], [-31, 20]].map(([x, z]) => new V3(x, 0.05, z));
  const curve = new THREE.CatmullRomCurve3(pts), N = 120, pos = [], idx = [];
  for (let i = 0; i <= N; i++) { const p = curve.getPoint(i / N), t = curve.getTangent(i / N), nx = -t.z, nz = t.x, w = 1.3 + Math.sin(i * 0.3) * 0.2; pos.push(p.x + nx * w, 0.06, p.z + nz * w, p.x - nx * w, 0.06, p.z - nz * w); if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); rg.setIndex(idx);
  const wm = waterMaterial({ deep: '#1a4a6a', shallow: '#3a7a9a', hi: '#bfe0f0', flow: [-0.5, 0.4] }); D.water = wm; wm.side = THREE.DoubleSide; const rv = new THREE.Mesh(rg, wm); D.add(rv);
  // banks: sandy strips along the river
  const bank = []; for (let i = 0; i <= N; i += 2) { const p = curve.getPoint(i / N); bank.push(p); }
  for (const p of bank) { const s = box(1.0, 0.04, 1.0, lam({ color: '#b8a878' }), { cast: false }); s.position.set(p.x + (R() - 0.5) * 2.6, 0.02, p.z + (R() - 0.5) * 2.6); D.add(s); }
  // roads to the crossroads at 聽雨樓
  const road = (a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7, L), lam({ map: T.mud('#a88a5a') })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.atan2(dx, dz); m.position.set((a[0] + b[0]) / 2, 0.03, (a[1] + b[1]) / 2); m.receiveShadow = true; D.add(m); };
  const C0 = [2.6, 3.2];
  for (const p of [[-10, -4], [10, -2.4], [-14, -9], [12.5, 7.5], [-6.5, 9.5], [16, -11], [24, 12], [-26, -6]]) road(C0, p);
  // mountains: faceted cones, snow on the tallest
  const mount = (x, z, r, h, col = '#6a7a5a', snow) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), lam({ map: T.rock(col), flatShading: true })); m.position.set(x, h / 2, z); m.rotation.y = R() * 3; m.castShadow = m.receiveShadow = true; D.add(m); if (snow) { const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.32, h * 0.32, 7), lam({ color: '#eef2f6', flatShading: true })); c.position.set(x, h * 0.84, z); c.rotation.y = m.rotation.y; D.add(c); } };
  for (const [x, z, r, h, c, s] of [[-16, -13, 5, 7, '#6a7a5a', 1], [-22, -16, 6, 9, '#5a6a5a', 1], [-9, -17, 4, 5, '#6a7a52'], [-27, -6, 4, 5], [17, -15, 4.2, 8, '#6a5a50', 1], [24, -12, 5, 6, '#5a5a50'], [9, -18, 3.5, 4.5], [27, -2, 3.5, 4], [16, 10, 4, 4.5, '#5a6a42'], [22, 7, 3.6, 3.8, '#5a6a42'], [12, 13, 3, 3, '#5a6a42'], [-26, 10, 3, 3.5], [27, 17, 4, 4]]) mount(x, z, r, h, c, s);
  // forests
  for (let i = 0; i < 120; i++) { const x = (R() - 0.5) * 60, z = (R() - 0.5) * 40; if (Math.hypot(x - 2.6, z - 3) < 4 || Math.abs(x) < 3 && Math.abs(z) < 3) continue; const p = curve.getPoint(0); let near = false; for (const b of bank) if (Math.hypot(b.x - x, b.z - z) < 2.4) { near = true; break; } if (near) continue; const t = tree(R() < 0.7 ? 'pine' : 'broad', Math.floor(R() * 999), 0.32 + R() * 0.12); t.position.set(x, 0, z); t.rotation.x = -0.25; D.add(t); }
  // the seven places, each a little diorama with a signboard
  const label = (text, x, z, y) => { const s = sign(text, text.length * 1.1 + 0.6, 1.1, { emit: '#5a4a2a' }); s.position.set(x, y, z); s.rotation.x = -0.5; D.add(s); return s; };
  const P = {};
  // 聽雨樓 at the crossroads by the bridge
  { const g = cottage(D, 2.6, 2.4, 3, 2, 1.2, { roof: '#2a3a4a', glow: '#ffcf80', col: '#d8c8a8' }); const up = cottage(D, 2.6, 2.3, 2.4, 1.6, 0.9, { y: 1.75, roof: '#2a3a4a', glow: '#ffcf80', col: '#d8c8a8' }); const l = lantern({ s: 0.6, len: 0.2, intensity: 3, range: 6 }); l.position.set(4, 1.2, 3.5); D.add(l); P.tingyu = [2.6, 2.4];
    const br = box(3.6, 0.12, 0.6, lam({ map: T.planks('#7a5a34') })); br.position.set(0.4, 0.3, 0.6); br.rotation.y = 0.8; D.add(br); label('聽雨樓', 2.6, 2.4, 4.8); }
  // 盟主府: a walled compound with a great hall
  { const x = -10, z = -4.5; for (const [dx, dz, w, d] of [[0, -2.6, 7, 0.3], [0, 2.6, 7, 0.3], [-3.5, 0, 0.3, 5.5], [3.5, 0, 0.3, 5.5]]) D.add(box(w, 0.8, d, lam({ map: T.plaster('#d8c8b0') })), [x + dx, 0.4, z + dz]); cottage(D, x, z - 0.6, 4, 2.2, 1.4, { roof: '#7a3a2a', col: '#c83a2a', wall: 'boards', rise: 1 }); cottage(D, x - 2, z + 1.2, 1.6, 1.2, 0.8, { roof: '#7a3a2a' }); cottage(D, x + 2, z + 1.2, 1.6, 1.2, 0.8, { roof: '#7a3a2a' }); P.mengzhu = [x, z]; label('盟主府', x, z, 4.2); }
  // 龍門刀莊: a forge with a glowing furnace and smoke
  { const x = 10, z = -2.4; cottage(D, x, z, 3.4, 2.2, 1.2, { roof: '#3a3a3a', wall: 'boards', col: '#5a3a22', glow: '#ff8a40' }); const ch = box(0.5, 2.2, 0.5, lam({ map: T.brick() })); ch.position.set(x + 1.2, 1.6, z - 0.5); D.add(ch); const f = glow('#ff7a30', 1.8, 0.8); f.position.set(x + 1.2, 2.9, z - 0.5); D.add(f); const pl = new THREE.PointLight('#ff7a30', 4, 6, 1.6); pl.position.set(x, 1.6, z + 1.6); D.add(pl);
    const smoke = []; for (let i = 0; i < 6; i++) { const s = glow('#9a948a', 0.8, 0.35); s.material.blending = THREE.NormalBlending; D.add(s); smoke.push(s); } D.tick((dt, t) => smoke.forEach((s, i) => { const k = (t * 0.25 + i / 6) % 1; s.position.set(x + 1.2 + k * 1.6, 3 + k * 3.5, z - 0.5 - k * 0.6); s.scale.setScalar(0.6 + k * 2); s.material.opacity = 0.4 * (1 - k); }));
    for (let i = 0; i < 3; i++) cottage(D, x - 2.6 + i * 0.4, z + 2 + i * 0.3, 1.2, 1, 0.7, { roof: '#5a4a3a' }); P.daozhuang = [x, z]; label('龍門刀莊', x, z, 4.4); }
  // 千佛寺: a pagoda on the mountain
  { const x = -14.2, z = -9.6, y0 = 2.2; const base = box(3, 2.2, 2.4, lam({ map: T.rock('#6a7a5a') })); base.position.set(x, 1.1, z); D.add(base); for (let i = 0; i < 4; i++) { const s = 1.6 - i * 0.28; const b = box(s, 0.55, s, lam({ color: '#c8a050' })); b.position.set(x, y0 + 0.3 + i * 0.75, z); D.add(b); const r = roof(s, s, 0.3, '#7a4a2a', { over: 0.25 }); r.position.set(x, y0 + 0.57 + i * 0.75, z); D.add(r); } P.qianfo = [x, z]; label('千佛寺', x, z, 6.6); }
  // 黑風寨: a palisade camp in the hills
  { const x = 12.5, z = 7.6; for (let a = 0; a < 6.28; a += 0.32) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.9, 5), lam({ color: '#5a3a20' })); p.position.set(x + Math.cos(a) * 2, 0.45, z + Math.sin(a) * 1.5); p.castShadow = true; D.add(p); } cottage(D, x, z - 0.2, 1.8, 1.2, 0.8, { thatch: 1, roof: '#6a5a3a', wall: 'boards' }); const fl = cutoutMesh(cutout(10, 20, (x2) => { x2.fillStyle = '#3a2a1a'; x2.fillRect(0, 0, 1, 20); x2.fillStyle = '#1a1a1a'; x2.fillRect(1, 1, 9, 6); x2.fillStyle = '#e8e0d0'; x2.fillRect(4, 3, 3, 2); }), PX * 1.2); fl.position.set(x + 1.2, 0.9, z); D.add(fl); P.heifeng = [x, z]; label('黑風寨', x, z, 3.4); }
  // 寒江閣: a pavilion over the river
  { const x = -6.6, z = 9.6; const deck = box(2.6, 0.2, 2.2, lam({ map: T.planks('#8a6a4a') })); deck.position.set(x, 0.3, z); D.add(deck); for (const [dx, dz] of [[-1, -0.8], [1, -0.8], [-1, 0.8], [1, 0.8]]) { const p = pillar(1.2, 0.07, '#e8e8f0'); p.position.set(x + dx, 0.4, z + dz); D.add(p); } const r = roof(2, 1.6, 0.6, '#3a5a6a', { over: 0.35 }); r.position.set(x, 1.6, z); D.add(r); P.hanjiang = [x, z]; label('寒江閣', x, z, 3.8); }
  // 暴龍崖: a black cliff with a red banner
  { const x = 17.4, z = -10.8; const c = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.8, 6, 7), lam({ map: T.rock('#6a5a5e'), flatShading: true })); c.position.set(x, 3, z); c.castShadow = true; D.add(c); const fl = cutoutMesh(cutout(14, 30, (x2) => { x2.fillStyle = '#2a1a1a'; x2.fillRect(0, 0, 1, 30); x2.fillStyle = '#b8202a'; x2.fillRect(1, 1, 13, 14); x2.fillStyle = '#e8c040'; x2.fillRect(5, 5, 5, 6); }), PX * 1.3); fl.position.set(x, 6, z); D.add(fl); D.tick((dt, t) => { fl.rotation.y = Math.sin(t * 2) * 0.2; }); P.baolong = [x, z]; label('暴龍崖', x, z, 9); }
  D.places = P;
  // clouds drifting over the table
  for (let i = 0; i < 4; i++) { const m = mist(30, 6, '#f0f0f4', 0.35); m.position.set(-20 + i * 14, 6 + i, -6 + i * 5); m.rotation.x = -1.2; D.add(m); }
  D.tick((dt, t) => { D.group.children.forEach(() => {}); });
}
map.mood = 'golden';

// ================================================================ 第一回: the ferry on the night river
function ferry(D) {
  D.cam0 = { x: 0.4, y: 1.4, z: 0, d: 15, yaw: 8, pitch: 14, fov: 30 };
  D.rain = 1; D.lightning = 1;
  river(D, 140, 90, [0, 0, -20], { deep: '#081420', shallow: '#1a3448', hi: '#6a8ca8', flow: [0.7, 0.2], rain: 1 });
  // the boat: hull, deck, a curved mat canopy, a lantern on a pole at the bow, the steering oar
  const B = new THREE.Group(); D.add(B);
  const hull = new THREE.Shape(); hull.moveTo(-4.4, 0.7); hull.lineTo(4.6, 0.7); hull.lineTo(3.6, -0.1); hull.lineTo(-3.4, -0.1); hull.lineTo(-4.4, 0.7);
  const hg = new THREE.ExtrudeGeometry(hull, { depth: 2.6, bevelEnabled: false }); hg.translate(0, 0, -1.3);
  const hm = new THREE.Mesh(hg, lam({ map: (() => { const t = T.boards('#5a3a20').clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.5, 0.5); return t; })() })); hm.material.emissive = new THREE.Color('#24180e'); hm.castShadow = hm.receiveShadow = true; B.add(hm);
  const deck = floor(T.planks('#7a5a38'), 0.1, 0, 8.6, 2.5, 0.71); B.add(deck);
  for (const sz of [-1.32, 1.32]) { const g = box(9, 0.22, 0.12, lam({ color: '#3a2412' })); g.position.set(0.1, 0.8, sz); B.add(g); }
  const can = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 3.2, 14, 1, true, -Math.PI / 2, Math.PI), lam({ map: (() => { const t = T.thatch().clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t; })(), side: THREE.DoubleSide }));
  can.rotation.z = Math.PI / 2; can.rotation.y = 0; can.position.set(-1.2, 1.9, 0); can.castShadow = true; can.receiveShadow = true; B.add(can);
  for (const sx of [-2.75, 0.35]) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.06, 4, 14, Math.PI), lam({ color: '#3a2412' })); r.rotation.y = Math.PI / 2; r.position.set(sx, 1.9, 0); B.add(r); }
  const pole = box(0.1, 2.6, 0.1, lam({ color: '#3a2412' })); pole.position.set(3.7, 2, -0.9); B.add(pole);
  const lan = lantern({ len: 0.3, intensity: 7, range: 11, text: '渡' }); lan.position.set(3.7, 3.2, -0.6); B.add(lan); D.ticks.push(lan.userData.tick); reflectOn(D, lan.userData.body, '#ff9a50', 1.1);
  const lan2 = lantern({ len: 0.2, s: 0.8, intensity: 4, range: 7 }); lan2.position.set(-1.2, 3.2, 1.0); B.add(lan2); D.ticks.push(lan2.userData.tick); reflectOn(D, lan2.userData.body, '#ff9a50', 0.8);
  const oar = box(3, 0.08, 0.12, lam({ color: '#5a3a20' })); oar.position.set(-5, 0.4, 0.6); oar.rotation.z = 0.3; B.add(oar);
  // luggage: a trunk and bundles
  B.add(at(box(0.8, 0.5, 0.6, lam({ map: T.lacquer('#4a2a1a') })), [-2.4, 0.96, -0.7])); B.add(at(box(0.6, 0.35, 0.5, lam({ map: T.cloth('#6a6a8a') })), [-1.9, 0.9, -0.85]));
  const bob = (t) => Math.sin(t * 1.3) * 0.08 + Math.sin(t * 0.7) * 0.04;
  D.tick((dt, t) => { B.position.y = bob(t); B.rotation.z = Math.sin(t * 1.1) * 0.018; B.rotation.x = Math.sin(t * 0.8) * 0.01; });
  D.floorAt = (x, z) => (Math.abs(x) < 4.6 && Math.abs(z) < 1.4 ? 0.71 + bob(D.t || 0) : 0);
  // the far shore: a dark bank, trees, 聽雨樓 with its lights, and the bridge
  D.add(box(140, 1.2, 8, lam({ map: T.mud('#2a2a28') })), [0, 0.3, -36]);
  for (let i = 0; i < 26; i++) { const t = tree(i % 3 ? 'pine' : 'willow', i * 7, 1.6); t.position.set(-60 + i * 4.6 + (i % 2), 0.8, -37 - (i % 3)); D.add(t); }
  const far = new THREE.Group(); far.position.set(8, 0.8, -35); D.add(far);
  { const lo = box(9, 3, 4, lam({ map: T.plaster('#3a3632') })); lo.position.set(0, 1.5, 0); far.add(lo); const hi = box(8, 2.4, 3.4, lam({ map: T.plaster('#3a3632') })); hi.position.set(0, 4.2, 0); far.add(hi); const r1 = roof(9, 4, 1, '#1a2028'); r1.position.y = 3; far.add(r1); const r2 = roof(8, 3.4, 1.4, '#1a2028'); r2.position.y = 5.4; far.add(r2);
    for (const [x, y] of [[-3, 1.6], [-1, 1.6], [1, 1.6], [3, 1.6], [-2, 4.2], [0, 4.2], [2, 4.2]]) { const w = lattice(1, 0.9, '#ffb860', { k: 1.4 }); w.position.set(x, y, 2.05); far.add(w); }
    for (const x of [-3.5, 3.5]) { const l = lantern({ len: 0.2, intensity: 8, range: 14 }); l.position.set(x, 3, 2.4); far.add(l); D.ticks.push(l.userData.tick); reflectOn(D, l.userData.body, '#ffa860', 0.9); } }
  // mist over the water
  for (const [z, o] of [[-14, 0.25], [-24, 0.35], [-30, 0.4]]) { const m = mist(120, 7, '#5a6a80', o); m.position.set(0, 1.5, z); D.add(m); }
  D.mark('bow', 2.8, 0.2, -1); D.mark('mid', 1.0, 0.3, -1); D.mark('canopy', -1.0, -0.2, 1); D.mark('canopy2', -2.0, 0.3, 1); D.mark('stern', -3.6, 0.1, 1);
}
ferry.mood = 'rain';

// ================================================================ 聽雨樓 from outside: the courtyard, the river, the only bridge
function exterior(D, o) {
  const dawn = o.mood === 'dawn';
  D.cam0 = { x: 2, y: 2.2, z: -1, d: 24, yaw: 0, pitch: 14, fov: 30 };
  if (!dawn) { D.rain = 1; D.lightning = 1; }
  // ground: wet mud, a paved courtyard
  D.add(floor(T.mud('#4a4034'), 0, 0, 60, 50, 0, { wet: dawn ? 0.6 : 0.32 }));
  D.add(floor(T.pave('#6a665e'), -1, 0.5, 18, 8, 0.01, { wet: dawn ? 0.5 : 0.28 }));
  // puddles that mirror the lights
  for (const [x, z, w, d] of [[-3, 2.6, 2.4, 1], [3.4, 3.2, 1.8, 0.8], [6.5, 1, 1.4, 0.6], [-7, 3.8, 2, 0.9]]) { const p = new THREE.Mesh(new THREE.CircleGeometry(1, 16), std({ color: '#141a24', roughness: 0.05, metalness: 0.4 })); p.scale.set(w / 2, d / 2, 1); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.02, z); p.receiveShadow = true; D.add(p); }
  // the teahouse: two storeys, a deep eave with red pillars, glowing doors and windows, the signboard
  const H = new THREE.Group(); H.position.set(-1, 0, -7); D.add(H);
  const lo = box(15, 3.4, 5, texMat(T.plaster('#dccdb0'), 7, 1.7)); lo.position.y = 1.7; H.add(lo);
  H.add(at(box(15.6, 0.4, 6.2, lam({ map: T.stone() })), [0, 0.2, 0.4]));
  for (const x of [-5.4, -2.7, 0, 2.7, 5.4]) { const d = lattice(1.9, 2.4, dawn ? '#c8b890' : '#e8a858', { k: dawn ? 0.2 : 0.42 }); d.position.set(x, 1.6, 2.52); H.add(d); }
  for (const x of [-7.2, -4.05, -1.35, 1.35, 4.05, 7.2]) { const p = pillar(3.6, 0.17, '#8a2a1e'); p.position.set(x, 0, 3.6); H.add(p); }
  const eave = roof(15, 2.2, 0.7, '#2a3442', { over: 0.6 }); eave.position.set(0, 3.5, 3.0); H.add(eave);
  const up = box(13.4, 2.8, 4.2, texMat(T.plaster('#d4c4a6'), 6, 1.4)); up.position.set(0, 5.3, -0.3); H.add(up);
  for (const x of [-4.5, -1.5, 1.5, 4.5]) { const w = lattice(1.6, 1.4, dawn ? '#c0b090' : '#e8a050', { k: dawn ? 0.2 : 0.5 }); w.position.set(x, 5.4, 1.82); H.add(w); }
  const bal = railing(13.4, 0.8, '#5a2a18', { gap: 0.9 }); bal.position.set(0, 4.05, 2.1); H.add(bal); H.add(at(box(14, 0.18, 1.2, lam({ map: T.planks('#5a3418') })), [0, 3.98, 1.9]));
  const top = roof(13.4, 4.2, 1.9, '#2a3442', { over: 0.9 }); top.position.set(0, 6.7, -0.3); H.add(top);
  const sg = sign('聽雨樓', 3.6, 1.1, { bg: '#1a120a', fg: '#f4d070', emit: dawn ? '#3a2a1a' : '#8a6a3a' }); sg.position.set(0, 4.6, 4.3); sg.rotation.x = -0.12; H.add(sg);
  const lamps = [];
  for (const x of [-6, -2.2, 2.2, 6]) { const l = lantern({ len: 0.5, intensity: dawn ? 0 : 6, range: 10, light: !dawn, text: '茶' }); l.position.set(x, 3.4, 4.0); H.add(l); D.ticks.push(l.userData.tick); lamps.push(l); if (dawn) { l.userData.body.material.emissiveIntensity = 0.25; l.children.forEach((c) => { if (c.isSprite) c.visible = false; }); } }
  // light spilling out of the doors onto the wet stones
  if (!dawn) { const sp = new THREE.PointLight('#ffb060', 5, 9, 1.4); sp.position.set(-1, 1.6, -3.4); D.add(sp); }
  // the river on the right, its stone bank, the far bank
  river(D, 16, 80, [17, -0.9, -10], { deep: dawn ? '#3a4650' : '#0c1824', shallow: dawn ? '#6a7a84' : '#22405a', hi: dawn ? '#d8e0e8' : '#7a9ab8', flow: [0.15, 1.2], rain: dawn ? 0 : 1, rough: 1.4 });
  D.add(box(1, 1.2, 80, lam({ map: T.stone('#6a665e') })), [9.4, -0.4, -10]);
  D.add(box(30, 1.2, 80, lam({ map: T.mud('#3a3a30') })), [40, -0.4, -10]);
  for (let i = 0; i < 10; i++) { const t = tree(i % 2 ? 'willow' : 'pine', 40 + i, 1.4); t.position.set(27 + (i % 3) * 2, 0.2, -30 + i * 4); D.add(t); }
  // the bridge: planks on ropes between two pairs of posts
  const BR = new THREE.Group(); D.add(BR); const planks = [], x0 = 9.6, x1 = 25.2, bz = -1;
  for (const px of [x0, x1]) for (const sz of [-0.95, 0.95]) { const p = box(0.24, 1.8, 0.24, lam({ color: '#4a3020' })); p.position.set(px, 0.6, bz + sz); BR.add(p); }
  const sag = (x) => -Math.sin(((x - x0) / (x1 - x0)) * Math.PI) * 0.55;
  for (const px of [x0, x1]) { const l = lantern({ len: 0.3, s: 0.8, intensity: dawn ? 0 : 6, range: 10, light: !dawn }); l.position.set(px, 1.6, bz + 1.1); D.add(l); if (!dawn) reflectOn(D, l.userData.body, '#ffa060', 0.9); else { l.userData.body.material.emissiveIntensity = 0.25; l.children.forEach((c) => { if (c.isSprite) c.visible = false; }); } }
  for (let x = x0 + 0.3; x < x1 - 0.2; x += 0.38) { const p = box(0.3, 0.08, 1.8, lam({ map: T.planks('#7a5a38') })); p.position.set(x, 0.12 + sag(x), bz); p.userData.x = x; BR.add(p); planks.push(p); }
  const ropes = [];
  for (const sz of [-0.95, 0.95]) for (const yy of [0.15, 1.2]) { const pts = []; for (let i = 0; i <= 20; i++) { const x = x0 + (x1 - x0) * i / 20; pts.push(new V3(x, yy + sag(x) * (yy > 1 ? 0.6 : 1), bz + sz)); } const g = new THREE.BufferGeometry().setFromPoints(pts); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#8a7a5a' })); BR.add(l); ropes.push(l); }
  // after the flood: only the posts are left, with the cut ropes hanging into the water
  const broken = (instant) => {
    ropes.forEach((r) => (r.visible = false));
    for (const sz of [-0.95, 0.95]) { const pts = [new V3(x0, 1.2, bz + sz), new V3(x0 + 0.5, 0.2, bz + sz + 0.4), new V3(x0 + 0.9, -0.85, bz + sz + 1.2)]; const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#8a7a5a' })); BR.add(l); }
    if (instant) planks.forEach((p) => (p.visible = false));
  };
  D.triggers.collapse = (instant) => {
    if (instant) return broken(true);
    broken(false); const st = planks.map((p, i) => ({ p, d: Math.abs(p.userData.x - (x0 + x1) / 2) * 0.03 + Math.random() * 0.15, vy: 0, spin: (Math.random() - 0.5) * 4, drift: 2 + Math.random() * 3 }));
    let t0 = 0; D.tick((dt) => { t0 += dt; for (const s of st) { if (t0 < s.d || !s.p.visible) continue; s.vy -= 12 * dt; s.p.position.y += s.vy * dt; s.p.rotation.x += s.spin * dt; s.p.rotation.z += s.spin * 0.5 * dt; if (s.p.position.y < -0.9) { s.p.position.y = -0.9; s.vy = 0; s.p.position.z += s.drift * dt; if (s.p.position.z > 30) s.p.visible = false; } } });
  };
  if (dawn || o.broken) broken(true);
  // a willow and a stone lantern on the left, barrels and a cart by the wall, mist on the river
  { const t = tree('willow', 3, 1.8); t.position.set(-13, 0, -2); D.add(t); }
  { const sl = new THREE.Group(); sl.position.set(-9.6, 0, 1.2); D.add(sl); sl.add(at(box(0.5, 1.1, 0.5, lam({ map: T.stone() })), [0, 0.55, 0])); sl.add(at(box(0.9, 0.6, 0.9, lam({ map: T.stone('#9a948a') })), [0, 1.4, 0])); sl.add(at(box(1.1, 0.2, 1.1, lam({ map: T.stone('#7a746a') })), [0, 1.8, 0])); const g = glow('#ffb060', 1.2, dawn ? 0.15 : 0.7); g.position.set(0, 1.4, 0.3); sl.add(g); if (!dawn) { const pl = new THREE.PointLight('#ffa050', 3, 6, 1.6); pl.position.set(0, 1.5, 0.8); sl.add(pl); } }
  for (const [x, z] of [[-7.6, -3.6], [-6.8, -3.9]]) D.add(barrel(), [x, 0, z]);
  for (const [z, op] of [[-6, 0.35], [4, 0.3]]) { const m = mist(26, 4, dawn ? '#e0e4ea' : '#5a6a80', op); m.position.set(17, 0.4, z); D.add(m); }
  if (dawn) { const s = shaft(6, 18, '#ffe0c0', 0.18); s.position.set(-14, 16, -6); s.rotation.z = -0.6; D.add(s); }
  D.mark('door', -1, -3.2, 1); D.mark('yard', 0, 1.6, 1); D.mark('bank', 8.4, -0.2, 1); D.mark('bridge', 9.2, -1, 1);
}
exterior.mood = 'rain';

// ================================================================ the broken bridge on the river bank
function bridge(D) {
  D.cam0 = { x: 1.5, y: 1, z: 0, d: 15, yaw: 14, pitch: 16, fov: 30 };
  D.rain = 0.7; D.lightning = 1;
  D.add(floor(T.mud('#3e382e'), -10, 0, 28, 40, 0, { wet: 0.35 }));
  D.add(box(1.2, 1.6, 40, lam({ map: T.rock('#4a4640') })), [4.2, -0.8, 0]);
  river(D, 40, 60, [24, -1.3, -6], { deep: '#1a1a14', shallow: '#4a4430', hi: '#a89a78', flow: [0.1, 2.2], rain: 0.7, rough: 1.8 });
  // the posts, the ropes cut clean and hanging into the flood, a few planks still caught
  for (const sz of [-1, 1]) { const p = box(0.3, 2.2, 0.3, lam({ color: '#4a3020' })); p.position.set(3.5, 1.1, sz); D.add(p); D.add(box(0.5, 0.18, 0.5, lam({ color: '#3a2214' })), [3.5, 2.2, sz]); }
  const rope = (pts) => { const c = new THREE.CatmullRomCurve3(pts.map((p) => new V3(...p))); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 20, 0.04, 4), lam({ color: '#8a7a58' })); m.castShadow = true; D.add(m); return m; };
  rope([[3.5, 1.9, -1], [4.4, 0.6, -0.6], [5.2, -1.1, 0.4]]); rope([[3.5, 1.9, 1], [4.2, 0.8, 1.6], [5, -1.1, 3]]);
  rope([[3.5, 0.4, -1], [2.6, 0.06, -0.2], [1.4, 0.05, 0.5], [0.9, 0.05, 0.4]]);   // the end on the bank: cut clean
  const end = box(0.14, 0.14, 0.14, lam({ color: '#c8b888', emissive: new THREE.Color('#3a3020') })); end.position.set(0.9, 0.07, 0.4); D.add(end);
  for (const [x, z, r] of [[5, 0.6, 0.4], [4.6, -0.7, -0.6]]) { const p = box(0.3, 0.08, 1.6, lam({ map: T.planks('#6a4a30') })); p.position.set(x, -0.6, z); p.rotation.set(0.6, 0, r); D.add(p); }
  for (const sz of [-1, 1]) { const p = box(0.3, 2.2, 0.3, lam({ color: '#2a2018' })); p.position.set(19, 0.3, sz - 2); D.add(p); }
  D.add(box(20, 1.4, 60, lam({ map: T.mud('#2a2a24') })), [32, -0.6, -6]);
  // a stone lantern lit on the bank, a willow, reeds; floating debris goes by
  { const sl = new THREE.Group(); sl.position.set(-2.4, 0, -2.4); D.add(sl); sl.add(at(box(0.5, 1.1, 0.5, lam({ map: T.stone() })), [0, 0.55, 0])); sl.add(at(box(0.9, 0.6, 0.9, lam({ map: T.stone('#9a948a') })), [0, 1.4, 0])); sl.add(at(box(1.1, 0.2, 1.1, lam({ map: T.stone('#7a746a') })), [0, 1.8, 0])); const g = glow('#ffb060', 1.3, 0.75); g.position.set(0, 1.4, 0.3); sl.add(g); const pl = new THREE.PointLight('#ffa050', 6, 10, 1.4); pl.position.set(0.4, 1.6, 1.2); sl.add(pl); reflectOn(D, g, '#ffa050', 0.6); }
  { const t = tree('willow', 9, 1.8); t.position.set(-8, 0, -4); D.add(t); }
  for (let i = 0; i < 6; i++) { const r = tree('reeds', i, 1.4); r.position.set(2.8 + (i % 2) * 0.6, 0, -12 + i * 1.6); D.add(r); }
  const debris = []; for (let i = 0; i < 3; i++) { const p = box(0.3, 0.08, 1.4, lam({ map: T.planks('#5a4028') })); p.position.set(9 + i * 4, -1.2, -20 - i * 9); D.add(p); debris.push(p); }
  D.tick((dt) => debris.forEach((p, i) => { p.position.z += dt * (3 + i); p.rotation.y += dt * 0.4; if (p.position.z > 20) p.position.z = -30; }));
  for (const [z, op] of [[-10, 0.35], [2, 0.25]]) { const m = mist(40, 4, '#6a7480', op); m.position.set(16, 0, z); D.add(m); }
  D.mark('post', 2.6, 0.2, 1); D.mark('bank', 0.2, 1.4, 1); D.mark('back', -3, 0.4, 1);
}
bridge.mood = 'rain';

// ================================================================ the hall of 聽雨樓: the stage and the eight-foot screen, the tables, the stairs
function hall(D, o) {
  const day = o.mood === 'day';
  D.cam0 = { x: -0.5, y: 1.6, z: -0.5, d: 21, yaw: 0, pitch: 22, fov: 30 };
  D.add(floor(T.planks('#6a4428'), 0, 0, 26, 16, 0, { wet: 0.55 }));
  // walls: back (with windows and a door out to the veranda), left; beams above
  D.add(wall(T.plaster('#d8c8a8'), 0, 0, -7.6, 26, 6, { unit: 2.2 }));
  D.add(wall(T.plaster('#d0c0a0'), -13, 0, 0, 16, 6, { ry: Math.PI / 2, unit: 2.2 }));
  for (const x of [-12.6, -6.4, 0.6, 7.6, 12.6]) { const p = pillar(6, 0.2, '#6a2418'); p.position.set(x, 0, -7.3); D.add(p); }
  for (const x of [-10, -3.6, 3.6]) { const w = lattice(2.2, 1.6, day ? '#fff4d8' : '#3a5a8a', { k: day ? 1.2 : 0.7, emit: '#ffffff' }); w.position.set(x, 3.2, -7.55); D.add(w); D['win' + x] = w; }
  { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3), new THREE.MeshBasicMaterial({ color: day ? '#c8d8e8' : '#0a1220' })); d.position.set(10, 1.5, -7.55); D.add(d); const fr = lam({ color: '#2a1608' }); D.add(box(2.2, 0.2, 0.2, fr), [10, 3.05, -7.5]); for (const sx of [-1, 1]) D.add(box(0.2, 3, 0.2, fr), [10 + sx * 1, 1.5, -7.5]); }
  D.add(box(26, 0.3, 0.35, lam({ color: '#3a2214' })), [0, 5.6, -6]);
  // a scroll of calligraphy and a painting on the walls
  { const c = cutout(20, 56, (x) => { x.fillStyle = '#3a2a1a'; x.fillRect(0, 0, 20, 3); x.fillRect(0, 53, 20, 3); x.fillStyle = '#efe6cc'; x.fillRect(2, 3, 16, 50); x.fillStyle = '#1a1a1a'; x.font = '900 13px serif'; x.textAlign = 'center'; for (const [i, ch] of ['聽', '雨', '說', '書'].entries()) x.fillText(ch, 10, 15 + i * 12); }); const m = cutoutMesh(c, PX * 1.4); m.position.set(-12.9, 2, -3); m.rotation.y = Math.PI / 2; D.add(m); }
  // the stage, its red edge and steps; the screen on it; the storyteller's table and stool behind the screen
  D.add(box(8, 0.5, 3.6, lam({ map: T.planks('#7a4a2a') })), [-6, 0.25, -5.6]);
  D.add(box(8.1, 0.14, 0.14, lam({ color: '#a82a20' })), [-6, 0.5, -3.78]);
  D.add(box(1.2, 0.25, 0.6, lam({ map: T.planks('#6a3a1e') })), [-1.6, 0.12, -3.6]);
  const scr = screen(); scr.position.set(-6.1, 0.5, -4.6); D.add(scr); D.screen = scr;
  const st = table(1.4, 0.8, 0.9, '#4a2412'); st.position.set(-6, 0.5, -6.4); D.add(st);
  D.add(box(0.36, 0.14, 0.2, lam({ color: '#3a1a0a' })), [-5.6, 1.47, -6.3]);
  const ps = stool(0.5); ps.position.set(-6, 0.5, -6.95); D.add(ps);
  // a spotlight on the stage (it throws the screen's shadow), lanterns over the tables
  const spot = new THREE.SpotLight(day ? '#fff0d0' : '#ffd8a0', day ? 10 : 40, 18, 0.55, 0.5, 1.2); spot.position.set(-4, 7.5, 2); spot.target.position.set(-6, 0.5, -5.2); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); D.add(spot); D.add(spot.target); D.spot = spot;
  const lamps = [];
  for (const [x, z] of [[-6, -1.5], [-1, -1], [4, -1.2], [1, 3], [-6, 3.4], [8, 2.4]]) { const l = lantern({ len: 0.9, intensity: day ? 0 : 6, range: 9, light: !day && lamps.length < 5 }); l.position.set(x, 5.4, z); D.add(l); lamps.push(l); if (day) { l.userData.body.material.emissiveIntensity = 0.3; l.children.forEach((c) => { if (c.isSprite) c.visible = false; }); } }
  // tables and benches (A 鐵無私, B 柳寒煙, C 冷笑天, D the brothers, F 錢萬里 at dinner), 苦禪's mat, the counter
  const T6 = [['A', -5, 0.2], ['B', -0.6, -0.8], ['C', 4.2, -1.4], ['D', 0.6, 3.2], ['F', 5.2, 3.4]];
  for (const [k, x, z] of T6) { const t = table(2, 1.1, 1.0); t.position.set(x, 0, z); D.add(t); for (const sz of [-0.95, 0.95]) { const b = bench(2); b.position.set(x, 0, z + sz); D.add(b); } const c = candle({ intensity: 0, range: 0.1 }); c.position.set(x + 0.5, 1.05, z); D.add(c); c.children.forEach((ch) => { if (ch.isPointLight) ch.visible = false; }); if (day) c.userData.snuff(false); D.marks['t' + k] = [x, z]; const cup = box(0.16, 0.14, 0.16, lam({ color: '#e8e4d8' })); cup.position.set(x - 0.4, 1.12, z + 0.1); D.add(cup); }
  { const m = new THREE.Mesh(new THREE.CircleGeometry(0.9, 12), lam({ color: '#8a6a3a' })); m.rotation.x = -Math.PI / 2; m.position.set(-6.4, 0.02, 3.6); D.add(m); }
  D.add(box(3.4, 1.15, 0.9, lam({ map: T.planks('#5a2e16') })), [9.2, 0.58, 1.6]);
  for (const [x, c] of [[8.2, '#6a4a3a'], [9, '#8a6a4a'], [9.8, '#5a3a2a']]) D.add(jar(0.2, 0.42, c), [x, 1.16, 1.5]);
  D.add(box(2.6, 2.6, 0.5, lam({ map: T.planks('#4a2412') })), [6.0, 1.3, -7.2]);
  for (const y of [0.98, 1.88]) D.add(box(2.6, 0.08, 0.6, lam({ map: T.planks('#5a2e16') })), [6.0, y, -6.85]);
  for (const [x, y, c] of [[5.2, 1.0, '#7a5a4a'], [6.0, 1.0, '#4a5a6a'], [6.8, 1.0, '#8a4a3a'], [5.6, 1.9, '#6a6a5a'], [6.4, 1.9, '#5a4a3a']]) D.add(jar(0.18, 0.4, c), [x, y, -6.85]);
  // the stairs up to the rooms
  const S = stairs(1.6, 10, 0.34, 0.5, '#5a3418'); S.position.set(12, 0, 1.4); D.add(S);
  const sr = railing(5.2, 0.9, '#4a2412', { gap: 1.3 }); sr.rotation.y = Math.PI / 2; sr.rotation.z = 0; sr.position.set(11.1, 1.8, -1); sr.rotation.x = 0; D.add(sr);
  // the day: sun through the windows in long shafts, and a full house
  if (day) { for (const x of [-10, -3.6, 3.6]) { const s = shaft(2.4, 9, '#fff0c8', 0.22); s.position.set(x, 4.2, -7.2); s.rotation.x = 0.85; D.add(s); } }
  else { const ws = []; for (const x of [-10, -3.6, 3.6]) { const s = shaft(2.2, 7, '#8ab0e8', 0.06); s.position.set(x, 4, -7.2); s.rotation.x = 0.8; D.add(s); ws.push(s); } D.winShafts = ws; }
  // marks: the stage behind the screen, 小蓮's peeking place at the stage's side, the tables, the counter, the stair foot
  D.mark('stage', -6, -6.3, 1); D.mark('stageFront', -4.6, -4.2, 1); D.mark('peek', -9.6, -4.3, 1); D.mark('counter', 9, 2.6, -1); D.mark('stair', 11.6, 2.6, -1); D.mark('mat', -6.4, 3.6, 1); D.mark('door', 10, -6.6, 1);
  D.floorAt = (x, z) => { if (x > -10 && x < -2 && z < -3.8 && z > -7.4) return 0.5; if (x > 11.2 && x < 12.8 && z < 1.6 && z > -3.6) return Math.min(3.4, (1.6 - z) * 0.68); return 0; };
}
hall.mood = 'hall';

// ================================================================ upstairs: the corridor and 錢萬里's room behind its wall
function upstairs(D) {
  D.cam0 = { x: 1.6, y: 1.6, z: 1.2, d: 14, yaw: 0, pitch: 16, fov: 30 };
  D.add(floor(T.planks('#5a3a22'), 0, -1, 24, 12, 0));
  // the corridor's railing over the hall, the warm glow rising from below
  { const r = railing(22, 0.95, '#4a2412', { gap: 1.2 }); r.position.set(0, 0, 3.6); D.add(r); D.rail = r; const g = new THREE.PointLight('#ffb060', 5, 9, 1.4); g.position.set(0, -1.5, 5); D.add(g); const gl = glow('#ffa050', 6, 0.25); gl.position.set(0, -0.5, 5); D.add(gl); }
  const corLamps = []; for (const x of [-6, 3.8, 9]) { const l = lantern({ len: 0.6, intensity: 6, range: 9 }); l.position.set(x, 4.2, 1.9); D.add(l); corLamps.push(l); }
  // the wall between: plaster panels around three doors; the middle door is 錢萬里's
  const front = new THREE.Group(); D.add(front); const FW = T.plaster('#d8c8a8');
  for (const [x0, x1] of [[-12, -6.7], [-5.3, 0.85], [2.15, 6.3], [7.7, 12]]) front.add(wall(FW, (x0 + x1) / 2, 0, 0, x1 - x0, 3.6, { unit: 1.8 }));
  for (const x of [-6, 7]) { const d = door(1.3, 2.5, '#4a2a14'); d.position.set(x, 0, 0.02); front.add(d); front.add(wall(FW, x, 2.5, 0.0, 1.4, 1.1, { unit: 1.8 })); }
  const top = wall(FW, 1.5, 2.5, 0.0, 1.4, 1.1, { unit: 1.8 }); front.add(top);
  front.add(at(box(24, 0.3, 0.35, lam({ color: '#3a2214' })), [0, 4.6, 1.8]));
  const dr = door(1.3, 2.5, '#5a2e16'); dr.position.set(1.5, 0, 0.02); front.add(dr); D.door = dr;
  // the scorched palm on the frame, the blood under the door (hidden until their moment)
  const palm = cutoutMesh(cutout(16, 18, (x) => { x.fillStyle = '#1a0e08'; x.beginPath(); x.ellipse(8, 12, 5, 5, 0, 0, 7); x.fill(); for (const [fx, a] of [[3, -0.4], [6, -0.1], [9, 0.1], [12, 0.35]]) { x.save(); x.translate(fx, 7); x.rotate(a); x.fillRect(-1, -6, 2, 7); x.restore(); } x.fillStyle = '#5a2a10'; x.fillRect(6, 10, 4, 3); }), PX * 0.9, { shadow: false }); palm.position.set(2.45, 1.3, 0.12); D.add(palm); palm.visible = false; D.palm = palm;
  const blood = new THREE.Mesh(new THREE.CircleGeometry(1, 20), lam({ color: '#8a0c12', emissive: new THREE.Color('#300306'), transparent: true, opacity: 0.95 })); blood.rotation.x = -Math.PI / 2; blood.position.set(1.6, 0.015, 0.25); blood.scale.set(0.01, 0.01, 1); D.add(blood);
  // the room: back wall with the shut window over the river, side walls, bed, table, candle, tea, ledger box, cage
  D.add(wall(T.plaster('#cfc0a2'), 1.5, 0, -6, 9.4, 3.6, { unit: 1.8 }));
  D.add(wall(T.plaster('#c4b496'), -3.2, 0, -3, 6, 3.6, { ry: Math.PI / 2, unit: 1.8 }));
  D.add(wall(T.plaster('#c4b496'), 6.2, 0, -3, 6, 3.6, { ry: -Math.PI / 2, unit: 1.8 }));
  const win = lattice(1.8, 1.3, '#2a4a7a', { k: 0.9 }); win.position.set(4.4, 2.2, -5.96); D.add(win); D.win = win;
  { const b = bed(); b.position.set(-1.4, 0, -5.1); D.add(b); }
  const tb = table(1.6, 1, 0.95, '#5a2e16'); tb.position.set(2.6, 0, -2.8); D.add(tb);
  const cdl = candle({ intensity: 4, range: 8, h: 0.42 }); cdl.position.set(2.2, 1.0, -2.9); D.add(cdl); D.candle = cdl;
  const pot = jar(0.16, 0.28, '#3a4a4a'); pot.position.set(3.0, 1.0, -2.6); D.add(pot); D.add(box(0.12, 0.1, 0.12, lam({ color: '#e8e4d8' })), [2.7, 1.05, -2.4]);
  const lb = new THREE.Group(); lb.position.set(3.0, 1.0, -3.1); D.add(lb); lb.add(at(box(0.7, 0.32, 0.5, lam({ map: T.lacquer('#2a3a4a') })), [0, 0.16, 0])); const lid = box(0.72, 0.06, 0.52, lam({ map: T.lacquer('#3a4a5a') })); lid.position.set(0, 0.34, 0); lb.add(lid); D.ledgerLid = lid;
  // the cage on its stand by the window; the bird is an actor (bird) standing in it
  { const st2 = box(0.12, 1.5, 0.12, lam({ color: '#3a2214' })); st2.position.set(5.2, 0.75, -4.6); D.add(st2); const c = cutoutMesh(cutout(20, 24, (x) => { x.strokeStyle = '#8a6a3a'; x.lineWidth = 1; x.beginPath(); x.arc(10, 10, 9, Math.PI, 0); x.stroke(); for (let i = 2; i < 19; i += 3) { x.fillStyle = '#8a6a3a'; x.fillRect(i, 3 + Math.abs(10 - i) * 0.5, 1, 20 - Math.abs(10 - i) * 0.5); } x.fillStyle = '#5a3a1a'; x.fillRect(0, 21, 20, 3); x.fillRect(9, 0, 2, 2); }), PX * 1.5, { shadow: false }); c.position.set(5.2, 1.5, -4.55); D.add(c); D.cage = c;
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.05, 8), lam({ color: '#c8c8d0' })); dish.position.set(5.45, 1.55, -4.5); D.add(dish); D.dish = dish; }
  // the 令刀 case on the floor (lid open after the murder), the blade under the bed
  const cs = new THREE.Group(); cs.position.set(0.4, 0, -1.8); D.add(cs); cs.add(at(box(2, 0.3, 0.42, lam({ map: T.lacquer('#5a1e18') })), [0, 0.15, 0])); const clid = box(2, 0.06, 0.44, lam({ map: T.lacquer('#6a2a20') })); clid.position.set(0, 0.33, 0); cs.add(clid); for (const x of [-0.7, 0, 0.7]) cs.add(at(box(0.06, 0.32, 0.46, lam({ color: '#c8a040' })), [x, 0.16, 0])); D.caseLid = clid;
  const blade = new THREE.Group(); blade.position.set(-0.6, 0.06, -4.2); blade.rotation.y = 0.3; D.add(blade); blade.add(at(box(1.6, 0.03, 0.14, lam({ color: '#c8d0dc', emissive: new THREE.Color('#2a2a30') })), [0.2, 0, 0])); blade.add(at(box(0.5, 0.06, 0.08, lam({ color: '#5a1e18' })), [-0.8, 0, 0])); blade.add(at(box(0.5, 0.04, 0.1, lam({ color: '#6a0a0c' })), [0.6, 0.02, 0])); blade.visible = false; D.blade = blade;
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.8, 18), lam({ color: '#6a0a0e', emissive: new THREE.Color('#200204') })); pool.rotation.x = -Math.PI / 2; pool.position.set(2.2, 0.012, -1.2); pool.visible = false; D.add(pool);
  // the cutaway: hide the wall panels to look into the room
  D.triggers.cut = (i, on = 1) => { front.visible = !on; D.rail.visible = !on; corLamps.forEach((l) => (l.visible = !on)); };
  D.triggers.snuff = () => cdl.userData.snuff(false);
  D.triggers.lit = () => cdl.userData.snuff(true);
  D.triggers.murder = () => { pool.visible = true; clid.position.set(0, 0.45, -0.32); clid.rotation.x = -1.1; };
  D.triggers.blood = (instant) => { if (instant) { blood.scale.set(0.7, 0.5, 1); return; } let k = 0; D.tick((dt) => { if (k >= 1) return; k = Math.min(1, k + dt * 0.25); blood.scale.set(0.7 * k, 0.5 * k, 1); }); };
  const roomLamp = new THREE.PointLight('#ffb878', 0, 10, 1.3); roomLamp.position.set(1.4, 3.4, 1.2); D.add(roomLamp);
  const moon = new THREE.PointLight('#7a9ae0', 3, 9, 1.4); moon.position.set(4.4, 2.4, -5); D.add(moon);
  D.triggers.broken = () => { dr.userData.open(-1.4); roomLamp.intensity = 7; };
  D.triggers.shut = () => { dr.userData.open(0); roomLamp.intensity = 0; };
  D.triggers.palm = () => { palm.visible = true; };
  D.triggers.blade = () => { blade.visible = true; };
  D.triggers.empty = () => { lid.position.set(0.2, 0.5, -0.3); lid.rotation.x = -1; };
  D.triggers.spill = () => { D.dish.rotation.z = 1.4; D.dish.position.y = 1.5; };
  D.triggers.fill = () => { D.dish.rotation.z = 0; D.dish.position.y = 1.55; };
  D.mark('door', 1.5, 1.2, 1); D.mark('hall', -4, 1.8, 1); D.mark('room', 1.6, -1.4, 1); D.mark('body', 2.2, -1.25, 1); D.mark('cage', 4.4, -4.2, 1); D.mark('table', 1.4, -2.2, 1); D.mark('bed', -0.6, -3.4, 1); D.mark('east', 5.4, 1.6, -1);
}
upstairs.mood = 'dim';

// ================================================================ the veranda over the river, where 柳寒煙 fishes
function veranda(D) {
  D.cam0 = { x: 0, y: 1.3, z: 0, d: 16, yaw: 0, pitch: 12, fov: 30 };
  D.rain = 0.9; D.lightning = 1;
  D.add(floor(T.planks('#6a4a2e'), 0, -0.5, 20, 6, 0, { wet: 0.4 }));
  D.add(box(20, 0.5, 6, lam({ map: T.planks('#3a2414') })), [0, -0.26, -0.5]);
  for (const x of [-9, -4.5, 0, 4.5, 9]) D.add(box(0.3, 3, 0.3, lam({ color: '#3a2414' })), [x, -1.8, 2.3]);
  D.add(wall(T.plaster('#d0c0a0'), 0, 0, -3.5, 20, 4.4, { unit: 2 }));
  for (const x of [-6, -2, 2, 6]) { const d = lattice(2, 2.5, '#e8a858', { k: 0.42 }); d.position.set(x, 1.35, -3.45); D.add(d); }
  // a lean-to roof; rain pours off its edge in a curtain
  { const r = new THREE.Mesh(new THREE.PlaneGeometry(21, 6.6), lam({ map: (() => { const t = T.roof('#2a3442').clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 4); return t; })(), side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2 + 0.2; r.position.set(0, 4.3, -0.4); r.castShadow = true; D.add(r); D.add(box(21, 0.16, 0.2, lam({ color: '#1a1a20' })), [0, 3.65, 2.8]); }
  // drops falling off the eave
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), new THREE.MeshBasicMaterial({ color: '#9ab4d8', transparent: true, opacity: 0.6 })); const x = -10 + i * 0.8 + Math.random() * 0.3, ph = Math.random() * 3; D.add(m); D.tick((dt, t) => { const k = ((t * 1.6 + ph) % 1); m.position.set(x, 3.6 - k * 4.4, 2.86); }); }
  { const r = railing(19, 0.9, '#4a2a14', { gap: 1.2 }); r.position.set(0, 0, 2.0); D.add(r); }
  // the river below and the reeds, the far bank in the mist
  river(D, 80, 50, [0, -1.8, 25], { deep: '#0a1622', shallow: '#20405a', hi: '#7a9ab8', flow: [0.9, 0.3], rain: 1 });
  for (let i = 0; i < 10; i++) { const r = tree('reeds', 30 + i, 1.4); r.position.set(-12 + i * 2.8, -1.8, 4 + (i % 3)); D.add(r); }
  { const m = mist(60, 5, '#5a6a80', 0.35); m.position.set(0, -0.5, 14); D.add(m); }
  // 柳寒煙's fishing gear: a creel, a stool, the spool of silk line on its peg
  D.add(stool(0.5), [5.6, 0, 0.8]);
  D.add(box(0.5, 0.45, 0.4, lam({ map: T.thatch() })), [6.6, 0.22, 1.1]);
  { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 10), lam({ color: '#e8e8f0', emissive: new THREE.Color('#2a2a30') })); sp.rotation.x = Math.PI / 2; sp.position.set(7.4, 1.4, -3.3); D.add(sp); D.add(box(0.06, 0.06, 0.3, lam({ color: '#3a2214' })), [7.4, 1.4, -3.4]); }
  for (const x of [-5, 3]) { const l = lantern({ len: 0.5, intensity: 5, range: 9 }); l.position.set(x, 3.6, 1.6); D.add(l); reflectOn(D, l.userData.body, '#ffa060', 0.7); }
  D.mark('rail', 5.4, 1.2, 1); D.mark('door', -2, -2.6, 1); D.mark('mid', 0, 0.6, 1); D.mark('peg', 7.2, -2.6, 1);
}
veranda.mood = 'rain';

// ================================================================ the kitchen: the stove, the jars, a bowl of noodles at midnight
function kitchen(D) {
  D.cam0 = { x: 0, y: 1.4, z: -0.6, d: 14, yaw: 0, pitch: 20, fov: 30 };
  D.add(floor(T.pave('#6a6258'), 0, 0, 16, 9, 0));
  D.add(wall(T.brick('#8a5a40'), 0, 0, -4.2, 16, 5, { unit: 2 }));
  D.add(wall(T.plaster('#c8b898'), -8, 0, 0, 9, 5, { ry: Math.PI / 2, unit: 2 }));
  // the stove with its fire, a wok steaming
  const sv = box(3.4, 1.3, 1.6, lam({ map: T.brick('#9a6a4a') })); sv.position.set(-4, 0.65, -3.2); D.add(sv);
  const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), new THREE.MeshBasicMaterial({ color: '#ff8a3a' })); mouth.position.set(-4.6, 0.45, -2.39); D.add(mouth);
  const fire = new THREE.PointLight('#ff7a30', 6, 9, 1.4); fire.position.set(-4.6, 0.7, -1.6); D.add(fire);
  const fg = glow('#ff7a30', 1.6, 0.7); fg.position.set(-4.6, 0.5, -2.2); D.add(fg);
  D.tick((dt, t) => { fire.intensity = 5.5 + Math.sin(t * 8) * 0.8 + Math.sin(t * 19) * 0.5; });
  const wok = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lam({ color: '#2a2a2a', side: THREE.DoubleSide })); wok.position.set(-3.5, 1.65, -3.2); D.add(wok);
  const steam = []; for (let i = 0; i < 5; i++) { const s = glow('#e8e8f0', 0.8, 0.3); s.material.blending = THREE.NormalBlending; D.add(s); steam.push(s); }
  D.tick((dt, t) => steam.forEach((s, i) => { const k = (t * 0.3 + i / 5) % 1; s.position.set(-3.5 + Math.sin(t + i) * 0.2, 1.8 + k * 2.4, -3.2); s.scale.setScalar(0.5 + k * 1.5); s.material.opacity = 0.35 * (1 - k); }));
  // shelves of jars, strings of peppers and garlic, barrels, the water vat
  for (const y of [1.6, 2.6]) D.add(box(5, 0.1, 0.5, lam({ map: T.planks('#5a3418') })), [2.6, y, -3.95]);
  const R = rng(9); for (let i = 0; i < 9; i++) D.add(jar(0.14 + R() * 0.08, 0.3 + R() * 0.2, ['#6a4a3a', '#8a6a4a', '#4a5a6a', '#7a3a2a'][i % 4]), [0.6 + (i % 5) * 0.95, i < 5 ? 1.65 : 2.65, -3.9]);
  for (const x of [-6.6, -1.6]) { const c = cutout(10, 40, (x2) => { x2.fillStyle = '#5a3a1a'; x2.fillRect(4, 0, 1, 40); for (let y = 4; y < 38; y += 5) { x2.fillStyle = x < -5 ? '#c82a1a' : '#efe6d0'; x2.fillRect(2, y, 6, 4); x2.fillStyle = x < -5 ? '#e85a3a' : '#ffffff'; x2.fillRect(3, y, 2, 2); } }); const m = cutoutMesh(c, PX * 1.4); m.position.set(x, 1.8, -4.0); D.add(m); }
  ninja(D.group, 'house', 304, 224, 16, 16, [4.4, 0, -3.6], PX * 1.1); ninja(D.group, 'house', 320, 224, 16, 16, [5.3, 0, -3.6], PX * 1.1); ninja(D.group, 'house', 336, 240, 16, 16, [4.9, 0, -3.2], PX * 1.0); ninja(D.group, 'house', 352, 320, 16, 32, [-7.9, 1.2, -2], PX * 1.4, { ry: Math.PI / 2 });
  D.add(barrel(0.45, 1), [6.6, 0, -1.2]);
  { const v = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.6, 1, 12), lam({ color: '#5a4a3a' })); v.position.set(-6.8, 0.5, 0.4); D.add(v); const w = new THREE.Mesh(new THREE.CircleGeometry(0.62, 12), std({ color: '#1a2a3a', roughness: 0.1 })); w.rotation.x = -Math.PI / 2; w.position.set(-6.8, 0.96, 0.4); D.add(w); }
  // the table, its bowls; the back door open on the rain
  const tb = table(2.4, 1.2, 1.0, '#6a3a1e'); tb.position.set(1.4, 0, -0.6); D.add(tb);
  for (const x of [0.8, 1.6, 2.2]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.14, 10), lam({ color: '#e8e4d8' })); b.position.set(x, 1.1, -0.5); D.add(b); }
  for (const sz of [-1, 1]) D.add(bench(2.4), [1.4, 0, -0.6 + sz]);
  { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), new THREE.MeshBasicMaterial({ color: '#0e1828' })); d.position.set(6.2, 1.4, -4.15); D.add(d); }
  { const l = lantern({ len: 0.8, intensity: 5, range: 9 }); l.position.set(1.4, 4.6, -0.6); D.add(l); }
  D.mark('stove', -2.6, -1.8, -1); D.mark('table', 1.4, 0.6, 1); D.mark('door', 5.6, -3, -1);
}
kitchen.mood = 'hall';

// ================================================================ the rooftop in the storm
function rooftop(D) {
  D.cam0 = { x: 0, y: 1.8, z: 0, d: 14, yaw: 0, pitch: 7, fov: 32 };
  D.rain = 1; D.lightning = 1;
  const rt = T.roof('#4a5468').clone(); rt.needsUpdate = true; rt.wrapS = rt.wrapT = THREE.RepeatWrapping; rt.repeat.set(20, 4);
  for (const sgn of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(30, 6.4), std({ map: rt, roughness: 0.4, side: THREE.DoubleSide })); p.rotation.x = -Math.PI / 2 + sgn * -0.5; p.position.set(0, -1.55, sgn * 2.8); p.receiveShadow = true; D.add(p); }
  D.add(box(31, 0.4, 0.5, lam({ color: '#1a1e26' })), [0, 0.12, 0]);
  for (const sx of [-1, 1]) { const tip = box(0.5, 1.6, 0.5, lam({ color: '#1a1e26' })); tip.position.set(sx * 15.4, 0.8, 0); tip.rotation.z = -sx * 0.5; D.add(tip); const orn = cutoutMesh(cutout(16, 16, (x) => { x.fillStyle = '#3a4a3a'; x.fillRect(2, 6, 12, 8); x.fillRect(10, 2, 4, 6); x.fillStyle = '#5a6a5a'; x.fillRect(3, 7, 8, 2); x.fillStyle = '#d8b040'; x.fillRect(12, 3, 1, 1); }), PX * 2); orn.position.set(sx * 13.5, 0.3, 0); orn.scale.x = sx; D.add(orn); }
  // far below: the courtyard lanterns; around: dark hills, the river glinting, clouds racing
  for (const [x, z] of [[-6, 10], [-2, 10], [2, 10], [6, 10]]) { const g = glow('#ffa050', 2, 0.7); g.position.set(x, -9, z); D.add(g); }
  { const pl = new THREE.PointLight('#ffa050', 6, 14, 1.4); pl.position.set(0, -5, 6); D.add(pl); }
  const hills = cutout(512, 96, (x) => { x.fillStyle = '#0c121c'; x.beginPath(); x.moveTo(0, 96); let y = 50; const r = rng(4); for (let i = 0; i <= 512; i += 8) { y += (r() - 0.5) * 16; y = Math.max(20, Math.min(80, y)); x.lineTo(i, y); } x.lineTo(512, 96); x.fill(); x.fillStyle = '#ffb060'; for (let i = 0; i < 18; i++) x.fillRect(Math.floor(r() * 512), 82 + Math.floor(r() * 10), 2, 1); });
  { const t = new THREE.CanvasTexture(hills); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; const m = new THREE.Mesh(new THREE.PlaneGeometry(140, 26), new THREE.MeshBasicMaterial({ map: t, transparent: true, fog: false })); m.position.set(0, -6, -50); D.add(m); }
  for (let i = 0; i < 3; i++) { const m = mist(80, 12, '#2a3448', 0.5); m.position.set(0, 8 + i * 3, -30 - i * 6); D.add(m); m.userData.tick = null; D.tick((dt) => { m.material.map.offset.x += dt * (0.02 + i * 0.01); }); }
  { const c = new THREE.PointLight('#8aa8ff', 5, 22, 1.2); c.position.set(-2, 6, 7); D.add(c); const w = new THREE.PointLight('#ffa060', 7, 16, 1.3); w.position.set(1, -2.5, 4.5); D.add(w); }
  D.floorAt = (x, z) => 0.3 - Math.abs(z) * 0.55;
  D.mark('left', -3, 0, 1); D.mark('right', 3, 0, -1); D.mark('far', 7, 0, -1);
}
rooftop.mood = 'rain';

// ================================================================ the close-up: a table, a left hand, a playbill folded into a crane
function crane(D) {
  D.cam0 = { x: 0, y: 0.3, z: 0, d: 4.2, yaw: 0, pitch: 38, fov: 30 };
  D.add(box(8, 0.2, 5, texMat(T.planks('#6a3a1e'), 12, 7)), [0, -0.1, 0]);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22, 12), lam({ color: '#e8e4d8' })); cup.position.set(1.1, 0.11, -0.5); cup.castShadow = true; D.add(cup);
  D.add(box(0.42, 0.16, 0.24, lam({ color: '#3a1a0a' })), [-1.2, 0.08, -0.6]);
  const l = new THREE.PointLight('#ffc080', 5, 8, 1.4); l.position.set(0.6, 1.6, 1); D.add(l);
  // the playbill: flat, then folding, then a crane
  const bill = (k) => cutout(48, 40, (x) => {
    if (k === 0) { x.fillStyle = '#efe2c0'; x.fillRect(2, 2, 44, 36); x.fillStyle = '#b8302a'; x.fillRect(2, 2, 44, 3); x.fillRect(2, 35, 44, 3); x.fillStyle = '#1a1010'; x.font = '900 9px serif'; x.textAlign = 'center'; x.fillText('下回', 24, 15); x.font = '900 10px serif'; x.fillText('龍門血案', 24, 29); }
    else if (k === 1) { x.fillStyle = '#efe2c0'; x.beginPath(); x.moveTo(24, 2); x.lineTo(44, 20); x.lineTo(24, 38); x.lineTo(4, 20); x.fill(); x.fillStyle = '#d8c8a4'; x.beginPath(); x.moveTo(24, 2); x.lineTo(24, 38); x.lineTo(4, 20); x.fill(); x.fillStyle = '#b8302a'; x.fillRect(22, 18, 4, 4); }
    else { x.fillStyle = '#efe2c0'; x.beginPath(); x.moveTo(4, 14); x.lineTo(20, 22); x.lineTo(24, 34); x.lineTo(30, 22); x.lineTo(46, 8); x.lineTo(32, 18); x.lineTo(24, 4); x.lineTo(18, 18); x.fill(); x.fillStyle = '#d8c8a4'; x.beginPath(); x.moveTo(20, 22); x.lineTo(24, 34); x.lineTo(28, 22); x.fill(); x.fillStyle = '#b8302a'; x.fillRect(4, 13, 3, 2); }
  });
  const frames = [0, 1, 2].map((k) => { const t = new THREE.CanvasTexture(bill(k)); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; });
  const pb = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.92), lam({ map: frames[0], transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); pb.rotation.x = -Math.PI / 2; pb.position.set(0.1, 0.02, 0.2); pb.castShadow = true; D.add(pb);
  // the left hand: a long grey-blue sleeve coming in from the left, the hand turned palm-down
  const hand = cutout(64, 32, (x) => { x.fillStyle = '#4a5a6e'; x.fillRect(0, 6, 34, 22); x.fillStyle = '#5a6a7e'; x.fillRect(0, 8, 34, 6); x.fillStyle = '#e8e0c8'; x.fillRect(30, 6, 4, 22); x.fillStyle = '#e8bc94'; x.fillRect(34, 10, 16, 14); x.fillRect(50, 12, 10, 3); x.fillRect(50, 16, 11, 3); x.fillRect(50, 20, 9, 3); x.fillRect(40, 6, 10, 4); x.fillStyle = '#c89a74'; x.fillRect(34, 22, 16, 2); x.fillRect(50, 15, 10, 1); x.fillRect(50, 19, 10, 1); x.fillStyle = '#a87a5a'; x.fillRect(36, 13, 5, 1); });
  const hm = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.85), lam({ map: (() => { const t = new THREE.CanvasTexture(hand); t.magFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace; return t; })(), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); hm.rotation.x = -Math.PI / 2; hm.position.set(-1.5, 0.22, 0.3); hm.castShadow = true; D.add(hm);
  D.triggers.fold = (instant, k = 1) => { pb.material.map = frames[k]; if (k === 2) { pb.rotation.x = -0.75; pb.position.y = 0.3; } };
  D.triggers.handIn = (instant) => { if (instant) { hm.position.x = -0.85; return; } let t = 0; D.tick((dt) => { if (t > 1) return; t += dt; hm.position.x = -1.5 + Math.min(1, t) * 0.65; }); };
  D.triggers.dim = (instant) => { let t = 0; D.tick((dt) => { t += dt; l.intensity = Math.max(0.6, 5 - t * 2); }); };
}
crane.mood = 'close';

export const SETS = { map, ferry, exterior, bridge, hall, upstairs, veranda, kitchen, rooftop, crane };
