// 整合"舞台加厚"落地稿：逐场比对结构步骤(一致才采用)，保留场景级 bg/palette/cast/next，
// 写回各 story 文件。新增的 per-step bg/palette/cast 覆盖会随 script 一起写入。
import { SCENES } from '../game/story/index.js';
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/wu1ojokqf.output';
const data = JSON.parse(readFileSync(OUT, 'utf8'));
const staged = {};
(data.result.scenes || []).forEach((s) => { if (s && s.id && Array.isArray(s.script)) staged[s.id] = s.script; });

// 结构步骤 = 带 id/goto/choice/options/flag/end/gameover/note 的步骤；bg/palette/cast 是非结构覆盖，不参与比对
const isStruct = (st) => ['id', 'goto', 'choice', 'options', 'end', 'gameover', 'note'].some((k) => st[k] !== undefined);
const STRUCT = (st) => ({ id: st.id, goto: st.goto, choice: st.choice, options: st.options, flag: st.flag, end: st.end, gameover: st.gameover, note: st.note });
const structSeq = (script) => script.filter(isStruct).map((st) => JSON.stringify(STRUCT(st)));
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

const FILES = {
  '../game/story/prologue.js': { hd: '// 序章前段：office / booth / proend', ids: ['office', 'booth', 'proend'] },
  '../game/story/prologue_extra.js': { hd: '// 序章后段：camera / tongtong / email', ids: ['camera', 'tongtong', 'email'] },
  '../game/story/chapter1.js': { hd: '// 第一章「墙上的她」：bedroom / tunnel / classroom', ids: ['bedroom', 'tunnel', 'classroom'] },
  '../game/story/chapter2.js': { hd: '// 第二章「往生道的她」：ch2_class / ch2_yard / ch2_diner / ch2_guitongzi', ids: ['ch2_class', 'ch2_yard', 'ch2_diner', 'ch2_guitongzi'] },
};

let ok = 0, skip = 0; const report = [];
for (const [rel, info] of Object.entries(FILES)) {
  let out = `${info.hd} —— 舞台加厚已落地（换景/走位/立绘登场/色板/演出拍；结构经程序校验未改动，node 生成）。\n\n`;
  for (const id of info.ids) {
    const base = SCENES[id];
    let script = base.script;
    if (staged[id]) {
      if (same(structSeq(base.script), structSeq(staged[id]))) {
        script = staged[id]; ok++;
        const overrides = staged[id].filter((st) => 'bg' in st || 'palette' in st || 'cast' in st).length;
        report.push(`${id.padEnd(14)} 落地 ${String(base.script.length).padStart(2)}→${String(staged[id].length).padStart(2)} 步，含 ${overrides} 处换景/立绘 ✓`);
      } else { skip++; report.push(`${id.padEnd(14)} 结构不一致，保留原稿 ✗`); }
    } else { report.push(`${id.padEnd(14)} 无落地稿，保留原稿`); }
    const scene = { id, bg: base.bg, palette: base.palette, cast: base.cast, next: base.next, script };
    out += `export const ${id} = ${JSON.stringify(scene, null, 2)};\n\n`;
  }
  writeFileSync(new URL(rel, import.meta.url), out);
}
console.log(report.join('\n'));
console.log(`\n落地生效 ${ok} 场，跳过 ${skip} 场`);
