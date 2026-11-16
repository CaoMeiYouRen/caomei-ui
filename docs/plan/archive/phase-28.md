# 待办归档（深度归档）：Phase 28

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 28：caomei-auth 迁移反馈收口与图标体系调研（**2026-11-08 完成并发布 `1.2.0`**）

- 时间：2026-11-07 用户就[第十二轮范围评估](../../design/governance/2026-11-07-next-stage-scope-evaluation-12.md) §3 裁定后登记；2026-11-08 交付 **5 条主线 / 8 条原子条目**，发布 `1.2.0` 并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取 **A + B + C + D + F**（E 质量收口小项不纳入），构成对账 **2 + 2 + 2 + 1 + 1 = 8**；逐条裁定 **D1** ② A + B + C + D + F、**D2** ① 先 `range`、**D3** ① 逐语气 token + 文档、**D4** ① 密度 token + 选择列宽度 token + 文档、**D5** ① 图标调研 = 选型对比 + 接口草案 + Backlog 拆分。范围与验收口径的单一事实源见 [Phase 28 登记批次记录](../../design/governance/2026-11-07-phase28-registration.md) §1 / §2。
- 非目标：`DatePicker.multiple`、触摸目标 P1 / P2、图标实现、RTL / 二期语言、长尾组件、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook、自动推送。

### M1 DatePicker 范围选择（2 条）

- **M1-1 `selectionMode="range"` 实现与单测**：`[Date, Date]` 闭区间、半开不写回、清空 / 键盘 / 可访问名；`single` 缺省路径逐值不变；48 例单测（提交 `41b113e`；[M1-1 记录](../../design/governance/2026-11-07-phase28-m1-1-datetime-range-design.md)）。RG：R2 Pass（0 blocker / 4 warning / 3 suggest）。
- **M1-2 文档 / 示例 / E2E / 视觉与 API 基线**：中英组件页、range 示例、E2E、区间面板基线（38 → 40）、API 与冻结面增量；顺带修复触发器 id 悬空与面板命名（提交 `2e9a814`、`445af3c`；[M1-2 记录](../../design/governance/2026-11-07-phase28-m1-2-datepicker-range-docs-baseline.md)）。RG：R2 Pass（0 blocker / 2 warning / 4 suggest）。

### M2 Toast 逐语气样式（2 条）

- **M2-1 逐语气 token**：16 个 `--caomei-toast-{tone}-{bg|border|text|shadow}` 钩子，默认回退全局 token、零视觉变化；4 语气覆盖采样 + 对比度 E2E（提交 `51d8494`；[M2-1 记录](../../design/governance/2026-11-07-phase28-m2-1-toast-tone-tokens.md)）。RG：R3 Pass（0 blocker / 0 warning / 2 suggest）。
- **M2-2 文档与迁移配方**：中英组件页钩子表 +「接受默认 / 薄封装 / token 覆盖」三路径；token 冻结面 405（提交 `eb364b9`；[M2-2 记录](../../design/governance/2026-11-07-phase28-m2-2-toast-docs-recipes.md)）。RG：R1 Pass（0 blocker / 1 warning / 4 suggest）。

### M3 DataTable 迁移适配（2 条）

- **M3-1 密度与选择列宽度 token**：4 个钩子（单元格 padding / 选择列宽度 / 选择行内距），默认值 = 现值；采样扩面；不新增 `size` prop（提交 `5cd24da`；[M3-1 记录](../../design/governance/2026-11-07-phase28-m3-1-data-table-density-tokens.md)）。RG：R2 Pass（0 blocker / 0 warning / 2 suggest）。
- **M3-2 文档与确认项**：DataTable 密度 / 选择列配方、Paginator 自渲染报表示例、全选作用域确认、迁移指南同步（提交 `a19b3f1`；[M3-2 记录](../../design/governance/2026-11-07-phase28-m3-2-datatable-paginator-docs.md)）。RG：R2 Pass（0 blocker / 0 warning / 0 suggest）。

### M4 图标体系调研（1 条）

- **M4-1 图标体系调研**：三态接入接口草案、25 导入文件 / 22 图标映射、样式 token、运行时 vs 构建期、下游迁移；零实现 / 零依赖；Backlog §1.9 I1 ~ I5（提交 `13c2adb`；[M4-1 记录](../../design/governance/2026-11-07-phase28-m4-1-icon-system-research.md)）。RG：R2 Pass（0 blocker / 0 warning / 2 suggest）。

### M5 发布收口（1 条）

- **M5-1 `1.2.0` 经 CI 发布**：`Release` run [`42440852062`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/42440852062) **success**——semantic-release + npm OIDC；`dist-tags.latest = 1.2.0`、tag `v1.2.0` / GitHub Release / 回推 `0ced91e`；tarball `shasum 06cd70f7…`、`exports` 13、解包 README = 1.2.0；下游 run [`42441345211`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/42441345211) success（dependfix @ `208bb579…`）。发布记录见 [M5-1 记录](../../design/governance/2026-11-08-phase28-m5-1-1.2.0-release.md) §2 / §3（提交 `0ced91e`、`ac0f2f6`）。RG：R2 Pass（0 blocker / 0 warning / 1 suggest）。

### 阶段总结

- **提交**：阶段登记 `81a71cb` → 发布回推 `0ced91e` → 收口 `ac0f2f6`；条目提交 `41b113e` / `2e9a814` / `445af3c` / `51d8494` / `eb364b9` / `5cd24da` / `a19b3f1` / `13c2adb`。
- **质量门**：`pnpm verify` exit 0（152 文件 / 2983 例）；`test:a11y` 68；`test:e2e` 484 passed / 4 skipped；`test:visual` 40；`capture:styles` 386 项 0 差异；覆盖率 93.16 / 86.30 / 94.83 / 92.51；发布后 Test / Docs / Security / TODO 全绿。
- **长期任务**：阶段收口 / 发布前触发**第 31 轮**门槛复核（2026-11-08）——待执行批次 **0**；条件触发 **1 项维持**；`capture:styles` 386 项 0 差异；`useAttrs()` 13 → 14 归因于 `calendar-range-panel.vue`；证据见 [长期任务](../recurring.md) §3 第 31 轮。
- **wisdom 蒸馏**：见[归档批次记录](../../design/governance/2026-11-08-phase28-archive.md) §3 / §4。
- **归档批次审计**：经 `@code-reviewer` Review Gate `standard`；结论见[归档批次记录](../../design/governance/2026-11-08-phase28-archive.md) §5。
- **已知观察**：① `DatePicker` 的 `v-model` 静态类型扩为 `Date | [Date, Date] | null`，单日期消费方需放宽绑定类型（类型级迁移、运行时无破坏，已入 `version-policy`）；② 范围模式不支持 `showTime` / `showSeconds` / `hourFormat`；③ 图标体系仅调研，`CaomeiIcon` 适配层与映射未实现；④ 安全告警 low 1（open 1 / dismissed 0），无 critical / high，未阻塞发布；⑤ `next` 通道未启用，CI 只发 `latest`。
- **后续候选**：图标 I1 ~ I5（[Backlog](../backlog.md) §1.9）、动效 A1 ~ A8（§1.10）、Paginator 每页选择器尺寸对齐（§1.1）。
