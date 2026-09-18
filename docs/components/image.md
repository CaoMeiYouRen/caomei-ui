# Image 图片

图片组件基于原生 `img` 自建，提供比例占位、懒加载与加载 / 失败占位，避免加载过程引发布局跳动。

## 基础用法

通过 `src` / `alt` 传入图片信息；`ratio` 提供宽高比（如 `16 / 9`），容器按比例占位；`fit` 控制填充方式（默认 `cover`）。

<demo
    vue="../examples/image/basic.vue"
    ssg="true"
/>

## 懒加载

`lazy` 开启后，图片进入视口才开始请求 `src`。建议同时提供 `ratio`，让容器在加载前保持占位。

<demo
    vue="../examples/image/lazy.vue"
    ssg="true"
/>

## 加载与失败占位

加载中显示脉冲占位，加载失败显示失败图标；可通过 `#loading` / `#error` 插槽自定义。图片加载失败时 `alt` 仍保留在可访问树中。

<demo
    vue="../examples/image/states.vue"
    ssg="true"
/>

## 无障碍

- `alt` 映射原生 `alt`；装饰性图片传空字符串。
- 加载中占位层 `aria-hidden="true"`；失败占位层不带 `aria-hidden`，以承载自定义失败文案（默认失败图标由 Lucide 自动 `aria-hidden`）。
- 组件抛出 `load` / `error` 事件，参数为原生事件对象；服务端直出且水合前已判定失败的图片会在挂载时直接进入失败态，不会补发 `error`。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-image-bg` | `--caomei-color-bg-elevated` | 容器背景色 |
| `--caomei-image-loading-bg` | `--caomei-color-bg-elevated` | 加载中占位背景色 |
| `--caomei-image-placeholder-color` | `--caomei-color-text-muted` | 占位 / 失败图标颜色 |
| `--caomei-image-placeholder-size` | `24px` | 占位图标尺寸 |

> 组件不处理 `srcset` 与跨域；需要响应式图片或跨域策略时请在业务层自行处理。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `src` | `src` |
| `preview`（点击放大 + 遮罩） | **未实现（已登记为后续补强项，交付后同步本节）** |
| `indicatorIcon` / `previewIcon` | 未实现（同上） |
| `imageStyle` / `imageClass` | 未实现：样式经组件根类与 CSS 变量覆盖（原生图片属性不透传到内层 `<img>`） |
| `zoomInDisabled` / `zoomOutDisabled` | 不适用（无预览） |
| 无 | `alt`、`ratio`（按比例占位防抖动）、`fit`、`lazy`（进入视口再请求）与 `#loading` / `#error` 插槽为本库新增 |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="image" />
