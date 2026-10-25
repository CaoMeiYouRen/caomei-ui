# 手机端优先主题预设评估

> 日期：2026-10-25。触发：用户提出「组件与样式分离，是否存在只调整样式就适配手机端的主题预设」。
> 关联：[设计规范 §5](../../design/design-spec.md#_5-主题预设-已实现)、[主题与样式设计](../../design/theming.md)、[响应式设计](../../design/responsive.md)、[移动端与响应式指南](../../guide/mobile.md)、[触摸目标实测复核](./2026-10-16-phase25-m2-2-touch-target-audit.md)。

## 1. 结论摘要

- **现状可以做到「部分适配」，但不能只靠 `data-preset` 做到「手机端优先」。**
- 颜色、圆角、阴影、控件高度、字号、控件宽度上限都由 `--caomei-*` token 驱动，**纯 CSS 变量可以覆盖**；这足以做出「触摸友好密度」。
- 但手机端的关键缺口不在颜色或控件高度：
  - 触摸命中区（Checkbox / RadioButton 18px、Switch 40×22、13.33px icon 按钮）由组件内部固定尺寸决定，**当前没有 token 可调**；
  - 断点是 `@media (width <= 640 / 768 / 1024px)` 字面量，**不可 token 化**；
  - 页面级布局、DataTable 卡片化、Dialog 全屏、Stepper 方向、安全区、软键盘避让属于**行为 / 布局**，不是主题预设能承载的。
- **建议（不阻塞 1.0）**：`data-preset` 继续只承载品牌 / 视觉气质，不新增 `mobile` 预设。手机端优先采用**独立密度轴**（候选 `data-density="touch"`）承载尺寸类 token，并与颜色预设正交；同时补 `--caomei-hit-target-min`（不可见命中区）解决真正的触摸缺口。
- 在密度轴落地前，使用方可用现有 token 写一段「触摸优化覆盖」；本文 §5 给出可直接复制的配方，并在 [移动端与响应式指南](../../guide/mobile.md) 增补说明。该候选已登记 [Backlog §1.5](../../plan/backlog.md)。

## 2. 现状事实

### 2.1 预设机制

- 预设是**静态 token 集**：`[data-preset='<name>']` + 暗色选择器 + `prefers-color-scheme` 媒体查询；**不含视口媒体查询**，不随窗口宽度变化。
- 预设与明暗正交，且必须挂在同一元素（通常 `<html>`）；文档站的预设切换器只写 `document.documentElement.dataset.preset`。
- 缺省预设为 `minimal`；新增的 `sakura` / `forest` / `ink` 与 `caomei` / `momei` 共享同一 token 契约（见 [设计规范 §5](../../design/design-spec.md#_5-主题预设-已实现)）。

### 2.2 可以由纯样式适配的面

| 面 | token | 默认值 | 手机端可调方向 | 备注 |
| --- | --- | --- | --- | --- |
| 控件高度 | `--caomei-control-height-sm/md/lg` | 28 / 36 / 44 | 36 / 44 / 52 | 按钮、输入类、Select 等 57 处引用（sm 19 / md 25 / lg 13） |
| 字号 | `--caomei-font-size-sm/md/lg` | 12 / 14 / 16 | 14 / 16 / 18 | 输入类 ≥16px 可避免 iOS 聚焦缩放 |
| 间距 | `--caomei-space-1..4` | 4 / 8 / 12 / 16 | 可整体放大 | 组件内边距共用，放大需回归 |
| 控件宽度上限 | `--caomei-input-number-max-width` / `--caomei-select-max-width` | 12rem / 20rem | `none` / `100%` | 窄屏默认已全宽 |
| 圆角 | `--caomei-radius-sm/md/lg` | 4 / 8 / 12 | 可放大 | 已由预设承载，不建议再与密度轴混用 |
| 颜色 / 阴影 | 颜色、`--caomei-shadow-*` | — | 无需为手机端改变 | 与平台无关 |

### 2.3 不能由主题预设适配的面

| 面 | 事实 | 影响 |
| --- | --- | --- |
| 触摸命中区 | Checkbox / RadioButton 控件盒 18px、Switch 40×22、清除 / 关闭 icon 按钮最小 13.33px；289 个受检目标中 87 个 <24×24、仅 9 个 ≥44 | 这是手机端最实际的可用性缺口；主题预设改不到 |
| 断点 | `@media (width <= 640 / 768 / 1024px)` 为字面量，`@media` 不支持 CSS 自定义属性 | 预设无法把桌面优先改成手机优先 |
| 布局与行为 | 页面分栏、DataTable 卡片化、Dialog 全屏、Stepper 方向、侧栏 / 抽屉形态 | 属使用方或组件行为，不是 token |
| 安全区 / 软键盘 | 无 `safe-area-inset-*` / `100dvh` / 键盘避让 token | 刘海屏、底部手势区、输入聚焦需组件或页面处理 |
| 指针差异 | Reka 处理指针事件；Tooltip 等 hover 提示在触摸端无等价触发 | 需要交互策略，不是颜色 / 尺寸 |

> 结论：**「组件与样式分离」成立在 token 层**；「只改样式适配手机端」只能覆盖视觉密度，不能覆盖命中区、断点与布局行为。

### 2.4 触摸目标实测（2026-10-16）

- 390×844 与 320×568 两档、289 个可点目标：**<24×24 共 87（30.1%）**、24–43.99 共 193、**≥44 仅 9**。
- 最大单一构成：**13.33×13.33 清除 / 关闭 icon 按钮 34 个**（TagsInput 11 / AutoComplete 10 / MultiSelect 9 / Password 3 / Tag 1）。
- 既有决策：库侧**暂不提升**视觉尺寸；提升须引入不改变视觉盒的不可见命中区原语。逐组件清单见[触摸目标实测复核](./2026-10-16-phase25-m2-2-touch-target-audit.md)。

## 3. 候选承载形态

| 形态 | 做法 | 优点 | 缺点 / 风险 | 结论 |
| --- | --- | --- | --- | --- |
| **A. 静态 `mobile` 预设** | 新增 `data-preset="mobile"`，覆盖控件高度 / 字号 / 宽度上限 | 零新机制；SSR 安全；一个属性 | 桌面端同样放大；预设语义从「品牌」变成「平台 + 品牌」；仍解决不了命中区与断点 | 不推荐作为默认 |
| **B. 视口感知预设** | 在预设文件内写 `@media (width <= 768px)` 覆盖尺寸 token | 自动响应视口；使用方无感 | 同一 `data-preset` 在不同视口解析不同；SSR 首屏按桌面渲染，水合可能闪动 / CLS；与「预设 × 明暗正交」契约冲突；视觉基线需新增视口轴 | **不建议** |
| **C. 独立密度轴** | 新增 `data-density="compact / default / touch"`，只覆盖尺寸类 token | 与任意颜色预设、明暗、系统跟随正交；SSR 安全；未来可扩展 `compact`；语义清晰 | 新增公共契约（需冻结 / 文档 / 测试）；默认值须与现状逐值一致 | **推荐（1.0 后或用户裁定后）** |
| **D. 文档配方** | 不新增 API，在移动端指南给出 CSS 覆盖片段 | 零风险；立即可用 | 复制粘贴；无统一保证；升级需自行维护 | **短期采用** |

### 3.1 为什么不建议 B

- `data-preset` 当前是**纯 token 集**，同一属性值在任何环境解析一致；引入视口媒体查询后，属性值不再足以描述渲染结果，文档、测试与下游缓存都要追加视口维度。
- SSR 阶段无法读取视口宽度，首屏只能按桌面值输出；客户端水合后切换为触摸值，会造成控件高度跳变。暗色已有 `data-scheme="auto"` 的媒体查询，但那是**颜色**变化、不影响布局盒；尺寸变化会直接触发 CLS。
- 若确实需要「窄屏自动放大」，使用方在页面级写 `@media` 覆盖 token 更可控，也更符合现有「断点由使用方数据 / 组件自身收敛」的分工。

## 4. 建议方案

### 4.1 短期（当前 1.0 前）

- **不新增 `mobile` 预设**；`data-preset` 维持六套视觉预设。
- 在 [移动端与响应式指南](../../guide/mobile.md) 增补「触摸优化覆盖」配方：使用方在移动端容器或媒体查询内覆盖控件高度 / 字号 / 宽度上限（见 §5）。
- 不改变任何默认 token，零回归。

### 4.2 中期（1.0 后，需用户裁定）

1. **密度轴**：`data-density="touch"`（缺省不写 = 当前值），只改尺寸类 token，不改颜色、圆角、阴影。
2. **命中区 token**：`--caomei-hit-target-min`（默认 0 / 不启用），由 icon 按钮、Checkbox、RadioButton、Switch 以 `::after` 扩大不可见命中区；视觉盒不变。
3. **Nuxt 模块**：可选 `density` 配置项，写入根元素属性；与 `theme` / `darkMode` 同一层。
4. **文档**：新增「密度与触摸」小节，说明与预设正交、SSR 行为、如何按视口自行切换。

### 4.3 若仍要一个「手机端预设」

只有在**应用本身只面向手机**（不存在桌面布局）时才建议使用，且应命名为 `touch`（描述密度，不描述视口），并在文档中明确：

- 它是**全局静态**的，不会随窗口宽度自动切换；
- 桌面端使用会得到偏大的控件；
- 不能替代命中区、断点与布局适配。

## 5. 短期可复制的覆盖配方

> 仅覆盖尺寸类 token；颜色仍由当前预设决定。按需放在应用根容器或媒体查询内。

```css
@media (width <= 768px) {
    :root {
        --caomei-control-height-sm: 36px;
        --caomei-control-height-md: 44px;
        --caomei-control-height-lg: 52px;
        --caomei-font-size-sm: 14px;
        --caomei-font-size-md: 16px;
        --caomei-font-size-lg: 18px;
        --caomei-input-number-max-width: none;
        --caomei-select-max-width: none;
    }
}
```

注意：

- `font-size-md: 16px` 可避免 iOS 对小于 16px 的输入框聚焦缩放，但会改变按钮 / 表格行高等布局，需要按 §6 回归。
- 该配方**不会**扩大 Checkbox / RadioButton / Switch / icon 按钮的命中区；触摸密集区仍需使用层加 padding 或包装元素。

## 6. 若采纳的实施与验收清单

| 项 | 验收标准 |
| --- | --- |
| 密度 token | `touch` 下 `control-height-sm/md/lg = 36 / 44 / 52`、`font-size-sm/md/lg = 14 / 16 / 18`；缺省不写时与现状逐值一致 |
| 正交性 | `data-density` 可与任意 `data-preset`、`.dark`、`data-scheme="auto"` 组合；不改变颜色 token |
| 命中区 | icon 按钮 / Checkbox / RadioButton / Switch 命中区 ≥44×44（或 ≥24×24 的 WCAG 档，按裁定），视觉盒零变化；相邻目标不重叠 |
| SSR | 服务端与客户端首屏一致；无尺寸跳变 / CLS |
| 回归 | 390 / 768 / 1440 三档 E2E；DataTable / Toolbar / ButtonGroup / Tabs / Paginator 不溢出、不裁切；视觉基线新增至少一个 `density=touch` 面 |
| 文档 | 设计规范、主题设计、移动端指南、README 中英同步；说明「预设不是断点机制」 |
| 兼容 | 不新增 / 不重命名现有 token；默认路径零变化；1.x 内新增属性属向后兼容 |

## 7. 未决问题

1. 密度轴命名取 `data-density` 还是 `data-platform`？前者表达尺寸，后者表达设备；建议前者。
2. `touch` 档的控件高度取 44 / 52 是否过大？需真实页面与 DataTable 行高回归后裁定。
3. 命中区统一目标取 **44×44（Apple HIG）** 还是 **24×24（WCAG 2.5.8）**？现有实测 87 个 <24，先补 24 的收益更大。
4. 密度轴是否也承载 `--caomei-space-*`？放大间距会改变大量布局，建议首版不承载。
5. 是否把 `font-size-md: 16px` 作为 `touch` 档默认值？它对 iOS 友好，但会改变桌面/平板观感，需与「密度轴只用于触摸」的语义一起裁定。
