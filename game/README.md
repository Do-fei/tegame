# 重返十七岁 · 垂直切片：共享奶昔

一套像素核心（`core/`），两个平台跑同一个场景。证明"终端 + 网页双端"的技术骨架，并钉死美术/UI 规范。

## 跑起来

**终端版**（真彩半块字符，建议终端窗口 ≥ 130 列 × 50 行）：
```bash
cd game
node term.js
```
- 空格 / →：继续　·　↑↓ 选择，回车确认（也可按 1 / 2）　·　q 退出

**网页版**（Canvas，最近邻放大）：
```bash
cd game
node serve.js
# 打开 http://localhost:8099/web/index.html
```
- 空格 / 点击：继续　·　↑↓ + 回车 / 点击 / 1、2：选择

**自测**（无需 TTY，验证核心+引擎+渲染不报错）：
```bash
node game/term.js --selftest
```

## 结构

```
core/
  palette.js      美术色卡（GBC/NES 暖色）—— 新场景统一从这里取色
  framebuffer.js  平台无关的像素帧缓冲（toANSI 给终端 / toRGBA 给网页）
  art.js          「共享奶昔」场景像素美术 + UI 面板 + 排版坐标 LAYOUT
  scene.js        场景脚本 + 极简对话引擎（say / choice / note）
term.js           终端入口（半块渲染 + 文字叠加 + 键盘）
serve.js          本地静态服务器（正确 MIME）
web/              网页入口（index.html + web.js）
```

## 设计要点

- **像素与文字分层**：背景、立绘、UI 面板都画进帧缓冲（终端半块 / 网页 Canvas）；
  中文对话用真字体叠加在上面，保证可读（终端用真字符、网页用 fillText）。
- **薄荷便签 + 署名诡计**：选「软」分支会把一张署名「董晓丽」的便签夹进 `game.notes`。
  这就是反转一时要逐张改写成「高晓媛」的那叠牌（本切片只演到"存入"，改写演出在后续阶段接上）。
- **她领口的薄荷叶吊坠**：埋在立绘里的隐藏扣子——其实是高晓媛真身的印记。
