# 01 - 单抽可体验路径

Status: closed
Task: tasks.md 1.1
capability: canvas-gacha-interface, mock-gacha-draw
依赖: 无

## 端到端目标

在空仓库建立可本地运行的 Vite + TypeScript 单页，浏览器打开即能用鼠标或触控完成一次单抽，画出一张带原创插画、角色名称和星级的卡牌。

## 验收标准

- [x] `npm run dev` 启动后页面显示星穹幻想主题画面、单抽入口，3★/4★/5★ 视觉层级可辨识。
- [x] 点击或触控单抽入口后，最终显示一张本次抽到的卡牌，含插画、名称、星级。
- [x] 稀有度概率为 5★ 1.5%、4★ 12%、3★ 86.5%，随机源可注入。
- [x] 角色池按稀有度组织，抽中稀有度后从对应池选角色，允许重复抽取。
- [x] Canvas 逻辑坐标由 CSS 显示尺寸映射，设备像素比按上限缩放；常见竖屏手机视口下入口与结果可见。

## 测试点（Vitest，纯逻辑红灯先行）

- 阈值边界：`test/rarity.test.ts` 覆盖 0 / 0.0149 / 0.015 / 0.1349 / 0.135 / 0.865 / 0.999999。
- 角色池映射：`test/characters.test.ts` 覆盖三个池规模与稀有度取值。
- 视口换算与命中区域：`test/layout.test.ts`、`test/hit-area.test.ts` 覆盖 dpr 上限、取整与坐标映射。

## 人工浏览器验收（并入阶段 4 清单）

桌面与手机（DevTools 竖屏模拟）各抽一次，确认卡面可读、触控命中。

## Comments

- 2026-10-20 红灯先行：先提交 4 个测试文件（模块缺失，3 files failed）→ 实现 `src/core/{rarity,characters,layout}.ts`、`src/render/{assets,starfield,card,scene}.ts`、`src/main.ts` 后 17 tests passed，`tsc --noEmit` 与 `vite build` 均通过。
- 2026-10-20 素材：ImageGen 生成 9 张原创角色插画（5★×2、4★×3、3★×4），原图 25MB 保留在本地 `assets-src/`（已 gitignore），经 `scripts/optimize-assets.mjs`（sharp）压至 640×960 JPEG，合计 800KB。
- 2026-10-20 关票：AC 全过（纯逻辑 + 构建），commit 已落本地仓库；按用户选择 **不推送远端 → `pending_push`**。人工浏览器项转交阶段 4 验收清单。
- 2026-10-20 阶段 4 人工验收发现缺陷：桌面十连总览的大卡上「三星 · 常态」标签行压到卡框下沿（名称行同样贴近）。根因是信息栏三行用固定比例偏移排布，而字号设有可读性下限，卡片越大下限越不起作用、比例偏移却会超出信息栏高度。修复：抽出 `plateLayout(box)` 纯函数，先量「星点行 + 名称 + 标签」总高度再在信息栏内垂直居中；总高度放不下时先去掉标签行，仍放不下则压缩名称字号。回归由 `test/card-plate.test.ts` 锁住（40–360px 及 4 种视口的总览卡面：不出框、不重叠、星点行不超宽）。commit `93bda28`。
