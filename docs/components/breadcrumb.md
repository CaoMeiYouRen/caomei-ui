# Breadcrumb 面包屑

面包屑展示当前页面在层级结构中的位置，由 `CaomeiBreadcrumb` 与 `CaomeiBreadcrumbItem` 组合使用；容器为 `nav` + 有序列表，末级用 `current` 标记为当前页。

## 基础用法

`CaomeiBreadcrumbItem` 传 `href` 时渲染链接；末级当前页不传 `href`（渲染纯文本）并加 `current`。

<demo
    vue="../examples/breadcrumb/basic.vue"
    ssg="true"
/>

## 分隔符

`separator` 控制项之间的分隔文本（默认 `/`）。分隔符渲染在装饰元素上（`aria-hidden="true"`），不进入可访问名。

<demo
    vue="../examples/breadcrumb/separator.vue"
    ssg="true"
/>

## 无障碍

- 容器为 `nav`（`label` 映射 `aria-label`）+ `ol`。
- 当前页经 `current` 输出 `aria-current="page"`（链接与纯文本均支持）。
- 分隔符为装饰元素（`aria-hidden`），读屏器按项顺序朗读层级。
- 组件**不内建文案**：未传 `label` 时不渲染 `aria-label`。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-breadcrumb-font-size` | `--caomei-font-size-md` | 字号 |
| `--caomei-breadcrumb-gap` | `--caomei-space-2` | 项与分隔符的间距 |
| `--caomei-breadcrumb-separator-color` | `--caomei-color-border` | 分隔符颜色 |
| `--caomei-breadcrumb-link-hover-color` | `--caomei-color-primary` | 链接悬停色 |
| `--caomei-breadcrumb-current-color` | `--caomei-color-text` | 当前页文字色 |

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `<Breadcrumb :model="[{ label, url }]">` | `<CaomeiBreadcrumb>` + 逐项 `<CaomeiBreadcrumbItem href>`（声明式，不传 `:model` 数组） |
| `BreadcrumbItem.url` | `href`（原生属性） |
| `BreadcrumbItem` 末级（无 `url`） | 末级不传 `href` 并加 `current` |
| `#item` / `#separator` 插槽 | 项内容走默认插槽；分隔符经 `separator` prop 定制（**未提供分隔符插槽**） |
| `home`（Home 图标项） | 首个 `CaomeiBreadcrumbItem` 内自行放图标（`@lucide/vue`） |

<ComponentApi name="breadcrumb" />
