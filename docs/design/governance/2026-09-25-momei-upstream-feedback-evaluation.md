# 2026-09-25 momei 上游反馈评估与 Backlog 登记

> 来源：momei 仓库 `docs/design/governance/2026-09-25-caomei-ui-upstream-feedback.md`（momei 侧 PrimeVue → caomei-ui 迁移沉淀；**8 条待反馈项**（§1.1~§1.5 / §2.1~§2.3）+ **6 条「非问题」**（§3））。
> 评估主体：caomei-ui（本仓）。
> 事实源与 revision：momei `f578ea716235005c0e8331227e3ca69233050780`（工作区脏 **17 项**：15 个已修改——`.github/skills/todo-manager/SKILL.md`、`.opencode/configs/opencode.xiaomi.json`、`docs/i18n/{en-US,ja-JP,ko-KR,zh-TW}/plan/roadmap.md`、`docs/plan/{backlog,roadmap,todo,todo-archive}.md`、`docs/plan/archive/index.md`、`docs/standards/{development,documentation,planning,testing}.md`——+ 2 个已暂存新增 `docs/plan/archive/{roadmap-phases-54-67,todo-archive-phases-61-63}.md`；**反馈文件本身干净、位于 HEAD**。本评估只读该反馈文件，未触碰 momei 工作区）。本仓 `0.3.0`（`package.json`，评估时 HEAD `85ca972`）。
> **版本口径差异（须先声明）**：momei 反馈自述其事实源为 `caomei-ui@0.2.0`，本仓现为 **0.3.0**。0.2.0 → 0.3.0 的增量为 `DataTable` 行分组 / 行展开 / 多列排序与 `TagsInput`（Phase 13），与本次 8 条受检项**均不相交**，故逐条判定对 0.3.0 同样成立；若后续下游在 0.3.0 上复测到差异，以复测为准。
> 口径与方法：**只读静态比对**——逐条在 `src/` 与 `docs/` 复核落点，行号为 2026-09-25 快照；未运行任一侧构建或测试；**零 `src/` 改动**。
> 判定取值：**真实缺口**（本仓确缺且未登记为有意差异）/ **文档缺口**（行为已在，但迁移陷阱未文档化）/ **设计如此**（库文档已声明为有意差异）。
> 快照日期：2026-09-25。

## 1. 结论摘要

| 反馈项 | 事项 | 判定 | 落点 |
| :--- | :--- | :--- | :--- |
| §1.1 | `Select` 的 `class` 落触发器、`max-width` 宿主在字段外层 | **文档缺口**（token 口径已文档化；`class` / `$attrs` 落点未文档化）+ 有条件 API 候选 | [Backlog §1.6](../../plan/backlog.md) 文档候选；`fieldClass` 为 Backlog §1.1 条件候选 |
| §1.2 | `optionValue` 对 `null` 选项静默不渲染 | **设计如此（已文档化）** | 不纳入（本记录 §2.2）；开发期告警为 Backlog §1.1 条件候选 |
| §1.3 | 无「图标按钮」形态（`iconOnly`） | **真实缺口** | Backlog §1.1（优先级中） |
| §1.4 | 分页器对齐不可配置 | **真实缺口** | Backlog §1.1（优先级低） |
| §1.5 | `Select` 缺触发器 `#value` 插槽 | **真实缺口** | Backlog §1.1（优先级中） |
| §2.1 | `Avatar` 尺寸档位少于 PrimeVue | **设计如此（已文档化）**；`xl` 档位为可选增强 | 不纳入差异（本记录 §2.6）；`xl` 为 Backlog §1.1 低候选 |
| §2.2 | `DataTable` 列 `class` 与 scoped 样式陷阱 | **文档缺口** | Backlog §1.6 文档候选 |
| §2.3 | `showClear` 在「哨兵值恒非空」下的行为 | **文档缺口**（§1.2 的连带） | Backlog §1.6 文档候选 |

**构成**：真实缺口 **3** / 文档缺口 **3** / 设计如此 **2**，合计 **8**（逐条落点见 §5）。

## 2. 逐项评估

### 2.1 反馈 §1.1：`Select` 的 `class` 落触发器、宽度上限在字段外层

- **现象复述**：`<CaomeiSelect class="x">` 的 `class` 落在触发器 `.caomei-select`，而 `--caomei-select-max-width` 的宿主是字段外层 `.caomei-select__field`；把宽度类写在组件上静默无效。
- **本仓取证**：`src/components/select/select.vue` —— `defineOptions({ inheritAttrs: false })` 与 `v-bind="{ ...$attrs, ...labelAttrs(label) }"` 落在 `SelectTrigger` 上（触发器带 `class="caomei-select"`）；`--caomei-select-max-width` 的**默认值**声明在 `src/styles/theme.css`（`20rem`），组件侧只由 `.caomei-select__field` 的 `max-width` 消费；模板中字段外层是 `.caomei-select__field`，触发器与清除按钮为其两个兄弟节点。组件未提供字段层 class 透传 prop。
- **文档现状**：[主题与样式设计 §4.1](../theming.md) 与 [Select 组件页](../../components/select.md) 已明确「`Select` 的上限由字段外层承载，直接写在 `.caomei-select`（触发器）上不生效」，即 **token 覆盖口径已文档化**。但**「`class` / `$attrs` 的落点是触发器」这一事实未文档化**——下游据此误判「组件上写类即可约束宽度」。
- **判定**：**文档缺口**（行为非缺陷，属 attrs 透传设计）；下游另有 `fieldClass` 透传诉求，登记为**条件候选**。
- **现行可替代写法**：外层包一个容器、把宽度约束与 token 覆盖放在包裹元素或任意祖先上（momei 已采用）。

### 2.2 反馈 §1.2：`optionValue` 对 `null` 选项静默不渲染

- **现象复述**：`optionValue` 解析结果非 `string` / `number` 的选项不渲染；下游以 `value: null` 表达「全部 / 不限」时该选项静默消失。
- **本仓取证**：`src/components/_shared/option.ts` —— `OptionValue = string | number`，`resolveOptionValue` 把非字符串 / 数字（含 `null`、`undefined`、布尔、对象、字段缺省）一律返回 `undefined`；`select.vue` 的 `normalizedOptions` / `normalizedGroups` 对 `value === undefined` 直接 `continue`（丢弃）。
- **文档现状**：[Select 组件页](../../components/select.md) 明确「`optionValue` 解析结果不是字符串 / 数字（如 `null`、布尔、字段缺省）时该选项**不渲染**」；[设计规范 §7](../design-spec.md) 的「Select 家族对象选项映射」同样声明该收窄为已实现契约。即**属有意设计且已文档化**，对齐 Reka UI `AcceptableValue` 中可稳定比较的子集。
- **判定**：**设计如此（已文档化）**。反馈提出的「支持 `null` 值选项」涉及独立哨兵区分「未选择」，属契约变更，不纳入；反馈提出的「开发期告警」属 DX 增强，登记为**条件候选**（Backlog §1.1），待用户决策。

### 2.3 反馈 §1.3：无「图标按钮」形态

- **现象复述**：仅 `#icon` + `variant="ghost"` 的行内动作按钮仍按 `--caomei-button-padding-x` 渲染，非方形；下游需自行把 `--caomei-button-padding-x` 置 `0` 并固定宽度。
- **本仓取证**：`src/components/button/button.vue` —— 基类 `padding: 0 var(--caomei-button-padding-x, var(--caomei-space-3))`，无「无默认插槽内容时收敛为方形」的分支；`src/components/button/types.ts` 无 `iconOnly`（或等价）prop。
- **文档现状**：[设计规范 §7](../design-spec.md) 的 Button 迁移段只说明 `icon` → `#icon` 插槽与「未实现 / 未暴露」清单，**未把「无图标按钮形态」登记为有意差异**；[Button 组件页](../../components/button.md) 迁移表亦未提及。
- **判定**：**真实缺口**（未实现且未登记为有意差异），下游已出现重复本地补丁。登记 Backlog §1.1（优先级中）。

### 2.4 反馈 §1.4：分页器对齐不可配置

- **现象复述**：`DataTable` 分页容器固定右对齐，无 token 钩子；PrimeVue 默认居中。
- **本仓取证**：`src/components/data-table/data-table.vue` 的分页容器 `.caomei-data-table__pagination` 硬编码 `justify-content: flex-end`；该文件声明的 `--caomei-data-table-*` token 为 `border` / `expansion-bg` / `group-bg` / `head-bg` / `row-bg` / `row-hover-bg` / `selected-bg` / `striped-bg`，**无对齐类 token**（源码判读，快照 2026-09-25）。
- **文档现状**：[DataTable 组件页](../../components/data-table.md)「分页」节只说明受控 / 懒加载语义，未声明右对齐为有意差异。
- **判定**：**真实缺口**（缺 token 钩子，且与「优先用 `--caomei-*` token 定制」的对外指引冲突，下游只能选择器级覆盖）。登记 Backlog §1.1（优先级低）。

### 2.5 反馈 §1.5：`Select` 缺触发器 `#value` 插槽

- **现象复述**：`Select` 仅有 `#option`，触发器只能显示 `optionLabel` 解析文本；PrimeVue `#value` 的「图标 + 文案」触发器无等价写法。
- **本仓取证**：`src/components/select/select.vue` —— `defineSlots` 只声明 `option`；触发器内容写死为 `<SelectValue>` 内的 `selectedLabel` / `placeholder` 两个 `span`，无插槽分支。
- **文档现状**：[设计规范 §7](../design-spec.md) 的「Select 清空与自定义选项」只登记 `#option`，未声明「触发器插槽不提供」为有意差异。
- **判定**：**真实缺口**（未实现且未登记为有意差异）。登记 Backlog §1.1（优先级中）。

### 2.6 反馈 §2.1：`Avatar` 尺寸档位少于 PrimeVue

- **现象复述**：本库档位 `sm`(24) / `md`(32) / `lg`(40)，PrimeVue 为 `normal` / `large` / `xlarge`；更大档位只能覆盖 `--caomei-avatar-size`。
- **本仓取证**：`src/components/avatar/avatar.vue` 仅有 `--sm` / `--md` / `--lg` 三个档位块（24 / 32 / 40）。
- **文档现状**：[Avatar 组件页](../../components/avatar.md) 已给 `size`（`normal` / `large` / `xlarge`）→ `size`（`sm` / `md` / `lg`）的档位映射表与 `--caomei-avatar-size` 覆盖配方；[设计规范 §7](../design-spec.md) 的 Avatar 段落亦登记默认值差异。即**档位差异已文档化且有覆盖路径**，不构成静默失效。
- **判定**：**设计如此（已文档化）**；反馈建议的补 `xl` 档位属可选增强，登记 Backlog §1.1（优先级低），待用户决策。

### 2.7 反馈 §2.2：`DataTable` 列 `class` 与 scoped 样式

- **现象复述**：PrimeVue `<Column class>` 同时落表头与数据单元格；本库需分别用 `headerClass` / `bodyClass`。更关键的是 `<td>` 由组件内部渲染、不带**使用方**页面的 scoped 属性，故下游 `.vue` 的 scoped 样式对单元格类静默不生效。
- **本仓取证**：`src/components/data-table/data-table.vue` 表头 / 数据单元格分别绑定 `columnMap.get(id)?.headerClass` / `bodyClass`；`src/components/data-table/types.ts` 提供 `headerClass` / `bodyClass` / `headerStyle` / `bodyStyle`。单元格由本组件（而非使用方页面）渲染，属 Vue scoped 样式的通用行为。
- **文档现状**：[DataTable 组件页](../../components/data-table.md) 的列定义表列出了四个字段，但**未提示**「使用方 scoped 样式不命中内部单元格」这一迁移陷阱；[从 PrimeVue 迁移](../../guide/primevue-migration.md) 的「常见陷阱」表 16 行亦无此条。
- **判定**：**文档缺口**（非组件缺陷）。登记 Backlog §1.6 文档候选，与反馈 §1.1 / §2.3 合并为一条「迁移陷阱文档补强」。

### 2.8 反馈 §2.3：`showClear` 在「哨兵值恒非空」下的行为

- **现象复述**：`clearable = showClear && hasValue && !disabled`，而 `hasValue` 不把「恒非空的哨兵值」视为空；若下游用哨兵承载「全部」，清除按钮恒显且点击为无操作。
- **本仓取证**：`src/components/select/select.vue` —— `hasValue` 仅排除 `undefined` / `null` / `''`，无「按语义空值」判断的钩子；`clearable` 与之一致。
- **文档现状**：[Select 组件页](../../components/select.md) 只说明「`showClear` 在有选中值时显示清除按钮，点击后模型置 `null`」，**未说明 `hasValue` 口径**，也未给出哨兵场景的说明。
- **判定**：**文档缺口**（§1.2 的连带：哨兵值本身就是对 `null` 契约的绕行写法）。登记 Backlog §1.6 文档候选。

## 3. 反馈 §3「非问题」复核

反馈 §3 自陈这些为已在库文档声明为有意差异的项，本评估逐条核验其已登记：

| 反馈 §3 项 | 本仓核验 | 结论 |
| :--- | :--- | :--- |
| `DataTable` 的 `page` 为 1 基 | [Paginator 组件页](../../components/paginator.md) 迁移表与 [设计规范 §7](../design-spec.md) Paginator 段均写明 `v-model:first`（0 基）→ `v-model:page`（1 基） | 已登记，非缺口 |
| 列级 `selection-mode` 收敛为表格级 `selectionMode` | [DataTable 组件页](../../components/data-table.md) 迁移表与 §7 DataTable 段均有 | 已登记，非缺口 |
| `frozen` + `align-frozen` 收敛为 `frozen: 'left' \| 'right'` | 同上 | 已登记，非缺口 |
| `Select filter` 未实现，映射 `AutoComplete` | [设计规范 §7](../design-spec.md)「可搜索单选」行与迁移指南陷阱表均有 | 已登记，非缺口 |
| 浮层（Dialog / Drawer / Popover / DropdownMenu）与 `v-tooltip` 迁移延后 | 属 momei 侧批次编排，非库侧缺口 | 确认非库侧项 |
| `ConfirmDeleteDialog` 等共享壳并存期组件 | 属 momei 侧编排 | 确认非库侧项 |

## 4. Backlog 登记结果

按 [规划规范 §3](../../standards/planning.md)（默认路径：评估 → backlog → 用户决策），本评估**只登记候选池，不进入 `todo.md` 当前阶段**（Phase 14 为已授权范围，未获授权不扩面）。登记动作：

- [Backlog §1.1 组件增强候选](../../plan/backlog.md)：新增 6 行——Button `iconOnly`、Select `#value` 插槽、DataTable 分页对齐 token、Avatar `xl` 档位（以上为待决策候选）；Select `fieldClass`、Select `null` 选项开发期告警（以上为条件候选）。
- [Backlog §1.6 基建与治理候选](../../plan/backlog.md)：新增 1 行——选择器 / 表格迁移陷阱文档补强（合并 §1.1 / §2.2 / §2.3 三处文档缺口）。
- [Backlog §3 已评估、不纳入](../../plan/backlog.md)：新增 1 行——Select 选项 `null` 值支持（判定为有意契约，记录结论与理由）。

## 5. 候选覆盖声明

反馈 8 条受检项**逐条有落点，无静默豁免**：

- **真实缺口 3 条**：§1.3 → Backlog §1.1（Button `iconOnly`）；§1.4 → Backlog §1.1（分页对齐 token）；§1.5 → Backlog §1.1（Select `#value`）。
- **文档缺口 3 条**：§1.1 / §2.2 / §2.3 → Backlog §1.6（迁移陷阱文档补强，一条覆盖三处）。
- **设计如此 2 条**：§1.2 → Backlog §3（不纳入记录）+ Backlog §1.1 条件候选（开发期告警）；§2.1 → 不纳入差异（本记录 §2.6）+ Backlog §1.1 低候选（`xl` 档位）。
- **条件候选 2 条**：§1.1 的 `fieldClass`、§1.2 的开发期告警 → 均登记 Backlog §1.1，需用户决策后启动。

反馈 §3 的 6 条「非问题」另见本记录 §3 复核表（4 条已登记为有意差异、2 条属 momei 侧编排）。

## 6. 边界与未覆盖

- **零 `src/` 改动、零测试改动**；未运行 `pnpm build` / `pnpm test` / 任一侧构建（本评估为静态比对，不含运行时验证）。
- 反馈声明的 `caomei-ui@0.2.0` 事实源与本仓 0.3.0 的差异见文首「版本口径差异」；本评估未在 0.2.0 产物上逐字节复核。
- 反馈 §1.1 的 305px / 180px 实测值引自 momei 侧记录，**本评估未独立复现该测量**；判定基于源码与文档，不依赖该数值。
- **未向上游仓库提交 issue / PR**（反馈文末明确为 momei 侧沉淀，是否同步另行确认）；本评估不修改 momei 仓库任何文件。
- 下游现状写法（哨兵字符串、包装元素约束 token、本地图标按钮类、`--caomei-avatar-size` 覆盖、列 `bodyStyle`）均已可行，故本次反馈**不构成下游阻塞**（与 momei 反馈文末结论一致）。

## 7. Review Gate 记录

- **R1（第 1 轮，`standard` 档，时间盒 ≤ 10 分钟）：`Pass`（0 blocker / 1 warning / 3 suggest）**。判定成立性经审计方抽查源码逐条复核（8 条全部确认，无「设计如此 ↔ 缺口」反转）；规划纪律（只入 Backlog 不升 `todo.md`、候选无阶段编号、结论留档与维护约定自洽）与治理约定（索引登记、跨仓 revision + 脏状态、无裸 grep 自引用陷阱、候选覆盖声明）均通过；`governance:check` 复算 exit 0。
  - **W1（warning，首次）**：momei 跨仓脏状态枚举不完整（实测 17 项、原记录只列 3 项）→ **已同批修正**：补全 15 修改 + 2 新增的逐条枚举，并声明「反馈文件本身干净、位于 HEAD」。
  - **S1（suggest，首次）**：Backlog 文档头声明「§1 仅收录尚未决策候选」与 `§1.9 已评估、不纳入` 自相矛盾 → **已同批修正**：`已评估、不纳入` 改为顶层 **§3**，文档结构声明与 §2 维护约定指针同步，候选池 §1 保持纯净。
  - **S2（suggest，首次）**：`--caomei-select-max-width` 的默认值声明在 `src/styles/theme.css`（组件侧为消费）→ **已同批修正**（措辞改「只由 `.caomei-select__field` 的 `max-width` 消费」，实质结论不变）。
  - **S3（suggest，首次）**：索引摘要用截断 hash 不便复现 → **已同批修正**（改 `f578ea71` + 完整 revision 指针指向记录文首）。
  - 4 条 finding 记为「**已修复未复审**」（R1 即 `Pass`、无 blocker，按既有惯例同批修正）。
- **用时口径（如实登记）**：发起时间戳 `date -Is` = `2026-09-25T17:06:47+08:00`；审计返回后调用方即刻执行修复，**未在返回时点单独取戳**（口径偏差）。以「发起 → 修复完成」上界计 elapsed ≈ 24 分钟（**含调用方修复操作**，不可作为审计自身用时）；按 [ai-collaboration §3.3](../../standards/ai-collaboration.md) 只作分级校准信号，不回溯要求补动作。
- **审计方声明的未覆盖边界**：未跑 `pnpm build` / `test` / `docs:build`（文档批次，零代码面）；未独立复现 momei 侧 305px / 180px 测量；未在 `caomei-ui@0.2.0` 产物上复核版本口径差异；§1.3 / §1.5「未登记为有意差异」为 grep 取证的否定命题（未逐字通读 design-spec §7 全文）；未读 `todo.md` / `roadmap.md`（本批未改动）。
