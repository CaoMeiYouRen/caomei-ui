# Phase 18 M2-5：浮层档位装置判别力补强

> 创建时间：2026-10-01
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 18 **M2-5**（测试稳定性与质量装置消缺）
> 前序：[模态内浮层被遮挡修复记录](./2026-09-30-overlay-stacking-in-modal-fix.md)（其 §4 的三条 follow-up 即本条目范围）
> 决策依据：用户 2026-09-30 裁定 **D4「全取」**——C38 补三条判别力（含 `PANEL_CASES` 与声明层门禁联动）
> 快照：本仓工作区（`check-overlay-z-index` exit 0、守卫单测 41 passed、`pnpm test:e2e --workers=2` 117 passed）；**未推送**

---

## 1. 结论

- 三条 follow-up 全部落地，且每条都带**前置守卫 + 负向对照**（§4 实测）：
  1. **`inline` ColorPicker 补绘制顺序命中**：由「只断言计算 `z-index === 'auto'`」升级为「声明层 + 真实绘制顺序」双层——面板可见区中心必须被**模态层**命中而非面板自身。
  2. **命中测试判别力覆盖模态内容后代**：补偿后除根节点外，还自证模态内容的**后代**可命中（防「`pointer-events: none` 挂在子包裹层」导致命中测试失真）。
  3. **E2E 面板清单与声明层门禁联动**：受检清单下沉为单一事实源 `test/e2e/fixtures/overlay-panels.json`，声明层守卫新增 **T10 双向对账**（`src` 锚定面板组件 ↔ 清单条目），新增 portal 浮层组件而未补清单即 `governance:check` 失败。
- 零 `src/**` 改动、零视觉变更；E2E 用例数与既有 117 项持平（本批为**判别力补强**，不新增用例）。

---

## 2. 三条补强（对应 follow-up）

### ① `inline` ColorPicker 的绘制顺序命中

- **原缺口**：只断言计算 `z-index === 'auto'`（「不参与浮层层叠」的**充分条件**）；真实绘制结果无断言，且该形态在页面流内、与居中模态的几何重叠随滚动变化。
- **现判定**（`inlinePaintOrderHitTest`）：
  - **几何前置**：面板须与视口有非零交集（`scrollIntoViewIfNeeded` 后测量），否则命中测试无判别力；
  - **声明层**：计算 `z-index === 'auto'`（保留）；
  - **绘制顺序**：取面板可见区中心做 `elementFromPoint`——命中元素**不得**落在面板内，且**必须**落在模态层（模态内容子树或遮罩）。
- **补偿**：模态打开时上游把宿主内容整棵子树置为 `pointer-events: none`，命中测试会跳过不可命中元素而恒返回模态层；故命中测试前把面板自身临时恢复为可命中（`auto` 对祖先 `none` 生效），测试后按保存的内联值还原。
- **替代参照**：不做「与模态内容重叠」的几何前置（内联面板在页面流内，重叠随滚动变化），改用**模态遮罩**作参照——遮罩覆盖整个视口，只要面板可见，其可见区中心必然处于模态层之下。

### ② 命中测试判别力覆盖模态内容后代

- **原缺口**：补偿后只自证模态内容**根节点**可命中（`getComputedStyle(dialog).pointerEvents !== 'none'`）。
- **现判定**：在同一补偿窗口内，另取模态内容内一个**可命中的后代**，确认其中心点的命中仍落在模态内容子树内且**不是根节点自身**——证明「补偿确实到达后代，后代参与绘制顺序」。
- **口径（存在性）**：该自证是**存在性**判定（「至少有一个后代可命中」），不锚定主探针点；其残余失效模式（仅主探针点所在的子包裹层被置 `none`）见 §7。
- 触发条件（负向对照见 §4）：`pointer-events: none` 若挂在模态内容的**子包裹层**上，根节点可命中而后代不可命中，原自证会放行、命中测试失真。

### ③ `PANEL_CASES` 与声明层门禁联动

- **原缺口**：E2E 清单（7 项）与声明层门禁未联动——新增 portal 浮层组件时门禁的计数单测会失败并强制复核，但**不会**强制把新组件补进 E2E 清单（`MIN_PANEL_CASES` 只是下界）；已登记为流程边界。
- **现判定**：
  - **单一事实源**：E2E 受检清单下沉为 `test/e2e/fixtures/overlay-panels.json`（`cases` 数组），Playwright 用例经 import attribute 读取；
  - **T10 双向对账**（`findPanelCaseLinkIssues`）：`src` 中「浮层档位 + 覆盖钩子」的组件目录集合，与清单条目逐一对应——`[panel-case-missing]`（组件未登记）/ `[panel-case-stale]`（清单条目无对应声明）双向拦截；
  - **非面板例外名单**：`toast`（命令式视口）与 `image`（预览灯箱）显式排除并受**反向校验**（`[stale-non-panel]`）。
- 结果：新增 portal 浮层组件而未补 E2E 清单时，`check:overlay-z-index`（`governance:check` 链内）直接 exit 1。

---

## 3. 实现与接线

| 文件 | 改动 |
|:---|:---|
| `test/e2e/fixtures/overlay-panels.json`（新增） | E2E 受检面板清单（单一事实源，7 项） |
| `test/e2e/overlay-stacking.e2e.ts` | 清单改为读 JSON（`import … with { type: 'json' }`；守卫与单测改以 `readFileSync` 读**同一文件**，两种读法并存但事实源唯一）；`paintOrderHitTest` 增后代自证；新增 `inlinePaintOrderHitTest` 与内联用例的绘制顺序判定 |
| `scripts/governance/check-overlay-z-index.mjs` | 新增 `NON_PANEL_FLOATING_COMPONENTS` / `collectAnchoredPanelComponents` / `readPanelCaseNames` / `findPanelCaseLinkIssues` / `collectOverlayDeclarations`；T10 接入 `runChecks` 与 CLI 输出 |
| `scripts/governance/check-overlay-z-index.test.mjs` | 新增 T10 单测 7 例（含仓库现状双向一致） |
| `docs/standards/development.md` §7 | 浮层档位条补「E2E 受检清单 JSON + T10 双向对账」口径 |

---

## 4. 判别力自证与负向对照

| 编号 | 前置守卫 / 自证 | 负向对照（实测，改动后已还原） | 结果 |
|:---|:---|:---|:---|
| ① | 面板与视口非零交集、补偿后面板可命中、模态遮罩可命中 | 去掉 `color-picker.vue` 档位规则的 `:not(.caomei-color-picker__panel--inline)`（并临时停用声明层断言以隔离） | 绘制顺序断言失败：`内联面板被自身命中（绘制顺序异常…）：div.caomei-color-picker__area-bg`；**未停用声明层断言时**该变异先被 `z-index 1050 ≠ auto` 拦下 |
| ② | 补偿后模态内容**根节点与后代**均可命中 | 让模态内容**直接子元素**均不可命中（根节点仍可命中） | 后代自证失败：`命中测试判别力自证失败：模态内容后代不可命中（补偿可能只作用于根节点，或 pointer-events: none 挂在子包裹层）` |
| ③ | `src` 锚定面板集合 ↔ 清单条目双向相等；非面板例外名单反向校验 | ① 从清单删去 `dropdown-menu`；② 清单加入 `ghost` | ① `[panel-case-missing] 组件 dropdown-menu 声明了锚定浮层档位，但未登记于 E2E 面板清单`；② `[panel-case-stale] E2E 面板清单条目 "ghost" 无对应的锚定浮层档位声明`；两者均 exit 1 |

- 三组对照均在还原后复跑通过；`git diff -- src/` 为空。

---

## 5. 规模与质量门

- **规模**：**9 文件 = 7 改 + 2 新增**。改：`test/e2e/overlay-stacking.e2e.ts`、`scripts/governance/check-overlay-z-index.mjs`、`scripts/governance/check-overlay-z-index.test.mjs`、`docs/standards/development.md` §7、`docs/design/governance/2026-09-30-overlay-stacking-in-modal-fix.md`（§4 追加「后续批次收口」指针）、`docs/design/governance/index.md`、`docs/plan/todo.md`。新增：`test/e2e/fixtures/overlay-panels.json`、本记录。**零 `src/**` 改动**。
- **质量门（本批实测）**：
  - `node scripts/governance/check-overlay-z-index.mjs` exit 0（输出含「锚定面板与 E2E 清单 7 项联动」）。
  - `npx vitest run scripts/governance/check-overlay-z-index.test.mjs` → **41 passed**（34 → +7）。
  - `npx playwright test overlay-stacking` → **6 passed**（2 用例 × 3 档视口）；`pnpm test:e2e --workers=2` → **117 passed**（零回归）。
  - `eslint` / `vue-tsc --noEmit` 全绿；提交前复跑 `pnpm verify`。
- **V 阶段**：无 `src/**` 改动、无可见 UI 面，显式跳过 `@ui-validator`；浏览器侧证据由常驻 E2E 承载（本批即对它的判别力补强）。

## 6. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 4 warning / 3 suggest。本地留痕 `artifacts/review-gate/2026-10-01-phase18-m2-5-overlay-device-discriminating-power.md`。
- **审计方独立复核**（摘）：守卫 CLI exit 0（输出与调用方逐字一致）、守卫单测 **41 passed**（独立计数）、`playwright test overlay-stacking` **6 passed**、`eslint` / `vue-tsc --noEmit` / `lint-md` / `check-docs-integrity` / `check-planning-numbers` / `check-governance-records` 全绿；独立复算锚定面板集合 = 7，与 JSON 7 项及 `NON_PANEL_FLOATING_COMPONENTS` 三方一致；`git diff -- src/` 为空。
- **修复点（同批收口，记「已修复未复审」）**：
  - **RG-W1**（`todo.md` 完成态先于 RG 结论回填，与 M2-2 同类）：本 §6 回填即为生效前提（两者同批落地后方可提交）；「`todo.md` 完成态回填晚于 Review Gate 结论」的**约定载体**已登记 [Backlog §1.6](../../plan/backlog.md)。
  - **RG-W2**（§5 文件计数漏项）：改为「9 文件 = 7 改 + 2 新增」并逐文件列明（补入旧记录指针改写）。
  - **RG-W3**（后代自证为存在性判定）：§2 明确「存在性」口径，§7 显式登记残余失效模式与「为何不锚定主探针点」的净判别力论证。
  - **RG-W4**（T10 目录名为键的假阴性）：§7 显式登记触发条件（例外目录后续新增锚定面板时应收敛为文件 / 选择器粒度）。
  - **RG-S1**（两种 JSON 读法并存）：§3 注明两者指向**同一文件**、事实源唯一。
  - **RG-S3**（非面板例外反向校验口径）：`findPanelCaseLinkIssues` 增注释说明「只要求仍声明任一浮层档位，形态由 T4 / T5 判定」。
  - **RG-S2**（`MIN_PANEL_CASES` 与 T10 重复）：**保留**为纵深防御，规格内已注释自述「冗余守卫」。
- **实测用时**：派发 `2026-10-01T15:09:53+08:00` → 留痕写入 `2026-10-01T15:14:43+08:00`，**≈ 4 分 50 秒**（≤ 10 分钟时间盒，未超）。
- **未覆盖边界**（采信调用方证据）：三组负向对照未由审计方重跑（需改 `src/**`）；`pnpm test:e2e` 全量 117 与 `governance:check` 全链未复跑。

---

## 7. 已知边界

- ① 的绘制顺序命中以**模态遮罩**为参照（不做「与模态内容重叠」的几何前置）；若未来遮罩改为不覆盖整个视口，该参照失效——用例的「模态遮罩可命中」自证会失败并提示复核。
- ② 的后代自证为**存在性**判定（「至少有一个后代可命中」），**不锚定主探针点**。残余失效模式：仅主探针点所在的子包裹层被置 `pointer-events: none` 时，存在性自证仍通过、主命中测试可能假通过（跳过模态内容而返回面板）。**为何不锚定**：补偿已把模态内容**根节点**恢复为可命中，故在探针点临时禁用面板后的命中在健康态与失效态都可能落到根节点本身（`contains` 恒真），以 `hit !== 根节点` 为判据又会在探针落在内边距时误报——净判别力为负。该模式需上游改变 `pointer-events` 的挂载层级，属已知边界（触发时由 §4 对照 ② 的全后代失效形态先行暴露）。
- ③ 的 T10 以「组件目录名」为对账键：同一组件内多个浮层面板只算一项；`NON_PANEL_FLOATING_COMPONENTS` 为显式名单（当前 `toast` / `image`），受反向校验。**残余失效模式**：若某例外目录（如 `toast`）后续新增锚定面板，其锚定面板不会进入对账（目录已被整体排除）——触发时应把该例外收敛为「文件 / 选择器」粒度或移出名单。
- ③ 的非面板例外反向校验只要求「该目录仍声明任一浮层档位」（不限 `kind === 'hook'`），形态判定由 T4 / T5 承担。
- 不判「元素是否真的在 portal 中渲染」——该面由常驻 E2E 的真实渲染兜底（沿用 M3 记录的口径）。
