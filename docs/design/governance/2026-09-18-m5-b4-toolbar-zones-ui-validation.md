# M5 批次 B4（M5-7）「Toolbar 三分区插槽」浏览器验证记录

**批次**：M5-7（`#start` / `#center` / `#end` 三分区插槽）——[待办事项](../../plan/todo.md) M5 批次 B4（本批仅交付 M5-7，M5-9 未启动）。
**结论：通过** —— 文档站（Vite dev，当前源码）在桌面 / 窄屏 390 / 暗色三态实测：三分区按 `start → center → end` 顺序渲染、`start` 贴主轴起点、`end` 贴主轴末端、中区落在两者之间的剩余空间中部（实测中区区间中心 ＝ 两侧边界中点）、三区垂直居中，页面与工具条均无横向溢出，console error / pageerror **0**；未使用分区插槽的默认路径**零回归**（无分区包裹层、根计算样式与改造前声明值逐项一致）。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | 文档站 `docs/`（Vite dev，源码态；含本批新增示例 `toolbar/zones.vue`） |
| 入口 | `http://localhost:5173/components/toolbar` |
| 视口 | 1280×900（桌面）/ 390×844（md 档内）/ 暗色（桌面） |
| 运行期 | Chromium（Playwright），root 容器补 `--no-sandbox` / `--no-zygote` / `--disable-dev-shm-usage` |
| 一次性脚本 | `test-results/m5-b4-toolbar-ui-check.mjs`（结构与几何，原样输出 JSON 到 `test-results/m5-b4/report.json`，含 `zones.rects` 各区矩形）、截图 `test-results/m5-b4/*.png`（均 gitignored） |
| 视觉通道 | 推理通道不可用；改用**本地 OCR** 确认文案渲染 + 结构 / 计算几何断言，**未做逐像素比对** |

## 2. 三分区渲染位置（M5-7 主判据）

演示为 `#start`（3 个图标按钮 + 1 条分隔线）/ `#center`（文本「已自动保存」）/ `#end`（1 个图标按钮），示例自身设 `width: 100%` 以展示三区铺满（组件默认内容宽度）。三态（桌面 / 390 / 暗色）逐项一致：

| 断言 | 结果 |
| --- | --- |
| 分区容器数量与顺序 | 3 个，`caomei-toolbar__start` → `caomei-toolbar__center` → `caomei-toolbar__end` |
| `start` 内容位于 `center` 左侧 | 通过 |
| `center` 内容位于 `end` 左侧 | 通过 |
| `end` 贴右（右边界距根右边界 ≤ 8px，实测 5px＝1px 边框 + 4px 内边距） | 通过 |
| 三区垂直居中（区中心与根中心偏差） | `[0, 0, 0]` |
| 内容完整（3 按钮 / 1 分隔线 / 3 图标 / 1 按钮；中区文本「已自动保存」） | 通过 |
| 页面横向溢出 / 工具条越出视口 | `0` / 无 |

桌面实测矩形（示例工具条，根 `width: 100%` → 582px；数值取自产物 `report.json` 的 `zones.rects`）：根 `x=357 / right=939`（`centerX` 648）；`start` `362–483`；`center` `487–894`（`centerX` 产物取整记 691，区间中点 `(487+894)/2 = 690.5`）；`end` `898–934`。中区区间中点 690.5 ＝ `start` 右边界 483 与 `end` 左边界 898 的中点，即「`start` 贴主轴起点、`end` 贴主轴末端、中区落在两者之间的剩余空间中部」——与 `docs/components/toolbar.md` / §7 的登记口径（含「本库以中区 `flex: 1` 实现该排布」）逐字对应；RTL / 垂直方向按主轴语义解析（文档已注明）。

## 3. 默认路径零回归（无插槽时保持现有布局）

| 断言 | 结果 |
| --- | --- |
| 分区包裹层数量 | `0`（`.caomei-toolbar__start` / `__center` / `__end` 均不渲染） |
| 根计算样式 | `display: inline-flex`、`flex-direction: row`、`gap: 4px`、`padding: 4px`、`flex-wrap: nowrap`、`align-items: center` |
| 语义属性 | `role="toolbar"`、`aria-orientation="horizontal"` |
| 成员 | 5 个直接子节点（按钮 / 分隔线 / 链接），无包裹层插入 |

对照改造前 `toolbar.vue` 的声明值（`display: inline-flex`、`align-items: center`、`gap/padding` 取 `--caomei-toolbar-gap` / `--caomei-toolbar-padding` 默认 `--caomei-space-1` ＝ 4px、未声明 `flex-wrap` 即 `nowrap`）**逐项一致**；本批新增的 CSS 规则全部以 `.caomei-toolbar__start` / `__center` / `__end` 为选择器，默认路径不渲染这些元素，故其计算样式不可能被新规则命中。

## 4. 暗色与窄屏

- 暗色：三区结构、顺序、相对位置、垂直居中与桌面一致；`darkModeApplied = true`；截图 `test-results/m5-b4/dark-zones.png`。
- 窄屏 390：三分区与默认路径均无横向溢出（`docOverflow = 0`、工具条无越出视口）；≤768px 时根与各分区容器各自允许换行，单个分区先撑出的情况已由分区级 `flex-wrap` 兜住。

## 5. 单元测试覆盖（与本节结论互补）

除本记录的结构 / 几何实测外，`toolbar.test.ts` 另以 22 例锁定：三分区包裹层的数量与顺序、各区内容归属、仅 `#start` 时仍渲染三分区、**默认插槽与分区插槽并存时默认内容不渲染**、**方向键漫游可跨越分区包裹层按 DOM 顺序移动**（从 `start` 区第 1 项 → 第 2 项 → `end` 区第 1 项）、垂直方向的类与分区渲染、未使用分区插槽时根的直接子节点数量与类型不变。

## 6. 未覆盖边界与后续

- 视觉推理通道不可用，未做像素级比对；结论以结构 / 计算几何 / OCR 三元证据替代。
- 未对「使用分区插槽 + 竖直方向」与 RTL 做浏览器实测（已由单测覆盖分区容器渲染与垂直方向类；RTL 的左右互换未实测）；如需像素级确认可补。
- 本记录为一次性实测，未新增常驻 E2E 用例（沿用 M5 B1 / B2 / B3 的「常驻覆盖既有形态、一次性覆盖新特性」口径）。
- 迁移提示（已登记 §7 与组件页）：本库工具条为**内容宽度**（`inline-flex`），PrimeVue 为块级（撑满容器）；需要三区铺满容器时设 `width: 100%`。
