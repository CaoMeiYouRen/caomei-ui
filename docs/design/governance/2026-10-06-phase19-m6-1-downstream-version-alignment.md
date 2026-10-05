# Phase 19 M6-1：下游协同版本口径消缺（Backlog §1.8 实测核对与回扫）

> 创建时间：2026-10-06
> 关联条目：[待办事项](../../plan/todo.md) Phase 19 **M6-1**（下游协同口径消缺）
> 依据：[第三轮范围评估 N1](./2026-10-02-next-stage-scope-evaluation.md)；用户 D7 = 下游升级口径重写并纳入 M6
> 边界：只涉及规划 / 治理载体口径；不改 `src/**`、不重写下游仓库。

---

## 1. 结论

- **Backlog §1.8「下游 0.5.0 升级护航」行的重写已在 Phase 19 登记批次（`9613eb5`）就地完成**（就地重写、未迁出候选池），本批为**实测复核 + 同类口径回扫**。
- **两仓实测与行口径一致**（2026-10-06）：dependfix `apps/platform` = `caomei-ui@0.5.0`；momei 根 = `caomei-ui@0.3.0`。
- **活载体旧口径零残留**：`零下游消费` / `均锁` / `代差 3 个 minor` 等旧表述只存在于**点时治理记录**（2026-09-30 / 10-01 / 10-02 评估与处置记录）及其索引摘要，按[规划规范 §9](../../standards/planning.md) 台账指针判据「点时记录保持原样」不回改；规划活载体（`todo.md` / `roadmap.md` / `backlog.md`）与 README 口径均与实测一致。
- 为可审计性，在 §1.8 行补**两仓实测时点**（`〔2026-10-06 实测两仓 package.json：dependfix 0.5.0 / momei 0.3.0〕`），落实「仓库外易变事实须钉测量时点」。

## 2. 实测（2026-10-06）

```sh
node -e "const p=require('/root/projects/dependfix/apps/platform/package.json'); console.log(p.dependencies['caomei-ui'])"  # → 0.5.0
node -e "const p=require('/root/projects/momei/package.json'); console.log(p.dependencies['caomei-ui'])"                    # → 0.3.0
rg -n '"caomei-ui"' /root/projects/momei/package.json /root/projects/dependfix/apps/platform/package.json
```

| 下游 | 载体 | 实测 | 与 §1.8 行口径 |
| --- | --- | --- | --- |
| dependfix | `apps/platform/package.json:48` | `0.5.0` | 一致（「已完成 `0.3.0 → 0.5.0` 升级」） |
| momei | `package.json:118` | `0.3.0` | 一致（「仍精确锁定 `caomei-ui@0.3.0`」） |

## 3. 同类版本口径回扫

| 载体 | 结果 |
| --- | --- |
| `docs/plan/backlog.md` §1.8 | 口径正确（本批补实测时点） |
| `docs/plan/todo.md`（M6-1 条目说明 / 未完成项汇总第 34~35 行） | 一致（「dependfix 已升级 `0.5.0`」「momei 仍锁 `0.3.0`」） |
| `docs/plan/roadmap.md`（§1 现状句 / 阶段表 Phase 13 / 18 / 19） | 无「下游锁定版本」类旧口径；Phase 19 行已写「按 dependfix 已升级 `0.5.0` 重写」 |
| `README.md` / `README.en-US.md` | 只写本仓版本（`0.5.0`），无下游锁定口径 |
| 点时治理记录（2026-09-30 / 10-01 / 10-02 评估与处置记录）及其**索引摘要** | **含旧口径（`零下游消费` 等）属历史快照，按 [规划规范 §9](../../standards/planning.md) 不回改**。索引摘要随其所归属的点时记录同判为快照（三处摘要均带时点框定，如 2026-10-02 摘要显式写「该口径**已滞后**（N1）」），不属 §9 所列需同步的**活载体索引**情形 |

回扫命令：`rg -n "零下游消费|均锁|代差|全部停留" docs README.md AGENTS.md CLAUDE.md`（逐条判定归属，活载体零残留）。

## 4. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm lint:md:check` | exit 0 |
| `pnpm check:governance-records` | OK（记录与索引一致、规划指针无失效） |
| `pnpm check:planning-numbers` | 0 处命中（本批为编号 / 口径回扫，含规划载体面） |
| `pnpm governance:check` | exit 0 |
| 跨仓读取 | **只读**（未写入下游任何文件） |

## 5. 载体与边界

- 载体：本记录 + 治理索引 + `todo.md` M6-1 状态回填 + `backlog.md` §1.8 行（补实测时点）。
- 边界：不重写下游仓库；momei「第六十八阶段」迁移进度引自既有记录（本批未逐项复核其路线图，超出范围）；Phase 8 前置复核仍为「稳定使用窗口不足」（用户 D8 维持不启动，见 `todo.md` 未完成项汇总）。

## 6. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 1 warning / 2 suggest。审计方**独立复跑跨仓实测**（dependfix `apps/platform/package.json:48` = `0.5.0`、momei `package.json:118` = `0.3.0`，均与行口径一致）、核验下游两仓 `git status --short` 为空（**只读零写入**）、`git show 9613eb5` 确认 §1.8 重写来源属实（本批仅补实测时点）、回扫（规划活载体零残留、旧口径仅存点时记录 / 索引摘要）、`check:planning-numbers`（0）/ `check:governance-records`（122/312）/ `governance:check` / `lint:md:check` exit 0。
- **同批收口**：warning ① 「完成态先于 §6 回填」（M4-2 / Step 1.7 首次实际受检）→ 本 §6 回填，与 `todo.md` 完成态同批提交；suggest ① 记录 §3 补索引摘要归为快照的判据来源；suggest ② §4 补 `check:planning-numbers` 行。
- 留痕：`artifacts/review-gate/2026-10-06-phase19-m6-1-downstream-version-alignment.md`（本地态）。
