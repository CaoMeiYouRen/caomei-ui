# 待办归档（深度归档）：Phase 30

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 30：表单、布局与选择器动效 + 触摸目标 P1 + 阶段残留机检（**2026-11-11 完成并归档；本阶段不发布**）

- 时间：2026-11-10 用户就[第十四轮范围评估](../../design/governance/2026-11-10-next-stage-scope-evaluation-14.md) §3 裁定 D0 ① / D1 ⑤ / D2 ② / D3 ② / D4 ① / D5 ① 后登记；2026-11-11 交付 **5 条主线 / 5 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取 **动效 A4 + A5 + A6 + 触摸目标 P1 + 治理小项**，构成对账 **1 + 1 + 1 + 1 + 1 = 5**；D2 ② **本阶段不发布**（`latest` 维持 `1.2.0`）；D3 ② 仅触摸目标 P1（P2 维持 Backlog）；D4 ① 纳入 `check-stage-counts` 无阶段交叉校验；D5 ① 文档站 demo 维持「尊重系统偏好 + 独立审查页」。范围与验收口径的单一事实源见[Phase 30 登记批次记录](../../design/governance/2026-11-10-phase30-registration.md) §1 / §2。
- 非目标：动效 A7 数据展示（转 Backlog §1.10）、触摸目标 P2（§1.5）、发布、RTL / 二期语言、长尾组件、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook。

### M1 表单输入动效（1 条）

- **M1-1 表单输入动效（A4）**：InputGroup 聚焦成员上移 2px、CheckboxGroup 勾选指示器（委托 Checkbox 单点实现）、Form / FormItem invalid 标签颜色过渡与错误行入场、Slider 手柄悬浮 / 按下缩放（改用独立 `scale` 规避 Reka 内联 `transform`）、InputNumber 步进反馈；`minimal` 零差异、`reduce` 压平、无裸时长；新增 `form-motion` E2E（提交 `6f4a6d4`；[M1-1 记录](../../design/governance/2026-11-10-phase30-m1-1-form-motion.md)）。RG：R1 Pass → R2 Pass。

### M2 基础与布局动效（1 条）

- **M2-1 基础与布局动效（A5）**：Avatar / Image 加载淡入（仅透明度、不产位移）、Tag 颜色过渡与悬浮（不覆盖选中态、reduce 下不变色）、Card `hoverable` 抬升改用位移 token（expressive 4px，`minimal` 保持 2px）；Badge 审计、Divider / Row / Col 静态对照（不做布局动画）；新增 `basic-layout-motion` E2E（提交 `5c22c30`；[M2-1 记录](../../design/governance/2026-11-10-phase30-m2-1-basic-layout-motion.md)）。RG：R1 Pass → R2 Pass。

### M3 选择器动效（1 条）

- **M3-1 选择器动效（A6）**：Select / MultiSelect / AutoComplete 面板入场限定 `[data-state='open']`，条目高亮、选中指示器与标签入场、清空 / 删除反馈；Calendar 日期状态过渡；ColorPicker 手柄独立 `scale` 与色板过渡；SelectButton / ToggleButton 按下缩放；DatePicker 审计既有面板入场（不重复实现）；`minimal` 零差异、`reduce` 压平、portal 面板以 `html` 轴生效；新增 `selector-motion` E2E，采样 helper 扩 `triggerEvent`（提交 `ddf9a22` / `96feb20`；[M3-1 记录](../../design/governance/2026-11-10-phase30-m3-1-selector-motion.md)）。RG：R1 Pass → R2 Pass。

### M4 触摸目标 P1（1 条）

- **M4-1 触摸目标 P1**：Checkbox 2 / RadioButton 6 / Switch 2 / Slider 3 / ColorPicker 滑柄 4 共 **17** 个表单控件盒复用 `.caomei-hit-target` 原语扩到不可见命中区 ≥24×24，**视觉盒逐族不变**；命中区探针升级为逐轴 `max(边长, 24)` + 分族视觉盒上限与 Chebyshev 配对；`capture:styles` 补视觉盒与 `::after` 逐属性样本；负向对照（命中区 token 临时改 20px）可判失败（提交 `8b2583b`，CI 预算同步修复 `99d7152` / `e6fd534`；[M4-1 记录](../../design/governance/2026-11-10-phase30-m4-1-hit-target-p1.md)）。RG：R1 Pass（组件样式面 / 测试与文档面两分区）→ R2 delta Pass ×2。

### M5 治理小项（1 条）

- **M5-1 `check-stage-counts` 无阶段交叉校验**：无进行中阶段分支新增 `phase-state-residue`——`todo.md` 的 `## 当前状态` 段出现阶段编号或 `todo-archive.md` 文本即失败（受检面止于该段，「未完成项汇总」维持允许面）；补两条形态负向单测、CLI 负向与受检面边界正例；[规划规范 §7](../../standards/planning.md) 同步（提交 `72cb756`；[M5-1 记录](../../design/governance/2026-11-11-phase30-m5-1-stage-count-residue.md)）。RG：R1 Pass → R2 Pass。

### 回扫口径（三段式）

- **机检面**：`check:governance-records`（治理记录 ↔ 索引双向一致、历史规划指针无失效）、`check-links`（本地链接有效）、`check-planning-numbers`（规划载体无条目编号残留）、`check:stage-counts`（无进行中阶段分支 skipped 且残留校验通过）均 `exit 0`；残留判据见 `check-stage-counts` 的 `phase-state-residue`（`## 当前状态` 段出现阶段编号或 `todo-archive.md` 文本即失败）。
- **人工面**：`todo.md`（删阶段条目表、恢复「无进行中阶段」）/ `roadmap.md`（§1 当前态、阶段表 Phase 30 行、§5 深度归档与压缩历史）/ `todo-archive.md`（本块入窗、Phase 24 迁出、主窗口口径与归档索引行）/ `archive/index.md`（phase-24 行与迁出时点）/ `recurring.md`（第 33 轮）/ 治理索引（本批次记录）逐处核过；Phase 24 块迁出为机械操作——50 行逐行核对与原文一致，改写 19 处（链接深度 `../` → `../../` 18 处 + 同目录 `./` → `../` 1 处），正文零改写。
- **未处理面**：无新增；沿用既有边界——历史「阶段限定 + 复用编号」散文指针与时点计数不回改。

### 阶段总结

- **提交**：登记 `e6f20c3` → M1-1 `6f4a6d4` / M2-1 `5c22c30` / M3-1 `ddf9a22` + `96feb20` / M4-1 `8b2583b` + `99d7152` + `e6fd534` / M5-1 `72cb756`。
- **质量门**：`pnpm verify` 通过（M1-1 / M2-1 / M3-1 各自含 `build` / `docs:build` / `governance:check`）；`capture:styles` **0 差异**（写录时点快照：采样面 399 项，Phase 30 M4-1 由 386 扩至 399）；`test:visual` 全绿（含 M4-1 亮暗 / 视口 / 命中区基线 0 差异）；定向 E2E `form-motion` / `basic-layout-motion` / `selector-motion` / `hit-target` / `focus-visible-expansion` 通过；M5-1 侧 `lint:check` / `typecheck` / `governance:check` 全绿。
- **长期任务**：阶段收口触发**第 33 轮**门槛复核（2026-11-11）——待执行批次 **0 项维持**；条件触发 **1 项维持**（表单控件公共 props 契约）；已判定不纳入 **5 项维持**；证据见[长期任务](../recurring.md) §3 第 33 轮。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → 活跃 **7 条** < 阈值 20，未触发蒸馏；Phase 30 期间新增 3 条可复用发现（代表 1 条：命中区探针对宽宿主按逐轴 `max(边长, 24)` 判定；全量见[归档批次记录](../../design/governance/2026-11-11-phase30-archive.md) §3）。
- **归档批次审计**：经 `@code-reviewer` Review Gate；结论见[归档批次记录](../../design/governance/2026-11-11-phase30-archive.md) §5。
- **已知观察**：① 本阶段**不发布**，`latest` 维持 `1.2.0`；② 提交已推送 `master`（`git ls-remote` 实测），未触发 Release；③ 本阶段 CI 两次红均为 `capture:styles` 采样预算未同步（`99d7152` 同步 399、`e6fd534` 标注旧值为时点快照），修复后 `Test` / `CodeQL` / `Pages` / `Security Alerts` 全 success；④ Chromium 单浏览器覆盖，Firefox / WebKit 未复跑。
- **后续候选**：动效 A7 数据展示（[Backlog](../backlog.md) §1.10）、触摸目标 P2（§1.5）、RTL / 二期语言、长尾组件。
