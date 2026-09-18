# Built-in text and locales

Some components show user-facing text (accessible names, empty states, button labels) that comes from the library's built-in messages, kept in `src/locale` and defaulting to `zh-CN`. An app can inject a locale and message overrides through `<CaomeiConfigProvider>` (or `provideLocale()`) and switch them at runtime.

> Built-in component text and the documentation site's i18n (`docs/i18n`) are two different things: the former is runtime text used by the library, the latter is page translation for this site.

## Exports

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

| Name | Type | Description |
| --- | --- | --- |
| `caomeiLocales` | `Record<CaomeiLocale, CaomeiLocaleMessages>` | Built-in message resources (`zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR`) |
| `defaultLocale` | `CaomeiLocale` | Default locale, currently `'zh-CN'` |
| `defaultLocaleMessages` | `CaomeiLocaleMessages` | Full message object of the default locale |
| `CaomeiLocale` | `'zh-CN' \| 'en-US' \| 'zh-TW' \| 'ja-JP' \| 'ko-KR'` | Built-in locale id |
| `CaomeiLocaleMessages` | interface | Full message shape, useful for typing custom messages |
| `CaomeiLocaleMessageOverrides` | `{ [K in keyof CaomeiLocaleMessages]?: Partial<CaomeiLocaleMessages[K]> }` | Per-namespace partial overrides |
| `CaomeiConfigProvider` | component | Renderless provider (default slot only); props: `locale` / `messages` |
| `provideLocale` | `(options?: ProvideLocaleOptions) => ComputedRef<CaomeiLocaleMessages>` | Provides messages for non-component / custom-provider cases; must be called in setup |
| `useLocale` | `() => ComputedRef<CaomeiLocaleMessages>` | Reads the injected messages; falls back to `defaultLocaleMessages` when none are injected |
| `caomeiLocaleKey` | `InjectionKey<ComputedRef<CaomeiLocaleMessages>>` | Injection key, for custom providers |

## Message groups and consuming components

`CaomeiLocaleMessages` is split into 25 namespaces by component area, covering 26 consuming components:

| Namespace | Keys | Consuming component |
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
| `table` | `empty` `selectAll` `selectRow` | DataTable |
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

momei is a Nuxt 4 + vue-i18n downstream project with five locales — `zh-CN` / `zh-TW` / `en-US` / `ja-JP` / `ko-KR` — the same set caomei-ui builds in. The example below maps vue-i18n's current locale to caomei-ui's `locale`, so switching the language takes effect immediately (caomei-ui does not depend on vue-i18n; this is only an integration demo).

```vue
<!-- app.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CaomeiConfigProvider, caomeiLocales, defaultLocale, type CaomeiLocale } from 'caomei-ui'

const { locale } = useI18n()

// the built-in ids come from the registry instead of a hand-written list; ids added downstream fall back to the default locale
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

- All five languages use the built-in text directly, so no `messages` are needed.
- When only a few strings need adjusting (brand wording, for example), `messages` still works as a minimal override: `{ pagination: { label: '頁面' } }`, with uncovered keys falling back to that locale's own text.
- `locale` is a `computed`, so caomei-ui's built-in text updates as soon as vue-i18n switches language, with no extra `watch`.

## Constraints and notes

- Values in `messages` must be non-blank strings. For example, injecting a blank string for `toast.label` is rejected by Reka's `ToastProvider`, which throws (`Invalid prop \`label\` supplied to \`ToastProvider\`. Expected non-empty \`string\`.`); omit keys you do not cover instead of passing an empty string.
- `zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR` are built in; other locales are injected by the downstream project, either as a full replacement or as partial overrides.
- New component text must be added to every built-in locale: `pnpm check:locale-keys` checks namespaces, key sets and placeholders against the `zh-CN` baseline (a missing translation, a stray key, or a dropped `{page}`-style placeholder fails the check).
- Built-in component text and the documentation site's `docs/i18n` page translation do not affect each other; this page describes runtime message injection.
- See also: [Composables](/en-US/components/composables), [ConfirmDialog](/en-US/components/confirm-dialog), and [Paginator](/en-US/components/paginator).
