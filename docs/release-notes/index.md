# 发布说明

面向消费方的逐版说明：每版新增能力概览、**消费方可见变化**（现象 / 影响面 / 下游修复写法）与可复现证据。源文件位于 `docs/release-notes/<version>.md`，发布时按版本原文注入 GitHub Release 正文。

> 约定：`BREAKING` 变更同时列在 [CHANGELOG](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/CHANGELOG.md) 的 `BREAKING CHANGES` 段；分级口径与撰写要求见[发布指南 §10.1](../guide/release.md)。

## 版本

- [1.4.0](./1.4.0)：`CaomeiButton` 根节点形态、按钮内容单行截断、`DataTable` 文本包装与行高、浮层展开态 `inert` 隔离，附三家下游的实测证据与适配写法。
- [1.3.0](./1.3.0)：动效体系、图标体系、触摸目标、组件增强与工具链。
- [1.2.0](./1.2.0)：`DatePicker` 范围选择与 `v-model` 类型放宽、Toast 逐语气样式、`DataTable` 迁移适配。
- [1.1.0](./1.1.0)：移动端密度轴与 `data-density="touch"`、`Form` / `FormItem` 组合层、CI 发布链路（OIDC）。

## 兼容策略

- 冻结面与非冻结面的定义见[版本与兼容策略](../guide/version-policy.md)；DOM 结构、类名、计算样式属非冻结面，不构成 SemVer 破坏，但仍是消费方可见变化，须按上条写升级注意。
- 升级前建议先读目标版本的「消费方可见变化」，再按「适配」一栏逐项核对本仓用法。
