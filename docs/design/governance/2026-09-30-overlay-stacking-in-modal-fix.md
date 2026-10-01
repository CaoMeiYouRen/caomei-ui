# 模态内浮层被遮挡修复（Select 面板 z-index 档位纠正与同类收敛）

> 状态：已完成（2026-09-30）。触发：下游（dependfix 仓库页「批量扫描」）用户报告——在 Dialog 内使用 Select 时，选项面板被模态卡片盖住，只在不与模态重叠的区域可见。本记录登记**根因、修复、防复发装置与验证证据**。

## 1. 根因

**现象**：模态（Dialog / Drawer）内打开的 Select 面板被模态卡片遮挡（面板仅在与模态不重叠的区域可见），但面板仍可点击（视觉问题而非交互问题）。

**链路**：Select 面板经 `SelectPortal` 挂到 `body`，与模态内容同处**根层叠上下文**，二者只能靠 `z-index` 分胜负。Reka 的 popper 会把面板元素的**计算 `z-index` 复制到包裹层**（`PopperContent` 读取 `getComputedStyle(contentElement).zIndex` 写入 wrapper），故面板的档位即包裹层档位。

**缺陷**：`select.vue` / `multi-select.vue` / `auto-complete.vue` 的面板档位为 `--caomei-z-overlay`（`1000`），而 `.caomei-dialog__content` 为 `--caomei-z-modal`（`1001`）——面板低于模态内容，被盖住。`color-picker.vue` 的面板档位为 `--caomei-z-modal`（`1001`），与模态内容**同值**，靠「后挂载者胜」的 DOM 顺序平局裁决侥幸可用，属同一缺陷类。

**历史**：`1000` 是 Select / MultiSelect / AutoComplete 自首个实现起的字面量；M2-2/M2-3 的 token 收敛按「等值改写」映射为 `--caomei-z-overlay`，并把该映射写进设计规范，从而把缺陷固化成了「既定语义」。锚定浮层面板（DropdownMenu / Popover / DatePicker）在同期已取 `--caomei-z-dropdown`（`1050`），故它们从未命中该缺陷。

## 2. 修复

统一为「锚定浮层面板」档位（`--caomei-z-dropdown`，`1050` > `--caomei-z-modal`，`1001`），并补齐设计规范 §2.5 已声明但缺失的 `--caomei-<comp>-z-index` 覆盖钩子：

| 组件 | 面板选择器 | 修改前 | 修改后 |
| --- | --- | --- | --- |
| Select | `.caomei-select__content` | `var(--caomei-z-overlay)` | `var(--caomei-select-z-index, var(--caomei-z-dropdown))` |
| MultiSelect | `.caomei-multi-select__content` | `var(--caomei-z-overlay)` | `var(--caomei-multi-select-z-index, var(--caomei-z-dropdown))` |
| AutoComplete | `.caomei-auto-complete__content` | `var(--caomei-z-overlay)` | `var(--caomei-auto-complete-z-index, var(--caomei-z-dropdown))` |
| ColorPicker | `.caomei-color-picker__panel:not(.caomei-color-picker__panel--inline)` | `var(--caomei-z-modal)` | `var(--caomei-color-picker-z-index, var(--caomei-z-dropdown))` |

**ColorPicker 的 `inline` 形态**：基类 `.caomei-color-picker__panel` 同时命中 portal 面板与 `inline` 面板，而 `inline` 面板是 `.caomei-color-picker`（`inline-flex`）的 **flex item**——`z-index` 对 flex item 同样生效。故档位声明以 `:not(.caomei-color-picker__panel--inline)` 限定到 portal 面板，`inline` 形态回到 `auto`（不参与浮层层叠）。该点由 Review Gate R1 的 warning RG-W01 拦下（首版注释曾断言「该声明对其无影响」，前提错误）。

**同类收敛**：全库 portal 浮层面板共 7 处（Select / MultiSelect / AutoComplete / ColorPicker / DatePicker / DropdownMenu / Popover），修复后全部落在 `--caomei-z-dropdown` 且均带覆盖钩子；`--caomei-z-overlay` 仅剩 Dialog / ConfirmDialog / Drawer 的**遮罩**（语义正确）。

**文档同步**：`docs/design/design-spec.md` §2.5 的 token 表——`--caomei-z-overlay` 移除「同值浮层面板」表述、`--caomei-z-modal` 移除「ColorPicker 面板」、`--caomei-z-dropdown` 增列四个组件；并新增约束「锚定浮层面板档位必须高于模态内容」及其原因（portal 到 `body`，同处根层叠上下文）。历史治理记录（2026-09-20 M2-2/M2-3 落地记录）为时点快照，**不回改**，其映射口径让渡给设计规范。

## 3. 防复发装置

### 3.1 声明层：浮层档位语义守卫（`check:overlay-z-index`）

`scripts/governance/check-overlay-z-index.mjs`（接入 `governance:check` 链，预算 0；单测 `scripts/governance/check-overlay-z-index.test.mjs` **27 例**）：

| 检查项 | 内容 | 能拦下的缺陷 |
| --- | --- | --- |
| T1 档位表自证 | `theme.css` 的 `--caomei-z-*` 必须满足 `overlay < modal < dropdown < tooltip < toast` 且无删项 | 把浮层档位调到模态之下 |
| T2 遮罩专用 | `--caomei-z-overlay` 只允许用于 `.caomei-<ns>__overlay` | **本次缺陷的原始形态**（面板取遮罩档位） |
| T3 模态内容在册 | `--caomei-z-modal` 只允许用于登记的三个模态内容选择器 | 面板取模态内容档位（`ColorPicker` 修复前形态） |
| T4 浮层高于模态 | `dropdown` / `tooltip` / `toast` 的数值必须大于 `modal` | 档位表被改坏 |
| T5 覆盖钩子 | 浮层档位必须为 `var(--caomei-<comp>-z-index, var(--caomei-z-<档位>))`，钩子名与组件目录一致 | 缺钩子、钩子名拼写漂移导致静默回退默认档位 |
| T6 静态变体 | 浮层档位规则的选择器若是纯类选择器、而同组件模板存在该类的 `--<修饰符>` 变体，则报错 | `ColorPicker` 的 `inline` 形态继承浮层档位（Review Gate RG-W01） |
| T7 抗静默收窄 | 受检文件 / 规则 / 浮层声明条目数下界 + 预留档位（`sticky` / `tooltip`）在册 | 扫描器或入口被收窄后「零违规」变成空真 |
| T8 未识别形态 fail-closed | 值中引用 `--caomei-z-*` 但形态无法解析的 `z-index` 一律报错 | 带字面量回退的写法（`var(--caomei-z-overlay, 9999)` / `var(--caomei-z-dropdown, 1050)`）静默绕过 T2 / T4 / T5 / T6（Review Gate RG-R1′-W01） |
| T9 允许名单反向校验 | `HOOK_NAME_EXCEPTIONS` 的例外条目必须在产物中命中期望钩子、`MODAL_CONTENT_SELECTORS` 必须真的被 `--caomei-z-modal` 使用 | 例外 / 白名单腐烂后成为死项却无告警（Review Gate RG-R1′-S01） |

**负向验证**（构造违规 → 确认 exit 1，逐条恢复后 exit 0）：

| 构造 | 输出 |
| --- | --- |
| `select.vue` 面板回退为 `var(--caomei-z-overlay)` | `[overlay-misuse] src/components/select/select.vue: .caomei-select__content 使用了遮罩档位 …` |
| `color-picker.vue` 去掉 `:not(...)` | `[static-variant] … 存在静态变体（模板含 caomei-color-picker__panel--*）…` |
| `popover-content.vue` 钩子名改为 `--caomei-popver-z-index` | `[hook-name] … 期望 --caomei-popover-z-index，实为 --caomei-popver-z-index …` |
| `toast.vue` 档位改为 `var(--caomei-z-toast, 1100)`（带字面量回退） | `[unparsed-tier-form] src/components/toast/toast.vue: .caomei-toast-viewport 的 z-index 引用了档位 token 但形态未识别 …` |
| `image.vue` 钩子改名为 `--caomei-image-z-index`（例外腐烂） | `[hook-name]` × 2 + `[stale-exception] HOOK_NAME_EXCEPTIONS 的 src/components/image/image.vue → --caomei-image-preview-z-index 未在产物中命中 …` |

单测另含 T1~T9 的正反例与解析边界（`calc(... + 1)` 形态、数字字面量不归本守卫、无关 `:not()` 不构成排除）。

### 3.2 真实渲染：模态内浮层层级回归（常驻 E2E）

`test/e2e/overlay-stacking.e2e.ts`（2 用例 × mobile / tablet / desktop = **6 项**）+ 夹具 `test/e2e/fixtures/app.vue` 的 `#overlay-in-dialog` 段（Dialog 内并列 **7 个 portal 浮层组件**：Select / MultiSelect / AutoComplete / ColorPicker / DatePicker / Popover / DropdownMenu）与 `#inline-color-picker` 段（内联 ColorPicker）。

**用例 1「面板必须渲染在模态内容之上」**：

- **受检面**：`PANEL_CASES` = 7 类面板（`MIN_PANEL_CASES = 7`，即 portal 浮层面板全集；受检面下界断言防清单被静默收窄后「全部通过」变成空真）。ColorPicker 的选择器带 `:not(--inline)`——面板挂 `body`、无法用祖先限定，而 `inline` 形态复用同一基类，不排除会命中两个元素。
- **前置守卫**：面板矩形必须与模态内容矩形**真实重叠**，否则命中测试无判别力。
- **机制断言**：面板计算 `z-index` 必须高于 `.caomei-dialog__content`。
- **最终判据**：重叠区中心的**绘制顺序命中**必须落在面板内。
- **判据修正（实测发现）**：Reka 在**部分**嵌套浮层（实测为 Select）打开时会把模态内容整棵子树置为 `pointer-events: none`（以便把面板之外的点击判为外部点击），而命中测试会**跳过不可命中的元素**——此时直接 `elementFromPoint` 恒返回面板，无法反映绘制顺序。故按需补偿：仅在模态内容当前不可命中时临时恢复为可命中，测试后**按保存的内联值还原**（不可用 `removeProperty`：Reka 以元素内联值参与嵌套层记账，抹掉属性会让面板关闭后模态内容停留在不可命中状态，实测复现）；MultiSelect / AutoComplete / ColorPicker / DatePicker / Popover / DropdownMenu 不置 `none`，无需补偿。
- **判别力自证**（Review Gate R1 suggest RG-S01 采纳）：补偿后断言模态内容**确实可命中**——上游 Reka 若改为在 `body` / 包裹层维护 `pointer-events`，补偿会静默失效、命中测试恒真；此时用例失败并提示复核该手法，而非悄悄失去判别力。

**用例 2「内联 ColorPicker 面板不参与浮层层叠」**：`inline` 面板必须渲染（夹具守卫）且计算 `z-index` 为 `auto`（在模态打开状态下断言）。

**负向对照**（四处，均实测失败后恢复）：

| 对照 | 缺陷态表现 | 修复后 |
| --- | --- | --- |
| 回退全部 `src`（原始缺陷） | 用例 1 失败：`select 面板 z-index（1000）必须高于模态内容（1001）`；用例 2 失败：`Expected: "auto" / Received: "1001"` | 6 / 6 通过 |
| 只回退 `color-picker.vue`（W1 缺陷） | 用例 2 失败：`Expected: "auto" / Received: "1001"`；用例 1 的 color-picker 项失败：`Expected: > 1001 / Received: 1001` | 6 / 6 通过 |
| 只回退 `date-picker.vue` 档位（扩面后的新增受检项） | 用例 1 失败：`Expected: > 1001 / Received: 1000` | 6 / 6 通过 |
| 绘制顺序探针（重叠区中心 `(576, 455)`，模态临时可命中） | 命中 `input.caomei-auto-complete__input`（模态内元素，`hitInsidePanel=false`，`panelZ=1000 < dialogZ=1001`） | 命中 `div.caomei-select__item`（`hitInsidePanel=true`，`panelZ=1050 > dialogZ=1001`） |

## 4. 边界与未覆盖

- **未覆盖**：非浮层的模态内元素（如模态内直接渲染的下拉列表）不属本契约面；`--caomei-z-dropdown` 与 `--caomei-z-tooltip`（`1060`）的相对关系无消费点，未验证。
- **未覆盖**：嵌套模态（模态内再开模态）与 Drawer 内的面板未单独设用例——两者与 Dialog 同用 `--caomei-z-modal`，机制同源，由常驻用例的 Dialog 路径代表。
- **未覆盖**：`inline` ColorPicker 面板与模态**同屏重叠**时的绘制顺序未做命中测试（只断言其计算 `z-index` 为 `auto`，即「不参与浮层层叠」这一充分条件）；该形态在页面流内，与居中模态的几何重叠随滚动位置变化，命中测试的几何前置不可靠。该面由 `check:overlay-z-index` 的 T6（声明层）与 T3（`--caomei-z-modal` 选择器白名单）部分补强。
- **未覆盖**：`check:overlay-z-index` 只判「档位声明形态与选择器语义」，不判「元素是否真的在 portal 中渲染」——T6 的静态变体判定依据是「选择器未用 `:not()` 排除该变体类 + 模板存在同名 `--<修饰符>` 变体」，若变体命名不含 `--`（如 `is-inline`）则不在其规则面；该面由常驻 E2E 的真实渲染兜底。
- **未覆盖（流程边界）**：E2E 的 `PANEL_CASES` 与声明层门禁**未联动**——新增 portal 浮层组件时，门禁单测的精确计数（浮层声明数 10）会失败并强制复核，但不会强制把新组件补进 E2E 清单（`MIN_PANEL_CASES = 7` 为下界）；跨文件耦合成本高于收益，登记为已知流程边界（Review Gate RG-R1′-S04）。
- **未覆盖**：`check:overlay-z-index` 的 T6 只覆盖「同一文件内」的变体复用；跨文件复用同一基类（如消费方在宿主页面复用组件类名）不在其规则面。
- **观察项 O2（非本批缺陷）**：`check:overlay-z-index` 首跑即命中 `image.vue` 的 `[static-variant]` 误报——原因是类名正则未含 `_`（`caomei-image__preview-overlay` 被截断为 `caomei-image`）。已修正正则并在单测中固化「模板提取只取 `<template>` 内容」边界；该误报说明**守卫自身的规则面也需要负向语料**。
- **观察项 O1（非本批缺陷）**：首次 `pnpm verify` 的全量单测出现 1 例偶发失败（`src/components/auto-complete/auto-complete.test.ts:480` 的 `aria-controls` 面板查找，报 `Cannot call element on an empty DOMWrapper`）。按 [测试规范 §6.1](../../standards/testing.md) 处置：隔离复跑该文件 **30 / 30 通过**、全量复跑两次均全通过（**当轮口径** 93 文件 / 1931 例；终态见 §5），判为并行负载下的偶发，与改动无因果；本批**未**改该用例；该实例已按触发条件登记 [Backlog §1.6](../../plan/backlog.md)（第二次出现 → 触发「定位根因并修」）。
- **未做**：像素级视觉比对（未引入图像基线；本类问题的可判定证据为计算样式 + 绘制顺序命中，`capture:styles` 245 项 0 差异已排除其他视觉回归）。
- **未做**：组件文档（`select.md` / `multi-select.md` / `auto-complete.md` / `color-picker.md` 的「样式定制」表）未列 `--caomei-<comp>-z-index` 钩子——与既有 `date-picker` / `popover` / `dropdown-menu` 页的现状一致，层级 token 的事实源为设计规范 §2.5（Review Gate R1 suggest RG-S04 未采纳，理由：会单方面抬高四页、与既有六页形成新的不一致）。
- **规划登记（2026-09-30 用户裁定「登记」）**：按 [规划规范 §3.5](../../standards/planning.md) 插队例外第 3 类（直接影响可用性的 blocker 级缺陷）登记为 Phase 17 的 **M3 主线**（浮层档位契约修复与门禁，2 条原子条目，`todo.md` / `roadmap.md` 同步）；阶段内条目由 6 条增至 8 条。**未登记发布条目**（本阶段非目标）；已发布 0.4.0 仍含该缺陷、下游需 0.4.1 及以后版本，状态已写入 `todo.md` 的「未完成项汇总」。

> **后续批次收口（2026-10-01）**：本节的三条 follow-up——① `inline` ColorPicker 绘制顺序命中 / ② 命中测试判别力只自证模态内容根节点 / ③ `PANEL_CASES` 与声明层门禁未联动——已由 [Phase 18 M2-5 记录](./2026-10-01-phase18-m2-5-overlay-device-discriminating-power.md) 收口（内联用例双层判定 + 后代自证 + T10 双向对账）。**本节为 2026-09-30 产出时点口径，历史行不回改**。

## 5. 规模与质量门（终态）

- 规模：见 §5.1（终态复算，带显式 pathspec）。
- 质量门：`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `pnpm test`（**94 文件 / 1965 例**，含本守卫单测 34 例）/ `pnpm test:e2e --workers=2`（**114 项** = 既有 108 + 本批 6）/ `capture:styles`（**245 项 0 差异**）/ `pnpm verify` **exit 0**（含 `build` + `check:build` + `check:resolver` + `check:nuxt` + `docs:build` + `docs:check:i18n-routing` + `governance:check`，其中 `check:overlay-z-index` 已接入 `governance:check` 链）。
- 产物核验：`dist` 四个组件的样式产物均含新声明（`z-index: var(--caomei-<comp>-z-index, var(--caomei-z-dropdown))`），`--caomei-z-overlay` 在 `dist/components/**` 仅剩三处**遮罩**。

### 5.1 规模终态复算

复算命令（显式 pathspec，逐文件输出；终态以**索引**为准，故用 `--cached`）：

```bash
git diff --cached --numstat -- src test docs scripts package.json
```

（提交后本命令不再可复算，须按 [AI 协作规范 §9](../../standards/ai-collaboration.md) 钉 `<base>..<end>` 持久 ref。）

| 文件 | 增 | 删 |
| --- | ---: | ---: |
| `src/components/select/select.vue` | 7 | 1 |
| `src/components/multi-select/multi-select.vue` | 3 | 1 |
| `src/components/auto-complete/auto-complete.vue` | 3 | 1 |
| `src/components/color-picker/color-picker.vue` | 12 | 1 |
| `test/e2e/fixtures/app.vue` | 111 | 0 |
| `test/e2e/overlay-stacking.e2e.ts`（新增） | 208 | 0 |
| `docs/design/design-spec.md` | 5 | 3 |
| `docs/design/governance/2026-09-30-overlay-stacking-in-modal-fix.md`（本记录，新增） | 202 | 0 |
| `docs/design/governance/index.md` | 2 | 0 |
| `scripts/governance/check-overlay-z-index.mjs`（新增） | 439 | 0 |
| `scripts/governance/check-overlay-z-index.test.mjs`（新增） | 284 | 0 |
| `scripts/governance/check-design.mjs` | 9 | 3 |
| `package.json` | 2 | 1 |
| `docs/standards/development.md` | 1 | 0 |
| **合计（14 文件）** | **1288** | **11** |

**超阈值与拆批**：14 文件 / 新增行超 800，超 [规划规范 §5](../../standards/planning.md) 的任务粒度约束（默认 10 文件 / 800 行新增），按「交付面」拆为**三个原子批次**提交（同文件不并发改，引用方向单向）：

| 批次 | 文件 | 规模 |
| --- | --- | --- |
| ① 修复 + 装置 | `src/**` 4 + `test/e2e/fixtures/app.vue` + `test/e2e/overlay-stacking.e2e.ts` + `docs/design/design-spec.md` | 7 文件 / +349 −7 |
| ② 门禁与接线 | `scripts/governance/check-overlay-z-index.{mjs,test.mjs}` + `scripts/governance/check-design.mjs` + `package.json` | 4 文件 / +734 −4 |
| ③ 规范与记录 | `docs/standards/development.md` + 本记录 + 索引 | 3 文件 / +205 −0 |

## 6. Review Gate

### 6.1 轮次与范围

| 轮次 | 档位 | 范围 | 结论 |
| --- | --- | --- | --- |
| R1 | `standard`（≤ 10 分钟） | 全批 9 文件 | **Pass**：0 blocker / 1 warning（RG-W01）/ 5 suggest（RG-S01~S05） |
| R2 | `standard`（≤ 10 分钟，复审范围冻结） | 仅 R1 findings 的修复点 | **Reject**：2 blocker（RG-R2-B01 计数未终态复算 / RG-R2-B02 暂存区卫生）+ 1 warning（RG-S05 处置未落地） |
| R3 | `standard`（≤ 10 分钟，复审范围冻结） | 仅 R2 blocker 与 warning 的修复点 | **Reject**：1 blocker（RG-R3-B01 治理索引摘要计数未同步，属 RG-R2-B01 复发）+ 1 warning（RG-R3-W01 复算命令在终态不可复现） |
| — | — | 逐条修复后按 §3.4 收束 | 未取得新一轮 Pass，残留项见 §6.5 |

### 6.2 R1 findings 与处置

- **RG-W01（warning，已关闭）**：`ColorPicker` 基类规则同时命中 `inline` 形态，而 `inline` 面板是 flex item、`z-index` 对其同样生效 → 档位泄漏会把 `inline` 面板抬到模态内容之上；原注释「该声明对其无影响」前提错误，且该子面无验证。**修复**：档位声明移出基类，改为 `:not(.caomei-color-picker__panel--inline)` 限定到 portal 面板；新增常驻用例 2 与 `#inline-color-picker` 夹具；设计规范 §2.5 增补「静态面板形态不参与浮层层叠」约束。
- **RG-S01~S03（suggest，已采纳）**：命中测试按需补偿 + 判别力自证；`Escape` 后断言模态仍可见；命中描述改用 `getAttribute('class')`。
- **RG-S04（suggest，未采纳）**：组件文档不列 `--caomei-<comp>-z-index` 钩子（理由与边界见 §4）。
- **RG-S05（suggest，流程）**：见 §6.4。

### 6.3 R2 findings 与处置

- **RG-R2-B01（blocker，已修复）**：本记录 §5 / §5.1 的计数是修复点落地前的快照（§5 写 `111 项 / 本批 3`、§5.1 逐文件数字与实测不符），与 §3 的「6 项」自相矛盾。**修复**：在全部修复点落地后按 §5.1 的复算命令逐文件重算并回填（含本节自身的行数）。
- **RG-R2-B02（blocker，已修复）**：修复点未进入索引，`git show :<file>` 仍是修复前快照。**修复**：本批 9 文件（含 2 个新文件）全部 `git add` 后重报。
- **RG-S05 warning（已修复）**：R2 指出调用方 prompt 声称「已在治理记录 §6 补记偏离依据」而该节当时不存在——属「预写未发生的落点状态」。**修复**：本节即该落点（§6.4），并登记该教训（prompt 中的落点声明必须在产物存在后再写）。
- **R2 follow-up（不阻断，登记于 §4 边界）**：① 用例 2 只断言计算 `z-index === 'auto'`（充分条件之一），未做事先/事后绘制顺序命中测试；② 判别力自证目前只验模态内容**根节点**可命中，未验其后代。

### 6.4 §3.2 并发分区触发条件的偏离依据

本批 9 文件（> 8）且跨 4 个组件目录，**字面命中** [AI 协作规范 §3.2](../../standards/ai-collaboration.md) 的并发分区触发条件（≥ 2 个独立模块且文件数 > 8）。**未分区**，按单分区审计，依据：4 处 `src` 改动是**同一契约（面板档位取「锚定浮层面板」档位 + 补覆盖钩子）在 4 个模块上的逐模块一行复刻**，同一 hunk pattern、无模块特有逻辑；其余 5 个文件同属单一交付面（一个 E2E 装置 + 夹具 + 规范 + 记录 + 索引），不存在可按模块切分的独立审查面。该判断经 R2 审计方在其结论正文中确认「实质理由可接受」（本地态证据：`artifacts/review-gate/2026-09-30-overlay-stacking-in-modal-fix.md` 的 R2 段）。

### 6.5 追加子批次（用户扩范围：门禁 + 同类扩面）

用户在 R1 收束后追加范围（「排查同类组件的同类问题，并添加合适的门禁」），按**新原子条目**处理，开启独立轮次（非 R4 续审）：

| 轮次 | 档位 | 范围 | 结论 |
| --- | --- | --- | --- |
| R1′ | `standard`（≤ 10 分钟） | 新增 `scripts/governance/check-overlay-z-index.mjs` + 单测 27 例 + `governance:check` 接线 + `development.md §7` / `design-spec §2.5` 规范落点 + E2E 受检面由 4 类扩到 7 类（portal 浮层全集）+ 夹具 | 见 §6.6 |

**扩面内容**：

- 同类排查从「4 类面板」扩到 **7 个 portal 浮层面板全集**（新增 DatePicker / Popover / DropdownMenu 入夹具与 `PANEL_CASES`，`MIN_PANEL_CASES` 同步抬到 7），并补 `date-picker.vue` 回退档位的负向对照（`Expected: > 1001 / Received: 1000`）。
- 新增声明层门禁 `check:overlay-z-index`（T1~T7，见 §3.1），接入 `governance:check`，含 27 例单测与三处 CLI 负向验证（面板回退遮罩档位 / 去掉 `:not()` / 钩子名拼写漂移，均 exit 1）。

### 6.6 子批次 Review Gate 结论

**R1′ `standard`：Pass（0 blocker / 1 warning / 4 suggest）**。

- **RG-R1′-W01（warning，已修复）**：门禁对「带字面量回退的未识别形态」（`var(--caomei-z-overlay, 9999)` / `var(--caomei-z-dropdown, 1050)`）解析为 `null` 后静默跳过 T2 / T4 / T5 / T6——`check:design` 的 G4 只拦纯数字值、token 存在性检查对带 fallback 的引用放行，故存在绕过路径。**修复**：新增 **T8 `[unparsed-tier-form]`**（值中引用 `--caomei-z-*` 但形态无法解析即报错，fail-closed）+ 2 条负向单测 + 1 处 CLI 负向验证。
- **RG-R1′-S01（suggest，已采纳）**：`HOOK_NAME_EXCEPTIONS` 缺反向校验（例外条目腐烂无告警）。**修复**：新增 **T9 `[stale-exception]` / `[stale-modal-selector]`**（例外与模态内容白名单必须与产物一致）+ 正反例单测 + CLI 负向验证。
- **RG-R1′-S02（suggest，已采纳）**：`collectRuleEntries` 由私有改 export 后契约未钉定（相对路径 + 只展开平铺规则）。**修复**：在该函数 JSDoc 显式声明跨模块契约与「变更须同步复核」要求。
- **RG-R1′-S03（suggest，已采纳）**：T6 原先「含任意 `:not(` 即放行」，无关的 `:not()` 会掩盖真实继承。**修复**：改为**按类排除**——仅当 `:not(...)` 内容确实包含该变体类时放行（`excludesClass`），并补「无关 `:not()` 不构成排除」的负向单测。
- **RG-R1′-S04（suggest，未采纳为机检，登记为边界）**：E2E 的 `PANEL_CASES` 与声明层门禁未联动——新增 portal 组件时门禁单测的精确计数会失败（强制复核），但不强制补进 E2E 清单。登记为 §4 的已知流程边界（跨文件耦合成本高于收益）。
- **审计方独立复核**：`check-overlay-z-index` exit 0（83 文件 / 796 规则 / 浮层 10 处）、`it()` 计数 27（复核时点）与调用方声明一致；`rg` 清点 `--caomei-z-overlay` 仅剩 3 处遮罩、组件样式无 CSS 嵌套（平铺解析不构成盲区）；三处 CLI 负向验证复现一致。
- **审计方提醒（F 阶段落实）**：R1′ 结论与关键实测值必须回写本记录（本节即该落点）；`§5.1` 的 `git diff --cached` 复算命令在提交后不可复现，收尾须按 [AI 协作规范 §9](../../standards/ai-collaboration.md) 钉 `<base>..<end>` 持久 ref；提交时必须执行 §5.1 的两批次拆分。

### 6.7 收束与残留

- R3 的 1 blocker + 1 warning 均已逐条修复（索引摘要计数同步为 `6 项 / 114`；复算命令改为 `git diff --cached --numstat`）。
- 按 [AI 协作规范 §3.4](../../standards/ai-collaboration.md)，第 3 轮未 `Pass` 后不得原样续审；本批以「R1 内容 Pass + R2/R3 的流程类 finding 全部修复」收束，**未取得新一轮 Pass**，如实登记于此。
- 复发类 finding 的机检约束：RG-R3-B01 是 RG-R2-B01 的复发（同一计数跨载体漂移），已按 §3.5 记入 session wisdom（`.session/wisdom.md`）；该类的机检守卫（治理索引摘要与记录本体的计数对账）经评估为高误报 / 高过拟合，未实施，已登记 [Backlog §1.6](../../plan/backlog.md)。
- 残留 follow-up（不阻断）：用例 2 只断言计算 `z-index === 'auto'`、判别力自证只验模态内容根节点（R2 / R3 两次提出），已与「E2E ↔ 声明层门禁未联动」合并登记 [Backlog §1.6](../../plan/backlog.md) 的「浮层档位装置的判别力补强」。

### 6.8 提交记录（2026-09-30）

| 批次 | 提交 | 规模 |
| --- | --- | --- |
| ① 修复 + 装置 | `79e4ef9` fix(components): 修正模态内浮层面板层级并补齐 z-index 覆盖钩子 | 7 文件 / +349 −7 |
| ② 门禁与接线 | `17ff31f` feat(governance): 新增浮层档位语义门禁 check:overlay-z-index | 4 文件 / +734 −4 |
| ③ 规范与记录 | `4fffecc` docs(governance): 新增浮层遮挡修复记录与档位守卫规范落点 | 3 文件 / +205 −0 |
| ④ 规划登记与 Backlog | `bb57703` docs(plan): 登记浮层遮挡修复为 Phase 17 M3 并补阶段条目回扫约束（含 [规划规范 §3.9](../../standards/planning.md) 新增的回扫约束） | 7 文件 / +31 −13 |

