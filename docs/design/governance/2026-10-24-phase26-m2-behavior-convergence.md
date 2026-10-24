# Phase 26 M2 行为收口与准破坏性变更记录

> 创建时间：2026-10-24
> 触发：Phase 26 M2（[Phase 26 登记批次](./2026-10-22-phase26-registration.md) §2）。
> 依据：[第十轮范围评估](./2026-10-22-next-stage-scope-evaluation-10.md) §B / D3 ①（主项 + ①②③ 全做）。
> **本记录是 M2 四项行为口径与对外披露文案的唯一载体**；组件页只承载用法表述，不另立决策。

## 1. 决策摘要

| 条目 | 变更 | 对外影响 | 验证 |
|:---|:---|:---|:---|
| M2-1 | 表头全选改为**只作用当前页**（`getIsAllPageRowsSelected` / `getIsSomePageRowsSelected` / `toggleAllPageRowsSelected`） | 客户端分页下表头不再一次改写整表；跨页选择保留；无分页行为不变 | 分页 × 选择定向测试；10 语可访问名 |
| M2-2 | `lazy` 下选择按页收敛 | 受控 `selection` 与 `update:selection` 均只含当前页行；自持态翻页清空 | 受控 / 自持定向测试 |
| M2-3 | `lazy` 下 `rowKey` 显式契约 | 缺省按页内索引会撞 id；选择 / 展开启用时开发期告警，自持展开态翻页重置；受控 `expandedRows` 要求显式 `rowKey` | 选择 / 展开定向测试 + 告警测试 |
| M2-4 | `engines.node` 由 `>=20` 提升到 `>=22` | 排除仍在 Node 20 的消费方，属**准破坏性变更**；必须在 1.0 前完成 | `package.json` 与文档同步；CI 仍 `lts/*` |

四项均**不改公开 props / events / slots 的名称与载荷类型**：M2-1 / M2-2 是行为收口（作用域收窄使 `update:selection` 的载荷集合随之收窄），M2-3 是缺陷修复 + 显式契约，M2-4 是运行环境声明收紧。

## 2. M2-1：DataTable 全选作用域（方案 A）

### 2.1 现状与改法

- **改前**：表头状态与切换使用 `getIsAllRowsSelected` / `getIsSomeRowsSelected` / `toggleAllRowsSelected`，客户端分页下会跨页批量改写整表。
- **改后**：改用 `getIsAllPageRowsSelected` / `getIsSomePageRowsSelected` / `toggleAllPageRowsSelected`，以**分页后的行模型**为准。
- **行为矩阵**：

| 场景 | 表头全选 | 表头状态 | 跨页选择 |
|:---|:---|:---|:---|
| 无分页 | 全选整表 | 整表全选 / 半选 | 不适用 |
| 客户端分页 | **只切换当前页** | 只反映当前页 | 保留其它页已选行 |
| `lazy` | **只切换当前页**（`data` 即当前页） | 只反映当前页 | 由父级聚合受控 `selection` |

- **整表选择**：不新增 prop；父级在受控 `selection` 中写入目标行即可。`selectAll` / `selectAllScope` 仅登记为 [Backlog](../../plan/backlog.md) 条件候选。

### 2.2 可访问名（10 语）

`table.selectAll` 由「全选」改为「全选当前页」；`checkbox.selectAll`（CheckboxGroup 的全选）**不变**。

| locale | 文案 |
|:---|:---|
| `zh-CN` | 全选当前页 |
| `zh-TW` | 全選本頁 |
| `en-US` | Select current page |
| `ja-JP` | 現在のページをすべて選択 |
| `ko-KR` | 현재 페이지 전체 선택 |
| `es-ES` | Seleccionar página actual |
| `fr-FR` | Sélectionner la page actuelle |
| `de-DE` | Aktuelle Seite auswählen |
| `ru-RU` | Выбрать текущую страницу |
| `pt-BR` | Selecionar página atual |

### 2.3 四处披露落点

| 落点 | 状态 |
|:---|:---|
| 中文组件页「行选择」 | 已写入 |
| 英文组件页「Row selection」 | 已写入 |
| PrimeVue 迁移差异（中英迁移表 + [设计规范 §7](../design-spec.md) DataTable 段） | 已写入 |
| CHANGELOG / GitHub Release | **由 M3-2 承载**：`pnpm changelog` 会按 git 历史重写 `CHANGELOG.md`（见[发布指南 §3.6](../../guide/release.md)），人工段只能在生成后补；文案见 §5 |

## 3. M2-2：`lazy` 选择按页收敛

- **受控输入侧**：`rowSelectionState` 经 `indexOfRow` 只在 `props.data`（当前页）内匹配行对象；上一页对象在当页找不到，不会标记。
- **emit 侧**：`onRowSelectionChange` 用 `props.data.filter(...)` 组装，`update:selection` 只含当前页行。
- **自持侧**：新增 `watch(() => props.data)`，`lazy` 且非受控时在 **`data` 引用被替换**（翻页或同页刷新）时清空 `internalSelection`，避免页内索引键在新数据上复用造成「换页后自动选中」；原地修改同一数组不触发（与组件页口径一致）。
- **边界**：`lazy` 下跨页聚合由父级负责（父级可自行合并每页 emit）；`lazy` 需在挂载时确定。

## 4. M2-3：`lazy` 下 `rowKey` 显式契约

- **根因**：`lazy` 的 `props.data` 只含当前页，缺省 `rowKey` 退化为**页内索引**；`data` 引用替换后同一索引指向不同行，选择 / 展开会串页。
- **修复**：
  - 自持展开态在 `lazy` + 缺省 `rowKey` 时随 `props.data` 变化重置；
  - 显式 `rowKey` 时键跨页稳定，自持展开态按行标识保持；
  - 选择侧由 M2-2 的按页收敛覆盖。
- **显式契约**：`lazy` 下启用选择或展开时要求显式 `rowKey`；缺失时经 `warnDev` 给出开发期告警（生产静默）。受控 `expandedRows` 在缺省 key 下无法区分页，故同样要求显式 `rowKey`。
- **文档**：组件页「行展开」「行选择」、英文镜像、迁移表与[设计规范 §7](../design-spec.md) 已同步。

## 5. M2-4：`engines.node` 提升

- `package.json` 的 `engines.node` 由 `>=20` 改为 `>=22`；Node 20 已于 2026-04 EOL。
- 同步载体：`README.md` / `README.en-US.md` / `docs/guide/development.md` / `docs/i18n/en-US/guide/development.md` / `docs/design/documentation-site.md`。
- CI 保持 `lts/*`，不钉具体大版本；1.0 后同类调整须走 major。

### 5.1 M3-2 发布文案（人工段）

CHANGELOG 的 1.0.0 段与 GitHub Release note 使用以下表述（M3-2 执行）：

- **DataTable**：`selectionMode="multiple"` 的表头全选收口为**只作用当前页**；客户端分页下跨页选择保留，`lazy` 下选择按页收敛，`lazy` 下请显式提供 `rowKey`。可访问名由「全选」改为「全选当前页」（10 语）。
- **Node.js**：最低要求提升至 **>= 22**（Node 20 已于 2026-04 EOL；1.0 后同类调整须走 major）。

## 6. 验证与证据

- **拆分依据**：25 个变更文件超出[规划规范 §5](../../standards/planning.md#_5-任务粒度约束) 的建议阈值（≤10 文件），但新增约 400 行未超 800 行；文件构成为 **DataTable 代码 / 3 个测试 / 10 个 locale 单键文案（14）** + `package.json`（1）+ **Node 版本载体 5 个文档**（README 中英 / 开发指南中英 / 文档站设计文档）+ **组件页中英 / 设计规范 / `todo.md` / 治理索引（5）**，无跨模块重构，故不拆分批次。
- 定向测试：`pnpm vitest run src/components/data-table`（覆盖无分页 / 客户端分页 / `lazy` × 受控 / 自持 × 选择 / 展开；含告警正反例）。
- 质量门：`pnpm lint:check` / `pnpm typecheck` / `pnpm docs:check` / `pnpm lint:md:check` / `pnpm test` / `pnpm governance:check` / `pnpm build` / `pnpm check:build`。
- **浏览器验证（V 阶段）**：`playground/m2-validate.html` 一次性夹具 + Playwright（Chromium，1440×1000 / 390×844，亮 / 暗），**28 / 28 断言通过**，console error / pageerror / HTTP ≥ 400 均为 0：
  - A 客户端分页：表头可访问名「全选当前页」；第一页全选仅 1–5；翻页后表头 `false` 且 1–5 保留；第二页全选后 1–10；回第一页表头 `true`、5 行选中；取消一行后 `mixed`。
  - B `lazy` 自持选择（无 `rowKey`）：第一页选择 emit `1`；翻页后 0 行残留；第二页选择 emit 仅 `4`；表头全选 emit `4,5,6`。
  - C `lazy` 展开（显式 `rowKey`）：第一页展开「成员 1 详情」；翻页无残留；回第一页展开保持。
  - 暗色背景与亮色不同；移动端页面无横向溢出。
  - 截图：`test-results/m2-validate-desktop-light.png` / `-desktop-dark.png` / `-mobile-light.png`（gitignored）；原始脚本与结果保留在 `test-results/m2-validate.mjs` / `m2-validate-summary.json`（一次性夹具已删除，复跑需按脚本内选择器重建同构夹具）。
  - **时点说明**：V 阶段取证（18:27）早于最后一次源码写入（18:28，仅内部符号 `toggleAllRows` → `toggleAllPageRows` 改名，无行为变更）；其后已复跑 `pnpm build` / `check:build` / 全量测试，行为证据与最终源码一致。
  - **边界**：当前通道无视觉理解能力，布局美观度未经视觉确认，仅几何 / 交互 / ARIA 断言；本批不涉及浮层、portal 或滚动锁，宿主页面稳定性检查按规则跳过。
- 未新增公开 API；未改 `exports`、包根导出名、token 与 locale 命名空间 / 键数（仅 `table.selectAll` 文案取值变化）。

## 7. Review Gate

- **audit-depth**：`deep`（同批含 DataTable 运行时行为 + `package.json` 的 `engines` 运行时配置 + 10 语 locale；按 [AI 协作规范 §3.1](../../standards/ai-collaboration.md#_3-1-审计调用协议-audit-depth-与时间盒) 取严）。
- **时间盒**：≤ 20 分钟（单分区）。
- **R1**：`Reject`（2 blocker / 5 warning / 4 suggest）。blocker 为缺 `pnpm build` 证据与缺浏览器验证；warning 为自持态清空不抛事件、清空触发口径窄于实际、`rowKey` 告警缺反例测试、记录档位不一致、文件数超阈值未写拆分依据。
- **R1 修复**：补 `pnpm build` + `pnpm check:build`；补浏览器验证（28 / 28）；文档明确「清空不额外抛事件」与「`data` 引用替换才触发」；补 2 条告警正反例测试；回填本记录 §6 / §7；内部符号改名 `toggleAllPageRows`。
- **R1 suggest 处置**：非分页下「全选当前页」文案保留（当前页即整表，且为登记口径）；记录 §1 已加限定；迁移表 PrimeVue「整表」断言经审计方核对 `packages/primevue/src/datatable/DataTable.vue#toggleRowsWithCheckbox`（PrimeVue 4.x，2026-10 核对）取过滤后全量数据属实，出处在此记录备查。
- **R2**：`Pass`（0 blocker / 3 warning / 4 suggest）。3 条 warning 均为记录文字（V 取证时点说明 / 拆分计数 / R2 结论占位），已在本记录 §6 / §7 收口；S05 ~ S07 已处理：复跑脚本表述修正、§3 / §4 与组件页「`data` 引用替换」同口径、自持清空「不抛事件」补测试断言。
- **R3**：`Pass`（0 blocker / 1 warning / 1 suggest）。R2 后仅新增 2 条「清空不抛事件」断言与记录文字，无运行时逻辑变更；W09（§7 未记录 R3）由本行回填。**R3 Pass，可提交**。
