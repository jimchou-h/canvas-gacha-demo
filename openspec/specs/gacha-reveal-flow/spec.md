# gacha-reveal-flow Specification

## Purpose
TBD - created by archiving change add-canvas-gacha. Update Purpose after archive.
## Requirements
### Requirement: 抽卡结果按阶段揭晓
系统 SHALL 在触发抽卡后先播放约 2 秒的星轨动画，再逐张揭晓抽取结果；一次流程内展示的卡牌 SHALL 与该次生成的结果一致。

#### Scenario: 单抽正常揭晓
- **WHEN** 用户触发单抽并等待动画自然结束
- **THEN** 系统先显示星轨动画，再揭晓本次唯一的卡牌

#### Scenario: 十连正常揭晓
- **WHEN** 用户触发十连并等待动画自然结束
- **THEN** 系统逐张揭晓恰好十张卡牌，随后显示可查看全部十张卡牌的结果总览

### Requirement: 用户可跳过抽卡动画
系统 SHALL 在抽卡动画期间提供可见的跳过入口，跳过时直接显示本次已生成结果，不重新抽取。

#### Scenario: 跳过单抽
- **WHEN** 用户在单抽动画期间选择跳过
- **THEN** 系统停止当前动画并显示原本生成的单张卡牌

#### Scenario: 跳过十连
- **WHEN** 用户在十连动画或逐张揭晓期间选择跳过
- **THEN** 系统停止当前动画并显示原本生成的十张卡牌总览

### Requirement: 抽卡流程状态一致
系统 SHALL 避免同一时间出现相互重叠的抽卡流程，并允许用户在结果展示后再次抽卡。

#### Scenario: 动画中重复触发抽卡
- **WHEN** 用户在一次抽卡尚未结束时再次激活抽卡入口
- **THEN** 系统不生成第二次结果，也不覆盖当前流程的结果

#### Scenario: 结果展示后继续抽卡
- **WHEN** 用户查看完本次结果后重新激活抽卡入口
- **THEN** 系统开始一次新的独立抽卡流程

