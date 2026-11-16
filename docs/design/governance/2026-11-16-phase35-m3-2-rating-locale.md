# Phase 35 M3-2：Rating 10 语 locale 与台账

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M3-2 行（[登记记录](./2026-11-15-phase35-registration.md)）；该行已预授权「10 语同批、不按语言拆分」。

## 1. 交付面（15 文件）

| 面 | 文件 |
|:---|:---|
| 类型 | `src/locale/types.ts`：新增 `rating` 命名空间（`label` / `readonlyLabel` / `valueLabel`） |
| 文案 | `src/locale/zh-cn.ts`、`src/locale/zh-tw.ts`、`src/locale/en-us.ts`、`src/locale/ja-jp.ts`、`src/locale/ko-kr.ts`、`src/locale/es-es.ts`、`src/locale/fr-fr.ts`、`src/locale/de-de.ts`、`src/locale/ru-ru.ts`、`src/locale/pt-br.ts`：同批补齐 10 语 |
| 组件 | `src/components/rating/rating.vue`：可访问名取 `label` → 只读 / 可交互语言兜底；step 名按 `valueLabel` 插值 |
| 单测 | `src/components/rating/rating.test.ts`：兜底文案与只读文案用例，step 断言随语言模板更新 |
| 台账 | `docs/components/locale.md`、`docs/i18n/en-US/components/locale.md`：新增 `rating` 行，命名空间 / 消费组件计数同步 |

记录与规划状态位属留痕，不计入上表。**超 10 文件阈值**：登记 §5 已把「10 语同批」列为键集合守卫的硬约束（拆批会产生红态中间提交），按既有口径单批交付。

## 2. 决策

1. **只放三个键**：区域名（默认 / 只读两种）与 step 名模板。不引入「X 分 / 共 Y 分」这类完整句子模板——最大值是 prop，塞进文案会让 10 语各自维护占位符组合。
2. **只读文案通过区域名切换**：`aria-label` 取只读文案时整名替换，而不是在可交互文案后拼接「只读」，避免各语言括号 / 语序差异。
3. **step 名只保留数值**：`valueLabel` 统一为 `{value}`（10 语同一形态）。计数量词在不同语言要按单复数 / 变格变化（`1 point` vs `3 points`、`1 балл` vs `2 балла`），而 step 值可以是任意小数；只给数值避免读屏玩家听到错误变格，单位语义由评分区域名提供（与 `pagination.page` 的占位符口径同源）。
4. **属性变化不新增 prop**：`readonly` / `label` 已是 M3-1 的公开面，本条只补文案来源。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 键集合 | `node scripts/governance/check-locale-keys.mjs` → 31 命名空间 / 92 条文案，10 语键集合与占位符一致 |
| 台账 | `node scripts/governance/check-locale-ledger.mjs` → 31 命名空间；中英台账行与 `types.ts` 对账 |
| 单测 | `npx vitest run src/components/rating` → 全绿（新增兜底 / 只读文案用例） |
| 质量门 | `pnpm typecheck`、`pnpm lint:check`、`lint-md`、`docs:check:i18n-parity` 通过 |

## 4. Review Gate

- **R1（`standard`，约 8 分钟）**：**Pass**（0 blocker / 2 warning / 3 suggest）——① `valueLabel` 带计数量词时 6 语出现单复数 / 变格错误（`1 points`、`1 баллов`）；② 测试未锁定「运行期切只读」与「显式 label + 只读」的优先级。
- **R1 处置**：`valueLabel` 统一为 `{value}`（理由见 §2.3）；`accessibleName` 改 `||`（空串按无意见处理）；补「运行期切换 + 显式优先」「空串回退」两例；§3 补 i18n 对账。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| M3-3 | Rating 文档、示例、E2E 与视觉基线 | 本阶段 |

## 6. 复查基线

本记录 §1 ~ §5；`src/locale/types.ts` 的 `rating`；10 个语种文件的 `rating` 块；`rating.vue` 的 `accessibleName` / `stepLabel`；中英 `locale.md` 的 `rating` 行与两处计数。
