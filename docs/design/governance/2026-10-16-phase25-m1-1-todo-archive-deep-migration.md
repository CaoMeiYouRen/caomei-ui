# Phase 25 M1-1：归档载体深度归档（Phase 18 迁深度归档）

> 阶段 / 条目：Phase 25 M1-1（归档与规划载体收口——归档载体深度归档与行数口径收口）。
> 验收口径依据：[Phase 25 登记批次记录](./2026-10-16-phase25-registration.md) §2；压缩次序依据 [规划规范 §7](../../standards/planning.md)（机械迁出 → `diff` 核对 → 修机检指针 → 枚举人工面 + 声明未处理面 → 回填口径句 / 索引 / `roadmap §5`）。
> 关联：[todo-archive.md 主窗口口径](../../plan/todo-archive.md)、[深度归档索引](../../plan/archive/index.md)、新深度归档文件 [phase-18.md](../../plan/archive/phase-18.md)。

## 1. 背景与触发

`docs/plan/todo-archive.md` 为**只增不减**的归档载体，由 `docs:check:line-count` 按「主窗口只保留近线阶段窗口与归档索引」监控（warn > 400 / error > 600）。

- 2026-09-30 首次压缩（Phase 0 ~ Phase 12 迁深度归档）后回落；
- 2026-10-13 二次压缩（Phase 13 ~ Phase 17 迁深度归档）后回落；
- 2026-10-16 Phase 24 部分归档入主窗口后**再次越过 warn 阈值**（复算命令 `wc -l docs/plan/todo-archive.md`，时点读数见 §4），主窗口含 **Phase 18 ~ Phase 23 共 6 块**完整块 + Phase 24 部分归档块，**多于「近线窗口 = 最近 5 个已完成阶段」**（Phase 24 为部分归档、阶段未收口，不计入窗口计数）。

故按主窗口口径句既有触发规则（**超过 warn 阈值即迁最早块**）执行**三次压缩**：把最早的 **Phase 18** 块迁入深度归档。

## 2. 迁移口径

- **近线窗口（迁移后）= Phase 19 ~ Phase 23**（5 块 = 最近 5 个已完成阶段）。
- **迁出范围 = Phase 18**（1 个完整归档块），迁入新深度归档文件 [`phase-18.md`](../../plan/archive/phase-18.md)。
- **文件粒度 = 每次压缩批次一个文件**（沿用 `phase-00-06` / `phase-07-12` / `phase-13-17` 的既有形态：不复用、不改名既有文件，故 `phase-13-17.md` 维持原名）。
- **时间序不变**：主窗口保留块（Phase 19 ~ Phase 23）时间序不动；`archive/index.md` 文件表按同序 +1 行。
- **归档块事实零改写**：迁移为**机械操作**，正文一字不改，仅调整相对链接深度。

## 3. 迁移的机械调整（唯一改动面）

链接深度 `../` → `../../`（深度归档文件位于 `docs/plan/archive/`，比主窗口深一层）：

| 原形态（主窗口） | 新形态（深度归档） | 处数 |
|:---|:---|:---|
| `](../design/...` | `](../../design/...)` | 9 |
| `](../standards/...` | `](../../standards/...)` | 3 |
| `](./backlog.md`) | `](../backlog.md`) | 1 |
| `](./recurring.md`) | `](../recurring.md`) | 1 |

合计 **14 处**链接目标改写（复算命令：对迁出段与迁入段各取 `grep -o ']([^)]*)' | sort | uniq -c` 逐项比对），是本次迁移的**唯一**改动面；正文其余内容（含各条目交付、提交号、质量门数值、Review Gate 结论、遗留与后续候选、点时快照）**逐字保留**。

## 4. 结果与可追溯性

- **主窗口行数**：404 → **348 行**（`wc -l docs/plan/todo-archive.md`；迁移前读数的复算命令 = `git show 654c8c2:docs/plan/todo-archive.md | wc -l`）；同一文件的 `docs:check:line-count` 口径为 405 → **349 行**（该脚本按 `split(/\r?\n/)` 计数，含尾换行后的空元素），判 **ok**，脱离 warn 区间。
- **迁出块规模**：56 行正文 + 7 行文件头 = 深度归档文件 63 行（`wc -l`）。
- **零改写实证**：以迁移前基线 `git show 654c8c2:docs/plan/todo-archive.md` 取原 Phase 18 段（49 ~ 104 行），按 §3 四条映射 `sed` 替换后与 `phase-18.md` 正文（`tail -n +8`）`diff` → **零差异**。
- **主窗口改动形态**（复算命令 ① `git diff --cached --numstat -- docs/plan/todo-archive.md` → **`3 59`**；② `git diff --cached -U0 -- docs/plan/todo-archive.md | grep '^@@'` → 三处 hunk `@@ -5 +5 @@` / `@@ -21 +21 @@` / `@@ -46,57 +46 @@`）：**删除面 59 = 口径句改写 1 + 索引标题改写 1 + 迁出段 57**；**新增面 3 = 口径句 / 索引标题 / 归档索引表行各 1**（逐项相加与命令输出一致）。**迁出段行数口径**：脚本删除的行区间 = 原 **49 ~ 105 行**（56 行块 + 其后空行 = 57 行）；`git diff` 的最小编辑差分可把**内容等价的前导分隔行**（原 46 ~ 48 行 = 空行 / `---` / 空行）归入同一 hunk，故**行号归属不唯一，以删除行数 57 为准**。**「除三处口径载体外主窗口无其它行变动」的独立实证**（复算命令 ③）：`git show 654c8c2:docs/plan/todo-archive.md | sed -n '1,48p;106,999p' > /tmp/base-main.md` 后 `diff /tmp/base-main.md docs/plan/todo-archive.md | grep -c '^[<>]'` → **5**（= 口径句 2 行 / 索引标题 2 行 / 索引表新增行 1 行；即 3 增 2 删）。**迁出段本身为纯删除、正文零改写**（零改写主张由上条 `diff` 实证承担），主窗口其余改动仅限 §5 列举的口径载体。
- **可追溯**：① 主窗口口径句点名四个深度归档文件与各自收录范围；② [`archive/index.md`](../../plan/archive/index.md) 文件表 +1 行、「迁出时点」+1 条（本批行数 / 口径 / 迁出范围 / 批次载体指针）；③ 主窗口「归档索引」表 +1 行（Phase 18 → `./archive/phase-18.md`）；④ Phase 18 的权威记录仍是各条目治理记录（见[治理索引](./index.md)），深度归档只存正文。

## 5. 载体同步

- [`docs/plan/todo-archive.md`](../../plan/todo-archive.md)：文首**主窗口口径句**更新（近线窗口 = Phase 19 ~ Phase 23 共 5 块 = 最近 5 个已完成阶段；深度归档收录范围 + Phase 18；行数轨迹补本批）、「归档索引」标题改 **Phase 0 ~ Phase 18**、索引表 +1 行；Phase 18 块整体迁出。
- [`docs/plan/archive/index.md`](../../plan/archive/index.md)：文件表 +1 行（`phase-18.md`）、「迁出时点」+1 条（2026-10-16）。
- [`docs/plan/roadmap.md`](../../plan/roadmap.md) §5：深度归档范围由「Phase 0 ~ Phase 17」改为「**Phase 0 ~ Phase 18**」、主窗口保留起点由「Phase 18 起」改为「**Phase 19 起**」、压缩次数补三次。
- **Backlog 处置**：候选行「归档载体行数再评估」已在 Phase 25 登记批次随本条目迁出（[登记批次记录](./2026-10-16-phase25-registration.md) §4）；本条目**不再回填候选行**——压缩触发规则已写入主窗口口径句（活载体），属归档载体的**标准动作**而非待决策候选（同 Phase 23 M4-1 的处置口径）。

## 6. 质量门

本批为**纯文档 / 规划载体批次**（零 `src/**` 零 `test/**` 零 `.github/**` 零配置改动）：

- `node scripts/docs/check-line-count.mjs` exit 0（`todo-archive.md` 判 ok）；
- `node scripts/docs/check-links.mjs` exit 0；
- `pnpm docs:check` 全段 exit 0；`pnpm governance:check` exit 0；
- `pnpm verify` 常驻链 exit 0。
- **受检面前提**：`docs:check:integrity` 以 `git ls-files` 取受检面，故本批 2 个新 md（`phase-18.md` / 本记录）须 `git add` 后才纳入其覆盖——本批**按此口径取读数**（暂存后复跑，读数即终态 revision）。

## 7. 归档后回扫（三段式）

### ① 机检面

`node scripts/governance/check-governance-records.mjs` → **exit 0**（**无需改指**）：本批迁出后**无新增** `stale-planning-pointer`。理由：Phase 18 各条目的编号（`M1-1` / `M2-1` / `M3-1` 等）在保留块中同样存在，守卫按「**同一编号在不同阶段复用不另判**」的既有边界不判失效（见该守卫头注）。

### ② 人工面（机检盲区形态的逐条枚举）

口径两步（可复现）：

**第 1 步**——宽口径候选行（链接指向 `todo-archive.md` 且位于 `docs/plan/` 之外；**排除本记录自身**——其正文含指向 `todo-archive.md` 的链接，属自指行）：

```shell
rg -n '\[[^]]*\]\((\.\./)*plan/todo-archive\.md\)' docs -g '*.md' | grep -v '^docs/plan/' | grep -v 'phase25-m1-1-todo-archive-deep-migration'
```

**第 2 步**——与「**本批迁出块独有编号集**」取交集（独有集 = 在 `phase-18.md` 出现、且在 `todo-archive.md` 不再出现的编号形态）：

```shell
python3 - <<'PY'
import re,pathlib,subprocess
pat=re.compile(r'\b(?:M\d+(?:-\d+)?|B\d+|T\d+|R\d+|O\d+|W\d+|C\d{2}|N\d)\b')
deep=set(pat.findall(pathlib.Path('docs/plan/archive/phase-18.md').read_text()))
main=set(pat.findall(pathlib.Path('docs/plan/todo-archive.md').read_text()))
only=deep-main
print('独有编号集:', sorted(only))
out=subprocess.run(['rg','-n',r'\[[^]]*\]\((\.\./)*plan/todo-archive\.md\)','docs','-g','*.md'],capture_output=True,text=True).stdout.splitlines()
cand=[line for line in out if not line.startswith('docs/plan/') and 'phase25-m1-1-todo-archive-deep-migration' not in line]
hits=[line for line in cand if set(pat.findall(line)) & only]
print('宽口径候选行:', len(cand), '交集命中:', len(hits))
PY
```

实测结果（时点快照 2026-10-16）：

- 第 1 步宽口径 **138 行**；
- 独有编号集 = `C49 / C50 / C51 / N5 / T1 / T2 / T10`（7 个形态）；
- **与宽口径候选行的交集 = 0 处**——即**不存在**「指向 `todo-archive.md` 且携带本批迁出块独有编号」的指针，本子类**无需处置**。

> 同批另按「**阶段限定 + Phase 18**」子类（机检不覆盖，见 §③）枚举，命中 **9 处**，逐条列于 §③ 表内（分类与处置一致）。

### ③ 未处理面（显式声明，**不**等于「已全量回扫」）

- **「阶段限定 + 复用编号」形态**：链接闭合符后**紧邻**（≤ 4 个非 `)` 字符）出现 `Phase 18`，即形如 `[待办归档](../../plan/todo-archive.md) Phase 18 **M3-1**`。口径（可复现）：

  ```shell
  rg -n '\[[^]]*\]\((\.\./)*plan/todo-archive\.md\)' docs -g '*.md' | grep -v '^docs/plan/' | grep -v 'phase25-m1-1-todo-archive-deep-migration' | grep -E 'todo-archive\.md\)[^)]{0,4}\(?Phase 18'
  ```

  实测命中 **9 处**（时点快照 2026-10-16；**排除本记录自身的示例行**——本记录 §③ 正文含同形态示例串），全部为 Phase 18 各治理记录**表头的「关联条目」行**：

  | # | 位置 | 命中编号 | 处置 |
  |:-:|:---|:---|:---|
  | 1 | `docs/design/governance/2026-10-01-phase18-m1-3-release-0.5.0.md:4` | `M1-1` / `M1-2` / `M1-3` | **维持**（见下「处置口径」） |
  | 2 | `docs/design/governance/2026-10-01-phase18-m2-1-flaky-class.md:4` | `M2-1` | **维持** |
  | 3 | `docs/design/governance/2026-10-01-phase18-m2-2-capture-face-extension.md:4` | `M2-2` | **维持** |
  | 4 | `docs/design/governance/2026-10-01-phase18-m2-3-rich-text-editor-geometry.md:4` | `M2-3` | **维持** |
  | 5 | `docs/design/governance/2026-10-01-phase18-m2-4-design-catalog-guard.md:4` | `M2-4` | **维持** |
  | 6 | `docs/design/governance/2026-10-01-phase18-m2-5-overlay-device-discriminating-power.md:4` | `M2-5` | **维持** |
  | 7 | `docs/design/governance/2026-10-01-phase18-m3-1-design-consistency-evaluation.md:4` | `M3-1` | **维持** |
  | 8 | `docs/design/governance/2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md:4` | `M4-2` | **维持** |
  | 9 | `docs/design/governance/2026-10-01-phase18-m6-1-ledger-drift-disposal.md:4` | `M6-1` | **维持** |

  **处置口径（本批不改，沿用 Phase 23 M4-1 §7③ 的既有边界）**：① 主窗口「归档索引」表对 Phase 18 提供**带深度归档链接的逐阶段行摘要**（`[phase-18](./archive/phase-18.md)`），故此类指针**仍可达**（多一跳）；② 其指向的编号在 [phase-18.md](../../plan/archive/phase-18.md) 的 `## Phase 18` 段内**逐条存在**（本批逐条核验：上表 11 个编号形态 `M1-1` / `M1-2` / `M1-3` / `M2-1` ~ `M2-5` / `M3-1` / `M4-2` / `M6-1` 均在段内命中）；③ 逐条改指属**跨载体一致性排查**（9 份点时记录的表头改写），按 [AI 协作规范 §3.4](../../standards/ai-collaboration.md) 记 **follow-up**，不由本条目承载。
- **跨分隔符散文指针**：编号与链接之间有散文相隔者机检不覆盖；沿用既有边界，按[规划规范 §7](../../standards/planning.md) 属「登记动作的时点陈述」，**不回改、不登记为待办**。

## 8. Review Gate

**R1（`standard`，单分区）**：**`Pass`**（0 blocker / 2 warning / 2 suggest）。**实测用时 7 分 34 秒**（宿主计时：发起 `12:12:32`，返回后计时 `12:20:06`），未超 10 分钟时间盒。四条 findings **全部同批收口**：

- **RG-W01**（warning，首次）：本批两个新 md 未跟踪 ⇒ `docs:check:integrity`（以 `git ls-files` 取受检面）不覆盖。**处置**：`git add` 后取读数（读数即终态 revision），并在 §6 增「受检面前提」声明该边界。
- **RG-W02**（warning，首次）：§4 归因分解与实测不符（`git diff --numstat` 实测 = `3 59`）。**处置**：§4 改为钉命令的分段分解 + 「**行号归属不唯一、以删除行数 57 为准**」口径 + 独立实证命令（读数 5），见 §4 终版。
- **RG-S01**（suggest，首次）：§4 迁移前读数缺复算命令。**处置**：补 `git show 654c8c2:docs/plan/todo-archive.md | wc -l`。
- **RG-S02**（suggest，首次）：主窗口口径句 ① 未列 `Phase 24` 部分归档块（`archive/index.md` 已列、精度不一）；② 「与其后的**归档索引**」语序与布局相反。**处置**：口径句改写为「归档索引（在前）与 近线阶段窗口（其后另有 Phase 24 部分归档块：未收口、不计入窗口计数）」。

**R2（delta，`quick`）**：**`Pass`**（0 blocker / 2 warning / 0 suggest；修复点闭合 **3/4**）。闭合 = RG-W01 / RG-S01 / RG-S02；**RG-W02 顶层分解已相符、残留两处**：① 括注「56 行块 + 1 行尾随空行」的 span 归属与 `git diff` hunk 不符，② `docs/design/governance/index.md` 仍写「主窗口 `diff` 仅含删除行」（**RG-W03，复发**）。**两处残留已按建议同批修复**（§4 改 span 中立口径 + 独立实证；索引条目改为「3 新增 / 59 删除」并给出新增面构成），记**「已修复未复审」**——属字符级表述面、不阻断，修复后由调用方复跑门禁取证；**R2 实测用时上界 = 4 分 45 秒**（宿主计时：发起 `12:20:52`，返回后调用方于 `12:25:37` 起落修复），未超 5 分钟时间盒。

**门禁对齐**：`pnpm verify`（常驻链）/ `pnpm docs:check` / `pnpm governance:check` / `pnpm lint:md:check` 均在**本批终态 revision（含 §8 与 `docs/plan/todo.md` 的 M1-1 完成态回填）**上 **exit 0**。

**修复点复跑时另发现并同批修复的两处**（D 阶段自检，同属「记录内可复算性」族，均由修复后复跑门禁抓出）：① §8 的 RG-S02 处置措辞用了**单省略号** `…` ⇒ `lint-md` 的 `use-standard-ellipsis` 判 2 error（仓库口径不使用 `…`）→ 改为无省略号措辞；② §4 复算命令 ③ 用 `sed -n '1,48p;106,$p'` ⇒ `check-docs-git-revision` 判 `unverifiable-shape`（`$p` 属变量展开形态、fail-closed）→ 改为写入中间文件后 `diff` 的显式形态（`sed -n '1,48p;106,999p'`）。两处修复后对应门禁各自复跑为 green，整链读数见上一条。

**审计工件**：`artifacts/review-gate/2026-10-16-phase25-m1-1-todo-archive-deep-migration.md`（本地态、git-ignored）。

**未覆盖边界**：未改 `src/**` / `test/**` / 配置；未推送；Phase 24 两条遗留条目与 Phase 25 其余主线不在本批；R2 未复跑 `pnpm verify`（时间盒内不可能，由调用方在终态 revision 复跑）。

**复查基线**：`docs/plan/todo-archive.md:5 / :21 / :46 / :47-50`、`docs/plan/archive/phase-18.md:1-7 / :8 起正文 / 末行`、`docs/plan/archive/index.md:14 / :22`、`docs/plan/roadmap.md:86`、`docs/design/governance/index.md:25`、`docs/plan/todo.md` Phase 25 表 M1-1 行、本记录 §4 / §6 / §7。
