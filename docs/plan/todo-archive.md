# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

> **主窗口口径（2026-11-13 更新）**：主窗口只保留**归档索引**（Phase 0 ~ Phase 26，逐阶段一行摘要 + 深度归档链接）与**近线阶段窗口**（**当前为 Phase 27 ~ Phase 32 共 6 块；目标窗口 5 个，未越阈暂留 6**）；更早阶段的完整归档块迁入**深度归档**目录 [`archive/`](./archive/)，收录范围分别为 [phase-00-06.md](./archive/phase-00-06.md)（Phase 0 ~ 6）、[phase-07-12.md](./archive/phase-07-12.md)（Phase 7 第一阶段 ~ Phase 12）、[phase-13-17.md](./archive/phase-13-17.md)（Phase 13 ~ 17）、[phase-18.md](./archive/phase-18.md)（Phase 18）、[phase-19.md](./archive/phase-19.md)（Phase 19）、[phase-20.md](./archive/phase-20.md)（Phase 20）、[phase-21.md](./archive/phase-21.md)（Phase 21）、[phase-22.md](./archive/phase-22.md)（Phase 22）、[phase-23.md](./archive/phase-23.md)（Phase 23）、[phase-24.md](./archive/phase-24.md)（Phase 24）、[phase-25.md](./archive/phase-25.md)（Phase 25）、[phase-26.md](./archive/phase-26.md)（Phase 26）。**主窗口累计超过 `docs:check:line-count` 的 warn 阈值（400 行）时，把最早的阶段块迁入深度归档（链接深度机械调整，另含同目录 `./` → `../` 修正，正文不改写）**；该阈值由 `docs:check:line-count` 驱动——归档载体只增不减，2026-09-29 曾达 594 行、2026-10-13 达 574 行、2026-10-16 达 404 行、Phase 26 批前 396 行、Phase 26 入窗后约 470 行；2026-11-08 Phase 28 迁出后 362 行；2026-11-09 Phase 29 入窗后约 408 行，Phase 23 迁出后 368 行，补 Phase 29 三段式回扫段后 **373 行**；2026-11-11 Phase 30 入窗后 417 行，Phase 24 迁出后 **366 行**；2026-11-12 Phase 31 入窗后 **416 行**（前态 366 + 块 49（含分隔空行）+ 归档索引行 1），Phase 25 迁出 49 行后 **367 行**；2026-11-13 Phase 32 入窗后 **408 行**（前态 367 + 块与索引行 41），Phase 26 迁出 77 行后 **331 行**。**深度归档不改变权威**：阶段交付的权威记录仍是各阶段治理记录（见[治理索引](../design/governance/index.md)），深度归档只保存主窗口迁出的原始正文。

## 归档格式

每个阶段归档块应包含：

- 阶段名称与时间；
- 交付内容与提交记录；
- 质量门结果（lint / typecheck / test / build）；
- 审计结论（Pass / Reject 及修复情况）；
- 遗留问题与后续候选。

深度归档文件沿用同一格式（只做链接深度 `../` → `../../` 与同目录 `./` → `../` 的机械调整，正文不改写）。

---

## 归档索引（Phase 0 ~ Phase 26）

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

---

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
- **已知观察**：① 本阶段**不发布**，`latest` 维持 `1.2.0`，未推送（时点口径；其提交随后续批次推送 `master`）；② 图标 token 冻结面 429 → 430（`--caomei-menu-item-hover-color`），包根导出 345；③ 文档站 reduce 下仍按 VitePress 全局规则压平（无障碍行为），目视审查改用独立页面；单文件与录屏在 `artifacts/`（gitignored）；④ Chromium 单浏览器覆盖，Firefox / WebKit 未复跑。
- **后续候选**：动效 A4 ~ A7（[Backlog](./backlog.md) §1.10）、图标 I5（§1.9）、触摸目标 P1 / P2、RTL / 二期语言、长尾组件。

## Phase 30：表单、布局与选择器动效 + 触摸目标 P1 + 阶段残留机检（**2026-11-11 完成并归档；本阶段不发布**）

- 时间：2026-11-10 用户就[第十四轮范围评估](../design/governance/2026-11-10-next-stage-scope-evaluation-14.md) §3 裁定 D0 ① / D1 ⑤ / D2 ② / D3 ② / D4 ① / D5 ① 后登记；2026-11-11 交付 **5 条主线 / 5 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取 **动效 A4 + A5 + A6 + 触摸目标 P1 + 治理小项**，构成对账 **1 + 1 + 1 + 1 + 1 = 5**；D2 ② **本阶段不发布**（`latest` 维持 `1.2.0`）；D3 ② 仅触摸目标 P1（P2 维持 Backlog）；D4 ① 纳入 `check-stage-counts` 无阶段交叉校验；D5 ① 文档站 demo 维持「尊重系统偏好 + 独立审查页」。范围与验收口径的单一事实源见[Phase 30 登记批次记录](../design/governance/2026-11-10-phase30-registration.md) §1 / §2。
- 非目标：动效 A7 数据展示（转 Backlog §1.10）、触摸目标 P2（§1.5）、发布、RTL / 二期语言、长尾组件、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook。

### M1 表单输入动效（1 条）

- **M1-1 表单输入动效（A4）**：InputGroup 聚焦成员上移 2px、CheckboxGroup 勾选指示器（委托 Checkbox 单点实现）、Form / FormItem invalid 标签颜色过渡与错误行入场、Slider 手柄悬浮 / 按下缩放（改用独立 `scale` 规避 Reka 内联 `transform`）、InputNumber 步进反馈；`minimal` 零差异、`reduce` 压平、无裸时长；新增 `form-motion` E2E（提交 `6f4a6d4`；[M1-1 记录](../design/governance/2026-11-10-phase30-m1-1-form-motion.md)）。RG：R1 Pass → R2 Pass。

### M2 基础与布局动效（1 条）

- **M2-1 基础与布局动效（A5）**：Avatar / Image 加载淡入（仅透明度、不产位移）、Tag 颜色过渡与悬浮（不覆盖选中态、reduce 下不变色）、Card `hoverable` 抬升改用位移 token（expressive 4px，`minimal` 保持 2px）；Badge 审计、Divider / Row / Col 静态对照（不做布局动画）；新增 `basic-layout-motion` E2E（提交 `5c22c30`；[M2-1 记录](../design/governance/2026-11-10-phase30-m2-1-basic-layout-motion.md)）。RG：R1 Pass → R2 Pass。

### M3 选择器动效（1 条）

- **M3-1 选择器动效（A6）**：Select / MultiSelect / AutoComplete 面板入场限定 `[data-state='open']`，条目高亮、选中指示器与标签入场、清空 / 删除反馈；Calendar 日期状态过渡；ColorPicker 手柄独立 `scale` 与色板过渡；SelectButton / ToggleButton 按下缩放；DatePicker 审计既有面板入场（不重复实现）；`minimal` 零差异、`reduce` 压平、portal 面板以 `html` 轴生效；新增 `selector-motion` E2E，采样 helper 扩 `triggerEvent`（提交 `ddf9a22` / `96feb20`；[M3-1 记录](../design/governance/2026-11-10-phase30-m3-1-selector-motion.md)）。RG：R1 Pass → R2 Pass。

### M4 触摸目标 P1（1 条）

- **M4-1 触摸目标 P1**：Checkbox 2 / RadioButton 6 / Switch 2 / Slider 3 / ColorPicker 滑柄 4 共 **17** 个表单控件盒复用 `.caomei-hit-target` 原语扩到不可见命中区 ≥24×24，**视觉盒逐族不变**；命中区探针升级为逐轴 `max(边长, 24)` + 分族视觉盒上限与 Chebyshev 配对；`capture:styles` 补视觉盒与 `::after` 逐属性样本；负向对照（命中区 token 临时改 20px）可判失败（提交 `8b2583b`，CI 预算同步修复 `99d7152` / `e6fd534`；[M4-1 记录](../design/governance/2026-11-10-phase30-m4-1-hit-target-p1.md)）。RG：R1 Pass（组件样式面 / 测试与文档面两分区）→ R2 delta Pass ×2。

### M5 治理小项（1 条）

- **M5-1 `check-stage-counts` 无阶段交叉校验**：无进行中阶段分支新增 `phase-state-residue`——`todo.md` 的 `## 当前状态` 段出现阶段编号或 `todo-archive.md` 文本即失败（受检面止于该段，「未完成项汇总」维持允许面）；补两条形态负向单测、CLI 负向与受检面边界正例；[规划规范 §7](../standards/planning.md) 同步（提交 `72cb756`；[M5-1 记录](../design/governance/2026-11-11-phase30-m5-1-stage-count-residue.md)）。RG：R1 Pass → R2 Pass。

### 回扫口径（三段式）

- **机检面**：`check:governance-records`（治理记录 ↔ 索引双向一致、历史规划指针无失效）、`check-links`（本地链接有效）、`check-planning-numbers`（规划载体无条目编号残留）、`check:stage-counts`（无进行中阶段分支 skipped 且残留校验通过）均 `exit 0`；残留判据见 `check-stage-counts` 的 `phase-state-residue`（`## 当前状态` 段出现阶段编号或 `todo-archive.md` 文本即失败）。
- **人工面**：`todo.md`（删阶段条目表、恢复「无进行中阶段」）/ `roadmap.md`（§1 当前态、阶段表 Phase 30 行、§5 深度归档与压缩历史）/ `todo-archive.md`（本块入窗、Phase 24 迁出、主窗口口径与归档索引行）/ `archive/index.md`（phase-24 行与迁出时点）/ `recurring.md`（第 33 轮）/ 治理索引（本批次记录）逐处核过；Phase 24 块迁出为机械操作——50 行逐行核对与原文一致，改写 19 处（链接深度 `../` → `../../` 18 处 + 同目录 `./` → `../` 1 处），正文零改写。
- **未处理面**：无新增；沿用既有边界——历史「阶段限定 + 复用编号」散文指针与时点计数不回改。

### 阶段总结

- **提交**：登记 `e6f20c3` → M1-1 `6f4a6d4` / M2-1 `5c22c30` / M3-1 `ddf9a22` + `96feb20` / M4-1 `8b2583b` + `99d7152` + `e6fd534` / M5-1 `72cb756`。
- **质量门**：`pnpm verify` 通过（M1-1 / M2-1 / M3-1 各自含 `build` / `docs:build` / `governance:check`）；`capture:styles` **0 差异**（写录时点快照：采样面 399 项，Phase 30 M4-1 由 386 扩至 399）；`test:visual` 全绿（含 M4-1 亮暗 / 视口 / 命中区基线 0 差异）；定向 E2E `form-motion` / `basic-layout-motion` / `selector-motion` / `hit-target` / `focus-visible-expansion` 通过；M5-1 侧 `lint:check` / `typecheck` / `governance:check` 全绿。
- **长期任务**：阶段收口触发**第 33 轮**门槛复核（2026-11-11）——待执行批次 **0 项维持**；条件触发 **1 项维持**（表单控件公共 props 契约）；已判定不纳入 **5 项维持**；证据见[长期任务](./recurring.md) §3 第 33 轮。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → 活跃 **7 条** < 阈值 20，未触发蒸馏；Phase 30 期间新增 3 条可复用发现（代表 1 条：命中区探针对宽宿主按逐轴 `max(边长, 24)` 判定；全量见[归档批次记录](../design/governance/2026-11-11-phase30-archive.md) §3）。
- **归档批次审计**：经 `@code-reviewer` Review Gate；结论见[归档批次记录](../design/governance/2026-11-11-phase30-archive.md) §5。
- **已知观察**：① 本阶段**不发布**，`latest` 维持 `1.2.0`；② 提交已推送 `master`（`git ls-remote` 实测），未触发 Release；③ 本阶段 CI 两次红均为 `capture:styles` 采样预算未同步（`99d7152` 同步 399、`e6fd534` 标注旧值为时点快照），修复后 `Test` / `CodeQL` / `Pages` / `Security Alerts` 全 success；④ Chromium 单浏览器覆盖，Firefox / WebKit 未复跑。
- **后续候选**：动效 A7 数据展示（[Backlog](./backlog.md) §1.10）、触摸目标 P2（§1.5）、RTL / 二期语言、长尾组件。

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
