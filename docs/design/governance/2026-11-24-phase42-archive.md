# Phase 42 归档批次：发布收口、浏览器模拟移动验收、治理收尾与 P2 / 宽屏基线

> 时间：2026-11-24
> 触发：用户指令「开始归档」；阶段提交已推送 `master`（`origin/master` = `ec0fcb2f`）。
> 性质：**归档批次记录**。阶段范围与验收口径的唯一载体仍是 [Phase 42 登记批次](./2026-11-23-phase42-registration.md)；本记录只承载归档动作、交付对账、范围变更与载体同步结论。

## 1. 归档范围与动作

- **归档前范围变更（用户裁定）**：`1.5.0` 发布收口 3 条（M1-1 门槛复核与升级注意 / M1-2 发布与发布后校验 / M1-3 下游兼容复验）按「本阶段不执行发布、初步计划 2026-11-29 前后」移出本阶段，转入 [Backlog §1.6](../../plan/backlog.md) 待发布窗口。**归档口径 = 6 条主线 / 17 条原子条目**（模拟移动验收 2 / 治理与文档收尾 3 / P2 组件 5 / 宽屏视觉基线 2 / 下游升级兼容修复 2 / 文档站窄屏修复 3；构成对账 2 + 3 + 5 + 2 + 2 + 3 = 17）。
- **入窗**：Phase 42 完整归档块写入 [`todo-archive.md`](../../plan/todo-archive.md)，含 6 项必填（阶段名称与时间 / 交付内容与提交记录 / 质量门 / Review Gate / 未覆盖边界 / 遗留与后续候选）与回扫口径三段式。
- **迁出**：入窗后主窗口 **419 行**（`docs:check:line-count`，越过 warn 400），按「目标窗口 5 个」口径压缩为「**Phase 38 ~ Phase 42**（5 块）+ 归档索引」，最早两块 Phase 36 / Phase 37 迁入 [`archive/todo-archive-phases-36-37.md`](../../plan/archive/todo-archive-phases-36-37.md)（机械迁移：链接深度 `../` → `../../`、同目录 `./` → `../`，正文不改写）。迁出后 **371 行**；索引补 Phase 36 / Phase 37 两行后 **373 行**（当前读数）。
- **归档索引**：`archive/index.md` 补 `phase-36-37` 文件行与 2026-11-24 迁出时点；`check:archive-index` 覆盖 **22** 个分片。

## 2. 交付对账

- **17 条全部交付**；窗口 `git log --oneline --no-merges 8038ab40..ec0fcb2f` → **29 个提交**（含第二十七轮范围评估、登记、执行期 M6 / M7 追加、逐条交付与规划状态回填；本归档提交另计）。
- 主线交付：M2 `e54205f0` / `f0ec0c55`；M3 `ed89d4ca` / `2c796f50` / `43adb5e4`；M4 `fabbc898` / `9f82c8bc` / `211cad3b` / `b710cf51` / `acf0f387`；M5 `08230bf1` / `4107ea4a`；M6 `abcb42cb` / `a68b217e`；M7 `3c8fead5`（M7-1）/ `0ab62654`（M7-2 + M7-3）。
- **执行期事实修正**：M3-3 登记原文「`label` 默认同名」与实现及 locale 断言不符，记录与组件页改为「默认可访问名不同名」；M4-5 两组件无语言兜底文案，新增命名空间将触及 13 文件超阈值，故不新增、台账维持。
- **阶段外但同窗口的收口**：Stepper 横向窄屏退化按用户裁定只登记 Backlog 并以组件文档指引替代（`ec0fcb2f`），不计入阶段条目。

## 3. 载体同步

| 载体 | 动作 |
| :--- | :--- |
| `docs/plan/todo.md` | 切到「当前无进行中阶段」；移除阶段状态句、进度表与 17 条条目表；未完成项汇总保留 `1.5.0` 发布与 momei 反馈两个指针 |
| `docs/plan/roadmap.md` | §1 当前态改为「当前无进行中阶段」并登记 Phase 42 已完成；阶段表 Phase 42 行改为「2026-11-23 登记、2026-11-24 完成并归档」；§5 深度归档范围改为 Phase 0 ~ Phase 37、迁出记录补十八次 |
| `docs/plan/todo-archive.md` | Phase 42 块入窗；Phase 36 / Phase 37 迁出；主窗口口径句改为 Phase 38 ~ Phase 42 / 5 块 / 373 行；索引表补 Phase 36 / Phase 37 行 |
| `docs/plan/archive/index.md` | 补 `phase-36-37` 文件行与 2026-11-24 迁出时点 |
| `docs/plan/backlog.md` | §1.6 新增 `1.5.0` 发布收口候选（触发条件 = 用户发布授权） |
| `docs/plan/recurring.md` | 第 47 轮门槛复核（Phase 42 收口触发） |
| `docs/design/governance/2026-11-23-phase42-registration.md` | §1 补归档前范围变更，§4 补归档时点载体动作（登记时点快照不回改） |
| `docs/design/governance/index.md` | 本记录登记一行 |
| `.session/` | 切到「无进行中阶段」；交付范围与推送状态同步（gitignored，不入库） |

## 4. 质量门与长期任务

- **阶段质量门**：`pnpm verify` exit 0——lint / stylelint / lint-md / `typecheck` / `typecheck:docs` / `pnpm test` **198 文件 / 3767 例** / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check`；`pnpm capture:styles` **399 项 0 差异**；master CI（Test / Deploy VitePress / CodeQL / Security Alerts）在 `ec0fcb2f` 全绿。
- **文档站验证**：M7-1 按构建产物 164 页 × 320 / 360 / 390 / 768 四档扫描 `scrollWidth === innerWidth` 全绿；M7-2 / M7-3 对比度实测亮 5.17:1 / 暗 7.73:1 与 5.02:1。
- **长期任务第 47 轮（门槛复核）**：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持。证据（2026-11-24 实测）：`useLabelAttrs` 17 / `labelAttrs` 15 / 模板级 `:aria-label="label"` 1（`time-picker` 测试守卫字面量）/ 继承契约 14 / 含内联同名字段 **47**（46 → 47 = `statistic/types.ts` 的 `size` / `placeholder`，展示型组件不继承字段契约，不改变条件触发结论）/ `useFocusControl` 4 / `useAttrs()` 17；§2.2 复跑 `node test-results/m3-1/field-shell-overlap.mjs`：四组件共有声明 **0**（input 0 / textarea 1 / input-number 0 / tags-input 17）。
- **wisdom**：`pnpm distill:wisdom --check` → **2 条活跃**（< 阈值 20，不蒸馏）。

## 5. Review Gate

- **R1（2026-11-24，`standard`，时间盒 ≤10 分钟；实测约 10 分钟）**：**Reject**（2 blocker / 5 warning / 3 suggest）。
  - blocker：① 「提交对账 30」不可复算——`8038ab40..ec0fcb2f` 实为 **29**（`8038ab40` 是上一批归档提交），归档块与本记录两处同错；② 阶段总结「含 6 次 Reject 后修复」与块内逐条 RG 行不符——实为 **9 条条目 / 9 轮**（M2-1 / M2-2 / M3-2 / M5-2 / M6-1 / M6-2 / M7-1 各 1 轮，M7-2 2 轮，M7-3 与 M7-2 同批）。
  - warning：① 主窗口口径句读 371，实际 373；② 长期任务「触发义务」句未追加第 47 轮；③ 治理索引的登记摘要仍写 7 条 / 20 条与「本阶段发布 1.5.0」且未标时点；④ 回扫人工面未覆盖登记批次、深归档分片与本记录自身；⑤ 登记记录「最终 7 条 / 20 条」的「最终」与归档口径冲突。
  - suggest：迁出时点条目的时间正序、Backlog 行显式标注「已决策待发布窗口」、本节占位须先回填。
  - 修复：两处 30 → 29；RG 汇总改为「9 条 / 9 轮」并可逐条复核；口径句与载体表统一为「迁出后 371 / 索引补行后 373」；触发义务句补第 47 轮；索引摘要加「登记时点」限定并回链本记录；人工面补齐 3 类载体；登记记录「最终」改为「执行期末（归档前）时点值」；迁出时点条目改时间正序；Backlog 行标注过渡态。

- **R2（2026-11-24，`quick` delta，时间盒 ≤5 分钟；实测约 8 分钟，超时 3 分钟）**：**Reject**（1 blocker / 1 warning）。
  - blocker：RG 汇总写「8 条条目」而块内可枚举为 **9 条**（M7-3 亦为原子条目，与 M7-2 同批）——同句括号列出 9 个标识符即自证。
  - warning：`archive/index.md` 迁出时点新增的 2026-11-24 条目落在 11-19 与 11-20 之间，未达「11-23 之后」的时间正序，而 §5 已声称修复。
  - 修复：两处载体统一为「9 条条目 / 9 轮」；迁出时点条目移至 2026-11-23（Phase 41 归档批次）之后。
  - suggest（存量惯例，不阻塞）：`backlog.md` §1.6 新行沿用该表既有的 4 单元格形态，而表头为 3 列，后续统一表头或拆列。

## 6. 未覆盖边界与遗留

- **发布与下游复验**：本阶段不含发布；`1.5.0` 的门槛复核、发布执行与三仓复验整体待用户发布授权（Backlog §1.6）。
- **真机验收**：M2 为浏览器设备视口模拟，iOS `dvh` 真实收缩、触摸滚动惯性、OTP 自动填充仍无真机执行。
- **文档站窄屏**：仅 Chromium，仅文档站 `basic` 示例形态；非 Chromium 引擎与暗色 × 窄屏组合态未测。
- **下游反馈**：momei 页面级反馈仍未提供，维持等待外部反馈指针。
