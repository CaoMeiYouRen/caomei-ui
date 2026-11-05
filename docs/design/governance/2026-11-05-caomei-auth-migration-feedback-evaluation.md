# 2026-11-05 caomei-auth 迁移反馈评估与 Backlog 登记

> 来源：[CaoMeiYouRen/caomei-ui#28](https://github.com/CaoMeiYouRen/caomei-ui/issues/28)「下游迁移反馈：DatePicker 范围选择、Toast 主题 token 与迁移缺口评估」（caomei-auth 从 PrimeVue 4 迁移到 caomei-ui 1.0.0 的评估汇总，**6 条**受检项）。
> 评估主体：caomei-ui（本仓）。
> 事实源与 revision：本仓 `1.0.0`（`package.json`，评估时 HEAD `95010cb`）；issue 正文快照 2026-11-05。
> 口径与方法：**只读静态比对**——逐条在 `src/` 与 `docs/` 复核落点，行号为 2026-11-05 快照；未运行任一侧构建或测试；**零 `src/` 改动**。下游用量数取自 issue 自述，未在 caomei-auth 仓库复核（跨仓只读未执行）。
> 判定取值：**真实缺口**（本仓确缺且未登记为有意差异）/ **文档缺口**（行为已在，但迁移路径未文档化）/ **有意差异（已声明）** / **条件候选**（不构成阻塞，等待触发或用户决策）。
> 快照日期：2026-11-05。

## 1. 结论摘要

| 反馈项 | 事项 | 判定 | 落点 |
| :--- | :--- | :--- | :--- |
| §1 | `DatePicker` 范围选择 | **真实缺口**（候选触发条件已满足） | [Backlog §1.1](../../plan/backlog.md) 既有候选升级为待决策（优先级中） |
| §2 | `Toast` 逐语气样式 | **真实缺口 + 文档缺口** | [Backlog §1.1](../../plan/backlog.md) 候选；[Backlog §1.6](../../plan/backlog.md) 薄封装文档项 |
| §3 | `Paginator` 页码报表 / `template` | **条件候选**（不阻塞） | [Backlog §1.1](../../plan/backlog.md) 既有候选补充用例 |
| §4 | `DataTable` 密度（`size`） | **真实缺口 + 文档缺口**（不阻塞） | [Backlog §1.1](../../plan/backlog.md) 候选；[Backlog §1.6](../../plan/backlog.md) CSS 配方文档项 |
| §5 | `DataTable` 选择列宽度 | **真实缺口**（不阻塞） | [Backlog §1.1](../../plan/backlog.md) 候选 |
| §6 | `DataTable` 表头全选作用域 | **确认项**（有意差异，已文档化） | 不新增候选；指向 [Backlog §1.1](../../plan/backlog.md) 既有全选契约候选 |

**构成（按判定，逐项唯一）**：真实缺口 **4**（§1 / §2 / §4 / §5）、条件候选 **1**（§3）、确认项 **1**（§6）；其中 §2 / §4 另含文档缺口。6 条受检项逐条有落点，见 §4。

## 2. 逐项评估

### 2.1 §1 `DatePicker` 范围选择（主诉求）

- **现象复述**：caomei-auth 登录日志筛选使用 `<Datepicker selection-mode="range" :manual-input="false">`（1 处），需要日期区间筛选；caomei-ui 文档明确 `selectionMode`（`multiple` / `range`）未实现。
- **本仓取证**：`src/components/date-picker/types.ts` 的 `DatePickerProps` 无 `selectionMode` / 多值模型；`src/components/date-picker/date-picker.vue` 以单个 `modelValue` 与 `closeOnSelect` 驱动单日期选择；[DatePicker 组件页](../../components/date-picker.md)「从 PrimeVue 迁移」段把 `selectionMode` 列入**未实现**并回链 [Backlog §1.1](../../plan/backlog.md)。
- **候选状态**：[Backlog §1.1](../../plan/backlog.md) 既有「DatePicker 范围选择」候选的触发条件为「下游出现日期区间筛选真实用例」。本 issue 提供了该用例（caomei-auth 1 处），**触发条件已满足**；候选应从条件候选升级为待用户决策项。
- **判定**：**真实缺口**（未实现且未登记为有意差异）。返回值形态（`Date[]` / `[Date, Date]`）、`multiple` 是否同批、与 `showTime` 的交互均未在本评估中定形，留待实施批次论证；现有 `minValue` / `maxValue` / `dateFormat` / `locale` 契约应保留。
- **下游可行写法**：改为两个单日期选择器（开始 / 结束）；或该页局部保留 PrimeVue，登记为迁移例外；或等待上游实现。
- **登记**：[Backlog §1.1](../../plan/backlog.md) 既有行更新来源与用例，优先级由低调整为中。同批同步中英 DatePicker 组件页「未实现」段的「零下游用量」表述（改为 caomei-auth 1 处真实用例、候选待决策），避免两套口径。

### 2.2 §2 `Toast` 逐语气样式（主诉求）

- **现象复述**：caomei-auth 现有 `styles/_theme.scss` 定义 56 个 `--p-toast-*`（info / success / warn / error / secondary / contrast 的背景、边框、文字、阴影、圆角、间距）；caomei-ui 的 Toast 只暴露 `--caomei-toast-offset` / `-width` / `-z-index` / `-accent`，无法一一映射。
- **本仓取证**：`src/components/toast/toast.vue` 的基类统一消费 `--caomei-color-bg-elevated`（背景）、`--caomei-color-border`（边框）、`--caomei-color-text`（文字）、`--caomei-shadow-md`（阴影）；4 个语气类（`primary` / `success` / `warning` / `danger`）经 `:where()` 只声明 `--caomei-toast-accent`，即**逐语气仅强调色可覆盖**。[Toast 组件页](../../components/toast.md)「样式定制」表同样只列 4 个变量。
- **判定**：**真实缺口 + 文档缺口**。缺的是逐语气背景 / 边框 / 文字 / 阴影的 token 或官方覆盖路径；现有 accent 钩子无法承接 `--p-toast-*` 的完整映射。
- **推荐路径（评估建议，待用户决策）**：
    1. **优先**确认「接受 caomei-ui 默认语气样式」为推荐迁移路径，下游将视觉差异登记为有意差异；
    2. 若业务必须保留现有观感，补下游薄封装配方：以 `.caomei-toast--<tone>` 覆盖背景 / 边框 / 文字 / 阴影，说明类名、特异性（基类 `0,1,0`、语气类 `:where()` 为 `0,0,0`）与加载顺序；
    3. 如仍不足，再评估新增 `--caomei-toast-{tone}-bg` / `-border` / `-text` / `-shadow`。逐语气覆盖会改变可见配色，实施时须纳入对比度校验与视觉基线。
- **下游可行写法**：接受默认样式；或 `AppToast` 薄封装集中覆盖。
- **登记**：[Backlog §1.1](../../plan/backlog.md) 新增「Toast 逐语气样式 token / 覆盖路径」候选；[Backlog §1.6](../../plan/backlog.md) 新增薄封装与 DataTable 配方文档项。

### 2.3 §3 `Paginator` 页码报表 / `template`（评估）

- **现象复述**：caomei-auth 的 `components/base/table.vue` 使用 `current-page-report-template="{first} 到 {last} 共 {totalRecords} 条"`；caomei-ui 未提供 `template` / `CurrentPageReport`。
- **本仓取证**：`src/components/paginator/paginator.vue` 无模板插槽或报表渲染分支；[Paginator 组件页](../../components/paginator.md) 迁移表将 `template`（含 `CurrentPageReport`）标为**未实现**，并给出「按 `page` / `itemsPerPage` / `total` 自渲染」路径。
- **候选状态**：[Backlog §1.1](../../plan/backlog.md) 既有条件候选取证为 dependfix 3 处；本 issue 补充 caomei-auth 1 处，合计 **4 处**。issue 明确「不构成阻塞」，故触发条件「出现必须内建模板的真实用例」仍未满足。
- **判定**：**条件候选**（非缺口阻断）。维持候选，补充用例与来源。
- **下游可行写法**：分页器旁自渲染报表（现有文档已给示例）。
- **登记**：[Backlog §1.1](../../plan/backlog.md) 既有行补充 caomei-auth 1 处用例；优先级维持低。

### 2.4 §4 `DataTable` 密度（`size`，评估）

- **现象复述**：caomei-auth 多处使用 `size="small"`（表格 / 按钮）；caomei-ui 的 `DataTable` 无 `size` prop，密度需页面级 CSS 覆盖 `.caomei-data-table__th` / `__td`。
- **本仓取证**：`src/components/data-table/types.ts` 的 `DataTableProps` 无 `size`；`src/components/data-table/data-table.vue` 的表头 / 数据单元格内边距固定为 `var(--caomei-space-2) var(--caomei-space-3)`，无密度档位 token；[DataTable 组件页](../../components/data-table.md)「样式定制」表未列密度变量。[从 PrimeVue 迁移](../../guide/primevue-migration.md) 的「表格密度与表级结构」已给出 CSS 覆盖口径（Phase 27 M3-1 回收）。
- **判定**：**真实缺口 + 文档缺口**（能力缺 prop / token，组件页缺配方），但页面级 CSS 可覆盖，**不构成阻塞**。
- **设计取向（待用户决策）**：提供密度 prop 或 `--caomei-data-table-density-*` token；或明确不提供，组件页补 CSS 覆盖配方并在迁移指南登记为有意差异。若走 CSS 覆盖，需说明它作用于同页所有表格，建议限定在表格容器上。
- **下游可行写法**：页面级 CSS 覆盖；或接受默认密度。
- **登记**：[Backlog §1.1](../../plan/backlog.md) 新增候选；[Backlog §1.6](../../plan/backlog.md) 新增配方文档项。

### 2.5 §5 `DataTable` 选择列宽度（评估）

- **现象复述**：`selection-mode="multiple"` 的选择列宽度不可配置（issue 自述 PrimeVue 52px vs caomei 约 34px），会导致整表列宽与表头偏移。
- **本仓取证**：`src/components/data-table/data-table.vue` 的 `.caomei-data-table__select-cell` 硬编码 `width: 1%` 与 `padding-inline: var(--caomei-space-2)`，无宽度 token；[DataTable 组件页](../../components/data-table.md) 迁移表已声明「选择列固定渲染在首列，**其宽度与样式不可配置**」。
- **判定**：**真实缺口**（无 token 钩子），但下游可页面级补偿或接受差异，**不构成阻塞**。
- **候选取向**：新增 `--caomei-data-table-selection-column-width`（及必要的内边距 token）；若不提供，迁移指南明确「接受差异 + 视觉基线登记」口径。
- **下游可行写法**：接受差异；或页面级补偿。
- **登记**：[Backlog §1.1](../../plan/backlog.md) 新增候选。

### 2.6 §6 `DataTable` 表头全选作用域（确认）

- **现象复述**：caomei-auth 的 `pages/admin/users.vue` 使用 `selection-mode="multiple"`；caomei-ui 表头全选只作用当前页，PrimeVue 客户端分页作用整表。
- **本仓取证**：`src/components/data-table/data-table.vue` 以 `getIsAllPageRowsSelected` / `getIsSomePageRowsSelected` / `toggleAllPageRowsSelected` 实现页口径；[DataTable 组件页](../../components/data-table.md)「行选择」段与迁移表均声明该有意差异，并给出「父级聚合 `selection` / 自建选择栏」路径。
- **判定**：**确认项（有意差异，已文档化）**。本 issue 仅确认、不请求变更；下游处理方式与现行契约一致。
- **登记**：不新增候选；[Backlog §1.1](../../plan/backlog.md) 既有「DataTable 全表 / 服务端全选契约」条件候选保持原样。

## 3. Backlog 登记结果

按 [规划规范 §3](../../standards/planning.md)（默认路径：评估 → backlog → 用户决策），本评估**只登记候选池，不进入 `todo.md` 当前阶段**（Phase 27 为已授权范围，未获授权不扩面）。

- [Backlog §1.1 组件增强候选](../../plan/backlog.md)：
    - **更新**「DatePicker 范围选择」：来源追加 caomei-auth 迁移反馈；说明触发条件已满足（1 处真实用例）；优先级低 → 中。
    - **新增**「Toast 逐语气样式 token / 覆盖路径」（主诉求，优先级中）。
    - **新增**「DataTable 密度（`size` prop / 密度 token）」（评估，优先级低）。
    - **新增**「DataTable 选择列宽度 token」（评估，优先级低）。
    - **更新**「Paginator 页码报表」：用例由 dependfix 3 处增至 4 处（caomei-auth 1 处），触发条件不变。
- [Backlog §1.6 基建与治理候选](../../plan/backlog.md)：**新增**「caomei-auth 迁移样式配方文档补强」（Toast 逐语气薄封装 / DataTable 密度 CSS 覆盖 / 选择列宽度接受口径，优先级低）。
- [Backlog §3 已评估、不纳入](../../plan/backlog.md)：本次无新增条目（§6 为已文档化的有意差异，不属否决记录）。
- **候选池计数**：34 → 38（新增 4 行：§1.1 三行 + §1.6 一行；DatePicker / Paginator 为既有行更新）。

## 4. 候选覆盖声明

issue 6 条受检项**逐条有落点，无静默豁免**：

- **§1 DatePicker 范围选择** → Backlog §1.1 既有候选升级（待决策，优先级中）；中英组件页的「零下游用量」表述同批同步。
- **§2 Toast 逐语气样式** → Backlog §1.1 新增候选 + Backlog §1.6 文档项；下游可用「接受默认 / 薄封装」承接。
- **§3 Paginator 页码报表** → Backlog §1.1 既有条件候选补充 1 处用例；触发条件未满足。
- **§4 DataTable 密度** → Backlog §1.1 新增候选 + Backlog §1.6 CSS 配方文档项；下游可 CSS 覆盖。
- **§5 DataTable 选择列宽度** → Backlog §1.1 新增候选；下游可接受差异或页面级补偿。
- **§6 DataTable 表头全选作用域** → 确认项，不新增候选；现行有意差异与 Backlog §1.1 全选契约候选均已在册。

## 5. 边界与未覆盖

- **零 `src/` / `test/` 改动**；未运行 `pnpm build` / `pnpm test` / `pnpm test:e2e`，本评估为静态比对，不含运行时验证。
- **未读取 caomei-auth 仓库**：issue 中的下游用例数（DatePicker 1 处、Paginator 1 处、Toast 56 个 `--p-toast-*`、DataTable 多处 `size="small"`）按 issue 自述采信，未在 caomei-auth 侧复核；若后续复测到差异，以复测为准。
- **版本口径**：本仓 `package.json` 为 `1.0.0`；本地 master 可能包含未发布的 1.1.0 组件。受检 4 个组件的 `src/` 自 `v1.0.0` 未变（`git diff v1.0.0..HEAD --stat -- src/components/{date-picker,toast,paginator,data-table}` 空输出），故按 1.0.0 能力面评估；**未**与 npm `1.0.0` tarball 逐项比对。
- **存量表格结构**：[Backlog §1.8](../../plan/backlog.md) 有一行既有候选（`momei 根包接入下游兼容检查`）同样为 4 单元格 / 3 列，属本批之前存量，未纳入本次改动；本批新增的 §1.6 行已按 3 列修正。
- **未决定实现形态**：DatePicker 返回值形态、Toast 是否新增逐语气 token、DataTable 是否新增密度 prop / 选择列宽度 token，均留待用户决策与实施批次论证；本文只登记候选与取证。
- **未改 GitHub issue**：本评估不向 issue 回帖、不关闭 issue；下游结论以本记录与 Backlog 为准。

## 6. Review Gate

- **audit-depth**：`quick`（仅规划文档与 Backlog 登记，零 `src/` 改动；时间盒 ≤ 5 分钟）。
- **R1**：`Reject`（1 blocker / 2 warning / 4 suggest）。blocker = `docs/plan/backlog.md` §1.6 新增行 4 单元格 / 表头 3 列；warning = 中英 DatePicker 页仍写「零下游用量」、版本口径「npm 1.0.0 产物与本仓源码一致」不可判定；suggest = 触发条件证据未标注 issue 自述、索引占位标记、§1.8 存量同类表格行、§1.6 来源缺 issue 链接。均已同批修复或显式登记边界。
- **R2**：`Pass`（0 blocker / 0 warning / 0 新增 suggest）。R1 的 RG-B1 / RG-W1 / RG-W2 全部关闭；R1 suggest 处置接受；§1.8 存量表格行以「本批范围外」登记，不阻断。
- **实际用时**：R1 发起 2026-11-05 18:26:19 → R2 收口 18:35:05，两轮合计约 **8 分 46 秒**（含 R1 发现修复与 R2 复审），**超出 5 分钟时间盒**；单轮 R1 / R2 均按 `quick` 执行，超出部分来自同批修复与复审。
- **复查基线**：HEAD `95010cb` + 当前工作区。
