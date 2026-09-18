# M5 批次 B3「DropdownMenu 项模型 + 声明式锚点」浏览器验证记录

**批次**：M5-5（DropdownMenu `model` 数据驱动项模型）+ M5-6（`:popup` + `toggle(event)` 收敛为声明式锚点）——[待办事项](../../plan/todo.md) M5 批次 B3。
**结论：通过** —— 文档站（Vite dev，当前源码）在 light / dark 两主题下实测「数据驱动项模型」演示：项模型渲染、`command` 触发与关闭语义、面板经 Portal 弹出、锚点几何（面板紧贴触发器下方 `sideOffset`、左对齐、落在视口内）与 `unstyled` 外观豁免全部符合预期，console error / pageerror **0**。M5-6 原判据中的「`:popup` 生效有单测」经用户裁定（2026-09-18，采纳候选 A）收敛为「Portal 挂载于 `body` + `data-side`」单测与本节 §3 的锚点几何实测，两项均已交付，见 §4。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | 文档站 `docs/`（Vite dev，源码态；含本批新增示例 `dropdown-menu/model.vue`） |
| 入口 | `http://localhost:5173/components/dropdown-menu` |
| 视口 | 1280×900 |
| 运行期 | Chromium（Playwright），root 容器补 `--no-sandbox` / `--no-zygote` / `--disable-dev-shm-usage` |
| 一次性脚本 | `test-results/m5-b3-ui-check.mjs`（结构 / 几何 / 交互 / 主题）；截图与原始 JSON 同目录（gitignored） |
| 视觉通道 | 推理通道不可用；改用**本地 OCR** 确认渲染文案 + 结构 / 计算几何断言，**未做逐像素比对** |

## 2. 项模型渲染与交互（M5-5）

演示用 `model` 为 `[编辑, 复制, separator, 删除]`，触发器为 `as-child + unstyled` 复用的 `CaomeiButton`：

| 断言 | light | dark |
| --- | --- | --- |
| 面板 `role` | `menu` | `menu` |
| 条目数 / 文本 | 3（编辑 / 复制 / 删除） | 3（编辑 / 复制 / 删除） |
| 条目 `role` | 均为 `menuitem` | 均为 `menuitem` |
| `separator: true` | 渲染 1 条 `role="separator"`，不计入条目 | 同 |
| `icon`（lucide 组件） | 3 个图标 SVG 渲染 | 3 个 |
| 选中 `复制` | `command` 触发、结果区显示「结果：复制」、菜单关闭（选中即关） | — |

## 3. 锚点定位与弹出语义（M5-6）

`:popup` 在本库**无对应 prop**（面板恒经 Portal 弹出），故验收落点改为「弹出面板 + 锚点几何」可判定断言：

| 断言 | 自定义按钮触发器（`as-child + unstyled`） | 默认样式触发器（基础用法） |
| --- | --- | --- |
| 面板挂载于 `body` 且不在触发器子树内 | 通过 | 通过 |
| `data-side` | `bottom` | `bottom` |
| 面板顶边与触发器底边间距 | `4px`（＝ `sideOffset` 默认值） | `4px` |
| 面板左边与触发器左边对齐（`align="start"`） | 通过（≤1px） | 通过（≤1px） |
| 面板完整落在视口内 | 通过 | 通过 |
| 触发器 `aria-haspopup` / `aria-expanded` | `menu` / 打开后 `true` | `menu` / `true` |

外观豁免实测：`as-child` 下自定义按钮**保留自身类**（`caomei-button`）且**不含**内建触发器类（`caomei-dropdown-menu__trigger`），即 `unstyled` 生效；暗色下上述几何与结构结论一致。

## 4. 验收判据收敛（用户已裁定）

M5-6 的原判据为「锚点定位有浏览器验证证据；**`:popup` 生效有单测**；中英文档登记」。经 D 阶段取证（PrimeVue 一方源码：`menu/index.d.ts` 的 `popup?: boolean`（默认 `false`）与 `show(event)` / `toggle(event)` / `hide()` 方法），本库**没有 `popup` 的映射对象**——面板恒经 Portal 弹出，`toggle(event)` 的事件坐标锚定由声明式触发器承接（与 M5-4 Popover 同一定案）。该条判据因此无法按字面满足，本批**未自行改写**，按[规划规范 §3.7](../../standards/planning.md) 处理为「未达标待裁定」并给出候选 A / B。

**用户裁定（2026-09-18）：采纳候选 A。** 判据收敛为——**「面板经 Portal 挂载于 `body` 且带 `data-side`」单测 + 浏览器实测锚点几何**（面板顶边＝触发器底边 + `sideOffset`、左对齐、视口内）。两项证据均在本批交付：

| 收敛后判据 | 证据 |
| --- | --- |
| 面板经 Portal 挂载于 `body` 且带 `data-side`（单测） | `src/components/dropdown-menu/dropdown-menu.test.ts`「弹出面板经 Portal 挂载于 body 并带锚点方向属性」 |
| 锚点几何（浏览器实测） | 本节 §3 表格（`gapBelowTrigger = 4px`、`leftAligned`、`insideViewport`，自定义按钮与默认触发器两种形态、light / dark 一致） |

回写落点：`docs/plan/todo.md` 的 M5-6 验收单元格（已改）与 B3 状态段「判据收敛（M5-6，2026-09-18 用户裁定采纳候选 A）」（已改）——本判据自裁定起即为验收口径，后续同类「无映射对象」条目按此格式处理（先标未达标待裁定 → 用户裁定 → 回写权威载体）。

## 5. 未覆盖边界与候选

- 视觉推理通道不可用，未做像素级比对；结论以结构 / 几何 / OCR 三元证据替代。
- 本记录为一次性实测，未新增常驻 E2E 用例（沿用 M5 B1 / B2 的「常驻覆盖既有形态、一次性覆盖新特性」口径）。
- **已登记候选**（需用户授权，见 [Backlog](../../plan/backlog.md)）：`model` 尚不支持 `MenuItem.items`（嵌套子菜单）与 `MenuItem.class`（逐条目类名），momei 实测分别命中 2 处（`use-admin-menu-items.ts`）与 1 处（`language-switcher.vue`）；当前迁移指引给出的是「平铺分组」与「改用声明式条目」的绕行写法。
