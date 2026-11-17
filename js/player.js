// The player: runs a chapter's beats in order on the HD-2D stage. Set-up beats happen at once; lines, cards, poems,
// clues, waits and deductions hold the story until the reader goes on (or Auto/Skip move on by themselves). It can
// jump to any beat by rebuilding the last set before it and replaying what came after instantly, which is how
// chapter select, Continue and the test hooks work.
import { THREE, prefillLooks } from './render.js?v=3';
import { Diorama } from './scene.js?v=3';
import { SETS } from './sets.js?v=3';
import './sets2.js?v=3';
import './beasts.js?v=3';
import { Actor } from './actors.js?v=3';
import { Rain, Effects } from './fx.js?v=3';
import { BOOKS } from './books.js?v=3';
import { Fx2 } from './fx2.js?v=3';
import { runAct } from './fightrun.js?v=3';
import { POEMS, CLUES, ASKS, callId } from './data.js?v=3';
import * as AU from './audio.js?v=3';
import { UI } from './ui.js?v=3';

const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 0.5 - Math.cos(t * Math.PI) / 2);
const CAMKEYS = ['x', 'y', 'z', 'd', 'yaw', 'pitch', 'fov'];
const PREFS = 'longmenCase.prefs';

export class Player {
  constructor(V) {
    this.V = V; this.D = new Diorama(V); this.rain = new Rain(V.scene); this.fx = new Effects(V.scene); this.fx2 = new Fx2(V.scene, V); this.D.fx2 = this.fx2; this.actors = new Map(); this.book = BOOKS[0]; this.hitstop = 0; this.rtimers = []; this.paused = false;
    this.ch = 0; this.i = 0; this.block = null; this.auto = false; this.skip = false; this.forceSkip = false; this.textSpeed = 1; this.speed = 1;
    this.slow = 1; this.slowTo = 1; this.gt = 0; this.freeze = false; this.flashback = 0; this.fadeV = 0; this.fade = null; this.timers = [];
    this.cam = { cur: { x: 0, y: 1.5, z: 0, d: 18, yaw: 0, pitch: 20, fov: 30 }, from: null, to: null, t: 0, dur: 0, shake: 0, ts: [0.5, 0.17, 2.2] };
    this.clues = new Set(); this.read = {}; this.reached = 0; this.log = []; this.vox = {}; this.playing = false; this.nextBolt = 8; this.music = null;
    this.tmp = new THREE.Vector3();
    this.loadSave();
  }
  async loadVoices() { try { const r = await fetch('audio/voices.json'); if (r.ok) this.vox = await r.json(); } catch (e) { this.vox = {}; } }
  // ------------------------------------------------------------ saving
  // each book keeps its own progress; the language, volumes and text speed are shared
  loadSave() {
    this.saved = null; this.read = {}; this.reached = 0;
    try { const s = JSON.parse(localStorage.getItem(this.book.save) || 'null'); if (s) { this.saved = s; this.read = s.read || {}; this.reached = s.reached || 0; } } catch (e) { this.saved = null; }
    try { const q = JSON.parse(localStorage.getItem(PREFS) || 'null') || (this.book.id === 1 ? this.saved : null) || JSON.parse(localStorage.getItem(BOOKS[0].save) || 'null'); if (q) { if (q.lang) UI.setLang(q.lang); if (q.vol) for (const k in q.vol) AU.setVolume(k, q.vol[k]); if (q.textSpeed) this.textSpeed = q.textSpeed; } } catch (e) { /* none */ }
  }
  save() { try { const s = { ch: this.ch, i: Math.max(0, this.i - 1), clues: [...this.clues], read: this.read, reached: this.reached, lang: UI.lang, vol: AU.AU.vol, textSpeed: this.textSpeed }; localStorage.setItem(this.book.save, JSON.stringify(s)); localStorage.setItem(PREFS, JSON.stringify({ lang: UI.lang, vol: AU.AU.vol, textSpeed: this.textSpeed })); this.saved = s; } catch (e) { /* private mode: no saving */ } }
  setBook(k) {
    const b = BOOKS.find((x) => x.id === k) || BOOKS[0]; this.book = b; this.watch = !!b.watch; this.ch = 0; this.i = 0; this.ended = false; this.loadSave();
    this.V.tiltScale = this.watch ? 0.3 : 1; this.V.tiltBand = this.watch ? 0.3 : 0; UI.setWatch(this.watch); if (this.watch) this.auto = true;
  }
  get chapters() { return this.book.chapters; }
  get chapter() { return this.chapters[this.ch]; }
  // ------------------------------------------------------------ jumping
  start(ch = 0, i = 0) { this.playing = true; UI.title(false); this.jump(ch, i); }
  jump(ch, idx = 0) {
    this.clearUI(); this.block = null; this.ch = ch; this.slow = this.slowTo = 1; this.hitstop = 0; this.rtimers = []; this.paused = false; UI.paused(false); this.cam.follow = null; this.V.grade.uniforms.bars.value = 0; this.V.grade.uniforms.speed.value = 0; this.V.grade.uniforms.impact.value = 0; this.freeze = false; this.flashback = 0; this.setFade(0); this.fade = null; this.timers = [];
    this.clues = new Set(); for (let c = 0; c < ch; c++) for (const b of this.chapters[c].beats) if (b.k === 'clue') this.clues.add(b.id);
    const beats = this.chapters[ch].beats; idx = Math.max(0, Math.min(idx, beats.length - 1));
    let s = 0; for (let k = idx; k >= 0; k--) if (beats[k].k === 'set') { s = k; break; }
    let mus = this.music;
    for (let k = 0; k < s; k++) { const b = beats[k]; if (b.k === 'clue') this.clues.add(b.id); if (b.k === 'music') mus = b.track; if (b.k === 'flashback') this.flashback = b.on; if (b.k === 'fight') for (const a of b.acts) if (a && a.k === 'music') mus = a.track; }
    this.fast = true; this.musicPick = mus;
    for (let k = s; k < idx; k++) this.exec(beats[k]);
    this.fast = false; this.i = idx; this.reached = Math.max(this.reached, ch);
    AU.music(this.musicPick); this.music = this.musicPick; this.applyFlashback();
    this.step();
  }
  // ------------------------------------------------------------ running beats
  step() {
    let guard = 0;
    while (!this.block && this.playing && guard++ < 5000) {
      const beats = this.chapter.beats;
      if (this.i >= beats.length) { if (this.ch + 1 < this.chapters.length) { this.ch++; this.i = 0; this.reached = Math.max(this.reached, this.ch); this.save(); continue; } this.finish(); return; }
      const b = beats[this.i++]; this.exec(b);
    }
  }
  finish() { this.playing = false; this.ended = true; this.save(); this.onEnd?.(); }
  actor(id) { return this.actors.get(id); }
  pos(p) { if (typeof p === 'string') { const m = this.D.marks[p]; return m ? [m[0], m[1], m[2]] : [0, 0, 1]; } return p; }
  chest(id, up = 0.62) { const a = this.actor(id); if (!a) return new THREE.Vector3(0, 1.5, 0); return new THREE.Vector3(a.x + (a.bird ? 0 : 0.35 * a.face), a.y + a.head * up, a.z + 0.05); }
  point(p) { if (Array.isArray(p)) return new THREE.Vector3(...p); return this.chest(p); }
  exec(b) {
    const F = this.fast;
    switch (b.k) {
      case 'set': return this.buildSet(b.set, b);
      case 'actor': {
        let a = this.actor(b.id); const [x, z, mf] = this.pos(b.pos);
        if (!a) { a = new Actor(this.V.scene, b.id, b.look || b.id); this.actors.set(b.id, a); } else if (b.look && b.look !== a.lookKey && !a.bird) a.setLook(b.look);
        a.show(true); a.jump(x, z); a.yo = b.y || 0; a.y = this.D.floorAt(x, z) + a.yo; a.setFace(b.f || mf || 1); a.pose(b.a || 'stand'); a.setEmote(null); return;
      }
      case 'move': { const a = this.actor(b.id); if (!a) return; const [x, z] = this.pos(b.pos); if (F) { a.jump(x, z); a.y = this.D.floorAt(x, z) + a.yo; if (b.f) a.setFace(b.f); else if (Math.abs(x - a.x) > 0.05) a.setFace(Math.sign(x - a.x)); } else a.walkTo(x, z, { run: b.run, face: b.f }); return; }
      case 'pose': { const a = this.actor(b.id); if (a) a.pose(b.a); return; }
      case 'face': { const a = this.actor(b.id); if (a) a.setFace(b.f); return; }
      case 'emote': { if (F) return; const a = this.actor(b.id); if (a) a.setEmote(b.e); return; }
      case 'look': { const a = this.actor(b.id); if (a && !a.bird) a.setLook(b.look); return; }
      case 'hide': { const a = this.actor(b.id); if (a) a.show(false); return; }
      case 'juggle': { const a = this.actor(b.id); if (a) a.juggle(!!b.on); return; }
      case 'cam': return this.camTo(b, F ? 0 : b.t);
      case 'cu': case 'two': this.camTo(this.shotFor(b), F ? 0 : b.t); this.cam.focus = b.k === 'cu' ? [b.id] : [b.a, b.b]; return;
      case 'line': if (F) { this.markRead(); return; } return this.showLine(b);
      case 'title': if (F) return; this.block = { k: 'card', dur: b.sub ? 4.2 : 3.2, min: 1 }; UI.card('big', b.zh, b.en, b.sub); AU.sfx('gong'); UI.hideBox(); return;
      case 'card': if (F) return; this.block = { k: 'card', dur: 2.4, min: 0.6 }; UI.card('small', b.zh, b.en); AU.sfx('clap'); return;
      case 'poem': if (F) return; return this.showPoem(b.id);
      case 'clue': this.clues.add(b.id); if (F) return; this.block = { k: 'clue', dur: 5, min: 0.8, needClick: true }; UI.cluePop(b.id); AU.sfx('clue'); UI.hideBox(); return;
      case 'ask': if (F) return; return this.showAsk(b.id);
      case 'callout': if (F) return; return this.showCallout(b);
      case 'fx': if (F) return; return this.doFx(b);
      case 'trig': return this.D.trigger(b.ev, F, b.arg);
      case 'wait': if (F) return; this.block = { k: 'wait', s: b.s, gt: 0 }; return;
      case 'music': if (F) { this.musicPick = b.track; return; } AU.music(b.track); this.music = b.track; return;
      case 'sfx': if (!F) AU.sfx(b.name); return;
      case 'rain': this.rain.set(b.v); AU.setAmbience(b.v, this.D.water ? 1 : 0); return;
      case 'slow': if (!F) this.slowTo = b.v; else this.slow = this.slowTo = 1; return;
      case 'tags': this.tagsOn = !!b.on && !F; if (!b.on) UI.tags(null); return;
      case 'flashback': this.flashback = b.on; if (!F) this.applyFlashback(); return;
      case 'fade': if (F || !b.t) { this.setFade(b.v); return; } this.fade = { from: this.fadeV, to: b.v, t: 0, dur: b.t }; if (b.v > this.fadeV) this.block = { k: 'fade', dur: b.t }; return;
      case 'end': if (F) return; this.block = { k: 'end' }; this.finish(); return;
      case 'fight': if (F) { for (const a of b.acts) if (typeof a !== 'number') runAct(this, a, true); return; } this.block = { k: 'fight', acts: b.acts, i: 0, wait: 0 }; return;
      case 'flakes': this.fx2.setFlakes(b.o); return;
      default: return;
    }
  }
  buildSet(name, b) {
    for (const a of this.actors.values()) a.dispose(); this.actors.clear(); this.fx.clear(); this.fx2.clear(); UI.tags(null); this.tagsOn = false; this.cam.follow = null;
    this.D.build(name, SETS[name], { ...b });
    this.rain.set(this.D.rain); this.rain.floor = this.D.floorAt; AU.setAmbience(this.D.rain, this.D.river ?? (this.D.water ? 1 : 0));
    this.camTo(this.D.cam0, 0); this.cam.ts = [0.5, 0.17, 2.2]; this.nextBolt = 3 + Math.random() * 6; this.applyFlashback();
    if (this.D.flakes) this.fx2.setFlakes(this.D.flakes); if (this.D.birds) this.fx2.setBirds(this.D.birds.n, this.D.birds);
  }
  applyFlashback() { const g = this.V.grade.uniforms; g.sepia.value = this.flashback ? 0.85 : 0; g.vig.value = this.flashback ? 1.1 : 0.55; UI.flashTag(this.flashback && this.playing); }
  setFade(v) { this.fadeV = v; this.V.grade.uniforms.fade.value = v; }
  markRead() { const id = this.chapter.id; this.read[id] = Math.max(this.read[id] || 0, this.i); }
  // ------------------------------------------------------------ the camera
  shotFor(b) {
    if (b.k === 'cu') { const a = this.actor(b.id); if (!a) return { ...this.cam.cur }; const kid = a.L?.kid; return { x: a.x + (b.dx || 0), y: a.y + a.head * 0.8 + (b.dy || 0), z: a.z, d: b.d || (this.watch ? (kid ? 6.6 : 7.4) : kid ? 7.6 : 8.6), yaw: b.yaw ?? -a.face * 6, pitch: b.pitch ?? 7, fov: 30, ts: [0.5, 0.12, 2.6] }; }
    const A = this.actor(b.a), B = this.actor(b.b); if (!A || !B) return { ...this.cam.cur };
    const dist = Math.hypot(A.x - B.x, A.z - B.z), W = this.watch; return { x: (A.x + B.x) / 2, y: (A.y + A.head * (W ? 0.6 : 0.72) + B.y + B.head * (W ? 0.6 : 0.72)) / 2, z: (A.z + B.z) / 2, d: W ? Math.max(8.5, dist * 1.25 + 5.2) : Math.max(10.5, dist * 1.4 + 7.5), yaw: b.yaw ?? 0, pitch: b.pitch ?? 9, fov: 30, ts: [0.5, 0.14, 2.4] };
  }
  camTo(o, t) {
    this.cam.focus = null; const to = {}; for (const k of CAMKEYS) to[k] = o[k] ?? this.cam.cur[k]; if (o.fov == null) to.fov = 30;
    this.cam.ts = o.ts || [0.5, 0.17, 2.2];
    if (!t) { this.cam.cur = to; this.cam.from = null; return; }
    this.cam.from = { ...this.cam.cur }; this.cam.to = to; this.cam.t = 0; this.cam.dur = t;
  }
  applyCam(dt) {
    const C = this.cam; if (C.from) { C.t += dt; const u = Math.min(1, C.t / C.dur), k = C.ease === 'lin' ? u : C.ease === 'out' ? 1 - (1 - u) ** 3 : C.ease === 'in' ? u * u * u : ease(u); for (const key of CAMKEYS) C.cur[key] = C.from[key] + (C.to[key] - C.from[key]) * k; if (C.t >= C.dur) C.from = null; }
    if (C.follow) { const a = this.actor(C.follow.id); if (a) { const kk = Math.min(1, dt * C.follow.k); C.cur.x += (a.x + C.follow.dx - C.cur.x) * kk; C.cur.z += (a.z + C.follow.dz - C.cur.z) * kk; C.cur.y += (a.y + (a.air || 0) * 0.6 + C.follow.dy - C.cur.y) * kk; } }
    const c = C.cur, cam = this.V.camera, w = this.V.renderer.domElement.clientWidth || 16, h = this.V.renderer.domElement.clientHeight || 9, asp = w / h;
    // keep what a 16:9 frame shows across: a narrower screen widens the lens (to a point) and steps back
    let fov = c.fov, d = c.d; const ref = asp < 1 ? 1.2 : 16 / 9; if (asp < ref) { const hf = Math.atan(Math.tan((fov * Math.PI) / 360) * ref); let vf = Math.atan(Math.tan(hf) / asp); const cap = (54 * Math.PI) / 360; if (vf > cap) { d *= Math.tan(vf) / Math.tan(cap); vf = cap; } fov = (vf * 360) / Math.PI; }
    const yaw = (c.yaw * Math.PI) / 180, pitch = (c.pitch * Math.PI) / 180;
    let sx = 0, sy = 0; if (C.shake > 0) { C.shake = Math.max(0, C.shake - dt * 1.6); sx = (Math.random() - 0.5) * C.shake; sy = (Math.random() - 0.5) * C.shake; }
    cam.position.set(c.x + Math.sin(yaw) * Math.cos(pitch) * d + sx, c.y + Math.sin(pitch) * d + sy, c.z + Math.cos(yaw) * Math.cos(pitch) * d);
    cam.lookAt(c.x + sx * 0.5, c.y + sy * 0.5, c.z); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    this.V.tilt(C.ts[0], C.ts[1], C.ts[2]);
    return { yawR: yaw, pitchR: pitch };
  }
  // ------------------------------------------------------------ lines
  showLine(b) {
    const text = UI.t(b.zh, b.en); const a = this.actor(b.who);
    if (b.a && a) a.pose(b.a); if (b.e && a) a.setEmote(b.e);
    if (b.cu && a) { this.camTo(this.shotFor({ k: 'cu', id: b.who }), 0.9); this.cam.focus = [b.who]; }
    const read = (this.read[this.chapter.id] || 0) >= this.i;
    this.block = { k: 'line', b, text, shown: 0, t: 0, read, voice: null, vt: 0 };
    UI.line(b.who === 'voice' ? 'voice' : b.who, '', b.who === 'narr'); this.markRead();
    if (this.watch) { this.block.shown = text.length; UI.setText(text, true); }
    this.log.push({ who: b.who, zh: b.zh, en: b.en, vid: b.vid }); if (this.log.length > 300) this.log.shift();
    const skipping = this.skip && (read || this.forceSkip) || this.forceSkip;
    if (!skipping) this.playVoice(b.vid + '.mp3', b);
    if (b.who === 'bird' || b.voice === 'bird') { const bird = this.actor('bird'); if (bird) bird.squawk = 1.4; }
    this.save();
  }
  playVoice(file, b) { const d = this.vox[file]; if (!d) return; const el = AU.voice(file, 1); if (el && this.block) { this.block.voice = el; this.block.vdur = d; } }
  lineDone() { const B = this.block; return B && B.shown >= B.text.length; }
  // ------------------------------------------------------------ poems, move names, deductions
  showPoem(id) {
    const d = this.vox['poem_' + id + '.mp3'] || 0; const dur = Math.max(6.5, d + 1.6);
    this.block = { k: 'poem', id, dur, min: 1.2 }; this.freeze = true; UI.poem(id); UI.hideBox();
    const g = this.V.grade.uniforms; g.gray.value = 0.55; AU.sfx('clap');
    if (!(this.skip || this.forceSkip)) AU.voice('poem_' + id + '.mp3');
    this.block.step = (d || 5) / 4;
    const c = this.cam.cur; this.camTo({ ...c, d: c.d * 0.88, pitch: c.pitch - 2, ts: [0.5, 0.1, 3.2] }, dur);
  }
  endPoem() { this.freeze = false; this.V.grade.uniforms.gray.value = 0; UI.hidePoem(); AU.stopVoice(); }
  showCallout(b) {
    this.block = { k: 'callout', dur: 1.5, min: 0.5 }; UI.callout(b.zh, b.en); AU.sfx('whoosh'); this.V.grade.uniforms.flash.value = 0.35; this.flashT = 0.35;
    if (!(this.skip || this.forceSkip)) AU.voice(callId(b.id, b.zh) + '.mp3');
    const a = this.actor(b.id); if (a) this.camTo(this.shotFor({ k: 'cu', id: b.id, d: 7.5 }), 0.25);
  }
  showAsk(id) { this.block = { k: 'ask', id, tried: new Set(), stage: 'choose' }; UI.hideBox(); UI.ask(id, this.block.tried, (k) => this.pick(k)); }
  pick(k) {
    const B = this.block; if (!B || B.k !== 'ask' || B.stage !== 'choose') return; const o = ASKS[B.id].opts[k]; if (B.tried.has(k)) return;
    UI.hideAsk();
    if (o.ok) { AU.sfx('right'); this.V.grade.uniforms.flash.value = 0.3; this.flashT = 0.3; this.block = null; this.log.push({ who: 'narr', zh: '【推理】' + o.zh, en: '[Deduction] ' + o.en }); return; }
    AU.sfx('wrong'); B.tried.add(k); B.stage = 'reply';
    const text = UI.t(o.rz, o.re); B.line = { text, shown: 0, t: 0 }; UI.line(o.who, '', false);
    const a = this.actor(o.who); if (a) { this.camTo(this.shotFor({ k: 'cu', id: o.who }), 0.6); }
    this.playVoice('ask_' + B.id + '_' + k + '.mp3');
    this.log.push({ who: o.who, zh: o.rz, en: o.re });
  }
  // ------------------------------------------------------------ effects
  doFx(b) {
    const g = this.V.grade.uniforms;
    switch (b.fx) {
      case 'lightning': return this.lightning();
      case 'shake': this.cam.shake = Math.max(this.cam.shake, b.a || 0.3); return;
      case 'flash': g.flash.value = 0.8; g.flashColor.value.set(...new THREE.Color(b.color || '#ffffff').toArray()); this.flashT = 0.8; return;
      case 'ballTo': case 'ballFly': { const a = this.chest(b.from, 0.1), to = this.point(b.to); this.fx.ball(a, to, 0.45); AU.sfx('kick'); return; }
      case 'ball': { const a = this.chest(b.from, 0.2), to = this.point(b.to); this.fx.ball(a, to, 0.5); return; }
      case 'crescent': { const a = this.chest(b.from, 0.55); this.fx.crescent(a, this.point(b.to), b.dur || 0.45); return; }
      case 'palm': { const a = this.chest(b.from, 0.6); this.fx.palm(a, this.point(b.to), b.dur || 0.55); return; }
      case 'clash': { const p = this.point(b.at); this.fx.burst(p, '#fff0d0', 2.8); this.fx.ring(p, '#ffd0a0', 3.2); g.flash.value = 0.7; this.flashT = 0.7; return; }
      case 'chain': { const a = this.chest(b.from, 0.55), to = this.chest(b.to, 0.55); this.fx.chain(a, to, b.to); if (!b.stay) this.timers.push({ t: 1.4, f: () => this.fx.unbind(b.to) }); return; }
      case 'ink': { const a = this.chest(b.from, 0.6), to = this.chest(b.to, 0.6); this.fx.ink(a, to, b.n || 3); return; }
      case 'dart': { const a = this.chest(b.from, 0.62), to = this.chest(b.to, 0.7); this.fx.dart(a, to, 0.22); return; }
      case 'mark': { this.fx.mark(this.point(b.at)); return; }
      case 'hit': { const p = this.chest(b.on, 0.6); this.fx.burst(p, '#ffffff', 1.6); const a = this.actor(b.on); if (a && a.body) { a.body.flash(true); this.timers.push({ t: 0.12, f: () => a.body.flash(false) }); } AU.sfx('hit'); return; }
      default: return;
    }
  }
  lightning() {
    const D = this.D, g = this.V.grade.uniforms, outdoor = !!D.lightning;
    this.bolt = { t: 0, k: outdoor ? 1 : 0.4 };
    if (outdoor) { const c = this.cam.cur; this.fx.bolt(new THREE.Vector3(c.x + (Math.random() - 0.5) * 30, 14, c.z - 30), 26); }
    g.flashColor.value.set(0.85, 0.9, 1.0); setTimeout(() => AU.sfx('thunder', outdoor ? 1 : 0.6), 250 + Math.random() * 700);
  }
  // ------------------------------------------------------------ input
  advance() {
    const B = this.block; if (!B || UI.open && UI.open !== 'ask') return; if (this.paused) return;
    if (this.watch) { if (B.k === 'line') return this.endLine(); if (B.k === 'card' || B.k === 'poem') return this.endBlock(); return; }
    if (B.k === 'line') { if (!this.lineDone()) { B.shown = B.text.length; UI.setText(B.text, true); return; } return this.endLine(); }
    if (B.k === 'ask' && B.stage === 'reply') { const L = B.line; if (L.shown < L.text.length) { L.shown = L.text.length; UI.setText(L.text, true); return; } AU.stopVoice(); B.stage = 'choose'; UI.hideBox(); UI.ask(B.id, B.tried, (k) => this.pick(k)); return; }
    if ((B.k === 'card' || B.k === 'clue' || B.k === 'poem' || B.k === 'callout') && (B.t || 0) >= (B.min || 0)) return this.endBlock();
  }
  // the Skip button of a watched book: whatever holds the story now ends (a fight jumps to its end)
  skipLine() {
    const B = this.block; if (!B || this.paused) return;
    if (B.k === 'line') return this.endLine();
    if (B.k === 'fight') { for (let j = B.i; j < B.acts.length; j++) { const a = B.acts[j]; if (typeof a !== 'number') runAct(this, a, true); } this.slow = this.slowTo = 1; this.hitstop = 0; UI.hideCallout(); this.block = null; return; }
    if (B.k === 'wait' || B.k === 'fade') { if (this.fade) { this.setFade(this.fade.to); this.fade = null; } this.block = null; return; }
    return this.endBlock();
  }
  setPaused(on) { this.paused = on; UI.paused(on); AU.pauseVoice(on); }
  endLine() { const B = this.block; AU.stopVoice(); const a = this.actor(B.b.who); if (a) a.talking = false; this.block = null; if (!this.peekKeepsBox()) UI.hideBox(); }
  peekKeepsBox() { const n = this.chapter.beats[this.i]; return n && (n.k === 'line'); }
  endBlock() { const B = this.block; if (!B) return; if (B.k === 'card') UI.hideCard(); if (B.k === 'clue') UI.hideClue(); if (B.k === 'poem') this.endPoem(); if (B.k === 'callout') UI.hideCallout(); this.block = null; }
  clearUI() { UI.hideCard(); UI.hideClue(); UI.hidePoem(); UI.hideCallout(); UI.hideAsk(); UI.hideBox(); UI.tags(null); this.freeze = false; this.V.grade.uniforms.gray.value = 0; AU.stopVoice(); }
  // ------------------------------------------------------------ every frame
  update(dtReal) {
    if (this.paused) { this.applyCam(0); return; }
    const dt = Math.min(0.1, dtReal) * this.speed;
    this.slow += (this.slowTo - this.slow) * Math.min(1, dt * 10);
    let gdt = this.freeze ? 0 : dt * this.slow; if (this.hitstop > 0) { this.hitstop -= dt; gdt = 0; }
    for (const tm of this.rtimers) tm.t -= dt; { const due = this.rtimers.filter((t) => t.t <= 0); this.rtimers = this.rtimers.filter((t) => t.t > 0); due.forEach((t) => t.f()); } this.gt += gdt; this.D.t = this.gt;
    if (this.playing) this.tickBlock(dt, gdt);
    if (!this.block && this.playing) this.step();
    for (const tm of this.timers) tm.t -= gdt; const due = this.timers.filter((t) => t.t <= 0); this.timers = this.timers.filter((t) => t.t > 0); due.forEach((t) => t.f());
    // the light of the storm
    if (this.D.lightning && !this.freeze && this.playing) { this.nextBolt -= gdt; if (this.nextBolt <= 0) { this.nextBolt = 9 + Math.random() * 9; this.lightning(); } }
    const g = this.V.grade.uniforms;
    if (this.bolt) { const b = this.bolt; b.t += dt; const f = b.t < 0.08 ? 1 : b.t < 0.14 ? 0.2 : b.t < 0.22 ? 0.75 : Math.max(0, 0.75 - (b.t - 0.22) * 2.5); this.D.flash(f * b.k); g.flash.value = Math.max(g.flash.value, f * 0.22 * b.k); if (b.t > 0.6) { this.bolt = null; this.D.flash(0); } }
    if (this.flashT > 0) { this.flashT = Math.max(0, this.flashT - dt * 2.2); g.flash.value = this.flashT; } else if (!this.bolt) g.flash.value = 0;
    if (this.fade) { const f = this.fade; f.t += dt; this.setFade(f.from + (f.to - f.from) * ease(f.t / f.dur)); if (f.t >= f.dur) this.fade = null; }
    // the stage
    this.D.update(gdt, this.gt); const camInfo = this.applyCam(dt);
    const floor = this.D.floorAt;
    for (const a of this.actors.values()) a.update(gdt, camInfo, floor);
    this.hideOccluders();
    this.fx.update(gdt); this.fx.tickBinds(gdt); if (this.fx2.flakes) this.fx2.flakes.target = new THREE.Vector3(this.cam.cur.x, 0, this.cam.cur.z); this.fx2.update(gdt, camInfo.yawR);
    const tgt = this.tmp.set(this.cam.cur.x, this.cam.cur.y, this.cam.cur.z); this.rain.update(gdt, tgt);
    if (this.tagsOn) this.drawTags();
    prefillLooks(2);
  }
  tickBlock(dt, gdt) {
    const B = this.block; if (!B) return; B.t = (B.t || 0) + dt;
    if (B.k === 'fight') { B.wait -= gdt; let guard = 0; while (B.wait <= 0 && B.i < B.acts.length && guard++ < 400) { const a = B.acts[B.i++]; if (typeof a === 'number') B.wait += a; else runAct(this, a, false); } if (B.i >= B.acts.length && B.wait <= 0) this.block = null; else if (this.forceSkip) this.skipLine(); return; }
    if (this.watch) this.auto = true;
    const skipping = this.forceSkip || (this.skip && (B.read || B.k !== 'line'));
    if (B.k === 'line') {
      const cps = (UI.lang === 'en' ? 55 : 30) * this.textSpeed * (skipping ? 20 : 1);
      if (B.shown < B.text.length) { B.shown = Math.min(B.text.length, B.shown + dt * cps); UI.setText(B.text.slice(0, Math.floor(B.shown)), B.shown >= B.text.length); }
      const a = this.actor(B.b.who), speaking = B.voice ? AU.voicePlaying() : B.shown < B.text.length; if (a) a.talking = speaking;
      if (this.skip && !B.read && !this.forceSkip) { this.skip = false; UI.buttons(this.auto, this.skip); }
      if (skipping && B.t > 0.06) return this.endLine();
      if (this.auto && this.lineDone()) { const vEnd = B.voice ? !AU.voicePlaying() : true; B.wait = vEnd ? (B.wait || 0) + dt : 0; const need = B.voice ? 0.55 : 0.8 + B.text.length * (UI.lang === 'en' ? 0.03 : 0.07); if (B.wait >= need) this.endLine(); }
      return;
    }
    if (B.k === 'ask' && B.stage === 'reply') { const L = B.line; const cps = (UI.lang === 'en' ? 55 : 30) * this.textSpeed; if (L.shown < L.text.length) { L.shown = Math.min(L.text.length, L.shown + dt * cps); UI.setText(L.text.slice(0, Math.floor(L.shown)), L.shown >= L.text.length); } if ((this.auto || this.forceSkip) && L.shown >= L.text.length && !AU.voicePlaying()) { L.w = (L.w || 0) + dt; if (L.w > 0.8 || this.forceSkip) this.advance(); } return; }
    if (B.k === 'wait') { B.gt += gdt; if (B.gt >= B.s || skipping) this.block = null; return; }
    if (B.k === 'fade') { if (B.t >= B.dur || (skipping && B.t > 0.15)) { this.block = null; } return; }
    if (B.k === 'poem') { const k = Math.min(4, Math.floor((B.t - 0.3) / B.step) + 1); UI.poemReveal(skipping ? 4 : Math.max(0, k)); if (B.t >= B.dur || (skipping && B.t > 0.4)) this.endBlock(); return; }
    if (B.k === 'card' || B.k === 'callout') { if (B.t >= B.dur || (skipping && B.t > 0.3)) this.endBlock(); return; }
    if (B.k === 'clue') { if ((this.auto && B.t >= B.dur) || (skipping && B.t > 0.3)) this.endBlock(); return; }
  }
  // in a close shot, whoever stands between the camera and the people it is on steps out of the picture
  hideOccluders() {
    const f = this.cam.focus, cam = this.V.camera;
    for (const [id, a] of this.actors) {
      let hide = false;
      if (!f && a.visible) { const dA = cam.position.distanceTo(this.tmp.set(a.x, a.y + 1.4, a.z)); if (dA < Math.max(this.cam.cur.d * 0.62, Math.min(4.5, this.cam.cur.d - 1.5))) { this.tmp.set(a.x, a.y + 1.4, a.z).project(cam); if (Math.abs(this.tmp.x) < 1.1 && this.tmp.y > -1.6) hide = true; } }
      if (f && !f.includes(id) && a.visible) {
        const t = this.actor(f[0]); if (t) {
          const dA = cam.position.distanceTo(this.tmp.set(a.x, a.y + 1.4, a.z)), dT = cam.position.distanceTo(this.tmp.set(t.x, t.y + 1.4, t.z));
          if (dA < dT - 0.6) { this.tmp.set(a.x, a.y + 1.4, a.z).project(cam); if (Math.abs(this.tmp.x) < 0.95 && this.tmp.y < 1.1 && this.tmp.y > -1.8) hide = true; }
        }
      }
      if (a.occluded !== hide) { a.occluded = hide; const m = a.bird ? a.mesh : a.body.mesh; m.visible = a.visible && !hide; if (!a.bird) a.body.blob.visible = m.visible; }
    }
  }
  drawTags() {
    const cam = this.V.camera, w = this.V.renderer.domElement.clientWidth, h = this.V.renderer.domElement.clientHeight, v = this.tmp.clone(), list = [];
    for (const [id, a] of this.actors) { if (a.bird || !a.visible || id[0] === 'v') continue; v.set(a.x, a.y + a.head + 0.3, a.z).project(cam); list.push({ id, x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h }); }
    UI.tags(list);
  }
}
