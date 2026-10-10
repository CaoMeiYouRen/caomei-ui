# Phase 22 M2-3：依赖大版本升级逐项评估与达标升级

> 阶段：Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口）M2-3
> 日期：2026-10-10
> 范围：`package.json`（依赖版本）/ `pnpm-lock.yaml` / `tsconfig.json`（TS 6 迁移）/ `THIRD-PARTY-LICENSES`（许可声明同步）；零 `src/**` 零 `test/**` 业务改动
> 依据：范围与验收见 [待办事项 §Phase 22](../../plan/todo.md) M2-3；[开发规范](../../standards/development.md) / [规划规范 §5](../../standards/planning.md)
> 基线：`50caea7`（M2-2 修复提交）

## 1. 背景与口径

Phase 22 M2-3 处置 Dependabot **7 个 open PR**（版本升级），按 [规划规范](../../standards/planning.md) D4「**逐项评估、达标即升**」执行：逐项实测（`pnpm install` + `pnpm verify`），**达标者升级、不达标者回退并留痕**。

> **口径订正（实测 2026-10-10）**：登记时的「7 个 PR」含 **2 个陈旧 PR**——其标题基于旧基线（`vite 5.4.21` / `vitest 3.2.7`），而本仓 `package.json` **实际已是** `vite ^8.2.2`（解析 **8.3.1**）/ `vitest ^4.1.11`（解析 **4.1.11**），故 D4 中「`vite 5→8` 单独评估延后」的前提不成立（本仓早已在 8.x），本轮按「已达标」处置。

## 2. 逐项评估（7 个 PR）

| PR | 候选 | 本仓现值 | 目标 | 结论 | 依据 / 实测 |
|:--|:--|:--|:--|:--|:--|
| #16 | `vue` | `^3.5.42`（3.5.42） | 3.5.43 | **达标（已升）** | patch；`pnpm verify` exit 0 |
| #14 | `@lucide/vue` | `^1.45.0`（1.45.0） | `^1.48.0` | **达标（已升，解析 1.54.0）** | caret 上限拉到最新；`THIRD-PARTY-LICENSES` 同步 `## @lucide/vue@1.54.0`（ISC 全文未变）；`pnpm verify` exit 0 |
| #6 | `typescript` | `^5.9.3`（5.9.3） | 6.0.3 | **达标（已升，含 tsconfig 迁移）** | 需迁移弃用项：`moduleResolution: Node → Bundler`、删 `baseUrl`、`paths` 相对化（`./src/*`）；`typecheck` / `typecheck:docs` / `pnpm verify` 均 exit 0 |
| #12 | `reka-ui` | `2.10.4`（精确锁） | 2.10.5 | **延后（不达标）** | 2.10.5 致 `input-number.test.ts` **4 例 `step` 行为回归**（`expected undefined to deeply equal [ 1.1 ]` 等，emit 未触发）；回退 2.10.4 后 49/49 通过 |
| #17 | `conventional-changelog` | `7.2.0`（精确） | 8.1.3 | **延后（不达标）** | v8.1.3 拉入 `conventional-changelog-writer@9.3.0`，`pnpm changelog` 报 `TypeError: headerPartial is not a function`；preset `conventional-changelog-cmyr-config@3.0.0`（最新）仅支持 writer `^8.4.0`（`semantic-release-cmyr-config@1.0.2` 依赖），无兼容版本 |
| #2 | `vite` | `^8.2.2`（8.3.1） | 8.3.0 | **陈旧 PR / 已达标** | 本仓已在 8.x（解析 8.3.1）；PR 基于旧基线（5.4.21）。本轮将 range 上移至 `^8.3.1` 对齐 |
| #1 | `vitest` | `^4.1.11`（4.1.11） | 4.1.11 | **陈旧 PR / 已达标** | 本仓已为 4.1.11；PR 基于旧基线（3.2.7） |

**结论分布**：**达标即升 3**（`vue` / `@lucide/vue` / `typescript`）+ **陈旧 PR / 已达标 2**（`vite` / `vitest`）+ **延后 2**（`reka-ui` / `conventional-changelog`）；3 + 2 + 2 = 7。

## 3. 延后项的结论与触发条件

- **`reka-ui` 2.10.5（延后）**：2.10.5 的补丁变更使 `CaomeiInputNumber` 的步进模型 emit 缺失（4 例契约测试失败：步进 / 钳制 / `step` 非正回退 / 不被吸附到 `step` 整数倍）。**维持 2.10.4**（既有 Alpha primitive 锁）。
  - **再评估触发**：本仓适配 2.10.5 的行为变更（或上游确认属其回归并修复），随该适配批次一并升级。
- **`conventional-changelog` 8（延后）**：v8 与 preset 的 writer 9 模板 API 不兼容（`headerPartial is not a function`），本仓 `pnpm changelog` 依赖该 preset。
  - **再评估触发**：`conventional-changelog-cmyr-config` 发布支持 `conventional-changelog-writer@9` 的版本后，随该版本一并升级 `conventional-changelog` + preset。

## 4. 交付物

- `package.json`：`vue ^3.5.42 → ^3.5.43`、`@lucide/vue ^1.45.0 → ^1.48.0`、`vite ^8.2.2 → ^8.3.1`、`typescript ^5.9.3 → ^6.0.3`（`reka-ui` / `conventional-changelog` 维持）。
- `pnpm-lock.yaml`：相应解析变更（含 TS 6 及其工具链子依赖树）；**另含 2 处范围内补丁降级**——`hosted-git-info 8.1.0 → 8.0.0`、`normalize-package-data 7.0.1 → 7.0.0`（`conventional-changelog@7.2.0` 的传递依赖）。经复算：为干净 `pnpm install` 的解析结果（非手改），两版本 OSV 均无告警、无安全影响。
- `tsconfig.json`：`moduleResolution: Node → Bundler`、删除 `baseUrl`、`paths` 由 `src/*` 改为 `./src/*`（TS 6 迁移；`tsconfig.node.json` / `docs/tsconfig.json` 本已是 Bundler，无需改）。
- `THIRD-PARTY-LICENSES`：`## @lucide/vue@1.45.0 → @1.54.0`、`## vue@3.5.42 → @3.5.43`（许可标识与全文未变，仅版本标题）。

## 5. 证据（可复现）

- **真实版本核对（受关注直接依赖的筛选摘要）**：`grep -oE '^\s+(vite|vitest|typescript|conventional-changelog|vue|reka-ui)@[0-9][0-9.()a-z-]*' pnpm-lock.yaml | sort -u` → `vite@8.3.1` / `vitest@4.1.11` / `typescript@6.0.3` / `conventional-changelog@7.2.0` / `vue@3.5.43` / `reka-ui@2.10.4`（命令实际还含 override 驱动的 `vite@6.4.3` 与带后缀变体，此处为结果筛选摘要）。
- **3 项达标**：`pnpm verify` **exit 0**（115 文件 / 2274 例）。
- **`reka-ui` 不达标复现**：`pnpm exec vitest run src/components/input-number/input-number.test.ts` → 2.10.5 时 `4 failed | 45 passed`；回退 2.10.4 后 `49 passed`。
- **`conventional-changelog` 不达标复现**：`pnpm changelog` → `TypeError: headerPartial is not a function`（`conventional-changelog-writer@9.3.0` 模板）；`CHANGELOG.md` 未被改写（`git diff` 空）。

## 6. 质量门

- `pnpm verify` **exit 0**（115 文件 / 2274 例；含 lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / governance:check）。
- `check:licenses` 通过（第三方许可声明覆盖全部运行时依赖）。
- 零 `src/**` 零 `test/**` 业务改动（`tsconfig.json` 属构建 / 类型配置）；V 阶段显式跳过（无可见 UI 影响）。

## 7. Review Gate

- audit-depth：`deep`（依赖版本变更 + 构建 / 类型配置迁移）。时间盒：≤ 20 分钟。
- **R1 `deep`**：**`Pass`**（0 blocker / 1 warning〔RG-W01 未披露的 2 处范围内补丁降级：`hosted-git-info 8.1.0 → 8.0.0` / `normalize-package-data 7.0.1 → 7.0.0`〕/ 3 suggest〔RG-S01 `@lucide/vue@1.45.0` 冷却豁免已失效 / RG-S02 版本核对命令口径 / RG-S03 `docs/tsconfig.json` 冗余 `moduleResolution`〕）。
- **收口**：RG-W01 → §4 逐项列明 2 处降级（经复算为干净 `pnpm install` 结果、OSV 无告警、非手改）；RG-S01 → 移除 `pnpm-workspace.yaml` 中失效的 `@lucide/vue@1.45.0` 冷却豁免；RG-S02 → §5 标注命令为筛选摘要；RG-S03 → 维持（纯清理，冗余无害）。
- 审计工件 `artifacts/review-gate/2026-10-10-phase22-m2-3-major-upgrades.md`。
