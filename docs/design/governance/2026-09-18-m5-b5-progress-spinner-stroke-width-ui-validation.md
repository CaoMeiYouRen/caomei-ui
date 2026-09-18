# M5 批次 B5（M5-9）「ProgressSpinner `strokeWidth`」浏览器验证记录

**批次**：M5-9（将既有 CSS 变量钩子提升为 `strokeWidth` prop）——[待办事项](../../plan/todo.md) M5 批次 B5（本批仅交付 M5-9）。
**结论：通过** —— 文档站（Vite dev，当前源码）实测「prop → 计算描边宽度」全链路成立：不传时按 `size` 档位回退（`sm` / `md` 2px、`lg` 3px），传入数字 / 纯数字字符串 / CSS 长度均生效并**覆盖档位默认**（内联变量优先于 `:where()` 档位声明），圆环在全部用例中保持 `border-style: solid`（未被 invalid at computed-value time 丢弃），暗色一致，console error / pageerror **0**。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | 文档站 `docs/`（Vite dev，源码态；含本批新增示例 `progress-spinner/stroke.vue`） |
| 入口 | `http://localhost:5173/components/progress-spinner` |
| 视口 | 1280×900（桌面）+ 暗色；示例为语言中性，中英页共用同一文件（`docs/design/documentation-site.md` L117） |
| 运行期 | Chromium（Playwright），root 容器补 `--no-sandbox` / `--no-zygote` / `--disable-dev-shm-usage` |
| 一次性脚本 | `test-results/m5-b5-spinner-ui-check.mjs`（原样输出 JSON 到 `test-results/m5-b5/report.json`）、截图同目录（均 gitignored） |
| 视觉通道 | 推理通道不可用；改用**本地 OCR** 确认页面与章节渲染 + 计算样式断言，**未做逐像素比对** |

> 判定口径：`strokeWidth` 的消费点是指示器的 `border-top-width`（`border: var(--caomei-progress-spinner-stroke, 2px) solid …`），故以**计算描边宽度 + `border-style`** 作为「prop 生效且圆环未被丢弃」的最终判据——只看宽度无法发现「非法值令整条 `border` 声明失效」（此时宽度同为 0、样式为 `none`）。

## 2. 缺省回退：不传 `strokeWidth` 时按档位联动

`size` 演示（三个 spinner，均不传 `strokeWidth`）：

| 档位 | 内联变量 | 计算 `border-top-width` | 计算 `border-top-style` |
| --- | --- | --- | --- |
| `sm` | `''`（未写内联） | `2px` | `solid` |
| `md` | `''` | `2px` | `solid` |
| `lg` | `''` | `3px` | `solid` |

与 `progress-spinner.vue` 的档位声明（`sm` / `md` 2px、`lg` 3px）逐值一致 → 「缺省回退 + 尺寸联动」成立。

## 3. prop 生效：数字 / 字符串全链路

「轨道宽度」演示（`1` / `3` / **静态属性 `stroke-width="4"`** / `6`；静态属性传的是字符串，即 PrimeVue 迁移的常见写法）：

| 传入写法 | 内联变量 | 计算 `border-top-width` | 计算 `border-top-style` |
| --- | --- | --- | --- |
| `:stroke-width="1"` | `1px` | `1px` | `solid` |
| `:stroke-width="3"` | `3px` | `3px` | `solid` |
| `stroke-width="4"`（字符串） | `4px` | `4px` | `solid` |
| `:stroke-width="6"` | `6px` | `6px` | `solid` |

内联变量值与计算宽度逐项对应且样式均为 `solid`，链路（prop → 归一化 → 内联变量 → border 宽度）无断点；静态字符串路径与数字路径等价。

## 4. CSS 层：字符串长度、内联优先与「非法值会令圆环消失」（负向对照）

在真实页面对 `lg` 档（档位声明 `3px`）的 spinner 就地改写内联变量：

| 步骤 | 计算（width / style） | 说明 |
| --- | --- | --- |
| 初始（无内联） | `3px / solid` | 档位默认 |
| 设为 `0.25rem` | `4px / solid` | 字符串 CSS 长度生效（根字号 16px） |
| 设为 `5px` | `5px / solid` | 内联覆盖档位声明（`lg` 的 3px 被覆盖） |
| **设为原始 `2`（语义非法）** | `0px / none` | **负向对照**：invalid at computed-value time → 整条 `border` 声明被丢弃，圆环消失 |
| 移除内联 | `3px / solid` | 回落到档位默认 |

**第 4 行是本批 Review Gate 的唯一 blocker（RG-B01）的证据基础**：`strokeWidth` 必须做**白名单**校验（合法 `border-width`），否则把语义非法串（PrimeVue 的 `strokeWidth` 默认写作 `'2'`，迁移者会写成静态属性）写进变量会让圆环整体消失，而非文档承诺的「回退档位默认」。修复后的行为：纯数字字符串归一化为 px、其余串经白名单校验，非法值一律回退（见 §6 单测）。

> 归属说明（对账 Review Gate RG-W01）：本节的「内联变量 → border 消费」由浏览器计算样式证实；「prop → 内联变量」的归一化（含字符串分支）由单测覆盖；§3 的静态字符串用例同时把两者串起来。

## 5. 暗色与稳定性

- 暗色：全部 spinner 的计算描边宽度与 `border-style` 与亮色逐项一致（`sm` 2 / `md` 2 / `lg` 3、prop 演示 1 / 3 / 4 / 6，均 `solid`）；`darkModeApplied = true`；截图 `test-results/m5-b5/dark-spinner.png`。
- console error / pageerror：**0**。
- 页面无新增横向溢出（示例为 flex 行 + 固定间距，未引入定宽）。

## 6. 单元测试覆盖（与本节结论互补）

`progress-spinner.test.ts` 37 例（11 既有 + 26 新增）锁定：

- 不传 `strokeWidth` 时不写内联变量、不产出 `style` 属性；
- 数字按 px（含 `0`；负数 / 非有限数 / `> 1000` 回退）；
- 纯数字字符串按 px（`'2'` → `2px`）；
- 合法字符串原样（去首尾空白，如 `0.25rem`）；`border-width` 关键字 `thin` / `medium` / `thick` 可用；
- **白名单外一律回退（非法矩阵 15 项）**：空串 / 纯空白 / 负数 / 非有限数 / 超出上界（`1001`）/ 分号注入 / 花括号 / 超长 / 带单位后跟多余字符（`2px2`）/ 非长度关键字（`abc`）/ 百分比（`50%`，对 `border-width` 非法）/ 负长度（`-1px`）/ 复合值（`2px solid red`）/ 颜色关键字（`red`）/ 未闭合函数（`calc(`）；
- 提供时写入内联变量且档位类保留；与消费者透传 `style` 中的**同名变量冲突时以 prop 为准**，与非同名声明合并后双方均保留（验证 `mergeProps` 的 style 合并路径）。

## 7. 未覆盖边界与后续

- 视觉推理通道不可用，未做像素级比对；结论以计算样式 / 结构 / OCR 三元证据替代。
- `fill` 与 `animationDuration` 仍未实现（不在 M5-9 范围），迁移表按现状登记。
- 未覆盖：`strokeWidth` 在 SSR 产物中的内联样式序列化（`verify` 的 `check:nuxt` 为「`nuxt generate` + SSR HTML/CSS 标记断言」的集成级冒烟，本轮未在其中断言本 prop 的内联样式取值）。
- 本记录为一次性实测，未新增常驻 E2E 用例（沿用 M5 B1~B4 的「常驻覆盖既有形态、一次性覆盖新特性」口径）。
