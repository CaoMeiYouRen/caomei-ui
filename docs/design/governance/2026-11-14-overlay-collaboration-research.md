# 遮罩类组件协作问题调研与测试用例评估

> 创建时间：2026-11-14
> 触发：用户指出「绝大多数问题都出现在 Dialog / Drawer 这类带遮罩的组件与其他组件协作时」，要求 ① 调研常见组件库的处理方式；② 评估本项目应补的组件协作测试用例。
> 性质：只读调研 + 测试评估。**不登记阶段条目、不修改 `backlog.md`、不实施用例**；拟登记的测试批次见 §6，待用户裁定。

## 1. 背景：本仓近期的三个真实问题

| 问题 | 归属 | 共性 |
|:---|:---|:---|
| 模态内 Select 面板被模态内容盖住 | 2026-09-30 已修（z-index 档位） | 浮层层级 |
| 弹窗内长列表无法滚动（选项越出视口） | Phase 33 M3-4 已修（视口高度上限） | 浮层内部滚动 |
| caomei-auth「Dialog 内 pointerdown 不触发」 | 库侧最小环境未复现，待下游最小复现 | 指针事件归属 |

三者都不是「组件单独坏了」，而是**遮罩层、浮层、滚动锁、焦点/指针归属**四件事在同一页面叠加时的协作问题。

## 2. 行业调研：主流库怎么处理

> 结论先行：多数实现以**滚动锁（overflow + 滚动条补偿 + 引用计数）+ 层级栈 + 嵌套层登记**为主，`pointer-events: none` 只作为嵌套层的补充手段——且它是已知的故障源（Radix 近期专门修过泄漏）。

| 库 | 滚动锁 / 指针事件 | 层级与嵌套 | 焦点 / 关闭 | 已知故障模式 |
|:---|:---|:---|:---|:---|
| **Radix UI**（React，参考实现） | `react-remove-scroll` 的 `RemoveScroll`：锁 `body` 滚动、补偿滚动条，并用 `shards` 把「内容 + 嵌套 portal 分支节点」登记为**可滚动例外**；`Dialog.Content` 仍会设 `pointer-events: none`，但 `Dialog.Overlay` **显式 `pointerEvents: 'auto'` 以恢复被 Content 抑制的指针事件** | `DismissableLayer` + 全局层栈；`FocusScope` 的 `branches` 把嵌套 portal 层视为对话框的一部分（issue #3423）；`hideOthers` 对兄弟节点做 `aria-hidden` | 焦点陷阱、关闭后归还触发器；仅最上层响应外部点击 / Esc | **issue #3445**：卸载时 `pointer-events: none` 未清理，整页失去鼠标响应；issue #3423：嵌套 portal 层未登记导致焦点/滚动锁误判 |
| **Reka UI**（本库底层） | `useBodyScrollLock` **共享栈**（2.11）：`body.overflow = hidden` + `padding-right` 滚动条补偿 + `--scrollbar-width`；同时用 `acquireBodyPointerEvents` 按 owner 集合锁 `body.pointer-events`，最后一个 owner 释放时恢复；`DismissableLayerBranch` 用于嵌套层登记 | `DismissableLayer` 层栈 + `DismissableLayerBranch`；`Dialog` / `Drawer` 的 modal 内容 `disableOutsidePointerEvents` | `FocusScope` 陷阱；`Escape` 由 DismissableLayer 冒泡 | 仍是 `pointer-events` 锁模型；若嵌套层未登记为 branch 或锁未成对释放，会出现「点不动」；`SelectContent` 是独立 layer，不是 branch |
| **Vuetify** | `VOverlay` 的 **scroll strategy**（`none` / `close` / `block` / `reposition`；`none` 即不接管滚动）按场景选择，而非统一 `pointer-events` | `useStack` 全局 z-index 栈；`click-outside` 的 `include` 把**祖先浮层内容**视为「内部」，避免嵌套浮层互相关闭 | 焦点陷阱；`Escape` 只在 `globalTop` 时生效；关闭后按需归还焦点 | 嵌套层需要显式声明 `_submenu` / `contained`；滚动策略选择错误会导致「遮罩滚动」或「页面穿透」 |
| **Element Plus** | `useLockscreen`：给 `body` 加 `el-popup-parent--hidden` 类 + `body.width = calc(100% - scrollbarWidth)` 补偿；**延迟 200ms 清理**，不用 `pointer-events` | `useZIndex().nextZIndex()` 分配层级；`append-to-body` 控制 portal；Dialog 打开时 `scrollTop = 0` | `focus-trap`；`focusout` 在 `focusReason === 'pointer'` 时 `preventDefault`（避免指针点击触发焦点外逃） | 多弹层需保证类的引用计数（`withoutHiddenClass` 守卫）；自定义滚动条时宽度补偿可能不准（同类问题见 Ant #43485） |
| **Ant Design** | `rc-util` 的 `ScrollLocker`：`body` 样式 + `ant-scrolling-effect` 类 + 滚动条宽度补偿 | `zIndexContext` 让嵌套 Modal 继承并递增层级；`getContainer` 自定义 portal | 焦点陷阱 + 关闭后归还触发器 | issue #43485：自定义滚动条时 body 宽度计算不准 |
| **PrimeVue** | `blockBodyScroll()` / `unblockBodyScroll()`（modal 默认）；`blockScroll` 控制非 modal | `ZIndex.set('modal', mask, baseZIndex)` + `autoZIndex`；`Portal :appendTo` | `v-focustrap`；`Escape` 监听；遮罩关闭用 **mousedown / mouseup 同一目标** 判定（拖动不误关） | 多实例 `ZIndex` 与自定义 `z-index` 混用会压层 |
| **Naive UI / Ark UI** | `body-scroll-lock`（overflow + 滚动条补偿） / `useScrollLock`；不使用 `pointer-events` | `zindexable` 指令 / `useDismissable` + Presence | 焦点陷阱 + 关闭归还 | 同类：嵌套层需要显式组合 |

**归纳出的六条工程共识**

1. **滚动锁用「overflow + 滚动条补偿 + 引用计数」**，避免 `pointer-events: none` 作为主要手段（Radix 的 remove-scroll、Vuetify 的 scroll strategy、Element / Ant / PrimeVue 的 block 都是这个方向）。
2. **嵌套浮层必须登记**（Radix 的 branch/shard、Vuetify 的 ancestor-content 判定、Reka 的 `DismissableLayerBranch`）——否则焦点陷阱、滚动锁、外部点击判定都会把「子浮层」当成「外部」。
3. **层级用全局栈**（Vuetify `useStack`、Element `useZIndex`、PrimeVue `ZIndex`），而不是各组件写死 `z-index`；同时**只有最上层**响应 Esc 与外部点击。
4. **浮层内容自带滚动容器与可用高上限**（M3-4 的根因），遮罩层锁页面滚动后，浮层必须能独立滚动。
5. **焦点与 aria 由顶层统一管理**：`aria-hidden` 兄弟节点 / `inert` 关闭态内容 / 焦点陷阱 / 关闭归还触发器。
6. **已知高危点**：`pointer-events` 锁残留（整页点不动）、滚动锁未成对释放（关闭后页面滚不动）、嵌套层被父层拦截、Esc 一次关多层、滚动链穿透、滚动条补偿导致的布局抖动。

## 3. 本仓现状

- **底层**：Reka UI 2.11。`DialogOverlayImpl` / `DrawerOverlayImpl` / `AlertDialogOverlayImpl` 在 **modal** 下调用 `useBodyScrollLock`（body overflow + 滚动条 padding + `body.pointer-events` owner 锁）；**非 modal 不锁滚动**。`DismissableLayer` 层栈负责外部点击与 Esc；`Select` / `MultiSelect` / `AutoComplete` 的 `bodyLock` 默认 `false`（避免滚动条消失抖动）。
- **层级**：浮层家族统一取 `--caomei-z-dropdown`（1050）> `--caomei-z-modal`（1001）> `--caomei-z-overlay`（1000）；Toast 1100。
- **现有协作覆盖**：
  - `overlay-stacking.e2e.ts`：模态内 8 类 portal 面板的 z-index + 命中测试 + 内联 ColorPicker 例外（6 passed）。
  - `overlay-interaction.e2e.ts`：Dialog / ConfirmDialog 的焦点落位与**滚动锁复位**（2 用例 × 三视口 = 6 例）。
  - `select-long-list.e2e.ts`：对话框内长列表内部滚动（3 passed，M3-4 新增）。
  - `focus-and-motion` / `focus-visible-expansion`：焦点环与动效；`drawer-convergence`：抽屉尺寸与动效；`toast-tone-contrast`：Toast 对比度。
- **明显空白**：没有「指针事件残留 / 滚动锁栈恢复」断言；没有 Drawer + 浮层；没有嵌套 Dialog / Drawer / ConfirmDialog / Toast 的层级与关闭顺序；没有「浮层打开时的 Esc 分层」；没有打开态的无障碍审计；没有真实指针（mouse down/up）驱动的交互完整性断言。

## 4. 测试用例评估（按风险 × 成本排序）

> 断言口径统一：**真实 Chromium + 真实指针**（`mouse.move/down/up`，不用 `dispatchEvent` 代替）、**计算样式 + 命中测试 + 几何**三类证据，关键用例配**负向对照**（注入破坏性样式/属性证明用例会失败）。

### P0（对应已发生的故障类，建议先做）

| 编号 | 场景 | 断言要点 | 现状 |
|:---|:---|:---|:---|
| **C1** | Dialog / Drawer 内 Select 用鼠标展开并选择 | 真实 `pointerdown` 触发面板；选项点击后 `v-model` 更新、面板关闭、焦点回到触发器（**层级/命中测试复用 `overlay-stacking` 的既有结论，本条不重复**） | 部分（overlay-stacking 只验层级；无选择/焦点） |
| **C2** | 指针事件残留（Radix #3445 类） | 关闭 Dialog 后：`body.pointer-events` / `body.overflow` / `padding-right` **恢复为打开前取值**；页面按钮可再次点击（真实 mouse click 后断言计数）。负向对照：关闭后强制 `body.style.pointerEvents = 'none'`，用例必须失败 | **无** |
| **C3** | 滚动锁栈：Dialog + Select（`bodyLock`）/ Dialog + Drawer 叠加 | 打开时 `body.overflow = hidden`；关闭子层后仍锁定；关闭最后一层后恢复；关键元素 `getBoundingClientRect()` 在开 / 关前后位移 ≤ 实测滚动条宽（不用 `scrollWidth`，补偿本就会改变它） | 部分（单层复位） |
| **C4** | 长列表在 **Drawer** 内滚动 | 同 `select-long-list`：`scrollHeight > clientHeight`、面板不越出视口、滚轮改变 `scrollTop` | 无（仅 Dialog） |
| **C5** | Esc / 外部点击分层 | **Esc 部分复用 `overlay-stacking` 既有断言**；本条只补：再按 Esc 关 Dialog、点击 Dialog 内部空白只关面板不关 Dialog、点击遮罩关 Dialog | 部分（Esc 已覆盖） |

### P1（协作面扩展）

| 编号 | 场景 | 断言要点 |
|:---|:---|:---|
| **C6** | 嵌套 Dialog（详情 → 二次确认）/ Drawer → Dialog | 第二层可命中且不被第一层内容覆盖（命中测试）；Esc 只关最上层；body 锁在两层都关后才释放；焦点归还到各自触发器。**注**：本仓三个遮罩组件均为固定档位（overlay 1000 / content 1001），无 per-instance 递增；「嵌套遮罩低于父层内容」为待判定缺陷（见 §4.1），断言不得假定 z-index 递增 |
| **C7** | Toast 在 Dialog 之上 | **探针先行**：先确认 Dialog 打开时 Toast 的 `pointer-events: auto` 生效；再断言 Toast 命中测试通过、不关闭 Dialog、多个 Toast 不改变 Dialog 层级 |
| **C8** | 焦点陷阱 + portal 浮层 | Tab 在 Dialog 内循环；打开 Select 后焦点进入面板；Shift+Tab 不逃出顶层；关闭面板后焦点回触发器 |
| **C9** | 移动端触摸滚动 | 用 CDP `Input.dispatchTouchEvent`（touchStart / Move / End）在长列表面板内滚动生效，且不触发 Dialog 关闭；需 `test.use({ hasTouch: true })`（`touchscreen.tap` 不产生滚动） |

### P2（补充面）

> C11（SSR 冒烟）与 C12（transform 祖先）本轮不列为用例：Dialog 内容默认关闭、portal 仅客户端挂载，SSG 无对照对象；局部 portal 属未来假设。二者仅在对应改造发生时再评估。


| 编号 | 场景 | 断言要点 |
|:---|:---|:---|
| **C10** | 打开态 axe 审计 | axe 可判定项（`aria-hidden-focus` / `aria-dialog-name` / `aria-modal` 等）在 Dialog + Select 打开态抽检；焦点陷阱是**行为契约**，用 E2E 断言（C8），不混入 axe |

### 4.1 调研中发现、待判定的缺陷（不在本轮修复）

- **嵌套遮罩的层级**：Dialog / Drawer / ConfirmDialog 的 overlay 固定 `--caomei-z-overlay`（1000）、content 固定 `--caomei-z-modal`（1001），**没有 per-instance 递增**。嵌套第二层时，其遮罩（1000）低于第一层内容（1001），无法压暗父层内容；第二层内容（1001）与父层内容同档，靠 portal 的 DOM 顺序取胜。是否需要「层级栈 + per-instance 递增」需单独立项评估（影响 z-index token 语义与既有视觉基线）。
- **`pointer-events` 锁的残留**：Reka 2.11 已用 owner 集合 + 共享栈降低风险，但仍是 `body.pointer-events` 模型；C2 是它的常驻守卫。若失败，应查 owner 释放 / 卸载时序，而不是简单改回 overflow。

### 不建议

- 在 happy-dom 中做上述几何 / 指针断言（无布局引擎，已有多处记录）；
- 为每个浮层 × 每个容器做全矩阵（8 面板 × 4 容器 = 32 条），成本高、收益低；用「代表组件（Select）+ 容器（Dialog / Drawer）+ 风险断言」覆盖即可。

## 5. 与现有测试的关系

- `overlay-stacking` 继续负责**层级**；C1 / C5 在其夹具上扩展「交互完整性」，不重复命中测试。
- `overlay-interaction` 继续负责**单层焦点与滚动复位**；C2 / C3 扩展为**多层与残留**。
- `select-long-list` 继续负责**长列表**；C4 扩到 Drawer。
- 新增用例建议集中在 **`overlay-collaboration.e2e.ts`**（一个文件，C1 ~ C9），避免散落；C10 归 docs axe；C11 / C12 按 §4 说明暂不立项。

## 6. 建议批次（待用户裁定，未登记）

> 流程：以下批次属「评估结论」，按[规划规范 §3](../../standards/planning.md) 须**先由用户裁定 → 登记 Backlog → 再进入阶段**；本轮不登记。

| 批次 | 内容 | 规模 | 前置 |
|:---|:---|:---|:---|
| **T1 协作主链路（P0）** | C1 ~ C5 + 夹具段（Dialog / Drawer 各一组） | 1 新 spec + 夹具 2 段，约 6 ~ 8 用例 | 无 |
| **T2 残留与栈（P0）** | C2 / C3 的负向对照与多层栈 | 并入 T1 或独立 spec，约 2 ~ 3 用例 | T1 的夹具 |
| **T3 嵌套与焦点（P1）** | C6 ~ C9 | 约 4 用例 | T1；C6 需先裁定 §4.1 的层级问题 |
| **T4 打开态 axe（P2）** | C10 | docs axe 矩阵 +1 页 + 打开态交互 + 规则白名单 + 最小适用节点下界 | 文档站构建 |

## 7. 风险与边界

1. **Reka 的 `pointer-events` 锁模型**是本仓当前的最大系统性风险：Reka 的滚动锁本就是 overflow 方案，`pointer-events` 只服务外部点击语义；C2 若失败，应查 owner 释放 / 卸载时序（含 `DismissableLayer` 栈），而不是简单改回 overflow。
2. 测试只能证明「当前行为符合预期」，不能替代下游最小复现；caomei-auth 的 pointerdown 报告仍需其环境证据。
3. 触摸用例（C9）在容器内的 CDP 触摸模拟存在环境差异，失败时按「环境限制」登记，不静默跳过。
4. 滚动条补偿在无滚动条的容器里恒为 0，C3 的抖动断言需在**有滚动条**的页面夹具上跑。

## 8. Review Gate

- **audit-depth**：R1 / R2 `standard`（只读调研 + 用例评估，零代码；≤10 分钟），R3 `quick`（只复核 3 处文本）。
- **R1**（`standard`）：`Reject`（2 blocker / 5 warning / 9 suggest）。
  - blocker：① Vuetify scroll strategy 写成含不存在的 `hide` → 改为 `none / close / block / reposition`；② C6 断言「第二层 z-index 高于第一层」与本仓实现相反（三组件固定档位、无 per-instance 递增）→ 改为命中测试，并在 §4.1 登记「嵌套遮罩低于父层内容」待判定缺陷。
  - warning：开头结论过度概括 `pointer-events` 已退出 → 改为「以滚动锁为主、`pointer-events` 为补充」；C1 / C5 与 overlay-stacking 重复 → 标注复用；`overlay-interaction` 计数口径 → 统一为「2 用例 × 三视口 = 6 例」；C11 / T5 不可执行 → 删除；C10 把焦点陷阱当 axe 规则 → 拆分行为断言与 axe 可判定项。
  - suggest：C2 恢复原值 + 负向对照、C3 改用几何而非 `scrollWidth`、C7 探针先行、C9 改 CDP 触摸、Element Plus 行去掉无源码支撑的结论、§3 精确到 modal 分支、§7.1 修复方向改为 owner 释放 / 卸载时序、C12 降为观察项、§6 补流程 → 全部采纳。
- **R2**（`standard`）：`Reject`（2 blocker / 0 warning）——R1 两项 blocker 已关闭；但索引仍写「12 条 / T1 ~ T5」与正文「10 条 / T1 ~ T4」冲突、`overlay-interaction` 计数未落地 → 同批改正。
- **R3**（`quick`）：`Pass`（0 blocker / 0 warning）——3 处文本一致。
- **复查基线**：本记录 §2（各库机制）/ §3（本仓现状）/ §4（用例与 §4.1 待判定缺陷）/ §6（批次）；`docs/design/governance/index.md` 该条目摘要。
