# RichTextEditor

A **lightweight wrapper** around the third-party `md-editor-v3` Markdown editor: `v-model` binds the Markdown source, while the theme and language follow the host state automatically with no per-item wiring. The kernel is an **optional peer dependency**, loaded on demand.

## Basic usage

`v-model` binds the Markdown source (`string`); `height` sets the editor height, `placeholder` provides an empty-state hint and `label` renders the container's accessible name (`role="group"` + `aria-label`).

<demo
    vue="../../en-US/examples/rich-text-editor/basic.vue"
    ssg="true"
/>

## Theme and locale linkage

- **Theme**: the wrapper observes the root element's `.dark` / `.light` classes, `data-scheme="auto"` and the manually set `data-theme` — the same source of truth as `useTheme()` — and drives the editor's `theme` from it. Switching the host theme updates the editor in place, with no remount.
- **Locale**: the wrapper reads the host locale id through `useLocaleCode()` and maps it to the editor language key: `zh-CN` / `en-US` / `zh-TW` and `ko-KR` pass through, `ja-JP` maps to `jp-JP` (key renaming). The `zh-TW` / `ja-JP` / `ko-KR` texts are loaded on demand from `@vavt/cm-extension`. Changing `<CaomeiConfigProvider>`'s `locale` at runtime updates the editor language immediately.
- Unregistered locales fall back to `zh-CN` with a console warning; the `theme` prop is an escape hatch only, for bypassing the derivation.

## Read-only and preview

- `readonly` is read-only (preview / scroll / copy, but not edit); `disabled` disables the whole editor.
- `preview` (default `true`) controls the preview pane; `toolbars` customizes the toolbar items (the kernel's default toolbar is used when omitted).

## Image upload

`uploader` receives the picked image files (`File[]`) and returns the URLs to embed in the Markdown; when omitted, the kernel's built-in behavior applies (inlines the image as a data URL). `noUploadImg` disables the upload entry entirely. A failed upload does not throw; it calls back with an empty list and emits a console warning.

<demo
    vue="../../en-US/examples/rich-text-editor/upload.vue"
    ssg="true"
/>

## Scope

- **No in-house editor**: the kernel, toolbar and Markdown engine all come from `md-editor-v3`; this component does not reimplement them.
- Stays **Markdown**-only; no HTML rich-text mode.
- Does not override the editor's internal color tokens ("compatible theme" is deferred; trigger is a downstream report that the editor's visuals diverge from the host).
- No standalone read-only rendering component; use `readonly` for article display for now.

## Dependencies and styling

- `md-editor-v3` (kernel) is an **optional peer dependency**: install it before using this component (`pnpm add md-editor-v3`). `@vavt/cm-extension` (extra locale pack) ships with this library for `zh-TW` / `ja-JP` / `ko-KR`; no manual install needed.
- When `md-editor-v3` is not installed: **importing this component** fails at build time with "cannot resolve md-editor-v3" (Vite / Rolldown, measured 2026-09-30); consumers that **do not use this component** are unaffected (the package root does not statically import the kernel, so the module is tree-shaken away). The component's placeholder covers **runtime load failures** of the kernel (for example when SSR externalizes the peer, or the assets fail to load): it renders a `role="alert"` placeholder and emits a console warning.
- The kernel styles and texts are loaded **on demand** by the component (`md-editor-v3/lib/style.css` and friends); the host does not need to `import` them manually.
- Override hooks: `--caomei-rich-text-editor-radius` (radius), `--caomei-rich-text-editor-min-height` (placeholder min height).

## Migrating from mavon-editor

A downstream project currently uses `mavon-editor`, which required five manual compensations during integration (per-branch language mapping, `ko-KR` fallback, per-item dark backgrounds, patching internal methods, SSR isolation plus manual style imports). This component folds them into built-in linkage:

| mavon-editor integration | This component |
| --- | --- |
| `v-model` (Markdown source) | Same name (`string`) |
| `language` mapped branch by branch (`ja-JP → ja`, `ko-KR` unsupported and falling back to `en`) | Derived from the host `locale`, covering all five built-in locales (`ja-JP → jp-JP`) |
| `toolbarsBackground` / `editorBackground` / `previewBackground` injected per item | `theme` derived from the host dark state; no manual background injection |
| `patchMavonEditorComponent` overriding internal methods | Not needed (the kernel is a native Vue 3 implementation) |
| `defineAsyncComponent` + `.client.vue` + manual `import 'mavon-editor/dist/css/index.css'` | The component loads the kernel and styles on demand; SSR renders a placeholder and the kernel loads after client mount |

> **Known intentional difference**: this component is backed by `md-editor-v3`, so toolbar items, shortcuts and rendering details are not identical to `mavon-editor`; use this page's props table as the reference when migrating. PrimeVue ships no Markdown editor component, so there is no PrimeVue mapping entry.

<ComponentApi name="rich-text-editor" />
