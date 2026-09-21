# 测试规范

本文档定义 caomei-ui 的测试分层、覆盖要求与验证矩阵。

## 1. 测试分层

| 层级 | 工具 | 目标 |
|------|------|------|
| 单元测试 | Vitest + @vue/test-utils | 组件 props / emits / slots 行为、composables 逻辑、纯函数 |
| 组件交互 | Vitest（必要时 browser mode） | Dialog / Select 等真实 DOM 交互 |
| 可访问性 | axe-core（happy-dom） | 组件级 a11y 断言（受检面 = 组件族根组件，对外导出穷尽登记；见 [M4-1 记录](../design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md)） |
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

### 2.1 纯样式修复的回归验证

涉及 CSS 级联 / 特异性的修复（如 `:focus-within` 覆盖状态边框色），jsdom / happy-dom 不计算 scoped CSS，无法在单元测试中复现。此类修复以 `@ui-validator` 浏览器验证作为回归证据，必须记录关键 computed style 的实测值（如 `border-top-color`）；证据须可追溯（落盘到仓库内可提交的位置，或在提交信息中内联实测值），不得仅指向会被清理或被忽略的临时目录。
- **样式治理类改动**（档位 `:where()` 归一化、同规则声明去重、触发器结构收敛、token 归并）的计算样式等价由 `test/capture/` 的采集装置举证：`pnpm capture:styles` 一条命令重跑并与仓库内冻结基线逐属性比对，取代一次性脚本。装置只覆盖**声明式样式面**（采样面与未纳入面的登记见治理记录），不替代 §5.1 的浮层稳定性断言与常驻 E2E 的几何断言。

## 3. 覆盖率

- 目标覆盖率：**≥ 80%**（Statements / Branches / Functions / Lines）。
- 不牺牲断言有效性换取数字增长；禁止无断言的占位测试。

## 4. 测试文件组织

- 测试文件与被测源码同目录或集中在 `test/`，命名 `*.test.ts` / `*.spec.ts`。
- 组件测试命名：`<component>.test.ts`。
- E2E 集中在 `test/e2e/`，命名 `*.e2e.ts`。
- 计算样式等价装置集中在 `test/capture/`：`fixture/` 是独立 Vite 应用（被测对象为 `src/` 源码，端口 `4521`），`capture.mjs` / `diff.mjs` 为采集与比对运行器，`baseline.json` 为**冻结基线**（生成物，随装置同提交）。夹具的 `data-cap` 标记与运行器的采样面声明一一对应，采集结束按声明自检受检面（缺失 / 选择器未命中即失败），避免受检范围被静默收窄。
- E2E 夹具（`test/e2e/fixtures/`）是独立 Vite 应用，被测对象为 `src/` 源码（而非构建产物或文档站）；由 `playwright.config.ts` 的 `webServer` 拉起（`127.0.0.1:4501`，端口固定），三个 project 对应[响应式设计 §4](../design/responsive.md) 的验收视口，几何断言基座在 `test/e2e/helpers/`。

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
- 计算样式等价：`pnpm capture:styles`（采样并与冻结基线比对，有差异 exit 1）；`pnpm capture:styles:freeze`（重写冻结基线，须随装置同提交并说明收窄 / 扩容面）

> 命令以 `package.json` 实际脚本为准，不得臆造。

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
