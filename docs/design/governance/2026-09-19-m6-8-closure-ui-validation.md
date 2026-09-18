# M6-8 收口「ButtonGroup + Stepper 页迁移节」浏览器验证记录（V 阶段）

- **日期**：2026-09-19
- **批次**：M6-8 剩余页收口——ButtonGroup（基础与布局）与 Stepper（导航与操作）补齐中英「从 PrimeVue 迁移」节
- **被测对象**：`docs:build` 产物 + `vitepress preview`（体现真实构建结果与主题外壳）
- **运行环境**：`pnpm docs:build`（31.25s）后 `pnpm exec vitepress preview docs --port 4180`；Playwright 1.63.0 + Chromium（root 容器参数 `--no-sandbox --disable-dev-shm-usage --no-zygote`）；视口 1280×800
- **脚本 / 产物**：`test-results/m6-8-closure/validate.mjs`、`test-results/m6-8-closure/report.json`（gitignored，结论与实测值已内联于本记录）

## 1. 结论

**通过**：18 / 18 核对项通过、失败 0；console error / pageerror / HTTP ≥ 400 均为 0。

## 2. 覆盖与实测值

> 下表按分组展示，共 18 项核对，与 `report.json` 的 `total` 一致。

| 分组 | 核对项 | 结果 |
| --- | --- | --- |
| ButtonGroup | zh / en 迁移节为其后仅剩自动生成 `API` 标题的最后一个内容节 | 通过 |
| ButtonGroup | zh / en 迁移表含关键项 `orientation` / `pt` / `dt` / `ptOptions` / `unstyled` | 通过 |
| ButtonGroup | zh 迁移节链到专题页 | 通过 |
| Stepper | zh / en 迁移节为其后仅剩 `API` 的末节 | 通过 |
| Stepper | zh / en 迁移表含关键映射 `v-model:value` / `linear` / `StepPanels` / `StepPanel` / `asChild` / `orientation` / `defaultValue` / `completed` | 通过 |
| Stepper | zh 迁移节链到专题页 | 通过 |
| zh 专题页 | 「基础与布局」行含 ButtonGroup 链接、「导航与操作」行含 Stepper 链接 | 通过 |
| zh 专题页 | 未穷尽脚注的示例清单已清空（全部组件页均有 §7 登记与迁移节） | 通过 |
| en 专题页 | 「Basics & Layout」行含 ButtonGroup、「Navigation & Actions」行含 Stepper | 通过 |
| 全局 | console error / pageerror / HTTP ≥ 400 | 0 / 0 / 0 |

## 3. 过程说明

- **ButtonGroup 的处理**：M6-8 第二批曾按「无功能 props 可迁移」把 ButtonGroup 列为「不补必补节」；本批收口时复核确认其 props 仅 `dt` / `pt` / `ptOptions` / `unstyled`（无功能 props），仍补齐**简短迁移节**与 §7 条目——口径为「同为无 props 拼接容器 + `orientation` 为本库新增 + 主题透传未暴露」，使专题页入口表与脚注可完整收口。
- **Stepper 的处理**：新增 §7 条目并在中英页登记字段映射与两处「默认相反 / 结构性缺口」——`linear` 默认 `true`（PrimeVue 默认 `false`）、`v-model` 值域收窄为 1 基 `number`、**本库不提供 `<StepPanels>` / `<StepPanel>` 面板容器**。
- 专题页脚注的「未出现在表中」示例清单在本批后已无对象，改为通用表述（不宣称穷尽的口径保留）；并把「迁移节正在滚动补齐」改为「已覆盖全部组件页」，与收口口径一致。
- Review Gate 第 1 轮 **Pass**（0 blocker / 2 warning / 3 suggest）；warning 与 suggest 已同批采纳：① 专题页脚注收口口径（同一行自相矛盾）已统一；② §7 ButtonGroup 标签「（不新增 API）」改为「（已实现，不新建组件）」并与组件页措辞对齐；③ Stepper 未实现清单补 `ptOptions`；④ `asChild` 措辞收窄为「除 `Item` 外的组合件」。修正后已重建产物并复跑本脚本（仍 18 / 18）。
- 本批仅文档改动，**零 `src/**` 改动**，未跑组件浏览器交互验证。

## 4. 未覆盖（不宣称）

- 未做三档视口横向溢出复测：本批仅新增页内文本与表格行，未触碰布局样式；既有 en-US @768 观察项与 M6-6 / M6-7 记录同源。
- 未覆盖 ButtonGroup / Stepper 组件本身的交互回归（本批未改组件）。
- 未做截图 / 逐像素与视觉描述。

## 5. 复现

```sh
pnpm docs:build
pnpm exec vitepress preview docs --port 4180 &   # 重建后须重启 preview
node test-results/m6-8-closure/validate.mjs       # exit 0；报告见 test-results/m6-8-closure/report.json
```
