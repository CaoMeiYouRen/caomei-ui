# Phase 21 M2-1：统一手动发布流脚本编排

> 创建时间：2026-10-10
> 关联条目：[待办事项](../../plan/todo.md) Phase 21 **M2-1**（发布流统一）
> 依据：用户 2026-10-10 裁定 D6（统一手动发布流取**脚本编排**）/ D7（暂不进入 1.x）/ D8（自动化发布维持手动）；[发布机制评估 §3](./2026-10-08-release-flow-and-version-strategy-evaluation.md)；[发布指南 §3](../../guide/release.md)
> 边界：本批为**脚本实现**（`scripts/release/manual-release.mjs` + 单测 + `package.json` 脚本）；[发布指南 §3](../../guide/release.md) 的文档面同步归 **M2-2**；**未执行真实发布**（不触碰 registry）；**不启动 CI 自动发布**（D8）、**不进入 1.x**（D7）。

---

## 1. 交付

- 新增 **`scripts/release/manual-release.mjs`**：手动发布流的单入口编排。
- `package.json` 新增脚本 **`release:manual`** → `node scripts/release/manual-release.mjs`。
- 新增 **`scripts/release/manual-release.test.mjs`**（单测）。
- 新增 **`scripts/shared/version-statements.mjs`**：把「当前版本」声明句锚点登记表抽为**无重依赖的单一事实源**；`check-site-version.mjs` 改为导入并 re-export（维持既有导入面），发布脚本静态导入（不再动态导入 `check-site-version.mjs`，从而不为 release CLI 引入 vitepress）。

## 2. 设计

### 2.1 步骤（`STEPS`，顺序即执行顺序）

| 步骤 | 职责 | 关键门禁 |
|:---|:---|:---|
| `preflight` | 前置门 | 工作区干净；分支 = `master`；提示长期任务门槛复核义务；`pnpm verify`；目标版本未发布（`npm view`）；`npm whoami` 凭据可用；领先 origin 数提示 |
| `bump` | 版本基线 | 只改 `package.json` 的版本行（保持格式与末尾换行）→ `chore(release): <v>` 提交 → annotated tag `v<v>`（幂等：已存在则跳过） |
| `changelog` | 发布说明 | `generate-changelog.mjs --version=<v>` → 只提交 `CHANGELOG.md`（`docs(changelog): <v>`） |
| `publish` | 发布 | `npm publish`（`prepublishOnly` 许可校验自动生效） |
| `verify` | 发布后校验 | registry `latest` = 目标版本；tarball **sha1 与 `dist.shasum` 比对**；解包 `package.json` 版本；`exports` 键读取 |
| `sync` | 后置文档同步 | 复用文档站版本守卫的**声明句锚点**更新 README（中 2 / 英 1）与 `roadmap` 的当前版本句 → **`git add` 三文件 + 独立提交**（`docs(release): sync version statements to <v>`）→ 复跑 `pnpm docs:check:version`；工作区残留改动则告警 |
| `announce` | GitHub Release | 从 `CHANGELOG.md` 抽取目标版本段落作 note → `gh release create v<v>`；**提示由用户 push**（脚本不自动推送） |

- `run` = 依序执行全部 7 步。

### 2.2 关键设计决策

1. **不引入新依赖**：仅 node 内建 + 本仓既有 `generate-changelog.mjs` + `npm` / `gh` / `git` / `tar` CLI。
2. **保持发布批次纯净**（命中 `check-review-gate-artifacts` 的发布元数据豁免）：`bump` 只动 `package.json` 的版本行、`changelog` 只动 `CHANGELOG.md`，**分两次提交**；与任何代码改动同批会失去豁免。
3. **变更型步骤须显式 `--yes`**（`MUTATING_STEPS` = bump / changelog / publish / sync / announce），否则以 `--dry-run` 预览——避免误触发不可逆动作（发布）。
4. **版本句同步只锚定「当前版本」句式**：锚点登记表由 `scripts/shared/version-statements.mjs` **单点**提供（与 `check-site-version.mjs` 共用，同步文件清单由登记表**去重派生**，无平行维护）；**不改写历史版本叙述**，且以 `pnpm docs:check:version` 作为最终守卫（红即失败）。
5. **`sync` 提交后置文档改动**：三处版本句（README 中英 + roadmap）写入后**先跑 `pnpm docs:check:version`（守卫前置，失败即不落提交）**，再**独立提交**，使推送态工作区干净、CI（`push: master` 跑 `pnpm verify` → `docs:check:version`）不会因版本句漂移变红。**边界**：该提交的文件不在发布元数据豁免面内（`check-review-gate-artifacts` 的 `RELEASE_METADATA_FILES` 只含 `package.json` / `CHANGELOG.md`），故执行 `sync` 提交前**须已有新鲜 RG 工件**（与既有发布批次做法一致：版本句同步提交曾单独过 Gate）。
6. **不自动 push**：`announce` 后打印 `git push origin master --follow-tags`，交用户按 Git 规范授权执行。
7. **不改写已发布 tag** / 不做破坏性检测（不进入 1.x 的前提下由操作者显式给出版本）。
8. **跨平台**：`spawnSync` 在 Windows 下加 `shell: true`（`npm` / `pnpm` 为 `.cmd`）。
9. **变更门集中**：`MUTATING_STEPS` 集合在 `runStep` 统一前置 `--yes` / `--dry-run` 门禁（新增变更型步骤不会漏 gate）。

### 2.3 纯函数（可单测）

`parseArgs` / `validateVersion` / `validateDate` / `extractChangelogSection` / `replaceVersionInStatement` / `planVersionStatementSync` / `replacePackageVersion` / `sha1File` / `readUnpackedPackage`。

## 3. 验证

- **单测**：`npx vitest run scripts/release/manual-release.test.mjs` → **16 passed**（参数解析 / 版本与日期校验 / CHANGELOG 段落抽取含版本边界与 `Unreleased` 排除 / 版本句同步（**直接使用真实登记表** + 多锚点 + 不改历史）/ `statementFiles` 去重派生 / `package.json` 版本行改写（保格式 + 末尾换行）/ sha1 + 解包读取）。
- **ESLint**：`npx eslint scripts/release/manual-release.mjs scripts/release/manual-release.test.mjs` → 0 error。
- **dry-run 全流程贯通**：`node scripts/release/manual-release.mjs run --version=0.9.9 --dry-run --yes` → 7 步全部打印计划动作、无副作用（未改 `package.json` / 未发布）。
- **守卫行为实测**：变更型步骤缺 `--yes` → 明确报错；非法版本 / 缺版本 → 报错；未知 step → 用法提示。

## 4. 边界与未覆盖

- **未执行真实发布**：未触碰 registry、未打真实 tag、未创建 GitHub Release（dry-run 覆盖动作路径）。
- **未覆盖网络失败分支**：`npm publish` / `gh release create` 的失败恢复仅靠「命令失败即抛错 + 幂等重跑」（`bump` 已有 tag 幂等判定），未做更细的重试 / 回滚编排。
- **`sync` 的句式锚点是弱守卫**：句式被改写时 `matched=false` 会告警但仍继续，最终由 `pnpm docs:check:version` 兜底（该守卫在 `statement-missing` 上响亮失败）。
- **未纳入自动化发布**：CI 提交驱动自动发布（`release.yml` publish + OIDC）按 D8 **维持手动**，候选留 `Backlog §1.6`。
- **文档面未同步**：`release.md §3` 的重写归 **M2-2**。
- **`sync` 提交的 RG 工件前置**：该提交不在发布元数据豁免面内，执行前须已有新鲜 RG 工件（§2.2 第 5 条）；M2-2 的 runbook 须写明。
- **`verify` 以 registry `latest` 为基准**：对 0.x 直线递增正确；若回填较早版本（非 `latest`）会误报——属已知边界，需要时再收紧为精确版本查询。
- **`announce` 断言 tag**：`gh release create` 带 `--verify-tag`，tag 缺失即失败（不创建指向默认分支的 release）。

## 5. 质量门

- [x] `pnpm verify` **exit 0**（**115 文件 / 2274 例**）
- [x] `npx eslint`（manual-release.mjs / manual-release.test.mjs / version-statements.mjs / check-site-version.mjs）0 error
- [x] dry-run 全流程贯通（无副作用）
- [x] 零 `src/**` 改动（本批为发布脚本 / 共享模块 / 测试）

## 6. Review Gate

- **结论**：R1 `standard` **`Reject`**（1 blocker / 1 warning / 5 suggest）→ **R2 `standard` `Pass`**（0 blocker / 0 warning；R1 findings 全部关闭）。
- **轮次 / 范围**：R1 审本批全量 diff；R2 为 delta 复审，范围冻结于 R1 findings 修复点。
- **R1 findings 处置**：
  - **RG-B1（blocker）**：`sync` 写入 README / roadmap 后不提交，收尾只提示 push → 推送态 CI 必红（`docs:check:version`）→ **已修**：写入后**守卫前置**（先 `pnpm docs:check:version`）+ 对变更文件 `git add` 与独立提交（`docs(release): sync version statements to <v>`）+ 工作区残留告警；§2.1 / §2.2 / §4 写明该提交不在发布元数据豁免面内、须新鲜 RG 工件。**R2 关闭**。
  - **RG-W2（warning）**：`VERSION_STATEMENT_FILES` 与 `CURRENT_VERSION_STATEMENTS` 半单点 → **已修**：抽出 `scripts/shared/version-statements.mjs`（`CURRENT_VERSION_STATEMENTS` + `statementFiles()` 去重派生），`check-site-version.mjs` import + re-export，`manual-release.mjs` 静态导入、删除平行清单。**R2 关闭**。
  - **RG-S3（suggest）**：测试复制锚点 → **已修**：单测直接使用真实 `CURRENT_VERSION_STATEMENTS` + 新增 `statementFiles` 去重派生用例。**R2 关闭**。
  - **RG-S4（suggest）**：`MUTATING_STEPS` 未参与控制流 → **已修**：`runStep` 统一前置门禁，各步骤内 `requireYes` 调用移除。**R2 关闭**。
  - **RG-S5（suggest）**：`origin/master..HEAD` 缺 ref 时静默归零 → **已修**：区分命令失败（提示先 fetch）与真实计数。**R2 关闭**。
  - **RG-S6（suggest）**：`verify` 以 registry `latest` 为基准 → **登记为已知边界**（§4）。**R2 确认**。
  - **RG-S7（suggest）**：`gh release create` 未断言 tag → **已修**：加 `--verify-tag`。**R2 关闭**。
- **R2 非阻塞观察（已采纳）**：`sync` 原为「先提交后跑守卫」→ 已改为**守卫前置**（失败即不落提交）。
- **审计核验**：单测 16 passed、ESLint 0 error、dry-run 无副作用、`check-site-version` 行为与计数不变、平行清单 `grep` 0 命中、R1 修复点逐条独立复核。
- **未覆盖边界**：未执行真实发布（不触碰 registry / 不打真实 tag / 不建 GitHub Release）；网络失败分支仅「抛错 + 幂等重跑」；`sync` 提交的 RG 工件前置属流程约束。
- **留痕**：`artifacts/review-gate/2026-10-10-phase21-m2-1.md`（本地态，git-ignored）。
