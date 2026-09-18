# 组合式 API

除组件外，caomei-ui 导出一组组合式函数（composables），覆盖主题、轻提示、确认对话框与内建文案。经 Nuxt 模块接入时它们会被自动导入，其他项目从包入口显式导入。

| composable | 职责 | 前置条件 |
| --- | --- | --- |
| `useTheme` | 主题与暗色模式管理 | 无 |
| `useToast` | 服务式轻提示 | 需在 `<CaomeiToastProvider>` 的后代组件中调用 |
| `useConfirm` | 服务式确认对话框 | 需在 `<CaomeiConfirmDialog>` 的后代组件中调用 |
| `useLocale` | 读取当前注入的组件内建文案 | 无（未注入时回退 `zh-CN` 文案） |
| `provideLocale` | 向下提供组件内建文案（非组件 / 自定义 Provider 场景） | 须在 `setup` 中调用 |

```ts
import { provideLocale, useConfirm, useLocale, useTheme, useToast } from 'caomei-ui'
```

`useLocale` / `provideLocale` 的完整机制（合并、回退、优先级与运行时切换）见[内建文案与语言](./locale.md)。

## 放置 Provider

`useToast` / `useConfirm` 依赖各自的 Provider 提供上下文，在应用根部放置一次即可（Nuxt 可放在 `app.vue`）：

```vue
<template>
  <CaomeiToastProvider>
    <CaomeiConfirmDialog>
      <NuxtPage />
    </CaomeiConfirmDialog>
  </CaomeiToastProvider>
</template>
```

非 Nuxt 项目把 `<NuxtPage />` 替换为你的根内容。

内建文案的注入是独立的一层：在根部放置一次 `<CaomeiConfigProvider>`（或调用 `provideLocale()`）即可，与上述 Provider 并列，详见[内建文案与语言](./locale.md)。

## useTheme

管理模式状态并同步到根元素 `<html>`：

- `dark` / `light`：切换 `.dark` / `.light` class；
- `auto`：写入 `data-scheme="auto"`，交由 CSS 跟随系统偏好，`isDark` 读取系统偏好。

```vue
<script setup lang="ts">
const { mode, isDark, setMode } = useTheme('auto')
</script>

<template>
  <button type="button" @click="setMode(isDark ? 'light' : 'dark')">
    当前：{{ mode }}
  </button>
</template>
```

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `initial` | `'light' \| 'dark' \| 'auto'` | 可选，默认 `'auto'` |
| `mode` | `Ref<ThemeMode>` | 当前模式 |
| `isDark` | `ComputedRef<boolean>` | 是否处于暗色（`auto` 时取系统偏好） |
| `setMode` | `(next: ThemeMode) => void` | 切换模式 |

> SSR 下初始读取推迟到挂载后，避免服务端与客户端首帧不一致（hydration mismatch）。暗色 token 与品牌预设见[主题与样式设计](/design/theming)。

## useToast

必须在 `<CaomeiToastProvider>` 的后代组件中调用，Provider 在应用根部放置一次。

```vue
<script setup lang="ts">
const toast = useToast()

function onCopy(): void {
  toast.success('已复制')
}
</script>

<template>
  <button type="button" @click="onCopy">
    复制
  </button>
</template>
```

| 方法 | 说明 |
| --- | --- |
| `show(content)` | 入队一条提示，返回其 `id` |
| `info(content)` / `success(content)` / `warning(content)` / `danger(content)` | 以对应语气入队 |
| `dismiss(id)` | 关闭指定提示 |
| `clear()` | 关闭全部提示 |

`content` 支持字符串（等价 `{ title }`）或选项对象（`title` / `description` / `tone` / `type` / `duration` / `closable` / `action`），完整参数见 [Toast 轻提示](/components/toast)。

## useConfirm

必须在 `<CaomeiConfirmDialog>` 的后代组件中调用。

```vue
<script setup lang="ts">
const confirmDialog = useConfirm()

async function remove(): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: '删除该条目？',
    description: '删除后不可恢复。',
    tone: 'danger',
  })
  if (ok) {
    // 执行删除
  }
}
</script>
```

| 方法 | 说明 |
| --- | --- |
| `confirm(content)` | 打开对话框，返回 `Promise<boolean>`（确认 `true` / 取消 `false`） |
| `open(options)` | 同上，仅接受选项对象 |
| `cancel()` | 取消当前待决请求 |

`content` 支持字符串（等价 `{ title }`）或选项对象（`title` / `description` / `icon` / `confirmLabel` / `cancelLabel` / `tone`），详见 [ConfirmDialog 确认对话框](/components/confirm-dialog)。

## useLocale 与 provideLocale

`useLocale()` 读取当前注入的组件内建文案，未注入时回退 `defaultLocaleMessages`（`zh-CN`）；`provideLocale(options)` 用于非组件或自定义 Provider 场景，必须在 `setup` 中调用。日常接入优先使用 `<CaomeiConfigProvider>`。

```vue
<script setup lang="ts">
import { useLocale } from 'caomei-ui'

const locale = useLocale()
</script>

<template>
  <span>{{ locale.pagination.label }}</span>
</template>
```

```ts
import { provideLocale } from 'caomei-ui'

// setup 中调用；locale / messages 支持 ref / getter，运行时变化会传播到消费组件
provideLocale({ locale: () => currentLocale.value })
```

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `useLocale()` | `() => ComputedRef<CaomeiLocaleMessages>` | 读取当前注入文案；未注入时回退默认语言 |
| `provideLocale(options?)` | `(options?: ProvideLocaleOptions) => ComputedRef<CaomeiLocaleMessages>` | 向下提供文案 |
| `ProvideLocaleOptions.locale` | `MaybeRefOrGetter<CaomeiLocale \| undefined>` | 基准语言，默认 `'zh-CN'` |
| `ProvideLocaleOptions.messages` | `MaybeRefOrGetter<CaomeiLocaleMessageOverrides \| undefined>` | 按命名空间的部分覆盖 |

完整语义（合并、回退、优先级、运行时切换与 momei 接入示例）见[内建文案与语言](./locale.md)。

## SSR 与状态隔离

服务式 composable 的状态由 Provider 实例持有，而非模块级单例；Provider 与调用方同层时会抛出明确错误。`provideLocale` 同样按 Provider 实例持有上下文，SSR 下不会跨请求串扰。SSR 隔离的设计权衡见[组件设计 §7](/design/components)。
