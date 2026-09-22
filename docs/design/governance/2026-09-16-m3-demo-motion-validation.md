# 2026-09-16 M3 条目 1「demo 动画恢复层」浏览器验证记录

> 状态：V 阶段（`@ui-validator`）验证记录，2026-09-16。本文含**三轮**：首轮（`04:06` 版 motion.css，227 行）、**复验轮**（P1 修复后 `04:19:46` 版，288 行）与**第 3 轮（末轮，轮次上限 3）**（P2 修复后 `04:3x` 版 302 行；此后仅注释与文档同步修订，行数 304，规则未变）。被测对象为工作区未提交改动（单文件 `docs/.vitepress/theme/motion.css`）。
>
> **首轮结论：最小验收标准通过，但附带的「退出动画」规则实测不生效（同一根因，非回归）。** demo 内 Drawer 入场 0.2s 且逐帧位移可见（13 个不同位置）、demo 外仍为 1ms；Accordion / Image / Button / AutoComplete 与 4 个 Portal 面板的**入场**动画实测实际播放；no-preference 下文档层完全不参与。**Drawer 与 Accordion 的 `[data-state='closed']` 退出条目为不可达死代码**（Reka `usePresence` 同名动画判定），与 M3 范围文字中「入场 / 退出动画」的表述不符，详见 §4 P1。
>
> **复验轮结论（已被第 3 轮取代）：Reject。** P1 **已闭环**（Drawer 退出改用独立命名 keyframes 后 `animationstart`/`animationend` 触发、元素存活 `253.6ms`、逐帧位移与 no-preference 组件原动画轨迹一致；Accordion 首次折叠 13 个高度值）。但直接受影响面新发现 **P2**：reduce 下 Accordion 的高度插值只在「起始展开 item 的第一次折叠」成立，**起始折叠 item 的首次展开**与**任意 item 第 2 次起的切换**均无插值（`--reka-collapsible-content-height` 被写成 `0px` 并保持）→ 核对项 17 / 失败 1（P2）/ 观察项 6 / console 0，详见 §8。
>
> **第 3 轮（末轮）结论（现行）：Pass。P2 已闭环。** Accordion 规则改为「`animation-name` 以更高特异性（多一层 `.caomei-accordion`）声明、仅 duration/timing/iteration 用 `!important`」后，Reka 的测量窗口内联 `animation-name: none` 重新生效，变量在 `animationstart` **之前**写入自然高度；**两条路径共 12 次过渡全部逐帧插值**（起始展开 item 4 轮 8 次 + 起始折叠 item 首次展开及后续 3 次，`distinctHeights` 13~14）。P1 与其余恢复项未回归，CSSOM 逐规则归属与优先级断言成立 → **核对项 18 / 失败 0 / 观察项 6 / console 0**，详见 §9。
>
> 关联：[待办事项归档 M3](../../plan/todo-archive.md) ｜ [文档与演示站设计 §9](../documentation-site.md) ｜ [主题与样式设计](../theming.md) ｜ [测试规范 §2.1 / §5.1](../../standards/testing.md) ｜ UI 验证 skill（`.github/skills/ui-validator/SKILL.md`）

## 1. 结论摘要（可回写评审记录）

> 本节为**首轮**摘要；复验轮摘要见 §8 开头，**现行结论**见 §9 开头（末轮 Pass、P2 已闭环）。

**首轮 V 阶段（M3 条目 1 浏览器实机验证）：核对项 34 / 失败 2（同一根因 P1）/ 观察项 6 / console error 0。**

- 一行回写：`V 有条件通过｜最小验收达标：reduced-motion 下 demo 内 Drawer 入场 0.2s + 逐帧位移 -419→0（13 位置）、demo 外 .VPSidebar/.VPNav/.VPContent 等仍 0.001s/0s；Accordion/Image/Button/AutoComplete 与 Popover/DropdownMenu/DatePicker/Toast 入场动画实测播放且时长与声明一致；no-preference 下 22 条新增规则全部位于 reduce 媒体查询内（CSSOM 实证）、组件 scoped 原名未被替换；宿主稳定性（真实滚动条 15px）in-flow Δ0 / 遮罩全覆盖 / CLS 0；失败 2 项＝Drawer 与 Accordion 的 closed 条目不可达（P1，非回归），console/pageerror/HTTP≥400=0`。
- **最小验收标准：通过**——`matchMedia('(prefers-reduced-motion: reduce)').matches === true`；Drawer 入场 `animation-duration: 0.2s`、`animation-name: caomei-demo-slide-in-left`、逐帧 `translateX` 与 `rect.x` 同步收敛 `-419.1 → -387.5 → -322.4 → -244.2 → -174.6 → -120.9 → -80.9 → -51.7 → -30.5 → -15.9 → -6.5 → -1.4 → 0`（约 200ms 内 13 个不同位置，settled x=0，`animation-play-state: running`）；demo 外 `.VPSidebar` / `.VPNavBarTitle` / `.VPNav` / `.VPContent` / `.vp-doc` 全部 `animation-duration: 0.001s`、`transition-duration: 0s`。
- **P1（warning，非回归，需处置）**：Drawer overlay/content 与 Accordion content 的 `[data-state='closed']` 规则 computed 命中但动画从不播放（`animationstart` 不触发、元素 2~35ms 内卸载/`hidden`）→ 7 条 closed 规则为死代码（另含 `animation-direction: reverse` 声明）。根因与可验证修复方向见 §4 P1。

## 2. 范围

| 维度 | 取值 |
| --- | --- |
| 被测 revision | 工作区未提交改动（基于 HEAD `d4e4725`；`docs/.vitepress/theme/motion.css` mtime 2026-09-16 04:06） |
| 入口 / 产物 | VitePress dev `http://localhost:5175`（库源码直出，`vitepress v1.6.4`；**非**构建产物） |
| 页面 | `/components/{drawer,accordion,image,button,auto-complete,progress-spinner,skeleton,popover,dropdown-menu,date-picker,toast}` |
| 断点 | 桌面 1440×900 ｜ 移动 390×844（isMobile + touch）｜ 宿主稳定性 1280×800（真实滚动条） |
| 主题 | 亮 / 暗（`html.dark` + `colorScheme: dark`） |
| 动效 | reduced-motion（`reducedMotion: 'reduce'`）与 no-preference 双上下文 |
| 变更边界 | `git status`：仅 `docs/.vitepress/theme/motion.css`（`src/**` 未变更，满足「不改组件库」非目标） |
| 原始记录 | `test-results/m3-demo-motion/`（**已 gitignore，仅作原始留痕**）：`validate-independent.{mjs,json}`、`probe-{details,accordion,fix-hypothesis,portal-events,duration-var,nopref-rest,mid-shot}.{mjs,json}`、11 张 PNG |

复现（`npx vitepress dev docs --port 5175`）：

```bash
BASE=http://localhost:5175 node test-results/m3-demo-motion/validate-independent.mjs
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-details.mjs
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-accordion.mjs
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-fix-hypothesis.mjs
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-portal-events.mjs
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-nopref-rest.mjs
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-duration-var.mjs
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-mid-shot.mjs
```

> 取证脚本位于 gitignored 的 `test-results/m3-demo-motion/`，**未随提交入库**，提交后无法直接复跑；复现需按本节步骤重写脚本，或按 [Backlog](../../plan/backlog.md) §1.6「Review Gate 证据留存」的治理结果取用。D 阶段脚本 `validate.mjs`（`npx` 前缀）已被本轮独立脚本取代，**不复用其采样与结论**。

## 3. 逐项结论（关键实测值）

| # | 核对项 | 结论 | 关键实测值 |
| --- | --- | --- | --- |
| 1 | reduced-motion 上下文生效 | 通过 | `reduce=true` / `no-preference=false` |
| 2 | Drawer 入场时长 | 通过 | `caomei-demo-slide-in-left` @ `0.2s`（overlay `caomei-demo-fade-in` @ `0.2s`） |
| 3 | Drawer 入场逐帧位移可见 | 通过 | 13 个不同 `translateX`：`-419.1 → -387.5 → -322.4 → -244.2 → -174.6 → -120.9 → -80.9 → -51.7 → -30.5 → -15.9 → -6.5 → -1.4 → 0`（94→294ms），settled x=0 |
| 4 | Drawer 入场动画实际触发 | 通过 | `animationstart`：overlay `caomei-demo-fade-in` @109.2ms、content `caomei-demo-slide-in-left` @109.3ms |
| 5 | demo 外对照（≥2 VitePress 元素） | 通过 | `.VPSidebar` / `.VPNavBarTitle` / `.VPNav` / `.VPContent` / `.vp-doc` → `animation-duration: 0.001s`、`transition-duration: 0s` |
| 6 | 站点自身动画未被本层恢复 | 通过 | 5 页全量扫描：`restoredOutsideDemo = 0`；被恢复元素 `restoredCount` 0–1，且均在 `.vitepress-demo-plugin__container` 内（唯一在场者为正在旋转的 `caomei-*-spinner`） |
| 7 | Accordion 入场 | 通过 | `caomei-demo-accordion-down` @ `0.2s` `direction: normal`，`inDemo=true`；`animationstart`/`animationend` 均触发 |
| 8 | Accordion 退出（computed） | 通过 | `caomei-demo-accordion-down` @ `0.2s` `direction: reverse`，`inDemo=true` |
| 9 | Accordion 退出（实际播放） | **失败** | 关闭后 20ms 即 `display: none` / `hidden: true` / `h=0`，无 `animationstart`（详见 P1） |
| 10 | Image 加载脉冲 | 通过 | 3 个实例均 `caomei-demo-image-pulse` @ `1.2s` `infinite`，`inDemo=true` |
| 11 | Button spinner | 通过 | `caomei-demo-spin` @ `0.6s` `infinite`，`inDemo=true` |
| 12 | AutoComplete spinner | 通过 | `caomei-demo-spin` @ `0.8s` `infinite`，`inDemo=true` |
| 13 | Popover 入场 | 通过 | `caomei-popover-in` @ `0.12s`，`animationstart`+`animationend` 触发 |
| 14 | DropdownMenu 入场 | 通过 | `caomei-dropdown-menu-in` @ `0.12s`，start+end 触发 |
| 15 | DatePicker 入场 | 通过 | `caomei-date-picker-in` @ `0.12s`，start+end 触发 |
| 16 | Toast 入场 | 通过 | `caomei-toast-in` @ `0.18s`，start+end 触发 |
| 17 | Portal 面板父链（作用域不可达性） | 通过（与声明一致） | Drawer/Popover/DropdownMenu/DatePicker：`DIV < BODY < HTML`；Toast：`OL < DIV < DIV#app < BODY < HTML`（均在 demo 容器之外，`inDemo=false`） |
| 18 | Drawer 退出（实际播放） | **失败** | reduce：`data-state=closed` @computed `caomei-demo-slide-in-left` / `0.2s` / `reverse`，但元素 2.2ms 后移除、`animEvents=[]`、`goneAfterMs=35`；no-preference 对照：`goneAfterMs=240`，`caomei-drawer-out-left-908a7d59` 与 `caomei-drawer-fade-out-908a7d59` start+end 均触发（详见 P1） |
| 19 | no-preference 下文档层不参与（CSSOM） | 通过 | motion.css 22 条新增样式规则**全部**位于 `@media (prefers-reduced-motion: reduce)` 内（`addedOutsideMedia=[]`）；8 个 `caomei-demo-*` keyframes 为顶层但无引用者 |
| 20 | no-preference Drawer 行为不变 | 通过 | `caomei-drawer-in-left-908a7d59`（组件 scoped 原名）@ `0.2s`，`animationName`/`animationDuration` 均为单值（无重复动画 / 双重时长），13 个不同 `translateX`；`animationstart` 事件名为带 hash 的组件名 |
| 21 | no-preference 其余项与改前一致 | 通过 | Accordion `caomei-accordion-slide-down/up-dab1bc1c` @ `0.2s`；Image `caomei-image-pulse-b1f6a340` @ `1.2s infinite`；AutoComplete `caomei-auto-complete-spin-f0eedf29` @ `0.8s infinite`；Button `caomei-button-spin-002e8400` @ `0.6s infinite`；4 个 Portal 面板为全局名 + `0.12s/0.18s`，与 reduce 下同为组件原值 |
| 22 | 移动 390 Drawer 位移 + 时长 | 通过 | `0.2s`，13 个不同位置 `-350.3 → … → 0`，settled x=0 |
| 23 | 移动 390 无横向溢出 | 通过 | `documentElement.scrollWidth 390 == clientWidth 390`；`body.scrollWidth 390 == clientWidth 390` |
| 24 | 宿主稳定性：遮罩完整覆盖（Step 2.5） | 通过 | 真实滚动条 15px；遮罩 rect `(0,0,1280,800)`，`left<=0 && top<=0 && right>=innerWidth && bottom>=innerHeight` → true |
| 25 | 宿主稳定性：in-flow 不位移 | 通过 | `.VPContent` 文档坐标 `Δleft=0 / Δtop=0`（打开→关闭全程） |
| 26 | 宿主稳定性：fixed 元素宽度变化归因 | 通过（已知预期） | `.VPNav` 宽 `1265 → 1280`（+15px）= 实测滚动条宽；滚动锁 `body overflow-y: visible → hidden → visible` 复原 |
| 27 | CLS 归因 | 通过 | 打开窗口 `clsOpen=[]`、关闭窗口 `clsClose=[]`（0 条 layout-shift） |
| 28 | 暗色抽检 | 通过 | `html.dark` 下 `caomei-demo-slide-in-left` @ `0.2s`，13 个不同位置（动画时长不随主题变化） |
| 29 | 加载指示既有行为保持 | 通过 | ProgressSpinner `caomei-progress-spinner-spin-458b6237` @ `1.6s infinite`；Skeleton `caomei-skeleton-pulse-80f16045` @ `2.4s infinite`；原 3 条规则与 HEAD **字节级一致**（`git show HEAD:…motion.css` 对比无差异） |
| 30 | 非目标：未恢复全站 `transition-duration` | 通过 | motion.css 的 reduce 规则**无任何** `transition-*` 声明；新增规则不选 `transition` |
| 31 | 非目标：未改组件库 | 通过 | `git status` 仅 1 文件；`src/**` 无改动；组件自身 `@media (prefers-reduced-motion)` 规则未被源码层修改 |
| 32 | 桌面/移动截图渲染非空 | 通过 | 11 张 PNG 均有效（10362 / 5549 / 890 / 5604 / …… unique colors）；动画中途帧像素探针：面板右边缘 @x=390（桌面，满宽 420）、@x=356（移动，满宽 351），左侧白 = 面板底色、右侧 `rgb(149,149,149)` = 遮罩压暗后的页面 |
| 33 | 全站 reduce 压平对照未被破坏 | 通过（含 1 条上游例外，见 O1） | 全量扫描中 `transitionDuration !== '0s'` 仅 4 个 VitePress 自带实例（`.VPSwitch` / `.check` ×2），**非**本层选择器命中 |
| 34 | console error / pageerror / HTTP ≥ 400 | 通过 | **0**（6 个 context：reduce 桌面 ×3、no-preference、移动、宿主稳定性、暗色） |

> 本节为**首轮**口径。#7 / #8 / #9 / #18 已被 2026-09-16 **复验轮取代**（#7 口径不完整、#8 / #9 / #18 为 P1，现已闭环），以 §8 为准。

## 4. 问题清单

### P1（warning，非回归；closed 条目不可达 = 死代码）Drawer / Accordion 退出动画在 reduced-motion 下不实际播放 —— ✅ 2026-09-16 复验已闭环（见 §8）

- **现象**：
  - **Drawer**：`MutationObserver` 在 `data-state` 变为 `closed` 的同一微任务内读到 computed `animation-name: caomei-demo-slide-in-left`、`animation-duration: 0.2s`、`animation-direction: reverse`、`connected: true`；但元素 **2.2ms 后即被移除**，全程 `animationstart`/`animationend` **0 条**，关闭到元素消失 `35ms`。同一探针在 **no-preference** 下：`goneAfterMs = 240`，`caomei-drawer-out-left-908a7d59`、`caomei-drawer-fade-out-908a7d59` 的 start+end 均触发。
  - **Accordion**：关闭后 20ms 采样为 `display: none` / `hidden: true` / `height: 0`，无 `animationstart`；no-preference 对照在关闭后 20ms 仍 `display: block` / `h=52`，`caomei-accordion-slide-up-dab1bc1c` start+end 触发。
- **复现**：
  1. `npx vitepress dev docs --port 5175`；
  2. `BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-details.mjs`（`drawerClose_reduce` vs `drawerClose_no-preference`）；
  3. `BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-accordion.mjs`（`reduce.justAfterClose` vs `no-preference.justAfterClose`）。
- **根因（已定位到上游实现）**：`node_modules/reka-ui/dist/Presence/usePresence.js` 用「动画名是否变化」判断是否发生了新的出场动画：
  - L55 `const isAnimating = prevAnimationName !== currentAnimationName`；L56–L62 `prevPresent && isAnimating ? dispatch('ANIMATION_OUT') : dispatch('UNMOUNT')`。
  - 文档层对 closed 态沿用**同一个** `animation-name` 并靠 `animation-direction: reverse` 反播（`caomei-demo-fade-in` / `caomei-demo-slide-in-*` / `caomei-demo-accordion-down`）。入场结束时 `prevAnimationNameRef` 已被 `animationstart` / state watcher 记为该名，关闭时名字不变 → `isAnimating=false` → 立即 `UNMOUNT`（Drawer 移除 DOM；Accordion 走同一 presence 机制施加 `hidden`）。**组件自身**之所以能出场，是因为它用了成对且名字不同的 `*-in-*` / `*-out-*`（scoped 后为 `caomei-drawer-in-left-908a7d59` vs `caomei-drawer-out-left-908a7d59`）。
- **影响**：`motion.css` 中 7 条 closed 规则（overlay 淡出 1 + content 四向属性 1 + content 四向 `animation-name` 4 + accordion 1）连同 `animation-direction: reverse` 声明为**死代码**；M3 范围文字「逐个恢复入场 / 退出动画」对 Drawer / Accordion 未达成。**不构成回归**（改动前 reduce 下同样是瞬时关闭），也不影响最小验收标准（只要求入场），故未判 blocker。
- **修复方向（已用页面内注入探针实测可行，未改源码）**：退出动画改用**独立命名**的 keyframes 并保持默认方向，例如 `caomei-demo-fade-out` / `caomei-demo-slide-out-{left,right,top,bottom}` / `caomei-demo-accordion-up`（数值对齐组件 exit 版本；accordion 用组件原值 `ease-out` 而非 `reverse(ease-out)`=ease-in）。实测注入后：Drawer 关闭元素存活 `258ms`，`x` 逐帧 `-1 → -33 → -97 → -176 → -246 → -299 → -339 → -389 → -404 → -413 → -419`，`animationstart/end` 触发；Accordion 关闭 20ms 时仍 `display:block` / `h=45`，`caomei-demo-accordion-up-probe` start+end 触发。证据：`probe-fix-hypothesis.json`。
- **处置建议**：交 `@frontend-developer` 二选一——① 按上述改造 closed 规则（推荐，能真正补齐退出动画）；② 若本轮只做入场，则删除 7 条 closed 规则并修正 `motion.css` 注释与 M3 表述，避免死代码与「已恢复退出」的错觉。

## 5. 观察项（OBSERVE）

| # | 观察 | 归因 | 处置 |
| --- | --- | --- | --- |
| O1 | reduce 下全站扫描仍有 4 个元素 `transition-duration: 0.25s`：`.VPSwitch` / `.check`（主题外观开关 ×2）。原因是 VitePress 自身在 `.VPSwitch[data-v-7d41a41e]` 上以 `transition: border-color 0.25s !important` 声明，比基础 `* { transition-duration: 0s !important }`（特异性 0）更高 | **上游 VitePress 既有**，motion.css 无任何选择器命中该元素 | 与本次无关，不阻断；如需彻底压平需在文档层再补一条（属另一议题，建议登记 Backlog / 上游反馈） |
| O2 | Portal 面板「按组件选择器恢复」的 scope 泄漏面：`.caomei-toast` / ConfirmDialog 的 Provider 挂在 `layout.vue`（在 `#app` 内、**不在** demo 容器内）。当前站点无「非 demo 触发」路径（`docs/.vitepress/theme/components/**` 未直接使用 caomei 组件），故现状安全 | 本次变更的**作用域取舍** | **判定：可接受。** 结论「无更可靠的容器作用域方案」：① 父链实测 `DIV < BODY < HTML`（Toast 为 `OL < DIV < DIV#app < BODY`），demo 容器非祖先；② `body:has(.vitepress-demo-plugin__container) .caomei-*` 只能做**页面级**而非**触发级**作用域，同页存在 demo 时仍会误命中，不优于组件选择器；③ 触发级作用域需 Reka `Portal :to` 指向 demo 容器或组件暴露该能力 → 属「改组件库」，与 M3 非目标冲突。建议把注释中「文档站仅在 demo 中触发它们」改为「当前仅在 demo 路径触发，新增站点级 Toast/Confirm 触发时需重新评估」 |
| O3 | AutoComplete 加载指示策略不一致：组件自身 reduce 策略是**减速到 1.6s**（`auto-complete.vue:538` `animation-duration: 1.6s`，非停止），文档层强制回 `0.8s`，等于绕过组件的无障碍减速；而 Button/Image 是组件自身 `animation: none` → 文档层恢复为正常速度 | 本次变更（层行为 vs 组件策略的取舍） | 低风险。建议在层注释中显式写明「AutoComplete 在 reduce 下为减速而非停止，本层按正常速度恢复」，便于后续审计 |
| O4 | 层级依赖：`caomei-demo-*` keyframes 与组件 scoped keyframes（如 `caomei-drawer-in-left-908a7d59`）数值是**手工同步**的副本，组件动画变更时不会自动跟随 | 本次变更（scoped keyframes 名称被编译期重写，跨文件不可引用的既有约束） | 注释已声明该约束；建议后续在组件动画数值调整时把本文件列入变更清单（或加一条最轻量的一致性断言） |
| O5 | `var(--caomei-drawer-duration, 200ms)` 取值路径：组件把 token 声明在 `.caomei-drawer__content` 自身的 scoped 规则内（特异性 (0,2,0)），因此文档层的 `, 200ms` 回落**实际从未被使用**；运行时以 `.caomei-drawer__content`（(0,1,0)）覆写为 `400ms` **无效**，实测仍 `200ms` | 组件既有 token 声明层级（非本次引入） | 仅记录。文档层依赖 `var()` 的写法正确；如需支持外部覆盖需 ≥ 同特异性或以 `style` 内联 |
| O6（**已于 M3 条目 2 处理**） | 两处文档曾以「未落地」口径描述本层职责：[文档与演示站设计 §9](../documentation-site.md) 只列了加载指示恢复、ui-validator cookbook §5（`.github/skills/ui-validator/references/browser-cookbook.md`） 写「演示区域入场动画 opt-in 尚未落地（属待办）」 | 本次变更的**文档同步**缺口（M3 条目 2「取舍文档与验证」覆盖） | 非本轮条目职责，不阻断；交 `@documentation-specialist` 在 M3 条目 2 一并更新（含本记录的 P1 结论） |

**复验轮（2026-09-16，见 §8）状态复核**：O1 / O2 / O3 / O4 / O5 **全部仍成立**（O1 实测 reduce 下仍有 4 个 `.VPSwitch` / `.check` 实例 `transition-duration: 0.25s`，均非本层选择器命中；O2 经 `layout.vue` 与 `theme/components/**` 检索确认仍无非 demo 触发路径）。**O6 成立且范围扩大**：`documentation-site.md` L94 与 `browser-cookbook.md` L55 均未更新，条目 2 同步时需一并写入「退出动画已恢复（Drawer / Accordion 首次折叠）」与新增 **P2** 的口径。

## 6. 未覆盖边界

- **Toast swipe-out**：`[data-swipe='end']` → `caomei-toast-swipe-out` 未覆盖。合成鼠标拖拽未触发 swipe（`dataset.swipe` 保持 `null`），需真实指针手势或 `touch` 序列。
- **Drawer 其余三向**（`right` / `top` / `bottom`）只核对了选择器与四向规则存在性，逐帧位移仅测 `left`（`positions` demo 的 `top`/`bottom` 需滚动后定位，本轮未做）。
- **视觉通道不可用**：`vision-augment` reasoning 返回 400（与历史 session 同因），改以「PNG 像素探针 + 数值时间线」客观替代人眼语义判读（见 §3 #32）。
- 仅 VitePress **dev**（源码直出），未跑 `pnpm docs:build` 产物与 `vitepress preview`；未验证 Nuxt 下游。
- 非 Chromium 内核（WebKit / Firefox）与真机未覆盖。
- 英文站 `/en-US/**` 未覆盖。
- Portal 面板仅测亮色 + 桌面；未测暗色 / 移动下 4 个面板的入场。
- 未覆盖平板（768 / 834）断点。

## 7. 截图清单

> 全部位于 gitignored 的 `test-results/m3-demo-motion/`。

- `independent-reduce-drawer-open.png`：reduce 下 Drawer 入场 settled（1440×900）。
- `independent-nopref-drawer-open.png`：no-preference 下同态对照（与上一张渲染一致，动画名证据在 JSON）。
- `independent-mid-slide-desktop-x-81.png` / `independent-mid-slide-mobile390-x-43.png`：入场途中帧（面板右边缘 @x=390 / @x=356，远未占满 420 / 351）。
- `independent-mobile-390-drawer.png`：移动 390 reduced-motion。
- `independent-dark-drawer-open.png`：暗色 reduced-motion。
- `independent-reduce-portal-{popover,dropdownmenu,datepicker,toast}.png`：4 个 Portal 面板入场。
- `independent-stability-drawer-open.png`：Step 2.5 宿主稳定性（真实滚动条打开态）。

## 8. 复验 / 追加记录

### 2026-09-16 复验轮（P1 修复后；范围冻结于 P1 修复点与直接受影响面）

> ⚠️ 本节的 Reject 结论已被 §9 第 3 轮取代（P2 已闭环）。保留本节作为 P2 的发现与根因记录。

> **结论：Reject（核对项 17 / 失败 1（新增 P2）/ 观察项 6 / console 0）。**
>
> **P1 已闭环**：`[data-state='closed']` 改用**独立命名**的 `caomei-demo-fade-out` / `caomei-demo-slide-out-{left,right,top,bottom}` / `caomei-demo-accordion-up`（默认方向，不再复用入场名 + `animation-direction: reverse`）。Drawer 关闭路径元素存活 `253.6ms`（首轮 `2.2ms` 即卸载）、逐帧 x 与 no-preference 下组件自身 `caomei-drawer-out-left-908a7d59` 轨迹一致；Accordion 首次折叠实测 `caomei-demo-accordion-up` 真实播放（13 个高度值 + start/end）。**「computed 命中但不播放」不再成立。**
>
> **但直接受影响面新发现 P2（warning，本次变更引入、非 P1 修复引入）**：reduce 下 Accordion 的高度插值只在「起始展开 item 的第一次折叠」成立，**起始折叠 item 的首次展开**与**任意 item 第 2 次起的切换**均无插值（`--reka-collapsible-content-height` 被写成 `0px` 并保持），用户可见表现为瞬间收起 / 展开。据此本轮 V 不通过。

- 被测 revision：工作区未提交改动（`docs/.vitepress/theme/motion.css`，mtime `2026-09-16 04:19:46`，288 行；`HEAD d4e4725` 的 motion.css 仅 29 行 = 3 条加载指示规则）。
- 复现脚本（gitignored）：

```bash
BASE=http://localhost:5175 node test-results/m3-demo-motion/recheck.mjs         # 退出事件/存活/位移 + Portal + 加载指示 + CSSOM + demo 外 + 移动 390 + console
BASE=http://localhost:5175 node test-results/m3-demo-motion/recheck-cycles.mjs  # 逐轮次（Accordion 3 轮 / Drawer 2 轮）+ CSSOM 定向
BASE=http://localhost:5175 node test-results/m3-demo-motion/recheck-final.mjs   # 精确 CSSOM 断言 + no-preference 原值/单值
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-p2-mechanism.mjs  # P2 测量瞬间录制（MutationObserver + rAF）
BASE=http://localhost:5175 node test-results/m3-demo-motion/probe-p2-hypothesis.mjs # P2 修复假设 A/B（结论：无效）
node test-results/m3-demo-motion/recheck-pixel.mjs                              # 截图像素探针
```

> 同样位于 gitignored 的 `test-results/m3-demo-motion/`，未入库。本轮**不复用** D 阶段 `validate.mjs` 的采样与结论（其 Accordion 段为「任意态点击」序列，且只读 computed 值，未绑定元素引用、无高度时间线）。

#### 8.1 逐项实测值

| # | 核对项 | 结论 | 关键实测值 |
| --- | --- | --- | --- |
| R1 | reduced-motion 上下文 | 通过 | reduce 上下文 `matches === true`；no-preference 对照 `false` |
| R2 | Drawer 退出：动画事件触发 | 通过 | overlay `caomei-demo-fade-out` start@67.6ms / end@250.8ms（`elapsedTime 0.2`）；content `caomei-demo-slide-out-left` start@67.7ms / end@251.8ms |
| R3 | Drawer 退出：元素存活时长 | 通过 | `goneAtMs 253.6ms`（首轮 reduce 为 `2.2ms` 移除 / `35ms` 消失；no-preference 对照 `258.2ms`） |
| R4 | Drawer 退出：逐帧位移与 no-preference 一致 | 通过 | reduce `0,0,0,-1,-33,-97,-176,-246,-299,-339,-368,-390,-404,-414,-419`（13 个不同位置）；no-preference 组件原动画 `0,0,0,0,0,-30,-93,-171,-242,-296,-337,-367,-388,-403,-413,-418`（12 个不同位置/16 帧）→ 轨迹一致（约 1 帧相位差） |
| R5 | Drawer 退出：不再复用入场名 | 通过 | `direction: normal`、`duration 0.2s`、states 含 `open`+`closed`；CSSOM 6 条 out 规则 `hasReverse` 全为 false |
| R6 | Accordion 折叠（var 正确的路径） | 通过 | `caomei-demo-accordion-up` start@57.2ms / end@240.9ms；绑定元素引用高度时间线 `52,52,52,52,45,39,32,27,21,16,12,8,5,2,1,0`（13 个不同高度）；`display:none` 出现在 `242.2ms`（P1 时 20ms 即 `hidden`）；`inDemo=true` |
| R7 | Accordion 其余路径的高度插值 | **失败（P2）** | 起始折叠 item **首次展开**：仅 2 个高度值（`0→52`）、`var=0px`（no-preference 同操作 13 个高度值）；起始展开 item **第 2 次起** open/close 均仅 2 个高度值、`var=0px`（见 §8.3） |
| R8 | Drawer 入场未回归 | 通过 | `caomei-demo-slide-in-left` @ `0.2s` / `normal`，x `-419,-244,-121,-52,-16,-1,0`（7 个不同位置），settled x=0 |
| R9 | Accordion 入场名称/时长/事件未回归 | 通过（受 R7 影响） | `caomei-demo-accordion-down` @ `0.2s` / `normal`，start+end 触发；起始展开 item 的首次入场因 Reka `skipAnimation` 不参与动画故未暴露 R7 |
| R10 | Portal 面板入场 4 项 | 通过 | Popover `caomei-popover-in` @ `0.12s`、DropdownMenu `caomei-dropdown-menu-in` @ `0.12s`、DatePicker `caomei-date-picker-in` @ `0.12s`、Toast `caomei-toast-in` @ `0.18s`，**均 start+end 触发**，`inDemo=false`（作用域结论不变） |
| R11 | 加载指示 Image / Button / AutoComplete | 通过 | `caomei-demo-image-pulse` @ `1.2s infinite`；`caomei-demo-spin` @ `0.6s infinite`；`caomei-demo-spin` @ `0.8s infinite`，`inDemo=true` |
| R12 | no-preference 对照：组件原名 / 无重复动画 / 无双时长 | 通过 | Drawer 入 `caomei-drawer-in-left-908a7d59` @ `0.2s`、出 `caomei-drawer-out-left-908a7d59` @ `0.2s`；`animationName`/`animationDuration` 均单值（`includes(',')===false`）；Accordion `caomei-accordion-slide-{down,up}-dab1bc1c` @ `0.2s` 且第 2 次切换仍正常插值 |
| R13 | CSSOM：新增规则归属 | 通过 | motion.css 25 条样式规则，`styleRulesOutsideReduce=[]`（**全部**位于 `@media (prefers-reduced-motion: reduce)` 内）；`anyReverse=[]`；6 条 out 规则逐一 `inReduce=true` 且键帧引用 = `fade-out` / `slide-out-{left,right,top,bottom}` / `accordion-up`；14 个顶层 keyframes（8 入场/加载 + 6 out）在 reduce 外无引用者 |
| R14 | demo 外对照 | 通过 | `.VPSidebar` / `.VPNavBarTitle` / `.VPNav` / `.VPContent` / `.vp-doc` → `animationDuration 0.001s`、`transitionDuration 0s` |
| R15 | 移动 390（isMobile + touch） | 通过 | 入场 `caomei-demo-slide-in-left` @ `0.2s`（x `-324→0`）；退出 `caomei-demo-slide-out-left` @ `0.2s`、13 个不同位置（`0→-350`）、存活 `251.3ms`、start+end；`documentElement`/`body` `scrollWidth == clientWidth == 390`（开 / 关前后一致，无横向溢出） |
| R16 | 加载指示 3 条规则未回归 | 通过 | 与 `git show HEAD:docs/.vitepress/theme/motion.css` 的 reduce 块 **diff 为空（字节级一致）** |
| R17 | console error / pageerror / HTTP ≥ 400 | 通过 | **0 / 0 / 0**，另 `requestFailed 0`（reduce 桌面 + no-preference + 移动 390 三上下文） |

#### 8.2 P1 闭环证据（对照首轮失败口径）

| 维度 | 首轮（P1） | 复验轮 |
| --- | --- | --- |
| Drawer 退出 computed | `caomei-demo-slide-in-left` + `reverse`（命中但不播放） | `caomei-demo-slide-out-left` + `normal` |
| Drawer 退出 `animEvents` | `[]` | fade-out + slide-out 各 start/end（`elapsedTime 0.2`） |
| Drawer 关闭到消失 | `35ms`（元素 `2.2ms` 即移除） | `253.6ms`（no-preference `258.2ms`） |
| Accordion 关闭 20ms 态 | `display: none` / `hidden` / `h=0` | `display: block` / `h=52`（`display:none` 推迟到 `242ms`） |
| Accordion 关闭事件 | 无 | `caomei-demo-accordion-up` start/end |
| 根因处置 | Reka `usePresence` 以 `animation-name` 变化判定出场 → 同名被判「无动画」 | 改用独立命名 → 事件与逐帧位移均成立，**闭环** |

#### 8.3 P2（新增，warning）reduce 下 Accordion 高度插值仅在首折叠成立

- **现象（实测，`recheck-cycles.mjs`）**：
  - 起始展开 item：close#1 → 13 个高度值（正常）；open#2 / close#2 / open#3 / close#3 → **均仅 2 个高度值**（`0↔52` 跳变）。
  - 起始折叠 item（同一页第 2 个 item）：**首次展开**即仅 2 个高度值（`0→52`）；no-preference 同一操作 13 个高度值（`0,7,14,20,25,31,36,40,44,47,50,51,52`）。
  - 两种场景下 `caomei-demo-accordion-{up,down}` 的 `animationstart`/`animationend` 仍按 `0.2s` 触发 —— 即**事件在播、视觉效果不在**，与 P1 的「computed 命中但不播放」是不同的失败模式。
- **复现**：`BASE=… node test-results/m3-demo-motion/recheck-cycles.mjs`（看 `accordionCycles` 的 `distinctMetric`：`13,2,2,2,2,2`）；单场景见 `probe-p2-mechanism.mjs`。
- **根因（已录制测量瞬间，`probe-p2-mechanism.json`）**：Reka `node_modules/reka-ui/dist/Collapsible/CollapsibleContent.js` L40–57 在 `watch([isOpen, present])` → `await nextTick()` 后，先内联 `transitionDuration='0s'` / `animationName='none'`，再以 `getBoundingClientRect().height` 测量自然高度并写回 `--reka-collapsible-content-height`（L86）。reduce 层对该元素的 `animation: … !important`（motion.css L46）特异性高于该内联声明，使测量窗口内**入场动画仍在生效**：
  - open#2 在 `42.8ms` 时 `state=open` 但 `hidden=true / display:none`（`rectH=0`），`43.7ms` 转 `display:block` 时 `cssH=0px`（入场动画 `from { height: 0 }` 首帧）→ `height.value = 0` → 变量写成 `0px` 并保持，后续 `from`/`to` 均解析为 `0px`。
  - 对照 close#1 在 `40.9ms` 测量时 `rectH=52 / var=52px` → 首次折叠正常。
  - no-preference 下内联 `animation-name: none` 有效 → 测量取到自然高度 `52px`，变量始终正确 → 无此问题。
- **修复方向（候选，均未验证通过，勿直接照搬）**：
  1. 「测量豁免」尝试已实测**无效**：注入 `.caomei-accordion__content[data-state='…']:not([style*='animation-name: none'])` 后，4 个场景的 `distinctHeights` 与基线**完全一致**（`13 / 2 / 2 / 2`，`probe-p2-hypothesis.json`）→ 写入 `0px` 的时刻不落在单一可豁免窗口，方案需重新设计。
  2. 改为只恢复 `animation-duration` / `-iteration-count` 并保留组件 keyframes 名 —— 受「scoped keyframes 名被编译期重写、跨文件不可引用」约束（本文件 L19–21 已声明），不可行。
  3. 从 opt-in 层移除 Accordion（回到组件 `animation: none`），并同步修正 M3 表述，至少消除「已恢复」的错觉。
  4. 若必须恢复，需组件侧暴露稳定 keyframes 名或可作用域能力（`Portal :to` 指向 demo 容器），属「改组件库」，与 M3 非目标冲突 → 建议登记 Backlog。
- **影响与定性**：仅 reduce 上下文；不构成对首轮 P1 的否定（P1 根因已闭环），但 M3「让开启减少动态效果的访客看到 Accordion 动效」的目标**仅在极窄路径达成**（每页起始展开 item 的第一次折叠），故本轮 V 判 Reject。**更正**：首轮 §3 #7「Accordion 入场 通过」口径不完整（只核对名称/时长/事件，未核对高度插值）。

#### 8.4 复验轮截图（gitignored）

- `recheck-reduce-drawer-open.png`：reduce 桌面 1440×900 Drawer 入场 settled。
- `recheck-reduce-drawer-closing.png`：reduce 桌面关闭**中途**帧。像素探针（`recheck-pixel.json`）中行：`x 0–160` 为 `255,255,255`（面板底色）、`x 240` 起 `198→206,206,206`（遮罩压暗后的页面）→ 面板正在左移出视口（非瞬间消失）。
- `recheck-mobile390-drawer.png`：移动 390×844 reduce 关闭后页面（`scrollWidth == clientWidth == 390`）。

#### 8.5 本轮未覆盖

- Drawer `right` / `top` / `bottom` 三向的退出逐帧位移；暗色下退出；Toast swipe-out；Portal 面板暗色 / 移动 —— 均沿用首轮 §6 的未覆盖清单，未新增覆盖。
- 仅 VitePress **dev**、Chromium；未跑构建产物、未覆盖 WebKit / Firefox 与真机、未覆盖 `/en-US/**`。

## 9. 第 3 轮（末轮）复验：P2 闭环

### 2026-09-16 末轮（P2 修复后；范围冻结于 P2 修复点与直接受影响面，轮次上限 3）

> **结论：Pass（核对项 18 / 失败 0 / 观察项 6 / console 0）。P2 已闭环，P1 与其余恢复项未回归。**
>
> **P2 已闭环**：`docs/.vitepress/theme/motion.css` 的 Accordion 规则由「`animation: … ease-out !important`（shorthand + `!important`）」改为「`animation-name` 以更高特异性（多一层 `.caomei-accordion`）声明、`animation-duration` / `-timing-function` / `-iteration-count` 用 `!important`」。实测恢复 Reka `CollapsibleContent` 测量窗口的内联 `animation-name: none` 抑制能力，`--reka-collapsible-content-height` 在 `animationstart` **之前**写入自然高度（52px），入场 / 退出的逐帧高度插值**在两条路径（起始展开 / 起始折叠）共 12 次过渡中全部成立**。
>
> 一行回写：`V 通过（末轮）｜P2 闭环：reduce 下 Accordion 12 次过渡全部逐帧插值（起始展开 item 4 轮 8 次 + 起始折叠 item 首次展开及后续 3 次，distinctHeights 13~14），var 在 animationstart 前写入 52px（内联 animation-name:none 抑制恢复）；P1 未回归（Drawer 入 0.2s/13 位移、出 slide-out-left 0.2s/13 位移/存活 259.1ms/start+end）；Portal 4 + Image/Button/AutoComplete 不变；no-preference 组件 scoped 名无重复动画；motion.css 25 条样式规则全部在 reduce 媒体查询内（accordion 规则 animation-name 优先级非 important、duration 为 important，无 reverse）；demo 外 .VPSidebar/.VPNav/.VPContent 等仍 0.001s/0s；移动 390 无横向溢出；核对 18 / 失败 0 / 观察项 6 / console·pageerror·HTTP≥400·requestFailed 全 0`。

#### 9.1 逐项实测值

| # | 核对项 | 结论 | 关键实测值 |
| --- | --- | --- | --- |
| R18 | P2 闭环：起始展开 item 首次折叠 | 通过 | `caomei-demo-accordion-up` start@79ms / end@262.8ms（`elapsedTime 0.2`）；高度 `52,52,52,52,45,38,32,26,21,16,12,8,5,2,1,0`（13 个不同值），settled h=0 / state=closed |
| R19 | P2 闭环：起始展开 item 第 2~4 轮 open/close（7 次过渡） | 通过 | 每次均 13 个不同高度值；open 轨迹 `0,7,14,20,26,31,36,40,44,47,50,51,52`，close 为其镜像；`animationstart`/`animationend` 各 2 条（共 16 条） |
| R20 | P2 闭环：起始折叠 item **首次展开** | 通过 | `caomei-demo-accordion-down` start@90.2ms / end@274.9ms；高度 `0,0,0,0,0,7,…,51,52`（13 个不同值，**复验轮此处仅 2 个**），settled h=52 / state=open |
| R21 | P2 闭环：起始折叠 item 后续 3 次过渡 | 通过 | close#1 / open#2 / close#2 均 13 个不同高度值 + start/end |
| R22 | P2 根因机制：测量窗口内联抑制恢复 | 通过 | close#1 的 style 写入序列：`@56.6ms inline animationName=none` → `@57.3ms 恢复为 (unset)` → 动画 `start@79ms`；即测量窗口内动画被内联抑制、测量后释放 |
| R23 | P2 根因机制：变量写入时序早于动画开始 | 通过 | 起始折叠 item 首次展开：`--reka-collapsible-content-height` 内联写 `52px` @`69.1ms` < `animationstart` @`90.2ms`（首展开）；第 4 次展开 `52px@39.2ms` < `start@64ms`。动画帧内 `var` 恒为 `52px`，不再出现复验轮的「`var=0px` 保持」 |
| R24 | CSSOM：Accordion 规则优先级（修复机制直证） | 通过 | 2 条规则均 `inReduce=true`；`animation-name` 优先级 `''`（非 important）；`animation-duration`/`-timing-function`/`-iteration-count` 优先级均 `important`；未使用 `animation` shorthand |
| R25 | CSSOM：新增 / 修改规则归属 | 通过 | motion.css `styleRuleCount 25`，`styleRulesOutsideReduce=[]`（**全部**位于 `@media (prefers-reduced-motion: reduce)` 内）；`anyReverse=[]`；`keyframesOutsideMedia` 14 个为顶层但 reduce 外无引用者 |
| R26 | P1 未回归：Drawer 入场 | 通过 | `caomei-demo-slide-in-left` @`0.2s` / normal，start@97.6ms / end@281.2ms；x `-419→…→0`（13 个不同位置） |
| R27 | P1 未回归：Drawer 退出 | 通过 | `caomei-demo-slide-out-left` @`0.2s` / normal，start@73.3ms / end@257.7ms（`elapsedTime 0.2`）；x `0,-1,-33,…, -413,-419`（13 个不同位置）；`goneAtMs 259.1ms`（组件原动画对照 258.2ms） |
| R28 | Portal 面板入场 4 项 | 通过 | Popover `caomei-popover-in` @`0.12s`；DropdownMenu `caomei-dropdown-menu-in` @`0.12s`；DatePicker `caomei-date-picker-in` @`0.12s`；Toast `caomei-toast-in` @`0.18s`；**均 start+end 触发**，`inDemo=false`（作用域结论不变） |
| R29 | 加载指示 Image / Button / AutoComplete | 通过 | `caomei-demo-image-pulse` @`1.2s infinite`；`caomei-demo-spin` @`0.6s infinite`；`caomei-demo-spin` @`0.8s infinite`，三者 `inDemo=true` |
| R30 | no-preference 对照：组件原动画 / 无重复动画或双时长 | 通过 | Accordion `caomei-accordion-slide-{up,down}-dab1bc1c` @`0.2s`，13 个不同高度值；`animationName` / `animationDuration` 均单值（`includes(',')===false`）；文档层规则因位于 reduce 媒体查询内不参与 |
| R31 | demo 外对照 | 通过 | `.VPSidebar` / `.VPNavBarTitle` / `.VPNav` / `.VPContent` / `.vp-doc` 全部 `animationDuration 0.001s`、`transitionDuration 0s` |
| R32 | 移动 390：无横向溢出 | 通过 | Accordion 折叠前 / 后、Drawer 开 / 关后 `documentElement` 与 `body` 的 `scrollWidth == clientWidth == 390` |
| R33 | 移动 390：动画仍生效 | 通过 | Accordion close `caomei-demo-accordion-up`（var `80px→0px`，14 个不同高度值）/ open `caomei-demo-accordion-down`（14 值）；Drawer 入 `caomei-demo-slide-in-left` @`0.2s`（x `-350→0`，13 位移）、出 `caomei-demo-slide-out-left` @`0.2s`（13 位移，存活 `249ms`），均 start+end |
| R34 | 截图渲染非空 + 中途帧像素证据 | 通过 | 5 张 PNG 有效（1440×900 / 390×844；uniqueColors 534~1011）；Accordion 折叠中途帧与 settled 帧像素差 `32670` 像素、差异带 `y 505..899`（内容重排带）→ 中途帧确为过渡中态（对应高度时间线 `52→38→26→16→8→2→0`） |
| R35 | console error / pageerror / HTTP ≥ 400 / requestFailed | 通过 | **0 / 0 / 0 / 0**（reduce 桌面 + no-preference + 移动 390 三上下文） |

#### 9.2 P2 闭环证据（对照复验轮失败口径）

| 维度 | 复验轮（P2） | 末轮 |
| --- | --- | --- |
| Accordion 规则形态 | `animation: caomei-demo-accordion-{down,up} 0.2s ease-out !important` | `animation-name` 非 important + 多一层 `.caomei-accordion` 特异性；duration/timing/iteration `!important` |
| 测量窗口内联 `animation-name: none` | 被 `!important` 压过 → 测量落在动画首帧 `height:0` | 生效（实测 `inline animationName=none` @56.6ms → 恢复 @57.3ms） |
| `--reka-collapsible-content-height` | 被写成 `0px` 并保持 | 在 `animationstart` 前写入 `52px`（首展开 `52px@69.1ms` < `start@90.2ms`） |
| 起始折叠 item 首次展开 | 2 个高度值（`0→52` 跳变） | **13 个高度值**（`0,7,14,…,51,52`） |
| 起始展开 item 第 2 次起切换 | 2 个高度值 | **13 个高度值**（4 轮 8 次过渡全部成立） |
| 定性 | 用户可见「瞬间收起 / 展开」 | 逐帧插值，**闭环** |

#### 9.3 末轮观察项（O1~O6）状态更新

- **O1 仍成立**：reduce 下仍有 4 个 `.VPSwitch` / `.check` 实例 `transition-duration: 0.25s`，均为 VitePress 上游 `!important`，本层无选择器命中。
- **O2 仍成立**：4 个 Portal 面板实测 `inDemo=false`；`layout.vue` 仍只挂 `CaomeiToastProvider` / `CaomeiConfirmDialog` 容器，`docs/.vitepress/theme/**` 检索无「非 demo 触发」路径 → 现状安全，结论与建议不变。
- **O3 仍成立**：`auto-complete.vue:542` 组件自身 reduce 策略为减速 `1.6s`，文档层仍强制 `0.8s`；注释口径建议保留。
- **O4 仍成立**：`caomei-demo-*` keyframes 与组件 scoped keyframes 为手工同步副本。
- **O5 仍成立**：`var(--caomei-drawer-duration, 200ms)` 回落未被使用（token 声明在 `.caomei-drawer__content` 自身 scoped 规则内）。
- **O6（已随 M3 条目 2 落地，见 §5 O6 行；本节为第 3 轮当时状态）**：`docs/design/documentation-site.md` L94 与 `.github/skills/ui-validator/references/browser-cookbook.md` L55 均未更新（前者只提加载指示恢复、后者仍写「演示区域入场动画 opt-in 尚未落地」）。条目 2 同步时需一并写入「入场 + 退出动画已恢复（Drawer / Accordion）」与 P1 / P2 两处结论。

#### 9.4 末轮复现（gitignored 脚本）

```bash
BASE=http://localhost:5175 node test-results/m3-demo-motion/round3-recheck.mjs   # 两条路径 12 次过渡 + Drawer + Portal + 加载指示 + CSSOM + demo 外 + 移动 390 + console
BASE=http://localhost:5175 node test-results/m3-demo-motion/round3-pixel.mjs     # 中途帧重拍 + 5 张截图客观校验
```

#### 9.5 末轮截图（gitignored，`test-results/m3-demo-motion/`）

- `round3-reduce-accordion-mid.png` / `round3-reduce-accordion-mid50.png`：reduce 桌面折叠**中途**帧（与 settled 帧像素差 32670，差异带 `y 505..899`）。
- `round3-reduce-accordion-settled.png`：折叠 settled。
- `round3-reduce-drawer-open.png`：reduce 桌面 Drawer 入场 settled。
- `round3-mobile390-accordion.png`：移动 390×844 reduce Accordion。
- `round3-nopref-accordion.png`：no-preference 桌面 Accordion（组件原动画对照）。

#### 9.6 末轮未覆盖（沿用前两轮）

- 仅 VitePress **dev**、Chromium；未跑构建产物、未覆盖 WebKit / Firefox 与真机、未覆盖 `/en-US/**`、未覆盖平板断点与 Portal 面板暗色 / 移动、Toast swipe-out —— 均与前两轮一致，未新增覆盖。
- 第 3 轮为末轮（轮次上限 3），不再追加复验；遗留未覆盖项按现状记录。

## 附：交付方补充扫描（2026-09-16，条目 2 文档口径依据）

为给「当前文档站只在 demo 路径触发这些组件」这一表述留证据，交付方补跑一次 reduced-motion 下的 demo 外扫描（脚本 `test-results/m3-demo-motion/outside-demo-scan.mjs`，产物 `outside-demo-scan.json`，均 gitignored）：

| 指标 | 结果 |
| --- | --- |
| 扫描页面 | **12 页**：`/`、`/guide/getting-started`、`/design/architecture`、`/plan/todo` + 8 个组件页（button / accordion / image / drawer / toast / popover / dropdown-menu / date-picker） |
| demo 容器外的恢复项（computed `animation-duration` 非 `0.001s` / `0s`） | **0** |
| 恢复项（均在 demo 容器内） | 10（accordion 9 + image 1；其余页面未进入动画态故为 0） |
| Portal 面板元素（`.caomei-drawer__*` / `.caomei-toast` / `.caomei-popover__content` / `.caomei-dropdown-menu__content` / `.caomei-date-picker__content`） | 未打开时为 0；打开后父链为 `DIV < BODY < HTML`（**不在** demo 容器内，属预期，见 §5 O2） |

口径说明：该扫描只能证明「demo 外无恢复项」，不能证明 Portal 面板的触发来源；触发来源结论由源码检索支撑（`docs/.vitepress/theme/layout.vue` 与 `theme/components/**` 无非 demo 触发路径）。
