// Lists everything that is spoken in both books, for tools/voices.py to record:
//   node tools/lines.mjs > tools/lines.json
// Each item: id (names the file audio/v/<id>.mp3), cast (whose voice), text (Chinese), feel.
import { CHAPTERS } from '../js/story/index.js';
import { CHAPTERS as CHAPTERS2 } from '../js/story2/index.js';
import { POEMS, ASKS, callId } from '../js/data.js';
const out = [];
const strip = (s) => s.replace(/[（(][^）)]*[）)]/g, '').trim();
const call = (b) => out.push({ id: callId(b.id, b.zh), cast: b.id, text: b.zh.replace(/・/g, '，') + '！', feel: 'shout' });
for (const ch of [...CHAPTERS, ...CHAPTERS2]) for (const b of ch.beats) {
  if (b.k === 'line') { const t = strip(b.zh); if (!t) continue; out.push({ id: b.vid, cast: b.who === 'voice' ? (b.voice || 'qian') : b.who, text: t, feel: b.f || '', soft: b.soft ? 1 : 0 }); }
  if (b.k === 'callout') call(b);
  if (b.k === 'fight') for (const a of b.acts) if (a && a.k === 'call') call(a);
}
for (const [id, p] of Object.entries(POEMS)) out.push({ id: 'poem_' + id, cast: id === 'yiruiB' ? 'yirui' : id, text: p.zh.join('，') + '。', feel: 'poem' });
for (const [id, a] of Object.entries(ASKS)) a.opts.forEach((o, k) => { if (!o.ok) out.push({ id: 'ask_' + id + '_' + k, cast: o.who, text: o.rz, feel: '' }); });
const seen = new Set();
console.log(JSON.stringify({ lines: out.filter((l) => (seen.has(l.id) ? false : seen.add(l.id))) }, null, 0));
