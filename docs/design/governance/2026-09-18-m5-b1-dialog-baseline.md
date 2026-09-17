# M5 批次 B1「Dialog 头部契约与断点宽度」改动前基线

本记录为[响应式设计 §4](../responsive.md) 断言 4（桌面无回归）与 M5-2「未传 `breakpoints` 时行为与现状一致」提供可提交的改动前基线。原始 JSON 与取证脚本落 `test-results/m5-b1/`（gitignored，供复现）。

## 1. 取证环境

| 项 | 值 |
| --- | --- |
| 基线 revision | `37da558`（M4 收口，独立 worktree `/tmp/opencode/caomei-head` 检出） |
| 改动后 | 工作区（M5-1 / M5-2） |
| 被测对象 | `test/e2e/fixtures` 夹具的 `src/` 源码（Vite dev，非构建产物），`CaomeiDialog` 默认对话框（`#wrap-dialog-footer`，未传 `breakpoints`） |
| 视口 | 390×844 / 768×1024 / 1280×800 |
| 运行期 | Chromium（Playwright），`reducedMotion: 'reduce'`，`--no-sandbox --no-zygote --disable-dev-shm-usage` |
| 取证脚本 | `test-results/m5-b1/measure.mjs`（工作区与基线 worktree 各跑一次） |
| 原始数据 | `test-results/m5-b1/baseline.json` / `current.json` |

## 2. 改动前 vs 改动后（默认对话框，未传 `breakpoints`）

逐视口比较 18 个字段（`width` / `height` / `x` / `right` / `cssWidth` / `cssMaxWidth` / `borderRadius` / `padding` / `backgroundColor` / `color` / `boxShadow` / `fontSize` / `headerCount` / `closeCount` / `styleTagCount` / `overlayCount` / `referenceTopDelta` / `cls`）：

| 视口 | 面板宽（改前 → 改后） | 计算样式与结构字段 |
| --- | --- | --- |
| 390×844 | 358px → 358px | 18 / 18 字段一致 |
| 768×1024 | 480px → 480px | 18 / 18 字段一致 |
| 1280×800 | 480px → 480px | 18 / 18 字段一致 |

**结论**：共 54 项逐字段比较零差异；未传 `breakpoints` 时默认对话框的几何与计算样式与改动前完全一致（新增的 `<style>` 元素仅在存在有效断点条目时渲染，`styleTagCount` 两侧同为 0）。改动前基线数值（供后续批次参考）：390 → `358×borders`、768 / 1280 → `480px`；`border-radius: 12px`、`padding: 16px`、亮色 `background: rgb(255,255,255)` / `color: rgb(26,26,26)`。

## 3. 断点生效实测（改动后，M5-2）

夹具配置 `{ '1199px': '85vw', '575px': '95vw' }`，三档验收视口分别命中「不命中（回退 `lg`）/ 1199 档 / 575 档（最窄档）」：

| 视口 | 命中档 | 面板宽实测 | 面板 `x` / `right` | 视口内 |
| --- | --- | --- | --- | --- |
| 390×844 | 575 档 | 370.5px（95vw） | 9.75 / 380.25 | 是（≤390） |
| 768×1024 | 1199 档 | 652.8px（85vw） | 57.6 / 710.4 | 是（≤768） |
| 1280×800 | 无（回退 `lg`） | 640px（`min(90vw, 640px)`） | 320 / 960 | 是（≤1280） |

- 390 档是**层叠承重路径**的判别点：组件静态收敛规则 `@media (width <= 640px)` 给出 `calc(100vw - 2 × space-4)` = 358px，注入的 575 档规则必须胜出才得 370.5px；实测 370.5px，证明「面板内 `<style>` 源序晚于 head 内 scoped 样式」的 tie-break 成立（见[设计规范 §7](../design-spec.md)）。
- 注入样式内容（各视口一致，实例 id 随实例分配）：
  `@media (width <= 1199px) { .caomei-dialog__content[data-caomei-dialog-breakpoint="…"] { width: 85vw; } }` + `@media (width <= 575px) { …{ width: 95vw; } }`（窄档在后）。

## 4. 已知边界

- 断点键 / 值经安全长度校验（键须 px、值须受限 CSS 长度），非法条目静默忽略；断点规则的实例选择器与 scoped 基线同为 (0,2,0)，下游需以更高特异性或 `!important` 覆盖（已登记[设计规范 §7](../design-spec.md)）。
- 面板内 `<style>` 要求消费方 CSP `style-src` 允许内联样式。
- 本轮无头 Chromium 的布局视口滚动条宽为 0，`vw` 与 `window.innerWidth` 同源，故 85vw / 95vw 的实测值与视口宽严格成比例；真实桌面滚动条会同时收窄两者，比值不变。
- 视觉理解通道不可用，本轮为几何 / 计算样式 / ARIA 断言，未做逐像素比对。

## 5. 复现命令

```sh
# 常驻用例（三档视口，含本批新增断点 / 无头部用例）
pnpm test:e2e

# 基线 / 改动后逐字段测量（需先起夹具 dev server）
node test-results/m5-b1/measure.mjs http://127.0.0.1:4501/ current test-results/m5-b1/current.json
```

> `test-results/` 已 gitignore；本记录只保留可判定的数值与结论，原始 JSON 供人工复核。
