# 待办归档（深度归档）：Phase 24

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 24：机制远端生效与判别力收口、CI 环境治理、治理装置与规划载体补口、组件缺口补齐、图表能力（**已完成 2026-10-22；2026-11-03 整体归档**）

- 时间：2026-10-13 用户就关键决策点裁定后登记（同日经范围变更追加两条内容主线；2026-10-14 授权插队追加两条治理条目）；**2026-10-16 部分归档（14 条），2026-10-22 M1-1 / M2-1 回填后闭合，2026-11-03 整体归档**。
- 范围与授权（用户决策 2026-10-13）：取**组合 A + B + C**（机制收口与回归判别力 2 / CI 环境治理 1 / 治理装置与规划载体补口 5）；同日经**范围变更**追加 **M4 组件缺口补齐 4** 与 **M5 图表能力 2**（依据见[范围扩展评估](../../design/governance/2026-10-13-phase24-scope-extension-evaluation.md) §10）；2026-10-14 授权插队追加 **M3-6 / M3-7** → **5 条主线 / 16 条原子条目**。
- 非目标（沿用登记口径）：不推送任何提交、不为取证而专门发布版本、不启用 CI 自动发布 / 不进入 1.x、本阶段不落地移动端三项与国际化一期语言（转 Backlog）、图表不新增运行时依赖、不引入高误报守卫、不改公共 API。
### 逐条交付（16 条）

- **M1-1 视觉基线阻断形态首次远端执行复核**（2026-10-22 回填）：2026-10-16 周级 run `38899204640` **success**（`Image: ubuntu-24.04`），确认远端为阻断形态且 `test:visual` 在调度执行面通过。
- **M2-1 CI 运行器镜像迁移检测点复核与视觉基线重冻结**（2026-10-22 回填）：同一 run 的 `E2E Test` / `Core Regression` / `Security Audit` 均为 `Image: ubuntu-24.04`，**未命中** `ubuntu-26.04`；检测点维持待触发（承接载体见 [Backlog](../backlog.md) §1.6），命中后按重冻结 5 步执行。
- **M1-2 下游兼容检查版本差判别力补齐**（提交 `62c3208`）——以负向对照建立判别力（dispatch 已知不兼容的 `0.2.0` → Typecheck downstream 红）；正向用例待下次发布 tag；记录见 [M1-2](../../design/governance/2026-10-14-phase24-m1-2-downstream-compat-negative-control.md)；RG `standard` R1 Reject → R2 `quick` Pass。
- **M3-1 暂存区卫生机检**（提交 `3dffd25`）——`AM` / `MM` 即失败；含失败路径单测 + 受检面下界 + 负向对照，接入提交路径；记录见 [M3-1](../../design/governance/2026-10-14-phase24-m3-1-staging-hygiene-guard.md)；RG `standard` 两分区 R1 A Pass / B Reject → R2 Pass。
- **M3-2 归档块逐条 Review Gate 计数对账**（提交 `9f29eed`）——只对「两处都有却矛盾」判失败 + 受检面下界；记录见 [M3-2](../../design/governance/2026-10-14-phase24-m3-2-archive-rg-counts-guard.md)；RG `standard` R1 Reject → R2 Reject → R3 Pass。
- **M3-3 规划载体候选口径对账守卫**（提交 `bb5a429`）——`todo.md` 汇总候选 ↔ `backlog` §1 判别键对账；记录见 [M3-3](../../design/governance/2026-10-14-phase24-m3-3-candidate-anchor-guard.md)；RG `standard` 结论见记录 §6。
- **M3-4 取证命令守卫扩面**（提交 `5ff1e47`）——受检子命令扩至 `rev-list` / `reflog`，端点须为持久 ref / 提交哈希；记录见 [M3-4](../../design/governance/2026-10-14-phase24-m3-4-forensic-command-scope-expansion.md)；RG `standard` 结论见记录 §7。
- **M3-5 规划载体口径消缺**（提交 `173c0e4`）——补登记两行候选（示例外链漏判面 / 归档载体行数）+「阶段限定 + 复用编号」指针排查留痕；记录见 [M3-5](../../design/governance/2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)；RG `standard` 结论见记录 §9。
- **M3-6 门禁读数不复述（规则 + 阈值口径化）**（提交 `0693404`）——立规则 + 三类保留（阈值正当性 / 非空性判据 / 外部快照）；记录见 [M3-6](../../design/governance/2026-10-14-phase24-m3-6-gate-readings-dedup.md)；RG `standard` R1~R3 Reject → §3.5 改进 → R4 Reject → R5 Pass）；**存量面（索引移除读数复述）经用户裁定于 M3-7 同批执行**。
- **M3-7 读数对账装置换族（决策数族）**（提交 `cbeb2af`）——换成「文档引述常量 ↔ 代码常量」族 + 索引存量 sweep；记录见 [M3-7](../../design/governance/2026-10-14-phase24-m3-7-index-readings-sweep-and-family-redefinition.md)；与 M3-6 存量 sweep 同批——换族与 sweep 存在硬依赖。
- **M4-1 栅格与布局族**（提交 `27f0bf3`）——新增 `CaomeiRow` / `CaomeiCol`（24 栅格、gutter / 断点 span / 偏移 / 排序），零新增依赖；记录见 [M4-1](../../design/governance/2026-10-15-phase24-m4-1-grid-row-col.md)；RG `standard` R1 Pass → R2 Pass，结论见记录 §9。
- **M4-2 `Tooltip`**（提交 `0e297a4`）——Reka 薄封装（Provider 必需）；默认值兜底五项 `default: undefined`；记录见 [M4-2](../../design/governance/2026-10-15-phase24-m4-2-tooltip.md)；RG `standard` R1 Reject → R2 Pass，结论见记录 §9。
- **M4-3 导航骨架**（提交 `6012e7a`）——`Menu` / `SubMenu` / `MenuItem` + `Breadcrumb` / `BreadcrumbItem`；WAI-ARIA disclosure 导航；记录见 [M4-3](../../design/governance/2026-10-15-phase24-m4-3-navigation-skeleton.md)；RG 结论见记录 §9。
- **M4-4 `Alert`**（提交 `caecc1c`）——`Message` 的语义预设包装（静态档）+ 对比度装置（同批修复既有 soft 底色不达标）；记录见 [M4-4](../../design/governance/2026-10-15-phase24-m4-4-alert.md)；薄预设包装 + 对比度装置，RG 结论见记录 §9。
- **M5-1 图表轻量封装**（提交 `3f7ae73`）——可选 peer `vue-echarts` + 契约守卫 + 彩色像素探针装置；记录见 [M5-1](../../design/governance/2026-10-15-phase24-m5-1-chart-wrapper.md)；可选 peer + 契约守卫 + 彩色像素探针装置；RG 结论见记录 §9。
- **M5-2 暗色 / 主题预设 / 国际化联动 + 文档**（提交 `052c840`）——token 派生主题 + 语言 / 格式联动 + 相对判据装置；记录见 [M5-2](../../design/governance/2026-10-15-phase24-m5-2-chart-theme-locale.md)；token 派生主题 + 语言/格式联动 + 相对判据装置；RG 结论见记录 §8。

### 阶段总结

- **治理主线（M1-2 / M3-1 ~ M3-7，8 条）**：机检守卫补口与规划载体口径收口——暂存区卫生、归档块 RG 计数对账、候选口径对账、取证命令扩面、门禁读数不复述（含存量 sweep 换族）全部落地并接入 `governance:check`。
- **内容主线（M4-1 ~ M4-4 / M5-1 ~ M5-2，6 条）**：组件缺口补齐（栅格 / `Tooltip` / 导航骨架 / `Alert`）与图表能力（封装 + 主题与语言联动）——**零新增运行时依赖**（图表内核为可选 peer），6 条中的 5 条各带新装置（对比度 / 彩色像素探针 / 相对判据 / 契约守卫）。
- **提交对账**：`git log --oneline cbeb2af..052c840 --no-merges | wc -l` 与逐条 `--diff-filter=A` 记录首提交可复核（各条目行已给出提交号；归档批次自身提交不计入）。

### 回扫口径（三段式）

- **机检面**：`pnpm check:governance-records` —— 本批清空 `todo.md` 的 14 条条目后，指向 `docs/plan/todo.md` 且链接文字含条目编号的指针由该守卫机检（输出见归档批次记录）。
- **人工面**：Phase 24 各治理记录对 `todo.md` 的引用均为**内联码形态**（非 markdown 链接），不命中机检；逐条枚举结论见归档批次记录 §4。
- **未处理面**：沿用既有边界——「阶段限定 + 复用编号」类散文指针（历史记录内的点时快照）不回改，边界留痕见 [M3-5 记录](../../design/governance/2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)。

### 长期任务

- 第 26 轮门槛复核已于 2026-10-13（Phase 23 收口前）执行，两组任务均无待执行批次；**本批为部分归档、非阶段收口**，故不触发新一轮——待 M1-1 / M2-1 交付后的整体归档再执行并留痕。

### 遗留与后续候选

- **原未交付两条已于 2026-10-22 回填**：M1-1 = 2026-10-16 周级 run `38899204640` success（`Image: ubuntu-24.04`）；M2-1 = 同一 run 未出现 `ubuntu-26.04`、检测点维持待触发（2026-10-19 起迁移窗口）。
- **本阶段交付引出的 follow-up（登记，不占条目）**：RichTextEditor 的 `role` / 透传 `aria-label` 口径与 Chart 统一（涉及既有组件 a11y 快照）；可选 peer 契约守卫扩至 `dist` 产物；Chart 纳入 `capture:styles` 采样面；负向对照与校准数值固化为可重放工件；「`N 用例 × M project`」类 E2E 计数纳入对账。
- **候选池**：见 [Backlog](../../plan/backlog.md)（20 行条件触发候选，含本阶段 M3-5 登记的两行：「示例外链守卫漏判面扩展」与「归档载体行数再评估」——**后者的触发条件为超 `docs:check:line-count` warn 阈值 400 行**，本批归档后如越线即进入评估）。

### 归档批次 Review Gate

- 2026-10-16 部分归档：R1 `quick` **`Reject`**（2 blocker：批次记录的 RG 指针错节、归档块承诺的回扫枚举无载体）；已同批收口，结论见[部分归档批次记录](../../design/governance/2026-10-16-phase24-partial-archive.md) §7。
- 2026-11-03 整体归档：随 Phase 26 归档批次复核（结论见 Phase 26 块末）。
