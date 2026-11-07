# Phase 28 登记批次记录

> 创建时间：2026-11-07
> 触发：用户就[下一阶段范围评估（第十二轮）](./2026-11-07-next-stage-scope-evaluation-12.md) §3 的 D1 ~ D5 决策点裁定为 **② / ① / ① / ① / ①**。
> 依据：[规划规范 §3 / §4](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 27）+ 1 = **Phase 28**。
- **构成（5 条主线 / 8 条原子条目）**：caomei-auth 主诉求 DatePicker 范围选择 **2** + Toast 逐语气样式 **2** + DataTable 迁移适配 **2** + 图标体系调研 **1** + 发布收口 **1**；对账 **2 + 2 + 2 + 1 + 1 = 8**。
- **取向来源**：D1 ② 取 A + B + C + D + F（**E 质量收口小项不纳入**，维持 Backlog）；D2 ① 先 `range`；D3 ① 逐语气 token + 文档；D4 ① 密度 token + 选择列宽度 token + 文档；D5 ① 图标调研 = 选型对比 + 接口草案 + Backlog 拆分。
- **目标版本**：`1.2.0`（`latest` 由 `1.1.0` 前移；A / B / C 均为新增可见能力，属 SemVer `minor`；经现有 `Release` workflow + npm OIDC 发布）。
- **优先级依据**：用户 2026-11-07 指令「下阶段请优先处理 issue #28」；`#28` 的 §1 / §2 为主诉求，§4 / §5 为不阻塞的真实缺口，§3 / §6 在本阶段只补文档口径。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | DatePicker 范围选择（#28 §1） | `selectionMode?: 'single' \| 'range'`（默认 `single`，缺省路径逐值不变）；`single` 保持既有 `Date` 模型，`range` 采用 `[Date, Date]`；内部接入 Reka `RangeCalendarRoot` / `DateRangePickerRoot`；保留 `minValue` / `maxValue` / `dateFormat` / `locale` / `weekStartsOn` / `fixedWeeks` / `closeOnSelect`；`showTime` 与 range 的交互在实施批定形（不支持则文档声明）；触发按钮显示区间文本；可访问名区分开始 / 结束 | 单测覆盖受控 / 非受控、区间选择与清空、`minValue` / `maxValue` 边界、键盘；`single` 路径既有用例零改动通过；不新增破坏性 props；`multiple` 不实现 |
| **M1-2** | DatePicker 范围选择（#28 §1） | 文档 / 示例 / 基线：中英组件页「未实现」段收窄（`selectionMode` 移出，`multiple` 等保留）；range 表单示例；E2E 真实区间选择；视觉基线（range 面板亮暗）；API 基线 / 冻结面增量；迁移指南 `selection-mode` 映射 | 中英同步；`docs:check` / `check:api-surface` 通过；视觉基线按实际差异重冻结并留记录；示例可渲染 |
| **M2-1** | Toast 逐语气样式（#28 §2） | 新增 `--caomei-toast-{tone}-bg` / `-border` / `-text` / `-shadow`（`tone` = `primary` / `success` / `warning` / `danger`；`neutral` 不新增专属 token，沿用全局 `--caomei-color-*`）；默认回退到现有 `--caomei-color-*` / `--caomei-shadow-*`，**零视觉变化**；`capture:styles` 采样扩面 | 缺省 `capture:styles` 0 差异；亮暗对比度断言覆盖新增可覆盖面；token 命名与冻结面增量登记；不改变既有语气默认外观 |
| **M2-2** | Toast 逐语气样式（#28 §2） | 文档与迁移配方：组件页「样式定制」表补 4 语气 × 4 属性；中英迁移指南补「接受默认 / 薄封装 / token 覆盖」三条路径（类名、特异性、加载顺序、示例），「接受默认」为推荐 | 中英同步；每条路径有可复制示例；不虚构未实现变量；迁移指南与组件页口径一致 |
| **M3-1** | DataTable 迁移适配（#28 §4 / §5） | 新增 `--caomei-data-table-cell-padding-block` / `-cell-padding-inline` 与 `--caomei-data-table-selection-column-width` / `-selection-cell-padding-inline`；默认值 = 现值（`space-2` / `space-3` / `1%` / `space-2`）；覆盖表头 / 单元格 / 选择列 / 空态 | 缺省 `capture:styles` 0 差异；token 覆盖点逐项有断言；不新增 `size` prop；冻结面增量登记 |
| **M3-2** | DataTable 迁移适配（#28 §3 / §4 / §5 / §6） | 文档：DataTable 组件页补密度 / 选择列配方；Paginator 组件页补「自渲染报表」中英示例；全选作用域确认口径（有意差异，不改契约）；迁移指南中英同步 | 中英同步；Paginator 示例可运行；不实现 `CurrentPageReport` / `template`；不改变全选页口径 |
| **M4-1** | 图标体系调研 | 调研记录 + 接口草案 + Backlog 拆分：① 第三方接入（组件 / 字符串名 / 注册表三态，`CaomeiIcon` 适配层，向后兼容 `IconProps`）；② 内置图标替换（`@lucide/vue` 映射表与覆盖入口，29 个文件）；③ 样式预设（`--caomei-icon-size-sm/md/lg`、stroke、`currentColor`、对齐、容器联动）；④ 运行时 vs 构建期（Iconify / unplugin-icons / `@iconify-json/*`；CSP / 离线 / SSR / 体积 / Nuxt / 许可）；⑤ 下游迁移（PrimeVue `pi pi-*`、品牌 logo、自备 SVG、可访问名） | 产出治理记录（选型对比 + 推荐路径 + 接口草案 + 风险）；**零实现、零依赖引入、零 `src/**` 改动**；Backlog §1.9 回填调研结论并拆分实现候选 |
| **M5-1** | 发布收口 | `1.2.0` 经 CI 发布：`Release` workflow（semantic-release + OIDC）→ npm `latest` / tag / GitHub Release / 回推；发布后下游 compat 复验（dispatch 已等待 npm 传播）；回填版本句 / 里程碑 / 规划载体 | `latest` = `1.2.0`；tarball shasum / 解包 README / `exports` / API 差分（仅新增）通过；`v1.2.0` tag 与 GitHub Release 到位；下游 compat run 记录 revision；**前置 = M1 ~ M3 全部通过 Review Gate 与质量门 + 用户明确授权运行发布** |

## 3. 非目标（本阶段）

- 不实现 `DatePicker` 的 `multiple`（无下游用例）、`numberOfMonths` / `view` / `disabledDates` 等其他未实现项。
- 不新增 `DataTable` 的 `size` prop；不实现 `Paginator` 的 `CurrentPageReport` / `template`；不改变表头全选页口径。
- 图标体系**只调研**：不引入 `@iconify/vue` / `unplugin-icons` 等依赖，不实现适配层，不替换 `@lucide/vue`。
- 不纳入 E 质量收口小项（下游 compat 实际版本断言 / Calendar · RichTextEditor 边界对比度 / 文档站 a11y 漏检示例），维持 Backlog §1.6。
- 不做触摸目标 P1 / P2、RTL、二期语言、长尾组件；不做破坏性 API 变更；不引入 Tailwind / UnoCSS；不做文档站多版本托管；不启用 Storybook。
- 除 CI 发布提交与 tag 外不自动推送；发布与推送以用户当次明确指令为前提。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 声明「当前进行中阶段：Phase 28」+ `## Phase 28 原子条目` 段（8 行） |
| `docs/plan/roadmap.md` | 阶段表新增 Phase 28 行；§1 当前态句改为「Phase 28 已登记、目标 1.2.0」 |
| `docs/plan/backlog.md` | 移出 5 行（DatePicker 范围选择 / Toast 逐语气样式 / DataTable 密度 / DataTable 选择列宽度 / caomei-auth 迁移样式配方文档补强）；**42 → 37**（5 + 5 + 0 + 2 + 3 + 14 + 1 + 2 + 5 = 37） |
| `docs/design/governance/index.md` | 新增第十二轮评估与本记录两条索引 |
| `.session`（git-ignored） | `current_phase` / `active_plan` / `next_steps` / `decisions` 与 `runtime-state.json` 的 `plan_state` 同批同步 |

- **未移出项**：`Paginator` 页码报表候选（本阶段只补自渲染示例，不实现内建模板）、DataTable 全选契约候选（只确认有意差异）、图标体系 5 行（实现候选，待 M4-1 调研后拆分）、E 三项（未纳入本阶段）。
- **候选池计数口径**：`backlog.md` §1 由 **42 → 37**（相对 HEAD 的净变化 = **38 → 37**：§1.9 +5、`@iconify` 行并入 −1、移出 −5）；[第十二轮评估](./2026-11-07-next-stage-scope-evaluation-12.md) §1 的 42 为其产出时点值，按[规划规范 §9](../../standards/planning.md) 的点时记录口径不回改。

## 5. 风险与前置

1. **DatePicker 公开契约**：`selectionMode` 与 `modelValue` 联合类型进入冻结面；`showTime` × range 未定形，须先落设计记录再实现；缺省 `single` 路径逐值不变。
2. **Token 扩张**：Toast 4 × 4（neutral 沿用全局 token）与 DataTable 2 ~ 4 个 token 进入冻结面，须同步 `version-policy` / 冻结清单 / token 计数载体。
3. **视觉与计算样式基线**：M1-2 需新增 / 重冻结 range 面板基线；M2-1 / M3-1 默认值不变，但 `capture:styles` 采样面扩大。
4. **图标调研边界**：结论可能倾向「仅适配层 + 文档」或需要运行时依赖；调研不得直接引入依赖或改 `src/**`。
5. **发布面**：1.2.0 为 minor；API 差分应只出现新增；发布前置为用户明确授权，且需先通过质量门与 Review Gate。
6. **长期任务**：阶段收口 / 发布前的门槛复核轮（第 31 轮）须执行并留痕。

## 6. Review Gate

- **audit-depth**：`standard`（规划载体登记 + 跨载体计数 + 候选池变更，零代码改动）；时间盒 ≤ 8 分钟。
- **R1（`standard`）：`Reject`**（1 blocker / 4 warning / 3 suggest）——B1 「caomei-auth 迁移样式配方文档补强」候选未随 D3 ① / D4 ① 移出（与 M2-2 / M3-2 双载体并存，且 §1.1 引用已悬空）；W1 中英 DatePicker 组件页仍写「候选待决策」并指向已清空的 §1.1；W2 评估记录 §2 草案的 `multiple` / 路径数 / 规模与裁定不一致；W3 Backlog §1.9 写「调研中」而实际待执行；W4 Toast 取证行号（188-216 → 205-217）；S1 候选池净变化路径、S2 token 口径（neutral / 等效档位）不确定、S3 RG 待填。
- **R2（`standard` delta）：`Reject`**（1 blocker / 1 warning / 1 suggest）——W1 的修复引入 `multiple` 悬空候选指针（Backlog §1.1 已无该行）且「实现中」与 `todo.md` M1-1「待执行」矛盾；S3 的 R1 计数写「3 warning」而实列 W1 ~ W4（应为 4）；S2 的 `neutral` 口径在评估草案中仍有旧措辞。**已修**：组件页改为「`range` 已登记 Phase 28 M1-1，待执行；`multiple` 维持范围外（未立候选）」并去掉 Backlog 指针；两处 RG 计数改为 4 warning；草案 `neutral` / 风险段同步。
- **R3（`quick` delta）：`Pass`**（0 blocker / 0 warning / 0 suggest；R2 的 B1 / W1 / S1 全部关闭）。
- **复查基线**：本记录 §1 / §2 / §4；`docs/plan/todo.md` 当前状态句与条目表；`docs/plan/roadmap.md` §1 与阶段表行；`docs/plan/backlog.md` §1 逐段计数；[第十二轮评估](./2026-11-07-next-stage-scope-evaluation-12.md) §3.1 / §5；`docs/design/governance/index.md` 两条摘要。
