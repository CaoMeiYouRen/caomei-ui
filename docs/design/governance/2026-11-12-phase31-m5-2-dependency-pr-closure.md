# Phase 31 M5-2：依赖 PR 复核与合并交付

> 创建时间：2026-11-12
> 触发：Phase 31 M5-2（[Phase 31 登记批次](./2026-11-12-phase31-registration.md) §2）。
> 处置口径：[GitHub 协作规范](../../standards/github-collaboration.md) §3；自动合并边界由 `.github/mergify.yml` 维持，**未放宽**。

## 1. 在册 PR 结论总表

状态快照：`gh pr list --state open` @ `2026-11-12T12:55Z` = `[#33]`。在册 **6 个**（登记读数 21 中其余项已由 2026-11-12 12:00 巡检与本轮前的自动合并收口；本表含由 M5-1 收口的 #48）。

| PR | 依赖 | 结论 | 依据 / 处置 |
|:---|:---|:---|:---|
| #48 | `eslint-plugin-vue` 10.11.1 → 10.12.0 | **已合并**（归 M5-1） | `stepper` 类型去重落地后 CI 全绿，Mergify 合并 |
| #30 | `@nuxt/kit` 4.6.3 → 4.6.4 | **已合并** | Quality 失败根因 = `check-licenses` 缺 `@nuxt/kit@4.6.4` 台账条目；补台账后全绿，Mergify 合并（`e30a75c`） |
| #41 | `@lucide/vue` 1.54.0 → 1.70.0 | **已合并** | 同上：缺 `@lucide/vue@1.70.0` 台账条目；补台账后全绿（`9e642b4`），图标 API 无回归 |
| #32 | `axe-core` 4.13.0 → 4.14.0 | **已合并** | Test 失败根因 = 4.14 默认启用 `label-content-name-mismatch`，8 个组件各 1 条 needsReview；人工复核后登记例外（`ed274af`），全绿后合并 |
| #34 | `unplugin-vue` 8.0.0 → 8.0.1 | **已合并** | 初始与 lockfile 冲突，`update-branch` 无法更新；请求 dependabot 重建后冲突消解，Test run `43222033712` 全绿，Mergify 合并（`6556380`，2026-11-12T12:53:10Z） |
| #33 | `reka-ui` 2.10.4 → 2.11.0 | **维持阻断**（登记 D5 ① 之外的已知回归） | PR 评论留痕：≥2.11.0 下 `input-number.test.ts` 4 例失败 / 45 例通过；跟踪载体 `docs/plan/backlog.md`「`reka-ui` 补丁升级」行（**2026-11-12 后续评估更新见该行与 PR #33 评论**） |

- **无「无结论」项**：结尾 open 列表仅 #33（维持阻断），结论与理由已落盘（本节 + PR 评论）。
- **不触碰发布面**：未修改 `release.config.js` / `release.yml`；未放宽 Mergify 条件。

## 2. 辅助维护

### 2.1 许可证台账（#30 / #41）

- 两个 PR 都是 **caret 范围内的 lockfile 升级**（`package.json` 不变，`pnpm-lock.yaml` 解析到新版本），因此 `check-licenses` 按**安装版本**要求的 `## <name>@<version>` 标题失配。
- 处置：仅更新 `THIRD-PARTY-LICENSES` 标题（`@nuxt/kit@4.6.3 → 4.6.4`、`@lucide/vue@1.54.0 → 1.70.0`）。许可正文经 npm tarball（`4.6.4` / `1.70.0`）与旧版**逐字比对一致**（MIT / ISC），不复制重复文本。
- 本地复核：`pnpm check:licenses` 通过（第三方许可声明覆盖全部运行时依赖）。

### 2.2 无障碍例外（#32）

- axe-core 4.14 在 CHANGELOG Features 中声明 **`label-content-name-mismatch` 默认启用**（[#5421](https://github.com/dequelabs/axe-core/issues/5421)），并将 value-text 角色标为 incomplete、按词（含 CJK 分词）比较可见文本（[#5355](https://github.com/dequelabs/axe-core/issues/5355)）。
- 命中面：8 个组件各 1 条 needsReview——Calendar 日格、DatePicker 触发器、Paginator 页码、Stepper 触发器、ToggleButton、Toolbar、Tooltip 触发器、TooltipContent 内容节点。
- 处置：逐条人工复核「可访问名包含可见文本（数字 / 日期 / 两态文案 / 图标语义）」后，按既有例外机制登记（`test/a11y/exceptions.ts`，`kind: 'incomplete'`、`count: 1` 指纹锁定，judgment 回链本节）。未关闭规则、未缩小受检面。
- 本地复核：`pnpm exec vitest run test/a11y` → **68 passed**；`eslint` 通过。

## 3. `manual-release` 安全不变量复核

- 失败态（2026-11-11，run `43000557618` / `42999789680`）：`scripts/release/manual-release.test.mjs` 为 **71 tests / 1 failed**（`manual-release.test.mjs:610`）。
- 修复源：PR #50（2026-11-12T04:41:35Z 合并）修正了 preflight 的 dry-run 分支守卫。
- 更新分支后 run `43213844470`：同文件 **74 tests 通过**（该 run 整体仍因 #32 的 a11y 例外未登记而失败，与本条无关）；#32 修复后 run `43221067060`：74 tests 通过且 **Test & Build 全绿**。
- 结论：该失败来自**陈旧 base**，不是本轮依赖升级引入的回归；无需改动发布面代码。

## 4. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm check:licenses`（master） | 通过 |
| `pnpm exec vitest run test/a11y`（master，axe 4.14） | 68 passed |
| 合并 PR 的 CI | 修复前的失败 run：#30 `43213762544`、#41 `43213811219`、#32 `43213844470`；修复后全绿并合并：#30 `43220635546`、#41 `43220705639`、#32 `43221067060`、#34 `43222033712` |
| master CI | `6556380` 的 Test / Security Alerts / Pages / TODO to Issue 全部 success |

## 5. 风险与边界

1. **台账随安装版本漂移**：`@nuxt/kit` / `@lucide/vue` 在 `package.json` 里是 caret 范围，lockfile 变化后台账标题仍需同步；已由 `check-licenses` 在 CI 阻断，属可发现面。
2. **例外清单增长**：清单 2 → 10 条，其中 `label-content-name-mismatch` 8 条（均 `count: 1`）；`count` 指纹会在命中面变化时报错，需重新裁定，不会静默失效。
3. **#34 已收口**：冲突经 dependabot 重建消解后正常合并；期间未改 lockfile、未强推。
4. **#33 维持阻断**：解除条件写在 backlog（`input-number.test.ts` 4 例全过或显式适配），不在本批处理；**2026-11-12 后续评估**将 4 例细分为 3 例测试装置 + 1 例触摸时序，适配规模 5 文件 / 约 14 行，取证见 PR #33 评论与 backlog 该行。
5. **自动合并未放宽**：本轮只做「让已绿者变绿」的辅助维护，没有修改 Mergify 规则或必需检查集。

## 6. Review Gate

- **audit-depth**：`deep`（涉及依赖版本、许可证台账与无障碍门禁数据）；时间盒 ≤20 分钟。
- **结论**：R1 Reject → R2 Reject → R3 Pass（0 blocker）；逐轮 findings 与处置见 `artifacts/review-gate/2026-11-12-phase31-m5-2-dependency-pr-closure.md`。
- **复查基线**：本记录 §1 / §2；`THIRD-PARTY-LICENSES` 的两个标题；`test/a11y/exceptions.ts` 的 8 条新例外；open PR 列表（`gh pr list --state open` = `[#33]`）。
