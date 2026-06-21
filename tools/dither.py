#!/usr/bin/env python3
"""把彩色立绘降成 1-bit 两色抖动（halfmoon 风）。
用法: python3 dither.py <输入图> <输出图> [目标高度] [ink_hex] [paper_hex]
默认色板: ink=#2a2820 (炭黑) / paper=#efe6c3 (米黄)
"""
import sys
from PIL import Image, ImageOps


def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def main():
    src = sys.argv[1]
    dst = sys.argv[2]
    H = int(sys.argv[3]) if len(sys.argv) > 3 else 256
    ink = hex2rgb(sys.argv[4]) if len(sys.argv) > 4 else (0x2a, 0x28, 0x20)
    paper = hex2rgb(sys.argv[5]) if len(sys.argv) > 5 else (0xef, 0xe6, 0xc3)

    im = Image.open(src).convert('L')
    w, h = im.size
    im = im.resize((round(w * H / h), H), Image.LANCZOS)
    im = ImageOps.autocontrast(im, cutoff=2)
    # Floyd–Steinberg 抖动到 1-bit，再上两色
    bw = im.convert('1').convert('L')
    out = ImageOps.colorize(bw, black=ink, white=paper)
    out.save(dst)
    print('saved', dst, out.size)


if __name__ == '__main__':
    main()
