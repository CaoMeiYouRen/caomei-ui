---
name: code-reviewer
description: 审查当前 git 变更、PR、提交范围、技能定义文件、架构调整或安全敏感代码时使用。输出结构化 Review Gate 结论（Pass/Reject）、问题分级（blocker/warning/suggest）、最低验证矩阵、证据链与复查基线。覆盖正确性、安全、架构、SOLID、可删除代码、性能、异常处理与测试风险；默认只输出 review，不直接修改代码。用户提到 review、code review、PR 审查、deep review、review gate、merge ready、blocker、evidence、pass、reject、SOLID、架构审查时都应触发。

metadata:
  internal: false
---

# Code Reviewer

铁律：先给 Review Gate 结论、阻塞原因和复查基线，再给摘要。不要因为测试通过、代码能跑或改动量小，就跳过正确性、安全和架构审查。没有最低验证证据，不得给 `Pass`。

## 核心概念

- `Pass` / `Reject` 是 **Gate 结论**；`blocker` / `warning` / `suggest` 是**问题分级**，二者不能混用。
- 文档、规划、配置、脚本与测试代码同样属于正式审查对象，不能因为"不是业务代码"而跳过。

## 工作流

- [ ] Step 1: 建立审查上下文 ⚠️ REQUIRED
    - [ ] 1.1 读取 git 状态、diff 范围和受影响文件。
    - [ ] 1.2 确认入口、关键路径和高风险区域，如鉴权、数据写入、外部调用、配置变更。
    - [ ] 1.3 如果没有 diff，明确告诉用户并询问是否改看 staged changes 或指定范围。
    - [ ] 1.4 **diff 规模核验**：统计变更文件数与新增行数（`git diff --stat`）。超过阈值（默认 10 文件或 800 行新增，项目可调整）时，要求调用方说明批次拆分依据；未拆分且无正当理由 → `Reject`。
- [ ] Step 2: 判定改动类型与最低验证要求 ⚠️ REQUIRED
    - [ ] 2.1 先确定变更类型，再映射到最低验证矩阵（见下方"最低验证矩阵"）。
    - [ ] 2.2 代码改动默认至少包含 lint 和 typecheck；文档改动补链接和路径检查。
    - [ ] 2.3 测试按风险选择定向/全量/coverage/E2E，不一刀切。
    - [ ] 2.4 若实际证据低于最低层级，直接判定为 `Reject`，而不是"暂时通过"。
- [ ] Step 2.5: 按 audit-depth 分配审查深度 ⚠️ REQUIRED（控制用时）
    - [ ] 2.5.1 审查投入与改动风险匹配，档位与时间盒以 [AI 协作规范 §3.1 审计调用协议](../../../docs/standards/ai-collaboration.md)为唯一权威；调用方未声明 `audit-depth` 时按 `deep` 防御执行。
    - [ ] 2.5.2 **轮次与范围**：按 [AI 协作规范 §3.4](../../../docs/standards/ai-collaboration.md) 执行——单条目默认最多 2 轮；第 2 轮仍 Reject 时只列 blocker、warning/suggest 转 follow-up；复审范围冻结在修复点与直接受影响面，同类别全库排查等新范围记 follow-up 不阻断。
    - [ ] 2.5.2 证据优先采信：调用方提供的已查证事实（实验证据、测试结果、源码行号引用）直接采用，翻源码仅限需要最终实锤且无外部参考的场景。
    - [ ] 2.5.3 收敛策略（不依赖时间感知）：审查输出固定为"audit-depth 审查范围内可交付的结论 + 未覆盖边界"，宁可给 `Reject`（附待补证据清单）也不无限深挖。
    - [ ] 2.5.4 复审只审修复点：第 2+ 轮只复查上轮问题编号对应的修复点 diff 与受影响断言，不得重读全量 diff。
    - [ ] 2.5.5 并发分区（仅大改动，触发条件与汇总规则见 [AI 协作规范 §3.2](../../../docs/standards/ai-collaboration.md)）：被分区的任务只对本分区范围独立出结论。
    - [ ] 2.5.6 用时反馈由调用方事后实测：审计方不自报时长、不检查时间。
- [ ] Step 3: 加载约束与相关资料 ⚠️ REQUIRED
    - [ ] 3.1 优先读取与改动直接相关的根目录文档、配置文件和模块实现，而不是假设存在 docs/。
    - [ ] 3.2 如果改动涉及 skills/*/SKILL.md、agents/*.agent.md 或 AGENTS.md，额外加载 skill-creator，按技能设计规范审查触发面、工作流和资源布局。
- [ ] Step 4: 收集并延续审查证据
    - [ ] 4.1 默认把临时审查记录写入 `artifacts/review-gate/`（纳入 `.gitignore`），文件名 `<date>-<scope>.md`。
    - [ ] 4.2 按 [evidence-template.md](./references/evidence-template.md) 预填与延续：首轮创建，多轮 review 复用同一份记录，按"第 1 轮"、"第 2 轮"追加，保留未关闭问题编号（RG-B/W/S 系列）与复查结论。
- [ ] Step 5: 进行结构化审查
    - [ ] 5.1 使用本目录 references/solid-checklist.md 检查职责边界、扩展点和耦合度。
    - [ ] 5.2 使用本目录 references/security-checklist.md 检查鉴权、注入、密钥泄露、日志和资源滥用风险。
    - [ ] 5.3 使用本目录 references/code-quality-checklist.md 检查错误处理、边界条件、性能与可维护性。
    - [ ] 5.4 使用本目录 references/removal-plan.md 判断冗余代码是可立即删除，还是需要后续迭代计划。
    - [ ] 5.5 当用户要求 deep review、SOLID review 或 senior review 时，必须同时覆盖性能热点、异常处理、边界条件和删除计划，而不是只做浅层意见汇总。
    - [ ] 5.6 必查项（所有深度均适用）：规范单点声明（审查治理定义时检查是否重复抄写权威文档完整条款，应一行链接引用）；供应链信任边界（新依赖/MCP/外部 skill 引入时检查来源验证与版本钉定）；流程编号标记（新增注释与测试名不得含规划/任务/审计编号如 `T405`、`P1-1`，例外仅真实常量与带文档路径的导航指针）。
    - [ ] 5.7 优先寻找会阻塞放行的问题，而不是按文件顺序复述 diff。
    - [ ] 5.8 **宿主页面副作用（浮层 / portal 改动必查）**：确认改动不会让页面发生意料之外的变化。对照 `testing.md §5.1`（浮层页面稳定性）核验证据：测量集必须含 fixed / `100%` 视口元素与遮罩；遮罩未完整覆盖、`in-flow` 位移、超出「实测滚动条宽的容差」的 fixed 位移均判为 blocker；滚动条消失导致的 fixed 元素固有宽度变化属已知预期。
    - [ ] 5.9 **文档批量改写的完整性（必查）**：改动含「批量替换 / 脚本改写 / 大段删除」的文档时，核验目标文件**未被写空或截断**——空 `.md` 对 `lint-md`、链接与行数检查全部放行，是已知门禁盲区。核验方式：`pnpm docs:check:integrity`（空文档 / 围栏失衡 / 孤立表格行，均为不依赖 HEAD 的硬检查）+ `git diff --stat` 删除量与声明的清理意图比对（缩减告警依赖「工作区 vs HEAD」，**洁净检出 / 已提交状态下不触发**，不能作为截断类的唯一证据）；文件被写空而改动声明未提及时判 `blocker`。详见 [code-quality-checklist.md](./references/code-quality-checklist.md) 的「文档批量改写的完整性」。
- [ ] Step 6: 判定严重级别 ⚠️ REQUIRED
    - [ ] 6.1 blocker：明显 correctness bug、安全漏洞、关键验证缺失、与规范冲突、会阻塞提交。
    - [ ] 6.2 warning：较高回归风险、测试覆盖不足、结构边界模糊或证据不完整。
    - [ ] 6.3 suggest：非阻塞的可维护性、可读性、删除计划或后续优化建议。
    - [ ] 6.4 兼容映射：blocker ≈ P0/P1、warning ≈ P2、suggest ≈ P3。
- [ ] Step 7: 输出审查结果 ⚠️ REQUIRED
    - [ ] 7.1 只有所有 blocker 关闭且最低验证矩阵满足时，才允许给 `Pass`。
    - [ ] 7.2 `Reject` 必须明确写出失败原因、缺失证据、待修问题和复查基线。
    - [ ] 7.3 对多轮 review，必须说明"本轮新增问题""本轮已关闭问题""仍待复查问题"。
    - [ ] 7.4 如果无问题，也要说明检查范围与残余风险。
- [ ] Step 8: 确认后续动作
    - [ ] 8.1 默认停在 review，不直接改代码。
    - [ ] 8.2 只有用户明确要求修复时，才进入实现阶段。

## 最低验证矩阵

任何变更都必须按"验证层级 + Review Gate"判断是否可以放行：

| 改动类型 | 最低验证 |
|----------|:--------:|
| 文档 / 规划 | lint:md（或链接路径检查）+ RG |
| 纯逻辑 / 工具函数 / 服务层 | lint + typecheck + 定向测试 + RG |
| API / 鉴权 / 数据模型 | lint + typecheck + 定向测试 + RG（关键写路径升级到流程验证） |
| UI 组件 / 页面交互 | lint + typecheck + 测试 + 浏览器验证（浮层 / portal 改动含宿主页面稳定性，见 `testing.md §5.1`）+ RG |
| 修复型 Hotfix | lint + typecheck + 复现与修复后结果 + RG |
| 配置 / 依赖 / CI / 技能与 agent 定义 | lint + typecheck + 定向验证 + RG |

> 本矩阵为通用默认值，项目可在 AGENTS.md 中按自身需要调整。没有 RG 结论的变更只能视为"进行中"，不能视为已完成。

## 审计侧执行规则（audit-depth）

`audit-depth` 分级、时间盒、**轮次上限与范围冻结**（§3.4）与调用方声明要求以 [AI 协作规范 §3.1 / §3.4](../../../docs/standards/ai-collaboration.md)为唯一权威，本技能不重复抄写；审计侧执行规则（证据优先采信、收敛策略、复审只审修复点、新范围转 follow-up、并发分区、不自报时长、时间盒核验）以 Step 2.5 为准。

## 输出格式

```markdown
## Review Gate
- 结论: Pass | Reject
- 改动类型:
- 最低验证要求:
- 审查轮次:
- audit-depth:（调用方声明 + 本轮实际执行档位）
- 时间盒:（计算依据见 AI 协作规范 §3.1 / §3.2；实测用时与是否超时由调用方回填）
- 失败原因或通过条件:
- 复查基线:

## Findings
### blocker
1. [path/to/file.ext] 标题
    - 风险
    - 修复方向

### warning

### suggest

## 验证证据
- 已执行验证:
- 结果摘要:
- 未覆盖边界:
- 后续补跑计划:
```

## 技能文件专项审查

当改动涉及技能体系时，额外检查：

- description 是否真的能触发技能，而不是抽象介绍。
- 正文是否具备铁律、工作流、确认门、反模式和交付前检查。
- references/、scripts/、assets/ 是否职责清晰，是否存在跨目录重复定义。
- 是否保留了兼容别名，以及 canonical skill 是否唯一明确。
- 如果技能刚经历模板化重构，是否通过 git diff 或提交历史保留了旧版中的项目特化规则。
- skill / agent 改动是否保持唯一事实源，无重复抄写权威文档完整条款。

## 深度审查模式

当用户要求 deep review、code review expert 或 senior review 时：

- 使用 references/solid-checklist.md 审查职责边界、扩展性与耦合。
- 使用 references/security-checklist.md 审查鉴权、注入、密钥、SSRF、路径问题和竞态。
- 使用 references/code-quality-checklist.md 审查 swallowed exceptions、async error、N+1、缓存和边界条件。
- 使用 references/removal-plan.md 判断死代码是立即可删还是需要迁移计划。
- 解释为什么这是结构性风险，而不是只给表面建议。

## 确认门

- 没有用户确认时，不直接实现审查意见。
- 审查范围过大时，先和用户确认是全量 review 还是重点 review。

## 反模式

- 只给笼统评价，如"看起来不错""代码质量还行"。
- 按文件顺序复述 diff，而不是提炼真正的问题。
- 用"可能"掩盖已经足够明确的风险。
- 审查技能文件时，继续沿用旧模板标准而忽略 skill-creator。
- 只写"已审查通过"而不说明依据。
- 只跑 lint / typecheck 就给所有改动 `Pass`。
- 把问题分级当成最终 Gate 结论，或把 warning 写成"已通过"。
- 审查文档、脚本、配置、技能文件时不补充对应的最小验证。
- 没有复查基线，导致多轮 review 无法对账。
- 超限 diff 未核对拆分依据就放行。

## 交付前检查

- [ ] Review Gate 结论（Pass/Reject）与问题分级（blocker/warning/suggest）分离清晰。
- [ ] 最低验证矩阵已核对，证据缺失已导致 Reject 而非"暂时通过"。
- [ ] audit-depth 与时间盒已由调用方声明，审查范围与深度匹配。
- [ ] 轮次未超上限（§3.4）；复审未引入新范围，新发现已转 follow-up。
- [ ] 多轮 review 已按问题编号给出"本轮新增/已关闭/仍待复查"。
- [ ] 证据记录已写入 artifacts/review-gate/（如适用）。
- [ ] Findings 排在总结前面。
- [ ] 每个阻塞问题都说明了风险和修复方向。
- [ ] 已覆盖正确性、安全、架构、性能和测试风险。
- [ ] 如果审查了技能文件，已按 skill-creator 规范补充设计审查。
- [ ] 未经用户确认，不包含自动实施修改。
