# AI 协作规范

本文档定义 caomei-ui 的 PDTFC+ 工作流、搜索优先原则、交接协议与验证矩阵。`AGENTS.md` 为权威事实源，本文档承载细则。

## 1. PDTFC+ 工作流

| 阶段 | 主责 | 关键动作 | 退出条件 |
|------|------|----------|----------|
| **P (Plan)** | `@product-manager` / `@full-stack-master` | 需求澄清、范围判定、验收标准、`todo.md` 对齐、受影响文件清单 | 需求明确、验收标准可验证 |
| **D (Do)** | `@full-stack-master` / `@frontend-developer` | 按方案实现，遵守开发规范 | 自检 `lint` + `typecheck` + 定向测试通过 |
| **A (Audit)** | `@code-reviewer` | Review Gate，输出 Pass/Reject 与问题分级 | 所有 blocker 关闭且验证矩阵满足 |
| **V (Validate)** | `@ui-validator` | 浏览器渲染、响应式、主题、暗色验证 | 验证通过或显式说明跳过理由 |
| **T (Test)** | `@test-engineer` | 测试补强与回归验证 | 测试通过且覆盖率不回退 |
| **F (Finish)** | `@documentation-specialist` + `conventional-committer` | 文档与规划同步、单次提交 | 文档同步、提交完成（不 push） |

### 1.1 阶段去重

- **P**：`@product-manager` 主责，其他角色只提供上下文。
- **D**：同一事项同一时点只有一个实现主责。
- **A**：`@code-reviewer` 是唯一 Review Gate，开发者自检不等于审计通过。
- **V**：`@ui-validator` 主责，`@test-engineer` 不替代可视审计。
- **T**：`@test-engineer` 主责，`@code-reviewer` 只审测试质量。
- **F**：`@documentation-specialist` 与 `@product-manager` 负责收口，不回写未确认结论。

## 2. 搜索优先原则 (Search-First)

遇到以下情况**必须先搜索**，禁止仅凭训练记忆生成答案：

- 同一问题修复失败 >= 2 次，或根因不明确；
- 涉及不熟悉的库/框架/API、跨平台差异或安全合规判断；
- 需要外部文档、版本迁移指南或社区方案支撑决策。

搜索要求：多语言检索、多源交叉验证、工具降级备选；优先采纳 L1（官方文档）与 L2（权威社区）来源，标注来源版本与时间。

适用场景举例：Reka UI primitive 行为、tsdown 构建配置、Vue 3.6 兼容性、semantic-release 插件配置。

## 3. 交接协议

- 交接必须携带：任务目标、验收标准、受影响文件清单、已完成阶段、已验证证据、未覆盖边界。
- 审计 prompt 必须声明 `audit-depth`（`quick` / `standard` / `deep`），未声明时按 `deep` 执行。
- 复审只审修复点 diff，不重复全量审查。
- 提交必须晚于 Review Gate Pass：先提交后补审判 blocker；已发生的补救只能用新提交（不改写历史、不推送）。
- 审计证据必须与最终 revision 对齐：源码（含 V 阶段后的 CSS 修复）变更后须重跑 `pnpm build` 与浏览器验证并更新证据，陈旧证据判 blocker。
- UI 类改动可在 D 阶段预先用 `@ui-validator` 采集浏览器证据并随审计提交，以满足 Review Gate 对 UI 证据的要求；正式 V / T / F 阶段仍须在 A Pass 后进入。
- 批次粒度阈值见 [规划规范 §5](./planning.md#5-任务粒度约束)；含 barrel `index.ts` / 类型 / 测试的组件需为该批保留「仅本批导出」的中间版本（或按提交分步添加导出），保证每步可构建。
- `docs/**` 未纳入 `vue-tsc`（见 [文档与演示站设计 §9](../design/documentation-site.md)）；文档示例访问插槽未声明字段等类型问题只能在 Review 实测暴露。

## 4. 验证矩阵

见 [测试规范 - 验证矩阵](./testing.md#5-验证矩阵)。任何阶段不得用「已本地验证」替代 Review Gate 结论。

## 5. 失败自检

- 连续 3 次同一方案失败时，停止重跑，切换推理模式（根因分析 / 搜索优先）后再继续。
- 发现新事项时先判断是否在当前验收范围；除非阻塞当前交付，否则记录到 backlog，不静默扩大范围。

## 6. Session 协作

- `.session/`（git-ignored）承载任务态：`current-task.yaml`（进度与认知状态）、`runtime-state.json`（运行快照）、`wisdom.md`（跨 session 发现）。权威来源以 `current-task.yaml` 的 `cognitive` 为准。
- 开局恢复与收尾更新的完整步骤见 `todo-manager` skill，本条不重复定义；失败切换见 §5。
- wisdom 活跃条目 >= 20 时执行蒸馏，详见 [Session Wisdom 蒸馏机制](../design/governance/session-wisdom-distillation.md)。

## 7. 反模式

- 未声明验收标准就开工。
- 跳过 Review Gate 直接提交。
- 用「测试通过」等同于「没有风险」。
- 在注释/测试名中写入规划编号（`T001`、`P1-1` 等）。
- 擅自扩大范围或重构无关代码。
