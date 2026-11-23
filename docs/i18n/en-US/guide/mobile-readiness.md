# Mobile readiness matrix

> For consumers and maintainers: every public component page with its 320 / 390 / 768 shape, fallback strategy and known limits. The **single source of truth** for behaviour is [Responsive design §3](/design/responsive) (Chinese); this page only maps it per page and records gaps.

## How this table is built

- Rows = every component page under `docs/components/` (**72 rows**, excluding the overview `index`, `composables`, `icons`, `locale` and `showcase`).
- Data comes from **the §3 behaviour patterns plus a source-code check**; items not measured separately say so in the Known limits column instead of claiming a measurement.
- Viewports: 320 (an interior point of the sm step) / 390 (mobile matrix) / 768 (tablet matrix); desktop (≥1024) is noted only where the row differs.
- Counts: **56 rows** carry a §3 pattern (Source gives the number) and **16 rows** have no dedicated rule (follow the container); the former 7 "source rule, not in §3" rows were back-filled into §3 #22 ~ #26 on 2026-11-23. The Toast height cap (`100vh` / `100dvh`) and the Image preview layer (`90vw` / `90vh`) do not form a separate behaviour pattern (other viewport-relative sizing is registered as #1 / #2 / #20) and follow the `dvh` wording and safe-area tokens in [Mobile and responsive](/en-US/guide/mobile).
- Count reconciliation: the registration estimate counted pages with page-level mobile prose (30 + 41 = 71); this table maps §3 patterns plus source rules and yields 72 (NavBar is the 72nd page added in Phase 41). The two sets differ; see the note at the end.

## Matrix

| Component | 320 | 390 | 768 | Fallback | Known limits | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `accordion` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `action-sheet` | min(90dvh, 420px); body scrolls | same | same | Bottom panel + safe area | — | §3 #20 |
| `alert` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `auto-complete` | Panel = max(trigger, content) and ≤ available width | same | min-width = trigger width | Panel converges; options ellipsized | — | §3 #4 / #16 |
| `avatar` | Adapts to the container | same | same | Follows the container | — | §3 #15 |
| `back-top` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `badge` | Adapts to the container | same | same | Follows the container | — | §3 #15 |
| `breadcrumb` | Hit area ≥24×24 (visual box unchanged) | same | — | Invisible extension | P0 / P1 / P2 delivered | §3 #16 |
| `button` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `button-group` | Toolbar wraps; group scrolls horizontally | group scrolls (≤1024) | Toolbar single line; group scrolls | Wrap or scroll, members never clipped | 769–1023 is a no-breakpoint range | §3 #7 |
| `calendar` | Panel stays in the viewport, scroll fallback | same | content-sized | Available width / height + scroll | Inline calendar overflows under 198px container | §3 #6 |
| `card` | Adapts to the container | same | same | Follows the container | — | §3 #15 |
| `cascader` | Panel max-width = min(40rem, 80vw) | same | same | Converges to 80vw | — | §3 #24 |
| `cell` | Row height ≥44; single-line truncation; tabs share width | same | same | Touch density 52 | — | §3 #19 |
| `cell-group` | Row height ≥44; single-line truncation; tabs share width | same | same | Touch density 52 | — | §3 #19 |
| `chart` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `checkbox` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14 / #16（口径 · §3 未逐条登记） |
| `checkbox-group` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14（口径 · §3 未逐条登记） |
| `col` | Breakpoint span/offset/order overrides | same (md step) | 24 columns default | Narrow steps override wide | — | §3 #18 |
| `color-picker` | min(260px, available width) | 260px | 260px | Fixed panel narrows | — | §3 #5 |
| `confirm-dialog` | Dialog narrows (100vw − 2×space-4) | min(90vw, 480/400px) | min(90vw, preset width) | Width follows the viewport; footer wraps | — | §3 #1 |
| `data-table` | Container scrolls horizontally; header stays on one line | same | column widths | Horizontal scroll | Card layout is the consumer’s job | §3 #9 / #16 |
| `data-view` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `date-picker` | Panel stays in the viewport, scroll fallback | same | content-sized | Available width / height + scroll | Inline calendar overflows under 198px container | §3 #6 |
| `descriptions` | Forced single column ≤640 | Forced single column ≤640 | Multiple columns | Media query switches to one column | — | §3 #26 |
| `dialog` | Dialog narrows (100vw − 2×space-4) | min(90vw, 480/400px) | min(90vw, preset width) | Width follows the viewport; footer wraps | — | §3 #1 / #17 |
| `divider` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `drawer` | Inline min(90vw, size); block min(90vh, size) | same | same | Narrows by viewport ratio | — | §3 #2 |
| `dropdown-menu` | Panel ≤ available width; long options ellipsized | same | content-driven (min-width 9rem) | Panel stays within available width | — | §3 #3 |
| `empty` | Title / description wrap, no horizontal overflow | same | same | Only padding tightens | — | §3 #21 |
| `file-upload` | File name min-width:0 + ellipsis | same | same | Long text ellipsized | — | §3 #13 |
| `float-label` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14（口径 · §3 未逐条登记） |
| `form` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14（口径 · §3 未逐条登记） |
| `image` | Adapts to the container | same | same | Follows the container | — | §3 #15 |
| `input` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14 / #16 |
| `input-group` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14（口径 · §3 未逐条登记） |
| `input-number` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14 |
| `input-otp` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14（口径 · §3 未逐条登记） |
| `menu` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `message` | Adapts to the container | same | same | Follows the container | — | §3 #15 / #16 |
| `multi-select` | Panel = max(trigger, content) and ≤ available width | same | min-width = trigger width | Panel converges; options ellipsized | — | §3 #4 / #16 |
| `nav-bar` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `paginator` | Wraps automatically | same | single line | Wraps | — | §3 #11 |
| `password` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14（口径 · §3 未逐条登记） |
| `popconfirm` | Panel width = min(20rem, available width) | same | same | Converges to available width | — | §3 #23 |
| `popover` | Panel max-width = min(20rem, available width), scrollable | same | same | Portal panel converges to available width | — | §3 #23 |
| `progress-bar` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `progress-spinner` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `radio-group` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14 / #16（口径 · §3 未逐条登记） |
| `rating` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14（口径 · §3 未逐条登记） |
| `result` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `rich-text-editor` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `row` | Breakpoint span/offset/order overrides | same (md step) | 24 columns default | Narrow steps override wide | — | §3 #18 |
| `select` | Panel = max(trigger, content) and ≤ available width | same | min-width = trigger width | Panel converges; options ellipsized | — | §3 #4 / #16 |
| `select-button` | Options wrap, share the row, no vertical clipping | same as mobile | single line, equal width | Wrap + auto height | Very long options still overflow at 320 | §3 #8 |
| `skeleton` | Adapts to the container | same | same | Follows the container | — | §3 #15 |
| `slider` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14 / #16 |
| `split-button` | Toolbar wraps; group scrolls horizontally | group scrolls (≤1024) | Toolbar single line; group scrolls | Wrap or scroll, members never clipped | 769–1023 is a no-breakpoint range | §3 #7 |
| `stepper` | Compresses with the container (no auto direction) | same | equal-width horizontal | Consumer switches to vertical | No automatic direction change; degrades in very narrow containers (not fixed for now, see Backlog §1.5) | §3 #10 |
| `switch` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14 / #16（口径 · §3 未逐条登记） |
| `tabbar` | Row height ≥44; single-line truncation; tabs share width | same | same | Touch density 52 | — | §3 #19 |
| `tabs` | List scrolls horizontally | same | single line | Horizontal scroll | — | §3 #12 |
| `tag` | Adapts to the container | same | same | Follows the container | — | §3 #15 / #16 |
| `tags-input` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14 / #16（口径 · §3 未逐条登记） |
| `textarea` | width:100%, capped by the container | same | default max-width token | Follows the container | — | §3 #14（口径 · §3 未逐条登记） |
| `time-picker` | Panel converges to available width / height, scrollable | same | same | Portal panel converges to available size | — | §3 #25 |
| `timeline` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `toast` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `toggle-button` | Follows the container | Follows the container | Follows the container | No dedicated narrow-screen rule; width follows the container and overflow is the consumer’s to constrain | Not measured separately | No dedicated rule |
| `toolbar` | Toolbar wraps; group scrolls horizontally | group scrolls (≤1024) | Toolbar single line; group scrolls | Wrap or scroll, members never clipped | 769–1023 is a no-breakpoint range | §3 #7 |
| `tooltip` | Panel max-width = min(20rem, available width) | same | same | Converges to available width | — | §3 #23 |
| `transfer` | Stacks vertically (two columns → one) | stacked | two columns | Single column ≤640 + actions in a row | — | §3 #22 |

## Known gaps and usage advice

- The 16 "follows the container" rows have no dedicated narrow-screen rule: readability at narrow widths depends on your container, so self-test the key pages at 320.
- The former 7 "source rule, not in §3" registration gaps were back-filled into §3 on 2026-11-23: `transfer` (#22), `popover` / `popconfirm` / `tooltip` (#23), `cascader` (#24), `time-picker` (#25) and `descriptions` (#26); the Source column now points at pattern numbers. Adding a component page from now on requires updating this table, and §3 when that component has a dedicated behaviour.
- Intentional inner scrolling: ButtonGroup / SplitButton / Tabs / DataTable (container scrolls horizontally, members are never clipped).
- Consumer responsibilities: DataTable card layout, full-screen Dialog, Stepper direction change, over-long option widths.
- Touch targets (§3 #16) are marked on the rows they cover; unmarked components are outside that pattern.

## Note on the figures

- The registration estimate (30 / 41) counted pages whose body contains mobile prose; these counts cover §3 patterns plus source rules. The two sets differ, hence the different totals.
- Adding a component page requires updating this table (one row) and §3 (when it has a dedicated behaviour); the row set can be reconciled with a script (all `docs/components/*.md` minus five non-component pages).

## Related

- [Responsive design §3 narrow-screen matrix](/design/responsive) (Chinese)
- [Mobile and responsive](/en-US/guide/mobile)
