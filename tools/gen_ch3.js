// 从第三章 workflow 输出抽出定稿四场，配背景/立绘/色板，生成 game/story/chapter3.js
const fs = require('fs');
const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/wncgrhh1i.output';
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const by = {};
d.result.scenes.forEach((s) => { by[s.id] = s; });

const OVR = {
  ch3_outing:   { bg: 'wild',     palette: 'day', cast: { sprite: 'dongxiaoli', x: 196, y: 16 }, next: 'ch3_bus' },
  ch3_bus:      { bg: 'bus',      palette: 'day', cast: { sprite: 'dongxiaoli', x: 196, y: 16 }, next: 'ch3_crash' },
  ch3_crash:    { bg: 'road',     palette: 'day', cast: { sprite: 'dongxiaoli', x: 196, y: 16 }, next: 'ch3_hospital' },
  ch3_hospital: { bg: 'hospital', palette: 'day', cast: null,                                    next: '' },
};

function emit(id) {
  const o = OVR[id];
  const scene = { id, bg: o.bg, palette: o.palette, cast: o.cast, next: o.next, script: by[id].script };
  return `export const ${id} = ${JSON.stringify(scene, null, 2)};\n`;
}

let out = '// 第三章「大巴上的复仇」4 场（郊野野炊 / 回程大巴催眠司机+复仇抉择 / 盘山翻车 / 现世医院809）—— workflow 定稿，node 抽取生成。\n\n';
out += emit('ch3_outing') + '\n' + emit('ch3_bus') + '\n' + emit('ch3_crash') + '\n' + emit('ch3_hospital');
fs.writeFileSync('/Users/dawei/tegame/game/story/chapter3.js', out);
console.log('wrote chapter3.js:', d.result.scenes.map((s) => s.id).join(', '));
