// 从第四章 workflow 输出抽出 4 场，配背景/立绘/色板，生成 game/story/chapter4.js
const fs = require('fs');
const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/w92od9zof.output';
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const by = {};
d.result.scenes.forEach((s) => { by[s.id] = s; });

const OVR = {
  ch4_tang:    { bg: 'home', palette: 'night', cast: { sprite: 'tangkexin', x: 188, y: 16 }, next: 'ch4_orlando' },
  ch4_orlando: { bg: 'home', palette: 'night', cast: null,                                   next: 'ch4_dafei' },
  ch4_dafei:   { bg: 'home', palette: 'night', cast: { sprite: 'dafei', x: 188, y: 16 },     next: 'ch4_laojin' },
  ch4_laojin:  { bg: 'home', palette: 'night', cast: null,                                   next: '' },
};

function emit(id) {
  const o = OVR[id];
  const script = by[id].script;
  const last = script[script.length - 1];
  if (last && !last.end && !last.choice && last.goto === undefined) last.end = true; // 末步靠 scene.next 过场
  const scene = { id, bg: o.bg, palette: o.palette, cast: o.cast, next: o.next, script };
  return `export const ${id} = ${JSON.stringify(scene, null, 2)};\n`;
}

let out = '// 第二季 · 第四章「灭却师与狗」4 场（唐可欣夜闯+取信 / 奥兰多觉醒话痨 / 大飞登场+身世反转 / 老金登场+集结引向随缘楼）—— workflow 定稿，node 抽取生成。\n\n';
out += emit('ch4_tang') + '\n' + emit('ch4_orlando') + '\n' + emit('ch4_dafei') + '\n' + emit('ch4_laojin');
fs.writeFileSync('/Users/dawei/tegame/game/story/chapter4.js', out);
console.log('wrote chapter4.js:', d.result.scenes.map((s) => s.id).join(', '));
