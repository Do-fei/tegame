// 从第二章 workflow 输出抽出定稿四场，配背景/立绘/色板，生成 game/story/chapter2.js
const fs = require('fs');
const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/whravsju8.output';
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const by = {};
d.result.scenes.forEach((s) => { by[s.id] = s; });

const OVR = {
  ch2_class:     { bg: 'classroom',  palette: 'day', cast: { sprite: 'dongxiaoli', x: 196, y: 20 }, next: 'ch2_yard' },
  ch2_yard:      { bg: 'playground', palette: 'day', cast: null,                                    next: 'ch2_diner' },
  ch2_diner:     { bg: 'cafe',       palette: 'day', cast: { sprite: 'dongxiaoli', x: 196, y: 16 }, next: 'ch2_guitongzi' },
  ch2_guitongzi: { bg: 'cafe',       palette: 'day', cast: { sprite: 'guitongzi', x: 24, y: 40 },   next: '' },
};

// 选择标题网页里只画一行（≤19 字），过长会被截断。这里把超长的选择标题替换成精简版。
const PATCH = {
  '杯壁上的水珠正一颗颗往下淌。她刚说过的话，还在录音里转。': '杯壁的水珠一颗颗往下淌……',
  '董晓丽脸都白了，一把抓起桌上的 MP3——': '董晓丽脸都白了，抓起 MP3——',
};

function emit(id) {
  const o = OVR[id];
  let json = JSON.stringify(by[id].script);
  for (const [from, to] of Object.entries(PATCH)) json = json.split(from).join(to);
  const scene = { id, bg: o.bg, palette: o.palette, cast: o.cast, next: o.next, script: JSON.parse(json) };
  return `export const ${id} = ${JSON.stringify(scene, null, 2)};\n`;
}

let out = '// 第二章「往生道的她」4 场（教室真相 / 无声课间操逃出 / 热点讲规则+奶茶 Bad End / 鬼童子来袭）—— workflow 定稿，node 抽取生成。\n\n';
out += emit('ch2_class') + '\n' + emit('ch2_yard') + '\n' + emit('ch2_diner') + '\n' + emit('ch2_guitongzi');
fs.writeFileSync('/Users/dawei/tegame/game/story/chapter2.js', out);
console.log('wrote chapter2.js:', d.result.scenes.map((s) => s.id).join(', '));
