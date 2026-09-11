# 安全规范

本文档定义 caomei-ui 的密钥、依赖、输入、终端与供应链安全要求。

## 1. 密钥与凭据

- 严禁将密钥、token、密码硬编码进源码；严禁提交 `.env`。
- 非必要不读取 `.env`；如需了解字段，优先参考 `.env.example`。
- npm 发布凭据通过 CI secrets（GitHub Actions + npm Trusted Publisher / OIDC）管理。

## 2. 依赖安全

- 新增依赖前核实：来源真实（官方 registry）、拼写正确（防 typosquatting）、维护状态与 license。
- 关注 Dependabot / `pnpm audit` 告警，高危漏洞优先处理。
- `pnpm-lock.yaml` 提交入库，CI 使用 `--frozen-lockfile`。
- 供应链告警（CVE / GHSA）属于规划插队例外清单，可优先处理。

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
