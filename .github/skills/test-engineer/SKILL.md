---
name: test-engineer
description: 编写、补齐、运行和优化 caomei-ui 测试时使用。覆盖 Vitest 单元测试、@vue/test-utils 组件测试、失败路径断言、覆盖率治理与 Playwright E2E。用户提到 test、单元测试、组件测试、覆盖率、mock、回归时都应触发。
metadata:
  internal: false
---

# Test Engineer

铁律：测试通过不等于没有风险；修复 bug 必须补回归测试；不为覆盖率数字做无断言占位测试。

## 工作流

- [ ] Step 1: 评估范围 ⚠️ REQUIRED
  - [ ] 1.1 明确被测组件/composable 的公共行为与边界。
  - [ ] 1.2 对照 [测试规范](../../../docs/standards/testing.md) 确定测试层级。
- [ ] Step 2: 设计用例 ⚠️ REQUIRED
  - [ ] 2.1 默认渲染 + 主要 variant/size 分支。
  - [ ] 2.2 关键 props 与事件（正向 + 边界）。
  - [ ] 2.3 `v-model` 双向绑定；禁用/加载态（如适用）。
  - [ ] 2.4 失败路径与错误分支。
- [ ] Step 3: 编写与运行 ⚠️ REQUIRED
  - [ ] 3.1 使用 `@vue/test-utils` + Vitest。
  - [ ] 3.2 `pnpm exec vitest run <path>` 定向运行；必要时全量 `pnpm test`。
- [ ] Step 4: 覆盖率
  - [ ] 4.1 `pnpm test:coverage`；目标 ≥80%。
  - [ ] 4.2 覆盖率不回退。
- [ ] Step 5: 交接
  - [ ] 5.1 测试代码变更交 `code-reviewer` 审看。

## 反模式

- 只测 happy path。
- 用 `skip` / `only` 长期停留。
- 测试依赖执行顺序或外部网络。
- 为覆盖率写占位断言。

## 交付前检查

- [ ] 覆盖主要分支与至少一个失败路径。
- [ ] 定向与相关测试全部通过。
- [ ] 覆盖率未回退。
- [ ] 已说明剩余风险。
