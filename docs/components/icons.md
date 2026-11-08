# 图标

caomei-ui 的图标能力由 `@lucide/vue` 与 `CaomeiIcon` 组成：`@lucide/vue` 提供图标组件，`CaomeiIcon` 负责统一的尺寸与对齐。

## 基础用法

`icon` 接收一个图标组件，`size` 默认 `1em`。

<demo
    vue="../examples/icons/basic.vue"
    ssg="true"
/>

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `icon` | `Component` | — | 图标组件；与 `name` 同时提供时优先使用 |
| `name` | `string` | — | 注册表中的图标名称；`icon` 缺省时使用 |
| `size` | `number \| string` | `'1em'` | 尺寸；数字按 px，字符串原样使用 |
| `strokeWidth` | `number \| string` | — | 线宽；仅对 stroke 型图标生效 |
| `label` | `string` | — | 有语义时的可访问名；提供后输出 `role="img"` + `aria-label` |

> 在自身模板中直接引用图标组件时，需在项目中安装 `@lucide/vue`（`pnpm add @lucide/vue`）。它虽是 caomei-ui 的运行时依赖，但在 pnpm 严格依赖布局下不保证可被下游直接解析。
>
> 页面示例用 `@/icons` 引用本仓库源码（文档站的内部别名）；下游项目中 `CaomeiIcon` 从包根导出，写作 `import { CaomeiIcon } from 'caomei-ui'`。

## 尺寸

`CaomeiIcon` 默认继承字号（`1em`），与相邻文本基线对齐；需要固定尺寸时传入 `size`（数字按 px，如 `16` / `20`）。

<demo
    vue="../examples/icons/sizing.vue"
    ssg="true"
/>

## 图标注册表与可访问名

`CaomeiIcon` 支持三种形态：直接传 `icon` 组件、通过 `name` 从注册表解析，或两者都缺省时渲染空占位（开发期告警）。注册表经 `provideIconRegistry()` 按请求注入，不使用模块级单例，SSR 安全。

<demo
    vue="../examples/icons/registry.vue"
    ssg="true"
/>

```ts
import { provideIconRegistry } from 'caomei-ui'
import { Star } from '@lucide/vue'

provideIconRegistry({ star: Star })
```

- 解析优先级：`icon` 组件 > 注册表 `name`；两者都缺省时渲染空占位并告警。
- 注册表支持普通对象、`ref` 或 getter；建议在应用根组件 / 布局中调用。
- 可访问名优先级：显式 `label` > 透传 `aria-*` / `role` / `title` > 默认 `aria-hidden="true"`。提供 `label` 时输出 `role="img"` + `aria-label`；只有装饰性图标才默认隐藏。
- `icon` 保持可选（`icon?: Component`）而非联合类型，以兼容既有 `:icon` 用法与 props 提取工具；运行时至少提供 `icon` / `name` 之一。
- 高级用法：`useIconRegistry()` 读取当前注册表；`caomeiIconRegistryKey` 可用于手写 `provide`（通常不需要）。

## 图标一览

组件内建图标取自 `@lucide/vue`；下方图标一览列出文档演示中常用的图标，名称即 `@lucide/vue` 的导出名（完整列表见 [lucide 图标站](https://lucide.dev/icons/)）。

<demo
    vue="../examples/icons/gallery.vue"
    ssg="true"
/>

## 在组件中传入图标

Button、Tag、Message 等组件通过 `#icon` 插槽接收图标组件，而不是字符串图标名。以 [Button 按钮](/components/button) 为例：

<demo
    vue="../examples/icons/in-components.vue"
    ssg="true"
/>

各组件支持的插槽与插槽位置以对应组件页为准。
