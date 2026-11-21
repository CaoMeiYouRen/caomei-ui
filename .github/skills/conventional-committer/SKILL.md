---
name: conventional-committer
description: 需要生成 Conventional Commit 提交消息并执行单次提交时使用。适用于 feat、fix、docs、refactor、test、build、ci、chore 等常规提交场景。先检查质量门，再分析 diff，再生成符合 commitlint 预期的消息。

metadata:
  internal: false
---

# Conventional Committer

铁律：不要在不了解本次实际变更范围和质量状态的前提下直接 git add . 然后提交。

## 工作流

- [ ] Step 1: 确认是否允许提交 ⚠️ REQUIRED
	- [ ] 1.1 检查用户是否明确要求提交。
	- [ ] 1.2 确认质量检查已经完成，或明确告知仍有风险。
- [ ] Step 2: 审视变更范围 ⚠️ REQUIRED
	- [ ] 2.1 查看 git status 和 diff，识别应该提交的文件。
	- [ ] 2.2 排除临时文件、生成物和无关改动。
- [ ] Step 3: 生成提交消息 ⚠️ REQUIRED
	- [ ] 3.1 先判断 type，再决定是否需要 scope（详见「消息格式规范」）。
	- [ ] 3.2 主题与正文聚焦“为什么”和“本次改了什么”，保持简洁可读。
	- [ ] 3.3 主题、正文必须使用简体中文（或用户显式指定的其他语言），type / scope 必须为英文。
	- [ ] 3.4 多类型变更时按 feat > refactor/perf > fix > 其他 选取主类型，其余改动沉到正文。
	- [ ] 3.5 最终消息必须通过「交付前检查」与「消息格式规范」中的硬性约束。
	- [ ] 3.6 破坏性提交先冻结暂存树并形成最终消息草稿，再取得人工确认；确认对象 = 暂存树 + 消息文本，确认后任一变化须重新确认，AI 自查与 Review Gate 不替代。
	- [ ] 3.7 `Breaking-Review:` 写在 `BREAKING CHANGE:` 之前；格式、时机与重确认条件见 [Git 规范 §2 / §3](../../../docs/standards/git.md)。
- [ ] Step 4: 执行提交 (conditional)
	- [ ] 4.1 只有在用户明确允许时才执行 git add / git commit。
	- [ ] 4.2 提交后复查消息是否符合 commitlint 习惯。
	- [ ] 4.3 提交必须通过 husky hook；hook 因环境或工具链不兼容失败时先修复环境，禁止使用 `--no-verify` 跳过（见 [Git 规范 §3](../../../docs/standards/git.md)）。
	- [ ] 4.4 依赖类批量修复统一使用中文格式：`chore(deps): xxx`，让提交消息能跨项目复用。

## 常见 type

- feat
- fix
- docs
- refactor
- test
- build
- ci
- chore
- perf
- revert

## 破坏性提交

- 判定：头部含 `!`，或 footer 含 `BREAKING CHANGE:`。
- 流程：冻结暂存树 → 形成最终消息草稿 → 取得项目所有者或授权人确认 → 写入 `Breaking-Review:` → 提交。AI 自查与 Review Gate 不替代人工确认。
- 消息中同时写 `Breaking-Review:` 与 `BREAKING CHANGE:`，前者在前；只能有一条记录，且与正文以空行分隔；非破坏性提交不得带记录；`BREAKING CHANGE:` 说明不能为空。
- 确认人标识使用 GitHub 登录名（不带 `@`，不得用 `owner` / `TODO` 等占位标识）；只写 `!` 不带 `BREAKING CHANGE:` footer 不合规，禁用 `BREAKING-CHANGE:` 连字符形式。
- 格式、时机与重确认条件以 [Git 规范 §2 / §3](../../../docs/standards/git.md) 为唯一权威；本 skill 只保留执行清单与检查项。

## 消息格式规范

> 以下规范为本项目 commit message 的默认基线（参考 `without_gitmoji.md`）。当用户显式声明其他规则时，以用户声明为准；未声明时强制执行本规范。

### 结构

单一类型修改：

```
<类型>(<作用域>): <主题>
<空行>
<正文>
```

多类型修改：选择最大类型作为主类型（顺序 `feat > refactor/perf > fix > 其他`），其余改动写入正文。

```
<主类型>(<作用域>): <主题>
<空行>
- 类型1的正文
- 类型2的正文
```

特例：

- `README` / `API` / `*.md` / `markdown` 及其改动一律视为 `docs`。
- `unit` / `e2e` / `test` 及其改动一律视为 `test`。
- 无法归类时一律视为 `chore`。

### 主题行（subject）

- 主类型与作用域必须为英文。
- 采用祈使语气，首字母不大写，末尾不加句点。
- 最长 100 个字符。
- 必须使用简体中文（除非用户显式指定其他语言）。
- 无必要时不要在主题中使用括号备注；备注类信息沉到正文。

### 正文（body）

- 以 `-` 加空格作为列表符号。
- 每行最长 120 个字符，内容应精简。
- 简单说明「做了什么」以及「为什么这么做」。
- 必须使用简体中文（除非用户显式指定其他语言）。
- 改动简单时可不写正文；不要堆砌过多条目。

### 硬性要求

1. 只能输出提交信息本身，禁止附加解释、问题、注释、格式说明或元数据。
2. 默认使用简体中文；用户明确指定其他语言时跟随用户。
3. type / scope 永远使用英文。

### 示例

```
refactor(server): 优化服务器端口配置

- 将端口变量重命名为大写形式（PORT）
```

## 反模式

- 不看 diff，直接用模糊消息如 update files。
- 把多类变更混成一个没有 scope 的提交。
- 在质量检查未完成时默认提交。
- 使用 `--no-verify` 跳过本应生效的检查。
- 主题或正文出现英文长句，违反默认简体中文约定。
- 在主题里塞括号备注（如 `feat(api): 新增支付接口（兼容老逻辑）`），备注应沉到正文。
- 多类型变更没有收敛主类型，导致 type 难以反映本次主体意图。
- 破坏性提交只写 `!` 或只写 `BREAKING CHANGE:`，未先取得人工确认并写 `Breaking-Review:`。

## 交付前检查

- [ ] 已确认本次允许提交。
- [ ] 暂存范围只包含相关变更。
- [ ] 提交消息符合 Conventional Commits 语义。
- [ ] type / scope 使用英文，主题与正文使用简体中文（或用户指定语言）。
- [ ] 多类型变更已收敛主类型，其余改动写入正文。
- [ ] 主题 ≤ 100 字符，正文每行 ≤ 120 字符，未在主题中夹带括号备注。
- [ ] 破坏性提交已取得人工确认，并含位于 `BREAKING CHANGE:` 之前的 `Breaking-Review:`。
- [ ] 已说明任何未完成的质量风险。









