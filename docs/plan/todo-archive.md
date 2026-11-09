# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

> **主窗口口径（2026-11-09 更新）**：主窗口只保留**归档索引**（Phase 0 ~ Phase 23，逐阶段一行摘要 + 深度归档链接）与**近线阶段窗口**（**当前为 Phase 24 ~ Phase 29 共 6 块；目标窗口 5 个，未越阈暂留 6**）；更早阶段的完整归档块迁入**深度归档**目录 [`archive/`](./archive/)，收录范围分别为 [phase-00-06.md](./archive/phase-00-06.md)（Phase 0 ~ 6）、[phase-07-12.md](./archive/phase-07-12.md)（Phase 7 第一阶段 ~ Phase 12）、[phase-13-17.md](./archive/phase-13-17.md)（Phase 13 ~ 17）、[phase-18.md](./archive/phase-18.md)（Phase 18）、[phase-19.md](./archive/phase-19.md)（Phase 19）、[phase-20.md](./archive/phase-20.md)（Phase 20）、[phase-21.md](./archive/phase-21.md)（Phase 21）、[phase-22.md](./archive/phase-22.md)（Phase 22）、[phase-23.md](./archive/phase-23.md)（Phase 23）。**主窗口累计超过 `docs:check:line-count` 的 warn 阈值（400 行）时，把最早的阶段块迁入深度归档（链接深度机械调整，另含同目录 `./` → `../` 修正，正文不改写）**；该阈值由 `docs:check:line-count` 驱动——归档载体只增不减，2026-09-29 曾达 594 行、2026-10-13 达 574 行、2026-10-16 达 404 行、Phase 26 批前 396 行、Phase 26 入窗后约 470 行；2026-11-08 Phase 28 迁出后 362 行；2026-11-09 Phase 29 入窗后约 408 行，Phase 23 迁出后 368 行，补 Phase 29 三段式回扫段后 **373 行**（`docs:check:line-count` 口径）。**深度归档不改变权威**：阶段交付的权威记录仍是各阶段治理记录（见[治理索引](../design/governance/index.md)），深度归档只保存主窗口迁出的原始正文。

## 归档格式

每个阶段归档块应包含：

- 阶段名称与时间；
- 交付内容与提交记录；
- 质量门结果（lint / typecheck / test / build）；
- 审计结论（Pass / Reject 及修复情况）；
- 遗留问题与后续候选。

深度归档文件沿用同一格式（只做链接深度 `../` → `../../` 的机械调整）。

---

## 归档索引（Phase 0 ~ Phase 23）

> 完整归档块见「深度归档」列；阶段交付摘要如下（每行一行，细节以深度归档与治理记录为准）。

| 阶段 | 时间 | 交付摘要 | 深度归档 |
|:---|:---|:---|:---|
| Phase 0 | 2026-09-11 ~ 09-12 | 立项与 POC：命名 / 关键决策冻结、tsdown 构建与子路径导出、`--caomei-*` token 草案与暗色方案、AI / 文档基建、`src/` 骨架 | [phase-00-06](./archive/phase-00-06.md) |
| Phase 1 | 2026-09-12 | Tier 0 组件：Button / Input 家族 / Tag·Badge / Select / Dialog / Toast / Card / Checkbox / DataTable（列定义） | [phase-00-06](./archive/phase-00-06.md) |
| Phase 2 | 2026-09-13 | Tier 1 组件：Avatar / Paginator / Message / ProgressSpinner / ConfirmDialog（`useConfirm`）/ Password / MultiSelect | [phase-00-06](./archive/phase-00-06.md) |
| Phase 3 | 2026-09-13 | Tier 2 组件：Tabs / Accordion / DropdownMenu（10 件）/ SelectButton / Image / FileUpload | [phase-00-06](./archive/phase-00-06.md) |
| Phase 4 | 2026-09-13 | Tier 3 稳定批：RadioGroup / Slider / ToggleButton / Toolbar / Skeleton / ProgressBar / Popover | [phase-00-06](./archive/phase-00-06.md) |
| Phase 5 第一阶段 | 2026-09-13 ~ 09-14 | 文档站增强：docs `vue-tsc` 类型检查、站内搜索（中文分词）、站点 i18n 骨架 | [phase-00-06](./archive/phase-00-06.md) |
| Phase 6 | 2026-09-14 | 组件库补全与规范化：momei 使用复核台账、设计规范与主题预设、Divider / InputGroup / FloatLabel / ButtonGroup / AutoComplete / Stepper 补全 | [phase-00-06](./archive/phase-00-06.md) |
| Phase 7 第一阶段 | 2026-09-14 ~ 09-16 | 迁移就绪：消费路径与 Nuxt 接入（本地 link 先行）、组件 i18n 注入机制、DataTable 能力增强、DatePicker / Calendar / Drawer / SplitButton / ColorPicker / DataView | [phase-07-12](./archive/phase-07-12.md) |
| Phase 9 | 2026-09-16 | 发布前收口：文档站信息架构（6 分组 + 组内字母序）、代码质量门与守卫、发布清单 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 10 | 2026-09-16 ~ 09-17 | 国际化与移动端适配：内建 5 语种、locale 键集合守卫、移动端与响应式适配 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 7 第二阶段 | 2026-09-17 ~ 09-19 | 库侧迁移就绪与交接计划：迁移计划与验收标准、B0a 交接资产、6 主线 / 33 条原子条目 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 5 第二阶段 | 2026-09-19 | 首版发布：本地手动 0.x 首发（0.1.0）、发布指南 runbook、annotated 基线 tag | [phase-07-12](./archive/phase-07-12.md) |
| Phase 11 | 2026-09-20 | 组件样式按需化与能力增强：`unbundle + css.inject`、`theme.css` 入口、4 主线 / 15 条原子条目 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 12 | 2026-09-21 ~ 09-23 | 发布就绪、文档对外与一致性收官：0.2.0 发布、文档对外可用性、样式一致性收官、a11y 基线、治理守卫精选 | [phase-07-12](./archive/phase-07-12.md) |
| Phase 13 | 2026-09-23 ~ 09-24 | 组件能力补齐与 dependfix 迁移解阻：DataTable 行分组 / 可折叠分组 / 行展开 / 多列排序与降序优先、TagsInput 补齐、0.3.0 发布、文档站双花括号插值守卫 | [phase-13-17](./archive/phase-13-17.md) |
| Phase 14 | 2026-09-25 ~ 09-27 | 质量与一致性收口：a11y 例外处置与受检面扩面、样式 token 一致性、对比度与配对、跨根链接守卫、测试回归、switch 滑块前景判定、组件能力长尾判定 | [phase-13-17](./archive/phase-13-17.md) |
| Phase 15 | 2026-09-27 ~ 09-28 | 治理收口深化 + 组件能力补齐 + 下游迁移护航：字段 shell 样式层共享、引用型属性回归规则、Button `iconOnly`、Select `#value`、对比度盘点、迁移陷阱文档、条件候选判定表 | [phase-13-17](./archive/phase-13-17.md) |
| Phase 16 | 2026-09-28 ~ 09-29 | 质量收口与治理装置落地：治理守卫精选落地、0.4.0 发布收口 | [phase-13-17](./archive/phase-13-17.md) |
| Phase 17 | 2026-09-30 | 极简主题预设与富文本封装 + 治理补口：极简具名预设 `minimal` 成为缺省、`CaomeiRichTextEditor` 轻量封装、类名前缀守卫、取证命令 revision 钉定守卫、模态内浮层档位修复与门禁 | [phase-13-17](./archive/phase-13-17.md) |
| Phase 18 | 2026-09-30 ~ 10-01 | 发布收口、测试稳定性与一致性治理：0.5.0 发布后校验与版本句同步、并行负载 flaky 类根因修复与并发上限兜底、计算样式采样面扩至 Toast / Switch、设计规范 §6 可机检性分级评估、治理台账漂移消缺 | [phase-18](./archive/phase-18.md) |
| Phase 19 | 2026-10-02 ~ 10-07 | 设计一致性口径落地、组件文档去重与观感缺陷处置：设计规范 §6 七项口径裁定与 P1 ~ P3 装置、迁移映射去重 3 批、Tab 指示条 / 富文本下拉 / `iconOnly` 示例修复、`.session` 与 `todo` 约束 | [phase-19](./archive/phase-19.md) |
| Phase 20 | 2026-10-07 ~ 10-09 | 测试装置扩面、治理守卫补口与发布收口：Tabs 采样 / 焦点与禁用态扩面、文档站主题 CSS lint、直连 Reka 守卫、浮层交互 E2E、0.6.0 发布、视觉基线立项评估 | [phase-20](./archive/phase-20.md) |
| Phase 21 | 2026-10-10 | 下游回归机制启动、发布流统一与视觉基线落地：上游触发的下游兼容检查、`release:manual` 脚本编排、Playwright 视觉基线装置与 CI 非阻断接入 | [phase-21](./archive/phase-21.md) |
| Phase 22 | 2026-10-10 ~ 10-12 | 机制真实贯通、依赖安全与升级治理、治理与测试收口：下游兼容检查首次真实触发、视觉基线首跑转阻断、`source-map-js` 修复、`simple-git` 4 升级、治理守卫与文档站遗留项 | [phase-22](./archive/phase-22.md) |
| Phase 23 | 2026-10-12 ~ 10-13 | 机制收口与回归判别力、依赖与 CI 环境治理、治理与测试收口：视觉基线受检面扩至 30 张、下游兼容检查判别力、CI 运行器镜像检测点、归档载体二次压缩、示例外链守卫 | [phase-23](./archive/phase-23.md) |

---

## Phase 24：机制远端生效与判别力收口、CI 环境治理、治理装置与规划载体补口、组件缺口补齐、图表能力（**已完成 2026-10-22；2026-11-03 整体归档**）

- 时间：2026-10-13 用户就关键决策点裁定后登记（同日经范围变更追加两条内容主线；2026-10-14 授权插队追加两条治理条目）；**2026-10-16 部分归档（14 条），2026-10-22 M1-1 / M2-1 回填后闭合，2026-11-03 整体归档**。
- 范围与授权（用户决策 2026-10-13）：取**组合 A + B + C**（机制收口与回归判别力 2 / CI 环境治理 1 / 治理装置与规划载体补口 5）；同日经**范围变更**追加 **M4 组件缺口补齐 4** 与 **M5 图表能力 2**（依据见[范围扩展评估](../design/governance/2026-10-13-phase24-scope-extension-evaluation.md) §10）；2026-10-14 授权插队追加 **M3-6 / M3-7** → **5 条主线 / 16 条原子条目**。
- 非目标（沿用登记口径）：不推送任何提交、不为取证而专门发布版本、不启用 CI 自动发布 / 不进入 1.x、本阶段不落地移动端三项与国际化一期语言（转 Backlog）、图表不新增运行时依赖、不引入高误报守卫、不改公共 API。
### 逐条交付（16 条）

- **M1-1 视觉基线阻断形态首次远端执行复核**（2026-10-22 回填）：2026-10-16 周级 run `38899204640` **success**（`Image: ubuntu-24.04`），确认远端为阻断形态且 `test:visual` 在调度执行面通过。
- **M2-1 CI 运行器镜像迁移检测点复核与视觉基线重冻结**（2026-10-22 回填）：同一 run 的 `E2E Test` / `Core Regression` / `Security Audit` 均为 `Image: ubuntu-24.04`，**未命中** `ubuntu-26.04`；检测点维持待触发（承接载体见 [Backlog](./backlog.md) §1.6），命中后按重冻结 5 步执行。
- **M1-2 下游兼容检查版本差判别力补齐**（提交 `62c3208`）——以负向对照建立判别力（dispatch 已知不兼容的 `0.2.0` → Typecheck downstream 红）；正向用例待下次发布 tag；记录见 [M1-2](../design/governance/2026-10-14-phase24-m1-2-downstream-compat-negative-control.md)；RG `standard` R1 Reject → R2 `quick` Pass。
- **M3-1 暂存区卫生机检**（提交 `3dffd25`）——`AM` / `MM` 即失败；含失败路径单测 + 受检面下界 + 负向对照，接入提交路径；记录见 [M3-1](../design/governance/2026-10-14-phase24-m3-1-staging-hygiene-guard.md)；RG `standard` 两分区 R1 A Pass / B Reject → R2 Pass。
- **M3-2 归档块逐条 Review Gate 计数对账**（提交 `9f29eed`）——只对「两处都有却矛盾」判失败 + 受检面下界；记录见 [M3-2](../design/governance/2026-10-14-phase24-m3-2-archive-rg-counts-guard.md)；RG `standard` R1 Reject → R2 Reject → R3 Pass。
- **M3-3 规划载体候选口径对账守卫**（提交 `bb5a429`）——`todo.md` 汇总候选 ↔ `backlog` §1 判别键对账；记录见 [M3-3](../design/governance/2026-10-14-phase24-m3-3-candidate-anchor-guard.md)；RG `standard` 结论见记录 §6。
- **M3-4 取证命令守卫扩面**（提交 `5ff1e47`）——受检子命令扩至 `rev-list` / `reflog`，端点须为持久 ref / 提交哈希；记录见 [M3-4](../design/governance/2026-10-14-phase24-m3-4-forensic-command-scope-expansion.md)；RG `standard` 结论见记录 §7。
- **M3-5 规划载体口径消缺**（提交 `173c0e4`）——补登记两行候选（示例外链漏判面 / 归档载体行数）+「阶段限定 + 复用编号」指针排查留痕；记录见 [M3-5](../design/governance/2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)；RG `standard` 结论见记录 §9。
- **M3-6 门禁读数不复述（规则 + 阈值口径化）**（提交 `0693404`）——立规则 + 三类保留（阈值正当性 / 非空性判据 / 外部快照）；记录见 [M3-6](../design/governance/2026-10-14-phase24-m3-6-gate-readings-dedup.md)；RG `standard` R1~R3 Reject → §3.5 改进 → R4 Reject → R5 Pass）；**存量面（索引移除读数复述）经用户裁定于 M3-7 同批执行**。
- **M3-7 读数对账装置换族（决策数族）**（提交 `cbeb2af`）——换成「文档引述常量 ↔ 代码常量」族 + 索引存量 sweep；记录见 [M3-7](../design/governance/2026-10-14-phase24-m3-7-index-readings-sweep-and-family-redefinition.md)；与 M3-6 存量 sweep 同批——换族与 sweep 存在硬依赖。
- **M4-1 栅格与布局族**（提交 `27f0bf3`）——新增 `CaomeiRow` / `CaomeiCol`（24 栅格、gutter / 断点 span / 偏移 / 排序），零新增依赖；记录见 [M4-1](../design/governance/2026-10-15-phase24-m4-1-grid-row-col.md)；RG `standard` R1 Pass → R2 Pass，结论见记录 §9。
- **M4-2 `Tooltip`**（提交 `0e297a4`）——Reka 薄封装（Provider 必需）；默认值兜底五项 `default: undefined`；记录见 [M4-2](../design/governance/2026-10-15-phase24-m4-2-tooltip.md)；RG `standard` R1 Reject → R2 Pass，结论见记录 §9。
- **M4-3 导航骨架**（提交 `6012e7a`）——`Menu` / `SubMenu` / `MenuItem` + `Breadcrumb` / `BreadcrumbItem`；WAI-ARIA disclosure 导航；记录见 [M4-3](../design/governance/2026-10-15-phase24-m4-3-navigation-skeleton.md)；RG 结论见记录 §9。
- **M4-4 `Alert`**（提交 `caecc1c`）——`Message` 的语义预设包装（静态档）+ 对比度装置（同批修复既有 soft 底色不达标）；记录见 [M4-4](../design/governance/2026-10-15-phase24-m4-4-alert.md)；薄预设包装 + 对比度装置，RG 结论见记录 §9。
- **M5-1 图表轻量封装**（提交 `3f7ae73`）——可选 peer `vue-echarts` + 契约守卫 + 彩色像素探针装置；记录见 [M5-1](../design/governance/2026-10-15-phase24-m5-1-chart-wrapper.md)；可选 peer + 契约守卫 + 彩色像素探针装置；RG 结论见记录 §9。
- **M5-2 暗色 / 主题预设 / 国际化联动 + 文档**（提交 `052c840`）——token 派生主题 + 语言 / 格式联动 + 相对判据装置；记录见 [M5-2](../design/governance/2026-10-15-phase24-m5-2-chart-theme-locale.md)；token 派生主题 + 语言/格式联动 + 相对判据装置；RG 结论见记录 §8。

### 阶段总结

- **治理主线（M1-2 / M3-1 ~ M3-7，8 条）**：机检守卫补口与规划载体口径收口——暂存区卫生、归档块 RG 计数对账、候选口径对账、取证命令扩面、门禁读数不复述（含存量 sweep 换族）全部落地并接入 `governance:check`。
- **内容主线（M4-1 ~ M4-4 / M5-1 ~ M5-2，6 条）**：组件缺口补齐（栅格 / `Tooltip` / 导航骨架 / `Alert`）与图表能力（封装 + 主题与语言联动）——**零新增运行时依赖**（图表内核为可选 peer），6 条中的 5 条各带新装置（对比度 / 彩色像素探针 / 相对判据 / 契约守卫）。
- **提交对账**：`git log --oneline cbeb2af..052c840 --no-merges | wc -l` 与逐条 `--diff-filter=A` 记录首提交可复核（各条目行已给出提交号；归档批次自身提交不计入）。

### 回扫口径（三段式）

- **机检面**：`pnpm check:governance-records` —— 本批清空 `todo.md` 的 14 条条目后，指向 `docs/plan/todo.md` 且链接文字含条目编号的指针由该守卫机检（输出见归档批次记录）。
- **人工面**：Phase 24 各治理记录对 `todo.md` 的引用均为**内联码形态**（非 markdown 链接），不命中机检；逐条枚举结论见归档批次记录 §4。
- **未处理面**：沿用既有边界——「阶段限定 + 复用编号」类散文指针（历史记录内的点时快照）不回改，边界留痕见 [M3-5 记录](../design/governance/2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)。

### 长期任务

- 第 26 轮门槛复核已于 2026-10-13（Phase 23 收口前）执行，两组任务均无待执行批次；**本批为部分归档、非阶段收口**，故不触发新一轮——待 M1-1 / M2-1 交付后的整体归档再执行并留痕。

### 遗留与后续候选

- **原未交付两条已于 2026-10-22 回填**：M1-1 = 2026-10-16 周级 run `38899204640` success（`Image: ubuntu-24.04`）；M2-1 = 同一 run 未出现 `ubuntu-26.04`、检测点维持待触发（2026-10-19 起迁移窗口）。
- **本阶段交付引出的 follow-up（登记，不占条目）**：RichTextEditor 的 `role` / 透传 `aria-label` 口径与 Chart 统一（涉及既有组件 a11y 快照）；可选 peer 契约守卫扩至 `dist` 产物；Chart 纳入 `capture:styles` 采样面；负向对照与校准数值固化为可重放工件；「`N 用例 × M project`」类 E2E 计数纳入对账。
- **候选池**：见 [Backlog](../plan/backlog.md)（20 行条件触发候选，含本阶段 M3-5 登记的两行：「示例外链守卫漏判面扩展」与「归档载体行数再评估」——**后者的触发条件为超 `docs:check:line-count` warn 阈值 400 行**，本批归档后如越线即进入评估）。

### 归档批次 Review Gate

- 2026-10-16 部分归档：R1 `quick` **`Reject`**（2 blocker：批次记录的 RG 指针错节、归档块承诺的回扫枚举无载体）；已同批收口，结论见[部分归档批次记录](../design/governance/2026-10-16-phase24-partial-archive.md) §7。
- 2026-11-03 整体归档：随 Phase 26 归档批次复核（结论见 Phase 26 块末）。

## Phase 25：归档载体收口、移动端与响应式优化、国际化深化（一期）、发布收口

- 时间：2026-10-16 用户就[下一阶段范围评估（第九轮）](../design/governance/2026-10-16-next-stage-scope-evaluation-9.md) §5 裁定「按推荐来」后登记；2026-10-21 交付 **4 条主线 / 8 条原子条目**并完成阶段归档（用户指令「更新 M4-1 状态，然后开始归档」）。
- 范围与授权（用户决策 2026-10-16）：取**主线 A + B + C**（归档与规划载体收口 / 移动端与响应式优化 / 国际化深化一期）并合入 **D4** 发布收口 → **4 条主线 / 8 条原子条目**（M1 1 / M2 3 / M3 3 / M4 1；构成对账 1 + 3 + 3 + 1 = 8）。**条目构成变更**：M3-1 于同日经用户裁定拆为 **M3-1a（包形态）/ M3-1b（5 语落地）**（原登记 2 条为时点值），依据见[locale 分包方案设计](../design/governance/2026-10-16-phase25-m3-1-package-split-design.md) 与[登记记录 §7](../design/governance/2026-10-16-phase25-registration.md)。**D5** `Form` / `FormItem` 与 **D6** 长尾组件维持候选；**D7** 国际化一期与移动端同批执行。范围与验收口径的单一事实源见[Phase 25 登记批次记录](../design/governance/2026-10-16-phase25-registration.md) §1 / §2。
- 非目标：不推送提交（发布条目的推送以用户明确指令为前提）；不启用定时自动发布、不放开 `release.yml` publish、不进入 1.x；不纳入 `Form` / `FormItem`（维持候选、先出专项评估）与长尾组件；不做破坏性 API 变更、不改组件公共 API；不引入 Tailwind / UnoCSS；RTL 与二期语言集维持登记；不引入高误报守卫（新增守卫须带负向对照与受检面下界）；不压缩历史快照类记录；`reka-ui` / `conventional-changelog` 维持条件触发。

### M1 归档与规划载体收口（1 条）

- **M1-1 归档载体深度归档与行数口径收口**（提交 `746b75e`；记录见 [M1-1](../design/governance/2026-10-16-phase25-m1-1-todo-archive-deep-migration.md)）：Phase 18 完整块机械迁入新增深度归档 [phase-18.md](./archive/phase-18.md)，主窗口 **404 → 342 行**（`docs:check:line-count` 判 ok）；迁出段与原文 `diff` 零差异（**14 处**链接目标改写为唯一改动面）；主窗口口径句与 `archive/index.md` 同步；指针回扫三段式留痕。RG `standard` R1 `Pass` → R2 delta `quick` `Pass`。

### M2 移动端与响应式优化（3 条）

- **M2-1 移动端形态口径收敛 + 视口矩阵扩面**（提交 `0b4849c`；记录见 [M2-1](../design/governance/2026-10-16-phase25-m2-1-viewport-matrix-expansion.md)）：新增 **320px + 900px** 两个定向档（原 390 / 768 / 1280 三档保持全量），`gap-900` 档暴露的 ButtonGroup 空档实现补齐到 ≤1024px；矩阵口径写入[响应式设计](../design/responsive.md) 单一事实源，受检面下界与「矩阵档口径」运行时对账用例同批落地；同时修复 769–1023px 空档。RG `standard` R1 `Pass`（warning / suggest 已收口）。
- **M2-2 触摸目标复核**（提交 `8661ae5`；记录见 [M2-2](../design/governance/2026-10-16-phase25-m2-2-touch-target-audit.md)）：按用户裁定**只出实测清单与提升建议**、不改样式；逐组件实测 320 / 900 档命中区并留痕，结论落[响应式设计](../design/responsive.md) 与 Backlog；RG `standard` R1 `Reject`（1 blocker：≥44 集合由 token 推断而非读数）→ 修正 → R2 `Pass`。
- **M2-3 移动端使用指南页**（提交 `67f0522`；记录见 [M2-3](../design/governance/2026-10-16-phase25-m2-3-mobile-guide.md)）：新增中英 `guide/mobile` 页并接入导航，覆盖响应式断点 / 触摸目标 / 视口适配口径；RG `standard` R1 `Pass` → R2 delta `quick` `Pass`。

### M3 国际化深化（一期）（3 条）

- **M3-1a locale 按语言子路径导出（包形态）**（提交 `1eb562b` / `8206b01` / `d9949f3` / `1191eab` / `9435c9c`；记录见 [M3-1a](../design/governance/2026-10-16-phase25-m3-1a-locale-subpath-exports.md)）：注册表预注册收敛为 `zh-CN` + `en-US`，`zh-TW` / `ja-JP` / `ko-KR` 下沉子路径 + `registerLocale()`；`exports` / resolver / Nuxt 模块 / `check:build` 五条不变量同步；体积实测 provider 消费方 **−56% min / −44% gzip**、非 provider 零变化；中英 `locale.md` 增「按需引入」章节与示例。按交付面拆 4 批提交，RG 逐批放行（② 分区 1 Reject 1 blocker → 收口后 Pass；③b R1/R2 Reject → 收口后放行），全文见记录 §8。
- **M3-1b 一期 5 语落地**（提交 `8a6ddf9`（代码）/ `eca0ec8`（文档）；记录见 [M3-1b](../design/governance/2026-10-20-phase25-m3-1b-five-locales.md)）：新增 `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR` 五套文案（28 命名空间 / 80 条）；`CaomeiLocale` 扩为 10 语；`tsdown` + `exports` 增 5 条子路径（按需合计 8 条）；ECharts 映射补 5 语（`pt-BR → PT-br`）与 RTE 映射补 5 语（`ru-RU → ru`）；`check-locale-keys` 下界提升为 10 语 / 8 子路径；中英文档同步。RG 代码 R1 `standard` `Pass` + R2 delta `Pass`；文档面另经 `quick` `Reject`（RTE 依赖段仍写 3 语）→ delta `Pass`。
- **M3-2 locale 台账、守卫与子路径导出对齐**（提交 `aaf5f7d`；记录见 [M3-2](../design/governance/2026-10-20-phase25-m3-2-locale-ledger-alignment.md)）：`check-locale-ledger` 由「中英台账 ↔ `types.ts`」扩为三维——另对账中英文档的「预注册 / 按需引入」语言表与子路径表 ↔ `CaomeiLocale` + `PRE_REGISTERED_LOCALES`；新增命名空间 / 预注册 / 按需 / 子路径四项受检面下界与 **19 例**正反面对照；同批消除 `development.md` / `experience-archive.md` 的「5 语 / 台账无机检」旧口径。RG R1 `standard` `Reject`（1 blocker：活载体旧口径）→ R2 delta `Reject`（1 blocker：12/19 例计数漂移）→ R3 delta `Pass`。

### M4 发布收口（1 条）

- **M4-1 推送 + 发布 0.7.0 + 发布后校验与版本句同步**（提交 `c496f61`（版本）/ `8766f86`（CHANGELOG）/ `183a917`（README）；发布工具修复 `a0e91f5`；记录见 [M4-1](../design/governance/2026-10-21-phase25-m4-1-release-execution.md)）：registry `latest` = **0.7.0**（2026-10-20T12:29:13Z），tarball sha1 `5b59e41…` 与 `dist.shasum` 一致、`fileCount` 427、exports 13 键；GitHub Release `v0.7.0` 于 2026-10-20T12:38:47Z 发布；`origin/master` = `a0e91f5` = 工作区 HEAD（本地领先 0）。**BREAKING CHANGES 补正**：0.7.0 初始 CHANGELOG / GitHub Release 缺语言包按需化段，已于 2026-10-21 在 CHANGELOG 与 GitHub Release 说明补齐（不改 tag、不发新版本）。**下游兼容**：run `39423865750` 在安装刚发布的 0.7.0 时被下游 pnpm 11 `minimumReleaseAge` 拒绝，未进入 `typecheck` / `build`，非兼容性回归；已由 `a0e91f5` 在 workflow 覆盖步骤以 `--config.minimumReleaseAge=0` 修复，待下一次 tag 触发复验。RG R1 `standard` `Reject` → R2 delta `Pass`（M4-1 发布事实无 blocker；blocker / warning 均为归档载体计数与 wisdom 指针，已闭合并回填），结论见[记录 §5](../design/governance/2026-10-21-phase25-m4-1-release-execution.md)。

### 阶段总结

- **4 条主线 / 8 条原子条目全部交付**：归档载体回落到 `docs:check:line-count` 阈值内；移动端形态 / 视口矩阵 / 触摸目标 / 使用指南页收口；locale 包形态 + 一期 5 语 + 台账守卫三维对齐；0.7.0 发布并完成发布后校验、GitHub Release 与 BREAKING CHANGES 补正。
- **发布**：registry `latest` = **0.7.0**；远端 `v0.1.0` ~ `v0.7.0` 共 7 个 annotated tag；GitHub Release 已回填 `v0.1.0` ~ `v0.7.0`。
- **新增 / 强化装置**：locale 子路径五条产物不变量、`check-locale-keys` 10 语 / 8 子路径下界、`check-locale-ledger` 三维对账 + 19 例正反面对照、移动端矩阵档运行时对账用例。

### 回扫口径（三段式）

- **机检面**：`pnpm check:governance-records`（归档后 `todo.md` 的 Phase 25 条目移除，指向 `todo.md` 的编号指针由守卫复跑）；`pnpm docs:check` / `pnpm check:governance-counts` / `pnpm check:planning-numbers` 全绿。
- **人工面**：Phase 25 各治理记录对 `todo.md` 的引用均为内联码 / 记录内文形态，按 [规划规范 §9](../standards/planning.md) 的「点时记录保持原样」处置；本轮逐条核对 M1-1 / M2-1 ~ M2-3 / M3-1a / M3-1b / M3-2 / M4-1 的回链。
- **未处理面**：沿用既有边界——历史记录内「阶段限定 + 复用编号」类散文指针不回改（见 [M3-5 记录](../design/governance/2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)）。

### 长期任务

- 第 27 轮门槛复核（2026-10-21，**Phase 25 收口 / 0.7.0 发布后门槛复核轮**）：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 **5 项维持**。取证：`useLabelAttrs` 15 / `labelAttrs` **11**（+1 = `chart.vue`）/ 模板级 `:aria-label="label"` 0 / 继承公共契约 12 / 含内联同名字段 **35**（+3 = `chart` / `menu` / `tooltip` 的 `types.ts`）/ `useFocusControl` 4 / `useAttrs()` **13**（+2 = `alert.vue` / `chart.vue`）；§2.2 复跑四组件共有 shell 声明 **0**；`capture:styles` **313 项** 0 差异（308 → 313，Phase 24 新组件 / 形态纳入，属预期变更）。**漂移归因**：+1 / +3 / +2 均来自 Phase 24 新增的非字段组件（Chart / Menu / Tooltip / Alert），不改变「表单控件公共 props 契约」条件触发结论；详见 [长期任务](./recurring.md) 第 27 轮。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **14 条活跃（< 阈值 20，不蒸馏）**；`pnpm check:distill-archive` → **13 段归档对账通过**。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard` R1 `Reject` → R2 delta `quick` `Pass`**；结论与 findings 见[归档批次记录](../design/governance/2026-10-21-phase25-archive.md) §5。

---

## Phase 26：1.0 发布前收尾：冻结面、行为收口与发布链路（**2026-11-03 完成并发布 `1.0.0`**）

- 时间：2026-10-22 用户就[第十轮范围评估](../design/governance/2026-10-22-next-stage-scope-evaluation-10.md) §3 裁定「按推荐来」后登记；2026-10-26 执行期追加 M5 插队批次 4 条与 1.0 发布门禁（G0 ~ G4）；2026-11-03 完成并发布 `1.0.0`、阶段归档。
- 范围与授权：取 **A + B + C + D** 四条主线，**5 条主线 / 17 条原子条目**（M1 4 / M2 4 / M3 3 / M4 2 / M5 4）；逐条裁定 **D1 ④**（四条主线全取）/ **D2 ①**（rc → 转正，维持手动）/ **D3 ①**（DataTable 主项 + ①②③ 全做）/ **D4 ①**（`Form` 只评估）/ **D5 ③**（发布时与上一已发布版本做 API 差分）。范围与验收口径的单一事实源见 [Phase 26 登记批次记录](../design/governance/2026-10-22-phase26-registration.md) §1 / §2；执行期追加与门禁见[门禁规划](../design/governance/2026-10-26-phase26-ui-gate-planning.md) §4。
- 执行期插队批次（不占条目计数）：**G1-F** 颜色角色修复（3 项）、**S1** 依赖安全告警清理、**S2** Code Scanning 清理、**S3** 安全告警门禁 CI 接入。
- 非目标：不进入自动发布、不实现 `Form` / RTL / 触摸目标 / 二期语言 / 长尾组件、不做破坏性 API 变更、不引入 Tailwind / UnoCSS、不自动推送。

> 条目级 Review Gate 结论集中于各阶段治理记录（各条目行已给出记录链接），本块不逐条复写计数。

### M1 冻结面终审与 1.x 承诺落地（4 条）

- **M1-1 冻结面清单终审与 1.0 决策记录**（提交 `036babd`；记录见 [M1-1](../design/governance/2026-10-24-phase26-m1-1-freeze-final-review.md)）：token 档位经用户裁定取「全量 146 + 已披露钩子」（有效冻结面 371，2026-10-28 增量后 380）；六类面（组件 props / events / slots、`exports` 13 键、包根导出、token、10 语 locale、`InputNumber` 的 `step` 语义）与复算命令、例外 / 弃用流程、「最后一破」口径成文；`version-policy` 中英「5 键」改 13 键。
- **M1-2 `Form` / `FormItem` 形态与字段契约影响评估**（提交 `d648fbb`；记录见 [M1-2](../design/governance/2026-10-24-phase26-m1-2-form-field-contract-evaluation.md)）：结论 = 1.x **不扩既有字段契约**，推荐「独立组合层 + 插槽作用域」；12 / 35（交集 8）逐项取证；组型控件需 `aria-labelledby`、`Switch` 无校验态；未实现组件。
- **M1-3 API 表面基线形态评估**（提交 `729488b`；记录见 [M1-3](../design/governance/2026-10-24-phase26-m1-3-api-surface-baseline-evaluation.md)）：推荐 **③ 发布时差分**（对比上一版 `dist/*.d.ts`；删除 / required 收紧 = breaking，类型变化 = warning）；记录 `component-meta.json` 为 gitignored 生成物的限制。
- **M1-4 1.x 承诺载体改写**（提交 `f16f277`；英文链接修正 `e679fd4`）：中英版本策略页改写为「1.x 兼容策略 / 冻结面 / 弃用政策 / 预发布通道 / 例外与流程」，`getting-started` / `README` / `release.md` §1 · §2 · §5 同步；活载体「0.x」关键词回扫为 0。

### M2 行为收口与准破坏性变更（4 条）

- **M2-1 DataTable 全选作用域收口（方案 A）**（提交 `17bf41e`；记录见 [M2](../design/governance/2026-10-24-phase26-m2-behavior-convergence.md) §2 / §5.1）：表头全选只作用当前页，客户端分页保留跨页选择，`lazy` 仍为当前页；`table.selectAll` 10 语改「全选当前页」；中英组件页、迁移表与设计规范 §7 披露。
- **M2-2 `lazy` 跨页选择两侧收敛**（同批 `17bf41e`；记录见 [M2](../design/governance/2026-10-24-phase26-m2-behavior-convergence.md) §3）：受控输入只映射当前页、emit 只含当前页；自持态在 `lazy` 翻页时清空。
- **M2-3 `rowKey` 缺省在 `lazy` 下撞 id**（同批 `17bf41e`；记录见 [M2](../design/governance/2026-10-24-phase26-m2-behavior-convergence.md) §4）：启用选择 / 展开时要求显式 `rowKey`，缺省走 `warnDev`；受控 `expandedRows` 同口径。
- **M2-4 `engines.node` ≥ 22**（提交 `add02bf`；记录见 [M2](../design/governance/2026-10-24-phase26-m2-behavior-convergence.md) §5.1）：`package.json` 与中英 README / 开发指南同步；CI 仍 `lts/*`；1.0 发布说明列为发布前调整。

### M3 发布链路就绪与 1.0 交付（3 条）

- **M3-1 预发布通道与覆盖率前置**（提交 `b8a2086`；记录见 [M3-1](../design/governance/2026-10-26-phase26-m3-1-release-tag-coverage-preflight.md)）：`--tag` 缺省按版本推断、预发布 + `latest` 参数层拒绝；`publish` 强制 dist-tag；`verify` 断言 `dist-tags.<tag>`、latest 不得有预发布、shasum fail-closed；`preflight` 补 `test:coverage` + `check:coverage`。
- **M3-2 1.0.0 CHANGELOG 里程碑段与 Release note**（提交 `318f959` / `cea60bf`；记录见 [M3-2](../design/governance/2026-10-31-phase26-m3-2-1.0.0-release-notes.md)）：里程碑块 / 升级注意 / 已知限制落盘 32 行、锚点全中、不含 rc.1 段；`announce` 从该段生成 Release note。
- **M3-3 1.0 交付执行**（提交 `4fb0c52` / `1967ff7` / `bfe6e3a` / `37ca419`；记录见 [M3-3](../design/governance/2026-11-03-phase26-m3-3-1.0.0-release.md)）：`latest = 1.0.0`、tag `v1.0.0` + GitHub Release（Latest）到位；tarball shasum `67d71348b452…`、包内 README 版本句 = 1.0.0；`exports` 13 键；API 差分（基线 rc.1）0 删除 / 0 重命名；发布前修复 Release note 抽取 fail-open（`4fb0c52`）。

### M4 下游复验与质量确认（2 条）

- **M4-1 下游正向复验**（2026-10-30）：run `41023344064` attempt 2（tag `v1.0.0-rc.1` 触发）success，`dependfix @ a95c1068`，`typecheck` + `build` 绿；attempt 1 为 `minimumReleaseAge` 门槛（非兼容性回归）。
- **M4-2 一期 5 语译文复核状态确认**（2026-11-01 裁定「未复核」；见 [G4 记录](../design/governance/2026-10-31-phase26-g4-rollback-and-known-limitations.md) §3 KL-7）：按「显式声明边界」处置，1.0.0 Release note 保留「文案由 AI 生成，母语审校仍待完成」。

### M5 UI 可用性与示例可访问名（4 条，2026-10-26 插队批次）

- **M5-1 DataTable 横向滚动容器键盘可达**（提交 `d59800a`；记录见 [M5-1](../design/governance/2026-10-27-phase26-m5-1-data-table-keyboard-scroll.md)）：根容器常驻 `tabindex="0"`，有 `caption` 时 `role="group"` + 可访问名，新增焦点环与 375px 键盘滚动 E2E；axe 三档违规 0。
- **M5-2 Select 示例可访问名（中文）**（提交 `013b647`；记录见 [M5-2](../design/governance/2026-10-27-phase26-m5-2-select-example-names-docs-axe.md)）：17 个触发器补 `label`；新增 `check-docs-axe`（5 页矩阵 / 2 条 WCAG 规则 / 抗收窄 / 17 例单测）。
- **M5-3 Select 示例可访问名（英文）**（提交 `b021ccc`；记录见 [M5-3](../design/governance/2026-10-28-phase26-m5-3-select-example-names-en.md)）：17 个英文触发器与中文逐项语义对齐；全矩阵零违规。
- **M5-4 Button hover / active 反馈**（提交 `2b7af3a`；记录见 [M5-4](../design/governance/2026-10-28-phase26-m5-4-button-state-feedback.md)）：状态由既有 token 经 `color-mix()` 派生（不新增冻结 token）；36 条状态采样 + 三态不变量；默认预设亮暗最低 4.829；视觉基线 0 差异。

### 执行期插队批次（不占条目计数）

- **G1-F 颜色角色修复**（提交 `5c260a2` / `a0e82ba`；记录见 [G1-F](../design/governance/2026-10-28-phase26-g1-f-color-role-fix.md)）：新增 `--caomei-color-<tone>-text` 与 `--caomei-color-control-border`；6 预设 × 明暗文本 / 控件边界矩阵纳入常驻回归；`capture:styles` 与视觉基线按实际差异重冻结。
- **S1 依赖安全告警清理**（提交 `f9aeb43` / `c0c8e6d`；记录见 [S1](../design/governance/2026-10-28-phase26-s1-dependency-alerts-remediation.md)）：15 项开发作用域告警在 lockfile 解析层清零；`nuxt` 4.6.3 / `vitest` 4.1.12；`deepmerge` low 无补丁留痕。
- **S2 Code Scanning 清理**（提交 `991330d` / `5146d71` / `6a46098`；记录见 [S2](../design/governance/2026-10-28-phase26-s2-code-scanning-remediation.md)）：5 项告警（3 high 脚本规则 + 2 medium CI 权限）修复；`test.yml` 补最小 `permissions`。
- **S3 安全告警门禁 CI 接入**（提交 `0dfff98` / `34084cf` / `af72b2a`；记录见 [S3](../design/governance/2026-10-29-phase26-s3-security-alert-gate-ci.md)）：`check-security-alerts` + `Security Alerts` workflow（`SECURITY_ALERTS_TOKEN`）；安全规范 §2.1 与发布指南同步。
- **G0 ~ G4 门禁**：G0（M5 收口自检，2026-10-28）/ G1（裁定「修复」）/ G1-F / G2（质量门，2026-10-28）/ G3（rc.1 与下游，2026-10-30）/ G4（发布证据与授权，2026-11-03）全部通过；口径见[门禁规划](../design/governance/2026-10-26-phase26-ui-gate-planning.md) §4。

### 阶段总结

- **5 条主线 / 17 条原子条目全部交付**，另完成 G1-F / S1 / S2 / S3 四个插队批次与 G0 ~ G4 门禁。
- **发布**：`1.0.0` 于 2026-11-03 发布（`latest`），tag `v1.0.0` 与 GitHub Release（Latest）到位；tarball README 版本句 = `1.0.0`；API 差分 0 删除 / 0 重命名。
- **新增 / 强化装置**：冻结面清单与 token 复算、发布时 API 差分、`--tag` 预发布通道、`check:coverage` 前置、`check-docs-axe`、颜色角色对比度矩阵、`check-security-alerts` 门禁、DataTable 键盘滚动 E2E。
- **提交对账**：`git log --oneline 10de6e8^..37ca419 --no-merges | wc -l` → **56**（下界 = 登记提交 `10de6e8` 的父提交 `51f00bc`，上界 = 本阶段治理收口提交 `37ca419`）；构成 = 条目行 **28** + 门禁 / 规划 / 发布记录与收口 **28**（含 `10de6e8` / `37ca419`）。**归档批次自身提交不计入上式**。

### 回扫口径（三段式）

- **机检面**：归档后 `pnpm governance:check`（含 `check-governance-records` / `check-governance-counts` / `check:candidate-anchors` / `check:planning-numbers`）与 `pnpm docs:check` 全绿。
- **人工面**：Phase 26 各治理记录对 `todo.md` 的引用按「点时记录保持原样」处置；逐条核对 M1-1 ~ M1-4、M2、M3-1 ~ M3-3、M4-2、M5-1 ~ M5-4、G1-F、S1 ~ S3 的回链。
- **未处理面**：历史记录内「阶段限定 + 复用编号」类散文指针不回改（边界见 [M3-5 记录](../design/governance/2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)）。

### 长期任务

- **第 28 轮门槛复核**（2026-11-03，Phase 26 收口 / 1.0.0 发布后）：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 **5 项维持**。证据：`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 `:aria-label="label"` 0 / 继承契约 12 / 含内联同名字段 35 / `useFocusControl` 4 / `useAttrs()` 13（与第 27 轮逐项一致）；§2.2 `field-shell-overlap.mjs`：`input 0 / textarea 1 / input-number 0 / tags-input 16`、四组件共有声明 0；`capture:styles` 349 项 0 差异。详见[长期任务](./recurring.md) 第 28 轮。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → 活跃条目 14（< 阈值 20，不蒸馏）；`check:distill-archive` 通过。

### 遗留与后续候选

- **已知限制**（对外披露见 1.0.0 Release note）：品牌预设 `-solid` 对比度缺口、Calendar / RichTextEditor 交互边界 < 3:1、回归仅 Chromium、禁用态豁免、视觉快照容差、消费方覆盖 token 后的对比度责任、一期 5 语未复核（KL-1 ~ KL-7）。
- **发布后遗留已处置**：`next` 通道评估后**维持 `1.0.0-rc.1`**（1.x 暂无预发布计划，下一预发布时前移）；README 中英预发布声明改为「1.0 起默认 `latest`，预发布经 `next` 取回」。
- **后续候选**：PrimeVue 迁移经验回收与指南完善（Backlog §1.8）、`mobile-320` DatePicker 纵向滚动口径（已按矩阵 #6 判定为非缺陷，断言已修）、归档载体行数再评估；其余见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

- 经 `@code-reviewer` Review Gate **单分区 `standard`**；结论与复查基线见[归档批次记录](../design/governance/2026-11-03-phase26-archive.md) §6。

## Phase 27：移动端密度轴、`Form` 组合层、迁移护航、机制收口与 CI 发布（**2026-11-06 完成并发布 `1.1.0`**）

- 时间：2026-11-03 用户就[第十一轮范围评估](../design/governance/2026-11-03-next-stage-scope-evaluation-11.md) §3 裁定后登记，同日执行期追加 CI 发布链路；2026-11-06 交付 **6 条主线 / 18 条原子条目**，发布 `1.1.0` 并完成阶段归档（用户指令「发布成功，请开始对相应待办进行收尾」）。
- 范围与授权：取 **A + B + C + D + E** + 执行期追加 **F CI 发布链路**，构成对账 **4 + 2 + 2 + 4 + 1 + 5 = 18**。逐条裁定——**D1** ① 五条主线全取；**D2** ① 密度轴 + P0；**D3** ① 本阶段实现；**D4** ① 阶段末发 `1.1.0`；**D5** ① 国际化二期 / RTL 维持范围外；执行期 **D6** CI 发布触发模型 = `workflow_dispatch`（2026-11-06 简化为 semantic-release 直连 + OIDC，无 `environment` 审批 / `dry_run` / `NPM_TOKEN`，见[简化记录](../design/governance/2026-11-06-phase27-release-workflow-oidc-simplification.md)）。范围与验收口径的单一事实源见 [Phase 27 登记批次记录](../design/governance/2026-11-03-phase27-registration.md) §1 / §2。
- 非目标：P1 / P2 命中区、RTL、二期语言、长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker）、`Form` rules 引擎、push 触发自动发布、`next` 预发布分支、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook、除 CI 发布提交与 tag 外不自动推送。

### M1 移动端与响应式二期（4 条）

- **M1-1 `data-density="touch"` 轴**：控件高度 36 / 44 / 52、字号 14 / 16 / 18、内容宽度上限 `none`；与预设 / 明暗正交，缺省路径零变化（提交 `1fcd32c`）。
- **M1-2 `--caomei-hit-target-min` P0 命中区**：值片删除 / 清空 / 密码 / Tag / Message 共 **37** 个目标，`::after` 扩到 ≥24×24，按钮视觉盒不变；多行值片行距 +2px（提交 `88bf50b`）。
- **M1-3 常驻回归与视觉基线**：390 / 768 / 1280 三档密度轴与命中区用例 + 视觉受检面扩入三个多值字段与 `#hit-target`，基线重冻结（提交 `3529475`）。
- **M1-4 指南与设计口径同步**：响应式设计 / 移动端指南（中英）/ 组件页密度节 / 计数与冻结面回扫（含 token 380 → 381），关闭三处旧心智表述（提交 `a195abe`）。

### M2 `Form` / `FormItem` 组合层（2 条）

- **M2-1 实现与单测**：独立组合层 + 插槽作用域（`id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`）；12 个字段组件逐项绑定；无 rules 引擎，不扩既有字段契约（提交 `b5496ef`）。
- **M2-2 文档、示例与计数回扫**：中英组件页 / 示例 / E2E / 组件总览 · 画廊 · locale 台账 · API 基线；「含内联同名字段」32 → 36（+`form/types.ts`；`Form` 为独立组合层、不继承字段契约，条件触发结论不变）（提交 `d6ae100`）。

### M3 下游迁移护航（2 条）

- **M3-1 PrimeVue 迁移经验回收**：指南「常见陷阱」「迁移后自检」「逐组件对照入口」补 Tooltip 行与直接替换 / 桥接策略，缺口分类登记（提交 `09cdde6`、`138a3d0`）。
- **M3-2 1.0 升级护航**：下游版本快照、跨 minor 升级注意与对外 7 条（6 已知限制 + 1 升级注意）转指南，momei 反馈边界声明（提交 `d448de8`）。

### M4 机制与质量收口（4 条）

- **M4-1 API 表面差分接入发布链**：`diff-api.mjs` 入 `manual-release.mjs`；删除 / 重命名 / required 收紧判 breaking，新增不阻断（提交 `6f60021`、`f39f613`）。
- **M4-2 品牌预设 `-solid` 对比度治理**：`-solid` 配对（默认 / hover / active）纳入常驻断言面（6 预设 × 明暗 × 2 背景）；`momei` success 三态与 `caomei` `primary-solid` 维持既有品牌裁定（提交 `6bb250d`）。
- **M4-3 阶段构成计数跨载体机检**：覆盖 `todo.md` 口径句 / 条目表与 `roadmap.md` §1 当前态句 / 阶段表行，带负向对照与受检面下界（提交 `d74aafa`）。
- **M4-4 依赖告警收口**：`minimatch` medium 覆盖评估与 `deepmerge` low 留痕，不阻塞 1.1.0 发布（提交 `37fbcae`）。

### M5 发布收口（1 条）

- **M5-1 `1.1.0` 经 CI 发布**：`Release` run [`42249119570`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/42249119570) **success**——semantic-release 直连 + npm Trusted Publishing（provenance 签名），`dist-tags.latest = 1.1.0`；tag `v1.1.0` / GitHub Release / 回推提交 `66e94fa` 到位；tarball `shasum 87cedc9…`、`exports` 13、解包 README 版本句 = 1.1.0；下游复验 run [`42251067161`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/42251067161) 全绿（`dependfix @ ad592c92…`）。证据见 [M5-1 记录](../design/governance/2026-11-07-phase27-m5-1-1.1.0-release.md) §2 / §3。

### M6 CI 发布链路（5 条）

- **M6-1 工作流接线与凭据**：`release.yml` 直接调用 `pnpm release`；npm OIDC（`id-token: write`，无 `NPM_TOKEN`）、GitHub `GITHUB_TOKEN` 回推；`concurrency` 固定 group 串行；首个真实 run 取证通过（提交 `da35a0e`；2026-11-06 简化 `44231bb`）。
- **M6-2 版本句与发布说明同步**：`@semantic-release/exec` 在 npm bump 后、git 提交前同步 README 中英 + roadmap 版本句，里程碑段注入；发布后 `docs:check:version` 绿（提交 `b3e6471`）。
- **M6-3 前置门禁**：publish 前安全告警门禁 + `pnpm verify` + 覆盖率门禁；1.1.0 run 中全部通过，失败即中止（提交 `f9a30be`）。
- **M6-4 事件链与下游复验**：`GITHUB_TOKEN` 事件排除 → 显式 `workflow_dispatch`；**运行时补口**——首次自动 dispatch 因 npm 传播延迟报 `ERR_PNPM_NO_MATCHING_VERSION`，已在 dispatch 前加入版本可见性轮询（600s 预算），重跑全绿（提交 `95010cb` + 收尾批次）。
- **M6-5 `CHANGELOG` 生成器健壮性**：空 `# Unreleased` 段、无 remote 降级、语言源自 root（提交 `d6e9a64`）。

### 阶段总结

- **提交**：阶段登记 → `1.1.0` 发布共 **28** 个提交（`git log --oneline 2515e7a^..66e94fa | wc -l`）；收口批次提交另计。
- **质量门**：`pnpm verify` exit 0；`test:e2e` **466 passed / 4 skipped**；`test:visual` **38 passed**（字体确定化后，含 / 不含 `fonts-noto-cjk` 均绿）；`docs:check:version` / `lint:md:check` / `governance:check` exit 0。
- **长期任务**：阶段收口 / 发布后触发**第 30 轮**门槛复核——待执行批次 **0 项**；条件触发 **1 项维持**；计数无漂移；证据见[长期任务](./recurring.md) §3 第 30 轮。
- **wisdom 蒸馏**：**19 条活跃条目**（阈值 20，未达阈值、不蒸馏；`pnpm distill:wisdom --check` → `WISDOM_OK`）。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**；结论见 [M5-1 记录](../design/governance/2026-11-07-phase27-m5-1-1.1.0-release.md) §7。
- **已知观察**：① npm publish 成功到 registry 可解析存在分钟级延迟（1.1.0 约 3 分钟），已由发布链轮询承接；② 下游兼容检查仍只覆盖 `dependfix` 的 `typecheck` + `build`；③ `next` 通道未启用，预发布继续走本地 `pnpm release:manual --tag=next`；④ 1.1.0 里程碑的旧发布流文案已订正（`CHANGELOG` / GitHub Release body / `docs/release-notes/1.1.0.md`）。
- **后续候选**：见 [Backlog](./backlog.md)（含下游 compat 实际安装版本断言、`conventional-changelog` 8 升级等）。

## Phase 28：caomei-auth 迁移反馈收口与图标体系调研（**2026-11-08 完成并发布 `1.2.0`**）

- 时间：2026-11-07 用户就[第十二轮范围评估](../design/governance/2026-11-07-next-stage-scope-evaluation-12.md) §3 裁定后登记；2026-11-08 交付 **5 条主线 / 8 条原子条目**，发布 `1.2.0` 并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取 **A + B + C + D + F**（E 质量收口小项不纳入），构成对账 **2 + 2 + 2 + 1 + 1 = 8**；逐条裁定 **D1** ② A + B + C + D + F、**D2** ① 先 `range`、**D3** ① 逐语气 token + 文档、**D4** ① 密度 token + 选择列宽度 token + 文档、**D5** ① 图标调研 = 选型对比 + 接口草案 + Backlog 拆分。范围与验收口径的单一事实源见 [Phase 28 登记批次记录](../design/governance/2026-11-07-phase28-registration.md) §1 / §2。
- 非目标：`DatePicker.multiple`、触摸目标 P1 / P2、图标实现、RTL / 二期语言、长尾组件、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook、自动推送。

### M1 DatePicker 范围选择（2 条）

- **M1-1 `selectionMode="range"` 实现与单测**：`[Date, Date]` 闭区间、半开不写回、清空 / 键盘 / 可访问名；`single` 缺省路径逐值不变；48 例单测（提交 `41b113e`；[M1-1 记录](../design/governance/2026-11-07-phase28-m1-1-datetime-range-design.md)）。RG：R2 Pass（0 blocker / 4 warning / 3 suggest）。
- **M1-2 文档 / 示例 / E2E / 视觉与 API 基线**：中英组件页、range 示例、E2E、区间面板基线（38 → 40）、API 与冻结面增量；顺带修复触发器 id 悬空与面板命名（提交 `2e9a814`、`445af3c`；[M1-2 记录](../design/governance/2026-11-07-phase28-m1-2-datepicker-range-docs-baseline.md)）。RG：R2 Pass（0 blocker / 2 warning / 4 suggest）。

### M2 Toast 逐语气样式（2 条）

- **M2-1 逐语气 token**：16 个 `--caomei-toast-{tone}-{bg|border|text|shadow}` 钩子，默认回退全局 token、零视觉变化；4 语气覆盖采样 + 对比度 E2E（提交 `51d8494`；[M2-1 记录](../design/governance/2026-11-07-phase28-m2-1-toast-tone-tokens.md)）。RG：R3 Pass（0 blocker / 0 warning / 2 suggest）。
- **M2-2 文档与迁移配方**：中英组件页钩子表 +「接受默认 / 薄封装 / token 覆盖」三路径；token 冻结面 405（提交 `eb364b9`；[M2-2 记录](../design/governance/2026-11-07-phase28-m2-2-toast-docs-recipes.md)）。RG：R1 Pass（0 blocker / 1 warning / 4 suggest）。

### M3 DataTable 迁移适配（2 条）

- **M3-1 密度与选择列宽度 token**：4 个钩子（单元格 padding / 选择列宽度 / 选择行内距），默认值 = 现值；采样扩面；不新增 `size` prop（提交 `5cd24da`；[M3-1 记录](../design/governance/2026-11-07-phase28-m3-1-data-table-density-tokens.md)）。RG：R2 Pass（0 blocker / 0 warning / 2 suggest）。
- **M3-2 文档与确认项**：DataTable 密度 / 选择列配方、Paginator 自渲染报表示例、全选作用域确认、迁移指南同步（提交 `a19b3f1`；[M3-2 记录](../design/governance/2026-11-07-phase28-m3-2-datatable-paginator-docs.md)）。RG：R2 Pass（0 blocker / 0 warning / 0 suggest）。

### M4 图标体系调研（1 条）

- **M4-1 图标体系调研**：三态接入接口草案、25 导入文件 / 22 图标映射、样式 token、运行时 vs 构建期、下游迁移；零实现 / 零依赖；Backlog §1.9 I1 ~ I5（提交 `13c2adb`；[M4-1 记录](../design/governance/2026-11-07-phase28-m4-1-icon-system-research.md)）。RG：R2 Pass（0 blocker / 0 warning / 2 suggest）。

### M5 发布收口（1 条）

- **M5-1 `1.2.0` 经 CI 发布**：`Release` run [`42440852062`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/42440852062) **success**——semantic-release + npm OIDC；`dist-tags.latest = 1.2.0`、tag `v1.2.0` / GitHub Release / 回推 `0ced91e`；tarball `shasum 06cd70f7…`、`exports` 13、解包 README = 1.2.0；下游 run [`42441345211`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/42441345211) success（dependfix @ `208bb579…`）。发布记录见 [M5-1 记录](../design/governance/2026-11-08-phase28-m5-1-1.2.0-release.md) §2 / §3（提交 `0ced91e`、`ac0f2f6`）。RG：R2 Pass（0 blocker / 0 warning / 1 suggest）。

### 阶段总结

- **提交**：阶段登记 `81a71cb` → 发布回推 `0ced91e` → 收口 `ac0f2f6`；条目提交 `41b113e` / `2e9a814` / `445af3c` / `51d8494` / `eb364b9` / `5cd24da` / `a19b3f1` / `13c2adb`。
- **质量门**：`pnpm verify` exit 0（152 文件 / 2983 例）；`test:a11y` 68；`test:e2e` 484 passed / 4 skipped；`test:visual` 40；`capture:styles` 386 项 0 差异；覆盖率 93.16 / 86.30 / 94.83 / 92.51；发布后 Test / Docs / Security / TODO 全绿。
- **长期任务**：阶段收口 / 发布前触发**第 31 轮**门槛复核（2026-11-08）——待执行批次 **0**；条件触发 **1 项维持**；`capture:styles` 386 项 0 差异；`useAttrs()` 13 → 14 归因于 `calendar-range-panel.vue`；证据见 [长期任务](./recurring.md) §3 第 31 轮。
- **wisdom 蒸馏**：见[归档批次记录](../design/governance/2026-11-08-phase28-archive.md) §3 / §4。
- **归档批次审计**：经 `@code-reviewer` Review Gate `standard`；结论见[归档批次记录](../design/governance/2026-11-08-phase28-archive.md) §5。
- **已知观察**：① `DatePicker` 的 `v-model` 静态类型扩为 `Date | [Date, Date] | null`，单日期消费方需放宽绑定类型（类型级迁移、运行时无破坏，已入 `version-policy`）；② 范围模式不支持 `showTime` / `showSeconds` / `hourFormat`；③ 图标体系仅调研，`CaomeiIcon` 适配层与映射未实现；④ 安全告警 low 1（open 1 / dismissed 0），无 critical / high，未阻塞发布；⑤ `next` 通道未启用，CI 只发 `latest`。
- **后续候选**：图标 I1 ~ I5（[Backlog](./backlog.md) §1.9）、动效 A1 ~ A8（§1.10）、Paginator 每页选择器尺寸对齐（§1.1）。

## Phase 29：动效体系与图标体系落地（**2026-11-09 完成并归档；本阶段不发布**）

- 时间：2026-11-08 用户就[第十三轮范围评估](../design/governance/2026-11-08-next-stage-scope-evaluation-13.md) §3 裁定 D1 ② / D2 ① / D3 ① / D4 ① / D5 ② 后登记；2026-11-09 交付 **6 条主线 / 8 条原子条目**并完成阶段归档（用户指令「开始阶段收口」）。
- 范围与授权：取 **动效 A1 + A2 + A3 + A8 + 图标 I1 ~ I3（含 I4 文档面）+ Paginator 尺寸**，构成对账 **1 + 1 + 1 + 3 + 1 + 1 = 8**；D2 ① 正交 `data-motion="expressive"` + 克制强度、D3 ① 图标三态 + 映射 + token、D4 ① 高度 + 宽度（不含圆角）、D5 ② **本阶段不发布**（`latest` 维持 `1.2.0`）。范围与验收口径的单一事实源见[Phase 29 登记批次记录](../design/governance/2026-11-08-phase29-registration.md) §1 / §2。
- 非目标：动效 A4 ~ A7（表单 / 布局 / 选择器 / 数据展示）、图标 I5 运行时 peer、触摸目标 P1 / P2、RTL / 二期语言、长尾组件、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook；不发布、不推送。

### M1 动效基础层（1 条）

- **M1-1 motion tokens 与 `data-motion` 轴**：13 个 `--caomei-motion-*`（6 duration / 4 easing / 3 distance · scale），`minimal` 逐值等价、`expressive` 覆盖、`reduce` 压平；81 处裸时长迁移；新增 `check-motion-contract` 守卫 + 契约 / E2E 测试（提交 `076eb15`；[M1-1 记录](../design/governance/2026-11-08-phase29-m1-1-motion-foundation.md)）。RG：R1 Pass → R2 Pass。`capture:styles` 0 差异、视觉 40、E2E 27、全量 3010。

### M2 反馈与浮层动效（1 条）

- **M2-1 Dialog / ConfirmDialog / Popover / DropdownMenu / Tooltip / Toast / Message / Alert**：expressive 下进出场、退场 DOM 保留与焦点回归、Toast 延迟移除；`overlay-motion` E2E 39 例（提交 `bf32784`；[M2-1 记录](../design/governance/2026-11-08-phase29-m2-1-overlay-motion.md)）。RG：R1 Pass → R2 Pass。

### M3 导航与操作动效（1 条）

- **M3-1 Tabs / Accordion / Menu / Breadcrumb / Stepper / Toolbar / Button 族**：expressive 下内容淡入、高度动画、抬升与按压缩放；ButtonGroup 重置、SplitButton chevron；`navigation-motion` E2E 30 例（提交 `ee74dbf`；[M3-1 记录](../design/governance/2026-11-08-phase29-m3-1-navigation-motion.md)）。RG：R1 Reject → R2 Pass。**后续收敛**：按人工复核意见取消 Button / Toolbar 悬浮位移，仅保留按压缩放（见 M6 段）。

### M4 图标体系（3 条）

- **M4-1 `CaomeiIcon` 三态与可访问名**：`icon` / `name` / registry、`provideIconRegistry`（SSR 隔离）、`label` > 透传 a11y > 默认 `aria-hidden`；包根导出 333 → 338（提交 `d7b2c50`；[M4-1 记录](../design/governance/2026-11-08-phase29-m4-1-icon-adapter.md)）。RG：R1 Reject → R2 Pass。
- **M4-2 内置图标映射与覆盖入口**：22 个语义键收敛到 `src/icons/internal-icons.ts`，25 个组件移除 `@lucide/vue` 直接导入；`provideIconOverrides`（对象 / ref / getter，SSR 隔离）；包根导出 338 → 345（提交 `129758d`；[M4-2 记录](../design/governance/2026-11-08-phase29-m4-2-icon-mapping.md)）。RG：R1 Pass → R2 Pass。
- **M4-3 图标样式 token 与迁移文档**：`--caomei-icon-size-{sm,md,lg}` + `--caomei-icon-stroke-width`，`size="sm|md|lg"` 档位；默认线宽仅作用于 Lucide；中英图标页补样式定制 / 构建期接入 / PrimeIcons 映射；冻结面 425 → 429（提交 `cb7caed`；[M4-3 记录](../design/governance/2026-11-08-phase29-m4-3-icon-tokens.md)）。RG：R1 `standard` Pass（超时 3 分钟）→ R2 `quick` Pass。

### M5 Paginator 尺寸对齐（1 条）

- **M5-1 每页条数选择器尺寸**：高度统一到 `--caomei-paginator-control-size`（默认 / touch 均 32px）、默认宽度 6rem → 5rem、3 位数不裁切；新增亮 / 暗视觉基线（提交 `2ef42ab`；[M5-1 记录](../design/governance/2026-11-08-phase29-m5-1-paginator-sizing.md)）。RG：R1 Pass → R2 Reject（`.session` 状态口径 / 视觉下界，已修）→ R3 Pass。

### M6 动效验收与人工复核（1 条）

- **验收装置与 L1 ~ L4 矩阵**：`test/e2e/helpers/motion.ts`（有界帧轮询 + `pause()` + `currentTime`，无 `sleep`）+ `motion-acceptance.e2e.ts`（9 例 × 3 project = 27）；`check-motion-contract` 扩布局属性白名单（21 → 35 单测）；`theming.md` §5.3 补验收分层与示例；长任务 2 条 / 最大 66ms（提交 `4c28ad7` / `91d3948` / `22a0cd3`；[验收记录](../design/governance/2026-11-09-phase29-m6-1-motion-acceptance.md)）。RG：R1 `standard` Pass（5 warning / 7 suggest）→ R2 `quick` Pass。
- **人工复核反馈修复**：文档站 VitePress 全局 `prefers-reduced-motion` 压平归因（非缺陷）；修复面包屑首项 4px 错位与子菜单触发器缺菜单项样式（宿主 `li + li` / `a` 规则 + 跨组件 scoped 不命中）；新增 `component-alignment` E2E 9 例（提交 `e042c68` / `d49ca39` / `e221abe`；[修复记录](../design/governance/2026-11-09-phase29-m6-1-review-fixes.md)）。RG：R1 Reject → R2 Reject → R3 Pass → R4 Pass。
- **独立审查页与悬浮位移收敛**：`pnpm review:motion`（开发态，尊重系统 reduce）+ `pnpm review:build`（IIFE 内联单文件，file:// 可运行，审查用途忽略 reduce，自动演示）；Button / Toolbar 悬浮位移 4px → 1px → 取消（按压缩放 0.98 保留、220ms 过渡，CDP 断言），消费面维持 455 / 139 / 25（提交 `28096fd` / `8a05e76` / `6f39ea3` / `137865e`）。RG：R5 `quick` Pass；R6 `quick` Reject（计数不可复现）→ R7 `quick` Pass。
- **人工复核签字**：2026-11-09 用户确认动画效果并同意标记完成；五项清单通过，320 / 768 未单独目视（几何由响应式矩阵覆盖），reduce 人工面以 DevTools + 开发态页为准（提交 `4522442`）。RG：R1 Reject（旧状态残留）→ R2 Pass。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` 495 个 md 历史规划指针无失效、55 条索引结论指针章节号一致；`check-links` 498 个 md 本地链接全部有效。
- **人工面**：`todo.md` / `roadmap.md` / `archive/index.md` / `recurring.md` / 治理索引逐处改指，无遗留进行中或归档待指令表述。
- **未处理面**：无；历史「阶段限定 + 复用编号」边界沿用既有登记，不在本批扩面。

### 阶段总结

- **提交**：登记 `2d98cee` → `076eb15` / `bf32784` / `ee74dbf` / `2ef42ab` / `d7b2c50` / `129758d` / `cb7caed` → M6-1 `4c28ad7` / `91d3948` / `22a0cd3` / `e042c68` / `d49ca39` / `e221abe` / `28096fd` / `8a05e76` / `6f39ea3` / `137865e` / `4522442`。
- **质量门**：`pnpm verify` exit 0（158 文件 / **3062 例**）；`capture:styles` **386 项 0 差异**；`test:visual` **42 passed**；定向 E2E：`motion-acceptance` 27、`navigation-motion` 30、`component-alignment` 9、`overlay-motion` 39（Chromium）；`pnpm build && pnpm check:build` 通过；文档站与治理链全绿。
- **长期任务**：阶段收口触发**第 32 轮**门槛复核（2026-11-09）——待执行批次 **0 项维持**；条件触发 **1 项维持**（表单控件公共 props 契约）；已判定不纳入 **5 项维持**；证据：`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 `:aria-label` 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14；数值钳位 2 处；§2.2 四组件共有声明 **0**，`tags-input` shell 声明 16 → **17**（+1 = Phase 29 M1-1 补齐的 reduce `transition: none`，非重复面）；`capture:styles` 386 项 0 差异。见[长期任务](./recurring.md) §3 第 32 轮。
- **wisdom 蒸馏**：新增 4 条可复用发现（文档站 reduce 压平归因 / scoped keyframes 哈希名 / 宿主 `li + li` 级联 / 确定性采样装置），活跃 4 条 < 20 阈值，未触发蒸馏；详见[归档批次记录](../design/governance/2026-11-09-phase29-archive.md) §3。
- **归档批次审计**：经 `@code-reviewer` Review Gate `standard`；结论见归档批次记录 §5。
- **已知观察**：① 本阶段**不发布**，`latest` 维持 `1.2.0`，未推送；② 图标 token 冻结面 429 → 430（`--caomei-menu-item-hover-color`），包根导出 345；③ 文档站 reduce 下仍按 VitePress 全局规则压平（无障碍行为），目视审查改用独立页面；单文件与录屏在 `artifacts/`（gitignored）；④ Chromium 单浏览器覆盖，Firefox / WebKit 未复跑。
- **后续候选**：动效 A4 ~ A7（[Backlog](./backlog.md) §1.10）、图标 I5（§1.9）、触摸目标 P1 / P2、RTL / 二期语言、长尾组件。
