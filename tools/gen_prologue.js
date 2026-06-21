// 从 workflow 输出里抽出定稿的三场脚本，配上背景/立绘/色板，生成 game/story/prologue_extra.js
const fs = require('fs');
const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/wgsebgg7o.output';
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const by = {};
d.result.scenes.forEach((s) => { by[s.id] = s; });

const OVR = {
  camera:   { bg: 'booth',   palette: 'night', cast: { sprite: 'xiaobaoan', x: 125, y: 34 }, next: 'tongtong' },
  tongtong: { bg: 'hallway', palette: 'day',   cast: { sprite: 'tongtong', x: 108, y: 50 },  next: 'email' },
  email:    { bg: 'home',    palette: 'night', cast: null,                                    next: 'proend' },
};

function emit(id) {
  const o = OVR[id];
  const scene = { id, bg: o.bg, palette: o.palette, cast: o.cast, next: o.next, script: by[id].script };
  return `export const ${id} = ${JSON.stringify(scene, null, 2)};\n`;
}

let out = '// 序章 3 场（监控真相 / 楼道童童 / 邮件揭示）—— workflow 起草+校验定稿，node 抽取生成。\n\n';
out += emit('camera') + '\n' + emit('tongtong') + '\n' + emit('email');
fs.writeFileSync('/Users/dawei/tegame/game/story/prologue_extra.js', out);
console.log('wrote prologue_extra.js:', d.result.scenes.map((s) => s.id).join(', '));
