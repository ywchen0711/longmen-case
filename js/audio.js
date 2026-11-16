// Sound: music (Ninja Adventure, CC0) cross-faded between scenes, the rain and the river as filtered noise, the
// effects synthesised on the spot (thunder, the storyteller's clapper, knocks, a door broken in, a blade, palm wind,
// a chain, darts, a gong for the chapter cards, chimes for clues), and the recorded voices of the lines.
let ctx = null, master, musicGain, sfxGain, voiceGain, ambGain, noiseBuf;
const state = { music: null, musicEl: null, track: '', vol: { music: 0.5, sfx: 0.8, voice: 1 }, muted: false, rain: 0, river: 0 };
export const AU = state;
export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = ctx.createGain(); master.connect(ctx.destination);
  musicGain = ctx.createGain(); musicGain.gain.value = state.vol.music; musicGain.connect(master);
  sfxGain = ctx.createGain(); sfxGain.gain.value = state.vol.sfx; sfxGain.connect(master);
  voiceGain = ctx.createGain(); voiceGain.gain.value = state.vol.voice; voiceGain.connect(master);
  ambGain = ctx.createGain(); ambGain.gain.value = 0.9; ambGain.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  startAmbience();
  if (state.pendingTrack) { const t = state.pendingTrack; state.pendingTrack = null; music(t); }
}
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
};
export function sfx(name, arg) { if (!ctx || state.muted) return; try { SFX[name]?.(arg); } catch (e) { /* a sound failing must not stop the story */ } }

// music: one <audio> at a time through a gain, faded in and out
const TRACKS = { title: 'title', story: 'story', fog: 'fog', village: 'village', curse: 'curse', cave: 'cave', reveal: 'reveal', battle: 'battle', melancholy: 'melancholy', ending: 'ending', temple: 'temple', yomi: 'yomi', dojo: 'dojo' };
export function music(track, fade = 1.6) {
  if (track === state.track) return; state.track = track;
  if (!ctx) { state.pendingTrack = track; return; }
  const old = state.music; if (old) { old.g.gain.setTargetAtTime(0, now(), fade / 3); setTimeout(() => { old.el.pause(); old.el.src = ''; }, fade * 1500); }
  state.music = null; if (!track || !TRACKS[track]) return;
  const el = new Audio('audio/music/' + TRACKS[track] + '.mp3'); el.loop = true; el.crossOrigin = 'anonymous';
  const src = ctx.createMediaElementSource(el), g = ctx.createGain(); g.gain.value = 0; src.connect(g); g.connect(musicGain);
  g.gain.setTargetAtTime(1, now() + 0.1, fade / 3); el.play().catch(() => {}); state.music = { el, g };
}
export function setVolume(kind, v) { state.vol[kind] = v; const g = { music: musicGain, sfx: sfxGain, voice: voiceGain }[kind]; if (g) g.gain.value = v; }
export function duck(on) { if (musicGain) musicGain.gain.setTargetAtTime(on ? state.vol.music * 0.55 : state.vol.music, now(), 0.2); }

// voices: one line at a time
let vEl = null, vSrc = null;
export function voice(file, rate = 1) {
  stopVoice(); if (!file || state.muted) return null;
  const el = new Audio('audio/v/' + file); el.playbackRate = rate; el.preservesPitch = true;
  if (ctx) { try { vSrc = ctx.createMediaElementSource(el); vSrc.connect(voiceGain); } catch (e) { /* plays direct */ } }
  el.play().catch(() => {}); vEl = el; duck(true); el.onended = () => duck(false); return el;
}
export function stopVoice() { if (vEl) { vEl.pause(); vEl.onended = null; vEl = null; duck(false); } }
export function voicePlaying() { return !!(vEl && !vEl.paused && !vEl.ended); }
