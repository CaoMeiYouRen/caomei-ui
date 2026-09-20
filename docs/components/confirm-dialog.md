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

> 组件样式随包自带；基础层由 resolver 或 `caomei-ui/nuxt` 模块注入（均默认开启），手写导入时需自行引 `caomei-ui/theme.css`。
>
> `useConfirm()` 必须在 `CaomeiConfirmDialog` 的后代组件中调用；与宿主同层时会抛出明确错误。文档站示例由布局根部的宿主提供上下文。

## 描述与语气

`open()` 接收完整配置对象：

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `title` | `string` | — | 标题，同时作为无障碍名称（必填） |
| `description` | `string` | — | 描述文本，用于补充说明操作后果 |
| `icon` | `Component` | 按 `tone` 回退：`neutral` → `Info`、`danger` → `TriangleAlert` | 标题旁的图标组件（如 `@lucide/vue` 导出的图标），**不接受字符串图标类名** |
| `confirmLabel` | `string` | 缺省依次回退宿主 `confirmLabel`、当前语言的内建文案 | 确认按钮文案 |
| `cancelLabel` | `string` | 缺省依次回退宿主 `cancelLabel`、当前语言的内建文案 | 取消按钮文案 |
| `tone` | `'neutral' \| 'danger'` | `'neutral'` | 语气，决定确认按钮强调色 |

`tone="danger"` 用于删除等破坏性操作，将确认按钮切换为危险强调色。

> 按钮文案的完整优先级为「单次请求 > 宿主 props > 注入 locale」，见[内建文案与语言](/components/locale)。

<demo
    vue="../examples/confirm-dialog/tone.vue"
    ssg="true"
/>

## 图标

`icon` 接收**图标组件**（如 `@lucide/vue` 导出的图标），不接受 PrimeVue 的字符串图标类名。未传时按 `tone` 回退内建图标：`neutral` 为 `Info`、`danger` 为 `TriangleAlert`，因此破坏性操作无需额外传参即呈现警示图标。图标为装饰性内容并标记 `aria-hidden="true"`，可访问名始终由标题提供。

<demo
    vue="../examples/confirm-dialog/icon.vue"
    ssg="true"
/>

```ts
import { Rocket } from '@lucide/vue'

const confirmed = await confirmDialog.open({
  title: '发布新版本？',
  icon: Rocket, // 缺省时按 tone 回退 Info / TriangleAlert
})
```

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

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `<ConfirmDialog />` | `<CaomeiConfirmDialog />`（在应用根部放置一次） |
| `useConfirm().require({ ... })` | `useConfirm().open({ ... })`；`confirm(content)` 为字符串简写 |
| `header` / `message` | `title` / `description` |
| `acceptLabel` / `rejectLabel` | `confirmLabel` / `cancelLabel`（请求级 > Provider props > 内建文案） |
| `accept` / `reject` 回调 | **改用返回的 `Promise<boolean>`**：确认 `true`、取消或关闭 `false` |
| `acceptClass` / `rejectClass` | `tone`（`danger` 为确认按钮危险态）；不提供任意 class 注入 |
| `icon`（字符串图标类名） | `icon`（传 `@lucide/vue` 组件，非字符串类名）；缺省按 `tone` 回退内建图标（`neutral` → `Info`、`danger` → `TriangleAlert`） |

**未实现 / 未暴露**：`group`（多实例分组）、`position` / `draggable` / `breakpoints` / `blockScroll` / `appendTo`（浮层位置、层级与滚动锁由库管理，且恒为模态）。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="confirm-dialog" />
