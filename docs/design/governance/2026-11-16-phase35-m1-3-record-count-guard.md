# Phase 35 M1-3：治理记录计数一致性机检（F14）

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M1-3 行（[登记记录](./2026-11-15-phase35-registration.md)）。

## 1. 交付面（2 文件）

| 面 | 文件 |
|:---|:---|
| 机检 | `scripts/governance/check-governance-counts.mjs`：新增第二族「记录内计数自洽」——算式恒等式 + 新记录文件面模板 |
| 单测 | `scripts/governance/check-governance-counts.test.mjs`：算式五例、文件面四例、记录级三例 |

本记录、治理索引摘要与 `docs/plan/todo.md` 状态位属留痕，不计入上表。未改 `package.json`：本守卫已在 `governance:check` 链上，新增族随之生效。

## 2. 决策

1. **只收三类明确形态，不做散文数字解析**。登记记录已标明「自然语言计数误报风险高」；实测把「总数 ↔ 紧随括号清单」当规则会在存量语料上大量伪命中（括号里的分类枚举不是计数拆分），故放弃该形态。
2. **算式恒等式（第一形态）**：支持加减混排（`32 − 4 + 1 = 29`），逐项从左到右求值；排除编号形态、表格行、不等式叙述（`≠` / `!=`）、围栏代码块与行内代码。
3. **文件面模板（第二形态）**：`## 1. …（N 文件）` 的 N 与表内仓库相对路径去重数对账；单元格内路径后的「：说明」不截断路径，`../` 链接与 brace 展开不计入。仅对 `2026-11-16` 及以后创建的记录生效（存量按写录时点保留、不回改）。存量记录采用本形态时多为「读数含记录本体」等旧口径，故不回溯。
4. **§3 用例数归因（第三形态）**：新记录的「新增 N 例」「N passed」读数必须与命令同行（反引号包裹），否则判 `record-count-unattributed`——数字必须可复算，而不是散文里的孤立结果。
5. **错误码分离**：`record-arithmetic-mismatch` / `record-file-face-mismatch` / `record-count-unattributed`，便于定位与后续扩面。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 全量机检 | `node scripts/governance/check-governance-counts.mjs` → OK（存量语料零误报） |
| 单测 | `npx vitest run scripts/governance/check-governance-counts.test.mjs` → 全绿（算式 / 文件面 / 记录级三组；含行号、千分位与负结果用例） |
| 负向验证 | 夹具仓库写入 `10 − 4 = 7` → CLI exit 1 并报 `record-arithmetic-mismatch`；`2026-11-16` 记录声明 3 文件但表内 1 条 → `record-file-face-mismatch`；`2026-11-15` 记录同形态不报；无命令同行的 `10 passed` → `record-count-unattributed` |
| 边界 | 编号形态不被当作减法；不等式叙述、围栏代码块、行内代码与表格行不参与；`../x.md` 与 `src/{a,b}.ts` 不计入文件面；单元格内「路径：说明」可正常计入 |
| 真实语料自证 | 本记录 §1 声明「2 文件」，脚本对其计入 2 条仓库相对路径（自身即受检样本） |
| 质量门 | `npx eslint`（脚本与单测）与 `pnpm check:planning-numbers` 通过 |

## 4. Review Gate

- **R1（`standard`，约 9 分钟）**：**Reject**（4 blocker / 3 warning / 2 suggest）——① 脚本注释与测试名含条目编号，`check:planning-numbers` 红（接入链反向失守）；② 文件面解析与既有记录格式不兼容（路径后接「：说明」不计入），规则在真实语料零覆盖；③ 「行内代码不在面内」与实现相反；④ §3 复述门禁读数且已漂移。
- **R2（`quick`，约 4 分钟）**：**Pass**（0 blocker / 1 warning 未关闭 + 3 备注）。B1 ~ B4 与 W1 / W2 关闭。
- **R1 / R2 处置**：
  - B1 去编号 → 注释与测试名改写，`check:planning-numbers` 0 命中。
  - B2 路径提取改为单元格正则（支持「：说明」后缀，排除 brace / `..`），并给两份新记录加「（N 文件）」声明做真实语料自证。
  - B3 扫描前剥离行内代码。
  - B4 §3 删除具体读数，改定性表述。
  - W1 统一为加减混排求值器 `evaluateChain`（左到右）。
  - W2 新增第三形态 `record-count-unattributed`（读数必须与命令同行）。
  - W3（R2 未关闭）围栏剔除导致行号上移 → 改为逐行跳过围栏、保留原始行号，并补行号用例。
  - R2 备注：千分位截断与负结果静默跳过 → 分别补千分位归一化与 `-?\d+` 结果形态，并补两例单测。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F17 | DataTable 逐格提示接线开销 | 本阶段 M1-4 |
| F16 | Menu 项槽包裹约束 | 本阶段 M1-5 |

## 6. 复查基线

本记录 §1 ~ §5；`check-governance-counts.mjs` 的 `evaluateChain` / `findArithmeticIssues` / `inspectFileFace` / `checkRecordCounts` / `FILE_FACE_CUTOVER`；其单测的三个新 describe。
