# 发布前检查：1.3.0 就绪度评估

> 创建时间：2026-11-14
> 触发：用户「继续推进剩余条目」+ Phase 33 M5-1 发布收口前置（非发布执行）。
> 快照：本仓 `05b722c`（本批改动前工作区干净）、`package.json` version **1.2.0**、registry `latest = 1.2.0`、`origin/master` 落后本地 **10** 个提交。
> 发布说明：[`docs/release-notes/1.3.0.md`](../../release-notes/1.3.0.md) 随本批落盘。
> 发布前门槛复核：[长期任务](../../plan/recurring.md) §3 **第 36 轮**（同日执行并留痕）。
> 口径：**本轮只做检查与发布前准备**——不 bump 版本、不生成 `CHANGELOG`、不打 tag、不 publish、不推送；发布需用户当次明确授权。

---

## 1. 结论

- **库侧就绪**：`verify`、覆盖率、a11y、E2E、视觉基线、计算样式等价、API 差分、许可与安全告警门禁全部通过（§3）。
- **目标版本**：按 [发布指南 §6](../../guide/release.md) 推断为 **`1.3.0`**（`v1.2.0..05b722c` 含 **24** 条 `feat`、0 条破坏性提交 → minor）；registry 尚无 `1.3.0`（`npm view` 404），`latest = 1.2.0` / `next = 1.0.0-rc.1`。
- **技术阻断项：无**。剩余前置只有用户明确授权「推送 `master` + 触发 `Release` workflow」；发布说明已随本批落盘。
- **安全告警**：critical 0 / high 0 / medium 0 / low 1（open 1 / dismissed 0），无豁免条目；low 按[安全规范 §2.1](../../standards/security.md#_2-1-发布前安全告警门禁) 可暂缓，不阻塞发布。

## 2. 发布面取证（版本推断）

- 范围 `v1.2.0..05b722c` = **103** 提交；按类型：`feat` **24** / `fix` **12** / `docs` **34** / `chore` **27** / `test` **4** / `refactor` **1** / `ci` **1**。
- 破坏性变更检索（两条口径均 0 命中）：标题不含 `!:`；提交正文不含 `BREAKING CHANGE`。
- 发布面覆盖 **Phase 29 ~ Phase 33** 五个阶段（Phase 32 为质量收口，消费方可见面仅 `reka-ui` 2.11 适配与文档站过渡守卫）：
  - 消费方能力：`data-motion` 轴 / `CaomeiIcon` 与图标注册表 / 不可见命中区 / ColorPicker 单选组 / Select 面板上限 / Paginator `#report` / DataTable `autoResetPageIndex`。
  - 可见外观变化：Calendar 导航与 RichTextEditor 容器描边加深（见 §4 的基线刷新）。
  - 仅开发链：4 项工具链大版本升级。

## 3. 就绪检查表

| # | 检查项 | 命令 / 口径 | 实测 | 结论 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | 工作区状态 | `git status --short`（检查前） | 空 | ✅ |
| 2 | 全链路质量门 | `pnpm verify` | **exit 0**：164 文件 / **3187** 例；lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿 | ✅ |
| 3 | 覆盖率 | `pnpm test:coverage` + `pnpm check:coverage` | Statements **93.52%** / Branches **86.35%** / Functions **95.40%** / Lines **92.92%**（阈值 90 / 80 / 90 / 90） | ✅ |
| 4 | 无障碍 | `pnpm test:a11y` | **68 passed** | ✅ |
| 5 | 浏览器回归 | `pnpm test:e2e` | **772 passed / 4 skipped**（13.8m） | ✅ |
| 6 | 视觉基线 | `pnpm test:visual` | **42 passed**（首轮 36 passed / 6 failed：`font-latin-button` / `font-latin-input` / `font-mixed-button` × 亮暗；已确认是 Playwright / Chromium 升级后拉丁文本排版与字形栅格化变化造成的**陈旧基线**，本地与 CI 的实际渲染一致（差异像素数逐项相同），刷新 6 张后全绿，见 §4） | ✅ |
| 7 | 计算样式等价 | `pnpm capture:styles` | **399 项 0 差异** | ✅ |
| 8 | 安全告警门禁 | `pnpm check:security-alerts` | critical **0** / high **0** / medium **0** / low **1** / note **0**；open 1 / dismissed 0；豁免 0 | ✅（low 可暂缓） |
| 9 | API 表面差分 | `pnpm release:manual api-diff --version=1.3.0 --tag=latest` | 基线 `1.2.0`；声明文件 **203 → 205**、导出 **337 → 349**；**无删除 / 重命名 / 成员删除 / required 收紧**（详见 §3.1） | ✅ |
| 10 | 包形态 | `npm pack --dry-run`；`check:build`；`check:licenses` | **447** 文件 / **263.1 kB** packed / 1.1 MB unpacked；`exports` **13** 键、24 个产物齐全；许可声明覆盖全部运行时依赖 | ✅ |
| 11 | 目标版本占用 | `npm view caomei-ui@1.3.0 version`；`npm view caomei-ui dist-tags` | `1.3.0` → 404（未占用）；`latest = 1.2.0` / `next = 1.0.0-rc.1` | ✅ |
| 12 | 版本句一致性 | `pnpm docs:check:version` | 5 个展示面派生自 `package.json`（`1.2.0`）；README 中英与 roadmap 当前版本句一致；发布时由 `prepareCmd` 同步到 `1.3.0` | ✅ |
| 13 | 发布说明 | `docs/release-notes/1.3.0.md` | 本批已创建：里程碑（动效 / 图标 / 触摸目标 / 组件增强 / 可访问性 / 工具链）、升级注意、已知限制；`generateNotesCmd` 会在提交分组后追加 | ✅ |
| 14 | 发布工作流 | `.github/workflows/release.yml` | 仅 `workflow_dispatch`、仅 `master`；顺序 = 安全门禁 → `verify` → 覆盖率 → `pnpm release`；OIDC `id-token: write` | ✅ |
| 15 | 下游兼容 dispatch | `.github/workflows/downstream-compat.yml` | 发布后按新增 tag 差集 dispatch（`dependfix` / `caomei-auth` / `momei`），dispatch 前轮询 npm 可解析 | ✅（发布后回收 run 结果） |
| 16 | 长周期门槛 | [长期任务](../../plan/recurring.md) §3 第 36 轮 | 待执行批次 0；条件触发 1 项维持；`capture:styles` 399 项 0 差异 | ✅ |
| 17 | 发布前置记录 | Phase 33 登记记录 §2 / `todo.md` | 能力条目（M1-1 ~ M6-2）全部经 Review Gate 放行；M5-1 为本条 | ✅ |

### 3.1 API 差分人工复核

- **新增导出（12 个唯一名）**：`caomeiIconOverridesKey` / `caomeiIconRegistryKey` / `IconOverridesSource` / `IconRegistry` / `IconRegistrySource` / `InternalIconMap` / `InternalIconName` / `internalIcons` / `provideIconOverrides` / `provideIconRegistry` / `useIconRegistry` / `useInternalIcons`；新增声明文件 `icons/registry.d.ts` / `icons/internal-icons.d.ts`。
- **新增可选成员**：`DataTableProps.autoResetPageIndex?: boolean`（默认不改变行为）；`Paginator` 的 `#report` 插槽类型（增量）。
- **75 个声明文件内容变化**，逐类归因：① Vue SFC 代码生成脚手架变化（`__VLS_Slots` / `__VLS_template` 形态，vue-tsc 生成器行为，非公共类型）；② 成员与联合类型顺序调整（`button` / `image` / `textarea` / `icon` 等，集合不变）；③ 上述新增成员。**无删除、重命名、成员删除或 required 收紧**；下游需关注的行为变化见发布说明「升级注意」。

## 4. 发布前修复（本轮发现并处置）

| 项 | 现象 | 处置 | 证据 |
| :--- | :--- | :--- | :--- |
| `data-table.features.test.ts` | `lint:check` 失败：describe 回调 **634 行**，超 `max-lines-per-function` 600（由 M2-1 新增用例累积） | 把 6 条冻结列用例拆到 `data-table.frozen.test.ts`，生产代码零改动 | `pnpm exec eslint`（两文件）零 error；`vitest run src/components/data-table` **136 passed**；`pnpm verify` 复跑 exit 0 |
| 视觉基线 | `calendar@固定时钟` / `date-picker 区间面板` 亮暗 4 张差异（约 174 ~ 190 px） | M4-2 的导航描边可见变化未同步基线；`--update-snapshots` 仅刷新这 4 张 | 复跑 `test:visual` → 36 passed / 6 failed（当时归因为字体族，已在下一行更正为陈旧基线） |
| 记录补记 | M4-2 记录 §3 未含视觉基线读数 | 补「发布前补记」一行，不改写原结论 | 见 [M4-2 记录](./2026-11-14-phase33-m4-2-calendar-rte-contrast.md) §3 |
| 字体路径基线（6 张） | `font-latin-button` / `font-latin-input` / `font-mixed-button` × 亮暗，由周回归 CI（run `43575662738`）暴露；差异集中在拉丁文本行，本地与 CI 的 Playwright `toHaveScreenshot` 差异像素数逐项一致（184 / 188 / 524 / 184 / 189 / 520） | 判定为 Playwright / Chromium 版本漂移后的**陈旧基线**（字体文件与字体栈未变、CJK 面 42 项中其余全绿），刷新这 6 张；`test:visual` 复跑 **42 passed** | 刷新后本地全绿。两张按钮同时收窄 1px（`116 → 115` / `226 → 225`），由拉丁文本 advance 变化造成，非盒模型 / padding / 配色变化；CI 渲染与本地一致（同一 Chromium 内核、同一 woff2），下次周回归验证 |

> 两项均属**发布前质量门暴露的收口缺口**，不改变已放行条目的事实结论；处置后上述质量门读数即为本记录实测值。

## 5. 发布前准备项

0. **推送前置**：`Release` workflow 从远端 `master` 运行；本批提交（含发布说明）未推送时，远端发布链既读不到发布说明，也完全不含 Phase 29 ~ 33 的功能提交。须先经用户明确授权执行 `git push origin master`（当前本地领先 **10** 个提交 + 本批）。
1. **触发方式**：GitHub Actions → `Release` → `Run workflow`（`master`），无需输入；发布链自动完成版本推断、`CHANGELOG`、版本句、tag、GitHub Release 与 npm publish（OIDC）。
2. **发布后回收**：`latest = 1.3.0`、tag / GitHub Release / 回推提交一致；tarball shasum、`exports` 13 键、解包 README 版本句；`Downstream Compat` run 结论；随后写 M5-1 发布记录并回填 `todo.md` / `roadmap.md`。
3. **失败处置**：按[发布指南](../../guide/release.md) 回退，不重试同一构建。

## 6. Review Gate

- **审计声明**：R1 `standard`（测试文件拆分 + 基线刷新 + 发布文档，≤10 分钟）+ R2 `quick`（修复点 delta，≤5 分钟）；单分区。
- **R1：`Reject`**（1 blocker / 5 warning / 4 suggest）
  - blocker：`docs/design/governance/index.md` 暂存区 `MM` 且索引版摘要含门禁读数（`check:staging-hygiene` exit 1）→ 重新 `git add` 并收敛摘要，`check:governance-counts` 复跑通过。
  - warning：P2 计数「35 个目标全部落地」与 M4-1 记录（28 交互 + 7 排除）矛盾 → 改为 28 = 6 + 22、7 项不扩；漏披露 TagsInput 根点击聚焦与 Input 控件盒填满外壳 → 正文与升级注意各补一条；ColorPicker 等价色块去重未披露 → 升级注意补归一口径；「密码显隐」无对应命中区 → 改为「输入清除」；「Phase 29 ~ 33 四个阶段」→ 五个阶段。
  - suggest：M4-2 §4 与补记互斥、视觉差异读数口径、`describe` 名残留「冻结列」、全称判断未限定 → 均已采纳。
- **R2：`Pass`**（0 blocker / 1 warning / 2 suggest）
  - 索引摘要仍含提交 / feat 计数 → 已收敛为「minor 1.3.0（无破坏性提交，registry 未占用）」。
  - M4-2 两组视觉读数关系 → 已注明 Playwright 计数低于原始逐像素计数。
  - 发布说明「值片」两处口径 → 已知限制补「MultiSelect 值片容器 5 + 值片内装饰 icon 2；删除按钮属 P0 已扩」。
- **复查基线**：本记录 §2 ~ §5；`docs/release-notes/1.3.0.md`；`docs/design/governance/index.md` 条目；`recurring.md` 第 36 轮；`todo.md` M5-1 行；M4-2 记录 §3 补记与 §4；`data-table.frozen.test.ts` 用例集；4 张视觉基线 PNG。

## 7. 后续候选（未纳入本批）

- **Playwright 版本与视觉基线联动**：`@playwright/test` 为 `^` 范围，Chromium 随 minor 升级变化会再次使冻结基线陈旧（本次即由此触发）。本批只在[测试规范](../../standards/testing.md) 补「Playwright 升级须同批重冻结视觉基线」的程序性约束；是否再加机检守卫（比对安装版本与基线冻结版本）或改钉精确版本，需用户决策后另行登记。
