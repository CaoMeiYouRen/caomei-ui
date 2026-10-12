# Phase 22 M1-1：下游兼容检查首次真实触发

> 阶段：Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口）M1-1
> 日期：2026-10-12
> 范围：真实触发取证与结论回传（本记录 + [治理索引](./index.md) 条目 + [待办事项](../../plan/todo.md) 状态回填 + [发布指南 §10](../../guide/release.md) 中英现状句）；零 `src/**` 零 `test/**`
> 依据：用户 2026-10-10 裁定 D5（`workflow_dispatch` 提前触发）；[发布指南 §10](../../guide/release.md)；[形态变更记录](./2026-10-10-phase21-m1-form-change-upstream-executed.md)
> 基线：`5012d94`

## 1. 结论摘要

- **一次真实 run 成功**：`Downstream Compat` **run #1**（run id `38238208301`），事件 `workflow_dispatch`、分支 `master` @ `5012d94`；作业 `Compat / dependfix` **success**，用时 **1 分 46 秒**，**12 个步骤全 success**。
- **结论**：Actions 运行时（`workflow_dispatch` 事件、双仓 `checkout`、`cache-dependency-path` 解析、`npm view` 版本解析、`pnpm --filter … add` 覆盖、下游复刻构建链）**无阻断性缺陷**；`typecheck` + `build` 真实跑通。
- **归因快照**：下游 **`dependfix/dependfix @ 46c6fb6122ff74b813f9a620160ae7a278d29e1f`**（记录于 job summary）；被测版本 **`caomei-ui@0.6.0`**（入参留空 → 走 `npm view caomei-ui version`）。
- **覆盖真实性**：该 revision 的 `apps/platform` 在 **25 个 `.vue` 文件**内使用 **394 个 `<Caomei*>` 标签、28 个不同组件**，并由 `nuxt.config.ts` 接线 `caomei-ui/nuxt` 模块——检查确实经过本库公共面，非空跑。
- **受检清单无变化**：仍为 `dependfix` 单下游，「接入即登记」本批无新接入项。

## 2. 运行事实（可复算）

| 项 | 值 |
|:---|:---|
| run | `Downstream Compat` #1（`38238208301`），`workflow_dispatch`，`master` @ `5012d94` |
| 时间线 | 排队 `2026-10-12T10:44:25Z` → 启动 `10:56:52Z` → 完成 `10:58:42Z` |
| 作业 | `Compat / dependfix`（job id `114778297006`）`success`，`10:56:55Z → 10:58:41Z`（1 分 46 秒） |
| 运行器 | 标签 `ubuntu-latest` → 镜像 `ubuntu-24.04`（OS `24.04.5`、镜像版本 `20261004.327.1`） |
| 版本解析 | `target caomei-ui version: 0.6.0` |
| 下游归因 | `downstream dependfix/dependfix @ 46c6fb6122ff74b813f9a620160ae7a278d29e1f` |
| 步骤结果 | 12 / 12 success（11 个 workflow 步骤：checkout caomei-ui → setup pnpm → checkout downstream → setup node → resolve version → record revision → install → override → build chain → typecheck → build；加平台自动的 `Set up job`；另含 4 个 post 步骤） |
| 覆盖步骤耗时 | install 约 15 秒 / override 8.4 秒 / 下游构建链约 13 秒 / `typecheck` 约 17 秒 / `build` 约 34 秒（产物合计 36.6 MB，gzip 13.6 MB） |
| 注解 | `ubuntu-latest` 将于 2026-10-19 起迁移 Ubuntu 26.04（见 §4.4） |

## 3. 证据（可复现）

- run 与作业：`gh run view 38238208301 --repo CaoMeiYouRen/caomei-ui`；`gh run view --job=114778297006 --repo CaoMeiYouRen/caomei-ui --log`。
- 版本与归因（日志原行）：`target caomei-ui version: 0.6.0`、`downstream dependfix/dependfix @ 46c6fb61… (caomei-ui target: 0.6.0)`。
- 消费面复算（下游 checkout 取记录 revision `46c6fb61`、仓库根、只读执行）：

  | 命令 | 结果 |
  |:---|:---:|
  | `rg -o '<Caomei[A-Za-z]+' -g '*.vue' apps/platform \| wc -l` | 394 个标签 |
  | `rg -o --no-filename '<Caomei[A-Za-z]+' -g '*.vue' apps/platform \| sort -u \| wc -l` | 28 个组件 |
  | `rg -l '<Caomei[A-Za-z]+' -g '*.vue' apps/platform \| wc -l` | 25 个文件 |
  | `rg -l 'caomei-ui' -g '*.ts' -g '*.vue' -g '*.json' apps/platform \| wc -l` | 21 个引用文件 |

  用量前列：`CaomeiButton` 72 / `CaomeiIcon` 61 / `CaomeiTag` 56 / `CaomeiMessage` 42 / `CaomeiSelect` 41 / `CaomeiCard` 35 / `CaomeiInput` 25 / `CaomeiDataTable` 17 / `CaomeiDialog` 9 / `CaomeiPassword` 7。
- 模块接线：`grep -n 'caomei-ui' apps/platform/nuxt.config.ts` → `caomei-ui/nuxt`。

## 4. 边界与未覆盖

1. **`workflow_dispatch` 显式版本入参分支未覆盖**：本次 `caomei-ui-version` 留空 → 走 registry latest 分支；`INPUT_VERSION` 非空路径仍未执行。
2. **tag 自动触发分支未覆盖**：`push: tags: ['v*']` 需下一次真实发布才会执行（该路径依赖 registry 已可见目标版本；现行 runbook 为 `publish` 后由用户推送 tag，故无竞态）。
3. **本轮不是版本差验证**：下游 `apps/platform` 已精确锁定 `caomei-ui: "0.6.0"`，与解析出的目标版本同值 → 「Override」步骤实为**同版本重装**（`pnpm --filter … add` 仍执行并改写 spec）。本次证明的是**管道贯通**，**不能作为「新版本不破坏下游」的判别力证据**（本轮无负向对照）。
4. **观察（已在 [Backlog §1.6](../../plan/backlog.md) 登记为候选「CI 运行器镜像钉定」）**：本次 run 带官方注解——`ubuntu-latest` 自 **2026-10-19** 起迁移到 **Ubuntu 26.04**、2026-11-19 前完成（[actions/runner-images#14748](https://github.com/actions/runner-images/issues/14748)）。本仓共 **10 处 `runs-on: ubuntu-latest`**（`test.yml` ×2、`docs.yml` ×2、`regression-weekly.yml` ×3、`release.yml`、`todo.yml`、`downstream-compat.yml`），届时会静默换镜像——对 **M1-2**（视觉基线的跨环境一致性）为直接输入；是否钉镜像由候选处置（用户裁定）决定，**本批不改工作流**。
5. **附带事实（时点快照，可能随外部推进变化）**：两下游 `package.json` 实测（2026-10-12）均已为 `caomei-ui@0.6.0`——dependfix @ `46c6fb61`（本次 run 归因快照）、momei @ `39e00f21`。据此 [Backlog §1.8](../../plan/backlog.md)「下游 0.5.0 升级护航」行的**实测快照已同步**（保留 2026-10-06 历史值并追加 2026-10-12 值），其原触发条件（「momei 启动 `0.5.0` 升级」）**已不成立 → 候选处置待一次条件重评估（用户裁定）**；本批**不预设**该候选的处置结论。
6. **次要观察**：`pnpm/action-setup` 报 pnpm v10 安装布局 WARN（`PNPM_HOME` bins，非本仓配置问题）；Actions 仍用浮动 major tag、无 actionlint 机检（非本批引入；登记于 [2026-10-10-phase21-m1-1-compat-check-workflow.md](./2026-10-10-phase21-m1-1-compat-check-workflow.md) §6 的 RG-S3 / RG-S2）。

## 5. 载体同步

| 载体 | 变更 |
|:---|:---|
| 本记录 + [治理索引](./index.md) | 新增记录与索引条目（真实触发结论、归因快照、未覆盖边界） |
| [待办事项](../../plan/todo.md) | M1-1 状态改「已完成」并回填结论；「未完成项汇总」两处实测快照订正——下游版本快照（两仓均 `0.6.0`，2026-10-12）与 `origin/master` 指针（`e48834e` → `5012d94`，并去掉「= HEAD」写法以免随提交自指失效） |
| [发布指南 §10](../../guide/release.md) | 「归属与现状」句由「工作流已就绪」改为「已就绪并经首次真实触发验证」，附 run / 版本 / 归因快照；英文页同步 |
| [Backlog](../../plan/backlog.md) | §1.8「下游 0.5.0 升级护航」行同步 2026-10-12 实测快照并标注原触发条件已不成立（处置待用户裁定）；§1.6 新增候选「CI 运行器镜像钉定」（`ubuntu-latest` → Ubuntu 26.04 迁移，10 处） |

## 6. 质量门

- `pnpm verify` exit 0（整链 13 段全绿：lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）。
- `lint:md:check` exit 0；`docs:check` 11 段全绿；`governance:check` exit 0（含新增记录与索引条目入库后的计数）。
- 零 `src/**` 零 `test/**` 业务改动。
- **本记录不复述测试例数**（避免与 `check-governance-counts` 的对账计数族产生跨载体快照漂移；需要时以 `pnpm verify` 实跑输出为准）。

## 7. Review Gate

- audit-depth：`standard`（治理记录 + 跨载体事实回填，含可复算计数与外部 run 取证）。时间盒：≤ 10 分钟。
- **R1 `standard`：`Pass`**（0 blocker / 4 warning / 4 suggest；审计方实测用时约 9 分钟，未超时间盒）。
- **审计方独立复核通过的事实**（不采信调用方结论）：run / 作业元数据与时间线、12 个步骤与逐步耗时、`target caomei-ui version: 0.6.0`、下游归因 SHA、产物体积、pnpm v10 WARN 注解、`10 处 ubuntu-latest` 计数、两下游 `package.json` 锁定值（外部 API 复核）、`D5` 与 `RG-S2/S3` 编号映射、中英 §10 语义等价、暂存区卫生。
- **findings 处置**：
  - **RG-W1（warning，产物新鲜度）**：`pnpm verify` 产物早于本批最后一次编辑（`dist` 中不含最后一次 §5 / `todo.md` 文本）→ **已修**：修复点全部落地后**复跑 `pnpm verify`**（见 §6）。
  - **RG-W2（warning，活载体未同步）**：`backlog.md` §1.8 行仍持旧快照，与 `todo.md` / 本记录形成同一事实两套口径，且「需条件重评估」当时未在任何规划载体登记（未登记承诺）→ **已修**：§1.8 行同步 2026-10-12 实测快照并标注原触发条件已不成立（**处置仍待用户裁定**，本批不预设结论）。
  - **RG-W3（warning，归属悬空）**：§4.4 的 `ubuntu-latest` 只指定 M1-2，其余 9 处无登记归属 → **已修**：在 [Backlog §1.6](../../plan/backlog.md) 登记候选「CI 运行器镜像钉定」，§4.4 改指该候选。
  - **RG-W4（warning，占位残留）**：§7 曾以占位暂存 → **已修**：以本轮 Gate 结论替换（不预写未发生的结论）。
  - **RG-S1**："12 / 12 success" 的枚举漏 `Set up job` → **已修**（改为「11 个 workflow 步骤 + `Set up job`」）。
  - **RG-S2**：运行器写法混用镜像标签与 OS 补丁号 → **已修**（改为「标签 `ubuntu-latest` → 镜像 `ubuntu-24.04`（OS `24.04.5`、镜像版本 `20261004.327.1`）」）。
  - **RG-S3**：`RG-S2 / RG-S3` 未点记录文件名 → **已修**（§4.6 补文件名消歧）。
  - **RG-S4**：外部事实补「时点快照」措辞 → **已修**（§4.5）。
- **审计方未覆盖边界**：未独立重算下游消费面计数（采信调用方命令与结果，另以 `package.json` 锁定值交叉核验）；未在时间盒内复跑完整 `pnpm verify`（由调用方在修复点落地后补跑，即 RG-W1 闭环）；未写入 `artifacts/review-gate/`（遵调用方只读约束）。
