# Message 提示条

提示条用于在当前页面内展示一条与上下文相关的反馈信息（单组件同时承载 Message / Alert 语义）。

## 基础用法

通过 `title` / `description` 或默认插槽提供内容。

<demo
    vue="../examples/message/basic.vue"
    ssg="true"
/>

## 色调

通过 `tone` 切换语义色调，支持 `neutral` / `primary` / `success` / `warning` / `danger`。

<demo
    vue="../examples/message/tones.vue"
    ssg="true"
/>

## 变体

通过 `variant` 切换视觉变体，支持 `soft`（默认）/ `solid` / `outline`。

<demo
    vue="../examples/message/variants.vue"
    ssg="true"
/>

## 关闭与操作

`closable` 显示关闭按钮并抛出 `close`；`#actions` 插槽承载操作按钮。

<demo
    vue="../examples/message/closable.vue"
    ssg="true"
/>

## 无障碍

- 消息内容层默认 `role="status"`（礼貌播报），错误 / 警告场景可改为 `role="alert"` 立即播报；该角色位于内容层，关闭按钮与 `#actions` 在 live region 之外，避免交互控件被并入播报。
- 只能以纯文本承载语义；若消息内需要交互控件，建议由使用方改用非 live region 的展示方式。
- 语义图标默认按 `tone` 选择并标记 `aria-hidden`；`#icon` 插槽内容同样视为装饰（整体 `aria-hidden`），如需承载语义请写在文本内容中。
- `closable` 时关闭按钮具备可访问名（默认「关闭」，可用 `closeLabel` 覆盖）。

## 样式定制

色板取自全局语义 token：`primary` / `success` / `warning` / `danger` 使用 `--caomei-color-<tone>`，`neutral` 使用 `--caomei-color-text-muted`；`solid` 变体背景使用对应的 `--caomei-color-<tone>-solid`（`neutral` 为 `--caomei-color-neutral-solid`）。另有圆角覆盖钩子：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-message-radius` | `--caomei-radius-md` | 圆角 |

```css
.caomei-message {
    --caomei-message-radius: 999px;
}
```

<ComponentApi name="message" />
