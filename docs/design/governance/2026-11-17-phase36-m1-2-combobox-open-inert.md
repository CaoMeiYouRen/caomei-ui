# Phase 36 M1-2 交付记录：MultiSelect / AutoComplete 打开态补 `inert`

> 创建时间：2026-11-17
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M1-2。本记录只承载实现机制、边界与验证证据。

## 1. 实现

- **接入方式**：两个组件复用 [M1-1](./2026-11-17-phase36-m1-1-multi-overlay-isolation.md) 的 `suppressOutside`，与 `Select` 同口径——面板落位后按浮层根隔离背景兄弟节点，关闭时回退。
- **隔离面（多根）**：同时登记两个保留根——portal 面板根与**字段根**（`ComboboxAnchor`）。字段是 Combobox 的交互面（输入框、清除按钮、展开触发器），只保留面板会把字段整棵标 `inert`，打开即丢焦点、无法输入、无法点击。字段根的祖先链因此不被隔离，背景仍按兄弟分支逐层补属性。
- **打开路径**：`open` 变化后以 `post` 刷新取根元素，确认已挂载且 `isConnected` 才隔离；根不在 `body` 时由工具侧空操作兜底。
- **关闭路径（时序）**：`open` 转 false 时以 `sync` 刷新**立即**撤销隔离。若等到 `post` 刷新，Reka 的焦点归还先于撤销，触发器/输入框仍在 `inert` 子树里，焦点会掉到 `body`。
- **背景点击**：`document` 捕获阶段监听 `pointerdown`，目标不在面板与字段内时先解除隔离——保证面板关闭路径与 Reka 的外部点击一致，且不残留隔离。**取舍**：`inert` 子树不参与命中测试，因此点击背景控件的**首次点击只关闭面板、不激活该控件**（与模态浮层一致，第二次点击才落到控件上）。
- **焦点兜底**：Reka 的 Combobox 是**非模态**浮层，不自动归还焦点。Escape 关闭时由组件把焦点交还字段内输入框（面板 `@escape-key-down` 与字段 `keydown.escape` 两路置位，置位前判 `open`，关闭后 `nextTick` 聚焦）；鼠标关闭不抢焦点。
- **隔离工具属性配对**：`suppressOutside` 在写入 `inert` 的同时配对写 `aria-hidden="true"`，撤销时只移除本模块写入的属性。理由：Reka 的 Combobox 不隐藏背景（`useHideOthers` 的目标是 root 的父元素，实测背景无 `aria-hidden`），而 Select 由 Reka 隐藏；配对后三类浮层的隔离面一致，`aria-hidden-focus` 规则对「属性在但不生效」的退化保持可判。字段根不在隔离面内，因此 Combobox 字段本身不会被 `aria-hidden`。

## 2. 边界

| 边界 | 处置 |
|:---|:---|
| 字段根（`ComboboxAnchor`） | 始终保留：输入框、清除按钮、触发器可聚焦可点击 |
| 非模态 Combobox 的 Tab 行为 | 展开态按 Tab / Shift+Tab：先收起面板、解除隔离，再把焦点交给字段之后（之前）的下一个可聚焦控件（APG Combobox 口径）。不拦截时浏览器会在 `inert` 生效的瞬间算好下一个元素，焦点落到 `body` |
| 点击背景控件 | 首次点击只关闭面板、不激活控件（`inert` 不参与命中测试）；隔离随即解除，第二次点击正常落到控件 |
| 鼠标关闭（点击外部 / 选中项） | 只回退隔离，不抢焦点：焦点跟随用户点击目标 |
| 键盘关闭（Escape） | 回退隔离后把焦点交还字段内输入框；关闭态按 Escape 不置位标记 |
| 外部已写 `aria-hidden` / `inert` 的节点 | 不接管、不撤销（与 M1-1 同口径） |
| 面板根未挂载或已脱离文档 | 不隔离（工具侧空操作） |
| 字段之后没有可用候选（字段为最后一个可聚焦元素 / 候选隐藏） | Tab 已收起面板并解除隔离，焦点留在字段内，下一次 Tab 由原生序列接手 |
| 字段内的非输入控件（清除按钮、值片移除按钮） | 展开态 Tab / Shift+Tab 直接交接出字段（不经过输入框与触发器），键盘用户从这些按钮无法回退到输入框 |
| 跨文档 teleport（iframe / 独立 `document`） | 隔离按 `ownerDocument` 的 `body` 分组，但背景点击的 `pointerdown` 监听绑在组件所属 `document`；当前无该调用方 |

## 3. 验证

- `pnpm vitest run src/components/multi-select/multi-select.test.ts src/components/auto-complete/auto-complete.test.ts src/_shared/open-state-inert.test.ts src/components/select/select.test.ts` → 142 passed（新增 3 例：两组件「展开后背景补 `inert` 与 `aria-hidden`、卸载回退」+ 工具「外部已有 `aria-hidden` 不接管」）。
- `pnpm exec playwright test test/e2e/select-open-inert.e2e.ts` → 39 passed（三视口 × 三组件；用例面 = 打开态背景被隔离且字段仍可用 / 关闭后焦点交还字段 / 点击背景关闭面板 / 非模态两组件「展开态 Tab 与 Shift+Tab 收起面板并交接焦点」；含「打开后输入生效」与「焦点为字段之后最近控件」断言）。
- `node scripts/docs/check-docs-axe.mjs --pages=multi-select-open-zh,multi-select-open-en,auto-complete-open-zh,auto-complete-open-en` → OK：受检元素 9 / 9 / 3 / 3，`aria-hidden-focus` 通过 49 / 49 / 44 / 43、违规 0（矩阵下界取本次实测值）。
- **可红对照**：临时让工具只写 `aria-hidden` 不写 `inert` 并重建文档站后，`multi-select-open-zh` → FAIL（1），违规节点 `#app`（`aria-hidden-focus` serious）；恢复实现并重建后四页回到 OK。**判别边界**：该对照证明的是「`aria-hidden` 必须与 `inert` 配对」，不能证明「背景被隔离」——完全不写 `aria-hidden` 时该规则不会命中；隔离存在性由 E2E 承担守卫。
- `pnpm vitest run scripts/docs/check-docs-axe.test.mjs` → 36 passed（矩阵校验随新页面同批通过）。
- 治理机检：`pnpm lint:check`、`pnpm typecheck`、`pnpm lint:md:check`、`pnpm governance:check`。

## 4. Review Gate

- **结论：Pass**（R3，第 3/3 轮，`standard`）。R1 / R2 均 Reject，问题在 R2 / R3 关闭。

### 4.1 问题关闭情况

| 编号 | 级别 | 状态 | 依据 |
|:---|:---|:---|:---|
| R1-B1 字段被 `inert`（输入失效） | blocker | 已关闭 | 隔离改多根（面板根 + 字段根）；E2E「字段仍可用」含输入生效断言 |
| R1-B2 背景点击被吞 | blocker | 已关闭（含取舍） | `pointerdown` 捕获先解除隔离、面板由外部点击关闭；首次点击只关闭、不激活控件已登记 |
| R1-B3 字段被 `aria-hidden` | blocker | 已关闭 | 字段根不在隔离面内；E2E 断言字段无隔离属性 |
| R2-B1 展开态 Tab 焦点落到 `body` | blocker | 已关闭 | 两组件 `onFieldKeydown` 拦截 Tab / Shift+Tab，交接给字段之后（之前）控件；E2E 三视口覆盖 |
| R1-W1 / R1-W4 / R2-W-f1 / R2-W-f2 | warning | 已关闭 | Escape 标记判 `open`；记录与 E2E 头注释按实测重写；axe 判别边界已写明 |
| R1-W2 外部 `aria-hidden` 撤销竞态 | warning | 维持已知边界 | 只在写入时判断外部已有 |
| R1-W3 验证盲区 | warning | 已关闭 | 新增「输入生效」「背景点击关闭」「Tab / Shift+Tab 交接」用例 |
| R1-S1 / R2-S-f1 / R2-S-f2 | suggest | 不采纳 / 已登记 | 组件间重复逻辑转后续；跨文档 teleport 与首次点击取舍已入 §2 |

### 4.2 残余（非阻塞，转后续）

- `FOCUSABLE_SELECTOR` 与 `onFieldKeydown` 在两组件重复，可下沉共享。
- 字段内非输入控件聚焦时的 Tab 交接口径（已入 §2）。
- 无可用候选时焦点留在字段内（已入 §2）。

### 4.3 验证

- E2E `select-open-inert` → 39 passed（三视口）。
- 单测四文件 → 142 passed；`check-docs-axe` 四页 OK（`aria-hidden-focus` 49 / 49 / 44 / 43，违规 0）。
- 可红对照：只写 `aria-hidden` 不写 `inert` → `multi-select-open-zh` FAIL（1，`#app`）；判别边界见 §3。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm governance:check` 全绿。
