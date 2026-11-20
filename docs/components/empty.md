# Empty 空态

空态用于页面或区块没有内容时给出说明与下一步操作。它只负责展示，不感知数据源。

## 基础用法

标题缺省取当前语言的「暂无数据」；说明与 `#action` 按需提供。

<demo
    vue="../examples/empty/basic.vue"
    ssg="true"
/>

## 图标与图片

- `icon` 传 `@lucide/vue` 组件；`image` 传图片地址，二者同时提供时以 `image` 优先。
- `#icon` / `#image` 插槽可完全自定义媒体内容。
- 未提供任何媒体时渲染一枚装饰性默认图标。

<demo
    vue="../examples/empty/image.vue"
    ssg="true"
/>

## 尺寸档

`size` 取 `sm` / `md`（默认）/ `lg`，控制留白、媒体尺寸与标题字号；内容在 320px 视口下按 `overflow-wrap` 折行，不裁切。

`as` 取 `div`（默认）/ `section` / `article`：页面级空态可用 `section`，文章 / 卡片内可用 `article`，纯布局包装保持 `div`。

## 与 DataView 的分工

- `CaomeiDataView` 负责**容器内**的列表 / 网格空态（数据源为空时替换内容区），保留其 `#empty` 插槽与分页 / 布局结构。
- `CaomeiEmpty` 负责**页面或区块级**空态：可以是整页、卡片或任意容器中的独立说明块。
- 复用时把 `CaomeiEmpty` 放进 `DataView` 的 `#empty` 插槽即可，不必再复制一套文案键（两者共用 `dataView.empty` 兜底文案）。

## 无障碍

- 默认图标为装饰性内容，标记 `aria-hidden`；使用 `image` 时按需提供 `imageAlt`。
- 标题为普通文本，不引入标题层级；需要标题语义时用 `#title` 传入真实标题元素。
- 操作区只承载使用方提供的按钮，组件不自带焦点逻辑。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-empty-padding` | 由尺寸档决定 | 外层留白 |
| `--caomei-empty-media-size` | 40 / 56 / 72px | 图标字号与图片高度基准 |
| `--caomei-empty-title-size` | 由尺寸档决定 | 标题字号 |

<ComponentApi name="empty" />
