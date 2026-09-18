# Migration from PrimeVue

This page is for teams moving from PrimeVue (v4) to caomei-ui: a practical migration path plus the pitfalls that come up most often.

> **The authoritative per-component mapping is [Design spec §7](/design/design-spec) (Chinese)** — this page covers the workflow, shared conventions and pitfalls only, and does not duplicate the mapping tables. Component pages carry a "Migration from PrimeVue" section at the end of the page (placement rule in [Documentation site §4](/design/documentation-site), Chinese).

## Migration workflow

1. **Coexistence**: caomei-ui and PrimeVue can live side by side — components use the `Caomei` prefix, classes `caomei-` and design tokens `--caomei-`, which do not collide with PrimeVue's `p-*` / `--p-*` namespaces. During migration, switch **page by page behind a route / page allowlist** so the regression surface stays controllable.
2. **Theme and tokens**: map the PrimeVue theme variables to this library's tokens (`--p-*` → `--caomei-*`) before replacing components; see [Theming and styles §4](/design/theming) (Chinese) for token semantics and override recipes. `caomei-ui/styles.css` ships the default light/dark themes and `data-preset` switches presets.
3. **Component replacement**: work through the mapping table in [Design spec §7](/design/design-spec) (Chinese), starting with the three highest-impact differences — controlled-field naming, icon form, and tone/size tiers (see the next section).
4. **Text and locale**: built-in strings (close / clear / pagination / loading, and so on) are injected through `CaomeiConfigProvider`, falling back to Simplified Chinese when nothing is provided; see [Built-in text and locales](/en-US/components/locale).
5. **Page-by-page verification**: after each page, check interaction, accessible names, narrow-screen behavior and dark mode; the narrow-screen acceptance criteria are in [Responsive design §4](/design/responsive) (Chinese).

## Common pitfalls

| Topic | PrimeVue | caomei-ui | What to do |
| --- | --- | --- | --- |
| Controlled fields | `v-model:visible` / `v-model:value` | `v-model:open` / `v-model` | Rename every controlled field, not just the component tag |
| Semantic color | `severity` | `tone` + `variant` | `secondary` / `contrast` → `neutral`; `info` → `primary` (lossy approximation) |
| Size tiers | `small` / `large` | `sm` / `lg` | Old tier names are rejected by the type checker |
| Icons | `icon="pi pi-x"` string class | `#icon` slot + an `@lucide/vue` component | String classes are not recognized; pass a component instead — see [Icons](/en-US/components/icons) |
| Overlay title | `header` | `title` | Rename on Dialog / Drawer and other overlays |
| Validation state | `class="p-invalid"` | `:invalid` | Replace the class with the controlled prop |
| Full width | `fluid` | `width: 100%` by default | Drop `fluid`; **the selector family also carries a `20rem` width cap** — set the matching cap token to `none` when you truly need full width (see §7 and [Theming and styles §4.1](/design/theming), Chinese). **Exception**: `Button` uses `block` (span the parent width) and `SplitButton` does not implement `fluid` (it sizes to its content) |
| Option fields | `option-label` / `option-value` | `optionLabel` / `optionValue` | Same semantics, different naming style |
| Searchable single select | `Select` + `filter` | Use `CaomeiAutoComplete` | Reka Select has no filter primitive (a search box inside the panel violates the ARIA structure); see §7 and [Backlog](/plan/backlog) (Chinese) |
| Event payloads | e.g. `Switch` `change` passes the native event | passes the resulting boolean | Same event name, different payload — update the handler signature |
| Slot naming | column-level `#body` / `#header` | `#cell-{key}` / `#header-{key}` | Named by column `key`; scope fields are documented on the component page |
| Imperative overlays | `ref.toggle(event)` / `show(event)` / `hide()` (anchored to the event coordinates) | Declarative trigger | Make the original trigger button itself the `CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger` (the anchor is that button); add `unstyled` when reusing a custom button with `as-child`, and replace `hide()` with a controlled `v-model:open` (Popover can also use `<CaomeiPopoverClose>`); see [Popover](/en-US/components/popover) and [DropdownMenu](/en-US/components/dropdown-menu) |
| Not implemented | — | see the "not implemented / not exposed" line of each component in §7 | Read that line first so you do not follow a PrimeVue API that has no effect here |

> The table above lists **shared** reminders. Whether a given component supports something, and whether a difference is intentional, is always decided by that component's entry in [Design spec §7](/design/design-spec) (Chinese).

## Per-component index

Every component in the table below has a registered mapping in [Design spec §7](/design/design-spec) (Chinese), grouped as in the component sidebar; each name links straight to its component page, whose "Migration from PrimeVue" section (at the **end of the page**, before `API`) holds the mapping table.

| Group | Components |
| --- | --- |
| Basics & Layout | [Avatar](/en-US/components/avatar), [Badge](/en-US/components/badge), [Button](/en-US/components/button), [Card](/en-US/components/card) (PrimeVue `Panel`), [Divider](/en-US/components/divider), [Image](/en-US/components/image), [SplitButton](/en-US/components/split-button), [Tag](/en-US/components/tag) |
| Form Inputs | [Checkbox](/en-US/components/checkbox) / [CheckboxGroup](/en-US/components/checkbox-group), [FileUpload](/en-US/components/file-upload), [FloatLabel](/en-US/components/float-label), [Input](/en-US/components/input), [InputGroup](/en-US/components/input-group), [InputNumber](/en-US/components/input-number), [Password](/en-US/components/password), [RadioGroup](/en-US/components/radio-group), [Slider](/en-US/components/slider), [Switch](/en-US/components/switch), [Textarea](/en-US/components/textarea) |
| Selectors | [AutoComplete](/en-US/components/auto-complete), [Calendar](/en-US/components/calendar) / [DatePicker](/en-US/components/date-picker), [ColorPicker](/en-US/components/color-picker), [MultiSelect](/en-US/components/multi-select), [Select](/en-US/components/select), [SelectButton](/en-US/components/select-button), [ToggleButton](/en-US/components/toggle-button) |
| Feedback & Overlays | [ConfirmDialog](/en-US/components/confirm-dialog), [Dialog](/en-US/components/dialog), [Drawer](/en-US/components/drawer), [Message](/en-US/components/message), [Popover](/en-US/components/popover), [Toast](/en-US/components/toast) |
| Data Display | [DataTable](/en-US/components/data-table), [DataView](/en-US/components/data-view), [Paginator](/en-US/components/paginator), [ProgressBar](/en-US/components/progress-bar), [ProgressSpinner](/en-US/components/progress-spinner), [Skeleton](/en-US/components/skeleton) |
| Navigation & Actions | [Accordion](/en-US/components/accordion), [DropdownMenu](/en-US/components/dropdown-menu), [Toolbar](/en-US/components/toolbar) |

> Where a component page's "Migration from PrimeVue" section disagrees with §7, **§7 wins** (drift is treated as a documentation defect). This table follows §7's currently registered components and **does not claim to be exhaustive** — it grows as §7 does. A component that is not listed here (for example [Tabs](/en-US/components/tabs), [Stepper](/en-US/components/stepper) or [ButtonGroup](/en-US/components/button-group)) is governed by §7 and by its own component page API / "Scope and conventions". The per-component "Migration from PrimeVue" sections are being filled in gradually.

## Post-migration checklist

- [ ] Every controlled field (`v-model:*`) and event name follows the convention above, and type checking passes;
- [ ] All string icon names are replaced with `@lucide/vue` components;
- [ ] PrimeVue-only naming (`severity` / `small` / `large` / `fluid`) is gone from templates, types and style overrides;
- [ ] Overlays (Dialog / Drawer / Popover / DropdownMenu) have been re-checked in a real page for open, close, mask, Esc and focus return;
- [ ] Narrow screens (≤640 / ≤768) and dark mode verified page by page, with no horizontal overflow and no missing text;
- [ ] Built-in text locale injected where needed (multi-language sites);
- [ ] Intentional differences on affected components have been reviewed in the UI (the list lives in §7).

## See also

- [Design spec §7: migration mapping](/design/design-spec) (Chinese; the authoritative per-component mapping)
- [Theming and styles](/design/theming) (Chinese; tokens and override recipes)
- [Responsive design](/design/responsive) (Chinese; narrow-screen acceptance criteria)
- [Icons](/en-US/components/icons), [Built-in text and locales](/en-US/components/locale)
- [Component overview](/en-US/components/)
