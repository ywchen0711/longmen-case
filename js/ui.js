// The page around the picture: the text box with its typewriter, the cards (chapter titles, hours, entrance poems,
// move names), the clue pop-up and the casebook, the deduction choices, the backlog, chapter select, the menu and
// the title screen. Every list can be worked with a mouse, a finger, the keyboard or a gamepad (sel = the
// highlighted item).
import { NAMES, HUE, POEMS, CLUES, CLUE_ORDER, ASKS } from './data.js?v=3';
import { cluePic } from './clues.js?v=3';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
export const UI = {
  lang: 'zh', open: null, sel: 0, picCache: {},
  t(zh, en) { return this.lang === 'en' && en ? en : zh; },
  setLang(l) { this.lang = l; document.body.classList.toggle('en', l === 'en'); document.documentElement.lang = l === 'en' ? 'en' : 'zh-Hant'; },
  // ---- the text box
  line(who, text, narr) {
    const b = $('#box'); b.classList.remove('hidden', 'done'); b.classList.toggle('narr', !!narr);
    const n = NAMES[who] || [who, who]; const nm = $('#name'); nm.textContent = narr ? '' : this.t(n[0], n[1]); nm.style.color = HUE[who] || '#f2ead8';
    $('#text').textContent = ''; this.full = text;
  },
  setText(s, done) { $('#text').textContent = s; $('#box').classList.toggle('done', !!done); },
  hideBox() { $('#box').classList.add('hidden'); },
  // ---- cards
  card(kind, zh, en, sub) {
    const c = $('#card'); c.className = kind === 'small' ? 'small' : ''; c.classList.remove('hidden');
    const big = this.t(zh, en), small = this.lang === 'en' ? '' : en;
    c.querySelector('.t1').textContent = big; c.querySelector('.t2').textContent = small;
    c.querySelector('.t3').textContent = sub ? this.t(sub[0], sub[1]) : '';
    c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
  },
  hideCard() { $('#card').classList.add('hidden'); },
  poem(id) {
    const p = POEMS[id], n = NAMES[id], P = $('#poem'); P.classList.remove('hidden');
    P.querySelector('.pname').textContent = this.t(n[0], n[1]); P.querySelector('.ptitle').textContent = this.t(p.title[0], p.title[1]);
    const L = P.querySelector('.plines'); L.innerHTML = '';
    p.zh.forEach((z, k) => { const d = el('div', 'pl', this.lang === 'en' ? esc(p.en[k]) : esc(z) + '<small>' + esc(p.en[k]) + '</small>'); L.appendChild(d); });
  },
  poemReveal(k) { const L = document.querySelectorAll('#poem .pl'); L.forEach((d, i) => d.classList.toggle('on', i < k)); },
  hidePoem() { $('#poem').classList.add('hidden'); },
  callout(zh, en) { const c = $('#callout'); c.classList.remove('hidden'); c.classList.toggle('brush', !!this.watch); c.querySelector('.cz').textContent = zh; c.querySelector('.ce').textContent = en; const z = c.querySelector('.cz'); z.style.animation = 'none'; void z.offsetWidth; z.style.animation = ''; },
  hideCallout() { $('#callout').classList.add('hidden'); },
  pic(kind) { const c = cluePic(kind, 4); return c; },
  cluePop(id) {
    const c = CLUES[id], P = $('#cluepop'); P.classList.remove('hidden');
    P.querySelector('.ph').textContent = this.t('—— 新線索 ——', '— New clue —');
    const pic = P.querySelector('.pic'); pic.innerHTML = ''; pic.appendChild(this.pic(c.pic));
    P.querySelector('.pt').textContent = this.t(c.zh, c.en); P.querySelector('.pd').textContent = this.t(c.tz, c.te);
    P.querySelector('.pf').textContent = this.t('已記入線索簿。點一下繼續。', 'Added to the casebook. Tap to continue.');
    const bb = $('#bBook'); bb.classList.add('on'); setTimeout(() => bb.classList.remove('on'), 1600);
  },
  hideClue() { $('#cluepop').classList.add('hidden'); },
  // ---- the deduction
  ask(id, tried, onPick) {
    const a = ASKS[id], P = $('#ask'); P.classList.remove('hidden'); this.open = 'ask'; this.onPick = onPick; this.askOpts = [];
    P.querySelector('.aq').textContent = this.t(a.zh, a.en);
    const O = P.querySelector('.ao'); O.innerHTML = '';
    a.opts.forEach((o, k) => { const b = el('button', tried.has(k) ? 'no' : '', esc(this.t(o.zh, o.en))); b.onclick = (e) => { e.stopPropagation(); onPick(k); }; O.appendChild(b); this.askOpts.push(b); });
    P.querySelector('.ah').textContent = this.t('推理：選出你的答案（數字鍵 1–4）', 'Deduce: choose your answer (keys 1–4)');
    this.sel = [...a.opts.keys()].find((k) => !tried.has(k)) ?? 0; this.hilite();
  },
  hideAsk() { $('#ask').classList.add('hidden'); if (this.open === 'ask') this.open = null; },
  hilite() { const list = this.list(); list.forEach((b, i) => b.classList.toggle('sel', i === this.sel)); list[this.sel]?.scrollIntoView?.({ block: 'nearest' }); },
  list() { if (this.open === 'ask') return this.askOpts; if (this.open === 'chapters') return [...document.querySelectorAll('#chapters .list button')]; if (this.open === 'title') return [...document.querySelectorAll('#title .tb button')].filter((b) => !b.disabled); if (this.open === 'book') return [...document.querySelectorAll('#book .item')]; return []; },
  moveSel(d) { const L = this.list(); if (!L.length) return; let k = this.sel; for (let n = 0; n < L.length; n++) { k = (k + d + L.length) % L.length; if (!L[k].disabled && !L[k].classList.contains('locked')) break; } this.sel = k; this.hilite(); if (this.open === 'book') L[k].click(); },
  pressSel() { const L = this.list(); L[this.sel]?.click(); },
  // ---- panels
  close() { for (const id of ['book', 'log', 'chapters', 'menu']) $('#' + id).classList.add('hidden'); if (this.open && this.open !== 'ask' && this.open !== 'title') this.open = null; },
  book(clues) {
    this.close(); const P = $('#book'); P.classList.remove('hidden'); this.open = 'book';
    const G = P.querySelector('.grid'); G.innerHTML = ''; const D = P.querySelector('.detail');
    D.innerHTML = clues.size ? '<span class="empty">' + this.t('點選線索查看。', 'Choose a clue to read it.') + '</span>' : '<span class="empty">' + this.t('還沒有線索。', 'No clues yet.') + '</span>';
    CLUE_ORDER.forEach((id) => { const c = CLUES[id], have = clues.has(id); const it = el('div', 'item' + (have ? '' : ' locked')); if (have) { it.appendChild(cluePic(c.pic, 2)); it.appendChild(el('div', '', esc(this.t(c.zh, c.en)))); it.onclick = (e) => { e.stopPropagation(); G.querySelectorAll('.item').forEach((x) => x.classList.remove('sel')); it.classList.add('sel'); D.innerHTML = '<b>' + esc(this.t(c.zh, c.en)) + '</b><br>' + esc(this.t(c.tz, c.te)); }; } else it.appendChild(el('div', '', '？')); G.appendChild(it); });
    this.sel = 0;
  },
  log(entries, onReplay) {
    this.close(); const P = $('#log'); P.classList.remove('hidden'); this.open = 'log'; const L = P.querySelector('.list'); L.innerHTML = '';
    for (const e of entries) { const n = NAMES[e.who] || ['', '']; const r = el('div', 'row', (e.who !== 'narr' ? '<b>' + esc(this.t(n[0], n[1])) + '</b>' : '') + esc(this.t(e.zh, e.en))); r.onclick = (ev) => { ev.stopPropagation(); onReplay(e); }; L.appendChild(r); }
    if (!entries.length) L.appendChild(el('div', 'row', esc(this.t('（還沒有對白）', '(Nothing yet)'))));
    P.scrollTop = P.scrollHeight;
  },
  chapters(chapters, reached, current, onPick) {
    this.close(); const P = $('#chapters'); P.classList.remove('hidden'); this.open = 'chapters'; const L = P.querySelector('.list'); L.innerHTML = '';
    chapters.forEach((c, k) => { const b = el('button', '', esc(this.t(c.zh, c.en)) + (k > reached ? '　🔒' : '')); b.disabled = k > reached; b.onclick = (e) => { e.stopPropagation(); onPick(k); }; L.appendChild(b); });
    this.sel = Math.min(current, reached); this.hilite();
  },
  menu() { this.close(); $('#menu').classList.remove('hidden'); this.open = 'menu'; },
  title(on, canContinue) { $('#title').classList.toggle('hidden', !on); document.body.classList.toggle('titleOn', !!on); this.open = on ? 'title' : (this.open === 'title' ? null : this.open); if (on) { $('#bCont').disabled = !canContinue; this.sel = canContinue ? 1 : 0; this.hilite(); } },
  tags(list) {
    const T = $('#tags'); if (!list) { T.innerHTML = ''; return; }
    T.innerHTML = ''; for (const t of list) { const n = NAMES[t.id] || [t.id, t.id]; const d = el('div', 'tag', esc(this.t(n[0], n[1]))); d.style.left = t.x + 'px'; d.style.top = t.y + 'px'; d.style.borderColor = HUE[t.id] || ''; T.appendChild(d); }
  },
  // a watched book: the cinematic subtitle bar and the film's own buttons
  setWatch(on) { this.watch = !!on; document.body.classList.toggle('watch', !!on); },
  paused(on) { document.body.classList.toggle('paused', !!on); const b = $('#bPause'); if (b) b.classList.toggle('on', !!on); },
  // the title: which book is chosen
  books(books, cur) { document.querySelectorAll('#title .bk').forEach((b) => b.classList.toggle('cur', +b.dataset.book === cur)); const B = books.find((x) => x.id === cur); $('#title .l2').textContent = this.t(B.sub[0], B.sub[1]); $('#title .l3').textContent = B.tag; },
  flashTag(on) { const f = $('#flashtag'); f.textContent = this.t('回　憶', 'MEMORY'); f.classList.toggle('on', !!on); },
  buttons(auto, skip) { $('#bAuto').classList.toggle('on', auto); $('#bSkip').classList.toggle('on', skip); },
};
