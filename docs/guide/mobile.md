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

## 触摸目标

库内关键控件的**命中区**（2026-10-16 实测，390×844 与 320×568 两档）：

- `CaomeiCheckbox` / `CaomeiRadioButton` 控件盒 18px 高（含关联标签并集后宽度充足）；`CaomeiSwitch` 轨道 40×22；`control-height` 三档 = 28 / 36 / 44px。
- 按 **WCAG 2.5.8（≥24×24）** 判据，289 个可点目标中约**三成**（87 个）未达标，其中**清除 / 关闭类 icon 按钮（13.33px）共 34 个**为最大构成；按 **Apple HIG（≥44×44）** 判据，达标者共 9 个（文件选择拖拽区 / 步骤条触发器 / 多行文本域）。
- **P0 已实现（1.1.0）**：六类清除 / 关闭按钮（TagsInput / MultiSelect / AutoComplete / Password / Tag / Message，含值片删除）的命中区扩到 **≥24×24**，**按钮视觉盒不变**；多行值片的行距 +2px 以保证相邻命中区不重叠。下限可用 `--caomei-hit-target-min` 调整，但调大时须保证相邻目标的轴距不小于该值，并同时覆盖三个多值字段的 `row-gap`。
- **P1 已实现（2026-11-10，Phase 30 M4-1）**：表单控件盒的 17 个目标（Checkbox 2 / RadioButton 6 / Switch 2 / Slider 3 / ColorPicker 滑柄 4）同样扩到 **≥24×24**，视觉盒不变（Checkbox 18、RadioButton 高 18、Switch 40×22、Slider 18、ColorPicker 18 边框盒）；同一交互族的相邻目标需保持轴距 ≥24。口径见[响应式设计 §4](../design/responsive.md) 断言 7 与[交付记录](../design/governance/2026-11-10-phase30-m4-1-hit-target-p1.md)。
- **P2 已实现（2026-11-12，Phase 31 M4-1）**：行高受限目标（Breadcrumb 链接 / DataTable 排序 / Select 清除）同样扩到 **≥24×24**，视觉盒不变；普通 Input 的内联输入行由控件盒填满外壳内容高，其余多值字段的锚点本就承接点击聚焦。口径见[响应式设计 §4](../design/responsive.md) 断言 7 与[交付记录](../design/governance/2026-11-12-phase31-m4-1-touch-target-p2.md)。
- **给你的建议**：面向手指操作的触摸密集区（表单、工具栏、列表项操作），可在使用层用容器 `padding` 或包装元素扩大可点区域；P0（1.1.0）、P1（Phase 30）与 P2（Phase 31）均已在库内交付；使用层仍可按需扩大包装元素。

## 自测清单（窄屏）

1. **视口**：390×844（手机）、768×1024（平板）、1280×800（桌面）三档，另加 **320×568** 极窄档与 **900×1024**（769–1023「无档区间」内部点）核对边界与空档形态。
2. **横向溢出**：页面与组件容器不得出现非预期横向溢出；矩阵明确允许内部滚动的组件（`CaomeiButtonGroup` / `CaomeiSplitButton` / `CaomeiTabs` / `CaomeiDataTable`）以「容器可横向滚动 + 成员自身不被裁切」判定。
3. **浮层与面板**：`left >= 0 && right <= 视口宽`；需要滚动的面板另须内容可达。
4. **换行类容器**：纵向不裁切（成员完整落在容器 client rect 内），只测横向 `scrollWidth` 会漏检被固定高度裁掉的行。
5. **桌面无回归**：桌面档与改动前一致（形态与计算样式）。
6. 完整断言口径（含键盘聚焦的分档判定）见[响应式设计 §4](../design/responsive.md)。

## 相关

- [响应式设计](../design/responsive.md)——断点语义 / 窄屏行为矩阵 / 验收标准（单一事实源）
- [主题与样式](../design/theming.md)——控件宽度上限与 token 覆盖
- [组件总览](../components/index.md)——各组件的能力与用法
- [Backlog](../plan/backlog.md)——移动端与响应式候选
