# Built-in text and locales

Some components show user-facing text (accessible names, empty states, button labels) that comes from the library's built-in messages, kept in `src/locale` and defaulting to `zh-CN`.

> Built-in component text and the documentation site's i18n (`docs/i18n`) are two different things: the former is runtime text used by the library, the latter is page translation for this site.

## Exports

```ts
import { caomeiLocales, defaultLocale, defaultLocaleMessages, type CaomeiLocale, type CaomeiLocaleMessages } from 'caomei-ui'

caomeiLocales['zh-CN'] // zh-CN messages
caomeiLocales['en-US'] // en-US messages
defaultLocale          // 'zh-CN'
defaultLocaleMessages  // the zh-CN messages used by components by default
```

| Export | Type | Description |
| --- | --- | --- |
| `caomeiLocales` | `Record<CaomeiLocale, CaomeiLocaleMessages>` | Built-in message resources (`zh-CN` / `en-US`) |
| `defaultLocale` | `CaomeiLocale` | Default locale, currently `'zh-CN'` |
| `defaultLocaleMessages` | `CaomeiLocaleMessages` | Messages of the default locale |
| `CaomeiLocaleMessages` | Interface | Message shape, useful for typing custom messages |
| `CaomeiLocale` | Type | Built-in locale id, currently `'zh-CN' \| 'en-US'` |

## Message groups

`CaomeiLocaleMessages` covers these component areas: `autoComplete`, `confirm`, `dialog`, `input`, `inputNumber`, `message`, `multiSelect`, `pagination`, `password`, `progress`, `slider`, `stepper`, `tag`, `table`, `toast`.

## Current behaviour

Components currently consume `defaultLocaleMessages` (`zh-CN`) directly. There is **no runtime locale switching or injection mechanism yet**, so in a non-Chinese environment these built-in messages still render in Chinese.

## What downstream can do

- Today you can import `caomeiLocales` to reuse the messages, or use `CaomeiLocaleMessages` to type custom messages.
- The injection mechanism and runtime switching are not available yet; they are planned for a later milestone of the current phase (Phase 7 M2). Downstream will then be able to inject a custom locale and keep it in sync with vue-i18n or similar. The planned API names (`CaomeiConfigProvider` / `useLocale`) may change; refer to the [todo list](/plan/todo) and [roadmap](/plan/roadmap) (Chinese).
