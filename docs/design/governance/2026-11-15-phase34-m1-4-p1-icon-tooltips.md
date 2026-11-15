# Phase 34 M1-4：P1 icon-only 第一批（Select 族清除 / InputNumber 步进 / Password 显隐）

> 创建时间：2026-11-15
> 触发：用户「继续 M1-4」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M1-4 行。

## 1. 交付面（7 文件）

| 面 | 文件 |
|:---|:---|
| 触发面（6） | `select.vue` / `multi-select.vue` / `auto-complete.vue` / `tags-input.vue` 的清除（清空）按钮；`input-number.vue` 的步进两键；`password.vue` 的显隐按钮 |
| 单测（1） | `src/components/tooltip/icon-tooltip-integration.test.ts`（6 个触发面集中覆盖） |

治理索引与记录本体属登记 / 留痕，不计入上表。**未新增任何公开 prop**。

## 2. 决策

1. **复用内部 `CaomeiIconTooltip`**（M1-2 引入；登记行写的「复用 composable」实际落为复用该内部组件——两者同属提示接线，本批以后者为准），不新增接线代码；内容取各触发面既有的可访问名（`clearLabel` / `increaseLabel` / `decreaseLabel` / `toggleLabel`），因此可访问名与提示文本同源、不会漂移。
2. **停用不挂载**：清除类按钮本就在 `clearable`（已含 `!disabled`）下才渲染；步进按钮额外按「与 Reka 同源的边界判定」停用提示（组件 `disabled` 或值已到 `min` / `max`）；Password 显隐按 `disabled` 停用。提示停用只影响提示，不改按钮自身的 `disabled`。
3. **几何零位移**：`CaomeiIconTooltip` 用 `as-child` + 无 DOM 透传层，触发面仍是原元素；真实 Chromium 对 7 个触发点逐一比对悬停前后 `boundingBox`（x / y / width / height）完全一致。
4. **`v-if` 放在包装层**：提示触发器要求单一子元素，故把原有 `v-if` / `v-else-if` 从按钮移到 `CaomeiIconTooltip` 上（AutoComplete 的加载态链保持 `v-if` → `v-else-if` 顺序）。
5. **测试集中在一个文件**：6 个触发面共用同一内部组件，分散到 6 个组件测试会把文件面推到 12+；集中覆盖「可访问名 → 提示内容」「停用到不挂载」「内容随状态切换」。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | 新增 10 例（6 触发面 + 边界停用 + 只读 + 加载态 + 停用不挂载）；全量 3280 passed |
| 真实 Chromium | 7 个触发点（含步进两键）提示文本与可访问名一致；悬停前后几何完全一致；`disabled` 的 Password 悬停无面板 |
| `capture:styles` | 0 差异（399 项） |
| 视觉回归 | 42 passed（0 diff） |
| E2E | `field-overflow` / `select-long-list` / `hit-target` 48 passed（含「17 个表单控件盒命中区 ≥24×24 且视觉盒不变」） |

> 并行负载 flaky：`date-picker` 的 `showTime` 用例在两次全量首跑中各失败 1 例（不同用例），隔离运行与第二次全量均通过；本批未触及 date-picker，与改动无因果，按测试规范 §6.1 登记。

> 链接形态（适用 M2-1 引入的英文页回链；本批无英文页交付）：英文组件页回链治理记录使用站内绝对路径（`/design/governance/<slug>`）；`docs:check:links` 对 `../../../design/...` 判为有效，但 VitePress 构建会报死链。

## 4. Review Gate

- **R1（`standard`，A 实现 / B 记录两分区并发）**：A `Pass`（0 blocker；1 warning：步进停用漏 `readonly` 且「与 Reka 同源」表述过强；4 suggest：边界判定为近似、负向断言缺正向对照、固定睡眠、测试名含 `P1`）；B `Reject`（1 blocker：索引摘要只列 F13，未列承接编号集合；4 warning：M2-1 遗留节指针悬空、F13 混入 P2 面、链接形态注无所指、加载态结构无断言）。
- **R1 修复**：步进停用补 `readonly` 并把边界近似写入注释；补正向 `data-state` 断言、只读用例与「加载态不渲染清除按钮」用例；测试名去掉批次编号；固定睡眠改条件等待；索引摘要列完整编号集合并给「摘要必须列承接编号」口径；F13 拆分（P2 面按登记非目标不挂）；M2-1 指针改为「M2-1 未使用 F 编号」；链接注注明适用载体。
- **R2（`quick`，两分区修复点）**：A `Pass`（0 blocker；W1 / S1 ~ S4 关闭；3 条 follow-up：只读用例标题与数量断言、`data-disabled` 正交证据、注释「主流浏览器」措辞——前两项已在本轮文本收口）；B `Pass`（0 blocker；blocker 与 W1 / W2 / S4 关闭；W3 收窄为「M2-1 起」；剩余 follow-up：摘要与口径的 F12 收敛标注、P2 排除说明——均已在提交前收口）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 / F2 / F4 / F6 | 承接 M1-1 | M1-6 / M4-1、M1-7、M1-8 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 ~ F12 | 承接 M1-3 | 见 M1-3 记录遗留节（M2-1 未使用 F 编号） |
| F13 | P1 其余组件（Calendar / FileUpload / ColorPicker / DatePicker / Image / Alert·Message）的提示接入 | M1-5 |
| — | P2 组件（Avatar / Badge / Stepper / Toast）的提示接入 | 本阶段不纳入（登记 §非目标）；出现下游需求再评估 |

## 6. 复查基线

本记录 §1 ~ §5；6 个组件的触发面模板与 `icon-tooltip-integration.test.ts`；`src/components/tooltip/icon-tooltip.vue`。
