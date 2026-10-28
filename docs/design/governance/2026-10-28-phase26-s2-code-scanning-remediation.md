# Phase 26 S2：Code Scanning 告警清理（1.0 发布前）

> 日期：2026-10-28
> 触发：用户指令「Code Scanning 也镜像清理」（同 S1 依赖安全批次的口径）；按[规划规范 §3.5](../../standards/planning.md) 插队例外第 1 条（已确认的安全告警）登记，不占 Phase 26 原子条目计数。
> 范围：`scripts/docs/check-example-refs.mjs`、`scripts/docs/check-i18n-routing.mjs`、对应单测、`.github/workflows/test.yml`；零 `src/**`。
> 基线：`c0c8e6d`（S1 文档提交）。
> 前置：[S1 依赖安全告警清理](./2026-10-28-phase26-s1-dependency-alerts-remediation.md) §6 已把 Code Scanning 登记为独立批次。

## 1. 盘点

`gh api "repos/CaoMeiYouRen/caomei-ui/code-scanning/alerts?state=open&per_page=20"`（2026-10-28 快照）：**5 项 open**，全部由 CodeQL 2.27.3 在 `master` 的 `dynamic/github-code-scanning/codeql` 分析中产出。

| # | 规则 | security severity | 位置 | 命中说明 |
|:-:|:---|:---|:---|:---|
| 5 | `js/bad-tag-filter` | high | `scripts/docs/check-example-refs.mjs:156` | 正则未覆盖大写 `<SCRIPT>`，大小写绕过会漏判模板内副作用标签 |
| 4 | `js/incomplete-multi-character-sanitization` | high | `scripts/docs/check-i18n-routing.mjs:47` | 单次 `replace` 清洗后仍可能含 `<script` |
| 3 | `js/incomplete-multi-character-sanitization` | high | `scripts/docs/check-i18n-routing.mjs:47` | 同一行的 `<!--` 残余 |
| 2 | `actions/missing-workflow-permissions` | medium | `.github/workflows/test.yml:51-80`（`test-build`） | job 未限制 `GITHUB_TOKEN` 权限 |
| 1 | `actions/missing-workflow-permissions` | medium | `.github/workflows/test.yml:21-50`（`quality`） | 同上 |

> 行号取自面板 API 快照（与分析提交对应）；本地当前文件因新增 `permissions` 块整体下移 1 行。

**风险面判断**：前 3 项的输入是仓库文档 / VitePress 构建产物，不是运行时用户输入；后 2 项是 CI 最小权限。5 项都不影响发布产物，但会让 1.0 的安全面板不干净，且前 3 项属**真实判定缺陷**（大写标签会漏判、正则清洗结构上不可靠）。

## 2. 处置

### 2.1 `check-example-refs.mjs`（#5）

- 根因：`body.match(/<(style|script)[\s>]/)` 区分大小写，CodeQL `js/bad-tag-filter` 判定可被大写标签绕过。守卫按 HTML 语义取**最严判定（fail-closed）**；Vue compiler 自身只识别小写 `<script>` / `<style>`，本守卫对大写属防御性扩展（实测 `@vue/compiler-dom` 3.5.44 不报大写形态）。
- 修复：改为 `/<(style|script)[\s>]/i`，并把捕获组统一 `toLowerCase()` 后写入报错信息（保持提示文案稳定为小写标签名）。
- 新增单测：大写 `<SCRIPT>`、`<Style scoped>` 均判定为 `example-sfc-shape`。

### 2.2 `check-i18n-routing.mjs`（#3 / #4）

- 根因：`match[2].replace(/<[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '')` 用两条正则做「去标签 + 去注释」。正则无法表达嵌套 / 大小写 / 注释内 `>` 等结构，CodeQL 判定为不完整清洗。
- 修复：新增导出函数 `extractTextContent(html)`，按字符扫描：
  - 遇 `<!--` 跳到最近的 `-->`；
  - 其它 `<` 跳到下一个 `>`；
  - 未闭合 `<` 时把剩余文本原样保留（与原正则「无匹配则保留」的语义一致）。
- `collectHrefsForLabel` 改用该函数，行为对三种菜单标记（桌面 / 平板 / 移动）保持等价。
- 新增单测：嵌套标签、注释内含 `>`、连续注释标记、未闭合 `<` 四个边界。

### 2.3 `.github/workflows/test.yml`（#1 / #2）

- 根因：两个 job 均未声明 `permissions`，继承仓库默认权限。
- 修复：在 workflow 根加 `permissions: contents: read`（与 `docs.yml` / `downstream-compat.yml` 同口径），两个 job 只读检出 + 本地构建 / 测试，无需写权限。
- 校验：YAML 解析通过；`quality` / `test-build` 均无需要写权限的步骤（Codecov 走 `secrets.CODECOV_TOKEN`）。

## 3. 验证证据

| 检查 | 结果 |
| --- | --- |
| `pnpm verify` | **exit 0**（142 文件 / **2754 例**，较 S1 增加 4 例；lint / stylelint / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check） |
| `pnpm docs:check:example-refs` | exit 0（389 md / 414 引用 / 393 示例；含本记录） |
| `pnpm docs:check:i18n-routing` | exit 0（7 条语言切换链接） |
| `pnpm exec eslint`（4 个改动脚本） | exit 0 |
| `.github/workflows/test.yml` YAML 解析 | 通过；根 `permissions = { contents: read }` |
| `pnpm lint:md:check` / `governance:check` | exit 0 |

## 4. 告警收敛口径

- Code Scanning 的 `state` 在**推送 + CodeQL 重新分析**后收敛；本批未推送，面板仍为 5 项 open。
- 本地判据：CodeQL 命中的代码形态已不存在（大小写标志 / 正则清洗移除 / 根权限块），且对应守卫脚本与单测通过。
- 推送后复核：5 项应为 `fixed`；若 `dynamic` 分析未自动重跑，手动触发一次 CodeQL 分析后复核。

> **推送后复核（2026-10-29）**：本批随仓库推送后 CodeQL 重新分析完成，5 项告警全部关闭；当前 Code Scanning open = **0**。

## 5. 未覆盖边界

- 未在本地运行 CodeQL（`codeql` CLI 未装）；以「规则命中的代码形态是否消失 + 单测」为本地判据。
- 其余 workflow 的 `permissions` 未逐个复核（不在本批告警面内）。
- 守卫仍漏检自闭合 `<script/>` / `<style/>`（存量缺口，Vue compiler 会报错）；不在本批 5 项告警面内，登记为后续候选。
- 本批不改文档站产物与运行时行为，未重跑 E2E / 视觉基线；`verify` 内已含 `docs:build` 与 Nuxt smoke。

## 6. Review Gate

- **审计协议**：分区 A（守卫脚本 + CI）`standard` ≤ 10 分钟；分区 B（治理与规划载体）`standard` ≤ 10 分钟；并发执行，总时间盒 **10 分钟**。
- **R1（2026-10-28）**：A **Pass**（1 warning / 3 suggest）、B **Pass**（2 warning / 4 suggest）→ 汇总 **Pass**。
  - A-W1：`i` 标志的注释理由与 Vue compiler 实际行为相反；A-S1：自闭合 `<script/>` 漏检（存量）；A-S3：`extractTextContent` 未声明属性值含 `>` 边界。
  - B-W1：门禁表 S2 行的告警构成写反（2 脚本 + 3 CI）；B-W2：G2 限定句只提 S1；B-S1 ~ S4：索引缺本地判据、S1 记录未指向 S2、门禁块位置、记录缺行号来源与后续候选。
- **修复（R1 → R2）**：A-W1 注释改为「CodeQL 要求 + fail-closed，compiler 只识别小写」；A-S3 补已知边界；B-W1 门禁行改为 3 high + 2 medium；B-W2 G2 行 / 前置注记改 S1 / S2 并补 §6 回扫行；B-S1 ~ S4 全部采纳（索引限定、S1 指向、门禁块上移、行号来源 / 自闭合缺口 / 389 计数）。
- **R2（`quick` delta，≤ 5 分钟）：Pass**（0 blocker）。8 个修复点中 6 项完全关闭，剩余 2 warning（记录 §2.1 口径残留、`.session` 的 `next_steps` 未同步）与 2 suggest（`todo.md` 空行、§6 回填）已同批处理。
