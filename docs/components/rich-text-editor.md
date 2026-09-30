# RichTextEditor 富文本编辑器

基于第三方 `md-editor-v3` 的 Markdown 编辑器**轻量封装**：`v-model` 绑定 Markdown 源文本，暗色与语言跟随宿主状态自动联动，无需使用方逐项传参。内核为**可选 peer 依赖**，按需加载。

> **前置依赖：使用前须先安装 `md-editor-v3`**
>
> ```sh
> pnpm add md-editor-v3
> ```
>
> 内核是**可选 peer 依赖**（本库不强制安装，未使用本组件的下游不受影响）；**未安装就引入本组件**会在打包期报「无法解析 md-editor-v3」（Vite / Rolldown 实测）。扩展语言包 `@vavt/cm-extension` 随本库安装，无需手工安装；内核样式由组件按需加载，宿主无需手工 `import`。详见下文「[依赖与样式定制](#依赖与样式定制)」。

## 基础用法

`v-model` 绑定 Markdown 源（`string`）；`height` 设定编辑器高度，`placeholder` 提供空态提示，`label` 渲染为容器的可访问名（`role="group"` + `aria-label`）。

<demo
    vue="../examples/rich-text-editor/basic.vue"
    ssg="true"
/>

## 暗色与国际化联动

- **暗色**：包装层观察根元素上的 `.dark` / `.light` class、`data-scheme="auto"` 与手工设定的 `data-theme`——与 `useTheme()` 共用同一事实源——并把解析结果驱动编辑器的 `theme`。宿主切换暗色后编辑器自动跟随，无需重建组件。
- **国际化**：包装层经 `useLocaleCode()` 读取宿主语言标识，映射到编辑器语言键：`zh-CN` / `en-US` / `zh-TW` 同名直用、`ja-JP` → `jp-JP`（键名转换）、`ko-KR` 同名直用；`zh-TW` / `ja-JP` / `ko-KR` 的文案由 `@vavt/cm-extension` 按需加载。运行期切换 `<CaomeiConfigProvider>` 的 `locale` 会即时更新编辑器语言。
- 未登记语种回落 `zh-CN` 并在控制台告警；`theme` prop 仅作逃生舱，用于绕过自动派生。

## 只读与预览

- `readonly` 只读（可预览 / 滚动 / 复制，不可编辑）；`disabled` 禁用整个编辑器。
- `preview`（默认 `true`）控制右侧预览面板；`toolbars` 可自定义工具栏项（缺省用内核默认工具栏）。

## 图片上传

`uploader` 接收用户选择的图片文件（`File[]`）并返回可供 Markdown 引用的 URL 列表；未提供时使用内核内建行为（把图片内联为 data URL）。`noUploadImg` 可完全禁用上传入口。上传失败时不抛出，回调空列表并给出控制台告警。

<demo
    vue="../examples/rich-text-editor/upload.vue"
    ssg="true"
/>

## 范围说明

- **不自研**：编辑器内核、工具栏与 Markdown 引擎均来自 `md-editor-v3`，本组件不做二次实现。
- 维持 **Markdown** 口径，不提供 HTML 富文本模式。
- 不覆盖编辑器内部颜色 token（「兼容主题」后置，触发条件为下游提出编辑器视觉与宿主不一致）。
- 不提供独立的只读渲染组件；文章展示场景可先用 `readonly`。

## 依赖与样式定制

- `md-editor-v3`（内核）为**可选 peer 依赖**：使用本组件前需自行安装（`pnpm add md-editor-v3`）。`@vavt/cm-extension`（扩展语言包）随本库安装，用于 `zh-TW` / `ja-JP` / `ko-KR`，无需手工安装。
- `md-editor-v3` 未安装时：**引入本组件**会在打包期报「无法解析 md-editor-v3」（Vite / Rolldown 实测，2026-09-30）；**未使用本组件**的下游不受影响（包根不静态引用内核，模块被 tree-shaking 丢弃）。组件内的占位降级覆盖内核**运行期加载失败**（如 SSR 将 peer 外部化、资源加载失败），此时渲染 `role="alert"` 占位并给出控制台告警。
- 内核样式与文案由组件**按需加载**（`md-editor-v3/lib/style.css` 等），宿主无需手工 `import`。
- 覆盖钩子：`--caomei-rich-text-editor-radius`（圆角）、`--caomei-rich-text-editor-min-height`（占位最小高度）。

## 从 mavon-editor 迁移

下游 momei 现用 `mavon-editor`，迁移期需要五类手工补偿（语言逐分支映射、`ko-KR` 回落、逐项注入暗色背景、patch 组件内部方法、SSR 隔离 + 手工引样式），本组件把这些收敛为内建联动：

| mavon-editor 集成写法 | 本组件 |
| --- | --- |
| `v-model`（Markdown 源） | 同名（`string`） |
| `language` 手工逐分支映射（`ja-JP → ja`、`ko-KR` 无原生支持回落 `en`） | 由宿主 `locale` 自动派生，本库 5 语种全覆盖（`ja-JP → jp-JP`） |
| `toolbarsBackground` / `editorBackground` / `previewBackground` 逐项注入暗色背景 | 由宿主暗色状态自动派生 `theme`，删除手工背景注入 |
| `patchMavonEditorComponent` 覆写内部方法 | 无需（内核为 Vue 3 原生实现） |
| `defineAsyncComponent` + `.client.vue` + 手工 `import 'mavon-editor/dist/css/index.css'` | 组件内按需加载内核与样式，SSR 下渲染占位、客户端挂载后再加载 |

> **已知差异（有意）**：本组件以 `md-editor-v3` 为内核，与 `mavon-editor` 的工具栏项、快捷键与渲染细节不完全一致；迁移时以本组件页的 props 表为准。PrimeVue 未提供 Markdown 编辑器组件，故无 PrimeVue 映射项。

<ComponentApi name="rich-text-editor" />
