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
| `size` | `number \| string` | `'1em'` | 尺寸；数字按 px，`sm` / `md` / `lg` 走图标尺寸 token，其余字符串原样使用 |
| `strokeWidth` | `number \| string` | — | 线宽；仅对 stroke 型图标生效 |
| `label` | `string` | — | 有语义时的可访问名；提供后输出 `role="img"` + `aria-label` |

> 在自身模板中直接引用图标组件时，需在项目中安装 `@lucide/vue`（`pnpm add @lucide/vue`）。它虽是 caomei-ui 的运行时依赖，但在 pnpm 严格依赖布局下不保证可被下游直接解析。
>
> 页面示例用 `@/icons` 引用本仓库源码（文档站的内部别名）；下游项目中 `CaomeiIcon` 从包根导出，写作 `import { CaomeiIcon } from 'caomei-ui'`。

## 尺寸

`CaomeiIcon` 默认继承字号（`1em`），与相邻文本基线对齐；需要固定尺寸时传入 `size`（数字按 px，如 `16` / `20`），或用 `sm` / `md` / `lg` 选择 token 档位。容器内图标继续由容器 `font-size` 驱动，不要同时设档位。

<demo
    vue="../examples/icons/sizing.vue"
    ssg="true"
/>

## 样式定制

| token | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-icon-size-sm` | `16px` | `size="sm"` 的独立图标字号 |
| `--caomei-icon-size-md` | `20px` | `size="md"` 的独立图标字号 |
| `--caomei-icon-size-lg` | `24px` | `size="lg"` 的独立图标字号 |
| `--caomei-icon-stroke-width` | `2` | 未显式传 `strokeWidth` 时 Lucide 图标的线宽 |

> 线宽改用 `--caomei-icon-stroke-width` 控制（仅作用于 Lucide 图标；自备 SVG 保留自身 `stroke-width`，需要统一时显式传 `strokeWidth` 或调整 SVG 属性），不要再依赖 `svg { stroke-width }` 等全局选择器覆盖。`sm` / `md` / `lg` 为保留值，不要传给自定义图标组件作为其尺寸枚举；档位依赖 `width/height: 1em`，固定像素的自绘 SVG 不会随档位缩放。

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

## 替换内置图标

组件内建图标来自 `internal-icons` 的语义映射表（如 `dismiss` / `chevronDown` / `check`）。通过 `provideIconOverrides()` 可按语义名做应用级替换，未覆盖的键保持 Lucide 默认；组件暴露的 `#icon` 插槽只覆盖其对应位置的图标，关闭等无插槽位置仍走覆盖映射。

```ts
import { provideIconOverrides } from 'caomei-ui'
import { X } from '@lucide/vue'

provideIconOverrides({
    dismiss: X, // 只替换关闭图标，其余保持默认
})
```

- 覆盖项按语义名生效：`error`（Message）与 `danger`（Toast）分别覆盖，不会合并。
- 覆盖同样支持 `ref` / getter，按请求隔离；建议在应用根组件 / 布局中调用。

## 构建期接入与迁移

`CaomeiIcon` 的 `icon` 接收任意 Vue 组件，因此不要求下游使用 Lucide；以下三条路径按需选择。

1. **unplugin-icons / Iconify（推荐按需）**：安装 `unplugin-icons` 与所需图标集（如 `@iconify-json/lucide`），在构建配置中启用后直接导入生成的组件：

    ```ts
    import IconCheck from '~icons/lucide/check'

    // <CaomeiIcon :icon="IconCheck" />
    ```

2. **自备 SVG**：将 SVG 作为 Vue 组件（或经 `vite-svg-loader` 等工具）导入，直接传给 `icon`；需要统一配色时使用 `currentColor`。品牌 logo 等固定图形建议保留原始配色并显式提供 `label`。

3. **替换组件内建图标**：用 `provideIconOverrides()` 按语义名替换；`#icon` 插槽仍可覆盖对应位置的图标（见上节）。

PrimeVue `pi pi-*` 迁移时按下表映射到语义名；无直接对应的图标保留 Lucide / 自备 SVG：

| 语义名 | PrimeIcons |
| --- | --- |
| `dismiss` | `pi-times` |
| `check` | `pi-check` |
| `chevronDown` / `chevronUp` / `chevronLeft` / `chevronRight` | `pi-chevron-*` |
| `chevronsLeft` / `chevronsRight` | `pi-angle-double-left` / `pi-angle-double-right` |
| `calendar` | `pi-calendar` |
| `info` | `pi-info-circle` |
| `warning` | `pi-exclamation-triangle` |
| `success` | `pi-check-circle` |
| `error` | `pi-exclamation-circle` |
| `danger` | `pi-times-circle` |
| `eye` / `eyeOff` | `pi-eye` / `pi-eye-slash` |
| `upload` | `pi-upload` |
| `loading` | `pi-spin pi-spinner` |
| `minus` / `plus` | `pi-minus` / `pi-plus` |
| `radio` | `pi-circle-on` |
| `imageOff` | 无直接对应，保留 Lucide 或自备 SVG |

> 库内不引入 `@iconify/vue` 等运行时依赖；`provideIconOverrides()` 只改变组件默认图标，不改变 `#icon` 插槽 / 外部 `icon` 组件的优先级。

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
