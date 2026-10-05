# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

当前进行中阶段：**Phase 19（设计一致性口径落地、组件文档去重与观感缺陷处置）**，2026-10-02 用户裁定 D1 ~ D13 后登记（已有最大编号 18 + 1）。**6 条主线 / 14 条原子条目**（M1 4 / M2 3 / M3 3 / M4 2 / M6 1 / M7 1）；取向为用户选定的组合 A + 组合 B + 组合 C（= M1 + M2 + M3 + M4 + M6），并经 D10 上收 M7。范围依据见[下一阶段范围评估（第三轮）](../design/governance/2026-10-02-next-stage-scope-evaluation.md) §8。**登记 = 范围授权，实施进行中**——逐条实施以用户「开工」指令为准。

## Phase 19 原子条目

| 编号 | 主线 | 原子条目 | 验收标准 | 状态 |
|------|------|----------|----------|------|
| M1-1 | 设计一致性口径裁定与守卫落地 | 依据 [Phase 18 M3-1 记录](../design/governance/2026-10-01-phase18-m3-1-design-consistency-evaluation.md) §4 逐条修正 [设计规范 §6](../design/design-spec.md) 的**措辞与计数**（D1 禁用态计数 35 / D2 `invalid` 语义 / D5 Tag 字号按档位 / D7 Card 三变体） | §6 逐条与实现一致；`docs:check` 全绿；不夹带实现变更（实现面归 M1-2） | 已完成（2026-10-02，RG `quick` Pass；D1/D2/D5/D7 措辞与计数已对齐实现） |
| M1-2 | 设计一致性口径裁定与守卫落地 | [设计规范 §6](../design/design-spec.md) 涉及的**实现对齐**（视觉变更）：D3 浮层背景 8 面 `bg` → `bg-elevated`（dialog / popover / select / multi-select / auto-complete / dropdown-menu / toast / color-picker）、D4 Popover 默认圆角 `md` → `lg`、D6 AutoComplete 面板阴影走 `--caomei-shadow-md` | 三处实现与 §6 一致；`capture:styles` 重冻结后 0 差异；**涉及渲染走 `@ui-validator`**；`check:design` 全绿 | 已完成（2026-10-05 闭环：实现 `89c4d82`，D3 原定 8 面 + 同批随 §6 扩写的 ConfirmDialog / Drawer / DatePicker，共 **11 处**浮层面板背景 `bg` → `bg-elevated`，Popover 圆角 `lg`、AutoComplete / DatePicker 阴影 token 化；`capture:styles` 262 项 0 差异、`check:design` 全绿；V 阶段真实 Chromium **44 / 44 通过**、负向对照 **11 / 11 失败**，见[治理记录](../design/governance/2026-10-05-phase19-m1-2-visual-alignment.md)） |
| M1-3 | 设计一致性口径裁定与守卫落地 | 按 M3-1 记录 §5 落地 **P1 + P2 装置**：capture 扩采样 5 项（`button--rounded` / `split-button.*` / `calendar.*` / `color-picker.*` / `card.*` 等）+ 声明层契约 3 项（CheckboxGroup 禁用态不声明 `opacity` / DataView 根规则不声明 `padding`·`background` / invalid 态不得以色值类表达）+ capture 2 项；并**固化 M1-2 的浮层面板背景**（Dialog / ConfirmDialog / Drawer / Popover / DropdownMenu / Select / MultiSelect / AutoComplete / DatePicker / ColorPicker / Toast 的 `backgroundColor`）、**Popover 面板圆角**与 **AutoComplete / DatePicker 面板阴影**的 capture 采样项 | 新增断言逐项有负向对照；`capture:styles` 复跑 0 差异；接入 `governance:check` 或显式声明仅告警；M1-2 的视觉契约不再只靠一次性 V 阶段 | 已完成（2026-10-05，三子批全部交付：3a 浮层视觉契约固化 262 → 270；3b §5 P1 + 登记点名项 270 → 297；3c 声明层契约 3 项 + checkbox 297 → 302。负向对照逐组命中、`capture:styles` **302 项 0 差异**；浮层视觉契约已由 capture 常驻，见[3a 记录](../design/governance/2026-10-05-phase19-m1-3a-panel-visual-contract.md) / [3b 记录](../design/governance/2026-10-05-phase19-m1-3b-capture-p1-extension.md) / [3c 记录](../design/governance/2026-10-05-phase19-m1-3c-declaration-contracts.md)） |
| M1-4 | 设计一致性口径裁定与守卫落地 | 按 M3-1 记录 §5 落地 **P3 几何 / 交互层装置**（禁用态尺寸不变 / 焦点可见扩面 / Drawer `90vw`·`90vh` 收敛 / Password 强度条等，视容量取舍） | 逐项具可判定判别力；不引入 flaky；视容量可拆分为后续批次并显式声明 | 已完成（2026-10-05：禁用态尺寸不变（7 组件对）+ Button 角标外扩 + Drawer 90vw·90vh 收敛 + Drawer reduced-motion + 焦点可见扩面（5 组件）；新增 54 例常驻 E2E、全量 **186 passed**、`capture:styles` 302 项 0 差异；**发现并修复 Drawer reduced-motion 特异性缺陷**；容量取舍项已显式声明，见[记录](../design/governance/2026-10-05-phase19-m1-4-geometry-interaction-devices.md)） |
| M2-1 | 组件文档一致性整改（迁移映射去重） | 批 1：删除 `color-picker` / `date-picker` 中英页中段 `> 迁移映射` 正文块，独有内容折入末尾迁移节 | 独有信息无丢失（删除前后信息集合一致并留痕）；中英同批；`docs:check` 全绿 | 已完成（2026-10-05：中英 4 页删除；ColorPicker 纯冗余、DatePicker 折入 `selectionMode` 零用量语义；复算中英命中整改前 6 / 消除 2 / 当前 4；见[记录](../design/governance/2026-10-05-phase19-m2-1-migration-dedup-batch1.md)） |
| M2-2 | 组件文档一致性整改（迁移映射去重） | 批 2：删除 `drawer` / `message` 中英页中段 `> 迁移映射` 正文块，独有内容折入末尾迁移节 | 同上 | 已完成（2026-10-05：中英 4 页删除；Drawer 折入 `#footer` 映射与零下游用量判据、Message 折入有损近似；复算批前 4 / 消除 2 / 当前 2；见[记录](../design/governance/2026-10-05-phase19-m2-2-migration-dedup-batch2.md)） |
| M2-3 | 组件文档一致性整改（迁移映射去重） | 批 3：删除 `split-button` / `tag` 中英页中段 `> 迁移映射` 正文块；同批核对 Backlog §1.6 该行与中英结构断言（N2：**该候选行已随 Phase 19 登记批次迁出候选池，无残留行可修正**；以 M2 三批记录为终态载体，实测整改前中英各 6、两语均含 `date-picker`） | 独有信息无丢失；Backlog 行口径与实测一致（该行已迁出，子项不再适用）；`docs:check` 全绿 | 已完成（2026-10-05：中英 4 页删除；SplitButton 折入未实现括注、Tag 折入 `info → primary` / `error` 零用量 / `outlined` prop / §9 未决项指针；复算批前 2 / 消除 2 / 当前 0，M2 终态中英各 0；见[记录](../design/governance/2026-10-05-phase19-m2-3-migration-dedup-batch3.md)） |
| M3-1 | 组件观感缺陷处置 | **Tab 激活指示条被容器裁剪修复**（视觉变更）：由「1px 主色 + 1px 分隔线」恢复设计意图「2px 主色、分隔线被盖住」（候选：列表补 `padding-bottom: 1px` + 分隔线改内边距盒底边背景线；或指示条改 `box-shadow: inset`） | 真实 Chromium 逐行像素前后对照留痕；`capture:styles` 重冻结后 0 差异（当前采样面不含 Tabs，须显式声明）；**走 `@ui-validator`** | 待开工 |
| M3-2 | 组件观感缺陷处置 | **RichTextEditor 工具栏下拉留白**：按 D4 取**文档站作用域隔离**（收窄文档站 `.vp-doc` 正文列表样式对第三方内核浮层的泄漏），不改组件库 `src/**` | 文档站实测留白消除；组件库零 `src/**` 改动；其他代码块 / 列表渲染无回归；`docs:build` 全绿 | 待开工 |
| M3-3 | 组件观感缺陷处置 | **Button `iconOnly` 示例形态**：按 D6 改示例（图标改走 `#icon` 插槽），组件契约不变；中英示例同批 | 文档站「纯图标按钮」节不再渲染空白方块；不改单测 / `types.ts` JSDoc / 组件语义；`docs:check` 全绿 | 待开工 |
| M4-1 | 治理约束载体落地 | 在 `todo-manager` skill 的 Session 收尾协议中把「阶段登记 / 归档 / 范围变更批次」显式列为 `.session` 阶段态**必同步触发点**（约束载体候选，已 3 次复发 warning） | skill 可被 Review Gate 引用；`ai:check` / `governance:check` 全绿；不为 git-ignored 载体新增机检守卫 | 待开工 |
| M4-2 | 治理约束载体落地 | 把「`todo.md` 完成态回填不得早于 Review Gate 结论、两者同批落地后方可提交」固化到 `todo-manager` skill 或 [规划规范 §3.8](../standards/planning.md)（已 2 次判定） | 约束载体落地并可被 Review Gate 引用；不重复重述既有规则 | 待开工 |
| M6-1 | 下游协同口径消缺 | 按 dependfix 实测（`apps/platform` 已为 `caomei-ui@0.5.0`、M34.2 / M34 于 2026-10-01 归档）重写 [Backlog](./backlog.md) §1.8「下游 0.5.0 升级护航」行（**就地重写、不迁出候选池**：dependfix 侧已消费 / momei 侧仍锁 `0.3.0` 待升级），并回扫同类版本口径表述 | 逐载体 `rg` 复核旧口径零残留；口径与两仓 `package.json` 实测一致；`governance:check` 全绿 | 待开工 |
| M7-1 | 国际化调研 | 调研主流组件库（Vue / React 生态）的国际化语言覆盖范围，校准本库语言矩阵长期边界；并调研国际化文案的**分包与体积膨胀**问题与可行工程方案（只调研、不承诺实现） | 结论有可复现取证入口与来源分级（L1 官方优先）；不改代码；产出治理记录并登记索引 | 待开工 |

> **非目标**：不启动 Phase 8（D8 继续等待）；不做组件增强与长尾（D12 全部维持条件触发）；不做国际化实现 / RTL（D10 仅调研）；不改品牌色值；不做破坏性 API 变更；不重写任何下游仓库；不新增本阶段发布条目（D13 按需）；不引入 Tailwind / UnoCSS。

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。

- **未启动阶段**：**Phase 8（下游兼容性回归机制）**——前置第三项「下游稳定使用窗口」仍未成形（dependfix 刚于 2026-10-01 完成 `0.3.0 → 0.5.0` 升级、窗口不足 1 天，momei 仍锁 `0.3.0` 且处于第六十八阶段迁移实施期），维持暂不启动（用户 2026-10-02 D8）；启动前范围须单独评估并登记。范围见[路线图](./roadmap.md)。
- **等待外部反馈**：dependfix `apps/platform`（已升级至 `0.5.0`，M34 归档）与 momei 第六十八阶段的迁移由对应仓库执行、本仓等待反馈；两仓当前均无未回传本仓的新反馈。
- **条件触发候选**（触发后按「条件触发 → 再评估 → 决策」处理，不自动进入阶段）：组件增强与长尾（ColorPicker 色板导航 / DatePicker 范围选择 / DataTable 滚动高度 / Paginator 页码报表 / `Select` `null` 开发期告警 / Sidebar / ScrollPanel）、a11y 同类悬空引用与 Toast 焦点哨兵、文档站多版本托管 / 视觉回归基线 / 浮层交互 E2E 规格等长投项、语言矩阵长期与 RTL、locale 组织治理、`@iconify/vue` 可选接入、治理索引计数对账守卫等；逐条触发条件、复算值与取证入口见 [Backlog](./backlog.md)。
- **已发布版本的缺陷状态**：0.5.0 为 registry `latest`（2026-09-30 发布），已含模态内浮层被遮挡的修复；0.4.0 及更早版本仍含该缺陷。**git 侧提交与 tag 均已推送**（`origin/master` = 本地 HEAD、远端 `v0.1.0` ~ `v0.5.0` 5 个 tag，2026-10-02 D11 授权执行）。
- **长期任务待执行批次**：见[长期任务](./recurring.md) §2（第 20 轮门槛复核：两组任务均无待执行批次；条件触发 1 项与已判定不纳入 5 项维持）。
- **未纳入任何阶段的候选**：见 [Backlog](./backlog.md)（组件增强、长尾组件、国际化与 RTL、移动端与响应式、基建与治理、服务层、下游协同等分组）。
- **已完成阶段的遗留项与已知偏差**：见[待办归档](./todo-archive.md)各归档块（含[深度归档](./archive/)）的「遗留与后续候选」与「已知观察」段，其中仍待决策者已在 [Backlog](./backlog.md) 在册。
