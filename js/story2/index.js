// Book two, 斷崖刀心, in order. Every spoken line gets an id that names its recording (b2c<n>_<count>).
import ch0 from './ch0.js?v=4';
import ch1 from './ch1.js?v=4';
import ch2 from './ch2.js?v=4';
import ch3 from './ch3.js?v=4';
import ch4 from './ch4.js?v=4';
import ch5 from './ch5.js?v=4';
import ch6 from './ch6.js?v=4';
import ch7 from './ch7.js?v=4';
export const CHAPTERS = [ch0, ch1, ch2, ch3, ch4, ch5, ch6, ch7];
for (const ch of CHAPTERS) { let n = 0; for (const b of ch.beats) if (b.k === 'line') b.vid = ch.id + '_' + String(n++).padStart(3, '0'); }
