// 平台无关的「像素帧缓冲」：游戏逻辑只往这里画像素，
// 终端 / 网页各自把同一块缓冲显示出来。这是「一套核心、两个平台」的关键。
export class Framebuffer {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8ClampedArray(w * h * 3); // RGB
  }

  clear(c) {
    for (let i = 0; i < this.w * this.h; i++) {
      this.data[i * 3] = c[0];
      this.data[i * 3 + 1] = c[1];
      this.data[i * 3 + 2] = c[2];
    }
  }

  px(x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.data[i] = c[0];
    this.data[i + 1] = c[1];
    this.data[i + 2] = c[2];
  }

  rect(x, y, w, h, c) {
    for (let yy = 0; yy < h; yy++)
      for (let xx = 0; xx < w; xx++) this.px(x + xx, y + yy, c);
  }

  get(x, y) {
    const i = (y * this.w + x) * 3;
    return [this.data[i], this.data[i + 1], this.data[i + 2]];
  }

  // 贴 1-bit 精灵：rows 里 'K'=墨, 'P'=纸, ' '=透明；上色用当前色板。flip=true 水平镜像。
  blitSprite(sx, sy, spr, ink, paper, flip) {
    for (let y = 0; y < spr.h; y++) {
      const row = spr.rows[y];
      for (let x = 0; x < spr.w; x++) {
        const ch = row[flip ? spr.w - 1 - x : x];
        if (ch === 'K') this.px(sx + x, sy + y, ink);
        else if (ch === 'P') this.px(sx + x, sy + y, paper);
      }
    }
  }

  // 终端渲染：上半块 ▀，前景色=上像素、背景色=下像素 → 一个字符格 = 上下两个像素
  toANSI() {
    let out = '';
    for (let y = 0; y < this.h; y += 2) {
      for (let x = 0; x < this.w; x++) {
        const t = (y * this.w + x) * 3;
        const b = ((y + 1) * this.w + x) * 3;
        out += `\x1b[38;2;${this.data[t]};${this.data[t + 1]};${this.data[t + 2]}m` +
               `\x1b[48;2;${this.data[b]};${this.data[b + 1]};${this.data[b + 2]}m▀`;
      }
      out += '\x1b[0m\n';
    }
    return out;
  }

  // 网页渲染：转成 RGBA 喂给 ImageData
  toRGBA() {
    const out = new Uint8ClampedArray(this.w * this.h * 4);
    for (let i = 0; i < this.w * this.h; i++) {
      out[i * 4] = this.data[i * 3];
      out[i * 4 + 1] = this.data[i * 3 + 1];
      out[i * 4 + 2] = this.data[i * 3 + 2];
      out[i * 4 + 3] = 255;
    }
    return out;
  }
}
