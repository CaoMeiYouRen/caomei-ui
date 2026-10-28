# Phase 26 G0 M5 收口自检记录

> 创建时间：2026-10-28
> 依据：[Phase 26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §4.1 的 G0 判据 / §2.3 的收口自检口径。
> 定位：G0 门禁的结论文档；M5 四条原子条目的交付细节见各自记录，本记录只汇总「是否满足 G0」与证据读数。

## 1. G0 判据与结论

| G0 判据 | 结论 | 证据 |
| --- | --- | --- |
| M5-1 ~ M5-4 全部完成 | 达成 | 四条原子条目在 [todo](../../plan/todo.md) 均为「已完成」；交付提交 `d59800a` / `013b647` / `b021ccc` / `2b7af3a` |
| 每项经 Review Gate Pass | 达成 | M5-1 R1 `Reject` → R2 / R3 `Pass`；M5-2 R1 `Pass` → R2 / R3 / R4 `Pass`；M5-3 R1 `Pass`；M5-4 R1 `Reject`（3 分区）→ R2 `Pass` |
| M5 收口自检的 axe 通过 | 达成 | `node scripts/docs/check-docs-axe.mjs --report=test-results/docs-axe/g0-m5-full-matrix.json` → **exit 0**，5 页 × 2 条 WCAG 规则零违规（见 §2） |
| 计算样式通过 | 达成 | `pnpm capture:styles` → **349 项 0 差异**（基线由 M5-4 重冻结；36 条新增状态采样逐项有据，见 §3） |
| 视觉基线通过 | 达成 | `pnpm test:visual` → **33 passed（0 差异）**，未重冻结 |
| `check-docs-axe` 全矩阵退出码为 0 | 达成 | 同上，报告 `head` = `2b7af3a`、`generatedAt` = 2026-10-28T11:44:17Z、`outcome` = `{ ok: true, violations: 0, failures: [] }` |

**结论：G0 通过（2026-10-28）**。`M3-3` 的阻塞点由「G0 未完成 + G1 未裁定」缩减为 **仅 G1 未裁定**；G2 的判据不受 G1 裁定阻塞，可按需提前启动（门禁状态仍为「未开始」）。

## 2. axe 全矩阵读数

| 页面 | 受检元素（DOM 下界） | 规则适用节点：`button-name`（通过 / 违规） | 规则适用节点：`scrollable-region-focusable`（通过 / 违规） |
| --- | ---: | :--- | :--- |
| `/components/data-table` | 14 | 32 / 0 | 3 / 0 |
| `/components/select` | 17 | 21 / 0 | 1 / 0 |
| `/en-US/components/select` | 17 | 21 / 0 | 1 / 0 |
| `/components/showcase` | 15 | 15 / 0 | 5 / 0 |
| `/en-US/components/showcase` | 15 | 15 / 0 | 5 / 0 |

- 采集前重建产物：`pnpm docs:build` exit 0（50.87s）；报告 `distIndexMtime` = 2026-10-28T11:44:05Z。
- 报告生成于门禁状态回填**之前**；回填只触及治理 / 规划文档，矩阵内的 5 页内容未变，故不重跑 axe（回填后的 `docs:build` 仅用于保持站点产物可构建）。
- 脚本的两层抗收窄（DOM 下界 / 规则适用节点下界）在本次运行中均未触发；报告 JSON 落 `test-results/docs-axe/`（gitignored，仅原始证据，不替代退出码）。

## 3. 计算样式与视觉基线

- `pnpm capture:styles` → 349 项逐属性与冻结基线一致，0 差异（M5-4 冻结前为「36 条新增键 / 0 条既有键变化」，逐项依据见 [M5-4 记录](./2026-10-28-phase26-m5-4-button-state-feedback.md) §4）。
- `pnpm test:visual` → 33 passed，亮 / 暗 × 11 个受检面 + 形态轴扩面全部零差异；未触发重冻结。
- `pnpm test:e2e:gallery` → 13 passed（M5-2 的画廊预览区可聚焦与中英焦点环用例仍在保障范围内）。

## 4. 交付提交与记录索引

| 条目 | 提交 | 交付记录 |
| --- | --- | --- |
| M5-1 DataTable 横向滚动容器键盘可达 | `d59800a` | [M5-1 记录](./2026-10-27-phase26-m5-1-data-table-keyboard-scroll.md) |
| M5-2 中文 Select 示例可访问名 + 文档站 axe 抽检脚本 | `013b647` | [M5-2 记录](./2026-10-27-phase26-m5-2-select-example-names-docs-axe.md) |
| M5-3 英文 Select 示例可访问名 | `b021ccc` | [M5-3 记录](./2026-10-28-phase26-m5-3-select-example-names-en.md) |
| M5-4 Button hover / active 状态反馈 | `2b7af3a` | [M5-4 记录](./2026-10-28-phase26-m5-4-button-state-feedback.md) |

## 5. 未覆盖边界

- axe 的受检面固定为 **5 页 × 2 条 WCAG 规则**（`button-name` / `scrollable-region-focusable`）与单视口 1440×1000；窄屏 / 暗色的差异由专项用例承担，不宣称整站 a11y 合规。
- 未纳入 best-practice / experimental 规则（`focus-order-semantics` 对合规的可聚焦滚动容器必然命中）。
- 只测 Chromium（与画廊、视觉基线同内核）；Firefox / WebKit 未验。
- 本次未跑 `pnpm verify`、全量 `test:e2e` / `test:a11y`——这些属 **G2 质量门**的判据，不在 G0 面内。
- 品牌预设的对比度缺口未纳入 G0 证据（属 G1 第 2 档裁定范围）。

## 6. 门禁状态更新

- **G0：通过（2026-10-28）**。
- **G1：待裁定**（第 2 档「颜色角色分层与非文本对比度」的「修复 / 明确接受」二选一）；裁定完成前 `M3-3` 继续阻塞。
- 时间盒不变：目标评审 2026-11-13 / 硬截止 2026-11-27。

## 7. Review Gate

- **R1（`quick`，5 分钟时间盒）：Pass**（0 blocker / 3 warning / 3 suggest）。warning 于 F 收口闭合：W1 索引摘要复述读数（改为结论 + 记录指针）→ 已改；W2 本节仅有指路句、无轮次记录 → 本次回填；W3 `.session` 载体仍写「G0 未完成」→ 同批更新。suggest 采纳：§2 表头区分「DOM 下界」与「规则适用节点」、§1 结论句改为「G2 判据不受 G1 阻塞」、§2 补报告与产物时序说明。
- **R2（`quick` delta）：Pass**（0 blocker / 1 warning / 2 suggest）。W3 残留（`progress.next_steps` 旧文案）已于 F 收口删除，`active_plan.next_steps` 为唯一口径；suggest 采纳：本节补 R2 行、复查基线注明「不含 gitignored `.session/`」、索引指针收窄为 §2 / §3 / §5。
- **复查基线**：`2b7af3a` + 当前工作区（5 个受控文件：4 改 + 1 新增；不含 gitignored `.session/`）。
