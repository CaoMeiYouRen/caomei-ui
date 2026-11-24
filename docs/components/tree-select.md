# TreeSelect 树形选择

以「字段 + 浮层树」形态在层级数据中选择值。由 `CaomeiPopover` 与 `CaomeiTree` 组合：字段是原生 `<button>`，面板经 portal 挂到 `body`，打开态的兄弟隔离与碰撞避让沿用 Popover。

## 基础用法

`items` 与 `CaomeiTree` 同形（键 `id` / 文案 `label` / 子节点 `children`，三者均可经 `itemKey` / `labelKey` / `childrenKey` 改名）。`v-model` 是**键数组**：单选时最多一项，多选时按选择顺序累积。

<demo
    vue="../examples/tree-select/basic.vue"
    ssg="true"
/>

- **打开与键盘**：字段聚焦后按 `Enter` / `Space`（或点击）打开面板，焦点自动落到首个树节点；面板内的方向键、`Home` / `End` 与[树形控件](./tree.md)一致；`Esc` 关闭并把焦点交还字段。
- **单一 Tab 停靠点**：字段是一个按钮；面板内是 roving tabindex 的树，不会在 Tab 序列里插入大量节点。
- **禁用与清空**：`disabled` 同时禁用字段与面板；`clearable` 在有值时显示清空按钮（禁用态不显示），可访问名取语言包 `select.clear`，可用 `clearLabel` 覆盖。
- **空值**：无选中时显示 `placeholder`；`items` 为空时面板显示 `emptyText`。

## 多选与窄屏

`multiple` 开启多选：面板不因选中而关闭，已选标签按顺序以逗号拼接、单行截断；点击已选节点即取消。`panelMaxHeight` 控制面板最大高度（默认 `16rem`），内容超出时面板内滚动。

<demo
    vue="../examples/tree-select/multiple.vue"
    ssg="true"
/>

- **窄屏**：字段宽度跟随容器（`width: 100%`），面板在碰撞避让下平移进视口、宽度上限收敛到可用宽度，`min-width` 默认 `12rem` 作为下限；320 / 390 档的字段与面板边界有常驻 E2E 断言。
- **窄屏建议**：字段高度取 `--caomei-control-height-md`；需要更紧凑时可覆盖 `--caomei-control-height-md`，或在外层容器限制宽度并让回显按省略号收尾。

## 浮层与层级

- 面板经 portal 挂到 `body`，层级取 Popover 的 `--caomei-popover-z-index`（`1050`）：与表单类浮层同档，高于模态遮罩 / 内容（`1000` / `1001`），低于 Tooltip（`1060`）与 Toast（`1100`）；需要更高层级时覆盖该变量。
- 打开态会给面板外的兄弟节点补 `inert`（含 `aria-hidden`），字段本身保留为可点击的保留根，因此可以再次点击字段关闭面板。

## 无障碍

- 字段为原生 `<button>`，`aria-haspopup="dialog"` / `aria-expanded` 由 Popover 触发器输出；可访问名来自 `label`（映射 `aria-label`），未提供时会退回透传的 `aria-label`。
- 面板为 `role="dialog"`，内部是 `role="tree"`；树节点的选中 / 展开 / 禁用语义见[树形控件](./tree.md)。
- 清空按钮有独立可访问名，且位于字段之外（不是按钮内嵌按钮），命中区不小于 `--caomei-hit-target-min`。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-tree-select-panel-min-width` | `12rem` | 面板最小宽度 |
| `--caomei-tree-select-panel-max-height` | 由 `panelMaxHeight` 写入（`16rem`） | 面板最大高度 |
| `--caomei-popover-z-index` | `1050` | 面板层级（沿用 Popover） |

> 覆盖类样式与特异性的通用口径见[下游样式覆盖指引](../guide/overriding-styles.md)。

<ComponentApi name="tree-select" />
