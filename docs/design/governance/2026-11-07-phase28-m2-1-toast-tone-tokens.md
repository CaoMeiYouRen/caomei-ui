# Phase 28 M2-1 交付记录：Toast 逐语气 token

> 创建时间：2026-11-07
> 条目：M2-1「Toast 逐语气 token（默认值不变）」。
> 口径来源：[Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §2；issue [#28](https://github.com/CaoMeiYouRen/caomei-ui/issues/28) §2。

## 1. 公共钩子

新增 16 个覆盖钩子（`tone` = `primary` / `success` / `warning` / `danger`；`neutral` 不设专属钩子）：

| 钩子 | 默认回退 |
|:---|:---|
| `--caomei-toast-{tone}-bg` | `--caomei-color-bg-elevated` |
| `--caomei-toast-{tone}-border` | `--caomei-color-border` |
| `--caomei-toast-{tone}-text` | `--caomei-color-text` |
| `--caomei-toast-{tone}-shadow` | `--caomei-shadow-md` |

- 左侧强调条与图标色仍由既有 `--caomei-toast-accent` 承载（逐语气默认值不变，可按语气类覆盖）。
- 语气块用 `:where()` 只声明中间变量（`--caomei-toast-tone-{bg,border,text,shadow}`），基类以 `var(中间变量, 全局 token)` 消费：保持 0 特异性，下游单类覆盖（`.caomei-toast--success { background-color: … }`，0,1,0）继续生效；未覆盖时逐属性解析到全局 token，**零视觉变化**。
- `-border` 只接受颜色值，作用于外框三边；左侧强调条始终由 `--caomei-toast-accent` 控制，不受 `-border` 影响。
- `-text` 作用于根文本（标题及继承文本）；描述固定 `--caomei-color-text-muted`、操作按钮固定 `--caomei-color-primary-text`，不受该钩子控制（M2-2 文档需写明作用域）。

## 2. 装置与采样

- `capture:styles` 新增 4 个采样键 `toast.tokens.{primary,success,warning,danger}`：夹具静态复刻 toast 根节点并逐语气就地覆盖 4 个钩子，覆盖值使用**非 token 色**（如 primary `rgb(10, 20, 30)`），冻结读数逐项命中覆盖值且左侧强调条仍为语气色——同时证明「钩子接对」与「`-border` 不影响强调条」。采样项 **374 → 378**，既有 374 项 0 差异。
- 新增 E2E `test/e2e/toast-tone-contrast.e2e.ts`：
  1. 5 语气 × 亮 / 暗文本对比度 ≥ 4.5:1（阈值 + 0.04 裕度，按实际合成背景测量）；
  2. 逐语气默认值与全局 token 逐项一致（`background` / `border` / `text` / `shadow` 解析后比较），锁定零视觉变化。
- 夹具新增 `#toast-contrast` 与独立驱动组件 `toast-contrast-driver.vue`（5 语气常驻提示）。

## 3. 验证证据

- `pnpm lint:check` / `pnpm lint:css:check` / `pnpm typecheck` / `check:design` → exit 0。
- `pnpm vitest run src/components/toast` → exit 0；`pnpm test:a11y` → exit 0。
- `pnpm exec playwright test test/e2e/toast-tone-contrast.e2e.ts` → 三档视口全绿。
- `pnpm capture:styles` → 0 差异；`pnpm test:e2e` → 全绿（共享夹具新增常驻 provider 后的全量回归）。
- `pnpm verify` → exit 0（含 `build` / `check:build` / `docs:build` / `governance:check`）。
- 冻结面（**写录时点快照 2026-11-07**）：16 个公共钩子无默认声明，M2-2 文档披露后才进入「已披露钩子」集合；语气块新增 4 个内部中间变量（`--caomei-toast-tone-*`，有默认声明），默认声明集合 156 → 160、有效冻结面 381 → 385；M2-2 披露后实测为 **401**（160 默认声明 ∪ 307 已披露钩子，交集 66；其中 `--caomei-color-primary-text` 因在 Toast 样式小节被引用而进入披露面）。这 4 个中间变量按「有默认声明即冻结」口径计入冻结名，用途限定为组件内部解析层。复算命令见[冻结面终审记录](./2026-10-24-phase26-m1-1-freeze-final-review.md) §2.4。

## 4. Review Gate

- **audit-depth**：`standard`（组件样式 + 采样 / E2E 装置 + 夹具；无发布 / 安全面）。时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Reject`（1 blocker / 3 warning / 3 suggest）。B1 语气档位用双类直接声明属性（0,2,0）破坏下游单类覆盖 → 改为 `:where()` 只声明中间变量、基类 `var()` 消费；W2 仅 success 覆盖链无四语气断言 → 采样扩为 4 个语气、覆盖值改为非 token 色；W3 `-text` 作用域未写明 → 组件注释与记录补作用域；W4 共享夹具新增 provider 未全量取证 → `pnpm test:e2e` 全绿；S5 ~ S7 采纳。
- **R2（`standard` delta）**：`Reject`（2 blocker / 1 warning / 3 suggest）。B1 记录 §4 未回填 R1 轮次 → 本轮补齐；B2 索引摘要复述采样读数且数值错误 → 删除读数、只留结论与记录链接；W3 §3 复述门禁读数且缺 build 证据 → 改为「命令 + exit 0」并补 `pnpm verify`；S4 中间变量冻结口径 → §3 显式声明；S5 亮暗缺切换判别 → E2E 补「暗色背景 ≠ 亮色背景」断言；S6 冻结台账同步 → 归 M2-2 同批回填。
- **R3（`quick` delta）**：`Pass`（0 blocker / 0 warning / 2 suggest）。§4 轮次记录、索引行、§3 门禁口径、冻结面快照与暗色判别断言均通过；剩余建议：冻结台账 §2.4 增量行归 M2-2 同批回填，「最近轮次不得停留在待复审」的守卫建议转 follow-up。实测用时：起于 `2026-11-07T20:19:48+08:00`，返回约 `20:34`（≈15 分钟，含子代理调度等待，超 ≤5 分钟时间盒）。

