# Phase 34 M1-5：P1 icon-only 第二批（日历导航 / 弹层触发器 / 容器内关闭）

> 创建时间：2026-11-15
> 触发：用户「按照合适的顺序推进当前阶段的待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M1-5 行。

## 1. 交付面（10 文件）

| 面 | 文件 |
|:---|:---|
| 触发面（7 源文件） | `calendar/calendar-view.vue`（上 / 下月，单日期与范围两族共用）、`color-picker/color-picker.vue`（触发器色块）、`color-picker/color-picker-panel.vue`（面板色板）、`date-picker/date-picker.vue`（触发器日历图标）、`file-upload/file-upload.vue`（已选文件的移除按钮）、`image/image.vue`（预览入口图标 / 遮罩关闭按钮）、`message/message.vue`（关闭按钮） |
| 单测（3） | `tooltip/icon-tooltip-integration.test.ts` 追加 8 例（沿用 M1-4 的集中覆盖文件，未新建文件）；`image/image.test.ts` 的 Esc 用例改为「先关提示、再关遮罩」两步（原因见 §2 第 8 条）；`color-picker/color-picker.test.ts` 改为统一登记卸载（提示接线引入 portal 补丁，不卸载会在 body 清空后报错） |

治理索引、记录本体、规范条文（F14 规则）与规划状态位属登记 / 留痕，不计入上表。登记预算为 ≈ 8（7 源文件 + 单测），实测 10：多出的 2 个是既有测试文件的必要调整（`image.test.ts` 的 Esc 用例、`color-picker.test.ts` 的挂载登记），未新建文件，仍在上限 10 文件阈值内。

Alert 的关闭按钮**不改文件**：`alert.vue` 是 `CaomeiMessage` 的语义薄封装，`close-label` / `closable` 逐项透传，关闭按钮即 Message 的实现，提示随 Message 同批生效（见 §3 的 Alert 用例）。**未新增任何公开 prop**。

## 2. 决策

1. **复用内部 `CaomeiIconTooltip`**（M1-2 引入），内容一律取各触发面既有的可访问名：`calendar.prev` / `calendar.next`、`colorPicker.label`、色板色值（= `aria-label`）、`datePicker.label`、`移除 <文件名>`、`image.preview` / `image.close`、`message.close`。提示文本与可访问名同源，不会漂移。
2. **提示挂在触发器内部的图标 / 色块上**：ColorPicker / DatePicker 的按钮由 `CaomeiPopoverTrigger`（`as-child`）自持，再外包一层提示触发器会多一级 `as-child` 并把开合职责叠在同一个元素上。故提示触发器落在按钮**内部**的色块 / 日历图标上：悬停该区域显示提示，触发器按钮本体与开合行为零改动。代价是 `aria-describedby` 落在**不可聚焦**的内层元素上，键盘 / 读屏用户拿不到这条描述——可访问名与提示文本同源（都取 `triggerLabel`），名称层面无语义损失，接受该取舍。
3. **ColorPicker 面板内「图标按钮」= 色板色块**：面板里唯一没有可见文本的按钮是 `radiogroup` 的色板色块，提示内容取色值（与 `aria-label` 同值）。面板本身是浮层，提示面板不能压住色块的可点击区域——鼠标与键盘两条路径都实测：悬停 / 聚焦首块时，`elementFromPoint` 在该块与其余三块中心都命中自身；提示面板与四块色板的矩形均无交集（鼠标路径下提示显示在色板行上方，键盘路径下会覆盖十六进制输入行的可见区域；两态均与色板矩形无交集，指针离开触发器后提示即关闭）。停用（`disabled`）时提示接线不挂载，子元素照常渲染。未在应用根部放置 `CaomeiTooltipProvider` 时，每条提示各建一层兜底 Provider，相邻色板之间不共享「免延迟」——面板内滑过色板会逐块等待 `delayDuration`，属已知行为。
4. **Calendar 导航加 `ignore-non-keyboard-focus`**：宿主打开时会把焦点交给面板内首个可聚焦元素（上 / 下月按钮）。不加该标记时，打开 DatePicker 的瞬间就会弹出「上个月」，且该提示会让第一次 Esc 只关提示、第二次才关面板（实测：`capture:styles` 的触发器开合采样因此判面板未脱离）。加上后打开不再弹提示，Esc 一次关面板；键盘 Tab 聚焦仍显示。
5. **Image 关闭按钮同样加 `ignore-non-keyboard-focus`**：遮罩打开即程序化聚焦关闭按钮，理由同上；预览入口图标不加（只在指针悬停 / 键盘聚焦时显示）。
6. **`v-if` 位置**：`message` 的 `closable`、`date-picker` 的 `showIcon` 移到提示包装层（提示触发器要求单一子元素），按钮 / 图标自身的渲染条件不变；`image` 的预览入口条件（`preview && status === 'loaded'`）仍留在 `DialogTrigger` 上，提示包装层无条件；`file-upload` 的移除按钮本来只有 `:disabled`、没有渲染条件，`:disabled` 留在按钮上，提示以同值停用。
7. **`color-picker.test.ts` 改为统一登记卸载**：面板色板与触发器色块都带提示接线（portal + 异步补丁）。原用例只清空 `document.body`、不卸载实例，全量跑时报 `Cannot read properties of null (reading 'insertBefore')` 的 unhandled error（`pnpm verify` exit 1）。按 Dialog 用例既有写法登记挂载实例，`afterEach` 先卸载再清 body。
8. **`image.test.ts` 的 Esc 用例分两步**：happy-dom 没有 `:focus-visible` 启发式，遮罩打开时程序化聚焦关闭按钮会连带打开提示，于是第一次 Esc 只关提示。真实浏览器不受影响（`ignoreNonKeyboardFocus` 生效，打开时不弹提示、一次 Esc 即关遮罩，已实测）。用例改为「先关提示、再关遮罩」并注明差异，断言口径不变。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | 追加 8 例（Calendar 双键各断言、DatePicker 图标、FileUpload 移除、ColorPicker 触发器、ColorPicker 面板色板、三者停用不挂载、Image 入口 + 关闭、Message / Alert 关闭）；集中文件 18 例通过（10 例为 M1-4 基线 + 本批 8 例），`image.test.ts` 24 例通过 |
| 真实 Chromium | 10 个显示面逐点核对，提示文本 = 可访问名（上个月、下个月、颜色、日期、移除 a.txt、预览图片、关闭 ×3：遮罩 / Message / Alert、色值 `#e63946`），10 = 上述逐点清单求和；悬停前后 `boundingBox` 逐项一致；`disabled` 的 ColorPicker / DatePicker 悬停无面板；遮罩打开时不自动弹提示，悬停关闭按钮显示「关闭」 |
| Esc 分层 | 真实浏览器：遮罩打开（关闭按钮已程序化聚焦）不弹提示，一次 Esc 关遮罩；悬停关闭按钮后再 Esc，依次关提示、关遮罩；DatePicker 打开后焦点落在日历导航上亦不弹提示，一次 Esc 关面板 |
| 命中测试 | ColorPicker 面板：悬停首块时次块中心 `elementFromPoint` 仍解析为次块按钮（`#f59e0b`）；键盘路径（聚焦首块 + 方向键两次后聚焦第三块）下，四块色板中心均命中自身，提示矩形与四块色板矩形无交集（截图 `m1-5-color-keyboard.png` 为一次性探针产物，未入库） |
| `capture:styles` | 0 差异（399 项） |
| 视觉回归 | 42 passed（0 diff） |
| E2E | `overlay-stacking` / `color-picker-swatches` / `date-picker-range` / `hit-target` 42 passed（含「面板在模态内容之上」「Esc 只关面板」「17 个表单控件盒命中区」） |

## 4. Review Gate

- **R1（`standard`，A 实现 / B 记录两分区并发）**：A `Pass`（0 blocker；2 warning：新增注释含批次编号且无文档路径、面板色板键盘聚焦路径缺视觉证据；5 suggest：Esc 用例补提示态断言、停用面补单测、Alert 用例用全局索引、内层触发器 a11y 取舍落字、无 Provider 时逐块实例化 Provider）。B `Reject`（2 blocker：`check-planning-numbers` 在本批注释处 exit 1；记录「11 个触发点」与逐点清单求和（10）不闭合；3 warning：Calendar「双键」覆盖夸大于用例、§1 缺治理载体口径与预算差异、§2 第 6 条 file-upload 表述与实现不符）。
- **R1 修复**：注释改为行为描述并复跑 `check-planning-numbers` → 0 命中；触发面计数改为 10 并逐点枚举（关闭 ×3）；Calendar 用例补下月断言；新增停用（DatePicker / ColorPicker / 面板色板）不挂载用例；Alert 用例改用 `.caomei-alert` 作用域查询；`image.test.ts` 首个 Esc 前后各断言提示开 / 合；补键盘路径命中证据；§1 补治理载体口径与预算差异；§2 第 6 条按实现改写；`color-picker.test.ts` 补挂载登记（关闭全量跑出的 unhandled error）；新增 F14（验证表计数须与清单求和）并把规则写入 [AI 协作规范 §9](../../standards/ai-collaboration.md)。
- **R2（`quick`，两分区修复点）**：A `Pass`（0 blocker；W1 / W2 / S1 ~ S3 关闭；S4 / S5 转 follow-up 并于提交前补齐，另加「同选择器启用态带 `data-state`」的正向对照）；B `Pass`（0 blocker；B1 / B2 关闭、F14 与 §9 规则落地；W1 ~ W3 与 S1 ~ S3 核对通过；follow-up：§2 第 6 条的 `image` 子句、§1 排除口径、§9 前向引用——均已在本轮提交前收口）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 / F2 / F4 / F6 | 承接 M1-1 | M1-6 / M4-1、M1-7、M1-8 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F13 | P1 其余组件提示接入 | **本批关闭**（登记所列 7 个组件均已接入） |
| F14 | 记录验证表的「N 个触发点 / N 个面」须附逐点清单且总数与清单求和一致；本批曾把 10 点写成 11 | 规则已写入 [AI 协作规范 §9](../../standards/ai-collaboration.md)（Review Gate 必查）；机检候选：`check-governance-records` 增加「总数 ↔ 紧随括号清单」对账 |

## 6. 复查基线

本记录 §1 ~ §5；`calendar-view.vue` / `color-picker.vue` / `color-picker-panel.vue` / `date-picker.vue` / `file-upload.vue` / `image.vue` / `message.vue` 的触发面模板；`icon-tooltip-integration.test.ts` 的第二个 `describe`。
