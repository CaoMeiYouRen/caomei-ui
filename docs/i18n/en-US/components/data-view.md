# DataView

A data view shows one dataset in either list or grid layout: `layout` decides whether the `list` or `grid` slot renders, while the item structure and grid columns come from the slot content. Built in-house, without Reka UI.

## Basic usage

`value` is the item list and `layout` selects the layout (default `list`); the `#list` / `#grid` slots receive `{ items }`, and the content is laid out by the consumer.

<demo
    vue="../examples/data-view/basic.vue"
    ssg="true"
/>

## Switching layout

`layout` is a controlled prop, so it composes with any segmented control to switch between list and grid. The `#header` and `#footer` slots render outside the content area, which suits layout switches, filters or summary information.

<demo
    vue="../examples/data-view/layouts.vue"
    ssg="true"
/>

## Loading and empty states

When `loading` is true the component shows the loading text and marks the root with `aria-busy`, taking precedence over content and the empty state. When `value` is an empty array or not provided it renders the empty state; the default text comes from the built-in locale and can be replaced with `emptyText` or fully customized through the `#empty` slot.

<demo
    vue="../examples/data-view/states.vue"
    ssg="true"
/>

## Slots

| Slot | Params | Description |
| --- | --- | --- |
| `header` | — | Header area, rendered outside the content area |
| `footer` | — | Footer area, rendered outside the content area |
| `list` | `{ items }` | Content for `layout="list"` |
| `grid` | `{ items }` | Content for `layout="grid"` |
| `empty` | `{ layout }` | Empty-state content; renders `emptyText` by default |

> Only the slot matching the current `layout` renders: with `layout="grid"` and no `#grid` slot the content area stays empty (it does not fall back to `#list`).

> Migration mapping (PrimeVue → caomei-ui): `value` → `value` (`null` and an empty array both count as empty); `layout` → `layout` (default `list` on both sides, values `list` / `grid`); `#list` / `#grid` / `#empty` / `#header` / `#footer` → slots of the same name, with `#list` / `#grid` also receiving `{ items }` and `#empty` additionally receiving `layout`. **Known difference**: PrimeVue v4 `DataView` has no `loading` prop (the official guidance is to use a skeleton for the busy state), so a `:loading` binding currently has no effect; this component provides `loading` and `loadingText`. PrimeVue's `grid` mode only swaps the root class and the slot without providing columns (the docs ask for a CSS grid library such as Tailwind), and this component likewise leaves columns to the consumer's content layer; PrimeVue reads its empty text from the global `config.locale.emptyMessage`, while this component uses the built-in `dataView.empty` entry, overridable via `emptyText` / `#empty`. **Not implemented (no downstream usage)**: pagination (`paginator` / `rows` / `first` / `totalRecords` / `alwaysShowPaginator` / `paginatorPosition` / `paginatorTemplate` / `pageLinkSize` / `rowsPerPageOptions` / `currentPageReportTemplate`), sorting (`sortField` / `sortOrder`), `lazy`, `dataKey`, and the `#paginatorcontainer` / `#paginatorstart` / `#paginatorend` slots.

## Accessibility

- While `loading` is true the root carries `aria-busy="true"`, and the loading text defaults to the built-in locale's "Loading" entry, overridable via `loadingText`.
- The empty-state text is localized by default and can be replaced with `emptyText` or `#empty`.
- A layout switch belongs to the consumer's content layer; give its control an accessible name (the `label` in the example).

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `value` | `value` (`null` and empty arrays both count as empty) |
| `layout` | `layout` (also defaults to `list`) |
| `#list` / `#grid` / `#empty` / `#header` / `#footer` | Same-named slots (`#list` / `#grid` receive `{ items }`, `#empty` also receives `layout`) |
| `:loading` (PrimeVue has no such prop, passing it has no effect) | `loading` / `loadingText` (new here; the root gets `aria-busy` while loading) |

**Not implemented**: pagination (`paginator` / `rows` / `first` / `totalRecords` and the paginator slots), sorting (`sortField` / `sortOrder`), `lazy`, `dataKey`; grid columns are up to the content layer (PrimeVue does not ship them either); see [Design spec §7](/design/design-spec.md) for the full prop / slot list.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="data-view" />
