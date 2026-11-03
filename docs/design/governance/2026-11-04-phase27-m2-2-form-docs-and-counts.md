# Phase 27 M2-2 Form 文档、示例与计数回扫交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 M2-2；[M2-1 交付记录](./2026-11-04-phase27-m2-1-form-composition.md) §7。
> 定位：`Form` 组合层的文档、示例、E2E、画廊 / 组件总览 / 冻结面与 API 基线收口。
> 规模说明：本批约 30 文件 / +900 行，超过[规划规范 §5](../../standards/planning.md#_5-任务粒度约束)的 10 文件 / 800 行建议值；拆分会令计数 / capture / 视觉基线 / 守卫进入中间失败态，故按同一次收口执行。

## 1. 交付范围

- **中英组件页**：`docs/components/form.md` / `docs/i18n/en-US/components/form.md`——基础用法、5 键插槽作用域、12 字段三类继承面绑定、校验与错误、提交编排、必填与标签取舍、与 `FloatLabel` 的关系、API（`ComponentApi` + `FormItem` 手写属性表）、PrimeVue 迁移。
- **示例**：`docs/examples/form/{basic,validation}.vue` 与英文对应；`basic.vue` 同时作为画廊预览。
- **侧栏 / 总览 / 设计载体**：`docs/.vitepress/config.ts` 中英「表单输入」组新增 Form（FormItem 作为组合子部件随 Form 页登记，不单列页面）；`docs/components/index.md` 中英总览新增 Form 条目；`docs/design/documentation-site.md` §11 表单输入组新增 Form；`docs/design/components.md` §1 复合层示例与 §5 新增 `Form / FormItem` 行；`check-design-catalog` 的子部件允许名单登记 `FormItem`（与 `RadioButton` 同口径）。
- **画廊**：`docs/.vitepress/showcase-registry.json` 新增 Form（`form/basic.vue`），15 → 16 项。
- **E2E**：`test/e2e/form.e2e.ts`（空名称提交错误态 / 补全名称提交 / 组型与 Switch 的 aria 接线）；`test/e2e/fixtures/app.vue` 新增 `#form` section，并进入 `responsive.e2e.ts` 的 section 清单（`MIN_SECTIONS` 20 → 21）。
- **计算样式与视觉基线**：`test/capture/fixture/app.vue` 新增 Form 默认 / 错误两态；`capture.mjs` 新增 7 条采样（root / item / label / required / hint / error / invalid-label），367 → 374 项；`test/visual/components.visual.ts` 新增 `form` 面，32 → 34 张基线。
- **冻结面 / API 计数**：`version-policy` 中英包根导出名 324 → 330；冻结面终审记录 §2.3 追加 2026-11-04 增量注记。

## 2. 文档与示例

| 载体 | 变更 |
| :--- | :--- |
| 中文组件页 | 9 个源 H2（API 由 `ComponentApi` 渲染在页尾），覆盖 5 键插槽、12 字段、校验、提交、必填 / 标签取舍、FloatLabel 关系与迁移 |
| 英文组件页 | 与中文同 H2 / H3 数，`docs:check:i18n-parity` 通过 |
| 示例 | 中英各 `basic.vue` + `validation.vue`；画廊使用 `form/basic.vue` |
| 总览 / 侧栏 / §11 | 中英总览、中英侧栏、§11 表单输入组均新增 Form；FormItem 作为子部件不单列页面 |
| 设计清单 | §5 `Form / FormItem` 行 + 子部件允许名单 `FormItem`（`check-design-catalog` 27 行 / 56 成员） |

## 3. 计数与冻结面回扫

| 项 | 当前值 | 说明 |
| :--- | :--- | :--- |
| 组件目录 | **57** | 1.0 的 56 + `form/` |
| 根导出组件名 | **96** | 94 + `CaomeiForm` / `CaomeiFormItem` |
| 包根导出名 | **330** | 324 + 2 组件 + 4 类型（`FormProps` / `FormItemProps` / `FormItemSlotProps` / `FormExposed`）；`Caomei*` 100 / `use*`·`provide*` 7 / 其余 223 |
| API 面 | props **517** / events **86** / slots **71** / exposed **18** | 1.0 为 516 / 85 / 70 / 16 |
| `exports` | **13** | 不变 |
| token 有效冻结面 | **381** | 未新增公开 token；`--caomei-form-*` 为未披露的组件级覆盖钩子，不进入冻结面 |
| locale | 10 语 / 每语 28 命名空间 / 80 键 | Form 无新增文案键 |
| 画廊登记 | **16 项 / 7 分组** | 15 → 16（新增 Form） |
| §11 登记成员 | **56** | 55 → 56（Form；FormItem 为组合子部件） |

**API 差分（相对 npm 1.0.0）**：`pnpm check:api-surface --baseline=<1.0.0 解包 dist> --current=dist` → **exit 0**；基线 199 个声明文件 / 328 个导出 → 当前 202 / 334；新增 3 个文件（`form.vue.d.ts` / `form-item.vue.d.ts` / `types.d.ts`）与 6 个导出（`CaomeiForm` / `CaomeiFormItem` / 4 个类型）；**0 删除 / 0 重命名**；10 个内容变化文件均为属性 / import 顺序（`button` 等既有组件的声明成员顺序、`index.d.ts` 的 import 编号），人工复核**无 required 收紧、无类型改变**。

## 4. 验证证据

- `pnpm docs:check` → **exit 0**（含 `check-docs-structure` 56 成员、`check-components-overview`、`check-showcase-registry` 16 项、`check-i18n-parity` 新页配对、`check-example-refs` 407 md / 420 引用 / 399 示例文件）。
- `pnpm governance:check` → **exit 0**（含 `check-design-catalog` 27 行 / 56 成员、`check-locale-ledger` 28 命名空间、`check:planning-numbers`、`check:governance-counts`）。
- `pnpm exec playwright test test/e2e/form.e2e.ts` → **9 passed**（3 例 × 3 个全量档）。
- `pnpm test:e2e` → **463 passed / 4 skipped**（含 `#form` 进入 responsive §4 受检面，`MIN_SECTIONS = 21`）。
- `pnpm test:visual` → **37 passed**（34 张基线，新增 `form-light` / `form-dark`；既有 32 张 0 差异）。
- `pnpm capture:styles` → **0 差异（374 项）**；冻结前 7 条差异全部为新增键，既有键 0 变化。
- `pnpm test` → **146 文件 / 2871 passed**；`pnpm test:a11y` → **68 passed**。
- `pnpm verify` → **exit 0**（含 `docs:build`、`ref-attr-guard` 触发的 capture:styles）。
- **首跑 flaky（测试规范 §6.1）**：一次 `pnpm test` 首跑 1 例失败、未捕获文件名；随后 `pnpm test` 全绿、全量 E2E 与 `pnpm verify` 均通过，判为并行负载偶发，与本批无因果。
- **判别力**：`#form` 已加入视觉常驻负向对照（`NEGATIVE_CONTROL_CSS` 第五条）；`VISUAL_NEGATIVE_CONTROL=1 pnpm test:visual` → **34 failed / 3 passed**。

## 5. Review Gate

- **audit-depth**：`standard`（中英文档 / 示例 / E2E / 双基线 / 计数与 API 差分；时间盒 ≤ 10 分钟）。
- **R1（`standard`）：`Reject`**（1 blocker / 3 warning / 4 suggest）。
  - **RG-B1 API 段重复标题且不在页尾** → 删除手写 `## API`，`## FormItem 属性` 前移，`## 从 PrimeVue 迁移` 之后仅保留 `<ComponentApi name="form" />`；重建产物确认中英页各只有 1 个 API H2 且在最后。
  - **W1 基础用法片段 `v-model` 绑定插槽 `name`** → 改为 `{id, name: fieldName, invalid, ...aria}` + `v-model="formName"` + `:name="fieldName"`，与真实示例一致。
  - **W2 `FormExposed.form` 命名说明缺失** → 提交编排节补只读语义、`form` 而非 `formRef` 的取舍、不承诺响应式更新（中英）。
  - **W3 `check-example-refs` 读数陈旧** → 改为当前实跑 407 md / 420 引用 / 399 示例文件。
  - **S1 ~ S4 已采纳**：补批次规模拆分依据；E2E `aria-describedby` 分别校验 hint 与 error；冻结面 §2.1 增时点指针；必填示例补单 `Checkbox`。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 0 必须处理 suggest）。R1 的 1 blocker / 3 warning / 4 suggest 全部关闭；定向 E2E 9 passed、structure / parity / example-refs 通过。
- **复查基线**：HEAD `b5496ef` + 当前工作区。

## 6. 未覆盖边界

- `Form` 不内建 rules 引擎；`required` 仅视觉，控件语义由使用方绑定（组件页已写明）。
- 无 SSR 水合断言；多 app `idPrefix` 仅在 JSDoc 提示，未实测。
- `Form` 不支持原生 `action` / `method` 提交（设计取舍，组件页已写明）。
- 品牌预设 / 非默认 `--caomei-hit-target-min` 等与 Form 无关的既有限制不在本批。
- 1.1.0 尚未发布；文档中「1.1.0」为随发布兑现的前瞻口径（M5-1 统一收口）。
