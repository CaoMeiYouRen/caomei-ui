# Phase 21 M3-2：视觉回归基线的 CI 接入（先非阻断）与文档

> 创建时间：2026-10-10
> 关联条目：[待办事项](../../plan/todo.md) Phase 21 **M3-2**（视觉基线落地）
> 依据：用户 2026-10-10 裁定 D10（立项落地）；[M7-1 评估](./2026-10-08-m7-1-visual-regression-baseline-evaluation.md) §5；M3-1 装置交付 [视觉回归基线装置与首批基线](./2026-10-10-phase21-m3-1-visual-baseline-device.md)
> 边界：本批为 **CI 接线 + 文档**（不改装置 / 不改基线 / 不改组件）；**未在 CI 实跑**（需推送触发）。

---

## 1. 交付

- **`.github/workflows/regression-weekly.yml`**：`e2e` 作业在 `capture:styles` 之后新增 **`Run visual regression baseline`**（`pnpm run test:visual`，**`continue-on-error: true` 非阻断**），沿用同作业已安装的 Chromium；步骤注释写明「先非阻断 + 转正条件」。
- **`docs/standards/testing.md`**：
  - §2.1 新增「**真实渲染整体像素层（视觉回归基线）**」条——装置口径（独立 config / 固定环境 / 双轴容差 / 串行不重试 / 下界守卫 / 负向对照）、**基线生成环境纪律**、**接入策略**（不进 `pnpm verify` 常驻链、周级回归先非阻断、首个全绿 run 后评估转阻断）。
  - §6 命令新增 `pnpm test:visual` / `pnpm test:visual:update`。
- **`docs/guide/development.md`**：命令表新增 `pnpm test:visual` 行。

## 2. 口径（本批固化）

1. **非阻断观测期**：`continue-on-error: true`——先观测 `ubuntu-latest` 与基线生成环境的渲染一致性（字体 / 抗锯齿）。
2. **转正条件**：**首个 `ubuntu-latest` 全绿 run 且实证字体渲染一致性**后评估转阻断（复刻 dependfix 的转正路径）；跟踪项已登记 [Backlog §1.6](../../plan/backlog.md)（触发条件 = 首个全绿 run）。
3. **不进 `pnpm verify` 常驻链**：需真实浏览器，与 `capture:styles` / `test:e2e` 同类落位，由周级回归承载。
4. **基线生成环境纪律**：基线须在与 CI 相同环境生成；跨环境差异是假阳性主源（M3-1 的基线生成于本地 Linux 容器，属已知边界，见 §4）。

## 3. 验证

- `python3 -c "import yaml; yaml.safe_load(...)"` 解析 `regression-weekly.yml` **通过**。
- `pnpm lint:md:check` **exit 0**。
- `pnpm docs:check` **11 段全绿**（`docs:check:links` 含新增治理记录与规范内链）。
- `pnpm verify` **exit 0**。

## 4. 边界与未覆盖

- **未在 CI 实跑**：需推送后由 `regression-weekly.yml` 的 `workflow_dispatch` / 定时触发；**首个非阻断 run 后按需重冻结基线**（若 `ubuntu-latest` 与本地容器渲染不一致）。该跨环境风险（M3-1 的 RG-W01）在本批**延期至首个 CI run 复核**。
- **未转阻断**：按口径保留观测期，转正需另行决策（首个全绿 run 后）。
- **不改装置 / 基线 / 组件**：本批纯接线与文档。

## 5. 质量门

- [x] YAML 静态解析通过
- [x] `pnpm lint:md:check` exit 0；`pnpm docs:check` 11 段全绿
- [x] `pnpm verify` exit 0
- [x] 零 `src/**` / 零装置 / 零基线改动

## 6. Review Gate

- **结论**：R1 `standard` **`Pass`**（0 blocker / 0 warning / 3 suggest）。
- **轮次 / 范围**：第 1 轮，审本批 6 文件。
- **findings 处置**：
  - **RG-S1（suggest）**：§6 占位 + 需落盘工件 → **已办**：本节回填 RG 结论；工件 `artifacts/review-gate/2026-10-10-phase21-m3-2.md`。
  - **RG-S2（suggest）**：转阻断缺持久跟踪载体 → **已修**：在 [Backlog §1.6](../../plan/backlog.md) 登记「视觉基线转阻断评估」候选（触发条件 = 首个 `ubuntu-latest` 全绿 run）。
  - **RG-S3（suggest）**：§2 转正条件表述较 M7-1 §5 简化 → **已修**：补「且实证字体渲染一致性」。
- **审计核验**：CI 步骤归属 / 紧随 `capture:styles` / 沿用已装 Chromium / `continue-on-error` / 未进 `verify` 链 / YAML 合法 / 口径四处一致 / 命令真实性 / workflow 注释无规划编号 / 未误改他物（6 文件，零 `src/**` 零装置零基线），均独立复核通过。
- **未覆盖边界**：未在 CI 实跑（需推送触发；M3-1 的跨环境风险 RG-W01 延至首个 CI run）；未独立复跑 `pnpm verify` 全量（采信调用方 exit 0）。
- **留痕**：`artifacts/review-gate/2026-10-10-phase21-m3-2.md`（本地态，git-ignored）。
