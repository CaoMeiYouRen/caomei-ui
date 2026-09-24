# 长期任务

本文档登记**周期性治理任务**：动作会随开发推进反复发生、需要按固定节奏重复执行，而非一次性交付。准入、编号与粒度规则见[规划规范 §8](../standards/planning.md)，本文档不重述。

> **定位**：本台账**只有可多阶段反复执行的任务**（每个任务 = 判定门槛 + 触发时机 + 可追加的批次）；一次性工作、已完成批次与无关记录不进入本表（已交付内容见 git 历史与[待办归档](./todo-archive.md)）。

## 1. 执行规则

制度定义与准入见[规划规范 §8](../standards/planning.md)，本节只记录操作细则：

- **批次追加**：在已认可方向下，按任务的判定门槛直接把工作包登记为批次，无需重复走用户决策。
- **每轮范围自定**：一轮执行不要求清空任务；按「价值 × 风险 × 粒度」选取本轮批次。若本轮为**门槛复核轮**（用户明确限定当轮为零代码改动域、或实现条件未备），可只做门槛 / 取证复核并留痕——但在「产出」列须显式写明未纳入实现批次的理由与下次触发点；复核轮不计入交付轮次，批次顺延至下一触发点。
- **抽取复用受准则约束**：逻辑层抽取必须满足[开发规范](../standards/development.md) 的「公共逻辑抽取与复用」小节。
- **未达门槛者不进入执行**：判定为「不实施 / 条件触发」的候选只保留一行结论（依据在[评估记录 §6](../design/governance/2026-09-16-new-requirements-evaluation.md)），不得为凑数纳入。

## 2. 任务台账

| 任务 | 判定门槛 | 触发时机 | 上次执行 | 状态 |
|------|----------|----------|----------|------|
| 代码复用治理 | 同一模式 ≥3 处且语义一致，且抽取后净收益为正 | 阶段收口前 / 发布前 | 2026-09-24（第 13 轮：门槛复核；第 7 轮：交付「label 优先级全库统一」） | 进行中（暂无待执行批次；条件触发候选见 §2.1） |
| 样式重复收敛 | 同一视觉效果在 ≥3 个组件重复，且已存在或可归纳为语义 token | 阶段收口前 / 发布前 | 2026-09-24（第 13 轮：门槛复核；第 6 轮：交付「禁用态 0.5 档归并」） | 进行中（**待执行批次 1 项**见 §2.2） |

> 「上次执行」列同时记录**交付轮**与**门槛复核轮**（复核轮不计入交付轮次）；批次是否已交付以 §2.1 / §2.2 的判定列为准。

### 2.1 代码复用治理

- **复用地**：组件间共享落 `src/components/_shared/`，对外公开能力落 `src/composables/`。
- **取证口径**（2026-09-24 复核：除注明外与 2026-09-23 一致）：标签属性转发 `rg -l "useLabelAttrs" src/components/*/*.vue | wc -l` → 15（另 `labelAttrs` 直接引用 9 个文件，如 `tags-input` 经 `labelAttrs` 而未走 `useLabelAttrs`）；模板级 `:aria-label="label"` `rg -o ':aria-label="label"' src/components | wc -l` → 0（已全部收敛到 `labelAttrs`）；已继承公共契约 `rg -ln 'extends (FieldProps|FieldStateProps|FieldIdentityProps)' src/components/*/types.ts | wc -l` → **12**（2026-09-24 +1 = **Phase 13** M2-1 新增 `tags-input`）；仍含内联同名字段的 `rg -l 'size\?:|disabled\?:|invalid\?:|placeholder\?:' src/components/*/types.ts | wc -l` → 31；聚焦控制 `rg -l 'useFocusControl' src/components/*/*.vue | wc -l` → 4。
- **描述收敛决策**：公共 props 的 JSDoc 采用通用措辞（如「是否禁用」/ "Whether the control is disabled"）；组件特有约束不靠重复字段声明承载，改在组件 `types.ts` 的接口级注释保留（如 select-button 的 `role="group"` id 约束、select / multi-select / auto-complete 的 `id` / `name` 落点）。

> **待执行批次**：暂无。

- **未达门槛 / 条件触发（2026-09-24 复核维持）**：表单控件公共 props 契约（后续候选）——`rg -l 'size\?:|disabled\?:|invalid\?:|placeholder\?:' src/components/*/types.ts` 命中的 31 个 `types.ts` 为宽口径；逐文件核对 5 个候选后确认其**字段集合与公共契约不一致**（`date-picker` 缺 `name`、`color-picker` 缺 `size`/`placeholder`、`slider` 缺 `size`/`invalid`/`id`、`toggle-button` 缺 `invalid`/`name`/`id`、`file-upload` 仅 `disabled`/`label`），纳入会**新增对外 props**，净收益不为正 → 改为**条件触发**：当某组件因功能需要自身新增这些字段时，顺带改为继承契约。
- **已判定不纳入（依据见评估记录 §6，保留结论避免重复评估）**：attrs 透传收敛（**计数订正（2026-09-24）**：`rg -l "useAttrs\(\)" src/components/*/*.vue | wc -l` → **10**，原记「仅 2 处」为过期断言。**历史口径对账（两条独立事实）**：① 首轮（`64a3ac8`）命令 `rg -l 'const attrs = useAttrs\(\)' src/components | wc -l` → **13 = 12 个 `.vue` + 1 个 `.ts`**（`_shared/use-attr-forwarding.ts` 自身；当时 `use-label-attrs.ts` 尚未创建），排除该 helper 后 **12 个 `.vue` 手写**；② 本轮同命令 → **12 = 10 个 `.vue` + 2 个 `.ts`**（`use-attr-forwarding.ts` / `use-label-attrs.ts` 两个共享 helper）。故首轮 12 个 `.vue` 手写 → 本轮 10 个 `.vue` 手写（**净减少 2 个**，非 helper 变动；期间有组件退出与新增，不逐一列举）。这 10 个文件均**不使用 `useAttrForwarding` 的根 / 控件分流**（为整体 `$attrs` 透传、或仅读取 `attrs['aria-label']` 供 `resolveLabelName`；`slider` 另对 thumb 选择性转发 2 个 aria 属性），且标签优先级已由 `resolveLabelName` 单点承载（第 7 轮交付），**无进一步抽取收益**，结论维持不纳入）、ARIA 布尔假值归一（15 处，抽取后表达式变长）、locale 文本解析（39 处，props 名与路径逐处不同）、选项列表渲染（3 份，primitive 与插槽能力不同）、数值钳位（2026-09-24 复核维持：`input-number` 的值钳位 1 处（`Math.max(props.min, next)` / `Math.min(props.max, next)` 同一处两行）+ `date-picker` 本地 `clamp` 定义 1 处（`time-input.vue`，另有 4 个调用点）= **2 处**，仍远低于 ≥3 门槛；另 `Math.max(maximum ?? 20, precision ?? 0)` 为小数位计算、**非值钳位**，不计入）。

### 2.2 样式重复收敛

| 待执行批次 | 门槛判定（2026-09-24） | 证据 | 规模 | 说明 |
|------|------|------|------|------|
| 字段 shell 样式层共享（原「Input 家族样式层共享」） | **达标（2026-09-24 取证，修订此前「条件触发」）**：field shell 的 **13 条声明**在 **4 个字段组件**（`input` / `textarea` / `input-number` / `tags-input`；`password` 经 `Input` 派生）逐字重复（组件变量名归一后），取值以既有语义 token 为主，其余为可归纳的字面量（`border-box` / `100%` / `0.15s` / `2px` / `20%`） | `node test-results/m3-1/field-shell-overlap.mjs`：各组件 shell 声明 15 / 13 / 15 / 16，**四组件共有 13**（`box-sizing` / `width` / `border` / `border-radius` / `background` / `color` / `transition` / `:focus-within` 的 `border-color` + `box-shadow` / `--invalid` 的 `border-color` 与 `--invalid:focus-within` 的 `box-shadow` / `--disabled` 的 `background` + `opacity`） | 4 个字段组件 + 1 处共享层 | **前置**：共享形态会引入公共类 / 变量契约（影响下游样式覆盖），须先定形态（共享基类 vs 语义 token 契约）再实施；**本轮未执行**（0.3.0 发布前复核轮，零代码改动域）；**下次触发点**：下一交付轮，或用户指定 |

## 3. 执行记录

| 轮次 | 日期 | 范围 | 产出 | 证据 |
|------|------|------|------|------|
| 首轮 | 2026-09-16 | 治理规范落地 + 代码复用治理：标签属性转发 / 表单控件公共 props 契约（首批） / 聚焦控制 | 开发规范与规划规范新增长期任务制度；`_shared` 新增 `useLabelAttrs` / `field` / `useFocusControl` | §2.1 取证口径与 git 历史 |
| 第 2 轮 | 2026-09-16 | 代码复用治理：表单控件公共 props 契约（第二批：`checkbox` / `radio-group` / `switch`） | 3 个 `types.ts` 改为继承公共契约；组件特有约束以接口级注释保留 | §2.1 取证口径与 git 历史 |
| 第 3 轮（Phase 10 收口前触发，**门槛复核轮**） | 2026-09-17 | **门槛复核**（两组任务的全部候选重新取证，见 §2.1 / §2.2 的 2026-09-17 口径） | 门槛与规模未变：待执行批次 2+3 项仍成立；未达门槛 5 项结论维持 | 用户本轮授权范围为**归档与规划清理**（零代码改动域），故未纳入实现批次；**下次触发点**：下一次阶段收口 / 发布前，或与下游迁移（B1 库侧补齐）并行时执行 |
| 第 4 轮（用户指令「执行门槛复核」） | 2026-09-17 | **逐候选门槛判定**（代码复用治理 2 项 + 样式重复收敛 3 项逐项取证判定；已判定不纳入 5 项结论维持，其中数值钳位证据更新为「2 处」） | **判定结果**：达标 3 项（模板级 `:aria-label` 转发 12 处 / 11 文件、阴影与遮罩 token 13 处 / 10 文件、禁用态样式块 12 文件）；**未达门槛 → 条件触发 2 项**（表单控件公共 props 契约后续候选、Input 家族样式层共享，见 §2.1 / §2.2）；已判定不纳入 5 项维持（数值钳位证据订正为 **2 处 / 2 个文件**） | 证据：§2.1 / §2.2 各行的 2026-09-17 判定依据与命令；未纳入实现批次（本轮为门槛复核，批次执行待下一次触发或用户指定） |
| 第 5 轮（用户指令「推进 3 个达标批次」） | 2026-09-17 | 代码复用治理：**标签属性转发**（12 处 / 11 文件）；样式重复收敛：**阴影与遮罩 token 迁移**（13 处 / 10 文件）、**禁用态样式块**（18 处 / 18 文件，口径订正见 §2.2） | 已交付：① `_shared/use-label-attrs` 新增 `labelAttrs`，12 处模板级转发共用该契约（空标签不渲染、不覆盖透传值）；② `theme.css` 归纳 `--caomei-shadow-xs/sm/md` 与 `--caomei-skeleton-highlight`，10 个组件迁移完毕，`check:design` 预算收紧为 0；③ `theme.css` 新增 `--caomei-disabled-opacity`，18 处 `opacity: 0.6` 全部收敛（无字面量残留） | 批次 1 提交 409c8ce、批次 2 c51eef8、批次 3 89f9f6c；Review Gate：批次 1 第 1 轮 Pass；批次 2 第 1 轮 Reject（文档过度声明）→ 第 2 轮 Pass；批次 3 第 1 轮 Reject（§6 禁用态口径与实现矛盾、证据计数不符）→ 第 2 轮 Reject（`0.5` 档仍被断言为「子部件」而无代码支撑）→ 第 3 轮 Pass（第 2 轮 blocker 为纯措辞修正，按 [AI 协作规范 §3.4](../standards/ai-collaboration.md) 显式声明新增预算与冻结范围）。规模超 10 文件阈值的理由：单语义 token 归纳天然跨全部消费点，拆分会产生「token 与字面量并存」的不可绿中间态。V 阶段：批次 2 / 3 经真实浏览器计算样式等价验证（153 项断言零漂移），证据见 [批次 2/3 值等价验证记录](../design/governance/2026-09-17-batch23-token-equivalence-ui-validation.md) |
| 第 6 轮（用户 2026-09-17 追加决策 2 项） | 2026-09-17 | 代码复用治理：**根可访问控件 label 优先级统一**（`button` / `badge` / `progress-spinner` / `paginator`，4 组件）；样式重复收敛：**禁用态不透明度 `0.5` 档归并**（19 处 / 18 文件） | 已交付：① 4 组件统一为「显式 `label` > 透传 `aria-label` > 语言默认文案」——`paginator` / `progress-spinner` 补齐原被语言兜底覆盖的中间层级，并分清「组件有意见 / 无意见」以避免 `undefined` 覆盖透传的 `role` / `aria-hidden` / `aria-busy`；② 19 处 `opacity: 0.5` 并入 `--caomei-disabled-opacity`，禁用态不透明度 37 处声明值统一（属**有意视觉变更** `0.5 → 0.6`） | 批次 4（label 优先级）提交 `b7d9613`、批次 5（`0.5` 归并）提交 `5e1caf2`；Review Gate：批次 4 第 1 轮 Reject（`inheritAttrs: false` 后模板绑定的 `undefined` 覆盖透传 `role` / `aria-hidden`）→ 第 2 轮 Reject（`paginator` / `progress-spinner` 文档承诺与实现相反）→ 第 3 轮 Pass（按 [AI 协作规范 §3.4](../standards/ai-collaboration.md) 声明新增预算与冻结范围）；批次 5 第 1 轮 Reject（`backlog` 候选条目残留已失效的「0.5 待裁决」前提等 4 项文档不一致）→ 第 2 轮 Reject（批次 4/5 的轮次归属与本节「第 6 轮」行矛盾）→ 第 3 轮 Pass（范围＝B2 与 F1–F4：轮次归属全仓自洽、F1–F4 落地，重复条目核验 `rg -c` = 1；第 3 轮按 [AI 协作规范 §3.4](../standards/ai-collaboration.md) 声明新增预算与冻结范围）。V 阶段：批次 5 经真实 Chromium 逐选择器 A/B 对照（19/19 命中 `0.5 → 0.6`，含声明值 vs 嵌套有效值边界），证据见 [batch24 记录](../design/governance/2026-09-17-batch24-disabled-opacity-merge-ui-validation.md)；批次 4 的 aria 契约在该记录 §6 复核 |
| 第 7 轮（用户指令「其他组件有类似问题也一并处理」） | 2026-09-17 | 代码复用治理：**label 优先级全库统一**（9 组件收敛 + 2 组件重构：`progress-bar` / `toast` / `stepper` / `date-picker` / `color-picker` / `slider` / `split-button` / `calendar` / `file-upload`；`paginator` / `progress-spinner` 重构） | 已交付：① 新增 `_shared/use-label-attrs` 的 `resolveLabelName`，把「显式 `label` > 透传 `aria-label` > 语言兜底文案」单点定义（空串与非字符串透传值按缺省处理、永不返回空串）；② 修复 `calendar` 面板名被 fallthrough 覆盖（`inheritAttrs: false` + 显式绑定，且未显式提供时保留 Reka 合成的月份上下文）；③ 修复 `file-upload` 的 `undefined` 覆盖透传值；④ 8 个 `types.ts` JSDoc、18 个中英组件文档与 `development.md` §5 同步契约 | 提交 `18c45be`；Review Gate 第 1 轮 Pass（1 warning：日历丢失月份上下文 → 已修并补断言；4 suggest 全部采纳）；V 阶段：真实 Chromium 计算可访问名 51 项全过（role+name 命中 / `aria-label` 属性 / CDP AX 名三方一致），证据见 [记录](../design/governance/2026-09-17-label-priority-unification-ui-validation.md) |
| 第 8 轮（Phase 7 第二阶段归档前触发，**门槛复核轮**） | 2026-09-19 | **门槛复核**（两组任务的全部候选重新取证；已判定不纳入 5 项结论维持） | 门槛与规模未变：**待执行批次 0 项**（3 个达标批次已于第 5 / 6 轮交付）；**未达门槛 → 条件触发 2 项维持**（表单控件公共 props 契约后续候选、Input 家族样式层共享）；已判定不纳入 5 项维持（数值钳位复核维持 **2 处**） | 证据：§2.1 / §2.2 各行的 2026-09-19 取证命令与判定；用户本轮授权范围为**归档与规划清理**（零代码改动域），故未纳入实现批次；**下次触发点**：下一次阶段收口 / 发布前，或用户指定 |
| 第 9 轮（Phase 5 第二阶段收口前触发，**门槛复核轮**） | 2026-09-19 | **门槛复核**（两组任务的全部候选；复用同日第 8 轮取证，门槛与规模未变） | 待执行批次 **0 项**；未达门槛 → 条件触发 **2 项维持**（表单控件公共 props 契约后续候选、Input 家族样式层共享）；已判定不纳入 5 项维持 | 证据同第 8 轮（§2.1 / §2.2 的 2026-09-19 取证命令与判定）；用户本轮授权范围为**发布后规划清理**（零代码改动域），故未纳入实现批次；**下次触发点**：下一次阶段收口 / 发布前，或用户指定 |
| 第 10 轮（Phase 11 收口前触发，**门槛复核轮**） | 2026-09-20 | **门槛复核**（两组任务的全部候选重新取证） | 待执行批次 **0 项**；未达门槛 → 条件触发 **2 项维持**（表单控件公共 props 契约后续候选、Input 家族样式层共享）；已判定不纳入 5 项维持 | 证据：§2.1 / §2.2 各行的 2026-09-20 取证命令与判定；用户本轮授权范围为**归档与规划清理**（零代码改动域），故未纳入实现批次；**下次触发点**：下一次阶段收口 / 发布前，或用户指定 |
| 第 11 轮（Phase 12 收口前触发，**门槛复核轮**） | 2026-09-23 | **门槛复核**（两组任务的全部候选重新取证；已判定不纳入 5 项结论维持） | 待执行批次 **0 项**；未达门槛 → 条件触发 **2 项维持**（表单控件公共 props 契约后续候选、Input 家族样式层共享）；已判定不纳入 5 项维持（数值钳位复核：`input-number` 值钳位 1 处 + `date-picker` 本地 `clamp` 1 处 = **2 处**，另订正 `Math.max(maximum ?? 20, precision ?? 0)` 为小数位计算、不计入） | 证据：§2.1 / §2.2 各行的 2026-09-23 取证命令与判定（`useLabelAttrs` 15 / 模板级 `:aria-label="label"` 0 / 继承契约 11 / 含内联同名字段 31 / `useFocusControl` 4）；用户本轮授权范围为**阶段归档与规划清理**（零代码改动域），故未纳入实现批次；**下次触发点**：下一次阶段收口 / 发布前，或用户指定 |
| 第 12 轮（**0.3.0 发布前触发**，**门槛复核轮**） | 2026-09-24 | **门槛复核**（两组任务的全部候选重新取证；已判定不纳入 5 项结论维持，其中「attrs 透传收敛」计数订正；**§2.2 候选补齐取证后修订为「达标」**） | 待执行批次 **1 项**（**新增「字段 shell 样式层共享」**——§2.2 由「条件触发」修订为达标，13 条 shell 声明在 4 个字段组件逐字重复）；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持 | 证据：§2.1 各行 2026-09-24 取证（`useLabelAttrs` 15 / `labelAttrs` 9 / 模板级 `:aria-label="label"` 0 / 继承契约 **12**（+1 = **Phase 13** M2-1 新增 `tags-input`）/ 含内联同名字段 31 / `useFocusControl` 4；数值钳位 2 处）；§2.2 取证 `node test-results/m3-1/field-shell-overlap.mjs`（各组件 shell 声明 15/13/15/16，四组件共有 **13**）。**订正**：「attrs 透传收敛」的 `useAttrs()` 计数由原记「仅 2 处」订正为 **10**（原记为过期断言）；**历史口径对账**：首轮（`64a3ac8`）13 = 12 个 `.vue` + 1 个 `.ts`（helper 自身），排除后 12 个 `.vue` 手写；本轮 12 = 10 个 `.vue` + 2 个 `.ts`（两个 helper）——**净减少 2 个 `.vue` 手写**（非 helper 变动），10 个文件均不使用 `useAttrForwarding` 的根 / 控件分流，**不纳入结论维持**。**未纳入实现批次**：本轮为 **0.3.0 发布前复核轮**（配合 M3-2，零代码改动域）；「字段 shell 样式层共享」的共享形态涉及公共类 / 变量契约，须先定形态再实施。**下次触发点**：下一交付轮，或用户指定 |
| 第 13 轮（**Phase 13 收口前触发**，**门槛复核轮**） | 2026-09-24 | **门槛复核**（两组任务的全部候选重新取证；已判定不纳入 5 项结论维持） | 待执行批次 **1 项维持**（字段 shell 样式层共享，见 §2.2）；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持 | 证据：§2.1 各行 2026-09-24 取证（`useLabelAttrs` 15 / `labelAttrs` 9 / 模板级 `:aria-label="label"` 0 / 继承契约 **12** / 含内联同名字段 31 / `useFocusControl` 4 / `useAttrs()` 10；数值钳位 2 处）；§2.2 取证 `node test-results/m3-1/field-shell-overlap.mjs`（各组件 shell 声明 15/13/15/16，四组件共有 **13**，与第 12 轮一致）。**未纳入实现批次**：本轮为 **Phase 13 收口前复核轮**（零代码改动域）；「字段 shell 样式层共享」的共享形态涉及公共类 / 变量契约，须先定形态再实施。**下次触发点**：下一交付轮，或用户指定 |

> **触发义务**（[规划规范 §8](../standards/planning.md)）：每个阶段收口前与每次发布前各执行一轮；未留下执行记录视为未执行。0.1.0 发布前的义务由同日第 8 轮覆盖（Phase 7 第二阶段归档前），第 9 轮为 Phase 5 第二阶段收口前触发并留痕，第 10 轮为 Phase 11 收口前触发并留痕，第 11 轮为 Phase 12 收口前触发并留痕，第 12 轮为 0.3.0 发布前触发并留痕，**第 13 轮为 Phase 13 收口前触发并留痕**（上表）。**0.2.0 发布前（2026-09-22）的义务未留痕，按 §8 视为未执行**——发布已完成，不追溯补做；下一次发布前须先执行并留痕。
