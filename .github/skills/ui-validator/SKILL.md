---
name: ui-validator
description: 任何可见 UI 改动、组件渲染、交互、样式、响应式、暗色模式与浏览器侧回归验证都应使用。它负责在真实页面中验证实际渲染效果，而不是只看代码。用户提到 UI validate、screenshot、browser check、responsive、dark mode、视觉回归、滚动锁、滚动条消失、页面布局跳动、CLS、宿主页面稳定性、文档站或演示页验证、验证记录与浏览器取证脚本（非 E2E 套件）时都应触发。
metadata:
  internal: false
---

# UI Validator

铁律：以真实浏览器渲染为准；不以代码推断替代实际验证；证据（截图 / 关键实测值 / 取证脚本）必须可追溯——原始证据可落 gitignored 目录，但结论与关键实测值必须回写**已纳入版本控制**的位置（如 `docs/design/governance/**`、`docs/plan/**` 等文档，或提交信息）；`test-results/`、`artifacts/`、`docs/.vitepress/dist/` 均被 `.gitignore` 忽略，不得作为唯一落点，依据见[测试规范 §2.1](../../../docs/standards/testing.md)。

## 工作流

- [ ] Step 1: 准备验证环境 ⚠️ REQUIRED
  - [ ] 1.1 确认被测 revision 与入口：库源码改动用 `pnpm docs:dev`（默认 5173）；需验构建产物 / SSG 行为用 `pnpm docs:build` + `pnpm docs:preview`（4173）；组件尚无文档页、或需验 playground / 下游集成时用 `pnpm dev` 或下游项目入口。页面与示例约定见[文档与演示站设计](../../../docs/design/documentation-site.md)。
  - [ ] 1.2 端口先清场：按端口取 PID 精确 kill 后再启动（Linux / WSL2 用 `ss -ltnp`，macOS 用 `lsof -ti:<port>`，Windows 用 `netstat -ano | findstr :<port>`）；不要用 `pkill -f`——它可能匹配到执行它的 shell 自身。上一 session 遗留的 dev / preview 进程会静默服务旧产物或抢占端口——「新页面 404 / 改动静默不生效」先怀疑它。
  - [ ] 1.3 记录源码 mtime 与 revision，验证期间不得改源码；窗口内出现新 delta 时旧证据失效，须重跑而非沿用。
  - [ ] 1.4 列出受影响页面（含中英两侧）与示例索引：`.demo-row` 顺序须与实际页面核对，索引错位会验证到无关组件。
- [ ] Step 2: 渲染验证 ⚠️ REQUIRED
  - [ ] 2.1 断言前等 hydration 完成（如 `#app.__vue_app__`），否则首轮点击被吞造成假失败。
  - [ ] 2.2 确认无样式错位，且 console error / pageerror / HTTP ≥ 400 均为 0。
  - [ ] 2.3 关键交互逐个验证；断言须位置 / 数值敏感，「值变了」这类弱断言会给出假阳性。
- [ ] Step 2.5: 宿主页面稳定性（浮层 / portal / 滚动锁改动必测；其余改动须显式声明跳过并给理由）
  - [ ] 2.5.1 记录打开 / 关闭前后的 `documentElement.clientWidth`、滚动条是否占位（Playwright 关闭 `--hide-scrollbars` 暴露真实滚动条）、`html` / `body` 与 fixed / `100%` 视口元素几何，以及遮罩完整 bounding rect（判据 `left <= 0 && top <= 0 && right >= innerWidth && bottom >= innerHeight`）。
  - [ ] 2.5.2 断言遮罩完整覆盖、`in-flow` 不位移；fixed / 视口元素因滚动条消失产生的宽度变化在「实测滚动条宽」以内属已知预期，记录但不判缺陷。
  - [ ] 2.5.3 超出容差的位移、遮罩留缝，以及 `in-flow` / 内容重排产生的 CLS 判为问题；机制与判定基线见[测试规范](../../../docs/standards/testing.md) §5.1 与[主题与样式设计](../../../docs/design/theming.md) §5.1。
- [ ] Step 3: 响应式 ⚠️ REQUIRED
  - [ ] 3.1 桌面 / 平板 / 移动三档：默认 1440 / 390，另加一档取 md–lg 区间内的值（如 834）；项目断点为 640 / 768 / 1024，1024 恰是 `lg` 边界、跨档语义需显式标注。窄屏另记 `scrollWidth <= clientWidth + 1` 无横向溢出。
  - [ ] 3.2 窄屏降级行为（卡片化、全屏化、抽屉侧栏）与长文本溢出 / 截断。
- [ ] Step 4: 主题 ⚠️ REQUIRED
  - [ ] 4.1 亮 / 暗两态；文档站需同时设 `emulateMedia({ colorScheme })` 与站点 appearance。
  - [ ] 4.2 CSS variables 覆盖是否生效（含覆盖为 `none` / 自定义值的场景）。
  - [ ] 4.3 动画 / 过渡类改动做双上下文实测：默认与 `emulateMedia({ reducedMotion: 'reduce' })` 各测一次 `getComputedStyle`，用于区分「组件缺陷」与「文档站在 reduced-motion 下的强制压平」。
- [ ] Step 5: 可访问性抽检
  - [ ] 5.1 键盘可达、焦点可见、ARIA 语义与可访问名（含 locale 本地化）。
- [ ] Step 6: 输出与交接 ⚠️ REQUIRED
  - [ ] 6.1 按[references/evidence-record.md](./references/evidence-record.md)输出验证记录（范围 / 结论 / 复现方式 / 逐项结论 / 观察项 / 未覆盖边界 / 截图清单）；原始记录与截图落 `test-results/`，结论与关键实测值按铁律回写已纳入版本控制的位置（文档或提交信息）。
  - [ ] 6.2 结论分三类——通过 / 问题 / 观察项（OBSERVE）；观察项必须给出归因（上游行为、本次变更、已登记 follow-up），不得与「问题」混计。
  - [ ] 6.3 保留可复跑脚本（`test-results/<scope>-validate.mjs`），不接受只有人工操作的结论。
  - [ ] 6.4 视觉通道不可用（浏览器面板无法驱动、vision 服务报错）时，必须显式声明「布局美观度未经视觉确认，仅几何与对比度断言」并给出截图路径供人工复核，不得宣称视觉通过。
  - [ ] 6.5 问题回 `@frontend-developer`；通过后交 `@test-engineer`，并给出建议沉淀的回归断言清单。

> 启动参数、hydration 等待、真实滚动条、暗色与 reduced-motion 模拟、文档站结构选择器与移动端抽屉等具体做法，见 [references/browser-cookbook.md](./references/browser-cookbook.md)。

## 反模式

- 只看代码不实际渲染。
- 只测一种视口或只测亮色。
- 沿用上一 session 的 dev / preview 进程，未确认端口、revision 与产物新旧。
- 断言前不等 hydration；用弱断言（「值变了」「看起来正常」）替代位置 / 数值断言。
- 把观察项计入问题数，或把问题降级成观察项。
- 只验证组件自身边界，忽略宿主页面是否位移（滚动条消失、fixed 元素变宽、内容重排）。
- 视觉通道不可用时仍声称视觉正常。
- 结论只留在 gitignored 目录，评审与规划台账中没有任何可追溯摘要。

## 交付前检查

- [ ] 已覆盖桌面 / 移动与亮 / 暗；动画类改动已补 reduced-motion 对照。
- [ ] 已记录截图、关键实测值与复跑命令，结论摘要已回写可追溯位置。
- [ ] 已断言宿主页面无非预期布局变化，或显式声明跳过理由。
- [ ] 问题清单含复现步骤；观察项已归因。
- [ ] 验证结论与被测 revision 一致（验证窗口内无源码改动）。
