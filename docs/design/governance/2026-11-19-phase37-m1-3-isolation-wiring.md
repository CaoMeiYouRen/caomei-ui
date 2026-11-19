# Phase 37 M1-3 交付记录：隔离接线下沉到共享 composable

> 创建时间：2026-11-19
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M1-3。本记录只承载实现机制、边界与验证证据。

## 1. 实现

- **下沉对象**：`Select` / `MultiSelect` / `AutoComplete` / `DatePicker` / `ColorPicker` 五组件的打开态隔离接线改为统一调用 `useOpenStateIsolation`（`src/components/_shared/use-open-state-isolation.ts`），逐份 `suppressOutside` 记账、`releaseInert()` 包装、开合 `watch` 与卸载回退全部删除。
- **触发源扩展**：composable 新增可选第三参数 `open`（组件自持开合状态的 getter）。提供时按两条 `watch` 生效——关闭 `flush: 'sync'` 立即回退（先于各组件自身的焦点归还，否则触发器仍在 `inert` 子树、焦点掉到 `body`），打开 `flush: 'post'` 后再 `nextTick` 补隔离（保证 portal 内容已挂载）；未提供时保持原有内容根 `data-state` + `MutationObserver` 路径（`PopoverContent` / `DropdownMenuContent` 拿不到根组件的开合状态）。
- **保留根按组件现状**：`Select` 只保留面板根（与重构前一致，触发器随手柄一起隔离）；`MultiSelect` / `AutoComplete` 保留面板 + 字段（`ComboboxAnchor`，含搜索输入）；`DatePicker` / `ColorPicker` 保留面板 + 触发器；`ColorPicker` 的 `inline` 形态不渲染 `PopoverRoot`，getter 追加 `!props.inline` 保证不做隔离。
- **挂载即展开**：`onMounted` 兜底补一次（受控用法下 `open` 不变、`watch` 不触发）；`post` watch 不再 `immediate`，避免同一微任务内重复 `apply()`。
- **背景点击**：五组件保留各自的 `document` 捕获阶段 `pointerdown` 监听，只把 `releaseInert()` 换成 composable 返回的 `release()`（解隔离语义不变，`inert` 不参与命中测试，首次点击只关闭面板）。

## 2. 语义等价与边界

| 项 | 处置 |
|:---|:---|
| 关闭时序 | 隔离回退改为由 composable 的同步 `watch` 承担；它先于组件自身（同在 setup 注册、后注册）的焦点归还 `watch` 执行，顺序与重构前的 `releaseInert()` 首行调用一致 |
| 打开时序 | `post` → `nextTick` → `apply()`，与重构前逐组件 `watch(open, …, { flush: 'post' })` 内 `nextTick` 一致 |
| 多层浮层 | `apply()` 先 `release()` 再重新登记；`suppressOutside` 本身按活动层重算，不产生残留层 |
| 内容根未挂载 | 新实现在内容根非元素 / 未连接时直接回退，不再单独对字段 / 触发器根施加隔离；仅异常态可达（正常打开时 portal 内容已在 `body`），比旧行为更保守 |
| `extraRoots` 类型 | 放宽为 `unknown[]`（调用方传 `ref.value?.$el` 的 `unknown` 形态），非元素项在 `apply()` 内静默忽略，已在 `@param` 注明 |
| `sync()` | 仍只服务 `data-state` 模式；open 模式下不读组件开合状态，已在 JSDoc 标注「仅 `data-state` 模式使用」，避免被误接到 `@open-auto-focus` |
| `inline` 面板（ColorPicker） | 不隔离：面板在文档流内，隔离背景会把页面主体从 AT 树摘掉 |
| 模态内打开 | 触发器的祖先链保留，模态内容不被隔离；模态自身的 `inert` / `aria-hidden` 不接管、不撤销 |

## 3. 验证

- 全量单测：`pnpm test` → 全绿。
- 定向单测（五组件 + `Popover` / `DropdownMenu` / `_shared`）：`pnpm vitest run src/components/select src/components/multi-select src/components/auto-complete src/components/date-picker src/components/color-picker src/components/popover src/components/dropdown-menu src/components/_shared` → 全绿，隔离相关用例期望值**未修改**。
- 新增 composable 单测：`pnpm vitest run src/components/_shared/use-open-state-isolation.test.ts` → 全绿。三个用例分别锁「挂载即展开也隔离」「打开隔离 + 额外根保留 + 关闭同步回退」「`data-state` 模式隔离与回退」；移除 `onMounted` 兜底后第一条变红（已做负向验证，恢复后转绿）。
- E2E（三视口）：`pnpm exec playwright test test/e2e/select-open-inert.e2e.ts test/e2e/overlay-panel-isolation.e2e.ts` → 75 passed。覆盖 Select / MultiSelect / DatePicker / AutoComplete 的隔离面、背景不可聚焦、关闭后焦点归还字段、Tab / Shift+Tab 交接、背景点击关闭，以及模态内 DatePicker / ColorPicker / Popover 与页面级 DropdownMenu / Popover。删除打开路径的 `immediate` 后复跑同命令，结果一致（该变更只减少同一 `nextTick` 批次内的重复 `apply()`，绘制前 DOM 等价）。
- 静态检查：`pnpm lint:check`、`pnpm typecheck` → 全绿。本批次含治理文档（本记录 / `index.md` / `todo.md`），`pnpm lint:md:check` 全绿；未改样式，`pnpm lint:css:check` 不适用。治理门禁 `pnpm governance:check` 全绿。

## 4. Review Gate

**结论：Pass**（R1 `standard`，2026-11-19；W1 修复后 R2 `quick` 复核 Pass）。

- 轮次：R1 `standard` Pass（0 blocker / 1 warning / 3 suggest）→ 修复 W1 并补测试 → R2 `quick` 复核 Pass。
- W1（挂载即展开路径重复 `apply()` 且无判别力测试）：采纳「删除冗余 `immediate` + 补挂载即展开用例」，负向验证确认该用例能区分兜底是否生效。
- 建议项处置：`extraRoots` 非元素静默忽略已写明；`sync()` 仅 `data-state` 模式已写入 JSDoc；内容根未连接时不再单独施加字段根的中性差异登记于 §2。
- 规模：10 文件（7 代码 / 测试 + 3 文档），未超 10 文件 / 800 行阈值，无需拆分。
