# 待办归档（深度归档）：Phase 22

> 收录阶段：机制真实贯通、依赖安全与升级治理、治理与测试收口。
> 主窗口与归档索引见 [待办归档](../todo-archive.md)；阶段交付的唯一权威记录仍是各阶段治理记录（见 [治理索引](../../design/governance/index.md)）。
> 迁移为机械操作：`../` → `../../`，同目录 `./` → `../`；正文不改写。

## Phase 22：机制真实贯通、依赖安全与升级治理、治理与测试收口

- 时间：2026-10-10 用户就关键决策点裁定后登记；2026-10-12 交付**全部 10 条原子条目**并完成阶段归档（用户指令「归档」）。
- 范围与授权（用户决策 2026-10-10）：用户就**关键决策点**裁定（评估 §5 的 14 个决策点收敛为 3 个关键问题）——取**组合 A + B + C**（= M1 机制真实贯通 + M2 依赖安全与升级治理 + M6 治理与测试收口），共 **3 条主线 / 10 条原子条目**（M1 2 / M2 3 / M6 5）。逐条裁定——**D2** 运行时安全告警（`source-map-js`）**立即插队处置**；**D4** 大版本升级**逐项评估、达标即升**（`vite 5→8` 单独评估延后）；**D8** 归档载体**维持**（接受 warn）；**D9** M6 纳入 B16 / B17 / B19 / B22；其余按默认落定（D3 dev 告警 critical / high 优先、D5 `workflow_dispatch` 提前触发、D6 视觉基线首跑后评估转阻断、D7 受检面维持、D10 ~ D14 维持登记 / 阶段末统一收口）。范围依据见[下一阶段范围评估（第六轮）](../../design/governance/2026-10-10-next-stage-scope-evaluation-6.md) §8。
- 非目标：不启用定时（cron）自动发布、不放开 `release.yml` publish、不进入 1.x（B27 / B28 维持登记）；不纳入组件能力与长尾（B1 ~ B7 维持条件触发）、国际化与 RTL（B9 ~ B11 维持登记）、`useDialog` / Toast 焦点哨兵 / 多版本托管 / Storybook / Tailwind preset 等（维持裁定）；不压缩归档载体；不为未接入目标下游建机制；不改组件公共 API、不做破坏性变更；不重写已发布 tag；不引入 Tailwind / UnoCSS。

### M1 机制真实贯通（2 条）

- **M1-1 下游兼容检查首次真实触发**（提交 `28b4873`；记录见 [M1-1](../../design/governance/2026-10-12-phase22-m1-1-downstream-compat-first-run.md)）：以 `workflow_dispatch` 触发 `.github/workflows/downstream-compat.yml` 的 **run #1**（`38238208301`，`master` @ `5012d94`）**成功**——作业 `Compat / dependfix` **1 分 46 秒**、**12 个步骤全 success**；被测 **`caomei-ui@0.6.0`**（入参留空 → registry latest）、下游归因 **`dependfix @ 46c6fb61`**；消费面复算 = 25 个 `.vue` / 394 个 `Caomei*` 标签 / 28 个组件 + `caomei-ui/nuxt` 接线 ⇒ **管道贯通成立、Actions 运行时无阻断性缺陷**。**如实登记的未覆盖边界**：显式版本入参分支 / tag 自动触发分支未执行；**本轮非版本差验证**（下游已精确锁 `0.6.0`，Override 为同版本重装 → 不构成判别力证据、无负向对照）。**附带事实**：`ubuntu-latest` 自 2026-10-19 起迁移 Ubuntu 26.04（本仓 10 处，转 M1-2 输入并登记 Backlog §1.6）；两下游 `package.json` 实测均已 `0.6.0`（Backlog §1.8 快照同步，原触发条件已不成立、处置待裁定）。RG：R1 `standard` **Pass**（0 blocker / 4 warning / 4 suggest 同批收口）。
- **M1-2 视觉基线首个 CI run 复核与转阻断**（提交 `422bc20`；记录见 [M1-2](../../design/governance/2026-10-12-phase22-m1-2-visual-baseline-first-ci-run.md)）：首个真实 CI run `38246131758`（`workflow_dispatch`，`master` @ `5012d94`）全绿（`test:e2e` 318 / `test:e2e:gallery` 11 / **`test:visual` 17 passed**；运行器 `ubuntu-24.04`）。**跨环境渲染一致性经三次探针取证达「逐字节相同」**（限本次采样面 / 当次镜像 / 该 Playwright 版本）——① 容差收紧至 `maxDiffPixels: 0` 全绿（零个超 `threshold 0.1` 的非-AA 差异像素）；② `--update-snapshots` 日志**无**写盘行（机制：基线已存在时改写基线的唯一路径必打印该行）⇒ 16 张采集与仓库基线逐字节相同；③ 正对照（装置负向对照开关）出现 **16 行**写盘 + 产物裁剪尺寸 `→ 240×85 / 240×93 / 240×115`（+48px = 2×24px）⇒ 判别力自证 + 产物确为 CI 采集；字体包 CI↔本地**逐包同版本**（含 CJK 回退 `fonts-wqy-zenhei`）。**判定 = 转阻断**（视觉步骤移除 `continue-on-error`；转正条件两项均满足）**且不需重冻结基线**；用户裁定**不钉运行器镜像**，再评估触发 = `Set up job` 的 `Image:` 出现 `ubuntu-26.04` 即重冻结。V 阶段由 `@ui-validator` 承担（无视觉通道，全部为机检 / 定量证据）。RG：R1 `standard` **Pass**（0 blocker / 1 warning / 3 suggest 同批收口）。

### M2 依赖安全与升级治理（3 条）

- **M2-1 运行时安全告警插队处置**（提交 `6e80f9a`）：`source-map-js`（high；GHSA-68fv-2mgg-jv7q）经 `pnpm-workspace.yaml` 的 `overrides: source-map-js: ^1.2.2` 强制修复（pnpm 11 不再读取 `package.json` 的 `pnpm` 字段）；lockfile 解析 `1.2.1 → 1.2.2`、无旧版残留。RG `deep` **Pass**。**库内记录见 [Phase 23 M5-2 补录](../../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**（原结论仅存本地态工件，偏差见「已知观察」②）。
- **M2-2 开发作用域安全告警盘点与分批处置**（提交 `50caea7`；记录见 [M2-2](../../design/governance/2026-10-10-phase22-m2-2-dev-alerts-remediation.md)）：Dependabot **dev 作用域告警 15 项**逐项给「受影响区间 + 补丁版本 + 传递链 + 结论」——**已修复 10**（`handlebars` / `devalue` / `shell-quote` / `serialize-javascript` / `brace-expansion`，经 `overrides`）+ **受阻 4**（`simple-git` 3.x 全线无补丁 + `@simple-git/argv-parser`）+ **无修复版本 1**（`node-forge`）。RG：R1 `deep` **Reject**（1 blocker：残留扫描证据）→ 修复 → R2 `deep` **Pass**。
- **M2-2 后续：`simple-git` 跨大版本升级与兼容补丁**（提交 `56aea73`；记录见 [后续记录](../../design/governance/2026-10-10-phase22-m2-2-simple-git-override-upgrade.md)）：由 `3.36.0` 升至精确 `4.0.2`（`overrides`）+ `patchedDependencies` + `patches/simple-git@4.0.2.patch`（397 B，仅恢复 v4 移除的默认导出，修复 `@nuxt/devtools` 的 `import Git from 'simple-git'`）；处置 4 项告警 → M2-2 收敛为**已修复 14 / 无补丁 1**。
- **M2-3 依赖大版本升级逐项评估与达标升级**（提交 `e01f301`；记录见 [M2-3](../../design/governance/2026-10-10-phase22-m2-3-major-upgrades.md)）：处置 7 个 open PR（D4「逐项评估、达标即升」）——**达标即升 3**（`vue 3.5.43` / `@lucide/vue ^1.48.0` + `THIRD-PARTY-LICENSES` 同步 / `typescript 6.0.3` 含 tsconfig 迁移 `moduleResolution: Node → Bundler`）；**陈旧 PR 2**（`vite` / `vitest`，本仓已达标）；**延后 2**（`reka-ui 2.10.5` 致 `input-number` 步进回归、`conventional-changelog 8` 与 writer 9 不兼容）→ 登记 Backlog §1.6。RG `deep` R1 **Pass**。

### M6 治理与测试收口（5 条）

- **M6-1 归档载体维持的载体留痕**（提交 `86caf15`）：`todo-archive.md` 行数超阈按 D8 **维持**，Backlog §1.6 对应行同步计数（527）与维持裁定 + 再评估触发（达 error 阈值 600 强制压缩）。门禁 `lint:md:check` / `docs:check` / `governance:check` 均 exit 0。RG `quick` **Pass**。**库内记录见 [Phase 23 M5-2 补录](../../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**。
- **M6-2 `locale` 守卫能力演进**（提交 `e93c557`）：`check-locale-keys` 解析器容忍注释（字符串感知剥离注释、未闭合块注释响亮失败、容忍缩进 / 行尾 / 块注释）+ 单测 28 例；`check:locale-keys` / `check:locale-ledger` 全绿；`development.md` §7 / §11 同步。RG `standard` **Pass**。**库内记录见 [Phase 23 M5-2 补录](../../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**。
- **M6-3 治理索引与记录计数对账守卫**（提交 `5012d94`；记录见 [M6-3](../../design/governance/2026-10-11-phase22-m6-3-governance-counts-guard.md)）：新增 `check-governance-counts`（治理索引摘要 ↔ 记录本体的测试 / e2e / 记录 / 文档取证命令计数对账；**误报实测 0**、受检面下界 40）+ 11 例单测 + 接入 `governance:check` + [AI 协作规范 §9](../../standards/ai-collaboration.md) 机检面登记。RG：R1 `standard` **Reject**（1 blocker：对账计数自引用陷阱）→ R2 **Reject**（同根因复发）→ **R3 `Pass`**。
- **M6-4 文档站演示动画遗留项**（提交 `47e2084`）：新增 `check-demo-keyframes`（14 个演示区 keyframes 副本 ↔ 组件源 body 等价 + 未登记 / 悬空 + 受检面下界）+ 9 例单测；`lint:css` 受检面纳入 `docs/examples`；`development.md` §7 / §11 同步。RG `standard` **Pass**。**库内记录见 [Phase 23 M5-2 补录](../../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**。
- **M6-5 文档站示例外部图片依赖消除**（提交 `59c1073`）：10 个示例（zh / en）改用**本地占位图** + `withBase`，移除 `picsum.photos`；新增 `docs/public/demo/*.svg` ×4；构建产物 4 资源 HTTP 200、示例无外链。RG `standard` **Pass**（RG-W01 已收口、相关 suggest 转 Backlog「文档站示例外链图片守卫」）。**库内记录见 [Phase 23 M5-2 补录](../../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)**。

### 附带交付（非阶段条目）

- **`simple-git` 强制升级与兼容补丁**（提交 `56aea73`）：见 M2-2 后续条（M2-2 的前置记录 §3「受阻」结论的再评估落地）。
- **窗口内新增 Backlog 跟踪项**（随交付产生）：文档站示例外链图片守卫（M6-5）、视觉基线受检面扩面（M1-2）、CI 运行器镜像钉定（M1-1）、`reka-ui` 补丁升级与 `conventional-changelog` 8 升级（M2-3）。
- **窗口内跨载体订正**：M1-2 索引条目把 M6-3 的「当前仓 66 条对账」现在时口径改为「当时仓 66 + 2026-10-12 复算 67 条」（因新增记录引入 1 对 e2e 计数）。

### 阶段总结

- **提交对账**：`git log --oneline e48834e..422bc20 | wc -l` → **12**（下界 = Phase 21 归档批次提交 `e48834e`，上界 = 本阶段末条记录提交 `422bc20`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。构成（逐项相加 = 12）：阶段登记与范围评估 **1**（`11f9955`）+ Phase 22 本体 **10**（M1 2 = `28b4873` / `422bc20`；M2 3 = `6e80f9a` / `50caea7` / `e01f301`；M6 5 = `86caf15` / `e93c557` / `5012d94` / `47e2084` / `59c1073`）+ **附带交付 1**（`56aea73`）。**归档批次自身提交不计入上式**。
- **质量门**：`pnpm verify` **exit 0**、`test` / `test:a11y` / `test:e2e` / `test:visual` / `capture:styles` / `docs:check` / `check:governance-records` / `check:distill-archive` / `docs:build` 的**终态数值与复算命令见[归档批次记录](../../design/governance/2026-10-12-phase22-archive.md) §8**（单点来源，本块不复写易变计数）。
- **长期任务**：阶段收口前触发**第 25 轮**门槛复核（规划清理域）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；**计数与第 24 轮逐项一致（无漂移）**；证据见[长期任务](../recurring.md) §3 第 25 轮。
- **回扫口径（三段式）**：见[归档批次记录](../../design/governance/2026-10-12-phase22-archive.md) §4（机检面 / 人工面 / 未处理面）。
- **wisdom 蒸馏**：**3 条活跃条目**（阈值 20，**未达阈值、不蒸馏**）；`check:distill-archive` 段数见批次记录 §8。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**——结论见本块末「归档批次 Review Gate」段。
- **已知观察**：① Phase 22 **零 `src/**` 行为改动**（全部为依赖 / CI / 治理守卫 / 文档），**未发布新版本**（`latest` 仍为 0.6.0）→ 按 D14 无需登记发布条目；② **5 条条目库内无治理记录**（M2-1 / M6-1 / M6-2 / M6-4 / M6-5）——其 Review Gate 结论只存于本地态工件 `artifacts/review-gate/`（git-ignored），**属已知偏差、本批不补造路径**；**（2026-10-13 前向指针）该偏差已由 Phase 23 M5-2 补录消解**，五条结论的库内载体见 [M5-2 补录](../../design/governance/2026-10-13-phase23-m5-2-phase22-record-backfill.md)；③ 归档载体行数（Phase 22 块后）超 `docs:check:line-count` warn 阈值（**非阻断**）——归档载体只增不减；④ `docs:check:integrity` 对 `todo.md` 报「H1/H2 结构标题减少」告警——属归档正常移除面，**预期、非阻断**；⑤ 回扫三段式结论见批次记录 §4；⑥ `origin/master` = `28b4873`（M1-1 已由用户推送）、本阶段末条提交 `422bc20`（M1-2）**未推送**，归档提交亦未推送（**归档时快照、已过期**：该批已于 2026-10-13 推送；推送态以 `git ls-remote origin refs/heads/master` 实时为准）；⑦ 一次性取证探针分支（`probe/visual-cross-env-2026-10-12`）**已删除**（远端 + 本地），留痕在本地态工件。
- **遗留与后续候选**：视觉基线受检面扩面（含**拉丁 / `system-ui` 回退字体零覆盖**缺口）、CI 运行器镜像钉定（10 处 `ubuntu-latest`；视觉面已裁定「不钉 + 迁移即重冻结」）、文档站示例外链图片守卫、`reka-ui` 补丁升级（2.10.5）、`conventional-changelog` 8 升级、归档载体行数超阈压缩（达 error 阈值 600 时强制压缩）；下游 0.5.0 升级护航（两仓实测均已 `0.6.0`，处置待裁定）；其余见 [Backlog](../backlog.md)。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard`**（归档批次以规划载体为主，故不分区）：结论见[归档批次记录](../../design/governance/2026-10-12-phase22-archive.md) §10。
