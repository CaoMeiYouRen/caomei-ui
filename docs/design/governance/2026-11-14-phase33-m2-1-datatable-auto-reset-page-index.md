# Phase 33 M2-1：DataTable `autoResetPageIndex` 透传与文档口径

> 创建时间：2026-11-14
> 触发：用户「继续推进剩余条目」。范围与验收口径见 [Phase 33 登记批次](./2026-11-13-phase33-registration.md) §2 的 M2-1 行。

## 1. 变更

| 项 | 内容 |
|:---|:---|
| `src/components/data-table/types.ts` | 新增 `autoResetPageIndex?: boolean`（中英 TSDoc） |
| `src/components/data-table/data-table.vue` | `withDefaults` 显式声明 `autoResetPageIndex: undefined`；`useTable` 透传 `computed(() => props.autoResetPageIndex ?? !props.lazy)`（与上游默认等效，且对「动态摘除 prop」稳健） |
| 单测 | `data-table.features.test.ts` 新增 6 例：默认（未提供）重置、`false` 保留、受控 `page` 只抛事件（含 `page` 载荷）、`lazy` 默认不重置、`false` + 数据缩水不钳位（父级回收契约）、运行期摘除 prop 恢复默认 |
| 文档 | `docs/components/data-table.md` / `docs/i18n/en-US/components/data-table.md` 补「页码自动重置与父级配合」 |
| 默认行为 | **不变**：客户端分页默认自动重置；`lazy` 默认不重置（上游 `autoResetAll ?? autoResetPageIndex ?? !manualPagination`） |

### 关键实现细节（Vue Boolean prop 缺省）

`autoResetPageIndex` 是可选 `boolean`：Vue 会把**缺省**的 Boolean prop 转成 `false`，若直接 `computed(() => props.autoResetPageIndex)` 透传，会把「未提供」误当成「显式关闭」，使默认重置消失。故在 `withDefaults` 显式写 `autoResetPageIndex: undefined`。

透传值用 `props.autoResetPageIndex ?? !props.lazy` 而非裸 `undefined`：`@tanstack/vue-table` 的选项合并会丢弃 `undefined`，运行期「从 `false` 摘除 prop」时裸透传会残留上一次的 `false`；显式镜像上游默认（`!manualPagination`）后每次同步都给出确定布尔值。默认重置行为由用例锁定。

## 2. 文档口径（中英同批）

- 默认：客户端分页下**替换 `data` 引用**或排序变化回到第一页（原地修改同一数组不触发）；`lazy` 不重置；需要保留时传 `:auto-reset-page-index="false"`（仅建议用于客户端分页）。
- 受控 `v-model:page`：自动重置**同时抛出 `update:page` 与 `page`（第 1 页）**，刷新期间两者都需忽略或暂缓。
- 越界页：受控分页不做钳位，数据缩水时父级回收空页；**非受控分页**仅在 `rows` / `totalRecords` 变化时钳位并抛一次 `update:page`，默认（自动重置开启）替换 `data` 引用会回到第 1 页，关闭自动重置后 `data` 缩水不会以钳位方式自愈（需自愈时改受控 `page`）。
- `v-model:rows` 持久化建议；**非受控分页**下 `totalRecords` 变化只钳位页码、不回退每页条数。

## 3. 验证

| 项 | 命令 | 结果 |
|:---|:---|:---|
| 组件单测 | `pnpm exec vitest run src/components/data-table` | 5 files / **136 tests 全绿**（含新增 6 例） |
| 类型检查 | `pnpm typecheck` | exit 0 |
| 计算样式等价 | `pnpm capture:styles` | **0 差异**（399 项逐属性一致） |
| 文档 | `pnpm exec lint-md`（两页） | 通过 |
| 静态检查 | `pnpm exec eslint`（改动源文件） | 零 error / warning |

## 4. 边界

1. 仅透传上游同名选项：`autoResetPageIndex` 只影响「页码自动重置」，不改变切片、受控 / 非受控语义与 `page` 事件载荷。
2. 未新增 demo：行为由单测与文档覆盖，现有 `pagination.vue` 示例不受影响。
3. 无 DOM / 计算样式变化（`capture:styles` 0 差异）；未跑视觉基线（无渲染变化）。
4. `lazy` 下不重置为上游默认，本批未改变；**仅客户端分页**可显式传 `true` 强制重置，`lazy` 下传 `true` 会在每次取数后回到第 1 页，不建议。
5. 非受控分页的钳位面维持既有实现（仅 `rows` / `totalRecords` 变化）；本批未扩展为「`data` 缩水自动钳位」，避免改变既有行为（验收要求默认行为不变）。

## 5. Review Gate

- **审计声明**：R1 `standard` / R2 `quick`（只复审修复点）；单分区；R1 时间盒 ≤10 分钟。
- **R1：`Reject`**（1 blocker / 2 warning / 3 suggest）
  - blocker：新增文档把「非受控分页自动钳位」写成通用能力，与实现（仅 `rows` / `totalRecords` 变化时钳位）不符，且 `false` + `data` 缩水会留下不可自愈的空页 → **按登记验收「默认行为不变」选择修文档**：明确「非受控仅在 `rows` / `totalRecords` 变化时钳位；`data` 缩水不钳位，受控分页由父级回收」，并补 `lazy` / `false` + 缩水两条用例锁定契约。
  - warning：自动重置同时抛 `page`（文档漏写）→ 中英补双事件；缺 `lazy` 默认不重置 / `false` + 缩水用例 → 已补。
  - suggest：TSDoc 触发面收窄为「`data` 引用替换 / 排序变化」；透传改为 `?? !props.lazy` 以应对运行期摘除 prop；治理记录的「可传 `true`」限定客户端分页 → 全部采纳。
- **R2：`Pass`**（0 blocker / 2 warning / 3 suggest）
  - 复核：B1 / W1 / W2 与 S1 ~ S3 均关闭；`pnpm exec vitest run src/components/data-table` 136 passed、`typecheck` exit 0。
  - 新增 warning：`totalRecords` 钳位需限定「非受控」；「`data` 缩水不自愈」需限定「关闭自动重置后」→ 已按两条限定语改写中英文档与记录。
  - 新增 suggest：TSDoc 触发面、动态摘除用例、`page` 载荷断言 → 全部采纳（补第 6 条用例与 `page` 断言）。
- **复查基线**：本记录 §1 ~ §4；`src/components/data-table/{types.ts,data-table.vue,data-table.features.test.ts}`；`docs/components/data-table.md:182-186` 与 en-US 同段；`docs/design/governance/index.md` 摘要行。
