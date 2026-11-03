# Phase 27 M2-1 `CaomeiForm` / `CaomeiFormItem` 交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 M2-1；[Form 形态与字段契约影响评估](./2026-10-24-phase26-m1-2-form-field-contract-evaluation.md) §1 / §2.4 / §3 / §4。
> 定位：`Form` 组合层的实现与单测；文档、示例、计数回扫与 E2E 由 M2-2 承接。

## 1. 交付范围

- **`CaomeiForm`**：原生 `<form>` 根，负责纵向布局与提交编排；`submit` 恒 `preventDefault()` 后 emit（使用方接管）；`novalidate` 映射原生属性；暴露 `form` / `submit()`（后者走 `requestSubmit()`，复用原生校验与同一事件链）。
- **`CaomeiFormItem`**：渲染可见标签、必填标记、hint 与 `role="alert"` 错误行；通过默认插槽作用域提供 **5 个键**——`id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`。`error` 非空自动视为 invalid；`aria-describedby` 只包含实际渲染的 hint / error id。
- **注册面**：`src/components/form/`（2 个 SFC + types + index）、`src/index.ts` 根导出、`src/nuxt/components.ts` 自动导入清单、`test/a11y/fixtures.ts`（`CaomeiForm` 夹具 + `CaomeiFormItem` 组合登记，预算 60 → 61）、`playground/app.vue` 手工演示。
- **契约边界**：未改 `FieldStateProps` / `FieldProps` / `FieldIdentityProps`；无 rules 引擎；无 provide/inject 自动注入；未新增 locale 键。

## 2. API 形态与取舍

| 项 | 决策 |
| :--- | :--- |
| 提交 | `submit` 事件始终 `preventDefault()`；原生 `action` / `method` 不跳转，JSDoc 已显式声明 |
| `novalidate` | 透传原生属性；缺省不输出 |
| 实例暴露 | `form`（根元素，经 expose proxy 解包）+ `submit()`（原生 `requestSubmit()`） |
| id 策略 | `useId()` 生成实例 id，SSR 与客户端一致；显式 `id` 优先；同页多 app 建议 `app.config.idPrefix`（JSDoc 已提示） |
| 标签关联 | 统一 `<span id>` + `aria-labelledby`，不渲染 `<label for>`：组型控件（`role=group` / `radiogroup`）的根不可 labelable，统一方案避免无效 `for`；代价是标签点击不聚焦，需要该行为时用 `FloatLabel` 或消费方自绘 `<label for>`（M2-2 文档说明） |
| `required` | **仅视觉**星号（`aria-hidden`），不向控件注入 `required` / `aria-required`；控件语义由使用方按字段族绑定（M2-2 文档说明） |
| 错误态 | `invalid` 或非空 `error` 任一成立即 invalid；错误行 `role="alert"` |
| `FormExposed.form` | 保留语义命名（不是 `formRef`），交付记录与 M2-2 文档说明；运行时为根 `<form>` 元素 |

## 3. 12 字段逐项绑定

测试用 `CaomeiFormItem` 的插槽作用域绑定每个字段组件，断言 `id` 存在、`aria-labelledby` 解析到「字段*」、`aria-describedby` 解析到 `[提示, 错误]` 两段文本、`aria-invalid` 与可访问控件同一元素。

| 继承面 | 组件 | id 落点 | aria / invalid 落点 |
| :--- | :--- | :--- | :--- |
| `FieldProps` + 身份（7） | AutoComplete / Input / InputNumber / MultiSelect / Select / TagsInput / Textarea | 内层控件或字段根（InputNumber / TagsInput 为根） | 内层可访问控件 / 触发器 |
| `FieldStateProps` + 身份（4） | Checkbox / CheckboxGroup / RadioGroup / SelectButton | 控件根 / 组根 | 控件根 / 组根（组型用 `aria-labelledby`） |
| 仅身份（1） | Switch | `SwitchRoot` | `SwitchRoot`；**无 `aria-invalid`**（无校验状态通道） |

## 4. 验证证据

- `pnpm exec vitest run src/components/form/form.test.ts` → **15 passed**（含 `submit()` 真实 `requestSubmit` 链路；SSR `renderToString` 无 `console.warn` / `console.error`）。
- `pnpm test` → **146 文件 / 2871 passed**。
- `pnpm test:a11y` → **68 passed**（`A11Y_FIXTURE_BUDGET = 61`）。
- `pnpm verify` → **exit 0**（含 `docs:build`、`ref-attr-guard` 触发的 `capture:styles` 367 项 0 差异）。
- **首跑 flaky（按测试规范 §6.1 登记）**：`pnpm verify` 首跑 `pnpm test` 段 1 例失败、未捕获文件名；随后 `pnpm test` 连续两次全绿、`pnpm verify` 复跑 exit 0，判为并行负载偶发，与本批改动无因果。
- **真实浏览器（playground，1440 亮 / 暗 + 390 / 834 / 1440）**：23 / 23 项通过——4 个 FormItem、Input / Select / CheckboxGroup / Switch 的 `aria-labelledby` 与 `aria-describedby` 解析、空名称提交后 `aria-invalid` + 双 id describedby + `role=alert`、补全后错误消失、Switch 无 `aria-invalid`、三档无横向溢出、移动端 4 项纵向堆叠、console / pageerror 0。截图与原始读数在 `test-results/m2-1/`（gitignored）。
- `pnpm lint:check` / `pnpm typecheck` / `stylelint src/components/form/*.vue` → exit 0。

## 5. Review Gate

- **audit-depth**：`standard`（新增 2 个公开组件 + 12 字段绑定测试 + a11y 夹具 + playground；时间盒 ≤ 10 分钟）。
- **R1（`standard`）：`Pass`**（0 blocker / 3 warning / 6 suggest）。
  - **W1 `required` 仅视觉、对 AT 不可感知** → `types.ts` JSDoc 明确「不注入 `required` / `aria-required`」；M2-2 组件文档须写清使用方绑定方式（本记录 §7 收口项）。
  - **W2 12 字段断言停在「属性存在」层** → 改为按 id 解析 label / hint / error 文本，`aria-describedby` 拆分两段文本，`aria-invalid` 与 `aria-labelledby` 同一可访问控件。
  - **W3 `FormProps` JSDoc 与恒 `preventDefault()` 冲突** → 明确原生 attrs 透传但 `action` / `method` 不生效。
  - **S1 新组件未进 capture / 视觉基线** → M2-2 收口（本记录 §7）。
  - **S2 多 app `useId` 撞 id** → `FormItemProps.id` JSDoc 提示 `app.config.idPrefix`。
  - **S3 `<span>` 标签不可点击聚焦** → 本记录 §2 登记取舍；M2-2 文档说明替代方案。
  - **S4 mock 未恢复 / 提交链路弱** → `afterEach` 加 `vi.restoreAllMocks()`；新增 `requestSubmit` 真实链路用例。
  - **S5 fixture 顺序** → `CaomeiFormItem` 移到 `COVERED_BY_FIXTURE` 表首。
  - **S6 测试名 / 暴露命名** → 布局用例改名「渲染插槽内容」；`FormExposed.form` 保留并在本记录说明。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 2 suggest）。R1 的 W1 ~ W3、S4 ~ S6 全部关闭；S1 / S3 按声明留 M2-2 / 本记录。R2 的 2 条 Suggest（id / describedby 落点同一性、accessible name 计算）为可选加固，未采纳（12 字段当前实际落点已由强化断言覆盖，且 TagsInput / InputNumber 的 id 与 aria 落点本就分属根 / 内层控件）。
- **复查基线**：HEAD `a195abe` + 当前工作区。

## 6. 未覆盖边界

- 文档 / 示例 / 组件页 / 侧栏 / 组件总览 / locale 台账 / 冻结面与 API 基线计数、E2E、capture / 视觉基线均属 **M2-2**；本批未新增文档承诺。
- 无 rules 引擎、无 provide/inject 自动注入（评估 §3 的 B 方案后置）。
- 未做 SSR **水合**断言（仅 `renderToString` 无警告）；多 app / `idPrefix` 未实测。
- `Form` 不支持原生 `action` / `method` 提交（设计取舍，JSDoc 已声明）。
- 新组件未进入 `capture:styles` / `test:visual` 受检面；`capture:styles` 367 项 0 差异只证明既有面未漂移。

## 7. M2-2 收口项

> 2026-11-04 已由 [M2-2 交付记录](./2026-11-04-phase27-m2-2-form-docs-and-counts.md) 收口（组件页 / 示例 / E2E / capture / 视觉基线 / 计数与 API 差分）。

- 组件页中英：`required` 仅视觉、控件语义由使用方绑定；`<span id>` + `aria-labelledby` 的取舍与 `FloatLabel` / 自绘 `<label for>` 替代方案；`FormExposed.form` 命名说明。
- 把 `CaomeiForm` / `CaomeiFormItem` 纳入 `capture:styles` 夹具与 `test:visual` 基线，补负向对照；重冻结只应新增键 / 新面。
- 中英组件页 / 示例 / E2E（布局 + 提交 + 错误态）/ 组件总览 / 画廊 / locale 台账 / 冻结面与 API 基线计数回扫。
