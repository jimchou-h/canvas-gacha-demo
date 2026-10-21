# mock-gacha-draw Specification

## Purpose
TBD - created by archiving change add-canvas-gacha. Update Purpose after archive.
## Requirements
### Requirement: 本地随机抽卡
系统 SHALL 在浏览器本地生成抽卡结果，不调用真实抽卡服务；普通独立抽取的基础稀有度概率 SHALL 为 5★ 1.5%、4★ 12%、3★ 86.5%。

#### Scenario: 单抽得到有效结果
- **WHEN** 用户执行一次单抽
- **THEN** 系统按基础概率选定一个稀有度，并从该稀有度的 mock 角色池中生成一张有效卡牌

#### Scenario: 重复抽卡
- **WHEN** 用户完成一次抽卡后再次抽卡
- **THEN** 系统允许继续抽取，不要求账号、货币或购买步骤

### Requirement: 十连至少获得一张高稀有度卡牌
系统 SHALL 为十连生成恰好十张卡牌；若十次基础抽取均为 3★，系统 SHALL 将其中一张调整为至少 4★，以兑现本次十连保底。

#### Scenario: 十次基础抽取均为 3★
- **WHEN** 用户执行十连，且十次基础抽取均为 3★
- **THEN** 最终十张结果中至少一张为 4★ 或 5★

#### Scenario: 十次基础抽取已有高稀有度
- **WHEN** 用户执行十连，且基础抽取已包含 4★ 或 5★
- **THEN** 系统保留该十次基础抽取结果，不再额外替换卡牌

#### Scenario: 连续执行十连
- **WHEN** 用户先后执行多次十连
- **THEN** 每次十连独立满足至少一张 4★ 或以上的约束，不累计跨十连保底计数

