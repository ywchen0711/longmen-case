# 龍門懸案錄
### The Longmen Casebook

An HD-2D animated wuxia novel in two books. The title screen lets you choose a book; each book keeps its own progress.

- **卷一　聽雨樓密室** (Book One: The Locked Room at Tingyu House): a voiced detective story you read and solve.
- **卷二　斷崖刀心** (Book Two: The Blade Heart Beneath the Cliff): a voiced martial-arts film you only watch.

---

## 卷一　聽雨樓密室

一部 HD-2D 武俠推理動畫小說。暴雨之夜，龍門渡口唯一的橋被洪水沖斷，一群要去參加選盟大會的江湖人困在十字路口的聽雨樓。天亮之前，盟庫總管「金算盤」錢萬里死在一間從裡面閂上的房裡，奕叡、奕碩兄弟戴著鐵鎖，要在天亮前把兇手找出來。

An HD-2D animated wuxia detective novel. On a night of storm the only bridge at the Longmen ferry goes down, and a houseful of martial-world travellers on their way to elect a new Alliance chief are trapped at Tingyu House, the teahouse at the crossroads. Before dawn the Alliance treasurer is found dead in a room bolted from the inside, and the brothers Yi Rui and Yi Shuo, in chains, have until sunrise to find the killer.

A standalone prequel to season one of 《龍門雙奕》 (it takes place a few months before 〈龍門血案〉).

**Play:** open `index.html` from any static web server (for example `python -m http.server`). No build step.

## 章節 Chapters (about 25–30 minutes with voices)

| | |
|---|---|
| 序章　龍門江湖 | The state of the Longmen jianghu, told over a table-top diorama of the region |
| 第一回　雨夜渡口 | The ferry in the rain; everyone arrives at Tingyu House; the bridge goes down |
| 第二回　醒木三更 | Dinner and a threat; the voice show behind the eight-foot screen; a knock at midnight; the locked room |
| 第三回　密室 | The search of the room: six clues, and the first deduction |
| 第四回　三個嫌疑 | A duel on the roof; a cut bridge; the Law Hall's secret; the second deduction |
| 第五回　八哥開口 | The myna speaks; the third deduction; the reveal and the fight |
| 終回　水退 | Dawn, and an epilogue at the storyteller's table |

Every clue the solution uses is shown before the reveal. Wrong answers get an in-character rebuttal and another try; there is no game over.

## 操作 Controls

| | Mouse / touch | Keyboard | Gamepad |
|---|---|---|---|
| Next line | click / tap | Space, Enter | A |
| Auto (timed to the voice) | 自動 Auto | A | X |
| Skip read lines | 快進 Skip | S (hold Ctrl to skip anything) | LB (hold RB) |
| Backlog (click a line to hear it again) | 回顧 Log | L | Back |
| Casebook | 線索簿 Casebook | C | Y |
| Chapter select | 章節 Chapters | | |
| Deductions | click a choice | arrows + Enter, or 1–4 | d-pad + A |
| Menu (volumes, text speed) | ☰ | Esc | Start |

中 / EN switches between Chinese and English text (the voices are Chinese). Progress, the language and volumes are saved in the browser.

## 卷二　斷崖刀心 · Book Two: The Blade Heart Beneath the Cliff

江湖上一直有一句話：刀客一生，只有一次奇遇。血刀門門主「斷魂刀」厲寒山來到龍門，奕叡的刀被他一刀折斷，奕碩被擄走，奕叡自己被打落斷魂崖。崖底的山谷裡，有一個不肯說出名字的獨臂漁翁、一面刻滿刀痕的石壁、一顆白猿守著的赤陽果。月圓之夜，他要帶著一把沒有名字的黑刀，去血楓谷把弟弟接回來。

There is an old saying: a swordsman meets his great fortune only once. Li Hanshan of the Blood Saber Gate snaps Yi Rui's saber, takes Yi Shuo hostage and knocks Yi Rui off Soul-Severing Cliff. In the hidden valley below are a one-armed fisherman who won't give his name, a wall carved with a master's sword marks, and a red fruit guarded by a white ape. By the full moon he has to reach Blood Maple Valley with a plain black blade.

Book Two plays by itself like a film (about 17 minutes with voices): no choices, no casebook. The fights carry the story, and you can see the hero grow in them, from fast and flashy to calm, precise and huge.

| | |
|---|---|
| 序幕 | The storyteller over the cliff at sunset |
| 第一回　斷刀 | One against four in the manor yard; the duel on the cliff; the saber snaps |
| 第二回　谷底 | The valley, the old fisherman, the cave of marks, one leaf |
| 第三回　瀑下 | Days under the waterfall; the white ape and the red fruit |
| 第四回　刀心 | Nine marks that are one stroke; the black blade 沉江; sparring in the first snow |
| 第五回　出谷 | An ambush taken in one long shot; one exchange with 冷笑天 |
| 第六回　血楓谷 | The duel among red maples: the lock, 血河九斬, the tenth cut, 一刀・天河 |
| 終回　歸 | The road home, and a lesson in listening |

Controls while watching: 暫停 Pause (P), 跳過 Skip (S, skips a line or the rest of a fight), 回顧 Log (L), 章節 Chapters, ☰ volumes (Esc), 中 / EN subtitles. A click, a tap or Space moves to the next line early.

## How it is made

- **People**: pixel-art sprites about three heads tall, drawn in code from a skeleton with hand-authored pixel heads (`js/art.js`, `js/heads.js`, from our own 亂世豪俠傳), with new looks for the whole Longmen cast in `js/looks.js`. They stand as billboards in the 3D sets, lean toward the camera, walk, gesture, talk and emote.
- **Sets** (`js/sets.js`, `js/kit.js`): lit 3D dioramas with pixel textures (nearest filtered): the map of the region, the ferry on the night river, Tingyu House outside and in, the upstairs corridor and the victim's room, the veranda, the kitchen, the rooftop, the broken bridge, the dawn courtyard, and a close-up table.
- **The HD-2D look** (`js/render.js`, `js/scene.js`, `js/fx.js`): three.js 0.160 with real-time shadows, swaying lanterns and flickering candles as point lights, tilt-shift depth of field, bloom, a colour grade per scene (cold rain, warm lantern hall, grey dawn, sepia for memories), rain with splashes, a flowing pixel river that mirrors the lanterns and rings with raindrops, mist and light shafts, lightning.
- **Story** (`js/story/ch*.js`): written in a small script language (`js/dsl.js`) of beats: sets, people, camera moves, lines, entrance poems, clues, deductions, move names, effects. `js/player.js` runs it and can jump to any line.
- **Book Two's fights** (`js/fight.js`, `js/fightrun.js`, `js/story2/moves.js`): each fight is a timeline of key poses and actions on game time, so slow motion stretches it and hit-stop freezes it: dashes with afterimages and dust, leaps and somersaults, knock-backs, skids that leave furrows, slash arcs, sword qi that travels and splits trees and rock, parries with sparks, blade locks, impact frames, speed lines, shockwave rings, ground cracks, camera cuts, push-ins, orbits and a camera that follows. New fighting poses are in `js/art.js`, the white ape in `js/beasts.js`, the effects in `js/fx2.js`.
- **Book Two's sets** (`js/sets2.js`): the cliff over the river, the manor yard, the hidden valley with its waterfall (which can part), the cave of marks, the ledge above a sea of clouds, mountain roads, and the hall in Blood Maple Valley, with layered mountains in aerial haze, swaying grass and branches, falling leaves, petals, snow and fireflies, birds, god rays and mist; brighter moods (sunrise, sunset, rain, moonlit snow, red dusk) and only a gentle tilt-shift.
- **Voices**: neural text-to-speech per character (`tools/voices.py`, edge-tts); the myna is its master's voice pitched up and crushed.

### Tools

```
node tools/lines.mjs > tools/lines.json              # everything that is spoken
PYTHONIOENCODING=utf-8 python tools/voices.py tools/lines.json   # records audio/v/*.mp3, audio/voices.json
```

`window.G` exposes hooks for testing: `G.book(1|2)`, `G.jump(chapter, beat)`, `G.step(seconds)`, `G.runAll()`; `G.hold = true` stops the clock so frames can be stepped one by one.

See [CREDITS.md](CREDITS.md) for the assets and their licences.
