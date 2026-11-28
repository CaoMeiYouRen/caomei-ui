# Editable 行内编辑

在原位编辑一段文本，适合「标题、昵称、备注」这类就地修改且空间有限的场景。基于 Reka UI 的 `Editable` 原语封装，提供容器 / 区域 / 预览 / 输入与三个动作触发器共七个部件。

## 基础用法

聚焦预览区即进入编辑（`activationMode` 默认 `focus`）；回车提交、`Esc` 回退。`CaomeiEditablePreview` 固定在 Tab 序列里，键盘用户不必先用指针点击。

<demo
    vue="../examples/editable/basic.vue"
    ssg="true"
/>

## 受控值与动作触发器

`v-model` 承接受控值，`@submit` 在真正提交时给出提交后的值；`CaomeiEditableEditTrigger` / `SubmitTrigger` / `CancelTrigger` 用于把「编辑 / 提交 / 取消」做成显式按钮。`submitMode="none"` 时只认提交触发器（回车与失焦都不提交）。

<demo
    vue="../examples/editable/controlled.vue"
    ssg="true"
/>

## 交互与无障碍

- **进入编辑**：`activationMode="focus"`（默认）聚焦即编辑；`"dblclick"` 只在双击时进入。预览区有 `tabindex="0"`，键盘可达。
- **提交**：`submitMode` 取 `enter`（仅回车）、`blur`（仅失焦，默认）、`both`、`none`（只认提交触发器）。提交后回写 `v-model` 并派发 `submit`。
- **回退**：`Esc` 或取消触发器只退出编辑态，**不写回中间输入、不派发 `submit`**。
- **只读与禁用**：`readonly` 可进入编辑查看但不接受输入；`disabled` 时输入框自身 `disabled`、不写回模型（根节点带 `data-disabled`）。
- **可访问名**：行内编辑没有可见标签，`CaomeiEditableInput` 的 `label` 提供输入框可访问名；触发器同样建议传 `label`（图标按钮必须有名称）。
- 编辑态焦点由组件在进入编辑时交给输入框（`selectOnFocus` 可全选现有文本）。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiEditable` | `v-model`、`placeholder`、`disabled`、`readonly`、`activationMode`、`submitMode`、`selectOnFocus`、`startWithEditMode`、`maxLength` |
| `CaomeiEditableArea` | — |
| `CaomeiEditablePreview` | — |
| `CaomeiEditableInput` | `label` |
| `CaomeiEditableEditTrigger` / `SubmitTrigger` / `CancelTrigger` | `label` |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-editable-min-height` | `--caomei-control-height-md` | 行内编辑容器最小高度 |
| `--caomei-editable-input-width` | `12rem` | 编辑态输入框宽度 |

<ComponentApi name="editable" />
