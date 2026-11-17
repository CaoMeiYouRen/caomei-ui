# Phase 36 M2-2 评估：DataTable 虚拟滚动可行性

> 创建时间：2026-11-17
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M2-2。**只评估，不写实现、不加依赖。**

## 1. 现状

- `DataTable` 基于 `@tanstack/vue-table`（headless，`9.3.1`）+ 本库渲染：行集合由 `getRowModel()` 全量产出，模板逐行渲染；`scrollable` / `scrollHeight`（Phase 34 M4-1）与列宽、冻结列、行分组、行展开、选择列均在同一渲染层。
- 逐格 tooltip（Phase 35 M1-4）实测 60×8 = 480 格：默认逐格提示约 0.6–0.7 s、无提示形态 0.04–0.06 s，即相对开销约 0.5–0.6 s，元素节点 +480；说明「元素节点数」而非「数据量」是当前瓶颈的主因。

## 2. 候选依赖与体积（2026-11-17 取 npm registry）

| 候选 | 版本（钉定策略） | 解包体积（B/1000） | 许可证 | 依赖 | 形态 |
|:---|:---|:---|:---|:---|
| `@tanstack/vue-virtual` | 3.13.52（精确钉定，同 `vue-table` 口径） | 18.8 KB | MIT | `@tanstack/virtual-core`（3.19.11） | 与现有 table 同生态；支持固定 / 动态测量、横向虚拟 |
| `vue-virtual-scroller` | 3.0.5 | 462.6 KB | MIT | 无 | 组件化、约定强；体积约为前者 24 倍 |
| 自研固定行高窗口 | — | 0 | — | 无 | 仅支持固定行高，无动态测量 |

## 3. SSR 与构建形态

- 虚拟化依赖客户端测量：SSR 首帧必须渲染**确定性的前 N 行**（或整页占位），否则水合时行集合不一致。本库 `DataTable` 已在文档站 SSG 下使用，虚拟化必须提供「无测量环境回退」分支。
- 构建形态（按 `tsdown.config.ts` 现状）：`@tanstack/vue-table` 已在 `deps.neverBundle` external 化（不打进产物），仅在 `package.json` 的 `dependencies` 声明（`9.3.1`）。虚拟化若引入 `@tanstack/vue-virtual`，须裁定落 `dependencies` 还是 `peerDependencies`、是否加入 `neverBundle`，以及 `check:api-surface`（`scripts/release/diff-api.mjs`）基线如何更新。

## 4. 行高测量

- 行高受 `data-density`（默认 / touch）与单元格多行内容影响，固定行高不可用；`@tanstack/vue-virtual` 的动态测量（`measureElement`）是唯一可行路径。
- 与 `scrollable` / `scrollHeight` 的交互：外层滚动容器由本库控制，虚拟滚动需要接管 `scrollTop` 与总高度占位；两者同时存在时必须明确「谁拥有滚动」。
- 测量成本：`measureElement` 按行建立观测并在行高变化时触发重排，行数增长会带来观测实例量与首屏高度抖动（滚动位置漂移）；需行高缓存与 `scrollToIndex` 恢复滚动位置的口径。

## 5. 兼容风险

| 能力 | 风险 | 处置方向 |
|:---|:---|:---|
| 选择列（`selectAllScope` = page / lazy） | 虚拟化后「当前页」行集合不等于已渲染行集合，全选语义易漂移 | 全选仍按数据行集合计算，渲染集合与数据集合解耦 |
| 行展开（detail 行） | 展开行高度动态变化，需重新测量 | 展开 / 收起后触发 `measureElement` |
| 冻结列 | 虚拟化容器与 sticky 定位叠加，横向滚动同步 | 冻结列保持在同一个滚动容器内 |
| 行分组 | 分组头行参与虚拟列表，展开 / 折叠改变行数 | 以「扁平化后的渲染行」为虚拟项 |
| 键盘可达（E2E 夹具 `#data-table-keyboard-scroll`） | 焦点行可能滚出窗口被卸载 | 焦点移动前先 `scrollToIndex`，卸载时保留焦点锚点 |
| 逐格 tooltip | 卸载 / 重建导致提示状态丢失 | 与 M1-4 的 `cellTooltips` 开关联动评估 |

## 6. 推荐触发条件

1. 单页行数 **> 200**（经验值，立项前须用夹具实测校准；或使用方显式开启）时提供 opt-in 虚拟化，默认行为不变；
2. 触发立项的前置：`@tanstack/vue-virtual` 的体积与 SSR 回退方案通过评审、双滚动源归属结论落定、`selectAllScope` / 行展开 / 冻结列的回归用例先落；
3. 在此之前**不新增运行时依赖**，也不改变现有渲染路径。

## 7. 结论

- 可行性：**可行（有条件）**；首选 `@tanstack/vue-virtual`（体积小、与现有 table 同生态、支持动态测量），备选自研固定行高窗口（仅覆盖无多行内容的场景）。
- 本阶段**不实现、不加依赖**（登记 §1 阶段级非目标）。
- 复查触发：单页行数需求出现（下游反馈或示例实测 > 200 行）或用户裁定启动。

## 8. Review Gate

- **R1（`quick`）**：Pass（0 blocker / 4 warning / 2 suggest）。
- 同批修复：W1 逐格提示读数改为「默认 0.6–0.7 s / 无提示 0.04–0.06 s / 相对 0.5–0.6 s / 元素节点 +480」；W2 构建形态按 `deps.neverBundle` 事实重写；W3 补测量成本与滚动归属；W4 阈值标注「经验值，立项前须实测校准」；S1 补许可证列与版本钉定、标注体积口径；S2 键盘可达改为夹具锚点表述。
- 未覆盖（转立项材料）：gzip / 树摇后传输体积、`vue-table 9.3.1` 与 `vue-virtual 3.x` 的实装兼容验证。
