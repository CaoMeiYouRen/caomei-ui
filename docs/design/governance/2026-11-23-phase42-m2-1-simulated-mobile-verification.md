# Phase 42 M2-1：浏览器设备视口模拟的移动验收（模拟，非真机）

> 创建时间：2026-11-23
> 触发：Phase 42 登记批次 M2-1（[登记记录](./2026-11-23-phase42-registration.md) §2；用户 D1 ② 裁定「不做真机、真机验收采用浏览器模拟移动端的分辨率」）。
> **口径**：本记录全部结论均为**浏览器设备视口模拟（非真机）**。任何「通过」只表示「模拟下未复现问题」，不构成真机验收结论。

## 1. 口径与边界

- **执行形态**：Playwright `webkit` 设备预设（`devices['iPhone 12']` / `devices['iPhone SE']`），含移动 UA、DPR、`hasTouch`；文档站以 `pnpm docs:dev` 本地启动后访问。
- **检查面**：Phase 41 M5-4 真机清单的三项（iOS `dvh`、触摸滚动 / 滚动容器、OTP 自动填充）中**模拟可取得的部分**；未取得的部分逐项列在 §4。
- **非目标**：不申请真机执行、不改组件行为、不改断点语义、不做全站横向溢出普查（§5 只记录顺带命中项）。
- **表述纪律**：本记录与 `mobile.md` 不得出现「真机通过」类表述；「模拟（非真机）」与「真机未执行」必须同时出现。

## 2. 环境与方法

| 项 | 值 |
| :--- | :--- |
| 运行时 | Node `v26.13.1`、pnpm `11.17.0` |
| 浏览器 | Playwright `webkit`（仓库 `node_modules/@playwright/test` 绑定的本地构建） |
| 设备预设 | `iPhone 12`（视口 390×664、DPR 3、`hasTouch`）、`iPhone SE`（视口 320×568、DPR 2、`hasTouch`） |
| 文档站 | `pnpm docs:dev --port 5399`（VitePress dev，端口避开视觉 / E2E 夹具） |
| 页面 | `/guide/mobile`（壳层示例）、`/components/action-sheet`（底部面板）、`/components/input-otp` |

- 执行方式为一次性探针脚本（不入库）：读取设备预设 → 打开页面 → 以 `getBoundingClientRect` / `getComputedStyle` / 键盘输入取证 → 输出 JSON。探针不入库的理由：本条目的交付物是**验收记录**，探针本身不是常驻装置；需要复跑时按 §6 步骤重建。
- 取证点：`dvh` 支持性与 `90dvh` 实测高度、吸顶条在容器滚动后的 `top`、底部件相对壳层底边位置、滚动容器的 `clientHeight` / `scrollHeight` / `scrollTop`、OTP 逐格 `autocomplete` / `inputmode` / 字号 / 输入分配 / 模型值 / 焦点落点。

## 3. 逐项结果

| 清单项 | 检查点 | iPhone 12（390×664） | iPhone SE（320×568） | 模拟未覆盖的部分 |
| :--- | :--- | :--- | :--- | :--- |
| iOS `dvh` | `CSS.supports('height', '100dvh')` | 支持 | 支持 | 无（本行只验证单位解析；动态视口影响见 §4 第 1 项） |
| iOS `dvh` | `90dvh` 实测高度 = 视口高的 90% | 597.59px，与 `innerHeight × 0.9` 差 ≤1px | 511.19px，同上 | 模拟下 `innerHeight` 不随地址栏变化，只能证明单位解析正确 |
| iOS `dvh` | `ActionSheet` 底部面板高度 = `min(90dvh, 420px)` | 420px | 420px | 真机地址栏收起 / 展开时的面板高度跟随 |
| iOS `dvh` | 面板落在视口内（`bottom <= innerHeight`） | 模拟通过 | 模拟通过 | `safe-area` 恒为 0，刘海 / home indicator 让位未验证 |
| 触摸滚动 | 壳层滚动容器可滚（`scrollHeight > clientHeight`） | 400 / 564，赋值 `scrollTop` 后到 164 | 400 / 564，同样到 164 | 惯性滚动与 `touch-action` 交互 |
| 触摸滚动 | 滚动后吸顶条仍在容器顶部 | 模拟通过（`top` 与容器顶差 ≤1px） | 模拟通过 | 真机地址栏收缩时的 `position: sticky` 重算 |
| 触摸滚动 | 底部操作条与标签栏落在壳层内 | 模拟通过 | 模拟通过 | 底部安全区与 home indicator 的视觉让位 |
| OTP | 每格 `autocomplete="one-time-code"` | 6 格全部具备 | 6 格全部具备 | 系统键盘 / 短信填充链路 |
| OTP | 每格 `inputmode="numeric"`、字号 ≥16px | 数值键盘语义、16px | 数值键盘语义、16px | iOS 聚焦缩放的真实表现 |
| OTP | 键入 `123456` 后逐格分配、模型同步 | 逐格 `1`~`6`，模型值 `123456` | 同左 | 系统级自动填充 |
| OTP | 输入后焦点落点 | 第 6 格 | 第 6 格 | 真机键盘遮挡与滚动补偿 |

- **模拟结论**：三项清单在模拟下均未复现问题；`dvh` 回退与面板收敛、壳层吸顶与底部件位置、OTP 语义与分配行为与设计口径一致。
- **壳层横向溢出**：壳层示例在 320 档的可用宽度为 230px（`.shell-demo` 为 `width: 100%; max-width: 420px`，被页面左右留白压到 230px；以 `getBoundingClientRect().width` 测得），其容器内无横向溢出，底部操作条与标签栏均在壳层底边以内；页面级横向溢出见 §5（来源为文档站自身，与壳层无关）。

## 4. 模拟无法覆盖的部分（真机未执行）

1. **iOS 地址栏收起 / 展开**：模拟环境的 `innerHeight` 恒定，`dvh` 不会经历动态收缩；「抽屉 / 对话框 / Toast / 图片预览不跳动」只能在真机确认。可确认的是单位解析与回退结构（`@supports (height: 100dvh)` 存在）。
2. **触摸滚动惯性 / 滚动锁**：模拟以程序赋值 `scrollTop` 取证，不经手势与惯性；面板内滚动是否带动页面、滚动锁复位只能按既有 `responsive.e2e.ts` 与 `ui-validator` 记录对照。
3. **系统 OTP 自动填充**：无系统键盘与短信通道；只能确认 `autocomplete="one-time-code"` 落在每格输入上、键入分配与模型同步正确。
4. **`safe-area` 让位**：模拟下 `--caomei-safe-area-top` 解析为 `0px`，刘海 / home indicator 相关留白与命中区偏移未验证。

## 5. 顺带命中项（不在本条目验收面）

- **文档站 320 档页面级横向溢出 30px**：`/guide/mobile`、`/guide/development`、`/plan/roadmap` 在 320×568 模拟下 `documentElement.scrollWidth` 为 350，溢出来源为 VitePress 顶栏内容容器与汉堡按钮（`.content` / `.VPNavBarHamburger`），**非组件库样式**；360 档起消失。
- **组件示例页 360 / 390 档横向溢出**：`/components/button` 在 360 档溢出 33px、390 档 3px，溢出来源为 demo 源码块的 `pre.language-html`。
- **处置**：本条目不改代码，交由 M2-2 判定「修复 / 在 `mobile.md` 写明边界 / 另立候选」；组件库自身的壳层示例在上述档位无横向溢出，故不作为库缺陷登记。

## 6. 复现步骤

1. `pnpm docs:dev --port 5399`（确认 `pnpm docs:gen` 已产出组件元数据）。
2. 以 Playwright `webkit` + `devices['iPhone 12']` / `devices['iPhone SE']` 打开 `/guide/mobile`：取 `.shell-demo__scroll` 的 `clientHeight` / `scrollHeight`，赋值 `scrollTop = scrollHeight` 后量 `.shell-demo .caomei-nav-bar` 的 `top`、`.shell-demo__actions` 与 `.caomei-tabbar` 的 `bottom`。
3. 打开 `/components/action-sheet`，点击「打开操作面板」，量 `.caomei-drawer__content` 的高度与 `bottom`，并用临时元素量 `90dvh` 的实际高度。
4. 打开 `/components/input-otp`，读 `.caomei-input-otp__cell` 的 `autocomplete` / `inputmode` / `font-size`，聚焦首格键入 `123456` 后读逐格 `value`、隐藏输入的值与 `document.activeElement` 所在格序。
5. 横向溢出对比：在 320 / 360 / 390 档分别读 `documentElement.scrollWidth - innerWidth`，并列出 `right > innerWidth` 的元素路径。

探针的最小骨架（选择器与取数语句；片段需置于 ESM 模块或 `async` 包装内；本轮的一次性脚本落在 `/tmp/opencode/`，未入库）：

```js
import { webkit, devices } from '@playwright/test'

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:5399'
const browser = await webkit.launch()
const page = await (await browser.newContext({ ...devices['iPhone 12'] })).newPage()

await page.goto(`${BASE_URL}/guide/mobile`, { waitUntil: 'networkidle' })
const shell = await page.evaluate(() => {
    const scroll = document.querySelector('.shell-demo__scroll')
    const nav = document.querySelector('.shell-demo .caomei-nav-bar')
    scroll.scrollTop = scroll.scrollHeight
    return { clientHeight: scroll.clientHeight, scrollHeight: scroll.scrollHeight, navTop: nav.getBoundingClientRect().top }
})

const ninetyDvh = await page.evaluate(() => {
    const probe = document.createElement('div')
    probe.style.cssText = 'position:absolute;height:90dvh;width:1px;visibility:hidden'
    document.body.append(probe)
    const height = probe.getBoundingClientRect().height
    probe.remove()
    return height
})
```

```js
const cells = await page.locator('.caomei-input-otp__cell').all()
await page.locator('.caomei-input-otp__cell').first().click()
await page.keyboard.type('123456', { delay: 30 })
const values = await page.locator('.caomei-input-otp__cell').evaluateAll((nodes) => nodes.map((node) => node.value))
```

## 7. Review Gate

- **R1（2026-11-23，`quick`，时间盒 ≤5 分钟）**：**Reject**（1 blocker / 1 warning / 4 suggest）。blocker：本批曾含 `docs/plan/todo.md`，进度表预写了尚未发生的 Gate 结论（`RG R1 Pass`）。修复：把 `todo.md` 移出本批，规划状态改由条目提交后的独立同步批次回填（含真实 SHA 与容量实际提交数）。warning：容量列「实际提交数」与提交列「待补」互斥（随 `todo.md` 移出而消失）。suggest：§3 首行「未覆盖」列空占位改说明、结果列「通过」改「模拟通过」、230px 补口径、§6 补可执行最小骨架——同批落实。
- **R2（2026-11-23，`quick` delta，时间盒 ≤5 分钟）**：**Pass**（0 blocker / 2 warning / 4 suggest）。B1 / W1 经「移出 `todo.md`」闭合；S1 ~ S4 已落实；新增代码块未引入双花括号插值 / 围栏失衡 / 外链风险。warning 作为 follow-up：① 规划同步必须是紧接的下一次提交（已按此执行，且本条提交信息不声称规划已收口）；② `docs:check:integrity` 以已跟踪文件为受检面，提交前 `git add` 后复跑并回报读数（已复跑）。suggest：骨架改 ESM 形态、表述纪律句与正文一致、230px 补测量表达式——同批落实。
