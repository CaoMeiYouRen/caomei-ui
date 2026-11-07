# 下一阶段范围评估（第十二轮）：caomei-auth 迁移反馈收口与图标体系调研

> 创建时间：2026-11-07
> 触发：用户指令「开始下一阶段规划，下阶段请优先处理 caomei-auth 迁移反馈 #28，此外也可以加上其他合适的 backlog 条目；图标问题先进入 backlog，本阶段仅做调研」。
> 性质：**范围评估**，不构成阶段登记（[规划规范 §3 / §4](../../standards/planning.md)：阶段编号只在**授权启动**时分配）。
> 候选池现状：`backlog.md` §1 在册 **42 条**（复算式：§1.1 **9** + §1.2 **5** + §1.3 **0** + §1.4 **2** + §1.5 **3** + §1.6 **15** + §1.7 **1** + §1.8 **2** + §1.9 **5** = **42**；只计数据行，不含表头与分隔行；2026-11-07 由 38 → 42：图标体系 5 行新增、原「`@iconify/vue` 可选接入」1 行并入）。

## 1. 候选盘点

### 1.1 四源清单

| 来源 | 内容 | 数量 | 性质 |
|:---|:---|:-:|:---|
| **a. backlog 在册** | 组件增强（§1.1）；长尾组件（§1.2）；国际化（§1.4）；移动端（§1.5）；基建与治理（§1.6）；服务层（§1.7）；下游协同（§1.8）；图标体系（§1.9） | **42** | 待决策 / 条件触发 |
| **b. 下游反馈 #28** | 6 条受检项（2 主诉求 + 3 评估 + 1 确认）；已在 backlog 有落点（[2026-11-05 评估](./2026-11-05-caomei-auth-migration-feedback-evaluation.md)） | **6** | 反馈项，不重复计数 |
| **c. 用户新增方向** | 图标体系：第三方图标接入 / 内置图标替换 / 样式预设 / 字符串名与运行时 / 下游迁移指引（已登记 §1.9） | **5** | 已入候选池（含在 a 组 42 内） |
| **d. 时点事实（非候选）** | `latest = 1.1.0`；`v1.1.0` 下游 compat run `42251067161` 成功；`Release` run `42249119570` 成功 | **3** | 时点事实，不进入候选池 |

> **取证位置**：a 组 = `docs/plan/backlog.md` §1.1 ~ §1.9 数据行逐行计数；b 组 = [issue #28](https://github.com/CaoMeiYouRen/caomei-ui/issues/28) 正文；c 组 = `backlog.md` §1.9 新增 5 行；d 组 = `npm view caomei-ui dist-tags`、`gh run view 42251067161`、`gh run view 42249119570`（2026-11-07）。

### 1.2 backlog 分组与落点

| 组 | 行数 | 落点（§2 为唯一映射口径） |
|:---|:-:|:---|
| G1 组件增强（§1.1） | 9 | **A**（DatePicker 范围 1）；**B**（Toast 逐语气 1）；**C**（DataTable 密度 1 + 选择列宽度 1 + Paginator 报表 1 + 全选契约 1）；范围外 3（ColorPicker 色板导航 / DataTable 滚动高度 / Select `null` 告警） |
| G2 长尾组件（§1.2） | 5 | 范围外（Sidebar / ScrollPanel / BackTop / Rating / TimePicker 触发条件均未满足） |
| G3 不纳入自研（§1.3） | 0 | — |
| G4 国际化（§1.4） | 2 | 范围外（二期语言 / RTL 等扩容决策） |
| G5 移动端（§1.5） | 3 | 范围外（触摸目标 P1 / P2 单独立项；滚动容器键盘聚焦 / Toolbar 769–1023 档条件未满足） |
| G6 基建与治理（§1.6） | 15 | **C**（配套迁移文档 1）；**E**（下游 compat 实际版本断言 1 + Calendar / RichTextEditor 边界对比度 1 + 文档站 a11y 漏检示例 1）；范围外 11 |
| G7 服务层（§1.7） | 1 | 范围外（`useDialog` 维持候选） |
| G8 下游协同（§1.8） | 2 | 范围外（momei 根包接入待可行性；momei 侧迁移等待外部反馈） |
| G9 图标体系（§1.9） | 5 | **D**（调研，5 行合并为 1 条调研条目）；实现拆分留待调研结论 |
| **合计** | **42** | — |

> **候选覆盖声明**：42 行按能力归并为 **8 组**（9 + 5 + 0 + 2 + 3 + 15 + 1 + 2 + 5 = 42）；**逐条均有落点**——A **1** / B **1** / C **5** / D **5** / E **3** / 范围外 **27**；**无静默豁免**。
>
> **候选数 ≠ 条目数**：一个候选可拆为多个原子条目（DatePicker 范围 → A 的 2 条；Toast → B 的 2 条；DataTable 四项 → C 的 2 条）；映射以 §2 为准。

### 1.3 #28 六项逐条落点

| 反馈项 | 判定（2026-11-05 评估） | 本轮落点 |
|:---|:---|:---|
| §1 DatePicker 范围选择（主诉求） | 真实缺口；触发条件已满足（caomei-auth 1 处） | **A**（range 实现 + 文档/基线）；`multiple` 是否同批见 D2 |
| §2 Toast 逐语气样式（主诉求） | 真实缺口 + 文档缺口 | **B**（逐语气 token + 迁移配方；方案见 D3） |
| §3 Paginator 页码报表 | 条件候选（4 处，不阻塞） | **C-2**（自渲染示例文档）；不实现 `template` |
| §4 DataTable 密度 | 真实缺口 + 文档缺口（不阻塞） | **C-1**（token）+ **C-2**（配方）；形态见 D4 |
| §5 DataTable 选择列宽度 | 真实缺口（不阻塞） | **C-1**（token）+ **C-2**（接受口径） |
| §6 DataTable 表头全选作用域 | 确认项（有意差异，已文档化） | **C-2**（确认口径，不改契约） |

## 2. 主线草案（裁定前草案：6 条，符合[规划规范 §6](../../standards/planning.md) 的 3 ~ 6 条容量）

> **本节为裁定前草案**；用户裁定取 A + B + C + D + F（**5 条主线 / 8 条原子条目**，E 不纳入），见 §3.1；A-1 类型与 B-2 路径数已按裁定同步，其余条目以 [Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §2 为准。
>
> **本节是候选 → 主线的唯一映射口径**（[规划规范 §9](../../standards/planning.md)）：§1 只给来源、分组与落点，本节不重复候选清单。主线标签用 `A` ~ `F`，条目按阶段内顺序登记为 `M1` ~ `M6`（登记时按实际选取结果映射）。

| 主线 | 内容 | 条目 | 论证 |
|:---|:---|:-:|:---|
| **A caomei-auth 主诉求：DatePicker 范围选择** | `selectionMode="range"` 实现 + 文档 / 示例 / E2E / 视觉与 API 基线 | 2 | issue #28 主诉求；触发条件已满足（1 处真实用例）；Reka 提供 `RangeCalendarRoot` / `DateRangePickerRoot` 原语 |
| **B caomei-auth 主诉求：Toast 逐语气样式** | 逐语气 token（默认值不变）+ 迁移配方与文档 | 2 | issue #28 主诉求；现状仅 `--caomei-toast-accent` 可覆盖，56 个 `--p-toast-*` 无法映射 |
| **C DataTable 迁移适配** | 密度 token + 选择列宽度 token + 迁移文档（Paginator 报表 / 全选确认） | 2 | issue #28 次要项；均可页面级 CSS 承接，token 化后默认值不变 |
| **D 图标体系调研** | 第三方接入接口 / 内置图标替换 / 样式预设 / 运行时选型 / 迁移指引；只出调研与拆分 | 1 | 用户 2026-11-07 指令；图标无穷无尽，库不应内置全部；29 个 `src/**` 文件硬编码 `@lucide/vue` |
| **E 质量收口小项** | 下游 compat 实际版本断言 + Calendar / RichTextEditor 边界对比度 + 文档站 a11y 漏检示例 | 3 | 均为在册候选且可独立验收；与 A ~ C 的组件改动不冲突 |
| **F 阶段末发布 1.2.0** | 经 CI 发布（OIDC）+ 下游 compat 复验 + 规划回填 | 1 | A / B / C 均为新增可见能力（minor）；CI 发布链已于 1.1.0 验证 |

### A DatePicker 范围选择（2 条）

- **A-1 `selectionMode="range"` 实现与单测**
  - 面：`selectionMode?: 'single' | 'range'`（默认 `single`，缺省路径逐值不变）；`single` 保持现有 `Date` 模型，`range` 采用 `[Date, Date]`（空区间形态在实施批论证）；内部改用 Reka `RangeCalendarRoot` / `DateRangePickerRoot`；保留 `minValue` / `maxValue` / `dateFormat` / `locale` / `weekStartsOn` / `fixedWeeks` / `closeOnSelect` 契约；`showTime` 与 range 的交互显式定形（不支持则文档声明）；触发按钮显示区间文本；可访问名含「开始 / 结束」语义；单测覆盖受控 / 非受控、区间选择、清空、min / max 边界、键盘。
  - **现状取证**：`rg -n "selectionMode" src` → **0**（组件层无该 prop；仅在 `docs/components/date-picker.md:79` 的「未实现」段登记）；`src/components/date-picker/{date-picker,time-input}.vue` 合计 610 行；Reka UI 导出 `RangeCalendarRoot` / `DateRangePickerRoot`（`node_modules/reka-ui/dist/index.d.ts`）。
- **A-2 文档、示例、E2E 与 API / 视觉基线**
  - 面：中英组件页（「未实现」段收窄为 `multiple` 等剩余项）、示例（range 表单场景）、E2E（真实浏览器区间选择 + 清空 + 键盘）、视觉基线（range 面板亮暗）、API 基线与冻结面增量记录、迁移指南映射（PrimeVue `selection-mode`）。

### B Toast 逐语气样式（2 条）

- **B-1 逐语气 token（默认值不变）+ 对比度 / 视觉校验**
  - 面：新增 `--caomei-toast-{tone}-bg` / `-border` / `-text` / `-shadow`（`tone` = `primary` / `success` / `warning` / `danger`；`neutral` 不新增专属 token），默认回退到现有 `--caomei-color-*` / `--caomei-shadow-*`，**零视觉变化**；`capture:styles` 新增采样；对比度断言覆盖亮暗；文档「样式定制」表补全。
  - **现状取证**：`src/components/toast/toast.vue:205-217` 基类统一消费全局 token；`:where(.caomei-toast--<tone>)`（220-234）仅声明 `--caomei-toast-accent`。
- **B-2 迁移配方与文档**
  - 面：中英迁移指南补「接受默认 / 薄封装 / token 覆盖」三条路径（类名、特异性、加载顺序、示例），「接受默认」为推荐；与 B-1 的 token 路径并列说明适用场景。

### C DataTable 迁移适配（2 条）

- **C-1 密度与选择列宽度 token**
  - 面：新增 `--caomei-data-table-cell-padding-block` / `-padding-inline`（或等效密度档 token）与 `--caomei-data-table-selection-column-width` / `-selection-cell-padding-inline`；默认值 = 现值（`space-2` / `space-3` / `1%` / `space-2`），`capture:styles` 0 差异；覆盖表头 / 单元格 / 选择列 / 空态。
  - **现状取证**：`src/components/data-table/data-table.vue:1097-1100` 固定 `padding: var(--caomei-space-2) var(--caomei-space-3)`；`1163-1166` 选择列 `width: 1%` + `padding-inline: var(--caomei-space-2)`。
- **C-2 迁移文档与确认项**
  - 面：DataTable 组件页补密度 / 选择列配方；Paginator 组件页补「自渲染报表」中英示例；全选作用域确认口径（有意差异）；迁移指南中英同步。

### D 图标体系调研（1 条）

- **D-1 调研记录 + 接口草案 + backlog 拆分**
  - 面：① 第三方图标接入（组件 / 字符串名 / 注册表三态，`CaomeiIcon` 适配层，向后兼容 `IconProps`）；② 内置图标替换（`@lucide/vue` 映射表与覆盖入口，29 个文件）；③ 样式预设（`--caomei-icon-size-sm/md/lg`、stroke、`currentColor`、垂直对齐、容器尺寸联动）；④ 运行时 vs 构建期（Iconify / unplugin-icons / `@iconify-json/*`；CSP / 离线 / SSR / 体积 / Nuxt / 许可）；⑤ 下游迁移（PrimeVue `pi pi-*`、品牌 logo、自备 SVG、可访问名口径）。
  - 产出：治理记录（选型对比 + 推荐路径 + 接口草案 + 风险）+ `backlog.md` 的实现拆分；**零实现、零依赖引入**。
  - **现状取证**：`rg -l "@lucide/vue" src` → **29** 个文件；`src/icons/icon.vue` 仅接受 `Component` + `size`；`src/icons/types.ts` 的 `IconProps` 无字符串名 / 注册表；[设计规范 §2.6](../design-spec.md) 已登记规划 token `--caomei-icon-size-sm/md/lg`（未实现）。

### E 质量收口小项（3 条）

- **E-1 下游 compat 实际安装版本断言**：`downstream-compat.yml` 的 override 后断言 `caomei-ui` 解析版本 == `CAOMEI_UI_VERSION`（fail-closed），结果写 job summary；以一次真实 `workflow_dispatch` 验证。
- **E-2 Calendar / RichTextEditor 交互边界对比度**：两者加入 `test/e2e/preset-contrast.e2e.ts` 边界矩阵并按 3:1 断言；修色或留痕二选一。
- **E-3 文档站 a11y 漏检示例**：`docs/examples/input-group/with-select.vue` 补 `label`，把 `/components/input-group` 加入 `check-docs-axe` 的 `PAGES` 矩阵。

### F 阶段末发布 1.2.0（1 条）

- **F-1 经 CI 发布 1.2.0**：`Release` workflow（semantic-release + OIDC）→ npm `latest` / tag / GitHub Release / 回推；发布后下游 compat（已在 dispatch 前等待 npm 传播）；回填版本句 / 里程碑 / 规划载体。

## 3. 待决策点（D1 ~ D5）

| 编号 | 决策点 | 备选 | 推荐 |
|:---|:---|:---|:---|
| **D1** | 阶段主线组成 | ① **A + B + C + D + E + F**（6 主线 / 11 条目）② A + B + C + D + F（5 / 8）③ A + B + C + D（4 / 7，不发版）④ A + B + C + D + E（6 / 10，不发版） | **①**（#28 全落点 + 质量小项 + 1.2.0 交付） |
| **D2** | DatePicker 范围形态 | ① **先 range，`multiple` 后续** ② range + `multiple` 同批 ③ 仅文档 / 下游承接 | **①**（issue 主诉求是 range；`multiple` 无下游用例） |
| **D3** | Toast 样式路径 | ① **逐语气 token（默认值不变）+ 文档配方** ② 仅文档薄封装配方 ③ 确认「接受默认」为推荐路径 | **①**（token 化零视觉变化，下游可自行映射 56 个 `--p-toast-*`） |
| **D4** | DataTable 形态 | ① **密度 token + 选择列宽度 token + 文档** ② 密度 `size` prop + 选择列 token ③ 仅文档配方 / 接受差异 | **①**（token 改动面小、默认值不变；`size` prop 会扩公开契约） |
| **D5** | 图标调研产出 | ① **选型对比 + 接口草案 + backlog 拆分** ② 仅选型对比 ③ 调研 + 最小原型 | **①**（本阶段只调研；接口草案供下阶段直接立项） |

> **默认落定（不占决策项）**：不引入破坏性 API 变更；新增 token 默认值 = 现值（`capture:styles` / 视觉基线 0 差异）；中英文档同步；`multiple` / 触摸目标 P1 · P2 / 图标实现 / RTL / 二期语言 / 长尾组件 / Tailwind 维持范围外；发布 1.2.0 经现有 CI 发布链，推送与发布以用户当次明确指令为前提。

### 3.1 裁定结果（用户 2026-11-07）

| 编号 | 裁定 | 结论 |
|:---|:---|:---|
| **D1** | **②** | 取 **A + B + C + D + F**（5 条主线 / 8 条原子条目）；**E 质量收口小项不纳入**，三项维持 Backlog §1.6 候选 |
| **D2** | **①** | 先做 `range`，`multiple` 后续（无下游用例） |
| **D3** | **①** | Toast 新增逐语气 token（默认值不变）+ 文档配方 |
| **D4** | **①** | DataTable 新增密度 token + 选择列宽度 token + 文档 |
| **D5** | **①** | 图标调研产出 = 选型对比 + 接口草案 + Backlog 拆分（零实现、零依赖） |

## 4. 规模与风险

- **规模**：裁定前草案为 6 条主线 / **11** 条原子条目（A 2 / B 2 / C 2 / D 1 / E 3 / F 1）；**裁定后为 5 条主线 / 8 条原子条目**（E 3 条不纳入）。与 Phase 24 ~ 27 的 8 ~ 18 条同量级；预估 **3 ~ 5 个交付轮**。
- **风险**：
  1. **DatePicker 公开契约**：`selectionMode` 与 `modelValue` 联合类型进入冻结面；`showTime` × range 的交互未定形，须在 A-1 先论证并落设计记录，缺省 `single` 路径必须逐值不变。
  2. **Token 扩张**：Toast 4 × 4（neutral 沿用全局 token）与 DataTable 2 ~ 4 个 token 进入冻结面，须同步 `version-policy` / 冻结清单 / token 计数载体。
  3. **视觉基线**：A-2 的 range 面板需新增 / 重冻结基线；B / C 默认值不变但 `capture:styles` 采样面扩大。
  4. **图标调研边界**：结论可能倾向「仅适配层 + 文档」，也可能需要运行时依赖；调研不得直接引入依赖。
  5. **E-1 的运行时验证**：workflow 改动只能在真实 run 验证，须借 F-1 发布或显式 `workflow_dispatch` 取证。
  6. **发布面**：1.2.0 为 minor；API 差分应只出现新增，不得混入 breaking。
- **非目标**：`multiple`（若 D2 取 ①）、触摸目标 P1 / P2、图标实现、RTL、二期语言、长尾组件、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook、自动推送。

## 5. 登记状态

- **已登记**：按[规划规范 §4](../../standards/planning.md) 取授权时最大编号（Phase 27）+ 1 = **Phase 28**；构成 **5 条主线 / 8 条原子条目**（A 2 / B 2 / C 2 / D 1 / F 1；对账 2 + 2 + 2 + 1 + 1 = 8）。
- **唯一口径载体**：[Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §1 / §2；本记录只保留评估与裁定。
- **候选池**：**42 → 37**（移出 5 行：#28 的 DatePicker 范围 / Toast 逐语气 / DataTable 密度 / DataTable 选择列宽度 / 配套迁移文档行；E 的三项与图标实现候选保留）。
- **载体同步**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引 / `.session/` 已同批更新。

## 6. Review Gate

- **audit-depth**：`standard`（纯规划文档 + 候选池登记，零 `src/**` / 零测试 / 零配置；含跨载体计数与候选池变更）。
- **R1（`standard`）：`Reject`**（1 blocker / 4 warning / 3 suggest）——同批审计，详见 [Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §6；本记录受影响处为 §1.2 的 G6 落点与覆盖声明、§2 草案的 `multiple` / 路径数 / 规模时点、§3.1 / §5 的候选池计数（42 → 37）、B-1 的 Toast 行号。
- **R2（`standard` delta）：`Reject`**（1 blocker / 1 warning / 1 suggest）——中英 DatePicker 页的 `multiple` 候选指针悬空、「实现中」与待执行状态矛盾；RG 计数应为 4 warning；草案 `neutral` 口径残留。**已修**：组件页口径改为「`range` 已登记（待执行）/ `multiple` 范围外（未立候选）」；两处 RG 计数与草案 `neutral` 措辞同步。
- **R3（`quick` delta）：`Pass`**（0 blocker / 0 warning / 0 suggest；R2 的 B1 / W1 / S1 全部关闭）。
- **复查基线**：本记录、`docs/plan/backlog.md` §1.6 / §1.9、`docs/design/governance/index.md`。

## 7. 未覆盖边界

- **未做图标选型实测**：Iconify 运行时 / 构建期的包体、CSP、SSR、Nuxt 兼容均为待调研项，本文只登记范围与证据。
- **未做 DatePicker range 原型**：Reka `RangeCalendarRoot` 的可用性只按导出清单确认，未验证 `showTime`、`minValue` / `maxValue` 组合与现有时间输入层的兼容。
- **未复核 caomei-auth 仓库**：下游用法数沿用 issue 自述（未跨仓复核）。
- **未确定 token 命名**：Toast / DataTable 的 token 名与冻结面增量留待实施批论证。
- **未评估触摸目标 P1 / P2 与本阶段的组合**：按用户「优先 #28」口径维持范围外。
