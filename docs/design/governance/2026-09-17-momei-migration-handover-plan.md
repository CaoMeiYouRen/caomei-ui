# momei 迁移计划与验收标准（交接文档）

- 日期：2026-09-17
- 触发：Phase 7 第二阶段（2026-09-17 用户授权启动）M1 先行交付条目
- 输入：[momei 迁移可行性评估记录](./2026-09-17-momei-migration-feasibility.md) §6（B0~B4 分期）与 §7（用户决策 5 项）、[momei 组件使用复核台账](./2026-09-14-momei-usage-audit.md)、两仓源码
- 定位：**对 momei 侧迁移结果进行校验的依据**。momei 侧实际迁移由 momei 项目在自己的仓库执行；本仓不触碰 momei 文件、不在本阶段以 momei 构建 / 测试作为验收，也不代为采集视觉基线。
- 口径：第 6 节的核对动作与第 10 节的清单产出，执行主体为 momei 项目；本仓提供方法与判定口径。组件用量、图标 / token 计数沿用[评估记录](./2026-09-17-momei-migration-feasibility.md) §2 的统计口径（`.vue` 开标签计数 + quote-aware 属性合并，快照日期 2026-09-17）。

## 1. 范围与职责边界

| 侧 | 承担 |
| --- | --- |
| caomei-ui（本仓） | 库侧能力面补齐（DataTable 列插槽 + B1 14 项增强）；B0 库侧资产（token / 图标映射表、并存隔离策略与包体监控口径）；本计划与验收标准 |
| momei 项目（momei 仓库） | 视觉基线采集；B2 / B3 / B4 实际迁移；回归执行；逐批「文件 → 改动点」清单；包体对比记录 |

## 2. 批次划分与执行主体

| 批次 | 内容 | 执行主体 |
| --- | --- | --- |
| B0a 库侧资产 | `--p-*` → `--caomei-*` token 对照表；`pi pi-*` → lucide 图标映射表；双库并存隔离策略（路由 / 页面白名单）与包体监控口径 | caomei-ui |
| B0b 视觉基线 | 视觉基线采集（列表 / 表单 / 浮层各 1 页），方法见 §7 | momei 项目 |
| B1 库侧补齐 | A 级：DataTable 列插槽——`#cell-{key}` / `#header-{key}`（**2026-09-17 已交付**，用法见[设计规范 §7](../../design/design-spec.md) 与组件页「列插槽」节）；`align-frozen` 与列级 `selection-mode` 经用户决策（2026-09-17）**收敛为迁移映射、不新增 API**（`frozen` + `align-frozen` → 单个 `frozen: 'left' \| 'right'`；列级 `<Column selection-mode>` → 表格级 `selectionMode`，选择列固定渲染在首列）；B 级 14 项增强（清单见[评估记录 §3.2](./2026-09-17-momei-migration-feasibility.md)） | caomei-ui |
| B2 数据类页面迁移 | 20 个 `<Column>` 文件（`/admin/posts`、`/admin/users`、`/admin/friend-links`、`/admin/ai/*`、`/admin/migrations/*`） | momei 项目 |
| B3 表单与设置页面迁移 | `components/admin/settings/*`、`components/installation/*`、auth / submit / register 等表单页 | momei 项目 |
| B4 展示、浮层与收尾 | 展示类组件、浮层（Dialog / Drawer / Popover / DropdownMenu）、`.toggle()` 结构改写、图标替换、i18n 插件替换、测试与 E2E 改写、卸载 PrimeVue | momei 项目 |

## 3. 前置条件

1. B0a 两张映射表评审通过，且可复现（取证命令与快照日期随表记录）。
2. 双库并存隔离策略（路由 / 页面白名单）与包体监控口径确定（本仓 B0a 资产）。
3. 迁移前视觉基线采集完成（momei 侧，按 §7 方法），且与迁移前现场一致。
4. momei 工作区干净——评估快照时含一处未提交 `AGENTS.md`，执行前须处理。
5. B1 出口条件达成（见 §5）：每个补齐项带单测 + 文档；DataTable 列插槽有中英迁移示例。

## 4. 开工顺序

| 步 | 动作 | 执行主体 | 前置 |
| :-: | --- | --- | --- |
| 1 | M1 本交接文档 | caomei-ui | — |
| 2 | B0a 库侧资产（映射表、并存策略与包体口径） | caomei-ui | 步 1 |
| 3 | B1 库侧补齐（DataTable 列插槽先行，B 级增强随后） | caomei-ui | 步 2（映射表可用于命名对齐） |
| 4 | B0b 视觉基线采集 | momei 项目 | 步 2 映射表评审通过；与步 3 可并行 |
| 5 | B2 数据类页面迁移 | momei 项目 | 步 3 出口条件达成 + 步 4 基线可复现 |
| 6 | B3 表单与设置页面迁移 | momei 项目 | 步 5 |
| 7 | B4 展示、浮层与收尾 | momei 项目 | 步 6 |

## 5. 每批出口条件

| 批次 | 出口条件 |
| --- | --- |
| B0a | 两张映射表评审通过；覆盖计数与评估记录 §2.3 口径一致；并存白名单有载体与切换粒度；包体口径含记录项与命令 |
| B0b | 基线可复现（采集命令 / 脚本、环境、两仓 commit、快照日期齐全） |
| B1 | 每个补齐项带单测 + 文档；DataTable 列插槽有迁移示例（中英）；本仓 `pnpm verify` 通过 |
| B2 | 20 个 `<Column>` 文件逐页功能回归（排序 / 分页 / 选择 / 列插槽）；视觉对照见 §7 判定口径；「文件 → 改动点」清单产出 |
| B3 | 表单交互（校验 / 提交 / 提示）回归；`useToast` / `useConfirm` 映射完成；清单产出 |
| B4 | 全量测试与 E2E 通过；`pnpm test:nuxt-smoke` 等价冒烟通过；包体对比记录产出（见 §9）；PrimeVue 相关产物归零 |

## 6. 有意差异逐条核对清单（16 条）

来源：[评估记录 §4](./2026-09-17-momei-migration-feasibility.md) 与[设计规范 §7](../design-spec.md)。核对动作执行主体为 momei 项目；「本仓判定口径」为本仓验收时采用的判定。

| # | 差异 | 核对动作（momei 侧） | 本仓判定口径 | 依据 |
| :-: | --- | --- | --- | --- |
| 1 | Select `filter` 不实现，映射到 `AutoComplete` | 2 处调用点改组件；其余 `Select` 不得保留 `filter` | `Select` 上 `filter` 残留计数 = 0；改组件处数 = 2 | 评估记录 §4#1；设计规范 §7 |
| 2 | DatePicker 不支持手工键入 | 确认无 `manual-input` 用法 | `manual-input` 用量 = 0，或有新增用例经用户裁定 | 评估记录 §4#2 |
| 3 | DatePicker 无 `selection-mode` | 确认无 `selection-mode` 用法 | `selection-mode` 用量 = 0，或有新增用例经用户裁定 | 评估记录 §4#3 |
| 4 | Drawer 缺 `position="full"` / 生命周期事件 / `#closebutton` 等 | 3 处逐个核对是否依赖未暴露能力 | 3 处逐处有结论（不依赖 / 已登记缺口） | 评估记录 §4#4；设计规范 §7 |
| 5 | Drawer `modal="true"` 即锁滚动 | 3 处按滚动锁行为 UI 复核 | 3 处滚动锁行为有复核记录 | 评估记录 §4#5；设计规范 §7 |
| 6 | Dialog `title` 必填、窄屏不转全屏 | 35 处 `header` → `title`；窄屏形态按 Phase 10 决策核对 | `header` 残留计数 = 0；窄屏未出现全屏形态 | 评估记录 §4#6；[响应式设计](../responsive.md) |
| 7 | Message 无 `text` 变体 | 确认无 `variant="text"` 用法 | `variant="text"` 用量 = 0 | 评估记录 §4#7 |
| 8 | Tag 无 `outlined` / `severity` / `value` 别名 | 125 处 `severity` → `tone`；`secondary` / `contrast` / `info` 逐处确认近似映射 | `severity` 残留计数 = 0；近似映射逐处有记录 | 评估记录 §4#8；设计规范 §7 |
| 9 | Select / MultiSelect `fluid` 需删除 | 删除 `fluid`（本库默认 `width: 100%`，并另有可覆盖的宽度上限）。同类项：`DatePicker` 默认带 `20rem` 宽度上限（momei `fluid` 用量 2 处 / 2 文件，快照 `cb663aee` 只读统计），删除 `fluid` 后需真正全宽时覆盖 `--caomei-date-picker-max-width: none`，见[设计规范 §7](../design-spec.md) | `fluid` 残留计数 = 0；宽度结果另按设计规范 §7 的 token 口径核对 | 评估记录 §4#9；设计规范 §7 |
| 10 | Password `feedback` 默认 `false` | 8 处显式传参保留；其余按字段场景决定是否显式传 `true` | 强度反馈形态与迁移前一致，或差异逐处有记录 | 评估记录 §4#10；设计规范 §7 |
| 11 | InputNumber `useGrouping` 默认 `true` | 确认千分位展示形态 | 展示形态变化逐处有记录 | 评估记录 §4#11；设计规范 §7 |
| 12 | ColorPicker `format` 语义差异（hex 带 `#`、rgb / hsb 为字符串、无 alpha） | 2 处逐处核对模型形态与适配代码 | 模型形态符合本库口径，或适配代码已移除 | 评估记录 §4#12；设计规范 §7 |
| 13 | DataView 无分页 / 排序，`loading` 为本库新增 | 确认该处不依赖分页 / 排序 | 该处不依赖未实现能力 | 评估记录 §4#13；设计规范 §7 |
| 14 | DataTable 首次点击排序为升序 | 确认排序方向与 PrimeVue 默认一致 | 排序方向行为一致，或差异有记录 | 评估记录 §4#14；设计规范 §7 |
| 15 | Panel 由 Card 承接 | 3 处 `<Panel>` → `CaomeiCard`（`title` / `#header` / `#footer` / `#extra`） | `<Panel>` 残留计数 = 0 | 评估记录 §4#15；设计规范 §7 |
| 16 | 触摸目标维持现状（< 44px） | 确认管理端主场景可接受 | 无移动端无障碍审计阻断项 | 评估记录 §4#16；设计规范 §7 |

## 7. 视觉基线采集方法与判定口径（执行主体：momei 项目）

- **采集对象**：列表页 1 个（优先 momei 管理端主路径）、表单 / 设置页 1 个、浮层 1 个。
- **采集内容**：迁移前页面截图；关键元素计算样式快照（颜色 / 背景 / 边框 / 圆角 / 字号 / 间距等）；环境元数据（浏览器与版本、视口、主题与明暗、`locale`、CSS `@layer`）。
- **记录要求**：采集命令或脚本、环境、两仓 commit、快照日期齐全。
- **判定口径**：本仓不代为采集；验收时以「基线可复现」为条件，视觉对照以 B0b 基线为准——差异逐项归因，属于本文件 §6 的条目按 §6 核对，不属于 §6 的差异不得静默出现。

## 8. 回归口径

- **承载者**：momei 的 [Weekly Regression](https://github.com/CaoMeiYouRen/momei/blob/master/.github/workflows/regression-weekly.yml)（cron 每周五 12:00；跑 `pnpm run regression:weekly` + typecheck + build + lint:css / lint:md + 包体预算 + 覆盖率）。
- **强度（用户决策 2026-09-17）**：不要求每批跑 momei 全量 E2E。
- **判定口径**：每批合并后至少经过一次每周回归，且无新增失败；新增失败逐条归因并处理后才进入下一批。
- **跨仓触发不在本阶段**：「caomei-ui 变更即验证 momei」的自动化属 Phase 8（历史预留编号，未启动），需另行授权。

## 9. 包体对比要求

- **对比点**：B0b 基线（迁移前，PrimeVue 在产物内）↔ B4 收尾（PrimeVue 卸载后）。
- **记录项**：构建命令与两仓 commit；产物总量与 gzip / brotli 体积；按 chunk 体积；PrimeVue 与 primeicons 相关 chunk 是否归零；快照日期。
- **判定口径**：记录含命令 + commit + 日期即视为可复现；PrimeVue 与 primeicons 相关 chunk 归零；总量与主 chunk 体积变化有数值。本文件不预设包体阈值，阈值由 momei 既有包体预算承担。
- **执行主体**：momei 项目；本仓提供要求与判定口径。

## 10. 逐批「文件 → 改动点」清单产出要求（执行主体：momei 项目）

- **批次**：B2 / B3 / B4 各产出一份。
- **行内容**：文件路径 → 改动点（位置与类型）→ 依据指针（本文件 §6 差异编号、映射表条目，或 B1 能力项）。
- **可对账**：清单文件数与该批统计口径一致；每行带依据指针，不保留无依据行。
- **留痕**：由 momei 项目产出与留存；本仓以清单作为校验依据，不代为产出，也不要求清单进入本仓仓库。

## 11. 交接与验收流程

1. **本仓交付**：M1 本文件；M2 B0a 资产；M3 / M4 / M5 库侧能力（各自带单测与文档）。
2. **momei 侧执行**：按 §4 顺序执行 B0b / B2 / B3 / B4，产出清单与记录。
3. **反馈**：momei 侧以「批次完成说明 + 清单 + 回归结果 + 包体记录」回传；本仓等待反馈，不在本仓执行 momei 侧动作。
4. **本仓校验**：按 §6 / §7 / §8 / §9 的判定口径逐项核对；差异不在 §6 内的，退回 momei 侧归因。
5. **后续**：本仓收到反馈后再决定下一轮动作（含是否启动其他下游的迁移面评估）。

## 12. 未决与后续

- 其他下游（caomei-auth / rss-impact-next / afdian-linker / dependfix/apps/platform）的迁移面未评估：按既定顺序在 momei 闭环后评估。
- B0b 的具体页面清单由 momei 侧在采集时确定；本仓只提供方法与判定口径。
- 本计划的原子条目登记见[待办归档](../../plan/todo-archive.md)（Phase 7 第二阶段，2026-09-19 归档）；B1 能力项拆分与顺序见该阶段 M3 ~ M5。
