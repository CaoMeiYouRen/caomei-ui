# Phase 21 M4-1：发布指南 §10 下游清单口径修正（接入即登记）

> 创建时间：2026-10-10
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 21 **M4-1**（治理口径收口）
> 依据：用户 2026-10-10 裁定 D14（N5 随 M4 落地）；[Phase 8 启动范围评估 §3 / §9](./2026-10-08-phase8-downstream-regression-scope-evaluation.md)（实测消费面 + 「接入即登记」follow-up）
> 边界：本批为**文档口径修正**（`release.md §10` 中英）；不改机制 / 不建跨仓实体；**M1-2（下游接入）暂缓**，故 §10 只声明「库侧就绪 + 受检清单约定」，不宣称已跑通。

---

## 1. 交付

- **`docs/guide/release.md` §10**：由「下游兼容性回归（后置）」重写为「下游兼容性回归」——机制 / 库侧载体 / **受检清单（接入即登记）** / 容量边界 / 归属。
- **`docs/i18n/en-US/guide/release.md` §10**：同步同口径（英文原为 `(deferred)` 且列同一滞后清单）。

## 2. 口径修正点

| 维度 | 修正前 | 修正后 |
|:---|:---|:---|
| 状态 | 「后置」（未启动） | **已启动**（2026-10-10 随[路线图 Phase 8](/plan/roadmap)，dependfix 试点）+ 历史注保留 |
| 受检清单 | 「已接入下游」= dependfix/platform、caomei-auth、rss-impact-next、momei、afdian-linker（**含零消费目标下游**） | **实测消费面**：`dependfix`（`apps/platform`）、`momei`（根包）；零消费目标下游（`caomei-auth` / `rss-impact-next` / `afdian-linker`）标注**「接入后增量登记」** |
| 登记约定 | 无 | **接入即登记**（受检面以实测消费为准，接入前不属受检面） |
| 库侧载体 | 未提 | `.github/workflows/compat-check.yml`（`on: workflow_call`，调用方上下文、无需跨仓 token） |
| 容量边界 | 「至少覆盖 typecheck 与 build」 | **每次发布（tag）触发 1 次**；最低 `typecheck` + `build`，不含 e2e / 视觉 / 全量单测 / 覆盖率 |
| 触发口径 | 未提（易被读作「发布即自动触发」） | **触发方式由调用方决定**（下游 `workflow_dispatch` / 既有定时回归）；「发布即刻自动触发」属 A 形态、**当前未启用**（兑现 M1-1 §4 承诺） |
| 现状 | 未提 | 库侧 reusable workflow **已就绪**、**下游接入进行中**（dependfix 试点；M1-2 待执行） |

> **历史叙述保留**：原「启用条件（三者同时满足）」为启动前置条件，机制已启动后不再作为门禁；历史以 §10 顶部注保留（「原为后置项，2026-10-10 启动」）。

## 3. 验证

- `pnpm lint:md:check` **exit 0**；`pnpm docs:check` **11 段全绿**。
- **活载体旧口径零残留**（限定到活载体、排除点时记录）：`grep -rn 'rss-impact-next、momei、afdian-linker' docs/guide docs/i18n/en-US/guide docs/design/architecture.md` → **0 命中**（点时记录 / 归档块保留历史原文，按 [规划规范 §9](../../standards/planning.md) 不回改，不计入残留）；中英 §10 一致。
- **活载体状态口径同步**：`docs/design/architecture.md §7` 的「Phase 8，延迟启用」同批改为「2026-10-10 启动」；`docs/plan/roadmap.md` 的同类描述句已含「2026-10-10 正式启动落定」注，无需回改。
- **链接有效**：`/plan/roadmap`（站内路由）；§10 归属的 Phase 8 启动范围评估以**行内代码**引用——治理目录（`docs/design/governance/**`）**不进文档站构建**，从 guide 页链接它是 **VitePress 死链**（`pnpm docs:build` 实测报错），故不采用相对链接。

## 4. 边界与未覆盖

- **不宣称已跑通**：M1-2（dependfix 侧接入 + 最小贯通验证）**暂缓**，§10 只声明「库侧 reusable workflow 已就绪」与受检清单约定。
- **零消费目标下游未逐一核实本轮接入状态**：依据 Phase 8 评估（2026-10-08）与第五轮范围评估（2026-10-10）的实测快照；接入时以实测重取。
- **不改机制实体**：不建跨仓 CI 触发实体（M1-2 暂缓）。

## 5. 质量门

- [x] `pnpm lint:md:check` exit 0
- [x] `pnpm docs:check` 11 段全绿
- [x] 旧口径零残留（`rg` 复核）
- [x] 零 `src/**` / 零机制改动

## 6. Review Gate

- **结论**：R1 `standard` **`Pass`**（0 blocker / 3 warning / 3 suggest）。
- **轮次 / 范围**：第 1 轮，审本批 5 文件。
- **findings 处置**：
  - **RG-W1（warning）**：活载体 `docs/design/architecture.md §7` 保留旧状态口径「Phase 8，延迟启用」→ **已修**：同批改为「2026-10-10 启动」；记录 §3 回扫口径由「旧清单」扩到「旧**状态**口径」并限定活载体。
  - **RG-W2（warning）**：§10 未如实登记「触发方式由调用方决定 / 发布自动触发未启用」→ **已修**：§10 补「触发与容量」句（中英），兑现 M1-1 §4 承诺。
  - **RG-W3（warning）**：记录 §3「旧口径零残留」回扫命令按字面自指命中、不可复现 → **已修**：命令限定到活载体、显式声明点时记录保留历史原文。
  - **RG-S1（suggest）**：受检清单子标签「当前已接入」易与「已接线本机制」混淆 → **已修**：改为「**已消费（在受检面）**」。
  - **RG-S2（suggest）**：§6 占位 → **已办**：本节回填。
  - **RG-S3（suggest）**：记录称「避免治理目录站内链接问题」理据被审计判为不成立、且 en 缺评估记录路径 → **部分采纳**：en 已补路径；**但链接形态经 `pnpm docs:build` 实测为死链**（治理目录不进站点构建），故中英 §10 一律改用**行内代码**引用——原理据成立，记录 §3 措辞改为可复算表述。
- **审计核验**：实测消费面（dependfix `0.5.0` / momei `0.3.0` / 三目标下游零消费）、库侧载体 `compat-check.yml` 存在且 `on: workflow_call`、中英 §10 一致、点时记录有意保留，均独立复核通过。
- **未覆盖边界**：未在 CI 实跑 `compat-check.yml`（M1-2 待执行）；下游为读取时点快照；未整链复跑 `pnpm verify`（采信调用方 exit 0）。
- **留痕**：`artifacts/review-gate/2026-10-10-phase21-m4-1.md`（本地态，git-ignored）。
