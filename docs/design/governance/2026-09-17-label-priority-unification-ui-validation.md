# label 优先级全库统一（工作区未提交 diff）浏览器验证

- 日期：2026-09-17
- 范围：长期任务第 7 轮「label 优先级全库统一」的 **V 阶段**——对 11 个组件（ProgressBar / ProgressSpinner / Paginator / Stepper / DatePicker / ColorPicker / Slider / SplitButton / Calendar / ToastProvider / Button / Badge / FileUpload）验证三级可访问名契约：**显式 `label` > 透传 `aria-label` > 语言兜底文案**。
- 依据：[开发规范](../../standards/development.md)、[测试规范 §5](../../standards/testing.md)、UI 验证 skill（`.github/skills/ui-validator/SKILL.md`）
- 被测对象：工作区未提交 diff（基线 `edf179f`，共 50 文件 = 31 `src/**` + 19 `docs/**`），核心单点为 `src/components/_shared/use-label-attrs.ts` 的 `resolveLabelName`。
- 结论：**通过**——夹具 51 项核对全过，失败 0，console error / pageerror / HTTP ≥ 400 全为 0；无「非预期漂移」。

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | 工作区未提交 diff（基线 `edf179f`）；验证期间未修改 `src/**` |
| 入口 / 产物 | 临时夹具 `http://127.0.0.1:4631`（Vite 直读 `src/`，非构建产物；脚本与夹具在 gitignored `test-results/`） |
| 浏览器 | Chromium **153.0.8010.12**（`@playwright/test` headless，`--no-sandbox`） |
| 页面 | 单页夹具，逐组件三档 `data-case`：`-fwd`（只传 `aria-label="透传名"`）/ `-exp`（`label="显式名"` + `aria-label="透传名"`）/ `-def`（都不传） |
| 主题 / 语言 | 默认亮色 + zh-CN；另覆盖 `html.dark` + `CaomeiConfigProvider locale="en-US"` 三个组件 |
| 动效 | 不适用（无样式 / 动画改动） |

采用临时夹具而非文档站 demo：文档站示例未覆盖「只传 `aria-label`、不传 `label`」这一组合，无法验证中间层级。夹具入口与命令见文末「复现方式」。

## 1. 三级优先级（核心）——逐项「期望 → 实测」

`roleCount` 为 Playwright `getByRole(role, { name, exact: true })` 命中数（按**计算可访问名**匹配）；`ax` 为 CDP `Accessibility.getPartialAXTree` 读出的浏览器 AX 计算名。二者与 `aria-label` 属性值三者一致才判通过。

| 组件 | 承载元素 | 只传 `aria-label` | `label` + `aria-label` | 都不传 |
| --- | --- | --- | --- | --- |
| ProgressBar | 根 `role="progressbar"` | 透传名 | 显式名 | 进度 |
| ProgressSpinner | 根 `role="progressbar"` | 透传名 | 显式名 | 加载中 |
| Paginator | 根 `<nav>`（`navigation`） | 透传名 | 显式名 | 分页 |
| Stepper | 根 `role="group"` | 透传名 | 显式名 | 步骤 |
| DatePicker | 触发器 `<button>` | 透传名 | 显式名 | 日期 |
| ColorPicker | 触发器 `<button>` | 透传名 | 显式名 | 颜色 |
| Slider（单滑块） | thumb `role="slider"` | 透传名 | 显式名 | 滑块 |
| SplitButton | 主按钮 | 透传名 | 显式名 | 导出（可见文本，无兜底） |
| Calendar | 日历容器（`generic`） | 透传名 | 显式名 | `日历, 2026年9月` |
| ToastProvider | 视口 landmark `role="region"` | 透传名 | 显式名 | 通知 (F8) |
| Button | 控件本身 | 透传名 | 显式名 | 保存（可见文本，无兜底） |
| Badge | 控件本身（`generic`） | 透传名 | 显式名 | 无 `aria-label`（值「5」） |
| Badge（`dot` + `label`） | `role="img"` | — | 显式名 | — |
| FileUpload | 拖放区 `<button>` | 透传名 | 显式名 | 图标提示（自定义插槽文本） |

要点：

- **中间层级（透传 `aria-label`）对本批新增的三级组件生效**：ProgressBar 旧实现为 `label ?? locale`，透传值会被语言兜底吞掉；Calendar / ColorPicker / Slider / SplitButton / Toast 视口旧实现同样未把透传值纳入中间层。实测三档均为预期名。
- **`-def` 档不等于「无名字」**：ProgressBar 等带兜底的组件输出语言文案；Button / SplitButton 输出可见文本；Badge / FileUpload（自定义插槽）不输出 `aria-label`，名字由后代文本合成。
- **Calculator 容器为 `generic`**：Playwright `ariaSnapshot()` 会省略 generic 节点，故额外用 CDP `getPartialAXTree` 取计算名，实测 `generic="透传名"` / `generic="显式名"` / `generic="日历, 2026年9月"`，与属性值一致。

## 2. Calendar 月份上下文回归（回归点）

| 用例 | 期望 | 实测（`aria-label` = CDP `ax.name`） | 结果 |
| --- | --- | --- | --- |
| 都不传 | 以「日历」开头且含月份上下文，**不得**为裸「日历」 | `日历, 2026年9月` | 通过 |
| `label="显式名"` + `aria-label="透传名"` | 显式名 | `显式名` | 通过 |
| 只传 `aria-label` | 透传名（契约：透传 > 语言兜底） | `透传名` | 通过 |

`-def` 档由 Reka 合成 `fullCalendarLabel`（`日历` + 月份上下文），未被降级为裸「日历」；显式 / 透传名按契约覆盖。**有意结果**：只传 `aria-label` 时容器名不再带月份上下文（消费方显式命名优先，符合契约），视觉隐藏 heading 仍保留月份上下文文本。

## 3. Toast 视口（landmark）

| 用例 | `role="region"` 计算名 | 内层 `<ol>` `aria-label` | 其他属性转发 |
| --- | --- | --- | --- |
| 只传 `aria-label` | 透传名 | `null`（不重复） | `data-probe="keep"` 落到 `<ol>` |
| `viewportLabel` + `aria-label` | 显式名（`viewportLabel` 胜出） | `null` | — |
| 都不传 | 通知 (F8)（`{hotkey}` 已替换） | `null` | — |

内层 `<ol>` 不再重复携带同名 `aria-label`（`viewportAttrs` 剥离）；其余透传属性仍转发到 `<ol>`。

## 4. 暗色 / en-US 抽查

`html.dark` + `CaomeiConfigProvider locale="en-US"` 下，语言兜底文案与计算名：

| 组件 | 期望 | 实测（AX 计算名） |
| --- | --- | --- |
| ProgressBar | `Progress` | `Progress` |
| Stepper | `Steps` | `Steps` |
| Paginator | `Pagination` | `Pagination` |

暗色 token 同步实测：`--caomei-color-bg = #0b0b0d`、`--caomei-disabled-opacity = 0.6` 未被覆写。截图：`test-results/tmp/label-priority/{light,dark}-full.png`。

## 5. 无回归抽查

| 项 | 选择器 / 取值 | 期望 | 实测 |
| --- | --- | --- | --- |
| 禁用态 opacity | `.caomei-button:disabled` | `0.6` | `0.6` |
| 禁用态 opacity | `.caomei-paginator__control:disabled` | `0.6` | `0.6` |
| 遮罩计算值 | `.caomei-dialog__overlay` `background-color` | `var(--caomei-color-mask)` 探针值 | `rgba(0, 0, 0, 0.45)`（与探针一致） |
| 阴影计算值 | `.caomei-dialog__content` `box-shadow` | `var(--caomei-shadow-lg)` 探针值 | `rgba(0, 0, 0, 0.18) 0px 12px 32px 0px`（与探针一致） |
| 阴影计算值 | `.caomei-color-picker__panel` `box-shadow` | `var(--caomei-shadow-lg)` 探针值 | 同上（与探针一致） |
| Button label 优先级 | `button-fwd/exp/def` | 透传名 / 显式名 / 保存 | 同左 |
| Badge label 优先级 | `badge-fwd/exp/def` + `dot` | 透传名 / 显式名 / 无 `aria-label`；`dot+label` → `img 显式名` | 同左 |

本批为属性级变更、未触碰样式，视觉面与 token 消费点无变化。

## 6. console / pageerror

- console error：**0**
- pageerror：**0**
- HTTP ≥ 400：**0**

## 7. 本批有意的属性变化 vs 非预期漂移

**有意的属性变化（契约升级，非缺陷）**：

1. 带语言兜底的组件在「只传 `aria-label`」时，计算名由语言文案变为透传名（新增中间层级）。
2. Calendar 在无显式名时保留 Reka 合成的月份上下文；显式名 / 透传名按优先级覆盖。
3. Toast 视口 `aria-label` 只落在 `role="region"`，内层 `<ol>` 不再重复；其余属性仍转发。
4. `label` 与透传 `aria-label` 同传时，显式 `label` 胜出（含 SplitButton 主按钮）。

**非预期漂移**：无。所有组件三档计算名与 `aria-label` 属性、CDP AX 名三方一致。

## 8. 观察项（不计缺陷）

- **SplitButton 组根仍经 `$attrs` 透传**：`v-bind="$attrs"` 使 `aria-label` 同时落在 `CaomeiButtonGroup` 根（generic）与主按钮；主按钮计算名正确，组根多一份同名属于既有行为，非本批引入。已记录，未阻断。
- **Document 站 demo 未覆盖「只传 `aria-label`」组合**：故本记录以临时夹具为准；后续若要常驻覆盖，应由 `@test-engineer` 在 E2E / 单测层补断言（本批已有单测覆盖三档，V 阶段负责真实浏览器计算名）。
- **Vite 陈旧 transform**：夹具 `app.vue` 编辑后 dev server 未触发热更新（未打印 HMR 日志），需重启 Vite 才能拿到新源码；复跑务必重启（与 `2026-09-17-batch23` 记录的同类现象一致）。

## 复现方式

```bash
# 前置：启动夹具（临时、gitignored；4631 端口）
setsid nohup pnpm exec vite --config test-results/tmp/label-priority/vite.config.ts \
  </dev/null > test-results/tmp/label-priority/dev.log 2>&1 &
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4631/

# 51 项：三档优先级 + Calendar 月份上下文 + Toast 视口 + 暗色/en-US + 无回归 + 0 console
node test-results/label-priority-validate.mjs
```

产物：`test-results/tmp/label-priority/label-priority-records.json`（含逐项 `ariaSnapshot`、`aria-label`、CDP `ax`）、`light-full.png` / `dark-full.png`、`dev.log`。

## 交接

- 结论 **Pass**，可交 `@test-engineer` 复核本批单测覆盖（三档优先级 + 月份上下文 + Toast 内层 `<ol>` 不重复），或直接进入 Review Gate 收口。
- 观察项 1（SplitButton 组根同名）如需处理，回 `@frontend-developer` 评估是否将 `aria-label` 从组根 `$attrs` 分流。
