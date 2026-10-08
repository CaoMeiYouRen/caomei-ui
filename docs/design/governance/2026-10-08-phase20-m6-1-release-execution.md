# Phase 20 M6-1：0.6.0 发布执行与 GitHub Release 回填记录

> 创建时间：2026-10-08
> 关联条目：[待办事项](../../plan/todo.md) Phase 20 **M6-1**（发布收口）
> 依据：[发布指南](../../guide/release.md)；Phase 20 范围评估 [D4](./2026-10-07-next-stage-scope-evaluation-4.md)（2026-10-07 裁定「发 **0.6.0**」）；长期任务[第 22 轮门槛复核](../../plan/recurring.md)（`d22f034`）
> 快照：发布对象 = `e996656` 起累积的 Phase 19 / 20 的 `src/**` 变更；本记录终态 HEAD `8e3c395`（= `origin/master`）。
> 边界：**本地手动发布**（未启用 CI 自动发布）；tag 不经重指；`npm publish` 由用户本地执行。

---

## 1. 结论

- **0.6.0 已发布并交付**：`npm version 0.6.0` → annotated tag `v0.6.0` → `pnpm changelog` → 本地 `npm publish`；registry **`latest` = 0.6.0**（`time['0.6.0']` = `2026-10-08T13:08:41Z`）。发布后校验（registry / tarball shasum / 解包冒烟）与文档版本句同步均通过。
- **发布流一次事故已闭环并转机检**：`npm version` 首跑被 `check-review-gate-artifacts` 阻断（根因 = `package.json` 缺末尾换行致发布元数据豁免失效）→ 修复 + 新增 `check-final-newline` 守卫根治（§5）。
- **补齐 GitHub Release**：0.x 六个版本（`v0.1.0` ~ `v0.6.0`）此前均无 GitHub Release，本批以各版本 CHANGELOG 段回填（§6）。

---

## 2. 发布对象与版本裁决

- **版本区间**：`0.5.0 → 0.6.0`（minor）。发布对象为 Phase 19 起累积、尚未进入任何已发布版本的 `src/**` 行为变更：浮层背景 / 阴影 token、Tabs 指示条几何、Drawer reduced-motion，以及 Phase 20 的 a11y 修复与治理守卫。
- **版本裁决**：无 `BREAKING CHANGE` / `!` 提交 → 按 [发布指南 §6](../../guide/release.md) 推断 minor → **0.6.0**，与 Phase 20 范围评估 D4 一致。registry `latest` 由 `0.5.0 → 0.6.0`。

---

## 3. 发布流程（实测步骤）

| 步骤 | 动作 | 结果 |
|:---|:---|:---|
| 0 | 长期任务**门槛复核第 22 轮**（发布前义务） | `d22f034`；待执行批次 0 / 条件触发 1 / 已判定不纳入 5 维持 |
| 1 | `pnpm verify` 全绿 | exit 0 |
| 2 | `npm version 0.6.0` | 版本提交 `5c48387` + **annotated tag `v0.6.0`**（首跑被守卫阻断，见 §5） |
| 3 | `pnpm changelog` | `CHANGELOG.md` 0.6.0 段生成（`b083a53`，用户执行并提交） |
| 4 | `npm publish`（用户本地） | registry `latest` = 0.6.0 |
| 5 | 发布后校验 + 版本句同步 | 见 §4 / `ead6624` |

> **tag 口径**：`v0.6.0` 指向**版本提交** `5c48387`，`CHANGELOG` 提交在其后（`b083a53`）——按 [发布指南 §3](../../guide/release.md) 第 4 步，tag 视图不含 CHANGELOG 段属**正常形态**，不回改。

---

## 4. 发布后校验

| 项 | 实测值 |
|:---|:---|
| registry 版本 | `0.6.0`；`dist-tags.latest` = `0.6.0`（官方 registry 直连） |
| 发布时间 | `time['0.6.0']` = `2026-10-08T13:08:41.218Z` |
| tarball | `https://registry.npmjs.org/caomei-ui/-/caomei-ui-0.6.0.tgz` |
| tarball shasum | registry `be0f20b1fd2f6f83b70adc3d0258258bb03a1526`；**本地下载 sha1 逐字符一致** |
| integrity | `sha512-0+b0buVSIVLP4BvkMc6cnQrC1uYkJqmSRxTlourb91IHps6veEii++RH2PUQ2hQ1kUm23Y48ok+6nPp0DOmbqg==` |
| 解包规模 | **359 文件 / 196K packed**；`package.json` = `0.6.0` |
| `exports` | 5 键：`.` / `./theme.css` / `./resolver` / `./nuxt` / `./package.json`——**逐键目标存在**（`./theme.css` → `./dist/styles/index.css`，9492 B） |
| 关键产物 | `dist/index.js` / `dist/styles/index.css` / `dist/resolver.js` / `dist/nuxt.js` / `THIRD-PARTY-LICENSES` 均在 |
| 能力冒烟 | 产物含 Phase 19 变更标记（`caomei-tabs__trigger` / `caomei-dialog__overlay` 样式） |
| 运行时依赖 | 5 个：`@internationalized/date` / `@lucide/vue` / `@tanstack/vue-table` / `@vavt/cm-extension` / `reka-ui` |

- **文档版本句同步**（`ead6624`）：README（中英）与 roadmap §1 的「当前版本」句 → 0.6.0（补 0.6.0 摘要）；`docs:check:version` **exit 0**（消解 4 处 `current-version-drift`）。
- **解包校验落在仓库外**（`/tmp/opencode/m6-verify/`），不污染仓库扫描面。

---

## 5. 事故与修复：`npm version` 被 Review Gate 工件守卫阻断

- **现象**：`npm version 0.6.0` 触发 husky `pre-commit` 的 `check-review-gate-artifacts`，报「缺少新鲜 Review Gate 工件（受检 1 文件：package.json）」。
- **根因**：仓库 `package.json` **无文件末尾换行**（违反 `.editorconfig` 的 `insert_final_newline = true`；由 `135d632` 引入）。`npm version`（`@npmcli/package-json`）改写清单时**补**末尾换行，使暂存 diff 多出一个 `}` hunk——而守卫的**发布元数据豁免**要求「增删行**全部**为 `"version": …` 形态」，遂失效 → 回落到通用「新鲜工件」规则 → 阻断。
- **修复（三步）**：
  1. `ef65a33`（`style(package)`）回退暂存后**补 `package.json` 末尾换行**（RG `standard` Pass）；
  2. 重跑 `npm version 0.6.0` → 豁免命中、提交 + tag 成功；
  3. `e14edc0`（`style`）归一**其余 9 个**同源漂移文件；`8e3c395`（`build(governance)`）新增 **`check-final-newline`** 守卫（`T1 missing-final-newline` / `T2 scope-narrowed` / `T3 sentinel-missing` / `T4 premise-changed`），接入 `governance:check`，`development.md` §12 补约定，单测 16 例 + 负向对照。
- **效果**：发布流不再被同源漂移阻断；守卫随 `verify` / CI 生效（防复发）。

---

## 6. GitHub Release 回填（0.1 ~ 0.6）

- **背景**：0.x 六个版本此前**均无 GitHub Release**（`gh release list` 为空）；`release.yml` 的 semantic-release github 步骤保持注释（本地手动发布）。
- **前置推送**（用户授权）：`git push origin master --follow-tags`（`e996656..8e3c395`，`v0.6.0` 入远端；此前落后 10 提交）。
- **note 来源**：各版本的 `CHANGELOG.md` 段（**去版本标题行、排除 `# Unreleased`**）。
- **创建结果**：`gh release create` 按旧→新创建 6 个 Release，标题 `vX.Y.Z`；`v0.1.0`~`v0.5.0` 非 latest、**`v0.6.0` = Latest**；均基于 annotated tag、`draft=false` / `prerelease=false`。

| Release | Latest | note 字数（不含段末换行） |
|:---|:---:|--:|
| v0.1.0 | — | 14561 |
| v0.2.0 | — | 2019 |
| v0.3.0 | — | 1110 |
| v0.4.0 | — | 2634 |
| v0.5.0 | — | 1031 |
| **v0.6.0** | **✅** | 1176 |

> 过程遇 GitHub API 的 TLS / 400 抖动，以重试补齐；最终 `gh release list` 与 API 逐项核验一致。

---

## 7. 质量门

- [x] `pnpm verify` **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / test **114 文件 / 2258 例** / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿）
- [x] `docs:check:version` **exit 0**（5 个版本展示面 = `package.json` 0.6.0）
- [x] `lint:md:check` / `governance:check` exit 0
- [x] registry 校验 / tarball shasum / 解包冒烟通过（§4）
- [x] 零 `src/**` 行为改动（上表各提交为版本 / 文档 / 换行 / 治理守卫）

---

## 8. Review Gate

发布窗口内各子批次逐一过 Gate（记录索引摘要见[治理索引](./index.md)）：

| 子批次 | 提交 | audit-depth | 结论 |
|:---|:---|:---|:---|
| 补 `package.json` 末尾换行 | `ef65a33` | `standard` | **Pass**（0 blocker） |
| 0.6.0 版本句同步 | `ead6624` | `quick` | **Pass**（0 blocker / 1 suggest） |
| 9 文件换行归一 | `e14edc0` | `standard` | **Pass**（0 blocker / 1 suggest） |
| 新增末尾换行守卫 | `8e3c395` | `standard` | R1 **Reject**（1 blocker：ESLint `operator-linebreak` 致 `verify` 红）→ 修复 + 补测试 → **R2 Pass** |

- `npm version` / `pnpm changelog` 提交受**发布元数据豁免**（`check-review-gate-artifacts`）覆盖，无需独立工件（豁免口径见该守卫 §设计依据）。
- **本记录（交付记录本体）**：R1 `standard` **Pass**（0 blocker / 0 warning / 3 suggest；3 suggest 同批修正，记为「已修复未复审」）。

---

## 9. 边界与遗留

- **未跑 Vite 消费方构建冒烟**：发布后校验为 **registry + 解包产物 + `exports` 逐键解析**（未起消费方 fixture 构建）；`check:build` / `check:resolver` / `check:nuxt` 已在 `verify` 内覆盖产物形态。
- **未启用 CI 自动发布**：保持本地手动发布；自动化与 1.x 路线另评估（见配套评估记录）。
- **tag 指向版本提交**：按既定口径不回改。
- **观察（未处置）**：推送时 GitHub 提示默认分支 **13 条 dependabot 告警**（3 critical / 5 high / 3 moderate〔API severity 枚举为 `medium`〕/ 2 low），不在本条目范围。
- **未覆盖**：CHANGELOG 顶部 `# Unreleased` 空段残留（B31 候选，未收口）。
