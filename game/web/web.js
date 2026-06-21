// 网页入口：同一份像素帧缓冲画进 Canvas（最近邻放大），文字用 fillText 叠加。
// 现在由 Shell 控制器统管标题 / 菜单 / 文本页 / 存读档 / 暂停 / 结算 / 正片。
import { Framebuffer } from '../core/framebuffer.js';
import {
  drawFrame, LAYOUT, W, H, paletteOf, UI,
  drawTitle, drawMenuBack, drawDim, drawMenuPanel, drawTextPage, drawSaveCards, drawEnding,
} from '../core/art.js';
import { getView, wrap } from '../core/scene.js';
import { Shell } from '../core/shell.js';
import { SCENES } from '../story/index.js';

const S = 2; // 放大倍数（320×240 → 640×480）
const fb = new Framebuffer(W, H);
const cv = document.getElementById('screen');
cv.width = W * S; cv.height = H * S;
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const buf = document.createElement('canvas');
buf.width = W; buf.height = H;
const bctx = buf.getContext('2d');
const hintEl = document.querySelector('.hint');

// 存档适配器：localStorage（手动 3 槽 + 旧 r17_save 自动档）
const webStorage = {
  read(s) { try { const v = localStorage.getItem(`r17_slot_${s}`); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  write(s, d) { try { localStorage.setItem(`r17_slot_${s}`, JSON.stringify(d)); } catch (e) {} },
  remove(s) { try { localStorage.removeItem(`r17_slot_${s}`); } catch (e) {} },
  readAuto() { try { const v = localStorage.getItem('r17_save'); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
};

const shell = new Shell(webStorage);
// 调试：网址带 #场景名 直接进该场景试玩（不影响正式起点）
{ const h = decodeURIComponent((location.hash || '').slice(1)); if (h && SCENES[h]) { shell.newGame(); shell.game.goto(h); } }
window.__dev = { shell, game: () => shell.game, render: () => render() };

const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const F_GAME = '29px ui-monospace, Menlo, monospace';
const F_OPT = '22px ui-monospace, Menlo, monospace';
const F_MENU = '26px ui-monospace, Menlo, monospace';
const F_BODY = '25px ui-monospace, Menlo, monospace';
const F_LOGO = 'bold 34px ui-monospace, Menlo, monospace';
const F_TAG = '20px ui-monospace, Menlo, monospace';
const F_SM = '18px ui-monospace, Menlo, monospace';
const F_CREDIT = '13px ui-monospace, Menlo, monospace';
const CREDIT = 'Made with 牧濑红莉栖 ♥ 比屋定真帆 ♥ 大韦';
const breathe = () => 0.4 + 0.45 * Math.abs(Math.sin(performance.now() / 650));

function txt(str, x, y, color, font, align, baseline) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align || 'left'; ctx.textBaseline = baseline || 'top';
  ctx.fillText(str, x * S, y * S);
}
function cvrect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x * S, y * S, w * S, h * S); }
function blitFB() {
  bctx.putImageData(new ImageData(fb.toRGBA(), W, H), 0, 0);
  ctx.drawImage(buf, 0, 0, W, H, 0, 0, W * S, H * S);
}

function renderGameView(v) {
  drawFrame(fb, v);
  blitFB();
  const C = paletteOf(v);
  const T = LAYOUT.text;
  if (v.mode === 'say') {
    if (v.name) txt(v.name, LAYOUT.name.x, LAYOUT.name.y - 0.5, rgb(C.boxText), F_GAME);
    wrap(v.text, T.perLine).slice(0, 3).forEach((ln, k) => txt(ln, T.x, T.y + k * T.lineH, rgb(C.boxText), F_GAME));
  } else if (v.mode === 'choice') {
    txt('请选择', LAYOUT.name.x, LAYOUT.name.y - 0.5, rgb(C.boxText), F_GAME);
    txt(wrap(v.title, T.perLine)[0], T.x, T.y, rgb(C.boxText), F_GAME);
    v.options.forEach((o, k) => { const sel = k === v.sel; txt((sel ? '▸ ' : '  ') + o.label, T.x - 1, T.y + (k + 1) * T.lineH + 3, rgb(sel ? C.boxFill : C.boxText), F_OPT); });
  } else if (v.mode === 'note') {
    const N = LAYOUT.noteText;
    wrap(v.note.line, N.perLine).slice(0, 4).forEach((ln, k) => txt(ln, N.x, N.y + k * N.lineH, rgb(C.noteText), F_GAME));
    txt('—— ' + v.note.sig, LAYOUT.noteSig.x, LAYOUT.noteSig.y, rgb(C.noteText), F_GAME);
  } else if (v.mode === 'rewrite') {
    const N = LAYOUT.noteText;
    if (v.note) wrap(v.note.line, N.perLine).slice(0, 3).forEach((ln, k) => txt(ln, N.x, N.y + k * N.lineH, rgb(C.noteText), F_GAME));
    const sy = LAYOUT.noteSig.y;
    txt('—— ' + (v.oldSig || ''), N.x, sy, rgba(C.noteText, 0.4), F_GAME);                 // 旧署名·淡
    ctx.fillStyle = rgba(C.noteText, 0.7);
    ctx.fillRect((N.x + 8) * S, (sy + 9) * S, 46 * S, Math.max(1, Math.round(1.5 * S)));    // 划掉那道线
    txt('改写为  ' + (v.newSig || ''), N.x + 92, sy, rgb(C.noteText), F_GAME);              // 新署名·亮
    txt(`第 ${v.idx + 1} / 共 ${v.total} 张`, N.x, sy + 18, rgba(C.noteText, 0.55), F_SM);
  }
}

function renderTitle(v) {
  const C = paletteOf(v);
  drawTitle(fb, C); blitFB();
  txt('重返十七岁', UI.title.logo.cx, UI.title.logo.cy, rgb(C.fg), F_LOGO, 'center', 'middle'); // 牌匾内垂直居中
  ctx.globalAlpha = 0.78;
  txt(CREDIT, UI.title.credit.cx, UI.title.credit.y, rgb(C.fg), F_CREDIT, 'center');               // 署名
  ctx.globalAlpha = 1;
  const tg = (v.tagline || '').split('；');
  txt(tg[0] + '；', UI.title.tag.cx, UI.title.tag.y1, rgb(C.fg), F_TAG, 'center');
  txt(tg[1] || '', UI.title.tag.cx, UI.title.tag.y2, rgb(C.fg), F_TAG, 'center');
  ctx.globalAlpha = breathe();
  txt('按 回车 / 点击 开始', UI.title.prompt.cx, UI.title.prompt.y, rgb(C.fg), F_TAG, 'center');
  ctx.globalAlpha = 1;
}

function renderMenu(v) {
  const C = paletteOf(v);
  const geo = v.menuKind === 'pause' ? UI.pause : UI.menu;
  if (v.menuKind === 'pause') { drawFrame(fb, v.gameView); drawDim(fb, paletteOf(v.gameView)); }
  else drawMenuBack(fb, C);
  drawMenuPanel(fb, C, geo, v.sel);
  blitFB();
  txt(v.title, geo.tab.x + 8, geo.tab.y + 3, rgb(C.boxText), F_SM);
  v.items.forEach((it, k) => {
    const on = k === v.sel;
    const color = it.disabled ? rgba(C.boxText, 0.4) : rgb(on ? C.boxFill : C.boxText);
    txt((on ? '▸ ' : '  ') + it.label, geo.textX, geo.firstY + k * geo.lineH, color, F_MENU);
  });
}

function renderText(v) {
  const C = paletteOf(v);
  drawTextPage(fb, C, v.portrait); blitFB();
  txt(v.title, UI.text.tab.cx, UI.text.titleY, rgb(C.bg), F_SM, 'center');
  v.lines.forEach((ln, k) => txt(ln, UI.text.bodyX, UI.text.bodyY + k * UI.text.lineH, rgb(C.fg), F_BODY));
  if (v.pages > 1) txt(`${v.page + 1} / ${v.pages}`, UI.text.frame.x + UI.text.frame.w - 56, UI.text.footY, rgb(C.fg), F_SM);
}

function renderSaves(v) {
  const C = paletteOf(v);
  drawSaveCards(fb, C, v.cards, v.sel); blitFB();
  txt(v.title, 160, UI.saves.titleY, rgb(C.fg), F_MENU, 'center');
  v.cards.forEach((card, k) => {
    const on = k === v.sel, col = rgb(on ? C.boxFill : C.fg), y = UI.saves.ys[k];
    txt(String(card.slot), UI.saves.badge.x + 9, y + 7, col, F_MENU);
    if (card.empty) txt('空 · 未使用', UI.saves.textX, y + 14, col, F_BODY);
    else {
      txt(card.label, UI.saves.textX, y + 5, col, F_BODY);
      txt(card.time + '   ' + card.progress, UI.saves.textX, y + 27, col, F_SM);
    }
  });
  txt('返回', UI.saves.backX + 8, UI.saves.backY, rgb(v.sel === 3 ? C.boxFill : C.fg), F_MENU);
}

function renderEnding(v) {
  const C = paletteOf(v);
  drawEnding(fb, C); blitFB();
  txt(v.title, UI.ending.cx, UI.ending.titleY, rgb(C.fg), F_MENU, 'center');
  v.lines.forEach((ln, k) => txt(ln, UI.ending.cx, UI.ending.bodyY + k * UI.ending.lineH, rgb(C.fg), F_BODY, 'center'));
  ctx.globalAlpha = breathe();
  txt('返回标题', UI.ending.cx, UI.ending.promptY, rgb(C.fg), F_BODY, 'center');
  ctx.globalAlpha = 1;
}

function renderConfirm(v) {
  const C = paletteOf(v), b = UI.confirm.box, cf = v.confirm;
  cvrect(b.x, b.y, b.w, b.h, rgb(C.boxFill));
  cvrect(b.x + 3, b.y + 3, b.w - 6, 2, rgb(C.boxText)); cvrect(b.x + 3, b.y + b.h - 5, b.w - 6, 2, rgb(C.boxText));
  cvrect(b.x + 3, b.y + 3, 2, b.h - 6, rgb(C.boxText)); cvrect(b.x + b.w - 5, b.y + 3, 2, b.h - 6, rgb(C.boxText));
  wrap(cf.text, 15).slice(0, 2).forEach((ln, k) => txt(ln, 160, UI.confirm.textY + k * 16, rgb(C.boxText), F_BODY, 'center'));
  [[UI.confirm.opt0, cf.options[0], 0], [UI.confirm.opt1, cf.options[1], 1]].forEach(([ox, label, idx]) => {
    const on = cf.sel === idx;
    if (on) cvrect(ox - 32, UI.confirm.optY - 3, 64, 16, rgb(C.boxText));
    txt(label, ox, UI.confirm.optY, rgb(on ? C.boxFill : C.boxText), F_OPT, 'center');
  });
}

function renderToast(t, v) {
  const C = paletteOf(v);
  ctx.font = F_BODY; const w = ctx.measureText(t).width / S + 26;
  cvrect(160 - w / 2, 148, w, 22, rgb(C.boxText));
  txt(t, 160, 152, rgb(C.boxFill), F_BODY, 'center');
}

function render() {
  const v = shell.view();
  if (v.kind === 'game') renderGameView(v.gameView);
  else if (v.kind === 'title') renderTitle(v);
  else if (v.kind === 'menu') renderMenu(v);
  else if (v.kind === 'saves') renderSaves(v);
  else if (v.kind === 'text') renderText(v);
  else if (v.kind === 'ending') renderEnding(v);
  if (v.confirm) renderConfirm(v);
  if (v.toast) renderToast(v.toast, v);
  if (hintEl) hintEl.textContent = v.hint || '';
}

function normalize(e) {
  switch (e.key) {
    case 'ArrowUp': return 'up';
    case 'ArrowDown': return 'down';
    case 'ArrowLeft': return 'left';
    case 'ArrowRight': return 'right';
    case 'Enter': case ' ': return 'confirm';
    case 'Escape': return 'esc';
    case 'Backspace': return 'back';
    case 'p': case 'P': return 'pause';
    case 'd': case 'D': return 'del';
    default: return (e.key >= '1' && e.key <= '9') ? e.key : null;
  }
}

window.addEventListener('keydown', (e) => { const k = normalize(e); if (!k) return; e.preventDefault(); shell.handleKey(k); });
cv.addEventListener('click', () => shell.handleClick());

(function loop() { render(); requestAnimationFrame(loop); })();
