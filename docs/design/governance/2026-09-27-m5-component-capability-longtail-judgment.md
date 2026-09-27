# M5-1 条件候选判定表：组件能力与长尾

> **阶段**：Phase 14（质量与一致性收口）→ M5 组件能力与长尾判定
> **依据**：[2026-09-25-next-stage-scope-evaluation.md §4 T5](./2026-09-25-next-stage-scope-evaluation.md)、[Backlog §1.1/§1.2](../../plan/backlog.md)
> **用户裁定**：D9「只出判定表、不纳入实现」（2026-09-25）
> **产出时间**：2026-09-27
> **状态**：交付完成

---

## 判定表

| # | 候选 | 触发条件 | 当前取证 | 判定结论 | 升级依据（如触发） |
|---|------|----------|----------|----------|---------------------|
| 1 | `@iconify/vue` 可选接入 | 下游出现「字符串图标名」需求且现有 `@lucide/vue` 无法覆盖（如业务自定义图标集、图标库迁移过渡期） | - 当前图标方案：`@lucide/vue` 组件化封装，所有内建图标均为组件导入<br>- 无下游反馈需求字符串图标名（momei/dependfix/caomei-auth 均已迁移到组件式）<br>- `@iconify/vue` 引入会增加运行时依赖、打包体积、CSS 变量管理复杂度 | **维持条件触发，不纳入实现** | 下游明确提出「需支持任意字符串图标名」且经评估无组件式替代方案时，可再评估接入成本 |
| 2 | ColorPicker 色板导航增强（`radiogroup` + roving tabindex） | 下游启用 `swatches` 且出现键盘密集使用场景（如设计工具、主题编辑器、颜色预设管理） | - 当前色板实现：`role="group"` + `aria-pressed` 按钮组，Tab 遍历、Enter/Space 选中<br>- 2026-09-20 M2-1 判定：**不达标**（现有键盘交互已满足基础可访问性）<br>- 无下游反馈色板键盘操作为痛点（momei/dependfix 均未启用 `swatches` 或反馈键盘问题） | **维持条件触发，不纳入实现** | 下游启用 `swatches` 且反馈「色板键盘导航效率低、需 roving tabindex 优化」时再评估 |
| 3 | DatePicker 范围选择（`selectionMode="range"`） | 下游出现日期区间筛选真实用例（如报表筛选、订单日期范围、日志时间范围） | - 当前 DatePicker：单日期选择，基础日期 + 时间选择已实现<br>- 2026-09-15 用户决策移入 Backlog，经用户决策 2026-09-15 移入 [Backlog](../../plan/backlog.md)<br>- 现有下游（momei/dependfix/caomei-auth/rss-impact-next/afdian-linker）零用量<br>- 可用「两个 DatePicker + 逻辑组合」承接（开始/结束各一个） | **维持条件触发，不纳入实现** | 下游出现「必须单组件内置范围选择」且两组件组合无法满足交互/体验要求时再评估 |
| 4 | DataTable 滚动高度（`scrollable` / `scrollHeight`） | 下游出现固定表头 + 自适应高度且原生容器无法覆盖的用例 | - 当前实现：无 `scrollable`/`scrollHeight` props；推荐外层容器 + CSS `max-height: 300px; overflow: auto` 承接<br>- dependfix 迁移反馈：`env-events.vue` 1 处用 `scrollable` + `scroll-height`，本仓可用容器 + CSS 承接，**不构成阻塞**<br>- 固定表头需求可通过 `position: sticky; top: 0` + 容器滚动实现（见 [响应式设计 §2](../../design/responsive.md)） | **维持条件触发，不纳入实现** | 下游出现「固定表头 + 自适应高度 + 水平冻结列」三者共存且原生容器方案无法覆盖时再评估 |
| 5 | Paginator 页码报表（`CurrentPageReport` 等价物 / `template` + `current-page-report-template`） | 下游出现必须内建模板的真实用例（如「第 1 - 10 条 / 共 100 条」展示需求且自渲染不可行） | - 当前实现：无内建报表模板；推荐 `v-model:page` (1 基) + `rowsPerPageOptions` 自渲染承接<br>- dependfix 迁移反馈：3 处用 `template` + `current-page-report-template`（`import-repos-dialog.vue` / `scans.vue` / `repo-history-dialog.vue`），本仓可用自渲染承接，**不构成阻塞**<br>- 自渲染方案：`page * rowsPerPage - rowsPerPage + 1` 到 `Math.min(page * rowsPerPage, total)` + `total` 组合 | **维持条件触发，不纳入实现** | 下游出现「报表模板高度定制化（国际化占位符、条件渲染、复杂布局）」且自渲染维护成本过高时再评估 |
| 6 | Sidebar 独立组件 | 出现 Drawer 语义不适配的用例（如永久侧边栏、可折叠导航栏、多级菜单侧边栏） | - 下游反馈（2026-09-22，dependfix `1a73abc`）：`apps/platform` 1 处用 `Sidebar`，迁移评估确认可由 `CaomeiDrawer` 机械承接（`v-model:open` + `title` / `#header` + `position="right"`），**不构成阻塞**<br>- 现有方案：`CaomeiDrawer position="left|right"` + `#header` / 默认插槽承接永久/可折叠侧边栏<br>- 已裁定「不自研 / Drawer 承接」[Backlog §1.2](../../plan/backlog.md) | **不补（维持裁定）** | 若出现「Drawer 无法承接的侧边栏交互（如嵌套子菜单展开/折叠、键盘 roving focus、响应式自动收起/展开）」且 Drawer 扩展成本过高时再评估 |
| 7 | ScrollPanel 型滚动面板（视口检测 / 滚动条定制 / 虚拟滚动） | 出现原生滚动容器 + CSS 无法覆盖的用例（如虚拟滚动大列表、自定义滚动条样式、滚动位置同步、无限滚动） | - dependfix 迁移反馈：2 处（`repo-history-dialog.vue` / `run-detail-dialog.vue`）均为 `height: 200px` 固定高度日志区，原生滚动容器 + CSS 足以覆盖<br>- 已裁定「不自研」[Backlog §1.2](../../plan/backlog.md)，采纳时须同步 [组件设计 §5](../../design/components.md) 的 `ScrollArea` 候选行，避免两处口径并存<br>- 当前无虚拟滚动、无限滚动、滚动条定制需求 | **不补（维持裁定）** | 若出现「大数据量虚拟滚动（>10k 行）、滚动条深度定制（主题化滚动条）、多容器滚动同步」等原生方案无法覆盖的场景时再评估 |

---

## 汇总结论

| 判定类别 | 数量 | 候选 |
|----------|------|------|
| **维持条件触发，不纳入实现** | 5 | `@iconify/vue`、ColorPicker 色板导航、DatePicker 范围选择、DataTable 滚动高度、Paginator 页码报表 |
| **不补（维持既有裁定）** | 2 | Sidebar、ScrollPanel |

**全局判定依据**：
1. **零下游用量**：所有候选当前在已知下游（momei/dependfix/caomei-auth/rss-impact-next/afdian-linker）中均无真实使用量或已由现有方案承接
2. **可用替代方案**：每个候选均有「组合现有组件/容器 + CSS/逻辑」的可行替代路径，不构成迁移阻塞
3. **实现成本 vs 收益**：引入新组件/能力需考虑类型定义、Nuxt 注册、locale、组件页、示例、迁移节、§7 等全套交付面，当前收益不足以抵消成本
4. **0.x 冻结窗口**：0.x API 冻结窗口已声明，新增公开 API 需更高门槛

---

## 后续跟踪机制

- 判定表随 Phase 14 收口归档，**不纳入实现代码**
- 后续若下游反馈触发任一条件，由下游所在仓库提出 Issue/PR，本仓按「条件触发 → 再评估 → 决策」流程处理
- 定期（每季度或重大版本前）回扫 Backlog §1.1/§1.2，确认判定条件是否仍成立

---

*本文档为 Phase 14 M5-1 交付物，随阶段收口归档。*