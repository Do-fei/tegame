// 从反转一 workflow 输出抽出 3 场，配背景/立绘/色板，生成 game/story/rev1.js
const fs = require('fs');
const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/w965wcc2b.output';
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const by = {};
d.result.scenes.forEach((s) => { by[s.id] = s; });

const OVR = {
  rev1_photo:  { bg: 'home', palette: 'day',   cast: null,                                       next: 'rev1_truth' },
  rev1_truth:  { bg: 'home', palette: 'night', cast: null,                                       next: 'rev1_return' },
  rev1_return: { bg: 'home', palette: 'night', cast: { sprite: 'gaoxiaoyuan', x: 188, y: 16 },   next: '' },
};

function emit(id) {
  const o = OVR[id];
  const script = by[id].script;
  // 兜底：校验 agent 误删了末步 end:true。本引擎 end:true + scene.next 才是过场方式，缺了末步会越界崩溃。
  const last = script[script.length - 1];
  if (last && !last.end && !last.choice && last.goto === undefined) last.end = true;
  const scene = { id, bg: o.bg, palette: o.palette, cast: o.cast, next: o.next, script };
  return `export const ${id} = ${JSON.stringify(scene, null, 2)};\n`;
}

let out = '// ★ 反转一 · 照片真相（第一季大结局）3 场：母亲合照揭底+记忆崩解+署名重写 / 黑暗真相 / 高晓媛灵魂归来+49天+誓言。workflow 定稿，node 抽取生成。\n\n';
out += emit('rev1_photo') + '\n' + emit('rev1_truth') + '\n' + emit('rev1_return');
fs.writeFileSync('/Users/dawei/tegame/game/story/rev1.js', out);
console.log('wrote rev1.js:', d.result.scenes.map((s) => s.id).join(', '));
