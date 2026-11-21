# 破坏性提交人工审查（issue #73 研判与落地）

## 1. 结论

采纳提案的规则层，并同批落地 `commit-msg` 机检：破坏性提交进入本地历史前，须由项目所有者或其明确授权人确认，并把确认结果写成 `Breaking-Review:` footer；AI 自检与 Review Gate 不替代这道确认。历史提交不回补，已发布版本不追溯。

四项研判结论：

| 问题 | 结论 |
|:---|:---|
| 确认人标识 | GitHub 登录名（不带 `@`、无空格），如 `CaoMeiYouRen`；不使用 `owner` 角色占位，避免确认主体不可追责。 |
| 第四种结论 | 不增加。延后属于规划态，不应产生提交；提交态只保留 `approved` / `approved-with-migration`。 |
| 机检落点 | `commit-msg` 钩子。提交前即可拦截，消息完整，不需要处理 PR 区间、squash 合并与历史豁免。 |
| `!?` 补丁 | 保留。撤回条件写入发布指南与 Backlog：升级 preset 后其 parser `headerPattern` 原生识别 `type(scope)!:` 时删除本地覆盖。 |

## 2. 记录形态

```text
<type>(<scope>): <主题>

- 正文说明改了什么、为什么

Breaking-Review: <确认人标识> <YYYY-MM-DD> <approved|approved-with-migration>
BREAKING CHANGE: <破坏面与迁移方式>
```

- `Breaking-Review:` 必须位于第一个 `BREAKING CHANGE:` 之前，并与正文以空行分隔。
- 确认对象为最终暂存树 + 最终提交消息；任一变化（含 amend / rebase）须重新确认，`Breaking-Review:` 行本身不计入比较。
- 只写 `!` 不带 `BREAKING CHANGE:` footer 不合规；禁用连字符 `BREAKING-CHANGE:`，因为发布链的 `noteKeywords` 只识别空格形式。
- 守卫按 `conventional-commits-parser` 6.x / 7.x 可抽取的 note 形态匹配（大小写不敏感，允许前导空白 / `*` / `|`），避免「parser 认、守卫不认」的漏放。
- 可选择在结论后追加 `@<7-40 位小写十六进制短哈希>`，用于指向被确认的树；机检只校验后缀格式，不校验哈希是否对应。

## 3. 落地文件

| 文件 | 改动 |
|:---|:---|
| `docs/standards/git.md` | §2 增加消息格式；§3 增加人工确认、重确认、独立成批与钩子条目。 |
| `docs/standards/development.md` | §6 的破坏性变更条目增加规范指针。 |
| `AGENTS.md` | §9.3 增加一行项目政策与规范指针。 |
| `.github/skills/conventional-committer/SKILL.md` | 增加破坏性提交流程、检查项与反模式；格式以 `git.md` 为唯一权威。 |
| `scripts/governance/check-breaking-change-commit.mjs` | 新增 `commit-msg` 守卫：按 parser 可抽取形态识别 breaking note，校验记录存在、格式、日期、GitHub 登录名、位置、footer 与空 note。 |
| `scripts/governance/check-breaking-change-commit.test.mjs` | 纯函数、parser 形态对照、URL note、占位标识、CLI 退出码与钩子接线测试。 |
| `.husky/commit-msg` | 在 commitlint 之后调用守卫。 |
| `package.json` | 增加 `check:breaking-change-commit` 手动复放入口。 |
| `docs/guide/release.md` | §3.6 记录 `!?` 补丁撤回条件。 |
| `docs/plan/backlog.md` | §1.6 登记补丁撤回候选与可判定触发条件。 |

提交拆分：① 守卫脚本 + 测试（不含钩子接线用例）+ `package.json`；② `.husky/commit-msg` + 钩子接线用例 + 规范 / skill / `AGENTS.md` / release / backlog / 本记录与索引。两批均保持测试可绿，规范与钩子同批生效。

## 4. 机检边界

机检只能证明「记录存在且格式合法」，不能证明确认人真的审过，也不能证明 `approved-with-migration` 真的给了迁移路径；后两者由人工审查记录与 Review Gate 核对。squash / rebase 合并时，落库消息必须由合并者核对并保留记录；历史提交与已发布版本不回补。

## 5. 验证

- `pnpm exec vitest run scripts/governance/check-breaking-change-commit.test.mjs` → exit 0。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md` / `pnpm governance:check` → exit 0。
- 负向对照：历史破坏性提交 `a869b8f7` 的消息 → exit 1（缺 `Breaking-Review:`）；合成合法消息 → exit 0。
- parser 边界：`breaking change:` / `Breaking Change:` / 行首缩进 / `*` / `|` / `BREAKING CHANGE 无冒号` 均判破坏性；`Fixes the …` / `Fixes: the …` / `Refs: the …` 作为 note 续行；`Refs: #1` / `Fixes: #1` / `Closes #1` / `Signed-off-by:` 作为 note 结束；URL-only note 通过。

## 6. 回滚

1. revert 本批规范与机检提交，回到「仅 Review Gate」状态。
2. 机检先降为 warning（一个发布周期）再移除；移除后用一笔历史破坏性提交重放消息，确认 exit 0。
3. 历史 `Breaking-Review:` 条目保留，不批量清洗，不 reset / rebase 已推送历史。

## 7. Review Gate

- R1（deep，声明 20 分钟）：**Reject**。blocker RG-B01：守卫只识别行首大写 `BREAKING CHANGE:`，与发布链 parser 的大小写不敏感、前导空白 / `*` / `|` 识别不一致，破坏性提交可静默绕过。
- R2（deep，声明 15 分钟）：**Pass**。RG-B01 关闭；RG-W01 ~ RG-W06 关闭；新增 RG-W07（note 边界）warning。
- R3（standard，声明 8 分钟）：**Pass**。RG-W07 仍有冒号 / 前缀边界 warning；RG-S05 / RG-S07 关闭。
- R4（standard，声明 8 分钟）：**Pass**。RG-W07 空格形式关闭，冒号 prose 仍误杀；RG-S06 提交拆分关闭。
- R5（standard，声明 5 分钟，**显式新增预算**）：**Pass**。RG-W07 全部关闭；最终结论 **Pass**，无遗留阻断项。

用时回填：本批发起前未记录宿主时间戳，无法给出可复算 elapsed；后续批次按 [AI 协作规范 §3.3](../../standards/ai-collaboration.md) 执行。
