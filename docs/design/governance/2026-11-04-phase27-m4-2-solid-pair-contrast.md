# Phase 27 M4-2 品牌预设 `-solid` 对比度治理交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 的 M4-2；范围依据见[第十一轮范围评估](./2026-11-03-next-stage-scope-evaluation-11.md) §2 D-2。
> 定位：Phase 27「机制与质量收口」第 2 条的交付记录；本记录是该条目处置结论与证据的唯一载体。

## 1. 处置结论

- **不修色**：`caomei` `primary-solid` `#e63946` 的 4.168:1 属既有品牌裁定（用户决策预设品牌色保持不变，见 [Phase 18 M4-2 终局结论](./2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md)），本批**维持**，并以 allowlist 显式留痕。
- **口径澄清**：登记时点列的 `momei` 亮色 `success` 三态 2.279 / 2.643 / 3.045 **不是 `-solid` 配对**，而是非 `-solid` 的 `--caomei-color-success`（`#22c55e`）直接作为实底并配 `on-solid` 白字的推算值；库内没有 `on-solid` × `--caomei-color-success` 的配对消费点。其真实实底 `success-solid`（`#15803d`）默认 / hover / active 为 **5.016 起**，达标。
- **断言面落地**：`-solid` 配对（默认 / hover / active）× 5 语气 × 6 预设 × 明暗 × 2 背景进入常驻矩阵；唯一例外以 `SOLID_EXCEPTIONS` 编码（默认态下限 4.0，hover / active 仍按正式阈值），修复到正式阈值（4.5 + 0.04 裕度）后测试会以 stale exception 失败并要求移除。
- **零运行时改动**：`git diff -- src/styles/` 为空，无视觉基线重冻结。

## 2. 现状取证（2026-11-04，真实 Chromium）

按「实底 / `on-solid` 前景」在其**实际合成背景**上测量，取默认 / hover / active 三态最小值：

| 预设 | 明暗 | neutral | primary | success | warning | danger |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| minimal | 亮 / 暗 | 7.730 / 5.201 | 5.169 / 5.169 | 5.016 / 5.016 | 5.022 / 5.022 | 4.829 / 4.829 |
| caomei | 亮 / 暗 | 7.711 / 5.080 | **4.168 / 4.168** | 5.016 / 5.016 | 5.178 / 5.178 | 6.470 / 6.470 |
| momei | 亮 / 暗 | 7.730 / 5.208 | 9.140 / 6.182 | 5.016 / 5.016 | 5.178 / 5.178 | 6.470 / 6.470 |
| sakura | 亮 / 暗 | 7.730 / 5.207 | 8.016 / 8.016 | 7.130 / 7.130 | 7.307 / 7.307 | 8.310 / 8.310 |
| forest | 亮 / 暗 | 9.253 / 5.947 | 7.684 / 7.684 | 7.130 / 7.130 | 7.307 / 7.307 | 8.310 / 8.310 |
| ink | 亮 / 暗 | 15.169 / 9.388 | 16.686 / 16.686 | 7.130 / 7.130 | 6.851 / 6.851 | 8.310 / 8.310 |

- 全矩阵最低值 = **`caomei/primary` 4.168**，其余组合最低 **4.829**（默认预设 `danger`）。
- `momei` 亮色 `success` 的 `--caomei-color-success`（`#22c55e`）配白字为 **2.279**，其 `color-mix` 派生三态为 **2.643 / 3.045**——与登记时点读数一致，但该 token **不是 `-solid` 族**。
- `caomei/primary` 的逐态读数为 **default 4.168 / hover 4.618 / active 5.016**，三态最小值 4.168（表格列的是三态最小值）。

## 3. 实现

- **夹具**（`test/e2e/fixtures/app.vue`）：`#preset-contrast` 追加 5 条 `variant="primary"` + `tone` 的实底按钮，`data-contrast-key="solid/<tone>"`。
- **常驻矩阵**（`test/e2e/preset-contrast.e2e.ts`）新增用例「`-solid` 配对默认 / hover / active ≥ 4.5:1」：
  - 6 预设 × 明暗 × 2 背景 × 3 态 × 5 语气；CDP 强制 `:hover` / `:active`，等待 260ms 过渡；
  - 受检键集合与下界（`MIN_SOLID_CELLS = 5`）双重断言，防静默收窄；
  - **三态互不相同**：hover 必须改变实底色、active 必须提供独立反馈（防伪类未生效 / `color-mix()` 静默失效）；
  - **例外表双向约束**：`caomei/primary` 仅在**默认态**放宽到下限 4.0；hover / active 仍按正式阈值（4.5 + 0.04 裕度）断言，避免跨态放宽掩盖回归；修复到正式阈值后测试失败（stale exception），避免例外长期残留。
  - **背景轴守卫**：断言 `BACKGROUNDS.length = 2`，防止验收要求的 `bg` / `bg-elevated` 两档被静默收窄。
- **文档**：`docs/design/design-spec.md` §3.2 增加断言面与口径澄清；`docs/guide/upgrade-to-1.0.md` 与英文镜像同步该分类与例外说明。

## 4. 验证证据

- `pnpm exec playwright test test/e2e/preset-contrast.e2e.ts --project=desktop` → **3 passed**（含新增矩阵，实测约 31s；120s 超时约 3× 余量）。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm docs:check` / `pnpm governance:check` → **exit 0**（2026-11-04 提交前批次复跑）。
- 断言面判别力：`SOLID_EXCEPTIONS` 的 stale 断言、背景轴长度断言与「三态互不相同」断言共同保证矩阵不会因伪类失效、轴收窄或配色修复而空转。

## 5. Review Gate

- **audit-depth**：`standard`（含 E2E 装置、对外文档与治理记录；按测试 / 文档两分区并行）；时间盒 ≤ 8 分钟。
- **R1（`standard`）：`Reject`**（1 blocker / 2 warning / 4 suggest）——blocker：本记录 §2 把三态最小值误写成 hover / active 逐态值（应为 default 4.168 / hover 4.618 / active 5.016）；warning：例外下限跨三态放宽、`on-solid` 配对范围表述过宽；suggest：背景轴缺收窄守卫、stale 阈值与正式阈值存在 0.04 死区、证据指针不精确、RG 指针尚未回填。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning；6 条修复点全部关闭，1 条提交动作（本节回填）同批完成）。
- **用时实测（宿主时钟）**：R1 发起 `2026-11-04T12:05:16Z`、返回 `12:14:33Z` ≈ **9 分 17 秒**（**超时间盒约 1 分 17 秒**；原因为审计方独立复跑定向 E2E 与多项治理脚本）；R2 发起 `12:18:28Z`、返回 `12:19:46Z` ≈ **1 分 18 秒**（≤ 4 分钟）。
- **复查基线**：`test/e2e/preset-contrast.e2e.ts`、`test/e2e/fixtures/app.vue`、`docs/design/design-spec.md` §3.2、中英 `upgrade-to-1.0.md`、本记录、`docs/design/governance/index.md`。

## 6. 未覆盖边界

- 不覆盖非 `-solid` 的 `--caomei-color-success` 作为实底的消费方自定义用法；该项仍属 Backlog「颜色角色分层与非文本对比度」的处置面。
- 不覆盖 `-solid` 与自定义 `--caomei-<component>-bg` 覆盖钩子的组合（覆盖语义仍是「由使用方负责」）。
- 不覆盖 `--caomei-color-on-solid` 的其它配对形态：图片预览遮罩（`--caomei-color-mask`）与客户自定义覆盖不在本矩阵内。
- 不新增视觉基线：本次零组件 / 运行时布局变更；夹具页新增 5 条按钮，但不进入视觉基线受检面，`test:visual` 不受影响。
- 仅在 Chromium 内核验证，与既有对比度 / 计算样式装置同口径。
