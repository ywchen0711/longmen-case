// Sound: music (Ninja Adventure, CC0) cross-faded between scenes, the rain and the river as filtered noise, the
// effects synthesised on the spot (thunder, the storyteller's clapper, knocks, a door broken in, a blade, palm wind,
// a chain, darts, a gong for the chapter cards, chimes for clues), and the recorded voices of the lines.
let ctx = null, master, musicGain, sfxGain, voiceGain, ambGain, noiseBuf;
const state = { music: null, musicEl: null, track: '', vol: { music: 0.5, sfx: 0.8, voice: 1 }, muted: false, rain: 0, river: 0 };
export const AU = state;
// iPhone and iPad: sound may only start inside a tap or key press (touchend / click / keydown), and each new <audio>
// element would need its own tap. So the music and the voices use a few elements that are unlocked on the first tap
// and then reused for every track and every line (only their src changes); they play through Web Audio gains (iOS
// ignores element volume). iOS also suspends the context ('interrupted') for calls, Siri and the lock screen, and
// the ring/silent switch mutes it unless the audio session is 'playback'.
const SILENT = 'data:audio/wav;base64,UklGRuwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YcgAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';
const mkEl = () => { const el = new Audio(); el.preload = 'auto'; el.setAttribute('playsinline', ''); return el; };
const musicEls = [mkEl(), mkEl()].map((el) => ({ el, g: null, busy: false, t: 0 })), voiceEl = { el: mkEl(), src: null };
let unlocked = false, noCtx = false;
const resume = () => { if (ctx && ctx.state !== 'running') { try { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) { /* needs a tap */ } } };
function unlockEls() {
  if (unlocked) return; unlocked = true;
  for (const el of [...musicEls.map((m) => m.el), voiceEl.el]) if (!el.getAttribute('src')) { el.src = SILENT; const r = el.play(); if (r && r.catch) r.catch(() => {}); }
}
export function unlock() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older iOS */ }
  if (ctx) { resume(); unlockEls(); if (state.music && state.music.el.paused && !state.paused) state.music.el.play().catch(() => {}); return; }
  if (noCtx) { unlockEls(); return; }
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { noCtx = true; ctx = null; unlockEls(); if (state.pendingTrack) { const t = state.pendingTrack; state.pendingTrack = null; state.track = ''; music(t); } return; }
  try { const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) { /* ignore */ }
  unlockEls();
  master = ctx.createGain(); master.connect(ctx.destination);
  musicGain = ctx.createGain(); musicGain.gain.value = state.vol.music; musicGain.connect(master);
  sfxGain = ctx.createGain(); sfxGain.gain.value = state.vol.sfx; sfxGain.connect(master);
  voiceGain = ctx.createGain(); voiceGain.gain.value = state.vol.voice; voiceGain.connect(master);
  ambGain = ctx.createGain(); ambGain.gain.value = 0.9; ambGain.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  startAmbience();
  for (const m of musicEls) { try { const s = ctx.createMediaElementSource(m.el); m.g = ctx.createGain(); m.g.gain.value = 0; s.connect(m.g); m.g.connect(musicGain); } catch (e) { m.g = null; } }
  try { voiceEl.src = ctx.createMediaElementSource(voiceEl.el); voiceEl.src.connect(voiceGain); } catch (e) { voiceEl.src = null; }
  if (state.pendingTrack) { const t = state.pendingTrack; state.pendingTrack = null; state.track = ''; music(t); }
}
// every tap, click and key press unlocks (capture phase, so nothing on the page can swallow it)
for (const ev of ['touchend', 'click', 'keydown']) addEventListener(ev, () => unlock(), { capture: true, passive: true });
// back from a call, the lock screen or another app: pick the sound up again
function wake() { if (document.hidden) return; resume(); if (state.music && state.music.el.paused && unlocked && !state.paused) state.music.el.play().catch(() => {}); }
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (state.music) state.music.el.pause(); } else wake(); });
addEventListener('pageshow', wake); addEventListener('focus', wake);
export function setMuted(m) { state.muted = m; if (master) master.gain.value = m ? 0 : 1; }
const now = () => ctx.currentTime;
function noise(dur, filt, f0, f1, q = 1, gain = 0.5, when = 0, dest = sfxGain) {
  if (!ctx) return; const t = now() + when, s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = filt; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); f.Q.value = q;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.02, dur / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t); s.stop(t + dur + 0.05);
}
function tone(freq, dur, type = 'sine', gain = 0.3, when = 0, f1 = null) {
  if (!ctx) return; const t = now() + when, o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(sfxGain); o.start(t); o.stop(t + dur + 0.05);
}
// rain and river: two noise beds whose levels follow the scene
let rainG, riverG;
function startAmbience() {
  const bed = (filt, f, q) => { const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; const b = ctx.createBiquadFilter(); b.type = filt; b.frequency.value = f; b.Q.value = q; const g = ctx.createGain(); g.gain.value = 0; s.connect(b); b.connect(g); g.connect(ambGain); s.start(); return g; };
  rainG = bed('highpass', 1800, 0.3); riverG = bed('lowpass', 420, 0.5);
  setAmbience(state.rain, state.river);
}
export function setAmbience(rain, river) { state.rain = rain; state.river = river; if (!ctx) return; rainG.gain.setTargetAtTime(rain * 0.16, now(), 0.6); riverG.gain.setTargetAtTime(river * 0.3, now(), 0.6); }
export const SFX = {
  thunder: (k = 1) => { noise(2.8, 'lowpass', 900, 60, 0.7, 0.7 * k, 0.15); noise(0.4, 'lowpass', 3000, 300, 0.5, 0.4 * k, 0.1); noise(1.6, 'lowpass', 300, 40, 0.6, 0.6 * k, 0.6); },
  clap: () => { noise(0.07, 'bandpass', 2400, 1800, 2, 0.9); tone(180, 0.1, 'triangle', 0.4); },                  // 醒木
  knock: () => { for (let i = 0; i < 3; i++) { tone(140, 0.09, 'triangle', 0.45, i * 0.22); noise(0.05, 'bandpass', 900, 600, 3, 0.4, i * 0.22); } },
  door: () => { noise(0.6, 'lowpass', 1600, 120, 0.8, 0.8); tone(70, 0.4, 'sawtooth', 0.25, 0, 40); noise(0.3, 'bandpass', 2400, 800, 2, 0.3, 0.12); },
  creak: () => { tone(320, 0.7, 'sawtooth', 0.06, 0, 210); },
  steps: () => { for (let i = 0; i < 4; i++) noise(0.06, 'lowpass', 500, 200, 1, 0.25, i * 0.32); },
  blade: () => { noise(0.35, 'highpass', 5000, 1800, 1, 0.5); tone(1400, 0.6, 'triangle', 0.12, 0.05, 1300); },
  slash: () => { noise(0.28, 'bandpass', 4000, 700, 1.2, 0.7); },
  palm: () => { noise(0.9, 'lowpass', 600, 60, 0.6, 0.9); tone(60, 0.6, 'sine', 0.5, 0, 35); },
  laugh: () => { for (let i = 0; i < 3; i++) tone(180 - i * 12, 0.3, 'sawtooth', 0.05, i * 0.45, 140); },
  whirl: () => { noise(0.8, 'bandpass', 400, 2400, 4, 0.5); },
  kick: () => { tone(110, 0.12, 'sine', 0.6, 0, 60); noise(0.08, 'lowpass', 1200, 300, 1, 0.4); },
  chain: () => { for (let i = 0; i < 7; i++) tone(2200 + Math.random() * 900, 0.08, 'square', 0.04, i * 0.05); noise(0.4, 'highpass', 3000, 2000, 1, 0.2); },
  ink: () => { for (let i = 0; i < 3; i++) noise(0.18, 'bandpass', 3000, 6000, 6, 0.3, i * 0.06); },
  dart: () => { noise(0.22, 'bandpass', 5000, 9000, 8, 0.4); tone(90, 0.15, 'sine', 0.4, 0.2); },
  clash: () => { noise(0.6, 'lowpass', 4000, 200, 0.7, 0.9); tone(220, 0.6, 'square', 0.12, 0, 80); tone(880, 0.8, 'triangle', 0.1, 0, 870); },
  hit: () => { noise(0.15, 'lowpass', 1600, 200, 1, 0.7); tone(90, 0.15, 'sine', 0.5, 0, 50); },
  gong: () => { for (const [f, g] of [[110, 0.4], [164, 0.2], [233, 0.12], [311, 0.08]]) tone(f, 4, 'sine', g, 0, f * 0.97); noise(0.2, 'lowpass', 2000, 300, 1, 0.2); },
  clue: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.6, 'triangle', 0.14, i * 0.08)); },
  right: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.8, 'triangle', 0.16, i * 0.1)); },
  wrong: () => { tone(160, 0.35, 'square', 0.1); tone(150, 0.35, 'square', 0.1, 0.2); },
  page: () => { noise(0.25, 'bandpass', 3000, 5000, 1.5, 0.25); },
  splash: () => { noise(1.4, 'lowpass', 2500, 200, 0.6, 0.6); noise(0.5, 'highpass', 3000, 2000, 1, 0.3, 0.1); },
  collapse: () => { noise(2.6, 'lowpass', 500, 50, 0.6, 0.9); for (let i = 0; i < 5; i++) noise(0.12, 'bandpass', 1400, 600, 3, 0.6, 0.2 + i * 0.25); setTimeout(() => SFX.splash(), 900); },
  whoosh: () => { noise(0.5, 'bandpass', 300, 1800, 2, 0.4); },
  heart: () => { tone(60, 0.18, 'sine', 0.6); tone(55, 0.18, 'sine', 0.5, 0.28); },
  sting: () => { tone(98, 2.6, 'sawtooth', 0.08, 0, 92); tone(147, 2.6, 'sawtooth', 0.05, 0, 139); noise(1.6, 'lowpass', 600, 80, 0.7, 0.3); },
  bird: () => { tone(1800, 0.08, 'square', 0.08, 0, 2400); tone(2200, 0.1, 'square', 0.08, 0.1, 1500); },
  // ---- book two: the sounds of a fight
  swing: (k = 1) => { noise(0.22 * k, 'bandpass', 900, 3400, 1.4, 0.55 * k); noise(0.12, 'highpass', 4000, 6000, 1, 0.15); },
  thrust: () => { noise(0.16, 'bandpass', 2400, 5200, 2, 0.5); },
  dash: () => { noise(0.3, 'bandpass', 500, 2600, 1.2, 0.45); noise(0.12, 'lowpass', 400, 120, 1, 0.3); },
  leap: () => { noise(0.25, 'bandpass', 400, 1600, 1.4, 0.35); },
  land: () => { tone(80, 0.18, 'sine', 0.5, 0, 45); noise(0.25, 'lowpass', 900, 150, 1, 0.45); },
  thud: () => { tone(70, 0.3, 'sine', 0.75, 0, 38); noise(0.4, 'lowpass', 1200, 90, 0.8, 0.7); },
  skid: () => { noise(0.6, 'bandpass', 1400, 500, 0.8, 0.45); noise(0.5, 'lowpass', 500, 120, 1, 0.3); },
  clang: (k = 1) => { for (const [f, g, d] of [[1320, 0.14, 0.9], [2170, 0.1, 0.7], [3410, 0.07, 0.5], [870, 0.12, 0.6], [4700, 0.04, 0.3]]) tone(f * (0.96 + Math.random() * 0.08), d * k, 'triangle', g * k, 0, f * 0.985); noise(0.06, 'highpass', 6000, 3000, 1, 0.7 * k); noise(0.2, 'bandpass', 3000, 1500, 2, 0.25 * k); },
  impact: (k = 1) => { tone(90 - k * 10, 0.2 + k * 0.12, 'sine', 0.45 + k * 0.15, 0, 34); noise(0.12 + k * 0.1, 'lowpass', 2200, 140, 0.9, 0.5 + k * 0.15); if (k >= 2) noise(0.7, 'lowpass', 500, 50, 0.6, 0.5); },
  qi: () => { noise(0.6, 'bandpass', 600, 4200, 3, 0.45); tone(220, 0.5, 'sawtooth', 0.06, 0, 880); },
  callout: () => { noise(0.35, 'bandpass', 300, 2000, 2, 0.4); tone(55, 0.6, 'sine', 0.5, 0, 40); },
  roar: () => { tone(110, 1.3, 'sawtooth', 0.22, 0, 70); tone(166, 1.2, 'sawtooth', 0.12, 0.05, 98); noise(1.3, 'bandpass', 600, 260, 1.4, 0.6); noise(0.9, 'lowpass', 300, 60, 0.7, 0.4, 0.2); },
  grunt: () => { tone(140, 0.35, 'sawtooth', 0.14, 0, 90); noise(0.3, 'bandpass', 500, 300, 2, 0.35); },
  crack: () => { noise(0.08, 'highpass', 3000, 1200, 1, 0.9); noise(0.9, 'lowpass', 1400, 80, 0.7, 0.6, 0.05); for (let i = 0; i < 4; i++) noise(0.05, 'bandpass', 1800, 900, 3, 0.4, 0.08 + i * 0.07); },
  rumble: () => { noise(2.2, 'lowpass', 220, 40, 0.6, 0.8); },
  splash2: () => { noise(0.9, 'lowpass', 3000, 300, 0.6, 0.7); noise(0.4, 'highpass', 2500, 1500, 1, 0.35, 0.05); },
  sheathe: () => { noise(0.35, 'bandpass', 3800, 2600, 4, 0.35); tone(2600, 0.05, 'square', 0.12, 0.33); noise(0.04, 'highpass', 5000, 4000, 1, 0.6, 0.33); },
  snap: () => { tone(2900, 0.5, 'triangle', 0.2, 0, 2200); tone(1700, 0.6, 'triangle', 0.15, 0, 1400); noise(0.1, 'highpass', 5000, 2000, 1, 0.9); },
  heaven: () => { for (const [f, g] of [[220, 0.1], [330, 0.08], [440, 0.07], [660, 0.05], [880, 0.04]]) tone(f, 3.6, 'sine', g, 0.02, f * 1.005); noise(2.8, 'bandpass', 800, 5000, 0.7, 0.3); tone(41, 3, 'sine', 0.6, 0, 30); },
  swell: () => { noise(2.4, 'bandpass', 200, 3000, 0.6, 0.35); for (const [f, g] of [[98, 0.1], [147, 0.08], [196, 0.07], [247, 0.05], [294, 0.05]]) tone(f, 3.2, 'sawtooth', g * 0.5, 0.4, f * 1.01); tone(49, 2.6, 'sine', 0.5, 0.5, 45); },
  wind: () => { noise(2.2, 'bandpass', 300, 900, 0.8, 0.35); },
  fire: () => { for (let i = 0; i < 8; i++) noise(0.04, 'bandpass', 2000 + Math.random() * 2000, 1000, 3, 0.2, Math.random() * 1.2); noise(1.4, 'lowpass', 500, 200, 0.6, 0.25); },
  ember: () => { noise(1.2, 'lowpass', 300, 120, 0.6, 0.5); tone(70, 1.4, 'sine', 0.3, 0, 110); },
  bell: () => { for (const [f, g] of [[523, 0.16], [1046, 0.06], [1567, 0.03]]) tone(f, 2.4, 'sine', g, 0, f * 0.996); },
  pebble: () => { tone(900, 0.04, 'square', 0.08); noise(0.05, 'highpass', 3000, 2000, 1, 0.3, 0.02); },
  lantern: () => { noise(0.3, 'bandpass', 2500, 900, 1.5, 0.5); tone(300, 0.2, 'triangle', 0.12, 0.05, 180); },
};
export function sfx(name, arg) { if (!ctx || state.muted) return; try { SFX[name]?.(arg); } catch (e) { /* a sound failing must not stop the story */ } }

// music: one <audio> at a time through a gain, faded in and out
const TRACKS = { title: 'title', story: 'story', fog: 'fog', village: 'village', curse: 'curse', cave: 'cave', reveal: 'reveal', battle: 'battle', melancholy: 'melancholy', ending: 'ending', temple: 'temple', yomi: 'yomi', dojo: 'dojo' };
export function music(track, fade = 1.6) {
  if (track === state.track) return; state.track = track;
  if (!ctx && !noCtx) { state.pendingTrack = track; return; }
  const old = state.music;
  if (old) {
    if (old.g) old.g.gain.setTargetAtTime(0, now(), fade / 3); else old.el.volume = 0;
    old.busy = true; clearTimeout(old.t); old.t = setTimeout(() => { old.el.pause(); old.busy = false; }, fade * 1500);
  }
  state.music = null; if (!track || !TRACKS[track]) return;
  const m = musicEls.find((x) => x !== old && !x.busy) || musicEls.find((x) => x !== old);
  clearTimeout(m.t); m.busy = false;
  m.el.loop = true; m.el.src = 'audio/music/' + TRACKS[track] + '.mp3';
  if (m.g) { m.g.gain.cancelScheduledValues(now()); m.g.gain.value = 0; m.g.gain.setTargetAtTime(1, now() + 0.1, fade / 3); } else { try { m.el.volume = state.vol.music; } catch (e) { /* read-only */ } }
  if (!state.paused) m.el.play().catch(() => {}); state.music = m;
}
export function setVolume(kind, v) { state.vol[kind] = v; const g = { music: musicGain, sfx: sfxGain, voice: voiceGain }[kind]; if (g) g.gain.value = v; }
export function duck(on) { if (musicGain) musicGain.gain.setTargetAtTime(on ? state.vol.music * 0.55 : state.vol.music, now(), 0.2); }

// voices: one line at a time
let vEl = null, vSrc = null;
// one element for every line: unlocked by the first tap, so the lines that follow one another by themselves (auto
// mode, book two) keep playing on iOS
export function voice(file, rate = 1) {
  stopVoice(); if (!file || state.muted) return null;
  const el = voiceEl.el; resume();
  el.src = 'audio/v/' + file; el.playbackRate = rate; el.preservesPitch = true; el.webkitPreservesPitch = true;
  if (!voiceEl.src) { try { el.volume = state.vol.voice; } catch (e) { /* read-only on iOS */ } }
  el.play().catch(() => {}); vEl = el; duck(true); el.onended = () => duck(false); return el;
}
export function pauseVoice(on) { state.paused = on; if (vEl) { if (on) vEl.pause(); else vEl.play().catch(() => {}); } if (state.music) { if (on) state.music.el.pause(); else state.music.el.play().catch(() => {}); } }
export function stopVoice() { if (vEl) { vEl.pause(); vEl.onended = null; vEl = null; duck(false); } }
export function voicePlaying() { return !!(vEl && !vEl.paused && !vEl.ended); }
