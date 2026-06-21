// 从第一章 workflow 输出抽出定稿三场，配背景/立绘/色板，生成 game/story/chapter1.js
const fs = require('fs');
const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/w7ec7337h.output';
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const by = {};
d.result.scenes.forEach((s) => { by[s.id] = s; });

const OVR = {
  bedroom:   { bg: 'home',      palette: 'night', cast: { sprite: 'lvyi', x: 132, y: 34 }, next: 'tunnel' },     // 绿衣女暂作干尸女鬼占位
  tunnel:    { bg: 'tunnel',    palette: 'night', cast: null,                              next: 'classroom' },
  classroom: { bg: 'classroom', palette: 'day',   cast: { sprite: 'dongxiaoli', x: 196, y: 20 }, next: '' },
};

function emit(id) {
  const o = OVR[id];
  const scene = { id, bg: o.bg, palette: o.palette, cast: o.cast, next: o.next, script: by[id].script };
  return `export const ${id} = ${JSON.stringify(scene, null, 2)};\n`;
}

let out = '// 第一章「墙上的她」3 场（卧室干尸女鬼 / 衣橱隧道 / 重返十七岁教室）—— workflow 定稿，node 抽取生成。\n';
out += '// 注：干尸女鬼暂用绿衣女(lvyi)立绘占位，待补专属立绘。\n\n';
out += emit('bedroom') + '\n' + emit('tunnel') + '\n' + emit('classroom');
fs.writeFileSync('/Users/dawei/tegame/game/story/chapter1.js', out);
console.log('wrote chapter1.js:', d.result.scenes.map((s) => s.id).join(', '));
