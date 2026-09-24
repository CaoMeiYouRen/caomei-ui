# M3-2 / M3-3 迁移交付面收口：0.3.0 发布执行与 0.x API 冻结窗口

> 阶段：Phase 13（组件能力补齐与 dependfix 迁移解阻）→ M3 迁移交付面（M3-2 版本交付 / M3-3 冻结窗口声明）。
> 范围依据：[下一阶段范围评估 §6 / §11](./2026-09-23-next-stage-scope-evaluation.md)；条目登记：[待办事项](../../plan/todo.md) Phase 13 M3；同批上游记录：[M3-1 迁移映射收口](./2026-09-23-m3-migration-delivery.md)。

## 1. 范围与目标

按 [待办事项](../../plan/todo.md) M3-2 / M3-3：

- **M3-2**：版本基线 + `pnpm changelog` + annotated tag + 按 runbook 本地手动发布 + 发布后校验（含四项子路径冒烟），版本 / CHANGELOG / tag 三者一致，`npm view` = 0.3.0，发布记录登记治理索引。
- **M3-3**：在 `guide/version-policy.md`（中英）声明 1.0 前不再变更的能力面（组件 props / 子路径导出 / token 契约）与仍可能调整的面，并与 dependfix `docs/design/governance/caomei-ui-migration.md` §12 的上收条件 3 对齐。

**执行分工**：版本基线（`npm version 0.3.0`）、CHANGELOG 生成与 `npm publish` 由**用户在本地执行**（提交 `92264fc` / `75c5610`，tag `v0.3.0`）；本批承担**发布后校验、发布后文档同步、冻结窗口声明与登记**。

## 2. 交付面与规模

| 文件 | +/− | 内容 |
| :--- | :--- | :--- |
| `docs/guide/version-policy.md` | +23 −0 | 新增「0.x API 冻结窗口」节（冻结面 / 非冻结面 / 例外与流程） |
| `docs/i18n/en-US/guide/version-policy.md` | +23 −0 | 同上（英文等价节，H2 数与中文一致） |
| `README.md` | +2 −2 | 版本 0.2.0 → 0.3.0（含 0.3.0 能力摘要与冻结窗口链接）；Phase 12 归档 / 「无进行中阶段」陈旧口径 → Phase 13 条目已全部交付 |
| `README.en-US.md` | +1 −1 | 版本 0.2.0 → 0.3.0 + 冻结窗口链接 |
| `docs/plan/roadmap.md` | +2 −2 | §1 已发布版本句补 0.3.0（`latest` = 0.3.0）与 Phase 13 状态；Phase 13 阶段表条目计数 **10 → 11** 订正（M1 4 + M2 3 + M3 3 + M4 1） |
| `docs/plan/backlog.md` | +1 −1 | 「测试隔离与偶发失败」补出现记录 ④ |

**规模**：文档载体 **6 文件 / +52 −6**（唯一口径）。复算命令 `git diff 75c5610 --numstat -- README.md README.en-US.md docs/guide/version-policy.md docs/i18n/en-US/guide/version-policy.md docs/plan/roadmap.md docs/plan/backlog.md`（base = 发布收口提交 `75c5610`（持久 ref），快照 2026-09-24）。逐文件输出：`README.md` +2 −2 / `README.en-US.md` +1 −1 / `docs/guide/version-policy.md` +23 / `docs/i18n/en-US/guide/version-policy.md` +23 / `docs/plan/roadmap.md` +2 −2 / `docs/plan/backlog.md` +1 −1，合计 **+52 −6**；另有本记录与治理索引 / `todo.md` 进度行等治理载体，不计入该口径。

## 3. M3-2 发布后校验证据

**发布面一致性**：

- `package.json` `version` = **0.3.0**；annotated tag **`v0.3.0` → `92264fc`**（版本提交）；`CHANGELOG.md` 含 `# [0.3.0]`（2026-09-24）段，本版无 `BREAKING CHANGES`（全部为 feat / fix）。
- `npm view caomei-ui version` = **0.3.0**；`dist-tags` = `{ latest: '0.3.0' }`；`versions` = `[0.0.0, 0.1.0, 0.2.0, 0.3.0]`。

**registry tarball 完整性**：`npm pack caomei-ui@0.3.0` 下载的 tarball **shasum = `b1a2f6258f3bfd6fa52b2405a8ee6acb1e44a4f4`**，与发布日志披露值**逐字符一致**（350 文件 / packed 180.7 kB / unpacked 820.3 kB）。

**内容断言**：

- 含基础层 `dist/styles/index.css`（**5,880 B**）、**不含**旧单体 `dist/styles.css`；
- `exports` = `{ ".", "./theme.css", "./resolver", "./nuxt", "./package.json" }`（无 `./styles.css`）；
- 产物含本阶段能力：`data-table.js` 命中 `rowGroupMode` / `groupRowsBy` / `expandableRowGroups` / `expandedRowGroups` / `expandedRows` / `multiSortMeta` / `sortDescFirst`；`dist/components/tags-input/` 存在。

**四项子路径冒烟**（干净目录 + 裸 Node ESM + `css-stub-loader` 短路 CSS）：

| 子路径 | 结果 |
| :--- | :--- |
| `caomei-ui`（根） | **89 个导出**（0.2.0 为 88，+1 = `CaomeiTagsInput`）；关键公共导出齐全（含 `CaomeiDataTable` / `CaomeiTagsInput` / `caomeiLocales` / `useConfirm` / `useTheme` / `useToast`） |
| `caomei-ui/resolver` | `CaomeiUiResolver` 为 function |
| `caomei-ui/nuxt` | `caomeiUiNuxtModule` 为 function |
| `caomei-ui/theme.css` | 5,880 B，含 `--caomei-color-primary:` 与 `.caomei-root` |

**Vite 消费方构建冒烟**：独立 Vite 应用导入包根 + `theme.css`，`vite build` **exit 0**；产物 CSS **19.29 kB / gzip 3.72 kB**，含基础层（`--caomei-color-primary:` ×9、`.caomei-root`）与组件样式（`.caomei-button` ×71、`.caomei-tags-input` ×30）。

**全链路复跑**：发布后补跑 `pnpm verify` → **exit 0**（88 文件 / 1793 tests）。首跑曾出现 2 例并发时序 flaky（`auto-complete` / `color-picker`），两文件隔离重跑 61 passed、复跑全绿，已登记 Backlog 出现记录 ④。

## 4. 偏差登记

| 项 | 说明 | 处置 |
| :--- | :--- | :--- |
| tag 与 CHANGELOG 的次序 | tag `v0.3.0` 指向版本提交 `92264fc`，CHANGELOG 提交 `75c5610` 在其后 → **tag 视图不含 0.3.0 的 CHANGELOG 段** | 与 0.2.0 同类偏差；按[发布指南 §8](../../guide/release.md) 不重写已发布 tag |
| 版本提交信息形态 | 版本提交信息为 `0.3.0`（由 `npm version` 生成），非 Conventional Commits 形态（如 `chore(release): 0.3.0`） | 已发布不重写；登记口径，后续手工发布按 [发布指南 §3](../../guide/release.md) 用 `conventional-committer` |
| 发布前 `pnpm verify` 留痕 | 发布前是否复跑无留痕 | 本轮**发布后**补跑 exit 0（§3）；后续手工发布须在版本基线提交前留痕 |
| CHANGELOG 空 `# Unreleased` 段 | 生成器在无未发布提交时仍输出标题 | 已在 [Backlog](../../plan/backlog.md) 在册（生成器健壮性收口），不阻断 |

**发布前门槛复核**：[长期任务](../../plan/recurring.md) 第 12 轮已于 `62ec030` 执行并留痕（满足 M3-2 验收标准 ④）。

## 5. M3-3 0.x API 冻结窗口声明

落点：[版本与兼容策略](../../guide/version-policy.md) 新增「0.x API 冻结窗口」节（中英同步，H2 数与 parity 门禁一致）。

- **冻结面（1.0 前不做破坏性变更）**：既有组件公开 props / events / slots 的**名称与语义**；子路径导出（`caomei-ui` / `caomei-ui/theme.css` / `caomei-ui/resolver` / `caomei-ui/nuxt`，加 `./package.json` 约定入口，即 `exports` 全 5 键）集合与语义；包根公开导出名（`Caomei*` / `use*` / locale 类型与内建文案命名空间的**既有键名称与语义**，新增键属增量）；语义化 `--caomei-*` token 的**名称与用途**。
- **非冻结面**：新增组件 / 可选 props / events / slots / token（向后兼容增量）；内部实现、DOM 结构、类名、计算样式与像素级表现、示例与文档措辞；未从包根导出的内部模块与类型。
- **例外与流程**：冻结面若因安全 / 正确性必须破坏，须单独决策、递增 `minor`、CHANGELOG `BREAKING CHANGES` 披露并给出下游修复指引；冻结解除须单独决策。
- **与既有「0.x 兼容策略」的关系**：冻结面**收窄**该节「`minor` 可能含破坏性变更」的表述，非冻结面仍适用。
- **对齐**：与 dependfix 仓库 `docs/design/governance/caomei-ui-migration.md` §12「上收触发条件 3」**原文**一致——「caomei-ui 发布 **≥ 0.2.0** 稳定版并明确 0.x API 冻结窗口」；版本面由 0.3.0 满足（≥ 0.2.0），冻结窗口面由本节给出。**页面侧转述说明**：`guide/version-policy.md` 受 `docs:check:version` 的 `hardcoded-version` 约束（版本展示面禁三段式版本字面量），故页面转述为「发布稳定 0.x 版本」（去阈值），阈值原文以本记录为准。**本仓不修改 dependfix 仓库文件**（他仓执行）。

## 6. 文档同步与质量门

- **发布后文档同步**：README（中英）版本表述、roadmap §1 已发布版本句与 Phase 13 状态、roadmap Phase 13 条目计数订正；站点版本展示由 `themeConfig.version` 派生（发版无需手改站点文档）。
- **质量门**（快照 2026-09-24，**含本记录自身入库**）：`pnpm verify` **exit 0**（88 文件 / 1793 tests）；`docs:check` 10 段链全绿（integrity 251 md / links 250 md / structure 212 页 / config-links 160 条 / i18n-parity 59 对（中英版本策略页 H2 4:4）/ version（5 展示面派生自 0.3.0，无手写版本字面量）/ interpolation 212 md / showcase 13 项 / line-count / i18n）；`lint:md:check` 通过；`docs:build` exit 0。
- **V 阶段显式跳过**：本批为发布后校验 + 静态文档（版本策略页 / README / roadmap / backlog），无组件 / 样式 / 交互面；页面渲染由 `docs:check` + `docs:build` 覆盖。

## 7. Review Gate

**第 1 轮（`audit-depth: standard`；时间盒 ≤ 10 分钟；理由：含发布后校验证据链与对外契约声明（冻结窗口），需定向核验证据可复算性与中英一致性；无运行时 / 依赖变更）：`Reject`（2 blocker / 3 warning / 3 suggest）**，实测约 **7 分钟**（宿主时钟 `2026-09-24T19:13:29+08:00` 起，未超时间盒）。审计方独立复算发布面（`npm pack` shasum / 88 vs 89 导出差集 / tag / CHANGELOG）、`docs:check` 计数与 `git diff` 规模，并逐条核验 8 个检查点。

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| RG-B01 | blocker | §6 质量门计数为**本记录入库前**旧快照（integrity 250 / links 249 / structure 211 / interpolation 211），交付态实测为 **251 / 250 / 212 / 212** | **已同批修正**：§6 刷新为交付态实测值并注明「含本记录自身入库」 |
| RG-B02 | blocker | §2 复算命令缺 pathspec，`git diff 75c5610 --numstat` 实输出 9 行 / +149 −7，与声明的「6 文件 / +52 −6」不符 | **已同批修正**：补显式 pathspec 并给出逐文件输出（合计 +52 −6） |
| RG-W01 | warning | 冻结面列 locale「键集合」冻结，但非冻结面未豁免「新增键」→ 与实际持续加键（M1-2 / M2-1）冲突 | **已同批修正**：改为「既有键名称与语义冻结；新增键属向后兼容增量，删除 / 重命名属破坏」（中英同步） |
| RG-W02 | warning | 冻结的子路径导出列 4 键，却以「`package.json` 的 `exports`」为权威来源（实为 5 键，含 `./package.json`） | **已同批修正**：补齐 `./package.json` 约定入口并显式说明为 5 键（中英同步） |
| RG-W03 | warning | §5 引用 dependfix §12 条件 3 时丢失原文阈值 `≥ 0.2.0`（降级转述） | **已同批修正**：§5 改为逐字引用原文阈值，并说明页面因 `hardcoded-version` 守卫作去数字转述（阈值以记录为准） |
| RG-S01 | suggest | `README.en-US.md` 未同步 `README.md` 的 0.3.0 能力摘要 | **已同批采纳**：安装说明补 0.3.0 能力摘要（单行） |
| RG-S02 | suggest | §5 引用外部仓文件未给可核对路径 | **已同批采纳**：补 dependfix 仓库相对路径 |
| RG-S03 | suggest | 页面用 `0.3.x` 表述起点，可注明 `x` 随站点版本派生 | **已同批采纳**：起点括注「`x` 随站点版本派生，非手写」（中英同步） |

审计方另记 1 条**未覆盖边界**：未逐项比对「组件公开 props / events / slots 名称与语义」冻结面是否覆盖全部既有组件（需全量 API 清单比对，超出 `standard` 时间盒）——列为后续可选深核项，见 §8。

**第 2 轮（复审，只审修复点；`audit-depth: standard`；时间盒 ≤ 10 分钟）：`Pass`（0 blocker / 0 warning / 1 suggest）**，实测约 **2 分钟**（宿主时钟 `2026-09-24T19:22:37+08:00` 起，未超时间盒）。8 条 finding 全部判定闭合，审计方独立复算 §2 pathspec（6 文件 / +52 −6）、§6 四计数（251 / 250 / 212 / 212）、`exports` 5 键、页面无三段式版本字面量、中英冻结口径一致与 `todo.md` 未越权归档。R2 另附 1 条非阻塞 suggest（§5 摘要句的 locale 口径未带「既有」限定），**已同批采纳**（记为「已修复未复审」）。

## 8. 结论与残留项

M3-2 已收口：0.3.0 已发布（registry tarball shasum 与发布日志一致、内容与四项子路径冒烟 + Vite 消费方构建通过、`npm view` = 0.3.0），版本 / CHANGELOG / annotated tag 一致（2 项偏差已登记），发布后文档已同步。M3-3 已交付：0.x API 冻结窗口声明落中英版本策略页并与 dependfix §12 条件 3 对齐。**Phase 13 全部原子条目（11 条）交付完毕**。Review Gate：R1 `Reject`（2 blocker / 3 warning / 3 suggest）→ 8 条 finding 修正 → R2 复审 **`Pass`（0 blocker）**；R2 另 1 条非阻塞 suggest 已同批采纳（记为「已修复未复审」）。

**残留项**：

- 阶段收口与归档（`todo.md` 清空 + `todo-archive.md` 归档块 + 治理记录回扫）**待执行**（需用户指令）。
- tag 视图不含 0.3.0 CHANGELOG 段、版本提交信息形态、CHANGELOG 空 `# Unreleased` 段——已登记偏差 / Backlog，不重写已发布产物。
- 测试并发时序 flaky 已登记 Backlog 出现记录 ④（按「多次出现再处理」跟踪）。
- 冻结面「组件公开 props / events / slots」是否覆盖全部既有组件的**全量 API 清单比对**未做（Review Gate 未覆盖边界，超出 `standard` 时间盒）；如需可另立专项。
