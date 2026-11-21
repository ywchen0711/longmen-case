// 第五回 出谷: out of the valley; an ambush on the road taken in one long shot, calm and minimal; 冷笑天 on the cliff
// road: one exchange, 笑盡天下 against the new stroke, and they cancel.
import { S, A, M, P, F, E, LOOK, H, C, CU, TWO, L, N, TITLE, CARD, POEM, W, MUS, SND, FADE, FIGHT } from '../dsl.js?v=4';
import { f } from '../fight.js?v=4';
import { COL } from './moves.js?v=4';

const V3 = (P, x, y, z) => new P.tmp.constructor(x, y, z);
// a calm cut: a short bright line, a small step; the one cut down falls a beat later (o.fall)
const flick = (id, kind = 'draw', o = {}) => [f.hit1(id, kind === 'thrust' ? 'lunge' : kind === 'up' ? 'rise' : 'after', o.then || 'stand', 0.25), 0.05, f.arc(id, kind, { color: '#ffffff', s: 0.6, len: 0.5 })];
export default {
  id: 'b2c5', zh: '第五回　出谷', en: 'Chapter Five: Out of the Valley',
  beats: [
    S('cliff', { mood: 'sunrise' }), MUS('reveal'), FADE(1, 0),
    A('yirui', 'yiruiB', [9.6, 1.2], { f: -1, a: 'climb', y: -6 }),
    C(3, 1.6, 1, 15, 0, 6, 0), FADE(0, 1),
    TITLE('第五回　出谷', 'Chapter Five: Out of the Valley'),
    FIGHT(f.leap('yirui', [4.2, 1.2], 0.7, 3.4, { spin: -1, a: 'tuck', f: -1, ghost: 1 }), f.fn((P) => { const a = P.actor('yirui'); a.yo = 0; }), 1.2, f.pose('yirui', 'stand'), f.cam(3.4, 1.7, 1.2, 8, -12, 4, 1.6), 1.4),
    N('月圓前三日。奕叡回到了斷魂崖上。', 'Three days before the full moon, Yi Rui stood on top of Soul-Severing Cliff again.'),
    FADE(1, 0.8),

    // ---- the ambush on the road, in one long shot
    S('road', { kind: 'forest' }), MUS('battle'),
    A('yirui', 'yiruiB', [-14, 1], { f: 1 }),
    A('heixiong', 'heixiong', [-2, 1.4], { f: -1, a: 'idle' }), A('bandit', 'bandit:1', [-0.6, 2.6], { f: -1, a: 'idle' }), A('bd2', 'bandit:3', [-14, 2.4], { f: 1, a: 'idle' }),
    A('xuedao', 'xuedao:6', [1.4, 0.0], { f: -1, a: 'stance' }), A('xd2', 'xuedao:7', [-15, 2.4], { f: 1, a: 'stance' }), A('xd3', 'xuedao:8', [3.2, 2.6], { f: -1, a: 'stance' }),
    C(-8, 1.6, 1, 13, 0, 6, 0), FADE(0, 0.8),
    M('yirui', [-6.6, 1]), C(-4.4, 1.6, 1, 12, 0, 6, 3), W(3),
    L('heixiong', '站住！這條路是黑風寨開的。要過去，留下買路錢！', 'Halt! Black Wind Fort built this road. If you want to pass, pay the toll!', { f: 'angry', a: 'idle' }),
    L('xuedao', '門主有令：龍門的人，一個都不准過血楓谷。', 'Our master\'s orders: no one from Longmen gets through to Blood Maple Valley.', { f: 'calm', a: 'stance' }),
    CU('yirui', 0.6),
    L('yirui', '讓開。', 'Stand aside.', { f: 'calm', a: 'stand' }),
    L('heixiong', '口氣倒不小！兄弟們，上！', 'Big words! Get him, boys!', { f: 'angry', a: 'shout' }),
    FIGHT(
      f.cam(-5, 1.7, 1.2, 11, -24, 5, 0), f.follow('yirui', { dy: 1.5, k2: 3 }), f.cam(-5, 1.7, 1.2, 10, 26, 4, 13, { ease: 'lin' }), f.walk('yirui', [1.2, 1], { speed: 1.1 }),
     
      // the chief swings his club: half a step aside, one flick
      f.run('heixiong', [-4.7, -0.2], 0.5, { a: 'run', then: 'stance' }), 0.45, f.hit1('heixiong', 'chop', 'stance'), 0.06, f.arc('heixiong', 'down', { color: '#ffd8a0' }), 0.05,
      ...flick('yirui', 'draw'), f.hit('heixiong', 1), 0.6,
      // two bandits at once, left and right: two short lines
      f.run('bandit', [-3.4, 2.3], 0.5, { a: 'run', then: 'stance' }), f.run('bd2', [-6.2, 2.3], 0.55, { a: 'run', then: 'stance' }), 0.5,
      f.hit1('bandit', 'hslash', 'stance'), f.face('yirui', 1), ...flick('yirui', 'thrust'), f.hit('bandit', 1), 0.3,
      f.hit1('bd2', 'chop', 'stance'), f.face('yirui', -1), ...flick('yirui', 'up'), f.hit('bd2', 1), 0.3, f.face('yirui', 1), 0.4,
      // three disciples come together: he does not stop walking
      f.run('xuedao', [-1.6, -0.3], 0.5, { a: 'runw', then: 'stance' }), f.run('xd2', [-4.4, 2.4], 0.55, { a: 'runw', then: 'stance' }), f.run('xd3', [-1.9, 2.4], 0.6, { a: 'runw', then: 'stance' }), 0.5,
      f.hit1('xuedao', 'chop', 'stance'), f.arc('xuedao', 'down', { color: COL.xd }), 0.03, ...flick('yirui', 'draw'), f.hit('xuedao', 1), 0.25,
      f.hit1('xd2', 'lunge', 'stance'), f.arc('xd2', 'thrust', { color: COL.xd }), 0.03, f.face('yirui', -1), ...flick('yirui', 'up'), f.hit('xd2', 1), 0.25, f.face('yirui', 1),
      f.hit1('xd3', 'hslash', 'stance'), f.arc('xd3', 'h', { color: COL.xd }), 0.03, ...flick('yirui', 'thrust'), f.hit('xd3', 1), 2.9,
      // he sheathes; only then do they fall
      f.pose('yirui', 'sheathe'), f.sfx('sheathe'), f.cam(1.4, 1.6, 1, 8, -10, 3, 0.6), 0.5, f.pose('yirui', 'stand'), f.follow(null), f.cam(-2.2, 1.7, 1, 13, 0, 6, 1), 0.4,
      f.look('heixiong', 'heixiong'), f.pose('heixiong', 'down'), f.pose('bandit', 'down'), f.pose('bd2', 'down'), f.pose('xuedao', 'down'), f.pose('xd2', 'down'), f.pose('xd3', 'down'), f.sfx('thud'), f.dust({ id: 'xuedao', up: 0 }, { n: 8 }), f.dust({ id: 'heixiong', up: 0 }, { n: 8 }), f.dust({ id: 'xd3', up: 0 }, { n: 8 }), f.shake(0.2), 1.2,
    ),
    N('他一步都沒有停。刀，只出了六次，每一次都只有一寸。', 'He never stopped walking. His blade came out six times, and each time it moved no more than an inch.'),
    L('heixiong', '這……這小子是人是鬼……', 'Is… is this kid even human…', { f: 'scared', a: 'down' }),
    FADE(1, 0.8),

    // ---- the cliff road: 冷笑天
    S('road', { kind: 'cliff', mood: 'golden' }), MUS('curse'),
    A('yirui', 'yiruiB', [-8, 1], { f: 1 }), A('xiaotian', 'xiaotian', [3.6, 0.6], { f: -1, a: 'arms' }),
    C(-2, 1.8, 0.8, 15, 0, 6, 0), FADE(0, 0.8),
    M('yirui', [-2.6, 1]), C(0.4, 1.8, 0.8, 11, 0, 6, 2.6), W(2.6),
    CU('xiaotian', 0.8, { d: 7.6 }),
    L('xiaotian', '龍門的小子。聽說你掉下斷魂崖了，命倒挺硬。', 'The boy from Longmen. I heard you fell off Soul-Severing Cliff. Tough to kill, aren\'t you.', { f: 'laugh', a: 'arms' }),
    L('yirui', '冷前輩。請讓路。', 'Master Leng. Please let me pass.', { f: 'calm', a: 'stand' }),
    L('xiaotian', '厲寒山那老鬼，我也看他不順眼。可你這樣去，是送死。', 'I can\'t stand that old devil Li Hanshan either. But going the way you are, you\'ll get yourself killed.', { f: 'calm', a: 'arms' }),
    L('xiaotian', '讓我看看，你值不值得我讓這條路。', 'Show me whether you\'re worth stepping aside for.', { f: 'proud', a: 'stand' }),
    FIGHT(
      f.cam(0.6, 1.8, 0.8, 12, 0, 4, 0.6), f.sfx('laugh'), f.pose('xiaotian', 'laugh'), 1.6,
      f.call('xiaotian', '笑盡天下', 'Laugh Down the World'), f.cu('xiaotian', 0.2, { d: 7 }), f.pose('xiaotian', 'palm'), 0.5,
      f.pose('yirui', 'draw'), f.cu('yirui', 0.2, { d: 7 }), f.sfx('wind'), 0.6,
      f.call('yirui', '沉江・斷流', 'Sunken River: Cut the Current'), 0.8,
      f.cam(0.4, 1.7, 0.8, 9, 0, 0, 0.2), f.slow(0.45),
      f.fn((P) => { const a = P.actor('xiaotian'), b = P.actor('yirui'); P.fx.palm(V3(P, a.x - 0.6, a.y + 1.5, a.z), V3(P, (a.x + b.x) / 2, a.y + 1.5, a.z), 0.4); }), f.sfx('palm'),
      f.hit1('yirui', 'after', 'stance', 0.6), f.arc('yirui', 'draw', { color: COL.rui2, s: 1.2 }), f.qi('yirui', [0.5, 1.4, 0.8], { dur: 0.4, color: COL.rui2, s: 1.2 }), 0.4,
      f.impact(1, 0.08), f.flash('#fff0e0', 0.8), f.ring([0.5, 1.4, 0.9], { r: 6, color: '#ffe0c0' }), f.sparks([0.5, 1.6, 0.9], { n: 40, speed: 10 }), f.sfx('impact', 3), f.sfx('clang', 1.4), f.shake(0.7), f.stop(0.16), f.gust([0.5, 1.5, 0.9], { power: 12, radius: 12 }), f.speed(1, 0.5), f.dust([0.5, 0.1, 0.9], { n: 30, size: 0.6, speed: 4 }),
      0.1, f.slow(1), f.skid('yirui', [-2.9, 1], 0.5), f.skid('xiaotian', [4.0, 0.6], 0.5, { then: 'stand' }), f.cam(0.5, 1.7, 0.8, 12.5, 0, 6, 0.5), 1.0, 0.6,
    ),
    W(0.6), SND('laugh'),
    CU('xiaotian', 0.8, { d: 7.6 }),
    L('xiaotian', '哈、哈、哈。去吧。', 'Ha. Ha. Ha. Go.', { f: 'laugh', a: 'laugh' }),
    L('yirui', '多謝前輩。', 'Thank you, sir.', { f: 'calm', a: 'salute' }),
    M('yirui', [9, 1.2]), C(3, 1.8, 0.8, 14, 6, 6, 3), W(2.4),
    L('xiaotian', '……那一刀，他沒用全力。有意思。', '…He didn\'t put everything into that stroke. Interesting.', { f: 'calm', a: 'arms', soft: 1 }),
    FADE(1, 1), W(0.3),
  ],
};
