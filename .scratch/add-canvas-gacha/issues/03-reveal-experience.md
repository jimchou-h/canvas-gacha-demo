# 03 - 完整揭晓体验

Status: closed
Task: tasks.md 3.1
capability: gacha-reveal-flow, canvas-gacha-interface
依赖: 01, 02

## 端到端目标

为单抽与十连加入约 2 秒星轨动画、逐张揭晓与跳过，动画只读取已冻结的结果。

## 验收标准

- [x] 触发抽卡后立即冻结本次结果，进入 `idle → flight → reveal → summary/result → idle`。
- [x] `flight` 播放约 2 秒星轨；`reveal` 逐张显示；十连结束进 `summary`，单抽进 `result`。
- [x] 跳过入口在动画与逐张揭晓期间可见，跳过直接展示同一批结果，不重新抽取。
- [x] 非空闲状态下重复点击抽卡入口不生成第二次结果，也不覆盖当前结果。
- [x] 结果展示后可再次发起新的独立抽卡流程。

## 测试点（Vitest，状态机 reducer）

- `test/reveal-flow.test.ts`：`FLIGHT_DURATION` 落在 1800–2200ms；十连在星轨结束后进入 `reveal` 并逐张推进至 `summary`，卡片数组与冻结结果同一引用；单抽星轨结束直接 `result`。
- 两种跳过时机：星轨中（+900ms）与逐张揭晓中（+2 张）跳过均得 `summary` 且 `cards` 引用与冻结结果相同；与不跳过的自然结束结果 `toEqual`。
- 重复输入：`flight`/`reveal` 期间再次 `requestDraw` 返回同一状态对象，且随机抽取函数调用次数保持为 1（未生成第二次结果）。
- 终态与空闲下时间推进不产生新对象。

## 人工浏览器验收（并入阶段 4 清单）

正常播放一次十连；在星轨阶段跳过一次；在逐张揭晓阶段跳过一次；动画中连点入口确认不重开；抽到 5★ 时星轨为金色强提示。

## Comments

- 2026-10-20 红灯先行：新增 8 条状态机用例，首轮实现即被测试抓到真实缺陷（`reveal` 分支未累加本帧时间，逐张揭晓会卡在第 1 张）→ 修正后 35 tests passed，`tsc --noEmit`、`vite build` 通过。
- 2026-10-20 渲染：星轨按进度绘制头尾与光晕，含 5★ 时切换金色、更长尾迹与更多射线；`reveal` 期间未揭晓槽位显示虚线占位，最新一张按 `revealElapsed` 淡入，保证总览与逐张使用同一网格坐标。
- 2026-10-20 输入：`requestDraw` 在 `flight`/`reveal` 直接返回原状态，`Math.random` 只在真正开抽时被调用，因此重复点击连随机数都不消耗；跳过入口为语义化 HTML 按钮，动画期间才可见。
- 2026-10-20 关票：AC 全过（纯逻辑 + 构建 + dev server 冒烟），本地 commit，**不推送 → `pending_push`**。
