# 文档清理与基建治理批次（2026-10-21）

## 1. 范围与性质

用户指令「开始进行一轮文档清理和基建治理」，经盘点选定四项：提交钩子污染修复、门禁脚本测试补齐、`.session` 任务态压缩、规划载体清理。本批为**直接工作指令的治理批次**，未分配阶段编号、未登记 `todo.md` 当前阶段（依据[规划规范 §3 / §4](../../standards/planning.md)）。

盘点结论：工作区干净，`governance:check` / `lint:md` 全绿；故本批不以既有检查作为开工前基线，收尾按验证矩阵重跑。清理不改变任何已归档阶段的事实性内容，历史快照类记录不回改。

## 2. 提交钩子治理

**问题**：`lint-staged` 配置为 `npm run lint`（即 `eslint . --fix`）加裸 `git add`。提交时会对全仓执行修复，并把工作区中与本次提交无关的文件一并暂存（`todo-archive` 的交付记录已两次实证）。

**处置**：命令改为 `cross-env NODE_ENV=production eslint --fix`，由 `lint-staged` 追加暂存文件并自动重新暂存；移除裸 `git add`；`.husky/pre-commit` 的 `npx --no-install` 改为 `pnpm exec`；glob 补齐 `.mjs` / `.cjs`，与 `docs/standards/git.md` 同步。

**守卫**：新增 `test/contracts/lint-staged-config.test.ts`，结构化识别 eslint 的路径 / 目录 / glob 目标（含引号与取值 flag），并校验规范载体与配置 glob 一致。

## 3. 门禁脚本与测试

**问题**：`check-coverage` / `check-standards-redundant` / `check-line-count` 等门禁脚本缺少单测与受检面下界；`scripts/shared/cli.mjs` 声明了 `type: 'number'` 但从未生效，`--threshold=abc` 会得到 `NaN` 并使阈值比较恒为 false。

**处置**：`cli.mjs` 落地 number 类型并对空串 / 非数字 / `Infinity` fail-closed；`check-coverage` 增加 0~100 范围校验与错误出口；`check-standards-redundant` 与 `check-line-count` 增加受检面下界（`MIN_STANDARDS_FILES = 9` / `MIN_TARGETS = 9`），行数守卫失败改走友好错误出口。

**测试**：新增 4 个测试文件，覆盖阈值边界、全局 / 单项优先级、缺文件与缺 `total`、围栏 / 行内代码豁免、目录收窄、跨平台分隔符、`getCliArgs` 两种入参形态。负向对照均使对应用例变红，恢复后全绿。

## 4. 任务态压缩

**问题**：`current-task.yaml` 达 454 行 / 491,848 B，`progress.completed` 累积 9 月 12 日以来的逐条交付日志，单行最长 4,292 字符；与 todo-manager「任务态而非历史态」的定位不符（以上为本地写录时点快照，测量对象 = `.session/archive/current-task-2026-10-21.yaml`，该备份 gitignored）。

**处置**：备份至 `.session/archive/` 后压缩为当前态（`current-task.yaml` 2,859 B / `runtime-state.json` 1,731 B），交付摘要改指针到 `todo-archive` 与治理记录；移除历史 `next_steps` 与已关闭失败明细。`todo-manager` skill 增加「`completed` 不追加交付日志」「50KB / 32KB 体量阈值」约定。

## 5. 规划载体清理

- `todo.md`：删除 Phase 24 遗留的整段「非目标」——该段属已归档阶段的点时表述，且其中「本阶段不落地移动端 / 国际化」与后续 Phase 25 交付方向相反；按[规划规范 §7](../../standards/planning.md) 不得在 `todo.md` 残留。HEAD 句改为写录时点快照 + 实时复核口径。
- `backlog.md`：删除四处「已纳入阶段」过渡注记与 §1.3 历史说明（Phase 24 / 25 均已归档）；`§1.3` 仅保留「本组暂无在册候选」。
- `roadmap.md`：§1 压缩为当前状态句 + 能力 / 版本单一事实源指针；阶段表删除全空「时间」列；删除逐阶段授权留痕长段、历史交付摘要与重复归档索引；§5 改为深度归档链接表；`latest` 版本句保留（`check-site-version` 已复核）。
- `planning.md`：回扫面措辞同步为「阶段表行 / §1 当前态句」，避免指向已不存在的结构。

## 6. 验证与 Review Gate

**质量门**：`pnpm lint:check` / `pnpm typecheck` / `pnpm test`（全量通过）/ `pnpm governance:check` / `pnpm lint:md:check` / `pnpm docs:build` 均通过。

**Review Gate**：

- R1 `deep`（≤20 分钟，实测 ≤13 分钟）：**Pass**，0 blocker / 3 warning / 9 suggest。
- R2 `standard`（≤10 分钟）：**Pass**，R1 的 3 项 warning 全关闭；新增 2 warning（标题与守卫格式冲突、规范载体 glob 漂移）。
- R3 `quick`（≤5 分钟）：**Pass**，0 blocker / 0 warning；R2 的 2 warning 与 4 suggest 全部关闭；R3 另有 2 条非阻塞 suggest（`main()` 失败分支用例、§1 术语统一），后者已同批处理。
- 记录载体复审：R4 `quick` **Pass**（0 blocker / 3 warning / 4 suggest）→ 修复索引与记录的读数复述、受检面表述与点时口径 → R5 `quick` **Pass**（7 项修复点全关闭）。

提交切分：`78330c9`（钩子）、`97c8664`（门禁测试）、`21b1308`（任务态约定）、`40231c9`（规划载体）。未推送。

## 7. 未覆盖边界与后续

- 未在 Windows 原生环境实跑；新增断言已用 POSIX 字面量与 `tmpdir()` 规避分隔符差异。
- 未执行真实 `git commit` 端到端演练；由本次提交的 pre-commit 实际执行。
- `check-line-count.main()` 失败分支暂无自动化用例（R3 suggest，转后续触碰该脚本时补齐）。
- `todo.md` 两条 Phase 24 遗留的触发时点（2026-10-16 / 2026-10-19）已到，但本批未执行复核；仍按用户 2026-10-16 授权保留，待外部触发后单独处置。
