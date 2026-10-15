# Phase 24 M4-2：Tooltip 工具提示

> 创建时间：2026-10-15
> 阶段条目：Phase 24 M4-2（主线 M4 组件缺口补齐）
> 范围依据：[Phase 24 范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §10.1 **D2**（P0 + P1 四项）与 §10.2 登记；P0② 依据 = 三仓跨仓共识（`el-tooltip` 3 / `v-tooltip` 7 / `el-tooltip` 1）+ 独立 primitive 语义 + 实现成本低。
> 边界声明：本条目**基于 Reka 稳定 primitive 的薄封装**（`reka-ui@2.10.4` 锁版）；**零破坏性变更**（新增组件族，不改既有组件的 props / 事件 / 插槽 / 样式）。

## 1. 结论摘要

新增 `CaomeiTooltipProvider` / `CaomeiTooltip` / `CaomeiTooltipTrigger` / `CaomeiTooltipContent` / `CaomeiTooltipArrow`，补齐「悬停 / 聚焦即显的只读提示」缺口：

| 面 | 结论 |
|:---|:---|
| 组件与 API | Provider（一次性）+ 根 + 触发器 + 面板 + 箭头；延迟 / 停用 / 方向 / 对齐 / 可访问名落地（§2） |
| 无障碍契约 | `role="tooltip"` + `aria-describedby` 经隐藏描述元素接线；**不构成焦点陷阱**；Esc 关闭（§3） |
| 浮层契约 | 档位取 `--caomei-z-tooltip`（1060，高于 `dropdown` 1050 与模态 1001）；登记进叠加 E2E 清单（§4） |
| 注册面 | §11 / §5 / §7 迁移映射 / 中英侧栏 / 中英总览页 / 设计规范层级表 + 守卫联动（§4） |
| 验证与判别力 | 单测 + a11y 夹具 + 叠加 E2E（含新用例）+ **隔离负向对照**（§5） |

## 2. 组件与 API

| 组件 | 关键属性 | 说明 |
|:---|:---|:---|
| `CaomeiTooltipProvider` | `delayDuration`（700）、`skipDelayDuration`（300）、`disabled`、`disableHoverableContent`、`disableClosingTrigger`、`ignoreNonKeyboardFocus` | 一次性 Provider（应用根部一次）；不渲染自有 DOM |
| `CaomeiTooltip` | `v-model:open`、`delayDuration`、`disabled`、`disableHoverableContent`、`disableClosingTrigger`、`ignoreNonKeyboardFocus` | 根容器（不渲染 DOM）；`delayDuration` 覆盖 Provider 值 |
| `CaomeiTooltipTrigger` | `unstyled`（`as-child` 透传） | 触发器；缺省渲染**无外观**可点击容器（复位样式 + `focus-visible` 轮廓） |
| `CaomeiTooltipContent` | `side`（默认 `top`）、`sideOffset`（6）、`align`（`center`）、`alignOffset`、`avoidCollisions`、`forceMount`、`ariaLabel` | 面板，经 Portal 挂 `body` |
| `CaomeiTooltipArrow` | `width`（10）、`height`（5） | 指向触发器的箭头（缺省不渲染） |

- **与 `CaomeiPopover` 的分工**（组件页有对照表）：Tooltip = 只读短提示 / 悬停 + 聚焦 / 不移动焦点 / 1060 档；Popover = 可交互内容 / 点击 / 焦点移入面板 / 1050 档。
- **`defaultOpen` 有意未暴露**：与 `Popover` / `DropdownMenu` 一致采用 `defineModel('open', { default: false })`（内部模型默认关闭）。暴露 `defaultOpen` 会与模型默认值冲突（模型恒传 `open=false` 使 Reka 的初始展开失效），故取舍为「与既有浮层根组件同形」。**`skipDelayDuration` 只在 Provider 暴露**（Reka 的 `TooltipRoot` 无该 prop）。

## 3. 实现要点

1. **Provider 必需**：Reka 的 `TooltipRoot` 在缺 `TooltipProvider` 时**抛错**（`createContext` 无 fallback），故 `CaomeiTooltipProvider` 为必需项（与 `CaomeiToastProvider` / `CaomeiConfirmDialog` 同类的一次性 Provider 约定）；Provider 同时承载「跨触发器免延迟」共享状态。文档与类型 JSDoc 均显式声明。
2. **无焦点陷阱**：不移动焦点、面板不带对话框语义；关闭路径为指针移出 / 失焦 / Esc（Esc 由 Reka 的 `DismissableLayer` 承接）。
3. **`role="tooltip"` 的落点（Reka 契约，已按实测记录）**：`role="tooltip"` 落在面板内一个**视觉隐藏**元素上，其 `id` 即触发器 `aria-describedby` 的指向，其文本为 `ariaLabel || 面板可见文本`——提示只作为**描述**朗读，不进入触发器的可访问名。组件页与迁移映射均按此口径书写（未写成「面板本体带 role」）。
4. **档位与覆盖钩子**：面板声明 `z-index: var(--caomei-tooltip-z-index, var(--caomei-z-tooltip))`，钩子名与组件目录一致（`check:overlay-z-index` T5）；`--caomei-tooltip-*` 系列变量只作为带回退值的覆盖钩子。
5. **触发器外观取舍**：缺省为**无外观复位**（`border: 0` / `background: transparent` / `font: inherit` / `cursor: pointer` + `focus-visible` 轮廓），因为工具提示常包裹既有控件；`as-child` 复用时用 `unstyled` 避免复位规则与子元素自身样式竞争（沿用 `CaomeiPopoverTrigger` 的 `unstyled` 约定）。
6. **`forceMount` 以属性形式回落 DOM**：`forcemount="false"` 会出现在面板上——**Reka 包装层的既有特性**（`Popover` / `DropdownMenu` 同此，实测确认），本批**有意保持与既有组件同形**，未单独为新组件改变该形态。**该结论无机检锚点**（仓库内无 `forcemount` 断言 / 快照），故只作为「跨组件统一收口」独立批次的输入登记，不属本批缺陷（见 §8.6）。
7. **Provider 级配置的兜底链（本批由 Review Gate 抓出并修复，含两处陷阱）**：Reka 的 `TooltipRoot` 对 `delayDuration` / `disabled` / `disableHoverableContent` / `disableClosingTrigger` / `ignoreNonKeyboardFocus` 五项均为 `props.X ?? providerContext.X.value`——只有「根未传（`undefined`）」时才回落到 Provider。两处陷阱都曾使 Provider 级配置**静默失效**：① 在根组件上给**具名默认值**（如 `delayDuration: 700`）；② 布尔型 prop **没有 `default` 键**时，Vue 的布尔转换会把「未传」解析为 `false`。修复 = 五项一律声明 `default: undefined`（与 Reka 自身 prop 声明同形），既保留 Provider 兜底、又保留「单条显式传值优先」。同批发现在**文档侧收口**：`skipDelayDuration` 为 Provider **独有**项（同一条 bullet 自述「不暴露」），不计入该五项；`CaomeiTooltipProvider` 补 `disableClosingTrigger`（原先未声明使该字段的「Provider 兜底」不可达、且与类型 JSDoc 相反）。`tooltip.test.ts` 增补**四条回归锚点**：根未传时透传值为 `undefined` / 单条传值覆盖 Provider / Provider 级 `disabled` 对未传该 prop 的后代生效 / **五项兜底配置在 Provider 与根组件上同名可选**（约束载体，防同类漂移）；异常路径断言收紧为点名 `TooltipProvider`。**该缺陷同时暴露在已写入的示例**（`placement.vue` 把 `:delay-duration="0"` 设在 Provider 上）——修复后该示例的即时显示语义成立。

## 4. 注册面同步与守卫联动

| 面 | 载体 / 联动 |
|:---|:---|
| 组件分区单一事实源 | `docs/design/documentation-site.md` §11「反馈与浮层」追加 `Tooltip`（组内英文名字母序：排在 `Toast` 之后） |
| 组件设计清单 | `docs/design/components.md` §5 追加 `Tooltip` 行（标「已实现」），并从「未纳入本清单的 primitive」列表中**移除** `Tooltip` |
| 迁移映射单一事实源 | `docs/design/design-spec.md` §7 追加 `> Tooltip 迁移映射（已实现）：…`（含已知差异与 Element Plus 差异指向） |
| 层级表 | `docs/design/design-spec.md` §2.5 的 `--caomei-z-tooltip` 行由「词表预留」改为「工具提示面板（Tooltip）」；`src/styles/theme.css` 注释同步去掉该预留表述 |
| 中英侧栏 / 总览页 | `docs/.vitepress/config.ts` 两处 sidebar + `docs/components/index.md` / `docs/i18n/en-US/components/index.md` |
| Nuxt / 包导出 | `src/nuxt/components.ts`（5 个导出）+ 根 barrel `src/index.ts` |
| **预留档位移出** | `check-overlay-z-index` 的 `RESERVED_TIERS` 移除 `tooltip`（余 `sticky`）、门禁文件头注释同步；`MIN_FLOATING_DECLARATIONS` 随增量上调 |
| **叠加 E2E 清单联动** | `test/e2e/fixtures/overlay-panels.json` 追加 tooltip 用例（T10 双向对账）+ 夹具 `#overlay-tooltip` 段 + `overlay-stacking.e2e.ts` 的 `MIN_PANEL_CASES` 上调与注释同步 |
| **Reka 触发器映射** | `check-reka-trigger-usage` 的 `WRAPPED_REKA_TRIGGERS` 登记 `TooltipTrigger → tooltip/tooltip-trigger.vue`（防其它组件直连 Reka 同名触发器） |
| 门禁单测 | `scripts/governance/check-overlay-z-index.test.mjs` 随档位表更新（预留面反向断言、浮层声明数、预留档位反例改用 `sticky`） |

## 5. 验证与判别力

- **单测**：`src/components/tooltip/tooltip.test.ts` —— 关闭态（无 `aria-describedby`）/ 展开态（描述元素 id === 触发器 `aria-describedby`）/ **无焦点陷阱**（不移动焦点、面板非 `dialog`）/ 受控 `update:open` / Esc 关闭 / `disabled` / `side` + `align` / `ariaLabel` 覆盖描述文本 / 箭头 / `as-child` + `unstyled` / `forceMount` / Provider 不渲染自有 DOM。
- **a11y 夹具**：新增 `CaomeiTooltip`（关闭态）与 `CaomeiTooltipContent`（`force-mount` 展开态审计单元，`requiredSelectors` 含 `[role="tooltip"]`）；`CaomeiTooltipTrigger` / `CaomeiTooltipArrow` 入「由夹具组合渲染」；`CaomeiTooltipProvider` 入「不渲染自有 DOM」；夹具预算随增量上调。`pnpm test:a11y` 通过（无新增例外）。
- **叠加 E2E（真实 Chromium）**：`test/e2e/overlay-stacking.e2e.ts` 的「面板必须渲染在模态内容之上」用例新增 `tooltip` 项——几何前置（与模态内容真实重叠）+ 机制断言（面板计算 `z-index` > 模态内容）+ **绘制顺序命中**三段齐备。夹具的**打开路径实测为 hover**：Playwright 的 `click()` 先派发 `pointermove` → Reka 的 `handlePointerMove` → 触发器进入 → 按 `delay-duration` 展开（夹具取 `0` ⇒ 立即）；`disable-closing-trigger` 只负责让随后的 click / pointerdown **不关闭**已展开的面板（Reka 缺省为「展开态点击触发器即收起」）——即 **click 本身从不开面板**，与其余浮层的 click 开合用例不同源，已在夹具注释与本记录显式声明。
- **负向对照（判别力自证，隔离执行）**：将 `tooltip-content.vue` 的面板档位临时改为 `var(--caomei-z-overlay)`（1000 < 模态 1001）⇒ 叠加 E2E **失败并点名** `tooltip 面板 z-index（1000）必须高于模态内容（1001）`；还原后同用例通过。证明该清单项对「档位低于模态」具备判别力、非空转。
- **门禁**：`check:overlay-z-index`（T1~T10 全通过，含新增项的清单对账）/ `check:reka-trigger-usage` / `check:design` / `check:class-prefix` / `check:migration-consistency`（§7 ↔ 组件页）/ `check:components-overview` / `check:design-catalog` / `docs:check` 全绿。

## 6. 载体同步

1. **新增载体**：`src/components/tooltip/**`、`docs/components/tooltip.md`、`docs/i18n/en-US/components/tooltip.md`、`docs/examples/tooltip/{basic,placement}.vue` + 英文对应、本记录。
2. **修改载体**：§4 表列各面（含 `src/styles/theme.css` 注释、`test/e2e/fixtures/{app.vue,overlay-panels.json}`、`test/e2e/overlay-stacking.e2e.ts`、`test/a11y/fixtures.ts`、`scripts/governance/check-overlay-z-index{.mjs,.test.mjs}`、`scripts/governance/check-reka-trigger-usage.mjs`、`docs/design/governance/2026-09-30-overlay-stacking-in-modal-fix.md` 的两处常量引述按「写录时点快照」口径标注）。
3. **守卫引述处置**：`check-governance-counts`（文档引述常量 ↔ 代码常量族）在本批首跑抓出 **3 处** `MIN_PANEL_CASES` 引述与新值不符——记录本体 2 处按规范补齐「**写录时点快照**」标注（历史记录保留当时取值），索引摘要 1 处**改为散文**（索引不复述常量值）。
4. **未改**：`docs/plan/roadmap.md` §1 现状句（阶段收口统一重写）；`docs/.vitepress/showcase-registry.json`（画廊为策展子集，Tooltip 未登记）；`docs/design/governance/2026-09-20-m2-2-m2-3-style-governance-landing.md` 仍将 `--caomei-z-tooltip` 记为「词表预留（暂无消费点）」——按「历史落地记录不回改」惯例**维持原样**（该处为当时时点陈述；本批仅在同批改动面同步现行口径，见 §4 层级表与 `theme.css` 注释）。

## 7. 质量门

- `pnpm verify` **exit 0**（含 `lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test` / `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `governance:check`）。
- `pnpm test:a11y` 通过；`pnpm test:e2e`（叠加用例所在 spec）通过。

## 8. 边界（显式声明）

1. **未提供隐藏延迟**（对应 PrimeVue `hideDelay` / Element Plus `hide-after`）：指针移出即关；`delayDuration` 只控制打开。
2. **未提供 click / contextmenu 触发**（Element Plus `trigger` 多值）：固定为悬停 + 聚焦，点击为**收起**（可用 `disable-closing-trigger` 保持展开）。需要点击触发请用 `CaomeiPopover`。
3. **未提供 `content` prop**（Element Plus `el-tooltip content`）：内容经默认插槽表达（与 PrimeVue `<Tooltip>` 的 `#content` 同向）。
4. **`ariaLabel` 只覆盖描述文本**，不改变触发器的可访问名（Reka 契约：提示不并入可访问名）。
5. **`forcemount` 属性回落 DOM**（§3.6）：与既有 `Popover` / `DropdownMenu` 同形，未在本批单点改动；**该形态无机检锚点**，其「属性级快照 / 断言」落入「跨组件统一收口」独立批次（本批仅在 §3.6 登记，不自动进候选池）。
6. **`CaomeiTooltipProvider` 必需**：未放置时 Reka 抛错（错误信息点名缺失的 Provider）；未做「缺省自动兜底 Provider」——兜底会静默吞掉「跨触发器免延迟」的共享语义。
7. **仅含 Portal 面板形态**：无 `appendTo` / `teleported` 开关，恒挂 `body`。

## 9. Review Gate

- **audit-depth**：两轮均 `standard`（新增组件族 + 浮层契约与门禁联动 + 测试装置与文档同步；非发布 / 安全 / 依赖 / agent·skill 定义）。单分区（同一交付面，非 ≥2 独立模块）。
- **R1（`standard`）：`Reject`**（**1 blocker / 2 warning / 4 suggest**）。审计方读 Reka 源码 + 编译产物交叉核验，逐项确认档位 / a11y 契约 / 注册面一致性，并**逐条**核验门禁改动**未放宽判别力**（`RESERVED_TIERS` 移除 `tooltip` 属移除消费点后的必要动作、新增**反向断言**、`MIN_*` 下界仍高于/等于实测值、预留档位反例改用仍为活档位的 `sticky`）。
  - **RG-B1（blocker，已关闭）**：`CaomeiTooltip` 为 `delayDuration` / `disabled` / `disableHoverableContent` / `ignoreNonKeyboardFocus` 设具名默认值并**无条件绑定**到 Reka 的 `TooltipRoot`，而 Reka 只在「根未传（`undefined`）」时回落到 Provider ⇒ **Provider 级配置被静默压掉**，与同批写入的类型 JSDoc / 组件页 / §7 迁移映射口径**相反**；已写入的示例 `placement.vue`（Provider 上设 `:delay-duration="0"`）正踩该坑，且无用例覆盖 Provider 透传。→ **采纳修复方向 1**：五项声明 `default: undefined`（并暴露**第二处陷阱**：布尔型 prop 缺 `default` 键会被 Vue 布尔转换解析为 `false`，同样压掉 Provider 兜底）。
  - **RG-W1（warning，已关闭）**：13 例未覆盖 Provider 级透传（即 blocker 逃逸的直接原因）→ 补回归锚点（§3.7）。
  - **RG-W2（warning，已关闭）**：夹具注释与记录 §5 的「点击触发器 = 确定性开合路径」口径不准确（实测**打开走 hover**，click 仅承担「不关」）→ 已按实现改写。
  - **RG-S1 ~ S4（已关闭）**：a11y 夹具 `label` → `aria-label`；组件页样式表补 2 个已实现变量；记录 §6.4 登记历史记录不回改；`forcemount` 结论无机检锚点已登记为独立批次输入。
- **R2（`standard`，仅审 R1 修复点）：`Pass`**（**0 blocker / 1 warning / 1 suggest**，两条均已同批收口）。审计方独立复跑 `src/components/tooltip` 17 passed、`test/a11y` 63 passed、`typecheck` 通过、四条门禁 OK；并以 **Vue prop 解析负向对照实验**证明三条锚点对该缺陷**确有判别力**（`default: undefined` → `undefined`；具名默认值 → 具体值；布尔型缺 `default` 键 → `false`）；判 R1 的 blocker 与 2 warning、3 suggest **全部关闭**。
  - **RG2-W1（warning，复发类，已关闭）**：组件页「五项 Provider 兜底」清单把 Provider **独有**的 `skipDelayDuration` 计入、且漏列 `disableClosingTrigger`（后者在 Provider 上未声明使兜底不可达）——与 R1 blocker 同属「口径与实现相反」类 → **采纳 ⓐ**：`CaomeiTooltipProvider` 补 `disableClosingTrigger` 并绑定，组件页清单改为真正的根级五项、`skipDelayDuration` 单列为 Provider 独有；**约束载体** = `tooltip.test.ts` 新增「五项兜底配置在 Provider 与根组件上同名可选」断言，防同类漂移。
  - **RG2-S1（suggest，已采纳）**：异常路径断言由 `toThrow()` 收紧为 `toThrow(/TooltipProvider/)`，使判别力不随错误原因漂移而退化。
- **实测用时**：R1 发起前取戳 `2026-10-15T13:31:10+08:00`，审计方复跑定向测试 + 读源码；R2 发起前取戳 `13:46:20`。两轮均**未超各自时间盒**（10 / 6 分钟；返回时点以宿主后续可观测时点为界）。
- **未覆盖边界（审计方声明）**：① 未独立复跑 `pnpm verify` 整链与全量 E2E（采信调用方读数）；② 判别力由「断言形态 + Vue 解析实验」推导，未做仓库内真实文件级变异；③ 未横向排查其它浮层组件是否存在同类「Provider 兜底被压掉」形态（属新范围，见下）。
- **新范围 follow-up（登记，不阻断）**：① 其它浮层组件（`Popover` / `DropdownMenu` 等）是否存在同类「具名默认值压掉上层兜底」形态，需专项排查（本批不自动进候选池）；② `forcemount` 属性回落的机检锚点归「跨组件统一收口」独立批次（§3.6 / §8.5）。
