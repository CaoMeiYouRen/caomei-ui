# Phase 30 归档批次：表单、布局与选择器动效 + 触摸目标 P1

> 创建时间：2026-11-11
> 触发：Phase 30 收口（用户指令「开始归档」）。
> 依据：[Phase 30 登记批次记录](./2026-11-10-phase30-registration.md) §1 / §2；[规划规范 §7 / §8](../../standards/planning.md)。

## 1. 范围与结果

- **5 条主线 / 5 条原子条目**全部交付：表单输入动效 1 / 基础与布局动效 1 / 选择器动效 1 / 触摸目标 P1 1 / 治理小项 1。
- **本阶段不发布**（D2 ②）：`latest` 维持 `1.2.0`，未执行 `pnpm release`、未触发 Release workflow；提交已推送 `master`（`git ls-remote` 实测与本地 HEAD 一致）。
- 归档落点：[待办归档](../../plan/todo-archive.md) Phase 30 块；主窗口由 `Phase 25 ~ Phase 30` 6 块 + 归档索引构成（Phase 30 入窗后 417 行，越过 warn 400 触发压缩；Phase 24 迁出后 366 行，`docs:check:line-count` 口径），Phase 24 迁深度归档 [phase-24.md](../../plan/archive/phase-24.md)。

## 2. 提交对账

| 批次 | 提交 |
|:---|:---|
| 阶段登记 | `e6f20c3` |
| M1-1 表单输入动效（A4） | `6f4a6d4` |
| M2-1 基础与布局动效（A5） | `5c22c30` |
| M3-1 选择器动效（A6） | `ddf9a22` / `96feb20` |
| M4-1 触摸目标 P1 | `8b2583b` |
| M4-1 CI 预算同步修复 | `99d7152` / `e6fd534` |
| M5-1 阶段残留机检 | `72cb756` |

## 3. Wisdom 蒸馏

活跃条目 **7 条**（`pnpm distill:wisdom --check` 实测）< 阈值 20，**未触发蒸馏**；Phase 30 期间新增 3 条可复用发现（均已在 `.session/wisdom.md`，gitignored）：

1. **Reka 给 `SliderThumb` / `ColorAreaThumb` 内联写 `position: absolute`**：全局原语里的 `position: relative` 会被内联样式覆盖；但绝对定位元素本身即包含块，`::after` 仍以宿主 padding 盒居中，不需要分叉实现。
2. **命中区探针对宽宿主不能取四角**：目标某轴已 ≥24（RadioButton 根含标签、Switch 40×22）时四角落在一轴 `::after` 覆盖不到的位置，会假失败；正确判据是逐轴 `max(边长, 24)`，两轴都 <24 时才补四角。
3. **capture 夹具新增常驻 inline 面板会让浮层采样挂死**：`TRIGGER_SAMPLES` / `PANEL_SAMPLES` 的 `waitForSelector(panel, 'detached')` 用全局选择器，ColorPicker inline 面板常驻 ⇒ 永不移除；选择器须排除 `--inline` 变体。

## 4. 载体回扫

- `todo.md`：删除 Phase 30 条目表，恢复「当前无进行中阶段」+ Backlog 指针（不含阶段编号与归档链接）。
- `roadmap.md`：§1 当前态改为无进行中阶段、Phase 30 行状态与归档指针、§5 深度归档清单（补 Phase 24）与压缩历史（第八次）。
- `todo-archive.md`：Phase 30 入窗（入窗后 417 行，越过 warn 400）；Phase 24 块机械迁出——**50 行逐行核对与原文一致，改写 19 处（链接深度 `../` → `../../` 18 处 + 同目录 `./` → `../` 1 处），正文零改写**；迁出 hunk 为 51 行（50 行块 + 1 行分隔空行，故 417 = 366 + 50 + 1，供第三方复算）；迁出后 366 行；主窗口口径与归档索引行（Phase 0 ~ Phase 24）同步。
- `archive/index.md`：新增 phase-24 文件行与 2026-11-11 迁出记录。
- `recurring.md`：§3 第 33 轮门槛复核留痕 + 触发义务句补记 + §2「上次执行」列。
- `.session`：阶段态同步为「无进行中阶段」。
- 治理索引：本记录入索引。

## 5. Review Gate

- **audit-depth**：`standard`（多载体归档 + 深度归档机械迁移 + 计数 + 长期任务留痕；≤ 10 分钟）。
- **R1（`standard`）**：`Reject`（1 blocker / 3 warning / 2 suggest；实测约 7 分钟，未超 ≤ 10 分钟）——
  - **B1 wisdom 读数与实测冲突且两处载体互斥**（块内写「活跃 6 条 / 新增 1 条」，本记录写「6 条 / 3 条」；`pnpm distill:wisdom --check` 实测 **7 条**）：**已修**——两处统一为「`pnpm distill:wisdom --check` → 7 条 < 20」与「Phase 30 期间新增 3 条（代表 1 条）」。
  - **W1 深度归档索引把迁出后行数当入窗读数**（写成 366 行「未越阈」）：**已修**——入窗后 **417 行**（越过 warn 400，压缩触发依据）、迁出后 **366 行**；本记录 §1 与 `todo-archive.md` 口径句同步双读数。
  - **W2 第 33 轮 `capture:styles` 386 → 399 未归因**：**已补**——归因为 Phase 30 M4-1 新增视觉盒 / `::after` 与命中区族采样（预期变更、非漂移），并把「零漂移」限定为 §2.1 / §2.2 候选计数。
  - **W3 缺「改写处数」单点声明**：**已补**——Phase 24 块 50 行逐行核对一致，改写 19 处（链接深度 18 + 同目录 1），正文零改写。
  - **S1 机检面句尾语义不成立**（「算法见当前态句」）：**已改**为 `phase-state-residue` 判据描述。
  - **S2「不推送」口径仅订正 Phase 30**：**已采纳**——roadmap Phase 29 行与 Phase 29 归档块「已知观察」各加时点口径注记。
- **R2（`quick` delta；时间盒 ≤ 5 分钟）**：`Pass`（0 blocker / 0 warning / 1 suggest；实测约 2 分钟）——R1 的 1 blocker / 3 warning / 2 suggest 全部关闭；新增 suggest 为「417 的复算配方缺 1 行分隔空行」：**已采纳**（§4 补「迁出 hunk 51 行 = 50 行块 + 1 行空行，417 = 366 + 50 + 1」）。
- **复查基线**：本记录 §1 ~ §4；`docs/plan/{todo,roadmap,todo-archive,recurring}.md`；`docs/plan/archive/{index,phase-24}.md`；`.session`（gitignored）。

## 6. 已知观察与后续候选

1. 本阶段不发布；`latest` 维持 `1.2.0`，版本积累至下一阶段。
2. 本阶段 CI 两次红均由 `capture:styles` 采样预算未同步引起（Phase 30 M4-1 把采样面由 386 扩至 399），修复后全部 workflow 绿。
3. Chromium 单浏览器覆盖；Firefox / WebKit 未复跑。
4. 后续候选：动效 A7 数据展示（[Backlog](../../plan/backlog.md) §1.10）、触摸目标 P2（§1.5）、RTL / 二期语言、长尾组件。
