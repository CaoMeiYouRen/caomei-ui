# Phase 27 M4-4 依赖告警收口交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 的 M4-4；范围依据见[第十一轮范围评估](./2026-11-03-next-stage-scope-evaluation-11.md) §2 D-4。
> 定位：Phase 27「机制与质量收口」第 4 条的交付记录；本记录是处置结论、证据与残留项的唯一载体。

## 1. 处置结论

| 告警 | 级别 / 作用域 | 处置 | 证据 |
| :--- | :--- | :--- | :--- |
| `minimatch`（Dependabot #71） | medium / development | **部分覆盖 + 留痕**：`minimatch@<11.0.1: ^11.0.1` 覆盖 eslint / lint-md / editorconfig / glob 10 / glob 13 等消费链（解析 **11.0.4**）；`commitizen@4.3.2 → glob@7.2.3` 依赖 minimatch 3 的内部字段（`_glob`），以 `glob@7>minimatch: 3.1.5` 保留，**该链仍会返回 medium 告警** | `pnpm why minimatch` → 11.0.4 + 3.1.5（仅 glob@7）；`pnpm exec cz --help` 不再崩溃（exit 1 为「无暂存文件」的既有行为） |
| `deepmerge`（Dependabot #69） | low / development | **维持留痕**：上游最新仍为 **4.3.1**，公告要求 ≥ 4.3.2（未发布），无可用的修复版本 | `npm view deepmerge version` → 4.3.1；`npm view deepmerge versions` 无 4.3.2 |
| `glob`（仅 `pnpm audit` 新发现） | moderate / development | **不跨 major 覆盖、登记候选**：Dependabot 未登记；覆盖到 14.0.2 属跨 major（7 / 10 / 13 → 14），影响四条消费链；未验证前不引入 | 已登记 [Backlog §1.6](../../plan/backlog.md)；`glob@7.2.3` 不在公告区间 |

- **零运行时改动**：三项均为 development 作用域，不进入发布产物。
- **发布不阻塞**：`Security Alerts` 门禁对 critical / high 阻断；当前 critical 0 / high 0。
- **候选池时点**：2026-11-04 新增 `glob` 候选后，§1 在册候选 **33 → 34**（[Backlog §1.6](../../plan/backlog.md)）；Phase 27 登记时的 33 为 2026-11-03 时点值，不回改。

## 2. 现状取证（2026-11-04）

- Dependabot open 告警：`gh api repos/CaoMeiYouRen/caomei-ui/dependabot/alerts?state=open` → **2 项**（#71 `minimatch` medium、#69 `deepmerge` low，均 `development`）。
- `pnpm audit --registry=https://registry.npmjs.org`（默认镜像无 audit 端点）：
  - 处置前：**2 moderate + 1 low**（`minimatch`、`glob`、`deepmerge`）；
  - 处置后：**2 moderate + 1 low**（`minimatch` 仅剩 commitizen / glob@7 链、`glob`、`deepmerge`）。
- `pnpm why minimatch`：覆盖前 **3.1.5**（eslint / commitizen→glob 7 / editorconfig / readdir-glob 等 dev 链）；覆盖后 **11.0.4** 为主，`glob@7.2.3` 下保留 **3.1.5**。
- `pnpm why deepmerge` → 4.3.1（唯一版本，`nuxt → nitropack → @rollup/plugin-node-resolve`）。

## 3. 兼容性实证（override 可用的判据）

| 检查 | 结果 |
| :--- | :--- |
| `pnpm install --frozen-lockfile` | exit 0 |
| `pnpm lint:check`（eslint 链，`minimatch` 的主要消费者） | exit 0 |
| `pnpm lint:md:check`（`@lint-md/cli` → glob 13 → minimatch 11） | exit 0 |
| `pnpm typecheck` | exit 0 |
| `pnpm docs:check` | exit 0 |
| `pnpm test` | **147 文件 / 2927 passed** |
| `pnpm test:nuxt-smoke`（Nuxt 构建 + `@vercel/nft` / `archiver-utils` / glob 链） | exit 0 |
| `pnpm exec cz --help`（commitizen → glob 7 → minimatch 3.1.5） | 不再出现 `charAt` 崩溃；exit 1 为无暂存文件的既有提示 |

- 结论：`minimatch@11` 在 eslint、lint-md、类型检查、单元测试与 Nuxt 构建链上均可用；`glob@7` 通过 parent 选择器保留 3.1.5，commitizen 的核心 `glob.sync` 路径恢复可用（修复前全局覆盖会抛 `Cannot read properties of undefined (reading 'charAt')`）。
- 依赖链接核验：`node_modules/.pnpm/glob@7.2.3/node_modules/minimatch → minimatch@3.1.5`；`glob@10.5.0` / `glob@13.0.6` / `editorconfig` → `minimatch@11.0.4`。
- **证据环境边界**：本机 `node_modules/.pnpm` 仍留有历史版本的物理目录（`pnpm prune` 不清除），但上表核验的**链接解析**均指向 lockfile 版本；未在洁净检出上重跑全矩阵。

## 4. `glob` 候选（不在本条修复面）

- 公告：GHSA-3g3m-2fjr-6pw4（`glob >=9.0.0 <=14.0.1`）。
- 当前树：`glob@7.2.3`（commitizen，**不在公告区间**）/ `glob@10.5.0`（archiver-utils）/ `glob@13.0.6`（`@lint-md/cli` / `@vercel/nft` / js-beautify）。
- 不做 override 的原因：跨 major 且 14.x 的模块形态 / 引擎要求变化会影响受影响链；未实证前引入属于「不可用 override」风险。
- 已登记 Backlog，触发条件 = 上游支持 `glob ≥ 14.0.2` 且本仓 `lint:md` / `docs:build` / `test:nuxt-smoke` 全绿。

## 5. 验证证据

- `pnpm check:security-alerts` → critical 0 / high 0 / medium 1 / low 1（open 2 / dismissed 0），无阻塞；`minimatch` 条目在推送并由 Dependabot 重解析前仍会显示。
- `pnpm audit --registry=https://registry.npmjs.org --json` → `{ low: 1, moderate: 2 }`（`minimatch` / `glob` / `deepmerge`）。
- `pnpm why minimatch` → 11.0.4（多数消费链）+ 3.1.5（仅 `glob@7.2.3`）；`pnpm why deepmerge` → 4.3.1。
- `pnpm install --frozen-lockfile` / `pnpm lint:check` / `pnpm lint:md:check` / `pnpm typecheck` / `pnpm docs:check` / `pnpm test` / `pnpm test:nuxt-smoke` → 全 exit 0。
- 锁文件变化：`git diff --numstat` → **+29 / −44**；`minimatch@3.1.5` 保留 2 处包条目 + 5 处依赖引用（仅 `glob@7.2.3` 链）。

## 6. Review Gate

- **audit-depth**：`standard`（依赖覆盖 + lockfile + 规划载体 + 治理记录；影响 dev 工具链与发布安全门禁）；R2 为 `quick` delta。时间盒：R1 ≤ 8 分钟，delta ≤ 4 分钟。
- **R1（`standard`）：`Reject`**（2 blocker / 4 warning / 2 suggest）——blocker：全局 `minimatch` override 破坏 `commitizen → glob@7` 的 `glob.sync`（`charAt` 崩溃）、`backlog.md` §1.6 表格列结构被破坏；warning：锁文件数字不符、候选计数无新时点、实证面夸大、残留虚拟仓；suggest：glob 事实精度、补 CVE。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning；R1 的 2 blocker / 4 warning / 2 suggest 全部关闭或按边界声明收口；R2 新增的 1 条历史描述已在本节定稿前修正）。
- **用时实测（宿主时钟）**：R1 发起 `2026-11-04T13:13:44Z`、返回 `13:22:24Z` ≈ **8 分 40 秒**（**超时间盒 40 秒**；原因为审计方独立复现 `glob@7` 崩溃与列结构核验）；R2 发起 `13:32:27Z`、返回 `13:35:32Z` ≈ **3 分 5 秒**（≤ 4 分钟）。
- **复查基线**：`pnpm-workspace.yaml`、`pnpm-lock.yaml`、`docs/plan/backlog.md`、本记录、`docs/design/governance/index.md`。

## 7. 未覆盖边界

- Dependabot 的 `minimatch` 告警需**推送后**由 GitHub 重新解析 lockfile 才会更新；本条只保证本地解析层「除 commitizen 外」清零，**不宣称** #71 已关闭。
- `commitizen → glob@7 → minimatch 3.1.5` 为有意保留（跨 major 覆盖会破坏 `glob.sync`）；再评估触发 = commitizen 支持 glob ≥ 9 / minimatch ≥ 11。
- `deepmerge` 无已发布修复版本，维持 low 风险；再评估触发 = 上游发布 ≥ 4.3.2。
- `glob` 为 audit-only 新发现，不在 Dependabot 面板；未做 14.x 兼容性实证。
- 未在洁净检出上重跑全矩阵；本地树存在历史 `.pnpm` 物理目录（链接解析已核验）。
