# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

当前进行中阶段：**Phase 26 1.0 发布前收尾：冻结面、行为收口与发布链路**（2026-10-22 用户就[第十轮范围评估](../design/governance/2026-10-22-next-stage-scope-evaluation-10.md) §3 裁定「按推荐来」后登记）。范围与验收口径的唯一事实源见[Phase 26 登记批次记录](../design/governance/2026-10-22-phase26-registration.md) §1 / §2。

**Phase 24 遗留**：两条已于 2026-10-22 回填（视觉基线 = 2026-10-16 周级 run success；CI 镜像 = 未命中），状态见下节；**待独立归档批次**把 Phase 24 块迁入[待办归档](./todo-archive.md)（该批需一并处置 `docs:check:line-count` 的 warn 阈值，见[规划规范 §7](../standards/planning.md)）。

## Phase 26 原子条目

> 4 条主线 / 13 条原子条目（M1 4 / M2 4 / M3 3 / M4 2；对账 4 + 4 + 3 + 2 = 13）。决策：**D1 ④**（A+B+C+D）/ **D2 ①**（rc → 转正，维持手动）/ **D3 ①**（DataTable 主项 + ①②③ 全做）/ **D4 ①**（`Form` 只评估）/ **D5 ③**（发布时 API 差分）。

| 编号 | 主线 | 原子条目 | 验收标准 | 状态 |
|------|------|----------|----------|------|
| M1-1 | 冻结面终审与 1.x 承诺落地 | **冻结面清单终审与 1.0 决策记录**：四类面逐项确认（组件公开 props / events / slots 名称与语义；`exports` 13 键；包根导出名；`--caomei-*` token 冻结档位〔全局 68 / 全量 146 二选一裁定〕；10 语 locale 命名空间与注册形态；`reka-ui` 下 `InputNumber` 的 `step` 语义按 2.10.4 冻结） | 清单逐项可复算；例外流程（安全 / 正确性必须破坏时）成文；「最后一破」归零确认；`version-policy` 的「`exports` 5 键」陈旧口径修正；结论落治理记录 | 待执行 |
| M1-2 | 冻结面终审与 1.x 承诺落地 | **`Form` / `FormItem` 形态与字段契约影响评估（只评估）**：校验规则 / 布局 / 与 `FieldProps` 家族的关系 / `id` · `name` · `aria-describedby` 注入点 | 评估记录给出形态建议与「是否扩既有字段契约」的结论；**不实现**；现存 12 个继承契约 / 35 个含内联同名字段的 `types.ts` 逐项取证 | 待执行 |
| M1-3 | 冻结面终审与 1.x 承诺落地 | **API 表面基线形态评估（只评估）**：对比「仅文档声明 / 提交态快照 / 发布时与上一已发布版本差分」三形态 | 给出成本、判别力与推荐；说明 `docs/.vitepress/data/component-meta.json` 为 gitignored 生成物的限制；**不落地守卫** | 待执行 |
| M1-4 | 冻结面终审与 1.x 承诺落地 | **1.x 承诺载体改写**：中英 `version-policy` / `getting-started` / `README` / `release.md` §1 · §2 · §5；删除「0.x 阶段 API 与目录结构在 1.0 前可能调整」类表述 | 1.x 兼容承诺与弃用政策成文；`0.x` 活载体零残留（历史记录按点时快照不回改）；`pnpm docs:check` 全绿 | 待执行 |
| M2-1 | 行为收口与准破坏性变更 | **DataTable 行选择全选作用域收口（方案 A）**：表头全选只作用当前页；客户端分页保留跨页选择；表头状态用 `getIsAllPageRowsSelected` / `getIsSomePageRowsSelected`，切换用 `toggleAllPageRowsSelected`；`lazy` 仍为当前页；受控全表由父级写 `selection`，不新增 prop；可访问名改「全选当前页」（10 语） | 分页 × 选择测试；中英组件页、PrimeVue 迁移差异、CHANGELOG 与 GitHub Release 四处披露；`selectAll` / `selectAllScope` 契约仅登记不实现 | 待执行 |
| M2-2 | 行为收口与准破坏性变更 | **`lazy` 跨页选择在受控输入与 emit 两侧收敛**：`rowSelectionState` 经 `indexOfRow` 只查当前页、`onRowSelectionChange` 用 `props.data.filter` 组装 | 两侧一致只保留当前页行；定向测试覆盖受控与非受控 | 待执行 |
| M2-3 | 行为收口与准破坏性变更 | **`rowKey` 缺省按索引在 `lazy` 下撞 id**：给出修复或显式契约（要求显式 `rowKey`） | 选择 / 展开在 `lazy` 跨页不串行；测试覆盖；若改为显式契约须同步文档与迁移说明 | 待执行 |
| M2-4 | 行为收口与准破坏性变更 | **`engines.node` 由 `>=20` 提升到 `>=22`**（Node 20 已于 2026-04 EOL） | `package.json` 与文档同步；CI 仍 `lts/*`；1.0.0 发布说明列为发布前调整（1.0 后同类调整须走 major） | 待执行 |
| M3-1 | 发布链路就绪与 1.0 交付 | **预发布通道与覆盖率前置**：`manual-release.mjs` 支持 `--tag`（`next` / `latest`），dry-run 与日志同步；`preflight` 纳入 `test:coverage` + `check:coverage`（或等价证据） | `release:manual run --version=1.0.0-rc.1 --tag=next --dry-run` 输出正确；单测覆盖；预发布不再落到 `latest` | 待执行 |
| M3-2 | 发布链路就绪与 1.0 交付 | **1.0.0 CHANGELOG 里程碑段与 GitHub Release note**：人工补 1.x 承诺 / 冻结面 / `engines` / locale / DataTable 行为说明 | 1.0.0 段有可读里程碑内容；`announce` 能从 CHANGELOG 正确抽取 note | 待执行 |
| M3-3 | 发布链路就绪与 1.0 交付 | **1.0 交付执行**：推送 → `1.0.0-rc.1` 发 `next` → 下游复验（M4-1）→ `1.0.0` 发 `latest` → 发布后校验 → 版本句同步 → GitHub Release | registry `latest` = `1.0.0`；tarball shasum / 解包 / `exports` 13 键校验留痕；`v1.0.0` tag 与 GitHub Release 到位 | 待执行 |
| M4-1 | 下游复验与质量确认 | **下游正向复验**：dependfix 升级到 `0.7.0`（或 rc）跑 `typecheck` + `build`；或 `workflow_dispatch` compat 并传版本 | 一次绿 run 且记录下游 revision；若真实 run 可验证「实际安装版本校验」则顺手落地 | 待执行 |
| M4-2 | 下游复验与质量确认 | **一期 5 语译文复核状态确认**（Phase 25 M3-1b 记录「待用户复核」） | 复核结论（通过 / 修订清单）落治理记录；未复核则显式声明边界、不带默认承诺 | 待执行 |

## Phase 24 原子条目

> **遗留段（用户 2026-10-16 授权保留；2026-10-22 回填，待归档批次）**：下表两条为 Phase 24 未交付条目，触发条件已满足并完成复核；Phase 24 块的整体归档（含行数阈值处置）随独立批次执行，本表不并入 Phase 26 条目表。

| 编号 | 主线 | 原子条目 | 验收标准 | 状态 |
|------|------|----------|----------|------|
| 遗留-视觉基线 | 机制收口与回归判别力 | **视觉基线阻断形态首次远端执行复核**：转阻断提交（`422bc20`）进入远端后的首个周级 run | 有一次真实调度 run 记录（含运行器 `Image:` 值）；确认远端为**阻断形态**；`test:visual` 结果可归因 | **已执行（2026-10-22 回填）**：2026-10-16 周级 run `38899204640` **success**（`Image: ubuntu-24.04`）；阻断形态与 `test:visual` 已在调度执行面通过 |
| 遗留-CI 镜像 | CI 环境治理 | **CI 运行器镜像迁移检测点复核**：`ubuntu-latest` 自 2026-10-19 起分批迁移 Ubuntu 26.04；检测点 = 周级 `e2e` 作业 `Set up job` 的 `Image:` 出现 `ubuntu-26.04` | 命中即按重冻结 5 步执行并留痕；未命中则留「未命中」记录（含当时 `Image:` 值） | **未命中（2026-10-22 回填）**：同一 run 的 `E2E Test` / `Core Regression` / `Security Audit` 均为 `Image: ubuntu-24.04`，未出现 `ubuntu-26.04`；检测点维持待触发 |

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。

- **等待外部反馈**：dependfix `apps/platform` 与 momei 根包的迁移由对应仓库执行、本仓等待反馈；两仓 `caomei-ui` 实测为 **`0.6.0`**（2026-10-13 复核；0.7.0 后未重测），复验由本阶段「下游复验与质量确认」主线承接（见上方条目表）。
- **条件触发候选**（触发后按「条件触发 → 再评估 → 决策」处理，不自动进入阶段）：**下表为与 `backlog.md` 的对账面**——每行的「Backlog 判别键」（**可多枚，全部须存在**）须在 [Backlog](./backlog.md) §1 出现（由 `pnpm check:candidate-anchors` 机检）。**候选名为 Backlog 行名的指针、非独立定义**；**新增候选须同批补行并填键**，否则守卫失败。

| 候选 | 触发条件 | Backlog 判别键 |
|:---|:---|:---|
| `BackTop` / `Rating` / 独立 `TimePicker` | 长尾组件，按用量 | `BackTop` |
| 文档站示例外链守卫的漏判面扩展 | 出现合法非图片外链用例 | `漏判面` |
| 下游兼容检查的实际安装版本校验步骤 | 下次发布前后可在真实 run 中验证时 | `实际安装版本` |
| momei 根包接入下游兼容检查 | 该验证通过或用户指定 | `momei 根包接入` |
| 组件增强与长尾 | 下游出现真实用量 | `ColorPicker`、`DatePicker`、`Paginator`、`Sidebar`、`ScrollPanel` |
| Toast 焦点哨兵与 `aria-hidden-focus` 冲突 | 既有裁定：维持现状 | `Toast 焦点哨兵` |
| 文档站多版本托管 / 首页 hydration | 用户裁定暂不启动 / 待定位上游行为 | `文档站多版本托管`、`首页 hydration` |
| 语言矩阵 - 长期（二期语言集）与 RTL | 语言数量增长 / RTL 单独立项 | `语言矩阵 - 长期`、`RTL` |
| `@iconify/vue` 可选接入 | 字符串图标名 escape hatch 需求 | `@iconify/vue` |
| CHANGELOG 生成器健壮性收口 | 随发布机制演进 | `CHANGELOG 生成器` |
| 阶段构成计数跨载体一致机检 | 用户指定或下次同族复发时 | `阶段构成计数跨载体一致机检` |
| 提交驱动 CI 自动发布 | 需独立裁定 | `提交驱动 CI` |
| `reka-ui` 补丁升级 | 依赖 PR 条件触发 | `reka-ui` |
| `conventional-changelog` 8 升级 | preset 版本条件触发 | `conventional-changelog` |
| 下游 0.5.0 升级护航 | 原触发条件已不成立，待一次条件重评估 | `0.5.0 升级护航` |

> 逐条触发条件、复算值与取证入口见 [Backlog](./backlog.md)。
- **已发布版本**：registry `latest` = **0.7.0**（2026-10-20T12:29:13Z 发布；`dist.shasum` = `5b59e41aa400b0e59ade6f6f10984ebf1faf3622`，`fileCount` 427）。**写录时点（2026-10-22）本地领先 `origin/master` 5 个提交**（推送态以 `git rev-parse` / `git ls-remote` 实时复核）；远端 `v0.1.0` ~ `v0.7.0` **7 个** annotated tag；**GitHub Release 已回填**（`v0.7.0` = Latest）。
- **长期任务待执行批次**：见[长期任务](./recurring.md) §2（**第 27 轮门槛复核已于 2026-10-21 执行**〔Phase 25 收口 / 0.7.0 发布后〕：两组任务均无待执行批次；Phase 24 整体归档时须执行新一轮）。
- **未纳入任何阶段的候选**：见 [Backlog](./backlog.md)（组件增强、长尾组件、国际化与 RTL、移动端与响应式、基建与治理、服务层、下游协同等分组）。
- **已完成阶段的遗留项与已知偏差**：见[待办归档](./todo-archive.md)各归档块（含[深度归档](./archive/)）的「遗留与后续候选」与「已知观察」段，其中仍待决策者已在 [Backlog](./backlog.md) 在册。
