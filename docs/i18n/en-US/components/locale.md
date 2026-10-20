# Built-in text and locales

Some components show user-facing text (accessible names, empty states, button labels) that comes from the library's built-in messages, kept in `src/locale` and defaulting to `zh-CN`. An app can inject a locale and message overrides through `<CaomeiConfigProvider>` (or `provideLocale()`) and switch them at runtime.

> Built-in component text and the documentation site's i18n (`docs/i18n`) are two different things: the former is runtime text used by the library, the latter is page translation for this site.

## Exports

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

| Name | Type | Description |
| --- | --- | --- |
| `caomeiLocales` | `Partial<Record<CaomeiLocale, CaomeiLocaleMessages>>` | **Registered** message table: initial value = `PRE_REGISTERED_LOCALES`; other locales are added via `registerLocale` |
| `PRE_REGISTERED_LOCALES` | `readonly ['zh-CN', 'en-US']` (`as const` tuple) | Locales registered with the package root (usable without registration) |
| `registerLocale` | `(code: CaomeiLocale, messages: CaomeiLocaleMessages) => void` | Registers one built-in locale's messages (call before `provideLocale`; see "On-demand locales") |
| `defaultLocale` | `CaomeiLocale` | Default locale, currently `'zh-CN'` |
| `defaultLocaleMessages` | `CaomeiLocaleMessages` | Full message object of the default locale |
| `CaomeiLocale` | `'zh-CN' \| 'en-US' \| 'zh-TW' \| 'ja-JP' \| 'ko-KR' \| 'es-ES' \| 'fr-FR' \| 'de-DE' \| 'ru-RU' \| 'pt-BR'` | Built-in locale id (**not** the same as "registered": every locale except `zh-CN` / `en-US` must be imported and registered) |
| `CaomeiLocaleMessages` | interface | Full message shape, useful for typing custom messages |
| `CaomeiLocaleMessageOverrides` | `{ [K in keyof CaomeiLocaleMessages]?: Partial<CaomeiLocaleMessages[K]> }` | Per-namespace partial overrides |
| `CaomeiConfigProvider` | component | Renderless provider (default slot only); props: `locale` / `messages` |
| `provideLocale` | `(options?: ProvideLocaleOptions) => ComputedRef<CaomeiLocaleMessages>` | Provides messages and the locale id for non-component / custom-provider cases; must be called in setup |
| `useLocale` | `() => ComputedRef<CaomeiLocaleMessages>` | Reads the injected messages; falls back to `defaultLocaleMessages` when none are injected |
| `useLocaleCode` | `() => ComputedRef<CaomeiLocale>` | Reads the injected locale id; falls back to `defaultLocale` when none is injected |
| `caomeiLocaleKey` | `InjectionKey<ComputedRef<CaomeiLocaleMessages>>` | Message injection key, for custom providers |
| `caomeiLocaleCodeKey` | `InjectionKey<ComputedRef<CaomeiLocale>>` | Locale-id injection key, for custom providers |

## Message groups and consuming components

`CaomeiLocaleMessages` is split into 28 namespaces by component area, covering 29 consuming components (the table below is checked against `src/locale/types.ts` by `check-locale-ledger`):

| Namespace | Keys | Consuming component |
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

## Quick start

Place `<CaomeiConfigProvider>` once near the application root; components inside its default slot then consume the injected messages:

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

`messages` overrides the base locale per namespace, for example to customize the pagination name and confirm button text:

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

## On-demand locales

Built-in locales come in two groups: **pre-registered** and **on-demand**. Apps that use one or two locales do not have to bundle the rest. The tables below are checked against `src/locale/index.ts` by `check-locale-ledger`.

| Group | Locales | How to use |
| --- | --- | --- |
| Pre-registered (available from the package root) | `zh-CN`, `en-US` | Use `locale="en-US"` directly; see `PRE_REGISTERED_LOCALES` |
| On-demand | `zh-TW`, `ja-JP`, `ko-KR`, `es-ES`, `fr-FR`, `de-DE`, `ru-RU`, `pt-BR` | Import the subpath, then call `registerLocale()` |

Each subpath maps to a locale id (lowercase, hyphenated):

| Locale id | Subpath |
| --- | --- |
| `zh-TW` | `caomei-ui/locale/zh-tw` |
| `ja-JP` | `caomei-ui/locale/ja-jp` |
| `ko-KR` | `caomei-ui/locale/ko-kr` |
| `es-ES` | `caomei-ui/locale/es-es` |
| `fr-FR` | `caomei-ui/locale/fr-fr` |
| `de-DE` | `caomei-ui/locale/de-de` |
| `ru-RU` | `caomei-ui/locale/ru-ru` |
| `pt-BR` | `caomei-ui/locale/pt-br` |

Synchronous registration (recommended): register in the app entry, then mount the provider.

```ts
import { createApp } from 'vue'
import { registerLocale } from 'caomei-ui'
import jaJP from 'caomei-ui/locale/ja-jp'
import App from './App.vue'

registerLocale('ja-JP', jaJP)

createApp(App).mount('#app')
```

Asynchronous registration (lazy-loading a locale, switching at runtime):

```ts
import { registerLocale } from 'caomei-ui'
import type { CaomeiLocaleMessages } from 'caomei-ui'

const loaders = {
  'zh-TW': () => import('caomei-ui/locale/zh-tw'),
  'ja-JP': () => import('caomei-ui/locale/ja-jp'),
  'ko-KR': () => import('caomei-ui/locale/ko-kr'),
  'es-ES': () => import('caomei-ui/locale/es-es'),
  'fr-FR': () => import('caomei-ui/locale/fr-fr'),
  'de-DE': () => import('caomei-ui/locale/de-de'),
  'ru-RU': () => import('caomei-ui/locale/ru-ru'),
  'pt-BR': () => import('caomei-ui/locale/pt-br'),
} as const

export async function loadLocale(code: keyof typeof loaders): Promise<void> {
  const module = await loaders[code]()
  registerLocale(code, module.default as CaomeiLocaleMessages)
}
```

Nuxt: register in a plugin. The `caomei-ui/nuxt` module only handles component and composable auto-imports; it does not register locales.

```ts
// app/plugins/caomei-locale.ts
import { registerLocale } from 'caomei-ui'
import jaJP from 'caomei-ui/locale/ja-jp'

export default defineNuxtPlugin(() => {
  registerLocale('ja-JP', jaJP)
})
```

### Ordering and fallback

- **Register first, provide second**: call `registerLocale()` before `provideLocale()` / `<CaomeiConfigProvider>`. An already-created provider does **not** recompute after a later registration, so `await` the registration before rendering the provider when loading lazily.
- **Using an unregistered locale**: the locale falls back to `zh-CN` (no throw) and a **non-production warning** points to the subpath to import and the registration call (`NODE_ENV === 'production'` silences it; browser production bundles keep the warning code because `globalThis.process` cannot be statically replaced).
- **Type is not availability**: `CaomeiLocale` lists the locales the package ships messages for. Passing an unregistered on-demand locale type-checks fine but still follows the fallback path above.

## Merging and fallback

- **Shallow merge per namespace**: overrides are merged namespace by namespace onto the base locale; in the example above `pagination` only overrides `label` and keeps the base text for the remaining keys.
- **Default fallback**: when `locale` is omitted the base is `defaultLocaleMessages` (`zh-CN`); an unregistered locale id also falls back to `zh-CN`. **A built-in locale is its own base** (uncovered keys in `ja-JP`, for instance, fall back to Japanese rather than Chinese), and overrides are still shallow-merged per namespace.
- **Precedence**: built-in text resolves as "explicit props > injected locale"; for example `<CaomeiPaginator label="翻页" />` overrides the injected `pagination.label`, while `<CaomeiPaginator />` uses the injected text.
- `messages` only overrides text and never changes component behaviour; omit keys you do not cover.

## Runtime switching

`locale` / `messages` may be a `ref`, a `computed`, or a getter; the provider evaluates them with a computed, so consuming components update automatically:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiConfigProvider, type CaomeiLocale } from 'caomei-ui'

const locale = ref<CaomeiLocale>('zh-CN')
</script>

<template>
  <CaomeiConfigProvider :locale="locale">
    <button type="button" @click="locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'">
      Switch to {{ locale === 'zh-CN' ? 'English' : '中文' }}
    </button>
    <RouterView />
  </CaomeiConfigProvider>
</template>
```

## Without the component

Outside a component tree, or with a custom provider, call `provideLocale()` (it must be called in `setup`) and read the text with `useLocale()`:

```ts
import { computed, ref } from 'vue'
import { provideLocale, useLocale, type CaomeiLocale } from 'caomei-ui'

const locale = ref<CaomeiLocale>('en-US')
const overrides = computed(() => ({ pagination: { label: 'Pages' } }))

// call in setup; locale / messages accept a ref or getter
provideLocale({ locale, messages: overrides })

// read the injected messages in any descendant
const messages = useLocale()
```

## Downstream example: momei

momei is a Nuxt 4 + vue-i18n downstream project with five locales — `zh-CN` / `zh-TW` / `en-US` / `ja-JP` / `ko-KR` — all of which are built into caomei-ui (a subset of its ten locales). The example below maps vue-i18n's current locale to caomei-ui's `locale`, so switching the language takes effect immediately (caomei-ui does not depend on vue-i18n; this is only an integration demo).

> Note: `caomeiLocales` is the **registered table** (initially only the pre-registered `zh-CN` / `en-US`), so it must **not** be used as a "built-in locale list" — on-demand locales have to be imported and registered first, otherwise they silently fall back to `zh-CN` (see "On-demand locales"). Use `CaomeiLocale` or `PRE_REGISTERED_LOCALES` for availability checks; the example below registers three on-demand locales up front (the same applies to the rest).

```ts
// app/plugins/caomei-locale.ts (Nuxt plugin form)
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

// Available locales = pre-registered set ∪ the on-demand locales registered above;
// the registry keys (`caomeiLocales`) are exactly the registered set.
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

- Once registered, all five languages use the built-in text directly, so no `messages` are needed; a locale that is not registered falls back to `zh-CN` with a non-production warning.
- When only a few strings need adjusting (brand wording, for example), `messages` still works as a minimal override: `{ pagination: { label: '頁面' } }`, with uncovered keys falling back to that locale's own text.
- `locale` is a `computed`, so caomei-ui's built-in text updates as soon as vue-i18n switches language, with no extra `watch`.

## Constraints and notes

- Values in `messages` must be non-blank strings. For example, injecting a blank string for `toast.label` is rejected by Reka's `ToastProvider`, which throws (`Invalid prop \`label\` supplied to \`ToastProvider\`. Expected non-empty \`string\`.`); omit keys you do not cover instead of passing an empty string.
- Ten built-in locales: `zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR` / `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`. `zh-CN` and `en-US` are pre-registered with the package root; the other eight are imported on demand from `caomei-ui/locale/<code>` (see "On-demand locales"). Locales outside the library are injected by the downstream project, either as a full replacement or as partial overrides.
- New component text must be added to every built-in locale: `pnpm check:locale-keys` checks namespaces, key sets and placeholders against the `zh-CN` baseline (a missing translation, a stray key, or a dropped `{page}`-style placeholder fails the check), and compares the on-demand locales row by row as well (independent of whether they are pre-registered).
- Built-in component text and the documentation site's `docs/i18n` page translation do not affect each other; this page describes runtime message injection.
- See also: [Composables](/en-US/components/composables), [ConfirmDialog](/en-US/components/confirm-dialog), and [Paginator](/en-US/components/paginator).
