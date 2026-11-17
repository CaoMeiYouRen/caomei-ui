# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

> **主窗口口径（2026-11-18 更新）**：主窗口只保留**归档索引**（Phase 0 ~ Phase 30，逐阶段一行摘要 + 深度归档链接）与**近线阶段窗口**（**当前为 Phase 31 ~ Phase 36 共 6 块**，目标窗口 5 个；`docs:check:line-count` 读数 362 行，未越 warn 400，按「迁移触发 = 越过阈值」暂不迁出）；更早阶段的完整归档块迁入**深度归档**目录 [`archive/`](./archive/)，收录范围分别为 [phase-00-06.md](./archive/phase-00-06.md)（Phase 0 ~ 6）、[phase-07-12.md](./archive/phase-07-12.md)（Phase 7 第一阶段 ~ Phase 12）、[phase-13-17.md](./archive/phase-13-17.md)（Phase 13 ~ 17）、[phase-18.md](./archive/phase-18.md)（Phase 18）、[phase-19.md](./archive/phase-19.md)（Phase 19）、[phase-20.md](./archive/phase-20.md)（Phase 20）、[phase-21.md](./archive/phase-21.md)（Phase 21）、[phase-22.md](./archive/phase-22.md)（Phase 22）、[phase-23.md](./archive/phase-23.md)（Phase 23）、[phase-24.md](./archive/phase-24.md)（Phase 24）、[phase-25.md](./archive/phase-25.md)（Phase 25）、[phase-26.md](./archive/phase-26.md)（Phase 26）、[phase-27.md](./archive/phase-27.md)（Phase 27）、[phase-28.md](./archive/phase-28.md)（Phase 28）、[phase-29.md](./archive/phase-29.md)（Phase 29）、[phase-30.md](./archive/phase-30.md)（Phase 30）。**主窗口累计超过 `docs:check:line-count` 的 warn 阈值（400 行）时，把最早的阶段块迁入深度归档（链接深度机械调整，另含同目录 `./` → `../` 修正，正文不改写）**；该阈值由 `docs:check:line-count` 驱动——2026-11-15 Phase 34 入窗后 **397 行**；2026-11-16 Phase 35 入窗并迁出 Phase 28 ~ Phase 30 后 **311 行**（`docs:check:line-count` 值）。**深度归档不改变权威**：阶段交付的权威记录仍是各阶段治理记录（见[治理索引](../design/governance/index.md)），深度归档只保存主窗口迁出的原始正文。

## 归档格式

每个阶段归档块应包含：

- 阶段名称与时间；
- 交付内容与提交记录；
- 质量门结果（lint / typecheck / test / build）；
- 审计结论（Pass / Reject 及修复情况）；
- 遗留问题与后续候选。

深度归档文件沿用同一格式（只做链接深度 `../` → `../../` 与同目录 `./` → `../` 的机械调整，正文不改写）。

---

## 归档索引（Phase 0 ~ Phase 30）

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
| Phase 24 | 2026-10-13 ~ 11-03 | 机制远端生效与判别力收口、CI 环境治理、治理装置与规划载体补口、组件缺口补齐、图表能力：视觉基线阻断远端复核、下游兼容检查负向判别力、暂存区卫生 / 归档 RG 计数 / 取证命令守卫扩面、Row · Col / Tooltip / Menu · Breadcrumb / Alert、图表封装与主题联动 | [phase-24](./archive/phase-24.md) |
| Phase 25 | 2026-10-16 ~ 10-21 | 归档载体收口、移动端与响应式优化、国际化一期（5 语）、0.7.0 发布收口 | [phase-25](./archive/phase-25.md) |
| Phase 26 | 2026-10-22 ~ 11-03 | 1.0 发布前收尾：冻结面终审与 1.x 承诺、行为收口与准破坏性变更、发布链路就绪与 `1.0.0` 交付、下游复验、UI 可用性与示例可访问名 | [phase-26](./archive/phase-26.md) |
| Phase 27 | 2026-11-03 ~ 11-06 | 移动端密度轴、`Form` 组合层、迁移护航、机制收口与 CI 发布：0.7 → 1.1.0 的发布链路统一与下游复验 | [phase-27](./archive/phase-27.md) |
| Phase 28 | 2026-11-07 ~ 11-08 | caomei-auth 迁移反馈收口与图标体系调研：DatePicker `range`、Toast 逐语气 token、DataTable 密度 / 选择列宽度 token、图标体系调研（零实现）、`1.2.0` 发布 | [phase-28](./archive/phase-28.md) |
| Phase 29 | 2026-11-08 ~ 11-09 | 动效体系与图标体系落地：motion tokens 与 `data-motion`、反馈 / 浮层 / 导航动效、`CaomeiIcon` 三态与映射、Paginator 尺寸（不发布） | [phase-29](./archive/phase-29.md) |
| Phase 30 | 2026-11-10 ~ 11-11 | 表单 / 布局 / 选择器动效、触摸目标 P1（17 个控件 ≥24×24 命中区）、`check-stage-counts` 无阶段交叉校验（不发布） | [phase-30](./archive/phase-30.md) |

---

## Phase 31：下游兼容扩容、数据展示动效与依赖卫生（**2026-11-12 完成并归档；本阶段不发布**）

- 时间：2026-11-12 用户就[下一阶段范围评估（第十五轮）](../design/governance/2026-11-12-next-stage-scope-evaluation-15.md) §3 裁定 D0 ① / D1 ① / D2 ② / D3 ① / D4 ① / D5 ① 后登记；同日交付 **5 条主线 / 6 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取**全量组合**（D1 ①）——下游兼容扩容 **1** / 实际安装版本断言 **1** / 数据展示动效 A7 **1** / 触摸目标 P2 **1** / 依赖 PR 卫生 **2**；构成对账 **1 + 1 + 1 + 1 + 2 = 6**。**本阶段不发布**（D2 ②）：`latest` 维持 `1.2.0`，未执行 `pnpm release`、未触发 Release workflow。范围与验收口径的单一事实源见[Phase 31 登记批次记录](../design/governance/2026-11-12-phase31-registration.md) §1 / §2。
- 非目标：发布；`reka-ui` 2.11.0 适配（D5 ① 之外，评估后登记 Backlog）；RTL / 国际化二期；长尾组件；破坏性 API 变更；Tailwind / UnoCSS；文档站多版本托管；Storybook；新增运行时依赖。

### M1 下游兼容扩容（1 条）

- **M1-1 下游兼容矩阵扩容**（提交 `1ec8464`（PR #51）；真实 run `43211984429`；记录见 [M1-1 / M2-1](../design/governance/2026-11-12-phase31-m1-1-m2-1-downstream-compat.md)）：`downstream-compat.yml` 受检矩阵新增 `caomei-auth` / `momei`，按仓配置 `setup` 与 `timeout-minutes`；中英发布指南 §10 同步三仓清单。真实 `workflow_dispatch` 三仓（`dependfix` / `caomei-auth` / `momei`）**全部 success**，被测 `1.2.0`，首跑约 3 分钟。工作流按「触及构建面走分支 + PR」合并。RG 登记批次 R1 / R2 `Reject` → R3 `Pass`；记录批次 R1 `Reject` → R2 `Pass`。

### M2 实际安装版本断言（1 条）

- **M2-1 override 后 fail-closed 断言**（同上提交与记录）：override 且构建链 setup 完成后读取目标包 `node_modules/caomei-ui/package.json`，与目标版本不一致即失败，结果写入 job summary；真实 run 未触发 fail-closed（三仓 `installed caomei-ui 1.2.0`）。本地正负例覆盖根包与 workspace 子包。RG 同 M1-1。

### M3 数据展示动效（1 条）

- **M3-1 数据展示动效 A7**（提交 `dbe87cc`；记录见 [M3-1](../design/governance/2026-11-12-phase31-m3-1-data-display-motion.md)）：DataTable 行底色 / 排序提亮 / 展开入场，DataView 状态与布局切换入场，Chart / RichTextEditor 容器层就绪入场；Paginator / Progress / Skeleton 审计不改（已 token 化）。`minimal` 零差异、`reduce` 压平、不做整表重排动画；新增两套常驻 E2E（27 + 12 passed）。RG R1 / R2 / R3 均 `Pass`（0 blocker；R1 / R2 各 4 warning，R3 0 warning）。

### M4 触摸目标（1 条）

- **M4-1 触摸目标 P2**（提交 `09a7205`；记录见 [M4-1](../design/governance/2026-11-12-phase31-m4-1-touch-target-p2.md)）：35 个审计目标逐项确认——行高受限 6 个（DataTable 排序 / Breadcrumb 链接 / Select 清除）复用不可见 `::after`；内联行 22 个按组件绑定方式处置（普通 Input 控件盒填满外壳内容高、TagsInput 根节点补点击聚焦、MultiSelect / AutoComplete 锚点承接）；值片与值片内 icon 7 项判为非指针目标排除。探针新增 P2 分族与四族点击聚焦断言（21 passed）。RG R1 `Reject`（TagsInput 绑定误判）→ R2 `Pass`（0 blocker / 2 warning 已收口）。

### M5 依赖 PR 卫生（2 条）

- **M5-1 `eslint-plugin-vue` 10.12 解阻**（提交 `814ed2b`；PR #48；记录见 [M5-1](../design/governance/2026-11-12-phase31-m5-1-eslint-plugin-vue-unblock.md)）：`stepper.vue` 的 `defineProps` 改为 `Omit<StepperProps, 'modelValue'>` 编译期去重，导出类型与 `v-model` 契约不变；升级 PR 在带上修复后 CI 全绿并合并。RG `quick` R1 `Pass`。
- **M5-2 依赖 PR 复核与收口**（提交 `4647e11` / `5000a5f`；记录见 [M5-2](../design/governance/2026-11-12-phase31-m5-2-dependency-pr-closure.md)）：在册 6 个 PR——#48 / #30 / #41 / #32 / #34 合并，#33（`reka-ui` 2.11.0）按登记维持阻断并留痕；辅助维护 = 许可证台账标题随安装版本（正文经 tarball 逐字比对一致）+ axe 4.14 默认启用的 `label-content-name-mismatch` 8 条 needsReview 人工复核后登记；`manual-release` 失败复核为陈旧 base。未放宽 Mergify、未触碰发布配置。RG `deep` R1 `Reject` → R2 `Reject` → R3 `Pass`（0 blocker）。

### 阶段总结

- **5 条主线 / 6 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.2.0`。
- **提交对账**：`git log --oneline d69db1a..09a7205 | wc -l` → **34**（下界 = 上一阶段归档提交 `d69db1a`，上界 = 本阶段末条提交 `09a7205`）。按「本阶段主动处置 / 记录」计 **16**（`1ec8464` / `dbe87cc` / `d20bcf9` / `814ed2b` / `bdd7483` / `c6363b8` / `9e642b4` / `e30a75c` / `d979dab` / `7fd1cbd` / `ed274af` / `6556380` / `4647e11` / `5000a5f` / `55d3a2a` / `09a7205`，其中含依赖 PR 的许可证台账与 a11y 例外提交）；其余 **18** 为背景变更（Mergify / dependabot 自动合并、安全修复 #49、发布流修复 #50 与巡检规范补口 `e0c2de2`）。
- **质量门**：`09a7205` 的 CI（Test / Security Alerts / Pages / TODO to Issue）全部 success；归档批次复跑 `lint:md:check` / `docs:check:links` / `check:governance-records` / `check:stage-counts` / `governance:check` 均为绿。
- **长期任务**：第 **34** 轮门槛复核（2026-11-12，Phase 31 收口轮）——待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持；`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14，与第 33 轮逐项一致；`capture:styles` **399 项** 0 差异（与第 33 轮一致，本阶段未扩采样面）。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **8 条活跃（< 阈值 20，不蒸馏）**；`pnpm check:distill-archive` 归档段对账通过。本阶段新增 2 条可复用发现（scoped `:where([data-motion]) :is(...)` 的 scope 属性落点陷阱；Playwright 默认 `reducedMotion: reduce`，动效采样规格须显式 `no-preference`）。

### 回扫口径（三段式）

- **机检面**：`pnpm check:governance-records` 全绿（`todo.md` 清空阶段段落后无 `stale-planning-pointer`）；`check:planning-numbers` / `check:stage-counts` / `docs:check` 全绿。
- **人工面**：本阶段新增记录（M1-1/M2-1、M3-1、M4-1、M5-1、M5-2）与归档块逐条核对，无「链接文字为载体名、编号写在链接外」的失效散文指针；`docs/guide/mobile.md` 与 `en-US` 的 P2 段已随 M4-1 改为已交付并回链记录。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述（含 Phase 31 登记批次对 `todo.md` 的引用）按既有边界不回改——归档后 `todo.md` 已清空阶段段落，其失效由机检守卫覆盖范围之外的散文形态承担。

### 遗留与后续候选

- 本阶段不发布；`latest` 维持 `1.2.0`，版本积累至下一阶段。
- `reka-ui` 2.11.0 适配：评估已完成（5 文件 / 约 14 行，3 例测试装置 + 1 例触摸 `change` 时序），登记于 [Backlog §1.6](./backlog.md)「`reka-ui` 补丁升级」行，待用户授权实施；#33 维持开放。
- 依赖告警：`node-forge` low（dependabot #69）仍开放。
- 已知观察：`test:visual` 的 `font-latin*` / `font-mixed*` 6 项在本地环境持续失败（改动前后一致、非本阶段引入），基线未更新。

## Phase 32：质量收口与文档站回归（**2026-11-13 完成并归档；本阶段不发布**）

- 时间：2026-11-12 用户就[下一阶段范围评估（第十六轮）](../design/governance/2026-11-12-next-stage-scope-evaluation-16.md) §3 裁定 D0 ① / D1 ② / D2 ① / D3 ① 后登记；2026-11-13 交付 **3 条主线 / 4 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取**仅质量收口**（D1 ②，不含发布）——依赖适配与例外收口 **1** / 文档站质量收口 **2** / 文档站 demo 过渡 **1**；构成对账 **1 + 2 + 1 = 4**。**本阶段不发布**：`latest` 维持 `1.2.0`，未执行 `pnpm release`、未触发 Release workflow。范围与验收口径的单一事实源见[Phase 32 登记批次记录](../design/governance/2026-11-12-phase32-registration.md) §1 / §2。
- 非目标：发布；`glob` cross-major override；CI 镜像迁移检测；文档站多版本托管；Tailwind preset / Storybook；`conventional-changelog` 8；示例外链守卫扩展；交互边界对比度；ui-validator 资产 follow-up；长尾组件；国际化二期 / RTL；`useDialog`；图标运行时 peer；破坏性 API；新增运行时依赖。

### M1 依赖适配与例外收口（1 条）

- **M1-1 `reka-ui` 2.11.0 适配与 Toast 例外收口**（PR [#52](https://github.com/CaoMeiYouRen/caomei-ui/pull/52)，合并 `5b72563`；回填 `a30dabb`；记录见 [M1-1](../design/governance/2026-11-13-phase32-m1-1-reka-ui-2.11-adaptation.md)）：4 例 InputNumber 回归按评估归因落地——3 例为 VTU 未挂载到文档（`pointerup` 监听挂在 `window`）、1 例为触摸 `change` 时序（`flushStepChange` 以 `nextTick` 延后读取）；删除上游已修复的 `CaomeiToastProvider / aria-hidden-focus` 例外，许可证台账标题跟随安装版本。按 [GitHub 协作规范](../standards/github-collaboration.md) §3「复杂修改不代改 dependabot 分支」另开 PR，#33 关闭并由该 PR 替代。RG R1 `deep` `Reject`（1 blocker：索引摘要复述门禁读数）→ R2 `quick` `Pass`。

### M2 文档站质量收口（2 条）

- **M2-1 `with-select` 示例可访问名**（提交 `46ad9ba`；记录见 [M2-1](../design/governance/2026-11-13-phase32-m2-1-input-group-select-name.md)）：中英示例各补 `aria-label`（`placeholder` 不再充当组合框名称），新增源码契约守卫（逐份示例要求非空 `label` / `aria-label`，含「仅 placeholder」「纯空白」负向用例与 `label` 形态正例）。RG `quick` R1 `Pass`。
- **M2-2 首页 hydration mismatch 定性**（提交 `f5542da`；记录见 [M2-2](../design/governance/2026-11-13-phase32-m2-2-home-hydration.md)）：按用户裁定以「SSG 结构快照 + dev 真机对照」结案——`/` 与 `/en-US/`、暗色、已存主题预设四种场景下 hero / features / nav 标题在 SSG 与水合后逐项一致，dev 与生产构建均无告警；结论为「当前版本 + 本判别面下未复现（不声称已消除）」，三层排除（VitePress 上游 / 主题层 / 示例层）与四条边界落盘。新增 fail-closed 探针 `pnpm docs:probe:hydration`（产物前置校验 / 受检面归零判失败 / `__vue_app__` 就绪轮询），约定写入[文档站设计 §9](../design/documentation-site.md)。RG R1 `standard` `Reject`（2 blocker：探针静默假通过、结论越权）→ R2 `quick` `Pass`。

### M3 文档站 demo 过渡（1 条）

- **M3-1 demo 过渡恢复（站点仍压平）**（提交 `a678be3`；记录见 [M3-1](../design/governance/2026-11-13-phase32-m3-1-demo-transition.md)）：VitePress reduce 压平 + 全局时长 token 归零 + 组件 `transition: none` 三层叠加使 demo 过渡不可见；在 `.vitepress-demo-plugin__container` 内按组件重声明完整 transition shorthand，时长改用文档站本地变量（150/200/300ms），字段外壳复写 `--caomei-field-transition` 保留公开覆盖入口。实测 reduce 下 demo 产出 150ms `CSSTransition`（字段边框 / 阴影、开关拇指、Button、Switch 轨道、FloatLabel），站点元素仍 `0s`；`expressive` 专属过渡与 Portal 手势不恢复。RG R1 `standard` `Reject`（1 blocker：Button 误排除；5 warning 含 Stepper 过度恢复 / Switch 轨道缺失 / FloatLabel 漏项）→ R2 `quick` `Pass`。

### 阶段总结

- **3 条主线 / 4 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.2.0`。
- **提交对账**：阶段交付与回填 `5b72563` / `a30dabb` / `46ad9ba` / `f5542da` / `a678be3`；阶段内 CI 修复 PR [#53](https://github.com/CaoMeiYouRen/caomei-ui/pull/53)（`46c00f9`，CodeQL #6 `js/incomplete-sanitization`）与 PR [#54](https://github.com/CaoMeiYouRen/caomei-ui/pull/54)（`6c0cd35`，CodeQL #7 `js/path-injection`）；登记与前置记录 `7abe62f` / `2c8a73b`。
- **质量门**：`6c0cd35` 的 CI（Test / Security Alerts / CodeQL / Pages / TODO to Issue）全部 success；全量单测 **3153 passed**（162 文件）；归档批次复跑 `lint:md:check` / `docs:check:links` / `check:governance-records` / `check:stage-counts` / `check:archive-rg-counts` / `governance:check` 全绿。
- **长期任务**：第 **35** 轮门槛复核（2026-11-13，Phase 32 收口轮）——待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**；已判定不纳入 5 项维持；`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14，与第 34 轮逐项一致；`capture:styles` **399 项** 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **9 条活跃（< 阈值 20，不蒸馏）**。

### 回扫口径（三段式）

- **机检面**：`pnpm check:governance-records` 全绿；本轮 Phase 26 迁出致 **1 处** `stale-planning-pointer`（`2026-10-10-phase22-m2-3-major-upgrades.md:6` 的 `M2-3` 随迁出离开主窗口），改指 `archive/phase-22.md` 后 exit 0；`check:planning-numbers` / `check:stage-counts` / `docs:check` 全绿。
- **人工面**：本阶段新增记录（M1-1 / M2-1 / M2-2 / M3-1）与归档块逐条核对，无「链接文字为载体名、编号写在链接外」的失效散文指针；`docs/design/documentation-site.md` §9 已同步 demo 过渡层；`test/a11y/exceptions.ts` 与 `THIRD-PARTY-LICENSES` 随 M1-1 收口。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改——归档后 `todo.md` 已清空阶段段落，其失效由机检守卫覆盖范围之外的散文形态承担；同形指针（`2026-10-10-phase22-m2-2-*`、`2026-10-11-phase22-m6-3-*`）仍指向主窗口，靠同号标识碰撞通过机检，语义细节已在 `phase-22.md`，按既有边界不回改。

### 遗留与后续候选

- 本阶段不发布；`latest` 维持 `1.2.0`，版本积累至下一阶段。
- 依赖告警：`deepmerge` low（dependabot #69，无 patched version）已接受并登记；Code Scanning open 0（#6 / #7 均已 fixed）。
- 已知观察：`test:visual` 的 `font-latin*` / `font-mixed*` 6 项在本地环境持续失败（改动前后一致、非本阶段引入），基线未更新。
- 下一阶段候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 33：依赖与工具链升级、下游适配、组件增强与质量守卫（**2026-11-14 完成并发布 `1.3.0`**）

- 时间：2026-11-13 用户就[第十七轮范围评估](../design/governance/2026-11-13-next-stage-scope-evaluation-17.md) §4 裁定 D0 ① / D1 ① / D2 ① / D3 ① / D4 ① 后登记；2026-11-14 执行期追加 M3-4（Select 长列表滚动）与协作测试 P0 2 条；同日交付 **6 条主线 / 14 条原子条目**、发布 `1.3.0` 并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取**推荐组合**（D0 ①）——依赖与工具链 **4** / 下游适配 **1** / 组件增强与可访问性 **4** / 质量守卫与对比度 **2** / 发布收口 **1** / 协作测试 **2**；构成对账 **4 + 1 + 4 + 2 + 1 + 2 = 14**。范围与验收口径的单一事实源见 [Phase 33 登记批次记录](../design/governance/2026-11-13-phase33-registration.md) §1 / §2。
- 非目标：DataTable `scrollable` / 全表全选、长尾组件、国际化二期 / RTL、`useDialog`、多版本托管、Storybook、Tailwind preset、外链守卫扩展、`typescript` 7 / `glob` override / `conventional-changelog` 8 / CI 镜像检测、破坏性 API、新增运行时依赖。

### M1 依赖与工具链（4 条）

- **M1-1 `eslint` 10**（提交 `06880dc`；记录见 [M1-1](../design/governance/2026-11-14-phase33-m1-1-eslint-10.md)）：升至 10.15.0（登记值 10.14.0，registry 漂移）；`lint:check` 零 error / 零 warning，规则与 ignore 未放宽。RG R1 / R2 `Pass`。
- **M1-2 `vitest` 5 + coverage 5**（提交 `f0e604a`；记录见 [M1-2](../design/governance/2026-11-14-phase33-m1-2-vitest-5.md)）：覆盖率口径与阈值不变，`test` / `test:coverage` 全绿；未 await 断言与 mock 清理的暴露面逐条处置。RG `Pass`。
- **M1-3 `stylelint` 18 + `stylelint-config-cmyr` 1.1 同批**（提交 `312307c`；记录见 [M1-3](../design/governance/2026-11-14-phase33-m1-3-stylelint-18.md)）：525 文件零 error，规则面 124 → 128，受检面未缩。RG `Pass`。
- **M1-4 `fontkit` 3**（提交 `669f4b8`；记录见 [M1-4](../design/governance/2026-11-14-phase33-m1-4-fontkit-3.md)）：ESM-only 升级，视觉失败集合与改动前一致。RG `Pass`。

### M2 下游适配（1 条）

- **M2-1 DataTable `autoResetPageIndex` 透传**（提交 `31f9787`；记录见 [M2-1](../design/governance/2026-11-14-phase33-m2-1-datatable-auto-reset-page-index.md)）：显式镜像上游默认（`props.autoResetPageIndex ?? !props.lazy`），默认行为不变；中英文档补受控分页与数据缩水回收口径；`capture:styles` 0 差异。RG `Pass`。

### M3 组件增强与可访问性（4 条）

- **M3-1 ColorPicker 色板 `radiogroup`**（提交 `2319ed6`；记录见 [M3-1](../design/governance/2026-11-14-phase33-m3-1-colorpicker-radiogroup.md)）：`role="radio"` + `aria-checked` + roving tabindex + 方向键 / Home / End，移动即选中；新增真实浏览器 E2E（三视口）；无公共 API 变更。RG R1 `Reject`（缺真实浏览器验证）→ R2 `Pass`。
- **M3-2 Select 选项 `null` / `undefined` 开发期告警**（提交 `2714ead`；记录见 [M3-2](../design/governance/2026-11-14-phase33-m3-2-select-option-warning.md)）：仅开发期 `warnDev`，解析结果与生产输出不变；收窄逻辑抽到 `_shared/option.ts`。RG `Pass`。
- **M3-3 Paginator `#report` 插槽**（提交 `d2d0322`；记录见 [M3-3](../design/governance/2026-11-14-phase33-m3-3-paginator-report-slot.md)）：作用域 `page / pages / total`；无插槽零额外 DOM；中英文档与 API 表同批。RG `Pass`。
- **M3-4 Select 长列表面板滚动可达性**（提交 `3b4f7c3`；记录见 [M3-4](../design/governance/2026-11-14-select-long-list-scroll.md)）：`max-height: min(15rem, 可用高)` + 内部滚动 + `overscroll-behavior: contain`；常驻 E2E 与负向验证（还原 CSS 必失败）。RG R1 `Reject` → R2 `Pass`。执行期插队条目（规划规范 §3.5）。

### M4 质量守卫与对比度（2 条）

- **M4-1 文档站 transition 副本守卫**（提交 `b2fb929`；记录见 [M4-1](../design/governance/2026-11-14-phase33-m4-1-transition-copy-guard.md)）：27 条副本、受检下界 27、强制 `!important`；接入 `governance:check`，CLI 负向 exit 1。RG `Pass`。
- **M4-2 Calendar / RTE 交互边界对比度**（提交 `05b722c`；记录见 [M4-2](../design/governance/2026-11-14-phase33-m4-2-calendar-rte-contrast.md)）：导航按钮与编辑器容器描边改用 `--caomei-color-control-border`；RTE 因内核根元素 `data-theme` 回退基础 token，改由 `:where()` 包装层桥接；矩阵 6 预设 × 明暗 × 2 背景三视口 9 passed。RG R1 `Reject`（`:where()` 口径 / stylelint）→ R2 `Pass`。

### M5 发布收口（1 条）

- **M5-1 `1.3.0` 发布**（提交 `5b5c2c7` → Release run `43590300810`；记录见 [M5-1](../design/governance/2026-11-14-phase33-m5-1-1.3.0-release.md)）：`latest = 1.3.0`、`v1.3.0` tag 与 GitHub Release 到位；产物 shasum / `exports` / 版本句 / 里程碑段校验通过；下游兼容三仓 success；事后周回归 `43591838970` 全绿。RG R1 `Reject`（门禁覆盖披露）→ R2 `Pass`；R3 回填 `Pass`。发布前检查见[就绪度评估](../design/governance/2026-11-14-phase33-m5-1-release-readiness.md)。

### M6 协作测试（2 条）

- **M6-1 协作主链路 C1 ~ C5 / M6-2 残留与滚动锁栈**（提交 `7456aa7`；记录见 [M6](../design/governance/2026-11-14-phase33-m6-overlay-collaboration.md)）：Dialog / Drawer 与 Select 的指针展开、选择、焦点归还、滚动锁与 Esc 分层；`overlay-collaboration.e2e.ts` 10 例 × 三视口；C4 与 C3 几何各做负向验证。RG 两分区 `Pass`。

### 阶段总结

- **6 条主线 / 14 条原子条目全部交付**；`1.3.0` 已发布，`latest = 1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 48fcbfa..7ad48a7` → **31**；分组 = 条目交付与回填 20（含 M5-1 准备 / 发布记录）+ 评估与登记 7 + dependabot 自动合并 3 + 发布回推 1。
- **质量门**：`pnpm verify` exit 0（164 文件 / **3187** 例）；`test:coverage` 通过（93.52 / 86.35 / 95.40 / 92.92）；`test:a11y` 68；全量 E2E **772 passed / 4 skipped**；`test:visual` **42 passed**；`capture:styles` **399 项** 0 差异；API 差分 203 → 205 声明文件 / 337 → 349 导出，无 breaking。
- **长期任务**：第 **37** 轮门槛复核（2026-11-14，Phase 33 收口轮）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；计数与第 36 轮逐项一致；`capture:styles` 399 项 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **12 条活跃**（< 阈值 20，不蒸馏）；`check:distill-archive` 通过（14 段对账）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `docs:check` / `check:archive-rg-counts` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 33 行）/ `todo-archive.md`（本块入窗、主窗口口径与行数）/ `archive/index.md`（无迁出，仅口径不变）/ `recurring.md`（第 37 轮）/ 治理索引（本批次记录）逐处核过。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；归档后 `todo.md` 已清空阶段段落，其失效由机检守卫覆盖范围之外的散文形态承担。

### 遗留与后续候选

- 依赖告警：`node-forge` low（dependabot #69）仍 open；`@tanstack/vue-table` / `@lucide/vue` / `vue` 三个 dependabot PR 因许可证台账标题未随安装版本更新导致 `Quality` 红，待人工处理。
- 发布前置门禁（周回归绿）目前靠人工执行，`release.yml` 未接入机检；是否接入需用户决策（就绪度记录 §7）。
- 下一阶段候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 34：Tooltip 提示体系、协作测试 T3、质量门禁、DataTable 数据面与长尾组件（**2026-11-15 完成并归档；本阶段不发布**）

- 时间：2026-11-14 用户就[第十八轮范围评估](../design/governance/2026-11-14-next-stage-scope-evaluation-18.md) §3 裁定 D0 ① 后登记；同日追加 DataTable 数据面与长尾组件（原 3 / 13 → 5 / 20）；2026-11-15 执行期把 M1-2 拆为 M1-2 / M1-9 / M1-10（5 / 22）；同日 **22 条全部交付**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取**推荐组合**（D0 ①）——Tooltip **10** / 协作测试 **3** / 质量门禁 **2** / DataTable **2** / 长尾组件 **5**；构成对账 **10 + 3 + 2 + 2 + 5 = 22**。范围与验收口径的单一事实源见 [Phase 34 登记批次记录](../design/governance/2026-11-14-phase34-registration.md) §1 / §2。
- 非目标：不发布、不实现 per-instance 层级栈、P2 tooltip、DataTable 虚拟滚动与列固定、Sidebar / ScrollPanel / Rating、i18n 二期 / RTL、`useDialog`、I5 peer、多版本托管 / Storybook / Tailwind preset、外链守卫、破坏性 API、新增运行时依赖、自动发布。

### M1 Tooltip 提示体系（10 条）

- **M1-1 基础契约**（`b6fe58f`；记录见 [M1-1](../design/governance/2026-11-15-phase34-m1-1-tooltip-base.md)）：`useOverflowTooltip` + `CaomeiTooltipText` + `tooltip` 契约 + Provider 内建兜底 + Button 截断与提示；RG 七轮（R1 Reject / R2 Pass / R3 ~ R6 Reject / R7 Pass）→ 最终 `Pass`。
- **M1-2 / M1-9 / M1-10 Toolbar / Paginator / SplitButton**（`18951ef` / `994fc76` / `13f5b0a`；记录见 [M1-2](../design/governance/2026-11-15-phase34-m1-2-icon-tooltips.md)）：内部 `CaomeiIconTooltip` 与 `IconTooltipProp`，图标触发器默认开启提示。
- **M1-3 Dialog / Drawer 关闭按钮**（`9a98bcb`；记录见 [M1-3](../design/governance/2026-11-15-phase34-m1-3-dialog-drawer-tooltip.md)）：复用内部提示、默认开启且不新增公开 prop；`ignoreNonKeyboardFocus` 避免打开即弹提示。
- **M1-4 P1 icon-only 第一批**（`e7d569b`；记录见 [M1-4](../design/governance/2026-11-15-phase34-m1-4-p1-icon-tooltips.md)）：Select / MultiSelect / AutoComplete / TagsInput 清除、InputNumber 步进、Password 显隐。
- **M1-5 P1 icon-only 第二批**（`0bb5d9b`；记录见 [M1-5](../design/governance/2026-11-15-phase34-m1-5-p1-icon-tooltips-second.md)）：Calendar / FileUpload / ColorPicker / DatePicker / Image / Message（含 Alert 关闭）。
- **M1-6 overflow 面与截断前提**（`e62ffce`；记录见 [M1-6](../design/governance/2026-11-15-phase34-m1-6-overflow-surfaces.md)）：DataTable / Tag / Breadcrumb / Menu 补 `nowrap + max-width + ellipsis` 后接溢出提示。
- **M1-7 文档站 Provider / 示例 / 迁移**（`11efbc0` / `d4baccd` / `bc38414`；记录见 [M1-7](../design/governance/2026-11-15-phase34-m1-7-docs-provider.md)）：Provider 放置、中英示例、原生 `title` 迁移说明、能力清单标注。
- **M1-8 组件页截断说明**（`15c024d` / `0cb4749` / `0996bd9` / `43acc97`；记录见 [M1-8](../design/governance/2026-11-15-phase34-m1-8-truncation-docs.md)）：四组件中英页面补长文本截断与提示，并关闭 F4 / F2 / F6。

### M2 协作测试 T3（3 条）

- **M2-1 嵌套遮罩层级评估**（`57f6718`；记录见 [M2-1](../design/governance/2026-11-15-phase34-m2-1-nested-overlay-layering.md)）：结论维持固定档位（overlay 1000 / content 1001 / 面板 1050 / 提示 1060），零代码、零 token 改动；登记两类异常与后续候选。
- **M2-2 C7 ~ C9 / M2-3 C6**（`5aa42ce`；记录见 [M2-2 / M2-3](../design/governance/2026-11-15-phase34-m2-2-m2-3-overlay-collaboration.md)）：Toast 在 Dialog 之上、焦点陷阱 + portal、CDP 触摸滚动、Dialog → 二次确认 / Drawer → Dialog 的命中、Esc 分层、锁逐层释放与焦点归还；断言不假定 z-index 递增，含负向对照。

### M3 质量门禁与 a11y（2 条）

- **M3-1 打开态 axe**（`3d82e37` / `08aafc0` / `f27552e` / `1d3b191`；记录见 [M3-1](../design/governance/2026-11-15-phase34-m3-1-open-state-axe.md)）：Dialog / Select 打开态纳入矩阵，规则白名单与最小适用节点下界，三层抗静默收窄；登记 F18（Select 展开时兄弟节点仅 `aria-hidden`、未 `inert`）。
- **M3-2 发布前周回归机检**（`c3813e1`；记录见 [M3-2](../design/governance/2026-11-15-phase34-m3-2-weekly-regression-gate.md)）：`release.yml` 查询 `regression-weekly` 最近一次已完成运行，非 `success` 或查询失败一律中止；`actions: read`，退出码 0 / 1 / 2 区分绿 / 红 / 配置错误。

### M4 DataTable 数据面（2 条）

- **M4-1 固定表头与滚动**（`3aec7ad`；记录见 [M4-1](../design/governance/2026-11-15-phase34-m4-1-data-table-scroll.md)）：`scrollable` / `scrollHeight`，数字归一化为 `px`、字符串按 CSS 长度，表头吸顶与分页器吸底；滚动模式下冻结表头抬一层，修复层级覆盖。
- **M4-2 全选作用域**（`b046f8e`；记录见 [M4-2](../design/governance/2026-11-15-phase34-m4-2-select-all-scope.md)）：`selectAllScope` 默认 `page` 保持现状，`all` 作用于当前 `data` 全部行；`lazy` 不推断未加载页，受控下按 `rowKey` 合并去重。

### M5 长尾组件（5 条）

- **M5-1 BackTop**（`704ec40` / `7996149`；记录见 [M5-1](../design/governance/2026-11-15-phase34-m5-1-back-top.md)）：window / 选择器 / 元素三种目标、阈值显隐、reduced-motion 兜底、SSR 安全；`label` 缺省取内置文案。
- **M5-2 TimePicker**（`79e7ba7`；记录见 [M5-2](../design/governance/2026-11-15-phase34-m5-2-time-picker.md)）：自建三段输入 + 本地化日序（未采用 Reka `TimeField` 的 12 小时制）、12 / 24 小时制、步进、`minValue` / `maxValue` 夹取与空值语义。
- **M5-3 10 语 locale 键**（`59986b9` / `df3c2bf`；记录见 [M5-3](../design/governance/2026-11-15-phase34-m5-3-locale-keys.md)）：新增 `backTop` / `timePicker` 两个命名空间，10 语同批，台账 30 命名空间 / 89 条文案。
- **M5-4 BackTop 文档与测试**（`d81dc43` / `063da28`；记录见 [M5-4](../design/governance/2026-11-15-phase34-m5-4-back-top-docs.md)）：中英组件页与示例、画廊 / 侧栏 / 总览 / 设计登记、E2E 与亮暗元素级视觉基线。
- **M5-5 TimePicker 文档与测试**（`997f025` / `c07fb63`；记录见 [M5-5](../design/governance/2026-11-15-phase34-m5-5-time-picker-docs.md)）：中英组件页与示例、`timeOnly` 迁移对照、登记、E2E 与视觉基线。

### 阶段总结

- **5 条主线 / 22 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 7ad48a7..c07fb63` → **52**（条目交付、登记 / 评估、规划回填与守卫修复）。
- **质量门**：`pnpm verify` `exit 0`；`test:visual` 全绿（新增 back-top / time-picker 亮暗基线）；定向 E2E（浮层协作、DataTable、BackTop、TimePicker）全绿；`capture:styles` 0 差异；`docs:check` / locale / governance 守卫全绿。
- **长期任务**：第 **38** 轮门槛复核（2026-11-15，Phase 34 收口轮）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；`capture:styles` 399 项 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **15 条活跃**（< 阈值 20，不蒸馏）；`distill-wisdom --reconcile` 通过（14 段对账）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `docs:check` / `check:archive-rg-counts` / `check:design` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 34 行）/ `todo-archive.md`（本块入窗、Phase 27 迁出、主窗口口径与行数）/ `archive/index.md`（新增 Phase 27 行与迁出时点）/ `recurring.md`（第 38 轮）/ 治理索引（本批次记录）逐处核过；另修 1 处失效指针 `2026-10-11-phase22-m6-3-governance-counts-guard.md:6`（`[待办事项 §Phase 22](../../plan/todo-archive.md)` → `[待办归档 §Phase 22](../../plan/archive/phase-22.md)`，理由：目标块已迁出、仅剩索引行）。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；同类「载体名 + Phase NN 指向 `todo-archive.md`」而块已深度归档的散文指针（如 `2026-10-05-phase19-m1-2-visual-alignment.md:4`、`2026-10-07-phase20-m2-5-audit-protocol-convergence.md:4`、`2026-10-10-phase21-m3-1-visual-baseline-device.md:4`）按点时记录不回改，仅本批为解除机检红灯修 1 处并在此枚举。

### 遗留与后续候选

- **F18**：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert`，axe `aria-hidden-focus` 命中 `#app`（关闭判据见 [M3-1 记录](../design/governance/2026-11-15-phase34-m3-1-open-state-axe.md) §5）。
- **F1 / F7 ~ F9 / F10 / F11 / F14 / F16 / F17**：分别为可测量盒布局级守卫、Tooltip 前两批遗留、计数纪律与 Menu 槽约束 / DataTable 逐格接线开销，承接见各批记录遗留节。
- 下一阶段候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 35：质量与无障碍收口、DataTable 进阶、长尾 Rating（**2026-11-16 完成并归档；本阶段不发布**）

- 时间：2026-11-15 用户就[第十九轮范围评估](../design/governance/2026-11-15-next-stage-scope-evaluation-19.md) §3 裁定 D1 质量收口 + DataTable 进阶 / D2 五项质量债全取 / D3 不发布 / D4 长尾 Rating 后登记；2026-11-16 交付 **3 条主线 / 10 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**质量与无障碍 5 / DataTable 进阶 2 / 长尾 3**，构成对账 **5 + 2 + 3 = 10**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 35 登记批次](../design/governance/2026-11-15-phase35-registration.md) §1 / §2。
- 非目标：DataTable 虚拟滚动（需新增运行时依赖）、i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel、破坏性 API、新增运行时依赖、自动发布、Storybook / Tailwind preset / 文档站多版本。

### M1 质量与无障碍收口（5 条）

- **M1-1 Select 展开态补 `inert`**（`7ac7e22`；记录见 [M1-1](../design/governance/2026-11-16-phase35-m1-1-select-open-inert.md)）：新增 `suppressOutside`，面板落位后给背景补 `inert`、关闭先于焦点归还回退；`select-open-zh` 恢复 `aria-hidden-focus`，三视口 E2E 与负向对照；RG R1 `Pass`（4 warning）/ R2 `Pass` / R3 `Pass`。
- **M1-2 截断配方 × 提示布局守卫**（`974d7b8`；记录见 [M1-2](../design/governance/2026-11-16-phase35-m1-2-tooltip-truncation-guard.md)）：成对夹具 + 三视口 E2E（真截断出提示 / 装得下静默）；采样差异实测后取「等价 E2E 守卫」而非扩展 `capture:styles`；RG R1 `Pass` / R2 `Pass`。
- **M1-3 记录计数一致性机检**（`501bb09`；记录见 [M1-3](../design/governance/2026-11-16-phase35-m1-3-record-count-guard.md)）：`check-governance-counts` 新增算式恒等式、新记录文件面模板与用例数归因，含负向语料；RG R1 `Reject`（4 blocker）/ R2 `Pass`。
- **M1-4 逐格提示退出开关**（`ae28ad4` / PR #62；记录见 [M1-4](../design/governance/2026-11-16-phase35-m1-4-cell-tooltip-optout.md)）：实测 60 × 8 默认单元格约 0.6–0.7 s、+480 提示实例；新增 `cellTooltips`（默认开启，关闭保留截断配方）；RG R1 / R2 `Reject` / R3 `Pass`。
- **M1-5 Menu `#icon`**（`26bbb97` / PR #63；记录见 [M1-5](../design/governance/2026-11-16-phase35-m1-5-menu-icon-slot.md)）：普通项与子菜单触发器新增前置图标插槽，`--caomei-menu-item-gap` 恢复作用于「图标 + 文本」；RG R1 `Reject` / R2 `Pass`。

### M2 DataTable 进阶（2 条）

- **M2-1 列可见性与列顺序**（`28ba5b6` / PR #64；记录见 [M2-1](../design/governance/2026-11-16-phase35-m2-1-column-visibility-order.md)）：受控 `columnVisibility` / `columnOrder`，隐藏列在表头 / 表体 / 空态 `colspan` / 冻结偏移同步，展开列禁止隐藏；RG R1 / R2 `Reject` / R3 `Pass`。
- **M2-2 受控列宽**（`0aa3c66` / PR #65；记录见 [M2-2](../design/governance/2026-11-16-phase35-m2-2-column-sizing.md)）：`columnSizing` 优先于列定义 `width`，冻结偏移、`min-width` 与截断上限同源；拖拽与持久化归使用方；RG R1 / R2 `Reject` / R3 `Pass`。

### M3 长尾 Rating（3 条）

- **M3-1 实现与导出**（`ad2ffbf` / PR #66；记录见 [M3-1](../design/governance/2026-11-16-phase35-m3-1-rating.md)）：封装 Reka `RatingRoot` / `RatingItem`；整星 / 半星、只读 / 禁用、`max` / `size` / `label` / `clearable`；半星按 primitive 步进裁切、着色只取「最右一格」；RG R1 `Reject`（3 blocker）/ R2 `Pass`。
- **M3-2 10 语 locale 与台账**（`042cf1a` / PR #67；记录见 [M3-2](../design/governance/2026-11-16-phase35-m3-2-rating-locale.md)）：新增 `rating` 命名空间（区域名 / 只读名 / step 数值模板），10 语同批；台账 31 命名空间 / 32 消费组件；RG R1 `Pass`。
- **M3-3 文档、示例、E2E 与视觉基线**（`ffe3f08` / PR #68；记录见 [M3-3](../design/governance/2026-11-16-phase35-m3-3-rating-docs-e2e.md)）：中英组件页与示例、侧栏 / 总览 / §5 / §11 登记、三视口 E2E（点击 / 键盘 / 只读 / 半星）、亮暗视觉基线；RG R1 `Reject`（1 blocker）/ R2 `Pass`。

### 阶段总结

- **3 条主线 / 10 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges bf67d19..8e5dc0d` → **12**（登记 / 评估、十条条目交付与 PR 合并、规划状态回填）。
- **质量门**：`pnpm verify` `exit 0`；`master` 在 `8e5dc0d` 上 CI（Test / Visual / CodeQL / Security Alerts / Deploy Pages）全绿；三视口 E2E（Select inert、DataTable 列能力与整格提示、Rating）与视觉全量（含新增 rating 亮暗基线）通过；`governance:check` / `docs:check` 全绿。
- **长期任务**：第 **39** 轮门槛复核（2026-11-16，Phase 35 收口轮）——待执行批次 **0 项**；条件触发 **1 项维持**（表单控件公共 props 契约）；已判定不纳入 5 项维持；`capture:styles` 399 项 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿（`docs:check:line-count` 主窗口值见文首口径）。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态、Phase 35 行与 §5 深度归档范围）/ `todo-archive.md`（本块入窗、Phase 28 ~ 30 迁出、索引行与口径句）/ `archive/index.md`（三份新文件与压缩记录）/ `recurring.md`（第 39 轮）逐处核过；`.session/current-task.yaml`、`.session/runtime-state.json` 同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针（机检 0 命中，人工面未发现需改指者）。

### 遗留与后续候选

- **浮层隔离扩面（观察项，非条目）**：MultiSelect / AutoComplete / DatePicker 等经 Reka 打开浮层的组件仍只有 `aria-hidden`；是否扩为全库隔离属范围决策（见 [M1-1 记录](../design/governance/2026-11-16-phase35-m1-1-select-open-inert.md) §5）。
- **DataTable 列宽拖拽手柄 / 虚拟滚动**：本阶段取受控契约，拖拽交互与虚拟滚动（需新增依赖）维持候选。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。

## Phase 36：浮层隔离扩面、DataTable 列宽拖拽与虚拟滚动评估、质量治理、选择器空值诊断（**2026-11-18 完成并归档；本阶段不发布**）

- 时间：2026-11-17 用户就[第二十轮范围评估](../design/governance/2026-11-16-next-stage-scope-evaluation-20.md) §4 裁定 D0 A / D1 全部浮层 / D2 拖拽 + 评估 / D3 不发布 / D4 `deepmerge` 维持接受登记后登记；同日追加 M1-5 / M2-3，再经插队追加 M4-1 / M4-2；2026-11-18 交付 **4 条主线 / 12 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**无障碍扩面 5 / DataTable 交互 3 / 质量治理 2 / 选择器空值诊断 2**，构成对账 **5 + 3 + 2 + 2 = 12**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 36 登记批次](../design/governance/2026-11-17-phase36-registration.md) §1 / §2。
- 非目标：不新增运行时依赖（虚拟滚动只评估）、不改变 `''` 作为「未选中」的模型语义、i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel、破坏性 API、自动发布。

### M1 无障碍扩面（5 条）

- **M1-1 隔离工具多浮层边界**（`9146fe4`；记录见 [M1-1](../design/governance/2026-11-17-phase36-m1-1-multi-overlay-isolation.md)）：`suppressOutside` 改为活动层登记 + 每次重算，活动层与写入记录按 `body` 分组，先关者不提前解除、跨文档互不影响；RG R1 `Reject`（跨文档误清）/ R2 `Reject`（释放分支整片隔离）/ R3 `Pass`。
- **M1-2 MultiSelect / AutoComplete 打开态补 `inert`**（`5c720fc` / `a77b7d9`；记录见 [M1-2](../design/governance/2026-11-17-phase36-m1-2-combobox-open-inert.md)）：多根隔离（面板 + 字段），关闭同步回退，Tab / Shift+Tab 交接焦点、Escape 交还输入框；隔离工具同时配对 `aria-hidden`；RG R1 `Reject`（字段被隔离致输入失效）/ R2 `Reject`（Tab 焦点落 body）/ R3 `Pass`。
- **M1-3 DatePicker / ColorPicker 打开态补 `inert`**（`bf55466`；记录见 [M1-3](../design/governance/2026-11-17-phase36-m1-3-date-color-picker-inert.md)）：面板 + 触发器双根，`inline` 形态不隔离，模态内打开保留触发器祖先链；RG R1 `Pass`（5 warning / 4 suggest 同批修）。
- **M1-4 全库浮层回归与边界记录**（`eb2c5fd`；记录见 [M1-4](../design/governance/2026-11-18-phase36-m1-4-overlay-regression.md)）：逐组件判定「已隔离 / 本批补 / 不采用」并给出理由，枚举锚点对齐 `check-overlay-z-index` 受检集合；RG R1 `Reject`（漏 `ConfirmDialog` / `Image` 预览）/ R2 `Pass`。
- **M1-5 DropdownMenu / Popover 打开态补 `inert`**（`e2fab21`；记录见 [M1-5](../design/governance/2026-11-17-phase36-m1-5-dropdown-popover-inert.md)）：抽出 `useOpenStateIsolation`（`data-state` 驱动）+ 触发器根 provide/inject，`forceMount` 可隔离；RG R1 `Reject`（2 blocker：触发器被隔离打红 `overlay-motion`、`forceMount` 不隔离）/ R2 `Pass`。

### M2 DataTable 交互（3 条）

- **M2-1 列宽拖拽手柄**（`ae61ba2`；记录见 [M2-1](../design/governance/2026-11-18-phase36-m2-1-column-resize-handle.md)）：新增 `resizableColumns`（默认关闭），指针拖拽 / 方向键 ±8px / 双击复位，受控经 `update:columnSizing`；选择列与展开列无手柄；RG R1 `Reject`（3 blocker：基准宽度、冻结列表述、无指针证据）/ R2 `Pass`。
- **M2-2 虚拟滚动可行性评估**（`1e2664a`；记录见 [M2-2](../design/governance/2026-11-17-phase36-m2-2-virtual-scroll-evaluation.md)）：候选体积与许可证、SSR 回退、动态行高、六类兼容风险与触发条件；结论「可行（有条件）」，本阶段不实现、不加依赖；RG R1 `Pass`（4 warning / 2 suggest 同批修）。
- **M2-3 列宽持久化示例与契约说明**（`3d1418b`；记录见 [M2-3](../design/governance/2026-11-17-phase36-m2-3-column-sizing-persist-example.md)）：中英 `column-sizing-persist.vue`（读取 / 保存 / 清除 / 越界回退）+ 组件页说明；RG R1 `Reject`（`.demo-stack` 无样式）/ R2 `Pass`。

### M3 质量治理（2 条）

- **M3-1 Rating 文档站 a11y 抽检**（`aa36cf8`；记录见 [M3-1](../design/governance/2026-11-17-phase36-m3-1-rating-docs-axe.md)）：中英 Rating 页入矩阵（就绪选择器 + 实测下界）；RG R1 `Reject`（批次夹带、§17 计数漂移）/ R2 `Pass`。
- **M3-2 依赖告警复核**（`b9d4bf5`；记录见 [M3-2](../design/governance/2026-11-17-phase36-m3-2-dependency-alert-review.md)）：按分页口径实测 open 0 / fixed 70 / auto_dismissed 1，`deepmerge` 四态无记录（成因未取证）、dev-only 链路；RG R1 `Reject`（分页截断）/ R2 `Reject`（回链与索引）/ R3 `Pass`。

### M4 选择器空值诊断（2 条）

- **M4-1 空串选项值不再透传**（`e9b88b9`；记录见[调研与处置](../design/governance/2026-11-17-select-empty-option-value-evaluation.md)）：Select / MultiSelect 归一化丢弃、AutoComplete 新增边界，开发期告警带组件标识与序号，模型侧 `''` 仍为未选中，`SelectButton` 补反例；RG 以[调研与处置](../design/governance/2026-11-17-select-empty-option-value-evaluation.md) §7 的 R1 `Pass`（3 warning / 6 suggest，同批关闭）为准，实施侧另经 R1 / R2 两轮复审。
- **M4-2 空串契约声明**（`b710597`；同上）：中英 Select / MultiSelect 组件页与设计规范 §7 补契约、`SelectButton` 例外；RG 以调研记录 §7 的 R1 `Pass`（3 warning / 6 suggest，同批关闭）为准，实施侧另经 R1 → R2 → R3 三轮复审。

### 阶段总结

- **4 条主线 / 12 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 4f57ce6^..ae61ba2` → **16**（登记 / 追加 / 插队、十二条条目交付与规划状态回填）。
- **质量门**：`pnpm verify` exit 0（见[归档批次记录](../design/governance/2026-11-18-phase36-archive.md) §3.1）；`master` 在 `ae61ba2` 上 CI（Test / CodeQL / Security Alerts / Deploy Pages）全绿；浮层三视口 E2E 57 条、列宽拖拽 E2E 3 条、`overlay-motion` 39 条通过；文档站 axe 打开态矩阵 23 条目 / 22 路径全绿。
- **长期任务**：第 **40** 轮门槛复核（2026-11-18，Phase 36 收口轮）——见 [长期任务](./recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 36 行）/ `todo-archive.md`（本块入窗）/ `recurring.md`（第 40 轮）/ `docs/design/governance/index.md`（归档记录行）逐处核过；`.session/current-task.yaml`、`.session/runtime-state.json` 同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **虚拟滚动**：评估结论「可行（有条件）」，触发条件 = 单页 > 200 行（经验值，立项前须实测校准）或用户裁定；在此之前不新增运行时依赖。
- **列宽拖拽的残余**：冻结列手柄吸边的像素级几何未单独断言；最小宽 48px / 步进 8px 不可配置，无 resize 结束事件。
- **浮层隔离的残余**：DropdownMenu 无独立 E2E 夹具锚点；页面级（非模态）Popover 的三视口 Tab 用例待补；`pointerdown` 解除隔离在 `disableOutsidePointerEvents` 下的窗口已记录。
- 其余条件触发候选见 [Backlog](./backlog.md)；启动需用户明确授权。
