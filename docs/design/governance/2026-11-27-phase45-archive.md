# Phase 45 归档批次：新组件第二批（轮播、水印与菜单交互）

> 时间：2026-11-27
> 触发：用户指令「开始归档」；15 条原子条目已全部交付（Carousel 3 / Watermark 2 / Menubar 3 / NavigationMenu 3 / HoverCard 3 / 导出与 a11y 1）。
> 性质：**归档批次记录**。阶段范围与验收口径的唯一载体仍是 [Phase 45 登记批次](./2026-11-26-phase45-registration.md)；本记录只承载归档动作、交付对账与载体同步结论。

## 1. 归档范围与动作

- **范围**：**6 条主线 / 15 条原子条目全部交付**（Carousel 3 / Watermark 2 / Menubar 3 / NavigationMenu 3 / HoverCard 3 / 导出与 a11y 1；构成对账 3 + 2 + 3 + 3 + 3 + 1 = 15）；本阶段**不发布**，`latest` 维持 `1.4.0`，`1.5.0` 发布收口仍留在 [Backlog](../../plan/backlog.md) §1.6「已决策待窗口」（2026-11-29 之前不列入规划）。
- **入窗**：Phase 45 完整归档块写入 [`todo-archive.md`](../../plan/todo-archive.md)，含 6 项必填（阶段名称与时间 / 交付内容与提交记录 / 质量门 / Review Gate / 未覆盖边界 / 遗留与后续候选）与回扫口径三段式。
- **迁出**：入窗后主窗口按「最近 5 个阶段」压缩为 **Phase 41 ~ Phase 45**，最早的 **Phase 40** 迁入 [`archive/todo-archive-phases-40.md`](../../plan/archive/todo-archive-phases-40.md)（机械迁移：`../` → `../../`、同目录 `./` → `../`，正文不改写）。
- **归档索引**：`todo-archive.md` 的归档索引扩到 Phase 0 ~ Phase 40 并补 Phase 40 行；`archive/index.md` 补 `todo-archive-phases-40.md` 文件行与迁出时点。

## 2. 交付对账

- **15 条全部交付**。执行窗口 `git log --oneline --no-merges 4eaa10bc..44acd006` → **21 个提交**（16 条条目交付 + 1 条示例资源修复 + 3 条 `docs(plan)` 状态同步 + 1 条前序遗留文档提交 `1aefb77e`）。
- 主线交付提交：
  - M1 Carousel：`5d42b9ad`（依赖与 locale 基础，含 embla-carousel-vue 与三键文案）/ `20abf94a`（组件与受控页索引，经 PR #76 合入）/ `9bd3ff99`（文档、示例与 E2E）。
  - M2 Watermark：`60c22ce7`（实现与观察器重建）/ `327513b9`（主题重绘与遮罩恢复）/ `cb5e16b9`（文档、示例与 E2E）；`ad7c5dee` 修正示例外部资源。
  - M3 Menubar：`d87ed8d9`（实现与键盘导航）/ `75b82755`（浮层档位与模态内清单）/ `5d15fee1`（文档、示例与 E2E）。
  - M4 NavigationMenu：`0bc9f921`（实现与共享视口）/ `41b7f9e3`（浮层档位与清单）/ `4f96af64`（文档、示例与 E2E）。
  - M5 HoverCard：`8e9fef8a`（实现与禁用语义）/ `1c7a4fdd`（浮层档位与清单）/ `ed20357a`（文档、示例与 E2E）。
  - M6 导出与 a11y：`8028c513`（Nuxt 冒烟覆盖五组件 + 判定口径收紧）。
  - 推送：M1-1 / M1-2 与状态同步经 PR #76 合入（`84c83105`，3 个提交）；M1-3 与状态同步按「文档类、Review Gate Pass」直推 master（`9bd3ff99` / `0a6851a2`，2 个提交）。M2 ~ M6 共 14 个提交经 PR #77 合入（`44acd006`；PR 内共 15 个提交，含 1 条 `docs(plan)` 状态同步），CI 全绿。
- **执行期事实**：五个组件的包根导出 / Nuxt 清单 / a11y 夹具因 barrel 与导出穷尽守卫被迫随实现条目落地（登记记录 §6 逐条留痕）；menubar 经实测确认为非模态（Reka `modal: false`），不接入整页隔离；Watermark 上游三包不随包提供 LICENSE，许可正文取自固定 commit；Carousel 受控索引在退化测量（容器未布局）下保留外部值、`reInit` 后重新定位。

## 3. 载体同步

| 载体 | 动作 |
| :--- | :--- |
| `docs/plan/todo.md` | 切到「当前无进行中阶段」；移除阶段状态句、进度表与条目表；未完成项汇总只保留 `1.5.0` 发布窗口与真机验收两条指针 |
| `docs/plan/roadmap.md` | §1 当前态改为「当前无进行中阶段」并登记 Phase 45 已完成与归档；阶段表 Phase 45 行改为「2026-11-27 完成并归档（本阶段不发布）」；§5 深度归档范围改为 Phase 0 ~ Phase 40、主窗口保留 Phase 41 起 |
| `docs/plan/todo-archive.md` | Phase 45 块入窗；Phase 40 迁出；主窗口口径句改为 Phase 41 ~ Phase 45 / 5 块并更新行数；归档索引扩到 Phase 40 |
| `docs/plan/archive/index.md` | 补 `todo-archive-phases-40.md` 文件行与 2026-11-27 迁出时点 |
| `docs/plan/backlog.md` | 不做增删；`1.5.0` 发布收口与「可选 peer 结构改进」维持现状 |
| `docs/design/governance/index.md` | 登记本归档记录一行 |
| `.session/` | 切到「无进行中阶段」；交付范围与推送状态同步（gitignored，不入库） |

## 4. 质量门与长期任务

- **阶段质量门**：`pnpm test` **214 文件 / 3976 例**通过；`pnpm typecheck`、`pnpm typecheck:docs`、`pnpm lint:check`、`pnpm lint:css:check`、`pnpm lint:md:check`、`pnpm docs:check`、`pnpm docs:build`、`pnpm governance:check`、`pnpm build`、`check:build`、`check:resolver`、`check:nuxt` 全绿；定向 E2E：carousel 5、watermark 4、menubar 4、navigation-menu 5、hover-card 5（真实 Chromium；overlay-stacking 主用例含 14 个浮层 case 全过）。
- **长期任务**：第 49 轮（Phase 45 收口门槛复核）已于 2026-11-27 执行（见 [`recurring.md`](../../plan/recurring.md) §3），并修复 1 处 Carousel 绕过共享 label 契约的回归；本阶段不发布，发布前复核仍留给发布窗口。
- **wisdom**：`.session/wisdom.md` 活跃 14 条（< 阈值 20，不蒸馏）。

## 5. Review Gate

- **M1-1**：R1 `deep` Reject（1 blocker 台账键覆盖列 / 3 warning / 5 suggest）→ R2 `quick` Pass。
- **M1-2**：R1 `standard` Reject（1 blocker 受控初值被覆盖 / 8 warning / 3 suggest）→ R2 `quick` Reject（1 blocker `reInit` 与退化测量）→ R3 `quick` Pass。
- **M1-3**：R1 `standard` Reject（1 blocker 缺拖拽 E2E / 4 warning / 3 suggest）→ R2 `quick` Pass。
- **M2-1**：R1 `standard` Reject（2 blocker 字号失效与旋转裁切 / 3 warning / 3 suggest）→ R2 `quick` Pass。
- **M2-2**：R1 `standard` Reject（1 blocker 暗色 E2E 无判别力 / 3 warning（+1 附随）/ 5 suggest）→ R2 `quick` Pass。
- **M3-1**：R1 `standard` Reject（2 blocker portal scoped 与缺浏览器验证 / 4 warning / 2 suggest）→ R2 `quick` Pass。
- **M3-2**：R1 `standard` Reject（1 blocker 隔离接线空转 / 3 warning / 1 suggest）→ 非模态澄清 → R2 `quick` Pass。
- **M3-3**：R1 `standard` Reject（1 blocker 夹具 lint 红门 / 3 warning / 5 suggest）→ R2 `quick` Pass。
- **M4-1**：R1 `standard` Reject（1 blocker 缺浏览器验证 / 5 warning / 5 suggest）→ R2 `quick` Reject（1 blocker stylelint / 1 warning 阴影裁切）→ R3 `quick` Pass。
- **M4-2**：R1 `standard` Pass（1 warning 选择器唯一性 / 3 suggest）。
- **M4-3**：R1 `standard` Pass（4 warning 文档事实与粒度 / 3 suggest）。
- **M5-1**：R1 `standard` Reject（1 blocker disabled 悬停仍展开 / 3 warning / 5 suggest）→ R2 `quick` Pass（1 warning 延迟观察窗 / 2 suggest）。
- **M5-2**：R1 `standard` Pass（1 warning 提交边界 / 3 suggest）。
- **M5-3**：R1 `standard` Pass（2 warning §5 反向清单与提交边界 / 4 suggest）。
- **M6-1**：R1 `standard` Pass（2 warning 标记判别力与旧判断并存 / 3 suggest）。

## 6. 未覆盖边界与遗留

- **发布**：`1.5.0` 发布收口未执行，等待 2026-11-29 后的窗口与用户授权；下游三仓仍锁 `1.4.0`。
- **真机验收**：轮播拖拽、水印在真实设备上的像素表现、菜单触屏长按仅浏览器设备视口模拟，无真机执行。
- **视觉基线**：五个新组件尚未进入 `capture:styles` 采样面，暗色与响应式的像素级回归由 E2E 与后续冻结批次承接。
- **Review 状态边界**：M1-1 / M2-2 / M4-2 / M4-3 / M5-2 / M5-3 的 Pass 后同批采纳项为「已修复、未复审」，逐条见各审计工件末节。
- **E2E 环境**：本机 `chromium-1254` 为补装；全量 `pnpm test:e2e` 在本机存在 320 视口溢出等既有环境差异（已在 `84c83105` 基线复现，非本阶段引入），CI 视觉与质量门为准。
- 其余条件触发候选见 [Backlog](../../plan/backlog.md)：启动需用户明确授权。
