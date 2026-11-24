# Tree 树形控件

以可展开的层级结构展示数据，支持单选 / 多选、节点禁用与键盘导航。底层为 Reka UI 的 `TreeRoot` / `TreeItem`（**Alpha 原语**，本库锁 `reka-ui@2.11.0` 并为封装面提供回归用例）。

## 基础用法

`items` 传入递归数据：节点键取 `id`（`itemKey` 可改名）、可见文案取 `label`（`labelKey` 可改名）、子节点取 `children`（`childrenKey` 可改名）。`v-model` 承载选中键、`v-model:expanded` 承载展开键；未绑定 `v-model:expanded` 时组件自持展开态，也可用 `defaultExpanded` 给初值。

<demo
    vue="../examples/tree/basic.vue"
    ssg="true"
/>

- **展开与选中**：点击节点同时切换展开与选中；`ArrowRight` 在收起时展开、已展开时把焦点移入首个可见子节点，`ArrowLeft` 在展开时收起、已收起时把焦点移回父节点；`ArrowUp` / `ArrowDown` 在可见节点间按展开顺序移动（可跨层级），`Home` / `End` 跳到首个 / 末个可见节点。上述键位均由 primitive 提供。
- **禁用**：节点的 `disabled: true` 只禁用该节点的选择与展开；组件级 `disabled` 禁用整棵树。
- **可访问名**：`label` 映射根 `aria-label`；`role="tree"` / `treeitem`、`aria-expanded` / `aria-selected` / `aria-level` / `aria-setsize` / `aria-posinset` 由组件与 primitive 共同输出（`setsize` / `posinset` 按同层兄弟计数）。

## 多选与自定义文案

`multiple` 开启多选（根同时输出 `aria-multiselectable`）。`#label` 插槽接收 `{ item, level, expanded, selected, disabled }`，可用于加图标、徽标或按层级改变文案。

<demo
    vue="../examples/tree/multiple.vue"
    ssg="true"
/>

- `propagateSelect`（默认 `false`）：选中父节点时连带选中全部后代，取消时一并移除；`bubbleSelect`（默认 `false`）：后代全部选中时把父节点加入选中，否则移出选中。两者均为多选下的可选语义，按业务需要开启。
- 本封装**不输出半选态**（`aria-checked="mixed"` / `data-indeterminate`）：primitive 的 `isIndeterminate` 只在它自己的插槽作用域里暴露，需要半选视觉时应基于 primitive 自行组合。
- 单选消费方拿到的是**键数组**（最多一项）；点击已选节点会取消选择，此时数组为空。

## 数据量与虚拟滚动

- 未启用 Reka 的 `TreeVirtualizer`，即所有可见节点都会渲染。生产中建议：单层可见节点控制在数百以内；上千节点时按业务做**分页 / 懒加载**（展开时再取子节点，本组件支持随时替换 `items`），或自行以 `TreeVirtualizer` 组合 primitive。
- 大数据下的取舍：扁平渲染让 `aria-setsize` / `posinset` 按层级计数，键盘漫游成本与可见节点数线性相关；折叠状态不渲染子节点，因此收起父节点即可把整棵子树移出渲染面。
- 键必须唯一且稳定（`itemKey` 指定的字段）；缺键会输出开发期告警，并导致选择 / 展开互相串扰。

## 无障碍

- 根为 `role="tree"`，节点为 `role="treeitem"` 并带 `aria-level`；有子节点的节点额外输出 `aria-expanded`，选中态输出 `aria-selected`，禁用节点输出 `aria-disabled`。
- 折叠箭头是**装饰**（`aria-hidden`）：展开 / 收起由节点本身承担，读屏不会重复播报「展开按钮」。
- 焦点采用 roving tabindex：树内只有当前项可 Tab 命中，方向键在树内移动。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-tree-row-height` | `--caomei-control-height-md` | 每行最小高度 |
| `--caomei-tree-indent` | `--caomei-space-4` | 每级缩进 |
| `--caomei-tree-toggle-size` | `1rem` | 折叠箭头占位宽度 |
| `--caomei-tree-selected-bg` | `primary` 12% 混合 | 选中行背景 |
| `--caomei-tree-selected-color` | `--caomei-color-primary-text` | 选中行文字色 |

> 覆盖类样式与特异性的通用口径见[下游样式覆盖指引](../guide/overriding-styles.md)。

<ComponentApi name="tree" />
