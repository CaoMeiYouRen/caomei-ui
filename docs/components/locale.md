# 内建文案与语言

部分组件的用户可见文案（无障碍名称、空态、按钮文案等）来自组件库内建文案，集中在 `src/locale`，默认语言为 `zh-CN`。应用可通过 `<CaomeiConfigProvider>`（或 `provideLocale()`）注入语言与覆盖文案，并在运行时切换。

> 组件内建文案与文档站的多语言（`docs/i18n`）是两件事：前者是库在运行时使用的文案，后者是本站的页面翻译。

## 导出

```ts
import {
  CaomeiConfigProvider,
  PRE_REGISTERED_LOCALES,
  caomeiLocaleCodeKey,
  caomeiLocaleKey,
  caomeiLocales,
  defaultLocale,
  defaultLocaleMessages,
  provideLocale,
  registerLocale,
  useLocale,
  useLocaleCode,
  type CaomeiLocale,
  type CaomeiLocaleMessageOverrides,
  type CaomeiLocaleMessages,
  type ProvideLocaleOptions,
} from 'caomei-ui'
```

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `caomeiLocales` | `Partial<Record<CaomeiLocale, CaomeiLocaleMessages>>` | **已注册**语言表：初值 = `PRE_REGISTERED_LOCALES`，其余语言经 `registerLocale` 扩展 |
| `PRE_REGISTERED_LOCALES` | `readonly ['zh-CN', 'en-US']`（`as const` 窄元组） | 随包根**预注册**的语言（无需注册即可用） |
| `registerLocale` | `(code: CaomeiLocale, messages: CaomeiLocaleMessages) => void` | 注册一门内建语言的文案（须在 `provideLocale` 之前调用，见「按需引入语言」） |
| `defaultLocale` | `CaomeiLocale` | 默认语言，当前为 `'zh-CN'` |
| `defaultLocaleMessages` | `CaomeiLocaleMessages` | 默认语言的完整文案对象 |
| `CaomeiLocale` | `'zh-CN' \| 'en-US' \| 'zh-TW' \| 'ja-JP' \| 'ko-KR'` | 内建语言标识（**不等于已注册**：`zh-TW` / `ja-JP` / `ko-KR` 须按需引入并注册） |
| `CaomeiLocaleMessages` | 接口 | 完整文案结构，可用于类型化自定义文案 |
| `CaomeiLocaleMessageOverrides` | `{ [K in keyof CaomeiLocaleMessages]?: Partial<CaomeiLocaleMessages[K]> }` | 按命名空间的部分覆盖 |
| `CaomeiConfigProvider` | 组件 | renderless provider（仅默认插槽），props：`locale` / `messages` |
| `provideLocale` | `(options?: ProvideLocaleOptions) => ComputedRef<CaomeiLocaleMessages>` | 非组件 / 自定义 Provider 场景下提供文案与语言标识，须在 setup 中调用 |
| `useLocale` | `() => ComputedRef<CaomeiLocaleMessages>` | 读取当前注入的文案；未注入时回退 `defaultLocaleMessages` |
| `useLocaleCode` | `() => ComputedRef<CaomeiLocale>` | 读取当前注入的语言标识；未注入时回退 `defaultLocale` |
| `caomeiLocaleKey` | `InjectionKey<ComputedRef<CaomeiLocaleMessages>>` | 文案注入键，自定义 provider 时使用 |
| `caomeiLocaleCodeKey` | `InjectionKey<ComputedRef<CaomeiLocale>>` | 语言标识注入键，自定义 provider 时使用 |

## 文案分组与消费组件

`CaomeiLocaleMessages` 按组件域划分为 28 个命名空间，对应 29 个消费组件：

| 命名空间 | 文案键 | 消费组件 |
| --- | --- | --- |
| `autoComplete` | `empty` `open` | AutoComplete |
| `calendar` | `prev` `next` `label` | Calendar / DatePicker |
| `chart` | `loading` `loadFailed` | Chart |
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
| `richTextEditor` | `loading` `loadFailed` | RichTextEditor |
| `select` | `clear` | Select |
| `slider` | `thumb` `minimum` `maximum` | Slider |
| `splitButton` | `menu` | SplitButton |
| `stepper` | `label` | Stepper |
| `tag` | `close` | Tag |
| `table` | `empty` `selectAll` `selectRow` `expandRowGroup` `collapseRowGroup` `expandRow` `collapseRow` | DataTable |
| `tagsInput` | `clear` | TagsInput |
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

## 按需引入语言

内建语言分为**预注册**与**按需引入**两类：只用一两门语言的应用不必打包其余语言包。

| 类别 | 语言 | 取用方式 |
| --- | --- | --- |
| 预注册（随包根可用） | `zh-CN`、`en-US` | 直接 `locale="en-US"`；清单见 `PRE_REGISTERED_LOCALES` |
| 按需引入 | `zh-TW`、`ja-JP`、`ko-KR` | 经子路径 `import` 后调用 `registerLocale()` |

子路径与语言标识一一对应（小写 + 连字符）：

| 语言标识 | 子路径 |
| --- | --- |
| `zh-TW` | `caomei-ui/locale/zh-tw` |
| `ja-JP` | `caomei-ui/locale/ja-jp` |
| `ko-KR` | `caomei-ui/locale/ko-kr` |

同步注册（推荐）：在应用入口先注册，再挂载 provider。

```ts
import { createApp } from 'vue'
import { registerLocale } from 'caomei-ui'
import jaJP from 'caomei-ui/locale/ja-jp'
import App from './App.vue'

registerLocale('ja-JP', jaJP)

createApp(App).mount('#app')
```

异步注册（按需加载语言包、运行期切换）：

```ts
import { registerLocale } from 'caomei-ui'
import type { CaomeiLocaleMessages } from 'caomei-ui'

const loaders = {
  'zh-TW': () => import('caomei-ui/locale/zh-tw'),
  'ja-JP': () => import('caomei-ui/locale/ja-jp'),
  'ko-KR': () => import('caomei-ui/locale/ko-kr'),
} as const

export async function loadLocale(code: keyof typeof loaders): Promise<void> {
  const module = await loaders[code]()
  registerLocale(code, module.default as CaomeiLocaleMessages)
}
```

Nuxt：在插件中注册。`caomei-ui/nuxt` 模块只负责组件与 composables 自动导入，不处理语言注册。

```ts
// app/plugins/caomei-locale.ts
import { registerLocale } from 'caomei-ui'
import jaJP from 'caomei-ui/locale/ja-jp'

export default defineNuxtPlugin(() => {
  registerLocale('ja-JP', jaJP)
})
```

### 时序与回退

- **先注册、后提供**：`registerLocale()` 须在 `provideLocale()` / `<CaomeiConfigProvider>` 之前调用；已创建的 provider **不会**因后续注册而重算，异步注册请先 `await` 注册完成再渲染 provider。
- **未注册即使用**：`locale` 指向未注册语言时**回落 `zh-CN`**（不抛错），并输出一条**非生产环境告警**，提示应引入的子路径与注册写法（`NODE_ENV === 'production'` 时静默；浏览器生产包中因 `globalThis.process` 无法被静态替换，告警代码仍会保留在产物内）。
- **类型不等于可用**：`CaomeiLocale` 表示「本库随包提供文案的语言」，把 `locale` 设为未注册的按需语言不会报类型错误，但运行期仍走上面的回落路径。

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

> 注意：`caomeiLocales` 是**已注册表**（初值只有预注册的 `zh-CN` / `en-US`），**不能**当作「内建语种清单」使用——按需语言须先引入子路径并注册，否则会静默回落 `zh-CN`（见「按需引入语言」）。可用性判断请用 `CaomeiLocale` 或 `PRE_REGISTERED_LOCALES`；下面的示例按序注册三门口径语言。

```ts
// app/plugins/caomei-locale.ts（Nuxt 插件形态）
import { registerLocale } from 'caomei-ui'
import jaJP from 'caomei-ui/locale/ja-jp'
import koKR from 'caomei-ui/locale/ko-kr'
import zhTW from 'caomei-ui/locale/zh-tw'

registerLocale('zh-TW', zhTW)
registerLocale('ja-JP', jaJP)
registerLocale('ko-KR', koKR)
```

```vue
<!-- app.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CaomeiConfigProvider, PRE_REGISTERED_LOCALES, defaultLocale, type CaomeiLocale } from 'caomei-ui'

const { locale } = useI18n()

// 已可用的语言 = 预注册集合 ∪ 上方已注册的按需语言；
// 判断「是否已注册」也可直接读 `caomeiLocales`（其键即已注册集合）。
const availableLocales: CaomeiLocale[] = [
  ...PRE_REGISTERED_LOCALES,
  'zh-TW',
  'ja-JP',
  'ko-KR',
]

const caomeiLocale = computed<CaomeiLocale>(() =>
  availableLocales.includes(locale.value as CaomeiLocale)
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

- 五门语言**注册后**均直接使用内建文案，无需再传 `messages`；`locale` 指向未注册语言时会回落 `zh-CN` 并给出非生产环境告警。
- 只需微调个别文案（如品牌措辞）时，仍可用 `messages` 做 minimal overrides：例如 `{ pagination: { label: '頁面' } }`，未覆盖的键回退该语种自身文案。
- `locale` 为 `computed`，vue-i18n 切换语言后 caomei-ui 内建文案随之更新，无需额外 `watch`。

## 约束与提示

- `messages` 的值必须是非空白字符串。例如向 `toast.label` 注入空白字符串会被 Reka `ToastProvider` 拒绝并抛错（`Invalid prop \`label\` supplied to \`ToastProvider\`. Expected non-empty \`string\`.`）；未覆盖的键请直接省略，不要传空串。
- 内建 `zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR` 五语；其中 `zh-CN` / `en-US` 随包根预注册，其余三门经 `caomei-ui/locale/<code>` 子路径按需引入（见「按需引入语言」）；本库之外的语种由下游注入，可为完整替换或部分覆盖。
- 新增组件文案须同步补齐全部内建语种：`pnpm check:locale-keys` 以 `zh-CN` 为基准校验命名空间、键集合与占位符（漏译 / 错键 / 漏写 `{page}` 一类占位符即失败），并按需语种逐条比对（不受「是否预注册」影响）。
- 组件内建文案与文档站 `docs/i18n` 的页面翻译互不影响；本页描述的是运行时文案注入。
- 相关阅读：[组合式 API](./composables.md)、[ConfirmDialog 确认对话框](/components/confirm-dialog)、[Paginator 分页](/components/paginator)。
