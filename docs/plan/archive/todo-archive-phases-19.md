# 待办归档（深度归档）：Phase 19

> 收录阶段：设计一致性口径落地、组件文档去重与观感缺陷处置。
> 主窗口与归档索引见 [待办归档](../todo-archive.md)；阶段交付的唯一权威记录仍是各阶段治理记录（见 [治理索引](../../design/governance/index.md)）。
> 迁移为机械操作：`../` → `../../`，另 3 处同目录 `./backlog.md` / `./recurring.md` → `../…`（全批 5 处）；正文不改写。

## Phase 19：设计一致性口径落地、组件文档去重与观感缺陷处置

- 时间：2026-10-02 用户裁定 D1 ~ D13 后登记；2026-10-07 交付 6 条主线 / 14 条原子条目并完成阶段归档（用户指令「开始归档」）。
- 范围与授权（用户决策 2026-10-02）：用户取**组合 A + 组合 B + 组合 C（= M1 + M2 + M3 + M4 + M6）**，并经 **D10 上收 M7**，共 **6 条主线 / 14 条原子条目**（M1 4 / M2 3 / M3 3 / M4 2 / M6 1 / M7 1）；逐条裁定——**D2** 设计规范 §6 七项口径漂移「措辞 + 实现一起改」（含 D3 浮层背景 `bg-elevated`、D4 Popover 圆角、D6 AutoComplete 阴影 token 化三项视觉变更）；**D3** Tab 指示条**修复**；**D4** 富文本下拉取**文档站作用域隔离**；**D5** 迁移映射**3 批全量整改**；**D6** `iconOnly` **改示例**；**D7** 下游升级口径**重写并纳入 M6**；**D8** Phase 8 **继续等待**；**D9** 两条流程约束**纳入 M4**；**D10** 上收国际化调研；**D11** 远端 tag **已授权并推送**；**D12** 组件增强**维持条件触发**；**D13** **按需不预登记发布**。范围依据见[下一阶段范围评估（第三轮）](../../design/governance/2026-10-02-next-stage-scope-evaluation.md) §8。
- 非目标：不重指 tag / 不重新发布；不启动 Phase 8；不做组件增强与长尾；不做国际化实现 / RTL；不改品牌色值；不做破坏性 API 变更；不重写下游仓库；不预登记发布条目；不引入 Tailwind / UnoCSS。

### M1 设计一致性口径裁定与守卫落地（4 条）

- **M1-1**：依据 [Phase 18 M3-1 记录](../../design/governance/2026-10-01-phase18-m3-1-design-consistency-evaluation.md) §4 逐条修正[设计规范 §6](../../design/design-spec.md) 的措辞与计数（D1 禁用态计数 35 / D2 `invalid` 语义 / D5 Tag 字号按档位 / D7 Card 三变体）。提交 `db342c3`。
- **M1-2**：§6 涉及的**实现对齐**（视觉变更）——D3 浮层背景 `bg` → `bg-elevated`、D4 Popover 默认圆角 `md` → `lg`、D6 AutoComplete 阴影走 `--caomei-shadow-md`；同批随 §6 扩写覆盖 **11 处**（D3 原定 8 面 + ConfirmDialog / Drawer / DatePicker）。**V 阶段**真实 Chromium **44 / 44 通过**、负向对照 **11 / 11 失败**；`capture:styles` 262 项 0 差异、`check:design` 全绿。提交 `89c4d82`（实现）/ `1728a0f`（状态）/ `8288638`（验证留痕）；记录见 [M1-2 视觉对齐](../../design/governance/2026-10-05-phase19-m1-2-visual-alignment.md)。
- **M1-3**：按 §5 落地 **P1 + P2 装置**（三子批）——**3a** 浮层面板视觉契约固化（采样面 262 → 270）；**3b** §5 P1 五项 + 登记点名项（270 → 297）；**3c** 声明层契约 3 项 + checkbox 采样（297 → 302）。负向对照逐组命中、`capture:styles` **302 项 0 差异**；提交 `222cee7` / `86f1cad` / `ecf019e`；记录见 [3a](../../design/governance/2026-10-05-phase19-m1-3a-panel-visual-contract.md) / [3b](../../design/governance/2026-10-05-phase19-m1-3b-capture-p1-extension.md) / [3c](../../design/governance/2026-10-05-phase19-m1-3c-declaration-contracts.md)。
- **M1-4**：落地 **P3 几何 / 交互层装置**——禁用态尺寸不变（7 组件对）+ Button 角标外扩 + Drawer `90vw`·`90vh` 收敛 + Drawer reduced-motion + 焦点可见扩面（5 组件）；新增 **54 例常驻 E2E**、全量 **186 passed**、`capture:styles` 302 项 0 差异；**发现并修复 Drawer reduced-motion 特异性缺陷**。提交 `522befe`；记录见 [M1-4](../../design/governance/2026-10-05-phase19-m1-4-geometry-interaction-devices.md)。

### M2 组件文档一致性整改（迁移映射去重，3 条）

- **M2-1 批 1（ColorPicker / DatePicker）**：删除中英 4 页中段 `> 迁移映射` 正文块并折入迁移节；ColorPicker 纯冗余、DatePicker 折入 `selectionMode` 零用量语义。复算整改前中英各 **6** / 消除 **2** / 当前 **4**。提交 `7139efe`；记录见 [M2-1](../../design/governance/2026-10-05-phase19-m2-1-migration-dedup-batch1.md)。
- **M2-2 批 2（Drawer / Message）**：删除中英 4 页正文块；Drawer 折入 `#footer` 映射与零下游用量判据、Message 折入有损近似。复算批前 **4** / 消除 **2** / 当前 **2**。提交 `5d36c3a`；记录见 [M2-2](../../design/governance/2026-10-05-phase19-m2-2-migration-dedup-batch2.md)。
- **M2-3 批 3（SplitButton / Tag）**：删除中英 4 页正文块；SplitButton 折入未实现括注、Tag 折入 `info → primary` / `error` 零用量 / `outlined` prop / §9 未决项指针。复算批前 **2** / 消除 **2** / 当前 **0**，**M2 终态中英各 0 页**；**N2 关闭**（该候选行已随登记批次迁出候选池，无残留行）。提交 `cf38ca8`；记录见 [M2-3](../../design/governance/2026-10-05-phase19-m2-3-migration-dedup-batch3.md)。

### M3 组件观感缺陷处置（3 条）

- **M3-1 Tab 激活指示条被容器裁剪修复**（视觉变更）：取「`padding-bottom: 1px` + 内阴影」方案，恢复设计意图「2px 主色、分隔线被盖住」；**V 阶段**逐行像素 白/主色/分隔线/白 → 白/主色/主色/白、`triggerClippedPx` 1 → 0；新增声明层契约 + 几何/像素 E2E；顺带结构性消除 1px 纵向溢出（`tabs-list-overflow.e2e.ts` 前置条件同步）；`capture:styles` 302 项 0 差异（采样面不含 Tabs，显式声明非证据）。提交 `7b71b2e`；记录见 [M3-1](../../design/governance/2026-10-06-phase19-m3-1-tabs-indicator-clipping.md)。
- **M3-2 RichTextEditor 工具栏下拉留白**：按 D4 取**文档站作用域隔离**（`caomei-demo.css` 新增内核菜单隔离规则），不改组件库 `src/**`；**V 阶段**菜单 20px → 0、菜单项 8px → 0、首项偏移 31 → 11px，正文列表 20px 无回归；新增声明层契约；`docs:build` / `pnpm verify` exit 0；零 `src/**`。提交 `35c6731`；记录见 [M3-2](../../design/governance/2026-10-06-phase19-m3-2-rich-text-editor-dropdown-indent-fix.md)。
- **M3-3 Button `iconOnly` 示例形态**：按 D6 改示例（22 个纯图标按钮改走 `#icon` 插槽），组件契约不变；**V 阶段** 22/22 有可见内容、空白 0；新增声明层契约；中英共用示例源；零 `src/**`。提交 `7a70134`；记录见 [M3-3](../../design/governance/2026-10-06-phase19-m3-3-button-icon-only-example.md)。

### M4 治理约束载体落地（2 条）

- **M4-1 `.session` 阶段态同步触发点**：`todo-manager` skill Session 收尾协议把「阶段登记 / 归档 / 范围变更批次」显式列为 `.session` 阶段态**必同步触发点**（Step 3.5，含「常见检查 / 交付前检查」引用行）；**不为 git-ignored 载体新增机检守卫**。
- **M4-2 `todo.md` 完成态回填次序**：把「完成态不得早于该条目 Review Gate 结论、两者同批落地后方可提交」固化到 skill Step 1.7（此前仅在 `.session/wisdom.md`，属**首次固化非重述**）。M4-1 / M4-2 同提交 `70a7eb7`；记录见 [M4](../../design/governance/2026-10-06-phase19-m4-governance-constraint-carriers.md)。

### M6 下游协同口径消缺（1 条）

- **M6-1**：按 dependfix 实测重写 [Backlog](../backlog.md) §1.8「下游 0.5.0 升级护航」行（**就地重写、不迁出候选池**：dependfix 侧已消费 / momei 侧仍锁 `0.3.0` 待升级），并回扫同类版本口径表述；逐载体 `rg` 复核旧口径零残留；补两仓实测时点。提交 `46cfe17`；记录见 [M6-1](../../design/governance/2026-10-06-phase19-m6-1-downstream-version-alignment.md)。

### M7 国际化调研（1 条）

- **M7-1**：调研主流组件库（Vue / React 生态）国际化语言覆盖（L1 取证 6 库语言条目 43 ~ 72，本库 5）与国际化文案**分包 / 体积**工程方案；盘点本库现状（854 行 / 32 KB、单对象根导出、无子路径）并给出 A/B 两条工程路线与 RTL 独立立项判据。**只调研、未改代码**。提交 `1ff2757`；记录见 [M7-1](../../design/governance/2026-10-06-phase19-m7-1-i18n-research.md)。

### 附带交付（非阶段条目）

- **Phase 19 登记与范围评估**：`7cf0747`（规划编号守卫豁免进行中阶段条目表）/ `9613eb5`（Phase 19 登记 + 第三轮下一阶段范围评估）。
- **2026-10-02 用户多事项批次**（登记前交付）：`135d632`（文档开发命令自动打开浏览器）/ `dae0b62` + `dad3e91`（RichTextEditor 下拉留白归因与收窄）/ `568b042` + `53976ac`（TabList 多余纵向滚动条修复与回填）/ `f41a2e2`（Accordion 自定义触发器示例修复）/ `449068e` + `c88e6d3`（DataTable 排序指示条列宽稳定与回填）/ `4a2d910`（DataView 迁移映射合并 + 跨组件专项评估 + Backlog 登记）。

### 阶段总结

- **提交对账**：`git log --oneline c69b3e3..1ff2757 | wc -l` → **28**（下界 = Phase 18 归档批次末条提交 `c69b3e3`，上界 = 本阶段末条实现 / 记录提交 `1ff2757`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 28）：Phase 19 本体 **17**（M1 8 = `db342c3` / `89c4d82` / `1728a0f` / `8288638` / `222cee7` / `86f1cad` / `ecf019e` / `522befe`；M2 3 = `7139efe` / `5d36c3a` / `cf38ca8`；M3 3 = `7b71b2e` / `35c6731` / `7a70134`；M4 1 = `70a7eb7`〔M4-1 / M4-2 同提交〕；M6 1 = `46cfe17`；M7 1 = `1ff2757`）+ 阶段登记与范围评估 **2**（`7cf0747` / `9613eb5`）+ 附带交付 **9**（`135d632` / `dae0b62` / `dad3e91` / `568b042` / `53976ac` / `f41a2e2` / `449068e` / `c88e6d3` / `4a2d910`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../../design/governance/2026-10-07-phase19-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 21 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 20 轮逐项一致（无漂移）**；证据见[长期任务](../recurring.md) §3 第 21 轮。
- **回扫口径（三段式）**：见[归档批次记录](../../design/governance/2026-10-07-phase19-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：活跃条目数、阈值判定与归档段对账见[归档批次记录](../../design/governance/2026-10-07-phase19-archive.md) §6。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主、无运行时面，故不分区）——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 19 **含 `src/**` 行为改动**（M1-2 组件背景 / 阴影、M3-1 Tabs 几何、M1-4 Drawer reduced-motion），与 Phase 18 的「零 `src/**` 行为改动」不同；② `capture:styles` 采样面由 **262 扩至 302**（M1-3 三子批），属预期变更（同族变更见 [M1-3a](../../design/governance/2026-10-05-phase19-m1-3a-panel-visual-contract.md)）；③ 本批顺带修正 `todo-archive.md` 主窗口阶段块顺序（原 Phase 18 块误置于 Phase 17 之前），现按时间序 13 → 14 → 15 → 16 → 17 → 18 → 19 排列；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——脚本自带说明「阶段 / 条目标题在 H3/H4，属归档正常移除面」，属预期、非阻断；⑤ 归档载体行数超 `docs:check:line-count` 的 warn 阈值（warn > 400 / error > 600，**非阻断**）——归档载体只增不减，本批接受；⑥ 归档后 `check:governance-records` 报 **9 处** `stale-planning-pointer`（Phase 18 记录表头「关联条目」指向 `todo.md`）；同批改指 **9 份 Phase 18 + 主动改指 14 份 Phase 19** 记录表头至 `todo-archive.md`，复跑 exit 0。
- **遗留与后续候选**：Phase 8 未启动（用户 2026-09-28 裁定 D13、2026-10-02 D8 维持）；dependfix `apps/platform`（已升级 `0.5.0`、M34 归档）与 momei 侧迁移由对应仓库执行、本仓等待反馈；Backlog 在册含「下游 0.5.0 升级护航」、组件增强与长尾（条件触发）、a11y 同类悬空引用与 Toast 焦点哨兵、文档站浮层泄漏常驻浏览器断言、国际化语言覆盖与文案分包体积（调研结论已出、实现待规模触发）、RTL 独立立项等；其余见 [Backlog](../backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：R1 **`Reject`**（1 blocker：归档记录 §4① 的**描述性样例**（`todo.md` 链接后紧邻 `Phase 18`）自触发 `stale-planning-pointer`，使 `governance:check` / `verify` 必失败；1 warning：§8 易变计数未取终态；3 suggest）→ 修复（§4① 去链接化 + 主动改指 14 份 Phase 19 记录表头 + §8 重取终态）→ **R2 `Pass`**（0 blocker；RG-B1 / RG-S1 / RG-S2 / RG-S3 关闭；RG-W1 回填记「已修复未复审」）。逐轮 findings 见[归档批次记录](../../design/governance/2026-10-07-phase19-archive.md) §10。

---
