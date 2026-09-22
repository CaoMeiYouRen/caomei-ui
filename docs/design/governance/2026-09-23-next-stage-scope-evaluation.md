# 下一阶段范围评估（Phase 12 归档后，dependfix 迁移优先）

- 日期：2026-09-23
- 触发：用户指令「开始规划下一阶段待办。为了不阻塞 dependfix 发版，下阶段可以考虑先补全缺失的组件。」
- 输入（只读取数快照）：
  - 本仓 `78b5b71`（Phase 12 已归档，**无进行中阶段**）；npm `latest` = **0.2.0**（2026-09-22 手动发布）
  - 下游 dependfix **工作区**（HEAD `1a73abc`，2026-09-22）：`apps/platform` 的 PrimeVue → caomei-ui 迁移评估与方案（`docs/design/governance/caomei-ui-migration.md`，**415 行，未提交**）与其 Backlog 候选 C88（`docs/plan/backlog.md`，**亦为未提交改动**）——即本评估的核心证据是**工作区快照而非某提交**，复现须以 dependfix 工作区（HEAD `1a73abc`）+ 该文件 415 行版本为准
- 方法与口径：**只读静态比对**——下游缺口取 dependfix 迁移评估的逐组件映射与属性用量；本仓能力面核对以源码 / 设计规范 / 文档为准（`rg` 计数 + 组件目录清单）。**未运行**任一仓库的构建或测试，**未改动任何代码**。
- 定位：**需求评估（设计先行稿）**。按[规划规范 §3](../../standards/planning.md) 产出候选盘点、主线草案与待决策项；**未分配阶段编号、未登记 `todo.md` 当前阶段**（授权启动时按已有最大编号 +1 分配）。
- 关联：[Backlog](../../plan/backlog.md)（候选池）、[组件设计 §5](../components.md)（primitive 候选清单）、[从 PrimeVue 迁移](../../guide/primevue-migration.md)（迁移口径）、[设计规范 §7](../design-spec.md)（映射权威）、[Phase 12 归档](../../plan/todo-archive.md)

---

## 1. 结论摘要

**结论：可行，且关键路径明确。** 下游 dependfix `apps/platform` 的迁移评估已判定「**可行（有条件）**」——其用到的 23 个 PrimeVue 组件中 21 个在本仓有等价组件，**不存在整体性阻塞**；剩余缺口集中在 **`DataTable` 的三项结构性能力**（行分组 / 行展开 / 多列排序），另有 1 个无对应组件（`Chips` 标签录入）、2 处页面侧改写（`ScrollPanel`、`Paginator` 页码报表）与若干机械映射。

因此下一阶段的自然取向是**「库侧补齐 → 下游解阻」**：先补 `DataTable` 能力与标签录入组件，再把迁移映射与版本交付面收口，使 dependfix 能 pin 到一个含这些能力的版本完成 B1（关键路径解阻）与 B2 / B3。

**规模画像**（本仓侧，可复现口径见 §5）：建议主线 **3 条必选 + 1 条可选**；核心为 `DataTable` 三项能力（本仓源码对 `rowGroup` / `expandedRows` / `sortMode` 等标识**当前 0 命中**，`sortDescFirst` 仅内部固定为 `false`）+ `TagsInput` 新组件。

**三点须先裁定**（详见 §7）：① `DataTable` 新能力的 **API 命名取向**（对齐 PrimeVue 以最小化下游改写 vs 本仓自有命名）；② `TagsInput` 的**封装形态**；③ 是否在本阶段内**发布 0.3.0** 供下游 pin（依赖发布凭据，上次为手动发布）。

---

## 2. 基线状态（Phase 12 归档后）

- **规划面**：Phase 12（发布就绪、文档对外与一致性收官）5 条主线 / 20 条原子条目全部交付并归档；`todo.md` 为「无进行中阶段 + 未完成项汇总」；长期任务台账 2 条（待执行批次 0 项、条件触发 2 项）。
- **交付面**：npm `latest` = **0.2.0**（含包形态破坏性变更 `styles.css` → `theme.css`）；子路径导出 `caomei-ui` / `caomei-ui/theme.css` / `caomei-ui/resolver` / `caomei-ui/nuxt`。
- **能力面**：组件 47 个（Tier 0~3 + 补全批），运行时依赖 4 个（`reka-ui` 2.10.4 / `@tanstack/vue-table` / `@internationalized/date` / `@lucide/vue`）；文档站具备组件画廊、站点版本单一来源与 8 段文档守卫。
- **质量面**：`pnpm verify` 全链路（含 `test` 1681 例、`docs:build`、`governance:check`）与 `pnpm test:a11y`（54 例，例外清单两向断言）为常驻门禁；计算样式取证装置（239 项冻结基线）接入周级回归。

---

## 3. 用户取向与本次评估的取舍

- 用户明确取向：**优先补全缺失组件，以不阻塞 dependfix 发版**。
- 由此确定的三条评估原则：
  1. **只纳入「下游已取证在用」的能力**——不为「将来可能用」扩面；下游用量以 dependfix 迁移评估的静态比对为准（含文件级落点）。
  2. **库侧补齐与页面侧改写二选一须显式裁定**——下游评估给出 A（库侧补齐）/ B（页面侧改写）/ C（混合）三选项并推荐 C；本仓侧评估只对「A 的库侧部分」负责，取向由用户在 §7 D2 裁定。
  3. **容量守纪律**——本阶段主线数控制在 3~6 条（[规划规范 §6](../../standards/planning.md)）；非 dependfix 相关的长期候选一律留在 Backlog，不借本次评估扩面。

---

## 4. 下游证据：dependfix 迁移的库侧缺口（逐条）

来源：dependfix `docs/design/governance/caomei-ui-migration.md` §5.2 / §5.3（快照 `1a73abc`，2026-09-22）。本仓核对口径：`rg` 于 `src/components/`，快照 `78b5b71`。

| # | 下游用法（文件级落点） | 本仓现状（已核对） | 缺口性质 |
| :-: | :--- | :--- | :--- |
| 1 | `alerts.vue`：`row-group-mode="subheader"` + `group-rows-by`（按 `packageName` / `repository` 动态切换）+ `#groupheader` 槽 | `rowGroup` / `groupRowsBy` / `#groupheader` **0 命中** | **结构性缺口（关键路径）** |
| 2 | `alerts.vue`：`expandable-row-groups` + `v-model:expanded-row-groups`（`string[]`）+ 内建 toggle 按钮 + chevron | `expandableRowGroups` / `expandedRowGroups` **0 命中**；无内建 toggle | **结构性缺口（关键路径）** |
| 3 | `batch-runs.vue`：`v-model:expanded-rows` + `Column expander` + `#expansion` 槽 + `@row-expand` | `expandedRows` / `expander` / `rowExpand` **0 命中** | **结构性缺口（关键路径）** |
| 4 | `alerts.vue` / `pr-checks.vue`：`sort-mode="multiple"` + `v-model:multi-sort-meta`（如 `[{_severityRank,-1},{packageName,1}]`） | `sortMode` / `multiSortMeta` **0 命中**；DataTable 为**单列**排序（`sortField` + `sortOrder`，受控 / 自持） | **结构性缺口（关键路径）** |
| 5 | 6 处 `:default-sort-order="-1"`（横跨 5 文件）：首次点击即降序 | 内部固定 `sortDescFirst: false`（首次点击恒升序） | **能力缺口** |
| 6 | `env-events.vue`：`scrollable` + `scroll-height` | 无 `scrollable` / `scrollHeight`（现有冻结列 + `min-width`） | 可改写（容器 + CSS 承接）；库侧补齐属可选 |
| 7 | `repos.vue`：`Chips`（自由文本多值标签录入，`fluid`） | **无 `Chips` / `TagsInput` 组件**；Reka UI 提供 `TagsInput` primitive（`TagsInputRoot` / `Input` / `Item` / `ItemDelete` / `ItemText` / `Clear`），[组件设计 §5](../components.md) 已列为后续候选 | **组件缺口** |
| 8 | `import-repos-dialog.vue` / `scans.vue` / `repo-history-dialog.vue`：`Paginator template` + `current-page-report-template`（`PrevPageLink CurrentPageReport NextPageLink RowsPerPageDropdown`） | `CaomeiPaginator` 无 `template` / `CurrentPageReport`；有 `v-model:page`（1 基）+ `rowsPerPageOptions` | 可改写（自渲染页码报表）；库侧补齐属可选 |
| 9 | `repo-history-dialog.vue` / `run-detail-dialog.vue`：`ScrollPanel`（固定 `height: 200px` 日志区） | 无 `ScrollPanel`；**已评估为「不自研」**（原生滚动容器 + CSS 足以覆盖，Backlog 已登记触发条件） | **不补**（维持既有裁定） |
| 10 | `layouts/default.vue` 等：`Sidebar`（1 处） | 无 `Sidebar`；`CaomeiDrawer` 可机械承接（`v-model:open` + `title` / `#header` + `position="right"`） | **不补**（Drawer 承接，下游评估已确认） |
| 11 | `schedules.vue`：`Select` + `filter`（时区搜索） | Reka Select 无 filter primitive；官方口径为映射到 `CaomeiAutoComplete`（设计规范 §7 / 迁移指南） | **不补**（既有口径） |
| 12 | `schedules.vue`：`MultiSelect` + `filter` + `display="chip"` | 搜索为内建常开、形态固定 chip；`filter` / `display` 删除即可 | **不补**（既有设计取向） |
| 13 | 16 处 DataTable `size="small"` / `empty-message` | 密度经 CSS variables 覆盖；空态有 `emptyText` + `#empty` 槽 | **不补**（既有口径） |
| 14 | `Column :export="false"`（3 处，PrimeVue 无该 prop，疑静默无效） | 无导出能力 | **不补**（下游删除即可） |

> **证据形态说明**：下游迁移评估与 C88 均为 dependfix **工作区未提交**产物（其仓库尚无对应提交），故本记录的引用只能以「工作区 + HEAD `1a73abc` + 文件行数」锚定，不能以提交号复现。
>
> **下游文档的一处口径滞后（仅登记，不改他仓）**：dependfix 迁移评估称「行分组 / 行展开二者均未登记于 caomei-ui Backlog」，该判断在其快照时点成立；本仓已于 2026-09-22 补登这两行候选（提交 `f7d8194`），本次评估再按下游文件级用法细化其 API 面（见 §6 M1）。

---

## 5. 候选盘点（T 组）

### T1 dependfix 迁移关键路径（库侧补齐）——6 项

| 候选 | 落点 |
| :--- | :--- |
| DataTable 行分组（subheader + `#groupheader` + 分组切换） | → M1 |
| DataTable 可折叠分组（`expandedRowGroups` + 内建 toggle） | → M1 |
| DataTable 行展开（`expandedRows` + `expander` + `#expansion` + `rowExpand`） | → M1 |
| DataTable 多列排序（`sortMode="multiple"` + `multiSortMeta`） | → M1 |
| DataTable 降序优先（`sortDescFirst`，承接 6 处 `default-sort-order="-1"`） | → M1 |
| TagsInput（标签录入） | → M2 |

### T2 迁移交付面（让下游可 pin）——3 项

| 候选 | 落点 |
| :--- | :--- |
| 新能力的组件页 + 设计规范 §7 映射 + 迁移指南（含「有损近似 / 不支持」清单） | → M3 |
| 版本交付（0.3.0）供下游 pin | → M3（依赖发布凭据，见 D7） |
| 0.x API 冻结窗口声明（下游 §12 条件 3） | → M3 |

### T3 治理守卫精选（容量内）——4 项

| 候选 | 落点 |
| :--- | :--- |
| 文档站双花括号插值机检守卫（Phase 12 两次踩中，违规只在渲染日志可见） | → M4（可选） |
| 直连 Reka 触发器的机检守卫（存在本库包装时组件内直连应告警） | → M4（可选） |
| 组件总览页与侧栏的成员对账（中英总览页仍缺 `CheckboxGroup`） | → M4（可选） |
| 迁移口径一致性守卫（入口表 / 组件页节 ↔ §7） | → M4（可选） |

### T4 条件候选（本轮不纳入，保留触发条件）——3 项

| 候选 | 落点 |
| :--- | :--- |
| DataTable `scrollable` / `scrollHeight`（下游 1 处可改写承接） | 条件触发：出现原生容器无法覆盖的用例 |
| Paginator 页码报表槽（下游 3 处可自渲染承接） | 条件触发：出现必须内建模板的真实用例 |
| Sidebar 独立组件（下游已由 Drawer 承接） | 条件触发：出现 Drawer 语义不适配的用例 |

### T5 长期候选（本轮不纳入，留在 Backlog）——31 项（择要，按主题重组）

- **组件增强（4）**：实底前景 token 配对复核、ColorPicker 色板导航增强、DatePicker 范围选择、触发器 `disabled` 透传与包装层归一化
- **国际化（3）**：语言矩阵 - 长期、RTL、locale 组织与注册治理
- **移动端与响应式（2）**：滚动容器键盘聚焦、触摸目标增强（用户已裁定暂不提升）
- **a11y（3）**：浮层展开态断言、既有例外修复候选、测试隔离与偶发失败
- **文档站（9）**：多版本托管、演示动画遗留项、示例外部图片依赖、主题 CSS 的 lint 覆盖、README / roadmap 版本句弱守卫、首页 hydration mismatch、画廊浏览器回归断言、示例可访问名补强、Review Gate 证据留存
- **基建与治理（7）**：AI 资产指针（`AGENTS.md`，受保护文件）、对比度遗留项盘点、样式侧旧命名裸类守卫、`check-design` 声明解析健壮性、`locale` 守卫能力演进、执行层规则重述与失效引用收敛、`ui-validator` 资产 follow-up
- **服务层与工具链（3）**：`useDialog`、`@iconify/vue` 可选接入、`CHANGELOG` 生成器健壮性收口

### T6 下游协同（2）——不在本仓阶段范围

| 候选 | 落点 |
| :--- | :--- |
| dependfix `apps/platform` 迁移实施（B0~B4） | **执行主体为 dependfix 仓库**（其 Backlog C88）；本仓只交付库侧能力 |
| momei 侧迁移（B0b / B2 / B3 / B4） | **执行主体为 momei 仓库**；本仓等待反馈 |

> **候选覆盖声明**：本节逐小节计数——T1 **6 项**、T2 **3 项**、T3 **4 项**、T4 **3 项**、T5 **31 项**（**择要**，按主题重组：组件增强 4 / 国际化 3 / 移动端 2 / a11y 3 / 文档站 9 / 基建治理 7 / 服务层与工具链 3）、T6 **2 项**，合计 **49 项**；另有 §8 具名的 **7 项**未纳入 T5 的 Backlog 候选。**逐条均有落点**（→ 主线 / 条件触发 / 不纳入并给出依据 / 他仓执行 / §8 具名），**无静默豁免**；本记录**不宣称 T5 即 [Backlog](../../plan/backlog.md) 全集**（T5 为长期候选择要，未收录项见 §8）。

---

## 6. 建议主线与原子条目（草案，待用户裁定）

> 主线数 **3 条必选 + 1 条可选**，符合[规划规范 §6](../../standards/planning.md) 的 3~6 条容量。条目编号仅为草案内的相对编号（**不构成阶段编号分配**）。

### M1 `DataTable` 能力补齐（dependfix 迁移关键路径）

- **执行范围**：为 `CaomeiDataTable` 补 ① 行分组（subheader 渲染 + 分组键 + `#groupheader` 槽）、② 可折叠分组（受控展开集合 + 内建 toggle 与可访问语义）、③ 行展开（受控展开行集合 + 展开列 + `#expansion` 槽 + 行展开事件）、④ 多列排序（多键排序模型 + 受控 `multiSortMeta`）、⑤ 降序优先（首次点击方向可配）。
- **非目标**：不做虚拟滚动 / 服务端导出 / 列拖拽 / 列固定增补；不改变既有单列排序的公开行为（新能力为增量，默认关闭）。
- **最小验收标准**：① 新能力**默认关闭**时既有 `DataTable` 行为与计算样式零漂移（取证装置 239 项基线口径）；② 每项能力带正反例语料（分组键切换 / 折叠往返 / 展开行嵌套 / 多键排序稳定性）；③ 排序与分组在**受控**与**自持**两种模式下均有断言；④ 行分组与行展开的可访问语义经 `@ui-validator` 真机验证（`aria-expanded` / 键盘可达 / 焦点不丢失）；⑤ 文档（组件页 + §7 映射 + 迁移指南）同批交付。
- **依赖**：D2 / D3 / D4 裁定（API 形态）。

### M2 缺失组件补齐（`TagsInput`）

- **执行范围**：新增 `CaomeiTagsInput`（标签录入：多值 `v-model`、自由文本、回车 / 分隔符提交、标签删除、`max` / 去重 / 校验钩子、可访问语义），封装 Reka `TagsInput` primitive；按既有组件交付面齐备（`types.ts` / 导出 / locale 命名空间 / 中英组件页 / 示例 / 迁移节 / 设计规范 §7 条目）。
- **非目标**：不做异步建议（那是 `AutoComplete` 的职责）；不做标签分组 / 拖拽排序。
- **最小验收标准**：① 组件 API 与 a11y 断言（含删除按钮可访问名、键盘提交与删除）；② 中英组件页与迁移映射齐备，`docs:check` 全绿；③ 下游替代路径可判定——文档明确「`Chips` 迁移首选 `CaomeiTagsInput`，`AutoComplete + multiple` 降为备选」；④ 不回归既有 47 组件的受检面（`pnpm test` / `test:a11y` / 样式基线）。
- **依赖**：D5 裁定（形态）。

### M3 迁移交付面（文档映射 + 版本 + 冻结窗口）

- **执行范围**：① 新能力的组件页与示例、[设计规范 §7](../design-spec.md) 映射条目、[从 PrimeVue 迁移](../../guide/primevue-migration.md) 的对应段（含「有损近似 / 不支持」清单更新）；② 版本交付：按 semantic-release 约定产出含本阶段能力的版本（0.3.0）供下游 pin；③ 0.x API 冻结窗口声明（哪些面在 1.0 前不再变更）。
- **非目标**：不做多版本托管（已在 Backlog 附触发条件）；不做下游侧迁移实施。
- **最小验收标准**：① 文档守卫全绿（结构 / 链接 / parity / 版本单一来源）；② 版本发布完成且 `npm view` 校验通过（**依赖发布凭据**，见 D7）；③ 冻结窗口声明落 `guide/version-policy.md` 并与 dependfix 迁移评估 §12 条件 3 对齐。
- **依赖**：M1 / M2 交付；D7 裁定。

### M4 治理守卫精选（**可选**，容量内 1~2 项）

- **执行范围**：从 T3 的 4 项中取 1~2 项（建议优先「双花括号插值守卫」与「组件总览页成员对账」——前者是 Phase 12 两次踩中的真实缺陷面，后者是已登记的存量不一致）。
- **非目标**：不做与 dependfix 迁移无关的守卫扩面。
- **最小验收标准**：守卫带正反例语料、接入既有门禁链、受检范围未被静默收窄可断言。
- **依赖**：D9 裁定（是否纳入及取哪几项）。

---

## 7. 待决策项（D 项）

| 编号 | 事项 | 候选取向 | 影响 |
| :-: | :--- | :--- | :--- |
| **D1** | 主线取舍 | ① 只取 M1（最小解阻）；② **M1 + M2 + M3（建议）**；③ M1 + M2 + M3 + M4 | 阶段容量与 dependfix B1 解阻时点 |
| **D2** | `DataTable` 新能力的 **API 命名取向** | ① **对齐 PrimeVue 命名**（`rowGroupMode` / `groupRowsBy` / `expandableRowGroups` / `expandedRowGroups` / `#groupheader` / `expandedRows` / `expander` / `#expansion` / `rowExpand` / `sortMode` / `multiSortMeta`）——下游改写成本最低，但与本仓既有命名风格（`emptyText` 等）不完全一致；② 本仓自有命名（如 `groupBy` / `groupHeader` / `expandable` / `expandedKeys`）——风格统一，但下游需逐处改名；③ 混合（能力名对齐、插槽名自有） | **本次最关键**：直接决定下游 B2 / B3 的改写量与 e2e 重写面 |
| **D3** | 分组 / 展开的**受控模型** | ① 对齐下游用法（`v-model:expandedRowGroups` / `v-model:expandedRows`）；② 内部自持 + 变更事件（下游用 ref 承接）；③ 两者都支持（受控优先、缺省自持） | 下游改写量与库内状态复杂度 |
| **D4** | 是否提供**降序优先**配置 | ① 提供 `sortDescFirst`（承接下游 6 处 `:default-sort-order="-1"`）；② 不提供，下游改数据层预排 | 下游 6 处改写的必要性 |
| **D5** | `TagsInput` 形态 | ① 封装 Reka `TagsInput` primitive（**建议**，与既有组件同源）；② `AutoComplete + multiple` 增强；③ 页面侧自绘（库侧不补） | 下游 `repos.vue` 的改写路径 |
| **D6** | 是否补 `Sidebar` 独立组件 | ① 不补，维持 `CaomeiDrawer` 承接（**建议**，下游评估已确认可行）；② 补独立 `Sidebar`（语义 / 默认值差异化的薄封装） | 组件数量与维护面 |
| **D7** | 是否在本阶段内**发布 0.3.0** | ① 发布（下游可 pin 到含新能力的稳定版；需 npm 凭据，上次为用户手动发布）；② 不发布，下游用 git / 本地 link 接入 | dependfix 的接入方式与其 §12 条件 3 |
| **D8** | **Phase 8**（下游兼容性回归机制）是否随 dependfix 接入启动 | ① 维持未启动（等 dependfix 完成迁移后再评估）；② 随本次接入启动（跨仓 CI 触发 + 已接入下游清单） | 是否新增一条主线 / 阶段容量 |
| **D9** | M4 治理守卫是否纳入及取哪几项 | ① 不纳入（全容量给 dependfix 解阻）；② 纳入 1 项（双花括号插值守卫）；③ 纳入 2 项（+ 组件总览页成员对账） | 阶段容量 |

---

## 8. 不纳入本次评估

| 项 | 依据 |
| :--- | :--- |
| dependfix `apps/platform` 迁移实施（B0~B4） | 执行主体为 dependfix 仓库（其 Backlog C88）；本仓只交付库侧能力 |
| momei 侧迁移（B0b / B2 / B3 / B4） | 执行主体为 momei 仓库；本仓等待反馈 |
| `ScrollPanel` / `Sidebar` / `Select filter` / `MultiSelect filter` / `Paginator 模板` / DataTable `size`·`empty-message` 的库侧补齐 | 下游评估已给出页面侧改写路径或既有口径承接（§4 #6~#14），**不构成阻塞** |
| §5 T5 的 **31 项**长期候选（择要） | 见 §5 T5，均为长期候选或已有裁定，留 [Backlog](../../plan/backlog.md) |
| T5 未收录的其余 Backlog 候选（**7 项**）：视觉回归基线、E2E 常驻入门禁、浮层交互 E2E 规格、常驻 E2E 规格 follow-up、`locale` 守卫能力演进、Tailwind preset（可选）、Storybook 组件工坊 | 均为长期候选或已有裁定（其中「富文本与图表封装」为 §1.3 的**外购建议**、非自研候选），留 [Backlog](../../plan/backlog.md) |
| 对比度遗留项与实底前景 token 配对复核 | 涉改色 / 跨主题配对，须另行裁定（Backlog 在册） |
| 修改 `AGENTS.md` | 受保护文件，须用户明确指示 |

---

## 9. 登记状态（截至本记录产出）

- **未分配阶段编号**：按[规划规范 §4](../../standards/planning.md)，编号只在用户授权启动时分配（取已有最大编号 +1，即 Phase 13）。
- **未登记 `todo.md` 当前阶段**：`todo.md` 维持「无进行中阶段 + 未完成项汇总」；本记录不构成启动授权。
- **已登记**：本记录入[治理索引](./index.md)；Backlog 的 `DataTable` 行分组 / 行展开 / 多列排序 / `TagsInput` 候选行按下游文件级用法细化，并新增 2 项条件候选（DataTable 滚动高度、Paginator 页码报表）。
- **下游文档不改**：dependfix 迁移评估与其 C88 属他仓资产，本记录只引用、不回写。

---

## 10. 风险与未覆盖边界

- **API 形态返工风险**：若 D2 取「本仓自有命名」而下游已按 PrimeVue 命名预估工作量，B2 / B3 的改写量会显著上升；反之若完全对齐 PrimeVue 命名，需接受本仓命名风格的一致性成本。
- **`DataTable` 改动面风险**：行分组 / 展开会触及排序、分页、选择、冻结列与插槽解析的既有交互路径；验收以「新能力默认关闭时零漂移」为硬门禁，避免既有下游（momei 等）回归。
- **发布凭据风险**：M3 的版本交付依赖 npm 凭据可用性（上次为手动发布；本地发布前须先验证凭据）。
- **未覆盖边界**：① 未运行下游构建 / 测试，下游用量与属性计数采信其静态比对口径；② 未评估 `DataTable` 三项能力的**实现路径选型**（如分组是否复用 `@tanstack/vue-table` 的分组 API）——属实施阶段的方案面，本记录不预设；③ 未盘点 momei / caomei-auth / rss-impact-next / afdian-linker 的其他缺口（本轮取向为 dependfix 解阻）。
