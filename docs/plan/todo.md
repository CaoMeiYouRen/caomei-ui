# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

**当前进行中阶段：Phase 28（caomei-auth 迁移反馈收口与图标体系调研；目标 `1.2.0`）**，2026-11-07 用户就[第十二轮范围评估](../design/governance/2026-11-07-next-stage-scope-evaluation-12.md) §3 裁定后登记。构成 **5 条主线 / 8 条原子条目**（DatePicker 范围选择 2 / Toast 逐语气样式 2 / DataTable 迁移适配 2 / 图标体系调研 1 / 发布收口 1；构成对账 2 + 2 + 2 + 1 + 1 = 8）。范围与验收口径的单一事实源见 [Phase 28 登记批次记录](../design/governance/2026-11-07-phase28-registration.md) §1 / §2；目标版本 `1.2.0`（`latest` 当前为 `1.1.0`）。

## Phase 28 原子条目

| 编号 | 条目 | 交付面 | 状态 |
|:---|:---|:---|:---|
| M1-1 | DatePicker 范围选择：`selectionMode="range"` 实现与单测 | 默认 `single` 不变；`range` 采用 `[Date, Date]`；Reka `RangeCalendarRoot` / `DateRangePickerRoot`；保留既有 props 契约；`showTime` 交互定形；可访问名区分开始 / 结束 | 待执行 |
| M1-2 | DatePicker 范围选择：文档 / 示例 / E2E / 视觉与 API 基线 | 中英组件页「未实现」段收窄；range 示例；E2E 区间选择；视觉基线（range 面板）；API 基线与冻结面；迁移指南 `selection-mode` 映射 | 待执行 |
| M2-1 | Toast 逐语气 token（默认值不变） | `--caomei-toast-{tone}-bg` / `-border` / `-text` / `-shadow`；默认回退现有 token（零视觉变化）；`capture:styles` 采样扩面；对比度断言 | 待执行 |
| M2-2 | Toast 文档与迁移配方 | 组件页样式表补 4 语气 × 4 属性；中英迁移指南「接受默认 / 薄封装 / token 覆盖」三路径与示例 | 待执行 |
| M3-1 | DataTable 密度与选择列宽度 token | 单元格 padding 与选择列宽度 token；默认值 = 现值；覆盖表头 / 单元格 / 选择列 / 空态；不新增 `size` prop | 待执行 |
| M3-2 | DataTable / Paginator 迁移文档与确认项 | DataTable 密度 / 选择列配方；Paginator「自渲染报表」中英示例；全选作用域确认口径；迁移指南同步 | 待执行 |
| M4-1 | 图标体系调研（只调研） | 第三方接入接口 / 内置图标替换 / 样式预设 / 运行时 vs 构建期 / 下游迁移；产出治理记录 + Backlog 拆分；零实现、零依赖 | 待执行 |
| M5-1 | `1.2.0` 经 CI 发布 | `Release` workflow（OIDC）→ npm `latest` / tag / GitHub Release / 回推；下游 compat 复验；发布后回填版本句与规划载体 | 待执行 |

> **前置与约束**：`M5-1` 的推送与发布以用户当次明确指令为前提；阶段收口 / 发布前须执行第 31 轮长期任务门槛复核并留痕；`multiple`、触摸目标 P1 / P2、图标实现、RTL / 二期语言、长尾组件维持范围外。

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。条件触发候选、已发布版本、长期任务与归档遗留均以各自单一载体为准，本节不再复写。

- **等待外部反馈**：momei 侧迁移由对应仓库执行、本仓等待反馈；两仓 `caomei-ui` 锁定版本读数（2026-11-04，仓库 HEAD）：dependfix **`1.0.0-rc.1`** / momei **`1.0.0`**。`v1.0.0` tag 的下游兼容检查已通过（run 41482763157）；`v1.1.0` 的下游兼容检查已通过（run 42251067161，dependfix @ `ad592c92…`）。1.0 升级护航的版本快照、升级注意与对外 7 条见[升级到 1.0](../guide/upgrade-to-1.0.md)，momei 页面级反馈缺口见[升级护航交付记录](../design/governance/2026-11-04-phase27-m3-2-1.0-upgrade-escort.md) §5。
