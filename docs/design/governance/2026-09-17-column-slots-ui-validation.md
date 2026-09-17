# DataTable 列插槽（Phase 7 第二阶段 M3）浏览器验证

- 日期：2026-09-17（首轮 + 复验轮同日）
- 范围：DataTable 新增的按列 key 命名作用域插槽 `#cell-{key}`（作用域 `{ row, value, index, column }`）与 `#header-{key}`（作用域 `{ column }`）的 **V 阶段**浏览器验证——文档站中英 DataTable 组件页「列插槽 / Column slots」章节示例的真实渲染、插槽作用域、排序与插槽共存、无插槽列默认路径、响应式、暗色与宿主稳定性。
- 依据：[开发规范](../../standards/development.md)、[测试规范 §5](../../standards/testing.md)、UI 验证 skill（`.github/skills/ui-validator/SKILL.md`）与浏览器验证实操手册（`.github/skills/ui-validator/references/browser-cookbook.md`）。
- 被测对象：工作区未提交 diff；基线 commit `5a43d53`。核心改动 `src/components/data-table/data-table.vue`（`hasColumnSlot` 判定与两个 `<slot>` 分支，mtime 17:53）、`src/components/data-table/types.ts`（`DataTableCellSlotProps` / `DataTableHeaderSlotProps`）、文档站示例 `docs/examples/data-table/column-slots.vue` 与英文镜像 `docs/i18n/en-US/examples/data-table/column-slots.vue`（**复验轮 mtime 18:05，`#cell-owner` 已移除 `index + 1` 序号**）、中英 DataTable 组件页正文（mtime 18:05，补充 `index` 语义说明）。
- 结论：**通过**（两轮）——首轮核对项 48 条全过、失败 0、观察项 2（O1 / O2）；**复验轮**（2026-09-17，O1 示例修正后）核对项 25 条全过、失败 0、console error / pageerror 0，O1 **已消解**、O2 维持。主目标（文档站示例渲染）与次目标（排序与插槽共存）均已覆盖。

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | 工作区未提交 diff（基线 `5a43d53`）；首轮 `docs/.vitepress/dist` 构建于 17:56、复验轮构建于 18:06；两轮的验证窗口内均未修改 `src/**`（实现冻结）；复验轮前调用方已修正示例与组件页文案，该改动已包含在 18:06 重新构建的产物内 |
| 入口 / 产物 | `pnpm docs:build` 产物 + `pnpm exec vitepress preview docs --port 4173`（`http://127.0.0.1:4173`） |
| 浏览器 | Chromium **153.0.8010.12**（`@playwright/test` 1.63.0 headless，`--no-sandbox --disable-dev-shm-usage`） |
| 页面（中文） | `/components/data-table` |
| 页面（英文） | `/en-US/components/data-table` |
| 示例定位 | 该页 `.demo-row` 计数为 **0**（当前 demo 插件不产出该 class），改用内容锚点「负责人（按顺序）」定位 `.vitepress-demo-plugin__container` 索引 **2**，并断言容器总数 9 与页面 demo 数一致 |
| 断点 | 桌面 1440×900 / 平板 834×1112 / 移动 390×844 |
| 主题 | 亮色 / 暗色（`emulateMedia('dark')` + 站点 `vitepress-theme-appearance=dark`） |
| 动效 | 不适用（本批无动画改动） |
| 视觉通道 | 图像理解通道不可用（OPENAI 兼容通道 HTTP 400）；改用本地 RapidOCR 复核截图文字层，**未做逐像素比对** |

## 1. 主目标：中英文档页示例渲染（断言点 1~5）

示例数据：中文 `张三/李四`、状态 `已完成/进行中`、标题 `迁移 DataTable / 补齐图标映射`；英文 `Alice/Bob`、`Done/Running`、`Migrate DataTable / Fill icon mapping`。

| # | 断言点 | 期望 | 实测 | 结果 |
| --- | --- | --- | --- | --- |
| 1 | `#cell-status` 渲染 `CaomeiTag` | 状态列 `td` 内为 `.caomei-tag`，非默认取值文本 | 张三行 `caomei-tag caomei-tag--primary caomei-tag--soft caomei-tag--md`（进行中）；李四行 `--success`（已完成）；Tag 尺寸 68×36 > 0 | 通过 |
| 1 | 语义色 | primary / success 计算色不同 | 亮色 `rgb(37, 99, 235)`（primary）vs `rgb(21, 128, 61)`（success） | 通过 |
| 2 | `#cell-owner` 作用域 `row`（**复验轮更新**，示例已移除 `index + 1`） | `张三` / `李四`（无 `1.` / `2.` 序号前缀） | `"张三"` / `"李四"`（`td` 无子元素，纯文本插值；首轮为 `"1. 张三"` / `"2. 李四"`，已由复验轮取代） | 通过 |
| 3 | `#header-owner` | 表头为 `负责人（按顺序）`，且**不是**排序按钮 | `<th>` 直接子元素为 `<em>负责人（按顺序）</em>`；无 `button`，`aria-sort` 属性不存在 | 通过 |
| 4 | 排序与插槽共存 | `title` 表头仍是排序按钮；点击后 `aria-sort` 由 `none` → `ascending` | `button.caomei-data-table__sort` 内文本 `任务`，初始 `aria-sort="none"`；点击后 `"ascending"`；`owner` 插槽表头不受影响，`status` 表头仍为默认文本 `状态` | 通过 |
| 5 | 无插槽列默认路径 | `title` 单元格仍为默认取值纯文本 | `迁移 DataTable`（无子元素、无 Tag）；排序后仍全部纯文本 | 通过 |
| 5 | 无插槽列表头默认路径 | `status` 列表头不被替换 | `状态`（无 `<em>` / 无插槽标记） | 通过 |

英文镜像页同口径（**复验轮更新**）：`Owner (in order)`（无按钮）、`Running/primary` + `Done/success`、`Alice` / `Bob`（无序号前缀）、`Task` 仍为排序按钮且 `aria-sort="none"`——全部通过。

## 2. 次目标：排序交互与插槽共存

| 检查 | 期望 | 实测 | 结果 |
| --- | --- | --- | --- |
| 点击排序生效 | `aria-sort` 变化 | `none` → `ascending` | 通过 |
| 行重排 | 排序后行序变化 | `["补齐图标映射","迁移 DataTable"]`（升序） | 通过 |
| 插槽不被排序破坏 | `owner` 表头仍为 `<em>`、`status` 仍默认 | 同排序前 | 通过 |
| 排序后 owner 行归属（**复验轮更新**） | 排序后每行仍为自身 owner（`title↔owner` 映射不变），无序号前缀 | `[{"title":"补齐图标映射","owner":"李四"},{"title":"迁移 DataTable","owner":"张三"}]`（升序行序变化，但归属正确） | 通过（O1 已消解） |

## 3. 响应式

| 断点 | 页面横向溢出 | 表格容器右缘 | 插槽内容 |
| --- | --- | --- | --- |
| 移动 390×844 | `scrollWidth=390 / clientWidth=390`（无溢出） | `rootRight=345.0 ≤ 390` | Tag 与 `张三` 完整（复验轮复核） |
| 平板 834×1112 | `scrollWidth=834 / clientWidth=834` | `rootRight=740.0 ≤ 834` | 完整 |
| 桌面 1440×900 | 无溢出 | 容器内 | 完整 |

移动端表格根容器 `overflow-x: auto` 生效（`scrollWidth 326 ≥ clientWidth 300`），横向滚动在容器内收敛，页面级无溢出。移动端 OCR 文字层复核：`迁移 DataTable` 在窄列换行为两行，未截断；负责人表头 `th` 实测 `scrollWidth == clientWidth == 136`（无裁切）。

## 4. 暗色主题

| 检查 | 期望 | 实测 | 结果 |
| --- | --- | --- | --- |
| 主题生效 | `html.dark` | `htmlClass="dark"`，`appearance="dark"` | 通过 |
| Tag 可见 | 宽高 > 0、tone 不变 | `primary` / `success`，68×36 | 通过 |
| 对比度 | ≥ 4.5:1（AA 正常文本） | primary `5.56:1`（`rgb(96,165,250)`）、success `7.16:1`（`rgb(74,222,128)`） | 通过 |
| 正文可读 | 非深色 | `rgb(245, 245, 245)` | 通过 |

暗色截图 OCR 完整识别（复验轮重采样）：`任务 / 状态 / 负责人（按顺序） / 迁移DataTable / 进行中 / 张三 / 补齐图标映射 / 已完成 / 李四`（置信度 0.991），无「被背景吞掉」的文本；Tag tone 仍为 `primary` / `success`（示例文本改动未触碰样式，首轮对比度 primary `5.56:1` / success `7.16:1` 结论不变）。

## 5. 可访问性抽检

| 检查 | 期望 | 实测 | 结果 |
| --- | --- | --- | --- |
| 排序按钮可聚焦 | 焦点落在 `button.caomei-data-table__sort` | `document.activeElement.className = "caomei-data-table__sort"` | 通过 |
| 键盘可达 | Enter 切换排序 | `aria-sort` 由 `ascending` → `descending` | 通过 |
| 非排序列语义 | `owner` 表头无可聚焦交互元素 | `tabIndex=-1`、无 `button` | 通过 |
| 表头语义 | `<th scope="col">` | 中英页均使用语义化表格 | 通过 |

## 6. 宿主稳定性

本批无浮层 / portal 组件，按轻量口径采集交互（点击排序 + 键盘排序）前后的宿主指标。

| 指标 | 交互前 → 后 | 判据 | 结果 |
| --- | --- | --- | --- |
| `documentElement.clientWidth` | `1440 → 1440`（delta 0） | delta = 0 | 通过 |
| `.vp-doc h1` 文档坐标 top | delta 0 | `|delta| ≤ 0.5` | 通过 |
| 目标示例容器文档坐标 top | delta 0 | `|delta| ≤ 0.5` | 通过 |
| 滚动条异常 | 无变化 | 无横向 / 纵向滚动条突变 | 通过 |
| CLS | `0.0136` | ≤ 0.1（good 阈值） | 通过 |

CLS 归因：layout-shift 来源为 VitePress 主题 hydrate 时的 `.container`（`x=32/w=1376 → x=0/w=1440`）与 `.divider-line`（顶栏分隔线宽度变化）；同一采集在 `/components/button.html` 得到**完全相同**的 `0.0136` 与同一来源，且 `clientWidth` 与 in-flow 文档坐标无位移，判定**与本次 DataTable 变更无关**。

## 7. console / pageerror / 网络

| 项 | 计数 | 期望 | 结果 |
| --- | --- | --- | --- |
| console error（含 pageerror） | 0 | 0 | 通过 |
| console warning | 0 | — | 通过 |
| HTTP ≥ 400 | 0 | 0 | 通过 |

## 8. 观察项（非阻断）

| 编号 | 观察 | 归因 | 处置 |
| --- | --- | --- | --- |
| O1 | 示例用 `index + 1` 作显示序号；排序后 owner 前缀随源数据索引呈现 `2.` 在前（`["2. 李四","1. 张三"]`） | 本次变更（示例用法）：作用域 `index` 取 `row.index`（TanStack 源数据索引），与 `cell` 函数上下文一致 | **已消解（2026-09-17，示例修正）**：示例 `#cell-owner` 改为只解构 `{row}` 并直接输出 `row.owner`，去掉序号；中英组件页「列插槽」说明块补充「`index` 是数据源行索引，排序后不随显示位置变化，要显示序号请按渲染顺序自行计算」。复验轮实测 owner = `张三/李四`（英文 `Alice/Bob`），排序后每行仍为自身 owner，无前缀 |
| O2 | VitePress 主题 hydrate 期存在 `0.0136` 的站点级 CLS（`.container` / `.divider-line`） | 上游（VitePress 主题）：非本批引入，`/components/button.html` 同值复现 | 不计缺陷，沿用既有基线记录 |

## 9. 未覆盖边界与视觉通道声明

- **视觉通道不可用**：图像理解通道（OPENAI 兼容 `qwen3.7-plus`）返回 HTTP 400，无法做图像推理；本地 RapidOCR 对 5 张截图文字层复核通过（置信度 0.989~0.996）。本记录**未做逐像素比对**，**不宣称视觉通过**，仅声明「截图文字层 + 计算样式 + 几何断言一致」。
- 未在文档示例中覆盖「**可排序列同时提供 `#header-{key}`**」的路径（示例 `title` 未提供表头插槽）。该分支由单测覆盖（`src/components/data-table/data-table.test.ts` 用例「`#header-{key}` 插槽在可排序列中保留排序按钮」断言插槽位于排序按钮内部），**未在真实浏览器验证**。
- 未验证 `key` 拼写错误时的静默回退（文档已声明不做键校验，示例无错误 key）。
- 未做真实屏幕阅读器（VoiceOver / NVDA）与触摸手势实测，仅做 DOM 属性、计算样式与键盘抽检。
- 仅在 Chromium 验证，未覆盖 Firefox / WebKit 引擎差异。
- 未验证 `cell` 函数与同名列插槽同时存在时的优先级视觉差异（单测覆盖，示例未构造该组合）。

## 10. 复验轮（2026-09-17，O1 示例修正后）

- 触发：首轮观察项 O1（示例以 `index + 1` 作显示序号）被调用方采纳并修正——`#cell-owner` 去掉序号，两页「列插槽」说明块补充 `index` 语义（`docs/examples/data-table/column-slots.vue` 与英文镜像 mtime 18:05；`docs/components/data-table.md` 与英文镜像 mtime 18:05）。**复验轮内本验证窗口未修改 `src/**` 与 `docs/components/**`**（上述文案改动由调用方在复验前完成，已包含在复验轮产物中）。
- 范围（定向，非全量 48 项）：断言 2 期望值更新、排序后无错位序号、断言 1 / 3 / 4 / 5 未回归、console / pageerror 计数、两页可达性；另重采样移动 390 与暗色以刷新受影响实测值。
- 入口：`pnpm docs:build`（18:06 产物）+ `vitepress preview` 4173；脚本 `test-results/column-slots-recheck.mjs`（25 项）。

| 分组 | 核对项 | 结果 | 关键实测 |
| --- | --- | --- | --- |
| 可达性 | 中 / 英页「列插槽」示例正常渲染 | 通过 | 容器总数 9、表格存在、锚点命中索引 2 |
| ② owner（更新） | 中文页无序号前缀 | 通过 | `["张三","李四"]`；`/^\d+\.\s/` 不命中 |
| ② owner（更新） | 英文页无序号前缀 | 通过 | `["Alice","Bob"]` |
| ② 排序后（更新） | 每行仍为自身 owner | 通过 | `[{"title":"补齐图标映射","owner":"李四"},{"title":"迁移 DataTable","owner":"张三"}]` |
| ② 排序后（更新） | 行序确实变化且无前缀 | 通过 | 行序 `["补齐图标映射","迁移 DataTable"]`；owner `["李四","张三"]` |
| ① Tag（未回归） | tone 与文案 | 通过 | 中 / 英 / 移动 / 暗色：`primary`「进行中」、`success`「已完成」（英文 `Running` / `Done`） |
| ③ header（未回归） | 表头替换且非按钮 | 通过 | `负责人（按顺序）` / `Owner (in order)`，无 `button` / 无 `aria-sort` |
| ④ 排序（未回归） | `aria-sort` 切换 | 通过 | `none → ascending` |
| ④ / ⑤ 默认路径（未回归） | 无插槽列不受影响 | 通过 | title 单元格 `迁移 DataTable` 纯文本；status 表头 `状态` |
| ① 移动 390 | 无横向溢出 + owner 无前缀 | 通过 | `scrollWidth=390=clientWidth`；`["张三","李四"]` |
| ⑨ 暗色（重采样） | owner 无前缀 / tone / `html.dark` | 通过 | `["张三","李四"]`；`primary` / `success`；`html.dark` 生效 |
| ⑧ console | error / pageerror 计数 | 通过 | 0 / 0 |
| 视觉文字层 | 4 张复验截图 OCR | 通过 | 中（未排序 / 排序后）/ 英 / 移动 / 暗色均无 `数字.` 前缀；排序后 `李四` 对应 `补齐图标映射`、`张三` 对应 `迁移 DataTable` |

- 结论：**复验通过**——25 项全过、失败 0、console error / pageerror 0；**O1 已消解**，O2 维持（示例与文档改动不涉及主题 / 宿主，未复测且不受影响）。
- 取代关系：本节结论**取代**首轮 §1 断言 2、§2「排序后 owner 行归属」两条的实测值；§3 / §4 的示例文本样例已按本轮重采样刷新；其余章节保持首轮结论。
- 视觉通道声明同首轮：图像理解通道不可用，仅 RapidOCR 复核截图文字层（本轮 4 张，置信度 0.988~0.996），**未做逐像素比对**。

## 复现方式

```bash
pnpm docs:build
pnpm exec vitepress preview docs --port 4173
node test-results/column-slots-validate.mjs   # 首轮 48 项
node test-results/column-slots-recheck.mjs    # 复验轮 25 项（O1 修正后）
```

产物（gitignored，仅作原始留痕）：

- 首轮：`test-results/column-slots-validate.mjs`、`column-slots-validation.md`、`column-slots-report.json`、`column-slots-{zh-desktop-light,zh-desktop-light-sorted,en-desktop-light,zh-mobile-390-light,zh-desktop-dark}.png`
- 复验轮：`test-results/column-slots-recheck.mjs`、`column-slots-recheck.md`、`column-slots-recheck.json`、`column-slots-recheck-{zh-unsorted,zh-sorted,en-unsorted,zh-mobile-390,zh-desktop-dark}.png`

## 截图清单

首轮：

- `column-slots-zh-desktop-light.png`：中文页列插槽示例（亮色桌面）
- `column-slots-zh-desktop-light-sorted.png`：点击 `title` 表头升序后（行重排、插槽保持一致）
- `column-slots-en-desktop-light.png`：英文页列插槽示例（`Owner (in order)` / `Alice` / `Bob`）
- `column-slots-zh-mobile-390-light.png`：中文页移动 390×844（表格容器内滚动、无页面溢出）
- `column-slots-zh-desktop-dark.png`：中文页暗色（Tag 与表格可读）

复验轮（示例修正后，owner 列已无序号前缀）：

- `column-slots-recheck-zh-unsorted.png`：中文页列插槽示例（未排序）
- `column-slots-recheck-zh-sorted.png`：点击 `title` 升序后（`李四` 对应 `补齐图标映射`、`张三` 对应 `迁移 DataTable`）
- `column-slots-recheck-en-unsorted.png`：英文页列插槽示例（`Alice` / `Bob`）
- `column-slots-recheck-zh-mobile-390.png`：中文页移动 390×844（无页面溢出）
- `column-slots-recheck-zh-desktop-dark.png`：中文页暗色（owner 无前缀、Tag tone 不变）

## 交接

- 结论 **Pass**（首轮 + 复验轮），可交 `@test-engineer` 补自动化断言（浏览器层建议覆盖：状态列 Tag tone 与文案、owner 行归属（无序号前缀）、`#header-{key}` 插槽渲染与排序共存；可考虑 Playwright E2E 常驻），或直接进入 Review Gate 收口。
- 观察项 **O1 已消解**（示例 `#cell-owner` 改为只解构 `{row}` 并直接输出 `row.owner`，文档补充 `index` 语义）；O2 维持既有站点基线。
