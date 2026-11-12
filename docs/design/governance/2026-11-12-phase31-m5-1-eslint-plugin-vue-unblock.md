# Phase 31 M5-1：`eslint-plugin-vue` 10.12 解阻

> 创建时间：2026-11-12
> 触发：Phase 31 M5-1（[Phase 31 登记批次](./2026-11-12-phase31-registration.md) §2）。
> 依据：依赖 PR 卫生口径见 [GitHub 协作规范](../../standards/github-collaboration.md) §3。

## 1. 范围与结论

- **目标**：解除 `eslint-plugin-vue` 10.12 带来 `vue/no-dupe-keys` 对 `defineModel` 与 `defineProps` 同名项的阻塞，使 6 个在册依赖 PR 的共同门禁恢复。
- **实证冲突点**：全仓仅 `stepper.vue` 一处——`defineModel<number>()` 与 `StepperProps.modelValue` 同名；`rich-text-editor` / `tags-input` 的 props 接口本就不含 `modelValue`（由 `defineModel` 承载），升级后为 no-op。`color-picker` 的 `modelValue` 未使用 `defineModel`，不冲突。
- **处置**：`defineProps<StepperProps>` → `defineProps<Omit<StepperProps, 'modelValue'>>`，编译期去重；`StepperProps`（含 `modelValue`）与 `StepperSlotProps` 保持导出，**公共 API 无删除、无重命名**。

## 2. 实现要点

1. **导出类型不动**：`types.ts` 未改，`StepperProps.modelValue?: number` 与其 JSDoc 保留，`Omit` 只作用于组件内的 props 解析。
2. **`v-model` 契约不变**：`modelValue` 由 `defineModel<number>()` 继续承载，`@vue/compiler-sfc` 的 `compileScript` 实测生成的运行时 props 与 `emits: ['update:modelValue']` 与改动前一致（`modelValue` 仍为可选 `number | undefined`）。
3. **API 表不丢字段**：`vue-component-meta` 双态对比显示 props 集合仍为 6 项、`modelValue` 仍在列表内（顺序移到末位；`component-meta.json` 为未入库生成物）。唯一差异是 `modelValue` 的 JSDoc 描述转由 `defineModel` 承载而变空——与 `rich-text-editor` / `tags-input` 的既有惯例一致，不构成文档断层。
4. **注释口径**：组件内说明「`modelValue` 由 `defineModel` 声明，`Omit` 仅做编译期去重，导出类型保留该字段」。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm exec eslint src/components/stepper/stepper.vue` | 通过（当前安装 `eslint-plugin-vue@10.11.1`，该版本尚未启用新判据） |
| `pnpm typecheck` | 通过 |
| `pnpm exec vitest run src/components/stepper` | 21 tests 通过 |
| `@vue/compiler-sfc` `compileScript` 实测 | props / emits / `withDefaults` 合并结构与改动前一致 |
| `vue-component-meta` 双态对比 | props 6 项、events `update:modelValue` 不变 |

- **10.12 下的 `pnpm lint:check` 证据**：由依赖 PR（`eslint-plugin-vue` 10.11.1 → 10.12.0）在 rebase 后重跑 CI 提供；本批代码修复先落地，PR 重跑通过即视为解阻完成（合并结果与 CI 结论回填本节）。

## 4. Review Gate

- **audit-depth**：`quick`（单文件类型层去重）；时间盒 ≤5 分钟。
- **R1**：**Pass**，0 blocker / 0 warning / 3 suggest。
  - suggest 1：`modelValue` 的 JSDoc 描述不进 API 表描述（与既有 `defineModel` 组件惯例一致，接受，不复写文档）。
  - suggest 2：`stepper` 走 `Omit`、`rich-text-editor` / `tags-input` 走「接口不含 `modelValue`」，两种处置并存——本记录 §1 / §2 已说明理由（导出类型完整性优先）。
  - suggest 3：注释位置可拆分，非阻塞，保持现状。
- **复查基线**：`src/components/stepper/stepper.vue` 的 `defineProps` / `defineModel` 段与 `types.ts` 的 `StepperProps.modelValue`。

## 5. 风险与边界

1. **`modelValue` 描述丢失**：API 自动生成表中该 prop 描述为空（手写文档页仍完整描述 `v-model` 用法），接受。
2. **本地无 10.12 实跑**：仓库当前锁定 10.11.1，新判据的消除只能由依赖 PR 的 CI 证明；PR 未绿前本条目不算完整交付。
3. **不涉及其他组件**：`rich-text-editor` / `tags-input` 预期为 no-op，升级后由同一 CI 覆盖，不额外改动。
