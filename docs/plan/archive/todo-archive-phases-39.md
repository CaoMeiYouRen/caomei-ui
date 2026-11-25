# 待办归档（深度归档）：Phase 39

> 从主窗口迁出：2026-11-26（Phase 44 归档时）。正文逐字保留，仅链接深度机械调整。

## Phase 39：P0 组件缺口、文档站设备预览与质量收口（**2026-11-21 完成并归档；本阶段不发布**）

- 时间：2026-11-21 用户就[第二十三轮范围评估](../../design/governance/2026-11-20-next-stage-scope-evaluation-23.md) §4 裁定 D0 ③ / D1 四件全取 / D2 仅 P1 / D3 仅 5 例 / D4 不发布后登记；同日交付 **7 条主线 / 14 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**InputOtp 2 / Popconfirm 2 / Result 2 / Descriptions 3 / 治理收口 1 / 文档站设备预览 2 / E2E 质量收口 2**，构成对账 **2 + 2 + 2 + 3 + 1 + 2 + 2 = 14**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 39 登记批次](../../design/governance/2026-11-21-phase39-registration.md) §1 / §2；逐条交付对账见 [Phase 39 交付记录](../../design/governance/2026-11-21-phase39-delivery.md)。
- 非目标：不发布、不进入 `1.4.0`、不做 P2 单 Demo 抽屉、不做宽屏视觉基线 / `xl` 断点、不做 Form rules / 虚拟滚动 / i18n 二期 / 移动端第二波 / P1 高级组件、不新增运行时依赖、不做破坏性 API、不自动发布。

### M1 InputOtp（2 条）

- **M1-1 实现与测试**（`c2c6139`）：Reka `PinInputRoot` 封装；字符串 `v-model`、`length`、数字 / 字母数字、粘贴分发、`autocomplete="one-time-code"`、`inputmode`、`complete`、状态与尺寸；单测 + 浏览器 E2E（含 axe）。RG `quick` `Pass`。
- **M1-2 文档 / 示例 / 10 语台账**（`1e8a45af`）：中英组件页、basic / states 示例、§11 / 侧栏 / 总览 / 设计清单 / 画廊与 `inputOtp.cellLabel` 10 语台账；示例不打印验证码。RG `quick` `Pass`。

### M2 Popconfirm（2 条）

- **M2-1 实现与测试**（`38941fe5`）：Popover + Button 组合；标题 / 描述、危险语气、加载 / 禁用、受控 `open`、`placement`、Enter / Esc / 外部点击与焦点归还；`PopoverContent` 增加 `openAutoFocus` 事件供复合层接管焦点。RG `quick` `Pass`。
- **M2-2 文档 / 示例 / 迁移差异**（`04315968`）：中英组件页、basic / async 示例、与 `ConfirmDialog` 的分工单点声明、PrimeVue `ConfirmPopup` 迁移差异。RG `quick` `Pass`。

### M3 Result（2 条）

- **M3-1 实现与测试**（`3a003cc2`）：`success` / `info` / `warning` / `danger` / `403` / `404` / `500`；图标 / 标题 / 描述 / `#extra`；尺寸档与 `role="status"` 可关闭 live region；单测 + 桌面 / 移动 E2E。RG `quick` `Pass`。
- **M3-2 文档 / 示例 / 状态语义**（`eb0de886`）：中英组件页、basic / statuses 示例；与 `Empty` / `Message` / `Alert` 的边界单点声明。RG `quick` `Pass`。

### M4 Descriptions（3 条）

- **M4-1 实现与测试**（`fb94a90c`）：`CaomeiDescriptions` + `CaomeiDescriptionsItem`；`columns` / `bordered` / `labelWidth` / `span` / `size` / 水平垂直布局；`dl` / `dt` / `dd` 语义与 span 夹取。RG `quick` `Pass`。
- **M4-2 响应式列数与长内容**（`d4f13f7e`）：320 / 768 / 1280 列数、长内容折行、跨列边界、bordered / vertical 与暗色；`capture:styles` 0 差异。RG `quick` `Pass`。
- **M4-3 文档 / 示例 / 台账**（`fe607752`）：中英组件页、basic / layout 示例、与 `DataTable` 的边界、§11 / 侧栏 / 总览 / 设计清单 / 画廊同步。RG `quick` `Pass`。

### M5 治理收口（1 条）

- **M5-1 阶段进度表机检**（`0116ab4b`）：新增 `check-stage-progress`，校验 6 列进度表的行数、逐主线计数、状态映射、提交 / 审计 / 容量可定位与归档前置；10 类失败码、14 条单测与 CLI 负向验证，接入 `governance:check`。RG `standard` `Pass`。

### M6 文档站设备预览（2 条）

- **M6-1 iframe 整页预览**（`13284b5b`）：抽屉内同源 iframe、390 / 768 / 1024 / 1280、亮暗只写 iframe、递归抑制；一次性探针验证同源 / 媒体查询 / 暗色 / 主站不跳转。RG `standard` `Pass`。
- **M6-2 路由 / 入口 / 文档**（`a0f79fc4`）：导航栏入口、中英《移动端与响应式》新增「设备预览」节，说明 `device-preview=1`、同源主题同步与适用面。RG `quick` `Pass`。

### M7 E2E 质量收口（2 条）

- **M7-1 5 例逐例修复与负向对照**（`6f08437d`）：BackTop 夹具遮挡（视觉基线按钮位移）、SplitButton chevron scoped 选择器改为 `:deep`、DatePicker / 浮层清理、移动端冻结展开列；`overlay-stacking` 后代自证复跑；5 spec × 3 project **81 passed**。RG `standard` `Pass`。
- **M7-2 周回归稳定性与记录**（`35e81957`）：全量 E2E 首跑 **1119 passed / 12 skipped / 1 failed**（`safe-area-fixed` BackTop 偏移），改视觉基线为 `transform` 后复跑 **30 passed**；记录根因、修复点与并行 worker 采样观察项。RG `standard` `Pass`。
- **集成收口**（`630faa92`）：Nuxt 组件清单与 a11y 受检面登记 4 个新组件、locale 基准计数与设计守卫 token / `:where()` 修正。RG `standard` `Pass`。

### 阶段总结

- **7 条主线 / 14 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：执行窗口 `git log --oneline --no-merges 6e11fb1..630faa92` → **15**（14 条交付与集成收口；归档提交另计 1 个）。
- **质量门**：`pnpm verify` 全绿；全量单测 **189 文件 / 3619 例**；目标 E2E **81 passed**；全量 E2E 首跑 **1119 passed / 12 skipped**（唯一失败修复后复跑 **30 passed**）；`capture:styles` **399 项 0 差异**；`docs:check` / `governance:check` 全绿。
- **长期任务**：第 **43** 轮门槛复核（2026-11-21，Phase 39 收口轮）——见 [长期任务](../recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **19 条活跃**（< 阈值 20，不蒸馏）；`check:distill-archive` 通过。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:stage-progress`（跳过）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` / `governance:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句 / 条目表 / 进度表）/ `roadmap.md`（§1 当前态、Phase 39 行与 §5）/ `todo-archive.md`（本块入窗、Phase 33 迁出、主窗口口径句与行数）/ `archive/index.md`（phase-33 行、文件表与迁出时点）/ `recurring.md`（第 43 轮与触发义务句）/ `governance/index.md`（交付记录与归档记录两行）逐处核过；`.session` 两份文件同批切到「无进行中阶段」。
- **未处理面**：历史治理记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **真实设备验收**：OTP 短信自动填充 / 输入法、设备预览的 iOS 地址栏 `dvh` 与触摸滚动无自动化条目，随真机验收执行。
- **Popconfirm 可访问名**：dialog 名称来自触发器（Reka 内部绑定），标题名未接管；如需改为标题名须调整 `PopoverContent` 的 ARIA 接线。
- **并行 worker 动效采样**：`navigation-motion` / `selector-motion` 在并行 worker 下存在采样竞争；CI 固定 `workers=1`，不以并行结果作门禁结论。
- 其余条件触发候选见 [Backlog](../backlog.md)；启动需用户明确授权。
