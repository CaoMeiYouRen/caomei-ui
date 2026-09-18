# M5-8 Image preview 浏览器验证记录（V 阶段）

- **日期**：2026-09-19
- **条目**：M5-8 `Image preview`（点击放大与遮罩）
- **被测对象**：`src/` 源码经 Vite 直出的一次性夹具（`test-results/m5-8-fixture/`，gitignored），被测组件为 `src/components/image/image.vue`
- **运行环境**：Vite 8.2.2 dev `http://127.0.0.1:4502`；Playwright 1.63.0 + Chromium（root 容器参数 `--no-sandbox --disable-dev-shm-usage --no-zygote`，`ignoreDefaultArgs: ['--hide-scrollbars']` 以暴露真实滚动条）；视口 1280×800、`reducedMotion: 'reduce'`
- **脚本 / 产物**：`test-results/m5-8/validate.mjs`、`test-results/m5-8/report.json`（gitignored，结论与实测值已内联于本记录）

## 1. 结论

**通过**：33 / 33 核对项通过、失败 0；console error / pageerror 均为 0。视觉推理通道不可用，本轮仅以几何、计算样式、ARIA 与键盘断言取证，未做像素级比对。

## 2. 覆盖与实测值

| 分组 | 核对项 | 实测 |
| --- | --- | --- |
| 入口渲染 | preview 入口为 `button` 且可访问名「预览图片」 | 通过 |
| 入口渲染 | 未开启 `preview` 的图片零回归（无入口） | 通过 |
| 入口渲染 | `previewIcon`（`ZoomIn`）与 `#indicatoricon`（`＋`）替换指示器 | 通过 |
| 入口渲染 | 默认指示器为 `Eye` | 通过 |
| 打开路径 | 遮罩为模态（`role="dialog"` + `aria-modal="true"`） | 通过 |
| 打开路径 | 放大图沿用 `src` / `alt`；对话框名「图片预览」、描述沿用 `alt` | 通过 |
| 打开路径 | 放大图不超 90vw / 90vh | `800×600`（视口 1280×800） |
| 打开路径 | 遮罩底色取 `--caomei-color-mask` | `rgba(0, 0, 0, 0.45)` |
| 宿主稳定性（测试规范 §5.1） | 遮罩完整覆盖视口 | `left 0 / top 0 / right 1280 / bottom 800` |
| 宿主稳定性 | 滚动锁 `body { overflow: hidden }` | `hidden` |
| 宿主稳定性 | `body.paddingRight` 补偿滚动条宽 | `15px`（基线滚动条 `15px`） |
| 宿主稳定性 | `in-flow` 内容块位移 | `before 16→16`、`after 281→281`（0） |
| 宿主稳定性 | 宿主行位移 | `top 85→85`（0） |
| 宿主稳定性 | 关闭后宿主宽度恢复基线 | `1265→1265` |
| 宿主稳定性 | CLS | `0` |
| 键盘 | 打开后焦点落在关闭按钮（焦点陷阱） | 通过 |
| 键盘 | 入口可聚焦 + `Enter` 打开 | 通过 |
| 键盘 | `Escape` 关闭后焦点回到入口 | `activeElement.className` 含 `caomei-image__preview-trigger` |
| 关闭路径 | `Escape` / 点击遮罩 / 关闭按钮 / `preview` 置假（单测） | 通过 |
| 暗色 | 遮罩底色仍为 `rgba(0, 0, 0, 0.45)`、放大图可见、关闭按钮 `rgb(255, 255, 255)` | 通过 |

## 3. 过程发现与处置

- **`aria-modal` 缺失（V 阶段拦下，已在 D 前修复）**：Reka UI 2.10.4 的 `DialogContent` **不会**自动输出 `aria-modal`（`grep` 其 `dist/Dialog/*.js` 零命中；既有 Dialog / Drawer 均为显式声明）。首轮夹具实测 `aria-modal` 为 `null`，与 `role="dialog"` 的模态语义不符；已为预览 `DialogContent` 补 `aria-modal="true"`，并把该断言补入单测与夹具核对项，复跑 33 / 33 通过。
- **关闭后回焦的可靠性（Review Gate 第 1 轮 RG-W01，已修复）**：入口原为 `DialogRoot` 之外的裸 `<button>`；Reka 在 `DialogContentImpl` 中仅当「打开时活动元素非 `body`」才把 `activeElement` 记为 `triggerElement`，而 `DialogContentModal.onCloseAutoFocus` 会 `preventDefault()` 抑制 FocusScope 的「回到先前焦点元素」兜底——Safari 桌面点击 / 触摸点击按钮不置焦时 `triggerElement` 为空，关闭后不回焦。已把入口改为 `DialogTrigger as-child`（`onMounted` 无条件登记 `triggerElement`），新增「打开前入口未获焦」路径的单测（`attachTo: document.body` 下断言 `document.activeElement` 回到入口）。修复后夹具复跑仍 **33 / 33**（Chromium 路径值不变），单测 24 / 24、全量 1350 例通过。

## 4. 未覆盖（不宣称）

- 未在文档站产物页（`docs:build` + `vitepress preview`）验证本条目：`docs/examples/image/preview.vue` 依赖外部图片（Lorem Picsum），本轮以本地 SVG 夹具取代以保证可复现；`docs:build` 已通过（示例可编译、动态导入成功），但示例的运行时点击仅由单测与本夹具覆盖。
- 未覆盖触摸 / 粗指针（`@media (pointer: coarse)` 常显分支）、移动端视口、多实例同时打开与嵌套 Dialog 场景。
- 未做截图 / 逐像素与视觉描述。

## 5. 复现

```sh
# 夹具（gitignored）
pnpm exec vite --config test-results/m5-8-fixture/vite.config.ts
# 另一终端
node test-results/m5-8/validate.mjs   # exit 0；报告见 test-results/m5-8/report.json
```
