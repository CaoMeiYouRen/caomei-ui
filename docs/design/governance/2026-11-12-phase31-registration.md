# Phase 31 登记批次记录

> 创建时间：2026-11-12
> 触发：用户就[下一阶段范围评估（第十五轮）](./2026-11-12-next-stage-scope-evaluation-15.md) §3 的 D0 ~ D5 作出裁定：**D0 ① 直接登记 / D1 ① 全量组合 / D2 ② 不发布 / D3 ① 下游扩容立即独立执行 / D4 ① 安装版本断言同批加入 / D5 ① eslint-plugin-vue 解阻 + 常规 PR 合并**。
> 依据：[规划规范 §3 / §4](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 30）+ 1 = **Phase 31**。
- **构成（5 条主线 / 6 条原子条目）**：下游兼容扩容 **1** + 实际安装版本断言 **1** + 数据展示动效 A7 **1** + 触摸目标 P2 **1** + 依赖 PR 卫生 **2**；对账 **1 + 1 + 1 + 1 + 2 = 6**。
- **取向来源**：D1 ① 全量组合；D2 ② **本阶段不发布**（继续积累，`latest` 维持 `1.2.0`）；D3 ① 下游扩容立即作为独立批次执行；D4 ① 安装版本断言与扩容同批；D5 ① 先解除依赖 PR 的共同阻塞，`reka-ui` 2.11.0 适配不纳入本批。
- **组合口径**：D1 ① 的 6 条（不含发布）即最终构成；评估 §3 的「D1 ① = 5 主线 / 6 条目」与本节一致。D2 ② 不发布，故无发布条目。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | 下游兼容扩容 | `downstream-compat.yml` 新增 `caomei-auth`（根包 `caomei-auth`；`setup = pnpm exec nuxt prepare`；`typecheck = pnpm typecheck`；`build = pnpm build`）与 `momei`（根包 `momei`；`setup = pnpm --filter @momei-blog/api-client build && pnpm --filter momei-mcp-server build && pnpm exec nuxt prepare`；`typecheck` / `build` 同根脚本）；job `timeout-minutes` 改为按 `matrix` 取值（dependfix 30 / caomei-auth 45 / momei 60）；同步[发布指南 §10](../../guide/release.md) 与 Backlog §1.8 | 本地可行性已实测（评估 §1.4）；真实 run 中三仓 `typecheck` + `build` 均 success，各 job summary 记录下游 revision；不引入凭据、不改 dependfix 现有口径 |
| **M2-1** | 实际安装版本断言 | override 后新增 `Assert installed caomei-ui version`：在目标包目录读取 `node_modules/caomei-ui/package.json`，与目标版本不一致即 fail-closed；结果写入 job summary | 正向 run 断言通过；版本不匹配时 exit 1（本地以不匹配 `EXPECTED_VERSION` 负向验证）；对根包与 workspace 子包（dependfix `@dependfix/platform`）均可用 |
| **M3-1** | 数据展示动效（A7） | DataTable 行 / 展开 / 排序 / 选择、DataView 切换、Paginator / Progress / Skeleton 统一到动效 token；Chart / RichTextEditor 仅容器层加载 / 空态；避免布局抖动；`minimal` 零差异、`reduce` 压平 | `minimal` 逐选择器零差异；`expressive` 下状态动效可采样、可打断；无布局位移；`capture:styles` / `test:visual` 默认组 0 差异；新增或扩展数据展示 E2E |
| **M4-1** | 触摸目标 P2 | 审计 §4 的 **35** 个行高受限 / 内联行目标逐项确认交互绑定；优先不可见命中区 ≥24×24；确需改行高者单独重冻结视觉基线 | 逐轴 `max(边长, 24)` 探针覆盖；视觉盒不变或重冻结后 0 差异；相邻目标 Chebyshev 中心距 ≥24；键盘 / 焦点不回归；负向探针可判失败 |
| **M5-1** | 依赖卫生：升级解阻 | 升级 `eslint-plugin-vue` 至 10.12.x 并处理 `vue/no-dupe-keys`：`stepper.vue` 的 `defineModel` 与 `StepperProps.modelValue` 同名（已实证）；`rich-text-editor` / `tags-input` 的 types 已显式声明不含 `modelValue`，升级后实跑确认（预期 no-op）；优先用 `Omit<Props, 'modelValue'>` 保持对外类型不删除 | `lint:check` 全绿（`--max-warnings 0`）；`typecheck` / 定向单测通过；公共 API 无删除 / 无重命名（API diff 0） |
| **M5-2** | 依赖卫生：PR 复核 | 复核 **2026-11-12 读数 21 个** open PR（Dependabot 20 + dependfix 1；执行时以当时的 open 列表为准，新增项同口径处置）：已绿且无已知回归者合并；被替代 / 重复者关闭；`reka-ui` 2.11.0（#33）维持阻断并留痕（4 例 InputNumber 回归）；复核 `manual-release` 安全不变量用例的失败是否陈旧 base | 每个在册 PR 均有结论（合并 / 关闭 / 维持开放 + 理由）；Mergify 条件不放宽；结尾 open PR 列表无「无结论」项；不触碰 `release.config.js` / `release.yml` |

## 3. 非目标（本阶段）

- **不发布**（D2 ②）：`latest` 维持 `1.2.0`，不执行 `pnpm release`、不触发 Release；发布留待后续阶段明确授权。
- `reka-ui` 2.11.0 适配（D5 ① 之外）；依赖大版本升级；放宽 Mergify 自动合并条件。
- RTL / 国际化二期；长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker）；图标 I5 运行时 peer。
- 破坏性 API 变更；Tailwind / UnoCSS；文档站多版本托管；Storybook；文档站 demo 过渡恢复。
- 不新增运行时依赖。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 声明「当前进行中阶段：Phase 31」+ `## Phase 31 原子条目` 段（6 行，状态「待执行」） |
| `docs/plan/roadmap.md` | §1 当前态改为 Phase 31；阶段表新增 Phase 31 行 |
| `docs/plan/backlog.md` | 移出：A7（§1.10 1 行）、触摸目标 P2（§1.5 1 行）、momei 根包接入（§1.8 1 行）、安装版本断言（§1.6 1 行）；候选池 **35 → 31**（4 行移出）；**「依赖 PR 卫生」为本轮评估新增候选、从未写入候选池**，D5 ① 裁定后直接登记；momei 侧迁移行保留（等待外部反馈） |
| `docs/design/governance/index.md` | 新增本记录 |
| `.session`（git-ignored） | `current_phase` / `active_plan` / `next_steps` 与 `runtime-state.json` 的 `plan_state` 同批同步 |

## 5. 风险与前置

1. **M1-1 / M2-1 属工作流改动，只能在真实 run 中验证**：用户已裁定立即执行；本地完成命令可行性与版本断言负向验证后提交，真实 `workflow_dispatch` 需推送授权。首次 run 三仓并行，momei 依赖安装 + 两包构建 + Nuxt build 的实际耗时决定 60 分钟预算是否足够；超时先归因，不降检查面。
2. **momei 版本差**：当前锁 `caomei-ui@1.0.0`，首次 run 将 override 到目标版本（若发布前无新版本则为 `1.2.0`），直接验证 1.0.0 → 1.2.0 的升级面；失败不得归因到 momei 自身改动，需以 revision 记录区分。
3. **M3-1 性能风险**：DataTable 行重排 / 批量选择 / 固定表头组合可能引入布局抖动；若单条超 10 文件阈值，按「DataTable 核心 → 其余数据展示族」拆子批并逐批跑基线。
4. **M4-1 视觉基线**：35 个目标中行高受限项改行高会改变既有截图；须先逐项确认交互绑定，再决定不可见命中区或行高调整；后者单独重冻结。
5. **M5-1 公共类型**：仅 `StepperProps.modelValue` 已实证与 `defineModel` 同名；`rich-text-editor` / `tags-input` 的 types 已显式声明不含 `modelValue`，升级后实跑确认（预期 no-op）。若 `StepperProps.modelValue` 从类型删除会影响导出类型消费方，优先 `Omit` 编译期去重，保持 API 表面不删除，收口以 API diff 0 为准。
6. **M5-2 依赖 PR 合并的授权与顺序**：必须待 M5-1 落地并让 PR 重跑 CI 后再合并；`reka-ui` 2.11.0 在 4 例回归消除前不得合入；合并 / 关闭操作按 [GitHub 协作规范](../../standards/github-collaboration.md) §3 执行。
7. **阶段收口**：本阶段不发布；收口前执行长期任务第 **34** 轮门槛复核。

## 6. Review Gate

- **audit-depth**：`standard`（规划载体登记 + 跨载体计数 + 候选池变更；M1-1 / M2-1 工作流改动另计代码面）；时间盒 ≤ 10 分钟。
- **lint / typecheck 替代声明**：本批零 `src/**` / `test/**` 改动，`eslint` / `vue-tsc` 无可判定面；以工作流 YAML 解析、版本断言正负例复现（根包 + workspace 子包）与文档门禁替代，后续实现批次随 `pnpm verify` 覆盖。
- **R1**（2026-11-12，`standard`）：**Reject**，5 blocker / 5 warning / 2 suggest。blocker 与处置：
  1. 候选池口径错误（把「依赖 PR 卫生」写成已入 backlog、36 → 31）→ 改为「在册 35，评估面 36；依赖卫生未入池即登记」、候选池 **35 → 31（4 行移出）**。
  2. 英文发布指南未同步旧口径 → `docs/i18n/en-US/guide/release.md` §10 同步三仓 / 版本断言 / 容量锚点。
  3. 「3 个同名清理」无取证 → 改为「`stepper` 已实证；RTE / TagsInput types 已声明不含 `modelValue`，升级后实跑确认（预期 no-op）」。
  4. 时间盒写成 12 分钟 → 改为 ≤10 分钟。
  5. 评估索引摘要仍写「待裁定 / 未登记」→ 改为已裁定并登记，推荐组合标注为评估时点快照。
  - warning 处置：同步 `.session`；「21 个 PR」标注时点读数；版本断言移到 `Setup downstream build chain` 之后；发布指南去掉 timeout 数值复制；补 lint / typecheck 替代声明。
  - suggest 采纳：版本断言的 `GITHUB_STEP_SUMMARY` 写入加存在性守卫；首跑按三段归因。
- **R2**（2026-11-12，`standard`，仅复审修复点）：**Reject**，1 复发 blocker（R1 blocker3 未扫全）——评估 §2「各主线最小验收」仍写「3 个组件的同名清理」。已改为「`stepper` 已实证 + RTE / TagsInput 实跑确认（预期 no-op）」，并在评估 §2 顶部加「草案表行与最小验收须成对核对」注记。
- **R3**（2026-11-12，`quick`，仅复审 R2 单点）：**Pass**，0 blocker。评估 §2-E 已与 §1.3 / §2 表行 / 登记记录 / roadmap 五处口径一致；§2 顶部注记与 F 行标注消除了「草案 = 最终构成」歧义。残余风险：真实 run 未取证、RTE / TagsInput 的 no-op 为源码推断、21 个 PR 为时点读数。
- **用时实测**：R1 发起 11:25:38，宿主总耗时约 10 分 29 秒；其中审计段约 5 分钟（低于 ≤10 分钟时间盒），R1 修复与门禁复跑约 5 分钟（不计入审计时间盒）。R2 复审约 2 分钟，R3 约 1 分钟，均未超时间盒。
- **复查基线**：本记录 §1 / §2 / §4；`docs/plan/todo.md` 当前状态与条目表；`docs/plan/roadmap.md` §1 与阶段表；`docs/plan/backlog.md` §1.5 / §1.6 / §1.8 / §1.10 计数；[第十五轮评估](./2026-11-12-next-stage-scope-evaluation-15.md) §2（**「主线草案表行」与「各主线最小验收」须成对核对**）与 §5；`docs/design/governance/index.md` 摘要；`.github/workflows/downstream-compat.yml` 步骤顺序。
