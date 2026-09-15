# 2026-09-16 M2 条目 1「默认主色改蓝」浏览器验证记录

> 状态：V 阶段（`@ui-validator`）验证记录，2026-09-16。被测对象为工作区未提交改动（`src/styles/theme.css`、`src/components/{tag,badge,message}` 与 F1 修复的 `src/components/confirm-dialog`）。
>
> **结论：复验通过（F1 回归已修复）**——Reject 轮唯一回归（暗色 ConfirmDialog danger 4.07:1）复验为 **4.83:1**，全库回归扫描无新增低于阈值项；剩余 2 条失败均为既有非回归项（亮色 soft primary 4.37，待产品决策 / 登记 Backlog）。执行状态以 [待办事项](../../plan/todo.md) 为准。
>
> 关联：[待办事项 M2](../../plan/todo.md) ｜ [设计规范 §3.2](../design-spec.md) ｜ [主题与样式设计](../theming.md) ｜ [测试规范 §2.1 / §5.1](../../standards/testing.md) ｜ [UI 验证 skill](../../../.github/skills/ui-validator/SKILL.md)

## 1. 结论摘要（可回写评审记录）

**V 阶段（M2 条目 1 浏览器实机验证）：Reject 轮 核对项 52 / 失败 3 / 观察项 3 / console error 0 → 复验轮 核对项 52 / 失败 2 / 观察项 3 / console error 0，F1 已闭环 → Pass。**

- **F1（已修复）**：暗色 `CaomeiConfirmDialog` danger 确认按钮 `-solid` 实底与 `--caomei-color-primary-foreground` 配对导致的 4.07:1，现为 **4.83:1**（亮/暗/移动均 4.83）；全库无新增低于阈值项。
- **F2（非回归，待产品决策）**：亮色 soft 变体 primary 文本 **4.37**（改前 3.52，暗 5.54 通过），维持「登记 Backlog」。
- 复验摘要（一行回写）：`V 复验 Pass｜F1 暗色 ConfirmDialog danger 4.07→4.83（-solid × on-solid）｜回归扫描 140 行仅此 1 行变化、新增失败 0｜F2 亮色 soft 4.37 非回归维持 Backlog｜console/pageerror/HTTP≥400=0`。

## 2. 范围

| 维度 | 取值 |
| --- | --- |
| 入口 | VitePress dev `http://localhost:5175`（库源码直出，非构建产物） |
| 页面 | `/components/{button,tag,badge,message,checkbox,select-button,toggle-button,paginator,calendar,radio-group,stepper,toolbar,confirm-dialog,toast}` |
| 断点 | 桌面 1440×900 / 平板 768×1024 / 移动 390×844 |
| 主题 | 亮 / 暗（`html.dark` + context `colorScheme`），含「改前 token 运行时注入」对照 |
| 原始记录 | `test-results/m2-primary/`（已 gitignore，**仅作原始留痕**）：`verification-record.md`、`verification.json`、`probes.json`、`shots2.json`、`a11y.json`、`host-stability.json`、`toast-probe.json`、`pixdiff.md`、`colorprobe.md` 与全部截图、脚本 |

复现（`pnpm docs:dev` 起在 5175）：

> 取证脚本位于 gitignored 的 `test-results/m2-primary/`，**未随提交入库**，故提交后无法直接复跑；复现需按本节步骤与 §1 摘要重写脚本，或按 [Backlog](../../plan/backlog.md) §1.6「Review Gate 证据留存」的治理结果取用。D 阶段的对照脚本 `test-results/m2-primary/measure.mjs` 同理（内置 token 自检；其 `color-mix()` 底色解析不覆盖 soft 变体，故「91 配对 / 主色相关 18 → 0」口径不含 soft 类）。

```bash
BASE=http://localhost:5175 node test-results/m2-primary/verification.mjs
BASE=http://localhost:5175 node test-results/m2-primary/probes.mjs
BASE=http://localhost:5175 node test-results/m2-primary/shots2.mjs
BASE=http://localhost:5175 node test-results/m2-primary/a11y.mjs
BASE=http://localhost:5175 node test-results/m2-primary/host-stability.mjs
BASE=http://localhost:5175 node test-results/m2-primary/toast-probe.mjs
node test-results/m2-primary/pixdiff.mjs && node test-results/m2-primary/colorprobe.mjs
```

## 3. 逐项结论（关键实测值）

| 核对项 | 结论 | 关键实测值 |
| --- | --- | --- |
| 亮/暗 primary 配对（token 级） | 通过 | 亮 `#2563eb×#fff = 5.17`；暗 `#60a5fa×#0b0b0d = 7.73` |
| Button 默认 primary | 通过 | 亮 5.17（改前 4.17）；暗 7.73（改前 4.17） |
| Button `tone-primary` / 各 tone 实底 | 通过 | 亮 5.17 / 暗 5.17（`-solid` + `on-solid`） |
| Tag solid（primary / neutral） | 通过 | 均 5.17（亮/暗）；neutral 7.73（`#52525b` + #fff） |
| Badge solid primary | 通过 | 亮 5.17；暗 5.17 |
| Message solid primary（本体/标题/描述/图标） | 通过 | 亮 5.17；暗 5.17 |
| Checkbox 选中控件/勾 | 通过 | 亮 5.17；暗 7.73 |
| SelectButton 激活项 | 通过 | 亮 5.17；暗 7.73 |
| ToggleButton 按下 | 通过 | 亮 5.17；暗 7.73 |
| Paginator 当前页 | 通过 | 亮 5.17；暗 7.73 |
| Calendar 选中日 | 通过 | 亮 5.17；暗 7.73 |
| Stepper 激活指示器 / 标题 | 通过 | 指示器 5.17 / 7.73；标题 亮 4.83（改前 3.89）、暗 7.04（改前 4.29） |
| Toolbar 激活按钮 | 通过 | 亮 5.17；暗 7.73（3:1 阈值） |
| RadioGroup 选中圆点（`::after` 背景 vs 控件背景） | 通过 | 亮 `#fff/#2563eb = 5.17`；暗 `#0b0b0d/#60a5fa = 7.73` |
| 亮色 soft 变体 primary 文本 | **失败（非回归，未变）** | `--soft`（12% color-mix 底）：亮 **4.37** < 4.5（改前 3.52，非回归）；暗 5.54 通过 |
| ConfirmDialog danger 确认按钮 | 通过（复验后） | 亮/暗/移动 **4.83**（`-danger-solid` × `on-solid`）；复验修复，改前暗 4.07 |
| 实底配对口径（暗色） | 通过（复验后无例外） | Tag/Badge/Message/Button tone 实底 computed `color = #fff`（= `on-solid`）；暗色 `--caomei-color-primary-solid` 仍 `#2563eb`；`solid×on-solid` 两态 5.17 |
| 文档站改前/改后对照 | 通过 | 局部容器着色计数（亮）：Button 红 2409→0 / 蓝 0→2406；Tag solid 红 2246→50 / 蓝 0→2225；Message solid 红 50181→283 / 蓝 0→49917 |
| D 阶段 16 张基线一致性 | 通过 | 与本次独立复现逐像素比对 16/16：均值通道差 0、差异像素比 0（最大通道差 ≤7，抗锯齿噪音） |
| 响应式（移动 390 / 平板 768） | 通过 | tag/badge/message/button `scrollWidth ≤ clientWidth+1`；文档无横向溢出 |
| 预设不变性 | 通过 | caomei 亮 `#e63946` / 暗 `#ff6b6b`；momei 亮 `#64748b` / 暗 `#94a3b8`；默认亮 `#2563eb` / 暗 `#60a5fa` |
| 可访问性（焦点环 / ARIA） | 通过 | 焦点环 亮 `2px solid rgb(37,99,235)`（5.17）、暗 `2px solid rgb(96,165,250)`（6.75）；ARIA 抽检 10 项通过 |
| 宿主稳定性（Step 2.5） | 通过 | 真实滚动条 15px→0→15px；遮罩完整覆盖 `(0,0,1280,700)`；`.VPNav`（fixed）宽度 +15px = 实测滚动条宽（已知预期）；in-flow 容器文档坐标 `Δtop=Δleft=Δwidth=0`；`body overflow-y` 复原；Toast 不锁滚动且 `clientWidth` 稳定 |
| console error / pageerror / HTTP ≥ 400 | 通过 | **0**（13 页 × 亮/暗 × 改前/改后 + 移动 + 预设 + 浮层） |
| 质量门（独立复跑） | 通过 | `pnpm check:design` 通过（rgb 警告 13/13 既有）；`pnpm test` 64 文件 / **1078 例全过** |

## 4. 问题清单

### F1（blocker，本次回归；**已修复并复验通过**）暗色 ConfirmDialog `tone="danger"` 确认按钮文本 4.07:1 < 4.5

- **状态**：2026-09-16 复验通过（见 [§6 复验](#6-f1-复验f1-修复后2026-09-16)）。修复方式为在 `.caomei-confirm-dialog__confirm--danger` 同规则并行覆写 `--caomei-color-primary-foreground: var(--caomei-color-on-solid)` 并更正注释；暗色 4.07 → **4.83:1**。
- **现象（Reject 轮）**：`.caomei-confirm-dialog__confirm--danger` 暗色 computed `color = rgb(11,11,13)`（`--caomei-color-primary-foreground`）落在 `background = rgb(220,38,38)`（`--caomei-color-danger-solid`）→ **4.07:1**；改前 4.83:1。
- **复现**：`/components/confirm-dialog` → 切暗色 → 点「删除文件」→ 读该按钮 computed `color` / `background-color`。
- **根因**：`src/components/confirm-dialog/confirm-dialog.vue`（danger 语气规则）只覆写 `--caomei-color-primary: var(--caomei-color-danger-solid)`，前景仍取 Button 默认 `--caomei-button-fg: var(--caomei-color-primary-foreground)`；本次暗色将该 token 改为 `#0b0b0d` 后即等价于 `-solid` 实底与 `primary-foreground` 配对，违反本次新增的配对约定；文件内「主色前景 token 保持全局白色」注释已失效。
- **修复建议（交 `@frontend-developer`）**：同规则并行覆写 `--caomei-color-primary-foreground: var(--caomei-color-on-solid)`（或改走 `--caomei-button-bg` / `--caomei-button-fg`），并更新注释。

### F2（warning，非回归；**复验状态未变**）亮色 soft 变体 primary 文本 4.37:1 < 4.5

- **现象**：`.caomei-tag--soft.caomei-tag--primary`、`.caomei-message--soft.caomei-message--primary` 亮色 **4.37**（改前 3.52，改善 +0.85）；暗色改后 5.54 通过。
- **归因**：既有未达标（红主色时更差），本次改蓝未达标但改善。D 阶段 `measure.mjs` 底色解析仅支持 `rgb()/rgba()`，`color-mix()` 计算值解析失败导致 soft 变体整类被跳过，其「主色相关 18 → 0」未覆盖该场景；本次量法补上 `color(srgb …)` 与 alpha 合成。
- **处置**：由产品/设计决策（接受并登记 Backlog，或提高 soft 混合比例 / 引入 `--caomei-color-primary-soft-text`）。复验轮实测仍 4.37，**建议登记 Backlog**。

### 观察项（复验轮状态）

| 观察 | 归因 | 处置 |
| --- | --- | --- |
| D 阶段 `message-*-before/after.png` 像素完全相同（diff=0），未覆盖 primary 元素 → 该页对照证据无效 | 取证口径：截取首个 demo 容器 | 本次补 `v-message-solid-primary-*` / `v-message-soft-primary-*` 局部对照（红 50181→283 / 蓝 0→49917）；后续取证按「含目标元素的容器」截图 |
| `.caomei-toast__icon` 暗色 2.54:1（图形阈值 3） | 上游既有：`--caomei-toast-accent = --caomei-color-neutral-solid`（`#52525b`）在暗底；改前/改后一致 | 非本次范围，**建议登记 Backlog**（复验重测仍 2.54） |
| `Calendar .caomei-calendar__weekday` 亮色 4.48:1 | 上游既有：`--caomei-color-text-muted`（未在改动范围），独立复算 4.47 与 D 一致 | 维持「与本次无关，不阻断」（复验独立复算 4.48，有效底色 `rgb(246,246,247)`） |

## 5. 未覆盖边界

- 仅 VitePress dev（源码直出），未验证 `pnpm build` 产物与 Nuxt 下游。
- 非 Chromium 内核（WebKit / Firefox）与真机未覆盖。
- 视觉通道不可用（vision-augment reasoning 400），以「PNG 逐像素 + 着色计数」客观替代人眼语义判读。
- Toast `tone=primary` 语气图标未覆盖（文档站无该示例入口）。
- 英文站 `/en-US/**` 未验证。
- 预设切换未单独覆盖 `data-scheme="auto"`（系统跟随）路径。

## 6. F1 复验（F1 修复后，2026-09-16）

> 范围冻结在 F1 修复点与直接受影响面；独立复算，不采信上一轮脚本与结论。

### 6.1 复验结论

**Pass。** Reject 轮唯一回归 F1 已修复：暗色 ConfirmDialog danger 确认按钮 **4.07 → 4.83:1**；扫描记录 140 行中**仅此 1 行变化**、新增低于阈值项 **0**；组件层无「`-solid` 实底 × `primary-foreground`」运行期残留；console error / pageerror / HTTP≥400 = 0。剩余失败 **2 条（核对项口径，即 F2 的 Tag / Message 两项，非回归）**，待产品决策。

### 6.2 F1 逐项实测值

| 状态 | 按钮 computed `color` | computed `background` | 对比度（文本阈值 4.5） |
| --- | --- | --- | --- |
| 亮色 | `rgb(255,255,255)` | `rgb(220,38,38)` | **4.83** ✅ |
| 暗色 | `rgb(255,255,255)` | `rgb(220,38,38)` | **4.83** ✅（改前 4.07 ❌） |
| 亮色移动 390 | `rgb(255,255,255)` | `rgb(220,38,38)` | **4.83** ✅ |

- 修复点运行期解析（按钮作用域）：`--caomei-color-primary-foreground: #fff`、`--caomei-button-fg: #fff`（= `--caomei-color-on-solid`）、`--caomei-button-bg: #dc2626`（= `--caomei-color-danger-solid`）；暗色根 `--caomei-color-primary-foreground` 仍为 `#0b0b0d`，证明前景覆写确由 danger 规则生效。
- 直接受影响面：中性 ConfirmDialog 确认按钮 亮 5.17 / 暗 7.73（自适应配对未受污染）；取消按钮 亮 17.4 / 暗 18.04。
- 截图：`reverify-f1-confirm-{light,dark}.png`（视口）、`reverify-f1-confirm-{light,dark}-dialog.png`（对话框局部）。像素探针：亮/暗 danger 按钮文字区（31×15px）逐像素**完全一致**（whiteish=60 / red=230 / other=175，文字核心最亮像素同为 `rgb(254,249,249)`）→ 白字红底两态均实际渲染；差异仅在对话框底色/圆角。OCR 独立识别暗色局部：`删除文件 / 删除后不可恢复。/ 保留 / 删除`（置信度 0.994）。

### 6.3 约定复核（`-solid` 不得配 `primary-foreground`）

- **静态**：`rg -n "caomei-color-primary:\s*var" src/components/` → **1 命中**（`confirm-dialog.vue:181`，即预期保留的 danger 覆写行，已由同规则 182 行配 `on-solid`）。⚠️ 交接口径称「零命中」与实测不符，应更正；语义约定本身成立。其余使用 `--caomei-color-primary-foreground` 的组件（paginator / toolbar / radio / checkbox / select-button / toggle-button / calendar / stepper）背景均取**自适应** `--caomei-color-primary`，非 `-solid`，配对正确。
- **运行期**（`reverify-solid-audit.mjs`，14 个组件页 × 亮/暗，含交互态）：暗色实底 caomei 元素 24 个，`color == primary-foreground` 者 **0**、违规 **0**；全部实底元素前景均为 `on-solid`（`#fff`）。

### 6.4 回归扫描前后对照

- 对照 `verification.prior-f1.json`（Reject 轮「after」）与新 `verification.json`（本轮）：扫描记录 140 行（其中「after」相位 84 行）**仅 1 行变化**（`dark/after/confirm-dialog/danger` 4.07→4.83），**回归 0**。
- 「after」相位低于阈值者共 5 行：亮色 `Tag--soft` / `Message--soft` primary **4.37**（桌面 + 移动各 2 行，即 F2 的 2 个条目，非回归）与暗色 `RadioGroup` 指示器 2.33（1 行，量法噪音，判定用 `::after` 7.73）。相较 Reject 轮**删除 F1 的 1 行，无新增**。
- `probes.json` 前后逐叶对照 **0 处差异**（token 级配对、soft 扫描、宿主稳定性均未变）。

### 6.5 复验证据与脚本

```bash
BASE=http://localhost:5175 node test-results/m2-primary/reverify-f1.mjs           # F1 定向（自实现亮度）
BASE=http://localhost:5175 node test-results/m2-primary/reverify-solid-audit.mjs  # 约定运行期复核
BASE=http://localhost:5175 node test-results/m2-primary/verification.mjs          # 全量回归矩阵
BASE=http://localhost:5175 node test-results/m2-primary/toast-probe.mjs
BASE=http://localhost:5175 node test-results/m2-primary/probes.mjs
node test-results/m2-primary/reverify-f1-pixels.mjs                               # 截图像素探针
```

- 数据：`reverify-f1.json`、`reverify-solid-audit.json`、`verification.json`、`verification.prior-f1.json`（对照）、`toast-probe.json`、`probes.json`。
- 质量门：`pnpm check:design` 通过（rgb 警告 13/13 处，均为既有，无新增）；`pnpm lint:css:check` 通过（exit 0）。
- 观察项复测：Toast 中性图标暗色 **2.54**（未变）、Calendar weekday 亮色 **4.48**（未变）、F2 soft primary **4.37**（未变）。
- 视觉通道 `vision-augment` reasoning 仍 400（与 Reject 轮同因），以 PNG 逐像素 + OCR 客观替代。
