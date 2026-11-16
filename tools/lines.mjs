// Lists everything that is spoken in the novel, for tools/voices.py to record:
//   node tools/lines.mjs > tools/lines.json
// Each item: id (names the file audio/v/<id>.mp3), cast (whose voice), text (Chinese), feel.
import { CHAPTERS } from '../js/story/index.js';
import { POEMS, ASKS, callId } from '../js/data.js';
const out = [];
const strip = (s) => s.replace(/[（(][^）)]*[）)]/g, '').trim();
for (const ch of CHAPTERS) for (const b of ch.beats) {
  if (b.k === 'line') { const t = strip(b.zh); if (!t) continue; out.push({ id: b.vid, cast: b.who === 'voice' ? (b.voice || 'qian') : b.who, text: t, feel: b.f || '', soft: b.soft ? 1 : 0 }); }
  if (b.k === 'callout') out.push({ id: callId(b.id, b.zh), cast: b.id, text: b.zh + '！', feel: 'shout' });
}
for (const [id, p] of Object.entries(POEMS)) out.push({ id: 'poem_' + id, cast: id, text: p.zh.join('，') + '。', feel: 'poem' });
for (const [id, a] of Object.entries(ASKS)) a.opts.forEach((o, k) => { if (!o.ok) out.push({ id: 'ask_' + id + '_' + k, cast: o.who, text: o.rz, feel: '' }); });
const seen = new Set();
console.log(JSON.stringify({ lines: out.filter((l) => (seen.has(l.id) ? false : seen.add(l.id))) }, null, 0));
