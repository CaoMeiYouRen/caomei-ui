# CellGroup 单元格分组

单元格分组把多个 [Cell](./cell) 收进一个带边框与分隔线的容器，并可为分组提供标题。

## 基础用法

把 `CaomeiCell` 放进默认插槽即可；相邻单元格之间自动画一条分隔线，首尾不再补边框。

<demo
    vue="../examples/cell-group/basic.vue"
    ssg="true"
/>

## 分组标题

`title` 渲染可见标题，或用 `#title` 插槽自定义内容。带标题时根节点以 `role="group"` + `aria-labelledby` 关联标题；无标题时不输出 `aria-labelledby`。

## 分隔线

分隔线由容器统一绘制（`.caomei-cell-group__list > .caomei-cell + .caomei-cell`），子单元格本身不声明边框；需要去掉或替换分隔线时覆盖 `--caomei-cell-group-divider`。

## 无障碍

- 有标题时按可分组的区域语义输出，读屏器会播报分组名。
- 分组本身不可聚焦、不拦截点击；交互全部落在子单元格的宿主元素上。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-cell-group-bg` | `--caomei-color-bg` | 分组背景 |
| `--caomei-cell-group-border` | `--caomei-color-border` | 外边框颜色 |
| `--caomei-cell-group-divider` | `--caomei-color-border` | 行间分隔线颜色 |
| `--caomei-cell-group-radius` | `--caomei-radius-md`（窄屏 `--caomei-radius-sm`） | 圆角 |

## API

`CaomeiCellGroup` 的公开属性与插槽：

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | — | 分组标题；根节点始终为 `role="group"`，带标题时另补 `aria-labelledby` |

| 插槽 | 说明 |
| --- | --- |
| `default` | 单元格列表，通常放 `CaomeiCell` |
| `title` | 自定义分组标题内容，覆盖 `title` 属性 |

`CaomeiCell` 的属性与插槽见 [Cell](./cell)。
