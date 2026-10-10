# Phase 21 M2-2：发布指南 §3 同步为脚本编排说明面

> 创建时间：2026-10-10
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 21 **M2-2**（发布流统一）
> 依据：用户 2026-10-10 裁定 D6（脚本编排）；[发布机制评估 §3](./2026-10-08-release-flow-and-version-strategy-evaluation.md)；M2-1 交付 [统一手动发布流脚本编排](./2026-10-10-phase21-m2-1-manual-release-flow.md)
> 边界：本批为**文档面同步**（`docs/guide/release.md` §3 重写 + 英文页补「Manual release」节）；不改脚本；不执行真实发布。

---

## 1. 交付

- **`docs/guide/release.md` §3**：由「首个版本发布流程（0.1.0）」8 步清单重写为**脚本编排说明面**（§3.1 一键 / §3.2 分步 / §3.3 runbook / §3.4 提交与豁免边界 / §3.5 文档同步边界 / §3.6 CHANGELOG 口径）。原 8 步清单的**内容全部保留**（折入 §3.3；原第 8 步「记录」以 §3.3 末「落痕（人工，脚本未覆盖）」说明保留），仅按脚本步骤重排并补口径。
- **`docs/i18n/en-US/guide/release.md`**：新增「Manual release (local)」节，说明当前为本地手动发布、单入口命令、变更型步骤须 `--yes`、脚本不推送，并回链中文指南 §3（英文页原为「CI 自动发布」口径，避免与中文页现状相左）。

## 2. 关键口径（本批固化）

1. **单入口**：`pnpm release:manual run --version=<v> [--date] [--yes]`；7 步 = `preflight → bump → changelog → publish → verify → sync → announce`。
2. **变更型步骤须 `--yes`**（或 `--dry-run` 预览）。
3. **tag 落点**：`bump` 打 annotated tag `v<v>`，指向版本提交；`CHANGELOG` 提交在其后——**tag 视图不含 CHANGELOG 段属正常形态**，已发布 tag 不重写。
4. **提交构成与发布元数据豁免**：一次发布 **3 次提交**——`chore(release): <v>`（仅 `package.json` 版本行，✅豁免）/ `docs(changelog): <v>`（仅 `CHANGELOG.md`，✅豁免）/ `docs(release): sync version statements to <v>`（README 中英 + roadmap 版本句，❌**不豁免**，须先有新鲜 Review Gate 工件）。
5. **推送由用户执行**：脚本不自动 push。
6. **发版后文档同步**由 `sync` 按「当前版本」句式锚点自动完成（单一事实源 `scripts/shared/version-statements.mjs`）。

## 3. 验证

- `pnpm lint:md:check` **exit 0**。
- `pnpm docs:check` **11 段全绿**（integrity / links / structure / config-links / i18n-parity / version / interpolation / example-refs / showcase / line-count / i18n 均 exit 0）。
- `docs:check:i18n-parity` 通过（`guide/release.md` 在 `STRUCTURE_EXEMPTIONS` 内，英文版按主题重组、非逐节对译）。
- **无失效锚点**：全仓无指向 `release.md` 旧 §3 锚点的链接（`grep` 复核），重命名标题不影响互链。

## 4. 边界与未覆盖

- **未改脚本**：M2-1 已交付；本批只同步文档面。
- **未执行真实发布**：runbook 未在真实发布中跑通（首次真实发布时补真机证据）。
- **英文页为重组摘要**：非逐节对译，新增节只覆盖「当前为本地手动发布」这一现状要点，完整 runbook 以中文 §3 为准。

## 5. 质量门

- [x] `pnpm lint:md:check` exit 0
- [x] `pnpm docs:check` 11 段全绿
- [x] 零 `src/**` / 零 `test/**` / 零脚本改动

## 6. Review Gate

- **结论**：R1 `standard` **`Pass`**（0 blocker / 1 warning / 3 suggest）。
- **轮次 / 范围**：第 1 轮，审本批 5 文件。
- **findings 处置**：
  - **RG-W1（warning）**：原 §3 第 8 步「记录」在新版丢失，而记录 / 索引称「内容全部保留」不实 → **已修**：§3.3 末补「**落痕（人工，脚本未覆盖）**」说明，恢复该操作义务；记录 §1 表述精确化。
  - **RG-S2（suggest）**：英文页顶部仍为 CI 自动发布口径，与新增节冲突 → **已修**：`Current status` 句补「releases are performed locally and manually」并指向新增节。
  - **RG-S3（suggest）**：§3.3 第 3 步 `--version=` 说明在脚本路径下成孤儿 → **已修**：注明仅对直接运行 `pnpm changelog` 生效，脚本路径恒传 `--version=<v>`。
  - **RG-S4（suggest）**：`todo.md` M2-2 状态早于 RG 结论 → **合规**：本 RG 为 `Pass` 且 §6 同批回填（提交前回填约定）。
- **审计核验**：§3 与 `manual-release.mjs` 逐项一致（7 步 / `--yes` 门禁 / `sync` 守卫前置与独立提交 / `--verify-tag` / 不 push）；豁免边界经 `check-review-gate-artifacts.mjs` 源码复核正确；tag 落点经 `git show v0.6.0` 历史复核一致；链接 / 锚点全绿。
- **未覆盖边界**：未执行真实发布（runbook 未真机跑通）；未独立复跑 `pnpm verify` 全链（采信调用方 exit 0）。
- **留痕**：`artifacts/review-gate/2026-10-10-phase21-m2-2.md`（本地态，git-ignored）。
