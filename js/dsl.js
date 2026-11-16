// The little language the story is written in. A chapter is a list of beats; the player runs them in order.
// Beats that set things up (a set, people, poses, the camera) run at once; lines, cards, choices and waits stop
// the player until the reader goes on (or Auto moves on by itself).
export const S = (set, o = {}) => ({ k: 'set', set, ...o });                       // build a set: o.mood, o.broken
export const A = (id, look, pos, o = {}) => ({ k: 'actor', id, look, pos, ...o });   // place someone: pos [x, z] or a mark; o.f face, o.a pose, o.y lift
export const M = (id, pos, o = {}) => ({ k: 'move', id, pos, ...o });               // walk (o.run) to pos; o.f face on arrival; o.wait blocks until there
export const P = (id, a) => ({ k: 'pose', id, a });
export const F = (id, f) => ({ k: 'face', id, f });
export const E = (id, e) => ({ k: 'emote', id, e });
export const LOOK = (id, look) => ({ k: 'look', id, look });
export const H = (id) => ({ k: 'hide', id });
export const JUGGLE = (id, on = 1) => ({ k: 'juggle', id, on });
export const C = (x, y, z, d, yaw = 0, pitch = 18, t = 2, o = {}) => ({ k: 'cam', x, y, z, d, yaw, pitch, t, ...o });   // look at (x,y,z) from distance d
export const CU = (id, t = 1.2, o = {}) => ({ k: 'cu', id, t, ...o });             // close on someone's face
export const TWO = (a, b, t = 1.4, o = {}) => ({ k: 'two', a, b, t, ...o });       // frame two people
export const L = (who, zh, en, o = {}) => ({ k: 'line', who, zh, en, ...o });     // a spoken line; o.f feeling, o.a pose, o.e emote, o.cu close-up
export const N = (zh, en, o = {}) => L('narr', zh, en, o);                          // the storyteller narrating
export const TITLE = (zh, en, sub) => ({ k: 'title', zh, en, sub });               // a chapter's big title card
export const CARD = (zh, en, o = {}) => ({ k: 'card', zh, en, ...o });             // a caption card (the hour, a place)
export const POEM = (id) => ({ k: 'poem', id });                                     // an entrance poem over a freeze-frame
export const CLUE = (id) => ({ k: 'clue', id });                                     // a clue goes into the casebook
export const ASK = (id) => ({ k: 'ask', id });                                       // a deduction: choose until right
export const MOVE = (id, zh, en) => ({ k: 'callout', id, zh, en });                 // a move's name, shouted across the screen
export const FX = (fx, o = {}) => ({ k: 'fx', fx, ...o });                          // lightning, sword qi, palm wind, a chain…
export const TRIG = (ev, arg) => ({ k: 'trig', ev, arg });                          // a set's own event (the bridge falls…)
export const W = (s) => ({ k: 'wait', s });
export const MUS = (track) => ({ k: 'music', track });
export const SND = (name) => ({ k: 'sfx', name });
export const RAIN = (v) => ({ k: 'rain', v });
export const SLOW = (v) => ({ k: 'slow', v });
export const TAGS = (on = 1) => ({ k: 'tags', on });
export const BACK = (on = 1) => ({ k: 'flashback', on });                          // the sepia of memory
export const FADE = (v, t = 0.8) => ({ k: 'fade', v, t });
export const END = () => ({ k: 'end' });
