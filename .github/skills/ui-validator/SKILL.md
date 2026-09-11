---
name: ui-validator
description: 任何可见 UI 改动、组件渲染、交互、样式、响应式、暗色模式与浏览器侧回归验证都应使用。它负责在真实页面中验证实际渲染效果，而不是只看代码。用户提到 UI validate、screenshot、browser check、responsive、dark mode、视觉回归时都应触发。
metadata:
  internal: false
---

# UI Validator

铁律：以真实浏览器渲染为准；不以代码推断替代实际验证；记录证据（截图/结论）。

## 工作流

- [ ] Step 1: 准备验证环境 ⚠️ REQUIRED
  - [ ] 1.1 在 `examples/` 或下游项目中启动可渲染入口。
  - [ ] 1.2 明确受影响组件与页面清单。
- [ ] Step 2: 渲染验证 ⚠️ REQUIRED
  - [ ] 2.1 确认无样式错位、无控制台报错。
  - [ ] 2.2 检查关键交互（弹窗、下拉、切换）。
- [ ] Step 3: 响应式 ⚠️ REQUIRED
  - [ ] 3.1 桌面 / 平板 / 移动视口。
  - [ ] 3.2 窄屏降级行为（卡片化、全屏化）。
- [ ] Step 4: 主题 ⚠️ REQUIRED
  - [ ] 4.1 亮 / 暗模式。
  - [ ] 4.2 CSS variables 覆盖是否生效。
- [ ] Step 5: 可访问性抽检
  - [ ] 5.1 键盘可达、焦点可见、ARIA 语义。
- [ ] Step 6: 输出与交接
  - [ ] 6.1 输出验证记录与截图。
  - [ ] 6.2 问题回 `frontend-developer`；通过后交 `test-engineer`。

## 反模式

- 只看代码不实际渲染。
- 只测一种视口或只测亮色。
- 无证据地宣称「看起来没问题」。

## 交付前检查

- [ ] 已覆盖桌面/移动与亮/暗。
- [ ] 已记录截图与结论。
- [ ] 问题清单含复现步骤。
