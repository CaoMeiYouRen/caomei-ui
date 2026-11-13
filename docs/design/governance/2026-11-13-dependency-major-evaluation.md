# 直接依赖大版本升级评估

> 创建时间：2026-11-13
> 读数时点：2026-11-13（registry `dist-tags`，时点快照，随上游发布变化）。
> 触发：日常巡检读取 `pnpm check:outdated-major`（同日改为 registry 源，读数由超时变为秒级）发现 7 个包（6 组，`vitest` 与 `@vitest/coverage-v8` 配对）落后一个 major。
> 依据：[规划规范 §3 / §4](../../standards/planning.md)（评估只产出结论与候选，不登记阶段、不分配条目编号）。
> 结论落地为 [Backlog §1.6](../../plan/backlog.md) 的候选行；本记录是一次性评估载体，不随阶段归档。

## 1. 取数口径

- 受检面：`package.json` 的 `dependencies` / `devDependencies` / `peerDependencies` / `optionalDependencies`，去重后 52 项。
- 判定：major 不同，或 `0.x` 之间 minor 不同；`0.x` 的 patch 不算（`tsdown` / `@tsdown/css` 0.23.0 → 0.23.7 属 patch，随常规依赖 PR 合入，不在本记录范围）。
- 可复现命令：

```bash
pnpm check:outdated-major                 # 默认 registry 源
pnpm check:outdated-major --source=pnpm   # 与 pnpm outdated 对齐的旧口径
```

- 端点跟随本机配置：本仓无 `.npmrc`，本机用户级 `.npmrc` 指向 `registry.npmmirror.com`；CI 与发布使用官方 `registry.npmjs.org`。
- **镜像差异（本机操作注意）**：`fontkit@3.0.0` 依赖 `dfa@^2.0.0`，官方 registry 已有 `dfa@2.0.0`，镜像 `latest` 仍为 `1.2.0`，因此在镜像下端安装会 `ETARGET`；核验或安装该类新版本须显式 `--registry=https://registry.npmjs.org`。

## 2. 逐项判定

| 依赖 | 当前 → 目标 | 上游破坏性面 | 结论 |
|:---|:---|:---|:---|
| `typescript` | 6.0.3 → 7.0.2 | 原生编译器；npm 包根导出仅 `version` / `unstable/*` | **阻塞** |
| `eslint` | 9.39.2 → 10.14.0 | 移除 eslintrc、收紧 RuleTester、Node 要求提升 | 可升级（需全量实跑） |
| `stylelint` | 17.16.0 → 18.0.0 | 13 项破坏性变更（移除规则 / 选项 / `context.fix`） | 可升级（配对配置包） |
| `vitest` + `@vitest/coverage-v8` | 4.1.12 → 5.1.0 | 默认每例前清 mock、异步断言未 await 判失败、移除废弃入口 | 可升级（需全量实跑） |
| `fontkit` | 2.0.4 → 3.0.0 | ESM-only、Node 22+、条件导出 | 可升级（低风险） |
| `conventional-changelog` | 7.2.1 → 8.1.3 | writer 9 的模板 API 变更 | **维持阻塞**（既有候选） |

### 2.1 `typescript` 7.0.2：阻塞于工具链 API

- 实测：临时安装 `typescript@7.0.2` 后 `require('typescript')` 仅导出 `version` / `versionMajorMinor`，`createProgram` 与 `sys` 均为 `undefined`；包 `exports` 只提供 `./unstable/*`（`ast` / `sync` / `async` / `fs`）等新入口。
- 本仓链路：`vue-tsc@3.3.14` 的入口直接使用 `ts.run` / `ts.sys`，`pnpm typecheck` 依赖它；`tsdown@0.23` 的 peer 虽放宽到 `^7.0.0`，但声明式 API 迁移仍需上游完成。
- 结论：维持 `typescript@6.0.3`。解除条件 = `vue-tsc` 与 `tsdown` 声明支持 TS 7 的原生 API 且本仓 `pnpm typecheck` / `pnpm check:nuxt` / `pnpm build` 全绿；或本仓改走 `tsgo` 路线并给出等价类型检查证据。

### 2.2 `eslint` 10.14.0：配置链可运行，需全量验证

- 上游破坏性面（v10.0.0）：移除 eslintrc 支持、移除 `SourceCode` / 规则 `context` 的废弃方法、RuleTester 断言收紧、`eslint:recommended` 更新、Node `^20.19.0 || ^22.13.0 || >=24`。
- 最小探针：临时工程安装 `eslint@10.14.0` + `eslint-config-cmyr@2.3.1` + `eslint-plugin-vue@10.12.0` + `typescript@6.0.3`，用本仓同款 `eslint-config-cmyr/vue/strict` 预设对含故意违规的 `.ts` / `.vue` 取样，`vue/padding-line-between-blocks` 与 `@typescript-eslint/no-unused-vars` 均正常报错，无插件 API 崩溃。
- 依赖面：`eslint-config-cmyr@2.3.1` 的 peer 为 `eslint >= 9`，其 `typescript-eslint ^8.59.4` 在仓库锁为 `8.70.0`、探针解析 `8.72.2`（peer 均允许 `eslint ^10`），`@stylistic/eslint-plugin@5.10.0` 亦声明 `^9 || ^10`。
- 结论：可升级。验收 = `pnpm lint:check`（`--max-warnings 0`）零 error / 零 warning，且配置规则集不变（不放宽、不新增 ignore）。

### 2.3 `stylelint` 18.0.0：与配置包配对升级

- 上游破坏性面：移除 `declaration-block-single-line-max-declarations` 规则、`selector-max-specificity` 的 `ignoreSelectors`、`context.fix`；CLI 改用 `node:util.parseArgs`；移除全局 `node_modules` 解析。
- 配对要求：`stylelint-config-cmyr@1.1.0` 的 peer 为 `stylelint ^18.0.0`；当前安装的 `1.0.0`（peer `>=16`）属旧线，须同一批次升级。
- 最小探针：临时工程 `stylelint@18.0.0` + `stylelint-config-cmyr@1.1.0` + `postcss@8.5.32` 对含重复属性与颜色简写的 CSS 取样，`declaration-block-no-duplicate-properties` / `color-hex-length` 正常报错；配置包未引用被移除的规则 / 选项。
- 结论：可升级。验收 = `pnpm lint:css:check` 零 error，SCSS 语法与 `docs/**` 受检面均未缩面。

### 2.4 `vitest` 5.1.0 + `@vitest/coverage-v8` 5.1.0：版本必须配对

- **证据等级：未做探针，仅静态核对**（版本要求与本仓 API 使用面）。
- 上游破坏性面（v5.0.0）：要求 Node `^22.12 || ^24 || >=26`、Vite `^6.4 || ^7 || ^8`（本仓 Node 24 / Vite 8 满足）；默认每个测试前清 mock；异步断言未 await 判失败；移除 `sequential`、废弃入口与 `@vitest/runner` 发布；`toHaveTextContent` 收紧；`expect.poll` 超时判失败。
- 本仓受影响面排查：未见 `test.each` / `test.for`、未见 `vitest/suite` 等废弃入口、本仓无 `toHaveTextContent` 使用；`src/nuxt/module.test.ts` 与 `test/a11y/a11y.test.ts` 已有显式 `vi.clearAllMocks()` / 工厂 mock，行为与「默认清 mock」不冲突。
- 结论：可升级，但必须整包实跑。验收 = `pnpm test` 与 `pnpm test:coverage` 全绿（覆盖率口径不变），`maxWorkers: 4` 的并发兜底仍生效。

### 2.5 `fontkit` 3.0.0：低风险，注意安装源

- 上游：ESM-only、Node 22+、Node / 浏览器条件导出、新增 `fontkit/core` 模块化入口。
- 本仓用法：`test/visual/font-coverage.ts` 动态 `import('fontkit')` 后调用 `openSync` 与 `hasGlyphForCodePoint`；实测 3.0.0 主入口仍导出 `openSync` / `create`，调用面不变。
- 类型：`fontkit@3.0.0` 不自带类型，`@types/fontkit` 最新仍为 `2.0.9`；被使用的 `openSync` 签名未变，风险集中在未使用的格式 / 字形 API。
- 结论：可升级。验收 = `pnpm test:visual` 字体覆盖用例通过；安装源须为官方 registry（镜像缺 `dfa@2.0.0`）。

### 2.6 `conventional-changelog` 8.1.3：维持阻塞

- 既有候选的触发条件未变：preset `conventional-changelog-cmyr-config` 最新仍为 `3.0.0`，writer 9 下出现 `headerPartial is not a function`。
- 复核：本次仅确认版本读数（当前 `7.2.1` / 目标 `8.1.3` / preset `3.0.0` 未变），未再实跑 `pnpm changelog`。
- 结论：维持 7.2.1，触发条件 = preset 发布支持 writer 9 的新版且 `pnpm changelog` 无模板报错。

## 3. 建议批次与顺序

1. **低风险配对批**：`stylelint` 18 + `stylelint-config-cmyr` 1.1、`fontkit` 3。改动面为 devDependencies 与配置包版本，验证 `lint:css:check` / `test:visual`。
2. **测试与静态检查批**：`vitest` 5 + `@vitest/coverage-v8` 5、`eslint` 10。验证 `pnpm test` / `test:coverage` / `lint:check`，失败即单项回退。
3. **阻塞项**：`typescript` 7 与 `conventional-changelog` 8 维持候选，等上游解除条件，不设时间点。

批次共同约束：

- 逐项独立提交、不合批提交；任一项失败先回退该项，不用放宽规则 / 跳过测试换取绿灯；升级后重跑 `pnpm check:outdated-major` 留读数。
- **Node 下限先核对**：`stylelint@18` / `vitest@5` 与配对包 `stylelint-config-cmyr@1.1.0` 的 `engines` 下限高于本仓 `package.json` 的 `engines.node >= 22` 声明（其中 `stylelint-config-cmyr@1.1.0` 最严），批次前须确认 CI 与本地实际 Node 满足各包下限（当前本地 24.22 满足）。

## 4. 非目标

- 本轮不实施任何升级，不改 `package.json` 与 `pnpm-lock.yaml`。
- 不引入 TS 7 / `tsgo` 试验分支，不改 `tsconfig` 目标与 `moduleResolution`。
- 不因升级调整公共 API、构建产物形态或发布流程。

## 5. 已知边界

- 上游破坏性面依据各仓库 v10 / 18 / v5 / v3 的发布说明与最小探针；全量行为以批次实跑为准。
- 探针工程只验证「配置可加载、规则可触发」，不覆盖全仓规则命中差异。
- 扫描面只有直接依赖；overrides 与传递依赖归安全告警与 `pnpm why`。
- 镜像 `latest` 可能滞后官方（本次 `dfa@2.0.0` 即为例），跨源核对须显式指定 registry。

## 6. Review Gate

- 轮次与结论：`quick` R1 **Reject**（唯一 blocker：声明范围与实际工作区不符，脚本批已拆出并独立提交 `81ccfbc`）→ R2 **Pass**（0 blocker / 1 warning / 4 suggestion）。R1 的 W1 ~ W4 与 S1 ~ S4 已修复；R2 的 warning（本节回填）与 S1 ~ S3 在提交前收口，S4 的索引指针体例一并统一。
- 通过条件：文档事实与 registry 读数一致，证据等级未抬高（`vitest` 5 明确标注仅静态核对），候选触发条件可观测，版本号口径唯一。
- 复查基线：`pnpm check:outdated-major` 的 7 项读数、`rg -n '7\.2\.0' docs/guide/release.md` 零命中、`pnpm lint:md:check` + `check-governance-records` + `check-governance-counts` + `check-planning-numbers` 全绿。
- 变更面：本记录 + [Backlog §1.6](../../plan/backlog.md) 行 + 治理索引条目 + `docs/guide/release.md` 版本号同步（纯文档）。
