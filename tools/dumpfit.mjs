// 临时：把某场景某步的帧缓冲按 D 倍降采样后导出 PPM，供把关终端缩放后的画面质量。
// 用法：node tools/dumpfit.mjs <sceneId> <stepAdvance> <D> <out.ppm>
import { Framebuffer } from '../game/core/framebuffer.js';
import { drawFrame, W, H } from '../game/core/art.js';
import { Game, getView } from '../game/core/scene.js';
import { writeFileSync } from 'node:fs';

const [, , sceneId = 'fin_reunion', adv = '0', Ds = '4', out = '/tmp/fit.ppm'] = process.argv;
const D = parseInt(Ds, 10);

const g = new Game();
g.goto(sceneId);
for (let k = 0; k < parseInt(adv, 10); k++) { if (g.isChoice()) { g.sel = 0; g.choose(); } else g.advance(); }
const fb = new Framebuffer(W, H);
drawFrame(fb, getView(g));

// 降采样 D 倍（取每 D×D 块中心像素），导出 P6 PPM
const ow = Math.floor(W / D), oh = Math.floor(H / D);
const buf = Buffer.alloc(ow * oh * 3);
for (let oy = 0; oy < oh; oy++)
  for (let ox = 0; ox < ow; ox++) {
    let sx = ox * D + (D >> 1); if (sx >= W) sx = W - 1;
    let sy = oy * D + (D >> 1); if (sy >= H) sy = H - 1;
    const si = (sy * W + sx) * 3, di = (oy * ow + ox) * 3;
    buf[di] = fb.data[si]; buf[di + 1] = fb.data[si + 1]; buf[di + 2] = fb.data[si + 2];
  }
writeFileSync(out, Buffer.concat([Buffer.from(`P6\n${ow} ${oh}\n255\n`), buf]));
console.log('wrote', out, ow + 'x' + oh, 'sceneId=' + sceneId, 'step=' + g.i, 'D=' + D);
