# Phase 36 M1-1 交付记录：隔离工具的多浮层边界收口

> 创建时间：2026-11-17
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M1-1。本记录只承载实现机制、边界与验证证据。

## 1. 问题与机制

- **原实现**：`suppressOutside(root)` 每次调用各自计算「本次要隔离的兄弟节点」并在撤销时移除自己写入的 `inert`。
- **多浮层缺陷**：两层同时展开（A 后 B）时，B 计算时把 A 写入的 `inert` 当作「外部已隔离」跳过；A 关闭后这些节点被移除 `inert`，而 B 仍展开——背景重新可聚焦，`aria-hidden-focus` 回归。
- **收口方式**：改为**活动层登记表 + 每次重算**。模块维护 `activeLayers`（浮层根 + 所属 `body`）与按 `body` 分组的写入记录 `appliedByBody`：
  - 打开：登记本层 → 按全部活动层重算隔离面；
  - 关闭：移除本层 → 本 `body` 仍有活动层则重算（先关者专属的宿主链此时转为背景、补 `inert`；其它层需要的节点保持 `inert`），本 `body` 已无活动层则只恢复该 `body`；
  - 重算时记录内的节点视为本模块所有，不会被误判为外部隔离；重算时刻已带 `inert` 且不在记录内的节点（外部模态 / 其它浮层）跳过、不接管也不撤销。
- **单层行为不变**：保留链（浮层本体、焦点哨兵、`aria-live` / `script` 整棵子树及其祖先）与「只撤销自身写入」的口径保持原样；撤销函数幂等。

## 2. 边界

| 边界 | 处置 |
|:---|:---|
| `root` 不在 `body` 后代链（自定义 portal / shadow DOM） | 不登记、不隔离（返回空操作），调用方自行保证 |
| `root` 为 `body` 本身 | 非法入参，按空操作处理（否则会隔离整页）；用例 `root 为 body 本身时不做任何隔离` |
| 打开期间 `root` 被移出文档 | 登记项保留但不再贡献豁免；撤销时按剩余层重算，不残留 `inert` |
| 外部已置位 `inert` 的子树（外部模态 / 其它浮层） | 重算时刻跳过、不接管；撤销时只移除本模块写入的节点 |
| 外部在打开期间移除 `inert` | 下一次重算补写，记录与属性对齐（用例 `打开期间外部移除 inert 时，下一次重算补写`） |
| 多层关闭顺序 | 与顺序无关：无论先关哪层，剩余层需要的节点保持 `inert`，全部关闭后统一恢复 |
| 不同文档（iframe / 独立 `document`） | 活动层与写入记录均按 `body` 分组，重算只操作当前 `body`，互不影响（用例 `不同文档的浮层按 body 分组，互不影响`） |

## 3. 验证

- `pnpm vitest run src/_shared/open-state-inert.test.ts` → 13 passed（新增 7 例：多层先关者不提前解除、关闭顺序相反、`script` 子树保留、撤销幂等、不同文档互不影响、`root` 为 `body` 空操作、外部移除后重算补写）。
- 负向对照（可复现方法）：以 `git show b710597:src/_shared/open-state-inert.ts`（M1-1 收口前版本）覆盖实现，并在文件末尾追加 `export function __resetIsolationForTest(): void {}` 以便测试文件加载；`pnpm vitest run src/_shared/open-state-inert.test.ts` → 2 failed | 11 passed，失败用例为 `多层浮层：先关者不提前解除，全部关闭后统一恢复`、`root 为 body 本身时不做任何隔离`；恢复收口后实现（sha256 `81e1063…`）→ 13 passed。跨文档误清与释放分支整片隔离两个缺陷由 Review Gate 独立探针复现，作为对应修复的依据。
- 单层回归：`pnpm vitest run src/components/select/select.test.ts` 全绿（Select 打开态隔离的唯一调用方）。
- 治理机检：`pnpm governance:check`、`pnpm lint:md:check`、`pnpm check:planning-numbers`。

## 4. Review Gate

- **结论**：**Pass**（R3 复审；R1 / R2 均 Reject，问题已在 R2 / R3 关闭）。
- **轮次**：R1 `standard` Reject（1B / 3W / 3S）→ R2 `standard` Reject（1B / 1W / 3S）→ R3 `standard` Pass（0B / 0W / 3S）。
- **复查基线**：`b710597` + 工作区 `open-state-inert.ts` sha256 `81e10638610088a649485d3708a3cc03dde7b12e8d42238eaa230851a50fcca4`、`open-state-inert.test.ts` sha256 `25452c71c7184776137251c4cdfe6277b9a632e92fc1b29b726380ab8638a969`。

### 4.1 问题关闭情况

| 编号 | 级别 | 状态 | 依据 |
|:---|:---|:---|:---|
| R1-B1 跨文档误清（另一文档关闭抹掉本文档隔离） | blocker | 已关闭 | 活动层与写入记录按 `body` 分组；`不同文档的浮层按 body 分组，互不影响` 覆盖 |
| R2-B2 释放分支按全局层数判定（本文档已无浮层时整片 `inert`） | blocker | 已关闭 | 释放时先判「本 `body` 是否仍有活动层」：无则仅 `releaseBody(body)`；反向探针（改回整片释放）下跨文档用例失败 |
| R1-W1 记录把未实现项写成既成事实 | warning | 已关闭 | §2 边界表改为按 `body` 分组 + 用例名锚点，并补 `root === body`、外部移除两行 |
| R1-W2 注释「始终跳过」过强 | warning | 已关闭 | 注释与 §1 均限定为「重算时刻已带 `inert` 且不在记录内」 |
| R2-W2 负向对照不可复现 | warning | 已关闭 | §3 记录回退方式 + 回退基线（`b710597`）+ 逐用例 failed 名单 |
| R1-S1 记录与属性失同步 | suggest | 已关闭 | 重算时对记录内但已无属性的节点补写 |
| R1-S2 `root === body` | suggest | 已关闭 | 入口显式空操作，并用例锁定 |
| R1-S3 测试态泄漏 | suggest | 已关闭 | `__resetIsolationForTest()`（`@internal`，未进入包入口） |
| R2-S3 `appliedByBody` 强引用 | suggest | 已关闭 | `releaseBody` 撤销后删除该 `body` 记录 |
| R2-S4 跨文档断言不全 | suggest | 已关闭 | `releaseOther()` 后同时断言 `outsideOther`、`contextOther` 恢复 |
| R2-S5 §1 缺「重算时刻」限定 | suggest | 已关闭 | §1 已限定 |
| R2-S6 `@internal` | suggest | 已关闭 | 已标注，未进入 `src/index.ts` 与 `package.json#exports` |

### 4.2 本轮新增（suggest，非阻塞，转后续）

1. 浮层根嵌套（内层 `root` 位于外层 `root` 子树内）时先关外层的语义未声明：当前唯一调用方 portal 至 `body`，不触发；后续可在 §2 或 JSDoc 注明「浮层根互不嵌套」前提。
2. 跨文档用例只覆盖「另一文档先关」：对称方向已由临时探针验证，后续可补断言固化。
3. `appliedByBody` 对 `body` 的强引用依赖调用方在浮层销毁时调用撤销函数（契约已由 `select.vue` 的 `onBeforeUnmount` 满足）。

### 4.3 验证证据

- `pnpm vitest run src/_shared/open-state-inert.test.ts src/components/select/select.test.ts` → 64 passed；单跑隔离用例 13 passed（新增 7 例）。
- 负向对照：`b710597` 实现 + 桩 → 2 failed | 11 passed（失败用例：`多层浮层：先关者不提前解除，全部关闭后统一恢复`、`root 为 body 本身时不做任何隔离`）；恢复后 13 passed。
- B2 回归探针：释放分支改回「整片释放」→ `不同文档的浮层按 body 分组，互不影响` 失败（1 failed | 12 passed），证明断言方向有效。
- `releaseBody` 重开探针：同一 `body` 全部关闭后再次打开，隔离面完整重建并可再次恢复。
- `pnpm typecheck` / `pnpm lint:check` / `pnpm lint:md:check` / `pnpm governance:check` 全绿。

### 4.4 残余风险

真实浏览器 + axe 的多浮层组合未单独取证（当前仅 Select 一个调用方，隔离面由单测覆盖）；iframe 卸载未调用撤销函数时的引用回收依赖调用方契约。

