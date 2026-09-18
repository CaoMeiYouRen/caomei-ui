# FileUpload

The file upload component is built on the native `input[type=file]` and handles file selection (click / drag) and list management; it does not perform the transfer itself (with `customUpload` it emits `uploader` for the application to handle).

## Basic usage

Two-way bind the file list (`File[]`) with `v-model`; add files by clicking the select area or dragging files onto it.

<demo
    vue="../examples/file-upload/basic.vue"
    ssg="true"
/>

## Upload mode

`mode` controls the UI: `advanced` (default) renders the dropzone + file list, while `basic` renders a compact choose button + chosen-file text, replaces the list on every selection and renders neither dropzone nor list. In both modes the choose affordance text can be overridden with `chooseLabel`; otherwise the built-in locale is used.

## Size limit

`maxFileSize` limits a single file in bytes: over-limit files never enter `v-model` and a message is shown inside the component (text from the built-in locale, overridable through `CaomeiConfigProvider`'s `messages`). The message is cleared on the next selection, and rejected files do not affect the existing list.

## Auto and custom upload

The component performs no transfer: with `customUpload` it emits `uploader({ files })` and the application takes over; `auto` requests the upload right after selection — **`uploader` is only produced under `customUpload`**, so `auto` without it creates no upload request. When `auto` is off, trigger it manually through the exposed `upload()` (equivalent to PrimeVue's `ref.upload()`). `mode="basic"` + `custom-upload` + `auto` is the equivalent combination for migrating PrimeVue's basic usage.

<demo
    vue="../examples/file-upload/custom-upload.vue"
    ssg="true"
/>

## Multiple and type constraints

`multiple` allows selecting several files (when off, a new selection replaces the list); `accept` uses native syntax to constrain types and applies to both selection and drag-and-drop. Duplicate files (same name + size + last-modified) are de-duplicated.

> `accept` matches on `File.type`: when the browser does not provide it (unknown extension), MIME wildcards such as `image/*` cannot match, and only extensions (`.png`) and exact MIME types match.

<demo
    vue="../examples/file-upload/multiple.vue"
    ssg="true"
/>

## Disabled and custom list

`disabled` disables selection, drag-and-drop and removal; list items can be customized via the `#file` slot, whose parameter is `{ file, index, remove }`. The default slot can replace the prompt content (such as an icon only), in which case use `label` for the accessible name.

<demo
    vue="../examples/file-upload/states.vue"
    ssg="true"
/>

## Accessibility

- The select area is a native `<button>` (in `basic` mode the choose button), focusable and activatable via keyboard; the built-in prompt text carries its own accessible name, so use `label` for the accessible name (mapped to `aria-label`) only when the default slot is replaced with content that has no visible text (such as an icon only). When `label` is omitted, a forwarded `aria-label` is preserved.
- The file input is visually hidden with `tabindex="-1"` / `aria-hidden="true"` to avoid duplicate focus and redundant announcements.
- The remove button provides an accessible name that combines a removal prefix with the file name; the prefix is currently hard-coded and not localized (`advanced` mode only).
- The size-limit message is `role="alert"`, announced right after selection.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-file-upload-gap` | `--caomei-space-2` | Gap between the select area and the list |
| `--caomei-file-upload-padding` | `--caomei-space-4` | Select area padding |
| `--caomei-file-upload-border` | `--caomei-color-border` | Select area dashed border color |
| `--caomei-file-upload-bg` | `--caomei-color-bg` | Select area background color |
| `--caomei-file-upload-icon-size` | `24px` | Select area icon size |
| `--caomei-file-upload-item-bg` | `--caomei-color-bg-elevated` | List item background color |

> The component only handles selection and list management; chunking, resumable upload, progress and server errors are implemented in the application layer.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `accept` / `multiple` | Same names |
| `mode` | `mode` (defaults to `advanced`; `basic` renders a compact choose button + chosen-file text and replaces the list on every selection) |
| `chooseLabel` | `chooseLabel` (the button text in `basic`, the dropzone prompt in `advanced`; defaults to the built-in locale) |
| `maxFileSize` | `maxFileSize` (bytes; over-limit files never enter the list and a built-in message is shown) |
| `auto` | `auto` (requests the upload right after selection) |
| `customUpload` + `@uploader` | `customUpload` + `uploader` (the component performs no transfer; when `auto` is off, trigger it through the exposed `upload()`, equivalent to `ref.upload()`) |
| `@select` / `@remove` | `select` / `remove` (same payload shapes: `{ originalEvent, files }` / `{ file, files }`; `select.files` is the full list after the selection, and the unchanged current list when everything was rejected) |
| `@clear` | `clear` (emitted by the exposed `clear()`) |
| `name` | Forwarded to the inner `<input type="file">` (native form submission works) |
| — | `disabled`, `label` (accessible name) and the `#file` slot (custom list item) are new here |

**Not implemented (registered as a follow-up; this section will be updated when it ships)**: `url` / `withCredentials` and the default XHR transfer, the `before-upload` / `progress` / `upload` / `before-send` / `error` events, `fileLimit` / `invalidFileLimitMessage` / `invalidFileTypeMessage` (the over-limit text always comes from the built-in locale, with no prop override), `uploadLabel` / `cancelLabel` / `showUploadButton` / `showCancelButton` (no upload / cancel buttons) and `previewWidth` (no image thumbnails).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="file-upload" />
