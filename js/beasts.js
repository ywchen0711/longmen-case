// Creatures drawn by the same pixel machinery as the people (art.js Buf: banded light, cast shadows, a coloured
// outline), but from their own skeleton. The white ape that guards the red fruit: a hunched, long-armed body of
// white fur, a dark leathery face with a heavy brow and tiny dark eyes, big grey hands. Its poses (stand, roar,
// swipe, leap, slam, yield, offer) are named ape* in ANIMS.
import { Buf, flat, BEAST, ANIMS, OX, OY, shade, mix } from './art.js?v=4';
const R = Math.PI / 180;
const dirOf = (a) => [Math.sin(a * R), Math.cos(a * R)];
const add = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
const F = (o, t = 0.2) => ({ o, t });

function drawApe(L, P) {
  const B = new Buf(), fur = L.fur || '#e6e2da', fur2 = shade(fur, 0.82), skin = L.skin || '#5a4648', palm = '#6a5a5c';
  const lean = P.lean ?? 34, by = P.by || 0, bx = P.bx || 0;
  const pel = [OX + bx, OY - 30 + by];
  const up = [Math.sin(lean * R), -Math.cos(lean * R)], fw = [Math.cos(lean * R), Math.sin(lean * R)];
  const T = (u, v) => [pel[0] + fw[0] * u + up[0] * v, pel[1] + fw[1] * u + up[1] * v];
  const leg = (side, [a, k]) => { const hip = T(side * 3, 2); const knee = add(hip, dirOf(a), 17); const ank = add(knee, dirOf(a - k), 14); return { hip, knee, ank, b: a - k }; };
  const FL = leg(1, P.fl || [24, 40]), BL = leg(-1, P.bl || [-16, 30]);
  const shF = T(8, 40), shB = T(-2, 42);
  const arm = (sh, [a, e]) => { const elb = add(sh, dirOf(a), 22), wr = add(elb, dirOf(a + e), 22); return { sh, elb, wr, d2: dirOf(a + e) }; };
  const FA = arm(shF, P.fa || [20, 10]), BA = arm(shB, P.ba || [6, 10]);
  const drawLeg = (G, back) => {
    const c = back ? fur2 : fur; B.next('vol', 'fold'); B.limb(G.hip, G.knee, 20, 14, c); B.limb(G.knee, G.ank, 14, 10, c);
    const f = [Math.cos(G.b * R), -Math.sin(G.b * R)]; B.next(); B.poly([add(G.ank, f, -5), add(add(G.ank, f, -5), [0, 1], 4), add(add(G.ank, f, 9), [0, 1], 4), add(G.ank, f, 9)], back ? shade(palm, 0.8) : palm);
  };
  const drawArm = (A, back) => {
    const c = back ? fur2 : fur; B.next('vol', 'fold'); B.limb(A.sh, A.elb, 17, 13, c); B.limb(A.elb, A.wr, 14, 11, c);
    // a shaggy cuff of fur at the wrist, then the big grey hand
    B.next('vol'); B.disc(...add(A.wr, A.d2, -2), 7.5, shade(c, 0.95));
    B.next(); const h = add(A.wr, A.d2, 5); B.disc(h[0], h[1], 6.4, back ? shade(palm, 0.8) : palm); B.disc(...add(h, A.d2, 4), 4.6, back ? shade(palm, 0.8) : palm);
  };
  drawArm(BA, true); drawLeg(BL, true);
  // the body: a big rounded mass, the chest forward, a hump at the shoulders
  B.next('vol', 'fold');
  B.poly([T(-12, 0), T(-15, 12), T(-14, 28), T(-9, 42), T(0, 48), T(10, 47), T(15, 40), T(16, 26), T(13, 12), T(10, 0), T(0, -4)], fur);
  // the chest: bare grey skin
  B.next('vol'); B.poly([T(6, 18), T(13, 24), T(14, 36), T(9, 42), T(4, 36), T(3, 26)], mix(skin, '#9a8a8a', 0.5));
  drawLeg(FL, false);
  const drawHead = () => {
  // the head, low and forward of the shoulders
  const hc = add(T(10, 50), dirOf(90 + (P.head || 0)), 7);
  B.next('vol', 'fold'); B.disc(hc[0] - 2, hc[1] - 3, 13, fur); // the crown of fur
  B.next('vol'); B.disc(hc[0] - 6, hc[1] + 1, 8, shade(fur, 0.9));
  // the face: a dark muzzle forward, brow ridge, tiny dark eyes, the mouth
  B.next('soft'); B.poly([[hc[0] + 1, hc[1] - 7], [hc[0] + 9, hc[1] - 6], [hc[0] + 12, hc[1] - 1], [hc[0] + 12, hc[1] + 6], [hc[0] + 8, hc[1] + 9], [hc[0] + 2, hc[1] + 8], [hc[0] - 1, hc[1] + 2]], skin);
  flat(B); B.seg(hc[0] + 1, hc[1] - 6, hc[0] + 11, hc[1] - 5.5, 1.6, shade(skin, 0.6));            // the brow
  flat(B); const eye = P.eye === 'closed' ? 0 : 1;
  if (eye) { B.disc(hc[0] + 5, hc[1] - 3.4, 0.9, '#120c0c'); B.disc(hc[0] + 9.6, hc[1] - 3.2, 0.8, '#120c0c'); B.set(hc[0] + 4.6, hc[1] - 4, 0x6a5050); }
  else { B.seg(hc[0] + 4, hc[1] - 3, hc[0] + 6.4, hc[1] - 3, 0.8, '#120c0c'); B.seg(hc[0] + 9, hc[1] - 3, hc[0] + 10.4, hc[1] - 3, 0.8, '#120c0c'); }
  flat(B); B.disc(hc[0] + 11, hc[1] + 0.5, 1, shade(skin, 0.5));                                        // the nostril
  if (P.mouth) { flat(B); B.poly([[hc[0] + 4, hc[1] + 3], [hc[0] + 12, hc[1] + 3], [hc[0] + 11, hc[1] + 9], [hc[0] + 5, hc[1] + 8]], '#3a0e10'); flat(B); B.seg(hc[0] + 5, hc[1] + 3.4, hc[0] + 11, hc[1] + 3.4, 0.9, '#f0ece0'); B.set(hc[0] + 6, hc[1] + 7.5, 0xf0ece0); B.set(hc[0] + 10, hc[1] + 7.5, 0xf0ece0); }
  else { flat(B); B.seg(hc[0] + 6, hc[1] + 5, hc[0] + 11, hc[1] + 5, 0.8, shade(skin, 0.55)); }
  // white whiskers of fur round the face
  B.next('vol'); for (const [dx, dy] of [[-1, 6], [0, 9], [2, 10]]) B.disc(hc[0] + dx, hc[1] + dy, 2.4, fur);
  };
  if (P.armUnder) { drawArm(FA, false); drawHead(); } else { drawHead(); drawArm(FA, false); }
  if (P.hold === 'fruit') { const h = add(FA.wr, FA.d2, 6); B.next('vol'); B.disc(h[0] + 3, h[1] - 4, 4.4, '#e0281e'); flat(B); B.disc(h[0] + 2, h[1] - 6, 1.2, '#ffb0a0'); B.next(); B.seg(h[0] + 3, h[1] - 8, h[0] + 5, h[1] - 11, 1.6, '#3a8a2a'); }
  return B.finish('#2a2228');
}
BEAST.ape = drawApe;

Object.assign(ANIMS, {
  apestand: [F({ lean: 34, fa: [18, 8], ba: [4, 10], fl: [24, 40], bl: [-14, 30] }, 0.5), F({ lean: 36, by: 1, fa: [20, 8], ba: [6, 10], fl: [24, 42], bl: [-14, 32] }, 0.5)],
  aperoar: [F({ armUnder: 1, lean: 4, by: -2, fa: [110, 50], ba: [140, 30], fl: [20, 24], bl: [-20, 20], mouth: 1, head: -16 }, 0.12), F({ armUnder: 1, lean: 2, by: -2, fa: [116, 46], ba: [146, 26], fl: [20, 24], bl: [-20, 20], mouth: 1, head: -20 }, 0.12)],
  apeswipe: [F({ lean: 20, fa: [150, 20], ba: [10, 10], fl: [20, 30], bl: [-20, 24], mouth: 1 }, 0.1), F({ lean: 46, bx: 4, fa: [60, -20], ba: [-20, 10], fl: [44, 30], bl: [-30, 20], mouth: 1 }, 0.3)],
  apeleap: [F({ lean: 30, by: -2, fa: [160, 10], ba: [150, 14], fl: [60, 100], bl: [20, 90], mouth: 1 }, 0.3)],
  apeslam: [F({ lean: 60, by: 6, fa: [70, -10], ba: [64, -6], fl: [50, 80], bl: [-20, 60], mouth: 1 }, 0.3)],
  apegrab: [F({ lean: 40, bx: 3, fa: [96, 0], ba: [80, 10], fl: [36, 40], bl: [-24, 30], mouth: 0 }, 0.3)],
  apeyield: [F({ lean: 12, by: 10, fa: [10, 20], ba: [0, 20], fl: [80, 100], bl: [70, 100], eye: 'closed', head: 10 }, 0.6), F({ lean: 13, by: 10.4, fa: [10, 20], ba: [0, 20], fl: [80, 100], bl: [70, 100], eye: 'closed', head: 12 }, 0.6)],
  apeoffer: [F({ lean: 22, by: 6, fa: [84, 10], ba: [4, 20], fl: [60, 90], bl: [40, 100], hold: 'fruit', head: 6 }, 0.6)],
  apestagger: [F({ lean: -6, bx: -3, fa: [120, 50], ba: [-30, 20], fl: [10, 20], bl: [-40, 30], mouth: 1, eye: 'closed', head: -10 }, 0.3)],
});
