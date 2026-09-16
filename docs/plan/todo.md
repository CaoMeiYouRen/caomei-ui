# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> **Phase 10：国际化与移动端适配** — 2026-09-16 经用户授权启动；语言矩阵范围依据 [语言矩阵 - 中期评估记录](../design/governance/2026-09-16-language-matrix-midterm-evaluation.md)。
>
> **阶段目标**：把组件库从「机制支持多语」推进到「开箱支持目标下游语言」，并把移动端 / 响应式适配从零散断点收敛为可验收的规范与分批交付。
>
> **阶段非目标**：文档站新增 zh-TW / ja-JP / ko-KR 三语页面（站点翻译属独立决策）；RTL；语言矩阵 - 长期（俄 / 法 / 德 / 西 / 葡）；locale 按需加载（包体评估结论为可接受，不引入）；触摸手势等新交互。
>
> **用户决策（2026-09-16）**：① 语言矩阵取**方案 A**（库内建 5 语）；② 翻译来源为 **AI 基于 zh-CN 生成译文 + 用户复核**（属「机器翻译 + 人工校对」的具体化；复核前译文标注「AI 生成、待人工复核」）；③ 三语文案**按语种拆三个提交**；④ 补**一致性检查的审查与脚本**，以**简体中文（zh-CN）为基准**比对键集合；⑤ 包体影响已评估（结论：可接受）。

### 主线 M1：语言矩阵 - 中期（zh-TW / ja-JP / ko-KR）

- 执行范围：新增三份内建文案（各 59 条，结构对齐 `CaomeiLocaleMessages`）；`caomeiLocales` 注册表与 `CaomeiLocale` 类型扩展；新增「各语种键集合与 zh-CN 一致」的守卫脚本并接入门禁；`use-locale.test.ts` 的未知语言回退用例改用未注册语种（如 `fr-FR`）并补新语种解析断言；三语文案文件头部标注「AI 生成、待人工复核」（复核后移除，复核结论落到评估记录 §9 后续行）；**实现注意**：产物保留 `//#region` 类注释，需确认文件头注释是否随构建进入 `dist`，必要时改用不会被保留的标注形式；文档同步（locale 指南中英、`README.md`、`docs/standards/development.md` 目录树）。
- 非目标：文档站三语页面；RTL；语言矩阵 - 长期；locale 按需加载。
- 最小验收标准：五语（zh-CN / en-US / zh-TW / ja-JP / ko-KR）均可解析且键集合与 zh-CN 一致（守卫脚本通过）；`pnpm verify` 全链路通过；`dist/index.d.ts` 冒烟通过。**译文质量不在本阶段验收内**——由用户复核，复核结论落到评估记录 §9 后续行；**发布前检查**：产物与 `src/locale/` 不得残留「待人工复核」标注。
- 条目（按「可独立提交」排序）：
  - [x] zh-TW 文案（纯新增，独立提交）
  - [x] ja-JP 文案（纯新增，独立提交）
  - [x] ko-KR 文案（纯新增，独立提交）
  - [x] 注册表与类型扩展 + 键集合一致性守卫脚本（以 zh-CN 为基准）+ `use-locale.test.ts` 未知语言用例调整
  - [x] 文档同步（locale 指南中英 / README / development 目录树）
- **交付状态（2026-09-16）**：五语（zh-CN / en-US / zh-TW / ja-JP / ko-KR）均可解析且键集合、占位符与 zh-CN 一致——`pnpm check:locale-keys` 已接入 `governance:check`（随 `verify` 与 CI 生效）；`pnpm verify` 全链路通过（67 文件 / 1114 例）；`dist/index.d.ts` 冒烟通过（五语字面量可赋值，未注册语种与未注册键均类型报错）。**译文仍为「AI 生成、待人工复核」**：三份文案文件首行标注保留，待用户复核后移除，复核结论落到[评估记录 §9](../design/governance/2026-09-16-language-matrix-midterm-evaluation.md)；`dist/` 产物实测无标注残留。**发布前触发项**：产物与 `src/locale/` 不得残留该标注（机检候选见 [Backlog §1.6](./backlog.md)）。

### 主线 M2：移动端与响应式

- 执行范围：先补响应式规范（断点语义、窄屏行为矩阵与验收标准），再按规范分批补齐组件小屏适配，并补移动端测试用例（Playwright 多视口）。**批次判定门槛**：以响应式规范中「窄屏行为矩阵」判为需适配的 Tier 0 / Tier 1 组件为一批（首批清单在条目 1 落地后确定并登记，**口径偏差见条目 2 下的批次说明**），不得笼统写「分批」。
- 非目标：全量组件一次性适配；触摸手势等新交互。
- 最小验收标准：规范落地并登记；每批适配组件在 mobile（390）/ tablet（768）视口实测通过；`pnpm test` 与 `pnpm verify` 全链路通过。
- 条目：
  - [x] 响应式规范补充（断点语义与窄屏行为矩阵）
  - [ ] 小屏适配补齐（分批，先核心控件）
    - **批次 1（浮层面板宽度越界）**：Select、MultiSelect、AutoComplete、DropdownMenu —— **已交付（2026-09-16）**：面板 `max-width` 取 `--reka-{select,combobox,dropdown-menu}-content-available-width`（回退 `none`），`min-width` 以 `min(触发器宽, 可用宽)` 同步收敛（否则 `min-width` 会压过 `max-width`）；补 `box-sizing: border-box`；长选项文本补省略号（Select 新增 `__item-text` 规则并在组件文档写明插槽按单行截断，MultiSelect / AutoComplete 的 label 补 `flex: 1; min-width: 0`）。V 阶段实测（390 / 768 / 1280 三档 + 右缘窄触发器边界用例）：面板均在视口内、面板内无横向溢出、窄屏长文本省略号、0 console error；对照组（同时移除 `max-width` 与 `min-width`）在 390 下越界 710px（证明收敛规则承重）；`min()` 必要性另经独立探针实测（触发器宽 320 > 可用宽 300 时，朴素 `min-width` 写法越界 12px）。**未引入面板 `max-width` token**：与同规则既有 `max-height` 直连 Reka 变量的做法一致，使用方可按类选择器覆盖；如需 token 化另起评估。记录与截图见 `test-results/m2-batch1/`（gitignored；结论与数值已落本行）
    - **批次 2（横向布局窄屏必现溢出 / 裁切）**：Toolbar、ButtonGroup、SelectButton、SplitButton、ColorPicker、Dialog / ConfirmDialog（footer 换行）
    - **批次 3（需先实测）**：DatePicker / Calendar
    - **不纳入**：DataTable 卡片化、页面级栅格、Stepper 方向转换（使用方职责）；触摸目标（用户决策：暂不提升）
    - 批次依据、行为矩阵与偏差说明见[响应式设计 §5](../design/responsive.md)（登记门槛原写「Tier 0 / Tier 1 组件为一批」；经源码核对，必现溢出 / 裁切项既有 Tier 0 / 1 的 Dialog / ConfirmDialog（footer 换行），又有 Tier 2 / 3 的横向布局类，故批次按缺陷类划分并已在此登记）
  - [ ] 移动端测试用例（Playwright 多视口）
    - 断言清单：承载[响应式设计 §4](../design/responsive.md) 的 6 条标准（无横向溢出 / 浮层面板在视口内 / 关键内容不丢失 / 桌面无回归 / 0 console error / 面板不窄于触发器）
    - 基线归档：每批次的「改动前」截图与计算样式快照落 `test-results/<批次>/`，结论与关键数值同步落可提交位置
- **交付状态（条目 1，2026-09-16）**：新增 [响应式设计](../design/responsive.md)——断点语义（sm 640 / md 768 / lg 1024；桌面优先 + `max-width` 收敛 + 字面量白名单）、16 行窄屏行为矩阵（含源码取证位置与现状判定）、验收标准（390 / 768 / 1280 视口 + 5 条断言，布局断言归 Playwright）、批次清单与三项决策落定；`theming.md §5` 收敛为指针并移除未实现的「窄屏转卡片列表 / 转 Drawer」陈述，`design-spec.md §2.3` 与 `development.md §7` 补指针，设计索引与文档站侧栏同步。
- **待决策（条目 1 提出）→ 已决策（2026-09-16，用户）**：① 触摸目标**暂不提升**到 ≥44px 命中区（维持 Checkbox / RadioButton 18px、Switch 40px、`control-height-sm` 28px；后续如提升须引入不改变视觉尺寸的命中区原语，候选见 [Backlog §1.5](./backlog.md)）；② Stepper 横向窄屏**由使用方适配**（组件不内建自动转换，需纵向时改 `orientation="vertical"`，已写入 Stepper 组件文档与[响应式设计 §1](../design/responsive.md)）；③ 「DataTable 转卡片列表」「Dialog 转全屏」**不作为默认行为**，窄屏以响应式适配为主（与[响应式设计](../design/responsive.md) 非目标一致，相关 AI 资产表述同步对齐）。

> **阶段容量裁定**：本阶段登记 2 条主线，低于 [规划规范 §6](../standards/planning.md) 的 3–6 条下界——依据是 M1（语言矩阵）与 M2（移动端与响应式）各自为独立工作流，且用户决策明确 momei 可行性评估**排在本阶段之后**，故不凑数增设主线。

> **阶段尾部再评估点**：**momei 迁移可行性评估** —— 用户决策（2026-09-16）为本阶段结束后正式进入，先出可行性结论再定迁移范围（属 Phase 7 第二阶段的前置评估）。

## 阶段验收通则

完成条件见 [路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证。

## 完成情况概览

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- 已归档：Phase 0 ~ Phase 4、Phase 5 第一阶段、Phase 6、Phase 7 第一阶段、Phase 9（发布前收口）。
- 进行中：Phase 10（国际化与移动端适配）——M1 语言矩阵 - 中期已交付（译文待人工复核）；M2 移动端与响应式未启动。
- 未启动 / 未完成：Phase 5 第二阶段（首版发布 / 首个下游接入，待外部前置）、Phase 7 第二阶段（momei 迁移闭环 + P1 增强，按用户决策排在 Phase 10 之后）、Phase 8（下游兼容性回归，稳定后启用）；范围见 [路线图](./roadmap.md)。
- Phase 7 第一阶段遗留与偏差：首版发布链路协调（归属 Phase 5 第二阶段）、DatePicker 范围选择与 Select `filter` 的迁移决策、各组件有意行为差异与未实现项、规模偏差等，清单见 [待办归档](./todo-archive.md)。
- 未纳入任何阶段的候选：P2 低频增强、组件国际化多语种与 RTL（中期语言矩阵**已登记 Phase 10 M1**，见 [Backlog](./backlog.md) §1.4）、移动端与响应式（**已登记 Phase 10 M2**，见 §1.5）、Button 角标（`:badge`）、文档站观感美化、wisdom 蒸馏原文留痕等，见 [Backlog](./backlog.md)。
