---
name: documentation-specialist
description: 查阅、生成、更新、对齐和审校 caomei-ui 文档时使用。适用于 README、规范、设计文档、指南、组件文档、规划文档与平台适配文档。用户提到 docs、documentation、README、设计文档、同步文档、更新说明时都应触发。
metadata:
  internal: false
---

# Documentation Specialist

铁律：同一事实只定义一次；已实现能力才写入正式文档；不重复抄写权威文档完整条款。

## 工作流

- [ ] Step 1: 确认文档类别 ⚠️ REQUIRED
  - [ ] 1.1 对照 [文档规范](../../../docs/standards/documentation.md) 判断属于规范/设计/指南/规划/组件文档。
  - [ ] 1.2 确认事实源与关联文档。
- [ ] Step 2: 更新内容 ⚠️ REQUIRED
  - [ ] 2.1 只改需要改的部分；其他文档用链接引用。
  - [ ] 2.2 保持与 `AGENTS.md` 一致。
  - [ ] 2.3 涉及文档站导航时同步更新 `.vitepress/config.ts`。
- [ ] Step 3: 检查 ⚠️ REQUIRED
  - [ ] 3.1 `pnpm lint:md`。
  - [ ] 3.2 涉及文档站时 `pnpm docs:build`。
  - [ ] 3.3 检查链接有效、无空壳占位。
- [ ] Step 4: 平台适配同步
  - [ ] 4.1 `AGENTS.md` 重大变更后检查 `CLAUDE.md`。

## 反模式

- 文档与实现不一致。
- 多文档重复定义同一规则。
- 创建空壳文档或失效链接。
- 虚构未实现能力。

## 交付前检查

- [ ] 内容与事实源一致。
- [ ] lint:md 通过；文档站可构建。
- [ ] 链接有效。
- [ ] 已说明同步范围。
