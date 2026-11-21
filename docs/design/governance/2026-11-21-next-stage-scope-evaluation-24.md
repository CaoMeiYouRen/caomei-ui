# 下一阶段范围评估（第二十四轮）

> 创建时间：2026-11-21
> 触发：用户指令「开始下阶段规划」。
> 性质：**评估记录，不构成阶段登记**。本轮只做现状读数、候选判定、主线草案与决策点；用户裁定后另行登记 `todo.md` / `roadmap.md`（[规划规范 §3](../../standards/planning.md)）。
> 基线：`master` = `f5cf0c32`（`origin/master` 同点，工作区干净）；当前无进行中阶段。

## 1. 现状读数

| 面 | 读数 |
|:---|:---|
| 版本 | `latest` = **`1.3.0`**（2026-11-14 经 CI 发布）。`1.3.0` 之后累计交付 **11 个组件包**未发布：`action-sheet` / `back-top` / `cell` / `descriptions` / `empty` / `input-otp` / `popconfirm` / `rating` / `result` / `tabbar` / `time-picker`（`git log v1.3.0..f5cf0c32 --diff-filter=A -- 'src/components/*/index.ts'`） |
| 仓库 | `master` = `f5cf0c32`，`origin/master` = `f5cf0c32`，无未推送提交；Phase 39 经 PR #72 rebase 合并 |
| Issue / PR | open issue **1**（[#71](https://github.com/CaoMeiYouRen/caomei-ui/issues/71) 规划文档模型 v1，规则层已采纳，存量改名批次未执行）；open PR **0** |
| 安全告警 | Dependabot open **0**；Code Scanning open **0** |
| CI | `master` Test / Deploy Pages / Security Alerts / TODO to Issue / CodeQL 全 success（2026-11-21 08:30 UTC） |
| 周回归 | **2026-11-20 12:09 UTC `cancelled`**；最近成功 **2026-11-14**。`release.yml` 的 `pnpm check:weekly-regression` 要求最近一次为 `success`，非绿即中止发布，故发布前必须重跑 |
| 下游锁定版本 | 取各仓 `pnpm-lock.yaml` 解析值（2026-11-21）：dependfix **`1.2.0`**（HEAD `6759a6a9`）/ caomei-auth **`1.3.0`**（`b3100bd`）/ momei **`1.3.0`**（`29a7c262`）。三仓均未消费 `1.3.0` 之后的组件 |
| 下游语言切换 | 三仓 `app.vue` 均以 `CaomeiConfigProvider :locale` 在 `zh-CN` / `en-US` 间切换：`CaomeiConfigProvider` 引用 momei **6** / caomei-auth **4** / dependfix **2** 个文件；`CaomeiDatePicker` 4 + 1 + 1、`CaomeiInputNumber` 15 + 1、`CaomeiPaginator` 3 + 1、`CaomeiDataTable` 20 + 6 + 14、`CaomeiFileUpload` 1（`grep -rl --exclude-dir=node_modules --exclude-dir=.nuxt` 文件数） |
| 长期任务 | 第 **43** 轮（2026-11-21，Phase 39 收口）：待执行批次 **0 项**；条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持 |
| wisdom | **20 条活跃**（`pnpm distill:wisdom --check` → `WISDOM_NEEDS_DISTILL: 20 active entries (threshold 20)`）；下个阶段归档前必须蒸馏 |
| 文档站 | 设备预览 P1 整页 iframe 已交付（Phase 39 M6）；P2 单 Demo 抽屉仍在 Backlog §1.6 |

## 2. 候选盘点与判定

### 2.1 判定口径

- **阶段相关面**：国际化功能缺口（并附文档收口）、表单结构能力、发布收口、规划载体机械治理。
- **证据优先级**：下游真实用量 > 生态对照与 Reka primitive 可用性 > 维护者目标。没有下游用量的候选必须标注为 **产品驱动 / 生态缺口**，不得写成「下游已达标」。
- **容量**：按[规划规范 §6](../../standards/planning.md) 主线 3–6（上限 8）、原子条目建议 10–15（上限 20）。
- **不新增阶段编号**：本节候选不获得 `Phase N`；编号在授权时取「已有最大编号 + 1」。

### 2.2 逐条判定

| # | 候选 | 来源 | 证据与判定 | 落点 |
|:-:|:---|:---|:---|:---|
| C1 | 国际化功能缺口 #1 ~ #6 | [三问调研](./2026-11-18-i18n-component-and-mobile-research.md) §3.3；Backlog §1.4 | **下游驱动，当前最高价值**。三仓均用 `ConfigProvider` 切换 `zh-CN` / `en-US`，且实际使用受影响的日期、数字、分页、上传与表格组件。现状：`DatePicker` / `Calendar` 的 `locale` 默认 `zh-CN`、`weekdayFormat: 'narrow'`、`hourFormat: '24'`；`InputNumber` 未向 Reka `NumberFieldRoot` 透传 `locale`；`Paginator` 用 `String(value)`；`FileUpload` 体积用 `toFixed(1) + ' KB'`；`DataTable` 列宽手柄与 `FileUpload` 移除按钮为硬编码中文可访问名。六项均属**输出错误或读屏语言错误**，不是缺功能 | **阶段候选（核心）** |
| C2 | 支持语言与翻译状态表 | Backlog §1.6；调研 §3.5 | 数据源齐备（`check:locale-keys` / `check:locale-ledger` / 复核记录），缺的是一张「语言 × 分发形态 × 键覆盖 × 复核状态」总表；与 C1 同批做不会引入新代码面 | **阶段候选（核心，随 C1）** |
| C3 | Form 校验能力 | Backlog §1.11 P1（生态对照） | **产品驱动 / 生态缺口**。`Form` / `FormItem` 现为独立组合层，`FormItem` 已有受控 `invalid` / `error`，不内建 rules；caomei-auth 在 12 个文件使用 `CaomeiFormItem`，但校验仍手写受控。Reka 2.11 实测导出 `FormRoot` / `FieldRoot` / `FieldError` / `FieldLabel` / `FieldDescription`，且支持 `validate`、`validation-mode`、服务端 `errors` 与提交聚焦首个无效字段 | **阶段候选（可选）** |
| C4 | `1.4.0` 发布与下游复验 | Phase 39 遗留；`v1.3.0..f5cf0c32` 新增组件 | 11 个新组件包未发布，下游三仓全部停在 `1.2.0` / `1.3.0`；发布是让 Phase 34 ~ 39 成果进入下游的常规路径。发布后 `release.yml` 自动 dispatch 下游兼容检查（tag 由 `GITHUB_TOKEN` 创建，只能走 `workflow_dispatch`） | **阶段候选（核心）** |
| C5 | 规划文档模型 v1 存量改名 + 机检 | issue #71；[研判记录](./2026-11-20-planning-doc-model-v1-evaluation.md) §3.6 | 规则层已采纳；剩余为机械批次（存量 `phase-*.md` 分片 19 个实测 → `todo-archive-phases-*.md`，链接面 135 处 / 23 文件，含治理记录与归档块回扫句）。与功能改动混批会放大 diff 与回滚面 | **独立机械批次（待授权）** |
| C6 | 国际化二期 LTR（7 语） | Backlog §1.4 | 语言集已收敛为 `it-IT` / `nl-NL` / `pl-PL` / `tr-TR` / `vi-VN` / `th-TH` / `id-ID`；**无新的下游语言需求**，7 语文案、台账、可访问名与回归面显著 | **待用户决策** |
| C7 | 语言矩阵长期扩容 | Backlog §1.4 | 触发条件 = 出现新的下游语言需求；本轮未命中 | 维持 Backlog |
| C8 | 复数与插值能力 | Backlog §1.4 | 触发条件 = 出现第一条带计数的内建文案；本轮无新增计数文案 | 维持 Backlog |
| C9 | RTL（阿拉伯语） | Backlog §1.4 | 2026-11-18 用户已裁定不随二期批量落地，须单独立项；本轮无 RTL 下游需求 | 维持 Backlog |
| C10 | P1 高级组件（Tree / Transfer / Cascader / Timeline） | Backlog §1.11 | 生态缺口，无下游用量；Tree 依赖 Reka `TreeRoot` Alpha，需锁版本与回归。Transfer / Cascader / Timeline 可独立封装，但属产品驱动 | **可选阶段候选**（M4 取 Transfer / Cascader / Timeline） |
| C11 | P2 高级组件（10 行） | Backlog §1.11 | 无下游用量，优先级低；`MonthPicker` / `YearPicker` 是 `DatePicker` 的 `selectionMode` 扩展，成本最低但可延后 | 维持 Backlog |
| C12 | DataTable 虚拟滚动 | [Phase 36 M2-2 评估](./2026-11-17-phase36-m2-2-virtual-scroll-evaluation.md) | 已评估「可行（有条件）」；触发 = 单页 > 200 行实测或用户裁定；本轮无新用量证据 | 维持 Backlog |
| C13 | 移动端第二波与交互候选 | Backlog §1.5 | caomei-todo 仍无代码；Phase 38 已交付移动壳核心；Picker / NavBar / Search / Sticky / 软键盘均为应用层先行或需真机反馈 | 维持 Backlog |
| C14 | 单 Demo 抽屉预览（P2） | [设备预览评估](./2026-11-20-docs-device-preview-evaluation.md) | P1 已交付；P2 需 Demo 注册表与预览路由（约 3–4 天），属文档站体验增强；P1 落地后尚未单独评估，用户未裁定 | 维持 Backlog |
| C15 | 宽屏视觉基线（1536 / 1920） | [视口扩面评估](./2026-11-20-viewport-matrix-expansion-evaluation.md) §4 | 触发条件 = 宽屏布局出现真实回归或下一次视觉基线批次；本轮未命中 | 维持 Backlog |
| C16 | `xl` 断点与宽屏布局规则 | 同上 §4 | 公共 API 增量；规则未定前不加空断点；无 1536+ 布局需求 | 维持 Backlog |
| C17 | 依赖与工具链升级 | Backlog §1.6 | `typescript` 7 被 `vue-tsc` / `tsdown` API 阻塞；`glob` override 需上游支持；`conventional-changelog` 8 待 preset 兼容；CI 镜像迁移检测点未命中 | 维持 Backlog |
| C18 | momei 侧迁移执行 | Backlog §1.8 | 执行主体为 momei，本仓等待反馈；不构成本阶段候选 | 等待外部反馈 |
| C19 | 长尾组件（Sidebar / ScrollPanel / Rating 扩展） | Backlog §1.1 / §1.2 | 均已有处置结论（Drawer 承接 / 不自研 / 触发条件未命中） | 维持 Backlog |
| C20 | 服务层与其它治理候选 | Backlog §1.6 / §1.7 / §1.9 | `useDialog` 暂不实现；图标 I5 条件触发；Tailwind preset / Storybook / 多版本托管 / ui-validator follow-up / dev hydration / 外链守卫均未命中触发条件 | 维持 Backlog |

**候选覆盖声明**：逐小节在册行数：§1.1 **1** / §1.2 **2** / §1.3 **0** / §1.4 **7** / §1.5 **7** / §1.6 **15** / §1.7 **1** / §1.8 **1** / §1.9 **1** / §1.10 **0** / §1.11 **15** = **50 行**。本轮逐条判定 **20 项**（C1 ~ C20）：阶段候选（核心）**3 项**（C1 / C2 / C4）、阶段候选（可选）**2 项**（C3 / C10）、独立批次 **1 项**（C5）、待用户决策 **1 项**（C6）、等待外部反馈 **1 项**（C18）、维持 Backlog **12 项**（C7 ~ C9 / C11 ~ C17 / C19 / C20）。**未列入 C1 ~ C20 的在册行，其落点 = Backlog 原行**（保留原优先级与触发条件，本轮不改动、不重排）；**逐条均有落点，无静默豁免**。

## 3. 主线草案（待用户裁定）

> 本节是候选 → 主线的唯一映射口径；条目为草案，不构成登记。推荐核心为 **M1 ~ M3**（3 主线 / 10 条）；可选项 M4 / M5 由 D0 决定（M5 固定 7 语全量）。C5 默认作独立机械批次，仅在 D0 ② 时以 **M6** 承担第三主线。

| 主线 | 候选 | 原子条目（草案） |
|:---|:---|:---|
| M1 国际化收口 | C1、C2 | M1-1 日期 / 时间 locale 跟随与语言惯例默认值；M1-2 数字 / 体积本地化；M1-3 可访问名补口与 10 语台账；M1-4 支持语言与翻译状态表 |
| M2 Form 校验能力（可选） | C3 | M2-1 契约设计；M2-2 最小实现；M2-3 文档 / 示例 / 测试 |
| M3 发布收口 | C4 | M3-1 发布前门槛复核；M3-2 `1.4.0` 发布与发布后校验；M3-3 下游兼容复验与记录 |
| M4 P1 组件广度（可选） | C10 | M4-1 Transfer；M4-2 Cascader；M4-3 Timeline（每个含实现 / 测试 / 文档 / 登记面） |
| M5 国际化二期（可选） | C6 | M5-1 7 语语言包与注册；M5-2 台账 / 键集合守卫 / 译文复核；M5-3 文档与状态表扩容 |
| M6 规划载体收口（仅 D0 ②） | C5 | M6-1 存量分片改名与链接 / 锚点重指；M6-2 索引一致性与命名机检接入 |

**构成对账**：推荐核心 4 + 3 + 3 = **10 条**；D0 ② 为 4 + 3 + 2 = **9 条**；叠加 M4 后 13 条；叠加 M5 后 13 条；M4 + M5 全取后 16 条（超建议 15、未超硬上限 20，登记记录须写「为何不拆阶段」）。

### M1 国际化收口

- **范围**（调研 §3.3 #1 ~ #6）：① `DatePicker` / `Calendar` 的 `locale` 缺省消费 `useLocaleCode()`（显式 prop 仍优先），`weekdayFormat` / `hourFormat` 缺省按语言惯例推导；② `InputNumber` 向 `NumberFieldRoot` 透传 `locale`；③ `Paginator` 每页条数与页码改用注入 locale 的 `Intl.NumberFormat`；④ `FileUpload` 体积格式化随 locale（单位与小数点）；⑤ `DataTable` 列宽手柄与 `FileUpload` 移除按钮补 `table` / `fileUpload` 键并纳入 10 语与台账；⑥ 中英双页新增「支持语言 + 翻译状态」总表，README 只补一行回链。
- **非目标**：不做 C6 二期语言扩容、不做复数 / 插值（#7）、不做 RTL、不做通用格式化 API（#8）、不做键级运行期兜底（#9）、不改 `ConfigProvider` 的模块级注册模型（#10）。
- **验收下限**：`en-US` 下日期面板月份 / 星期 / 12 小时制正确；`InputNumber` 显示 `1,234.56`（`de-DE` 为 `1.234,56`）；`Paginator` 页码显示 `1,000`；体积单位与小数点随语言；英文可访问名；10 语键集合一致；中英示例；单测 + 定向 E2E；`check:locale-keys` / `check:locale-ledger` 绿。
- **风险**：`locale` 缺省行为变更（未显式传 locale 且 provider 非 `zh-CN` 时由中文切到注入语言）须在迁移注意事项声明；`weekdayFormat` 由 `narrow` 改宽是**有意文本变更**，需同步示例与文档断言；`Intl` 在 Node 与浏览器的小数分组可能不同，测试须固定 ICU。

### M2 Form 校验能力（可选）

- **范围**：基于 Reka `FormRoot` / `FieldRoot` / `FieldError` 的最小校验层——`Form` 承接服务端 `errors`、提交时聚焦首个无效字段；`FormItem` 将 `name` / `validate` / `validation-mode` 透传到 `FieldRoot`，并单点声明 `error` 与 `FieldError` 的关系；不引入 rules DSL。
- **非目标**：不搬 Element Plus `rules` 语法、不做异步校验请求管理、不替换既有受控 `invalid` / `error` 通道、不改变 `FormItem` 现有插槽作用域。
- **验收下限**：必填 / 自定义 `validate` / 服务端错误回填 / 提交聚焦首个错误 / 错误 `role="alert"` 与 `aria-describedby`；中英示例；单测 + 定向 E2E；新增文案纳入 locale 台账。
- **风险**：与既有 `invalid` / `error` 双通道并存易出现两套口径；Reka `Field` 的值采集依赖 `FieldControl`，现有字段组件能否直接作为 control 需先探针（可能需要 `asChild` 或适配层），探针失败则降级为「只设计」。

### M3 发布收口

- **范围**：① 重跑 `Weekly Regression`（2026-11-20 `cancelled`）并复核质量门与 11 个新组件的登记面（包根导出 / resolver / Nuxt 模块 / 侧栏 / 画廊 / locale 台账），`pnpm build` 产物冒烟；② `1.4.0` 经 CI 发布（`release.yml` `workflow_dispatch`）并做发布后校验（npm 可解析 / tag / GitHub Release / 版本句 / CHANGELOG）；③ 记录发布后自动 dispatch 的下游兼容 run 结论与三仓 revision，并回写下游锁定版本读数。
- **非目标**：不改发布触发模型、不自动发布、不进入 2.0、不重指 tag、不强制下游升级。
- **验收下限**：周回归 `success` + 安全告警 0 + `pnpm verify` + 覆盖率门禁；发布后 npm `1.4.0` 可解析、`v1.4.0` tag 与 Release 存在、版本句一致；下游兼容 run 有记录（success 或红因已归因）。
- **风险**：周回归若再次取消或失败，发布条目阻塞，**不得降级发布**；11 个新组件的登记面若有漏项，须在 M3-1 内修正后才发布。

### M4 P1 组件广度（可选）

- **范围**：Transfer / Cascader / Timeline 三个组件（实现 / 测试 / 文档 / 示例 / 10 语可访问名 / 登记面）。**Tree / TreeSelect 不纳入**（Reka `TreeRoot` 为 Alpha，需锁版本与回归，另立阶段）。
- **非目标**：不做 Tree / TreeSelect、不做 P2 组件、不做业务件。
- **验收下限**：三组件在 320 / 768 / 1280 可用；键盘与读屏路径；亮暗；中英示例；单测 + 定向 E2E。
- **风险**：无下游用量，API 易按生态对照过度设计；沿用「插槽优先、受控 props 最小」策略，避免提前承诺 rules / 数据请求。

### M5 国际化二期（可选）

- **范围**：`it-IT` / `nl-NL` / `pl-PL` / `tr-TR` / `vi-VN` / `th-TH` / `id-ID` 七语语言包与注册、键集合与台账守卫、译文复核记录、文档状态表扩容。
- **非目标**：不做 RTL、不追头部 43 ~ 72 门、不改分发形态（预注册 + 子路径维持）。
- **验收下限**：10 → 17 语键集合一致；`check:locale-keys` / `check:locale-ledger` 绿；可访问名回退链正确；文档状态表逐语可复算。
- **风险**：译文质量与复核成本高；`pl` / `ru` 类复数规则在现有单键插值下受限（#7 未做）；无下游需求支撑，属产品驱动。

### M6 规划载体收口（仅 D0 ②；否则为独立批次，内容相同）

- **范围**：`docs/plan/archive/` 下的存量 `phase-*.md` 分片（**19 个**，`ls docs/plan/archive/phase-*.md | wc -l` 实测；Backlog §1.6 记 18，差 1 在批次内核对）→ `todo-archive-phases-*.md`；单提交内 `git mv` + 链接 / 锚点重指；剥离链接目标后非空行多重集相等；同批接入索引一致性与命名机检（存量豁免清单随改名前移）。条目：**M6-1** 改名与链接 / 锚点重指；**M6-2** 机检接入与索引对账。
- **非目标**：不引入 `roadmap-phases-*.md`、不改索引倒序、不动 400 行阈值。
- **验收下限**：`git diff -M` 只含 rename 与链接 / 锚点行；链接门禁 exit 0；机检覆盖 / 无重复；治理索引与归档块回扫完成。
- **风险**：链接面大于提案估计（135 处 / 23 文件，研判记录 §2），漏改会留下静默死链；与功能批次混提交会掩盖 rename 判别。

## 4. 推荐组合与决策点

**推荐核心**：**M1 ~ M3**（国际化收口 + Form 最小校验 + `1.4.0` 发布，3 主线 / 10 条）。理由：

- M1 是本轮证据最强的缺口：三仓都在 `zh-CN` / `en-US` 间切换，且实际消费日期、数字、分页、上传与表格组件；六项都会直接产生错误输出或错误的读屏语言，修复成本低、收益直接。
- M2 是 Backlog P1 中唯一有结构性的能力缺口；Reka primitive 现成，先做最小层可避免一次投入 rules 引擎的决策风险。**无下游直接用量，属产品驱动**，是否纳入由 D1 决定。
- M3 是自然收口：11 个组件包已积压，且发布门禁已由 CI 固化（周回归 + 安全告警 + verify + 覆盖率），发布动作本身低风险。
- C5 是机械债，适合独立批次；与功能主线混做会放大 diff。
- 其余候选均未获得新的下游证据或触发条件，维持 Backlog（逐条判定见 §2.2）。

### 决策点

- **D0 阶段取向**：
  ① **推荐：M1 + M2 + M3**（3 主线 / 10 条；C5 独立批次）
  ② **保守：M1 + M3 + M6**（3 主线 / 9 条；不加新能力，规划载体收口作第三主线）
  ③ **① + M4 P1 组件宽度**（4 主线 / 13 条）
  ④ **① + M5 国际化二期**（4 主线 / 13 条；M5 固定为 Backlog 收敛的 7 语全量，减量或分期须另行裁定）
  ⑤ **① + M4 + M5**（5 主线 / 16 条；超建议 15，登记记录须写「为何不拆阶段」）
- **D1 Form 校验能力（D0 取 ① / ③ / ④ / ⑤ 时生效）**：
  ① **最小实现**（推荐；`FormRoot` 服务端 errors + `FieldRoot` `validate` 透传 + 提交聚焦首个错误，不做 rules DSL）
  ② 只设计（契约 + 探针，不落地实现；M2 缩为 1 条）
  ③ 完整 rules 引擎（对齐五库，体量与风险显著上升）
  ④ 不纳入（D0 ① 须改选 ②，或另补一条第三主线）
- **D2 发布**：
  ① **阶段末发 `1.4.0` + 发布后下游兼容复验**（推荐；M3-1 ~ M3-3）
  ② 发布但不复验（M3-3 不做）
  ③ 不发布（`latest` 维持 `1.3.0`；M3 整条移出）
- **D3 规划文档 v1 存量改名 + 机检（issue #71）**（D0 ② 时已由 M6 承担，不再问）：
  ① **本阶段作独立机械批次执行**（推荐；不占功能主线，内容同 M6）
  ② 随下一次归档压缩批次执行
  ③ 不执行（issue #71 维持 open）

**默认落定（无需单独提问）**：

- 周回归复核纳入 M3-1 发布前置，不单列候选；未绿则发布条目阻塞。
- M1 六项缺口全取（同一契约族，拆分会留下「中英并存」的不可绿中间态）；若用户只取部分，按 #1 ~ #6 逐项勾选。
- 不新增运行时依赖；数字 / 日期格式化只用平台 `Intl` 与 Reka / `@internationalized/date` 现有能力。
- C5 在 D0 ① / ③ / ④ / ⑤ 下按独立机械批次执行（单提交 `git mv` + 链接重指），登记记录写明「不占功能主线」；D0 ② 下由 M6 承担第三主线。
- 未被上述决策选中的候选维持 Backlog，清单与理由见 §2.2，不在此重复列举。
- 不进入 2.0、不改版本策略、不自动发布。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| 国际化行为变更 | `locale` 缺省由 `zh-CN` 改为注入语言；`weekdayFormat` / `hourFormat` 缺省变化 | 迁移注意事项单点声明「显式 prop 优先」；示例与文档断言同步；`capture:styles` / 定向 E2E 覆盖 |
| `Intl` 环境差异 | Node / 浏览器 ICU 版本不同导致分组与小数点不一致 | 测试固定 locale 与 `NumberFormat` 选项；单测断言字面值，不依赖环境默认 |
| Form 探针失败 | 现有字段组件无法直接作为 Reka `FieldControl` | M2-1 先做一次性探针；失败则降级为「只设计」，并在记录里写明原因，不硬改字段契约 |
| 双通道口径 | `invalid` / `error` 与 `Field` 状态两套来源 | 文档单点声明优先级（显式受控 > Field 校验）；测试覆盖两者同时存在的冲突场景 |
| 发布前置 | 2026-11-20 周回归 `cancelled`；`check:weekly-regression` 非绿即中止 | M3-1 重跑周回归；未绿则 M3-2 阻塞，不降级发布 |
| 11 个新组件登记面 | 包根导出 / resolver / Nuxt 模块 / 侧栏 / 画廊 / locale 台账漏项 | M3-1 用机检 + `rg` 逐载体核对；漏项在发布前修正 |
| 阶段容量 | D0 ⑤ 为 5 主线 / 16 条，超建议 15 | 登记记录写「为何不拆阶段」；实施按 10 文件 / 800 行阈值拆分 |
| wisdom 阈值 | 20 条活跃 = 阈值 | 阶段归档前执行 `pnpm distill:wisdom` 并留痕；不因蒸馏拖延安档 |

## 6. 声明与落点

- 本记录只做评估：未分配阶段编号、未改 `todo.md` / `roadmap.md`、未改 `src/**`、未新增依赖。
- Backlog 本轮不改动；§2.2 判定的全部条目仍在原表行。
- 用户裁定 D0 ~ D3 后，按[规划规范 §4](../../standards/planning.md) 取「已有最大编号 + 1」登记（授权时再写定值），并同批同步 `todo.md` / `roadmap.md` / 治理索引 / `.session`；登记记录须写主线 / 条目构成对账与 Review Gate。
- 若 D0 取 ① 且 D1 取 ①，建议登记为 **3 条主线 / 10 条原子条目**（M1 4 / M2 3 / M3 3；构成对账 4 + 3 + 3 = 10）。

## 7. Review Gate

**结论：R1 Pass**（`standard`，2026-11-21）。

- 改动类型：文档 / 规划（新增评估记录 + 治理索引 1 行）。
- 最低验证要求：`lint:md` + 链接 / 路径检查 + RG；已满足。
- audit-depth：**`standard`**——含定量复算（候选行数、主线 / 条目构成、下游文件数）与跨仓取证（三仓 `pnpm-lock.yaml` / SHA / 组件引用），按[AI 协作规范 §3.1](../../standards/ai-collaboration.md)不得降为 `quick`；调用方已在 D 阶段完成主要取证，审计面收窄为复算与口径一致性。
- 时间盒：≤ 10 分钟（`standard` 单分区上限）；实际用时约 2 分钟（17:20:43 → 17:22:55，含调用方预核验），未超时间盒。
- 复查基线：本文件当前内容 + `docs/design/governance/index.md` 首条。
- 轮次：R1 `standard` **Pass**（0 blocker / 2 warning / 2 suggest；warning 与 suggest 均在同轮修正并复核）。

### Findings

#### blocker

无。

#### warning

1. [本文件 §1] 下游 `CaomeiConfigProvider` 引用读数包含 `node_modules`（25 / 13 / 11），会高估下游覆盖面。
    - 复发属性：首次。
    - 风险：读者据以判断「三仓普遍使用 provider」，而实际应用层文件为 6 / 4 / 2；结论方向不变但读数失真。
    - 修复方向：改为 `grep -rl --exclude-dir=node_modules --exclude-dir=.nuxt` 的实测值，并在单元格注明命令；已修正。
2. [本文件 §2.2 C11] P2 高级组件行数写 13，实际为 10（§1.11 共 15 行 − P1 5 项）。
    - 复发属性：首次。
    - 风险：候选覆盖声明与逐条判定出现隐性缺口，后续登记可能误判剩余候选规模。
    - 修复方向：按 §1.11 当前表逐行复算；已改为 10，并与「§1.11 15 行」对账。

#### suggest

1. [本文件 §2.2 C14] 「P1 落地后评估」原写「已评估」，无评估载体支撑。
    - 复发属性：首次。
    - 风险：把「未评估」写成「已评估」会使 P2 的触发条件看似已满足。
    - 修复方向：改为「P1 落地后尚未单独评估，用户未裁定」；已修正。
2. [本文件 §4] 「唯一有三仓真实证据」「唯一路径」属绝对断言，超出取证范围。
    - 复发属性：首次。
    - 风险：与「证据优先」口径冲突，易被后续记录引用为事实。
    - 修复方向：改为「证据最强的缺口」「常规路径」；已修正。

### 验证证据

- 已执行验证：`pnpm lint:md:check`（exit 0）；`pnpm docs:check:links`（654 个 md 本地链接全部有效）；`pnpm docs:check:integrity`（651 个受版本控制 md 无空文档 / 围栏失衡 / 孤立表格行）；`pnpm check:governance-records`（394 个治理记录与索引一致，651 个 md 历史规划指针无失效）；`pnpm check:governance-counts`；`pnpm check:stage-counts`（无进行中阶段，跳过）；`pnpm check:planning-numbers`（0 处命中）；`pnpm docs:check:line-count`（无文档越过 error 阈值）；`pnpm check:final-newline`。
- 结果摘要：全部门禁 exit 0；候选行数 1 + 2 + 0 + 7 + 7 + 15 + 1 + 1 + 1 + 0 + 15 = 50，主线 / 条目算术（10 / 9 / 13 / 13 / 16）与 D0 选项一致；未新增阶段编号、未改 `todo.md` / `roadmap.md` / `src/**`。
- 未覆盖边界：未逐行重算三仓全部组件引用（只复算 `ConfigProvider` 与六个组件的文件数，并抽查三仓 `app.vue`）；未执行 `pnpm governance:check` 全链与代码类门禁（无代码改动）；未运行 `pnpm docs:check` 中依赖构建的项。
- 后续补跑计划：用户裁定并登记阶段后，登记记录与 `todo.md` / `roadmap.md` 同批走完整 `governance:check`；M1 落地前补 `capture:styles` 与定向 E2E。
