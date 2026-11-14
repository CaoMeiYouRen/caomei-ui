# Phase 33 M3-3：Paginator `#report` 插槽

> 创建时间：2026-11-14
> 触发：用户「继续推进剩余条目」。范围与验收口径见 [Phase 33 登记批次](./2026-11-13-phase33-registration.md) §2 的 M3-3 行。

## 1. 变更

| 项 | 内容 |
|:---|:---|
| `src/components/paginator/paginator.vue` | `defineSlots` 新增 `report?: (props: { page, pages, total })`；插槽包裹在 `PaginationRoot` 默认插槽内，`pages` **直接取 Reka 的 `pageCount`**（不在本地重算）；插槽渲染在页码列表**之前**（`v-if="$slots.report"`，无插槽不渲染空容器）；补 `.caomei-paginator__report` 基础排版 |
| 单测 | `paginator.test.ts` 新增 7 例：作用域、`total = 0`（pages=1）、无插槽不渲染容器、SSR 作用域、`pages` 与页码按钮 / 作用域同步、结构顺序、`itemsPerPage = 0` 口径 |
| 文档 | 组件页中英「自渲染报表」→「报表插槽」；迁移表 `CurrentPageReport` 行；`design-spec.md` Paginator 迁移注；示例 `report.vue` 改用 `#report` |
| 公共 API | **增量**：新增 `#report` 插槽（无 prop / 事件 / 类型删除） |

## 2. 行为口径

- 作用域只含 `page` / `pages` / `total`（1 基页码 / 总页数 / 总条数），不注入 `itemsPerPage` / 首末行——首末行由使用方按文档公式计算，避免把报表文案策略内建进组件。
- `pages` 直接取 `PaginationRoot` 默认插槽的 `pageCount`（`Math.max(1, ceil(total / (itemsPerPage || 1)))`），与页码按钮同源，不存在重算分叉；`total = 0` 时为 1。
- 插槽位于页码列表之前（对齐 PrimeVue 报表在左侧的常见布局），不改变页码列表 / 每页条数选择器的既有结构与顺序。
- 无 `#report` 时零额外 DOM（`v-if`）。

## 3. 验证

| 项 | 命令 | 结果 |
|:---|:---|:---|
| Paginator 单测 | `pnpm exec vitest run src/components/paginator` | 全绿（新增 7 例：作用域 / 空数据 / 无插槽 / SSR / 页码同步 / 结构顺序 / `itemsPerPage=0`；命令见行首） |
| 类型检查 | `pnpm typecheck` | exit 0 |
| 文档类型检查 | `pnpm typecheck:docs`（`docs:gen` + `vue-tsc -p docs`） | exit 0 |
| 静态检查 | `pnpm exec eslint src/components/paginator docs/examples/paginator/report.vue` | 零 error |
| 文档 | `pnpm exec lint-md`（两页） | 通过 |
| **文档站构建** | `pnpm docs:build` | 成功；SSG 产物 `docs/.vitepress/dist/components/paginator.html` 含「共 96 条（3/10 页）」，证明演示在构建期 SSR 可渲染 |
| **真实浏览器（V）** | `vitepress preview` + 一次性 Playwright 脚本（1280 / 390；选择器 `.caomei-paginator__report` / `.caomei-paginator__list` / `nav.caomei-paginator`）：报表在页码列表前、窄屏无横向溢出、明暗对比度 | 报表位于列表前 `true`；390px 下 `scrollWidth = clientWidth = 300`；浅色 `rgb(104,111,120)` on `#fff` = **5.08:1**，暗色 `rgb(161,161,170)` on `#1b1b1f` = **6.7:1**（均 ≥ 4.5） |

## 4. 文档回扫面

- `docs/components/paginator.md:43`：章节改为「报表插槽」，说明作用域与首末行公式。
- `docs/components/paginator.md:95`：迁移表 `template` / `CurrentPageReport` 行改为「`#report` 插槽」。
- `docs/i18n/en-US/components/paginator.md:43` / `:95`：同义。
- `docs/design/design-spec.md` Paginator 迁移注：由「未实现」改为「部分实现：`CurrentPageReport` → `#report`」。
- `docs/examples/paginator/report.vue`：改用 `#report` 渲染，保留首末行计算示例。
- `docs/guide/primevue-migration.md` / `docs/i18n/en-US/guide/primevue-migration.md`：分页报表行改为指向 `#report` 插槽与「报表插槽」章节。

## 5. 边界

1. 插槽不提供 `itemsPerPage` / `first` / `last`；需要更复杂报表时由父级自渲染（文档保留公式）。
2. 未新增 prop / 事件；`PaginatorProps` 不变。
3. 报表容器只在提供插槽时渲染；自带样式仅为排版兜底（`text-muted` / `font-size-sm`），可经 CSS 覆盖。
4. 夹具未使用 `#report`，默认渲染零变化（`capture:styles` 采样面不含报表容器）；新增可见面改由文档站构建 + 真实浏览器（预览产物）取证，见 §3。
5. RTL 未单独适配（与页码列表同一 flex 顺序）。
6. 本条覆盖 `2026-09-27-m5-component-capability-longtail-judgment.md` 中「Paginator 页码报表：维持条件触发，不纳入实现」的原判定。

## 6. Review Gate

- **审计声明**：R1 `standard` / R2 `standard`（修复含实现、测试、文档与浏览器取证）；单分区；R1 时间盒 ≤10 分钟。
- **R1：`Reject`**（1 blocker / 2 warning / 3 suggest）
  - blocker：新增可见面缺浏览器验证（文档演示从未渲染；`docs:build` 未跑）→ 已执行 `pnpm docs:build`（SSG 产物含报表文案）+ `vitepress preview` 下的真实浏览器取证（位置 / 窄屏 / 明暗对比度），见 §3。
  - warning：本地 `pages` 公式与 Reka `pageCount` 在非法 `itemsPerPage` 下分叉 → 改为直接消费 `PaginationRoot` 的 `pageCount`；迁移指南仍指向旧章节名 → 中英两处已改并补入回扫面。
  - suggest：`pages` 与页码按钮 / 作用域实时同步、结构顺序、长尾判定覆盖关系 → 已补断言与记录说明。
- **R2：`Pass`**（0 blocker / 1 warning / 4 suggest）
  - W1：§1 单测计数与 §3 不一致 → 已统一为 7 例。
  - S1：补 `total` 变化后的「页码按钮 = 插槽 pages」双端断言与 `itemsPerPage=0` 的按钮断言；S2：报表容器由 `span` 改为 `div`（允许块级插槽内容，避免非法嵌套 / hydration 风险）；S3：计数类读数改为「全绿 / 成功」；S4：补浏览器取证的选择器集合。
  - 复核：`vitest run src/components/paginator` 全绿、`typecheck` exit 0；`docs:check:integrity / structure / i18n-parity / example-refs` 通过。
- **复查基线**：本记录 §1 ~ §4；`paginator.vue`（插槽与 `pageCount` 消费）；`paginator.test.ts` 报表用例；组件页中英、迁移指南中英、`design-spec.md` Paginator 注、示例 `report.vue`。
