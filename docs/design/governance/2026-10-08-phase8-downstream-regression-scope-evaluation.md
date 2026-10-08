# Phase 8 下游兼容性回归机制启动范围评估

> 创建时间：2026-10-08
> 关联条目：[待办事项](../../plan/todo.md) Phase 20 **M3-1**（下游协同与 Phase 8 评估）
> 依据：用户 2026-10-08 输入「dependfix 已完成 UI 组件库迁移，可考虑引入下游回归」＋ Phase 20 范围评估 [D2](./2026-10-07-next-stage-scope-evaluation-4.md)（2026-10-07 裁定「**出范围评估、不启动**」）＋ [发布指南 §10](../../guide/release.md) ＋ [路线图 Phase 8](../../plan/roadmap.md) ＋ [架构设计 §7](../../design/architecture.md)
> **边界**（Phase 20 D2 / M3-1 非目标）：**评估不等于启动**——不建立任何跨仓 CI 触发实体、不修改任何下游仓库、零 `src/**` / 零 `test/**` 改动。本记录只给出**触发形态**与**容量边界**，是否启动、取何种形态由用户另行裁定（见 §7）。
> 快照：本仓 `e996656`（Phase 20 M1 / M2 交付后）；下游为**只读取证**（**测量时点 2026-10-08 02:25 +08:00**）——dependfix `f48bb74`、momei `a5b8274b`，两仓工作区干净。下游状态为**时点快照**，可能随并行会话推进（取证窗口内 dependfix 曾被并行会话推进 HEAD 并短暂改动工作区，不影响本记录的只读版本值与文件清单结论）。

---

## 1. 结论摘要

- **机制可行、无需库侧新增构建设施**：两个真实消费下游（dependfix / momei）均已具备「安装依赖 + `typecheck` + `build`」的最小兼容性检查能力，可承载 Phase 8 而不必在 caomei-ui 侧新建构建 / 部署设施。
- **前置条件复核（三条件）**：① 组件库基本可用 ✅、② 已接入至少一个下游 ✅；③「稳定使用一段时间后出现新改动」因 **dependfix 已完成全量迁移（M31 归档 2026-09-29）并自 2026-10-01 消费 `0.5.0`（约 7 天）** 而**显著成形**，较历轮「不完全成形」推进一档；但 momei 仍锁 `0.3.0` 且处迁移实施期（仅 `/admin/comments` 一个路由完成迁移），故第三项判 **「部分成形」**，是否据此启动属政策裁定（§7 D1）。
- **形态与权威口径**：[发布指南 §10](../../guide/release.md) 已定**权威形态** = `repository_dispatch` 或 reusable workflow（跨仓机制），且**任一 `typecheck` / `build` 失败视为兼容性阻塞**；本评估以该口径为基线。若因跨仓凭据治理暂不引入跨仓机制，可先取**下游定时 poll 或人工 `workflow_dispatch`**（**零跨仓凭据**、复用下游既有 `regression-weekly.yml`）作过渡——**此过渡偏离 §10，采纳须同批修订 §10**。四形态对照见 §4。
- **容量边界**：**每次 caomei-ui 发布（tag）触发 1 次**（非每次提交）；检查范围**最低为 `typecheck` + `build`**、**不含** e2e / 视觉回归 / 全量单测 / 覆盖率；单下游单次约 5 ~ 15 分钟，两下游合计约 10 ~ 30 分钟；失败语义**默认沿用 §10 的「兼容性阻塞」**（若改为「信号非阻断」属对 §10 的偏离，须同批修订 §10）。见 §5。
- **本轮不启动**：未建立任何跨仓 CI 实体；下游仓库零改动。本记录为后续「是否启动」决策提供形态与边界输入。

---

## 2. 前置条件复核（三条件）

> 三条件口径见 [发布指南 §10](../../guide/release.md)：组件库功能基本可用 ＋ 已接入至少一个下游 ＋ 稳定使用一段时间后出现新的组件库改动。

| 条件 | 现状（2026-10-08 实测） | 判定 |
|:---|:---|:---|
| ① 组件库基本可用 | registry `latest` = `0.5.0`（2026-09-30 发布）；Phase 19 起的 `src/**` 变更（浮层背景 / 阴影 token、Tabs 几何、Drawer reduced-motion）待由 Phase 20 M6-1 的 `0.6.0` 交付 | **✅ 成立** |
| ② 已接入至少一个下游 | dependfix `apps/platform` 消费 `0.5.0`（全量迁移，M31 归档）；momei 消费 `0.3.0`（部分迁移，双库并存） | **✅ 成立** |
| ③ 稳定使用一段时间后出现新改动 | dependfix 自 2026-10-01 升级 `0.5.0`，稳定消费约 **7 天**、已有 e2e（16 文件改写后全通）＋ 视觉回归最小集基线；**「新改动」即将出现**——Phase 19 的 `src/**` 变更将随 `0.6.0` 发布；momei 仍处迁移实施期（第六十八阶段，条目 2 ~ 4 未开始） | **⚠️ 部分成形（较历轮推进一档）** |

> **较历轮口径变化**：第三轮（[2026-10-02](./2026-10-02-next-stage-scope-evaluation.md)）与第四轮（[2026-10-07](./2026-10-07-next-stage-scope-evaluation-4.md)）均判第三项「不完全成形（dependfix 窗口 < 1 天 ~ 6 天、momei 锁旧版）」。本轮新增事实 = **dependfix 迁移已闭环 + 稳定消费窗口形成 + 新改动在途（`0.6.0`）**，故推进一档；**未**判「完全成立」，因稳定窗口仍短、仅一个下游闭环、`0.6.0` 尚未发布。

---

## 3. 已接入下游清单（实测 2026-10-08）

> 取证口径：**以下游消费点目录为准**（dependfix `apps/platform`、momei 根包）遍历 `package.json`（排除 `node_modules` / `.nuxt` / `.output`）与源码引用（`.vue` / `.ts` / `.js` / `.mjs`，排除构建与报告产物）；下游另有 `docs/.vitepress/**` 等非消费点引用不计入。两仓 HEAD 与时点见记录头。只读取证，未运行任一仓构建 / 测试。

| 下游 | 消费点 | 依赖版本 | 源码引用面 | 迁移状态 | CI 承载 |
|:---|:---|:---|:---|:---|:---|
| **dependfix** | `apps/platform` | `caomei-ui@0.5.0`（精确锁） | `apps/platform` 约 **20 文件**：`nuxt.config.ts` + `app.vue` + **10 页面**（alerts / batch-runs / pr-checks / scans / repos / repos\[id\]/runs / credentials / env-events / schedules / users）+ 3 组件 + 2 utils + 1 composable + 2 e2e | **全量迁移**（M31 于 2026-09-29 归档；M34.2 于 2026-10-01 升级至 `0.5.0`） | `test.yml`（test / e2e / visual / coverage）+ `regression-weekly.yml`（cron 周五 12:00 UTC；120 min） |
| **momei** | 根包 | `caomei-ui@0.3.0`（精确锁） | 应用侧仅 **1 路由**（`/admin/comments`）＋ 2 组件（`admin-page-header` / `content-language-switcher-v2`）＋ **双库并存模块**；其余为迁移守卫 / 测试 | **部分迁移**（双库并存：`lib/ui-library.ts` 路由白名单 + `modules/caomei-ui-coexistence.ts` 同名自动导入隔离；第六十八阶段实施期） | `test.yml`（build-deps / build-nuxt / test / unit / coverage / e2e 四 shard / visual）+ `regression-weekly.yml`（cron 周五 12:00 UTC） |

**目标下游但当前零消费**：`caomei-auth`、`rss-impact-next`、`afdian-linker`——[路线图](../../plan/roadmap.md)「目标下游」列出三者，但本轮实测其非 `node_modules` 的 `package.json` 与源码**均 0 处**引用 `caomei-ui`（[发布指南 §10](../../guide/release.md) 的下游清单为**目标口径**，非当前接入口径）。

> **对 Phase 8 的含义**：**回归受检面应取「实测消费面」**（dependfix + momei），而非路线图目标列表；三者接入后须**增量**登记进受检清单（建议接入即登记，不依赖某次评估补齐）。

---

## 4. 跨仓库 CI 触发形态（四选）

> 触发链路本质是「caomei-ui 出现新改动」→「下游跑一次最小兼容性检查」。四形态按「凭据成本」递增、按「变更驱动精度」递减。
>
> **权威口径（[发布指南 §10](../../guide/release.md)）**：Phase 8 的既定形态 = **A（`repository_dispatch`）或 B（reusable workflow）**，且**任一 `typecheck` / `build` 失败视为兼容性阻塞**。下表 A / B 为**符合 §10 的形态**；**C / D 为偏离 §10 的轻量替代**（采纳须同批修订 §10）。

| 形态 | 机制 | 优点 | 代价 / 风险 | 适用 |
|:---|:---|:---|:---|:---|
| **A. `repository_dispatch`** | caomei-ui 发布（或 master `src/**` 变更）后，用跨仓 token 调 `POST /repos/{owner}/{repo}/dispatches`（`event_type` 携版本）；下游新增 `on: repository_dispatch` workflow 跑兼容检查 | **变更驱动、版本精确**（可下发目标版本号）；下游无需轮询 | 需**跨仓 token**（PAT / GitHub App，`contents: write` 或 `repo` 级）；下游各新增 workflow；token 轮换与最小权限治理 | 成熟期首选 |
| **B. reusable workflow** | caomei-ui 暴露 `on: workflow_call` 的兼容检查 workflow；下游新增 job `uses: CaoMeiYouRen/caomei-ui/.github/workflows/<compat>.yml@<ref>` | 逻辑**集中在一处**、按 ref 版本化；**无需跨仓 token**（复用调用方权限） | 下游仍须新增调用 job；reusable workflow 需适配各下游的安装 / 构建链（pnpm workspace 差异） | 成熟期（下游结构相近时） |
| **C. 下游定时 poll** | 在**既有** `regression-weekly.yml` 中新增「装 `caomei-ui@latest`（或 `@next`）→ `typecheck` + `build`」步骤 | **零新增凭据**、零上游改动；复用下游既有 cron 与基建 | **非变更驱动**（最长滞后一周）；采样到的是 `latest`（发布态）而非「待验证的下一次改动」；每周固定成本 | **最小可用起步** |
| **D. 人工 `workflow_dispatch`** | 用户在 caomei-ui 发布后，对下游 `gh workflow run`（下游 `workflow_dispatch` + 目标版本入参） | **零新增基建 / 凭据**；完全可控、可随时停 | 依赖人工纪律；无自动化信号 | 起步或低频 |

**建议**：**符合 §10 的最小可用 = A 或 B**；其中 B 无需跨仓 token、逻辑集中，是跨仓机制的**首选**。若跨仓凭据治理在启动批次暂不具备，可先取 **C / D 作过渡**（零凭据、复用既有 cron / 人工），**但须同批修订 §10**（未修订前仅作临时观测）。本轮不实现任一形态（非目标）。若取 A，须先补跨仓凭据形态的最小权限设计。

---

## 5. 容量边界

> 目的是把 Phase 8 限定在「**兼容性信号**」而非「下游全量回归」。

### 5.1 触发频率

- **发布（tag）触发**：每次 caomei-ui **发布一个新版本**触发 **1 次**（形态 A / B / D）；**不**在每次提交 / 每个 PR 触发（避免噪声与成本）。
- **定时触发**：形态 C 每周 1 次，跟随下游既有 `regression-weekly.yml` cron。
- **不重复**：同一版本避免 A（发布触发）与 C（poll）叠加造成重复跑；二者择一为主、另一为兜底。

### 5.2 检查范围（最小充分）

- **最低且默认**：**`typecheck` + `build`**（对齐 [发布指南 §10](../../guide/release.md)「至少覆盖 typecheck 与 build」）。
- **不含**（属下游自身责任，Phase 8 不承载）：e2e、视觉回归基线比对、全量单测、覆盖率、Lighthouse / 包体预算。
- 下游可按自身需要**自行**加严（如 dependfix 已有 visual / e2e job），但 Phase 8 的**准入线**仍为 `typecheck` + `build`。

### 5.3 单次成本与并发

- 单下游单次：约 **5 ~ 15 分钟**（安装 + 类型检查 + 构建；dependfix 需先构建 workspace 包 `core` / `engine` / `cli` 再构建 `platform`）。
- 两下游合计：约 **10 ~ 30 分钟** / 次 caomei-ui 发布。
- 并发：各下游独立 job、互不阻塞；不引入跨仓排队。

### 5.4 凭据与权限

- 形态 A：需 1 个跨仓 token（细粒度 PAT 或 GitHub App），最小权限建议仅 dispatch 目标仓；须登记轮换策略。
- 形态 B：无跨仓 token（下游调用方自身权限）。
- 形态 C / D：**零新增凭据**。

### 5.5 失败语义

- **权威口径（[发布指南 §10](../../guide/release.md)）**：**任一 `typecheck` / `build` 失败视为兼容性阻塞**——本评估**默认沿用**该语义。
- 若启动批次选择「信号（非阻断）」（失败仅告警、不阻断 caomei-ui 与下游自身发布），属**对 §10 的偏离，须同批修订 §10**；且阻塞 / 非阻塞的落地形态（下游是否设为 required check）为 Phase 8 启动后的独立决策。

### 5.6 明确排除项

- 不建立实体基线 / 不建快照库；不跑下游全量 CI；不改下游发布流程；不引入外部视觉回归服务；不做双向回写。

---

## 6. 风险与反面验证

| # | 风险 | 影响 | 缓解 |
|:-:|:---|:---|:---|
| R1 | **跨仓凭据治理**（形态 A） | PAT 过期 / 权限过大 / 泄露 | 优先 B / C / D；取 A 时用 GitHub App 或细粒度 PAT + 最小权限 + 轮换登记 |
| R2 | **poll 采样的版本语义**（形态 C） | 装到 `latest`（当前 `0.5.0`）而非「待验证的下一次改动」→ 无法验证未发布变更 | C 作为「已发布版本兼容性」兜底；变更驱动验证仍交 A / B / D |
| R3 | **下游自身 flaky 污染信号** | 兼容性 job 红但根因在下游测试 flake | 检查范围**只取** `typecheck` + `build`（确定性高、少 flake） |
| R4 | **仅一个下游闭环依赖** | dependfix 全量、momei 部分，单点代表性不足 | 覆盖范围先 dependfix、momei 迁移推进后再纳入 |
| R5 | **成本随下游数增长** | 每增一个下游 +1 job | 准入线固定为 `typecheck` + `build`，成本线性可控；接入即登记受检清单 |
| R6 | **版本在途**（`0.6.0` 未发布） | 首个真实触发点尚未到来 | 与 Phase 20 M6-1 发布收口协同；`0.6.0` 发布即首个候选触发点 |

**反面验证（不启用的代价）**：Phase 8 自 Phase 7 起延迟至今，兼容性问题主要靠下游升级时**人工发现**（如 dependfix M34.2 在升 `0.5.0` 时才发现弹窗内 Select 面板层级缺陷）。随下游数增长，人工发现成本上升；而 Phase 8 的准入线仅 `typecheck` + `build`，成本低——**收益 / 成本比随时间上升**。

---

## 7. 启动前待决策（供用户裁定，本记录不自行裁定）

> 本评估按 M3-1 边界**只给形态与边界**；是否启动与形态选择属用户决策。若裁定启动，按 [规划规范 §4](../../standards/planning.md) 另行分配阶段并登记原子条目（须含「跨仓凭据最小权限设计」与「下游受检清单维护约定」）。

| # | 决策点 | 选项 |
|:-:|:---|:---|
| D1 | **是否启动 Phase 8** | ① 启动（以 dependfix 为试点）② 继续等待（待 `0.6.0` 发布 / momei 迁移完成 / 稳定窗口更长） |
| D2 | **触发形态** | ① A `repository_dispatch` ② B reusable workflow（A / B 符合 §10）③ C 定时 poll ④ D 人工 dispatch（C / D 偏离 §10，采纳须同批修订 §10） |
| D3 | **覆盖下游** | ① 仅 dependfix ② dependfix + momei ③ 含未接入的目标下游（不推荐，接入后增量登记） |
| D4 | **检查范围** | ① `typecheck` + `build`（推荐）② 加最小单测 |
| D5 | **失败语义** | ① 沿用 §10「兼容性阻塞」（默认）② 信号非阻断（须同批修订 §10） |
| D6 | **凭据形态**（若取 A） | ① 细粒度 PAT ② GitHub App ③ 不做 A |

> **用户初步取向（2026-10-08）**：**D1 初步 = 启动**——「初步估计在**下阶段正式启动** Phase 8，**以 dependfix 为试点**」；**D2 ~ D6 待下阶段启动批次一并裁定**。**正式阶段登记与编号**在下一阶段授权时按 [规划规范 §4](../../standards/planning.md) 进行（本记录**不预留编号**）；启动批次须含「跨仓凭据最小权限设计」与「下游受检清单维护约定」，并（若取 A / B）先做一次最小贯通验证。

---

## 8. 质量门

> 纯文档 / 规划批次（零 `src/**` 零 `test/**`），门禁以 `pnpm verify` 整链复跑为准；新记录须先 `git add` 才进入 `docs:check` 的受版本控制受检面。

- [x] `pnpm verify` exit 0（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿）
- [x] `lint:md:check` exit 0
- [x] `docs:check` **11 段全绿**（integrity **326** 受控 md / links **328** md / structure **287** 页 + 侧栏 7 组 48 条目 / config-links **157** / i18n-parity **60**（中文 223 / 英文 64）/ version **exit 0（0.5.0）** / interpolation **287** / example-refs **287 md·382 引用** / showcase **14** / line-count（todo-archive 423 warn，非阻断）/ i18n）
- [x] `governance:check` exit 0（`check-governance-records` **135 记录与索引一致、325 个 md 的历史规划指针无失效**）
- [x] 零 `src/**` / 零 `test/**` 改动（本批为纯文档 / 规划批次）

---

## 9. 未覆盖边界

- **未运行下游构建 / 测试**：`typecheck` + `build` 成本为按其 CI 定义（job / timeout）的**估算**，非实测。
- **未复核下游 CI 于本轮的实跑结论**：引用其 workflow **定义**与既有归档记录，未取本轮 run 结果。
- **未评估未接入目标下游**（`caomei-auth` / `rss-impact-next` / `afdian-linker`）的接入面——当前零消费。
- **未做 A / B 形态的可运行验证**：跨仓 dispatch API、reusable workflow 接口与最小权限仅按机制描述，未起实体验证；启动批次须先做一次最小贯通验证。
- **follow-up（本批外）**：[发布指南 §10](../../guide/release.md) 的下游清单把 `caomei-auth` / `rss-impact-next` / `afdian-linker` 列为「已接入下游」，与实测（零消费）不符——建议后续为 §10 补「接入即登记」约定；本记录 §3 已按实测标注，本批不改 §10。
- **规划编号**：本记录为评估，不分配阶段编号、不登记 `todo.md` 新条目；`todo.md` 的 M3-1 状态随本批回填。

---

## 10. Review Gate

- **结论**：R1 `standard` **`Pass`**（0 blocker / 2 warning / 2 suggest）→ **R2 复审 `Pass`（0 blocker，修复点全部关闭）**。
- **轮次 / 范围**：R1 审本批 3 文件（新增记录 + 索引条目 + `todo.md` 状态）diff；R2 范围冻结于 R1 findings 修复点。
- **实测用时**：R1 发起 `2026-10-08T02:16:02+08:00`、约 6 分钟（未超 `standard` ≤ 10 分钟时间盒）；R2 约 2 ~ 3 分钟（未超）。
- **findings 处置**：
  - **RG-W1（warning）**：记录头「两仓工作区均干净」在审计时不可复现（取证窗口内 dependfix 被并行会话推进 HEAD / 短暂改动工作区）→ **已修**：改为带**测量时点**（`2026-10-08 02:25 +08:00`）的时点快照并注明状态可变。**R2 关闭**。
  - **RG-W2（warning）**：§4 / §5.5 推荐（C / D 起步、失败非阻断）与 [发布指南 §10](../../guide/release.md) 现行「A / B 触发 + 失败即兼容性阻塞」不一致且未声明偏离 → **已修**：以 §10 为权威基线，C / D 与「信号非阻断」显式标注为**偏离 §10、采纳须同批修订 §10**；§1 / §4 / §5.5 / §7 D2·D5 口径一致。**R2 关闭**。
  - **RG-S1（suggest）**：§3 取证口径句与下游全仓引用面略有出入 → **已修**：口径句限定「以下游消费点目录为准」。**R2 关闭**。
  - **RG-S2（suggest，follow-up）**：[发布指南 §10](../../guide/release.md) 下游清单口径滞后 → 记录为 §9 follow-up，本批不改 §10。**R2 关闭（转 follow-up 留痕）**。
  - **RG-S3（suggest，R2 新增，follow-up）**：§4「建议」行措辞强弱与统一口径存在差 → **已修**（统一为「须同批修订 §10（未修订前仅作临时观测）」）；余下收口仍归 Phase 8 启动批次。
- **未覆盖边界**：审计未整链复跑 `pnpm verify` 的 `test` / `build`（文档批次非最低要求，采信调用方 exit 0）；未取下游 CI 本轮实跑 run 结果。
- **留痕**：`artifacts/review-gate/2026-10-08-phase20-m3-1.md`（本地态，git-ignored）。
