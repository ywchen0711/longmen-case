// The people (and the myna bird) on a set: each stands on the set's floor as an upright pixel sprite that leans
// back toward the camera and turns with it, walks or runs to a spot, faces left or right, holds a pose, moves its
// mouth while it speaks, shows an emote over its head, and (奕碩) keeps a ball in the air.
import { THREE, Body, animLen, animDur, PX } from './render.js?v=1';
import { drawFrame, ANIMS } from './art.js?v=1';
import * as ART from './art.js?v=1';
import { LOOKS, lookOf } from './looks.js?v=1';
import { emote, ballTex } from './fx.js?v=1';

const headCache = new Map();
function headHeight(L) { if (headCache.has(L.key)) return headCache.get(L.key); drawFrame(L, ANIMS.stand[0].o); const h = (152 - ART.lastHead[1]) / 32; headCache.set(L.key, h); return h; }
// 白先生 always holds his clapper in his left hand: facing right, that is the far (back) hand; facing left, the near one
const LEFTY = { baixianX: ['baixianR', 'baixianL'] };

// the myna bird: a few frames drawn by hand
function birdCanvas(k) {
  const c = document.createElement('canvas'); c.width = 16; c.height = 14; const x = c.getContext('2d');
  const p = (col, rects) => { x.fillStyle = col; for (const r of rects) x.fillRect(...r); };
  const up = k === 2 ? -1 : 0;
  p('#141418', [[4, 5 + up, 7, 6], [3, 7, 2, 4], [9, 3 + up, 4, 4], [1, 8, 3, 2]]);
  p('#2a2a34', [[5, 6 + up, 4, 2], [10, 4 + up, 2, 1]]);
  p('#ffffff', [[6, 8, 3, 1]]);
  p('#f0c020', [[12, 5 + up, 3, 1], [11, 6 + up, 1, 2], [6, 11, 1, 2], [9, 11, 1, 2]]);
  if (k === 2) p('#f0c020', [[12, 7 + up, 3, 1]]), p('#3a0a0a', [[12, 6 + up, 2, 1]]);
  if (k === 1) p('#141418', [[9, 4, 4, 4]]), p('#f0c020', [[12, 6, 3, 1]]);
  p('#ffffff', [[11, 4 + up, 1, 1]]);
  if (k === 2) p('#141418', [[3, 3, 2, 2], [6, 2, 1, 2]]);
  return c;
}
const birdTex = [0, 1, 2].map((k) => { const t = new THREE.CanvasTexture(birdCanvas(k)); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace; return t; });

export class Actor {
  constructor(stage, id, look) {
    this.stage = stage; this.id = id; this.x = 0; this.z = 0; this.y = 0; this.yo = 0; this.face = 1; this.anim = 'stand'; this.rest = 'stand'; this.t = 0; this.fi = 0;
    this.move = null; this.talking = false; this.emo = null; this.ball = null; this.visible = true;
    if (look === 'bird') { this.bird = true; this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(16 * PX * 0.9, 14 * PX * 0.9), new THREE.MeshLambertMaterial({ map: birdTex[0], alphaTest: 0.5, side: THREE.DoubleSide, emissive: new THREE.Color('#303030'), emissiveMap: birdTex[0] })); this.mesh.geometry.translate(0, 7 * PX * 0.9, 0); this.mesh.castShadow = true; stage.add(this.mesh); this.head = 0.8; return; }
    this.setLook(look);
  }
  setLook(key) {
    this.lookKey = key; const L = this.resolve(); this.L = L;
    if (this.body) this.body.setLook(L); else { this.body = new Body(this.stage, L); this.body.mesh.rotation.order = 'YXZ'; }
    this.head = headHeight(L) + 0.25;
  }
  resolve() { const v = LEFTY[this.lookKey]; const k = v ? (this.face > 0 ? v[0] : v[1]) : this.lookKey; return LOOKS[k] || lookOf(k.split(':')[0], +(k.split(':')[1] || 1)); }
  setFace(f) { if (!f || f === this.face) return; this.face = f; if (LEFTY[this.lookKey]) { const L = this.resolve(); if (L !== this.L) { this.L = L; this.body.setLook(L); } } }
  pose(anim) { if (!ANIMS[anim]) anim = 'stand'; this.rest = anim; if (!this.move) { this.anim = anim; this.t = 0; this.fi = 0; } }
  walkTo(x, z, o = {}) { const dx = x - this.x; if (Math.abs(dx) > 0.05) this.setFace(Math.sign(dx)); this.move = { x, z, v: o.speed || (o.run ? 5.6 : 2.4), run: o.run, face: o.face }; this.anim = o.run ? 'run' : this.rest === 'cuffed' || this.rest === 'kneel' ? 'cuffwalk' : 'walk'; this.t = 0; this.fi = 0; }
  jump(x, z) { this.x = x; this.z = z; this.move = null; this.anim = this.rest; }
  show(v) { this.visible = v; this.occluded = false; if (this.bird) this.mesh.visible = v; else this.body.visible(v); if (this.ball) this.ball.visible = v; }
  setEmote(kind) { if (this.emo) { this.stage.remove(this.emo); this.emo = null; } if (kind) { this.emo = emote(kind); this.stage.add(this.emo); } }
  juggle(on) { if (on && !this.ball) { this.ball = new THREE.Sprite(new THREE.SpriteMaterial({ map: ballTex(), transparent: true, color: '#9a9a9a' })); this.ball.scale.set(0.42, 0.42, 1); this.stage.add(this.ball); this.ballT = 0; } else if (!on && this.ball) { this.stage.remove(this.ball); this.ball = null; } }
  update(dt, cam, floorAt) {
    if (this.move) {
      const m = this.move, dx = m.x - this.x, dz = m.z - this.z, d = Math.hypot(dx, dz), st = m.v * dt;
      if (d <= st) { this.x = m.x; this.z = m.z; this.move = null; this.anim = this.rest; this.t = 0; this.fi = 0; if (m.face) this.setFace(m.face); }
      else { this.x += (dx / d) * st; this.z += (dz / d) * st; }
    }
    this.y = floorAt(this.x, this.z) + this.yo;
    // the frame of the current animation; talking swaps a pose for its open-mouth twin
    let a = this.anim; if (this.talking && ANIMS[a + '~']) a = a + '~';
    if (this.bird) {
      this.t += dt; const k = this.squawk > 0 ? 2 : (Math.floor(this.t * 1.5) % 4 === 0 ? 1 : 0); if (this.squawk > 0) this.squawk -= dt;
      const tex = birdTex[k]; if (this.mesh.material.map !== tex) { this.mesh.material.map = tex; this.mesh.material.emissiveMap = tex; }
      this.mesh.position.set(this.x, this.y, this.z); this.mesh.rotation.y = cam.yawR; this.mesh.scale.x = this.face < 0 ? -1 : 1;
    } else {
      this.t += dt; const n = animLen(a); if (this.t > animDur(a, this.fi)) { this.t = 0; this.fi = (this.fi + 1) % n; }
      this.body.frame(a, this.fi % n, this.face);
      this.body.place(this.x, this.y, this.z, -cam.pitchR * 0.75); this.body.mesh.rotation.y = cam.yawR;
    }
    if (this.emo) { const e = this.emo; e.userData.age += dt; const k = Math.min(1, e.userData.age * 6); e.position.set(this.x + 0.25 * this.face, this.y + this.head + 0.45 + Math.sin(e.userData.age * 6) * 0.05, this.z); e.scale.setScalar(0.62 * (0.5 + 0.5 * k) * (e.userData.age < 0.15 ? 1.25 : 1)); if (e.userData.age > 2.6) this.setEmote(null); }
    if (this.ball) { this.ballT += dt; const h = Math.abs(Math.sin(this.ballT * 3.2)); this.ball.position.set(this.x + 0.5 * this.face, this.y + 0.25 + h * 1.6, this.z + 0.05); this.ball.material.rotation += dt * 6; }
  }
  dispose() { if (this.bird) this.stage.remove(this.mesh); else this.body.dispose(); this.setEmote(null); this.juggle(false); }
}
