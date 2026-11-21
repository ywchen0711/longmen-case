// Pixel characters drawn in code. Each frame is a little skeleton put in a pose (angles in degrees: 0 points
// straight down, positive turns toward the way the figure faces); the limbs, robe, armour, head, face and
// weapon are filled in as separate parts. Then every part is given volume: a ray toward the light (upper left)
// and one away from it measure how far each pixel is from the part's lit and shaded edges, which turns into a
// rounded, banded light; parts in front cast a small shadow on what lies behind, metal gets a hard glint,
// shadows lean cool and lights lean warm, and the figure gets a dark coloured outline.
// The people are HD-2D sprites, about three heads tall at 32 pixels to a unit of the world: the body comes from
// the skeleton, the head is drawn by hand (heads.js) and doubled with Scale2x, then given its eyes, brows and
// mouth at the finer size. Every colour has only a few clean tones; the outline is a dark shade of what it edges.
// A look (L) says what the person wears; a sheet holds every frame of every animation for one look.
export const FW = 160, FH = 168;          // frame size in pixels; the feet stand at (80, 152)
export const OX = 80, OY = 152;
export const PPU = 32;                     // pixels to a unit of the world
import { HEADS, HATS, BEARDS, ANCHOR } from './heads.js?v=4';
const R = Math.PI / 180;

const hexRGB = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const shade = (c, f) => { const [r, g, b] = hexRGB(c); return f >= 1 ? toHex(r + (255 - r) * (f - 1), g + (255 - g) * (f - 1), b + (255 - b) * (f - 1)) : toHex(r * f, g * f, b * f); };
export const mix = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); };
const pack = (c) => { const [r, g, b] = hexRGB(c); return (r << 16) | (g << 8) | b; };

// ---------------------------------------------------------------- a frame buffer: colour + which part each pixel belongs to
// part kinds: vol (rounded light), metal (rounded, hard glint), flat (no light, e.g. eyes, trim lines), and
// a pattern: scale (lamellar armour), fold (cloth folds running down)
class Buf {
  constructor() { this.c = new Int32Array(FW * FH).fill(-1); this.p = new Int16Array(FW * FH); this.part = 1; this.meta = [{ k: 'vol' }, { k: 'vol' }]; }
  set(x, y, col) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= FW || y >= FH) return; const i = y * FW + x; this.c[i] = col; this.p[i] = this.part; }
  next(k = 'vol', pat = null) { this.part++; this.meta[this.part] = { k, pat: pat === 'scale' || pat === 'trim' || pat === 'stud' || pat === 'grain' ? pat : null }; }
  setp(x, y, col, part) { if (x < 0 || y < 0 || x >= FW || y >= FH) return; const i = y * FW + x; this.c[i] = col; this.p[i] = part; }
  disc(cx, cy, r, col) { const c = pack(col), r2 = r * r; for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) { const dx = x - cx, dy = y - cy; if (dx * dx + dy * dy <= r2 + 0.25) this.set(x, y, c); } }
  seg(x0, y0, x1, y1, w, col) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2)); for (let i = 0; i <= n; i++) { const t = i / n; this.disc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, w / 2, col); } }
  // a tapering limb: width w0 at the start, w1 at the end
  limb(a, b, w0, w1, col) { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * (Math.min(w0, w1) > 4 ? 1 : 2))); for (let i = 0; i <= n; i++) { const t = i / n; this.disc(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (w0 + (w1 - w0) * t) / 2, col); } }
  // a path of points with a width that tapers from w0 to w1
  path(pts, w0, w1, col) { for (let i = 0; i + 1 < pts.length; i++) this.limb(pts[i], pts[i + 1], w0 + (w1 - w0) * (i / (pts.length - 1)), w0 + (w1 - w0) * ((i + 1) / (pts.length - 1)), col); }
  poly(pts, col) {
    const c = pack(col); let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= y + 0.5 && b[1] > y + 0.5) || (b[1] <= y + 0.5 && a[1] > y + 0.5)) xs.push(a[0] + (y + 0.5 - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
      xs.sort((a, b) => a - b); for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.set(x, y, c);
    }
  }
  // light every part, cast the small shadows, outline the figure, and hand back the pixels
  finish(outline) {
    const W = FW, H = FH, c = this.c, p = this.p, M = this.meta, out = new Uint8ClampedArray(W * H * 4), col = new Int32Array(c);
    const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : y * W + x);
    const lx = -0.6, ly = -0.8;                                   // toward the light
    const COOL = [52, 40, 92], WARM = [255, 240, 200];
    const tone = (v, f) => {
      let r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
      if (f >= 1) { const t = Math.min(1, f - 1); r += (WARM[0] - r) * t; g += (WARM[1] - g) * t; b += (WARM[2] - b) * t; }
      else { r *= f; g *= f; b *= f; const t = (1 - f) * 0.45; r += (COOL[0] * f - r) * t; g += (COOL[1] * f - g) * t; b += (COOL[2] * f - b) * t; }
      return (Math.max(0, Math.min(255, Math.round(r))) << 16) | (Math.max(0, Math.min(255, Math.round(g))) << 8) | Math.max(0, Math.min(255, Math.round(b)));
    };
    // how many steps toward the light (up-left) and away from it each pixel can go and stay in its own part: two sweeps
    const NC = M.map((m) => !!(m && m.noCast)), seam = (j, ok, k) => ok && c[j] >= 0 && p[j] < k && !NC[p[j]];
    const DL = new Int16Array(W * H), DD = new Int16Array(W * H);
    for (let y = 1; y < H; y++) for (let x = 1; x < W; x++) { const i = y * W + x, j = i - W - 1; if (c[i] >= 0 && c[j] >= 0 && p[j] === p[i]) DL[i] = DL[j] + 1; }
    for (let y = H - 2; y >= 0; y--) for (let x = W - 2; x >= 0; x--) { const i = y * W + x, j = i + W + 1; if (c[i] >= 0 && c[j] >= 0 && p[j] === p[i]) DD[i] = DD[j] + 1; }
    const BANDS = [0.64, 0.82, 1, 1.12], MBANDS = [0.5, 0.74, 1, 1.3, 1.7];
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    // the nearest band, or (dithered) a checker of the two bands either side
    const band = (f, L, x, y, dith) => { if (f <= L[0]) return L[0]; for (let i = 1; i < L.length; i++) if (f <= L[i]) { const t = (f - L[i - 1]) / (L[i] - L[i - 1]); return (dith ? t > (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16 : t >= 0.5) ? L[i] : L[i - 1]; } return L[L.length - 1]; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x; if (c[i] < 0) continue; const k = p[i], m = M[k] || M[1];
      let f = 1;
      if (m.k !== 'flat') {
        const dl = DL[i] * 1.4, dd = DD[i] * 1.4, span = dl + dd;
        const n = span < 2 ? 0.35 : (dd - dl) / span;              // +1 at the lit edge, -1 at the shaded edge
        const lam = Math.max(0, n * 0.74 + Math.sqrt(Math.max(0, 1 - n * n)) * 0.58);
        if (m.k === 'metal') { f = n > 0.4 && n < 0.7 && span > 3 ? 1.7 : band(0.42 + lam * 0.95, MBANDS, x, y, false); }
        else if (m.k === 'soft') f = n < -0.6 && span > 6 ? 0.88 : n > 0.75 && span > 6 ? 1.05 : 1;   // a face: lit, with one band of shade at its far edge
        else { f = 0.5 + lam * 0.62; f = band(f, BANDS, x, y, false); }
      }
      if (m.pat === 'scale') { const row = Math.floor(y / 3), xx = x + (row % 2) * 2, yy = y % 3; if (yy === 2) f *= 0.8; else if (xx % 4 === 0) f *= 0.88; else if (yy === 0 && xx % 4 === 2) f *= 1.14; }
      else if (m.pat === 'fold') { const q = (x * 7 + Math.floor(y / 13) * 3) % 13; if (q === 0) f *= 0.84; else if (q === 1) f *= 1.06; }
      else if (m.pat === 'strand') { const a = Math.atan2(y - m.cy, x - m.cx) / R + (((x * 13 + y * 7) % 5) - 2) * 0.4, q = ((Math.floor(a / 5) % 4) + 4) % 4; if (q === 0) f *= 0.8; else if (q === 2) f *= 1.1; }
      else if (m.pat === 'trim') { const q = ((x >> 1) + (y >> 1)) % 3; if (q === 0) f *= 1.3; else if (q === 1 && ((x + y) & 1)) f *= 0.85; }
      else if (m.pat === 'grain') { if ((x * 3 + y * 5) % 11 === 0) f *= 0.82; }
      else if (m.pat === 'stud') { const q = (x + y) % 7; if (q === 0) f *= 1.45; else if (q === 1) f *= 0.8; }
      // a part in front of this one, just toward the light, throws a little shadow on it
      if (!m.noShade) for (let t = 1; t <= 2; t++) { const j = at(x - t, y - t - (t >> 1)); if (j >= 0 && c[j] >= 0 && p[j] > k && !NC[p[j]]) { f *= 0.8; break; } }
      // a seam against what lies behind
      if (!m.noSeam && (seam(i - W, y > 0, k) || seam(i - 1, x > 0, k) || seam(i + 1, x < W - 1, k) || seam(i + W, y < H - 1, k))) f *= 0.8;
      col[i] = tone(c[i], f);
    }
    const oc = pack(outline || '#1a1018');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, o = i * 4;
      if (c[i] >= 0) { const v = col[i]; out[o] = (v >> 16) & 255; out[o + 1] = (v >> 8) & 255; out[o + 2] = v & 255; out[o + 3] = 255; continue; }
      const n = x > 0 && c[i - 1] >= 0 ? i - 1 : x < W - 1 && c[i + 1] >= 0 ? i + 1 : y > 0 && c[i - W] >= 0 ? i - W : y < H - 1 && c[i + W] >= 0 ? i + W : -1;
      if (n >= 0) { const v = tone(col[n], 0.45), m = (a, b) => Math.round(a * 0.72 + b * 0.28); out[o] = m((v >> 16) & 255, (oc >> 16) & 255); out[o + 1] = m((v >> 8) & 255, (oc >> 8) & 255); out[o + 2] = m(v & 255, oc & 255); out[o + 3] = 255; }
    }
    return out;
  }
}
const flat = (B, extra) => { B.next('flat'); Object.assign(B.meta[B.part], { noCast: true, noSeam: true, noShade: true }, extra); };

// ---------------------------------------------------------------- the skeleton
const dirOf = (a) => [Math.sin(a * R), Math.cos(a * R)];             // 0 = down, 90 = forward, 180 = up
const add = (p, d, l) => [p[0] + d[0] * l, p[1] + d[1] * l];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// defaults every pose starts from
const BASE = { bx: 0, by: 0, lean: 4, hd: [0, 0], fa: [20, 60], ba: [-15, 50], fl: [10, 8], bl: [-10, 6], w: 120, w2: null, eye: 'open', mouth: 0, tilt: 0, fx: 0 };
export let lastHead = [OX, 60];

// creatures that are not people (the white ape) register a drawer here (beasts.js)
export const BEAST = {};
export function drawFrame(L, pose) {
  if (L.beast && BEAST[L.beast]) return BEAST[L.beast](L, { ...pose });
  const P = { ...BASE, ...pose }, S = L.size || 1, s = S * 0.9 * (L.kid ? 0.8 : 1), B = new Buf();
  const fat = L.fat ? 1 : 0, skin = L.skin || '#f0c49a', robe = L.robe || '#4a6a9a', robe2 = L.robe2 || shade(robe, 0.7);
  const armor = L.bare ? null : L.armor, pants = L.pants || shade(robe, 0.6), boots = L.boots || '#3a2a22', trim = L.trim || robe2;
  // pelvis, the legs below it (the poses were made at 16.5 old units of leg; these legs are 41 pixels)
  const thigh = 12.4 * S * (L.kid ? 0.7 : 1), shin = 11.6 * S * (L.kid ? 0.7 : 1);
  const pel = [OX + P.bx * 1.8 * S, OY - (thigh + shin + 2.8 * S) + P.by * 1.6 * S];
  const leg = (side, [a, k]) => { const hip = [pel[0] + side * 3 * s, pel[1] + 1]; const knee = add(hip, dirOf(a), thigh); const b = a - k, ank = add(knee, dirOf(b), shin); const fwd = [Math.cos(b * R), -Math.sin(b * R)]; return { hip, knee, ank, b, fwd, dn: dirOf(b) }; };
  const FL = leg(1, P.fl), BL = leg(-1, P.bl);
  const lean = P.lean, up = [Math.sin(lean * R), -Math.cos(lean * R)], fw = [Math.cos(lean * R), Math.sin(lean * R)];
  const T = (u, v) => [pel[0] + (fw[0] * u + up[0] * v) * s, pel[1] + (fw[1] * u + up[1] * v) * s];   // the body's own frame: u forward, v up
  const neck = T(0.6, 27.5);
  const ha = lean * 0.55 + P.tilt, hup = [Math.sin(ha * R), -Math.cos(ha * R)];
  const headC = [neck[0] + hup[0] * 3.2 + P.hd[0] * 1.8 * S, neck[1] + hup[1] * 3.2 + P.hd[1] * 1.8 * S];
  lastHead = headC;
  const shF = T(5, 23.2), shB = T(-5.6, 23.6);
  const arm = (sh, [a, e]) => { const d1 = dirOf(a), elb = add(sh, d1, 10.5 * s), d2 = dirOf(a + e), wr = add(elb, d2, 9 * s); return { sh, elb, wr, hand: add(wr, d2, 2.2 * s), ang: a + e, d2 }; };
  const FA = arm(shF, P.fa), BA = arm(shB, P.ba);

  const drawLeg = (G, back) => {
    const dk = (c) => (back ? shade(c, 0.8) : c), pc = dk(pants), bc = dk(boots);
    B.next('vol', 'fold'); B.limb(G.hip, G.knee, (10 + fat * 3) * s, 7.6 * s, pc); B.limb(G.knee, G.ank, 7.4 * s, 5.4 * s, L.bareLeg ? dk(skin) : pc);
    if (L.bareLeg) { B.next(); B.limb(G.hip, lerp(G.hip, G.knee, 0.6), (10.4 + fat * 3) * s, 8 * s, pc); }
    // a boot from below the knee, shaped heel to toe
    const top = lerp(G.knee, G.ank, 0.52), f = G.fwd, d = G.dn, A = G.ank, q = (u, v) => [A[0] + (f[0] * u + d[0] * v) * s, A[1] + (f[1] * u + d[1] * v) * s];
    B.next(); B.limb(top, A, 6.6 * s, 5.8 * s, bc);
    B.poly([q(-3, -2), q(-3.2, 2.4), q(-2.4, 3.2), q(7, 3.2), q(8, 1.8), q(7.4, 0.4), q(3.8, -1.4), q(2.2, -3)], bc);
    flat(B); B.limb(q(-3, 2.6), q(7.6, 2.6), 1.4 * s, 1.4 * s, shade(bc, 0.5));
    flat(B); { const r = (u, v) => [top[0] + (f[0] * u + d[0] * v) * s, top[1] + (f[1] * u + d[1] * v) * s]; B.poly([r(-3.5, -0.8), r(3.5, -0.8), r(3.5, 0.9), r(-3.5, 0.9)], dk(L.bootTrim || mix(bc, '#c8a868', 0.35))); }
  };
  const drawArm = (A, back, hold) => {
    const dk = (c) => (back ? shade(c, 0.78) : c), sk = dk(skin), sl = dk(robe);
    const perp = [A.d2[1], -A.d2[0]];
    if (L.bare) { B.next(); B.limb(A.sh, A.elb, (8.4 + fat * 2) * s, 6.6 * s, sk); B.limb(A.elb, A.wr, 6.6 * s, 5 * s, sk); }
    else if (L.sleeveLong) {
      // a wide sleeve that hangs from the forearm
      B.next('vol', 'fold'); B.limb(A.sh, A.elb, (8.6 + fat) * s, 8 * s, sl);
      const cuff = add(A.wr, A.d2, -0.6 * s), mid = lerp(A.elb, cuff, 0.55);
      B.limb(A.elb, cuff, 8.4 * s, 10 * s, sl);
      B.poly([add(A.elb, perp, 3.5 * s), add(cuff, perp, 5 * s), add(cuff, perp, -5 * s), [mid[0], mid[1] + 9 * s], add(A.elb, perp, -3.5 * s)], sl);
      flat(B); B.meta[B.part].pat = 'trim'; B.limb(add(cuff, perp, 4.6 * s), add(cuff, perp, -4.6 * s), 1.8 * s, 1.8 * s, dk(trim));
    } else {
      B.next('vol', 'fold'); B.limb(A.sh, A.elb, (8.4 + fat) * s, 7 * s, sl);
      const fore = L.bracer ? dk(L.bracer) : armor ? dk(shade(armor, 0.92)) : sk;
      B.next(armor ? 'metal' : 'vol'); B.limb(A.elb, A.wr, 6.6 * s, 5.4 * s, armor && !L.bracer ? sk : fore);
      if (armor || L.bracer) { B.next(L.bracer ? 'vol' : 'metal'); B.limb(lerp(A.elb, A.wr, 0.25), A.wr, 7 * s, 6.2 * s, fore); }
    }
    if (armor) { B.next('metal', 'scale'); const d1 = [A.elb[0] - A.sh[0], A.elb[1] - A.sh[1]], l = Math.hypot(...d1) || 1, u = [d1[0] / l, d1[1] / l]; B.limb(add(A.sh, u, -1 * s), add(A.sh, u, 6.5 * s), 10 * s, 9 * s, dk(armor)); }
    if (hold) hold();
    B.next(); B.disc(A.hand[0], A.hand[1], 3.1 * s, sk); B.disc(A.hand[0] + perp[0] * 1.6 * s, A.hand[1] + perp[1] * 1.6 * s, 1.7 * s, sk);
  };
  // ---- behind: the back arm (and a second weapon), the back leg, a cape
  const showW = P.w != null && (!P.calm || L.holdIdle), showW2 = P.w2 != null && (!P.calm || L.holdIdle);
  if (showW2 && L.wpn2) drawWeapon(B, L.wpn2, BA.hand, P.w2, s * 2, true, L.wpn2C);
  if (L.sheath) { const sl = L.sheathL || 1, sc = L.sheathC || '#3a2418', st = L.sheathT || '#d8b048'; B.next('vol'); B.limb(T(-3, 9), T(-3 - 12 * sl, 9 - 15 * sl), 2.6 * s, 2.2 * s, sc); flat(B); B.limb(T(-4, 8.4), T(-4.6, 7.6), 3.2 * s, 3.2 * s, st); if (!showW) { B.next('vol', 'grain'); B.limb(T(-2, 10.4), T(3.5, 16), 1.8 * s, 1.8 * s, L.hiltC || '#2a1a12'); B.next('metal'); B.disc(...T(4.6, 17.2), 2 * s, st); } }
  if (L.oneArm) { B.next('vol', 'fold'); const sb = shB, e = [sb[0] - 1.5 * s, sb[1] + 9 * s], lo = [sb[0] + 1 * s, sb[1] + 17 * s]; B.limb(sb, e, 8 * s, 6 * s, shade(robe, 0.72)); B.limb(e, lo, 6 * s, 4.4 * s, shade(robe, 0.66)); }
  else drawArm(BA, true);
  drawLeg(BL, true);
  if (L.cape) {
    const sway = P.cape ?? 0, c0 = T(-2, 25.5), c1 = T(-6.5, 23), lo = [pel[0] - (17 + sway) * s, pel[1] + 20 * s], lo2 = [pel[0] - (4 + sway * 0.5) * s, pel[1] + 23 * s];
    B.next('vol', 'fold'); B.poly([c0, c1, lerp(c1, lo, 0.5), lo, lerp(lo, lo2, 0.5), lo2, T(-2, 8)], shade(L.cape, 0.86));
  }
  // ---- the body
  const tor = [T(-7.4 - fat, -1), T(-6.2 - fat, 7), T(-6.4 - fat, 12), T(-8.2 - fat * 0.5, 19), T(-8, 23.6), T(-4.6, 27), T(4.4, 26.8), T(8 + fat, 23.4), T(8.6 + fat * 2, 18.6), T(6.8 + fat * 3, 13), T(6.2 + fat * 6.5, 7), T(7.4 + fat * 3, -1)];
  B.next(); B.poly(tor, L.bare ? skin : robe);
  // the neck
  // the neck, in the shadow of the chin
  B.next(); B.limb(T(0, 25), add(neck, hup, 5 * s), 5.6 * s, 5.2 * s, mix(shade(skin, 0.74), '#6a3a5a', 0.12));
  if (L.bare) {
    flat(B); const ln = shade(skin, 0.72);
    B.seg(...T(1.5, 19.5), ...T(7 + fat, 17.5), 0.9, ln); B.seg(...T(4.5, 15), ...T(4.6 + fat * 3, 9.5), 0.8, ln);       // chest and belly
    B.disc(...T(5.4 + fat, 18), 0.8 * s, shade(skin, 0.6));
  } else if (armor) {
    // the robe's collar shows over a breastplate of small plates, a round mirror on the chest
    B.next('metal', 'scale'); B.poly([T(-6.8 - fat, 10), T(-7.6, 19), T(-6.4, 23.4), T(6.8 + fat, 23), T(8 + fat * 2, 17), T(6.6 + fat * 6, 10)], armor);
    B.next(); B.poly([T(-3.4, 27.2), T(3.6, 27), T(4.4, 23.4), T(0.6, 21.4), T(-3.8, 24)], L.robe2 ? robe2 : robe);
    flat(B); B.seg(...T(-1, 27), ...T(3.4, 26.4), 1.2, '#efe8d8');
    if (L.mirror !== 0) { B.next('metal'); B.disc(...T(1.8 + fat * 1.5, 17), 3.6 * s, L.mirrorC || '#d8b048'); B.next('metal'); B.disc(...T(1.8 + fat * 1.5, 17), 1.9 * s, mix(L.mirrorC || '#d8b048', '#ffffff', 0.35)); }
  } else {
    // a robe crossed over at the chest
    flat(B); B.meta[B.part].pat = 'trim'; B.poly([T(-2.4, 27.2), T(0.8, 27.2), T(4.6 + fat * 4, 10), T(2.6 + fat * 4, 9.4)], robe2);
    flat(B); B.seg(...T(-0.8, 27), ...T(2.4, 26.8), 1.1, '#efe8d8');
  }
  // the belt, its buckle, the sash ends
  B.next('vol', L.beltGold || armor ? 'stud' : null); B.poly([T(-7.6 - fat, 6.4), T(6.6 + fat * 6.2, 6.4), T(6.8 + fat * 5.8, 10.4), T(-7.6 - fat, 10.4)], L.belt || '#6a4a2a');
  if (L.sash) { B.next('vol', 'fold'); const k = T(1 + fat * 5, 7), sw = P.cape ?? 0; B.path([k, [k[0] - (1 + sw * 0.2) * s, k[1] + 8 * s], [k[0] - (3 + sw * 0.4) * s, k[1] + 16 * s]], 3 * s, 2.4 * s, L.sash); }
  // the front leg, then the skirt of the robe (or armour tassets) over it, following the legs
  drawLeg(FL, false);
  if (L.skirt !== 0) {
    const len = L.skirt || 0.55, kF = lerp(FL.hip, FL.ank, len), kB = lerp(BL.hip, BL.ank, len);
    const sk = L.skirtC || robe, hy = Math.max(kF[1], kB[1]) + 2 * s, x0 = Math.min(kF[0], kB[0]) - 5 * s, x1 = Math.max(kF[0], kB[0]) + 5 * s;
    B.next('vol', 'fold'); B.poly([T(-7.2 - fat, 8), T(6.8 + fat * 6, 8), [x1, hy - 1], [lerp([x0, hy], [x1, hy], 0.5)[0], hy + 1.5 * s], [x0, hy]], sk);
    flat(B); B.meta[B.part].pat = 'trim'; B.seg(x0 + 1, hy - 0.5, x1 - 1, hy - 1.2, 2 * s, shade(trim, 0.95));
    if (armor && L.skirtC == null) { const ty = pel[1] + (hy - pel[1]) * 0.62; B.next('metal', 'scale'); B.poly([T(-7.4 - fat, 7.6), T(7 + fat * 6, 7.6), [x1 - 1, ty], [x0 + 1, ty + 1]], shade(armor, 0.95)); flat(B); B.seg(x0 + 1.5, ty + 0.5, x1 - 1.5, ty, 1.4 * s, shade(L.armorTrim || '#c89a3a', 0.9)); }
  }
  if (L.beltGold || armor) { B.next('metal'); B.disc(...T(2.6 + fat * 5, 8.4), 2.6 * s, '#e0b040'); B.next('metal'); B.disc(...T(2.6 + fat * 5, 8.4), 1 * s, '#fff0b0'); }
  // ---- the head
  // ---- the weapon in the front hand, gripped by it; the front arm over the body
  const frontArm = () => drawArm(FA, false, () => { if (L.wpn && showW) drawWeapon(B, L.wpn, FA.hand, P.w, s * 2, false, L.wpnC); });
  frontArm();
  // the head over the front shoulder, so the chin shows; an arm raised up past the shoulder goes over the head again
  drawHeadT(B, L, headC, P, ha, false);
  if (Math.min(FA.elb[1], FA.wr[1]) < shF[1] - 2 * s) frontArm();
  if (L.beard === 'long') drawHeadT(B, L, headC, P, ha, true);
  if (L.wound) { flat(B); const a = lerp(shF, FA.elb, 0.05), b = lerp(shF, FA.elb, 0.55); B.seg(a[0] - 2 * s, a[1] - 1, b[0] + 1 * s, b[1], 2.6 * s, '#8a1414'); B.seg(a[0] - 1 * s, a[1], b[0], b[1] - 1, 1.2 * s, '#c82828'); }
  if (P.bound || L.cuffs) { B.next('metal'); B.seg(FA.hand[0], FA.hand[1], BA.hand[0], BA.hand[1], 1.6 * s, '#8a8a94'); B.next('metal'); B.disc(FA.hand[0], FA.hand[1], 2.4 * s, '#6a6a74'); }
  if (L.shield) { const c = FA.wr; B.next(); B.disc(c[0] + 2, c[1], 8.6 * s, L.shield); flat(B); B.disc(c[0] + 2, c[1], 2.6 * s, '#d8c070'); }
  return B.finish(L.outline);
}

// ---------------------------------------------------------------- the head, in its own frame: u toward the face, v down
function drawHead(B, L, c, k, P, ang) {
  const skin = L.skin || '#f0c49a', hair = L.hair || '#1e1814', cs = Math.cos(ang * R), sn = Math.sin(ang * R);
  let du = 0; const H = (u, v) => { u += du; return [c[0] + (u * cs - v * sn) * k, c[1] + (u * sn + v * cs) * k]; };
  const poly = (pts, col) => B.poly(pts.map(([u, v]) => H(u, v)), col);
  const ell = (u, v, ru, rv, col, a0 = 0, a1 = 360, extra = []) => { const pts = []; for (let a = a0; a <= a1; a += 15) pts.push([u + Math.cos(a * R) * ru, v + Math.sin(a * R) * rv]); poly(pts.concat(extra), col); };
  const seg = (u0, v0, u1, v1, w, col) => { const A = H(u0, v0), Bp = H(u1, v1); B.seg(A[0], A[1], Bp[0], Bp[1], w * k, col); };
  const path = (pts, w0, w1, col) => B.path(pts.map(([u, v]) => H(u, v)), w0 * k, w1 * k, col);
  const hc = L.hatC || '#3a3a5a', h2 = L.hatC2 || '#c03030', sheen = mix(hair, '#b8c0d8', 0.3);
  if (!P.beardOnly) {
  // long hair falls behind
  if (L.longHair) { B.next('vol', 'strand'); { const cc = H(-2, -8); B.meta[B.part].cx = cc[0]; B.meta[B.part].cy = cc[1]; } poly([[-4, -1], [-7.6, 3], [-8.4, 13], [-6.6, 19], [-3.6, 17], [-2.6, 6]], hair); }
  if (L.hat === 'plume' || L.hat === 'helm' || L.hat === 'feathers') { /* drawn with the helm */ }
  // skull, jaw, nose
  B.next('soft'); B.meta[B.part].noShade = true; ell(0, 0, 6.8, 7.2, skin); poly([[-4, 2], [6.6, 0.6], [6.9, 3.4], [6.3, 5.6], [4.8, 7.6], [2.4, 8.5], [-0.6, 7.8], [-3.6, 5]], skin); poly([[6.4, 1.2], [7.5, 3.7], [6.5, 4.2]], skin);
  // ear
  B.next(); ell(-2.8, 2, 1.6, 2.3, shade(skin, 0.92)); flat(B); seg(-2.6, 1, -2.4, 3, 0.7, shade(skin, 0.66));
  // hair over the top and back of the head, bangs over the brow, the sheen of it
  B.next('vol', 'strand'); { const cc = H(-1.5, -7.5); B.meta[B.part].cx = cc[0]; B.meta[B.part].cy = cc[1]; }
  if (L.hat !== 'bald') {
    const pts = []; for (let a = -25; a >= -205; a -= 15) pts.push([Math.cos(a * R) * 7.7, Math.sin(a * R) * 8]);
    poly(pts.concat([[-7.2, 4], [-4.6, 6.4], [-2.6, 4.2], [-2.4, 0.4], [-0.4, -1.4], [2.2, -2.6], [4.6, -3.2], [6.4, -2.2]]), hair);
    poly([[0.4, -6.6], [5.8, -0.8], [3.6, -3.4]], hair); poly([[2.8, -6.2], [7.4, -1.6], [5.2, -3.8]], hair); poly([[-0.4, -2], [0.8, 3.6], [1, -1.4]], hair);
    flat(B); seg(-4.6, -5, 1.6, -6.4, 1.2, sheen); seg(-6, -2.8, -4.8, -4.6, 1, sheen);
  } else { flat(B); seg(-3, -5.4, 1, -6.4, 1.3, shade(skin, 1.25)); }
  // eyes, brows, mouth: the face is turned three-quarters toward us
  // small faces read the way the classic pixel games draw them: dark slits for eyes, no whites, a short brow,
  // the nose and mouth only hinted by a shadow, and the shape of the face left to the light
  du = -1.7;
  const eyeC = L.eyeC || '#2a1a14', lid = '#1c1210', sk2 = shade(skin, 0.86), sk3 = shade(skin, 0.7);
  if (!L.lashes) { flat(B); B.set(...H(6.6, 3.2), pack(sk2)); }      // beside the nose
  flat(B); seg(6.1, 4.4, 6.9, 4.4, 0.5, sk3);                                              // under the nose
  flat(B);
  if (P.eye === 'closed') { seg(3, 1.7, 4.6, 1.7, 0.55, lid); seg(6.5, 1.6, 7.1, 1.6, 0.45, lid); }
  else if (P.eye === 'hurt') { seg(3, 1, 4.6, 1.7, 0.55, lid); seg(3, 2.4, 4.6, 1.7, 0.55, lid); seg(6.4, 1.3, 7, 1.7, 0.45, lid); }
  else {
    ell(3.9, 1.6, 0.55, 0.85, lid); flat(B); B.set(...H(3.75, 1.05), pack(mix(eyeC, '#ffffff', 0.5)));
    flat(B); ell(6.75, 1.55, 0.3, 0.7, lid);
    if (L.lashes) { flat(B); B.set(...H(4.6, 0.9), pack(lid)); B.set(...H(3.2, 0.9), pack(lid)); }
  }
  flat(B); const bw = L.fierce ? 0.85 + ((L.brow || 1.2) - 1.2) * 0.5 : 0.55, bcol = shade(hair, 0.85);
  if (L.fierce) { seg(2.4, -1.2, 4.9, -0.2, bw, bcol); seg(6.2, -0.2, 7.2, -0.7, bw * 0.8, bcol); } else { seg(2.6, -0.5, 4.8, -0.8, bw, bcol); seg(6.2, -0.7, 7.1, -0.5, bw * 0.8, bcol); }
  flat(B);
  if (P.mouth) ell(5.9, 6, 0.75, 0.65, '#4a1818');
  else if (!L.beard || L.beard === 'none' || L.beard === 'stubble') seg(5.3, 6, 6.3, 5.9, 0.5, L.lips ? shade(L.lips, 0.9) : sk3);
  if (L.blush) { flat(B); ell(4.4, 3.7, 0.9, 0.4, mix(skin, '#ff7a7a', 0.22)); }
  if (L.paint) { flat(B); seg(2.6, 3, 6.4, 3, 0.7, L.paint); seg(2.8, 4.4, 5.8, 4.4, 0.6, L.paint); }
  }
  if (P.beardOnly) du = -1.7;
  // the beard
  const bc = L.beardC || hair, bl = mix(bc, '#c8c0b8', 0.22);
  if (L.beard === 'long' && P.beardOnly) {
    B.next('vol', 'fold'); poly([[-1.8, 4], [0.4, 4.4], [1.6, 6.2], [6.2, 5.8], [6.9, 8.2], [5.8, 16], [4.2, 24], [2.6, 26.4], [1.2, 18], [-0.4, 10], [-2, 7]], bc);
    flat(B); seg(3.6, 9, 3.4, 20, 0.6, bl); seg(5.2, 9, 4.6, 17, 0.6, bl);
    flat(B); poly([[4.4, 4.6], [7.2, 4.4], [7.6, 5.4], [6, 5.3], [4.6, 7.6], [3.9, 5.4]], bc);
  }
  if (P.beardOnly) return;
  if (L.beard === 'bushy') {
    B.next(); poly([[-3.6, 3], [6.9, 3.4], [7.4, 6.2], [5.6, 9.6], [2, 11.2], [-2, 9.2], [-4, 5.2]], bc);
    for (const [u, v, a] of [[7, 5, 20], [6.6, 8, 45], [4.6, 10.4, 70], [1.6, 11, 95], [-1.4, 9.8, 120], [-3.4, 7.4, 145], [-4, 4.6, 170]]) { const d = [Math.cos(a * R), Math.sin(a * R)], p = [-d[1], d[0]]; poly([[u + p[0] * 1.5, v + p[1] * 1.5], [u + d[0] * 3.4, v + d[1] * 3.4], [u - p[0] * 1.5, v - p[1] * 1.5]], bc); }
    poly([[4.4, 4.4], [7.6, 3.8], [9.6, 2.4], [8.2, 4.8], [5.4, 6]], bc);
    flat(B); seg(2, 7.6, 3.8, 10, 0.6, bl); seg(-1, 7, 0, 9.4, 0.6, bl);
  }
  if (L.beard === 'goatee') { flat(B); poly([[4.8, 4.9], [7, 4.7], [7.3, 5.2], [6.1, 5.1], [5.2, 5.9]], bc); poly([[3, 7.6], [5.8, 7.8], [4.4, 12.6]], bc); }
  if (L.beard === 'mustache') { flat(B); poly([[4.6, 4.9], [7.1, 4.7], [7.4, 5.3], [6.1, 5.2], [5, 6.4]], bc); }
  if (L.beard === 'stubble') { flat(B); const sc = mix(skin, '#3a3030', 0.28); for (const [u, v] of [[1, 6.8], [2.6, 7.8], [4.4, 7.6], [5.8, 6.6], [3.2, 6.2], [0, 5.4], [5, 5.8], [2, 8.4]]) B.disc(...H(u, v), 0.5 * k, sc); }
  du = 0;
  // what is on the head
  const metalHat = (pts, col) => { B.next('metal'); poly(pts, col); };
  switch (L.hat) {
    case 'bun': B.next(); ell(-2.6, -7.4, 3.2, 2.8, hair); flat(B); seg(-4.8, -5.6, -0.4, -6.4, 1.4, hc); break;
    case 'crown': B.next(); ell(-0.8, -7.8, 3, 2.6, hair); B.next(); poly([[-3.6, -7], [2.8, -7.6], [2.4, -11.6], [-3.2, -11]], hc); flat(B); seg(-3.2, -8.2, 2.6, -8.8, 0.7, '#e8c860'); B.next('metal'); seg(-5.2, -9.6, 4.4, -10.2, 0.8, '#e8c860'); break;
    case 'band': { B.next(); seg(-7.4, -2.2, 7.2, -3.6, 2.6, hc); const sw = (P.cape || 0) * 0.3; B.next('vol', 'fold'); path([[-7, -2], [-10, 1 - sw], [-13, 3 - sw]], 2.4, 1.4, hc); path([[-7, -1.6], [-9.6, 4], [-11, 7.4]], 2.2, 1.2, shade(hc, 0.9)); break; }
    case 'turban': {
      B.next('vol', 'fold'); const pts = []; for (let a = -15; a >= -195; a -= 15) pts.push([Math.cos(a * R) * 8.8, Math.sin(a * R) * 8.8 - 0.6]); poly(pts.concat([[-8, -1], [7.6, -2.4]]), hc);
      flat(B); seg(-7.8, -3.4, 7.4, -5.4, 0.8, shade(hc, 0.75)); seg(-6.8, -6.6, 5.6, -8, 0.7, shade(hc, 0.8));
      B.next('vol', 'fold'); path([[-7.6, -2.6], [-10.6, 1.4], [-12.4, 5.4]], 2.8, 1.4, hc); break;
    }
    case 'helm': case 'plume': case 'feathers': {
      const pts = []; for (let a = -8; a >= -188; a -= 15) pts.push([Math.cos(a * R) * 8.6, Math.sin(a * R) * 8.8 - 0.4]);
      B.next('metal', 'scale'); poly([[-4.4, -1], [-9.4, -0.6], [-10, 6.4], [-5.4, 7.6]], shade(hc, 0.9));
      metalHat(pts.concat([[-8.6, -0.8], [8.4, -1.6]]), hc);
      B.next('metal'); seg(-8.8, -0.6, 8.6, -1.8, 1.8, shade(hc, 0.75));
      B.next('metal'); path([[0, -8.6], [0.3, -11.4]], 2.2, 1.2, '#e0b848');
      B.next('metal'); B.disc(...H(4.6, -4.8), 1.4 * k, '#e8c860');
      if (L.hat === 'plume') { B.next('vol', 'fold'); path([[0.3, -11.4], [-3.6, -13.2], [-8.6, -11.4], [-12, -6.6], [-13, -2]], 4.4, 1.4, h2); path([[0, -11], [-4.6, -11], [-9, -7.6], [-10.6, -3]], 3, 1, shade(h2, 0.85)); }
      if (L.hat === 'feathers') for (const [p0, p1, p2] of [[[1.4, -9.6], [5, -34], [-30, -31]], [[-1.2, -9.6], [-2.4, -30], [-34, -20]]]) {
        const bz = (t) => [(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
        for (let i = 0; i < 18; i++) { const a = bz(i / 18), b = bz((i + 1) / 18); B.next(i % 3 === 2 ? 'flat' : 'vol'); seg(a[0], a[1], b[0], b[1], 1.7 - i * 0.06, i % 3 === 2 ? shade(h2, 0.45) : i % 3 === 1 ? shade(h2, 1.2) : h2); }
      }
      break;
    }
    case 'scholar': B.next(); poly([[-6.2, -4], [5.6, -5.4], [4.2, -13.4], [-5.2, -12.4]], hc); flat(B); seg(-6, -4.6, 5.4, -6, 1.2, shade(hc, 1.4)); B.next('vol', 'fold'); path([[-6, -4.2], [-9.4, 0], [-11.6, 5]], 2.2, 1.2, hc); break;
    case 'hood': B.next('vol', 'fold'); poly([[5.6, -6.6], [1, -9.6], [-5, -8.8], [-9, -3], [-9.6, 3], [-7.2, 8.8], [-2, 9.4], [-1.4, 4], [0.6, -1], [3.8, -3.8]], hc); break;
    default: break;
  }
}

// ---------------------------------------------------------------- a hand-drawn head (heads.js) put on at the neck
// Scale2x: every letter becomes four, the corners taking a neighbour's letter where two edges meet, so the doubled
// head keeps smooth diagonals instead of turning blocky
function scale2x(g) {
  let x0 = 99, x1 = -99, y0 = 99, y1 = -99; for (const k of g.keys()) { const [x, y] = k.split(',').map(Number); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const at = (x, y) => g.get(x + ',' + y) || '.', o = new Map();
  for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) {
    const P = at(x, y), A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
    const e = [C === A && C !== D && A !== B ? A : P, A === B && A !== C && B !== D ? B : P, D === C && D !== B && C !== A ? C : P, B === D && B !== A && D !== C ? D : P];
    e.forEach((ch, q) => { if (ch !== '.') o.set((x * 2 + (q & 1)) + ',' + (y * 2 + (q >> 1)), ch); });
  }
  return o;
}
function drawHeadT(B, L, c, P, ang, beardOnly) {
  // black hair reads as a dark slate, the way pixel games draw it, so its light and shade still show
  const dk = (col) => hexRGB(col).reduce((a, b) => a + b, 0) < 240, lift = (col) => (dk(col) ? mix(col, '#3c4260', 0.42) : col);
  const hair = lift(L.hair || '#1e1814'), skin = L.skin || '#f0c49a', hc = L.hatC || '#3a3a5a', h2 = L.hatC2 || '#c03030', bc = lift(L.beardC || L.hair || '#1e1814');
  const PAL = {
    H: hair, G: mix(hair, '#a8b2d0', 0.3), h: shade(hair, 0.62),
    S: skin, L: shade(skin, 1.08), s: mix(shade(skin, 0.82), '#7a4a6a', 0.12), t: shade(skin, 0.64),
    A: hc, B: shade(hc, 1.3), a: shade(hc, 0.64), R: h2, r: shade(h2, 0.64), k: shade(h2, 0.35), Y: '#e8c050', y: '#a07828',
    D: bc, F: mix(bc, '#a8b2d0', 0.3), d: shade(bc, 0.62), z: mix(skin, '#3a3030', 0.32),
    e: '#1c1210', c: '#9a3a3a', i: mix(L.eyeC || '#5a3a2a', '#ffffff', 0.35), m: '#5a2020', n: '#e8e0d8', p: L.lips || shade(skin, 0.7), q: mix(skin, '#ff8080', 0.28), w: L.paint || '#e8e0d0',
  };
  let g = new Map(); const put = (rows, y0, x0 = 0) => rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] !== '.') g.set((i + x0) + ',' + (y0 + j), r[i]); });
  const beard = L.beard && L.beard !== 'none' && L.beard !== 'long' ? BEARDS[L.beard] : null;
  if (!beardOnly) {
    put(L.hat === 'bald' ? HEADS.bald : L.longHair ? HEADS.long : HEADS.short, 0);
    if (beard && !(P.mouth && L.beard === 'stubble')) put(beard[1], beard[0]);
    if (L.beard === 'long') put(['..........DDDDD.'], 12);
    const hat = HATS[L.hat]; if (hat) put(hat[1], hat[0], hat[2] || 0);
  } else put(BEARDS.long[1], BEARDS.long[0]);
  g = scale2x(g);
  const E = (x, y, ch) => g.set(x + ',' + y, ch);
  if (!beardOnly) {
    // a jaw line: the bottom edge of the face takes the deep skin tone, so the chin stands off the neck
    for (const [k, ch] of [...g]) { if (!'SLs'.includes(ch)) continue; const [x, y] = k.split(',').map(Number); if (x >= 14 && y >= 22 && !g.has(x + ',' + (y + 1))) E(x, y, 't'); }
    // the face, at the doubled size: eyes three pixels tall with a glint, a one-pixel brow, a hint of nose and mouth
    if (P.eye === 'closed' || P.eye === 'hurt') { for (const x of [19, 20, 21]) E(x, 21, 'e'); E(28, 21, 'e'); E(29, 21, 'e'); if (P.eye === 'hurt') { E(19, 20, 'e'); E(29, 20, 'e'); } }
    else {
      for (const y of [19, 20, 21]) { E(20, y, 'e'); E(21, y, 'e'); E(29, y, 'e'); } E(21, 19, 'i'); E(28, 20, 'e'); E(28, 21, 'e');
      if (L.lashes) { E(22, 19, 'e'); E(19, 19, 'e'); E(30, 19, 'e'); }
    }
    if (L.fierce) { E(18, 15, 'h'); E(19, 15, 'h'); E(20, 16, 'h'); E(21, 16, 'h'); E(22, 17, 'h'); E(27, 16, 'h'); E(28, 16, 'h'); E(29, 15, 'h'); }
    else if (!L.lashes) { for (const x of [19, 20, 21, 22]) E(x, 16, 'h'); E(28, 16, 'h'); E(29, 16, 'h'); }
    else { for (const x of [20, 21, 22]) E(x, 16, 's'); E(29, 16, 's'); }
    if (g.get('30,22') === 'S') E(30, 22, 's');                                            // under the nose
    if (P.mouth) { for (const [x, y] of [[25, 25], [26, 25], [25, 26], [26, 26], [25, 27]]) E(x, y, 'm'); E(26, 25, 'n'); }
    else if (!beard || L.beard === 'stubble') { E(25, 26, L.lips ? 'p' : 't'); E(26, 26, L.lips ? 'p' : 't'); }
    // a mustache of one fine stroke, its ends drooping; a goatee is a small tuft under the lip
    if (L.beard === 'mustache' || L.beard === 'goatee') { for (const [x, y] of [[23, 25], [24, 24], [25, 24], [26, 24], [27, 24], [28, 24], [29, 25]]) E(x, y, 'D'); E(26, 24, 'F'); if (!P.mouth) { E(25, 26, 't'); E(26, 26, 't'); } }
    if (L.beard === 'goatee') { for (const [x, y] of [[26, 28], [27, 28], [26, 29], [27, 29], [27, 30], [27, 31]]) E(x, y, 'D'); E(26, 29, 'F'); E(28, 29, 'd'); E(28, 30, 'd'); }
    if (L.blush) { E(25, 22, 'q'); E(26, 22, 'q'); }
    if (L.mole) E(23, 24, 'e');
    if (L.scar) for (let k = 0; k < 9; k++) E(17 + k, 14 + k, 'c');
    if (L.paint) for (let x = 18; x <= 27; x++) E(x, 23, 'w');
    if (L.hat === 'feathers') for (const [p0, p1, p2] of [[[18, -4], [26, -40], [-14, -34]], [[14, -4], [10, -32], [-20, -16]]]) {
      for (let i = 0; i <= 90; i++) { const t = i / 90, x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1], ch = i % 10 < 3 ? 'k' : i % 10 < 7 ? 'R' : 'r'; E(Math.round(x), Math.round(y), ch); if (i < 70) E(Math.round(x), Math.round(y) + 1, ch); }
    }
  }
  // which part each letter belongs to (seams and the outline work between parts)
  const kind = (ch) => ('HGh'.includes(ch) ? 0 : 'SLstezimnpqwc'.includes(ch) ? 1 : 'DFd'.includes(ch) ? 3 : 2);
  const ids = [0, 1, 2, 3].map(() => { B.next('flat'); B.meta[B.part].noShade = true; return B.part; });
  let x0 = 99, x1 = -99, y0 = 99, y1 = -99; for (const k of g.keys()) { const [x, y] = k.split(',').map(Number); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const ax = ANCHOR[0] * 2, ay = ANCHOR[1] * 2, a = Math.abs(ang) < 9 ? 0 : ang * R, cs = Math.cos(a), sn = Math.sin(a), r = Math.hypot(Math.max(ax - x0, x1 + 1 - ax), Math.max(ay - y0, y1 + 1 - ay)) + 1;
  const cx = Math.round(c[0]), cy = Math.round(c[1]);
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, u = Math.floor(dx * cs + dy * sn + ax), v = Math.floor(-dx * sn + dy * cs + ay), ch = g.get(u + ',' + v);
    if (ch) B.setp(x, y, pack(PAL[ch]), ids[kind(ch)]);
  }
}

// a weapon held at hand h, pointing at angle a (0 down, 90 forward, 180 up); s is pixels per old unit
function drawWeapon(B, kind, h, a, s, back, colour) {
  const d = dirOf(a), p = [Math.cos(a * R), -Math.sin(a * R)], steel = back ? '#9aa2b0' : '#d8e0ea', wood = back ? '#5a3a20' : '#7a5028', gold = '#e0b040';
  const at = (l, w = 0) => [h[0] + d[0] * l * s + p[0] * w * s, h[1] + d[1] * l * s + p[1] * w * s];
  const line = (l0, l1, w, c, k = 'vol') => { B.next(k, k === 'vol' ? 'grain' : null); const A = at(l0), Bp = at(l1); B.seg(A[0], A[1], Bp[0], Bp[1], w * s, c); };
  const poly = (pts, c, k = 'metal') => { B.next(k); B.poly(pts, c); };
  const edge = (l0, l1, w0, w1) => { flat(B); const A = at(l0, w0), Bp = at(l1, w1); B.seg(A[0], A[1], Bp[0], Bp[1], 1, '#ffffff'); };
  const tassel = (l) => { B.next('vol', 'fold'); const c = at(l); for (const k of [-1, 0, 1]) B.limb(c, [c[0] - d[0] * 3 * s + k * 1.4 * s, c[1] - d[1] * 3 * s + 3.2 * s], 1.8 * s, 1 * s, '#c02828'); B.next(); B.disc(...c, 1.3 * s, '#e0b040'); };
  switch (kind) {
    case 'sword': line(-3, 0, 1.4, '#4a2a1a'); line(-3.6, -3.2, 1.8, gold, 'metal'); line(0.8, 1.2, 4.2, gold, 'metal'); poly([at(1.4, -0.9), at(14, -0.8), at(15.6, 0), at(14, 0.8), at(1.4, 0.9)], steel); edge(2.5, 13.5, 0.2, 0.2); flat(B); { const A = at(2.5, -0.3), Bp = at(12.5, -0.3); B.seg(A[0], A[1], Bp[0], Bp[1], 1, shade(steel, 0.62)); } break;
    case 'saber': line(-3, 0, 1.4, '#3a2a1a'); line(0.8, 1.2, 3.8, gold, 'metal'); poly([at(1.5, -0.9), at(12, -0.9), at(15.4, 0), at(17, 1.6), at(10, 1.6), at(1.5, 1.2)], steel); edge(2.5, 15, -0.5, 0.4); break;
    case 'knife': line(-2, 0, 1.3, '#4a2a1a'); poly([at(0.8, -0.9), at(7.4, -0.7), at(8.8, 0.6), at(0.8, 1)], steel); break;
    case 'club': B.next(); { const A = at(-3), Bp = at(13); B.limb(A, Bp, 2.4 * s, 3.8 * s, wood); } flat(B); for (const l of [6, 9.5]) { const A = at(l, -1.6), Bp = at(l + 0.6, 1.6); B.seg(A[0], A[1], Bp[0], Bp[1], 1, shade(wood, 0.6)); } break;
    case 'staff': line(-12, 15, 1.6, colour || wood); B.next('metal'); B.disc(...at(16), 2.6 * s, gold); B.next('metal'); B.disc(...at(16), 1.2 * s, '#e04040'); flat(B); for (const k of [-1, 1]) { const A = at(15.4, k * 2.4), Bp = at(18, k * 3.8); B.seg(A[0], A[1], Bp[0], Bp[1], 1.6, gold); } break;
    case 'spear': line(-12, 17, 1.5, colour || wood); poly([at(16, -1.3), at(18.5, -1.1), at(22.5, 0), at(18.5, 1.1), at(16, 1.3)], steel); edge(17, 21.5, 0, 0); tassel(15.6); break;
    case 'snake': line(-12, 15, 1.6, colour || '#2a2a2a'); B.next('metal'); { let q = at(15); for (let i = 0; i < 4; i++) { const n = at(16 + i * 2, i % 2 ? -1.2 : 1.2); B.seg(q[0], q[1], n[0], n[1], 1.6 * s, steel); q = n; } const t = at(25); B.limb(q, t, 1.6 * s, 0.6 * s, steel); } tassel(14.6); break;
    case 'glaive': line(-13, 14, 1.8, colour || '#2a5a3a'); poly([at(11, -1), at(13, 4.5), at(18, 6.6), at(25, 3.6), at(22, 0.8), at(14, -1.4)], steel); edge(13, 22.6, 4.4, 3.4); B.next('metal'); B.disc(...at(12.4, 0.2), 2 * s, '#3a9a5a'); B.next('metal'); { const A = at(11.2, -1.2), Bp = at(14.6, 1.6); B.seg(A[0], A[1], Bp[0], Bp[1], 1.4 * s, gold); } line(-14, -12, 2.2, gold, 'metal'); break;
    case 'halberd': line(-12, 17, 1.6, colour || '#7a2020'); poly([at(16, -1.3), at(18.6, -1.1), at(23.4, 0), at(18.6, 1.1), at(16, 1.3)], steel); poly([at(13, 1), at(17.5, 1), at(17.6, 4), at(16.6, 6.2), at(15, 5.4), at(14, 3)], steel); poly([at(13, -1), at(17.5, -1), at(17.6, -4), at(16.6, -6.2), at(15, -5.4), at(14, -3)], steel); edge(18, 22.4, 0, 0); tassel(12.4); break;
    case 'axe': line(-3, 14, 2, wood); poly([at(8.6, 0.6), at(7.2, 5.6), at(9, 8.4), at(12.4, 8.8), at(15.4, 6.2), at(14.2, 0.6)], steel); edge(7.6, 15, 6.2, 6.6); break;
    case 'jis': line(-2, 9, 1.5, '#4a3a2a'); poly([at(8.5, -1), at(8.5, 1), at(13.4, 0)], steel); poly([at(6.4, 1), at(9.6, 1), at(9.4, 4.6), at(8, 5.4), at(7, 4.2)], steel); break;
    case 'fan': line(-2, 3, 1.3, '#6a4a2a'); poly([at(3, -1), at(8, -5.4), at(12.4, -3.2), at(13.4, 1.6), at(10.2, 5.4), at(3, 1)], '#f4f0e8', 'vol'); flat(B); for (const k of [-2.6, 0, 2.6]) { const A = at(4, 0), Bp = at(12, k); B.seg(A[0], A[1], Bp[0], Bp[1], 0.8, '#b8b0a0'); } break;
    case 'bow': { B.next(); let q = at(-9, 3); for (let i = 1; i <= 10; i++) { const t = -9 + i * 1.8, n = at(t, 3 + Math.sin(i / 10 * Math.PI) * -6); B.seg(q[0], q[1], n[0], n[1], 1.6 * s, '#6a3a1a'); q = n; } flat(B); B.seg(...at(-9, 3), ...at(9, 3), 1, '#e8e0d0'); break; }
    // ---- Longmen: things people hold
    case 'ringsaber': line(-3.4, 0, 1.4, '#2a1a3a'); B.next('metal'); B.disc(...at(-5.2), 2 * s, gold); flat(B); B.disc(...at(-5.2), 0.9 * s, '#000000'); B.c.forEach((v, i) => { if (B.p[i] === B.part) B.c[i] = -1; }); line(0.8, 1.2, 3.8, gold, 'metal'); poly([at(1.5, -0.9), at(12.5, -0.9), at(16, 0.2), at(17.4, 1.8), at(10, 1.6), at(1.5, 1.2)], steel); edge(2.5, 15.5, -0.5, 0.4); break;
    // ---- book two: a saber snapped short, a training stick, the plain black 沉江, the long blood-red blade, a straight rod
    case 'brokensaber': line(-3.4, 0, 1.4, '#2a1a3a'); B.next('metal'); B.disc(...at(-5.2), 2 * s, gold); flat(B); B.disc(...at(-5.2), 0.9 * s, '#000000'); B.c.forEach((v, i) => { if (B.p[i] === B.part) B.c[i] = -1; }); line(0.8, 1.2, 3.8, gold, 'metal'); poly([at(1.5, -0.9), at(5.6, -0.9), at(6.4, 0.3), at(5.2, 0.6), at(6, 1.4), at(1.5, 1.2)], steel); break;
    case 'stick': { B.next('vol', 'grain'); const A = at(-2), Bp = at(15); B.limb(A, Bp, 1.5 * s, 1.0 * s, back ? '#6a4a28' : '#8a6234'); flat(B); const k = at(7, 0.6); B.seg(k[0], k[1], k[0] + 1, k[1] - 1, 1, '#5a3a1a'); break; }
    case 'blackblade': { line(-3.6, 0, 1.4, '#1a1a1e'); flat(B); for (const l of [-3, -2, -1]) { const A = at(l, -0.8), Bp = at(l + 0.4, 0.8); B.seg(A[0], A[1], Bp[0], Bp[1], 0.8, '#3a3a40'); } line(0.6, 1.0, 3.2, '#2a2a30', 'metal'); poly([at(1.4, -0.85), at(14.5, -0.85), at(17.6, 0.3), at(17.2, 1.3), at(1.4, 1.2)], back ? '#2a2c34' : '#3a3e4a'); flat(B); { const A = at(2.5, 0.9), Bp = at(16.6, 0.9); B.seg(A[0], A[1], Bp[0], Bp[1], 1, back ? '#7a8294' : '#a8b4cc'); } break; }
    case 'bloodblade': { line(-4.4, 0, 1.4, '#2a0a0e'); B.next('metal'); B.disc(...at(-4.8), 1.5 * s, '#c8a040'); line(0.6, 1.1, 4.4, '#5a0a10', 'metal'); poly([at(1.5, -0.8), at(9, -1.1), at(16, -0.4), at(21, 1.2), at(19.6, 2.0), at(13, 1.7), at(6, 1.4), at(1.5, 1.1)], back ? '#7a1018' : '#b8141e'); flat(B); { const A = at(2.5, -0.5), Bp = at(15, -0.2); B.seg(A[0], A[1], Bp[0], Bp[1], 1, back ? '#c8505a' : '#ff8a8a'); } break; }
    case 'rodS': { line(-3, 6, 1, '#7a6a3a'); B.next('vol'); const A = at(6), Bp = at(26); B.seg(A[0], A[1], Bp[0], Bp[1], 0.7 * s, '#a89a5a'); flat(B); const t = at(26), u = at(27.5); B.seg(t[0], t[1], u[0], u[1], 0.6, '#e8e0c0'); break; }
    case 'fruit': { B.next('vol'); B.disc(...at(2.4), 3 * s, '#e0281e'); flat(B); B.disc(...at(1.8, -1), 0.9 * s, '#ffb0a0'); B.next('vol'); { const A = at(4.6), Bp = at(5.8, 1.2); B.seg(A[0], A[1], Bp[0], Bp[1], 1.2 * s, '#3a8a2a'); } break; }
    case 'xingmu': poly([at(-1.6, -1.4), at(2.6, -1.4), at(2.6, 1.4), at(-1.6, 1.4)], colour || '#5a2a1a', 'vol'); flat(B); { const A = at(-1.4, -1.2), Bp = at(2.4, -1.2); B.seg(A[0], A[1], Bp[0], Bp[1], 1, '#8a4a2a'); } break;
    case 'abacus': { poly([at(-3, -3.4), at(3.4, -3.4), at(3.4, 3.4), at(-3, 3.4)], '#c89a30'); poly([at(-2.2, -2.6), at(2.6, -2.6), at(2.6, 2.6), at(-2.2, 2.6)], '#3a2010', 'vol'); flat(B); for (let r = -1.6; r <= 1.8; r += 1.1) for (let c = -1.4; c <= 1.8; c += 1.1) B.disc(...at(c, r), 0.7 * s, (c + r) % 2 > 0.5 ? '#f0d070' : '#e0b040'); break; }
    case 'brush': line(-2, 11, 1.1, colour || '#1e1e24'); B.next('metal'); B.disc(...at(-2.4), 1 * s, gold); poly([at(11, -0.8), at(13.6, 0), at(11, 0.8)], steel); break;
    case 'rod': { line(-3, 6, 1, '#7a6a3a'); B.next('vol'); const A = at(6), Bp = at(30); B.seg(A[0], A[1], Bp[0], Bp[1], 0.6 * s, '#a89a5a'); flat(B); const tip = at(30); B.seg(tip[0], tip[1], tip[0] + 2, tip[1] + 40, 0.5, '#d8e0e8'); break; }
    case 'pole': line(-14, 26, 1.1, colour || '#6a5030'); break;
    case 'chain': { B.next('metal'); let q = at(0); for (let i = 1; i <= 10; i++) { const n = at(i * 1.4, Math.sin(i / 10 * Math.PI) * 2.2); B.seg(q[0], q[1], n[0], n[1], 1.4 * s, i % 2 ? '#7a7a84' : '#a8a8b4'); q = n; } B.next('metal'); B.disc(q[0], q[1], 1.6 * s, '#5a5a64'); break; }
    case 'case': { poly([at(-9, -1.6), at(13, -1.6), at(13, 1.6), at(-9, 1.6)], '#5a1e18', 'vol'); B.next('metal'); for (const l of [-7, 1, 11]) { const A = at(l, -1.7), Bp = at(l, 1.7); B.seg(A[0], A[1], Bp[0], Bp[1], 1.3, gold); } B.next('metal'); B.disc(...at(1, 0), 1.2 * s, '#f0d070'); break; }
    case 'ledger': poly([at(-1, -3), at(5, -3), at(5, 3), at(-1, 3)], '#3a4a5a', 'vol'); flat(B); { const A = at(-1, -3), Bp = at(-1, 3); B.seg(A[0], A[1], Bp[0], Bp[1], 1.2, '#c8b070'); } break;
    case 'tray': { poly([at(-3, -0.7), at(8, -0.7), at(8, 0.7), at(-3, 0.7)], '#6a3a1a', 'vol'); B.next(); B.disc(...at(2, 2.6), 2.2 * s, '#e8e4d8'); B.next(); B.disc(...at(6, 1.7), 1.2 * s, '#d8d4c8'); break; }
    case 'cage': { B.next('vol'); B.disc(...at(4), 4 * s, '#3a2a1a'); flat(B); B.disc(...at(4), 3.3 * s, '#000000'); B.c.forEach((v, i) => { if (B.p[i] === B.part) B.c[i] = -1; }); flat(B); for (let k = -2; k <= 2; k++) { const A = at(1, k * 1.4), Bp = at(7.6, k * 1.4); B.seg(A[0], A[1], Bp[0], Bp[1], 0.8, '#5a4a2a'); } B.next(); B.disc(...at(5, 0), 1.6 * s, '#1a1a22'); flat(B); B.set(...at(5.4, 1.6), 0xf0c020); break; }
    case 'umbrella': { line(-2, 12, 0.9, '#5a3a20'); B.next('vol', 'fold'); B.poly([at(12, -9), at(15, 0), at(12, 9), at(10.5, 0)], colour || '#c8a058'); break; }
    case 'mace': line(-3, 11, 1.9, wood); B.next('metal'); B.disc(...at(13), 3.6 * s, '#6a6a72'); B.next('metal'); for (const k of [-1, 1]) B.disc(...at(13, k * 3.4), 1.1 * s, '#a0a0a8'); B.disc(...at(16.8), 1.1 * s, '#a0a0a8'); break;
    default: break;
  }
}

// ---------------------------------------------------------------- animations: name -> frames (pose, seconds)
const F = (o, t = 0.1) => ({ o, t });
export const ANIMS = {
  idle: [F({ fa: [35, 95], ba: [25, 100], w: 135, w2: 130, fl: [14, 10], bl: [-12, 8], lean: 5 }, 0.45), F({ fa: [33, 98], ba: [23, 102], w: 138, w2: 132, fl: [14, 12], bl: [-12, 10], lean: 6, by: 0.5 }, 0.45)],
  stand: [F({ fa: [6, 10], ba: [-6, 10], w: 20, w2: 20, fl: [4, 0], bl: [-4, 0], lean: 0 }, 0.6), F({ fa: [7, 12], ba: [-5, 12], w: 22, w2: 22, fl: [4, 0], bl: [-4, 0], lean: 0, by: 0.4 }, 0.6)],
  walk: [0, 1, 2, 3].map((i) => { const a = [26, 0, -24, 0][i], k = [6, 26, 4, 26][i]; return F({ fl: [a, k], bl: [-a, [4, 26, 6, 26][i]], fa: [30 - a * 0.5, 90], ba: [20 + a * 0.5, 95], w: 130, w2: 125, by: i % 2 ? -0.8 : 0, lean: 6 }, 0.13); }),
  run: [0, 1, 2, 3].map((i) => { const a = [44, 5, -40, 5][i]; return F({ fl: [a, [20, 70, 10, 70][i]], bl: [-a + 5, [10, 70, 20, 70][i]], fa: [40 - a * 0.9, 95], ba: [10 + a * 0.9, 100], w: 110, w2: 110, by: i % 2 ? -1.5 : 0, lean: 18 }, 0.09); }),
  jab: [F({ fa: [70, 25], ba: [20, 100], fl: [20, 8], bl: [-16, 6], lean: 10, w: 105 }, 0.05), F({ fa: [88, 0], ba: [10, 105], fl: [22, 6], bl: [-18, 6], lean: 14, bx: 1, w: 95 }, 0.09), F({ fa: [50, 70], ba: [20, 100], lean: 8, w: 120 }, 0.08)],
  straight: [F({ fa: [30, 80], ba: [80, 10], fl: [22, 6], bl: [-20, 6], lean: 6, w: 140 }, 0.06), F({ fa: [92, -4], ba: [-25, 60], fl: [30, 4], bl: [-28, 4], lean: 20, bx: 2.5, w: 92 }, 0.12), F({ fa: [60, 50], ba: [0, 80], lean: 10, w: 115 }, 0.1)],
  upper: [F({ fa: [20, 60], ba: [30, 90], fl: [30, 40], bl: [-20, 40], lean: 18, by: 2.5, w: 70 }, 0.07), F({ fa: [150, -15], ba: [-20, 50], fl: [15, 4], bl: [-20, 10], lean: -6, by: -2, bx: 1, w: 170, mouth: 1 }, 0.14), F({ fa: [120, 20], ba: [0, 60], lean: 0, w: 150 }, 0.1)],
  kick: [F({ fl: [60, 90], bl: [-8, 4], fa: [40, 90], ba: [-30, 60], lean: -6, w: 130 }, 0.06), F({ fl: [98, 0], bl: [-12, 2], fa: [30, 100], ba: [-50, 40], lean: -18, bx: -1, w: 140 }, 0.13), F({ fl: [50, 80], bl: [-10, 4], lean: -4, w: 130 }, 0.08)],
  round: [F({ fl: [70, 100], bl: [-6, 4], fa: [60, 70], ba: [-40, 50], lean: -10, w: 120 }, 0.07), F({ fl: [108, 4], bl: [-18, 2], fa: [-20, 40], ba: [-60, 30], lean: -28, bx: -2, w: 90 }, 0.14), F({ fl: [60, 70], bl: [-10, 4], lean: -6, w: 120 }, 0.1)],
  jump: [F({ fl: [40, 80], bl: [-10, 70], fa: [60, 70], ba: [40, 80], lean: 8, w: 150, w2: 140 }, 0.2)],
  fall: [F({ fl: [20, 40], bl: [-20, 30], fa: [90, 30], ba: [70, 40], lean: 4, w: 120, w2: 120 }, 0.2)],
  jkick: [F({ fl: [102, 0], bl: [-20, 95], fa: [50, 80], ba: [-40, 60], lean: -16, w: 140 }, 0.3)],
  guard: [F({ fa: [62, 120], ba: [52, 125], fl: [22, 18], bl: [-20, 14], lean: -4, by: 1, w: 165, w2: 160 }, 0.3)],
  hurt: [F({ fa: [-30, 30], ba: [-60, 30], fl: [10, 20], bl: [-25, 15], lean: -22, tilt: -18, eye: 'hurt', mouth: 1, w: 40, w2: 40 }, 0.2)],
  hurt2: [F({ fa: [60, 40], ba: [30, 30], fl: [20, 30], bl: [-10, 20], lean: 30, tilt: 20, eye: 'hurt', mouth: 1, by: 2, w: 60, w2: 60 }, 0.2)],
  air: [F({ fa: [-110, 20], ba: [-140, 20], fl: [40, 30], bl: [70, 40], lean: -60, by: -2, tilt: -10, eye: 'hurt', mouth: 1, w: -40, w2: -60 }, 0.2)],
  down: [F({ fa: [-110, 0], ba: [-80, 10], fl: [88, 4], bl: [80, 10], lean: -90, by: 13, bx: 4, tilt: -90, eye: 'closed', w: -80, w2: -80 }, 0.3)],
  dizzy: [F({ fa: [5, 10], ba: [-5, 10], fl: [8, 10], bl: [-8, 8], lean: -8, tilt: -14, eye: 'closed', w: 15, w2: 15 }, 0.3), F({ fa: [8, 10], ba: [-8, 10], fl: [8, 10], bl: [-8, 8], lean: 2, tilt: 12, eye: 'closed', w: 18, w2: 18 }, 0.3)],
  getup: [F({ fa: [-10, 40], ba: [-40, 20], fl: [70, 120], bl: [10, 130], lean: 30, by: 7, w: 60, w2: 60 }, 0.14), F({ fa: [20, 60], ba: [0, 60], fl: [40, 80], bl: [-10, 70], lean: 20, by: 3, w: 100, w2: 100 }, 0.12)],
  grab: [F({ fa: [82, 15], ba: [75, 20], fl: [24, 10], bl: [-22, 8], lean: 12, w: 160, w2: 150 }, 0.2)],
  knee: [F({ fa: [70, 40], ba: [70, 40], fl: [95, 120], bl: [-6, 4], lean: 14, w: 160, w2: 150 }, 0.1)],
  throw: [F({ fa: [140, 10], ba: [130, 10], fl: [20, 10], bl: [-30, 10], lean: -10, w: 170 }, 0.1), F({ fa: [60, 0], ba: [50, 0], fl: [35, 6], bl: [-28, 6], lean: 22, bx: 2, w: 80 }, 0.2)],
  carry: [F({ fa: [168, 12], ba: [162, 12], fl: [12, 6], bl: [-10, 6], lean: -2, w: 175, w2: 175 }, 0.3)],
  slash: [F({ fa: [175, 20], ba: [120, 50], fl: [18, 12], bl: [-22, 10], lean: -6, w: 205, w2: 190 }, 0.08), F({ fa: [70, -10], ba: [-20, 60], fl: [34, 8], bl: [-30, 6], lean: 18, bx: 2, w: 55, w2: 30 }, 0.1), F({ fa: [50, 10], ba: [0, 70], lean: 12, w: 40, w2: 40 }, 0.12)],
  slash2: [F({ fa: [20, 40], ba: [40, 60], fl: [18, 12], bl: [-22, 10], lean: 6, w: 20, w2: 40 }, 0.07), F({ fa: [140, -20], ba: [-30, 40], fl: [30, 6], bl: [-30, 6], lean: 4, bx: 1.5, w: 150, w2: 170 }, 0.1), F({ fa: [120, 0], ba: [0, 60], lean: 2, w: 160, w2: 150 }, 0.1)],
  thrust: [F({ fa: [40, 60], ba: [60, 70], fl: [20, 20], bl: [-20, 14], lean: 0, bx: -2, w: 90, w2: 90 }, 0.08), F({ fa: [90, 0], ba: [85, 10], fl: [45, 2], bl: [-42, 2], lean: 22, bx: 4, by: 1.5, w: 90, w2: 90 }, 0.14), F({ fa: [70, 20], ba: [60, 40], lean: 12, w: 100, w2: 100 }, 0.1)],
  spin: [F({ fa: [90, 0], ba: [-90, 0], lean: 0, w: 90, w2: -90, fl: [20, 10], bl: [-20, 10] }, 0.06), F({ fa: [30, 0], ba: [-150, 0], lean: 0, w: 20, w2: -160, fl: [10, 10], bl: [-10, 10] }, 0.06), F({ fa: [-90, 0], ba: [90, 0], lean: 0, w: -90, w2: 90, fl: [-20, 10], bl: [20, 10] }, 0.06), F({ fa: [-150, 0], ba: [30, 0], lean: 0, w: -160, w2: 20, fl: [-10, 10], bl: [10, 10] }, 0.06)],
  cast: [F({ fa: [150, 10], ba: [140, 10], fl: [12, 6], bl: [-12, 6], lean: -8, tilt: -10, w: 175, mouth: 1 }, 0.3)],
  shout: [F({ fa: [100, -40], ba: [-80, 20], fl: [30, 10], bl: [-30, 10], lean: -10, tilt: -12, mouth: 1, w: 120 }, 0.3)],
  shoot: [F({ fa: [90, 0], ba: [88, 150], fl: [22, 6], bl: [-22, 6], lean: -2, w: 180 }, 0.2)],
  victory: [F({ fa: [172, 0], ba: [-20, 40], fl: [10, 4], bl: [-10, 4], lean: -4, tilt: -6, w: 178, mouth: 1 }, 0.5)],
  sit: [F({ fa: [40, 60], ba: [30, 70], fl: [88, 92], bl: [80, 95], lean: 0, by: 7.5, w: 40 }, 1)],
  bow: [F({ fa: [70, 90], ba: [70, 95], fl: [6, 0], bl: [-6, 0], lean: 30, tilt: 10, w: 30 }, 1)],
};
// ---- Longmen: the gestures a story needs. 'calm' poses keep a weapon sheathed (unless the look always holds its thing)
const C1 = (o, t) => F({ calm: 1, ...o }, t);
Object.assign(ANIMS, {
  stand: ANIMS.stand.map((f) => C1(f.o, f.t)), walk: ANIMS.walk.map((f) => C1(f.o, f.t)), run: ANIMS.run.map((f) => C1(f.o, f.t)),
  sit: [C1({ fa: [40, 60], ba: [30, 70], fl: [88, 92], bl: [80, 95], lean: 0, by: 7.5, w: 90 }, 1)], bow: [C1(ANIMS.bow[0].o, 1)],
  hold: [C1({ fa: [30, 70], ba: [-4, 14], fl: [4, 0], bl: [-4, 0], lean: 0, w: 92, w2: 20 }, 0.6), C1({ fa: [31, 70], ba: [-3, 15], fl: [4, 0], bl: [-4, 0], lean: 0, by: 0.4, w: 92, w2: 20 }, 0.6)],
  point: [C1({ fa: [96, -6], ba: [-6, 12], fl: [8, 2], bl: [-6, 2], lean: 3, w: 20, w2: 20 }, 0.6)],
  think: [C1({ fa: [26, 138], ba: [30, 80], fl: [4, 0], bl: [-4, 0], lean: 2, tilt: 6, w: 20, w2: 20 }, 0.8), C1({ fa: [26, 140], ba: [30, 80], fl: [4, 0], bl: [-4, 0], lean: 2, tilt: 8, by: 0.3, w: 20, w2: 20 }, 0.8)],
  arms: [C1({ fa: [28, 112], ba: [36, 104], fl: [6, 0], bl: [-6, 0], lean: -2, w: 20, w2: 20 }, 0.8), C1({ fa: [28, 112], ba: [36, 104], fl: [6, 0], bl: [-6, 0], lean: -2, by: 0.3, w: 20, w2: 20 }, 0.8)],
  shrug: [C1({ fa: [40, 50], ba: [-36, 60], fl: [5, 0], bl: [-5, 0], lean: -2, tilt: -6, w: 20, w2: 20 }, 0.8)],
  salute: [C1({ fa: [44, 118], ba: [40, 122], fl: [4, 0], bl: [-4, 0], lean: 6, tilt: 4, w: 20, w2: 20 }, 0.8)],
  laugh: [C1({ fa: [30, 96], ba: [-30, 40], fl: [8, 2], bl: [-8, 2], lean: -10, tilt: -16, mouth: 1, w: 20, w2: 20 }, 0.18), C1({ fa: [32, 98], ba: [-32, 42], fl: [8, 2], bl: [-8, 2], lean: -12, tilt: -18, mouth: 0, by: 0.4, w: 20, w2: 20 }, 0.18)],
  kneel: [C1({ fl: [86, 88], bl: [0, 92], by: 7.2, lean: 4, fa: [36, 50], ba: [38, 52], bound: 1, w: null, w2: null }, 1)],
  crouch: [C1({ fl: [74, 128], bl: [22, 118], by: 6, lean: 22, tilt: 14, fa: [70, 30], ba: [40, 50], w: 20, w2: 20 }, 1)],
  fish: [F({ fa: [50, 60], ba: [40, 70], fl: [6, 0], bl: [-6, 0], lean: 2, w: 140 }, 1)],
  juggle: [C1({ fl: [10, 4], bl: [-6, 2], fa: [30, 40], ba: [-24, 30], lean: 0 }, 0.16), C1({ fl: [52, 50], bl: [-4, 2], fa: [36, 50], ba: [-30, 40], lean: -4, by: -0.3 }, 0.16)],
  palm: [F({ fa: [92, -4], ba: [86, 2], fl: [32, 4], bl: [-30, 4], lean: 14, bx: 2, mouth: 1, w: 90, w2: 90 }, 0.4)],
  pole: [F({ fa: [60, 40], ba: [80, 30], fl: [10, 4], bl: [-14, 4], lean: 10, w: 160 }, 0.9), F({ fa: [40, 30], ba: [60, 30], fl: [14, 4], bl: [-10, 4], lean: 20, bx: 1, w: 150 }, 0.9)],
  dead: [C1({ fa: [-100, 10], ba: [-70, 10], fl: [88, 4], bl: [82, 10], lean: -90, by: 13, bx: 4, tilt: -90, eye: 'closed', w: null, w2: null }, 1)],
  cuffed: [C1({ fa: [36, 50], ba: [38, 52], fl: [4, 0], bl: [-4, 0], lean: 2, bound: 1, w: null, w2: null }, 0.8), C1({ fa: [36, 50], ba: [38, 52], fl: [4, 0], bl: [-4, 0], lean: 2, by: 0.3, bound: 1, w: null, w2: null }, 0.8)],
  cuffwalk: [0, 1, 2, 3].map((i) => { const a = [22, 0, -20, 0][i], k = [6, 22, 4, 22][i]; return C1({ fl: [a, k], bl: [-a, [4, 22, 6, 22][i]], fa: [36, 50], ba: [38, 52], by: i % 2 ? -0.8 : 0, lean: 6, bound: 1, w: null, w2: null }, 0.14); }),
  startle: [C1({ fa: [60, 60], ba: [50, 70], fl: [10, 6], bl: [-14, 6], lean: -10, tilt: -10, mouth: 1, w: 20, w2: 20 }, 0.6)],
});
// ---- book two: the fighting poses. Strikes are played once and hold their last frame (actors.js play()).
Object.assign(ANIMS, {
  stance: [F({ fa: [52, 44], ba: [24, 64], fl: [30, 34], bl: [-26, 28], lean: 10, by: 2.4, w: 112, w2: 100 }, 0.5), F({ fa: [52, 46], ba: [24, 66], fl: [30, 36], bl: [-26, 30], lean: 11, by: 2.9, w: 114, w2: 100 }, 0.5)],
  stanceC: [F({ fa: [44, 30], ba: [20, 50], fl: [22, 20], bl: [-20, 18], lean: 4, by: 1.2, w: 60, eye: 'closed' }, 0.7), F({ fa: [44, 31], ba: [20, 51], fl: [22, 20], bl: [-20, 18], lean: 4, by: 1.5, w: 61, eye: 'closed' }, 0.7)],
  runw: [0, 1, 2, 3].map((i) => { const a = [44, 5, -40, 5][i]; return F({ fl: [a, [20, 70, 10, 70][i]], bl: [-a + 5, [10, 70, 20, 70][i]], fa: [-20, 30], ba: [10 + a * 0.9, 100], w: -120, w2: 110, by: i % 2 ? -1.5 : 0, lean: 22 }, 0.08); }),
  dash: [F({ fl: [64, 74], bl: [-56, 30], fa: [-34, 24], ba: [80, 40], lean: 36, by: 3.4, w: -116, w2: 120 }, 0.07), F({ fl: [40, 90], bl: [-40, 50], fa: [-30, 24], ba: [76, 40], lean: 38, by: 2.6, w: -112, w2: 120 }, 0.07)],
  chop: [F({ fa: [176, 24], ba: [130, 50], fl: [20, 14], bl: [-24, 12], lean: -8, by: 0.5, w: 206 }, 0.07), F({ fa: [72, -12], ba: [-20, 60], fl: [40, 22], bl: [-34, 8], lean: 22, bx: 2.5, by: 2.5, w: 52, mouth: 1 }, 0.06), F({ fa: [40, -4], ba: [-10, 60], fl: [42, 26], bl: [-34, 10], lean: 26, bx: 2.5, by: 3.4, w: 22 }, 0.3)],
  rise: [F({ fa: [10, 10], ba: [30, 60], fl: [36, 50], bl: [-30, 30], lean: 24, by: 4, w: -30 }, 0.07), F({ fa: [154, -12], ba: [-30, 40], fl: [18, 6], bl: [-28, 10], lean: -8, by: -1, bx: 1, w: 168, mouth: 1 }, 0.06), F({ fa: [140, -6], ba: [-20, 50], fl: [16, 6], bl: [-26, 10], lean: -6, w: 160 }, 0.3)],
  hslash: [F({ fa: [62, 118], ba: [40, 60], fl: [24, 18], bl: [-26, 14], lean: -4, by: 1.5, w: -100 }, 0.07), F({ fa: [96, -4], ba: [-40, 40], fl: [40, 12], bl: [-38, 8], lean: 18, bx: 2, by: 2, w: 94, mouth: 1 }, 0.06), F({ fa: [76, -30], ba: [-30, 40], fl: [40, 14], bl: [-36, 10], lean: 20, bx: 2, by: 2.2, w: 52 }, 0.3)],
  lunge: [F({ fa: [60, 60], ba: [70, 60], fl: [24, 24], bl: [-20, 16], lean: 0, bx: -2, w: 92 }, 0.07), F({ fa: [92, 0], ba: [-40, 30], fl: [56, 4], bl: [-50, 4], lean: 26, bx: 5, by: 2.6, w: 92, mouth: 1 }, 0.06), F({ fa: [88, 4], ba: [-36, 30], fl: [54, 6], bl: [-48, 4], lean: 24, bx: 5, by: 2.8, w: 90 }, 0.3)],
  aerial: [F({ fa: [164, 14], ba: [110, 30], fl: [70, 110], bl: [30, 110], lean: -10, w: 196 }, 0.08), F({ fa: [62, -20], ba: [-30, 40], fl: [70, 100], bl: [20, 90], lean: 30, w: 26, mouth: 1 }, 0.3)],
  tuck: [F({ fl: [112, 140], bl: [100, 144], fa: [60, 100], ba: [50, 100], lean: 40, by: 1, w: 150, w2: 150 }, 0.3)],
  parry: [F({ fa: [72, 62], ba: [60, 84], fl: [26, 24], bl: [-28, 20], lean: -4, by: 1.8, w: 168 }, 0.3)],
  block: [F({ fa: [164, 24], ba: [140, 40], fl: [26, 26], bl: [-28, 22], lean: -6, by: 2.2, w: 96 }, 0.3)],
  lock: [F({ fa: [86, 34], ba: [80, 46], fl: [44, 12], bl: [-44, 6], lean: 22, bx: 2, by: 1.5, w: 132, eye: 'hurt' }, 0.12), F({ fa: [86, 36], ba: [80, 48], fl: [44, 13], bl: [-44, 6], lean: 23, bx: 2.2, by: 1.7, w: 134, eye: 'hurt', mouth: 1 }, 0.12)],
  sweep: [F({ fl: [86, 0], bl: [70, 150], fa: [40, 60], ba: [-50, 40], lean: 34, by: 10, w: 120 }, 0.3)],
  kick2: [F({ fl: [60, 90], bl: [-8, 4], fa: [40, 90], ba: [-30, 60], lean: -6, w: 130 }, 0.05), F({ fl: [98, 0], bl: [-12, 2], fa: [30, 100], ba: [-50, 40], lean: -18, bx: -1, w: 140, mouth: 1 }, 0.3)],
  land: [F({ fl: [74, 124], bl: [-6, 112], fa: [-40, 30], ba: [86, 40], lean: 32, by: 8.5, w: -118 }, 0.3)],
  skid: [F({ fl: [34, 24], bl: [-40, 16], fa: [44, 60], ba: [-56, 30], lean: -14, by: 2.8, w: 70, eye: 'hurt' }, 0.3)],
  kneelB: [F({ fl: [86, 88], bl: [0, 92], by: 7.2, lean: 20, fa: [42, 18], ba: [30, 44], w: 4, tilt: 10, mouth: 1, eye: 'hurt' }, 0.35), F({ fl: [86, 88], bl: [0, 92], by: 7.6, lean: 23, fa: [42, 18], ba: [30, 44], w: 4, tilt: 12, mouth: 0, eye: 'hurt' }, 0.35)],
  pant: [F({ fa: [30, 20], ba: [20, 30], fl: [20, 18], bl: [-18, 14], lean: 16, by: 1.6, w: 30, mouth: 1 }, 0.3), F({ fa: [30, 20], ba: [20, 30], fl: [20, 18], bl: [-18, 14], lean: 19, by: 2.2, w: 28 }, 0.3)],
  sheathe: [F({ fa: [24, 96], ba: [20, 90], fl: [10, 4], bl: [-10, 4], lean: 2, w: -86 }, 0.3)],
  draw: [C1({ fa: [26, 112], ba: [-14, 40], fl: [44, 44], bl: [-42, 32], lean: 22, by: 4.4, w: 20, eye: 'closed' }, 0.6), C1({ fa: [26, 112], ba: [-14, 40], fl: [44, 44], bl: [-42, 32], lean: 22, by: 4.8, w: 20, eye: 'closed' }, 0.6)],
  heaven: [F({ fa: [172, 0], ba: [-40, 30], fl: [52, 24], bl: [-52, 10], lean: 4, by: 3, w: 180 }, 0.3)],
  after: [F({ fa: [60, -40], ba: [-30, 30], fl: [50, 30], bl: [-50, 14], lean: 30, by: 4, bx: 2, w: 20 }, 0.3)],
  hurtB: [F({ fa: [-30, 30], ba: [-60, 30], fl: [14, 24], bl: [-28, 18], lean: -24, tilt: -18, eye: 'hurt', mouth: 1, w: 30 }, 0.3)],
  grabA: [F({ fa: [82, 15], ba: [-20, 40], fl: [20, 8], bl: [-18, 6], lean: 6, w: 20 }, 0.3)],
  hoisted: [C1({ fa: [-20, 30], ba: [-40, 30], fl: [20, 40], bl: [-10, 30], lean: -6, tilt: 10, mouth: 1 }, 0.2), C1({ fa: [10, 40], ba: [-50, 30], fl: [40, 60], bl: [-20, 20], lean: -4, tilt: 6 }, 0.2)],
  fall2: [F({ fa: [150, 30], ba: [170, 20], fl: [10, 40], bl: [-30, 60], lean: -20, tilt: -20, eye: 'hurt', mouth: 1, w: 160 }, 0.2)],
  lie: [C1({ fa: [-100, 10], ba: [-70, 10], fl: [88, 4], bl: [82, 10], lean: -90, by: 13, bx: 4, tilt: -90, eye: 'closed', w: null, w2: null }, 1)],
  sitF: [C1({ fa: [60, 40], ba: [30, 70], fl: [88, 92], bl: [80, 95], lean: 4, by: 7.5, w: 120 }, 1)],
  rodcast: [F({ fa: [150, 10], ba: [-10, 20], fl: [24, 10], bl: [-20, 8], lean: -6, w: 160 }, 0.08), F({ fa: [84, -6], ba: [-10, 20], fl: [36, 10], bl: [-30, 8], lean: 16, bx: 1.5, w: 86 }, 0.3)],
  rodflick: [F({ fa: [100, 30], ba: [-10, 20], fl: [24, 14], bl: [-24, 10], lean: 4, w: 140 }, 0.06), F({ fa: [70, -20], ba: [-10, 20], fl: [30, 14], bl: [-28, 10], lean: 12, bx: 1, w: 50 }, 0.3)],
  rodguard: [F({ fa: [60, 50], ba: [-10, 20], fl: [24, 20], bl: [-22, 16], lean: 2, by: 1.2, w: 120 }, 0.5), F({ fa: [60, 51], ba: [-10, 20], fl: [24, 20], bl: [-22, 16], lean: 2, by: 1.5, w: 121 }, 0.5)],
  palmB: [F({ fa: [88, 10], ba: [-20, 30], fl: [10, 4], bl: [-10, 4], lean: 6, w: 20 }, 0.6)],
  climb: [F({ fa: [170, 10], ba: [120, 50], fl: [70, 90], bl: [-10, 30], lean: 10, w: null, calm: 1 }, 0.14), F({ fa: [120, 50], ba: [170, 10], fl: [-10, 30], bl: [70, 90], lean: 10, w: null, calm: 1 }, 0.14)],
  eat: [C1({ fa: [130, 140], ba: [20, 60], fl: [6, 0], bl: [-6, 0], lean: 0, tilt: -6, mouth: 1 }, 0.25), C1({ fa: [130, 130], ba: [20, 60], fl: [6, 0], bl: [-6, 0], lean: 0, tilt: -4 }, 0.25)],
  burn: [C1({ fa: [40, 80], ba: [50, 90], fl: [30, 40], bl: [-30, 30], lean: 24, by: 3, tilt: 14, eye: 'hurt', mouth: 1 }, 0.12), C1({ fa: [44, 84], ba: [54, 94], fl: [30, 42], bl: [-30, 32], lean: 27, by: 3.5, tilt: 18, eye: 'hurt', mouth: 1 }, 0.12)],
  meditate: [C1({ fa: [36, 70], ba: [30, 74], fl: [88, 150], bl: [80, 150], lean: 0, by: 9.5, eye: 'closed' }, 0.8), C1({ fa: [36, 70], ba: [30, 74], fl: [88, 150], bl: [80, 150], lean: 0, by: 9.8, eye: 'closed' }, 0.8)],
  hug: [C1({ fa: [80, 70], ba: [76, 76], fl: [14, 6], bl: [-14, 6], lean: 14, tilt: 8, eye: 'closed' }, 0.8)],
  cry: [C1({ fa: [120, 140], ba: [110, 140], fl: [6, 0], bl: [-6, 0], lean: 10, tilt: 14, eye: 'closed', mouth: 1 }, 0.25), C1({ fa: [118, 142], ba: [108, 140], fl: [6, 0], bl: [-6, 0], lean: 12, tilt: 16, eye: 'closed', by: 0.4 }, 0.25)],
});
for (const n of ['stance', 'pant', 'kneelB', 'rodguard', 'sitF', 'draw', 'meditate']) if (!ANIMS[n + '~']) ANIMS[n + '~'] = [ANIMS[n][0], { o: { ...ANIMS[n][0].o, mouth: 1 }, t: 0.13 }].map((f) => ({ o: f.o, t: 0.13 }));
ANIMS.idle = ANIMS.idle; ANIMS.guard = ANIMS.guard;
// talking: the same pose with the mouth opening and closing
for (const n of ['stand', 'hold', 'point', 'think', 'arms', 'shrug', 'salute', 'sit', 'kneel', 'idle', 'crouch', 'fish', 'startle', 'cuffed']) ANIMS[n + '~'] = [ANIMS[n][0], { o: { ...ANIMS[n][0].o, mouth: 1 }, t: 0.13 }].map((f) => ({ o: f.o, t: 0.13 }));
export const ANIM_NAMES = Object.keys(ANIMS);
export { Buf, flat };

// one frame of a look as a canvas
export function frameCanvas(L, anim, i) { const px = drawFrame(L, ANIMS[anim][i].o), c = document.createElement('canvas'); c.width = FW; c.height = FH; c.getContext('2d').putImageData(new ImageData(px, FW, FH), 0, 0); return c; }
// a single still (for menus): a square around the figure, at its own pixels
export function stillCanvas(L, anim = 'stand', i = 0) {
  const px = drawFrame(L, ANIMS[anim][i].o), c = document.createElement('canvas'); c.width = FW; c.height = FH; c.getContext('2d').putImageData(new ImageData(px, FW, FH), 0, 0);
  const n = 124, o = document.createElement('canvas'); o.width = o.height = n; o.getContext('2d').drawImage(c, OX - n / 2, OY + 6 - n, n, n, 0, 0, n, n); return o;
}
// a head-and-shoulders crop for dialogue
export function portrait(L) {
  const px = drawFrame(L, ANIMS.stand[0].o), hc = lastHead, c = document.createElement('canvas'); c.width = FW; c.height = FH; c.getContext('2d').putImageData(new ImageData(px, FW, FH), 0, 0);
  const w = 52, h = 48, o = document.createElement('canvas'); o.width = w; o.height = h;
  o.getContext('2d').drawImage(c, Math.round(hc[0] - 26), Math.round(hc[1] - 40), w, h, 0, 0, w, h); return o;
}
