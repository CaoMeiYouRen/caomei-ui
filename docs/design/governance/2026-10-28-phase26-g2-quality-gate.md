# Phase 26 G2：质量门执行记录

> 日期：2026-10-28
> 依据：[Phase 26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §4.1 的 G2 判据（`pnpm verify` 全绿；`test:e2e` / `test:a11y` / `test:visual` 全绿）。
> 基线：`6a46098`（S1 / S2 均已完成并提交；工作区干净）。
> 前置：S1 依赖安全清理、S2 Code Scanning 清理 —— 本轮证据在两者之后取得，符合门禁「G2 证据须在 S1 / S2 之后」的约束。

## 1. 执行环境

| 项 | 值 |
| --- | --- |
| 运行时 | Node `v24.22.1` / pnpm `11.17.0` |
| 系统 | Linux `5.15.167.4-microsoft-standard-WSL2` |
| 浏览器 | Chromium `153.0.8010.12`（Playwright 自带） |
| 仓库 | `caomei-ui@0.7.0`，HEAD `6a46098`，工作区 clean |
| 日志 | 本机 `/tmp/opencode/g2-*.log`（未入库；读数见下表） |

## 2. 判据与读数

| 判据 | 命令 | 结果 | 用时 |
| --- | --- | --- | --- |
| 质量门主线 | `pnpm verify` | **exit 0**；142 文件 / **2754 passed**（52 个 pnpm 步骤为 `pnpm verify` 展开行数，2026-10-28 快照口径） | 3 分 42 秒 |
| 端到端 | `pnpm test:e2e` | **exit 0**；**435 passed / 4 skipped / 0 failed** | 5 分 09 秒 |
| 无障碍 | `pnpm test:a11y` | **exit 0**；**67 passed** | 约 8 秒 |
| 视觉基线 | `pnpm test:visual` | **exit 0**；**33 passed** | 34 秒 |
| 画廊回归（补充） | `pnpm test:e2e:gallery` | **exit 0**；**13 passed** | 1 分 21 秒 |

- `pnpm verify` 覆盖：ESLint / Stylelint / markdownlint / `vue-tsc` / docs 类型 / 单测 / 库构建 / `check:build`（24 个 exports 产物）/ `check:resolver` / **`check:nuxt`（最小 Nuxt 4 应用自动导入、样式注入、主题与暗色、SSR）** / `docs:build` / `docs:check:i18n-routing`（7 条）/ `governance:check`。
- E2E 分项目计数：`mobile` 133 / `tablet` 133 / `desktop` 133 / `mobile-320` 18 / `gap-900` 18。
- **4 skipped 为设计内跳过**：`responsive.e2e.ts` 的两条「自驱视口探针」只在全量档（mobile / tablet / desktop）运行，在定向档（mobile-320 / gap-900）跳过（2 条 × 2 档）；非失败、非环境缺失。

## 3. 与上一轮读数的差异

| 项 | G1-F（`a0e82ba`） | G2（`6a46098`） | 说明 |
| --- | --- | --- | --- |
| 单测 | 2750 | **2754** | S2 新增 4 例守卫测试 |
| E2E | 133（仅 desktop） | **435**（5 个 project） | 本轮按 G2 判据跑全量 `test:e2e`，覆盖三档验收视口 + 两档定向 |
| a11y / visual | 67 / 33 | 67 / 33 | 无变化 |

## 4. 结论

- **G2 通过（2026-10-28）**：四条判据均为 exit 0 且零失败；补充的画廊回归同样全绿。
- `M3-3` 的阻塞面由「G2 ~ G4」缩减为「**G3 ~ G4**」；G3 需先发 `1.0.0-rc.1` 到 `next` 并完成 M4-1 下游复验，发布前仍须用户明确授权推送。
- 本轮为零 `src/**` 改动的证据轮：S1 / S2 的依赖与脚本变更已包含在基线内。

## 5. 未覆盖边界

- 仅在本机 Linux / Chromium 取证；Firefox / WebKit 未验（与既有 E2E / 视觉装置同口径）。
- 未在 GitHub Actions 上复跑；本记录为本地质量门证据，CI 侧以同一命令集为准。
- `test:e2e` 按配置排除 `gallery.e2e.ts` / `docs-theme-isolation.e2e.ts`（独立配置），本轮以 `test:e2e:gallery` 补充，未单独跑主题隔离配置。
- 日志仅存本机 `/tmp/opencode`，未入库；命令与读数已固化在本节，可复跑对账。
- `docs:check:integrity` 以 `git ls-files` 枚举受检面：本记录在提交前为未跟踪文件，申报时由 `lint:md` / `docs:check:links` 的 glob 兜底（实测 exit 0），提交后纳入同一受检面。

## 6. Review Gate

- 改动类型：治理记录 + 4 个载体同步（文档类，零 `src/**` 零 `test/**`）。
- 最低验证要求：`lint:md` + 链接 / 路径检查 + 规划载体机检 + RG。
- audit-depth：**standard**（含定量读数的判定表；量化证据已由调用方预核验），时间盒 ≤ 10 分钟。
- 复查基线：`6a46098` + 本轮文档工作区。
- **R1：Reject**（1 blocker / 2 warning / 3 suggest）。B1 为索引摘要复述门禁读数（违反 `ai-collaboration §9` 与本目录「摘要口径」，属 G0-R1-W1 同根复发）；W2 `.session` 仍停在 G2 之前；W3 G2 行在 RG 前预写「已完成」。修复：索引摘要改为结论 + 指针；`.session` 同步到 G3；§2 补步数口径、§5 补 `docs:check:integrity` 未跟踪面边界、本节补齐 RG 结构。
- **R2（`quick` delta，≤ 5 分钟）：Pass**（0 blocker）。B1 关闭；W2 / W3 与 S4 ~ S6 全部处理；`.session` 的 RG 结论字段为收口后回填（R2 已 Pass，无事实偏差）。
