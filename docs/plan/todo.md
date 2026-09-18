# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

### Phase 7 第二阶段：库侧迁移就绪与交接计划

- **授权**：2026-09-17 用户授权启动并登记为本仓当前阶段；属 Phase 7 已授权阶段内的分段，**不新增阶段编号**（见[规划规范 §4](../standards/planning.md)）。
- **定位**：补齐 momei 迁移所需的库侧能力面，并产出可交接的迁移计划与验收标准；**momei 侧实际迁移由 momei 项目在自己的仓库执行**，本仓不触碰 momei 文件。
- **目标**：① 库侧能力面就绪（DataTable 列插槽 + B1 14 项增强）；② B0 交接资产（token / 图标映射表、并存隔离策略与包体监控口径）；③ 迁移计划与验收标准（对 momei 侧结果的校验依据）。
- **非目标**：不在本仓执行 momei 侧文件改动；不跑 momei 构建 / 测试作为本阶段验收；不启用跨仓 CI（属 Phase 8，历史预留编号未启动）；不代为采集 momei 视觉基线（归 momei 侧）。
- **用户决策（2026-09-17）**：按 C3 分批全量推进；B1 库侧补齐先行；B 级 14 项全部纳入 B1 执行（**范围登记，非「已交付」**）；接受 16 条有意差异；回归强度由 momei 每周回归任务承载。范围依据与批次见[可行性评估 §6 / §7](../design/governance/2026-09-17-momei-migration-feasibility.md)；交接计划与验收标准见[迁移计划与验收标准](../design/governance/2026-09-17-momei-migration-handover-plan.md)。
- **执行顺序**：M1 → M2 → M3 → M4 / M5（M3 优先于 M4 / M5）；M6 在等待 momei 反馈期间滚动执行。同一主线内条目按本表自上而下顺序执行。
- **阶段验收**：条目验收通则见下节；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证。

#### M1 迁移计划与验收标准（先行交付）

- 执行范围：产出交接文档——批次划分（逐行标注执行主体）、前置条件、开工顺序、每批出口条件、16 条有意差异逐条核对清单、视觉基线采集方法与判定口径、回归口径、包体对比要求、逐批「文件 → 改动点」清单产出要求。
- 非目标：不在本仓执行 momei 侧文件改动；不采集视觉基线；不含逐文件清单（属 momei 侧 B2 / B3 / B4 执行期产出）。
- 最小验收标准：文档存在且被[治理索引](../design/governance/index.md)收录；上述内容项齐备；批次表逐行标注执行主体（`caomei-ui` / `momei 项目`）；差异清单行数 = 16 且与[评估记录 §4](../design/governance/2026-09-17-momei-migration-feasibility.md) 逐条对应。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M1-1 | 迁移计划与验收标准交接文档 | 落 `docs/design/governance/2026-09-17-momei-migration-handover-plan.md`，登记治理索引 | 文档非空且被索引收录；批次划分 / 前置条件 / 开工顺序 / 出口条件 / 16 条差异清单 / 视觉基线方法与判定口径 / 回归口径 / 包体对比要求 / 清单产出要求九项齐备 | — |

状态：M1-1 已交付（文档落 2026-09-17），经 `@code-reviewer` Review Gate 两轮（第 1 轮 Reject：治理索引把 B0b 视觉基线错记为由 caomei-ui 承担等 → 修复后第 2 轮 Pass）；提交 8924924。

#### M2 B0 交接资产

- 执行范围：B0 库侧资产——token 对照表、图标映射表、双库并存隔离策略与包体监控口径。
- 非目标：不采集视觉基线（momei 侧）；不含 B2 / B3 / B4 的页面改动清单。
- 最小验收标准：落点文档可提交；三份资产的覆盖计数与[评估记录 §2.3](../design/governance/2026-09-17-momei-migration-feasibility.md) 口径一致，且逐份带取证命令与快照日期。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M2-1 | `--p-*` → `--caomei-*` token 对照表 | 建 `docs/design/governance/2026-09-17-momei-migration-assets.md` §1 取证口径 + §2；覆盖本次扫描命中的 **114 个唯一 token**，逐条给出本库对应 token 或「无对应 + 处理方式」（含映射原则） | 对照表覆盖 114 个唯一 token 且每行有对应或处理方式；取证命令 / 排除项 / 快照 commit 随表记录；与评估记录 §2.3 的口径对照已给出，差异成因为推定并标注效力边界（该主线口径裁定见下方状态行） | M1-1 |
| M2-2 | `pi pi-*` → lucide 图标映射表 | 同文档 §3；**128 个唯一图标**逐行给出 `@lucide/vue` 落点或「无对应 + 处理方式」，含品牌图标候选方案 | 映射行数 = 128；逐行有落点或处理方式；lucide 落点已与 `@lucide/vue` 导出名比对 | M1-1 |
| M2-3 | 双库并存隔离策略 + 包体监控口径 | 同文档 §4；并存期路由 / 页面白名单的载体与切换粒度；包体监控记录项与命令 | 策略含白名单载体与切换粒度；包体口径含记录项与命令，且与[交接计划 §9](../design/governance/2026-09-17-momei-migration-handover-plan.md) 一致 | M1-1 |

状态：M2-1 ~ M2-3 已交付（2026-09-17，落 `docs/design/governance/2026-09-17-momei-migration-assets.md`）。审计：经 `@code-reviewer` Review Gate 三轮，**末轮按轮次上限记为「已修复未复审」**（复核项为纯措辞，已逐条自检并重跑质量门；逐轮细节见该文档与提交信息）。两张映射表经独立复现逐行零差异（114 行合计 1403 / 128 行合计 618）。**口径裁定已落定（2026-09-17 用户决策）**：本主线验收**以本仓扫描口径与实际结果为准**（token 114 个唯一 / 1403 处；图标 128 个 / 629 处 / 145 个文件）；评估记录 §2.3 的旧数字（1394 / 598 / 134）不再作为本阶段验收基准。复现命令见资产文档 §1.2，8 组条件留痕见 §1.4。

#### M3 DataTable 列插槽（A 级，唯一结构性差距）

- 执行范围：为列定义补齐按列 key 命名的 `#cell-{key}` / `#header-{key}` 作用域插槽；`align-frozen` 与列级 `selection-mode` 经一方源码取证后**收敛为迁移映射、不新增 API**（2026-09-17 用户决策，见 M3-3 行）；含单测与中英迁移示例。用量依据：[评估记录 §2.3](../design/governance/2026-09-17-momei-migration-feasibility.md)（`<Column>` 153 / 20 文件、`#body` 123、`slotProps` 163）。
- 非目标：不改写现有 `columns` + `cell` 能力；不做 B2 页面迁移（momei 侧）；不含其他列级 prop。
- 最小验收标准：单测覆盖插槽命中 / 回退 / 作用域字段 / 父组件动态增删；中英迁移示例对照 PrimeVue `#body` + `slotProps`，并含 `frozen` 与 `selection-mode` 的映射行；本仓 `pnpm verify` 通过。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M3-1 | 列插槽机制与 `#cell-{key}` / `#header-{key}` 插槽 | 列插槽解析 + 单元格 / 表头渲染 + 单测；插槽名按列 `key` 命名，作用域含行数据、取值、索引与列定义；无插槽时保持 `cell` 函数与默认取值行为 | 单测覆盖「插槽命中」「优先于 `cell` 函数」「作用域四字段」「无插槽回退」「表头插槽」「可排序列表头保留排序按钮」「父组件动态增删插槽」；既有 DataTable 用例零回归 | — |
| M3-2 | 列插槽迁移示例与文档（中英） | 中英 DataTable 组件页新增「列插槽」与「从 PrimeVue 迁移」两节 + `column-slots` 示例；[设计规范 §7](../design/design-spec.md) 登记迁移映射 | 中英示例各覆盖 `#cell-{key}` / `#header-{key}`；设计规范 §7 有对应映射行（含 `frozen` / `selection-mode`）；`docs:build` 通过 | M3-1 |
| M3-3 | `align-frozen` 与列级 `selection-mode` 收敛为映射（**2026-09-17 用户决策：不新增 API**） | 经 PrimeVue 一方源码取证（`column/index.d.ts`：`frozen?: boolean` + `alignFrozen?: 'left' \| 'right'` + `selectionMode?: 'single' \| 'multiple'`），确认 `align-frozen` 语义为**冻结停靠方向**、已由本库 `frozen: 'left' \| 'right'` 覆盖；列级 `selection-mode` 的 momei 两处用量均在首列，已由表格级 `selectionMode` 覆盖。两者按 M3-2 写入迁移映射，不新增 prop | 映射行进入组件文档与设计规范 §7 并可由 momei 侧直接执行；零新增公开 API | M3-2 |

状态：M3-1 ~ M3-3 已交付（2026-09-17），经 `@code-reviewer` Review Gate 两轮（第 1 轮 Reject：决策口径未回扫、UI 改动缺 V 阶段 → 修复后第 2 轮 Pass，blocker 全关、同轮新增 warning 已同批修正）；提交 ef6dd48 / 521d52f / f10aa8b / 7a62e10。交付形态：M3-1 实现列插槽（`src/components/data-table/` 4 文件，+199 / −6）；M3-2 补中英组件页「列插槽」「从 PrimeVue 迁移」两节与 `column-slots` 示例；M3-3 经 PrimeVue 一方源码取证收敛为迁移映射（**不新增 API**，2026-09-17 用户决策）。附带修复：ESLint ignores 补 `docs/.vitepress/.temp/**`（VitePress 构建中间产物，已 gitignore 但 ESLint 9 不读 `.gitignore`，本地跑过 `docs:build` 后 `verify` 会把产物当源码 lint）。**V 阶段**：`@ui-validator` 两轮（首轮 48 项断言 + 示例修正后复验 25 项，失败 0 / console error 0），记录见 [列插槽浏览器验证](../design/governance/2026-09-17-column-slots-ui-validation.md)；观察项 O1（示例用 `index` 作序号、排序后错位）已消解（示例改为只解构 `{row}`，两页文档补 `index` 语义提示）。实测规模未超[规划规范 §5](../standards/planning.md) 粒度阈值。质量门：`pnpm verify` exit 0（含 `lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / 全量 test 1176 例 / `build` / `check:build` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check`）；期间曾命中 2 例既有 flaky（`CaomeiInputNumber` / `CaomeiSplitButton` 各一例，与本批无关），隔离复跑与全量复跑均通过。

#### M4 B1 增强·数据与表单类

- 执行范围：MultiSelect `#option` / `showClear`、Paginator 每页条数、Button `:badge`、CheckboxGroup、Switch `change`、ToggleButton `onLabel` / `offLabel`；**2026-09-18 用户追加**：DataTable 透出每页条数（`rowsPerPageOptions` + `update:rows`，登记为 M4-8，授权锚点为用户当次指令）。
- 非目标：不新增 B1 清单与用户追加项之外的能力；不处理列插槽（M3 承担）。
- 最小验收标准：每项带单测与中英文档；不改变既有默认契约（有意的行为差异须登记设计规范 §7）。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M4-1 | MultiSelect `#option` 插槽 + `showClear` | 选项渲染插槽（收原始选项对象与选中态）；清除按钮（清除置空、焦点交回触发器） | 两项各有单测（含清除后模型与焦点）；中英文档与设计规范 §7 登记 | — |
| M4-2 | Paginator 每页条数 | 每页条数选择（`rowsPerPageOptions` 语义）与变更事件；`template` 能力支持与否按 D 阶段取证后登记 | 每页条数选择有单测；变更后分页状态正确；未支持项在设计规范 §7 显式登记 | — |
| M4-3 | Button `:badge` 角标 | 角标内容 / 显示控制（对齐 PrimeVue `:badge` 语义） | 角标有单测（含隐藏态）；中英文档与设计规范 §7 登记 | — |
| M4-4 | CheckboxGroup 组件实现 | 分组值数组模型与全选 / 半选语义；类型面、导出与单测 | 组件可导出且单测覆盖全选 / 半选 / 受控更新；既有 Checkbox 用例零回归 | — |
| M4-5 | CheckboxGroup 文档与示例（中英） | 中英组件页与侧栏、`design/components.md` 与设计规范 §7 登记 | 中英页面可构建；侧栏与索引登记一致；示例覆盖受控与非受控 | M4-4 |
| M4-6 | Switch `change` 事件 | 补 `change` 事件（现仅 `update:modelValue`） | 用户交互触发 `change`、程序化改值不触发的单测；中英文档登记 | — |
| M4-7 | ToggleButton `onLabel` / `offLabel` | 两态文案 prop | 两态文案渲染与缺省回退有单测；中英文档登记 | — |
| M4-8 | DataTable 每页条数透出（**2026-09-18 用户追加**） | `rowsPerPageOptions` 透传到内嵌分页器 + `update:rows`；页码按偏移保持语义重推导；受控分页仅抛事件 | 透传 / 缺省 / 偏移保持 / 受控分支各有单测；中英文档与设计规范 §7 登记 | M4-2 |

状态（2026-09-18，M4 主线收口）：M4-1 ~ M4-8 **全部已交付**。**用户裁定（2026-09-18）**：M4-4 / M4-5 采「解读 A（`CaomeiCheckbox` 支持数组 `v-model`）+ 轻量 `CaomeiCheckboxGroup` 容器」——momei 实际用量为单个 Checkbox + 数组 `v-model`（20 处 / 13 文件），容器承担分组可访问语义、整体 `name` 提交与全选 / 半选；同批**追加 M4-8**（DataTable 每页条数，授权锚点为用户当次指令）。交付形态：① MultiSelect `#option`（收原始选项对象与选中态）+ `showClear`（有选中项且未禁用时显示，清除后模型置为空数组、焦点交回输入框；清除按钮为字段内常规 flex 成员，与 PrimeVue 的绝对定位形态属有意差异）；② Paginator `rowsPerPageOptions` + `update:itemsPerPage`（页码按**保留首行偏移**语义重推导，对齐 PrimeVue 的 `first` 语义；`template` / `CurrentPageReport` 经一方源码与用量取证后登记为**未实现**）；③ Button `badge` / `badgeTone`（默认 `neutral`，对应 PrimeVue `badge-severity` 默认的 `secondary`）；④ Checkbox 数组模型（按 `value` 增删，经一方源码 `checkbox/index.mjs#onChange` 逐行核对）+ `CaomeiCheckboxGroup`（`options` / `selectAll` 全选半选（禁用项不参与）/ `label` / `rovingFocus`（默认 `false`）/ `name[index]` 隐藏控件）；⑤ Switch `change`（仅用户交互触发，载荷由 PrimeVue 的原生事件改为布尔值，属有意差异）；⑥ ToggleButton `onLabel` / `offLabel`（需同时提供才渲染，PrimeVue 内建 `Yes` / `No` 默认值属有意差异）；⑦ DataTable `rowsPerPageOptions` + `update:rows`（偏移保持；受控分页仅抛事件；`totalRecords` 变化不重置用户选择的页大小；`page` 载荷的 `pageCount` 按本次 `rows` 计算）。**Review Gate 两批各两轮**：第 1 批（M4-1/2/3/6/7）R1 Reject（Paginator「重置到第 1 页（对齐 PrimeVue）」与一方源码不符且用例无判别力、ToggleButton「需同时提供（对齐 PrimeVue）」未反映 `Yes` / `No` 默认值、缺 V 阶段）→ R2 Pass；第 2 批（M4-4/5/8）R1 Reject（缺 V 阶段 + 4 warning：`totalRecords` 变化重置用户页大小、受控 `page` 载荷 `pageCount` 口径、CheckboxGroup「子项传 `name` 会重复提交」表述不实、插槽用例无判别力）→ R2 Pass。**V 阶段**：`@ui-validator` 两批分别 **119 / 119** 与 **130 / 130** 项通过、失败 0、console / pageerror / HTTP 0，记录 [M4 B1 数据与表单类](../design/governance/2026-09-18-m4-b1-data-form-ui-validation.md) 与 [M4-4 / M4-5 / DataTable](../design/governance/2026-09-18-m4-4-m4-5-checkbox-group-datatable-ui-validation.md)。**质量门**：`pnpm verify` exit 0（全量 test 70 文件 1261 例 / build / check:build / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；期间 2 例既有 flaky（`CaomeiMultiSelect` / `CaomeiDatePicker`，隔离复跑与后续全量均通过）。提交：第 1 批 29044c1 / 45fa047 / f14d49b / b13a465 / ee989c3 / d3ddf84 / b0776fb，第 2 批 38860b8 / 32639cf / 55e6897 / d6826a9 / f15dacc（均未推送）。

#### M5 B1 增强·浮层与展示类

- 执行范围：Dialog `showHeader` / `breakpoints` / `@hide` / `title` 可选化、ConfirmDialog `icon`、Popover 命令式、DropdownMenu `:model` / `:popup` / `toggle(event)`、Toolbar `#start` / `#center` / `#end`、Image `preview`、ProgressSpinner `strokeWidth`、FileUpload `mode` / `maxFileSize` / `auto` / `chooseLabel`。
- 非目标：不改变既有浮层的默认交互契约（如 Dialog 窄屏不转全屏、Drawer 锁滚动）；不新增 B1 清单外能力。
- 最小验收标准：每项带单测与中英文档；涉及渲染 / 交互的条目另经 `@ui-validator` 验证；有意的行为差异登记设计规范 §7。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M5-1 | Dialog `showHeader` / `title` 可选化 / `@hide` | 头部显隐控制；`title` 由必填改为可选（缺省时按现有可访问名契约处理）；补 `@hide` 事件 | 三项各有单测；`title` 缺省时不产生空属性、不破坏可访问名；设计规范 §7 更新 | — |
| M5-2 | Dialog `breakpoints` | 按断点设定面板宽度；与[响应式设计](../design/responsive.md)现有档位口径对齐 | 断点取值有单测或浏览器验证证据；未传时行为与现状一致；响应式设计与设计规范 §7 登记 | M5-1 |
| M5-3 | ConfirmDialog `icon` | `useConfirm` 请求项支持 `icon` | 单测覆盖「传 icon / 不传回退默认」；中英文档登记 | — |
| M5-4 | Popover 命令式（或迁移写法指引） | 或在库侧提供命令式入口，或给出声明式等价迁移写法；二选一按 D 阶段取证后登记 | 6 处 / 5 文件 `.toggle(event)` 调用点在文档中有明确落点；结论与依据登记设计规范 §7 或迁移映射 | — |
| M5-5 | DropdownMenu `:model` 数据驱动项模型 | 支持项模型（`label` / `icon` / `command` / `disabled` / `separator`） | 项模型渲染与 `command` 触发有单测；中英文档与设计规范 §7 登记 | — |
| M5-6 | DropdownMenu `:popup` + `toggle(event)` 锚点定位 | 面板挂载位置控制；以事件坐标为锚点的命令式打开（结构改写） | 锚点定位有浏览器验证证据；`:popup` 生效有单测；中英文档登记 | M5-5 |
| M5-7 | Toolbar `#start` / `#center` / `#end` | 三分区插槽（现为单一默认插槽） | 三分区渲染位置有单测；无插槽时保持现有布局；中英文档登记 | — |
| M5-8 | Image `preview` | 点击放大与遮罩；指示器图标能力按 D 阶段取证后登记 | 预览打开 / 关闭路径有单测；键盘可达；浏览器验证覆盖遮罩与宿主稳定性 | — |
| M5-9 | ProgressSpinner `strokeWidth` | 将现有 CSS 钩子提升为 prop（含尺寸联动语义） | prop 生效有单测（含缺省回退）；中英文档与设计规范 §7 登记 | — |
| M5-10 | FileUpload `mode` / `maxFileSize` / `auto` / `chooseLabel` | 上传模式、大小上限、自动上传与选择按钮文案；上传事件 | 四项各有单测（含超限拒绝路径）；中英文档与设计规范 §7 登记 | — |

状态：M5-1 ~ M5-10 为**已登记（范围授权）**。批次划分：B1 = M5-1 / M5-2（Dialog）、B2 = M5-3 / M5-4、B3 = M5-5 / M5-6、B4 = M5-7 / M5-9、B5 = M5-8 / M5-10；同批次内按条目号自上而下。**B1 已交付（2026-09-18）**：经 `@code-reviewer` Review Gate 三轮（R1 Reject：M5-2 缺渲染层浏览器证据与基线 → R2 Reject：粒度登记引用不存在的条款且行数不实 → **R3 Pass**，RG-W04 / RG-W05 转 follow-up）；V 阶段常驻 E2E 54 / 54（三档视口，含本批新增断点 / 无头部用例）+ 一次性实测 45 项 + 断言 4 基线 54 项逐字段零差异，记录见 [基线](../design/governance/2026-09-18-m5-b1-dialog-baseline.md) 与 [浏览器验证](../design/governance/2026-09-18-m5-b1-dialog-ui-validation.md)；提交 13cd91e（E2E 环境修复）/ daf09ce（代码）/ 0dd7e4e（文档）/ a08d493（E2E 用例）/ 14278f6（治理与登记）。附带修复 root 容器 Chromium 交互崩溃（`--no-zygote`，同步测试规范 §7）。**B1 粒度与拆分**：按[AI 协作规范 §3.2.1](../standards/ai-collaboration.md) 的交付面拆分，B1 分 5 个提交交付（描述见该规范 §3.2.1）——① E2E 环境修复 2 文件 / 6 行；② 交互核心 + 本地化代码（`src/**` + `scripts/**`）12 文件 / 新增 400 行；③ 文档与示例 10 文件 / 225 行；④ 常驻 E2E 用例 2 文件 / 130 行；⑤ 验证与治理记录 + 本规划登记 4 文件 / 136 行。合计 30 文件 / 新增 897 行，**最大单提交 12 文件 / 400 行**（行数未超 800）；该批次是 M5-1 与 M5-2 **同改 `dialog.vue` / `types.ts`** 的代码面，按 §3.2.1「不得同文件并发改」须同批提交（其中 6 个为 5 语种文案与类型、1 个为文案守卫测试，随 locale 键变更强制同批），其余提交均 ≤ 10 文件。该形态与[待办归档「交付与遗留偏差清单」](./todo-archive.md) 登记的既有先例一致（单一验收条目含「组件 + locale + 中英文档 + 示例 + 测试」导致的多次超限，均按先例登记）。

#### M6 等待期：组件缺口复盘与优化

- 执行范围：① 组件缺口复盘（B1 执行中新发现 + [Backlog §1.1 / §1.2](./backlog.md) 候选重新取证）；② 按[长期任务台账](./recurring.md)门槛或 [规划规范 §8](../standards/planning.md) 判定后交付的组件优化批次；③ 文档优化（限当前 Backlog 已有范围，不新扩）；④ 用户缺陷报告（附带截图与页面定位）触发的组件 / 文档缺陷修复——授权锚点为用户报告本身（用户直接指示优先于「评估 → backlog」默认路径），不新增 [规划规范 §3.5](../standards/planning.md) 的插队例外类别；④ 类条目以报告 + 浏览器实测值为取证，不要求 Backlog 出处；⑤ 迁移文档体系（**2026-09-18 用户授权**）：迁移节后置与文档约定、中英《从 PrimeVue 迁移》专题页、按侧栏分组滚动补齐组件页迁移节——授权锚点为用户当次指令（同 ④ 口径，不要求 Backlog 出处）。
- 非目标：不新扩 Backlog 范围（⑤ 的迁移文档体系以 2026-09-18 用户指令为授权锚点）；不为等待期预留条目；不纳入未达门槛的候选；不触碰 momei 文件。
- 最小验收标准：① 复盘结论落可提交位置，每项含取证命令与快照日期；② 交付批次满足对应门槛且逐轮留痕；③ 文档优化条目有明确 Backlog 出处（④ / ⑤ 类条目以用户报告 / 用户指令 + 浏览器实测值为取证，不要求 Backlog 出处）。
- 条目：滚动追加（当前 8 条：M6-1 ~ M6-8）；触发时机为等待 momei 侧反馈期间；追加规则为「先取证 → 达门槛 → 登记为原子条目 → 按本表自上而下交付」（⑤ 的授权锚点为用户当次指令）。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M6-1 | InputGroup × `Select` 拼接圆角缺陷修复 | 修复「与选择器组合时拼接侧圆角未去」：`Select` 的可见边框与圆角在内层触发器 `.caomei-select` 上，而拼接规则按 `> *` 作用于成员根元素 `.caomei-select__field`（无边框的定位 / 宽度包装层），中间与连接侧圆角因此不生效 | 浏览器实测组内 `.caomei-select` 四角圆角与成员根元素逐角一致（横向首 / 末成员与纵向档位均核验），未组合时 `Select` 默认圆角零变化；既有 InputGroup / Select 用例零回归 | — |
| M6-2 | 图标页补 live demo（中英） | 组件文档 `icons` 页补可渲染示例：基础用法、尺寸、图标一览、在组件中传入图标（中英各一套示例文件） | 中英页面均由 `<demo>` 渲染（非纯代码块）；`docs:build` 通过且产物含示例 DOM；示例图标名与 `@lucide/vue` 1.45 导出一致 | — |
| M6-3 | InputGroup × `Select` 成员宽度失配修复 | 同 M6-1 根因的另一面：宽度规则 `:is(...)` 仍列举 `.caomei-select`，未命中实际成员根元素 `.caomei-select__field`，导致 `Select` 成员既未占满剩余宽度、也未解除 `--caomei-select-max-width`（文档「边框拼接约定」承诺的铺满行为对 `Select` 失配） | 浏览器实测组内 `Select` 成员 `flex: 1 1 auto` / `max-width: none`，成员内容右边界与组右边界对齐；其余成员与纵向组合的实测几何与改动前一致（改动仅把不可能命中直接子组合的选择器换成实际成员根元素类） | — |
| M6-4 | 图标一览卡片排版修复 | 「图标一览」demo 的网格卡片高度参差：文档站正文的 `li + li` 外边距作用到网格列表项上，使首个之外的项目被压低 8px 且高度少 8px（同仓 `data-view` 示例已按同因重置 `margin`） | 三档视口下同一行内所有卡片的高与顶边一致（浏览器实测），无横向溢出；`docs:build` 通过 | M6-2 |
| M6-5 | `DatePicker` 触发按钮默认宽度上限 | 选择器家族与数值输入框均设可覆盖的默认 `max-width`（`Select` / `MultiSelect` / `AutoComplete` 回退 `--caomei-select-max-width`、`InputNumber` 为 `12rem`），`DatePicker` 此前缺省，宽容器中触发器被拉满（[主题与样式设计 §4.1](../design/theming.md) 声明的「数值输入框与选择器另设默认上限」原则对 `DatePicker` 失配） | 浏览器实测触发器默认宽度取 `--caomei-date-picker-max-width`（未覆盖回退 `--caomei-select-max-width` = `20rem`），覆盖为 `none` / 自定义值均生效；中英组件页与主题文档同步该 token 与 `fluid` 迁移口径；既有 DatePicker 用例零回归 | — |
| M6-6 | 组件页「从 PrimeVue 迁移」节后置与文档约定 | `data-table` / `paginator` 中英四页的迁移节由能力章节中间移至文末（`<ComponentApi>` 之前）；在[文档与演示站 §4](../design/documentation-site.md) 固化「迁移节固定为页尾附录」约定 | 中英四页节序实测：迁移节为其后仅剩 `<ComponentApi>` 的末节；`docs:build` 通过；约定写入文档站设计 §4 | — |
| M6-7 | 《从 PrimeVue 迁移》专题页（中英） | 新增 `docs/guide/primevue-migration.md` 与 en 镜像：迁移流程、常见陷阱、逐组件对照入口、有意差异口径与自检清单；映射以[设计规范 §7](../design/design-spec.md) 为唯一事实源，本页只给流程与入口 | 中英页面均可构建并登记侧栏；`docs:check:i18n-routing` 通过；组件页迁移节与专题页互链；不重复 §7 的逐条映射 | M6-6 |
| M6-8 | 组件页迁移节按分组滚动补齐（中英） | 按「有**有意差异** / 有**未实现或未暴露**项 / **结构性取向不同**」三条判据筛选约 24 个组件页，补「从 PrimeVue 迁移」节（映射要点 + 有意差异 + 未实现项）并链接专题页；按侧栏分组（反馈与浮层 / 数据展示 / 导航与操作 / 表单输入 / 选择器）滚动拆批 | 每批中英节齐备且 `docs:build` 通过；节内差异与 §7 逐条一致；未覆盖组件在专题页标注「以 §7 为准」 | M6-7 |

状态（第一批 M6-1 ~ M6-3，已交付）：M6-1 ~ M6-3 由用户缺陷报告（2026-09-17，报告范围：① 与选择器组合时拼接侧圆角未去；② 图标页无任何 live demo）触发登记，属等待期缺陷修复；M6-3 为该报告 ① 的浏览器复现中同根因发现面（报告未直接覆盖，非本批次引入）。关键实测值（Chromium 1440×900，`/components/input-group` 计算样式）：改动前快照（不可复现）——`.caomei-select__field` 圆角 `8px 0px 0px 8px` 而内层 `.caomei-select` 为 `8px 8px 8px 8px`；修复后横向首 / 末、三成员中间、纵向档位与 `--caomei-input-group-radius: 4px` 覆盖下两者逐角一致，独立 `Select` 保持 `8px 8px 8px 8px`（= `--caomei-radius-md`）；`Select` 成员宽度由 `320px`／`max-width: 320px` 变为 `593px`／`max-width: none`，内容右边界与组右边界同为 `1051`。状态：经 `@code-reviewer` Review Gate 两轮（第 1 轮 Reject：M6 范围口径未覆盖「用户报告」来源、回归证据只落在 gitignored 目录、同根因宽度失配未登记 → 修复后第 2 轮 Pass，可提交）；M6-1 / M6-3 同文件同根因，代码与文档同批提交。

状态（第二批 M6-4 / M6-5，2026-09-17，用户对上一批同一页面的后续反馈：③「图标一览排版有点问题」、④「日期选择器太长了，和 Select 选择器一样会好点」）：M6-4 修复示例内网格列表项的外边距（文档站正文 `li + li` 规则使卡片高与顶边参差 8px）；M6-5 为 `DatePicker` 触发器补默认宽度上限（`--caomei-date-picker-max-width`，未覆盖回退 `--caomei-select-max-width` = `20rem`），并同步中英组件页（宽度条目 + `fluid` 迁移口径 + token 表）、[主题与样式设计 §4.1](../design/theming.md)、[设计规范 §2.3 / §6 / §7](../design/design-spec.md)、[迁移可行性记录 §2.4 / §4#9](../design/governance/2026-09-17-momei-migration-feasibility.md)、[交接计划 §6#9](../design/governance/2026-09-17-momei-migration-handover-plan.md) 与 `input-group.md` 中英「其余成员」条目。关键实测值（Chromium 1440×900）：图标一览三档视口卡片高均 `102px`、同行顶边一致（卡片内盒 `113px`，最长名 `TriangleAlert` 文本 `93.63px` 不溢出）；`DatePicker` 触发器默认 `width` / `max-width` = `320px` / `320px`（父 `646px`），覆盖 `none` → `646px`、`240px` → `240px`，面板 `in-flow` 位移 `0`、CLS `0`；组内 `DatePicker` / `AutoComplete` 保持 `320px` 不铺满（与新增文档条目逐句一致）。**Review Gate 三轮 Reject**：第 1 轮（`fluid` 行 rationale 不对本批成立且 `DatePicker` 用量未统计、主题 §4.1 把 `Select` 的字段外层路径外推到根元素组件、InputGroup 成员白名单决策缺失、缺 `build` 与三档视口证据）→ 第 2 轮（缺 `pnpm build` / `check:build` 且产物早于源码、`docs:build` 产物早于最后一次中英 `input-group.md` 编辑、V 记录仍引用改写前措辞）→ 第 3 轮（本状态段落未同步 M6-4 / M6-5 与 follow-up 登记）；三轮修复后按 [AI 协作规范 §3.4](../standards/ai-collaboration.md) 声明新增预算启动复审（第 4 轮起逐轮显式声明新增预算并冻结范围于本状态段与上轮基线点；各轮结论记于本批提交信息）。**改进协议留痕（§3.5，第 3 轮后判定）**：① 缩面不适用——本批为「组件 + 文档 + 规划」的单一提交粒度，无可先行提交的已通过子范围；② 复发 finding 转机检约束不适用——第 1 / 2 轮的「证据矩阵缺口」根因是执行顺序而非可机检形态，`dist/` 与 `docs/.vitepress/dist/` 均为 gitignored 产物、CI 会全量重建，产物新鲜度不宜作常驻机检；改为执行序检查项「Gate 前先跑 `pnpm verify`（含 `build` 与 `docs:build`）再申报证据」，随本段与提交信息留痕；③ 缺信息先取证已执行——`DatePicker` 的 `fluid` 用量按 momei 快照 `cb663aee` 只读统计并留可复现命令。**V 阶段**：`@ui-validator` **125 / 125 项通过、失败 0**（记录 [M6-4 / M6-5 浏览器验证](../design/governance/2026-09-17-m6-4-m6-5-ui-validation.md)）。**质量门**：`pnpm verify` exit 0（全量 test 69 文件 1210 例 / build / check:build / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）。**follow-up（未交付）**：参数化 E2E 用例「选择器家族成员 × 宽度上限覆盖三态」，守护 token 回退链与 `input-group` 的 `:is()` 成员清单；触发条件为下一次触碰该清单或宽度 token。观察项（`DatePicker` 面板宽 `222px` < 触发器 `320px`、375 档图标网格 2 列）不计为缺陷。
状态（第三批 M6-6 / M6-7，2026-09-18，用户对 DataTable 文档的反馈：迁移节夹在章节中间、要求检查其他页面并为差距大的组件补节、建议写迁移专题页）：**M6-6** 将 `data-table` / `paginator` 中英四页的「从 PrimeVue 迁移」节由能力章节中间移至页尾（`<ComponentApi>` 之前），并在[文档与演示站 §4](../design/documentation-site.md) 固化「迁移节固定为页尾内容节」的组件页模板顺序；**M6-7** 新增中英《从 PrimeVue 迁移》专题页（迁移流程 / 常见陷阱 / 逐组件对照入口 / 迁移后自检，映射以[设计规范 §7](../design/design-spec.md) 为唯一事实源），登记中英侧栏并与组件页迁移节互链。**Review Gate 两轮**：R1 Reject（B1 入口表漏 Dialog / Drawer 且脚注声称穷尽、B2「点击进入组件页」与纯文本不符、W1 §4 中 FAQ 与「最后一个内容节」自相矛盾、W2 常见陷阱表 `fluid` 行缺 `SplitButton` 例外、W3 拟议 commit 1 单独不绿）→ 逐条修复后 **R2 Pass**（0 blocker，B1 / B2 / W1 / W2 / W3 全 Closed）。**V 阶段**：`docs:build` 产物 + `vitepress preview` 实测 **75 / 75 通过、失败 0**（四页三档视口的迁移节位置、中英专题页结构与入口表链接 ≥ 23 且覆盖 Dialog / Drawer、互链真实点击、console 0），观察项 2 ＝ en-US 文档页 @768 既有 79px 横向溢出（未改动的 en 页同样命中，已登记 [Backlog §1.6](./backlog.md)）；记录 [M6-6 / M6-7 浏览器验证](../design/governance/2026-09-18-m6-6-m6-7-migration-docs-ui-validation.md)。**质量门**：`pnpm verify` exit 0（全量 test 71 文件 1287 例 / build / check:build / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`docs:check`（links 201 md / integrity 198 md / line-count）通过。提交 281df66（专题页 + 迁移节后置 + §4 约定）/ 485b5c5（验证记录 + 治理索引 + backlog）/ 本规划提交。**后续（未启动）**：M6-8 组件页迁移节按侧栏分组滚动补齐。
状态（M6-8 第一批，2026-09-18，用户指定先做「反馈与浮层 + 数据展示」两组）：两组 12 个组件页现已全部具备中英「从 PrimeVue 迁移」节（DataTable / Paginator 于 M6-7 交付；本批补 ConfirmDialog / Dialog / Drawer / Message / Popover / Toast / DataView / ProgressBar / ProgressSpinner / Skeleton 共 10 页 × 中英）。同批为 6 个此前无映射登记的组件新增 §7 条目（ConfirmDialog / Popover / Toast / ProgressBar / ProgressSpinner / Skeleton）、为 Dialog 补 3 项字段映射，并同步专题页入口表（两组 12 组件全登记）与「不一致以 §7 为准（漂移即缺陷）」的兜底声明。**Review Gate 两轮**：R1 Reject（B01 Popover `#content` 槽位与 PrimeVue 一方源码不符（实际为默认插槽 + `#container`）、B02 Message 漏 `success → success`、B03 Toast 漏 `breakpoints`；W4 三页缺「已登记为后续补强项」表述、W5 Dialog 节多写 / 少写有意差异、W6 反馈与浮层 12 文件单提交超阈值、W7 Toast 漏 `success` 映射）→ 逐条修复（含 §7 Popover / Toast / Dialog 三行改写与中英页面同步）后 **R2 Pass**（0 blocker，S11 留 F 阶段）；R2 的 3 条非阻塞建议中采纳 2 条（Popover `closeOnEscape` 与 `#container` 的 `keydownCallback`）随本批提交消化。**V 阶段**：`docs:build` 产物 + `vitepress preview` 实测 **305 / 305 通过、失败 0**（24 页 ＝ 本批 20 + M6-7 回归 4，三档视口：迁移节位置 / 专题页入口表链接 ≥ 29 / 互链 / console 0），观察项 12 ＝ en-US 文档页 @768 既有 79px 横向溢出（未改动 en 页同样命中，已登记 [Backlog §1.6](./backlog.md)）；记录 [M6-8 第一批浏览器验证](../design/governance/2026-09-18-m6-8-migration-sections-ui-validation.md)。**质量门**：`pnpm verify` exit 0（test 71 文件 1287 例 / build / check:build / check:nuxt / docs:build / docs:check:i18n-routing / governance:check；期间 1 例既有 flaky 隔离复跑即过）；`docs:check`（links 202 md / integrity 201 md / line-count）通过。提交 2c732df（§7 与约定）/ 1d6cf39 + c818adc（反馈与浮层，按 3 组件拆两批）/ 1e3d90f（数据展示）/ 0ecf829（专题页入口表）/ 43faf00（验证记录与守卫候选）/ 本规划提交。**后续（未启动）**：M6-8 其余分组（基础与布局 / 表单输入 / 选择器）组件页迁移节。
状态（M6-8 第二批「基础与布局」，2026-09-18）：本组 9 组件中 8 个补齐中英「从 PrimeVue 迁移」节（Avatar / Badge / Button / Card / Divider / Image / SplitButton / Tag）；**ButtonGroup 不补节**——PrimeVue 侧仅 `dt` / `pt` / `unstyled`、无功能 props 可迁移，本库新增的 `orientation` 等不构成迁移阻塞（按 M6-8 三条判据不计必补项）。同批为 Avatar / Badge / Divider / Image 新增 §7 条目，Button / Panel / SplitButton 行补全，Tag 行修正（删除 PrimeVue 不存在的 `outlined` 映射，两页正文旧注同步）。**附带修复**：Image 错误态示例由缺失路径改为不可解码 data URI，消除文档页网络 404（该页此前不在任何 V 范围内）。**Review Gate 两轮**：R1 Reject（B1 Tag `outlined` 误记、W1 通用「全宽」行与 Button `fluid → block` 冲突、W2 Card `#subtitle` 误映到 `#title`、W3 三页多写未回补 §7、W4 ButtonGroup 排除理由不实；S1–S6）→ 逐条修复后 **R2 Pass**（0 blocker；3 条非阻塞建议采纳 2 条，并把 V 断言阈值回补为 ≥29）。**V 阶段**：`docs:build` 产物 + `vitepress preview` 实测 **493 / 493 通过、失败 0**（40 页 ＝ 先前 24 + 本批 16，三档视口的迁移节位置、专题页入口表 ≥29、互链、Image 错误态与 0 网络 404），观察项 20 ＝ en-US 文档页 @768 既有 79px 溢出（已登记 [Backlog §1.6](./backlog.md)）；记录 [M6-8 第二批浏览器验证](../design/governance/2026-09-18-m6-8-group-a-ui-validation.md)。**质量门**：`pnpm verify` exit 0（test 71 文件 1287 例 / build / check:build / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`docs:check`（links 203 md / integrity 202 md / line-count）通过。提交 0998d55（§7）/ 0f7b62e + f075f58（组件页 4+4）/ 5713775（Image 示例）/ 8dd05a3（专题页）/ 89f7545（验证记录）/ 本规划提交。**后续（未启动）**：M6-8 剩余两组（表单输入 / 选择器）。
状态（M6-8 第三批「表单输入」，2026-09-18）：本组 12 个组件页中英「从 PrimeVue 迁移」节全部补齐（Checkbox / CheckboxGroup / FileUpload / FloatLabel / Input / InputGroup / InputNumber / Password / RadioGroup / Slider / Switch / Textarea）。同批为 Input / FloatLabel / InputGroup / RadioGroup / Slider / FileUpload 新增 §7 条目，并回补 Checkbox（binary / indeterminate / label / text / 未实现清单）、CheckboxGroup（`selectAllText` / `formControl`）、InputNumber / Password / Textarea 的未实现清单；**更正 FileUpload 的 `name` 为「透传到内层 `<input>`」**（初稿误列为未实现）。附带统一 3 个 en 组件页的跨语言链接口径（去掉 `.md`）。**Review Gate 两轮**：R1 Reject（RG-B01 §7 FileUpload 把 `name` 列入未实现，与会话内页面及源码冲突；W01 六个复用条目被页面超出、W02 en Input 链接口径、W03 提交拆分不自洽；S01–S03）→ 逐条修复后 **R2 Pass**（0 blocker，1 条非阻塞观察〔en 专题页旧链接写法〕已随批消除）。**V 阶段**：`docs:build` 产物 + `vitepress preview` 实测 **769 / 769 通过、失败 0**（64 页 ＝ 先前 40 + 本批 24，三档视口的迁移节位置、专题页入口表 ≥29、互链、Image 错误态与 0 网络 404），观察项 32 ＝ en-US 文档页 @768 既有 79px 溢出（已登记 [Backlog §1.6](./backlog.md)）；记录 [M6-8 第三批浏览器验证](../design/governance/2026-09-18-m6-8-group-b-ui-validation.md)。**质量门**：`pnpm verify` exit 0（test 71 文件 1287 例 / build / check:build / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`docs:check`（links 204 md / integrity 203 md / line-count）通过。提交 8d4557d（§7）/ f31f406 + c4fd236 + d42496e（组件页 4+4+4）/ 8d46390（专题页）/ 85de760（en 链接口径）/ 928ca30（验证记录）/ 本规划提交。**后续（未启动）**：M6-8 剩余「选择器」组（AutoComplete / Calendar / ColorPicker / DatePicker / MultiSelect / Select / SelectButton / ToggleButton）。
状态（M6-8 第四批「选择器」+ 主线收口，2026-09-18）：本组 8 个组件页中英迁移节全部补齐（AutoComplete / Calendar / ColorPicker / DatePicker / MultiSelect / Select / SelectButton / ToggleButton），并新增 §7 AutoComplete 条目、修正 Calendar / DatePicker 的 `locale` 与周起始类 prop 口径（PrimeVue 侧 `locale` 为全局 config、其余为本库新增）。**M6-8 主线收口**：五个侧栏分组全部落地，共 **40 个组件页**具备中英「从 PrimeVue 迁移」节；未补节 **6 个组件页**（Accordion / ButtonGroup / DropdownMenu / Stepper / Tabs / Toolbar），其中 **DropdownMenu（M5-5 / M5-6）与 Toolbar（M5-7）待 M5 能力交付后回扫补节**，其余按 §7 无映射登记或不构成迁移差异；`ConfigProvider` 无组件页、不在统计内。**Review Gate 三轮**：R1 Reject（B01 ToggleButton 误称 `#icon` 插槽、B02 Calendar 为 PrimeVue 列出 5 个不存在的同名 prop、B03 AutoComplete 的 `debounce` 语义写错；W01–W05、S01）→ R2 Reject（修复只落在 zh、en 未同步）→ **R3 Pass**（0 blocker）。**根因留痕**：上一轮修复脚本以 Python 字典组织「文件 → 改动对」，`calendar` / `date-picker` / `auto-complete` 三个 en 文件在字典中出现两次（主修复 + 链接修复），后键**静默覆盖**前键，导致主修复未执行且无报错；改为列表逐项重放（每项断言命中数为 1）后闭合。**V 阶段**：`docs:build` 产物 + `vitepress preview` 实测 **953 / 953 通过、失败 0**（80 页 ＝ 先前 64 + 本批 16，三档视口的迁移节位置、专题页入口表 ≥29、互链、Image 错误态与 0 网络 404），观察项 40 ＝ en-US 文档页 @768 既有 79px 溢出（已登记 [Backlog §1.6](./backlog.md)）；记录 [M6-8 第四批浏览器验证](../design/governance/2026-09-18-m6-8-group-c-ui-validation.md)。**质量门**：`pnpm verify` exit 0（test 71 文件 1287 例 / build / check:build / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`docs:check`（links 205 md / integrity 204 md / line-count）通过。提交 44e7b0a（§7）/ a22140c + 109b519（组件页 4+4）/ d4bede0（专题页）/ a86f24b（验证记录）/ 本规划提交。

## 阶段验收通则

完成条件见 [路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证。

## 完成情况概览

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- **未启动 / 未完成阶段**：Phase 5 第二阶段（首版发布 / 首个下游接入，待外部前置）；Phase 8（下游兼容性回归机制，稳定后启用）。范围见[路线图](./roadmap.md)。
- **等待外部反馈**：本仓 Phase 7 第二阶段已启动，momei 侧迁移（B0b 视觉基线 / B2 / B3 / B4）由 momei 项目执行，本仓等待其反馈后再决定下一轮动作。
- **未纳入任何阶段的候选**：见 [Backlog](./backlog.md)（组件增强、国际化与 RTL、移动端与响应式、基建与治理、服务层、下游协同等分组）。
- **已完成阶段的遗留项与已知偏差**：见[待办归档](./todo-archive.md) 与 [Backlog](./backlog.md)（后者承载其中仍待决策的候选）。
