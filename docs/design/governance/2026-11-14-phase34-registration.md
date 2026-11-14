# Phase 34 登记批次

> 创建时间：2026-11-14
> 触发：用户就[下一阶段范围评估（第十八轮）](./2026-11-14-next-stage-scope-evaluation-18.md) §4 的 D0 ~ D4 作出裁定：**D0 ① 按推荐组合登记 / D1 ① U1 ~ U4 全量 / D2 ① 先评估再定 / D3 ② 本阶段不发布 / D4 ① 质量门禁两项都纳入**；**同日再就增补主线包作出裁定：追加 A（DataTable 数据面）+ B（长尾组件）**，见 §1「执行期追加」条。
> 依据：[规划规范 §3 / §4 / §6 / §7](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体；条目粒度见 §5）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 33）+ 1 = **Phase 34**。
- **阶段名**：Tooltip 提示体系、协作测试 T3、质量门禁、DataTable 数据面与长尾组件。
- **构成（原登记 3 条主线 / 13 条原子条目；2026-11-14 用户追加 A + B 后为 5 条主线 / 20 条原子条目）**：Tooltip 提示体系 **8** + 协作测试 T3 **3** + 质量门禁与 a11y **2** + DataTable 数据面 **2** + 长尾组件 **5**；**构成对账 8 + 3 + 2 + 2 + 5 = 20**。
- **提名期标签映射**：评估期 A（Tooltip）→ M1、B（协作测试 T3）→ M2、C（质量门禁与 a11y）→ M3；2026-11-14 追加裁定 **A（DataTable 数据面）→ M4**、**B（长尾组件）→ M5**（本次追加的 A / B 指「增补主线包」，与评估期 A / B 同名但不同物，编号以本条为准）。
- **与裁定组合的差异（粒度拆分，不扩范围）**：D0 ① 的评估口径为「A 5 + B 3 + C 2 = 10，另 D 发布收口 1」；本阶段按用户 D3 ② **不登记发布收口**，并按[规划规范 §5](../../standards/planning.md) 粒度约束把 A 的批次细拆——按批次框架枚举 **U1 1 + U2 2 + U3 3 + U4 2 = 8**（U2 拆「P0 其余 / P0 关闭按钮」，U3 拆「icon-only 两批 / overflow 面」，U4 拆「站点与迁移 / 组件页说明」）。**交付面与评估口径一致**，仅条目切分更细。追加的 M4 / M5 见 §2 与 §5 第 15 条。
- **候选池变化**：`backlog.md` §1 由 **27 → 24**（首次登记移出 3 行：§1.1 Tooltip 增强 1 行、§1.6 协作测试 T3 / T4 各 1 行；§1.1 3 → 2、§1.6 12 → 10）；**2026-11-14 追加裁定后再移出 4 行**（§1.1 DataTable `scrollable` / 全表全选 2 行、§1.2 BackTop / TimePicker 2 行），**24 → 20**（§1.1 2 → 0、§1.2 5 → 3）。**N1（嵌套遮罩层级评估）/ N2（`release.yml` 周回归机检）为本轮新候选、未入池即登记**（同 Phase 33 的 N1 处置）。
- **触发条件覆盖记录**：DataTable 两项原为「条件候选」（触发条件 = 出现原生容器无法覆盖的用例 / 真实下游需求），BackTop 与 TimePicker 原为「触发条件 = 下游迁移排期出现」；四项均由 **2026-11-14 用户追加裁定**覆盖后纳入，原判定与理由保留在 [Backlog](../../plan/backlog.md) 的历史版本与第十八轮评估 §2。
- **执行期追加（2026-11-14，登记同日）**：用户指令「调整一下，再增加 1~2 个主线」并选定 **A DataTable 数据面 + B 长尾组件** → 追加 **2 条主线 / 7 条原子条目**（M4 2 + M5 5）。该追加**覆盖**第十八轮评估的两项建议——评估 §2 将 DataTable `scrollable` / 全表全选与长尾组件标为「维持（条件触发 / 无真实用例）」，评估 §3 亦列为「不建议」；覆盖依据为用户本次显式裁定，原判定与理由保留在评估记录（点时快照）。追加后构成见上条，非目标与风险见 §3 / §5；**发布口径不变**（仍不发布）。
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
| **M4-1** | DataTable 数据面 | `scrollable` / `scrollHeight`：固定表头 + 自适应高度容器（`scrollHeight` 数值归一化为 px），表体滚动、表头吸顶；不改分页 / 分组 / 展开的既有语义。文件面 ≈ 9（组件 / types / 样式 / 单测 / E2E / 中英文档 / 示例） | 真实 Chromium：容器高度生效、表头固定、可滚动且行可达；分组 / 展开 / 排序 / 分页不回归；`lazy` 行为不变；`scrollHeight` 为 `number` / 字符串两态归一化；无 prop 时零行为变更；`capture:styles` 0 差异（新增示例基线除外）；中英文档 + API 差分 |
| **M4-2** | DataTable 数据面 | 全表 / 服务端全选契约：新增 `selectAllScope: 'page' \| 'all'`（**默认 `page`，保持现状**）；全选只发 `update:selection`，受控 `selection` 优先；`lazy` 服务端模式**不推断全量**，只发全选事件 / 不清空未加载项。文件面 ≈ 8（组件 / types / 单测 / 中英文档 / 设计规范 / 迁移说明） | 默认 `page` 下与现状逐项等价（既有用例不改）；`all` 下按当前 `rows` 计算并尊重受控值；`lazy` 下不越权清空；单测覆盖三态；中英文档与设计规范同批；无破坏性 API |
| **M5-1** | 长尾组件 | BackTop 实现与导出：滚动监听（window 或指定容器）、阈值、平滑滚动、reduced-motion 兜底、SSR 安全；新增 `src/components/back-top` 及 `src/index.ts` / `src/nuxt/components.ts` / resolver 登记；含行为单测。文件面 ≈ 7 | 可独立导入与自动导入；单测覆盖阈值 / 显示隐藏 / 回顶调用；`prefers-reduced-motion` 下无平滑动画；SSR 无 `window` 报错 |
| **M5-2** | 长尾组件 | TimePicker 实现与导出：封装 Reka `TimeField`（时 / 分 / 秒精度、12 / 24 小时、步进、禁用时刻、`v-model`）；新增 `src/components/time-picker` 及导出链；含行为单测。文件面 ≈ 7 | 可独立导入与自动导入；单测覆盖精度 / 步进 / 禁用 / 12·24 小时切换；与 DatePicker 时间输入行为对齐（不预抽取共享逻辑） |
| **M5-3** | 长尾组件 | 两组件 **10 语** locale 键（BackTop 可访问名；TimePicker 时 / 分 / 秒与 AM / PM 等）+ locale 台账与键集合守卫基线。文件面 ≈ 12（10 语各 1 文件 + 中英台账 2 页） | 10 语键集合一致（`check:locale-keys` / `check:locale-ledger` 通过，语种下界以 `CaomeiLocale` 联合为准）；台账计数与实际键一致；无硬编码可见文案。**单批交付**：键集合守卫要求 10 语同批一致，按语言拆分会产生不可绿中间态 |
| **M5-4** | 长尾组件 | BackTop 文档与测试 + **两组件目录登记**：BackTop 中英组件页与示例、E2E（显隐与回顶）、视觉基线；`docs/design/components.md`、文档站 §11、侧栏 / 总览 / 画廊两组件登记（同一批文件，不额外计文件）。文件面 ≈ 9 + 基线 PNG | `docs:build` 与 `docs:check` 全绿；`check:design-catalog` / `check:components-overview` 对账通过；E2E 断言显隐与回顶；视觉基线同批冻结；中英页面同节 |
| **M5-5** | 长尾组件 | TimePicker 文档与测试：中英组件页、示例、E2E（展开、选择、`v-model`、12 / 24 小时）与视觉基线。文件面 ≈ 6 + 基线 PNG | 文档与示例可构建；E2E 覆盖选择与键盘操作；视觉基线同批冻结；中英页面同节；无 API 表缺项 |

## 3. 非目标（本阶段）

- **M1（Tooltip 提示体系）**：不纳入 P2 组件（Avatar / Badge / Stepper / Toast）；不改标题语义 `title` prop（Alert / Card / Dialog / Drawer / Message / Accordion）；不为未列入 P0 / P1 的组件补 tooltip；不采用 `v-tooltip` 指令方案（方案 C 已裁定；指令仅作后续批量迁移的可选桥，不在本阶段）。
- **M2（协作测试 T3）**：不覆盖 Popover / DropdownMenu / MultiSelect / Toast 的浮层矩阵；不在 happy-dom 做几何 / 指针断言（无布局引擎）；不修[调研](./2026-11-14-overlay-collaboration-research.md) §4.1 的两项待判定缺陷（只出评估结论）；**不实现 per-instance 层级栈**（D2 ①）。
- **M3（质量门禁与 a11y）**：不宣称「整站 a11y 合规」；不把 best-practice / experimental 规则（如 `focus-order-semantics`）纳入 axe 面；不改变 `verify` 链构成（M3-2 只在发布前置加查询）；不改 `release.config.js` 与发布触发模型。
- **M4（DataTable 数据面）**：不做虚拟滚动、列固定 / 列宽拖拽；不改变默认全选作用域（`selectAllScope` 默认 `page`）；不为服务端全选新增请求编排（父级负责数据）。
- **M5（长尾组件）**：TimePicker 不含范围选择（`TimeRange`）与时区转换；BackTop 不做滚动进度环等附加形态；Sidebar / ScrollPanel / Rating 不纳入（Sidebar 由 Drawer 承接、Rating 仅有 Vue2 参考）。
- **发布与其他范围外**：**不发布**（D3 ②：不执行 `pnpm release`、不触发 `Release`，`latest` 维持 `1.3.0`）；不纳入长尾组件 Sidebar / ScrollPanel / Rating、国际化二期 / RTL、`useDialog`、I5 运行时 `@iconify/vue` peer、文档站多版本托管 / Storybook / Tailwind preset、示例外链守卫扩展、ui-validator 资产 follow-up。
- **条件触发项维持不启动**：`typescript` 7、`glob` 跨 major override、`conventional-changelog` 8、CI 运行器镜像迁移检测、dev 形态 hydration 守护。
- **契约与依赖**：不做破坏性 API 变更（`tooltip` 为增量）；不新增运行时依赖；不启用自动 / 定时发布。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 声明「当前进行中阶段：Phase 34」+ `## Phase 34 原子条目`（**20 行表格**；原登记 13 行，2026-11-14 追加 7 行） |
| `docs/plan/roadmap.md` | §1 当前态句改为 Phase 34；阶段表新增 Phase 34 行（**5 / 20；对账 8 + 3 + 2 + 2 + 5 = 20**；原登记 3 / 13、8 + 3 + 2 = 13） |
| `docs/plan/backlog.md` | 移出 **7 行**（首次 3 行：§1.1 Tooltip、§1.6 T3 / T4；追加 4 行：§1.1 DataTable 两项、§1.2 BackTop / TimePicker），候选池 **27 → 24 → 20**；§1.1 3 → 0、§1.2 5 → 3、§1.6 12 → 10；N1 / N2 未入池即登记 |
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
13. **M4-1 的层叠与归一化**：固定表头依赖外层高度 + `position: sticky`，须确认与分组行 / 展开行 / 空态的层叠关系，避免表头覆盖浮层；`scrollHeight` 的 `number` → px、非法值忽略须有单测。**跨条目交互**：M1-6 给 DataTable 表头接入 overflow tooltip、M4-1 让表头吸顶——同一元素的层叠与浮层定位须同批复核（M4-1 执行时回归表头 tooltip 的定位与遮挡）。
14. **M4-2 的语义边界**：`lazy` 下「全选」只表达意图（事件），不得在本地补全未加载行；受控 `selection` 优先于内部推导；默认 `page` 必须与现状逐项等价（既有用例零改动）。
15. **M5 的固定载体面**：新组件的固有载体（源码 / 导出与自动导入 / 10 语 locale / 中英文档 / 示例 / 目录与画廊 / 单测 / E2E / 基线）必然跨多文件，故按「BackTop 实现 / TimePicker 实现 / 10 语 locale / BackTop 文档与测试 / TimePicker 文档与测试」拆 5 条；locale 条 12 文件属**固定载体**（10 语各 1 文件 + 中英台账 2 页，键集合守卫要求同批一致，按语言拆分会红），其余单条 ≤ 9；执行期超阈值按[规划规范 §5](../../standards/planning.md) 再拆并同批更新三处计数。
16. **TimePicker 的复用边界**：`date-picker/time-input.vue` 的本地 `clamp` 等逻辑当前只有 1 处消费，未达复用准则（≥3 处且净收益为正）——本阶段只对齐行为、不预抽取；出现第 3 处消费时再评估。

## 6. Review Gate

- **audit-depth**：R1 `standard`（登记批次：规划载体 + 阶段构成 + 候选移出 + 载体同步，无代码改动，时间盒 ≤ 10 分钟）；R2 / R3 `quick`（只复查修复点，≤ 5 / ≤ 3 分钟）。
- **R1**（`standard`，实测约 8 分钟，未超时）：`Pass`（0 blocker / 1 warning / 4 suggest）。
  - warning：M1-6 预计 ≥13 文件、与「文档集中在 M1-7」矛盾 → 拆出 **M1-8**（组件页说明），M1-6 只留源码与测试，并补逐条文件面预算。
  - suggest：拆分推导改为批次框架显式等式 **U1 1 + U2 2 + U3 3 + U4 2 = 8**；`CaomeiTooltipText` 声明名称定稿；非目标按 M1 / M2 / M3 分组并带入评估记录的 M2 / M3 边界；触发面计数改为「按组件个体 17 个」并注明与调研记录按组件行计的口径差异。
- **R2**（`quick`，实测约 3 分钟，未超时）：`Reject`（1 blocker）——新增 M1-8 后 §4 载体同步表仍写「12 行 / 3 / 12；7 + 3 + 2 = 12」，与 §1 / `todo.md` / `roadmap.md` / 索引的 13 条构成两套口径 → 已改为「13 行」与「3 / 13；8 + 3 + 2 = 13」。
- **R3**（`quick`，实测约 2 分钟，未超时）：`Pass`（0 blocker / 0 warning / 0 suggest）——R2 blocker 关闭；全文无旧计数残留；`check:stage-counts` 复跑一致。
- **范围变更（2026-11-14 追加 A + B）**：
  - **R4**（`standard`，实测约 11 分钟，**超 10 分钟时间盒约 1 分钟**；归因 = 语种数跨 5 个载体核对 + 新增条目载体逐项枚举）：`Reject`（1 blocker / 3 warning / 5 suggest）。
    - blocker：M5-3 / §5 / `todo.md` 写「11 语」，与仓库事实 **10 语**（`CaomeiLocale` 联合 + `check:locale-keys` 的语种下界）冲突，且「11 语 + 台账」的构成只是数字巧合 → 统一为 10 语并写明「中英台账 2 页」。
    - warning：M5-4 文件面低估（实际 ≥12）→ 拆为 M5-4 / M5-5；`.session` 仍写 13 条 / 24 条 → 同步为 20 条 / 27 → 24 → 20；缺「执行期追加」独立条目、未写明覆盖评估建议 → 补 §1「执行期追加」条。
    - suggest：记录头补同日追加裁定；`.session` `decisions` 补追加裁定；`backlog` §1.2 补移出注记；M5-1 / M5-2 文件面校正为 ≈7；§5 第 13 条补「M1-6 × M4-1 表头层叠同批复核」。
  - **R5**（`quick`，实测约 5 分钟，未超时）：`Pass`（0 blocker / 2 warning / 0 suggest）——R4 全部关闭；余两项为指针措辞（`§1.1` / `§2.1` 不存在）与 TimePicker 目录载体归属，已改为「§1『执行期追加』条」「§2 与 §5 第 15 条」并把两组件目录登记并入 M5-4。
- **复查基线**：本记录 §1 ~ §5；`docs/plan/todo.md` / `roadmap.md` / `backlog.md`；`docs/design/governance/index.md` 首条摘要；`docs/design/governance/2026-11-14-next-stage-scope-evaluation-18.md` §1.4；`.session`（gitignored）。
