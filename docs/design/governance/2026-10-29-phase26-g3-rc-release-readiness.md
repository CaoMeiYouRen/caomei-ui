# Phase 26 G3：`1.0.0-rc.1` 发布前检查与流程规划

> 日期：2026-10-29
> 依据：[Phase 26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §4.1 G3；[发布指南 §3 / §4](../../guide/release.md)。
> 基线：`af72b2a`（`master` = `origin/master`；工作区干净）。
> 结论：**1 项硬阻塞（npm 凭据）；其余就绪**。API 差分已落为可复算脚本 `check:api-surface` 并用 0.7.0 预演通过。

## 1. 检查结果

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 工作区 / 分支 | 干净；`master`；与远端无领先 / 落后 | `git status --porcelain` 空；`git rev-parse HEAD origin/master` 均为 `af72b2a` |
| CI（HEAD `af72b2a`） | **全绿** | Test 2m05s / Release 3m48s / Security Alerts 29s / CodeQL run `40736337068` 2m08s / Pages 1m40s 均 success |
| 质量门 | 通过 | Release workflow 内含 `pnpm verify` + `test:coverage` + `check:coverage` |
| 安全告警（§2.1） | **通过** | Dependabot open = 1（`deepmerge` **low**，可暂缓）；Code Scanning open = **0**；`SECURITY_ALERTS_TOKEN` 已配置且 workflow 成功 |
| registry 版本 | 未发布 | `latest` = `0.7.0`；`next` 不存在；`npm view caomei-ui@1.0.0-rc.1` → 404 |
| tag / Release | 不存在 | `git tag -l 'v1.0.0-rc.1'` 为空；`gh release view v1.0.0-rc.1` → not found |
| 包内版本 | `0.7.0` | `package.json` |
| 发布时 API 差分 | **就绪（脚本 + 预演）** | `check:api-surface` 预演 0.7.0 tarball vs `af72b2a` 构建：`.d.ts` 194 → 199、**0 删除文件 / 0 删除导出**（328 → 328）、新增 5 个 `index.d.ts`；28 个内容变化 = 26 纯行序 + 1 `data-table` emit 成员顺序 + 1 `index.d.ts` 新增 5 条副作用 import（additive）；`exports` 13 键两版一致。脚本按「文件 + 导出名」比对，覆盖同名导出（如每个 SFC 的 `default`）的单文件删除 |
| npm 凭据 | **不可用** | `npm whoami` → `ENEEDAUTH`（默认 registry = `https://registry.npmmirror.com/`）；`npm whoami --registry=https://registry.npmjs.org` → **401** |

## 2. 阻塞项与未自动化项

### B1（硬阻塞）npm 凭据失效 + registry 指向镜像

- 本机 `~/.npmrc` 的 `registry` 为 **npmmirror**，`npm whoami` 在镜像上返回 `ENEEDAUTH`；改用 npmjs 后返回 **401**，说明 `//registry.npmjs.org/:_authToken` 已失效。
- `manual-release` 的 `preflight` 会执行 `npm whoami`，当前必然失败；即使绕过，`npm publish` / `npm view` 也会落到镜像而非 npmjs。
- **解除条件**（由维护者执行，二者缺一不可）：
  1. 重新登录 / 换新 token：`npm login --registry=https://registry.npmjs.org`（或把有效的 automation token 写入 `//registry.npmjs.org/:_authToken`）；
  2. 发布会话显式指定 registry：`export NPM_CONFIG_REGISTRY=https://registry.npmjs.org`，并确认 `npm whoami` 返回账号、`npm owner ls caomei-ui` 含该账号。

### B2（已就绪）发布时 API 差分

- 新增 `scripts/release/diff-api.mjs`（`pnpm check:api-surface`）：只比对 `.d.ts`，报告删除 / 重命名文件与导出；内容变化列出待人工复核，避免 scoped CSS 哈希文件名造成假阳性。
- 预演（0.7.0 vs `af72b2a`）通过；rc 发布后按 §3.5 在 `bump` 产物上重跑并留痕。

### B3（发布质量，非 rc 阻塞）1.0 里程碑文案与回滚方案未成稿

- `M3-2` 的 1.0.0 里程碑段、known limitations、回滚方案仍待执行；`G4` 要求这些在 1.0.0 前就绪。
- rc 阶段可先发，但发布说明应至少包含：G1-F 可见外观变化（控件边界加深）、`engines >= 22`、DataTable 全选 / lazy / rowKey 行为、主题预设 `sakura` / `forest` / `ink`、token 冻结面 380。
- 回滚方案（rc 级）：`npm deprecate caomei-ui@1.0.0-rc.1 "<原因>"` 并发布 `rc.2`；**不重写已发布版本、不移动已推送 tag**。

### B4（流程约束）`sync` 提交需要新鲜 Review Gate 工件

- `bump` / `changelog` 命中发布元数据豁免，`sync` **不豁免**。
- `sync` 会先写入 README / roadmap、`git add` 后再 commit；若被工件守卫阻断，文件已改并已暂存。恢复路径：**同步后落一份 release Review Gate 工件（mtime 新于文件），再手动执行同一条 `docs(release): sync version statements to 1.0.0-rc.1` 提交**。

## 3. 发布流程（rc，分步执行）

> 全程在 `master`、工作区干净的前提下执行；每个写操作后复核 `git status`。`push` / `tag push` / `npm publish` 均需用户明确授权。

### 3.1 前置（阻塞解除后）

```bash
export NPM_CONFIG_REGISTRY=https://registry.npmjs.org
npm whoami                              # 必须返回 npm 账号
npm owner ls caomei-ui                  # 账号须在维护者列表
SECURITY_ALERTS_TOKEN=<pat> pnpm check:security-alerts   # critical 0 / high 0
```

### 3.2 预检

```bash
pnpm release:manual preflight --version=1.0.0-rc.1 --tag=next
```

通过条件：工作区干净、分支 `master`、`pnpm verify` 绿、覆盖率绿、目标版本未发布、`npm whoami` 成功。实现只会在**领先远端**时提示先推送（不检测落后），发布前自行 `git fetch` 复核。另须先完成「长期任务门槛复核轮」并在 [recurring.md](../../plan/recurring.md) 留痕（`preflight` 只提示、不校验）。

### 3.3 版本与变更日志

```bash
pnpm release:manual bump      --version=1.0.0-rc.1 --yes
pnpm release:manual changelog --version=1.0.0-rc.1 --yes
```

- `bump`：只改 `package.json` 版本行 → `chore(release): 1.0.0-rc.1` → annotated tag `v1.0.0-rc.1`。
- `changelog`：生成 `CHANGELOG.md` 段 → `docs(changelog): 1.0.0-rc.1`。
- 两次提交分别命中发布元数据豁免。

### 3.4 发布与后校验

```bash
pnpm release:manual publish --version=1.0.0-rc.1 --tag=next [--otp=<code>] --yes
pnpm release:manual verify  --version=1.0.0-rc.1 --tag=next
```

- `publish` 必须带 `--tag=next`；预发布不得落 `latest`。
- `verify` 自动断言 `dist-tags.next` = 1.0.0-rc.1、`latest` 无预发布、tarball `dist.shasum` 与 `npm pack` 下载件 sha1 一致、解包版本；**`exports` 只打印键数，需人工比对 = 13**。

### 3.5 发布时 API 差分

```bash
tmp=$(mktemp -d)
npm pack caomei-ui@0.7.0 --registry=https://registry.npmjs.org --pack-destination "$tmp"
tar -xzf "$tmp"/caomei-ui-0.7.0.tgz -C "$tmp"
pnpm build
pnpm check:api-surface --baseline="$tmp/package/dist"
```

判据：脚本 exit 1（删除 / 重命名文件或导出）= **阻塞**；exit 0 但 `changedFiles > 0` 时人工复核——**命中 required 收紧（optional → required）按阻塞处理**，纯类型变化记 warning；`exports` 13 键人工核对。脚本只比对 `.d.ts`，scoped CSS / JS 的哈希文件名不在面内。

### 3.6 版本句同步（含工件恢复）

```bash
pnpm release:manual sync --version=1.0.0-rc.1 --yes
# 若被 check-review-gate-artifacts 阻断（README / roadmap 已写入并暂存）：
# 1) 落 release Review Gate 工件到 artifacts/review-gate/
# 2) 手动提交：
git commit -m "docs(release): sync version statements to 1.0.0-rc.1"
```

### 3.7 推送与 GitHub Release（用户授权）

```bash
git push origin master --follow-tags
pnpm release:manual announce --version=1.0.0-rc.1 --yes
```

- `announce` 要求远端已存在 `v1.0.0-rc.1`；rc 自动带 `--prerelease --latest=false`。
- 推送 tag 会**自动触发**下游兼容 workflow（`push: tags: v*`）；手工 dispatch 仅用于补跑 / 指定版本。

### 3.8 下游复验（M4-1）

```bash
gh run list --workflow=downstream-compat.yml --limit 3
# 补跑 / 指定版本时：
gh workflow run downstream-compat.yml -f caomei-ui-version=1.0.0-rc.1
```

通过条件：一次绿 run，记录下游 revision 与 run 来源（tag 自动 / 手工）；失败则修复后发 `rc.2`，不进入 1.0.0。

### 3.9 G3 收口

- 证据：registry `dist-tags.next`、tarball shasum / 解包 / `exports` 13 键、API 差分输出、下游 run、告警门禁读数。
- 更新门禁表 G3 / `todo` / 记录；此后进入 G4（1.0.0 CHANGELOG 里程碑、release note、回滚方案、用户授权）。

## 4. 当前不能执行的原因

`pnpm release:manual preflight --version=1.0.0-rc.1 --tag=next` 会在 `npm whoami` 处失败；`publish` 会因 registry 指向镜像而不可用。**在 B1 解除前，G3 保持阻塞，不进行任何版本提交 / tag / 发布。**

## 5. Review Gate

- 改动类型：发布就绪评估 + 流程规划 + 门禁 / 规划 / 指南载体（零 `src/**` 零 `test/**`）。
- 最低验证要求：`lint:md` + 链接 / 结构 / 治理记录守卫 + RG。
- audit-depth：**standard**（含定量检查表与外部事实；量化证据已由调用方预核验），时间盒 ≤ 10 分钟。
- 复查基线：`af72b2a` + 本批 7 个 md（6 改 + 本记录）。
- **R1：Reject**（2 blocker / 4 warning / 4 suggest）：B1 G3 判据「发布时 API 差分」缺就绪状态与步骤；B2 证据表 `rev-list` 读数写反（`0dfff98..af72b2a` 实为 2）。W：`verify` 不断言 `exports` 13；preflight 人工确认项未入流程；英文指南未同步；`.session` 未更新。修复：新增 API 差分预演与 §3.5 人工步骤、改用 `--left-right` 读数、修正 `exports` 口径、补门槛复核与 `npm owner`、同步英文指南与 `.session`。
- **R2（`quick` delta）：Reject**（1 blocker / 4 warning / 2 suggest）：B1「发布时 API 差分」的 §3.5 用全量 `diff -rq`，scoped CSS 哈希文件名产生 30 / 35 条假阳性；导出计数口径与命令不一致；`28 个文件仅顺序变化` 的归纳不准确；CodeQL 归属存疑（实测 run `40736337068` 确在 `af72b2a`）；`.session` summary 远端句仍写 `0dfff98`。修复：落地 `scripts/release/diff-api.mjs` + 11 例单测（负向对照），§3.5 改为脚本步骤；读数改为脚本口径（328 导出 / 0 删除）；28 个变化细分为 26 行序 + 1 emit 成员顺序 + 1 additive import；CodeQL 补 run id；`.session` 远端句改 `af72b2a`。
- **R3（`standard` delta）：Reject**（1 blocker / 4 warning / 3 suggest）：新脚本 `REPO_ROOT` 仍少一级（默认 `--current` = `scripts/dist`，§3.5 命令不可复跑）；导出名按全局集合比对，单文件删除同名导出会漏判；`export type {}` 未抽取；`.session` summary 未真正改；required 收紧被误归 warning。修复：`REPO_ROOT` 补 `dirname` + 默认路径断言；改为按「文件 + 导出名」比对；正则兼容 `export type {}`；required 收紧明确为阻塞；`.session` 实测改句；补 15 例单测（重命名 / 同名导出 / 默认路径）。
- **R4（`standard` delta）：Pass**（0 blocker / 0 warning / 3 suggest）。R3 的 1 blocker + 4 warning 全部关闭；3 条 suggest（无变化时尾行文案、R3 台账计数、`export type * from` 前瞻）已同批处理；单测 **16 例**。
