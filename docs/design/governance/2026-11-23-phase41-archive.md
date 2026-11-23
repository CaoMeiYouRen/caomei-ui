# Phase 41 归档批次：表单校验、日期形态、移动端补齐与治理收尾

> 时间：2026-11-23
> 触发：用户指令「开始归档」；19 个阶段提交已推送 `master`（`origin/master` = `3be624ab`）。
> 性质：**归档批次记录**。阶段范围与验收口径的唯一载体仍是 [Phase 41 登记批次](./2026-11-22-phase41-registration.md)；本记录只承载归档动作、交付对账与载体同步结论。

## 1. 归档范围与动作

- **阶段构成**：5 条主线 / 15 条原子条目（表单校验 4 / 日期形态 2 / 治理与可达性 2 / 移动组件 3 / 移动文档 4），构成对账 4 + 2 + 2 + 3 + 4 = 15；**不发布**，`latest` 维持 `1.4.0`。
- **入窗**：Phase 41 完整归档块写入 [`todo-archive.md`](../../plan/todo-archive.md)，含 6 项必填（阶段名称与时间 / 交付内容与提交记录 / 质量门 / Review Gate / 未覆盖边界 / 遗留与后续候选）与回扫口径三段式。
- **迁出**：主窗口在迁出后为 **400 行**（`docs:check:line-count` 读数，未越 warn 400、恰在边界；入窗前读数未留），按「目标窗口 5 个；未越 `warn` 暂留 6 块」口径把最早的 Phase 35 块迁入 [`archive/todo-archive-phases-35.md`](../../plan/archive/todo-archive-phases-35.md)（机械迁移：链接深度 `../` → `../../`、同目录 `./` → `../`，正文不改写）。
- **窗口**：Phase 36 ~ Phase 41（6 块）+ 归档索引（Phase 0 ~ Phase 35）。
- **归档索引**：`archive/index.md` 补 `phase-35` 文件行与 2026-11-23 迁出时点；`check:archive-index` 覆盖 21 个分片。

## 2. 交付对账

- **15 条全部交付**；窗口 `eaaf261b..3be624ab` 共 **19 个提交**（含 locale 批次 `b5cac5a3` 与 locale 键基线同步 `3be624ab` 各 1 个；本归档提交另计）。
- 主线交付：M1 `5a5eaeca` / `33692f08` / `43e30959` / `ad9b3617` / `5557e490` / `8c98c847`；M2 `9ed50ad3` / `6b7d8bb2`；M3 `2ee7f8f2` / `cb900dfd`；M4 `905c38f6` / `b5cac5a3` / `3dcebe5a` / `afd5778a`；M5 `9e20cab6` / `04efb791` / `68a532b1` / `7c2fe5d2`。
- **例外项**：M4-1 / M4-2（NavBar）不满足登记批次 §2 记载的「三条标准」第 1 条、第 2 条存疑（原文引自外部 skill `caomei-todo` §11.5，本仓仅存登记批次转述），按用户 D1' ① 例外立项；组件页、设计清单与提交正文均已标注。

## 3. 载体同步

| 载体 | 动作 |
| :--- | :--- |
| `docs/plan/todo.md` | 切到「当前无进行中阶段」；移除 Phase 41 进度表与 15 条条目表；未完成项汇总移除已收口的 M1 机制指针 |
| `docs/plan/roadmap.md` | §1 当前态改为「当前无进行中阶段」并登记 Phase 41 已完成；阶段表 Phase 41 行改为「2026-11-22 登记、2026-11-23 完成并归档」；§5 深度归档范围改为 Phase 0 ~ Phase 35、迁出记录补十六 / 十七次 |
| `docs/plan/todo-archive.md` | Phase 41 块入窗；Phase 35 迁出；主窗口口径句更新为 Phase 36 ~ Phase 41 / 400 行；索引表补 Phase 35 行 |
| `docs/plan/archive/index.md` | 补 `phase-35` 文件行与迁出时点 |
| `docs/plan/recurring.md` | 第 46 轮门槛复核（Phase 41 收口触发） |
| `docs/design/governance/index.md` | 本记录登记一行 |
| `.session/` | 切到「无进行中阶段」；交付范围与推送状态同步（gitignored，不入库） |

## 4. 质量门与长期任务

- `pnpm test` **196 文件 / 3725 例**通过；`pnpm build` + `check:build`（24 个 exports）通过；`pnpm governance:check` exit 0；`test:visual` **50 / 50**；E2E 定向（form / date-picker-granular / nav-bar / mobile-shell / geometry / responsive）全绿；`pnpm docs:build` 成功。
- **长期任务第 46 轮（门槛复核）**：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持。证据：`useLabelAttrs` 17 / `labelAttrs` 15（历史值 11 → 14 = `90c4c67f` 第 44 轮把 3 个文件的模板级 `:aria-label` 改为 `labelAttrs`（cascader / timeline / transfer，共 4 处引用）→ 15 = `cb900dfd` 的 `time-picker/wheel-column.vue`；基线 `eaaf261b` 同命令 14，可交叉验证）/ 模板级 `:aria-label="label"` **1**（`time-picker` 测试内的守卫字面量）/ 继承契约 14 / 含内联同名字段 46 / `useFocusControl` 4 / `useAttrs()` 17；§2.2 `node test-results/m3-1/field-shell-overlap.mjs` 复跑：四组件共有声明 **0**（input 0 / textarea 1 / input-number 0 / tags-input 17）；`pnpm capture:styles` **399 项 0 差异**。
- **wisdom**：活跃 2 条（< 阈值 20，不蒸馏）；`distill:wisdom --check` 通过。

## 5. Review Gate

- **R1（2026-11-23，`quick`，时间盒 ≤5 分钟）**：**Reject**（4 blocker / 5 warning）。blocker：① `roadmap.md` §5 深度归档范围未随迁出更新（仍写 Phase 0 ~ 34）；② 第 46 轮「含内联同名字段 46」不可复算（同 pattern 实为 46，且与本行「与第 45 轮口径一致」互斥）；③ `labelAttrs` 的计数归因不成立（`labelAttrs` 与 `useLabelAttrs` 大小写不同，15 应可逐项复算）；④ §5 占位指针。修复：§5 改 Phase 0 ~ 35 并写入 §3；计数改 46；归因改为 11 → 14（`90c4c67f` 三文件）→ 15（`cb900dfd`）；本节回填真实结论。warning 同批收口：台账「上次执行」补第 46 轮、迁出时点改升序追加、索引摘要去掉行数读数、历次压缩补十六 / 十七次。
- **R2（2026-11-23，`quick` delta，时间盒 ≤5 分钟）**：**Reject**（2 blocker / 2 warning）。blocker：① 本节 §4 的 `labelAttrs` 归因仍以「计数口径」解释，且以 11、4、1 三段相加的算式不成立（实测 `90c4c67f` 为 11 → 14，即 +3 文件 / +4 处引用）；② `recurring.md` 第 46 轮同一算式（11、4、1 三段相加得 15）不成立。warning：③ 台账「样式重复收敛」行未补第 46 轮；④ `archive/index.md` 与本节 §1 的「warn > 400」措辞与「未越 warn」自相矛盾。修复：§4 改为「11 → 14（`90c4c67f` 三文件 / 四引用）→ 15（`cb900dfd`）；基线 14」；第 46 轮算式同步；台账两行均补第 46 轮；两处措辞改为「迁出后 400 行（未越 warn 400、恰在边界；入窗前读数未留）」。
- **R3（2026-11-23，`quick` delta，时间盒 ≤5 分钟）**：**Reject**（1 blocker / 2 warning）。B① / B② / W③ / W④ 主项已闭合（算式与 `90c4c67f` / `eaaf261b` / `HEAD` 实测一致；台账两行均补第 46 轮；措辞与 `docs:check:line-count` 的严格 `>400` 一致）。新增 blocker：W④ 的「迁出后 400 行」被误加到 2026-11-16 的历史行，造成「311 与 400 同时成立」。warning：新行的「入窗后 400」与「迁出后 400」同值不可复算；第 46 轮的归因措辞与 §2.1 缺 2026-11-23 快照。修复：删除 2026-11-16 行的误加读数；新行改为「迁出后 400 行（入窗前读数未留）」；第 46 轮归因改为「第 45 轮沿用第 44 轮修正前读数（未复测）」并在 §2.1 补 2026-11-23 复测行。放行条件已逐条落实（`docs:check:links` / `docs:check:line-count` 复跑通过），本轮按 §3.5 收束，不再另开轮次。

## 6. 未覆盖边界与遗留

- **真实设备**：iOS `dvh`、触摸滚动、OTP 自动填充仍无真机执行；M5-4 真机清单显式记录「未执行（无真机）」并给出替代证据。
- **NavBar 例外撤回条件**：若用户撤回例外，M4-1 / M4-2 移出并按 13 条重算。
- **发布**：本阶段不发布；未发布变更（表单校验、月 / 年粒度、NavBar、`labelAttrs` 收口）留在 `master`，下一次发布统一收口，版本判定按发布链为 minor。
- **文档站示例类型检查**：`docs/examples/**` 在 `typecheck:docs`（`vue-tsc -p docs/tsconfig.json`）受检面内，但本轮验证集未含该命令（`pnpm typecheck` 覆盖 `src` / `playground` / `test`，不含 `docs/examples`）；示例 props 拼写实际依赖 Review Gate 拦截（已拦下 `variant="text"`）。2026-11-23 补跑 `pnpm typecheck:docs` 通过，故「示例类型检查」不再是缺口，只保留「阶段验证集未含该命令」的记录。
- **下游反馈**：momei 页面级反馈仍未提供，维持等待外部反馈指针。
