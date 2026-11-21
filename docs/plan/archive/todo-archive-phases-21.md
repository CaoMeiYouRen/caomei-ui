# 待办归档（深度归档）：Phase 21

> 收录阶段：下游回归机制启动、发布流统一与视觉基线落地。
> 主窗口与归档索引见 [待办归档](../todo-archive.md)；阶段交付的唯一权威记录仍是各阶段治理记录（见 [治理索引](../../design/governance/index.md)）。
> 迁移为机械操作：`../` → `../../`，同目录 `./` → `../`；正文不改写。

## Phase 21：下游回归机制启动、发布流统一与视觉基线落地

- 时间：2026-10-10 用户裁定 D1 ~ D15 后登记；2026-10-10 交付 **7 条原子条目 + 1 条移出**（M1-2 转为遗留项）并完成阶段归档（用户指令「归档」）。
- 范围与授权（用户决策 2026-10-10）：用户取**组合 A + B + C + D**（= M1 + M2 + M3 + M4），共 **4 条主线 / 8 条原子条目**（M1 2 / M2 2 / M3 2 / M4 2）。逐条裁定——**D2** Phase 8 **启动**（同日经用户复议**变更为「上游触发 + 上游执行」**，见[形态变更记录](../../design/governance/2026-10-10-phase21-m1-form-change-upstream-executed.md)）；**D3** 仅 dependfix 试点；**D4** 沿用 §10「兼容性阻塞」；**D5** 不取 A（无跨仓凭据）；**D6** 统一手动流取**脚本编排**；**D7** **暂不进入 1.x**；**D8** 自动化发布**维持手动**；**D10** 视觉回归基线**立项落地**；**D11** 归档载体超阈**维持**；**D12 / D13** 组件能力 / 国际化与 RTL **维持登记**；**D14** 其余候选**维持登记**；**D15** **阶段末统一收口**。范围依据见[下一阶段范围评估（第五轮）](../../design/governance/2026-10-10-next-stage-scope-evaluation-5.md) §8。
- 非目标：不启用定时（cron）自动发布、不放开 `release.yml` publish；不进入 1.x；不建立外部视觉服务 / 快照库；不压缩归档载体；不纳入组件能力与长尾（B1 ~ B7）、国际化与 RTL（B9 ~ B11）；不重写已发布 tag；不做破坏性 API 变更；不修改下游仓库业务代码。

### M1 下游回归机制启动（Phase 8）（2 条；**1 条交付、1 条移出**）

- **M1-1 上游执行的下游兼容检查 workflow**（**含形态变更**）：初版为 reusable workflow `.github/workflows/compat-check.yml`（`on: workflow_call`，提交 `abd55d8`）——用户 2026-10-10 复议指出该形态**不绑定仓库**、实际由下游加调用 job 执行，主张由**上游触发并执行**。**变更**：删除 `compat-check.yml`、新增 **`.github/workflows/downstream-compat.yml`**（提交 `66822e3`）——`on: push: tags: ['v*']` + `workflow_dispatch`；上游 runner **checkout 下游源码** → `pnpm i --frozen-lockfile` → `pnpm --filter @dependfix/platform add caomei-ui@<v>` → 构建 workspace 依赖（core / engine / cli）+ `nuxt prepare` → `platform typecheck` → `platform build`；受检清单登记于 `matrix`；**记录下游 SHA** 归因。**无需下游改动**；形态属**新增第 5 形态**（不在评估 §4 的 A/B/C/D）。RG：R1 `standard` **Reject**（1 blocker：`Setup Node.js` 的 `cache-dependency-path` 指向尚未检出的下游路径 → setup-node 报错；3 warning）→ 修复（下游 checkout 前移 + 活载体口径回扫）→ **R2 `standard` Pass**。**本地等价命令链全链 exit 0**（clone dependfix → install → 覆盖 `caomei-ui@0.6.0` → 三包构建 → `nuxt prepare` → `typecheck` → `build`；下游 SHA `722bbe26`）。记录见[形态变更记录](../../design/governance/2026-10-10-phase21-m1-form-change-upstream-executed.md) 与[初版记录](../../design/governance/2026-10-10-phase21-m1-1-compat-check-workflow.md)（点时记录）。
- **M1-2（**移出为遗留项**）**：以 dependfix 为试点的一次**真实贯通验证**——工作流已交付并经本地等价命令链验证；**首次 GitHub 真实触发待推送**（以确认 Actions 运行时：表达式求值 / checkout 权限 / 缓存命中）。**转 [Backlog](../backlog.md) §1.8 在册**（触发条件 = 下次推送）。

### M2 发布流统一（2 条）

- **M2-1 统一手动发布流脚本编排**：新增 `scripts/release/manual-release.mjs` + `pnpm release:manual`——单入口 **7 步**（`preflight` / `bump` / `changelog` / `publish` / `verify` / `sync` / `announce`）+ `run`；**不引入新依赖**；`bump` 只改 `package.json` 版本行、`changelog` 只改 `CHANGELOG.md`（分两次提交命中发布元数据豁免）；变更型步骤由 `MUTATING_STEPS` 集中前置 `--yes` / `--dry-run` 门禁；`sync` 守卫前置 + 独立提交；**不自动 push**；`announce` 用 `--verify-tag`。抽出 `scripts/shared/version-statements.mjs`（版本声明句锚点单一事实源）。单测 **16 例**。RG：R1 `standard` **Reject**（1 blocker：`sync` 写入后不提交致推送态 CI 必红）→ 修复 → **R2 `standard` Pass**。提交 `05d830c`；记录见 [M2-1](../../design/governance/2026-10-10-phase21-m2-1-manual-release-flow.md)。
- **M2-2 发布指南 §3 同步为脚本编排说明面**：§3 由 8 步清单重写为脚本编排说明面（一键 / 分步 / runbook / 提交与豁免边界 / 文档同步边界 / CHANGELOG 口径；原内容全部保留）；固化「3 次提交与发布元数据豁免边界」（`chore(release)` / `docs(changelog)` 豁免、`sync` 版本句提交**不豁免**须先有新鲜 RG 工件）；英文页补「Manual release (local)」节。RG：R1 `standard` **Pass**。提交 `4392309`；记录见 [M2-2](../../design/governance/2026-10-10-phase21-m2-2-release-guide-sync.md)。

### M3 视觉基线落地（2 条）

- **M3-1 Playwright 视觉回归基线装置与首批基线**：新增 `playwright.visual.config.ts`（独立配置：固定环境 chromium / 1280×800 / DPR 1 / `zh-CN` / `Asia/Shanghai` / `reducedMotion: reduce`；**双轴容差** `threshold 0.1` + 绝对 `maxDiffPixels 100`；`animations: disabled` / `caret: hide` / `scale: css`；串行 `workers: 1` / `retries: 0`；`snapshotPathTemplate`）+ `test/visual/components.visual.ts`（受检面登记 8 个静态组件 × 亮暗 + **下界守卫** `MIN_SECTIONS`（**当时取值 8**） + **负向对照开关**）+ **16 张冻结基线 PNG** 随仓库提交 + `pnpm test:visual` / `test:visual:update`；复用既有 E2E 夹具（独立端口 4601）。判别力自证：负向对照 **16 张全部报差异**、正常复跑 0 差异。RG：R1 `standard` **Pass**（1 warning：基线生成于本地容器 vs CI，延期首个 CI run）。提交 `88452e1`；记录见 [M3-1](../../design/governance/2026-10-10-phase21-m3-1-visual-baseline-device.md)。
- **M3-2 CI 接入（先非阻断）与文档**：`regression-weekly.yml` 的 `e2e` 作业在 `capture:styles` 后新增 `test:visual`（**`continue-on-error` 非阻断**，沿用同作业 Chromium）；`testing.md` §2.1 新增「真实渲染整体像素层」条 + §6 命令；`development.md` 命令表补 `pnpm test:visual`。口径：先非阻断观测 → 首个 `ubuntu-latest` 全绿 run 且实证字体渲染一致性后评估转阻断；不进 `pnpm verify` 常驻链；Backlog 登记「视觉基线转阻断评估」跟踪项。RG：R1 `standard` **Pass**。提交 `d5bc5c0`；记录见 [M3-2](../../design/governance/2026-10-10-phase21-m3-2-visual-baseline-ci-docs.md)。

### M4 治理口径收口（2 条）

- **M4-1 发布指南 §10 下游清单口径修正（接入即登记）**：§10 由「下游兼容性回归（后置）」重写——状态改「已启动」（2026-10-10 随路线图 Phase 8、dependfix 试点，历史注保留）；受检清单改**实测消费面** + 零消费目标下游标注「接入后增量登记」+「接入即登记」约定；补触发与容量边界；英文页同步；`architecture.md §7` 状态口径同步（延迟启用 → 2026-10-10 启动）。**形态变更后**进一步收敛为「受检面 = 工作流 `matrix` 登记」（当前仅 dependfix；momei 已消费待接入）。RG：R1 `standard` **Pass**（3 warning + 3 suggest 已收口，记「已修复未复审」；一处实测发现：从 guide 页链接治理目录为 **VitePress 死链**，故归属引用用行内代码）。提交 `734ed19`；记录见 [M4-1](../../design/governance/2026-10-10-phase21-m4-1-release-guide-s10-onboarding.md)。
- **M4-2 归档载体超阈维持留痕**：Backlog §1.6 候选行补 D11 维持理由（未达 error 阈值 600 / 压缩属预防性）+ **再评估触发**（达 600 时强制压缩）+ 计数口径（479，与 `docs:check:line-count` 一致）。RG：R1 `quick` **Pass**。提交 `5b94b09`；载体留痕见 [Backlog](../backlog.md) §1.6 的「归档载体行数超阈压缩」候选行。

### 附带交付（非阶段条目）

- **形态变更回填**：`61129de`（回填[形态变更记录](../../design/governance/2026-10-10-phase21-m1-form-change-upstream-executed.md)的 Review Gate 结论）。
- **Backlog 新增跟踪项**（窗口内、随 M3/M1 交付产生）：视觉基线转阻断评估（M3-2）、下游兼容检查首次真实贯通验证（M1-2 移出）、提交驱动 CI 自动发布 / 1.x 策略（登记批次）。

### 阶段总结

- **提交对账**：`git log --oneline ba9587f..61129de | wc -l` → **10**（下界 = Phase 20 归档批次提交 `ba9587f`，上界 = 本阶段末条记录提交 `61129de`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 10）：阶段登记与范围评估 **1**（`ffbb9fc`）+ Phase 21 本体 **8**（M1 2 = `abd55d8` / `66822e3`；M2 2 = `05d830c` / `4392309`；M3 2 = `88452e1` / `d5bc5c0`；M4 2 = `734ed19` / `5b94b09`）+ 附带回填 **1**（`61129de`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `test:visual` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../../design/governance/2026-10-10-phase21-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 24 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 23 轮逐项一致（无漂移）**；证据见[长期任务](../recurring.md) §3 第 24 轮。
- **回扫口径（三段式）**：见[归档批次记录](../../design/governance/2026-10-10-phase21-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：**0 条活跃条目**（阈值 20，**未达阈值、不蒸馏**）；`check:distill-archive` 段数见批次记录 §8。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 21 **零 `src/**` 行为改动**（全部为 CI / 脚本 / 测试装置 / 文档），**未发布新版本**（`latest` 仍为 0.6.0）；② **M1-2 移出为遗留项**（真实贯通验证待推送）；③ 归档载体行数（Phase 21 块后）超 `docs:check:line-count` warn 阈值（**非阻断**）——归档载体只增不减；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——属归档正常移除面，**预期、非阻断**；⑤ 归档后 `check:governance-records` **0 处 `stale-planning-pointer`**（该守卫只识别「链接文字含编号」形态）；另**主动**把 7 份 Phase 21 记录表头的散文指针（链接文字为「待办事项」、编号写在链接之外，机检不命中）改指 `todo-archive.md`；⑥ **本地 `master` 领先 `origin/master` 10 个提交未推送**（Phase 21 全部提交），推送由用户授权；⑦ 实测发现：从 guide 页链接 `docs/design/governance/**` 为 **VitePress 死链**（治理目录不进站点构建），引用一律用行内代码。
- **遗留与后续候选**：**M1-2 首次真实贯通验证**（Backlog §1.8，触发 = 下次推送）；**视觉基线转阻断评估**（Backlog §1.6，触发 = 首个 `ubuntu-latest` 全绿 run）；**提交驱动 CI 自动发布**与**进入 1.x 的版本策略**（Backlog §1.6，D7 / D8 维持）；下游 0.5.0 升级护航（momei 触发时）；Backlog 其余候选见 [Backlog](../backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：结论见[归档批次记录](../../design/governance/2026-10-10-phase21-archive.md) §10。
