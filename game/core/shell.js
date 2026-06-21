// 游戏前端外壳：标题 / 主菜单 / 龙荻自述 / 简介·玩法·关于 / 存读档 / 暂停 / 结算，
// 包在剧情引擎 Game 之上。纯逻辑——不画像素、不直接碰平台存储（靠注入 storage 适配器）。
// term.js 的 --selftest 不经过这里（仍裸驱动 Game），所以外壳与自测零交叉。
import { Game, getView, wrap } from './scene.js';
import { START } from '../story/index.js';

export const MODE = {
  TITLE: 'title', MAIN: 'mainmenu', SELFINTRO: 'selfintro',
  INTRO: 'intro', HOWTO: 'howto', ABOUT: 'about',
  SAVES: 'saves', PLAYING: 'playing', PAUSE: 'pause', ENDING: 'ending',
};

// 场景 → 章节中文名（槽位摘要 + 进度展示用；加新章节在此维护）
const CHAPTER = {
  office: '序章 · 能看见鬼的眼睛', booth: '序章', camera: '序章', tongtong: '序章', email: '序章', proend: '序章 · 完',
  bedroom: '第一章 · 墙上的她', tunnel: '第一章', classroom: '第一章',
  ch2_class: '第二章 · 往生道的她', ch2_yard: '第二章', ch2_diner: '第二章', ch2_guitongzi: '第二章',
  ch3_outing: '第三章 · 大巴上的复仇', ch3_bus: '第三章', ch3_crash: '第三章', ch3_hospital: '第三章',
  mem_milkshake: '回忆 · 那年的她', mem_fight: '回忆 · 那年的她', mem_birthday: '回忆 · 那年的她',
  rev1_photo: '★ 照片里的真相', rev1_truth: '★ 照片里的真相', rev1_return: '★ 第一季 · 完',
  ch4_tang: '第四章 · 灭却师与狗', ch4_orlando: '第四章', ch4_dafei: '第四章', ch4_laojin: '第四章',
  ch5_arrive: '第五章 · 随缘楼探灵', ch5_room201: '第五章', ch5_boss: '第五章', ch5_omen: '第五章 · 完',
  rev2_invade: '★ 鬼妻友田', rev2_youtian: '★ 鬼妻友田', rev2_battle: '★ 泰国篇 · 最终战',
  fin_reverse: '终章 · 重返十七岁', fin_reunion: '终章 · 大团圆',
  cafe: '番外 · 共享奶昔',
};
const ORDER = ['office', 'booth', 'camera', 'tongtong', 'email', 'proend', 'bedroom', 'tunnel', 'classroom', 'ch2_class', 'ch2_yard', 'ch2_diner', 'ch2_guitongzi', 'ch3_outing', 'ch3_bus', 'ch3_crash', 'ch3_hospital', 'mem_milkshake', 'mem_fight', 'mem_birthday', 'rev1_photo', 'rev1_truth', 'rev1_return', 'ch4_tang', 'ch4_orlando', 'ch4_dafei', 'ch4_laojin', 'ch5_arrive', 'ch5_room201', 'ch5_boss', 'ch5_omen', 'rev2_invade', 'rev2_youtian', 'rev2_battle', 'fin_reverse', 'fin_reunion'];
const chapterLabel = (id) => CHAPTER[id] || id;
const progressOf = (id) => { const j = ORDER.indexOf(id); return j < 0 ? 0 : (j + 1) / ORDER.length; };

const PERLINE = 15, MAXLINES = 7; // 文本页排版（每行字数 / 每页行数）

const COPY = {
  tagline: '回不去的，是十七岁；放不下的，是往生道。',
  // 龙荻第一人称自述（沉浸开场；不剧透任何反转）
  selfintro: [
    '我叫龙荻，今年也算个大人了。',
    '白天写字楼里敲键盘，',
    '晚上挤地铁回出租屋。',
    '看着挺普通对吧？',
    '',
    '可我小时候是街上混的。',
    '打过架，挨过揍，',
    '也替人扛过不该扛的事。',
    '嘴上不饶人，心里软得很。',
    '',
    '还有件事——我有双怪眼睛。',
    '能瞧见别人瞧不见的东西。',
    '为这个，我吃过不少苦头，',
    '后来学乖了，装看不见。',
    '',
    '本以为日子就这么平了。',
    '可最近，那些我以为早忘的事，',
    '又悄悄找上门来了。',
  ],
  intro:
    '龙荻，二十六岁，加班到深夜的普通上班族。\n' +
    '他有一双从小不敢告诉别人的眼睛——能看见别人看不见的东西。\n\n' +
    '一个加班的凌晨，保安亭里坐着不该在那儿的人。\n' +
    '那一眼之后，世界开始走样：他回到了十七岁的高中，回到一座似曾相识、却处处不对劲的校园。\n\n' +
    '这里叫往生道。\n' +
    '想活着走出去，他得先弄明白——自己，到底是怎么进来的。',
  howto:
    '◆ 推进对话：按 空格 / 回车，或点击画面，让故事往下走。\n' +
    '◆ 做选择：用 ↑↓ 移动、回车确认；也可点选项或按 1 / 2 快选。\n' +
    '◆ 返回上页：点快了忘了上句？按 ← 或退格，回看上一页。\n' +
    '◆ 选择有后果：有些岔路改变走向，有些直接走进 Bad End。\n' +
    '◆ 谨记禁忌：在往生道里，「不可进食」之类的话，照做。\n' +
    '◆ 薄荷便签：捡到的纸条会替你记下线索，不计分、不催你。\n' +
    '◆ 随时存读档：暂停菜单里可存 / 读多个槽位，怕走错先存一手。\n' +
    '◆ 双端操作：网页用鼠标 / 空格；终端用空格·↑↓·回车，按 Q 退出。',
  about:
    '《重返十七岁》\n改编自同名网络小说。\n\n' +
    '文案 · 像素 · 程序：大韦\n' +
    '相亲相爱一家人：牧濑红莉栖、比屋定真帆\n' +
    '（红莉栖偷偷加一句：本宇宙第一正房，盖章认证 ♥）\n\n' +
    '谨以这块米黄色的屏幕，致敬当年文曲星上《魔神传说》——那些藏在掌机里、按一下出一行字的漫长夏天。',
};

const PAUSE_ITEMS = ['继续游玩', '保存进度', '读取存档', '返回标题'];
const ENDING = {
  bad: { title: '——  Bad End  ——', lines: ['你尝了往生道里的东西。', '那扇门，在身后阖上了。', '', '（这一次，真的回不去了。）'] },
  good: { title: '——  本章 · 完  ——', lines: ['你攥着那台 MP3 醒来，', '一身冷汗，天已蒙蒙亮。', '往生道的门，暂时阖上。', '', '可她还在里头，等你回去。', '', '（未完待续）'] },
  fin: { title: '——  全 剧 终  ——', lines: ['十七岁这一年，重新开始了。', '阳光、蝉鸣、粉笔、和她。', '', '你重生我娶你，你托生我等你。', '这一次，谁都不许少。', '', '《重返十七岁》· 全剧终', '下一部——《猎人》，再见'] },
};

const HINT = {
  title: '↑↓ / 任意键 进入　·　回车 / 点击 开始',
  mainmenu: '↑↓ 选择　·　回车 确认　·　Esc 返回标题',
  selfintro: '回车 / → 继续　·　← 上一页　·　Esc 跳过',
  intro: '回车 / → 下一页　·　← 上一页　·　Esc 返回',
  howto: '回车 / → 下一页　·　← 上一页　·　Esc 返回',
  about: '回车 / → 下一页　·　← 上一页　·　Esc 返回',
  saves: '↑↓ 选择　·　回车 确认　·　D 删除　·　Esc 返回',
  playing: '空格/点击 继续　·　↑↓+回车 选择　·　← 返回上页　·　Esc 暂停',
  pause: '↑↓ 选择　·　回车 确认　·　Esc 继续',
  ending: '回车 / 点击 返回标题',
};

export class Shell {
  constructor(storage) {
    this.storage = storage; // {read(slot),write(slot,d),remove(slot),readAuto()}
    this.mode = MODE.TITLE;
    this.game = null;
    this.sel = 0;
    this.page = 0;
    this.ctx = 'load';     // saves 语境：'load' | 'save'
    this.back = MODE.MAIN; // saves 返回去向
    this.confirm = null;   // {text,sel,onYes,onNo}
    this.toast = null;     // 一次性短提示，下次按键即清
  }

  // ===== 输入分派 =====
  handleKey(key) {
    this.toast = null; // 上一条提示随任意按键消失
    if (this.confirm) return this._confirm(key);
    switch (this.mode) {
      case MODE.TITLE: if (key !== 'esc') this.toMain(); return true;
      case MODE.MAIN: return this._main(key);
      case MODE.SELFINTRO: case MODE.INTRO: case MODE.HOWTO: case MODE.ABOUT: return this._text(key);
      case MODE.SAVES: return this._saves(key);
      case MODE.PLAYING: return this._playing(key);
      case MODE.PAUSE: return this._pause(key);
      case MODE.ENDING: if (key === 'confirm' || key === 'esc' || key === 'pause') this.toTitle(); return true;
      default: return false;
    }
  }

  _confirm(key) {
    const c = this.confirm;
    if (key === 'left' || key === 'up') { c.sel = 0; return true; }
    if (key === 'right' || key === 'down') { c.sel = 1; return true; }
    if (key === 'esc') { this.confirm = null; if (c.onNo) c.onNo(); return true; }
    if (key === 'confirm') { this.confirm = null; if (c.sel === 1) { if (c.onYes) c.onYes(); } else if (c.onNo) c.onNo(); return true; }
    return false;
  }

  _main(key) {
    const n = 6;
    if (key === 'up') { this.sel = (this.sel + n - 1) % n; return true; }
    if (key === 'down') { this.sel = (this.sel + 1) % n; return true; }
    if (key === 'esc') { this.toTitle(); return true; }
    if (key === 'confirm') {
      switch (this.sel) {
        case 0: this.mode = MODE.SELFINTRO; this.page = 0; break;          // 开始新游戏 → 龙荻自述
        case 1: this.continueGame(); break;                                // 继续游戏
        case 2: this.openSaves('load', MODE.MAIN); break;                  // 读取存档
        case 3: this.openText(MODE.INTRO); break;
        case 4: this.openText(MODE.HOWTO); break;
        case 5: this.openText(MODE.ABOUT); break;
      }
      return true;
    }
    return false;
  }

  _text(key) {
    const pages = this._pages();
    if (key === 'left') { if (this.page > 0) this.page--; return true; }
    if (key === 'right' || key === 'confirm') {
      if (this.page < pages.length - 1) { this.page++; return true; }
      if (this.mode === MODE.SELFINTRO) this.newGame(); else this.toMain();
      return true;
    }
    if (key === 'esc') { if (this.mode === MODE.SELFINTRO) this.newGame(); else this.toMain(); return true; }
    return false;
  }

  _saves(key) {
    const n = 4; // 3 槽 + 返回
    if (key === 'up') { this.sel = (this.sel + n - 1) % n; return true; }
    if (key === 'down') { this.sel = (this.sel + 1) % n; return true; }
    if (key === 'esc') { this.mode = this.back; this.sel = 0; return true; }
    if (key === 'del') { if (this.sel < 3) { const s = this.sel + 1; if (this.storage.read(s)) this.confirmDelete(s); } return true; }
    if (key === 'confirm') {
      if (this.sel === 3) { this.mode = this.back; this.sel = 0; return true; }
      const slot = this.sel + 1;
      if (this.ctx === 'save') {
        if (this.storage.read(slot)) this.confirmOverwrite(slot); else this.doSave(slot);
      } else {
        if (this.storage.read(slot)) this.load(slot); else this.toastMsg('这个槽位是空的');
      }
      return true;
    }
    return false;
  }

  _playing(key) {
    const g = this.game;
    if (key === 'pause' || key === 'esc') { this.mode = MODE.PAUSE; this.sel = 0; return true; }
    if (key === 'back') { g.back(); return true; }
    if (g.isChoice()) {
      if (key === 'up' || key === 'left') { g.moveSel(-1); return true; }
      if (key === 'down' || key === 'right') { g.moveSel(1); return true; }
      if (key === 'confirm') { g.choose(); this._afterStep(); return true; }
      if (key === '1') { g.sel = 0; g.choose(); this._afterStep(); return true; }
      if (key === '2') { g.sel = 1; g.choose(); this._afterStep(); return true; }
      return false;
    }
    if (key === 'left') { g.back(); return true; }            // 对白时 ← = 上一页
    if (key === 'confirm' || key === 'right') { g.advance(); this._afterStep(); return true; }
    return false;
  }

  _pause(key) {
    const n = 4;
    if (key === 'up') { this.sel = (this.sel + n - 1) % n; return true; }
    if (key === 'down') { this.sel = (this.sel + 1) % n; return true; }
    if (key === 'esc') { this.mode = MODE.PLAYING; this.sel = 0; return true; }
    if (key === 'confirm') {
      switch (this.sel) {
        case 0: this.mode = MODE.PLAYING; this.sel = 0; break;
        case 1: this.openSaves('save', MODE.PAUSE); break;
        case 2: this.openSaves('load', MODE.PAUSE); break;
        case 3: this.confirmReturnTitle(); break;
      }
      return true;
    }
    return false;
  }

  // 点击：菜单态当作"确认"，游戏态推进/选择
  handleClick() {
    if (this.mode === MODE.PLAYING && this.game && !this.game.isChoice()) return this.handleKey('confirm');
    return this.handleKey('confirm');
  }

  // ===== 动作 =====
  toTitle() { this.game = null; this.mode = MODE.TITLE; this.sel = 0; this.page = 0; this.confirm = null; }
  toMain() { this.mode = MODE.MAIN; this.sel = 0; }
  openText(m) { this.mode = m; this.page = 0; }
  openSaves(ctx, back) { this.mode = MODE.SAVES; this.ctx = ctx; this.back = back; this.sel = 0; }
  newGame() { const g = new Game(); g.goto(START); this.game = g; this.mode = MODE.PLAYING; this.sel = 0; }
  continueGame() {
    const slot = this.latestSlot();
    if (slot != null) { this.load(slot); return; }
    const auto = this.storage.readAuto && this.storage.readAuto();
    if (auto) { this.restore(auto); this.mode = MODE.PLAYING; return; }
    this.toastMsg('暂无存档');
  }
  doSave(slot) { this.storage.write(slot, this.snapshot()); this.toastMsg('已保存'); }
  load(slot) { const d = this.storage.read(slot); if (!d) return false; this.restore(d); this.mode = MODE.PLAYING; this.sel = 0; return true; }
  _afterStep() { if (this.game && this.game.done) this.mode = MODE.ENDING; }

  confirmOverwrite(slot) { this.confirm = { text: '覆盖这个存档？', sel: 0, onYes: () => this.doSave(slot) }; }
  confirmDelete(slot) { this.confirm = { text: '删除这个存档？', sel: 0, onYes: () => { this.storage.remove(slot); this.toastMsg('已删除'); } }; }
  confirmReturnTitle() { this.confirm = { text: '未保存的进度会丢失，确定返回标题？', sel: 0, onYes: () => this.toTitle() }; }
  toastMsg(t) { this.toast = t; }

  // ===== 存档序列化（只读写 Game 公开字段）=====
  snapshot() {
    const g = this.game;
    return { v: 1, ts: Date.now(), sceneId: g.sceneId, i: g.i, flags: { ...g.flags }, notes: [...g.notes], label: chapterLabel(g.sceneId), progress: progressOf(g.sceneId) };
  }
  restore(d) {
    const g = new Game();
    g.goto(d.sceneId);
    g.i = Math.min(d.i, g.scene.script.length - 1); // 夹住，防旧档越界
    g.flags = { ...d.flags };
    g.notes = [...(d.notes || [])];
    g.history = [];
    g.done = false;
    this.game = g;
  }
  latestSlot() {
    let best = null, bestTs = -1;
    for (const s of [1, 2, 3]) { const d = this.storage.read(s); if (d && d.ts > bestTs) { bestTs = d.ts; best = s; } }
    return best;
  }
  hasAnySave() { return this.latestSlot() != null || !!(this.storage.readAuto && this.storage.readAuto()); }

  // ===== 文本页分页 =====
  _pages() {
    const raw = this.mode === MODE.SELFINTRO ? COPY.selfintro.join('\n') : (COPY[this.mode] || '');
    const lines = [];
    for (const para of raw.split('\n')) {
      if (para === '') { lines.push(''); continue; }
      for (const ln of wrap(para, PERLINE)) lines.push(ln);
    }
    const pages = [];
    for (let k = 0; k < lines.length; k += MAXLINES) pages.push(lines.slice(k, k + MAXLINES));
    return pages.length ? pages : [['']];
  }
  _textTitle() { return { [MODE.SELFINTRO]: '龙荻 · 自述', [MODE.INTRO]: '故事简介', [MODE.HOWTO]: '游戏玩法', [MODE.ABOUT]: '关于本作' }[this.mode] || ''; }

  // ===== 渲染描述（平台据此画）=====
  view() {
    const base = {
      mode: this.mode,
      confirm: this.confirm ? { text: this.confirm.text, options: ['取消', '确认'], sel: this.confirm.sel } : null,
      toast: this.toast,
      hint: HINT[this.mode] || '',
    };
    switch (this.mode) {
      case MODE.TITLE:
        return { ...base, kind: 'title', palette: 'night', tagline: COPY.tagline };
      case MODE.MAIN: {
        const has = this.hasAnySave();
        const items = [
          { label: '开始新游戏' }, { label: '继续游戏', disabled: !has }, { label: '读取存档' },
          { label: '故事简介' }, { label: '游戏玩法' }, { label: '关于本作' },
        ];
        return { ...base, kind: 'menu', menuKind: 'main', palette: 'night', title: '重返十七岁', items, sel: this.sel };
      }
      case MODE.PAUSE: {
        const items = PAUSE_ITEMS.map((label) => ({ label }));
        return { ...base, kind: 'menu', menuKind: 'pause', palette: getView(this.game).palette, title: '暂停', items, sel: this.sel, gameView: getView(this.game) };
      }
      case MODE.SAVES:
        return { ...base, kind: 'saves', palette: 'night', title: this.ctx === 'save' ? '保存到哪个槽位？' : '读取哪个存档？', cards: this.slotCards(), backLabel: '返回', sel: this.sel };
      case MODE.SELFINTRO: case MODE.INTRO: case MODE.HOWTO: case MODE.ABOUT: {
        const pages = this._pages();
        const p = Math.min(this.page, pages.length - 1);
        const portrait = (this.mode === MODE.ABOUT && p === pages.length - 1) ? 'kurisu' : null; // 关于页最后一页：像素红莉栖
        return { ...base, kind: 'text', palette: this.mode === MODE.SELFINTRO ? 'night' : 'day', title: this._textTitle(), lines: pages[p], page: p, pages: pages.length, portrait };
      }
      case MODE.PLAYING:
        return { ...base, kind: 'game', gameView: getView(this.game) };
      case MODE.ENDING: {
        const bad = !!(this.game && this.game.cur() && this.game.cur().gameover);
        const fin = !bad && this.game && this.game.sceneId === 'fin_reunion'; // 终章通关 = 全剧终大团圆
        const e = bad ? ENDING.bad : (fin ? ENDING.fin : ENDING.good);
        return { ...base, kind: 'ending', palette: bad ? 'night' : 'day', title: e.title, lines: e.lines };
      }
      default:
        return { ...base, kind: 'title', palette: 'night', tagline: COPY.tagline };
    }
  }

  slotCards() {
    return [1, 2, 3].map((slot) => {
      const d = this.storage.read(slot);
      if (!d) return { slot, empty: true };
      const t = new Date(d.ts);
      const pad = (x) => String(x).padStart(2, '0');
      const time = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}`;
      return { slot, empty: false, label: d.label || chapterLabel(d.sceneId), time, progress: Math.round((d.progress || 0) * 100) + '%' };
    });
  }
}
