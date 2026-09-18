# M6-8 第四批「选择器」迁移节浏览器验证记录

**批次**：M6-8 第四批（最后一批）——「选择器」组 8 个组件页（AutoComplete / Calendar / ColorPicker / DatePicker / MultiSelect / Select / SelectButton / ToggleButton）补齐中英「从 PrimeVue 迁移」节；同批为 AutoComplete 新增[设计规范 §7](../design-spec.md) 映射条目。依据见[待办事项](../../plan/todo.md) M6-8。
**结论：通过** —— V 脚本 **953 / 953** 项核对通过、失败 0、console error / pageerror / HTTP ≥ 400 均为 0；观察项 40（en-US 文档页 @768 的既有横向溢出，与 [M6-6 / M6-7 记录](./2026-09-18-m6-6-m6-7-migration-docs-ui-validation.md) 同源）。原始 JSON 落 `test-results/m6-migration-docs/result.json`（gitignored）。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | `docs:build` 产物（`vitepress preview`） |
| 视口 | 390×844 / 768×1024 / 1440×900 |
| 运行期 | Chromium（Playwright），`reducedMotion: 'reduce'`，`--no-sandbox --no-zygote --disable-dev-shm-usage` |
| 脚本 | `test-results/m6-migration-docs/verify.mjs`（页面清单 80 页 ＝ 先前交付 64 页 + 本批 16 页） |
| 事实源 | 只读一方源码 `momei/node_modules/primevue@4.5.5`（`{autocomplete,colorpicker,datepicker,multiselect,select,selectbutton,togglebutton}/index.d.ts`）与既有 §7 条目 |

## 2. 核对项（953 项）

- **A. 迁移节位置**：720 项 ＝ 80 页 × 3 视口 × 3 项（HTTP 200 / 迁移节为 `<ComponentApi>` 前最后一个内容节 / console error 0）。
- **B. 横向溢出**：200 项 ＝ zh 40 页 × 3 视口 + en 40 页的非 768 档（en 全部页 @768 转观察项，见 §3）。
- **C. 专题页**：26 项 ＝ 2 页 × 13 项（H1 / 五章节 / 侧栏入口 / §7 链接 / 入口表组件链接 ≥ 29 / Dialog 与 Drawer 覆盖 / console 0）。本批把「选择器」入口表补至 8 组件。
- **D. Image 错误态**：4 项 ＝ 2 页 × 2 项（错误态占位 ≥ 2 且无网络 404 / console error）。
- **E. 互链**：3 项（组件页迁移节 → 专题页真实点击、无 HTTP ≥ 400）。

> 语义一致性（节内差异与 §7 逐条一致）属静态审阅范围，由 Review Gate 比对。

## 3. 观察项（不计为缺陷）

| 观察项 | 实测 | 归因 |
| --- | --- | --- |
| en-US 组件页 @768 横向溢出（40 页） | `scrollWidth 847 > clientWidth 768`（79px） | **既有布局问题，与本批无关**：VitePress 内容列 `.content`；未改动的 `en-US/components/button` / `avatar` / `guide/getting-started` 同样命中，zh 同名页与 `/en-US/plan/roadmap` 正常。已登记 [Backlog §1.6](../../plan/backlog.md) |

## 4. M6-8 覆盖收口

本批交付后，M6-8 五个侧栏分组全部落地：基础与布局 8/9（ButtonGroup 按判据不补）、表单输入 12/12、选择器 8/8、反馈与浮层 6/6、数据展示 6/6 —— 共 **40 个组件页**具备中英「从 PrimeVue 迁移」节。

**未补节的 6 个组件页**：Accordion、ButtonGroup、DropdownMenu、Stepper、Tabs、Toolbar（`docs/components/` 共 46 个组件页，含迁移节 40）。其中 **DropdownMenu（M5-5 / M5-6）与 Toolbar（M5-7）的库侧能力补齐在途**，交付后需回扫补节；其余按[设计规范 §7](../design-spec.md) 无映射登记或不构成迁移差异（ButtonGroup 见 M6-8 第二批的判据说明）。`ConfigProvider` 无组件页，不在本统计内。

## 5. 复现

```sh
pnpm docs:build
pnpm exec vitepress preview docs --port 4180 --host 127.0.0.1 &   # 重建后须重启
node test-results/m6-migration-docs/verify.mjs
```
