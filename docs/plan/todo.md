# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

**当前进行中阶段：Phase 27（1.1.0：移动端密度轴、Form 组合层、迁移护航、机制收口与 CI 发布）**，2026-11-03 用户就[第十一轮范围评估](../design/governance/2026-11-03-next-stage-scope-evaluation-11.md) §3 裁定后登记。构成 **6 条主线 / 18 条原子条目**（移动端与响应式二期 4 / `Form` 组合层 2 / 下游迁移护航 2 / 机制与质量收口 4 / 发布收口 1 / CI 发布链路 5；构成对账 4 + 2 + 2 + 4 + 1 + 5 = 18）。**原登记 5 条主线 / 13 条原子条目为 2026-11-03 时点值**；同日执行期追加 CI 发布链路 5 条（用户指令），见登记记录 §1.1。

范围与验收口径的单一事实源见 [Phase 27 登记批次记录](../design/governance/2026-11-03-phase27-registration.md) §1 / §2；目标版本 `1.1.0`（`latest` 当前为 `1.0.0`）。

## Phase 27 原子条目

| 编号 | 条目 | 交付面 | 状态 |
|:---|:---|:---|:---|
| M1-1 | `data-density="touch"` 轴 | 控件高度 36 / 44 / 52、字号 14 / 16 / 18、宽度上限 `none`；与预设 / 明暗正交；缺省路径零变化 | 已完成 |
| M1-2 | `--caomei-hit-target-min` 不可见命中区（P0） | 值片删除 / 清空 / 密码 / Tag / Message 共 37 个目标；`::after` 扩到 ≥24×24，按钮视觉盒不变；多行值片行距 +2px | 已完成 |
| M1-3 | 移动端常驻回归与视觉基线 | 390 / 768 / 1280（响应式设计 §4 矩阵）的密度轴与命中区用例；视觉受检面纳入三个多值字段与 `#hit-target`；基线重冻结 | 已完成 |
| M1-4 | 指南与设计口径同步 | 响应式设计 / 移动端指南（中英）/ 组件页密度节 / 计数与冻结面回扫（含 token 380 → 381）；关闭三处旧心智表述 | 已完成 |
| M2-1 | `CaomeiForm` / `CaomeiFormItem` 实现与单测 | 独立组合层 + 插槽作用域；12 字段逐项绑定；无 rules 引擎；不扩字段契约 | 已完成 |
| M2-2 | Form 文档、示例与计数回扫 | 中英组件页 / 示例 / E2E / 组件总览·画廊·locale 台账·API 基线 | 已完成 |
| M3-1 | PrimeVue 迁移经验回收 | 指南「常见陷阱」「迁移后自检」「逐组件对照入口」补 Tooltip 行；缺口分类登记 | 待执行 |
| M3-2 | 1.0 升级护航 | 下游版本快照、跨 minor 升级注意与对外 7 条（6 已知限制 + 1 升级注意）转指南；momei 反馈边界声明 | 待执行 |
| M4-1 | API 表面差分接入发布链 | `diff-api.mjs` 入 `manual-release.mjs`；删除 / 重命名 / required 收紧判 breaking | 待执行 |
| M4-2 | 品牌预设 `-solid` 对比度治理 | `momei` success 三态与 `caomei` `primary-solid`；把 `-solid` 配对（默认 / hover / active）纳入常驻断言面（6 预设 × 明暗 × 2 背景） | 待执行 |
| M4-3 | 阶段构成计数跨载体机检 | `todo.md` 与 `roadmap.md` 的口径句 / 表格对账；负向对照 + 受检面下界 | 待执行 |
| M4-4 | 依赖告警收口 | `minimatch` medium 覆盖评估或留痕；`deepmerge` low 维持留痕 | 待执行 |
| M5-1 | `1.1.0` 发布（经 CI） | Run `Release` workflow（`workflow_dispatch` + `environment` 审批）→ semantic-release 计算版本并 publish；手工流仅作回退 | 待执行 |
| M6-1 | 发布工作流接线与凭据 | 打开 publish；触发与审批；Trusted Publisher / `NPM_TOKEN`；`@semantic-release/git` 回推凭据；并发与超时 | 待执行 |
| M6-2 | 版本句与发布说明同步 | `@semantic-release/exec` 同步 README 中英 + roadmap 版本句；里程碑注入；发布后 `docs:check:version` 为绿 | 待执行 |
| M6-3 | 发布前置与后置门禁 | publish 前安全告警门禁 + verify / coverage；publish 后 dist-tag / shasum / 解包 README / exports / API 差分 | 待执行 |
| M6-4 | 事件链与下游复验 | `GITHUB_TOKEN` 事件排除 → PAT / App token 或显式 `workflow_dispatch`；发布后下游检查留痕 | 待执行 |
| M6-5 | CHANGELOG 生成器健壮性 | 空 `# Unreleased` 段、无 remote 降级、语言源自 root | 待执行 |

> **前置与约束**：M6 完成前不启用 `release.yml` 的 publish；发布 run 与推送以用户当次明确指令为前提；阶段收口 / 发布前须执行第 29 轮长期任务门槛复核并留痕；命中区只做 P0，P1 / P2 维持候选。

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。条件触发候选、已发布版本、长期任务与归档遗留均以各自单一载体为准，本节不再复写。

- **等待外部反馈**：momei 侧迁移由对应仓库执行、本仓等待反馈；两仓 `caomei-ui` 实测仍为 **`0.6.0`**（2026-10-13 复核；`1.0.0` 发布后未重测）。`v1.0.0` tag 的下游兼容检查已通过（run 41482763157，dependfix `typecheck` + `build`）；1.0 升级护航的具体差异清单由本阶段的升级护航条目承接。
