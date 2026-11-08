# 动效体系与新动效轴评估

> 创建时间：2026-11-08
> 触发：用户需求「增强组件动画效果；极简模式仍只保留必要动画、不默认启用；新增以动画优先的主题，覆盖组件状态切换；按反馈与浮层 → 导航与操作 → 表单输入 → 基础与布局 → 选择器 → 数据展示的顺序评估推进；截图不足以验证动画，需设计单元 / 集成 / E2E 测试并允许人工复核」。
> 性质：**评估记录 + Backlog 登记**；零实现、零依赖、零 `src/**` / `test/**` / 构建配置改动。
> 口径：本记录只回答「怎么做、先做什么、怎么验」，不登记阶段、不进入 `todo.md`；候选拆分见 §8，Backlog 为唯一候选载体。

---

## 1. 结论摘要

- **建议形态**：不新增配色预设，而是新增与预设 / 明暗正交的**动效轴** `data-motion="expressive"`（暂定名），缺省 `minimal`。理由：`data-preset` 是单值枚举，新增「动效预设」会与 `caomei` / `momei` / `sakura` / `forest` / `ink` 互斥；动效轴可和任意配色、明暗、密度组合，且与既有 `data-density` 轴同构。
- **默认零变化**：`minimal` 的 token 值与当前硬编码时长 / 缓动逐项等价；未设置 `data-motion` 时渲染与现状一致（含既有 150ms 状态反馈与加载动画）。增强动效只在 `data-motion="expressive"` 下启用。
- **覆盖现状**：56 个有组件页的组件中 **34 个已有某种动效**（34 个 `.vue` 文件去重后 30 个组件 + `src/styles/field-shell.css` 共享层覆盖 Input / InputNumber / Select / Textarea 4 个组件；组件层 90 行文本命中、13 个含 `@keyframes` 的文件）；**22 个无动效**。动效来源中 **4 个缺 `prefers-reduced-motion`**（`multi-select` / `tags-input` / `toast` / `field-shell.css`）。
- **测试结论**：截图只能验证**静止终态**，不能验证过程。建议四层验证：① CSS / 源码契约守卫；② 组件层单一状态断言；③ Playwright 用 `getAnimations()` + `currentTime` 做**确定性时间轴采样**，并在 `reducedMotion: reduce` 下做双向断言；④ 人工复核（录屏 / 慢放 / 清单）。不引入动画测试专用运行时依赖。
- **拆分**：按用户给定优先级拆为 **A1 ~ A8** 八个候选（基础层 / 反馈与浮层 / 导航与操作 / 表单输入 / 基础与布局 / 选择器 / 数据展示 / 测试与人工复核），候选池 **37 → 45**。

## 2. 现状盘点（2026-11-08 静态扫描）

### 2.1 主题与轴

- 预设：根元素 `data-preset` 取值 `minimal`（缺省）/ `caomei` / `momei` / `sakura` / `forest` / `ink`，见 [`theming.md`](../theming.md) §3。
- 尺寸轴：`data-density="touch"` 独立于预设与明暗，只覆盖尺寸类 token；文档明确「不是预设，不进入 `data-preset` 命名空间」。
- **没有统一的动效 token**：`theme.css` 与各预设均未声明 `--caomei-motion-*` / `--caomei-duration-*` / `--caomei-ease-*`；可覆盖入口至少包括 `--caomei-drawer-duration`（可在下游 CSS 覆盖，但组件页未登记、无公开契约）、`--caomei-float-label-transition-duration`（组件页已文档化）与共享层 `--caomei-field-transition`。

### 2.2 动效声明分布

- 组件层 `rg -o '(transition|animation):[^;]*' src/components --glob '*.vue' -N` 文本命中 **90** 行（其中 `skeleton.vue` 的 `animation: 'pulse'` 是 JS prop 默认值，不是 CSS 声明）；共享层 `src/styles/field-shell.css` 另有 1 个 `--caomei-field-transition` 定义 + 1 处 `.caomei-field { transition }`。13 个文件含 `@keyframes`。
- CSS 字面量时长（全 `src/**`，含 `var()` 回退）：`0.15s` **59**（组件 57 + 共享层 2）+ `150ms` **1**（`image.vue`，同值不同写法）、`200ms` 10（全部为 drawer 的 `var(...)` 回退）、`0.2s` 4、`0.12s` 3、`2.4s` 3、`1.6s` 2、`1.5s` 2、`0.6s` 2、`0.1s` 2，`0.8s` / `1.2s` / `1.4s` / `0.3s` / `0.18s` 各 1；其中 `1.6s` / `2.4s` 只出现在 reduced-motion 降速段。
- 缓动以 `ease` 为主（组件层 66 处；共享层另有 2 处），`ease-out` 9 处、`ease-in-out` 4 处、`linear` 3 处。
- 存在布局属性动画：`accordion` 的展开 / 收起对 `height` 做 keyframes；`progress-bar` 对 `width` 做 transition。动效优先批次须评估是否改为合成层属性或限制适用范围。
- 共享层 `field-shell.css` **没有** `prefers-reduced-motion` 兜底，因此 Input / InputNumber / Select / Textarea 的边框 / 聚焦过渡在 reduce 下仍会执行。

### 2.3 分类覆盖

| 分类（用户优先级） | 组件数 | 已有动效 | 主要缺口 |
| --- | ---: | --- | --- |
| 反馈与浮层 | 8 | Drawer / Popover / Toast / Tooltip（4） | Dialog / ConfirmDialog 无进场与退场；Message / Alert 无动效；Toast 缺 reduced-motion |
| 导航与操作 | 7 | Accordion / DropdownMenu / Menu / Stepper / Tabs / Toolbar（6） | Breadcrumb 无；Tabs 内容切换与指示器未覆盖；Accordion 高度动画待评估 |
| 表单输入 | 14 | Checkbox / FileUpload / FloatLabel / Password / RadioGroup / Switch / TagsInput（7）+ Input / InputNumber / Textarea 经共享层（3） | InputGroup / CheckboxGroup / Form / Slider 无；TagsInput 缺 reduced-motion；共享层缺 reduced-motion |
| 基础与布局 | 11 | Badge / Button / Card / Image（4） | Avatar / Tag / Divider / Row / Col / ButtonGroup / SplitButton 无 |
| 选择器 | 8 | AutoComplete / DatePicker / MultiSelect / SelectButton / ToggleButton（5）+ Select 经共享层（1） | ColorPicker / Calendar 无；MultiSelect 缺 reduced-motion；共享层缺 reduced-motion |
| 数据展示 | 6 | Paginator / ProgressBar / ProgressSpinner / Skeleton（4） | DataTable / DataView 无；加载类动画已有，主要缺状态切换 |
| 高级组件 | 2 | Chart / RichTextEditor（0） | 第三方内核；只评估容器层状态（加载 / 空态），内部编辑动画不纳入 |
| 合计 | 56 | **34** | **22 个无动效；动效来源中 4 个缺 reduced-motion（3 个 `.vue` + 共享层）** |

> 计数口径：按 `docs/.vitepress/config.ts` 的组件侧栏分组统计，`ConfigProvider` 无自有视觉、不计入；`_shared` 不计入。扫描命令：`rg -l '(transition|animation)\s*:' src/components --glob '*.vue'`、`rg -l '@keyframes' src --glob '*.{vue,css}'`。

### 2.4 现有测试与文档

- `test/e2e/focus-and-motion.e2e.ts` 已有「默认动效路径（`no-preference`）↔ `reduce` 压平」的双向断言，但只检查 `transitionDuration` / `animationDuration` 是否非零 / 被关闭，未验证**过程**。
- Playwright 全局以 `reducedMotion: 'reduce'` 运行（几何确定性），少数用例以 `test.use({ reducedMotion: 'no-preference' })` 补默认路径。
- `test/e2e/drawer-convergence.e2e.ts` 验证 reduced-motion 下抽屉动画为 `none`；`button-states.e2e.ts` 验证按钮过渡在 reduce 下关闭。
- `docs/.vitepress/theme/motion.css` 保存文档站演示用 `caomei-demo-*` keyframes 副本，由 `check:demo-keyframes` 守卫；新增动效若用于示例，须同步登记。
- 测试规范已记录「读参与 transition 的属性须等过渡结束 / 注入 `transition: none`」与「视觉测量禁用动画」的口径，但尚无通用的**动效时间轴**测试约定；共享层 `field-shell.css` 的 reduce 缺口也未被现有 E2E 覆盖。

## 3. 形态评估：新「主题」怎么落

| 方案 | 形态 | 优点 | 问题 | 结论 |
| --- | --- | --- | --- | --- |
| A 新增配色预设 `data-preset="expressive"` | 与 `minimal` / 品牌预设同层 | 用户直觉一致 | `data-preset` 单值，动效无法与品牌配色 / 明暗组合；需复制或继承配色，产生两套主题矩阵 | **不推荐** |
| B 正交动效轴 `data-motion="expressive"` | 独立属性，缺省 `minimal` | 与任意预设、明暗、密度组合；与 `data-density` 同构；作用域可挂在任意祖先 | Portal 面板不继承局部容器属性（需挂 `<html>`，与密度轴同一边界） | **推荐** |
| C 独立 CSS 入口 / 类名 | 额外样式表或 class | 不扩属性面 | 与现有「基础层 + 预设」分发方式不一致，下游接入成本高 | 不推荐 |
| D 引入第三方动效库（motion-v / @vueuse/motion） | 运行时依赖 | 声明式编排方便 | 增加运行时与包体、SSR / reduced-motion / CSP 面扩大；多数状态切换 CSS 已足够 | **不推荐**；如未来确需编排复杂序列，另立条件候选 |

**推荐 B 的落地口径**：

- `data-motion` 取值：`minimal`（缺省，等同不设置）/ `expressive`（动效优先）。不新增 `none`，无动效需求由 `prefers-reduced-motion` 或下游自身 CSS 承担。
- 挂在 `<html>` 或任意祖先；Portal 面板需随根节点一起生效（文档须写明，同 `data-density`）。
- 对外可称「动效主题 / 动效优先模式」，但**不进入 `data-preset` 命名空间**，避免与配色互斥。
- 若用户坚持要 `data-preset` 单值入口，可提供 `data-preset="expressive"` 作为**只改动效、配色回退 `minimal`** 的便捷别名；代价是无法与品牌预设组合，作为可选糖，不做主路径。
- **SSR / 无 JS**：`data-motion` 为纯 CSS 属性，服务端可直接写在根节点，未设置即 `minimal`；无运行时读取、无水合分支、不引入 CLS，与 `data-density` 同构。

## 4. 动效设计原则与 token 草案

### 4.1 原则

1. **状态驱动**：只为状态切换（hover / focus / active / open / close / check / select / add / remove / expand / collapse / sort / page / loading / invalid）提供动效，不做无触发的常驻装饰动画。
2. **默认克制**：`minimal` 只保留必要的状态反馈与加载指示；`expressive` 也不做夸张弹跳、长时间循环或影响阅读的位移。
3. **合成层优先**：优先 `opacity` / `transform`；`height` / `width` 动画只用于内容展开且需测量成本（Accordion / ProgressBar 例外须逐项评估）。
4. **可中断 / 可逆**：同一状态反复切换时动画可被新状态打断，不排队、不锁交互。
5. **减弱优先**：`prefers-reduced-motion: reduce` 下，`expressive` 也必须退化为无位移 / 极短淡入；加载类可降速而非完全停止（沿用 ProgressSpinner 口径）。
6. **不阻塞输入**：动画期间控件仍可点击 / 聚焦；不用 `pointer-events: none` 掩盖过渡。
7. **终态稳定**：动画结束后的计算样式与 `minimal` 逐值一致；视觉基线只验证终态。

### 4.2 token 草案（名称待实现批定稿）

| token | `minimal`（= 现状） | `expressive`（建议） | 用途 |
| --- | --- | --- | --- |
| `--caomei-motion-duration-instant` | 100ms | 120ms | 极短反馈 / 滑动收尾 |
| `--caomei-motion-duration-fast` | 120ms | 160ms | 浮层淡入 |
| `--caomei-motion-duration-base` | 150ms | 220ms | 颜色 / 边框 / 位移状态 |
| `--caomei-motion-duration-emphasis` | 180ms | 240ms | Toast 等强调入场 |
| `--caomei-motion-duration-slow` | 200ms | 300ms | 展开 / 收起、面板 |
| `--caomei-motion-duration-slower` | 300ms | 400ms | 进度宽度等 |
| `--caomei-motion-ease-standard` | `ease` | `cubic-bezier(0.2, 0, 0, 1)` | 常规进入 / 状态变化 |
| `--caomei-motion-ease-exit` | `ease` | `cubic-bezier(0.4, 0, 1, 1)` | 退出 / 收起 |
| `--caomei-motion-distance-sm` | 0 | 4px | 轻微位移 |
| `--caomei-motion-distance-md` | 0 | 8px | 浮层 / 面板位移 |
| `--caomei-motion-scale-from` | 1 | 0.96 | 浮层缩放入场 |

> 取值是实现建议，不是承诺；最终值须在实现批用 `capture:styles` 与终态截图证明 `minimal` 零漂移。既有硬编码时长先映射到 `minimal` token（逐项等价），再新增 `expressive` 覆盖。
>
> **加载 / 循环动画例外**：spinner / skeleton / indeterminate progress / image pulse 的时长（0.6 / 0.8 / 1.2 / 1.4 / 1.5s）及 reduce 降速值（1.6 / 2.4s）保留组件级声明，由 `check-motion-contract` 的白名单登记，不强行归并为单一 loop token；过渡与一次性入场 / 退场动画才要求走 motion token。

## 5. 覆盖优先级与批次

### 5.1 状态切换清单

| 状态族 | 代表组件 | 首批关注 |
| --- | --- | --- |
| 打开 / 关闭（含退场） | Dialog / ConfirmDialog / Drawer / Popover / DropdownMenu / Tooltip / Toast | 退场是否保留 DOM、Presence 行为、焦点回归 |
| 出现 / 消失 | Toast / Message / Alert / Tag / Badge | 列表插入 / 移除的位移与高度变化 |
| 勾选 / 选中 / 切换 | Checkbox / RadioGroup / Switch / SelectButton / ToggleButton / Select / MultiSelect | 指示器位移、选中态强调 |
| 展开 / 收起 | Accordion / DataTable 行 / 分组 / Menu 子菜单 | 高度动画成本、内容可读性 |
| 切换内容 | Tabs / DataView / Stepper | 内容淡入 / 指示器滑动，避免布局跳动 |
| 排序 / 分页 / 选择 | DataTable / Paginator | 行重排、批量选择的反馈，避免大面积动画 |
| 输入 / 校验 | Input / Textarea / InputNumber / Form | 聚焦、invalid、计数 / 步进反馈 |
| 加载 / 进度 | Button loading / Skeleton / ProgressBar / ProgressSpinner | 既有加载动画保留，仅统一 token |

### 5.2 推进顺序（用户给定优先级的落地）

> **成员唯一权威 = §8**：本节只给顺序与理由，批次成员以 §8 表为准；修改 §8 后须回扫本节措辞。

1. **A1 基础层**：token、`data-motion` 轴、reduced-motion 兜底、契约守卫、测试装置；不改任何组件默认外观。
2. **A2 反馈与浮层**：Dialog / ConfirmDialog（进出场）、Drawer、Popover、DropdownMenu、Tooltip、Toast、Message / Alert；先解决退场与 Presence。
3. **A3 导航与操作**：Tabs（内容 / 指示器）、Accordion、Menu / SubMenu、Breadcrumb、Stepper、Toolbar、Button / ButtonGroup / SplitButton。
4. **A4 表单输入**：Input / InputNumber / Textarea 共享层 token 化与 reduce 由 A1 统一；InputGroup / CheckboxGroup / Form / Slider 补状态动效；既有控件统一 token；TagsInput reduced-motion。
5. **A5 基础与布局**：Avatar / Tag / Divider / Row / Col 补齐；Card / Image / Badge 统一 token（Button / ButtonGroup / SplitButton 归 A3）。
6. **A6 选择器**：ColorPicker / Calendar 补齐；AutoComplete / DatePicker / MultiSelect / SelectButton / ToggleButton 统一 token；Select 共享层归 A1 / A4（本批只补面板状态）；MultiSelect reduced-motion。
7. **A7 数据展示**：DataTable（行 / 展开 / 排序 / 选择）、DataView、Paginator / Progress / Skeleton 统一；避免整表重排动画。
8. **A8 验收**：动效测试装置、性能与无障碍审计、人工复核记录、主题文档与示例。

> 顺序理由：浮层与反馈是状态切换最密集、退场最容易被忽略的区域；导航与表单次之；选择器 / 数据展示的动画收益低、性能风险高，放在后面。

## 6. 测试策略

### 6.1 分层

| 层 | 工具 | 能验证 | 不能验证 |
| --- | --- | --- | --- |
| L1 源码 / CSS 契约 | Node 守卫（`check-motion-contract`） | 过渡 / 一次性动画走 token、无**未登记**裸时长、reduced-motion 覆盖、禁 `transition: all`、非必要动画只用合成层属性 | 实际渲染 |
| L2 组件行为 | Vitest + `@vue/test-utils` | `data-motion` / 状态类 / ARIA / 事件时序（jsdom 无动画时间轴） | 真实动画过程 |
| L3 浏览器集成 | Playwright + Chromium | `getAnimations()` 时间轴、计算样式、终态、reduced-motion、退场存在性 | 主观流畅度 |
| L4 人工复核 | 录屏 / Trace / 慢放 | 节奏、意图、打断、暗色 / 多视口观感 | 可自动化断言 |

### 6.2 确定性时间轴采样（L3 核心）

- **读取动画**：状态更新后用有界 `waitForFunction(() => el.getAnimations().length > 0)` 等待动画出现（异步 handler / Reka Presence 可能晚于 1 个 `requestAnimationFrame`）；取 `el.getAnimations({ subtree: true })` 或分别收集面板根与后代，读取 `animationName` / `transitionProperty`、`effect.getTiming()`（duration / easing / delay）。
- **暂停 + 采样**：`animations.forEach(a => a.pause())`，把 `currentTime` 设为 `0` / `duration/2` / `duration - 1`（或最后一个 keyframe offset），读取 `getComputedStyle` 的 `opacity` / `transform` / `height`；`fill: none` 的动画在 `duration` 处进入 after 相位，不能直接取终态。避免 `sleep` 造成的 flaky。
- **触发后立即暂停**：在 `page.evaluate(async () => { el.click(); await new Promise(r => requestAnimationFrame(r)); const animations = el.getAnimations(); animations.forEach(a => a.pause()); return ... })` 中取到动画后立刻 `pause()`，再设 `currentTime`，避免 Playwright 点击等待跨帧后动画已结束。
- **退场**：在点击前注入 `animationstart` / `transitionrun` 监听，关闭后断言事件发生、终态到达、元素移除时机；若元素在事件前被卸载，监听会漏，须先断言 `data-state` / `forceMount` / DOM 保留，再在移除前取动画。
- **reduced-motion**：`page.emulateMedia({ reducedMotion: 'reduce' })`，断言**无位移 / 缩放动画**（`transform` 不参与），允许不透明度淡入且时长 ≤ `--caomei-motion-duration-instant`；一次性动画的终态与 `no-preference` 逐值一致；spinner / skeleton / progress 等无限循环没有终态，改比几何 / 首帧或排除。
- **轴切换**：`document.documentElement.dataset.motion = 'expressive'` 后读取 `getComputedStyle` 的 token 值与动画时长，断言与 `minimal` 不同且符合预期。
- **作用域**：验证 `<html>` 与局部容器两种挂载；Portal 面板按文档口径仅承诺根节点生效。

### 6.3 测试矩阵

| 批次 | 单元 / 契约 | E2E | 人工 |
| --- | --- | --- | --- |
| A1 | token 名 / 默认值 / 轴选择器 / 无裸时长 / reduced-motion 覆盖 | `data-motion` 切换、默认等价、OS reduce | 轴切换演示 |
| A2 | 退场状态类 | 每个浮层的 enter / exit 时间轴、焦点回归、Toast reduced-motion | 退场节奏、暗色 |
| A3 | 状态类 | Tabs 指示器 / 内容、Accordion 高度、Menu 展开、Button 状态 | 连续切换打断 |
| A4 | 状态类 | 聚焦 / invalid / 步进 / 勾选 / 滑块 | 表单密集操作 |
| A5 | 状态类 | 卡片 hover、图片加载、Tag 增删 | 列表增删 |
| A6 | 状态类 | 选择器面板、选中态、清空 | 选择器组合 |
| A7 | 状态类 | 行展开 / 排序 / 分页 / 选择 | 大数据量性能 |
| A8 | 守卫接入、文档 | 全量动效回归 | 录屏复核签字 |

### 6.4 性能与无障碍

- **性能**：对代表性浮层 / 展开动画记录 `PerformanceObserver` 的 `longtask` 与 `requestAnimationFrame` 帧间隔；CI 只做宽松冒烟（50ms longtask 仅告警、不阻断），主观流畅度交人工。避免在 CI 断言精确 FPS。
- **无障碍**：`expressive` 仍须通过 `prefers-reduced-motion`；不做 >3 次/秒闪烁；不用动画延迟焦点可见；自动播放类只保留加载指示。
- **视觉基线**：截图只验证终态；截图前设置 `animations: 'disabled'` 或注入 `transition: none !important`，避免把中间帧写入基线。

### 6.5 人工复核清单（建议）

- 1x 与 0.25x 各看一遍；确认动画表达「发生了什么」而非装饰。
- 连续快速触发 / 反向切换 / 中途取消；确认无排队、无卡死、无终态错位。
- 亮 / 暗 × 320 / 390 / 768 / 1280；确认无横向溢出、无 CLS、无文字模糊。
- `prefers-reduced-motion: reduce` 下确认无位移 / 缩放，加载仍可感知；确认无 >3 次/秒闪烁、焦点可见不被动画延迟。
- 记录录屏 / Trace 路径、视口、浏览器版本、结论与遗留项，签入治理记录。

## 7. 风险与边界

| 风险 | 说明 | 处置 |
| --- | --- | --- |
| 退场与卸载 | Dialog 当前明确无退场动画；加退场需 Presence 保留 DOM，可能改变 `open=false` 时的 DOM 时序 | A2 先做技术验证与契约记录；不改变「`open` 由真转假」的语义 |
| 高度 / 宽度动画 | Accordion / ProgressBar 触发布局；大数据量下可能掉帧 | 逐项评估；必要时改 `grid-template-rows` / `transform`，但须证明终态与几何不变 |
| Portal 不继承 | `data-motion` 挂在局部容器时，挂到 `body` 的面板不生效 | 文档声明；测试覆盖根节点与局部容器两种路径 |
| token 冻结面 | 新增 `--caomei-motion-*` 进入公开冻结面 | A1 同步 `version-policy` / 冻结清单 / token 计数；默认值逐项等价 |
| 动画影响测量 | 计算样式 / 截图 / axe 可能采到中间态 | 沿用测试规范：测量期禁用动画；E2E 用 `currentTime` 而非等待 |
| 过度动效 | 全组件动效可能拖慢高频操作 | 状态驱动 + 短时长 + 合成层优先；`expressive` 也保持克制 |
| 测试 flaky | 时间轴 / 帧率断言易受 CI 负载影响 | 用暂停 + `currentTime`；性能只做宽松冒烟；主观项人工 |
| 文档站副本 | scoped keyframes 名被重写，示例副本需登记 | 新增示例动画同步 `check:demo-keyframes` 的 `KEYFRAME_MAP` |
| 范围蔓延 | 58 个组件目录 / 56 个组件页，不可能一次覆盖 | 按 A2 ~ A7 分批；`multiple` 类未实现能力不强行加动画 |

**非目标**：不做路由 / 页面级转场（组件库不控制路由）；不做视差 / 滚动驱动叙事；不引入 GSAP / motion-v 等运行时；不改变 `minimal` 缺省外观；不把动效作为可访问性的替代；不覆盖未实现能力。

## 8. 候选拆分与 Backlog 映射

> 本节是候选的唯一权威映射；Backlog §1.10 只保留候选行，不重复评估事实。

| 候选 | 范围 | 依赖 | 优先级 | 验收要点 |
| --- | --- | --- | :-: | --- |
| **A1** 动效基础层与 `data-motion` 轴 | motion tokens、`minimal` 等价映射、`expressive` 覆盖、reduced-motion 全局兜底（含 `field-shell.css`）、`check-motion-contract` 守卫（含加载动画白名单）、测试 helper、`docs/design/theming.md` 新增 §5.3 | 无 | 中 | 默认零差异（computed transition / animation 逐选择器 diff）；轴切换生效；4 个缺失 reduced-motion 来源补齐；守卫接入 `governance:check` |
| **A2** 反馈与浮层动效 | Dialog / ConfirmDialog 进出场、Drawer 收口、Popover / DropdownMenu / Tooltip / Toast / Message / Alert（DropdownMenu 浮层唯一归本批） | A1 | 中 | enter / exit 时间轴、焦点回归、Toast reduced-motion、Presence 行为记录 |
| **A3** 导航与操作动效 | Tabs / Accordion / Menu / Breadcrumb / Stepper / Toolbar / Button / ButtonGroup / SplitButton（DropdownMenu 已归 A2；Button 交互态唯一归本批） | A1 | 中 | 指示器 / 内容切换、展开收起、连续切换可打断 |
| **A4** 表单输入动效 | Input / InputNumber / Textarea 共享层 token 化与 reduce（A1 统一）；InputGroup / CheckboxGroup / Form / Slider 补状态动效；既有控件统一 | A1 | 低 | 聚焦 / invalid / 步进 / 勾选；TagsInput reduced-motion |
| **A5** 基础与布局动效 | Avatar / Tag / Divider / Row / Col 补齐 + Card / Image / Badge 统一（Button / ButtonGroup / SplitButton 归 A3，不在本批重复） | A1 | 低 | 增删 / hover / 加载；不做常驻装饰 |
| **A6** 选择器动效 | ColorPicker / Calendar 补齐 + AutoComplete / DatePicker / MultiSelect / SelectButton / ToggleButton 统一；Select 共享层由 A1 / A4 统一（本批只补面板状态） | A1 | 低 | 面板 / 选中 / 清空；MultiSelect reduced-motion |
| **A7** 数据展示动效 | DataTable 行 / 展开 / 排序 / 选择、DataView 切换、Paginator / Progress / Skeleton 统一；Chart / RichTextEditor 仅容器层加载 / 空态，内部编辑动画不纳入 | A1 | 低 | 行重排成本、批量选择、分页；避免布局抖动 |
| **A8** 动效验收与人工复核 | E2E 动效矩阵、性能 / a11y 审计、人工复核清单与记录、主题文档 / 示例 | A1 ~ A7 | 中 | `getAnimations` 采样、reduce 双向、录屏复核签字 |

- **候选覆盖声明**：A1 ~ A8 共 **8** 项；56 个组件页按交互族映射、侧栏分类仅用于盘点（反馈与浮层 8 / 导航与操作 7 / 表单输入 14 / 基础与布局 11 / 选择器 8 / 数据展示 6 / 高级组件 2），**逐条均有落点，无静默豁免**；Chart / RichTextEditor 只做容器层状态，内部内核动画为显式非目标；`ConfigProvider` 无自有视觉、不进候选；未实现能力（`DatePicker.multiple`、`Paginator` 模板等）不因动效需求新增。
- **候选池计数**：37 → **45**（新增 §1.10 八行，无移出）。

## 9. 待用户裁定

| 编号 | 问题 | 推荐 |
| --- | --- | --- |
| D1 | 动效形态：正交轴 `data-motion` vs 单值 `data-preset="expressive"` | **B 正交轴**；若需单值入口，另加便捷别名，不做主路径 |
| D2 | 首批范围：只做 A1 + A2，还是 A1 + A2 + A3 | **A1 + A2 先交付**，验证退场 / 测试装置后再排 A3 |
| D3 | 动效强度：克制（短时长、仅状态反馈） vs 明显（更长的位移 / 缩放） | **克制**；`expressive` 也不做弹跳 / 长时间循环 |
| D4 | 是否允许引入动效库 | **不引入**；确需复杂序列时另立条件候选 |

## 10. Review Gate

- **audit-depth**：`standard`（评估记录 + Backlog 拆分 + 现状计数；零代码改动）。时间盒 ≤ 8 分钟。
- **R1（`standard`）**：`Reject`（2 blocker / 7 warning / 4 suggest）。**已修**：B1 共享样式层漏扫——`field-shell.css` 已纳入扫描，Input / InputNumber / Select / Textarea 计入已有动效，现为 34 动效 / 22 无动效、4 个动效来源缺 reduced-motion，并登记 `--caomei-field-transition` / `--caomei-float-label-transition-duration`；B2 高级组件行——补 Chart / RichTextEditor，56 = 54 + 2，A7 仅覆盖容器层状态。W1 时长直方图统一口径（含 `var()` 回退与共享层，补 1.6 / 2.4s）；W2 token 粒度补 100 / 180 / 300ms，并把 A1 验收改为 computed transition / animation 逐选择器 diff；W3 时间轴改用有界 `waitForFunction`、`subtree`、退场 DOM 保留与无限循环例外；W4 索引摘要去读数、标注同批回填；W5 修复后先暂存再复跑受检面；W6 明确 DropdownMenu 归 A2、Button / ButtonGroup / SplitButton 归 A3、A5 不重复；W7 校正 `theming.md` 指针与 §5.3 新增标记。S1 ~ S4 一并采纳（SSR、命名备选、longtask 告警口径、Backlog 待审措辞）。
- **R2（`quick` delta）**：`Pass`（0 blocker / 5 warning / 2 suggest）。B1 / B2 / W2 / W4 / W5 / W7 关闭；5 条 warning 已同批修复：§5.2 与 §8 成员口径对齐（A4 / A5 / A6）、直方图补 `150ms` 并标注范围、`--caomei-drawer-duration` 文档状态订正、reduce 断言改为「无位移 / 缩放 + 允许极短淡入」、`currentTime` 改用 `duration - 1`；S1 / S2 采纳（documented §5.3 点名文件）。**R3（`quick` delta）**：`Pass`（0 blocker / 0 warning / 2 suggest）；5 条 warning 全部关闭，2 条 suggest 已采纳（`--caomei-drawer-duration` 改为「可覆盖但无公开契约」、Backlog 状态改为「已通过 Review Gate」）。
- **实测用时**：R1 起于 `2026-11-08T03:40:33+08:00`，因环境挂起未能精确测量返回时点，按调度成本记「超 ≤8 分钟时间盒」；R2 起于约 `10:15`，返回约 `10:24`（≈9 分钟，含调度等待，超 ≤5 分钟时间盒）；R3 起于约 `10:25`，返回约 `10:28`（≈3 分钟，≤3 分钟时间盒）。
