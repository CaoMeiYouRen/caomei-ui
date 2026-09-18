# M5-10 FileUpload 浏览器验证记录（V 阶段）

- **日期**：2026-09-19
- **条目**：M5-10 FileUpload `mode` / `maxFileSize` / `auto` / `chooseLabel`（含 `customUpload` + `uploader` 上传事件）
- **被测对象**：`src/` 源码经 Vite 直出的一次性夹具（`test-results/m5-10-fixture/`，gitignored），被测组件为 `src/components/file-upload/file-upload.vue`
- **运行环境**：Vite 8.2.2 dev `http://127.0.0.1:4503`；Playwright 1.63.0 + Chromium（root 容器参数 `--no-sandbox --disable-dev-shm-usage --no-zygote`）；视口 1280×800、`reducedMotion: 'reduce'`
- **脚本 / 产物**：`test-results/m5-10/validate.mjs`、`test-results/m5-10/report.json`（gitignored，结论与实测值已内联于本记录）
- **驱动方式**：文件经 Playwright `setInputFiles`（内存 buffer）注入隐藏 input，不依赖外部图源与本地磁盘文件

## 1. 结论

**通过**：23 / 23 核对项通过、失败 0；console error / pageerror 均为 0。视觉推理通道不可用，本轮仅以几何、计算样式、ARIA 与 DOM 断言取证，未做像素级比对。

## 2. 覆盖与实测值

| 分组 | 核对项 | 实测 |
| --- | --- | --- |
| advanced（默认） | 渲染拖放区、不渲染 basic 按钮、提示文案取内建 locale | 通过 |
| advanced | 选择后渲染文件列表与大小 | `a.png 512 B` / `b.png 2.0 KB` |
| advanced | 移除按钮可访问名与移除后列表收缩 | `移除 a.png`；2 → 1 项 |
| basic | 渲染选择按钮、不渲染拖放区与列表 | 通过 |
| basic | `chooseLabel` 覆盖按钮文案 | 「选择并上传」 |
| basic + auto | 不渲染已选文案 | 通过 |
| basic + customUpload + auto | 选择后抛出 `uploader`（demo 记录文件名） | `ok.png` |
| maxFileSize | 超限文件被拒且提示为 `role="alert"` | `big.png 超过大小上限 1.0 KB` |
| maxFileSize | 超限不触发 `uploader`（记录仍为上一次） | 通过 |
| maxFileSize | 新选择清空提示并重新触发 `uploader` | `again.png` |
| 键盘 / 禁用 | 选择按钮可聚焦；禁用按钮 `disabled` | 通过 |
| 暗色 | 选择按钮 token 生效 | `color rgb(245,245,245)` / `background rgb(11,11,13)` / `border rgb(42,42,46)` |
| 宿主稳定性 | `in-flow` 内容块零位移（basic 交互区间） | `before 16→16`、`after 502.4375→502.4375` |
| 宿主稳定性 | CLS（basic 交互区间） | `delta=0` |
| 宿主稳定性 | 页面无横向溢出 | `scrollWidth 1280 / clientWidth 1280` |

## 3. 测量口径说明

- 本组件**不是浮层 / portal 组件**，不适用测试规范 §5.1 的遮罩与滚动锁测量；宿主稳定性仅取 `in-flow` 位移与 CLS。
- 基线取在「advanced 列表已结算」之后：advanced 选择文件会按设计增高列表并推移下方内容，属预期布局变化；basic 交互不新增列表内容，故以该区间判定「无预期外位移」。
- 超限提示的实测值 `1.0 KB` 由 `maxFileSize: 1024` 经 `formatSize` 得出（`1024 / 1024 = 1.0 KB`）。

## 4. 未覆盖（不宣称）

- 未在文档站产物页验证：示例（`docs/examples/file-upload/custom-upload.vue`）的运行时行为仅由单测与本夹具覆盖，`docs:build` 通过（示例可编译）。
- 未覆盖真实文件选择对话框（`input.click()` 的原生弹窗）、真实拖拽（`DataTransfer` 由测试构造）、触摸 / 移动端视口、`DataTransfer` 多文件跨浏览器差异。
- 未覆盖 XHR 传输路径（本库有意不实现 `url` / `withCredentials`）、上传进度与取消按钮。
- 未做截图 / 逐像素与视觉描述。

## 5. 复现

```sh
# 夹具（gitignored）
pnpm exec vite --config test-results/m5-10-fixture/vite.config.ts
# 另一终端
node test-results/m5-10/validate.mjs   # exit 0；报告见 test-results/m5-10/report.json
```
