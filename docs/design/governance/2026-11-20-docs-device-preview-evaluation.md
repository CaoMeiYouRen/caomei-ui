# 文档站桌面 / 移动设备预览评估

> 创建时间：2026-11-20
> 触发：用户要求文档跟随移动端优化，需要一种切换桌面端 / 移动端展示、并能在页面上直接看效果的方式；评估后进入 Backlog。
> 性质：**评估记录，不登记阶段**。落点为 [Backlog §1.6](../../plan/backlog.md) 候选；不修改 Phase 38 范围。

## 1. 现状读数

| 面 | 读数 | 取证 |
|:---|:---|:---|
| 文档框架 | VitePress `^1.6.4` | `package.json` |
| Demo 插件 | `vitepress-demo-plugin` `^1.8.0`，`<demo vue="../examples/...">` 内联渲染预览 + 代码 | 注册见 `docs/.vitepress/config.ts`；典型用法见 `docs/components/button.md` |
| 主题装配 | `layout.vue` 挂 `ConfigProvider` / `TooltipProvider` / `ToastProvider` / `ConfirmDialog`；全局引入 `src/styles/index.css` | `docs/.vitepress/theme/{index.ts,layout.vue}` |
| 组件响应式 | 走**视口** `@media`（≤640 / ≤768 / ≤1024），无容器查询、无 JS 视口分支 | [响应式设计](../responsive.md) §2 |
| 设备预览 | **无**：插件不提供 iframe / 设备档；Demo 预览宽度跟随文档页视口 | 插件 README 与 `dist/client.d.ts` 无 device 相关 props |
| 文档测试 | `docs:build` / `docs:check` / 画廊 E2E / axe；无“设备预览”用例 | `scripts/docs/`、`test/e2e/gallery.e2e.ts` |

## 2. 关键约束（决定方案形态）

**缩窄容器不会触发组件的移动端形态**。库内响应式是 `@media (width <= 640/768/1024)`，媒体查询取的是**外层视口**；把 Demo 放进一个 390px 宽的 `<div>` 或加 `transform: scale()`，只会改变可用宽度，`@media` 仍按桌面视口命中。因此：

- **纯 CSS 宽度容器**只能看到折行 / 溢出，不能看到真实的移动端布局切换，容易误导。
- **真实视口**必须来自 iframe（或新窗口）。这是本评估的核心结论。使用方传入的 [`Dialog.breakpoints`](../responsive.md) 也只是按视口上限生成 `@media`（迁移期实测 1199 / 575），不改变这一结论。
- iframe 方案还要解决：主题 / 预设 / 暗色同步、Demo 隔离、内容高度、`base` 子路径、SSR / hydration、iframe 可访问名与焦点。

## 3. 方案对比

| 方案 | 做法 | 真实视口 | 页面内 | 估算文件 / 行 | 用时 | 风险 |
|:---|:---|:---:|:---:|:---|:---|:---|
| **A 整页设备预览** | 在布局层加“设备预览”按钮，打开 iframe 加载当前文档页，宽度切 390 / 768 / 1024 / 1280；用查询参数隐藏预览按钮自身 | ✓ | ✓ 抽屉 / 弹层 | 4–6 / 250–350 | **3–4 天** | 递归加载当前页、主题闪烁、高度固定 |
| **B 单 Demo 抽屉预览** | 独立 `/preview` 路由按 Demo 路径渲染单个示例；Demo 块加“在设备中打开”按钮；postMessage 同步主题与高度 | ✓ | ✓ | +6–10 / +300–500 | **+3–4 天** | 需要 Demo 注册表 / 预览路由；示例上下文可能缺失 |
| **C 内联拖拽切换** | 每个 Demo 内联桌面 / 移动切换 + 可拖拽宽度 | ✓ | ✓ | +4–6 / +200–300 | **+2–3 天** | 最高；需改插件输出或注入 DOM，版本耦合 |
| **D 宽度容器** | 仅给 Demo 套一个 390px 容器 | ✗ | ✓ | 2–3 / 100–150 | 1–2 天 | **不真实**；`@media` 不命中，易误导 |
| **E 新窗口预览** | 按钮打开 390 宽新窗口 | ✓ | ✗ | 2 / 50–100 | 0.5–1 天 | 不在页面内；仅作兜底 |
| **F 静态截图** | 预生成 390 / 768 / 1280 截图并切换展示 | ✓（静态） | ✓ | 3–5 + PNG | 2–3 天 | 不可交互；资产维护 |

## 4. 推荐路径

**分两阶段，先拿到“页面内可切换”的 MVP，再决定是否做单 Demo 隔离：**

- **P1 整页设备预览（A，3–4 天）**：成本最低的真实视口方案。按钮放在 `layout.vue` 的导航区，抽屉内 iframe 加载 `当前 URL + ?device-preview=1`；提供 390 / 768 / 1024 / 1280 四档，iframe 固定高、内部滚动；同一 origin 下 `localStorage` 的暗色 / 预设自动同步。它展示的是“文档页在设备上的样子”，包含文档导航，适合验收整体观感。
- **P2 单 Demo 抽屉（B，+3–4 天）**：为组件页提供“只看这个示例”的隔离预览。需要从 `<demo vue>` 的路径生成 Demo 注册表，新增 `/preview` 路由（`layout: false`）按路径动态加载示例，父页用 postMessage 同步主题 / 高度。适合逐组件核对。
- **C 内联拖拽**：在 P2 之后再评估（+2–3 天）；需要改插件输出或做 DOM 注入，版本升级风险最高，不作为首期。
- **D / E / F**：D 不作为真实预览；E 可作为 P1 的兜底；F 只在需要离线 / 静态文档时考虑。

**合计**：P1 + P2 约 **6–8 天**；只做 P1 约 **3–4 天**；再加 C 约 **8–11 天**。不新增运行时依赖。P1 / P2 分别独立验收与提交，不合并为单条（P1 约 4–6 文件、P2 约 6–10 文件，均在[规划规范 §5](../../standards/planning.md) 的 10 文件阈值内）。**拆分预案**：P2 若达 10 文件，按「Demo 注册表 / 预览路由」与「主题同步 / 高度 / a11y」两批拆分；P1 + P2 合计行数若越过 800 行，同样按该边界拆。

## 5. 风险与边界

| 项 | 风险 | 处置 |
|:---|:---|:---|
| 主题 / 预设同步 | iframe 内可能先渲染默认主题再切换，产生闪烁 | `localStorage` 同源读取 + 首帧前应用；必要时用查询参数兜底 |
| 递归页面 | A 方案 iframe 会再次加载同一文档页 | 用 `?device-preview=1` 隐藏触发按钮；或改用专用预览 shell |
| Demo 上下文 | B 方案脱离 `ConfigProvider` / 文档页上下文，示例可能缺 locale / provider | 预览路由复用同一组 Provider；补充边界示例 |
| 子路径 | Pages 部署在 `/<repo>/` 下，iframe / 资源路径需带 `base` | 统一用 `withBase` / `import.meta.env.BASE_URL` |
| 可访问性 | iframe 需要 `title`、焦点进入 / 退出、Esc 关闭 | 复用 `CaomeiDrawer` 或 Dialog 的关闭契约 |
| 文档门禁 | 新路由 / 新组件可能触发 i18n parity、链接、axe、画廊守卫 | 预览路由放 `guide/` / `components/` 之外；按实际触发的守卫补登记 |
| 插件耦合 | C 方案需改 `vitepress-demo-plugin` 输出，升级易碎 | 首期不做 C；A / B 不依赖插件内部结构 |

## 6. Review Gate

**R1（`quick`，2026-11-20）**：**Pass** —— 0 blocker / 0 warning / 4 suggest（均同批收口）。

- **RG-S01**：§1「Demo 插件」取证改为 config 注册 + `docs/components/button.md` 用法。
- **RG-S02**：Backlog 触发条件改为「Phase 38 M4-1 移动端适配指南落地，或用户裁定」。
- **RG-S03**：§2 补注 `Dialog.breakpoints` 仍按视口上限生成 `@media`，不改变结论。
- **RG-S04**：§4 补 P2 达 10 文件 / 合计越 800 行时的拆分预案。
- 验证：`lint-md` / `docs:check:links` / `check:governance-records` / `check:governance-counts` / `check:stage-counts` / `check:final-newline` 全绿；零 `src/**`。
- 未覆盖：未做 iframe 原型（首帧闪烁、高度策略待实测）；未跑全量 `docs:build` / `docs:check`（无站点代码改动）。
- 证据记录：`artifacts/review-gate/2026-11-20-docs-device-preview.md` R1。

## 7. 落点

- [Backlog §1.6](../../plan/backlog.md)：新增“文档站桌面 / 移动设备预览”候选，P1 / P2 分阶段与触发条件见该行。
- 本记录不登记阶段、不改 `todo.md` / `roadmap.md`、不改 `src/**`、不新增依赖。
