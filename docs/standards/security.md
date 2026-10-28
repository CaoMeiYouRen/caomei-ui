# 安全规范

本文档定义 caomei-ui 的密钥、依赖、输入、终端与供应链安全要求。

## 1. 密钥与凭据

- 严禁将密钥、token、密码硬编码进源码；严禁提交 `.env`。
- 非必要不读取 `.env`；如需了解字段，优先参考 `.env.example`。
- npm 发布凭据通过 CI secrets（GitHub Actions + npm Trusted Publisher / OIDC）管理。

## 2. 依赖安全

- 新增依赖前核实：来源真实（官方 registry）、拼写正确（防 typosquatting）、维护状态与 license。
- 关注 Dependabot / `pnpm audit` / Code Scanning 告警；**发布前必须执行 §2.1 的告警门禁**。
- `pnpm-lock.yaml` 提交入库，CI 使用 `--frozen-lockfile`。
- 供应链告警（CVE / GHSA）属于规划插队例外清单，可优先处理。

### 2.1 发布前安全告警门禁

任何发布（含 `rc` 预发布）前，必须检查 Dependabot alerts 与 Code Scanning alerts 的 open 项，并按下列分级处置。当次发布的治理记录至少登记各严重级的 open 计数与全部豁免清单。

| 级别 | 处置 | 是否阻塞发布 |
| --- | --- | --- |
| critical | **必须修复**；上游无补丁时须移除 / 替换依赖或下线受影响能力，仍不得豁免 | 是，**不允许豁免** |
| high | 原则上必须修复；仅「上游无可用修复版本」或「修复成本显著高于当期可承受范围」可豁免 | 是，除非按本节要求留痕豁免 |
| medium / low（及非安全 note 类） | 可暂缓，随常规版本修复 | 否 |

- **级别取值**：Dependabot 取 `security_advisory.severity`（`low` / `moderate` / `high` / `critical`，本文的 `medium` 即 `moderate`）；Code Scanning 取 `rule.security_severity_level`（`low` / `medium` / `high` / `critical`）。后者为空时先核对 `rule.tags`：含 `security` 的按 high 处置；不含（纯 maintainability / note 类规则）才不构成安全阻塞项。
- **high 豁免要求**（缺一不可）：
  1. 由维护者确认；**AI 不得自行豁免**；
  2. 在当次发布治理记录登记：来源、包 / 规则、GHSA / CVE 或规则 ID、受影响区间（或文件位置）、当前解析版本、不可修原因、计划修复版本或再评估触发条件；
  3. 在 [Backlog](../plan/backlog.md) 建高优先级跟踪行，注明计划修复版本（原则上最近的可发布窗口），并在每次发布前复评；
  4. 在发布说明 / known limitations 中披露。
- **检查入口**（无 GitHub 安全面板访问权限时，以 `pnpm audit --registry=https://registry.npmjs.org` 与本地 / CI 扫描结果替代，分级口径不变）：

```bash
gh api --paginate "repos/<owner>/<repo>/dependabot/alerts?state=open&per_page=100"
gh api --paginate "repos/<owner>/<repo>/code-scanning/alerts?state=open&per_page=100"
```

`pnpm audit` 只要存在任意级别告警就会非零退出，**必须按 `severity` 判读**（如 `pnpm audit --registry=https://registry.npmjs.org --json` 后过滤 `high` / `critical`），不得以退出码直接作为门禁结论。

- **CI 接入**：`.github/workflows/security-alerts.yml` 在 push `master`、每日定时与手动触发时运行 `pnpm check:security-alerts`。Dependabot alerts 只能用用户 PAT 读取，故使用仓库 secret **`SECURITY_ALERTS_TOKEN`**（classic PAT 的 `security_events`，或 fine-grained 的 `Dependabot alerts: read` + `Code scanning alerts: read`）；缺失或权限不足时 job 失败并给出提示；两类告警均使用该 PAT 读取（仓库默认 `GITHUB_TOKEN` 无法读取 Dependabot 告警，不设回退）。
- **豁免文件**：`.github/security-alerts-exemptions.json`，条目字段 `source` / `id` / `reason` / `plannedVersion` / `tracking` / `approvedBy` / `recordedAt`；**仅 high 可登记**，critical 使用豁免会直接报错；对应告警已关闭的条目会被提示删除。
- **本地复跑**：`SECURITY_ALERTS_TOKEN=<pat> pnpm check:security-alerts`（可加 `--repo=owner/repo`、`--json`）。

- 面板的 `state` 依赖**推送后的扫描**收敛；本地已修复但未推送时，还须在发布记录登记「解析版本已离开受影响区间」的证据（解析后版本 + 旧版残留扫描）。

## 3. 输入校验

- 组件对外输入（props）在必要时做运行时校验与类型收窄。
- 不信任任何外部输入；禁止 `v-html` 直接渲染未清洗内容，除非内容已明确消毒。
- 涉及工具函数处理用户输入时，必须做边界与类型校验。

## 4. 终端与脚本安全

- 执行脚本或命令前必须做环境检查与路径校验。
- **禁止批量删除文件或目录**（如 `rm -rf`、`del /s`、`rd /s`）；删除时一次只删一个明确路径，并审查路径正确性。
- 自动化脚本遵循最小权限原则，不擅自修改系统级配置。

## 5. 构建与发布的供应链

- 构建产物不包含密钥或内部调试信息。
- 发布使用 CI，不在本地长期持有发布 token。
- 引入外部 skill / agent 时遵循 [AI 资产治理](./ai-governance.md) 的准入要求。

## 6. 依赖许可

- 项目自身 license：MIT。
- 引入的第三方库必须为宽松许可（MIT / Apache-2.0 / ISC / BSD 等）；引入 copyleft 或商业许可依赖前必须确认并记录。
- 不得引入与 PrimeVue 5 类似、未来会转商业许可的依赖而未评估风险。
