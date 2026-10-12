# Phase 22 M1-2：视觉基线首个 CI run 复核与转阻断

> 阶段：Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口）M1-2
> 日期：2026-10-12
> 范围：`.github/workflows/regression-weekly.yml`（视觉步骤移除 `continue-on-error` = 转阻断，1 处）；[测试规范 §2.1](../../standards/testing.md)（接入策略口径）；[待办事项](../../plan/todo-archive.md) M1-2 状态；[Backlog](../../plan/backlog.md) §1.6 两行；本记录 + [治理索引](./index.md)；**不改装置 / 不改基线 / 不改组件（零 `src/**` 零 `test/**`）**
> 依据：用户 2026-10-10 裁定 **D6**（视觉基线首跑后评估转阻断）与 2026-10-12 裁定（**转阻断 + 不钉运行器镜像**，即 §4.2）；[M3-1 装置记录](./2026-10-10-phase21-m3-1-visual-baseline-device.md)（RG-W01 跨环境风险延期至首个 CI run）；[M3-2 CI 接线记录](./2026-10-10-phase21-m3-2-visual-baseline-ci-docs.md) §2.2 转正条件；[M7-1 评估](./2026-10-08-m7-1-visual-regression-baseline-evaluation.md) §5
> 基线：`5012d94`（远端 `origin/master`；本地 M1-1 提交 `28b4873` 为纯文档差异）

## 1. 结论摘要

- **首个真实 CI run 全绿**：`Weekly Regression` run `38246131758`（`workflow_dispatch`，`master` @ `5012d94`）→ 整体 `success`；`E2E Test` 作业 `success`，其中 `test:e2e` 318 passed、`test:e2e:gallery` 11 passed、`test:visual` **17 passed**（8 组件 × 亮暗 + 下界守卫）。
- **跨环境渲染一致性已实证**（达「**逐字节相同**」级别；**限本次采样面**〔16 张元素裁剪图 / 单视口 / 单 DPR / 仅 CJK 文本〕**+ 当次运行器镜像**〔`ubuntu-24.04`〕**+ 该 Playwright 版本**〔`1.63.0`〕，**不外推到未采样面**）：三次探针取证见 §3；辅助证据 = CI 与基线生成环境的字体包**逐包同版本**、同一 Playwright `1.63.0`（同 lockfile → 同 Chromium 构建）、运行器实际镜像 `ubuntu-24.04`。
- **判定 = 转阻断**：`.github/workflows/regression-weekly.yml` 视觉步骤移除 `continue-on-error: true`；转正条件（[M3-2](./2026-10-10-phase21-m3-2-visual-baseline-ci-docs.md) §2.2）「首个 `ubuntu-latest` 全绿 run」**且**「实证字体渲染一致性」**两项均已满足**。
- **不需要重冻结基线**：仓库内 16 张基线在 CI 侧**逐字节复现**。
- **运行器镜像处理 = 不钉**（用户裁定）：`runs-on` 维持 `ubuntu-latest`；再评估触发 = **Ubuntu 26.04 迁移落地后重冻结基线**（见 §4.2）。
- 渲染侧结论由 `@ui-validator` 承担（V 阶段，见 §3.4）。

## 2. 首个 CI run 事实（可复算）

| 项 | 值 |
|:---|:---|
| run | `Weekly Regression`（`38246131758`），`workflow_dispatch`，`master` @ `5012d94` |
| 时间线 | `2026-10-12T11:58:56Z` 创建 → `12:06:32Z` 完成（整体 `success`） |
| 作业 | `E2E Test`（job id `114800348677`）`11:59:00Z → 12:06:30Z` `success`；`Core Regression` 3 分 46 秒 `success`；`Security Audit` `success` |
| 运行器 | `ubuntu-latest` → 镜像 `ubuntu-24.04`（OS `24.04.5`、镜像版本 `20261004.327.1`） |
| 步骤结果 | 11 个业务步骤全 success（不含 Post / Complete 收尾项；含 `Install Playwright browsers` / `Run E2E tests` / `Run docs site browser regression` / `Check computed styles against frozen baseline` / `Run visual regression baseline`） |
| 视觉步骤 | `pnpm run test:visual` → `Running 17 tests using 1 worker` → 17 条逐条 ✓ → `17 passed (17.5s)` |
| 产物 | `Upload E2E report` 报 `No files were found with the provided path: test-results/`（**绿 run 不落差异产物**，见 §3.1 的方法论动机） |
| 环境 | `@playwright/test 1.63.0`（与本地同版本） |

## 3. 跨环境渲染一致性取证（三次探针 + 字体面）

> 方法论动机：`playwright@1.63.0` 仅在**失败时**落 `-actual` / `-diff`，绿 run 只给「差异 ≤ 容差」的上界，**不构成「实证一致」**。故以一次性探针分支（`probe/visual-cross-env-2026-10-12`，**取证后删除**）分别收紧容差取证、产出 CI 原生截图、并以负向对照做正对照。探针改动**不合并、不进交付链**（登记于本地态 `artifacts/review-gate/2026-10-12-probe-visual-cross-env.md`）。

### 3.1 探针 #1：`maxDiffPixels: 100 → 0`（run `38249074403`）

- CI **17/17 全绿**（`17 passed (18.4s)`）→ 在比较器语义（`threshold: 0.1` + `includeAA: false`）下，**零个「超过 `threshold = 0.1` 且非抗锯齿」的差异像素**，且元素裁剪尺寸逐图一致（尺寸不一致为硬失败）。**本探针不等于逐字节相同**，该层证据由 §3.2 / §3.3 补齐。
- 该步同时**校准了容差口径**：基线为**元素裁剪**图（`240×37` / `radio-button 240×45` / `select 240×67`），故 `maxDiffPixels: 100` 实为元素面积的 **0.62% ~ 1.13%**（非按 `1280×800` 视口计的 0.0098%）；比较器 `includeAA: false` ⇒ **抗锯齿差异结构化不计入**（源码核对：`playwright-core@1.63.0` 的 `compareImages` → pixelmatch 默认 `includeAA: false`）。

### 3.2 探针 #2：`test:visual:update` + 上传 `test/visual/__screenshots__/`（run `38250166746`）

- 日志**无任何** `is re-generated, writing actual.` 行（`17 passed (18.8s)`）。
- 机制依据（读 `playwright@1.63.0` `lib/matchers/expect.js`）：update 模式下**基线已存在时**，「改写基线」的唯一路径是 `writeFiles`，而它**必打印该行**（`compareBuffersOrStrings` 在缓冲相同时返回 `null`，不进入写盘分支；源码机制经 `@ui-validator` 独立复核）；本 run 另核基线缺失路径的写盘提示行数为 **0**，排除 `handleMissing` 分支 ⇒ 无该行 = 16 张采集与仓库基线**逐字节相同**。
- 该产物与仓库基线做 PIL 逐像素比对得 `0 / 160320`、`maxΔ = 0`——但此比对**属同义反复**（未写盘 ⇒ 产物即检出文件），单独不足以作证，故需 §3.3 的正对照。

### 3.3 探针 #3：正对照（`VISUAL_NEGATIVE_CONTROL=1` + `update`，run `38251695945`）

- 日志出现 **16 行** `…/test/visual/__screenshots__/components.visual.ts/<name>.png is re-generated, writing actual.`（`17 passed (20.9s)`）。
- 产物与基线的结构性差异：元素裁剪尺寸 `240×37 → 240×85`、`240×45 → 240×93`、`240×67 → 240×115`（负向对照注入 `padding: 24px !important`，+48px = 2×24px，符合预期）。
- ⇒ 同时证明两件事：① §3.2 的「无写盘行」判别力成立（**有差异必有该行**）；② 上传产物确为 **CI 采集**而非检出文件。

### 3.4 字体面与渲染侧复核

- **字体包逐包一致**（CI `playwright install --with-deps` 日志 ↔ 本地 `dpkg-query`）：`fonts-wqy-zenhei 0.9.45-8`（CJK 回退）、`fonts-unifont 1:15.1.01-1build1`、`fonts-ipafont-gothic 00303-21ubuntu1`、`fonts-liberation 1:2.1.5-3`、`fonts-noto-color-emoji 2.047-0ubuntu0.24.04.1`、`fonts-freefont-ttf 20211204+svn4273-2`、`libfontconfig1 2.15.0-1.1ubuntu2`；本地 `fc-match "sans-serif:lang=zh-cn"` → `wqy-zenhei.ttc`。
- **受检面确实采样文本**（`test/e2e/fixtures/app.vue`）：button「提交操作」、input placeholder「请输入内容」、select placeholder「请选择」、checkbox label「选项」、radio-button「选项一 / 选项二」。
- **`@ui-validator`（V 阶段）**：先以「绿 run + 字体包一致」判定**不足以**认定「字体一致性已实证」（缺口 = 容差只给上界 / `includeAA:false` 宽容 AA 层 / 拉丁文本零覆盖），并给出取证路径（本批 §3.1 ~ §3.3 即按该路径执行）；随后以 §3.1 ~ §3.3 的读数**闭合**该缺口——**本批无视觉推理通道，全部结论为机检 / 定量证据，不产出描述型视觉结论**（与项目既有口径一致）。

## 4. 判定与再评估触发

### 4.1 判定：转阻断

- 依据：转正条件两项均已满足（§1），且不存在「容差内未量化」缺口（§3 给出逐字节相同的读数）。
- 落地：移除视觉步骤的 `continue-on-error: true`；步骤注释同步为「已转阻断 + 取证指针 + 再评估触发」。
- 影响面：本工作流为**周级、不阻断 PR 合并**——转阻断后视觉漂移会使**周级作业变红**（信号可见、可归因），不改变任何合并门禁。

### 4.2 运行器镜像：不钉 + 迁移即重冻结（用户 2026-10-12 裁定）

- `ubuntu-latest` 自 **2026-10-19** 起迁移 **Ubuntu 26.04**（2026-11-19 前完成，[actions/runner-images#14748](https://github.com/actions/runner-images/issues/14748)）。
- 裁定：**不钉** `runs-on`；接受迁移窗口内可能出现的周级假红，把 **「镜像迁移完成即重冻结视觉基线」**作为唯一再评估触发。
- 归因便利：运行器镜像与 OS 版本在每次 run 的 `Set up job` 日志中可见，假红可即时归因到镜像迁移，而非组件回归。
- **检测点（可执行口径）**：周级 run 的 `Set up job` 日志中 `Image:` 字段出现 **`ubuntu-26.04`** 即视为迁移已落地 → 触发重冻结基线（同口径已写入工作流步骤注释与 [Backlog §1.6](../../plan/backlog.md)）。
- [Backlog §1.6](../../plan/backlog.md) 的「CI 运行器镜像钉定」候选保留（其余 9 处 `ubuntu-latest` 未处置），视觉面裁定已在该行登记。

### 4.3 再评估触发（汇总）

1. **运行器镜像迁移落地**（Ubuntu 26.04）→ 重冻结视觉基线（唯一强制触发）。
2. **受检面扩面**（Backlog §1.6「视觉基线受检面扩面」：日期 / 浮层 / 多视口 / 主题预设 / **拉丁文本**）→ 扩面须同批重冻结基线 + 负向对照。
3. **收到「疑似回归但视觉套件全绿」报告** → 复核采样面与两条容差轴（含 `includeAA` 语义）。

## 5. 载体同步

| 载体 | 变更 |
|:---|:---|
| `.github/workflows/regression-weekly.yml` | 视觉步骤移除 `continue-on-error`（转阻断）+ 步骤注释更新（取证指针 + 再评估触发） |
| [测试规范 §2.1](../../standards/testing.md) | 接入策略口径由「先非阻断观测」改为「已转阻断（2026-10-12）」+ 再评估触发 |
| [待办事项](../../plan/todo-archive.md) | M1-2 状态改「已完成」并回填结论 |
| [Backlog](../../plan/backlog.md) §1.6 | 「视觉基线受检面扩面」行同步转阻断达成 + 拉丁文本覆盖缺口；「CI 运行器镜像钉定」行登记视觉面裁定（不钉 + 迁移即重冻结） |
| 本记录 + [治理索引](./index.md) | 新增记录与索引条目；**同批订正** M6-3 索引条目中「当前仓 66 条对账」的现在时口径（改为「当时仓 66 + 2026-10-12 复算 67」，因本记录新增 1 对 e2e 计数） |

## 6. 质量门

- `pnpm verify` exit 0（整链 13 段全绿）。
- `lint:md:check` exit 0；`docs:check` 11 段全绿；`governance:check` exit 0。
- `python3 -c "import yaml; yaml.safe_load(...)"` 解析 `regression-weekly.yml` 通过（视觉步骤 `continue-on-error` 已移除，其余步骤不变）。
- 零 `src/**` 零 `test/**`（**不改装置 / 不改基线 / 不改组件**）。

## 7. Review Gate

- audit-depth：`standard`（CI 配置语义变更 + 多载体事实回填 + 外部 run 取证）。时间盒：≤ 10 分钟。
- **R1 `standard`：`Pass`**（0 blocker / 1 warning / 3 suggest；审计方实测约 9 分钟，未超时间盒）。
- **审计方独立复核通过的事实**（不采信调用方结论）：`git diff --cached` 范围与暂存区卫生；`pnpm governance:check` 全链复跑（记录 155 / 指针 345、对账 67 条、`check-planning-numbers` 0 命中、`docs:check` 11 段）；`gh` 逐 run 复算（4 个 run 的 `passed` 行、`is re-generated` 计数 0 / 16、运行器镜像字段、`No files were found`）；**「首个含视觉步骤的 run」判定**（上一 `schedule` run `37928821188` 无该步骤，步骤由 `d5bc5c0` 引入）；`playwright@1.63.0` 写盘分支源码（`expect.js` 的 `writeFiles` 必打印）；字体包 7 项逐包同版本与受检面文本逐条命中；「10 处 `ubuntu-latest`」计数。
- **findings 处置**：
  - **RG-W1（warning，现在时申报未实跑的 Gate）**：记录 §6 / 索引条目以现在时写「`pnpm verify` exit 0」，而该全链在冻结前未跑 → **已修**：本批**冻结后复跑 `pnpm verify`**（结果落 §6）。
  - **RG-S1**：索引括注「不复述测试例数」与同句「视觉 17 passed」存在口径张力 → **已修**（限定为「单测例数（`N 文件 / M 例`）」）。
  - **RG-S2**：§2 步骤口径「11 步」未区分业务步骤与收尾项 → **已修**（改「11 个业务步骤，不含 Post / Complete」）。
  - **RG-S3**：`roadmap.md` Phase 21 行仍写「先非阻断」→ **维持不改**（点时快照，按 AI 协作规范「出证时点正确、后被推进不回改」；本记录为其前向指针）。
- **审计方未覆盖边界**：未跑完整 `pnpm verify`（对本批不可达：零 `src/**` / 零 `test/**`，治理目录不进站点构建；由 RG-W1 在冻结后兑现）；未复现 §3.3 的 PNG 尺寸逐图对比与 PIL 逐像素读数（依赖探针产物，采信 `@ui-validator` 独立复核与 `gh` 日志级证据）。

## 8. 未覆盖边界

1. **拉丁 / `system-ui` 回退字体路径零覆盖**：受检面文本全为 CJK；绿色 run 与逐字节相同的结论**不能外推**到未采样面。
2. **探针为一次性**：三次探针均走临时分支（已删除），证据以本记录 + 本地态工件留存；未建「CI 原生截图回传」常驻能力。
3. **逐字节结论的适用面**：仅限**本次采样面**（16 张元素裁剪图 / 单视口 `1280×800` / DPR 1 / 仅 CJK 文本）**+ 当次镜像**（`ubuntu-24.04` / `20261004.327.1`）**+ 该 Playwright/Chromium 版本**（`1.63.0`）；镜像、浏览器版本或组件渲染变化后需重新评估（§4.3）。
4. **转阻断后的常驻门禁残留盲区**：比较器 `includeAA: false` ⇒ **AA 层差异在常态 run 中不可见**（本批 16 张由 §3.2 的逐字节结论绕开，**未采样面不适用**）；若出现「疑似回归但套件全绿」，先按 §4.3 第 3 项复核该语义。
5. **周级信号的可观测性依赖运行器日志**：转阻断后如需更细的失败归因（差异像素读数），当前装置仍只在失败时落 `-actual` / `-diff`（`Upload E2E report` 会带出）。
6. **未加常驻守卫**：本批未新增「阻断状态 / 运行器标签」类机检守卫（判定为不必要：阻断状态由工作流本身可见、运行器标签未采取钉定策略）；如后续需要可另立候选。
