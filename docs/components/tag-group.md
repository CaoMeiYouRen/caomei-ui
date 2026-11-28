# TagGroup 标签组

把一组标签放在同一容器里：既可作为**选择控件**（单选 / 多选），也可作为**可移除的筛选条件**。基于 Reka UI 的 `TagGroup` 原语封装，提供容器 / 标签 / 文本 / 删除触发器四个部件。

## 基础用法

`selectionMode="multiple"` 时点击标签切换选中；`"single"` 单选；`none`（默认）只展示、不参与选择。方向键在同一组的标签之间移动焦点。

<demo
    vue="../examples/tag-group/basic.vue"
    ssg="true"
/>

## 可移除的标签

`CaomeiTagGroupItemDelete` 从选择集合中移除该标签并派发 `remove`；调用方通常据此同步自己的列表。移除能力由**根节点是否监听 `remove`** 决定（未监听时删除触发器不生效），避免「能点但没有语义」。

<demo
    vue="../examples/tag-group/removable.vue"
    ssg="true"
/>

## 交互与无障碍

- **选择**：`selectionMode` 取 `none`（默认）/ `single` / `multiple`；`v-model` 在 `single` 下是字符串、`multiple` 下是字符串数组。`disallowEmptySelection` 阻止取消最后一项。
- **键盘**：标签项采用 roving tabindex，方向键在同一组内移动焦点（`loop` 默认开启）；`Delete` / `Backspace` 移除当前标签。
- **移除**：`CaomeiTagGroupItemDelete` 的可访问名默认来自标签文本（Reka 用 `aria-labelledby` 指向标签），因此按钮内**只放图标**；需要自定义名称（如「移除 前端」）时传 `label`。
- **禁用**：`CaomeiTagGroup` 的 `disabled` 禁用整组，`CaomeiTagGroupItem` 的 `disabled` 禁用单个标签（不可选中、不可移除）。
- 容器应提供可访问名（如 `aria-label="技能标签"`），让辅助技术知道这组标签代表什么。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiTagGroup` | `v-model`、`selectionMode`、`disallowEmptySelection`、`disabled`、`loop` |
| `CaomeiTagGroupItem` | `value`、`disabled`、`textValue` |
| `CaomeiTagGroupItemText` | — |
| `CaomeiTagGroupItemDelete` | `label` |

## 事件

| 事件 | 载荷 | 说明 |
|------|------|------|
| `remove` | 被移除标签的值 | 用户通过删除触发器或 `Delete` / `Backspace` 移除标签时触发 |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-tag-group-gap` | `--caomei-space-2` | 标签之间的间距 |
| `--caomei-tag-group-item-border` | `--caomei-color-border` | 标签描边 |
| `--caomei-tag-group-item-radius` | `--caomei-radius-sm` | 标签圆角 |
| `--caomei-tag-group-item-bg` | `--caomei-color-bg-elevated` | 标签底色 |
| `--caomei-tag-group-item-active-border` | `--caomei-color-primary` | 选中态描边 |
| `--caomei-tag-group-item-active-bg` | `--caomei-color-primary` | 选中态底色 |

<ComponentApi name="tag-group" />
