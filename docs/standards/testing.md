# 测试规范

本文档定义 caomei-ui 的测试分层、覆盖要求与验证矩阵。

## 1. 测试分层

| 层级 | 工具 | 目标 |
|------|------|------|
| 单元测试 | Vitest + @vue/test-utils | 组件 props / emits / slots 行为、composables 逻辑、纯函数 |
| 组件交互 | Vitest（必要时 browser mode） | Dialog / Select 等真实 DOM 交互 |
| 可访问性 | axe-core（可选） | 关键组件 a11y 断言 |
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

## 3. 覆盖率

- 目标覆盖率：**≥ 80%**（Statements / Branches / Functions / Lines）。
- 不牺牲断言有效性换取数字增长；禁止无断言的占位测试。

## 4. 测试文件组织

- 测试文件与被测源码同目录或集中在 `test/`，命名 `*.test.ts` / `*.spec.ts`。
- 组件测试命名：`<component>.test.ts`。
- E2E 集中在 `test/e2e/`，命名 `*.e2e.ts`。

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

## 8. 组件测试写法

- VTU 无法从 props 推断泛型 SFC 的类型参数 `T`（会退化为 `object`）；测试内需 `Component as unknown as DefineComponent<Props<Row>>` 具体化，模板使用不受影响。
- Reka 增减按钮使用 `pointerdown` / `pointerup`：测试用 `trigger('pointerdown')` 而非 `trigger('click')`；拖出按钮后的 `pointerup` 监听在 `window`。
- `trigger('keydown.enter')` 派发的 `event.key` 为小写 `'enter'`，与 Reka 比较的 `'Enter'` 不符；应使用 `trigger('keydown', { key: 'Enter' })`。
- VTU 测试受控组件需同时传 `modelValue` 与 `onUpdate:modelValue` 监听：Vue `useModel` 的 `hasVModel` 要求 prop 与 listener 同时存在，仅传 prop 会回落非受控并本地更新。
- Reka 触发方式差异：`TabsTrigger` 激活在 `mousedown`（RovingFocus 体系），`AccordionTrigger` / `DropdownMenuTrigger` 在 `click`；单测派发的事件类型须分别匹配。
- Reka `DismissableLayer` 的 `onKeyStroke('Escape')` 挂在 window；happy-dom 下 document 级派发不稳定，应在浮层内容元素上派发 `bubbles: true` 的 keydown。
- happy-dom 的文件输入 `value` 恒为 `''`，无法验证「选择后复位 value」；需在实例上定义 `value` setter 记录赋值行为。

## 9. 反模式

- 只追求覆盖率数字、不做有效断言。
- 用 `skip` / `only` 长期停留在提交中（临时调试需在提交前移除）。
- 测试依赖执行顺序或外部网络。
- 把「命令跑过了」当作「测试通过」的结论。
