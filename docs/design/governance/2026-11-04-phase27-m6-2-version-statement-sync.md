# Phase 27 M6-2 版本句与发布说明同步交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 的 M6-2。
> 定位：Phase 27「CI 发布链路」第 2 条的交付记录；本记录是版本句同步、里程碑注入与失败语义的唯一载体。

## 1. 交付范围

- `release.config.js`：本地 `plugins` 显式复刻 shareable config，并新增 `@semantic-release/exec`：
  - `prepareCmd`：`node scripts/release/sync-version-statements.mjs --version=${nextRelease.version}`；
  - `generateNotesCmd`：`node scripts/release/release-notes.mjs --version=${nextRelease.version}`；
  - `@semantic-release/git` assets 增加 `README.md` / `README.en-US.md` / `docs/plan/roadmap.md`。
- 新增 `scripts/release/sync-version-statements.mjs`：复用 `scripts/shared/version-statements.mjs` 的锚点表与替换逻辑（原函数从 `manual-release.mjs` 下沉，保留 re-export）；锚点缺失或 `docs:check:version` 失败即中止。
- 新增 `scripts/release/release-notes.mjs`：读取 `docs/release-notes/<version>.md` 并输出；缺失时输出空串。
- 新增 `scripts/release/release.config.test.mjs`：对插件集合 / 顺序 / 命令 / assets / changelog 选项做机检，防止本地 `plugins` 覆盖 `extends` 后静默漂移。
- 新增 `docs/release-notes/1.1.0.md`：1.1.0 里程碑 / 升级注意 / 已知限制（顶层 `##`，小节 `###`）。
- 新增 `@semantic-release/exec@^7.1.0` devDependency。

## 2. 执行顺序（关键）

`generateNotes` → `prepare` 的插件顺序由 `release.config.js` 决定：

1. `@semantic-release/npm` 的 `prepare` 先 bump `package.json`；
2. `@semantic-release/exec` 的 `prepareCmd` 同步 README 中英与 roadmap 的「当前版本」句；
3. `@semantic-release/git` 把 `CHANGELOG.md` + `package.json` + 三个版本句文件一起提交。

`generateNotesCmd` 在 `generateNotes` 阶段运行，semantic-release 会把输出追加在提交分组之后；里程碑文件缺失时输出空串，不影响普通 patch / minor。

## 3. 失败语义

| 场景 | 行为 |
| :--- | :--- |
| 版本句锚点被改写 | `sync-version-statements` 抛出 `未匹配到`，prepare 中止，不提交 / 不发布；两阶段写入，不会留下部分改写 |
| roadmap 版本句同行含发布日期 / 「下一目标版本」 | 拒绝同步，要求拆成独立句子（防止发布日与下一目标停留在旧值） |
| 同步后 `docs:check:version` 红 | 中止，不进入 `@semantic-release/git` |
| 里程碑文件缺失 | 输出空串，正常发布（不伪造段落） |
| 版本号非法 | 两个脚本均拒绝（`Invalid --version`） |

## 4. 验证证据

- `pnpm exec vitest run scripts/release/release.config.test.mjs scripts/release/sync-version-statements.test.mjs scripts/release/release-notes.test.mjs scripts/release/manual-release.test.mjs` → **85 passed**（含新增配置 5 例、版本句同步 6 例、里程碑 3 例）。
- `node scripts/release/sync-version-statements.mjs --version=1.0.0` → exit 0（无变更），随后 `docs:check:version` 通过。
- `node scripts/release/release-notes.mjs --version=1.1.0` → 输出 1.1.0 里程碑段。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm governance:check` → **exit 0**（2026-11-04 提交前批次）。
- `roadmap.md` §1 已拆为「当前版本」独立句与「版本与阶段」句；`1.1.0` 重放结果为 `当前状态：当前版本 \`1.1.0\`。`，不再携带旧日期 / 下一目标。

## 5. Review Gate

- **audit-depth**：`standard`（发布说明生成链 + 版本句同步 + 对外文档）；R2 为 `quick` delta。时间盒：R1 ≤ 8 分钟，delta ≤ 4 分钟。
- **R1（`standard`）：`Reject`**（1 blocker / 3 warning / 4 suggest）——blocker：roadmap 版本句会把发布日期与「下一目标版本」留在旧值，产生矛盾文案；warning：中文指南旧红灯表述、配置无机检、`extends` 隐式依赖。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning；B1 与 W1 ~ W3 关闭，S1 / S3 关闭；S2 下沉共享模块转为后续）。
- **用时实测（宿主时钟）**：R1 发起 `2026-11-04T14:55:09Z`、返回 `15:02:18Z` ≈ **7 分 9 秒**（≤ 8 分钟）；R2 发起 `15:06:49Z`、返回 `15:08:02Z` ≈ **1 分 13 秒**（≤ 4 分钟）。
- **复查基线**：`release.config.js`、`scripts/shared/version-statements.mjs`、`scripts/release/sync-version-statements.mjs`、`scripts/release/release-notes.mjs`、两份指南 §5、`docs/plan/roadmap.md` §1、本记录、`docs/design/governance/index.md`。

## 6. 未覆盖边界

- **真实 CI run 未执行**：`prepareCmd` / `generateNotesCmd` 在 semantic-release 中的实际拼接、GitHub Release note 非空、发布后守卫全绿需首次真实 run 取证。
- **dry-run** 不执行 `prepare`，因此 dry-run 不会改写版本句；只验证 `generateNotesCmd` 的输出（若使用完整插件集）。
- `docs/plan/roadmap.md` 的「当前版本」句必须独立成句（不得与发布日期 / 「下一目标版本」同行），否则同步脚本拒绝；该约束由脚本与单测共同看守。
- 里程碑文件目前只有 `1.1.0`；后续版本无文件时输出空串。
- `@semantic-release/exec` 版本升级可能改变 `${nextRelease.version}` 模板行为，升级时需复跑。
- `VERSION_PATTERN` / `validateVersion` 在两个新脚本中重复，后续可下沉 `scripts/shared/`（不影响当前行为）。
