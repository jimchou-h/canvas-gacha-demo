# Canvas 抽卡演示 · canvas-gacha-demo

纯浏览器本地运行的星穹幻想抽卡演示：HTML Canvas 2D 手绘卡面、星轨动画与结果总览，没有后端、没有账号、没有付费货币。抽卡结果由本地随机数生成，页面一关就清零。

**在线演示**：<https://jimchou-h.github.io/canvas-gacha-demo/>（推送到 `master` 后由 GitHub Actions 自动构建部署）

## 玩法

- **单抽**与**十连**两个入口，也可以直接轻触画面抽取。
- 抽取瞬间就冻结本次结果，随后播放约 2 秒星轨动画；十连逐张揭晓（每张 380ms）后进入总览，单抽直接展示大卡。
- 动画与揭晓期间可点**跳过**：只改变展示进度，不会重新抽取，看到的一定是同一批结果。
- 星轨在抽到 5★ 时切换为金色强提示（更长尾迹、更多射线）。
- 结果同时写入 `aria-live` 区域，读屏能拿到「N 星 角色名」。

## 概率与卡池

| 稀有度 | 基础概率 | 卡面数 | 卡框 |
| --- | --- | --- | --- |
| 5★ | 1.5% | 3 | 金色，光晕最强 |
| 4★ | 12% | 5 | 紫色 |
| 3★ | 86.5% | 7 | 蓝灰 |

**十连保底**：若十次基础抽取全为 3★，把第 10 张调整为 4★；不跨十连累计，也不做计数器。

卡池共 15 张原创插画：

- **5★**：星轨终焉·艾莉希亚、虚空王座·凯奥斯、潮汐织命·米菈
- **4★**：银月游侠·柯林、霜晶织者·莉妲、雷羽战将·加罗、赤砂剑士·塞芙、熔核匠师·欧伦
- **3★**：星尘学徒·诺恩、流萤哨兵·缇雅、铁芯工兵·巴克、晨风信使·蕾恩、青苔信差·琳、夜巡弩手·德雷、炉火学徒·菲

## 快速开始

需要 Node 20+。

```bash
npm install
npm run dev      # http://localhost:5173/
npm test         # 49 条 Vitest 用例（node 环境，纯逻辑）
npm run build    # tsc --noEmit + vite build，产物在 dist/
npm run preview  # 本地预览构建产物
```

## 技术栈

Vite 5 + TypeScript 5.6（`strict`、`noUncheckedIndexedAccess`、`verbatimModuleSyntax`）+ Canvas 2D，测试用 Vitest 2。没有框架、没有运行时依赖，`sharp` 只在重新压缩素材时用到。

架构上刻意分成两半：

- `src/core/` 是不碰 DOM 的纯逻辑——概率、角色池、画布尺寸与坐标换算、揭晓状态机。全部可测，随机源通过参数注入，所以阈值和保底能被确定性覆盖。
- `src/render/` 只负责绘制，读取 core 产出的状态；`src/main.ts` 是唯一接线 DOM 与 `requestAnimationFrame` 的地方。

## 目录结构

```
src/core/       rarity.ts 概率 · characters.ts 卡池 · layout.ts 尺寸与命中 · reveal-flow.ts 揭晓状态机
src/render/     card.ts 卡面与信息栏排版 · starfield.ts 背景 · starTrail.ts 星轨 · scene.ts 场景分派 · assets.ts 预加载 · perf.ts 测帧面板
test/           8 个文件 49 条用例
public/assets/  15 张 640×960 卡面 JPEG
openspec/       主 specs 与已归档 change（规格唯一来源）
.scratch/       执行票据（一张任务一张票）
docs/agents/    票据与分诊约定
scripts/        optimize-assets.mjs 素材压缩
```

## 渲染性能

星轨阶段每帧只画背景和星轨，两处高开销操作被消掉了：

- 背景层（渐变天空 + 星云 + 140 颗基础星）按 `尺寸 × dpr` 缓存成一张离屏 canvas，每帧一次 `drawImage`；只有 40 颗闪烁星逐帧重绘，并按 4 档 alpha 合批，把 140 次 `fill` 降到最多 4 次。
- 星轨头部的光晕从「每帧新建径向渐变」改成按配色缓存的精灵贴图；尾迹分段同样按 alpha 分档合批，射线从 6–10 次 `stroke` 合成一条路径。

首屏另有两条约束，别退回去（数字是同机、同 1.26MB 负载、DevTools 模拟 4G + 4× CPU 的 Lighthouse 对比）：

- 起帧不等待素材预加载：`src/main.ts` 先排第一帧，再后台拉 15 张卡面。改成 `await preloadCharacters(...)` 再起帧，会把画面排到网络尾部——Speed Index 1.4s → 7.1s、TTI 1.4s → 8.9s。
- 样式内联在 `index.html` 的 `<style>` 里：外链样式表是渲染阻塞资源，多一次 RTT，FCP/LCP 0.7s → 1.3s（Lighthouse 自己标了 741ms）。代价是 dev 下改样式会整页刷新。

想知道自己机器上到底多少帧，加查询参数打开只读面板：

```
http://localhost:5173/?stats
```

面板显示播放时钟（`flight 1234/2000ms`）、fps、帧间隔 mean/p95/max、`jank(>25ms)` 计数，以及 backdrop / trail / cards 三段各自的平均耗时。动画推进按 rAF 时间戳差值计算、不做截断，所以即使在帧回调很慢的环境里，星轨仍然在真实 2 秒处结束。

## 素材与许可

- 页面使用的 15 张卡面是 `public/assets/characters/*.jpg`（640×960，约 1.3MB），已入库，clone 即可运行。
- 原始 PNG（1024×1536，约 40MB）**不入库**。要重新压图或换尺寸：把任意 2:3 插画放到 `assets-src/characters/<id>.png`（文件名需与角色 id 一致），再跑 `node scripts/optimize-assets.mjs`。
- `test/characters.test.ts` 会断言卡池里每张卡面都有对应 JPEG，且 `public/` 下没有未被引用的素材，所以缺图会在测试阶段失败，而不是页面上渲染出空白卡。
- **代码与文档**采用 [MIT](LICENSE)。**卡面插图为 AI 生成**，随本仓库一并提供，仅作为演示素材；如需商用请自行评估生成内容的权利归属。

## 开发流程

这个仓库按 spec-driven 流程开发，规格只有一个来源：

- `openspec/specs/` 是当前生效的行为规格；`openspec/changes/archive/` 保留每个 change 的提案、任务清单与 delta spec。
- `.scratch/<change>/issues/` 是执行票据，一张任务一张票，记录验收标准、测试点与处理过程。
- 提交前跑的门禁：`npx tsc --noEmit`、`npx vitest run`、`npx vite build`、`npx openspec validate --all --strict`。
- UI 表现由人工在浏览器验收，仓库内没有自动化浏览器测试。
- 推送到 `master` 会触发 `.github/workflows/deploy.yml`，构建产物发布到 GitHub Pages。站点挂在 `/canvas-gacha-demo/` 子路径下：构建时 `base` 取该前缀、本地 `vite serve` 取根路径（见 `vite.config.ts`），卡面 URL 在 `src/render/assets.ts` 里按 `BASE_URL` 拼接。Fork 改名时 `base`、`package.json` 的 `homepage` 都要一并调整。

给 AI 代理的约定见 [AGENTS.md](AGENTS.md)，票据与分诊标签的格式见 [docs/agents/](docs/agents/)。

## 已知边界

- 概率与保底是本地 mock，不代表任何真实抽卡服务的数值，也没有跨会话持久化。
- 不做跨十连累计保底、不记录历史抽取次数、没有 UP 卡池与武器池。
- 卡面信息栏在宽度小于 96px 的小卡上会自动降级为「星点 + 短名」，稀有度标签让位给星点数量。
