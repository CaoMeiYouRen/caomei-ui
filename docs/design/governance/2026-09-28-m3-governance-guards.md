# M3 治理装置留痕与守卫补口交付与验证记录（Phase 16）

> 创建时间：2026-09-28
> 条目：Phase 16 **M3-1 ~ M3-6**（M3-7 见[单独记录](./2026-09-28-m3-7-cross-root-link-guard.md)）
> 依据：[下一阶段范围评估 §8](./2026-09-28-next-stage-scope-evaluation.md) 的 **D6**（`artifacts` 维持本地 + 修 README）、**D7**（Review Gate 落盘取**阻断**）、**D12**（授权改 `AGENTS.md` §11）；用户 2026-09-28 就 M3-3 追加裁定「**修历史指针、守卫零豁免**」。
> 快照：本仓 `146286a`（M2 交付后）。本记录为 M3-1 ~ M3-6 的唯一交付口径。

---

## 1. 范围

| 条目 | 动作 | 交付形态 |
| :--- | :--- | :--- |
| **M3-1** | `artifacts/review-gate/README.md` 口径修正 | **本地态**（目录被 gitignore，不入库） |
| **M3-2** | Review Gate 落盘**阻断**守卫 | 新增 `check-review-gate-artifacts.mjs` + 15 tests + `pre-commit` 接线 |
| **M3-3** | 治理记录指针机检盲区扩展 | `check-governance-records` 扩展 + 6 tests + 18 处历史指针改指 |
| **M3-4** | 文档站示例引用存在性守卫 | 新增 `check-example-refs.mjs` + 14 tests + `docs:check` 接线 |
| **M3-5** | `AGENTS.md` §11 补 `recurring.md` 指针 | 1 行改动（D12 授权） |
| **M3-6** | 文档站示例可访问名补强 | `docs/examples/input/basic.vue`（中英）补 `label` |

- **规模分摊**：按 M3-1 ~ M3-6 六条原子条目分摊——M3-1 1（本地态，不入库）/ M3-2 3（脚本 + 测试 + `pre-commit`）/ M3-3 4 受控文件（守卫 + 测试 + `todo-archive.md` + `index.md`）/ M3-4 4（脚本 + 测试 + `package.json` + 文档）/ M3-5 1 / M3-6 2。
- **M3-3 的 18 处历史指针回扫（超单条目文件预算的正当理由）**：这 18 处历史指针（分布于 18 个记录）是**同一机检驱动的跨记录一致性动作**——守卫扩展后它们同时成为失效指针，若拆成多个提交，中间提交将无法通过 `verify` / `governance:check`（`check-governance-records` 接入该常驻链）；故须**一次性**改指。回扫面属「跨记录一致性修正」，从条目文件预算中显式剥离，其依据 = 用户 2026-09-28 裁定「修历史指针、守卫零豁免」（[评估记录 §8](./2026-09-28-next-stage-scope-evaluation.md)）+ 守卫不得在中间态失败。除回扫面外，M3-3 的受控文件为 4 个（≤ 10）。

## 2. M3-1 `artifacts` README 口径修正（本地态）

- **问题**：README 原称记录「归档后的记录随仓库永久保留，**不受 `.gitignore` 排除**」，与实况矛盾（`.gitignore:45:/artifacts` 命中，`git ls-files artifacts` = 0）。
- **修正**（`artifacts/review-gate/README.md`，**本地文件、不入库**）：
  - 文首补「留痕形态（2026-09-28 修正）」段：显式声明**本地留存、不入库**，并给出**跨机器获取方式**（手工拷贝目录，或改看已入库的 `docs/design/governance/**` 结论段与 `.session/`）。
  - §5 触发时机 / 自动化建议：去掉「CI 阶段收口前作为门禁输入」的误导，改为本地 `pre-commit` 阻断（§7）。
  - §7 与 `verify` 的关系：明确**不接入 `verify` / CI**（CI 无目录会必然误报）。
  - §8 维护约定：把不实表述改为「仅本地留存、不入库 + 跨机器获取方式」。
  - §9 版本历史：新增 1.1.0 行。
- **验收**：README 口径与 `.gitignore` 实况一致；因文件在 gitignore 内，`docs:check` 不受影响（全绿见 §8）。
- **可追溯**：本记录引用修正后的关键表述；原始文件不入库，跨机器复核以本记录 + `.gitignore` 为准。

## 3. M3-2 Review Gate 落盘**阻断**守卫

- **形态设计（D7 要求「本地可运行、CI 不误报」，实现形态在本条论证）**：
  - 新增 `scripts/governance/check-review-gate-artifacts.mjs`：受检范围默认取 `git diff --cached --name-only --diff-filter=ACMR`（暂存文件）；**阻断规则** = 本批次必须存在 mtime 不早于受检范围最新文件的 `artifacts/review-gate/*.md` 工件（工件应在代码冻结、审计完成后写入）。
  - **跳过条件**（exit 0 并打印原因）：`CI` 环境变量存在；工件目录不存在（CI 洁净检出）；受检范围为空。→ 保证 CI 不误报。
  - **接线强度**：接入 husky `pre-commit`（`.husky/pre-commit`，位于 lint-staged 之前）+ `package.json` 的 `check:review-gate`；**不接入** `verify` / `governance:check`（本地态 + 时序：工件在审计后写入，`verify` 常在审计前跑）。
  - 为什么用「新鲜度」而非「内容匹配」：内容匹配依赖工件文本列举文件路径的写法，易假阴/假阳；新鲜度是确定性判据，且能拦住「改了代码却没刷新工件」。
- **证据**：
  - 单测 `check-review-gate-artifacts.test.mjs` **15 tests**（`parseArgs` / 跳过条件 / 新鲜度正反例 / 范围文件缺失 / CLI 退出码 / CI 跳过）。
  - **负向对照（真实仓库）**：`node scripts/governance/check-review-gate-artifacts.mjs --scope src/components/tag/tag.vue` → **exit 1**（「40 份记录的 mtime 均早于受检范围最新文件」）；`CI=1` 同命令 → **exit 0**（跳过）。
  - **正向**：写本批工件后同命令 → exit 0（见 §8 实测）。
- **边界**：不校验工件内容质量（由 `@code-reviewer` 负责）；纯删除批次（`--diff-filter=ACMR` 排除 D）范围为空 → 跳过。

## 4. M3-3 治理记录规划指针机检盲区扩展

- **盲区**：原守卫只审**链接文字**中的规划标识；「**载体名 + 闭合符后紧邻编号**」形态（即链接文字为「待办事项」一类载体名，而编号写在闭合符之后、同一行紧邻处）不命中。
- **实现**（`scripts/governance/check-governance-records.mjs`）：
  - 新增 `collectTrailingIdentifiers(content, linkEndOffset)`：取链接 `)` 之后**同一行**、仅允许分隔符（空白 / 括号 / 常见标点）相隔的规划标识；散文（非紧邻）与下一行不提取。
  - `collectPlanningPointerIssues` 把「链接文字标识」与「紧邻标识」合并去重后一并核验。
- **历史指针处置（用户 2026-09-28 裁定「修历史指针、守卫零豁免」）**：把 Phase 9~14 的 **18 处**同类指针（`M5`×5 / `M6`×1 / `M6-8`×4 / `Phase 11`×1 / `Phase 12`×7）由 `todo.md` 改指 `todo-archive.md`（含评审 suggest 扩展分隔符集后新暴露的 `2026-09-22-docs-versioning-reevaluation.md` 表格单元格 1 处）；同步在 `todo-archive.md` 的三个归档块「回扫口径」段追加**现行口径**（保留历史声明 + 标注边界关闭）。
- **证据**：
  - 单测 **30 tests**（原 24 + 6：紧邻标识提取正反例 / 表格与加粗分隔符 / 紧邻形态失效 / 改指后零问题 / 与链接文字标识并检）。
  - **负向对照**：注入 `docs/design/governance/__neg-pointer.md`（内容为「载体名链接 + 紧邻 `Phase 10`」形态）→ `pnpm check:governance-records` **exit 1**（`stale-planning-pointer`）；删除后 exit 0。
  - 全库复跑（**M3-3 落地时点，未含本记录**）：**80 记录与索引一致 / 265 md 指针无失效**。

## 5. M3-4 文档站示例引用存在性守卫

- **实现**：新增 `scripts/docs/check-example-refs.mjs`——扫描 `docs/**/*.md`，校验每个 `<demo vue="<相对路径>" />` 引用的文件存在；**围栏代码块与行内代码内的 `<demo>` 视为语法描述、不参与检查**；受检面设 md 文件数 / 示例引用数下界与中英组件页前缀覆盖断言（`scan-scope-narrowed`）。
- **接线**：`package.json` 新增 `docs:check:example-refs`，接入 `docs:check` 链（10 → **11 段**）；文档 `docs/design/documentation-site.md` §13 补守卫说明。
- **证据**：
  - 单测 `check-example-refs.test.mjs` **14 tests**（单行 / 多行 / 围栏与行内代码豁免与行号不偏移 / 无 `vue` 属性 / 缺失 / 英文镜像缺失 / 三项收窄断言 / 仓库现状）。
  - **负向对照**：注入 `docs/__neg-example.md`（`<demo vue="../examples/nope.vue" />`）→ `pnpm docs:check:example-refs` **exit 1**；删除后 exit 0（**227 md / 378 处引用均存在**，为 M3-4 落地时点、未含本记录）。

## 6. M3-5 `AGENTS.md` §11 补 `recurring.md` 指针

- **改动**：§11「规划」行补 `[长期任务](./docs/plan/recurring.md)`（仅此一处，D12 授权）。
- **证据**：`pnpm ai:check` / `governance:check` 全绿（见 §8）。

## 7. M3-6 文档站示例可访问名补强

- **改动**：`docs/examples/input/basic.vue`（中英）为 `CaomeiInput` 补 `label`（映射 `aria-label`）——zh `内容` / en `Content`，使示例不再仅以 `placeholder` 提供可访问名。
- **证据**：`pnpm typecheck:docs` / `docs:check` 全绿（见 §8）。

## 8. 质量门

- `pnpm verify` **exit 0**（终态复跑 2026-09-28T22:07:14 → 22:10:45，覆盖 Review Gate 修复点）：`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test`（**91 文件 / 1885 tests**）/ `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿。
- `docs:check`（**11 段**，含新接入的 `example-refs`）：integrity 267 md / links 266 md / structure 228 页 + 侧栏 6 组 47 条目 / parity 59 对 / interpolation 228 md / **example-refs 228 md / 378 处引用均存在**。
- `check:governance-records`：**81 记录与索引一致 / 266 md 指针无失效**；`check:planning-numbers`：**0 处命中 / 739 受检文件**。
- `check:review-gate`：本批工件写入后 **exit 0**（受检 33 文件 / 新鲜工件 1 份）；负向对照见 §3（真实仓库 stale → exit 1；`CI=1` → 跳过）。
- `pnpm ai:check`：OK（`AGENTS.md` §11 指针改动，见 §6）。

## 9. Review Gate 记录

- **R1（并发分区，`standard`，时间盒 ≤ 10 分钟）**：分区 A（守卫实现）**Pass**（0 blocker / 2 warning / 4 suggest）；分区 B（治理与规划载体）**Reject**（1 blocker：§1 规模分摊声明与 M3-3 实际触及文件数不符；1 warning：`todo.md` M3-7 行状态陈旧；1 suggest）。汇总取最严 → 整体 **Reject**。
- **R2（复审，`standard`，只审修复点）**：**Reject**（1 blocker：§1 表 M3-2 / M3-4 测试计数为修复前快照 14 / 13，与 §3 / §5 / `index.md` 及实际测试不符；2 follow-up：措辞）。
- **R3（复审，`quick`，只审修复点）**：**Reject**（1 blocker：**暂存区卫生**——索引版 §1 仍为旧快照，因改后未 `git add`；内容已核验正确）。
- **R4（复审，`standard`，§3.4 显式新增预算 +1 轮，只审修复点）**：**Pass**（0 blocker / 1 warning / 2 suggest）。warning = `ai-collaboration.md` §9 新条未标「Review Gate 必查」→ **已同批修正**（加标记）；suggest = 回填本 §9（本条）+ 补 `artifacts/review-gate/` 工件（见下）。
- **R1 修复点（同批修正，记「已修复未复审」）**：§1 逐条实际文件数 + 18 处回扫正当理由；`todo.md` M3-7 状态；`stripCode` 保留换行 + 行号断言；范围文件磁盘缺失判失败 + 断言；分隔符补 `|*_` + 断言（并修新暴露的第 18 处历史指针）；`NON_RECORD_FILES` 清理；§4 / §5 计数时点限定。
- **§3.5 约束载体**：R2 → R3 的「计数 / 暂存区卫生」复发，已增补 `docs/standards/ai-collaboration.md` §9「复审 / 提交前的暂存区卫生」（标 **Review Gate 必查**）。
- **实测用时（调用方回填）**：R1 发起 `21:58:48`（两分区并发）——**未在返回时点单独取戳**（口径偏差），以修复开始前取戳 `22:11:04` 为上界（≤ 13 分 16 秒，含调用方阅读 / 决策与修复），超 10 分钟时间盒，按 §3.3 仅作分级校准信号；R2 发起 `22:11:04` → R3 发起 `22:17:08`（≤ 6 分 04 秒，含修复）；R3 发起 `22:17:08` → R4 发起 `22:19:43`（≤ 2 分 35 秒，含修复）；R4 发起 `22:19:43` → 修复完成 `22:31:59`（≤ 12 分 16 秒上界，含调用方修复与规范增补）。除 R1 外均在上限内。
- **留痕**：R1 ~ R4 结论由调用方落盘 `artifacts/review-gate/2026-09-28-phase16-m3-governance-guards.md`（本地态、不入库）。

## 10. 边界与未覆盖

- M3-1 的交付物（`artifacts/review-gate/README.md`）**在 gitignore 内、不入库**，跨机器复核以本记录引用的关键表述与 `.gitignore` 实况为准。
- M3-2 守卫**不接入 `verify` / CI**（本地态 + 时序），其强度依赖 `pre-commit` 钩子；`--no-verify` 可绕过（项目规范禁止滥用）。
- M3-3 的「紧邻」判定只覆盖同一行、分隔符相隔的形态；跨行的散文指针仍属快照、不纳入（与既有边界一致）。
- M3-4 只校验 `vue` 属性目标存在性，不解析其它属性、不校验示例内部正确性。
