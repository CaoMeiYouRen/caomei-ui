# Phase 43 M2-1：`CaomeiButton` 未启用提示时恢复单元素根

> 创建时间：2026-11-24
> 触发：Phase 43 登记批次的 M2-1（[登记批次](./2026-11-24-phase43-registration.md) §2）；上游依据为 [1.4.0 下游升级反馈研判](./2026-11-23-caomei-ui-1.4.0-downstream-feedback.md) §4「`CaomeiButton` 根节点父级 scoped 样式失效」。

## 1. 范围与验收

- **范围**：`tooltip` 未启用（且无可见文本触发包装）时，`CaomeiButton` 的组件根元素恢复到 1.3.0 的形态——即父组件 `data-v-*` 能落到 `<button>` 上；`tooltip` 启用分支维持包装（触发器 + 面板两层节点）。
- **非目标**：不改 `tooltip` 契约、不改 Button 的 props 语义、不改浮层隔离整体策略、不为发版专门改业务代码。
- **验收**：父级 scoped 属性落点 / 禁用态 / 父级 `v-show` / 提示启用分支维持；`pnpm test`、定向 E2E、`pnpm test:visual` 通过。

## 2. 根因与修法

- **根因**：`button.vue` 恒经 `Passthrough`（`:is` 动态包装）渲染；`Passthrough` 的 render 返回插槽数组，在 vnode 层是 **Fragment**。Vue 运行时的 scoped 属性继承（`setScopeId`）只在「元素 vnode === 组件 `subTree`」时沿 `parentComponent` 链递归，Fragment 根的 `subTree` 不是元素，继承链在此断开——父级 `<style scoped>` 的 `data-v-*` 到不了内层 `<button>`，`v-show` / 组件级指令同样无处附着。
- **修法**：修 `Passthrough` 自身契约（该组件注释早已声明「保持单一根」），而不是在 `button.vue` 复制一份按钮标记做 `v-if` / `v-else` 双分支（约 45 行重复、两处易漂移）。实现：过滤 `Comment`（`v-if` 关闭分支）节点后，若只剩 **一个可见子节点**，直接返回该 vnode；否则仍返回数组。
- **DOM 口径**：不新增、不减少元素；`CaomeiButton` 无提示时 `$el` 即 `<button>`，父级 `data-v-*` 与 `v-show` 均生效。提示启用时外层仍有触发器 / 面板两级节点，根仍为包装层（与 1.4.0 一致）。

## 3. 连带影响

| 使用方 | 影响 | 判定 |
|:---|:---|:---|
| `button.vue` | 未启用提示时根元素 = `<button>`；`tooltip` 启用分支不变 | 本条目的目标 |
| `tooltip-text.vue`（`CaomeiTooltipText`，公开导出） | `disabled` 分支由 Fragment 收敛为元素根；父级 scoped 选择器从此可命中其根 `span`；`<!--v-if-->` 注释不再输出 | 同类契约修复，**属消费方可见变化** |
| `icon-tooltip.vue`（内部） | 同上；`iconOnly` 等图标按钮的根元素可直接被父级 scoped 命中 | 同上，但为内部组件 |
| `tooltip.vue`（`Passthrough` 包 `TooltipRoot`） | `TooltipRoot` 自身 `subTree` 仍为透传内容，DOM 无差异 | 无影响 |
| `PopoverTrigger` / `Popconfirm`（`as-child` 复用 `CaomeiButton`） | 触发器 `$el` 由「非元素」变为 `<button>`，`useOpenStateIsolation` 因此能登记触发器为额外保留根：打开态不再把触发器及其祖先链整片 `inert`，触发器恢复可点击（与 `Select` / `DatePicker` 现状一致） | **消费方可见变化**，见 §6 |

## 4. a11y 例外：`CaomeiPopconfirm` 的 `aria-valid-attr-value`

- 触发器元素可解析后，axe 对 `aria-haspopup="dialog"` + `aria-controls`（指向 portal 面板）的节点判 `incomplete`（`controlsWithinPopup`）。
- **不可消除性（源码依据）**：axe-core 的 `ariaValidAttrValueEvaluate` 对 `aria-controls` 的 preCheck 只在 `aria-haspopup` 为 `false` / `null` 时才继续判定；只要带 `aria-haspopup` 就无条件置 `needsReview`，与引用目标是否存在无关。保留 `aria-haspopup` 即无法转成 `pass`。
- **引用确实存在**：新增单测断言展开态触发器 `aria-controls` 等于面板 `id`。
- 口径与既有 `CaomeiDatePicker` 同规则条目一致（`count: 1`）；例外清单机制要求登记项必须仍命中且命中数不变，不会沉淀为永久豁免。

## 5. 验证证据

- `pnpm test`：全量单测通过（含新增的根形态 / 隔离面 / 引用目标用例）。
- **判别力**：回退 `passthrough.ts` 后新增的「父级 scoped 属性落到按钮根」「注释节点不阻止收敛」「打开态触发器不在隔离面内」三例失败；恢复后通过。
- 定向 E2E（`--project=desktop`）：`popconfirm` / `overlay-interaction` / `button-states` / `component-geometry` / `disabled-size` 全通过。
- `pnpm test:visual`：全部基线通过、0 差异（含 `button@momei 预设`、明暗两档、宽屏档）。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm check:planning-numbers` 通过。

## 6. 待 M1-1 补写的升级注意（消费方可见变化 3 条）

M1-1 的验收口径原文只列「Button 根节点 / 换行、`label` 语义变化」，本条目实际引入的变化面更宽，发布前须按[发布指南 §10.1](../../guide/release.md) 一并写入 `docs/release-notes/1.5.0.md`：

1. **Button 根形态恢复**：未启用内建提示时根元素回到 `<button>`，父级 `<style scoped>` 直接命中；1.4.0 的 `:deep()` / 祖先锚定写法仍可用但不再必要。
2. **`CaomeiTooltipText` 根形态同步恢复**：`disabled` 分支的父级 scoped 选择器可直接命中其根 `span`。
3. **Popover / Popconfirm 打开态隔离面收窄**：触发器（含 `as-child` 复用按钮）成为隔离保留根，背景不再整片 `inert`、触发器恢复可点击；1.4.0 说明里「面板外第一下点击只关闭面板」对这两个组件不再成立（`Select` / `MultiSelect` / `AutoComplete` 等未变）。

## 7. Review Gate

- **R1（2026-11-24，`standard`，时间盒 ≤10 分钟）**：**Pass**（0 blocker / 2 warning / 4 ~ 5 suggest）。
  - W1：升级注意交接面被低估（M1-1 现文只覆盖 Button 根节点 / 换行）→ 本记录 §6 逐条列出，交由 M1-1 落笔。
  - W2：真正受影响的 `inert` 路径（`as-child` + `CaomeiButton`）缺回归闸门 → 新增「打开态触发器不在隔离面内」单测（已做负向验证）。
  - suggest 采纳：axe 源码依据写入例外判定（并回填 `CaomeiDatePicker` 同规则条）；`Passthrough` 用例改用 `createCommentVNode` 并补强 Fragment 断言；`Popconfirm` 引用目标用例补定位注释。
  - suggest 未采纳：`as-child` 复用按钮的独立用例（既有 `Popconfirm` 路径已覆盖同一链路，另起 popover 级夹具收益有限）。

## 8. 剩余风险与边界

- **SSR 水合**：过滤在服务端与客户端共用同一 render，产物对称；仓库内无 `renderToString` + `hydrate` 的真水合测试（既有空白），本次未新增。
- **动态切换 `tooltip`**：根形态在 element / Fragment 之间切换会重建按钮 DOM，与修复前切换包装组件的行为一致，未新增断言。
- 本条目**不改** `wrap`（换行开关，M2-2）、不改 `@layer` 策略（M2-3）。
