# Phase 26 登记批次记录

> 创建时间：2026-10-22
> 触发：用户就[下一阶段范围评估（第十轮）](./2026-10-22-next-stage-scope-evaluation-10.md) §3 的 D1 ~ D5 决策点回「**按推荐来**」——取 ④ / ① / ① / ① / ③。
> 依据：[规划规范 §3 / §4](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 25）+ 1 = **Phase 26**（条件式口径见[第十轮评估](./2026-10-22-next-stage-scope-evaluation-10.md) §5）。
- **构成（4 条主线 / 13 条原子条目）**：冻结面终审与 1.x 承诺落地 **4** + 行为收口与准破坏性变更 **4** + 发布链路就绪与 1.0 交付 **3** + 下游复验与质量确认 **2**；对账 4 + 4 + 3 + 2 = **13**。
- **取向来源**：D1 ④ 全取四条主线；D2 ① rc → 转正、维持手动；D3 ① DataTable 主项 + ①②③ 全做；D4 ① `Form` 只评估；D5 ③ 发布时 API 差分。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | 冻结面终审与 1.x 承诺落地 | 冻结面清单终审：组件公开 props / events / slots 名称与语义；`exports` **13 键**；包根导出名；`--caomei-*` token 冻结档位（全局 **68** / 全量 **146** 二选一）；10 语 locale 命名空间与「预注册 + 按需注册」形态；`reka-ui` 下 `InputNumber` 的 `step` 语义按 2.10.4 冻结 | 清单逐项可复算；例外流程（安全 / 正确性必须破坏时）成文；「最后一破」归零确认；`version-policy` 的「`exports` 5 键」陈旧口径修正；结论落治理记录 |
| **M1-2** | 冻结面终审与 1.x 承诺落地 | `Form` / `FormItem` 形态与字段契约影响评估（校验规则 / 布局 / 与 `FieldProps` 家族关系 / `id` · `name` · `aria-describedby` 注入点） | 评估记录给出形态建议与「是否扩既有字段契约」的结论；**不实现**；现存 **12** 个继承契约 / **35** 个含内联同名字段的 `types.ts` 逐项取证 |
| **M1-3** | 冻结面终审与 1.x 承诺落地 | API 表面基线形态评估：对比「仅文档声明 / 提交态快照 / 发布时与上一已发布版本差分」 | 给出成本、判别力与推荐；说明 `docs/.vitepress/data/component-meta.json` 为 gitignored 生成物的限制；**不落地守卫** |
| **M1-4** | 冻结面终审与 1.x 承诺落地 | 中英 `version-policy` / `getting-started` / `README` / `release.md` §1 · §2 · §5 改写；删除「0.x 阶段 API 与目录结构在 1.0 前可能调整」类表述 | 1.x 兼容承诺与弃用政策成文；`0.x` 活载体零残留（历史记录按点时快照不回改）；`pnpm docs:check` 全绿 |
| **M2-1** | 行为收口与准破坏性变更 | DataTable 行选择全选作用域收口（方案 A）：表头全选只作用当前页；客户端分页保留跨页选择；表头状态用 `getIsAllPageRowsSelected` / `getIsSomePageRowsSelected`，切换用 `toggleAllPageRowsSelected`；`lazy` 仍为当前页；受控全表由父级写 `selection`，不新增 prop；可访问名改「全选当前页」（**10 语**） | 分页 × 选择测试；中英组件页、PrimeVue 迁移差异、CHANGELOG 与 GitHub Release 四处披露；`selectAll` / `selectAllScope` 契约仅登记不实现 |
| **M2-2** | 行为收口与准破坏性变更 | `lazy` 跨页选择在受控输入与 emit 两侧收敛：`rowSelectionState` 经 `indexOfRow` 只查当前页、`onRowSelectionChange` 用 `props.data.filter` 组装 | 两侧一致只保留当前页行；定向测试覆盖受控与非受控 |
| **M2-3** | 行为收口与准破坏性变更 | `rowKey` 缺省按索引在 `lazy` 下撞 id：给出修复或显式契约（要求显式 `rowKey`） | 选择 / 展开在 `lazy` 跨页不串行；测试覆盖；若改为显式契约须同步文档与迁移说明 |
| **M2-4** | 行为收口与准破坏性变更 | `engines.node` 由 `>=20` 提升到 `>=22`（Node 20 已于 2026-04 EOL） | `package.json` 与文档同步；CI 仍 `lts/*`；1.0.0 发布说明列为发布前调整（1.0 后同类调整须走 major） |
| **M3-1** | 发布链路就绪与 1.0 交付 | `manual-release.mjs` 支持 `--tag`（`next` / `latest`），dry-run 与日志同步；`preflight` 纳入 `test:coverage` + `check:coverage`（或等价证据） | `release:manual run --version=1.0.0-rc.1 --tag=next --dry-run` 输出正确；单测覆盖；预发布不再落到 `latest` |
| **M3-2** | 发布链路就绪与 1.0 交付 | 1.0.0 CHANGELOG 里程碑段与 GitHub Release note：人工补 1.x 承诺 / 冻结面 / `engines` / locale / DataTable 行为说明 | 1.0.0 段有可读里程碑内容；`announce` 能从 CHANGELOG 正确抽取 note |
| **M3-3** | 发布链路就绪与 1.0 交付 | 1.0 交付执行：推送 → `1.0.0-rc.1` 发 `next` → 下游复验（M4-1）→ `1.0.0` 发 `latest` → 发布后校验 → 版本句同步 → GitHub Release | registry `latest` = `1.0.0`；tarball shasum / 解包 / `exports` 13 键校验留痕；`v1.0.0` tag 与 GitHub Release 到位 |
| **M4-1** | 下游复验与质量确认 | dependfix 升级到 `0.7.0`（或 rc）跑 `typecheck` + `build`；或 `workflow_dispatch` compat 并传版本 | 一次绿 run 且记录下游 revision；若真实 run 可验证「实际安装版本校验」则顺手落地 |
| **M4-2** | 下游复验与质量确认 | 一期 5 语译文复核状态确认（Phase 25 M3-1b 记录「待用户复核」） | 复核结论（通过 / 修订清单）落治理记录；未复核则显式声明边界、不带默认承诺 |

## 3. 非目标（本阶段）

- 不进入提交驱动自动发布（1.0 后单独立项）；不放开 `release.yml` 的 publish。
- 不实现 `Form` / `FormItem`（D4 只评估）、RTL、触摸目标、二期语言集、长尾组件。
- 不做破坏性 API 变更（M2-1 ~ M2-3 为行为变更 / 缺陷修复，不改公开 props / events / slots 的名称与语义）；不引入 Tailwind / UnoCSS。
- 不自动推送；`reka-ui` / `conventional-changelog` 维持条件触发。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 新增「Phase 26 原子条目」段（原登记 4 条主线 / 13 条；2026-10-26 执行期追加后为 5 条主线 / 17 条，见 §8；非目标）；`当前进行中阶段：` 声明 Phase 26；Phase 24 遗留段改为**回填后待归档**（不并入本阶段条目表） |
| `docs/plan/roadmap.md` | 阶段表新增 Phase 26 行；§1 现状句改为「Phase 26 为当前进行中阶段」；Phase 24 行补遗留回填说明 |
| `docs/plan/backlog.md` | 移出 3 行已登记候选（DataTable 行选择全选作用域 / `Form` · `FormItem` / 进入 1.x 的版本策略与冻结面确认）；新增 1 行条件候选（DataTable 全表 / 服务端全选契约，follow-up ④） |
| `docs/plan/todo.md` 未完成项汇总 | 同步移出上述 3 行候选（判别键对账面由 `check:candidate-anchors` 机检） |
| `docs/design/governance/index.md` | 更新第十轮评估条目（补裁定与登记结论）；新增本记录条目 |
| `.session`（git-ignored） | 阶段态同步为 Phase 26 |

- **候选池计数口径**：本批移出 3 行、新增 1 行后，`backlog.md` §1 在册候选由 **36 → 34** 条（[第十轮评估](./2026-10-22-next-stage-scope-evaluation-10.md) 的 36 为其产出时点值，按[规划规范 §9](../../standards/planning.md) 的点时记录口径不回改）。

## 5. 遗留

- **Phase 24 遗留 2 条**已于 2026-10-22 回填（视觉基线 run `38899204640` success / CI 镜像未命中 `ubuntu-26.04`），状态留在 `todo.md` 的 Phase 24 段并标「待独立归档批次」；该批须一并处置 `docs:check:line-count` 的 warn 阈值、执行新一轮长期任务门槛复核。
- 阶段内若出现用户裁定或缺陷报告插入，按[规划规范 §3.5](../../standards/planning.md) 的插队例外准入。

## 6. Review Gate

- **audit-depth**：`standard`（5 个规划载体 + 2 份治理记录 + 索引的阶段登记；无 `src/**` / 测试 / 配置改动）；时间盒 ≤ 6 分钟，实测约 4 分钟（2026-10-22 05:18 ~ 05:22 UTC）。
- **R1（`standard`）：`Reject`**（1 blocker / 2 warning / 1 suggest）。
  - **RG-B1**：`check:planning-numbers` 命中 `todo.md` 未完成项汇总的「复验由 **M4-1** 承接」——该处位于条目表之外，条目编号不被豁免 ⇒ 已改为描述性指针（「本阶段『下游复验与质量确认』主线」）。
  - **RG-W1**：`backlog.md` 新增候选行写「Phase 26 **M2-1** 登记时拆分」，候选行携带条目编号（[规划规范 §3.2](../../standards/planning.md) 候选条目不包含阶段编号）⇒ 已改为「Phase 26 登记时拆分」。
  - **RG-W2**：第十轮评估 §1.2 把「CHANGELOG 生成器健壮性」映射到 C，但 C-2 只做 1.0.0 里程碑内容、不改生成器 ⇒ 已将该行改为「范围外」，映射与落点一致。
  - **RG-S1**：本记录 §2 与 `todo.md` 条目表两处承载验收口径（双载体漂移风险）⇒ 已逐条对齐，并在 §2 标题声明「本记录为唯一口径、`todo.md` 为执行面」。
- **R2（`delta`，`quick`）：`Pass`**（0 残留 blocker；4 条全部闭合）。
- **验证证据**：`lint-md` exit 0；`check:planning-numbers` 0 处；`check:candidate-anchors` 受检 15 行全过；`check:governance-records` OK（202 记录 / 410 md / 34 条结论指针）；`check:governance-counts` OK；`pnpm docs:check` 全部 12 段通过（含 `docs:check:line-count`：`todo-archive.md` 396 行、未越 warn）；`check:final-newline` OK。
- **未覆盖边界**：未跑全量 `pnpm verify` 与 `docs:build`（本批为规划载体 / 治理记录，零 `src/**`、零测试、零配置）；Phase 24 块归档与长期任务新一轮不在本批。
- **复查基线**：本记录 §1 / §2 / §4 / §5；`docs/plan/todo.md`（当前状态 / Phase 26 表 / Phase 24 遗留段 / 未完成项汇总）；`docs/plan/roadmap.md`（§1 / Phase 24 行 / Phase 26 行）；`docs/plan/backlog.md` §1.1 / §1.2 / §1.6；`docs/design/governance/index.md` 两条 2026-10-22 条目。

## 7. 决策记录（用户 2026-10-22「按推荐来」）

| 编号 | 裁定 | 结论 |
|:---|:---|:---|
| **D1** | 取推荐项 ④ | 四条主线全取：A 冻结面终审与 1.x 承诺落地 + B 行为收口与准破坏性变更 + C 发布链路就绪与 1.0 交付 + D 下游复验与质量确认 |
| **D2** | 取推荐项 ① | 1.0 走 `rc → 转正`，**维持手动发布**；提交驱动自动发布 1.0 后单独立项 |
| **D3** | 取推荐项 ① | DataTable 全选作用域：主项 + ①②③ 全做（含 10 语可访问名）；④ 仅登记 |
| **D4** | 取推荐项 ① | `Form` / `FormItem` **只评估**，实现后置 |
| **D5** | 取推荐项 ③ | 冻结面执行形态 = 文档声明 + 终审记录 + **发布时与上一已发布版本的 API 差分** |

## 8. 执行期追加（2026-10-26）

> 本记录 §1 的「4 条主线 / 13 条原子条目」为 2026-10-22 登记时点口径，**不回改**；本节记录 2026-10-26 的用户裁定与追加后口径。

- **触发**：2026-10-26 UI 自检（[记录](./2026-10-26-refactoring-ui-self-check.md)）发现新的 P0 / P1 项。
- **用户裁定**：
  - 第 1 档（DataTable 键盘可达 / Select 中英示例可访问名 / Button hover）列入**插队 todo**，登记为 Phase 26 **M5 插队批次 4 条**（M5-1 ~ M5-4）。
  - 第 2 档（品牌预设颜色角色分层 + 非文本对比度治理）进入 [Backlog §1.6](../../plan/backlog.md)，不进入当前 todo；1.0 门禁 G1 要求对其作出「修复 / 明确接受」二选一裁定。
  - **1.0 发布延后**；`M3-3` 在门禁 G0 ~ G4 全部通过前阻塞。
- **构成变更**：原登记 **4 条主线 / 13 条原子条目** → 现 **5 条主线 / 17 条原子条目**（M1 4 / M2 4 / M3 3 / M4 2 / M5 4；对账 4 + 4 + 3 + 2 + 4 = 17）。
- **门禁与时间盒**：唯一口径见[Phase 26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §4；目标评审 2026-11-13、硬截止 2026-11-27，到期未通过不得自动延期。
- **载体同步**：`todo.md`（当前状态 / 条目表 / M3-3 阻塞 / 未完成项汇总）、`roadmap.md`（§1 / Phase 26 行）、`backlog.md`（§1.6 新增行）、治理索引、`.session`。
