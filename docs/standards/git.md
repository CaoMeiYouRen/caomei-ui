# Git 规范

本文档定义 caomei-ui 的分支、提交、合并与推送纪律。

## 1. 工作区纪律

- 开始改动前先检查 `git status` 确认工作区干净；有未提交改动时先处理完毕再开始新任务。
- 开始改动前检查远程是否有新提交（`git fetch` + `git log HEAD..@{u}`）；如有，先 `git pull --rebase` 同步。
- 遇冲突必须先修复，不得带着冲突继续工作。

## 2. 提交消息

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/)：`<type>(<scope>): <description>`。
- 常用 type：`feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `perf` / `ci` / `build`。
- `description` 使用中文（或用户使用的语言）。
- 主题行不超过 120 字符。
- 一个提交对应一个逻辑变更，避免「大杂烩」提交。
- 破坏性提交（头部 `!` 或 `BREAKING CHANGE:` footer）必须在 `BREAKING CHANGE:` **之前**写 `Breaking-Review:` footer：`Breaking-Review: <确认人标识> <YYYY-MM-DD> <approved|approved-with-migration>`，可选追加 `@<7-40 位小写十六进制短哈希>` 指向被确认的树。固定位置便于发布说明解析与人工复核。
- 确认人标识使用 GitHub 登录名（1-39 位字母数字或连字符，不以连字符开头 / 结尾，不带 `@`），不得使用 `owner` / `TODO` / `TBD` / `me` / `self` / `unknown` / `n/a` 等占位标识；日期必须为真实日历日期；结论只允许 `approved` / `approved-with-migration`。
- 破坏性提交只能有一条 `Breaking-Review:`，且必须与正文以空行分隔；`BREAKING CHANGE:` 说明不能为空；非破坏性提交不得包含 `Breaking-Review:`。
- 只写 `!` 不带 `BREAKING CHANGE:` footer 不合规；禁用连字符 `BREAKING-CHANGE:`（发布链的 `noteKeywords` 只识别空格形式）。

## 3. 提交流程

1. 确认 `@code-reviewer` Review Gate 已放行。
2. 破坏性提交须在 `git add` 后、`git commit` 前取得项目所有者或其明确授权人的确认；确认对象 = 最终暂存树 + 最终提交消息，AI 自检与 Review Gate 不替代。
3. 确认后暂存树或消息文本任一变化（含 amend / rebase）须重新确认；`Breaking-Review:` 行本身不计入比较。破坏性提交独立成批；历史提交不回补记录。
4. 确认质量门通过（`lint` / `typecheck` / 必要测试 / 涉及构建时 `build`）。
5. 通过 `conventional-committer` skill 生成提交消息并提交，**禁止**裸 `git commit -m "..."`。
6. 提交必须通过 husky 钩子（commitlint / `check-breaking-change-commit` / lint-staged），禁止 `--no-verify`。
7. lint-staged 仅运行 ESLint（`*.{js,mjs,cjs,ts,vue}`）；含样式改动时先手动执行 `pnpm lint:css:check`，避免 Stylelint 问题在提交后才由 `pnpm verify` 暴露。
8. 提交信息声明的状态变更必须能在 `git show` 中看到对应 hunk：规划台账的勾选 / 状态字段要与 diff 实际内容一致，禁止只追加说明而不改状态。
9. 涉及规划台账规模数字（文件数 / 行数）时须与同一 index 同源：改完数字后重新 `git add`，提交前用 `git show :<file>` 核验索引版文本，避免暂存内容自相矛盾。
10. 批次内已有子范围取得 Review Gate `Pass` 时**先提交该子范围**（部分交付），不累积到整批通过：提交信息写清未关闭项去向，**禁止把未审内容混入该提交**。多轮审查未过时的缩面要求见 [AI 协作规范 §3.5](./ai-collaboration.md)。

> 相邻改动行无法用 `git add -p` 拆 hunk 时，可临时移除同文件内另一条目的改动先行提交本条目，再恢复后提交（等价于手工拆 hunk）。

> **`lint-staged` 会对 staged 的整个文件跑 `eslint --fix` 后 `git add` 整文件**：用 `git add -p` 做部分暂存后提交，未暂存的同文件 hunk 会被一并 stage。需同文件分提交时，先临时还原后一 hunk、提交、再重新应用。（注：`lint-staged` 只匹配其 glob，未匹配的文件如 `package.json` **不会**被它整文件 stage；但**部分暂存本身会被 `pre-commit` 的 `check:staging-hygiene` 阻断**——凡「索引与工作区同时有改动」（`AM` / `MM` / `RM` / `MD` / `AD` 等）一律判 `partial-stage`，规则见 [AI 协作规范 §9](./ai-collaboration.md) 与该脚本文件头。故 non-glob 文件同样不能借部分暂存分提交，同文件分提交一律走本段的「临时还原 → 提交 → 恢复」流程。）

> **拆提交时的审计工件新鲜度**：按「临时还原同文件内另一条目的改动 → 提交 → 恢复」拆提交会**再次改写共享文件**，而本地 `check-review-gate-artifacts` 按「工件 mtime ≥ 受检文件 mtime」判新鲜——故**每次还原 / 恢复后都要重新 touch 审计工件**，否则第二个提交会被 `pre-commit` 拦下。

## 4. 推送纪律

- **禁止擅自推送**：`git commit` 后不得自动 `git push`，除非用户明确要求「推送」「push」「推到远端」。
- 提交后应止步于本地 commit，并告知用户等待推送确认。
- **自动化会话（定时任务）的授权例外**：见 [GitHub 协作规范](./github-collaboration.md) §4。

## 5. 分支策略

- 仓库主分支为 `master`；默认在 `master` 之外按任务开分支。
- 分支命名：`feat/<scope>`、`fix/<scope>`、`docs/<scope>`、`chore/<scope>`。
- 合并前确保 CI 通过且质量门通过。

## 6. 版本与发布

- 由 semantic-release 依据 Conventional Commits 自动推断版本。
- 发布前必须确认下游兼容性回归策略（稳定使用后启用），详见 [发布指南](../guide/release.md)。

## 7. 禁止事项

- 强制推送（`--force`）受保护分支。
- 提交 `.env` 或任何密钥。
- 跳过提交钩子。
- 批量删除文件或目录。
