# Phase 29 归档批次：动效体系与图标体系

> 创建时间：2026-11-09
> 触发：Phase 29 收口（用户指令「开始阶段收口」）。
> 依据：[Phase 29 登记批次记录](./2026-11-08-phase29-registration.md) §1 / §2；[规划规范 §7 / §8](../../standards/planning.md)。

## 1. 范围与结果

- **6 条主线 / 8 条原子条目**全部交付：动效基础层 1 / 反馈与浮层 1 / 导航与操作 1 / 图标体系 3 / Paginator 1 / 动效验收与人工复核 1。
- **本阶段不发布**（D5 ②）：`latest` 维持 `1.2.0`，未执行 `pnpm release`、未推送。
- 归档落点：[待办归档](../../plan/todo-archive.md) Phase 29 块；主窗口由 `Phase 24 ~ Phase 29` 6 块 + 归档索引构成（373 行，`check-line-count` 口径），Phase 23 迁深度归档 [phase-23.md](../../plan/archive/phase-23.md)。

## 2. 提交对账

| 批次 | 提交 |
|:---|:---|
| 阶段登记 | `2d98cee` |
| M1-1 动效基础层 | `076eb15` |
| M2-1 反馈与浮层 | `bf32784` |
| M3-1 导航与操作 | `ee74dbf` |
| M5-1 Paginator 尺寸 | `2ef42ab` |
| M4-1 图标三态 | `d7b2c50` |
| M4-2 内置图标映射 | `129758d` |
| M4-3 图标 token 与迁移文档 | `cb7caed` |
| M6-1 验收装置与规格 | `4c28ad7` / `91d3948` / `22a0cd3` |
| M6-1 复核反馈修复 | `e042c68` / `d49ca39` / `e221abe` |
| M6-1 审查单文件 | `28096fd` / `8a05e76` |
| M6-1 悬浮位移取消 | `6f39ea3` / `137865e` |
| M6-1 人工复核签字 | `4522442` |

## 3. Wisdom 蒸馏

新增 4 条可复用发现（活跃 4 < 阈值 20，未触发蒸馏）：

1. **文档站动效「被压平」的第一嫌疑是系统 `prefers-reduced-motion`**：VitePress 默认主题注入 `* { transition-duration: 0s !important; animation-duration: 1ms !important }`，演示区只按组件恢复部分 `animation`。目视审查要么关闭系统偏好，要么用不加载文档站样式的独立页面；录制取证固定 `no-preference`。
2. **scoped `<style>` 里的 `@keyframes` 名称在 dev 下带哈希后缀**：断言动画名必须用 `toContain('caomei-xxx')` 或段匹配，不能 `toBe` 精确名；生产构建亦可能重写。
3. **宿主 prose 的 `li + li` / `a` / `a:hover` 会污染组件外观**：组件 scoped 选择器（0,2,0）需高于 `.vp-doc a`（0,1,1）；非 scoped 共享样式必须用 `.caomei-<comp> .name` 前缀恢复特异性，否则链接被加下划线 / 品牌色。
4. **动效 E2E 用 `getAnimations()` + `pause()` + `currentTime` 取样，不用 `sleep`**：有界 rAF 轮询需配预算兜底定时器；多个动画各按自身 duration 取比例；断言绑 token 推导值（如 220ms）并在采样后 `finish()` 到终态。

## 4. 载体回扫

- `todo.md`：删除 Phase 29 条目表，恢复「当前无进行中阶段」。
- `roadmap.md`：§1 当前态、Phase 29 行、§5 深度归档链接与压缩历史同步。
- `todo-archive.md`：Phase 29 入窗后约 408 行（越过 warn 400），Phase 23 迁出后 368 行，补本批三段式回扫段后 373 行；主窗口口径改为 `Phase 24 ~ Phase 29`。
- `archive/index.md`：新增 phase-23 文件行与 2026-11-09 迁出记录。
- `recurring.md`：§3 第 32 轮门槛复核留痕 + 触发义务句补记。
- `.session`：阶段态同步为「无进行中阶段」。
- 治理索引：本记录入索引。

## 5. Review Gate

- **audit-depth**：`standard`（多载体归档 + 深度归档机械迁移 + 计数 + 长期任务留痕；≤ 10 分钟）。
- **R1（`standard`）**：`Reject`（3 blocker / 4 warning / 2 suggest；实测约 11 分钟，超 ≤ 10 分钟约 1 分钟）——
  - B1 `.session/runtime-state.json` 阶段态未同步：**已修**（`plan_state.phase` / `current_item` 改为无阶段）。
  - B2 `todo.md` 残留阶段编号 / 交付摘要 / 归档指针：**已修**（仅保留「当前无进行中阶段」+ Backlog 指针）。
  - B3 主窗口行数三处不一致：**已修**——统一为 **373 行（`check-line-count` 口径）**；入窗后约 408 行、迁出后 368 行。
  - W1 Phase 28 行数措辞：**已修**；W2 本记录 R1 待回填：**本批回填**；W3 缺三段式回扫：**已补**；W4 3062 例缺库内载体：**已补**（M6-1 复核修复记录 §3）。
  - S1 随 B1 成立；S2 建议的 `check-stage-counts` 交叉校验留作后续守卫候选（不阻塞）。
- **R2（`quick` delta）**：`Reject`（2 blocker / 3 warning / 2 suggest）——
  - B1 行数口径复发（归档记录写 368 / 367，实测 373）：**已修**——按 `docs:check:line-count` 统一为 373 行，入窗 408 / 迁出 368 三值自洽。
  - B2 三段式回扫段被批量注入 Phase 24 ~ 29（复制 `str.replace` 误伤、把当前读数写进历史块）：**已修**——删除注入段，仅保留 Phase 29 一段 3 bullet（Phase 24 ~ 26 原有专属段未动）。
  - W3 `.session` 快照缺失：**已修**（`last_verification.phase29-archive` + `verification_state`）；W4 治理索引复述行数：**已移除**；W5 Phase 29 三段式仅 2 bullet：**已恢复 3 bullet**。
- **R3（`quick` delta）**：`Pass`（0 blocker / 1 warning / 1 suggest；约 4 分钟）——R2 全部阻塞项关闭；warning（`.session` 轮次标注）与 suggest（本记录补 R2 / R3）同批处理。
- **复查基线**：本记录 §1 ~ §4；`docs/plan/{todo,roadmap,todo-archive,recurring,archive/index}.md`；`docs/plan/archive/phase-23.md`；`.session`（gitignored）。

## 6. 已知观察与后续候选

1. 本阶段不发布、未推送；`latest` 维持 `1.2.0`，版本积累至下一阶段。
2. 图标 token 冻结面 429 → 430（`--caomei-menu-item-hover-color`）；包根导出 345。
3. 文档站在 reduce 下仍按 VitePress 全局规则压平（无障碍行为），目视审查使用独立页面（`review:motion` / `review:build`）。
4. 审查单文件与录屏位于 `artifacts/`（gitignored），不进仓库。
5. Chromium 单浏览器覆盖；Firefox / WebKit 未复跑。
6. 后续候选：动效 A4 ~ A7、图标 I5、触摸目标 P1 / P2、RTL / 二期语言、长尾组件。
