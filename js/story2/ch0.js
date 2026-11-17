// 序幕: the storyteller's voice over 斷魂崖 at sunset.
import { S, C, N, TITLE, W, MUS, SND, FADE, FIGHT } from '../dsl.js?v=2';
import { f } from '../fight.js?v=2';
export default {
  id: 'b2c0', zh: '序幕', en: 'Prologue',
  beats: [
    S('cliff', { mood: 'sunset' }), MUS('story'), FADE(1, 0), C(30, -6, -30, 60, -10, 4, 0), FADE(0, 2.5),
    SND('clap'), W(0.8),
    C(30, -8, -40, 46, 4, 2, 9),
    N('列位看官，今兒個不說案子，說一把刀。', 'Ladies and gentlemen, today I won\'t tell you of a case. Today I tell you of a blade.'),
    N('江湖上一直有一句話：刀客一生，只有一次奇遇。', 'There is an old saying in the jianghu: a swordsman meets his great fortune only once in his life.'),
    C(4, 0, -2, 20, -18, 6, 8),
    N('龍門往西三十里，有座斷魂崖。崖下是龍門河最急的一段水，掉下去的人，從來沒有上來過。', 'Thirty li west of Longmen stands Soul-Severing Cliff. Beneath it runs the wildest stretch of the Longmen River, and no one who has fallen in has ever come back up.'),
    C(9, -30, -6, 40, 20, 50, 6),
    N('……除了一個。', '…Except one.'),
    SND('clap'),
    C(2, 2, -2, 16, -4, 6, 6),
    N('奕叡的那一次，是從一場慘敗開始的。', 'Yi Rui\'s fortune began with a crushing defeat.'),
    FIGHT(f.gust([0, 3, 0], { power: 4, radius: 20 }), f.sfx('wind')), W(0.6),
    FADE(1, 1.4), W(0.6),
    TITLE('卷二　斷崖刀心', 'Book Two: The Blade Heart Beneath the Cliff', ['龍門懸案錄', 'The Longmen Casebook']),
  ],
};
