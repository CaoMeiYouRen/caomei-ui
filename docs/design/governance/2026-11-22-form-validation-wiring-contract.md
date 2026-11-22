# 表单校验接线探针与契约（Phase 41 M1-1）

> 日期：2026-11-22
> 范围：Reka `FormRoot` / `FieldRoot` / `FieldControl` / `FieldError` 与现有 13 个字段组件的直接接线能力；`errors` / `validate` / `validation-mode` 的作用面；`invalid` / `error` 的优先级。
> 状态：探针已执行、语义契约已写定；**用户已于 2026-11-22 裁定取 A 路径**；A 以 §4 列明的四项前提为成立条件，M1-2 按 A 实施（尚未开始）。

## 1. 探针方法与基线

- **落点**：`.temp/field-wiring.probe.test.ts`（一次性探针）。`.temp/` 已 gitignore，且主 `vitest.config.ts` 的 `exclude` 排除了该目录（避免遗留探针混进全量单测）；探针经 `.temp/vitest.probe.config.ts` 单独入口运行，故不入库。
- **结构**：`FormRoot(errors)` → `FieldRoot(name, validate)` → `FieldControl(asChild)` → 字段组件，`FieldError` 同级渲染；字段带 `modelValue` 初值。
- **四个判定维度**：① `aria-invalid` 是否落在可访问控件；② `name` 是否以字段名落到控件；③ `validate` 首参与 `getValues()` 能否读到当前值；④ 提交后焦点是否落到天然可聚焦元素。
- **基线**：原生 `<input>` 作为 `FieldControl` 时，断言「提交被阻止」且「焦点落到该 `input`」；两条断言在探针中为硬断言，探针具备判别力。
- **环境口径**：探针运行在 `happy-dom`。`document.activeElement` 在 happy-dom 下可被设为无 `tabindex` 的容器，因此本记录只区分「天然可聚焦元素」（`input` / `textarea` / `select` / `button` / `[tabindex]`）与其余落点；真实浏览器行为**未验证**（未做 Playwright 取证）。
- **API 口径**：Reka 的 `validate` 返回**错误文案**（`string | string[] | null | undefined | void`），不是布尔；返回 `false` 会被归一化为「无错误」，探针首轮即因此读到「提交未阻止」的假阴性。`validationMode` 取值为 `onSubmit` / `onBlur` / `onChange`（没有 `onTouched`）。

## 2. 探针读数

| 字段 | `aria-invalid` 落点 | `name` | 值读取 | 提交聚焦落点 | 天然可聚焦 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| AutoComplete | 无 | `field` | `undefined` | 包装 `div` | 否 |
| Input | 无 | `field` | `undefined` | `div.caomei-input` | 否 |
| InputNumber | 无 | `field` | `undefined` | `div[role=group]`（组根） | 否 |
| MultiSelect | 无 | `field[0]` | `undefined` | 包装 `div` | 否 |
| Select | `button[role=combobox]` | `field` | `undefined` | `div.caomei-select__field` | 否 |
| TagsInput | 无 | `field[0]` | `undefined` | `div.caomei-tags-input` | 否 |
| Textarea | 无 | `field` | `undefined` | `div.caomei-textarea` | 否 |
| Checkbox | `button[role=checkbox]` | `field` | `undefined` | `div.caomei-checkbox` | 否 |
| CheckboxGroup | `div[role=group]` | `field[0]` | `undefined` | `div[role=group]` | 否 |
| RadioGroup | 无 | `field` | `undefined` | `div[role=radiogroup]`（组根） | 是（`tabindex`） |
| Rating | 无 | `field` | `undefined` | `button[role=radio]` | 是 |
| SelectButton | 无 | `field` | `undefined` | `button`（选项项） | 是 |
| Switch | `button[role=switch]` | `field` | `undefined` | `button[role=switch]` | 是 |

**结论**：

- **值读取 0 / 13**：`FieldControl` 的 `getValue()` 只认原生 `INPUT` / `TEXTAREA` / `SELECT`，13 个字段的根都不是这三者，`validate` 首参全部为 `undefined`；`FormRoot.getValues()` 因此得到 `{ field: undefined }`（键在、值为 `undefined`）。
- **`aria-invalid` 4 / 13** 落到可访问控件（Select / Checkbox / CheckboxGroup / Switch）。这 4 个与其余 9 个在「是否有显式 `:aria-invalid` 绑定」上并不构成分界（Select / Checkbox / CheckboxGroup 同样有绑定，Switch 没有绑定也照样落点），**覆盖是否生效的原因本轮未逐字段取证**；若机制选 B，需先补这份清单。
- **`name` 10 / 13** 以字段名落点；MultiSelect / TagsInput / CheckboxGroup 落成 `field[0]`（数组型隐藏输入命名），按 `name` 精确匹配会失配。
- **提交阻止 13 / 13**（探针逐字段记录 `defaultPrevented`）；它只证明「有常量错误时阻止提交」，不证明值级校验可用。
- **提交聚焦 4 / 13** 落到天然可聚焦元素（RadioGroup 的 `div[role=radiogroup]` 带 `tabindex`、Rating 的 `button[role=radio]`、SelectButton 的选项 `button`、Switch 的 `button[role=switch]`）；其余 9 个落到包装层或不可聚焦的 `div[role=group]`，浏览器中 `focus()` 通常无效。
- `aria-describedby` 13 / 13 可解析到错误行；Select / Checkbox 出现同一 id 被写两次（`reka-v-3 reka-v-3`）。

**直连判定**：四个维度全过的字段为 **0 / 13**；`Switch` 是唯一满足三项（`aria-invalid` / `name` / 聚焦）的字段，缺值读取。`FieldError` 的渲染与 `aria-describedby` 注册本身可用，与 `FieldControl` 的落点问题相互独立。

## 3. 语义契约（M1-2 起唯一口径）

### 3.1 `errors` 的作用面

- `CaomeiForm` 承接 `errors?: Record<string, string | string[]>`：服务端或提交回填错误，键为字段 `name`；仅当 `FormItem` 的 `name` 非空且与键完全一致时参与该字段。
- `undefined` / `''` / `[]` 视为无错误；显式移除键即撤下该字段错误。
- 字段值变更即清除该字段的服务端错误，直到服务端重新下发（与 Reka 的 `clearedServerError` 时序一致）——不是「本地校验通过后服务端错误重新出现」。
- 非目标：不做异步校验请求管理，不做 `rules` DSL。

### 3.2 `validate` 的作用面

- `CaomeiFormItem` 承接 `validate?: (value, values) => string | string[] | null | undefined | void`（可返回 Promise）。
- 返回文案即失败、空即通过；不提供布尔约定，与 Reka 同口径。
- `value` 为该字段当前值，`values` 为表单级值集（键为字段 `name`）。**值通道是 M1-2 的实现前提**：探针证明 Reka 的 `FieldControl` 读不到这 13 个字段的值，因此值必须由 `FormItem` 侧承接（见 §4 选项 A 的 `modelValue` 通道）。
- 值集口径：未声明 `name` 的字段不进入 `values`；已声明但取不到值的字段按 Reka 同口径保留键、值为 `undefined`（消费方需自行判空，契约不额外过滤）。

### 3.3 `validation-mode` 的作用面

- 取值 `onSubmit`（默认）/ `onBlur` / `onChange`，与 Reka 同名同义；`Form` 级为默认值，`FormItem` 级可覆盖。
- `onSubmit`：首次提交前不展示校验错误；提交过一次后转为「变更即复检」。
- `onChange` / `onBlur`：分别以字段值变更 / 失焦为触发点，首次输入即可报错。
- 非目标：不做 `onTouched`（Reka 未提供）。

### 3.4 `invalid` / `error` 的优先级

单字段按以下顺序判定，先命中先返回：

1. 受控 `error` 非空 → 展示 `error` 文案，`invalid = true`（既有受控通道，不回归）
2. 本地 `validate` 未通过 → 展示其文案，`invalid = true`
3. `errors[name]` 非空 → 展示其文案，`invalid = true`
4. 显式 `invalid = true` 且无文案 → 标红、不渲染错误行
5. 其余 → 通过态

理由：显式 `error` 代表使用方最新的判断，优先级最高；本地校验比服务端快照更接近当前值，故高于 `errors`。`required` 仍只渲染可见星号，不注入控件语义。

## 4. M1-2 实现机制（登记 fallback 已触发，等待用户裁定）

**判定**：登记记录 §2 的 M1-1 验收写有「探针失败则降级为『只设计』并留痕」；本记录把「探针失败」定义为「直连不可用」。四维全过 **0 / 13** 即直连不可用，故**该 fallback 在本轮已触发**——C（降级为只设计、M1 缩为 1 条）是登记口径下的默认走势，A / B 属于对该默认的**反向授权**。

**执行侧不自行收缩条目数**：把 M1 由 4 条改为 1 条会让阶段总数由 15 降为 12，属跨载体范围变更（`todo.md` 进度表 / 条目表、`roadmap.md` 阶段行、治理索引摘要、`check:stage-counts` 与 `check:stage-progress` 的计数），须用户确认后同步。裁定前条目表维持 15 条，M1-1 按「探针与契约」交付，M1-2 ~ M1-4 不推进。

| 路径 | 含义 | 影响与前提 |
| :--- | :--- | :--- |
| **C（登记默认）** | 确认 fallback：M1 缩为 1 条，本记录即全部交付物，M1-2 ~ M1-4 移出阶段 | 阶段条目按 12 条同步五处载体与计数守卫；下游手写校验维持现状；`FieldControl` 接线能力记为「已评估、不采用」 |
| **A（反向授权）** | `FormItem` 新增可选且只读（不 emit `update:modelValue`）的 `modelValue` 值通道 + 内部注册向 `Form` 汇总 `values`；`FormRoot` 只承接 `errors`；校验态自持（`watch` 值变更 + 包装层 `focusout` 委托 + 提交时按显式选择器解析首个可聚焦控件）；错误行沿用现有 `role="alert"` 渲染 | 不改 13 个字段契约、不扩现有插槽作用域；需同时批准：新增公共 prop、`values` 的注册装配、把 M1-2 口径里的「由 `FieldError` 渲染」替换为等价自有渲染、以及「未传 `modelValue` 时」改为**开发期告警**而非静默跳过 |
| **B（反向授权）** | 扩展 13 个字段契约，暴露内部控件锚点（`controlRef` 或 `data-caomei-control`），再直连 `FieldControl`，同时解决值读取与聚焦落点 | 触及「不替换 13 个字段既有契约」的阶段非目标；`aria-invalid` 需按「消费 field 上下文 / 根元素自身可访问 / 显式绑定覆盖」三类分别改，文件面与回归面显著超出单条阈值 |

**用户裁定（2026-11-22）：取 A。** 用户原话为「M1 后续路径：A」，未逐项表态；按 A 行的定义，A 以四项前提为成立条件，本裁定视为随 A 一并成立——① `FormItem` 新增可选且只读（不 emit `update:modelValue`）的 `modelValue` 值通道；② 内部注册向 `Form` 汇总 `values`；③ 把 M1-2 口径中的「由 `FieldError` 渲染」替换为等价自有渲染（同一 `role="alert"` 语义）；④ 未传 `modelValue` 时改为开发期告警而非静默跳过。任一项在 M1-2 落地中需变更时，回到用户确认。C 不再作为默认走势，B 不采用；阶段条目数维持 15 条。

## 5. Review Gate

- **R1（2026-11-22，`standard`，时间盒 ≤10 分钟）**：**Reject**（3 blocker / 5 warning / 3 suggest）。blocker：① 探针缺「值读取」维度，§2 / §3.2 的「校验链路可用」属超范围结论，且 `getValues()` 的 `undefined` 键与契约冲突；② 提交聚焦读数与表格不自洽（「7 个不可聚焦」实为 10 个：7 包装层 + 3 个 role 容器），且把 happy-dom 行为写成浏览器事实；③ `todo.md` 预写 `R1 Pass`、记录 §5 无结论。修复：补值读取维度并重跑探针（值读取 0 / 13，`validate` 首参全为 `undefined`）；聚焦改按「天然可聚焦」判定（4 / 13），标注 happy-dom 口径与「真实浏览器未验证」；`values` 口径改为与 Reka 一致（保留 `undefined` 键）；`errors` 清空时序改为「值变更即清除」；§4 改写 A 的值通道与口径替换代价。warning 处置：§4 明确 A 需用户批准 `FieldError` 渲染替换、B 的实施清单区分两类字段、C 的「探针失败」定义写入选项；`.session` 在收尾同步；探针基线补硬断言。
- **R2（2026-11-22，`standard` delta，时间盒 ≤10 分钟）**：**Reject**（1 blocker / 5 warning / 3 suggest）。blocker RG-B01：登记 §2 的 fallback 按本记录自己的定义（直连不可用）已触发，但 §4 仍把 C 写成「待批准选项」并推荐 A，形成「默认项需批准、偏离项被推荐」的倒置，且 15 / 12 两种条目数无法同批成立。修复：§4 改为「fallback 已触发 → C 为登记默认；A / B 为反向授权」，执行侧不自行收缩条目数、裁定前维持 15 条；A 行补 `values` 装配方式与「未传值改开发期告警」；§2 补 `defaultPrevented` 逐字段读数并把 `role=radiogroup` 从不可聚焦容器清单移除；§2 的 `aria-invalid` 成因改为「成因不统一、逐字段合并路径未取证」；§5 去掉占位指针。warning 处置：`todo.md` 的审计列随 R3 结论回填，`.session` 在收尾同步。
- **R3（2026-11-22，`standard` delta，时间盒 ≤10 分钟）**：**Pass**（0 blocker / 2 warning / 4 suggest）。RG-B01 关闭：§2 / §4 / §5、索引摘要与 `todo.md` 指针统一为「登记 fallback 已触发 → C 为默认；A / B 为反向授权；裁定前维持 15 条」；W01 ~ W04、S01 ~ S03 逐条关闭。warning：① §2 对 `aria-invalid` 落点的归因与「同形态绑定却落点成功」的字段并存；② 「逐字段断言」与探针实现不符（用例只断言读数结构与类型）。修复：① 改为纯读数 + 「覆盖是否生效未逐字段取证」；② 改为「逐字段记录」。suggest 一并处置：§6 改动分类与 §4 统一为三类、§6 措辞改为「未落到可访问控件」、记录头状态行补 fallback 口径。**用时**：启动 `18:22:08`，返回后下一次宿主记录为 `18:31:40`（其间含本轮修复编辑），实测上限约 9 分 32 秒，未超盒。

## 6. 边界与后续

- 本记录只覆盖「接线能力」与「语义契约」；具体实现、文档与回归在 M1-2 ~ M1-4（机制裁定后）。
- 探针为一次性用途，未入库；如需回归，应把「值读取为 `undefined`」「聚焦落点非天然聚焦元素」两类结论固化为契约测试，而不是复活探针脚本。
- 9 个字段的 `aria-invalid` 未落到可访问控件，属既有实现选择，本次不改；B 未被采用，该清单不需补（若后续重启 B 再按三类分别列出）。
- 真实浏览器聚焦行为未取证。机制已于 2026-11-22 裁定为 A，应在 M1-4 的定向 E2E 中补一条「提交聚焦首个无效字段」的真实浏览器断言。
