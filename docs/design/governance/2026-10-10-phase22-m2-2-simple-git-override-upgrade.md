# Phase 22 M2-2（后续）：`simple-git` 跨大版本升级与兼容补丁

> 阶段：Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口）M2-2 后续
> 日期：2026-10-10
> 范围：`pnpm-workspace.yaml`（`overrides` + `patchedDependencies`）+ `patches/simple-git@4.0.2.patch` + `pnpm-lock.yaml`；零 `src/**` 零 `test/**`
> 依据：范围与验收见 [待办事项 §Phase 22](../../plan/todo.md) M2-2；[规划规范](../../standards/planning.md) / [安全规范](../../standards/security.md)
> 基线：`86caf15`（Phase 22 M6-1 提交）；前置记录：[2026-10-10-phase22-m2-2-dev-alerts-remediation.md](./2026-10-10-phase22-m2-2-dev-alerts-remediation.md)

## 1. 背景与触发

前置 M2-2 记录（同目录 `2026-10-10-phase22-m2-2-dev-alerts-remediation.md`）把 `simple-git` 3.x 系列的 4 项告警判为**受阻**：受影响区间覆盖整个 3.x 线（3.x 最新即 3.36.0），唯一修复路径是 `simple-git` 4.x；但 4.x **移除默认导出**，`@nuxt/devtools@3.4.2` 的 `import Git from 'simple-git'` 会报 `does not provide an export named 'default'`，导致 `check:nuxt` 的 `nuxt generate` 失败。该记录给出的再评估触发为「`nuxt` / `@nuxt/devtools` 依赖 `simple-git@^4` 后，**或安全面板要求强制处置时**」。

本轮用户指令「使用 `dependfix-remediator` 修复可以更新的依赖的版本问题；升级后如引入问题则修复」，满足**「安全面板要求强制处置」**触发；用户就「强制升级 + 兼容补丁（恢复默认导出）/ 维持受阻」二选一，明确裁定取**强制升级 + 兼容补丁**。故本轮为对前置记录 §3 的**再评估落地**，前置记录保持点时态不回改。

## 2. 处置（4 项告警）

| # | 严重级 | 包 | 受影响区间 | 补丁版本 | 传递链（`pnpm why`） | 处置 |
|:-:|:---|:---|:---|:---|:---|:---|
| 1 | critical | `simple-git` | `>= 3.15.0, < 4.0.1` | 4.0.1 | `@nuxt/devtools` ← `nuxt` | **已修复**（锁定 `4.0.2`） |
| 2 | high | `simple-git` | `<= 3.36.0` | 4.0.0 | 同上 | **已修复** |
| 3 | high | `simple-git` | `<= 3.36.0` | 4.0.0 | 同上（重复告警实例） | **已修复** |
| 4 | critical | `@simple-git/argv-parser` | `< 2.0.1` | 2.0.1 | `simple-git@4.0.2` ← `@nuxt/devtools` | **已修复**（`simple-git@4.0.2` 精确依赖 `2.0.1`，连带修复） |

**结果**：M2-2 原「已修复 10 / 受阻 4 / 无修复版本 1」→ **已修复 14 / 无修复版本 1**（`node-forge`，registry 最新 1.4.0 仍受影响，无补丁，维持残留风险留痕）。

## 3. 兼容补丁

- **做法**：`simple-git` 由 `3.36.0` 升到 **精确 `4.0.2`**；在 `pnpm-workspace.yaml` 的 `overrides` 固定 `simple-git: 4.0.2`（精确锁定使 `patchedDependencies` 恒可命中），并登记 `patchedDependencies: simple-git@4.0.2: patches/simple-git@4.0.2.patch`。
- **补丁面**：仅 `dist/index.mjs` 末尾追加一行 `export default wo;`（`wo` = 该产物的 `simpleGit` 工厂），恢复 v3 同构的默认导出；**不改** CJS 产物——唯一消费方 `@nuxt/devtools` 为 ESM（走 `exports["."].import` → `index.mjs`），CJS 补丁非必需，按最小改动原则省略（补丁因此由 43 KB 收敛为 397 B）。
- **API 兼容性**：`@nuxt/devtools` 仅经默认导出调用 `Git(rootDir)` 后使用 `.branch()` / `.revparse()` / `.status()`，三者签名在 3.x / 4.x 一致（4.x 的 `simpleGit` 支持 `(baseDir: string)` 重载）。
- **维护边界**：补丁与 `simple-git@4.0.2` 精确绑定；`4.0.3+` 出现时须复核（必要时同步补丁或移除——上游若恢复默认导出则补丁可删）。上游出处：simple-git v4 迁移说明（`https://github.com/steveukx/git-js/blob/main/docs/RELEASE-NOTES-V4.md`，4.x 声明不再发布默认入口，须具名导入 `simpleGit`）。

## 4. 交付物

- `pnpm-workspace.yaml`：`overrides` 新增 `simple-git: 4.0.2`（并更新 M2-2 注释）；新增 `patchedDependencies`。
- `patches/simple-git@4.0.2.patch`（397 B，仅 `dist/index.mjs`）。
- `pnpm-lock.yaml`：`simple-git@3.36.0 → 4.0.2_patch_hash=…`、`@simple-git/argv-parser@1.1.1 → 2.0.1`，并移除 3.x 残留。

## 5. 证据（可复现）

- **解析版本**：`pnpm why simple-git` → `simple-git@4.0.2`（仅 1 版）；`pnpm why @simple-git/argv-parser` → `2.0.1`。
- **默认导出恢复**：对补丁后产物 `import('file://<…>/simple-git/dist/index.mjs')` → `default` 为 `function`，且 `default(cwd).branch/status/revparse` 均为 `function`。
- **旧版清零**：`grep -nE 'simple-git@3\.' pnpm-lock.yaml` → 0 命中。
- **集成**：`pnpm build` 通过；`pnpm check:nuxt` 通过（`nuxt generate` 加载 `@nuxt/devtools`，即前置记录复现失败的路径）。

## 6. 质量门

- `pnpm verify` **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿）。
- 零 `src/**` 零 `test/**` 改动（V 阶段显式跳过：无可见 UI 影响）。

## 7. Review Gate

- `audit-depth`：`deep`（依赖版本变更 + 安全修复 + 治理文档；单分区）；时间盒：≤ 20 分钟。**实测用时约 7 分 46 秒 ≤ 时间盒**。
- **R1 `deep`**：**`Pass`**（0 blocker / 0 warning / 2 suggest）。
  - 独立复跑证据：`check:governance-records` OK（152 记录 / 342 md 双向对账）、`pnpm check:planning-numbers` 0 命中、`pnpm governance:check` exit 0、`pnpm lint:md:check` exit 0、`pnpm install --frozen-lockfile --offline` 一致（补丁可复现）；补丁产物 `default` 为 `function` 且 `branch/status/revparse` 可用；`@nuxt/devtools/dist/chunks/module-main.mjs:16` 确为 `import Git from 'simple-git'` 且软链指向同 `patch_hash`；OSV 交叉核对 4 条告警修复版本与 §2 逐条一致。
  - 未覆盖边界：未独立复跑全链 `pnpm verify`（采信调用方 exit 0 + 关键机制独立复证）；未密码学重算 `patch_hash`；真实 Dependabot 告警关闭待推送后复算。
  - **同批收口**（2 suggest）：SG-S01 → 前置记录顶部补前向指针（正文不回改）；SG-S02 → §3 补上游 v4 迁移说明出处与移除触发。均为「已修复未复审」。
