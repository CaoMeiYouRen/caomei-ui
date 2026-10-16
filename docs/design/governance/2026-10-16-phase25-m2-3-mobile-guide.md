# Phase 25 M2-3：移动端使用指南页

> 阶段 / 条目：Phase 25 M2-3（移动端与响应式优化——移动端使用指南页）。
> 验收口径依据：[Phase 25 登记批次记录](./2026-10-16-phase25-registration.md) §2（「文档站新增页面并接入导航；口径与组件实现一致；`docs:check` 全绿」）。
> 关联：[响应式设计](../../design/responsive.md)（库内规则的单一事实源）、[触摸目标实测复核](./2026-10-16-phase25-m2-2-touch-target-audit.md)、[Backlog §1.5](../../plan/backlog.md)。

## 1. 背景与触发

M2-1 收敛了视口矩阵与形态口径、M2-2 产出了触摸目标实测清单，但**面向使用方的口径此前没有独立入口**：断点语义 / 窄屏行为矩阵 / 验收标准都写在设计文档（`docs/design/responsive.md`），而使用方看的是「指南」区。M2-3 补齐该入口。

## 2. 交付内容

- **新增页面** `docs/guide/mobile.md`（中文）+ `docs/i18n/en-US/guide/mobile.md`（英文镜像）。
- **导航接入**：`docs/.vitepress/config.ts` 的中英指南侧栏各 +1 项（中文「移动端与响应式」/ 英文「Mobile & Responsive」，位置在「本地联调」之后、「开发指南」之前）。
- **页面结构（使用者视角，5 个 H2）**：断点语义（含 769–1023 无档区间与 `ButtonGroup` / `SplitButton` 的已登记例外）→ 使用方职责（分栏显隐 / 控件宽度上限 / 表格卡片化 / 对话框全屏 / 步骤条方向 / 超长文案）→ 触摸目标（关键控件尺寸 + 2026-10-16 实测分布 + 使用层建议）→ 窄屏自测清单（视口 / 横向溢出 / 浮层 / 换行不裁切 / 桌面无回归）→ 相关链接。

## 3. 口径一致性（避免第二事实源）

| 页内内容 | 权威载体（指向而非复制） |
|:---|:---|
| 断点字面量与档位语义、769–1023 无档区间 | [响应式设计 §2](../../design/responsive.md) |
| 窄屏行为与已登记例外（ButtonGroup / SplitButton 收敛档 ≤1024） | 响应式设计 §2 / §3 矩阵 #7 |
| 验收标准（无横向溢出 / 浮层在视口内 / 换行不裁切 / 桌面无回归、键盘聚焦分档） | 响应式设计 §4 |
| 触摸目标尺寸与实测分布（289 / 87 / 193 / 9） | [触摸目标实测复核](./2026-10-16-phase25-m2-2-touch-target-audit.md) §3 / §4 |
| 触摸目标候选（不可见命中区原语） | [Backlog §1.5](../../plan/backlog.md) |
| 控件宽度上限与 token 覆盖 | [主题与样式](../../design/theming.md) |

**页面刻意不复制**：矩阵 18 行的逐行内容、逐组件实测表、验收断言的完整条款——这些只以指向形式出现（指南页给「怎么做」，设计文档给「规则是什么」）。英文镜像对中文专有页使用绝对路径 + `(Chinese)` 标注，与仓库既有做法一致。

## 4. 载体与门禁

- **i18n 同步范围**：新增页已配英文镜像（`pnpm docs:check:i18n-parity` 全绿）；`en-US` 路由表由 `collectDocRoutes` 自动收集，无需手工登记。
- **导航链接**：中英侧栏各 +1 项，`pnpm docs:check:config-links` 全绿（链接均指向存在页面）。
- **门禁**（本批终态 revision 实跑）：`pnpm docs:check` exit 0（含 integrity / links / structure / config-links / i18n-parity / line-count 等全段）；`pnpm governance:check` exit 0；`pnpm verify` exit 0。**读数一律不复述（口径见 [AI 协作规范 §9](../../standards/ai-collaboration.md)）**。
- **零 `src/**`**（纯文档批次，无样式与行为改动）。
- **收口过程 2 次拦截（均已修复）**：① 索引条目的「Review Gate 结论指针」被 `check-governance-records` 判 `rg-pointer-section-mismatch` —— 该条目含多个链接（响应式设计 / M2-2 记录 / Backlog），守卫解析到**末位链接**（M2-2 记录，其 Review Gate 在 §7）而非本记录 ⇒ 改为**显式链接本记录**（`[本记录](./2026-10-16-phase25-m2-3-mobile-guide.md) §6`）后 exit 0；② `docs:check` / `config-links` 的**分段读数**曾写入本记录与索引条目（违反 [AI 协作规范 §9](../../standards/ai-collaboration.md)「门禁读数不复述」）⇒ 已改为结论式表述（不带数字）。
- **已知机检缺口（follow-up，不占条目）**：`check-governance-counts` 的 `READING_RESIDUE_PATTERNS` 目前只覆盖 `N 文件 / M 例`、`N 记录 / M 指针`、`N md / M 命令` 等形态，**不含 `N 对` / `N 条`**——本批正是由 Review Gate 人工判出、机检放行。若后续该族再复发，应扩展 patterns 并补负向对照（按 [AI 协作规范 §3.5](../../standards/ai-collaboration.md) 的「复发 ⇒ 转机检约束」路径）。

## 5. 未覆盖边界

- 页面**不含**组件级示例（示例统一在组件页与 `docs/examples/`），故未新增示例或示例引用。
- 未新增「按设备/浏览器」矩阵（如 iOS Safari 特例）——属「支持面声明」范畴，当前无实测依据故不写入。
- 未评估该页在下游文档站的引用需求（下游自建文档，不强制引用本页）。

## 6. Review Gate

**R1（`standard`，单分区）**：**`Pass`**（0 blocker / 1 warning / 5 suggest）。六条 findings **全部同批收口**：

- **RG-W01（warning，复发）**：索引条目与 §4 复述 `docs:check` 分段读数（违反 [AI 协作规范 §9](../../standards/ai-collaboration.md)「门禁读数不复述」）。**处置**：本记录 §4 与索引条目改为结论式表述（不带数字）；**同族残留**——同批 M2-1 索引条目内的 E2E 总例数读数一并清除；`check-governance-counts` 的 patterns **不含 `N 对` / `N 条`** 的机检缺口按 follow-up 登记于 §4（不占条目、本批不改守卫，按「复发 ⇒ 转机检约束」路径留待下次复发时处置）。
- **RG-S01**：§2「6 节」与页面实况（5 个 H2）不符 → 改「5 个 H2」。
- **RG-S02**：命令引用不规范（`docs/check-i18n-parity` 等非命令路径）→ 改 `pnpm docs:check:i18n-parity` / `pnpm docs:check:config-links`。
- **RG-S03**：自测清单视口缺 769–1023 内部点 → 中英两页加 **900×1024**（与 `playwright.config.ts` 的 `gap-900` 档一致）。
- **RG-S04**：断点表新增「典型设备」列属设计文档未定义的补充面 → 中英两页加「上表为**摘要**，权威口径见响应式设计 §2」的声明。
- **RG-S05**：栅格 props 的 `lg`（≤1024 覆盖档）与表内 `lg`（≥1024 默认形态）未区分 → 中英两页补「同数值、方向相反」的显式说明。

**R2（delta，`quick`）**：**`Pass`**（**0 blocker**；R1 六条**全部闭合**）。审计方独立复跑：`pnpm lint:md:check` / `pnpm docs:check` / `pnpm governance:check` 均 exit 0；`\d+\s*(对|条)` 在本批三份 md **零命中**（RG-W01 闭合实证）；`grep -c '^## '` 中英各 5（S01）；900×1024 与 `gap-900` 档逐值一致（S03）；zh/en H2 与清单项数对称（5:5 / 6:6）。

**放行后同批落盘**：本段 + `docs/plan/todo.md` 的 M2-3 完成态；随后复跑受影响门禁（`pnpm verify` / `pnpm docs:check` / `pnpm governance:check`）并取工件刷新确认。

**审计工件**：`artifacts/review-gate/2026-10-16-phase25-m2-3-mobile-guide.md`（本地态、git-ignored）。

**未覆盖边界**：未做浏览器渲染核对（纯文档页，无 UI 行为）；未回扫冻结范围外的存量读数残留（按 RG-W01 follow-up 处理）；英文文案质量未逐句评审（只核结构与链接）。

**复查基线**：`docs/guide/mobile.md`、`docs/i18n/en-US/guide/mobile.md`、`docs/.vitepress/config.ts` 的中英侧栏两处、本记录 §2 / §3 / §4、`docs/design/governance/index.md` 的 M2-3 条目、[响应式设计](../../design/responsive.md) §2 / §3 #7 / §4 / §5。
