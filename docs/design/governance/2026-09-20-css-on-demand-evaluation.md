# 2026-09-20 CSS 按需引入评估（`dist/styles.css` 单文件与按需样式）

> 状态：评估记录（2026-09-20）。响应「`dist` 中 `styles.css` 为一整个文件，对按需引入可能有影响」的提问，记录现状取证、主流组件库调研、候选方案与待决策项。**本文件不构成阶段登记**，执行状态以 [待办事项](../../plan/todo.md) 与 [Backlog](../../plan/backlog.md) 为准。
>
> 关联：[规划规范 §3 / §5](../../standards/planning.md) ｜ [路线图](../../plan/roadmap.md) ｜ [Backlog §1.6](../../plan/backlog.md) ｜ [架构设计 §3 / §4](../architecture.md) ｜ [主题与样式](../theming.md) ｜ [快速上手](../../guide/getting-started.md)

## 1. 结论速览

| 项 | 结论 |
| --- | --- |
| 需求性质 | 体验 / 体积优化（样式按需粒度），非功能缺陷 |
| 插队例外 | **未命中**（[规划规范 §3.5](../../standards/planning.md) 三类例外均不成立：非安全漏洞、未破坏下游构建 / 发布、非可用性 blocker） |
| 准入判定 | 走默认路径——登记 [Backlog §1.6](../../plan/backlog.md)，**不进入 `todo.md`** |
| 用户决策（2026-09-20） | ① 时机：不紧急（全量可接受）；② 形态：**不做逐组件入口**，先拆「全局 / 高复用 / 最重」的样式，其余延后；③ 兼容性**不作要求**，下游自行修复；④ 现在只规划方案，**待新的需求评估时再进入待办**。详见 §7.1 |
| 事实判断 | 用户观察**成立**：JS 侧可 tree-shaking，CSS 侧始终全量，两者按需粒度不一致 |
| 现状代价 | 全量样式 167,585 字节 / gzip 25.60 KB；小用量场景可降至约 1/4（见 §2.5） |
| 改进代价 | 收敛后方案（§7.2）＝ 分层拆分：全局层（低成本）+ 无上游依赖的重量级组件（中成本）+ 高复用组件依赖闭包（延后）；逐组件全量入口**不做**；实施前仍须构建 POC |
| 时机提示 | 用户裁定暂不紧急；正式启动时点由**下一次需求评估**决定 |

## 2. 现状取证（2026-09-20，HEAD `8d148b9`）

### 2.1 产物形态

- `dist/styles.css`：**167,585 字节 / 4,980 行 / gzip 25.60 KB**（Node `zlib.gzipSync` 默认档），单文件同时承载基础 tokens（`:root` + 暗色选择器）、两个品牌预设（`presets/caomei.css`、`presets/momei.css`）、`.caomei-root` 与全部组件 scoped 样式。
- `dist/index.js`：273,895 字节 / gzip 59.2 KB。`grep -n '\.css' dist/index.js` **零命中** → CSS 与 JS 完全分离，未启用 `css.inject`。
- 包导出（`package.json`）：样式只有一个入口 `./styles.css`；`sideEffects` 为 `["**/*.css"]`。

### 2.2 入口与 resolver

- `src/resolver/index.ts`：每个组件固定返回 `sideEffects: 'caomei-ui/styles.css'`，**无开关**——走「按需引入（推荐）」路径的消费方仍然注入整份样式。
- `src/nuxt/module.ts`：`injectStyles`（默认 `true`）同样注入整份 `caomei-ui/styles.css`。
- [架构设计 §3](../architecture.md) 已登记「主题变量（tokens）当前并入 `styles.css`；独立的 `caomei-ui/theme.css` 入口按需再评估」，§4 已登记「按组件独立 chunk 暂缓」——本条需求即触发该再评估。

### 2.3 构建口径（tsdown 0.23.0 + @tsdown/css 0.23.0）

- `tsdown.config.ts`：`css: { fileName: 'styles.css' }`；未设置 `css.splitting`（默认 `false`，全量合并）；未启用 `unbundle`；`css.inject` 默认 `false`。
- 能力边界（tsdown 官方 CSS / Unbundle 文档 + 本地类型定义 `node_modules/@tsdown/css/dist/index.d.mts` 的 `CssOptions.splitting` 注释）：
  - `css.splitting: true` 只保留 **async chunk** 的 CSS 分片（`index.css` / `async-*.css`）；
  - `unbundle: true` 时 `css.splitting` **默认 `true`**，产物按 `src/` 结构逐模块输出。
- 结论：**逐组件 CSS 在现行配置下不会自动出现**——单入口同步 bundle 的 CSS 必然合并为一份。要做逐组件样式，必须改构建形态（`unbundle` 或显式多入口），**属需先做 POC 的技术改造**，不能在评估阶段直接承诺可行性。

### 2.4 体量分布（近似口径）

口径说明：按「选择器行中的 `.caomei-<name>` 归属 + 后续声明行累计字节」的启发式统计，用于**量级判断**，不作为验收值。

| 分组 | 原始大小 | 说明 |
| --- | --- | --- |
| 基础层（tokens + 预设 + `.caomei-root`） | ≈ 5.4 KB | 任何组件都依赖，属**必载**部分 |
| 组件样式合计 | ≈ 150 KB | 46 个组件目录 / 64 个 scoped 样式块 |
| 最重的组件（近似） | auto-complete 6.6 / select 6.0 / drawer 6.0 / multi-select 5.9 / stepper 5.5 / toolbar 5.3 / file-upload 4.9 / dropdown-menu 4.7 / button 4.6 / color-picker 4.6 KB | 头部 10 个约占组件层的 1/3 |

### 2.5 收益测算（gzip）

| 场景 | 原始 | gzip | 相对全量 |
| --- | --- | --- | --- |
| 全量 `styles.css`（现状） | 164 KB | **25.60 KB** | — |
| 基础层 only | 5.4 KB | 0.95 KB | −96% |
| 基础层 + 10 个常用组件 | 37.2 KB | **6.99 KB** | **−73%** |
| 基础层 + 30 个组件 | 111.1 KB | 16.79 KB | −34% |

> 判断：受益方是「只用少量组件」的消费方（新项目、轻量站点）；下游 momei 已记录为 59 组件 / 1515 用法（见 [迁移可行性评估](./2026-09-17-momei-migration-feasibility.md)），覆盖组件面较广，其实际收益接近上表末行而非首行。**本条需求的收益不是全场景恒定值**，需按下游用量面判断。

### 2.6 逐组件切分的真实成本：组件间样式依赖

实测组件目录间的 `.vue` 直接引用（`src/components/**` 解析 `from '../<component>'`）：

| 组件 | 依赖的其他组件样式 |
| --- | --- |
| button | badge |
| checkbox-group | checkbox |
| confirm-dialog | button |
| data-table | checkbox、paginator（→ select） |
| paginator | select |
| password | input |
| split-button | button、button-group、dropdown-menu |
| date-picker | calendar |

含义：一旦按组件切分样式，**「A 用 B」的关系必须显式登记样式依赖**，否则运行时样式缺失（且这类缺陷只在特定组件组合下暴露，属易漏项）。主流库为此都维护「组件名 → 样式目录」映射表（含别名与例外清单，见 §3）。

## 3. 主流组件库做法调研（2026-09-20）

| 库 | 按需样式方案 | 证据（取证方式） |
| --- | --- | --- |
| Element Plus | 逐组件样式入口：`element-plus/es/components/<name>/style/index`（CSS 变体 `.../style/css`、Sass 变体 `style/index`）；全量走 `element-plus/dist/index.css`；手工按需需 `unplugin-element-plus` | `unplugin-vue-components` 的 `ElementPlusResolver` 源码（`importStyle?: boolean \| 'css' \| 'sass'`，`sideEffects` 注入 `base/style/css` + `<comp>/style/css`）；实体产物 `element-plus@2.14.5/es/components/button/style/index.mjs` = `import "../../base/style/index.mjs"` + `import "element-plus/theme-chalk/src/button.scss"` |
| Vant | 逐组件样式入口：`vant/es/<kebab-name>/style/index`（`less` 变体 `style/less`）；`importStyle` 可关闭；SSR 下不注入 | `unplugin-vue-components` 的 `VantResolver` 源码（`importStyle?: boolean \| 'css' \| 'less'`，`getSideEffects` 按组件目录拼接） |
| Ant Design Vue | 逐组件样式入口：`ant-design-vue/es/<styleDir>/style/css`；`importStyle?: boolean \| 'css' \| 'less' \| 'css-in-js'`；**含组件名 → 样式目录映射表**（如 `RangePicker/weekPicker → date-picker`、`Input\|Textarea → input`、`CheckableTag → tag`） | `unplugin-vue-components` 的 `AntDesignVueResolver` 源码（`matchComponents` 映射表 + `getSideEffects`） |
| PrimeVue（被替代对象） | styled 模式以 **base + preset** 生成主题，定制入口是 design token（`definePreset` / `dt`）而非逐组件样式入口 | PrimeVue 官方 Theming / Styled 文档（Architecture、Configuration API、Customization） |
| 消费侧 Vite | CSS code splitting **只对 async chunk** 生效；要合并为单文件需显式 `build.cssCodeSplit: false` | Vite 官方 Features 文档（CSS Code Splitting） |

**共同模式（三条）**

1. **一个 shared base 总是随首个组件注入**（tokens / 基础样式），组件样式按需叠加；
2. **每组件一个样式入口模块**，由 resolver 的 `sideEffects` 声明注入，而非让消费方手写 import 路径；
3. **resolver 暴露 `importStyle` 开关**（`true | 'css' | 'less'/'sass'` 或 `false`），并把「组件名 → 样式目录」的映射与例外清单固化成表——这正是 §2.6 所列维护成本的落点。

> 对照结论：本库当前形态（单份 `styles.css` 承载 tokens + 全量组件样式）**更接近 PrimeVue styled 模式**，而非 Element Plus / Vant / Ant Design Vue 的逐组件模式。用户提出的「按需」诉求，在主流生态里对应的正是后者的产物结构。

## 4. 候选方案（评估阶段）

> 本节为评估阶段的完整候选集；**2026-09-20 用户决策后的取舍与收敛范围见 §7.1 / §7.2**（未采纳的方案保留于此，供后续需求评估时复用）。

### 方案 A：维持现状 + 文档显式声明（兜底）

- 做法：不改构建；在 `README.md`、[快速上手](../../guide/getting-started.md)、[架构设计](../architecture.md) 写明「按需引入仅覆盖 JS，样式为单文件全量」。
- 收益 0、成本 0、风险 0；作为「不启动改进」时的兜底，消除文档歧义。

### 方案 B：最小拆分（低成本）

- 做法：① `src/styles/index.css` 拆出独立 `caomei-ui/theme.css`（tokens + 暗色 + 预设），`styles.css` 保持全量；② resolver 增加 `importStyle?: boolean` 开关，允许消费方接管样式时跳过自动注入。
- 收益：仅用 tokens / composables 的场景可省全部组件样式；提供「消费方自管样式」的逃生口。
- 非收益：使用 N 个组件的场景**体积基本不变**（组件样式仍全量）。
- 成本：小（新增导出 + 文档 + 单测）。风险：低（`exports` 新增属兼容变更）。
- 备注：[架构设计 §3](../architecture.md) 已预留该入口的再评估。

### 方案 C：逐组件样式入口（主流做法）

- 做法：产出逐组件样式入口（`dist/components/<name>/style/index.js` 及对应 CSS）并写入 `exports`（如 `./components/*`），resolver 的 `sideEffects` 改为注入 `base` + 组件样式（+ 依赖组件样式）；全量 `styles.css` 保留。
- 前置技术选型（**必须先 POC**）：`tsdown` 的 `unbundle: true` 与「显式多入口 + `css.splitting: true`」二选一；是否开启 `css.inject`；`dts` / `check:build` / `check:nuxt` 在两种形态下的可复现性。
- 收益：CSS 与 JS 按需粒度一致；典型小用量场景 gzip 25.60 → ≈ 7 KB（§2.5）。
- 成本：中高——构建改造 + 组件→样式依赖映射（§2.6 至少 8 组关系）+ `exports` / 文档 / Nuxt 模块语义 + 验证矩阵重跑。
- 风险：① **产物结构 breaking**（dist 不再只有单 bundle；0.x 阶段可承载，但下游接入方式会变）；② 组合组件样式缺失（§2.6）；③ Nuxt 模块 `injectStyles` 需扩展为「全量 / 按需 / 关闭」三态；④ 文档站 / 示例 / `check:*` 脚本需同步。

### 方案 D：`css.inject: true`（自动注入，正交选项）

- 做法：JS 产物保留 CSS import，消费方 `import 'caomei-ui'` 即带样式。
- 收益：DX 提升，消除「忘引样式」问题。
- 冲突：与 [架构设计 §4](../architecture.md) 现行决策「样式始终由消费方显式导入或经 resolver 注入，未启用 `css.inject`」相反；Nuxt 模块已注入需去重。
- 结论：独立于 A/B/C 的可选项，建议与 C 一并评估，不单独启动。

### 方案 E：分阶段组合（可选路径）

1. 第一批（若采纳）：方案 B 的 `theme.css` 独立入口 + `importStyle` 开关；
2. 第二批：方案 C（逐组件样式入口）+ 方案 D 决策；
3. 每批独立走 D→A→V→T→F，方案 C 需先交付 POC 结论再定实施。

## 5. 影响面、风险与时序

**受影响载体（一旦实施）**

- 构建与产物：`tsdown.config.ts`、`dist` 结构、`package.json` 的 `exports` / `sideEffects`；
- 消费侧：`README.md`、[快速上手](../../guide/getting-started.md)、[本地联调](../../guide/local-linking.md)、[架构设计 §3 / §4](../architecture.md)、[主题与样式](../design-spec.md) 中的样式引入口径；
- 库内：`src/resolver/index.ts`（`importStyle`）、`src/nuxt/module.ts`（`injectStyles` 语义）；
- 门禁：`check:build`（exports 产物齐全）、`check:nuxt`（Nuxt fixture 样式注入断言）、`docs:build`、常驻 E2E 与文档示例的样式引入。

**主要风险**

| 风险 | 说明 | 缓解 |
| --- | --- | --- |
| 组合组件样式缺失（**收敛后仍为首要风险**） | A 依赖 B 的样式（§2.6 至少 8 组）；拆出被依赖方会让留在聚合入口的上游组件缺样式 | 拆出某组件时，其**传递上游使用者**必须同批获得入口或一并拆出（闭包规则见 §7.2） |
| 产物结构 breaking | dist 形态与 `exports` 变化 | **用户已裁定兼容性不作要求**（2026-09-20），下游自行适配；仍须在 CHANGELOG 与文档明示 |
| 构建不可行或收益不达预期 | 分层拆分在 tsdown 下的实际产出未验证 | 先做 POC（§6），POC 不过则不启动实施 |
| 下游适配量 | 下游若已按 `caomei-ui/styles.css` 接入，入口语义变化会带来适配 | 用户已裁定不考虑兼容性；仍建议尽量早于下游接入实施以少改一次 |
| 收益低于预期 | 覆盖面广的下游（如 momei 59 组件）可省比例有限 | 用户已认领该判断（暂不紧急）；按下游真实用量面决定启动时点 |

**时序建议（2026-09-20 用户裁定后）**：不紧急，**启动时点由下一次需求评估决定**；若届时下游尚未按现有入口接入，宜先于其接入完成实施。

## 6. 启动前必做：构建路径 POC

- 判定问题：**分层拆分**（基础层 + 若干重量级组件各自成入口）在 `tsdown` 下如何产出——`unbundle: true` 与「显式多入口 + `css.splitting: true`」两条路径，哪条能在**不破坏** `dts` / `exports` / `check:build` / `check:nuxt` / `docs:build` 的前提下产出所需 CSS 入口；
- 产出：`dist` 目录实测清单、`styles.css` 拆分前后字节对照、结论与推荐路径；
- 门禁：POC 不通过则不得进入实现，回退到「方案 A（仅文档声明现状）」。

**非目标（对全部候选形态恒定成立）**

- 不引入 CSS-in-JS / 构建期原子化（与本项目「CSS variables + 原生 CSS/SCSS」取向冲突）；
- 不为追求体积把 tokens 复制进每个组件入口；
- 不改动组件视觉输出与 token 契约。

## 7. 用户决策与收敛方案（2026-09-20）

### 7.1 决策记录

| # | 决策项 | 用户裁定（2026-09-20） |
| :-: | --- | --- |
| D1 | 是否启动、何时启动 | **暂不启动**：不紧急，全量样式体积「勉强可以接受」 |
| D2 | 目标形态 | **不做逐组件样式入口**；先拆「全局的、高复用的、最重」的样式，其余延后 |
| D3 | 兼容容忍度 | **不作要求**，产物结构与 `styles.css` 语义变更均可接受，下游自行修复 |
| D4 | 与下游时序 | 不设硬约束（结合 D1，启动时点后移） |
| D5 | 载体 | **现在只规划方案**；待**新的需求评估**时再进入 [待办事项](../../plan/todo.md)，当前保留在 [Backlog §1.6](../../plan/backlog.md) |

### 7.2 收敛方案：分层拆分（基础层 + 重量级组件）

**形态定义**：不产出「每个组件一个入口」，只把三类样式从默认聚合入口中拆出。

| 层 | 入口 | 内容 | 依据 |
| --- | --- | --- | --- |
| 全局层 | `caomei-ui/theme.css` | tokens（`:root` + 暗色选择器）+ `.caomei-root`；3.11 KB raw / **1.14 KB gzip** | 任一组件都依赖，属「全局 + 高复用」 |
| 预设层 | `caomei-ui/presets/<name>.css` | `caomei` / `momei` 两个品牌预设（当前恒随包全量，实际只用其一或不用）；1.98 / 1.90 KB raw、**0.70 / 0.63 KB gzip** | 「可复用但非必载」——目前两份预设对任何下游都是死重（不含所选预设的那一份） |
| 重量级组件层 | `caomei-ui/components/<name>.css` | 按 §7.2 批次清单拆出的组件样式 | 「最重」+「被多组件复用」 |
| 聚合入口（保留） | `caomei-ui/styles.css` | 语义调整为 **tokens（`theme.css` 内容）+ 两个预设 + 未拆出的其余组件**；已拆出的组件从此入口移出 | 保留单文件路径；只用轻量组件的下游**零改动即获收益** |
| — | — | 预设是否也移出聚合入口：**默认不移出**（若移出，所有下游都须额外引一个预设，而省下的仅 0.63~0.70 KB gzip，属无谓 churn）；独立预设入口定位为「手工组合时按需取用」 | 启动时如无新证据，按此默认执行 |

**关键不变量（可机检）**

1. **覆盖性与无重复**：聚合入口 ∪ 全部已拆入口 = 全量样式集合，且两两交集为空（防止双份注入或遗漏）；
2. **依赖闭包**：拆出组件 X ⇒ X 在图中的**全部传递上游使用者**必须同批拆出（否则留在聚合入口的上游组件缺 X 的样式）；
3. **base 单一注入**：基础层与预设不随组件入口重复（组件入口只含组件样式）。

**批次清单（固定为下表自上而下的顺序，不按主观优先级调整）**

| 批次 | 内容 | 依据（§2.4 近似口径 / §2.6 依赖图） | 状态 |
| :-: | --- | --- | --- |
| 1 | 全局层 + 预设层（`theme.css`、`presets/*.css`） | 全局复用，且预设恒全量随包 | 建议优先（成本最低） |
| 2 | **无上游依赖的 7 个重量级组件**：auto-complete、drawer、multi-select、stepper、toolbar、file-upload、color-picker（近似合计 ≈ 38.7 KB raw，约组件层 26%） | 逐个 ≥ 4.5 KB；且**均不出现在 §2.6 依赖图中**——既不依赖其他组件，也无其他组件依赖它们，可原子拆出 | 建议次批 |
| 3 | **高复用重量级组件 + 依赖闭包**：select（+paginator+data-table）、button（+badge；其上游 confirm-dialog / split-button 需同步，含 button-group / dropdown-menu）、input（+password）、calendar（+date-picker） | 「高复用」维度落在依赖图的被依赖节点上；须整条闭包一起拆 | 延后 |
| 4 | 其余组件按同一门槛追加（近似 ≥ 4.5 KB，按 §2.4 表自上而下取） | 同一判定门槛 | 延后 |

> 批次 1 与批次 2 相加即为「小成本高收益」范围：全局层 + 预设 ≈ 3 KB raw，重量级 7 组件 ≈ 38.7 KB raw；合计约占全量样式的 1/4，且**不触碰依赖闭包**（风险最低）。

### 7.3 调整后的最小验收标准（可判定）

1. **集合不变量**（§7.2 第 1 条）由脚本机检：并集覆盖、交集为空；
2. 拆分后聚合入口 `styles.css` 的字节数下降量与「移出内容」字节数一致（差额可解释，无静默丢失）；
3. 批次 2 的 7 个组件各自入口**可独立加载**，且其渲染结果与全量入口对照一致（浏览器逐项比对计算样式，非仅「无报错」）；
4. 依赖闭包成立：消费批次 3 闭包内任一组件时，其依赖组件样式存在（逐条断言）；
5. `check:build` 的 exports 产物清单同步、`docs:build`、`pnpm verify` 全绿；
6. 文档口径同步：`README.md`、[快速上手](../../guide/getting-started.md)、[架构设计 §3 / §4](../architecture.md)、[主题与样式](../theming.md)、[本地联调](../../guide/local-linking.md)；CHANGELOG 明示入口语义变更（**兼容性虽不作要求，仍须披露**）。

> 与评估阶段（§6 旧版）相比的调整：删除「`styles.css` 全量入口保持可用 / 向后兼容」一条——用户已裁定兼容性不作要求，且该条与「已拆组件移出聚合入口」的收益机制直接冲突。

## 8. 状态

2026-09-20：本条需求经评估判定**未命中插队例外**，按 [规划规范 §3](../../standards/planning.md) 登记 [Backlog §1.6](../../plan/backlog.md)；同日用户 5 项裁定落定（§7.1），形态收敛为**分层拆分（非逐组件入口）**并给出批次清单（§7.2）与验收标准（§7.3）。**当前状态：已规划方案、未启动、不进 `todo.md`**——启动时点由下一次需求评估决定；启动后实施前须先交付 §6 的构建路径 POC（POC 不过则回退方案 A）。本记录为现状与方案的取证依据，不构成实施承诺。
