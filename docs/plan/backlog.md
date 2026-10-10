# 长期规划与 Backlog

本文档记录**仍待用户决策**的候选与长期主线；候选准入、优先级与插队例外规则见 [规划规范 §3](../standards/planning.md)，本文档不重述。

> **文档结构**
>
> - §1 候选池：仅收录**尚未进入阶段**的候选（待决策，以及已决策但尚未登记到当前阶段的过渡态）。
> - §2 维护约定。
> - §3 已评估、不纳入（结论留档）：已判定**不进入候选池**的下游诉求与理由。
>
> 已交付与已归档条目随阶段迁入 [待办归档](./todo-archive.md)，本表不保留。

## 1. 候选池（待用户决策）

### 1.1 组件增强候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| ColorPicker 色板导航增强 | M4 条目 5 follow-up | 色板改为 `radiogroup` + `aria-checked` 并补 roving tabindex。触发条件：下游启用 `swatches` 且出现键盘密集使用场景。**2026-09-20 M2-1 判定：不达标** | 低 |
| DatePicker 范围选择 | M4 条目 2 范围收敛 | 候选补 `selectionMode="range"`。触发条件：下游出现日期区间筛选真实用例 | 低 |
| DataTable 滚动高度（`scrollable` / `scrollHeight`） | dependfix 迁移反馈 | **条件候选**：下游 `env-events.vue` 1 处用 `scrollable` + `scroll-height`；本仓可用容器 + CSS 承接（不构成阻塞）。触发条件：出现原生容器无法覆盖的用例（如固定表头 + 自适应高度） | 低 |
| Paginator 页码报表（`CurrentPageReport` 等价物） | dependfix 迁移反馈 | **条件候选**：下游 3 处（`import-repos-dialog.vue` / `scans.vue` / `repo-history-dialog.vue`）用 `template` + `current-page-report-template`；本仓可用 `v-model:page`（1 基）+ `rowsPerPageOptions` 自渲染承接（不构成阻塞）。触发条件：出现必须内建模板的真实用例 | 低 |
| Select `null` 选项开发期告警 | momei 迁移反馈 2026-09-25 §1.2 | **条件候选**：`optionValue` 解析为非 `string` / `number` 的选项静默丢弃属**已声明契约**（[设计规范 §7](../design/design-spec.md)）；候选为开发期对 `null` / `undefined` 值告警 | 低 |

### 1.2 长尾组件候选（Tier 3）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | — 。**下游反馈（2026-09-22，dependfix `1a73abc`）**：`apps/platform` 1 处用 `Sidebar`，其迁移评估确认可由 `CaomeiDrawer` 机械承接（`v-model:open` + `title` / `#header` + `position="right"`），**不构成阻塞**。触发条件：出现 Drawer 语义不适配的用例 | 低 |
| ScrollPanel 型滚动面板 | dependfix 迁移反馈 | **评估结论：不自研**。下游 2 处（`repo-history-dialog.vue` / `run-detail-dialog.vue`，取证 2026-09-22）均为 `height: 200px` 固定高度日志区，原生滚动容器 + CSS 足以覆盖。触发条件：出现视口检测 / 滚动条定制 / 虚拟滚动等原生无法覆盖的用例。采纳「不自研」时须同步 [组件设计 §5](../design/components.md) 的 `ScrollArea` 候选行，避免两处口径并存 | 低 |

### 1.3 不纳入自研的能力（外购建议）

| 能力 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 图表库封装 | 用户 2026-09-29 口径 | 维持**外购不自研**（候选 ECharts 等）；**暂未使用**，等出现真实用例后再按「外购不自研 + 先暗色 / 国际化联动、后兼容主题」同口径评估（口径来源见[下一阶段范围评估](../design/governance/2026-09-30-next-stage-scope-evaluation.md) §3.3 / §8.1 D5） | 低 |

### 1.4 国际化候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 语言矩阵 - 长期 | 用户需求 | 追加俄语、法语、德语、西班牙语、葡萄牙语 | 低 |
| RTL（阿拉伯语）支持 | 用户需求 | 风险高，单独立项谨慎评估 | 低 |
| locale 组织与注册治理 | 用户需求 | 语言数量增长后的目录组织、注册表、按需加载 | 低 |

### 1.5 移动端与响应式候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 滚动容器键盘聚焦「无条件完整可见」 | 实测发现 | Chromium 焦点滚动机制限制；触发条件：下游无障碍审计提出 | 低 |
| 触摸目标增强（≥44px 命中区） | 用户决策 | 用户裁定**暂不提升**，维持现状 | 低 |

### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| Toast 焦点哨兵与 `aria-hidden-focus` 规则冲突 | Reka `Toast/FocusProxy` 的 `VisuallyHidden tabindex="0"` 焦点哨兵（上游有意模式）。**2026-09-25 用户裁定 D2③：维持现状仅更新记录**（不引入定向豁免机制）；候选处置为上游反馈或 `inert` 可行性 | 低 |
| 文档站多版本托管 | 历史版本站点 / 版本切换器。**触发条件：同时维护 ≥2 个对外版本，或下游按版本 pin 并要求旧版文档**。**2026-09-22 用户裁定 D1-B**：因「文档站与工作区源码强绑定」的架构约束暂不启动，形态与多源核对见[形态再评估](../design/governance/2026-09-22-docs-versioning-reevaluation.md) | 低 |
| 文档站演示动画遗留项 | keyframes 副本一致性、示例样式不入 stylelint | 低 |
| 文档站示例的外部图片依赖 | `picsum.photos` 外链风险 | 低 |
| ui-validator 资产 follow-up | agent/skill 定义优化 | 低 |
| locale 守卫能力演进 | 解析器容忍注释等 | 低 |
| 文档站首页 hydration mismatch | 待定位是否上游行为 | 低 |
| @iconify/vue 可选接入 | 字符串图标名 escape hatch | 低 |
| 治理索引与记录计数对账守卫 | 2026-09-30 浮层遮挡修复批次连续两轮 Review Gate 以「同一组计数跨载体漂移」判 blocker（记录本体计数为修复前快照 → 索引摘要计数未同步〔复发〕）。候选：对治理索引摘要与记录本体的 e2e / 测试计数做对账机检。**评估结论：高误报 / 高过拟合，未实施**——计数散落在自然语言摘要中，抽取规则易误伤；当前以「改完逐载体 `rg -o` 核对 + 记录内钉复算命令」的流程约束替代（已记 `.session/wisdom.md` 与 [AI 协作规范 §9](../standards/ai-collaboration.md)） | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射 | 低 |
| Storybook 组件工坊 | 暂不启用 | 低 |
| CHANGELOG 生成器健壮性收口 | 无 remote 降级、语言源自 root；**空 `# Unreleased` 段**（`outputUnreleased: true` 在无未发布提交时仍输出标题，2026-09-22 0.2.0 / 2026-09-24 0.3.0 发布会后实测） | 低 |
| 归档载体行数超阈压缩 | 主窗口 `todo-archive.md` **479 行**超 `docs:check:line-count` warn 阈值（warn > 400 / error > 600，非阻断）；Phase 21 D11 裁定**维持并留观察**——**理由**：行数仍在 **error 阈值 600 以内**（warn 可接受），归档载体只增不减属常态、压缩为预防性动作；**再评估触发 = 行数达 error 阈值 600 时强制压缩**；候选：压缩近线窗口（更早阶段迁深度归档）或降低单块粒度（计数口径以 `pnpm docs:check:line-count` 为准） | 低 |
| 提交驱动 CI 自动发布 | 发布机制评估（[2026-10-08](../design/governance/2026-10-08-release-flow-and-version-strategy-evaluation.md) §4）建议的演进形态——放开 `release.yml` publish + semantic-release + npm **Trusted Publisher（OIDC）**；Phase 21 D8 **维持手动**、本轮仅做统一手动流脚本编排；风险：breaking 提交会直接升 `1.0.0`、发布不可逆 | 低 |
| 进入 1.x 的版本策略与冻结面确认 | 发布机制评估（[2026-10-08](../design/governance/2026-10-08-release-flow-and-version-strategy-evaluation.md) §4.2 / §4.5）——Phase 21 D7 **暂不进入 1.x**，维持 0.x + 既有冻结窗口；进入闸门 = 下游全量稳定消费 + 冻结面逐项确认 + 自动化发布就绪（须先定「意外升 `1.0.0`」策略 / 拦截） | 低 |
| 视觉基线转阻断评估 | 视觉回归基线装置已交付并接入周级回归（**先非阻断**）；**触发条件 = 首个 `ubuntu-latest` 全绿 run**——届时复核跨环境渲染一致性（字体 / 抗锯齿）、按需重冻结基线，再评估转阻断（来源：[装置记录](../design/governance/2026-10-10-phase21-m3-1-visual-baseline-device.md) / [接线记录](../design/governance/2026-10-10-phase21-m3-2-visual-baseline-ci-docs.md)） | 低 |

### 1.7 服务层候选（composables）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 通用对话框服务 `useDialog` | 用户需求 | **评估结论：暂不实现**。触发条件：出现非组件上下文的命令式弹窗用例 | 低 |

### 1.8 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 下游 0.5.0 升级护航 | **条件候选**：dependfix `apps/platform` 已于 2026-10-01 完成 `caomei-ui` `0.3.0 → 0.5.0` 升级（M34.2 / M34 归档，自行处置未需本仓护航）；momei 根 `package.json` 仍精确锁定 `caomei-ui@0.3.0`（第六十八阶段迁移实施期）〔2026-10-06 实测两仓 `package.json`：dependfix `0.5.0` / momei `0.3.0`〕。触发条件：**momei 启动 `0.5.0` 升级**；届时按 `CHANGELOG.md` 重取差异清单（隔 `0.4.0` / `0.5.0` 两个 minor），产出升级指引 / 回归关注点 | 低 |
| momei 侧迁移执行 | **执行主体为 momei 项目**；本仓等待其反馈 | 等待外部反馈 |

## 2. 维护约定

- 新增候选时注明来源与初步优先级。
- 被否决的候选记录结论与理由（见 §3）。
- 候选状态流转：§1 候选池 → 用户决策后登记到待办事项当前阶段 → 阶段完成后随待办归档迁移；**已交付 / 已归档条目不在本表保留任何内容**。
- **已裁定行的转述边界**：只记载用户裁定原文要点与其可验证语义，不引入未讨论的形态推断（如具体实现分层）或定性升格（如把行为要求升格为契约）；形态边界与兼容语义留待实施批次论证。
- 重复发生或需按期重复执行的治理动作，按规划规范 §8 升级到[长期任务台账](./recurring.md)。

## 3. 已评估、不纳入（结论留档）

> 本节记录**已评估但判定不进入候选池**的下游诉求结论与理由（维护约定「被否决的候选记录结论与理由」的落点）；条目为判定记录，非待决策候选。

| 诉求 | 来源 | 结论与理由 |
|------|------|------------|
| Select 选项 `null` 值支持（以独立哨兵区分「未选择」） | momei 迁移反馈 2026-09-25 §1.2 | **不纳入**：`optionValue` 收窄为 `string \| number` 属有意契约（对齐 Reka 可稳定比较子集），非字符串 / 数字选项不渲染已在[设计规范 §7](../design/design-spec.md) 与 Select 组件页声明；支持 `null` 会改变「未选择」语义，须另立契约。开发期告警已作为条件候选登记于 §1.1，评估见[上游反馈评估](../design/governance/2026-09-25-momei-upstream-feedback-evaluation.md) |
