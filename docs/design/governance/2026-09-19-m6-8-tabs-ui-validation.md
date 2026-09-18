# M6-8「Tabs 页迁移节」浏览器验证记录（V 阶段）

- **日期**：2026-09-19
- **批次**：M6-8 剩余页之一——Tabs 选项卡（zh / en）补齐「从 PrimeVue 迁移」节
- **被测对象**：`docs:build` 产物 + `vitepress preview`（体现真实构建结果与主题外壳）
- **运行环境**：`pnpm docs:build`（31.44s）后 `pnpm exec vitepress preview docs --port 4180`；Playwright 1.63.0 + Chromium（root 容器参数 `--no-sandbox --disable-dev-shm-usage --no-zygote`）；视口 1280×800
- **脚本 / 产物**：`test-results/m6-8-tabs/validate.mjs`、`test-results/m6-8-tabs/report.json`（gitignored，结论与实测值已内联于本记录）

## 1. 结论

**通过**：13 / 13 核对项通过、失败 0；console error / pageerror / HTTP ≥ 400 均为 0。

## 2. 覆盖与实测值

> 下表按分组展示，共 13 项核对，与 `report.json` 的 `total` 一致。

| 分组 | 核对项 | 结果 |
| --- | --- | --- |
| zh 组件页 | 「从 PrimeVue 迁移」为其后仅剩自动生成 `API` 标题的最后一个内容节 | 通过 |
| zh 组件页 | 迁移表含关键映射 `v-model:value` / `unmountOnHide` / `lazy` / `selectOnFocus` / `activationMode` / `activeIndex` | 通过 |
| zh 组件页 | 未实现清单齐备（`scrollable` / `showNavigators` / `#previcon` / `#nexticon` / `tabindex` / `asChild` / `headerStyle` / `headerActionProps` / `contentStyle` / `headerProps` / `contentProps`） | 通过 |
| zh 组件页 | 迁移节链接到专题页 | 通过 |
| en 组件页 | 迁移节位置与 zh 一致；关键映射与未实现清单同项 | 通过 |
| zh 专题页 | 「导航与操作」行含 Tabs 链接 | 通过 |
| zh 专题页 | 未穷尽脚注已不再把 Tabs 列为「未出现在表中」 | 通过 |
| en 专题页 | 「Navigation & Actions」行含 Tabs 链接 | 通过 |
| 全局 | console error / pageerror / HTTP ≥ 400 | 0 / 0 / 0 |

## 3. 过程说明

- 校验前自查并修正一处**自相矛盾**：`activationMode` 同时被写成 `selectOnFocus` 的映射目标与本库新增项；三处（§7 / zh 页 / en 页）已从「本库新增」清单移除，仅保留映射关系。
- Review Gate 第 1 轮 **Pass**（0 blocker / 0 warning / 2 suggest）；两条 suggest 已同批采纳：① 本脚本文件头注释由 Accordion 更正为 Tabs；② 专题页未穷尽脚注对「无 §7 登记的组件」改为「以组件页 API / 范围与约定为准（§7 有登记时以 §7 为准）」（中英各一处）。采纳后已重建产物并复跑本脚本（仍 13 / 13）。
- 本批仅文档改动（组件页迁移节 + §7 条目 + 专题页入口表与脚注），**零 `src/**` 改动**，未跑组件浏览器交互验证。

## 4. 未覆盖（不宣称）

- 未做三档视口横向溢出复测：本批仅新增页内文本与表格行，未触碰布局样式；既有 en-US @768 观察项与 M6-6 / M6-7 记录同源。
- 未覆盖 Tabs 组件本身的交互回归（本批未改组件）。
- 未做截图 / 逐像素与视觉描述。

## 5. 复现

```sh
pnpm docs:build
pnpm exec vitepress preview docs --port 4180 &   # 重建后须重启 preview
node test-results/m6-8-tabs/validate.mjs          # exit 0；报告见 test-results/m6-8-tabs/report.json
```
