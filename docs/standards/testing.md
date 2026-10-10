# 测试规范

本文档定义 caomei-ui 的测试分层、覆盖要求与验证矩阵。

## 1. 测试分层

| 层级 | 工具 | 目标 |
|------|------|------|
| 单元测试 | Vitest + @vue/test-utils | 组件 props / emits / slots 行为、composables 逻辑、纯函数 |
| 组件交互 | Vitest（必要时 browser mode） | Dialog / Select 等真实 DOM 交互 |
| 可访问性 | axe-core（happy-dom） | 组件级 a11y 断言（受检面 = 组件族根组件，对外导出穷尽登记；**已裁定的例外清单外零违规**，随全量单测进入合并门禁；见 [M4-1 记录](../design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md) / [M4-2 记录](../design/governance/2026-09-22-m4-2-a11y-gate-wiring.md)） |
| E2E | Playwright | `examples/` 示例应用中的关键路径与主题切换 |
| 类型 | vue-tsc | 构建产物与公共 API 类型正确性 |

## 2. 覆盖范围要求

- 每个对外组件至少覆盖：
  - 默认渲染；
  - 主要 `variant` / `size` 分支；
  - 关键 props 与事件（至少一个正向 + 一个边界）；
  - 受控组件（`v-model`）的双向绑定；
  - 禁用态、加载态（如适用）。
- composables 必须有独立单元测试。
- 修复 bug 时，必须补充能复现该 bug 的回归测试。

### 2.1 样式与组件类改动的回归验证

- **回归目标（2026-09-29 用户口径；适用面＝样式与组件类改动）**：验收目标是「组件**按预定设计**（[设计规范 §6](../design/design-spec.md) 的组件约定）展现、**交互符合设计**、减少样式错误造成的问题」，而非仅「无报错 / 无溢出」。
- **回归面按可判定性分层，按改动面选取**至少一个**适用层**；**适用层**缺证据即视为未覆盖，不得用「测试通过」替代（**不要求每项改动覆盖全部四层**）：
  1. **声明层**——源码契约单测（如共享外壳高度契约 `test/contracts/`）；
  2. **计算样式层**——`pnpm capture:styles` 冻结基线逐属性比对；
  3. **几何层**——常驻 E2E 盒模型断言（如字段族溢出扫描）；
  4. **交互与可访问性层**——`@ui-validator` 浏览器验证 / `pnpm test:a11y` / 焦点与动效 E2E。
  覆盖缺口的扩展候选见 [Backlog §1.6](../plan/backlog.md#_1-6-基建与治理候选)。
- 涉及 CSS 级联 / 特异性的修复（如 `:focus-within` 覆盖状态边框色），jsdom / happy-dom 不计算 scoped CSS，无法在单元测试中复现。此类修复以 `@ui-validator` 浏览器验证作为回归证据，必须记录关键 computed style 的实测值（如 `border-top-color`）；证据须可追溯（落盘到仓库内可提交的位置，或在提交信息中内联实测值），不得仅指向会被清理或被忽略的临时目录。
- **样式治理类改动**（档位 `:where()` 归一化、同规则声明去重、触发器结构收敛、token 归并）的计算样式等价由 `test/capture/` 的采集装置举证：`pnpm capture:styles` 一条命令重跑并与仓库内冻结基线逐属性比对，取代一次性脚本。装置只覆盖**声明式样式面**（采样面与未纳入面的登记见治理记录），不替代 §5.1 的浮层稳定性断言与常驻 E2E 的几何断言。
- **冻结基线式装置的判别力须用负向对照证明**：「基线纳入某形态」≠「该形态的规则生效」——拼写错误的选择器、不存在的规则在采样面里同样表现为「稳定值」，只有**修复**才会报差异。故对「新加规则 / 改名规则 / 拼写修正」类改动，必须在同批补一次**故意回注错误**的负向对照（回注 → `capture:styles` 必须报差异），不能只以「0 差异」举证。
- **计算样式采样只应收录组件契约承载的属性**：夹具传入的图标 / 内容尺寸（如 svg 的固有 `24px`）属夹具固有值，收录等同把夹具快照当契约冻结、给出虚假覆盖感。判断法——问「该属性是否由本库样式规则决定」；否则转为注释声明的**有意不采样**。
- **同类问题的扩面排查取「几何 + 声明」双层，且启发式必须用负向对照证伪**：几何层用可复用判定（如「根边框盒之外的在流后代」+ 忽略绝对 / 固定定位 + 祖先 `overflow` 非 `visible` 视为已裁切 + 1px 容差）扫全族；声明层用「根类规则定位」守源码。启发式初版常因只看「块内出现某声明」而被同文件的修饰类死规则误通过——必须构造反例验证判别力（实例见[字段外壳高度审计](../design/governance/2026-09-29-field-shell-height-audit.md)）；自持外壳的多行组件不进共享 shell 声明守卫者，须显式登记进几何扫描清单。
- **常驻装置扩面（采样面 / 几何成对 / 焦点可见）的统一形态**：① 受检面用**下界守卫**（`MIN_*` 常量 + `>=` 断言）防静默收窄；② 计算样式采样面扩入后 `--freeze` 重冻结，基线 diff 应**只含新增键 + `capturedAt`**，出现既有键值漂移即说明装置或源码被顺带改动；③ 每个新键 / 新对需**负向对照**（临时回退 `src/` 契约后再还原）自证判别力；④ 静态渲染无法命中（需交互开合 / box-shadow 焦点环 / 恒禁用子元素）的形态显式登记为**未纳入面**。负向对照票数按「组件数 × 视口数」计。
- **「兄弟 / 相邻 / 非首项」类规则的断言取样必须落在被命中集合内**：如 VitePress `.vp-doc li + li { margin-top: 8px }` 只命中第二个及之后的 `li`，取样第一个菜单项则 `margin-top` 恒为 0（与隔离规则存在与否无关，属恒过无判别力）；须前置断言「至少 2 个成员」，并用单变量负向对照暴露。
- **负向对照须挑「默认配置下两值确实不同」的契约点**：回退一个在默认 / 极简预设下同值的 token（如滑块前景）**不会**产生差异，据此宣称「判别力已证」是假阴性（「基线纳入某形态」≠「该形态的规则生效」）；应挑**几何 / 字面量**契约点（如宽度 `40 → 44px`、强调条 `3 → 4px`）。判据 = 回退后计算值**必然改变**。**附带不变量**：扩面后基线 diff 只含 `capturedAt` + 新增键，出现既有键值漂移须先归因。
- **「瞬时元素」不是采样面的排除理由，可用「常驻化 + 程序化入队 + 与交互段排序」纳入**：夹具以 `duration: 0` 常驻入队（Reka `startTimer` 在 `duration <= 0` 直接 return）、暴露控制器由脚本程序化驱动、采样段排在**点击类交互之后**（瞬时元素先采会被交互「偷走」窗口 → 静默缺失且 diff 报 0 差异，属假通过）。因果表述须精确（程序化入队不受模态焦点陷阱影响）。
- **真实渲染整体像素层（视觉回归基线）**：`pnpm test:visual` 以 Playwright 内置 `toHaveScreenshot` 与**仓库内冻结基线**（`test/visual/__screenshots__/`）比对，覆盖 `capture:styles`（声明式样式逐属性）与几何断言之外的综合渲染结果（组合 / 布局 / 字体 / 层叠）。装置口径：独立 `playwright.visual.config.ts` + 固定环境（chromium / 固定 viewport / DPR 1 / locale / tz / `reducedMotion: reduce`）+ **双轴容差**（`threshold` 色差轴 + 绝对 `maxDiffPixels` 面积轴）+ **串行 `workers: 1` / `retries: 0`**；受检面用**下界守卫**防静默收窄、判别力以**负向对照**自证（装置与首批范围见[治理记录](../design/governance/2026-10-10-phase21-m3-1-visual-baseline-device.md)）。**基线生成环境纪律**：浏览器渲染随 OS / 字体 / 浏览器版本而变，基线须在**与 CI 相同环境**生成，跨环境差异是假阳性主源。**接入策略**：不进 `pnpm verify` 常驻链，随周级回归**先非阻断**观测，首个 `ubuntu-latest` 全绿 run 后评估转阻断。

## 3. 覆盖率

- 目标覆盖率：**≥ 80%**（Statements / Branches / Functions / Lines）。
- 不牺牲断言有效性换取数字增长；禁止无断言的占位测试。

## 4. 测试文件组织

- 测试文件与被测源码同目录或集中在 `test/`，命名 `*.test.ts` / `*.spec.ts`。
- 组件测试命名：`<component>.test.ts`。
- E2E 集中在 `test/e2e/`，命名 `*.e2e.ts`。
- 计算样式等价装置集中在 `test/capture/`：`fixture/` 是独立 Vite 应用（被测对象为 `src/` 源码，端口 `4521`），`capture.mjs` / `diff.mjs` 为采集与比对运行器，`baseline.json` 为**冻结基线**（生成物，随装置同提交）。夹具的 `data-cap` 标记与运行器的采样面声明一一对应，采集结束按声明自检受检面（缺失 / 选择器未命中即失败），避免受检范围被静默收窄。
- E2E 夹具（`test/e2e/fixtures/`）是独立 Vite 应用，被测对象为 `src/` 源码（而非构建产物或文档站）；由 `playwright.config.ts` 的 `webServer` 拉起（`127.0.0.1:4501`，端口固定），三个 project 对应[响应式设计 §4](../design/responsive.md) 的验收视口，几何断言基座在 `test/e2e/helpers/`。**带重依赖或高 console 噪声的组件走独立入口**（如富文本编辑器 `/rich-text-editor.html`），避免其内核加载与噪声与共享夹具的「无 console error」断言及 DOM 顺序假设耦合。
- **文档站页面的浏览器回归须与夹具 E2E 分离**：新建独立 Playwright 配置（`webServer` = `docs:build` + `vitepress preview`，断言构建产物），主配置以 `testIgnore` 排除，避免夹具 project 误跑；断言期望值从登记表 / 单一事实源派生，不在用例另立清单。
- **文档站浏览器规格须成对维护两处配置**：`playwright.gallery.config.ts` 的 `testMatch`（纳入）与 `playwright.config.ts` 的 `testIgnore`（排除）必须**同时**扩展；用 `playwright test --list` 分别核对两配置的 tests / files 数。另：文件级 `test.afterEach` 依赖扩展夹具（如 `pageErrors`）时，把不依赖页面的守卫测试改到 `base`（未扩展）会因钩子参数不匹配失败——维持原 `describe` 更稳。

## 5. 验证矩阵

| 改动类型 | 最低验证 |
|----------|----------|
| 纯文档 | `pnpm lint:md` |
| 纯类型/工具函数 | `pnpm typecheck` + 定向 `pnpm test` |
| 组件逻辑/样式 | `pnpm lint` + `pnpm typecheck` + 定向测试 + `pnpm build` |
| 公共 API / 导出 / 构建配置 | 上述全部 + 全量 `pnpm test` + `pnpm build` + 产物冒烟 |
| UI 交互变更 | 上述 + `@ui-validator` 浏览器验证 |

### 5.1 浮层组件的页面稳定性（必测）

适用于涉及 portal / 模态 / 滚动锁的组件（Dialog、Select、Toast、Drawer 等）。打开与关闭前后必须记录：

- `documentElement.clientWidth` 与滚动条是否占位。Playwright 需 `ignoreDefaultArgs: ['--hide-scrollbars']` 暴露真实滚动条；headless 下可能仍不渲染，此时以 `documentElement.clientWidth < window.innerWidth` 判定占位，或改用非 headless；
- `html` / `body` 及 fixed / `100%` 视口元素的几何（`x`、`width`）；
- 遮罩的完整 bounding rect（`left` / `top` / `right` / `bottom`），判据：`left <= 0 && top <= 0 && right >= window.innerWidth && bottom >= window.innerHeight`；
- Layout Instability（CLS）是否出现非预期位移。

判定：

- `in-flow` 内容不得位移；遮罩必须完整覆盖可视区域。
- 模态锁滚动导致滚动条消失、fixed / `100%` 视口元素随视口宽度变化属**已知预期**（见[主题与样式设计 §5.1](../design/theming.md#_5-1-浮层滚动锁与布局稳定性)），须记录但不计为缺陷。容差：`in-flow` 为 0；fixed / 视口元素为实测滚动条宽（打开前 `window.innerWidth - documentElement.clientWidth`，应与 `body.paddingRight` 一致）以内。
- CLS 归因：仅由上述已知预期 fixed 几何变化贡献的部分计入基线；`in-flow` 位移或内容重排产生的 CLS 判为问题。
- 超出容差的位移、遮罩留缝（未满足覆盖判据）均判为问题。

**测量集必须包含 fixed / 视口元素与遮罩**，只测组件自身与 `in-flow` 容器会漏检。

## 6. 命令

- 全量：`pnpm test`
- 单文件：`pnpm exec vitest run <path>`
- 覆盖率：`pnpm test:coverage`
- E2E：`pnpm test:e2e`
- 可访问性：`pnpm test:a11y`（组件级 axe 审计与例外清单断言；全量 `pnpm test` 已自动包含）
- 计算样式等价：`pnpm capture:styles`（采样并与冻结基线比对，有差异 exit 1）；`pnpm capture:styles:freeze`（重写冻结基线，须随装置同提交并说明收窄 / 扩容面）
- 视觉回归基线：`pnpm test:visual`（真实渲染整体像素与仓库内冻结基线比对，有差异 exit 1）；`pnpm test:visual:update`（重写冻结基线，须随装置同提交并说明收窄 / 扩容面；基线须在与 CI 相同环境生成）

> 命令以 `package.json` 实际脚本为准，不得臆造。

### 6.1 全量首跑偶发失败的归属判定

- 先 `pnpm exec vitest run <path>` 隔离复跑该文件（超时 / 时序类用例在并行负载下可能仅偶发命中），再跑一次全量取结论；两者均通过即可判为并行竞争或环境导致的偶发失败，**与本次改动无因果**。结论与门禁声明须如实写明「首跑 N 例 flaky + 归属 + 复跑结果」，不得静默吞掉或直接改判为通过（实例：`scripts/release/generate-changelog.test.mjs` 的 git fixture 在 88 文件并行负载下 5s 超时，隔离重跑 816ms 通过）。

### 6.2 交互类断言的稳定性写法

- **禁用固定 tick 数**：`await nextTick()`（或两次 `flush()`）后立即断言，在并行负载下会读到更新前状态——Reka 的浮层挂载、roving focus 与双向 `emit` 由微任务与定时器混合驱动，单靠 tick 数不构成「已落位」的保证。
- **统一用条件轮询**：`test/helpers/settle.ts` 的 `await expectSettled(() => { expect(...) })`（默认上限 5s）。轮询只改变等待方式、不改变断言内容，超时仍失败（判别力不变）；负向对照可用「把期望值改成不可能值 → 用例须失败」验证。
- **并发与超时上限**：`vitest.config.ts` 的 `maxWorkers`（并发上限）与 `testTimeout`（须高于轮询上限）。二者是兜底，逐例的轮询修复才是主手段。
- **门禁提示**：`guard-ref-attrs` 会在改动涉及引用型 ARIA 属性时强制跑 `capture:styles`，故测试文件中出现 `aria-controls` 等字样的改动也会触发该守卫。

## 7. 容器/受限环境下的浏览器验证

部分容器会把 `/tmp` 设为不可写（如 `dr-xr-xr-x`）。Chromium 会在临时目录下创建 profile 与共享内存，此时渲染进程会直接崩溃（Playwright 报 `Target crashed`，日志含 `platform_shared_memory_region_posix.cc ... Permission denied`）。

处理方式：把 `TMPDIR` 指向可写目录，并配合 `--no-sandbox`：

```sh
TMPDIR="$HOME/.cache/chrome-tmp" pnpm exec playwright ...
```

```ts
chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
    env: { ...process.env, TMPDIR: process.env.HOME + '/.cache/chrome-tmp' },
})
```

- 校验主题 / 暗色的计算样式时：文档站（VitePress）存在过渡动画，直接读 `backgroundColor` 会落在过渡中间值；须先注入 `transition: none !important`。静态 HTML 无法复现组件视觉——SFC scoped 样式带 `[data-v-*]`，须在真实文档站验证。
  - **root 容器内交互时崩溃**（`Target crashed`，加载与既有用例同样命中）：先试 `--no-zygote`——实测可恢复且**保留多 context 能力**，已随 root 分支写入 `playwright.config.ts`。`--single-process` 虽同样绕过崩溃，但会阻止创建第二个 context，仅在 `--no-zygote` 无效时作为兜底。
- UI 验证证据（脚本、截图）落盘 `test-results/`（已 gitignore），不污染工作区；需长期留存的证据应放可提交位置或内联实测值。
- Playwright 与 Reka `RadioGroup`（RovingFocus）的键盘选中：选中在 focus 后经 `setTimeout(0)` 结算，`page.keyboard.press()` 在同 tick 内 down+up 会与选中时序竞争、误报「方向键不选中」；须用真实按键节奏（`keyboard.down` → 延时 → `keyboard.up`）。
- 验证 SSR hydration：Playwright 配本地静态服务器，以点击计数变化判定水合完成，用 `emulateMedia({ colorScheme })` 验证暗色 token。
- **E2E project 的设备与动效基线**：名为 mobile / tablet 的 project 应使用对应设备描述符（如 `Pixel 5` / `Galaxy Tab S4`）再覆盖 viewport——`devices['Desktop Chrome']` 会带入桌面 UA / screen；布局断言宜统一以 `reducedMotion: 'reduce'` 运行（入场动画的 `scale` 会让 `boundingBox()` 读到中间尺寸），代价是默认动效路径失去常驻覆盖，须在配置注释与 Backlog 双向登记。
- **几何断言的容器口径**：容器的「可视区」取 client rect（`getBoundingClientRect()` + `clientLeft` / `clientTop` + `clientWidth` / `clientHeight`）；`boundingBox()` 是 border box，直接当可视区用会多出边框宽。
- **真实页面验证与合成夹具互补**：夹具给可判定的几何数值，真实页面（文档站产物预览）额外暴露宿主侧效应（外壳最小宽、主题 / 表格重置）；两者数值有差时应逐项归因，再判是否为组件缺陷。
- **判别「上游行为 vs 组件缺陷」**：用**无组件 CSS 的纯 HTML 夹具**复现同构几何，可把结论钉死在上游（如 Chromium 焦点滚动只在聚焦元素与滚动区完全不相交时介入）。
- **一次性 V 夹具必须引入库样式入口**（如 `import '@/styles/index.css'`）：只 import 组件时 `var(--caomei-*)` 未定义，触发 invalid at computed-value time——遮罩底色算成 `rgba(0,0,0,0)`、`color` 回退继承，几何断言会全过而颜色断言失真。**新增 CSS import 后须重启 Vite dev server**（HMR 不加载新 import）。
- **判定「既有问题 vs 本批回归」用未改动同类页对照**：新页 / 新档位命中某现象时，先看未改动的同类页是否同样命中（同根因即归入既有观察项并登记 Backlog，不判本批缺陷）。
- **证据脚本要落盘可复现产物**：一次性探针除 `console.log` 外须 `writeFileSync` 落盘 JSON，并输出记录中引用的**原始数值**（rect 的 `x/right/width`、计数、布尔），而非只给布尔摘要；取整与记录的小数位对齐或注明。
- **浏览器面板 / 视觉通道不可用时仍可取证**：把一次性 Playwright 脚本放进仓库内 **gitignored 目录**（如 `test-results/`，bare specifier 可解析到 `node_modules`），用 `getComputedStyle` / `getBoundingClientRect` 做几何与样式断言、本地 OCR 佐证文案渲染，并在记录中显式登记「未做像素级比对」。
- **探针读取参与 `transition` 的属性（`box-shadow` / `background-color`）必须等过渡结束**：聚焦后立即读会取到插值中间态（如 `oklab(0 0 0 / 0) 0px 0px 0px 0px`）；基线 / 后测「双错同形」会得到 **0 差异的假证据**。做法：聚焦后 `sleep(250)`（或注入 `transition: none !important`）再读，并用负向对照（改一个取值 → 必须报差异）证明探针灵敏。
- **聚焦态采样必须把 `focus()` 打在真实可聚焦元素上**：落在包装层（如 `.caomei-input-group > *`）不会触发 `:focus-within`，采样会静默拿到「未聚焦」值。状态类采样须逐条核对「触发元素」，而非只核对「读取元素」。
- **`:focus-visible` 不随程序化 `focus()` 命中**：需一次真实键盘交互（如方向键）后才生效；断言焦点环 / `outline` 前须补键盘动作。同理，`div[role=button]` 的 roving tabindex 只有「当前项」可聚焦（如日历仅「今日」`tabindex=0`）。
- **DOM 属性快照须剔除无语义易变属性**：`data-v-*`（Vue scoped 哈希）跨构建必然变化；Reka / 上游 `useId` 的实例计数器（如 `reka-dropdown-menu-content-v-42`）会随夹具中组件数量与挂载顺序漂移，使 `aria-controls` / `id` 被报成差异。过滤口径：**归一计数、保留名称**（`-v-\d+` → `-v-*`），这样「`aria-controls` 指向哪一类面板」仍可断言。diff 工具须按属性名逐项比较，值序列化为**单属性对象**（字符串会被按字符索引展开成上百条假差异）。
- **瞬时元素的采样必须排在交互型采样之前**：面板开合等交互会「偷走」自动消失元素的采样窗口（toast 默认时长内消失 → `waitForFunction(length >= N)` 超时、该项静默缺失，且两次采集同缺 → diff 仍报 0 差异，属**假通过**）。做法：瞬时元素先采，或交互后重新触发；采集结束须检查 `errors` 为空。
- **计算样式 A/B 复用同一夹具**：夹具的 `test/capture/fixture/vite.config.mjs` 支持以 `CAOMEI_SRC` 指向 `HEAD` worktree，可在同一夹具下采集改动前 / 改动后。**worktree 没有 `node_modules` 时页面空白、`waitForSelector` 超时**（解析不到 `reka-ui` 等依赖）——`ln -s <repo>/node_modules <worktree>/node_modules` 即可。
- **表格列「不渲染单元格」会破坏 `table-layout: auto` 的列对齐**：body 行少一个 `td` 时浏览器把后续单元格映射到前 N-1 列，数据整体左移；happy-dom 无布局引擎，单测全绿也发现不了。列隐藏 / 占位类改动必须在真实浏览器取**逐列 x 区间**作证据（空白占位修复后 0 偏差）。
- **登记表驱动的「策展子集」页面，断言以登记表实际成员为参照**：画廊 / 组件总览按登记表渲染且**只登记部分组件**，用「A 与 B 之间」或完整组件集定位新项会必然失败；应断言**该组实际相邻成员序列**（或先读登记表得出预期再比对）。「顺序不变式」类断言同样以登记表为事实源。
- **容器内 `vitepress preview` 可能对所有页面 crash（含 `/`）**：dev 服务（`docs:dev`）真机正常，但 `docs:build` + preview 下 Chromium 报 `Page crashed`（`domcontentloaded` 也崩，`--no-sandbox` / 降等待策略均无效）——属**环境限制而非改动缺陷**。可行替代：对 SSG 产物 HTML 做静态断言（卡数 / 卡名 / 顺序 / 链接 / 组件 SSR 节点与文本），并与 dev 真机的 hydration 后行为互补；结论须声明该边界，不要把 build 面记为「已浏览器验证」。
- **夹具宿主的最小宽会顶宽「移动端模拟」的布局视口**：`min-width: auto` 的 flex 项内禀最小宽会把 `isMobile` project 的布局视口顶宽，使极窄探针（如 200px 下浮层可用宽收敛）因 `clientWidth` 变大而失去判别力；给宿主（含直接子元素）加 `min-width: 0` 可消除。判别方式 = 临时诊断脚本读 `document.documentElement.scrollWidth` 与最大右缘元素。

## 8. 组件测试写法

- VTU 无法从 props 推断泛型 SFC 的类型参数 `T`（会退化为 `object`）；测试内需 `Component as unknown as DefineComponent<Props<Row>>` 具体化，模板使用不受影响。
- Reka 增减按钮使用 `pointerdown` / `pointerup`：测试用 `trigger('pointerdown')` 而非 `trigger('click')`；拖出按钮后的 `pointerup` 监听在 `window`。
- `trigger('keydown.enter')` 派发的 `event.key` 为小写 `'enter'`，与 Reka 比较的 `'Enter'` 不符；应使用 `trigger('keydown', { key: 'Enter' })`。
- VTU 测试受控组件需同时传 `modelValue` 与 `onUpdate:modelValue` 监听：Vue `useModel` 的 `hasVModel` 要求 prop 与 listener 同时存在，仅传 prop 会回落非受控并本地更新。
- Reka 触发方式差异：`TabsTrigger` 激活在 `mousedown`（RovingFocus 体系），`AccordionTrigger` / `DropdownMenuTrigger` 在 `click`；单测派发的事件类型须分别匹配。
- Reka `DismissableLayer` 的 `onKeyStroke('Escape')` 挂在 window；happy-dom 下 document 级派发不稳定，应在浮层内容元素上派发 `bubbles: true` 的 keydown。
- happy-dom 的文件输入 `value` 恒为 `''`，无法验证「选择后复位 value」；需在实例上定义 `value` setter 记录赋值行为。
- happy-dom 无布局引擎：`scrollHeight` / `clientWidth` 需用 `Object.defineProperty` 注入；`ResizeObserver` 可 stub 以捕获回调，断言「同宽不重测、变宽才重测」。
- happy-dom 事件需 `cancelable: true`，`preventDefault()` 才会置 `defaultPrevented`（Reka `DismissableLayer` 依该标志决定是否 dismiss）；`closeOnEsc` / `closeOnOverlay` 的行为断言要传 `cancelable: true` 并断言 `update:open`；`pointerdown` 外部点击监听在 `setTimeout(0)` 后注册，需先等一个宏任务再派发。
- 颜色 / 几何类控件的断言须位置与数值敏感：在 0×0 元素上点击其 50% 等同于点在最左端（hue=0），「颜色变了」这类弱断言会给出假阳性；应断言 `aria-valuenow`、thumb 几何与程序值 / 播报值一致。
- 需同时断言插槽内容与作用域参数时，插槽必须用渲染函数（如 `slots: { list: (props) => h('div', props.items.length) }`）；VTU 的字符串插槽拿不到作用域参数，写了也只会得到假阳性。
- **焦点类用例需 `mount(..., { attachTo: document.body })`**：happy-dom 下未挂到 document 的元素无法成为 `document.activeElement`，`focus()` 断言恒为 `body`；挂载后「未聚焦打开 → 关闭回焦」这类路径才可判定。
- **异步落位的 DOM / 焦点断言用条件轮询**（`await vi.waitFor(() => { expect(...).toBe(...) })`），不要猜 `nextTick` 数——固定等待在重负载下会 flake。
- **不要用 `document.body.innerHTML = ''` 清理 teleport 内容**（组件 `attachTo: document.body` 时）：Vue 持有的锚点被移除会在卸载阶段抛 `Cannot read properties of null (reading 'nextSibling')`；Portal 清理交给 `enableAutoUnmount(afterEach)`，或 `unmount()` 后按选择器删具体节点。
- **断言要挑「随实现变化而变」的量**：上游无条件输出的属性（如 `RovingFocusItem` 的 `tabindex="-1"`）恒真，应改为断言行为（聚焦后按键、`document.activeElement` 迁移路径）；集合类断言须先断言长度，`.every()` 在空集合上恒真。
- **可访问名 / 不透明度等要断言「有效值」而非元素自身值**：`opacity` 沿祖先链连乘（`0.6 × 0.6 = 0.36`）、Reka 会把 `calendar-label` 合成为「日历, <月份>」；只断言属性字符串会漏检，须用 role+name 查询、`ariaSnapshot` 或 CDP AX 树取证。
- **VTU `trigger` 的修饰键结论与 `key` 相反**：`trigger('click', { metaKey: true })` **能**设置修饰键（options 进 `getEventProperties` 的 init dict，`new MouseEvent('click', { metaKey: true })` 生效），`trigger('click.meta')` 亦可（systemModifiers → `metaKey`）——与本节前文「点号修饰符会把 `key` 置为小写」的结论**相反，不可类推**；`key` 小写的成因与修法（改传 `{ key: '…' }`，Reka TagsInput 的 `Backspace` 即此语境）见前文。
- **受控组件测试必须区分「受控」与「自持」两种累积路径**：受控模式下点击只抛事件、状态来自 prop，**父级不回写时多次点击不累积**（每次从 prop 现值出发）；「连续点击累积」类断言只能在自持模式或显式 `setProps(emitted)` 回写后成立，断言渲染结果时也须先回写再断言。同理，`defineModel` 下「传 `modelValue` 但不监听 `update:modelValue`」仍会立即反映到渲染，断言「受控不回写 → 渲染冻结」必然失败（语义见[开发规范 §5](./development.md#_5-vue-组件准则)）。
- **依赖 collection 注册表的键盘交互须等一个 tick**：Reka `useCollection` 的 `collectionRef` 在异步 watch（pre-flush）中赋值，`getItems()` 在未就绪时**直接返回 `[]`** → 挂载后立即派发依赖 collection 的键盘交互（如 TagsInput 的 Backspace 选中 / 删除）会静默无效（无异常、`preventDefault` 未调用、状态不变）。单测须在 `mount` 后 `await nextTick()` 再派发；排查「派发了但毫无反应」时先查依赖的注册表是否已就绪。

## 9. 反模式

- 只追求覆盖率数字、不做有效断言。
- 用 `skip` / `only` 长期停留在提交中（临时调试需在提交前移除）。
- 测试依赖执行顺序或外部网络。
- 把「命令跑过了」当作「测试通过」的结论。

## 10. 守卫型测试的写法

- 「标记表 + 样例」型守卫（如 `check-nuxt.mjs` 的 `CSS_MARKERS` 与 `check-nuxt.test.mjs` 的样例 CSS）互为牵制：新增标记必须同步样例，否则单测立即失败；反之新增 marker 时补 fixture + 断言，可把「链路可用」从推理升级为实测。
- 校验机器格式化源码的守卫用**严格正则 + 遇未知行抛错**（不静默跳过），并把格式前提与 lint 规则绑定；按扩展名扫目录时须排除同目录 `*.test.ts`，否则第一个为该目录加单测的人会收到指向错误的报错。
- 由注册表派生的公开联合类型扩展后，d.ts 冒烟须带**负向对照**（`@ts-expect-error` 下未注册值应报错），否则「通过」无法区分「类型被放宽」与「类型正确」。
- **几何类常驻用例必须守卫自己的前置条件**：先构造状态（如把容器滚到末尾）再硬断言该状态成立（`expect(wasFullyOutside).toBe(true)`），否则夹具一改用例即静默恒真；夹具几何要留可判定余量（内容总宽明显超出容器，而非刀刃值），无判别力的用例应删除并在注释写明机制同源。
- 断言只覆盖一个轴会漏检另一轴：允许换行 / 滚动的容器除横向口径外必须同时断言 `scrollHeight <= clientHeight + 1` 与「成员 rect 落在容器 client rect 内」。
- **清单 / 枚举类内容的断言覆盖全集而非抽样**：迁移节的「未实现清单」等应把关键词集合与清单条目一一对应并用 `.every()` 断言（只取 2 个词会被判粒度过窄、无法防回退）。
- **选择器 / 括号分析类守卫须先剥离属性选择器引号内容**（`replace(/"[^"]*"|'[^']*'/g, '""')`），否则 `[data-x="where("]` 会干扰括号配对判定；生效性证据的固定形态是「注入一条反例 → 守卫 exit 1；还原后 `git diff --stat` 零输出且重新 exit 0」（负向验证的一般要求见 [AI 协作规范 §3.5](./ai-collaboration.md#_3-5-3-轮未过的改进协议-先缩面、再防复发、缺信息先取证)，本节只承载测试面细化）。
- **门禁脚本的「抗静默收窄」+「允许名单反向校验」标准手法**：受检文件数**下界** + 关键前缀覆盖（缺一即失败）+ 空扫描拒绝；允许名单逐条断言「文件存在 + 仍含被放行形态」（防清单腐烂）；允许名单与相邻守卫的同类登记表用**集合相等断言**机检，消除第二事实源漂移。参照 `scripts/docs/check-interpolation.mjs`。
- **单个 `describe` 回调超过 600 行会撞 `max-lines-per-function`**：给既有测试文件追加一组用例时若外层 `describe` 溢出，应把该组提为同文件**顶层 `describe`** 或落独立测试文件；`eslint --fix` 只修缩进、不会搬文件，拆分后须同步 import（漏 `nextTick` 等会得到一次假失败）。
- **本地态留痕的阻断守卫必须能区分「本地」与「CI」**：CI 洁净检出无工件，强行阻断必然误报；守卫应在 `CI` 环境 / 工件目录缺失 / 受检范围为空时跳过，只接入本地 `pre-commit`、**不接入** `verify` / CI。阻断判据取「工件 mtime ≥ 受检范围最新文件」的新鲜度（确定性）优于内容匹配。
- **内容豁免类守卫按 hunk 体采集、豁免清单用仓库根精确路径**：按 `+` / `-` 前缀过滤会把以 `++` / `--` 开头的**真实内容行**一并吞掉，击穿「全部为某形态」的不变量；豁免判定须改用全量 `--name-status` 并校验状态全为 `M`、范围与全量暂存集一致；文件清单用仓库根精确路径而非 `basename`（否则嵌套同名文件被一并放行）。对应测试每条只暂存单个文件，否则判别力被 `entries.length !== scope.length` 掩盖。
- **扩展守卫的形态覆盖会暴露新的存量违规**：「零豁免」裁定下必须同批一次性收口，否则守卫在中间提交失败；扩形态前先对全历史与既有资产采集写法（语料矩阵驱动）。
- **跨文件清单联动用「JSON 单一事实源 + 双向对账」**：E2E 受检清单与声明层守卫共用一份 JSON（Playwright 经 import attribute、守卫经 `readFileSync`、单测经守卫函数读，三处同一文件），守卫**双向对账**（缺项 `missing` + 多项 `stale`）并对例外名单反向校验——新增消费点未补清单即 `governance:check` exit 1，且清单不可能被静默收窄。**通用判据**：凡「A 处声明、B 处列举」的成对载体，若 B 是测试清单，就抽成单一 JSON + 双向对账，而非两边各写一遍下界常量。
- **对账类守卫的「命中任一即视为已登记」口径会产生假阴性**：复合名（`A / B`）里塞一个拼写错误 / 未登记名会静默逃逸，与「对账**成员集合**」的宣称不符。凡守卫宣称「对账集合」，就必须校验集合的**全部元素**；为容忍合法例外而放宽时，例外须显式列名并受反向校验，不能退化为「部分命中即通过」。
