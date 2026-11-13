# Phase 32 归档批次：质量收口与文档站回归

> 创建时间：2026-11-13
> 触发：Phase 32 收口（用户指令「开始归档」）。
> 依据：[Phase 32 登记批次记录](./2026-11-12-phase32-registration.md) §1 / §2；[规划规范 §7 / §8](../../standards/planning.md)。

## 1. 范围与结果

- **3 条主线 / 4 条原子条目**全部交付：依赖适配与例外收口 1 / 文档站质量收口 2 / 文档站 demo 过渡 1（构成对账 1 + 2 + 1 = 4）。
- **本阶段不发布**：`latest` 维持 `1.2.0`，未执行 `pnpm release`、未触发 Release workflow；提交已推送 `master`（`git ls-remote` 与本地 HEAD 一致）。
- 归档落点：[待办归档](../../plan/todo-archive.md) Phase 32 块；主窗口由 `Phase 27 ~ Phase 32` 6 块 + 归档索引构成（Phase 32 入窗后 **408 行**、越过 warn 400（前态 367 + 增量 41）；Phase 26 迁出 77 行后 **331 行**，均为 `docs:check:line-count` 口径（408 − 77 = 331）），Phase 26 迁深度归档 [phase-26.md](../../plan/archive/phase-26.md)。

## 2. 提交对账

| 条目 | 提交 |
|:---|:---|
| 阶段登记与范围评估 | `7abe62f`（登记）/ `2c8a73b`（依赖大版本评估，阶段前置） |
| M1-1 `reka-ui` 2.11.0 适配（PR [#52](https://github.com/CaoMeiYouRen/caomei-ui/pull/52)） | `5b72563`；回填 `a30dabb` |
| M2-1 `with-select` 可访问名 | `46ad9ba` |
| M2-2 首页 hydration 定性 | `f5542da` |
| M3-1 demo 过渡恢复 | `a678be3` |
| 阶段内 CI 修复 | PR [#53](https://github.com/CaoMeiYouRen/caomei-ui/pull/53) `46c00f9`（CodeQL #6 `js/incomplete-sanitization`）；PR [#54](https://github.com/CaoMeiYouRen/caomei-ui/pull/54) `6c0cd35`（CodeQL #7 `js/path-injection`） |
| 阶段内背景（非条目交付） | `264d779`（每周发布节奏政策）、`fa1ff4b`（DataTable 分页候选登记）、`81ccfbc`（依赖大版本检测改 registry 直连） |

- 窗口口径：`git log --oneline --no-merges 7abe62f^..6c0cd35 | wc -l` → **12**；分组 = 条目交付 9（含登记 / 前置 / 回填）+ 阶段内背景 3（`264d779` / `fa1ff4b` / `81ccfbc`）。`git log --oneline 46c00f9..a678be3 | wc -l` → 2（M2-2 / M3-1 两条纯交付提交）。

## 3. 质量门

- 末条提交 `6c0cd35` 的 CI：**Test / Security Alerts / CodeQL / Pages / TODO to Issue 全部 success**；全量单测 **162 文件 / 3153 passed**。
- 归档批次（纯规划载体 + 文档）复跑：`docs:check:integrity` 报 1 条**预期缩减告警**（`todo.md` 结构标题 4 → 3，因移除 `## Phase 32 原子条目`），以 warning 收尾、exit 0；`pnpm lint:md:check`、`pnpm docs:check:links`、`pnpm check:governance-records`、`pnpm check:stage-counts`（无进行中阶段分支）、`pnpm check:archive-rg-counts`、`pnpm governance:check` 均通过。
- 阶段内组件质量门（各地交付记录）：M1-1 —— 全量单测 3138、`test:a11y` 68、相关 E2E 231、`capture:styles` 0 差异、视觉 36 + 6 项既有字体族失败；M2-1 —— 契约测试 5 passed；M2-2 —— 探针 4 场景未复现；M3-1 —— reduce 下 demo 150ms `CSSTransition`、站点 0s，`docs:build` 通过。

## 4. Wisdom 蒸馏

- `pnpm distill:wisdom --check` → **9 条活跃（< 阈值 20，不蒸馏）**；`pnpm check:distill-archive` 归档段对账通过。
- 本阶段新增 2 条可复用发现（已在 `.session/wisdom.md`，gitignored）：
  1. **文档站 reduce 下恢复 transition 需三层突破**：VitePress `*` 压平、全局 token 归零、组件 `transition: none`；必须重声明完整 shorthand，时长用文档站本地变量。
  2. **生产构建的 Vue 静默修补、hydration mismatch 不告警**：定性须用「JS 关闭取 SSG + 水合后快照」对照，探针要 fail-closed。

## 5. 载体回扫

- `todo.md`：清空阶段状态句与条目表，恢复「当前无进行中阶段」+ Backlog / 长期任务指针（不含阶段编号与归档链接）；「未完成项汇总」只保留等待外部反馈状态指针。
- `roadmap.md`：§1 当前态改为无进行中阶段、Phase 32 行置「完成并归档」、§5 深度归档清单补 Phase 26 与第十次压缩记录。
- `todo-archive.md`：Phase 32 入窗（主窗口 367 → 408，`docs:check:line-count` 口径）；Phase 26 块机械迁出——**77 行迁出段逐行核对，改写 = 25 处 `../` → `../../` + 2 处 `./` → `../`（`./backlog.md`、`./recurring.md`），正文零改写**；迁出后 **331 行**。
- `archive/index.md`：新增 phase-26 文件行与 2026-11-13 迁出记录。
- **机检改指 1 处**：Phase 26 迁出使 `M2-3` 离开主窗口，`docs/design/governance/2026-10-10-phase22-m2-3-major-upgrades.md:6` 的 `[待办事项 §Phase 22]` 指针改为 `[待办归档 Phase 22 §M2-3](../../plan/archive/phase-22.md)`；`check:governance-records` 由 1 处失败转为全绿。同形散文指针（`2026-10-10-phase22-m2-2-*`、`2026-10-11-phase22-m6-3-*`）按既有边界不回改。
- `recurring.md`：§3 第 35 轮门槛复核留痕 + 触发义务句补记 + §2「上次执行」列。
- `.session`：阶段态同步为「无进行中阶段」。
- 治理索引：本记录入索引。

## 6. 长期任务（第 35 轮）

- **触发**：Phase 32 收口（用户指令「开始归档」）；零代码改动域。
- **结论**：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 **5 项维持**。
- **取证**（2026-11-13 实测，与第 34 轮逐项一致、无漂移）：`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 `:aria-label="label"` 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14；§2.2 复跑 `node test-results/m3-1/field-shell-overlap.mjs` → 各组件 shell 声明 `input 0 / textarea 1 / input-number 0 / tags-input 17`、四组件共有声明 **0**；`capture:styles` **399 项** 0 差异。
- **归因**：本阶段零字段契约改动、零重复面声明变化；`reka-ui` 依赖适配与文档站过渡层均不涉两组门槛计数。

## 7. Review Gate

- **audit-depth**：R1 / R2 `standard`（多载体归档 + 深度归档机械迁移 + 计数留痕，≤10 分钟），R3 `quick`（只复查修复点）。
- **R1**（`standard`）：`Reject`（3 blocker / 3 warning / 2 suggest）。
  - blocker：① 行数口径偏差 1（入窗后 / 迁出量两端同时偏 1 而抵消）→ 统一为「367 → 408（增量 41）→ 迁出 77 → 331」；② wisdom 活跃数误写 13（实测 9）→ 三处载体与 `.session` 同批改正；③ 治理索引新增摘要复述门禁读数 → 改为结论式。
  - warning：提交对账缺窗口口径与背景分组 → 补 `--no-merges` 窗口 12 与「条目交付 9 + 背景 3」；roadmap Phase 32 行仍写「#33 合入」→ 改「#33 关闭、由 #52 交付」；回扫口径未记录本轮 1 处机检改指 → 补成因与改指处。
  - suggest：`docs:check:integrity` 缩减告警未定性 → §3 注明属归档正常移除面；`.session` 交付日志未压缩 → 压为单条归档指针。
- **R2**（`standard`）：`Reject`（1 blocker / 1 warning）——回扫口径修复误落在 Phase 31 历史块（两处文本相同，替换命中首个）→ 按块锚定恢复 Phase 31 原文、仅改 Phase 32 块，并逐块比对确认 Phase 31 与 HEAD 一致；`.session` 的 `next_steps` 仍写 13 → 改为 9。
- **R3**（`quick`）：`Pass`（0 blocker / 0 warning）——R2 两点关闭；Phase 31 块与 HEAD 逐块一致（48 行）。
- **复查基线**：本记录 §1 ~ §6；`docs/plan/{todo,roadmap,todo-archive,recurring,backlog}.md`；`docs/plan/archive/{index,phase-26}.md`；`docs/design/governance/index.md`；`docs/design/governance/2026-10-10-phase22-m2-3-major-upgrades.md`；`.session`（gitignored）。

## 8. 已知观察与后续候选

1. 本阶段不发布；`latest` 维持 `1.2.0`，版本积累至下一阶段。
2. Code Scanning 已清零（#6 / #7 fixed）；Dependabot open 仅 `deepmerge` low（#69，无 patched version，已接受登记）。
3. `test:visual` 的 `font-latin*` / `font-mixed*` 6 项在本地环境持续失败（本阶段改动前后一致、非本阶段引入），基线未更新。
4. 下一阶段候选见 [Backlog](../../plan/backlog.md)；启动需用户明确授权。
