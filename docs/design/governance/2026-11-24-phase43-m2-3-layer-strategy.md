# Phase 43 M2-3：组件库 CSS `@layer` 策略评估

> 创建时间：2026-11-24
> 触发：Phase 43 登记批次 M2-3（[登记批次](./2026-11-24-phase43-registration.md) §2）；候选来源 [1.4.0 下游反馈研判](./2026-11-23-caomei-ui-1.4.0-downstream-feedback.md) §4「库样式覆盖下游 `display` / `border`，需 `!important`」。
> 性质：**只评估**（D3 ①），不改构建、不改样式产物。

## 1. 范围

- 评估 `@layer caomei-ui` 的兼容面：构建产物、`theme.css` 入口、resolver / Nuxt 注入顺序、下游未分层样式的优先级。
- 给出「落地 / 不落地 + 边界」结论；不落地时写清下游覆盖所需的特异性口径（供 M2-4 指引落笔）。
- 非目标：不改构建配置、不改任何组件样式、不改公共 API。

## 2. 现状读数（层叠事实）

| 事实 | 读数 | 依据 |
|:---|:---|:---|
| 产物形态 | `unbundle` + `css.inject: true`：每个组件产出独立 CSS（带 scoped 哈希文件名），由对应组件 JS 模块 `import` 引入 | `tsdown.config.ts` 的 `unbundle` / `css.inject`；`dist/components/button/button.js` 内 `import "./button.vue_vue_type_style_index_0_scoped_<hash>_lang.css"` |
| 基础层入口 | `caomei-ui/theme.css` → `dist/styles/index.css`，单体产物：`theme.css`（tokens / 暗色 / `.caomei-root`）+ 5 个品牌预设 + `field-shell.css` + 不可见命中区与安全区工具类 | `package.json` 的 `./theme.css` 导出；`src/styles/index.css` 的 `@import` 列表与文件内规则 |
| 组件根规则特异性 | `.caomei-button[data-v-<hash>]` = **(0,2,0)**（类 + scoped 属性） | `dist/components/button/*.css` 首条规则 |
| 状态 / 部件规则特异性 | `:disabled` / `:focus-visible` = (0,3,0)；`:hover` / `:active` 复合（`.caomei-button--primary[data-v]:hover:not(:disabled)`）= **(0,4,0)**；后代部件（`.caomei-button--icon-only .caomei-button__icon[data-v]`）= (0,3,0) | 同上产物 |
| 档位 / 语气规则 | 用 `:where()` 归零特异性，只声明 CSS 变量 | `button.vue` 的 `:where(.caomei-button--sm)` 等 |
| 状态色来源 | `hover` / `active` 由 `color-mix()` 从 `--caomei-button-*` 或语义 token 派生（不新增冻结 token） | `button.vue` 的状态反馈注释与规则 |
| Nuxt 注入顺序 | 模块把 `caomei-ui/theme.css` push 进 `nuxt.options.css`（先），主题覆盖模板随后 push；组件 CSS 随组件模块 | `src/nuxt/module.ts` |
| resolver | 返回组件名、导入来源与**基础层 `sideEffects`（`caomei-ui/theme.css`）**；不承载组件样式。基础层经打包器的 side-effect import 插入模块序，落点随 bundler / tree-shaking 变化 | `src/resolver/index.ts` |
| 下游实测 | caomei-auth 的 `.caomei-button.social-btn` 与库根规则同为 (0,2,0)，靠源序（库后加载）取胜 → 需 `!important`；momei 25 文件 / 35 选择器改 `:deep()`（根节点问题，已由 M2-1 修复） | [1.4.0 下游反馈研判](./2026-11-23-caomei-ui-1.4.0-downstream-feedback.md) §3 |

## 3. 候选方案与对比

| 方案 | 内容 | 收益 | 代价 / 风险 |
|:---|:---|:---|:---|
| **A 维持未分层 + 覆盖指引**（结论） | 不改产物，只文档化覆盖口径 | 零构建改动；不改变任何既有层叠契约 | 下游覆盖仍需提高特异性或 `:deep()` |
| B 全量分层（强制） | 构建期把每个产物 CSS 与 `theme.css` 包进 `@layer caomei-ui` | 任何**未分层**下游规则无条件胜出，不再需要 `!important` | 见 §3.1 风险 1 ~ 5；对存量使用者是行为翻转 |
| C 仅基础层分层 | 只把 tokens / 预设包进层（组件样式不分层） | 下游 token 覆盖更省心 | 对「覆盖组件样式」无效（组件规则仍与下游同档），只解决 token 一条路径 |
| D opt-in 分层产物 | 额外发布 layered 产物 / 构建开关 | 采用者可获 B 的收益，未采用者不受影响 | 两套产物面（+ 逐模块 hash 产物的双份回归）、`theme.css` 可分层而组件 CSS 由 JS 内联引入、无法按组件粒度 opt-in；维护成本翻倍 |
| D′ 下游侧自行分层 | 本库不提供，下游用 PostCSS 插件 / `@import … layer()` 包裹库产物 | 库零改动 | 需要下游对 `node_modules` 产物做构建期包裹（脆弱且随产物 hash 变化）；不构成可文档化的通用方案 |

### 3.1 方案 B 的风险（判为不落地的主因）

1. **下游 reset 反压库样式**：未分层规则无条件胜过分层规则，故 `button { … }`、`* { box-sizing }`、Tailwind preflight 式的全局元素选择器也会压过组件样式——引入库即外观退化。这类全局规则在下游极常见。
2. **层顺序跨来源不可控**：`@layer` 顺序是文档级全局，按首次声明顺序决定。下游若自身使用 `@layer base / components / utilities`，必须把 `caomei-ui` 插入自己的顺序表，否则其 utilities 会输给库层——把「特异性问题」换成「层顺序配置问题」。基础层经 `sideEffects` / 注入位置进入模块序（见 §2），顺序更难被下游约束。
3. **语义翻转属破坏性变更**：现状的隐性契约是「库后加载取胜」；分层后除 `!important` 外覆盖语义反转。落地须三家下游 + 文档站同批回归。
4. **构建期改写成本与漏网风险**：需为每个逐模块 CSS 与 `theme.css` 包层。构建链没有现成的分层开关（tsdown 只暴露 `css.postcss` 钩子），可经 PostCSS 插件完成，但**该路径未在本轮实测**；只要漏一个文件就形成「混合层叠」，比现状更难诊断。
5. **旧内核整块丢弃（附带说明，非新增门槛）**：不支持 Cascade Layers 的内核会丢弃整块 `@layer` 规则（不是降级为未分层）。但本库产物已依赖 `color-mix()`（Chrome 111+ / Safari 16.2+）与 `:has()`（Chrome 105+ / Firefox 121+）等更新的能力，故 `@layer`（Chrome 99+ / Safari 15.4+ / Firefox 97+）**不构成新增受众切除**；此条只说明失败形态是「整块丢样式」而非温和降级。

## 4. 结论

**不落地 `@layer`（方案 A）**，维持未分层产物，并把覆盖口径写进中英「下游覆盖指引」（M2-4）。理由：分层的收益只覆盖「下游覆盖库样式」这单一路径，代价是「下游全局 reset 反压库样式」与「层顺序跨来源配置」两条高影响新风险，并要求构建期改写与跨仓回归；opt-in 变体（D / D′）则以两套产物或下游构建期包裹换取同一收益，维护面与脆弱性都不划算。

> 本条目不改变任何产物与公共 API；若未来复评改为落地，须按[规划规范 §3](../../standards/planning.md)以独立条目承接（含构建改写、产物回归、下游同批验证）。

## 5. 下游覆盖口径（不落地时的边界，供 M2-4 使用）

1. **优先级**：① token（`--caomei-*` 与 `--caomei-<comp>-*`）＞ ② 组件 API（`variant` / `tone` / `size` / `wrap` 等）＞ ③ 自定义类。
2. **特异性矩阵**（库侧实测，下游需逐档超过）：

| 覆盖目标 | 库规则示例 | 库特异性 | 下游做法 |
|:---|:---|:-:|:---|
| 组件根盒 / 静态颜色 | `.caomei-button[data-v-*]` | (0,2,0) | (0,3,0) 起（如 `.app-shell .caomei-button.social-btn`）或 `:deep()` 锚定祖先 |
| 组合形态（`--block` / `--icon-only` 等） | `.caomei-button--block[data-v-*]` | (0,2,0) | 同上 |
| 内部部件 | `.caomei-button--icon-only .caomei-button__icon[data-v-*]` | (0,3,0) | `:deep()` + 祖先再加一级（≥ (0,4,0)） |
| 交互状态（`hover` / `active`） | `.caomei-button--primary[data-v-*]:hover:not(:disabled)` | (0,4,0) | **优先改 token**：状态色由 token 经 `color-mix()` 派生，改 token 即覆盖三态 |
| `disabled` / `focus-visible` | `.caomei-button[data-v-*]:disabled` | (0,3,0) | 同上（`--caomei-disabled-opacity` / `--caomei-button-focus`） |

3. **双类不保证**：下游双类（`.caomei-button.social-btn`）与库根规则同档 (0,2,0)，胜负取决于源序；源序会随打包器、代码分割与注入位置（含 resolver 的 `sideEffects` 基础层）变化，升级后可能静默失效。
4. **不要靠顺序**：任何「库后加载」假设都不可依赖；把覆盖写成顺序依赖是升级期的静默失效源。
5. **`!important` 仅为最后手段**：覆盖规则的特异性已超过目标档（或已改用 token）后复核删除。**回收口径按成因分开登记**：M2-1 修复的是「父级 scoped 选择器命中不到按钮根」，因此可由 M2-1 回收的是下游的祖先 + `:deep()` 写法；caomei-auth 的社交按钮 `!important` 成因是「同特异性 + 库后加载」，须由下游改成 ≥ (0,3,0) 的覆盖（或其改用 token）后回收，**不随 M2-1 自动可删**。

## 6. 复评条件（可判定）

满足任一即触发重新评估（届时按独立条目承接）：

- **采用面**：3 家登记下游中 **≥ 2 家**已把自身 base / reset 迁入 `@layer`，且 `Downstream Compat` 在其最新 revision 上出绿 run；
- **工具面**：构建链可经既有钩子（`css.postcss`）产出逐产物分层，且存在机检守卫断言「每个产物 CSS 以 `@layer caomei-ui` 开头」（新增守卫或指定现有文件中实现）；
- **证据面**：出现 ≥ 2 家下游因**全局元素选择器**（而非类覆盖）被迫使用 `!important` 的新证据（须附文件与选择器）。

## 7. Review Gate

- **R1（2026-11-24，`quick`，时间盒 ≤5 分钟）**：**Reject**（1 blocker / 6 warning / 3 suggest）。
  - blocker：§2 的 resolver 行称「不承载样式」，与 `src/resolver/index.ts` 的 `sideEffects: 'caomei-ui/theme.css'` 不符——基础层正由 side-effect import 进入模块序，是「顺序不可依赖」的最强证据。
  - warning：风险 5 高估（产物已依赖 `color-mix()` / `:has()`，`@layer` 不构成新增门槛）；§5 的「(0,3,0) 起」对 `hover` / `active`（(0,4,0)）不成立；`!important` 回收归因错（M2-1 修的是 scoped 命中，不是同档源序）；复评条件不可判定；漏 opt-in 方案（D / D′）；构建代价表述不准（tsdown 有 `css.postcss` 钩子，尚未实测）。
  - suggest：`theme.css` 构成不全；索引摘要错字与指针；术语（根规则 / 组合类 / 后代部件）未定义。
- **R2（2026-11-24，`quick` delta，时间盒 ≤5 分钟）**：**Pass**（0 blocker / 0 warning / 3 suggest）。复核成立：resolver `sideEffects` 已如实写入并在风险 2 / §5 条 3 引用；风险 5 降级与 `color-mix()` / `:has()` 基线对照准确；§5 矩阵五档特异性与 `dist/components/button/*scoped*.css` 逐条对上；`!important` 两条回收口径分开；复评三条可判定；opt-in 变体（D / D′）与否决理由可复核；构建代价标注「未实测」。suggest（同批修）：§7 回填 R2 结论并调整阅读序、「覆盖全部相关状态档」改为「已超过目标档」、矩阵补编译后形态。

- **R1 → R2 修复汇总**：§2 补 resolver `sideEffects` 与状态 / 部件特异性、状态色来源；§3 增 D / D′ 并修正风险 5 的权重与构建代价（标注未实测）；§4 措辞与 §5 改为特异性矩阵（含 `hover` / `active` 的 (0,4,0) 与「优先改 token」）；§5 拆开 `!important` 的两种回收口径；§6 三条复评条件改为可判定；索引摘要错字与指针同批修正。
