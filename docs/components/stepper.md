# Stepper 步骤条

步骤条展示多步流程的进度，并在步骤之间导航。基于 Reka UI Stepper（稳定 primitive）封装，采用与 Tabs 一致的组合式 API。

## 基础用法

`v-model` 绑定当前步骤（从 1 开始）。组合件分工：`CaomeiStepper` 提供根上下文，`CaomeiStepperList` 负责布局，`CaomeiStepperItem` 声明步骤，`CaomeiStepperTrigger` / `CaomeiStepperIndicator` / `CaomeiStepperTitle` / `CaomeiStepperDescription` 构成可点击步骤，`CaomeiStepperSeparator` 绘制连接线。

<demo
    vue="../examples/stepper/basic.vue"
    ssg="true"
/>

根组件默认插槽会透传 Reka 的上下文（`modelValue`、`totalSteps`、`isPrevDisabled`、`isNextDisabled`、`nextStep`、`prevStep`、`hasNext`、`hasPrev` 等），可直接用于渲染上一步 / 下一步操作（禁用按钮请用布尔值 `isPrevDisabled` / `isNextDisabled`，`hasPrev` / `hasNext` 是函数）。

## 方向

`orientation="vertical"` 切换为纵向排布，`CaomeiStepperList` 随之改为纵向；根元素同时输出 `data-orientation` 供样式覆盖。

<demo
    vue="../examples/stepper/vertical.vue"
    ssg="true"
/>

`dir` 仅影响键盘方向导航（左右 / 上下与 RTL 映射）；布局镜像需在上层元素设置 `dir="rtl"`。

窄屏（≤640px）**不内建**横向 → 纵向的自动转换：横向步骤条随容器压缩，需要纵向形态时由使用方改 `orientation="vertical"`。判定依据见[响应式设计 §3](../design/responsive.md)（窄屏行为矩阵 #10）。

## 受控与非受控

- 受控：传入 `v-model`，当前步骤完全由外部状态决定。
- 非受控：传入 `default-value`（默认 `1`）指定初始步骤，交互后由组件内部维护。

`CaomeiStepper` 抛出 `update:modelValue`，值为被激活的步骤序号。

## 顺序与状态

- `linear` 默认为 `true`，只允许前进到下一步或回退到已完成步骤，不能跳步；设为 `false` 后可任意跳转。
- `CaomeiStepperItem` 的 `disabled` 禁用单个步骤，禁用的步骤不参与交互与键盘导航。
- `completed` 显式标记步骤为已完成，覆盖由当前步骤推导出的状态。

步骤状态通过 `StepperItem` 的 `data-state` 暴露（`active` / `completed` / `inactive`），样式据此区分。

<demo
    vue="../examples/stepper/states.vue"
    ssg="true"
/>

## 组合件 API

除下方根组件 API 外，组合件各承担一项职责：

| 组件 | 关键 props | 说明 |
|------|-----------|------|
| `CaomeiStepper` | `v-model`、`defaultValue`、`orientation`、`linear`、`dir`、`label` | 根容器，提供上下文 |
| `CaomeiStepperList` | — | 步骤列表布局容器（`flex`） |
| `CaomeiStepperItem` | `step`（必填）、`disabled`、`completed` | 单个步骤，输出 `data-state` |
| `CaomeiStepperTrigger` | — | 可点击触发器，渲染为 `button` |
| `CaomeiStepperIndicator` | 默认插槽 `{ step }` | 步骤指示器 |
| `CaomeiStepperTitle` | — | 步骤标题 |
| `CaomeiStepperDescription` | — | 步骤描述 |
| `CaomeiStepperSeparator` | — | 步骤分隔线，随 `data-state` 变色 |

`CaomeiStepper` 通过模板 ref 暴露 `goToStep` / `nextStep` / `prevStep`，便于外部按钮驱动流程。

## 无障碍

- 根元素渲染 `role="group"`，由 Reka 提供 `aria-current` 与步骤状态语义；可访问名优先级为 `label` > 透传 `aria-label` > 本地化「步骤」文案。
- 触发器渲染为 `button`，支持 `Enter` / 空格激活；`linear` 模式下不可跳步的触发器带 `disabled` 与 `data-disabled`。
- 焦点环使用 `:focus-visible`，并遵循 `prefers-reduced-motion`。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-stepper-gap` | `--caomei-space-2` | 根容器间距 |
| `--caomei-stepper-list-gap` | `--caomei-space-2` | 步骤列表间距 |
| `--caomei-stepper-item-gap` | `--caomei-space-2` | 步骤内指示器与内容间距 |
| `--caomei-stepper-trigger-gap` | `--caomei-space-2` | 触发器内元素间距 |
| `--caomei-stepper-trigger-padding` | `--caomei-space-1` | 触发器内边距 |
| `--caomei-stepper-indicator-size` | `1.75rem` | 指示器尺寸 |
| `--caomei-stepper-indicator-bg` | `--caomei-color-bg` | 指示器默认背景 |
| `--caomei-stepper-indicator-color` | `--caomei-color-text-muted` | 指示器默认文字色 |
| `--caomei-stepper-active-color` | `--caomei-color-primary` | 激活态强调色 |
| `--caomei-stepper-active-bg` | `--caomei-color-primary` | 激活态指示器背景 |
| `--caomei-stepper-active-indicator-color` | `--caomei-color-primary-foreground` | 激活态指示器文字色 |
| `--caomei-stepper-completed-color` | `--caomei-color-success` | 已完成态强调色 |
| `--caomei-stepper-inactive-color` | `--caomei-color-text-muted` | 未激活态文字色 |
| `--caomei-stepper-title-color` | `--caomei-color-text` | 步骤标题色 |
| `--caomei-stepper-description-color` | `--caomei-color-text-muted` | 步骤描述色 |
| `--caomei-stepper-separator-color` | `--caomei-color-border` | 分隔线颜色 |
| `--caomei-stepper-separator-min-length` | `--caomei-space-4` | 分隔线最小长度 |

```css
.caomei-stepper {
    --caomei-stepper-active-color: #16a34a;
    --caomei-stepper-completed-color: #16a34a;
}
```

<ComponentApi name="stepper" />
