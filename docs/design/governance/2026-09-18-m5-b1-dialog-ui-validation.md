# M5 批次 B1「Dialog 头部契约与断点宽度」浏览器验证记录

**批次**：M5-1（`showHeader` / `title` 可选化 / `@hide`）+ M5-2（`breakpoints`）——[待办事项](../../plan/todo.md) M5 批次 B1。
**结论：通过** —— 常驻 E2E **54 / 54** 通过（含本批新增 6 项，三档视口各 2 项），一次性实测核对 **45 / 45**，另断言 4 基线 **54 项逐字段零差异**；console error / pageerror / 崩溃 0，页面与用例容器无横向溢出。改动前基线与关键实测值见 [M5 B1 Dialog 基线](./2026-09-18-m5-b1-dialog-baseline.md)。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | 常驻用例：`test/e2e/fixtures` 夹具的 `src/` 源码（Vite dev）；数值补测：同一夹具 |
| 视口 | mobile 390×844 / tablet 768×1024 / desktop 1280×800（`playwright.config.ts` 三 project） |
| 运行期 | Chromium（Playwright），`reducedMotion: 'reduce'`；root 容器补 `--no-zygote`（见 §6） |
| 常驻命令 | `pnpm test:e2e` |
| 一次性脚本 | `test-results/m5-b1/measure.mjs`（数值 / 暗色 / 宿主稳定性），原始 JSON 同目录（gitignored） |
| 视觉通道 | 不可用（无视觉理解通道）；本轮仅几何 / 计算样式 / ARIA / 键盘断言，**未做逐像素比对** |

## 2. 常驻 E2E（§4 断言 1 / 2 / 3 / 5 / 6）

`pnpm test:e2e` → **54 passed**（3 project × 18 用例）。本批新增：

| 用例 | 断言要点 | 390 / 768 / 1280 |
| --- | --- | --- |
| 浮层断点宽度（`Dialog.breakpoints`） | 面板宽等于命中档位；落在视口内；面板无横向溢出 | 3 / 3 通过 |
| 无头部对话框（`showHeader=false`） | 头部与关闭按钮不渲染；隐藏标题保留可访问名并视觉隐藏；页脚可关闭 | 3 / 3 通过 |

用例级 `afterEach` 自动断言 **0 console error**（54 / 54 成立）；`#dialog-breakpoints` / `#dialog-headerless` 已并入 §4 断言 1 的 section 清单。

## 3. 一次性实测核对（45 项）

### A. 断点生效（12 项）

配置 `{ '1199px': '85vw', '575px': '95vw' }`，三档 × {宽度、视口内、命中档 `cssWidth`、注入样式含规则}：

| 视口 | 命中档 | 实测宽 | `x` / `right` |
| --- | --- | --- | --- |
| 390 | 575（最窄） | 370.5px | 9.75 / 380.25 |
| 768 | 1199 | 652.8px | 57.6 / 710.4 |
| 1280 | 无（回退 `lg`） | 640px | 320 / 960 |

390 档实测 370.5px（95vw）而非静态收敛规则的 358px，**证明注入规则的源序 tie-break 生效**（层叠承重路径判别点）。

### B. 无头部对话框（18 项 = 3 档 × 6）

`showHeader=false` 时：`.caomei-dialog__header` 计数 0、`.caomei-dialog__close` 计数 0；`aria-labelledby` 解析到文本「无头部对话框」；`aria-describedby` 可解析（空描述节点存在，无 Reka 缺描述告警）；隐藏标题计算样式 `width: 1px` / `height: 1px` / `clip-path: inset(50%)` / `position: absolute`；页脚按钮可关闭面板。

### C. 宿主稳定性（9 项 = 3 档 × 3）

默认对话框打开前后：`documentElement.clientWidth` 390 → 390、768 → 768、1280 → 1280（无滚动条消失引起的跳动）；`in-flow` 参照元素（`#wrap-dialog-footer` 顶边）位移 0；CLS 0（含遮罩完整覆盖，遮罩计数各档为 1）。

### D. 暗色（6 项 = 3 档 × 2）

`data-theme="dark"` 下三档一致：面板 `background: rgb(11, 11, 13)`、`color: rgb(245, 245, 245)`，圆角与内边距同亮色（`12px` / `16px`），无颜色 token 回归（本批未触碰颜色 / 阴影 / 遮罩样式）。

### E. 断言 4 基线（54 项逐字段零差异）

默认对话框（未传 `breakpoints`）在 390 / 768 / 1280 的 18 个几何与计算样式字段与 `37da558` 基线**逐字段一致**。详见[基线记录 §2](./2026-09-18-m5-b1-dialog-baseline.md)。

## 4. 判定与观察

- M5-1 三项验收（`title` 缺省不产生空属性、不破坏可访问名；`showHeader` 生效；`@hide` 契约）三项均有单测 + 本记录 / 常驻 E2E 证据。
- M5-2 验收（`breakpoints` 生效有浏览器证据、未传时行为与现状一致）由本记录 §3.A / §3.E 与[响应式设计](../responsive.md) 矩阵 #17 承载。
- **观察项（不计为缺陷）**：① 视觉理解通道不可用，仅文字 / 几何 / 计算样式证据；② 夹具无主题文件注入路径差异，暗色经 `data-theme="dark"` 显式施加；③ 无头 Chromium 布局视口滚动条宽 0，`vw` 实测值与视口宽严格成比例。

## 5. 复现

```sh
pnpm test:e2e
node test-results/m5-b1/measure.mjs http://127.0.0.1:4501/ current test-results/m5-b1/current.json
```

## 6. 附带环境修复（E2E 启动参数）

root 容器内 Chromium 的 zygote 会导致渲染进程在**交互时**崩溃（`Target crashed`）——既有用例（Select / Dialog 页脚等）同样命中，属环境问题而非本批回归。以 4 组启动参数探针定位：`--no-zygote` 恢复且**保留多 context 能力**；`--single-process` 亦恢复但会阻止第二个 context 创建，故不采用。修复随 root 分支写入 `playwright.config.ts`，口径同步至[测试规范 §7](../../standards/testing.md)。修复后常驻用例由「全量崩溃」恢复为 **54 / 54**。
