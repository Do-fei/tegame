#!/usr/bin/env python3
"""把全体角色原画批量抠图+1-bit 抖动，拼成角色全家福（网格排版）。"""
import os
import sys
from PIL import Image, ImageOps

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bake_sprite import make_alpha

INK = (0x2a, 0x28, 0x20)
PAPER = (0xef, 0xe6, 0xc3)
H = 210
COLS = 7
CELL = 150
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

CHARS = [
    'refs/龙荻_高中立绘.png',
    'refs/龙荻_成年立绘.png',
    'refs/高晓媛_v0.1.png',
    'refs/董小丽_立绘.png',
    'refs/唐可欣_v0.1.png',
    'refs/大飞_v0.1.png',
    'refs/铁罗汉_v0.1.png',
    'refs/友田_v0.1.png',
    'refs/张老师_v0.1.png',
    'refs/马威廉_v0.1.png',
    'refs/绿衣女人_完整立绘.png',
    'refs/鬼童子_正常立绘_透明抠图.png',
    'refs/鬼童子_污染状态立绘.png',
    'refs/小保安_立绘.png',
]


def bake(path):
    im = Image.open(os.path.join(ROOT, path))
    rgb = im.convert('RGB')
    if im.mode in ('RGBA', 'LA') and im.convert('RGBA').getextrema()[3][0] < 250:
        alpha = im.convert('RGBA').split()[-1]
    else:
        alpha = make_alpha(rgb)
    w, h = rgb.size
    W = round(w * H / h)
    g = ImageOps.autocontrast(rgb.convert('L'), cutoff=2).resize((W, H), Image.LANCZOS)
    a = alpha.resize((W, H), Image.LANCZOS)
    bw = g.convert('1').convert('L')
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    op, bwp, ap = out.load(), bw.load(), a.load()
    for y in range(H):
        for x in range(W):
            if ap[x, y] < 128:
                op[x, y] = (0, 0, 0, 0)
            elif bwp[x, y] < 128:
                op[x, y] = INK + (255,)
            else:
                op[x, y] = PAPER + (255,)
    return out


rows = (len(CHARS) + COLS - 1) // COLS
sheet = Image.new('RGB', (COLS * CELL, rows * (H + 24)), PAPER)
for i, p in enumerate(CHARS):
    spr = bake(p)
    cx = (i % COLS) * CELL + (CELL - spr.width) // 2
    cy = (i // COLS) * (H + 24) + 12
    sheet.paste(spr, (cx, cy), spr)
sheet.save(os.path.join(ROOT, 'refs/_cast_sheet.png'))
print('cast sheet saved', sheet.size, 'chars', len(CHARS))
