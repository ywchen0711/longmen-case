// Pieces of choreography the fights of book two are made from. Each returns a list of fight actions (fight.js).
import { f } from '../fight.js?v=2';

export const POSE = { down: 'chop', up: 'rise', h: 'hslash', thrust: 'lunge', aerial: 'aerial', spin: 'spin', draw: 'after', big: 'chop' };
export const COL = { rui: '#8ac8ff', rui2: '#cfe8ff', li: '#ff2a3a', weng: '#c8ffe0', xd: '#ff9a8a', ape: '#ffffff', tian: '#ff5a3a' };

// a strike met by a parry: sparks between them, a tiny freeze
export const strikeParry = (a, b, kind = 'down', o = {}) => [
  f.hit1(a, POSE[kind], o.then || 'stance', o.hold ?? 0.3), 0.06, f.arc(a, kind, { color: o.color || COL.rui, s: o.s, heavy: o.heavy }),
  0.05, f.pose(b, o.block || 'parry', { once: 1, then: o.bthen || 'stance', hold: 0.35 }), f.clang(a, b, { big: o.big, stop: o.stop, dy: o.dy }), o.after ?? 0.22,
];
// a strike that lands: the one hit reels (o.fly: knocked flying to that spot)
export const strikeHit = (a, b, kind = 'down', p = 1, o = {}) => [
  f.hit1(a, POSE[kind], o.then || 'stance', o.hold ?? 0.35), 0.06, f.arc(a, kind, { color: o.color || COL.rui, s: o.s, heavy: p > 1 }),
  0.05, f.hit(b, p, { blood: o.blood, impact: o.impact }),
  o.fly ? f.fly(b, o.fly, o.flyT || 0.5, o.flyH ?? 1.1, { spin: o.spin || 0, land: o.land || 'down', crack: o.crack }) : f.pose(b, 'hurtB', { once: 1, then: o.bthen || 'stance', hold: 0.4 }),
  o.after ?? 0.25,
];
// a miss: the other slips aside (a short skid or a step back)
export const strikeMiss = (a, b, kind, dodgeTo, o = {}) => [
  f.hit1(a, POSE[kind], o.then || 'stance', 0.3), 0.04, f.skid(b, dodgeTo, 0.18, { a: o.dodge || 'stance', then: 'stance', f: o.f }), 0.02, f.arc(a, kind, { color: o.color || COL.rui }), o.after ?? 0.24,
];
