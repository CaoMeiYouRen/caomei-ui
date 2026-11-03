# 下一阶段范围评估（第十一轮）：1.1.0 起步

> 创建时间：2026-11-03
> 触发：用户指令「开始规划下阶段待办」。
> 性质：**范围评估**，不构成阶段登记（[规划规范 §3 / §4](../../standards/planning.md)：阶段编号只在**授权启动**时分配）。用户裁定见 §3.1，登记结果见 §5。
> 候选池现状：`backlog.md` §1 在册 **42 条**（复算式：§1.1 **6** + §1.2 **6** + §1.3 **0** + §1.4 **2** + §1.5 **4** + §1.6 **19** + §1.7 **1** + §1.8 **4** = **42**；只计数据行，不含表头与分隔行）。

## 1. 候选盘点

### 1.1 四源清单

| 来源 | 内容 | 数量 | 性质 |
|:---|:---|:-:|:---|
| **a. backlog 在册** | 组件增强（§1.1）；长尾组件与 `Form` / `FormItem`（§1.2）；国际化二期与 RTL（§1.4）；移动端与响应式四项（§1.5）；基建与治理十九项（§1.6）；服务层 `useDialog`（§1.7）；下游协同四项（§1.8） | **42** | 待决策 / 条件触发 |
| **b. 本轮新增** | `minimatch` medium 告警：Dependabot 自动更新不可行（security_update_not_possible） | **1** | 依赖安全，本轮评估新增 |
| **c. 1.0 时点事实（非候选）** | `latest` = `1.0.0`、`next` = `1.0.0-rc.1`；`v1.0.0` tag 的下游兼容检查 run 41482763157 成功 | **3** | 时点事实，不进入候选池 |
| **d. 未完成义务（非条目）** | 第 29 轮长期任务门槛复核（阶段收口 / 发布前触发） | **1** | recurring 触发义务，不占阶段条目 |

> **取证位置**：a 组 = `docs/plan/backlog.md` §1.1 ~ §1.8 数据行逐行与 §1.2 复算式；b 组 = `gh api repos/CaoMeiYouRen/caomei-ui/dependabot/alerts`（#71 medium open）与 `gh run view 41497961576 --log`（`latest-resolvable-version: 3.1.5` / `lowest-non-vulnerable-version: 11.0.1`）；c 组 = `npm view caomei-ui dist-tags` 与 `gh run list --workflow downstream-compat.yml`；d 组 = [长期任务](../../plan/recurring.md) §2 触发义务。

### 1.2 backlog 分组与落点

| 组 | 行数 | 落点（§2 为唯一映射口径） |
|:---|:-:|:---|
| G1 组件增强（§1.1） | 6 | 范围外（沿用候选，均为条件触发） |
| G2 长尾组件与 `Form`（§1.2） | 6 | **B**（`Form` / `FormItem` 1）；范围外（Sidebar / ScrollPanel / BackTop / Rating / TimePicker 5） |
| G3 国际化（§1.4） | 2 | 范围外（RTL 单独立项；二期语言等扩容决策） |
| G4 移动端与响应式（§1.5） | 4 | **A**（密度轴 1 + 触摸目标 P0 1；同一行的 P1 / P2 就地重写为候选）；范围外（滚动容器键盘聚焦 / Toolbar 769–1023 档 2） |
| G5 基建与治理（§1.6） | 19 | **D**（API 表面差分 / 品牌预设 `-solid` / 阶段构成计数机检 3）；范围外 16 |
| G6 服务层（§1.7） | 1 | 范围外（`useDialog` 维持候选） |
| G7 下游协同（§1.8） | 4 | **C**（PrimeVue 迁移经验回收 / 1.0 升级护航 2）；范围外 2（momei 根包接入条件候选、momei 侧迁移等待外部反馈） |
| **合计** | **42** | — |

> **候选覆盖声明**：a 组 42 行按能力归并为 **7 组**（6 + 6 + 2 + 4 + 19 + 1 + 4 = 42）；b 组 **1** 条落在 **D**；c 组 **3** 条为时点事实、不构成候选；d 组 **1** 条为长期任务义务、不占条目。**逐条均有落点**——A **2** / B **1** / C **2** / D **3**（+ b 组 1 = **4**）/ 范围外 **34**；**无静默豁免**。

> **触摸目标行的拆分口径**：登记时「触摸目标增强」一行**不整行移出**——P0 由 A-2 承接，P1 / P2 在 `backlog.md` §1.5 **就地重写**为独立候选保留。故登记后池内余 **35 条**（42 − 7 行真实移出），G4 余 **3** 行（滚动键盘 / 触摸目标 P1 · P2 / Toolbar）。

> **候选数 ≠ 条目数**：一个候选可拆为多个原子条目（如密度轴候选 → A 的 4 条条目），映射以 §2 为准；发布条目 E 不来自候选池。

## 2. 主线草案（5 条，符合[规划规范 §6](../../standards/planning.md) 的 3 ~ 6 条容量）

> **本节是候选 → 主线的唯一映射口径**（[规划规范 §9](../../standards/planning.md)）：§1 只给来源、分组与落点，本节不重复候选清单。主线标签用 `A` ~ `E`，条目按阶段内顺序登记为 `M1` ~ `M5`（见 §5.2）。

| 主线 | 内容 | 条目 | 论证 |
|:---|:---|:-:|:---|
| **A 移动端与响应式二期** | `data-density="touch"` 轴 + P0 不可见命中区 + 三档常驻回归与基线重冻结 + 指南与设计口径同步 | 4 | 1.0 前已裁定「1.0.0 发布后作为 1.1.0 实现」（[手机端优先预设评估](./2026-10-25-mobile-first-preset-evaluation.md) §8.3）；实测 289 个目标中 **87 个 < 24×24**，其中 **34 个**集中在 5 组件的清除 / 关闭 icon 按钮 |
| **B `Form` / `FormItem` 组合层** | 独立组合层 + 插槽作用域；无 rules 引擎；不扩既有字段契约 | 2 | 形态已评估（[M1-2 评估](./2026-10-24-phase26-m1-2-form-field-contract-evaluation.md)）；下游实测缺口 `v-form` 5 处 / `el-form` 3 处（[范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §2） |
| **C 下游迁移护航** | PrimeVue 迁移经验回收（含 Tooltip 行）+ 1.0 升级护航与已知限制转指南 | 2 | 1.0 已发布；迁移映射只在[设计规范 §7](../design-spec.md) 单点登记，指南中英各 72 行**无 Tooltip 行** |
| **D 机制与质量收口** | API 表面差分接入发布链 / 品牌预设 `-solid` 对比度 / 阶段构成计数跨载体机检 / 依赖告警收口 | 4 | API 差分脚本已存在但未接线（触发条件「`--tag` 落地」已满足）；阶段构成计数已 **3 次**判 Review Gate blocker；品牌 `-solid` 缺口在册；`minimatch` 自动更新不可行 |
| **E 发布收口** | 1.1.0 发布（里程碑 / sync / publish / verify / tag / 下游复验） | 1 | A / B 均为新增可见能力，属 SemVer `minor`，需独立 minor 交付 |

### A 移动端与响应式二期（4 条）

- **A-1 `data-density="touch"` 轴**
  - 面：控件高度 36 / 44 / 52、字号 14 / 16 / 18、内容宽度上限 `none`；与 `data-preset`（6 预设）及明暗**正交**；未设置属性时逐值不变。
  - **现状取证**：`rg -l 'data-density|hit-target-min' src` → **0**；`ls src/components | grep -v _shared | wc -l` → **56**；`ls src/locale/*.ts | grep -vE 'index|types' | wc -l` → **10**。
- **A-2 `--caomei-hit-target-min` 不可见命中区（P0）**
  - 面：5 组件的 **34 个** `13.33×13.33` 清除 / 关闭 icon 按钮 + Message 关闭（1 个）；`::after`（绝对定位、负 `inset`）扩到 **≥24×24**，**不改视觉盒**。
  - 依据：[触摸目标审计](./2026-10-16-phase25-m2-2-touch-target-audit.md) §4 的 P0 行；P1 / P2 维持候选。
- **A-3 常驻回归与视觉基线**
  - 面：390 / 768 / 1440 三档命中区用例（受检面下界 + 负向对照）；`capture:styles` 与 `test:visual` 的差异处置与重冻结记录。
- **A-4 指南与设计口径同步**
  - 面：`docs/design/responsive.md`、`docs/guide/mobile.md`（中英）、组件页密度节、画廊 / 组件总览登记、token 冻结面计数回扫（`version-policy` 与冻结清单）。

### B `Form` / `FormItem` 组合层（2 条）

- **B-1 组件实现与单测**
  - 面：`Form` 负责布局与提交编排；`FormItem` 通过**插槽作用域**提供 `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`；12 个字段组件**逐项绑定**（组型控件用 `aria-labelledby`，`Switch` 无校验状态通道须显式说明）；**无 rules 引擎**；**不扩** `FieldProps` / `FieldStateProps` / `FieldIdentityProps`。
  - **约束**：沿用 [M1-2 评估](./2026-10-24-phase26-m1-2-form-field-contract-evaluation.md) 的「独立组合层」推荐形态与「不扩契约」结论。
- **B-2 文档、示例、E2E 与计数回扫**
  - 面：中英组件页与示例；组件总览 / 画廊 / locale 台账 / 冻结面与 API 基线计数回扫（新增 2 组件的全部计数载体）。

### C 下游迁移护航（2 条）

- **C-1 PrimeVue 迁移经验回收**
  - 面：回看 dependfix 迁移提交 / 问题清单与本仓在册下游反馈；补 [迁移指南](../../guide/primevue-migration.md)（中英）的「常见陷阱」「迁移后自检」「逐组件对照入口」，其中入口表**补 `Tooltip` 行**；能力缺口与文档缺口分开登记。
  - **现状取证**：`rg -c 'Tooltip' docs/guide/primevue-migration.md` → **0**；映射正文在[设计规范 §7](../design-spec.md) 第 361 行（Tooltip 迁移映射段）。
  - 边界：是否提供**指令形态**（`v-tooltip` + 方向修饰符）不在本条内决定，须另立评估。
- **C-2 1.0 升级护航**
  - 面：下游实测版本快照与 1.0 升级注意；把 1.0 的对外 7 条（6 条已知限制 + 1 条升级注意）转成指南可检索节；momei 反馈缺口显式声明。
  - **现状取证**：`todo.md` 的「未完成项汇总」记两仓 `caomei-ui` 仍为 **0.6.0**（2026-10-13 复核，1.0.0 后未重测）；`v1.0.0` tag 的下游兼容检查已通过（run 41482763157）。

### D 机制与质量收口（4 条）

- **D-1 API 表面差分接入发布链**
  - 面：`check:api-surface`（`scripts/release/diff-api.mjs`）接入 `manual-release.mjs`；判别口径 = **删除 / 重命名 / required 收紧**为 breaking，**新增不阻断**；首次真实差分记录。
  - **现状取证**：`package.json` 第 141 行定义脚本；`rg -c 'api-surface|diff-api' scripts/release/manual-release.mjs .github/workflows/*.yml` → **0**（未接线）。触发条件「发布链路 `--tag` 落地」已于 Phase 26 满足。
- **D-2 品牌预设 `-solid` 对比度治理**
  - 面：`momei` 亮色 `success` 默认 / hover / active = 2.279 / 2.643 / 3.045，`caomei` `primary-solid` = 4.17；把 **`-solid` 配对（默认 / hover / active）纳入常驻断言面**（6 预设 × 明暗 × 2 背景）；修色或留痕二选一。
  - **现状取证**：`test/e2e/preset-contrast.e2e.ts` 的 `PRESETS` = 6，断言面为 21 条 tone 文本 + 4 条控件边界，**不含** `-solid` 配对。
- **D-3 阶段构成计数跨载体一致机检**
  - 面：`todo.md` 的当前状态句 / 条目表 与 `roadmap.md` 的 §1 当前态句 / 阶段表行；守卫须带**负向对照**与**受检面下界**，接入 `governance:check`。
  - **现状取证**：该族已在 2026-09-30（两批）+ 2026-10-14 + 2026-10-16 共 **3 次**判 Review Gate blocker；当前无对应脚本（`rg -l '阶段构成|跨载体' scripts` 无命中该面的守卫）。
- **D-4 依赖告警收口**
  - 面：`minimatch` medium（open #71）——`pnpm why minimatch` → **3.1.5**，链路全在 dev 作用域（eslint / commitizen）；自动更新不可行（可解析 3.1.5 < 最低无漏洞 11.0.1）；覆盖评估（override 至 11）或留痕 + 触发条件；`deepmerge` low（#69，无补丁）维持留痕。
  - **判据**：不引入不可用 override；处置结论与证据落记录，不阻塞 1.1.0 发布。

### E 发布收口（1 条）

- **E-1 1.1.0 发布**
  - 顺序：按[发布指南](../../guide/release.md) §3.2 分步（`preflight` → `bump` → `changelog` → `sync` → `publish` → `verify` → `announce`），其中长期任务门槛复核（第 29 轮）在 `preflight` 前完成，`verify` 含 API 差分，`tag` 由 `bump` 创建并在 `announce` 前推送。
  - **前置**：用户明确授权推送；`latest` 由 `1.0.0` 前移为 `1.1.0`。

## 3. 待决策点（D1 ~ D5）

| 编号 | 决策点 | 备选 | 推荐 |
|:---|:---|:---|:---|
| **D1** | 是否启动本阶段、取哪几条主线 | ① **全部 A + B + C + D + E** ② A + B + D + E ③ A + C + D + E ④ A + B + E ⑤ 仅 D + E | **①**（5 主线 / 13 条目；1.1.0 一次交付） |
| **D2** | 移动端范围 | ① **密度轴 + P0** ② 密度轴 + P0 + P1 ③ 仅密度轴 ④ 密度轴 + P0 ~ P2 | **①**（P0 为最大单一构成且 `::after` 不改视觉盒；P1 / P2 维持候选） |
| **D3** | `Form` / `FormItem` | ① **本阶段实现** ② 继续后置 ③ 先原型再定 | **①**（形态与契约边界已定，实现成本可估；下游存在真实表单编排缺口） |
| **D4** | 发布形态 | ① **阶段末发 1.1.0** ② 本阶段不发版 ③ 阶段末再裁定 | **①**（A / B 均为新增可见能力，累积会扩大单次发布面） |
| **D5** | 国际化二期 / RTL | ① **维持范围外** ② 二期语言纳入 ③ RTL 纳入 | **①**（RTL 风险高须单独立项；二期语言等扩容决策） |

### 3.1 裁定结果（用户 2026-11-03）

| 编号 | 裁定 | 结论 |
|:---|:---|:---|
| **D1** | ① | 五条主线全取（A + B + C + D + E） |
| **D2** | ① | 密度轴 + P0 命中区；P1 / P2 维持候选 |
| **D3** | ① | 本阶段实现 `Form` / `FormItem`（独立组合层） |
| **D4** | ① | 阶段末发 `1.1.0`，前置 = 用户明确授权推送 |
| **D5** | ① | 国际化二期 / RTL 维持范围外 |

> **默认落定（不占决策项）**：`Form` 不扩既有字段契约、不带 rules 引擎；`minimatch` 若 override 不可行则留痕 + 触发条件（不阻塞发布）；命中区只做 P0、缺省路径零变化；视觉基线按实际差异重冻结并留记录；E-1 的推送与发布以用户当次明确指令为前提。

## 4. 规模与风险

- **规模**：5 条主线 / **13** 条原子条目（A 4 / B 2 / C 2 / D 4 / E 1），与 Phase 20 ~ 26 的 8 ~ 17 条同量级；预估 **3 ~ 5 个交付轮**。
- **风险**：
  1. **公开契约扩张**：`data-density` 与新 token 进入冻结面，须在 1.1.0 前定型；缺省路径必须逐值不变（`capture:styles` 0 差异）。
  2. **命中区几何**：`::after` 不改视觉盒，但需实证与视觉基线复核；P1 的 `Switch` 轨道绘制为已知难点，已排除在本阶段外。
  3. **新增组件扩散面**：`Form` / `FormItem` 会扩散到冻结面、API 差分、组件总览 / 画廊 / locale 台账与文档站计数，须逐载体回扫。
  4. **API 差分判别力**：首次运行会遇到「新增 2 组件」的合法新增，规则须明确「新增不阻断」，否则发布被自身门禁阻断。
  5. **依赖告警不可自动修复**：`minimatch` 跨 4 个大版本，override 可能破坏 eslint 链；只能以「评估 + 留痕」收口。
  6. **发布顺序**：1.1.0 必须在 A / B 全部通过 Review Gate 与质量门后发布；不可用未验证的命中区几何做发布试验。
- **非目标（建议）**：P1 / P2 命中区、RTL、二期语言、长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker）、`Form` rules 引擎（Zod / 自研）、提交驱动 CI 自动发布（**2026-11-03 执行期改为纳入 CI 发布链路；push 触发仍为非目标**）、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook、自动推送。

## 5. 登记状态

### 5.1 阶段与构成

- 按[规划规范 §4](../../standards/planning.md) 分配 **Phase 27**（1.1.0：移动端密度轴、Form 组合层、迁移护航与机制收口），构成 **5 条主线 / 13 条原子条目**（A 4 / B 2 / C 2 / D 4 / E 1；构成对账 4 + 2 + 2 + 4 + 1 = 13，**2026-11-03 登记时点值**）。**2026-11-03 执行期追加 M6（CI 发布链路 5 条）后为 6 条主线 / 18 条原子条目**，见 §5.3 与[登记记录](./2026-11-03-phase27-registration.md) §1.1。
- **范围与验收口径的单一事实源**：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §1 / §2；本记录只保留评估与裁定。

### 5.2 载体同步

| 载体 | 变更 |
|:---|:---|
| `docs/plan/todo.md` | 登记「当前进行中阶段：Phase 27」+ `## Phase 27 原子条目` 段（登记时 13 行；2026-11-03 执行期追加后 18 行） |
| `docs/plan/roadmap.md` | §1 当前态句 + 阶段表新增 Phase 27 行 |
| `docs/plan/backlog.md` | 移出 7 行（`Form` / `FormItem`、密度轴、阶段构成计数机检、API 表面差分、品牌 `-solid`、下游 0.5.0 升级护航、PrimeVue 经验回收）+ 就地重写 1 行（触摸目标 → P1 / P2 候选）；**42 → 35**（6 + 5 + 0 + 2 + 3 + 16 + 1 + 2）。**执行期追加后再移出 2 行 → 33**，见 §5.3 |
| `docs/design/governance/index.md` | 新增本记录与登记批次记录两条索引 |
| `.session/`（git-ignored） | `current-task.yaml` 的 `current_phase` / `active_plan` / `next_steps` / `decisions` 与 `runtime-state.json` 的 `plan_state` 同批同步 |

### 5.3 执行期追加（2026-11-03）

- **触发**：用户指令「下阶段开始要通过 CI 来发布了，release 的工作流还没修复，应该添加到 todo 中」。
- **追加**：**M6 CI 发布链路 5 条**（工作流接线与凭据 / 版本句与发布说明同步 / 前置与后置门禁 / 事件链与下游复验 / `CHANGELOG` 生成器健壮性）；**M5-1 改为经 CI 发布**（触发模型 = `workflow_dispatch` + `environment` 审批，用户同日裁定），手工流保留为回退。
- **构成变更**：5 条主线 / 13 条（时点值）→ **6 条主线 / 18 条**（4 + 2 + 2 + 4 + 1 + 5）。
- **候选池**：再移出 2 行（提交驱动 CI 自动发布、`CHANGELOG` 生成器健壮性收口）→ **35 → 33**。
- **现状取证**：`release.yml` 的 publish 步骤仍为注释；仓库无 `NPM_TOKEN` secret、无 `release` environment、无 `next` 分支；`semantic-release-cmyr-config@1.0.2` 的 assets 仅 `CHANGELOG.md` + `package.json`（不同步版本句）。取证方式与时间（2026-11-03）：`gh secret list` / `gh api repos/CaoMeiYouRen/caomei-ui/environments` / `git ls-remote --heads origin`。

## 6. Review Gate

- **audit-depth**：`standard`（纯规划 / 治理文档批次，零 `src/**`、零测试、零配置改动；但含阶段登记、跨载体计数与候选池变更，需逐载体核对口径）；时间盒 ≤ 8 分钟，实测约 8 分钟（2026-11-03T05:26:10Z 发起，含调用往返）。
- **R1（`standard`）：`Reject`**（1 blocker / 4 warning / 4 suggest）。
  - **RG-B01**：`backlog.md` 的「触摸目标增强」整行移出，但记录三处与 `todo.md` 仍称「P1 / P2 维持候选」⇒ 候选载体丢失、同批两套口径。**修复**：§1.5 就地重写为「触摸目标增强 P1 / P2」候选（P0 由 A-2 承接；P1 17 个 / P2 35 个；触发条件写明），本批改为「移出 7 行 + 就地重写 1 行」，候选池 **42 → 35**，并同步 §1.2 / §5.2 / 登记记录 / 索引 / `.session`。
  - **RG-W02**：`-solid` 的「断言面扩到全部预设」与同批取证矛盾（6 预设 × 明暗 × 2 背景已在矩阵内，真缺口是 `-solid` 配对）⇒ 三处改为「把 `-solid` 配对（默认 / hover / active）纳入常驻断言面」。
  - **RG-W03**：`responsive.md` 与 `mobile.md` 中英仍以「不纳入触摸目标 / 候选登记见 Backlog」陈述 ⇒ 登记记录 M1-4 的范围与验收加入「关闭三处旧心智表述 + 回扫为 0」，`todo.md` 同步。
  - **RG-W04**：M3-2 验收锚点只到 `1.0.0` 段，而下游快照为 `0.6.0` ⇒ 改为「覆盖实测下游版本 → 目标版本的全部 minor（区间在条目开始时实测后写定）」，并拆清「对外 7 条 = 6 条已知限制 + 1 条升级注意」。
  - **RG-W05**：`.session/runtime-state.json` 预写 `pass` 与 `verification_state = pending` 矛盾 ⇒ 改为 `pending（待 Review Gate 回填）`。
  - **suggest 6 ~ 9**：roadmap 的 M2 补「文档 · 示例与计数回扫」；`todo.md` 的 M1-3 补「密度轴」；拆清对外 7 条；三处发布顺序改为按 `release.md` §3.2 分步（含 `preflight` / `bump`）。
- **R2（`quick` delta）：`Pass`**（无残留 blocker / warning；2 条非阻塞 suggest：G4 落点单元格的加总歧义、`todo.md` 摘要省略 `-solid` 三态括注）。
- **R3（`standard`，2026-11-03 执行期追加 M6）：`Pass`**（0 blocker / 5 warning / 3 suggest，全部同批关闭）——构成变更回扫面一致、M6 覆盖 8 项缺口、候选池 33 可复算；详见[登记记录](./2026-11-03-phase27-registration.md) §6。
- **验证证据**：`pnpm lint:md:check` exit 0；`pnpm docs:check` exit 0；`pnpm governance:check` exit 0（`check-planning-numbers` 0 处）；`backlog.md` §1 逐段复算 6 + 5 + 0 + 2 + 3 + 16 + 1 + 2 = **35**；`git diff --stat` 的 backlog = `-8 / +1`（移出 7 + 重写 1）。
- **未覆盖边界**：未跑 `pnpm verify` / 构建 / 测试（本批零代码改动，最低验证矩阵为 `lint:md` + 链接路径 + RG）。
- **复查基线**：本记录 §1.1 / §1.2 / §2 / §3 / §5.2；登记记录 §2 / §4；`docs/plan/backlog.md` §1.5 与 §1 逐段计数；`docs/design/governance/index.md` 两条摘要。

## 7. 未覆盖边界

- **未实测密度轴的尺寸组合**：36 / 44 / 52 与字号 14 / 16 / 18 的组合是否覆盖全部控件档位，待 A-1 执行时以逐组件矩阵复算。
- **未复算命中区扩大后的全部交叉面**：只按 P0 的 34 + 1 个目标立项；P1 / P2 与拖拽容差未纳入。
- **未评估 `Form` 的下游真实用法**：`v-form` / `el-form` 计数为 2026-10-13 快照，未逐条核对字段绑定形态。
- **未复核两仓当前 `caomei-ui` 版本**：沿用 2026-10-13 的 `0.6.0` 快照；1.0.0 后未重测。
- **未评估 `minimatch` override 的实际兼容性**：只登记「自动更新不可行」与候选处置，未试跑 `eslint@9` + `minimatch@11`。
- **未做 API 差分的首次真实运行**：脚本存在但未接线，判别口径为建议值。
