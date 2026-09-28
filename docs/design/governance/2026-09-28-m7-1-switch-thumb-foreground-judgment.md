# M7-1 条件候选判定表：switch 滑块前景配对

> **阶段**：Phase 15（治理收口深化 + 组件能力补齐 + 下游迁移护航文档）→ M7 条件候选判定表
> **依据**：[下一阶段范围评估](./2026-09-27-next-stage-scope-evaluation.md) §3 C6 / §5 D7；[待办事项](../../plan/todo.md) M7-1
> **上游发现**：[M2 样式与 token 一致性收口](./2026-09-26-m2-style-token-consistency.md) §2.2 / §7（Phase 14 M2-1，D6② 本批不修复）
> **裁定**：维持条件触发、**不纳入实现**（参考 Phase 14 M5 判定表口径）
> **快照日期**：2026-09-28
> **状态**：交付完成（零 `src/**` 改动、零 token 色值变更、零既有视觉改动）

---

## 1. 结论摘要

| 判定类别 | 数量 | 候选 |
|----------|:----:|------|
| **维持条件触发，不纳入实现** | 1 | switch 滑块前景配对（thumb 取 `--caomei-color-bg`，族内契约应为 `--caomei-color-primary-foreground`） |
| **不补（已由其它方案承接）** | 0 | — |
| **本轮升级为必须修复** | 0 | — |

**关键结论**：

1. **偏离成立，但当前无可见后果**：slider 除外，自适应 `primary` 底的族内 **10 个消费点**中 **9 个**以 `--caomei-color-primary-foreground` 承载底上内容，**switch 是唯一取 `--caomei-color-bg` 的偏离点**（枚举见 §3.1）。偏离在库内 3 套主题 × 2 态 = **6 个主题快照**中仅 **1 个**产生数值差异（momei 预设暗色 `#020617` vs `#000`），对比度 7.87:1 与 8.19:1、差 **0.32**，两者均远超图形阈值 3:1，**无 WCAG 缺口、无可见回归**。
2. **触发条件量化为可判定口径**：触发需三项同时成立——下游主题使 `primary-foreground` 与 `bg` **实质分离**、`contrast(bg, primary) < 3:1`（判据式见 §4）、**且该下游在该主题下实际渲染 `CaomeiSwitch`**。最小复现场景（亮色浅色 `primary`）实测现状路径 **1.67:1**、契约路径 **10.43:1**（§3.3）。
3. **触发要件两侧交集为空（下游只读取证）**：dependfix 实际渲染该组件（`alerts-table.vue:292`）但未覆盖 token → 两值同值、判据式不命中；momei 的运行时 token 桥接使两值在 **6/8** 预设组合下分离、极浅自定义主色（`#ffe411`）命中判据式（**1.28:1**），但 **0 处** `CaomeiSwitch` 用法（§3.5）。故**条件未成立** → **维持条件触发、不纳入实现**。
4. **0.x 冻结窗口与改动成本**：改默认回退值属渲染色值变更，须重冻结 `capture:styles` 基线，token 名称与语义属 [0.x 冻结面](../../guide/version-policy.md)；触发后的升级路径与成本见 §2 / §6。
5. **相邻项显式排除**：关闭态滑块与轨道配对、toast 强调色回退口径、`-solid` × `on-solid` 配对、momei `amber` 亮档贴近下界观察均属其它口径面，不并入本表（理由与去向见 §5）。

---

## 2. 判定表

| # | 候选 | 触发条件 | 当前取证 | 判定结论 | 升级依据（触发后评估路径） |
|:-:|:---|:---|:---|:---|:---|
| 1 | switch 滑块前景配对：thumb 取 `--caomei-color-bg` 而非 `--caomei-color-primary-foreground`（`src/components/switch/switch.vue:100`，底为 `:80-82` 的 `--caomei-switch-active-bg` → `--caomei-color-primary`） | 下游主题使 `primary-foreground` 与 `bg` 实质分离 **且** `contrast(bg, primary) < 3:1`，**且**该下游在该主题下实际渲染 `CaomeiSwitch`（三者同时成立） | ① **契约偏离**：自适应 `primary` 底的族内前景契约是 `primary-foreground`（[设计规范 §2.2](../design-spec.md)），10 个同类消费点中 9 个一致、switch 唯一偏离（§3.1）<br>② **库内数值无后果**：6 个主题快照中 5 个两值相同；momei 预设暗色分离但 7.87:1 / 8.19:1 均达标（§3.2）<br>③ **触发要件交集为空**（下游只读取证）：dependfix 有实际渲染但无 token 覆盖（两值同值）；momei 有 token 分离但 0 处 `CaomeiSwitch`（§3.5）<br>④ **改动成本**：改默认回退值 = 渲染色值变更，须重冻结 `capture:styles` 基线；token 语义属 0.x 冻结面 | **维持条件触发，不纳入实现** | ① 首选：把 `--caomei-switch-thumb-bg` 的默认回退改为 `--caomei-color-primary-foreground`（与族内 9 个消费点对齐，单点改动，须同批重冻结计算样式基线）；② 备选：为滑块补描边 / 阴影以自行定义边界（对齐 `slider` 滑块做法），属新增视觉、0.x 内优先级更低。两者均须在触发取证（下游主题快照 + 对比度复算 + 实际渲染）后交用户决策 |

---

## 3. 复算取证

### 3.1 配对契约与偏离点（族内枚举）

**契约**（[设计规范 §2.2 / §3.2](../design-spec.md)，值事实源 `src/styles/theme.css` 与 `presets/*.css`）：`-solid` 实底固定配 `--caomei-color-on-solid`；自适应 tone 底（如 `--caomei-color-primary`）配 `--caomei-color-<tone>-foreground`。**按下「自适应 `primary` 底承载内容」枚举全部消费点**（行号为 2026-09-28 快照）：

| 消费点 | 底 | 前景 | 判定 |
|:---|:---|:---|:---|
| `button/button.vue:166-167`（默认 `variant="primary"`） | `--caomei-button-bg` → `--caomei-color-primary` | `--caomei-button-fg` → `--caomei-color-primary-foreground` | 一致 |
| `calendar/calendar-view.vue:177-178`（选中日） | `--caomei-color-primary` | `--caomei-color-primary-foreground` | 一致 |
| `checkbox/checkbox.vue:172-173` + `:165` | `--caomei-checkbox-active-bg` → `--caomei-color-primary` | `--caomei-checkbox-foreground` → `--caomei-color-primary-foreground` | 一致 |
| `radio-group/radio-button.vue:107-108` + `:101` | `--caomei-radio-active-bg` → `primary` | `--caomei-radio-dot` → `primary-foreground` | 一致 |
| `paginator/paginator.vue:224-226` | `--caomei-paginator-active-bg` → `primary` | `--caomei-paginator-active-color` → `primary-foreground` | 一致 |
| `select-button/select-button.vue:203-204` | `--caomei-select-button-active-bg` → `primary` | `--caomei-select-button-active-color` → `primary-foreground` | 一致 |
| `stepper/stepper-indicator.vue:51-53` | `--caomei-stepper-active-bg` → `primary` | `--caomei-stepper-active-indicator-color` → `primary-foreground` | 一致 |
| `toggle-button/toggle-button.vue:78-80` | `--caomei-toggle-button-active-bg` → `primary` | `--caomei-toggle-button-active-color` → `primary-foreground` | 一致 |
| `toolbar/toolbar.vue:168-169` | `--caomei-toolbar-button-active-bg` → `primary` | `--caomei-toolbar-button-active-color` → `primary-foreground` | 一致 |
| `switch/switch.vue:80-82` + `:100` | `--caomei-switch-active-bg` → `primary` | `--caomei-switch-thumb-bg` → **`--caomei-color-bg`** | **偏离（族内唯一）** |

**边界说明（不构成偏离的两类）**：

- `slider/slider.vue:188-191`：滑块填充同样取 `bg`，但轨道底为 `--caomei-color-border`（非 `primary`），且滑块另有 `--caomei-slider-thumb-border`（`primary`）+ `--caomei-slider-thumb-shadow` 自行定义边界 → **非配对面**，不计入。
- `stepper/stepper-indicator.vue:43`：非激活指示器背景取 `bg`，属「面 / 表面色」用法（非底上内容）→ 非配对面。

> 结论：族内「自适应 `primary` 底 + 底上内容」的配对共 **10 个**消费点，**9 个一致、1 个偏离**（switch）。

### 3.2 全主题数值矩阵（复算）

复算口径：WCAG 2.1 相对亮度（sRGB 通道线性化 + `0.2126R + 0.7152G + 0.0722B`），对比度 `(L 亮 + 0.05) / (L 暗 + 0.05)`。**开启态轨道**取主题的 `--caomei-color-primary`（`--caomei-switch-active-bg` 的缺省回退）；**现状 thumb** = `--caomei-color-bg`，**契约 thumb** = `--caomei-color-primary-foreground`。

| 主题快照 | 轨道 `primary` | 现状 thumb（`bg`） | 契约 thumb（`primary-foreground`） | 现状对比度 | 契约对比度 | 判定 |
|:---|:---|:---|:---|:---:|:---:|:---|
| 默认主题 · 亮 | `#2563eb` | `#fff` | `#fff` | **5.17:1** | 5.17:1 | 两值相同，0 差异 |
| 默认主题 · 暗 | `#60a5fa` | `#0b0b0d` | `#0b0b0d` | **7.73:1** | 7.73:1 | 两值相同，0 差异 |
| caomei 预设 · 亮 | `#e63946` | `#fff` | `#fff` | **4.17:1** | 4.17:1 | 两值相同，0 差异 |
| caomei 预设 · 暗 | `#ff6b6b` | `#18181b` | `#18181b` | **6.38:1** | 6.38:1 | 两值相同，0 差异 |
| momei 预设 · 亮 | `#64748b` | `#fff` | `#fff` | **4.76:1** | 4.76:1 | 两值相同，0 差异 |
| momei 预设 · 暗 | `#94a3b8` | `#020617` | `#000` | **7.87:1** | 8.19:1 | **两值分离，差 0.32**（均达标） |

> **交叉校验**：默认主题亮 5.17:1 / 暗 7.73:1 与 [设计规范 §3.2](../design-spec.md) 的在册值完全一致，复算脚本口径可信。
> **阈值口径**：滑块与轨道构成**图形**配对，阈值 3:1（[设计规范 §3.2](../design-spec.md)）；6 个快照两路径均达标。

### 3.3 触发场景（最小复现）

以「下游把亮色 `primary` 自定义为浅色 `#fbbf24`，并按契约同步覆盖 `primary-foreground: #1a1a1a`，`bg` 保持 `#fff`」为例：

| 路径 | thumb 取值 | 对轨道 `#fbbf24` 的对比度 | 阈值 | 判定 |
|:---|:---|:---:|:---:|:---|
| 现状（`bg`） | `#fff` | **1.67:1** | 3:1 | ❌ 未达标 |
| 契约（`primary-foreground`） | `#1a1a1a` | **10.43:1** | 3:1 | ✅ 达标 |

> 该场景说明偏离的**后果**在于「下游把 `primary` 自定义为浅色」这一类命名主题；库内 3 套主题均不命中（§3.2），下游可达性见 §3.5。**该场景为解析复算，未经浏览器无障碍实测**，仅作触发判据的量化依据，**不登记为在册缺口**。

### 3.4 可复现口径

复算脚本（本地辅助，不入库）输入即上表 token 值；关键实现：

```js
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (hex) => { const [r, g, b] = toRgb01(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const contrast = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05) }
```

token 取值来源：`src/styles/theme.css`（`:root` 与 `:is(.dark, [data-theme='dark'])`）、`src/styles/presets/caomei.css`、`src/styles/presets/momei.css`（含 `data-scheme="auto"` 的系统跟随分支，取值与其暗色分支一致）。

### 3.5 下游可达性核对（对下游仓库只读取证，2026-09-28）

触发要件由三部分构成：**① 下游实际渲染 `CaomeiSwitch`；② 该下游主题使两值分离；③ `contrast(bg, primary) < 3:1`**。逐下游取证：

| 下游 | 快照（HEAD） | 要件 ① `CaomeiSwitch` 渲染 | 要件 ② token 覆盖 | 判定 |
|:---|:---|:---|:---|:---|
| dependfix | `5789b279` | ✅ 1 处（`apps/platform/app/pages/__migration-validation/alerts-table.vue:292`） | ❌ 无 `--caomei-color-primary` 赋值（仅消费） | 要件 ② / ③ 不成立：沿用库默认主题，两值同值 |
| momei | `be702836` | ❌ 0 处 | ✅ 运行时桥接（`styles/main.scss:488-489` / `:507`：`primary` ← `--p-primary-color`、`primary-foreground` ← `--p-primary-contrast-color`、`bg` ← `--p-surface-card`） | 要件 ① 不成立：两值分离但无实际渲染 |
| caomei-auth / rss-impact-next / afdian-linker | — | ❌ 0 处 | — | 无消费面 |

**momei 桥接的分离度复算**（`--p-primary-contrast-color` 亮 `#fff` / 暗 `#000`，geek 暗为 `#fff`，主色为 `#ffe411` 时翻转为 `#000`；`--p-surface-card` 亮取 `--p-surface-0`、暗取 `--p-surface-100` = `color-mix(surface, white 4%)`；取值口径见 `composables/use-theme.ts:67-94 / 216-221 / 248-250` 与 `styles/main.scss:12 / 17`）：

| momei 主题组合 | 轨道 `primary` | 现状 thumb（`bg`） | 契约 thumb（`pf`） | 现状对比度 | 契约对比度 | 判定 |
|:---|:---|:---|:---|:---:|:---:|:---|
| default · 亮 | `#64748b` | `#ffffff` | `#fff` | 4.76:1 | 4.76:1 | 同值 |
| default · 暗 | `#94a3b8` | `#0c1020` | `#000` | 7.37:1 | 8.19:1 | 分离，均达标 |
| green · 亮 | `#059669` | `#f0fdf4` | `#fff` | 3.60:1 | 3.77:1 | 分离，均达标 |
| green · 暗 | `#10b981` | `#0f361f` | `#000` | 5.28:1 | 8.28:1 | 分离，均达标 |
| amber · 亮 | `#d97706` | `#fffbeb` | `#fff` | **3.07:1** | 3.19:1 | 分离，**贴近 3:1 下界** |
| amber · 暗 | `#f59e0b` | `#4c230d` | `#000` | 6.29:1 | 9.78:1 | 分离，均达标 |
| geek · 亮 | `#7c3aed` | `#ffffff` | `#fff` | 5.70:1 | 5.70:1 | 同值 |
| geek · 暗 | `#a855f7` | `#0a0a0a` | `#fff` | 5.00:1 | 3.96:1 | 分离，均达标 |
| 自定义 `#ffe411` · 亮（surface `#ffffff`） | `#ffe411` | `#ffffff` | `#000` | **1.28:1** | 16.36:1 | **命中判据式（< 3:1）** |

**核对结论**：

1. 要件 ② **结构性可达**：momei 的 4 套预设 × 2 态 = 8 个主题组合中 **6 个**出现两值分离（`default · 亮` 与 `geek · 亮` 为同值）；momei 作为主力下游，其运行时桥接天然把两值指向不同来源。
2. 要件 ③ **已有可达样本**：momei 支持运行时自定义主色，其源码对 `#ffe411` 特判前景为 `#000` → 分离且判据式命中（**1.28:1**，契约路径 16.36:1）；`amber` 亮档 3.07:1 已贴近 3:1 下界。
3. 要件 ① **不成立**：momei 侧 **0 处** `CaomeiSwitch` 用法，上述分离度**尚未落到实际渲染**；dependfix 虽有渲染但未覆盖 token。三要件交集为空 → **条件未成立**，不升级为修复。
4. 上述数值登记为该条件的**第一优先取证入口**：下游出现 `CaomeiSwitch` 使用（尤其 momei 侧）或反馈「开启态滑块识别性不足」时，按 §4 取证 → §2 升级路径 → 交用户决策。
5. 本核对为**对下游仓库的只读取证**，未修改、未回写下游任何文件。

---

## 4. 触发条件量化（可判定口径）

- **判定式**：对下游主题快照（亮 / 暗两态各算），若 `contrast(var(--caomei-color-bg), var(--caomei-color-primary)) < 3:1`，则「识别性」要件成立。
- **完整触发（三要件同时成立）**：① 下游在该主题下实际渲染 `CaomeiSwitch`；② `primary-foreground` 与 `bg` 实质分离；③ 上述判定式成立。**仅有 ②③ 不构成触发**（无实际使用则无可见后果，见 §3.5）。
- **等价推导**：库内快照的 `bg` 与 `primary-foreground` 相同（5/6）时两路径同值、判定式退化为对比度达标检查（全部 ≥ 3:1）；两者分离时以判定式为准。
- **实践信号（满足其一即按触发处理并取证）**：
  1. 下游反馈「switch 开启态滑块看不清 / 与轨道糊在一起」；
  2. 下游主题把 `primary` 自定义为**相对亮度高于 `bg` 的近浅色**（浅色 `primary` + 深色 `primary-foreground` 的命名主题）；
  3. 下游主题把 `bg` 与 `primary-foreground` 拆成两套取值体系（如品牌面与页面底分离）——**momei 的运行时桥接已属此形态**（§3.5），故一旦该侧出现 `CaomeiSwitch` 用法，即按触发处理。
- **取证要求（触发后）**：下游主题快照（亮 / 暗）+ 复算值 + 实际渲染截图；再按 §2「升级依据」的两条路径择一评估，成本与收益交用户决策，**不得自行放宽**。

---

## 5. 范围边界（显式排除项）

| 相邻项 | 是否并入 | 理由与去向 |
|:---|:---:|:---|
| 关闭态滑块（=`bg`）与轨道 `--caomei-color-border` 的配对 | 否 | 属 `border` token 的**全局淡描边口径**（同为 `border` 的输入框边框、开关轨道外描边亦然），非 switch 独有；且本轮为**解析复算、未经浏览器无障碍实测**，不作缺口登记。如需处置，走对比度盘点族（[M5-1 对比度盘点](./2026-09-28-m5-1-contrast-audit.md) 口径：仅盘点登记、不改色） |
| toast 强调色回退口径不一致（描边有回退、图标无回退） | 否 | 与 C6 同批登记的**兄弟项**，已在 [Backlog §1.1](../../plan/backlog.md) 条件候选在册，触发时机互相独立 |
| `-solid` 实底 × `--caomei-color-on-solid` 五档配对 | 否 | 经 Phase 14 M2-1 复核全部一致、交叉配对禁令零违反（历史违例已在 `confirm-dialog` 局部重映射修复），属已闭环面 |
| slider 滑块填充取 `bg` | 否 | 其轨道底为 `border` 而非 `primary`，且由描边 + 阴影定义边界，**非配对面**（§3.1） |
| momei `amber` 亮档现状 3.07:1（贴近 3:1 下界） | 否 | 属**下游主题取值**而非库内 token 配对：该值 ≥ 3:1 已达标，且本轮为解析复算、未经浏览器实测。登记为观察项（§3.5）；如需改善，由下游主题侧调整 `primary` / `surface` 取值，本仓不介入 |

> 以上五类均逐条给出「为何不并入 + 去向」，无静默豁免。

---

## 6. 后续跟踪机制

- **结论与取证**落本文档；候选维持 [Backlog §1.1](../../plan/backlog.md) 的**条件候选**登记（触发后按「条件触发 → 再评估 → 决策」处理，不得自动进入当前阶段）。
- **第一优先取证入口**（触发时先查）：momei 侧 `CaomeiSwitch` 用法（当前 0 处，`be702836`）+ 其运行时主色（§3.5 已给出 8 个预设组合与极浅自定义色的复算基线）；dependfix 侧的 token 覆盖情况（当前无覆盖，`5789b279`）。
- **触发后评估路径**（二选一或组合，成本见 §2 末列）：
  1. **对齐族内契约**：`--caomei-switch-thumb-bg` 缺省回退改为 `--caomei-color-primary-foreground`；
  2. **自定边界**：为滑块补描边 / 阴影（对齐 `slider` 滑块）——属新增视觉，0.x 内优先级更低。
- **回扫节奏**：每季度或重大版本前复核 §4 三要件在当前下游主题与用法下的成立情况。
- **不纳入实现**：本轮零 `src/**` 改动、零 token 色值变更、零既有视觉改动——判定表随 Phase 15 收口归档，不进入实现代码。

---

*本文档为 Phase 15 M7-1 交付物（判定表形态，不含实现），随阶段收口归档。*
