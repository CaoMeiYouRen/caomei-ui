# Phase 21 M1-1：下游兼容检查 reusable workflow（库侧）

> 创建时间：2026-10-10
> 关联条目：[待办事项](../../plan/todo.md) Phase 21 **M1-1**（下游回归机制启动）
> 依据：用户 2026-10-10 裁定 D2 ~ D5（**启动 Phase 8 + B reusable workflow + 仅 dependfix + 沿用 §10 阻塞语义**）；[Phase 8 启动范围评估](./2026-10-08-phase8-downstream-regression-scope-evaluation.md) §4 / §5；[发布指南 §10](../../guide/release.md)
> 边界：本批为**库侧检查逻辑落地**（caomei-ui 提供 reusable workflow）；**触发方式与下游接入属 M1-2**；不改 [发布指南 §10](../../guide/release.md)（口径修正归 M4-1）；**未执行真实贯通验证**（需下游接入 + 推送触发）。
>
> **后续（2026-10-10 同日）**：本记录的交付物 `compat-check.yml`（B reusable workflow）经用户复议**已被取代并删除**——形态变更为「**上游触发 + 上游执行**」（caomei-ui 自身工作流 checkout 下游源码执行），见[形态变更记录](./2026-10-10-phase21-m1-form-change-upstream-executed.md)。本记录为点时记录，正文保留不改。

---

## 1. 交付

- 新增 **`.github/workflows/compat-check.yml`**（约 120 行）：`on: workflow_call` 的**下游兼容检查** reusable workflow。
- 设计要点：
  1. **在调用方仓库上下文运行**（`actions/checkout` 取下游仓库），故可复用下游既有安装 / 构建链；**无需跨仓 token**（符合 B 形态）。
  2. **检查范围最低 `typecheck` + `build`**（对齐 §10），**不含** e2e / 视觉回归 / 全量单测 / 覆盖率。
  3. **命令参数化**（8 个 `inputs`）：`caomei-ui-version`（默认 `lockfile`，不覆盖）/ `node-version` / `install-command` / `install-target-command`（把 caomei-ui 覆盖到被测版本，用 `$CAOMEI_UI_VERSION`）/ `setup-command`（如构建 workspace 依赖 / `nuxt prepare`）/ `typecheck-command` / `build-command` / `working-directory`。适配不同下游的 pnpm workspace 结构（B 形态的已知代价）。
  4. **被测版本可注入**：`install-target-command` 在 `install` 之后执行，允许把下游锁定版本改写为被测版本并重装。
  5. `permissions: contents: read`；`timeout-minutes: 20`；workflow 级 output 回传实际被测版本。
  6. **触发方式由调用方决定**——本 workflow 只提供检查逻辑；「发布即刻自动触发」需跨仓 dispatch 凭据（属另一形态），当前未启用（见 §4 边界）。

## 2. 设计依据（对齐 §10）

| §10 口径 | 本交付 |
|:---|:---|
| 跨仓机制取 `repository_dispatch` 或 **reusable workflow** | 取 **reusable workflow**（B） |
| 至少覆盖 `typecheck` 与 `build` | 固定为 `typecheck` + `build`（命令可覆盖但默认即此二者） |
| 任一 `typecheck` / `build` 失败视为兼容性阻塞 | 步骤失败即 job 失败（默认阻塞语义，沿用 §10） |
| 已接入下游清单 | 受检清单口径修正归 **M4-1**（本批不改 §10） |

## 3. 验证

- **YAML 静态校验**：`python3 -c "import yaml; yaml.safe_load(...)"` **通过**（`workflow_call` + 8 inputs 默认值 + 9 steps 结构解析正确；文件以换行结尾）。
- `pnpm verify` **exit 0**（114 文件 / 2258 例；零 `src/**` 零 `test/**`）。
- `check:planning-numbers` **0 命中**（801 文件 + 1 规划载体）。
- `governance:check` exit 0（`check:governance-records` **141 / 331**——本记录与索引条目入库后真值；入库前为 140 / 330）。
- **未执行**：真实 `workflow_call` 贯通运行（需 M1-2 下游接入 + 推送触发），见 §4。

## 4. 边界与未覆盖

- **未做真实贯通运行**：reusable workflow 需被调用方 `uses:` 才运行；本批未推送、未接入下游。贯通验证归 **M1-2**（dependfix 侧调用 job）。
- **本 workflow 不带 `workflow_dispatch`**：人工贯通由**下游调用方**触发（M1-2）；在 caomei-ui 本体手动 dispatch 只会检出 caomei-ui 自身、对下游兼容检查无意义，故不声明该触发器。
- **触发形态说明**：B 形态仅提供检查逻辑；**「发布（tag）即刻自动触发」需跨仓 dispatch 凭据（A 形态）**，本阶段 D5 = **不取 A**，故触发方式由下游自行决定（手动 `workflow_dispatch` 或既有定时回归）——该口径差异在 M1-2 与 M4-1 同步 [发布指南 §10](../../guide/release.md) 时如实登记。
- **不改 [发布指南 §10](../../guide/release.md)**：下游清单口径与受检清单约定归 **M4-1**。
- **未覆盖下游结构差异**：仅按 dependfix 的 pnpm workspace（`apps/platform` + workspace 依赖构建）设计参数面，未实测其它下游。

## 5. 质量门

- [x] `pnpm verify` **exit 0**（114 文件 / 2258 例）
- [x] YAML 静态解析通过（`workflow_call` / inputs / steps）
- [x] `check:planning-numbers` 0 命中；`governance:check` exit 0
- [x] 零 `src/**` / 零 `test/**` 改动

## 6. Review Gate

- **结论**：R1 `standard` **Pass**（0 blocker / 2 warning / 3 suggest）。
- **轮次 / 范围**：第 1 轮，审本批 3 文件（新增 workflow + 新增记录 + 索引条目）。
- **findings 处置**：
  - **RG-W1（warning）**：记录 §3 自述 `check:governance-records 140 / 330` 为本记录入库前快照，与入库后真值 **141 / 331** 不符 → **已修**（改为 141 / 331 并标注入库前值）。
  - **RG-W2（warning）**：`todo.md` M1-1 交付描述含「另供 `workflow_dispatch` 人工贯通」，与实物（仅 `workflow_call`）不符 → **已修**：`todo.md` 该行改为「不带 `workflow_dispatch`；人工贯通由下游侧触发，归 M1-2」，本记录 §4 补登该取舍理由（caomei-ui 本体 dispatch 无意义）。
  - **RG-S1（suggest）**：§1 行数「约 110 行」实测 121 → **已修**为「约 120 行」。
  - **RG-S2（suggest）**：本仓无 actionlint、未做 Actions 表达式机检 → **记录**（M1-2 真实贯通运行为语义验证；是否引入 actionlint 属独立候选）。
  - **RG-S3（suggest）**：Actions 浮动 major tag 与全局「钉不可变版本」存在仓库级既存张力 → **记录**（本批与仓库既有约定一致，非本批引入；全仓统一属独立候选）。
- **审计核验**：`workflow_call` 语义 / `checkout` 取调用方仓库 / `jobs.<id>.outputs` 与 workflow 级 `outputs.value` 引用 / `if` 与 `working-directory` 语法 / `$CAOMEI_UI_VERSION` env 注入 / §10 对齐 / 触发形态表述如实性 / 空值跳过逻辑，均独立复核通过。
- **未覆盖边界**：未整链复跑 `pnpm verify`（采信调用方 exit 0，独立复跑文档 / 治理子集全绿）；未做真实贯通运行（与 §4 声明一致）；未做 Actions 表达式机检。
- **留痕**：`artifacts/review-gate/2026-10-10-phase21-m1-1.md`（本地态，git-ignored）。
