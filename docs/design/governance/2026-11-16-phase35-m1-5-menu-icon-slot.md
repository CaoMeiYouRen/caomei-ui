# Phase 35 M1-5：Menu 项的前置图标出口（F16）

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M1-5 行（[登记记录](./2026-11-15-phase35-registration.md)）。

## 1. 交付面（7 文件）

| 面 | 文件 |
|:---|:---|
| 普通项 | `src/components/menu/menu-item.vue`：新增 `#icon` 插槽（链接与按钮两条分支），图标盒整体 `aria-hidden` |
| 子菜单 | `src/components/menu/sub-menu.vue`：触发器新增 `#icon` 插槽，标签与指示器不变 |
| 样式 | `src/components/menu/menu.vue`：`.caomei-menu__item-icon` 盒子（`inline-flex` + 不收缩），改写槽约束注释 |
| 单测 | `src/components/menu/menu.test.ts`：图标成盒与 `aria-hidden`、未提供时 DOM 不变、子菜单触发器组合 |
| 截断面用例 | `src/components/tooltip/overflow-surfaces.test.ts`：带前置图标时图标不在截断盒内、溢出示全文 |
| 文档 | `docs/components/menu.md`、`docs/i18n/en-US/components/menu.md`：图标出口、槽约束、`--caomei-menu-item-gap` 口径与迁移行 |

记录、索引与规划状态位属留痕，不计入上表。

## 2. 决策：`#icon` 插槽（不取 `icon` prop）

1. **与既有出口一致**：Button / Toolbar 等组件的图标入口都是 `#icon` 插槽，`icon` prop 只接受组件引用，表达力弱于插槽（无法传尺寸 / class / 组合图标）。
2. **不新增运行时依赖，也不引入「图标组件 → 渲染」的二次抽象**：插槽内容由使用方决定，库只负责布局盒。
3. **向后兼容**：未使用 `#icon` 时 DOM 与之前完全一致（多一个 `v-if` 判断，无额外元素）。
4. **间距语义回归**：图标盒与文本盒是项级 flex 的两个子项，`--caomei-menu-item-gap` 因此作用于两者之间；文本仍独占截断盒，`--caomei-menu-item-label-max-width` 继续有效。
5. **装饰性**：图标盒整体 `aria-hidden="true"`，不重复播报；可访问名仍由文本提供。代价是与 `CaomeiIcon` 的 `label` 出口互斥——需要语义时把信息写进项文本（文档「无障碍」节已写明，并禁止在 `#icon` 内放可聚焦元素）。
6. **空插槽**：`v-if` 只看插槽是否存在，传入空插槽仍保留图标盒与间距（文档已写明）。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/components/menu/menu.test.ts` → 全绿（含图标成盒、无图标 DOM 不变、子菜单组合三例） |
| 文档 | 中英同位置改写「长文本截断与提示」段与 `--caomei-menu-item-gap` 行，迁移表补「文本走默认插槽、图标走 `#icon`」 |
| 一致性 | `docs:check:i18n-parity` 通过；`lint-md` 通过 |
| 质量门 | `pnpm lint:check`、`pnpm typecheck` 通过 |

## 4. Review Gate

- **R1（`standard`，约 7 分钟）**：**Reject**（1 blocker / 3 warning / 1 suggest）——① 未覆盖「图标 + 长文本截断」；② `aria-hidden` 与 `CaomeiIcon` 的 `label` 出口互斥未写明；③ 索引摘要写「单测三例」会被补测推翻；④ 空插槽行为未写明。
- **R1 处置**：在 `overflow-surfaces.test.ts` 的 Menu 组补「带前置图标」用例（图标盒与文本盒为兄弟、图标不在截断盒内、溢出仍出全文提示）；中英「无障碍」节补 `aria-hidden` 约束与空插槽语义；记录 §2 补取舍；索引摘要去掉手写计数。

## 5. 遗留

本阶段 M1 主线（质量与无障碍 5 条）随本条交付完毕；后续条目为 DataTable 列能力（M2）与 Rating（M3）。

## 6. 复查基线

本记录 §1 ~ §5；`menu-item.vue` / `sub-menu.vue` 的 `#icon` 插槽与 `defineSlots` 声明；`menu.vue` 的 `.caomei-menu__item-icon`；`menu.test.ts` 的两个新 describe；中英组件页对应段落与迁移行。
