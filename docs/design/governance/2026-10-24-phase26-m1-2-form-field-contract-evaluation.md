# Phase 26 M1-2 `Form` / `FormItem` 形态与字段契约影响评估

> 创建时间：2026-10-24
> 触发：Phase 26 M1-2（[Phase 26 登记批次](./2026-10-22-phase26-registration.md) §2）。
> 性质：**只评估，不实现**；结论用于确定 1.0 冻结面边界，不产生 `src/**` 改动。

## 1. 结论摘要

- **不扩既有字段契约**：`FieldStateProps` / `FieldProps` / `FieldIdentityProps` 在 1.x 内保持现有字段与语义；不新增 `required` / `error` / `description` / `formItemContext` 一类公共 props。
- **推荐形态：独立组合层**。`Form` 负责布局、提交与校验编排；`FormItem` 负责 label / hint / error 的渲染与可访问性 id 生成，并通过**插槽作用域**提供 `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`（或按字段族给出绑定路径）。**12 个字段组件并非同质**：多数可承接，组型控件需 `aria-labelledby`，`Switch` 没有校验状态通道；实现时必须逐项绑定，不能假设一套绑定通吃。
- **自动注入（provide/inject）后置**：若未来希望 `FormItem` 自动把属性注入内部控件，应走「内部 context + 字段 shell 统一消费」的**增量**形态，显式 props / attrs 优先；不新增公开 props，可在 1.x 的 `minor` 交付。1.0 不实现。
- **校验规则不进核心**：`Form` 不自带 rules 引擎；首版形态以受控 `invalid` + 错误文案插槽为主，规则引擎（Zod / 自研）作为使用方组合或后续独立评估。

## 2. 现状取证

### 2.1 共享字段契约（3 个接口 / 12 个继承者）

定义于 `src/components/_shared/field.ts`：

| 接口 | 字段 | 语义 |
|:---|:---|:---|
| `FieldStateProps` | `size` / `disabled` / `invalid` | 尺寸与校验状态；`invalid` 映射 `aria-invalid` |
| `FieldProps` | 继承 `FieldStateProps` + `placeholder` | 输入类控件的占位文本 |
| `FieldIdentityProps` | `name` / `id` / `label` | 表单字段身份与可访问名；`label` 映射 `aria-label` |

继承者 **12** 个（命令：`rg -ln 'extends (FieldProps|FieldStateProps|FieldIdentityProps)' src/components/*/types.ts`）。按继承面拆分：

| 继承面 | 数量 | 组件 |
|:---|:-:|:---|
| `FieldProps` + `FieldIdentityProps` | 7 | `auto-complete` / `input` / `input-number` / `multi-select` / `select` / `tags-input` / `textarea` |
| `FieldStateProps` + `FieldIdentityProps` | 4 | `checkbox` / `checkbox-group` / `radio-group` / `select-button` |
| 仅 `FieldIdentityProps` | 1 | `switch` |

`Switch` 的 `types.ts` 明确不纳入 `FieldStateProps`（否则会新增 `size` / `invalid` 公开 props），因此它**没有** `invalid` 通道，也没有 `aria-invalid` 绑定。

### 2.2 内联同名字段（35 个 `types.ts`，宽口径）

命令：`rg -l 'size\?:|disabled\?:|invalid\?:|placeholder\?:' src/components/*/types.ts` → **35** 个文件：

```text
accordion  auto-complete  avatar  badge  button  calendar  chart
checkbox-group  color-picker  date-picker  dialog  drawer  dropdown-menu
file-upload  menu  message  multi-select  paginator  popover  progress-bar
progress-spinner  radio-group  rich-text-editor  select-button  select
slider  split-button  stepper  switch  tabs  tag  textarea  toggle-button
toolbar  tooltip
```

**口径说明**：这是**宽口径**扫描，包含大量非字段组件（如 `avatar` 的 `size`、`dialog` 的 `size`、`tag` 的 `size`）。35 与 12 的交集只有 **8** 个（`auto-complete` / `checkbox-group` / `multi-select` / `radio-group` / `select` / `select-button` / `switch` / `textarea`）。因此 35 不表示「35 个字段控件各自重复声明」，不能作为扩契约的依据；它只说明「同名字段在库内分布广，扩共享契约的影响面需要逐项核对」。

### 2.3 `required` 的分布（8 个，且不在共享契约内）

`required` **不属于** `FieldStateProps` / `FieldProps` / `FieldIdentityProps`。显式声明它的组件 **8** 个：

```text
checkbox  checkbox-group  multi-select  radio-group  slider  switch  tags-input  toolbar
```

命令：`rg -l 'required\?:' src/components/*/types.ts`。

**口径说明**：该扫描同样是宽口径，`toolbar` 不是字段控件（其 `required` 属原生表单校验）。未显式声明的原生控件仍可经 attrs 传入 `required`（透传机制见 §2.4）。因此 `FormItem` 不需要依赖统一的 `required` prop：对原生控件用 attrs，对分组 / 自定义控件由组件自身处理。

### 2.4 属性注入点（逐组件）

#### 2.4.1 12 个继承者逐项

| 组件 | 继承面 | `id` 落点 | 可访问名推荐 | 校验状态通道 |
|:---|:---|:---|:---|:---|
| `auto-complete` | FieldProps + Identity | 内层 `ComboboxInput` | `<label for>` 或 `label` prop | `invalid` prop |
| `checkbox` | FieldStateProps + Identity | `CheckboxRoot`（Reka 按钮 / 隐藏原生 input） | `label` prop 或 `aria-labelledby`；`<label for>` 需实现前实测 | `invalid` prop |
| `checkbox-group` | FieldStateProps + Identity | 组根 `div[role=group]` | `aria-labelledby`（`<label for>` 对组根无效） | `invalid` prop（attrs 优先级不稳，见下） |
| `input` | FieldProps + Identity | 内层 `<input>` | `<label for>` | `invalid` prop |
| `input-number` | FieldProps + Identity | `NumberFieldRoot`（是否下传到内层 input 需实现前实测） | `label` prop 或 `aria-labelledby` | `invalid` prop |
| `multi-select` | FieldProps + Identity | 内层 `ComboboxInput` | `<label for>` | `invalid` prop |
| `radio-group` | FieldStateProps + Identity | 组根 `div[role=radiogroup]` | `aria-labelledby`（`<label for>` 对组根无效） | `invalid` prop |
| `select` | FieldProps + Identity | `SelectTrigger` | `<label for>` | `invalid` prop |
| `select-button` | FieldStateProps + Identity | 组根 `ToggleGroupRoot` | `aria-labelledby`（`types.ts` 明确 `<label for>` 不可关联） | `invalid` prop |
| `switch` | 仅 Identity | `SwitchRoot`（`button[role=switch]`） | `label` prop 或 `aria-labelledby` | **无**：无 `invalid` prop，也无 `aria-invalid` 绑定 |
| `tags-input` | FieldProps + Identity | `TagsInputRoot`（输入框在内层） | `label` prop 或 `aria-labelledby`；`<label for>` 需实现前实测 | `invalid` prop |
| `textarea` | FieldProps + Identity | 内层 `<textarea>` | `<label for>` | `invalid` prop |

**结论**：`id` / `name` 经 `FieldIdentityProps` 继承，但落点按组件不同（内层控件 / 组根 / 隐藏原生控件）；`FormItem` 不能统一假设 `<label for>` 可用。可访问名优先用控件自身的 `label` prop（映射 `aria-label`），需要可见标签时对单控件用 `<label for>`、对组型控件用 `aria-labelledby`。

#### 2.4.2 透传机制归并

| 机制 | 组件 | `aria-describedby` 落点 | 备注 |
|:---|:---|:---|:---|
| `useAttrForwarding` | `input` / `textarea` / `input-number` / `auto-complete` / `multi-select` / `tags-input` / `checkbox` / `switch` | 内层控件 / 控件根 | 非 `class` / `style` 属性透传 |
| 手动 `v-bind="$attrs"` | `select` / `select-button` | 触发器 / 组根 | 与 `labelAttrs` 合并 |
| `useLabelAttrs` | `radio-group`；与 `useAttrForwarding` 组合于 `checkbox` / `switch` | 组根 / 控件根 | 主要处理可访问名 |
| 根 fallthrough | `checkbox-group` | 组根 `div[role=group]` | 未关闭 `inheritAttrs`，attrs 落在组根而非子项 |

**组型控件的 `aria-describedby` 作用于组根，不作用于每个子输入**；`FormItem` 的 hint / error 绑定应按字段族区分。

#### 2.4.3 `aria-invalid` 的优先级

- 11 个组件在模板显式绑定 `:aria-invalid="invalid || undefined"`，其中 `inheritAttrs: false` 的组件由显式绑定覆盖 attrs；应统一传 `invalid` prop。
- `checkbox-group` 未关闭 `inheritAttrs`，根节点 fallthrough 的 `aria-invalid` 可能覆盖显式绑定（Vue 3.5 SSR 实测）；同样应传 `invalid` prop，不依赖 attrs。
- `switch` 两者都没有：当前无法表达校验失败态。这是**已知缺口**，不在 1.0 修复；如需补齐，属单独的加法增强评估（见 §6）。

#### 2.4.4 `required`

`required` 不在共享契约内；原生控件可经 attrs 传入，8 个组件有显式 prop。`FormItem` 的必填标记应由自身渲染；是否把 `required` 传给控件按字段族决定，不构成契约扩展。

### 2.5 布局与样式

- 现有字段 shell（`src/styles/field-shell.css`）只负责**单行控件**的边框 / 背景 / 高度 / 状态，不含 label、hint、error 的布局类。
- 因此 `FormItem` 需要自己的布局规则（label 与控件的间距、hint / error 的行高与颜色、必填标记），可复用现有 token（`--caomei-space-*` / `--caomei-font-size-*` / `--caomei-color-danger`），不需要新增全局 token。
- 与 `FloatLabel` 的关系：`FloatLabel` 是「标签浮在控件内」的独立形态；`FormItem` 的默认形态应是「标签在控件上方」的常规布局，两者不互相替代。

## 3. 形态方案对比

| 方案 | 形态 | 对字段契约的影响 | 成本 | 判别力 / 风险 | 结论 |
|:---|:---|:---|:---|:---|:---|
| **A 独立组合层（推荐）** | `Form` + `FormItem`；`FormItem` 用插槽作用域给 `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`（或按字段族给绑定路径）；使用方 `v-bind` 到控件 | 零改动 | 中（新增 2 个组件 + 文档 + 测试） | 绑定显式、无隐式优先级冲突；使用方按字段族选择 `<label for>` 或 `aria-labelledby`，`Switch` 的校验态需单独说明 | 1.x 推荐形态 |
| **B 注入式自动绑定** | `FormItem` provide context；字段 shell 统一消费并填充缺失的 `id` / `aria-describedby` | 内部增量（12 个字段 + shell），不改公开 props | 高（12 个组件的测试与边界） | 使用方零绑定；但显式 attrs / props 与 context 的优先级、SSR、嵌套 FormItem、组型控件落点都需定义 | 后置，1.x `minor` 可增量做 |
| **C 内建 rules 引擎** | `Form` 接受 `rules` / schema，自动计算 `invalid` 与错误文案 | 可能新增公共 props / 依赖 | 高 | 与 Vue 生态的校验库重叠；API 面扩大且难回退 | 1.0 不做；需要时独立评估 |

**推荐 A**：它把「表单编排」与「字段契约」解耦，符合 1.x 冻结面最小化的目标；B 作为可选的增量演进保留，C 不进入核心。

## 4. 对 1.x 冻结面的影响结论

- **不扩既有字段契约**：`FieldStateProps` / `FieldProps` / `FieldIdentityProps` 的字段与语义保持不变；`required` / `error` / `description` 不进入共享契约。
- **不新增公共注入 props**：`aria-describedby` 继续走 attrs；若未来做 B，新增的是**内部 context**，不是公开 prop，因此不构成破坏性变更。
- **`Form` / `FormItem` 作为新增组件**：属向后兼容增量，可在 1.x 的 `minor` 发布；不影响 1.0 冻结面。
- **实现前置条件**（留给后续条目）：`FormItem` 的插槽作用域命名、id 生成策略（`useId`）、组型控件的 `aria-labelledby` 绑定、`Switch` 校验态的表达方式、错误 / 提示的 `aria-describedby` 合并规则与 SSR 行为，均须在实现前定稿；实现时按 §2.4.1 的 12 行逐项覆盖。

## 5. 验收与复算

| 项 | 命令 | 读数 |
|:---|:---|:---|
| 继承共享契约 | `rg -ln 'extends (FieldProps\|FieldStateProps\|FieldIdentityProps)' src/components/*/types.ts \| wc -l` | 12 |
| 继承面拆分 | 逐文件 `extends` 行 | 7 / 4 / 1 |
| 含内联同名字段 | `rg -l 'size\?:|disabled\?:|invalid\?:|placeholder\?:' src/components/*/types.ts \| wc -l` | 35 |
| 两者交集 | 两命令输出排序后 `comm -12` | 8 |
| `required` 显式声明 | `rg -l 'required\?:' src/components/*/types.ts \| wc -l` | 8 |
| `aria-describedby` 注入先例 | `rg -n "mergeDescribedBy\|aria-describedby" src/components/password/password.vue` | 1 处合并 |
| `Switch` 无校验态 | `rg -n "aria-invalid" src/components/switch/switch.vue` | 0 处 |

## 6. 非目标与未覆盖边界

- **不实现** `Form` / `FormItem`，不新增组件、props、样式、测试或示例。
- **不评估**具体校验库选型（Zod / vee-validate / 自研）与 rules DSL；只确认 1.0 不内建 rules 引擎。
- **不评估**下游实际表单用法（当前无在册下游用量证据）；结论不依赖下游数据。
- **不做**完整 a11y 审计；只列 `id` / `name` / `aria-describedby` / `aria-invalid` 的注入点。
- **未做真实 DOM 复核**：`NumberFieldRoot` / `CheckboxRoot` 的 id 最终落点、`<label for>` 对 `checkbox` / `switch` / `tags-input` 的有效性，均须在实现前以真实 DOM 实测。
- **`Switch` 的校验态缺口**：本记录只登记，不在 1.0 修复；如需补齐，属单独的加法增强评估（未登记为候选，待用户决策后按「评估 → Backlog → 用户决策」流程处理）。
- **`Form` / `FormItem` 实现**：已作为条件候选登记于 [Backlog](../../plan/backlog.md)，触发条件 = 1.0 后用户决策或下游出现真实表单编排需求。

## 7. Review Gate

- **audit-depth**：`standard`（只评估记录，但含 12 / 35 / 8 定量取证与 1.x 字段契约边界结论）；时间盒 ≤ 10 分钟。R1 于 2026-10-24 08:44:52Z 发起。
- **R1（`standard`）：`Reject`**（1 blocker / 2 warning / 3 suggest），6 条全部同批修复：
  - **RG-B1**：§2.4 原把 12 个继承者当同质对象；`Switch` 无 `invalid` 通道，`SelectButton` / `CheckboxGroup` / `RadioGroup` 的组根不能被 `<label for>` 关联；`checkbox-group` 的 fallthrough 可能覆盖 `aria-invalid`。⇒ 改为 12 行逐组件表（继承面 / `id` 落点 / 可访问名 / 校验态），并在 §1 / §3 / §4 同步收紧断言。
  - **RG-W1**：`aria-describedby` 机制归因过窄 ⇒ 改为四类机制（`useAttrForwarding` / 手动 `$attrs` / `useLabelAttrs` / 根 fallthrough），并注明组型控件作用于组根。
  - **RG-W2**：§7 占位与索引 / todo 的完成态冲突 ⇒ 使用守卫可识别的占位文案，索引标「同批回填」，本段即回填。
  - **RG-S1**：`id` / `name` 措辞改为「经 `FieldIdentityProps` 继承，落点按组件」。
  - **RG-S2**：§2.3 补宽口径说明，标注 `toolbar` 非字段控件。
  - **RG-S3**：`Form` / `FormItem` 已登记为 Backlog 条件候选，并同步 `todo.md` 未完成项汇总的判别键。
- **R2（`delta`，`quick`）：`Pass`**（R1 六项全部闭合；0 新增 blocker / warning；1 条 suggest）。时间盒 ≤ 5 分钟，实测约 2 分钟。
  - **RG-S4（R2）**：`Switch` 校验态缺口的「建议登记」无载体 ⇒ 已改为「未登记为候选，待用户决策后按流程处理」。
- **验证证据**：`pnpm lint:md:check` exit 0；`pnpm docs:check` 12 段全绿（含 links）；`check:governance-records` / `check:governance-counts` / `check:planning-numbers` / `check:final-newline` / `check:candidate-anchors` exit 0。定量复算见 §5。
- **未覆盖边界**：未跑 `pnpm docs:build`（`docs:check:links` 已覆盖死链面）；未做真实 DOM 复核（`NumberFieldRoot` / `CheckboxRoot` / `TagsInputRoot` 的 id 落点与 `<label for>` 有效性），留待实现前实测；未审 M1-1 / M1-3 / M2 ~ M4。
- **复查基线**：本记录 §1 / §2.1 / §2.3 / §2.4 / §3 / §4 / §6；`docs/plan/backlog.md` §1.2 的 `Form` / `FormItem` 行；`docs/plan/todo.md` M1-2 行与未完成项汇总；`docs/design/governance/index.md` 首条。
