# 待办归档（深度归档）：Phase 25

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 25：归档载体收口、移动端与响应式优化、国际化深化（一期）、发布收口

- 时间：2026-10-16 用户就[下一阶段范围评估（第九轮）](../../design/governance/2026-10-16-next-stage-scope-evaluation-9.md) §5 裁定「按推荐来」后登记；2026-10-21 交付 **4 条主线 / 8 条原子条目**并完成阶段归档（用户指令「更新 M4-1 状态，然后开始归档」）。
- 范围与授权（用户决策 2026-10-16）：取**主线 A + B + C**（归档与规划载体收口 / 移动端与响应式优化 / 国际化深化一期）并合入 **D4** 发布收口 → **4 条主线 / 8 条原子条目**（M1 1 / M2 3 / M3 3 / M4 1；构成对账 1 + 3 + 3 + 1 = 8）。**条目构成变更**：M3-1 于同日经用户裁定拆为 **M3-1a（包形态）/ M3-1b（5 语落地）**（原登记 2 条为时点值），依据见[locale 分包方案设计](../../design/governance/2026-10-16-phase25-m3-1-package-split-design.md) 与[登记记录 §7](../../design/governance/2026-10-16-phase25-registration.md)。**D5** `Form` / `FormItem` 与 **D6** 长尾组件维持候选；**D7** 国际化一期与移动端同批执行。范围与验收口径的单一事实源见[Phase 25 登记批次记录](../../design/governance/2026-10-16-phase25-registration.md) §1 / §2。
- 非目标：不推送提交（发布条目的推送以用户明确指令为前提）；不启用定时自动发布、不放开 `release.yml` publish、不进入 1.x；不纳入 `Form` / `FormItem`（维持候选、先出专项评估）与长尾组件；不做破坏性 API 变更、不改组件公共 API；不引入 Tailwind / UnoCSS；RTL 与二期语言集维持登记；不引入高误报守卫（新增守卫须带负向对照与受检面下界）；不压缩历史快照类记录；`reka-ui` / `conventional-changelog` 维持条件触发。

### M1 归档与规划载体收口（1 条）

- **M1-1 归档载体深度归档与行数口径收口**（提交 `746b75e`；记录见 [M1-1](../../design/governance/2026-10-16-phase25-m1-1-todo-archive-deep-migration.md)）：Phase 18 完整块机械迁入新增深度归档 [phase-18.md](../archive/phase-18.md)，主窗口 **404 → 342 行**（`docs:check:line-count` 判 ok）；迁出段与原文 `diff` 零差异（**14 处**链接目标改写为唯一改动面）；主窗口口径句与 `archive/index.md` 同步；指针回扫三段式留痕。RG `standard` R1 `Pass` → R2 delta `quick` `Pass`。

### M2 移动端与响应式优化（3 条）

- **M2-1 移动端形态口径收敛 + 视口矩阵扩面**（提交 `0b4849c`；记录见 [M2-1](../../design/governance/2026-10-16-phase25-m2-1-viewport-matrix-expansion.md)）：新增 **320px + 900px** 两个定向档（原 390 / 768 / 1280 三档保持全量），`gap-900` 档暴露的 ButtonGroup 空档实现补齐到 ≤1024px；矩阵口径写入[响应式设计](../../design/responsive.md) 单一事实源，受检面下界与「矩阵档口径」运行时对账用例同批落地；同时修复 769–1023px 空档。RG `standard` R1 `Pass`（warning / suggest 已收口）。
- **M2-2 触摸目标复核**（提交 `8661ae5`；记录见 [M2-2](../../design/governance/2026-10-16-phase25-m2-2-touch-target-audit.md)）：按用户裁定**只出实测清单与提升建议**、不改样式；逐组件实测 320 / 900 档命中区并留痕，结论落[响应式设计](../../design/responsive.md) 与 Backlog；RG `standard` R1 `Reject`（1 blocker：≥44 集合由 token 推断而非读数）→ 修正 → R2 `Pass`。
- **M2-3 移动端使用指南页**（提交 `67f0522`；记录见 [M2-3](../../design/governance/2026-10-16-phase25-m2-3-mobile-guide.md)）：新增中英 `guide/mobile` 页并接入导航，覆盖响应式断点 / 触摸目标 / 视口适配口径；RG `standard` R1 `Pass` → R2 delta `quick` `Pass`。

### M3 国际化深化（一期）（3 条）

- **M3-1a locale 按语言子路径导出（包形态）**（提交 `1eb562b` / `8206b01` / `d9949f3` / `1191eab` / `9435c9c`；记录见 [M3-1a](../../design/governance/2026-10-16-phase25-m3-1a-locale-subpath-exports.md)）：注册表预注册收敛为 `zh-CN` + `en-US`，`zh-TW` / `ja-JP` / `ko-KR` 下沉子路径 + `registerLocale()`；`exports` / resolver / Nuxt 模块 / `check:build` 五条不变量同步；体积实测 provider 消费方 **−56% min / −44% gzip**、非 provider 零变化；中英 `locale.md` 增「按需引入」章节与示例。按交付面拆 4 批提交，RG 逐批放行（② 分区 1 Reject 1 blocker → 收口后 Pass；③b R1/R2 Reject → 收口后放行），全文见记录 §8。
- **M3-1b 一期 5 语落地**（提交 `8a6ddf9`（代码）/ `eca0ec8`（文档）；记录见 [M3-1b](../../design/governance/2026-10-20-phase25-m3-1b-five-locales.md)）：新增 `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR` 五套文案（28 命名空间 / 80 条）；`CaomeiLocale` 扩为 10 语；`tsdown` + `exports` 增 5 条子路径（按需合计 8 条）；ECharts 映射补 5 语（`pt-BR → PT-br`）与 RTE 映射补 5 语（`ru-RU → ru`）；`check-locale-keys` 下界提升为 10 语 / 8 子路径；中英文档同步。RG 代码 R1 `standard` `Pass` + R2 delta `Pass`；文档面另经 `quick` `Reject`（RTE 依赖段仍写 3 语）→ delta `Pass`。
- **M3-2 locale 台账、守卫与子路径导出对齐**（提交 `aaf5f7d`；记录见 [M3-2](../../design/governance/2026-10-20-phase25-m3-2-locale-ledger-alignment.md)）：`check-locale-ledger` 由「中英台账 ↔ `types.ts`」扩为三维——另对账中英文档的「预注册 / 按需引入」语言表与子路径表 ↔ `CaomeiLocale` + `PRE_REGISTERED_LOCALES`；新增命名空间 / 预注册 / 按需 / 子路径四项受检面下界与 **19 例**正反面对照；同批消除 `development.md` / `experience-archive.md` 的「5 语 / 台账无机检」旧口径。RG R1 `standard` `Reject`（1 blocker：活载体旧口径）→ R2 delta `Reject`（1 blocker：12/19 例计数漂移）→ R3 delta `Pass`。

### M4 发布收口（1 条）

- **M4-1 推送 + 发布 0.7.0 + 发布后校验与版本句同步**（提交 `c496f61`（版本）/ `8766f86`（CHANGELOG）/ `183a917`（README）；发布工具修复 `a0e91f5`；记录见 [M4-1](../../design/governance/2026-10-21-phase25-m4-1-release-execution.md)）：registry `latest` = **0.7.0**（2026-10-20T12:29:13Z），tarball sha1 `5b59e41…` 与 `dist.shasum` 一致、`fileCount` 427、exports 13 键；GitHub Release `v0.7.0` 于 2026-10-20T12:38:47Z 发布；`origin/master` = `a0e91f5` = 工作区 HEAD（本地领先 0）。**BREAKING CHANGES 补正**：0.7.0 初始 CHANGELOG / GitHub Release 缺语言包按需化段，已于 2026-10-21 在 CHANGELOG 与 GitHub Release 说明补齐（不改 tag、不发新版本）。**下游兼容**：run `39423865750` 在安装刚发布的 0.7.0 时被下游 pnpm 11 `minimumReleaseAge` 拒绝，未进入 `typecheck` / `build`，非兼容性回归；已由 `a0e91f5` 在 workflow 覆盖步骤以 `--config.minimumReleaseAge=0` 修复，待下一次 tag 触发复验。RG R1 `standard` `Reject` → R2 delta `Pass`（M4-1 发布事实无 blocker；blocker / warning 均为归档载体计数与 wisdom 指针，已闭合并回填），结论见[记录 §5](../../design/governance/2026-10-21-phase25-m4-1-release-execution.md)。

### 阶段总结

- **4 条主线 / 8 条原子条目全部交付**：归档载体回落到 `docs:check:line-count` 阈值内；移动端形态 / 视口矩阵 / 触摸目标 / 使用指南页收口；locale 包形态 + 一期 5 语 + 台账守卫三维对齐；0.7.0 发布并完成发布后校验、GitHub Release 与 BREAKING CHANGES 补正。
- **发布**：registry `latest` = **0.7.0**；远端 `v0.1.0` ~ `v0.7.0` 共 7 个 annotated tag；GitHub Release 已回填 `v0.1.0` ~ `v0.7.0`。
- **新增 / 强化装置**：locale 子路径五条产物不变量、`check-locale-keys` 10 语 / 8 子路径下界、`check-locale-ledger` 三维对账 + 19 例正反面对照、移动端矩阵档运行时对账用例。

### 回扫口径（三段式）

- **机检面**：`pnpm check:governance-records`（归档后 `todo.md` 的 Phase 25 条目移除，指向 `todo.md` 的编号指针由守卫复跑）；`pnpm docs:check` / `pnpm check:governance-counts` / `pnpm check:planning-numbers` 全绿。
- **人工面**：Phase 25 各治理记录对 `todo.md` 的引用均为内联码 / 记录内文形态，按 [规划规范 §9](../../standards/planning.md) 的「点时记录保持原样」处置；本轮逐条核对 M1-1 / M2-1 ~ M2-3 / M3-1a / M3-1b / M3-2 / M4-1 的回链。
- **未处理面**：沿用既有边界——历史记录内「阶段限定 + 复用编号」类散文指针不回改（见 [M3-5 记录](../../design/governance/2026-10-15-phase24-m3-5-planning-carrier-discrepancy-cleanup.md)）。

### 长期任务

- 第 27 轮门槛复核（2026-10-21，**Phase 25 收口 / 0.7.0 发布后门槛复核轮**）：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 **5 项维持**。取证：`useLabelAttrs` 15 / `labelAttrs` **11**（+1 = `chart.vue`）/ 模板级 `:aria-label="label"` 0 / 继承公共契约 12 / 含内联同名字段 **35**（+3 = `chart` / `menu` / `tooltip` 的 `types.ts`）/ `useFocusControl` 4 / `useAttrs()` **13**（+2 = `alert.vue` / `chart.vue`）；§2.2 复跑四组件共有 shell 声明 **0**；`capture:styles` **313 项** 0 差异（308 → 313，Phase 24 新组件 / 形态纳入，属预期变更）。**漂移归因**：+1 / +3 / +2 均来自 Phase 24 新增的非字段组件（Chart / Menu / Tooltip / Alert），不改变「表单控件公共 props 契约」条件触发结论；详见 [长期任务](../recurring.md) 第 27 轮。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **14 条活跃（< 阈值 20，不蒸馏）**；`pnpm check:distill-archive` → **13 段归档对账通过**。

### 归档批次 Review Gate

经 `@code-reviewer` Review Gate **单分区 `standard` R1 `Reject` → R2 delta `quick` `Pass`**；结论与 findings 见[归档批次记录](../../design/governance/2026-10-21-phase25-archive.md) §5。

