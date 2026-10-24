# Phase 26 M1-3 API 表面基线形态评估

> 创建时间：2026-10-24
> 触发：Phase 26 M1-3（[Phase 26 登记批次](./2026-10-22-phase26-registration.md) §2）。
> 性质：**只评估，不落地守卫**；D5 已裁定冻结面执行形态 = 文档声明 + 终审记录 + **发布时与上一已发布版本的 API 差分**，本记录给出该形态的可行性、成本与边界。

## 1. 结论摘要

- **推荐形态：③ 发布时与上一已发布版本做 API 差分**。在发布 `preflight` 阶段对比当前构建产物与 npm 上一已发布版本的 `dist/*.d.ts`，对**删除 / 重命名 / 必填性收紧**判失败，对类型变化判 warning，对新增判通过。
- **① 仅文档声明** 继续作为对外承诺载体（[M1-1 记录](./2026-10-24-phase26-m1-1-freeze-final-review.md) + `version-policy`），但不具备发现漂移的能力。
- **② 提交态快照** 暂不采用：`component-meta.json` 是 gitignored 生成物且包含描述 / 默认值，直接作为基线会带来噪声与维护负担；若未来需要 PR 期拦截，应使用**归一化后的精简快照**，而不是该文件。
- **本批不实现脚本、不加门禁**；实现作为条件候选登记于 [Backlog](../../plan/backlog.md)，触发条件 = M3-1 的 `--tag` 落地后或用户指定。

## 2. 现状取证

### 2.1 现有 API 元数据

- `docs/.vitepress/data/component-meta.json` 由 `pnpm docs:gen`（`scripts/docs/gen-component-meta.mjs`）生成，使用 `vue-component-meta` 从 SFC 抽取 props / events / slots / exposed。
- 规模：**56 个组件 / props 516 / events 85 / slots 70 / exposed 16**；文件约 **189 KB**（2026-10-21 生成物）。
- **gitignored**：`.gitignore` 的 `docs/.vitepress/data` 排除该文件；它不能直接充当提交态基线。
- 内容包含 `description` / `descriptionEn` / `default` 等**易变字段**，每次文案或默认值调整都会产生 diff，不适合作为稳定基线。

### 2.2 现有发布校验

- `scripts/release/manual-release.mjs` 的 `verify` 步骤只校验：registry 版本、tarball shasum、解包 `package.json` 版本、`exports` 键集合（`readUnpackedPackage`）。
- **没有** API 表面校验。`preflight` 的校验面也不止 `pnpm verify`：它还包括工作区清洁强制、分支必须为 `master`、领先 `origin` 的提示、目标版本在 registry 是否已存在的 fail-closed 探测、`npm whoami` 凭据校验；`--dry-run` 会在 `pnpm verify` 之前直接返回。因此若把 API 差分放进 `preflight`，必须明确它位于 `pnpm verify` 之后（依赖新构建的 `dist`），并定义 `--dry-run` 下的跳过行为。
- 发布 tarball 的 `files` = `dist` + `THIRD-PARTY-LICENSES`；`dist/index.d.ts`（约 22 KB）与 `dist/components/*/types.d.ts`、`*.vue.d.ts` 都在包内，具备发布时解析声明文件的条件。

### 2.3 冻结面与执行形态

- M1-1 已冻结组件公开契约、13 键导出、324 个包根导出名、371 个 token、10 语 locale、`InputNumber` step 语义。
- 其中「组件公开契约」「包根导出名」「13 键导出」是可从声明面机械比较的部分；token / locale / step 语义不属于 API 声明差分面，仍由 M1-1 记录与相应守卫承载。

## 3. 三种形态对比

| 形态 | 成本 | 判别力 | 维护负担 | 适用 |
|:---|:---|:---|:---|:---|
| **① 仅文档声明** | 低（零新增代码） | 低：无执行点，漂移只能靠人工比对 | 低 | 对外承诺的最低载体 |
| **② 提交态快照** | 中高（生成器 + 守卫 + 基线文件 + 更新流程） | 高：每次 PR 可拦截 | 中高：基线 churn；需归一化与降噪 | PR 期强约束 |
| **③ 发布时差分** | 中（1 个脚本 + 单测，复用 `typescript`，无新依赖） | 高：发布前拦截真实破坏；不覆盖 PR 期 | 低：无基线文件，按 tag / 版本取上一版 | **推荐** |

### 3.1 仅文档声明

- 形态：M1-1 记录 + `version-policy` 声明冻结面；发布者按清单人工复核。
- 成本：零。
- 判别力：低。没有执行点，删除 props / 改必填性不会被自动发现；适合作为「是什么被冻结」的权威表述，不适合作为「是否被破坏」的判定。

### 3.2 提交态快照

- 形态：把归一化后的 API 表面（根导出名 + 每个组件的 props / events / slots / exposed 名称与 required）写成精简 JSON 入库，PR 时重新生成并比较。
- 成本：新增生成脚本、比较守卫、基线文件与更新命令；基线文件估算 30 ~ 60 KB（仅名称 / required / 类型，不含描述）。
- 判别力：高，能在 PR 期拦截。
- **不推荐现在做**：① `component-meta.json` 是 gitignored 生成物，不能直接复用；② 需要定义归一化规则（类型字符串、默认值、描述全部剔除或规范化），否则每次文案改动都会产生噪声；③ 基线更新会成为高频提交噪音。若未来出现 API 漂移事故，或需要 PR 期强约束，再按此形态立项。

### 3.3 发布时差分（推荐）

**形态**：在 `manual-release.mjs` 的 `preflight`（或新增 `api-diff` 步骤）中，**位置在 `pnpm verify` 之后**（依赖新构建的 `dist`）：

1. 取**上一已发布版本**：按目标 dist-tag 取同通道上一版本（`next` → 上一 `next`；`latest` → 上一 `latest`），`--base=<version>` 仅作覆写。这样 `1.0.0-rc.2` 对比的是 `rc.1`，而不是把 `0.7.0 → rc.1 → rc.2` 合并比较。
2. `npm pack caomei-ui@<base>` 并解包到临时目录（`verify` 已有同类步骤可复用）。
3. 用 TypeScript API 读取两侧的 `dist/index.d.ts` 与 `dist/components/**/*.vue.d.ts` / `types.d.ts`，归一化为：
   - 根导出名集合；
   - 每组件 props（名称 / required / 归一化类型）、events、slots、exposed 名称集合。
4. 比较规则：
   - **删除 / 重命名**根导出、props、events、slots、exposed → **breaking**（exit 1）；
   - **required 收紧**（optional → required）→ **breaking**；
   - **新增**导出 / 可选 props / events / slots → 通过；
   - **类型变化**（归一化后仍不同）→ **warning**，人工确认；
   - 描述 / 默认值 / 文档措辞不参与比较。
5. 输出 `api-diff` 摘要与失败项；不自动修改文件。
6. **例外通道**：安全 / 正确性必须破坏时，按 [M1-1 记录](./2026-10-24-phase26-m1-1-freeze-final-review.md) §3.1 的流程单独决策；实现时提供 `--allow-breaking=<治理记录路径>` 显式覆盖，并在发布日志与记录中留痕，不允许静默绕过。
7. **`--dry-run`**：跳过实际 `npm pack` 与差分并显式打印「dry-run 跳过」，与「无基线跳过」同一约定；正式发布前必须至少跑一次非 dry-run 的差分。若新增独立 `api-diff` 步骤，可用 `release:manual api-diff --version=<v>` 单独执行，不必跑完整 preflight。

**成本估算**：

- 1 个脚本（约 200 ~ 300 行，**原型前估算**；新增的模块解析 / 继承展开可能上调）+ 单测（合成两版声明目录的正反例）；复用 devDependency `typescript`，**零新增运行时依赖**。
- 运行时间约 2 ~ 5 秒（**原型前估算**；比较单元为 95 个 `*.vue.d.ts` + 59 个 `types.d.ts`）；网络仅用于 `npm pack` 上一版本。
- 无基线文件，无日常 churn；发布时才运行。

**判别力与边界**：

- 高：在发布前拦截真实破坏，直接对应 1.x 冻结面。
- 只覆盖**声明面**（类型 / 名称 / required），不覆盖运行时行为（如 DataTable 全选作用域）；行为冻结由测试与 M2 条目承载。
- 依赖上一已发布版本存在；通道首版没有「上一同通道版本」时，可选 `--base=<上一 stable>` 做**一次性对照（advisory，不作门禁）**，或显式声明「首版跳过、自 rc.2 起生效」为既定取舍。
- 声明文本会随 TypeScript / tsdown 版本变化；归一化必须剔除注释、格式化与描述，只比较语义面。

## 4. `component-meta.json` 的限制（必读）

- **gitignored 生成物**：`.gitignore:23` 的 `docs/.vitepress/data` 排除；CI 洁净检出后不存在，必须先生成。
- **包含描述与默认值**：`description` / `descriptionEn` / `default` 会因文案、默认值、格式化变化产生 diff，不能作为稳定基线。
- **体积**：约 189 KB；直接入库会显著增加仓库体积与 review 噪音。
- **结论**：它可以作为**当前工作区的 API 视图**（供文档站与人工核查），但不能直接充当「冻结基线」；若采用 ②，必须另建精简快照。

## 5. 推荐与落地边界

- **采用 ③**：发布时差分，失败条件 = 删除 / 重命名 / required 收紧；类型变化降为 warning。
- **保留 ①**：M1-1 记录与 `version-policy` 继续作为对外承诺；③ 是执行装置，不替代文档。
- **暂不采用 ②**：若未来需要 PR 期拦截，另立精简快照条目，不复用 `component-meta.json`。
- **本批零实现**：不改 `manual-release.mjs`、不加脚本、不加门禁；实现作为条件候选登记于 [Backlog](../../plan/backlog.md)，触发条件 = M3-1 的 `--tag` 落地后或用户指定。

## 6. 验收与复算

| 项 | 命令 / 位置 | 读数 |
|:---|:---|:---|
| `component-meta.json` 规模 | `node -e "console.log(require('node:fs').statSync('docs/.vitepress/data/component-meta.json').size)"` | 189465 B（约 189 KB） |
| 组件 / API 面 | `pnpm docs:gen` 后读取 JSON | 56 / props 516 / events 85 / slots 70 / exposed 16 |
| gitignored | `git check-ignore -v docs/.vitepress/data/component-meta.json` | `.gitignore:23` |
| 现有发布校验 | `scripts/release/manual-release.mjs` 的 `stepVerify` | 仅 exports 键集合 |
| 发布包声明文件 | `package.json` `files` + `dist/index.d.ts` | `dist` 内含 `index.d.ts` 与组件 `*.d.ts` |
| 无新增依赖 | `package.json` `devDependencies.typescript` | 已存在 |

## 7. 非目标与未覆盖边界

- **不落地守卫 / 脚本**：本批只出评估，不修改发布脚本、不加 CI 步骤。
- **不比较运行时行为**：DataTable 全选作用域、事件触发时机等行为不在声明差分面内。
- **不比较 token / locale / step 语义**：这些由 M1-1 记录与相应守卫承载。
- **未实测** TypeScript API 对 `dist/components/**/*.vue.d.ts`（实测 95 个）与 `types.d.ts`（实测 59 个）的 props / emits / slots 抽取效果。实现前须用当前 0.7.0 与 1.0.0-rc 的真实产物做原型验证，并覆盖以下陷阱：
  - **按 `.vue.d.ts` 而非目录归并**：56 个组件目录中包含多个组件（95 个 `.vue.d.ts`），按目录归并会把 props 归错组件或漏掉子组件。
  - **模块解析环境**：上一版 tarball 解包后没有 `node_modules`，`import('vue')` / `import('reka-ui')` 需借用本仓依赖或降级为纯 AST。
  - **接口继承展开**：若走纯 AST，`interface XProps extends FieldProps`（M1-2 记 12 个继承契约）的成员与 required 会被漏读，产生假「props 被删除」；须展开继承链。
- **未评估** ② 的精简快照体积与噪声（仅给出估算）；未来若立项须重新取证。

## 8. Review Gate

- **audit-depth**：`standard`（API 面定量取证 + 发布机制形态推荐与成本判断）；时间盒 ≤ 10 分钟。
- **R1（`standard`）：`Pass`**（0 blocker / 2 warning / 2 suggest），R1 判定「推荐 ③ 与 D5 一致、未把未实现写成已具备、component-meta 限制准确、候选登记有载体」。2 warning / 2 suggest 同批修复：
  - **RG-W1**：§3.3 基线改为按目标 dist-tag 取同通道上一版本（`next` → 上一 `next`；`latest` → 上一 `latest`），`--base` 仅覆写；新增 `--allow-breaking=<治理记录路径>` 例外通道，按 M1-1 §3.1 留痕。
  - **RG-W2**：§2.2 补全 preflight 的实际校验面（清洁度 / 分支 / ahead / 版本冲突 / `npm whoami` / dry-run 早退）；§3.3 明确差分位于 `pnpm verify` 之后。
  - **RG-S1**：比较单元改为 `dist/components/**/*.vue.d.ts` / `types.d.ts`；§7 补三个原型陷阱（按文件而非目录归并 / tarball 无 `node_modules` / 接口继承展开）。
  - **RG-S2**：§6 的 `stat -c` 改为可移植的 `node -e`。
- **R2（`delta`，`quick`）：`Pass`**（4 项全部关闭；0 新增 blocker / warning；3 条 suggest）。时间盒 ≤ 5 分钟，实测约 2 分钟。
  - **RG-S3 ~ S5**（成本估算口径 / 通道首版取舍 / 独立 `api-diff` 入口）：已同批采纳并改写 §3.3，按「已修复未复审」登记。
- **验证证据**：`pnpm lint:md:check` exit 0；`pnpm docs:check` 12 段全绿（含 links / integrity / line-count）；`check:governance-records` / `check:governance-counts` / `check:planning-numbers` / `check:final-newline` / `check:candidate-anchors` exit 0。定量复算见 §6。
- **未覆盖边界**：未跑全量 `pnpm verify` / `docs:build`（零代码、零配置）；未做 TypeScript 抽取原型；未评估 ② 的精简快照体积与噪声。
- **复查基线**：本记录 §1 / §2.2 / §3.3 / §5 / §6 / §7；`docs/plan/backlog.md` §1.6 的 API 表面差分行；`docs/plan/todo.md` M1-3 行与未完成项汇总；`docs/design/governance/index.md` 首条。
