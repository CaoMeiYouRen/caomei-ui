# Phase 43 归档批次：下游覆盖兼容、语义收口与 Tree / TreeSelect

> 时间：2026-11-25
> 触发：用户指令「M1-1 / M1-2 / M1-3 直接移除，11-29 之前不列入规划」并「开始归档」；阶段交付已推送 `master`（`origin/master` = `ee8516a9`）。
> 性质：**归档批次记录**。阶段范围与验收口径的唯一载体仍是 [Phase 43 登记批次](./2026-11-24-phase43-registration.md)；本记录只承载归档动作、交付对账、范围变更与载体同步结论。

## 1. 归档范围与动作

- **归档前范围变更（用户裁定，2026-11-25）**：发布收口 3 条（M1-1 门槛复核与升级注意 / M1-2 发布与发布后校验 / M1-3 下游兼容复验）**直接移除**，转 [Backlog §1.6](../../plan/backlog.md) 的「已决策待窗口」过渡态，**2026-11-29 之前不列入规划**。**归档口径 = 3 条主线 / 10 条原子条目**（下游覆盖兼容 4 / 语义收口 1 / Tree · TreeSelect 5；构成对账 4 + 1 + 5 = 10）。
- **入窗**：Phase 43 完整归档块写入 [`todo-archive.md`](../../plan/todo-archive.md)，含 6 项必填（阶段名称与时间 / 交付内容与提交记录 / 质量门 / Review Gate / 未覆盖边界 / 遗留与后续候选）与回扫口径三段式。
- **迁出**：入窗后主窗口 **428 行**（`docs:check:line-count` 值；= 迁出后 379 + 迁出块 50 − 索引行 1），按「目标窗口 5 个」压缩为「**Phase 39 ~ Phase 43**（5 块）+ 归档索引」，最早一块 Phase 38 迁入 [`archive/todo-archive-phases-38.md`](../../plan/archive/todo-archive-phases-38.md)（机械迁移：链接深度 `../` → `../../`、同目录 `./` → `../`，正文不改写）。迁出后 **379 行**（当前读数，未越 warn 400）。
- **归档索引**：`todo-archive.md` 的归档索引扩到 Phase 0 ~ Phase 38 并补 Phase 38 行；`archive/index.md` 补 `phase-38` 文件行与 2026-11-25 迁出时点（含 428 → 379 读数）。

## 2. 交付对账

- **10 条全部交付**；窗口 `git log --oneline --no-merges 206329e5..4980d843` → **11 个提交**（10 条交付 + M2-1 状态同步）；另一提交 `d5fca0d5`（十项交付同步）落在窗口右端之外，故窗口 `..d5fca0d5` 为 **12**。收口期另有 `b0234fc9`（规划载体去掉条目编号的 CI 修复）与 `ee8516a9`（1.4.0 反馈指针更新）。
- 主线交付：M2 `45b9a762`（M2-1，含 `78e7cb95` 状态同步）/ `9a5dcec4`（M2-2）/ `bc668b95`（M2-3）/ `489e1800`（M2-4）；M3 `b2325d4a`；M4 `6c9d23e8` / `1b07a672` / `2e5993a6` / `26b7828c` / `4980d843`。
- **执行期事实**：`@layer` 评估经 R1 驳回后改为「不落地 + 特异性矩阵」；`label` 两处按「登记例外」而非改名；TreeSelect 的 portal 面板 scoped 死规则与「非受控清空无效」两条 blocker 在 R1 暴露并修复；`CaomeiPopoverTrigger.$el` 因单元素根恢复而可解析，连带使 Popover / Popconfirm 打开态背景不再整片 `inert`（已写入升级注意待补项）。
- **阶段外但同窗口的收口**：CI 一次失败（`check-planning-numbers` 拦截规划载体正文的条目编号）按「规划载体正文只写导航指针」修复，不计入阶段条目。

## 3. 载体同步

| 载体 | 动作 |
| :--- | :--- |
| `docs/plan/todo.md` | 切到「当前无进行中阶段」；移除阶段状态句、进度表与条目表；未完成项汇总新增 `1.5.0` 发布收口指针（已决策待窗口、11-29 前不列入规划），保留 momei 反馈与真机两条指针 |
| `docs/plan/roadmap.md` | §1 当前态改为「当前无进行中阶段」并登记 Phase 43 已完成与归档；阶段表 Phase 43 行改为「2026-11-25 完成并归档（本阶段不发布）」且构成改 3 条主线 / 10 条并注明移出；§5 深度归档范围改为 Phase 0 ~ Phase 38、主窗口保留 Phase 39 起、迁出记录补十九次 |
| `docs/plan/todo-archive.md` | Phase 43 块入窗；Phase 38 迁出；主窗口口径句改为 Phase 39 ~ Phase 43 / 5 块 / 371 行；归档索引扩到 Phase 38 并补行 |
| `docs/plan/archive/index.md` | 补 `phase-38` 文件行与 2026-11-25 迁出时点 |
| `docs/plan/backlog.md` | §1.6 新增 `1.5.0` 发布收口候选（**已决策待窗口**，2026-11-29 之前不列入规划；触发条件 = 到达窗口且用户授权发布） |
| `docs/design/governance/2026-11-24-phase43-registration.md` | §1 补 2026-11-25 范围变更（登记时点 13 条 → 归档口径 10 条），登记时点快照不回改 |
| `docs/design/governance/index.md` | 登记记录行补范围变更注记；本记录登记一行 |
| `.session/` | 切到「无进行中阶段」；交付范围与推送状态同步（gitignored，不入库） |

## 4. 质量门与长期任务

- **阶段质量门**：`pnpm verify` exit 0——lint / stylelint / lint-md / `typecheck` / `typecheck:docs` / `pnpm test` **3810 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check` 全链 / `governance:check`；`pnpm test:visual` **59 项 0 基线差异**；定向 E2E（tree / tree-select / button-wrap / popconfirm）**12 项**；master CI（Test / Deploy VitePress / Security Alerts / CodeQL / Run TODO to Issue）在 `ee8516a9` 全绿。
- **长期任务**：本阶段不发布，周级门槛复核留给发布窗口；归档前 `pnpm verify` 全量已覆盖阶段质量门。
- **wisdom**：`pnpm distill:wisdom --check` → **4 条活跃**（< 阈值 20，不蒸馏）。

## 5. Review Gate

- **R1（2026-11-25，`standard`，时间盒 ≤10 分钟）**：**Reject**（3 blocker / 5 warning / 5 suggest）。
  - blocker：① 「迁出前 372 行」为入窗前 HEAD 的 `wc -l` 读数，且与「迁出后 371」在算术上不成立（迁出块 50 行）→ 改为「入窗后 / 迁出前 428 = 379 + 50 − 1 → 迁出后 379」；② Phase 43 归档块缺第 5 项必填「未覆盖边界」，与归档记录的声明矛盾 → 补该小节并把边界项从「遗留」迁入；③ 提交窗口在归档块写 12、归档记录写 11 → 统一为 `206329e5..4980d843` = 11（`d5fca0d5` 在窗口外，`..d5fca0d5` = 12）。
  - warning：`.session` 未切到「无进行中阶段」（与记录声明相反）；归档记录 §5 曾为占位；5 处 Reject 行缺 audit-depth 标签且 M4-3 未闭环；`archive/index.md` 迁出时点缺读数；治理索引 M2-1 摘要仍指向已移除的发布收口条目。
  - 修复：上述各项同批落地（`.session` 同步、§5 回填、深度标签与 M4-3 `R2 quick Pass`、迁出时点补读数、索引改指 Backlog「已决策待窗口」）；suggest（登记记录「登记时点」限定、roadmap D1 标「原裁定」）同批采纳。
- **R2（2026-11-25，`quick` delta，时间盒 ≤5 分钟）**：**Pass**（0 未闭环 blocker）。
  - 复核成立：428 = 379 + 50 − 1 可复算（`todo-archive.md` 与归档记录同口径）；`### 未覆盖边界` 落在 Phase 43 块内且 6 项必填齐全；11 / 12 双口径与归档记录一致；`.session` 无阶段残留；治理索引指针已改指 Backlog。
  - 非阻塞遗留（下批处理）：同批两处措辞润色（428 标「派生值」、登记记录「10 条变 13 条」补限定，均已在本轮一并修正）；`check-governance-records` 的占位正则未覆盖「提交前回填」措辞（治理项，另行处理）。

## 6. 未覆盖边界与遗留

- **发布与下游复验**：本阶段不发布；`1.5.0` 的门槛复核、升级注意补写（Button 根形态 / `CaomeiTooltipText` 根形态 / Popover·Popconfirm `inert` 面收窄）、发布执行与三仓复验整体待发布窗口与用户授权（Backlog §1.6）。
- **存量缺陷候选（本批外）**：`cascader.vue` 的面板样式同样写在 scoped 块中，portal 下为死规则（与 TreeSelect R1 同因），待评估后入 Backlog。
- **文档面存量**：英文总览「Chinese documentation」镜像列表与已翻译列表有 12 项存量不一致（本批补 Tree / TreeSelect 两项）。
- **真机与下游**：iOS `dvh` / 触摸惯性 / OTP 自动填充仍无真机执行；momei 页面级反馈仍待补。
