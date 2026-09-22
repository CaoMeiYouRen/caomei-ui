# M1-1 构建路径 POC（Phase 11 样式分层拆分）

- 类型：技术可行性 POC（构建路径判定）
- 触发：Phase 11 M1-1 条目「判定 `unbundle: true` 与『显式多入口 + `css.splitting: true`』哪条能产出所需 CSS 入口，且不破坏 `dts` / `exports` / `check:build` / `check:nuxt` / `docs:build`」
- 关联：[待办事项 M1-1](../../plan/todo.md) ｜ [CSS 按需引入评估 §7](./2026-09-20-css-on-demand-evaluation.md) ｜ [下一阶段范围评估 §6](./2026-09-20-next-stage-scope-evaluation.md) ｜ [架构设计 §4](../architecture.md)
- 环境：tsdown 0.23.0 + @tsdown/css 0.23.0 + rolldown 1.2.5 + vite 8.2.2；快照日期 2026-09-20，代码快照 HEAD `3baa482`（工作区无源码改动；`tsdown.config.ts` 实验后已还原，`dist/` 已重建为基线态）
- 复现材料：实验配置差异与消费侧测量脚本见[附录 A](#附录-a-可复现材料)

## 1. 结论

1. **判定：条件性可行（待验项见 §5 第 1~3 条与 §6 归属说明）**——推荐路径 **实验 B = `unbundle: true` + `css.inject: true`**；本记录**不宣告**「已满足全部五个维度」，因为 `dts` 的消费方解析未实测、`check:build` / `check:nuxt` 的适配尚未实现复验（§6）。
2. **POC 推翻了已登记计划中的一处实现假设**：M1-3 原写「7 个重量级组件**各自样式入口**并从 `styles.css` 移出」。Vite / rolldown 系实测表明**不需要逐组件入口**——`unbundle` 保留模块图 + `css.inject` 保留逐模块 CSS import 后，消费方 tree-shaking 即可做到逐组件 CSS 按需（§3.2），且「组件间样式依赖闭包」问题不再存在（`button.js` 仍 `import badge.js`，其 CSS 随图带入；**依据是产物 import 语句与消费侧 CSS 测量，未做按需渲染验证**）。
3. 该按需能力**依赖消费方工具链遵守 `sideEffects: ["**/*.css"]` 语义**（§5 第 4 条），且**仅在 Vite / rolldown 系实测**。
4. 建议把 M1-2 / M1-3 / M1-4 收敛为：**M1-2 提供稳定 `theme.css` 入口**（tokens + 预设）并**先消除 §5 第 1、3、5 条待验项**（消费方 `dts` 解析、入口语义、Nuxt 双注入与样式顺序）；**M1-3 落地 `unbundle + inject`** 并完成四处适配与复验（`exports` / `resolver` / Nuxt 模块 / `check:build` 断言）及文档口径同步；**M1-4（依赖闭包批次）取消**（动机消失）。
5. 上述是**范围调整**，按 [规划规范 §3](../../standards/planning.md)（含 §3.2 / §3.7）须**用户确认后**才改登记，本记录不擅自改写 [待办事项](../../plan/todo.md)。
6. **收益随用量面变化**：§3.2 的 −94% 是「只用 1 个组件」的上界；覆盖面广的下游（如 momei 59 组件 / 1515 用法）实际收益接近全量，口径见 [CSS 按需引入评估 §2.5](./2026-09-20-css-on-demand-evaluation.md)。

## 2. 实验设置（可复现）

**体积口径**：本文所有「字节」为**文件字节和**（`du -b` / `stat` 累加），非 `du` 块占用；「kB」沿用构建器输出（1 kB = 1000 B）。

基线（还原后实测）：`pnpm build` → `dist/` **7 文件 / 640,820 字节**（`index.js` 273,895、`index.d.ts` 190,804、`styles.css` 167,585、nuxt/resolver 各 2 文件）。

| 实验 | 配置差异（相对 `tsdown.config.ts` 基线） |
| --- | --- |
| A | `unbundle: true`（`css.inject` 保持默认 `false`） |
| B | 同 A + `css.inject: true` |
| C | 不启用 `unbundle`；`entry` 增加 `components/button/index`、`components/data-table/index`；`css.splitting: true` + `css.inject: true` |

消费侧测量：以仓库根为 Vite root 构建单个入口（`cssCodeSplit: false`、`minify: false`、`resolve.alias['caomei-ui']` 指向仓库根），入口仅做**命名导入**（不使用组件子路径），统计产物 CSS 字节。脚本与入口内容见[附录 A](#附录-a-可复现材料)。

## 3. 实验结果

### 3.1 实验 A：`unbundle`（无 `css.inject`）

- 产物：**337 文件 / 714,154 字节**（构建器报 714.15 kB），其中 **74 个 CSS**（逐 SFC 一份，如 `components/button/button.vue_vue_type_style_index_0_scoped_814ef47a_lang.css`）、**156 个 `.d.ts`**、`dist/index.d.ts` 由 190,804 → **18,818 字节**（桶文件 + 逐模块声明）。
- `dist/styles/index.css` = 5,640 字节 = **tokens + 两个预设**（天然的主题入口候选）。
- CSS 总量 = **167,585 字节，与基线 `styles.css` 完全一致**（无重复、无丢失）。
- **致命缺口**：JS 未引用 CSS——`components/button/button.js` 中被替换为 `/* empty css */` 注释，`index.js` 亦然。即**单独使用 A 形态，消费方拿不到任何样式**。
- 文件名含 SFC scope hash（如 `..._scoped_814ef47a_lang.css`）；该名字**属包内相对导入、不作为 `exports` 目标**，稳定性不影响消费方。

### 3.2 实验 B：`unbundle` + `css.inject: true`（**推荐，附条件**）

- `components/button/button.js` 保留 `import "./button.vue_vue_type_style_index_0_scoped_814ef47a_lang.css"`；`index.js` 保留 `import "./styles/index.css"` 并继续 `import` 各组件模块（模块图完整）。
- 消费侧实测（Vite，快照 2026-09-20）：

| 消费入口（仅命名导入） | 产物 CSS 文件字节 | gzip | 相对全量（raw） | 相对全量（gzip） |
| --- | --- | --- | --- | --- |
| `import { CaomeiButton }` | 7,536 B | **1.48 KB** | −95.5% | **−94.2%** |
| `import { CaomeiButton, CaomeiDataTable, CaomeiDatePicker }` | 33,616 B | **6.22 KB** | −79.9% | **−75.7%** |
| 全量（基线 `styles.css`） | 167,585 B | 25.60 KB | — | — |

- 说明：仅 Button 一项即含 `badge`（Button 的依赖）样式，符合「依赖随图带入」的预期。**更正（2026-09-20，M1-3 期复测）**：本行原写「与 tokens/预设」有误——该 7,536 B **不含基础层**（`:root` 0 命中、`--caomei-color-bg:` 0 命中）；基础层需显式 `import 'caomei-ui/theme.css'` 或由 resolver / Nuxt 模块注入。复测数据见 [M1-2 §3 的更正说明](./2026-09-20-m1-2-entry-semantics-and-dts-verification.md)与 [M1-3 记录](./2026-09-20-m1-3-style-on-demand-landing.md) §4。**未出现样式缺失**（判定依据为产物 CSS 内容中包含对应选择器，未做真实渲染对照）。
- 收益的用量面限定见 §1 第 6 条。

### 3.3 实验 C：多入口 + `css.splitting`（不推荐）

- 产物：**18 文件 / 655,640 字节**（构建器报 655.64 kB）；CSS 按 chunk 拆分且**无重复**（`index.css` 142,673 + `data-table-*.css` 17,388 + `button-*.css` 7,524 = 167,585）。
- 三项不可控因素：
  1. **文件名内容哈希**（`button-OdNLWEWB.css`）——不能作为稳定 `exports` 目标，需额外定制 `assetFileNames` 并接受哈希耦合；
  2. **chunk 组成由打包器决定**：`button-*.js` chunk 里同时含 `badge`，`data-table-*.js` 里含 `paginator` / `select` / `checkbox`；逐组件粒度不成立（要做成逐组件，须把全部 46 个组件目录都登记为 entry）；
  3. `index.css` 仍占 **85%**（142,673 / 167,585 = 85.1%）全量体积，未产生实际收益。

## 4. 破坏面与适配清单（实测）

> 「实测」= 已在实验形态下运行并记录结果；「预判」= 依据代码判读（未运行）。适配本身**尚未实现**，故本文不宣告这些维度「不破坏」。

| 项 | 实测 / 预判 | 结果 | 需要的适配 |
| --- | --- | --- | --- |
| `exports` | 实测 | `./dist/styles.css` 在 `unbundle` 形态下不存在；`check:build` 报错原文：`exports 声明的产物缺失：./dist/styles.css` | 重写 `exports`（`theme.css` 等稳定入口），并同步 `check-build` 的断言目标 |
| `check:build` | 实测 | **失败**（缺 `styles.css`；`smoke-runtime` 的 `stylesOk` 取自 `dist/styles.css`） | 改断言目标后复验 |
| **resolver** | 预判（代码判读） | `src/resolver/index.ts` 硬编码 `sideEffects: 'caomei-ui/styles.css'`；该文件消失后，**非 Nuxt 消费方按 README / 快速上手推荐路径接入时解析失败**（与 Nuxt 同类根因） | 改注入目标（按需为「theme 入口」或移除 `sideEffects`）；**须补消费侧实测** |
| Nuxt 模块 | 实测 | **失败**：`Rolldown failed to resolve import "caomei-ui/styles.css"`（模块固定注入该路径，`src/nuxt/module.ts`） | 改注入目标后复验 |
| `check:nuxt` | 实测 | 失败（同上根因） | 随模块适配后复验 |
| `docs:build` | 实测 | **通过**（文档站消费 `src/**` 与 `'@' → src` alias，不依赖 `dist`） | 无需适配 |
| `dts` | 实测（产物存在性） | 由单桶 190,804 B → 桶 18,818 B + 156 个逐模块声明 | **消费方类型解析未实测**（§5 第 1 条） |
| 文件数 / 打包 | 实测（产物）+ 预判（打包） | 7 → 337 文件 / 714,154 B | `files` 含 `dist`，npm tarball 文件数将同步上升；**未实测 `npm pack`** |
| `pnpm verify` 其余环节 | 预判 | `test` / `typecheck` / `lint` 不读 `dist` | 无需适配 |

## 5. 未覆盖边界（本记录不宣称的项）

1. **消费方 TypeScript 类型解析**：未用消费者 `tsc` 实测 `unbundle` 后的 `dts`（桶 + 逐模块）；**这是 M1-1 五维度中唯一未测项**。
2. **四处适配未实现、未复验**（计数口径同 §6「适配面统计」）：`exports` 重写、resolver `sideEffects` 目标、Nuxt 模块注入目标、`check-build` 断言目标均**只是方案**；`check:build` / `check:nuxt` 当前处于失败态。故 §6「不破坏 `check:build` / `check:nuxt`」为**预判**，非实测结论。
3. **聚合全量入口语义未定**：`unbundle` 下不再产出单体 `styles.css`；是否另行生成（如「tokens + 预设 + 未拆组件」拼接产物）留给 M1-2 决策，本次未验证该产物。
4. **依赖消费方 `sideEffects` 语义**：按需机制依赖消费方工具链遵守 `package.json` 的 `sideEffects: ["**/*.css"]` 且不覆写；不识别该字段的打包器、或下游自行覆写 `sideEffects` 时，可能样式丢失或退回全量。
5. **Nuxt 双注入与样式顺序**：`css.inject` 后 JS 自带逐模块 CSS，而 Nuxt 模块仍会注入聚合 / `theme.css`；是否重复、样式顺序是否被改变，未评估。
6. **对已登记架构决策的反转**：[架构设计 §4](../architecture.md) 现行口径为「样式始终由消费方显式导入或经 resolver 注入，未启用 `css.inject`」；采用实验 B 即**反转该决策**（亦对应 [CSS 评估 §4 方案 D](./2026-09-20-css-on-demand-evaluation.md)），须在 M1-2 / M1-3 显式改写并留痕。
7. **其他打包器**：仅实测 Vite（rolldown 内核）；webpack / rspack / esbuild 未测。
8. **SSR / `?inline` / 动态导入**场景未测。
9. **hashed CSS 文件名**对文档 / 调试可读性的影响未评估（作为包内相对导入不影响消费方，见 §3.1）。

## 6. 不通过判据（POC 前置声明 vs 实测）

| 判据（触发则终止 M1-2 ~ M1-4，回退方案 A「仅文档声明」） | 实测 |
| --- | --- |
| `unbundle` 下消费侧 CSS 不能随 JS 生效 | **未触发**（实验 B 实测生效，§3.2） |
| `dts` 破坏消费方类型解析 | **未验证**（§5 第 1 条）→ 列为 M1-2 首条验收，暂不构成回退理由 |
| `check:build` / `check:nuxt` 无法在合理改动下通过 | **未触发（预判）**——失败根因已定位，且为**四处**目标级改动（四项中三处为字符串、一处为断言目标）；**适配未实现**（§5 第 2 条） |

**判定：条件性可行** —— 核心机制（CSS 随模块按需）已实测成立；剩余不确定性为 **① 消费方 `dts` 解析 ② 四处适配的落地与复验 ③ 入口语义（含聚合入口与 Nuxt 双注入）**。归属：**①③ 由 M1-2 消除，② 由 M1-3 落地并复验**（见 §7 A3 / A4）。

**适配面统计**（§4）：需改动 **4 处**（`exports`、resolver 注入、Nuxt 模块注入、`check-build` 断言）+ 文档口径同步（§7 A4 清单）。

## 7. 范围调整（A1~A5：**2026-09-20 用户已确认**）

| # | 调整 | 依据 |
| :-: | --- | --- |
| A1 | M1-3 由「7 个组件各自样式入口并从 `styles.css` 移出」改为「落地 `unbundle: true` + `css.inject: true`」，消费方按需由 tree-shaking 达成 | §3.2 实测（无需逐组件入口） |
| A2 | M1-4（依赖闭包批次）**取消** | 模块图完整保留，依赖样式随图带入 |
| A3 | M1-2 由「聚合入口移出已拆组件」改为「提供稳定 `theme.css` 入口（tokens + 预设）并确定全量入口语义」，且**先消除 §5 第 1、3、5 条待验项** | `unbundle` 下不再产出单体 `styles.css`；token 必须随按需路径注入 |
| A4 | 新增适配项：`exports` 重写；**resolver `sideEffects` 目标改写**；Nuxt 模块注入目标；`check-build` 断言目标；文档口径同步。文档清单以 [CSS 评估 §7.3 第 6 条](./2026-09-20-css-on-demand-evaluation.md) 为准，至少含 `README.md`、[快速上手](../../guide/getting-started.md)、[本地联调](../../guide/local-linking.md)、[架构设计 §3·§4](../architecture.md)（含 §4 决策反转）、[主题与样式](../theming.md)、[设计规范](../design-spec.md)、[开发规范](../../standards/development.md)、[发布指南](../../guide/release.md)、[从 PrimeVue 迁移](../../guide/primevue-migration.md) | §4 破坏面清单 + R1 审查补充 |
| A5 | M1-2 首条验收 = 消费方 `tsc` 验证 `unbundle` 后 `dts` 可解析；并补 Nuxt 双注入去重 / 样式顺序评估。**四处适配的落地与复验归 M1-3**（A4 的适配项在 M1-3 实现） | §5 第 1、5 条 |

**确认与落地（2026-09-20）**：用户确认 A1~A5；按 [规划规范 §3.8](../../standards/planning.md) 已同步以下载体——[待办事项](../../plan/todo.md)（M1 整节重写、M1-4 取消并留依据、M2-1 盘点对象与依据修正）、[Backlog](../../plan/backlog.md)（迁出标注 `M1-1 ~ M1-3` + 形态更新）、[路线图](../../plan/roadmap.md)（Phase 11 核心交付改写）、[CSS 按需引入评估 §7.2 / §7.3 / §8](./2026-09-20-css-on-demand-evaluation.md)（实现形态与验收标准让渡、状态改为已被启动决策取代）、[下一阶段范围评估 §4 / §6](./2026-09-20-next-stage-scope-evaluation.md)（顺序依赖与 1.3 / 1.4 让渡）、[治理索引](./index.md)。M1-2 可启动。

## 8. 状态

2026-09-20：M1-1 **已交付**——本 POC 记录经 `@code-reviewer` Review Gate 两轮（R1 Reject：预写 Gate 结论 / 破坏面漏 resolver / 过早宣告「路径可行」；R2 Pass，2 warning + 2 suggest 同批修正）。三条路径均已实测（§3），破坏面与适配清单已取证（§4），不通过判据未触发但含待验项（§5 / §6），结论为**条件性可行**；§7 的 A1~A5 已获用户确认并完成计划载体同步。实验期间对 `tsdown.config.ts` 的临时改动已还原（`git diff` 为空），`dist/` 已重建为基线态且 `pnpm check:build` 通过。

## 附录 A：可复现材料

### A.1 实验配置差异

在 `tsdown.config.ts` 基线基础上按 §2 表格改动；实验 C 另加两个 entry：

```ts
entry: {
    index: 'src/index.ts',
    resolver: 'src/resolver/index.ts',
    nuxt: 'src/nuxt/module.ts',
    'components/button/index': 'src/components/button/index.ts',
    'components/data-table/index': 'src/components/data-table/index.ts',
},
```

实验 B 的 `css` 段：

```ts
css: {
    fileName: 'styles.css',
    inject: true,
},
```

### A.2 消费侧测量脚本（实验 B 用，置于仓库根执行）

```js
// 用法：node poc-tree-shake.mjs <entryFile> <outDir>
import { readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { build } from 'vite'

const [, , entryArg, outArg] = process.argv
const repoRoot = resolve(import.meta.dirname) // 脚本置于仓库根
const entry = resolve(entryArg)
const outDir = resolve(outArg)
mkdirSync(outDir, { recursive: true })

await build({
    root: repoRoot,
    logLevel: 'silent',
    resolve: { alias: { 'caomei-ui': repoRoot } },
    build: {
        outDir,
        emptyOutDir: true,
        cssCodeSplit: false,
        minify: false,
        rollupOptions: {
            input: entry,
            output: { entryFileNames: 'entry.js', chunkFileNames: 'chunk-[name].js', assetFileNames: '[name][extname]' },
        },
    },
})

const files = readdirSync(outDir)
const css = files.filter((f) => f.endsWith('.css'))
const cssBytes = css.reduce((sum, f) => sum + statSync(join(outDir, f)).size, 0)
console.log(JSON.stringify({ cssFiles: css, cssBytes }))
```

> gzip 取数：`gzip -c <outDir>/style.css | wc -c`（本文 gzip 列即由此得到）。

入口文件（一组件 / 三组件）：

```ts
// entry-button.ts
import { CaomeiButton } from 'caomei-ui'
console.log(CaomeiButton)
```

```ts
// entry-three.ts
import { CaomeiButton, CaomeiDataTable, CaomeiDatePicker } from 'caomei-ui'
console.log(CaomeiButton, CaomeiDataTable, CaomeiDatePicker)
```

### A.3 命令序列

```sh
cp tsdown.config.ts /tmp/tsdown.config.ts.bak   # 备份
# 按 A.1 改动 tsdown.config.ts
pnpm build                                       # 实验 A / B
node poc-tree-shake.mjs /tmp/entry-button.ts /tmp/out-button
node poc-tree-shake.mjs /tmp/entry-three.ts /tmp/out-three
pnpm check:build && pnpm check:nuxt              # 破坏面取证
cp /tmp/tsdown.config.ts.bak tsdown.config.ts    # 还原
pnpm build && pnpm check:build                   # 回到基线态
```

> 证据声明：机检覆盖为 `lint-md`（3 个变更文件）+ `pnpm governance:check`（含 `docs:check`）。本文件已 `git add` 后重跑：`docs-check-integrity` 扫描 **221** 个受跟踪 md（含本文件）、`docs-check-links` 校验 **220** 个 md 链接全部有效、`docs-line-count` 通过。扫描面口径：`docs-check-integrity` / `docs-line-count` 只扫受跟踪文件；`docs-check-links` 按工作树遍历（排除 `CHANGELOG.md`），未跟踪 md 亦在其扫描面内。
