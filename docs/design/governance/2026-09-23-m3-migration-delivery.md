# M3 迁移交付面交付与验证记录（M3-1 迁移映射与不支持清单收口）

> 阶段：Phase 13（组件能力补齐与 dependfix 迁移解阻）→ M3 迁移交付面。
> 范围依据：[下一阶段范围评估 §6 / §11](./2026-09-23-next-stage-scope-evaluation.md)；条目登记：[待办归档](../../plan/todo-archive.md) Phase 13 M3；上游记录：M1 见 [M1-1](./2026-09-23-m1-1-row-grouping.md) / [M1-2](./2026-09-23-m1-2-expandable-row-groups.md) / [M1-3](./2026-09-23-m1-3-row-expansion.md) / [M1-4](./2026-09-23-m1-4-multi-sort.md)，M2 见 [M2 `TagsInput`](./2026-09-23-m2-tags-input.md)。

## 1. 范围与目标

按 [待办归档](../../plan/todo-archive.md) M3-1：在[从 PrimeVue 迁移](../../guide/primevue-migration.md)（中英）与[设计规范 §7](../design-spec.md) 补齐 `DataTable` 三项能力与 `TagsInput` 的映射，回扫「未实现 / 未暴露」清单与入口表一致性，且**不宣称穷尽**。

**本条目只补指南层**：逐组件精确映射的权威仍是设计规范 §7——`DataTable` 行分组 / 可折叠分组 / 行展开 / 多列排序 / `sortDescFirst` 与 `TagsInput` 的映射在 M1 / M2 已登记于 §7 与各组件页，本条目不改 §7。指南的设计定位是「流程 + 通用约定 + 注意事项，不重复映射表」，故本条目补的是**入口表成员**与**通用陷阱注意事项（含指针）**。

## 2. 交付面与规模

| 文件 | +/− | 内容 |
| :--- | :--- | :--- |
| `docs/guide/primevue-migration.md` | +4 −1 | ①「常见陷阱」表新增 3 行：**标签录入**（`Chips` / `InputChips` → `CaomeiTagsInput` 首选、`AutoComplete + multiple` 备选）、**表格排序模型**（`sort-mode` / `multi-sort-meta` / `default-sort-order` → `sortMode` / `multiSortMeta` / `sortDescFirst`）、**表格分组与行展开**（`row-group-mode` 等 → 同名 camelCase + `v-model:expandedRowGroups` / `v-model:expandedRows` + `#groupheader` / `#expansion`）；②「逐组件对照入口」表单输入行补 `TagsInput` |
| `docs/i18n/en-US/guide/primevue-migration.md` | +4 −1 | 同上（英文等价行，链接走 `/en-US/components/*`） |

3 行陷阱均以「见 §7 与 <组件页>」收口，与既有「可搜索单选 / 插槽命名 / 命令式浮层」同型，不构成第二事实源。

**规模**：2 文件 / **+4 −1**（每文件；唯一口径）。复算命令 `git diff 5da4e7d --numstat -- docs/guide/primevue-migration.md docs/i18n/en-US/guide/primevue-migration.md`（base = M2-3 末提交 `5da4e7d`（持久 ref），快照 2026-09-23）。单批提交。

## 3. 回扫证据（入口表 ↔ §11 ↔ §7 ↔ 组件页）

- **回扫脚本**：`test-results/m3-1/verify-migration-index.mjs`（gitignored；可复跑）**exit 0**——入口表组件 **zh 47 / en 47**，与[文档与演示站 §11](../documentation-site.md) 登记表 **47** 组件**集合一致**（双向无差集）；47 个组件名均出现在[设计规范 §7](../design-spec.md)。
- **组件页迁移节覆盖**：`docs/components/*.md` 与 `docs/i18n/en-US/components/*.md` 各 47 个组件页均有「从 PrimeVue 迁移 / Migration from PrimeVue」H2，与指南脚注「组件页的「从 PrimeVue 迁移」节已覆盖全部组件页」一致。
- **§7 ↔ 组件页 ↔ 指南 三处口径对账（本阶段新增能力，抽查）**：`DataTable` 行分组「按连续同值切分 + 分组列空白占位」、可折叠分组「缺省全部收起」、行展开「`{ key, expander: true }` + `#expansion`」、多列排序「受控 `v-model:multiSortMeta`」与「表格级 `sortDescFirst`（不提供列级）」；`TagsInput`「`Chips` 首选 / `AutoComplete + multiple` 备选」「`separator` → `delimiter`」「`allowDuplicate` 默认相反」——三处一致。
- **「不宣称穷尽」**：指南脚注保留原文「**它不宣称穷尽**——§7 新增条目时本表随之补齐」，未改为穷尽类措辞。

## 4. 验证与证据

- **质量门**（快照 2026-09-23，**含本记录自身入库**）：`pnpm docs:check` **9 段链全绿**（integrity 249 md / links 248 md / structure 210 页 + 侧栏 6 组 / 47 条目 / config-links 160 条 / i18n-parity 59 对（中英指南 H2 5:5）/ version / showcase 13 项 / line-count / i18n）；`pnpm lint:md:check` 通过；`pnpm docs:build` **exit 0**（无 dead link、无渲染 `TypeError`）。Review Gate 轮次审计时本记录尚未入库，对应计数为 248 md / 209 页（差值即本记录自身）。
- **V 阶段显式跳过**：本条目为纯 markdown 内容（静态指南页表格行），无组件 / 样式 / 交互面；渲染与链接由 `docs:check` + `docs:build` 覆盖，符合 M3-1 最小验收标准（「两侧逐条对齐且不宣称穷尽；`docs:check` 全绿」）。

## 5. Review Gate

**第 1 轮（`audit-depth: standard`；时间盒 ≤ 10 分钟；理由：跨组件映射注意事项新增，需定向核验入口表 ↔ §11 ↔ §7 对齐；无配置 / 运行时代码面）：`Pass`（0 blocker / 1 warning / 3 suggest）**，实测约 **6 分钟**（宿主时钟 `2026-09-23T23:25:56+08:00` 起；审计方 `docs:build` 于 `23:31:07` 完成，据此推算返回约 `23:32`；未超时间盒）。审计方独立复现 `lint:md:check` / `docs:check` 9 段 / `docs:build` / 回扫脚本，并逐条核验 13 个检查点（含中英 17:17 行等价、`{ key, expander: true }` 单花括号无双花括号插值风险、无规划编号）。

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| RG-W01 | warning | 审计请求中「结论与实测值已回写治理记录」为**现在时不实陈述**（当时记录尚未建立） | **已闭合**：本条记录即该落点（F 阶段建立）；教训——调用方 prompt 不得预写未发生的落点状态 |
| RG-S01 | suggest | 陷阱表 ↔ §7 无自动对账（脚本只校验入口表成员集合，不校验陷阱行内的 prop 映射词） | **保留**：[文档与演示站 §15](../documentation-site.md)「通用行与例外清单同步」已将「指南表」列为需回扫的通用载体；机检扩展未纳入本阶段（M4 仅取双花括号守卫），如需另立 Backlog 候选 |
| RG-S02 | suggest | 「表格分组与行展开」行缺 `v-model:` 前缀提示（同批排序行已给 `v-model:multiSortMeta`） | **已同批修正**：补 `v-model:expandedRowGroups` / `v-model:expandedRows`（中英），记为「已修复未复审」 |
| RG-S03 | suggest | M2 记录的 RG-S02 / 残留项未随本批回写 | **已同批修正**：M2 记录 §12 标注「已由 M3-1 闭合」，记为「已修复未复审」 |

## 6. 结论与残留项

M3-1 已交付：迁移指南入口表与 §11 / §7 全量对齐（47 / 47 / 47），补 3 行通用陷阱覆盖本阶段新增能力（`DataTable` 三项能力 + `TagsInput`），口径与 §7 / 组件页一致且不宣称穷尽；`docs:check` 9 段链全绿、`docs:build` exit 0。Review Gate 第 1 轮 `Pass`。

**残留项**：

- **M3-2** 0.3.0 版本交付（版本基线 + CHANGELOG + annotated tag + 本地手动发布 + 发布后校验；依赖 npm 凭据）**未启动**。
- **M3-3** 0.x API 冻结窗口声明**未启动**（依赖 M3-2）。
- 陷阱表 ↔ §7 自动对账（RG-S01）未纳入本阶段。
