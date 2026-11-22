# 下一阶段范围评估（第二十五轮）

> 创建时间：2026-11-22
> 触发：用户指令「开始下阶段内容规划」。
> 性质：**评估记录，不构成阶段登记**。本轮只做现状读数、候选判定、主线草案与决策点；用户裁定后另行登记 `todo.md` / `roadmap.md`（[规划规范 §3](../../standards/planning.md)）。
> 基线：`master` = `50d6d3a0`（`origin/master` 同点，工作区干净）；当前无进行中阶段。

## 1. 现状读数

| 面 | 读数 |
|:---|:---|
| 版本 | `latest` = **`1.4.0`**（2026-11-21 经 CI 发布）；`package.json` 同为 `1.4.0`。`v1.4.0..HEAD` 共 **10 个提交**，其中 **4 个 `feat`**（TimePicker 布局与默认秒、DatePicker 默认宽度、破坏性提交审查 2 条）、1 个 `refactor`（新组件可访问名走 `labelAttrs`）、1 个 `test`（组件尺寸门禁）、4 个 `docs` |
| 下一版本判定 | 按发布链 `@semantic-release/commit-analyzer`（`conventional-changelog-cmyr-config`），`v1.4.0..HEAD` 的 `feat` 提交决定下一次为 **minor（`1.5.0`）**；`1.4.1` 需人工覆盖版本判定，与现行发布链口径冲突，本轮不推荐（见 §4 默认落定） |
| 仓库 | `master` = `50d6d3a0`，`origin/master` 同点；工作区干净；无未推送提交 |
| Issue / PR | open issue **1**（[#71](https://github.com/CaoMeiYouRen/caomei-ui/issues/71) 规划文档模型 v1；owner 2026-11-22 04:23 UTC 巡检评论指出**仅剩一处失效指引**，收口后即可关闭）；open PR **0**；#73 已关闭 |
| 安全告警 | Dependabot open **0**（`Security Alerts` `50d6d3a0` success）；Code Scanning open **0** |
| CI | `master` Test / Deploy Pages / Security Alerts / TODO to Issue / CodeQL 在 `50d6d3a0` 全 success；**Weekly Regression 最近一次 success 为 2026-11-21 13:32 UTC（`7ee8f7c`）**，该点距 HEAD **11 个提交**，发布前须在 HEAD 重跑 |
| 下游锁定版本 | 取各仓 `pnpm-lock.yaml` 解析值（2026-11-22）：dependfix **`1.4.0`**（HEAD `5870042b`）/ caomei-auth **`1.4.0`**（`8cc2e89`）/ momei **`1.4.0`**（`596c25fd`）。三仓均无 `primevue` 直接导入（momei 仅有 `tests/modules/primevue-residual-guard.test.ts` 守卫用例） |
| 下游能力用量 | caomei-auth 用 `CaomeiFormItem` **12 个文件**；`validate` 相关命中 **34 处**（`function validate*` **12** + `const validate*` **15** + 调用 7，`grep -rn --include='*.vue' --include='*.ts'`，2026-11-22）；`:error=` 绑定 **49 处**；三仓日期组件均已消费 `CaomeiDatePicker`（上一轮读数 4 + 1 + 1 文件） |
| 规划载体 | `todo.md` 无进行中阶段；`roadmap.md` §1 当前版本 `1.4.0`；Backlog 在册 **43 行**（§1.1 1 / §1.2 2 / §1.3 0 / §1.4 4 / §1.5 7 / §1.6 14 / §1.7 1 / §1.8 1 / §1.9 1 / §1.10 0 / §1.11 12） |
| 归档载体 | `docs/plan/archive/` 为 21 个文件（20 个 `todo-archive-phases-*.md` 分片 + `index.md`）；`check:archive-index` / `docs:check:links` 在 `0f07c91a` 后已复核通过 |
| 长期任务 | 第 **45** 轮（2026-11-21，Phase 40 收口）：待执行批次 **0 项**；条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持 |
| wisdom | **1 条活跃**（`pnpm distill:wisdom --check` → `WISDOM_OK`）；未达 20 条蒸馏阈值 |

## 2. 候选盘点与判定

### 2.1 判定口径

- **阶段相关面**：表单结构能力、日期选择器形态、发布收口、规划载体与可达性残留收尾。
- **证据优先级**：下游真实用量 > 生态对照与 Reka primitive 可用性 > 维护者目标。没有下游用量的候选必须标注为 **产品驱动 / 生态缺口**，不得写成「下游已达标」。
- **容量**：按[规划规范 §6](../../standards/planning.md) 主线 3–6（上限 8）、原子条目建议 10–15（上限 20）。
- **不新增阶段编号**：本节候选不获得 `Phase N`；编号在授权时取「已有最大编号 + 1」。

### 2.2 逐条判定

| # | 候选 | 来源 | 证据与判定 | 落点 |
|:-:|:---|:---|:---|:---|
| C1 | Form 校验能力 | Backlog §1.11 P1；Phase 40 D1 ④ 移出 | **下游驱动，当前证据最强**。caomei-auth **12 个文件**使用 `CaomeiFormItem`，校验仍以 `function validate*` **12** + `const validate*` **15** 手写实现，并以 **49 处 `:error` 绑定**回传；`docs/components/form.md` 与迁移表均声明「不内建 rules 引擎」。本机 `reka-ui` 2.11 实测导出 `FormRoot` / `FieldRoot` / `FieldControl` / `FieldError` / `FieldLabel` / `FieldDescription` / `FieldValidity`，具备最小接线条件 | **阶段候选（核心）** |
| C2 | MonthPicker / YearPicker | Backlog §1.11 P2 | 形态缺口，**无下游用量，属产品驱动**。`DatePicker` 现为 `selectionMode: 'single' \| 'range'`，面板由内部 `CalendarPanel` / `CalendarRangePanel` 组合；Reka 2.11 已有 `MonthPickerRoot` / `YearPickerRoot` primitive。可作为 `selectionMode` 的增量扩展，不改 `single` / `range` 语义 | **阶段候选（推荐随附，D2 ③ 可移出）** |
| C3 | P2 组件广度（Statistic / Countdown / Tour / Carousel / Watermark / Splitter / Anchor / QRCode / ContextMenu 系列） | Backlog §1.11 P2（9 行） | 无下游用量；均为生态对照缺口。若纳入，建议只取 2 件（Statistic / Countdown），其余维持候选 | **可选批次（待 D0）** |
| C4 | Tree / TreeSelect | Backlog §1.11 P1 | `TreeRoot` 在 Reka 为 **Alpha**，需锁版本与回归；三仓无 `Tree` 用量。成本与风险高于收益 | **维持 Backlog** |
| C5 | 国际化二期 7 语（`it-IT` / `nl-NL` / `pl-PL` / `tr-TR` / `vi-VN` / `th-TH` / `id-ID`） | Backlog §1.4 | 语言集已收敛；三仓仍只在 `zh-CN` / `en-US` 间切换，**无新增下游语言需求**。7 语文案、台账、可访问名与回归面显著 | **待用户决策** |
| C6 | 语言矩阵长期 / 复数与插值 / RTL | Backlog §1.4（3 行） | 触发条件均未命中：无新下游语言需求、无带计数的内建文案、RTL 已裁定单独立项 | **维持 Backlog** |
| C7 | 发布收口（下一版本 `1.5.0`） | 本轮读数 | `v1.4.0` 后已积压 10 个提交（含 2 个功能 `feat`、1 个 a11y `refactor`）；三仓均停在 `1.4.0`，`DatePicker` 默认宽度与 `TimePicker` 默认秒尚未进入下游。周回归最近成功点在 HEAD 前 11 个提交，发布前须重跑 | **阶段候选（核心）** |
| C8 | 规划与治理收尾（issue #71 + 失效指引） | issue #71 巡检评论 | 分片改名、进度表机检、归档块 6 项均已落地；唯一遗留为 `docs/plan/todo-archive.md` 的「存量 `phase-*.md` 为遗留命名……候选见 Backlog §1.6」已失效（Backlog 无该候选）。收口一句并回写即可关闭 issue | **阶段候选（治理）** |
| C9 | 单 Demo 抽屉预览（P2） | Backlog §1.6 | P1 整页预览已交付；P2 需 Demo 注册表与预览路由（约 3–4 天），属文档站体验增强，用户未裁定 | **维持 Backlog** |
| C10 | 宽屏视觉基线（1536 / 1920）+ `xl` 断点 | Backlog §1.6（2 行） | 触发条件 = 宽屏出现真实回归或用户裁定；`xl` 属公共 API 增量，规则未定前不加空断点 | **维持 Backlog** |
| C11 | 移动端第二波（滚动容器焦点 / Toolbar 769–1023 / 通用 Picker / Sticky / NavBar / 软键盘 / Search 栏） | Backlog §1.5（7 行） | `caomei-todo` 仍只有文档、无应用代码；无 iOS 真机反馈；各候选均为「原生可覆盖或应用层先行」 | **维持 Backlog** |
| C12 | 长尾组件（Rating 扩展 / Sidebar / ScrollPanel） | Backlog §1.1 + §1.2（3 行） | 均已有处置结论：Rating 半星以外形态触发未命中；Sidebar 可由 Drawer 机械承接；ScrollPanel 评估为不自研 | **维持 Backlog** |
| C13 | 基建与依赖候选（多版本托管 / ui-validator follow-up / Tailwind preset / Storybook / `conventional-changelog` 8 / 外链守卫扩展 / CI 镜像检测 / `typescript` 7 / `glob` override / dev hydration / `conventional-changelog` `!` 撤回） | Backlog §1.6（11 行） | 触发条件均未命中：无多版本并行需求、无合法非图片外链用例、`ubuntu-26.04` 检测点未命中、`vue-tsc` / `tsdown` 仍不支持 TS 7 原生 API、上游未支持 `glob ≥ 14.0.2`、preset 未发布兼容 writer 9 的版本 | **维持 Backlog** |
| C14 | 通用对话框服务 `useDialog` | Backlog §1.7 | 已评估「暂不实现」；无非组件上下文的命令式弹窗用例 | **维持 Backlog** |
| C15 | momei 侧迁移反馈 | Backlog §1.8 | 三仓均已升级 `1.4.0` 且无 PrimeVue 直接导入；**momei 页面级反馈仍未提供**，执行主体在 momei | **等待外部反馈** |
| C16 | I5 可选运行时 `@iconify/vue` peer | Backlog §1.9 | 触发条件 = 出现「必须运行时按字符串加载」的真实用例；当前未出现 | **维持 Backlog** |
| C17 | 未发布变更的升级注意（DatePicker 宽度 / TimePicker 默认秒 / `labelAttrs`） | 本轮读数（非 Backlog 行） | 三项均在 `v1.4.0` 之后：`DatePicker` 默认宽度由统一宽度改为内容档位（12 / 15 / 18rem）、`TimePicker` 默认 `showSeconds: true` 且布局重做、新组件可访问名改走 `labelAttrs`。均属下游可感知变化，需随发布条目写入升级注意 | **随 C7 / M3** |
| C18 | 可访问名残留 1 处（`time-picker/wheel-column.vue` 模板级 `:aria-label="label"`） | 长期任务第 45 轮读数（非 Backlog 行） | 模板级直接绑定绕过 `labelAttrs`；Phase 40 后新组件已收敛，仅剩该文件。1 文件改动，需定向测试 | **阶段候选（小项）** |
| C19 | DataTable 虚拟滚动 | Phase 36 M2-2 评估（非 Backlog 行） | 已评估「可行（有条件）」；触发 = 单页 > 200 行实测或用户裁定，本轮无新用量证据。**注意：该项无 Backlog 行载体**，触发条件以 Phase 36 评估为准，不再转述为「维持 Backlog」 | **维持触发（无阶段动作）** |

**候选覆盖声明**：Backlog 在册行逐小节计数为 §1.1 **1** / §1.2 **2** / §1.3 **0** / §1.4 **4** / §1.5 **7** / §1.6 **14** / §1.7 **1** / §1.8 **1** / §1.9 **1** / §1.10 **0** / §1.11 **12** = **43 行**。本轮逐条判定 **19 项**（C1 ~ C19）：阶段候选（核心）**2 项**（C1 / C7）+ 治理收尾 **1 项**（C8）、阶段候选（推荐随附）**1 项**（C2）、阶段候选（可选）**1 项**（C3）、待用户决策 **1 项**（C5）、等待外部反馈 **1 项**（C15）、维持 Backlog / 触发 **9 项**（C4 / C6 / C9 ~ C14 / C16）、非 Backlog 行的本轮读数 **3 项**（C17 / C18 / C19）。Backlog 43 行的映射：C1 + C2 + C3（9 行）+ C4 = §1.11 的 12 行；C5 + C6 = §1.4 的 4 行；C9 + C10 + C13（11 行）= §1.6 的 14 行；C11 = §1.5 的 7 行；C12 = §1.1 + §1.2 的 3 行；C14 = §1.7 的 1 行；C15 = §1.8 的 1 行；C16 = §1.9 的 1 行。**逐条均有落点，无静默豁免**；C17 ~ C19 为不在候选池的本轮读数，不改变任何 Backlog 行。

## 3. 主线草案（待用户裁定）

> 本节是候选 → 主线的唯一映射口径；条目为草案，不构成登记。推荐核心为 **M1 ~ M4**（4 主线 / 11 条）；可选项 M5 / M6 由 D0 决定。

| 主线 | 候选 | 原子条目（草案） |
|:---|:---|:---|
| M1 表单校验能力 | C1 | M1-1 接线探针与契约；M1-2 最小实现；M1-3 文档 / 示例 / 迁移表；M1-4 双通道回归与 a11y |
| M2 日期选择器形态扩展 | C2 | M2-1 `month` / `year` 模式与测试；M2-2 文档与登记面 |
| M3 发布收口 | C7、C17 | M3-1 发布前门槛复核与升级注意；M3-2 `1.5.0` 发布与发布后校验；M3-3 下游兼容复验与记录 |
| M4 治理与可达性收尾 | C8、C18 | M4-1 issue #71 失效指引收口与关闭；M4-2 可访问名残留收口 |
| M5 P2 组件广度（可选，仅 D0 ③ / ⑤） | C3 | M5-1 Statistic 实现与测试；M5-2 Statistic 文档与登记面；M5-3 Countdown 实现与测试；M5-4 Countdown 文档与登记面 |
| M6 国际化二期（可选，仅 D0 ④ / ⑤） | C5 | M6-1 7 语语言包与注册；M6-2 台账 / 键集合守卫 / 译文复核；M6-3 文档与状态表扩容 |

**构成对账**：以下计数以 **D1 ① / D2 ① / D3 ①** 为基准——推荐核心 4 + 2 + 3 + 2 = **11 条**；D0 ② 为 4 + 3 + 2 = **9 条**；叠加 M5 后 **15 条**；叠加 M6 后 **14 条**；M5 + M6 全取后 **18 条**（超建议 15、未达拆阶段上限 20，登记记录须说明拆分判断）。减法选项按同一基准重算：D1 ③ 把 M1 由 4 缩为 1 → **8 条**；D2 ③ 移出 M2 → **9 条**；D3 ③ 移出 M3 → **8 条**；其余 D0 组合在登记记录按所选选项重新对账。**任一组合若低于 3 主线或 10 条，登记前须重议组合或说明补足。**

### M1 表单校验能力

- **范围**：以 Reka `FormRoot` / `Field*` 承接最小校验层——① `CaomeiForm` 接收服务端 `errors` 并在提交时聚焦首个无效字段；② `CaomeiFormItem` 将 `validate` / `validation-mode` 透传到 `FieldRoot`，由 `FieldError` 渲染错误行；③ 保留既有 `invalid` / `error` 受控通道，并在文档单点声明与 Field 校验的优先级；④ 中英组件页、示例与迁移表改写（去掉「无等价 rules 引擎」的绝对句）。
- **非目标**：不引入 Element Plus 式 `rules` DSL（除非 D1 ②）；不做异步校验请求管理；不替换 13 个字段的既有契约；不改 `FormItem` 现有插槽作用域；不承诺与五库 API 对齐。
- **验收下限**：必填 / 自定义 `validate` / 服务端错误回填 / 提交聚焦首个无效字段 / 错误 `role="alert"` 与 `aria-describedby`；受控 `error` 与 Field 校验同时存在时的优先级断言；中英示例；单测 + 定向 E2E；新增文案（若有）纳入 locale 台账；axe 打开态通过。
- **风险**：Reka `FieldRoot` 依赖 `FieldControl` 包裹实际控件，现有 13 个字段能否直接作为 control **需先探针**；探针失败则本主线降级为「只设计」（M1 缩为 1 条），不硬改字段契约。双通道并存易出现两套口径，须以测试锁定优先级。

### M2 日期选择器形态扩展

- **范围**：`selectionMode` 增加 `month` / `year`，复用 Reka `MonthPickerRoot` / `YearPickerRoot` 或扩展内部 `CalendarPanel`；值仍为 `Date`，粒度按模式归一化（在契约中写定日 / 时 / 分 / 秒的归一化规则）；默认宽度档位纳入现有几何门禁；中英组件页、示例、设计清单与侧栏。
- **非目标**：不做 `selectionMode="multiple"`（除非 D2 ②）；不做月 / 年与 `showTime` 的组合；不改 `single` / `range` 语义；不做 RTL 日期面板。
- **验收下限**：`month` 选择结果与显示正确；`year` 选择结果与显示正确；`minValue` / `maxValue` 截断生效；键盘与读屏路径；320 / 768 / 1280；亮暗；`showTime` 组合触发开发期告警；几何门禁覆盖新档位。
- **风险**：`Date` 粒度归一化（月 / 年模式的日与时部分）是同下游绑定的契约，需先定后写；`MonthPicker` / `YearPicker` 在 Reka 的成熟度与本地封装成本需在 M2-1 首步实测。

### M3 发布收口

- **范围**：① 在 HEAD 重跑 `Weekly Regression`，复核安全告警 0、`pnpm verify` 与覆盖率门禁；② 把未发布变更写入升级注意——`DatePicker` 默认宽度档位（12 / 15 / 18rem，可用 token 覆盖恢复旧宽度）、`TimePicker` 默认 `showSeconds: true` 与布局重做、新组件可访问名改走 `labelAttrs`；③ 经 `release.yml` 发布 `1.5.0` 并做发布后校验；④ 记录自动 dispatch 的下游兼容 run 与三仓 revision，回写锁定版本读数。
- **非目标**：不改发布触发模型、不自动发布、不进入 2.0、不重指 tag、不强制下游升级、不为发版专门改代码。
- **验收下限**：周回归 `success` + 安全告警 0 + `pnpm verify`；npm `1.5.0` 可解析、`v1.5.0` tag 与 GitHub Release 存在、CHANGELOG / 版本句 / `package.json` 一致；下游兼容 run 有记录（success 或红因已归因）；升级注意写入指南/发布说明。
- **风险**：周回归未绿则发布条目阻塞，**不得降级发布**；`1.5.0` 的版本判定来自 `feat` 提交，若用户坚持 `1.4.1` 需人工覆盖发布链，须另作决策。

### M4 治理与可达性收尾

- **范围**：① `docs/plan/todo-archive.md` 的「存量 `phase-*.md` 为遗留命名……候选见 Backlog §1.6」改为纯前向命名说明；`docs/standards/planning.md` §7 的「新分片命名与存量豁免同见该节」同步去掉存量豁免表述；回写 issue #71 结论并关闭。② `src/components/time-picker/wheel-column.vue` 的模板级 `:aria-label="label"` 改走 `labelAttrs`，补定向测试与空标签断言。
- **非目标**：不重写既有归档块；不追溯 6 项字段的历史块；不改 400 行阈值与索引正序；不做全库同类机械扫描（已由 Phase 40 交付与长任务读数覆盖）。
- **验收下限**：`check:archive-index` / `docs:check:links` / `check:planning-numbers` 绿；issue #71 按 completed 关闭；模板级 `:aria-label="label"` 复测为 0；单测覆盖空标签与非空标签。
- **风险**：失效指引若只删不补，会让「新分片命名」失去唯一落点；须保留 `todo-archive-phases-*` 的前向命名说明并回链该节。

## 4. 推荐组合与决策点

**推荐核心**：**M1 ~ M4**（表单校验 + 日期形态扩展 + `1.5.0` 发布 + 治理与可达性收尾，4 主线 / 11 条）。理由：

- **M1 是本轮唯一有直接下游证据的结构性缺口**：caomei-auth 12 个文件、27 个手写校验函数（另 7 处调用）、49 处错误绑定；Reka primitive 已具备接线条件。先做最小层可避免一次性投入 rules 引擎的决策风险。
- **M3 是自然收口**：`v1.4.0` 后已有 4 个 `feat` 提交积压，且 `DatePicker` / `TimePicker` 的默认形态变化需要进入下游；发布门禁已由 CI 固化。
- **M4 是低风险闭环**：issue #71 已到「改一句即可关闭」的状态；可达性残留仅 1 个文件，与治理记录同批收口可避免再留悬空指针。
- **M2 属产品驱动的低成本形态补齐**：`DatePicker` 已是三仓在用的组件，月 / 年粒度是常见的表单诉求；但**无下游直接用量**，是否纳入由 D2 决定。
- **M5 / M6 均无新的下游证据**：P2 组件与二期语言维持候选，避免无需求驱动的广度扩张。

### 决策点

- **D0 阶段取向**：
  ① **推荐：M1 + M2 + M3 + M4**（4 主线 / 11 条）
  ② **精简：M1 + M3 + M4**（3 主线 / 9 条；不做日期形态扩展）
  ③ **① + M5（P2 两件）**（5 主线 / 15 条）
  ④ **① + M6（国际化二期 7 语）**（5 主线 / 14 条）
  ⑤ **① + M5 + M6**（6 主线 / 18 条；超建议 15，登记记录须说明拆分判断）
- **D1 Form 校验形态**（D0 五个选项均含 M1，故均生效）：
  ① **最小实现**（推荐；`FormRoot` 服务端 errors + `FieldRoot` `validate` 透传 + 提交聚焦首个错误，不做 rules DSL）
  ② 最小实现 + 本地 `rules` DSL（对齐五库，体量与兼容风险显著上升）
  ③ 只设计（契约 + 探针，不落地实现；M1 由 4 条缩为 1 条）

  > 本轮不提供「不纳入 Form」的 D0 组合；若要求整条移出 M1，请在 D0 直接说明，按移出 4 条重算组合（推荐组合变为 3 主线 / 7 条，低于建议条目数 10，登记时须说明或补足）。
- **D2 日期扩展范围**（D0 取 ① / ③ / ④ / ⑤ 时生效）：
  ① **仅 `month` / `year`**（推荐；不改 `single` / `range` 语义）
  ② `month` / `year` + `selectionMode="multiple"`（额外一期，值与交互面显著增加）
  ③ 不纳入（M2 整条移出）
- **D3 发布时点**：
  ① **阶段末发 `1.5.0`**（推荐；与现有阶段节奏一致）
  ② **先发 `1.5.0` 收口当前未发布变更**（M3 前置到阶段开始；M3 按两轮执行，条目数不变），阶段末按新增提交再发一次（版本由发布链计算，预计 `1.6.0`；下游更早拿到 `DatePicker` / `TimePicker` 修正，但一轮阶段两次发布）
  ③ 不发布（`latest` 维持 `1.4.0`；M3 整条移出，C17 升级注意不在本阶段交付）

**默认落定（无需单独提问）**：

- **下一版本按 `feat` 判定为 `1.5.0`**；不采用 `1.4.1`（需人工覆盖发布链，且与 `v1.4.0` 后的 `feat` 提交冲突）。
- **M4 默认纳入**：issue #71 收口与可达性残留各 1 条；若不纳入，issue 维持 open 且残留继续留在长任务读数中。
- **周回归复核纳入 M3-1 发布前置**；未绿则发布条目阻塞，不单列候选。
- **M1 的探针先行**：探针失败降级为「只设计」，并在条目记录写明原因，不硬改字段契约。
- 不新增运行时依赖；日期 / 数字格式化只用平台 `Intl` 与 Reka / `@internationalized/date` 现有能力。
- 未选中候选维持 Backlog / 触发状态，清单与理由见 §2.2，不在此重复列举。
- 不进入 2.0、不改版本策略、不自动发布、不自动推送。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| Form 接线探针 | 13 个字段并非都能直接作为 Reka `FieldControl`（组型控件 / 内层可访问控件落点不同） | M1-1 先做一次性探针；失败则降级为「只设计」，M1 缩为 1 条并留痕 |
| 双通道口径 | `invalid` / `error` 与 Field 校验两套来源 | 文档单点声明优先级（显式受控 > Field 校验）；测试覆盖两者冲突 |
| 日期粒度 | `month` / `year` 模式下 `Date` 的日 / 时归一化未定 | M2-1 首步写定契约（月 → 当月 1 日 00:00，年 → 1 月 1 日 00:00，按本地时区），文档与测试同批锁定 |
| 未发布形态变化 | `DatePicker` 默认宽度、`TimePicker` 默认秒会让下游布局 / 表单值变化 | M3-1 升级注意逐项列明；文档给 token 覆盖恢复旧宽度的配方；发布说明追加 |
| 发布前置 | 周回归最近 success 点在 HEAD 前 11 个提交 | 在 HEAD 重跑 `Weekly Regression`；未绿则 M3-2 阻塞，不降级发布 |
| 版本判定 | `1.4.1` 与 `1.5.0` 两种口径并存于历史记录 | 本轮只按发布链判定 `1.5.0`；历史 `todo-archive` 的点时「是否发 1.4.1」不回改 |
| 阶段容量 | D0 ⑤ 为 6 主线 / 18 条，超建议 15 | 登记记录须说明拆分判断（超建议 15 条）；实施按 10 文件 / 800 行阈值拆分 |
| wisdom | 1 条活跃，未达 20 | 阶段归档前按 `pnpm distill:wisdom --check` 复核；不因蒸馏拖延安档 |

## 6. 声明与落点

- 本记录只做评估：未分配阶段编号、未改 `todo.md` / `roadmap.md`、未改 `src/**`、未新增依赖、未关闭 issue。
- Backlog 本轮不改动；§2.2 判定的全部条目仍在原表行（43 行）。
- 用户裁定 D0 ~ D3 后，按[规划规范 §4](../../standards/planning.md) 取「已有最大编号 + 1」登记（授权时再写定值），并同批同步 `todo.md` / `roadmap.md` / 治理索引 / `.session`；登记记录须写主线 / 条目构成对账与 Review Gate。
- 评估记录的 Review Gate 见 §7；未 `Pass` 前不得据此登记阶段。

## 7. Review Gate

- **R1（2026-11-22，`standard`，时间盒 ≤10 分钟）**：**Reject**。blocker **1**（RG-B01：D0 ② 含 M1，但 D1 生效范围排除 ②、D1 ④ 的退路又指向含 M1 的 ②，形成死选项）；warning **3**（RG-W01：34 / 27 两套「手写校验」口径；RG-W02：D1 ③ / D2 ③ / D3 ③ 未给减法重算；RG-W03：「为何不拆阶段」误用于 18 条超建议 15 的场景）；suggest **4**（RG-S01：D0 ③ / ⑤ 重复列举 P2 子集；RG-S02：C2 同时标「可选」与列入推荐核心；RG-S03：索引缺快照日期；RG-S04：§7 占位）。修复：D1 改为对全部 D0 组合生效并删除死选项 ④；统一「27 个手写校验函数 + 7 处调用」；补减法重算与基准句；改「说明拆分判断」；D0 ③ / ⑤ 去重；C2 标签与覆盖声明同步；索引补快照口径。**用时**：启动 `13:44:16`；返回后下一次宿主时间记录为 `13:53:25`（其间含修复编辑），实测上限 **9 分 09 秒**，未超盒。
- **R2（2026-11-22，`standard` delta，时间盒 ≤10 分钟）**：**Pass**。RG-B01 与 RG-W01 / W02 及 S01 ~ S03 闭合；RG-W03 残留 §5 一处（按 `code-reviewer` 标记为复发），另派生 RG-W04（减法组合可能低于 3 主线 / 10 条）与 suggest 1（索引用量数字）。修复：§5 改「须说明拆分判断」；§3 补「任一组合低于 3 主线或 10 条须重议或补足」；索引摘要改为回链本记录 §1。**用时**：`13:53:25` → `13:56:03`，实测 **2 分 38 秒**，未超盒。
- **R3（2026-11-22，`standard` delta，时间盒 ≤10 分钟）**：**Pass**。R2 的 RG-W03 残留、RG-W04 与 suggest 1 全部闭合，计数链（11 / 9 / 15 / 14 / 18、减法 8 / 9 / 8、19 项分类、43 行映射）未漂移；§7 回填与 R1 / R2 实际结论逐项一致。**用时**：`13:56:47` → `13:58:58`，实测 **2 分 11 秒**，未超盒。
- **非阻塞 follow-up（登记阶段前处理，不改变本轮放行）**：① R3 suggest 1——「超 15 条 → 说明拆分判断」「7–8 主线 → 为何不拆阶段」的阈值到表述映射尚无机检载体，RG-W03 已复发一次；登记记录落笔时按 `planning.md` §6 逐句核对，后续可在守卫或规范中补一条对照。② R3 suggest 2——D0 ② 的 9 条未就地标注「低于建议 10 条」；§3 已有全局规则覆盖，若用户选 ②，登记记录须写明补足或说明。
