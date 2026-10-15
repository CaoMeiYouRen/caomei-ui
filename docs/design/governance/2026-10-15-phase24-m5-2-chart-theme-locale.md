# Phase 24 M5-2：Chart 暗色 / 主题预设 / 语言联动与文档

> 创建时间：2026-10-15
> 阶段条目：Phase 24 M5-2（主线 M5 图表能力收口条；M5-1 已交付封装本体）
> 范围依据：[Phase 24 范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §10.1 **D3**（「轻量封装，并做好**暗色与国际化文本联动**」）。
> 边界声明：**零新增依赖**（未新增任何包）；不改动公共 API 契约（只新增导出与缺省行为）。

## 1. 结论摘要

| 面 | 结论 |
|:---|:---|
| 主题派生 | 新增 `chart-theme.ts`（纯函数）：由宿主 `--caomei-*` token 生成 ECharts 主题对象；**暗色 / 预设联动**经根元素标记观察自动重算重绘（§3.1） |
| 语言联动 | `initOptions.locale` 由 `useLocaleCode()` 派生；未内置语种（`JA` / `KO`）按需动态注册；**切换语言重建实例**（§3.2） |
| 数据格式联动 | 新增 `useChartFormat()` 与四个纯函数（数字 / 百分比 / 日期 / 单位），跟随宿主语言（§3.3） |
| 共享装置 | 主题观察逻辑抽到 `_shared/use-root-theme`，`CaomeiRichTextEditor` 的 `useEditorTheme` 改为委托（**消除双实现**） |
| 文档 | 组件页（中英）新增「暗色与主题联动」「语言与数据格式联动」「常见陷阱」三节 + 两个可运行示例（中英各 2 个） |
| 装置 | 新增 `test/e2e/chart-theme.e2e.ts`（3 用例 × 3 project）：**相对判据**（与宿主 token 计算值比对）验色值与文本联动（§5.2） |
| 质量门 | `pnpm verify` exit 0；`pnpm test:e2e` **369 passed**；单测 31 例（图表目录） |

## 2. 交付物

| 类型 | 文件 |
|:---|:---|
| 主题 | `src/components/chart/chart-theme.ts`（token 读取 + 主题对象构造，均为纯函数） |
| 语言 | `src/components/chart/chart-locale.ts`（映射 + 按需注册） |
| 格式 | `src/components/chart/use-chart-format.ts`（`useChartFormat()` + `formatChart{Number,Percent,Date,Unit}` + `createChartFormat`） |
| 共享 | `src/components/_shared/use-root-theme.ts`（新）；`src/components/rich-text-editor/use-editor-theme.ts`（改为委托） |
| 类型声明 | `src/shims-echarts-i18n.d.ts`（`echarts/i18n/*` 无类型入口，仅声明模块可解析） |
| 单测 | `chart-theme.test.ts` / `chart-locale.test.ts` / `use-chart-format.test.ts`（新增）+ `chart.test.ts`（扩充） |
| E2E | `test/e2e/chart-theme.e2e.ts` + 独立夹具入口 `chart-theme.html` / `chart-theme.ts` / `chart-theme-app.vue` / `chart-theme-chart.vue` |
| 文档 | `docs/components/chart.md`、`docs/i18n/en-US/components/chart.md`、示例 `themed.vue` / `locale.vue`（中英） |

## 3. 实现要点与关键决策

### 3.1 主题由 token 派生（含暗色与预设联动）

- **取值**：系列配色 = `--caomei-color-primary` / `success` / `warning` / `danger` / `text-muted`（顺序即配色顺序）；文字与次级文字、轴线 / 分割线、提示框底色、字体分别取对应语义 token；**背景保持透明**（图表落在宿主背景之上）。
- **第 5 色取次级文本色而非 `--caomei-color-neutral-solid`**：后者不随暗色调整（恒为 `#52525b`），在暗色底 `#0b0b0d` 上非文本对比度不足 3:1；次级文本色亮 / 暗分别为 `#6b7280` / `#a1a1aa`，两档均达标。该取舍已写入源码与组件页。
- **联动机制**：观察根元素 `class` / `data-theme` / `data-scheme` / **`data-preset`**（预设改变 token 取值），变化即重算主题；`props.theme` 显式传入时整体接管（逃生舱，优先级不变）。
- **共享装置**：观察逻辑与「主题相关属性」清单收敛到 `_shared/use-root-theme`（返回 `isDark` + `revision`），编辑器侧 `useEditorTheme` 改为委托同一实现——两处不再各写一份 MutationObserver。编辑器既有 5 个测试文件（35 例）保持全绿。

### 3.2 语言联动（内核界面文案）

- 映射：`zh-CN` / `zh-TW` → `ZH`（ECharts 未提供繁体语言包，属**已登记的有意差异**）、`en-US` → `EN`、`ja-JP` → `JA`、`ko-KR` → `KO`。`EN` / `ZH` 由 `echarts/core` 内置；`JA` / `KO` 经 `import('echarts/i18n/langXX')` 副作用注册（幂等，失败回落内置语言并告警）。
- **语言切换无条件重建实例**：`locale` 是 `echarts.init` 的初始化参数、无法热更新；即使 ECharts 语言键未变（`zh-CN` ↔ `zh-TW` 同为 `ZH`），使用方基于宿主语言的格式化器也需要一次重绘才生效。重建会丢失实例内临时状态（缩放 / 高亮），已在组件页「常见陷阱」声明。

### 3.3 数据格式联动

- `useChartFormat()` 返回 `locale` 与 `formatNumber` / `formatPercent` / `formatDate` / `formatUnit`，全部读 `useLocaleCode()`，可直接接进 `option` 回调（`axisLabel.formatter` / `tooltip.valueFormatter` 等）。
- 同时导出纯函数（`formatChartNumber` 等）与 `createChartFormat(locale)`，便于非组件上下文使用与单测。
- **百分比入参为比值**（`0.42` → `42%`）；**单位标签原样拼接**（不换算、不改写）——`Intl` 的 `style: 'unit'` 只接受规范化单位标识（`megabyte`），无法承载 `MB` / `req/s` 一类业务写法。两条口径均已写入类型注释与组件页。

### 3.4 口径与实现对齐（承接 M5-1 的 R1 教训）

本批改变了 `theme` / `initOptions` 的缺省行为，故**同批改写三处口径**：`types.ts` 双语 JSDoc、组件页（中英）、治理记录——`theme` 由「缺省不传、用 ECharts 默认主题」改为「缺省按宿主 token 派生、显式传入者优先」；`initOptions` 由「原样透传」改为「注入跟随宿主语言的 `locale`，显式 `locale` 优先，其余原样透传」。

## 4. 载体同步

1. **新增**：上述 §2 全部文件；`docs/design/governance/2026-10-15-phase24-m5-2-chart-theme-locale.md`（本记录）。
2. **修改**：`src/components/chart/chart.vue`（主题派生 + 语言注册 + `initOptions` 注入 + 重建实例）、`types.ts`（口径）、`index.ts`（格式化出口）、`src/components/rich-text-editor/use-editor-theme.ts`、`docs/components/chart.md` + 英文页（三节 + 示例引用 + 渲染器说明）、`docs/examples/chart/{themed,locale}.vue` + 英文对应、`docs/design/components.md`（§5 Tier 3 行补联动）、`docs/design/design-spec.md`（§7 Chart 条目补联动内建）、`docs/tsconfig.json`（`../src/**/*.d.ts` 纳入，使 `typecheck:docs` 能解析 `echarts/i18n/*` 的模块声明）、`test/e2e/fixtures/app.vue`（**不注册** `SVGRenderer`——需该渲染器的用例走独立入口 `/chart-theme.html`，通用夹具保持 canvas 断言；R2 收口时移除了 R1 期一度加入的无效注册）、`test/e2e/chart.e2e.ts`（轮询等待 + 阈值校准注释更新）、`docs/plan/todo.md`、`docs/design/governance/index.md`。
3. **未改**：`test/capture/baseline.json`（Chart 仍未纳入计算样式采样面，见 §7 第 4 条）。

## 5. 验证与判别力

### 5.1 单测

- `chart-theme.test.ts`：token 读取顺序、空值剔除、主题对象的配色 / 背景透明 / `textStyle` / 标题 / 图例 / 提示框 / 四类坐标轴取值。
- `chart-locale.test.ts`：五语种映射、`zh-TW` → `ZH`、内置语言不触发加载、`JA` 注册成功且幂等（**真实导入语言包**）。
- `use-chart-format.test.ts`：四个纯函数的取值口径（含单位空串不留尾随空格）、`createChartFormat` 与纯函数一致、`useChartFormat()` 在 `CaomeiConfigProvider` 下随语言切换更新。
- `chart.test.ts`：新增「缺省透传派生主题对象 + 显式 `theme` 优先」「运行期切换 `theme` prop」「显式 `theme` 置空后回落派生主题」「根元素主题属性变化后按新 token 重算」「`initOptions` 注入 `locale`、显式优先」。图表目录共 **31 例**全绿。

### 5.2 浏览器装置（`test/e2e/chart-theme.e2e.ts`）

判据全部为**相对口径**（与宿主 token 的计算值比对，不写死色值），因此配色 / 预设调值后用例仍有效，只有「联动失效」才会失败：

| 用例 | 判据 |
|:---|:---|
| 暗色联动 | 切 `data-theme="dark"` 后图中系列色须等于暗色下 `--caomei-color-primary` 的计算值，且**亮色取值不再出现**（排除「两色恰好并存」的假通过）；切回后亮色恢复 |
| 预设联动 | 切 `data-preset="caomei"` 后系列色须等于品牌预设取值，且极简预设取值不再出现 |
| 语言联动 | 夹具用 **SVG 渲染器**（文本在 DOM 中可读）：中文档轴标签为「年月日」写法，切语言后变为英文日期写法且**不残留中文写法**，切回后恢复 |

- **判别力实证（真实发生的中间态）**：实现过程中 `chart.vue` 一度仍绑定 `:theme="props.theme"`（未改用派生值），装置立即失败并给出实测：系列色为 ECharts 默认 `rgb(80, 112, 221)` 而非宿主 token 的 `rgb(37, 99, 235)`——即「主题未接线」可被拦下。修正后转绿。
- **SVG 渲染器与按需注册**：夹具显式 `use([... SVGRenderer ...])`。首次运行因只注册了 `CanvasRenderer`（`initOptions.renderer` 只是选择、不引入渲染器）而回落 canvas、文本不可读——该现象已作为**陷阱**写入组件页中英两版。

### 5.3 判据校准的再确认（M5-1 遗留项）

主题派生改变了「彩色像素」口径的取值分布：注册 `BarChart` 时实测 **0.21**（系列色取宿主主色，饱和度更高），移除 `BarChart` 的负向对照为 **0.000143**；`MIN_COLOR_RATIO = 0.0005` 对两套配色均成立（高于负值 3.5 倍、低于正值 400 倍以上）。同时 `chart.e2e.ts` 改为**轮询**等待彩色像素出现——主题 / 语言缺省值在挂载后才派生会触发实例重建，存在「画布已建、系列未绘制」的中间态（一次性取样曾偶发失败）。

## 6. 质量门

- `pnpm verify` **exit 0**；`pnpm test:e2e` **369 passed**（含新增联动装置 3 用例 × 3 project）；单测图表目录 31 例；`pnpm lint` / `lint:css` / `lint:md` / `typecheck` / `typecheck:docs` 全绿。

## 7. 边界（显式声明）

1. **语言切换重建实例会丢失实例内临时状态**（缩放 / 高亮 / 联动选择）：`locale` 无法热更新所致，已在组件页声明；如需保留，使用方可自行在语言变化前记录状态。
2. **`zh-TW` 的 ECharts 界面文案为简体**（无繁体语言包），属有意差异，组件页未隐去。
3. **数据格式的本地化由 `useChartFormat()` 承担**：本组件不自动改写 `option` 中的格式化回调（不注入隐式行为）；数字分组在本库五个语种下写法一致，故浏览器装置以**日期**作为文本联动判据。
4. **Chart 仍未纳入 `capture:styles` 采样面**：`capture:styles` 已跑，「不回归」成立（0 差异）；但组件自身的声明式样式（占位边框 / 字号）未在采样面内——如需纳入，应在后续批次连同基线重冻结一起做。
5. **未覆盖**：`data-scheme="auto"` 的系统暗色跟随未在浏览器装置内覆盖（单测覆盖解析优先级）；`data-preset="momei"` 未逐项覆盖（判据为相对口径，机制同一）；主题对象未覆盖 `series` 级细粒度样式（如 `line` / `pie` 的专属项）。

## 8. Review Gate

- **audit-depth**：`standard`（R1 全量；R2 范围冻结的 delta 复审）。单分区。
- **R1（`standard`）：`Reject`**（**1 blocker / 2 warning / 3 suggest**；审计方实测约 6 分 15 秒，未超 10 分钟时间盒）。
  - **RG-B1（blocker，已关闭）**：`theme` prop **运行期变更不再传播**（相对 M5-1 的能力回退）——本批把模板绑定由 `:theme="props.theme"`（响应式透传）改为 `:theme="chartTheme"`，而 `chartTheme` 只在挂载与根元素属性变化时写入，使用方动态切换主题名 / 对象时图表静默保持旧主题；同函数内的 `initOptions` 走 `computed` 保持了响应性，属遗漏而非取舍。→ **改为 `computed(() => props.theme ?? deriveTheme(revision.value))`**：显式主题短路（不订阅 `revision`）、置空后重新收集依赖；并补两条单测（运行期切换 `theme`、置空回落派生）。
  - **RG-W2（warning，已采纳）**：`useChartFormat()` 的推荐用法（`axisLabel.formatter` 逐点调用）会每个数据点新建 `Intl` 实例。→ 对**无参调用**按语言记忆化（带 `options` 的调用仍不缓存），并在中英组件页补「重图表建议用 `createChartFormat(locale)` 取一组固定格式化器」。
  - **RG-W3（warning，已采纳）**：通用夹具注册的 `SVGRenderer` 无受检对象（需它的用例已迁至独立入口），且注释指向不存在的段落、与「独立入口避免污染」的声明自相矛盾。→ 已移除该注册并改写注释。
  - **RG-S4 / RG-S5 / RG-S6（suggest，均已采纳）**：记录内交叉引用由「§8.4」改为「§7 第 4 条」；英文示例去掉混排可见文本与中文注释；`CHART_BUILTIN_LOCALES` 补注「实现以 loader 表为唯一事实源」。
- **R2（delta 复审，范围冻结）：`Pass`**（0 blocker；1 warning + 3 suggest）。
  - **RG-W4（warning，已采纳）**：治理记录未随 R2 收口回扫——§4 载体同步仍写「`app.vue` 补 `SVGRenderer`」（与同批移除**方向相反**），§5.1 / §6 的「28 例」已增至 31 例。→ 本记录已回扫载体声明与计数（本条即回扫结果）。
  - **RG-S7 / RG-S8 / RG-S9（suggest，均已采纳）**：补「显式 `theme` 置空后回落派生主题」用例（锚定 RG-B1 的优先级语义）；重派生用例的等待由手工时序改为 `vi.waitFor`，注入 / 清理移入 `try/finally`（避免断言失败时把 token 留在根元素上）；`CHART_BUILTIN_LOCALES` 注解收敛为「当前只供测试引用」。
- **R2 复核要点**：`props.theme` 为真时 `??` 短路、不订阅 `revision`，置空后重新求值并重新收集依赖（语义正确）；SSR 下 `deriveTheme` 因 `document` 缺失返回 `undefined`，且 `chartModule` 仅在 `onMounted` 后就位 ⇒ 无水合不一致；记忆化未改变取值（缓存构造式与回退分支逐字相同，带 `options` 完全旁路）；`SVGRenderer` 全仓仅存于独立入口；`vue-echarts@8.3.2` 的 `realTheme` 具备 `theme` 热切换能力（源码取证），故 RG-B1 修复方向成立。
- **是否需第 2 轮**：已起（见上）；R2 后无残留 blocker。
- **follow-up（登记，不阻断）**：① `data-scheme="auto"` 的系统暗色跟随未在浏览器装置覆盖（单测覆盖解析优先级，见 §7.5）；② 派生的触发面为根元素属性（样式表 / CSSOM 单独变更不触发），样式异步晚到时首帧可能得到空色板；③ `Intl` 的记忆化会固化构造时区（模块级缓存），本仓无事例依赖运行中改 `TZ`。
