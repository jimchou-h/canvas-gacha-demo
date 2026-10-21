# Domain Docs

本项目使用 single-context 布局。根目录的 `CONTEXT.md` 用于稳定的领域术语，`docs/adr/` 用于已经作出的重大架构决策；仅当这些内容实际出现时创建文件。

## Before exploring

- 若 `CONTEXT.md` 存在，先读取并沿用其中术语。
- 若 `docs/adr/` 下有与当前工作相关的决策，先读取并检查是否冲突。
- 若文件暂不存在，直接继续，不把缺失视为错误。

当前抽卡能力的行为规格位于 `openspec/specs/`；已完成变更及任务记录位于 `openspec/changes/archive/2026-10-21-add-canvas-gacha/`。后续新需求应建立新的 OpenSpec change。
