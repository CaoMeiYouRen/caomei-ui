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
| 代码复用治理 | 同一模式 ≥3 处且语义一致，且抽取后净收益为正 | 阶段收口前 / 发布前 | 2026-09-17（第 5 轮：交付「标签属性转发」） | 进行中（暂无待执行批次，条件触发候选见 §2.1） |
| 样式重复收敛 | 同一视觉效果在 ≥3 个组件重复，且已存在或可归纳为语义 token | 阶段收口前 / 发布前 | 2026-09-17（第 5 轮：交付「阴影与遮罩 token 迁移」与「禁用态样式块」） | 进行中（禁用态不透明度 `0.5` 档待交付，见 §2.2） |

> 「上次执行」列同时记录**交付轮**与**门槛复核轮**（复核轮不计入交付轮次）；批次是否已交付以 §2.1 / §2.2 的判定列为准。

### 2.1 代码复用治理

- **复用地**：组件间共享落 `src/components/_shared/`，对外公开能力落 `src/composables/`。
- **取证口径**（2026-09-17 复核）：标签属性转发 `rg -l "useLabelAttrs" src/components/*/*.vue | wc -l` → 12；模板级 `:aria-label="label"` `rg -o ':aria-label="label"' src/components | wc -l` → 12；已继承公共契约 `rg -ln 'extends (FieldProps|FieldStateProps|FieldIdentityProps)' src/components/*/types.ts | wc -l` → 10；仍含内联同名字段的 `rg -l 'size\?:|disabled\?:|invalid\?:|placeholder\?:' src/components/*/types.ts | wc -l` → 30；聚焦控制 `rg -l 'useFocusControl' src/components/*/*.vue | wc -l` → 4。
- **描述收敛决策**：公共 props 的 JSDoc 采用通用措辞（如「是否禁用」/ "Whether the control is disabled"）；组件特有约束不靠重复字段声明承载，改在组件 `types.ts` 的接口级注释保留（如 select-button 的 `role="group"` id 约束、select / multi-select / auto-complete 的 `id` / `name` 落点）。

> **待执行批次**：暂无——「标签属性转发（模板级 `:aria-label` 无条件覆盖）」已于 2026-09-17 第 5 轮交付（12 处 / 11 文件，见 §3）。

- **达标待排期（第 5 轮 V 阶段新发现）**：**根可访问控件的 label 优先级统一**——`button` / `badge` / `progress-spinner` / `paginator` 的根即可访问控件未使用 `useLabelAttrs`，依赖 attrs fallthrough，导致同时传 `label` prop 与 `aria-label` 时**透传值胜出**（`input` / `progress-bar` 等则为 `label` 胜出），与「可访问名有值时覆盖 `aria-label`」契约不一致。规模 4 处 / 4 文件，语义一致；属**行为调整**（改优先级），需独立验收。证据：`docs/design/governance/2026-09-17-batch23-token-equivalence-ui-validation.md`（观察项 1，其中 Button / Badge / ProgressSpinner 已实测，Paginator 为代码推断未实测）。

- **未达门槛 / 条件触发（2026-09-17 逐文件核对后由「待执行」回退）**：表单控件公共 props 契约（后续候选）——`rg -l 'size\?:|disabled\?:|invalid\?:|placeholder\?:' src/components/*/types.ts` 命中的 30 个 `types.ts` 为宽口径；逐文件核对 5 个候选后确认其**字段集合与公共契约不一致**（`date-picker` 缺 `name`、`color-picker` 缺 `size`/`placeholder`、`slider` 缺 `size`/`invalid`/`id`、`toggle-button` 缺 `invalid`/`name`/`id`、`file-upload` 仅 `disabled`/`label`），纳入会**新增对外 props**，净收益不为正 → 改为**条件触发**：当某组件因功能需要自身新增这些字段时，顺带改为继承契约。
- **已判定不纳入（依据见评估记录 §6，保留结论避免重复评估）**：attrs 透传收敛（仅 2 处手写 `useAttrs()`，语义不同）、ARIA 布尔假值归一（15 处，抽取后表达式变长）、locale 文本解析（39 处，props 名与路径逐处不同）、选项列表渲染（3 份，primitive 与插槽能力不同）、数值钳位（2026-09-17 复核：`input-number` 内联 `Math.max`/`Math.min` + `date-picker` 本地 `clamp` 共 **2 处**，与评估记录 §6 同口径，仍远低于 ≥3 门槛）。

### 2.2 样式重复收敛

| 待执行批次 | 门槛判定（2026-09-17） | 证据 | 规模 | 说明 |
|------|------|------|------|------|
| 禁用态不透明度（`0.5` 档） | **达标（前置为意图裁决）** | `rg -o 'opacity: 0\.5;' src` → 20 处，其中 19 处为禁用选择器命中（`--disabled` / `:disabled` / `[data-disabled]`；18 处同块另有 `cursor: not-allowed`，`stepper-indicator` 仅 `opacity`），分布 18 文件；余 1 处为 `skeleton` 关键帧（非禁用，排除） | 18 文件 | **前置**：先裁决 `0.5` 是「有意的分级」还是「历史漂移」——若为漂移则归并到 `--caomei-disabled-opacity`，属**视觉变更**需独立验收；不得在未裁决前直接归并 |
| Input 家族样式层共享 | **未达门槛（条件触发）** | 仅知 Password 已由 Input 派生并复用样式，其余各自维护，缺 ≥3 处同构取证 | — | 出现样式分叉时补取证后启动 |

> **已交付**：
> - 「阴影与遮罩 token 迁移」已于 2026-09-17 第 5 轮交付（13 处 / 10 文件；`check:design` 的 rgb/hsl 预算由 13 收紧至 0）。
> - 「禁用态样式块」已于 2026-09-17 第 5 轮交付：口径订正为 11 处 `.caomei-x--disabled` CSS 块（11 文件）+ 7 处同值兄弟形态（`button:disabled` / `calendar[data-disabled]` / `color-picker__trigger:disabled` / `color-picker__swatch:disabled` / `time-input:disabled` / `file-upload__dropzone:disabled` / `radio-button[data-disabled]`）= **18 处 / 18 文件**；归纳对象为 `opacity` 单值（`cursor: not-allowed` 为固定关键字、禁用背景逐组件不同，均不参与归纳）。原台账「12 文件」为按组件计数时的口径误差。

## 3. 执行记录

| 轮次 | 日期 | 范围 | 产出 | 证据 |
|------|------|------|------|------|
| 首轮 | 2026-09-16 | 治理规范落地 + 代码复用治理：标签属性转发 / 表单控件公共 props 契约（首批） / 聚焦控制 | 开发规范与规划规范新增长期任务制度；`_shared` 新增 `useLabelAttrs` / `field` / `useFocusControl` | §2.1 取证口径与 git 历史 |
| 第 2 轮 | 2026-09-16 | 代码复用治理：表单控件公共 props 契约（第二批：`checkbox` / `radio-group` / `switch`） | 3 个 `types.ts` 改为继承公共契约；组件特有约束以接口级注释保留 | §2.1 取证口径与 git 历史 |
| 第 3 轮（Phase 10 收口前触发，**门槛复核轮**） | 2026-09-17 | **门槛复核**（两组任务的全部候选重新取证，见 §2.1 / §2.2 的 2026-09-17 口径） | 门槛与规模未变：待执行批次 2+3 项仍成立；未达门槛 5 项结论维持 | 用户本轮授权范围为**归档与规划清理**（零代码改动域），故未纳入实现批次；**下次触发点**：下一次阶段收口 / 发布前，或与下游迁移（B1 库侧补齐）并行时执行 |
| 第 4 轮（用户指令「执行门槛复核」） | 2026-09-17 | **逐候选门槛判定**（代码复用治理 2 项 + 样式重复收敛 3 项逐项取证判定；已判定不纳入 5 项结论维持，其中数值钳位证据更新为「2 处」） | **判定结果**：达标 3 项（模板级 `:aria-label` 转发 12 处 / 11 文件、阴影与遮罩 token 13 处 / 10 文件、禁用态样式块 12 文件）；**未达门槛 → 条件触发 2 项**（表单控件公共 props 契约后续候选、Input 家族样式层共享，见 §2.1 / §2.2）；已判定不纳入 5 项维持（数值钳位证据订正为 **2 处 / 2 个文件**） | 证据：§2.1 / §2.2 各行的 2026-09-17 判定依据与命令；未纳入实现批次（本轮为门槛复核，批次执行待下一次触发或用户指定） |
| 第 5 轮（用户指令「推进 3 个达标批次」） | 2026-09-17 | 代码复用治理：**标签属性转发**（12 处 / 11 文件）；样式重复收敛：**阴影与遮罩 token 迁移**（13 处 / 10 文件）、**禁用态样式块**（18 处 / 18 文件，口径订正见 §2.2） | 已交付：① `_shared/use-label-attrs` 新增 `labelAttrs`，12 处模板级转发共用该契约（空标签不渲染、不覆盖透传值）；② `theme.css` 归纳 `--caomei-shadow-xs/sm/md` 与 `--caomei-skeleton-highlight`，10 个组件迁移完毕，`check:design` 预算收紧为 0；③ `theme.css` 新增 `--caomei-disabled-opacity`，18 处 `opacity: 0.6` 全部收敛（无字面量残留） | 批次 1 提交 409c8ce、批次 2 c51eef8、批次 3 89f9f6c；Review Gate：批次 1 第 1 轮 Pass；批次 2 第 1 轮 Reject（文档过度声明）→ 第 2 轮 Pass；批次 3 第 1 轮 Reject（§6 禁用态口径与实现矛盾、证据计数不符）→ 第 2 轮 Reject（`0.5` 档仍被断言为「子部件」而无代码支撑）→ 第 3 轮 Pass（第 2 轮 blocker 为纯措辞修正，按 [AI 协作规范 §3.4](../standards/ai-collaboration.md) 显式声明新增预算与冻结范围）。规模超 10 文件阈值的理由：单语义 token 归纳天然跨全部消费点，拆分会产生「token 与字面量并存」的不可绿中间态。V 阶段：批次 2 / 3 经真实浏览器计算样式等价验证（153 项断言零漂移），证据见 [批次 2/3 值等价验证记录](../design/governance/2026-09-17-batch23-token-equivalence-ui-validation.md) |

> **触发义务**（[规划规范 §8](../standards/planning.md)）：每个阶段收口前与每次发布前各执行一轮；未留下执行记录视为未执行。第 3 轮已在本次 Phase 10 归档前执行并留痕（上表）。
