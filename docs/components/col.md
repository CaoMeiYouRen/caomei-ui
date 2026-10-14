# Col 栅格列

栅格列是 [Row 栅格行](./row)的子项，以 24 栏栅格定位自身：`span` 声明跨越栏数，`offset` 声明左侧偏移栏数，`order` 控制视觉次序。断点 `sm` / `md` / `lg` 可在窄视口覆盖这些取值。

列不引入交互语义，仅承载内容；其定位完全由父级 `CaomeiRow` 的 24 栏网格决定。

## 基础用法

`span` 声明跨越的栏数，有效范围 1–24（传 0 或负数会产出非法 `grid-column`，如 `span 0` / `span -1`，该声明失效并回落 `auto`，故请保持在 1–24 内）。

<demo
    vue="../examples/row/basic.vue"
    ssg="true"
/>

## 偏移与排序

`offset` 在列的左侧留出指定栏数的空位；`order` 映射 CSS `order`，用于调整同一行内各列的视觉次序（不改变 DOM 顺序与焦点顺序）。

<demo
    vue="../examples/col/offset-order.vue"
    ssg="true"
/>

## 响应式断点

`sm` / `md` / `lg` 分别对应视口宽度上限 640px / 768px / 1024px，取值可以是数字（等价于只设置 `span`）或 `{ span, offset, order }` 对象。语义与响应式设计约定一致（断点为视口宽度上限，桌面优先），且窄档覆盖宽档（`lg` → `md` → `sm`，最窄者最后生效）。

对象只需声明要覆盖的字段；**未声明的字段不做逐档级联**，而是回退到**基础档（最宽视口）取值**。例如 `:span="24" :lg="{ span: 12 }" :md="{ offset: 4 }"` 在 ≤768px 档下 `span` 回到基础值 24（而非沿用 `lg` 的 12），`offset` 取 4。

<demo
    vue="../examples/col/responsive.vue"
    ssg="true"
/>

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-col-span` | `24` | 默认占列数 |
| `--caomei-col-offset` | `0` | 默认左侧偏移栏数 |
| `--caomei-col-order` | `0` | 默认视觉次序 |
| `--caomei-col-sm-span` / `-offset` / `-order` | — | 视口 ≤ 640px 时覆盖 |
| `--caomei-col-md-span` / `-offset` / `-order` | — | 视口 ≤ 768px 时覆盖 |
| `--caomei-col-lg-span` / `-offset` / `-order` | — | 视口 ≤ 1024px 时覆盖 |

<ComponentApi name="col" />
