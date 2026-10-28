# Phase 26 S1：依赖安全告警清理（1.0 发布前）

> 日期：2026-10-28
> 触发：用户指令「Dependabot alerts 较多，发布前尽可能清理」；按[规划规范 §3.5](../../standards/planning.md) 的插队例外清单第 1 条（已确认的依赖 CVE / 供应链告警）直接登记，不占 Phase 26 原子条目计数。
> 范围：`package.json`（devDependencies 版本下限）、`pnpm-workspace.yaml`（`overrides` / `patchedDependencies` / `minimumReleaseAgeExclude`）、`pnpm-lock.yaml`、`THIRD-PARTY-LICENSES`、`patches/simple-git@4.0.2.patch`（删除）；零 `src/**` 零 `test/**`。
> 基线：`a0e82ba`（G1-F 文档提交）。
> 前置：[Phase 22 M2-2 开发作用域告警处置](./2026-10-10-phase22-m2-2-dev-alerts-remediation.md)、[simple-git 跨大版本升级与兼容补丁](./2026-10-10-phase22-m2-2-simple-git-override-upgrade.md)。

## 1. 盘点口径

- 快照命令：`gh api "repos/CaoMeiYouRen/caomei-ui/dependabot/alerts?state=open&per_page=100"`（2026-10-28 实测）。
- 口径：`state == open` 全部告警；本仓当前 **15 项全部为 `development` 作用域**（运行时作用域开告警 = 0）。
- 严重级分布：**high 4 / medium 7 / low 4**；按包：`undici` 3（high）、`fast-uri` 4（medium 2 + low 2）、`nuxt` 3（medium 2 + low 1）、`@nuxt/nitro-server` 1（medium）、`@vitest/mocker` 2（medium）、`serialize-javascript` 1（low）、`node-forge` 1（high）。
- 「修复版本」取 `security_vulnerability.first_patched_version`；`node-forge` 该字段为 `null`（advisory 未回填补丁标识），按受影响区间 `<= 1.4.0` 以实际版本判据处置。

## 2. 处置（15 项）

| # | 严重级 | 包 | 受影响区间 | 补丁版本 | 解析前 → 解析后 | 处置 |
|:-:|:---|:---|:---|:---|:---|:---|
| 1 | high | `undici` | `>= 8.0.0, < 8.12.2` | 8.12.2 | 8.10.2 → **8.12.3** | **已修复**（`undici@^8: ^8.12.3`） |
| 2 | high | `undici` | `>= 7.18.0, < 7.30.1` | 7.30.1 | 7.29.1 → **7.30.1** | **已修复**（`undici@^7: ^7.30.1`） |
| 3 | high | `undici` | `>= 6.23.0, < 6.29.1` | 6.29.1 | 6.28.1 → **6.29.1** | **已修复**（`undici@^6: ^6.29.1`） |
| 4 | low | `serialize-javascript` | `< 7.1.3` | 7.1.3 | 7.1.2 → **7.1.4** | **已修复**（`serialize-javascript: ^7.1.4` 收紧） |
| 5 | medium | `fast-uri` | `>= 3.0.0, < 3.1.9` | 3.1.9 | 3.1.7 → **3.1.9** | **已修复**（`fast-uri@^3: ^3.1.9`） |
| 6 | low | `fast-uri` | `>= 3.0.0, < 3.1.9` | 3.1.9 | 同上（重复实例） | **已修复** |
| 7 | medium | `fast-uri` | `>= 3.1.3, < 3.1.9` | 3.1.9 | 同上（重复实例） | **已修复** |
| 8 | low | `fast-uri` | `>= 3.0.0, < 3.1.9` | 3.1.9 | 同上（重复实例） | **已修复** |
| 9 | medium | `@nuxt/nitro-server` | `>= 4.2.0, < 4.6.2` | 4.6.2 | 4.5.2 → **4.6.3** | **已修复**（随 `nuxt` 升级） |
| 10 | medium | `nuxt` | `>= 4.0.0, < 4.6.2` | 4.6.2 | 4.5.2 → **4.6.3** | **已修复**（`nuxt: ^4.6.3` 等） |
| 11 | medium | `nuxt` | `>= 3.13.0, < 4.6.2` | 4.6.2 | 同上（重复实例） | **已修复** |
| 12 | low | `nuxt` | `< 4.6.0` | 4.6.0 | 同上（重复实例） | **已修复** |
| 13 | medium | `@vitest/mocker` | `>= 2.1.0-beta.7, < 4.1.12` | 4.1.12 | 4.1.11 → **4.1.12** | **已修复**（`vitest` / `@vitest/coverage-v8` → `^4.1.12`） |
| 14 | medium | `@vitest/mocker` | `>= 4.1.11, < 4.1.12` | 4.1.12 | 同上（重复实例） | **已修复** |
| 15 | high | `node-forge` | `<= 1.4.0` | advisory 未回填 | 1.4.0 → **1.4.2** | **已修复**（`node-forge: ^1.4.2`） |

构成对账：`undici` 3 + `fast-uri` 4 + `nuxt` 3 + `@nuxt/nitro-server` 1 + `@vitest/mocker` 2 + `serialize-javascript` 1 + `node-forge` 1 = **15**；全部转为已修复，**无受阻 / 无接受项**。

### 2.1 `node-forge` 的判据

- advisory GHSA-86w9-cpqp-85rv 的受影响区间为 `<= 1.4.0`，但 GitHub 面板的 `first_patched_version` 仍为 `null`（advisory 未随上游发版回填）。
- 上游 2026-10-27 发布 `1.4.1`（04:44Z）与 `1.4.2`（14:09Z）；本批取 **1.4.2**，已落在受影响区间之外。
- `< 1.4.0` 之外无其它 node-forge advisory 命中：`pnpm audit --registry=https://registry.npmjs.org` 对 `node-forge@1.4.2` 无输出。
- 因 1.4.2 发布于冷却期内，`pnpm` 自动写入 `minimumReleaseAgeExclude: node-forge@1.4.2`（安全修复豁免，与既有 `happy-dom@20.14.5` 条目同机制）；上游同步发布 1.4.1 后即可视为成熟，后续可在冷却期结束后移除该豁免。

### 2.2 `simple-git` 覆盖与补丁的退场

- `nuxt` 4.6.3 依赖 `@nuxt/devtools ^3.4.4`，而 devtools **3.4.4 起不再依赖 `simple-git`**（`npm view @nuxt/devtools@3.4.4 dependencies` 无该键）。
- 因此 Phase 22 遗留的 `simple-git: 4.0.2` 覆盖与 `patches/simple-git@4.0.2.patch`（恢复 v4 默认导出）已无消费方：保留会使 `pnpm install` 报 `ERR_PNPM_UNUSED_PATCH`。本批**删除覆盖、`patchedDependencies` 与补丁文件**，`pnpm why simple-git` 已无命中。
- 前置记录保持时点态不回改，仅在文首追加退场注记。

### 2.3 重解析后的树收敛（`pnpm dedupe`）

- 首次 `pnpm install` 后出现两处**新增重复副本**：`@nuxt/kit@4.5.2`（`@dxup/nuxt` 的 `^4.5.2` 复用旧解）与 `vue` / `vite` 双实例（根 3.5.43 / 8.3.4，nuxt 链 3.5.44 / 8.3.5）。均非本批告警区间，但会造成「单测跑 3.5.43、Nuxt 消费路径跑 3.5.44」的保真度偏差。
- 执行 `pnpm dedupe` 后收敛为单一 `@nuxt/kit@4.6.3` / `vue@3.5.44` / `vite@8.3.5`；同时在语义范围内上移 `@types/node` / `@vitejs/plugin-vue` / `postcss` 的补丁版本。`vite@6.4.5` 仍保留给 vitepress 的 `vite@^5 → ^6.4.4` 覆盖线（预期）。
- 收敛后 `THIRD-PARTY-LICENSES` 的 `vue` 条目同步为 `3.5.44`；质量门全量复跑（见 §4）。

## 3. 新发现但无补丁：`deepmerge`

- 本地 `pnpm audit --registry=https://registry.npmjs.org` 报 **low**：`deepmerge >= 4.2.0 <= 4.3.1` → 建议 `>= 4.3.2`（GHSA-gcqx-w48m-w2h4，`mergeObject()` 原型污染）。
- 传递链 `deepmerge` ← `@rollup/plugin-node-resolve@16.0.3` ← `nitropack@2.13.5` ← `@nuxt/nitro-server@4.6.3` ← `nuxt`；`@rollup/plugin-node-resolve` 最新版仍依赖 `deepmerge ^4.2.2`。
- **registry 尚无 4.3.2**（latest = 4.3.1），无法用覆盖修复，本批维持 4.3.1 并留痕。
- 该条在 2026-10-28 的 Dependabot 快照中尚未出现（advisory 新于扫描）。
- **再评估触发**：registry 发布 `deepmerge >= 4.3.2` 后，加 `deepmerge: ^4.3.2` 覆盖并复跑 `pnpm audit`。

## 4. 验证证据

| 检查 | 结果 |
| --- | --- |
| `pnpm verify` | **exit 0**（52 步；142 文件 / 2750 例；lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / **check:nuxt（最小 Nuxt 4 应用自动导入 / 样式注入 / 主题 / SSR 正常）** / docs:build / docs:check:i18n-routing / governance:check） |
| `pnpm test:e2e`（desktop） | **133 passed** |
| `pnpm test:a11y` | **67 passed** |
| `pnpm test:visual` | **33 passed** |
| `pnpm capture:styles` | **349 项 0 差异**（无 `src/**` 改动，计算样式未受影响） |
| `pnpm audit --registry=https://registry.npmjs.org` | 仅剩 `deepmerge` low（无补丁，见 §3）；high / critical / moderate = 0 |
| `node scripts/governance/check-licenses.mjs` | exit 0（`THIRD-PARTY-LICENSES` 的 `@nuxt/kit` 条目随 peer 安装版本更新为 4.6.3） |

- 解析后版本（`pnpm-lock.yaml` 实测）：`undici@6.29.1` / `7.30.1` / `8.12.3`、`serialize-javascript@7.1.4`、`fast-uri@3.1.9`、`node-forge@1.4.2`、`nuxt@4.6.3`、`@nuxt/nitro-server@4.6.3`、`vitest@4.1.12`、`@vitest/mocker@4.1.12`；去重后 `@nuxt/kit@4.6.3` / `vue@3.5.44` / `vite@8.3.5` 均为单实例。
- 旧版残留扫描（含 `@nuxt` 双包）：`grep -nE 'undici@(6\.28|7\.29|8\.10)|fast-uri@3\.1\.7|serialize-javascript@7\.1\.2|node-forge@1\.4\.0|@vitest/mocker@4\.1\.11|nuxt@4\.5\.2|@nuxt/(kit|schema)@4\.5' pnpm-lock.yaml` → **0 命中**。
- lockfile diff 规模较大（≈2.5k 行）源于 `nuxt` 4.5.2 → 4.6.3 的整棵工具链上移（`@nuxt/cli` 4 / `@nuxt/devtools` 3.4.x / verkit 等），属预期；运行时产物无变化（`capture:styles` 0 差异，`check:build` 通过）。

## 5. 告警收敛口径

- Dependabot 的 `state` 只在**推送 + GitHub 扫描**后收敛；本批未推送，面板上 15 项在推送前仍显示 open。
- 本地判据 = **lockfile 解析版本已离开受影响区间**（§4 残留扫描 0 命中 + 解析后版本表）。
- 推送并扫描后应复核：15 项全部 `fixed`；若 `node-forge` 因 advisory 未回填补丁标识仍显示 open，按「版本已离开 `<= 1.4.0` 区间」提交 dismissal（`reason: fix_started` 或 `not_used` 视面板选项）并留痕。

> **推送后复核（2026-10-29）**：本批随仓库推送后 Dependabot 复算完成，15 项告警全部关闭；当前 open = **1**（`deepmerge` low，S1 §3 已登记无补丁与再评估触发）。按[安全规范 §2.1](../../standards/security.md#_2-1-发布前安全告警门禁)，该 low 不阻塞发布。

## 6. 未覆盖边界

- **Code Scanning 仍有 5 项 open**（不在本条范围，已由 [S2 记录](./2026-10-28-phase26-s2-code-scanning-remediation.md) 承接）：`scripts/docs/check-example-refs.mjs` 的大写标签匹配、`scripts/docs/check-i18n-routing.mjs` 的不完整多字符清理，以及 `.github/workflows/test.yml` 两个 job 缺 `permissions` 块。均为仓库内脚本 / CI 配置，需独立批次处置。
- `deepmerge` low（见 §3）无补丁可用，未清零。
- 传递依赖含工具链内部大版本跃迁（如 `cssnano` 8 → 9、`@colordx/core` 5 → 7、`diff` 8 → 9、`postcss-calc` 10 → 11），均由 `nuxt` 4.6.3 工具链带入，已由 `pnpm verify` / `check:nuxt` 覆盖。
- 后续候选（未登记 Backlog，待评估）：把「受控包在 lockfile 中单实例 / 不进旧区间」做成 `scripts/governance` 的轻量机检，替代 §4 的手工 grep。
- Firefox / WebKit 未验（本批零运行时改动，不涉及）。
- 未推送，故未取得 GitHub 侧修复确认。

## 7. Review Gate

- **审计协议**：分区 A（依赖解析面）`deep` ≤ 20 分钟；分区 B（治理与规划载体）`standard` ≤ 10 分钟；并发执行，总时间盒取最大值 **20 分钟**。
- **R1（2026-10-28）**：A **Pass**（2 warning）、B **Pass**（2 warning / 3 suggest）→ 汇总 **Pass**。
  - A-W1：`@nuxt/kit@4.5.2` 残留副本（非告警区间，但记录 §4 的残留扫描模式覆盖不到）；A-W2：`vue` / `vite` 新增双实例，单测与 Nuxt 路径版本不一致。
  - B-W1：索引摘要复述读数且未带「解析层 / 未推送」限定；B-W2：门禁记录 §5 发布序列未纳入 S1。
  - suggest：G2 行需声明「S1 自检不作放行证据」；记录需枚举工具链内部跃迁；`.session` 的 node-forge 旧决策需追加作废注记。
- **修复（R1 → R2）**：A-W1 / A-W2 → `pnpm dedupe` 收敛单实例，`THIRD-PARTY-LICENSES` 同步 `vue@3.5.44`，残留扫描扩至 `@nuxt/(kit|schema)@4.5`，§2.3 记录成因；B-W1 → 索引摘要压缩为「结论 + 链接」并补解析层 / 推送后收敛限定；B-W2 → §5 序列补 S1；suggest 全部采纳（G2 行注记、§6 工具链跃迁、`.session` 决策注记）。修复后 `pnpm verify`（2750 例）/ desktop E2E 133 / a11y 67 / visual 33 / `capture:styles` 0 差异全量复跑通过。
- **R2（`deep` delta，≤ 20 分钟）：Pass**（0 blocker / 2 warning / 1 suggest）。A-W1 / A-W2 与 B-W1 ~ B-S3 共 8 个修复点全部关闭：`@nuxt/kit@4.6.3` / `vue@3.5.44` / `vite@8.3.5` 单实例，`pnpm install --frozen-lockfile` 与 `pnpm audit` 复核无回归，`typecheck` 对去重后的类型面通过。剩余 warning 为记录回填与索引措辞（已同批处理）；suggest「去重不变量机检」留作后续候选（见 §6）。
