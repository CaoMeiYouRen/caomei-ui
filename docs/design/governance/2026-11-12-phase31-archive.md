# Phase 31 归档批次：下游兼容扩容、数据展示动效与依赖卫生

> 创建时间：2026-11-12
> 触发：Phase 31 收口（用户指令「开始归档」）。
> 依据：[Phase 31 登记批次记录](./2026-11-12-phase31-registration.md) §1 / §2；[规划规范 §7 / §8](../../standards/planning.md)。

## 1. 范围与结果

- **5 条主线 / 6 条原子条目**全部交付：下游兼容扩容 1 / 实际安装版本断言 1 / 数据展示动效 A7 1 / 触摸目标 P2 1 / 依赖 PR 卫生 2（构成对账 1 + 1 + 1 + 1 + 2 = 6）。
- **本阶段不发布**（D2 ②）：`latest` 维持 `1.2.0`，未执行 `pnpm release`、未触发 Release workflow；提交已推送 `master`（`git ls-remote` 与本地 HEAD 一致）。
- 归档落点：[待办归档](../../plan/todo-archive.md) Phase 31 块；主窗口由 `Phase 26 ~ Phase 31` 6 块 + 归档索引构成（Phase 31 入窗后 **416 行**、越过 warn 400；Phase 25 迁出后 **367 行**，均为 `docs:check:line-count` 口径：前态 366 + 块 49（含分隔空行）+ 归档索引行 1 = 416，迁出 49 后 367），Phase 25 迁深度归档 [phase-25.md](../../plan/archive/phase-25.md)。

## 2. 提交对账

| 批次 | 提交 |
|:---|:---|
| 阶段登记 + 下游兼容扩容 / 安装版本断言（PR #51） | `1ec8464` |
| M1-1 / M2-1 交付记录 | `d20bcf9` |
| M3-1 数据展示动效（A7） | `dbe87cc` |
| M4-1 触摸目标 P2 | `09a7205` |
| M5-1 `eslint-plugin-vue` 解阻 | `814ed2b`；依赖 PR #48 `bdd7483` |
| M5-2 依赖 PR 复核收口 | `4647e11` / `5000a5f`；依赖 PR #30 `e30a75c` + `d979dab`、#41 `9e642b4`、#32 `7fd1cbd` + `ed274af`、#34 `6556380` |
| M5-2 状态行与 `reka-ui` 评估登记 | `c6363b8` / `55d3a2a` |

- 窗口口径：`git log --oneline d69db1a..09a7205 | wc -l` → **34**，其中本阶段交付 / 记录 **16**，其余 **18** 为依赖自动合并与安全修复（Mergify / dependabot，含 #49 / #50）。

## 3. 质量门

- 末条提交 `09a7205` 的 CI：**Test / Security Alerts / Deploy Pages / Run TODO to Issue 全部 success**。
- 归档批次（纯规划载体 + 文档）复跑：`pnpm lint:md:check`、`pnpm docs:check:links`、`pnpm check:governance-records`、`pnpm check:stage-counts`（当前无进行中阶段时跳过）、`pnpm check:archive-rg-counts`、`pnpm governance:check` 均通过。
- 阶段内组件质量门（各地交付记录）：M3-1 —— 两套 E2E 39 passed、`capture:styles` 0 差异、视觉 36 passed（6 项既有字体族失败）；M4-1 —— hit-target 21 passed、field-overflow 24 passed、`capture:styles` 0 差异；M5-1 / M5-2 —— 依赖 PR CI 全绿后由 Mergify 合并。

## 4. Wisdom 蒸馏

- `pnpm distill:wisdom --check` → **8 条活跃（< 阈值 20，不蒸馏）**；`pnpm check:distill-archive` 归档段对账通过。
- 本阶段新增 2 条可复用发现（已在 `.session/wisdom.md`，gitignored）：
  1. **scoped 样式里 `:where([data-motion='expressive']) :is(...)` 的 scope 属性会落到 `:where` 祖先**，导致规则永不匹配——`[data-motion]` 规则末段必须是类选择器。
  2. **Playwright 默认 `reducedMotion: 'reduce'`**，动效采样规格必须显式 `test.use({ reducedMotion: 'no-preference' })`，否则时间轴断言恒为空。

## 5. 载体回扫

- `todo.md`：删除 Phase 31 条目表与状态句，恢复「当前无进行中阶段」+ Backlog 指针（不含阶段编号与归档链接）；「未完成项汇总」只保留等待外部反馈状态指针（三仓锁定版本 + 扩容后首跑 run）。
- `roadmap.md`：§1 当前态改为无进行中阶段、Phase 31 行置「完成并归档」、§5 深度归档清单补 Phase 25 与第九次压缩记录。
- `todo-archive.md`：Phase 31 入窗（主窗口 366 → 416，含归档索引行，`docs:check:line-count` 口径）；Phase 25 块机械迁出——**47 行迁出段逐行核对，14 行改写 = 18 处 `../` → `../../` + 2 处 `./` → `../`（`./archive/phase-18.md`、`./recurring.md`），正文零改写**；迁出 49 行后 **367 行**。
- `archive/index.md`：新增 phase-25 文件行与 2026-11-12 迁出记录。
- `recurring.md`：§3 第 34 轮门槛复核留痕 + 触发义务句补记 + §2「上次执行」列。
- `.session`：阶段态同步为「无进行中阶段」。
- 治理索引：本记录入索引。

## 6. 长期任务（第 34 轮）

- **触发**：Phase 31 收口（用户指令「开始归档」）；零代码改动域。
- **结论**：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 **5 项维持**。
- **取证**（2026-11-12 实测，与第 33 轮逐项一致、无漂移）：`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 `:aria-label="label"` 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14；§2.2 复跑 `node test-results/m3-1/field-shell-overlap.mjs` → 四组件共有声明 **0**（`tags-input` 17）；`capture:styles` **399 项** 0 差异（本阶段未扩采样面）。
- **归因**：本阶段零字段契约改动、零重复面声明变化；M4-1 新增的 `<TagsInputRoot>` 点击处置不改变 shell 声明数，采样面不变。

## 7. Review Gate

- **audit-depth**：`standard`（多载体归档 + 深度归档机械迁移 + 计数 + 长期任务留痕；≤ 10 分钟）；R3 delta `quick` ≤5 分钟。
- **R1**（`standard`）：`Reject`（4 blocker / 5 warning / 3 suggest）——索引预写 R1 结论、归档索引表未回填 Phase 25、行数口径与公式不自洽、迁出改写处数错误；warning 含 `.session` 断言不实、提交对账分组混用、`recurring` 轮次顺序、口径句日期、阶段块顺序。全部处置：索引改为「R1 Reject」并留待回填、归档索引补 Phase 25 行与表头、行数统一为 416 / 367、改写改为「14 行 = 18 处 `../` + 2 处 `./`」、`.session` 实际同步、对账分组改为「主动处置 16 / 背景 18」、第 34 轮行移至第 33 轮后、口径句日期更新、阶段块保持升序。
- **R2**（`standard`）：`Reject`（2 blocker / 2 warning / 1 suggest）——`todo-archive.md:5` 口径句仍为旧值、`governance/index.md` 仍为 416 / 367（公式错）、`recurring` 缺第 32 轮且表格被空行截断、块尾双空行。全部处置：口径句改为 `Phase 0 ~ 25` / `Phase 26 ~ 31` 并补 `phase-25.md` 与行数链；三处载体统一为「366 + 49 + 1 = 416 → −49 = 367」（实测 367）；恢复第 32 轮并消除表格断裂；删除多余空行。
- **R3**（`quick`）：`Pass`（0 blocker / 0 warning / 1 suggest）——4 个修复点全部关闭；suggest 为 F 阶段回填轮次结论（本段已回填）。
- **复查基线**：本记录 §1 ~ §6；`docs/plan/{todo,roadmap,todo-archive,recurring,backlog}.md`；`docs/plan/archive/{index,phase-25}.md`；`.session`（gitignored）。

## 8. 已知观察与后续候选

1. 本阶段不发布；`latest` 维持 `1.2.0`，版本积累至下一阶段。
2. `reka-ui` 2.11.0 适配评估已完成并登记 Backlog（5 文件 / 约 14 行），#33 维持开放，待用户授权实施。
3. `test:visual` 的 `font-latin*` / `font-mixed*` 6 项在本地环境持续失败（本阶段改动前后一致、非本阶段引入），基线未更新。
4. 依赖告警：`node-forge` low（dependabot #69）仍开放。
5. 下一阶段候选见 [Backlog](../../plan/backlog.md)；启动需用户明确授权。
