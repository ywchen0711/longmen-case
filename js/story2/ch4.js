// 第四回 刀心: the nine marks are one stroke; the black blade from the lake bed, 沉江; the first snow and a sparring
// match with the old man's rod (he wins, then for one exchange he does not); who the old man is.
import { S, A, M, P, F, E, LOOK, H, C, CU, TWO, L, N, TITLE, CARD, POEM, W, MUS, SND, FADE, FIGHT, TRIG } from '../dsl.js?v=2';
import { f } from '../fight.js?v=2';
import { COL, strikeParry } from './moves.js?v=2';

const V3 = (P, x, y, z) => new P.tmp.constructor(x, y, z);
const rodHit = (a, b, kind, o = {}) => [f.hit1(a, kind === 'thrust' ? 'rodcast' : 'rodflick', 'rodguard', 0.3), 0.05, f.arc(a, kind, { color: COL.weng, s: 0.85 }), 0.04];
export default {
  id: 'b2c4', zh: '第四回　刀心', en: 'Chapter Four: The Heart of the Blade',
  beats: [
    S('cave'), MUS('cave'), FADE(1, 0),
    A('yirui', 'yiruiN', [-1.6, -2.6], { f: -1, a: 'stand' }), A('yuweng', 'yuweng', [3.6, -0.6], { f: -1 }),
    C(-3, 4.2, -4, 12, 0, 6, 0), FADE(0, 1),
    TITLE('第四回　刀心', 'Chapter Four: The Heart of the Blade'),
    N('月亮一夜比一夜圓。奕叡又回到了洞裡，在刀痕前坐了一整天。', 'Each night the moon grew rounder. Yi Rui went back into the cave and sat before the marks for a whole day.'),
    P('yirui', 'meditate'), C(-4, 4.8, -5, 9, 0, 2, 2), W(1),
    FIGHT(
      f.trig('glow', 1), f.sfx('bell'), 0.5, f.trig('glow', 2), 0.35, f.trig('glow', 3), 0.3, f.trig('glow', 4), 0.25, f.trig('glow', 5), 0.2, f.trig('glow', 6), 0.18, f.trig('glow', 7), 0.15, f.trig('glow', 8), 0.12, f.trig('glow', 9), f.flash('#cfe8ff', 0.35), 0.8,
    ),
    CU('yirui', 0.8, { d: 6.4 }),
    L('yirui', '九道刀痕……不是九刀。是一刀。', 'Nine marks… They aren\'t nine strokes. They\'re one.', { f: 'surprised', a: 'meditate' }),
    L('yirui', '他出刀之前，已經把對手九個破綻全看完了。所以只要一刀。', 'Before he drew, he had already seen all nine of his opponent\'s openings. So one stroke was enough.', { f: 'thinking', a: 'meditate' }),
    M('yuweng', [1.2, -1.8], { f: -1 }), TWO('yirui', 'yuweng', 1),
    L('yuweng', '看？那是用眼睛。他是用什麼看的？', 'Seen? That\'s with the eyes. What did he see with?', { f: 'calm' }),
    CU('yirui', 0.6, { d: 6.4 }), W(0.8),
    L('yirui', '……聽。', '…He listened.', { f: 'calm', a: 'meditate' }),
    TRIG('chars', 1), SND('bell'), C(4.2, 4, -5.2, 8, 0, 2, 2), W(1.2),
    L('yuweng', '刀不在手，在心。心裡先聽見了，手才知道往哪裡去。', 'The blade is not in the hand but in the heart. The heart hears first, and then the hand knows where to go.', { f: 'calm' }),
    FADE(1, 0.8),

    // ---- the black blade from the lake bed
    S('valley', { mood: 'night' }), MUS('melancholy'),
    A('yirui', 'yiruiN', [-2.4, -0.8], { f: -1 }), A('yuweng', 'yuwengR', [-4.8, -1.2], { f: 1, a: 'fish' }),
    C(-3.6, 1.6, -1, 9, 0, 6, 0), FADE(0, 0.8),
    FIGHT(f.pose('yuweng', 'rodcast', { once: 1, then: 'fish', hold: 0.6 }), f.sfx('splash2'), f.fn((P) => P.fx2.dust(V3(P, -1.4, -0.1, -4), 14, { color: '#d8ecff', size: 0.4, up: 2, floor: -0.1 })), 1.6, f.sfx('splash2'), 0.4, f.look('yuweng', 'yuwengB'), f.pose('yuweng', 'hold'), f.flash('#cfe8ff', 0.2), 0.8),
    L('yuweng', '湖底撈上來的，沒名字。老頭子叫它「沉江」。', 'I fished it off the lake bed. It has no name. I call it Sunken River.', { f: 'calm', a: 'hold' }),
    FIGHT(f.look('yuweng', 'yuwengN'), f.look('yirui', 'yiruiB'), f.pose('yirui', 'stance'), f.sfx('blade'), 1.0),
    CU('yirui', 0.6),
    L('yirui', '好沉……一點裝飾都沒有。', 'It\'s heavy… and not a single ornament.', { f: 'surprised', a: 'stance' }),
    L('yuweng', '它不快。快的刀，你已經有過了。', 'It isn\'t fast. You\'ve had a fast blade already.', { f: 'laugh' }),
    FADE(1, 0.8),

    // ---- the first snow; the sparring
    S('valley', { mood: 'snownight' }), MUS('fog'),
    A('yirui', 'yiruiB', [-2.6, 1.2], { f: 1, a: 'stance' }), A('yuweng', 'yuweng', [2.4, 1.2], { f: -1, a: 'rodguard' }),
    C(0, 1.6, 1.2, 14, 0, 6, 0), FADE(0, 1.2),
    N('那一夜，山谷裡下了第一場雪。', 'That night the first snow fell in the valley.'),
    L('yuweng', '來。讓老頭子看看，你聽見了多少。', 'Come. Let this old man see how much you\'ve heard.', { f: 'happy', a: 'rodguard' }),
    FIGHT(
      f.cam(0, 1.6, 1.2, 10, -8, 4, 0.5),
      f.dash('yirui', [0.9, 1.2], 0.2, { then: 'stance', color: COL.rui2 }), 0.2,
      ...strikeParry('yirui', 'yuweng', 'down', { color: COL.rui2, block: 'rodguard', bthen: 'rodguard', after: 0.12 }),
      ...strikeParry('yirui', 'yuweng', 'h', { color: COL.rui2, block: 'rodguard', bthen: 'rodguard', after: 0.12 }),
      f.cam(1.4, 1.5, 1.2, 8, 10, 2, 0),
      ...strikeParry('yirui', 'yuweng', 'up', { color: COL.rui2, block: 'rodguard', bthen: 'rodguard', after: 0.05 }),
      ...rodHit('yuweng', 'yirui', 'down'), f.hit('yirui', 1), f.pose('yirui', 'hurtB'), 0.2,
      ...rodHit('yuweng', 'yirui', 'h'), f.hit('yirui', 1), f.fly('yirui', [-1.2, 1.4], 0.45, 0.8, { spin: -0.5, land: 'down' }),
      f.fn((P) => P.fx2.dust(V3(P, -1.2, 0, 1.4), 18, { color: '#ffffff', size: 0.4, floor: 0 })), f.gust([-1.2, 0.5, 1.4], { power: 4, radius: 4 }), 1.0,
      f.cam(0, 1.4, 1.2, 9, 0, 6, 0.8), 0.5,
    ),
    L('yuweng', '又在用眼睛打。閉上眼睛。聽。', 'Fighting with your eyes again. Close them. Listen.', { f: 'calm', a: 'rodguard' }),
    FIGHT(
      f.pose('yirui', 'getup', { once: 1, then: 'stanceC', hold: 0.4 }), 1.2,
      f.cam(-1.4, 1.8, 1.4, 6.4, -14, 2, 1.6), 1.6, f.pose('yuweng', 'stand'),
      // the old man vanishes from in front of him, and comes from behind
      f.dash('yuweng', [-3.6, 1.0], 0.3, { a: 'dash', then: 'rodguard', color: '#e8fff0', ghost: 1, sound: 0 }), f.cam(-2.4, 1.7, 1.2, 9, 8, 4, 0.6), 0.9,
      f.slow(0.3, { snap: 1 }), f.hit1('yuweng', 'rodflick', 'rodguard', 0.2), 0.05, f.arc('yuweng', 'down', { color: COL.weng, s: 0.85 }), 0.04,
      f.face('yirui', -1), f.pose('yirui', 'parry', { once: 1, then: 'stanceC', hold: 0.3 }), f.clang('yirui', 'yuweng', { n: 18 }), 0.25, f.slow(1),
      f.dash('yuweng', [-0.2, 2.0], 0.22, { a: 'dash', then: 'rodguard', color: '#e8fff0', sound: 0 }), 0.3,
      f.hit1('yuweng', 'rodcast', 'rodguard', 0.2), 0.05, f.arc('yuweng', 'thrust', { color: COL.weng }), f.face('yirui', 1), f.pose('yirui', 'block', { once: 1, then: 'stanceC', hold: 0.3 }), f.clang('yirui', 'yuweng', { n: 18 }), 0.35,
      f.dash('yuweng', [-2.6, 0.6], 0.2, { a: 'dash', then: 'rodguard', color: '#e8fff0', sound: 0 }), 0.24,
      f.hit1('yuweng', 'rodflick', 'rodguard', 0.2), 0.05, f.arc('yuweng', 'h', { color: COL.weng }), f.face('yirui', -1), f.pose('yirui', 'parry', { once: 1, then: 'stanceC', hold: 0.3 }), f.clang('yirui', 'yuweng', { n: 18 }), 0.4,
      // the last exchange: both at once, and both stop
      f.skid('yuweng', [-4.3, 0.8], 0.25, { then: 'rodguard' }), f.skid('yirui', [-1.2, 1.0], 0.25, { then: 'stanceC' }), 0.5,
      f.cam(-2.75, 1.7, 0.9, 7.5, 0, 4, 0.4), f.slow(0.15, { snap: 1 }), f.music('reveal'),
      f.hit1('yuweng', 'rodcast', 'rodcast', 3), f.hit1('yirui', 'lunge', 'lunge', 3), f.arc('yirui', 'thrust', { color: COL.rui2 }), f.arc('yuweng', 'thrust', { color: COL.weng }), f.gust([-1.8, 1.5, 1], { power: 3, radius: 6 }), 1.1,
      f.slow(1), f.cam(-2.75, 1.8, 0.9, 6.4, 14, 2, 2), 1.4,
    ),
    N('竿尖停在奕叡的喉前一寸。沉江的刀鋒，也停在老人空蕩蕩的袖口。', 'The tip of the rod stopped an inch from Yi Rui\'s throat. The edge of Sunken River stopped at the old man\'s empty sleeve.'),
    L('yuweng', '哈……哈哈哈哈！好！這一招，老頭子沒贏。', 'Ha… ha ha ha ha! Good! That exchange, this old man did not win.', { f: 'laugh', a: 'laugh' }),
    FADE(1, 0.8),

    // ---- by the fire: who the old man is
    S('valley', { mood: 'snownight' }), MUS('melancholy'),
    A('yirui', 'yiruiB', [-4.6, 2.2], { f: -1, a: 'sitF' }), A('yuweng', 'yuweng', [-7.4, 2.8], { f: 1, a: 'sitF' }),
    C(-6, 1.3, 2.4, 8.4, 0, 6, 0), FADE(0, 0.8), SND('fire'),
    L('yirui', '前輩，您到底是誰？', 'Sir, who are you, really?', { f: 'calm', a: 'sitF' }),
    CU('yuweng', 1, { d: 6.4 }),
    L('yuweng', '厲寒山……二十年前，是我的徒弟。', 'Li Hanshan… twenty years ago, he was my student.', { f: 'sad', a: 'sitF' }),
    CU('yirui', 0.5),
    L('yirui', '您的徒弟？那您這條胳膊——', 'Your student? Then your arm —', { f: 'surprised', a: 'sitF' }),
    CU('yuweng', 0.5, { d: 6.4 }),
    L('yuweng', '是他拿走的。他太想贏了。想贏的人，聽不見別人，也聽不見自己。', 'He took it. He wanted too much to win. A man who wants to win can\'t hear anyone else — and he can\'t hear himself.', { f: 'sad', a: 'sitF' }),
    TWO('yirui', 'yuweng', 1),
    L('yuweng', '你去吧。別殺他。把他停下來，就好。', 'Go. Don\'t kill him. Just stop him.', { f: 'calm', a: 'sitF' }),
    L('yirui', '我答應您。', 'I promise.', { f: 'calm', a: 'sitF' }),
    FIGHT(f.pose('yirui', 'stance'), f.cam(-4.6, 1.6, 2.2, 7, -16, 4, 2), 1.4),
    POEM('yiruiB'),
    FADE(1, 1), W(0.3),
  ],
};
