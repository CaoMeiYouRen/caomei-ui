# M5 批次 B2「ConfirmDialog 图标 + Popover 声明式锚点」浏览器验证记录

**批次**：M5-3（ConfirmDialog `icon`）+ M5-4（Popover 命令式改声明式迁移写法、`CaomeiPopoverTrigger` `unstyled`）——[待办事项](../../plan/todo.md) M5 批次 B2。
**结论：通过** —— 文档站（当前源码，Vite dev）在 light / dark 两主题下实测三个演示，图标类名 / 装饰语义 / 计算样式 / 几何全部符合预期，console error / pageerror **0**；标题与描述间距与改造前**逐值一致**（`12px`，无未登记视觉副作用）。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | 文档站 `docs/`（Vite dev，源码态；含本批新增示例 `confirm-dialog/icon.vue`、`popover/anchor.vue`） |
| 入口 | `http://localhost:5173/components/confirm-dialog` |
| 视口 | 1280×900 |
| 运行期 | Chromium（Playwright），root 容器补 `--no-sandbox` / `--no-zygote` / `--disable-dev-shm-usage` |
| 一次性脚本 | `test-results/m5-b2-ui-check.mjs`（样式 / 类名 / 主题）、`test-results/m5-b2-geometry-check.mjs`（几何）；截图与原始 JSON 同目录（gitignored） |
| 视觉通道 | 推理通道不可用；改用**本地 OCR** 确认文案渲染 + 几何 / 计算样式断言，**未做逐像素比对** |

## 2. ConfirmDialog 图标（M5-3）

三态 × 两主题，均由「点击文档站演示按钮 → 等待 `[role="alertdialog"]`」后读取计算值：

| 演示 | 请求 | 实测图标类名 | `aria-hidden` | 图标色（light / dark） | 尺寸 |
| --- | --- | --- | --- | --- | --- |
| 基础用法 | 不传 `icon`、`neutral` | `lucide-info` | `true` | `rgb(107,114,128)` / `rgb(161,161,170)` | 16px |
| 描述与语气 | 不传 `icon`、`tone="danger"` | `lucide-triangle-alert` | `true` | `rgb(220,38,38)` / `rgb(248,113,113)` | 16px |
| 图标 | 传 `Rocket` | `lucide-rocket` | `true` | `rgb(107,114,128)` / `rgb(161,161,170)` | 16px |

- 三态命中「传 icon / 不传回退默认（neutral `Info` / danger `TriangleAlert`）」全部路径；装饰语义恒为 `aria-hidden="true"`，可访问名由标题提供。
- **间距零回归**（对账 Review Gate RG-W1）：`.caomei-confirm-dialog__heading` 计算 `gap` 与标题→描述实测间距均为 `12px`，与改造前的 content 纵向间距逐值一致；`__content` 的 `gap` 亦为 `12px`。本次改造除新增图标外未改变既有视觉节奏。

## 3. 几何与宿主稳定性

三态共用同一版式，逐态断言结果一致：

| 断言 | 结果 |
| --- | --- |
| 图标整体位于标题左侧（`icon.right <= title.left`） | 通过（图标 x 456–472，标题 x 484） |
| 图标与标题首行垂直对齐（纵向差 ≤ 4px） | 通过 |
| 对话框完整落在视口内 | 通过（400×140 居中） |
| 页脚位于标题之后（阅读顺序） | 通过 |
| 页面无横向溢出（`scrollWidth <= innerWidth + 1`） | 通过 |
| console error / pageerror | **0** |

OCR（本地 RapidOCR）对 `dark-danger.png` 解析出「删除文件 / 删除后不可恢复。/ 保留 / 删除」，确认文案与按钮在暗色下正常渲染、无裁切。

## 4. Popover 声明式锚点（M5-4）

`anchor.vue` 以 `as-child + unstyled` 复用 `CaomeiButton`（icon-only，`label="通知"`）作为触发器；面板打开 / Esc 关闭 / 焦点回归由组件既有单测与常驻 E2E 覆盖，本批新增单测锁定「默认 `as-child` 会把内建外观类合并到子元素、`unstyled` 去掉该合并、且开合与 a11y 接线不受影响」三条行为（`src/components/popover/popover.test.ts`）。

## 5. 未覆盖边界与后续

- 视觉推理通道不可用，未做像素级比对；关键视觉结论以计算样式 + 几何 + OCR 三元证据替代。
- 本记录为一次性实测，未新增常驻 E2E 用例（沿用 B1 的「常驻覆盖既有形态、一次性覆盖新特性」口径）。
