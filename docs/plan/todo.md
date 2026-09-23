# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

### Phase 13：组件能力补齐与 dependfix 迁移解阻

- **授权**：2026-09-23 用户裁定 D1~D9（范围与取向）后登记（**登记 = 范围授权；实施未启动**，各条目按 PDTFC+ 逐条开工与提交）；编号按 [规划规范 §4](../standards/planning.md) 取已有最大编号 +1（已有最大为 Phase 12）。范围依据见[下一阶段范围评估](../design/governance/2026-09-23-next-stage-scope-evaluation.md) §6 / §11。
- **定位**：下游 dependfix `apps/platform` 的 PrimeVue 迁移已判定「可行（有条件）」，阻塞点集中在本仓 `DataTable` 的三项结构性能力与 1 个缺失组件；本阶段先做**库侧补齐**，让下游能 pin 到含这些能力的版本完成关键路径解阻，再收口迁移交付面。
- **目标**：① 补齐 `DataTable` 行分组 / 行展开 / 多列排序（**API 命名对齐 PrimeVue**，最小化下游改写）；② 新增 `TagsInput` 组件（封装 Reka primitive）；③ 迁移交付面（文档映射 + **0.3.0** 版本发布 + 0.x API 冻结窗口）；④ 治理守卫精选（文档站双花括号插值机检）。
- **非目标**：不做 dependfix / momei 侧迁移实施（他仓执行）；**不做** `ScrollPanel` / `Sidebar` / `Select filter` / `MultiSelect filter` / `Paginator` 模板 / DataTable `size`·`empty-message` 的库侧补齐（下游有页面侧改写路径或既有口径承接，不构成阻塞）；**不启动 Phase 8**（用户裁定：等 dependfix 完成迁移后再评估）；不做 T5 的 31 项长期候选；**不改任何 token 色值**（对比度遗留项与实底前景配对复核须另行裁定）；不做多版本托管；不修改 `AGENTS.md`（受保护文件）。
- **用户决策（2026-09-23，对应评估记录 D1~D9）**：① **D1 主线取舍**：取 **M1 + M2 + M3 + M4**（全取）；② **D2 `DataTable` 新能力 API 命名取向**：**对齐 PrimeVue 命名**（`rowGroupMode` / `groupRowsBy` / `expandableRowGroups` / `expandedRowGroups` / `#groupheader` / `expandedRows` / `expander` / `#expansion` / `rowExpand` / `sortMode` / `multiSortMeta`）；③ **D3 受控模型**：受控与自持**两者都支持**（受控优先、缺省自持）；④ **D4**：提供 **`sortDescFirst`**（降序优先）；⑤ **D5 `TagsInput` 形态**：封装 Reka `TagsInput` primitive；⑥ **D6**：**不补**独立 `Sidebar`（维持 `CaomeiDrawer` 承接）；⑦ **D7**：**发布 0.3.0**（本地手动发布，依赖 npm 凭据）；⑧ **D8**：Phase 8 **维持未启动**；⑨ **D9**：M4 **纳入 1 项**（文档站双花括号插值守卫）。
- **执行顺序**：M1（关键路径，先行）→ M2 → M4 可与 M1 / M2 并行 → M3 的文档映射随各条目同批交付，**版本发布（M3-2）与冻结窗口声明（M3-3）最后**，使 0.3.0 覆盖本阶段全部代码改动。同一主线内条目按本表自上而下顺序执行；跨主线改同一文件时串行（`src/components/data-table/*` 由 M1 独占；`docs/.vitepress/config.ts`、组件登记面与[设计规范 §7](../design/design-spec.md) 的逐条目映射由 M1 / M2 独占，M3-1 只做跨组件收口与回扫、不重写逐条目映射）。
- **阶段验收**：阶段验收通则见[路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面 / 样式 / 交互时另经 `@ui-validator` 验证；**本阶段含发布动作，故收口前与发布前各需执行一轮[长期任务](./recurring.md)门槛复核并留痕**；`DataTable` 改动的硬门禁为「新能力默认关闭时既有行为与计算样式零漂移」。
- **进度（2026-09-23）**：**M1-1 行分组（subheader）已交付**（12 文件 / +768 −42，拆两次提交；`pnpm test` 84 文件 / 1691 tests、`capture:styles` 239 项 0 差异、`docs:check` 9 段链全绿、`@ui-validator` 复验 8 项全通过、`@code-reviewer` Review Gate 第 1 轮 **Pass**（0 blocker）；交付与验证记录见[治理记录](../design/governance/2026-09-23-m1-1-row-grouping.md)）。**M1-2 可折叠分组已交付**（22 文件 / +664 −16，拆三次提交；`pnpm test` 84 文件 / 1703 tests、`check:locale-keys` 5 语种各 73 条、`capture:styles` 239 项 0 差异、`@ui-validator` 9 项全通过；Review Gate 第 1 轮 **Reject**（1 blocker：内置文案台账未同步新键，无门禁覆盖）→ B1 与 6 条 suggest 同批修正 → 第 2 轮（只审修复点）**Pass**（0 blocker）→ 记录见[治理记录](../design/governance/2026-09-23-m1-2-expandable-row-groups.md)）。M1-3 行展开 / M1-4 多列排序与降序优先、M2、M3、M4 **未启动**。

#### M1 `DataTable` 能力补齐（dependfix 迁移关键路径）

- 执行范围：为 `CaomeiDataTable` 补 ① 行分组（subheader 渲染 + 分组键 + `#groupheader` 槽）、② 可折叠分组（受控展开集合 + 内建 toggle 与可访问语义）、③ 行展开（受控展开行集合 + 展开列 + `#expansion` 槽 + 行展开事件）、④ 多列排序（多键排序模型 + 受控 `multiSortMeta`）与降序优先（`sortDescFirst`）。**API 命名一律对齐 PrimeVue**（用户裁定 D2）。
- 非目标：不做虚拟滚动 / 服务端导出 / 列拖拽 / 列固定增补；不改既有单列排序与分页的公开行为（新能力为**增量、默认关闭**）；不补 `size` / `empty-message`（既有 `emptyText` + CSS 变量口径承接）。
- 最小验收标准：① **新能力默认关闭时既有 `DataTable` 行为与计算样式零漂移**（计算样式取证装置 239 项基线口径 + 既有单测全通过）；② 每项能力带正反例语料（分组键切换 / 折叠往返 / 展开行嵌套内容 / 多键排序稳定性与 tie-break）；③ 分组与展开在**受控**与**自持**两种模式下均有断言；④ 可访问语义经 `@ui-validator` 真机验证（`aria-expanded` / 键盘可达 / 焦点不丢失 / 分组标题的可访问名）；⑤ 组件页（中英）、示例与[设计规范 §7](../design/design-spec.md) 映射同批交付，含「对齐 PrimeVue 的命名映射表」。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M1-1 | 行分组（subheader） | `rowGroupMode="subheader"` + `groupRowsBy` + `#groupheader` 槽；按分组键渲染分组标题行，与既有排序 / 分页 / 选择 / 冻结列协同 | 默认关闭零漂移；分组键切换（含 `none` 态）与空分组边界有断言；组件页 + §7 映射同批 | D2 |
| M1-2 | 可折叠分组 | `expandableRowGroups` + `v-model:expandedRowGroups`（`string[]`）+ 内建 toggle 按钮与 chevron；受控优先、缺省自持 | 折叠往返与受控 / 自持双模式断言；toggle 有可访问名与键盘可达；`@ui-validator` 真机通过 | M1-1 |
| M1-3 | 行展开 | `v-model:expandedRows` + 展开列（`expander`）+ `#expansion` 槽 + `rowExpand` 事件；展开区可承载嵌套内容 | 展开 / 收起往返与双模式断言；展开列不破坏既有列宽与冻结列；`@ui-validator` 真机通过 | M1-1 |
| M1-4 | 多列排序与降序优先 | `sortMode="multiple"` + `v-model:multiSortMeta`（多键 + 方向）；暴露 `sortDescFirst`（首次点击方向可配）；与既有单列排序路径互斥且不回归 | 多键排序稳定性（含相同键值 tie-break）断言；`sortDescFirst` 两种取值各有用例；单列路径零漂移 | M1-1 |

#### M2 缺失组件补齐（`TagsInput`）

- 执行范围：新增 `CaomeiTagsInput`——封装 Reka `TagsInput` primitive（`TagsInputRoot` / `Input` / `Item` / `ItemDelete` / `ItemText` / `Clear`），提供多值 `v-model`、自由文本、回车 / 分隔符提交、标签删除、`max` / 去重 / `disabled` / `invalid` 等字段契约；按既有组件交付面齐备（`types.ts` / 导出 / Nuxt 组件注册 / locale 命名空间 / a11y 受检面 / 中英组件页 / 示例 / 迁移节 / [设计规范 §7](../design/design-spec.md) / §11 侧栏登记）。
- 非目标：不做异步建议（`AutoComplete` 的职责）；不做标签分组 / 拖拽排序；**除 `max` 外的 `Chips` 专属展示能力**（如超长截断展示）按需登记 Backlog。
- 最小验收标准：① 组件 API 与 a11y 断言齐备（删除按钮可访问名、键盘提交与删除、`invalid` 语义）；② 中英组件页 + 示例 + §11 侧栏 / 总览页 / 画廊登记一致（`docs:check` 全绿，含 `check-docs-structure` 的 §11 不变式与 `check-showcase-registry`）；③ 文档明确「PrimeVue `Chips` 迁移首选 `CaomeiTagsInput`，`AutoComplete + multiple` 降为备选」；④ 不回归既有 47 组件的受检面（`pnpm test` / `test:a11y` / 计算样式基线）。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M2-1 | `TagsInput` 组件实现与内部接线 | `src/components/tags-input/**`（组件 / 类型 / 导出 / 样式 / 单测）+ `src/index.ts` + Nuxt 组件注册 + locale 命名空间 + a11y 受检夹具 | 组件行为与 a11y 断言通过；导出与 Nuxt 自动导入可用；`pnpm test` / `test:a11y` 通过 | D5 |
| M2-2 | `TagsInput` 组件页与示例 | 中英组件页（2 文件）+ 中英示例（按需 2~4 个 `.vue`）+ [设计规范 §7](../design/design-spec.md) 的该组件迁移映射 | `docs:check` 全绿（结构 / 链接 / parity）；迁移节含与 `Chips` 的映射、差异与「首选 / 备选」口径；预计 5~7 文件 | M2-1 |
| M2-3 | `TagsInput` 登记面接入 | [文档与演示站 §11](../design/documentation-site.md) 登记表 + 中英侧栏（`config.ts`）+ 中英组件总览页 + 画廊登记表（`showcase-registry.json`） | `docs:check` 全绿（`check-docs-structure` 的 §11 不变式 / `check-config-links` / `check-showcase-registry` / parity）；预计 7~8 文件 | M2-2 |

#### M3 迁移交付面（文档映射 + 版本 + 冻结窗口）

- 执行范围：① 跨组件的迁移映射与「不支持清单」收口（[从 PrimeVue 迁移](../guide/primevue-migration.md) + [设计规范 §7](../design/design-spec.md)）；② 版本交付：按 semantic-release 约定产出含本阶段能力的 **0.3.0** 并完成发布后校验；③ 0.x API 冻结窗口声明。
- 非目标：不做多版本托管（Backlog 附触发条件）；不做下游侧迁移实施与接入验证（外部反馈驱动）。
- 最小验收标准：① 迁移指南的不支持清单与各组件页、§7 逐条对齐（无「索引宣称穷尽」类不实表述）；② 版本 / CHANGELOG / annotated tag 三者一致，`npm view` 校验 `latest = 0.3.0`，tarball 含 `dist/styles/index.css` 且不含旧单体；③ 冻结窗口声明落 `guide/version-policy.md`，并与 dependfix `docs/design/governance/caomei-ui-migration.md` §12 的上收条件 3 对齐；④ 发布前执行一轮[长期任务](./recurring.md)门槛复核并留痕。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M3-1 | 迁移映射与不支持清单收口 | `guide/primevue-migration.md`（中英）+ [设计规范 §7](../design/design-spec.md)：补 `DataTable` 三项能力与 `TagsInput` 的映射；回扫「未实现 / 未暴露」清单与入口表一致性 | 两侧逐条对齐且不宣称穷尽；`docs:check` 全绿 | M1、M2 |
| M3-2 | 0.3.0 版本交付 | 版本基线 + `pnpm changelog` + annotated tag + 按 runbook 本地手动发布 + 发布后校验（含四项子路径冒烟） | 版本 / CHANGELOG / tag 一致；`npm view` = 0.3.0；发布记录登记治理索引；发布前门槛复核已留痕 | M1、M2、M3-1 |
| M3-3 | 0.x API 冻结窗口声明 | 在 `guide/version-policy.md`（中英）声明 1.0 前不再变更的能力面（组件 props / 子路径导出 / token 契约）与仍可能调整的面 | 中英同步；与 dependfix 迁移评估 §12 的上收条件 3 对齐；`docs:check` 全绿 | M3-2 |

#### M4 治理守卫精选

- 执行范围：文档站**双花括号插值机检守卫**——`docs/**/*.md` 中**围栏外**出现的字面双花括号纳入守卫，并登记允许插值的页面（`guide/version-policy.md` / `guide/getting-started.md` 与其英文页）。
- 非目标：不做与 dependfix 迁移无关的守卫扩面（T3 其余 3 项留 Backlog）。
- 最小验收标准：守卫带正反例语料、接入 `docs:check` 链、受检范围未被静默收窄可断言（含允许插值页面的登记与反向校验）。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | :-: | --- |
| M4-1 | 双花括号插值机检守卫 | 新增守卫脚本 + 正反例语料 + 允许插值页面的登记表（含反向校验）；接入 `docs:check` 链 | 反例（围栏外字面插值）exit 1 且消息精确；允许页放行；登记表失效即失败；全库零误报 | — |

#### 不纳入本阶段（含依据）

| 项 | 依据 |
| :--- | :--- |
| dependfix `apps/platform` 迁移实施（B0~B4） | 执行主体为 dependfix 仓库（其 Backlog C88）；本仓只交付库侧能力 |
| momei 侧迁移（B0b / B2 / B3 / B4） | 执行主体为 momei 仓库；本仓等待反馈 |
| `ScrollPanel` / `Sidebar` / `Select filter` / `MultiSelect filter` / `Paginator` 模板 / DataTable `size`·`empty-message` 的库侧补齐 | 下游有页面侧改写路径或既有口径承接，不构成阻塞（评估记录 §4 / §8） |
| Phase 8 下游兼容性回归机制 | 用户裁定 D8：维持未启动，等 dependfix 完成迁移后再评估 |
| T5 的 31 项长期候选（组件增强 / 国际化 / 移动端 / a11y / 文档站 / 基建治理 / 服务层与工具链）与 T4 的 3 项条件候选 | 未达本阶段容量门槛或为条件触发，留 [Backlog](./backlog.md) |
| 对比度遗留项盘点、实底前景 token 配对复核 | 涉改色 / 跨主题配对，须另行裁定，留 [Backlog](./backlog.md) |
| 多版本托管 / 视觉回归基线 / E2E 常驻入门禁 / Tailwind preset / Storybook / `@iconify/vue` / `useDialog` 等 | 长期候选或已有裁定，留 [Backlog](./backlog.md) |
| 修改 `AGENTS.md` | 受保护文件，须用户明确指示 |

## 未完成项汇总

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- **未启动 / 未完成阶段**：Phase 8（下游兼容性回归机制，稳定后启用）——用户 2026-09-23 裁定 D8 维持未启动，等 dependfix 完成迁移后再评估。范围见[路线图](./roadmap.md)。
- **等待外部反馈**：dependfix `apps/platform` 迁移实施（B0~B4）与 momei 侧迁移（B0b / B2 / B3 / B4）由对应仓库执行，本仓等待反馈。
- **后置项**：Phase 5 第二阶段的下游接入验证（发布后由下游实际迁移反馈驱动）。
- **未纳入任何阶段的候选**：见 [Backlog](./backlog.md)（组件增强、长尾组件、国际化与 RTL、移动端与响应式、基建与治理、服务层、下游协同等分组）。
- **已完成阶段的遗留项与已知偏差**：见[待办归档](./todo-archive.md) 与 [Backlog](./backlog.md)（后者承载其中仍待决策的候选）。
