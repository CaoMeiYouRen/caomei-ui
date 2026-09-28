# `caumei` 选择器拼写缺陷修复与计算样式回归（含 0.4.0 发布条目登记与发布前门槛复核）

> 创建时间：2026-09-29
> 条目：Phase 16 **M5-1**（发布交付：选择器拼写缺陷修复 + 计算样式回归断言）与 **M5-2**（0.4.0 版本交付，**已登记、未执行**）；M5 为用户 2026-09-29 决策追加（D8 的「视情况决定」落定为发布 0.4.0）。
> 背景：0.4.0 发版评估中复核 `v0.3.0..b1da270` 的组件面改动（3 项新增公开能力 / 8 项行为与视觉修复 / 1 项内部重构）时，发现 v0.3.0 之后新增的 `Button` `iconOnly` 能力存在**样式选择器拼写缺陷**——规则选择器写作 `.caumei-button--icon-only`，而元素类名为 `caomei-button--icon-only`，规则永不命中。
> 快照：本仓 `b1da270`（Phase 16 M4 交付后，即本批次改动前的起点）。本记录为 M5 批次与本次发布前门槛复核的唯一交付口径。

---

## 1. 缺陷定性

**同一根因（`caomei` 前缀拼写为 `caumei`）在本批次共发现 4 处，分属 2 个组件，全部由 `v0.3.0..b1da270` 窗口内的提交引入**：

| # | 位置 | 引入提交 | 影响 |
|---|------|----------|------|
| 1 | `button.vue` 方形几何规则 | `d182da0`（v0.3.0 之后新增能力） | `iconOnly` 按钮不是方形：`padding` / `gap` 未归零、宽度由内容决定（md 档实测 50px，应为 36px）；文档站 Button 页「纯图标按钮」节整体渲染失准 |
| 2 | `button.vue` 图标 `margin: 0` 规则 | `d182da0` | 当前无可观察差异（`<span>` 默认外边距本为 0），属**未来防护缺口**：基类若给图标盒加外边距，纯图标形态将失去该覆盖 |
| 3 | `select.vue` 非法态聚焦覆盖规则 | `0dc4116`（字段 shell 样式层迁移） | **有真实可观察缺陷**：`!important` 非法态覆盖永不生效，非法且聚焦的 `Select` 边框与聚焦环显示**主色**而非危险色（实测 `border-top-color` 基线 `rgb(37, 99, 235)` vs 修复后 `rgb(220, 38, 38)`）——错误态在聚焦态不可辨 |
| 4 | `select.vue` 禁用态细节规则 | `0dc4116` | 当前无可观察差异（基类 `field-shell.css` 的 `.caomei-field--disabled` 已提供 `cursor: not-allowed`） |

- **引入窗口取证**：`git log b1da270 --oneline -S'.caumei' -- src/components/select/select.vue` 仅命中 `0dc4116`；`git show v0.3.0:src/components/select/select.vue` 中 `caumei` 与 `caomei-field--invalid` 均为 0 命中 → 这 2 处**不是历史遗留**，而是随字段 shell 迁移在本发布窗口内引入。
- **逃逸路径（三重覆盖面均恰好绕开）**：
  - 单测 `iconOnly 尺寸 %s 时宽度等于高度` 只断言 **class 存在**，不断言计算样式；happy-dom 无布局引擎、不算 SFC scoped CSS，本来也无法断言。
  - 计算样式冻结基线**原采样面 239 项不含 icon-only 形态**（`git show b1da270:test/capture/baseline.json | grep -c 'icon-only'` = 0；修复后冻结态为 6）。
  - `state.select.invalid` **在册但已把失效行为冻结为基线**——装置本身不报错，只有「修复」才会让它报差异（见 §4）。
  - 常驻 E2E（夹具 69 项 + 组件画廊 8 项）采样面同样不含上述形态。
- **定性**：`#1` 与 `#3` 属**对外可用性缺陷**，命中[规划规范 §3.5](../../standards/planning.md) 的「直接影响可用性的 blocker 级缺陷」插队形态；因均属**样式细节**，按[版本与兼容策略](../../guide/version-policy.md) §0.x API 冻结窗口属**非冻结面**（类名与实现细节），修复不构成公开契约变更。
- **机检盲区**：现有守卫（`check-design` 的选择器形态规则、`check-planning-numbers`、`guard-ref-attrs`）**均不校验类名前缀拼写**，故 4 处缺陷可长期存活；同类缺陷的机检守卫已登记为后续候选（见 §6.2）。

## 2. 修复

**只改选择器拼写，不改任何声明值与规则结构**：

- `src/components/button/button.vue`：`.caumei-button--icon-only` → `.caomei-button--icon-only`（2 处）。
- `src/components/select/select.vue`：`.caumei-field--invalid` → `.caomei-field--invalid`、`.caumei-select` → `.caomei-select`（2 处）。
- `src/components/button/button.test.ts`：把名不副实的单测 `iconOnly 尺寸 %s 时宽度等于高度` 改名为 `iconOnly 尺寸 %s 时应用 icon-only 类（真实几何由 capture:styles 承载）` 并补注释，指向真实的几何契约载体——该误名正是本缺陷逃逸的成因之一。

修复后的真实浏览器计算样式：

- `iconOnly` 三档均为方形：`sm` 28×28px、`md` 36×36px、`lg` 44×44px，`padding-*` 与 `gap` 全为 `0px`。
- 非法且聚焦的 `Select`：`border-top-color` 由主色 `rgb(37, 99, 235)` 变为危险色 `rgb(220, 38, 38)`，聚焦环同步为危险色 20% 合成。

## 3. 回归断言（装置扩容）

缺陷的根因类别（选择器拼写错误）**改变不了任何 DOM / 事件契约**，只能由真实浏览器计算样式证明，故按[测试规范 §4](../../standards/testing.md) 扩展现有的计算样式采集装置，而不新增断言层级：

- `test/capture/fixture/app.vue`：新增纯图标按钮采样段（`sm` / `md` / `lg` 三档，`data-cap="button-icon-only:<size>"`），图标经 `#icon` 插槽传入（`iconOnly` 不渲染默认插槽内容，属既有契约；夹具若误用默认插槽会「冻结一个空白按钮」）。
- `test/capture/capture.mjs`：新增 `ICON_ONLY_PROPS`（按钮盒 7 项：`width` / `height` / 4 个 `padding-*` / `gap`）与 `ICON_ONLY_ICON_PROPS`（图标盒 4 个 `margin-*`），并新增 `button-icon-only.<size>` 与 `button-icon-only-icon.<size>` 采样声明；采样面 **239 → 245**。图标盒**不采样** `width` / `height`——其尺寸由消费者传入的图标决定，不属组件契约（采样会把夹具固有尺寸当成契约冻结）。
- `test/capture/capture.test.mjs`：受检面预算同步为 **245**，前缀覆盖清单补 `button-icon-only.` 与 `button-icon-only-icon.`（防受检范围被静默收窄）。
- `test/capture/baseline.json`：重冻结基线。**相对 `b1da270` 的原基线，变更仅含 `capturedAt`、6 个新增键、以及 `state.select.invalid` 的 2 个属性值（`#3` 的修复效果，属有意变更）**——其余 238 项逐字节未变，键数 239 → 245。

> 采样面的判别力边界（如实声明）：`#2`（按钮图标 `margin: 0`）与 `#4`（`Select` 禁用态细节）**在拼写错误状态下也不产生任何可观察差异**（`<span>` 默认外边距为 0、基类已提供 `cursor: not-allowed`），故装置对这两处只提供**未来防护**（基线锁定其现值），不提供「拼写错误必报差异」的判别力。判别力由 `#1`（负向对照 A 报 **12 处**差异）与 `#3`（负向对照 B 报 **2 处**差异）证明。

## 4. 证据

| 环节 | 命令 | 结果 |
|------|------|------|
| 扩容后比对（冻结前） | `pnpm capture:styles` | **5 处差异**：3 个新增图标键 + `state.select.invalid` 的 `border-top-color` / `box-shadow`（后者即 `#3` 修复效果，证明该规则原本确实未生效） |
| 图标盒采样收窄后比对（第 2 轮 suggest 采纳） | `pnpm capture:styles` | **6 处差异**且全为 `button-icon-only-icon.{sm,md,lg}` 的 `width` / `height` 移除项（24px），无其它项 → 证明被移除的 2 个属性取自夹具图标固有尺寸而非组件契约 |
| 冻结基线 | `pnpm capture:styles:freeze` | 写入 **245 项** |
| 修复后复跑 | `pnpm capture:styles` | **0 差异：245 项逐属性与冻结基线一致** |
| **负向对照 A（按钮）** | `CAOMEI_SRC=<当前 src + 仅回注按钮拼写错误> pnpm capture:styles` | **12 处差异 / exit 1**，全部落在 `button-icon-only.{sm,md,lg}`：`width` 28→42 / 36→50 / 44→58，`padding-left`/`padding-right` 0→8/12/16，`gap` 0→4（`height` 不变，故「宽度 = 高度」是判别属性） |
| **负向对照 B（Select）** | `CAOMEI_SRC=<当前 src + 仅回注 select 拼写错误> pnpm capture:styles` | **2 处差异 / exit 1**：`state.select.invalid` 的 `border-top-color` 危险色→主色、`box-shadow` 同步翻转 |
| 单测 | `npx vitest run test/capture/capture.test.mjs src/components/button/button.test.ts` | capture **17** tests + button **44** tests = **61 passed** |
| 全量质量门 | `pnpm verify` | **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全链） |
| 全量单测 | `pnpm test` | **91 文件 / 1885 passed** |

> 负向对照的环境口径：把 `src/` 复制到仓库外、仅回注目标拼写错误，按[测试规范 §7](../../standards/testing.md) 的既有经验补 `node_modules` 符号链接后以 `CAOMEI_SRC` 指向该副本（否则夹具页面空白、`waitForSelector` 超时）。两个对照各自只回注一处，用于隔离判别力归属。

## 5. 发布条目登记与发布前门槛复核

- **发布条目登记**：用户 2026-09-29 决策**发布 0.4.0**（Phase 16 D8 的「视情况决定」落定），登记为 `todo.md` 的 **M5-2**，状态「已登记，未执行」。**本轮不执行** CHANGELOG 生成与 `pnpm release`；M5-2 的验收标准写入「执行须由用户明确指令后方可执行」的前置条件，执行次序按[发布指南 §3](../../guide/release.md)（bump `package.json` + `pnpm changelog` → 复跑 `verify` → 提交 → annotated tag → publish）。
- **发布内容口径（供 M5-2 执行时引用，ref 钉定 `v0.3.0..b1da270`）**：
  - `git log --oneline --grep='^feat' --grep='^fix' v0.3.0..b1da270` = **18** 个（9 `feat` + 9 `fix`），构成等式为 **3 + 8 + 6 + 1 = 18**：**3 项新增公开能力**（`Button` `iconOnly` / `Select` `#value` 插槽 / `DataTable` `--caomei-data-table-pagination-justify` token）+ **8 项组件行为与视觉修复**（Stepper / MultiSelect / Calendar / 下拉触发器 / SelectGroup 的 a11y 与引用型属性收口 5 项；soft 变体底色、toast 中性描边与图标回退、switch 滑块前景的对比度与配对修正 3 项）+ **6 项治理 / 文档面 `feat`** + **1 项治理 / 文档面 `fix`**。
  - **不命中该过滤但同属发布面的库内改动 1 项**：`0dc4116 refactor(styles)`（抽离 `field-shell.css` 并迁移 4 个字段组件），伴随类名 `caomei-{input,textarea,input-number,select}--{sm,md,lg,invalid,disabled}` → `caomei-field--*`——属非冻结面的类名变更，须在发布说明披露。
  - **合计发布面组件相关改动 = 3 + 8 + 1 = 12 项**（与 `feat` / `fix` 过滤的 18 个提交不是同一集合，两数不可混用）。
- **发布前门槛复核（[长期任务](../../plan/recurring.md) §3 第 16 轮，2026-09-29）**：两组任务的全部候选重新取证。

| 任务 | 待执行批次 | 条件触发 / 未达门槛 | 已判定不纳入 |
|------|-----------|--------------------|--------------|
| 代码复用治理 | **0 项维持** | 条件触发 **1 项维持**（表单控件公共 props 契约后续候选） | 5 项维持 |
| 样式重复收敛 | **0 项维持** | — | — |

- **取证（2026-09-29 实测）**：`useLabelAttrs` 15 / `labelAttrs` 9 / 模板级 `:aria-label="label"` 0 / 继承公共契约 12 / 含内联同名字段 31 / `useFocusControl` 4 / `useAttrs()` 手写 `.vue` 11；数值钳位 2 处（`input-number.vue:131/134` 1 处 + `date-picker/time-input.vue:62`（4 个调用点）1 处）。**全部计数与第 15 轮一致**，无漂移，故不涉及归因。
- **未纳入实现批次**：本轮为发布前复核轮，当轮用户授权范围为「`caumei` 拼写修复 + 回归断言 + 发布条目登记 + 门槛复核」，未授权两组治理任务的新实现批次；下次触发点为下一次阶段收口 / 发布前，或用户指定。

## 6. 边界与未覆盖

- **§6.1 已登记的独立缺陷（本轮不修）**：`docs/examples/button/icon-only.vue` 的 22 个按钮把图标放在**默认插槽**（`<CaomeiButton icon-only label="…"><Search /></CaomeiButton>`），而 `iconOnly` 按既有契约（单测「`iconOnly` 时不渲染默认插槽内容」锁定）只渲染 `#icon` 插槽 → 即使选择器修复到位，该示例仍会渲染**空白方块**。用户 2026-09-29 裁定：**先登记、不修**，并调研 PrimeVue 等组件库的纯图标用法（`icon` prop / `#icon` 插槽 / 默认插槽取图标）优劣后再在「改示例」与「放宽组件语义」间决策。载体：[Backlog](../../plan/backlog.md) §1.1 的「Button `iconOnly` 示例形态与默认插槽语义」行。
- **§6.2 同类缺陷的机检守卫（候选）**：本缺陷类（类名前缀拼写错误导致规则永不命中）**无任何机检面**。候选守卫：扫描 `src/**/*.{vue,css}` 的样式选择器，对 `ca` 开头的类名令牌要求命中 `caomei-` 前缀白名单（或反向校验「选择器中的 `caomei-*` 类名必须在该组件模板 / 全局样式中出现过」）。形态与误报边界需先论证，已随本记录登记为 Backlog 候选。
- **§6.3 未纳入采样面**：纯图标按钮的**聚焦态描边**未单独采样（`button-focus.*` 矩阵不含 icon-only 形态）；该形态的 `outline` 由基类 `.caomei-button:focus-visible` 单点承载，未被本次修复触及。`Select` 的禁用态（`#4`）亦无可观察差异可采。
- **§6.4 装置边界**：新增采样只覆盖**声明式计算样式**；`Select` 非法态的实际**可感知性**（颜色对比度是否达标）不在本装置面内，其色值来自 `--caomei-field-invalid-*` 既有 token（本批次未改）。

## 7. 已知偏差与附带纠正

- **附带纠正（载体现状句漂移）**：`roadmap.md` 的 Phase 16 现状句与状态行仍写「登记 = 范围授权，实施未启动」，而 `todo.md` 已记录 M1~M4 全部交付。本批次按[规划规范 §3.8](../../standards/planning.md) 的载体收口要求一并订正为「2026-09-28 交付 M1~M4、2026-09-29 交付 M5-1（M5-2 已登记未执行）」。经 `git show 444f4fa -- docs/plan/roadmap.md` 与 `git log --oneline 444f4fa..b1da270 -- docs/plan/roadmap.md` 取证：该漂移系**登记批次之后的交付批次未回扫**所致，非本批次引入。
- **不追溯修正**：`test/capture/baseline.json` 中除 `state.select.invalid` 外的历史采样项口径不变；`capturedAt` 随冻结更新属生成物固有字段。

## 8. 规模

- 计入阈值：**12 文件 / +178 −22**（全量 `git diff --cached --numstat` 合计 `+226 −25`，扣除生成物 `test/capture/baseline.json` 的 `+48 −3`；本记录自身 108 行计入）。唯一口径复算命令：`git diff --cached --numstat`（须在全部产物 staged 后执行）。

## 9. Review Gate 记录

- Round 1（并发分区审计，`standard`）：分区 A（代码与测试装置）**Pass**（0 blocker / 1 warning / 2 suggest）；分区 B（治理载体）**Reject**（2 blocker / 1 warning / 2 suggest）；汇总取最严 → **Reject**。两个 blocker 为：发布面计数构成自相矛盾（同一集合出现 18 / 19 / 12 三种口径）、计数依据命令以 `HEAD` 而非持久 ref 钉定。分区 A 的 warning 命中真实存量缺陷（`select.vue` 另 2 处同根因拼写错误），已并入本批次修复范围（见 §1 / §2）。
- Round 2（修复点复审，范围冻结）：分区 A'（代码与测试装置）**Pass**（0 blocker / 0 warning / 1 suggest）；分区 B'（治理载体）**Reject**（1 blocker / 1 warning / 0 suggest）；汇总取最严 → **Reject**。阻塞项：记录 §1 的引入窗口取证命令缺显式 revision（隐式 `HEAD`，属 R1-B2 同类复发）；warning 为 §1 的 `grep -c 'icon-only'` 未钉快照（被本批重冻结自我证伪）。分区 A' 的 suggest（图标盒采样的 `width` / `height` 属夹具固有尺寸而非组件契约）已采纳。
- Round 3（复发项与 suggest 的修复点复审，范围冻结）：单一审计 **Pass**（0 blocker / 0 warning / 0 suggest）。R2 的 1 blocker + 1 warning + 1 suggest 全部关闭：引入窗口取证命令已钉 `b1da270` 且全载体回扫无隐式 `HEAD`；`grep -c 'icon-only'` 改为钉快照形式（`git show b1da270:…` = 0，修复后冻结态 6）；图标盒采样收窄为 4 个 `margin-*` 并声明其非契约属性。残余（非阻断）：R1-B2 → R2-B1 属**复发**（连续 2 轮同类），按 §3.5 应收敛为机检约束，已登记 [Backlog](../../plan/backlog.md) §1.6「文档内取证命令的 revision 钉定守卫」；本轮 3 轮预算内已取 `Pass`，故 §3.5 改进协议未触发，守卫随下一治理批次落地。
- 工件（本地态、不入库）：`artifacts/review-gate/2026-09-29-phase16-m5-1-selector-fix-partition-a-code-and-harness.md`、`…-partition-b-governance-carriers.md`、`…-partition-a-round2.md`、`…-partition-b-round2.md`、`2026-09-29-phase16-m5-1-selector-fix-round3.md`。
