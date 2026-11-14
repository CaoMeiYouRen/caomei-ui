# Phase 34 登记批次

> 创建时间：2026-11-14
> 触发：用户就[下一阶段范围评估（第十八轮）](./2026-11-14-next-stage-scope-evaluation-18.md) §4 的 D0 ~ D4 作出裁定：**D0 ① 按推荐组合登记 / D1 ① U1 ~ U4 全量 / D2 ① 先评估再定 / D3 ② 本阶段不发布 / D4 ① 质量门禁两项都纳入**。
> 依据：[规划规范 §3 / §4 / §6 / §7](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体；条目粒度见 §5）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 33）+ 1 = **Phase 34**。
- **阶段名**：Tooltip 提示体系、协作测试 T3 与质量门禁。
- **构成**：**3 条主线 / 13 条原子条目**——Tooltip 提示体系 **8** + 协作测试 T3 **3** + 质量门禁与 a11y **2**；**构成对账 8 + 3 + 2 = 13**。
- **提名期标签映射**：评估期 A（Tooltip）→ M1、B（协作测试 T3）→ M2、C（质量门禁与 a11y）→ M3。
- **与裁定组合的差异（粒度拆分，不扩范围）**：D0 ① 的评估口径为「A 5 + B 3 + C 2 = 10，另 D 发布收口 1」；本阶段按用户 D3 ② **不登记发布收口**，并按[规划规范 §5](../../standards/planning.md) 粒度约束把 A 的批次细拆——按批次框架枚举 **U1 1 + U2 2 + U3 3 + U4 2 = 8**（U2 拆「P0 其余 / P0 关闭按钮」，U3 拆「icon-only 两批 / overflow 面」，U4 拆「站点与迁移 / 组件页说明」）。**交付面与评估口径一致**，仅条目切分更细。
- **候选池变化**：`backlog.md` §1 由 **27 → 24**（移出 3 行：§1.1 Tooltip 增强 1 行、§1.6 协作测试 T3 / T4 各 1 行）；§1.1 3 → 2、§1.6 12 → 10。**N1（嵌套遮罩层级评估）/ N2（`release.yml` 周回归机检）为本轮新候选、未入池即登记**（同 Phase 33 的 N1 处置）。
- **发布**：本阶段**不发布**（D3 ②：不执行 `pnpm release`、不触发 `Release`，`latest` 维持 `1.3.0`）。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | Tooltip 提示体系 | `useOverflowTooltip`（判据 `scrollWidth > clientWidth + 1`；`ResizeObserver` + `document.fonts.ready` + slot 变化重测；SSR / 水合前不显示）+ `CaomeiTooltipText` 包装（**名称定稿**，关闭分析记录 §9 的待定项）+ `tooltip` prop 契约（`boolean \| string \| { content?: string; mode?: 'auto' \| 'always' }`，`true` 取 `aria-label` / 可见文本）+ **Provider 缺失策略**（内建兜底 Provider 或列为迁移前置，先出 1 段设计结论再实现）+ **Button**（icon-only / overflow + 截断 CSS）。文件面 ≈ 8（hook 1 / 包装 1 / Button 1 / types 1 / 截断 CSS 1 / 单测 1 / 中英对照 2） | 真实 Chromium：溢出显示 / 未溢出不挂载且无 `aria-describedby` / icon-only 显示 / 接入后无原生 `title` 双提示 / 可访问名不变；`iconOnly` 无 `label` 开发期告警；`disabled` 仍可触发（外层包裹或 `as-child`）；SSR 不显示；截断属可见变更 → 视觉基线同批重冻结且 `capture:styles` 0 差异；中英文档 + API 表 |
| **M1-2** | Tooltip 提示体系 | P0 其余：Toolbar / Paginator / SplitButton 的图标触发器接入同一 `tooltip` 契约（icon-only） | 三组件真实渲染均显示；可访问名不变；无原生 `title` 残留；单测 + 中英文档 API 表 |
| **M1-3** | Tooltip 提示体系 | P0 关闭按钮：Dialog / Drawer 关闭按钮接入（icon-only，共享实现单点改） | 显示且不被 content 遮挡（与既有 `overlay-stacking` 结论一致）；Esc / 遮罩关闭行为不变；单测 + 中英文档 |
| **M1-4** | Tooltip 提示体系 | P1 icon-only 第一批（**6 个组件**，不新增公开 prop，复用 composable）：Select / MultiSelect / AutoComplete / TagsInput 清除按钮、InputNumber 步进、Password 显隐。文件面 ≈ 7（6 源文件 + 单测） | 6 个触发面逐项显示；开 / 关无几何位移；`disabled` 不触发；可访问名不变；单测 |
| **M1-5** | Tooltip 提示体系 | P1 icon-only 第二批（**7 个组件**）：Calendar 上 / 下月、FileUpload 操作按钮、ColorPicker 触发器与面板内图标按钮、DatePicker 触发器、Image 预览 / 关闭、Alert 关闭、Message 关闭。文件面 ≈ 8（7 源文件 + 单测） | 逐项显示；几何无位移；ColorPicker 面板内按钮不遮挡色板命中；单测；`capture:styles` 0 差异 |
| **M1-6** | Tooltip 提示体系 | P1 overflow 面 + 截断前提：DataTable 表头 / 单元格、Tag、Breadcrumb、Menu 长项先补 `nowrap + max-width + ellipsis` 前提样式，再接入 overflow 模式；Menu 子菜单指示器 icon-only。**只含源码与测试**（文档由 M1-8 承担），文件面 ≈ 6（4 个源文件 + 截断样式 + 单测） | 溢出显示 / 未溢出静默；截断属可见变更 → 视觉基线同批重冻结且 `capture:styles` 0 差异；四者逐项断言 |
| **M1-7** | Tooltip 提示体系 | 文档站 layout 放置 `CaomeiTooltipProvider`；中英示例；迁移说明（接入组件不再透传原生 `title`，含下游显式 `title` 的处理）；`docs/design/components.md` 能力清单标注。文件面 ≈ 8（layout 1 / 示例 2 ~ 4 / 迁移说明 1 ~ 2 / 能力清单 1） | `docs:build` + `docs:check` 全绿；示例可访问名断言；迁移说明覆盖 M1-1 ~ M1-3 的六个 P0 组件；tooltip 打开态并入 M3-1 的 axe 面 |
| **M1-8** | Tooltip 提示体系 | 组件页说明：DataTable / Tag / Breadcrumb / Menu 的中英页面补「长文本截断 + tooltip」说明（无 API 变更）；P1 icon-only 组件页不逐个改，统一在 M1-7 的指南段落说明。文件面 ≈ 8（4 组件 × 中英） | 四组中英页面同批更新（同页同节）；`docs:check:i18n-parity` / 链接检查通过；不得宣称新增 API |
| **M2-1** | 协作测试 T3 | 嵌套遮罩层级评估（**只评估**）：固定档位（overlay 1000 / content 1001）vs per-instance 层级栈；影响面 = z-index token 语义、`check:overlay-z-index`、视觉基线、a11y | 结论落治理记录并登记索引；**零代码、零 token 改动**；给出「若实现」的条目草案、影响面清单与触发条件 |
| **M2-2** | 协作测试 T3 | C7 Toast 在 Dialog 之上（探针先行）、C8 焦点陷阱 + portal 浮层、C9 CDP 触摸滚动；并入 `overlay-collaboration.e2e.ts` | 真实指针 / 真实触摸事件 + 计算样式 + 命中测试；C7 = Toast 命中且不关 Dialog；C8 = Tab 循环 + 焦点进入面板 + Shift+Tab 不逃出 + 关闭回触发器；C9 = `hasTouch` + `Input.dispatchTouchEvent` 滚动生效且不关闭 Dialog；关键用例配负向对照 |
| **M2-3** | 协作测试 T3 | C6 嵌套（Dialog 详情 → 二次确认、Drawer → Dialog）的命中、Esc 只关最上层、body 锁两层释放、焦点归还。**依赖 M2-1 结论**：结论为「维持固定档位」→ 按现状断言并记为现状契约；结论为「需实现层级栈」→ 本条目只交付用例骨架与结论，实现转下一阶段 | 断言**不得假定 z-index 递增**；命中 / Esc / 锁 / 焦点四项齐全；负向对照可判失败（注入破坏层级或锁证明判别力） |
| **M3-1** | 质量门禁与 a11y | 打开态 axe（T4）：`scripts/docs/check-docs-axe.mjs` 页面矩阵 +1（Dialog + Select 打开态）；规则白名单 `aria-hidden-focus` / `aria-dialog-name` / `aria-modal`；最小适用节点下界；打开态交互步骤 | 空清单 / 未打开 / 节点低于下界均 fail-closed；同名单测；`docs:build` 后全矩阵通过；[文档站设计](../documentation-site.md) §17 同批同步 |
| **M3-2** | 质量门禁与 a11y | `release.yml` 周回归机检（N2）：发布前置步骤查询最近一次 `regression-weekly` run 结论，非 success 或查询失败即中止；需 `actions: read` | 负向验证（伪造非 success 结论必须失败）；不改 `release.config.js`、不改变发布触发模型与发布链其余步骤；[发布指南](../../guide/release.md) §1 同批修订 |

## 3. 非目标（本阶段）

- **M1（Tooltip 提示体系）**：不纳入 P2 组件（Avatar / Badge / Stepper / Toast）；不改标题语义 `title` prop（Alert / Card / Dialog / Drawer / Message / Accordion）；不为未列入 P0 / P1 的组件补 tooltip；不采用 `v-tooltip` 指令方案（方案 C 已裁定；指令仅作后续批量迁移的可选桥，不在本阶段）。
- **M2（协作测试 T3）**：不覆盖 Popover / DropdownMenu / MultiSelect / Toast 的浮层矩阵；不在 happy-dom 做几何 / 指针断言（无布局引擎）；不修[调研](./2026-11-14-overlay-collaboration-research.md) §4.1 的两项待判定缺陷（只出评估结论）；**不实现 per-instance 层级栈**（D2 ①）。
- **M3（质量门禁与 a11y）**：不宣称「整站 a11y 合规」；不把 best-practice / experimental 规则（如 `focus-order-semantics`）纳入 axe 面；不改变 `verify` 链构成（M3-2 只在发布前置加查询）；不改 `release.config.js` 与发布触发模型。
- **发布与其他范围外**：**不发布**（D3 ②：不执行 `pnpm release`、不触发 `Release`，`latest` 维持 `1.3.0`）；不纳入 DataTable `scrollable` / 全表全选契约、长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker）、国际化二期 / RTL、`useDialog`、I5 运行时 `@iconify/vue` peer、文档站多版本托管 / Storybook / Tailwind preset、示例外链守卫扩展、ui-validator 资产 follow-up。
- **条件触发项维持不启动**：`typescript` 7、`glob` 跨 major override、`conventional-changelog` 8、CI 运行器镜像迁移检测、dev 形态 hydration 守护。
- **契约与依赖**：不做破坏性 API 变更（`tooltip` 为增量）；不新增运行时依赖；不启用自动 / 定时发布。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 声明「当前进行中阶段：Phase 34」+ `## Phase 34 原子条目`（13 行表格） |
| `docs/plan/roadmap.md` | §1 当前态句改为 Phase 34；阶段表新增 Phase 34 行（3 / 13；对账 8 + 3 + 2 = 13） |
| `docs/plan/backlog.md` | 移出 3 行（§1.1 Tooltip、§1.6 T3 / T4），候选池 **27 → 24**；N1 / N2 未入池即登记 |
| `docs/design/governance/index.md` | 新增本记录 |
| `.session`（git-ignored） | `current_phase` / `active_plan` / `next_steps` 与 `runtime_state.plan_state` 同批同步 |

## 5. 风险与前置

1. **Provider 缺失即运行时报错**：M1-1 必须先定「内建兜底 Provider」或「迁移前置」，并写进文档站与迁移说明；不得留到 M1-7 才决定。
2. **原生 `title` 剥离属行为变更**：接入组件不再透传原生 `title`，下游显式使用 `title` 的页面会失去系统提示——迁移说明须逐组件写清，并进入下一阶段的 release note。
3. **截断 CSS 改视觉**：Button / DataTable / Tag / Breadcrumb / Menu 补截断属可见变更，须同批重冻结视觉基线并核对 `capture:styles` 0 差异。
4. **溢出检测时机**：字体加载、容器 resize、slot 文本变化、`v-if` 挂载都要重测；SSR 一律不显示（服务端无布局）。
5. **`disabled` 元素不触发 pointer 事件**：Reka / Radix 已知边界，触发器可能需外层包裹或 `as-child`；不得用 `pointer-events: none` 绕过（会破坏点击拦截语义）。
6. **a11y 边界**：tooltip 不替代 `aria-label` / 可见文本；icon-only 场景 tooltip 只作视觉补充，避免与 `aria-label` 重复朗读；移动端无 hover，只在键盘 focus 出现。
7. **组件面较大**：P1 触发面按**组件个体**计 **17** 个（Select / MultiSelect / AutoComplete / TagsInput 各 1、InputNumber、Password、Calendar、FileUpload、ColorPicker、DatePicker、Image、Alert、Message，加 DataTable / Tag / Breadcrumb / Menu 的 overflow 面）——注意与调研记录按**组件行**计的口径不同；按 M1-4（6 个）/ M1-5（7 个）/ M1-6（4 个）三批交付、各自独立提交。**文件面预算**：M1-1 ≈ 8 / M1-4 ≈ 7 / M1-5 ≈ 8 / M1-6 ≈ 6 / M1-7 ≈ 8 / M1-8 ≈ 8，其余单条 ≤ 6；文档与示例分置 M1-7（站点 / 迁移）与 M1-8（组件页），避免任一单条越过 10 文件阈值；执行期若实测超阈值，按[规划规范 §5](../../standards/planning.md) 再拆并同批更新三处计数。
8. **嵌套层级评估不得顺手改 token**：`--caomei-z-overlay` / `--caomei-z-modal` 受 `check:overlay-z-index` 与视觉基线双重约束，M2-1 只出结论。
9. **C6 断言口径**：现状无 per-instance 递增，断言不得假定层级递增；若按现状断言，须以负向对照证明用例有判别力。
10. **T4 的空检查风险**：页面就绪选择器 + 「规则 × 最小适用节点数」下界 + 打开态交互断言三者缺一，规则不适用会被误判为通过。
11. **M3-2 改变发布工作流语义**：需 `actions: read` 权限；查询失败 fail-closed；不改触发模型与发布链其余步骤，且与发布指南同批修订。
12. **编号纪律**：本阶段编号已由用户 D0 ① 授权启动，取「Phase 33 + 1」= Phase 34；不预留后续编号。

## 6. Review Gate

- **audit-depth**：R1 `standard`（登记批次：规划载体 + 阶段构成 + 候选移出 + 载体同步，无代码改动，时间盒 ≤ 10 分钟）；R2 / R3 `quick`（只复查修复点，≤ 5 / ≤ 3 分钟）。
- **R1**（`standard`，实测约 8 分钟，未超时）：`Pass`（0 blocker / 1 warning / 4 suggest）。
  - warning：M1-6 预计 ≥13 文件、与「文档集中在 M1-7」矛盾 → 拆出 **M1-8**（组件页说明），M1-6 只留源码与测试，并补逐条文件面预算。
  - suggest：拆分推导改为批次框架显式等式 **U1 1 + U2 2 + U3 3 + U4 2 = 8**；`CaomeiTooltipText` 声明名称定稿；非目标按 M1 / M2 / M3 分组并带入评估记录的 M2 / M3 边界；触发面计数改为「按组件个体 17 个」并注明与调研记录按组件行计的口径差异。
- **R2**（`quick`，实测约 3 分钟，未超时）：`Reject`（1 blocker）——新增 M1-8 后 §4 载体同步表仍写「12 行 / 3 / 12；7 + 3 + 2 = 12」，与 §1 / `todo.md` / `roadmap.md` / 索引的 13 条构成两套口径 → 已改为「13 行」与「3 / 13；8 + 3 + 2 = 13」。
- **R3**（`quick`，实测约 2 分钟，未超时）：`Pass`（0 blocker / 0 warning / 0 suggest）——R2 blocker 关闭；全文无旧计数残留；`check:stage-counts` 复跑一致。
- **复查基线**：本记录 §1 ~ §5；`docs/plan/todo.md` / `roadmap.md` / `backlog.md`；`docs/design/governance/index.md` 首条摘要；`docs/design/governance/2026-11-14-next-stage-scope-evaluation-18.md` §1.4；`.session`（gitignored）。
