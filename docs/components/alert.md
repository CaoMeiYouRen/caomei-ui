# Alert 提示框

提示框用于在页面内展示**内联常驻**提示（环境说明、配置警告、表单整体错误汇总等）。它是 [Message 提示条](./message) 的**语义预设包装**：外观、色板 token 与 `--caomei-message-*` 覆盖钩子**全部复用**，差异只在**语义与 API 的收敛**（静态档、变体去掉 `simple`）。

## 基础用法

常驻提示默认不带关闭按钮；内容经 `title` + `description`（或默认插槽）提供。

<demo
    vue="../examples/alert/basic.vue"
    ssg="true"
/>

## 变体与色调

`tone` 取 `neutral` / `primary` / `success` / `warning` / `danger`；`variant` 取 `soft`（默认）/ `solid` / `outline`——**不含 `simple`**：行内无框形态属「就地字段校验」场景，请直接用 `CaomeiMessage`。`closable` 显示关闭按钮并抛出 `close`，`#actions` 承载操作。

<demo
    vue="../examples/alert/variants.vue"
    ssg="true"
/>

## 静态档：role 与 live region 取舍

**Alert 默认不渲染 `role`、不进 live region**（内部取 `CaomeiMessage` 的 `role="none"` 档）。取舍理由：

- 常驻内容在**页面加载时**即已存在于文档序中，读屏器按正常阅读顺序即可读到，本就无需 live region；而 live region 会在**建立时与内容变更时**播报——常驻提示既无「新插入」语义，其文本变更（如状态刷新）也更适合由页面自身按上下文播报。
- 因此 `role` 只应授予「由交互或异步结果**新插入**的内容」——那正是 `CaomeiMessage`（默认 `role="status"`，可切 `alert`）与 `CaomeiToast` 的场景。

| 场景 | 选用 | 是否播报 |
| --- | --- | --- |
| 页面加载即存在、需长期展示（环境说明 / 配置警告） | `CaomeiAlert` | 否（静态档，随文档序朗读） |
| 提交等交互之后给出的结果反馈 | `CaomeiMessage` | 是（`role="status"`，可切 `alert`） |
| 与页面位置无关的全局异步结果 | `CaomeiToast` | 是（视口内 live region） |

> Element Plus 的 `el-alert` **恒**输出 `role="alert"`；本库把「是否播报」显式交还给使用方（默认不播报），差异见下方迁移表。

## 与 Message / Toast 的分工

| | Alert（本组件） | Message | Toast |
| --- | --- | --- | --- |
| 语义 | 内联**常驻**提示 | 就地**反馈**消息 | 全局**轻提示** |
| live region | **否**（静态档） | 是（`status` 默认 / `alert`） | 是 |
| 位置 | 就地（文档流） | 就地（文档流） | 视口固定角（浮层） |
| 生命周期 | 常驻，由页面控制 | 由页面控制 | 自动关闭（悬停可暂停） |
| 视觉变体 | `soft` / `solid` / `outline` | 上述三档 + `simple` | — |
| 服务式调用 | 无（声明式） | 无（声明式） | `useToast()` |

## 样式定制

本组件的 API 面即上文所列七项 prop 与三个插槽；`CaomeiMessage` 的 `size`（`sm` / `md` / `lg`）**不在其中且会被显式过滤**（避免「类型上不可表达、运行时却生效」的隐形能力），需要字号档时请改用 `CaomeiMessage` 或覆盖 `--caomei-message-font-size`。

本组件**不承载自有外观**：样式与覆盖钩子全部来自 `CaomeiMessage`（`--caomei-message-padding-block` / `--caomei-message-padding-inline` / `--caomei-message-radius` / `--caomei-message-font-size` 等），根节点另带 `caomei-alert` 类名便于下游定位。色板取自全局语义 token（`--caomei-color-<tone>` 与 `solid` 变体的 `--caomei-color-<tone>-solid`）。

正文对比度（14px 常规，WCAG AA 需 ≥ 4.5:1）由装置 `test/e2e/alert-contrast.e2e.ts` 在真实 Chromium 中按**实际合成背景**逐条复核：5 色调 × 3 变体 × 亮色 / 暗色两档。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| 无独立 `Alert`（其 `Message` 即该形态） | 本库拆为 `CaomeiMessage`（反馈播报）与 `CaomeiAlert`（内联常驻预设，共用同一外观层） |
| `severity` | `tone`（`error` → `danger`、`info` → `primary`、`warn` / `warning` → `warning`、`secondary` / `contrast` → `neutral`） |
| `variant="outlined"` / `"simple"` | `variant="outline"` / **不提供 `simple`**（改用 `CaomeiMessage`） |
| `closable` | `closable`（另有 `closeLabel` 指定可访问名） |
| `#icon` | `#icon`（传 `@lucide/vue` 组件，非字符串图标类名） |
| `#default`（内容） | 默认插槽（或 `description`） |

**已知差异（有意）**：① 本库把 Message / Alert 拆成两个导出——`CaomeiAlert` 只收敛语义与 API，外观与 token 全部复用 `CaomeiMessage`，不存在第二套皮肤；② Alert 默认**不进 live region**（PrimeVue 的消息形态恒为 live region），需要播报请用 `CaomeiMessage`；③ Alert 不提供 `simple` 行内形态。

### 与 Element Plus `el-alert` / Vuetify `v-alert` 的差异

| Element Plus / Vuetify | 本组件 |
| --- | --- |
| `<el-alert title description type="info \| success \| warning \| error">` | `title` / `description` / `tone`（`info` → `primary`、`error` → `danger`） |
| `effect="light"` / `"dark"` | `variant="soft"`（默认，浅底）/ `variant="solid"`（实心底） |
| `show-icon` | `icon`（默认 `true`） |
| `closable` / `close-text` | `closable` / `closeLabel`（可访问名） |
| `#title` 插槽 | **未提供**：标题走 `title` prop |
| `#default` 插槽 | 默认插槽 |
| `center`（居中排布） | **未提供**：由使用方 CSS 覆盖 |
| 恒输出 `role="alert"` | 默认**不渲染 `role`**（静态档）；需要播报时改用 `CaomeiMessage` |
| `v-alert type="error"` 等 | 同上映射到 `tone` |

<ComponentApi name="alert" />
