# Alert

An alert shows a **persistent inline** notice within a page (environment notes, configuration warnings, a summary of form errors). It is a **semantic preset wrapper** around [Message](./message): appearance, palette tokens and `--caomei-message-*` override hooks are **fully reused**; the only differences are the **semantics and a narrowed API** (static tier, no `simple` variant).

## Basic usage

A persistent notice has no close button by default; provide content via `title` + `description` (or the default slot).

<demo
    vue="../examples/alert/basic.vue"
    ssg="true"
/>

## Variants and tones

`tone` accepts `neutral` / `primary` / `success` / `warning` / `danger`; `variant` accepts `soft` (default) / `solid` / `outline` — **`simple` is absent**: the inline, chrome-free form belongs to field-level validation hints, so use `CaomeiMessage` directly. `closable` shows a close button and emits `close`; `#actions` carries actions.

<demo
    vue="../examples/alert/variants.vue"
    ssg="true"
/>

## The static tier: role and live region trade-off

**An alert renders no `role` by default and stays out of any live region** (internally it uses `CaomeiMessage`'s `role="none"` tier). Why:

- A persistent notice already exists in the document when the page loads, so screen readers reach it in normal reading order and no live region is needed; a live region announces **when it is established and whenever its content changes** — a persistent notice has no "newly inserted" semantics, and when its text does change (a status refresh, say) the page is better placed to announce it in context.
- `role` should therefore be reserved for content that is **newly inserted** by an interaction or an async result — which is exactly the remit of `CaomeiMessage` (`role="status"` by default, switchable to `alert`) and `CaomeiToast`.

| Scenario | Use | Announced |
| --- | --- | --- |
| Present at page load and long-lived (environment notes / config warnings) | `CaomeiAlert` | No (static tier, read in document order) |
| Result feedback after an interaction such as a submit | `CaomeiMessage` | Yes (`role="status"`, switchable to `alert`) |
| Global async results unrelated to page position | `CaomeiToast` | Yes (live region in the viewport) |

> Element Plus's `el-alert` **always** emits `role="alert"`; this library hands the announcement decision back to the consumer (off by default) — see the migration table below.

## Alert vs Message vs Toast

| | Alert (this component) | Message | Toast |
| --- | --- | --- | --- |
| Semantics | Persistent **inline** notice | In-place **feedback** message | Global **brief** notice |
| Live region | **No** (static tier) | Yes (`status` default / `alert`) | Yes |
| Position | In place (document flow) | In place (document flow) | Fixed viewport corner (overlay) |
| Lifecycle | Persistent, page-controlled | Page-controlled | Auto-dismiss (pausable on hover) |
| Visual variants | `soft` / `solid` / `outline` | Those three plus `simple` | — |
| Service-style call | None (declarative) | None (declarative) | `useToast()` |

## Style customization

The public surface is exactly the seven props and three slots listed above; `CaomeiMessage`'s `size` (`sm` / `md` / `lg`) is **not part of it and is explicitly filtered out** (so that no capability works at runtime while being inexpressible in the types). Use `CaomeiMessage`, or override `--caomei-message-font-size`, when a size tier is needed.

This component **carries no appearance of its own**: styles and override hooks all come from `CaomeiMessage` (`--caomei-message-padding-block` / `--caomei-message-padding-inline` / `--caomei-message-radius` / `--caomei-message-font-size`, and others), and the root additionally carries a `caomei-alert` class for downstream targeting. Colours come from the global semantic tokens (`--caomei-color-<tone>` and `--caomei-color-<tone>-solid` for the `solid` variant).

Body-text contrast (14px regular, WCAG AA requires ≥ 4.5:1) is verified cell by cell by `test/e2e/alert-contrast.e2e.ts` in a real Chromium against the **actual composited background**: 5 tones × 3 variants × light / dark.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| No standalone `Alert` (its `Message` covers that shape) | This library splits it into `CaomeiMessage` (feedback, announced) and `CaomeiAlert` (persistent inline preset sharing the same appearance layer) |
| `severity` | `tone` (`error` → `danger`, `info` → `primary`, `warn` / `warning` → `warning`, `secondary` / `contrast` → `neutral`) |
| `variant="outlined"` / `"simple"` | `variant="outline"` / **`simple` is not provided** (use `CaomeiMessage` instead) |
| `closable` | `closable` (plus `closeLabel` for the accessible name) |
| `#icon` | `#icon` (pass an `@lucide/vue` component, not a string icon class) |
| `#default` (content) | Default slot (or `description`) |

**Known intentional differences**: ① this library splits Message / Alert into two exports — `CaomeiAlert` only narrows the semantics and API while reusing `CaomeiMessage`'s appearance and tokens, so there is no second skin; ② an alert stays **out of any live region** by default (PrimeVue's message shape is always a live region); use `CaomeiMessage` when announcements are needed; ③ no `simple` inline form.

### Differences from Element Plus `el-alert` / Vuetify `v-alert`

| Element Plus / Vuetify | This component |
| --- | --- |
| `<el-alert title description type="info \| success \| warning \| error">` | `title` / `description` / `tone` (`info` → `primary`, `error` → `danger`) |
| `effect="light"` / `"dark"` | `variant="soft"` (default, light fill) / `variant="solid"` (solid fill) |
| `show-icon` | `icon` (default `true`) |
| `closable` / `close-text` | `closable` / `closeLabel` (accessible name) |
| `#title` slot | **Not provided**: the title comes from the `title` prop |
| `#default` slot | Default slot |
| `center` (centred layout) | **Not provided**: override with your own CSS |
| Always emits `role="alert"` | **No `role`** by default (static tier); switch to `CaomeiMessage` when announcements are needed |
| `v-alert type="error"` etc. | Mapped to `tone` as above |

<ComponentApi name="alert" />
