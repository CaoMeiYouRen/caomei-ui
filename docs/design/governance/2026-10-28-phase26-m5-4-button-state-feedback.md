# Phase 26 M5-4 Button hover / active 状态反馈交付记录

> 创建时间：2026-10-28
> 依据：[2026-10-26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §2.3 / §2.4 / §2.5；[Refactoring UI 自检](./2026-10-26-refactoring-ui-self-check.md) §4.4。
> 定位：Phase 26 M5 插队批次第 4 条的交付记录；M5 收口自检（G0）由批次记录汇总，本记录只覆盖本条。

## 1. 交付范围

- **组件状态反馈（`src/components/button/button.vue`）**：新增 `:hover` / `:active` 两态，取值全部由既有 token 经 `color-mix()` 派生，**不新增冻结 token、不新增 prop、不新增覆盖钩子**；`transition` 补 `color` 一项（150ms，既有减动效分支仍整体关闭过渡）。
- **计算样式装置（`test/capture/`）**：新增 36 条状态采样（3 变体 × 6 语气 × hover / active，取 `md` 档——颜色不随尺寸变化）；新增 `verifyButtonStates()` 三态相对差异不变量（`--freeze` 不得把「规则没生效」一起冻结）；单测 22 例（原 17 + 5）。
- **真实浏览器复核（`test/e2e/button-states.e2e.ts`，新增 6 例）**：三态差异、亮 / 暗对比度、disabled 边界、focus-visible 描边契约、减动效无过渡。对比度测量抽到 `test/e2e/helpers/contrast.ts`，`alert-contrast.e2e.ts` 同批改用该助手（测量数学不变；助手对未知色彩空间 / 非 `#hex`·`rgb()` 形态改为 fail-closed，避免静默误读）。
- **夹具**：`test/e2e/fixtures/app.vue` 末尾追加 `#button-contrast`（18 条 + 1 条禁用态），Alert 受检面补 `data-contrast-key`。
- **文档**：`docs/design/design-spec.md` §6 Button 行补状态派生与边界；中英 Button 组件页新增「状态反馈 / State feedback」节。

## 2. 派生口径

| 变体 | hover | active | 方向说明 |
| :--- | :--- | :--- | :--- |
| `primary`（实底） | 底色 88% + `--caomei-color-neutral-solid` 12% | 底色 78% + 中性深色 22% | 中性深色在两主题同值（`#52525b`），实底恒加深、前景不变 |
| `primary` + `tone="neutral"` | 底色 92% + `--caomei-color-text` 8% | 底色 84% + 文字色 16% | 该语气实底**就是**加深锚点（混合同色恒等），改用文字色作锚点；比例更保守以保住白字 ≥ 4.5:1 |
| `secondary` / `ghost` | 文字 88% + `--caomei-color-text` 12%，底色 8% 同源着色（`secondary` 混 `--caomei-color-bg`、`ghost` 混 `transparent`） | 文字 78% + 文字色 22%，底色 14% | 文字向「极端」移动（亮色更深 / 暗色更浅），底色同向轻着色，二者互相远离 |

边界：`hover` / `active` 选择器一律带 `:not(:disabled)`（`loading` 复用原生 `disabled`）；`:focus-visible` 规则未改动；`:prefers-reduced-motion: reduce` 分支仍 `transition: none`。`secondary` 的 `border-color` 同批按文字锚点加深 / 提亮。

## 3. 验收核对

| 登记验收项 | 结果 | 证据 |
| --- | --- | --- |
| hover / active 与默认态计算样式不同 | 达成 | `capture:styles` 冻结前差异**仅 36 条新增键**（0 条既有键变化）；`verifyButtonStates()` 对 18 组三态逐组断言；E2E「计算样式不同」6 例通过 |
| 各变体 / tone 对比度仍 ≥ 4.5:1 | 达成（默认预设） | 亮色最低 4.829（默认 danger 实底）/ 5.084（hover ghost danger）/ 5.365（active ghost danger）；暗色最低 4.829 / 5.332 / 5.201；E2E 双档通过（裕度 0.04） |
| `:disabled` 行为不变 | 达成 | E2E 强制 `hover + active` 后 `background-color` / `color` / `cursor` 与默认态逐值一致 |
| `:focus-visible` 不变 | 达成 | `capture:styles` 的 `button-focus.*`（54 条）零变化；E2E 断言 `solid` / `2px` / `offset 2px` |
| `prefers-reduced-motion` 无过渡 | 达成 | E2E：`transition-property: none`、`transition-duration: 0s`，且状态差异仍生效 |
| `capture:styles` 仅预期差异 | 达成 | 冻结前输出 36 条「键仅存在于当前快照」，无属性级差异；冻结后复跑 349 项 0 差异 |

## 4. 验证证据

- `pnpm capture:styles`（冻结前）：**36 处差异 = 全部新增键**（`button-hover.*` / `button-active.*`），0 条既有键变化——默认态与聚焦态基线未动。
- `pnpm capture:styles:freeze` → 349 项；`pnpm capture:styles` → **0 差异**。
- `pnpm exec vitest run src/components/button/button.test.ts test/capture/capture.test.mjs` → 67 passed（含 5 条新状态不变量用例与源级规则守卫）。
- `pnpm exec playwright test test/e2e/button-states.e2e.ts --project=desktop` → **6 passed**；实测最低值见 §3。
- `pnpm exec playwright test --project=desktop` → **131 passed**（全套回归）。
- `pnpm test` → **142 文件 / 2750 passed**。
- `pnpm test:visual` → **33 passed（0 差异，未重冻结）**：默认态截图不含 hover / active，实际差异为 0，故基线不变即为正确结果。
- `pnpm build` / `pnpm check:build` → exit 0（24 个 exports 齐全）。
- `pnpm typecheck` / `pnpm typecheck:docs` / `pnpm lint:css:check` / `pnpm lint:md:check` / `pnpm docs:build` / `pnpm docs:check` / `node scripts/governance/check-design.mjs` → 全 exit 0。
- 跨预设抽测（同一测量脚本，文档用、未入库）：默认预设外的 4 套预设 × 亮暗 × 三态共 24 组，hover / active 最低值均不低于各自默认态；`momei` 亮色 `success` 为**既有**不达标（默认 2.279 → hover 2.643 → active 3.045，属 Backlog「颜色角色分层与非文本对比度治理」），本批未改变该口径。

## 5. Review Gate

- **R1（`standard`，3 分区并行，12 改 + 3 新增 > 8 文件）**：分区 A（运行时 + 文档）**Reject** / B（capture 装置）**Pass** / C（E2E）**Pass** → 合并 **Reject**（1 blocker）。blocker RG-A-B1：中英按钮页把「三态对比度 ≥ 4.5」写成无条件承诺，与 `momei` 亮色 success 既有缺口（默认 2.279 / hover 2.643 / active 3.045）冲突 → 已改为「默认预设 + 品牌预设既有三态缺口」限定。同批消解 warning / suggest：CSS 注释方向订正、`tone="neutral"` 选择器改复合类（(0,4,0)，与源码顺序解耦）、源级守卫补 92/84 比例、`BUTTON_STATE_PROPS` 精确断言、对比度助手 fail-closed、focus-visible 前置守卫、disabled 阳性对照、alert `data-contrast-key` 守卫；文档补 neutral 例外 / 无 `tone` 文字不变 / `secondary` 边框变化。
- **R2（`quick` delta，5 分钟盒）：Pass**（0 blocker）。R1 十项修复点逐条关闭；2 条 warning 于 F 收口闭合（文档「只有底色变化」措辞改为「文字色不变，`secondary` 另有边框变化」；本节轮次记录回填）；3 条 suggest 同批处理（todo 状态补「默认预设」、§1 助手 fail-closed 说明、「三态缺口（含默认态）」表述）。
- **用时实测**：R1 发起 `19:15:38`（三区并行）、R2 发起 `19:24:28`；两轮**返回时点未即时采集**（沿用 M5-2 已登记的流程缺陷，本轮仍未改到位），R2 在 `quick` 5 分钟时间盒内完成，R1 各分区纯用时无法复核——列为同一流程改进项，下一批改为返回即取时间戳。
- **复查基线**：`b021ccc` + 当前工作区（12 改 + 3 新增，含基线重冻结）。

## 6. 未覆盖边界

- 品牌预设的默认态对比度缺口（`momei` 亮色 success 2.279）是 [Backlog §1.6](../../plan/backlog.md) 第 2 档的既有问题，本批**未修复也未恶化**；E2E 的 4.5:1 断言面固定为默认预设（`minimal`）。
- 消费方自定义 `--caomei-button-bg` / `--caomei-button-text` 后的状态对比度不在受检面内（覆盖钩子的语义仍是「由使用方负责」）。
- 非文本对比度（按钮边框 / 实底与页面 3:1）不在本条范围（同属第 2 档）。
- 未验证 Firefox / WebKit 的 `color-mix()` 序列化与过渡表现（与既有 capture / axe 装置同内核口径）。
- hover / active 的视觉外观（色调观感）未做像素级评审，仅由计算样式与对比度约束锁定。

## 7. 教训

- **混合锚点可能与某个档位的底色同值**：`tone="neutral"` 的实底就是 `--caomei-color-neutral-solid`，用它作加深锚点会让 hover 恒等于默认态——「状态不变量」立刻拦下（`capture --freeze` 前报 `active 无独立反馈`）。凡「从自身派生新值」的规则，都必须验证锚点与取值域不重合。
- **计算样式装置不能只靠基线比对**：`--freeze` 会把静默失效的现状合法化，故必须同时断言三态之间的相对差异，并把它做成装置内不变量（不是一次性人工检查）。
- **`#000` 这类字面量会被设计守卫拦下**：组件样式层的派生锚点必须取既有 token；跨主题语义要靠「两主题同值的 token」而不是硬编码色值。
- **文档里的合规承诺必须自带适用范围**：实现只覆盖默认预设时，「三态 ≥ 4.5:1」不能写成无条件句子；品牌预设的既有缺口要在同一段显式指向 Backlog，否则 Review Gate 会按「把预设面说成全部达标」判 blocker。
- **测试数据与实现耦合要说在代码旁边**：状态不变量只比较声明的那几个颜色属性，若未来反馈改由 `box-shadow` / `transform` 承载，必须在同一处提示扩展采样数组，否则红灯会指错方向。
