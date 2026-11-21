# 待办归档（深度归档）：Phase 34

> 从[待办归档主窗口](../todo-archive.md)机械迁出（2026-11-21，Phase 40 归档批次）；正文不改写，仅链接深度调整。权威记录见[治理索引](../../design/governance/index.md)。

## Phase 34：Tooltip 提示体系、协作测试 T3、质量门禁、DataTable 数据面与长尾组件（**2026-11-15 完成并归档；本阶段不发布**）

- 时间：2026-11-14 用户就[第十八轮范围评估](../../design/governance/2026-11-14-next-stage-scope-evaluation-18.md) §3 裁定 D0 ① 后登记；同日追加 DataTable 数据面与长尾组件（原 3 / 13 → 5 / 20）；2026-11-15 执行期把 M1-2 拆为 M1-2 / M1-9 / M1-10（5 / 22）；同日 **22 条全部交付**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取**推荐组合**（D0 ①）——Tooltip **10** / 协作测试 **3** / 质量门禁 **2** / DataTable **2** / 长尾组件 **5**；构成对账 **10 + 3 + 2 + 2 + 5 = 22**。范围与验收口径的单一事实源见 [Phase 34 登记批次记录](../../design/governance/2026-11-14-phase34-registration.md) §1 / §2。
- 非目标：不发布、不实现 per-instance 层级栈、P2 tooltip、DataTable 虚拟滚动与列固定、Sidebar / ScrollPanel / Rating、i18n 二期 / RTL、`useDialog`、I5 peer、多版本托管 / Storybook / Tailwind preset、外链守卫、破坏性 API、新增运行时依赖、自动发布。

### M1 Tooltip 提示体系（10 条）

- **M1-1 基础契约**（`b6fe58f`；记录见 [M1-1](../../design/governance/2026-11-15-phase34-m1-1-tooltip-base.md)）：`useOverflowTooltip` + `CaomeiTooltipText` + `tooltip` 契约 + Provider 内建兜底 + Button 截断与提示；RG 七轮（R1 Reject / R2 Pass / R3 ~ R6 Reject / R7 Pass）→ 最终 `Pass`。
- **M1-2 / M1-9 / M1-10 Toolbar / Paginator / SplitButton**（`18951ef` / `994fc76` / `13f5b0a`；记录见 [M1-2](../../design/governance/2026-11-15-phase34-m1-2-icon-tooltips.md)）：内部 `CaomeiIconTooltip` 与 `IconTooltipProp`，图标触发器默认开启提示。
- **M1-3 Dialog / Drawer 关闭按钮**（`9a98bcb`；记录见 [M1-3](../../design/governance/2026-11-15-phase34-m1-3-dialog-drawer-tooltip.md)）：复用内部提示、默认开启且不新增公开 prop；`ignoreNonKeyboardFocus` 避免打开即弹提示。
- **M1-4 P1 icon-only 第一批**（`e7d569b`；记录见 [M1-4](../../design/governance/2026-11-15-phase34-m1-4-p1-icon-tooltips.md)）：Select / MultiSelect / AutoComplete / TagsInput 清除、InputNumber 步进、Password 显隐。
- **M1-5 P1 icon-only 第二批**（`0bb5d9b`；记录见 [M1-5](../../design/governance/2026-11-15-phase34-m1-5-p1-icon-tooltips-second.md)）：Calendar / FileUpload / ColorPicker / DatePicker / Image / Message（含 Alert 关闭）。
- **M1-6 overflow 面与截断前提**（`e62ffce`；记录见 [M1-6](../../design/governance/2026-11-15-phase34-m1-6-overflow-surfaces.md)）：DataTable / Tag / Breadcrumb / Menu 补 `nowrap + max-width + ellipsis` 后接溢出提示。
- **M1-7 文档站 Provider / 示例 / 迁移**（`11efbc0` / `d4baccd` / `bc38414`；记录见 [M1-7](../../design/governance/2026-11-15-phase34-m1-7-docs-provider.md)）：Provider 放置、中英示例、原生 `title` 迁移说明、能力清单标注。
- **M1-8 组件页截断说明**（`15c024d` / `0cb4749` / `0996bd9` / `43acc97`；记录见 [M1-8](../../design/governance/2026-11-15-phase34-m1-8-truncation-docs.md)）：四组件中英页面补长文本截断与提示，并关闭 F4 / F2 / F6。

### M2 协作测试 T3（3 条）

- **M2-1 嵌套遮罩层级评估**（`57f6718`；记录见 [M2-1](../../design/governance/2026-11-15-phase34-m2-1-nested-overlay-layering.md)）：结论维持固定档位（overlay 1000 / content 1001 / 面板 1050 / 提示 1060），零代码、零 token 改动；登记两类异常与后续候选。
- **M2-2 C7 ~ C9 / M2-3 C6**（`5aa42ce`；记录见 [M2-2 / M2-3](../../design/governance/2026-11-15-phase34-m2-2-m2-3-overlay-collaboration.md)）：Toast 在 Dialog 之上、焦点陷阱 + portal、CDP 触摸滚动、Dialog → 二次确认 / Drawer → Dialog 的命中、Esc 分层、锁逐层释放与焦点归还；断言不假定 z-index 递增，含负向对照。

### M3 质量门禁与 a11y（2 条）

- **M3-1 打开态 axe**（`3d82e37` / `08aafc0` / `f27552e` / `1d3b191`；记录见 [M3-1](../../design/governance/2026-11-15-phase34-m3-1-open-state-axe.md)）：Dialog / Select 打开态纳入矩阵，规则白名单与最小适用节点下界，三层抗静默收窄；登记 F18（Select 展开时兄弟节点仅 `aria-hidden`、未 `inert`）。
- **M3-2 发布前周回归机检**（`c3813e1`；记录见 [M3-2](../../design/governance/2026-11-15-phase34-m3-2-weekly-regression-gate.md)）：`release.yml` 查询 `regression-weekly` 最近一次已完成运行，非 `success` 或查询失败一律中止；`actions: read`，退出码 0 / 1 / 2 区分绿 / 红 / 配置错误。

### M4 DataTable 数据面（2 条）

- **M4-1 固定表头与滚动**（`3aec7ad`；记录见 [M4-1](../../design/governance/2026-11-15-phase34-m4-1-data-table-scroll.md)）：`scrollable` / `scrollHeight`，数字归一化为 `px`、字符串按 CSS 长度，表头吸顶与分页器吸底；滚动模式下冻结表头抬一层，修复层级覆盖。
- **M4-2 全选作用域**（`b046f8e`；记录见 [M4-2](../../design/governance/2026-11-15-phase34-m4-2-select-all-scope.md)）：`selectAllScope` 默认 `page` 保持现状，`all` 作用于当前 `data` 全部行；`lazy` 不推断未加载页，受控下按 `rowKey` 合并去重。

### M5 长尾组件（5 条）

- **M5-1 BackTop**（`704ec40` / `7996149`；记录见 [M5-1](../../design/governance/2026-11-15-phase34-m5-1-back-top.md)）：window / 选择器 / 元素三种目标、阈值显隐、reduced-motion 兜底、SSR 安全；`label` 缺省取内置文案。
- **M5-2 TimePicker**（`79e7ba7`；记录见 [M5-2](../../design/governance/2026-11-15-phase34-m5-2-time-picker.md)）：自建三段输入 + 本地化日序（未采用 Reka `TimeField` 的 12 小时制）、12 / 24 小时制、步进、`minValue` / `maxValue` 夹取与空值语义。
- **M5-3 10 语 locale 键**（`59986b9` / `df3c2bf`；记录见 [M5-3](../../design/governance/2026-11-15-phase34-m5-3-locale-keys.md)）：新增 `backTop` / `timePicker` 两个命名空间，10 语同批，台账 30 命名空间 / 89 条文案。
- **M5-4 BackTop 文档与测试**（`d81dc43` / `063da28`；记录见 [M5-4](../../design/governance/2026-11-15-phase34-m5-4-back-top-docs.md)）：中英组件页与示例、画廊 / 侧栏 / 总览 / 设计登记、E2E 与亮暗元素级视觉基线。
- **M5-5 TimePicker 文档与测试**（`997f025` / `c07fb63`；记录见 [M5-5](../../design/governance/2026-11-15-phase34-m5-5-time-picker-docs.md)）：中英组件页与示例、`timeOnly` 迁移对照、登记、E2E 与视觉基线。

### 阶段总结

- **5 条主线 / 22 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 7ad48a7..c07fb63` → **52**（条目交付、登记 / 评估、规划回填与守卫修复）。
- **质量门**：`pnpm verify` `exit 0`；`test:visual` 全绿（新增 back-top / time-picker 亮暗基线）；定向 E2E（浮层协作、DataTable、BackTop、TimePicker）全绿；`capture:styles` 0 差异；`docs:check` / locale / governance 守卫全绿。
- **长期任务**：第 **38** 轮门槛复核（2026-11-15，Phase 34 收口轮）——待执行批次 **0 项**；条件触发 **1 项维持**；已判定不纳入 5 项维持；`capture:styles` 399 项 0 差异。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **15 条活跃**（< 阈值 20，不蒸馏）；`distill-wisdom --reconcile` 通过（14 段对账）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `docs:check` / `check:archive-rg-counts` / `check:design` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 34 行）/ `todo-archive.md`（本块入窗、Phase 27 迁出、主窗口口径与行数）/ `archive/index.md`（新增 Phase 27 行与迁出时点）/ `recurring.md`（第 38 轮）/ 治理索引（本批次记录）逐处核过；另修 1 处失效指针 `2026-10-11-phase22-m6-3-governance-counts-guard.md:6`（`[待办事项 §Phase 22](../../plan/todo-archive.md)` → `[待办归档 §Phase 22](../../plan/archive/todo-archive-phases-22.md)`，理由：目标块已迁出、仅剩索引行）。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；同类「载体名 + Phase NN 指向 `todo-archive.md`」而块已深度归档的散文指针（如 `2026-10-05-phase19-m1-2-visual-alignment.md:4`、`2026-10-07-phase20-m2-5-audit-protocol-convergence.md:4`、`2026-10-10-phase21-m3-1-visual-baseline-device.md:4`）按点时记录不回改，仅本批为解除机检红灯修 1 处并在此枚举。

### 遗留与后续候选

- **F18**：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert`，axe `aria-hidden-focus` 命中 `#app`（关闭判据见 [M3-1 记录](../../design/governance/2026-11-15-phase34-m3-1-open-state-axe.md) §5）。
- **F1 / F7 ~ F9 / F10 / F11 / F14 / F16 / F17**：分别为可测量盒布局级守卫、Tooltip 前两批遗留、计数纪律与 Menu 槽约束 / DataTable 逐格接线开销，承接见各批记录遗留节。
- 下一阶段候选见 [Backlog](../backlog.md)；启动需用户明确授权。
