# FileUpload

The file upload component is built on the native `input[type=file]` and handles file selection (click / drag) and list management; it does not handle the actual transfer.

## Basic usage

Two-way bind the file list (`File[]`) with `v-model`; add files by clicking the select area or dragging files onto it.

<demo
    vue="../examples/file-upload/basic.vue"
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

- The select area is a native `<button>`, focusable and activatable via keyboard; the built-in prompt text carries its own accessible name, so use `label` for the accessible name (mapped to `aria-label`) only when the default slot is replaced with content that has no visible text (such as an icon only). When `label` is omitted, a forwarded `aria-label` is preserved.
- The file input is visually hidden with `tabindex="-1"` / `aria-hidden="true"` to avoid duplicate focus and redundant announcements.
- The remove button provides an accessible name that combines a removal prefix with the file name; the prefix is currently hard-coded and not localized.

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
| `chooseLabel` | Customize the prompt through the default slot (no equivalent prop) |
| `@select` / `@upload` / `@remove` / `@progress` | Not implemented: the picked files are the `File[]` bound to `v-model` |
| `name` | Forwarded to the inner `<input type="file">` (native form submission works) |
| — | `disabled`, `label` (accessible name) and the `#file` slot (custom list item) are new here |

**Not implemented (registered as a follow-up; this section will be updated when it ships)**: `mode` (`basic` / `advanced`), `auto`, `maxFileSize` / `fileLimit`, `url` / `customUpload` / `withCredentials`, `uploadLabel` / `cancelLabel`, `showUploadButton` / `showCancelButton`, `invalidFileSizeMessage` / `invalidFileTypeMessage` / `invalidFileLimitMessage`, `previewWidth`.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="file-upload" />
