# ActionSheet

The action sheet slides up from the bottom to present a set of context actions. It is composed from [Drawer](./drawer) with `position="bottom"` and adds no new primitive.

## Basic usage

`v-model:open` controls visibility; `groups` renders grouped items, with a cancel item pinned at the bottom.

<demo
    vue="../examples/action-sheet/basic.vue"
    ssg="true"
/>

## Groups and destructive items

Each group may carry a `label`; items accept `value` / `description` / `danger` / `disabled`. Use `danger` for irreversible actions such as delete: it renders in the danger colour and the description states the consequence.

## Selection and closing

- Selecting an item emits `select(value, item)`; `closeOnSelect` defaults to `true`, closing after selection.
- The cancel label comes from `cancelLabel`, defaulting to the locale's "Cancel"; clicking emits `cancel` and closes.
- The default slot replaces the whole content area (and `groups` is then ignored).

## Focus and scrolling

- Focus moves into the panel on open and returns to the previously focused element on close (guaranteed by the underlying dialog semantics).
- The panel height is capped at `min(90dvh, 420px)`; when items overflow, the body scrolls vertically while the cancel item stays visible.

## Accessibility

- The panel renders with modal dialog semantics; without a visible title it still uses the locale's "Action panel" text as its accessible name.
- Items and the cancel action are native `button` elements; disabled items use the native `disabled` attribute.
- Focus returns to the trigger after closing; Esc and overlay-click behaviour follow Drawer.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-action-sheet-group-gap` | `--caomei-space-3` | Gap between groups |
| `--caomei-action-sheet-item-bg` | `--caomei-color-bg-elevated` | Item group background |
| `--caomei-action-sheet-item-min-height` | `control-height-lg + space-1` | Item / cancel height floor |
| `--caomei-action-sheet-divider` | `--caomei-color-border` | Item divider |
| `--caomei-action-sheet-radius` | `--caomei-radius-md` | Group / cancel corner radius |
| `--caomei-action-sheet-cancel-bg` | `--caomei-color-bg-elevated` | Cancel background |
| `--caomei-action-sheet-cancel-border` | `--caomei-color-border` | Cancel border |

> The table lists common override hooks, not every variable; other `--caomei-action-sheet-*` variables can be overridden too.

<ComponentApi name="action-sheet" />
