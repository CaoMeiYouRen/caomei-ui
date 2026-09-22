# Session Wisdom 蒸馏机制

> 将 `.session/wisdom.md` 中的临时知识点定期提纯为永久文档，解决跨机器丢失、内容膨胀与过时残留问题。
> 参照 momei / dependfix 的同类机制，按 caomei-ui 的单包结构适配。

## 1. 载体与目标

`.session/` 是 **git-ignored** 的任务态目录，用于跨 session 恢复上下文：

| 文件 | 作用 |
|------|------|
| `.session/current-task.yaml` | `active_plan` / `progress`（completed / in_progress / blocked_on）/ `next_steps` / `cognitive`（**失败与推理模式的权威来源**） |
| `.session/runtime-state.json` | 运行快照：`last_verification` 等 |
| `.session/wisdom.md` | 跨 session 值得复用的发现 |

> 权威来源约定：失败计数与推理模式以 `current-task.yaml` 的 `cognitive` 为准；`runtime-state.json` 只保存运行快照，不重复作为权威。

`todo.md` 负责阶段跨度（周），`.session/current-task.yaml` 负责 session 跨度（小时），两者同步不替代。相关流程见 `todo-manager` skill 与 `@full-stack-master` agent。

目标：有价值的跨 session 发现统一沉淀到 `docs/`，避免仅本地留存、随 session 膨胀与过时残留，使其在所有分支与机器可查。

## 2. 蒸馏触发条件

满足任一即触发：

| 条件 | 阈值 | 说明 |
|------|------|------|
| 条目数阈值 | 活跃条目 >= 20 | 活跃条目指「当前条目 (Active)」段内未蒸馏条目 |
| 时间阈值 | 距上次蒸馏 > 30 天 | 即使条目少也定期审视 |
| 阶段归档 | 当前 Phase 完成归档时 | 随阶段收口检查一次 |
| 用户主动触发 | 用户说「蒸馏 wisdom」「整理 wisdom」 | 按需执行 |

## 3. 条目分类与结论

| 标签 | 迁移目标 | 示例 |
|------|----------|------|
| `[bug]` | `docs/design/governance/` | 已稳定修复的陷阱 |
| `[pattern]` | `docs/standards/` 或 `docs/design/` | 可复用的实现/测试模式 |
| `[decision]` | `docs/design/` | 影响后续方向的选型 |
| `[tradeoff]` | `docs/design/` | 取舍与已知预期基线 |
| `[env]` | `docs/guide/` 或 `docs/standards/` | 环境/工具链配置 |
| `[test]` | `docs/standards/testing.md` | 可复用测试写法 |
| `[process]` | `docs/standards/ai-collaboration.md`、`docs/standards/testing.md` 或 `docs/design/` | 协作/评审/验证流程 |
| `[dependency]` | `docs/standards/development.md` 或 `docs/design/architecture.md` | 依赖的 API/用法变更 |

每条获得结论之一：`migrate`（迁移并保留摘要+链接）/ `keep`（保留）/ `remove`（删除）/ `compress`（压缩为一行）。

**条目格式（权威定义）**：活跃条目为顶层 bullet `- [YYYY-MM-DD] [type] 摘要`；迁移后的摘要行为 `- [YYYY-MM-DD] [type] 摘要 → docs/path`，统一汇集到 [experience-archive.md](../design/governance/experience-archive.md)（永久、可提交），`wisdom.md` 仅保留指向归档的指针。缩进的子 bullet 视为上一条目的内容，不计入条目数。`scripts/governance/distill-wisdom.mjs` 据此计数，并额外兼容无 bullet 的 `[YYYY-MM-DD] ...` 摘要行。

**归档段计数声明（对账基准）**：归档的每个批次段须在前言声明「活跃 N 条」（可另带「归档摘要 N 行」），数值须与该段内顶层 bullet 数一致；`2026-09-14` 起的批次为**必填**，更早批次按旧格式不强制。声明与复算由 `pnpm check:distill-archive` 机检（接入 `governance:check`，见 §5）。

**计数口径**：活跃段（`## 当前条目 (Active)`）内**任意**顶层 bullet 均视为一条条目（不额外校验标签形态）；无 bullet 的 `[YYYY-MM-DD] ...` 摘要行同样计入；缩进子 bullet 与 `###` 小标题不计入。

## 4. 蒸馏工作流

1. 读取 `.session/wisdom.md` 中「当前条目 (Active)」段的全部条目，逐条按 §3 判断结论。
2. 执行 `migrate`（写入对应 `docs/` 目标并做外科式增量）、`remove`、`compress`、`keep`。
3. 压缩 `wisdom.md`：迁移条目摘要行写入 [experience-archive.md](../design/governance/experience-archive.md) 并从活跃段移除（同批在该批次段前言写入 §3 的计数声明）；过时条目直接删除，不保留「半过时」条目。
4. 记录蒸馏日志（迁移 N 条、删除 M 条、更新文档、剩余活跃条目数）。
5. 跑一次 `pnpm check:distill-archive` 确认归档计数对账通过。

## 5. 脚本辅助

```sh
node scripts/governance/distill-wisdom.mjs              # 输出活跃条目统计
node scripts/governance/distill-wisdom.mjs --check      # 阈值结论（退出码恒为 0）
node scripts/governance/distill-wisdom.mjs --reconcile  # 归档计数对账（不符即 exit 1）
pnpm distill:wisdom                                     # 等价别名（见 package.json）
pnpm check:distill-archive                              # 对账入口（接入 governance:check）
```

`--check` 与报告模式均 **退出码恒为 0**（wisdom 缺失也跳过），结论通过 stdout 判断；`--reconcile` 对账不符时 **exit 1**：

| 输出 | 触发条件 |
|------|----------|
| `WISDOM_NEEDS_DISTILL: <N> active entries (threshold <T>)` | 活跃条目 >= 阈值（`--check`） |
| `WISDOM_OK: <N> active entries (threshold <T>)` | 未达阈值（`--check`） |
| `WISDOM_REPORT: <N> active entries (threshold <T>)` | 非 `--check` 的统计报告 |
| `WISDOM_SKIPPED: wisdom not found` | wisdom 文件不存在 |
| `WISDOM_ARCHIVE_OK: <N> archive sections reconciled` | 各批次段声明与条目数一致（`--reconcile`） |
| `WISDOM_ARCHIVE_MISMATCH: ...`（exit 1） | 声明缺失 / 计数不符 / 归档为空（`--reconcile`） |
| `WISDOM_ARCHIVE_MISSING: archive not found`（exit 1） | 归档文件缺失（`--reconcile`；受版本控制载体，缺失即门禁不可用） |

`--reconcile` 优先于 `--check`；声明只在前言（首个顶层 bullet / `###` 前）识别，写在条目之后按未声明处理。

## 6. 集成点

| 触发点 | 集成方式 |
|--------|----------|
| Session 收尾（`@full-stack-master`） | 活跃条目 >= 20 时附加一句蒸馏提醒 |
| 阶段归档（`todo-manager` / `planning.md`） | 归档检查项包含蒸馏与 `pnpm check:distill-archive` |
| 周期回归 / CI（`governance:check`） | `pnpm check:distill-archive` 对账归档计数声明，防声明随批次腐化 |
| 用户主动要求 | 执行完整蒸馏工作流 |

蒸馏涉及 `docs/` 写入，按需交 `@documentation-specialist`，并走 `@code-reviewer` Review Gate。

## 7. 提交策略

蒸馏产物（`docs/` 更新）作为单个逻辑提交，例如 `docs: session wisdom distillation — migrate N patterns`；`.session/wisdom.md` 本身 git-ignored，不入库。
