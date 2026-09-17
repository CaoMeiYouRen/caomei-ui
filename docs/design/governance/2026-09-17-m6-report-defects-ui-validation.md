# M6-1 / M6-3 InputGroup × `Select` 拼接修复 + M6-2 图标页 live demo 浏览器验证

- 日期：2026-09-17
- 范围：工作区未提交 diff 的 M6 批次——M6-1 / M6-3「InputGroup × `Select`」圆角与宽度修复，M6-2 图标页中英 live demo 补全
- 类型：纯 CSS 级联修复（组件样式）+ 文档示例补全，本文件为 Phase 7 第二阶段 M6 批次的 V 阶段验证记录
- 依据：[测试规范 §2.1 / §5 / §5.1](../../standards/testing.md)、[响应式设计 §3 / §4](../../design/responsive.md)、[主题与样式设计](../../design/theming.md)、UI 验证 skill（`.github/skills/ui-validator/SKILL.md`）
- 被测对象：`src/components/input-group/input-group.vue`（宽度选择器由 `.caomei-select` 改为 `.caomei-select__field`；新增 `.caomei-select__field > .caomei-select` 圆角继承规则）、`docs/components/icons.md`、`docs/components/input-group.md`、`docs/i18n/en-US/components/icons.md`、`docs/i18n/en-US/components/input-group.md`、`docs/examples/icons/**`（4 个示例文件）、`docs/i18n/en-US/examples/icons/**`（4 个示例文件）

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | HEAD `caa2338`（已提交）+ 工作区未提交 diff（`input-group.vue` + 4 个文档页 + 8 个示例文件；`docs/plan/todo.md` 的状态登记也在此 diff 内）。验证窗口内 `src/` 与示例文件未改动 |
| 入口 / 产物 | VitePress dev `http://127.0.0.1:5173`（`pnpm docs:dev`，监听 PID 1718824）；dev 直读工作区 `src/` 与 `docs/`，HMR 已含本批改动 |
| 页面 | `/components/input-group`（A / B / D / F）、`/components/select`（A4）、`/components/icons` 与 `/en-US/components/icons`（C / D / E） |
| 视口 | 桌面 1440×900、平板 1024×768、移动 375×812（D）；浮层稳定性 F 用 1440×900 |
| 主题 | 亮色 / 暗色，`emulateMedia` 的 `colorScheme` 参数 + `html.dark` + localStorage `vitepress-theme-appearance` 三处对齐 |
| 浏览器 | Chromium 153.0.8010.12（Playwright 1.63 内置），容器内 `--no-sandbox --disable-dev-shm-usage`；`ignoreDefaultArgs: ['--hide-scrollbars']` 暴露真实滚动条（1440 下实测 15px） |
| 取证脚本 | `test-results/m6-validate.mjs`（已 gitignore）；原始 JSON 与截图落 `test-results/m6/`；本记录承载结论与关键实测值 |

- 结论：**通过**——**68 / 68 核对项通过，失败 0**；console error / pageerror / HTTP ≥ 400 均为 **0**；观察项 4（均不计为问题）。
- 说明：本批为 CSS 级联修复，happy-dom / jsdom 不计算 scoped CSS，验收由本记录的计算样式实测承担（[测试规范 §2.1](../../standards/testing.md)）。

## 1. M6-1 圆角矩阵

### 1.1 既有 demo「与选择器组合」（A1）

页面 `/components/input-group` 第 2 个 demo（`.vitepress-demo-plugin__container` 索引 1，DOM 顺序：`Select` + `Button`）。

| 核对项 | 期望 | 实测（计算样式 `border-*-radius`，TL / TR / BR / BL） | 判定 |
| --- | --- | --- | --- |
| 成员根元素 `.caomei-select__field` | `8px 0px 0px 8px` | `8px 0px 0px 8px` | 通过 |
| 内层触发器 `.caomei-select` | 与根元素逐角一致 | `8px 0px 0px 8px` | 通过 |
| 连接侧（右）圆角 | `0px` | `0px` / `0px` | 通过 |
| 末成员 `Button` | `0px 8px 8px 0px` | `0px 8px 8px 0px` | 通过 |

### 1.2 位次 / 纵向合成夹具（A2）

**取证方式**：修复对象是纯 CSS 级联，选择器不依赖 Vue 实例。故在页面内用 `cloneNode(true)` 克隆既有组合（克隆保留 Vue scoped 属性 `data-v-*`），拼装到追加于 `body` 的 646px 宽夹具宿主后读取 `getComputedStyle`。合成夹具四组：横向末成员 `Select`、三成员中间成员 `Select`、纵向首成员 `Select`、覆盖态。原始值见 `test-results/m6/input-group-synth.json`。

| 合成场景 | 成员根元素 | 内层 `.caomei-select` | 判定 |
| --- | --- | --- | --- |
| 横向末成员 `Select`（`[Button, Select]`） | `0px 8px 8px 0px` | `0px 8px 8px 0px` | 通过（逐角一致） |
| 三成员中间 `Select`（`[Input, Select, Button]`） | `0px 0px 0px 0px` | `0px 0px 0px 0px` | 通过（逐角一致） |
| 纵向首成员 `Select`（`[Select, Button]`，`orientation="vertical"`） | `8px 8px 0px 0px` | `8px 8px 0px 0px` | 通过（逐角一致） |

### 1.3 `--caomei-input-group-radius` 覆盖态（A3）

在克隆组合上内联声明 `--caomei-input-group-radius: 4px`：

| 元素 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 成员根元素 `.caomei-select__field` | `4px 0px 0px 4px` | `4px 0px 0px 4px` | 通过 |
| 内层触发器 `.caomei-select` | `4px 0px 0px 4px` | `4px 0px 0px 4px` | 通过 |

即覆盖变量同时作用于成员根元素与内层触发器，连接侧仍为 `0px`。

### 1.4 未组合的独立 `Select`（A4）

页面 `/components/select`，取不在任何 `.caomei-input-group` 内的 `.caomei-select`：

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 内层触发器四角 | `8px 8px 8px 8px`（= `--caomei-radius-md`，也等于页面 `--caomei-radius-md` 实测 `8px`） | `8px 8px 8px 8px` | 通过 |
| 字段包装层 `max-width` | 默认 `--caomei-select-max-width` = `20rem` = `320px`（组外未被本批选择器波及） | `320px` | 通过 |

### 1.5 连接侧视觉与聚焦抬升（A5）

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 相邻成员边框重叠量（内层触发器 `right` − `Button` `left`） | `1px` | `1.00px` | 通过 |
| 相邻边框宽度（触发器左右 `border-width`） | `1px` / `1px`，不出现 2px 双线 | `1px` / `1px` | 通过 |
| 聚焦 `Select` 后成员根元素抬升 | `z-index` 由 `auto` 变为 `1`、`position: relative` | 聚焦前 `relative` / `auto` → 聚焦后 `relative` / `1`，`:focus-within` 匹配为 `true` | 通过 |

> 聚焦前 `position` 已是 `relative`（`.caomei-select__field` 自身声明），故抬升的可见变化是 `z-index` 由 `auto` 到 `1`，而非 `position` 变化。

## 2. M6-3 成员宽度（B）

页面 `/components/input-group` 第 2 个 demo（`Select` + `Button`），视口 1440×900、真实滚动条 15px。

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 组内 `Select` 成员 `flex` | `1 1 auto` | `1 1 auto` | 通过 |
| 组内 `Select` 成员 `max-width` | `none` | `none` | 通过 |
| 组内 `Select` 成员宽度 | `593px` | `593px` | 通过 |
| 触发器铺满包装层（内层 `right` = 成员 `right`） | 相等 | `990.5` = `990.5` | 通过 |
| 组合铺满（末成员 `right` = 组 `right`，无剩余空隙） | 相等 | `1043.5` = `1043.5` | 通过 |
| 横向组宽 | `646px` | `646px` | 通过 |
| 同组 `Input`（demo 1 对照） | 满宽：`605px` / `1 1 auto` / `none` | `605px` / `1 1 auto` / `none` | 通过 |
| 纵向组合（demo 3） | 成员 `646px` / `646px`；圆角 `8px 8px 0px 0px` / `0px 0px 8px 8px` | 同左 | 通过 |

**关于已知事实里的 `1051`**：该值是在 Playwright 默认 `--hide-scrollbars`（无滚动条，内容区更宽）下测得；本轮为浮层稳定性断言显式启用了真实滚动条（1440 下 15px），故组合整体左移，组 `right` 与末成员 `right` 同为 `1043.5`。**组宽 `646` 与 `Select` 成员宽 `593` 两种口径下完全一致**，差异仅为视口内容区偏移，非布局回归。

## 3. M6-2 图标页 live demo（C）

| 核对项 | 中文页期望 | 中文页实测 | 英文页实测 | 判定 |
| --- | --- | --- | --- | --- |
| `<demo>` 容器数 | 4 | 4 | 4 | 通过 |
| 预览区 SVG 数（基础用法 / 尺寸 / 图标一览 / 在组件中传入图标） | `7 / 7 / 24 / 4` | `7 / 7 / 24 / 4` | `7 / 7 / 24 / 4` | 通过 |
| 每段 demo 预览区可见（bounding rect 非 0×0） | true × 4 | true × 4 | true × 4 | 通过 |
| 非纯代码块（每段 demo 均有预览区） | 4 | 4 | 4 | 通过 |
| 预览区 `CaomeiIcon` 渲染的 `<svg>` `aria-hidden` | 均为 `true` | 均为 `true` | 均为 `true` | 通过 |

- `docs:dev` 渲染计数与 `todo.md` 登记的「两语言各 4 个 demo、SVG 数 7 / 7 / 24 / 4、console error 0」逐项一致。
- 文本层交叉核对（本地 OCR，`test-results/m6/icons-gallery-mobile-dark.png`）：图标一览 24 项的图标名与中文标签全部识别到（首项 `Check`、末项 `ChevronsLeft`，中间 22 项同样命中），未见截断。

## 4. 响应式与主题（D）

### 4.1 图标一览网格（`repeat(auto-fill, minmax(112px, 1fr))`）

| 视口 | 网格 `scrollWidth` / `clientWidth` | 页面 `scrollWidth` / `clientWidth` | 网格列数 / 单列宽 | 成员落在容器内 | 单项可读（无内部溢出且宽 ≥ 112px） |
| --- | --- | --- | --- | --- | --- |
| 桌面 1440 | 646 / 646 | 1425 / 1425 | 5 列 / 123px | true | 24 / 24 |
| 平板 1024 | 567 / 567 | 1009 / 1009 | 4 列 / 136px | true | 24 / 24 |
| 移动 375 | 270 / 270 | 360 / 360 | 2 列 / 131px | true | 24 / 24 |

三档均满足 `scrollWidth <= clientWidth + 1`，无横向溢出。

### 4.2 input-group `Select` + `Button` 三档视口

| 视口 | 组 `scrollWidth` / `clientWidth` | 页面 `scrollWidth` / `clientWidth` | 成员根元素 = 内层圆角 | 末成员 `right` = 组 `right` |
| --- | --- | --- | --- | --- |
| 桌面 1440 | 646 / 646 | 1425 / 1425 | `8px 0px 0px 8px` = `8px 0px 0px 8px` | 1043.5 = 1043.5 |
| 平板 1024 | 567 / 567 | 1009 / 1009 | 同上 | 924 = 924 |
| 移动 375 | 270 / 270 | 360 / 360 | 同上 | 315 = 315 |

### 4.3 亮 / 暗主题

| 状态 | `html.dark` / `localStorage` | `body` 背景实测 | `--caomei-radius-md` | 成员根元素 = 内层圆角 |
| --- | --- | --- | --- | --- |
| 亮色 | `false` / `light` | `rgb(255, 255, 255)` | `8px` | `8px 0px 0px 8px` 两侧一致 |
| 暗色 | `true` / `dark` | `rgb(27, 27, 31)` | `8px` | `8px 0px 0px 8px` 两侧一致 |

两处外观开关（`emulateMedia` 与站点 `html.dark` / localStorage）已对齐，未出现混合态；拼接圆角在暗色下不变。

## 5. 可访问性抽检（E）

- 图标一览 / 基础用法 / 尺寸 / 在组件中传入图标四段 demo 的预览区 `<svg>` 均为 `aria-hidden="true"`（`@lucide/vue` 1.45 默认行为），读屏会忽略装饰性图标，与设计一致。
- `/components/icons` 第 4 段 demo 的按钮实测 3 个：`72×36`、`72×36`、`40×36`；宽度最小的为仅图标按钮，其 `aria-label` 为 `更多操作`（来自 `Button` 的 `label`），可访问名非空。带可见文本的两个按钮（`新建` / `搜索`）可访问名来自文本。
- 抽检范围仅限图标 demo 与图标 SVG，不扩面到全站。

## 6. 宿主页面稳定性（F，Select 面板）

Select 面板由 `SelectPortal` 挂到 `body`。打开前后的测量集（视口 1440×900，真实滚动条 15px）：

| 阶段 | `window.innerWidth` | `documentElement.clientWidth` | 实测滚动条 | 组 `x` / `y` | `body` padding-right |
| --- | --- | --- | --- | --- | --- |
| 打开前 | 1440 | 1425 | 15 | 397.5 / 700 | `0px` |
| 打开后 | 1440 | 1425 | 15 | 397.5 / 700 | `0px` |
| 关闭后 | 1440 | 1425 | 15 | 397.5 / 700 | `0px` |

| 核对项 | 期望 | 实测 | 判定 |
| --- | --- | --- | --- |
| 面板打开（`role="listbox"`） | true | true（面板 rect `x=398, y=740, w=593, h=106`，落在视口内） | 通过 |
| `in-flow` 组几何不位移（dx + dy） | 0 | 0.00 | 通过 |
| 滚动条占位变化在容差内 | ≤ 15px | `clientWidth` `1425 → 1425`（无变化） | 通过 |
| 关闭后滚动条 / `clientWidth` 恢复 | `15 / 1425` | `15 / 1425` | 通过 |
| 无非预期 CLS（`layout-shift` 总位移） | < 0.01 | 0.00000（无 `layout-shift` 条目） | 通过 |
| Esc 关闭面板 | 面板数为 0 | 0 | 通过 |

- **遮罩**：该面板在 `body` 下无独立且不透明的全视口遮罩元素（Reka `Select` 为无遮罩的 portal 浮层），故「遮罩完整覆盖」判据对本组件 N/A；稳定性以「`in-flow` 不位移 + 滚动条容差 + CLS」三项判定，三项均通过。
- 面板宽度 593px 与触发器宽度一致，未出现「面板窄于触发器」的回归。

## 观察项（OBSERVE，不计为问题）

1. **移动 375 下图标一览为 2 列而非 1 列**：预览区可用宽 270px，`minmax(112px, 1fr)` 恰好容纳 2 列（131px / 列）。属网格声明的预期行为，单项文本可读、无溢出。归因：本次变更（`gallery.vue` 网格定义）。
2. **Select 面板无独立遮罩**：Reka `Select` 设计上不渲染全屏遮罩（区别于 Dialog / Drawer）。归因：上游组件行为，非本批引入；F 已改用 `in-flow` / 滚动条 / CLS 判定。
3. **已知事实的 `1051` 与实测 `1043.5` 差异**：来自 Playwright 默认隐藏滚动条与本轮真实滚动条的口径差（15px），组宽与成员宽不受影响。归因：取证环境差异，已在本记录 §2 说明。
4. **聚焦前成员根元素 `position` 已是 `relative`**：抬升的实际变化是 `z-index`；断言已改为对 `auto → 1` 的数值敏感判定。归因：成员自身样式声明。

## 未覆盖边界

- **视觉美观度未做逐像素比对**：视觉通道（vision-augment 远程通道）本轮返回 400，判定为不可用；故「布局美观度未经视觉确认，仅几何 / 计算样式 / aria 属性断言成立」。截图已落盘供人工复核：`test-results/m6/input-group-select-light.png`、`input-group-select-focus-light.png`、`input-group-select-dark.png`、`select-panel-open-light.png`、`icons-zh-desktop-light.png`、`icons-en-desktop.png`、`icons-gallery-light.png`、`icons-gallery-mobile-dark.png`（均在被忽略的 `test-results/` 下）。
- **未验证构建产物 / SSG 静态 HTML**：本轮为 dev（SPA 外壳 + 浏览器内渲染）。`todo.md` 的 M6-2 验收含 `docs:build` 与产物 DOM，不在本 V 记录范围。
- **未覆盖其余成员组合的全排列**：宽度 / 圆角的横向组合只核验了 `Select` 首 / 末、三成员中间、纵向首，以及既有 demo 的 `Input` 对照；`MultiSelect` / `InputNumber` / `Textarea` 与 `Select` 的混排未逐一取数。
- **未覆盖 RTL / 高对比模式 / 缩小字号**：与本批选择器无关，未扩面。
- **浮层稳定性仅在桌面 1440 测一次**：未在 375 / 1024 重复面板稳定性测量。

## 复现方式

```bash
# 前置：pnpm docs:dev（127.0.0.1:5173）
node test-results/m6-validate.mjs   # 68 项：A/B/C/D/E/F 全量断言，输出 test-results/m6/summary.json
node test-results/m6-capture.mjs    # 截图取证，输出 test-results/m6/*.png
```

- 脚本与原始 JSON / 截图位于 `test-results/`（已 gitignore，为任务态产物）；**关键实测值以本记录为准**。
- 判定：结论 **通过**（68 / 68，失败 0；console error / pageerror / HTTP ≥ 400 均为 0）。
