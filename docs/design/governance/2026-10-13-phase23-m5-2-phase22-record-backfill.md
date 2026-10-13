# Phase 23 M5-2：Phase 22 缺库内治理记录补录

> 阶段 / 条目：Phase 23 M5-2（治理载体与文档站守卫）。
> 裁定依据：[下一阶段范围评估（第七轮）](./2026-10-12-next-stage-scope-evaluation-7.md) §8.1 **D7**——治理侧纳入 Phase 22 缺记录补录。
> 来源：Phase 22 归档批次登记的**已知偏差**——「M2-1 / M6-1 / M6-2 / M6-4 / M6-5 的 Review Gate 结论只存于本地态工件 `artifacts/review-gate/`（git-ignored），库内无对应治理记录」。

## 1. 背景与触发

`artifacts/` 被 `.gitignore` 排除，**仅本地留存、跨机器 / CI 不可见**（其 README 自述「不是跨机器 / CI 可见的证据载体」）。Phase 22 上述五条的 Review Gate 结论当时只落本地态工件，构成**记录完整性债务**：换机器或他人接手后，五条只有「已提交 + 归档块一行摘要」可用，找不到结论、findings 与边界。本条目按 D7 补录**可提交载体**——以本条记录为五条结论的**唯一库内事实源**，归档块与治理索引改指本条。

## 2. 补录表（五条逐条）

> 「溯源工件」列为**本地态原文件名**（git-ignored，仅供同机核对）；结论的持久锚点是各条提交哈希与本节陈述。

### 2.1 Phase 22 M2-1 运行时安全告警插队处置（提交 `6e80f9a`）

- **交付**：Dependabot `high` 告警 `source-map-js`（`GHSA-68fv-2mgg-jv7q` / `CVE-2026-93749`，受影响区间 `>= 1.0.0, < 1.2.2`）经 `pnpm-workspace.yaml` 的 `overrides: source-map-js: ^1.2.2` 修复；lockfile 解析 `1.2.1 → 1.2.2`，无旧版残留（含 peer / optional 分支）。
- **关键事实**：pnpm 11 **不再读取** `package.json` 的 `pnpm` 字段，落点必须为 `pnpm-workspace.yaml`（实测有 WARN + 官方 settings 页确认）。
- **门禁**：`pnpm verify` exit 0（115 文件 / 2274 例）、`lint:md:check` exit 0、`docs:check:links` OK；零 `src/**`（V 阶段显式跳过）。
- **Review Gate**：`deep` **Pass**（0 blocker / 0 warning / 4 suggest）。
- **未覆盖边界**：Dependabot 告警的**关闭**只能在推送 + GitHub 扫描后由上游复算——本批未推送，故验收口径为「**本地锁定修复到位、告警关闭待推送**」，不得据本批结论宣称告警已关闭；`pnpm audit` 因 registry `npmmirror` 不可用，以 lockfile 解析 + advisory 取证替代。
- **溯源工件**：`artifacts/review-gate/2026-10-10-phase22-m2-1-source-map-js.md`。

### 2.2 Phase 22 M6-1 归档载体维持的载体留痕（提交 `86caf15`）

- **交付**：Backlog §1.6「归档载体行数超阈压缩」候选行计数 `479 → 527`（与 `docs:check:line-count` 一致），并补 **Phase 22 D8 维持裁定**（承 Phase 21 D11）与**再评估触发**（达 error 阈值 600 强制压缩）。
- **门禁**：`lint:md:check` / `docs:check` / `governance:check` 均 exit 0；零 `src/**` 零 `test/**`。
- **Review Gate**：`quick` **Pass**（0 blocker / 0 warning / 0 suggest）。
- **历史口径处理**：全库其余 `479` 仅余归档 / 点时记录，**保留原值不回改**（点时快照口径）。
- **溯源工件**：`artifacts/review-gate/2026-10-10-phase22-m6-1-archive-载体留痕.md`。

### 2.3 Phase 22 M6-2 `locale` 守卫能力演进（提交 `e93c557`）

- **交付**：`check-locale-keys` 解析器容忍注释——`stripComments`（字符串感知地剥离注释，**未闭合块注释抛错**）+ `parseLocaleSource` 容忍缩进 / 行尾 / 块注释 + `trimEnd`；单测 28 例；`check:locale-keys` / `check:locale-ledger` 全绿；`development.md` §7 / §11 同步。
- **门禁**：**审查时点** `pnpm verify` exit 0（116 文件 / **2288 例**）、定向测试 **26 passed**；**收口后** 单测 **28 passed**、`pnpm verify` exit 0（116 文件 / **2290 例**）。
- **Review Gate**：`standard` **Pass**（0 blocker / 1 warning / 2 suggest）。
- **findings 与收口**：审查时点发现 `RG-W01`（warning）——改动后**未闭合**的块注释会跳过 `while` 至 EOF，把其后行静默吞掉；因实际影响有界（缺键仍相对基准响亮失败，且未闭合注释属 TS 语法错误、会被 `typecheck` 拦截）判 warning 而非 blocker。**收口（同一提交 `e93c557` 内）**：`stripComments` 的块注释扫描校验是否真遇 `*/`，未闭合即**抛错**（响亮失败、不静默吞掉其后内容）+ 补对应单测 → **RG-W01 已修**；两条 suggest（「文案键出现在命名空间之外」的回归护栏单测 / `stripComments` 文档注释声明词法假定）亦**已修**。
- **未覆盖边界**：未重跑全量 `pnpm verify`（采信调用方证据）；未核验 `src/locale/*.ts` 是否实含注释（本批未改 `src/**`）；未做多行字符串续行等极端词法场景实验（本仓无该形态，且行为与改动前一致）。
- **溯源工件**：`artifacts/review-gate/2026-10-11-phase22-m6-2-locale-parser.md`。

### 2.4 Phase 22 M6-4 文档站演示动画遗留项（提交 `47e2084`）

- **交付**：新增 `check:demo-keyframes`（14 个演示区 keyframes 副本 ↔ 组件源 `@keyframes` body **空白 / 注释无关地等价**；未登记副本 / 映射悬空（源改名）/ 受检面收窄均失败；下界 `MIN_DEMO_KEYFRAMES = 14`）+ 9 例单测；`lint:css` 受检面纳入 `docs/examples/**` 与 `docs/i18n/en-US/examples/**`；`development.md` §7 / §11 同步。
- **门禁**：守卫直跑 + 定向单测 + `lint:css:check` + `governance:check` 独立复跑 + glob 生效性注入验证。
- **Review Gate**：`standard` **Pass**（0 blocker / 1 warning / 2 suggest）。
- **findings 与收口**：`RG-W01`（warning）——`development.md` §11 的 stylelint 受检面权威口径未随本批同步（缺两侧示例目录、且新增守卫未登记）→ **已修**：§11 补入 `docs/examples/**` / `docs/i18n/en-US/examples/**`，§7 新增 `check:demo-keyframes` 条目（副本等价 / 未登记 / 悬空 / 下界 + `KEYFRAME_MAP` 登记约定）。2 条 suggest 非阻塞。
- **溯源工件**：`artifacts/review-gate/2026-10-11-phase22-m6-4-demo-keyframes.md`。

### 2.5 Phase 22 M6-5 文档站示例外部图片依赖消除（提交 `59c1073`）

- **交付**：10 个示例（zh / en）改用**站点内置本地占位图** + `withBase`，移除 `picsum.photos`；新增 `docs/public/demo/*.svg` ×4；构建产物 4 资源 HTTP 200、示例无外链。
- **门禁**：`pnpm verify` exit 0（115 文件 / 2274 例）、`docs:check` 全绿（无 404）。
- **Review Gate**：`standard` **Pass**（0 blocker / 1 warning / 4 suggest）。
- **findings 与收口**：`RG-W01`（warning，教学可观测性）——`image/lazy` 示例改用 286 B 本地 SVG 后「加载过程可见性」几乎消失、V 阶段未取证 lazy 行为 → **已修**（zh / en 注释弱化「加载过程可见」的声明，改为提示用 DevTools 限速 / 网络面板观察，不再断言可见性）。`RG-S04`（suggest）——缺「示例无外链图片源」的防复发载体 → **已由 [Phase 23 M5-1](./2026-10-13-phase23-m5-1-demo-external-image-guard.md) 落地**（`docs:check:demo-external-images`）。
- **未覆盖边界**：懒加载行为的浏览器实测（`RG-W01` 已登记为证据缺口，属 V 阶段职责）。
- **溯源工件**：`artifacts/review-gate/2026-10-11-phase22-m6-5-external-images.md`。

## 3. 载体与指针同步

- [`docs/plan/todo-archive.md`](../../plan/todo-archive.md) 的 Phase 22 块：五条目行的「**库内无治理记录**」改为指向本记录；「已知观察②」由「属已知偏差、本批不补造路径」改为「**已由 Phase 23 M5-2 补录**，见本记录」。
- [`2026-10-12-phase22-archive.md`](./2026-10-12-phase22-archive.md) §已知偏差：保留归档批次时点的原陈述，**追加前向指针**指向本记录（按 §9「点时记录保持原样、前向指针」口径，不回改原句）。
- 治理索引：登记本记录；M5-1 记录同批登记。

## 4. 单一事实源边界

- **本记录 = 上述五条 Review Gate 结论（含 findings 与收口）的唯一库内载体**。归档块与索引只保留一行摘要 + 指针，不再并列**展开**结论细节。
- 五条的**交付事实**（改了什么、提交号）仍以各提交与归档块条目行为准；本记录只补**结论面**，不另立第二套交付叙述。
- 结论来源为本地态审计工件与归档批次记录，**未重新执行审计**；本记录属**转录补录**，不产生新的 Gate 结论。

## 5. 质量门

本批为**纯文档 / 治理载体批次**（零 `src/**` 零 `test/**` 零配置改动）：

- `pnpm lint:md:check` / `pnpm docs:check` / `pnpm governance:check`；`pnpm verify` 常驻链。

## 6. Review Gate

R1 **两分区并发审计**（[AI 协作规范 §3.2](../../standards/ai-collaboration.md)：本批 12 文件 / +550 −12 触发并发阈值，按模块划分）——**本条目落在「分区 B：治理与规划载体」**，`standard` **`Pass`**（0 blocker / 1 warning / 3 suggest）；**分区 A（守卫 / 单测 / 配置接线 / 示例）亦 `Pass`**（结论见 [M5-1 记录](./2026-10-13-phase23-m5-1-demo-external-image-guard.md)）。**汇总取最严 → 本批次整体 `Pass`**。

分区 B 的 findings **均同批采纳**（记「已修复未复审」）：

- **RG-W01**（warning，首次）§2.3 的 M6-2 `RG-W01` **收口状态转录缺失**——交付线已写「未闭合块注释抛错」，但 findings 线仍以现在时描述修复前行为、未标「已修」，与「本记录为五条结论唯一载体」的声明冲突。**处置**：§2.3 改为「findings 与收口」，写明收口落在同一提交 `e93c557` 内（`stripComments` 校验 `*/`、未闭合即抛错 + 补单测）→ RG-W01 **已修**；两条 suggest 亦已修。
- **RG-S01**（suggest，首次）§2.3「门禁」线混用审查时点与收口后数字 → **处置**：拆为「**审查时点** 2288 例 / 26 passed」与「**收口后** 28 passed / 2290 例」。
- **RG-S02**（suggest，首次）§4「不再并列陈述结论细节」与归档块残留的一行结论措辞有张力 → **处置**：改为「不再并列**展开**结论细节」。
- **RG-S03**（suggest，首次）`todo.md` 完成态早于两条记录 §Review Gate 回填 → **处置**：本次同批回填 §Review Gate（完成态与 Gate 结论同批落地）。

**实测用时**：分区 B ≈ **4 分钟**（发起 `18:43:03`，工件写入 `18:47`；总时间盒 = 各分区最大值 ≤ 10 分钟，未超）。审计工件：`artifacts/review-gate/2026-10-13-phase23-m5-2-phase22-record-backfill.md`（本地态、git-ignored）。
