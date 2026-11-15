# Phase 34 M3-1：打开态 axe（Dialog / Select）与三层抗静默收窄

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M3-1 行。

## 1. 交付面（3 文件）

| 面 | 文件 |
|:---|:---|
| 抽检装置 | `scripts/docs/check-docs-axe.mjs`：打开态交互（`interact`）、按页规则面（默认 ∪ 页面登记）、矩阵自检 `validatePages`、`openSurface` 探针 |
| 单测 | `scripts/docs/check-docs-axe.test.mjs`：覆盖规则面并集 / 收窄 / 页级空集、矩阵自检各条守护的反例、打开态可见态与超时上限、点击失败口径、打开态下界、`--rules` 未覆盖时跳过、报告打开态标记与待复核计数 |
| 文档 | `docs/design/documentation-site.md` §17：矩阵 7 → 9 页、三层抗收窄、打开态两处口径（`aria-modal` 替代规则、`select-open` 的排除） |

治理索引、记录本体与规划状态位（`docs/plan/todo.md`）属登记 / 留痕，不计入上表。**未新增包导出**（`OPEN_STATE_RULES` / `pageRules` / `validatePages` / `openSurface` 是脚本内部导出，供单测直调）；装置改动不改 `verify` 链构成（§17 既有「不接入 verify」口径保持）。

## 2. 决策

1. **矩阵条目 +2 / 页面路径 +1**：`dialog-open`（`/components/dialog`）与 `select-open-zh`（复用 `/components/select`）。登记行写的「+1（Dialog + Select 打开态）」按「打开态这一类新增」理解；拆成两条是因为打开态会改变同一页的适用节点结构（`select-open` 的 `button-name` 被整页 `aria-hidden` 压到 0，`dialog-open` 仍有 3 个），与闭合态混在一条会破坏后者已登记的下界。
2. **打开态是第三种抗静默收窄**：新增 `interact: { trigger, open, label }`，先点击触发器、再等打开选择器可见，超时即抛错。理由：浮层没打开时打开态规则的适用节点是 0，而「规则没生效」与「页面合规」读数完全相同——不确认打开态，零违规没有判别力。
3. **规则面从「全局 2 条」改为「默认 ∪ 页面登记」**：`--rules` 未显式给出时内部为 `null`（**不裁剪**），否则交集会把页面追加的打开态规则静默剪掉（首轮实测即如此）。
4. **`aria-modal` 没有对应 axe 规则**：axe-core 4.14 的规则清单里只有 `aria-dialog-name` / `aria-hidden-focus` / `aria-allowed-attr`，`aria-modal` 的合法性由 `aria-allowed-attr`（role × ARIA 属性组合）覆盖，白名单据此替换并在脚本头与 §17 写明依据。
5. **`select-open-zh` 有意排除 `aria-hidden-focus`**：实测 Select 展开时 Reka 给兄弟节点只加 `aria-hidden`、未加 `inert`，规则命中 `#app`（其内仍有百余个可聚焦元素）。这是既有缺口而非误报——登记 **F18** 交组件无障碍批次处理；不在全局规则面放宽，也不把该页的这条规则登记成「已通过」。
6. **矩阵自检 fail-closed**：`validatePages` 拒绝重复 `key`、缺 `trigger` / `open` 的 `interact`、以及「登记了追加规则却没有 `interact`」的页面；`path` 允许重复（闭合态与打开态共用一个页面）。
7. **`button-name` 下界按页实测**：`select-open-zh` 打开后整页被 `aria-hidden`、适用节点归零 → 不设下界（硬设会逼着把「打开态」降级成「不要打开」）；`dialog-open` 打开后弹层内仍有 3 个可访问名节点 → 下界取 3，不放弃这层保护。`dialog-open` 的 `ready` 下界取**打开前**实测的 9（打开后弹层自带两键，报告里的受检元素是 11）。
8. **§17 同批同步**：页数、规则面、三层抗收窄、两处打开态口径与已知边界（浮层只覆盖 Dialog / Select 打开态）。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 打开态两页 | 零违规。`/components/dialog`（打开态）：`button-name` 3、`aria-dialog-name` 1、`aria-allowed-attr` 2、`aria-hidden-focus` 2（1 待复核）；`/components/select`（打开态）：`aria-allowed-attr` 3；其余页面维持原读数 |
| 打开态 fail-closed | `openSurface` 单测覆盖：成功静默返回、超时抛出「打开态未建立 + 页面 + 选择器」 |
| 单测 | `npx vitest run scripts/docs/check-docs-axe.test.mjs` → 全部通过（含新增反例单测） |
| 矩阵自检 | 守护清单以 `validatePages()` 的 JSDoc 为唯一事实源，每条守护均有反例单测；`pageRules` 页级空集亦抛错（防 `--rules` 不覆盖时「零规则零违规」） |
| `docs:build` / `docs:check` | 通过 |
| `pnpm verify` | exit 0（中间两次全量跑各命中一例 `date-picker` 时序 flaky：`hourFormat` 换算与键盘区间用例，隔离与复跑均通过，本批未触及该组件） |

## 4. Review Gate

- **R1（`standard`，A 装置与单测 / B 记录与索引两分区并发）**：A `Reject`（3 blocker：`validatePages` 声称「矩阵写错即失败」却漏两条静默通道——空矩阵与 `minApplies` 越界；脚本头仍把 `aria-modal` 写成运行规则、且「两层 / 8 页」与实现矛盾；「打开态 `button-name` 归零」只对 Select 成立、Dialog 实测 3。5 warning：`openSurface` 成功路径未断言 `state` / `timeout`、`formatReport` 新分支无断言、报告头标签在收窄时失真、`dialog-open` 的 `minSubjects` 未按实测、Dialog 闭合态缺条目且未进已知边界）。B `Reject`（1 blocker：单测「新增 12 例」与实际不符（净增 10）；5 warning：`dialog-open` 的 `button-name` 前提矛盾、脚本头 `aria-modal` / 页数、`validatePages` 缺第 4 条不变量、F18 缺关闭判据、`--rules` 收窄到页级空集仍判 OK）。
- **R1 修复**：① `validatePages` 补不变量（清单见其 JSDoc），`pageRules` 页级空集改为抛错，每条守护均补反例单测；② 脚本头三处与 `openSurface` JSDoc 统一为 `aria-allowed-attr`，页数改为指向 `PAGES`；③ `dialog-open` 补 `button-name` 下界 3、`ready` 下界取打开前实测 9，§2.1 / §2.7 与 §17 ② 改为按页口径；④ `select-open` 的规则改为显式列表并写明 F18 关闭判据；⑤ `openSurface` 补「点击失败」包装并保留原始错误，单测断言 `state: 'visible'` 与 `timeout`；⑥ 报告头改「规则面（本轮）」，补打开态标记与待复核计数断言；⑦ 单测计数按实测改写（新增 16 / 改写 3）。
- **R2（`quick`，两分区修复点）**：A `Pass`（B1 ~ B3 / W1 ~ W5 关闭；9 条 follow-up：报告头未收窄时仍只印默认规则、JSDoc 条数与实现不符、`minApplies` 值未校验、`rules` 未校验已知 id、待复核节点无坐标、两处断言判别力、测试名含 F18 编号——前四条已在本轮收口）。B `Reject`（1 blocker：不改「不变量条数」在四个载体上出现四种口径且「均补反例单测」不成立）→ 已改为「`validatePages` JSDoc 为唯一事实源、记录只引用不重算」，并补齐 `path` / `ready` / `minSubjects` / 未知规则 id / 下界非正整数的反例单测（33 → 36 例）。
- **R3（`quick`，B 分区单点复核）**：`Reject`（2 blocker：§4 仍写「六条不变量」且与自身枚举冲突；测试例数在 §1 / §3 / 索引之间出现两种口径，且索引复述测试读数）→ 已按「条数只在 JSDoc 出现」与「记录 / 摘要不复述测试读数」改写：§1 / §3 / 索引删去例数、§4 的修复项改为「清单见其 JSDoc」，§6 复查基线补「条数不在记录内复述」。
- **R4（`quick`，B 分区修复点）**：`Reject`（1 blocker：§4 / §6 新增「记录内不复述枚举」的否定式自述与 §3 的内联枚举冲突）→ 已删除 §3 的内联枚举与两处否定式自述，统一改为「以其 JSDoc 为唯一事实源」。
- **R5（`quick`，B 分区修复点）**：`Pass`（0 blocker；§3 / §4 ① / §6 三处文本一致且无否定式自述，§9 新条可执行；通过条件「`pnpm verify` exit 0」已满足）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | M4-1 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 | 承接 M1-6：Menu 槽包裹约束（组件页已写，`icon` 出口待评估） | 下一阶段评估 |
| F17 | 承接 M1-6：DataTable 逐格接线开销 | 出现性能反馈时评估 |
| F18 | **本批新增**：Select 展开时兄弟节点只加 `aria-hidden`、未加 `inert`，axe `aria-hidden-focus` 命中 `#app`；`select-open-zh` 因此排除该规则 | 组件无障碍批次（评估在模态隔离层补 `inert`）。**关闭判据**：`select-open-zh` 的 `rules` 加回 `aria-hidden-focus`（`aria-dialog-name` 在非对话框上无适用节点，不随之加回），且 `check-docs-axe.test.mjs` 的「Select 打开态有意排除」用例从 `not.toContain` 翻转为 `toContain('aria-hidden-focus')` |

## 6. 复查基线

本记录 §1 ~ §5；`check-docs-axe.mjs` 的 `PAGES` / `OPEN_STATE_RULES` / `pageRules` / `validatePages`（守护清单以其 JSDoc 为唯一事实源）/ `openSurface` / `auditPage` / `evaluateOutcome` / `formatReport`；`check-docs-axe.test.mjs` 的「打开态」describe；`documentation-site.md` §17。
