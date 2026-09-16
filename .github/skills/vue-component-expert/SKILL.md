---
name: vue-component-expert
description: 实现、审查或重构 Vue 3 组件库组件时使用。覆盖 Reka UI primitive 封装、组件 API 设计、CSS variables 主题、响应式与无障碍。用户提到 component、组件、Reka UI、props、slots、v-model、主题、暗色模式、组件 API 时都应触发。
metadata:
  internal: false
---

# Vue Component Expert

铁律：组件与样式解耦；对外 API 显式类型化；禁止 Tailwind / UnoCSS；公共 API 变更考虑向后兼容。

## 工作流

- [ ] Step 1: 确认组件定位 ⚠️ REQUIRED
  - [ ] 1.1 对照 [组件设计](../../../docs/design/components.md) 确认是否在组件集内。
  - [ ] 1.2 判断分层：primitive / 派生 / 复合。
- [ ] Step 2: 实现 ⚠️ REQUIRED
  - [ ] 2.1 `<script setup lang="ts">`；props/emits/slots 显式类型。
  - [ ] 2.2 基于 Reka UI primitive 封装（如适用）。
  - [ ] 2.3 样式使用 `--caomei-*` CSS variables，保持低特异性。
  - [ ] 2.4 支持 `class` 透传与 `v-model`（受控组件）。
- [ ] Step 3: 主题与响应式
  - [ ] 3.1 确认亮/暗主题下表现正常。
  - [ ] 3.2 按[响应式设计 §3](../../../docs/design/responsive.md) 的窄屏行为矩阵确认窄屏行为（组件自身 chrome 收敛：宽度内收 / 换行 / 横向滚动 / 截断）；卡片化与转全屏不作为默认行为。
- [ ] Step 4: 类型与导出 ⚠️ REQUIRED
  - [ ] 4.1 在 `src/index.ts` 导出组件与类型。
  - [ ] 4.2 `pnpm typecheck` 零 error。
- [ ] Step 5: 测试与交接
  - [ ] 5.1 补单元测试；交 `test-engineer` 增强。
  - [ ] 5.2 交 `code-reviewer` Review Gate。

## 常见检查

- props 是否有默认值与类型？
- 是否有 `any`？
- 样式是否可被 CSS variables 覆盖？
- 是否引入被禁依赖？

## 反模式

- 硬编码品牌色到组件内。
- 用散落布尔量替代 variant 枚举。
- 破坏性修改公共 API 而不升 major。
- 引入 Tailwind / UnoCSS。

## 交付前检查

- [ ] 组件 API 完整且有类型。
- [ ] 亮/暗主题与响应式验证通过。
- [ ] lint + typecheck + 定向测试通过。
- [ ] 已导出并在文档中登记。
