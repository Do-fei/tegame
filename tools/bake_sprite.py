#!/usr/bin/env python3
"""彩色立绘 → 抠掉灰底 + 1-bit 两色抖动 → 游戏精灵资源 (.js) + 预览图。
- 若输入图自带透明通道（如「透明抠图」版），直接用它，效果最干净。
- 否则沿整圈边界多点洪水填充抠掉灰底（能跨过灰底渐变）。
精灵用字符行表示：' '=透明, 'K'=墨(ink), 'P'=纸(paper)，渲染时由当前色板上色。
用法: python3 bake_sprite.py <输入图> <输出.js> <预览.png> [高度=104] [ink_hex] [paper_hex]
环境变量 THRESH 控制抠图阈值（默认 42）。
"""
import os
import sys
import json
from PIL import Image, ImageDraw, ImageOps

THRESH = float(os.environ.get('THRESH', '42'))


def hx(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def make_alpha(rgb):
    from collections import deque
    w, h = rgb.size
    px = rgb.load()
    TOL = int(os.environ.get('TOL', '16')) * 3  # 邻接像素的曼哈顿色差上限

    def bglike(p):
        return (max(p) - min(p)) < 34 and max(p) > 90  # 低饱和、不太暗 = 像灰底

    bg = bytearray(w * h)
    q = deque()

    def push(x, y):
        i = y * w + x
        if not bg[i] and bglike(px[x, y]):
            bg[i] = 1
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)
    while q:
        x, y = q.popleft()
        c = px[x, y]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not bg[ny * w + nx]:
                n = px[nx, ny]
                if abs(n[0] - c[0]) + abs(n[1] - c[1]) + abs(n[2] - c[2]) < TOL and bglike(n):
                    bg[ny * w + nx] = 1
                    q.append((nx, ny))
    alpha = Image.new('L', (w, h), 255)
    al = alpha.load()
    for y in range(h):
        for x in range(w):
            if bg[y * w + x]:
                al[x, y] = 0
    return alpha


def main():
    src, out_js, out_png = sys.argv[1], sys.argv[2], sys.argv[3]
    H = int(sys.argv[4]) if len(sys.argv) > 4 else 104
    ink = hx(sys.argv[5]) if len(sys.argv) > 5 else (0x2a, 0x28, 0x20)
    paper = hx(sys.argv[6]) if len(sys.argv) > 6 else (0xef, 0xe6, 0xc3)

    im = Image.open(src)
    rgb = im.convert('RGB')
    if im.mode in ('RGBA', 'LA') and im.convert('RGBA').getextrema()[3][0] < 250:
        alpha = im.convert('RGBA').split()[-1]  # 自带透明
    else:
        alpha = make_alpha(rgb)

    w, h = rgb.size
    W = max(1, round(w * H / h))
    g = ImageOps.autocontrast(rgb.convert('L'), cutoff=2).resize((W, H), Image.LANCZOS)
    gamma = float(os.environ.get('GAMMA', '1'))  # <1 提亮中暗部，给整体偏暗的立绘找回内部结构
    if gamma != 1:
        g = g.point(lambda v: int(255 * ((v / 255.0) ** gamma)))
    a = alpha.resize((W, H), Image.LANCZOS)
    bw = g.convert('1').convert('L')  # Floyd–Steinberg
    bwp, ap = bw.load(), a.load()

    prev = Image.new('RGB', (W, H), paper)
    pp = prev.load()
    rows = []
    for y in range(H):
        r = []
        for x in range(W):
            if ap[x, y] < 128:
                r.append(' ')
            elif bwp[x, y] < 128:
                r.append('K')
                pp[x, y] = ink
            else:
                r.append('P')
                pp[x, y] = paper
        rows.append(''.join(r))

    prev.save(out_png)
    with open(out_js, 'w', encoding='utf-8') as f:
        f.write('// 由 tools/bake_sprite.py 生成：' + src + '\n')
        f.write('export const SPRITE = ' + json.dumps({'w': W, 'h': H, 'rows': rows}, ensure_ascii=False) + ';\n')
    print('baked', W, 'x', H, '->', out_png)


if __name__ == '__main__':
    main()
