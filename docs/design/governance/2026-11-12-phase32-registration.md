# Phase 32 登记批次

> 创建时间：2026-11-12
> 触发：用户就[下一阶段范围评估（第十六轮）](./2026-11-12-next-stage-scope-evaluation-16.md) §3 的 D0 ~ D3 作出裁定：**D0 ① 登记 / D1 ② 仅质量收口（含 #33），不发布 / D2 ① 文档站三项全取 / D3 ① `deepmerge` 告警接受并登记**。
> 依据：[规划规范 §3 / §4 / §7](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 31）+ 1 = **Phase 32**。
- **构成（3 条主线 / 4 条原子条目）**：依赖适配与例外收口 **1** + 文档站质量收口 **2** + 文档站 demo 过渡 **1**；对账 **1 + 2 + 1 = 4**。
- **阶段名**：**质量收口与文档站回归**（D1 ② 不含发布，名称不承载发布语义）。
- **取向来源**：D1 ② —— **仅质量收口，不发布**（`latest` 维持 `1.2.0`；不执行 `pnpm release`、不触发 Release workflow）；D2 ① —— 文档站三项（a11y 示例 / 首页 hydration 定性 / demo 过渡）全取；D3 ① —— `deepmerge` low 告警无 patched version，**接受风险并登记**。
- **候选池变化**：`backlog.md` §1 由 **31 → 26**（移出 **5 行**：`reka-ui` 补丁升级 / 文档站 a11y 示例 / 文档站首页 hydration / 文档站 demo 过渡 4 行分别登记为 M1-1 / M2-1 / M2-2 / M3-1；Toast 焦点哨兵 1 行随 M1 删除例外条目而关闭）。当届 §1.6 由 14 行降至 9 行。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | 依赖适配与例外收口 | `reka-ui` 2.10.4 → 2.11.0（PR #33）：`input-number.vue` 的触摸 `change` 时序修复、`input-number.test.ts` 挂载到文档、删除 `CaomeiToastProvider / aria-hidden-focus` 例外、`THIRD-PARTY-LICENSES` 标题同步 | #33 CI 全绿并合并；全量单测 / 相关 E2E / `capture:styles` / `test:visual` 与评估读数一致（3109 / 228 / 0 差异 / 36 passed + 6 项既有字体族失败）；`test/a11y` 绿且例外清单无 Toast 条目；公共 API 无变更 |
| **M2-1** | 文档站质量收口 | `docs/examples/input-group/with-select.vue` 的 `CaomeiSelect` 以 `placeholder` 充当可访问名 | 示例补显式可访问名；a11y 抽检脚本纳入该页（或补一条常驻断言）；中英示例同步 |
| **M2-2** | 文档站质量收口 | 文档站首页 hydration mismatch 定性（VitePress 上游 / 主题层 / 示例层） | 真实浏览器复现并给出归因；本仓可修则修并留证据，不可修则登记到 Backlog 并写明判定依据（含 VitePress 版本 / 主题层 / 示例层的排除项） |
| **M3-1** | 文档站 demo 过渡 | 按组件恢复文档站 demo 容器内的 `transition`（`docs/.vitepress/theme/motion.css` 或主题层） | 演示区过渡可见（时长采样断言或人工复核清单）；系统 `prefers-reduced-motion: reduce` 下仍压平；`docs:build` / 视觉基线 0 差异，仅视觉盒变化时重冻结并记录差异；不改变库内 `data-motion` 语义 |

## 3. 非目标（本阶段）

- **不发布**（D1 ②）：`latest` 维持 `1.2.0`，不执行 `pnpm release`、不触发 Release；发布留待后续阶段明确授权。
- **不纳入**：`glob` cross-major override（条件未满足）、CI 运行器镜像迁移检测（未命中）、文档站多版本托管、Tailwind preset、Storybook、`conventional-changelog` 8、文档站示例外链守卫扩展、Calendar / RTE 交互边界对比度、ui-validator 资产 follow-up；长尾组件、国际化二期 / RTL、`useDialog`、图标运行时 peer。
- 破坏性 API 变更；新增运行时依赖；放宽 Mergify 条件；修改 `release.config.js` / `release.yml`。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 声明「当前进行中阶段：Phase 32」+ `## Phase 32 原子条目` 段（4 行，状态「待执行」） |
| `docs/plan/roadmap.md` | §1 当前态改为 Phase 32；阶段表新增 Phase 32 行 |
| `docs/plan/backlog.md` | 移出 §1.6 的 5 行（`reka-ui` / a11y 示例 / hydration / demo 过渡 4 行登记 + Toast 焦点哨兵 1 行关闭）；候选池 **31 → 26**，§1.6 **14 → 9** |
| `docs/design/governance/index.md` | 新增本记录 |
| `.session`（git-ignored） | `current_phase` / `active_plan` 与 `runtime_state.plan_state` 同批同步 |

## 5. 风险与前置

1. **`reka-ui` 2.11.0 行为面**：NumberField 的触摸步进延后到 `pointerup`、direction guard、`startingValue` / `allowInvalid` 默认值不改变现有契约；触摸路径的 `change` 已在评估中定位并给出 4 行修法（`nextTick` 延后）。风险低、无 API 变更。
2. **Toast 例外关闭**：2.11.0 实测该违规消失；删除条目是 `count` 指纹断言的强制结果，不是可选清理。
3. **hydration mismatch**：可能归因为 VitePress 上游；本阶段只要求「定性 + 可修则修」，不承诺消除上游行为。
4. **demo 过渡与 reduce**：恢复后必须保留系统 reduce 下压平；若逐组件声明不可维护，可收敛到主题层并在记录中说明边界。
5. **`deepmerge` 告警**：low 且无 patched version，登记接受；再评估触发 = 上游发布首个非公告版本（**≥ 4.3.2**，当前公告区间 `>=4.2.0, <=4.3.1`）后随依赖升级关闭。持久指针：Dependabot 告警 **#69**；台账口径沿用 [Phase 26 S1 依赖告警处置](./2026-10-28-phase26-s1-dependency-alerts-remediation.md) 与 [Phase 27 M4-4 依赖告警](./2026-11-04-phase27-m4-4-dependency-alerts.md)。
6. **阶段收口**：本阶段不发布；收口前执行长期任务第 **35** 轮门槛复核。

## 6. Review Gate

- **audit-depth**：`standard`（规划载体登记 + 跨载体计数 + 候选池变更；≤10 分钟）。
- **R1**（`standard`）：`Reject`（2 blocker / 2 warning / 4 suggest）——候选池漏移 3 条已登记行（应 31 → 26、§1.6 9）、评估索引摘要仍写「待决策 / 未登记」；warning 含复查基线错指评估 §3、`.session` 仅部分同步。处置：移出 5 行并四处计数改 26、索引摘要改为已裁定、复查基线改指 §5、`.session` 同步 phase / feature / backlog_count / 决策。
- **R2**（`quick`）：`Pass`（0 blocker / 2 warning / 2 suggest）——R1 两个 blocker 关闭；warning 为 `.session` 的 `active_plan.feature` 未同步、本段未回填（均已处置）；suggest 为 `deepmerge` 持久指针与评估正文快照标注（均已采纳）。
- **复查基线**：本记录 §1 / §2 / §4；`docs/plan/todo.md` 当前状态与条目表；`docs/plan/roadmap.md` §1 与阶段表；`docs/plan/backlog.md` §1.6 计数；评估记录 §5（裁定结果）。
