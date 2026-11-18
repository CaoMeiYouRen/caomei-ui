# 国际化、组件缺口与移动端调研

> 创建时间：2026-11-18
> 触发：用户指令「接下来做一些调研」（三问：国际化支持范围与疏漏 / 高级组件可补充项 / 移动端专属组件需求）。
> 性质：**调研记录**——不登记阶段、不分配编号、不改 `todo.md` / `roadmap.md`；落点只到 [Backlog](../../plan/backlog.md) 候选，用户裁定见 §6。

## 1. 范围与取证口径

- 本仓取证面：`src/locale/`、`src/composables/use-locale.ts`、`src/components/`（60 个组件目录，含 `config-provider`）、`docs/design/components.md`、`docs/design/responsive.md`、`docs/plan/backlog.md`。
- 对照库组件目录（GitHub `contents` API 实测，2026-11-18）：Element Plus **124** / PrimeVue **151** / TDesign **81** / Vant **107** / Varlet **105**。**目录数含内部子件（base / collection / eventbus 等），只作量级参考，不等同公开组件数。**
- 语言条目数沿用 [Phase 19 国际化调研](./2026-10-06-phase19-m7-1-i18n-research.md) 的 L1 快照（2026-10-06）：Ant Design 72 / Element Plus 67 / Ant Design Vue 66 / PrimeLocale 63 / MUI 59 / Vuetify 43。上游持续增语言，引用前须重取。
- Reka 可用 primitive 以本仓已安装 `reka-ui@2.11.0` 的**运行时导出**为准（`node -e "Object.keys(require('reka-ui'))"`），不以文档清单或设计文档现有列表为准。

## 2. 国际化现状读数

| 面 | 读数 | 取证位置 |
|:---|:---|:---|
| 内建语言 | 10 门（`zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR` / `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`） | `src/locale/index.ts` 的 `CaomeiLocale` |
| 分发形态 | 预注册 2 门（`PRE_REGISTERED_LOCALES`）+ 按需子路径 8 门；`exports` 共 13 键 | `src/locale/index.ts`、`package.json` |
| 文案规模 | 31 个命名空间 / 92 条键 / 每语言 160 行 | `src/locale/types.ts` 与各语言文件 |
| 日期本地化 | 走 `Intl.DateTimeFormat` + `@internationalized/date`，不依赖 dayjs | `src/components/_shared/date-format.ts` |
| 图表语言 | 10 语映射；`zh-TW` 回落 `ZH`（ECharts 无繁体包） | `src/components/chart/chart-locale.ts` |
| 编辑器语言 | 10 语映射；`ja-JP` → `jp-JP`、`ru-RU` → `ru` 两处显式转换 | `src/components/rich-text-editor/editor-language.ts` |
| 硬编码中文用户可见文案 | 模板层仅 2 处（均为可访问名），其余经 locale 注入 | 见 §3.3 第 3 条 |

## 3. 国际化：语言矩阵与功能缺口

### 3.1 语言矩阵对照

本库 10 门处于「聚焦型库」区间：覆盖华语圈（简 / 繁）、日韩、五大欧洲语与巴西葡语。头部库的 43 ~ 72 门主要由**地区变体**（`zh-HK` / `fr-CA` / `es-US`）与低使用语言拉高，覆盖数量不与库质量线性相关。

### 3.2 下限口径（建议，待用户裁定）

| 档 | 集合 | 说明 |
|:---|:---|:---|
| 保底面 | 现有 10 门 | 覆盖当前下游可识别语种；不构成「通用库」承诺 |
| 机械扩容面 | 二期 7 门（`it` / `nl` / `pl` / `tr` / `vi` / `th` / `id`） | 已在 [Backlog §1.4](../../plan/backlog.md) 在册；每语言约 160 行 + 键集合守卫基线同步，低风险 |
| 建议下限 | **17 门 LTR**（现有 10 + 二期 7） | `hi` 视下游是否出现南亚用户再补（补则 18 门） |
| 单列维度 | RTL（`ar` / `he` / `fa` / `ur`） | **不计入语言数量下限**：需 `dir` 贯通与逻辑属性改造，成本量级不同（见 §3.4） |

**结论**：语言数量不是当前瓶颈；按本轮 RTL 裁定（§6 R1），下限只按 LTR 口径表述，避免把 RTL 伪装成「再加一门语言」。

### 3.3 功能性缺口（按影响排序）

| # | 缺口 | 证据 | 影响 | 成本 |
|:-:|:---|:---|:---|:---|
| 1 | `DatePicker` / `Calendar` 的 `locale` 不跟随 `ConfigProvider` | 两者的 `locale` prop 默认值均为 `defaultLocale`（`zh-CN`）；[组件文档](../../components/calendar.md) 明写「与注入的内建文案语言相互独立，需要一致时请显式传入」 | provider 切到 `en-US` 后，日期面板的月份 / 星期 / 一周起始日仍按中文；`hourFormat` 默认固定 `24`，不按语言惯例切换（`en-US` 通常为 12 小时制） | 小：缺省消费 `useLocaleCode()`，显式 prop 仍优先 |
| 2 | `InputNumber` 不接收 locale | 未向 Reka `NumberFieldRoot` 透传 `locale`；[组件文档](../../components/input-number.md) 将 `locale` / `format` 列为未实现 | 数字分组与小数点跟随**运行环境**而非注入语言；SSR 与客户端可能不一致（`de-DE` 应为 `1.234,56`） | 极小：`NumberFieldRoot` 本身支持 `locale`，一层透传 |
| 3 | 两处硬编码中文文案（可访问名与提示） | `data-table.vue` 列宽手柄 `aria-label="调整「…」列宽"`；`file-upload.vue` 移除文件按钮的 `:content` 与 `aria-label` 为 `移除 …` | 非中文站点上读屏播报中文、悬停提示也是中文；也是 locale 台账的漏检面（`table` / `fileUpload` 命名空间无对应键） | 小：补两个键并纳入 10 语 |
| 4 | `Paginator` 数字未本地化 | 每页条数选项与页码均用 `String(value)` | `1000` 无法显示为 `1,000` / `1.000` | 小：改用注入 locale 的 `Intl.NumberFormat` |
| 5 | `FileUpload` 体积格式化硬编码 | `(bytes / 1024).toFixed(1) + ' KB'` 形式 | 小数点固定为点号；单位不随语言变化 | 小 |
| 6 | 日期 / 时间默认值不符合语言惯例 | `weekdayFormat` 默认 `narrow`；`hourFormat` 默认 `24` | 英文星期表头出现 `S M T W T F S` 歧义；`en-US` 拿到 24 小时制 | 小：缺省按 locale 推导，显式 prop 优先 |
| 7 | 无复数 / 插值能力 | 全库插值只有单键 `replace`；带计数的内建文案当前仅 `fileChosen`，且 `count === 1` 走文件名分支 | 新增任何计数文案（已选 N 项 / 共 N 条）在 `ru` / `pl` 上会直接出错 | 中：需在插值层加复数能力或约束文案写法 |
| 8 | 通用格式化 API 不完整 | chart 域已有公共 `useChartFormat` / `formatChartNumber` / `formatChartDate`（`src/components/chart/index.ts` 经包根再导出）；但日期域的 `formatDate` 位于 `_shared`、未进包根，库内也无通用数字 / 日期格式化入口 | 下游需要非图表场景的数字 / 日期格式化时只能自建，易与 provider 语言不一致 | 小到中 |
| 9 | 无键级运行期兜底 | 未注册语言回退 `defaultLocaleMessages`、`messages` 按命名空间浅合并（`use-locale.ts`）；缺的是**已注册语言包内部的键级** fallback | 第三方语言包缺键时渲染为空 | 中 |
| 10 | 注册表为模块级全局 | `registerLocale` 写模块级 `caomeiLocales` | 文档要求「先注册后 provide」已规避串扰，但 Nuxt 按请求切语言仍是架构约束 | 中 |

`registerLocale` 的全局性已在 [内建文案与语言](../../components/locale.md) 声明为使用约束，本记录不重复展开。

### 3.4 RTL 成本读数（只读数，不立项）

- `ConfigProvider` 仅接受 `locale` / `messages`，无 `dir`；库内无 `documentElement.dir` / `lang` 联动。
- `src/components` 下 **18 个组件文件**出现 `left` / `right` / `padding-left` / `text-align: left` 一类**物理方向**属性；逻辑属性写法为 **31 行**（`padding-inline` / `margin-inline` / `inset-inline`）。
- 方向性图标未镜像：日历前后翻页、分页首末页均直接使用 `chevronLeft` / `chevronRight`。
- 现有 10 语言全为 LTR，E2E 与视觉基线均无 RTL 档位。

### 3.5 文档缺口：支持语言与翻译状态表

现状（2026-11-18 核对）：

- `docs/components/locale.md`（中英双页）有「预注册 / 按需引入」与「子路径」两张表，但**没有一张「支持哪些语言 + 翻译到什么程度」的总表**。
- `README.md` 的特性节与 `README.en-US.md` 均无语言支持条目；中文 README 仅在「目录结构」的 `src/locale/` 注释里出现「10 语」，门面信息散落。
- 可复算的数据源已经齐备：`check:locale-keys`（键集合与键数）、`check:locale-ledger`（命名空间 ↔ 消费组件台账）、[Phase 26 G4 记录 KL-7](./2026-10-31-phase26-g4-rollback-and-known-limitations.md)（M4-2 已裁定「未复核」）与 [Phase 26 登记批次 M4-2](./2026-10-22-phase26-registration.md)（复核计划与验收口径）。

拟议表结构（单表，中英双页同构）：

| 列 | 取值 / 来源 |
|:---|:---|
| 语言标识 | `CaomeiLocale` 成员 |
| 本地名称 | 各语言的本地写法（`简体中文` / `English` 等） |
| 分发形态 | 预注册 / 子路径，取自 `PRE_REGISTERED_LOCALES` |
| 键覆盖 | `已覆盖键数 / 总键数`，取自 `check:locale-keys`，不手写估计 |
| 复核状态 | `已复核` / `未复核`，以治理记录为准，无记录即「未复核」 |
| 日期与数字本地化 | `跟随 locale` / `已知缺口`，指向 §3.3 的对应条目 |
| 备注 | 已知回落（`zh-TW` 图表回落 `ZH`）、RTL、编辑器语言键差异（`ja-JP` → `jp-JP`） |

落地口径：

- 主表落 `docs/components/locale.md`，`docs/i18n/en-US/components/locale.md` 同步同构表（受 `docs:check:i18n-parity` 约束）。
- `README` 特性节补一行「内建 10 门语言，按需引入」并链到 locale 页，不复制表格。
- 「翻译情况」必须由机检与台账派生，不写百分比估计；复核状态缺记录时按「未复核」如实标注。
- 不引入语言覆盖率徽章：当前无稳定的统计口径。

本条属文档呈现层，不改变 §3.2 / §3.3 的结论。

## 4. 组件缺口

### 4.1 判定口径

`reka-ui@2.11.0` 实测导出中，与候选直接相关的 primitive / 复合件：

- 输入与校验：`PinInputRoot`、`FormRoot`、`FieldRoot` / `FieldLabel` / `FieldControl` / `FieldDescription` / `FieldError` / `FieldValidity`
- 层级与结构：`TreeRoot` / `TreeItem` / `TreeVirtualizer`、`SplitterGroup` / `SplitterPanel` / `SplitterResizeHandle`
- 导航浮层：`HoverCard*`、`ContextMenu*`、`Menubar*`、`NavigationMenu*`
- 日期扩展：`MonthPicker*`、`YearPicker*`、`DateRangePicker*`、`TimeField*`
- 其他：`Editable*`、`ScrollArea*`、`Listbox*`、`TagGroup*`

意味着上述组件的**交互与无障碍主体已在依赖内**，封装成本主要在样式、变体与文档，而不是重新实现键盘与 ARIA。

### 4.2 缺口与优先级

| 优先级 | 组件 | 依据（2026-11-18 对照库目录实测） |
|:---|:---|:---|
| P0 | InputOtp | `PinInputRoot` 现成；Element Plus `input-otp` / PrimeVue `inputotp` / Varlet `otp-input`（Vant / TDesign 无独立件）；登录 / 验证码高频 |
| P0 | Popconfirm | Element Plus / TDesign 的 `popconfirm`、PrimeVue 的 `confirmpopup`；比 `ConfirmDialog` 轻，不打断上下文 |
| P0 | Empty | Element Plus / TDesign / Vant 的 `empty`；本库只有 `DataView` 空态与表格空文案 |
| P0 | Result | Element Plus / Varlet 的 `result`；缺独立的结果页语义（成功 / 失败 / 无权限） |
| P0 | Descriptions | Element Plus / TDesign 的 `descriptions`，PrimeVue 以 `fieldset` 近似；管理端详情页刚需 |
| P1 | Tree / TreeSelect | 五库均有对应件（Vant `tree-select`、Varlet `tree-menu` 为近似件）；Reka `TreeRoot` 为 Alpha，需锁版本与回归 |
| P1 | Cascader | Element Plus / PrimeVue `cascadeselect` / TDesign / Vant；Varlet 无（多级类目 / 省市区） |
| P1 | Transfer | Element Plus / TDesign，PrimeVue 为 `picklist` / `orderlist`；Vant / Varlet 无；权限分配标准件 |
| P1 | Form 校验能力 | Element Plus / TDesign / Vant / Varlet 以 `form` 目录承载 rules 引擎，PrimeVue 为独立 `@primevue/forms`；本库 `Form` 明确无 rules —— **结构性缺口**；可先以 `FormRoot` + `Field*` 接 invalid / 错误文案，先做 ARIA 与错误展示，不承诺与五库 API 对齐 |
| P1 | Timeline | Element Plus / PrimeVue / TDesign；日志、审批流程 |
| P2 | MonthPicker / YearPicker | Reka `MonthPicker*` / `YearPicker*` 现成；作为 `DatePicker` 的 `selectionMode` 扩展比新建组件便宜 |
| P2 | Statistic | Element Plus / TDesign，Varlet 为 `count-to`（近似）；仪表盘 |
| P2 | Countdown | Element Plus / Vant / Varlet；活动页 |
| P2 | Tour | Element Plus 的 `tour`、TDesign 的 `guide`；新功能引导 |
| P2 | Carousel | 五库均有（Vant / Varlet 为 `swipe`、TDesign 为 `swiper`）；已定 embla headless |
| P2 | Watermark | Element Plus / TDesign / Vant / Varlet |
| P2 | Splitter | Element Plus / PrimeVue；Reka `SplitterGroup` 现成 |
| P2 | Anchor | Element Plus / TDesign；PrimeVue 无独立件（`animateonscroll` 是滚动动画指令） |
| P2 | QRCode | 仅 TDesign 有独立 `qrcode`；按下游需求再定 |
| P2 | ContextMenu / HoverCard / Menubar / NavigationMenu | Reka 原语现成；PrimeVue 有 `contextmenu` / `menubar`；Varlet 仅有 `hover`，无 ContextMenu / Menubar；封装为样式层即可 |

**不建议纳入**：App Shell（`container` / `aside` / `header`）与 `Overlay` / `Fab` / `List` 属应用层组合或可替代形态（结论见 [Backlog §3](../../plan/backlog.md)）；业务件（`address-*` / `coupon-*` / `contact-*`）与 `TreeTable` / `Knob` / `OrganizationChart` 属下游自留长尾（见 [组件设计 §6](../components.md)）。

### 4.3 文档漂移

[组件设计 §5](../components.md) 的「未纳入本清单的 Reka primitive」清单已过期：漏列 `FormRoot` / `Field*`、`MonthPicker` / `YearPicker`、`Splitter`、`TreeVirtualizer`、`TagGroup`、`Listbox`。**同批修正**：该段改为「Reka 可用 primitive 清单」并补齐缺项，候选取舍与优先级统一回链 [Backlog §1.11](../../plan/backlog.md)，避免设计文档与 Backlog 并存两套候选清单。

## 5. 移动端

### 5.1 既有边界

[响应式设计 §1](../responsive.md) 的**非目标**：移动端独立包、触摸手势（左滑返回 / 下拉刷新）、基于 JS 的视口分支与通用 `breakpoint` props、容器查询、`DataTable` 卡片化、通过放大视觉尺寸提升触摸目标。

已交付的移动端能力：`data-density="touch"` 密度轴（只覆盖尺寸类 token）、`--caomei-hit-target-min` + 不可见命中区（P0 / P1 / P2 三批，视觉盒不变）、五档视口回归（含 320 与 900 两个定向档）、浮层窄屏收敛与滚动降级。

### 5.2 下游场景（用户提供）

用户 2026-11-18 说明：caomei-ui **不是移动端优先**，但**不放弃移动端支持**；`momei`、`caomei-auth` 存在移动端访问场景；`timing-push` / `rss-impact` 的重构计划中会支持移动端。因此移动端目标是**保证下限**（不能太糟糕），不是补齐一套移动端组件库。

### 5.3 三类划分（对照 Vant / Varlet）

| 类别 | 代表件 | 判断 |
|:---|:---|:---|
| A 形态差异型 | Picker（滚轮）、DatetimePicker（滚轮）、ActionSheet、NumberKeyboard、Cell / CellGroup、NavBar / Tabbar、Search 栏、SubmitBar / ActionBar | **值得评估**：桌面形态在触屏上明显更差（日历面板选日期、系统键盘输金额 / 验证码），且**不需要手势**，与既有非目标不冲突 |
| B 纯适配型 | SafeArea、Sticky 吸顶、Bottom sheet、文本省略 / 高亮 | **先走 token / 工具类 / 文档配方**：`src` 内 0 处 `env(safe-area-inset-*)`；`position: sticky` 仅 DataTable 表头；`Drawer position="bottom"` 已可承接 bottom sheet |
| C 手势交互型 | PullRefresh、InfiniteScroll、SwipeCell、图片捏合预览、IndexBar 联动、FloatingBubble 拖拽、Signature | **维持不做**：与响应式非目标一致，且需要独立的交互与测试体系 |

### 5.4 「下限」的可操作判据（建议）

把「不能太糟糕」落成可验收的五条，供后续评估与阶段登记复用：

1. **触摸目标**：清除 / 关闭 / 表单控件盒命中区满足既有 24px 口径（已交付，回归不得倒退）。
2. **浮层可关闭且可达**：窄屏面板落在视口内，内容可滚动到底，Esc / 关闭按钮 / 遮罩三条关闭路径可用。
3. **无横向溢出**：320 / 390 / 768 / 900 / 1280 五档下页面与组件容器不出现非预期横向溢出（矩阵允许内部滚动者除外）。
4. **软键盘不遮挡**：输入类组件聚焦后，被编辑区域仍可见（不做视口监听，靠布局与滚动降级）。
5. **安全区**：固定定位的底部 / 顶部件不压住刘海与 home indicator（`env(safe-area-inset-*)` 由使用方或工具类承接）。

## 6. 用户裁定与落点

| 编号 | 事项 | 用户裁定（2026-11-18） |
|:---|:---|:---|
| R1 | RTL | **成本大收益低，需单独评估**；不随二期语言批量落地，也不计入语言数量下限 |
| R2 | 组件缺口 | **后续列入计划完善**：先登记候选，不立即启动 |
| R3 | 移动端专属组件 | **值得评估**：非移动优先但不放弃；下游存在移动访问与重构计划；目标是保证下限，且与手势非目标保持边界 |

落点：

| 载体 | 内容 |
|:---|:---|
| [Backlog §1.4](../../plan/backlog.md) | 语言下限口径、`DatePicker` / `Calendar` locale 联动、`InputNumber` 数字本地化、可访问名补口、复数与插值能力；RTL 行补记 R1 |
| [Backlog §1.5](../../plan/backlog.md) | Picker / ActionSheet / Cell / NavBar·Tabbar 评估项，SafeArea·Sticky 工具项，移动端适配指南补强 |
| [Backlog §1.11](../../plan/backlog.md) | 高级组件候选（P0 ~ P2 与「不建议」边界） |

## 7. 边界

- **未做下游用量统计**：`momei` / `caomei-auth` 的移动端访问与 `timing-push` / `rss-impact` 的移动端计划为用户提供事实，本记录未取用量数据。
- **未做真实设备验证**：iOS Safari 软键盘、安全区、触摸滚动均未实测；§5.4 判据为书面口径。
- **未测各库产物体积**：只取组件目录与语言条目快照。
- **未改代码与规范**：`src/**`、`docs/standards/**`、`docs/design/responsive.md` 未改动；本记录不构成阶段范围。

## 8. Review Gate

- **R1（`standard`，时间盒 ≤ 10 分钟）**：**Reject** —— blocker 2 / warning 4 / suggest 4。
  - **RG-B01**：§3.3 #8「无公共格式化 API」与仓库事实不符——chart 域 `useChartFormat` / `formatChartNumber` / `formatChartDate` 已经包根导出。
  - **RG-B02**：外部库对照的绝对断言不成立（Empty / Result / Descriptions / InputOtp 的「五库全有」不实，backlog 与记录还出现「五库 / 三仓」分叉）。
  - warning：键级兜底表述过度、无路径日期指针、`Sticky` 双登记、设计文档与 Backlog 候选双载体。
  - suggest：`hourFormat` 与 locale 混述、`title` 非可访问名、backlog 丢失 P0 ~ P2 信号、§5.4 视口档漏 900。
- **R2（`standard`，时间盒 ≤ 5 分钟）**：**Pass** —— blocker 0 / warning 3 / suggest 3，均在提交前同批收口：
  - **RG-W05**：Form 行的「五库均以 `form` 目录承载」不适用于 PrimeVue（改为独立 `@primevue/forms`）。
  - **RG-W06**：`animateonscroll` 是滚动动画指令，不是 Anchor；PrimeVue 无独立 Anchor。
  - **RG-W07**：Varlet 的 `context` 是内部上下文工具，不是 ContextMenu。
  - suggest：近似件标注（Vant `tree-select` / Varlet `tree-menu` / Varlet `count-to`）、`components.md` 的 2.10.4 与 2.11.0 口径、索引摘要措辞。
- **R3（`standard`，时间盒 ≤ 3 分钟）**：**Pass** —— blocker 0 / warning 1。
  - 只审 R2 遗留的 3 warning / 3 suggest 修复点：Form 行的 PrimeVue `@primevue/forms`、Anchor「PrimeVue 无独立件」、Varlet「无 ContextMenu / Menubar」、近似件标注、`components.md` 的 2.11.0 注、索引摘要措辞，均已核对。
  - **RG-W08**：§8 的轮次台账须补 R3（本轮已回填）。
- **文档缺口补记（`quick`，G-R1 → G-R2）**：G-R1 **Reject** → 修复后 G-R2 **Pass**。G-R1 拦下两处：§3.4 标题被并入正文首条（结构损坏，`lint:md` 不覆盖）与「README 未提语言」的过度断言（`README.md` 的目录结构注释已有「10 语」）；G-R2 收口复核状态二值（一期 5 语按 KL-7 为「未复核」）、复核记录链接与索引落点。
- 结论：正文部分三轮 **Pass**（R3 为末轮）；文档缺口补记部分单独一轮 `Reject` → `Pass`。
- 实测用时：R1 于 `2026-11-18T14:37:48+08:00` 发起，修复与复跑完成时点为 `14:46:35`，实测上限 **8 分 47 秒**（未超 10 分钟档）；R2 在 `14:46:35` 之后发起、`14:50:58` 返回，实测上限 **4 分 23 秒**（未超 5 分钟档）；R3 在 `14:52:26` 之后发起、`14:53:18` 完成复核与工件落盘，实测上限 **52 秒**（未超 3 分钟档）；文档缺口补记 G-R1 在 `14:55:47` 之后发起、工件 `14:57:33` 落盘，上限 **1 分 46 秒**（未超 5 分钟档），G-R2 在 `15:00:18` 之后发起、工件 `15:01:26` 落盘，上限 **68 秒**（未超 3 分钟档）。正文三轮与补记一轮均按宿主时间戳计算，无超时。
- 提交前复跑：`lint:md:check` / `docs:check:links` / `check:governance-records` / `check:governance-counts` / `check:design-catalog` / `docs:check:line-count` 均通过。
