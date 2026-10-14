# Phase 24 范围扩展评估：组件缺口、图表库、移动端与国际化

> 创建时间：2026-10-13
> 触发指令：用户「规划的待办还是有点空了……接下来是：1. 从 rss-impact-web / timing-push-web / timing-push-admin 继续分析组件缺口；2. 开始评估图表库封装；3. 开始评估移动端优化；4. 国际化参照 `2026-10-06-phase19-m7-1-i18n-research.md` 继续深入，选高频语言覆盖主流」
> 性质：**Phase 24 执行期的阶段范围变更评估**（[规划规范 §3.1 / §3.2](../../standards/planning.md) 准入与追加 + [§3.9](../../standards/planning.md) 阶段条目构成变更面）——产出提案与待裁定 D 项；**本记录未改 `todo.md` / `roadmap.md` / `backlog.md`**，裁定后的落地见 §10。
> 取证时点：**2026-10-13 22:50 +08:00**（三仓为**本地工作区快照 + git 元数据**，属外部易变事实、非钉定值）。

---

## 1. 触发与背景

- Phase 24（机制远端生效与判别力收口、CI 环境治理、治理装置与规划载体补口）已于 2026-10-13 登记（3 条主线 / 8 条原子条目），但**8 条全部是治理与机制类**：零 `src/**` 改动、零组件能力、零用户体验面交付。
- 用户指出「待办还是有点空了……**没有实际内容的改动也不太好**」，并给出四个内容方向（组件缺口 / 图表库封装 / 移动端优化 / 国际化深化）。
- 本记录的任务：把四个方向转成**可执行的原子条目**，并按 [规划规范 §6 阶段容量](../../standards/planning.md)（**3 ~ 6 条主线**）给出 Phase 24 的**主线重划**建议。
- 三仓中 `rss-impact-web` 属路线图目标下游；`timing-push-web` / `timing-push-admin` 为**新增分析对象**（本仓此前未登记为下游）。

---

## 2. 三仓实测取证（可复现）

| 项目 | remote | 最后提交 | Vue | UI 库 | 图表 | i18n | `@media` | 消费 caomei-ui |
|:---|:---|:---|:---|:---|:---|:---|:-:|:-:|
| **rss-impact-web** | `git@github.com:CaoMeiYouRen/rss-impact-web.git` | `676f664`（2026-09-01；GitHub 远端已推进至 2026-10-13） | Vue 3.5 | **Element Plus 2.14.5** + `@smallwei/avue` 3.9.4 | `echarts` 6.1.0 + `vue-echarts` 8.1.0 | **无**（0 处 `$t(`、无 locale 目录） | **0** | 否 |
| **timing-push-web** | `git@gitee.com:caomeiyouren/timing-push-web.git` | `8981eb3`（**2024-10-15，停更约 2 年**） | **Vue 2.6.14** | **Vuetify 2.6.3** | 无 | **无** | **0** | 否 |
| **timing-push-admin** | `git@gitee.com:caomeiyouren/timing-push-admin.git` | `e875816`（**2024-10-19，停更约 2 年**） | **Vue 2.6.14** | `@smallwei/avue` 2.9.4（Element UI 系） | `echarts` 4.9.0 + `v-charts` 1.19.0 | **无** | **0** | 否 |

**取证命令**（三仓本地工作区，均为洁净）：

```shell
node -e "const p=require('./package.json');console.log({...p.dependencies,...p.devDependencies})"   # 依赖
git -C <项目> log -1 --format='%h %ci' ; git -C <项目> remote get-url origin ; git -C <项目> status --porcelain | wc -l
grep -rhoE "<(el|v|av)-[a-z-]+" src | sort | uniq -c | sort -rn      # 组件用量形态
grep -rn "@media" src | wc -l ; grep -rn "\$t(" src --include=*.vue --include=*.js | wc -l
```

**三条关键口径（影响后续判断，须显式登记）**：

1. **`timing-push-*` 不在 GitHub**：`gh repo list CaoMeiYouRen --limit 1000`（**486 仓**）无 `timing-*` 匹配，GitHub 全局搜索亦无同名仓库 → 两仓实际托管在 **gitee**，且**技术栈为 Vue 2**（Vuetify 2 / avue 2）、**停更于 2024-10**。故其迁到 caomei-ui 属 **Vue 2 → Vue 3 重写级**工作，**不构成本阶段的落地对象**；但其**组件用量是缺口分析的有效输入**。本仓**只读取证、不触碰其仓库**。
2. **三仓 i18n 用量均为 0** → 「扩语言」**不是下游驱动**，而是**库自身的主流覆盖与可迁移性**取向（与 §6 结论一致；不得包装成下游需求）。
3. **三仓 `@media` 用量均为 0** → 三仓**自身未编写断点样式**，响应式由**所用 UI 库的栅格 / 容器体系**承载（Vuetify `v-row` / `v-col`、Element `el-row` / `el-col`）→ **本库缺栅格**直接转化为下游使用本库后的移动端适配缺口（§5）。

---

## 3. 方向一：组件缺口分析

### 3.1 用量矩阵（三仓实测，含本库现状）

| 组件族 | rss-impact-web | timing-push-web | timing-push-admin | 本库现状 |
|:---|:---|:---|:---|:---|
| **栅格与布局**（Row / Col / Container / Spacer） | `el-row` **7** / `el-col` **15** | `v-row` **21** / `v-col` **39** / `v-container` **10** / `v-spacer` **13** | `el-row` **13** / `el-col` **34** | **缺** |
| **Tooltip** | `el-tooltip` 3 | `v-tooltip` 7 | `el-tooltip` 1 | **缺** |
| **导航骨架**（Menu / SubMenu / MenuItem） | `el-menu` 1 / `el-menu-item` 1 / `el-sub-menu` 1 | `v-menu` 5（动作型） | `el-menu` 1 / `el-menu-item` 1 / `el-submenu` 1 | **缺**（本库 `DropdownMenu` 为**动作菜单**、非导航型） |
| **Breadcrumb** | `el-breadcrumb(-item)` 2（另有自建 `Breadcrumb.vue`） | — | `el-breadcrumb(-item)` 2 | **缺** |
| **Icon 包装** | `el-icon` **15** | `v-icon` **26** | — | **缺**（本库直接用 `@lucide/vue`；`@iconify/vue` 候选在册） |
| **Alert**（内联常驻提示） | — | `v-alert` 3 | — | **缺**（本库 `Message` 为可关闭提示条，语义接近但非同一形态） |
| **Form / FormItem**（表单容器与校验） | 自建 `CrudForm.vue` | `v-form` 5 | `el-form` / `el-form-item` 3 | **缺**（本库为字段组件 + 外部表单） |
| **BackTop**（回到顶部） | `el-backtop` 1 | — | — | **缺** |
| **Rating** | — | `v-rating` 1 | — | **缺** |
| **TimePicker**（独立） | — | `v-time-picker` 2 | — | **缺**（本库 `DatePicker` 面板内已含时间选择） |
| **App Shell**（AppBar / Main / Overlay / Fab） | — | `v-app` 3 / `v-main` 3 / `v-toolbar` 4 / `v-overlay` 4 / `v-fab-transition` 2 | — | 部分（有 `Toolbar`；缺 shell / overlay / fab） |
| **List** | — | `v-list` 2 / `v-list-item` 2 | — | **缺**（可用 `#`-less 容器 + 样式承接） |
| **已有能力**（对照） | Button / Image / Dropdown / Tabs / Collapse≈Accordion / DatePicker / InputNumber | Button / Card / TextField≈Input / Dialog / Divider / Select / Textarea / Switch / Snackbar≈Toast / FileInput≈FileUpload / ProgressCircular≈ProgressSpinner / NavigationDrawer≈Drawer / Tabs | Button / Input / DatePicker / Image / Upload≈FileUpload / Dropdown / Select / Progress | 均已具备（等价物；**`Scrollbar` 不在此列**——本库无该组件，Backlog §1.2 已判「不自研」，见 §3.2） |

> 计数为**形态计数**（`grep -rhoE` 的标签出现次数，含同一文件的多次使用），用于**相对排序**，不代表运行时调用次数。

### 3.2 交叉结论与优先级建议

- **P0①（活跃仓最高频 + 结构性地基）**：**栅格与布局族**（`Row` / `Col`，含 gutter / 断点 / offset 语义，可选 `Container` / `Spacer`）——**在活跃仓 `rss-impact-web` 内即为第一高频族**（栅格族合计 22 次，超过第二名 `el-icon` 15），且下游响应式由栅格承载（§2 口径 3）→ 依据**不依赖停更仓**。
- **P0②（跨仓共识 + 独立语义 + 成本低）**：**Tooltip**——三仓全部使用（3 / 7 / 1），**但其中 7 次来自非落地仓 `timing-push-web`**，活跃仓 `rss-impact-web` 仅 3 次；故其优先级依据为「**跨仓共识（含停更仓，仅作缺口面参考）** + 独立 primitive 语义 + 实现成本低」，**不与 P0① 同强度**（若需纯活跃仓依据，可下调为 P1）。
- **P1①（两仓以上共识 + 结构性）**：**导航骨架**（`Menu` / `SubMenu` / `MenuItem`，含折叠与键盘导航）+ **Breadcrumb**（`rss-impact-web` 与 `timing-push-admin` 各有使用，前者另有自建 `Breadcrumb.vue`）。
- **P1②**：**Alert**（与 `Message` 语义分离，内联常驻提示）。
- **P2（单仓 / 低频 / 可替代）**：`BackTop`、`Rating`、独立 `TimePicker`、`Icon` 包装、App Shell、`Overlay`、`Fab`、`List` → **维持 Backlog 候选**，触发条件 = 对应下游出现真实迁移排期。
- **不纳入**：`Scrollbar`（已完成「不自研」裁定）、App Shell（属**应用层组合**，本库以组件为单位提供）、`Form`/`FormItem`（**体量大且标准分歧多**：校验规则 / 布局 / 与字段契约的耦合，须先出专项评估 → 见 §8 D2 ③）。

### 3.3 与既有 API 的兼容性初判

- 栅格为**新增组件族**（命名拟 `CaomeiRow` / `CaomeiCol`）→ 不改既有组件，**无破坏性变更**；样式需走既有语义 token 与 `check:design` 规则面。
- `Tooltip` 与既有 `CaomeiPopover` **同源不同 primitive**（Reka `Tooltip` vs `Popover`）：可复用浮层档位契约与 z-index 门禁（[设计规范 §7](../design-spec.md)），但须独立 a11y 契约（`role="tooltip"` + `aria-describedby`、无焦点陷阱、hover / focus 双触发）。
- `Menu` 与既有 `DropdownMenu` **语义不同**（导航 vs 动作），须独立组件；`Breadcrumb` 可基于容器 + `aria-current` 实现。

---

## 4. 方向二：图表库封装评估

### 4.1 现状取证

- 三仓中 **2 仓使用图表**：`rss-impact-web`（`echarts` 6.1.0 + **`vue-echarts` 8.1.0**，唯一图表页 `src/views/admin/DailyCount.vue`，本地快照）、`timing-push-admin`（`echarts` 4.9.0 + `v-charts` 1.19.0，Vue 2 停更）；`timing-push-web` 无图表。
- 本库：**零图表能力**。Backlog §1.3 已定「图表库封装 → 维持**外购不自研**（候选 ECharts 等）；**暂未使用**，等出现真实用例后再按「外购不自研 + 先暗色 / 国际化联动、后兼容主题」同口径评估」——**触发条件（真实用例）现已成立**（`rss-impact-web` 有真实图表页，且官方 Vue 3 封装 `vue-echarts` 已在实际使用）。

### 4.2 方案比较与建议

| 方案 | 内容 | 代价 | 建议 |
|:---|:---|:---|:---|
| **A** | **不封装**：文档化「ECharts + `vue-echarts`」用法 + 提供 **token 桥接**（暗色 / 主题预设联动、`Intl` 数字与日期格式），**不新增依赖** | 需在文档与示例维护用法（站点可加图表示例页） | **推荐** |
| **B** | 轻量封装 `<CaomeiChart>`（包 `vue-echarts`，作为**可选 peer**，形态同 `CaomeiRichTextEditor`） | 新增可选 peer + 封装面 + 基线 + 版本跟踪 | 备选（触发 = 出现「统一主题开箱即用」诉求或第二仓接入） |
| **C** | 自研图表渲染 | 极高（等价重写 ECharts 子集） | **不推荐**（维持「不自研」取向） |

- **建议取 A**（**裁定见 §10.1 D3：用户取方案 B（轻量封装 + 可选 peer + 暗色与国际化联动）**——本节为提名期建议，已让渡给 §10）：`vue-echarts` 是官方维护的 Vue 3 封装、再包一层收益低，本库增量在主题 token / 暗色 / 国际化联动；用户取向为**提供开箱即用的联动封装**，故最终取 B。
- 最小验收（A）：文档页 + 可运行示例（消费方直连 `vue-echarts`）+ 暗色 / 预设切换下的图表色可验证 + `pnpm verify` 不回归；**零新增运行时依赖**。

---

## 5. 方向三：移动端与响应式优化评估

### 5.1 现状取证

- **本库**：`src/**` 已有 **37 处 `@media`**（口径 = `grep -rn "@media" src --include=*.vue --include=*.css | wc -l`，即 **34 个 `.vue` + 3 个 `.css`**；**同命令不限扩展名**时为 **45 行**——多出的 8 行在 `.ts`（`dialog/breakpoints.ts` 1 行 + 2 个测试文件 7 行），属**程序化断点**而非样式媒体查询，故窄口径取 37）；[设计规范](../design-spec.md) §响应式约定 **sm 640px / md 768px / lg 1024px**，且**未定义** `--caomei-breakpoint-*`（`@media` 不支持自定义属性，断点以文档约定 + 字面量维护）；[响应式设计](../responsive.md) 承载窄屏行为矩阵；常驻 E2E 已有 `responsive.e2e.ts` 多视口用例（历史 3 个小屏适配批次 + 多视口基线）。
- **下游**：三仓 `@media` **均为 0** → 三仓自身不写断点样式，响应式由**所用 UI 库的栅格体系**承载；`timing-push-web` 为**移动优先**应用（定时推送），其界面即 Vuetify 栅格 + card 组合。
- **在册裁定**：触摸目标 ≥ 44px 命中区——用户曾裁定**暂不提升**（Backlog §1.5）；滚动容器键盘聚焦「无条件完整可见」为 Chromium 机制限制（Backlog §1.5）。

### 5.2 建议范围

1. **栅格与布局族落地**（与 §3.2 P0① **同一交付物**，不重复计条目）——它是下游响应式的地基。
2. **移动端形态收敛**：把大块组件的窄屏形态（`DataTable` / `Dialog` / `Drawer` / `Tabs` / `Toolbar` / `Paginator` / `DataView`）在 [响应式设计](../responsive.md) 中**逐条落为可断言口径**，并把**可机检者纳入常驻 E2E 视口矩阵**（现状 37 处 `@media` 只覆盖部分组件）。
3. **触摸目标复核**：以三仓真实命中区取证（按钮 / 列表项 / 分页器 / 开关的实测尺寸），产出「是否提升至 44px」的**复核结论**——原裁定为「暂不提升」，本轮以证据**请求复核**（不预设结论）。
4. **移动端使用指南页**：新增「移动端与响应式」指南（用法 → 断点 → 常见陷阱），与 [响应式设计](../responsive.md) 分工（**设计侧 vs 使用侧**）。

### 5.3 非目标

- 不做原生 App / 手势库 / 虚拟滚动；不引入 Tailwind / UnoCSS；**不改既有断点数值**（属视觉契约，变更须独立评估）。

---

## 6. 方向四：国际化深化评估（第二轮）

### 6.1 第一轮结论引用与本轮新变量

- 第一轮（[2026-10-06 Phase 19 M7-1](./2026-10-06-phase19-m7-1-i18n-research.md)）：主流库内建语言条目 **43 ~ 72**（地区变体拉高条目数）；本库 **5 语**（`zh-CN` / `zh-TW` / `ja-JP` / `ko-KR` / `en-US`）；**每新增一种语言 ≈ 138 行**；`check:locale-keys` 以 `zh-CN` 为基准（27 命名空间 / 78 键）；分包两条路线（**A 按语言子路径导出** / **B 单包 + 按需动态导入**）；RTL 属独立维度；日期经 `Intl` 与 `@internationalized/date`、**无 dayjs 耦合**。
- **本轮新变量**：① 三仓 i18n 用量为 **0**（§2 口径 2）→ 需求定位为**库侧主流覆盖**；② 用户明示「**至少覆盖主流的国际化语言**」。

### 6.2 语言集建议（主流覆盖）

| 层级 | 语言 | 理由 |
|:---|:---|:---|
| **一期（建议本阶段落地）** | **`es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`** | Backlog §1.4 在册 5 语；覆盖使用面最大的非中文 / 非英语语种（含拉美葡语变体） |
| **二期（建议同期只评估 + 结构预留）** | `it-IT` / `nl-NL` / `pl-PL` / `tr-TR` / `vi-VN` / `th-TH` / `id-ID` | 补齐欧盟余量与东南亚（Vue 生态常见新增语） |
| **独立维度** | `ar`（RTL）+ `he` / `fa` / `ur` | `dir="rtl"` 与逻辑属性贯通，**单独立项评估**（第一轮结论维持） |

### 6.3 工程形态建议（与 6.2 联动）

- 体量：现 5 语合计 **854 行**（`wc -l src/locale/*.ts`：5 语言 × 138 + `index.ts` 22 + `types.ts` 142）→ 按**每语言 138 行**计，追加 5 语 **+690 行**、合计约 **1,544 行**（内容约 +16 KiB）→ **绝对体量仍小**，但**结构上**建议同期落地 **方案 A（按语言子路径导出，如 `caomei-ui/locale/es-es`）并保留根入口全量导出**（**additive、非破坏性**），使未用语言可被 tree-shake；备选为方案 B（仅文档声明 + 动态导入引导）。
- 守卫与台账同步：`check:locale-keys`（5 语 × 78 键 → 10 语 × N 键）、`check:locale-ledger`（中英台账表 ↔ `types.ts` 结构对账）须同批扩展；组件文档的语言展示面若有清单也须同步。
- 最小验收：10 语键集合一致；台账对账通过；`caomei-ui/locale/<lang>` 子路径**冒烟可用**（`check:build` / 解包冒烟）；文档声明用法；**不改既有根入口行为**。

### 6.4 非目标

- **不做 RTL 实现**；不追头部库 43 ~ 72 条目量级；**不在库内引入 vue-i18n 运行时**（本库为注入式机制）；不改 `CaomeiConfigProvider` 既有契约。

---

## 7. 主线重划建议（6 条主线，符合 [规划规范 §6](../../standards/planning.md) 的 3 ~ 6 条）

| 主线 | 内容 | 条目数（估） |
|:---|:---|:-:|
| **M1 机制收口与回归判别力**（**现状保留**） | 视觉基线阻断形态首次远端执行复核 / 下游兼容检查版本差判别力 | 2 |
| **M2 治理装置与 CI 环境治理**（**现 M2 + M3 合并**） | CI 运行器镜像检测与重冻结 / 暂存区卫生机检 / 归档块逐条 RG 计数对账 / 规划载体候选口径对账守卫 / 取证命令守卫扩面 / 规划载体口径消缺 | 6 |
| **M3 组件缺口补齐**（新） | 栅格与布局族（P0①）/ Tooltip（P0②）/ 导航骨架 Menu + Breadcrumb（P1①）/ Alert（P1②） | 4 |
| **M4 图表能力与主题桥接**（新） | 图表用法文档 + 可运行示例 + 暗色与预设联动的 token 桥接（方案 A） | 1 |
| **M5 移动端与响应式优化**（新） | 移动端形态收敛 + 视口矩阵扩面 / 触摸目标复核 / 移动端使用指南页 | 3 |
| **M6 国际化深化**（新） | 追加 5 语（`es` / `fr` / `de` / `ru` / `pt-BR`）+ 守卫与台账同步 / 按语言子路径导出（方案 A）与文档 | 2 |

- 合计 **18 条原子条目**（现有 8 + 新增 10；新增条目在裁定后按 [规划规范 §4](../../standards/planning.md) 细化验收标准）。
- **不纳入本阶段**（维持 Backlog / 条件触发）：`Form` / `FormItem`（先出专项评估）、`BackTop`、`Rating`、独立 `TimePicker`、`Icon` 包装、App Shell、`Overlay`、`Fab`、`List`、RTL、二期语言、图表方案 B。

---

## 8. 待决策 D 项

| 编号 | 决策点 | 选项 |
|:---|:---|:---|
| **D1** | Phase 24 主线结构 | ① **按 §7 重划为 6 条主线**（现 M2 + M3 合并为 M2，新增 M3 ~ M6）（推荐）② 不合并、直接追加 4 条主线（共 7 条，**超阶段容量**）③ 只追加内容主线、把治理压成 1 条（共 5 条）④ 其它 |
| **D2** | 组件缺口范围 | ① **P0 + P1 四项**（栅格 / Tooltip / 导航骨架 / Alert）（推荐）② 仅 P0 两项（栅格 + Tooltip）③ 四项 + `Form` / `FormItem`（体量大，须先评估）④ 仅出评估、不落地 |
| **D3** | 图表库取向 | ① **方案 A**（文档 + token 桥接，零新增依赖）（推荐）② 方案 B（轻量封装，可选 peer）③ A + B 都做 ④ 维持候选 |
| **D4** | 移动端优化范围 | ① **三项**（形态收敛 + 触摸目标复核 + 指南页）（推荐）② 仅形态收敛 + 视口矩阵扩面 ③ 三项 + 触摸目标**提升落地**（改视觉契约）④ 仅出评估 |
| **D5** | 国际化范围 | ① **一期 5 语 + 分包方案 A + 守卫台账同步**（推荐）② 仅 5 语、分包维持候选 ③ 一期 5 语 + 二期 7 语一并落地 ④ 仅出方案、不落地 |

---

## 9. 核对与边界声明

- **取证性质**：三仓为**本地工作区快照 + git 元数据**（时点 2026-10-13 22:50 +08:00）。`rss-impact-web` 本地 checkout = `676f664`（2026-09-01），**落后于 GitHub 远端**（远端推进至 2026-10-13）；其 `package.json` 由 `gh api` 另取（`element-plus ^2.14.6` / `echarts ^6.1.0` / `vue-echarts ^8.3.0`），与本地快照**同栈、版本号略高** → 实现批次开工前须**重取**。
- **未复验项**：三仓产物体积与构建状态；Element Plus / Vuetify / avue / `vue-echarts` 的行为细节（均按**工具快照口径**，深度核对在条目实现前单独执行）；分语言 gzip 增量（留待实施前专项，与第一轮 §6 一致）；触摸目标的真实命中区尺寸（§5.2 ③ 属待取证项，本记录**不预设结论**）。
- **负命题口径就地给出**：① 「`timing-push-*` 不在 GitHub」的检索口径 = `gh repo list CaoMeiYouRen --limit 1000`（486 仓，无 `timing-*` 匹配）+ GitHub 仓库搜索无同名项目 + 两仓 `origin` 实测为 `gitee.com`；② 「三仓未消费 caomei-ui」= 三仓 `package.json` 依赖清单内无 `caomei-ui` 条目（依赖读取命令见 §2）。
- **计数口径**：组件用量 = 形态计数（`grep -rhoE`，含重复出现）；本库 `@media` = **37**（窄口径 = 34 `.vue` + 3 `.css`；**同命令不限扩展名时为 45**，差集在 `.ts` 的程序化断点与测试文件，口径说明见 §5.1）；语言体量 = `wc -l src/locale/*.ts` 合计 **854 行**（每语言 138 行）。
- **规划纪律（产出时点）**：未改 `todo.md` / `roadmap.md` / `backlog.md`；未分配新阶段编号；未回写任何下游仓库；裁定后的落地见 §10。

---

## 10. 决策结果与登记结果（2026-10-13 用户裁定）

> 本节落实用户裁定；**§3 ~ §9 的全部提议口径（含 §4.2 的图表方案建议 A、§5.2 移动端范围、§6.2 语言集、§7 主线重划、§8 决策项）均让渡给本节**——发生分歧时本节为唯一权威（例：§4.2 建议方案 A，§10.1 D3 裁定取方案 B）。

### 10.1 决策结果（D1 ~ D5）

| 编号 | 决策点 | 裁定 | 执行口径 |
|:---|:---|:---|:---|
| **D1** | Phase 24 主线结构 | **本阶段只追加两条内容主线（组件缺口 + 图表库），其余两条进 Backlog、下阶段做**；治理主线维持现状（**不合并**） | 追加 **M4 组件缺口补齐** / **M5 图表能力** → Phase 24 共 **5 条主线**（3 治理 + 2 内容，符合 [规划规范 §6](../../standards/planning.md) 的 3 ~ 6 条容量）；**移动端与响应式**、**国际化深化**两个方向**登记为 Backlog 候选**（含范围摘要与触发条件），下阶段评估时直接取用 |
| **D2** | 组件缺口补齐范围 | **P0 + P1 四项** | M4-1 栅格与布局族 / M4-2 `Tooltip` / M4-3 导航骨架（Menu + Breadcrumb）/ M4-4 `Alert`；P2 项（`BackTop` / `Rating` / 独立 `TimePicker` / `Icon` 包装）与 `Form` / `FormItem` **登记 Backlog 候选**；App Shell / `Overlay` / `Fab` / `List` 记「应用层组合、不提供」（结论留档） |
| **D3** | 图表库取向 | **轻量封装（方案 B）**，依赖作**可选 peer**，并做好**暗色与国际化文本联动** | M5-1 `<CaomeiChart>` 封装（`echarts` / `vue-echarts` 为可选 peer，形态同 `CaomeiRichTextEditor`）+ M5-2 暗色 / 预设 / 语言文本联动与文档示例；**零新增运行时依赖**（peer 可选） |
| **D4** | 移动端与响应式范围 | **三项**（形态收敛 + 视口矩阵扩面 / 触摸目标复核 / 移动端使用指南页） | **不进本阶段** → 登记为 Backlog 候选（含三项范围与验收口径），下阶段落地 |
| **D5** | 国际化范围 | **一期 5 语（`es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`）+ 分包方案 A（按语言子路径导出）+ 守卫与台账同步**；RTL 维持独立立项 | **不进本阶段** → 登记为 Backlog 候选（二期 7 语并入原「语言矩阵 - 长期」候选行） |

> **默认落定（2026-10-13）**：图表方案 C（自研）不纳入；P2 组件与 `Form` / `FormItem` 维持候选；RTL 与二期语言维持登记；不引入 Tailwind / UnoCSS 与 vue-i18n 运行时。

### 10.2 登记结果（2026-10-13）

- **阶段范围变更**：Phase 24 由 **3 条主线 / 8 条原子条目** 扩为 **5 条主线 / 14 条原子条目**（**M1** 机制收口与回归判别力 2 / **M2** CI 环境治理 1 / **M3** 治理装置与规划载体补口 5 / **M4** 组件缺口补齐 4〔新增〕/ **M5** 图表能力 2〔新增〕；构成对账 2 + 1 + 5 + 4 + 2 = 14，**既定编号未重排**）。构成对账：8 + 4 + 2 = **14**。
- **`todo.md`**：`当前状态` 段改为「5 条主线 / 14 条原子条目」并追加本范围变更说明；`Phase 24 原子条目` 表追加 **M4-1 ~ M4-4** 与 **M5-1 ~ M5-2**（各带验收标准，状态「待执行」）；`非目标` 段补入「不落地移动端三项与国际化一期语言（转 Backlog）」「图表不新增运行时依赖」；`未完成项汇总` 补两条新候选的指针。
- **`backlog.md`**：**迁出 1 行**（§1.3「图表库封装」→ 纳入 M5，原「暂未使用」触发条件已成立）；**新增 6 行**——§1.2 长尾组件候选 +4（`Form` / `FormItem`、`BackTop`、`Rating`、独立 `TimePicker`）、§1.4 国际化候选 +1（国际化深化：一期 5 语 + 分包方案 A）、§1.5 移动端与响应式候选 +1（移动端与响应式优化：三项）；**就地修订 1 行**（§1.4「语言矩阵 - 长期」→ 收敛为「二期语言集（`it` / `nl` / `pl` / `tr` / `vi` / `th` / `id`）」）；**§3 已评估、不纳入 +1 行**（App Shell / `Overlay` / `Fab` / `List`：应用层组合与可替代形态，本库不提供，结论留档）。**候选池复算**：32 − 1 + 6 = **37**（逐段数据行 = 5 + 2 + **4** + **4** + **3** + 15 + 1 + 3）。
- **`roadmap.md`**：阶段表 Phase 24 行的目标与核心交付补入两条内容主线（条目数 8 → 14）；§1 现状句与规划纪律注补本次范围变更时点。
- **治理索引**：本记录条目追加「裁定与登记」段。
- **`.session` 阶段态**：本批命中**阶段范围变更**触发点（[规划规范 §3.9](../../standards/planning.md) / todo-manager Step 3.5）→ 同批同步 `current-task.yaml` 的 `current_phase` / `active_plan` / `next_steps` 与 `runtime-state.json` 的 `plan_state`。
- **Review Gate**：本记录提名期 R1 `standard` **`Pass`**（0 blocker / 3 warning / 3 suggest；实测约 **17 分 20 秒**，**超 10 分钟时间盒**，归因跨仓取证 + 组件用量矩阵与语言体量逐项复算，按 [AI 协作规范 §3.3](../../standards/ai-collaboration.md) 仅作**分级校准信号**）；3 warning / 3 suggest **已同批收口**（`1,634` → `1,544` 行（按每语言 138 行）/ 移除误列的 `Scrollbar` / P0② 依据拆分为「含停更仓的跨仓共识」/ `@media` 双口径 37 与 45 / 弱化全称断言 / 改引 §3.1 / §3.2 + §3.9）；**范围变更登记批次的 Review Gate 结论见本记录 §10.2 末行同批回填**。

### 10.3 执行期追加（2026-10-14，第二次）

- **触发**：用户在 M3-2 交付后提出「计数漂移体现在哪 / 这些数字是否必要」并指令排查 → 裁定**方案 A**（减少优先）并**授权插队**。
- **追加内容**：Phase 24 追加 **2 条治理装置条目**（M3-6 门禁读数不复述 / M3-7 读数对账装置换族）→ **5 条主线 / 16 条原子条目**。
- **时点值保留**：§10 的「5 条主线 / 14 条原子条目」（2026-10-13 范围变更后）为**时点值**，不回改。
- **载体**：[计数漂移排查与方案 A 落地](./2026-10-14-count-drift-investigation-and-method-a.md)、`todo.md`、`roadmap.md`、[第八轮范围评估 §8.3](./2026-10-13-next-stage-scope-evaluation-8.md)、本记录索引摘要。
