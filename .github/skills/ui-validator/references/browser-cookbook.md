# 浏览器验证实操手册（references）

> 沉淀自 caomei-ui 历次真机验证（VitePress 1.6.4 / Playwright + Chromium），同类经验条目见[经验归档](../../../../docs/design/governance/experience-archive.md)。本文件只承载 **how-to**；判定标准与阈值以 [测试规范](../../../../docs/standards/testing.md) / [主题与样式设计](../../../../docs/design/theming.md) 为准，命令与选择器如随版本失效请就地更新本文件，不要把细节写回 SKILL.md 正文。

## 1. 入口与端口

| 场景 | 命令 | 说明 |
| --- | --- | --- |
| 库源码改动 | `pnpm docs:dev` | 默认 5173；端口被占时 VitePress 自动顺延（注意实际端口，别对着旧进程断言） |
| 构建产物 / SSG 行为 | `pnpm docs:build` → `pnpm docs:preview` | preview 默认 4173，**服务的是既有 dist**；改完必须重新 build。脚本无端口参数，需要时用 `pnpm exec vitepress preview docs --port <port>`（VitePress 1.6.4 的 preview 不消费 `--host`，监听地址由 `listen` 决定；只有 `docs:dev` 支持 `--host`） |
| playground / 下游集成 | `pnpm dev` 或下游项目入口 | 组件尚无文档页、或验证对象是集成行为时使用 |

- 清场：按端口取 PID 后精确终止——Linux / WSL2 用 `ss -ltnp | grep <port>` 取 PID 后 `kill <pid>`；macOS 用 `lsof -ti:<port>` 后 `kill <pid>`；Windows 用 `netstat -ano | findstr LISTENING | findstr :<port>` 取 PID 后 `taskkill /PID <pid> /F`（或 PowerShell `Stop-Process -Id <pid>`）。`findstr :5173` 会子串命中 `:51730`，故需先过滤 `LISTENING` 再精确比对端口。
- 不要用 `pkill -f "vitepress preview"` 清场：该模式不匹配真实进程名（`vitepress.js preview`），却可能命中 `pnpm exec vitepress preview …` 包装进程与执行它的 shell 自身，得到「看似成功但目标仍在 / 会话被挂起」的结果。
- 上一 session 遗留进程的典型症状：端口不匹配报「新页面 404」、或断言到旧产物得到与源码相反的结论。
- dev 模式服务的是 SPA 外壳（`<div id="app">`），侧栏 / 正文不在原始 HTML 中，必须浏览器内断言；`docs/.vitepress/dist/**/*.html` 是 SSR 产物，可直接 grep 做静态交叉验证。
- 修改被 `defineProps<ImportedType>()` 引用的 `types.ts` 后，dev 可能给出半陈旧 HMR 产物（模板已用新 prop、`defineProps` 未更新）：行为异常先重启 dev server 再排查源码。

## 2. 浏览器启动

```js
// 与仓库既有取证脚本一致（test-results/*-validate.mjs）
const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
```

- `--single-process` 的取舍与优先级：**默认不加**；仅在容器内 headless Chromium 崩溃时才加（[测试规范](../../../../docs/standards/testing.md) §7 的环境建议）。加了之后 `newContext()` 仍可成功，但无法在该 context 创建页面（`newPage` 报 Target closed），因此**只适用于单 context 取证脚本**。
- 容器 / CI 环境需保证 `TMPDIR` 可写。
- 真实滚动条：`chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] })`；headless 下仍可能不渲染，此时按[测试规范](../../../../docs/standards/testing.md) §5.1 的判定口径改用 `window.innerWidth - document.documentElement.clientWidth`。

## 3. 等待与断言基座

- hydration 完成后再断言 / 点击：轮询 `#app.__vue_app__` 出现（dev 与 prod 构建均设置该方法）；也可用「点击 → 计数变化」判定，避免首轮点击被吞。
- 交互 demo 默认包在 `<ClientOnly>`（服务端只输出占位），显式 `ssg="true"` 的 demo 才有首屏静态内容。
- 断言取实测值而非布尔感觉：几何（boundingRect、`scrollWidth`）、computed style（如 `getComputedStyle(el).borderTopColor`）、`aria-*`、与播报值一致。
- 颜色 / 档位类断言要数值敏感：「颜色变了」这类弱断言在 0×0 元素、错索引元素上都会假阳性。

## 4. 文档站结构选择器速查（VitePress 1.6.4）

| 目标 | 选择器 / 入口 | 备注 |
| --- | --- | --- |
| 侧栏（桌面） | `.VPSidebar` | **滚动容器就是它本身**（`overflow-y: auto`），不是 `.VPSidebar nav` |
| 侧栏（移动抽屉） | `VPLocalNav` 的 Menu 按钮打开 | 导航栏汉堡打开的是另一套 `VPNavScreen`，两者不是同一菜单 |
| 组件 demo 容器 | `.vitepress-demo-plugin__container`（外壳）、`.vitepress-demo-plugin-preview`（预览区）、`.vitepress-demo-plugin-source`（源码区） | 演示动画覆盖层的目标容器 |
| demo 行索引 | 页面内 `.demo-row` 顺序 | 断言前必须与该页 demo 顺序逐项核对，索引错位会验证到无关组件（[文档与演示站设计 §5](../../../../docs/design/documentation-site.md)） |
| 文档表格 | `.vp-doc table` | 默认 `display: block`（便于横向滚动），组件表格由文档层还原为 `display: table`；断言表格几何前先确认这一点 |
| 语言菜单 | 桌面 / 平板 / 移动三处菜单共用 `theme/composables/langs.ts` | 语言切换落点回归见 `pnpm docs:check:i18n-routing`（产物级守卫） |

## 5. 主题与动效模拟

- 暗色：`page.emulateMedia({ colorScheme: 'dark' })` **加上**站点自身 appearance（VitePress 用 `html.dark` + localStorage 键 `vitepress-theme-appearance`）；只设其一可能得到混合态。
- reduced-motion：`page.emulateMedia({ reducedMotion: 'reduce' })` 与默认各测一次同一元素的 `getComputedStyle(el).animationDuration`。
  - VitePress 默认主题在 reduced-motion 下对 `*` 注入 `animation-duration: 1ms !important` 与 `transition-duration: 0s !important`，会把演示区动画压平；这属于文档站行为，**不是组件缺陷**（组件库自身在 reduced-motion 下主动关动画是正确的无障碍行为）。机制见[文档与演示站设计 §9](../../../../docs/design/documentation-site.md)。
  - 文档站现状：`docs/.vitepress/theme/motion.css` 只恢复**加载态**动画（ProgressSpinner / indeterminate ProgressBar / Skeleton），按组件类名在**全站**生效、未限定 demo 区域；「演示区域入场动画 opt-in」尚未落地（属[待办](../../../../docs/plan/todo.md)中的文档站演示动画条目）。在它落地前，入场 / 过渡动画在 reduced-motion 下仍被压平属预期；落地后须回来更新本节并补「demo 内恢复 / demo 外压平」的双上下文断言。
- CSS variables 覆盖验证要包含「覆盖为 `none`」与自定义值两种，并确认覆盖写在正确的元素层级（部分 token 的默认值声明在字段外层，写在触发器上不生效——见 [Select 组件文档](../../../../docs/components/select.md) 的宽度说明与[主题与样式设计 §4.1](../../../../docs/design/theming.md)）。

## 6. 浮层稳定性测量集

测量集、判定基线与容差阈值**以[测试规范](../../../../docs/standards/testing.md) §5.1 为唯一权威**（本文件不重复条款）：按 SKILL.md Step 2.5 执行，机制与决策背景见[主题与样式设计 §5.1](../../../../docs/design/theming.md)。

- 取证脚本需采集的量值类别：视口宽度与滚动条占位、fixed 与 `100%` 视口元素几何、遮罩 bounding rect、`in-flow` 元素文档坐标、CLS 条目。
- 建议按「打开前 / 打开后 / 关闭后」三次采样后统一断言，便于评审复核同一口径。

## 7. 移动端

- 默认 375 / 390：打开侧栏抽屉后断言组标题与条目顺序、长标题不溢出（`scrollWidth <= clientWidth + 1`）、滚到底部末组完整可见、暗色下文本对比度达 AA。
- 抽屉 / 全屏浮层类组件另测遮挡与关闭路径（Esc、遮罩点击、焦点回归）。

## 8. 常见坑

- 断言在错误端口 / 旧产物上执行（见 §1）。
- 未等 hydration 就点击，首轮被吞后得出「交互失效」的假结论。
- 把文档站 reduced-motion 压平当成组件动画缺陷（见 §5）。
- 把观察项计成问题、或反过来把问题写成观察项，导致评审对风险级别误判。
- 取证脚本在单 context 场景误加 `--single-process` 后报 Target closed，被当成环境故障排查（见 §2）。
- 证据只剩 gitignored 目录里的路径（违反[测试规范 §2.1](../../../../docs/standards/testing.md) 的可追溯要求），评审与归档无从复核。
