# Phase 34 M3-2：发布前周回归机检（fail-closed）

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M3-2 行；发布侧口径见 [发布指南](../../guide/release.md) §1。

## 1. 交付面（5 文件）

| 面 | 文件 |
|:---|:---|
| 门禁脚本 | `scripts/release/check-weekly-regression.mjs`：查询 `regression-weekly.yml` 在 `master` 上最近一次**已完成**运行，按结论给退出码；`evaluateLatestRun` / `fetchLatestRun` / `resolveRepo` / `runGate` 导出供单测直调 |
| 单测 | `scripts/release/check-weekly-regression.test.mjs`：判定（success 放行、8 种非绿结论与未知值一律判红、无运行、只有进行中、跳过进行中取最近已完成）、`release.yml` 接线（步骤在 Release 之前、含 `pnpm check:weekly-regression`、job 有 `actions: read`）、请求构造与鉴权头、非 2xx、缺 token / 非法仓库标识、退出码 0 / 1 / 2 |
| 工作流 | `.github/workflows/release.yml`：job 增加 `actions: read`；`pnpm i --frozen-lockfile` 之后、安全告警门禁之前插入 `Weekly regression gate` 步骤；头注释补门禁清单 |
| 命令 | `package.json`：新增 `check:weekly-regression` 脚本 |
| 文档 | `docs/guide/release.md` §1：门禁条目下补机检说明（数据源、退出码语义、所需权限、本地复现） |

治理索引、记录本体与规划状态位（`docs/plan/todo.md`）属登记 / 留痕，不计入上表。

## 2. 决策

1. **判定取「最近一次已完成的运行」，不取最新一条**：进行中 / 排队的运行还没有结论。脚本先过滤 `status === 'completed'`，再**显式按 `created_at` 倒序**（同时间按 id 倒序）取第一条——不依赖接口返回顺序，避免代理 / 镜像改写顺序时取到旧结论；`per_page` 取 20，降低「短时间堆叠多条未完成运行」把已完成运行挤出首屏的概率。
2. **结论白名单而非黑名单**：只接受 `success`，其余（含 GitHub 未来新增的结论值）一律判红。登记要求的「伪造非 success 结论必须失败」由 `it.each` 覆盖 8 种结论 + `unknown`。
3. **查询失败与红态用不同退出码**：`1` = 结论非绿 / 无已完成运行；`2` = 配置或 API 错误（缺 `GITHUB_TOKEN`、仓库标识非法、参数非法、`--repo=` 空值、HTTP 非 2xx、响应体非 JSON、网络失败）。两者都让步骤失败，但日志能区分「回归红了」与「门禁本身坏了」，避免把基础设施故障当回归失败去查代码。非 2xx 时带出响应体的 `message`（截断 200 字），使 403 能区分权限不足 / 限流 / 企业策略；参数解析失败不回显 `=` 之后的值，避免误传 token 时写进日志。
4. **缺 token 不回退匿名请求**：匿名请求对私有仓库返回 404，与「没有运行」的读数无法区分；脚本直接以 `2` 失败并点名所需权限，与 `check-security-alerts` 的既有取向一致。
5. **门禁位置在依赖安装之后、安全告警之前**：查询只依赖 Node 内建 `fetch` 与仓库标识，不需要依赖树；放在 `pnpm i` 之后是为了让「缺依赖」这类更基础的失败先暴露，放在安全告警之前是为了让发布前置条件按「回归 → 安全 → 质量门」的顺序短路。
6. **不改发布触发模型与发布链其余步骤**：仍是 `workflow_dispatch`（手动），semantic-release 链路、OIDC 发布与下游 dispatch 均未触碰；新增的只有权限项与一个步骤。
7. **接线用单测守护、不引入 YAML 解析依赖**：仓库无 YAML 依赖，`release.yml` 的结构断言用文本定位（步骤名 → `pnpm check:weekly-regression` → 后续 `name: Release` 的相对位置）与权限项正则；好处是步骤被删 / 被移到发布之后会直接失败，代价是格式改动（如改用 `run: pnpm ...` 多行）需要同步断言。
8. **本地与 CI 同一条命令**：`pnpm check:weekly-regression` 在 CI 用 `secrets.GITHUB_TOKEN`，本地用 `.env.local` 的 `GITHUB_TOKEN`（`loadLocalEnv` 不覆盖真实环境变量）；`--repo` / `--branch` / `--workflow` / `--json` 用于排查。单测注入 `env` 时不读 `.env.local`，避免开发者机器的凭据把「缺 token」用例变成通过。`--json` 的机器可读约定在失败路径同样成立（输出 `{ ok: false, reason }`）。
9. **机检范围只到「结论」**：「发布当周」与「该次运行不早于待发布代码」需要仓库 / 提交上下文，脚本不做年龄阈值或祖先关系判定（固定周期下阈值必然误伤）。这两条仍由发布者按指南 §1 人工核对；非 `--json` 模式打印运行创建时间与链接作为核对输入。边界写进发布指南机检子条目，避免把「门禁已机检」读成「人工前置已取消」。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run scripts/release/check-weekly-regression.test.mjs` → 全绿（`exit 0`） |
| 负向验证 | `failure` / `cancelled` / `timed_out` / `skipped` / `action_required` / `neutral` / `stale` / `unknown` 均判红；无运行与「只有进行中」亦判红；乱序 payload 仍取最新已完成运行；`runGate` 的 `1` / `2` 分支各有用例 |
| 接线守护 | 步骤序断言（`pnpm i` → 门禁 → 安全告警 → Release）、门禁步骤自带 `GITHUB_TOKEN`、`actions: read` 限定在 `release` job 的 `permissions` 块内；任一被改坏即失败 |
| 实机 fail-closed | `node scripts/release/check-weekly-regression.mjs --repo=foo/bar`（环境无 `GITHUB_TOKEN`）→ `ERROR：缺少 GITHUB_TOKEN（需要 actions: read 权限）`，exit 2 |
| 工作流结构 | YAML 解析通过；步骤序为 `pnpm i --frozen-lockfile` → `Weekly regression gate` → `Security alert gate` → …… → `Release`；job 权限含 `actions: read` |
| `pnpm lint` / `pnpm typecheck` | 通过（新增脚本与单测在 ESLint 受检面内） |
| `pnpm verify` | `exit 0`（首次全量跑时 `src/components/data-table/data-table.sorting-multi.test.ts` 的「按住修饰键点击已参与排序的列切换其方向」单例失败；隔离运行该文件通过，复跑全量通过，未改动该文件——按待观察 flaky 登记） |

## 4. Review Gate

- **R1-A（`standard`，A 脚本与工作流）**：`Pass`（0 blocker；3 warning：只判结论不判新鲜度、`completed[0]` 依赖接口排序且 `per_page=5`、接线测试判别力不足（未断言 `GITHUB_TOKEN` / 相邻步骤 / 权限归属）；5 suggest：参数解析在 `try` 外、403 无可行动原因、`--json` 失败路径非 JSON、`--repo=` 空值被忽略、退出码三态合并）。
- **R1-A 修复**：① `evaluateLatestRun` 显式按 `created_at` 倒序、`per_page` 提到 20，并补乱序 payload 用例；② 新鲜度按「机检范围只到结论」处理——指南机检子条目写明「当周 / 不早于待发布代码」仍人工核对，脚本打印运行创建时间，记录 §2 决策 9 登记边界；③ 接线测试改为按 `release` job 与门禁步骤切片断言（`pnpm i` < 门禁 < 安全告警 < Release、步骤含 `GITHUB_TOKEN`、`actions: read` 限定在 `release` job 的 `permissions`）；④ 参数解析移入 `try` 并隐去 `=` 后的值；⑤ 非 2xx 带出响应体 `message`；⑥ `--json` 失败路径输出 `{ ok: false, reason }`；⑦ `--repo=` 空值按配置错误 `exit 2`；⑧ 补「响应体非 JSON → 抛错」与参数 / 空 repo / json 失败路径用例。
- **R1-B（`standard`，记录与索引）**：`Reject`（1 blocker：§4 预写了尚未发生的 B 分区结论，且其指向的「修复项」全是 A 分区修复；3 warning：§3 / §4 保留「见……回填」占位、索引条目缺遗留编号集合、`todo.md` 在 Gate 未闭环时已置「已完成」；1 suggest：§3 的单测读数按用例数记录）。R1-B 修复：删除预写结论并按分区实号记录；回填 `verify` 与复核结论；索引补遗留集合；状态位在 R2 通过后再置「已完成」；§3 改为「全绿（`exit 0`）」。另修复 A 分区建议项的注释陈旧（`evaluateLatestRun` 的 JSDoc 与显式排序口径对齐）。
- **R2（`quick`，A/B 修复点复核）**：`Pass`（0 blocker；B-B1 与 A-W1 ~ W3、A-S1 ~ S5 关闭；2 warning：§3 的 `verify` 行仍是占位且 flaky 未留痕 → 已回填实测与运行备注；2 suggest：请求用例未断言 `per_page=20`、解析失败时 `--json` 仍输出人读文本——前者已在 R2 补齐断言，后者转 follow-up）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | M4-1 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 / F17 | 承接 M1-6 | 见 M1-6 记录遗留节 |
| F18 | 承接 M3-1：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert` | 见 M3-1 记录遗留节 |

## 6. 复查基线

本记录 §1 ~ §5；`scripts/release/check-weekly-regression.mjs` 的判定 / 请求 / 退出码三段与 `runGate` 的 `env` 注入、参数解析、`--json` 分支；`scripts/release/check-weekly-regression.test.mjs` 四个 describe；`.github/workflows/release.yml` 的 `permissions` 与 `Weekly regression gate` 步骤；`package.json` 的 `check:weekly-regression`；`docs/guide/release.md` §1 的机检子条目（含「机检范围」句）。
