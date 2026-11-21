# 待办归档（深度归档）：Phase 31

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 31：下游兼容扩容、数据展示动效与依赖卫生（**2026-11-12 完成并归档；本阶段不发布**）

- 时间：2026-11-12 用户就[下一阶段范围评估（第十五轮）](../../design/governance/2026-11-12-next-stage-scope-evaluation-15.md) §3 裁定 D0 ① / D1 ① / D2 ② / D3 ① / D4 ① / D5 ① 后登记；同日交付 **5 条主线 / 6 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：取**全量组合**（D1 ①）——下游兼容扩容 **1** / 实际安装版本断言 **1** / 数据展示动效 A7 **1** / 触摸目标 P2 **1** / 依赖 PR 卫生 **2**；构成对账 **1 + 1 + 1 + 1 + 2 = 6**。**本阶段不发布**（D2 ②）：`latest` 维持 `1.2.0`，未执行 `pnpm release`、未触发 Release workflow。范围与验收口径的单一事实源见[Phase 31 登记批次记录](../../design/governance/2026-11-12-phase31-registration.md) §1 / §2。
- 非目标：发布；`reka-ui` 2.11.0 适配（D5 ① 之外，评估后登记 Backlog）；RTL / 国际化二期；长尾组件；破坏性 API 变更；Tailwind / UnoCSS；文档站多版本托管；Storybook；新增运行时依赖。

### M1 下游兼容扩容（1 条）

- **M1-1 下游兼容矩阵扩容**（提交 `1ec8464`（PR #51）；真实 run `43211984429`；记录见 [M1-1 / M2-1](../../design/governance/2026-11-12-phase31-m1-1-m2-1-downstream-compat.md)）：`downstream-compat.yml` 受检矩阵新增 `caomei-auth` / `momei`，按仓配置 `setup` 与 `timeout-minutes`；中英发布指南 §10 同步三仓清单。真实 `workflow_dispatch` 三仓（`dependfix` / `caomei-auth` / `momei`）**全部 success**，被测 `1.2.0`，首跑约 3 分钟。工作流按「触及构建面走分支 + PR」合并。RG 登记批次 R1 / R2 `Reject` → R3 `Pass`；记录批次 R1 `Reject` → R2 `Pass`。

### M2 实际安装版本断言（1 条）

- **M2-1 override 后 fail-closed 断言**（同上提交与记录）：override 且构建链 setup 完成后读取目标包 `node_modules/caomei-ui/package.json`，与目标版本不一致即失败，结果写入 job summary；真实 run 未触发 fail-closed（三仓 `installed caomei-ui 1.2.0`）。本地正负例覆盖根包与 workspace 子包。RG 同 M1-1。

### M3 数据展示动效（1 条）

- **M3-1 数据展示动效 A7**（提交 `dbe87cc`；记录见 [M3-1](../../design/governance/2026-11-12-phase31-m3-1-data-display-motion.md)）：DataTable 行底色 / 排序提亮 / 展开入场，DataView 状态与布局切换入场，Chart / RichTextEditor 容器层就绪入场；Paginator / Progress / Skeleton 审计不改（已 token 化）。`minimal` 零差异、`reduce` 压平、不做整表重排动画；新增两套常驻 E2E（27 + 12 passed）。RG R1 / R2 / R3 均 `Pass`（0 blocker；R1 / R2 各 4 warning，R3 0 warning）。

### M4 触摸目标（1 条）

- **M4-1 触摸目标 P2**（提交 `09a7205`；记录见 [M4-1](../../design/governance/2026-11-12-phase31-m4-1-touch-target-p2.md)）：35 个审计目标逐项确认——行高受限 6 个（DataTable 排序 / Breadcrumb 链接 / Select 清除）复用不可见 `::after`；内联行 22 个按组件绑定方式处置（普通 Input 控件盒填满外壳内容高、TagsInput 根节点补点击聚焦、MultiSelect / AutoComplete 锚点承接）；值片与值片内 icon 7 项判为非指针目标排除。探针新增 P2 分族与四族点击聚焦断言（21 passed）。RG R1 `Reject`（TagsInput 绑定误判）→ R2 `Pass`（0 blocker / 2 warning 已收口）。

### M5 依赖 PR 卫生（2 条）

- **M5-1 `eslint-plugin-vue` 10.12 解阻**（提交 `814ed2b`；PR #48；记录见 [M5-1](../../design/governance/2026-11-12-phase31-m5-1-eslint-plugin-vue-unblock.md)）：`stepper.vue` 的 `defineProps` 改为 `Omit<StepperProps, 'modelValue'>` 编译期去重，导出类型与 `v-model` 契约不变；升级 PR 在带上修复后 CI 全绿并合并。RG `quick` R1 `Pass`。
- **M5-2 依赖 PR 复核与收口**（提交 `4647e11` / `5000a5f`；记录见 [M5-2](../../design/governance/2026-11-12-phase31-m5-2-dependency-pr-closure.md)）：在册 6 个 PR——#48 / #30 / #41 / #32 / #34 合并，#33（`reka-ui` 2.11.0）按登记维持阻断并留痕；辅助维护 = 许可证台账标题随安装版本（正文经 tarball 逐字比对一致）+ axe 4.14 默认启用的 `label-content-name-mismatch` 8 条 needsReview 人工复核后登记；`manual-release` 失败复核为陈旧 base。未放宽 Mergify、未触碰发布配置。RG `deep` R1 `Reject` → R2 `Reject` → R3 `Pass`（0 blocker）。

### 阶段总结

- **5 条主线 / 6 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.2.0`。
- **提交对账**：`git log --oneline d69db1a..09a7205 | wc -l` → **34**（下界 = 上一阶段归档提交 `d69db1a`，上界 = 本阶段末条提交 `09a7205`）。按「本阶段主动处置 / 记录」计 **16**（`1ec8464` / `dbe87cc` / `d20bcf9` / `814ed2b` / `bdd7483` / `c6363b8` / `9e642b4` / `e30a75c` / `d979dab` / `7fd1cbd` / `ed274af` / `6556380` / `4647e11` / `5000a5f` / `55d3a2a` / `09a7205`，其中含依赖 PR 的许可证台账与 a11y 例外提交）；其余 **18** 为背景变更（Mergify / dependabot 自动合并、安全修复 #49、发布流修复 #50 与巡检规范补口 `e0c2de2`）。
- **质量门**：`09a7205` 的 CI（Test / Security Alerts / Pages / TODO to Issue）全部 success；归档批次复跑 `lint:md:check` / `docs:check:links` / `check:governance-records` / `check:stage-counts` / `governance:check` 均为绿。
- **长期任务**：第 **34** 轮门槛复核（2026-11-12，Phase 31 收口轮）——待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持；`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14，与第 33 轮逐项一致；`capture:styles` **399 项** 0 差异（与第 33 轮一致，本阶段未扩采样面）。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **8 条活跃（< 阈值 20，不蒸馏）**；`pnpm check:distill-archive` 归档段对账通过。本阶段新增 2 条可复用发现（scoped `:where([data-motion]) :is(...)` 的 scope 属性落点陷阱；Playwright 默认 `reducedMotion: reduce`，动效采样规格须显式 `no-preference`）。

### 回扫口径（三段式）

- **机检面**：`pnpm check:governance-records` 全绿（`todo.md` 清空阶段段落后无 `stale-planning-pointer`）；`check:planning-numbers` / `check:stage-counts` / `docs:check` 全绿。
- **人工面**：本阶段新增记录（M1-1/M2-1、M3-1、M4-1、M5-1、M5-2）与归档块逐条核对，无「链接文字为载体名、编号写在链接外」的失效散文指针；`docs/guide/mobile.md` 与 `en-US` 的 P2 段已随 M4-1 改为已交付并回链记录。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述（含 Phase 31 登记批次对 `todo.md` 的引用）按既有边界不回改——归档后 `todo.md` 已清空阶段段落，其失效由机检守卫覆盖范围之外的散文形态承担。

### 遗留与后续候选

- 本阶段不发布；`latest` 维持 `1.2.0`，版本积累至下一阶段。
- `reka-ui` 2.11.0 适配：评估已完成（5 文件 / 约 14 行，3 例测试装置 + 1 例触摸 `change` 时序），登记于 [Backlog §1.6](../backlog.md)「`reka-ui` 补丁升级」行，待用户授权实施；#33 维持开放。
- 依赖告警：`node-forge` low（dependabot #69）仍开放。
- 已知观察：`test:visual` 的 `font-latin*` / `font-mixed*` 6 项在本地环境持续失败（改动前后一致、非本阶段引入），基线未更新。
