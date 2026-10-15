# Phase 24 M5-1：`CaomeiChart` 图表轻量封装

> 创建时间：2026-10-15
> 阶段条目：Phase 24 M5-1（主线 M5 图表能力；M5-2 联动与文档为后续批次）
> 范围依据：[Phase 24 范围扩展评估](./2026-10-13-phase24-scope-extension-evaluation.md) §10.1 **D3**（「轻量封装（方案 B），依赖作**可选 peer**，并做好暗色与国际化文本联动」）与 §10.1 条目表 M5。
> 边界声明：**零新增运行时依赖**（`echarts` / `vue-echarts` 为可选 peer，仅进 `devDependencies`）；不改动既有组件与公共 API。

## 1. 结论摘要

| 面 | 结论 |
|:---|:---|
| 组件与 API | `CaomeiChart`：`option` 原样透传 + `height` / `autoresize` / `loading` / `group` / `initOptions` / `updateOptions` / `theme` / `label`（§2） |
| 内核形态 | **可选 peer**（`vue-echarts` + `echarts`）+ **动态 `import()` 按需加载**，形态同 `CaomeiRichTextEditor`（§3.1） |
| 按需注册 | 本库**不代注册**任何图表类型 / 组件；注册是使用方职责（体积控制），示例与夹具均示范（§3.2） |
| 降级 | 加载中 `role="status"` 占位、失败 `role="alert"` 占位 + 控制台告警且**不抛出**；SSR / SSG 只输出占位（§3.3） |
| 未安装 peer 的断言 | **构建侧**：新增契约守卫（可选 peer 不得被静态引用）+ esbuild 实测取证；**运行期**：加载失败降级单测（§5.1） |
| 注册面 | §11「高级组件」+ §5 Tier 3 行 + §6「不自研」行改写 + §7 迁移映射 + 中英侧栏 / 总览页 + locale 台账 + Nuxt 与包导出 + `check:build` 关键导出（§4） |
| 质量门 | `pnpm verify` exit 0；`pnpm test:e2e` **360 passed**（新增图表装置 2 用例 × 3 project）；a11y 67 例；单测 8 例 + 契约 10 例（§7） |

## 2. 组件与 API

| 项 | 说明 |
|:---|:---|
| `option` | **必填**，ECharts 配置对象；本组件只透传、不读取字段。类型取最宽对象类型（`object`），不引用 `echarts` 的 `EChartsOption`（见 §3.1 类型面约束） |
| `height` | 容器高度（CSS 长度）；缺省 `--caomei-chart-height` → `20rem`（**内核要求确定高度**，否则画布 0px） |
| `autoresize` | 默认 `true`（容器尺寸变化自动 `resize`），显式 `false` 可关闭 |
| `loading` / `group` / `initOptions` / `updateOptions` / `theme` | **原样透传**内核同名能力（`initOptions` 亦不注入 / 不合并缺省值）；`theme` 为逃生舱（本批不代派生主题，联动见 M5-2） |
| `label` | 渲染为容器 `aria-label`；**非空即赋予 `role="group"`**，可访问名取「显式 `label` > 透传 `aria-label`」（两者皆空则既不授角色也不输出该属性） |

- 根元素类 `caomei-chart`，内核容器 `caomei-chart__canvas`，占位 `caomei-chart__status`。
- 承重声明：根 `min-width: 0` + `width: 100%`，内层 `height: 100%`（图表作为 grid / flex 项不得被内核 min-content 撑破父容器；同 `CaomeiRichTextEditor` 的布局契约）。

## 3. 实现要点

### 3.1 可选 peer 形态与类型面约束

- `package.json`：`peerDependencies` 增 `echarts: ^6.0.0`、`vue-echarts: ^8.0.0`，并各带 `peerDependenciesMeta.optional = true`；两者同时进 `devDependencies`（本仓测试与文档站需要）——**不进 `dependencies`**，「零新增运行时依赖」由此成立。
- `src/components/chart/chart-loader.ts` **不静态引用** peer 的类型或运行时值，全部经动态 `import()`（先 `vue-echarts/style.css` 后 `vue-echarts`，避免首帧无样式闪烁）。
- `types.ts` 的 `option` 取 `object` 而非 `Record<string, unknown>`：后者要求索引签名，会把下游以 `EChartsOption`（interface 组合）标注的变量挡在类型面之外；本组件只透传，故不自定义 schema。

### 3.2 按需注册（使用方职责）

封装层不调用 `use([...])`、也不导入 `echarts` 的任何图表 / 组件：注册与图表实例共享同一份内核模块（`vue-echarts` 与本库都从 `echarts/core` 取运行时），因此使用方在应用入口注册即可，无需向组件传参。示例与 E2E 夹具均只注册 `CanvasRenderer` + `BarChart` + `GridComponent` + `TooltipComponent`，以此证明封装层未代注册全量内核。

### 3.3 加载、降级与 SSR

加载在 `onMounted` 后发起 ⇒ **SSR / SSG 只输出占位**，服务端不触碰 DOM。失败路径渲染 `role="alert"` 占位 + 控制台告警（`NODE_ENV=production` 下静默），**不抛出**——未安装 peer 时页面不白屏。告警路径逐级可选访问 `globalThis.process`，兼容消费者注入的不含 `env` 的 process shim（同 `CaomeiRichTextEditor`）。

## 4. 注册面同步与守卫联动

| 面 | 载体 | 说明 |
|:---|:---|:---|
| 组件分区单一事实源 | §11「高级组件」追加 `Chart`（组内英文名字母序首位） | 高级组件：Chart、RichTextEditor（该组承载外部内核类组件） |
| 组件设计清单 | §5 Tier 3 追加 `Chart` 行（插在 `RichTextEditor` 之前） | `check:design-catalog` 通过（§5 **26** 行 ↔ §11 **55** 成员） |
| 不自研表 | §6 原「Chart：引入第三方库；暂未使用」→ 改写为「**已实现** `CaomeiChart`：轻量封装 `vue-echarts` + `echarts`（可选 peer、按需加载）等」 | 消除「暂未使用」的陈旧口径 |
| 迁移映射单一事实源 | §7 追加 `> Chart 迁移映射（已实现）`（含内核不同、`option` 不可直接搬运、按需注册等已知差异） | `check:migration-consistency` 通过（§7 组件 45 / 有迁移节 44 / 已知差异 22 对 22） |
| 中英侧栏 / 总览页 | `docs/.vitepress/config.ts` 两处 sidebar + 中英 `components/index.md` | `check:components-overview` 通过（组内顺序与 §11 一致） |
| locale 台账 | `docs/components/locale.md` + 英文页新增 `chart` 行；`src/locale/*` 增 `chart` 命名空间（5 语 × 2 键） | `check:locale-keys`（28 命名空间 / 80 条文案）/ `check:locale-ledger` 通过；硬编码计数的测试常量同步更新 |
| 第三方许可 | `THIRD-PARTY-LICENSES` 增 `echarts@6.1.0`（Apache-2.0）与 `vue-echarts@8.3.2`（MIT）条目 | `check-licenses` 通过（声明覆盖 `dependencies` + `peerDependencies`） |
| Nuxt / 包导出 / 产物冒烟 | `src/nuxt/components.ts`、根 barrel、`scripts/release/check-build.mjs` 的 `REQUIRED_RUNTIME_EXPORTS` | `check:build` 通过（`CaomeiChart` 在独立 Node 进程可加载导出） |
| a11y 受检面 | `test/a11y/fixtures.ts` 追加 `CaomeiChart` 夹具（预算 59 → **60**），并在 `a11y.test.ts` 中把内核替换为桩 | 口径同 `CaomeiRichTextEditor`：审计包装层自身 DOM，内核可访问性不在本库职责内 |

## 5. 验证与判别力

### 5.1 未安装 peer 场景的两侧断言

- **构建侧（新增契约守卫）**：`test/contracts/optional-peer-imports.test.ts`（10 例）——可选 peer 的**静态引用（含 `import type` / `export ... from` / `require`）必须为空**（唯一例外 `@nuxt/kit` 限于 `src/nuxt/**`，该入口只在 Nuxt 环境消费）、可选 peer 不得出现在 `dependencies`、惰性 peer 必须存在真实动态 `import()` 路径、可选 peer 须在 `devDependencies`。守卫自带**判别力自证**：对合成语料断言静态 / 动态可区分、前缀相同的兄弟包（`vue-echarts-extra`）不误判、注释中的引用不计入（首版即因未剥离注释把加载器模块的文档注释误判为静态引用）。
- **构建侧（实测取证）**：以 esbuild 对 `src/components/chart/chart-loader.ts` 打包——peer 在位时 exit 0；把 `node_modules/vue-echarts` 临时移出后报 `Could not resolve "vue-echarts/style.css"`（随后已恢复并复跑单测确认）。组件页（中英）据此改写为**可复现的实测口径**，不再沿用未经本仓验证的「Vite / Rolldown 实测」措辞。
- **运行期**：`src/components/chart/chart-load-failure.test.ts` 断言加载失败渲染 `role="alert"` 占位、文案取内建 locale、`console.warn` 被调用、**不抛出**。

### 5.2 真实浏览器装置（`test/e2e/chart.e2e.ts`）

判据与判别力校准：

- **内核真实加载 + 绘制**：断言画布存在、尺寸 > 0，且**彩色像素占比** > `MIN_COLOR_RATIO`（系列图形取调色板饱和色；坐标轴 / 刻度 / 文字为灰阶）。
- **首版判据被判为不具判别力并已改正**：初版以「非空像素占比」为判据，理由写作「未注册系列则画布空白」——**负向对照证伪**：把 `BarChart` 从 `use([...])` 移除后用例**仍然通过**（坐标轴与文字撑起了墨迹占比）。改为彩色像素占比后重新校准：注册 `BarChart` 时 **0.00173**，移除后 **0.0000391**（相差约 44 倍），阈值取 **0.0005**（高于负值 12.8 倍、低于正值 3.5 倍），并再次以负向对照确认会失败。
- **autoresize 默认开启**：容器宽度减半后画布 CSS 宽度跟随（`expect.poll` 等待），且 resize 后画布仍非空白。
- **容器语义与默认高度**：`role="group"` + `aria-label`；默认高度 > 200px（`20rem` 回退路径）。
- **判据的已知脆弱点（已写入装置注释）**：饱和度门（`max - min > 24`）与下界均绑定「系列色为饱和色」这一前提；**改色板（含 M5-2 由 token 派生）后必须重校准**，否则低饱和色板可能误杀正确实现。重算方式（去掉 `BarChart` 跑同一用例读色占比）已写在用例注释内。

### 5.3 其余验证

- 单测：`src/components/chart/chart.test.ts`（7 例，替换内核为桩）+ `chart-load-failure.test.ts`（1 例）——占位与就绪切换、`option` / 各透传项原样交给内核、`autoresize` 默认与显式关闭、`label` 有无、`height` 内联与缺省、`class` / `id` 透传、locale 切换下的占位文案。
- a11y：`pnpm test:a11y` 67 例通过（夹具 60 + 元测试 7）。
- 门禁：`pnpm verify` exit 0（含 `build` + `check:build` 解包冒烟、`docs:build`、`governance:check` 全链）；`pnpm lint` / `lint:css` / `lint:md` / `typecheck` 全绿。

## 6. 载体同步

1. **新增**：`src/components/chart/{chart.vue,types.ts,chart-loader.ts,index.ts,chart.test.ts,chart-load-failure.test.ts}`、`docs/components/chart.md` + 英文页、中英示例 `docs/examples/chart/basic.vue`、`test/e2e/chart.e2e.ts`、`test/contracts/optional-peer-imports.test.ts`、本记录。
2. **修改**：`package.json`（可选 peer + devDeps）、`pnpm-lock.yaml`、`src/locale/{types,zh-cn,en-us,zh-tw,ja-jp,ko-kr}.ts`、`src/index.ts`、`src/nuxt/components.ts`、`scripts/release/check-build.mjs`、`scripts/governance/check-locale-keys.test.mjs`（计数常量）、`THIRD-PARTY-LICENSES`、`test/a11y/{fixtures.ts,a11y.test.ts}`、`test/e2e/fixtures/app.vue`、`test/e2e/responsive.e2e.ts`、`docs/design/{documentation-site.md,components.md,design-spec.md}`、`docs/components/{index.md,locale.md}`、`docs/i18n/en-US/components/{index.md,locale.md}`、`docs/.vitepress/config.ts`、`docs/plan/todo.md`。
3. **未改**：`docs/.vitepress/showcase-registry.json`（画廊为策展子集）、`test/capture/baseline.json`（Chart 未纳入计算样式采样面，本批改动不触发基线漂移）。

## 7. 质量门

- `pnpm verify` **exit 0**；`pnpm test:e2e` **360 passed**；`pnpm test:a11y` **67 passed**；单测 + 契约 18 例；`pnpm capture:styles` 无差异（未纳入采样面）。

## 8. 边界（显式声明）

1. **本批不派生主题**：`theme` 仅为逃生舱，缺省走 ECharts 默认主题；暗色 / 预设 / 语言联动与相应装置属 **M5-2**。
2. **不代注册内核**：图表类型与组件由使用方注册；漏注册时的现象是**系列不渲染**（坐标轴仍绘制），本库不做运行期探测。
3. **不做数据转换**：`option` 原样透传，字段级正确性由使用方与 ECharts 负责。
4. **`option` 类型不精确**：取 `object` 以避免索引签名门槛；精确类型检查留给下游 `EChartsOption`。
5. **图表内容可访问性不由本组件承担**：仅提供容器级 `label`；ECharts 的 `aria` 配置项由使用方设置。
6. **未覆盖**：`loading` / `group` / `initOptions` / `updateOptions` / `theme` 的逐项浏览器实测（仅透传单测）；SSR 直出图表的服务端渲染模式（`ssr: true`）不在本批范围；移动端触摸交互与业务级性能（大数据量）未评估。

## 9. Review Gate

- **audit-depth**：`standard`（新增组件 + 可选 peer 依赖声明 + 新增测试装置 + 文档 / 注册面同步；非发布 / 安全 / agent·skill 定义）。单分区。审计方未触发跨仓取证与全量复算。
- **R1（`standard`）：`Reject`**（**1 blocker / 2 warning / 4 suggest**）。
  - **RG-B1（blocker，已关闭）**：`types.ts` 的 `initOptions` JSDoc 写「本组件**按需注入缺省值**，显式传入者优先」，而实现只是原样透传、全仓无注入逻辑；该双语 JSDoc 会经 `<ComponentApi>` 渲染进**中英组件页的公开 API 表**，构成「公开文档声称未实现能力」（与治理记录 §2、组件页正文均不一致）。→ 已改为「**原样透传**，本组件不注入、不合并缺省值」（中英同步），并重跑 `docs` 生成以刷新 `component-meta.json`（构建产物、git-ignored）。
  - **RG-W1（warning，已关闭）**：`pnpm add` 引发的 lockfile 存在**与本报无关的版本漂移**（`cz-conventional-changelog-cmyr` 2.0.0 → 2.0.1 并连带 `@commitlint/*` 换血），而记录 §6 笼统写作「本批相关」。→ **根因与修法**：普通解析模式下新增 `vue-echarts` / `echarts`（及其传递依赖 `zrender` / `tslib`）会触发解析器重解析共享子树；改用 **`pnpm install --lockfile-only --config.resolutionMode=time-based`** 后 lockfile 变为**纯增量（88 插入 / 0 删除；其中 55 行为该模式引入的顶层 `time:` 元数据区块（45 条目），与本批新增包无关——**R2 复核**：把三份清单复制到独立目录以**默认**解析模式复算得 **0 差异**，该区块在默认模式下稳定、不产生后续 churn**）；既有的 `cz-conventional-changelog-cmyr@2.0.0` 与 `@commitlint/*` 21.x **未被改动**，随后 `pnpm install --frozen-lockfile` 对齐 `node_modules`（复核 `@commitlint/cli` 仍为 21.2.3，工具链未换血）。复现命令与结论已记录在此。
  - **RG-W2（warning，已采纳）**：E2E 的饱和度门与下界对**低饱和调色板**有误杀风险（M5-2 将由 token 派生色板）。→ 已把「改色板必须重校准」与重算方式写进用例注释（不外扩判据改法：相对化判据留待 M5-2 依实际色板落地时评估）。
  - **RG-S1（suggest，已采纳）**：a11y 夹具中「夹具数据（选项 / 表格列）」注释因插入新常量而错位 → 已按语义归位。
  - **RG-S2（suggest，已采纳）**：`role` 仅由 `label` prop 驱动，导致「只透传 `aria-label`」时出现**无角色却带 `aria-label`** 的通用元素（ARIA 1.2 禁止，属 `aria-prohibited-attr`）。→ 已改为**由解析后的可访问名驱动角色**，并补单测锚定；组件页中英同步该口径。（`CaomeiRichTextEditor` 存在同源历史口径，本批**不改动**以免扩散范围，见 follow-up。）
  - **RG-S3（suggest，登记不阻断）**：契约守卫受检面为 `src/**`，未覆盖 `dist` 产物（构建期 `external` 或产物静态引用不在其内）。
  - **RG-S4（suggest，登记不阻断）**：负向对照与校准数值目前只存在于记录文字与本文件注释，无独立证据工件，第三方无法按记录重放。
- **是否需第 2 轮**：**需要**（blocker 收口后按协议做 delta 复审，范围冻结为 `initOptions` JSDoc 的公开渲染影响 + lockfile 归因 + RG-S2 角色口径改动）。
- **R2（delta 复审，范围冻结）：`Pass`**（0 blocker；2 条新 suggest 均已同批收口）。
  - **RG-S5（suggest，已采纳）**：`v-bind="rootAttrs"` 位于 `:role` 之后，故**显式透传的 `role` 会覆盖**组件授予的 `role="group"`——文档原话术下会复现「有名字却无角色」的情形。→ 采纳「逃生舱 + 显式口径」：`types.ts` / 组件页（中英）写明「显式透传 `role` 以使用方为准，角色适用性与命名合规性由使用方承担」，并补单测（`attrs: { role: 'figure' }` 时渲染为 `figure`）作为口径载体。
  - **RG-S6（suggest，已采纳）**：本记录 §9 对 lockfile 增量的描述不完整（88 行中 55 行为 `time:` 区块，与本批包无关）且「是否需第 2 轮」行有拼写错误 → 已补归因与 R2 的默认模式复算结论（0 差异），并修正拼写。
- **R2 复核结论要点**：RG-B1 关闭经**公开渲染链**实证（`component-meta.json` 生成时间晚于 `types.ts`，中英 `description` 均为修正后文本）；RG-W1 关闭经逐 hunk 核验（lockfile 增量为 **88 行插入 / 0 行删除**，无既有包版本变化）+ `pnpm install --frozen-lockfile --offline` 报 `Already up to date`；新单测被判为**具判别力**（实现回退为 `props.label ? 'group' : undefined` 即失败）。
- **follow-up（登记，不阻断）**：① `CaomeiRichTextEditor` 的「仅按 `label` prop 授 `role="group"`、且不采纳透传 `aria-label`」与本次 chart 口径不一致，可专项统一（涉及既有组件 a11y 快照，另立条目）；② 契约守卫向 `dist` 产物扩面；③ 负向对照 / 校准数值固化为可重放工件。
