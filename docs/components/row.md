# Row 栅格行

栅格行基于 CSS Grid 提供 24 栏布局基础，配合 [Col 栅格列](./col)完成响应式排版。行只负责网格容器、列间距与交叉轴对齐，不引入交互语义。

## 基础用法

每行固定 24 栏，列以 `span` 声明跨越的栏数（未传时默认 24，即占满整行）。

<demo
    vue="../examples/row/basic.vue"
    ssg="true"
/>

## 列间距

`gutter` 设置列间距（单位 px）：传数字只设置横向间距；传 `[横向, 纵向]` 时同时设置换行后的行间距。

间距基于 CSS Grid 的 `gap`：只出现在相邻项之间，行的左右外侧不留间距，多行时也不需要负外边距补偿。

**约束**：`gap` 不参与收缩，横向间距总宽 `23 × gutter` 必须小于容器宽，否则栅格会撑出横向溢出——窄屏请按断点减小 `gutter`（例如移动端改用更小值或让列 `:sm="24"` 单列铺满）。

<demo
    vue="../examples/row/gutter.vue"
    ssg="true"
/>

## 交叉轴对齐

`align` 映射 CSS `align-items`，用于同一行内各项的交叉轴（默认纵向）对齐，取值 `start` / `center` / `end` / `stretch`（默认）/ `baseline`。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-row-gutter-x` | `0` | 横向列间距 |
| `--caomei-row-gutter-y` | `0` | 纵向行间距 |
| `--caomei-row-align` | `stretch` | 交叉轴对齐 |

## 与其它布局库对照

PrimeVue 不含栅格组件（栅格由 PrimeFlex 的 CSS 类提供），本库以组件形式提供：

| Element Plus / Vuetify | 本组件 |
| --- | --- |
| `el-row` / `v-row` | `CaomeiRow` |
| `el-col` / `v-col` | `CaomeiCol` |
| `gutter`（仅横向） | `gutter`（数字 = 横向；`[横向, 纵向]` = 两向） |
| `justify`（flex 主轴对齐） | **不提供**：24 栏等宽轨道恒铺满容器，`justify-content` 无实际效果，故不暴露 |

<ComponentApi name="row" />
