# M2 对比度与配色口径收口交付与验证记录（Phase 16）

> 创建时间：2026-09-28
> 条目：Phase 16 **M2-1 ~ M2-4**（对比度与配色口径收口）
> 依据：[下一阶段范围评估 §8](./2026-09-28-next-stage-scope-evaluation.md) 的 **D2**（只修**非预设** 2 项；预设 2 项维持登记）与 **D3**（toast 强调面 + switch 配对**统一**）；在册盘点见 [M5-1 对比度盘点](./2026-09-28-m5-1-contrast-audit.md) 与 [M2 一致性收口 §3](./2026-09-26-m2-style-token-consistency.md)。
> 快照：本仓 `8b24074`（M3-7 交付后）。本记录为 M2 四条目的唯一交付口径。

---

## 1. 范围与裁定

| 条目 | 动作 | 裁定 |
| :--- | :--- | :--- |
| **M2-1** | soft primary 亮色变体修复（4.37:1 < 4.5） | **修**（D2） |
| **M2-2** | toast 中性强调描边（暗色）修复（2.31:1 < 3） | **修**（D2） |
| **M2-3** | toast 描边 / 图标回退口径一致化；switch 滑块前景对齐族内契约 | **统一**（D3） |
| **M2-4** | 4 项库内缺口逐条裁定 + 恢复可检索载体行 | 记录与登记 |

- **非目标**：不修 caomei 预设 `danger`（3.76 / 3.23）与预设 `primary-solid`（4.17）——预设品牌色维持不变；不扩大为全库配色重构；不改 Reka primitive。
- **规模分摊**：本批共 16 文件 / +141 −32，按 M2-1~M2-4 四条原子条目分摊（单条目 ≤ 10 文件），符合 [规划规范 §5](../../standards/planning.md) 粒度约束。

## 2. 复算口径与可复现

- **公式**：WCAG 2.1 相对亮度（sRGB 通道线性化）+ 对比度 `(L_hi + 0.05) / (L_lo + 0.05)`；soft 底按 `color-mix(in srgb, <tone> <pct>%, transparent)` 于页面底 `--caomei-color-bg`（亮色 `#fff`）合成。
- **复现命令**（自包含，无外部依赖）：见 §3~§5 各条给出的「改前 → 改后」值；复算脚本一次性落在 `test-results/m2-contrast.mjs`（gitignored，仅辅助），关键值已回写本记录。
- **阈值**：正文 ≥ 4.5:1、图形 ≥ 3:1（[设计规范 §3.2](../design-spec.md)）。

## 3. M2-1 soft primary 亮色变体修复

- **落点**：`src/components/tag/tag.vue` / `message/message.vue` / `badge/badge.vue` 的 `--soft` 背景公式 `color-mix(in srgb, <tone> 12%, transparent)` → **8%**（三处共用公式，同步调整）。
- **改前 → 改后**（亮色，on `--caomei-color-bg` `#fff`）：

| 项 | 12% | 8% |
| :--- | :-: | :-: |
| **primary（本条目标）** | 4.37:1 ❌ | **4.65:1 ✅** |
| success | 4.27:1 | 4.51:1 |
| warning | 4.25:1 | 4.50:1 |
| danger | 4.01:1 | 4.28:1 |
| neutral | 4.16:1 | 4.39:1 |
| caomei 预设 danger soft | 3.23:1 | 3.39:1 |
| caomei 预设 primary soft | 3.52:1 | 3.73:1 |
| momei 预设 primary soft | 4.09:1 | 4.32:1 |

- **不降级核验**：所有 tone / 预设的 soft 对比度**只升不降**（底更浅 → 深色文本对比升高）；`-solid` 配对不受影响。
- **新发现（未纳入本批修复，转 §6 载体行）**：默认预设 soft `danger` 4.28:1 / `neutral` 4.39:1 与 caomei / momei 预设 primary soft 3.73:1 / 4.32:1 在 8% 下仍 < 4.5:1（M2-1 复算发现，超出 D2 授权范围）。

## 4. M2-2 toast 中性强调描边（暗色）修复

- **落点**：`src/components/toast/toast.vue` 的 `border-left` 回退色 `--caomei-color-neutral-solid` → `--caomei-color-text-muted`（与族内 `tag` / `message` / `badge` 的 `neutral` tone 取值一致）。
- **改前 → 改后**：

| 场景 | 改前（`neutral-solid #52525b`） | 改后（`text-muted`） |
| :--- | :-: | :-: |
| 暗色 on `bg-elevated #17171a`（headline 口径） | **2.31:1 ❌** | **6.98:1 ✅**（`#a1a1aa`） |
| 暗色 on `bg #0b0b0d` | 2.54:1 ❌ | 7.67:1 ✅ |
| 亮色 on `bg #fff` | 7.73:1 ✅ | 4.83:1 ✅（`#6b7280`） |

> **headline 口径说明**：条目文本的「现 2.31:1」取自 [M5-1 盘点 §2.2](./2026-09-28-m5-1-contrast-audit.md)（暗色 `bg-elevated` 场景），故本表以该口径为 headline 并并列 `bg` 口径（2.54:1，Phase 14 记录原登载值）；两口径均 < 3:1，裁定不受影响。

## 5. M2-3 回退口径与配对统一

- **toast 回退口径一致化**：`.caomei-toast__icon` 的 `color: var(--caomei-toast-accent)`（**无回退**）→ `var(--caomei-toast-accent, var(--caomei-color-text-muted))`，与 `border-left` 的同一回退表达式对齐；中性 / 未命中语气类时描边与图标同色。
- **switch 滑块前景对齐族内契约**：`src/components/switch/switch.vue` 的 `--caomei-switch-thumb-bg` 回退 `--caomei-color-bg` → **`--caomei-color-primary-foreground`**（族内 10 个自适应 `primary` 底消费点至此全部一致）。
- **数值影响**：默认主题与 caomei 预设两值相同（亮 `#fff` / 暗与 `#0b0b0d`、`#18181b` 同值）→ **零漂移**；仅 momei 预设暗色分离（`#020617` → `#000`），对比度 7.87:1 → **8.19:1**（达标，改善）。
- **文档同步**：`docs/components/switch.md`（中英）token 表 `--caomei-switch-thumb-bg` 默认值更新；`docs/components/toast.md`（中英）token 表补「描边与图标共用、`neutral` / 未命中回退 `--caomei-color-text-muted`」。
- **覆盖 M7-1 结论**：Phase 15 [M7-1 判定表](./2026-09-28-m7-1-switch-thumb-foreground-judgment.md) 曾判「维持条件触发」，D3 裁定统一后本条目实施，该表已加更新注记。

## 6. M2-4 对比度裁定记录与载体登记

- **4 项库内缺口逐条裁定**：

| # | 项 | 复算值（裁定基线） | 裁定 | 依据 |
| :-: | :--- | :--- | :--- | :--- |
| 1 | soft primary 亮色变体 | 4.37:1 → **4.65:1** | **修复** | D2；正文阈值 4.5 |
| 2 | toast 中性强调描边（暗色） | 2.31:1 → **6.98:1** | **修复** | D2；图形阈值 3 |
| 3 | caomei 预设 `danger` 作前景 | 3.76:1（白底）/ 3.39:1（8% soft） | **维持** | D2；预设品牌色不变 |
| 4 | caomei 预设 `primary-solid` | 4.17:1 | **维持** | D2；既有例外（用户决策） |

- **载体行恢复**：`backlog.md` §1.6 新增「对比度遗留项盘点（维持项 + 新增候选）」行（此前多份记录引用该载体但行已不存在——[评估记录 §6](./2026-09-28-next-stage-scope-evaluation.md) 的 C50 ② 实测发现），承载维持项 + §3 新发现候选。
- **规范同步**：[设计规范 §3.2](../design-spec.md) 改写「不在本节范围的其它缺口与例外」段——登记 2 项已修复、2 项维持、新发现候选与 calendar weekday 归因。
- **M7-1 记录同步**：加 2026-09-28 更新注记（D3 覆盖 switch 配对结论）。

## 7. V 阶段（计算样式差异逐项有据 + 重冻结）

- **M2-1 差异逐项有据**：`pnpm capture:styles` 报 **15 处差异**，逐项均为 `variant.{tag,message,badge}.{primary,success,warning,danger,neutral}.soft` 的 `background-color` alpha **0.12 → 0.08**（3 组件 × 5 tone），**无其它项**；即差异全部且仅来自 M2-1，M2-2 / M2-3（toast / switch）不在采样面内。
- **重冻结**：`pnpm capture:styles:freeze` 写入新基线（239 项，chromium 153.0.8010.12；`baseline.json` 16 行变化 = `capturedAt` + 15 条 soft 属性）；复跑 `pnpm capture:styles` **0 差异**。
- **M2-2 / M2-3 证据**：toast / switch 不在计算样式采样面，改前 / 改后值以 §4 / §5 的 WCAG 复算承载（token 级数值，非渲染属性）。

## 8. 质量门

- `pnpm verify` **exit 0**（终态复跑 **2026-09-28T21:21:54 → 21:25:42**，覆盖含 Review Gate 修复点的完整 revision）：`lint:check` / `lint:css:check` / `lint:md:check` / `typecheck` / `typecheck:docs` / `test`（**89 文件 / 1850 tests**）/ `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `docs:check:i18n-routing` / `governance:check` 全绿。
- `check:design`：通过（组件样式规则 796 / 下界 600、声明 2669 / 下界 2500；soft 公式改动未触发 G1~G6）。
- `docs:check` 10 段：integrity 266 md / links 265 md / structure 227 页 + 侧栏 6 组 47 条目 / parity 59 对 / interpolation 227 md。
- `check:governance-records`：80 记录与索引一致 / 265 md 指针无失效。
- `pnpm capture:styles`：重冻结后 **239 项 0 差异**（见 §7）。

## 9. Review Gate 记录

- **R1（第 1 轮，`standard`，时间盒 ≤ 10 分钟）：`Pass`（0 blocker / 1 warning / 4 suggest）**。实测用时上界 **≤ 4 分 06 秒**（发起 2026-09-28T21:17:33+08:00；审计返回后调用方立即进入修复、**未在返回时点单独取戳**（口径偏差），以修复完成取戳 21:21:39 为上界，含修复操作），未超时间盒。
  - 审计方独立复现：`baseline.json` diff 仅 `capturedAt` + **15 条** soft 属性（`background-color` alpha 0.12→0.08），无其它漂移；soft 公式只动 3 处、`--solid` 未受影响（剩余 `12%` 仅在 auto-complete 的 `box-shadow`，无关面）；toast 描边 / 图标回退表达式一致；switch 默认 / caomei 零漂移、momei 暗 7.87→8.19；WCAG 复算自洽（唯一不复现项 = S3）；无新依赖；编号未误入注释 / 测试名；`check:governance-records` 80 记录与索引一致；`docs:check:integrity` exit 0。
  - **W1（首次）**：`backlog.md` 载体行把 caomei danger soft 记为 3.23（改前值），与 design-spec / 记录现值 3.39 不一致 → **已同批修正**为「soft 现值 3.39:1，改前 12% 底为 3.23:1」。
  - **S2（首次）**：design-spec §3.2 缺 soft 半透明底合成口径与抬升面边界；记录 §4 headline 口径切换未披露 → **已同批修正**：design-spec 补「soft 底口径」行；记录 §4 补 headline 口径说明（2.31 取自 M5-1 的 `bg-elevated` 场景）。
  - **S3（首次）**：记录 §4 亮色改前值 7.50 不可复现（应为 **7.73**）→ **已同批修正**。
  - **S4（首次）**：`capture:styles` 采样面不含 toast / switch，回退色变化无计算样式回归保护 → **已同批登记** Backlog §1.6「计算样式采样面扩展（toast / switch 回退色）」并在 §10 记 follow-up。
  - **S5（首次）**：审计声明中「未超 §3.2 阈值」表述不精确（16 文件 > 8）→ **已同批修正**：§1 补「按 M2-1~M2-4 四条原子条目分摊、单条目 ≤10 文件」的规模分摊说明。
  - 5 条 finding 记为「**已修复未复审**」（R1 即 Pass、无 blocker，按既有惯例同批修正）。
  - **未覆盖边界（审计方声明）**：未重跑 `pnpm verify` / `capture:styles`（采信调用方声明）；未做 toast / switch 浏览器渲染取证（S4 转 follow-up）；未逐点枚举族内 10 个自适应 `primary` 底消费点（采信 M7-1 既有取证）；未写 `artifacts/review-gate/`（按调用方「只审查、不改文件」约束）。

## 10. 边界与未覆盖

- **口径边界**：soft 变体底为半透明 `color-mix(..., transparent)`，其渲染对比度取决于所在表面；本节口径为**页面底 `--caomei-color-bg`**（与在册盘点一致）。在 `--caomei-color-bg-elevated`（`#f7f7f8`）上，primary soft 8% 底为 **4.33:1**（仍 < 4.5）——属半透明底的固有边界，未纳入本批（若需在抬升面达标，须改为不透明底或另设抬升面口径）。
- 预设品牌色（caomei `danger` / `primary-solid`）维持不变，其 soft / 前景缺口按 §6 载体行跟踪。
- 未改 Reka primitive、未扩大为全库配色重构；`-solid` 配对与 `capture:styles` 其余 224 项零漂移。
- **follow-up（登记 Backlog §1.6）**：`capture:styles` 采样面（239 项）不含 toast / switch，其回退色变化（toast 描边 / 图标、switch 滑块）无计算样式回归保护，仅由 token 级复算承载；候选把二者纳入采样 fixture。
