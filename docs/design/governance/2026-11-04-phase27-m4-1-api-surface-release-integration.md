# Phase 27 M4-1：API 表面差分接入发布链交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 M4-1；[API 表面基线形态评估](./2026-10-24-phase26-m1-3-api-surface-baseline-evaluation.md) §3.3。
> 定位：把既有的 `check:api-surface`（`scripts/release/diff-api.mjs`）接入 `manual-release.mjs`，补齐 required 收紧判定，并用 1.1.0 目标版本完成首次真实差分。
> 边界：不改组件 / 类型 / 样式；不改 CI 发布链（M6-3 的发布后 API 校验另条承接）；不发布版本。

## 1. 交付范围

- **`scripts/release/diff-api.mjs`**
  - 新增导出接口 / 类型字面量的成员解析（`extractTypeMembers`）：识别属性、方法、quoted key、泛型默认值；忽略 JSDoc 与行注释。
  - 新增 **required 收紧**判定：同一「文件 + 导出类型 + 成员」由 optional（`?`）变为 required → breaking。
  - 新增**成员删除**判定：非继承、无索引签名的导出类型中成员消失 → breaking；继承类型跳过（成员可能上移到基接口）。
  - 报告新增 `删除成员` / `required 收紧` 行；breaking 汇总口径扩展为「删除 / 重命名 / 成员删除 / required 收紧」。
- **`scripts/release/manual-release.mjs` + `scripts/release/api-diff-step.mjs`**
  - `STEPS` 由 7 步扩为 8 步：`preflight → api-diff → bump → changelog → sync → publish → verify → announce`；`api-diff` 在 `preflight` 之后（依赖 `pnpm verify` 构建的 `dist`），在任何变更型步骤之前。
  - `api-diff` 的取基线 / 解包 / 比较实现独立到 `api-diff-step.mjs`（避免 `manual-release.mjs` 越过 ESLint `max-lines` 1000 行上限），`manual-release.mjs` 只负责接线与步骤顺序。
  - 基线解析 `resolveApiDiffBaseline`：缺省按目标 dist-tag 取**同通道上一已发布版本**（`latest` → 上一 `latest`；`next` → 上一 `next`）；`--base=<version>` 覆写；通道无版本或目标已是通道当前版本时跳过。
  - `fetchApiBaseline`：`npm pack <上一版>` → 解包 → 取 `package/dist`；临时目录在步骤结束时清理。
  - `stepApiDiff`：真实运行遇 breaking 即抛错；`--dry-run` 仍执行只读差分并打印结论（网络 / 基线不可用时降级为提示，不阻断预览）；`--allow-breaking=<治理记录路径>` 须为 `docs/design/governance/` 下的 `.md` 文件且存在，打印解析后路径再放行；`--base` 须为 semver。
  - 分步运行 `api-diff` 使用现有 `dist` 时打印提示；`run` 链由 `preflight` 的 `verify` 构建。
  - 参数：`parseArgs` 新增 `--base` / `--allow-breaking`（空值拒绝）；usage 与文件头步骤清单同步。
- **测试**
  - `scripts/release/diff-api.test.mjs`：新增成员解析、required 收紧、required 放宽、新增 required 成员、非继承成员删除、继承成员删除、类型字面量收紧、报告与退出码用例。
  - `scripts/release/manual-release.test.mjs`：新增 `STEPS` 顺序、`--base` / `--allow-breaking` 解析、基线解析（显式 / 同通道 / 跳过）、`stepApiDiff` 的新增通过 / 删除中止 / dry-run 提示 / 放行路径 / dist 缺失 / 目标同版跳过用例。
- **发布指南**：`docs/guide/release.md` 与 `docs/i18n/en-US/guide/release.md` 同步 8 步流程、`api-diff` 口径、基线选择与例外通道；原 `verify` 步骤中的人工 API 差分说明移除（唯一执行点改为 `api-diff`）。
- **未改**：`src/**`、`test/**`（除脚本测试）、`package.json` 脚本入口、CI 工作流、CHANGELOG。

## 2. 判别口径

| 变更 | 判定 | 依据 |
| --- | --- | --- |
| 声明文件删除 / 重命名 | **breaking** | 既有文件级比较 |
| 导出名删除 / 重命名 | **breaking** | 既有「文件 + 导出名」比较 |
| 非继承导出类型成员删除 | **breaking** | 本批新增；继承类型跳过（成员可能上移） |
| optional → required | **breaking** | 本批新增（接口 / 类型字面量） |
| 新增文件 / 导出 / 成员（含 required 成员） | 通过 | 登记口径「新增不阻断」 |
| 其余声明内容变化 | warning | 报告列出 `changedFiles`，人工复核类型变化 |
| `export * from` | 人工复核提示 | 无法静态展开，报告保留计数 |

## 3. 首次真实差分（1.1.0 目标）

- **命令**：`pnpm release:manual api-diff --version=1.1.0`
- **基线**：`dist-tags.latest` = `1.0.0`（2026-11-04 registry 读数）
- **读数**：

  ```
  [api-diff] 基线 1.0.0（来源：dist-tags.latest）→ 当前 dist
  [api-surface] 基线 199 个声明文件 / 328 个导出；当前 202 / 334
    + 新增文件：components/form/form-item.vue.d.ts
    + 新增文件：components/form/form.vue.d.ts
    + 新增文件：components/form/types.d.ts
    + 新增导出：index.d.ts → CaomeiForm
    + 新增导出：index.d.ts → CaomeiFormItem
    + 新增导出：index.d.ts → FormExposed
    + 新增导出：index.d.ts → FormItemProps
    + 新增导出：index.d.ts → FormItemSlotProps
    + 新增导出：index.d.ts → FormProps
    · 存在声明文件内容变化（构建顺序 / Form 插入导致声明重排，数量随构建批次浮动）
  [api-surface] 通过：无删除 / 重命名 / 成员删除 / required 收紧（内容变化需人工复核）
  ```

> 上表为**写录时点快照**（同一源码在不同构建批次的声明重排数会浮动，本条实测为 11 / 19 / 21），判据只看 breaking 项；复算命令见 §5.1。

- **结论**：exit 0；相对 `1.0.0` 仅新增 Form / FormItem 的 3 个声明文件与 6 个导出，无删除 / 重命名 / 成员删除 / required 收紧；内容变化文件为生成顺序与 Form 插入导致的声明重排，人工复核无成员状态变化。
- **dry-run 全链**：`pnpm release:manual run --version=1.1.0 --dry-run` 依序打印 8 步，`api-diff` 段输出上述差分结论；其余步骤只打印计划动作，未落盘 / 未改 git / 未发布。
- **1.1.0 发布时执行**：M5-1 的发布 run 会再次执行本步骤（CI 发布链的发布后校验由 M6-3 承接）；本条已用目标版本 1.1.0 完成首次真实差分。

## 4. 发布指南同步

- `docs/guide/release.md`：§3 单入口说明补 `--base` / `--allow-breaking`；§3.1 由 7 步改为 8 步并说明 `api-diff` 位置与基线；§3.2 分步清单补 `api-diff`；§3.3 新增第 2 步并顺延后续编号；§3.4 / `npm version` 注的步骤指针同步（第 3 / 5 步）；`verify` 步骤移除重复的人工差分说明。
- `docs/i18n/en-US/guide/release.md`：`Release flow` 的步骤数与 `api-diff` 位置同步；`Pre-release checks` 的 API 差分段改为自动步骤、基线通道、例外通道与 dry-run 行为。
- `scripts/release/manual-release.mjs` 的 publish 版本未就绪提示由「§3.3 第 2 / 4 步」改为「第 3 / 5 步」。

## 5. 验证证据

- `pnpm vitest run scripts/release/diff-api.test.mjs scripts/release/manual-release.test.mjs` → **exit 0**。
- `pnpm test` → **exit 0**。
- `pnpm docs:check` → **exit 0**。
- `pnpm lint:md:check` → **exit 0**。
- `pnpm check:planning-numbers` → **exit 0**（脚本注释不含规划编号）。
- `pnpm verify` → **exit 0**（含 lint / typecheck / test / build / docs:build / governance:check）。

### 5.1 复算入口

```bash
pnpm vitest run scripts/release/diff-api.test.mjs scripts/release/manual-release.test.mjs
pnpm verify
pnpm release:manual api-diff --version=1.1.0
pnpm release:manual run --version=1.1.0 --dry-run
```

- 首次真实差分（1.1.0 目标）：`pnpm release:manual api-diff --version=1.1.0` → exit 0（仅新增，无 breaking）。
- dry-run 全链：`pnpm release:manual run --version=1.1.0 --dry-run` → 8 步顺序正确且 `api-diff` 段输出差分结论。

## 6. Review Gate

- **audit-depth**：`standard`（脚本逻辑 + 发布链顺序 + 判别口径 + 文档指针对账；时间盒 ≤ 10 分钟；批次 B 按代码 / 文档两分区并行，每区 ≤ 8 分钟）。
- **批次 A（检测能力，提交 `f39f613`）**：
  - **R1（`standard`）：`Reject`**（1 blocker / 4 warning / 3 suggest）——元组标签被误判为索引签名，导致成员删除静默放行；已修复。
  - **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 2 非阻塞 suggest）。
- **批次 B（发布链接线与文档；B1 代码 / B2 文档并行）**：
  - **B1 R1（`standard`）：`Pass`**（0 blocker / 6 warning / 6 suggest）；W1 / W2 / W3 / W5 / W6 与 S1 / S3 / S4 / S5 已同批修复，W4（共享进程助手）登记后续。
  - **B1 R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 4 非阻塞 suggest；含临时目录失败路径清理与 dist-tags 非字符串值补测）。
  - **B2 R1（`standard`）：`Reject`**（2 blocker / 3 warning / 4 suggest）——`todo.md` 状态早于 RG、记录复述门禁读数且含过期计数；已修复。
  - **B2 R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 3 非阻塞 suggest；记录读数已改为命令 + exit 0，指南编号与英文链接已同步）。
- **复查基线**：HEAD `f39f613` + 暂存区（索引版）。

## 7. 未覆盖边界

- 只比较**声明面**；运行时行为（如 DataTable 全选作用域）、token / locale / `step` 语义不在本差分面。
- 继承导出类型的**成员删除**不判定（成员可能上移到基接口）；required 收紧仍按基接口自身比较。
- `export * from` 无法静态展开，只报告计数并提示人工复核。
- `--allow-breaking` 是显式例外通道：路径须落在 `docs/design/governance/` 下、为 `.md` 文件且存在；步骤打印解析后的相对 / 绝对路径留痕。未提供或路径不合法时 breaking 一律中止。
- 未改 CI 发布链：`semantic-release` 发布后的 API 差分校验由 M6-3 承接；本条的 `manual-release` 集成是本地发布 / 回退路径。
- 分步运行 `api-diff` 使用工作区现有 `dist`：步骤会打印「请确认已 build」提示；`run` 链由 `preflight` 的 `verify` 构建。`--dry-run` 同样使用现有 `dist` 并显式提示可能与当前源码不一致。
- `run` / `capture` / `parseDistTags` 在 `manual-release` 与 `api-diff-step` 各有一份实现（行为当前一致，OTP 脱敏只在前者）；共享进程助手抽取登记为后续治理项，不在本条扩张。
- 新增 required 成员按登记口径属「新增不阻断」；**可实现导出接口的下游**需自行评估该变更对其实现的兼容性。
- 未执行 1.1.0 真实发布；发布 run 与下游复验在 M5-1 / M6 留痕。
