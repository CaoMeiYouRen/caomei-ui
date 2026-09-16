# ConfirmDialog 确认对话框

确认对话框用于中断用户当前操作并获取明确确认，基于 Reka UI AlertDialog 封装，并提供 `useConfirm()` 服务式调用。弹层强制模态、锁定页面滚动，且**点击遮罩不会关闭**——用户必须显式选择确认或取消（Esc 视为取消）。

## 基础用法

在应用根部放置一次 `<CaomeiConfirmDialog>`，其**后代组件**再通过 `useConfirm()` 获取服务。`confirm()` 返回 `Promise<boolean>`：确认解析为 `true`，取消解析为 `false`；传入字符串等价于 `{ title }`。

<demo
    vue="../examples/confirm-dialog/basic.vue"
    ssg="true"
/>

```vue
<!-- App.vue：根部挂载宿主 -->
<script setup lang="ts">
import { CaomeiConfirmDialog } from 'caomei-ui'
</script>

<template>
  <CaomeiConfirmDialog>
    <RouterView />
  </CaomeiConfirmDialog>
</template>
```

```vue
<!-- 任意后代组件：获取服务 -->
<script setup lang="ts">
import { useConfirm } from 'caomei-ui'

const confirmDialog = useConfirm()

async function save(): Promise<void> {
  const confirmed = await confirmDialog.confirm('保存更改？')
  if (confirmed) {
    // 执行保存
  }
}
</script>
```

> 使用前需引入组件库样式（`import 'caomei-ui/styles.css'`）。
>
> `useConfirm()` 必须在 `CaomeiConfirmDialog` 的后代组件中调用；与宿主同层时会抛出明确错误。文档站示例由布局根部的宿主提供上下文。

## 描述与语气

`open()` 接收完整配置对象：

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `title` | `string` | — | 标题，同时作为无障碍名称（必填） |
| `description` | `string` | — | 描述文本，用于补充说明操作后果 |
| `confirmLabel` | `string` | 缺省依次回退宿主 `confirmLabel`、当前语言的内建文案 | 确认按钮文案 |
| `cancelLabel` | `string` | 缺省依次回退宿主 `cancelLabel`、当前语言的内建文案 | 取消按钮文案 |
| `tone` | `'neutral' \| 'danger'` | `'neutral'` | 语气，决定确认按钮强调色 |

`tone="danger"` 用于删除等破坏性操作，将确认按钮切换为危险强调色。

> 按钮文案的完整优先级为「单次请求 > 宿主 props > 注入 locale」，见[内建文案与语言](/components/locale)。

<demo
    vue="../examples/confirm-dialog/tone.vue"
    ssg="true"
/>

## Promise 语义

- 同一时刻只允许一个待决请求；在旧请求未结算时再次调用，旧 Promise 以 `false` 结算，新请求独立生效。
- `cancel()` 主动取消当前待决请求（解析为 `false`），无待决请求时无副作用。
- 点击遮罩不会关闭对话框；Esc 视为取消。

```ts
const confirmDialog = useConfirm()

const confirmed = await confirmDialog.confirm({ title: '删除文件', tone: 'danger' })
confirmDialog.cancel() // 主动取消（解析为 false）
```

## 无障碍与焦点

- 内容层为 `role="alertdialog"` 并标注 `aria-modal="true"`，标题与描述分别关联 `aria-labelledby` / `aria-describedby`。
- 打开时焦点圈定，并**默认落在「取消」按钮**上，避免误触破坏性操作。
- 模态打开时锁定页面滚动；点击遮罩不关闭，Esc 关闭并归还焦点。
- Portal 内容仅客户端挂载，`open` 为假时 SSR 无额外输出，可在文档站安全使用 `ssg`。

## 样式定制

对话框宽度基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-confirm-dialog-width` | `400px` | 对话框宽度上限（窄屏下为 `100vw - 2 * space-4`） |

```css
.caomei-confirm-dialog__content {
    --caomei-confirm-dialog-width: 480px;
}
```

<ComponentApi name="confirm-dialog" />
