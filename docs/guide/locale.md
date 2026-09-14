# 内建文案与语言

部分组件的用户可见文案（无障碍名称、空态、按钮文案等）来自组件库内建文案，集中在 `src/locale`，默认语言为 `zh-CN`。

> 组件内建文案与文档站的多语言（`docs/i18n`）是两件事：前者是库在运行时使用的文案，后者是本站的页面翻译。

## 导出

```ts
import { caomeiLocales, defaultLocale, defaultLocaleMessages, type CaomeiLocale, type CaomeiLocaleMessages } from 'caomei-ui'

caomeiLocales['zh-CN'] // zh-CN 文案
caomeiLocales['en-US'] // en-US 文案
defaultLocale          // 'zh-CN'
defaultLocaleMessages  // 组件默认使用的 zh-CN 文案
```

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `caomeiLocales` | `Record<CaomeiLocale, CaomeiLocaleMessages>` | 内置文案资源（`zh-CN` / `en-US`） |
| `defaultLocale` | `CaomeiLocale` | 默认语言，当前为 `'zh-CN'` |
| `defaultLocaleMessages` | `CaomeiLocaleMessages` | 默认语言的文案对象 |
| `CaomeiLocaleMessages` | 接口 | 文案结构类型，可用于类型化自定义文案 |
| `CaomeiLocale` | 类型 | 内置语言标识，当前为 `'zh-CN' \| 'en-US'` |

## 文案分组

`CaomeiLocaleMessages` 覆盖以下组件域：`autoComplete`、`confirm`、`dialog`、`input`、`inputNumber`、`message`、`multiSelect`、`pagination`、`password`、`progress`、`slider`、`stepper`、`tag`、`table`、`toast`。

## 当前行为

组件当前固定消费 `defaultLocaleMessages`（`zh-CN`），**尚未提供运行时语言切换或注入机制**。因此在非中文环境下，这些内建文案仍显示为中文。

## 下游如何准备

- 现在可以导入 `caomeiLocales` 复用语种文案，或用 `CaomeiLocaleMessages` 为自定义文案建立类型。
- 文案注入机制与运行时切换尚未提供，规划属当前阶段的后续里程碑（Phase 7 M2）；届时下游可注入自定义 locale，并随 vue-i18n 等库的语言变化同步。规划中的 API 名称（`CaomeiConfigProvider` / `useLocale`）可能调整，以[待办事项](/plan/todo)与[路线图](/plan/roadmap)为准。
