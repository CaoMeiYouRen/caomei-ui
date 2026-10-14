# Phase 24 M3-7：索引读数 sweep + 读数对账装置换族

> 创建时间：2026-10-14
> 阶段条目：Phase 24 M3-7（主线 M3；用户 2026-10-14 授权插队追加）
> 依据：[计数漂移排查与方案 A 落地](./2026-10-14-count-drift-investigation-and-method-a.md)（方案 A ②「索引条目移除读数复述」+ ④「受检族收窄到仍有决策函数的族」）；用户 2026-10-14 追加指令「继续推进 M3-6 的剩余内容」= **存量索引 sweep**（该子项原按「存量不回改」默认落定推迟，本次由用户裁定执行）

## 1. 结论摘要

- **存量 sweep（M3-6 的剩余面）**：`docs/design/governance/index.md` 的存量摘要**清除「命令输出总量」类门禁读数**，改为「结论 + 记录链接」。删除口径严格二分：
  - **清除**：`verify` 总例数（`N 文件 / M 例`）、命令级 `N passed` / `N tests`、`N 记录 / M 指针`；
  - **保留**：**判别力 / 负向对照的局部量**（规范例外② —— 如「还原后 1 passed」「负向对照 16 张」），以及 `docs:check` 段数、受检面构成这类**判据性**表述。
- **装置换族（M3-7 本体）**：`check-governance-counts` 的 4 个「门禁读数复述」族**替换**为「**文档引述的数值常量 ↔ 代码常量**」——即方案 A ④ 所指「仍有决策函数的族」。**耦合关系（硬依赖）**：sweep 使原对账族失去对象（对账面由 72 条塌至 2 条、触发下界红灯），故**两者必须同批落地**，否则中间态门禁必红。
- **换族后首跑即抓出 4 处真实失配**（新守卫的第 5 分钟即产出价值）：
  - 1 处为**已显式标注的历史快照**（`A11Y_FIXTURE_BUDGET` 的当时值，记录同时写明演进 47 → 51）→ **据「写录时点快照」口径为守卫补「快照豁免」**（**同一行内**、引述前 40 字符或**同行后缀** 40 字符内出现「当时、快照、原为、曾为、此前、写录时点、点时值」之一即跳过）；
  - **3 处为真过期引用**（旧下界 `MIN_RECONCILED` 已随换族移除）→ 逐处修正：规范条目改写为换族后描述、索引摘要与旧阶段记录改为非引述形态 + 前向指针。
- **`MIN_CITED_CONSTANTS` 取值口径**：按上线时实跑的引述处数取同数量级的保守值（不写精确实测值；复算命令见守卫文件头「用法」）。

## 2. 存量 sweep 口径

| 类 | 处置 | 例 |
|:---|:---|:---|
| 命令输出总量 | **清除**（保留命令与结果词） | 「`pnpm verify` exit 0（后附总例数）」→「`pnpm verify` exit 0」；「`pnpm test:e2e` 后附 passed 数」→「`pnpm test:e2e` passed」 |
| 治理记录计数 | **清除** | 「`governance:check` exit 0（后附记录 / 指针数）」→「`governance:check` exit 0」 |
| 判别力 / 负向对照局部量 | **保留**（例外②） | 「负向对照 1 failed → 还原后 1 passed」、受检面与下界、`docs:check` 段数 |
| 快照演进叙述 | **保留**（含「当时 / 快照 / 后经扩面」等标注） | 「预算锚点当时为 ……，后经扩面调整」 |

- **边界**：只清**索引**（导航 / 检索入口）；**既有治理记录本体不回改**（点时记录不回改 —— 其读数按「写录时点快照」对待）。
- **实施**：脚本化替换 + 逐处打印复核（含空括号清理）。**收口由机检承担而非人工复扫**：首轮人工复扫**未收口**（残留 bold 内嵌 `N 文件 / **M 例**`、`N 文件 / tests` 与 `= tests` / `（tests）` 等悬空残句，被 R1 判 blocker）→ 已在守卫内新增 `index-reading-residue` 断言（`READING_RESIDUE_PATTERNS`）**接入 `governance:check`**，此后「索引零读数残留」由机检保证，不再依赖人工复核。

## 3. 装置换族

| 项 | 内容 |
|:---|:---|
| 受检面 | `docs/**/*.md`（排除 `node_modules` / `.vitepress` / `coverage` / `dist` / `.temp` / `artifacts` 等）中**行内代码**形如 `` `NAME = N` `` 的**常量引述**（`NAME` 为 `[A-Z][A-Z0-9_]{2,}`） |
| 事实源 | `scripts/**` 与 `test/**` 中**行首**的 `export const NAME = N` 与**非导出** `const NAME = N`（测试内阈值多为非导出）+ `SCOPE_FLOOR = { key: N }`（以 `SCOPE_FLOOR.key` 收录） |
| 判定 | ① 引述名在代码中存在 → 值须属于其**取值集合**（同名常量跨文件取值不同，命中任一即通过）；② 代码无该名 → 跳过；③ **同一行内**（引述前或同行后缀）有**快照标记** → 跳过 |
| 失败码 | `const-value-mismatch` / `scope-narrowed`（受检面下界）/ **`index-reading-residue`**（索引读数残留，sweep 防复发）/ `io-error` |
| 保留机制 | 受检面下界（防「解析被削弱 ⇒ 通过」）；`--root` 与参数校验、exit 2 语义沿用 |

## 4. 载体同步

- `docs/plan/todo.md`：M3-6（存量面）与 M3-7 状态回填（与本记录 §7 Review Gate 结论**同批**落地，不早于结论）。
- `docs/design/governance/index.md`：本记录登记；旧阶段记录摘要的过期引用修正 + 换族前向指针。
- `docs/standards/ai-collaboration.md` §9：该守卫的**机检面描述**同步为换族后口径。
- 旧阶段记录 `2026-10-11-phase22-m6-3-governance-counts-guard.md`：过期下界引用改为非引述形态 + 前向指针（**不回改其余事实**）。
- `.session`：本 session 收尾时按 todo-manager Step 3 同步。

## 5. 边界

1. **只清索引，不回改记录本体**（§2）；既有记录里的读数为写录时点快照。
2. **不追求「零数字」**：判别力 / 负向对照 / 阈值口径 / 外部快照四类照旧保留（规范例外）。
3. **不扩受检面到散文数字**：仅字符串化常量引述；「约三成」这类表述不在面内（自然语言不可正则化）。
4. **不改变任何守卫的判定逻辑与阈值取值**：换族改的是受检族与事实源，`MIN_CITED_CONSTANTS` 为新设。

## 6. 质量门

- `pnpm lint:check` / `pnpm lint:md:check` / `pnpm typecheck` **exit 0**。
- `pnpm verify` **exit 0**（含本批新增单测）。
- `pnpm governance:check` **exit 0**（`check-governance-counts` 换族后通过）。

## 7. Review Gate

- audit-depth：`standard`（存量载体 sweep + 守卫换族 + 单测重写；属治理装置与规模载体改动）。时间盒：≤ 10 分钟。
- **R1（`standard`）`Reject`**（1 blocker / 3 warning / 6 suggest）：**RG-B1** = sweep **未收口**（索引仍留 bold 内嵌 `N 文件 / M 例`、`N 文件 / tests` 等 11 处 + 约 12 处悬空残句），且记录 §2 的「按族复扫确认清零」为**不成立的验证声明**；warning = 守卫事实源漏项（`test/**` 非导出 `MIN_*` 不在面内，放过活载体过期引述 `MIN_SECTIONS`）／快照豁免跨行窗口既过宽又过窄／`SCOPE_FLOOR.key` 为不可达空能力；suggest = 下界按处计 / 单测缺口 / 事实源字符串污染 / 文件头自问自答 / 索引与 todo 口径不对称 / 记录排除项与实现不符。
  - 审计方**实证了硬依赖**（临时在仓库外跑 HEAD 版守卫）：HEAD docs → 对账面 72 条 exit 0；swept docs → 2 条 < 下界 40 判 `scope-narrowed` exit 1 ⇒ 「sweep 与换族必须同批」成立。
- **修复（R1 后同批）**：① sweep 收口（清尽五类形态 + 悬空残句改写成句）；② **防复发机检**——守卫新增 `checkIndexReadingResidue` + `READING_RESIDUE_PATTERNS`（失败码 `index-reading-residue`）接入 `governance:check`，记录 §2 改为「收口由机检承担」；③ 事实源改行首锚定 + 覆盖非导出 `const` ⇒ 可比对引述 9 → 26 处 / 不同常量名 11 个，**并抓出 4 处真过期引述**（`MIN_SECTIONS = 8` × 3、`MIN_RECONCILED = 40` × 1）逐处修正；④ 快照判定改**同行 + 支持后缀**；⑤ 引述正则支持 `.key`；⑥ 下界改按**不同常量名**计（`MIN_CITED_CONSTANTS = 8`）；⑦ 单测补至 20 例。
- **R2（delta，`standard`）`Reject`**（**1 blocker**）：**暂存区卫生门禁实跑失败** —— 修复点落地后未 `git add`，`scripts/governance/check-governance-counts.test.mjs` 处于 `MM`（partial-stage），`pre-commit` 会直接阻断；且调用方 prompt 的「供采信」清单声称该门禁通过，与事实相反。
  - **注**：该 finding 由 **M3-1 落地的 `check-staging-hygiene` 守卫实跑抓到** —— 治理装置按设计生效。
- **修复（R2 后同批）**：① `git add` 收口并复跑 `check:staging-hygiene` 至 exit 0；② 守卫文件头与实现对齐（受检面下界语义 / 常量族范围 / 非导出常量边界）；③ 记录 §1 / §3 与本轮实现同步（事实源含非导出 `const`、快照「同行 + 后缀」、失败码补 `index-reading-residue`）；④ 残留形态补 `（passed）` 与 bold 包住文件数（suggest）；⑤ JSDoc 引用与键名表述统一（suggest）。
- **R3（delta，`standard`）`Pass`**（**0 blocker**）：R2 的 blocker（暂存区卫生）由审计方**独立实跑** `check-staging-hygiene` exit 0 确认关闭；NF1 / NF2 / NF3 / NF4 全部关闭；守卫实跑、定向单测 20 例、`governance:check` / `lint:md:check` 均 exit 0。
  - follow-up（新范围，**已同批采纳**）：**NF5** 守卫文件头「判别规则」条的快照口径仍为旧窗口表述（实现已改「同行 + 后缀」）→ 同步；**NF6** 「夹具字符串不采集」绝对化断言 → 限定为**单行**字符串并记明多行模板字面量的已知边界；**NF7** 单测标题仍写「可比对处数」→ 改为「不同常量名数」；**NF8** 残留形态未覆盖「（N passed）」→ 补入正则。
- **轮次总结（R1 ~ R3）**：3 轮（R1 Reject → R2 Reject → R3 Pass），**2 个 blocker**：① sweep 未收口 + 不成立的验证声明；② **暂存区卫生**（修复后未 `git add` —— 由 M3-1 落地的 `check-staging-hygiene` **实跑抓到**，装置按设计生效）。
- 审计工件：三轮证据以子代理回复为准，转录落盘 `artifacts/review-gate/`（**本地态、git-ignored**）。
