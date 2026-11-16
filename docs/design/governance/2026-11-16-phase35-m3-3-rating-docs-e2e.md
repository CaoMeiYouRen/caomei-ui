# Phase 35 M3-3：Rating 文档、示例、E2E 与视觉基线

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M3-3 行（[登记记录](./2026-11-15-phase35-registration.md)）。

## 1. 交付面（13 文件 + 2 份基线，分三批提交）

| 批 | 面 | 文件 |
|:---|:---|:---|
| A 文档与登记（10） | 组件页 | `docs/components/rating.md`、`docs/i18n/en-US/components/rating.md` |
| | 示例 | `docs/examples/rating/basic.vue`、`docs/i18n/en-US/examples/rating/basic.vue` |
| | 侧栏 | `docs/.vitepress/config.ts`（中英两处） |
| | 总览 | `docs/components/index.md`、`docs/i18n/en-US/components/index.md` |
| | 设计登记 | `docs/design/components.md`（§5）、`docs/design/documentation-site.md`（§11） |
| | 组件样式 | `src/components/rating/rating.vue`：`<style scoped>` → 命名空间块（Reka 多层 primitive 根元素无 `data-v-*`） |
| B E2E（2） | 夹具 / 用例 | `test/e2e/fixtures/app.vue`（`#rating-*` / `#ds-rating`）、`test/e2e/rating.e2e.ts` |
| C 视觉（3） | 受检面 / 基线 | `test/visual/components.visual.ts`、`test/visual/__screenshots__/components.visual.ts/rating-light.png`、`rating-dark.png` |

记录、索引与规划状态位属留痕，不计入上表。单批文件数均 ≤10（阈值见[规划规范 §5](../../standards/planning.md)）。

## 2. 决策

1. **文档结构对齐既有长尾组件页**：基础用法 → 最大分值与步进 → 只读与禁用 → 无障碍 → 样式定制 → PrimeVue 迁移 → `<ComponentApi>`；中英同节结构。
2. **迁移表按 PrimeVue `Rating` 实际 prop 映射**（`stars` → `max`、`cancel` → `clearable`），并写明内建图标可经 `provideIconOverrides()` 替换。
3. **E2E 用真实坐标覆盖半星**：第 4 颗星左 1/4 处应落到 3.5（左半切片），右 3/4 处落到 4；同时断言着色只占一格且宽度为半格。键盘用例按住方向键一小段时间再松开——primitive 在 focus 的宏任务里补 click，瞬发按键会错过该窗口。
4. **视觉基线纳入抽样集**：`ds-rating` 加进视觉受检面（下界 15 → 16），亮 / 暗两张基线本机生成并复跑 0 差异。
5. **样式改非 scoped**：`RatingItem` / `RatingItemIndicator` 的根元素由多层 primitive 渲染，scoped 属性落不到这些节点（实测 button 无 `data-v-*`），改用命名空间选择器（`.caomei-rating__*`）。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| E2E | `npx playwright test test/e2e/rating.e2e.ts` → 三视口全绿（点击 / 键盘 / 只读 / 半星） |
| 视觉 | `npx playwright test --config playwright.visual.config.ts -g rating`（生成后复跑）→ 0 差异；全量 `pnpm test:visual` 通过。基线在本机 Linux / chromium 固定环境（与 CI `ubuntu-latest` 同配置：固定字体、DPR 1、reducedMotion）生成，CI 首跑由 PR 的 Visual job 复核 |
| 文档 | `pnpm docs:build`、`pnpm docs:check`、`pnpm typecheck:docs` 通过 |
| 治理 | `pnpm governance:check` 通过（总览 / 侧栏 / §11 / §5 / 画廊 / i18n 对账全绿） |
| 质量门 | `pnpm lint:check`、`pnpm typecheck`、`lint-md` 通过 |

## 4. Review Gate

- **R1（`standard`，约 9 分钟）**：**Reject**（1 blocker / 4 warning / 3 suggest）——① 文档称「按 2.5 之前的最右一格显示并回写」，实现是按最近一格显示且不回写；② 记录未把 `rating.vue` 的样式块改动计入批次；③ 键盘用例的 80ms 需说明必要性；④ 只读点击用 `force` 判别力弱；⑤ 基线生成环境未留痕。
- **R1 处置**：中英文档改为「取最近一格展示、只影响着色与可访问名、不回写模型」；记录补 `rating.vue`（A 批 10 文件，总 13 + 2 基线）与基线环境说明；键盘用例补「只前进一格」断言；只读用例补方向键无响应；示例英文冒号改半角；删除未被样式消费的 `data-readonly`。

## 5. 遗留

本阶段 10 条原子条目随本条全部交付；不改 `latest`（1.3.0），归档评估按[规划规范 §7](../../standards/planning.md)另行发起。

## 6. 复查基线

本记录 §1 ~ §5；`docs/components/rating.md` 与英文对应页；两份示例；`docs/.vitepress/config.ts` 的中英 Rating 条目；§11 表单输入行；`test/e2e/rating.e2e.ts` 与夹具；`test/visual/components.visual.ts` 的 `ds-rating` 登记与两张基线。
