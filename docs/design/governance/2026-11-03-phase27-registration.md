# Phase 27 登记批次记录

> 创建时间：2026-11-03
> 触发：用户就[下一阶段范围评估（第十一轮）](./2026-11-03-next-stage-scope-evaluation-11.md) §3 的 D1 ~ D5 决策点全部取推荐项——① / ① / ① / ① / ①。
> 依据：[规划规范 §3 / §4](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 26）+ 1 = **Phase 27**。
- **构成（6 条主线 / 18 条原子条目）**：移动端与响应式二期 **4** + `Form` 组合层 **2** + 下游迁移护航 **2** + 机制与质量收口 **4** + 发布收口 **1** + **CI 发布链路 5**（2026-11-03 执行期追加，见 §1.1）；对账 4 + 2 + 2 + 4 + 1 + 5 = **18**。
- **取向来源**：D1 ① 五条主线全取；D2 ① 密度轴 + P0 命中区；D3 ① 本阶段实现 `Form` / `FormItem`；D4 ① 阶段末发 `1.1.0`；D5 ① 国际化二期 / RTL 维持范围外。
- **目标版本**：`1.1.0`（`latest` 由 `1.0.0` 前移；**该版本经 CI 发布链路交付**，触发模型 = `workflow_dispatch` + `environment: release` 审批，见 M6-1）。`next` 当前仍为 `1.0.0-rc.1`；其通道处置（维持 / 弃用 / 前移）是 M6-1 的可判定子项。

### 1.1 执行期追加（2026-11-03）

- **触发**：用户指令「下阶段开始要通过 CI 来发布了，release 的工作流还没修复，应该添加到 todo 中」。
- **追加内容**：**M6 CI 发布链路 5 条**（工作流接线与凭据 / 版本句与发布说明同步 / 前置与后置门禁 / 事件链与下游复验 / CHANGELOG 生成器健壮性）；**M5-1 改为经 CI 发布**，手工流（`pnpm release:manual`）保留为回退。
- **构成变更**：原登记（2026-11-03）**5 条主线 / 13 条原子条目**（4 + 2 + 2 + 4 + 1 = 13，**时点值不回改**）→ 追加后 **6 条主线 / 18 条原子条目**（4 + 2 + 2 + 4 + 1 + 5 = 18）。
- **执行顺序**：M1 ~ M4 收口 → M6（先以 `--dry-run` 打通）→ M5-1（`1.1.0` 经 CI 发布）。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | 移动端与响应式二期 | `data-density="touch"` 轴：控件高度 36 / 44 / 52、字号 14 / 16 / 18、内容宽度上限 `none`；与 `data-preset`（6 预设）及明暗正交；**未设置属性时逐值不变** | 新增 token / 选择器可复算；缺省路径 `capture:styles` **0 差异**；touch 档在文档站中英各一组示例可渲染；`pnpm docs:check` 全绿 |
| **M1-2** | 移动端与响应式二期 | `--caomei-hit-target-min` 不可见命中区（**P0**）：5 组件的 **34 个** `13.33×13.33` 清除 / 关闭 icon 按钮 + Message 关闭（1 个）；`::after`（绝对定位、负 `inset`）扩到 **≥24×24**，不改视觉盒 | 命中区 E2E 覆盖 34 + 1 个目标（受检面下界 + 负向对照）；`capture:styles` 0 差异；`test:visual` 0 差异或重冻结记录；P1 / P2 不动 |
| **M1-3** | 移动端与响应式二期 | 常驻回归与基线：390 / 768 / 1440 三档下的密度轴与命中区用例；`test/e2e/responsive` 扩面；`test:visual` / `capture:styles` 的差异处置与重冻结 | 受检面下界写死在用例中；负向对照（移除 `::after` → 用例失败）成立；证据落治理记录 |
| **M1-4** | 移动端与响应式二期 | 指南与设计口径同步：[响应式设计](../responsive.md)、[移动端指南](../../guide/mobile.md)（中英）、组件页密度节、画廊 / 组件总览登记、token 冻结面计数回扫（`version-policy` 与冻结清单）；并关闭旧心智表述——`responsive.md` 的「不纳入触摸目标」、`mobile.md` 中英的「以后续裁定为准 / 候选登记见 Backlog §1.5」 | `docs:check` 全绿；计数载体逐项 `rg` 核对并留痕；冻结面清单更新记录；**上述三处旧心智表述回扫为 0**；不出现「新 token 未登记」 |
| **M2-1** | `Form` 组合层 | `CaomeiForm` / `CaomeiFormItem`：`Form` 负责布局与提交编排；`FormItem` 用**插槽作用域**提供 `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`；12 个字段组件**逐项绑定**（组型控件用 `aria-labelledby`，`Switch` 无校验状态通道须显式说明）；**无 rules 引擎**；**不扩** 既有字段契约 | 单测覆盖 3 类继承面（`FieldProps` + 身份 / 状态 + 身份 / 仅身份）+ `Switch` 例外；`aria-*` 断言；SSR 渲染无警告；不新增 `Field*Props` 字段 |
| **M2-2** | `Form` 组合层 | 文档、示例与计数回扫：中英组件页 + 示例 + E2E（布局与提交）；组件总览 / 画廊 / locale 台账 / 冻结面与 API 基线计数 | `check:components-overview` / `check:design-catalog` / `check:locale-ledger` 通过；E2E 覆盖提交与错误态；`check:api-surface` 对上一版本只报新增、无删除 |
| **M3-1** | 下游迁移护航 | PrimeVue 迁移经验回收：回看 dependfix 迁移提交 / 问题清单与本仓在册下游反馈；补 [迁移指南](../../guide/primevue-migration.md)（中英）的「常见陷阱」「迁移后自检」「逐组件对照入口」，入口表**补 `Tooltip` 行**；能力缺口与文档缺口分开登记 | 中英指南同步；每条经验有取证位置（提交 / issue / 治理记录）；不重复现有条目；指令形态（`v-tooltip` + 方向修饰符）不在本条内决定 |
| **M3-2** | 下游迁移护航 | 1.0 升级护航：下游实测版本快照与 1.0 升级注意；把 1.0 的对外 7 条（**6 条已知限制 + 1 条升级注意**）转成指南可检索节；momei 反馈缺口显式声明 | 版本快照标注日期；升级注意覆盖「实测下游版本 → 目标版本」的**全部 minor**（区间在条目开始时实测后写定）且与 `CHANGELOG` 对应段一致；不虚构未实现能力；momei 未反馈部分写明边界 |
| **M4-1** | 机制与质量收口 | API 表面差分接入发布链：`check:api-surface`（`scripts/release/diff-api.mjs`）接入 `manual-release.mjs`；判别口径 = **删除 / 重命名 / required 收紧**为 breaking，**新增不阻断**；首次真实差分记录 | dry-run 输出含差分结论；单测覆盖新增 / 删除 / 重命名三类；发布指南同步；1.1.0 首次运行的证据落记录 |
| **M4-2** | 机制与质量收口 | 品牌预设 `-solid` 对比度治理：`momei` 亮色 `success` 三态（2.279 / 2.643 / 3.045）与 `caomei` `primary-solid`（4.17）；把 **`-solid` 配对（默认 / hover / active）纳入常驻断言面**（6 预设 × 明暗 × 2 背景）；修色或留痕二选一 | 矩阵断言覆盖 `-solid` 配对（既有 21 条 tone 文本 + 4 条控件边界面不变）；修色须视觉基线重冻结并留记录；不改品牌主色值以外的既有裁定项；文档口径同步 |
| **M4-3** | 机制与质量收口 | 阶段构成计数跨载体一致机检：覆盖 `todo.md` 当前状态句 / 条目表 与 `roadmap.md` §1 当前态句 / 阶段表行；守卫带**负向对照**与**受检面下界**，接入 `governance:check` | 单测含负向对照；实跑 exit 0；误报边界在文件头写明；不引入高误报规则 |
| **M4-4** | 机制与质量收口 | 依赖告警收口：`minimatch` medium（open #71，dev 作用域）覆盖评估（override 至 11）或留痕 + 触发条件；`deepmerge` low（#69，无补丁）维持留痕 | 不引入不可用 override（须实证 eslint 链）；处置结论 + 证据落记录；`Security Alerts` 与 `pnpm audit` 复核；不阻塞 1.1.0 发布 |
| **M5-1** | 发布收口 | `1.1.0` 发布**经 CI 发布链路**（M6）：Run `Release` workflow（`workflow_dispatch`）→ `environment: release` 审批 → semantic-release 计算版本并 publish；手工流 `pnpm release:manual` 仅作回退，不再作为默认路径 | `latest` = `1.1.0`；CI run 链接与审批记录留痕；tarball shasum / 解包 README / `exports` 13 / API 差分校验通过；`v1.1.0` tag 与 GitHub Release 到位；下游 compat run 记录 revision；**前置 = M6 完成 + 用户明确授权运行发布** |
| **M6-1** | CI 发布链路 | 工作流接线与凭据：`release.yml` 打开 publish 步骤；触发 = `workflow_dispatch`（可选 `dry_run` 输入）+ `environment: release` 审批；npm 凭据优先 Trusted Publisher（OIDC，`id-token: write` 已有），回退 `NPM_TOKEN`（仅临时回退，存 environment secret 并声明轮换与最小权限）；`@semantic-release/git` 回推凭据（`persist-credentials: false` 下显式注入）；并发 / 超时；`next` 预发布通道处置（当前无 `next` 分支） | CI 中 `semantic-release --dry-run` 输出下一版本；凭据缺失 fail-closed；审批未通过不进入 publish；回推 `CHANGELOG.md` + `package.json` 成功且不产生循环触发；**`next` 通道给出维持 / 弃用 / 前移的结论并落记录**；job summary 记录触发方式与目标版本 |
| **M6-2** | CI 发布链路 | 版本句与发布说明同步：用 `@semantic-release/exec`（`prepare` / `publish`）或等价脚本，在发布提交中同步 `README.md` / `README.en-US.md` / `roadmap.md` 的「当前版本」句；1.1.0 里程碑与升级注意的注入机制（`docs/release-notes/<version>.md` 或 exec 前置）；`docs:check:version` 发布后为绿 | dry-run 后 `pnpm docs:check:version` exit 0；GitHub Release note 含里程碑段且非空；版本句不在发布后手工补 |
| **M6-3** | CI 发布链路 | 前置与后置门禁：publish 前接入安全告警门禁（`check-security-alerts`，`SECURITY_ALERTS_TOKEN`）+ 现有 `verify` / coverage；publish 后校验 dist-tag / shasum / 解包 README / `exports` 13 / API 差分；失败 fail-closed 并写 job summary | 门禁在 CI 实跑并留证据；缺 token 或 high+ 未处置即中止；发布后校验失败即红；证据可从 run 复算 |
| **M6-4** | CI 发布链路 | 事件链与下游复验：`GITHUB_TOKEN` 创建的 tag / release 不触发其它 workflow → `downstream-compat.yml` 不会自动跑；改为 PAT / GitHub App token，或在 release 成功后显式 `workflow_dispatch` 编排；保证 1.1.0 发布后自动跑下游检查并留痕 | 一次真实发布触发下游检查（或显式 dispatch 记录）；tag / Release 的 workflow 归属与事件链说明成文；token 取最小权限，不长期保留宽权限凭据 |
| **M6-5** | CI 发布链路 | `CHANGELOG` 生成器健壮性：空 `# Unreleased` 段（`outputUnreleased: true` 在无未发布提交时仍输出标题）、无 remote 降级、语言源自 root | 生成结果无空 Unreleased 段；无 remote 时可降级；fixture / 单测覆盖；不回改既有 `CHANGELOG` 历史 |

## 3. 非目标（本阶段）

- 不做 P1 / P2 命中区（表单控件盒、行高受限与内联行）；不改可见尺寸与行高。
- 不实现 RTL、二期语言集（it / nl / pl / tr / vi / th / id）、长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker）。
- `Form` 不提供 rules 引擎（Zod / 自研）、不做 `FormItem` 自动注入（provide/inject 后置）、不扩既有字段契约。
- 不启用 push 触发（本阶段触发模型 = `workflow_dispatch` + `environment` 审批）；除 CI 发布提交与 tag 外不自动推送代码；不新建 `next` 预发布分支（等价需求另立评估）。
- 不做破坏性 API 变更；不引入 Tailwind / UnoCSS；不做文档站多版本托管；不启用 Storybook；不新增高误报守卫。
- `reka-ui` 补丁升级与 `conventional-changelog` 8 升级维持条件触发。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 新增「当前进行中阶段：Phase 27」声明与 `## Phase 27 原子条目` 段（登记时 13 行；2026-11-03 执行期追加后 18 行）；未完成项汇总保留等待外部反馈指针 |
| `docs/plan/roadmap.md` | 阶段表新增 Phase 27 行；§1 当前态句改为「Phase 27 已登记、目标 1.1.0」 |
| `docs/plan/backlog.md` | 移出 7 行已登记候选（`Form` / `FormItem`、手机端优先 / 密度轴、阶段构成计数跨载体机检、发布时 API 表面差分、品牌预设 `-solid`、下游 0.5.0 升级护航、PrimeVue 迁移经验回收）+ 就地重写 1 行（触摸目标 → **P1 / P2 候选**）；**2026-11-03 执行期追加**再移出 2 行（提交驱动 CI 自动发布、CHANGELOG 生成器健壮性收口） |
| `docs/design/governance/index.md` | 新增[第十一轮评估](./2026-11-03-next-stage-scope-evaluation-11.md)与本记录两条索引 |
| `.session`（git-ignored） | `current_phase` / `active_plan` / `next_steps` / `decisions` 与 `runtime-state.json` 的 `plan_state` 同批同步 |

- **候选池计数口径**：本批移出 **7** 行、就地重写 **1** 行（触摸目标 → P1 / P2）后，`backlog.md` §1 在册候选由 **42 → 35**（6 + 5 + 0 + 2 + 3 + 16 + 1 + 2）；**2026-11-03 执行期追加**再移出 2 行（提交驱动 CI 自动发布、CHANGELOG 生成器健壮性收口）后为 **33**（6 + 5 + 0 + 2 + 3 + 14 + 1 + 2）。[第十一轮评估](./2026-11-03-next-stage-scope-evaluation-11.md) §1 的 42 为其产出时点值，按[规划规范 §9](../../standards/planning.md) 的点时记录口径不回改。
- **新增依赖候选**：`minimatch` medium 由本轮评估新增、直接登记为 M4-4，**不进入** `backlog.md`（[规划规范 §2](../../standards/planning.md) 的「候选 → 用户决策 → 当前阶段」在本批一次完成）。

## 5. 风险与前置

1. **公开契约扩张**：`data-density` 与新 token 进入 1.1.0 冻结面，须在发布前定型；缺省路径逐值不变。
2. **新增组件扩散面**：`Form` / `FormItem` 会扩散到冻结面、API 差分、组件总览 / 画廊 / locale 台账与文档站计数，M2-2 须逐载体回扫。
3. **发布门禁自阻断**：M4-1 的首次真实差分必须把「新增」判为不阻断，否则 1.1.0 会被自身门禁拦住。
4. **依赖告警不可自动修复**：`minimatch` 跨 4 个大版本，override 需实证 eslint 链；不可行时以留痕 + 触发条件收口。
5. **发布前置**：M5-1 的推送与 `npm publish` 以用户当次明确指令为前提；第 29 轮长期任务门槛复核须在收口 / 发布前执行并留痕。
6. **CI 发布不可逆**：`workflow_dispatch` 触发后 publish 没有第二次确认，`environment: release` 审批是唯一闸门；凭据配置错误会导致发布失败或落到错误通道。
7. **版本句与 Release note 断链**：`semantic-release` 只提交 `CHANGELOG.md` + `package.json`，不同步 README 中英与 roadmap ⇒ 发布后 `docs:check:version` 立刻红；里程碑注入缺失会让 1.1.0 的 Release note 只剩工具条目。
8. **事件链与凭据**：`GITHUB_TOKEN` 创建的 tag / release 不触发 `downstream-compat.yml`，需 PAT / GitHub App token 或显式 `workflow_dispatch`；长期宽权限 token 是供应链风险，须取最小权限。
9. **用户侧前置**：npm Trusted Publisher 绑定（或 `NPM_TOKEN` secret）与 `release` environment 均需仓库 / npm 侧配置；缺失时 M6-1 只能停在 dry-run。

## 6. Review Gate

- **audit-depth**：`standard`（与第十一轮评估同批审计：规划载体登记 + 跨载体计数，零代码改动）；时间盒 ≤ 8 分钟。
- **R1（`standard`）：`Reject`**（1 blocker / 4 warning / 4 suggest）——详见[第十一轮评估](./2026-11-03-next-stage-scope-evaluation-11.md) §6；本记录受影响处为 §4 的候选计数（**移出 7 行 + 就地重写 1 行，42 → 35**）、M1-4 的旧心智表述关闭项、M3-2 的升级区间与对外 7 条拆分、M4-2 的 `-solid` 配对表述、M5-1 的发布顺序。
- **R2（`quick` delta）：`Pass`**（无残留 blocker / warning）。
- **R3（`standard`，执行期追加 M6）：`Pass`**（0 blocker / 5 warning / 3 suggest；warning 与建议均同批关闭）——构成变更回扫面（`todo.md` / `roadmap.md` §1 + 阶段表 / 两份记录 / 索引 / `.session`）一致；M6 覆盖原 Backlog 行的 8 项缺口、无静默丢弃；候选池 **33** 可逐段复算。**已关闭**：`release.yml` 注释的 Backlog 悬空指针改指本记录 §2；en-US 的「Current status」与 Release flow 同口径；§1 / §4 的「当前决策」改为 1.0 期历史口径；§5 标题改为「已授权，未启用」；两处「13 行」补时点标注。**已采纳建议**：目标版本句补 `next` 现状与 M6-1 的通道结论项；`NPM_TOKEN` 限定为临时回退（environment secret + 轮换 + 最小权限）；§5.3 补取证命令与时间。
- **验证证据**：同批 `lint:md:check` / `docs:check` / `governance:check` 均 exit 0；`backlog.md` §1 逐段复算 = **35**；§2 条目集合与 `todo.md` 表格逐项一致（13 行，4 + 2 + 2 + 4 + 1）。**R3 追加后**：`backlog.md` §1 = **33**（6 + 5 + 0 + 2 + 3 + 14 + 1 + 2）、`todo.md` = **18** 行（4 + 2 + 2 + 4 + 1 + 5）。
- **复查基线**：本记录 §2 / §4 / §5；`docs/plan/todo.md` 的当前状态句与条目表；`docs/plan/roadmap.md` 的阶段表行与 §1。
