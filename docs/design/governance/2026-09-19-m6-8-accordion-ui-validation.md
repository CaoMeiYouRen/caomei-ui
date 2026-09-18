# M6-8「Accordion 页迁移节」浏览器验证记录（V 阶段）

- **日期**：2026-09-19
- **批次**：M6-8 剩余 4 页之一——Accordion 折叠面板（zh / en）补齐「从 PrimeVue 迁移」节
- **被测对象**：`docs:build` 产物 + `vitepress preview`（体现真实构建结果与主题外壳）
- **运行环境**：`pnpm docs:build`（36.56s）后 `pnpm exec vitepress preview docs --port 4180`；Playwright 1.63.0 + Chromium（root 容器参数 `--no-sandbox --disable-dev-shm-usage --no-zygote`）；视口 1280×800
- **脚本 / 产物**：`test-results/m6-8-accordion/validate.mjs`、`test-results/m6-8-accordion/report.json`（gitignored，结论与实测值已内联于本记录）

## 1. 结论

**通过**：13 / 13 核对项通过、失败 0；console error / pageerror / HTTP ≥ 400 均为 0。

## 2. 覆盖与实测值

> 下表按分组展示（共 13 项核对，与 `report.json` 的 `total` 一致）。

| 分组 | 核对项 | 结果 |
| --- | --- | --- |
| zh 组件页 | 「从 PrimeVue 迁移」为其后仅剩自动生成 `API` 标题的最后一个内容节 | 通过（其后 `h2` 仅 `API`） |
| zh 组件页 | 迁移表含关键映射 `v-model:value` / `multiple` / `unmountOnHide` / `lazy` / `activeIndex` | 通过 |
| zh 组件页 | 未实现项 `expandIcon` / `selectOnFocus` 已登记 | 通过 |
| zh 组件页 | 迁移节链接到专题页 `/guide/primevue-migration` | 通过 |
| en 组件页 | 迁移节位置与 zh 一致 | 通过 |
| en 组件页 | 迁移表与 zh 同项 + 未实现项登记 | 通过 |
| zh 专题页 | 「导航与操作」行含 Accordion 链接 | 通过 |
| zh 专题页 | 未穷尽脚注已不再把 Accordion 列为「未出现在表中」 | 通过 |
| en 专题页 | 「Navigation & Actions」行含 Accordion 链接 | 通过 |
| 全局 | console error / pageerror / HTTP ≥ 400 | 0 / 0 / 0 |

## 3. 过程说明

- 脚本首轮 4 项失败均为**断言口径问题而非页面缺陷**：① 「末节」判据未把自动生成的 `API` 标题排除（既有 M6-8 判据即「其后仅剩 API」）；② 未实现项写在迁移表下方的引用块中，首轮只扫了表格行。两处修正后 13 / 13 通过。
- 本轮仅文档改动（组件页移动节 + §7 条目 + 专题页入口表 + 脚注），**零 `src/**` 改动**，未跑组件浏览器交互验证。

## 4. 未覆盖（不宣称）

- 未做三档视口（390 / 768 / 1280）的横向溢出复测：本批仅新增页内文本与表格行，未触碰布局样式；既有 en-US @768 观察项与 M6-6 / M6-7 记录同源。
- 未覆盖 Accordion 组件本身的交互回归（本批未改组件；既有单测与 E2E 覆盖不变）。
- 未做截图 / 逐像素与视觉描述。

## 5. 复现

```sh
pnpm docs:build
pnpm exec vitepress preview docs --port 4180 &   # 重建后须重启 preview
node test-results/m6-8-accordion/validate.mjs     # exit 0；报告见 test-results/m6-8-accordion/report.json
```
