# Phase 22 M2-2：开发作用域安全告警盘点与处置

> 阶段：Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口）M2-2
> 日期：2026-10-10
> 范围：`pnpm-workspace.yaml` 的 `overrides`（传递依赖安全覆盖）+ `pnpm-lock.yaml`；零 `src/**` 零 `test/**`
> 依据：范围与验收见 [待办事项 §Phase 22](../../plan/todo.md) M2-2；[规划规范](../../standards/planning.md) / [安全规范](../../standards/security.md)
> 基线：`6e80f9a`（M2-1 修复提交）

## 1. 背景与口径

Phase 22 M2-2 处置 Dependabot **开发作用域**告警（M2-1 已独立处置运行时作用域 `source-map-js`）。盘点口径为 **2026-10-10 实测快照**（`gh api repos/CaoMeiYouRen/caomei-ui/dependabot/alerts --paginate`，取 `state == open` 且 `dependency.scope == development`）；「修复版本」取 `security_vulnerability.first_patched_version`；处置方式为 `pnpm-workspace.yaml` 的 `overrides`（本仓 pnpm 11：`package.json` 的 `pnpm` 字段不再被读取，见 M2-1 记录）。

> **告警状态口径**：Dependabot 告警的 `state` 只在**推送 + GitHub 扫描**后收敛；本记录以 **lockfile 解析版本** 为本地修复判据，告警面板关闭待推送后由 Dependabot 复算。

## 2. 盘点与处置（15 项开发作用域告警）

> 同一包的多个告警按实例逐行列出（severity 取该实例值）。「处置」列区分 **已修复 / 受阻 / 无修复版本**。

| # | 严重级 | 作用域 | 包 | 受影响区间 | 补丁版本 | 传递链（`pnpm why`） | 处置 |
|:-:|:---|:---|:---|:---|:---|:---|:---|
| 1 | critical | development | `handlebars` | `>= 4.0.0, <= 4.7.9` | 4.7.10 | `conventional-changelog-writer` ← `semantic-release` | **已修复**（`^4.7.10` → 4.7.10） |
| 2 | critical | development | `handlebars` | `>= 4.0.0, <= 4.7.9` | 4.7.10 | 同上（重复告警实例） | **已修复** |
| 3 | medium | development | `handlebars` | `>= 4.0.0, <= 4.7.9` | 4.7.10 | 同上（重复告警实例） | **已修复** |
| 4 | critical | development | `shell-quote` | `>= 1.8.4, < 1.11.0` | 1.11.0 | `launch-editor` ← `@nuxt/devtools` ← `nuxt` | **已修复**（`^1.12.0` → 1.12.0） |
| 5 | critical | development | `simple-git` | `>= 3.15.0, < 4.0.1` | 4.0.1 | `@nuxt/devtools` ← `nuxt` | **受阻**（见 §3） |
| 6 | high | development | `simple-git` | `<= 3.36.0` | 4.0.0 | 同上 | **受阻** |
| 7 | high | development | `simple-git` | `<= 3.36.0` | 4.0.0 | 同上（重复告警实例） | **受阻** |
| 8 | critical | development | `@simple-git/argv-parser` | `< 2.0.1` | 2.0.1 | `simple-git@3.36.0` ← `@nuxt/devtools` | **受阻**（随 `simple-git` 连带） |
| 9 | high | development | `devalue` | `>= 5.1.0, <= 5.9.2` | 5.9.3 | `@nuxt/nitro-server` ← `nuxt` | **已修复**（`^5.9.3` → 5.9.4） |
| 10 | medium | development | `devalue` | `<= 5.9.2` | 5.9.3 | 同上（重复告警实例） | **已修复** |
| 11 | medium | development | `devalue` | `<= 5.9.2` | 5.9.3 | 同上（重复告警实例） | **已修复** |
| 12 | low | development | `devalue` | `>= 1.0.0, <= 5.9.2` | 5.9.3 | 同上（重复告警实例） | **已修复** |
| 13 | low | development | `serialize-javascript` | `>= 7.1.1, < 7.1.2` | 7.1.2 | `@rollup/plugin-terser` ← `nitropack` ← `@nuxt/nitro-server` ← `nuxt` | **已修复**（`^7.1.2` → 7.1.2） |
| 14 | medium | development | `brace-expansion` | `>= 2.0.0, < 2.1.7` | 2.1.7 | `minimatch@3` ← `eslint` 等 | **已修复**（`brace-expansion@^2` 由 `^2.0.3` 收紧为 `^2.1.7` → 2.1.7） |
| 15 | high | development | `node-forge` | `<= 1.4.0` | **无** | `listhen` ← `@nuxt/cli` ← `nuxt` | **无修复版本**（见 §3） |

**构成对账（按键集合枚举）**：15 = `handlebars` 3（critical ×2 + medium ×1）+ `simple-git` 3（critical ×1 + high ×2）+ `devalue` 4（high ×1 + medium ×2 + low ×1）+ `shell-quote` 1（critical）+ `@simple-git/argv-parser` 1（critical）+ `node-forge` 1（high）+ `serialize-javascript` 1（low）+ `brace-expansion` 1（medium）。**处置分布**：**已修复 10**（`handlebars` 3 + `devalue` 4 + `shell-quote` 1 + `serialize-javascript` 1 + `brace-expansion` 1）+ **受阻 4**（`simple-git` 3 + `@simple-git/argv-parser` 1）+ **无修复版本 1**（`node-forge`）；10 + 4 + 1 = 15。

## 3. 未修复项的结论与触发条件

- **`simple-git`（critical ×1 + high ×2）与 `@simple-git/argv-parser`（critical ×1）——受阻（本轮不覆盖）**。
  - 受影响区间覆盖整个 3.x 线（`<= 3.36.0`，3.x 最新即 3.36.0），**唯一修复路径是 `simple-git` 4.x**（4.0.1 起修复，且 4.0.2 精确依赖 `@simple-git/argv-parser@2.0.1`，可连带修复第 8 项）。
  - **实测阻断**：把 `simple-git` 覆盖到 `^4.0.2` 后，`@nuxt/devtools@3.4.2` 的 `import Git from 'simple-git'` 会因 4.x **不再提供默认导出**而报 `The requested module 'simple-git' does not provide an export named 'default'`，导致 `check:nuxt` 的 `nuxt generate` 失败（`pnpm verify` exit 1，实测）。当前 `@nuxt/devtools` 声明依赖 `simple-git` 3.x，**上游未适配 4.x**。
  - **结论**：**不加破坏性覆盖**，维持 `simple-git@3.36.0` + `@simple-git/argv-parser@1.1.1`，作为**残留风险留痕**。
  - **再评估触发**：`nuxt` / `@nuxt/devtools` 依赖 `simple-git@^4` 后，或安全面板要求强制处置时，随 `nuxt` 升级一并对齐。风险面为**开发工具链**（devtools / git 交互），不进生产产物。
- **`node-forge`（high）——无修复版本**。
  - `first_patched_version = none`（registry 最新 = 1.4.0，仍受影响）；传递链 `listhen` ← `@nuxt/cli` ← `nuxt`，属**开发期**本地服务依赖。
  - **结论**：暂无补丁可覆盖，作为**残留风险留痕**。
  - **再评估触发**：上游发布补丁版本后随覆盖一并处置。

## 4. 交付物

- `pnpm-workspace.yaml` 的 `overrides` 新增 / 调整：`handlebars: ^4.7.10`、`shell-quote: ^1.12.0`、`devalue: ^5.9.3`、`serialize-javascript: ^7.1.2`；`brace-expansion@^2` 由 `^2.0.3` 收紧为 `^2.1.7`。
- `pnpm-lock.yaml` 相应解析变更；**实际变更面为 6 个包**（上述 5 个目标包 + `@simple-git/args-pathspec@1.0.3 → 1.0.4`——`simple-git@3.36.0` 的子依赖，`^1.0.3` 内 patch 上移、非告警包、安全）。

## 5. 证据（可复现）

- **告警盘点**：`gh api repos/CaoMeiYouRen/caomei-ui/dependabot/alerts --paginate --jq '[.[]|select(.state=="open" and .dependency.scope=="development")]|group_by(.dependency.package.name)|map({pkg:.[0].dependency.package.name,n:length})'` → 15 项（见 §2）。
- **传递链**：`pnpm why handlebars` / `pnpm why simple-git` / `pnpm why shell-quote` / `pnpm why devalue` / `pnpm why serialize-javascript` / `pnpm why brace-expansion` / `pnpm why node-forge`。
- **修复后解析（lockfile 实测）**：`handlebars@4.7.10` / `shell-quote@1.12.0` / `devalue@5.9.4` / `serialize-javascript@7.1.2` / `brace-expansion@2.1.7`；`simple-git@3.36.0` / `@simple-git/argv-parser@1.1.1` / `node-forge@1.4.0` 为残留。
- **已修复包清零扫描**：`grep -nE 'handlebars@4\.7\.9|shell-quote@1\.(8|9|10)\.|devalue@5\.9\.[0-2]|serialize-javascript@7\.1\.1|brace-expansion@2\.(0|1\.[0-6])' pnpm-lock.yaml` → **0 命中**（5 个已修复包无旧版残留）。
- **残留对照扫描**（与 §3 声明的故意残留一致，非缺陷）：`grep -c 'simple-git@3\.' pnpm-lock.yaml` → **2**（`simple-git@3.36.0` 两处，即 §3 的受阻残留）；`grep -oE 'argv-parser@[0-9.]+' pnpm-lock.yaml | sort -u` → `argv-parser@1.1.1`；`grep -oE 'node-forge@[0-9.]+' pnpm-lock.yaml | sort -u` → `node-forge@1.4.0`。

## 6. 质量门

- `pnpm verify` **exit 0**（115 文件 / 2274 例；lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / governance:check 全绿）。
- `lint:md:check` exit 0；`docs:check:links` OK；`governance:check` exit 0。
- 零 `src/**` 零 `test/**` 改动（V 阶段显式跳过：无可见 UI 影响）。

## 7. Review Gate

- audit-depth：`deep`（依赖版本变更）。时间盒：≤ 20 分钟。
- **R1 `deep`**：`Reject`（1 blocker〔RG-B01 记录 §5 残留扫描证据自相矛盾〕+ 2 warning〔RG-W01 lockfile 变更面未声明 / RG-W02 `todo.md` severity 计数与实测不符〕+ 1 suggest〔RG-S01 `shell-quote` 覆盖范围〕）。
- **修复**：RG-B01 → §5 拆为「已修复包清零扫描 → 0 命中」+「残留对照扫描 → 2（§3 故意残留）」；RG-W01 → §4 增列「实际变更面 6 包（含 `@simple-git/args-pathspec` patch 上移）」；RG-W02 → `todo.md` severity 计数订正为 **critical 5 / high 4 / medium 4 / low 2**，并同步第六轮范围评估记录 §3.9 N1 与治理索引摘要（RG-W03）；RG-S01 → `shell-quote: ^1.12.0` 维持。
- **R2 `deep`（delta）**：**`Pass`**（RG-B01 / RG-W01 关闭；RG-W03〔索引摘要未回扫的同类计数〕已同批收口）。审计工件 `artifacts/review-gate/2026-10-10-phase22-m2-2-dev-alerts.md`。
