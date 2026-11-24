# 待办归档（深度归档）：Phase 36 ~ Phase 37

> 本文件由主窗口机械迁出（2026-11-24，Phase 42 归档批次）；权威记录仍是各阶段治理记录。

---

## Phase 36：浮层隔离扩面、DataTable 列宽拖拽与虚拟滚动评估、质量治理、选择器空值诊断（**2026-11-18 完成并归档；本阶段不发布**）

- 时间：2026-11-17 用户就[第二十轮范围评估](../../design/governance/2026-11-16-next-stage-scope-evaluation-20.md) §4 裁定 D0 A / D1 全部浮层 / D2 拖拽 + 评估 / D3 不发布 / D4 `deepmerge` 维持接受登记后登记；同日追加 M1-5 / M2-3，再经插队追加 M4-1 / M4-2；2026-11-18 交付 **4 条主线 / 12 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**无障碍扩面 5 / DataTable 交互 3 / 质量治理 2 / 选择器空值诊断 2**，构成对账 **5 + 3 + 2 + 2 = 12**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 36 登记批次](../../design/governance/2026-11-17-phase36-registration.md) §1 / §2。
- 非目标：不新增运行时依赖（虚拟滚动只评估）、不改变 `''` 作为「未选中」的模型语义、i18n 二期 / RTL、Form 规则引擎、`useDialog`、Sidebar / ScrollPanel、破坏性 API、自动发布。

### M1 无障碍扩面（5 条）

- **M1-1 隔离工具多浮层边界**（`9146fe4`；记录见 [M1-1](../../design/governance/2026-11-17-phase36-m1-1-multi-overlay-isolation.md)）：`suppressOutside` 改为活动层登记 + 每次重算，活动层与写入记录按 `body` 分组，先关者不提前解除、跨文档互不影响；RG R1 `Reject`（跨文档误清）/ R2 `Reject`（释放分支整片隔离）/ R3 `Pass`。
- **M1-2 MultiSelect / AutoComplete 打开态补 `inert`**（`5c720fc` / `a77b7d9`；记录见 [M1-2](../../design/governance/2026-11-17-phase36-m1-2-combobox-open-inert.md)）：多根隔离（面板 + 字段），关闭同步回退，Tab / Shift+Tab 交接焦点、Escape 交还输入框；隔离工具同时配对 `aria-hidden`；RG R1 `Reject`（字段被隔离致输入失效）/ R2 `Reject`（Tab 焦点落 body）/ R3 `Pass`。
- **M1-3 DatePicker / ColorPicker 打开态补 `inert`**（`bf55466`；记录见 [M1-3](../../design/governance/2026-11-17-phase36-m1-3-date-color-picker-inert.md)）：面板 + 触发器双根，`inline` 形态不隔离，模态内打开保留触发器祖先链；RG R1 `Pass`（5 warning / 4 suggest 同批修）。
- **M1-4 全库浮层回归与边界记录**（`eb2c5fd`；记录见 [M1-4](../../design/governance/2026-11-18-phase36-m1-4-overlay-regression.md)）：逐组件判定「已隔离 / 本批补 / 不采用」并给出理由，枚举锚点对齐 `check-overlay-z-index` 受检集合；RG R1 `Reject`（漏 `ConfirmDialog` / `Image` 预览）/ R2 `Pass`。
- **M1-5 DropdownMenu / Popover 打开态补 `inert`**（`e2fab21`；记录见 [M1-5](../../design/governance/2026-11-17-phase36-m1-5-dropdown-popover-inert.md)）：抽出 `useOpenStateIsolation`（`data-state` 驱动）+ 触发器根 provide/inject，`forceMount` 可隔离；RG R1 `Reject`（2 blocker：触发器被隔离打红 `overlay-motion`、`forceMount` 不隔离）/ R2 `Pass`。

### M2 DataTable 交互（3 条）

- **M2-1 列宽拖拽手柄**（`ae61ba2`；记录见 [M2-1](../../design/governance/2026-11-18-phase36-m2-1-column-resize-handle.md)）：新增 `resizableColumns`（默认关闭），指针拖拽 / 方向键 ±8px / 双击复位，受控经 `update:columnSizing`；选择列与展开列无手柄；RG R1 `Reject`（3 blocker：基准宽度、冻结列表述、无指针证据）/ R2 `Pass`。
- **M2-2 虚拟滚动可行性评估**（`1e2664a`；记录见 [M2-2](../../design/governance/2026-11-17-phase36-m2-2-virtual-scroll-evaluation.md)）：候选体积与许可证、SSR 回退、动态行高、六类兼容风险与触发条件；结论「可行（有条件）」，本阶段不实现、不加依赖；RG R1 `Pass`（4 warning / 2 suggest 同批修）。
- **M2-3 列宽持久化示例与契约说明**（`3d1418b`；记录见 [M2-3](../../design/governance/2026-11-17-phase36-m2-3-column-sizing-persist-example.md)）：中英 `column-sizing-persist.vue`（读取 / 保存 / 清除 / 越界回退）+ 组件页说明；RG R1 `Reject`（`.demo-stack` 无样式）/ R2 `Pass`。

### M3 质量治理（2 条）

- **M3-1 Rating 文档站 a11y 抽检**（`aa36cf8`；记录见 [M3-1](../../design/governance/2026-11-17-phase36-m3-1-rating-docs-axe.md)）：中英 Rating 页入矩阵（就绪选择器 + 实测下界）；RG R1 `Reject`（批次夹带、§17 计数漂移）/ R2 `Pass`。
- **M3-2 依赖告警复核**（`b9d4bf5`；记录见 [M3-2](../../design/governance/2026-11-17-phase36-m3-2-dependency-alert-review.md)）：按分页口径实测 open 0 / fixed 70 / auto_dismissed 1，`deepmerge` 四态无记录（成因未取证）、dev-only 链路；RG R1 `Reject`（分页截断）/ R2 `Reject`（回链与索引）/ R3 `Pass`。

### M4 选择器空值诊断（2 条）

- **M4-1 空串选项值不再透传**（`e9b88b9`；记录见[调研与处置](../../design/governance/2026-11-17-select-empty-option-value-evaluation.md)）：Select / MultiSelect 归一化丢弃、AutoComplete 新增边界，开发期告警带组件标识与序号，模型侧 `''` 仍为未选中，`SelectButton` 补反例；RG 以[调研与处置](../../design/governance/2026-11-17-select-empty-option-value-evaluation.md) §7 的 R1 `Pass`（3 warning / 6 suggest，同批关闭）为准，实施侧另经 R1 / R2 两轮复审。
- **M4-2 空串契约声明**（`b710597`；同上）：中英 Select / MultiSelect 组件页与设计规范 §7 补契约、`SelectButton` 例外；RG 以调研记录 §7 的 R1 `Pass`（3 warning / 6 suggest，同批关闭）为准，实施侧另经 R1 → R2 → R3 三轮复审。

### 阶段总结

- **4 条主线 / 12 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 4f57ce6^..ae61ba2` → **16**（登记 / 追加 / 插队、十二条条目交付与规划状态回填）。
- **质量门**：`pnpm verify` exit 0（见[归档批次记录](../../design/governance/2026-11-18-phase36-archive.md) §3.1）；`master` 在 `ae61ba2` 上 CI（Test / CodeQL / Security Alerts / Deploy Pages）全绿；浮层三视口 E2E 57 条、列宽拖拽 E2E 3 条、`overlay-motion` 39 条通过；文档站 axe 打开态矩阵 23 条目 / 22 路径全绿。
- **长期任务**：第 **40** 轮门槛复核（2026-11-18，Phase 36 收口轮）——见 [长期任务](../recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 36 行）/ `todo-archive.md`（本块入窗）/ `recurring.md`（第 40 轮）/ `docs/design/governance/index.md`（归档记录行）逐处核过；`.session/current-task.yaml`、`.session/runtime-state.json` 同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **虚拟滚动**：评估结论「可行（有条件）」，触发条件 = 单页 > 200 行（经验值，立项前须实测校准）或用户裁定；在此之前不新增运行时依赖。
- **列宽拖拽的残余**：冻结列手柄吸边的像素级几何未单独断言；最小宽 48px / 步进 8px 不可配置，无 resize 结束事件。
- **浮层隔离的残余**：DropdownMenu 无独立 E2E 夹具锚点；页面级（非模态）Popover 的三视口 Tab 用例待补；`pointerdown` 解除隔离在 `disableOutsidePointerEvents` 下的窗口已记录。
- 其余条件触发候选见 [Backlog](../backlog.md)；启动需用户明确授权。

---

## Phase 37：质量收口、选择器空值 opt-in、迁移口径与 Rating 表单集成（**2026-11-19 完成并归档；本阶段不发布**）

- 时间：2026-11-18 用户就[第二十一轮范围评估](../../design/governance/2026-11-18-next-stage-scope-evaluation-21.md) §4 裁定 D0 ① / D1 ① / D2 ① / D3 ① / D4 ③ 后登记；2026-11-19 交付 **4 条主线 / 9 条原子条目**并完成阶段归档（用户指令「开始归档」）。
- 范围与授权：**质量收口 3 / 选择器空值 opt-in 3 / 迁移口径 1 / Rating 表单集成 2**，构成对账 **3 + 3 + 1 + 2 = 9**；本阶段**不发布**（`latest` 维持 `1.3.0`）。范围与验收口径的唯一载体见 [Phase 37 登记批次](../../design/governance/2026-11-18-phase37-registration.md) §1 / §2。
- 非目标：不新增运行时依赖（虚拟滚动维持「条件触发」）；不做 `emptyValues` 多值形态、i18n 二期 / RTL、`useDialog`、Sidebar / ScrollPanel、Form rules 引擎、破坏性 API、自动发布。

### M1 质量收口（3 条）

- **M1-1 列宽拖拽残余补齐**（`f827773`；记录见 [M1-1](../../design/governance/2026-11-18-phase37-m1-1-column-resize-residual.md)）：新增 `columnResizeEnd`（`{ key, width }`，键盘 / 拖拽结束 / 复位三触发点）与 `columnResizeMinWidth` / `columnResizeStep`（默认 48 / 8），冻结列手柄吸边补像素级断言；RG R1 分区 B `Reject`（1B/2W/4S，分区 A Pass）→ R2 `standard` `Pass`。
- **M1-2 浮层隔离残余补齐**（`555a023`；记录见 [M1-2](../../design/governance/2026-11-18-phase37-m1-2-overlay-isolation-residual.md)）：实测「锁定背景」Popover 在 `disableOutsidePointerEvents` 下仍被外部点击关闭，组件补外部关闭拦截；新增页面级 DropdownMenu / Popover 三视口用例；RG R1 两分区 `Reject`（分区 A 1B/4W/5S、分区 B 1B/5W/3S）→ R2 `standard` `Pass`。
- **M1-3 隔离接线下沉**（`4e95bd7`；记录见 [M1-3](../../design/governance/2026-11-19-phase37-m1-3-isolation-wiring.md)）：五组件统一 `useOpenStateIsolation`，新增可选 `open` 触发源（关闭同步回退、打开 portal 落位后补隔离），删除逐份接线；RG R1 `standard` `Pass`（W1 修复后 R2 `quick` 复核 `Pass`）。

### M2 选择器空值 opt-in（3 条）

- **M2-1 `allowEmptyValue` 契约设计**（`1e1cdbc`；记录见 [M2-1](../../design/governance/2026-11-19-phase37-m2-1-allow-empty-value-design.md)）：默认 `false`；开启后空串为真实选项值、经内部私有 token 承载；「未选择」三态（`null` / `[]` / `undefined`）与 `hasValue` / `data-filled` / `showClear` 口径；RG R1 ~ R3 `Reject`（同一守卫落点连续复发）→ R4 `quick` `Pass`（调用方显式追加预算，复发项转为三条必查负向单测）。
- **M2-2 实现**（`54e0d86`，PR #69；记录见 [M2-2](../../design/governance/2026-11-19-phase37-m2-2-allow-empty-value-impl.md)）：三组件开关、token 双向映射、`name` 自持隐藏输入、`AutoComplete` 写回路径逐条收敛；RG R1 `Reject`（3 blocker / 7 warning / 4 suggest）→ R2 `standard` `Pass`。
- **M2-3 测试与文档**（`6caee64`；记录见 [M2-3](../../design/governance/2026-11-19-phase37-m2-3-allow-empty-value-tests-docs.md)）：三组件 opt-in 正向与负向单测；中英六页把「空串不渲染」改写为「默认拒绝 + opt-in 放行」；`design-spec.md` §7 同步；RG R1 `Reject`（1 blocker / 2 warning / 4 suggest）→ R2 `quick` `Pass`。

### M3 迁移口径（1 条）

- **M3-1 哨兵与 PrimeVue 陷阱统一**（`41d2372`；记录见 [M3-1](../../design/governance/2026-11-19-phase37-m3-1-sentinel-migration-traps.md)）：迁移指南「常见陷阱」补「选项空串值」一行并只回链设计规范 §7；复算 `value: 'all'` 六处无漂移、无其它写法；RG R1 `quick` `Pass`（0 blocker / 0 warning / 2 suggest）。

### M4 Rating 表单集成（2 条）

- **M4-1 字段契约接入**（`f46d8ae`，PR #70；记录见 [M4-1](../../design/governance/2026-11-19-phase37-m4-1-rating-field-contract.md)）：`RatingProps` 继承 `FieldStateProps` + `FieldIdentityProps`，`id` / `name` / `aria-invalid` 落 `role="radiogroup"` 根，可访问名三级取值，`name` 经 RadioGroup 提交分值；RG R1 `standard` `Pass`（0 blocker / 2 warning / 3 suggest）。
- **M4-2 文档与示例**（`1ddceec`，PR #70；记录见 [M4-2](../../design/governance/2026-11-19-phase37-m4-2-rating-form-docs.md)）：中英 Rating 页补「表单集成」节与页面内示例；Form 页字段绑定表 12 → 13 并纳入 Rating；RG R1 `Reject`（2 blocker / 3 warning / 1 suggest）→ R2 `quick` `Pass`。

### 阶段总结

- **4 条主线 / 9 条原子条目全部交付**；本阶段不发布，`latest` 维持 `1.3.0`。
- **提交对账**：窗口 `git log --oneline --no-merges 011cd95^..b6bf1b4` → **13**（登记、九条条目交付与规划状态回填）。
- **质量门**：`pnpm verify` 全绿（2026-11-19，见[归档批次记录](../../design/governance/2026-11-19-phase37-archive.md) §3.1）；`pnpm capture:styles` **399 项 0 差异**；`master` 在 PR #69 / #70 合并与直推后 CI（Quality / Test & Build / Visual / CodeQL / Security Alerts / Deploy Pages）全绿。
- **长期任务**：第 **41** 轮门槛复核（2026-11-19，Phase 37 收口轮）——见 [长期任务](../recurring.md)。
- **wisdom 蒸馏**：`pnpm distill:wisdom --check` → **16 条活跃**（< 阈值 20，不蒸馏）。

### 回扫口径（三段式）

- **机检面**：`check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` 全绿。
- **人工面**：`todo.md`（清空阶段状态句与条目表）/ `roadmap.md`（§1 当前态与 Phase 37 行）/ `todo-archive.md`（本块入窗）/ `recurring.md`（第 41 轮）/ `docs/design/governance/index.md`（归档记录行）逐处核过；`.session/current-task.yaml`、`.session/runtime-state.json` 同批切到「无进行中阶段」。
- **未处理面**：历史记录中指向 `docs/plan/todo.md` 的时点陈述按既有边界不回改；本批无新增失效指针。

### 遗留与后续候选

- **空值 opt-in 的下游落地**：`allowEmptyValue` 已交付，但 `MultiSelect` 在 opt-in 下原生 `required` 校验不生效（已文档化），需要时另立条目设计提交前校验方案。
- **虚拟滚动**：维持「可行（有条件）」，触发条件 = 单页 > 200 行（需实测校准）或用户裁定。
- **隔离接线**：`PopoverContent` / `DropdownMenuContent` 仍以 `data-state` 驱动，未纳入 `open` 触发源；`ColorPicker` inline 形态不隔离的口径见 M1-3 记录。
- 其余条件触发候选见 [Backlog](../backlog.md)；启动需用户明确授权。
