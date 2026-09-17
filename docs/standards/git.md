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

## 3. 提交流程

1. 确认 `@code-reviewer` Review Gate 已放行。
2. 确认质量门通过（`lint` / `typecheck` / 必要测试 / 涉及构建时 `build`）。
3. 通过 `conventional-committer` skill 生成提交消息并提交，**禁止**裸 `git commit -m "..."`。
4. 提交必须通过 husky 钩子（commitlint / lint-staged），禁止 `--no-verify`。
5. lint-staged 仅运行 ESLint（`*.{js,ts,vue}`）；含样式改动时先手动执行 `pnpm lint:css:check`，避免 Stylelint 问题在提交后才由 `pnpm verify` 暴露。
6. 提交信息声明的状态变更必须能在 `git show` 中看到对应 hunk：规划台账的勾选 / 状态字段要与 diff 实际内容一致，禁止只追加说明而不改状态。
7. 涉及规划台账规模数字（文件数 / 行数）时须与同一 index 同源：改完数字后重新 `git add`，提交前用 `git show :<file>` 核验索引版文本，避免暂存内容自相矛盾。
8. 批次内已有子范围取得 Review Gate `Pass` 时**先提交该子范围**（部分交付），不累积到整批通过：提交信息写清未关闭项去向，**禁止把未审内容混入该提交**。多轮审查未过时的缩面要求见 [AI 协作规范 §3.5](./ai-collaboration.md)。

> 相邻改动行无法用 `git add -p` 拆 hunk 时，可临时移除同文件内另一条目的改动先行提交本条目，再恢复后提交（等价于手工拆 hunk）。

## 4. 推送纪律

- **禁止擅自推送**：`git commit` 后不得自动 `git push`，除非用户明确要求「推送」「push」「推到远端」。
- 提交后应止步于本地 commit，并告知用户等待推送确认。

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
