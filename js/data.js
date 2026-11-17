// Who is who, the entrance poems, the clues of the casebook and the three deductions.
export const NAMES = {
  narr: ['', ''], yirui: ['奕叡', 'Yi Rui'], yishuo: ['奕碩', 'Yi Shuo'], qian: ['錢萬里', 'Qian Wanli'], wen: ['溫如玉', 'Wen Ruyu'],
  baixian: ['白先生', 'Mr. Bai'], shouhou: ['瘦猴', 'Monkey'], tie: ['鐵無私', 'Tie Wusi'], liu: ['柳寒煙', 'Liu Hanyan'], xiaolian: ['小蓮', 'Lian'],
  kuchan: ['苦禪大師', 'Master Kuchan'], xiaotian: ['冷笑天', 'Leng Xiaotian'], daoba: ['刀疤', 'Scar'], ferry: ['艄公', 'Ferryman'], bird: ['八哥', 'The myna'],
  voice: ['門裡的聲音', 'A voice behind the door'], all: ['眾人', 'Everyone'],
};
// the cast's colour in the name plate
export const HUE = { yirui: '#6a9cff', yishuo: '#ffa04a', qian: '#e0b040', wen: '#9ac8a0', baixian: '#b8c4d8', shouhou: '#a8b878', tie: '#e05a4a', liu: '#a8d8f0', xiaolian: '#ff9ab8', kuchan: '#f0b860', xiaotian: '#ff5a5a', daoba: '#a0a0a0', ferry: '#c8b080', bird: '#f0d040', voice: '#c0c0c0' };

export const POEMS = {
  yirui: { title: ['啟程刀客', 'The Saber Who Sets Out'], zh: ['孤刀一柄出龍門', '不問前程問本心', '縱使天下皆疑我', '一刀啟程萬里新'], en: ['One lone saber leaves the Dragon Gate;', 'I ask my heart, not where the road will lead.', 'Though all the world should doubt me,', 'one stroke sets out, and a new road opens.'] },
  yishuo: { title: ['旋風少俠', 'The Whirlwind Kid'], zh: ['腳下生風不讓人', '一球踢散滿天雲', '江湖莫笑年紀小', '旋風起處見真心'], en: ['Wind at my feet, I give no ground;', 'one kick scatters every cloud.', 'Jianghu, don\'t laugh because I\'m small:', 'where the whirlwind rises, a true heart shows.'] },
  qian: { title: ['金算盤', 'The Golden Abacus'], zh: ['金珠一撥算乾坤', '一文一釐不饒人', '賬本從來不說謊', '說謊從來是活人'], en: ['One flick of gold beads reckons heaven and earth;', 'not a copper, not a hair, goes unforgiven.', 'A ledger has never told a lie;', 'the liars have always been the living.'] },
  wen: { title: ['盟庫書辦', 'Clerk of the Alliance Treasury'], zh: ['青衫一領墨沾襟', '賬裡乾坤算到今', '人道書生溫似玉', '玉碎方知石有心'], en: ['A plain blue gown, ink on the collar;', 'he has kept the sums of heaven and earth till now.', 'They say the scholar is gentle as jade;', 'only when jade breaks do you see the stone inside.'] },
  shouhou: { title: ['聽雨樓跑堂', 'Waiter of Tingyu House'], zh: ['人稱瘦猴跑得快', '打架不行嘴巴壞', '今日改邪歸正路', '明日說書賺大財'], en: ['They call me Monkey — quick on my feet,', 'no good in a fight, but a mouth that bites.', 'Today I\'ve left the crooked road;', 'tomorrow I\'ll tell tales and make my fortune.'] },
  baixian: { title: ['聽雨樓說書人', 'Storyteller of Tingyu House'], zh: ['醒木一聲說古今', '三分真話七分音', '台前道盡他人事', '莫問先生是何人'], en: ['One clap of the block tells old and new;', 'three parts truth, and seven parts voice.', 'On stage I tell all of other men\'s affairs —', 'don\'t ask who the teller is.'] },
  tie: { title: ['執法堂主', 'Master of the Law Hall'], zh: ['鐵面一張不認親', '律條兩字重千鈞', '是非黑白憑真證', '天下無人敢欺心'], en: ['An iron face that knows no kin;', 'two words, The Law, weigh a thousand tons.', 'Right and wrong rest on true proof;', 'no one under heaven dares deceive me.'] },
  liu: { title: ['寒江閣主', 'Mistress of the Cold River Pavilion'], zh: ['寒江獨釣一蓑煙', '劍出霜飛雪滿天', '莫道女兒心似水', '水能載舟亦覆船'], en: ['Alone she fishes the cold river in a cape of mist;', 'her sword comes out and frost fills the sky.', 'Don\'t say a woman\'s heart is soft as water —', 'water carries the boat, and water sinks it.'] },
  kuchan: { title: ['千佛寺住持', 'Abbot of Thousand Buddha Temple'], zh: ['一杖芒鞋踏破塵', '千佛座下了凡心', '世間生死皆是相', '何必執著假與真'], en: ['A staff and straw sandals tread through the dust;', 'beneath a thousand Buddhas, the worldly heart is stilled.', 'Life and death in this world are appearances;', 'why cling so hard to false and true?'] },
  xiaotian: { title: ['暴龍', 'The Tyrant Dragon'], zh: ['冷笑三聲天下寒', '暴龍一怒海波翻', '世人笑我狂且傲', '我笑世人看不穿'], en: ['Three cold laughs and the world goes cold;', 'the Tyrant Dragon rages and the seas turn over.', 'The world laughs at me for my pride —', 'I laugh at a world that cannot see through.'] },
};

// ---- book two: 斷崖刀心
Object.assign(NAMES, { lihan: ['厲寒山', 'Li Hanshan'], yuweng: ['獨臂漁翁', 'The One-Armed Fisherman'], yiruiB: ['奕叡', 'Yi Rui'], xuedao: ['血刀門弟子', 'Blood Saber Disciple'], guard: ['血刀門守衛', 'Blood Saber Guard'], heixiong: ['黑熊', 'Black Bear'], bandit: ['山賊', 'Bandit'], ape: ['白猿', 'The White Ape'], villager: ['村民', 'Villager'] });
Object.assign(HUE, { lihan: '#e84858', yuweng: '#e0d0a8', yiruiB: '#6a9cff', xuedao: '#c86a6a', guard: '#c86a6a', heixiong: '#b89070', bandit: '#a09080', villager: '#c0b8a0' });
Object.assign(POEMS, {
  lihan: { title: ['斷魂刀', 'The Soul-Severing Blade'], zh: ['白髮如霜刀似血', '九斬之下不留人', '平生最恨一輸字', '天下無刀可並論'], en: ['Hair white as frost, a blade the colour of blood;', 'beneath nine cuts, no one is left standing.', 'All my life I have hated one word: lose.', 'No blade under heaven stands beside mine.'] },
  yuweng: { title: ['獨臂漁翁', 'The One-Armed Fisherman'], zh: ['一竿一笠一扁舟', '半生恩怨付江流', '莫問老夫名與姓', '魚不上鉤也自由'], en: ['One rod, one hat, one little boat;', 'half a life of debts and grudges, given to the river.', 'Don\'t ask this old man his name —', 'a fish that won\'t bite is free as well.'] },
  yiruiB: { title: ['沉江刀客', 'The Saber of the Sunken River'], zh: ['斷刀沉谷水無聲', '瀑下千回聽此心', '刀不在手何須快', '一刀未出已分明'], en: ['The broken blade sank; the valley water made no sound.', 'A thousand times beneath the falls I listened to this heart.', 'The blade is not in the hand — why should it be fast?', 'Before it is drawn, everything is already clear.'] },
});

// The clues. pic: which little picture (clues.js draws them).
export const CLUES = {
  candle: { zh: '燭・茶・血', en: 'Candle, tea, blood', pic: 'candle', tz: '錢萬里桌上的蠟燭只燒了一指長，是戌時末點上的，點上不久就熄了。茶壺冰冷；他身下的血，邊緣已經乾了。', te: 'The candle on Qian Wanli\'s table burned down only a finger\'s width. It was lit late in the Hour of the Dog and went out soon after. The teapot is stone cold; the blood under him has dried at the edges.' },
  bolt: { zh: '門閂上的細痕', en: 'A groove in the bolt', pic: 'bolt', tz: '門閂上有一道新磨出的細溝，卡著一截銀白絲線：寒江閣特製的釣線。門閂是有人在門外隔著門縫，用線拉上的。', te: 'A fresh thin groove is worn into the bolt, with a shred of silver-white silk caught in it: fishing line, the kind the Cold River Pavilion makes. Someone pulled the bolt shut from outside, through the gap of the door, with a line.' },
  palm: { zh: '門框上的掌印', en: 'A palm print on the frame', pic: 'palm', tz: '門框上燒焦了一個掌印，掌形粗大，帶著灼痕。整座樓裡，只有冷笑天的掌力能留下這種印子。', te: 'A palm print is scorched into the door frame, broad and burned. In this whole house only Leng Xiaotian\'s palm could leave a mark like that.' },
  page: { zh: '撕下的賬頁', en: 'A torn ledger page', pic: 'page', tz: '錢萬里的拳頭裡攥著一張撕下的賬頁，頁角蓋著執法堂的大印：鐵無私的印。', te: 'Qian Wanli\'s fist is clenched on a torn ledger page. Its corner bears the great seal of the Law Hall: Tie Wusi\'s seal.' },
  lock: { zh: '令刀匣的鎖', en: 'The lock of the saber case', pic: 'lock', tz: '匣上的龍門鎖沒有撬痕。開鎖的人若不是有鑰匙，就是摸透了這把鎖。一路上碰過這個匣子的，只有奕叡、奕碩，和渡船上幫忙搬行李的人。', te: 'The Longmen lock on the case was not forced. Whoever opened it had a key, or knew the lock by heart. On the way here only Yi Rui, Yi Shuo, and the one who helped with the luggage on the ferry ever touched the case.' },
  bird: { zh: '籠中八哥', en: 'The myna in its cage', pic: 'bird', tz: '八哥在籠裡縮成一團，一聲不吭。籠裡的水碗翻倒了，碗底是乾的。', te: 'The myna huddles in its cage and makes no sound. Its water dish has been knocked over; the bottom of the dish is dry.' },
  ropes: { zh: '斷橋的繩頭', en: 'The ends of the bridge ropes', pic: 'ropes', tz: '橋繩的斷口平整如削，是刀割的，不是水沖斷的。有人在洪水沖垮橋之前，就先割斷了繩子：困住整座樓的人，是故意的。', te: 'The bridge ropes end in clean cuts, made by a blade, not torn by the flood. Someone cut them before the water came. Trapping everyone in the house was a plan.' },
  line: { zh: '被剪走的釣線', en: 'The stolen fishing line', pic: 'line', tz: '柳寒煙掛在迴廊木釘上的釣線少了一大截，斷口是剪的。偷線的人，是能走上迴廊的人。', te: 'A long piece is missing from the line Liu Hanyan left on its peg on the veranda, and the end was cut with scissors. The thief was someone who could walk out onto the veranda.' },
  seal: { zh: '鐵無私的密約', en: 'Tie Wusi\'s secret pact', pic: 'seal', tz: '錢萬里是鐵無私的暗線，大印是鐵借給他、用來抄出真賬的。那張賬頁，就是錢要在天亮時拿出來的證據。可是賬箱已經空了。', te: 'Qian Wanli was Tie Wusi\'s secret informant. Tie lent him the seal so he could copy out the true accounts. The torn page was the proof Qian meant to show at dawn. But the ledger box is now empty.' },
  screen: { zh: '屏風後的證人', en: 'A witness behind the screen', pic: 'screen', tz: '小蓮一整場都躲在台側偷看口技的門道。白先生從頭到尾沒離開過屏風後的椅子，醒木一直握在他的左手。', te: 'Lian hid at the side of the stage through the whole show, trying to learn the trick. Mr. Bai never left his chair behind the screen, and the clapper block never left his left hand.' },
  parrot: { zh: '冷笑天的證詞', en: 'Leng Xiaotian\'s account', pic: 'parrot', tz: '子時，冷笑天敲門，門裡回了一句：「誰？走開！明天再說！」他笑，是因為那聲音「像隻八哥在背書」。', te: 'At midnight Leng Xiaotian knocked, and from behind the door came: "Who\'s there? Go away! Tomorrow!" He laughed because the voice sounded "like a parrot reciting its lesson."' },
  phrase: { zh: '八哥的另一句話', en: 'The myna\'s other phrase', pic: 'phrase', tz: '八哥喝了水、安靜下來，用一種輕柔客氣的聲音，說出它那晚聽見的另一句話：「……失禮了，錢大人。」', te: 'Once it had water and calmed down, the myna spoke another phrase it heard that night, in a soft, polite voice: "…Pardon me, Lord Qian."' },
};
export const CLUE_ORDER = Object.keys(CLUES);

// The deductions: a question and choices; a wrong choice gets a rebuttal from someone who knows better.
export const ASKS = {
  time: {
    zh: '錢萬里是什麼時候死的？', en: 'When did Qian Wanli die?',
    opts: [
      { zh: '子時之後——冷笑天子時還聽見他說話。', en: 'After midnight. Leng Xiaotian heard him talk at midnight.', who: 'tie', rz: '燭只燒了一指，茶早涼透。子時還活著的人，桌上不會是這副樣子。', re: 'The candle burned one finger and the tea is long cold. A man alive at midnight doesn\'t leave a table like that.' },
      { zh: '亥時前後——燭只燒了一指，茶冷，血乾。', en: 'Around the Hour of the Pig (9–11 pm): the candle burned one finger, the tea is cold, the blood is dry.', ok: 1 },
      { zh: '丑時——小蓮發現血的時候。', en: 'In the Hour of the Ox (1–3 am), when Lian found the blood.', who: 'xiaolian', rz: '我看見的時候，門外那攤血邊上都乾了！才不是剛流出來的。', re: 'When I saw it, the edges of the blood outside the door were already dry! It wasn\'t fresh.' },
      { zh: '戌時晚飯時——他根本沒回房。', en: 'At dinner, in the Hour of the Dog (7–9 pm). He never went back to his room.', who: 'yishuo', rz: '哥，他明明上樓了，大家都看見溫先生扶他上去的。', re: 'Brother, he did go upstairs. Everyone saw Mr. Wen help him up.' },
    ],
  },
  why: {
    zh: '兇手為什麼要讓冷笑天在子時「聽見」錢萬里？', en: 'Why did the killer let Leng Xiaotian "hear" Qian Wanli at midnight?',
    opts: [
      { zh: '為了嫁禍冷笑天。', en: 'To frame Leng Xiaotian.', who: 'xiaotian', rz: '嫁禍？哈。我聽見他還活著，正好證明我子時沒殺他。這不是嫁禍，是替我作證。', re: 'Frame me? Ha. If I heard him alive, that proves I didn\'t kill him at midnight. That isn\'t a frame. It\'s an alibi for me.' },
      { zh: '為了拖延發現屍體的時間。', en: 'To delay the finding of the body.', who: 'yirui', rz: '拖延時間用不著冒這麼大的險。那句話不是為了「拖」時間，是為了「定」時間。', re: 'He wouldn\'t take such a risk just to buy time. That voice wasn\'t meant to delay the time of death. It was meant to fix it.' },
      { zh: '讓眾人以為錢萬里子時還活著，而兇手子時正坐在眾人眼前。', en: 'To make everyone think Qian was alive at midnight — while the killer sat in plain sight.', ok: 1 },
      { zh: '錢萬里其實不是死在房裡。', en: 'Qian didn\'t really die in his room.', who: 'tie', rz: '屍體、血、刀，都在那間房裡。他就死在那裡。', re: 'The body, the blood, the blade, all in that room. He died there.' },
    ],
  },
  who: {
    zh: '那晚在錢萬里房裡說「失禮了」的，是誰？', en: 'Who said "Pardon me" in Qian Wanli\'s room that night?',
    opts: [
      { zh: '瘦猴', en: 'Monkey', who: 'shouhou', rz: '我？我這張嘴罵人罵得溜，「失禮」兩個字這輩子沒說過！', re: 'Me? This mouth of mine can curse you up and down, but it has never once said "pardon me"!' },
      { zh: '白先生', en: 'Mr. Bai', who: 'baixian', rz: '老朽一整夜坐在屏風後頭，小蓮姑娘可以作證。', re: 'I sat behind the screen all night, young man. Miss Lian can vouch for that.' },
      { zh: '溫如玉', en: 'Wen Ruyu', ok: 1 },
      { zh: '小蓮', en: 'Lian', who: 'xiaolian', rz: '我才不說那麼文謅謅的話呢！', re: 'I never say fancy things like that!' },
    ],
  },
};
// the recording of a shouted move name (ASCII file names)
export const callId = (id, zh) => 'call_' + id + '_' + [...zh].map((c) => c.codePointAt(0).toString(36)).join('');
