# Phase 18 M4-2：对比度 6 项在册缺口终局结论收口

> 创建时间：2026-10-01
> 关联条目：[待办事项](../../plan/todo.md) Phase 18 **M4-2**（组件文档与口径收口）
> 依据：用户 2026-09-30 裁定 **D7「收口为终局结论」**——维持 D4「全部维持登记（不修色）」，本阶段把候选行收敛为终局结论并落**唯一载体**，**不改任何色值**
> 前序复算：[M2 对比度与配色口径收口记录](./2026-09-28-m2-contrast-and-pairing.md) §3 / [M5-1 对比度盘点](./2026-09-28-m5-1-contrast-audit.md)
> 快照：本仓工作区（`pnpm verify` exit 0、`capture:styles` 262 项 0 差异）；**未推送**

---

## 1. 结论

- 6 项在册缺口**全部维持登记、不修色**，本批**收口为终局结论**（不再作为待决策候选跟踪）。
- **唯一载体 = 本记录**：[设计规范 §3.2](../design-spec.md) 的跟踪指针由 Backlog 改为本记录，[Backlog](../../plan/backlog.md) 无残留对比度候选行（Phase 18 登记批次已迁出）。
- **零色值变更**：`git diff -- src/styles/**` 为空；`pnpm capture:styles` **262 项 0 差异**。
- 6 项均满足可追溯要求：**复算值 + 阈值 + 结论 + 依据**（§3），复算命令见 §2。

---

## 2. 复算口径与命令（可复现）

- **公式**：WCAG 2.1 相对亮度（sRGB 通道线性化）+ 对比度 `(L_hi + 0.05) / (L_lo + 0.05)`；soft 底按 `color-mix(in srgb, <tone> 8%, transparent)` 于页面底 `--caomei-color-bg`（亮色 `#fff`）合成。
- **阈值**：正文 ≥ **4.5:1**、图形 ≥ **3:1**（[设计规范 §3.2](../design-spec.md)）。
- **本批复算**：以只读脚本按上式对 6 项逐条复算，值与 [M2 记录 §3](./2026-09-28-m2-contrast-and-pairing.md) 的 8% 口径表**逐项一致**（脚本落在仓库外 `/tmp/opencode/m4-2-contrast-recompute.mjs`，不进仓库；关键值已回写 §3）。
- **输入 token**（亮色，取证于 `src/styles/theme.css` 与 `src/styles/presets/{caomei,momei}.css`）：默认预设 `danger #dc2626` / `text-muted #6b7280`；`caomei` 预设 `danger #ef4444` / `primary-solid #e63946` / `danger-solid #b91c1c`；`momei` 预设 `primary #64748b`；页面底 `#fff`。

---

## 3. 6 项终局结论（逐条）

| # | 项 | 复算值（本批） | 阈值 | 结论 | 依据 |
|:-:|:---|:---|:-:|:---|:---|
| 1 | `caomei` 预设 `danger` `#ef4444` 作前景（纯白底） | **3.76:1** ❌ | 4.5 | **维持**（终局） | 预设品牌色不变（D2 / D4）；消费点为 soft / outline 文本；invalid 描边属图形、3:1 下达标 |
| 2 | `caomei` 预设 `danger` soft 8% 底（`#fef0f0`） | **3.39:1** ❌ | 4.5 | **维持**（终局） | 同 1（半透明底的固有边界 + 品牌色） |
| 3 | `caomei` 预设 `primary-solid` `#e63946` 配 `on-solid` 白字 | **4.17:1** ❌ | 4.5 | **维持**（终局） | 既有例外（用户决策）；实底承载白字为品牌色取舍 |
| 4 | 默认预设 soft `danger`（8% 底 `#fceeee`） | **4.28:1** ❌ | 4.5 | **维持**（终局） | 8% 公式下仍略低；不修色（D7） |
| 5 | 默认预设 soft `neutral`（8% 底 `#f3f4f5`） | **4.39:1** ❌ | 4.5 | **维持**（终局） | 同上；接近阈值但仍不达标 |
| 6 | `caomei` / `momei` 预设 primary soft（8% 底） | **3.73:1** / **4.32:1** ❌ | 4.5 | **维持**（终局） | 预设品牌色不变；与 4 / 5 同属 soft 公式的固有边界 |

- **达标对照（不属缺口）**：`caomei` 预设 `danger-solid` `#b91c1c` 配白字 **6.47:1** ✅——实底走 `-solid` 系列，与 soft / 前景用法分离。

---

## 4. 边界与不修理由（终局）

- **半透明 soft 底的固有边界**：soft 变体底为 `color-mix(in srgb, <tone> 8%, transparent)`，对比度随**宿主底**变化——在抬升面 `--caomei-color-bg-elevated` 上更低（primary 8% 约 4.34:1）。该边界由公式本身决定，非个别组件缺陷。
- **预设品牌色不变**：`caomei` / `momei` 预设的 `primary` / `danger` 为品牌取色，用户已两次裁定维持（2026-09-28 D2、2026-09-30 D4）；修色会改变既有视觉并触发 `capture:styles` 重冻结，超出本条目授权。
- **终局含义**：本记录生效后，这 6 项**不再作为待决策候选**出现在 Backlog；若将来出现新的用户裁定或下游合规要求，应作为**新条目**重新评估（本记录不承担后续跟踪）。

---

## 5. 载体与登记

- **唯一载体**：本记录；[设计规范 §3.2](../design-spec.md) 的「不在本节范围的其它缺口与例外」段改指本记录（原指向 Backlog 的跟踪表述同步收敛）。
- **Backlog 复核**：`rg -n "对比度|contrast" docs/plan/backlog.md` → **无对比度候选行**（Phase 18 登记批次已迁出 11 行，其中含 §1.6「对比度遗留项盘点」）；本批**不新增**行。
- **不改色值**：`git diff -- src/styles/` 为空；`pnpm capture:styles` **262 项 0 差异**（采样面含 `variant.{tag,message,badge}.*.soft` 的 `background-color`）。

---

## 6. 规模与质量门

- **规模**：本记录 + [设计规范 §3.2](../design-spec.md) 指针收敛 + 治理索引登记 + `todo.md` 状态回填；**零 `src/**` 改动**。
- **质量门（本批实测）**：`lint:md:check` 通过；`docs:check` 11 段链全绿；`governance:check` exit 0；`pnpm capture:styles` 262 项 0 差异；提交前复跑 `pnpm verify`。
- **V 阶段（显式跳过）**：纯文档 / 口径收口，无视觉变更。

## 7. Review Gate 结论

- **R1（第 1 轮，`standard`）`Pass`**：0 blocker / 0 warning / 2 suggest（两条均为 Pass 后动作）。本地留痕 `artifacts/review-gate/2026-10-01-phase18-m4-1-m4-2.md`。
- **审计方独立复核**（摘）：**复算 7/7 项一致**（含 soft 底 `color-mix 8%` 合成路径，底 `#fef0f0` / `#fceeee` / `#f3f4f5` 逐字节复现），并与 M2 记录 8% 口径表三方一致；`rg "待裁定|新增候选" design-spec.md` 零命中、`rg "对比度|contrast" backlog.md` 无残留候选行；`git diff --stat -- src/` 为空；`pnpm docs:check` 11 段链全绿。
- **修复点（同批收口）**：
  - **RG-S1**（§7 为占位）：本节回填即闭合。
  - **RG-S2**（`todo.md` 关联指针未回填）：Pass 后回填 `todo.md` M4-1 / M4-2 状态（同批提交）。
- **实测用时**：派发 `2026-10-01T21:37:44+08:00` → 留痕写入 `2026-10-01T21:40:01+08:00`，**≈ 2 分 17 秒**（≤ 10 分钟时间盒，未超）。
- **未覆盖边界**（采信调用方证据）：暗色场景未逐项复算（6 项均为亮色口径）；`capture:styles` 未由审计方实跑（以 `git diff -- src/` 为空作等价强约束）。

---

## 8. 边界与未取证面

- 本批**只**做结论收口：不重新裁定、不改色值、不改采样面。
- 暗色场景未逐项复算（6 项均为亮色口径；暗色下同族值见 [M2 记录 §4](./2026-09-28-m2-contrast-and-pairing.md) 的 toast 修复对照）。
- `bg-elevated` 宿主口径只作边界说明（§4），未逐项给出数值（M2 记录已给 primary 8% 约 4.34:1 的实测）。
