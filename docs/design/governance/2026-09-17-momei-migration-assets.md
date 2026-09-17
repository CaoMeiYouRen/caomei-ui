# momei 迁移 B0a 库侧资产：token 与图标映射、并存隔离策略

- 日期：2026-09-17
- 触发：Phase 7 第二阶段（2026-09-17 用户授权启动）M2「B0 交接资产」条目 M2-1 / M2-2 / M2-3
- 输入：[momei 迁移计划与验收标准（交接文档）](./2026-09-17-momei-migration-handover-plan.md) §9、[momei 迁移可行性评估记录](./2026-09-17-momei-migration-feasibility.md) §2.3 / §2.4、momei 仓库源码（只读）
- 定位：**交给 momei 项目执行迁移时使用的库侧资产**。本仓不触碰 momei 文件；本表是映射与判定口径，不是对 momei 源码的改动。
- 执行主体：资产由 caomei-ui 产出（本记录）；按映射表改写 momei 源码的工作由 momei 项目在 B2 / B3 / B4 执行。

## 1. 取证口径与可复现性

### 1.1 快照

| 项 | 值 |
| --- | --- |
| 被扫描仓库 | momei |
| 快照 commit | `cb663aee`（`docs: regression 回填改用纯文本 artifact 路径`） |
| 扫描日期 | 2026-09-17 |
| 工具 | `rg`（ripgrep），字符串扫描 |
| 排除路径 | `node_modules`、`coverage`、`artifacts`、`logs`、`research-output`、`docs`、`pnpm-lock.yaml` |
| 口径性质 | **源码判读**（字符串匹配），非运行时实测；计数会随 momei 源码变化而失效，使用时须以同一命令重新取数 |

> momei 工作区在快照时含一处已暂存的 `AGENTS.md` 修改，未纳入本次扫描范围；迁移执行前须按[交接文档 §3](./2026-09-17-momei-migration-handover-plan.md) 前置条件处理。

### 1.2 取证命令

```bash
# 被扫描仓库：momei（只读）
EX="-g !node_modules -g !coverage -g !artifacts -g !logs -g !research-output -g !docs -g !pnpm-lock.yaml"

# token：总处数 / var() 实际引用数 / 唯一数 / 文件数
rg -o --no-filename $EX -- '--p-[a-zA-Z0-9-]+' | wc -l
rg -o --no-filename $EX -- 'var\(--p-[a-zA-Z0-9-]+\)' | wc -l
rg -o --no-filename $EX -- '--p-[a-zA-Z0-9-]+' | sort -u | wc -l
rg -l $EX -- '--p-[a-zA-Z0-9-]+' | wc -l

# token：按前缀分组（Top 前缀）
rg -o --no-filename $EX -- '--p-[a-zA-Z0-9-]+' | awk -F'-' '{print $4}' | sort | uniq -c | sort -rn

# token：逐 token 计数（本表第 2 节的计数列来源）
rg -o --no-filename $EX -- '--p-[a-zA-Z0-9-]+' | sort | uniq -c | sort -rn

# 图标：总处数 / 文件数 / 唯一数
rg -o --no-filename $EX -- 'pi pi-[a-z0-9-]+' | wc -l
rg -l $EX -- 'pi pi-[a-z0-9-]+' | wc -l
rg -o --no-filename $EX -- 'pi pi-[a-z0-9-]+' | sort -u | wc -l

# lucide 落点校验：与 @lucide/vue 导出名逐项比对
#   caomei-ui 侧：node_modules/@lucide/vue/dist/lucide-vue.d.ts 提取 declare const 名称
```

### 1.3 与可行性评估 §2.3 的口径对照

| 类别 | 评估记录 §2.3 | 本次复现（1.2 命令） | 差异说明（**推定，未证实**） |
| --- | ---: | ---: | --- |
| token 处数 | 1394 | **1403** | 差 9，成因未证实 |
| token `var()` 引用 | 1312 | **1323** | 差 11，成因未证实 |
| token 唯一数 | 未给出 | **114** | — |
| token Top 前缀 | surface 492 / text 381 / primary 252 / content 126 | surface **494** / text **381** / primary **259** / content **126** | text 与 content 相同；surface 差 2、primary 差 7，成因未证实 |
| 图标处数（含 `pi-spin` 修饰类） | 598 | **629** | 差 31，成因未证实；本次含 `pi-spin` 11 处、`pi-spinner` 2 处 |
| 图标文件数 | 134 | **145** | 差 11，成因未证实 |
| 唯一命中 | 128 | **129** | 差 1；剔除 `pi-spin`（旋转修饰类，非图标）后**本记录**为 128 个图标——**旧口径的构成未知**，见下方效力边界第 4 条 |

> **口径对照的效力边界（引用本记录时必读）**
>
> 1. **评估记录 §2.3 的统计命令与排除项在仓库内无留痕**——该记录只给出数字，[momei 组件使用复核台账](./2026-09-14-momei-usage-audit.md) 只记录组件开标签口径。因此上表「差异说明」列是**推定**，不是归因。
> 2. 本次尝试 8 组扫描范围与文件类型条件（明细见 §1.4），在该条件空间内**均未复现**旧口径的 598 处 / 134 文件 / 128 唯一（最接近的一组为「排除 `composables/`」：处数 598 命中，但唯一 125、文件 139）。故**不能排除正则或调用口径差异**这一替代原因——「扫描范围差异」不是已证成的解释。
> 3. 由此，**不得据本表断言两个口径「一致」**。本次可确证的范围只有一条：**本记录自身的计数可由 §1.2 命令完整复现**（§2 的 114 行处数合计 1403，§3.2 的 128 行处数合计 618）；映射表的实体内容（114 个 token、128 个图标）以本记录为准。
> 4. 旧口径的「128 唯一」是否已剔除 `pi-spin` 修饰类，本次**无法验证**：若其沿用同一正则，则其 128 中含 `pi-spin`，真图标应为 127。该不确定性保留，不在本记录内裁定。
> 5. 后续 session 引用处数时，须连同 §1.2 的命令与排除项一并引用，不得只引数字。
> 6. **2026-09-17 用户裁定：以本记录 §1.1 / §1.2 的口径与实际扫描结果为准**（即 token 114 个唯一 / 1403 处，图标 128 个 / 629 处 / 145 个文件）。复现命令见 §1.2，差异复现尝试过程见 §1.4；评估记录 §2.3 的旧数字不再作为本阶段的验收基准。

### 1.4 口径复现尝试记录（8 组条件留痕）

为判定 §1.3 的差异成因，2026-09-17 在同一 commit（`cb663aee`）上对 8 组扫描条件逐一取数；**这 8 组是条件尝试而非穷举**（未覆盖正则变体与调用口径变体），其结论的适用范围见下方第 3 条。除下表列出的条件外，各组共用同一批基础排除项（`node_modules` / `coverage` / `artifacts` / `logs` / `research-output` / `pnpm-lock.yaml`）与同一正则 `pi pi-[a-z0-9-]+`：

| # | 扫描条件 | 处数 | 文件 | 唯一 |
| :-: | --- | ---: | ---: | ---: |
| ① | 全仓（仅基础排除） | 630 | 146 | 129 |
| ② | ① + 排除 `docs` | 629 | 145 | 129 |
| ③ | ② + 排除 `composables` | **598** | 139 | 125 |
| ④ | 仅 `.vue` | 528 | 122 | 113 |
| ⑤ | 仅 `.vue` + `.ts` | 629 | 145 | 129 |
| ⑥ | 仅 `.vue` / `.ts` + 排除 `docs` | 629 | 145 | 129 |
| ⑦ | `components/**` 或 `pages/**` | 550 | 129 | 114 |
| ⑧ | ⑦ 再加 `*.vue` | 552 | 130 | 114 |
| — | **评估记录 §2.3 目标值** | **598** | **134** | **128** |

复现脚本（`/tmp` 临时文件，未入库；条件列即 `run` 的第二个参数）。注意 `rg` 传入多个 `-g` 时按**并集**生效，故第 ⑤ / ⑦ / ⑧ 组是各自 glob 的合集而非交集：

```bash
cd <momei 仓库>   # commit cb663aee
BASE="-g !node_modules -g !coverage -g !artifacts -g !logs -g !research-output -g !pnpm-lock.yaml"
n=$(rg -o --no-filename $BASE <条件> -- 'pi pi-[a-z0-9-]+' | wc -l)   # 处数
f=$(rg -l            $BASE <条件> -- 'pi pi-[a-z0-9-]+' | wc -l)      # 文件数
u=$(rg -o --no-filename $BASE <条件> -- 'pi pi-[a-z0-9-]+' | sort -u | wc -l)  # 唯一数
```

**观察与结论**

1. **在本次测试的 8 组条件下，没有任何一组同时命中 598 / 134 / 128。** 处数 598 可由第 ③ 组（排除 `composables`）复现，但同期文件数为 139、唯一数为 125，与 §2.3 的 134 / 128 均不符。
2. §2.3 的「128 唯一」在本次全部 8 组中**从未出现**（取值范围 113 ~ 129）；其「134 文件」同样未命中（取值范围 122 ~ 146）。
3. 由此，在本次测试的条件空间内，§2.3 的三个数字**未能由同一组条件同时得出**；这可排除「仅由本次已测的扫描范围差异造成」这一解释，但**不能推广为一般性不可能**——正则口径或记录过程差异仍无法排除，且旧口径的命令与排除项在仓库内**无留痕**（§1.3 效力边界第 1 条）。差异成因的定论以 §1.3 第 6 条的用户裁定为准。
4. 本节即上述观察的可复现依据：任何第三方可用上表条件在 `cb663aee` 上复跑并核对数值。

## 2. token 对照表（`--p-*` → `--caomei-*`）

### 2.1 映射原则

1. **语义优先，不做色阶等比平移**：PrimeVue 的色阶（`--p-surface-*` / `--p-primary-*` / `--p-{red,orange,green,blue,yellow}-*`）在 momei 中承担的是**语义角色**（页面底 / 抬升底 / 边框 / 次级文本 / 主色 / 状态色）。迁移时归入本库语义 token，由语义 token 自身承担明暗切换；本库不提供 50~950 色阶，**不做数值换算**。
2. **派生档位用 `color-mix`**：需要「浅底」「深档」「半透明」时，从语义 token 用 `color-mix(in srgb, var(--caomei-color-*) X%, transparent)` 派生，不在 momei 侧硬编码新色值。
3. **组件内部 token 不迁移**：本库不暴露组件内部 token（`--p-select-*` / `--p-tabs-*` / `--p-panel-*` 等）。对应视觉由组件自身样式承担，迁移时**删除**这些声明；确需覆盖时走本库的组件级 CSS 变量钩子。
4. **无对应语义者保留局部变量**：本库没有对应语义的（紫色、等宽字体、`info`）不强行映射，保留为 momei 侧自定义变量，并在 momei 的样式层集中声明。
5. **须按消费点核对的档位**：`--p-surface-400` ~ `--p-surface-600` 在 momei 中多义（次级文本 / 占位 / 禁用底 / 边框），`--p-surface-700` ~ `--p-surface-950` 在亮 / 暗两套主题下角色相反且用法多样。表中这些行给出**默认归位**；迁移时须**逐点确认语义**，不得按表直译。

### 2.2 全量对照表（114 项）

下表覆盖 1.2 命令命中的全部 114 个唯一 token，按处数从高到低排列。「处数」为 1.2 命令的字符串命中数，同一行含多次引用会重复计数。

| token | 处数 | 本库对应 | 处理方式 |
| --- | ---: | --- | --- |
| `--p-text-muted-color` | 228 | `--caomei-color-text-muted` | 直接映射 |
| `--p-text-color` | 137 | `--caomei-color-text` | 直接映射 |
| `--p-primary-color` | 108 | `--caomei-color-primary` | 直接映射 |
| `--p-surface-border` | 96 | `--caomei-color-border` | 色阶归语义：边框 |
| `--p-surface-0` | 74 | `--caomei-color-bg` | 色阶归语义：页面底 / 卡片底 |
| `--p-content-border-color` | 73 | `--caomei-color-border` | 直接映射 |
| `--p-surface-100` | 57 | `--caomei-color-bg-elevated` | 色阶归语义：抬升底 / 悬停底 |
| `--p-surface-card` | 45 | `--caomei-color-bg-elevated` | 色阶归语义：卡片底 |
| `--p-content-background` | 41 | `--caomei-color-bg` | 直接映射 |
| `--p-surface-50` | 39 | `--caomei-color-bg-elevated` | 色阶归语义：抬升底 |
| `--p-surface-200` | 35 | `--caomei-color-border` | 色阶归语义：边框 |
| `--p-primary-500` | 32 | `--caomei-color-primary` | 色阶归语义：主色基准档 |
| `--p-primary-50` | 27 | `--caomei-color-primary` | 色阶归语义：浅底用 `color-mix` 按透明度派生 |
| `--p-surface-900` | 26 | `--caomei-color-bg` | 色阶归语义：暗色下页面底；须按消费点核对语义 |
| `--p-surface-800` | 24 | `--caomei-color-bg-elevated` | 色阶归语义：暗色下抬升底；须按消费点核对语义 |
| `--p-surface-700` | 21 | `--caomei-color-bg-elevated` | 色阶归语义：暗色下抬升底；须按消费点核对语义 |
| `--p-primary-100` | 20 | `--caomei-color-primary` | 色阶归语义：浅底用 `color-mix` 派生 |
| `--p-border-radius-md` | 20 | `--caomei-radius-md` | 直接映射 |
| `--p-surface-ground` | 17 | `--caomei-color-bg` | 色阶归语义：页面底 |
| `--p-primary-600` | 17 | `--caomei-color-primary` | 色阶归语义：深一档用 `color-mix` 压暗 |
| `--p-surface-300` | 16 | `--caomei-color-border` | 色阶归语义：边框 / 分隔 |
| `--p-text-color-secondary` | 15 | `--caomei-color-text-muted` | 直接映射 |
| `--p-surface-500` | 14 | `--caomei-color-text-muted` | 色阶归语义：次级文本 / 禁用 |
| `--p-red-500` | 14 | `--caomei-color-danger` | 状态色归语义（基准档） |
| `--p-primary-900` | 14 | `--caomei-color-primary` | 色阶归语义：深档用 `color-mix` 压暗 |
| `--p-surface-400` | 11 | `--caomei-color-text-muted` | 色阶归语义：次级文本 / 占位 |
| `--p-primary-contrast-color` | 8 | `--caomei-color-primary-foreground` | 直接映射 |
| `--p-primary-700` | 8 | `--caomei-color-primary` | 色阶归语义：深档用 `color-mix` 压暗 |
| `--p-warning-color` | 7 | `--caomei-color-warning` | 直接映射 |
| `--p-surface-600` | 7 | `--caomei-color-text-muted` | 色阶归语义：次级文本 |
| `--p-primary-300` | 7 | `--caomei-color-primary` | 色阶归语义；按用途归 primary 或 border |
| `--p-content-border-radius` | 7 | `--caomei-radius-md` | 直接映射 |
| `--p-surface-hover` | 6 | `--caomei-color-bg-elevated` | 色阶归语义：悬停底 |
| `--p-primary-400` | 6 | `--caomei-color-primary` | 色阶归语义：暗色下主色档 |
| `--p-orange-500` | 6 | `--caomei-color-warning` | 状态色归语义（基准档） |
| `--p-border-radius-sm` | 5 | `--caomei-radius-sm` | 直接映射 |
| `--p-surface-950` | 4 | `--caomei-color-bg` | 色阶归语义：暗色下页面底 |
| `--p-primary-200` | 4 | `--caomei-color-primary` | 色阶归语义；按用途归 primary 或 border |
| `--p-orange-50` | 4 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-orange-300` | 4 | — | 无对应；浅色档用 `color-mix` 派生 |
| `--p-green-500` | 4 | `--caomei-color-success` | 状态色归语义（基准档） |
| `--p-green-400` | 4 | `--caomei-color-success` | 状态色归语义（亮档） |
| `--p-content-hover-background` | 4 | `--caomei-color-bg-elevated` | 直接映射 |
| `--p-orange-700` | 3 | `--caomei-color-warning` | 状态色归语义（深档） |
| `--p-border-radius` | 3 | `--caomei-radius-md` | 按档位归位（默认档取 md） |
| `--p-yellow-500` | 2 | `--caomei-color-warning` | 状态色归语义（基准档） |
| `--p-red-700` | 2 | `--caomei-color-danger` | 状态色归语义（深档） |
| `--p-red-50` | 2 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-primary-950` | 2 | `--caomei-color-primary` | 色阶归语义：最深档用 `color-mix` 压暗 |
| `--p-primary-800` | 2 | `--caomei-color-primary` | 色阶归语义：深档用 `color-mix` 压暗 |
| `--p-overlay-modal-shadow` | 2 | `--caomei-shadow-lg` | 归语义：模态阴影 |
| `--p-orange-600` | 2 | `--caomei-color-warning` | 状态色归语义（深档） |
| `--p-green-700` | 2 | `--caomei-color-success` | 状态色归语义（深档） |
| `--p-green-50` | 2 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-font-family-mono` | 2 | — | 本库无等宽 token；保留 momei 局部自定义变量 |
| `--p-error-color` | 2 | `--caomei-color-danger` | 直接映射 |
| `--p-blue-400` | 2 | `--caomei-color-primary` | 状态色归语义：蓝即本库主色 |
| `--p-yellow-50` | 1 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-yellow-400` | 1 | `--caomei-color-warning` | 状态色归语义（亮档） |
| `--p-warning-700` | 1 | `--caomei-color-warning` | 直接映射（深档） |
| `--p-warning-500` | 1 | `--caomei-color-warning` | 直接映射（基准档） |
| `--p-warning-50` | 1 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-warn-color` | 1 | `--caomei-color-warning` | 直接映射 |
| `--p-warn-600` | 1 | `--caomei-color-warning` | 直接映射（深档） |
| `--p-text-secondary-color` | 1 | `--caomei-color-text-muted` | 直接映射 |
| `--p-tabs-tabpanel-background` | 1 | — | 组件内部 token，本库不暴露；删除 |
| `--p-tabs-tab-list-background` | 1 | — | 组件内部 token，本库不暴露；删除 |
| `--p-tabs-tab-background` | 1 | — | 组件内部 token，本库不暴露；删除 |
| `--p-tabs-tab-active-background` | 1 | — | 组件内部 token，本库不暴露；删除 |
| `--p-surface-900-rgb` | 1 | — | 无对应；用 `color-mix` 派生 |
| `--p-surface-0-rgb` | 1 | — | 无对应；用 `color-mix` 派生 |
| `--p-success-700` | 1 | `--caomei-color-success` | 直接映射（深档） |
| `--p-success-500` | 1 | `--caomei-color-success` | 直接映射（基准档） |
| `--p-select-option-selected-color` | 1 | `--caomei-color-primary` | 组件内部 token；选中前景归语义 |
| `--p-select-option-selected-background` | 1 | `--caomei-color-primary` | 组件内部 token；如需选中底色用 `color-mix` 派生 |
| `--p-select-option-focus-background` | 1 | — | 组件内部 token，本库不暴露；删除 |
| `--p-select-list-background` | 1 | — | 组件内部 token，本库不暴露；删除 |
| `--p-select-background` | 1 | — | 组件内部 token，本库不暴露；删除（由组件自身样式承担） |
| `--p-red-900` | 1 | — | 无对应；深色档用 `color-mix` 派生 |
| `--p-red-500-rgb` | 1 | — | 无对应；用 `color-mix` 派生 |
| `--p-red-300` | 1 | — | 无对应；浅色档用 `color-mix` 派生 |
| `--p-red-100` | 1 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-purple-500` | 1 | — | 本库无紫色语义；保留 momei 局部自定义变量 |
| `--p-purple-400` | 1 | — | 本库无紫色语义；保留 momei 局部自定义变量 |
| `--p-primary-rgb` | 1 | — | 无对应；用 `color-mix(in srgb, var(--caomei-color-primary) X%, transparent)` 派生 |
| `--p-primary-hover-color` | 1 | `--caomei-color-primary` | 本库无 hover 档；hover 态用 `color-mix` 派生 |
| `--p-primary-active-color` | 1 | `--caomei-color-primary` | 本库无 active 档；active 态用 `color-mix` 派生 |
| `--p-primary-900-opacity-20` | 1 | — | 无对应；用 `color-mix` + 透明度派生 |
| `--p-panel-header-background` | 1 | — | 组件内部 token（Panel 由 Card 承接）；删除 |
| `--p-panel-content-background` | 1 | — | 组件内部 token（Panel 由 Card 承接）；删除 |
| `--p-panel-background` | 1 | — | 组件内部 token（Panel 由 Card 承接）；删除 |
| `--p-overlay-popover-shadow` | 1 | `--caomei-shadow-md` | 归语义：浮层阴影 |
| `--p-orange-900` | 1 | — | 无对应；深色档用 `color-mix` 派生 |
| `--p-orange-100` | 1 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-navigation-background` | 1 | `--caomei-color-bg` | 组件内部 token；删除或归页面底 |
| `--p-info-color` | 1 | — | 本库无 info 语义；按场景归 neutral-solid / primary，或保留自定义 |
| `--p-info-500` | 1 | — | 本库无 info 语义；同上 |
| `--p-green-300` | 1 | — | 无对应；浅色档用 `color-mix` 派生 |
| `--p-green-100` | 1 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-font-family-monospace` | 1 | — | 本库无等宽 token；保留 momei 局部自定义变量 |
| `--p-font-family` | 1 | `--caomei-font-sans` | 直接映射 |
| `--p-error-700` | 1 | `--caomei-color-danger` | 直接映射（深档） |
| `--p-error-500` | 1 | `--caomei-color-danger` | 直接映射（基准档） |
| `--p-emerald-700` | 1 | `--caomei-color-success` | 状态色归语义（深档） |
| `--p-emerald-500-rgb` | 1 | — | 无对应；用 `color-mix` 派生 |
| `--p-content-text-color` | 1 | `--caomei-color-text` | 直接映射 |
| `--p-card-shadow` | 1 | `--caomei-shadow-sm` | 组件内部 token；阴影归语义 token |
| `--p-card-background` | 1 | `--caomei-color-bg-elevated` | 组件内部 token；如需卡片底用语义 token |
| `--p-border-radius-lg` | 1 | `--caomei-radius-lg` | 直接映射 |
| `--p-blue-950` | 1 | — | 无对应；深色档用 `color-mix` 派生 |
| `--p-blue-700` | 1 | `--caomei-color-primary` | 状态色归语义：蓝即本库主色 |
| `--p-blue-500` | 1 | `--caomei-color-primary` | 状态色归语义：蓝即本库主色 |
| `--p-blue-50` | 1 | — | 无对应；浅底用 `color-mix` 派生 |
| `--p-blue-300` | 1 | — | 无对应；浅色档用 `color-mix` 派生 |


## 3. 图标映射表（`pi pi-*` → `@lucide/vue`）

### 3.1 映射原则

1. **落点为目标组件名**：本库图标来源为 `@lucide/vue`（`^1.45.0`），组件名为 PascalCase，按需具名导入后放入 `#icon` 插槽或作为组件使用。
2. **改名项取新名**：lucide 1.x 对部分图标做了语义化改名（如 `alert-circle` → `CircleAlert`、`edit` → `Pencil`、`home` → `House`）。本次逐项与 `@lucide/vue` 的导出名比对，未直接命中者按其新名登记，并在「类型」列注明。
3. **填充变体由属性承载**：`pi-heart-fill` 一类填充形态在本库中由图标组件的填充属性表达，不另找图标名。
4. **`pi-spin` 不是图标**：它是 PrimeIcons 的旋转修饰类，本表不计入映射（129 个唯一命中 − 1 = 128 个图标）。旋转动效如需保留，改用本库的加载指示承载（`CaomeiProgressSpinner`，或 Button / AutoComplete 的加载态）——本库不提供独立的旋转修饰类。
5. **品牌图标无对应**：lucide 不提供品牌标识图标，11 项品牌图标见 §3.3。

### 3.2 全量映射表（128 项）

「处数」为 1.2 命令的字符串命中数；128 行处数合计 **618**（不含 `pi-spin` 修饰类）；「类型」取值为：同名直取 / 语义改名 / 填充变体 / 品牌图标（无对应）。

| 图标 | 处数 | `@lucide/vue` 落点 | 类型 |
| --- | ---: | --- | --- |
| `pi pi-trash` | 30 | `Trash` | 同名直取 |
| `pi pi-sparkles` | 25 | `Sparkles` | 同名直取 |
| `pi pi-check` | 24 | `Check` | 同名直取 |
| `pi pi-exclamation-triangle` | 22 | `TriangleAlert` | 语义改名，取新名 |
| `pi pi-refresh` | 22 | `RefreshCw` | 语义改名，取新名 |
| `pi pi-pencil` | 16 | `Pencil` | 同名直取 |
| `pi pi-plus` | 16 | `Plus` | 同名直取 |
| `pi pi-search` | 16 | `Search` | 同名直取 |
| `pi pi-times` | 16 | `X` | 语义改名，取新名 |
| `pi pi-eye` | 15 | `Eye` | 同名直取 |
| `pi pi-external-link` | 14 | `ExternalLink` | 同名直取 |
| `pi pi-lock` | 14 | `Lock` | 同名直取 |
| `pi pi-send` | 13 | `Send` | 同名直取 |
| `pi pi-check-circle` | 11 | `CircleCheck` | 语义改名，取新名 |
| `pi pi-copy` | 11 | `Copy` | 同名直取 |
| `pi pi-image` | 11 | `Image` | 同名直取 |
| `pi pi-info-circle` | 11 | `Info` | 语义改名，取新名 |
| `pi pi-arrow-right` | 10 | `ArrowRight` | 同名直取 |
| `pi pi-arrow-left` | 9 | `ArrowLeft` | 同名直取 |
| `pi pi-calendar` | 9 | `Calendar` | 同名直取 |
| `pi pi-file` | 9 | `File` | 同名直取 |
| `pi pi-user` | 8 | `User` | 同名直取 |
| `pi pi-bell` | 7 | `Bell` | 同名直取 |
| `pi pi-bolt` | 7 | `Bolt` | 同名直取 |
| `pi pi-cog` | 7 | `Cog` | 同名直取 |
| `pi pi-comments` | 7 | `MessagesSquare` | 语义改名，取新名 |
| `pi pi-download` | 7 | `Download` | 同名直取 |
| `pi pi-envelope` | 7 | `Mail` | 语义改名，取新名 |
| `pi pi-github` | 7 | — | 品牌图标，无对应 |
| `pi pi-link` | 7 | `Link` | 同名直取 |
| `pi pi-microphone` | 7 | `Mic` | 语义改名，取新名 |
| `pi pi-question-circle` | 7 | `CircleQuestionMark` | 语义改名，取新名 |
| `pi pi-exclamation-circle` | 6 | `CircleAlert` | 语义改名，取新名 |
| `pi pi-home` | 6 | `House` | 语义改名，取新名 |
| `pi pi-share-alt` | 6 | `Share2` | 语义改名，取新名 |
| `pi pi-book` | 5 | `Book` | 同名直取 |
| `pi pi-chart-bar` | 5 | `ChartBar` | 同名直取 |
| `pi pi-megaphone` | 5 | `Megaphone` | 同名直取 |
| `pi pi-times-circle` | 5 | `CircleX` | 语义改名，取新名 |
| `pi pi-box` | 4 | `Box` | 同名直取 |
| `pi pi-clock` | 4 | `Clock` | 同名直取 |
| `pi pi-code` | 4 | `Code` | 同名直取 |
| `pi pi-file-edit` | 4 | `FilePenLine` | 语义改名，取新名 |
| `pi pi-google` | 4 | — | 品牌图标，无对应 |
| `pi pi-inbox` | 4 | `Inbox` | 同名直取 |
| `pi pi-list` | 4 | `List` | 同名直取 |
| `pi pi-stop-circle` | 4 | `CircleStop` | 语义改名，取新名 |
| `pi pi-upload` | 4 | `Upload` | 同名直取 |
| `pi pi-align-left` | 3 | `TextAlignStart` | 语义改名，取新名 |
| `pi pi-angle-right` | 3 | `ChevronRight` | 语义改名，取新名 |
| `pi pi-bookmark` | 3 | `Bookmark` | 同名直取 |
| `pi pi-chevron-right` | 3 | `ChevronRight` | 同名直取 |
| `pi pi-comment` | 3 | `MessageCircle` | 语义改名，取新名 |
| `pi pi-compass` | 3 | `Compass` | 同名直取 |
| `pi pi-desktop` | 3 | `Monitor` | 语义改名，取新名 |
| `pi pi-globe` | 3 | `Globe` | 同名直取 |
| `pi pi-heart-fill` | 3 | `Heart` | 填充变体由 `fill` 属性承载 |
| `pi pi-images` | 3 | `Images` | 同名直取 |
| `pi pi-language` | 3 | `Languages` | 语义改名，取新名 |
| `pi pi-moon` | 3 | `Moon` | 同名直取 |
| `pi pi-pen-to-square` | 3 | `SquarePen` | 语义改名，取新名 |
| `pi pi-play` | 3 | `Play` | 同名直取 |
| `pi pi-qrcode` | 3 | `QrCode` | 语义改名，取新名 |
| `pi pi-shield` | 3 | `Shield` | 同名直取 |
| `pi pi-sign-in` | 3 | `LogIn` | 语义改名，取新名 |
| `pi pi-sign-out` | 3 | `LogOut` | 语义改名，取新名 |
| `pi pi-sync` | 3 | `RefreshCw` | 语义改名，取新名 |
| `pi pi-users` | 3 | `Users` | 同名直取 |
| `pi pi-volume-up` | 3 | `Volume2` | 语义改名，取新名 |
| `pi pi-ban` | 2 | `Ban` | 同名直取 |
| `pi pi-bars` | 2 | `Menu` | 语义改名，取新名 |
| `pi pi-chevron-left` | 2 | `ChevronLeft` | 同名直取 |
| `pi pi-file-check` | 2 | `FileCheck` | 同名直取 |
| `pi pi-file-export` | 2 | `FileOutput` | 语义改名，取新名 |
| `pi pi-folder` | 2 | `Folder` | 同名直取 |
| `pi pi-headphones` | 2 | `Headphones` | 同名直取 |
| `pi pi-history` | 2 | `ClockArrowUp` | 语义改名，取新名 |
| `pi pi-linkedin` | 2 | — | 品牌图标，无对应 |
| `pi pi-mobile` | 2 | `Smartphone` | 语义改名，取新名 |
| `pi pi-palette` | 2 | `Palette` | 同名直取 |
| `pi pi-replay` | 2 | `RotateCcw` | 语义改名，取新名 |
| `pi pi-search-plus` | 2 | `ZoomIn` | 语义改名，取新名 |
| `pi pi-sliders-h` | 2 | `SlidersHorizontal` | 语义改名，取新名 |
| `pi pi-spinner` | 2 | `LoaderCircle` | 语义改名，取新名 |
| `pi pi-sun` | 2 | `Sun` | 同名直取 |
| `pi pi-tags` | 2 | `Tags` | 同名直取 |
| `pi pi-twitter` | 2 | — | 品牌图标，无对应 |
| `pi pi-user-edit` | 2 | `UserPen` | 语义改名，取新名 |
| `pi pi-window-maximize` | 2 | `Maximize` | 语义改名，取新名 |
| `pi pi-building` | 1 | `Building` | 同名直取 |
| `pi pi-chart-line` | 1 | `ChartLine` | 同名直取 |
| `pi pi-circle` | 1 | `Circle` | 同名直取 |
| `pi pi-cloud` | 1 | `Cloud` | 同名直取 |
| `pi pi-cloud-upload` | 1 | `CloudUpload` | 同名直取 |
| `pi pi-code-branch` | 1 | `GitBranch` | 语义改名，取新名 |
| `pi pi-database` | 1 | `Database` | 同名直取 |
| `pi pi-directions-alt` | 1 | `Signpost` | 语义改名，取新名 |
| `pi pi-discord` | 1 | — | 品牌图标，无对应 |
| `pi pi-dollar` | 1 | `DollarSign` | 语义改名，取新名 |
| `pi pi-eye-slash` | 1 | `EyeOff` | 语义改名，取新名 |
| `pi pi-facebook` | 1 | — | 品牌图标，无对应 |
| `pi pi-folder-open` | 1 | `FolderOpen` | 同名直取 |
| `pi pi-forward` | 1 | `Forward` | 同名直取 |
| `pi pi-heart` | 1 | `Heart` | 同名直取 |
| `pi pi-id-card` | 1 | `IdCard` | 同名直取 |
| `pi pi-instagram` | 1 | — | 品牌图标，无对应 |
| `pi pi-key` | 1 | `Key` | 同名直取 |
| `pi pi-life-ring` | 1 | `LifeBuoy` | 语义改名，取新名 |
| `pi pi-list-check` | 1 | `ListCheck` | 同名直取 |
| `pi pi-map` | 1 | `Map` | 同名直取 |
| `pi pi-minus` | 1 | `Minus` | 同名直取 |
| `pi pi-paypal` | 1 | — | 品牌图标，无对应 |
| `pi pi-percentage` | 1 | `Percent` | 语义改名，取新名 |
| `pi pi-power-off` | 1 | `PowerOff` | 同名直取 |
| `pi pi-reply` | 1 | `Reply` | 同名直取 |
| `pi pi-save` | 1 | `Save` | 同名直取 |
| `pi pi-search-minus` | 1 | `ZoomOut` | 语义改名，取新名 |
| `pi pi-server` | 1 | `Server` | 同名直取 |
| `pi pi-tag` | 1 | `Tag` | 同名直取 |
| `pi pi-th-large` | 1 | `LayoutGrid` | 语义改名，取新名 |
| `pi pi-thumbtack` | 1 | `Pin` | 语义改名，取新名 |
| `pi pi-tiktok` | 1 | — | 品牌图标，无对应 |
| `pi pi-twitch` | 1 | — | 品牌图标，无对应 |
| `pi pi-unlock` | 1 | `LockOpen` | 语义改名，取新名 |
| `pi pi-verified` | 1 | `BadgeCheck` | 语义改名，取新名 |
| `pi pi-wallet` | 1 | `Wallet` | 同名直取 |
| `pi pi-wand-lines` | 1 | `WandSparkles` | 语义改名，取新名 |
| `pi pi-youtube` | 1 | — | 品牌图标，无对应 |


### 3.3 品牌图标（11 项，lucide 无对应）

| 图标 | 处理方式 |
| --- | --- |
| `pi-github` / `pi-google` / `pi-twitter` / `pi-linkedin` / `pi-facebook` / `pi-instagram` / `pi-youtube` / `pi-discord` / `pi-twitch` / `pi-tiktok` / `pi-paypal` | 见下「候选方案」 |

候选方案（由 momei 项目在 B4 收尾阶段择一，结论须登记到 momei 侧记录）：

| 方案 | 做法 | 代价 |
| --- | --- | --- |
| A. `@iconify/vue` + Simple Icons 集合 | 按需引入品牌图标，不引入字体文件 | 需给 momei 增加一个图标依赖；本库的「`@iconify/vue` 可选接入」仍是本仓 Backlog 候选，**不在本阶段范围** |
| B. 保留 `@mdi/font` | momei 现有 2 处用法已在用该字体 | 卸载 PrimeVue 后仍需保留一份图标字体，与「图标体系整体改写」的目标部分冲突 |
| C. 自建 SVG 组件 | 品牌图标数量固定且不常变 | 需自维一份 SVG 资产 |

> 判定口径：11 项各有明确落点即视为该项闭合；方案选择属 momei 侧决策，本表不预设结论。

## 4. 双库并存隔离策略与包体监控口径

### 4.1 并存期的形态

| 项 | 现状 | 迁移期的影响 |
| --- | --- | --- |
| 样式层 | PrimeVue 使用 CSS `@layer`；caomei-ui 为普通全局 / scoped CSS | 两套 token（`--p-*` / `--caomei-*`）与两套组件样式同时进入产物 |
| 组件层 | PrimeVue 组件与 caomei-ui 组件同名不同源 | 同一页面混用会造成心智与样式双重来源 |
| 主题层 | PrimeVue Aura 预设（`@primevue/themes`） | 与 caomei 预设并存时须避免全局 token 互相覆盖 |

### 4.2 隔离载体与切换粒度

- **隔离单位＝路由**：以**路由前缀**为最小切换单位，同一路由（含其子路由）内的组件来源必须唯一——要么 PrimeVue，要么 caomei-ui。禁止在同一路由内按组件逐个混用。
- **白名单载体**：白名单由 **momei 侧**维护（建议落在 `nuxt.config.ts` 的运行时配置或独立的迁移配置模块）；本仓不提供运行时开关，也不在库内引入迁移期分支——库侧不感知「并存期」这一状态。
- **切换粒度＝整路由迁移完成才切**：某个路由涉及的组件全部迁移完成并通过该批回归后，才从白名单移除；未完成的路由继续走 PrimeVue，不做半路由切换。
- **判定口径**：任一路由的白名单状态可从 momei 侧配置单点读出；「同一路由出现两套组件」为阻断项，须在 B2 / B3 / B4 各自的「文件 → 改动点」清单中体现该路由的切换时点。

### 4.3 包体监控口径

与[交接文档 §9](./2026-09-17-momei-migration-handover-plan.md) 一致，此处不重述阈值；本节只给**记录项与命令口径**。

| 项 | 要求 |
| --- | --- |
| 对比点 | B0b 基线（PrimeVue 在产物内）↔ B4 收尾（PrimeVue 卸载后） |
| 记录项 | 构建命令；两仓 commit；产物总量与 gzip / brotli 体积；按 chunk 体积；PrimeVue 与 primeicons 相关 chunk 是否归零；快照日期 |
| 命令口径 | 使用 momei 现有构建脚本产出，体积统计须记录实际命令原文，使第三方可复现 |
| 判定口径 | 记录含命令 + commit + 日期即视为可复现；PrimeVue 与 primeicons 相关 chunk 归零；总量与主 chunk 体积变化有数值 |
| 阈值 | 本表与本仓均不预设阈值，由 momei 既有包体预算承担 |

## 5. 交付状态与后续

- M2-1（token 对照表）、M2-2（图标映射表）、M2-3（并存隔离策略与包体口径）三条目的产出均在本记录内，按 `todo.md` 的对应条目验收。
- 本记录为**库侧资产**：映射结论由本仓提供，改写 momei 源码由 momei 项目在 B2 / B3 / B4 执行；本仓等待其反馈后再决定下一轮动作。
- 计数与映射随 momei 源码演进会失效：后续 session 引用时须以 §1.2 命令在同一 commit 上重新取数，并更新 §1.3 对照表。
