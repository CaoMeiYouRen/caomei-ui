# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

> **主窗口口径（2026-10-13 更新）**：主窗口只保留**近线阶段窗口**（**当前为 Phase 18 ~ Phase 23 共 6 块**——**目标窗口 = 最近 5 个已完成阶段**，因主窗口尚未越过 warn 阈值 400 行，最早的 Phase 18 块暂未迁出）与其后的**归档索引**；更早阶段的完整归档块迁入**深度归档**目录 [`archive/`](./archive/)，收录范围分别为 [phase-00-06.md](./archive/phase-00-06.md)（Phase 0 ~ 6）、[phase-07-12.md](./archive/phase-07-12.md)（Phase 7 第一阶段 ~ Phase 12）、[phase-13-17.md](./archive/phase-13-17.md)（Phase 13 ~ 17）。**近线窗口口径 = 最近 5 个已完成阶段**；主窗口累计超过 `docs:check:line-count` 的 warn 阈值（400 行）时，把最早的阶段块迁入深度归档（只做链接深度机械调整、正文不改写）。该阈值由 `docs:check:line-count` 驱动——归档载体只增不减，2026-09-29 曾达 594 行（首次压缩后回落），2026-10-13 达 574 行（本批二次压缩）。**深度归档不改变权威**：阶段交付的权威记录仍是各阶段治理记录（见[治理索引](../design/governance/index.md)），深度归档只保存主窗口迁出的原始正文。

## 归档格式

每个阶段归档块应包含：

- 阶段名称与时间；
- 交付内容与提交记录；
- 质量门结果（lint / typecheck / test / build）；
- 审计结论（Pass / Reject 及修复情况）；
- 遗留问题与后续候选。

深度归档文件沿用同一格式（只做链接深度 `../` → `../../` 的机械调整）。

---

## 归档索引（Phase 0 ~ Phase 17）

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

---

## Phase 18：发布收口、测试稳定性与一致性治理

- 时间：2026-09-30 用户逐条裁定 D1 ~ D13 后登记；2026-10-01 交付 5 条主线 / 12 条原子条目并完成阶段归档（用户指令「开始归档」）。
- 范围与授权（用户决策 2026-09-30，D1~D13）：**D1** 取 **M1 + M2 + M3 + M4 + M6**（**M5 下游升级护航与 Phase 8 不纳入**）；**D2** 先做文档同步、**推送继续等待**；**D3** flaky 类取「断言等待稳定 + `maxWorkers` 兜底」；**D4** 质量装置四条**全取**；**D5** 设计一致性**只出评估**；**D6** `iconOnly` 示例形态**继续登记待调研**；**D7** 对比度 6 项**收口为终局结论**（不改色值）；**D8** 下游升级护航**不纳入**（口径随 M6 修正）；**D9** Phase 8 **继续等待不启动**；**D10** 台账漂移**修 3 项 + 回扫**；**D11** 组件增强与长尾**全部维持条件触发**；**D12** 国际化 / RTL **均不纳入**并追加「国际化语言覆盖与文案分包体积调研」候选；**D13** 阶段末**按需发版、不预登记**；N5 `v0.5.0` 指向**维持现状**、只修发布指南 §3 文本口径。范围依据见[下一阶段范围评估（第二轮）](../design/governance/2026-09-30-next-stage-scope-evaluation-2.md) §8。
- 非目标：不执行远端推送（推送继续等待）；不重指 `v0.5.0` tag；不重新发布 0.5.0；不做 `iconOnly` 示例形态；不落地设计一致性断言（M3 只评估）；不做下游升级护航；不启动 Phase 8；不做国际化 / RTL 实现；不做组件增强与长尾；不预登记发布条目；不做破坏性 API 变更；不引入 Tailwind / UnoCSS。

### M1 发布收口与版本一致性（3 条）

- **M1-1 0.5.0 发布后校验与版本句同步**：registry `version` / `dist-tags` = 0.5.0；registry tarball shasum `266f7686…` 与本地 `npm pack` 产物交叉核对一致（**358 文件 / 858390 B**）；解包冒烟 `ok`（resolver / nuxt / styles 全 true、根导出 **92**）；README（中英）/ `roadmap §1` / `todo.md` 缺陷状态行同步 → `docs:check:version` **exit 0**（4 处漂移清零）。提交 `f0df2b0`。
- **M1-2 发布指南 §3 tag 指向口径修正**：§3 第 4 步改为「tag 落点两种形态均属正常」；`npm version` 注由「不要用其替代本流程」改写为「本地发布的正常流程」并去掉「偏差」定性；**`v0.5.0` 不回改**、历史记录不回写。提交 `3fcc78f`。
- **M1-3 0.5.0 发布执行治理记录**：产出 [`2026-10-01-phase18-m1-3-release-0.5.0.md`](../design/governance/2026-10-01-phase18-m1-3-release-0.5.0.md) 并登记索引；registry 实测值与 tarball 证据链逐项回链；「与发布日志逐条一致」不可证 → **替代取证边界**显式登记。提交 `1e05b5e`。

### M2 测试稳定性与质量装置消缺（5 条）

- **M2-1 并行负载 flaky 类根因修复与并发上限兜底**：根因 = Reka 浮层挂载 / roving focus / 双向 emit 由微任务与定时器混合驱动，高负载下「交互后立即断言」读到更新前状态；观测到的 **11 个用例**改条件轮询（helper `test/helpers/settle.ts`，规则落[测试规范 §6.2](../standards/testing.md)）；`vitest.config.ts` 增 `maxWorkers: 4` + `testTimeout: 15000`；**连续 7 轮零失败**、worker 进程恒为 4、负向对照证明判别力保持；**附带修复** `guard-ref-attrs` 在 `stdio: 'inherit'` 下 `.trim()` 崩溃。提交 `1b39f37` / `a3591a0` / `1e65760`。
- **M2-2 计算样式采样面扩展（Toast / Switch）**：采样面 **245 → 262 项（+17）**——`switch.*` 6（开 / 关 / 禁用三态轨道与滑块几何 + 前景回退色 + 选中态位移）与 `toast.*` 11（视口层级 / 停靠几何 + 五档语气强调色与图标色）；契约与夹具固有值逐项区分；负向对照 **7 处命中**（Switch 宽度 / Toast 强调条）、还原后 0 差异；`capture:styles` **262 项 0 差异**。提交 `6ba6d0c` / `5036199`。
- **M2-3 富文本编辑器窄屏真实几何回归**：新增常驻 E2E（三档视口断言页级 / `body` / 编辑器根相对视口与宿主容器的宽度 + 宿主 `display: grid` **前置守卫**）+ 独立夹具入口 `/rich-text-editor.html`；负向对照（回退 `min-width: 0`）mobile 失败（`scrollWidth` **1013** vs 390、溢出 **623**）、还原后三档全绿；`test:e2e` **117 passed**（既有 114 + 3，零回归）。提交 `8c7292d` / `2b2fe92`。
- **M2-4 组件设计 §5 组件清单对账守卫**：新增 `check:design-catalog`（接入 `governance:check`）——以 §11 登记成员（48）对账 §5 清单（21 行）的行成员与「（已实现）」标记，五条判定（`phantom-implemented` / `stale-marker` / `scope-narrowed` / `allowlist-stale` / `member-drift`）；**存量漂移修复**：§5 **7 行**已实现但漏标；负向对照 T1 / T2 均 exit 1；单测 **18 例**；§11 解析下沉共享模块。提交 `27c9700` / `5150e21`。
- **M2-5 浮层档位装置判别力补强**：① 内联 ColorPicker 由「只断言计算 `z-index`」升级为「声明层 + 真实绘制顺序命中」；② 命中测试判别力自证扩展到模态内容**后代**；③ 受检清单下沉单一事实源 `test/e2e/fixtures/overlay-panels.json`，`check:overlay-z-index` 新增 **T10 双向对账**（`src` 锚定面板组件 ↔ 清单条目 + 非面板例外名单反向校验）——新增 portal 浮层组件而未补清单即 `governance:check` 失败；三组负向对照均实测失败后还原；守卫单测 **41 例**（34 → +7）。提交 `37552ec` / `d02177c`。

### M3 组件设计一致性回归评估（1 条）

- **M3-1 设计规范 §6 组件约定「可机检性」分级评估**（**纯评估、零 `src/**` 零 `test/**`**）：产出 [`2026-10-01-phase18-m3-1-design-consistency-evaluation.md`](../design/governance/2026-10-01-phase18-m3-1-design-consistency-evaluation.md)——§6 **16 行**约定**无一行属「仅人工」**（主层级 计算样式层 13 / 声明层 2 / 几何层 1；出现次数 算 15 / 声 6 / 几 9 / 交 7）；装置盘点（`check:design` 9 类 + `check:overlay-z-index` T1~T10 + 3 份 contracts + `capture:styles` 262 + e2e 117 + a11y 59 + 组件单测）；覆盖 9 行较完整 / 7 行缺口明显；取证发现 **7 项 §6 ↔ 实现口径漂移**（禁用态计数 37 vs 实测 35 处声明；`:invalid` vs `.caomei-field--invalid`+`aria-invalid`；浮层背景 `bg-elevated` vs 8 面取 `bg`；Popover 圆角；Tag 字号；AutoComplete 阴影字面量；Card 三变体）——**须先裁定再落守卫**；落地建议 P0~P3（待裁定后登记）。提交 `b0567c0`。

### M4 组件文档与口径收口（2 条）

- **M4-1 `Select` 字段层 `class` 落点文档补强**：中英 `select.md` 新增「`class` / `style` 落点」说明——`inheritAttrs: false` 下 `$attrs` 整绑**触发器**、不落字段外层；`--caomei-select-max-width` 宿主为字段外层，覆盖须作用于本元素或其祖先（CSS 变量只向下继承）；与 `select.vue` 注释口径及 `theming §4.1` 一致。提交 `898fbf4`。
- **M4-2 对比度 6 项在册缺口终局结论收口**：产出 [`2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md`](../design/governance/2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md)——6 项**全部维持、不修色**（3.76 / 3.39 / 4.17 / 4.28 / 4.39 / 3.73·4.32:1，阈值 4.5:1）；本批复算 **7/7** 与 M2 记录 8% 口径表一致；`design-spec §3.2` 跟踪指针由 Backlog 改指该记录（**唯一载体**）；**零色值变更**（`git diff -- src/styles/` 为空）、`capture:styles` 262 项 0 差异。提交 `37aa19b`。

### M6 治理台账漂移消缺（1 条）

- **M6-1 治理台账漂移消缺（3 项处置 + 同类回扫）**：**C49** 预备检查记录 §4 的 `Backlog §1.2` → **§1.8**；**C50** `todo.md` 陈旧轮次指针**复核确认无残留**（`rg "第 18 轮"` = 0、仅引第 19 轮）；**C51** `backlog.md` §1.8 行重写为「下游 0.5.0 升级护航」（本仓 0.5.0 已发布、隔两个 minor，差异清单改为触发时按 CHANGELOG 重取）；同类回扫（章节引用 / 轮次 / 版本口径）无其它漂移；回扫新增发现第 4 处（`todo.md` 阶段头「实施未启动」滞后）；**承接 M1-2 延期回扫面**（活载体 `experience-archive.md` 的 `npm version` gotcha 修、点时记录 3 处不回改）；**指针判据沉淀至 [规划规范 §9](../standards/planning.md)**；旧口径逐载体 `rg` 复核零残留。提交 `5921787` / `d3de4e0`。

### 附带交付（非阶段条目）

- **组件画廊侧栏接入与对齐修复**（`25f79fa` / `8667117` / `b89d720`）：画廊进组件侧栏、RichTextEditor 独立「高级组件」分组、卡片安全居中修复（超高演示顶部可达）+ 常驻 E2E。
- **文档口径与设计区侧栏简化**（`8c696d2` / `29dbb86` / `29a7693`）：富文本内核安装前置说明、可选 peer（`md-editor-v3` / `@nuxt/kit`）说明、`/design/` 侧栏只留 7 篇面向使用者的设计文档。
- **发布前预备检查与第 19 轮门槛复核**（`1c9f9b0`）：发布面取证 + 14 项就绪检查 + 发布执行清单 + 长期任务第 19 轮。
- **并行负载 flaky 类登记**（`eea4746`）：根因与累计实例登记（其后由 M2-1 修复）。

### 阶段总结

- **提交对账**：`git log --oneline ed99c7b..d3de4e0 | wc -l` → **41**（下界 = Phase 17 归档批次末条提交 `ed99c7b`，上界 = 本阶段末条状态提交 `d3de4e0`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 41）：Phase 18 本体 **19** + 阶段登记与范围评估 **2** + 发布执行 **2** + 附带交付 **8** + 依赖维护 **10**；逐条清单见[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §2。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 20 轮**门槛复核（零代码改动域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 19 轮逐项一致（无漂移）**；证据见[长期任务](./recurring.md) §3 第 20 轮。
- **回扫口径（三段式）**：见[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **`WISDOM_OK: 15 active entries (threshold 20)`**——**未达阈值、本轮不执行蒸馏**（[规划规范 §7](../standards/planning.md)）；`pnpm check:distill-archive` → **11 段 reconciled**（未新增段）。本阶段 3 条发现已即时落入规范载体（`planning.md §9` 等），未在活跃段累积。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主、无运行时面，故不分区）——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① **M3-1 的 7 项 §6 ↔ 实现口径漂移未处置**——属评估交付的发现，须用户裁定后再落守卫（已登记为该记录 §4 的前置阻塞）；② **0.5.0 已发布、git 侧未推送**（本地领先 `origin/master`、远端 0 tag），推送与阶段末发版时机由用户决定（D2 / D13）；③ 本阶段**零 `src/**` 行为改动**（仅临时负向对照改动、均已还原），候选计数与第 19 轮一致；④ 本仓期间被另一会话并行写入一次（`pull --tags --autostash` 前移 HEAD），开工前已确认工作区洁净；⑤ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题由 HEAD 的 4 个降为 3 个」告警——脚本自带说明「阶段 / 条目标题在 H3/H4，属**归档正常移除面**」，**属预期、非阻断**（Phase 17 归档批次同类观察）；⑥ 归档清理的 `Mx-y` 残留形态**已补机检兜底**——`check-planning-numbers` 受检面扩至规划载体（`docs/plan/todo.md`），负向对照（注入编号 → exit 1）与单测（43 例）齐备，该形态此前在近三次归档复发、原为「Review Gate 必查项」。
- **遗留与后续候选**：Phase 8 未启动（用户 2026-09-28 裁定 D13、2026-09-30 D9 维持）；dependfix `apps/platform` 与 momei 侧迁移由对应仓库执行、本仓等待反馈；Backlog 在册含「下游 0.5.0 升级护航」、`iconOnly` 示例形态（待调研）、组件增强与长尾（条件触发）、a11y 同类悬空引用与 Toast 焦点哨兵、国际化语言覆盖与文案分包体积调研、设计一致性可机检项落地（待 M3-1 口径裁定）等；其余见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：R1 **`Reject`**（1 blocker / 1 warning / 1 suggest）——blocker = 归档后 `todo.md` 残留条目编号 `M3-1`（规划规范 §7 明令禁止、**近三次归档复发**）→ 修复：清除编号**并补机检兜底**（`check-planning-numbers` 受检面扩至 `docs/plan/todo.md`，把「Review Gate 必查」升级为可复算门禁，负向对照 + 单测 43 例齐备），另收口 warning（回扫人工面数字留痕）与 suggest（轮次口径限定）→ **R2 `Pass`（0 blocker / 0 warning / 0 suggest）**。逐轮 findings、逐条处置与实测用时见[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §10。**单点来源界定**（易变计数只在[归档批次记录](../design/governance/2026-10-01-phase18-archive.md) §8 声明）使 Phase 17 的「同一计数跨载体漂移」根因未复发。

---

## Phase 19：设计一致性口径落地、组件文档去重与观感缺陷处置

- 时间：2026-10-02 用户裁定 D1 ~ D13 后登记；2026-10-07 交付 6 条主线 / 14 条原子条目并完成阶段归档（用户指令「开始归档」）。
- 范围与授权（用户决策 2026-10-02）：用户取**组合 A + 组合 B + 组合 C（= M1 + M2 + M3 + M4 + M6）**，并经 **D10 上收 M7**，共 **6 条主线 / 14 条原子条目**（M1 4 / M2 3 / M3 3 / M4 2 / M6 1 / M7 1）；逐条裁定——**D2** 设计规范 §6 七项口径漂移「措辞 + 实现一起改」（含 D3 浮层背景 `bg-elevated`、D4 Popover 圆角、D6 AutoComplete 阴影 token 化三项视觉变更）；**D3** Tab 指示条**修复**；**D4** 富文本下拉取**文档站作用域隔离**；**D5** 迁移映射**3 批全量整改**；**D6** `iconOnly` **改示例**；**D7** 下游升级口径**重写并纳入 M6**；**D8** Phase 8 **继续等待**；**D9** 两条流程约束**纳入 M4**；**D10** 上收国际化调研；**D11** 远端 tag **已授权并推送**；**D12** 组件增强**维持条件触发**；**D13** **按需不预登记发布**。范围依据见[下一阶段范围评估（第三轮）](../design/governance/2026-10-02-next-stage-scope-evaluation.md) §8。
- 非目标：不重指 tag / 不重新发布；不启动 Phase 8；不做组件增强与长尾；不做国际化实现 / RTL；不改品牌色值；不做破坏性 API 变更；不重写下游仓库；不预登记发布条目；不引入 Tailwind / UnoCSS。

### M1 设计一致性口径裁定与守卫落地（4 条）

- **M1-1**：依据 [Phase 18 M3-1 记录](../design/governance/2026-10-01-phase18-m3-1-design-consistency-evaluation.md) §4 逐条修正[设计规范 §6](../design/design-spec.md) 的措辞与计数（D1 禁用态计数 35 / D2 `invalid` 语义 / D5 Tag 字号按档位 / D7 Card 三变体）。提交 `db342c3`。
- **M1-2**：§6 涉及的**实现对齐**（视觉变更）——D3 浮层背景 `bg` → `bg-elevated`、D4 Popover 默认圆角 `md` → `lg`、D6 AutoComplete 阴影走 `--caomei-shadow-md`；同批随 §6 扩写覆盖 **11 处**（D3 原定 8 面 + ConfirmDialog / Drawer / DatePicker）。**V 阶段**真实 Chromium **44 / 44 通过**、负向对照 **11 / 11 失败**；`capture:styles` 262 项 0 差异、`check:design` 全绿。提交 `89c4d82`（实现）/ `1728a0f`（状态）/ `8288638`（验证留痕）；记录见 [M1-2 视觉对齐](../design/governance/2026-10-05-phase19-m1-2-visual-alignment.md)。
- **M1-3**：按 §5 落地 **P1 + P2 装置**（三子批）——**3a** 浮层面板视觉契约固化（采样面 262 → 270）；**3b** §5 P1 五项 + 登记点名项（270 → 297）；**3c** 声明层契约 3 项 + checkbox 采样（297 → 302）。负向对照逐组命中、`capture:styles` **302 项 0 差异**；提交 `222cee7` / `86f1cad` / `ecf019e`；记录见 [3a](../design/governance/2026-10-05-phase19-m1-3a-panel-visual-contract.md) / [3b](../design/governance/2026-10-05-phase19-m1-3b-capture-p1-extension.md) / [3c](../design/governance/2026-10-05-phase19-m1-3c-declaration-contracts.md)。
- **M1-4**：落地 **P3 几何 / 交互层装置**——禁用态尺寸不变（7 组件对）+ Button 角标外扩 + Drawer `90vw`·`90vh` 收敛 + Drawer reduced-motion + 焦点可见扩面（5 组件）；新增 **54 例常驻 E2E**、全量 **186 passed**、`capture:styles` 302 项 0 差异；**发现并修复 Drawer reduced-motion 特异性缺陷**。提交 `522befe`；记录见 [M1-4](../design/governance/2026-10-05-phase19-m1-4-geometry-interaction-devices.md)。

### M2 组件文档一致性整改（迁移映射去重，3 条）

- **M2-1 批 1（ColorPicker / DatePicker）**：删除中英 4 页中段 `> 迁移映射` 正文块并折入迁移节；ColorPicker 纯冗余、DatePicker 折入 `selectionMode` 零用量语义。复算整改前中英各 **6** / 消除 **2** / 当前 **4**。提交 `7139efe`；记录见 [M2-1](../design/governance/2026-10-05-phase19-m2-1-migration-dedup-batch1.md)。
- **M2-2 批 2（Drawer / Message）**：删除中英 4 页正文块；Drawer 折入 `#footer` 映射与零下游用量判据、Message 折入有损近似。复算批前 **4** / 消除 **2** / 当前 **2**。提交 `5d36c3a`；记录见 [M2-2](../design/governance/2026-10-05-phase19-m2-2-migration-dedup-batch2.md)。
- **M2-3 批 3（SplitButton / Tag）**：删除中英 4 页正文块；SplitButton 折入未实现括注、Tag 折入 `info → primary` / `error` 零用量 / `outlined` prop / §9 未决项指针。复算批前 **2** / 消除 **2** / 当前 **0**，**M2 终态中英各 0 页**；**N2 关闭**（该候选行已随登记批次迁出候选池，无残留行）。提交 `cf38ca8`；记录见 [M2-3](../design/governance/2026-10-05-phase19-m2-3-migration-dedup-batch3.md)。

### M3 组件观感缺陷处置（3 条）

- **M3-1 Tab 激活指示条被容器裁剪修复**（视觉变更）：取「`padding-bottom: 1px` + 内阴影」方案，恢复设计意图「2px 主色、分隔线被盖住」；**V 阶段**逐行像素 白/主色/分隔线/白 → 白/主色/主色/白、`triggerClippedPx` 1 → 0；新增声明层契约 + 几何/像素 E2E；顺带结构性消除 1px 纵向溢出（`tabs-list-overflow.e2e.ts` 前置条件同步）；`capture:styles` 302 项 0 差异（采样面不含 Tabs，显式声明非证据）。提交 `7b71b2e`；记录见 [M3-1](../design/governance/2026-10-06-phase19-m3-1-tabs-indicator-clipping.md)。
- **M3-2 RichTextEditor 工具栏下拉留白**：按 D4 取**文档站作用域隔离**（`caomei-demo.css` 新增内核菜单隔离规则），不改组件库 `src/**`；**V 阶段**菜单 20px → 0、菜单项 8px → 0、首项偏移 31 → 11px，正文列表 20px 无回归；新增声明层契约；`docs:build` / `pnpm verify` exit 0；零 `src/**`。提交 `35c6731`；记录见 [M3-2](../design/governance/2026-10-06-phase19-m3-2-rich-text-editor-dropdown-indent-fix.md)。
- **M3-3 Button `iconOnly` 示例形态**：按 D6 改示例（22 个纯图标按钮改走 `#icon` 插槽），组件契约不变；**V 阶段** 22/22 有可见内容、空白 0；新增声明层契约；中英共用示例源；零 `src/**`。提交 `7a70134`；记录见 [M3-3](../design/governance/2026-10-06-phase19-m3-3-button-icon-only-example.md)。

### M4 治理约束载体落地（2 条）

- **M4-1 `.session` 阶段态同步触发点**：`todo-manager` skill Session 收尾协议把「阶段登记 / 归档 / 范围变更批次」显式列为 `.session` 阶段态**必同步触发点**（Step 3.5，含「常见检查 / 交付前检查」引用行）；**不为 git-ignored 载体新增机检守卫**。
- **M4-2 `todo.md` 完成态回填次序**：把「完成态不得早于该条目 Review Gate 结论、两者同批落地后方可提交」固化到 skill Step 1.7（此前仅在 `.session/wisdom.md`，属**首次固化非重述**）。M4-1 / M4-2 同提交 `70a7eb7`；记录见 [M4](../design/governance/2026-10-06-phase19-m4-governance-constraint-carriers.md)。

### M6 下游协同口径消缺（1 条）

- **M6-1**：按 dependfix 实测重写 [Backlog](./backlog.md) §1.8「下游 0.5.0 升级护航」行（**就地重写、不迁出候选池**：dependfix 侧已消费 / momei 侧仍锁 `0.3.0` 待升级），并回扫同类版本口径表述；逐载体 `rg` 复核旧口径零残留；补两仓实测时点。提交 `46cfe17`；记录见 [M6-1](../design/governance/2026-10-06-phase19-m6-1-downstream-version-alignment.md)。

### M7 国际化调研（1 条）

- **M7-1**：调研主流组件库（Vue / React 生态）国际化语言覆盖（L1 取证 6 库语言条目 43 ~ 72，本库 5）与国际化文案**分包 / 体积**工程方案；盘点本库现状（854 行 / 32 KB、单对象根导出、无子路径）并给出 A/B 两条工程路线与 RTL 独立立项判据。**只调研、未改代码**。提交 `1ff2757`；记录见 [M7-1](../design/governance/2026-10-06-phase19-m7-1-i18n-research.md)。

### 附带交付（非阶段条目）

- **Phase 19 登记与范围评估**：`7cf0747`（规划编号守卫豁免进行中阶段条目表）/ `9613eb5`（Phase 19 登记 + 第三轮下一阶段范围评估）。
- **2026-10-02 用户多事项批次**（登记前交付）：`135d632`（文档开发命令自动打开浏览器）/ `dae0b62` + `dad3e91`（RichTextEditor 下拉留白归因与收窄）/ `568b042` + `53976ac`（TabList 多余纵向滚动条修复与回填）/ `f41a2e2`（Accordion 自定义触发器示例修复）/ `449068e` + `c88e6d3`（DataTable 排序指示条列宽稳定与回填）/ `4a2d910`（DataView 迁移映射合并 + 跨组件专项评估 + Backlog 登记）。

### 阶段总结

- **提交对账**：`git log --oneline c69b3e3..1ff2757 | wc -l` → **28**（下界 = Phase 18 归档批次末条提交 `c69b3e3`，上界 = 本阶段末条实现 / 记录提交 `1ff2757`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 28）：Phase 19 本体 **17**（M1 8 = `db342c3` / `89c4d82` / `1728a0f` / `8288638` / `222cee7` / `86f1cad` / `ecf019e` / `522befe`；M2 3 = `7139efe` / `5d36c3a` / `cf38ca8`；M3 3 = `7b71b2e` / `35c6731` / `7a70134`；M4 1 = `70a7eb7`〔M4-1 / M4-2 同提交〕；M6 1 = `46cfe17`；M7 1 = `1ff2757`）+ 阶段登记与范围评估 **2**（`7cf0747` / `9613eb5`）+ 附带交付 **9**（`135d632` / `dae0b62` / `dad3e91` / `568b042` / `53976ac` / `f41a2e2` / `449068e` / `c88e6d3` / `4a2d910`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../design/governance/2026-10-07-phase19-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 21 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 20 轮逐项一致（无漂移）**；证据见[长期任务](./recurring.md) §3 第 21 轮。
- **回扫口径（三段式）**：见[归档批次记录](../design/governance/2026-10-07-phase19-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：活跃条目数、阈值判定与归档段对账见[归档批次记录](../design/governance/2026-10-07-phase19-archive.md) §6。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主、无运行时面，故不分区）——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 19 **含 `src/**` 行为改动**（M1-2 组件背景 / 阴影、M3-1 Tabs 几何、M1-4 Drawer reduced-motion），与 Phase 18 的「零 `src/**` 行为改动」不同；② `capture:styles` 采样面由 **262 扩至 302**（M1-3 三子批），属预期变更（同族变更见 [M1-3a](../design/governance/2026-10-05-phase19-m1-3a-panel-visual-contract.md)）；③ 本批顺带修正 `todo-archive.md` 主窗口阶段块顺序（原 Phase 18 块误置于 Phase 17 之前），现按时间序 13 → 14 → 15 → 16 → 17 → 18 → 19 排列；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——脚本自带说明「阶段 / 条目标题在 H3/H4，属归档正常移除面」，属预期、非阻断；⑤ 归档载体行数超 `docs:check:line-count` 的 warn 阈值（warn > 400 / error > 600，**非阻断**）——归档载体只增不减，本批接受；⑥ 归档后 `check:governance-records` 报 **9 处** `stale-planning-pointer`（Phase 18 记录表头「关联条目」指向 `todo.md`）；同批改指 **9 份 Phase 18 + 主动改指 14 份 Phase 19** 记录表头至 `todo-archive.md`，复跑 exit 0。
- **遗留与后续候选**：Phase 8 未启动（用户 2026-09-28 裁定 D13、2026-10-02 D8 维持）；dependfix `apps/platform`（已升级 `0.5.0`、M34 归档）与 momei 侧迁移由对应仓库执行、本仓等待反馈；Backlog 在册含「下游 0.5.0 升级护航」、组件增强与长尾（条件触发）、a11y 同类悬空引用与 Toast 焦点哨兵、文档站浮层泄漏常驻浏览器断言、国际化语言覆盖与文案分包体积（调研结论已出、实现待规模触发）、RTL 独立立项等；其余见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：R1 **`Reject`**（1 blocker：归档记录 §4① 的**描述性样例**（`todo.md` 链接后紧邻 `Phase 18`）自触发 `stale-planning-pointer`，使 `governance:check` / `verify` 必失败；1 warning：§8 易变计数未取终态；3 suggest）→ 修复（§4① 去链接化 + 主动改指 14 份 Phase 19 记录表头 + §8 重取终态）→ **R2 `Pass`**（0 blocker；RG-B1 / RG-S1 / RG-S2 / RG-S3 关闭；RG-W1 回填记「已修复未复审」）。逐轮 findings 见[归档批次记录](../design/governance/2026-10-07-phase19-archive.md) §10。

---

## Phase 20：测试装置扩面、治理守卫补口与发布收口

- 时间：2026-10-07 用户裁定 D1 ~ D13 后登记；2026-10-09 交付 5 条主线 / 12 条原子条目并完成阶段归档（用户指令「开始归档」）。
- 范围与授权（用户决策 2026-10-07）：用户取**组合 A + 组合 B + 组合 C（= M1 + M2 + M3）**，并**纳入 M6 发布收口**（D4 发 0.6.0）、**上收 M7 视觉回归基线立项评估**（D9）；**M5 国际化路线 / M4 组件能力不纳入**（D6 / D8 维持登记），共 **5 条主线 / 12 条原子条目**（M1 4 / M2 5 / M3 1 / M6 1 / M7 1）。逐条裁定——**D2** Phase 8 **只出范围评估、不启动**；**D3** 测试装置扩面三项**全纳入**；**D4** 发 **0.6.0**；**D5** 基建守卫五项**全纳入**；**D6** 国际化 / RTL 维持登记；**D7** 归档载体超阈维持登记；**D8** 组件能力维持条件触发；**D9** 上收视觉回归基线立项评估；**D10 ~ D12** 文档站长投 / 其余守卫 / 下游协同维持；**D13** 发布已登记为 M6-1 条目。范围依据见[下一阶段范围评估（第四轮）](../design/governance/2026-10-07-next-stage-scope-evaluation-4.md) §8。
- 非目标：不纳入国际化路线落地 / 组件能力与长尾；不重写 / 不修改下游仓库；不做破坏性 API 变更；不启用 CI 自动发布；不改品牌色值；不重指已发布 tag；不引入 Tailwind / UnoCSS。

### M1 测试装置与覆盖扩面（4 条）

- **M1-1 Tabs 纳入 `capture:styles` 采样面**：采样面 **302 → 308**（Tabs 横 / 纵各 3 项），判定「指示条可稳定采样」；冻结基线重取后 **0 差异**、`capture.test.mjs` **17 passed**；两轮负向对照各命中 3 处。提交 `852908b`；记录见 [M1-1](../design/governance/2026-10-07-phase20-m1-1-tabs-capture-face.md)。
- **M1-2 焦点可见扩面补全**：受检面 **5 → 31 项（+26）**，新增下界守卫 `MIN_FOCUS_TARGETS = 31`；负向对照 9 处失败；`test:e2e` **276 passed**。提交 `8d8a775`；记录见 [M1-2](../design/governance/2026-10-07-phase20-m1-2-focus-visible-expansion.md)。
- **M1-3 禁用态几何扩面补全**：受检面 **7 → 18 对（+11）**，下界守卫 `MIN_DISABLED_PAIRS = 18`；负向对照 9 处失败；`test:e2e` **312 passed**。提交 `437431f`；记录见 [M1-3](../design/governance/2026-10-07-phase20-m1-3-disabled-geometry-expansion.md)。
- **M1-4 文档站浮层泄漏常驻浏览器断言**：把一次性探针转为常驻 Playwright 规格 `test/e2e/docs-theme-isolation.e2e.ts`（`docs:build` 产物 + 每周回归），负向对照 1 failed；`test:e2e:gallery` **11 passed**。提交 `f3b3b78`；记录见 [M1-4](../design/governance/2026-10-07-phase20-m1-4-docs-theme-isolation.md)。

### M2 基建与治理守卫补口（5 条）

- **M2-1 a11y 同类悬空引用处置**：分组无内嵌标签时省略 `aria-labelledby`（槽内标签在位检测 + 显式透传优先）、折叠触发器统一省略 `aria-controls`（Reka 内容 id 非响应式）；新增共享机构 `_shared/slot-presence`；axe 不判本类 → 真实 Chromium 复验 + 等价断言；`test:a11y` 59。提交 `5d3ce82`；记录见 [M2-1](../design/governance/2026-10-07-phase20-m2-1-a11y-dangling-refs.md)。
- **M2-2 文档站主题 CSS 纳入 lint 面**：`lint:css` 的 glob 追加 `docs/.vitepress/theme/**`（引号化交由 Stylelint 展开），存量 4 处记号等价 `--fix` 清零。提交 `2149de1` + `c6158ce`；记录见 [M2-2](../design/governance/2026-10-07-phase20-m2-2-docs-theme-stylelint.md)。
- **M2-3 直连 Reka 触发器机检守卫**：新增 `check-reka-trigger-usage`（接入 `governance:check`）——本库已有包装时禁止组件内直连同型触发器；受检 **197 文件 / 0 违规**；单测 14 例 + 负向对照。提交 `d8641c6`；记录见 [M2-3](../design/governance/2026-10-07-phase20-m2-3-reka-trigger-guard.md)。
- **M2-4 浮层交互 E2E 规格**：新增 `overlay-interaction.e2e.ts`（Dialog / ConfirmDialog 焦点落位 + 滚动锁复位，2 用例 × 三视口）；负向对照 `:modal=false` 1 failed；`test:e2e` **318 passed**。提交 `62431d0`；记录见 [M2-4](../design/governance/2026-10-07-phase20-m2-4-overlay-interaction.md)。
- **M2-5 执行层规则重述与失效引用收敛**：任务粒度阈值重述收敛为链接引用（唯一权威 = 规划规范 §5）；扩展 `check:audit-protocol` 新增 `granularity-threshold` 规则 + 新增 `check-ai-asset-links`（AI 资产链接与 GitHub slug 锚点）。提交 `e996656`；记录见 [M2-5](../design/governance/2026-10-07-phase20-m2-5-audit-protocol-convergence.md)。

### M3 下游协同与 Phase 8 评估（1 条）

- **M3-1 Phase 8 下游兼容性回归启动范围评估**（**评估不等于启动**）：前置三条件 ①② 成立、③ 因 dependfix 完成全量迁移并稳定消费 `0.5.0` 由「不完全成形」推进为「**部分成形**」；已接入下游清单（dependfix / momei）、触发形态四选（以 [发布指南 §10](../guide/release.md) 的 A/B + 失败即阻塞为基线）、容量边界（发布触发、`typecheck + build`）；启动前待决策 D1 ~ D6。用户初步取向（2026-10-08）：**下阶段正式启动、以 dependfix 为试点**。提交 `2c803e0` + `ac21a46`；记录见 [M3-1](../design/governance/2026-10-08-phase8-downstream-regression-scope-evaluation.md)。

### M6 发布收口（1 条）

- **M6-1 0.6.0 发布**：长期任务**第 22 轮**门槛复核（`d22f034`）→ `pnpm verify` 全绿 → `npm version 0.6.0`（`5c48387` + annotated tag `v0.6.0`；首跑被 `check-review-gate-artifacts` 阻断，根因 = `package.json` 缺末尾换行，`ef65a33` 修复）→ `pnpm changelog`（`b083a53`）→ 本地 `npm publish`（registry `latest` = 0.6.0）→ 发布后校验 + 版本句同步（`ead6624`，消解 `docs:check:version` 4 处红）→ 同源漂移 9 文件归一（`e14edc0`）+ 新增 `check-final-newline` 守卫（`8e3c395`，根治）→ **GitHub Release 回填** `v0.1.0` ~ `v0.6.0`（推送 `master` + tags 后）→ 发布执行记录（`a87f657`）。记录见 [M6-1](../design/governance/2026-10-08-phase20-m6-1-release-execution.md)。

### M7 视觉回归基线立项评估（1 条）

- **M7-1**：评估 Playwright 截图比对形态（基线库 / 容差 / CI 集成成本），**只出立项建议、不建实体基线、不改代码**；结论 = 采用 Playwright **内置 `toHaveScreenshot`** + 仓库内冻结基线（零外部服务 / 零新依赖，与下游 dependfix / momei 同构），给出双轴容差、CI 先非阻断后转阻断与待决策 D1 ~ D6。提交 `6d992d8`；记录见 [M7-1](../design/governance/2026-10-08-m7-1-visual-regression-baseline-evaluation.md)。

### 附带交付（非阶段条目）

- **Phase 20 登记与范围评估**：`95aea81`（Phase 20 登记 + 第四轮下一阶段范围评估）。
- **发布机制评估**（用户指令）：`c4f2e3f`（统一手动发布流 + 1.x / 自动化发布评估，只出建议；记录见 [Release flow eval](../design/governance/2026-10-08-release-flow-and-version-strategy-evaluation.md)）。
- **Phase 19 归档批次回填**（窗口内、属上一阶段）：`83ff5b4`（回填 Phase 19 归档批次提交号）。

### 阶段总结

- **提交对账**：`git log --oneline 29662c7..c4f2e3f | wc -l` → **24**（下界 = Phase 19 归档批次提交 `29662c7`，上界 = 本阶段末条记录提交 `c4f2e3f`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 24）：Phase 20 本体 **21**（M1 4 = `852908b` / `8d8a775` / `437431f` / `f3b3b78`；M2 6 = `5d3ce82` / `2149de1` / `c6158ce` / `d8641c6` / `62431d0` / `e996656`；M3 2 = `2c803e0` / `ac21a46`；M6 8 = `ef65a33` / `5c48387` / `b083a53` / `ead6624` / `e14edc0` / `8e3c395` / `d22f034` / `a87f657`；M7 1 = `6d992d8`）+ 阶段登记与范围评估 **1**（`95aea81`）+ 附带交付与上一阶段回填 **2**（`c4f2e3f` / `83ff5b4`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../design/governance/2026-10-09-phase20-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 23 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 22 轮逐项一致（无漂移）**；证据见[长期任务](./recurring.md) §3 第 23 轮。
- **回扫口径（三段式）**：见[归档批次记录](../design/governance/2026-10-09-phase20-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：22 条活跃条目 ≥ 阈值 → **本轮执行蒸馏**（migrate 22），段计数与落点见[归档批次记录](../design/governance/2026-10-09-phase20-archive.md) §6。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 20 **含 `src/**` 行为改动**（M2-1 a11y 引用型属性）且**完成一次发布**（0.6.0），与 Phase 19 不同；② `capture:styles` 采样面由 **302 扩至 308**（M1-1），属预期变更；③ 归档载体行数（Phase 20 块后）超 `docs:check:line-count` 的 warn 阈值（warn > 400 / error > 600，**非阻断**）——归档载体只增不减；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——属归档正常移除面，**预期、非阻断**；⑤ 归档后 `check:governance-records` 报 `stale-planning-pointer`（Phase 19 及更早记录表头「关联条目」指向 `todo.md`），同批改指 `todo-archive.md`。
- **遗留与后续候选**：**Phase 8 未启动**（用户 2026-10-08 初步取向：**下阶段正式启动、以 dependfix 为试点**）；**发布机制评估**待决策 D1 ~ D6（统一手动流形态 / 1.x / 自动化发布）；dependfix（`0.5.0`，可升级 `0.6.0`）与 momei（锁 `0.3.0`、部分迁移）由对应仓库执行、本仓等待反馈；Backlog 在册含组件增强与长尾、国际化语言覆盖与文案分包（实现待规模触发）、RTL 独立立项、视觉回归基线（立项评估已出、实施待裁定）、下游 0.5.0 升级护航、依赖安全告警（推送时 GitHub 提示默认分支 13 条）等；其余见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：结论见[归档批次记录](../design/governance/2026-10-09-phase20-archive.md) §10。

---

## Phase 21：下游回归机制启动、发布流统一与视觉基线落地

- 时间：2026-10-10 用户裁定 D1 ~ D15 后登记；2026-10-10 交付 **7 条原子条目 + 1 条移出**（M1-2 转为遗留项）并完成阶段归档（用户指令「归档」）。
- 范围与授权（用户决策 2026-10-10）：用户取**组合 A + B + C + D**（= M1 + M2 + M3 + M4），共 **4 条主线 / 8 条原子条目**（M1 2 / M2 2 / M3 2 / M4 2）。逐条裁定——**D2** Phase 8 **启动**（同日经用户复议**变更为「上游触发 + 上游执行」**，见[形态变更记录](../design/governance/2026-10-10-phase21-m1-form-change-upstream-executed.md)）；**D3** 仅 dependfix 试点；**D4** 沿用 §10「兼容性阻塞」；**D5** 不取 A（无跨仓凭据）；**D6** 统一手动流取**脚本编排**；**D7** **暂不进入 1.x**；**D8** 自动化发布**维持手动**；**D10** 视觉回归基线**立项落地**；**D11** 归档载体超阈**维持**；**D12 / D13** 组件能力 / 国际化与 RTL **维持登记**；**D14** 其余候选**维持登记**；**D15** **阶段末统一收口**。范围依据见[下一阶段范围评估（第五轮）](../design/governance/2026-10-10-next-stage-scope-evaluation-5.md) §8。
- 非目标：不启用定时（cron）自动发布、不放开 `release.yml` publish；不进入 1.x；不建立外部视觉服务 / 快照库；不压缩归档载体；不纳入组件能力与长尾（B1 ~ B7）、国际化与 RTL（B9 ~ B11）；不重写已发布 tag；不做破坏性 API 变更；不修改下游仓库业务代码。

### M1 下游回归机制启动（Phase 8）（2 条；**1 条交付、1 条移出**）

- **M1-1 上游执行的下游兼容检查 workflow**（**含形态变更**）：初版为 reusable workflow `.github/workflows/compat-check.yml`（`on: workflow_call`，提交 `abd55d8`）——用户 2026-10-10 复议指出该形态**不绑定仓库**、实际由下游加调用 job 执行，主张由**上游触发并执行**。**变更**：删除 `compat-check.yml`、新增 **`.github/workflows/downstream-compat.yml`**（提交 `66822e3`）——`on: push: tags: ['v*']` + `workflow_dispatch`；上游 runner **checkout 下游源码** → `pnpm i --frozen-lockfile` → `pnpm --filter @dependfix/platform add caomei-ui@<v>` → 构建 workspace 依赖（core / engine / cli）+ `nuxt prepare` → `platform typecheck` → `platform build`；受检清单登记于 `matrix`；**记录下游 SHA** 归因。**无需下游改动**；形态属**新增第 5 形态**（不在评估 §4 的 A/B/C/D）。RG：R1 `standard` **Reject**（1 blocker：`Setup Node.js` 的 `cache-dependency-path` 指向尚未检出的下游路径 → setup-node 报错；3 warning）→ 修复（下游 checkout 前移 + 活载体口径回扫）→ **R2 `standard` Pass**。**本地等价命令链全链 exit 0**（clone dependfix → install → 覆盖 `caomei-ui@0.6.0` → 三包构建 → `nuxt prepare` → `typecheck` → `build`；下游 SHA `722bbe26`）。记录见[形态变更记录](../design/governance/2026-10-10-phase21-m1-form-change-upstream-executed.md) 与[初版记录](../design/governance/2026-10-10-phase21-m1-1-compat-check-workflow.md)（点时记录）。
- **M1-2（**移出为遗留项**）**：以 dependfix 为试点的一次**真实贯通验证**——工作流已交付并经本地等价命令链验证；**首次 GitHub 真实触发待推送**（以确认 Actions 运行时：表达式求值 / checkout 权限 / 缓存命中）。**转 [Backlog](./backlog.md) §1.8 在册**（触发条件 = 下次推送）。

### M2 发布流统一（2 条）

- **M2-1 统一手动发布流脚本编排**：新增 `scripts/release/manual-release.mjs` + `pnpm release:manual`——单入口 **7 步**（`preflight` / `bump` / `changelog` / `publish` / `verify` / `sync` / `announce`）+ `run`；**不引入新依赖**；`bump` 只改 `package.json` 版本行、`changelog` 只改 `CHANGELOG.md`（分两次提交命中发布元数据豁免）；变更型步骤由 `MUTATING_STEPS` 集中前置 `--yes` / `--dry-run` 门禁；`sync` 守卫前置 + 独立提交；**不自动 push**；`announce` 用 `--verify-tag`。抽出 `scripts/shared/version-statements.mjs`（版本声明句锚点单一事实源）。单测 **16 例**。RG：R1 `standard` **Reject**（1 blocker：`sync` 写入后不提交致推送态 CI 必红）→ 修复 → **R2 `standard` Pass**。提交 `05d830c`；记录见 [M2-1](../design/governance/2026-10-10-phase21-m2-1-manual-release-flow.md)。
- **M2-2 发布指南 §3 同步为脚本编排说明面**：§3 由 8 步清单重写为脚本编排说明面（一键 / 分步 / runbook / 提交与豁免边界 / 文档同步边界 / CHANGELOG 口径；原内容全部保留）；固化「3 次提交与发布元数据豁免边界」（`chore(release)` / `docs(changelog)` 豁免、`sync` 版本句提交**不豁免**须先有新鲜 RG 工件）；英文页补「Manual release (local)」节。RG：R1 `standard` **Pass**。提交 `4392309`；记录见 [M2-2](../design/governance/2026-10-10-phase21-m2-2-release-guide-sync.md)。

### M3 视觉基线落地（2 条）

- **M3-1 Playwright 视觉回归基线装置与首批基线**：新增 `playwright.visual.config.ts`（独立配置：固定环境 chromium / 1280×800 / DPR 1 / `zh-CN` / `Asia/Shanghai` / `reducedMotion: reduce`；**双轴容差** `threshold 0.1` + 绝对 `maxDiffPixels 100`；`animations: disabled` / `caret: hide` / `scale: css`；串行 `workers: 1` / `retries: 0`；`snapshotPathTemplate`）+ `test/visual/components.visual.ts`（受检面登记 8 个静态组件 × 亮暗 + **下界守卫** `MIN_SECTIONS = 8` + **负向对照开关**）+ **16 张冻结基线 PNG** 随仓库提交 + `pnpm test:visual` / `test:visual:update`；复用既有 E2E 夹具（独立端口 4601）。判别力自证：负向对照 **16 张全部报差异**、正常复跑 0 差异。RG：R1 `standard` **Pass**（1 warning：基线生成于本地容器 vs CI，延期首个 CI run）。提交 `88452e1`；记录见 [M3-1](../design/governance/2026-10-10-phase21-m3-1-visual-baseline-device.md)。
- **M3-2 CI 接入（先非阻断）与文档**：`regression-weekly.yml` 的 `e2e` 作业在 `capture:styles` 后新增 `test:visual`（**`continue-on-error` 非阻断**，沿用同作业 Chromium）；`testing.md` §2.1 新增「真实渲染整体像素层」条 + §6 命令；`development.md` 命令表补 `pnpm test:visual`。口径：先非阻断观测 → 首个 `ubuntu-latest` 全绿 run 且实证字体渲染一致性后评估转阻断；不进 `pnpm verify` 常驻链；Backlog 登记「视觉基线转阻断评估」跟踪项。RG：R1 `standard` **Pass**。提交 `d5bc5c0`；记录见 [M3-2](../design/governance/2026-10-10-phase21-m3-2-visual-baseline-ci-docs.md)。

### M4 治理口径收口（2 条）

- **M4-1 发布指南 §10 下游清单口径修正（接入即登记）**：§10 由「下游兼容性回归（后置）」重写——状态改「已启动」（2026-10-10 随路线图 Phase 8、dependfix 试点，历史注保留）；受检清单改**实测消费面** + 零消费目标下游标注「接入后增量登记」+「接入即登记」约定；补触发与容量边界；英文页同步；`architecture.md §7` 状态口径同步（延迟启用 → 2026-10-10 启动）。**形态变更后**进一步收敛为「受检面 = 工作流 `matrix` 登记」（当前仅 dependfix；momei 已消费待接入）。RG：R1 `standard` **Pass**（3 warning + 3 suggest 已收口，记「已修复未复审」；一处实测发现：从 guide 页链接治理目录为 **VitePress 死链**，故归属引用用行内代码）。提交 `734ed19`；记录见 [M4-1](../design/governance/2026-10-10-phase21-m4-1-release-guide-s10-onboarding.md)。
- **M4-2 归档载体超阈维持留痕**：Backlog §1.6 候选行补 D11 维持理由（未达 error 阈值 600 / 压缩属预防性）+ **再评估触发**（达 600 时强制压缩）+ 计数口径（479，与 `docs:check:line-count` 一致）。RG：R1 `quick` **Pass**。提交 `5b94b09`；载体留痕见 [Backlog](./backlog.md) §1.6 的「归档载体行数超阈压缩」候选行。

### 附带交付（非阶段条目）

- **形态变更回填**：`61129de`（回填[形态变更记录](../design/governance/2026-10-10-phase21-m1-form-change-upstream-executed.md)的 Review Gate 结论）。
- **Backlog 新增跟踪项**（窗口内、随 M3/M1 交付产生）：视觉基线转阻断评估（M3-2）、下游兼容检查首次真实贯通验证（M1-2 移出）、提交驱动 CI 自动发布 / 1.x 策略（登记批次）。

### 阶段总结

- **提交对账**：`git log --oneline ba9587f..61129de | wc -l` → **10**（下界 = Phase 20 归档批次提交 `ba9587f`，上界 = 本阶段末条记录提交 `61129de`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 10）：阶段登记与范围评估 **1**（`ffbb9fc`）+ Phase 21 本体 **8**（M1 2 = `abd55d8` / `66822e3`；M2 2 = `05d830c` / `4392309`；M3 2 = `88452e1` / `d5bc5c0`；M4 2 = `734ed19` / `5b94b09`）+ 附带回填 **1**（`61129de`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `test:visual` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../design/governance/2026-10-10-phase21-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 24 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 23 轮逐项一致（无漂移）**；证据见[长期任务](./recurring.md) §3 第 24 轮。
- **回扫口径（三段式）**：见[归档批次记录](../design/governance/2026-10-10-phase21-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：**0 条活跃条目**（阈值 20，**未达阈值、不蒸馏**）；`check:distill-archive` 段数见批次记录 §8。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 21 **零 `src/**` 行为改动**（全部为 CI / 脚本 / 测试装置 / 文档），**未发布新版本**（`latest` 仍为 0.6.0）；② **M1-2 移出为遗留项**（真实贯通验证待推送）；③ 归档载体行数（Phase 21 块后）超 `docs:check:line-count` warn 阈值（**非阻断**）——归档载体只增不减；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——属归档正常移除面，**预期、非阻断**；⑤ 归档后 `check:governance-records` **0 处 `stale-planning-pointer`**（该守卫只识别「链接文字含编号」形态）；另**主动**把 7 份 Phase 21 记录表头的散文指针（链接文字为「待办事项」、编号写在链接之外，机检不命中）改指 `todo-archive.md`；⑥ **本地 `master` 领先 `origin/master` 10 个提交未推送**（Phase 21 全部提交），推送由用户授权；⑦ 实测发现：从 guide 页链接 `docs/design/governance/**` 为 **VitePress 死链**（治理目录不进站点构建），引用一律用行内代码。
- **遗留与后续候选**：**M1-2 首次真实贯通验证**（Backlog §1.8，触发 = 下次推送）；**视觉基线转阻断评估**（Backlog §1.6，触发 = 首个 `ubuntu-latest` 全绿 run）；**提交驱动 CI 自动发布**与**进入 1.x 的版本策略**（Backlog §1.6，D7 / D8 维持）；下游 0.5.0 升级护航（momei 触发时）；Backlog 其余候选见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：结论见[归档批次记录](../design/governance/2026-10-10-phase21-archive.md) §10。

## Phase 22：机制真实贯通、依赖安全与升级治理、治理与测试收口

- 时间：2026-10-10 用户就关键决策点裁定后登记；2026-10-12 交付**全部 10 条原子条目**并完成阶段归档（用户指令「归档」）。
- 范围与授权（用户决策 2026-10-10）：用户就**关键决策点**裁定（评估 §5 的 14 个决策点收敛为 3 个关键问题）——取**组合 A + B + C**（= M1 机制真实贯通 + M2 依赖安全与升级治理 + M6 治理与测试收口），共 **3 条主线 / 10 条原子条目**（M1 2 / M2 3 / M6 5）。逐条裁定——**D2** 运行时安全告警（`source-map-js`）**立即插队处置**；**D4** 大版本升级**逐项评估、达标即升**（`vite 5→8` 单独评估延后）；**D8** 归档载体**维持**（接受 warn）；**D9** M6 纳入 B16 / B17 / B19 / B22；其余按默认落定（D3 dev 告警 critical / high 优先、D5 `workflow_dispatch` 提前触发、D6 视觉基线首跑后评估转阻断、D7 受检面维持、D10 ~ D14 维持登记 / 阶段末统一收口）。范围依据见[下一阶段范围评估（第六轮）](../design/governance/2026-10-10-next-stage-scope-evaluation-6.md) §8。
- 非目标：不启用定时（cron）自动发布、不放开 `release.yml` publish、不进入 1.x（B27 / B28 维持登记）；不纳入组件能力与长尾（B1 ~ B7 维持条件触发）、国际化与 RTL（B9 ~ B11 维持登记）、`useDialog` / Toast 焦点哨兵 / 多版本托管 / Storybook / Tailwind preset 等（维持裁定）；不压缩归档载体；不为未接入目标下游建机制；不改组件公共 API、不做破坏性变更；不重写已发布 tag；不引入 Tailwind / UnoCSS。

### M1 机制真实贯通（2 条）

- **M1-1 下游兼容检查首次真实触发**（提交 `28b4873`；记录见 [M1-1](../design/governance/2026-10-12-phase22-m1-1-downstream-compat-first-run.md)）：以 `workflow_dispatch` 触发 `.github/workflows/downstream-compat.yml` 的 **run #1**（`38238208301`，`master` @ `5012d94`）**成功**——作业 `Compat / dependfix` **1 分 46 秒**、**12 个步骤全 success**；被测 **`caomei-ui@0.6.0`**（入参留空 → registry latest）、下游归因 **`dependfix @ 46c6fb61`**；消费面复算 = 25 个 `.vue` / 394 个 `Caomei*` 标签 / 28 个组件 + `caomei-ui/nuxt` 接线 ⇒ **管道贯通成立、Actions 运行时无阻断性缺陷**。**如实登记的未覆盖边界**：显式版本入参分支 / tag 自动触发分支未执行；**本轮非版本差验证**（下游已精确锁 `0.6.0`，Override 为同版本重装 → 不构成判别力证据、无负向对照）。**附带事实**：`ubuntu-latest` 自 2026-10-19 起迁移 Ubuntu 26.04（本仓 10 处，转 M1-2 输入并登记 Backlog §1.6）；两下游 `package.json` 实测均已 `0.6.0`（Backlog §1.8 快照同步，原触发条件已不成立、处置待裁定）。RG：R1 `standard` **Pass**（0 blocker / 4 warning / 4 suggest 同批收口）。
- **M1-2 视觉基线首个 CI run 复核与转阻断**（提交 `422bc20`；记录见 [M1-2](../design/governance/2026-10-12-phase22-m1-2-visual-baseline-first-ci-run.md)）：首个真实 CI run `38246131758`（`workflow_dispatch`，`master` @ `5012d94`）全绿（`test:e2e` 318 / `test:e2e:gallery` 11 / **`test:visual` 17 passed**；运行器 `ubuntu-24.04`）。**跨环境渲染一致性经三次探针取证达「逐字节相同」**（限本次采样面 / 当次镜像 / 该 Playwright 版本）——① 容差收紧至 `maxDiffPixels: 0` 全绿（零个超 `threshold 0.1` 的非-AA 差异像素）；② `--update-snapshots` 日志**无**写盘行（机制：基线已存在时改写基线的唯一路径必打印该行）⇒ 16 张采集与仓库基线逐字节相同；③ 正对照（装置负向对照开关）出现 **16 行**写盘 + 产物裁剪尺寸 `→ 240×85 / 240×93 / 240×115`（+48px = 2×24px）⇒ 判别力自证 + 产物确为 CI 采集；字体包 CI↔本地**逐包同版本**（含 CJK 回退 `fonts-wqy-zenhei`）。**判定 = 转阻断**（视觉步骤移除 `continue-on-error`；转正条件两项均满足）**且不需重冻结基线**；用户裁定**不钉运行器镜像**，再评估触发 = `Set up job` 的 `Image:` 出现 `ubuntu-26.04` 即重冻结。V 阶段由 `@ui-validator` 承担（无视觉通道，全部为机检 / 定量证据）。RG：R1 `standard` **Pass**（0 blocker / 1 warning / 3 suggest 同批收口）。

### M2 依赖安全与升级治理（3 条）

- **M2-1 运行时安全告警插队处置**（提交 `6e80f9a`）：`source-map-js`（high；GHSA-68fv-2mgg-jv7q）经 `pnpm-workspace.yaml` 的 `overrides: source-map-js: ^1.2.2` 强制修复（pnpm 11 不再读取 `package.json` 的 `pnpm` 字段）；lockfile 解析 `1.2.1 → 1.2.2`、无旧版残留。RG `deep` **Pass**。**库内记录见 [Phase 23 M5-2 补录](../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**（原结论仅存本地态工件，偏差见「已知观察」②）。
- **M2-2 开发作用域安全告警盘点与分批处置**（提交 `50caea7`；记录见 [M2-2](../design/governance/2026-10-10-phase22-m2-2-dev-alerts-remediation.md)）：Dependabot **dev 作用域告警 15 项**逐项给「受影响区间 + 补丁版本 + 传递链 + 结论」——**已修复 10**（`handlebars` / `devalue` / `shell-quote` / `serialize-javascript` / `brace-expansion`，经 `overrides`）+ **受阻 4**（`simple-git` 3.x 全线无补丁 + `@simple-git/argv-parser`）+ **无修复版本 1**（`node-forge`）。RG：R1 `deep` **Reject**（1 blocker：残留扫描证据）→ 修复 → R2 `deep` **Pass**。
- **M2-2 后续：`simple-git` 跨大版本升级与兼容补丁**（提交 `56aea73`；记录见 [后续记录](../design/governance/2026-10-10-phase22-m2-2-simple-git-override-upgrade.md)）：由 `3.36.0` 升至精确 `4.0.2`（`overrides`）+ `patchedDependencies` + `patches/simple-git@4.0.2.patch`（397 B，仅恢复 v4 移除的默认导出，修复 `@nuxt/devtools` 的 `import Git from 'simple-git'`）；处置 4 项告警 → M2-2 收敛为**已修复 14 / 无补丁 1**。
- **M2-3 依赖大版本升级逐项评估与达标升级**（提交 `e01f301`；记录见 [M2-3](../design/governance/2026-10-10-phase22-m2-3-major-upgrades.md)）：处置 7 个 open PR（D4「逐项评估、达标即升」）——**达标即升 3**（`vue 3.5.43` / `@lucide/vue ^1.48.0` + `THIRD-PARTY-LICENSES` 同步 / `typescript 6.0.3` 含 tsconfig 迁移 `moduleResolution: Node → Bundler`）；**陈旧 PR 2**（`vite` / `vitest`，本仓已达标）；**延后 2**（`reka-ui 2.10.5` 致 `input-number` 步进回归、`conventional-changelog 8` 与 writer 9 不兼容）→ 登记 Backlog §1.6。RG `deep` R1 **Pass**。

### M6 治理与测试收口（5 条）

- **M6-1 归档载体维持的载体留痕**（提交 `86caf15`）：`todo-archive.md` 行数超阈按 D8 **维持**，Backlog §1.6 对应行同步计数（527）与维持裁定 + 再评估触发（达 error 阈值 600 强制压缩）。门禁 `lint:md:check` / `docs:check` / `governance:check` 均 exit 0。RG `quick` **Pass**。**库内记录见 [Phase 23 M5-2 补录](../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**。
- **M6-2 `locale` 守卫能力演进**（提交 `e93c557`）：`check-locale-keys` 解析器容忍注释（字符串感知剥离注释、未闭合块注释响亮失败、容忍缩进 / 行尾 / 块注释）+ 单测 28 例；`check:locale-keys` / `check:locale-ledger` 全绿；`development.md` §7 / §11 同步。RG `standard` **Pass**。**库内记录见 [Phase 23 M5-2 补录](../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**。
- **M6-3 治理索引与记录计数对账守卫**（提交 `5012d94`；记录见 [M6-3](../design/governance/2026-10-11-phase22-m6-3-governance-counts-guard.md)）：新增 `check-governance-counts`（治理索引摘要 ↔ 记录本体的测试 / e2e / 记录 / 文档取证命令计数对账；**误报实测 0**、受检面下界 40）+ 11 例单测 + 接入 `governance:check` + [AI 协作规范 §9](../standards/ai-collaboration.md) 机检面登记。RG：R1 `standard` **Reject**（1 blocker：对账计数自引用陷阱）→ R2 **Reject**（同根因复发）→ **R3 `Pass`**。
- **M6-4 文档站演示动画遗留项**（提交 `47e2084`）：新增 `check-demo-keyframes`（14 个演示区 keyframes 副本 ↔ 组件源 body 等价 + 未登记 / 悬空 + 受检面下界）+ 9 例单测；`lint:css` 受检面纳入 `docs/examples`；`development.md` §7 / §11 同步。RG `standard` **Pass**。**库内记录见 [Phase 23 M5-2 补录](../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**。
- **M6-5 文档站示例外部图片依赖消除**（提交 `59c1073`）：10 个示例（zh / en）改用**本地占位图** + `withBase`，移除 `picsum.photos`；新增 `docs/public/demo/*.svg` ×4；构建产物 4 资源 HTTP 200、示例无外链。RG `standard` **Pass**（RG-W01 已收口、相关 suggest 转 Backlog「文档站示例外链图片守卫」）。**库内记录见 [Phase 23 M5-2 补录](../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**。

### 附带交付（非阶段条目）

- **`simple-git` 强制升级与兼容补丁**（提交 `56aea73`）：见 M2-2 后续条（M2-2 的前置记录 §3「受阻」结论的再评估落地）。
- **窗口内新增 Backlog 跟踪项**（随交付产生）：文档站示例外链图片守卫（M6-5）、视觉基线受检面扩面（M1-2）、CI 运行器镜像钉定（M1-1）、`reka-ui` 补丁升级与 `conventional-changelog` 8 升级（M2-3）。
- **窗口内跨载体订正**：M1-2 索引条目把 M6-3 的「当前仓 66 条对账」现在时口径改为「当时仓 66 + 2026-10-12 复算 67 条」（因新增记录引入 1 对 e2e 计数）。

### 阶段总结

- **提交对账**：`git log --oneline e48834e..422bc20 | wc -l` → **12**（下界 = Phase 21 归档批次提交 `e48834e`，上界 = 本阶段末条记录提交 `422bc20`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 12）：阶段登记与范围评估 **1**（`11f9955`）+ Phase 22 本体 **10**（M1 2 = `28b4873` / `422bc20`；M2 3 = `6e80f9a` / `50caea7` / `e01f301`；M6 5 = `86caf15` / `e93c557` / `5012d94` / `47e2084` / `59c1073`）+ **附带交付 1**（`56aea73`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `test:visual` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../design/governance/2026-10-12-phase22-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 25 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 24 轮逐项一致（无漂移）**；证据见[长期任务](./recurring.md) §3 第 25 轮。
- **回扫口径（三段式）**：见[归档批次记录](../design/governance/2026-10-12-phase22-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：**3 条活跃条目**（阈值 20，**未达阈值、不蒸馏**）；`check:distill-archive` 段数见批次记录 §8。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 22 **零 `src/**` 行为改动**（全部为依赖 / CI / 治理守卫 / 文档），**未发布新版本**（`latest` 仍为 0.6.0）→ 按 D14 无需登记发布条目；② **5 条条目库内无治理记录**（M2-1 / M6-1 / M6-2 / M6-4 / M6-5）——其 Review Gate 结论只存于本地态工件 `artifacts/review-gate/`（git-ignored），**属已知偏差、本批不补造路径**；**（2026-10-13 前向指针）该偏差已由 Phase 23 M5-2 补录消解**，五条结论的库内载体见 [M5-2 补录](../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)；③ 归档载体行数（Phase 22 块后）超 `docs:check:line-count` warn 阈值（**非阻断**）——归档载体只增不减；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——属归档正常移除面，**预期、非阻断**；⑤ 回扫三段式结论见批次记录 §4；⑥ `origin/master` = `28b4873`（M1-1 已由用户推送）、本阶段末条提交 `422bc20`（M1-2）**未推送**，归档提交亦未推送；⑦ 一次性取证探针分支（`probe/visual-cross-env-2026-10-12`）**已删除**（远端 + 本地），留痕在本地态工件。
- **遗留与后续候选**：视觉基线受检面扩面（含**拉丁 / `system-ui` 回退字体零覆盖**缺口）、CI 运行器镜像钉定（10 处 `ubuntu-latest`；视觉面已裁定「不钉 + 迁移即重冻结」）、文档站示例外链图片守卫、`reka-ui` 补丁升级（2.10.5）、`conventional-changelog` 8 升级、归档载体行数超阈压缩（达 error 阈值 600 时强制压缩）；下游 0.5.0 升级护航（两仓实测均已 `0.6.0`，处置待裁定）；其余见 [Backlog](./backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：结论见[归档批次记录](../design/governance/2026-10-12-phase22-archive.md) §10。

## Phase 23：机制收口与回归判别力、依赖与 CI 环境治理、治理与测试收口

- 时间：2026-10-12 用户就关键决策点裁定后登记（已有最大编号 22 + 1）~ 2026-10-13 交付 5 条主线 / 8 条原子条目并完成阶段收口（用户指令「开始归档」）；**2026-10-13 用户指令修订阶段结构**——主线由 3 条重划为 5 条、最宽条目（受检面扩面）拆细，原子条目 7 → 8（范围与工作量不变）。
- 范围与授权（用户决策 2026-10-12，D1~D12；范围依据见[第七轮范围评估](../design/governance/2026-10-12-next-stage-scope-evaluation-7.md) §8）：取**组合 A + B + C** = 5 条主线 / 8 条原子条目（视觉基线收口 2 / 下游兼容检查判别力 1 / CI 环境与依赖治理 2 / 归档载体压缩 1 / 治理载体与文档站守卫 2）。逐条裁定：**D2** 未推送提交暂留本地（→ 视觉基线阻断远端生效复核转条件触发）；**D3** 机制收口取「受检面扩面 + 判别力补齐」；**D4** CI 运行器镜像**维持 `ubuntu-latest`**、视觉面按检测点重冻结；**D5** 陈旧 PR 清理 + 延后项维持跟踪；**D6** 归档载体**压缩近线窗口**；**D7** 治理侧纳入示例外链图片守卫与 Phase 22 缺记录补录；其余按默认落定（D8 ~ D12 维持登记 / 条件触发 / 阶段末统一收口）。**主线与条目编号口径**：按**阶段内顺序**编号（M1 ~ M5），与提名期草案标签可以不一致（提名期 `M1` → 本阶段 `M1` + `M2`、`M2` → `M3`、`M6` → `M4` + `M5`），编号只要求阶段内顺序可读。
- 非目标：不推送任何提交；不启用定时自动发布、不放开 `release.yml` publish、不进入 1.x；不纳入组件能力与长尾、国际化与 RTL；不为下游做他仓迁移实施、检查范围不含 e2e / 全量单测 / 覆盖率；不压缩历史快照类记录（归档载体压缩为**迁移**而非删改）；不引入高误报守卫；不改组件公共 API、不做破坏性变更；不重写已发布 tag；不引入 Tailwind / UnoCSS。

### M1 视觉基线收口（2 条）

- **M1-1 受检面扩面（文本与回退字体路径）**（提交 `6e8e2f0`；记录见 [M1-1](../design/governance/2026-10-13-phase23-m1-1-visual-font-path-expansion.md)）：受检面由 8 组件面 × 亮暗（16 张）扩为 **8 + 3 段字体路径面 × 亮暗（22 张，新增 6 张）**——`ds-font-latin`（纯拉丁）/ `ds-font-latin-input`（纯拉丁占位符）/ `ds-font-mixed`（CJK + 拉丁混排）；登记表 `SAMPLE_SECTIONS` +3、下界 `MIN_SECTIONS` 8 → 11 + 字体面定向断言。**判别力**：常驻结构性对照 **22 / 22 失败**；定向字体对照（覆盖 `--caomei-font-sans` 与 `--caomei-field-font-family` 两条消费链）**恰 6 / 6 新面失败、16 / 16 旧 CJK 面通过**；混排面初版拉丁仅 4 字形（差异低于 `maxDiffPixels: 100` → 无判别力）→ 扩为 20 字形后转为失败。**V 阶段（CDP `CSS.getPlatformFontsForNode`）**：新面 `DejaVu Sans` / 旧面 `WenQuanYi Zen Hei` / 混排面双字体。既有 16 张基线零改动。RG `standard` **Pass**（0 / 0 / 2）。
- **M1-2 受检面扩面（组件与形态维度）**（提交 `8a2e652`；记录见 [M1-2](../design/governance/2026-10-13-phase23-m1-2-visual-form-axis-expansion.md)）：在 M1-1 的 22 张之上新增 **4 条形态轴面 × 亮暗 = 8 张（合计 30 张）**——视口（宽 100% 折行行 @768）/ 非缺省预设（`momei`）/ 固定时钟日历（`page.clock` 固定 2026-01-15）/ portal 模态打开态；新增 `FORM_AXIS_CASES` + `MIN_FORM_AXIS = 4` 下界 + `prepareFormAxis()`。**判别力**：常驻结构对照 **30 / 30 失败**（初版仅覆盖 `.fixture__state` 时实测 26 / 30 → 被 RG 判 blocker → 扩为三类目标后声明与装置一致）；逐轴定向对照 **8 / 8 轴面失败、22 / 22 既有面通过**。**修正一处无判别力设计**：视口轴初版取固定 `15rem` 宽按钮面（768 与 700 渲染逐像素相同）→ 改宽 100% 折行行 + **折行前置守卫**（子元素 `top` 去重 ≥ 2 行）。RG：R1 `standard` **Reject**（1 blocker：常驻对照声明 30 / 30 与装置不符）→ 修 → R2 **Pass**。

### M2 下游兼容检查判别力（1 条）

- **M2-1 下游兼容检查判别力补齐**（提交 `ca673b4`；记录见 [M2-1](../design/governance/2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md)）：`Downstream Compat` **run `38332448537`**（`workflow_dispatch`，`master` @ `28b4873`）**success**——12 个编号步骤全绿、**1 分 55 秒**；**显式入参 `caomei-ui-version=0.5.0`**（与下游锁定 `0.6.0` 构成**版本差**）→ override 步骤实测变更计数 **`+1 −1`**；下游归因 `dependfix @ edbe5e04`。**判别力口径（三段）**：管道贯通 ✓ / **重装生效 ✓**（本轮新增）/ **回归判别力 ✗**（需被测版本新于下游锁定版本，即下次发布 tag 触发，或一次负向对照）。**受检清单维护**：`dependfix` 在册且两条分支均跑通；`momei`（根包）**未接入**并显式登记单条阻塞（`nuxt build` 上游无凭据可行性未验证）+ 触发条件。**本批不改 workflow**（拟加的「校验实际安装版本」步骤属未验证改动，登记为 Backlog 候选）。载体：发布指南 §10 中英；Backlog **+3 行**。RG：R1 `Reject`（momei 阻塞① 经独立复算**证伪**）→ R2 / R3 `Reject`（修复未扫全 / 未暂存）→ **R4 `Pass`**。

### M3 CI 环境与依赖治理（2 条）

- **M3-1 CI 运行器镜像迁移跟踪与检测点口径**（提交 `280c22b`；记录见 [M3-1](../design/governance/2026-10-13-phase23-m3-1-ci-runner-image-migration.md)）：逐处盘点全仓 **10 处** `runs-on: ubuntu-latest`（`test.yml` ×2 / `docs.yml` ×2 / `regression-weekly.yml` ×3 / `release.yml` / `todo.yml`〔带引号字面量〕/ `downstream-compat.yml`；无表达式 / matrix 形态）→ 按 D4 **维持不钉**；登记**检测点**（周级回归 `e2e` 作业 `Set up job` 日志 `Runner Image` 组的 `Image:` 行出现 `ubuntu-26.04`，现行 `ubuntu-24.04`）与**重冻结口径 5 步**；上游窗口 **2026-10-19 起 / 2026-11-19 前完成**（runner-images#14748）。载体：`testing.md` §2.1 + Backlog **+1 行**。RG `standard` **Pass**（0 / 0 / 3）。
- **M3-2 依赖 PR 治理**（提交 `5d0496b`；记录见 [M3-2](../design/governance/2026-10-13-phase23-m3-2-dependency-pr-governance.md)）：open PR **4 → 2**——关闭**陈旧 PR** `#1`（`vitest` 3.2.7 → 4.1.11，本仓已 `^4.1.11`）/ `#2`（`vite` 5.4.21 → 8.3.0，本仓已 `^8.3.1`）（先评论说明「本仓现值 + PR 基线 + 处置」再关闭）；**延后项触发条件改为可判定**——`reka-ui` **实测复核**（临时覆盖 `2.11.0` → `input-number` **4 例失败 / 45 例通过**，回归未消除，已还原）→ 触发 = 该命令 4 例全过或本仓适配；`conventional-changelog` 复核 preset 仍 `3.0.0` → 触发 = 版本 > 3.0.0 且兼容 writer 9。**运行时作用域开告警 0**（唯一开着项 `node-forge` 属 development、无补丁）。RG `standard` **Pass**（0 / 0 / 3）。

### M4 归档载体压缩（1 条）

- **M4-1 归档载体压缩**（提交 `771077d`；记录见 [M4-1](../design/governance/2026-10-13-phase23-m4-1-todo-archive-compression.md)）：主窗口 **574 → 314 行**（`docs:check:line-count` 判 ok），**Phase 13 ~ 17** 五个完整块迁入新增深度归档 [phase-13-17.md](../plan/archive/phase-13-17.md)（262 行正文 + 7 行文件头）；**近线窗口口径 = 最近 5 个已完成阶段**（本次 Phase 18 ~ 22），迁出触发规则写入主窗口口径句。**机械迁移零改写**：以压缩前基线取原段、按链接深度替换后与新文件正文 `diff` **零差异**（**68 处**链接改写 = 唯一改动面：design 37 / standards 11 / backlog 14 / recurring 6）。**回扫三段式**：机检 2 处 `stale-planning-pointer` 同批改指、人工面 6 处逐条枚举（2 处改指 / 4 处边界内不改）、未处理面显式声明（「阶段限定 + 复用编号」14 处 / 13 文件，记 follow-up）。RG `standard` **Pass**（0 / 1 / 1）。

### M5 治理载体与文档站守卫（2 条）

- **M5-1 文档站示例外部图片源守卫**（提交 `5e76d82`；记录见 [M5-1](../design/governance/2026-10-13-phase23-m5-1-demo-external-image-guard.md)）：新增 `scripts/docs/check-demo-external-images.mjs`（`pnpm docs:check:demo-external-images`）——示例面（`docs/**/examples/**`）出现 `http(s)://` 即判 `external-image-source` 失败；**口径为整文件 fail-closed**（示例惯用 `const src = withBase(本地占位图路径)` 间接赋值，只判 `src=` / `url()` 语法位置会漏）。受检 **363** 文件 / 下界 **300** + 中英前缀覆盖断言。**判别力**：端到端负向对照（注入变量赋值形态外链 → exit 1 报 `docs/examples/image/basic.vue:10`；还原 → exit 0）+ 单测 **19 例**。**接线**：`docs:check` 段数 **11 → 12**、[文档与演示站设计 §13](../design/documentation-site.md) 登记。附带消除示例面最后一处外链（2 个 `upload.vue` 的 `cdn.example.com` → 本地占位图）。RG：两分区并发，分区 A `standard` **Pass**（0 / 0 / 2）。
- **M5-2 Phase 22 缺库内治理记录补录**（提交 `5ca5093`；记录见 [M5-2](../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)）：消解 Phase 22 归档登记的**已知偏差**——为 M2-1 / M6-1 / M6-2 / M6-4 / M6-5 五条补录**可提交载体**（逐条「交付要点 + 关键事实 + 门禁 + Review Gate 结论与 findings 收口 + 未覆盖边界」，锚点 = 各条提交哈希）；**载体同步**：本块五行「库内无治理记录」改指该记录、Phase 22 归档记录追加前向指针（保留原陈述）。**单一事实源**：该记录为五条结论的唯一库内载体，属转录补录、不产生新 Gate 结论。RG：两分区并发，分区 B `standard` **Pass**（0 / 1 / 3）。

- **阶段总结**：**5 条主线 / 8 条原子条目全部交付**；**零 `src/**` 行为改动**（全部为测试装置 / 治理守卫 / CI / 依赖治理 / 规划载体）→ **未发布新版本**（`latest` 仍为 `0.6.0`），按 D12 阶段末统一收口、无需登记发布条目。**新增机检装置 2 项**（示例外部图片源守卫 = `docs:check` 第 12 段；视觉基线受检面扩至 30 张、覆盖字体路径与形态双轴）。提交对账见[归档批次记录](../design/governance/2026-10-13-phase23-archive.md) §2。
- **回扫口径（三段式）**：见[归档批次记录](../design/governance/2026-10-13-phase23-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **长期任务**：第 26 轮门槛复核（2026-10-13，**门槛复核轮**）——两组任务**待执行批次 0 项**、条件触发 **1 项维持**、已判定不纳入 **5 项维持**；计数与第 25 轮**逐项一致（无漂移）**（`useLabelAttrs` 15 / `labelAttrs` 10 / 继承契约 12 / 含内联同名字段 32 / `useFocusControl` 4 / `useAttrs()` 11；数值钳位 2 处；§2.2 复跑四组件共有声明 0；`capture:styles` 308 项 0 差异）。
- **wisdom 蒸馏**：活跃 **21 条 ≥ 阈值 20** → **已执行蒸馏**（migrate 21 / compress 0 / remove 0 / keep 0）；归档摘要 21 行见[经验归档](../design/governance/experience-archive.md) 的「2026-10-13 阶段归档蒸馏（Phase 23）」段；`check:distill-archive` 段数与批次记录 §8 同源。
- **归档批次审计**：经 `@code-reviewer` Review Gate **两分区并发 `standard`**——结论见本块末「归档批次 Review Gate」段与批次记录 §10。
- **已知观察**：① Phase 23 **零 `src/**` 行为改动**、**未发布新版本**（`latest` 仍为 `0.6.0`）→ 无需登记发布条目；② 归档载体本阶段**二次压缩**（Phase 13 ~ 17 迁深度归档，主窗口 574 → 314 行）；③ **未推送**：本地领先 `origin/master`（`28b4873`）**13 提交**（含本阶段全部提交与归档提交），推送由用户择时决定（D2）；④ 阶段内**结构修订**一次（主线 3 → 5、条目 7 → 8，范围不变），已按[规划规范 §3.9](../standards/planning.md) 回扫计数载体；⑤ 下游两仓实测均 `0.6.0`、无新增未处置反馈。
- **遗留与后续候选**：视觉基线**阻断远端生效复核**（转阻断提交尚未推送，触发 = 推送后首个周级 run）；**CI 运行器镜像迁移落地检测**（触发 = 周级回归 `e2e` 作业 `Set up job` 的 `Image:` 出现 `ubuntu-26.04`）；**下游兼容检查的回归判别力**（待下次发布 tag 触发）；**示例外链守卫的漏判面**（大写 scheme / 协议相对形态）与未来合法非图片外链的登记表扩展（触发 = 出现该类用例）；`reka-ui` 补丁升级、`conventional-changelog` 8 升级、归档载体行数（现 314 行、近线窗口 5 阶段，再评估触发 = 超 warn 400）、`momei` 根包接入下游兼容检查（单条阻塞）；其余见 [Backlog](../plan/backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **两分区并发 `standard`**（[AI 协作规范 §3.2](../standards/ai-collaboration.md)：9 文件 / +171 −31 触发并发阈值）：结论见[归档批次记录](../design/governance/2026-10-13-phase23-archive.md) §10。
