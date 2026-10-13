# Phase 23 M3-1：CI 运行器镜像迁移跟踪与检测点口径

> 阶段 / 条目：Phase 23 M3-1（CI 环境与依赖治理）。
> 裁定依据：[下一阶段范围评估（第七轮）](./2026-10-12-next-stage-scope-evaluation-7.md) §8.1 **D4**——CI 运行器镜像**维持 `ubuntu-latest`**，视觉面按既定检测点重冻结。
> 关联：[Phase 22 M1-2 视觉基线首个 CI run 复核与转阻断](./2026-10-12-phase22-m1-2-visual-baseline-first-ci-run.md)（运行器镜像再评估触发的来源）。

## 1. 背景与触发

`actions/runner-images` 公告（[issue #14748](https://github.com/actions/runner-images/issues/14748)，2026-09-17 创建）：`ubuntu-latest` 标签将自 **2026-10-19** 起分批迁移至 **Ubuntu 26.04**，计划 **2026-11-19** 前完成。

本仓视觉回归基线已转阻断（Phase 22 M1-2），而该基线**依赖运行器镜像**——浏览器版本、系统字体包（含 CJK 回退）、系统库的变更都会直接改变渲染结果，是基线**假阳性的主源**。故本条目核对全仓 `runs-on` 受检面，并把「检测点 + 重冻结」固化为可执行的库内口径，避免迁移落地时被动排障。

## 2. 现状盘点：`runs-on: ubuntu-latest` 逐处核对

核对命令：`grep -rn "runs-on:" .github/workflows/`。实测 **10 / 10** 处命中（2026-10-13，基线 `ca673b4`）：

| # | workflow | 作业 id | 显示名 | 行号 | 取值形态 |
|:-:|:---|:---|:---|:-:|:---|
| 1 | `test.yml` | `quality` | Quality | 22 | `ubuntu-latest` |
| 2 | `test.yml` | `test-build` | Test & Build | 52 | `ubuntu-latest` |
| 3 | `docs.yml` | `build` | Build | 33 | `ubuntu-latest` |
| 4 | `docs.yml` | `deploy` | Deploy | 66 | `ubuntu-latest` |
| 5 | `regression-weekly.yml` | `regression` | Core Regression | 32 | `ubuntu-latest` |
| 6 | `regression-weekly.yml` | `security` | Security Audit | 102 | `ubuntu-latest` |
| 7 | `regression-weekly.yml` | `e2e` | E2E Test | 127 | `ubuntu-latest` |
| 8 | `release.yml` | `release` | Release | 13 | `ubuntu-latest` |
| 9 | `todo.yml` | `build` | build | 17 | `"ubuntu-latest"`（带引号字面量） |
| 10 | `downstream-compat.yml` | `compat` | `Compat / 矩阵实例名` | 38 | `ubuntu-latest` |

盘点结论：

- 受检面 **10 / 10** 命中，**无** Actions 表达式 / matrix 形态（10 处全为字面量），**无**其它 `runs-on` 取值（全部指向 `ubuntu-latest`）。
- 取值形态仅 `todo.yml` 为带引号字面量，其余 9 处为裸字面量——语义等价，迁移影响面一致。
- **盘面外 1 处**：`regression-weekly.yml:160` 有一处**注释**含 `ubuntu-latest`（视觉步骤转阻断的说明文字），非 `runs-on` 取值，不计入 10 处。

`#10` 的显示名带 matrix 插值，原文形态：

```yaml
name: Compat / ${{ matrix.name }}
```

## 3. 裁定口径：维持不钉镜像

D4 裁定**不钉固定镜像标签**（如 `ubuntu-24.04`）——理由：

- 钉固定标签会把「上游镜像安全 / 工具链更新」拦在本仓之外，且 `ubuntu-24.04` 标签本身也会被上游逐步收敛；
- 视觉面的可复现性由**基线生成环境与 CI 环境一致**保障（Phase 22 M1-2 已实证跨环境渲染达「逐字节相同」），而非由钉定镜像标签保障；
- 迁移是被动事实（2026-11-19 前完成），钉标签只推迟检测点、不消除重冻结义务。

因此 10 处**全部维持 `ubuntu-latest`**，处置手段为「**检测点 + 迁移落地即重冻结**」而非钉定。

## 4. 检测点与取证口径

- **检测点**：**周级回归（`Weekly Regression`）的 `e2e` 作业**（显示名 `E2E Test`，即承载 `test:visual` 的作业）在 **`Set up job` 步骤**日志中，**`Runner Image` 组**的 **`Image:` 行**由现行值变为 **`ubuntu-26.04`**。10 处共用同一 `ubuntu-latest` 标签，迁移分批推进时以该作业的取值为准。
- **现行实测形态**（2026-10-12 实测，`Weekly Regression` run `38246131758` 的 `E2E Test` 作业）：

  ```text
  ##[group]Runner Image
  Image: ubuntu-24.04
  Version: 20261004.327.1
  ##[endgroup]
  ```

- **取证命令**（一次性、只读）：`gh run view --job=<job-id> --log | grep -E "Runner Image|Image:|Version:"`。
- **触达窗口**：2026-10-19 起分批迁移、2026-11-19 前完成；周级回归每周一跑，窗口内至少可观测一次。若窗口内周级 run 未出现迁移值，以任一含 `Set up job` 的 run 复核即可。
- **上游事实前置**（工具快照口径）：本记录引用的迁移窗口取自 runner-images issue #14748 的**公告文本**（2026-10-13 读取，状态 open）；上游若变更日期，检测点口径不变、仅窗口顺延。

## 5. 重冻结执行口径

检测点命中后按序执行（口径来源：Phase 22 M1-2 的再评估触发 + session wisdom「不得在负向对照规则仍注入时执行 `test:visual:update`」）：

1. **先确认无临时负向对照注入**——常驻对照 CSS（`NEGATIVE_CONTROL_CSS`）与任何一次性对照规则必须处于还原态；否则会把对照态固化为新基线，使后续对照「全绿」而看起来像判别力失效。
2. `pnpm test:visual:update` 重生成全部基线。
3. `pnpm test:visual` 复跑确认 **0 差异**。
4. 逐张核对基线 diff，只接受**镜像迁移导致的渲染差异面**并逐处归因；出现与本条目无关的差异须先归因再决定（不得整批覆盖）。
5. 提交（`test(visual): ...`），**不自动推送**。

## 6. 载体同步

- [`docs/standards/testing.md`](../../standards/testing.md) §2.1：再评估触发句补齐**检测点**（`Set up job` 的 `Runner Image` 组 `Image:` 行）与迁移窗口日期。
- [`docs/plan/backlog.md`](../../plan/backlog.md) §1.6：候选行「CI 运行器镜像钉定」（B26）已在 Phase 23 登记批次**随本条目迁出**；本条目结束时**新增 1 行**条件触发候选承接长期跟踪（检测点命中 → 重冻结视觉基线），使库内始终有跟踪载体。

## 7. 质量门

本批为**纯文档 / 治理批次**（零 `src/**` 零 `test/**` 零 `.github/**` 改动）：

- `pnpm lint:md:check` / `pnpm docs:check` / `pnpm governance:check`；
- `pnpm verify` 常驻链（不改工作流，故无 CI 行为面变更）。

## 8. Review Gate

R1 `standard` **`Pass`**（0 blocker / 0 warning / 3 suggest）。本批为 M3-1 / M3-2 两条目**合并单分区审计**（5 文件 / +172 −3，未触发并发分区阈值），3 条 suggest 全部落在 M3-2 记录与流程项、均同批采纳（记「已修复未复审」）。**实测用时约 3 分 35 秒**，未超 10 分钟时间盒。审计工件：`artifacts/review-gate/2026-10-13-phase23-m3-ci-env-dependency-governance.md`（本地态、git-ignored）。
