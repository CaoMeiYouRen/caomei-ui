# 文档与演示站设计

本文档定义 caomei-ui 的文档站与组件演示方案：技术选型、目录约定、组件页模板与 API 自动生成。

## 1. 目标

- 对外统一承载「指南 / 组件 / 设计 / 规范 / 规划」内容。
- **每个组件一页**：概述 + 可运行 demo + 源码 + 自动生成的 API 表。
- 解决当前 `playground/` 只能查看、无法按组件了解 API 与用法的问题。

## 2. 选型结论

| 能力 | 选型 | 理由 |
|------|------|------|
| 文档站 | **VitePress** | 全局规范首选；Markdown 即 Vue SFC，支持自定义组件 |
| Demo 渲染 | **`vitepress-demo-plugin`** | `<demo vue="..." />` 渲染组件并展示可展开源码，支持 SSG 与 StackBlitz |
| API 表 | **`vue-component-meta`** | Vue 官方 language-tools，静态抽取 props / events / slots / exposed |
| 组件工坊 | 暂不引入 Storybook / Histoire | Histoire 停滞；Storybook 偏重。文档站内 demo 已覆盖对外需求 |
| 站内搜索 | **VitePress 内置 local search**（minisearch）+ `Intl.Segmenter` 自定义分词 | 零外部依赖、离线可用；默认分词对中文不友好，用 `Intl.Segmenter` 补齐中文分词 |

补充说明：

- 插件默认将 demo 包裹在 `<ClientOnly>` 中（服务端只输出 loading 占位）。对 SSR 安全的组件应显式声明 `ssg="true"`，以获得首屏静态渲染。
- 插件会引入 shiki 的完整语法集，导致文档站产物明显增大并可能触发 `chunk > 500 kB` 警告；当前接受该体积代价（脚本语言多为惰性加载），后续按需收敛。

> 调研参考：Element Plus `:::demo` + 独立 demo 文件；Nuxt UI MDC `::component-code` + `nuxt-component-meta` 自动 API；Vuetify Inline API；Storybook 使用 `vue-component-meta` 作为 docgen。

## 3. 目录结构

```
docs/
├─ .vitepress/
│  ├─ config.ts                     # nav / sidebar / markdown 插件 / alias
│  ├─ data/component-meta.json      # 由 docs:gen 生成（.gitignore）
│  └─ theme/
│     ├─ index.ts                   # 注册全局组件、引入库样式
│     └─ components/component-api.vue
├─ components/<component>.md        # 组件页
├─ i18n/<locale>/<page>.md          # 翻译页（物理路径；站点 URL 为 /<locale>/...）
└─ examples/<component>/*.vue       # 每个 demo 一个文件
```

## 4. 组件页模板

统一顺序：

1. 一句话概述；
2. 基础用法；
3. 变体 / 尺寸 / 状态等典型场景；
4. 无障碍说明；
5. 样式定制（按需）；
6. FAQ（按需）；
7. 从 PrimeVue 迁移（按需，**页尾内容节**）；
8. API（由 `<ComponentApi>` 自动呈现 props / events / slots / exposed）——始终位于页面最后。

> **「从 PrimeVue 迁移」的定位与位置**（2026-09-18 用户裁定）：它不是能力章节，而是面向迁移读者的页尾附录，**固定放在 `<ComponentApi>` 之前的最后一个内容节**，不得插在能力章节之间；内容为映射表（PrimeVue → 本组件）、有意差异与未实现项，并链接[从 PrimeVue 迁移](../guide/primevue-migration.md)专题页。逐条映射的权威来源是[设计规范 §7](./design-spec.md)，组件页与专题页都只引用、不另立口径；**组件页迁移节与 §7 不一致时以 §7 为准（漂移视为文档缺陷）**。

## 5. Demo 约定

- 每个用例一个 `.vue` 文件，放在 `docs/examples/<component>/`。
- 正文通过 `<demo vue="../examples/<component>/<name>.vue" ssg="true" />` 引用。
- `ssg="true"` 仅用于 SSR 安全（不访问 `window`/`document`）的组件；交互 demo 同样适用，因为事件处理只在客户端触发。
- demo 从 `@/components/...` 引入库源码，保证与实现同源。
- 库样式由文档站主题统一引入；demo 只写自身布局样式。
- 浏览器断言前须核对文档页 `.demo-row` 索引与目标组件一致；索引错位会验证到无关组件并得出错误结论。

## 6. API 自动生成

- 脚本：`scripts/docs/gen-component-meta.mjs`，基于 `tsconfig.json` 创建 checker。
- 输入：`src/components/<name>/<name>.vue`。命名约定：**目录名与 SFC 文件名同名**；若无同名文件则回退到目录内唯一的 `.vue`。
- 输出：`docs/.vitepress/data/component-meta.json`（生成物，已加入 `.gitignore`，不提交）。
- 抽取字段：`props`（含 `type` / `default` / `required` / `description`）、`events`、`slots`、`exposed`。
- 过滤 Vue 内置全局 props（`global: true`）。
- 描述来源为类型定义中的 **JSDoc 注释**，因此组件 `types.ts` 的注释即文档。
- `docs:build` 前会执行 `pnpm docs:gen` 刷新生成物；直接运行 `vitepress build docs` 需先手动执行该命令。
- 开发期热更新：`pnpm docs:dev` 由 Vite 插件监听 `src/components/**`，复用 checker 增量刷新生成物；仅在元数据变化时失效组件模块并整页刷新，其余变更交由 Vite HMR。首次刷新需构建 TS program（约数秒），之后约数百毫秒。
- MetaChecker 复用：`updateFile(file, text)` 可增量刷新（热态数百毫秒）；`clearCache()` 反而更慢且可能拿到陈旧结果；首次建 TS program 约数秒。
- VitePress（root=docs）监听仓库内 `src/` 需显式 `server.watcher.add(dir)`；`moduleGraph` 以 POSIX 路径为 key，失效模块前需 `normalizePath`。

## 7. 与 playground 的关系

- **文档站**：对外，按组件承载用法与 API。
- **`playground/`**：仅本地快速调试沙盒，不再承担「了解组件与 API」职责；后续可精简或移除。

## 8. 落地顺序

1. 先用 **Button** 做样板页，验证「demo 渲染 + 源码展示 + API 自动生成 + 侧边栏」链路；
2. 通过后按 Tier 0 组件逐步补齐组件页；
3. 其余增强中，搜索与 i18n 已完成并归档（见 [待办归档](../plan/todo-archive.md) 的 Phase 5 第一阶段）；版本化见 [Backlog](../plan/backlog.md)，Playground 链接按需评估。

## 9. 已知取舍

- 文档站代码（`docs/.vitepress/**` 与 `docs/examples/**`）已纳入 ESLint 与 `vue-tsc` 覆盖，由 `pnpm typecheck:docs` 执行（`docs:gen` 为前置）；`config.ts` 的 Vite 类型从 VitePress 重导出的 `Plugin` 复用，避免仓库根 Vite 与 VitePress 内置 Vite 的版本类型冲突。
- 站内搜索采用 VitePress 内置 local search（minisearch）；默认分词对中文不友好，改用 `Intl.Segmenter('zh', { granularity: 'word' })` 自定义 `tokenize`（见 `config.ts` 的 `tokenizeLocalSearch`）。实测同一索引：默认分词对「输入框 / 分页 / 进度条 / 暗色模式」零命中，自定义分词后 Top 结果分别为 `Input 输入框` / `Paginator 分页` / `ProgressBar 进度条` / `主题与样式设计`；查询组合保持默认 OR，与 AND 的关键词 Top 结果一致，且保留「怎么用按钮」等自然语言问句的召回（AND 会零结果）。
- `themeConfig` 中的分词函数会被 VitePress 以 `_vp-fn_` 前缀序列化到客户端并用 `new Function` 重建，因此必须是自包含函数（不得引用模块级变量）；无 `Intl.Segmenter` 时回退为按空白 / 标点切分（CJK 不再细分），当前目标运行时（Node 20+ / 现代浏览器）均提供该 API。
- 生成物 `component-meta.json` 为 `.gitignore`，由 `docs:gen` 在 `docs:dev` / `docs:build` 前生成；直接运行 `vitepress dev docs` 需先执行 `pnpm docs:gen`。
- 文档站采用自定义域名部署，`base` 保持默认 `/`（如需子路径部署，用 `VITEPRESS_BASE` 环境变量覆盖）。
- VitePress `base.css` 在 `prefers-reduced-motion: reduce` 下有 `* { animation-duration: 1ms !important; ... }`，会把文档站内动画与过渡压平；组件库在 reduced-motion 下大多主动关动画（Drawer / Accordion / Image / Button / Popover / DropdownMenu / DatePicker 的 `animation: none`，属正确的无障碍行为；AutoComplete 例外——它只把 spinner 减速到 `1.6s`），故修复只落在文档层 `docs/.vitepress/theme/motion.css`。该层分两档：
    - **加载指示（全站）**：ProgressSpinner / indeterminate ProgressBar / Skeleton 的循环动画承载「进行中」语义，压平后无法表达状态，故不限定 demo 区域；
    - **演示区 opt-in（仅动画）**：demo 内的入场 / 退出动画与加载指示恢复组件真实时长（Accordion `0.2s`、Drawer `200ms`、Toast `0.18s`、Popover / DropdownMenu / DatePicker 面板 `0.12s`、Image 脉冲 `1.2s`；AutoComplete spinner 由组件减速的 `1.6s` 拉回默认 `0.8s`），使开启「减少动态效果」的访客也能看到组件实际动效；**不恢复 transition**，hover 与状态过渡继续尊重系统偏好。
    - **作用域**：容器内可达的元素用 `.vitepress-demo-plugin__container` 作用域（预览区类名为 `.vitepress-demo-plugin-preview`，嵌于 `__container` 内）；经 Portal 挂载到 `<body>` 的面板（Drawer / Toast / Popover / DropdownMenu / DatePicker）容器作用域**结构上不可达**（实测父链 `DIV < BODY`，Toast 的 Provider 更挂在 `#app` 内、demo 容器外），改按组件选择器恢复。**当前**文档站只在 demo 路径触发这些组件：12 页抽查（首页 / 指南 / 设计 / 规划 + 8 个组件页）实测 demo 容器外无任何恢复项（非 `1ms` 动画 0 处，恢复项 10 处均在容器内）；站点元素（`.VPSidebar` / `.VPNavBarTitle` / `.VPContent`）仍为 `1ms` / `0s` 由 V 阶段实测（[M3 记录 §9.1](./governance/2026-09-16-m3-demo-motion-validation.md)）给出；源码检索确认 `theme/` 层不存在非 demo 触发路径。将来若新增站点级触发（如站点级 Toast / Confirm），需重新评估该层作用域。
    - **两处实现约束**（改动该层前必读）：① 组件的 scoped keyframes 名称被编译期重写、无法跨文件引用，故层内以 `caomei-demo-*` 重声明等价 keyframes（组件动画变更需同步），且**入场与退出必须是不同的 keyframes 名**——Reka 的 Presence 以 `animation-name` 是否变化判定出场，复用同名 + `reverse` 会被判为无动画而立即卸载；② Accordion 的 `animation-name` **不得**用 `!important` 声明——Reka 的 Collapsible 先以内联 `animation-name: none` 抑制动画再测自然高度，`!important` 会压过该抑制并把内容高度变量写成 0（仅 duration / timing / iteration 可用 `!important` 压过 VitePress）。**`!important` 必须按属性判定，不可整块套用**。
    - 取舍与实测证据见 [M3 演示动效验证记录](./governance/2026-09-16-m3-demo-motion-validation.md)（reduced-motion 下 demo 内 Drawer 入场 `0.2s` + 逐帧位移、`demo 外`仍 `1ms`）。
- VitePress 默认把 `.vp-doc` 内的 `<table>` 设为 `display: block`（便于页内横向滚动），会脱离表格布局上下文、使组件表格的 `position: sticky` 冻结列失效；文档站需对组件表格还原 `display: table`（见 `docs/.vitepress/theme/caomei-demo.css`）。

## 10. 国际化（i18n）与翻译路径

- **物理路径**：文档翻译统一放在 `docs/i18n/<locale>/`，站点 URL 仍为 `/<locale>/...`，由 `config.ts` 的 `rewrites` 映射（`i18n/en-US/**` → `en-US/**`）。该约定对齐 momei 项目；**不保留 `docs/<locale>/` 目录**。
- **Locale**：当前提供 `root`（简体中文，`/`）与 `en-US`（English，`/en-US/`）；root 使用顶层 `themeConfig` 的 `nav` / `sidebar` 作为默认，`en-US` 在自己的 locale `themeConfig` 中覆盖；公共项（search / socialLinks / footer）放在顶层（VitePress 对 locale `themeConfig` 做浅合并）。
- **部分翻译的 fallback**：未翻译页只保留在中文区，英文导航 / 侧边栏只列已有英文页。语言切换采用「覆盖感知回切」：
    - `config.ts` 的 `routingPages` 由扫描 `docs/i18n/<locale>/` 生成，语言菜单据此判断目标页是否存在——已翻译页回切对应路由，未翻译页（含未登记的 locale）回退目标 locale 首页（如 `/en-US/`），避免落到不存在的 `/en-US/...` 而 404。
    - VitePress 1.6 的 `i18nRouting` 仅支持布尔值（函数形态自 2.0 起），因此通过 Vite alias 替换默认主题内部的 `composables/langs`，桌面 / 平板 / 移动端三处菜单共用 `theme/composables/langs.ts`；`config.ts` 在构建期校验该内部模块存在（漂移守卫）。
    - 产物级守卫见 `pnpm docs:check:i18n-routing`（已接入 `verify` 与 CI）；`i18nRouting: false` 作为别名未生效时的兜底（退回回首页而非 404）。覆盖度提升后可改回默认对应路由。
- **链接检查**：`scripts/docs/check-links.mjs` 对站点根链接额外解析 `docs/i18n/<path>`，以兼容该物理路径约定。
- **同步范围**：英文版最终与中文版保持同步的范围**仅限「指南」与「组件介绍」**（按批次推进）；设计、规范、规划等保持骨架 / 中文源（source-only），不承诺持续翻译。
- **列表顺序**：英文导航 / 侧边栏与组件概览中的已翻译页，按中文 sidebar 的组件顺序排列（非翻译时间顺序），保证翻译覆盖完成后两侧顺序一致。组件侧栏自身的分组与组内顺序规则见 §11。
- **Demo 翻译**：仅翻译含文案的 demo，英文版放在 `docs/i18n/en-US/examples/<component>/`，en 组件页以 `../examples/...` 引用；文案为语言中性的 demo 复用中文 `docs/examples/`（`../../../examples/...`），避免无意义复制。
- **API 描述双语**：组件 `types.ts` 的 JSDoc 以中文为主，用 `@en` 标签补充英文（如 `@en Visual variant`），`gen-component-meta.mjs` 额外输出 `descriptionEn`，`<ComponentApi>` 按 locale 选用（缺失时回退中文）。`@en` 会被 tsdown 保留进 `dist/*.d.ts`，作为可接受的注释副作用。

## 11. 组件分区与排序

- `/components/` 侧栏按 **6 个组件分组**组织，组间顺序固定为本节表格自上而下的顺序（不采用「按使用频率」等主观口径；新增分组须先在本节登记，登记位置即最终位置）；组内按**英文组件名字母序**排列。
- 组内顺序的唯一依据是英文字母序——实现顺序、历史登记顺序、翻译先后均不参与定序；不设「同族微调」例外，如确需例外须先在本节登记为固定规则。
- 中英两侧侧栏使用同一分组划分与同一组件顺序：中文条目标题形如 `Button 按钮`，英文为 `Button`；组件概览的列表列序遵循同一顺序，翻译侧同步约定见 §10。
- 分组划分（含英文分组名）以本表为准，实现落在 `docs/.vitepress/config.ts` 的中英两处 sidebar；新增组件时先定分组、再按字母序落在组内正确位置，本节与实现两处同步。
- 本节范围限于 6 个组件分组；同侧栏内新增的非组件分组位置按下列固定顺序登记，登记位置即最终位置：
  1. **总览**（zh `总览` / en `Overview`，`/components/`）位于 6 个组件分组**之前**，是组件区的入口页；
  2. **能力说明**（zh `能力说明` / en `Capabilities`，组合式 API / 图标 / 内建文案与语言）位于 6 个组件分组**之后**，不与组件页混排。
- 组件总览页（`/components/index.md`）的分组顺序与侧栏一致，并在末尾列出「能力说明」三页。

| 分组 | Sidebar group（en-US） | 组件（组内按英文名字母序） |
| --- | --- | --- |
| 基础与布局 | Basics & Layout | Avatar、Badge、Button、ButtonGroup、Card、Divider、Image、SplitButton、Tag |
| 表单输入 | Form Inputs | Checkbox、FileUpload、FloatLabel、Input、InputGroup、InputNumber、Password、RadioGroup、Slider、Switch、Textarea |
| 选择器 | Selectors | AutoComplete、Calendar、ColorPicker、DatePicker、MultiSelect、Select、SelectButton、ToggleButton |
| 反馈与浮层 | Feedback & Overlays | ConfirmDialog、Dialog、Drawer、Message、Popover、Toast |
| 数据展示 | Data Display | DataTable、DataView、Paginator、ProgressBar、ProgressSpinner、Skeleton |
| 导航与操作 | Navigation & Actions | Accordion、DropdownMenu、Stepper、Tabs、Toolbar |

> 分组映射与决策背景（用户决策：6 分组 + 组内字母序）见 [2026-09-16 新需求评估记录](./governance/2026-09-16-new-requirements-evaluation.md)（附录 A 为当时的决策快照）。

## 12. 演示动画的诊断与覆盖约定

- 诊断「某组件没有动画」类报告时，须在**两种上下文**各测一次 `getComputedStyle(el).animationDuration`：默认与 `emulateMedia({ reducedMotion: 'reduce' })`。文档站在 reduced-motion 下对 `*` 注入 `animation-duration: 1ms !important`，会把「演示静态化」误判为组件缺陷。
- 跨层覆盖动画时，退出动画必须使用**独立命名**的 keyframes：Reka 的 Presence 以 `prevAnimationName !== currentAnimationName` 判定是否保留元素，用同名 + `animation-direction: reverse` 会被判为无动画而立即卸载。
- 对 `animation-name` 使用 `!important` 会破坏 Reka Collapsible 的测量窗口（它先以内联 `animation-name: none` 抑制动画再测自然高度）：名字用高特异性即可，只让 duration / timing / iteration 用 `!important`。

## 13. 链接与锚点校验

- 站内跨节锚点必须按 VitePress 的 slugify 实算，不能凭标题字面拼：数字开头的标题会补 `_` 前缀（`## 11. 组件分区与排序` → `#_11-组件分区与排序`），全角标点被归一。
- `pnpm docs:check:links` 的 `looseNorm` 会剥离 `-` / `_` / 标点，**「链接检查通过」不能证明锚点有效**；跨节引用优先只链页面。
- `docs:check:links` 也不能替代 VitePress 的 dead-link 校验：前者按文件系统解析，指向 `docs/` 之外的仓库文件（如 `.github/skills/**`）会被判有效，而 VitePress 因目标不在 `srcDir` 内报 dead link 使 `docs:build` 失败。跨出 `docs/` 的引用一律写成 code span，**doc 类改动必须把 `pnpm docs:build` 纳入门禁**。

## 14. API 表与公共 props 继承

- 组件 `types.ts` 改为继承 `_shared/field` 的公共 props 后，`component-meta` 仍会展开继承字段并保留 JSDoc，仅展示顺序变为「组件特有 → 公共」。
- 描述比对必须按 `name + type + default + description + descriptionEn` **全字段**比对：只比字段名会漏掉措辞损失（组件特有信息应以接口级注释保留）。
