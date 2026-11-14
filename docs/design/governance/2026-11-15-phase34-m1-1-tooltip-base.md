# Phase 34 M1-1：Tooltip 基础契约与 Button 内建提示

> 创建时间：2026-11-15
> 触发：用户「按照合适的顺序推进当前阶段的待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M1-1 行（本记录不复述验收条目，只承载设计结论、证据与遗留）。

## 1. 设计结论

### 1.1 Provider 缺失策略 = 内建兜底

登记要求「先出 1 段设计结论再实现」。两个候选：

| 候选 | 结论 |
|:---|:---|
| **A 内建兜底（采用）** | `CaomeiTooltipProvider` 用项目自有 InjectionKey 标记存在性；`CaomeiTooltip` 注入该键，缺失时以默认配置（延迟 700ms）包裹 Reka `TooltipProvider`，存在时走不渲染 DOM 的透传层，完全沿用上层配置 |
| B 迁移前置（未采用） | 要求使用方先在应用根部放置 Provider，否则运行时报错 |

采用 A 的理由：M1-1 起 Tooltip 由**组件自身**渲染（Button 等组件的 `tooltip`），而 Provider 是应用级配置——选 B 会把「升级组件库」变成「未接入过 Tooltip 的存量应用运行时报错」，且报错点在组件内部，难以归因。A 的代价是**兜底路径下各提示不共享「跨触发器免延迟」**（每个提示各自持有默认配置），已在组件页与迁移清单写明；需要该体验时在根部放置 Provider 即可，行为等价。

实现要点：`CaomeiTooltip` 对五项配置保持 `default: undefined`（否则会静默压掉 Provider 级值，既有回归锚点仍有效）；兜底只补一层 Provider，不改任何默认值语义。

### 1.2 `tooltip` 契约的默认触发模式

`boolean | string | { content?: string; mode?: 'auto' | 'always' }`，默认模式按「是否存在可溢出文本」决定：

| 形态 | 默认 `mode` | 依据 |
|:---|:---|:---|
| `iconOnly` / 无默认插槽 | `always` | 没有可见文本，`auto` 永远不成立 |
| 有可见文本 + `true` | `auto` | 需求原点是「只在被截断时展示」 |
| 显式字符串 / `{ content }` | `always` | 作者明确给出了补充说明，与截断无关 |
| 显式 `mode` | 以显式值为准 | 覆盖上表 |

`iconOnly` + `auto` 是死路（无可溢出文本），故补开发期告警，不静默。启用 `tooltip` 后按钮不再透传原生 `title`（其值作为提示内容兜底，`content` 优先），避免系统提示与内建提示双显。

### 1.3 `CaomeiTooltipText` 的可测量盒

溢出判据 `scrollWidth > clientWidth + tolerance` 对 `display: inline` 的非替换元素恒不成立（真实 Chromium 实测两项读数均为 0），故根元素显式建立 `inline-block` 盒。样式选择器用 `:where()` 归零特异性：`display` / `max-width` 只是「默认形态」，使用方的截断配方（如 `max-width: 120px`）必须能直接覆盖——否则消费者限定的宽度会被静默改回 `100%`，溢出永不成立（真实浏览器探针已复现并修复）。

截断本身（`nowrap` + 定宽 / `max-width` + `ellipsis`）仍由使用方声明：组件不替宿主决定文本如何布局，否则会把「按内容撑开」的元素静默改成单行裁切。

## 2. 交付面

- 新能力：`src/composables/use-overflow-tooltip.ts`（内部能力，未从包根导出）、`src/components/tooltip/tooltip-text.vue`、`src/components/tooltip/context.ts`
- 契约与导出：`tooltip` 相关类型、`tooltip.vue` / `tooltip-provider.vue` 的兜底接线、`CaomeiTooltipText` 的包根与 Nuxt 组件登记
- 组件接入：`CaomeiButton`（`tooltip` + 文本承接层的单行截断 CSS + 开发期告警）
- 测试：组件单测（Button / TooltipText / Tooltip 兜底）、composable 单测、`test/helpers/resize-observer.ts` 几何桩、a11y 夹具与预算
- 文档：Button 中英页（新节 / 无障碍 / 迁移表）、Tooltip 中英页（Provider 兜底与「文本溢出提示」节）、Button 示例中英版

## 3. 验证

| 面 | 结果 |
|:---|:---|
| `pnpm verify`（lint / 样式 / md / 类型 / 文档类型 / 单测 / 构建 / 解析器 / Nuxt / 文档站构建 / 路由 / 治理链） | exit 0 |
| 真实 Chromium（Button） | 截断生效（`scrollWidth > clientWidth`、`nowrap/hidden/ellipsis`）；截断后悬停显示完整文案；未截断无面板；`iconOnly` 显示 `label`；`disabled` 仍可悬停；`title` 属性为 null；关闭态无 `aria-describedby` |
| 真实 Chromium（TooltipText） | `auto` 溢出显示 / 未溢出不挂载且无 `aria-describedby` / `always` 常显 / `disabled` 不挂载 / 继承属性落到根元素 |
| `capture:styles` | 0 差异（截断属性不在采样面，属预期） |
| 视觉回归 | 代表性组件 × 亮暗 全绿（夹具文案未触发截断，基线未变） |
| E2E | `button-states` / `field-overflow` 全绿 |
| 组件单测 | Button / Tooltip / TooltipText / composable 全绿；a11y 夹具预算 61 → 62 |

## 4. 已知取舍

1. **icon-only 的重复朗读**：默认内容取 `aria-label`，面板以描述形式（`aria-describedby`）暴露，读屏可能把同一段文字朗读两次。保留现状并在 Button 中英页登记为已知取舍，需要补充说明时用 `content` 提供不同文案。
2. **`:where()` 零特异性的双向风险**：使用方的元素级规则（如 `span { display: inline }`）同样能把可测量盒还原成行内，`auto` 会再次静默失效。组件页**尚未**写明「须保留可测量盒」（`docs/components/tooltip.md` 的「文本溢出提示」段目前只说明截断由使用方决定）；后续动作见 §6 的 F1（真实布局持久守卫）与 F2（组件页补写）。
3. **`disabled` 按钮的悬停证据仅在 Chromium**：实测禁用按钮仍派发 `pointerenter` / `pointermove` / `pointerleave`（`click` / `mousedown` 被抑制），故触发器直挂按钮（`as-child`）可用；Firefox / WebKit 未实测，维持项目既有 Chromium-only 回归面。
4. **happy-dom 无法证伪布局**：溢出单测只能由几何桩驱动，真实浏览器探针是本条目的必要证据（首轮审计即由该缺口抓出「`inline` 盒导致 `auto` 不可用」）。

## 5. Review Gate

- **R1（`standard`，A / B 两分区并发）**：两分区均 `Reject`。A：`CaomeiTooltipText` 的 `inline` 盒使 `auto` 不可用（blocker）+ 该组件缺真实浏览器验证（blocker）+ 7 warning（attrs 未转发、布尔 `disabled` 压掉 Provider 配置、`disabled` 选项无 watch、无可见文本时的内容兜底、`iconOnly + auto` 静默、读屏重复朗读、指针用例依赖 700ms 真实延迟）。B：英文页漏译本批 3 处（blocker）+ Tooltip 页仍断言「缺 Provider 抛错」（blocker）+ 示例语言落位与措辞问题。
- **R2（`standard`，两分区并发复审）**：两分区 `Pass`，0 blocker；A 的 S2（三处包装层重复）按约定转 follow-up。
- **R3（`quick`，B 分区 follow-up 收尾）**：`Reject`（1 blocker）——声明的「示例去掉多余 `mode: 'always'`」未落地（前一轮 `eslint --fix` 改了对象花括号空格，替换未命中）。
- **R4（`quick`，单一修复点 + 本记录 + 索引）**：`Reject`（1 blocker）——本记录 §4 第 2 条把「组件页已写明须保留可测量盒」写成既成事实，实际未写（与本记录 F2 自相矛盾）；同轮 warning：告警条件表述过宽、F5 触发条件自相矛盾、F2 落点偏移。同轮三条 warning（告警条件、F2 落点、F5 触发条件）均于 R5 关闭。
- **R5（`quick`，修复点复核）**：`Reject`（1 blocker）——§4 第 2 条的「补写与持久守卫分别见 §6 的 F1 / F2」与 §6 定义顺序颠倒（F1 = 守卫、F2 = 补写）；同轮 warning：F2 的章节名不精确（英文页为 `Overflow tooltips`）、F6 行序在 F3 / F4 之间。三者已于 R6 关闭。
- **R6（`quick`，修复点复核）**：`Reject`（1 blocker）——本记录 §5 缺第 5 轮条目且占位行被下一轮占用，轮次台账与声明的轮次号错位；同轮 follow-up：F2 英文小节名精确化、R4 warning 关闭状态标注。两项已分别于 §5 的 R4 行与 §6 的 F2 行关闭。
- **R7（`quick`，台账与单点复核）**：`Pass`（0 blocker）；同轮两条 warning（R4 行关闭轮次归属、R6 行关闭落点定位）以一次文字修订收口（修订后 R4 三条 warning 统一记为 R5 关闭，R6 两项标注到实际落点）。

## 6. 遗留（follow-up）

| 编号 | 内容 | 触发 / 落点 |
|:---|:---|:---|
| F1（守卫） | 为「可测量盒」补**真实布局级持久守卫**（e2e：截断配方 → 悬停出面板；未截断 → 无面板；或把 `display` 纳入 capture 基线） | 并入 M1-6 / M4-1 的 E2E 批次（两批都要新增真实浏览器断言） |
| F2（补写） | 在 `docs/components/tooltip.md` 的「文本溢出提示」段（英文页 `Overflow tooltips` 小节）显式声明「覆盖 `display` 时须保留可测量盒」，并复核 `:where()` 字段范围（`display` / `box-sizing` 是否提到常规特异性） | M1-8（组件页说明批次；若 M1-7 的能力清单需要，另在该批加一行回链） |
| F3 | `watchEffect` 告警去重（避免 label / mode 抖动时刷屏） | 下一次改动 Tooltip 接入面时评估（M1-2 起） |
| F4 | `docs/guide/upgrade-to-1.0.md`、`docs/i18n/en-US/guide/upgrade-to-1.0.md`、`docs/guide/primevue-migration.md` 的「需放置 Provider」措辞统一为「建议放置 + 兜底」 | M1-7 |
| F5 | `Passthrough` + 动态包装层在 Button / TooltipText / Tooltip 各写一份，抽到 `components/_shared/` | 第 4 处消费出现时抽取（当前 3 处形态已稳定） |
| F6 | 示例不演示 `mode: 'auto'`（组件页只有行内提及），复用者缺少可复制片段 | M1-8（组件页说明批次）补一例 |

## 7. 复查基线

本记录 §1 ~ §6；`src/components/tooltip/tooltip-text.vue`、`src/composables/use-overflow-tooltip.ts`、`src/components/button/button.vue`；`docs/components/button.md` / `docs/components/tooltip.md` 及英文本；`test/helpers/resize-observer.ts`。
