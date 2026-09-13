# Skeleton 骨架屏

骨架屏用于在内容加载完成前占位，降低布局跳动并提示加载状态。为纯样式自建组件，不依赖外部 primitive。

## 基础用法

默认 `variant="text"` 渲染单行文本占位；`lines` 控制行数，多行时末行自动收窄，模拟真实段落。

<demo
    vue="../examples/skeleton/basic.vue"
    ssg="true"
/>

## 形状

`variant` 支持 `text`（文本行）、`circular`（圆形，常用于头像）、`rectangular`（矩形，常用于图片 / 卡片）；`width` / `height` 支持数字（按 px）与字符串。

<demo
    vue="../examples/skeleton/shapes.vue"
    ssg="true"
/>

## 动画

`animation` 支持 `pulse`（呼吸）、`wave`（扫光）与 `none`（无动画）。

<demo
    vue="../examples/skeleton/animation.vue"
    ssg="true"
/>

## 无障碍

- 骨架屏为装饰性占位，根元素固定输出 `aria-hidden="true"`，不进入可访问性树。
- 加载状态应由外层容器通过 `aria-busy` 或 `role="status"` 等语义表达，骨架屏自身不承担。
- 动画遵循 `prefers-reduced-motion`（降低速度而非完全移除）。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-skeleton-width` | `text` / `rectangular` 为 `100%`，`circular` 为 `40px` | 整体宽度 |
| `--caomei-skeleton-height` | `text` 为 `1em`，`circular` 为 `40px`，`rectangular` 为 `80px` | 形状高度 |
| `--caomei-skeleton-gap` | `--caomei-space-2` | 多行间距 |
| `--caomei-skeleton-radius` | `--caomei-radius-sm` | 圆角 |
| `--caomei-skeleton-bg` | `--caomei-color-bg-elevated` | 占位背景色 |
| `--caomei-skeleton-highlight` | `rgb(255 255 255 / 60%)` | `wave` 扫光高光色 |
| `--caomei-skeleton-last-line-width` | `60%` | 多行末行宽度 |

```css
.caomei-skeleton {
    --caomei-skeleton-bg: #e5e7eb;
    --caomei-skeleton-radius: 999px;
}
```

<ComponentApi name="skeleton" />
