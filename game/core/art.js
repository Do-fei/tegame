// 美术层 · halfmoon 1-bit（320×240）。按场景挑背景 + 色板，贴立绘，画 UI。
// 文字由各平台叠加（颜色取自当前色板）。
import { PALETTES } from './palette.js';
import { SPRITES } from '../assets/index.js';

export const W = 320;
export const H = 240;

export const LAYOUT = {
  box:      { x: 6, y: 160, w: 308, h: 76 },
  name:     { x: 22, y: 145 },
  text:     { x: 20, y: 178, lineH: 18, perLine: 19 },
  note:     { x: 44, y: 30, w: 232, h: 108 },
  noteText: { x: 60, y: 54, lineH: 18, perLine: 15 },
  noteSig:  { x: 200, y: 120 },
};

export function paletteOf(view) {
  return PALETTES[view && view.palette] || PALETTES.day;
}

const dashH = (fb, x, y, w, c) => { for (let i = 0; i < w; i++) if (i % 6 < 3) fb.px(x + i, y, c); };
const dashV = (fb, x, y, h, c) => { for (let i = 0; i < h; i++) if (i % 6 < 3) fb.px(x, y + i, c); };
function dashRect(fb, x, y, w, h, c) {
  dashH(fb, x, y, w, c); dashH(fb, x, y + h - 1, w, c);
  dashV(fb, x, y, h, c); dashV(fb, x + w - 1, y, h, c);
}
function dither(fb, x, y, w, h, c, mod) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++)
    if (((x + xx) + (y + yy)) % mod === 0) fb.px(x + xx, y + yy, c);
}
function solidLine(fb, x0, y0, x1, y1, c) {
  x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    fb.px(x0, y0, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}
// 群演剪影：路人/同学不再用方块。无脸、统一姿势 = 恐怖名场面的压迫感。
function personUp(fb, x, y, h, c) { // 站立·双臂上举（广播体操）
  const hw = Math.max(1, Math.round(h * 0.13)), bw = hw + 1;
  fb.rect(x - hw, y, hw * 2, hw * 2, c);                 // 头
  const ty = y + hw * 2, th = Math.round(h * 0.4);
  fb.rect(x - bw, ty, bw * 2, th, c);                    // 躯干
  const dx = Math.round(h * 0.2), top = y - 1;
  solidLine(fb, x - bw, ty + 1, x - bw - dx, top, c);    // 左臂上举
  solidLine(fb, x + bw - 1, ty + 1, x + bw - 1 + dx, top, c); // 右臂上举
  const ly = ty + th, ll = y + h - ly;
  fb.rect(x - bw, ly, 2, ll, c); fb.rect(x + bw - 2, ly, 2, ll, c); // 双腿
}
function personSit(fb, x, deskTop, s, c) { // 坐姿·只露头+肩（下身被课桌挡住）
  const hw = Math.max(3, s);
  const ht = deskTop - hw * 2 - 7;                       // 头顶
  fb.rect(x - hw, ht, hw * 2, hw * 2, c);                // 头
  fb.rect(x - hw + 1, ht + hw * 2, hw * 2 - 2, 3, c);    // 脖
  fb.rect(x - hw - 1, deskTop - 9, hw * 2 + 2, 4, c);    // 上肩
  fb.rect(x - hw - 3, deskTop - 5, hw * 2 + 6, 6, c);    // 下肩（压在桌沿上）
}

// ---- 背景 ----
function drawShake(fb, x, y, c) {
  for (let i = 0; i < 22; i++) { fb.px(x + 8, y - 14 + i, c); fb.px(x + 20, y - 16 + i, c); }
  fb.rect(x, y, 28, 2, c);
  fb.rect(x, y, 2, 30, c);
  fb.rect(x + 26, y, 2, 30, c);
  fb.rect(x + 1, y + 30, 26, 2, c);
  dither(fb, x + 3, y + 3, 22, 26, c, 2);
}

function drawCafe(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 12, C.fg, 4);
  dither(fb, 0, H - 16, W, 16, C.fg, 5);
  dashRect(fb, 16, 18, 88, 56, C.fg);
  dashV(fb, 60, 18, 56, C.fg);
  dashH(fb, 16, 46, 88, C.fg);
  for (let k = 0; k < 14; k++) fb.px(24 + (k * 11) % 76, 24 + (k * 9) % 44, C.fg);
  dashV(fb, 148, 0, 16, C.fg);
  dashH(fb, 136, 16, 26, C.fg);
  dashRect(fb, 176, 44, 128, 92, C.fg);
  dashH(fb, 0, 148, 144, C.fg);
  dither(fb, 0, 152, 144, 10, C.fg, 3);
  drawShake(fb, 44, 116, C.fg);
}

function drawOffice(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 10, C.fg, 4);
  dither(fb, 0, H - 14, W, 14, C.fg, 5);
  // 后墙落地窗 + 城市灯火
  dashRect(fb, 28, 22, 180, 92, C.fg);
  dashV(fb, 118, 22, 92, C.fg);
  dashH(fb, 28, 68, 180, C.fg);
  for (let k = 0; k < 26; k++) fb.px(36 + (k * 13) % 164, 30 + (k * 7) % 78, C.fg);
  // 吊灯
  dashV(fb, 250, 0, 14, C.fg); dashH(fb, 240, 14, 22, C.fg);
  // 远处一格工位（虚线）
  dashRect(fb, 232, 120, 60, 44, C.fg);
  // 前景办公桌
  dashH(fb, 0, 178, W, C.fg);
  dither(fb, 0, 182, W, 8, C.fg, 4);
  // 显示器（亮着）
  dashRect(fb, 120, 120, 76, 50, C.fg);
  dither(fb, 124, 124, 68, 42, C.fg, 3);
  fb.rect(154, 170, 8, 6, C.fg);          // 底座
  // 椅背剪影
  dashRect(fb, 60, 138, 40, 40, C.fg);
}

function drawBooth(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 10, C.fg, 5);
  dither(fb, 0, H - 14, W, 14, C.fg, 5);
  // 大厦门厅（背景虚线）
  dashRect(fb, 18, 24, 284, 150, C.fg);
  dashV(fb, 70, 24, 150, C.fg);
  dashV(fb, 250, 24, 150, C.fg);
  // 地面
  dashH(fb, 0, 214, W, C.fg);
  // 保安亭（框住绿衣女）
  dashRect(fb, 100, 44, 120, 170, C.fg);
  dashH(fb, 100, 112, 120, C.fg);   // 窗口/台面
  // 亭顶小灯
  dashH(fb, 150, 38, 20, C.fg); fb.px(160, 41, C.fg);
}

function drawBlank(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, H, C.fg, 9); // 极淡颗粒
}

function dashLine(fb, x0, y0, x1, y1, c) {
  x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy, n = 0;
  while (true) {
    if ((n++ % 6) < 3) fb.px(x0, y0, c);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

function drawHallway(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 10, C.fg, 5);
  dither(fb, 0, H - 14, W, 14, C.fg, 5);
  const vx = 168, vy = 100; // 透视灭点
  dashLine(fb, 0, 0, vx, vy, C.fg);
  dashLine(fb, W - 1, 0, vx, vy, C.fg);
  dashLine(fb, 0, H - 1, vx, vy, C.fg);
  dashLine(fb, W - 1, H - 1, vx, vy, C.fg);
  dashRect(fb, vx - 22, vy - 6, 44, 56, C.fg); // 尽头电梯门
  dashV(fb, vx, vy - 6, 56, C.fg);
  dashRect(fb, 28, 86, 42, 78, C.fg);          // 两侧的门
  dashRect(fb, 250, 86, 42, 78, C.fg);
  dashH(fb, 0, 184, W, C.fg);                  // 近处地面
}

function drawHome(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 10, C.fg, 5);
  dither(fb, 0, H - 14, W, 14, C.fg, 5);
  dashRect(fb, 28, 28, 92, 74, C.fg);          // 窗（夜）
  dashV(fb, 74, 28, 74, C.fg);
  dashH(fb, 28, 65, 92, C.fg);
  for (let k = 0; k < 12; k++) fb.px(36 + (k * 13) % 76, 34 + (k * 7) % 60, C.fg); // 夜空点
  dashRect(fb, 196, 132, 116, 56, C.fg);       // 床
  dashRect(fb, 28, 150, 84, 38, C.fg);         // 书桌
  dashRect(fb, 150, 38, 44, 92, C.fg);         // 衣柜
}

function drawTunnel(fb, C) {
  fb.clear(C.bg);
  const vx = 160, vy = 116;
  dashLine(fb, 0, 0, vx, vy, C.fg);
  dashLine(fb, W - 1, 0, vx, vy, C.fg);
  dashLine(fb, 0, H - 1, vx, vy, C.fg);
  dashLine(fb, W - 1, H - 1, vx, vy, C.fg);
  for (let i = 1; i <= 5; i++) {   // 墙上一盏盏小黄灯，往里缩
    const t = i / 6;
    const ly = Math.round(126 + (vy - 126) * t);
    fb.rect(Math.round(vx * t * 0.5), ly, 3, 3, C.fg);
    fb.rect(Math.round(W - (W - vx) * t * 0.5 - 4), ly, 3, 3, C.fg);
  }
  dither(fb, vx - 18, vy - 14, 36, 28, C.fg, 2); // 尽头亮光晕
  fb.rect(vx - 9, vy - 7, 18, 14, C.fg);         // 尽头亮光
}

function drawClassroom(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 8, C.fg, 6);
  dashRect(fb, 86, 12, 148, 32, C.fg);                                   // 黑板
  for (let i = 0; i < 4; i++) dashH(fb, 96, 20 + i * 5, 48 + i * 10, C.fg); // 板书痕迹
  dashRect(fb, 10, 20, 52, 50, C.fg); dashV(fb, 35, 20, 50, C.fg); dashH(fb, 10, 44, 52, C.fg); // 窗
  dashRect(fb, 274, 22, 34, 56, C.fg);                                   // 门
  // 一排排同学：先画头肩剪影，再用课桌实底遮住下半身（坐在桌后）
  const rows = [{ deskY: 84, dh: 12, dw: 28, s: 4, gap: 18 }, { deskY: 112, dh: 13, dw: 34, s: 5, gap: 16 }, { deskY: 144, dh: 15, dw: 42, s: 6, gap: 16 }];
  for (const R of rows) {
    const total = 4 * R.dw + 3 * R.gap, sx = (W - total) >> 1;
    for (let cI = 0; cI < 4; cI++) {
      const dx = sx + cI * (R.dw + R.gap), cx = dx + (R.dw >> 1);
      personSit(fb, cx, R.deskY, R.s, C.fg);
      fb.rect(dx, R.deskY, R.dw, R.dh, C.bg);        // 课桌实底遮挡下半身
      dashRect(fb, dx, R.deskY, R.dw, R.dh, C.fg);   // 课桌描边
    }
  }
}

function drawPlayground(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 8, C.fg, 7);                  // 天
  dashRect(fb, 244, 22, 70, 44, C.fg);              // 远处教学楼
  for (let x = 252; x < 312; x += 18) { dashRect(fb, x, 30, 12, 12, C.fg); dashRect(fb, x, 48, 12, 12, C.fg); }
  dashV(fb, 314, 12, 104, C.fg);                    // 旗杆
  dashH(fb, 0, 150, W, C.fg);                        // 操场边线
  // 一操场做操的学生：4 排方阵，前排大、后排小（透视）
  const rows = [{ y: 120, h: 34, n: 7 }, { y: 100, h: 27, n: 8 }, { y: 82, h: 21, n: 9 }, { y: 68, h: 16, n: 10 }];
  for (const R of rows) {
    const gap = W / (R.n + 1);
    for (let i = 1; i <= R.n; i++) personUp(fb, Math.round(gap * i), R.y, R.h, C.fg);
  }
}

function drawWild(fb, C) { // 郊野野炊
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 12, C.fg, 6);                                   // 天
  dashLine(fb, 0, 70, 90, 42, C.fg); dashLine(fb, 90, 42, 184, 76, C.fg); // 远山
  dashLine(fb, 150, 58, 238, 34, C.fg); dashLine(fb, 238, 34, 320, 70, C.fg);
  dashH(fb, 0, 122, W, C.fg);                                         // 草坡地平线
  dither(fb, 0, 126, W, 14, C.fg, 4);                                 // 草地颗粒
  fb.rect(42, 92, 5, 38, C.fg);                                       // 树干
  dashRect(fb, 22, 56, 44, 42, C.fg); dither(fb, 27, 61, 34, 32, C.fg, 3); // 树冠
  fb.rect(242, 126, 16, 6, C.fg);                                     // 火堆
  for (let i = 0; i < 20; i++) fb.px(250 + Math.round(Math.sin(i * 0.5) * 4), 124 - i, C.fg); // 炊烟
}
function drawBus(fb, C) { // 大巴车内
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 8, C.fg, 7);
  dashH(fb, 0, 20, W, C.fg);                                          // 车顶
  for (let x = 18; x < 150; x += 44) dashRect(fb, x, 30, 34, 30, C.fg);   // 左窗
  for (let x = 170; x < 302; x += 44) dashRect(fb, x, 30, 34, 30, C.fg);  // 右窗
  const rows = [{ y: 150, w: 62, h: 34 }, { y: 118, w: 48, h: 28 }, { y: 94, w: 38, h: 22 }];
  for (const R of rows) { dashRect(fb, 38, R.y, R.w, R.h, C.fg); dashRect(fb, W - 38 - R.w, R.y, R.w, R.h, C.fg); } // 两排座椅靠背
  dashRect(fb, 120, 70, 80, 40, C.fg);                               // 司机区/挡风
  dashH(fb, 0, 202, W, C.fg);                                         // 过道地面
}
function drawRoad(fb, C) { // 盘山公路
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 10, C.fg, 6);
  dashLine(fb, 0, 60, 130, 30, C.fg); dashLine(fb, 130, 30, 320, 66, C.fg); // 远山
  const vx = 188, vy = 92;
  dashLine(fb, 30, 232, vx, vy, C.fg); dashLine(fb, 270, 232, vx, vy, C.fg); // 路往灭点收
  for (let i = 1; i < 6; i++) { const t = i / 6, x = Math.round(270 + (vx - 270) * t), y = Math.round(232 + (vy - 232) * t); fb.rect(x, y - 7, 2, 7, C.fg); } // 护栏桩
  dashH(fb, 0, 234, W, C.fg);
  dither(fb, 0, 150, 76, 90, C.fg, 7);                               // 崖下虚空
}
function drawHospital(fb, C) { // 医院病房
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 8, C.fg, 8);
  dashRect(fb, 28, 30, 80, 58, C.fg); dashV(fb, 68, 30, 58, C.fg); dashH(fb, 28, 59, 80, C.fg); // 窗
  dashRect(fb, 250, 24, 40, 82, C.fg); dashRect(fb, 258, 14, 24, 9, C.fg);                      // 门 + 门牌(809 叠字)
  dashRect(fb, 168, 132, 124, 50, C.fg); fb.rect(168, 132, 124, 5, C.fg);                       // 病床
  dashRect(fb, 174, 118, 40, 16, C.fg);                                                         // 枕头
  dashV(fb, 150, 96, 86, C.fg); dashH(fb, 142, 96, 16, C.fg); fb.rect(149, 100, 4, 12, C.fg);   // 输液架
  dashH(fb, 0, 202, W, C.fg);                                                                    // 地面
}

const BG = { cafe: drawCafe, office: drawOffice, booth: drawBooth, blank: drawBlank, hallway: drawHallway, home: drawHome, tunnel: drawTunnel, classroom: drawClassroom, playground: drawPlayground, wild: drawWild, bus: drawBus, road: drawRoad, hospital: drawHospital };

// ---- UI ----
export function drawBox(fb, view, C) {
  const b = LAYOUT.box;
  fb.rect(b.x, b.y, b.w, b.h, C.boxFill);
  fb.rect(b.x + 3, b.y + 3, b.w - 6, 2, C.boxText);
  fb.rect(b.x + 3, b.y + b.h - 5, b.w - 6, 2, C.boxText);
  fb.rect(b.x + 3, b.y + 3, 2, b.h - 6, C.boxText);
  fb.rect(b.x + b.w - 5, b.y + 3, 2, b.h - 6, C.boxText);
  const tabLen = view.mode === 'say' && view.name ? view.name.length
    : view.mode === 'choice' ? 3 : 0;
  if (tabLen) {
    const tabW = 22 + tabLen * 16, tabH = 22, tx = b.x + 4, ty = b.y - tabH + 3;
    fb.rect(tx, ty, tabW, tabH, C.boxFill);
    fb.rect(tx, ty, tabW, 2, C.boxText);
    fb.rect(tx, ty, 2, tabH, C.boxText);
    fb.rect(tx + tabW - 2, ty, 2, tabH, C.boxText);
  }
}

export function drawNotePanel(fb, C) {
  const n = LAYOUT.note;
  fb.rect(n.x, n.y, n.w, n.h, C.noteFill);
  dashRect(fb, n.x + 2, n.y + 2, n.w - 4, n.h - 4, C.noteText);
  fb.rect(n.x + (n.w >> 1) - 18, n.y - 6, 36, 10, C.noteText);
}

export function drawFrame(fb, view) {
  const C = paletteOf(view);
  (BG[view.bg] || drawBlank)(fb, C);
  if (view.cast) fb.blitSprite(view.cast.x, view.cast.y, SPRITES[view.cast.sprite], C.fg, C.bg);
  if (view.mode === 'note' || view.mode === 'rewrite') { drawNotePanel(fb, C); return; }
  drawBox(fb, view, C);
  if (view.mode === 'choice') {
    const t = LAYOUT.text;
    const oy = t.y + (view.sel + 1) * t.lineH - 3;
    fb.rect(LAYOUT.box.x + 6, oy, LAYOUT.box.w - 12, t.lineH + 3, C.boxText); // 选中反色
  }
}

// ============ 前端外壳画面（标题/菜单/文本页/存档/结算/确认）============
// 坐标表：帧缓冲负责底图与色块，文字由各平台按这里的坐标叠加（保证终端/网页一致）。
export const UI = {
  title:  { longdi: { x: -40, y: 46 }, hero: { x: 263, y: 44 }, panel: { x: 104, y: 12, w: 148, h: 40 }, logo: { cx: 178, cy: 32 }, credit: { cx: 170, y: 186 }, tag: { cx: 178, y1: 96, y2: 120 }, prompt: { cx: 178, y: 208 } },
  menu:   { x: 84, y: 40, w: 152, h: 164, tab: { x: 88, y: 22, w: 120, h: 20 }, tabText: { x: 98, y: 25 }, firstY: 62, lineH: 22, textX: 106 },
  pause:  { x: 100, y: 64, w: 120, h: 112, tab: { x: 104, y: 46, w: 64, h: 20 }, tabText: { x: 116, y: 49 }, firstY: 90, lineH: 22, textX: 122 },
  text:   { frame: { x: 22, y: 22, w: 276, h: 158 }, tab: { cx: 160, y: 16, w: 112, h: 18 }, titleY: 18, bodyX: 42, bodyY: 56, lineH: 16, maxLines: 8, footY: 194 },
  saves:  { titleY: 18, cardX: 20, cardW: 280, cardH: 48, ys: [40, 94, 148], badge: { x: 28, w: 30, h: 30 }, textX: 70, backX: 24, backY: 204 },
  ending: { box: { x: 30, y: 74, w: 260, h: 92 }, titleY: 92, bodyY: 118, lineH: 16, cx: 160, promptY: 202 },
  confirm:{ box: { x: 46, y: 86, w: 228, h: 68 }, textY: 102, optY: 130, opt0: 112, opt1: 208 },
};

function panelBox(fb, C, x, y, w, h) {
  fb.rect(x, y, w, h, C.boxFill);
  fb.rect(x + 3, y + 3, w - 6, 2, C.boxText);
  fb.rect(x + 3, y + h - 5, w - 6, 2, C.boxText);
  fb.rect(x + 3, y + 3, 2, h - 6, C.boxText);
  fb.rect(x + w - 5, y + 3, 2, h - 6, C.boxText);
}

export function drawMenuBack(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, 14, C.fg, 4);
  dither(fb, 0, H - 16, W, 16, C.fg, 5);
}
export function drawDim(fb, C) { dither(fb, 0, 0, W, H, C.fg, 2); } // 半网点压暗（暂停叠在剧情帧上）

export function drawTitle(fb, C) {
  drawMenuBack(fb, C);
  if (SPRITES.longdi) fb.blitSprite(UI.title.longdi.x, UI.title.longdi.y, SPRITES.longdi, C.fg, C.bg, true); // 龙荻（左·翻转面向右）
  if (SPRITES.lvyi) fb.blitSprite(UI.title.hero.x, UI.title.hero.y, SPRITES.lvyi, C.fg, C.bg);               // 女鬼（右）
  const p = UI.title.panel;
  fb.rect(p.x, p.y, p.w, p.h, C.fg);              // LOGO 牌匾（亮底）
  fb.rect(p.x + 4, p.y + 4, p.w - 8, p.h - 8, C.bg); // 内墨（标题字叠在此，色 C.fg）
  dashRect(fb, p.x + 7, p.y + 7, p.w - 14, p.h - 14, C.fg);
}

// 通用竖列菜单面板（主菜单/暂停共用）。geo 取 UI.menu 或 UI.pause。
export function drawMenuPanel(fb, C, geo, sel) {
  panelBox(fb, C, geo.x, geo.y, geo.w, geo.h);
  const t = geo.tab;
  fb.rect(t.x, t.y, t.w, t.h, C.boxFill);
  fb.rect(t.x, t.y, t.w, 2, C.boxText);
  fb.rect(t.x, t.y, 2, t.h, C.boxText);
  fb.rect(t.x + t.w - 2, t.y, 2, t.h, C.boxText);
  if (sel != null && sel >= 0) fb.rect(geo.x + 6, geo.firstY + sel * geo.lineH - 4, geo.w - 12, geo.lineH - 2, C.boxText); // 选中反色条
}

export function drawTextPage(fb, C, portrait) {
  drawMenuBack(fb, C);
  const f = UI.text.frame;
  dashRect(fb, f.x, f.y, f.w, f.h, C.fg);
  dashRect(fb, f.x + 2, f.y + 2, f.w - 4, f.h - 4, C.fg);
  const t = UI.text.tab;
  fb.rect(t.cx - (t.w >> 1), t.y, t.w, t.h, C.fg); // 标题贴片（标题字叠此，色 C.bg）
  if (portrait && SPRITES[portrait]) {             // 角落立绘（如关于页的像素红莉栖）
    const spr = SPRITES[portrait];
    fb.blitSprite(f.x + f.w - spr.w - 8, f.y + f.h - spr.h, spr, C.fg, C.bg);
  }
}

export function drawSaveCards(fb, C, cards, sel) {
  drawMenuBack(fb, C);
  const S = UI.saves;
  for (let k = 0; k < 3; k++) {
    const y = S.ys[k], on = sel === k, ink = on ? C.boxFill : C.fg;
    if (on) fb.rect(S.cardX, y, S.cardW, S.cardH, C.boxText);
    dashRect(fb, S.cardX, y, S.cardW, S.cardH, ink);
    dashRect(fb, S.badge.x, y + ((S.cardH - S.badge.h) >> 1), S.badge.w, S.badge.h, ink);
  }
  if (sel === 3) fb.rect(S.backX, S.backY - 3, 92, 22, C.boxText); // 返回行高亮
}

export function drawEnding(fb, C) {
  fb.clear(C.bg);
  dither(fb, 0, 0, W, H, C.fg, 6);
  const b = UI.ending.box;
  dashRect(fb, b.x, b.y, b.w, b.h, C.fg);
  dashRect(fb, b.x + 2, b.y + 2, b.w - 4, b.h - 4, C.fg);
}

export function drawConfirm(fb, C, sel) {
  const b = UI.confirm.box;
  panelBox(fb, C, b.x, b.y, b.w, b.h);
  const ox = sel === 0 ? UI.confirm.opt0 : UI.confirm.opt1;
  fb.rect(ox - 32, UI.confirm.optY - 3, 64, 16, C.boxText); // 选中项反色块
}
