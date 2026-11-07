# 发布前检查：1.2.0 就绪度评估

> 创建时间：2026-11-08
> 触发：用户指令「开始执行发布前检查工作」（Phase 28 发布收口前置；非发布执行）
> 快照：本仓 `129da2b`（本批 4 个文档改动前工作区干净）、`package.json` version **1.1.0**、registry `latest = 1.1.0`、`origin/master` 与本地 `129da2b` 同步（0 领先 / 0 落后）
> 发布前门槛复核：[长期任务](../../plan/recurring.md) §3 **第 31 轮**（同日执行并留痕）
> 口径：**本轮只做检查与发布前准备**——不 bump 版本、不生成 CHANGELOG、不打 tag、不 publish、不推送；CI 发布需用户当次明确授权。

---

## 1. 结论

- **库侧就绪**：`verify`、覆盖率、a11y、E2E、视觉基线、计算样式等价、API 差分、许可与安全告警门禁全部通过（§3）。
- **目标版本**：按 [发布指南 §6](../../guide/release.md) 推断为 **`1.2.0`**（`v1.1.0..129da2b` 含 4 条 `feat`、0 条破坏性提交 → minor）；registry 尚无 `1.2.0`。
- **技术阻断项：无**。剩余前置只有用户明确授权触发 `Release` workflow；发布说明 `docs/release-notes/1.2.0.md` 已随本批落盘。
- **外部前置**：npm Trusted Publisher 绑定与 `GITHUB_TOKEN` 回推在 `1.1.0` 发布中已实测可用（run `42249119570`），本轮未在仓库侧复验外部配置。
- **安全告警**：critical 0 / high 0 / medium 0 / low 1（open 1 / dismissed 0），无豁免条目；low 按[安全规范 §2.1](../../standards/security.md#_2-1-发布前安全告警门禁) 可暂缓，不阻塞发布。

## 2. 发布面取证（版本推断）

- 范围 `v1.1.0..129da2b` = **13** 提交；按类型：`feat` **4** / `docs` **7** / `test` **1** / `ci` **1**。复算：`git log --pretty=%s v1.1.0..129da2b` 后按 Conventional 前缀分组。
- 破坏性变更检索（两条口径均 0 命中）：提交正文不含 `BREAKING CHANGE`；标题不含 `!:`。
- 4 条 `feat` 的作用面：

| 提交 | 类型 | 作用面 | 能力 |
| :--- | :--- | :--- | :--- |
| `41b113e` | feat(date-picker) | 消费方 | `selectionMode="range"` 区间选择（`[Date, Date]`） |
| `51d8494` | feat(toast) | 消费方 | Toast 16 个逐语气覆盖钩子（默认值不变） |
| `5cd24da` | feat(data-table) | 消费方 | DataTable 密度与选择列宽度 4 个钩子（默认值不变） |
| `2e9a814` | feat(date-picker) | 消费方 / 文档 | 范围选择的中英文档、示例、E2E 与视觉基线 |

- **API 差分预演**（基线 `1.1.0` → 当前 `dist`）：**无 breaking**。声明文件 202 → 203，导出 334 → 337（按唯一导出名计；两个入口重复计入会显示 +6）；新增文件 `components/_shared/date.d.ts`，新增导出 `DatePickerModelValue` / `DatePickerRange` / `DatePickerSelectionMode`（包根与 `date-picker` 子入口各 3 个）；28 个声明文件内容变化，均为可选成员 / 既有类型扩展，脚本判定无删除、重命名、成员删除或 required 收紧。
- **下游影响面判定**：`DatePicker` 的 `v-model` 静态类型扩为 `Date | [Date, Date] | null`，单日期消费方需放宽绑定类型（类型级迁移，运行时无破坏）；Toast / DataTable 只新增可选钩子，缺省路径零视觉变化；无新增运行时依赖、无 `exports` 键变化。

## 3. 就绪检查表

| # | 检查项 | 命令 / 口径 | 实测 | 结论 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 工作区状态 | `git status --short` | 空（改动前） | ✅ |
| 2 | 分支与上游同步 | `git status -sb` | `master...origin/master`（无 ahead / behind 标记，0 领先 / 0 落后） | ✅ |
| 3 | 全链路质量门 | `pnpm verify` | **exit 0**（复跑含本记录）：152 文件 / **2983** 例；lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿 | ✅ |
| 4 | 覆盖率 | `pnpm test:coverage` + `pnpm check:coverage` | Statements **93.16%** / Branches **86.30%** / Functions **94.83%** / Lines **92.51%**（阈值 90 / 80 / 90 / 90） | ✅ |
| 5 | 无障碍 | `pnpm test:a11y` | **68 passed** | ✅ |
| 6 | 浏览器回归 | `pnpm test:e2e --workers=2` | **484 passed / 4 skipped**（9.8m） | ✅ |
| 7 | 视觉基线 | `pnpm test:visual` | **40 passed**（1.0m；含区间面板亮暗） | ✅ |
| 8 | 计算样式等价 | `pnpm capture:styles` | **386 项 0 差异** | ✅ |
| 9 | 安全告警门禁 | `pnpm check:security-alerts` | critical **0** / high **0** / medium **0** / low **1** / note **0**；open 1 / dismissed 0；豁免 0 | ✅（low 可暂缓） |
| 10 | API 表面差分 | `pnpm release:manual api-diff --version=1.2.0 --tag=latest` | 基线 `1.1.0`；**无 breaking**，仅新增 3 个类型导出；28 文件内容变化人工复核 | ✅ |
| 11 | 包形态 | `npm pack --dry-run`；`check:build`；`check:licenses` | 442 文件 / 246.6 kB packed / 1.1 MB unpacked；`exports` 13 键、24 个产物齐全；许可声明覆盖全部运行时依赖 | ✅ |
| 12 | 目标版本占用 | `npm view caomei-ui@1.2.0 version`；`npm view caomei-ui dist-tags` | `1.2.0` → 404（未占用）；`latest = 1.1.0` / `next = 1.0.0-rc.1` | ✅ |
| 13 | 版本句一致性 | `pnpm docs:check:version` | 5 个展示面派生自 `package.json`（`1.1.0`），README 中英与 roadmap 当前版本句一致；发布时由 `prepareCmd` 自动同步到 `1.2.0` | ✅ |
| 14 | 发布说明 | `docs/release-notes/1.2.0.md` | 本批已创建；`generateNotesCmd` 会在提交分组后追加里程碑段 | ✅ |
| 15 | 发布工作流 | `.github/workflows/release.yml` | 仅 `workflow_dispatch`、仅 `master`；顺序 = 安全门禁 → `verify` → 覆盖率 → `pnpm release`；OIDC `id-token: write` | ✅ |
| 16 | 下游兼容 dispatch | `.github/workflows/downstream-compat.yml` 与 release job | 发布后按新增 tag 差集 dispatch；dispatch 前轮询 npm 可解析（600s 预算），1.1.0 实测有效 | ✅ |
| 17 | 长周期门槛 | [长期任务](../../plan/recurring.md) §3 第 31 轮 | 待执行批次 0；条件触发 1 项维持；`capture:styles` 386 项 0 差异 | ✅ |
| 18 | 发布前置记录 | Phase 28 登记记录 §2 / `todo.md` | 能力条目全部经 Review Gate 放行；M5-1 仍为「待执行」 | ✅ |

> **运行记录**：首轮 `pnpm test:coverage` 与 `pnpm test:a11y` 并行执行时，两个临时 git 夹具用例因 gpg 签名在 WSL vsock 负载下失败（`gpg failed to sign the data`）；单独复跑 `pnpm test:coverage` **exit 0**，`test:a11y` 68 passed。按环境 flake 记录，不计为代码缺陷。

## 4. 发布前准备项

| 项 | 状态 | 说明 |
| :--- | :--- | :--- |
| `docs/release-notes/1.2.0.md` | ✅ 本批已创建 | 里程碑 / 升级注意 / 已知限制；发布时由 `generateNotesCmd` 追加 |
| `CHANGELOG.md` | 发布链生成 | 当前顶部为 `1.1.0` 段；semantic-release 的 changelog 插件会写入 `1.2.0` 段 |
| 版本句（README 中英 / roadmap） | 发布链同步 | `prepareCmd` 在 npm bump 后、git 提交前同步；`docs:check:version` 看守 |
| tag / GitHub Release / 回推提交 | 发布链生成 | `@semantic-release/git` + `@semantic-release/github` |
| 下游 compat run | 发布链触发 | dispatch job 轮询 npm 传播后执行，run URL 写入 job summary |

## 5. 发布执行清单（本轮**未执行**）

0. **推送前置**：`Release` workflow 从远端 `master` 运行；本批提交（含 `docs/release-notes/1.2.0.md`）未推送时，远端发布链既读不到发布说明，也完全不含本批功能提交。须先经用户明确授权执行 `git push origin master`。
1. 用户明确授权发布 `1.2.0`。
2. 在 GitHub Actions 手动触发 `Release` workflow（`master`，`workflow_dispatch`）。
3. 观察 release job：安全门禁 → `verify` → `test:coverage` + `check:coverage` → `pnpm release`。
4. 记录 `v1.2.0` tag、GitHub Release、npm `latest` 与 provenance、回推提交。
5. 后校验：`npm view caomei-ui version dist-tags`；registry tarball shasum / 解包 `package.json` / README 版本句 / `exports` 13 键；冒烟运行。
6. 确认下游 compat run 记录 revision。
7. 产出发布执行治理记录；回填 `todo.md` M5-1、`roadmap.md`、`.session` 与索引。

## 6. 边界与未覆盖

- 本轮**未执行任何发布动作**：无 bump、无 `CHANGELOG` 生成、无 tag、无 publish、无 push（工作区仅本记录、发布说明与门槛复核的文档改动）。
- 未复验 GitHub 仓库侧的 Trusted Publisher 绑定、分支保护 bypass 与 `SECURITY_ALERTS_TOKEN` secret；依据是 `1.1.0` 发布 run `42249119570` 已全链路成功。
- `next` 通道仍为 `1.0.0-rc.1`，本版本走 `latest`；预发布不在本次范围。
- low 级安全告警 1 项按规范暂缓，未在 Backlog 建高优先级跟踪行（仅 high / critical 需要）。

## 7. Review Gate

- **audit-depth**：`quick`（发布前检查记录 + 发布说明 + 门槛复核行；零代码改动）。时间盒 ≤ 6 分钟。
- **R1（`quick`）**：`Reject`（1 blocker / 1 warning / 2 suggest）。**已修**：B1 记录中的取证命令钉 `HEAD`，触发 `check:docs-git-revision` 失败——三条命令改为持久 ref `v1.1.0..129da2b`，并移除不可持久化的 `origin/master..HEAD` 命令；修复后完整复跑 `pnpm verify` exit 0。W1 「其余计数与第 30 轮逐项一致」与 `capture:styles` 374 → 386 自相矛盾——限定为 §2.1 计数一致，并补采样面扩面归因。S1 快照改为「本批 4 个文档改动前工作区干净」；S2 导出计数补「按唯一导出名计」口径。
- **R2（`quick` delta）**：`Pass`（0 blocker / 1 warning / 1 suggest）。B1 / W1 / S1 / S2 全部关闭；补充修正：§1 结论段的裸范围令牌 `v1.1.0..HEAD` 改为 `v1.1.0..129da2b`。
- **R3（`quick` delta）**：`Pass`（0 blocker / 1 warning / 1 suggest）。仅新增 §5 第 0 条推送前置；W1 已补本条留痕，S1 已把后果扩为「读不到发布说明，也不含本批功能提交」。
- **实测用时**：R1 起于 `2026-11-08T01:42:39+08:00`，返回约 `01:52`（≈10 分钟，含子代理调度等待，超 ≤6 分钟时间盒）；R2 起于 `2026-11-08T02:25:57+08:00`，返回约 `02:34`（≈9 分钟，含调度等待，超 ≤5 分钟时间盒）；R3 起于 `2026-11-08T02:37:03+08:00`，返回约 `02:48`（≈11 分钟，含调度等待，超 ≤3 分钟时间盒）。
