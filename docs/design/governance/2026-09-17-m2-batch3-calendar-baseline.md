# M2 批次 3（含日历面板）改动前基线与收敛记录

- 日期：2026-09-17
- 范围：DatePicker 的 portal 面板与内联 Calendar 的窄屏尺寸表现（[响应式设计 §3 矩阵 #6](../../design/responsive.md)）
- 依据：[响应式设计 §2 断点语义 / §3 矩阵 #6 / §4 验收标准](../../design/responsive.md)、[测试规范 §5 / §7](../../standards/testing.md)
- 被测对象：`src/components/date-picker/date-picker.vue`（portal 面板）、`src/components/calendar/*`（内联形态）
- 取证方式：`test-results/m2-batch3/baseline.mjs`（与 `playwright.config.ts` 的设备描述符同源）——覆盖三档验收视口 + 窄 / 矮 / 极窄合成探针，并在同一面板上注入 `max-height: none` 复现「无上限」对照
  - 复现命令：`node test-results/m2-batch3/baseline.mjs after`（输出 `baseline-after.json` 与 stdout 数值表）
  - `baseline-before.json` 为**改动前 revision 的快照**（改动后无法复现，保留作对照）；脚本与 JSON 在 gitignored 的 `test-results/`，关键数值已落本记录（可提交）
  - 说明：§3 纵向对照与窄 / 矮探针的**可复现载体是上述脚本本身**（gitignored，脚本内含注入对照分支与 `cssMaxHeight` 采集），本记录只落结论数值——复核时需按上一行的命令重跑，脚本不会随提交进入版本库。
- 常驻用例：`test/e2e/responsive.e2e.ts` 的「含日历面板」（2 例）、「含日历面板：可用宽上限生效路径」（2 例）与「内联日历」（1 例）

## 1. 改动前基线（面板 `max-width` / `max-height` 均为 `none`，`overflow-x/y: visible`）

**横向**（`baseline-before.json`）：

| 视口 | innerWidth | 面板 w×h | 面板 left / right | 触发器宽 | 内联日历 | 页面横向溢出 |
| --- | ---: | --- | --- | ---: | --- | ---: |
| mobile 390 | 390 | 224×239 | 24 / 248 | 320 | 198×213 | 0 |
| mobile 390（右缘窄触发器 120） | 390 | 224×239 | 166.18 / **390.18** | 120 | — | 0 |
| mobile 320 | 320 | 224×239 | 24 / 248 | 272 | 198×213 | 0 |
| 合成探针 280 | 280 | 224×239 | 24 / 248 | 232 | 198×213 | 0 |
| 合成探针 240 | 240 | 224×239 | 16 / 240 | 192 | 198×213 | 0 |
| 合成探针 200 请求（布局视口 222） | 222 | 224×239 | 0 / **224** | 152 | 198×213 | **22** |
| tablet 768 | 768 | 224×239 | 24 / 248 | 320 | 198×213 | 0 |
| tablet 768（右缘） | 768 | 224×239 | 544 / 768 | 120 | — | 0 |
| desktop 1280 | 1280 | 224×239 | 24 / 248 | 320 | 198×213 | 0 |
| desktop 1280（右缘） | 1280 | 224×239 | 1056 / 1280 | 120 | — | 0 |

**纵向**（同页 `max-height: none` 对照，`--reka-popover-content-available-height` 小于面板高时无收敛）：

| 视口 | 可用高 | 面板高 / bottom | innerHeight | 越界 |
| --- | ---: | --- | ---: | ---: |
| 390×844 | 560px | 239 / 560 | 844 | 0 |
| 390×640 | 560px | 239 / 560 | 640 | 0 |
| 390×500 | 226px | 239 / **513** | 500 | **13px** |
| 390×420 | 186px | 239 / **473** | 420 | **53px** |
| 200×420（探针） | 378px | 239 / 378 | 467 | 0 |

> 表中 `innerWidth` 为运行期 `window.innerWidth`；合成探针 200 请求档下移动端 emulate 会把布局视口扩张到 222（内容宽下限），而文档可用宽 `documentElement.clientWidth` 为 200——页面横向溢出的 22px 即两者之差（溢出源为内联日历右缘 222）。

**改动前判定**：

- 面板内容定宽定高（`width: max-content`，实测 224×239，单月日历），**无可用空间上限**（计算 `max-width` / `max-height` 均为 `none`）。
- 横向在 390 / 768 / 1280 与 320 / 280 / 240 探针下均在视口内——由 floating-ui 的 shift（`align="start"` 的碰撞收敛）保证，而非 CSS 上限；右缘用例在 390 档出现 **0.18px 亚像素越界**。
- **纵向在极矮视口越出视口**：可用高（226px / 186px）已小于面板高（239px），但无 `max-height` 上限 → 面板底部越出 13px / 53px（内容因此不可见且无替代路径）。
- 布局视口 222px 时面板 `right = 224` 越出 2px；该档页面横向溢出 22px 由**内联日历**的内容宽（198px + 间距）撑出，与面板无关（见 §5 已知边界）。

## 2. 改动内容

`.caomei-date-picker__content` 增加可用空间上限（两轴）与滚动降级通道（与批次 1 的浮层面板收敛同源）：

```css
max-width: var(--reka-popover-content-available-width, none);
max-height: var(--reka-popover-content-available-height, none);
overflow: auto;
```

- 两个变量均由 Reka `PopoverContentImpl` 写入（`node_modules/reka-ui/dist/Popover/PopoverContentImpl.js:151-152`），回退 `none` 保持原行为；批次 1 的 Select 家族与 ColorPicker 已用同一来源的 `--reka-popover-content-available-width`。
- 上限只在「可用空间 < 内容尺寸」时生效；生效时 `overflow: auto` 让内容可滚动可达（响应式设计 §2 降级原则：信息可被收纳进滚动容器，但不得无替代路径）。
- 选 `overflow: auto`（双轴）而非 `auto hidden`：纵向裁切会静默丢弃内容，而 `overflow-y: visible` 与 `overflow-x: auto` 组合按规范会被计算为 `auto`，达不到「纵向不裁」的意图。

## 3. 改动后复测（与基线逐项对照）

**横向**：

| 视口 | 面板 w | 计算 `max-width` | 计算 `overflow-x` | 面板 scrollW/scrollH vs clientW/clientH | 几何变化 |
| --- | ---: | --- | --- | --- | --- |
| mobile 390 / 320 / 探针 280 / 240 | 224 | 390 / 320 / 280 / 240px | auto | 222 / 237 = 222 / 237（无滚动条） | 无（仅上限与溢出计算值） |
| mobile 390（右缘） | 224 | 390px | auto | — | 无（right 390.18，亚像素维持） |
| tablet 768（含右缘） | 224 | 768px | auto | 222 / 237 = 222 / 237 | 无 |
| desktop 1280（含右缘） | 224 | 1280px | auto | 222 / 237 = 222 / 237 | 无 |
| 探针 200 请求（布局视口 222） | **200**（改前 224） | 200px | auto | 内容仍可达（滚动通道 auto） | 越界消除（right 224 → 200） |
| 内联 Calendar（全部视口） | 198 | none | visible | 198 / 213 = 198 / 213 | 无（本批不改内联形态） |

**纵向**（同页 `max-height: none` 注入对照）：

| 视口 | 有上限：面板高 / bottom | 无上限（对照）：面板高 / bottom | 结论 |
| --- | --- | --- | --- |
| 390×844 | 239 / 560 | 239 / 560 | 上限不生效，几何一致 |
| 390×640 | 239 / 560 | 239 / 560 | 同上 |
| 390×500 | **226 / 500**（scrollH 237 > clientH 224，内部可滚） | 239 / 513（越出 13px） | 越界消除 + 内容可达 |
| 390×420 | **186 / 420**（scrollH 237 > clientH 184） | 239 / 473（越出 53px） | 同上 |
| 200×420（探针） | 239 / 378 | 239 / 378 | 上限不生效，几何一致 |

**桌面 1280 计算样式快照（断言 4 的基线参考；改动前后除上限制外逐项一致）**：

| 元素 | box-sizing | width | max-width | max-height | overflow | 几何 |
| --- | --- | --- | --- | --- | --- | --- |
| `.caomei-date-picker__content` | border-box | 224px | 1280px（改前 `none`） | 324px（改前 `none`） | auto（改前 `visible`） | 224×239 |
| `.caomei-date-picker__content .caomei-calendar` | border-box | 198px | none | none | visible | 198×213 |
| `.caomei-date-picker`（触发器） | border-box | 320px | none | none | visible | 320×36 |
| `.caomei-calendar`（内联） | border-box | 198px | none | none | visible | 198×213 |
| `.caomei-calendar__grid` | border-box | 198px | none | none | visible | 198×177 |

结论：**1280×800 下除「上限制」本身外，几何与计算样式与改动前逐项一致**；面板与日历均无内部滚动条。

## 4. 常驻用例（本批新增 5 例，三档视口共 15 次）

| 用例 | 断言 |
| --- | --- |
| DatePicker / 右缘窄触发器：面板落在视口内、带可用空间上限且内容完整 | `expectInsideViewport`（§4 断言 2）+ 面板无横向溢出 + `expectPanelSizeCapped`（两轴计算上限均不为 `none`、`overflow` 两轴均可滚动）+ 面板内容（日历）完整落在面板 client rect 内 |
| 极窄视口探针：面板收敛到可用宽 | 前置守卫「内容宽 > 收敛后宽度」（上限确实生效，否则用例失败）+ 面板右侧不越视口 + `expectInsideViewport` |
| 极矮视口探针：面板收敛到可用高 | 前置守卫「内容高 > 收敛后高度」+ `expectInsideViewport` + 纵向滚动降级通道可用（`scrollHeight > clientHeight`） |
| 内联日历与其网格完整落在容器内 | section ⊃ 日历、日历 ⊃ 网格，且纵向不裁切 |

- 判别力证据：`expectPanelSizeCapped` 在改动前会失败（基线记录 `maxWidth/maxHeight: "none"`）；两个探针用例的前置守卫在「上限被移除」时失败（如实测所见：无上限时面板 224×239 不收敛）。
- 探针用例先关闭面板 → `setViewportSize` → 重新点击打开：确保 popper 按新视口重算，且点击会把触发器滚入视口（否则面板锚定在视口外的触发器上，产生假失败）。
- 全套 `pnpm test:e2e`：**48 passed / 0 failed**（16 用例 × 3 project；改动过程中多次冷启动复跑一致，最终 revision 复跑 48/48）。

## 5. 结论与判定

- **矩阵 #6 由「待实测确认」转为「已实现（实测）」**：面板带可用空间上限（宽 + 高），在 390 / 768 / 1280（含右缘窄触发器）与合成探针下均落在视口内，内容完整或可滚动可达；上限仅在可用空间不足时生效，三档验收视口下几何零变化。
- 本批的 `src/**` 改动仅 3 条 CSS 声明（`max-width` + `max-height` + `overflow`），无模板 / 逻辑改动。
- **已知边界 ①（不属本批引入）**：内联 Calendar 为 `inline-block` 且无 `max-width`，**容器宽 < 198px（内容宽）** 时会撑出容器——使用方需保证容器 ≥ 198px，或自行约束日历宽度（属[响应式设计 §1](../../design/responsive.md) 的「控件宽度上限」职责）。对应地，**夹具页面**在文档可用宽（`documentElement.clientWidth`）< 222px 时出现页面横向溢出（移动端 emulate 下 `innerWidth` 因内容宽被扩张到 222，与 `clientWidth` 不等，故 §1 表同时列出两者）。组件未暴露多月份配置，面板宽度不会随配置增长。
- **已知边界 ②（本批已收敛）**：纵向越界（极矮视口）已由 `max-height` + `overflow: auto` 消除，内容可滚动可达。
- **上限生效态的滚动行为（预期）**：上限生效时允许**双轴**滚动——纵向滚动条占位会压缩内容宽，面板内可能出现横向滚动条（验收视口下上限不生效、不会出现）。常驻用例只断言两轴 `overflow` 为可滚动取值与纵向内容可达，未断言「必然产生滚动条」。

## 6. 未覆盖与后续

- 未测 RTL、200% 缩放、触摸手势与移动端软键盘（软键盘改变可用高时，`max-height` 会随之收敛并出现内部滚动，属预期降级，未实测）。
- **窄容器（< 198px）下的内联 Calendar** 无用例：本批只把该边界写入矩阵 #6 与使用方职责，未做夹具用例（夹具 section 宽随视口，无法在验收视口下构造窄容器）。
- **`showTime` 形态的纵向尺寸**未实测：时间区位于日历下方（增高不增宽），本批纵向上限对它应同样收敛，但无实测与断言。
- 面板内焦点态（日格 `outline-offset: 1px`）未设常驻断言：静态推算外扩 3px < 面板内边距 12px，几何上不裁；候选见 [Backlog §1.6](../../plan/backlog.md) 的「常驻 E2E 规格 follow-up」。
- 取证脚本与原始 JSON 落 `test-results/m2-batch3/`（gitignored）；**本记录可提交**，结论与关键数值已同步落[响应式设计](../../design/responsive.md)、[待办事项](../../plan/todo.md) 与提交信息。

## 7. 真实页面验证（文档站产物预览，2026-09-17）

- 入口：`pnpm docs:build` + `pnpm docs:preview`（4173）；页面 `/components/date-picker`（demo 1）、`/components/calendar`（demo 1）。
- 结论：**通过** —— 58 项核对，0 失败，1 观察项（合成 240 下文档站外壳横向溢出，非组件），console error 0。
- 三档验收视口（亮色）：面板均完整落在视口内、无内部滚动条、两轴上限制绑定 Reka 可用空间变量、日历内容无裁剪。

| 视口 | 面板 x,y / w×h / right,bottom | scroll 横 / 纵 | 计算 maxW / maxH | 日历 w×h | 页面横向溢出 |
| --- | --- | --- | --- | --- | ---: |
| 390×844（DPR 2.75，滚动条 0） | 45.09,552 / 222×244 / 267.09,796 | 220=220 / 242=242 | 390px / 292px | 196×218 | 0 |
| 768×1024（DPR 2.25，滚动条 0） | 60.89,508.89 / 222×244 / 282.89,752.89 | 220=220 / 242=242 | 768px / 515px | 196×218 | 0 |
| 1280×800（DPR 1，滚动条 15） | 357,456 / 222×244 / 579,700 | 220=220 / 242=242 | 1265px / 344px | 196×218 | 0 |

- 暗色（1280×800，`html.dark`）：面板 `rgb(11,11,13)` / 边框 `rgb(42,42,46)` / 文本 `rgb(245,245,245)`；星期与日格 `rgb(161,161,170)`；对比度 18.04 / 7.67（≥ AA）；maxW / maxH / overflow 不变。
- 稳定性（portal，不锁滚动）：三档 in-flow 位移 0、fixed 位移 0、CLS 0；桌面滚动条 15px 恒占位（打开前后 `clientWidth` 1265=1265）；关闭后完全恢复基线。
- 交互：选择日期 / Esc / 点击外部三条关闭路径均生效；选择与 Esc 后焦点回到触发器；打开时焦点进入面板内日历导航。
- 合成探针：240×640 面板 222×244 落在视觉视口 [35,275] 内（页面 100px 横向溢出归因文档站外壳 `.content`）；390×420 面板收敛 222×186（`max-height` 186 生效），内部滚动 `scrollH 242 > clientH 184`、`scrollTop` 可达 58，内容可达，bottom 亚像素越出 0.18px（< 1px 容差）。
- OCR（视觉推理通道 400 不可用时的文本证据层）：亮 / 暗 / 240 / 420 面板截图均识别出完整月份网格，置信度 0.994–0.998；**未宣称像素级目视通过**。
- 文档站与夹具几何差异（说明，非缺陷）：文档站面板 222×244 / 日历 196×218，夹具基线 224×239 / 198×213，差值来自文档站主题字体与 `.vp-doc table` 重置（仅影响内联形态，portal 面板不受影响）。
- 证据：`test-results/m2-batch3/ui-validation.md`、`ui-validation.json`、`ui-validation.log`、截图 `m2b3-*.png`（gitignored；关键数值已落本节）。
