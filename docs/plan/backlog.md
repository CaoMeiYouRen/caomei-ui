# 长期规划与 Backlog

本文档记录**仍待用户决策**的候选与长期主线；候选准入、优先级与插队例外规则见 [规划规范 §3](../standards/planning.md)，本文档不重述。

> **文档结构**
>
> - §1 候选池：仅收录**尚未决策 / 尚未交付**的候选（含外购建议等不纳入自研的记录）；`→ Mx（Phase N …）` 表示已登记到某阶段的既有范围（未启动时标「范围已登记」）。
> - §2 维护约定。
>
> 已交付与已归档条目随阶段迁入 [待办归档](./todo-archive.md)，本表不保留（含交付摘要与归档指针）。

## 1. 候选池（待用户决策）

### 1.1 组件增强候选

> 来源：momei 使用复核台账与各阶段治理发现；仅列仍待决策的候选。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| Tag/Badge 增强 | 组件实现评估 + M1 复核 | Tag 可选中筛选 / 可编辑（Reka TagsInput）；Badge 叠加位置偏移与宽度过渡动画 | 中 |
| Select 增强 | 组件实现评估 + M1 复核 | 分组（SelectGroup）与可编辑组合。**`filter` 不在 Select 实现**：Reka Select 把 `role="listbox"` 固定在面板元素上（`SelectContentImpl` 在 `$attrs` 之后写入，无法覆盖），面板内放搜索框会使 textbox 成为 listbox 的 owned child（违反 WAI-ARIA `aria-required-children`），可搜索单选应走 `Listbox` / `Combobox` | 中 |
| 实底前景 token 配对复核 | M3 复核 | 复核其余实底消费点的 `-solid` × `-foreground` 配对，避免跨主题配对冲突（规范口径见 [设计规范 §2.2 / §3.2](../design/design-spec.md)） | 中 |
| ColorPicker 色板导航增强 | M4 条目 5 follow-up | 色板当前为 `role="group"` + `aria-pressed` 按钮组（Tab 遍历，无方向键 roving）；候选改为 `radiogroup` + `aria-checked` 并补 roving tabindex。触发条件：下游启用 `swatches` 且出现键盘密集使用场景 | 低 |
| AutoComplete 严格选项模式 | M3 条目 2 迁移评估 | AutoComplete 在回车 / 失焦时会提交自由文本（`commitFreeText`），与 PrimeVue `Select filter`「值必须来自选项列表」的语义有差；候选补 `strict` / 限制自由文本的开关，或按 Reka `Listbox` 另立可搜索单选形态。触发条件：下游迁移实测出现「取值必须受限于选项列表」的受控字段用例 | 低 |
| DatePicker 范围选择 | M4 条目 2 范围收敛（用户决策延后） | 候选补 `selectionMode="range"`（Reka `RangeCalendar`）或独立 RangePicker：起止值模型（`Date[]` / `{ start, end }`）、区间展示与校验、与现有 `dateFormat` / `showTime` / `minValue` / `maxValue` 的组合。触发条件：下游出现日期区间筛选 / 区间录入真实用例（momei 快照 `selection-mode` 零用量） | 低 |

### 1.2 长尾组件候选（Tier 3）

| 候选 | 来源 | 优先级 |
|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | 低 |

### 1.3 不纳入自研的能力（外购建议）

| 能力 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 富文本与图表封装 | momei 使用面 | Editor / Chart 建议外购（Tiptap / ECharts），不自研 | 低 |

### 1.4 国际化候选（需求 5）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 语言矩阵 - 长期 | 用户需求 | 追加俄语、法语、德语、西班牙语、葡萄牙语；视情况追加希腊语、意大利语、印地语、孟加拉语、印度尼西亚语等 | 低 |
| RTL（阿拉伯语）支持 | 用户需求 | 从右往左排版涉及逻辑属性、图标镜像、浮层定位与滑动手势镜像，风险高，单独立项谨慎评估，不与其他语言捆绑 | 低 |
| locale 组织与注册治理 | 用户需求 | 语言数量增长后的目录组织、注册表、按需加载与类型约束；可参考 momei `i18n/config` registry 机制 | 低 |

### 1.5 移动端与响应式候选（需求 6）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 滚动容器键盘聚焦「无条件完整可见」 | 实测发现 + 用户裁定（选项 A：不作为当前验收标准） | Chromium 的焦点滚动只在聚焦元素与滚动区**完全不相交**时介入（触发后居中）；若聚焦前已有一条像素级可见边（前一个成员居中滚动后留下的窄边），浏览器不再滚动，聚焦成员可能只露出几像素。已在无组件 CSS 的纯 HTML 夹具复现同构几何，**非本库特有**；现行验收取分档口径（[响应式设计 §4](../design/responsive.md)）。本候选为其增强形态：若要**无条件**完整可见，需在滚动容器（ButtonGroup / SplitButton / Tabs / DataTable）的 `focusin` 时主动滚动聚焦成员；触发条件（建议）为下游无障碍审计提出，或出现「键盘用户无法察觉聚焦项」的实际反馈。实现前须一并评估：作用域（仅窄屏可滚动档 vs 全档）、页面纵向滚动副作用、RTL（当前非目标） | 低 |
| 触摸目标增强（≥44px 命中区） | 用户决策 | 用户裁定**暂不提升**，维持现状：Checkbox / RadioButton 视觉尺寸 18px、Switch 40px、`control-height-sm` 28px（`theme.css:43`）。提升须引入「不改变视觉尺寸的不可见命中区」原语，影响全部小尺寸控件；触发条件（建议）为下游无障碍审计提出或下游移动端规范要求 | 低 |

### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 组件覆盖率门禁 | 待启用 `coverage.thresholds` 门禁；阈值与启用时机待定 | 中 |
| AI 资产指针（`AGENTS.md`） | `AGENTS.md` §11「相关文档」缺长期任务台账与规划载体的指针；该文件为受保护文件，须用户明确指示后随一次授权变更执行（改 `.github/**` 时同步 `.claude/` `.opencode/` `.agents/` 镜像） | 低 |
| 文档翻译旧目录守卫 | 设计文档已声明「不保留 `docs/<locale>/`」但无自动校验；对齐 momei 增加 `docs:check:i18n`，检测旧目录回流与重复翻译页 | 中 |
| 对比度遗留项盘点 | ① **亮色 soft 变体 primary 文本 4.37:1**（Tag / Message，`color-mix` 12% 底 + primary 文本）——需产品 / 设计决策（引入 soft 专用文本色或加深文本），候选 `--caomei-color-primary-emphasis` 一类；② `.caomei-calendar__weekday` 亮色 4.48:1（`--caomei-color-text-muted`）；③ `.caomei-toast__icon` 暗色 2.54:1（`neutral-solid`，图形阈值 3）；④ **预设品牌色既有例外**：caomei 预设 `primary-solid #e63946` 配 `on-solid` 白字 4.17:1（实底配对例外）、其 `danger #ef4444` 作前景色约 3.76:1（正文 / 图形对比度）；同预设 `danger-solid #b91c1c` 配白字 6.47:1 达标，勿误改。预设品牌色经用户决策不变，故例外长期跟踪。取证见 [M2 浏览器验证记录](../design/governance/2026-09-16-m2-primary-browser-validation.md) 与 [设计规范 §3.2](../design/design-spec.md) | 中 |
| nav/sidebar 链接校验 | `themeConfig.nav/sidebar` 链接不在 `check-links` 与 VitePress dead-link 覆盖内，多 locale 下风险放大；评估纳入校验 | 中 |
| 文档站锚点校验与侧栏不变式 | `check-links` 的 `looseNorm` 会剥离 `-`/`_`/标点，**无法发现 VitePress slug 不匹配**（实测全库 7 处断锚，含 `.github/skills/**` 1 处；成因：数字开头标题补 `_` 前缀、全角标点归一）；同时「中英侧栏同分组同序 / 45 页全覆盖」目前只有一次性脚本取证、无常驻守卫。候选：锚点校验对齐 VitePress slugify + 侧栏不变量脚本接入 `docs:check`（属加强门禁，需授权） | 中 |
| 迁移口径一致性守卫（入口表 / 组件页节 ↔ §7） | ① 《从 PrimeVue 迁移》专题页的「逐组件对照入口」表需与 §7 已登记组件集合一致（2026-09-18 M6-7 首轮 Review 因漏 Dialog / Drawer 判 blocker；该页已声明「不宣称穷尽」并随 §7 维护）；② 组件页「从 PrimeVue 迁移」节与 §7 同一组件的关键字段需一致（2026-09-18 M6-8 首轮 Review 因 Popover 槽位名 / Message `success` / Toast `breakpoints` 三处漂移判 blocker；现已以「不一致时以 §7 为准，漂移即缺陷」承接）。候选：脚本机检 ① 集合差与 ② 关键字段（组件名 / 未实现项关键词）一致性并接入 `docs:check` | 低 |
| en-US 文档页 768 档横向溢出 | 实测 `/en-US/**` 文档页在 768 视口下 `scrollWidth 847 > clientWidth 768`（79px），命中元素为 VitePress 内容列 `.content`；未改动的 `en-US/components/button`、`avatar`、`guide/getting-started` 与新增迁移专题页同样命中，zh 同名页与 `/en-US/plan/roadmap` 为 `768 / 768`。疑与 en-US locale 的 nav / sidebar 或 `.content` 最小宽相关，待定位。取证见 [M6-6 / M6-7 浏览器验证记录](../design/governance/2026-09-18-m6-6-m6-7-migration-docs-ui-validation.md) | 中 |
| 英文文档同步治理 | 英文版与中文版同步（仅指南与组件介绍）已完成组件页与指南覆盖；剩余为 parity / freshness 校验与未翻译页回链策略，参考 momei translation-governance | 中 |
| README 英文版（`README.en-US.md`） | 用户提出（2026-09-19）：考虑新增 `README.en-US.md`，供英文读者与仓库浏览；需评估维护成本、与中文 README 的同步机制（npm 页面只展示单一 README，故该文件定位为仓库内文档）、入口链接与更新时机。用户要求**下次文档更新时评估** | 低 |
| a11y 自动化回归 | 引入 axe-core 对关键组件做可访问性断言 | 中 |
| 测试隔离与偶发失败 | 全量并发下多个组件测试偶发失败（曾观测到 dropdown-menu / accordion / dialog / confirm-dialog / multi-select / select / tabs），隔离或复跑即通过；疑似 Reka + happy-dom 并发资源 / 时序问题。**2026-09-17 再次观测（已捕获用例名）**：`pnpm verify` 在全量 test 阶段中断，失败用例为 **`CaomeiDropdownMenu > 单选组在选项间切换选中`**（1 failed / 1132 passed）；随后单独复跑 `pnpm test` **连续 4 次全过**（1133 例）。同日另有一次未捕获名的全量失败（复跑即过）。建议排查共享 DOM 与计时依赖，必要时降并发或加隔离重置，消除 flaky 以保 `verify` 门禁可信。**2026-09-17 第 7 轮再次观测（3 次失败 / 3 个不同用例，均隔离即过）**：① `CaomeiDatePicker > showTime > 超出范围的时间输入被钳位，空输入不改写模型`（`emitted('update:modelValue')` 为空）；② `CaomeiDataTable > 分页与排序组合：先排序后分页`（`expected 'A1' to contain 'E'`）；③ `CaomeiInputNumber > 在按钮外松开指针仍触发 change`（`expected undefined to deeply equal [2]`）、`CaomeiSelectButton > 受控单选：点击其他项抛出 update:modelValue 且不自行切换`。随后**连续 3 次全量复跑全过**（1169 例）。规律：失败用例每次不同、集中在指针 / 时序与受控事件路径，与并发下 Reka 的事件接线时序一致 | 中 |
| 空文件与截断守卫 | 事故发现（2026-09-17，**同日复发两次**）：文档替换脚本用「`open(...,'w').write(open(...,).read())`」——`'w'` **先截断后读**，先后把一处 204 行的治理记录与 `docs/standards/planning.md` 清空为 0 字节。`lint-md` 与 `docs:check` 的行数 / 链接检查对空 `.md` 天然放行（无坏链、0 行）；第二次由**锚点校验间接暴露**（其他文档引用该文件的锚点全部解析失败）。候选：① `docs:check` 增加「受版本控制的 `docs/**` 与根 `README` 不得为 0 字节 / 不得低于经验下界行数」的最小守卫；② **表格结构守卫**：Markdown 表格行必须处于「含分隔行」的表格块内（2026-09-17 实测一处 `backlog.md` 表格被插入的引用块截断，产生无表头的孤立行，而 `lint-md` 与 `docs:check` 均放行）；③ 批量改写脚本禁止 `open(path,'w').write(open(path).read())` 形态（须读→改→写分离，或写临时文件后替换） | 中 |
| 文档完整性守卫的阶段归档误报 | `check-docs-integrity.mjs` 的 `SHRINK_EXEMPT_FILES` 结构下界用全层级 `countHeadings` 计数，而阶段归档会按[规划规范 §7](../standards/planning.md)合法移除 `todo.md` 的阶段标题（如 `### Phase 5 第二阶段`），导致每次归档后常驻一条「标题数少于 HEAD 版本」缩减告警（2026-09-19 Phase 5 第二阶段归档复现）。常驻预期告警会稀释唯一的结构性截断信号。候选：区分「归档移除阶段标题」与「正文被截断」（如只比较 ≤2 级结构标题，或与 `todo-archive.md` 对账） | 低 |
| Review Gate 证据留存 | 评审结论与浏览器验证截图归档到 `artifacts/review-gate/` 并纳入 `.gitignore` 策略；**结论与关键实测值仍须落可提交位置**（`docs/design/governance/**`、`docs/plan/**` 或提交信息），artifact 目录不得作为唯一留痕（追溯要求见 [测试规范 §2.1](../standards/testing.md) 与 ui-validator 的 references/evidence-record.md） | 低 |
| 层级与阴影 token | 浮层组件 z-index 目前仍为字面量，后续抽 `--caomei-z-*` 统一管理（阴影 / 遮罩 token 已于 2026-09-17 第 5 轮落地，见[设计规范 §2.6](../design/design-spec.md)） | 低 |
| scoped 变量声明治理 | `development.md §7` 要求「基类不预声明 CSS 变量默认值、档位类用 `:where()`」，但仍有偏差：`button` 基类直接声明 `--caomei-button-*` 默认值（基类预声明），`message` / `badge` / `tag` / `toast` 的变体类用普通类声明变量（档位类未用 `:where()`）；建议补 `check-design.mjs` 规则（现规则只查引用存在性）并逐组件收敛 | 低 |
| 文档站版本化 | 首版发布前无版本基线可切，选型与落地后置（依赖首版发布）；VitePress 版本化方案需先做 Search-First 选型核实 | 低 |
| 文档站演示动画遗留项 | ① `caomei-demo-*` keyframes 副本与组件动画数值无一致性守卫（组件动画变更时仅靠注释同步）；② Toast `swipe-out` 规则无运行期实测；③ `docs/.vitepress/theme/**` 与 `docs/examples/**` 内的示例样式均不在 stylelint 覆盖内（`lint:css` 只跑 `src/**`），示例 CSS 目前只由 ESLint 与人工审查把关 | 低 |
| 文档站示例的外部图片依赖 | 2026-09-18 文档优化批次引入：`image` / `avatar` 中英 4 页的示例改用 `picsum.photos` 真实照片（8 处外链），此前 `docs/examples/**` 零外链（全为 data URI 占位）。风险：`docs:build` 不抓取 `img src`（SSR 只写属性），图片不可达时组件落到 error 占位**且不产生 console error**，故 lint / typecheck / build / 「0 console error」四道门都发现不了，离线或受限网络下示例退化为失败占位。候选：① 改为自托管图片（需评估仓库二进制与许可登记）；② 在文档显式声明「断网时为预期降级」，并把图片可达性断言纳入常驻 E2E | 低 |
| 禁用态不透明度字面量回归守卫 | 2026-09-17 第 5 轮收敛了组件内 `opacity: 0.6`、第 6 轮收敛了 `opacity: 0.5`，两档合计 37 处已全部并入 `--caomei-disabled-opacity`（组件内 `src/components/**`），但 `check:design` 只守 `#hex` / `rgb()` / `hsl()`，无法阻止字面量回流。候选：为该属性加同类预算守卫（覆盖 `0.5` / `0.6`），避免一次性清理被后续开发稀释 | 低 |
| 触发器 `unstyled` 遗留收敛 | 触发器外观豁免已在 Popover（M5-4）与 DropdownMenu（M5-6）落地；仍有三处直接使用 Reka primitive 绕过：`date-picker.vue` / `color-picker.vue` 的 `PopoverTrigger as-child`、`split-button.vue` 的 `DropdownMenuTrigger as-child`。候选收敛为 `Caomei*Trigger` + `unstyled`，须复验 a11y 接线、拼接边框 / 圆角与焦点环（SplitButton 的 `as-child` 拼接依赖 ButtonGroup 规则） | 低 |
| 代码注释 / 测试名的规划编号守卫 | [规划规范 §4](../standards/planning.md) 禁止在代码注释与测试名中写入规划编号（例外仅真实常量与带文档路径的导航指针），但当前只靠人工 Review Gate 拦截（本批新增注释曾因写入 `（M5-6）` 被判 blocker）。候选：在 `scripts/governance/` 增机检规则，扫描 `src/**` 的注释与 `*.test.ts` 用例名，命中 `T\d+` / `P\d+-\d+` / `M\d+-\d+` / `RG-[BWS]\d+` 即失败并接入 `governance:check`（须带语料矩阵正例与「受检范围未被静默收窄」断言，防误报） | 低 |
| 治理记录索引完整性 | `docs/design/governance/index.md` 需人工维护，本批发现 M5 B2 记录漏登记（B3 同批回补）；`governance:check` 无覆盖。候选：加脚本比对 `docs/design/governance/*.md` 与索引中的链接集合差，接入 `governance:check` | 低 |
| 治理记录的历史规划指针失效 | Phase 7 第二阶段归档后，`docs/design/governance/**` 多处验证记录与评估记录的「批次 / 执行源」指针仍写向 `todo.md` 的 M5 / M6 段（该段已随归档清空，链接可解析但内容不存在）。按 [文档规范 §4](../standards/documentation.md) 的「存量在下次触碰该文件时收敛、不强制全库回溯」，候选为分批改指 [待办归档](./todo-archive.md) 或把历史批次标注改为快照措辞（不强制一次性全库回溯） | 低 |
| DropdownMenu 项模型的嵌套与逐条目类名 | `model`（M5-5）只覆盖 `label` / `icon` / `command` / `disabled` / `separator`；momei 实测用量另有 **`MenuItem.items`（嵌套子菜单）** 与 **`MenuItem.class`（逐条目类名）**，两者当前无等价入口（迁移指引给出的是「平铺为 `CaomeiDropdownMenuGroup` + `Label`」与「改用声明式条目 + 原生 `class`」的绕行写法）。取证（momei HEAD `179f186f`，2026-09-18）：`rg -n "items: \[" /root/projects/momei/composables/use-admin-menu-items.ts` → 2 处（广告分组 / 设置分组）；`rg -n "class:" /root/projects/momei/components/language-switcher.vue` → 1 处（`is-active-locale`）。候选：① 为 `model` 增 `items` 递归渲染（需引入 Reka `DropdownMenuSub*` 组合件）；② 为 `model` 增 `class` / `extraAttrs`。两者均为**模型契约扩展**，须用户授权后再实施 | 中 |
| 分组按钮可访问语义 | ButtonGroup / SplitButton 的根目前仅作布局容器，无障碍树中是多个独立按钮；候选为根补 `role="group"` 与可选的分组可访问名 | 低 |
| ui-validator 资产 follow-up | ① `AGENTS.md` 智能体矩阵 `@ui-validator` 行「组件在真实页面」宜扩为「组件与文档站」——该文件受保护，须用户明确指示后随一次授权变更执行；② `SKILL.md` 缺独立「确认门」小节（职能现由 Step 1.3 / 2.5 / 6.4 分担），下次改动时可成节；③ `.github/agents/ui-validator.agent.md` 的「窄屏降级行为」宜与[响应式设计 §3](../design/responsive.md) 矩阵口径对齐（改为「按矩阵核对窄屏响应式行为，卡片化 / 转全屏不作默认预期」） | 低 |
| locale 守卫能力演进 | `check-locale-keys` 已落地「命名空间 / 键集合 / 占位符 / 非空白值 / 注册 id 与文件名同源 / 导入路径校验」；剩余候选项：结构差异错误附带行号（59 条规模下定位成本低）、解析器容忍块注释与行尾注释（现为有意的响亮失败） | 低 |
| 文档站首页 hydration mismatch | 生产构建首页出现 SSR/CSR 属性不一致告警，中文首页同样复现，与 i18n 无关；待定位是否上游行为 | 低 |
| @iconify/vue 可选接入 | 当前图标仅支持 `@lucide/vue` 组件；按需引入 `@iconify/vue` 支持字符串图标名（escape hatch） | 低 |
| Input 家族样式层共享 | **已迁入[长期任务台账](./recurring.md)**（样式重复收敛 → Input 家族样式层共享批次，条件触发）。attrs 透传已抽取 `useAttrForwarding`；Password 已由 Input 派生并复用其样式（未分叉），其余文本输入类组件仍各自维护 scoped 样式，出现样式分叉时再评估共享样式层 | 低 |
| 视觉回归基线 | Playwright 截图比对主题 / 暗色 / 响应式，并对浮层断言页面稳定性（遮罩完整、`in-flow` 不位移；fixed 元素按滚动条宽容差） | 低 |
| 浮层交互 E2E 规格 | ConfirmDialog / Dialog 的焦点落位、滚动锁复位、遮罩拦截等浏览器态行为目前仅由一次性脚本验证；待补 `test/e2e/` 规格。**剩余**：① 上述浮层交互规格（焦点落位 / 滚动锁复位 / 遮罩拦截）与页面稳定性测量（[测试规范 §5.1](../standards/testing.md)）；② E2E 接入 `pnpm verify` / CI（需流水线 `playwright install --with-deps chromium` 与容器参数，属门禁增强，需授权） | 低 |
| 常驻 E2E 规格 follow-up | ① 滚动容器口径已覆盖 ButtonGroup，Tabs / DataTable 仍无夹具用例（规范见[响应式设计 §3 / §4](../design/responsive.md)）；② 键盘聚焦相关表述宜向「容器 client rect」归一；③ 日历面板内的焦点态（日格 `outline-offset: 1px` 在滚动容器内是否被裁）无断言，静态推算不裁但缺实测；同批还有「上限生效态双轴滚动行为 / 窄容器 < 198px 的内联日历 / `showTime` 形态纵向尺寸」无用例；④ 常驻 E2E 统一以 reduced-motion 运行（几何确定性所需），**默认动效路径（no-preference）自此无常驻覆盖**——如需回归可增设一个 no-preference 的 project，或对动效单独设用例；⑤ `playwright.config.ts` 与 `test/e2e/fixtures/vite.config.ts` 登记在 `tsconfig.node.json`，而 `pnpm typecheck`（`vue-tsc --noEmit`）不构建 references，故「typecheck 通过」不含这两个文件——与既有 `vite.config.ts` / `vitest.config.ts` 同状，属既有工程约定，评估是否纳入统一类型检查 | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射，不内置依赖 | 低 |
| Storybook 组件工坊 | 暂不启用；组件演示优先使用文档站（见 [文档与演示站](../design/documentation-site.md)） | 低 |
| 执行层规则重述与失效引用收敛 | code-reviewer `SKILL.md` §5.6 仍重述 planning §4 的编号禁令（宜改为一行引用）；`code-quality-checklist.md` 的「不可简化清单」引用了不存在的 `security.md §8`（该清单本体缺失，应补入安全规范或改指权威位置），「事实源层次」引用 `documentation.md §4`（实际为「维护职责」，事实源原则在 §2，且 `L0 > L1 > L2 > L3` 表述全仓未定义） | 低 |
| 样式档位死声明回归守护 | 组件中 `:where()` 档位块直接声明属性（padding / font-size 等）会被更高特异性规则覆盖而静默失效，ToggleButton / Checkbox / RadioGroup 已各出现一次；建议对构建产物 CSS 加断言或补计算样式 E2E，并统一「档位只声明 CSS 变量」约定 | 低 |
| wisdom 蒸馏的机检完备性 | 蒸馏以「迁移 N 条 + 删除 M 条」自报，无脚本核验（`.session/wisdom.md` 为 gitignored）；候选在蒸馏机制增加「清空前活跃段快照 + 条目数对账」步骤（2026-09-17 蒸馏已按「原文摘要逐条入归档 + 计数对账」执行，但仍是人工步骤） | 低 |
| 文档站观感与展示力 | **待后续评估**（用户决策：候选先留在 Backlog）。候选：组件画廊 / 首页视觉 / demo 外壳升级（标题、代码折叠与复制）/ 全局视觉细节；约束为服务「更好展示组件」且不引入 Tailwind。现状：首页为 VitePress 默认 hero；已有自定义 `layout.vue`（主题预设切换器）与 `component-api.vue`，缺总览页 / 画廊 / demo 外壳。见 [评估记录 §4](../design/governance/2026-09-16-new-requirements-evaluation.md) | 中 |
| CHANGELOG 生成器健壮性收口 | F5-2 复审 follow-up（2026-09-19）：① `generate-changelog.mjs` 对无 `remote.origin` 仓库的降级无效——`readRepository()` 同步返回 `this`、异步拒绝无法被同步 `try/catch` 捕获；② 预设按 `process.cwd()` 读 `changelog.language`，fixture 内语言配置不生效（单测仅因 cwd 为仓库根而通过）。候选：先探测 remote 存在性再调用，并让生成语言源自 `root`；补「无 remote」「非仓库根 cwd」两条定向用例 | 低 |

### 1.7 服务层候选（composables）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 通用对话框服务 `useDialog` | 用户需求 | **评估结论：暂不实现**。5 个下游仓库（momei / caomei-auth / afdian-linker / rss-impact-next / dependfix）检索 `useDialog`、`DynamicDialog`、`DialogService` 零命中；momei 的 Dialog 全为声明式（`v-model:visible`，必要时 `defineExpose({ open, close })`）；确认场景由 `useConfirm`、轻提示由 `useToast`、自定义内容由 `CaomeiDialog` 覆盖。**触发条件**：出现非组件上下文（store / 路由守卫 / 请求拦截器 / 工具函数）的命令式弹窗用例，或迁移试点确认声明式不可覆盖，或第二个下游提出同一诉求。若实现，范围收敛为基于 `CaomeiDialog` 的 `useDialog()` + 宿主组件 | 低 |

### 1.8 下游协同候选

> momei 迁移可行性评估结论「**可行（有条件）**」（记录见 [2026-09-17-momei-migration-feasibility](../design/governance/2026-09-17-momei-migration-feasibility.md)）：按 C3 分批全量执行、接受 16 条有意差异、回归强度由每周回归任务承载。**momei 侧迁移（B0b 视觉基线 / B2 / B3 / B4）由 momei 项目在其仓库执行、本仓不触碰 momei 文件**；本仓等待其反馈。阶段与执行状态见[路线图](./roadmap.md)。

| 候选 | 说明 | 优先级 |
|------|------|--------|
| momei 侧迁移执行 | **执行主体为 momei 项目**（在其仓库执行，本仓不触碰 momei 文件）：B0b 视觉基线 → B2 数据类页面 → B3 表单与设置页 → B4 展示 / 浮层 / 收尾（卸载 PrimeVue）；回归强度由每周回归任务跑 momei 测试承载。本仓等待其反馈后再决定下一轮动作 | 等待外部反馈 |
| 下游兼容性回归机制 | 见 [路线图 Phase 8](./roadmap.md)，稳定使用后启用；**当前不启用跨仓触发**，回归由 momei 每周回归任务承载 | 延迟 |

## 2. 维护约定

- 新增候选时注明来源（用户需求 / 治理发现 / 使用面统计）与初步优先级。
- 被否决的候选记录结论与理由（如 §1.7 `useDialog`、§1.1 `Select filter`）。
- 候选状态流转：§1 候选池 → 用户决策后登记到 [待办事项](./todo.md) 当前阶段 → 阶段完成后随 [待办归档](./todo-archive.md) 迁移；**已交付 / 已归档条目不在本表保留任何内容**。
- 重复发生或需按期重复执行的治理动作，按 [规划规范 §8](../standards/planning.md) 的长期任务制度升级到 [长期任务台账](./recurring.md)，并在本表对应行标注迁出。
