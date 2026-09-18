# M6-8 第一批「反馈与浮层 + 数据展示」迁移节浏览器验证记录

**批次**：M6-8 第一批——为「反馈与浮层」（ConfirmDialog / Dialog / Drawer / Message / Popover / Toast）与「数据展示」（DataView / ProgressBar / ProgressSpinner / Skeleton）共 10 个组件页补齐中英「从 PrimeVue 迁移」节（`data-table` / `paginator` 两组内其余两页已于 M6-7 交付）——[待办事项](../../plan/todo.md) M6-8。
**结论：通过** —— V 脚本 **305 / 305** 项核对通过、失败 0、console error / pageerror / HTTP ≥ 400 均为 0；观察项 12（en-US 文档页 @768 的既有横向溢出，与 [M6-6 / M6-7 记录](./2026-09-18-m6-6-m6-7-migration-docs-ui-validation.md) 同源）。原始 JSON 落 `test-results/m6-migration-docs/result.json`（gitignored）。

## 1. 环境与取证方式

| 项 | 值 |
| --- | --- |
| 被测对象 | `docs:build` 产物（`vitepress preview`） |
| 视口 | 390×844 / 768×1024 / 1440×900 |
| 运行期 | Chromium（Playwright），`reducedMotion: 'reduce'`，`--no-sandbox --no-zygote --disable-dev-shm-usage`（root 容器） |
| 脚本 | `test-results/m6-migration-docs/verify.mjs`（与 M6-6 / M6-7 共用，页面清单扩展为 24 页）；结果 `result.json` |

## 2. 核对项（305 项）

### A. 迁移节位置（216 项 = 24 页 × 3 视口 × 3 项）

页面清单 = 本批 20 页（10 组件 × 中英）＋ M6-7 已交付的 4 页（`data-table` / `paginator` 中英，作为回归面）。三档视口下逐页实测：HTTP 200、**「从 PrimeVue 迁移」/「Migration from PrimeVue」为其后仅剩自动生成的 `API` 标题的最后一个内容节**、console error 0。

### B. 横向溢出（60 项）

zh 12 页 × 3 视口 + en 12 页的非 768 档（en 全部页 @768 转为观察项，见 §3）满足 `scrollWidth <= clientWidth + 1`。

### C. 专题页（26 项 = 2 页 × 13 项）

中英专题页 HTTP 200、H1、五个章节、侧栏入口、设计规范 §7 链接齐备；**入口表组件链接 ≥ 29**（本批按新登记的 §7 条目把两组全部 12 个组件补入入口表）；覆盖 `Dialog` / `Drawer`；console error 0。

### D. 互链（3 项）

组件页迁移节的专题页链接存在 → 真实点击跳转成功 → 无 HTTP ≥ 400。

> 语义一致性（节内差异是否与[设计规范 §7](../design-spec.md) 逐条一致）属静态审阅范围，由 Review Gate 逐条比对，不在本脚本的断言内。

## 3. 观察项（不计为缺陷）

| 观察项 | 实测 | 归因 |
| --- | --- | --- |
| en-US 组件页 @768 横向溢出（12 页） | `scrollWidth 847 > clientWidth 768`（79px） | **既有布局问题，与本批无关**：与 M6-6 / M6-7 记录同一根因（VitePress 内容列 `.content`）；未改动的 `en-US/components/button` / `avatar` / `guide/getting-started` 同样命中，zh 同名页与 `/en-US/plan/roadmap` 正常。已登记 [Backlog §1.6](../../plan/backlog.md) |

## 4. 复现

```sh
pnpm docs:build
pnpm exec vitepress preview docs --port 4180 --host 127.0.0.1 &   # 重建后须重启，见 M6-6 / M6-7 记录的说明
node test-results/m6-migration-docs/verify.mjs
```
