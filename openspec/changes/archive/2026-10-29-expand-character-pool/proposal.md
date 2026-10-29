## Why

首版角色池只有 9 张卡面（5★ 2 张、4★ 3 张、3★ 4 张），连续几次十连就会看到重复角色，5★ 更是二选一，稀有感被稀释。要在不改动抽取规则的前提下扩充卡面，让高稀有度有更多可期待的造型。

## What Changes

- 角色池从 9 张扩到 15 张：5★ 增加 1 张、4★ 增加 2 张、3★ 增加 3 张。
- 新增 6 张原创星穹幻想插画，统一沿用 2:3 竖版构图与既有画风，卡面绘制不裁切。
- 每个稀有度至少 3 张卡面，保证该稀有度被抽到时不会连续重复同一角色。
- 新增素材完整性校验：池中每张卡面的插画文件必须存在，缺失即在测试阶段失败。
- 抽取规则、概率、十连保底、揭晓流程均不变。

## Capabilities

### New Capabilities

无。

### Modified Capabilities

- `mock-gacha-draw`: 角色池的规模、稀有度分布与卡面素材完整性成为可验收要求。

## Impact

- `src/core/characters.ts` 的角色池常量与 `test/characters.test.ts` 的池规模断言。
- `assets-src/characters/`（gitignore 的原始 PNG）与 `public/assets/characters/`（构建产物 640×960 JPEG）各新增 6 个文件；`scripts/optimize-assets.mjs` 负责转换。
- 不新增依赖、不改动渲染与状态机代码。
