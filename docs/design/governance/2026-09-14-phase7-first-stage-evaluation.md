# Phase 7 第一阶段评估记录（迁移就绪）

> 状态：评估记录（2026-09-14）。本文件记录 Phase 7 第一阶段的范围评估、缺口调研与原子条目拆分依据；执行状态与验收以 [待办事项](../../plan/todo.md) 为准。
>
> 关联：[路线图](../../plan/roadmap.md) ｜ [Backlog](../../plan/backlog.md) ｜ [momei 使用复核台账](./2026-09-14-momei-usage-audit.md) ｜ [设计规范](../design-spec.md) ｜ [规划规范](../../standards/planning.md)

## 1. 背景与目标

Phase 6 已使组件库在**组件覆盖、设计规范、主题预设、许可合规**四方面达到「可迁移」状态。Phase 7 目标是以 momei（最复杂下游）优先闭环 PrimeVue → caomei-ui 替换。

本记录评估结论：**Phase 7 采用两段式**。

- **第一阶段（本记录）：迁移就绪。** 打通消费与接入通道，补齐迁移会实际命中的 P0 增强与组件缺口，并把「组件 i18n 注入机制」前置，避免迁移后返工。
- **第二阶段：momei 迁移闭环。** 选取切片试点 → 全量替换 → 校准真实缺口 → 补齐 P1 增强 → 推 caomei-auth / rss-impact-next / afdian-linker。

排序原则：**先改好再迁移**（用户 2026-09-14 决策），按「优先级 + 依赖关系」排序；P0 高频硬缺口进第一阶段，P1 与 P2 由迁移实际暴露驱动（P1 随第二阶段，P2 留 Backlog）。

> **用户决策（2026-09-14）**：M1 以**本地 link 先行**（首版发布待外部凭据到位后补）；M5（P1 增强）延至第二阶段；P2 不纳入第一阶段。决策明细见 §10。

## 2. 事实基线

| 维度 | 事实 | 来源 |
| --- | --- | --- |
| Phase 7 范围 | momei 优先闭环 PrimeVue → caomei-ui 替换；再推其他下游；Nuxt 模块真实集成按需评估 | [roadmap](../../plan/roadmap.md) |
| 承接组件 | `SplitButton`、`DataView`、`DatePicker / Calendar`、`Drawer`、`ColorPicker`（后三者 Reka Alpha） | [roadmap](../../plan/roadmap.md)、`package.json` |
| momei 迁移规模 | 59 个 PrimeVue 组件、1515 次用法、100+ `.vue`、46 个页面 | [momei 使用复核台账](./2026-09-14-momei-usage-audit.md) |
| momei 技术栈 | Nuxt `^4.5.2`、Vue `^3.5.42`、`primevue ^4.5.5` + `@primevue/nuxt-module` 自动导入 + MomeiPreset + 动态 locale 同步插件 | `momei/nuxt.config.ts`、`momei/plugins/primevue-i18n.ts` |
| momei 语言矩阵 | 5 种：`zh-CN` / `en-US` / `zh-TW` / `ja-JP` / `ko-KR` | `momei/i18n/config/locale-registry.ts` |
| caomei-ui 接入现状 | `version 0.0.0` 未发布；`caomei-ui/nuxt` 与 `resolver` 均为占位实现 | `package.json`、`src/nuxt/module.ts`、`src/resolver/index.ts` |
| 发布前置 | Phase 5 第二阶段（semantic-release 发布 / 首个下游接入）**待 npm 凭据与下游授权**（外部） | [roadmap](../../plan/roadmap.md) |

## 3. 前置条件与阻塞链

```
momei 真实迁移
  ├─ ① 消费路径未定          ← 头号阻塞（依赖外部凭据）
  │     caomei-ui 未发布；Phase 5 第二阶段待 npm 凭据 / 下游授权
  │     决策：首版发布为主；调试期本地 link 兜底
  ├─ ② 接入基建是占位实现
  │     caomei-ui/nuxt 与 resolver 未接 @nuxt/kit；
  │     momei 依赖 Nuxt 模块自动导入 → 不补则逐文件手写 import
  ├─ ③ 组件内建文案 i18n 缺口
  │     momei 有 PrimeVue 动态 locale 同步；caomei-ui 固定 zh-CN、无注入机制
  │     → 迁移含文案组件将造成多语言功能回归（详见 §5）
  └─ ④ 组件能力缺口
        5 个延后组件 + 迁移实际命中的高频增强（详见 §4）
```

**结论**：①③ 是 roadmap 未显式列出但迁移必然触发的隐性依赖；②④ 中「23 项增强」与 Phase 7 文字范围存在范围缺口，需按 §4 调研结论收敛。

## 4. 范围缺口调研：增强项优先级

> 数据来源：`/tmp/opencode/momei-pv-attrs.json`（Phase 6 M1 属性级抽取）+ momei 实仓复核（2026-09-14）。用法数为**属性出现次数**，非文件数。

| 增强项 | momei 用量证据 | caomei-ui 现状 | 优先级 |
| --- | --- | --- | :-: |
| Select 家族对象选项映射 | `option-label` / `option-value` 各 88（Select 66 / Dropdown 5 / MultiSelect 8 / SelectButton 9；Dropdown 为 PrimeVue 旧名，迁移归入 Select） | `options` 仅 `{ label, value }`，`value` 固定 `string` | **P0** |
| Tag 语义与形态 | `severity` 125（66 + 59）、`value` 110、`rounded` 3、`icon` 2 | `tone` 5 档；无 `rounded` / `outlined` / severity 别名；无 `#icon` | **P0** |
| Message 形态与尺寸 | `severity` 51、`variant` 14、`size` 14 | `variant` 仅 `soft / solid / outline`；无 `simple / text`、无 `size` | **P0** |
| InputNumber 分组与小数位 | `use-grouping` 20、`min/max-fraction-digits` 各 5 | 仅单一 `precision`，分组恒 false | **P0** |
| Textarea 自动增高 | `auto-resize` 12 | 无 | **P0** |
| Password 强度反馈 | `:feedback` 8 | 无 | **P0** |
| Image 点击预览 | `preview` 10 处（占 11 处 Image 用法，10 个文件） | 无 | P1 |
| ProgressSpinner 线宽 | `stroke-width` 7、`animation-duration` 1 | 仅尺寸档，无任意 px | P1 |
| Dialog 形态与断点 | `show-header` 3、`breakpoints` 2、`@hide` 1 | 无 | P1 |
| DataTable 剩余迁移项 | `rows-per-page-options` 3、`@sort` 3、`data-key` 2、`responsive-layout` 1、`scrollable` 1 | 已交付排序 / 选择 / 分页 / 冻结列，剩余为边角 | P1 |
| ToggleSwitch `change` 事件 | `@change` 2 | 无（可用 `@update:model-value` 替代） | P2 |
| Checkbox 分组值数组 | `:value` 2、`:model-value` 1（`binary` 为主 18） | 无 | P2 |
| FileUpload 上传能力 | 1 | 仅选择，无上传事件 | P2 |
| ToggleButton 状态文案 | 1 | 无 | P2 |
| Toolbar 分区插槽 | 1 | 仅 default 插槽 | P2 |
| Popover 命令式锚点 | `ref` 5、`@hide` 3 | 仅声明式 `v-model:open` | P2 |
| Menu 数据驱动 | `:model` / `:popup` 各 3 | 声明式子组件 | P2 |
| Button `:badge` | 2 | 无 | P2 |

**调研结论**：

1. **P0 是迁移硬缺口**：对象选项映射（88）、Tag（125）、Message（51）、InputNumber（20）均高频，迁移时不补必然逐处改；纳入第一阶段补全。
2. **P1 有降级空间**：Image / ProgressSpinner / Dialog / DataTable 剩余项。经用户决策**延至第二阶段**，由 momei 迁移实际暴露驱动。
3. **P2 低频且可临时降级**：保留在 [Backlog §1.1](../../plan/backlog.md)，迁移时按实际暴露决定，**不纳入第一阶段**（用户决策 2026-09-14）。

## 5. 组件 i18n 注入机制说明

### 5.1 现状

`src/locale` 已备 `zh-CN` / `en-US` 两份文案，但 16 个组件**直接 import 固定的 `defaultLocaleMessages`（zh-CN）**，没有运行时切换或注入通道：

- `src/locale/index.ts` 导出 `caomeiLocales` / `defaultLocaleMessages`，无 provider / inject。
- 消费 `defaultLocaleMessages` 的 16 个组件：Input、InputNumber、Password、MultiSelect、AutoComplete、Slider、Message、Toast、ConfirmDialog、Dialog、ProgressBar、ProgressSpinner、DataTable、Paginator、Tag、Stepper。（Textarea 无内建文案，不消费 locale。）

### 5.2 机制含义

「组件 i18n 注入机制」指：**由应用层把当前语言文案注入到组件树，组件通过 `inject` 读取，而非硬编码默认语言**。目标形态（具体命名待实现时定稿）：

- 提供 `CaomeiConfigProvider`（或 `provideLocale`）+ `useLocale` composable；未注入时回退 `defaultLocaleMessages`。
- 组件内建文案（`aria-label`、空态、按钮文案）改为消费注入的 locale。
- 下游（momei）在 app 层注入 `caomeiLocales` 或自定义 messages，并 `watch` vue-i18n 语言变化同步注入。

### 5.3 为什么必须前置

momei 支持 5 种语言且运行时动态切换；不补机制，迁移后这 16 个组件在非中文环境下会把「暂无数据」「关闭」等内建文案显示为中文，属**功能回归**。若先迁移后补，则需二次改动全部相关组件，成本更高。

### 5.4 范围边界

- 本阶段提供**机制**与 `zh-CN` / `en-US` 默认文案；`zh-TW` / `ja-JP` / `ko-KR` 由下游注入或后续补翻译（[Backlog §1.4](../../plan/backlog.md) 中期项）。
- 非目标：RTL、长期语言矩阵、组件内建文案的全语种翻译。

## 6. 排序（优先级 + 依赖）

```
M1 消费路径与 Nuxt 接入（本地 link 先行）
M2 组件 i18n 注入机制 ──┬─→ M4 组件补全（新组件直接消费注入 locale）
                        └─→ M3 P0 高频增强
M5 P1 增强 → 第二阶段（由迁移实际暴露驱动）
```

- **M2 先于 M3 / M4**：i18n 机制先行，存量组件与新组件一次性接好，避免二次改造。
- **M1 可与 M2 / M3 并行**：接入通道不阻塞组件改造；以**本地 link 先行**，发布链路待外部凭据到位后补。
- **M4 内部顺序**：`DatePicker / Calendar`（6 用法，Alpha，最复杂）→ `Drawer`（3，Alpha）→ `SplitButton`（2）→ `ColorPicker`（2，Alpha）→ `DataView`（1）。
- **M5 延至第二阶段**（用户决策 2026-09-14）：不作为第一阶段尾部，避免阶段容量过载。

## 7. 风险登记

| 风险 | 等级 | 说明与对策 |
| --- | :-: | --- |
| 发布凭据未就绪 | 高 | 头号阻塞。对策：**本地 link 先行**，不因外部凭据停滞组件改造；发布链路待凭据到位后补 |
| Reka Alpha API 漂移 | 高 | `DatePicker / Calendar`、`Drawer`、`ColorPicker` 依赖 Alpha primitive。对策：锁 `reka-ui@2.10.4`（已锁）+ API 契约回归测试 |
| i18n 机制改造面大 | 中 | 涉及 16 个组件。对策：机制与组件接入分批，每批走独立 Review Gate |
| 静态台账 ≠ 真实替换清单 | 中 | 用量为静态属性统计，未运行 momei。对策：第二阶段试点校准，第一阶段仅按高频硬缺口收敛 |
| 阶段容量 | 中 | 条目多。对策：P1（M5）延至第二阶段；每条目受 10 文件 / 800 行粒度约束 |
| 迁移后无回归基线 | 中 | momei 已有 `regression-weekly.yml` / `test.yml`。对策：第二阶段接入其回归流程 |

## 8. Phase 7 第一阶段条目（粒度）

> 执行范围 / 非目标 / 最小验收标准以 [待办事项](../../plan/todo.md) 为**唯一执行源**；本表仅补充「依赖」与「文件数 / 新增行数量级」（用于核对规划规范 ≤ 10 文件 / 800 行的粒度约束），避免逐字重复造成漂移。

### 主线 M1：消费路径与 Nuxt 接入

| 条目 | 说明 | 依赖 | 预估 |
| --- | --- | --- | --- |
| 本地 link 调试通道（先行） | `link:` / `file:` 指引 + 构建产物联调，打通 momei 消费 | — | 2–3 文件 / ~120 行（实测 11 文件 / ~440 行，按「产物冒烟校验」「本地联调指引」拆两提交） |
| 首版发布链路（待凭据） | semantic-release + npm 凭据打通；可与本阶段并行 | 外部凭据 | 2–3 文件 / ~100 行 |
| `caomei-ui/nuxt` 真实集成 | 接 `@nuxt/kit`：组件 / composables 自动导入、样式注入、主题、SSR | — | 3–5 文件 / ~250 行 |
| 最小 Nuxt 消费冒烟 | 最小 Nuxt 4 应用验证 preset、暗色、SSR hydrate 无报错 | 上一条 | 2–4 文件 / ~150 行 |

> 注：M1「本地 link 调试通道」实施量超出上表预估，按[规划规范 §5](../../standards/planning.md) 拆为「构建产物冒烟校验」（`scripts/release` + CI 步骤）与「本地联调指引」（中英指南 + 导航）两条自洽提交。
>
> 注：`caomei-ui/nuxt` 真实集成的端到端 SSR 冒烟已在下游 Nuxt 4 应用临时验证（组件与 composables 免 import、`data-scheme="auto"`、`--caomei-color-primary` 覆盖注入生效）；可复跑的 fixture 冒烟由「最小 Nuxt 消费冒烟」条目落地。
>
> 注：M1「最小 Nuxt 消费冒烟」落地为 `playground/nuxt` fixture + `pnpm check:nuxt`（执行 `nuxt generate` 并断言 SSR HTML / 打包 CSS），已接入 `verify` 与 CI；浏览器级 hydration 实测：点击计数 `0 → 1`、`theme-mode=auto`、`prefers-color-scheme` 亮/暗下 `--caomei-color-bg` 为 `#fff` / `#18181b`、hydration 警告与 console error 均为 0。

### 主线 M2：组件 i18n 注入机制

| 条目 | 说明 | 依赖 | 预估 |
| --- | --- | --- | --- |
| locale provider 机制 | `CaomeiConfigProvider` / `provideLocale` + `useLocale`；`CaomeiLocaleMessages` 支持合并覆盖与回退 | — | 3–5 文件 / ~250 行 |
| 组件接入批次一（表单类） | Input / InputNumber / Password / MultiSelect / AutoComplete / Slider | 机制 | 6–9 文件 / ~180 行 |
| 组件接入批次二（反馈浮层类） | Message / Toast / ConfirmDialog / Dialog / ProgressBar / ProgressSpinner | 机制 | 6–9 文件 / ~180 行 |
| 组件接入批次三（数据展示类） | DataTable / Paginator / Tag / Stepper | 机制 | 4–6 文件 / ~150 行 |
| 文档与 momei 注入示例 | 中英文档 + momei 注入 `zh-TW` / `ja-JP` / `ko-KR` 示例 | 批次一~三 | 4–6 文件 / ~200 行 |

### 主线 M3：P0 高频增强（迁移硬缺口）

| 条目 | 说明 | 预估 |
| --- | --- | --- |
| Select 家族对象选项映射 | `optionLabel` / `optionValue` 字段映射 + 非 `string` value（Select / MultiSelect / SelectButton） | 6–9 文件 / ~300 行 |
| Select 补充 `showClear` / `filter` / `#option` | 清空、过滤与自定义选项渲染 | 3–5 文件 / ~200 行 |
| Tag 语义与形态 | `severity` → `tone` 规范化（含 danger 别名）；`rounded` / `outlined`；`#icon` 插槽 | 3–5 文件 / ~200 行 |
| Message 形态与尺寸 | `variant` 补 `simple` / `text`；补 `size`；severity 映射 | 3–5 文件 / ~200 行 |
| InputNumber 分组与小数位 | `useGrouping`、`minFractionDigits` / `maxFractionDigits` | 2–3 文件 / ~120 行 |
| Textarea 自动增高 | `autoResize` | 2–3 文件 / ~120 行 |
| Password 强度反馈 | `feedback` 强度指示 | 2–4 文件 / ~180 行 |

### 主线 M4：组件补全（按用量与依赖排序）

| 条目 | 说明 | 预估 |
| --- | --- | --- |
| DatePicker / Calendar（基础） | 日期选择 + 格式化；锁 `reka-ui@2.10.4` + 回归 | 8–10 文件 / ~500 行 |
| DatePicker 时间 / 范围 | `showTime` / `hourFormat` / `RangeCalendar` | 5–8 文件 / ~350 行 |
| Drawer | 四向 `position` + header 侧滑（Alpha） | 5–7 文件 / ~350 行 |
| SplitButton | 自建 Button + DropdownMenu 组合 | 4–6 文件 / ~250 行 |
| ColorPicker | 组合 ColorArea / ColorField / ColorSlider / ColorSwatchPicker（Alpha） | 6–9 文件 / ~400 行 |
| DataView | 自建 `layout` grid / list + 插槽 | 4–6 文件 / ~250 行 |

### 第二阶段承接：M5 P1 增强（不在第一阶段）

> 用户决策（2026-09-14）：P1 增强延至第二阶段，由 momei 迁移实际暴露驱动。范围如下，供第二阶段评估时取用；**本表为决策备忘，不构成第二阶段待办登记**（规划规范 §3.3）。

| 条目 | 说明 | 预估 |
| --- | --- | --- |
| Image 点击预览 | `preview` 放大 + 遮罩 + `#indicatoricon` | 3–5 文件 / ~250 行 |
| ProgressSpinner 线宽 | `strokeWidth` / `animationDuration` / 任意尺寸 | 2–4 文件 / ~150 行 |
| Dialog 形态与断点 | `showHeader` / `breakpoints` / `@hide` | 3–5 文件 / ~200 行 |
| DataTable 剩余迁移项 | `rowsPerPageOptions` / `@sort` / `dataKey` / responsive / scrollable | 4–7 文件 / ~350 行 |

## 9. 验收标准与非目标

**阶段验收**（沿用 [路线图 §4](../../plan/roadmap.md)）：

1. `docs/plan/todo.md` 中第一阶段条目全部标记完成；
2. 质量门通过（lint / typecheck / test / build）；
3. 组件文档与设计文档同步；
4. 经 `@code-reviewer` Review Gate 放行并完成提交。

**阶段非目标**：

- momei 实际替换与其他下游接入（第二阶段）；
- P1 增强（M5，延至第二阶段，由迁移实际暴露驱动）；
- P2 低频增强（保留 Backlog，迁移按需）；
- RTL 与多语种翻译、移动端 / 响应式（Backlog §1.4 / §1.5）；
- Phase 8 下游兼容性回归机制。

## 10. 用户决策记录（2026-09-14）

| 决策项 | 结论 |
| --- | --- |
| 消费与调试路径 | **M1 先以本地 link 启动**；首版发布链路待外部 npm 凭据到位后补，可与本阶段并行 |
| P1 定位 | **M5 延至第二阶段**，由 momei 迁移实际暴露驱动，不纳入第一阶段 |
| P2 处理 | **不纳入第一阶段**，保留 [Backlog §1.1](../../plan/backlog.md)，迁移按需 |
| i18n 范围 | 第一阶段仅提供机制 + `zh-CN` / `en-US`；`zh-TW` / `ja-JP` / `ko-KR` 由下游注入 |
| 组件顺序 | M4 按 `DatePicker → Drawer → SplitButton → ColorPicker → DataView`（按用量与依赖） |

> 上表为第一阶段范围的最终决策，已登记至 [待办事项](../../plan/todo.md) 并由 [路线图](../../plan/roadmap.md) 同步。

## 11. 状态与回归基线

- 本记录为 **2026-09-14** 时点评估，数据基于当日 momei 实仓快照与 Phase 6 M1 属性台账；迁移实施时应以真实替换清单复核用量。
- 版本变化、momei 结构变化或用户决策调整时，本记录不追溯修改，由 [待办事项](../../plan/todo.md) 与 [路线图](../../plan/roadmap.md) 承载最新状态。
