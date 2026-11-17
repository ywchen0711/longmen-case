// What everyone in the Longmen jianghu wears. A look: skin, hair, beard, hat (+ colours), robe, pants, boots, belt,
// cape, the thing in the hand (wpn, wpn2 in the back hand), and flags: size, fat, kid (short limbs, so the head reads
// big), fierce brows, long hair, lashes, blush, a mole, a scar, a sheathed blade on the hip (sheath), and holdIdle
// (keeps holding its thing in calm poses).
const SK = { fair: '#f2c8a0', warm: '#e8b48a', tan: '#d49a6a', dark: '#b07a52', pale: '#f6d8b8' };
export const LOOKS = {
  // the brothers of the Longmen Saber Manor
  yirui:    { key: 'yirui', skin: SK.fair, hair: '#1a1420', hat: 'band', hatC: '#3a72d8', robe: '#2e3a7e', robe2: '#c8d2ee', pants: '#1e2444', boots: '#2a2026', belt: '#5a4a3a', wpn: 'ringsaber', sheath: 1, skirt: 0.62, sash: '#3a72d8', brow: 1.1 },
  yishuo:   { key: 'yishuo', kid: 1, size: 0.92, skin: SK.warm, hair: '#1a1410', hat: 'tuft', hatC2: '#d83a2a', robe: '#e0762a', robe2: '#f4dca0', pants: '#4a3a2a', boots: '#3a2a20', belt: '#8a3a1a', skirt: 0.4, mole: 1 },
  // the Tyrant Dragon of 暴龍崖
  xiaotian: { key: 'xiaotian', skin: SK.pale, hair: '#dfe3ea', longHair: 1, hat: 'horns', robe: '#1c1a22', robe2: '#d8b040', pants: '#141218', boots: '#1a1418', belt: '#d8b040', beltGold: 1, cape: '#b8202a', fierce: 1, brow: 1.3, size: 1.08, skirt: 0.72 },
  // the storyteller of 聽雨樓: long sleeves, the clapper always in his LEFT hand (see actors.js)
  baixian:  { key: 'baixian', skin: SK.fair, hair: '#6a6460', hat: 'scholar', hatC: '#2a2a34', robe: '#5a6a7e', robe2: '#e8e0c8', pants: '#2a2a34', sleeveLong: 1, skirt: 0.92, beard: 'goatee', beardC: '#8a847e', belt: '#3a3040' },
  baixianL: { key: 'baixianL', skin: SK.fair, hair: '#6a6460', hat: 'scholar', hatC: '#2a2a34', robe: '#5a6a7e', robe2: '#e8e0c8', pants: '#2a2a34', sleeveLong: 1, skirt: 0.92, beard: 'goatee', beardC: '#8a847e', belt: '#3a3040', wpn: 'xingmu', holdIdle: 1 },
  baixianR: { key: 'baixianR', skin: SK.fair, hair: '#6a6460', hat: 'scholar', hatC: '#2a2a34', robe: '#5a6a7e', robe2: '#e8e0c8', pants: '#2a2a34', sleeveLong: 1, skirt: 0.92, beard: 'goatee', beardC: '#8a847e', belt: '#3a3040', wpn2: 'xingmu', holdIdle: 1 },
  // the law hall
  tie:      { key: 'tie', skin: SK.tan, hair: '#141010', hat: 'official', hatC: '#1a1a20', robe: '#2a2a32', robe2: '#9a1e1e', pants: '#18181e', boots: '#141214', belt: '#9a1e1e', beltGold: 1, beard: 'mustache', fierce: 1, brow: 1.5, wpn: 'chain', size: 1.1, cape: '#3a1418', skirt: 0.66 },
  // 寒江閣
  liu:      { key: 'liu', skin: SK.pale, hair: '#141018', longHair: 1, hat: 'bun', hatC: '#9ad0c8', robe: '#dbe6ee', robe2: '#4a6a8e', pants: '#b8c8d8', boots: '#4a5a6a', belt: '#4a6a8e', sleeveLong: 1, skirt: 0.95, lashes: 1, lips: '#b87a80', wpn: 'sword', sheath: 1, cape: '#a8bccc', size: 1.0 },
  liuRod:   { key: 'liuRod', skin: SK.pale, hair: '#141018', longHair: 1, hat: 'bun', hatC: '#9ad0c8', robe: '#dbe6ee', robe2: '#4a6a8e', pants: '#b8c8d8', boots: '#4a5a6a', belt: '#4a6a8e', sleeveLong: 1, skirt: 0.95, lashes: 1, lips: '#b87a80', wpn: 'rod', holdIdle: 1, cape: '#a8bccc' },
  xiaolian: { key: 'xiaolian', kid: 1, size: 0.88, skin: SK.pale, hair: '#1a1410', hat: 'twinbun', hatC2: '#e04a6a', robe: '#e88aa0', robe2: '#fff0f0', pants: '#c86a80', boots: '#5a3a3a', belt: '#fff0f0', skirt: 0.8, lashes: 1, blush: 1 },
  // 千佛寺
  kuchan:   { key: 'kuchan', skin: SK.warm, hair: '#e8e4dc', hat: 'bald', robe: '#c87a2a', robe2: '#8a3a1a', pants: '#8a5a2a', boots: '#4a3a2a', beard: 'long', beardC: '#eeeae2', wpn: 'staff', holdIdle: 1, skirt: 0.88, size: 1.04, sash: '#8a3a1a' },
  // 聽雨樓's waiter, once a 黑風寨 bandit
  shouhou:  { key: 'shouhou', size: 0.92, skin: SK.tan, hair: '#2a1a10', hat: 'cloth', hatC: '#7a8a6a', robe: '#6a7a5a', robe2: '#e8dcc0', pants: '#4a4a3a', boots: '#3a2a20', belt: '#e8dcc0', skirt: 0.42, beard: 'stubble' },
  shouhouT: { key: 'shouhouT', size: 0.92, skin: SK.tan, hair: '#2a1a10', hat: 'cloth', hatC: '#7a8a6a', robe: '#6a7a5a', robe2: '#e8dcc0', pants: '#4a4a3a', boots: '#3a2a20', belt: '#e8dcc0', skirt: 0.42, beard: 'stubble', wpn: 'tray', holdIdle: 1 },
  // the Alliance treasurer and his clerk
  qian:     { key: 'qian', fat: 1, size: 1.1, skin: SK.fair, hair: '#2a2420', hat: 'melon', hatC: '#3a1a22', hatC2: '#d8302a', robe: '#8a2a3e', robe2: '#e8c050', pants: '#3a1a22', boots: '#2a1a1a', belt: '#e8c050', beltGold: 1, beard: 'mustache', sleeveLong: 1, skirt: 0.85, wpn: 'abacus', wpn2: 'cage', holdIdle: 1 },
  qianA:    { key: 'qianA', fat: 1, size: 1.1, skin: SK.fair, hair: '#2a2420', hat: 'melon', hatC: '#3a1a22', hatC2: '#d8302a', robe: '#8a2a3e', robe2: '#e8c050', pants: '#3a1a22', boots: '#2a1a1a', belt: '#e8c050', beltGold: 1, beard: 'mustache', sleeveLong: 1, skirt: 0.85, wpn: 'abacus', holdIdle: 1 },
  wen:      { key: 'wen', size: 0.98, skin: SK.pale, hair: '#1a1410', hat: 'bun', hatC: '#3a4a3a', robe: '#c8d4c0', robe2: '#5a6a5a', pants: '#6a7a6a', boots: '#3a3a30', belt: '#5a6a5a', sleeveLong: 1, skirt: 0.92 },
  wenL:     { key: 'wenL', size: 0.98, skin: SK.pale, hair: '#1a1410', hat: 'bun', hatC: '#3a4a3a', robe: '#c8d4c0', robe2: '#5a6a5a', pants: '#6a7a6a', boots: '#3a3a30', belt: '#5a6a5a', sleeveLong: 1, skirt: 0.92, wpn: 'ledger', holdIdle: 1 },
  wenC:     { key: 'wenC', size: 0.98, skin: SK.pale, hair: '#1a1410', hat: 'bun', hatC: '#3a4a3a', robe: '#c8d4c0', robe2: '#5a6a5a', pants: '#6a7a6a', boots: '#3a3a30', belt: '#5a6a5a', sleeveLong: 1, skirt: 0.92, wpn: 'case', holdIdle: 1 },
  wenB:     { key: 'wenB', size: 0.98, skin: SK.pale, hair: '#1a1410', hat: 'bun', hatC: '#3a4a3a', robe: '#c8d4c0', robe2: '#5a6a5a', pants: '#6a7a6a', boots: '#3a3a30', belt: '#5a6a5a', sleeveLong: 1, skirt: 0.92, wpn: 'brush', wpn2: 'brush', fierce: 1, brow: 1.1 },
  yiruiC:   { key: 'yiruiC', skin: SK.fair, hair: '#1a1420', hat: 'band', hatC: '#3a72d8', robe: '#2e3a7e', robe2: '#c8d2ee', pants: '#1e2444', boots: '#2a2026', belt: '#5a4a3a', wpn: 'case', holdIdle: 1, sheath: 1, skirt: 0.62, sash: '#3a72d8', brow: 1.1 },
  wenS:     { key: 'wenS', size: 0.98, skin: '#f6d8b8', hair: '#1a1410', hat: 'bun', hatC: '#3a4a3a', robe: '#c8d4c0', robe2: '#5a6a5a', pants: '#6a7a6a', boots: '#3a3a30', belt: '#5a6a5a', sleeveLong: 1, skirt: 0.92, wpn: 'ringsaber' },
  // 黑風寨's 刀疤
  daoba:    { key: 'daoba', skin: SK.tan, hair: '#1a1410', hat: 'band', hatC: '#2a2a2a', robe: '#3a3a3a', robe2: '#6a2a1a', pants: '#2a2622', boots: '#1a1612', belt: '#6a4a2a', beard: 'stubble', scar: 1, fierce: 1, brow: 1.4, wpn: 'saber', skirt: 0.45 },
  // the ferryman in his straw hat and rain cape
  ferry:    { key: 'ferry', skin: SK.dark, hair: '#2a2420', hat: 'straw', hatC: '#c8a860', robe: '#4a5a6a', robe2: '#8a7a5a', pants: '#3a4048', boots: '#2a2420', beard: 'stubble', wpn: 'pole', holdIdle: 1, cape: '#8a7a48', skirt: 0.4, bareLeg: 1 },
};
const pick = (a, r) => a[Math.floor(r * a.length) % a.length];
export function rnd(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; }; }
const TYPES = {
  villager: (r) => ({ skin: pick([SK.fair, SK.warm, SK.tan], r()), hair: pick(['#1a1410', '#3a2a1a', '#8a847a'], r()), hat: pick(['bun', 'cloth', 'straw', 'melon'], r()), hatC: pick(['#4a6a8a', '#8a4a3a', '#6a6a4a', '#c8a860'], r()), hatC2: '#c83a2a', robe: pick(['#6a8aa8', '#a86a5a', '#8aa86a', '#c8b07a', '#9a7aa8'], r()), robe2: pick(['#e8dcc0', '#4a3a2a'], r()), beard: pick(['none', 'none', 'goatee', 'mustache', 'stubble'], r()), sleeveLong: 1, skirt: pick([0.6, 0.85], r()) }),
  lady: (r) => ({ skin: SK.pale, hair: '#1a1410', hat: 'bun', hatC: '#e0b040', robe: pick(['#d87a8a', '#8ab0d8', '#e0a878', '#b898d0'], r()), robe2: '#f4ecd8', beard: 'none', sleeveLong: 1, skirt: 0.95, longHair: 1, size: 0.94, lashes: 1, lips: '#c8847a', blush: 1 }),
  kid: (r) => ({ kid: 1, size: 0.86, skin: pick([SK.warm, SK.fair], r()), hair: '#1a1410', hat: pick(['tuft', 'twinbun'], r()), hatC2: pick(['#d83a2a', '#3a8ad8'], r()), robe: pick(['#e0a040', '#6aa86a', '#d87a8a'], r()), robe2: '#f4ecd8', skirt: 0.6 }),
};
export function lookOf(type, seed = 1) {
  if (LOOKS[type]) return LOOKS[type];
  const L = TYPES[type](rnd(seed * 7919 + type.length * 31 + 17)); L.key = type + ':' + seed; return L;
}
// the brothers in the Law Hall's chains
LOOKS.yiruiK = { ...LOOKS.yirui, key: 'yiruiK', cuffs: 1 };
LOOKS.yishuoK = { ...LOOKS.yishuo, key: 'yishuoK', cuffs: 1 };

// ---- book two
// 斷魂刀 厲寒山: tall and gaunt, a red-black robe, white hair tied back, the long curved blood-red blade
LOOKS.lihan = { key: 'lihan', size: 1.12, skin: '#ecd2bc', hair: '#e6e6ea', longHair: 1, hat: 'bun', hatC: '#8a1018', robe: '#2a0c10', robe2: '#a8121c', pants: '#1a0a0c', boots: '#140a0c', belt: '#a8121c', fierce: 1, brow: 1.2, wpn: 'bloodblade', sheath: 1, sheathL: 1.25, sheathC: '#4a0a10', sheathT: '#c8a040', hiltC: '#2a0a0e', cape: '#3a0a10', skirt: 0.86, sleeveLong: 1, outline: '#1a0608' };
LOOKS.lihanB = { ...LOOKS.lihan, key: 'lihanB', wpn: 'brokensaber' };
// the one-armed old fisherman: a straw hat, a long white beard, a patched grey-brown robe, bare shins, the rod
LOOKS.yuweng = { key: 'yuweng', skin: '#d8a478', hair: '#d8d4cc', hat: 'straw', hatC: '#c8a860', robe: '#6a6458', robe2: '#a89a7a', pants: '#4a463c', boots: '#3a3028', belt: '#8a7a5a', beard: 'long', beardC: '#eeeae2', oneArm: 1, bareLeg: 1, skirt: 0.5, wpn: 'rodS', holdIdle: 1, sash: '#8a7a5a' };
LOOKS.yuwengR = { ...LOOKS.yuweng, key: 'yuwengR', wpn: 'rod' };
LOOKS.yuwengN = { ...LOOKS.yuweng, key: 'yuwengN', wpn: null, holdIdle: 0 };
LOOKS.yuwengS = { ...LOOKS.yuweng, key: 'yuwengS', wpn: 'brokensaber' };
LOOKS.yuwengB = { ...LOOKS.yuweng, key: 'yuwengB', wpn: 'blackblade' };
// 奕叡 through the book: the ring saber, snapped; a stick; the plain black 沉江 in a black sheath; wounded
LOOKS.yiruiS = { ...LOOKS.yirui, key: 'yiruiS', wpn: 'brokensaber' };
LOOKS.yiruiW = { ...LOOKS.yirui, key: 'yiruiW', wpn: 'brokensaber', wound: 1 };
LOOKS.yiruiN = { ...LOOKS.yirui, key: 'yiruiN', wpn: null, sheath: 0, wound: 1 };
LOOKS.yiruiT = { ...LOOKS.yirui, key: 'yiruiT', wpn: 'stick', sheath: 0 };
LOOKS.yiruiH = { ...LOOKS.yirui, key: 'yiruiH', wpn: 'fruit', holdIdle: 1, sheath: 0 };
LOOKS.yiruiB = { ...LOOKS.yirui, key: 'yiruiB', wpn: 'blackblade', sheath: 1, sheathC: '#18181c', sheathT: '#5a5a64', hiltC: '#1a1a1e' };
LOOKS.yiruiBW = { ...LOOKS.yiruiB, key: 'yiruiBW', wound: 1 };
LOOKS.yishuoR = { ...LOOKS.yishuo, key: 'yishuoR', cuffs: 1 };
// the white ape
LOOKS.ape = { key: 'ape', beast: 'ape', headH: 3.7, size: 1.4 };
// 黑風寨's chief 黑熊
LOOKS.heixiong = { key: 'heixiong', fat: 1, size: 1.14, skin: '#c48a5a', hair: '#141010', hat: 'band', hatC: '#1a1a1a', robe: '#3a3028', robe2: '#8a6a3a', pants: '#2a2420', boots: '#1a1612', belt: '#6a4a2a', beard: 'bushy', fierce: 1, brow: 1.5, wpn: 'club', skirt: 0.45, bare: 0, bareLeg: 1 };
// 血刀門 disciples (red and black, sabers) and 黑風寨 bandits
TYPES.xuedao = (r) => ({ skin: pick([SK.fair, SK.warm, SK.tan], r()), hair: '#1a1410', hat: pick(['band', 'bun', 'cloth'], r()), hatC: '#8a1018', robe: pick(['#3a0e12', '#4a1014', '#2e0c10'], r()), robe2: '#b01a22', pants: '#1a0a0c', boots: '#140a0c', belt: '#b01a22', beard: pick(['none', 'none', 'stubble', 'mustache'], r()), fierce: 1, brow: 1.2, wpn: 'saber', skirt: 0.55 });
TYPES.bandit = (r) => ({ skin: pick([SK.tan, SK.dark, SK.warm], r()), hair: '#1a1410', hat: pick(['band', 'cloth'], r()), hatC: pick(['#2a2a2a', '#5a3a2a', '#3a4a3a'], r()), robe: pick(['#4a4038', '#3a3a3a', '#5a4a32'], r()), robe2: '#8a6a3a', pants: '#2a2622', boots: '#1a1612', belt: '#6a4a2a', beard: pick(['stubble', 'bushy', 'none'], r()), fierce: 1, brow: 1.3, wpn: pick(['club', 'saber', 'axe'], r()), skirt: 0.42, bareLeg: r() < 0.5 ? 1 : 0 });
