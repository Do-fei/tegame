#!/usr/bin/env node
// 终端入口：把像素帧缓冲用半块字符 + 真彩 ANSI 画到终端，文字用真字符叠加。
// 由 Shell 控制器统管标题 / 菜单 / 文本页 / 存读档 / 暂停 / 结算 / 正片。
// 自动适配：按玩家终端实际大小整数降采样（D 倍），普通窗口也玩得动；图形与文字坐标一起缩放并居中。
// 玩：node term.js  ·  自测（无需 TTY）：node term.js --selftest  ·  尺寸适配自检：node term.js --fittest
import readline from 'node:readline';
import { homedir } from 'node:os';
import { mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { Framebuffer } from './core/framebuffer.js';
import {
  drawFrame, LAYOUT, W, H, paletteOf, UI,
  drawTitle, drawMenuBack, drawDim, drawMenuPanel, drawTextPage, drawSaveCards, drawEnding, drawConfirm,
} from './core/art.js';
import { Game, getView, wrap } from './core/scene.js';
import { Shell } from './core/shell.js';

const fb = new Framebuffer(W, H);

// 自动适配状态：_D=降采样倍率（1=原生），_padCol/_padRow=居中偏移。render() 每帧按终端尺寸更新。
let _D = 1, _padCol = 0, _padRow = 0;
const fg = (c) => `\x1b[38;2;${c[0]};${c[1]};${c[2]}m`;
const at = (x, y) => `\x1b[${Math.floor(y / (2 * _D)) + 1 + _padRow};${Math.floor(x / _D) + 1 + _padCol}H`; // 帧缓冲像素 → 终端行列（含缩放+居中）

// 按终端尺寸算降采样倍率与居中偏移。半块下：原生需 W 列 × H/2 行；降采样 D 倍后需 W/D 列 × H/(2D) 行。
function computeFit(cols, rows) {
  cols = cols || process.stdout.columns || W;             // 非 TTY（管道）时按原生
  const total = rows || process.stdout.rows || (H / 2 + 1);
  const usable = total - 1;                               // 末行留给提示
  const D = Math.max(1, Math.min(6, Math.ceil(Math.max(W / cols, (H / 2) / Math.max(1, usable)))));
  const ow = Math.floor(W / D), orows = Math.floor(H / D / 2);
  _D = D;
  _padCol = Math.max(0, Math.floor((cols - ow) / 2));
  _padRow = Math.max(0, Math.floor((usable - orows) / 2));
  return { D, ow, orows, cols, total };
}

// 把帧缓冲降采样 D 倍后用半块输出，逐行绝对定位到居中位置（取每 D×D 块中心像素，保 1-bit 清晰）。
function ansiScaled() {
  const D = _D, ow = Math.floor(W / D), oh = Math.floor(H / D);
  const samp = (ox, oy) => {
    let sx = ox * D + (D >> 1); if (sx >= W) sx = W - 1;
    let sy = oy * D + (D >> 1); if (sy >= H) sy = H - 1;
    const i = (sy * W + sx) * 3;
    return fb.data[i] + ';' + fb.data[i + 1] + ';' + fb.data[i + 2];
  };
  let out = '', line = 0;
  for (let oy = 0; oy + 1 < oh; oy += 2) {
    out += `\x1b[${_padRow + line + 1};${_padCol + 1}H`;
    for (let ox = 0; ox < ow; ox++)
      out += `\x1b[38;2;${samp(ox, oy)}m\x1b[48;2;${samp(ox, oy + 1)}m▀`;
    out += '\x1b[0m';
    line++;
  }
  return out;
}

// 存档适配器：~/.r17/slot_N.json，失败回退进程内内存；终端无自动档
const DIR = join(homedir(), '.r17');
const mem = {};
const termStorage = {
  read(s) { try { return JSON.parse(readFileSync(join(DIR, `slot_${s}.json`), 'utf8')); } catch (e) { return mem[s] || null; } },
  write(s, d) { try { mkdirSync(DIR, { recursive: true }); writeFileSync(join(DIR, `slot_${s}.json`), JSON.stringify(d)); } catch (e) { mem[s] = d; } },
  remove(s) { try { unlinkSync(join(DIR, `slot_${s}.json`)); } catch (e) {} delete mem[s]; },
  readAuto() { return null; },
};

// ===== 叠字（各画面）=====
function overlayGame(v) {
  const C = paletteOf(v);
  const T = LAYOUT.text;
  let s = '';
  if (v.mode === 'say') {
    if (v.name) s += at(LAYOUT.name.x, LAYOUT.name.y) + fg(C.boxText) + v.name;
    wrap(v.text, T.perLine).slice(0, 3).forEach((ln, k) => { s += at(T.x, T.y + k * T.lineH) + fg(C.boxText) + ln; });
    s += at(LAYOUT.box.x + LAYOUT.box.w - 8, LAYOUT.box.y + LAYOUT.box.h - 6) + fg(C.boxText) + '▼';
  } else if (v.mode === 'choice') {
    s += at(LAYOUT.name.x, LAYOUT.name.y) + fg(C.boxText) + '请选择';
    s += at(T.x, T.y) + fg(C.boxText) + wrap(v.title, T.perLine)[0];
    v.options.forEach((o, k) => { const sel = k === v.sel; s += at(T.x - 1, T.y + (k + 1) * T.lineH) + fg(sel ? C.boxFill : C.boxText) + (sel ? '▸ ' : '  ') + o.label; });
  } else if (v.mode === 'note') {
    const N = LAYOUT.noteText;
    wrap(v.note.line, N.perLine).slice(0, 4).forEach((ln, k) => { s += at(N.x, N.y + k * N.lineH) + fg(C.noteText) + ln; });
    s += at(LAYOUT.noteSig.x, LAYOUT.noteSig.y) + fg(C.noteText) + '—— ' + v.note.sig;
  } else if (v.mode === 'rewrite') {
    const N = LAYOUT.noteText;
    if (v.note) wrap(v.note.line, N.perLine).slice(0, 3).forEach((ln, k) => { s += at(N.x, N.y + k * N.lineH) + fg(C.noteText) + ln; });
    s += at(N.x, LAYOUT.noteSig.y) + fg(C.noteText) + '—— ' + (v.oldSig || '') + ' ⟶ ' + (v.newSig || '');
    s += at(N.x, LAYOUT.noteSig.y + 16) + fg(C.noteText) + `第 ${v.idx + 1} / 共 ${v.total} 张`;
  }
  return s;
}

function overlayMenu(v) {
  const C = paletteOf(v), geo = v.menuKind === 'pause' ? UI.pause : UI.menu;
  let s = at(geo.tab.x + 8, geo.tab.y + 3) + fg(C.boxText) + v.title;
  v.items.forEach((it, k) => { const on = k === v.sel; s += at(geo.textX, geo.firstY + k * geo.lineH) + fg(on ? C.boxFill : C.boxText) + (on ? '▸ ' : '  ') + it.label + (it.disabled ? ' （空）' : ''); });
  return s;
}
function overlayTitle(v) {
  const C = paletteOf(v);
  const tg = (v.tagline || '').split('；');
  return at(UI.title.logo.cx - 10, UI.title.logo.cy - 2) + fg(C.fg) + '重返十七岁'
    + at(UI.title.credit.cx - 26, UI.title.credit.y) + fg(C.fg) + 'Made with 牧濑红莉栖 ♥ 比屋定真帆 ♥ 大韦'
    + at(UI.title.tag.cx - 10, UI.title.tag.y1) + fg(C.fg) + (tg[0] + '；')
    + at(UI.title.tag.cx - 10, UI.title.tag.y2) + fg(C.fg) + (tg[1] || '')
    + at(UI.title.prompt.cx - 14, UI.title.prompt.y) + fg(C.fg) + '按 回车 / 点击 开始';
}
function overlayText(v) {
  const C = paletteOf(v);
  let s = at(UI.text.tab.cx - v.title.length, UI.text.titleY) + fg(C.bg) + v.title;
  v.lines.forEach((ln, k) => { s += at(UI.text.bodyX, UI.text.bodyY + k * UI.text.lineH) + fg(C.fg) + ln; });
  if (v.pages > 1) s += at(UI.text.frame.x + UI.text.frame.w - 56, UI.text.footY) + fg(C.fg) + `${v.page + 1}/${v.pages}`;
  return s;
}
function overlaySaves(v) {
  const C = paletteOf(v);
  let s = at(120, UI.saves.titleY) + fg(C.fg) + v.title;
  v.cards.forEach((card, k) => {
    const on = k === v.sel, col = on ? C.boxFill : C.fg, y = UI.saves.ys[k];
    s += at(UI.saves.badge.x + 10, y + 8) + fg(col) + String(card.slot);
    s += at(UI.saves.textX, y + 12) + fg(col) + (card.empty ? '空 · 未使用' : card.label);
    if (!card.empty) s += at(UI.saves.textX, y + 30) + fg(col) + (card.time + '  ' + card.progress);
  });
  s += at(UI.saves.backX + 8, UI.saves.backY) + fg(v.sel === 3 ? C.boxFill : C.fg) + '返回';
  return s;
}
function overlayEnding(v) {
  const C = paletteOf(v);
  let s = at(UI.ending.cx - v.title.length, UI.ending.titleY) + fg(C.fg) + v.title;
  v.lines.forEach((ln, k) => { s += at(UI.ending.box.x + 20, UI.ending.bodyY + k * UI.ending.lineH) + fg(C.fg) + ln; });
  s += at(UI.ending.cx - 8, UI.ending.promptY) + fg(C.fg) + '返回标题';
  return s;
}
function overlayConfirm(v) {
  const C = paletteOf(v), cf = v.confirm;
  return at(62, UI.confirm.textY) + fg(C.boxText) + cf.text
    + at(UI.confirm.opt0 - 6, UI.confirm.optY) + fg(cf.sel === 0 ? C.boxFill : C.boxText) + cf.options[0]
    + at(UI.confirm.opt1 - 6, UI.confirm.optY) + fg(cf.sel === 1 ? C.boxFill : C.boxText) + cf.options[1];
}

function render(shell) {
  computeFit(); // 每帧按当前终端尺寸算缩放+居中
  const v = shell.view(), C = paletteOf(v);
  if (v.kind === 'game') drawFrame(fb, v.gameView);
  else if (v.kind === 'title') drawTitle(fb, C);
  else if (v.kind === 'menu') {
    if (v.menuKind === 'pause') { drawFrame(fb, v.gameView); drawDim(fb, paletteOf(v.gameView)); }
    else drawMenuBack(fb, C);
    drawMenuPanel(fb, C, v.menuKind === 'pause' ? UI.pause : UI.menu, v.sel);
  } else if (v.kind === 'saves') drawSaveCards(fb, C, v.cards, v.sel);
  else if (v.kind === 'text') drawTextPage(fb, C, v.portrait);
  else if (v.kind === 'ending') drawEnding(fb, C);
  if (v.confirm) drawConfirm(fb, C, v.confirm.sel);

  let s = '\x1b[2J\x1b[H' + ansiScaled();
  if (v.kind === 'game') s += overlayGame(v.gameView);
  else if (v.kind === 'title') s += overlayTitle(v);
  else if (v.kind === 'menu') s += overlayMenu(v);
  else if (v.kind === 'saves') s += overlaySaves(v);
  else if (v.kind === 'text') s += overlayText(v);
  else if (v.kind === 'ending') s += overlayEnding(v);
  if (v.confirm) s += overlayConfirm(v);
  if (v.toast) s += at(138, 150) + '\x1b[7m ' + v.toast + ' \x1b[27m';
  s += '\x1b[0m';
  if (v.hint) s += `\x1b[${process.stdout.rows || 121};1H\x1b[2K` + v.hint; // 提示固定在终端最后一行
  process.stdout.write(s + '\x1b[0m');
}

// ===== 自测（铁律：裸驱动 Game，不经过 Shell，行为与改造前一致）=====
function selftest() {
  let total = 0, lines = '';
  // sel=0：正常通关路线（覆盖全部章节）；sel=1：偏向触发 Bad End 的路线。两条都逐步渲染，捕获渲染崩溃。
  for (const sel of [0, 1]) {
    const g = new Game();
    let steps = 0;
    while (!g.done && steps < 2000) {
      const v = getView(g);
      drawFrame(fb, v); fb.toANSI(); overlayGame(v);
      if (g.isChoice()) { g.sel = sel; g.choose(); } else g.advance();
      steps++;
    }
    total += steps;
    lines += `  sel=${sel}: ${String(steps).padStart(3)} 步 → 终场 ${g.sceneId}\n`;
  }
  process.stdout.write(lines + `SELFTEST OK  fb=${W}x${H}  共 ${total} 步（两条路线均逐步渲染无崩溃）\n`);
}

function normTerm(ch, key) {
  key = key || {};
  if (key.name === 'up') return 'up';
  if (key.name === 'down') return 'down';
  if (key.name === 'left') return 'left';
  if (key.name === 'right') return 'right';
  if (key.name === 'return' || key.name === 'space') return 'confirm';
  if (key.name === 'escape') return 'esc';
  if (key.name === 'backspace') return 'back';
  if (ch === 'p') return 'pause';
  if (ch === 'd') return 'del';
  if (ch >= '1' && ch <= '9') return ch;
  return null;
}

function cleanup() {
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.stdout.write('\x1b[?25h\x1b[0m\n');
}

// 尺寸适配自检：多种终端尺寸下验证图形块尺寸正确且完全落在窗口内（无需 TTY）。
function fittest() {
  const C = paletteOf({ palette: 'night' });
  drawTitle(fb, C); // 往 fb 画点东西好统计 ▀
  const sizes = [[80, 30], [100, 30], [120, 40], [160, 50], [200, 60], [320, 121]];
  let allok = true, out = '';
  for (const [cols, rows] of sizes) {
    const fit = computeFit(cols, rows);
    const blocks = (ansiScaled().match(/▀/g) || []).length;
    const widthOK = _padCol + fit.ow <= cols;
    const heightOK = _padRow + fit.orows <= rows - 1;
    const blocksOK = blocks === fit.ow * fit.orows;
    const ok = widthOK && heightOK && blocksOK;
    allok = allok && ok;
    out += `  ${String(cols).padStart(3)}x${rows}: D=${fit.D}  图形 ${fit.ow}×${fit.orows} 格  居中 pad(${_padCol},${_padRow})  ▀=${blocks}/${fit.ow * fit.orows}  ${ok ? 'OK' : '✗'}\n`;
  }
  process.stdout.write(out + (allok ? 'FITTEST OK：各尺寸图形块尺寸正确且完全落在窗口内\n' : 'FITTEST 有问题\n'));
}

function main() {
  if (process.argv.includes('--selftest')) return selftest();
  if (process.argv.includes('--fittest')) return fittest();
  const shell = new Shell(termStorage);
  process.stdout.write('\x1b[?25l');
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  render(shell);
  process.stdout.on('resize', () => render(shell)); // 玩家拉伸窗口时自动重排
  process.stdin.on('keypress', (ch, key) => {
    key = key || {};
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) { cleanup(); process.exit(0); }
    const k = normTerm(ch, key);
    if (!k) return;
    shell.handleKey(k);
    render(shell);
  });
}

main();
