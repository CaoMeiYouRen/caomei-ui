# Phase 26 S3：安全告警门禁 CI 接入

> 日期：2026-10-29
> 触发：用户指令「Dependabot alerts 只有在用户 PAT 下才能访问，请在对应的 CI 中引入对应的环境变量读取配置」。
> 范围：`scripts/release/check-security-alerts.mjs`（新增）、对应单测、`.github/workflows/security-alerts.yml`（新增）、`.github/security-alerts-exemptions.json`（新增）、`package.json` 单条脚本；文档同步。零 `src/**`。
> 依据：[安全规范 §2.1](../../standards/security.md)（发布前 critical 不得豁免 / high 可留痕豁免）。
> 计数：本批不占 Phase 26 原子条目计数（仍 5 条主线 / 17 条原子条目）。
> 基线：`0dfff98`（规范提交；已推送）。

## 1. 背景

- 安全规范 §2.1 要求发布前检查 Dependabot / Code Scanning；其中 **Dependabot alerts 只能由用户 PAT 读取**，仓库默认 `GITHUB_TOKEN` 无权限（实测 403/404）。
- 仅写在指南里的「人工检查」无法保证每次执行；本批把它变成可复现的 CI 步骤，并把 token 收敛到单一 secret。

## 2. 实现

### 2.1 检查脚本（`scripts/release/check-security-alerts.mjs`）

- 数据源：`/repos/{repo}/dependabot/alerts?state=open` 与 `/repos/{repo}/code-scanning/alerts?state=open`。
- **分页**：统一跟随 `Link` 头的 `rel="next"`。Dependabot 端点不支持 `page` 参数（实测 400 `Pagination using the page parameter is not supported`），不能用页码翻页；404 一律按配置错误处理（不静默视为空清单）。
- **严重级**：Dependabot 取 `security_advisory.severity`（`moderate` 归一为 `medium`）；Code Scanning 取 `rule.security_severity_level`，为空时 `rule.tags` 含 `security` 按 high，否则视为 note（不阻塞）。
- **判定**：critical 恒阻塞且不接受豁免；high 无有效豁免即阻塞；medium / low / note 暂缓。未知严重级按 high 兜底（fail-closed）。
- **豁免**：读取 `.github/security-alerts-exemptions.json`；仅 high 可登记，critical 使用豁免直接报错；字段缺失 / 重复 / 未知来源均报错；告警已关闭的条目会提示删除（stale）。
- **认证**：必须提供 `SECURITY_ALERTS_TOKEN`（用户 PAT）；缺失、401/403/404 均以退出码 2 失败并给出权限提示。仓库默认 `GITHUB_TOKEN` 不设回退（无法读取 Dependabot）。
- **输出**：文本报告；`--json` 机器可读；设置 `GITHUB_STEP_SUMMARY` 时追加 Markdown 表格。
- **退出码**：0 通过；1 存在阻塞；2 配置 / API 错误。

### 2.2 CI（`.github/workflows/security-alerts.yml`）

- 触发：push `master`、每日 01:00 UTC 定时、`workflow_dispatch`。
- 权限：`contents: read`（读取告警使用 PAT，不需要 workflow token 的安全权限）。
- secret：**`SECURITY_ALERTS_TOKEN`**（classic PAT 需 `security_events`；fine-grained PAT 需 `Dependabot alerts: read` + `Code scanning alerts: read`）。
- 步骤只做 checkout / pnpm / node 与 `pnpm check:security-alerts`，不安装依赖（脚本仅用 Node 内置模块）。

### 2.3 豁免清单

- `.github/security-alerts-exemptions.json` 初始为空：`{ "exemptions": [] }`。
- 单条字段：`source`（`dependabot` / `code-scanning`）、`id`（告警编号）、`reason`、`plannedVersion`、`tracking`、`approvedBy`、`recordedAt`（YYYY-MM-DD）。

## 3. 验证证据

| 检查 | 结果 |
| --- | --- |
| 单测 `check-security-alerts.test.mjs` | **28 passed**（严重级归一、两类告警归一、豁免校验、critical 拒绝豁免、Link 翻页（含 next 非首段）、401/403/404、分页上限、默认路径、summary 转义、CLI 退出码） |
| `pnpm exec eslint`（脚本 + 测试） | exit 0 |
| workflow YAML 解析 | 通过；根 `permissions = { contents: read }` |
| 实网运行（`SECURITY_ALERTS_TOKEN=$(gh auth token)`，仓库 `CaoMeiYouRen/caomei-ui`） | **exit 0**：`critical 0 / high 0 / medium 0 / low 1 / note 0`，仅 `deepmerge` low（按 §2.1 可暂缓） |
| 面板复核（2026-10-29，推送后） | Dependabot open = **1**（`deepmerge` low）；Code Scanning open = **0** |

> 实网运行同时验证了 `Link` 分页修复：早期用 `page=` 时端点返回 400，改为跟随 `Link` 后正常返回。

## 4. 未覆盖边界

- 未在 GitHub Actions 真机运行本 workflow（需先在仓库配置 `SECURITY_ALERTS_TOKEN`）；本地以同一命令 + 真实 token 验证。
- CI 自动发布当前为关闭状态（`release.yml` 的 publish 步骤被注释）；启用时须把 `pnpm check:security-alerts` 作为 release job 的前置 step，否则本 workflow 只有巡检告警作用。
- 未覆盖 fork PR：workflow 只在 push `master` / 定时 / 手动触发，fork 无 secret 的场景不进入执行面。
- `deepmerge` low 无补丁，按新规范暂缓；S1 记录 §3 已登记再评估触发。
- PAT 轮换、过期与最小权限复核不在本批；建议在 token 到期前轮换并保持只读。
- Code Scanning 无 `security_severity_level` 且无 `security` 标签时按 note 放行；若后续接入第三方 SARIF（无 GitHub 安全分级），需重新评估该分支。

## 5. Review Gate

- 改动类型：CI / 脚本 / 测试 / 规范与规划载体（零 `src/**` 零 `test/**`）。
- 最低验证要求：lint + 定向测试 + workflow YAML 解析 + 实网运行 + 文档机检 + RG。
- audit-depth：**deep**（CI + 安全凭证读取 + 发布门禁），时间盒 ≤ 20 分钟；并发分区 A（脚本 / CI / 豁免）/ B（文档与规划），总时间盒取最大值。
- 复查基线：`0dfff98` + 本批工作区。
- **R1**：A **Reject**（B1 `REPO_ROOT` 少一级致默认豁免永不加载；W2 Code Scanning 404 fail-open；W3 测试缺口；B-W1 `GITHUB_TOKEN` 兜底不可达）；B **Pass**（5 warning / 3 suggest）。修复：`REPO_ROOT` 补 `dirname`、404 一律 fail-closed、强制 PAT、测试 22 → 26、summary 转义、规范 / 时序 / roadmap / `.session` 同步。
- **R2**：A **Pass**（4 suggest）；B **Pass**（1 warning / 3 suggest）。修复：`plannedVersion` 转义、`formatSummary` 测试、404 `main` 层断言、`release.md` §4 secret 句、门禁表 S3 行位置、记录计数与第三方 SARIF 边界；测试 26 → **28**。
- **R3（`quick` delta）：Pass**（0 blocker；9 项建议全部落地；2 条可读性 suggest 不阻塞）。
