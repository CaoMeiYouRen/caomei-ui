# Phase 26 执行期追加与 1.0 发布门禁（规划）

> 创建时间：2026-10-26
> 触发：用户就[《Refactoring UI》20 条规则对照自检（初步评估）](./2026-10-26-refactoring-ui-self-check.md) §4 的发现作出规划指令——**第 1 档列入插队 todo，第 2 档进入 Backlog；1.0 发布延后，并设置不可无限延后的发布门禁**。
> 依据：[规划规范 §3 / §4 / §5 / §6](../../standards/planning.md)。
> **本记录是本次规划的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引 / `.session` 只引用本记录的结论。

## 1. 决策摘要

| 项 | 决策 |
| --- | --- |
| 第 1 档（低成本修复） | 进入 Phase 26 **执行期追加的 M5 插队批次**，4 条原子条目（M5-1 ~ M5-4） |
| 第 2 档（颜色角色 + 非文本对比度） | 进入 [Backlog §1.6](../../plan/backlog.md)（高优先级），**不进入当前 todo**；1.0 门禁要求对其作出「修复 / 明确接受」二选一裁定。**2026-10-28：G1 裁定「修复」，候选行已从 Backlog 移出并登记为 G1-F** |
| Phase 26 构成 | 原登记 **4 条主线 / 13 条原子条目** → 执行期追加后 **5 条主线 / 17 条原子条目**（M1 4 / M2 4 / M3 3 / M4 2 / M5 4） |
| 1.0 发布 | **延后**；`M3-3` 在门禁 G0 ~ G4（含条件 G1-F）全部通过前不得执行 |
| 门禁时间盒 | 目标评审 **2026-11-13**；硬截止 **2026-11-27**；硬截止未通过不得自动延期，须用户三选一裁定（见 §4.3） |

## 2. M5 插队批次（4 条）

### 2.1 准入说明

[规划规范 §3.5](../../standards/planning.md) 的插队例外只允许三类。本批逐条对应如下，不静默放宽：

- **M5-1** 命中第 3 类「直接影响可用性的 blocker 级缺陷」：DataTable 横向滚动容器不可键盘聚焦，键盘用户无法读取溢出列。
- **M5-2 / M5-3 / M5-4** 不单独命中三类例外，属**用户 2026-10-26 明确指定插队**的同批 UI 缺陷；按用户裁定登记，并在本记录留痕，不表述为「自动命中例外」。
- 第 2 档（颜色角色 / 非文本对比度）虽含 P0，但用户已指定进入 Backlog，故**不进入 M5**；其 1.0 处置由门禁 G1 强制裁定，避免「进 Backlog = 默认豁免」。

### 2.2 原子条目

| 编号 | 条目 | 范围 | 验收标准 |
| --- | --- | --- | --- |
| **M5-1** | **DataTable 横向滚动容器键盘可达** | `src/components/data-table/data-table.vue`：根滚动容器增加**常驻** `tabindex="0"`（本轮不引入 ResizeObserver 条件化；条件化另立条目）；有 `caption` 时补 `role="group"` / `aria-label`，无 `caption` 时至少保证可聚焦且不伪造可访问名；新增键盘滚动 E2E；中英组件页「无障碍」补一句 | axe `scrollable-region-focusable` 为 0；375px 窄屏下 Tab 可进入容器、`ArrowRight` 后 `scrollLeft > 0`；不得出现嵌套重复 `tabindex`；无视觉变化 |
| **M5-2** | **Select 示例可访问名（中文）** | `docs/examples/select/` 7 个示例：给每个 `CaomeiSelect` 补 `label`（映射 `aria-label`），名称表达字段用途而非重复 placeholder；画廊复用 `select/basic.vue`（同一文件，不额外计数）。同批把文档页 axe 抽检收进 `scripts/docs/check-docs-axe.mjs`；**M5-2 只验收 zh `/components/select` + `/components/showcase`**，全矩阵（data-table / en）在 M5-1 / M5-3 完成后由 G0 跑 | zh `/components/select` 与 `/components/showcase` 的 axe `button-name` 为 0；`scripts/docs/check-docs-axe.mjs` 在 zh select / showcase 范围退出码为 0；不得只改 placeholder 文案；不得引入可见布局变化 |
| **M5-3** | **Select 示例可访问名（英文）** | `docs/i18n/en-US/examples/select/` 7 个示例：同 M5-2 口径 | `/en-US/components/select` 与 `/en-US/components/showcase` 的 axe `button-name` 为 0；中英可访问名语义对齐 |
| **M5-4** | **Button hover / active 反馈** | `src/components/button/button.vue`：用 `color-mix()` 派生 hover / active（不新增冻结 token）；补计算样式测试；`docs/design/design-spec.md` §6 Button 行与中英组件页补「状态反馈」说明；视觉基线按实际差异重冻结 | hover / active 与默认态计算样式不同；各变体 / tone 的文字与背景对比度仍 ≥ 4.5:1；`:disabled` / `:focus-visible` 行为不变；`prefers-reduced-motion` 下无过渡；`capture:styles` 仅出现预期差异 |

### 2.3 交付顺序与依赖

1. **M5-1** 独立（src + E2E）。
2. **M5-2 / M5-3** 可并行（M5-2 = docs 7 文件 + 抽检脚本；M5-3 = docs 7 文件）；建议与 M5-1 同批复验 axe。
3. **M5-4** 独立（src + 视觉基线）；与 M5-1 可并行，但提交分开。
4. 四项全部完成后执行一次 **M5 收口自检**：`/components/data-table`、`/components/select`、`/en-US/components/select`、`/components/showcase`、`/en-US/components/showcase` 的 axe 复跑；`capture:styles` 差异逐项有据；Review Gate 逐项 Pass。**G0 只采信 `scripts/docs/check-docs-axe.mjs` 的退出码与报告**；`test-results/` 只存原始截图 / JSON，不得作为唯一证据。

### 2.4 非目标

- 不实施第 2 档（tone text / control-border）的任何色值或 token 变更。
- 不新增 `Empty` 组件、不改空态 / 加载态、不改文档站品牌色与 demo 容器。
- 不做破坏性 API 变更；不扩大触摸目标；不引入 Tailwind / UnoCSS。
- 不把示例 axe 脚本接入 `verify` / `governance:check` 常驻链；脚本先作为 G0 一次性取证，是否常驻随 M5 收口另行评估。

## 3. 第 2 档：Backlog 登记

在 [Backlog §1.6](../../plan/backlog.md) 新增一行，候选名 **「颜色角色分层与非文本对比度治理（tone text / control-border）」**，优先级 **高**，来源 = 本轮自检 §4.1 / §4.2（**2026-10-28 G1 裁定「修复」后已移出该行并登记为 G1-F**），说明包含：

- **问题**：品牌预设 soft / outline 状态文本实测 success 2.12 / warning 2.58 / danger 3.34–3.39；`caomei` `text-muted` 4.02；交互控件 `border` / `bg` 1.09–1.83。
- **候选形态**：`--caomei-color-<tone>-text`（亮色 -700 / 暗色 -300 ~ -400 或 OKLCH 派生）+ `--caomei-color-control-border`（≥ 3:1）+ 全预设矩阵断言。
- **触发条件**：1.0 门禁 G1 裁定为「修复」时登记到当前阶段；或 1.0 后作为 1.x 治理项。若 G1 裁定为「接受」，本条保留为 1.x 候选，同时 1.0 必须登记 known limitations。
- **不放在候选行的内容**：阶段编号、具体实现批次、未裁定的色值。

`todo.md` 的「未完成项汇总」保留一行条件候选指针（判别键 `颜色角色分层`），由 `check:candidate-anchors` 对账；该行不构成 todo 登记或启动授权。

## 4. 1.0 发布门禁

### 4.1 门禁表

| Gate | 判据 | 证据 | 状态 |
| --- | --- | --- | --- |
| **G0 插队批次完成** | M5-1 ~ M5-4 全部完成；每项经 Review Gate Pass；M5 收口自检的 axe / 计算样式 / 视觉基线通过；`scripts/docs/check-docs-axe.mjs` 全矩阵退出码为 0 | 提交、治理记录、`check-docs-axe` 全矩阵输出、`capture:styles` diff | **已完成（2026-10-28）**：见 [G0 记录](./2026-10-28-phase26-g0-m5-closure-self-check.md) |
| **G1 新问题裁定** | 第 2 档（颜色角色 + 非文本对比度）完成 **「修复」或「明确接受」二选一**；G1 在**裁定完成时关闭**。接受时须写 1.0 known limitations + 1.x 承诺；裁定修复时转入 G1-F；不得沉默 | 用户裁定记录 / 本记录 §4.2 | **已完成（2026-10-28）：用户裁定「修复」**，转入 G1-F |
| **G1-F 修复交付（条件）** | **仅当 G1 裁定「修复」时启用**：tone text / control-border / 全预设矩阵断言完成并通过；Review Gate Pass。G1-F 关闭前不得发 `1.0.0` | 提交、矩阵测试输出、治理记录 | **已完成（2026-10-28）**：见 [G1-F 记录](./2026-10-28-phase26-g1-f-color-role-fix.md) |
| **S1 依赖安全清理（前置，2026-10-28 追加）** | 15 项开发作用域 Dependabot 告警在 lockfile 解析层清零（`undici` / `fast-uri` / `serialize-javascript` / `node-forge` / `nuxt` / `@vitest/mocker`）；依赖升级后质量门复跑；残留项（无补丁）有再评估触发 | lockfile 解析 + `pnpm audit` + 治理记录 | **已完成（2026-10-28）**：见 [S1 记录](./2026-10-28-phase26-s1-dependency-alerts-remediation.md) |
| **S2 Code Scanning 清理（前置，2026-10-28 追加）** | 5 项 Code Scanning 告警（3 条 high：1 条 tag filter + 2 条不完整多字符清洗；2 条 medium：两个 job 缺 workflow 权限）修复；守卫脚本与单测通过；CI 补最小权限 | `pnpm verify` + 守卫实跑 + YAML 解析 + 记录 | **已完成（2026-10-28）**：见 [S2 记录](./2026-10-28-phase26-s2-code-scanning-remediation.md) |
| **G2 质量门** | `pnpm verify` 全绿（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check）；`test:e2e` / `test:a11y` / `test:visual` 全绿。**S1 / S2 的同名检查属批次自检，不作 G2 放行证据** | CI / 本地日志 | **已完成（2026-10-28）**：见 [G2 记录](./2026-10-28-phase26-g2-quality-gate.md) |
| **S3 安全告警门禁 CI 接入（2026-10-29 追加，G2 通过后）** | 告警检查脚本 + `Security Alerts` workflow；`SECURITY_ALERTS_TOKEN` secret 读取两类 open 告警；豁免文件与规范 / 指南同步 | 单测 / eslint / YAML / 实网运行 + 记录 | **已完成（2026-10-29）**：见 [S3 记录](./2026-10-29-phase26-s3-security-alert-gate-ci.md) |
| **G3 RC 与下游** | `1.0.0-rc.1` 发 `next` 前按[安全规范 §2.1](../../standards/security.md#_2-1-发布前安全告警门禁)复核告警（critical = 0，high 全部修复或留痕豁免）；M4-1 dependfix `typecheck` + `build` 绿；tarball shasum / `exports` 13 键 / 发布时 API 差分留痕 | registry / CI run / release log | **阻塞（npm 凭据）**：发布前检查已完成；唯一硬阻塞为 npm 凭证 401 且默认 registry 指向镜像。见 [G3 记录](./2026-10-29-phase26-g3-rc-release-readiness.md) |
| **G4 发布证据** | 1.0.0 CHANGELOG、GitHub Release note、version policy、known limitations、回滚方案就绪；**按[安全规范 §2.1](../../standards/security.md#_2-1-发布前安全告警门禁)复核 Dependabot / Code Scanning：critical = 0，high 全部修复或留痕豁免**；用户明确授权推送与发布。回滚方案由 `M3-3` 负责在 G4 前完成 | docs + 用户授权 | 未开始 |

> **安全规范 §2.1 适用于 G3 与 G4，以及 §4.3 的例外发布路径**：critical 不允许豁免，high 必须修复或按规范留痕豁免。

> **G2 的证据必须在 S1 / S2 之后取得**：依赖解析变更会改写工具链（`nuxt` 4.6.3 / `vitest` 4.1.12），S1 之前的 G2 读数不得作为放行依据。

> **G0 之前不得发 `1.0.0-rc.1`。** `M3-2`（CHANGELOG 里程碑段）可先行起草，但不得据此发布；`M3-3` 保持阻塞。**G1-F 是发布前置门禁，不占 Phase 26 原子条目计数**；若裁定「修复」需要实际代码交付，按 §4.3 走新批次并触发 §3.9 回扫。

### 4.2 G1 的两种裁定

- **修复**：G1 在裁定完成时关闭；第 2 档从 Backlog 移出并进入当前阶段，按「tone text / control-border / 矩阵断言」拆条交付；**G1-F 必须在 `1.0.0-rc.1` 前关闭**，G1-F 关闭前不得发 `1.0.0`。
- **明确接受**：G1 在裁定完成时关闭；用户确认 1.0 以已知限制发布；`docs/guide/version-policy`（中英）与 1.0.0 CHANGELOG 必须列出：品牌预设 soft / outline 状态文本对比度、默认预设 soft warning 贴线项（axe 4.49；历史 4.50 为取整）、`caomei` `text-muted` 4.02、交互控件非文本 3:1 未达标；同时写明 1.x 修复承诺。**接受不等于从 Backlog 删除**，候选保留到 1.x。

### 4.3 时间盒与硬截止

- **目标门禁评审：2026-11-13**（G0 / G1 / G2 应有结论）。
- **硬截止：2026-11-27**。到期未通过，**不得自动延期**，由用户三选一裁定：
  1. 以明确例外发布 1.0（仅当 G0 / G2 / G3 已通过、安全规范 §2.1 已通过，且 G1 已作出「接受」裁定；若 G1 为「修复」，则 G1-F 通过后按正常序列发布，不适用例外）；
  2. 批准一次新的、带明确日期的延期（不沿用旧时间盒）；
  3. 取消本次 1.0 窗口，回 Phase 26 重新评估发布范围。
- 门禁期间新发现的 P0 **进入新批次或新门禁条目**，未关闭 / 未接受前不得发布；追加即触发[规划规范 §3.9](../../standards/planning.md) 的全载体回扫，不得静默把「M5 4 条 / 17 条」改成未登记的数字。

## 5. Phase 26 构成与发布序列

- **原登记（2026-10-22）**：4 条主线 / 13 条原子条目（4 + 4 + 3 + 2）。
- **执行期追加（2026-10-26）**：M5 插队批次 4 条 → **5 条主线 / 17 条原子条目**（4 + 4 + 3 + 2 + 4 = 17）。
- **发布序列**：M5 完成 → G0 / G1（若裁定「修复」则加 G1-F）→ S1 依赖安全清理 → S2 Code Scanning 清理 → G2 → S3 安全告警门禁 CI 接入（G2 通过后追加，rc 前生效）→ `1.0.0-rc.1` 发 `next` → G3 下游复验 → G4 证据与授权 → `1.0.0` 发 `latest`。
- `M3-2` 可先起草；`M3-3` 状态改为「阻塞（1.0 门禁）」；`M4-1` 可在 rc 后进行；`M4-2` 不阻塞发布。

## 6. 载体同步

| 载体 | 动作 |
| --- | --- |
| `docs/plan/todo.md` | 当前状态句补「1.0 延后 / 门禁」；Phase 26 条目表新增 M5-1 ~ M5-4；构成 4/13 → 5/17；`M3-3` 标阻塞；「未完成项汇总」加门禁指针与 Backlog 条件候选行 |
| `docs/plan/roadmap.md` | §1 现状句补 1.0 延后 + 门禁；Phase 26 行补执行期追加与 5/17 |
| `docs/plan/backlog.md` | §1.6 新增「颜色角色分层与非文本对比度治理」高优先级行（**2026-10-28 G1 裁定修复后已移出**） |
| `docs/design/governance/2026-10-22-phase26-registration.md` | 追加 §8「执行期追加（2026-10-26）」：原 4/13、现 5/17、1.0 延后与门禁指针 |
| `docs/design/governance/index.md` | 新增本记录条目；Phase 26 登记记录摘要补「原登记 4/13；2026-10-26 后为 5/17」 |
| `.session/current-task.yaml` | 阶段态 / 摘要 / next_steps / decisions 同步；门禁为当前阻塞点 |
| `.session/runtime-state.json` | `plan_state.phase` 补 5/17 与门禁；`verification_state.reason` 指向本轮自检与规划 |
| 后续新增前置批次（S*） | 回扫 §4.1 的 G2 行限定句与 §5 发布序列，并在 `todo.md` 的 1.0 门禁句补登，避免「只登记批次表、未纳入门禁口径」 |

## 7. Review Gate

- **R1（`standard`）：`Reject`**（1 blocker / 5 warning / 6 suggest）。blocker = 执行期追加的 §3.9 回扫面遗漏（`index.md` 第十轮评估摘要 + 评估记录本体仍只写 4 / 13）；warning = 对比度台账覆盖表述、G1 关闭条件、G0 axe 证据可复现性、发布指南门禁死锁、索引「Review Gate 不适用」。**修复已同批落盘**，见本记录 §4.1 ~ §4.3、自检记录 §4.1 / §9、`index.md`、`docs/guide/release.md` 中英。
- **R2（`delta`，`quick`）：`Pass`**（0 blocker）。R1 的 B1 与 W1 ~ W5 全部关闭；残留 6 条非阻塞项（例外路径措辞、G1-F 未回扫到摘要、M5-2 独立验收、脚本与非目标冲突、时点注记指代、warning 取整值）已在同批修正，属非新范围。
- **R3（最终 `quick` delta）：`Pass`**（0 blocker）。6 条残留逐项关闭，未发现修复引入的新 blocker；复查基线 = `b8a2086` + 当前工作区（8 改 + 2 新增，全部 `docs/**`）。
- **审计深度 / 时间盒**：`standard`（R1）/ `quick`（R2 delta）；5 个规划载体 + 2 份治理记录 + 索引 + `.session`；零 `src/**`、零测试、零配置；R1 时间盒 ≤ 6 分钟。
- **Review Gate 前自检**：`lint-md`、`check:planning-numbers`、`check:candidate-anchors`、`check:governance-records`、`docs:check`、`check:final-newline` 均通过。

## 8. 未覆盖边界

- 本记录只做规划，不实施 M5，也不实施第 2 档。
- 2026-11-13 / 2026-11-27 为**默认时间盒**，用户可一次性调整；调整须在本记录追加新日期并说明取代关系，不得静默改期。
- 1.0 门禁的质量门清单以当前 `package.json` 的 `verify` 链为准；若期间 `verify` 链变更，须同步本记录。
