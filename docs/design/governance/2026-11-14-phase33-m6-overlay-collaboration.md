# Phase 33 M6：遮罩协作常驻测试（M6-1 / M6-2）

> 创建时间：2026-11-14
> 触发：用户「开始推进 M6」。范围与验收口径以 [Phase 33 登记批次](./2026-11-13-phase33-registration.md) §2 的 M6-1 / M6-2 行为准；用例设计来源为[遮罩协作调研](./2026-11-14-overlay-collaboration-research.md) §4（C1 ~ C10）与 §6（T1 ~ T4）。
> 性质：**只增测试与夹具**，`src/**` 零改动。

## 1. 交付范围与用例映射

| 条目 | 用例 | 测试位置（`test/e2e/overlay-collaboration.e2e.ts`） | 核心断言 |
|:---|:---|:---|:---|
| M6-1 C1 | Dialog 内 Select | `C1 Dialog：真实指针展开 Select…` | `pointerdown` 即展开（断言在 `mouse.up` 之前）；选项点击后 `v-model` 更新（同源回显）、面板卸载、焦点回到触发器；对话框保持打开 |
| M6-1 C1 | Drawer 内 Select | `C1 Drawer：真实指针展开 Select…` | 同上（容器换成 Drawer） |
| M6-1 C2 | 单层残留 | `C2 单层：关闭 Dialog 后指针事件与滚动锁逐项复位…` | 关闭后 `overflow` / `padding-right` / `margin-right` / `pointer-events` 与 `--scrollbar-width` **逐项恢复为打开前取值**；真实点击页面探针计数 +1 |
| M6-1 C3 | 单层滚动锁 / 几何 | `C3 单层：滚动锁开关与滚动条补偿几何` | 打开锁定、关闭复位；补偿按「实测滚动条宽」与「body margin-right 归零」推导，in-flow 内容宽度变化与推导值相差 ≤1px；有滚动条时 `padding-right` = 实测宽 |
| M6-1 C3 | `bodyLock` 取锁 | `C3 单层：bodyLock Select 单独取锁并在关闭后复位` | 无模态父层时单独打开 `body-lock` Select：`overflow` 锁定、`padding-right` 按实测宽补偿、关闭后逐项恢复 |
| M6-1 C4 | Drawer 长列表 | `C4 Drawer：长列表面板内部可滚动且不越出视口` | `scrollHeight > clientHeight`、面板不越出视口、滚轮改变 `scrollTop`、`End` 后末项进入视口 |
| M6-1 C5 | Esc / 外部点击分层 | `C5 Dialog：Esc 与外部点击按层关闭` | ① Esc 只关面板、对话框存活；② 点击对话框内部空白只关面板、对话框存活；③ 点击遮罩关闭对话框 |
| M6-2 | C2 负向对照 | `C2 负向对照：关闭后残留 pointer-events: none 时真实点击不生效` | 基线可点击；注入 `body.pointer-events: none` 后同一真实点击**不得计数**（证明上条断言有判别力） |
| M6-2 | Dialog + Select（`bodyLock`） | `C3 栈：Dialog + Select（bodyLock）逐层释放滚动锁` | 两层锁定期间保持 `hidden`；关闭子层后父层锁与指针抑制仍在；最后一层关闭后逐项恢复 + 几何复位 |
| M6-2 | Dialog + Drawer | `C3 栈：Dialog + Drawer 叠加，Esc 只关最上层` | 第一次 Esc 只关抽屉、对话框与滚动锁保持；第二次 Esc 关闭并恢复 |

合计 **10 条用例 × 3 档视口 = 30 次执行**；M6-1 的 C1 ~ C5 各 ≥1 条，M6-2 的两类叠加与负向对照齐备，满足登记验收。

与既有规格的分工（不重复）：`overlay-stacking` 仍负责层级 / 命中测试；`overlay-interaction` 仍负责单层焦点落位与滚动锁复位；`select-long-list` 仍负责 Dialog 内长列表。本规格只补「真实指针的交互完整性、残留、栈、几何与负向对照」。

## 2. 实现要点

- **新规格**：`test/e2e/overlay-collaboration.e2e.ts`（单文件承载两个批次，避免散落）。
- **夹具**：`test/e2e/fixtures/app.vue` 末尾追加 `#overlay-collaboration` 段（对话框、抽屉、页面级 `body-lock` 选择器、点击探针与计数、几何探针、与 `v-model` 同源的回显）。追加在末尾，不改动既有受检元素的绝对位置。
- **真实指针**：展开路径用 `mouse.move → down → up`，并在 `down` 与 `up` 之间断言面板已可见——面板若退回 click 兜底会失败。
- **残留判定**：`body` 内联值快照对比（不是「恢复为空」），并追加真实点击探针，覆盖「样式复位但指针事件仍失效」这一类不可见残留。
- **几何判定**：in-flow 全宽探针的 `getBoundingClientRect` 与按补偿契约推导的期望值比较（见下），不使用 `scrollWidth`（补偿本身会改变它）。实测滚动条宽取 `innerWidth - documentElement.clientWidth`。
- **补偿推导**（Reka `useBodyScrollLock`）：① 滚动条占位消失使内容可用宽 +sw；② `body.padding-right = sw` 抵消 ①；③ `body.margin-right` 被置 0 使内容宽再增加「打开前的 margin-right」（Chrome 默认 8px）。故期望宽度变化 = `scrollbar > 0 ? marginRightBefore : 0`，水平位置不变；覆盖 ② / ③ 任一缺失都能以 1px 上界判出。
- **真实滚动条**：Playwright 默认下发 `--hide-scrollbars`，滚动条不占位（实测 `innerWidth === clientWidth`），补偿路径恒不触发；本规格在文件级移除该默认参数（`ignoreDefaultArgs`），并原样复制 `playwright.config.ts` 的容器必需参数（覆盖 `launchOptions` 会整对象替换；不直接 import 配置，避免跨 TS 工程引用）。
- **冷启动防护**：`scrollbarWidth()` 先等夹具段挂载再量测——冷启动时 `goto` 可能早于应用渲染，空文档会被测成 0。

## 3. 验证

| 项 | 命令 / 场景 | 结果 |
|:---|:---|:---|
| 新常驻规格 | `pnpm exec playwright test test/e2e/overlay-collaboration.e2e.ts` | **30 passed**（10 用例 × mobile / tablet / desktop；写录时点快照） |
| 相关既有规格 | `overlay-stacking` / `overlay-interaction` / `select-long-list` / `drawer-convergence` | 全绿 |
| 布局回归 | `field-overflow`；`responsive`（含整页横向溢出、极窄 / 空档定向档） | 全绿 |
| 全量 E2E | `pnpm exec playwright test` | 全绿（无新增失败） |
| 静态检查 | `pnpm exec eslint`（测试两文件，`--max-warnings 0`）；`pnpm typecheck` | 零 error |
| 文档门禁 | `pnpm exec lint-md`（改动 md）；`pnpm governance:check` | 通过 |
| **负向验证**（C4） | 临时把 `.caomei-select__viewport` 的 `max-height` 改为 `none` → 重跑 C4 | **失败**（`scrollHeight > clientHeight` 不成立）；恢复后通过 |
| **负向验证**（C3 几何） | 临时把期望宽度变化改成「补偿缺失态」（`marginRightBefore + scrollbar`） | **失败**（实际 Δ=8 ≠ 23），证明几何断言能判出补偿缺失 |

实测读数（写录时点）：desktop 档滚动条宽 15、打开时 `body.padding-right = 15px`、`body.margin-right` 由 8px 置 0（in-flow 内容宽 +8）；mobile / tablet 档在移动仿真下为 overlay 滚动条（实测宽 0），走「无占位不写入补偿」分支。

> 负向验证的**操作陷阱**：复用中的夹具 dev server 曾继续服务旧模块，使「移除上限」后的 C4 仍通过；重启 `webServer` 后同一场景立即失败。负向对照前必须确认被测改动已进入页面（重跑 / 重启 dev server），否则「通过」只说明服务端是旧代码。

## 4. 边界

1. 不覆盖 T3（C6 ~ C9 嵌套 / 焦点 / 触摸）与 T4（C10 打开态 axe），二者仍在 [Backlog](../../plan/backlog.md) 候选；C6 依赖「嵌套遮罩层级」评估结论。
2. **代表组件 × 容器的取舍**：10 条用例全部以 Select 为面板、Dialog / Drawer 为容器；Popover / DropdownMenu / MultiSelect / AutoComplete / Toast 等其他浮层组合不在本批矩阵（取舍与理由见调研 §4「不建议」）。
3. 不修复调研 §4.1 的两项待判定缺陷（嵌套遮罩固定档位、`pointer-events` 锁模型）。C2 / C3 是它们的常驻守卫：失败时先查 owner 释放与卸载时序，不直接改回 overflow。
4. 不重复 `overlay-stacking` 的 z-index / 命中测试结论；C5 的「点击内部空白」在 Select 打开时物理命中的是遮罩（模态内容被上游置为 `pointer-events: none`），断言只判「面板卸载 / 对话框存活」这一行为契约。
5. `test/e2e/**` 不在 `lint:css` 的 glob 内（既有口径）；新增夹具样式随 ESLint 与浏览器断言校验，不新增 stylelint 受检面。
6. 视觉基线不受影响：`test:visual` 按 `#id` 局部截图，末尾追加段落不进入任何既有采样面；本批未重跑视觉基线（采样面推理依据见 `test/visual/components.visual.ts`）。
7. 触摸滚动（CDP `Input.dispatchTouchEvent`）不在本批，登记在 T3。

## 5. Review Gate

- **审计声明**：第 1 轮；按 §3.2 拆两个分区并行——**测试分区**（新增 spec + 夹具段）与**文档分区**（治理记录 + 索引 + `todo` + `.session`），两分区均 `standard`（新增行数 > 400 但只有「测试 / 文档」两个模块，无 `src` 变更），时间盒各 ≤10 分钟。
- **测试分区**（`standard`）：`Pass`（0 blocker / 3 warning / 6 suggest）。
  - warning：① in-flow 几何上界取「实测滚动条宽 +1」会让补偿缺失态同样通过 → 改为按补偿契约推导期望值（`marginRightBefore`）+ 1px 上界，并补机制断言；② `bodyLock` 子层的「取锁」被父层锁掩盖 → 增设页面级 `body-lock` Select 用例；③ 夹具注释残留批次标签 `T2`（机检盲区）→ 改为语义表述。
  - suggest：复用 `helpers/layout` 的 `TOLERANCE` / `boxOf`；C4 展开改走真实指针；选项匹配改精确可访问名；关闭后断言面板**卸载**而非仅 `data-state` 切换；计数读取前断言节点形态 → 全部采纳。`CHROMIUM_ARGS` 不改为 import（跨 TS 工程引用会触发 TS6305，已在注释登记）。
- **文档分区**（`standard`）：`Pass`（0 blocker / 2 warning / 5 suggest）。
  - warning：① `todo` 完成态先于 §5 结论 → 本轮结论回填与完成态同批提交；② `.session` 计数与声明不一致（待执行条数、`quick`/`standard`、预写审计结果）→ 已改正。
  - suggest：C5 断言描述、回归读数收敛为「全绿 / exit 0」、§2 措辞避免误读为改动配置、补「代表组件 × 容器」边界、补跑 `responsive` 并声明视觉基线未跑 → 全部采纳。
- **复查基线**：本记录 §1 / §3 / §4；`test/e2e/overlay-collaboration.e2e.ts`；`test/e2e/fixtures/app.vue` 的 `#overlay-collaboration` 段；`docs/plan/todo.md` 两行状态；`docs/design/governance/index.md` 首条；`.session` 任务态。
