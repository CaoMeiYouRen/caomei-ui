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
5. API（由 `<ComponentApi>` 自动呈现 props / events / slots / exposed）；
6. FAQ（按需）。

## 5. Demo 约定

- 每个用例一个 `.vue` 文件，放在 `docs/examples/<component>/`。
- 正文通过 `<demo vue="../examples/<component>/<name>.vue" ssg="true" />` 引用。
- `ssg="true"` 仅用于 SSR 安全（不访问 `window`/`document`）的组件；交互 demo 同样适用，因为事件处理只在客户端触发。
- demo 从 `@/components/...` 引入库源码，保证与实现同源。
- 库样式由文档站主题统一引入；demo 只写自身布局样式。

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
- VitePress `base.css` 在 `prefers-reduced-motion: reduce` 下有 `* { animation-duration: 1ms !important; ... }`，会把加载指示器压成静止；修复落在文档层 `docs/.vitepress/theme/motion.css`（同属性 `!important`），组件库保持低特异性、零 `!important`。
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
- **列表顺序**：英文导航 / 侧边栏与组件概览中的已翻译页，按中文 sidebar 的组件顺序排列（非翻译时间顺序），保证翻译覆盖完成后两侧顺序一致。
- **Demo 翻译**：仅翻译含文案的 demo，英文版放在 `docs/i18n/en-US/examples/<component>/`，en 组件页以 `../examples/...` 引用；文案为语言中性的 demo 复用中文 `docs/examples/`（`../../../examples/...`），避免无意义复制。
- **API 描述双语**：组件 `types.ts` 的 JSDoc 以中文为主，用 `@en` 标签补充英文（如 `@en Visual variant`），`gen-component-meta.mjs` 额外输出 `descriptionEn`，`<ComponentApi>` 按 locale 选用（缺失时回退中文）。`@en` 会被 tsdown 保留进 `dist/*.d.ts`，作为可接受的注释副作用。
