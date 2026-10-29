# 01 - 角色池扩充到 15 张卡面

Status: closed
Task: tasks.md 1.1
capability: mock-gacha-draw
依赖: 无（`add-canvas-gacha` 已归档）

## 端到端目标

新增 6 张原创星穹幻想插画，把角色池从 9 张（5★×2 / 4★×3 / 3★×4）扩到 15 张（5★×3 / 4★×5 / 3★×7），抽取规则与渲染代码不变。

## 验收标准

- [x] 每个稀有度至少 3 张卡面，池规模为 5★×3、4★×5、3★×7。
- [x] 新角色沿用 2:3 竖版构图，卡面绘制不裁切画面。
- [x] 角色 id 全局唯一，名称风格与既有卡面一致（称号·名字）。
- [x] 池中每张卡面都有对应素材文件，缺失即测试失败而不是渲染空白。
- [x] 抽取仍只在所属稀有度内取值，概率与十连保底不变。

## 测试点（Vitest）

- `test/characters.test.ts`：池规模 3/5/7；id 全局唯一；每张卡面的 `public/assets/characters/<id>.jpg` 存在；`drawSingle` 仍只从所选稀有度池取卡。

## 人工浏览器验收

新角色各抽到一次（可用 `?stats` 之外的普通页面反复单抽/十连），核对插画完整、名称与星点正常、5★ 金框与光晕不弱于旧卡；十连总览里出现新角色时小卡短名可读。

## Comments

- 2026-10-29 红灯先行：池规模断言改为 5★×3 / 4★×5 / 3★×7 后失败 → 补齐 6 个角色后 48 tests passed，`tsc --noEmit`、`vite build` 通过。
- 2026-10-29 新角色：5★ 潮汐织命·米菈；4★ 赤砂剑士·塞芙、熔核匠师·欧伦；3★ 青苔信差·琳、夜巡弩手·德雷、炉火学徒·菲。抽取规则、概率、十连保底与揭晓流程未改动。
- 2026-10-29 素材：6 张原始插画为 1024×1536（精确 2:3，`fit: 'cover'` 转换时零裁切），经 `scripts/optimize-assets.mjs` 输出 640×960 JPEG，单张 62–92KB，15 张合计 1.3MB；原始 PNG 留在 gitignore 的 `assets-src/characters/`。
- 2026-10-29 素材完整性：用 Vite 的 `import.meta.glob` 断言「池中每张卡面都有文件」且「public 下不残留未被引用的卡面」，避免为一条测试引入 `@types/node`。
- 2026-10-29 状态：自动化门全绿，dev server 上 6 张新素材均 200；等待人工浏览器验收 → `ready-for-human`，本地 commit，**不推送 → `pending_push`**。
- 2026-10-29 人工浏览器验收：用户在 `http://localhost:5178/` 实抽后回复「可以」，新卡面完整、名称与星级可读，无回归。
- 2026-10-29 验收复核对齐：「不会固定落在同一张卡牌」这条 Scenario 原先只被池规模断言间接支撑，补 `test/characters.test.ts` 的池内分布用例（commit `ab944f0`）后 49 tests 全绿。
- 2026-10-29 关票：`openspec archive` 把「角色池规模与卡面素材」合入 `openspec/specs/mock-gacha-draw/spec.md`（+1 要求，并补上该 capability 的 Purpose），`CONTEXT.md` 增补「角色池」术语；change 归档为 `2026-10-29-expand-character-pool`。本地 commit，**不推送 → `pending_push`**。