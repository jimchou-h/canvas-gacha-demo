# 贡献指南

改动前先看这里，能省掉一轮返工。

## 先立规格，再动代码

行为变更走 OpenSpec：在 `openspec/changes/<change-name>/` 写 proposal、tasks 与 delta spec，实现完成后归档并合并进 `openspec/specs/`。`openspec/specs/` 是唯一规格来源，不要在别处再写一份需求。

纯 bug 修复（行为不变）可以直接改，但要在对应票据的 `## Comments` 里写清根因。

## 一张任务一张票

执行票据放在 `.scratch/<change-name>/issues/<NN>-<slug>.md`，顶部 `Status:` 用 [docs/agents/triage-labels.md](docs/agents/triage-labels.md) 里的取值，格式与约定见 [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)。

## 竖切与验证先行

- 每张票交付一条能端到端跑通的路径，不按「先写完 core 再写 render」横向切。
- 先让测试红，再实现到绿。逻辑一律放进 `src/core/`（不碰 DOM、随机源用参数注入），`src/render/` 只做绘制。
- UI 表现需要人工在浏览器确认，本仓库没有自动化浏览器测试；票据里把「人工浏览器验收」写清楚。

## 提交前的门禁

```bash
npx tsc --noEmit
npx vitest run
npx vite build
npx openspec validate --all --strict
```

四条全绿再提 PR。CI 会跑测试与构建（见 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)）。

## 素材

卡池插画统一 2:3 竖版。原始 PNG 不入库，放到 `assets-src/characters/<id>.png` 后跑 `node scripts/optimize-assets.mjs` 生成 `public/assets/characters/<id>.jpg`；卡池与素材的一致性由 `test/characters.test.ts` 把关。
