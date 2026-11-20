# Phase 39 登记批次：P0 组件缺口、文档站设备预览与质量收口

> 创建时间：2026-11-21
> 触发：用户就[下一阶段范围评估（第二十三轮）](./2026-11-20-next-stage-scope-evaluation-23.md) 的 D0 ~ D4 作出裁定：D0 取「核心 + 文档 P1 + E2E 5 例，不发布」、D1 四件全取、D2 仅 P1、D3 仅 5 例、D4 不发布。
> **本记录是 Phase 39 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权启动时已有最大编号 Phase 38 + 1 = **Phase 39**（[规划规范 §4](../../standards/planning.md)）。
- **7 条主线 / 14 条原子条目**：InputOtp **2** / Popconfirm **2** / Result **2** / Descriptions **3** / 治理收口 **1** / 文档站设备预览 **2** / E2E 质量收口 **2**；构成对账 2 + 2 + 2 + 3 + 1 + 2 + 2 = 14。
- **为何不拆阶段（7 条主线）**：M1 ~ M4 是四个互不依赖的 P0 组件，各自可独立验收；M5-1 是本阶段登记配套的治理项，不单独成阶段；M6 / M7 是可在阶段内独立回退的文档与质量项。拆成两个阶段会产生「只有治理」或「只有文档 + E2E」的半空阶段，并增加二次登记与 Review Gate 开销；14 条仍在建议区间 10–15。第 7–8 条主线的「不拆阶段」理由按[规划规范 §6](../../standards/planning.md) 记录于此。
- **不发布**（D4 ②）：`latest` 维持 `1.3.0`，不触发 Release；本阶段不登记 `1.4.0`。
- **范围来源**：P0 组件见 [调研记录 §4.2](./2026-11-18-i18n-component-and-mobile-research.md) 与 Backlog §1.11；文档预览见[设备预览评估](./2026-11-20-docs-device-preview-evaluation.md)；E2E 5 例见 [Phase 38 归档 §7](./2026-11-20-phase38-archive.md) 与 Backlog §1.6。
- **阶段级非目标**：不发布、不进入 1.4.0；不做 P2 单 Demo 抽屉；不做宽屏视觉基线 / `xl` 断点；不做 Form rules、DataTable 虚拟滚动、i18n 二期、移动端第二波、P1 高级组件；不新增运行时依赖；不做破坏性 API；不自动发布。
- **主线级非目标**：
  - M1：不做短信发送、倒计时、验证码校验或风控。
  - M2：不替代 `ConfirmDialog`，不做异步请求内部管理。
  - M3：不做页面布局 / 导航，不内置业务文案。
  - M4：不做数据请求、排序、筛选，不替代 `DataTable`。
  - M5：不改变阶段编号规则，不新增规划载体。
  - M6：不做内联拖拽切换，不改组件库 API。
  - M7：不做全量 E2E 重构，不降低断言强度。

## 2. 条目与验收口径

| 编号 | 主线 | 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|:---|:---|
| **M1-1** | InputOtp | 实现与测试 | 封装 Reka `PinInputRoot`；`v-model` 字符串、`length`、`type`（numeric / alphanumeric）、粘贴分发、`autocomplete="one-time-code"`、`inputmode`、`complete` 事件、`disabled` / `readonly` / `invalid` / `size` / `label` / `name`；逐格输入 / 退格 / 方向键 / 粘贴 / 完成态；320 / 768 / 1280；亮暗；单测 + E2E | ≈ 6 | 无（Reka `PinInputRoot`） |
| **M1-2** | InputOtp | 文档 / 示例 / 10 语可访问名与台账 | 中英组件页、示例、设计清单 / 侧栏 / 总览 / 画廊、README 计数回扫；如内置可访问名则纳入 10 语与台账；迁移差异（PrimeVue `InputOtp`） | ≈ 8；命中 10 语同批时按 Phase 38 M2-3 / M3-3 先例上浮，不再二次拆分 | M1-1 |
| **M2-1** | Popconfirm | 实现与测试 | 基于 Popover + Button；标题 / 描述、确认 / 取消文案、`tone="danger"`、`loading` / `disabled`、`@confirm` / `@cancel`、受控 `open`、placement、焦点归还；Enter / Esc / 外部点击；嵌套浮层不回归；单测 + E2E | ≈ 6 | 无（Popover + Button） |
| **M2-2** | Popconfirm | 文档 / 示例 / 迁移差异 | 中英组件页、示例、设计清单 / 侧栏 / 总览 / 画廊；与 `ConfirmDialog` 的边界单点声明；PrimeVue `ConfirmPopup` 迁移差异 | ≈ 8 | M2-1 |
| **M3-1** | Result | 实现与测试 | 状态（success / info / warning / danger / 403 / 404 / 500）、图标、标题、描述、`#extra`、尺寸档；`role="status"` 或等价语义；320 不裁切；亮暗；单测 + E2E | ≈ 5 | 无 |
| **M3-2** | Result | 文档 / 示例 / 状态语义 | 中英组件页、示例、设计清单 / 侧栏 / 总览 / 画廊；与 `Empty` / `Message` / `Alert` 的边界单点声明 | ≈ 7 | M3-1 |
| **M4-1** | Descriptions | 实现与测试 | `CaomeiDescriptions` + `CaomeiDescriptionsItem`；`columns`、`bordered`、`labelWidth`、`span`、`size`、水平 / 垂直布局；`dl` / `dt` / `dd` 语义；单测 | ≈ 6 | 无 |
| **M4-2** | Descriptions | 响应式列数与长内容 | 320 / 768 / 1280 列数与换行；长内容不溢出；`span` 边界；亮暗；`capture:styles` / E2E | ≈ 4 | M4-1 |
| **M4-3** | Descriptions | 文档 / 示例 / 台账 | 中英组件页、示例、设计清单 / 侧栏 / 总览 / 画廊、README 计数回扫；与 `DataTable` 的边界说明 | ≈ 9 | M4-1 / M4-2 |
| **M5-1** | 治理收口 | 阶段进度表机检 | 按[规划规范 §7](../../standards/planning.md) 校验 `todo.md` 6 列进度表：行数 = 主线数、状态四值、`提交` 列可定位、归档时 `小条目` 已闭环数之和 = 条目表 `已交付` 行数、主线行不得残留 `未开始` / `进行中` / `已阻塞`；扩展 `check-stage-counts` 或新增守卫；失败路径单测 + 负向验证 | ≈ 5 | 本登记进度表 + `check-stage-counts` |
| **M6-1** | 文档站设备预览 | iframe 整页预览 | P1 整页 iframe + 设备档切换；iframe 内 `@media` 生效；桌面 / 移动 / 暗色三态；不刷新主站；一次性探针验证 CSP / 同源 / SSG | ≈ 6 | 无（一次性探针前置） |
| **M6-2** | 文档站设备预览 | 路由 / 入口 / 文档 | 预览路由、侧栏 / 导航入口、使用说明；`docs:check` / `docs:build` / 链接门禁 | ≈ 4 | M6-1 |
| **M7-1** | E2E 质量收口 | 5 例逐例修复与负向对照 | `back-top` 夹具遮挡、`overlay-stacking` 模态内容后代命中自证、`navigation-motion` SplitButton chevron、`selector-motion` DatePicker 入场 / reduce、`data-table-scroll` 行展开区；逐例从失败转通过，回退修复后至少 1 例重新失败 | ≈ 5 | Phase 38 归档 §7 清单 |
| **M7-2** | E2E 质量收口 | 周回归稳定性与记录 | 定向与周回归复跑；记录失败根因、修复点与剩余观察项；不放宽断言 | ≈ 2 | M7-1 |

> 文件面为登记估算，实施时按[规划规范 §5](../../standards/planning.md) 的 10 文件阈值拆分；生成物与基线不计入。**10 语条目按键集合守卫要求整批提交，不按语言拆分**（先例：Phase 35 M3-2 为 19 文件）；如 M1-2 命中该例外，实施时不再二次拆分。

## 3. 阶段规则

- **任务粒度**：单条 ≤ 10 文件 / 800 行；超出时按[规划规范 §5](../../standards/planning.md) 拆分（§2 表注已声明的「10 语同批」例外除外）；计数回扫按[规划规范 §3.9](../../standards/planning.md) 覆盖 `todo.md` / `roadmap.md` / 本记录 / 索引摘要 / `.session`。
- **质量门**：每条目 `lint` / `typecheck` / 定向测试 / 必要 E2E / Review Gate；阶段末 `pnpm verify`。
- **状态词**：条目表沿用 `待执行 / 已交付`（`todo.md` 现有惯例）；进度表用 `未开始` / `进行中` / `已闭环` / `已阻塞`。映射：未开始 / 进行中 → 待执行，已闭环 → 已交付，**已阻塞 → 待执行（不视为已交付；归档前须转为已交付或移出）**；M5-1 守卫按该映射读取。
- **Review Gate**：每条目至少一轮 `@code-reviewer`；未 `Pass` 不得提交。
- **文档**：组件能力变化同步中英组件页与设计登记；不虚构未实现能力。
- **发布**：本阶段不发布；`release.yml` 与发布触发模型不改。
- **依赖**：不新增运行时依赖。

## 4. 载体同步与候选流转

- `backlog.md`：§1.11 迁出 InputOtp / Popconfirm / Result / Descriptions 四行；§1.6 迁出「文档站桌面 / 移动设备预览」的 P1 部分（P2 单 Demo 抽屉拆为独立行保留）、「E2E 装置既有失败清理」「阶段进度表机检」三行。§1.6 由 17 行变为 **15 行**（迁出 P1 / E2E / 进度表机检三行，P2 独立保留 +1）；§1.11 由 19 行变为 **15 行**；不写 `→ Phase 39` 迁出标注（[规划规范 §7](../../standards/planning.md)）。
- `todo.md`：新增 Phase 39 状态句、6 列进度表与 14 条条目表。
- `roadmap.md`：§1 当前态与 Phase 39 行（7 条主线 / 14 条原子条目）。
- 治理索引：本记录登记一行。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 39（14 条待执行）。
- **未纳入项**：D2 ② 的 P2 单 Demo 抽屉（未采纳，保留 Backlog §1.6）、宽屏视觉基线（Backlog §1.6，非 D 项）、i18n 二期（Backlog §1.4）、Form rules / 虚拟滚动 / P1 高级组件（Backlog §1.11）、移动第二波（Backlog §1.5）、`xl` 断点（Backlog §1.6）；`1.4.0` 发布不纳入且无 Backlog 载体（D4 ②）。
- **回扫**：对 7 个迁出候选名做 `rg`，活载体 0 处仍以现在时指向 §1.6 / §1.11（治理记录 / 评估记录为点时快照，不回改）。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| P0 无直接下游用量 | 组件可能按生态对照过度设计 | API 最小化、插槽优先；文档示例覆盖真实场景；下游落地后按反馈再扩 |
| OTP 敏感输入 | 示例 / 日志泄露验证码；密码管理器行为不一致 | 示例不打印值；补 `autocomplete="one-time-code"` / `inputmode`；真实浏览器验证 |
| Popconfirm 嵌套浮层 | 与 Dialog / Select / DropdownMenu 的层级和外部点击冲突 | 复用既有隔离工具；补嵌套与外部点击负向用例 |
| Result / Empty / Message 边界 | 四套「结果 / 空态」口径并存 | 文档单点声明：Result 页面级、Empty 区块级、Message 即时反馈 |
| Descriptions 响应式 | 窄屏列数退化导致溢出 | 320 / 768 / 1280 三档断言；长内容换行；`capture:styles` |
| 文档预览 | iframe / CSP / SSG 兼容 | 先做一次性探针；失败则退 P2 或 Backlog |
| E2E 既有失败 | 可能是夹具设计而非产品缺陷 | 逐例定性 + 负向对照；不放宽断言 |
| 进度表机检 | 与 `check-stage-counts` 的解析耦合 | 进度表放在条目段之外；用真实阶段 + 失败路径验证 |
| 阶段容量 | 7 主线 / 14 条 | 7 主线属 7–8 区间、已在 §1 写不拆理由；14 条在建议区间 10–15；实施时按 10 文件 / 800 行阈值拆分 |

## 6. Review Gate

**结论：R3 Pass**（`standard`，2026-11-21）。

- 轮次：R1 `standard` **Reject**（3 blocker / 2 warning / 5 suggest）→ R2 `standard` **Reject**（1 blocker / 0 warning / 2 suggest；R1 的 3 blocker + 2 warning + 5 suggest 全部关闭）→ R3 `standard` **Pass**（0 blocker / 0 warning / 0 suggest；R2 的 1 blocker + 2 suggest 关闭）。
- R1 blocker：① 7 条主线缺「为何不拆阶段」→ §1 补理由；② §2 缺 `依赖` 要素 → 新增 `依赖` 列并补齐 14 行；③ P2 单 Demo 抽屉候选随整行删除 → `backlog.md` §1.6 恢复独立行，§4 改为「P1 迁出 / P2 保留」。
- R2 blocker：恢复行把 P1 写成「未纳入本阶段」，与 M6 冲突 → 改为「P1 已纳入 Phase 39（M6-1 / M6-2）；P2 未纳入」。
- 验证：`check:stage-counts`（Phase 39 7 / 14，条目行 14，载体 2）/ `check:planning-numbers` 0 命中 / `lint:md:check` / `docs:check:links`（641 md）/ `docs:check:integrity`（638 md）/ `check:governance-records` / `check:governance-counts` 均 exit 0。
- 用时：R1 启动 00:13:34，R2 启动 00:24:07（R1 + 修复间隔 10 分 33 秒，R1 独立审计用时未单独截取）；R2 启动 00:24:07，R3 启动 00:27:35；R3 结论返回约 00:30（≤ 3 分钟）。各轮均按 standard 档收敛，未扩张范围。
- 未覆盖边界：M5-1 守卫尚未实现，进度表 / 条目表状态词映射仍靠人工核对；`.session` 为 gitignored、未进 diff；本次无代码 / 依赖 / 样式 / 发布改动，未运行 `typecheck` / 单测 / 构建 / `pnpm verify`（非最低验证要求）。
- 证据记录：`artifacts/review-gate/2026-11-21-phase39-registration.md`（gitignored，含 R1 / R2 / R3 明细）。

## 7. 验收与回扫

- 阶段完成时按[规划规范 §7](../../standards/planning.md) 归档：`todo.md` 清空、`roadmap.md` 更新、`todo-archive.md` 入窗、`recurring.md` 门槛复核、三段式回扫。
- `.session` 阶段态在登记 / 范围变更 / 归档三类事件同批同步。
- 本阶段不发布，`latest` 维持 `1.3.0`。
