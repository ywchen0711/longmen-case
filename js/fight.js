// Fight choreography for book two. A fight is one beat (FIGHT in the DSL) holding a timeline: numbers are waits in
// game seconds (slow motion stretches them, hit-stop freezes them) and objects are actions that happen at once:
// key poses, dashes, leaps, knock-backs, skids, slash arcs, sword qi, parries with sparks, hits with hit-stop and
// shake, camera cuts and moves, move-name callouts, sounds and set events. The player (player.js) runs it; jumping
// past a fight applies only where everyone ends up.
//
//   import { f } from '../fight.js';
//   FIGHT(f.cam(...), f.dash('yirui', [2, 0], 0.22), 0.22, f.pose('yirui', 'chop', { once: 1 }), f.arc('yirui', 'down'), f.clang('yirui', 'lihan'), 0.3, ...)
export const f = {
  at: (id, pos, o = {}) => ({ k: 'at', id, pos, ...o }),                          // put someone at [x, z] (o.f face, o.a pose, o.air height)
  pose: (id, a, o = {}) => ({ k: 'pose', id, a, ...o }),                          // o.once plays it once and holds; o.then goes on to another
  hit1: (id, a, then = 'stance', hold = 0.35) => ({ k: 'pose', id, a, once: 1, then, hold }),
  face: (id, fc) => ({ k: 'face', id, f: fc }),
  look: (id, look) => ({ k: 'look', id, look }),
  hide: (id) => ({ k: 'hide', id }),
  dash: (id, to, dur = 0.22, o = {}) => ({ k: 'dash', id, to, dur, ...o }),        // a burst of speed with afterimages and dust (o.a pose, o.then on arrival)
  run: (id, to, dur = 0.6, o = {}) => ({ k: 'dash', id, to, dur, a: 'runw', ghost: 0, ease: 'lin', ...o }),
  walk: (id, to, o = {}) => ({ k: 'walk', id, to, ...o }),
  leap: (id, to, dur = 0.5, h = 2, o = {}) => ({ k: 'leap', id, to, dur, h, ...o }),   // o.spin turns (1 = a somersault), o.a the pose in the air, o.land the pose after
  fly: (id, to, dur = 0.5, h = 1.2, o = {}) => ({ k: 'fly', id, to, dur, h, ...o }),   // knocked flying; lands in o.land (default 'down') with dust and shake
  skid: (id, to, dur = 0.4, o = {}) => ({ k: 'skid', id, to, dur, ...o }),         // pushed back on the feet, leaving furrows
  arc: (id, kind = 'down', o = {}) => ({ k: 'arc', id, kind, ...o }),
  qi: (id, to, o = {}) => ({ k: 'qi', id, to, ...o }),                            // sword qi from someone to a point or a person; o.then actions when it lands
  clang: (a, b, o = {}) => ({ k: 'clang', a, b, ...o }),                         // blades meet between a and b
  hit: (id, p = 1, o = {}) => ({ k: 'hit', id, p, ...o }),                         // a blow lands on id: p 1 light .. 3 huge
  stop: (s = 0.08) => ({ k: 'stop', s }),
  slow: (v = 1, o = {}) => ({ k: 'slow', v, ...o }),
  shake: (a = 0.3) => ({ k: 'shake', a }),
  cam: (x, y, z, d, yaw = 0, pitch = 10, t = 0, o = {}) => ({ k: 'cam', x, y, z, d, yaw, pitch, t, ...o }),
  cu: (id, t = 0, o = {}) => ({ k: 'cu', id, t, ...o }),
  two: (a, b, t = 0, o = {}) => ({ k: 'two', a, b, t, ...o }),
  follow: (id, o = {}) => ({ k: 'follow', id, ...o }),                           // the camera keeps id at its centre (id null: stop)
  call: (id, zh, en) => ({ k: 'call', id, zh, en }),                              // a move's name across the screen
  sfx: (name, arg) => ({ k: 'sfx', name, arg }),
  ring: (at, o = {}) => ({ k: 'ring', at, ...o }),
  crack: (at, o = {}) => ({ k: 'crack', at, ...o }),
  dust: (at, o = {}) => ({ k: 'dust', at, ...o }),
  debris: (at, o = {}) => ({ k: 'debris', at, ...o }),
  sparks: (at, o = {}) => ({ k: 'sparks', at, ...o }),
  gust: (at, o = {}) => ({ k: 'gust', at, ...o }),
  flash: (color = '#ffffff', v = 0.7) => ({ k: 'flash', color, v }),
  impact: (v = 1, s = 0.07) => ({ k: 'impact', v, s }),                           // a black-and-white impact frame
  speed: (v = 1, s = 0.4, at) => ({ k: 'speed', v, s, at }),                      // speed lines
  trig: (ev, arg) => ({ k: 'trig', ev, arg }),
  ball: (from, to, o = {}) => ({ k: 'ball', from, to, ...o }),
  column: (at, o = {}) => ({ k: 'column', at, ...o }),
  meridians: (id, o = {}) => ({ k: 'meridians', id, ...o }),
  aura: (id, o = {}) => ({ k: 'aura', id, ...o }),
  ghost: (id, o = {}) => ({ k: 'ghost', id, ...o }),
  emote: (id, e) => ({ k: 'emote', id, e }),
  music: (track) => ({ k: 'music', track }),
  swell: () => ({ k: 'swell' }),
  bars: (v = 0.1) => ({ k: 'bars', v }),
  fn: (fn, fast) => ({ k: 'fn', fn, fast }),
};
