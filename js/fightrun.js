// Runs one action of a fight timeline (fight.js) on the player. fast = we are jumping past it: only where people
// end up, how they stand, the camera and the set's state are applied; nothing is seen or heard.
import { THREE } from './render.js?v=3';
import * as AU from './audio.js?v=3';
import { UI } from './ui.js?v=3';
import { callId } from './data.js?v=3';

const V3 = THREE.Vector3;
export function point(P, at, up = 0.62) {
  if (at == null) return new V3(P.cam.cur.x, P.cam.cur.y, P.cam.cur.z);
  if (typeof at === 'string') { const a = P.actor(at); if (!a) return new V3(0, 1.4, 0); return new V3(a.x + (a.bird ? 0 : 0.3 * a.face), a.y + (a.air || 0) + a.head * up, a.z + 0.05); }
  if (Array.isArray(at)) return at.length === 2 ? new V3(at[0], P.D.floorAt(at[0], at[1]) + 1.2, at[1]) : new V3(...at);
  if (at.id) { const p = point(P, at.id, at.up ?? up); p.x += (at.dx || 0) * (P.actor(at.id)?.face || 1); p.y += at.dy || 0; p.z += at.dz || 0; return p; }
  return new V3(0, 1.4, 0);
}
const feet = (P, a) => new V3(a.x, P.D.floorAt(a.x, a.z), a.z);
const rt = (P, s, f) => P.rtimers.push({ t: s, f });

export function runAct(P, a, fast) {
  const A = a.id ? P.actor(a.id) : null, fx = P.fx2, g = P.V.grade.uniforms;
  const endPose = (ac, name) => { if (ac && name) ac.pose(name, { force: 1 }); };
  switch (a.k) {
    case 'at': if (!A) return; A.jump(a.pos[0], a.pos[1]); A.air = a.air || 0; if (a.f) A.setFace(a.f); if (a.a) A.pose(a.a, { force: 1 }); return;
    case 'pose': if (!A) return; if (fast) { A.pose(a.then || a.a, { force: 1 }); return; } A.pose(a.a, { once: a.once, then: a.then, hold: a.hold, force: 1 }); return;
    case 'face': A?.setFace(a.f); return;
    case 'look': if (A && !A.bird) A.setLook(a.look); return;
    case 'hide': A?.show(false); return;
    case 'walk': if (!A) return; if (fast) { A.jump(a.to[0], a.to[1]); if (a.f) A.setFace(a.f); return; } A.walkTo(a.to[0], a.to[1], { run: a.run, face: a.f, speed: a.speed }); return;
    case 'dash': case 'leap': case 'fly': case 'skid': {
      if (!A) return; const last = a.then || a.land || (a.k === 'fly' ? 'down' : a.k === 'leap' ? 'land' : null);
      if (fast) { A.jump(a.to[0], a.to[1]); A.air = a.air || 0; if (a.f) A.setFace(a.f); if (last) A.pose(a.k === 'leap' && !a.then && a.land == null ? 'stance' : last, { force: 1 }); return; }
      const f0 = feet(P, A), col = a.color || '#7aa8ff';
      if (a.k === 'dash') {
        A.pose(a.a || 'dash', { force: 1 }); if (a.dust !== 0) fx.dust(f0, 6, { speed: 2, vx: -A.face * 1.5, floor: f0.y }); if (a.sound !== 0) AU.sfx('dash');
        A.moveTo('dash', a.to[0], a.to[1], a.dur, { face: a.f, ease: a.ease, ghost: a.ghost === 0 ? null : (ac) => fx.ghost(ac.body, col, 0.22, 0.45), end: (ac) => { endPose(ac, a.then); if (a.dust !== 0) fx.dust(feet(P, ac), 4, { speed: 1.4, floor: feet(P, ac).y }); } });
      } else if (a.k === 'leap') {
        A.pose(a.a || 'tuck', { force: 1 }); fx.dust(f0, 6, { speed: 1.6, floor: f0.y }); AU.sfx('leap');
        A.moveTo('leap', a.to[0], a.to[1], a.dur, { face: a.f, h: a.h, spin: a.spin, air: a.air, ghost: a.ghost ? (ac) => fx.ghost(ac.body, col, 0.2, 0.4) : null, end: (ac) => { if (a.air) { endPose(ac, a.then || 'stance'); return; } const p = feet(P, ac); fx.dust(p, 10, { speed: 2.2, floor: p.y }); AU.sfx('land'); if (a.ring) fx.ring(p, { r: 2.4, floor: p.y, up: false }); if (a.land === 0) { endPose(ac, a.then || 'stance'); return; } ac.pose(a.land || 'land', { once: 1, then: a.then || 'stance', hold: 0.25, force: 1 }); } });
      } else if (a.k === 'fly') {
        A.pose(a.a || 'air', { force: 1 }); AU.sfx('whoosh');
        A.moveTo('fly', a.to[0], a.to[1], a.dur, { face: a.f, h: a.h, spin: a.spin, air: a.air, ghost: a.ghost ? (ac) => fx.ghost(ac.body, '#ffffff', 0.18, 0.35) : null, end: (ac) => { const p = feet(P, ac); if (a.air != null) { endPose(ac, last); return; } fx.dust(p, 14, { speed: 2.6, floor: p.y, size: 0.4 }); if (a.crack) fx.crack(p, { floor: p.y }); AU.sfx('thud'); P.cam.shake = Math.max(P.cam.shake, a.shake ?? 0.25); endPose(ac, last); } });
      } else {
        A.pose(a.a || 'skid', { force: 1 }); AU.sfx('skid'); fx.furrow(f0, new V3(a.to[0], f0.y, a.to[1]), { dur: a.dur, floor: f0.y });
        A.moveTo('skid', a.to[0], a.to[1], a.dur, { face: a.f || A.face, ghost: (ac) => { const p = feet(P, ac); fx.dust(p, 1, { speed: 0.8, size: 0.3, floor: p.y, up: 0.5 }); if (Math.random() < 0.5) fx.sparks.spawn(new V3(p.x, p.y + 0.05, p.z), new V3(-ac.face * 0.5 + (Math.random() - 0.5), 1.5, 0), { color: '#ffd8a0', life: 0.2 }); }, end: (ac) => endPose(ac, a.then || 'stance') });
      }
      return;
    }
    case 'arc': { if (fast || !A) return; fx.arc({ x: A.x, y: A.y + (A.air || 0), z: A.z, face: A.face }, a.kind, a); if (a.sound !== 0) AU.sfx(a.kind === 'thrust' ? 'thrust' : 'swing', a.heavy ? 1.4 : 1); fx.gust(new V3(A.x, A.y + 1.2, A.z), a.gust ?? 4, 5); return; }
    case 'qi': {
      if (fast) { for (const t of a.then || []) runAct(P, t, true); return; }
      const from = point(P, a.id, 0.55), to = typeof a.to === 'string' || a.to?.id ? point(P, a.to, 0.55) : Array.isArray(a.to) && a.to.length === 2 ? new V3(a.to[0], from.y, a.to[1]) : point(P, a.to);
      AU.sfx('qi'); fx.qi(from, to, { dur: a.dur || 0.45, color: a.color, core: a.core, s: a.s, floor: P.D.floorAt(from.x, from.z), ground: a.ground, end: () => { for (const t of a.then || []) runAct(P, t, false); } }); return;
    }
    case 'clang': {
      if (fast) return; const pa = point(P, a.a, 0.6), pb = point(P, a.b, 0.6), p = a.at ? point(P, a.at) : pa.clone().lerp(pb, 0.5); if (a.dy) p.y += a.dy;
      fx.sparkBurst(p, a.n || 26, { speed: a.speed || 8 }); P.fx.burst(p, '#fff4d8', a.big ? 1.5 : 1.1); AU.sfx('clang', a.big ? 1.3 : 1); P.hitstop = Math.max(P.hitstop, a.stop ?? 0.06); P.cam.shake = Math.max(P.cam.shake, a.shake ?? 0.12); g.flash.value = Math.max(g.flash.value, a.flash ?? 0.18); g.flashColor.value.set(1, 0.95, 0.85); P.flashT = Math.max(P.flashT || 0, a.flash ?? 0.18); fx.gust(p, 5, 5); return;
    }
    case 'hit': {
      if (fast || !A) return; const p = point(P, a.id, a.up ?? 0.48), k = a.p || 1;
      if (A.body) { A.body.flash(true); rt(P, 0.09, () => A.body.flash(false)); }
      P.fx.burst(p, a.color || '#ffffff', Math.min(1.5, 0.8 + k * 0.3)); fx.sparkBurst(p, 8 + k * 8, { speed: 5 + k * 2, color: a.color }); if (a.blood) fx.blood(p, new V3(-A.face, 0.3, 0), 10 + k * 4);
      AU.sfx('impact', k); P.hitstop = Math.max(P.hitstop, [0, 0.04, 0.08, 0.15][Math.min(3, k)]); P.cam.shake = Math.max(P.cam.shake, 0.1 + k * 0.12);
      if (k >= 3 || a.impact) { g.impact.value = a.impact || 1; rt(P, 0.06, () => { g.impact.value = 0; }); }
      if (a.ring) fx.ring(p, { r: 2 + k, floor: P.D.floorAt(A.x, A.z) }); return;
    }
    case 'stop': if (!fast) P.hitstop = Math.max(P.hitstop, a.s); return;
    case 'slow': if (fast) { P.slow = P.slowTo = 1; return; } P.slowTo = a.v; if (a.snap) P.slow = a.v; return;
    case 'shake': if (!fast) P.cam.shake = Math.max(P.cam.shake, a.a); return;
    case 'cam': P.camTo(a, fast ? 0 : a.t); P.cam.ease = a.ease || null; return;
    case 'cu': case 'two': P.camTo(P.shotFor(a), fast ? 0 : a.t); P.cam.ease = a.ease || null; return;
    case 'follow': P.cam.follow = a.id ? { id: a.id, dx: a.dx || 0, dy: a.dy ?? 1.4, dz: a.dz || 0, k: a.k2 || 6 } : null; return;
    case 'call': if (fast) return; UI.callout(a.zh, a.en, true); AU.sfx('callout'); g.flash.value = Math.max(g.flash.value, 0.3); P.flashT = Math.max(P.flashT || 0, 0.3); if (!(P.skip || P.forceSkip)) AU.voice(callId(a.id, a.zh) + '.mp3', 1, true); rt(P, a.dur || 1.5, () => UI.hideCallout()); return;
    case 'sfx': if (!fast) AU.sfx(a.name, a.arg); return;
    case 'ring': if (!fast) { const p = point(P, a.at); fx.ring(p, { ...a, floor: P.D.floorAt(p.x, p.z) }); } return;
    case 'crack': if (!fast) { const p = point(P, a.at); fx.crack(p, { ...a, floor: P.D.floorAt(p.x, p.z) }); } return;
    case 'dust': if (!fast) { const p = point(P, a.at); fx.dust(p, a.n || 10, { ...a, floor: P.D.floorAt(p.x, p.z) }); } return;
    case 'debris': if (!fast) { const p = point(P, a.at); fx.debris(p, a.n || 14, { ...a, floor: P.D.floorAt(p.x, p.z) }); } return;
    case 'sparks': if (!fast) fx.sparkBurst(point(P, a.at), a.n || 20, a); return;
    case 'gust': if (!fast) fx.gust(point(P, a.at), a.power || 6, a.radius || 7); return;
    case 'flash': if (!fast) { g.flash.value = a.v; g.flashColor.value.set(...new THREE.Color(a.color).toArray()); P.flashT = a.v; } return;
    case 'impact': if (!fast) { g.impact.value = a.v; rt(P, a.s, () => { g.impact.value = 0; }); } return;
    case 'speed': if (!fast) { g.speed.value = a.v; if (a.at) { const p = point(P, a.at).project(P.V.camera); g.spc.value.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5); } else g.spc.value.set(0.5, 0.5); rt(P, a.s, () => { g.speed.value = 0; }); } return;
    case 'trig': P.D.trigger(a.ev, fast, a.arg); return;
    case 'ball': if (!fast) { const from = point(P, a.from, 0.12), to = point(P, a.to, a.up ?? 0.6); P.fx.ball(from, to, a.dur || 0.42, () => { fx.sparkBurst(to, 14, { color: '#e8f4ff' }); }, a.ring || 1.1); AU.sfx('kick'); AU.sfx('whirl'); } return;
    case 'column': if (!fast) { const p = point(P, a.at); fx.column(p, { ...a, floor: P.D.floorAt(p.x, p.z) }); AU.sfx('heaven'); } return;
    case 'meridians': if (!fast && A) fx.meridians(A, a); return;
    case 'aura': if (!fast && A) fx.aura(A, a); return;
    case 'ghost': if (!fast && A?.body) fx.ghost(A.body, a.color || '#7aa8ff', a.life || 0.4, a.op || 0.55); return;
    case 'emote': if (!fast) A?.setEmote(a.e); return;
    case 'music': if (fast) { P.musicPick = a.track; return; } AU.music(a.track); P.music = a.track; return;
    case 'swell': if (!fast) AU.sfx('swell'); return;
    case 'bars': g.bars.value = a.v; return;
    case 'fn': if (!fast || a.fast) a.fn(P, fast); return;
    default: return;
  }
}
