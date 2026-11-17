# Phase 36 M3-2 交付记录：依赖告警复核（`deepmerge`）

> 创建时间：2026-11-17
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M3-2。本记录只承载复核读数、利用路径与复查触发条件。

## 1. 读数（2026-11-17）

| 查询 | 读数 |
|:---|:---|
| `state=open` | **0** |
| `state=fixed` | 70 |
| `state=dismissed` | 0 |
| `state=auto_dismissed` | 1（`glob` medium，2026-11-02 自动关闭） |

- **查询口径**（参照 [安全规范 §2](../../standards/security.md) 的检查入口形态（分页），避免默认分页截断）：`gh api --paginate "repos/CaoMeiYouRen/caomei-ui/dependabot/alerts?state=<s>&per_page=100"`；首轮读数曾用未分页命令得到 `fixed` 30（首页截断），已按口径更正为 70。

- **`deepmerge` 四态均无记录（观测事实）**：`open` / `fixed` / `dismissed` / `auto_dismissed` 逐态检索均无该包；**消失成因未取证**（可能是 advisory 撤回、依赖图重算或记录删除），本记录不据此断言「已修复」。此前[第二十轮范围评估](./2026-11-16-next-stage-scope-evaluation-20.md)的「open 1 low（`deepmerge`）」为 2026-11-16 时点值，按历史快照保留、不回改。

## 2. 利用路径

- `pnpm why deepmerge` → `deepmerge@4.3.1`，链路 `nuxt@4.6.4 → @nuxt/nitro-server@4.6.4 → nitropack@2.13.6 → @rollup/plugin-node-resolve@16.0.3 → deepmerge`，落在 **devDependencies**。
- 库产物只打包 `src/`（tsdown），`deepmerge` 不进入发布产物，消费方运行时零暴露。

## 3. 结论与复查触发

- **结论**：维持「接受并登记」的处置不变——四态均无告警记录（观测事实，成因未取证），依赖仍留在开发工具链；不升级 major（`4.3.1` 已是 4.x 线，且无告警驱动）。
- **复查触发条件**：① `deepmerge` 重新出现在 open 告警；② `nuxt` 大版本升级导致该链路变化；③ 依赖安全巡检（12:00 任务）发现新的 open 告警。
- 不新增运行时依赖、不改锁文件。

## 4. Review Gate

- **R1（`quick`）**：Reject —— 1 blocker（`fixed` 读数 30 为默认分页首页截断，按 `--paginate … per_page=100` 实测为 70）/ 1 warning（「告警已消除」把观测写成成因）/ 1 suggest（依赖链路漏 `@nuxt/nitro-server` 一层）。
- **R2（`quick`）**：Reject —— 2 blocker（记录回链写成 `../standards/security.md` 致 `docs:check:links` 失败；记录未入治理索引致 `check-governance-records` 失败）/ 2 warning（§2 口径外推、预写 Gate 结论）。
- **R3（`quick`）**：Pass —— 回链改 `../../standards/security.md`、索引补行、口径改为「参照检查入口形态」、Gate 结论按实际轮次回填。
