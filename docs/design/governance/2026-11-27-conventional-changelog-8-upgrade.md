# conventional-changelog 8 升级（依赖治理）

> 创建时间：2026-11-27
> 触发：12:00 巡检的 major 依赖评估（用户指令「开始执行第 1 项」）。
> 性质：**依赖升级交付记录**，不构成阶段登记；本轮不发布、不改公共 API、不改运行时依赖。

## 1. 触发与授权

- 原 Backlog 候选（`conventional-changelog` 8 升级）的触发条件为「preset 发布 > 3.0.0 且其模板 API 兼容 writer 9」。
- 触发命中：`conventional-changelog-cmyr-config` 已发布 3.1.x，且其 devDependencies 同时别名安装 `conventional-changelog-writer@8` 与 `@9`，即为双版本兼容；实测 CC8 + preset 3.1.2 输出与现状一致（见 §3）。
- 授权：用户 2026-11-27 会话指令「开始执行第 1 项」（对应 12:00 巡检报告 §5 建议处置顺序第 1 条）。
- 载体收口：该候选行已从 [Backlog §1.6](../../plan/backlog.md) 移除（已交付不留在候选池）；`!?` 补丁撤回候选的触发条件未命中，保留。

## 2. 变更

| 包 | 前 | 后 | 说明 |
|:---|:---|:---|:---|
| `conventional-changelog` | `7.2.1` | `8.1.3` | 保持精确钉定；仅 `scripts/release/generate-changelog.mjs` 使用其程序化 API，未使用 CLI |
| `conventional-changelog-cmyr-config` | `3.0.0` | `3.1.2` | 保持精确钉定；3.1.0 起同时兼容 writer 8 / 9 |

生成物：`pnpm-lock.yaml` 随 `pnpm install` 更新（新增 7 个包、移除 8 个包，全部落在 CC7→8 闭包内；`dependencies` 面零变化）。附带影响：`@commitlint/cli@21.2.4` 的解析键由 `conventional-commits-parser@6.4.0` 变为 `conventional-commits-filter@6.0.1` + `conventional-commits-parser@7.1.4`（满足 `@conventional-changelog/git-client` 的 peer），`.husky/commit-msg` 走 `commitlint --edit` 不经该解析路径，行为不受影响。

未触碰：`package.json` 的 `version`、`release.config.js`、`.github/workflows/*`、`AGENTS.md`、`.env*`。

## 3. 兼容性矩阵（实测）

| preset | writer 8（发布链 `release-notes-generator`） | writer 9（`pnpm changelog`） |
|:---|:---|:---|
| 3.0.0 | 通过（基线） | **失败**：`TypeError: headerPartial is not a function` |
| 3.1.2 | 通过，与基线逐字一致 | 通过，与基线逐字一致 |

结论：升级必须成对——只升 `conventional-changelog` 会在 `pnpm changelog` 运行期失败；只升 preset 不影响 writer 8 路径。

`handlebars` 覆盖（`pnpm-workspace.yaml` 的 `handlebars: ^4.7.10`，Phase 22 M2-2 安全告警处置）**保留**：preset 3.1.2 仍直接依赖 `handlebars@4.7.10` 生成 writer 8 所需的字符串模板，仅 writer 9 路径改用 render 函数。

## 4. 验证

- `pnpm install`：lockfile 与声明一致，无 peer 冲突。
- `pnpm vitest run scripts/release/`：通过（13 文件 / 259 例）。
- 实际生成比对：升级后用 `generateChangelog({ version: '9.9.9-test' })` 与升级前同参数输出 `diff` 比较，差异 0 行（长度 43087）。
- `pnpm lint:check`、`pnpm typecheck`、`pnpm check:licenses`：全部通过。
- `pnpm lint:md:check`、`pnpm governance:check`：文档与治理门禁通过。
- 跳过项：`pnpm verify` 全量、E2E / 视觉（无 UI 与运行时影响）；未执行发布（发布由用户另行授权）。

## 5. Review Gate

- R1（deep，20 分钟盒）：**Reject**（2 blocker）。代码与依赖事实正确、门禁全绿，但两处活载体仍以现在时描述「本仓维持 7.2.1 / CC8 会抛错」，与本 diff 矛盾：`docs/guide/release.md` §3.6、「Backlog §1.6」候选行。
- 处置：同步 `release.md` 版本与兼容结论、移出 Backlog 候选行、补本记录。
- R2（deep，20 分钟盒，范围冻结）：**Pass**（0 blocker / 3 warning / 1 suggest）。两个 blocker 闭环，旧口径零残留；warning 为交付记录披露与体例项，已在本段与 §6 收口。
- 复查基线：`origin/master = 1da8ed6f`；`package.json` / `pnpm-lock.yaml` 与 R1 审查态一致（未再变动）；`pnpm lint:md:check` / `pnpm docs:check` / `pnpm governance:check` 均 exit 0。

## 6. 遗留与后续

- `semantic-release` 25 → 26 与 `typescript` 6.0.3 → 7.0.2 的评估结论、阻断事实与触发条件统一登记在 [Backlog §1.6](../../plan/backlog.md) 同名候选行，本记录不复制判据，避免同一事实两套解禁口径。
- preset × writer 8 双路径目前由人工矩阵取证，无自动化门禁；若后续再升 preset，需复跑本记录 §3 的四组合矩阵。
