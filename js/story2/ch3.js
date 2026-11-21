// 第三回 瀑下: days under the waterfall (knocked down, holding, splitting the water); the red fruit and the white ape
// he must not hurt; the fruit's fire, and the old man guiding it; the waterfall parts for a full breath.
import { S, A, M, P, F, E, LOOK, H, C, CU, TWO, L, N, TITLE, CARD, POEM, W, MUS, SND, FADE, FIGHT, RAIN } from '../dsl.js?v=4';
import { f } from '../fight.js?v=4';
import { COL } from './moves.js?v=4';

const V3 = (P, x, y, z) => new P.tmp.constructor(x, y, z);
const splash = (x, z, n = 30) => f.fn((P) => { P.fx2.dust(V3(P, x, -0.1, z), n, { color: '#ffffff', size: 0.5, up: 4, speed: 3, floor: -0.1, life: 1.2 }); });
export default {
  id: 'b2c3', zh: '第三回　瀑下', en: 'Chapter Three: Beneath the Falls',
  beats: [
    S('valley', { mood: 'sunrise' }), MUS('village'), FADE(1, 0),
    A('yirui', 'yiruiN', [4, -16.2], { f: 1, a: 'stanceC' }), A('yuweng', 'yuwengR', [1.6, 0.4], { f: 1, a: 'fish' }),
    C(4, 3, -14, 16, 0, 8, 0), FADE(0, 1.2),
    TITLE('第三回　瀑下', 'Chapter Three: Beneath the Falls'),
    CARD('第一日・日出', 'Day one, sunrise'),
    C(4, 2.2, -15.6, 9, -8, 4, 2), W(1),
    FIGHT(
      f.pose('yirui', 'stance'), f.sfx('rumble'), 0.8, f.pose('yirui', 'hurtB'), f.shake(0.2), 0.3,
      f.fly('yirui', [4.2, -12.6], 0.6, 0.6, { land: 'down', a: 'air' }), 0.5, splash(4.2, -12.6), f.sfx('splash2'), 0.9,
    ),
    C(2.4, 1.4, -2, 11, -10, 8, 1.4),
    L('yuweng', '水比你有耐心。', 'The water is more patient than you are.', { f: 'laugh', a: 'fish' }),
    FADE(1, 0.6),
    S('valley', { mood: 'rainday' }), MUS('fog'), RAIN(0.8),
    A('yirui', 'yiruiN', [4, -16.2], { f: 1, a: 'stance' }), A('yuweng', 'yuwengR', [1.6, 0.4], { f: 1, a: 'fish' }),
    C(4, 2.2, -15.6, 9, 8, 4, 0), FADE(0, 0.6),
    CARD('第三日・雨', 'Day three, rain'),
    FIGHT(f.sfx('rumble'), f.pose('yirui', 'burn'), f.shake(0.15), 1.2, f.pose('yirui', 'stance'), 0.8),
    C(2.4, 1.4, -2, 11, -10, 8, 1.2),
    L('yuweng', '別跟水硬碰。讓它過去，你還在。', 'Don\'t fight the water. Let it pass, and you\'re still here.', { f: 'calm', a: 'fish' }),
    C(4, 2.2, -15.6, 8, 0, 4, 1.2),
    L('yirui', '讓它……過去。', 'Let it… pass.', { f: 'thinking', a: 'stanceC' }),
    W(1.6), FADE(1, 0.6),
    S('valley', { mood: 'night' }), MUS('melancholy'), RAIN(0),
    A('yirui', 'yiruiT', [-11.2, 2.6], { f: -1, a: 'stanceC' }), A('yuweng', 'yuweng', [-9.4, 1.0], { f: -1, a: 'sitF' }),
    C(-12, 1.6, 2.6, 7.6, 8, 3, 0), FADE(0, 0.6),
    CARD('第七日・夜', 'Day seven, night'),
    FIGHT(
      f.fn((P) => P.fx2.dropLeaves(V3(P, -12.3, 0.4, 2.6), 3, { gap: 0.36, color: '#e0a030', fall: 0.4, stagger: 0.5 })), 1.9,
      f.hit1('yirui', 'after', 'stanceC', 0.3), f.arc('yirui', 'draw', { color: '#ffffff', s: 0.6 }), f.fn((P) => P.fx2.cutLeaves('one', V3(P, -12.66, 2, 3))), 0.5,
      f.hit1('yirui', 'rise', 'stanceC', 0.3), f.arc('yirui', 'up', { color: '#ffffff', s: 0.6 }), f.fn((P) => P.fx2.cutLeaves('one', V3(P, -12.3, 2, 3))), 0.5,
      f.hit1('yirui', 'after', 'stanceC', 0.3), f.arc('yirui', 'draw', { color: '#ffffff', s: 0.6 }), f.fn((P) => P.fx2.cutLeaves('one', V3(P, -11.9, 2, 3))), 1.2,
    ),
    L('yuweng', '三片葉子，三刀。一刀都沒有多。', 'Three leaves, three cuts. Not one cut too many.', { f: 'calm', a: 'sitF' }),
    FADE(1, 0.6),
    S('valley', { mood: 'night' }),
    A('yirui', 'yiruiT', [4, -16.2], { f: 1, a: 'stanceC' }), A('yuweng', 'yuweng', [2.2, -0.6], { f: 1 }),
    C(4, 3, -15, 15, 0, 6, 0), FADE(0, 0.6),
    CARD('第十日・月', 'Day ten, moonrise'),
    C(4, 2.4, -15.8, 10, 0, 4, 2), W(0.8),
    FIGHT(
      f.slow(0.4), f.hit1('yirui', 'rise', 'stanceC', 1.2), 0.06, f.arc('yirui', 'up', { color: '#ffffff' }), f.trig('part', 0.5), f.sfx('qi'), f.gust([4, 2, -16], { power: 6, radius: 8 }), 0.5,
      f.slow(1), 0.3, f.trig('unpart'), f.sfx('rumble'), 1.2,
    ),
    E('yuweng', '!'), W(1),
    FADE(1, 0.8),

    // ---- the morning: the red fruit
    S('valley', { mood: 'valley' }), MUS('village'),
    A('yirui', 'yiruiT', [-1, 1.4], { f: -1 }), A('yuweng', 'yuweng', [-3.4, 1.6], { f: 1 }),
    C(-2, 1.6, 1.4, 9, 0, 6, 0), FADE(0, 0.8),
    L('yuweng', '崖上那棵老樹，結了一顆赤陽果。三十年才熟一次。', 'Up on the cliff there\'s an old tree with a red sun fruit on it. It ripens once in thirty years.', { f: 'calm', a: 'point' }),
    L('yuweng', '守果子的，是一頭白猿。牠在那兒住得比我還久。', 'It\'s guarded by a white ape. He\'s lived up there longer than I\'ve lived down here.', { f: 'calm' }),
    L('yuweng', '去摘回來。不准傷牠。', 'Go and fetch it. And don\'t hurt him.', { f: 'calm' }),
    L('yirui', '不傷牠，怎麼摘？', 'How can I take it without hurting him?', { f: 'surprised' }),
    L('yuweng', '那是你的事。', 'That\'s your problem.', { f: 'laugh', a: 'laugh' }),
    FADE(1, 0.6),

    // ---- the ledge: the white ape
    S('ledge'), MUS('battle'),
    A('yirui', 'yiruiT', [-9, 1.4], { f: 1, a: 'stance' }), A('ape', 'ape', [4.4, -0.6], { f: -1, a: 'apestand' }),
    C(-2, 2.2, 0, 16, 0, 6, 0), FADE(0, 0.6),
    FIGHT(
      f.at('yirui', [-12, 1.4], { air: -3, a: 'climb' }), f.leap('yirui', [-7, 1.4], 0.6, 2.6, { spin: 0, a: 'tuck', air: 0, land: 'land', f: 1 }), 1.0,
      f.cam(3.6, 2.6, -0.4, 10, -10, 4, 0.5), f.pose('ape', 'aperoar'), f.sfx('roar'), f.shake(0.35), f.gust([4.4, 2, 0], { power: 10, radius: 10 }), f.speed(0.5, 1.1, 'ape'), 1.3, f.pose('ape', 'apestand'),
    ),
    L('yirui', '我不是來傷你的。', 'I didn\'t come here to hurt you.', { f: 'calm', a: 'stance' }),
    FIGHT(
      // a charge and a swipe: a back-flip away
      f.cam(-4.8, 2.1, 0.8, 16.5, 0, 4, 0), f.dash('ape', [-4.4, 1.0], 0.4, { a: 'apeleap', then: 'apestand', color: '#ffffff' }), f.sfx('roar'), 0.3,
      f.hit1('ape', 'apeswipe', 'apestand', 0.4), 0.08, f.arc('ape', 'h', { color: COL.ape, s: 1.3 }), f.leap('yirui', [-9.2, 1.4], 0.5, 2.2, { spin: 1, f: 1, ghost: 1 }), 0.7,
      // a leap and a slam: the rock cracks, he is not there
      f.cam(-6.6, 2.8, 0.8, 18, 8, 6, 0.3), f.leap('ape', [-8.6, 1.2], 0.6, 3.4, { a: 'apeleap', land: 0, then: 'apeslam' }), 0.45,
      f.dash('yirui', [-4.6, 2.2], 0.18, { a: 'dash', then: 'stance', f: -1 }), 0.15,
      f.ring({ id: 'ape', up: 0 }, { r: 5 }), f.crack({ id: 'ape', dx: 1, up: 0 }, { s: 3.6 }), f.debris({ id: 'ape', dx: 1, up: 0.1 }, { n: 26 }), f.sfx('impact', 3), f.sfx('crack'), f.shake(0.5), f.stop(0.08), 0.6, f.pose('ape', 'apestand'), f.face('ape', 1),
      // a swipe, redirected: the ape's own weight carries it into the rock wall
      f.cam(-4.4, 1.8, 1.6, 10, -6, 4, 0.3), f.dash('ape', [-6.0, 1.8], 0.25, { a: 'apeleap', then: 'apestand', color: '#ffffff' }), 0.2,
      f.hit1('ape', 'apeswipe', 'apestand', 0.3), 0.06, f.arc('ape', 'h', { color: COL.ape, s: 1.2 }), f.pose('yirui', 'parry', { once: 1, then: 'stance', hold: 0.3 }), f.clang('yirui', 'ape', { n: 10 }),
      f.slow(0.35, { snap: 1 }), f.hit1('yirui', 'rise', 'stance', 0.3), f.arc('yirui', 'up', { color: '#ffe8b0', s: 0.8 }), f.dash('ape', [-1.4, -3.2], 0.5, { a: 'apestagger', then: 'apestagger', ghost: 0, dust: 1 }), 0.4, f.slow(1),
      f.fn((P) => { P.fx2.debris(V3(P, -1, 1.2, -4.6), 16, { floor: 0 }); P.cam.shake = 0.35; }), f.sfx('impact', 2), 0.7,
      // a grab: he slips under it, and stands behind
      f.face('ape', 1), f.pose('ape', 'apestand'), f.cam(-3, 1.8, 1, 12, 0, 6, 0.4), 0.3,
      f.dash('ape', [-3.4, 1.6], 0.3, { a: 'apegrab', then: 'apegrab', color: '#ffffff' }), 0.18, f.dash('yirui', [0.8, 1.9], 0.26, { a: 'sweep', then: 'stance', f: -1 }), f.speed(0.6, 0.3), 0.5, f.face('ape', 1),
      // he lowers the stick and closes his eyes
      f.pose('yirui', 'stanceC'), f.cam(-1.4, 2.2, 1.4, 10, -10, 4, 1.2), 1, f.pose('ape', 'aperoar'), f.sfx('roar'), f.shake(0.2), 1.2, f.pose('ape', 'apestand'), 1.6,
    ),
    L('yirui', '……我聽見了。你不是在守果子。你是在等人。', '…I can hear it. You aren\'t guarding the fruit. You\'re waiting for someone.', { f: 'calm', a: 'stanceC' }),
    FIGHT(f.pose('ape', 'apeyield'), f.sfx('grunt'), 1.4, f.walk('ape', [4.4, -0.6], { speed: 1.6 }), f.cam(2, 2, 0, 12, 0, 6, 2), 2.6, f.trig('fruit', 0), f.pose('ape', 'apeoffer'), f.walk('yirui', [2.4, -0.2], { f: 1 }), 1.6),
    CU('ape', 0.8, { d: 9, dy: -0.8 }), W(1),
    LOOK('yirui', 'yiruiH'), P('ape', 'apeyield'), W(0.8),
    L('yirui', '謝謝你。', 'Thank you.', { f: 'calm', a: 'bow' }),
    FADE(1, 0.8),

    // ---- the fire of the fruit
    S('valley', { mood: 'sunset' }), MUS('cave'),
    A('yirui', 'yiruiN', [-1.6, 1.4], { f: 1, a: 'meditate' }), A('yuweng', 'yuweng', [-3, 1.5], { f: 1 }),
    C(-2, 1.4, 1.4, 8, 0, 6, 0), FADE(0, 0.8),
    FIGHT(f.pose('yirui', 'eat'), 1.2, f.pose('yirui', 'burn'), f.sfx('ember'), f.meridians('yirui', { dur: 7, cols: ['#ff2a10', '#ff5a10', '#ff2a10'] }), f.aura('yirui', { color: '#ff6a3a', dur: 7 }), f.shake(0.15), 1.2),
    L('yirui', '好燙……像有火在骨頭裡燒！', 'It\'s burning… like there\'s fire in my bones!', { f: 'scared', a: 'burn' }),
    FIGHT(f.walk('yuweng', [-2.9, 1.5], { f: 1 }), 0.8, f.pose('yuweng', 'palmB'), f.sfx('palm'), f.pose('yirui', 'meditate'), f.meridians('yirui', { dur: 6, cols: ['#ff5a10', '#ffc030', '#7ad0ff'] }), 0.6),
    L('yuweng', '別壓它。跟著它走……一口氣，從丹田，到指尖。', 'Don\'t hold it down. Go with it… one breath, from your belly to your fingertips.', { f: 'calm', a: 'palmB' }),
    FIGHT(f.cam(-1.8, 1.6, 1.4, 6.4, -10, 4, 3), f.aura('yirui', { color: '#9ad4ff', dur: 4 }), 3.6),
    FADE(1, 0.6),
    S('valley', { mood: 'sunset' }), MUS('reveal'),
    A('yirui', 'yiruiT', [4, -16.2], { f: 1, a: 'stanceC' }), A('yuweng', 'yuweng', [2.6, -0.8], { f: 1 }),
    C(4, 4, -14, 17, 0, 8, 0), FADE(0, 0.6),
    FIGHT(
      f.aura('yirui', { color: '#9ad4ff', dur: 5 }), f.cam(4, 3, -14.6, 13, 0, 6, 1.6), 1.4,
      f.hit1('yirui', 'rise', 'stanceC', 3), 0.06, f.arc('yirui', 'up', { color: '#ffffff', s: 1.2 }), f.trig('part', 0.5), f.sfx('qi'), f.gust([4, 2, -16], { power: 8, radius: 10 }), f.swell(), 3.4,
      f.trig('unpart'), 1,
    ),
    C(2.6, 1.6, -0.8, 7, 10, 6, 1),
    L('yuweng', '嗯。這口氣，總算是你自己的了。', 'Hm. That breath is finally your own.', { f: 'happy' }),
    FADE(1, 1), W(0.3),
  ],
};
