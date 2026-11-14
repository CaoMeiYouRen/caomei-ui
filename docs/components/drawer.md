# Drawer 抽屉

抽屉从页面边缘滑出，用于承载次要内容、设置面板或导航；封装 Reka UI 的 Dialog primitive，并提供四向 `position`。

## 基础用法

通过 `v-model:open` 控制显隐，`title` 作为无障碍名称，底部操作放入 `footer` 插槽。

<demo
    vue="../examples/drawer/basic.vue"
    ssg="true"
/>

## 方向

通过 `position` 切换 `left` / `right` / `top` / `bottom`，默认 `left`；`left` / `right` 控制宽度，`top` / `bottom` 控制高度。

<demo
    vue="../examples/drawer/positions.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换 `sm` / `md` / `lg`（默认 `md`），对应 320 / 420 / 560px 的宽度（`left` / `right`）或高度（`top` / `bottom`）；超长时按 `90vw` / `90vh` 收敛。需要精确宽度时直接传入 `style`（如 `:style="{ width: '600px' }"`），内联样式优先于档位。

## 自定义头部

`#header` 插槽替换标题区域的内容，关闭按钮仍保留；此时 `title` 转为仅供读屏器使用的可访问名，因此使用 `#header` 时建议同时传入 `title`。

<demo
    vue="../examples/drawer/custom-header.vue"
    ssg="true"
/>

## 行为选项

- `closable`：是否显示关闭按钮，默认 `true`；关闭按钮内建提示默认开启（内容取 `closeLabel`，不影响 `aria-label` 与关闭行为；整体关闭提示需先在根部放置 `CaomeiTooltipProvider` 并设 `disabled`）。
- `closeOnOverlay`：点击遮罩是否关闭，默认 `true`。
- `closeOnEsc`：按下 Esc 是否关闭，默认 `true`；提示打开时先按 Esc 关闭提示，再按 Esc 关闭抽屉。
- `modal`：是否为模态，默认 `true`；模态会锁定页面滚动并阻止背景交互，`modal="false"` 时不渲染遮罩且页面可滚动。

<demo
    vue="../examples/drawer/behaviors.vue"
    ssg="true"
/>

## 无障碍

- `title` 作为 `aria-labelledby` 指向的可访问名；未提供时回退内建 locale 文案（仅用于读屏器，不显示可见标题，与 PrimeVue 一致）。
- `description` 建立 `aria-describedby` 关联。
- 关闭按钮使用内建多语言标签，可通过 `closeLabel` 覆盖；该文案同时作为关闭按钮的内建提示内容。
- 模态抽屉由 primitives 负责焦点陷阱与滚动锁。

> **已知取舍（嵌套浮层）**：抽屉内再打开一层 Dialog / Drawer / ConfirmDialog 时，子层遮罩（1000）在父层内容（1001）之下，父层内容不会被压暗，但已被拦截、**不可交互**；父层已打开的浮层面板（1050）会高于子层内容（1001）且保持可见，但它随 `body` 的 modal 锁一并 `pointer-events: none`——**可见但不可点**，点击该区域会先关闭子层、再落到随后暴露的面板选项。关闭顺序、焦点隔离与滚动锁仍按「只关最上层」工作。评估与若实现的方案见 [嵌套遮罩层级评估](../design/governance/2026-11-15-phase34-m2-1-nested-overlay-layering.md)。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `v-model:visible` | `v-model:open` |
| `header` | `title`（或 `#header` 插槽；插槽替换标题区域，关闭按钮保留） |
| `position` | `position`（四向；**默认对齐 PrimeVue 的 `left`**） |
| `dismissable` | `closeOnOverlay` |
| `show-close-icon` | `closable` |
| `close-on-escape` | `closeOnEsc` |
| `#footer` | `#footer`（底部操作区插槽，同名） |
| `modal` | `modal`（本库 `modal="true"` 同时锁定页面滚动，比 PrimeVue 更严格） |
| 经 `style` 传宽度 | `size`（本库新增 `sm` / `md` / `lg` ＝ 320 / 420 / 560px，按视口收敛） |

**未实现 / 未暴露**：`position="full"`；`show` / `before-hide` / `hide` / `after-show` / `after-hide` 事件；`#closebutton` / `#closeicon` / `#container` 插槽；`base-z-index` / `auto-z-index` / `close-button-props` / `close-icon`；层级固定为遮罩 1000 / 面板 1001、关闭按钮形态固定；`position="full"` 与生命周期事件 / 容器插槽均**零下游用量**（完整口径见[设计规范 §7](../design/design-spec.md)）。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="drawer" />
