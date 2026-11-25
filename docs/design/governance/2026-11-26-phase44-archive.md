# Phase 44 归档批次：新组件批次（引导、二维码与布局交互）

> 时间：2026-11-26
> 触发：用户指令「完成所有条目后归档并推送，然后检查 CI 状态，修复问题」；10 条原子条目已全部交付（Tour / QRCode / ContextMenu / Splitter / Anchor 各 2 条）。
> 性质：**归档批次记录**。阶段范围与验收口径的唯一载体仍是 [Phase 44 登记批次](./2026-11-25-phase44-registration.md)；本记录只承载归档动作、交付对账与载体同步结论。

## 1. 归档范围与动作

- **范围**：**5 条主线 / 10 条原子条目全部交付**（Tour 2 / QRCode 2 / ContextMenu 2 / Splitter 2 / Anchor 2；构成对账 2 + 2 + 2 + 2 + 2 = 10）；本阶段**不发布**，`latest` 维持 `1.4.0`，`1.5.0` 发布收口仍留在 [Backlog](../../plan/backlog.md) §1.6 的「已决策待窗口」过渡态（2026-11-29 之前不列入规划）。
- **入窗**：Phase 44 完整归档块写入 [`todo-archive.md`](../../plan/todo-archive.md)，含 6 项必填（阶段名称与时间 / 交付内容与提交记录 / 质量门 / Review Gate / 未覆盖边界 / 遗留与后续候选）与回扫口径三段式。
- **迁出**：入窗后主窗口按「最近 5 个阶段」压缩为 **Phase 40 ~ Phase 44**，最早的 **Phase 39** 迁入 [`archive/todo-archive-phases-39.md`](../../plan/archive/todo-archive-phases-39.md)（机械迁移：`../` → `../../`、同目录 `./` → `../`，正文不改写）。主窗口行数派生：迁出前 379 + Phase 44 块 57 + 索引行 1 − Phase 39 块 62 = **375 行**（与 `docs:check:line-count` 读数一致）。
- **归档索引**：`todo-archive.md` 的归档索引扩到 Phase 0 ~ Phase 39 并补 Phase 39 行；`archive/index.md` 补 `todo-archive-phases-39.md` 文件行与迁出时点。

## 2. 交付对账

- **10 条全部交付**。执行窗口 `git log --oneline --no-merges d7cddd66..0365c0a8` → **20 个提交**（10 条交付 + 9 条 `docs(plan)` 状态同步 + 1 条示例外链修复）。
- 主线交付提交：
  - M1 Tour：`e1ab4a65`（核心与定位，经 PR #74 合入）/ `65057520`（文档、示例与 E2E）。
  - M2 QRCode：`22e49857`（实现与可选 peer 消费方校验）/ `f3655364`（文档与 peer 说明）/ `9636f7fa`（示例外链修复）。
  - M3 ContextMenu：`e5ecb6bb`（实现与浮层接线）/ `e90e232e`（文档、示例与右键 E2E）。
  - M4 Splitter：`9e525e0d`（实现与受控布局同步）/ `caefa7db`（文档、示例与拖拽 E2E）。
  - M5 Anchor：`6287b52d`（实现与容器内滚动监听）/ `0365c0a8`（文档、示例与滚动 E2E）。
- **执行期事实**：可选 peer 的真实边界经消费方 fixture 实测（未安装时无论是否使用都会构建期报错），口径由「未使用不受影响」改写为实测事实并同步 README / Chart / RichTextEditor / 架构文档；QC 阶段的 blocker 逐条回链见 §5（Tour 滚动锁测量顺序、焦点守卫时序、QRCode 布局插槽与失败态、ContextMenu 焦点归还、Splitter 受控钳制与折叠回写、Anchor 判定线落点等）。

## 3. 载体同步

| 载体 | 动作 |
| :--- | :--- |
| `docs/plan/todo.md` | 切到「当前无进行中阶段」；移除阶段状态句、进度表与条目表；未完成项汇总只保留 `1.5.0` 发布窗口与真机验收两条指针 |
| `docs/plan/roadmap.md` | §1 当前态改为「当前无进行中阶段」并登记 Phase 44 已完成与归档；阶段表 Phase 44 行改为「2026-11-26 完成并归档（本阶段不发布）」；§5 深度归档范围改为 Phase 0 ~ Phase 39、主窗口保留 Phase 40 起 |
| `docs/plan/todo-archive.md` | Phase 44 块入窗；Phase 39 迁出；主窗口口径句改为 Phase 40 ~ Phase 44 / 5 块并更新行数；归档索引扩到 Phase 39 |
| `docs/plan/archive/index.md` | 补 `todo-archive-phases-39.md` 文件行与 2026-11-26 迁出时点 |
| `docs/plan/backlog.md` | 不做增删；「可选 peer 未安装且未使用仍阻断构建」候选已于 M2-1 登记，维持待决策 |
| `docs/design/governance/index.md` | 登记本归档记录一行 |
| `.session/` | 切到「无进行中阶段」；交付范围与推送状态同步（gitignored，不入库） |

## 4. 质量门与长期任务

- **阶段质量门**：`pnpm test` **209 文件 / 3901 例**通过；`pnpm typecheck`、`pnpm typecheck:docs`、`pnpm lint:css:check`、`pnpm lint:md:check`、`pnpm docs:check`、`pnpm docs:build`、`pnpm governance:check`、`pnpm build`、`check:build`、`check:resolver`、`check:nuxt`、`pnpm check:optional-peer` 全绿；定向 E2E：tour 9/9、overlay-stacking 2/2、context-menu 8/9（1 跳过）、splitter 9/9、anchor 6/6。
- **长期任务**：本阶段不发布，周级门槛复核留给发布窗口；归档前全量门禁已覆盖阶段验收。
- **wisdom**：`.session/wisdom.md` 活跃 10 条（< 阈值 20，不蒸馏）。

## 5. Review Gate

- **M1-1**：R1 `deep` Reject（2 blocker：非模态键盘陷阱、未锁滚动 / 遮罩不覆盖经典滚动条）→ R2 `standard` Reject（焦点守卫时序）→ R3 `quick` Pass。
- **M1-2**：R1 `standard` Reject（受控示例不可交互）→ R2 `quick` Pass → R3 `quick` Pass（E2E 改真实经典滚动条）。
- **M2-1**：R1 `deep` Reject（布局插槽裁剪、失败保留旧图、可选 peer 无取证）→ R2 `standard` Reject（消费方取证）→ R3 `quick` Pass。
- **M2-2**：R1 `standard` Reject（第三示例缺容错级别）→ R2 `quick` Pass。
- **M3-1**：R1 `standard` Pass（4 warning 提交前收敛）。
- **M3-2**：R1 `standard` Reject（Esc 焦点归零断言）→ R2 `quick` Pass → R3 `quick` Pass。
- **M4-1**：R1 `standard` Reject（受控钳制分叉、缺浏览器验证）→ R2 `standard` Reject（Enter 折叠静默变更）→ R3 `standard` Pass。
- **M4-2**：R1 `standard` Pass → R2 `quick` Pass（落点 / 日志断言补强）。
- **M5-1**：R1 `standard` Reject（缺浏览器验证）→ R2 `quick` Pass。
- **M5-2**：R1 `standard` Reject（英文示例残留中文）→ R2 `quick` Pass。

## 6. 未覆盖边界与遗留

- **发布**：`1.5.0` 发布收口未执行，等待 2026-11-29 后的窗口与用户授权；下游三仓仍锁 `1.4.0`。
- **可选 peer 结构边界**：未安装 peer 时无论是否使用都会构建期失败（chart / editor / qrcode 同构），改进候选已登记 Backlog（重要 4 / 紧急 2 / 排期）。
- **真机验收**：Anchor / Splitter / ContextMenu 的触摸拖拽与长按仅在移动档浏览器模拟验证，未走真机。
- **测试密度**：Splitter 的指针拖拽仅有 E2E 像素断言；Tour 多实例并存与 Anchor 多实例 hashchange 互扰未单列用例。
- 其余条件触发候选见 [Backlog](../../plan/backlog.md)；启动需用户明确授权。
