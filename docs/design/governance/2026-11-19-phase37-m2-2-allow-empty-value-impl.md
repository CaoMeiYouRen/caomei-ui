# Phase 37 M2-2 交付记录：`allowEmptyValue` 实现

> 创建时间：2026-11-19
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M2-2；契约以 [M2-1 设计记录](./2026-11-19-phase37-m2-1-allow-empty-value-design.md) 为准。本记录只承载实现机制与验证证据。

## 1. 实现

- **公共 prop**：`Select` / `MultiSelect` / `AutoComplete` 新增 `allowEmptyValue?: boolean`（默认 `false`），JSDoc 中英同步；`SelectButton` 不提供。
- **内部 token**：`_shared/option.ts` 新增 `EMPTY_OPTION_TOKEN`（`__caomei_empty_value__`，内部导出）与 `fromPanelValue` / `isReservedEmptyToken`；开启后再把 `''` 换成 token 送往 Reka，回写时还原。
- **选项归一化**：三组件在归一化阶段按开关分流——关闭时空串项告警并丢弃（P0 行为不变），开启时保留并给出去向面板的 `panelValue`；值恰好等于保留 token 的非空项在开启时丢弃并告警。
- **模型映射**：送往 Reka 的模型统一由 `panelModel` / `comboboxValue` 派生；回写经 `onModelUpdate` 还原 token，且**仅在开启 `allowEmptyValue` 时还原**——关闭时与该 token 同名的字符串是用户普通值，不得被改写。`AutoComplete` 的 `selectedValues` / `singleValue` 改为类型判断保留三态（`undefined` 未选择、`''` 选中空值项），`comboboxValue` 直接从模型派生。
- **状态口径**：`hasValue` 统一为「`''` 仅在存在空值选项时计为有值」；`data-filled`、`showClear` 跟随 `hasValue`；清除写入 `null` / `[]` / `undefined`（`AutoComplete` 单选在开启时写 `undefined`）。
- **`AutoComplete` 写回路径**：`onClear`、`onUpdateModel`、`commitFreeText`（空输入直接返回；label 守卫仅在已有选中值时生效）、`onItemSelect`（事件载荷先还原 token）均按 M2-1 §4.4 实现。
- **表单值**：开启时 `name` 不再交给 Reka 根，改由组件自持隐藏输入（单值固定一个、多值逐项）承载模型值并继承 `disabled`，避免 token 外泄；关闭时保持 Reka 原生控件。
- **已知限制**：开启后 `MultiSelect` 的 `required` 由原生隐藏输入承载时不参与约束校验，组件在 `allowEmptyValue && required && name` 时输出开发期提示，要求提交前自行校验（M2-3 文档同步）。
- **API 面**：`allowEmptyValue` 为新增可选 prop，`AutoComplete` 的 `v-model` 类型标注为 `string | string[] | undefined`；`check:api-surface` 为发布期与既有版本产物比较（新增非 breaking），本仓无基线文件需提交。

## 2. 验证

- 定向单测：`pnpm vitest run src/components/select src/components/multi-select src/components/auto-complete src/components/_shared/option.test.ts src/components/float-label` → 全绿（既有用例期望值未改动）。
- 必查负向单测（M2-1 §4.4 的约束载体，已落地于 `auto-complete.test.ts`）：未选择时空输入失焦不写模型；未选择时可提交与空值项 label 相同的自由文本；未选择时送往 Reka 的模型为 `undefined` 而非 token。
- 行为探针（临时用例，已删除）：开启后三组件均渲染两个选项（含空值项）；`Select` 选中空值项回写 `''`、`MultiSelect` 回写 `['']`、`AutoComplete` 选中回写 `''` 且清除回写 `undefined`；默认关闭时 `Select` 面板只渲染一个选项。
- 静态检查：`pnpm typecheck` 通过；改动文件 `eslint --max-warnings 0` 通过。
- 全量单测：`pnpm test` → 全绿。

## 3. 浏览器验证（V）

一次性 Vite 页面（`.temp/`，验证后已删除）+ Playwright Chromium，1280×800，覆盖 `Select` / `MultiSelect` 的开启态：

- `Select` 选中空值项后触发器显示 label「全部」，浮标 `data-filled` 存在（label 保持上浮），隐藏输入提交值为空串；
- 清除后模型为 `null`（不是 `''`）；
- `MultiSelect` 选中空值项后模型为 `[""]`；
- 页面无 `pageerror`。

未纳入本次浏览器验证：`AutoComplete` 的开启态渲染、以及三组件关闭态零变化（后者由既有单测与新增的保留值用例覆盖）。

## 4. 边界

- 自由文本（`AutoComplete` 非严格模式）语义不变：非空文本仍直接写入模型；空输入不再有任何写入路径。
- 多选标签、过滤、键盘导航沿用既有路径，空值项不特殊化。
- `SelectButton` 不参与本开关，其 `''` 一直是普通值。
- **M2-3 承接**：`MultiSelect` / `AutoComplete` 的 opt-in 单测（回显、清除、隐藏输入、token 不泄漏）与中英文档改写。

## 5. Review Gate

**轮次记录**：R1 `standard` Reject（3 blocker / 7 warning / 4 suggest，2026-11-19）。

- B01 回写无条件还原 token → 已按开关收窄（三组件）。
- B02 空值项缺 label 回落 placeholder → 已加 `hasValue && allowEmptyValue` 分支渲染空文本。
- B03 三条必查负向单测缺失 → 已补入 `auto-complete.test.ts`。
- W01 隐藏输入继承 `disabled`；W03 单值固定渲染一个隐藏输入；W04 `AutoCompleteOption.value` JSDoc；W05 placeholder 改用 `hasValue`；W06 索引行内代码——均已修。
- W02 `required` 在 opt-in 下失效 → 已加开发期提示与已知限制登记。
- R2 `standard` **Pass**（0 blocker）。R2 追加：Select 隐藏输入补 `disabled` 并加提交断言；补「关闭态与 token 同名的值原样保留」用例；§3 浏览器验证已完成。

**结论：Pass**（R2，2026-11-19）。
