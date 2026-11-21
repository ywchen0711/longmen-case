// The two books of the novel. Each has its chapters, its own saved progress and its own title picture. Book one is
// read (lines wait for the reader, casebook, deductions); book two is watched (it plays itself like a film).
import { CHAPTERS as C1 } from './story/index.js?v=4';
import { CHAPTERS as C2 } from './story2/index.js?v=4';

export const BOOKS = [
  { id: 1, chapters: C1, save: 'longmenCase.v1', sub: ['聽雨樓密室', 'The Locked Room at Tingyu House'], tag: 'The Longmen Casebook · Book One',
    title: { set: 'exterior', music: 'title', cam: [{ x: 1, y: 2.6, z: -2, d: 26, yaw: -8, pitch: 10, fov: 30 }, { x: 1, y: 2.4, z: -2, d: 22, yaw: 8, pitch: 12, fov: 30 }] } },
  { id: 2, chapters: C2, save: 'longmenCase.b2.v1', watch: true, sub: ['斷崖刀心', 'The Blade Heart Beneath the Cliff'], tag: 'The Longmen Casebook · Book Two',
    title: { set: 'cliff', mood: 'sunset', music: 'story', cam: [{ x: 2, y: 3, z: -4, d: 30, yaw: -14, pitch: 6, fov: 30 }, { x: 2, y: 3, z: -4, d: 26, yaw: 6, pitch: 8, fov: 30 }] } },
];
