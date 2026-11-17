// Boots the novel: the renderer, the title screen over 聽雨樓 in the rain, input (mouse, touch, keyboard, gamepad),
// the frame loop, and window.G for tests (jump to a chapter and line, step frames, run everything quickly).
import { createView } from './render.js?v=2';
import { Player } from './player.js?v=2';
import { UI } from './ui.js?v=2';
import * as AU from './audio.js?v=2';
import { BOOKS } from './books.js?v=2';
import { ASKS } from './data.js?v=2';

const $ = (s) => document.querySelector(s);
const V = createView($('#c'));
const P = new Player(V);
window.G = { P, V, UI, BOOKS };
let bookSel = 1;
try { bookSel = +(localStorage.getItem('longmenCase.book') || 1) === 2 ? 2 : 1; } catch (e) { bookSel = 1; }
P.setBook(bookSel);
UI.setLang(UI.lang);

// the title screen: the teahouse in the rain behind the logo
function titleScreen() {
  P.playing = false; P.clearUI(); P.block = null; P.flashback = 0; P.applyFlashback(); P.setFade(0); UI.flashTag(false); P.setPaused(false);
  const bk = P.book.title; P.buildSet(bk.set, { mood: bk.mood }); P.camTo(bk.cam[0], 0); P.camTo(bk.cam[1], 40);
  if (bk.flakes) P.fx2.setFlakes(bk.flakes);
  AU.music(bk.music); P.music = bk.music;
  UI.title(true, !!P.saved); UI.books(BOOKS, P.book.id);
}
function pickBook(k) { if (P.book.id === k) return; P.setBook(k); try { localStorage.setItem('longmenCase.book', String(k)); } catch (e) { /* no saving */ } titleScreen(); }
P.onEnd = () => setTimeout(() => { if (!P.playing) titleScreen(); }, 9000);

// ---- buttons
const act = {
  start: () => { AU.unlock(); P.read = P.read || {}; P.start(0, 0); },
  continue: () => { AU.unlock(); const s = P.saved; if (s) { P.start(s.ch || 0, s.i || 0); } },
  chapters: () => { AU.unlock(); UI.chapters(P.chapters, P.reached, P.ch, (k) => { UI.close(); P.start(k, 0); }); },
  book1: () => { AU.unlock(); pickBook(1); },
  book2: () => { AU.unlock(); pickBook(2); },
  pause: () => { if (P.playing) P.setPaused(!P.paused); },
  skipline: () => { if (P.playing) P.skipLine(); },
  lang: () => { UI.setLang(UI.lang === 'en' ? 'zh' : 'en'); if (UI.open === 'title') UI.books(BOOKS, P.book.id); const B = P.block; if (B && B.k === 'line') { B.text = UI.t(B.b.zh, B.b.en); B.shown = B.text.length; UI.setText(B.text, true); } P.save(); },
  auto: () => { P.auto = !P.auto; UI.buttons(P.auto, P.skip); },
  skip: () => { P.skip = !P.skip; UI.buttons(P.auto, P.skip); },
  log: () => UI.log(P.log.slice(-120), (e) => { if (e.vid && P.vox[e.vid + '.mp3']) AU.voice(e.vid + '.mp3'); }),
  book: () => UI.book(P.clues),
  menu: () => UI.menu(),
  title: () => { UI.close(); P.setPaused(false); titleScreen(); },
};
document.addEventListener('click', (e) => {
  AU.unlock();
  const b = e.target.closest('[data-act]'); if (b) { e.stopPropagation(); act[b.dataset.act]?.(); return; }
  if (e.target.closest('.x')) { UI.close(); return; }
  if (e.target.closest('.panel')) { if (e.target.closest('#cluepop')) P.advance(); return; }
  if (UI.open && UI.open !== 'ask' && UI.open !== 'title') { UI.close(); return; }
  if (P.playing) P.advance();
});
for (const [id, kind] of [['vMusic', 'music'], ['vSfx', 'sfx'], ['vVoice', 'voice']]) { const s = $('#' + id); s.value = AU.AU.vol[kind]; s.oninput = () => { AU.setVolume(kind, +s.value); P.save(); }; }
{ const s = $('#vText'); s.value = P.textSpeed; s.oninput = () => { P.textSpeed = +s.value; P.save(); }; }

// ---- keyboard
document.addEventListener('keydown', (e) => {
  AU.unlock(); if (e.key === 'Control') { P.forceSkip = true; return; }
  if (UI.open && UI.open !== 'title' && UI.open !== 'ask' && (e.key === 'Escape' || e.key === 'Backspace')) { UI.close(); return; }
  if (UI.open === 'ask' || UI.open === 'chapters' || UI.open === 'title' || UI.open === 'book') {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { UI.moveSel(1); e.preventDefault(); return; }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { UI.moveSel(-1); e.preventDefault(); return; }
    if (e.key === 'Enter' || e.key === ' ') { if (UI.open !== 'book') UI.pressSel(); else UI.close(); e.preventDefault(); return; }
    if (UI.open === 'ask' && /^[1-4]$/.test(e.key)) { P.pick(+e.key - 1); return; }
    if (UI.open !== 'ask') return;
  }
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (UI.open && UI.open !== 'ask') UI.close(); else if (P.playing) P.advance(); return; }
  const k = e.key.toLowerCase();
  if (P.watch) { if (k === 'p') act.pause(); else if (k === 's') act.skipline(); else if (k === 'l') act.log(); else if (e.key === 'Escape') act.menu(); return; }
  if (k === 'a') act.auto(); else if (k === 's') act.skip(); else if (k === 'l') act.log(); else if (k === 'c') act.book(); else if (e.key === 'Escape') act.menu();
});
document.addEventListener('keyup', (e) => { if (e.key === 'Control') P.forceSkip = false; });

// ---- gamepad: A next/confirm, B close, X auto, Y casebook, LB skip, Start menu, d-pad to choose
const pad = { prev: [] };
function pollPad() {
  const gp = navigator.getGamepads ? [...navigator.getGamepads()].find((g) => g) : null; if (!gp) return;
  const now = gp.buttons.map((b) => b.pressed), was = pad.prev, hit = (i) => now[i] && !was[i]; pad.prev = now;
  const ax = gp.axes[1] || 0, axHit = ax > 0.6 && !(pad.ay > 0.6) ? 1 : ax < -0.6 && !(pad.ay < -0.6) ? -1 : 0; pad.ay = ax;
  if (now.some(Boolean)) AU.unlock();
  if (UI.open && UI.open !== 'title' && UI.open !== 'ask' && UI.open !== 'chapters' && (hit(1) || hit(0))) { UI.close(); return; }
  if (UI.open === 'ask' || UI.open === 'chapters' || UI.open === 'title') { if (hit(13) || axHit > 0) UI.moveSel(1); if (hit(12) || axHit < 0) UI.moveSel(-1); if (hit(0)) UI.pressSel(); if (hit(1) && UI.open === 'chapters') UI.close(); if (UI.open !== 'ask') return; }
  if (hit(0) && P.playing) P.advance();
  if (P.watch) { if (hit(2)) act.pause(); if (hit(4)) act.skipline(); if (hit(9)) act.menu(); if (hit(8)) act.log(); return; }
  if (hit(2)) act.auto(); if (hit(3)) act.book(); if (hit(4)) act.skip(); if (hit(9)) act.menu(); if (hit(8)) act.log();
  P.forceSkip = !!now[5];
}

// ---- the loop
let last = performance.now();
G.render = true;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  pollPad(); if (!G.hold) P.update(dt); if (G.render) V.render();
  requestAnimationFrame(frame);
}
// ---- test hooks
Object.assign(G, {
  jump: (ch, i = 0) => { AU.unlock(); P.start(ch, i); },
  // advance the simulation by s seconds in 1/30 steps, then draw once
  step: (s = 1) => { const n = Math.round(s * 30); for (let k = 0; k < n; k++) P.update(1 / 30); V.render(); },
  // skip through every chapter: each beat at once, answering the deductions wrong first and then right
  book: (k) => { P.setBook(k); titleScreen(); },
  runAll: () => { const errs = []; P.playing = true; UI.title(false); for (let c = 0; c < P.chapters.length; c++) { P.jump(c, 0); let guard = 0; while (P.ch === c && P.playing && guard++ < 20000) { const B = P.block; if (B && B.k === 'fight') { P.skipLine(); } else if (B && B.k === 'ask') { const k = ASKS[B.id].opts.findIndex((o) => o.ok); if (B.stage === 'reply') P.advance(); else { const w = ASKS[B.id].opts.findIndex((o, j) => !o.ok && !B.tried.has(j)); P.pick(w >= 0 && B.tried.size < 1 ? w : k); } } else if (B) { P.block = null; P.clearUI(); } P.update(1 / 30); } } return { ch: P.ch, i: P.i, ended: !!P.ended }; },
  find: (ch, pred) => P.chapters[ch].beats.findIndex(pred),
  beats: (ch) => P.chapters[ch].beats.length,
});
P.loadVoices().then(() => {
  titleScreen();
  setTimeout(() => $('#loading').classList.add('gone'), 300);
  requestAnimationFrame(frame);
  G.ready = true;
});
