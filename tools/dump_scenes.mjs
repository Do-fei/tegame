// 把主线 13 场的 script 各自导出成 /tmp/enrich/<id>.json，供润色 workflow 的 agent 逐场读取。
import { SCENES } from '../game/story/index.js';
import { mkdirSync, writeFileSync } from 'node:fs';

const ORDER = ['office', 'booth', 'camera', 'tongtong', 'email', 'proend', 'bedroom', 'tunnel', 'classroom', 'ch2_class', 'ch2_yard', 'ch2_diner', 'ch2_guitongzi'];
mkdirSync('/tmp/enrich', { recursive: true });

for (const id of ORDER) {
  const s = SCENES[id];
  if (!s) { console.log('MISSING', id); continue; }
  writeFileSync(`/tmp/enrich/${id}.json`, JSON.stringify({ id, bg: s.bg, palette: s.palette, cast: s.cast, next: s.next, script: s.script }, null, 2));
  console.log(`${id.padEnd(14)} bg=${(s.bg || '').padEnd(10)} palette=${(s.palette || '').padEnd(6)} steps=${String(s.script.length).padStart(2)}  next=${s.next || '(空)'}`);
}
