# M6-8 第二批「基础与布局」迁移节浏览器验证记录

**批次**：M6-8 第二批——「基础与布局」组 8 个组件页（Avatar / Badge / Button / Card / Divider / Image / SplitButton / Tag）补齐中英「从 PrimeVue 迁移」节；同批为 Avatar / Badge / Divider / Image 新增[设计规范 §7](../design-spec.md) 映射条目。**未纳入**：ButtonGroup——PrimeVue 侧仅 `dt` / `pt` / `unstyled`，无功能 props 可迁移；本库新增的 `orientation` 等不构成迁移阻塞，故不补节（按 M6-8 三条判据不计必补项）。依据见[待办事项](../../plan/todo.md) M6-8。
**结论：通过** —— V 脚本 **493 / 493** 项核对通过、失败 0、console error / pageerror / HTTP ≥ 400 均为 0；观察项 20（en-US 文档页 @768 的既有横向溢出，与 [M6-6 / M6-7 记录](./2026-09-18-m6-6-m6-7-migration-docs-ui-validation.md) 同源）。原始 JSON 落 `test-results/m6-migration-docs/result.json`（gitignored）。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | `docs:build` 产物（`vitepress preview`） |
| 视口 | 390×844 / 768×1024 / 1440×900 |
| 运行期 | Chromium（Playwright），`reducedMotion: 'reduce'`，`--no-sandbox --no-zygote --disable-dev-shm-usage` |
| 脚本 | `test-results/m6-migration-docs/verify.mjs`（页面清单 40 页 ＝ 先前交付 24 页 + 本批 16 页） |
| 事实源 | 只读一方源码 `momei/node_modules/primevue@4.5.5`（`{avatar,badge,button,buttongroup,card,divider,image,splitbutton,tag}/index.d.ts` 与 `Base*.vue`） |

## 2. 核对项（493 项）

- **A. 迁移节位置**：360 项 ＝ 40 页 × 3 视口 × 3 项（HTTP 200 / 迁移节为 `<ComponentApi>` 前最后一个内容节 / console error 0）。
- **B. 横向溢出**：100 项 ＝ zh 20 页 × 3 视口 + en 20 页的非 768 档（en 全部页 @768 转观察项，见 §3）。
- **C. 专题页**：26 项 ＝ 2 页 × 13 项（H1 / 五章节 / 侧栏入口 / §7 链接 / **入口表组件链接 ≥ 29**（本轮按新增 §7 条目补入 Avatar / Badge / Divider / Image）/ Dialog / Drawer 覆盖 / console 0）。
- **D. Image 错误态（本批新增断言）**：4 项 ＝ 2 页 × 2 项——错误态占位 `.caomei-image--error` ≥ 2 且**无网络 404 / console error**（见 §4 附带修复）。
- **E. 互链**：3 项（组件页迁移节 → 专题页真实点击、无 HTTP ≥ 400）。

> 语义一致性（节内差异与 §7 逐条一致）属静态审阅范围，由 Review Gate 比对。

## 3. 观察项（不计为缺陷）

| 观察项 | 实测 | 归因 |
| --- | --- | --- |
| en-US 组件页 @768 横向溢出（20 页） | `scrollWidth 847 > clientWidth 768`（79px） | **既有布局问题，与本批无关**：VitePress 内容列 `.content`；未改动的 `en-US/components/button` / `avatar` / `guide/getting-started` 同样命中，zh 同名页与 `/en-US/plan/roadmap` 正常。已登记 [Backlog §1.6](../../plan/backlog.md) |

## 4. 附带修复：Image error 示例不再产生网络 404

`docs/examples/image/states.vue` 与 en 镜像原以缺失路径 `/caomei-ui-not-found.png` 演示失败占位，会在浏览器控制台留下 404 记录（干扰「0 console error」断言，且该页从未被历史 V 范围覆盖）。改为**不可解码的 data URI**（`data:image/png;base64,iVBORw0KGgo=`）：实测触发 `error` 事件、错误占位正常渲染（每页 2 处），且无任何网络请求与 404。

> 选型依据：探针实测「`base64,INVALID` 不派发 load / error 事件」而「截断的合法 PNG 头 `iVBORw0KGgo=` 稳定派发 `error`」，故取后者。

## 5. 复现

```sh
pnpm docs:build
pnpm exec vitepress preview docs --port 4180 --host 127.0.0.1 &   # 重建后须重启
node test-results/m6-migration-docs/verify.mjs
```
