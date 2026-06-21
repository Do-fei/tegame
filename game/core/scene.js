// 多场景引擎：管理"当前场景 + 当前步"，处理对白/选择/便签、场景间过渡、存档。
import { SCENES, START } from '../story/index.js';

const SAVE_KEY = 'r17_save';

const CLOSERS = '。，、！？；：…）】」』.,!?:;';
export function wrap(text, n) {
  if (text == null) return ['']; // 防御：步骤没 text（如裸 end 步）也不崩渲染
  const out = [];
  let line = '';
  for (const ch of text) {
    if (ch === '\n') { out.push(line); line = ''; continue; }
    // 行已满才换行；但收尾标点跟着上一行走，不单独掉到下一行
    if ([...line].length >= n && !CLOSERS.includes(ch)) { out.push(line); line = ''; }
    line += ch;
  }
  if (line) out.push(line);
  return out;
}

export class Game {
  constructor() {
    this.flags = {};
    this.notes = [];
    this.done = false;
    this.history = []; // 步进快照栈，支持"返回上一页"
    this.rwIdx = 0;    // 署名重写演出：当前翻到第几张便签
    this.goto(START); // 本版从头开始；存档已写入，"继续"入口留作后续
  }

  goto(id) {
    this.sceneId = id;
    this.scene = SCENES[id];
    this.i = 0;
    this.sel = 0;
    this.done = false;
    this.save();
  }
  cur() { return this.scene.script[this.i]; }
  _idx(label) { return this.scene.script.findIndex((s) => s.id === label); }
  isChoice() { return !!this.cur().choice; }
  moveSel(d) {
    if (!this.isChoice()) return;
    const n = this.cur().options.length;
    this.sel = (this.sel + d + n) % n;
  }
  choose() {
    if (!this.isChoice()) return;
    this._push();
    const o = this.cur().options[this.sel];
    if (o.flag) this.flags[o.flag] = true;
    this.sel = 0;
    if (o.goto) { const j = this._idx(o.goto); this.i = j >= 0 ? j : this.i + 1; }
    else this.i++;
    this.save();
  }
  // 推进前把当前状态压栈；back() 时整体还原（含跨场景、flags、便签）
  _push() {
    this.history.push({ sceneId: this.sceneId, i: this.i, sel: this.sel, flags: { ...this.flags }, notesLen: this.notes.length, rwIdx: this.rwIdx });
    if (this.history.length > 400) this.history.shift();
  }
  back() {
    const h = this.history.pop();
    if (!h) return false;
    this.sceneId = h.sceneId;
    this.scene = SCENES[h.sceneId];
    this.i = h.i;
    this.sel = h.sel;
    this.flags = h.flags;
    this.notes.length = h.notesLen;
    this.rwIdx = h.rwIdx || 0;
    this.done = false;
    this.save();
    return true;
  }
  advance() {
    const c = this.cur();
    if (c.choice) return;
    if (c.rewrite) { // 署名重写演出：逐张翻便签，最后一张后永久改写署名并离开本步
      this._push();
      const n = this.notes.length;
      if (n === 0 || this.rwIdx >= n - 1) {
        this.notes = this.notes.map((nt) => ({ ...nt, sig: '高晓媛' }));
        this.rwIdx = 0;
        if (c.goto) { const j = this._idx(c.goto); this.i = j >= 0 ? j : this.i + 1; } else this.i++;
      } else { this.rwIdx++; }
      this.save();
      return;
    }
    this._push();
    if (c.note) this.notes.push(c.note);
    if (c.end) { this._endScene(c); return; }
    if (c.goto) { const j = this._idx(c.goto); this.i = j >= 0 ? j : this.i + 1; }
    else this.i++;
    this.save();
  }
  _endScene(c) {
    if (c.gameover) { this.done = true; return; } // Bad End：到此为止，不接下一场
    const nx = c.next || this.scene.next;
    if (nx && SCENES[nx]) this.goto(nx);
    else this.done = true;
  }
  save() {
    try {
      if (typeof localStorage !== 'undefined')
        localStorage.setItem(SAVE_KEY, JSON.stringify({ sceneId: this.sceneId, i: this.i, flags: this.flags, notes: this.notes }));
    } catch (e) { /* 终端无 localStorage，忽略 */ }
  }
}

export function getView(g) {
  const s = g.scene;
  // 场景内换景：从开头扫到当前步，取最近一次 bg/palette/cast 覆盖（cast:null 可清空立绘）。
  // 派生自步序，所以 back() 回退后画面也自动跟着回退。
  let bg = s.bg, palette = s.palette, cast = s.cast;
  const last = Math.min(g.i, s.script.length - 1);
  for (let k = 0; k <= last; k++) {
    const st = s.script[k];
    if ('bg' in st) bg = st.bg;
    if ('palette' in st) palette = st.palette;
    if ('cast' in st) cast = st.cast;
  }
  const base = { bg, palette, cast };
  const c = g.cur();
  if (c.choice) return { ...base, mode: 'choice', title: c.choice, options: c.options, sel: g.sel };
  if (c.rewrite) { // 署名重写：当前翻到的便签 + 旧/新署名
    const notes = g.notes || [];
    const idx = Math.min(g.rwIdx, Math.max(0, notes.length - 1));
    return { ...base, mode: 'rewrite', note: notes[idx] || null, oldSig: '董晓丽', newSig: '高晓媛', idx, total: notes.length };
  }
  if (c.note) return { ...base, mode: 'note', note: c.note };
  return { ...base, mode: 'say', name: c.say, text: c.text, end: !!c.end };
}
