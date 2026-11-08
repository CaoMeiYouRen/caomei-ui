# 下一阶段范围评估（第十三轮）：动效体系与图标体系落地

> 创建时间：2026-11-08
> 触发：用户指令「开始规划下阶段待办」（无预设方向，按候选池现状与近期用户诉求给组合）。
> 性质：**范围评估**，不构成阶段登记（[规划规范 §3 / §4](../../standards/planning.md)：阶段编号只在**授权启动**时分配）。
> 候选池现状：`backlog.md` §1 在册 **46 条**（复算式：§1.1 **6** + §1.2 **5** + §1.3 **0** + §1.4 **2** + §1.5 **3** + §1.6 **14** + §1.7 **1** + §1.8 **2** + §1.9 **5** + §1.10 **8** = **46**；只计数据行，不含表头与分隔行。路径：第十二轮的 42 条经 Phase 28 登记移出 5 行后为 37，再自动效 **+8** 与 Paginator 尺寸 **+1** = 46；第十二轮 42 为产出时点值，按[规划规范 §9](../../standards/planning.md) 的点时记录口径不回改）。

## 1. 候选盘点

### 1.1 四源清单

| 来源 | 内容 | 数量 | 性质 |
|:---|:---|:-:|:---|
| **a. backlog 在册** | 组件增强（§1.1）；长尾组件（§1.2）；国际化（§1.4）；移动端（§1.5）；基建与治理（§1.6）；服务层（§1.7）；下游协同（§1.8）；图标体系（§1.9）；动效体系（§1.10） | **46** | 待决策 / 条件触发 |
| **b. 下游反馈** | 2026-11-08 复核：open issue **0**、open PR **0**；Dependabot open 告警 **1**（`deepmerge`，low，未达插队门槛） | **0** | 无新增反馈 |
| **c. 用户新增方向** | 动效体系（2026-11-08，已评估并拆 A1 ~ A8）、图标体系（2026-11-07，调研已完成并拆 I1 ~ I5）、Paginator 每页选择器尺寸（2026-11-08 截图反馈） | **14** | 均已入候选池（含在 a 组 46 内） |
| **d. 时点事实（非候选）** | `latest = 1.2.0`（Release run `42440852062` success）；1.2.0 下游 compat run `42441345211` success；周级 run `42246255410` success 且 `Image: ubuntu-24.04`（26.04 迁移检测点未命中）；HEAD `4192410` 无相关 CI run（仅文档归档提交） | **4** | 时点事实，不进入候选池 |

> **取证位置**：a 组 = `docs/plan/backlog.md` §1.1 ~ §1.10 数据行逐行计数（2026-11-08）；b 组 = `gh issue list --state open`、`gh pr list --state open`、`gh api repos/CaoMeiYouRen/caomei-ui/dependabot/alerts?state=open`；c 组 = `backlog.md` §1.1 / §1.9 / §1.10 对应行；d 组 = `gh run view 42440852062` / `42441345211` / `42246255410`、`git rev-parse HEAD`（2026-11-08）。

### 1.2 backlog 分组与落点

| 组 | 行数 | 落点（§2 为唯一映射口径） |
|:---|:-:|:---|
| G1 组件增强（§1.1） | 6 | **D**（Paginator 每页选择器尺寸 1）；范围外 5（ColorPicker 色板导航 / DataTable 滚动高度 / DataTable 全选契约 / Paginator 报表 / Select `null` 告警） |
| G2 长尾组件（§1.2） | 5 | 范围外（Sidebar / ScrollPanel / BackTop / Rating / TimePicker 触发条件均未满足） |
| G3 不纳入自研（§1.3） | 0 | — |
| G4 国际化（§1.4） | 2 | 范围外（二期语言 / RTL 等扩容决策） |
| G5 移动端（§1.5） | 3 | 范围外；仅备选方案 ④ 纳入触摸目标 **P1**（1 行），P2 与其余 2 行维持范围外 |
| G6 基建与治理（§1.6） | 14 | 范围外；仅备选方案 ④ 纳入 3 行（实际安装版本断言 / Calendar · RichTextEditor 边界对比度 / 文档站 a11y 漏检示例），其余 11 行维持 |
| G7 服务层（§1.7） | 1 | 范围外（`useDialog` 维持候选） |
| G8 下游协同（§1.8） | 2 | 范围外（momei 根包接入待可行性；momei 侧迁移等待外部反馈） |
| G9 图标体系（§1.9） | 5 | **C**（I1 / I2 / I3）；I4 随迁移文档批次、I5 条件触发，均范围外 |
| G10 动效体系（§1.10） | 8 | **A / B / E**（A1 / A2 / A8）；A3 仅备选方案 ② 纳入；A4 ~ A7 范围外（下阶段） |
| **合计** | **46** | — |

> **候选覆盖声明**（按推荐草案 ①）：46 行按能力归并为 **10 组**（6 + 5 + 0 + 2 + 3 + 14 + 1 + 2 + 5 + 8 = 46）；**逐条均有落点**——A **1**（A1）/ B **1**（A2）/ C **3**（I1 ~ I3）/ D **1**（Paginator 尺寸）/ E **1**（A8）/ 范围外 **39**；**无静默豁免**。方案 ② 追加 A3（范围内 8 / 范围外 38）；方案 ③ 改为动效 A1 ~ A8 全量（范围内 8 / 范围外 38）；方案 ④ 改为图标 3 + Paginator 1 + 质量 3 + 触摸目标 P1 1（范围内 8 / 范围外 38）。
>
> **候选数 ≠ 条目数**：A1 / A2 / A8 / I1 / I2 / I3 / Paginator / 发布各对应 1 条原子条目（A8 的本轮覆盖边界见 §2）。

### 1.3 重点候选取证

| 候选组 | 现状读数 | 缺口 / 触发 |
|:---|:---|:---|
| **动效体系** | 56 个有组件页的组件中 **34 个已有动效**、**22 个无动效**；动效来源中 **4 个缺 `prefers-reduced-motion`**（`multi-select` / `tags-input` / `toast` / `field-shell.css`）；无 `--caomei-motion-*` token，时长以 `0.15s`（59 处）等字面量散落；现有 E2E 只断言时长非零 / 被关闭，**不验证过程** | 用户 2026-11-08 已确认需求；形态、批次与测试方案见[动效体系评估](./2026-11-08-motion-system-evaluation.md) §3 / §6 / §8 |
| **图标体系** | `@lucide/vue` 有值导入 **25 个文件**（含 4 个仅提及文件共 **29 处引用**）、去重 **22 个图标**；`CaomeiIcon` 仅接受 `Component` + `size`，无字符串名 / 注册表 / 覆盖入口；`--caomei-icon-size-sm/md/lg` 仍为规划 token | 用户 2026-11-07 需求；接口草案、映射面与构建期方案见[图标体系调研](./2026-11-07-phase28-m4-1-icon-system-research.md) §2 / §3 / §8 |
| **Paginator 尺寸** | 页码控件高 **32px**（`--caomei-paginator-control-size`），每页选择器走全局 `size="sm"`（默认 **28** / `data-density="touch"` **36**）；两者高度恒差 4px 且方向随密度轴翻转；选择器默认宽 **6rem**（96px），实测 **5rem**（80px）容纳 3 位数不裁切 | 用户 2026-11-08 截图反馈；方案与断言见[尺寸评估](./2026-11-08-paginator-rows-per-page-sizing-evaluation.md) §1 / §4 / §5 |
| **质量小项（备选 ④）** | ① Calendar 上 / 下月导航与 RichTextEditor 容器描边 < 3:1，未在 `preset-contrast` 边界矩阵；② `docs/examples/input-group/with-select.vue` 以 placeholder 代替可访问名且该页不在 `check-docs-axe` 矩阵；③ `downstream-compat.yml` override 后不断言实际安装版本 | 三项均为 §1.6 在册候选；③ 只能在真实 run 验证 |
| **触摸目标 P1（备选 ④）** | 表单控件盒 **17 个**目标：Checkbox 2 / RadioButton 6 / Switch 2 / Slider 3 / ColorPicker 滑柄 4；P0（34 个清除 / 关闭按钮）已由 Phase 27 承接，P2（35 个行高受限 / 内联行）须逐项确认交互绑定 | [触摸目标审计](./2026-10-16-phase25-m2-2-touch-target-audit.md) §4 |

## 2. 主线草案（裁定前草案：6 条，符合[规划规范 §6](../../standards/planning.md) 的 3 ~ 6 条容量）

> **本节是候选 → 主线的唯一映射口径**（[规划规范 §9](../../standards/planning.md)）：§1 只给来源、分组与落点，本节不重复候选清单。主线标签用 `A` ~ `F`，条目按阶段内顺序登记为 `M1` ~ `M6`（登记时按实际选取结果映射）。
>
> **草案构成**：**6 条主线 / 8 条原子条目**（A 1 / B 1 / C 3 / D 1 / E 1 / F 1 = 8）。

| 主线 | 内容 | 条目 | 论证 |
|:---|:---|:-:|:---|
| **A 动效基础层** | motion tokens、`minimal` 与现值逐项等价、`data-motion="expressive"` 覆盖、`prefers-reduced-motion` 全局兜底、`check-motion-contract` 守卫、测试 helper | 1 | 动效所有批次的前置；默认零视觉变化，风险集中在 token 等价与守卫误报 |
| **B 反馈与浮层动效** | Dialog / ConfirmDialog 进出场、Drawer 收口、Popover / DropdownMenu / Tooltip / Toast / Message / Alert 状态切换；退场与 Presence 行为；Toast reduced-motion | 1 | 用户给定第一优先级；状态切换最密集、退场最易漏 |
| **C 图标体系实现** | `CaomeiIcon` 三态适配层与可访问名、内置图标语义映射与覆盖入口、图标样式 token | 3 | 用户 2026-11-07 需求的实现批；调研已定形接口与映射面 |
| **D Paginator 尺寸对齐** | 高度统一到 `--caomei-paginator-control-size`、默认宽度 6rem → 5rem、E2E 尺寸断言与视觉基线 | 1 | 用户截图反馈；低风险视觉一致性修复，可与 C / E 并行 |
| **E 动效验收与人工复核** | `getAnimations()` + `currentTime` 时间轴矩阵、reduced-motion 双向断言、性能 / a11y 审计、人工复核清单与记录、主题文档 / 示例 | 1 | 用户明确要求「截图不足须设计测试与人工复核」；本轮覆盖 A / B 已交付批次 |
| **F 阶段末发布 1.3.0** | 经 CI 发布（semantic-release + OIDC）+ 下游 compat 复验 + 规划回填 | 1 | A / B / C 均为新增可见能力（minor）；D 为视觉一致性修复 |

### A 动效基础层（1 条）

- **A-1 motion tokens 与 `data-motion` 轴**：新增 duration / easing / distance / scale token，`minimal` 值 = 现值（逐选择器 computed transition / animation diff 为零）；正交 `data-motion="expressive"` 覆盖；补齐 4 个缺失 reduced-motion 来源（含 `field-shell.css`）；`check-motion-contract` 守卫（含加载动画白名单）接入 `governance:check`；E2E 测试 helper 与 `docs/design/theming.md` §5.3。
- **验收**：默认渲染零差异；轴切换生效；守卫负向用例覆盖裸时长 / 未登记动画 / 缺 reduced-motion。

### B 反馈与浮层动效（1 条）

- **B-1 反馈与浮层批次**：Dialog / ConfirmDialog 进出场与退场 DOM / 焦点回归；Drawer 收口；Popover / DropdownMenu / Tooltip 状态切换；Toast / Message / Alert 出现 / 消失；DropdownMenu 浮层唯一归本批；Toast reduced-motion 补齐。
- **验收**：`getAnimations()` 时间轴 enter / exit 断言；`reducedMotion: reduce` 下无位移 / 缩放；Presence 行为记录。

### C 图标体系实现（3 条）

- **C-1 `CaomeiIcon` 三态适配层与可访问名**：`icon` / `name` / registry 三态；`provideIconRegistry`（provide/inject、SSR 安全）；可访问名优先级 `label` > 透传 `aria-*` / `role` / `title` > 默认 `aria-hidden`；`icon` 由必填改可选（向后兼容）并在文档写明联合类型取舍。
- **C-2 内置图标映射表与覆盖入口**：25 个导入文件收敛到 `src/icons/internal-icons.ts` 语义映射（4 个仅提及文件改注释）；`provideIconOverrides` 应用级替换；保留 `#icon` 插槽优先级；禁止桶导出破坏 tree-shaking；**不得合并** Message `error`（`CircleAlert`）与 Toast `danger`（`CircleX`）。
- **C-3 图标样式 token 与文档示例**：`--caomei-icon-size-sm/md/lg`、`--caomei-icon-stroke-width`；容器内继续 `font-size` 驱动 `1em`；中英组件页补三态、覆盖入口与 token 用法，补 `pi pi-*` / 自备 SVG / 品牌 logo 的构建期指引（原 I4 的文档面并入本条，不新增运行时依赖）。

### D Paginator 尺寸对齐（1 条）

- **D-1 选择器与页码控件尺寸统一**：高度覆盖为 `var(--caomei-paginator-control-size)`（默认 / touch 均为 32px）；默认宽度 6rem → 5rem；**圆角不在本条默认范围**（见 D4）；补 E2E 尺寸断言（同实例高度相等、三档视口、默认 / touch）与 Paginator 亮暗视觉基线重冻结。

### E 动效验收与人工复核（1 条）

- **E-1 动效验收装置与本轮复核**：L1 ~ L4 矩阵落地；`getAnimations()` + `currentTime` 确定性采样；reduced-motion 双向断言；性能（longtask / 布局属性动画）与 a11y 审计；人工复核清单与录屏记录；主题文档与示例。
- **覆盖边界**：本轮只覆盖 A / B 已交付批次；A3 ~ A7 的验收随其批次扩展，不重复建条目。

### F 阶段末发布 1.3.0（1 条）

- **F-1 经 CI 发布 1.3.0**：`Release` workflow → npm `latest` / tag / GitHub Release / 回推；发布后下游 compat（已在 dispatch 前等待 npm 传播）；回填版本句 / 里程碑 / 规划载体。

## 3. 待决策点（D1 ~ D5）

| 编号 | 决策点 | 备选 | 推荐 |
|:---|:---|:---|:---|
| **D1** | 阶段主线组成 | ① **A + B + C + D + E + F**（6 主线 / 8 条目）② ① + A3 导航与操作（6 主线 / 9 条目）③ 动效全量 A1 ~ A8 + F（6 主线 / 8 条目，不含图标 / Paginator）④ 图标 C + Paginator D + 质量 3 项 + 触摸目标 P1 + F（4 主线 / 8 条目，动效后置）⑤ 仅 A + B + E + F（4 主线 / 4 条目） | **①**（动效首批 + 图标实现 + 截图反馈一次收口，规模与 Phase 28 同量级） |
| **D2** | 动效形态与强度（若 D1 含动效） | ① **正交 `data-motion="expressive"`（缺省 `minimal`）+ 克制强度** ② 正交轴 + 明显位移 / 缩放 ③ `data-preset="expressive"` 单值 ④ 暂不落地动效 | **①**（与配色 / 明暗 / 密度正交；`expressive` 不做弹跳与长时间循环） |
| **D3** | 图标实现范围 | ① **I1 + I2 + I3 + I4 文档面**（= C-1 ~ C-3）② 仅 I1 + I2 ③ 仅 I1 ④ I1 ~ I5 全量（含可选运行时 peer）⑤ 暂不实现 | **①**（接口 + 映射 + token + 迁移文档一次成型；不引入运行时依赖） |
| **D4** | Paginator 尺寸范围 | ① **高度 + 宽度（不含圆角）** ② 高度 + 宽度 + 圆角对齐（4px → 8px）③ 仅高度 ④ 不纳入本阶段 | **①**（截图诉求是高度差；圆角会额外改外观并扩视觉基线面） |
| **D5** | 阶段末发布 | ① **1.3.0（minor）** ② 不发布，积累到下一阶段 | **①**（A / B / C 为新增能力，D 为视觉修复；沿用已验证的 CI 发布链） |

> **默认落定（不占决策项）**：不引入破坏性 API 变更；`data-motion` 缺省与全部 token 默认值 = 现值（`capture:styles` / 视觉基线默认组 0 差异）；中英文档同步；不新增运行时依赖（图标走构建期 / 用户自备）；A4 ~ A7、触摸目标 P1 · P2、RTL、二期语言、长尾组件、Tailwind / UnoCSS、文档站多版本托管、Storybook 维持范围外；推送与发布以用户当次明确指令为前提。
>
> **规模提示**：C-2 涉及 25 个导入文件，超过[规划规范 §5](../../standards/planning.md) 的「10 文件」建议阈值；实施时按组件族拆 2 ~ 3 个提交，或按「单一语义映射收敛」声明整体批次理由，由 Review Gate 判定。

### 3.1 裁定结果（用户 2026-11-08）

| 编号 | 裁定 | 结论 |
|:---|:---|:---|
| **D1** | **②** | 取 **① + A3 导航与操作**；即动效 A1 / A2 / A3 / A8、图标 I1 ~ I3（含 I4 文档面）、Paginator 尺寸 |
| **D2** | **①** | 正交 `data-motion="expressive"`（缺省 `minimal`）+ 克制强度 |
| **D3** | **①** | 图标 I1 + I2 + I3 + I4 文档面（= C-1 ~ C-3），不引入运行时依赖 |
| **D4** | **①** | Paginator 高度 + 宽度（不含圆角） |
| **D5** | **②** | **本阶段不发布**，版本积累至下一阶段；D1 ② 草案中的 F 发布主线随之退出 |

> **组合后构成**：**6 条主线 / 8 条原子条目**（动效基础层 1 / 反馈与浮层 1 / 导航与操作 1 / 图标体系 3 / Paginator 1 / 动效验收 1；对账 1 + 1 + 1 + 3 + 1 + 1 = 8）。D1 ② 原表述的 9 条含发布条目，D5 ② 退出发布后为 8 条。

## 4. 规模与风险

- **规模**：草案 **6 条主线 / 8 条原子条目**；与 Phase 24 ~ 28 的 8 ~ 18 条同量级；预估 **3 ~ 5 个交付轮**。
- **风险**：
  1. **token 等价**：A-1 的 `minimal` 必须与现值逐选择器等价，任何时长 / 缓动漂移都会放大到 20+ 组件；以 computed diff 与 `capture:styles` 双证据约束。
  2. **动效测试确定性**：`getAnimations()` 依赖有界等待与 `pause()` + `currentTime`，须避免 `sleep` flaky；退场在 Portal / Presence 下的 DOM 保留时机需逐组件取证。
  3. **图标重构面**：I2 触及 25 个文件，且 Message `error` 与 Toast `danger` 现值不同；须以视觉回归覆盖四语气，禁止顺手合并语义。
  4. **公开契约**：`CaomeiIcon` 的 `icon` 可选化、`name` / `strokeWidth` / `label` 进入冻结面；`data-motion` 进入主题轴文档，须同步 `theming.md` / 冻结清单 / token 计数载体。
  5. **视觉基线**：B / C 的浮层与图标尺寸变化、D 的 Paginator 几何变化均需重冻结；默认组不得变化。
  6. **发布面**：1.3.0 为 minor；API 差分应只出现新增，不得混入 breaking。
- **非目标**：A4 ~ A7（若取方案 ①）、触摸目标 P1 / P2（方案 ④ 除外）、RTL、二期语言、长尾组件、`useDialog`、momei 根包接入、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook、自动推送。

## 5. 登记状态

- **已登记**：按[规划规范 §4](../../standards/planning.md) 取授权时最大编号（Phase 28）+ 1 = **Phase 29**；构成 **6 条主线 / 8 条原子条目**（对账 1 + 1 + 1 + 3 + 1 + 1 = 8；D5 ② 不发布，原草案 F 退出）。
- **唯一口径载体**：[Phase 29 登记批次记录](./2026-11-08-phase29-registration.md) §1 / §2；本记录只保留评估与裁定。
- **候选池**：**46 → 37**（移出 9 行：动效 A1 / A2 / A3 / A8、图标 I1 / I2 / I3 / I4、Paginator 每页选择器尺寸；`backlog.md` 复算式 5 + 5 + 0 + 2 + 3 + 14 + 1 + 2 + 1 + 4 = 37）。
- **载体同步**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引 / `.session/` 已同批更新。

## 6. Review Gate

- **R1（`standard`）：`Pass`**（0 blocker / 2 warning / 3 suggest；实测约 7 分钟，未超 ≤ 8 分钟时间盒）——W1 本记录 §1 候选池差值算式漏记 Phase 28 移出 5 行（已改为「42 → 37 → 46」路径并存点时值）；W2 `.session/runtime-state.json` 残留 Phase 28 文案（已同步）；S1 ~ S3 一并采纳（点时值标注 / Backlog §1.1 移出注记 / Toast reduced-motion 归属收口）。详见[登记批次记录](./2026-11-08-phase29-registration.md) §6。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 1 suggest；实测约 2.5 分钟，未超 ≤ 5 分钟时间盒；R1 的 2 warning / 3 suggest 全部关闭）。新增 suggest 复核为误报（原文即「再自动效」），未改动。
