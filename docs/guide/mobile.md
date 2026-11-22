# 移动端与响应式

> 面向使用方：在窄屏与触摸设备上使用 caomei-ui 的做法与自测清单。**库内规则**（断点语义、窄屏行为矩阵、验收标准）以[响应式设计](../design/responsive.md) 为单一事实源，本页只给使用方视角的要点，不重述其条款。

## 断点语义

库内采用**桌面优先**：默认形态即桌面形态，窄屏用 `@media (width <= <断点>)` 收敛。

| 档 | 字面量 | 语义 | 典型设备 |
| :--- | :--- | :--- | :--- |
| sm | `640px` | 手机 | 320 ~ 640px 视口 |
| md | `768px` | 平板窄侧（该档在手机宽度同样命中） | 641 ~ 768px |
| lg | 不写媒体查询 | 桌面（默认形态） | ≥1024px |

> 上表为**摘要**（「典型设备」列为示意区间）；档位定义的权威口径见[响应式设计 §2](../design/responsive.md)。

- **769 ~ 1023px 为「无档区间」**：除已登记例外（`CaomeiButtonGroup` / `CaomeiSplitButton` 收敛到 `1024px`）外，组件在该区间**维持桌面形态**；页面级形态（是否改列数、是否显示侧栏）由你的布局决定。
- 库内**没有通用 `breakpoint` props**，也不监听视口宽度；窄屏行为由组件自身在容器放不下时收敛（宽度内收 / 换行 / 组内滚动 / 截断）。
- **栅格**：`CaomeiRow` / `CaomeiCol` 提供断点 `span` / `offset` / `order`（`sm` / `md` / `lg`，窄档覆盖宽档），断点取值由你在模板中声明。**注意方向不同**：props 的 `lg` 指「≤1024px 的**覆盖**档」，与上表 `lg`「≥1024px 的**默认形态**」绑同一数值、方向相反（口径见[响应式设计 §2](../design/responsive.md)）。
- **`CaomeiDialog` 的 `breakpoints`**：按你传入的视口上限生成媒体查询（命中多个时取最窄档），用于把对话框宽度对齐旧项目习惯。

## 使用方职责（库不代劳）

- **页面级分栏与显隐**：栅格原语之外的布局决策属页面职责。
- **文本类控件的宽度上限**：库内默认不设上限，宽度由你的容器控制。
- **表格列取舍与卡片化**：`CaomeiDataTable` 在窄屏以**容器横向滚动**降级；转卡片列表由你的业务实现。
- **对话框全屏化**：窄屏默认内收宽度，全屏形态按需自行实现。
- **步骤条方向**：`CaomeiStepper` 横向形态在窄屏随容器压缩，需要纵向时请改 `orientation="vertical"`。
- **超长文案**：单条超长选项可能自身超宽（例如极窄视口下的长枚举），请在文案长度或容器宽度上约束。

## 安全区（刘海与 home indicator）

全屏页面需要给刘海、圆角与底部 home indicator 留出空间。库内提供四个安全区 token，默认取 `env()`，并在桌面或页面未声明 `viewport-fit=cover` 时回落 `0px`：

| token | 默认值 | 含义 |
| --- | --- | --- |
| `--caomei-safe-area-top` | `env(safe-area-inset-top, 0px)` | 顶部（刘海 / 状态栏） |
| `--caomei-safe-area-right` | `env(safe-area-inset-right, 0px)` | 右侧（横屏圆角） |
| `--caomei-safe-area-bottom` | `env(safe-area-inset-bottom, 0px)` | 底部（home indicator） |
| `--caomei-safe-area-left` | `env(safe-area-inset-left, 0px)` | 左侧（横屏圆角） |

> `env()` 只在页面声明 `viewport-fit=cover` 时取到非零值，例如 `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`；未声明时四个 token 均为 `0px`，沿用默认布局即可。

对应的六个工具类把 token 写成同侧 `padding`：

| 工具类 | 写入的属性 |
| --- | --- |
| `.caomei-safe-area-top` / `-right` / `-bottom` / `-left` | 对应单侧 `padding` |
| `.caomei-safe-area-x` | `padding-right` + `padding-left` |
| `.caomei-safe-area-y` | `padding-top` + `padding-bottom` |

<demo
    vue="../examples/mobile/safe-area.vue"
    ssg="true"
/>

- 工具类**设置**该侧 `padding`：应用后该侧内边距就是 token 值，**宿主原本的内边距不会保留**（桌面 token 为 `0px`，等于把该侧内边距清零）。需要保留原值时用 `calc()` 自行组合，例如 `padding-bottom: calc(var(--caomei-space-3) + var(--caomei-safe-area-bottom))`。
- 六个工具类都是单类选择器，而基础层先于组件 / 业务样式加载；同特异性下后声明者胜出，宿主里的 `padding` 可能反过来盖掉工具类。需要确定性覆盖时提高选择器特异性，或直接在自己的规则里用 `calc()` 组合 token。
- 需要额外余量（例如再留 8px）时，在任意祖先覆盖 token 即可，CSS 继承会带到整个子树：`--caomei-safe-area-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px)`。
- 固定定位件已内置消费，无需再套工具类：Drawer 按开合方向把 token 叠在贴边侧的内边距上（底部抽屉即 `--caomei-space-4` + 底部安全区，左右向抽屉另补上下两端），Toast 把顶部 / 底部停靠偏移叠加同侧 token，BackTop 在右下偏移上叠加，Image preview 按四周安全区收缩可用边界。Drawer 上下向高度、Dialog / ConfirmDialog 的高度上限、Toast 视口上限与图片预览尺寸改用 `dvh`（保留 `vh` 回退），地址栏收起 / 展开时仍按可见视口计算。
- 演示把 token 覆盖为 `34px` / `16px` 以便观察；桌面与未声明 `viewport-fit=cover` 的环境下 token 为 `0px`，因此**仅引入基础层、不使用工具类时**桌面计算样式零差异。

## 触摸密度轴与尺寸覆盖

`1.1.0` 起提供**独立于预设与明暗**的触摸密度轴：在任意祖先元素上加 `data-density="touch"`，该子树内的控件高度、字号与内容型宽度上限按触摸档渲染；未设置时逐值等同桌面。

<demo
    vue="../examples/mobile/density.vue"
    ssg="true"
/>

| token | 默认 | `data-density="touch"` |
| --- | --- | --- |
| `--caomei-control-height-sm` / `md` / `lg` | 28 / 36 / 44px | 36 / 44 / 52px |
| `--caomei-font-size-sm` / `md` / `lg` | 12 / 14 / 16px | 14 / 16 / 18px |
| `--caomei-input-number-max-width` / `--caomei-select-max-width` | 12rem / 20rem | `none` |

- **不随视口自动切换**：需要「窄屏才放大」时，把属性加在媒体查询内的容器上（或直接用下面的 token 覆盖）。
- **与 `data-preset` / `data-theme` / `.dark` 正交**：只改尺寸，不改任何颜色。
- **浮层面板不穿透**：`CaomeiSelect` / `CaomeiMultiSelect` / `CaomeiAutoComplete` / `CaomeiDatePicker` 的面板经 Portal 挂到 `body`。属性挂在 `<html>` 时触发器与面板一同放大；挂在局部容器时只有该子树的触发器跟随，面板内容维持默认字号。
- **可继续覆盖**：需要更细的控制（例如只放大按钮高度）时，仍可直接覆盖对应 token，密度轴只提供一组默认值。

如果应用只需要在窄屏放大，也可以不用密度轴、直接按视口覆盖 token：

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

- `font-size-md: 16px` 可避免 iOS 对小于 16px 的输入框聚焦缩放，但会改变按钮 / 表格行高，需按下方自测清单回归。
- 该覆盖**不会**扩大 Checkbox / RadioButton / Switch / icon 按钮的命中区；P0 的清除 / 关闭按钮已由库侧覆盖（≥24×24，视觉不变），其余目标仍需在使用层用 `padding` 或包装元素扩大可点区域。
- 为什么不提供 `data-preset="mobile"`：预设与明暗正交、且不感知视口；把尺寸塞进预设会让桌面端同样放大，也无法处理断点与命中区。评估与候选方案见[手机端优先主题预设评估](../design/governance/2026-10-25-mobile-first-preset-evaluation.md)。

## 移动端布局配方

以下配方把「安全区 + 动态视口 + 触摸下限」落到常见移动布局上；断点语义与窄屏行为矩阵以[响应式设计 §2](../design/responsive.md) / [§3](../design/responsive.md) 为准，本节只给使用方可直接抄用的写法。

### Bottom sheet（底部操作面板）

- 直接用 `CaomeiActionSheet`（内部为 `CaomeiDrawer position="bottom"`），或自行用 `CaomeiDrawer` 的底部抽屉。
- 面板高度由组件收敛到 `min(90dvh, 档位高度)`，正文超出时纵向滚动；底部内边距已叠加 `--caomei-safe-area-bottom`，不要再套安全区工具类。
- 需要自定义面板时，容器写 `max-height: 90dvh; overflow: auto`，并用 `padding-bottom: calc(var(--caomei-space-4) + var(--caomei-safe-area-bottom))` 让内容避开 home indicator。

### 吸顶头部

- 吸顶条用 `position: sticky; top: 0`，层级取 `var(--caomei-z-sticky)`，不要写数字 `z-index`。
- 顶部内边距叠加 `--caomei-safe-area-top`；在 `viewport-fit=cover` 下这是唯一能避开刘海的方式。
- 吸顶条自身不要设置 `overflow: hidden`，否则会截断内部浮层的弹出层。

### 固定底部操作条

- 操作条写 `position: fixed; inset-inline: 0; bottom: 0`，层级取 `var(--caomei-z-sticky)`，内边距用 `calc(var(--caomei-space-3) + var(--caomei-safe-area-bottom))`。
- 页面内容要预留与操作条等高的底部留白，否则最后一段内容会被遮住；留白同样要包含安全区。
- 操作条内的主按钮建议 `size="lg"` 或放在 `data-density="touch"` 子树内（见下文 44px 路径）。

### 搜索栏（SearchBar 配方）

搜索栏由 `Input` + `InputGroup` + `Button` 组合而成，库内**不提供** SearchBar 组件（组件化留待第二处真实复用取证）。四条路径必须都有去处：清除、取消、提交、空态。

<demo
    vue="../examples/mobile/search-bar.vue"
    ssg="true"
/>

- **清除**：输入框 `clearable` + 监听 `clear`，同时复位结果与状态，避免「清空输入但旧结果还在」。
- **取消**：只在有内容时显示取消按钮（`variant="ghost"`），点击回到初始态；不要用 `close` 图形代替，移动端文字更易识别。
- **提交**：按钮点击与键盘 `enter` 走同一个处理函数；`enter` 由 `Input` 的 `enter` 事件给出，不要另接原生 keydown。
- **空态**：提交空关键词时用 `role="status"` 的行内提示，而不是 toast —— 搜索框仍在视野内，行内反馈更近。
- 触摸密度：整条搜索栏放在 `data-density="touch"` 子树内即可获得 44px 高度；不要单独放大输入框。

### 移动壳层示例

把页头、搜索栏、列表、底部操作条与标签栏组合成一个可运行的应用外壳：页头吸顶并叠加安全区，底部操作条预留安全区，标签栏常驻底部。

<demo
    vue="../examples/mobile/shell.vue"
    ssg="true"
/>

- 页头用 `CaomeiNavBar`（`sticky` + 默认 `safe-area`）；返回只抛事件，路由跳转由你的应用接管。
- 搜索栏复用上文「搜索栏配方」；提交与 `enter` 共用同一个处理函数。
- 底部操作条在壳层内可直接用 flex footer（示例即此形态，无需给列表留白）；需要浮在内容之上时用 `position: fixed` 或 `sticky bottom`，并给列表留出与操作条等高的空间。
- 底部安全区只由**最底部**的固定件承担：标签栏已在底部时，其上方操作条不要再叠加 `--caomei-safe-area-bottom`，否则会出现双份留白。
- 标签栏用 `CaomeiTabbar`，条目等分且不横向溢出；与页头的 `nav` landmark 分别设置 `label`，避免同名。

### 软键盘与可见性

- 库内**不监听** `visualViewport`，也不做 JS 视口分支；地址栏收起 / 展开的差异统一交给 `dvh`（Drawer / Dialog / Toast / 图片预览已内置 `dvh` 回退）。
- 页面高度用 `min-height: 100dvh` 而不是 `100vh`；输入框聚焦时浏览器自行滚动到可见区，不要再用手写 `scrollIntoView` 抢占。
- 输入框字号保持 ≥16px（`data-density="touch"` 已把 `--caomei-font-size-md` 提到 16px）可避免 iOS 聚焦缩放。

### 五条下限判据

1. **命中区 ≥24×24**（WCAG 2.5.8）：库内 P0 / P1 / P2 目标已用不可见命中区满足，视觉盒不变。
2. **相邻目标中心距 ≥24**：同一交互族纵向排列时用 `--caomei-space-3` 及以上的行距。
3. **主操作建议 ≥44×44**：抽屉 / 底部操作条的一级按钮用 `size="lg"` 或触摸密度轴达成，不默认放大全部控件。
4. **文本与输入下限**：正文 ≥14px，输入 ≥16px；极窄视口靠折行 / 截断收敛，不缩字号。
5. **固定件让开安全区与动态视口**：固定顶部 / 底部 / 抽屉 / 提示都必须叠加对应安全区 token，并用 `dvh` 计算高度。

### 44px 的达成路径

- **首选**：在触摸密集区给容器加 `data-density="touch"`，控件高度变为 36 / 44 / 52px，字号同步上调，颜色不变。
- **按控件**：主操作按钮用 `size="lg"`；只有需要「一眼可点」的一级操作才升档，列表行不必整体放大。
- **按使用层**：用包装元素或容器 `padding` 扩大可点区域，命中区可以大于视觉盒。
- **不要**：把 44px 设为默认控件高度——这会改变桌面形态并使视觉基线整体漂移；也不要把相邻 24px 命中区塞进小于 24px 的行距。

## 触摸目标

库内关键控件的**命中区**（2026-10-16 实测，390×844 与 320×568 两档）：

- `CaomeiCheckbox` / `CaomeiRadioButton` 控件盒 18px 高（含关联标签并集后宽度充足）；`CaomeiSwitch` 轨道 40×22；`control-height` 三档 = 28 / 36 / 44px。
- 按 **WCAG 2.5.8（≥24×24）** 判据，289 个可点目标中约**三成**（87 个）未达标，其中**清除 / 关闭类 icon 按钮（13.33px）共 34 个**为最大构成；按 **Apple HIG（≥44×44）** 判据，达标者共 9 个（文件选择拖拽区 / 步骤条触发器 / 多行文本域）。
- **P0 已实现（1.1.0）**：六类清除 / 关闭按钮（TagsInput / MultiSelect / AutoComplete / Password / Tag / Message，含值片删除）的命中区扩到 **≥24×24**，**按钮视觉盒不变**；多行值片的行距 +2px 以保证相邻命中区不重叠。下限可用 `--caomei-hit-target-min` 调整，但调大时须保证相邻目标的轴距不小于该值，并同时覆盖三个多值字段的 `row-gap`。
- **P1 已实现（2026-11-10，Phase 30 M4-1）**：表单控件盒的 17 个目标（Checkbox 2 / RadioButton 6 / Switch 2 / Slider 3 / ColorPicker 滑柄 4）同样扩到 **≥24×24**，视觉盒不变（Checkbox 18、RadioButton 高 18、Switch 40×22、Slider 18、ColorPicker 18 边框盒）；同一交互族的相邻目标需保持轴距 ≥24。口径见[响应式设计 §4](../design/responsive.md) 断言 7 与[交付记录](../design/governance/2026-11-10-phase30-m4-1-hit-target-p1.md)。
- **P2 已实现（2026-11-12，Phase 31 M4-1）**：行高受限目标（Breadcrumb 链接 / DataTable 排序 / Select 清除）同样扩到 **≥24×24**，视觉盒不变；普通 Input 的内联输入行由控件盒填满外壳内容高，其余多值字段的锚点本就承接点击聚焦。口径见[响应式设计 §4](../design/responsive.md) 断言 7 与[交付记录](../design/governance/2026-11-12-phase31-m4-1-touch-target-p2.md)。
- **给你的建议**：面向手指操作的触摸密集区（表单、工具栏、列表项操作），可在使用层用容器 `padding` 或包装元素扩大可点区域；P0（1.1.0）、P1（Phase 30）与 P2（Phase 31）均已在库内交付；使用层仍可按需扩大包装元素。

## 设备预览

文档站导航栏的「设备预览」入口在抽屉中打开**当前页的同源 iframe**，可在 390 / 768 / 1024 / 1280 四档间切换。iframe 内的 `@media` 按 iframe 自身宽度求值，因此看到的是真实断点结果，而不是把容器缩窄或缩放。抽屉内另有亮 / 暗切换与刷新按钮；主题只写入 iframe，主站不刷新、不跳转。

- **预览路由**：当前页 URL 追加 `device-preview=1`；iframe 内检测到该标记后不渲染入口，避免递归。
- **同源与主题**：iframe 与主站同源，可读取 `localStorage` 的主题偏好；加载后按当前预览态校正 `dark` / `data-theme`。
- **适用面**：整页文档（含侧栏与导航）在设备上的样子；单个 Demo 的隔离预览（P2）不在本入口内。

## 自测清单（窄屏）

1. **视口**：390×844（手机）、768×1024（平板）、1280×800（桌面）三档，另加 **320×568** 极窄档、**360×800** / **414×896** 主流移动档、**900×1024**（769–1023「无档区间」内部点）与 **1536×960** / **1920×1080** 宽屏档核对边界与宽屏形态。
2. **横向溢出**：页面与组件容器不得出现非预期横向溢出；矩阵明确允许内部滚动的组件（`CaomeiButtonGroup` / `CaomeiSplitButton` / `CaomeiTabs` / `CaomeiDataTable`）以「容器可横向滚动 + 成员自身不被裁切」判定。
3. **浮层与面板**：`left >= 0 && right <= 视口宽`；需要滚动的面板另须内容可达。
4. **换行类容器**：纵向不裁切（成员完整落在容器 client rect 内），只测横向 `scrollWidth` 会漏检被固定高度裁掉的行。
5. **桌面无回归**：桌面档与改动前一致（形态与计算样式）。
6. 完整断言口径（含键盘聚焦的分档判定）见[响应式设计 §4](../design/responsive.md)。


## 真机执行记录

以下三项依赖真实设备，当前**未执行**（本仓无 iOS / Android 真机接入），以自动化用例与设计口径替代；执行时请把结果补进本表。

| 项 | 关注点 | 当前状态 | 替代证据 |
| --- | --- | --- | --- |
| iOS `dvh` | 地址栏收起 / 展开时抽屉、对话框、Toast、图片预览不跳动 | **未执行（无真机）** | `@supports (height: 100dvh)` 回退已在 Drawer / Dialog / Toast 实现；Playwright 移动档覆盖布局 |
| 触摸滚动 | 面板内滚动不带动页面、滚动锁复位、惯性滚动下的命中区 | **未执行（无真机）** | `responsive.e2e.ts` 覆盖横向滚动与成员不裁切；滚动锁由 `ui-validator` 记录覆盖 |
| OTP 自动填充 | `autocomplete="one-time-code"` 与系统键盘联动 | **未执行（无真机）** | InputOtp 单测与 E2E 覆盖粘贴分发与完成态；系统级自动填充无法在浏览器模拟 |

> 真机执行时请在「当前状态」列改为 `已执行（设备 / 系统版本 / 结果）`，并保留替代证据列作为对照。

## 相关
- [移动端就绪矩阵](./mobile-readiness.md)——逐组件页的 320 / 390 / 768 形态与缺口

- [响应式设计](../design/responsive.md)——断点语义 / 窄屏行为矩阵 / 验收标准（单一事实源）
- [主题与样式](../design/theming.md)——控件宽度上限与 token 覆盖
- [组件总览](../components/index.md)——各组件的能力与用法
- [Backlog](../plan/backlog.md)——移动端与响应式候选
