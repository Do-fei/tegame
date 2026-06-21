// 从第五章 workflow 输出抽出 4 场，配背景/立绘/色板，生成 game/story/chapter5.js
const fs = require('fs');
const OUT = '/private/tmp/claude-501/-Users-dawei-tegame/9a87ff89-d58b-48b4-9af9-17cc65bb21e3/tasks/whfrukf2i.output';
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
const by = {};
d.result.scenes.forEach((s) => { by[s.id] = s; });

const OVR = {
  ch5_arrive:  { bg: 'hallway', palette: 'night', cast: null,                                       next: 'ch5_room201' },
  ch5_room201: { bg: 'home',    palette: 'night', cast: { sprite: 'gaoxiaoyuan', x: 188, y: 16 },    next: 'ch5_boss' },
  ch5_boss:    { bg: 'blank',   palette: 'night', cast: null,                                        next: 'ch5_omen' },
  ch5_omen:    { bg: 'home',    palette: 'night', cast: { sprite: 'gaoxiaoyuan', x: 188, y: 16 },    next: '' },
};

function emit(id) {
  const o = OVR[id];
  const script = by[id].script;
  const last = script[script.length - 1];
  if (last && !last.end && !last.choice && last.goto === undefined) last.end = true; // 末步靠 scene.next 过场
  const scene = { id, bg: o.bg, palette: o.palette, cast: o.cast, next: o.next, script };
  return `export const ${id} = ${JSON.stringify(scene, null, 2)};\n`;
}

let out = '// 第二季 · 第五章「随缘楼探灵」4 场（夜探随缘楼 / 201室·高晓媛怨念溯源 / 红衣学姐BOSS·大飞契约收服 / 巫妖入侵预兆）—— workflow 定稿，node 抽取生成。\n\n';
out += emit('ch5_arrive') + '\n' + emit('ch5_room201') + '\n' + emit('ch5_boss') + '\n' + emit('ch5_omen');
fs.writeFileSync('/Users/dawei/tegame/game/story/chapter5.js', out);
console.log('wrote chapter5.js:', d.result.scenes.map((s) => s.id).join(', '));
