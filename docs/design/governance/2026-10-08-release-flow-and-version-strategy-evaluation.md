# 发布机制评估：统一手动发布流与 1.x / 自动化发布

> 创建时间：2026-10-08
> 触发：用户 2026-10-08 指令——① 评估如何把 `npm version` / `pnpm changelog` / `npm publish` / `gh release create` 结合为完整的手动发布流；② 基于已有项目正式接入 caomei-ui，评估是否进入 1.x 正式版（含定时自动化发布）。
> 依据：0.6.0 发布执行记录 [M6-1](./2026-10-08-phase20-m6-1-release-execution.md)；[发布指南](../../guide/release.md)；[版本与兼容策略](../../guide/version-policy.md)；`.github/workflows/release.yml`
> 边界：**只出评估与建议**——不实施脚本、不改 CI、不触碰发布凭据、不发起任何发布动作。实施与否由用户裁定（§6）。

---

## 1. 结论摘要

- **手动发布流（①）**：建议收敛为**单一入口**——把「前置门 → 版本 → CHANGELOG → 发布 → 后校验 → 版本句同步 → GitHub Release」串成一条可复算流程（优先脚本编排，runbook 作说明）。本次 0.6.0 已暴露「命令分散 5 步 + 隐式前置（末尾换行）+ 后置文档同步易漏」三类易错点。
- **1.x（②a）**：**时机尚未成熟，建议暂不进入 1.x**，维持 0.x + 既有冻结窗口。进入条件 = 至少一个下游**全量**稳定消费 + 冻结面逐项确认 + 发布流程自动化就绪。
- **自动化发布（②b）**：建议**分两步**——先「本地手动 + 单命令编排」；再评估「**提交驱动**的 CI 自动发布」（semantic-release + npm Trusted Publisher / OIDC）。**定时（cron）自动发布不推荐**：版本应由提交语义驱动，而非时间（定时至多作「发布就绪度巡检」，不 publish）。

---

## 2. 现状

### 2.1 发布链路现状

| 维度 | 现状 |
|:---|:---|
| 版本推断 | semantic-release（Conventional Commits）；当前**本地手动**，不启用 CI 自动发布 |
| 版本改写 | `npm version <v>`（提交信息为裸版本号 + annotated tag；tag 指向版本提交） |
| CHANGELOG | `pnpm changelog`（`scripts/release/generate-changelog.mjs`，`conventional-changelog-cmyr-config`）——**独立提交** |
| 发布 | `npm publish`（本地手动；`prepublishOnly` 复跑许可校验） |
| GitHub Release | `gh release create`（0.6.0 批次前**从未使用**；该批已回填 6 个，见 §2.2 / [M6-1 §6](./2026-10-08-phase20-m6-1-release-execution.md)） |
| CI | `release.yml`：`push master` → `pnpm verify` + `test:coverage` + `check:coverage`；**publish 步骤保持注释** |
| 凭据 | 本地 `npm` 凭据；CI 未配置 `NPM_TOKEN` / OIDC |

### 2.2 本次 0.6.0 实测步骤（M6-1）

长期任务门槛复核（`d22f034`）→ `pnpm verify` → `npm version 0.6.0`（`5c48387` + tag `v0.6.0`）→ `pnpm changelog`（`b083a53`）→ 本地 `npm publish` → 发布后校验 + 版本句同步（`ead6624`）→ 推送 + GitHub Release 回填 6 个。

### 2.3 痛点

1. **动作分散**：5 个命令跨 3 个工具（npm / pnpm / gh），顺序与互相依赖靠人记。
2. **隐式前置**：`npm version` 依赖「清单文件结尾换行」等格式不变量；本次因 `package.json` 缺末尾换行而被守卫阻断（已由 `check-final-newline` 根治）。
3. **后置易漏**：发布后「文档版本句同步」不在发布命令内，漏做会让 `docs:check:version` / `verify` 变红。
4. **tag 落点歧义**：`npm version` 与 `pnpm changelog` 分两次提交，tag 指向版本提交、CHANGELOG 在其后（属既定正常形态，但需显式说明）。
5. **GitHub Release 手工**：note 需从 CHANGELOG 手工抽取。

---

## 3. 统一手动发布流评估（①）

### 3.1 目标形态（两选项）

| 选项 | 形态 | 优点 | 代价 |
|:---|:---|:---|:---|
| **A. Runbook 收敛** | 把 [发布指南 §3](../../guide/release.md) 重写为**有序检查清单**（前置 / 版本 / CHANGELOG / 发布 / 后校验 / 记录 / 失败恢复） | 零新增代码；可读 | 仍需人工逐步执行；不防漏 |
| **B. 脚本编排（推荐）** | 新增 `scripts/release/manual-release.mjs`（或 `pnpm release:manual`），分步编排 + 门禁 + 交互确认 + 幂等 + 失败恢复 | 单入口、防漏、可机检、复用现有 `scripts/release/*` | 需实现与测试；须处理「发布元数据豁免」边界 |

### 3.2 编排步骤（选项 B 草案）

```
前置门：工作区干净 → master 与 origin 同步 → 长期任务门槛复核已留痕 → pnpm verify exit 0
版本：  npm version <v>（或 --no-git-tag-version + 单次提交）→ 产出 annotated tag v<v>
说明：  pnpm changelog → CHANGELOG 段生成
发布：  npm publish（凭据校验 + prepublishOnly 许可校验）
后校验：registry 版本 / tarball shasum / 解包冒烟 / exports 逐键 / docs:check:version exit 0
同步：  README（中英）+ roadmap 版本句 → 0.6.x；提交
Release：gh release create v<v>（note = 该版本 CHANGELOG 段）→ 置 latest
落盘：  发布执行治理记录 + 推送（需授权）
```

- **tag / 提交次序决策**：既有一 commit 为「version」+ 一 commit 为「changelog」；脚本可选「两步提交（沿用）」或「`--no-git-tag-version` 合并为单次发布提交 + 手动 tag（更紧凑）」。后者需同步修订 [发布指南 §3](../../guide/release.md) 口径。
- **GitHub Release 的 note 抽取**：复用本次 M6-1 的「按版本切 CHANGELOG 段、去标题、排除 `# Unreleased`」逻辑（可下沉为脚本函数，顺带修 B31 的 `Unreleased` 空段残留）。

### 3.3 与守卫的交互

- `check-review-gate-artifacts` 的**发布元数据豁免**覆盖「仅 `package.json` 版本行 + `CHANGELOG.md`」的提交——脚本编排须**保持批次纯净**（不与代码改动同批），否则豁免失效。
- `check-final-newline` 已在 `governance:check` 常驻，杜绝「格式不变量」类隐式前置。

### 3.4 建议

优先 **B**（脚本编排，runbook 作为其文档面）。收益：单入口、可复算、防漏（尤其后置文档同步与 GitHub Release）；成本：一次性实现 + 单测。**不引入新依赖**（用现有 `scripts/release/*` 与 `gh` / `npm` CLI）。

---

## 4. 1.x 与自动化发布评估（②）

### 4.1 前置条件复核

| 前置 | 现状 | 判定 |
|:---|:---|:---|
| 下游**全量**稳定消费 | dependfix `apps/platform` 全量迁移、消费 `0.5.0`（0.6.0 可升级）；momei 仍**部分**迁移、锁 `0.3.0` | ⚠️ 部分成立（1 个全量 + 1 个部分） |
| API 冻结窗口 | [版本与兼容策略](../../guide/version-policy.md) 已声明 0.x 冻结面（组件公开契约 / 子路径导出 / 导出名 / token 名称与语义） | ✅ 已声明 |
| 发布流程自动化 | 本地手动；CI publish 注释 | ❌ 未就绪 |
| 稳定窗口 | dependfix 消费约 1 周（`0.5.0` → `0.6.0`） | ⚠️ 偏短 |

### 4.2 进入 1.x 的含义与代价

- **语义承诺升级**：0.x 冻结面（现为「1.0 前不破坏」）在 1.x 成为**长期兼容承诺**，破坏性变更须 `major`。
- **工具行为**：本仓已有 `v0.6.0` 基线，semantic-release 遇 `BREAKING CHANGE` / `!` 会按 `major` 递增产出 `1.0.0`（`FIRST_RELEASE` 仅在**无基线**时生效，此时连 `fix` 也产 `1.0.0`；见 [发布指南 §2](../../guide/release.md)）；即「1.x」既可由显式决策进入，也可能被一次 breaking 提交意外触发——**须先明确策略**。
- **代价**：冻结面须逐项确认并对外承诺；下游升级路径与弃用策略须配套。
- **收益**：向多个下游提供稳定的依赖目标；配合自动化发布降低发布成本。

### 4.3 自动化发布形态对照

| 形态 | 机制 | 优点 | 代价 / 风险 |
|:---|:---|:---|:---|
| **手动（现状）** | 本地 `npm version` + `changelog` + `publish` | 完全可控、零凭据治理 | 易漏、依赖人工纪律 |
| **提交驱动 CI 自动（推荐演进）** | `release.yml` 放开 publish + semantic-release；npm **Trusted Publisher（OIDC）** 或 `NPM_TOKEN` | 版本 / tag / GitHub Release 全自动；与 Conventional Commits 一致 | 需凭据治理（OIDC 优于静态 token）；须 `pnpm verify` 全绿前置；breaking 会直接升 1.0.0 |
| **定时（cron）自动** | 定时跑发布 | 可作「发布就绪度定时巡检」（不 publish） | **不推荐**（发布本身）：版本应由提交语义驱动而非时间；易产出空版本 / 与提交节奏脱节 |

### 4.4 风险

| # | 风险 | 缓解 |
|:-:|:---|:---|
| R1 | **意外触发 1.0.0**：任一 `BREAKING` / `!` 提交会让 semantic-release 直接升 `1.0.0` | 在决策前用 CI 守卫拦截 `!` / `BREAKING`（或显式确认接收 1.0.0） |
| R2 | **凭据治理**：CI 发布引入 npm 凭据面 | 优先 npm **Trusted Publisher（OIDC）**（无长期 token）；次选受限 `NPM_TOKEN` secret |
| R3 | **下游兼容**：1.x 承诺要求冻结面稳定 | 先逐项确认冻结面；momei 迁移完成后纳入验证 |
| R4 | **发布不可逆**：自动发布出错难回退 | 保留 `npm deprecate` + patch 修复；发布前 `pnpm verify` 常驻 |

### 4.5 建议与待决策

**建议**：**暂不进入 1.x**；本轮先落地「单命令手动流」（§3）；把「CI 提交驱动自动发布」列为**下一阶段候选**，并以「下游全量稳定消费窗口 + 冻结面确认 + 凭据（OIDC）就绪」为闸门。**定时自动发布不采纳**。

| # | 决策点 | 选项 |
|:-:|:---|:---|
| D1 | 统一手动流形态 | ① 脚本编排（推荐）② 仅 runbook ③ 维持现状 |
| D2 | tag / 提交次序 | ① 沿用两步提交 ② 合并单次发布提交 + 手动 tag |
| D3 | 是否进入 1.x | ① 暂不进入（推荐）② 立即进入 ③ 设定闸门后自动进入 |
| D4 | 自动化发布形态 | ① 维持手动 ② 提交驱动 CI 自动（推荐演进）③ 定时 |
| D5 | 凭据形态（若自动化） | ① Trusted Publisher（OIDC，推荐）② `NPM_TOKEN` |
| D6 | 1.x 闸门（若设） | 下游全量消费数 / 稳定窗口 / 冻结面确认清单 |

---

## 5. 质量门

- [x] `pnpm verify` **exit 0**（**114 文件 / 2258 例**；2026-10-08 22:51 ~ 22:55 实跑）
- [x] `lint:md:check` exit 0
- [x] `docs:check:links` exit 0
- [x] `governance:check` exit 0
- [x] 零 `src/**` / 零 `test/**` / 零 CI 配置改动（本记录为纯评估）

---

## 6. Review Gate

（提交前回填。）

---

## 7. 未覆盖边界

- **未实施任何脚本 / 未改 CI / 未改 release 配置**：本记录只出评估与建议。
- **未实测 CI 自动发布**（未放开 `release.yml` publish、未配置凭据）——凭据治理与 semantic-release 在本仓的**启用细节**（根目录 `release.config.js` 已落地 `semantic-release-cmyr-config`；待查 = CI 启用 / 分支资产 / 凭据）须在实施批次补查。
- **未复核 momei 迁移进度**：引用既有记录（部分迁移、锁 `0.3.0`），未取本轮实况。
- **未逐一确认 1.x 冻结面**：冻结面清单见 [版本与兼容策略](../../guide/version-policy.md)，须在进入 1.x 前逐项确认。
