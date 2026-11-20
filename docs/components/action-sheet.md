# ActionSheet 操作面板

操作面板从底部弹出，承载一组与当前上下文相关的操作。它以 [Drawer](./drawer) 的 `position="bottom"` 组合实现，不引入新的 primitive。

## 基础用法

`v-model:open` 控制开合；`groups` 按分组渲染条目，取消项固定在最底部。

<demo
    vue="../examples/action-sheet/basic.vue"
    ssg="true"
/>

## 分组与危险项

每个分组可带 `label`，条目支持 `value` / `description` / `danger` / `disabled`。`danger` 用于删除等不可逆操作，以危险色呈现并在说明中标明后果。

## 选择与关闭行为

- 选择条目抛出 `select(value, item)`；`closeOnSelect` 默认 `true`，选择后自动关闭。
- 取消项文案取 `cancelLabel`，缺省为当前语言的「取消」；点击抛出 `cancel` 并关闭。
- 默认插槽可替换整个内容区（此时不再渲染 `groups`）。

## 焦点与滚动

- 打开后焦点移入面板，关闭后回到打开前的元素（由底层 Dialog 语义保证）。
- 面板高度受 `min(90dvh, 420px)` 约束，条目超出时正文纵向滚动，取消项保持可见。

## 无障碍

- 面板按模态对话框语义渲染；无可见标题时仍以当前语言的「操作面板」作为可访问名。
- 条目与取消项均为原生 `button`，禁用项带原生 `disabled`。
- 焦点在关闭后回到触发元素；按 Esc 与点击遮罩的关闭行为沿用 Drawer。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-action-sheet-group-gap` | `--caomei-space-3` | 分组间距 |
| `--caomei-action-sheet-item-bg` | `--caomei-color-bg-elevated` | 条目的分组背景 |
| `--caomei-action-sheet-item-min-height` | `control-height-lg + space-1` | 条目 / 取消项高度下限 |
| `--caomei-action-sheet-divider` | `--caomei-color-border` | 条目分隔线 |
| `--caomei-action-sheet-radius` | `--caomei-radius-md` | 分组 / 取消项圆角 |
| `--caomei-action-sheet-cancel-bg` | `--caomei-color-bg-elevated` | 取消项背景 |
| `--caomei-action-sheet-cancel-border` | `--caomei-color-border` | 取消项边框 |

> 表为常用覆盖钩子，非穷举；其余 `--caomei-action-sheet-*` 变量同样可直接覆盖。

<ComponentApi name="action-sheet" />
