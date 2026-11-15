# Phase 34 M4-2：DataTable 全选作用域契约（`selectAllScope`）

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M4-2 行。

## 1. 交付面（10 文件）

| 面 | 文件 |
|:---|:---|
| 类型 | `src/components/data-table/types.ts`：新增 `DataTableSelectAllScope`（`'page' \| 'all'`）与 `selectAllScope`，中英 JSDoc |
| 导出 | `src/components/data-table/index.ts`：导出 `DataTableSelectAllScope` |
| 组件 | `src/components/data-table/data-table.vue`：默认 `page`；`all` 改用全量行模型；`lazy` 下只切当前页并在受控模式合并其它页保留项；表头状态按作用域计算 |
| 单测 | `src/components/data-table/data-table.select-all-scope.test.ts`：默认页作用域、`all` 全量选中 / 取消、受控值优先（半选 / 全选 / 取消不自行生效）、`lazy` 受控合并与取消、`lazy` 非受控、`lazy` 默认作用域保持既有载荷、同 key 过期对象去重 |
| E2E | `test/e2e/data-table-select-all-scope.e2e.ts`：默认 `page` 翻页后表头回到未选且第 2 页未选；`all` 翻页后表头仍选中且第 2 页行选中；两表第 1 页结果一致 |
| 夹具 | `test/e2e/fixtures/app.vue`：`#data-table-select-all`（5 行 / 每页 2 行，两张表分别默认与 `all`，`all` 表提供 `selectAllLabel`） |
| 文档（中 / 英） | `docs/components/data-table.md` / `docs/i18n/en-US/components/data-table.md`：行选择节改写为四档语义，迁移对照补 `selectAllScope` 行 |
| 设计规范 | `docs/design/design-spec.md` §7：行选择作用域条目改为按 `selectAllScope` 表述，有意差异改为「默认当前页、整表需显式 `all`」 |
| 迁移说明 | `docs/guide/primevue-migration.md`：对照表与迁移清单同步 |

治理索引、记录本体与规划状态位（`docs/plan/todo.md`）属登记 / 留痕，不计入上表。登记预算 ≈ 8（组件 / 类型 / 单测 / 中英文档 / 设计规范 / 迁移说明）；实测 10 多出的 2 个是 R1-A 缺浏览器证据所补的 E2E 与夹具，仍在 10 文件阈值内。

## 2. 决策

1. **默认 `page` 逐项保持现状**：默认分支仍走 `getIsAllPageRowsSelected` / `toggleAllPageRowsSelected`，既有用例与调用方行为不变；新增分支只在显式 `all` 时启用。`lazy` + 受控 + 默认 `page` 同样落回旧载荷（只抛当前页），跨页合并不进入默认路径。
2. **`all` 用全量行模型**：`getIsAllRowsSelected` / `getIsSomeRowsSelected` / `toggleAllRowsSelected` 作用于分页前的行模型，客户端分页下即「当前 `data` 的全部行」，不涉及 `totalRecords` 之外的未加载数据。
3. **`lazy` 下 `all` 不推断全量**：`props.data` 只含当前页，任何「整表已选 / 未选」推断都会失真。故 `lazy` 时表头状态仍按当前页计算，点击只切当前页。
4. **`lazy` + `all` + 受控显式合并**：受控 `selection` 中不属于当前页的行按对象身份保留（`toRaw` 比较），并按 `rowKey` 去掉与当前页同 key 的过期对象（保当前页对象），全选时抛出「其它页保留项 ∪ 当前页」，取消时只移除当前页；不清空未加载项。
5. **受控优先不变**：提供 `selection` 时表头状态完全由受控值计算，点击只抛 `update:selection`；组件不自行改写受控值。
6. **作用域在挂载时确定**：与 `selectionMode` / `lazy` 同口径；运行期切换只影响后续交互，不重算既有选择，文档写明。
7. **`all` 的可访问名不静默沿用**：默认可访问名仍是「全选当前页」，与实际动作不符。受 locale 键集合守卫约束，本批不新增 10 语键，改为开发期提醒 + 文档要求调用方用 `selectAllLabel` 覆盖（夹具即按此用法示范）。
8. **文档口径整体翻转**：此前三处文档明确写「不提供 `selectAllScope`」，本批同批改为「默认 `page`、整表用 `all`」，避免契约与实现相反。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/components/data-table` → 全绿；新增 10 例（用例清单见同名测试文件） |
| 定向 E2E | `npx playwright test test/e2e/data-table-select-all-scope.e2e.ts` → 9 passed（3 例 × 3 视口；真实分页点击）。浏览器面覆盖默认 `page` 与 `all` 的表头态与跨页行态；`lazy + all + 受控` 的合并载荷以单测为判据 |
| 判别力 | 默认页作用域断言只选中前 2 行、翻页后表头未选；`all` 断言翻页后表头仍选中且第 2 页行选中（两张表在同一夹具内互为对照）；受控用例断言「点击后仍为半选 / 选中」（组件不得自行生效）；`lazy` 用例用「上一页行对象」断言合并、保留与同 key 去重；默认 `lazy` 用例锁住旧载荷（当前页 / 清空） |
| `pnpm typecheck` | 通过（新导出类型在受检面内） |
| 文档门禁 | `check-i18n-parity` / `check-example-refs` / `lint-md` 通过 |
| `pnpm verify` | `exit 0`（含文档构建与全量单测 / 构建） |

## 4. Review Gate

- **R1-A（`standard`，类型 / 导出 / 组件 / 单测）**：`Reject`（1 blocker：`lazy` 合并分支写在作用域判断之前，默认 `page` 的 `lazy + 受控` 载荷被静默改变，与「默认逐项等价」相反且无锁值用例；3 warning：`lazy` 合并可能重复同 key 行、三态用例缺口、缺浏览器证据；4 suggest）。
- **R1-A 修复**：① `lazy` 合并分支收敛为 `lazy && selectAllScope === 'all'`，默认路径落回 `toggleAllPageRowsSelected`；② 补「默认 `page` + `lazy` + 受控」锁值用例（选中 / 取消两向）；③ 合并时按 `rowKey` 去重（保当前页对象），补过期对象用例；④ 补受控取消路径用例；⑤ 新增真实浏览器 E2E（3 例 × 3 视口）；⑥ `all` 未提供 `selectAllLabel` 与 `lazy + all` 时给开发期提醒，文档要求覆盖可访问名。
- **R1-A suggest 处置**：`single` 三元分支已删除；类型级 JSDoc 已补「受控」限定；文档「挂载时确定」已改为「切换只影响后续交互」；`lazy + all` 静默降级已补开发期提醒。
- **R2（`quick`，A/B 修复点合并复核）**：`Pass`（0 blocker；A-B1 / A-W1 / A-W2 / A-W3 / B-B1 / B-W2 / B-W5 关闭；follow-up：页面键集合取值补 `try/catch`、`lazy` 分页节补作用域例外说明——均在本轮收口；`lazy + all + 受控` 以单测为判据，浏览器面覆盖边界见 §3）。
- **R1-B（`standard`，记录 / 索引 / 文档）**：`Reject`（1 blocker：英文页残留「contract stays unchanged」旧契约句，并与新增 `all` 指引自相矛盾；5 warning：§1 未与登记预算对账、`todo.md` 完成态早于 Gate、`.session` 阶段态陈旧、§3 抄录单测读数、缺本批审计证据记录；3 suggest）。
- **R1-B 修复**：① 删除英文页旧句，`rg` 回扫「contract stays unchanged / no extra whole-table」归零；② §1 补登记预算与实测差异说明；③ §3 删除单测读数、补 E2E 覆盖边界；④ 补本批审计证据记录；⑤ 提交前回填本结论并在同批把 `todo.md` 置为完成态；⑥ 收尾同步 `.session` 三文件。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | 本阶段 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 / F17 | 承接 M1-6 | 见 M1-6 记录遗留节 |
| F18 | 承接 M3-1：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert` | 见 M3-1 记录遗留节 |

## 6. 复查基线

本记录 §1 ~ §5；`data-table.vue` 的 `usesAllScope` / `headerAllSelected` / `headerSomeSelected` / `rowsOutsideCurrentPage` / `toggleAllPageRows`；`types.ts` 的 `DataTableSelectAllScope` 与 `selectAllScope`；`data-table.select-all-scope.test.ts`；两语组件页「行选择 / Row selection」节与迁移对照行；`design-spec.md` §7 行选择作用域条目；`primevue-migration.md` 对照表与清单。
