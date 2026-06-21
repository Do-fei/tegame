// 从回忆闪回 workflow 输出抽出 3 场，配背景/立绘/色板，生成 game/story/memories.js
const fs = require('fs');
const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/w9eebhg0b.output';
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const by = {};
d.result.scenes.forEach((s) => { by[s.id] = s; });

const OVR = {
  mem_milkshake: { bg: 'cafe',  palette: 'day', cast: { sprite: 'dongxiaoli', x: 196, y: 16 }, next: 'mem_fight' },
  mem_fight:     { bg: 'blank', palette: 'day', cast: null,                                    next: 'mem_birthday' },
  mem_birthday:  { bg: 'home',  palette: 'day', cast: { sprite: 'dongxiaoli', x: 196, y: 16 }, next: '' },
};

// agent 误把舞台提示写成引擎不认的 bgSuggest/castSuggest（噪音）——剥掉，只留引擎认的字段
function clean(step) { const { bgSuggest, castSuggest, ...rest } = step; return rest; }

function emit(id) {
  const o = OVR[id];
  const scene = { id, bg: o.bg, palette: o.palette, cast: o.cast, next: o.next, script: by[id].script.map(clean) };
  return `export const ${id} = ${JSON.stringify(scene, null, 2)};\n`;
}

let out = '// 反转一前 · 回忆闪回 3 场（共享奶昔被掐 / 玻璃瓶救场 / 17岁生日家宴）—— 每场撕一张署名「董晓丽」的薄荷便签，作反转一署名重写的弹药。workflow 定稿，node 抽取生成。\n\n';
out += emit('mem_milkshake') + '\n' + emit('mem_fight') + '\n' + emit('mem_birthday');
fs.writeFileSync('/Users/dawei/tegame/game/story/memories.js', out);
console.log('wrote memories.js:', d.result.scenes.map((s) => s.id).join(', '));
