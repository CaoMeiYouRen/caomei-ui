# Transfer 穿梭框

穿梭框用左右两个列表在候选集与已选集之间移动条目，常用于权限分配、成员选择等场景。`v-model` 只保存**右侧（已选）**的值集合。

## 基础用法

`dataSource` 提供全量选项，`v-model` 提供已选值；勾选条目后点击中间按钮移动。左右面板标题与搜索 / 空态 / 按钮文案缺省取内建 locale。

<demo
    vue="../examples/transfer/basic.vue"
    ssg="true"
/>

## 搜索与禁用

- `searchable`（默认 `true`）在两侧渲染搜索框，按 `label` 做不区分大小写的包含匹配。
- `disabled` 禁用全部交互；选项自身的 `disabled` 只阻止该条目的勾选与移动。
- 移动后清空该侧勾选，避免下一次移动重复提交。

## 数据与受控

- `v-model` 为右侧值集合；组件不修改 `dataSource`，只按值集合过滤左右列表。
- 值类型与 `Select` 一致，仅接受 `string | number`；`label` 同时作为搜索文本。
- 未在 `dataSource` 中出现的已选值不会渲染，但会保留在模型中（便于异步加载选项时先有值）。

## 无障碍

- 根为 `role="group"`，可用 `label` 命名；左右列表为带名称的 `ul`。
- 每个条目是原生复选框 + 文本，键盘可直接操作；移动按钮是普通 `button`，带 `aria-label`。
- 搜索框使用原生 `search` 类型并带可访问名。

## 与 DataTable 选择列的边界

- `Transfer` 面向**两栏之间的集合迁移**（候选 → 已选），强调“移动”动作。
- `DataTable` 的选择列面向**对当前数据集勾选**；需要行级操作、分页与批量动作时用 DataTable。

<ComponentApi name="transfer" />
