# 下一阶段范围评估（第二十三轮）

> 创建时间：2026-11-20
> 触发：用户指令「开始下阶段待办规划」。
> 性质：**评估记录，不构成阶段登记**。本轮只做现状读数、候选判定、主线草案与决策点；用户裁定后另行登记 `todo.md` / `roadmap.md`（[规划规范 §3](../../standards/planning.md)）。
> 基线：`747814a`（本地；`origin/master` = `5cbe80d`，领先 1 个未推送提交）；当前无进行中阶段。

## 1. 现状读数

| 面 | 读数 |
|:---|:---|
| 版本 | `latest` = **`1.3.0`**（2026-11-14 经 CI 发布）；Phase 38 的 Cell / Tabbar / ActionSheet / Empty 尚未发布 |
| 仓库 | `master` = `747814a`（本地），工作区干净；`origin/master` = `5cbe80d`，本地领先 1 个提交（规划文档模型研判批次） |
| Issue / PR | open issue **1**（#71 规划文档模型提案，已回写研判；待存量改名批次验收）；open PR **0** |
| 安全告警 | Dependabot open **0**；Code Scanning open **0** |
| CI | `origin/master`（`5cbe80d`）Test / Security Alerts / Deploy Pages / TODO 全 success；`747814a` 未推送，无新增 run |
| 周回归 | 最近成功 **2026-11-14**（run `43591838970`）；**2026-11-20 定时 run `44733428785` cancelled**；发布前须有新的绿色周回归 |
| 下游锁定版本 | 取各仓 `pnpm-lock.yaml` 解析值（2026-11-20）：dependfix **`1.2.0`** / caomei-auth **`1.3.0`** / momei **`1.3.0`**；最近兼容 run `43590922508`（2026-11-14，三仓 success，被测 `1.3.0`），本轮未触发新 run |
| 新下游 caomei-todo | **文档阶段，尚无代码**；Phase 38 已交付其移动壳核心，Picker / NavBar / Search / 软键盘等仍为应用层先行 |
| 长期任务 | 第 **42** 轮（2026-11-20，Phase 38 收口）：待执行批次 **0 项**；条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持 |
| wisdom | **19 条活跃**（< 阈值 20）；`pnpm distill:wisdom --check` 输出 `WISDOM_OK: 19 active entries (threshold 20)` |

## 2. 候选盘点与判定

### 2.1 判定口径

- **阶段相关面**：P0 组件缺口、文档站设备预览、E2E 既有失败、阶段登记配套治理、发布收口。
- **证据优先级**：下游真实用量 > 生态对照与 Reka primitive 可用性 > 维护者目标；没有下游用量的候选必须标注为 **产品驱动 / 生态缺口**，不得写成「下游已达标」。
- **容量**：按[规划规范 §6](../../standards/planning.md) 主线 3–6（上限 8）、原子条目建议 10–15（上限 20）。
- **不新增阶段编号**：本节候选不获得 `Phase N`；编号在授权时取「已有最大编号 + 1」。

### 2.2 逐条判定

| # | 候选 | 来源 | 证据与判定 | 落点 |
|:-:|:---|:---|:---|:---|
| C1 | InputOtp（验证码输入） | Backlog §1.11（调研 **P0** / Backlog 优先级「中」）/ [调研记录](./2026-11-18-i18n-component-and-mobile-research.md) §4.2 | **P0 生态缺口**。Reka `PinInputRoot` 现成；caomei-auth 的 OTP / TOTP 流程当前用单输入框（`components/security/two-factor-panel.vue:107-112`、`pages/login.vue` 的 `CaomeiInput`；`composables/use-otp.ts` 只承载发送逻辑），可升级为分组输入；无「6 格」直接用量，属可消费的体验升级 | **阶段候选（P0）** |
| C2 | Popconfirm | Backlog §1.11 / 调研 §4.2 | **P0 生态缺口**。Element Plus / TDesign / PrimeVue 有对应件；本仓只有 `ConfirmDialog`（打断上下文）。momei 的 PrimeVue 组件清单含 `ConfirmPopup` 但无实际用法；无直接下游用量 | **阶段候选（P0）** |
| C3 | Result | Backlog §1.11 / 调研 §4.2 | **P0 生态缺口**。独立结果页语义（成功 / 失败 / 无权限）；本仓只有 Toast / Message / Empty，无页面级结果件；无直接下游用量 | **阶段候选（P0）** |
| C4 | Descriptions | Backlog §1.11 / 调研 §4.2 | **P0 生态缺口**。管理端详情页键值布局（响应式列数）；本仓可用 `Row` / `Col` 拼，但缺语义与列数规则；无直接下游用量 | **阶段候选（P0）** |
| C5 | Empty | [调研记录](./2026-11-18-i18n-component-and-mobile-research.md) §4.2 / Phase 38 M3-2 | 已于 Phase 38 M3-2 交付；不再作为候选 | 已交付 |
| C6 | Form 校验能力 | Backlog §1.11 P1 | **结构性缺口**：`Form` 明确无 rules 引擎；接入 `FormRoot` / `Field*` 可先做 ARIA 与错误展示，但 API 形态、错误聚合、与 zod 的关系都需单独设计；本阶段不展开 | 维持 Backlog |
| C7 | DataTable 虚拟滚动 | [Phase 36 M2-2 评估](./2026-11-17-phase36-m2-2-virtual-scroll-evaluation.md) | 已评估「可行（有条件）」；触发条件 = 单页 > 200 行实测或用户裁定。无新用量证据；引入依赖 / 自研的复杂度高 | 维持 Backlog |
| C8 | 国际化二期 LTR（7 语） | Backlog §1.4 | 语言集已收敛为 7 门；但无新的下游语言需求，且 10 语 → 17 语的文案、台账、可访问名与回归面很大 | 维持 Backlog |
| C9 | locale 跟随 / 数字本地化 / 可访问名补口 | Backlog §1.4 | 中优先级 i18n 收口项；可与二期语言同批，也可单独小批次；本阶段若不做 i18n 则不单列 | 维持 Backlog |
| C10 | 文档站桌面 / 移动设备预览 | Backlog §1.6 / [设备预览评估](./2026-11-20-docs-device-preview-evaluation.md) | **P1 整页 iframe 预览约 3–4 天**；触发条件「Phase 38 M4-1 移动端适配指南落地」已满足。属文档站体验增强，不改变库 API | **可选阶段候选（文档）** |
| C11 | E2E 装置既有失败清理 | Backlog §1.6 / Phase 38 归档 §7 | 5 例已在干净 HEAD 复现：`back-top` 夹具遮挡、`overlay-stacking` 命中自证、`navigation-motion` SplitButton chevron、`selector-motion` DatePicker 入场 / reduce、`data-table-scroll` 行展开区。属质量债，修复须逐例负向对照 | **可选阶段候选（质量）** |
| C12 | 宽屏视觉基线 / `xl` 断点 | Backlog §1.6 / [视口扩面评估](./2026-11-20-viewport-matrix-expansion-evaluation.md) | 触发条件未命中（无真实宽屏回归 / 无 1536+ 需求）；`xl` 属公共 API 增量，规则未定前不加空断点 | 维持 Backlog |
| C13 | 移动端第二波（Picker / NavBar / Search / Sticky / 软键盘） | Backlog §1.5 | caomei-todo 尚无代码；Phase 38 已交付移动壳核心，第二波均为应用层先行或需真机反馈 | 维持 Backlog |
| C14 | P1 高级组件（Tree / Transfer / Cascader / Timeline） | Backlog §1.11 P1 | 体量与风险高于 P0；Tree 依赖 Reka Alpha、需锁版本与回归；应在 P0 组件稳定后另立阶段 | 维持 Backlog |
| C15 | 规划文档模型存量分片改名 + 机检 | Backlog §1.6 / [研判记录](./2026-11-20-planning-doc-model-v1-evaluation.md) | 机械治理批次，实际链接面 135 处 / 23 文件；与功能阶段混批会放大 diff 与回滚面 | **独立批次，不占阶段主线** |
| C16 | `1.4.0` 发布 | 阶段收口 | Phase 38 的 4 个新组件尚未发布；若本阶段交付 P0 组件，阶段末发布可让下游消费 | **阶段收口候选** |
| C17 | 依赖 / 工具链升级 | Backlog §1.6 | `typescript` 7 / `conventional-changelog` 8 / `glob` override 均被上游或兼容性阻塞；无本轮可执行项 | 维持 Backlog |
| C18 | momei 侧迁移执行 | Backlog §1.8 | 执行主体为 momei，本仓等待反馈；不构成本阶段候选 | 等待外部反馈 |
| C19 | 阶段进度表机检 | Backlog §1.6 / [规划规范 §7](../../standards/planning.md) | 新阶段登记即触发（progress 表 6 列 + 行数 / 状态 / 已闭环数对账）；属阶段登记配套治理，应在登记同批落地 | **阶段候选（治理）** |

**候选覆盖声明**：逐小节在册行数：§1.1 **1** / §1.2 **2** / §1.3 **0** / §1.4 **7** / §1.5 **7** / §1.6 **17** / §1.7 **1** / §1.8 **1** / §1.9 **1** / §1.10 **0** / §1.11 **19** = **56 行**。本轮逐条判定 **19 项**（C1 ~ C19）：阶段相关 **8 项**（C1 ~ C4 / C10 / C11 / C16 / C19）、已交付 **1 项**（C5）、独立治理批次 **1 项**（C15）、等待外部反馈 **1 项**（C18）、维持 Backlog **8 项**（C6 ~ C9 / C12 ~ C14 / C17）。**未列入 C1 ~ C19 的在册行，其落点 = Backlog 原行**（保留原优先级与触发条件，本轮不改动、不重排）；**逐条均有落点，无静默豁免**。

## 3. 主线草案（待用户裁定）

> 本节是候选 → 主线的唯一映射口径；条目为草案，不构成登记。推荐核心为 **M1 ~ M5**（5 主线 / 11 条）；可选项 M6 / M7 由 D0 / D2 / D3 决定。

| 主线 | 候选 | 原子条目（草案） |
|:---|:---|:---|
| M1 InputOtp | C1 | M1-1 实现与测试；M1-2 文档 / 示例 / 10 语可访问名与台账 |
| M2 Popconfirm | C2 | M2-1 实现与测试；M2-2 文档 / 示例 / 迁移差异 |
| M3 Result | C3 | M3-1 实现与测试；M3-2 文档 / 示例 / 状态语义 |
| M4 Descriptions | C4 | M4-1 实现与测试；M4-2 响应式列数与长内容；M4-3 文档 / 示例 / 台账 |
| M5 治理与发布收口 | C19、C16 | M5-1 阶段进度表机检；M5-2 `1.4.0` 发布与发布后校验 |
| M6 文档站设备预览（可选） | C10 | M6-1 iframe 整页预览；M6-2 路由 / 入口 / 文档；M6-3 单 Demo 抽屉（P2，D2 ②）；M6-4 Demo 注册表 / 预览路由（P2，D2 ②） |
| M7 E2E 质量收口（可选） | C11 | M7-1 5 例逐例修复与负向对照；M7-2 周回归稳定性与记录 |

**构成对账**：核心 2 + 2 + 2 + 3 + 2 = **11 条**；叠加 M6（P1 2 条）/ M7（2 条）后为 11 + 2 + 2 = **15 条**；若 D2 ② 再取 P2，则 M6 追加 2 条，总计 **17 条**（超建议区间、未超硬上限 20）。

### M1 InputOtp

- **范围**：封装 Reka `PinInputRoot`；`v-model` 字符串、长度、数字 / 字母数字、粘贴分发、`autocomplete="one-time-code"`、`inputmode`、完成事件、禁用 / 只读 / invalid / size / label；10 语可访问名与台账。
- **非目标**：不做短信发送、倒计时、验证码校验或风控；不把安全承诺写进组件。
- **验收下限**：逐格输入 / 退格 / 方向键 / 粘贴 / 自动提交；焦点顺序与完成态；320 视口不溢出；亮暗与预设；`check:locale-keys` / 台账；单测 + E2E。
- **风险**：OTP 属敏感输入，日志与示例不得打印验证码；`autocomplete` 与密码管理器行为需实测。

### M2 Popconfirm

- **范围**：基于 Popover + Button 的轻量确认；标题 / 描述、确认 / 取消文案、`tone="danger"`、`loading` / `disabled`、`@confirm` / `@cancel`、受控 `open`、placement、焦点归还。
- **非目标**：不替代 `ConfirmDialog`；不做异步请求内部管理；不新增 primitive。
- **验收下限**：Enter / Esc / 外部点击三条关闭路径；焦点陷阱与归还；嵌套浮层层级不回归；320 / 768 / 1280；亮暗；10 语；单测 + E2E。
- **风险**：与 Select / DropdownMenu / Dialog 的嵌套层级和外部点击隔离需复用现有隔离工具并补负向用例。

### M3 Result

- **范围**：状态（success / info / warning / danger / 403 / 404 / 500）、图标、标题、描述、`#extra`、尺寸档；不接路由。
- **非目标**：不做页面布局 / 导航；不内置业务文案；不复制 `Empty` 的空态语义。
- **验收下限**：状态图标与语气可辨；320 不裁切；`role="status"` 或等价语义；亮暗；中英示例；单测 + E2E。
- **风险**：与 `Empty` / `Message` / `Alert` 的边界需在文档中单点声明，避免四套「结果 / 空态」口径。

### M4 Descriptions

- **范围**：`CaomeiDescriptions` + `CaomeiDescriptionsItem`；`columns` 响应式（1 / 2 / 3 / 4）、`bordered`、`labelWidth`、`span`、`size`、垂直 / 水平布局；`dl` / `dt` / `dd` 语义。
- **非目标**：不做数据请求、排序、筛选；不替代 `DataTable`；不引入表格布局。
- **验收下限**：320 / 768 / 1280 列数与换行；长内容不溢出；`span` 边界；亮暗；中英示例；单测 + E2E。
- **风险**：响应式列数在窄屏可能退化为 1 列，需与文档站示例和 `capture:styles` 同批验证。

### M5 治理与发布收口

- **范围**：① 阶段进度表机检——按[规划规范 §7](../../standards/planning.md) 校验 `todo.md` 的 6 列表（行 = 主线、状态四值、`提交` 列、归档时 `小条目` 已闭环数之和 = 条目表 `已交付` 行数），扩展 `check-stage-counts` 或新增守卫；② `1.4.0` 经 CI 发布、版本句 / CHANGELOG / `exports` / 产物冒烟、发布后校验。下游兼容复验由 D4 ③ 决定，不默认包含。
- **前置**：当周周回归为绿（最近成功 2026-11-14，2026-11-20 定时 run cancelled）+ 用户明确授权。
- **非目标**：不自动发布、不进入 2.0、不重指 tag、不改发布触发模型。
- **条目**：M5-1 阶段进度表机检；M5-2 发布与发布后同步。

### M6 文档站设备预览（可选）

- **范围**：P1 整页设备预览（iframe + 设备档切换）；路由 / 导航入口；文档说明。D2 ② 追加 P2 单 Demo 抽屉预览与 Demo 注册表 / 预览路由。
- **非目标**：不做内联拖拽切换；不改组件库 API。
- **验收下限**：iframe 内 `@media` 生效；设备档切换不刷新主站；桌面 / 移动 / 暗色三态；构建与链接门禁；P2 追加时 Demo 注册表与预览路由可对账。
- **风险**：文档站 CSP / iframe 同源 / 预览路由与 SSG 的兼容需先验证；P2 会引入 Demo 注册表维护面。

### M7 E2E 质量收口（可选）

- **范围**：5 例既有失败逐例修复：`back-top` 夹具遮挡、`overlay-stacking` 模态内容后代命中自证、`navigation-motion` SplitButton chevron、`selector-motion` DatePicker 入场 / reduce、`data-table-scroll` 行展开区；逐例负向对照。
- **非目标**：不做全量 E2E 重构；不混入功能改动；不降低断言强度。
- **验收下限**：5 例在干净 HEAD 从失败转通过；回退修复后至少 1 例重新失败；周回归恢复绿色。
- **风险**：既有失败可能含 flaky 或夹具设计问题，修复须逐例定性，不得用放宽断言过关。

## 4. 推荐组合与决策点

**推荐核心**：**M1 ~ M5**（4 个 P0 组件 + 阶段进度表机检 + `1.4.0` 发布，5 主线 / 11 条）。理由：

- P0 组件是当前 Backlog 中最具体、最可独立验收的缺口；Reka primitive 现成，封装成本主要在样式 / 文档 / 测试。
- Phase 38 的移动组件尚未发布，`1.4.0` 可让下游消费；发布是自然收口。
- 阶段进度表机检是新规划模型的登记配套（触发条件 = 下一次阶段登记），不单独占阶段。
- 没有新的下游驱动项可纳入：momei 迁移由对方执行、caomei-todo 无代码、i18n 二期无新语言需求、Form rules / 虚拟滚动体量与风险更高。
- 文档预览与 E2E 质量债有价值，但可作为可选主线；若全取（P1 only），7 主线 / 15 条，已在建议上限；若 D2 再取 P2，则 17 条，登记记录须写「超过 15 条为何不拆阶段」（[规划规范 §6](../../standards/planning.md)）。

### 决策点

- **D0 阶段取向**：
  ① **P0 组件缺口 + 治理 / 发布**（推荐；M1 ~ M5，5 主线 / 11 条）
  ② **P0 组件 + 文档站设备预览 + 治理 / 发布**（M1 ~ M6，6 主线 / 13 条）
  ③ **P0 组件 + 文档预览 + E2E 质量收口 + 治理 / 发布**（M1 ~ M7，7 主线 / 15 条；需写不拆阶段理由）
  ④ **质量收口 + 文档预览 + 治理 / 发布**（零新组件；M5 + M6 + M7，3 主线 / 6 条）
- **D1 组件范围（D0 取 ① ~ ③ 时生效）**：
  ① **四件全取**（InputOtp / Popconfirm / Result / Descriptions；推荐）
  ② 仅 InputOtp + Popconfirm（输入与交互优先）
  ③ 仅 Result + Descriptions（管理端详情优先）
  ④ 仅 InputOtp + Result（登录与结果页优先）
- **D2 文档站设备预览（D0 取 ② / ③ / ④ 时生效）**：
  ① **仅 P1 整页预览**（推荐；M6-1 / M6-2）
  ② P1 + P2 全取（M6 追加 M6-3 / M6-4，+2 条）
  ③ 不纳入
- **D3 E2E 质量收口（D0 取 ③ / ④ 时生效）**：
  ① **仅 5 例既有失败**（推荐；M7-1 / M7-2）
  ② 不纳入
- **D4 发布**：
  ① **阶段末发 `1.4.0`**（推荐；前置 = 绿色周回归 + 用户授权）
  ② 不发布（`latest` 维持 `1.3.0`）
  ③ 发布 + 下游三仓复验（发布后补兼容 run）

**默认落定（无需单独提问）**：

- 阶段进度表机检纳入 M5-1；不另立阶段。
- 规划文档模型存量分片改名 + 机检为**独立机械批次**，不占阶段主线；触发 = 下一次归档压缩批次或用户单独授权。
- 本阶段不纳入 Form rules、DataTable 虚拟滚动、i18n 二期、移动端第二波、P1 高级组件、宽屏 `xl` 断点；理由见 §2.2，维持 Backlog。
- 若 D0 取 ③，登记记录须写「7 主线为何不拆阶段」；若 D1 只取部分组件，主线数相应减少。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| P0 无直接下游用量 | 组件可能按生态对照过度设计 | API 最小化、插槽优先；文档示例覆盖真实场景；下游落地后按反馈再扩 |
| OTP 敏感输入 | 示例 / 日志泄露验证码；密码管理器行为不一致 | 示例不打印值；补 `autocomplete="one-time-code"` / `inputmode`；真实浏览器验证 |
| Popconfirm 嵌套浮层 | 与 Dialog / Select / DropdownMenu 的层级和外部点击冲突 | 复用既有隔离工具；补嵌套与外部点击负向用例 |
| Result / Empty / Message 边界 | 四套「结果 / 空态」口径并存 | 文档单点声明：Result 页面级、Empty 区块级、Message 即时反馈 |
| Descriptions 响应式 | 窄屏列数退化导致溢出 | 320 / 768 / 1280 三档断言；长内容换行；`capture:styles` |
| 发布前置 | 2026-11-20 周回归 cancelled；最近绿色为 2026-11-14 | 发布前重跑周回归；未绿则 M5-2 阻塞，不降级发布 |
| 文档预览 | iframe / CSP / SSG 兼容 | 先做一次性探针；失败则退 P2 或 Backlog |
| E2E 既有失败 | 可能是夹具设计而非产品缺陷 | 逐例定性 + 负向对照；不放宽断言 |
| 阶段容量 | 全取（P1 only）7 主线 / 15 条已到建议上限；D2 ② 后 17 条超建议区间 | D0 ③ 与 D2 ② 需写「为何不拆阶段」；实施时按 10 文件 / 800 行阈值拆分 |

## 6. 声明与落点

- 本记录只做评估：未分配阶段编号、未改 `todo.md` / `roadmap.md`、未改 `src/**`、未新增依赖。
- Backlog 本轮不改动；P0 组件候选仍在 §1.11，设备预览 / E2E 仍在 §1.6。
- 用户裁定 D0 ~ D4 后，按[规划规范 §4](../../standards/planning.md) 取「已有最大编号 + 1」登记（授权时再写定值），并同批同步 `todo.md` / `roadmap.md` / 治理索引 / `.session`；登记记录须写主线 / 条目构成对账与 Review Gate。
- 若 D0 取 ①，建议登记为 **5 条主线 / 11 条原子条目**（M1 2 / M2 2 / M3 2 / M4 3 / M5 2；构成对账 2 + 2 + 2 + 3 + 2 = 11）。

## 7. Review Gate

**结论：R3 Pass**（`standard`，2026-11-20）。

- 轮次：R1 `standard` **Reject**（3 blocker / 2 warning / 3 suggest）→ R2 `standard` **Reject**（1 blocker / 0 warning / 1 suggest；R1 的 3 blocker + 2 warning + 3 suggest 全部关闭）→ R3 `standard` **Pass**（0 blocker / 0 warning / 0 suggest；R2 的 1 blocker + 1 suggest 关闭）。
- R1 blocker：① 提名期写定「Phase 39」→ 改为「已有最大编号 + 1，授权时再写定值」；② D0 ② 映射与构成不一致 → 改为 M1 ~ M6 / 6 主线 / 13 条，并统一 D0 ① ~ ④ 计数；③ 覆盖声明缺逐小节计数且漏「阶段进度表机检」→ 补 56 行逐节计数 + C1 ~ C19 分组，新增 C19 并入 M5-1。
- R2 blocker：治理索引摘要仍写 10 条 → 改为 11 条（四组件 + 进度表机检 + 发布）。
- 验证：`lint:md:check` / `docs:check:links`（640 md）/ `docs:check:integrity`（637 md）/ `check:governance-records` / `check:governance-counts` / `check:stage-counts` / `check:planning-numbers` / `check:standards-redundant:strict` / `docs:check:line-count` 均 exit 0。
- 用时：R1 启动 23:21:55，R2 启动 23:32:13（R1 + 修复间隔 10 分 18 秒，R1 独立审计用时未单独截取）；R2 启动 23:32:13，R3 启动 23:34:52；R3 工件落盘 23:35:31（约 39 秒）。各轮均按 standard 档收敛，未扩张范围。
- 未覆盖边界：未重读全量 diff（轮次范围冻结）；未逐条核验 Backlog 全部 56 行，只核验 §1.4 / §1.5 / §1.6 / §1.11 与逐节计数；未执行代码类门禁（无代码改动）。
- 证据记录：`artifacts/review-gate/2026-11-20-backlog-scope-evaluation-23.md`（gitignored，含 R1 / R2 / R3 明细）。
