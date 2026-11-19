# Phase 37 M2-1 契约设计：`allowEmptyValue`

> 创建时间：2026-11-19
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M2-1。本记录只承载契约设计，**零实现、零 API 落地**；实现与文档分别由 M2-2 / M2-3 承接。
> 前置事实来源：[选择器空串选项值调研](./2026-11-17-select-empty-option-value-evaluation.md) §2 / §5.2（Reka 面板渲染即抛、P0 已改为告警 + 丢弃）。

## 1. 结论摘要

- 新增公共 prop `allowEmptyValue?: boolean`，默认 `false`，作用于 `Select` / `MultiSelect` / `AutoComplete`；`SelectButton` **不引入**（见 §5）。
- 默认 `false` 时行为与 P0 完全一致：`value === ''` 的选项开发期告警 + 丢弃，模型侧 `''` 仍表示「未选择」。
- 开启后 `''` 成为**真实选项值**：选项不再丢弃、面板可渲染与选中、模型原样回显 `''`、触发器显示该选项 label。
- 上游限制（Reka 的 `SelectItem` / `ComboboxItem` 只拒绝空串 value，面板渲染即抛）由**内部私有 token** 承载；token 不出现在模型、插槽、事件载荷与表单提交值中（§3）。
- 「未选择」与「选中的空值项」必须可区分，故开启后「未选择」统一为 `null`（Select）/ `[]`（MultiSelect、AutoComplete 多选）/ `undefined`（AutoComplete 单选）；清除按钮**永不写入 `''`**。

## 2. 作用面

| 组件 | 模型类型 | `allowEmptyValue: false`（默认） | `allowEmptyValue: true` |
|:---|:---|:---|:---|
| `Select` | `OptionValue \| null` | 空串选项告警 + 丢弃；模型 `''` = 未选 | 空串选项渲染 / 选中；模型 `''` = 选中该选项；未选仍为 `null` |
| `MultiSelect` | `OptionValue[]` | 同上；数组中的 `''` 只能由外部写入 | 空串选项可增删；`['', 'a']` 合法；未选为 `[]` |
| `AutoComplete` | `string \| string[] \| undefined` | 空串选项告警 + 丢弃；单值 `''` = 未选 | 空串选项渲染 / 选中；未选改为 `undefined`（单选）/ `[]`（多选），见 §4.1 |
| `SelectButton` | 值类型由调用方决定 | `''` 天然合法（ToggleGroup 基座无此断言） | 不提供该 prop |

- 作用点只有「选项归一化 → Reka 面板 → 模型回写」这一段；`OptionValue` 类型与 `resolveOptionValue` 的收窄规则都不变（`''` 本就是合法 `string`）。
- `AutoComplete` 的模型增加「未选择 = `undefined`」语义并按 `string | string[] | undefined` 标注（`undefined` 仅 opt-in 下产生），需与 prop 同批更新 `check:api-surface` 基线快照与 `types.ts` JSDoc（§6）。

## 3. 内部 token 承载

### 3.1 token 与冲突守卫

- **token 形态**：`_shared/option.ts` 内新增私有常量（不从包入口导出）：

  ```text
  EMPTY_OPTION_TOKEN = '__caomei_empty_value__'
  ```

- **仅 opt-in 生效**：`allowEmptyValue !== true` 时不做任何替换，token 常量在该路径不可达（保持默认行为的「告警 + 丢弃」）。
- **冲突守卫**：opt-in 开启且选项集中存在 `value === EMPTY_OPTION_TOKEN` 的**非空值选项**时，该选项按契约外值丢弃并开发期告警（提示该字符串被保留），避免用户真实值与空值项互相顶替；opt-in 关闭时该值按普通字符串处理。
- **为什么用字符串 token**：Reka 的 item value 走 `by` 比较（默认 `===`），选项目前只接受 `string | number`；token 保持单一字符串比较路径，可被单测直接断言。`AcceptableValue` 类型本身还含 `bigint` / 记录类型 / `null`，但本库的选项契约只用 `OptionValue`。

### 3.2 双向映射（模型 ↔ Reka）

| 组件 | 送往 Reka 的模型（`toReka`） | 从 Reka 回写（`fromReka`） | 选项目 `value` |
|:---|:---|:---|:---|
| `Select` | `model === '' && allowEmptyValue ? EMPTY_OPTION_TOKEN : model` | token → `''`，其余原样 | 空值项用 token，其余原值 |
| `MultiSelect` | 数组逐项映射（`''` → token） | 逐项逆映射 | 同上 |
| `AutoComplete` | 单值同 `Select`；多选同 `MultiSelect` | 同上；`undefined` 保持 `undefined` | 同上 |

- 归一化结果同时保留**对外值**（`value`）与**面板值**（`rekaValue`）：插槽、`option` / `value` 事件、`#option` 作用域、`selectedOption` 查找一律用对外值；只有 `SelectItem` / `ComboboxItem` 与 Reka 模型使用面板值。
- `AutoComplete` 的 `optionMap` 以面板值为键，`labelFor()` 内部先 `toReka()` 再查表，保证空值项 label 可解析。
- `onItemSelect` / `select` 事件在**映射之后**取值，token 不会外泄。

### 3.3 表单提交（`name`）

- opt-in 开启时**不把 `name` 交给 Reka 根**：Reka 的原生控件会以面板值（token）作为提交值，令牌会泄漏到表单。改由组件自持隐藏输入：
  - 单值（Select / AutoComplete 单选）：一个隐藏输入，`value = model ?? ''`；未选择提交空字符串（与 Reka 现有空 option 的行为一致）。
  - 多值（MultiSelect / AutoComplete 多选）：每个模型值一个同名隐藏输入，顺序与模型一致；空数组不渲染。
- opt-in 关闭时保持 Reka 原生控件路径（现状），不做替换。

## 4. 状态口径

> 本节所有判定均以 `allowEmptyValue === true` 为前提；关闭时维持现状。

### 4.1 「有值」与「未选择」

统一规则：**`''` 只有在「选项集中存在空值选项」时才算有值**；否则与默认路径一致按未选择处理（外部写入的孤儿值不制造幽灵选中）。

| 组件 | `hasValue`（opt-in 开启） | 未选择 |
|:---|:---|:---|
| `Select` | `model != null && (model !== '' \|\| 存在空值选项)` | `null`（保持现状） |
| `MultiSelect` | `model` 中任一非空值，或 `''` 且存在空值选项 | `[]`（保持现状） |
| `AutoComplete` | 单选 `model !== undefined && (model !== '' \|\| 存在空值选项)`；多选同 `MultiSelect` | 单选 `undefined` / 多选 `[]`（**仅 opt-in 下的新口径**） |

- `AutoComplete` 改用 `undefined` 的理由：单选的模型与自由文本共用字段，`''` 既是「清空」又是「空值项」，无法区分；opt-in 是显式契约变更，把「未选择」收敛到 `undefined` 后语义唯一。opt-in 关闭时保持现状（清除写 `''`）。
- `AutoComplete` 的 `hasValue` 不再以「输入文本是否为空」判定：输入中未提交的自由文本不算有值，只有模型匹配到选项（或非空自由文本已提交）才算，与「模型驱动字段状态」口径一致。
- `AutoComplete` 的派生哨兵必须保留三态，**不得再用真值判断折叠**：
  - `selectedValues`：仅当 `typeof model === 'string'` 或 `Array.isArray(model)` 时取值；`undefined` 产出空数组（现状用 `model.value ? …` 会把 `''` 与 `undefined` 都折成空数组）。
  - `singleValue`：类型改为 `string | undefined`——`undefined` 表示未选择，`''` 表示选中空值项。
  - `comboboxValue`（送往 Reka 的模型）：**直接从 `model` 派生**（`undefined` 保持 `undefined`，`''` 经 `toReka` 变 token），不经 `selectedValues` / `singleValue` 中转。

### 4.2 派生面

| 面 | 口径 |
|:---|:---|
| `data-filled` | 等于 `hasValue`（选中的是空值项时为 `true`），浮标 label 因此保持上浮 |
| 触发器 / 输入框回显 | `Select` / `MultiSelect`：走既有「选中项 label」路径（`#value` 插槽 > `optionLabel`）；空值项缺 label 时渲染空文本，**不回落 placeholder**。`AutoComplete`：选中空值项后把 label 回填输入框，label 为空则输入框留空、由原生 `placeholder` 显示（不回收已上浮的 label） |
| `placeholder` | `Select` / `MultiSelect` 仅在 `hasValue === false` 时显示；`AutoComplete` 由输入文本与 placeholder 属性共同决定（现状语义），本阶段不改 |
| `showClear` | `showClear/clearable && hasValue && !disabled`；`AutoComplete` 由「单值非空」改为「有值」判定；清除写入 `null` / `[]` / `undefined`，**不写 `''`** |
| 清除后焦点 | 沿用现有「清除按钮移除后把焦点交回字段」的路径，不新增分支 |
| 告警 | opt-in 开启时不发 `warnEmptyOptionValue`；关闭时保持 P0 文案 |

### 4.3 交互与过滤

- 空值项参与既有键盘导航、高亮、选中指示与 `#option` 插槽渲染，不特殊化。
- `AutoComplete` 的过滤按 label 进行，空值项与其它项一致（`ignoreFilter` 语义不变）。
- `MultiSelect` 的标签（chip）按 label 渲染；移除空值标签即从数组删去 `''`，与移除其它值同路径。

### 4.4 `AutoComplete` 的模型写入路径（逐条锁定）

opt-in 开启时，以下路径必须与 §4.1 的「未选择 = `undefined`」一致，否则会出现「`data-filled` 为真但字段为空」的幽灵选中：

| 路径 | 现状 | opt-in 口径 |
|:---|:---|:---|
| `onUpdateModel`（Reka 回写） | `undefined` / `null` → `''`；其余按字符串化写回 | 先 `fromReka`（token → `''`）；`undefined` / `null` → `undefined`（单选）或 `[]`（多选） |
| `onClear` | 单选 `''`、多选 `[]` | 单选 `undefined`、多选 `[]`；同时清空输入文本 |
| `commitFreeText` | 三条独立守卫：输入为空 / 等于当前值 / 等于当前值 label | 顺序保留三条守卫：① 输入 `trim()` 为空**直接返回**（空输入不得写入任何值）；② 仅当 `current !== undefined` 时才比较「等于当前值」与「等于该值 label」；③ 未选择时 `labelFor` 不参与判断（入参不得为 `undefined`）。满足任一条即跳过，其余情况写入口文本 |
| `removeValue`（多选） | 按模型值过滤 | 不变（模型值已是 `''`，不涉及 token） |
| `onItemSelect` / `select` 事件 | 按事件值字符串化 | 先 `fromReka` 再字符串化，空值项载荷为 `''` |
| `labelFor(value)` | 以模型值查选项表 | 入参收窄为 `string`；内部先 `toReka` 再查表，且 `undefined` 不进入该函数 |
| `displayValue`（Reka 回显） | 多选返回空串，其它按选项表解析 | 同口径映射：`undefined` / `null` 返回空串，`''` 经 `toReka` 解析出空值项 label |

- 自由文本提交（`strict === false`）仍写入口文本；此时 `hasValue` 为真（非空自由文本），与现状一致。
- **opt-in 下组件写回 `''` 的路径为空**：`onClear` → `undefined`，`onUpdateModel` 的 nullish → `undefined`，自由文本分支已由「空输入直接返回」排除；因此 `''` 只能经「选中空值项」产生。
- `labelFor(value: string)`：查面板值表命中返回 label；未命中回退 `value`（自由文本回显），入参已处于模型域，token 不会进入输入框。
- **M2-2 必查负向单测（本设计的约束载体）**：① 未选择时空输入失焦后模型仍为 `undefined`；② 未选择时输入与空值项 label 相同的自由文本**可以**提交（不被 label 守卫吞掉）；③ 未选择时送往 Reka 的模型为 `undefined` 而非 token。三条任一缺失即视为实现未满足本契约。
- 多选的 `selectedValues` 以模型为准，空值项与普通项并列，caps 渲染不特判。

## 5. 与 `SelectButton` 的差异

- `SelectButton` 基于 ToggleGroup，`''` 一直是合法值，且没有 placeholder / `data-filled` / `showClear` / 选中指示这一套字段语义，不存在「空串 vs 未选择」的歧义，**不引入 `allowEmptyValue`**。
- 文档口径：`SelectButton` 段落不出现该 prop；Select 家族页说明「`Select` / `MultiSelect` / `AutoComplete` 默认丢弃空串，`SelectButton` 不受限」。

## 6. 非目标与边界

- 不做 `emptyValues` 多值形态（D1 ② 未取），只做单一布尔开关。
- 不放宽「模型侧 `''` = 未选择」在默认路径的含义；该语义只在 opt-in 下被替换。
- 不改变 `OptionValue` 类型与 `resolveOptionValue` 的收窄规则。
- 不引入运行时依赖；token 为模块内常量。
- **API 面增量**（M2-2 同批处理）：三个组件各新增 `allowEmptyValue?: boolean`（默认 `false`）；`AutoComplete` 的 `v-model` 增加「未选择 = `undefined`」语义并按 `string | string[] | undefined` 标注类型；`check:api-surface` 基线快照、`types.ts` JSDoc、`option.ts` 的「契约外值」注释同步更新。

## 7. 验收衔接

| 条目 | 本设计提供的输入 |
|:---|:---|
| M2-2 | prop 名与默认值、token 常量与冲突守卫、双向映射与 `name` 处理、`AutoComplete` 写入路径清单、`hasValue` / `data-filled` / `showClear` 口径 |
| M2-3 | 单测矩阵（两种开关下的丢弃 / 放行 / 回显 / 清除、token 冲突、`name` 提交值）、文档改写点（六页 + `design-spec.md` §7 的否定句） |

## 8. Review Gate

**轮次记录（均 `quick`）**：
- R1 Reject：1 blocker（`AutoComplete` 写入路径未定义）/ 4 warning / 3 suggest。
- R2 Reject：同一 blocker 复发（`singleValue` 把 `undefined` 与 `''` 折叠）。
- R3 Reject：同一落点第 3 次复发（`commitFreeText` 改写时丢失「空输入直接返回」守卫）。
- **R4：调用方显式追加一轮预算**（理由：单一设计文档、修复点为守卫顺序与措辞，无实现风险；按 AI 协作规范 §3.5 已将复发 finding 转为 §4.4 的三条必查负向单测，属「转单测约束」处置）。

**结论：Pass**（R4，`quick`，2026-11-19，0 blocker）。
