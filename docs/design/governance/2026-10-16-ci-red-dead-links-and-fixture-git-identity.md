# CI 红处置：治理目录死链与测试夹具 git 身份（两条失败运行）

> 创建时间：2026-10-16
> 来源：用户直接指认的两条失败运行——Release `38769116125` 与 Deploy VitePress site to Pages `38769116087`（同批另有 Test `38769116099`，一并登记）。
> 性质：**缺陷 A（治理目录死链）只读留痕**（已由后续提交修复，本批不复制修复动作）；**缺陷 B（测试夹具 git 身份）本批修复**（1 文件 / +3 −0）。
> 授权：用户 2026-10-16 指认失败运行并要求处置；**不占阶段条目**（插队型 CI 修复，不改 `todo.md` / `backlog.md` / `roadmap.md`）。

## 1. 失败面

三条失败运行均跑在提交 `99891e8`（`docs(plan): Phase 24 部分归档`）；同 commit 起基点的两个依赖 PR 运行亦因同一成因失败。

| 运行 | 工作流 | 失败步骤 | 成因 |
|:---|:---|:---|:---|
| `38769116125` | Release | `Verify quality gates`（`pnpm verify`） | `scripts/docs/check-links.test.mjs` 1 例（仓库现状断言）+ `scripts/governance/check-staging-hygiene.test.mjs` 5 例（夹具无 git 身份） |
| `38769116087` | Deploy VitePress site to Pages | `Check Markdown links` | 缺陷 A（两处死链） |
| `38769116099` | Test | `Governance checks` / `Build docs` | 缺陷 A（`docs:check:links` 与 `docs:build` 两段） |

## 2. 缺陷 A：治理目录相对链接少一级（已由 `e41f63f` 修复）

两处锚点位于 `docs/design/governance/`——该目录比站点根 `docs/` 深两级，书写时按一级深度写了 `../`：

| 位置 | 写入值 | 正确值 |
|:---|:---|:---|
| `2026-10-16-phase24-partial-archive.md` §5 | `../plan/archive/` | `../../plan/archive/` |
| `index.md` 当前条目 | `../plan/todo-archive.md` | `../../plan/todo-archive.md` |

**复现（可复算）**：在 `99891e8` 的独立工作树上跑 `node scripts/docs/check-links.mjs` → exit 1，两条报错与该 commit 的 CI 日志**逐字一致**（含行号 40 / 25）⇒ 该缺陷属**本地可拦**，不属守卫盲区。

**覆盖该形态的三条独立信号**（均已接线）：

- `docs:check:links`——既在本地 `pnpm governance:check` 链内，也在 docs.yml 的 `Check Markdown links` 步骤；
- `pnpm docs:build`——VitePress 对 `docs/` 内越界 / 不存在目标判 dead link，属 `pnpm verify` 链内；
- `scripts/docs/check-links.test.mjs` 的「仓库现状无跨根链接（docs:check:links 全绿）」——把「仓库当前必须全绿」纳入测试面，故 `pnpm test`（含 Release 的 `pnpm verify`）同样会红。

**修复落点**：`e41f63f`（Phase 25 登记批次）把两处改指 `../../`；本批复核现状：`node scripts/docs/check-links.mjs` = OK（395 个 md 的本地链接全部有效）。

## 3. 缺陷 B：暂存区卫生守卫的测试夹具依赖环境 git 身份（本批修复）

### 3.1 症状与根因

`check-staging-hygiene.test.mjs` 的 `createGitRepo()` 只做 `init`，提交身份取自**环境** git 配置。GitHub Actions 运行器的系统账号无可用 ident 信息，`git commit` 直接报：

```
fatal: empty ident name (for <runner@…>) not allowed
```

于是凡走提交的 5 例全挂（5 failed / 22 passed）。本地因可从系统账号回退而得名而长期未暴露——**同一份代码在本地全绿、在 CI 全红**，属典型的「环境依赖型夹具缺陷」。

### 3.2 同仓既有模式对账

全仓 `*.test.*` 中含提交动作的文件共 3 个，另两处**均已**在夹具内显式配置身份：

- `scripts/governance/check-review-gate-artifacts.test.mjs`（`user.email` / `user.name`）；
- `scripts/release/generate-changelog.test.mjs`（同款）；
- `scripts/governance/check-staging-hygiene.test.mjs`（**缺失**，本批补齐）。

`check-final-newline.test.mjs` 只 `init` + `add`、不提交，不需身份 ⇒ 补齐后**未修复同类点为零**。

### 3.3 处置

在 `createGitRepo()` 的 `init` 之后追加两条**仓库本地**配置（不写 `--global` / `--system`，不污染运行器 HOME 与其他夹具），并附一行成因注释。除这 3 行外零改动：断言语义、用例数量（27）、被测脚本 `check-staging-hygiene.mjs` 均不变。

**取舍**：未改 CI workflow 注入 `GIT_AUTHOR_*` / `GIT_COMMITTER_*`——那会把测试对环境的依赖外移，任何缺少该配置的调用方仍会红；夹具自带身份让夹具自洽，且与同仓既有两处写法一致。

### 3.4 判别力实证

以 `user.useConfigOnly = true` + 清空全局 / 系统 gitconfig 模拟「无环境身份」（等价于运行器的空 ident 条件）：

| 时点 | 命令（同一环境） | 读数 |
|:---|:---|:---|
| 修复前 | 定向跑该测试文件 | **5 failed / 22 passed**，报错文案与 CI 同源 |
| 修复后 | 同上 | **27 passed** |
| 修复后 | `scripts/**` 全量 | 38 文件 / 897 例全过 |

## 4. 门禁

### 4.1 审查时点

- `npx eslint scripts/governance/check-staging-hygiene.test.mjs --max-warnings 0` → exit 0；
- 无身份环境定向测试：修复前 5 failed / 22 passed → 修复后 27 passed；
- 常规环境该文件 27 passed；
- `typecheck` 适用性判定：`scripts/**/*.mjs` 不在 `vue-tsc` 的 include 面（`tsconfig.json` 仅 `src/**` / `playground/**` / `test/**`，`tsconfig.node.json` 仅构建配置）⇒ N/A，非缺失。

### 4.2 收口后

- 常规环境全链 `pnpm verify` → exit 0；无身份环境同链 → exit 0，`Test Files 133 passed` / `Tests 2559 passed`；
- `docs:check` 12 段全绿（其中 `docs:check:line-count` 仍报既有 `todo-archive.md` 行数 warning，非本批引入）；
- 缺陷 A 现状复核：`node scripts/docs/check-links.mjs` = OK。

## 5. Review Gate

- **audit-depth**：`quick`（本批零 `src/**` 改动，仅 1 个 `.test.mjs` 夹具 +3 行，属「测试补强」档）。
- **时间盒**：取该档上限；实测起 `2026-10-16T01:33:22+08:00`，返回早于 `01:35:41+08:00` ⇒ **未超时间盒**。
- **R1（`quick`）**：**`Pass`**（0 blocker / 1 warning / 2 suggest）。
  - RG-W1「全链 `pnpm verify` 读数未回填」→ **已关闭**（常规与无身份两环境各跑一次，均 exit 0，读数见 §4.2）。
  - RG-S1 新增两条配置未校验退出码、未复用文件内既有 `git()` 辅助（失败时症状与根因错位；失败模式为响亮失败，非静默通过）。
  - RG-S2 三处夹具重复硬编码同一套身份常量，宜抽共享 helper（属重构，超最小改动范围）。
  - 两条 suggest 均**转 follow-up**，不阻断提交。
- 记录路径：`artifacts/review-gate/2026-10-16-ci-staging-hygiene-fixture-identity.md`（`artifacts/` 本地留存、不入库）。

## 6. 边界与后续

- **未覆盖**：未在真实 GitHub Actions 运行器上执行；以 `user.useConfigOnly = true` + 清空全局 / 系统 gitconfig 等价模拟（`GIT_AUTHOR_*` / `GIT_COMMITTER_*` 优先级高于仓库本地配置，本批不覆盖「CI 显式注入空值 ident 环境变量」的场景，当前无证据表明存在该配置）。未跑 E2E / 视觉基线（零 `src/**`）。
- **未改守卫规则**：本批只补夹具，未改动任何守卫脚本或 CI 配置；缺陷 A 的成因面（相对链接深度）不在守卫盲区，故不新增机检项。
- **待外部触发**：CI 侧复算留待推送后由远端运行验证；本批**未推送**。
