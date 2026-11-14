# Phase 34 M1-3：Dialog / Drawer 关闭按钮接入内建提示

> 创建时间：2026-11-15
> 触发：用户「按照合适的顺序推进当前阶段的待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M1-3 行。

## 1. 交付面（10 文件）

| 面 | 文件 |
|:---|:---|
| 实现 | `src/components/dialog/dialog.vue`、`src/components/drawer/drawer.vue`、`src/components/tooltip/icon-tooltip.vue`（新增 `ignoreNonKeyboardFocus`） |
| 单测 | `src/components/dialog/dialog.test.ts`、`src/components/drawer/drawer.test.ts` |
| 文档 | `docs/components/dialog.md`、`docs/i18n/en-US/components/dialog.md`、`docs/components/drawer.md`、`docs/i18n/en-US/components/drawer.md` |
| 验证装置 | `test/visual/components.visual.ts`（对话框打开态截图前移开指针） |

治理索引与记录本体属登记 / 留痕，不计入上表。

## 2. 决策

1. **默认开启、不加公开 prop**：关闭按钮没有可见文本，属「纯图标时展示」的场景；与 M1-1 的 `tooltip` 默认分流一致，采用「有内容即显示」。**未新增公开 prop**——按本阶段 M1-4 / M1-5 的同一口径（图标触发面不新增 prop），整体关闭走根部 `CaomeiTooltipProvider` 的 `disabled`。此前一版实现曾加 `tooltip?: boolean`，因超出 10 文件阈值且与本阶段口径不一致而撤回。
2. **仅键盘焦点触发（`ignoreNonKeyboardFocus`）**：`DialogContent` 打开时自动聚焦第一个可聚焦元素（即关闭按钮），默认策略会在**每次打开对话框时立刻弹出「关闭」提示**（真实 Chromium 复现：`document.activeElement` 为关闭按钮且提示处于打开态）。为该触发面开启 `ignoreNonKeyboardFocus` 后，程序化聚焦不再弹提示，键盘用户经 `Tab` 聚焦（`:focus-visible`）仍可见。
3. **共享实现**：两组件复用 M1-2 的内部 `CaomeiIconTooltip`（`as-child` + 无 DOM 包装），未新增第三份接线；提示内容取既有 `closeLabel`。
4. **层级不被面板遮挡**：提示面板经 `TooltipPortal` 挂 `body`，`z-index: var(--caomei-z-tooltip)`（1060）高于面板 `--caomei-z-modal`（1001）。真实 Chromium 命中测试：面板中心 `elementFromPoint` 落在面板内（Dialog / Drawer 均为 `true`）。
5. **关闭行为不变**：Esc、遮罩、关闭按钮三条路径的既有单测在默认开启提示后仍全绿；`dialog.test.ts` / `drawer.test.ts` 的「点击关闭按钮抛出 `update:open=false`」未改动即通过。
6. **视觉基线确定性**：按钮工具条与对话框打开态截图会受指针停留影响（打开对话框后指针仍停在触发器处，若恰落在关闭按钮上会弹出提示）。视觉装置在打开对话框后把指针移到遮罩空白处并等待「无打开中的提示」，使 `dialog@打开态` 只表达面板本身。
7. **测试卫生**：Dialog / Drawer 用例改为「登记挂载实例 → `afterEach` 统一卸载」。此前用例不卸载，`document.body.innerHTML = ''` 会把 portal 容器留成悬空引用；引入提示接线后其异步补丁会落到空容器（`insertBefore of null`），表现为**后续用例**随机失败（隔离运行通过）。该修复只作用于测试装置，不影响运行时。
8. **提示打开态下的 Esc 分层**：提示面板经 `DismissableLayer` 注册图层，Escape 只派发给最高层——指针停在关闭按钮上（提示已开）时，第一次 Esc 只关提示，第二次才关对话框。该分层与「对话框内 Select 打开时 Esc 先关 Select」同源，属库内既有约定；对话框自身的 `closeOnEsc` 逻辑零改动。如需「一次 Esc 关对话框」需在提示层接管，登记 F11。
9. **测试判别力**：`ignoreNonKeyboardFocus` 的用例同时断言「焦点确实落在关闭按钮上」与「非键盘焦点不弹 / 键盘焦点（`:focus-visible`）弹出」，避免 happy-dom 自动聚焦行为变化后用例退化为空断言。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | Dialog / Drawer 各 4 例新增（指针显示 / 程序化聚焦不弹 / 面板在 portal 且不在面板内 / `closeLabel` 同步）；全量 3270 passed |
| `test:a11y` | 69 passed（关闭按钮的提示未新增违规） |
| 真实 Chromium | Dialog / Drawer 关闭按钮悬停显示「关闭」；面板 `z-index 1060` > 面板 `1001`；命中测试在面板内；Esc 关闭对话框后不再渲染 |
| `capture:styles` | 0 差异（399 项） |
| 视觉回归 | `dialog@打开态` 亮 / 暗通过（全量 42 张在外层批次跑） |
| E2E | `overlay-stacking`（含「面板必须渲染在模态内容之上」）/ `overlay-interaction` 12 passed |

## 4. Review Gate

- **R1（`standard`，A 实现 / B 文档两分区并发）**：A `Pass`（0 blocker；3 warning：程序化聚焦用例缺前置断言与正向对照、提示打开态 Esc 的分层语义未落证、`IconTooltip` 头注释仍写「两个 prop」；5 suggest：双卸载、视觉等待条件、描述符断言、`Record<string, unknown>` 丢类型、读屏重复朗读）；B `Reject`（1 blocker：索引摘要「1 条遗留」与 §5 的 7 个编号不符；3 warning / 3 suggest：头注释、§4 占位、Provider 前置条件、F10 措辞、Drawer 页缺同一条否定式保证）。
- **R1 修复**：索引摘要改为 7 条编号清单；头注释改为三个 prop；§4 回填 R1 与 F11 / F10 措辞；用例补「焦点落在关闭按钮 + 键盘焦点正向对照」；Esc 分层语义写入 §2 第 8 条并登记 F11；视觉等待改为「面板已脱离」且指针复位改视口无关坐标；`Partial<DialogProps>` / `Partial<DrawerProps>` 收紧类型；描述符存在性前置断言；4 份组件页补 Provider 前置条件与 Drawer 的否定式保证。
- **R2（`quick`，两分区修复点）**：A `Pass`（W1 ~ W3 / S1 ~ S4 关闭；S5 转 F8；3 条 follow-up：索引摘要计数、`DialogProps` 缺 `open`、旧用例双卸载）；B `Reject`（1 blocker：索引摘要 7 条 vs §5 的 8 个编号，缺 F11；3 warning / 1 suggest：复发约束载体、Esc 分层未落组件页、§1 未注明治理载体）。
- **R2 修复**：索引摘要按当时的编号集合改写，并补入 F11、标注 F10 / F11 为本批新增；4 份组件页的 `closeOnEsc` 说明补「提示打开时先按 Esc 关闭提示，再按 Esc 关闭对话框」；§1 注明治理索引与记录本体不计入文件面；并把「索引摘要条数须与遗留编号数一致」登记为 F12（机检候选）。
- **R3（`quick`，B 分区修复点）**：`Reject`（1 blocker，复发）——修复动作在同一轮内追加 F12，索引摘要的「8 条」再次落后于 §5 的 9 个编号；同轮 warning：R3 待回填、F12 落点悬空。
- **R3 修复**：放弃手写条数——摘要改为列编号并指向记录遗留节；在 [治理索引](./index.md) 的「摘要口径」新增一条（不留手写计数），从写法层面消除该类漂移；F12 改为由该规则收敛（机检可选）。
- **R4（`quick`，B 分区修复点）**：`Reject`（2 blocker，均在新规则文本）——规则把遗留清单锚点写死为「§5」（M1-1 的遗留节是 §6）；规则正当性论证写「连续两轮被否决」低记一轮（R1 / R2 / R3 三处 B 分区 blocker 同族）。修复：锚点改为「记录内的遗留编号清单（章节号以实际结构为准）」；轮次改为「多轮」不复述数字；遗留计数规则扩为「任何量词」并限定触发边界；承接清单补 F1 ~ M1-1 的 F4；R2 修复行与声明对齐；F12 标注「已由摘要规则收敛」。
- **R5（`quick`，B 分区修复点）**：`Pass`（0 blocker）；同轮 follow-up：规则触发边界补「新建条目」与「列编号集合」、F12 机检对象改为编号集合一致性、R2 / R3 修复行的锚点表述——前三项已在本轮文本收口，R3 的序号锚点已改为标题引用。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 / F2 / F4 / F6 | 承接 M1-1 的持久守卫、组件页补写、迁移措辞统一（F4）、`mode: 'auto'` 示例 | M1-6 / M4-1、M1-7、M1-8 |
| F7 / F8 / F9 | 承接 M1-2 的禁用态 hover 常驻 E2E、读屏重复朗读取舍、计数附清单 | 见 M1-2 记录 §5 |
| F10 | `ignoreNonKeyboardFocus` 目前只在 Dialog / Drawer **开启**；Toolbar / Paginator / SplitButton 的「点击后聚焦再弹提示」尚未收敛 | 出现下游反馈时统一评估 |
| F11 | 提示打开态下第一次 Esc 只关提示（与面板内浮层的分层语义一致）；若需「一次 Esc 关对话框」需在提示层接管 | 出现下游反馈时评估 |
| F12 | 索引摘要的手写遗留计数与记录编号集合多次漂移（本批多轮被否决） | **已收敛（2026-11-15）**：`index.md` 摘要口径新增「摘要不写遗留规模的手写计数」，改为列编号集合；可选机检的目标是「摘要编号集合 ⊆ 记录遗留编号集合」 |

## 6. 复查基线

本记录 §1 ~ §5；`src/components/tooltip/icon-tooltip.vue`、Dialog / Drawer 的组件与单测；中英组件页；`test/visual/components.visual.ts` 的对话框分支。
