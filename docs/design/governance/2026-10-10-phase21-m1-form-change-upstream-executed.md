# Phase 21 M1 形态变更：下游兼容检查改为「上游触发 + 上游执行」

> 创建时间：2026-10-10
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 21 **M1-1 / M1-2**（下游回归机制启动）
> 触发：用户 2026-10-10 复议——指出当前 B 形态（reusable workflow）**本身不绑定仓库**、实际由**下游**加 `uses:` 调用 job 才会执行；主张本任务应由**上游触发并执行**（上游 checkout 下游源码跑 `install` + `typecheck` + `build`），下游为开源仓库时无需额外权限。
> 依据：[Phase 8 启动范围评估](./2026-10-08-phase8-downstream-regression-scope-evaluation.md) §4 / §5 / §7；[第五轮范围评估](./2026-10-10-next-stage-scope-evaluation-5.md) §8.1 D2；[发布指南 §10](../../guide/release.md)
> 边界：本批为**形态变更**（替换 M1-1 交付物 + 回扫活载体口径）；**未执行真实贯通运行**（需推送触发，M1-2 待执行）。

---

## 1. 变更结论

- **原形态（B）**：caomei-ui 提供 `on: workflow_call` 的 reusable workflow，**由下游**新增调用 job 触发执行（跨仓改动 + 下游协调）。
- **新形态（上游触发 + 上游执行）**：caomei-ui **自身工作流** checkout 下游源码，在**上游 runner** 执行其 `typecheck` + `build`。
- **决策（用户 2026-10-10）**：**采纳新形态**；**删除** `compat-check.yml`（reusable）；下游 checkout 用**默认分支 + 记录 SHA**。

## 2. 交付变更

| 项 | 变更前 | 变更后 |
|:---|:---|:---|
| 工作流 | `.github/workflows/compat-check.yml`（`on: workflow_call`） | **删除**；新增 `.github/workflows/downstream-compat.yml`（`on: push: tags: ['v*']` + `workflow_dispatch`） |
| 执行位置 | 下游 runner（调用方上下文） | **上游 runner**（checkout 下游源码） |
| 下游改动 | 需新增调用 job | **无需** |
| 受检清单 | 下游各自登记 | 登记于工作流 `matrix`（试点 dependfix；`repository` / `target-package` / `setup-command` / `typecheck-command` / `build-command`） |
| 触发 | 由调用方决定 | **发布 tag（`v*`）自动触发** + 手动 `workflow_dispatch`（可传被测版本） |
| 归因 | 无 | **记录下游 revision（SHA）** 到 job summary |

## 3. 可行性与代价（已实测 / 已登记）

- **可行性**：`dependfix/dependfix` 与 `CaoMeiYouRen/caomei-ui` **均为 PUBLIC**（上游 checkout 无需额外凭据）；dependfix `nuxt.config` 的 env **均有默认值**（`typecheck` / `build` 无需 secrets）。
- **需复刻下游构建链**：`pnpm i --frozen-lockfile` → `pnpm --filter @dependfix/platform add caomei-ui@<v>` → 构建 workspace 依赖（core / engine / cli）+ `nuxt prepare` → `platform typecheck` → `platform build`。
- **命令漂移风险**：下游改命令（尤其删除 / 改名）会使检查失效——**由上游承担**（用户已接受：新增命令为主，风险可控）。
- **移动目标**：下游默认分支随时间推进，红可能是下游自身改动所致 → 记录 SHA 归因（对应评估 R3）。
- **上游 CI 成本**：每次约 5 ~ 15 分钟（装两个 workspace + 构建）。
- **形态归属**：本形态**不属于**评估 §4 的 A/B/C/D，属**新增第 5 形态**（上游拉取下游源码执行）。

## 4. 回扫（活载体同步 / 点时记录保留）

- **活载体已同步**：`docs/guide/release.md §10`（中英）、`docs/design/architecture.md §7`、`docs/plan/roadmap.md`（§1 现状句 / 阶段表 Phase 8 行 / 规划纪律注 / Phase 8 注 / 状态行）、`docs/plan/todo.md`（M1-1 交付物 + M1-2 验收）。
- **点时记录保留原值 + 前向指针**：[第五轮范围评估](./2026-10-10-next-stage-scope-evaluation-5.md) §8.1 D2 的「B reusable workflow」裁定值**保留不改**，另加「形态变更（2026-10-10 同日）」注；[Phase 8 启动范围评估](./2026-10-08-phase8-downstream-regression-scope-evaluation.md) 顶部加后续指针（§4 的 A/B/C/D 对照被取代、保留不改）。

## 5. 验证

- `python3 -c "import yaml; yaml.safe_load(...)"` 解析 `downstream-compat.yml` **通过**（步骤顺序修复后复跑）。
- **本地等价命令链贯通（已实测）**：把 dependfix 克隆到临时目录（不触碰其工作区），执行与工作流等价的命令链——`pnpm i --frozen-lockfile` → `pnpm --filter @dependfix/platform add caomei-ui@0.6.0` → 构建 workspace 依赖（core / engine / cli）+ `nuxt prepare` → `platform typecheck` → `platform build`，**全链 exit 0**（install 5.5s、三包构建 1.2 / 3.6 / 2.6s、typecheck 通过、`nuxt build` 产物 36.5 MB）。下游 SHA = `722bbe26678c11ddd5d7fc15c96ad5ce95e70b66`。
- **未执行 GitHub 真实触发**：需推送后由 tag / 手动触发（M1-2 待执行）。
- **步骤顺序缺陷（RG-B1，已修）**：初版把 `Setup Node.js`（`cache-dependency-path: downstream/pnpm-lock.yaml`）置于下游 checkout **之前**，`actions/setup-node` 解析缓存路径失败会直接报错退出 → **已修**：下游 checkout 前移，并加承重注释说明顺序约束。

## 6. 质量门

- [x] YAML 静态解析通过（修复后复跑）
- [x] **本地等价命令链全链 exit 0**（install / 覆盖 / 构建 / typecheck / build）
- [x] `pnpm lint:md:check` exit 0；`pnpm docs:check` 11 段全绿
- [x] `pnpm verify` exit 0
- [x] 零 `src/**` 改动

## 7. Review Gate

- **结论**：R1 `standard` **`Reject`**（1 blocker / 3 warning / 2 suggest）→ **R2 `standard` `Pass`**。
- **R1 blocker（RG-B1）**：`Setup Node.js` 的 `cache-dependency-path: downstream/pnpm-lock.yaml` 位于下游 checkout 之前，`actions/setup-node` 解析缓存路径失败会直接报错退出 → **已修**：`Checkout downstream` 前移 + 承重注释。
- **R1 warning**：RG-W1（roadmap Phase 21 行 / `todo.md` L7 仍写 B 形态）/ RG-W2（§10 受检面与 `matrix` 不一致）/ RG-W3（`.session` 旧形态）→ 均**已修**（R2 确认；W2/W3 的同类残留随后收口：`architecture.md §7` / `todo.md` M4-1 行 / `.session` 尾部枚举）。
- **R1 suggest**：RG-S2（被取代的 M1-1 记录缺前向指针）→ **已修**；RG-S1（Action 浮动主标签）→ **不采纳**（仓库级既有统一约定，非本批引入）。
- **独立核验**：步骤顺序自检（downstream checkout 早于 setup-node、`id: version` 早于其引用）、YAML 解析、旧口径回扫、点时记录保留原值 + 前向指针，均通过。
- **未覆盖边界**：未在 GitHub 真实触发（需推送，M1-2 待执行）；未独立复跑 `pnpm verify` 全链（采信调用方 exit 0）。
- **留痕**：`artifacts/review-gate/2026-10-10-phase21-m1-form-change.md`（本地态，git-ignored）。
