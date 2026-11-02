# 上游提案研判与落地（2026-11-03）

> 输入：`cmyr-skills-agents` 的 4 份提案（`docs/proposals/2026-11-02-*.md`）。本文承载研判结论、落地范围与 optOut 理由；Backlog 不再保留已完成条目的交付摘要（规划规范 §7）。

## 1. 结论

| 提案 | 能力 | 结论 | 落地范围 |
| :--- | :--- | :--- | :--- |
| 任务开局 CI 回执 | `task-start-ci-receipt` | 采纳 | `todo-manager` Step 2.5 + `references/task-start.md`；`ai-collaboration` §6 指针 |
| 发布前安全门禁 | `release-security-gate` | 部分采纳 | 发布链内置门禁、`open` + `dismissed`、台账 `category`；`release.yml` 接线归入「提交驱动 CI 自动发布」第 ④ 项 |
| AI 基建治理检查对齐 | `ai-check` | 部分采纳 | `metadata.internal` 必填、`references` 索引两项守卫；其余 optOut |
| standards 骨架接入 | 未登记（草案） | 不采纳 | 草案未发起；项目已有等价正文且去重门禁禁止搬运 |

## 2. 落地明细

### 2.1 任务开局 CI 回执

- 规则：`.github/skills/todo-manager/references/task-start.md`（触发条件、`HEAD` / `@{u}` 取值、四种结论、多 run 聚合、`gh` 不可用降级）。
- 入口：`todo-manager` Step 2.5；`docs/standards/ai-collaboration.md` §6 只留指针。
- 项目参数：默认分支 `master`、任务态文件 `.session/current-task.yaml`、briefing = 开局首条回复。

### 2.2 发布前安全门禁

- `preflight` 与 `publish` 内置门禁（token 缺失 fail-closed；`publish` 在不可逆动作前复跑）。
- 扫描 `open` + `dismissed`（`auto_dismissed` 不参与）；critical dismissed 仍阻断；high dismissed 仅 `false-positive`，且 `reason` 须含原 `dismissed_reason`；缺少原原因时 fail-closed。
- 台账 `category` 必填并与状态强校验；`--json` 输出 `stateCounts`。
- 本地配置：`SECURITY_ALERTS_TOKEN` + `.env.local`（真实环境变量优先，PAT 不写入 `process.env`）。

### 2.3 AI 治理检查

- `ai:check` 新增：skill frontmatter `metadata.internal` 必填；`references/**/*.md` 必须在 `SKILL.md` 中以 `references/<相对路径>` 索引。
- 死链仍由 `check:ai-asset-links` 覆盖；能力标记、弃用引用扫描、`--json` 不采纳。

## 3. optOut 与理由

| 项 | 理由 |
| :--- | :--- |
| 死链检查（ai-check #3） | 已有 `check:ai-asset-links`（覆盖 `AGENTS.md` / `CLAUDE.md` / `.github/**`，含 GitHub slug 锚点），口径更强 |
| 能力标记（#6） | 需读取兄弟仓 `capabilities/registry.json`，引入跨仓依赖；该台账由上游 `check-capabilities` 统一审计 |
| 弃用引用扫描（#5） | 项目无 deprecated 清单与生命周期登记，先有数据源再谈检查 |
| `--json` 输出 | 当前无程序化消费者；`governance:check` 为串行文本 |
| 台账 `review` / `expiresAt` | `plannedVersion` + 每次发布前复评已是等价的条件形式复核 |
| 台账 `location` | 台账键 `source:id` 已按实例，不会连带放行同 rule 其他实例 |
| token 按来源分离 | 当前两类告警共用 `SECURITY_ALERTS_TOKEN` 为文档化决策；Code Scanning 换 `GITHUB_TOKEN` 属优化项，非功能缺口 |
| standards 骨架正文 | 草案未发起；`AGENTS.md` §2 / §8.2 已有等价正文，`check:standards-redundant:strict` 禁止重复表述 |

## 4. 剩余事项

- `release.yml` 接线（安全门禁）归入 Backlog「提交驱动 CI 自动发布」第 ④ 项，不单独立项。
- `standards` 骨架：dependfix 试点结论出来后只评估「规范来源可追溯」标注，不搬运正文。

## 5. 验证证据

- `pnpm ai:check` exit 0；`scripts/ai/check-governance.test.mjs` 13 例。
- `scripts/release/check-security-alerts.test.mjs` 47 例；实网 `pnpm check:security-alerts` exit 0（critical 0 / high 0 / medium 1 / low 1，open 2 / dismissed 0）。
- `pnpm typecheck`、`lint-md`、`docs:check:links`、`docs:check:structure`、`check:standards-redundant:strict` 全绿。
- 上游 optOut：`cmyr-skills-agents` commit `3ba71e0`（standards 骨架 §7）。
