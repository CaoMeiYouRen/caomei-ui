# 内建文案与语言

部分组件的用户可见文案（无障碍名称、空态、按钮文案等）来自组件库内建文案，集中在 `src/locale`，默认语言为 `zh-CN`。应用可通过 `<CaomeiConfigProvider>`（或 `provideLocale()`）注入语言与覆盖文案，并在运行时切换。

> 组件内建文案与文档站的多语言（`docs/i18n`）是两件事：前者是库在运行时使用的文案，后者是本站的页面翻译。

## 导出

```ts
import {
  CaomeiConfigProvider,
  caomeiLocaleKey,
  caomeiLocales,
  defaultLocale,
  defaultLocaleMessages,
  provideLocale,
  useLocale,
  type CaomeiLocale,
  type CaomeiLocaleMessageOverrides,
  type CaomeiLocaleMessages,
  type ProvideLocaleOptions,
} from 'caomei-ui'
```

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `caomeiLocales` | `Record<CaomeiLocale, CaomeiLocaleMessages>` | 内建文案资源（`zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR`） |
| `defaultLocale` | `CaomeiLocale` | 默认语言，当前为 `'zh-CN'` |
| `defaultLocaleMessages` | `CaomeiLocaleMessages` | 默认语言的完整文案对象 |
| `CaomeiLocale` | `'zh-CN' \| 'en-US' \| 'zh-TW' \| 'ja-JP' \| 'ko-KR'` | 内建语言标识 |
| `CaomeiLocaleMessages` | 接口 | 完整文案结构，可用于类型化自定义文案 |
| `CaomeiLocaleMessageOverrides` | `{ [K in keyof CaomeiLocaleMessages]?: Partial<CaomeiLocaleMessages[K]> }` | 按命名空间的部分覆盖 |
| `CaomeiConfigProvider` | 组件 | renderless provider（仅默认插槽），props：`locale` / `messages` |
| `provideLocale` | `(options?: ProvideLocaleOptions) => ComputedRef<CaomeiLocaleMessages>` | 非组件 / 自定义 Provider 场景下提供文案，须在 setup 中调用 |
| `useLocale` | `() => ComputedRef<CaomeiLocaleMessages>` | 读取当前注入的文案；未注入时回退 `defaultLocaleMessages` |
| `caomeiLocaleKey` | `InjectionKey<ComputedRef<CaomeiLocaleMessages>>` | 注入键，自定义 provider 时使用 |

## 文案分组与消费组件

`CaomeiLocaleMessages` 按组件域划分为 25 个命名空间，对应 26 个消费组件：

| 命名空间 | 文案键 | 消费组件 |
| --- | --- | --- |
| `autoComplete` | `empty` `open` | AutoComplete |
| `calendar` | `prev` `next` `label` | Calendar / DatePicker |
| `checkbox` | `selectAll` | CheckboxGroup |
| `colorPicker` | `label` `hex` `hue` `area` `swatches` `saturation` `brightness` `areaRole` `thumbRole` | ColorPicker |
| `confirm` | `confirm` `cancel` | ConfirmDialog |
| `dataView` | `empty` | DataView |
| `datePicker` | `label` `time` `hour` `minute` `second` | DatePicker |
| `dialog` | `label` `close` | Dialog |
| `drawer` | `label` `close` | Drawer |
| `fileUpload` | `choose` `prompt` `noFileChosen` `fileChosen` `sizeExceeded` | FileUpload |
| `image` | `label` `preview` `close` | Image |
| `input` | `clear` | Input |
| `inputNumber` | `increase` `decrease` | InputNumber |
| `message` | `close` | Message |
| `multiSelect` | `open` `remove` `empty` `clear` | MultiSelect |
| `pagination` | `label` `first` `previous` `next` `last` `page` `rowsPerPage` | Paginator |
| `password` | `show` `hide` `prompt` `weak` `medium` `strong` | Password |
| `progress` | `loading` `bar` | ProgressBar / ProgressSpinner / AutoComplete / DataTable / DataView |
| `select` | `clear` | Select |
| `slider` | `thumb` `minimum` `maximum` | Slider |
| `splitButton` | `menu` | SplitButton |
| `stepper` | `label` | Stepper |
| `tag` | `close` | Tag |
| `table` | `empty` `selectAll` `selectRow` `expandRowGroup` `collapseRowGroup` | DataTable |
| `toast` | `label` `viewport` `close` | Toast |

## 快速使用

在应用根部放置一次 `<CaomeiConfigProvider>`，其默认插槽内的组件即可消费注入文案：

```vue
<script setup lang="ts">
import { CaomeiConfigProvider } from 'caomei-ui'
</script>

<template>
  <CaomeiConfigProvider locale="en-US">
    <RouterView />
  </CaomeiConfigProvider>
</template>
```

`messages` 用于按命名空间覆盖基准语言，例如自定义分页名与确认按钮文案：

```vue
<template>
  <CaomeiConfigProvider
    locale="zh-CN"
    :messages="{ pagination: { label: '翻页' }, confirm: { confirm: '提交' } }"
  >
    <RouterView />
  </CaomeiConfigProvider>
</template>
```

## 合并与回退

- **按命名空间浅合并**：覆盖文案逐命名空间合并到基准语言之上；上例中 `pagination` 只覆盖 `label`，其余键仍取基准语言。
- **缺省回退**：`locale` 未提供时基准为 `defaultLocaleMessages`（`zh-CN`）；未注册的语言标识同样回退 `zh-CN`。**内建语种的基准即其自身文案**（如 `ja-JP` 未覆盖的键回退日文而非中文），覆盖仍按命名空间浅合并。
- **优先级**：组件内建文案为「显式 props > 注入 locale」；例如 `<CaomeiPaginator label="翻页" />` 会覆盖注入的 `pagination.label`，而 `<CaomeiPaginator />` 使用注入文案。
- `messages` 只覆盖文案，不改变组件行为；未覆盖的键请省略。

## 运行时切换

`locale` / `messages` 可为 `ref`、`computed` 或 getter；provider 内以 computed 求值，变化后消费组件自动更新：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiConfigProvider, type CaomeiLocale } from 'caomei-ui'

const locale = ref<CaomeiLocale>('zh-CN')
</script>

<template>
  <CaomeiConfigProvider :locale="locale">
    <button type="button" @click="locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'">
      切换到 {{ locale === 'zh-CN' ? 'English' : '中文' }}
    </button>
    <RouterView />
  </CaomeiConfigProvider>
</template>
```

## 不用组件时

非组件或自定义 Provider 场景可调用 `provideLocale()`（须在 `setup` 中调用），并用 `useLocale()` 读取：

```ts
import { computed, ref } from 'vue'
import { provideLocale, useLocale, type CaomeiLocale } from 'caomei-ui'

const locale = ref<CaomeiLocale>('en-US')
const overrides = computed(() => ({ pagination: { label: 'Pages' } }))

// setup 中调用；locale / messages 支持 ref / getter
provideLocale({ locale, messages: overrides })

// 任意后代读取注入文案
const messages = useLocale()
```

## 下游接入示例：momei

momei 是 Nuxt 4 + vue-i18n 的下游项目，包含 `zh-CN` / `zh-TW` / `en-US` / `ja-JP` / `ko-KR` 五种语言，与 caomei-ui 的内建语种一致。下面把 vue-i18n 的当前语言映射为 caomei-ui 的 `locale`，语言切换即生效（caomei-ui 本身不依赖 vue-i18n，此处仅是对接演示）。

```vue
<!-- app.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CaomeiConfigProvider, caomeiLocales, defaultLocale, type CaomeiLocale } from 'caomei-ui'

const { locale } = useI18n()

// 内建语种清单取自注册表，无需手写；下游新增语种时回退到默认语言
const builtInLocales = Object.keys(caomeiLocales) as CaomeiLocale[]

const caomeiLocale = computed<CaomeiLocale>(() =>
  builtInLocales.includes(locale.value as CaomeiLocale)
    ? (locale.value as CaomeiLocale)
    : defaultLocale,
)
</script>

<template>
  <CaomeiConfigProvider :locale="caomeiLocale">
    <NuxtPage />
  </CaomeiConfigProvider>
</template>
```

- 五种语言均直接使用内建文案，无需再传 `messages`。
- 只需微调个别文案（如品牌措辞）时，仍可用 `messages` 做 minimal overrides：例如 `{ pagination: { label: '頁面' } }`，未覆盖的键回退该语种自身文案。
- `locale` 为 `computed`，vue-i18n 切换语言后 caomei-ui 内建文案随之更新，无需额外 `watch`。

## 约束与提示

- `messages` 的值必须是非空白字符串。例如向 `toast.label` 注入空白字符串会被 Reka `ToastProvider` 拒绝并抛错（`Invalid prop \`label\` supplied to \`ToastProvider\`. Expected non-empty \`string\`.`）；未覆盖的键请直接省略，不要传空串。
- 内建 `zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR` 五语；其余语种由下游注入，可为完整替换或部分覆盖。
- 新增组件文案须同步补齐全部内建语种：`pnpm check:locale-keys` 以 `zh-CN` 为基准校验命名空间、键集合与占位符（漏译 / 错键 / 漏写 `{page}` 一类占位符即失败）。
- 组件内建文案与文档站 `docs/i18n` 的页面翻译互不影响；本页描述的是运行时文案注入。
- 相关阅读：[组合式 API](./composables.md)、[ConfirmDialog 确认对话框](/components/confirm-dialog)、[Paginator 分页](/components/paginator)。
