# Phase 27 M6-5 `CHANGELOG` 生成器健壮性交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 的 M6-5。
> 定位：Phase 27「CI 发布链路」第 5 条的交付记录；本记录是生成器健壮性口径与证据的唯一载体。

## 1. 交付范围

- `scripts/release/generate-changelog.mjs`：
  - **空 `# Unreleased` 段**：不再只在显式 `--version` 时剥离；`outputUnreleased: true` 产生的空标题一律移除（有内容的 Unreleased 段保留）。
  - **无 remote 降级**：新增 `readOriginRemote()`，仅当仓库存在 `remote.origin.url` 时才调用 `readRepository()`；缺失时跳过、不生成链接，也避免 v7 中 promise 延迟到 `write()` 才拒绝。
  - **语言源自 root**：`conventional-changelog-cmyr-config` 从 `process.cwd()/package.json` 读取 `changelog.language`；生成期间临时切到目标仓库根，结束后恢复，避免「在别的目录生成 root 仓库 changelog」串语言。
- `scripts/release/generate-changelog.test.mjs`：14 例（原 10 + 4），覆盖英文语言根、无 remote 降级、无版本参数时的空 Unreleased、cwd 恢复。
- 零运行时改动；不回改既有 `CHANGELOG.md` 历史。

## 2. 判别口径

| 场景 | 期望 |
| :--- | :--- |
| 无未发布提交 + `outputUnreleased: true` | 输出中无空 `# Unreleased` 标题 |
| 有未发布提交 | 保留 `# Unreleased` 段与内容 |
| 仓库无 `remote.origin.url` | 生成成功、无外链、无 `undefined` |
| `package.json` 的 `changelog.language = en`，调用方 cwd 为 zh | 分组标题为英文（语言取目标仓库根） |
| 历史 `CHANGELOG.md` | 不被本批改写 |

## 3. 验证证据

- `pnpm exec vitest run scripts/release/generate-changelog.test.mjs` → **14 passed**（原 10 + 英文语言根 / 无 remote 降级 / 无版本参数空 Unreleased / cwd 恢复）。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm governance:check` → **exit 0**。
- `git status` 确认 `CHANGELOG.md` **零改动**（本批不回改既有历史）。
- 旧实现反证（HEAD 版本复制到临时目录运行）：英文根用例输出中文、无 remote 用例抛错、无版本用例仍含 `# Unreleased` ⇒ 三条新用例均非空转。

## 4. Review Gate

- **audit-depth**：`standard`（发布链脚本 + 单测；零运行时改动）；R2 为 `quick` delta。时间盒：R1 ≤ 8 分钟，delta ≤ 4 分钟。
- **R1（`standard`）：`Pass`**（0 blocker / 3 warning / 3 suggest）——warning：chdir 无串行化、无 remote 边界描述相反、证据不足 / §4 未回填；suggest：无 remote 断言偏弱、剥离正则不变量、非 GitHub remote 未覆盖。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning；W1 ~ W3 与 S1 ~ S2 全部关闭或按边界声明收口；R2 新增的「用例数」两处旧值已在本节定稿前修正）。
- **用时实测（宿主时钟）**：R1 发起 `2026-11-04T13:52:42Z`、返回 `13:56:29Z` ≈ **3 分 47 秒**（≤ 8 分钟）；R2 发起 `13:59:44Z`、返回 `14:00:35Z` ≈ **51 秒**（≤ 4 分钟）。
- **复查基线**：`scripts/release/generate-changelog.mjs`、`scripts/release/generate-changelog.test.mjs`、本记录、`docs/design/governance/index.md`。

## 5. 未覆盖边界

- 只覆盖本地生成器；`semantic-release` 的 `@semantic-release/changelog` 走 release-notes-generator，不经过本脚本（其空段风险由 CI dry-run 复核）。
- 不改变既有 `CHANGELOG.md` 的内容与格式；历史条目保持原样。
- 无 remote 时仍保留本地 commit **短 hash**，仅不生成 commit / issue 外链（与 `conventional-changelog` 模板行为一致）。
- `process.chdir` 已串行化并在成功 / 异常路径恢复；worker 线程下 `chdir` 不受支持，不在本脚本调用面内。
- 非 GitHub remote（GitLab / 自建）未加自动化用例，行为与改动前一致。
