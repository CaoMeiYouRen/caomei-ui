# 任务开局 CI 回执

> 目的：避免在「上一轮推送已把主链路打红」的状态上继续叠加改动。只读检查，不构成质量门或发布门禁。

## 触发条件

同时满足才执行：

- 是新任务（不是上一轮任务的续做）；
- 工作区干净（`git status --porcelain` 为空）；
- 当前没有进行中的任务：`.session/current-task.yaml` 的 `progress.in_progress` 为空，或全部条目以「无」开头；文件不存在按「无进行中任务」处理。

`todo.md` 有未完成条目属阶段常态，不作为跳过依据。

> 判定时点：会话开局读取 `.session` 之后立即执行（`todo-manager` Step 2.1 之后），以该次读取的**开局快照**为准；Step 1.2 的「标记进行中」属于本轮任务写入，不改变本次判定。

## 步骤

1. 取本地 `HEAD` 与上游 `@{u}` 的 sha：
   - 相同：只查一次；
   - 不同（本地领先）：以 `@{u}` 的结果为准，并标注「本地领先 N 个提交，未推送部分无 run」；
   - `@{u}` 不存在：只查 `HEAD`。
2. 按 commit 查询（不按分支名，否则在 feature 分支上看不到对应 run）：

   ```bash
   gh run list --commit <sha> --limit 20 \
     --json databaseId,headSha,workflowName,event,conclusion,url
   ```

3. 在开局 briefing 单列一行：`CI 回执：通过 / 失败（run 链接）/ 无相关 run / 不可用（原因）`。
4. 同一 sha 可能有多条 workflow run：**任一 `failure` / `timed_out` / `startup_failure` 即整体判失败**，并列出全部失败 run 链接。

## 结论映射

| conclusion | 处理 |
| :--- | :--- |
| `success` | 通过 |
| `failure` / `timed_out` / `startup_failure` | 失败，按「处置」处理 |
| `action_required` | 待处理：briefing 标注，不阻断当前任务 |
| `cancelled` / `skipped` / `neutral` / `stale` | 不判定，标注即可 |
| 查不到 run | 写「无相关 run」，**不得**写成通过 |

## 处置

- 只处理**本次推送**引起的失败；历史失败、Dependabot 分支、与本仓改动无关的失败标记「非本次推送」。
- 能直接修的（断言、配置、基线、小范围依赖补丁）在本任务内修掉并说明。
- 失败严重（主链路红、发布或安全门禁阻断）时，先说明失败点、影响面与建议，由用户裁决是否立刻修。
- 一次任务只检查一次，不重复执行。

## 降级与边界

- `gh` 不可用 / 未认证 / 网络失败：记录「CI 回执不可用 + 原因」，继续任务，**不得**视为通过。
- 工作区非空或任务已在进行中：跳过（本条件优先）。
- 不把 CI 回执当成质量门。

## 项目参数

| 参数 | 取值 |
| :--- | :--- |
| 默认分支 | `master` |
| 任务态文件 | `.session/current-task.yaml` |
| 展示位置 | 任务开局首条回复（briefing） |
