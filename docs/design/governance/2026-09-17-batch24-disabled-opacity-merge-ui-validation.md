# 禁用态不透明度 `0.5` 档归并（19 处 → `--caomei-disabled-opacity`）浏览器验证

- 日期：2026-09-17
- 范围：工作区未提交 diff 的「禁用态 `0.5` 档归并」批次（用户 2026-09-17 裁决「归并」）——19 处 `opacity: 0.5` 改为 `opacity: var(--caomei-disabled-opacity)`（默认 `0.6`）
- 类型：**有意的视觉变更**（禁用态 `0.5` → `0.6`），需真实渲染计算样式取证
- 依据：[设计规范 §2.6 阴影、遮罩与状态 token](../../design/design-spec.md)、[组件风格约定](../../design/design-spec.md)、[主题与样式设计](../../design/theming.md)、[测试规范 §5 / §5.1](../../standards/testing.md)、UI 验证 skill（`.github/skills/ui-validator/SKILL.md`）
- 被测对象：`src/components/**` 中 19 处（18 文件）禁用态选择器；基线 revision `b7d9613`

## 范围（scope）

| 维度 | 取值 |
| --- | --- |
| 被测 revision | 基线 `b7d9613`（HEAD，已提交）；验证对象为**工作区未提交 diff**（`src/**` 验证期间未改动） |
| 入口 / 产物 | 临时夹具 dev `http://127.0.0.1:4621`（Vite 直读工作区 `src/`）；基线对照 dev `http://127.0.0.1:4622`（同一夹具、`@` 指向 `b7d9613` 只读 worktree） |
| 页面 | 单页夹具，`data-case` 逐项受控；浮层（下拉 / 浮层 / 日期面板 / 对话框 / Toast）由脚本按序开合 |
| 断点 | 桌面 1440×900、平板 834×1024、移动 390×844 |
| 主题 | 亮色、暗色（`html.dark`）、`data-preset="caomei"` 暗色预设 |
| 动效 | 仅 `skeleton` 关键帧中间态（动画冻结到 50% 取计算值），其余不适用 |
| 浏览器 | Chromium（Playwright 1.63，`--no-sandbox` 容器内） |

- 结论：**通过，属预期视觉变更**。
  - 后验（工作区）：夹具 **114 项，失败 0**；响应式 / 宿主稳定性 / token 覆盖 / 可聚焦性补充 **20 项，失败 0**；console error / pageerror / HTTP ≥ 400 全为 0。
  - 基线对照（`b7d9613`）：**37 项，失败 0**——本批 19 处全为 `0.5`，前批 18 处全为 `0.6`，`skeleton` 中间态 `0.5`。
  - 逐选择器「改动前 → 改动后」一一对应，**无非预期漂移**；`0.5 → 0.6` 为 19/19 全量变化，其余视觉面无回归。

### 声明级 vs 有效级（复核补录）

上表的期望 / 实测口径为**元素自身声明值**（`getComputedStyle(el).opacity`）。当禁用同时落在祖先与后代时，渲染的**有效不透明度**是祖先链乘积，故 19 处中有 3 处在对应父级禁用场景下有效值为 `0.6 × 0.6 = 0.36`（其真实前后变化为 `0.30 → 0.36`）：

| 选择器 | 声明值 | 有效值（父/根同禁用） | 祖先链 |
| --- | --- | --- | --- |
| `.caomei-input-number__button:disabled` | 0.6 | **0.36** | 按钮 × `.caomei-input-number--disabled` |
| `.caomei-calendar__nav:disabled` | 0.6 | **0.36** | nav × `.caomei-calendar[data-disabled]` |
| `.caomei-calendar__day[data-disabled]` | 0.6 | **0.36** | day × `.caomei-calendar[data-disabled]` |

- 该双重应用在上一批次（提交 `89f9f6c`）即已存在，非本批引入；本批只改**子层**声明值（父层 `.caomei-input-number--disabled` / `.caomei-calendar[data-disabled]` 在基线 `b7d9613` 时为 0.6），故相对变化与其余 16 处同为 `+20%`。
- 因此「37 处统一为 `--caomei-disabled-opacity`」是**声明值**口径；是否把嵌套场景收敛为单层应用（避免 0.36）属新的取值决策，未在本批范围。

### 测试承载说明

本批为纯 CSS 值替换：happy-dom / jsdom 不计算 scoped CSS，单元测试无法承载该断言，故验收由本记录的计算样式实测承担（[测试规范 §2.1 / §5](../../standards/testing.md)）。复现脚本位于被忽略的 `test-results/`（临时产物），**取值以本记录为准**。

### 复现方式

```bash
# 1) 工作区后验（夹具读工作区 src）
pnpm exec vite --config test-results/tmp/b24/vite.config.ts --force   # 127.0.0.1:4621
node test-results/b24-validate.mjs          # 114 项：19 处 0.6 + 18 处复核 + skeleton + 阴影 + aria
node test-results/b24-responsive.mjs        # 20 项：三档视口 + 宿主稳定性 + token 覆盖 + 可聚焦性

# 2) 基线对照（需另一个终端；worktree 与 node_modules 软链见下）
git worktree add --detach /tmp/opencode/caomei-baseline b7d9613
ln -sfn "$PWD/node_modules" /tmp/opencode/caomei-baseline/node_modules
pnpm exec vite --config test-results/tmp/b24/vite.baseline.config.ts --force   # 127.0.0.1:4622
node test-results/b24-baseline.mjs          # 37 项：19 处 0.5 + 18 处 0.6 + skeleton 0.5
```

> 夹具与脚本位于 `test-results/tmp/b24/`（`test-results/` 被 `.gitignore` 忽略，未入库）。Vite 必须先 `--force` 重启：本 session 复现了「dev server 对已编辑 `app.vue` 返回陈旧 transform」（与 `2026-09-17-batch23-token-equivalence-ui-validation.md` 观察项 4 同源）。基线 worktree 通过软链复用主仓 `node_modules`，验证后已 `git worktree remove` 清理。

## 0. 基线 A/B 对照（改动前 → 改动后）

同一夹具、同一选择器、同一浏览器：工作区 `src/`（后验）与 `b7d9613`（基线）。

| 分组 | 基线 `b7d9613` | 工作区（本批） | 判定 |
| --- | --- | --- | --- |
| 本批 19 处 | `0.5` × 19 | `0.6` × 19 | **预期视觉变更** |
| 前批 18 处 | `0.6` × 17（不含 time-input period） | `0.6` × 20 项（含 cursor / period） | 未被波及 |
| `skeleton` pulse 中间态 | `0.5` | `0.5` | 未被波及 |

静态互补（`rg -o 'opacity: 0\.5;' src` → 仅 `skeleton.vue:129` 关键帧 1 处；`rg 'opacity: 0\.6' src` → 仅 `theme.css` token 定义 1 处；`var(--caomei-disabled-opacity)` 消费 **37 处**，与 `design-spec.md` 口径一致）。

## 1. 本批 19 处（选择器 → 期望 → 实测）

期望 `opacity = 0.6`；除 `stepper__indicator`（该块仅声明 `opacity`）外，其余块均声明 `cursor: not-allowed`。

| # | 选择器 | 命中数 | opacity | cursor | 构造方式 |
| --- | --- | --- | --- | --- | --- |
| 1 | `.caomei-multi-select__item[data-disabled]` | 1 | 0.6 | not-allowed | 开面板（点 `__icon`） |
| 2 | `.caomei-input-number__button:disabled` | 2 | 0.6 | not-allowed | `disabled` 根 |
| 3 | `.caomei-calendar__nav:disabled` | 2 | 0.6 | not-allowed | `min-value` / `max-value` 越界 |
| 4 | `.caomei-calendar__day[data-disabled]` | 24 | 0.6 | not-allowed | 同上 |
| 5 | `.caomei-toggle-button[data-disabled]` | 1 | 0.6 | not-allowed | `disabled` |
| 6 | `.caomei-password__toggle:disabled` | 1 | 0.6 | not-allowed | `disabled` |
| 7 | `.caomei-select-button__item[data-disabled]` | 1 | 0.6 | not-allowed | 选项 `disabled: true` |
| 8 | `.caomei-dropdown-menu__item[data-disabled]` | 1 | 0.6 | not-allowed | 开面板 |
| 9 | `.caomei-dropdown-menu__trigger[data-disabled]` | 1 | 0.6 | not-allowed | 触发器 `disabled` |
| 10 | `.caomei-stepper__trigger[data-disabled]` | 1 | 0.6 | not-allowed | 步骤 `disabled` |
| 11 | `.caomei-stepper__item[data-disabled] .caomei-stepper__indicator` | 1 | 0.6 | （无 cursor 规则） | 同上 |
| 12 | `.caomei-tabs__trigger[data-disabled]` | 1 | 0.6 | not-allowed | 标签 `disabled` |
| 13 | `.caomei-toolbar__button:disabled` | 1 | 0.6 | not-allowed | 按钮 `disabled`（两种形态命中同一元素） |
| 13 | `.caomei-toolbar__button[data-disabled]` | 1 | 0.6 | not-allowed | 同上 |
| 14 | `.caomei-select__item[data-disabled]` | 1 | 0.6 | not-allowed | 开面板 |
| 15 | `.caomei-popover__trigger:disabled` | 1 | 0.6 | not-allowed | 触发器 `disabled` |
| 16 | `.caomei-auto-complete__item[data-disabled]` | 1 | 0.6 | not-allowed | 开面板 |
| 17 | `.caomei-accordion__trigger[data-disabled]` | 1 | 0.6 | not-allowed | 条目 `disabled` |
| 18 | `.caomei-paginator__control:disabled` | 2 | 0.6 | not-allowed | 首页第 1 页 |
| 19 | `.caomei-file-upload__remove:disabled` | 1 | 0.6 | not-allowed | `disabled` + 预置文件 |

**全部 19 处可达**（含需开面板的 1 / 8 / 14 / 16）；无选择器需要「直接挂载未导出组件」的替代取证。

## 2. 前批已验收 18 处复核（未被本次改动波及）

| 迁移点 | 选择器 | opacity | 附带断言 |
| --- | --- | --- | --- |
| button | `.caomei-button:disabled` | 0.6 | — |
| input | `.caomei-input--disabled` | 0.6 | — |
| textarea | `.caomei-textarea--disabled` | 0.6 | — |
| select | `.caomei-select--disabled` | 0.6 | — |
| multi-select | `.caomei-multi-select--disabled` | 0.6 | — |
| auto-complete | `.caomei-auto-complete--disabled` | 0.6 | — |
| input-number | `.caomei-input-number--disabled` | 0.6 | — |
| date-picker | `.caomei-date-picker--disabled` | 0.6 | — |
| switch | `.caomei-switch--disabled` | 0.6 | — |
| checkbox | `.caomei-checkbox--disabled` | 0.6 | — |
| radio-button | `.caomei-radio-button[data-disabled]` | 0.6 | — |
| tag | `.caomei-tag--disabled` | 0.6 | — |
| file-upload 拖放区 | `.caomei-file-upload__dropzone:disabled` | 0.6 | — |
| color-picker 触发器 | `.caomei-color-picker__trigger:disabled` | 0.6 | — |
| color-picker 色块（直接挂载面板） | `.caomei-color-picker__swatch:disabled` | 0.6 | — |
| calendar 根 | `.caomei-calendar[data-disabled]` | 0.6 | — |
| slider 根 | `.caomei-slider--disabled` | 0.6 | thumb cursor = not-allowed |
| time-input 时段按钮 | `.caomei-time-input__period:disabled` | 0.6 | cursor = not-allowed（打开「启用 + 空 model + `hour-format="12"`」的 DatePicker 命中） |

基线对照同步确认这 18 处改动前即为 `0.6`，本次 diff 未触碰。

## 3. 反例：`skeleton` 关键帧未被误改

- 命名订正：`0.5` 实际位于 `@keyframes caomei-skeleton-pulse` 的 `50%` 帧（**非** `wave` 帧）；`caomei-skeleton-wave` 关键帧只有 `transform: translateX(100%)`，不含 `opacity`。任务描述中的「wave 关键帧」应为「pulse 关键帧」，本记录按实测事实登记。
- 取证方式：`el.getAnimations()` 取 CSSAnimation → `pause()` → `currentTime = duration/2`（1500ms / 2 = 750ms）→ `getComputedStyle(el).opacity`。

| 项 | 期望 | 实测 |
| --- | --- | --- |
| CSSOM `@keyframes caomei-skeleton-pulse-0ebdf89d` 50% `opacity` | `0.5` | `0.5` |
| 动画冻结至 50% 的计算 `opacity` | `0.5` | `0.5` |
| CSSOM `@keyframes caomei-skeleton-wave-*` 是否含 `opacity` | 否（仅 transform） | 仅 `transform: translateX(100%)` |
| `.caomei-skeleton--wave .caomei-skeleton__line::after` 高光 | 含 `rgba(255, 255, 255, 0.6)` | `linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.6), rgba(0, 0, 0, 0))` |

（关键帧名带 Vue scoped 哈希后缀 `-0ebdf89d`，属编译期重命名，不影响取值。）

## 4. 暗色 / 预设复验

`--caomei-disabled-opacity` 在 `html.dark` 与 `[data-preset="caomei"]` 下原始值均未被覆写（`0.6`）；抽样 6 处（input-number 按钮 / calendar nav / toggle-button / password toggle / paginator 控制 / file-upload 移除）在两态下计算值均为 `0.6`。

| 场景 | 证明生效的对照 token | 抽样 opacity |
| --- | --- | --- |
| `html.dark` | `--caomei-color-bg` = `#0b0b0d` | 6/6 = 0.6 |
| `[data-preset="caomei"]` + dark | `--caomei-color-primary` = `#ff6b6b` | 6/6 = 0.6 |

- token 覆盖实测：在 `[data-case="a-toggle-button"]` 作用域内联 `--caomei-disabled-opacity: 0.25` → 计算 `opacity` 由 `0.6` 变 `0.25`；移除后回退 `0.6`。证明 19 处确实消费该 token，而非硬编码。

## 5. 其它视觉面回归（阴影 / 遮罩）

| 选择器 | 期望（迁移前字面量经浏览器序列化） | 实测 |
| --- | --- | --- |
| `.caomei-card--elevated` | `rgba(0, 0, 0, 0.08) 0px 4px 12px 0px` | 同左 |
| `.caomei-slider__thumb` | `rgba(0, 0, 0, 0.2) 0px 1px 2px 0px` | 同左 |
| `.caomei-dropdown-menu__content` | `rgba(0, 0, 0, 0.12) 0px 8px 24px 0px` | 同左 |
| `.caomei-popover__content` | 同上 | 同左 |
| `.caomei-select__content` | 同上 | 同左 |
| `.caomei-multi-select__content` | 同上 | 同左 |
| `.caomei-toast` | 同上 | 同左 |
| `.caomei-dialog__overlay` | `rgba(0, 0, 0, 0.45)` | 同左 |
| `.caomei-dialog__content` | `rgba(0, 0, 0, 0.18) 0px 12px 32px 0px` | 同左 |
| `.caomei-confirm-dialog__overlay` | `rgba(0, 0, 0, 0.45)` | 同左 |
| `.caomei-confirm-dialog__content` | `rgba(0, 0, 0, 0.18) 0px 12px 32px 0px` | 同左 |

`--caomei-shadow-xs/sm/md/lg`、`--caomei-color-mask` 原始值与上批 token 等价记录逐字一致。

## 6. `aria-label` 优先级契约（4 组件，实测）

契约：**显式 `label` > 透传 `aria-label` > 语言默认**。`label` 为空缺省（`''` / 未传）时按「无意见」处理。

| 组件 | `label` | 透传 `aria-label` | 期望 `aria-label` | 实测 |
| --- | --- | --- | --- | --- |
| Button | `显式按钮名` | — | `显式按钮名` | 同左 |
| Button | — | `透传按钮名` | `透传按钮名` | 同左 |
| Button | `显式按钮名` | `透传按钮名` | `显式按钮名`（label 胜） | 同左 |
| Button | — | — | 无属性（回退可见文本） | 无属性 |
| Badge | `显式徽标名` | — | `显式徽标名` | 同左 |
| Badge | — | `透传徽标名` | `透传徽标名` | 同左 |
| Badge | `显式徽标名` | `透传徽标名` | `显式徽标名` | 同左 |
| Badge | — | — | 无属性 | 无属性 |
| ProgressSpinner | `显式加载名` | — | `显式加载名` | 同左 |
| ProgressSpinner | — | `透传加载名` | `透传加载名` | 同左 |
| ProgressSpinner | `显式加载名` | `透传加载名` | `显式加载名` | 同左 |
| ProgressSpinner | — | — | 语言默认 `加载中` | `加载中` |
| Paginator | `显式分页名` | — | `显式分页名` | 同左 |
| Paginator | — | `透传分页名` | `透传分页名` | 同左 |
| Paginator | `显式分页名` | `透传分页名` | `显式分页名` | 同左 |
| Paginator | — | — | 语言默认 `分页` | `分页` |

4 组件 16 用例全部符合契约（该优先级统一属本 session 已交付项，本次为回归复核；`2026-09-17-batch23-...` 的观察项 1 分歧已闭环）。

## 7. 响应式 / 宿主稳定性 / 可访问性补充

- 三档视口（1440×900 / 834×1024 / 390×844）：无横向溢出（`scrollWidth <= clientWidth`），禁用态计算 `opacity` 稳定 `0.6`。
- 宿主稳定性（Dialog 模态，1280×800）：遮罩完整覆盖（`left/top <= 0`、`right/bottom >= innerWidth/innerHeight`）；`in-flow` 锚点 `top` 与尺寸不变、滚动位置不变（`scrollY=946`）；`body` 滚动条补偿符合预期。
- 禁用态可聚焦性：toolbar / paginator / tabs / accordion 的禁用控件均「原生 `disabled` 且 `focus()` 不可获得焦点」。
- 本次变更只作用于 `opacity`（合成层属性，不参与布局），上列几何断言与基线一致，未引入 CLS。

## 观察项（OBSERVE）

| 观察 | 归因 | 处置 |
| --- | --- | --- |
| 任务描述中的「`skeleton` 的 `wave` 关键帧中间态仍为 `0.5`」与源码不符：`0.5` 位于 `caomei-skeleton-pulse` 的 `50%` 帧，`wave` 关键帧只有 `transform` | 关键帧命名口径笔误；本次实测已双向取证（CSSOM + 动画冻结计算值） | 记录在案；本记录 §3 为准确表述，建议后续描述沿用「pulse 关键帧」 |
| 本轮 Chromium context 下 `innerWidth - clientWidth = 0`（覆盖式滚动条），未复现上批的 15px 滚动条宽 | 无头 Chromium 滚动条渲染模式差异，与本次改动无关（本批不触碰滚动锁 / 布局） | 记录在案；关键稳定性断言（遮罩覆盖、in-flow 不位移、滚动位置不变）仍全部成立 |
| Vite dev server 对已编辑 `app.vue` 返回陈旧 transform（首轮 `hour-format` 缺失时夹具未更新） | Vite 8.2.2 缓存 / 失效时序，与 `2026-09-17-batch23-...` 观察项 4 同源 | 已固定复现步骤为「先 `--force` 重启再取证」 |

## 未覆盖边界

- 仅 Chromium；未跑 Firefox / WebKit。
- 视觉美观度未经人工像素比对（本模型视觉通道不可用）：结论均为 `getComputedStyle` 数值与几何断言，截图供人工复核。
- 未逐页扫文档站；token 属全局、且本批为单值替换，夹具已全量覆盖 19 处。
- 英文站 / 其它语言未单独验证（无文案与路由改动，计算样式与语言无关）。
- 未覆盖「嵌套禁用时的有效不透明度」收敛决策：`input-number__button` / `calendar__nav` / `calendar__day` 在父级同禁用时有效值为 0.36（见「声明级 vs 有效级」），本批只改声明值。
- 未跑构建产物（`pnpm build` + preview）；验证对象为 Vite 直读 `src/` 的 dev 页，产物级一致性由 `pnpm build` + `check:build` 与既有 CI / `governance:check` 承载。
- 本批未覆盖文档站演示夹具（`docs/examples/**`）内的禁用态样式：其 `.demo-actions button:disabled { opacity: 0.5 }` 属演示层样式，不属库组件声明面，未纳入归并。

## 截图清单

- `light-top.png` / `light-full.png`：夹具亮色（含本批 19 处与 §B/§C/§D/§E）
- `dark-full.png`：夹具暗色
- `preset-dark-full.png`：`data-preset="caomei"` 暗色
- `responsive-desktop.png` / `responsive-tablet.png` / `responsive-mobile.png`：三档视口
- `stability-dialog-real-scrollbar.png`：Dialog 模态开启态（宿主稳定性）

（截图与 `b24-records.json` / `b24-baseline-records.json` / `b24-responsive-records.json` 均位于 `test-results/tmp/b24/`，`test-results/` 被 `.gitignore` 忽略。）
