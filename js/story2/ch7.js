// 終回 歸: the road home at sunset; the old man far away on a lake, then gone; the dojo at dusk, a lesson in
// listening, and a ball through a lantern.
import { S, A, M, P, F, E, LOOK, H, C, CU, TWO, L, N, TITLE, CARD, W, MUS, SND, FADE, FIGHT, TRIG, JUGGLE, END } from '../dsl.js?v=3';
import { f } from '../fight.js?v=3';

export default {
  id: 'b2c7', zh: '終回　歸', en: 'Last Chapter: Homeward',
  beats: [
    S('road', { kind: 'lake', mood: 'sunset' }), MUS('title'), FADE(1, 0),
    A('yirui', 'yiruiB', [-12, 1], { f: 1 }), A('yishuo', 'yishuo', [-13.2, 1.6], { f: 1 }), JUGGLE('yishuo', 1),
    A('yuweng', 'yuwengR', [14, -34], { f: -1, a: 'fish' }),
    C(-6, 2, -2, 18, 0, 8, 0), FADE(0, 1.6),
    TITLE('終回　歸', 'Last Chapter: Homeward'),
    M('yirui', [-2, 1]), M('yishuo', [-3.2, 1.6]), C(-2.6, 1.5, 1.2, 9.6, 6, 6, 5), W(4.6),
    L('yishuo', '哥，你變了。', 'Brother, you\'ve changed.', { f: 'calm', a: 'juggle' }),
    L('yirui', '刀沒變。是我學會聽了。', 'The blade hasn\'t. I\'ve learned to listen.', { f: 'calm' }),
    L('yishuo', '那你現在聽得見我在想什麼嗎？', 'So can you hear what I\'m thinking right now?', { f: 'happy', a: 'juggle' }),
    L('yirui', '你在想晚飯。', 'You\'re thinking about dinner.', { f: 'laugh' }),
    E('yishuo', '!'),
    L('yishuo', '……好厲害！', '…That\'s amazing!', { f: 'excited', a: 'juggle' }),
    // the far boat on the lake
    F('yirui', -1), C(10, 1.2, -30, 20, -4, 4, 2.4), W(2.6),
    N('湖心，有一葉小舟。一個獨臂的老人，戴著斗笠，正在釣魚。', 'Out on the lake there was a little boat. A one-armed old man in a straw hat sat in it, fishing.'),
    C(-2, 1.6, 1, 8, 20, 6, 1.2), P('yirui', 'salute'), W(1.6),
    C(10, 1.2, -30, 20, -4, 4, 1.4), W(1.4),
    FIGHT(f.fn((P) => { const y = P.actor('yuweng'); if (!y) return; const m = y.body.mesh.material; m.transparent = true; m.alphaTest = 0.02; m.needsUpdate = true; P.fx2.tween(2, (k) => { m.opacity = 1 - k; }); P.fx2.tween(2, (k) => { P.D.boatFade?.(1 - k); }); }), 2.2, f.trig('boat', 0), f.hide('yuweng'), 0.6),
    N('再一眨眼，湖上只剩下霧。', 'In the blink of an eye, there was only mist on the water.'),
    FADE(1, 1.2),

    // ---- the dojo at dusk
    S('village', { mood: 'dusk' }), MUS('village'),
    A('yirui', 'yiruiB', [-1.4, 1.2], { f: 1, a: 'stand' }), A('yishuo', 'yishuo', [1.0, 1.4], { f: -1, a: 'stand' }), JUGGLE('yishuo', 1),
    C(0, 2.4, 0, 15, 0, 10, 0), FADE(0, 1.2),
    C(-0.2, 1.6, 1.3, 9, 0, 6, 2.4), W(1.2),
    L('yirui', '閉上眼睛。別看球，聽它。', 'Close your eyes. Don\'t watch the ball. Listen to it.', { f: 'calm', a: 'stand' }),
    L('yishuo', '聽球？球又不會說話。', 'Listen to a ball? Balls don\'t talk.', { f: 'surprised', a: 'juggle' }),
    L('yirui', '它落下來的時候，風會告訴你。', 'When it comes down, the wind will tell you.', { f: 'calm' }),
    FIGHT(f.pose('yishuo', 'juggle'), f.cu('yishuo', 0.8), 2.0),
    L('yishuo', '……聽見了！', '…I hear it!', { f: 'excited', a: 'juggle' }),
    FIGHT(
      f.cam(0.6, 2.2, -0.6, 12, 0, 6, 0.4), f.pose('yishuo', 'kick', { once: 1, then: 'stand', hold: 0.5 }), f.fn((P) => { P.actor('yishuo').juggle(false); }), f.sfx('kick'),
      f.ball('yishuo', [2.0, 3.0, -2.2], { dur: 0.35, up: 0.2 }), 0.35, f.trig('lantern', 2), f.sfx('lantern'), 1.6,
    ),
    E('yishuo', 'sweat'), E('yirui', '…'),
    L('yishuo', '……聽見燈籠破的聲音了。', '…I heard the lantern break.', { f: 'shy', a: 'stand' }),
    L('yirui', '哈哈哈……那也算是聽見了。', 'Ha ha ha… well, that counts as hearing.', { f: 'laugh', a: 'laugh' }),
    C(0, 3, -1, 22, 0, 12, 6), W(1),
    N('列位看官：刀客一生，只有一次奇遇。', 'Ladies and gentlemen: a swordsman meets his great fortune only once in his life.'),
    SND('clap'),
    N('可是學會聽的人，往後的每一天，都是奇遇。', 'But for one who has learned to listen, every day after is a fortune of its own.'),
    FADE(1, 2), W(0.6),
    TITLE('卷二　斷崖刀心　完', 'Book Two: The Blade Heart Beneath the Cliff — The End'),
    END(),
  ],
};
