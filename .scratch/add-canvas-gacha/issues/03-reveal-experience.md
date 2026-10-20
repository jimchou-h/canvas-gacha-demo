# 03 - 完整揭晓体验

Status: ready-for-agent
Task: tasks.md 3.1
capability: gacha-reveal-flow, canvas-gacha-interface
依赖: 01, 02

## 端到端目标

为单抽与十连加入约 2 秒星轨动画、逐张揭晓与跳过，动画只读取已冻结的结果。

## 验收标准

- [ ] 触发抽卡后立即冻结本次结果，进入 `idle → flight → reveal → summary/result → idle`。
- [ ] `flight` 播放约 2 秒星轨；`reveal` 逐张显示；十连结束进 `summary`，单抽进 `result`。
- [ ] 跳过入口在动画与逐张揭晓期间可见，跳过直接展示同一批结果，不重新抽取。
- [ ] 非空闲状态下重复点击抽卡入口不生成第二次结果，也不覆盖当前结果。
- [ ] 结果展示后可再次发起新的独立抽卡流程。

## 测试点（Vitest，状态机 reducer）

- 单抽：flight → result，帧推进到 2 秒后进入揭晓。
- 十连：flight → reveal ×10 → summary，总览张数与冻结结果一致。
- 两种跳过时机（flight 中、reveal 中）→ 结果与不跳过完全相同。
- 动画中再次触发 → 状态与结果不变（幂等）。

## 人工浏览器验收

正常播放一次十连；在星轨阶段跳过一次；在逐张揭晓阶段跳过一次；动画中连点入口。

## Comments
