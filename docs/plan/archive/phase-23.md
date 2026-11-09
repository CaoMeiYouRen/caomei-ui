# 待办归档（深度归档）：Phase 23

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 23：机制收口与回归判别力、依赖与 CI 环境治理、治理与测试收口

- 时间：2026-10-12 用户就关键决策点裁定后登记（已有最大编号 22 + 1）~ 2026-10-13 交付 5 条主线 / 8 条原子条目并完成阶段收口（用户指令「开始归档」）；**2026-10-13 用户指令修订阶段结构**——主线由 3 条重划为 5 条、最宽条目（受检面扩面）拆细，原子条目 7 → 8（范围与工作量不变）。
- 范围与授权（用户决策 2026-10-12，D1~D12；范围依据见[第七轮范围评估](../../design/governance/2026-10-12-next-stage-scope-evaluation-7.md) §8）：取**组合 A + B + C** = 5 条主线 / 8 条原子条目（视觉基线收口 2 / 下游兼容检查判别力 1 / CI 环境与依赖治理 2 / 归档载体压缩 1 / 治理载体与文档站守卫 2）。逐条裁定：**D2** 未推送提交暂留本地（→ 视觉基线阻断远端生效复核转条件触发）；**D3** 机制收口取「受检面扩面 + 判别力补齐」；**D4** CI 运行器镜像**维持 `ubuntu-latest`**、视觉面按检测点重冻结；**D5** 陈旧 PR 清理 + 延后项维持跟踪；**D6** 归档载体**压缩近线窗口**；**D7** 治理侧纳入示例外链图片守卫与 Phase 22 缺记录补录；其余按默认落定（D8 ~ D12 维持登记 / 条件触发 / 阶段末统一收口）。**主线与条目编号口径**：按**阶段内顺序**编号（M1 ~ M5），与提名期草案标签可以不一致（提名期 `M1` → 本阶段 `M1` + `M2`、`M2` → `M3`、`M6` → `M4` + `M5`），编号只要求阶段内顺序可读。
- 非目标：不推送任何提交；不启用定时自动发布、不放开 `release.yml` publish、不进入 1.x；不纳入组件能力与长尾、国际化与 RTL；不为下游做他仓迁移实施、检查范围不含 e2e / 全量单测 / 覆盖率；不压缩历史快照类记录（归档载体压缩为**迁移**而非删改）；不引入高误报守卫；不改组件公共 API、不做破坏性变更；不重写已发布 tag；不引入 Tailwind / UnoCSS。

### M1 视觉基线收口（2 条）

- **M1-1 受检面扩面（文本与回退字体路径）**（提交 `6e8e2f0`；记录见 [M1-1](../../design/governance/2026-10-13-phase23-m1-1-visual-font-path-expansion.md)）：受检面由 8 组件面 × 亮暗（16 张）扩为 **8 + 3 段字体路径面 × 亮暗（22 张，新增 6 张）**——`ds-font-latin`（纯拉丁）/ `ds-font-latin-input`（纯拉丁占位符）/ `ds-font-mixed`（CJK + 拉丁混排）；登记表 `SAMPLE_SECTIONS` +3、下界 `MIN_SECTIONS` 8 → 11 + 字体面定向断言。**判别力**：常驻结构性对照 **22 / 22 失败**；定向字体对照（覆盖 `--caomei-font-sans` 与 `--caomei-field-font-family` 两条消费链）**恰 6 / 6 新面失败、16 / 16 旧 CJK 面通过**；混排面初版拉丁仅 4 字形（差异低于 `maxDiffPixels: 100` → 无判别力）→ 扩为 20 字形后转为失败。**V 阶段（CDP `CSS.getPlatformFontsForNode`）**：新面 `DejaVu Sans` / 旧面 `WenQuanYi Zen Hei` / 混排面双字体。既有 16 张基线零改动。RG `standard` **Pass**（0 / 0 / 2）。
- **M1-2 受检面扩面（组件与形态维度）**（提交 `8a2e652`；记录见 [M1-2](../../design/governance/2026-10-13-phase23-m1-2-visual-form-axis-expansion.md)）：在 M1-1 的 22 张之上新增 **4 条形态轴面 × 亮暗 = 8 张（合计 30 张）**——视口（宽 100% 折行行 @768）/ 非缺省预设（`momei`）/ 固定时钟日历（`page.clock` 固定 2026-01-15）/ portal 模态打开态；新增 `FORM_AXIS_CASES` + `MIN_FORM_AXIS = 4` 下界（当时）+ `prepareFormAxis()`。**判别力**：常驻结构对照 **30 / 30 失败**（初版仅覆盖 `.fixture__state` 时实测 26 / 30 → 被 RG 判 blocker → 扩为三类目标后声明与装置一致）；逐轴定向对照 **8 / 8 轴面失败、22 / 22 既有面通过**。**修正一处无判别力设计**：视口轴初版取固定 `15rem` 宽按钮面（768 与 700 渲染逐像素相同）→ 改宽 100% 折行行 + **折行前置守卫**（子元素 `top` 去重 ≥ 2 行）。RG：R1 `standard` **Reject**（1 blocker：常驻对照声明 30 / 30 与装置不符）→ 修 → R2 **Pass**。

### M2 下游兼容检查判别力（1 条）

- **M2-1 下游兼容检查判别力补齐**（提交 `ca673b4`；记录见 [M2-1](../../design/governance/2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md)）：`Downstream Compat` **run `38332448537`**（`workflow_dispatch`，`master` @ `28b4873`）**success**——12 个编号步骤全绿、**1 分 55 秒**；**显式入参 `caomei-ui-version=0.5.0`**（与下游锁定 `0.6.0` 构成**版本差**）→ override 步骤实测变更计数 **`+1 −1`**；下游归因 `dependfix @ edbe5e04`。**判别力口径（三段）**：管道贯通 ✓ / **重装生效 ✓**（本轮新增）/ **回归判别力 ✗**（需被测版本新于下游锁定版本，即下次发布 tag 触发，或一次负向对照）。**受检清单维护**：`dependfix` 在册且两条分支均跑通；`momei`（根包）**未接入**并显式登记单条阻塞（`nuxt build` 上游无凭据可行性未验证）+ 触发条件。**本批不改 workflow**（拟加的「校验实际安装版本」步骤属未验证改动，登记为 Backlog 候选）。载体：发布指南 §10 中英；Backlog **+3 行**。RG：R1 `Reject`（momei 阻塞① 经独立复算**证伪**）→ R2 / R3 `Reject`（修复未扫全 / 未暂存）→ **R4 `Pass`**。

### M3 CI 环境与依赖治理（2 条）

- **M3-1 CI 运行器镜像迁移跟踪与检测点口径**（提交 `280c22b`；记录见 [M3-1](../../design/governance/2026-10-13-phase23-m3-1-ci-runner-image-migration.md)）：逐处盘点全仓 **10 处** `runs-on: ubuntu-latest`（`test.yml` ×2 / `docs.yml` ×2 / `regression-weekly.yml` ×3 / `release.yml` / `todo.yml`〔带引号字面量〕/ `downstream-compat.yml`；无表达式 / matrix 形态）→ 按 D4 **维持不钉**；登记**检测点**（周级回归 `e2e` 作业 `Set up job` 日志 `Runner Image` 组的 `Image:` 行出现 `ubuntu-26.04`，现行 `ubuntu-24.04`）与**重冻结口径 5 步**；上游窗口 **2026-10-19 起 / 2026-11-19 前完成**（runner-images#14748）。载体：`testing.md` §2.1 + Backlog **+1 行**。RG `standard` **Pass**（0 / 0 / 3）。
- **M3-2 依赖 PR 治理**（提交 `5d0496b`；记录见 [M3-2](../../design/governance/2026-10-13-phase23-m3-2-dependency-pr-governance.md)）：open PR **4 → 2**——关闭**陈旧 PR** `#1`（`vitest` 3.2.7 → 4.1.11，本仓已 `^4.1.11`）/ `#2`（`vite` 5.4.21 → 8.3.0，本仓已 `^8.3.1`）（先评论说明「本仓现值 + PR 基线 + 处置」再关闭）；**延后项触发条件改为可判定**——`reka-ui` **实测复核**（临时覆盖 `2.11.0` → `input-number` **4 例失败 / 45 例通过**，回归未消除，已还原）→ 触发 = 该命令 4 例全过或本仓适配；`conventional-changelog` 复核 preset 仍 `3.0.0` → 触发 = 版本 > 3.0.0 且兼容 writer 9。**运行时作用域开告警 0**（唯一开着项 `node-forge` 属 development、无补丁）。RG `standard` **Pass**（0 / 0 / 3）。

### M4 归档载体压缩（1 条）

- **M4-1 归档载体压缩**（提交 `771077d`；记录见 [M4-1](../../design/governance/2026-10-13-phase23-m4-1-todo-archive-compression.md)）：主窗口 **574 → 314 行**（`docs:check:line-count` 判 ok），**Phase 13 ~ 17** 五个完整块迁入新增深度归档 [phase-13-17.md](../../plan/archive/phase-13-17.md)（262 行正文 + 7 行文件头）；**近线窗口口径 = 最近 5 个已完成阶段**（本次 Phase 18 ~ 22），迁出触发规则写入主窗口口径句。**机械迁移零改写**：以压缩前基线取原段、按链接深度替换后与新文件正文 `diff` **零差异**（**68 处**链接改写 = 唯一改动面：design 37 / standards 11 / backlog 14 / recurring 6）。**回扫三段式**：机检 2 处 `stale-planning-pointer` 同批改指、人工面 6 处逐条枚举（2 处改指 / 4 处边界内不改）、未处理面显式声明（「阶段限定 + 复用编号」14 处 / 13 文件，记 follow-up）。RG `standard` **Pass**（0 / 1 / 1）。

### M5 治理载体与文档站守卫（2 条）

- **M5-1 文档站示例外部图片源守卫**（提交 `5e76d82`；记录见 [M5-1](../../design/governance/2026-10-13-phase23-m5-1-demo-external-image-guard.md)）：新增 `scripts/docs/check-demo-external-images.mjs`（`pnpm docs:check:demo-external-images`）——示例面（`docs/**/examples/**`）出现 `http(s)://` 即判 `external-image-source` 失败；**口径为整文件 fail-closed**（示例惯用 `const src = withBase(本地占位图路径)` 间接赋值，只判 `src=` / `url()` 语法位置会漏）。受检 **363** 文件 / 下界 **300** + 中英前缀覆盖断言。**判别力**：端到端负向对照（注入变量赋值形态外链 → exit 1 报 `docs/examples/image/basic.vue:10`；还原 → exit 0）+ 单测 **19 例**。**接线**：`docs:check` 段数 **11 → 12**、[文档与演示站设计 §13](../../design/documentation-site.md) 登记。附带消除示例面最后一处外链（2 个 `upload.vue` 的 `cdn.example.com` → 本地占位图）。RG：两分区并发，分区 A `standard` **Pass**（0 / 0 / 2）。
- **M5-2 Phase 22 缺库内治理记录补录**（提交 `5ca5093`；记录见 [M5-2](../../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)）：消解 Phase 22 归档登记的**已知偏差**——为 M2-1 / M6-1 / M6-2 / M6-4 / M6-5 五条补录**可提交载体**（逐条「交付要点 + 关键事实 + 门禁 + Review Gate 结论与 findings 收口 + 未覆盖边界」，锚点 = 各条提交哈希）；**载体同步**：本块五行「库内无治理记录」改指该记录、Phase 22 归档记录追加前向指针（保留原陈述）。**单一事实源**：该记录为五条结论的唯一库内载体，属转录补录、不产生新 Gate 结论。RG：两分区并发，分区 B `standard` **Pass**（0 / 1 / 3）。

- **阶段总结**：**5 条主线 / 8 条原子条目全部交付**；**零 `src/**` 行为改动**（全部为测试装置 / 治理守卫 / CI / 依赖治理 / 规划载体）→ **未发布新版本**（`latest` 仍为 `0.6.0`），按 D12 阶段末统一收口、无需登记发布条目。**新增机检装置 2 项**（示例外部图片源守卫 = `docs:check` 第 12 段；视觉基线受检面扩至 30 张、覆盖字体路径与形态双轴）。提交对账见[归档批次记录](../../design/governance/2026-10-13-phase23-archive.md) §2。
- **回扫口径（三段式）**：见[归档批次记录](../../design/governance/2026-10-13-phase23-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **长期任务**：第 26 轮门槛复核（2026-10-13，**门槛复核轮**）——两组任务**待执行批次 0 项**、条件触发 **1 项维持**、已判定不纳入 **5 项维持**；计数与第 25 轮**逐项一致（无漂移）**（`useLabelAttrs` 15 / `labelAttrs` 10 / 继承契约 12 / 含内联同名字段 32 / `useFocusControl` 4 / `useAttrs()` 11；数值钳位 2 处；§2.2 复跑四组件共有声明 0；`capture:styles` 308 项 0 差异）。
- **wisdom 蒸馏**：活跃 **21 条 ≥ 阈值 20** → **已执行蒸馏**（migrate 21 / compress 0 / remove 0 / keep 0）；归档摘要 21 行见[经验归档](../../design/governance/experience-archive.md) 的「2026-10-13 阶段归档蒸馏（Phase 23）」段；`check:distill-archive` 段数与批次记录 §8 同源。
- **归档批次审计**：经 `@code-reviewer` Review Gate **两分区并发 `standard`**——结论见本块末「归档批次 Review Gate」段与批次记录 §10。
- **已知观察**：① Phase 23 **零 `src/**` 行为改动**、**未发布新版本**（`latest` 仍为 `0.6.0`）→ 无需登记发布条目；② 归档载体本阶段**二次压缩**（Phase 13 ~ 17 迁深度归档，主窗口 574 → 314 行）；③ **未推送**（**归档时快照、已过期**：该批已于 2026-10-13 推送；推送态以 `git ls-remote origin refs/heads/master` 实时为准）：本地领先 `origin/master`（`28b4873`）**13 提交**（含本阶段全部提交与归档提交），推送由用户择时决定（D2）；④ 阶段内**结构修订**一次（主线 3 → 5、条目 7 → 8，范围不变），已按[规划规范 §3.9](../../standards/planning.md) 回扫计数载体；⑤ 下游两仓实测均 `0.6.0`、无新增未处置反馈。
- **遗留与后续候选**：视觉基线**阻断远端生效复核**（转阻断提交**已于 2026-10-13 推送**〔原「尚未推送」表述已过期〕，触发 = 推送后首个周级 run）；**CI 运行器镜像迁移落地检测**（触发 = 周级回归 `e2e` 作业 `Set up job` 的 `Image:` 出现 `ubuntu-26.04`）；**下游兼容检查的回归判别力**（待下次发布 tag 触发）；**示例外链守卫的漏判面**（大写 scheme / 协议相对形态）与未来合法非图片外链的登记表扩展（触发 = 出现该类用例）；`reka-ui` 补丁升级、`conventional-changelog` 8 升级、归档载体行数（现 314 行、近线窗口 5 阶段，再评估触发 = 超 warn 400）、`momei` 根包接入下游兼容检查（单条阻塞）；其余见 [Backlog](../../plan/backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **两分区并发 `standard`**（[AI 协作规范 §3.2](../../standards/ai-collaboration.md)：9 文件 / +171 −31 触发并发阈值）：结论见[归档批次记录](../../design/governance/2026-10-13-phase23-archive.md) §10。
