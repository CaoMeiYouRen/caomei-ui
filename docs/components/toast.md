# Toast 轻提示

轻提示用于对用户操作给出简短反馈，基于 Reka UI Toast 封装，并提供 `useToast()` 服务式调用。提示由视口内的可访问区域承载，支持自动关闭、滑动关闭、操作按钮与语义语气。

## 基础用法

在应用根部放置一次 `<CaomeiToastProvider>`，其**后代组件**再通过 `useToast()` 获取服务。

<demo
    vue="../examples/toast/basic.vue"
    ssg="true"
/>

`show()` 接收字符串或配置对象，返回该提示的 `id`。

```vue
<!-- App.vue：根部挂载 Provider -->
<script setup lang="ts">
import { CaomeiToastProvider } from 'caomei-ui'
</script>

<template>
  <CaomeiToastProvider>
    <RouterView />
  </CaomeiToastProvider>
</template>
```

```vue
<!-- 任意后代组件：获取服务 -->
<script setup lang="ts">
import { useToast } from 'caomei-ui'

const toast = useToast()

function save(): void {
  toast.show('操作已完成')
  toast.show({ title: '保存成功', description: '更改已同步到服务器。' })
}
</script>

<template>
  <button @click="save">保存</button>
</template>
```

> 使用前需引入组件库样式（`import 'caomei-ui/styles.css'`），否则提示与视口缺少基础样式。
>
> `useToast()` 必须在 `CaomeiToastProvider` 的后代组件中调用。Provider 与调用方同层时会抛出明确错误；文档站示例由布局根部的 Provider 提供上下文。

## 语气

通过 `info` / `success` / `warning` / `danger` 快捷方法设置语义语气，分别对应中性、成功、警告、危险色；也可用 `show({ tone })` 显式指定。

<demo
    vue="../examples/toast/tones.vue"
    ssg="true"
/>

## 位置

`position` 控制视口停靠位置，支持 `top-left` / `top-center` / `top-right` / `bottom-left` / `bottom-center` / `bottom-right`，默认 `top-right`。可嵌套 Provider 覆盖局部位置。

<demo
    vue="../examples/toast/position.vue"
    ssg="true"
/>

## 操作与时长

配置对象的常用选项：

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `title` | `string` | — | 标题 |
| `description` | `string` | — | 描述文本 |
| `tone` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | 语气 |
| `type` | `'foreground' \| 'background'` | `'foreground'` | 屏幕阅读器播报优先级 |
| `duration` | `number` | Provider 的 `duration` | 展示时长（毫秒）；`<= 0` 或 `Infinity` 表示不自动关闭 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `action` | `{ label, altText?, onClick? }` | — | 操作按钮，点击后自动关闭 |

<demo
    vue="../examples/toast/action.vue"
    ssg="true"
/>

`dismiss(id)` 关闭指定提示，`clear()` 关闭全部提示。超出 `max`（默认 5）时丢弃最早的提示，`max` 调小会立即裁剪既有队列。

```ts
const id = toast.warning({ title: '已删除文件', action: { label: '撤销', onClick: undo } })
toast.dismiss(id)
toast.clear()
```

`title` 与 `description` 建议至少提供一项，否则会渲染为空壳提示。

## 样式定制

提示样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-toast-offset` | `--caomei-space-4` | 视口距屏幕边缘的距离 |
| `--caomei-toast-width` | `min(24rem, 100% - 2 * offset)` | 视口宽度 |
| `--caomei-toast-z-index` | `1100` | 视口层级 |
| `--caomei-toast-accent` | 随语气 | 提示左侧强调色，可按语气类覆盖 |

```css
.caomei-toast-viewport {
    --caomei-toast-offset: 24px;
}

.caomei-toast--success {
    --caomei-toast-accent: #16a34a;
}
```

## 无障碍与 SSR

- 视口为 `role="region"` 的可访问区域，支持 `F8` 聚焦；视口可访问名优先级为 `viewportLabel` > 透传 `aria-label` > 当前语言文案；每条提示的 `label` 与关闭按钮文案取自当前语言，可通过 props 覆盖。
- `foreground`（默认）提示以 `assertive` 播报，`background` 以 `polite` 播报。
- Provider 的提示队列与自增序列随实例创建，不在模块级共享，因此 SSR 下不会跨请求泄漏状态；未入队时视口无可见内容。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `<Toast />` | `<CaomeiToastProvider>`（在应用根部放置一次） |
| `useToast().add({ ... })` | `useToast().show({ ... })`；另有 `info` / `success` / `warning` / `danger` 语义方法与 `dismiss(id)` / `clear()` |
| `severity` | `tone`（`success` → `success`、`info` → `primary`、`warn` → `warning`、`error` → `danger`、`secondary` / `contrast` → `neutral`） |
| `summary` / `detail` | `title` / `description` |
| `life` | `duration`（毫秒；Provider 默认 `5000`，逐条可覆盖） |
| `closable` | `closable` |
| `<Toast position>` / `group` | `position` 由 Provider 统一配置（非逐条）；`group`（多实例分组）未实现 |
| `styleClass` / `contentStyleClass` / `breakpoints` | 未实现 |

**本库新增**：`action`（内联操作按钮）、`type`（`foreground` / `background`）；Provider 级 `max` / `hotkey` / `swipeThreshold` / `disableSwipe`。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="toast" />
