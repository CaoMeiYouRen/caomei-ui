# 下一阶段范围评估（第十五轮）：下游兼容扩容、数据展示动效与依赖卫生

> 创建时间：2026-11-12
> 触发：用户指令「开始规划下阶段改动」，并明确「下游回归应该添加 caomei-auth 和 momei 了」（Phase 30 已归档，当前无进行中阶段）。
> 性质：**范围评估**，不构成阶段登记（[规划规范 §3 / §4](../../standards/planning.md)：阶段编号只在**授权启动**时分配）。
> 候选池现状：`backlog.md` §1 在册 **35 条**（§1.1 **5** + §1.2 **5** + §1.3 **0** + §1.4 **2** + §1.5 **3** + §1.6 **15** + §1.7 **1** + §1.8 **2** + §1.9 **1** + §1.10 **1** = **35**；只计数据行）。本轮新增「依赖 PR 卫生」1 条 → 评估面 **36 条**；下游扩容复用 §1.8 的 momei 行并按用户指令扩为「caomei-auth + momei」，不新增候选行。

## 1. 候选盘点

### 1.1 四源清单

| 来源 | 内容 | 数量 | 性质 |
|:---|:---|:-:|:---|
| **a. backlog 在册** | 组件增强（§1.1）；长尾组件（§1.2）；国际化（§1.4）；移动端（§1.5）；基建与治理（§1.6）；服务层（§1.7）；下游协同（§1.8）；图标体系（§1.9）；动效体系（§1.10） | **35** | 待决策 / 条件触发 |
| **b. 下游与仓库状态** | 2026-11-12 复核：open issue **0**；open PR **21**（Dependabot 20 + dependfix 1，均 `MERGEABLE`）；Dependabot open 告警 **4**（low 2 / medium 2）；`master` HEAD `e0c2de2` 的 Test / CodeQL / Security Alerts / Pages / TODO 全 success | **1** | 新增候选：依赖 PR 卫生（由 21 个待处置 PR 与升级阻塞导出，**未入候选池**） |
| **c. 用户新增方向** | 下游兼容回归加入 `caomei-auth` + `momei`（本轮明确指令） | **0**（并入 §1.8 行） | 已决策方向，待执行 |
| **d. 时点事实（非候选）** | `latest = 1.2.0`（tag `v1.2.0`）；Phase 29 / Phase 30 均未发布，累计能力已构成 minor；Node 24.22.1 / pnpm 11.17.0；下游本地 HEAD：caomei-auth `050b763`（锁 `caomei-ui@1.2.0`）、momei `e24d9c9`（锁 `caomei-ui@1.0.0`） | **4** | 时点事实，不进入候选池 |

> **取证位置**：a 组 = `docs/plan/backlog.md` §1.1 ~ §1.10 数据行逐行计数（2026-11-12）；b 组 = `gh issue list --state open`、`gh pr list --state open --json number,mergeable`、`gh api repos/CaoMeiYouRen/caomei-ui/dependabot/alerts?state=open`、`gh run list --branch master --limit 5`；c 组 = 本会话用户指令；d 组 = `git tag --sort=-v:refname`、`npm view caomei-ui version`、`package.json`、下游仓库 `git log -1` 与 `package.json`。

### 1.2 backlog 分组与落点

| 组 | 行数 | 落点（§2 为唯一映射口径） |
|:---|:-:|:---|
| G1 组件增强（§1.1） | 5 | 范围外（ColorPicker 色板 / DataTable 滚动高度 / DataTable 全选契约 / Paginator 报表 / Select `null` 告警，触发条件均未满足） |
| G2 长尾组件（§1.2） | 5 | 范围外（Sidebar / ScrollPanel / BackTop / Rating / TimePicker，触发条件均未满足） |
| G3 不纳入自研（§1.3） | 0 | — |
| G4 国际化（§1.4） | 2 | 范围外（二期语言 / RTL 未立项） |
| G5 移动端（§1.5） | 3 | 备选 ③ 纳入触摸目标 **P2**（1 行）；Toolbar 769–1023 档与滚动容器聚焦维持范围外 |
| G6 基建与治理（§1.6） | 15 | 备选 ① 纳入「下游兼容检查：校验实际安装版本步骤」（1 行）；其余 14 行维持 |
| G7 服务层（§1.7） | 1 | 范围外（`useDialog` 条件未满足） |
| G8 下游协同（§1.8） | 2 | **A / B / C / D**（下游扩容按用户指令扩为 caomei-auth + momei）；momei 侧迁移执行仍等待外部反馈 |
| G9 图标体系（§1.9） | 1 | 范围外（I5 运行时 peer 条件未满足） |
| G10 动效体系（§1.10） | 1 | **A / B / C**（A7 数据展示）；A1 ~ A6 已交付 |
| G11 依赖 PR 卫生（本轮新增，未入候选池） | 1 | **A / B / C / D**（21 个 open PR + 升级解阻） |
| **合计** | **36** | — |

> **候选覆盖声明**：36 行按能力归并为 11 组（5 + 5 + 0 + 2 + 3 + 15 + 1 + 2 + 1 + 1 + 1 = 36）；**逐条均有落点**——推荐草案 ① 范围内 **5**（G8 下游扩容 / G6 安装版本断言 / G10 A7 / G5 触摸 P2 / G11 依赖卫生），范围外 **31**；备选 ② 范围内 **3**（G8 / G10 / G11），范围外 **33**；备选 ③ 范围内 **3**（G8 / G5 / G11），范围外 **33**；备选 ④ 范围内 **2**（G8 / G11），范围外 **34**；备选 ⑤ 范围内 **2**（G8 / G6 安装版本断言），范围外 **34**。无静默豁免。
>
> **候选数 ≠ 条目数**：G8 下游扩容按 2 条原子条目拆分（矩阵扩容 / 安装版本断言），G11 依赖卫生按 2 条拆分（eslint-plugin-vue 解阻 / PR 复核与 reka-ui 决策），G10 A7 与 G5 触摸 P2 各 1 条。

### 1.3 重点候选取证

| 候选组 | 现状读数 | 缺口 / 触发 |
|:---|:---|:---|
| **下游兼容扩容** | caomei-auth：`CaomeiYouRen/caomei-auth` 公开仓，根包 `caomei-auth`，`pnpm@11.17.0`，`engines` 允许 Node 24；`typecheck = nuxt typecheck`、`build = nuxt build`；当前锁 `caomei-ui@1.2.0`；需 `patches/` 与 better-sqlite3 / sqlite3 原生编译。momei：`CaomeiYouRen/momei` 公开仓，根包 `momei`（workspace 含 `packages/*`），`pnpm@11.17.0`，`engines` 为 `24.x`；`typecheck = nuxt typecheck`、`build = cross-env NODE_OPTIONS=--max-old-space-size=6144 nuxt build`；当前锁 `caomei-ui@1.0.0`；Dockerfile 在 build 前先构建 `@momei-blog/api-client` 与 `momei-mcp-server` | 现有 `matrix` 仅 dependfix；override 步骤按下游包名选中根工程即可复用。**容量风险**：两仓依赖重、momei 构建堆上限 6GB，现有 job `timeout-minutes: 30` 可能不足，需按条目实测分配（拟 45 / 60）。**版本差**：momei 锁 1.0.0，接入后首次 run 即验证 1.0.0 → 1.2.0 升级面；本地命令可行性实测见 §1.4 |
| **安装版本断言** | Backlog §1.6 条件候选：override 后当前只由「版本差 + lockfile 变化 + 命令语义」推断重装生效；工作流改动只能在真实 run 中验证 | 触发条件 = 下次发布前后可在真实 run 中验证；本轮正触碰同一工作流，适合同批加入 fail-closed 断言并写入 job summary |
| **动效 A7 数据展示** | 评估 §8：DataTable 行 / 展开 / 排序 / 选择、DataView 切换、Paginator / Progress / Skeleton；Chart / RichTextEditor 仅容器层加载 / 空态。A1 共享 token / reduce 与 Phase 29 ~ 30 的 E2E 装置已可复用 | 用户优先级序列的最后一族；DataTable 行重排与固定表头性能风险最高，避免布局抖动 |
| **触摸目标 P2** | 审计 §4：行高受限与内联行 **35** 个，须逐项确认交互绑定（P0 / P1 已由 Phase 27 / Phase 30 交付） | 改行高会触及视觉基线，需重冻结；风险与工作量高于 P1 |
| **依赖 PR 卫生** | 21 个 open PR 均 `MERGEABLE`，但当前 run 存在两类红：① `eslint-plugin-vue` 10.12.0 升级后 `stepper.vue` 触发 `vue/no-dupe-keys`（`defineModel` 与 `StepperProps.modelValue` 同名；`rich-text-editor` / `tags-input` 的 types 已显式声明「不含 `modelValue`」，升级后实跑确认，预期 no-op）；② `manual-release` 安全不变量用例在部分 PR run 失败（需复核是否为陈旧 base 或真实缺陷）。`reka-ui` 2.11.0 PR #33 命中 Backlog 已登记的 4 例 InputNumber 步进回归 | 阻塞所有依赖 PR 的合并与发布前 lockfile 收敛；`reka-ui` 需明确「维持 2.10.4 + 阻断」或「适配 2.11」；`eslint-plugin-vue` 解阻后可批量恢复自动合并 |
| **发布 1.3.0** | `latest` 仍 1.2.0；Phase 29（动效基础层 / 图标体系 / Paginator）与 Phase 30（A4 ~ A6 / 触摸 P1）均未发布，累计为 minor；CI 发布链（semantic-release + OIDC）已在 1.1.0 / 1.2.0 验证 | 需阶段全部条目完成 + Review Gate + 第 34 轮长期任务门槛复核；推送 / 发布以用户当次明确授权为准 |

### 1.4 下游可行性实测（2026-11-12，本地）

> 目的：为「无凭据可行性未验证」解除阻塞提供实测依据。命令与工作流 `matrix` 一致；**不含** `pnpm i --frozen-lockfile` 与 override 到目标版本的耗时，CI 实际用时更高。

| 下游 | revision / 锁定版本 | 实跑命令 | 结果 | 本地耗时（warm `node_modules`） |
|:---|:---|:---|:---|:---|
| caomei-auth | `050b763` / `caomei-ui@1.2.0` | `pnpm typecheck` + `pnpm build` | exit 0 | typecheck **21s** / build **1m41s** |
| momei | `e24d9c9` / `caomei-ui@1.0.0` | `pnpm --filter @momei-blog/api-client build` + `pnpm --filter momei-mcp-server build` + `pnpm typecheck` + `pnpm build` | exit 0 | 包构建 **2s + 2s** / typecheck **59s** / build **1m58s** |

> 环境：Node **24.22.1** / pnpm **11.17.0**（与两仓 `packageManager` 一致）。非致命告警：caomei-auth 的 `useToast` / `useConfirm` 双库并存重复导入、`vue-recaptcha` 与 Nuxt 4 不兼容；momei 的 `manualChunks` 未知输入选项。均不影响 `typecheck` / `build` 退出码。


## 2. 主线草案（裁定前草案，符合[规划规范 §6](../../standards/planning.md) 的 3 ~ 6 条容量）

> **本节是候选 → 主线的唯一映射口径**（[规划规范 §9](../../standards/planning.md)），同时是**裁定前草案**：最终构成以 §5 为准（D2 ② 未发布，F 不纳入）。**「主线草案表行」与「各主线最小验收」须成对核对**；同一事实两处出现时以源码取证为准。

| 主线 | 内容 | 条目 | 论证 |
|:---|:---|:-:|:---|
| **A 下游兼容扩容（用户指定）** | `downstream-compat.yml` 新增 caomei-auth / momei；按下游补齐 setup、按条目分配 timeout；同步发布指南 §10 与 Backlog §1.8 | 1 | 用户已明确指令；两仓均为公开仓、命令已确认；momei 首次覆盖即验证 1.0.0 → 1.2.0 版本差 |
| **B 实际安装版本断言** | override 后断言 `caomei-ui` 实际版本 == 目标版本（fail-closed），结果写入 job summary | 1 | Backlog 条件候选，触发条件正好命中；与 A 同工作流，合并验证成本最低 |
| **C 数据展示动效（A7）** | DataTable 行 / 展开 / 排序 / 选择、DataView 切换、Paginator / Progress / Skeleton 统一；Chart / RichTextEditor 仅容器层加载 / 空态；避免布局抖动 | 1 | 用户动效优先级最后一族；装置已成熟；风险集中在 DataTable |
| **D 触摸目标 P2** | 35 个行高受限 / 内联行目标逐项确认交互绑定并扩到 ≥24×24；按需重冻结视觉基线 | 1 | 移动端 / 无障碍治理的自然续作；视觉零变化不可保证，需单独评测 |
| **E 依赖 PR 卫生** | ① `eslint-plugin-vue` 10.12 解阻（`stepper.vue` 同名清理已实证；RTE / TagsInput 升级后实跑确认）；② 21 个 open PR 复核 / 合并 / 关闭 + `reka-ui` 2.11.0 决策 | 2 | 直接阻塞依赖合并与发布前收敛；属治理 / CI 卫生，非用户可见能力 |
| **F 阶段末发布 1.3.0** | 经 CI 发布 + 下游 compat（含新增两仓）复验 + 版本句 / 里程碑回填 | 1 | Phase 29 / 30 累计 minor；发布链已验证 |

**各主线最小验收（登记前仍需在登记记录定稿）**：

- **A（下游扩容）**：执行范围 = `matrix` 新增两仓 + setup / timeout + 发布指南 §10 中英同步 + Backlog 移除 momei 行；非目标 = 改动现有 dependfix 口径 / 引入凭据；验收 = 两仓各自 `typecheck` + `build` 真实 run success，revision 写入 summary。
- **B（版本断言）**：执行范围 = override 后断言实际版本 + 输出 summary；非目标 = 改 `minimumReleaseAge` 既有两层处理；验收 = 正向 run 通过，显式传入不匹配版本时 fail-closed（负向）。
- **C（A7）**：执行范围 = 数据展示族状态动效 + 统一 token；非目标 = 改变 `minimal` 外观 / 新增组件能力；验收 = `minimal` 零差异、`reduce` 压平、无布局抖动、`capture:styles` / 视觉基线默认组 0 差异。
- **D（触摸 P2）**：执行范围 = 35 个目标逐项确认交互绑定并扩命中区；非目标 = 改视觉盒 / 改行高以外的布局；验收 = 逐轴 `max(边长, 24)`、视觉盒不变或重冻结后 0 差异、负向探针可判失败。
- **E（依赖卫生）**：执行范围 = `stepper` 同名清理（已实证）+ `rich-text-editor` / `tags-input` 升级后实跑确认（types 已声明不含 `modelValue`，预期 no-op）+ 规则升级；21 个 PR 逐条结论；`reka-ui` 维持或适配二选一；非目标 = 放宽 Mergify 自动合并条件；验收 = `eslint-plugin-vue` 升级后 `lint:check` 全绿，PR 列表收敛，`reka-ui` 决策留痕。
- **F（发布 1.3.0，D2 ② 未纳入）**：执行范围 = 阶段末经 CI 发布 + 下游 compat 三仓 + 版本句 / 里程碑；非目标 = 发布未授权内容；验收 = Release run success、`latest` / tag / 回推一致、下游 compat success。**本阶段不发布，本条不进入最终构成。**

## 3. 待决策点（D0 ~ D5）

| 编号 | 决策点 | 备选 | 推荐 |
|:---|:---|:---|:---|
| **D0** | 裁定后是否登记 | ① **直接登记下一阶段** ② 只记录裁定，稍后登记 | **①**（用户已给出「开始规划」与下游明确指令，登记条件成熟） |
| **D1** | 阶段主线组成（不含发布） | ① **下游扩容 + 安装版本断言 + A7 + 触摸 P2 + 依赖卫生**（5 主线 / 6 条目）② 下游扩容 + A7 + 依赖卫生（3 主线 / 4 条目）③ 下游扩容 + 触摸 P2 + 依赖卫生（3 主线 / 4 条目）④ 下游扩容 + 依赖卫生（2 主线 / 3 条目）⑤ 仅下游扩容 + 安装版本断言（2 主线 / 2 条目） | **①**（覆盖用户指令、动效收尾、移动端续作与依赖解阻；5 条主线仍在容量内） |
| **D2** | 阶段末发布 | ① **发 1.3.0（minor）** ② 不发布，继续积累 ③ 现在就发 1.3.0（不等阶段） | **①**（Phase 29 / 30 累计能力已具备 minor 语义；发布链已验证；推送 / 发布以当次授权为准） |
| **D3** | 下游扩容执行时机 | ① **立即作为独立批次执行**（与阶段登记解耦，先拿真实 run）② 作为下一阶段主线 A 随阶段执行 | **①**（用户已明确「应该添加了」；工作流改动需真实 run 才能验证，先执行可尽早暴露容量问题） |
| **D4** | 安装版本断言 | ① **与下游扩容同批加入** ② 维持 Backlog，下一轮再做 | **①**（同一工作流、同一验证 run；fail-closed 成本低） |
| **D5** | 依赖 PR 卫生范围 | ① **eslint-plugin-vue 解阻 + `stepper` 同名清理（RTE / TagsInput 待实跑确认）+ 常规 PR 合并** ② ① + `reka-ui` 2.11.0 适配 ③ 仅合并已绿 PR，不处理升级解阻 | **①**（先解除所有 PR 的共同阻塞；`reka-ui` 回归需单独改动 InputNumber，风险与验证面更大，可另立条目） |

**组合对账与互斥说明**：

- **推荐组合**（D1 ① + D2 ① + D3 ① + D4 ① + D5 ①）= **5 主线 / 7 条目**（下游扩容 1 / 安装版本断言 1 / A7 1 / 触摸 P2 1 / 依赖卫生 2 / 发布 1）。
- **互斥 / 包含**：D1 ② ~ ⑤ 已省略的主线不再计入条目；D3 ① 执行下游扩容时，该批次仍可作为下一阶段主线 A 的**已完成前置**登记（不重复计条目）；D4 ① 仅在 D1 含下游扩容时成立；D5 ② 若被选中，依赖卫生由 2 条增至 3 条（`reka-ui` 适配另立）。
- **D2 ③（现在就发）与 D1 冲突**：若选 D2 ③，发布须在阶段条目之前执行，且只覆盖 Phase 29 / 30 已交付能力，下一阶段另立发布条目。

> **默认落定（不占决策项）**：不引入破坏性 API 变更；中英文档同步；不新增运行时依赖；A7 的 `minimal` 保持零差异；触摸 P2 若触发视觉变更须先重冻结基线；RTL / 二期语言 / 长尾组件 / I5 / Tailwind / UnoCSS / 文档站多版本 / Storybook 维持范围外；推送与发布以用户当次明确指令为前提。

## 4. 规模与风险

1. **下游扩容是工作流改动，只能在真实 run 中验证**：本地已实测两仓 `typecheck` + `build` 均 exit 0（§1.4），阻塞条件「无凭据可行性未验证」解除；但本地耗时不含依赖安装与 override，CI 仍可能显著更长。建议 caomei-auth 45 分钟、momei 60 分钟；首跑按「依赖安装 / 工作区包构建 / `nuxt build`」三段归因，超时先定位阶段再调预算，不直接降检查面。
2. **A7 性能风险最高**：DataTable 行重排 / 批量选择 / 固定表头组合可能引入布局抖动；按「DataTable 核心 → 其余数据展示族」拆子批，逐批跑 `capture:styles` 与视觉基线。
3. **触摸 P2 会触碰视觉基线**：35 个目标中行高受限项改行高会影响既有截图；须先逐项确认交互绑定，再决定「不可见命中区」或「行高调整」，后者单独重冻结。
4. **依赖卫生是发布前置**：21 个 open PR 未收敛会持续产生 lockfile 分叉；`eslint-plugin-vue` 10.12 的规则升级同时可能影响 `rich-text-editor` / `tags-input`，须逐个确认是否为真实同名而非误报。`reka-ui` 2.11.0 的 4 例回归已有可判定触发条件（Backlog §1.6），不建议在未适配时由 Mergify 自动合入。
5. **本阶段不发布（D2 ②）**：`latest` 维持 `1.2.0`，不执行 `pnpm release`；Phase 29 / 30 累计能力继续留待后续阶段明确授权。下游 compat 首次覆盖三仓的真实取证仍在本阶段 M1 完成，发布链的 dispatch 轮询与新增 job 时长留待下次发布 run 复核。
6. **本轮新增候选**：「依赖 PR 卫生」为本轮评估新增候选，**未写入候选池**；D5 ① 裁定后直接登记为 Phase 31 条目。下游扩容复用 §1.8 的 momei 行，登记后按规划规范移除该候选行。

## 5. 裁定结果（用户 2026-11-12）

| 编号 | 裁定 | 结论 |
|:---|:---|:---|
| **D0** | **①** | 直接登记为 **Phase 31**（取当前最大编号 30 + 1） |
| **D1** | **①** | 取全量组合：下游扩容 + 安装版本断言 + A7 数据展示动效 + 触摸目标 P2 + 依赖 PR 卫生 |
| **D2** | **②** | 本阶段**不发布**，继续积累（`latest` 维持 `1.2.0`） |
| **D3** | **①** | 下游扩容**立即作为独立批次执行**，与阶段登记解耦，先拿真实 run |
| **D4** | **①** | 安装版本断言**与下游扩容同批加入**（fail-closed） |
| **D5** | **①** | 依赖卫生取「`eslint-plugin-vue` 解阻 + `stepper` 同名清理（RTE / TagsInput 待实跑确认）+ 常规 PR 合并」；`reka-ui` 2.11.0 适配**不纳入**本批（另立条目评估） |

> **组合后构成**：**5 条主线 / 6 条原子条目**（下游扩容 1 / 安装版本断言 1 / A7 1 / 触摸 P2 1 / 依赖卫生 2 = 6），D2 ② 不发布；最终构成以 [Phase 31 登记批次记录](./2026-11-12-phase31-registration.md) §1 为准。

