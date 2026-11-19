# Phase 38 登记批次：移动端体验（基础层、移动壳与操作 / 空态）

> 创建时间：2026-11-20
> 触发：用户就[移动端体验与下一阶段范围评估](./2026-11-20-mobile-experience-evaluation.md) §6 的决策点作出裁定（D0 ① 核心 + 主动扩界全取 / D1 ① Cell·CellGroup + Tabbar + ActionSheet / D2 ① 维持 24 下限 + 文档口径 / D3 ① 仅 Empty / D4 ② 不发布）。
> **本记录是 Phase 38 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权启动时已有最大编号 Phase 37 + 1 = **Phase 38**（[规划规范 §4](../../standards/planning.md)）。
- **4 条主线 / 11 条原子条目**：移动端基础层 **2** / 移动壳 **3** / 操作与空态 **3** / 口径与验收 **3**；构成对账 2 + 3 + 3 + 3 = 11（原登记 10 条；2026-11-20 执行期追加 M4-3 后为 11）。
- **不发布**（D4 ②）：`latest` 维持 `1.3.0`，不触发 Release。评估草案中的 M5-1（`1.4.0` 发布）为条件条目，D4 ② 下不纳入（草案 11 条 → 登记 10 条）；2026-11-20 执行期追加 M4-3 后当前为 11 条。

### 1.1 执行期追加：M4-3 验收视口扩面（2026-11-20）

- **触发**：用户就「宽屏与主流移动视口」的工作量评估裁定——仅方案 A 并入 Phase 38（新增 M4-3）；方案 B / C 进 Backlog；方案 D 不纳入。
- **构成变化**：原登记 4 条主线 / 10 条原子条目 → **4 条主线 / 11 条原子条目**（构成对账 2 + 3 + 3 + 3 = 11）。
- **工作量估算**：约 6–8 文件 / 150–250 行；**0.5–1.5 天**（含 Review Gate）；零 `src/**`、零运行时改动；E2E 不在 PR CI，只影响周回归；`responsive.e2e.ts` 为 16 个 test 声明、单档 22 个实例，4 档共 **88 个新增实例**，预计周回归 +2–6 分钟（以 `pnpm test:e2e` 实跑校准）。评估与来源见[视口扩面评估](./2026-11-20-viewport-matrix-expansion-evaluation.md)。
- **不纳入**：B 宽屏视觉基线、C `xl` 断点 → [Backlog](../../plan/backlog.md) §1.6；D 全量矩阵宽屏化不纳入（用例实例接近翻倍、flaky 风险显著上升，定向档已覆盖宽屏形态）。
- **风险**：新档可能暴露既有宽屏缺陷；暴露后按缺陷另立修复条目，不混入 M4-3 的验收。
- **阶段级非目标**：不做移动端独立包、手势交互、基于 JS 的视口分支、`DataTable` 卡片化、通过放大视觉尺寸提升触摸目标；不接 vue-router；不新增运行时依赖；不做 Picker / NavBar / Search 栏组件化；不做 i18n 二期 / RTL。
- **主线级非目标**：
  - M1：不做 `visualViewport` 监听，不做按视口自动切换密度，不改桌面几何。
  - M2：不做 SwipeCell、页面切换 / 路由守卫、手势；Tabbar 只做展示层。
  - M3：不新增 Reka primitive、不做全屏 Dialog、不复制 `DataView` 的空态插槽。
  - M4：不把 44 设为默认，不放大视觉尺寸。

## 2. 条目与验收口径

| 编号 | 主线 | 条目 | 验收口径 | 文件面 |
|:---|:---|:---|:---|:---|
| **M1-1** | 基础层 | 安全区 token 与工具类 | `--caomei-safe-area-{top,right,bottom,left}` 默认 `env(safe-area-inset-*, 0px)`；`.caomei-safe-area-*`（top / right / bottom / left / x / y）；演示用 token 覆盖 34px 可视化；桌面 `env()` 为 0 时 `capture:styles` 零差异 | ≈ 4 |
| **M1-2** | 基础层 | 固定定位件接入与 `dvh` 回退 | Drawer（四向 + 底部安全区 + `dvh`）、Dialog / ConfirmDialog（`max-height` 用 `dvh`）、Toast（上下偏移 + 安全区）、BackTop（右下 + 安全区）、Image preview（四周 + 关闭按钮 + `dvh`）；E2E 以 token 34px 逐件断言；Drawer 内容可滚到底；桌面计算样式零差异 | ≈ 8 |
| **M2-1** | 移动壳 | Cell / CellGroup 实现与测试 | 行语义（标题 / 描述 / 右值 / 前后插槽 / 进入态）；`as` 为 `div` / `button` / `a`，点击语义由宿主承载；CellGroup 分隔线与分组标题；触摸密度与 320 视口；单测 + E2E | ≈ 8 |
| **M2-2** | 移动壳 | Tabbar / TabbarItem 实现与测试 | `v-model`、`aria-current` 单值、图标 / 文案 / 角标、禁用态、安全区、≥44 高、`#item` 插槽；**不接 vue-router、不做页面切换**；单测 + E2E | ≈ 8 |
| **M2-3** | 移动壳 | M2 的 10 语、台账与文档 | 新增可访问名键纳入 10 语；`check:locale-keys` / `check:locale-ledger` 基线同步；中英组件页；`components.md` / 总览页 / 画廊 / README 计数回扫 | ≈ 17（10 语同批） |
| **M3-1** | 操作与空态 | ActionSheet 实现与测试 | 以 `Drawer position="bottom"` 组合：标题 / 说明 / 分组 / 危险项 / 取消项 / 选择后关闭 / 焦点回退 / 内容滚动；**不新增 primitive**；单测 + E2E | ≈ 6 |
| **M3-2** | 操作与空态 | Empty 实现与测试 | 图标或图片、标题、说明、`#action`、尺寸档；复用既有 `dataView` 空态文案键；与 `DataView` 空态分工在文档中单点声明；320 下不裁切；单测 + E2E | ≈ 5 |
| **M3-3** | 操作与空态 | M3 的 10 语、台账与文档 | ActionSheet 取消项新增键纳入 10 语；台账与基线同步；中英组件页；`DataView` 关系说明；计数回扫 | ≈ 14（10 语同批） |
| **M4-1** | 口径与验收 | 移动端适配指南 | 中英双页同构：bottom sheet、安全区、吸顶、固定底部操作条、软键盘可见性、五条下限判据、44px 达成路径；回链 [响应式设计](../responsive.md) §1 / §3 | ≈ 4 |
| **M4-2** | 口径与验收 | 44px 政策与回归扩面 | 维持 24 下限（WCAG 2.5.8）；44 由 `size="lg"` / `data-density="touch"` 达成，不默认放大；四组新组件纳入 `responsive.e2e.ts` 五档，`MIN_SECTIONS` 下界同步上调；视觉基线与 `capture:styles` 复跑；相邻目标间距负向用例 | ≈ 6 |
| **M4-3** | 口径与验收 | 验收视口扩面（宽屏 + 主流移动） | 新增 `wide-1536` 1536×960 / `desktop-1920` 1920×1080 / `mobile-360` 360×800 / `mobile-414` 414×896 四个**定向**档（只跑 `responsive.e2e.ts`）；矩阵守卫从两档硬编码改为定向档清单；[响应式设计](../responsive.md) §4 表与说明同步；**不改 `src/**`、不改断点、不改全量矩阵与视觉基线** | ≈ 7 |

> 文件面为登记估算，实施时按[规划规范 §5](../../standards/planning.md) 的 10 文件阈值拆分；生成物与基线不计入。**10 语条目按键集合守卫要求整批提交，不按语言拆分**（先例：Phase 35 M3-2 为 19 文件）；M2-3 / M3-3 的超阈属该例外，实施时不再二次拆分。

## 3. 阶段规则

- **任务粒度**：单条 ≤ 10 文件 / 800 行；超出时按[规划规范 §5](../../standards/planning.md) 拆分（§2 表注已声明的「10 语同批」例外除外）；计数回扫按[规划规范 §3.9](../../standards/planning.md) 覆盖 `todo.md` / `roadmap.md` / 本记录 / 索引摘要 / `.session`。
- **质量门**：每条目 `lint` / `typecheck` / 定向测试 / 必要 E2E / Review Gate；阶段末 `pnpm verify`。
- **Review Gate**：每条目至少一轮 `@code-reviewer`；未 `Pass` 不得提交。
- **文档**：组件能力变化同步中英组件页与设计登记；不虚构未实现能力。
- **发布**：本阶段不发布；`release.yml` 与发布触发模型不改。
- **依赖**：不新增运行时依赖。

## 4. 载体同步与候选流转

- `backlog.md`：§1.5 迁出 6 行（SafeArea / 动态视口、Cell / CellGroup、Tabbar、ActionSheet、移动端适配指南、触摸目标 44 可选档），§1.11 迁出 1 行（Empty）；候选池更新后 §1.5 保留 7 行（滚动聚焦 / Toolbar 档 / Picker / Sticky / NavBar / 软键盘 / Search 栏）。
- `todo.md`：新增 Phase 38 状态句与 11 条条目表。
- `roadmap.md`：§1 当前态与 Phase 38 行（11 条，含执行期追加标注）。
- 治理索引：本记录登记一行。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 38（11 条待执行）。
- **M4-3 来源**：2026-11-20 视口评估新增候选（不在册 Backlog 行）；B 宽屏视觉基线 / C `xl` 断点新增到 `backlog.md` §1.6，D 全量矩阵宽屏化不纳入。
- 迁出候选全仓回扫：对 7 个迁出候选名做 `rg`，确认无活载体仍以现在时指向 §1.5 / §1.11；评估记录与调研记录为点时快照，不回改。实测需处置 1 处（`backlog.md` §1.11 的「Sticky / SafeArea」行，已改为「SafeArea 已登记 Phase 38」）；另 2 处活载体指针指向仍在册候选（[响应式设计 §3](../responsive.md) #7 的 Toolbar 769–1023 档、§4 的滚动聚焦候选），不受影响。
- 评估记录保持点时快照，不回改其候选计数；本记录 §4 为登记后流转的权威口径。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| 安全区与 `dvh` | 触及 6 个固定定位件的几何，桌面可能漂移 | 先落桌面零差异基线；以 token 覆盖 34px 的夹具取证；`capture:styles` 与视觉基线同批复跑 |
| 新组件 API | 1.x 公共 API 一旦发布难改 | 先出 API 草案（命名 / 插槽 / 事件 / 是否 `asChild`）再实现；只保留必要 props |
| Tabbar 边界 | 下游可能要求 `to` / 路由守卫 | 文档写明「展示层，不接 vue-router」；路由由使用方插槽承载 |
| 44px | 相邻 24px 命中区会重叠（值片行距仅 +2px） | 维持 opt-in；M4-2 给间距判定与负向用例 |
| Empty 双载体 | 与 `DataView` 空态并存会产生两套口径 | 文档指定唯一关系：`DataView` 负责容器空态，`Empty` 负责页面 / 区块空态 |
| 计数器 | 新增组件触发总览页 / 设计清单 / locale 台账 / README 计数 | 每条实现条目把计数回扫列入验收，不后置 |
| 主动扩界 | Cell / Tabbar / ActionSheet 在 caomei-todo §11.5 中均为应用层先行，本仓提前承担缺少下游实测复用 | M2 / M3-1 保持薄层与插槽优先；下游落地后按实际反馈再扩；不把「主动扩界」写成「下游达标」 |
| 视觉基线 | 四个新组件与固定件改动会扩大基线面 | 逐批冻结；`test:visual` 与 `capture:styles` 同批更新 |
| M4-3 视口扩面 | 新增 4 档可能暴露既有宽屏缺陷；周回归时长上升 | 先跑定向档并本地校准耗时；暴露缺陷另立修复条目，不混入 M4-3；不改全量矩阵 |

## 6. Review Gate

**结论：Pass**（R1，`standard`，2026-11-20）。

- 轮次：R1 `standard` —— **Pass**，0 blocker / 3 warning / 4 suggest；warning 与 suggest 已同批收口，R2 delta 复核结论见下。
- **RG-W01**：`.session` 未同步 → `current_phase` / `plan_state` / `verification_state` 已切到 Phase 38（R1 时点 10 条；M4-3 追加后 11 条）。
- **RG-W02**：`backlog.md` §1.11 的「Sticky / SafeArea」行指向已迁出候选 → 已改为「SafeArea 已登记 Phase 38」，并在 §4 补全仓 `rg` 回扫结论。
- **RG-W03**：M2-3 / M3-3 文件面越 10 文件阈值 → 已按 Phase 35 M3-2 先例显式标注「10 语同批」例外（≈ 17 / 14），不再二次拆分。
- suggest：M5-1 条件发布已说明（S01）；计数回扫改指 §3.9 五载体（S02）；补「主动扩界」风险行（S03）；Empty 复用 `dataView` 键、ActionSheet 取消项新增键（S04）。
- 验证：`lint-md` / `docs:check:links` / `docs:check:integrity` / `check:stage-counts` / `check:planning-numbers` / `check:governance-records` / `check:governance-counts` / `check:final-newline` 均通过。
- **R2（`quick`，≤ 5 分钟）**：**Pass** —— 0 blocker / 0 warning；R1 的 3 warning + 4 suggest 全部关闭；新增 1 suggest（§3 与 §2 表注互引）与 1 nit（`.session` 顶层时间戳），均同批收口。

**执行期追加 M4-3（2026-11-20）**：R4 `quick` **Reject**（1 blocker / 2 warning / 1 suggest）→ R5 `quick` **Pass**（全部关闭）。

- **RG-B01**：`todo.md` 状态句含 `M4-3` 触发 `check:planning-numbers` → 改为「2026-11-20 执行期追加 1 条」，编号只留在条目表与登记记录。
- **RG-W01**：视口评估无仓内载体 → 新增[视口扩面评估](./2026-11-20-viewport-matrix-expansion-evaluation.md)，Backlog §1.6 / §3 与索引同批回链。
- **RG-W02**：新增实例数低估 → 改为「16 个 test 声明 / 单档 22 个实例 / 4 档 88 个新增实例」（`playwright test --list` 实测）。
- **RG-S01**：§6 的 R1 条补「R1 时点 10 条；M4-3 追加后 11 条」。
- 验证：`check:planning-numbers` 0 命中、`check:stage-counts` 4 主线 / 11 条、`check:governance-records` / `docs:check:links` / `lint-md` 全绿。

## 7. 验收与回扫

- 阶段完成时按[规划规范 §7](../../standards/planning.md) 归档：`todo.md` 清空、`roadmap.md` 更新、`todo-archive.md` 入窗、`recurring.md` 门槛复核、三段式回扫。
- `.session` 阶段态在登记 / 范围变更 / 归档三类事件同批同步。
