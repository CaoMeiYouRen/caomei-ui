# Cascader 级联选择

级联选择用于从多级树形选项中选择一条路径，常见于省 / 市 / 区与组织层级。`v-model` 保存从根到叶的完整值路径。

## 基础用法

`options` 是带 `children` 的选项树；点击有子级的条目会展开下一列，点击叶子提交完整路径并关闭面板。

<demo
    vue="../examples/cascader/basic.vue"
    ssg="true"
/>

## 行为

- `changeOnSelect`（默认 `false`）为真时，点击仍有子级的父节点也会立即提交当前路径。
- `clearable`（默认 `true`）在有值时显示清除按钮；清除后模型为空数组。
- `separator`（默认 ` / `）控制触发器上路径文案的连接符。
- `disabled` 禁用触发器与清除按钮；单个选项的 `disabled` 只阻止该节点。

## 受控与数据

- `v-model` 为值路径数组；空数组或 `null` 表示未选择。
- 组件不修改 `options`；按值路径解析展示文案，任一级缺失时按未选择处理。
- 值类型与 `Select` 一致，仅接受 `string | number`。

## 无障碍

- 触发器是原生 `button`，带 `aria-expanded`；可用 `label` 命名。
- 面板每列是 `role="listbox"`，条目是 `role="option"` 并带 `aria-selected` / `aria-disabled`；可用 Enter / Space 选择。
- 清除按钮是独立按钮，带可访问名；不与触发器嵌套。

## 与 Select 的边界

- 只有**两级及以上**的层级选择才用 Cascader；单层选项请用 `Select`。
- 需要搜索过滤、远程加载或虚拟滚动时另行评估，当前版本不内置。

<ComponentApi name="cascader" />
