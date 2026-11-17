// The chapters in order.
import ch0 from './ch0.js?v=3';
import ch1 from './ch1.js?v=3';
import ch2 from './ch2.js?v=3';
import ch3 from './ch3.js?v=3';
import ch4 from './ch4.js?v=3';
import ch5 from './ch5.js?v=3';
import ch6 from './ch6.js?v=3';
export const CHAPTERS = [ch0, ch1, ch2, ch3, ch4, ch5, ch6];
// every spoken thing gets an id, which names its recording: lines by chapter and count, poems, move callouts, rebuttals
export function lineId(ch, n) { return ch.id + '_' + String(n).padStart(3, '0'); }
export function indexLines() {
  for (const ch of CHAPTERS) { let n = 0; for (const b of ch.beats) if (b.k === 'line') b.vid = lineId(ch, n++); }
}
indexLines();
