# 手动发布链路加固：空 Unreleased、OTP 与 tag 预检

- 触发：2026-10-20 用户报告 0.7.0 发布链路问题——① `CHANGELOG.md` 出现多余的 `# Unreleased` 段；② `manual-release` 的 `publish` 未考虑 OTP；③ `announce` 在本地有 tag、远程没有时应提示先推送；另附 [Downstream Compat run 39423865750](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/39423865750) 的失败。
- 性质：发布工具缺陷修复（脚本 + 测试 + 工作流 + 发布指南）
- 范围：`scripts/release/generate-changelog.mjs`、`scripts/release/manual-release.mjs`、对应测试、`.github/workflows/downstream-compat.yml`、`docs/guide/release.md`

## 1. 缺陷与修复

### 1.1 多余的空 Unreleased 段

- **根因**：`generate-changelog` 使用 `outputUnreleased: true`；指定 `--version` 且同名 tag 已存在时，conventional-changelog 会把目标版本作为已发布段输出，同时在前面留下空的 `# Unreleased (...)` 标题。0.7.0 的 tag 在 `bump` 步骤建立，`changelog` 提交在其后，重生成时即可复现。
- **修复**：保持 `outputUnreleased: true`（关掉会退回只输出最近一个已发布 tag 段落），在指定版本时于生成后剥离**空**的 Unreleased 段；有内容的 Unreleased 段（尚未发布的提交）保持原样。新增 `stripEmptyUnreleasedSection` 纯函数与初始 3 例测试（空段含 `---`、有内容保留、同名 tag 集成）；R1 增补后最终 10 例（见 §3）。
- **验证**：在真实仓库执行 `node scripts/release/generate-changelog.mjs --version=0.7.0 --date=2026-10-20`，输出以 `# [0.7.0]` 开头、无 Unreleased；探针后已恢复 `CHANGELOG.md`。

### 1.2 publish 未考虑 OTP

- **修复**：`manual-release` 新增 `--otp=<code>`；`validateOtp` 接受 6-8 位数字，未提供时由 npm 交互提示；`buildPublishArgs` 生成 `npm publish [--otp=<code>]`。dry-run 显示 `--otp=***`；校验错误不回显输入值，`run` 失败信息使用脱敏参数，不写入输出。
- **测试**：`parseArgs` / `validateOtp` / `buildPublishArgs` 共 4 例。
- **边界**：未执行真实 `npm publish`，未验证真实 2FA 交互；OTP 仍会出现在进程参数与 Shell history 中（npm CLI 的既有形态；优先受控环境或省略 `--otp` 让 npm 交互提示）。

### 1.3 announce 的 tag 预检

- **修复**：`announce` 在 `gh release create` 前校验：
  - 本地 tag 与远程 tag 都不存在 → 提示先运行 `bump`；
  - 本地有、远程无 → 中止并提示 `git push origin v<v>`（或 `git push origin master --follow-tags`）后重试 `announce`；
  - 远程有、本地无 → 提示 `git fetch --tags`；
  - 两侧都存在但 SHA 不一致 → 中止并提示核对 / 同步，不覆盖已发布 tag。
- **测试**：初始 2 例覆盖 `parseRemoteTagSha`（忽略 peeled `^{}` 行）与 `formatLocalTagNotPushed`；R1 增补 `resolveTagState` 五态与 lightweight tag 后最终见 §3。
- **边界**：`announce` 仍不自动 push；网络 / 远程不可达时以 `git ls-remote` 的失败信息中止。

### 1.4 Downstream Compat 的 minimumReleaseAge

- **根因**：run 39423865750 在 `Override caomei-ui to target version` 步骤失败：下游启用了 pnpm 11 `minimumReleaseAge`，`caomei-ui@0.7.0` 刚发布 10 分钟，被判定「过新」并拒绝安装。
- **修复**：该步骤的 `pnpm add` 增加 `--config.minimumReleaseAge=0`。该开关作用于本次 `pnpm add` 的**整张依赖解析图**（不只 `caomei-ui` 本身）；下游 lockfile 已在上一 step 以默认门槛安装，常规安装未削弱。选择它而非 `minimumReleaseAgeExclude` 的原因：单步、行为确定、无需依赖 CLI 数组参数形态；若后续需要更窄口径，可再改用按包排除。工作流注释说明取舍。
- **验证**：YAML 解析通过；run #4 已走到版本覆盖但被 age 门槛中止，未进入 `typecheck` / `build`，不构成兼容性判定；未在真实 Actions 上重跑（需推送 tag / 手动触发，属发布动作）。

## 2. 质量门

- `pnpm lint:check` / `pnpm typecheck`：exit 0。
- `pnpm test`：135 文件 / **2633 例**通过。
- `pnpm lint:md:check` / `pnpm docs:check`：exit 0。
- `node scripts/release/generate-changelog.mjs --version=0.7.0 --date=2026-10-20` 探针：无 Unreleased；探针后恢复工作区。
- `.github/workflows/downstream-compat.yml`：`yaml` 解析通过（11 steps）。

## 3. Review Gate

**R1（`standard`）**：**Reject**（1 blocker / 3 warning / 2 suggest）。

- blocker：`validateOtp` 的错误信息回显非法 OTP 输入值，与「日志脱敏」口径矛盾。已改为 `Invalid --otp（期望 6-8 位数字）`，并补「错误信息不包含输入值」断言。
- warning：① `announce` 四种本地 / 远程 tag 组合缺少测试；已抽出 `resolveTagState` 并补 5 例（含 lightweight tag、peeled 行）。② 空 Unreleased 边界不足；已补「无下一个版本标题」与「有内容时相邻版本保留」。③ `minimumReleaseAge=0` 的作用域被写成「只对被测版本」；已在工作流注释、发布指南与 §1.4 改为「该次 add 的整张依赖解析图」，并说明常规安装未削弱。
- suggest：① OTP 示例改用 `--otp=<code>`；已采纳。② §3 待回填；本次回填。

**R2（delta `quick`）**：**Pass**（0 blocker / 3 warning / 2 suggest）。

- blocker 已闭合：OTP 校验错误不再回显输入值；探针确认 stderr 不含 OTP。
- warning：① `announce` 五态与 lightweight tag 已补；`git ls-remote` 失败路径保留为边界（代码分支简单，未做执行级注入）。② 空 Unreleased 已补「无下一标题」「空串 / 仅分隔线」「有内容相邻版本保留」；`version === undefined` 不剥离分支保留为边界（调用方 ternary 明确）。③ `minimumReleaseAge` 作用域已改为「该次 add 的整张依赖解析图」，并说明常规安装未削弱。
- suggest：① OTP 示例改为 `--otp=<code>`；② 已补 Shell history / 进程参数提示；dry-run / `run` 失败脱敏的直接测试保留为后续增强。

## 4. 未覆盖边界

- 未执行真实 `npm publish` / 2FA / GitHub Release / tag push；本次只改工具与预检。
- 未在真实 Actions 上重跑 Downstream Compat；`minimumReleaseAge` 的绕过需下一次 tag 触发验证。
- **不重写已发布 tag**：v0.7.0 的 tag 落点与 GitHub Release 维持现状；本修复只保证后续发布不再产生空 Unreleased，并在 tag 未推送时给出提示。
- 不校验译文质量、不改组件运行时。

## 5. 回滚与兼容

- 修复均为增量：`--otp` 为可选参数，不传时行为不变；`announce` 新增预检，tag 已同步时行为不变；空 Unreleased 仅在指定版本时剥离，预览模式不变。
- 回滚需撤销 `generate-changelog` / `manual-release` 的本批改动、删除新增测试、恢复工作流 `pnpm add` 与发布指南对应段落。
