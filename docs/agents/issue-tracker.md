# Issue tracker: Local Markdown

本项目的执行票据作为 Markdown 文件保存在 `.scratch/`。进行中的需求、规格、设计与任务清单仅保存在对应的 OpenSpec change 目录；`.scratch/` 只承载 `tasks.md` 的执行视图，不存放第二份 spec。

## Conventions

- 每个 change 使用 `.scratch/<change-name>/issues/`。
- 每个任务默认对应一张票，文件名为 `<NN>-<slug>.md`，从 `01` 开始编号；不合并为单一票据文件。
- 每张票注明所对应的 `tasks.md` 条目、验收标准和依赖关系。
- 票据顶部的 `Status:` 行记录分诊状态；可用值见 `triage-labels.md`。
- 讨论与处理记录追加在票据底部的 `## Comments` 下。

## Skill operations

- 当技能要求发布票据时，在 `.scratch/<change-name>/issues/` 新建对应文件。
- 当技能要求读取票据时，读取用户给定的文件路径或编号。
- 在文档阶段不提前创建票据；进入 unified-dev-workflow 阶段 3 并通过其检查点后再发布。
