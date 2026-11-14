# Phase 33 M3-2：Select 选项 `null` / `undefined` 开发期告警

> 创建时间：2026-11-14
> 触发：用户「继续推进剩余条目」。范围与验收口径见 [Phase 33 登记批次](./2026-11-13-phase33-registration.md) §2 的 M3-2 行。

## 1. 变更

| 项 | 内容 |
|:---|:---|
| `src/components/select/select.vue` | 新增 `warnUnresolvedOption()`：当选项 `value` 解析为 `null` / `undefined` 时调用 `warnDev`；扁平与分组两条归一化路径各调用一次；**解析结果、丢弃行为与渲染不变** |
| `src/components/_shared/option.ts` | 抽出 `narrowOptionValue()`（字符串 / 数字收窄），`resolveOptionValue()` 与 Select 共用；附单测 |
| 单测 | `select.test.ts` 新增两例：开发期告警且渲染结果不变、生产环境静默且渲染不变 |
| 文档 | `docs/components/select.md` / en-US 同段补开发期提示 |

## 2. 行为口径

- 只对**解析为 `null` / `undefined`** 的选项告警；布尔 / 对象等其它契约外取值维持静默丢弃（登记范围仅 `null` / `undefined`）。
- `warnDev` 以 `globalThis.process?.env?.NODE_ENV === 'production'` 判定：Node / 定义了 `process` 的生产环境静默；浏览器产物在未定义 `process` 时仍会输出（与 `dev-warn` 的既有口径一致）。
- 告警使用**源数组序号**（扁平路径）与**组内序号**（分组路径），且每个选项只调用一次字段访问器（原始值与收窄共用一次读取）；收窄逻辑集中在 `_shared/option.ts` 的 `narrowOptionValue()`，与 `resolveOptionValue()` 同源。
- 归一化只依赖 `options` / `optionLabel` / `optionValue`（`selected` 已改为模板内按模型派生），选择变化不会触发重算，不会重复告警。

## 3. 验证

| 项 | 命令 | 结果 |
|:---|:---|:---|
| Select 单测 | `pnpm exec vitest run src/components/select/select.test.ts` | **46 passed**（新增 3 例：扁平序号、分组序号、生产静默；含「选择变化不重复告警」断言） |
| 共享工具单测 | `pnpm exec vitest run src/components/_shared/option.test.ts` | 通过（新增 `narrowOptionValue` 用例） |
| 静态检查 | `pnpm exec eslint src/components/select/select.vue src/components/select/select.test.ts` | 零 error / warning |
| 类型检查 | `pnpm typecheck` | exit 0 |
| 文档 | `pnpm exec lint-md`（两页） | 通过 |

## 4. 边界

1. 不新增公共 prop / 事件 / 类型导出；仅开发期控制台输出。
2. 不改变既有「契约外取值不渲染」契约（既有 `optionValue 解析出契约外取值（如 null）的选项不渲染` 用例仍通过）。
3. 告警文案为中文（与库内其它 `warnDev` 一致），不参与 i18n。
4. 不做告警去重 / 限流；如后续噪声明显，再评估按选项签名去重。

## 5. Review Gate

- **审计声明**：R1 `standard` / R2 `standard`（修复含实现与测试）；单分区；R1 时间盒 ≤10 分钟。
- **R1：`Reject`**（1 blocker / 3 warning / 4 suggest）
  - blocker：扁平路径用「已接受选项数」作告警序号，连续无效项时序号错位 → 改为 `props.options.entries()` 的源序号；分组保持组内序号。
  - warning：测试未锁定序号、分组路径零覆盖 → 改为精确文案断言并补分组用例；`normalizedOptions` 依赖 `model` 导致每次选择重算重复告警 → 移除归一化中的 `selected`，改为模板按模型派生；文档「生产构建静默」过度承诺 → 按 `warnDev` 实际口径改写（浏览器无 `process` 时仍输出）。
  - suggest：函数型 `optionValue` 二次调用 → 改为一次读取原始值再收窄；分组文案定位 → 保持组内序号并在记录中说明；记录类比表述与 §5 占位 → 已修正 / 回填。
- **R2：`Pass`**（0 blocker / 1 warning / 4 suggest）
  - W1 残留：分组用例原序列「有效 → 无效」无法区分「已接受数」与组内源序号 → 改为「无效 → 有效 → 无效」，精确断言「第 1 / 第 3 个」。
  - S1（收窄重复）→ 抽出 `narrowOptionValue()` 供两条路径复用；S2（分组定位）→ 保持组内序号，已在 §2 说明为已接受范围；S4（`selected` 回流回归）→ 开发告警用例增加「选择变化后告警次数仍为 2」；S3（§5 占位）→ 已回填。
  - 复核：`vitest run src/components/select/select.test.ts src/components/_shared/option.test.ts` 59 passed；`typecheck` exit 0。
- **复查基线**：本记录 §1 ~ §4；`select.vue` 的告警与两条归一化路径；`select.test.ts` 的三个新增用例；组件页中英说明。
