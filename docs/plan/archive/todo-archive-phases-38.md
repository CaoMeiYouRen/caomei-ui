# 待办归档（深度归档）· Phase 38

> 本文件保存自[待办归档主窗口](../todo-archive.md)迁出的 **Phase 38 完整归档块**（口径见主窗口文首）。迁移为机械操作：链接深度 `../` → `../../`、同目录 `./` → `../`，正文不改写。

## Phase 38：移动端体验（基础层、移动壳与操作 / 空态）（**2026-11-20 完成并归档；本阶段不发布**）

- 时间：2026-11-20 用户就[第二十二轮范围评估](../../design/governance/2026-11-20-mobile-experience-evaluation.md) §6 裁定 D0 ① / D1 ① / D2 ① / D3 ① / D4 ② 后登记；同日交付 **4 条主线 / 11 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**基础层 2 / 移动壳 3 / 操作与空态 3 / 口径与验收 3**，构成对账 **2 + 3 + 3 + 3 = 11**（原登记 10 条，执行期追加 M4-3）；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 38 登记批次](../../design/governance/2026-11-20-phase38-registration.md) §1 / §2。
- 非目标：移动端独立包、手势、JS 视口分支、`DataTable` 卡片化、视觉尺寸放大、vue-router 耦合、Picker / NavBar / Search 组件化、全量矩阵宽屏化、宽屏视觉基线、`xl` 断点、i18n 二期 / RTL、新增运行时依赖、自动发布。

### M1 基础层（2 条）

- **M1-1 安全区 token 与工具类**（`89f0fc6`；记录见 [M1-1](../../design/governance/2026-11-20-phase38-m1-1-safe-area.md)）：四个 `--caomei-safe-area-*` 默认 `env()`，六个工具类写同侧 `padding`；中英指南补「安全区」节；RG R1 `standard` `Pass` → R2 `quick` `Pass`。
- **M1-2 固定定位件接入与 `dvh` 回退**（`d1f0e4d`；记录见 [M1-2](../../design/governance/2026-11-20-phase38-m1-2-fixed-overlays.md)）：Drawer / Dialog / ConfirmDialog / Toast / BackTop / Image preview 接入安全区与 `dvh`；RG R1 `standard` `Pass` → R2 `quick` `Pass`。

### M2 移动壳（3 条）

- **M2-1 Cell / CellGroup**（`a7e3159` + `2097a24`）：行语义、`div` / `button` / `a` 宿主、前后插槽、分组标题与分隔线；中英页面与示例同批。
- **M2-2 Tabbar / TabbarItem**（`6f91402` + `50dbcc7`）：`v-model`、`aria-current` 单值、图标 / 角标 / 禁用、安全区与可选吸底；不接 vue-router。
- **M2-3 M2 的 10 语、台账与文档**（`0710963` + `cb8d03b` + `6052436`）：`tabbar.label` 纳入 10 语；台账、侧栏、总览与 Tier 2 清单同步。

### M3 操作与空态（3 条）

- **M3-1 ActionSheet**（`0ecd371` + `9f7dd1d`）：以 Drawer 底部抽屉组合，支持分组 / 危险项 / 取消项 / 选择后关闭 / 焦点回退 / 内容滚动；Drawer 增加可选 `label` 可访问名回退。
- **M3-2 Empty**（`e203b70` + `ef6d7c4`）：图标 / 图片、标题、说明、操作区、尺寸档与 `as` 语义标签；与 DataView 空态分工单点声明。
- **M3-3 M3 的 10 语、台账与文档**（`0710963` + `cb8d03b` + `6052436`）：`actionSheet.label` / `cancel` 纳入 10 语；台账、DataView 关系与计数回扫同批。

### M4 口径与验收（3 条）

- **M4-1 移动端适配指南**（`0115a33`）：中英指南新增 bottom sheet、吸顶、固定底部操作条、软键盘、五条下限与 44px 达成路径。
- **M4-2 44px 政策与回归扩面**（`47ff782` + `d582e26` + `b71b655`）：维持 24 下限，44 由 `size="lg"` / `data-density="touch"` 达成；移动壳常驻 E2E 与相邻目标间距负向对照；四组新组件进入矩阵受检面。
- **M4-3 验收视口扩面**（`b71b655` + `7218e98`）：定向档 2 → 6（360 / 414 / 1536 / 1920），矩阵守卫改为单点清单；极窄探针修复夹具最小内容宽导致的布局视口失真。

### 阶段总结

- **4 条主线 / 11 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges d1f0e4d..291499e` → **18**（9 条实现 / 测试 / 文档与规划状态回填）；另含归档提交 1 个。
- **质量门**：`pnpm verify` 全绿；全量单测 **182 文件 / 3553 例**；E2E `mobile-shell` **27/27**、`responsive` 9 档 **186 passed / 12 skipped**；`capture:styles` **399 项 0 差异**；`test:visual` **48/48**。
- **Review Gate**：三区分审 R1 `standard`（运行时 Pass / 文档 Reject / 测试 Reject）→ R2 delta（文档 Reject）→ R3 `quick` `Pass`；5 个 blocker 与全部可收口 warning 同批关闭，详见[交付记录](../../design/governance/2026-11-20-phase38-m2-m4-mobile-shell-and-acceptance.md) §3。
- **长期任务**：第 **42** 轮门槛复核（2026-11-20，Phase 38 收口轮）——见 [长期任务](../recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **17 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态、Phase 38 行与 §5）/ `todo-archive.md`（本块入窗与主窗口口径句）/ `archive/index.md`（phase-32 行与迁出时点）/ `recurring.md`（第 42 轮与触发义务句）/ `governance/index.md`（归档记录行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **真实设备验收**：iOS safe-area / 软键盘与 `dvh` 动态差异无自动化条目，随真机验收执行。
- **既有 E2E 装置失败**：back-top、overlay-stacking、navigation-motion、selector-motion、data-table-scroll 已在干净 HEAD 复现，登记 [Backlog §1.6](../backlog.md)，待用户裁定是否排期。
- **宽屏视觉基线 / `xl` 断点**：维持 [Backlog §1.6](../backlog.md) 候选，按触发条件启动。
