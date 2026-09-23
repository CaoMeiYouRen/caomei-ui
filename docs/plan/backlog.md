# 长期规划与 Backlog

本文档记录**仍待用户决策**的候选与长期主线；候选准入、优先级与插队例外规则见 [规划规范 §3](../standards/planning.md)，本文档不重述。

> **文档结构**
>
> - §1 候选池：仅收录**尚未决策 / 尚未交付**的候选。
> - §2 维护约定。
>
> 已交付与已归档条目随阶段迁入 [待办归档](./todo-archive.md)，本表不保留。

## 1. 候选池（待用户决策）

### 1.1 组件增强候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 实底前景 token 配对复核 | M3 复核 | 复核其余实底消费点的 `-solid` × `-foreground` 配对，避免跨主题配对冲突（2026-09-21：本阶段未取，须另行裁定） | 中 |
| ColorPicker 色板导航增强 | M4 条目 5 follow-up | 色板改为 `radiogroup` + `aria-checked` 并补 roving tabindex。触发条件：下游启用 `swatches` 且出现键盘密集使用场景。**2026-09-20 M2-1 判定：不达标** | 低 |
| DatePicker 范围选择 | M4 条目 2 范围收敛 | 候选补 `selectionMode="range"`。触发条件：下游出现日期区间筛选真实用例 | 低 |
| DataTable 行分组与行展开 | dependfix 迁移反馈 | 补行分组（`rowGroupMode` / `groupRowsBy` / 可折叠 `expandableRowGroups` + `#groupheader`）与行展开（`expandedRows` / `expander` / `#expansion`）。**下游用法（取证 2026-09-22，dependfix `1a73abc` 静态比对）**：`alerts.vue` 用 `row-group-mode="subheader"` + `group-rows-by`（按 `packageName` / `repository` 动态切换）+ `expandable-row-groups` + `v-model:expanded-row-groups` + `#groupheader` + 内建 toggle；`batch-runs.vue` 用 `v-model:expanded-rows` + `Column expander` + `#expansion` + `@row-expand`。**本仓现状（2026-09-23 核对 `78b5b71`）**：上述标识在 `src/components/data-table/` **0 命中**。**取向待裁定**：库侧补齐（A）/ 下游页面侧改写（B）/ 混合（C，下游评估推荐）——见[范围评估 §5.2 / §7](../design/governance/2026-09-23-next-stage-scope-evaluation.md)。**已裁定走「库侧补齐」**（2026-09-23 用户裁定 D1 / D2）→ M1（Phase 13 组件能力补齐与 dependfix 迁移解阻）（行分组 + 可折叠分组 + 行展开；API 命名对齐 PrimeVue） | 中 |
| DataTable 多列排序与默认排序方向 | dependfix 迁移反馈 | 补多列排序模型（对齐 `sort-mode="multiple"` + `multi-sort-meta`）并暴露首次点击方向。**下游用法（取证 2026-09-22，dependfix `1a73abc` 静态比对）**：`alerts.vue` / `pr-checks.vue` 用 `sort-mode="multiple"` + `v-model:multi-sort-meta`（如 `[{_severityRank,-1},{packageName,1}]`）；另全库 6 处用 `:default-sort-order="-1"`（分布 `users` / `alerts` / `env-events` / `batch-runs` / `repos/[id]/runs`）。**本仓现状（2026-09-23 核对 `78b5b71`）**：`sortMode` / `multiSortMeta` 0 命中、为单列排序（`sortField` + `sortOrder`），内部固定 `sortDescFirst: false`。**已裁定走「库侧补齐」**（2026-09-23 用户裁定 D1 / D2 / D4）→ M1（Phase 13 组件能力补齐与 dependfix 迁移解阻）（多列排序 + `sortDescFirst` 降序优先） | 中 |
| DataTable 滚动高度（`scrollable` / `scrollHeight`） | dependfix 迁移反馈 | **条件候选**：下游 `env-events.vue` 1 处用 `scrollable` + `scroll-height`；本仓可用容器 + CSS 承接（不构成阻塞）。触发条件：出现原生容器无法覆盖的用例（如固定表头 + 自适应高度） | 低 |
| Paginator 页码报表（`CurrentPageReport` 等价物） | dependfix 迁移反馈 | **条件候选**：下游 3 处（`import-repos-dialog.vue` / `scans.vue` / `repo-history-dialog.vue`）用 `template` + `current-page-report-template`；本仓可用 `v-model:page`（1 基）+ `rowsPerPageOptions` 自渲染承接（不构成阻塞）。触发条件：出现必须内建模板的真实用例 | 低 |

### 1.2 长尾组件候选（Tier 3）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | — 。**下游反馈（2026-09-22，dependfix `1a73abc`）**：`apps/platform` 1 处用 `Sidebar`，其迁移评估确认可由 `CaomeiDrawer` 机械承接（`v-model:open` + `title` / `#header` + `position="right"`），**不构成阻塞**。触发条件：出现 Drawer 语义不适配的用例 | 低 |
| TagsInput（标签录入） | dependfix 迁移反馈 | 对应 PrimeVue `Chips`（下游 `repos.vue` 1 处：自由文本多值标签，取证 2026-09-22）。**现状**：无对应组件与导出；Reka UI 提供 `TagsInput` primitive（`TagsInputRoot` / `Input` / `Item` / `ItemDelete` / `ItemText` / `Clear`，2026-09-23 核对 `reka-ui@2.10.4`），[组件设计 §5](../design/components.md) 已列入「未纳入本清单、可作为后续候选」的 primitive 清单。**取向已裁定**：封装 Reka primitive（2026-09-23 用户裁定 D5）→ M2（Phase 13 组件能力补齐与 dependfix 迁移解阻） | 中 |
| ScrollPanel 型滚动面板 | dependfix 迁移反馈 | **评估结论：不自研**。下游 2 处（`repo-history-dialog.vue` / `run-detail-dialog.vue`，取证 2026-09-22）均为 `height: 200px` 固定高度日志区，原生滚动容器 + CSS 足以覆盖。触发条件：出现视口检测 / 滚动条定制 / 虚拟滚动等原生无法覆盖的用例。采纳「不自研」时须同步 [组件设计 §5](../design/components.md) 的 `ScrollArea` 候选行，避免两处口径并存 | 低 |

### 1.3 不纳入自研的能力（外购建议）

| 能力 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 富文本与图表封装 | momei 使用面 | Editor / Chart 建议外购（Tiptap / ECharts），不自研 | 低 |

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
| AI 资产指针（`AGENTS.md`） | §11「相关文档」缺长期任务台账指针；受保护文件，须用户指示 | 低 |
| 对比度遗留项盘点 | 亮色 soft 变体 primary 文本 4.37:1 等 4 项；预设品牌色既有例外长期跟踪（2026-09-21：本阶段未取，须另行裁定）。**2026-09-22 新增观察**：亮色 `--caomei-color-text-muted`（#6b7280）落在站点 `--vp-c-bg-soft`（#f6f6f7）上为 **4.48:1**（同色在纯白上 5.1）——M2-5 组件画廊 V 阶段实测，归因库 token × 站点 soft 底，非画廊引入 | 中 |
| 迁移口径一致性守卫 | 入口表 / 组件页节 ↔ §7 一致性机检 | 低 |
| 内置文案台账机检对账 | `docs/components/locale.md`（中英）的「命名空间 → 文案键」索引表与 `src/locale/*` 实际键集合对账。**触发依据**：2026-09-23 M1-2 新增 `table.expandRowGroup` / `table.collapseRowGroup` 时该台账漏更新，`docs:check` 与 `check:locale-keys` 均不覆盖，Review Gate 判 blocker 后人工修复 | 低 |
| 浮层与分组展开态的 a11y 断言 | M4-1 受检状态为默认（关闭）态：12 个面板内导出（`DropdownMenu*` / `PopoverContent` / `PopoverArrow` / `PopoverClose` / `SelectGroup`）需交互展开才渲染，未纳入受检面；**2026-09-23 补**：DataTable 可折叠分组的切换按钮（`aria-expanded` / 可访问名）同样只在开启分组时渲染，当前仅由 `@ui-validator` 真机覆盖，未进入 axe 受检面 | 低 |
| a11y 既有例外的修复候选 | M4-1 清单产出 3 条例外：Reka `Toast/FocusProxy` 焦点哨兵与 `aria-hidden-focus` 规则冲突（上游反馈 / `inert` 可行性）；`MultiSelect` 关闭态输出空 `aria-controls`；`Calendar` 根容器 `aria-label` 落在 `role=generic` 上（补显式 role 或改标签落点）；无 `CaomeiStepperDescription` 的步骤产生悬空 `aria-describedby`（按有无描述决定是否输出该属性） | 低 |
| 测试隔离与偶发失败 | Reka + happy-dom 并发时序问题；按「多次出现再处理」跟踪。**出现记录**：① 2026-09-23 全量 `pnpm test` 偶发 1 例（`src/components/color-picker/color-picker.test.ts` 的「区域 pointerdown 捕获阶段先让输入框失焦」断言 `blurred === true` 失败）；单文件重跑 32 passed、其后两次全量 1681 passed，判定为并发时序 flaky（非代码缺陷，当日无 `src/` 改动）。② 2026-09-23 M1-2 复审期间全量 `pnpm test` 首跑偶发 1 例（`src/components/auto-complete/auto-complete.test.ts` 的 select 断言），复跑两次均 1702 passed，同为并发时序 flaky。③ 2026-09-23 M2-1 期间全量 `pnpm test` 首跑偶发 1 例（1 failed / 1758 passed；**未捕获用例名**，其后连续 5 次全量均 1759 passed） | 中 |
| Review Gate 证据留存 | 评审结论与截图归档到 `artifacts/review-gate/` | 低 |
| 文档站多版本托管 | 历史版本站点 / 版本切换器。**触发条件：同时维护 ≥2 个对外版本，或下游按版本 pin 并要求旧版文档**。**2026-09-22 用户裁定 D1-B**：因「文档站与工作区源码强绑定」的架构约束暂不启动，形态与多源核对见[形态再评估](../design/governance/2026-09-22-docs-versioning-reevaluation.md) | 低 |
| 文档站演示动画遗留项 | keyframes 副本一致性、示例样式不入 stylelint | 低 |
| 文档站示例的外部图片依赖 | `picsum.photos` 外链风险 | 低 |
| 文档站双花括号插值的机检守卫 | [文档与演示站 §13](../design/documentation-site.md) 规定「描述插值语法时不要写出双花括号」，但违规只在**渲染日志**可见（`docs:build` 仍 exit 0）；2026-09-22 M2-1 落地时两次踩中（`design/documentation-site.md` 与 `guide/release.md` 的行内代码里写字面量 → 目标页抛 `TypeError: Cannot read properties of undefined (reading 'version')`）。**已裁定纳入**（2026-09-23 用户裁定 D9）→ M4（Phase 13 组件能力补齐与 dependfix 迁移解阻） | 中 |
| 组件总览页与侧栏的成员对账 | [文档与演示站 §11](../design/documentation-site.md) 要求「组件总览页（`/components/index.md`）的分组顺序与侧栏一致」，但中英总览页缺 `CheckboxGroup`（侧栏与 §11 登记表均已含；2026-09-22 侧栏不变式守卫发现）。候选：把总览页的分组与成员纳入该守卫的受检面 | 低 |
| 触发器 `disabled` 透传与包装层归一化 | ① date-picker / color-picker 未向触发器透传 `disabled`（现由原生 `<button :disabled>` 兜住）；② 两个薄包装对 `disabled=false` 归一化不一致（popover `props.disabled \|\| undefined` vs dropdown 直传），未来 Reka 若区分 `false` / `undefined` 会单边漂移。候选：补透传 + 用例，并对齐归一化 | 低 |
| 直连 Reka 触发器的机检守卫 | 存在本库包装（`CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger` 等）时，组件内直连 Reka 同型触发器应告警；否则「单点生效」收益只能靠人工记忆维持（2026-09-21 触发器收敛后新增） | 低 |
| ui-validator 资产 follow-up | agent/skill 定义优化 | 低 |
| locale 守卫能力演进 | 解析器容忍注释等 | 低 |
| 文档站首页 hydration mismatch | 待定位是否上游行为 | 低 |
| 文档站主题 CSS 的 lint 覆盖 | `lint:css:check` 的 glob 为 `src/**/*.{html,css,scss,sass,vue}`，`docs/.vitepress/theme/**` 的 CSS / SFC 样式不在 stylelint 面内（2026-09-22 实测：文档站窄档收敛规则只能靠人工与浏览器验证）。候选：把文档站主题样式纳入 stylelint 或独立规则面 | 低 |
| README / roadmap 版本句的弱守卫 | 仓库根 `README.md` / `README.en-US.md`（GitHub / npm 渲染，无插值能力）与 `docs/plan/roadmap.md` 的版本表述不在 `docs:check:version` 受检面内，发版需人工同步（[发布指南](../guide/release.md) 已列清单项）。候选：加一条弱守卫（存在性 + 与 `package.json` 一致性**告警**，而非阻断） | 低 |
| @iconify/vue 可选接入 | 字符串图标名 escape hatch | 低 |
| 视觉回归基线 | Playwright 截图比对 | 低 |
| 浮层交互 E2E 规格 | ConfirmDialog / Dialog 焦点落位、滚动锁复位 | 低 |
| 常驻 E2E 规格 follow-up | 滚动容器、键盘聚焦等 | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射 | 低 |
| Storybook 组件工坊 | 暂不启用 | 低 |
| 执行层规则重述与失效引用收敛 | code-reviewer SKILL.md 重述收敛 | 低 |
| 组件画廊浏览器回归断言 | M2-5 V 阶段产出的断言清单（12/12 stage 非空、11 个组件根类名存在、四档 `scrollWidth === clientWidth` 与列数 2/2/2/1、12×2 链接 200 且 locale 前缀正确、Dialog 初始 0 → 点击后 1 且 Portal 到 body、两页 console / pageerror 0）尚未沉淀为常驻用例；触发条件：需要画廊回归保护（与「视觉回归基线」同族，当前不做） | 低 |
| 文档站示例的可访问名补强 | M2-5 V 阶段实测：`docs/examples/input/basic.vue`（中英）仅以 placeholder 提供可访问名，无 `label` / `aria-label`；属示例层问题（组件本身由使用方决定标签落点），非画廊引入 | 低 |
| CHANGELOG 生成器健壮性收口 | 无 remote 降级、语言源自 root；**空 `# Unreleased` 段**（`outputUnreleased: true` 在无未发布提交时仍输出标题，2026-09-22 0.2.0 发布会后实测） | 低 |
| 样式侧旧命名裸类守卫 | `findLegacyNaming` 只扫组件 `types.ts`，样式侧 `.caomei-*--small` / `--large` 回流无守卫（2026-09-21 实测 0 命中）；候选：把旧尺寸命名检测扩展到样式选择器 | 低 |
| check-design 声明解析健壮性 | `declarationsOf` 按 `;` 切分：值内含分号（如 `url(data:image/svg+xml;utf8,…)`）会造出伪造属性名（实测可复现误报，当前全库 0 暴露）；另属性名大小写未归一（`color` / `Color` 漏判）、CSS 嵌套内部不展开（既有解析面限制）。候选：只把匹配属性名形态的片段计为声明 + 非自定义属性名 `toLowerCase()` 比较 | 低 |

### 1.7 服务层候选（composables）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 通用对话框服务 `useDialog` | 用户需求 | **评估结论：暂不实现**。触发条件：出现非组件上下文的命令式弹窗用例 | 低 |

### 1.8 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| momei 侧迁移执行 | **执行主体为 momei 项目**；本仓等待其反馈 | 等待外部反馈 |
| 下游兼容性回归机制 | 见路线图 Phase 8，稳定使用后启用 | 延迟 |

## 2. 维护约定

- 新增候选时注明来源与初步优先级。
- 被否决的候选记录结论与理由。
- 候选状态流转：§1 候选池 → 用户决策后登记到待办事项当前阶段 → 阶段完成后随待办归档迁移；**已交付 / 已归档条目不在本表保留任何内容**。
- 重复发生或需按期重复执行的治理动作，按规划规范 §8 升级到[长期任务台账](./recurring.md)。
