# Phase 34 M5-1：BackTop 实现、导出与自动导入

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M5-1 行。

## 1. 交付面（11 文件）

| 面 | 文件 |
|:---|:---|
| 组件 | `src/components/back-top/back-top.vue`：滚动监听（`window` / 选择器 / 元素）、阈值显隐、回顶（平滑 / reduced-motion 兜底）、`v-show` 与内建图标、CSS 变量覆盖钩子 |
| 类型 | `src/components/back-top/types.ts`：`BackTopProps`（`label` 必填、`target`、`threshold`）、`BackTopEmits`、`BackTopSlotProps`、`BackTopTarget` |
| 导出 | `src/components/back-top/index.ts` |
| 单测 | `src/components/back-top/back-top.test.ts`：13 例（逐点清单以该文件的 `it` 为准）——默认隐藏与阈值显隐、阈值等值边界、自定义阈值、平滑回顶与事件、reduced-motion 瞬时跳转、默认 `target=window`、非法选择器与 `null` 目标、选择器目标与无匹配回退、切换 `target`、`threshold` 重算、可访问名与默认图标、卸载移除监听、SSR |
| 包入口 | `src/index.ts`：`export * from './components/back-top'` |
| Nuxt 自动导入 | `src/nuxt/components.ts`：`CaomeiBackTop` 入清单（`components.test.ts` 漂移校验同步通过） |
| 夹具 | `test/e2e/fixtures/app.vue`：`#back-top`（独立滚动容器 + 元素目标，供浏览器验证与 M5-4 的 E2E 复用） |
| a11y 受检面 | `test/a11y/fixtures.ts`：新增 `CaomeiBackTop` 夹具（阈值 -1 让按钮在静态审计中可见），受检面预算 62 → 63 |
| 档位登记 | `docs/design/design-spec.md` §2.5 档位行 + §2.3 消费统计：`--caomei-z-sticky` 由「预留（暂无消费点）」改为「BackTop 等常驻浮出控件」 |
| 层级守卫 | `scripts/governance/check-overlay-z-index.mjs`（`sticky` 移出 `RESERVED_TIERS`）+ 同名单测（反例注入预留档位以保留可失败性） |

交付面 11 文件，超过 10 文件阈值。复算口径（2026-11-15）：`git status --porcelain -uall | wc -l` 为 14（`-uall` 展开未跟踪目录 `src/components/back-top/` 的 4 个文件）；扣除治理载体 3（`docs/design/governance/2026-11-15-phase34-m5-1-back-top.md`、`docs/design/governance/index.md`、`docs/plan/todo.md`）后为 11，与表中逐行求和一致。

超阈值按[规划规范 §5](../../standards/planning.md) 以**提交粒度**拆分：档位登记与守卫迁移先提交，组件与测试随后提交；两段共享同一验收口径（BackTop 可用、守卫仍 fail-closed），单独成条目会迫使登记与阶段构成计数同步重算而收益为零，故条目粒度仍为 M5-1。守卫迁移必须先于组件：`CaomeiBackTop` 一旦使用 `--caomei-z-sticky`，守卫会立即以「预留档位出现消费点」阻断 `verify`。

resolver 为通用前缀映射（`src/resolver/index.ts` 不维护组件清单），无需逐组件登记；治理索引、记录本体与规划状态位不计入上表。

## 2. 决策

1. **`label` 必填**：组件不含可见文案，可访问名由使用方按当前语言提供；缺省硬编码中文会与 10 语 locale 守卫冲突。M5-3 补 locale 键后可放宽为缺省值，本批先保证名称永远不缺失。
2. **`target` 三态**：元素直接用、字符串按 CSS 选择器解析、其余回退 `window`；解析失败不抛错（回顶最坏退化为滚窗口），避免选择器写错导致组件崩溃。
3. **监听在 `onMounted` 内挂载**：SSR 期间不触碰 `document` / `window`；`target` 变化时先解绑再重挂，避免重复监听。
4. **`threshold` 用严格大于**：默认 200px，`scrollTop === threshold` 时隐藏、超过 1px 才显示；阈值变化立即重算一次，不做节流（滚动回调只做一次比较，开销可忽略）。
5. **reduced-motion 用 `matchMedia` 判定、走原生 `behavior: 'auto'`**：不引入 rAF 循环；`smooth` 与 `auto` 都由浏览器执行，`prefers-reduced-motion` 下无平滑动画。
5.1 **窗口判定用引用比较**：`target === window` 而不是 `instanceof Window`——跨 realm 与 happy-dom 下构造函数不同源，`instanceof` 会把窗口判成元素、读到 `undefined` 的 `scrollTop`。
5.2 **非法选择器与 `null` 目标回退窗口**：数字开头的 id 拼出的 `#123-panel` 会让 `querySelector` 抛 `SyntaxError`，`target` 的 `null` 初值也会进入对象分支；两者都收敛到「挂载不抛错、退化为窗口滚动」。
5.3 **`target` 变化在 DOM 提交后重挂**：watch 用 `flush: 'post'`，避免同一次更新里切换容器时解析到旧节点。
6. **固定定位与视觉全部走 CSS 变量**：`--caomei-back-top-*`（偏移 / 尺寸 / 圆角 / 背景 / 前景 / 边框 / 阴影 / 层级），层级默认取 `--caomei-z-sticky`，低于任何模态与浮层。
7. **`v-show` 而非 `v-if`**：保留按钮节点，切换只改 `display`；避免滚动过程中反复挂载 / 卸载，也让消费方的选择器稳定。
8. **`style` 不声明为 prop**：`style` 是 Vue 保留属性，声明成 prop 会与 fallthrough 冲突；需要内联覆盖时按常规透传。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/components/back-top` → 全绿；新增 13 例（用例清单见同名测试文件） |
| 导出 / 自动导入 | `npx vitest run src/nuxt src/resolver` → 全绿（`CaomeiBackTop` 在清单内，漂移校验通过） |
| `pnpm typecheck` / ESLint | 通过 |
| 浏览器验证（V） | 对象：夹具 `#back-top`（`target="#back-top-scroller"`、`threshold=50`），入口 `vite --config test/e2e/fixtures/vite.config.ts`，Playwright Chromium 临时探针（未入库）。1280×900 与 390×844 两视口：初始 `display: none` → 目标容器 `scrollTop=120` 后 `display: flex`；计算样式 `position: fixed`、`right/bottom: 16px`、`z-index: 10`、尺寸 40×40，按钮完整落在视口内；点击后目标 `scrollTop` 归 0；`document.documentElement.dataset.theme='dark'` 后背景由 `rgb(247, 247, 248)` 变为 `rgb(23, 23, 26)`。默认阈值 200 的等值边界由单测锁定（等于阈值隐藏、超过 1px 显示） |
| 层级守卫 | `node scripts/governance/check-overlay-z-index.mjs` → 通过（`sticky` 消费点合法、其余档位有序）；反例单测仍能报 `[reserved-tier-consumed]` |
| `pnpm verify` | `exit 0`。首轮全量跑命中 `input-number` 精度用例单例失败，隔离运行该文件通过、未改动该组件，复跑通过——归因为并行负载下的既有 flaky，与本批改动无因果 |

## 4. Review Gate

- **R1-A（`standard`，组件 / 类型 / 单测 / 导出）**：`Reject`（3 blocker：默认偏移引用不存在的 `--caomei-space-6` 使 `right` / `bottom` 整体失效、非法选择器与 `null` 目标在挂载期抛错、缺浏览器验证；4 warning：`target` 重挂早于 DOM 提交、生命周期分支无用例、默认窗口目标未测、阈值等值边界未锁定；5 suggest）。
- **R1-A 修复**：① 默认偏移改用 `--caomei-space-4`，圆角 / 阴影对齐 `--caomei-radius-full` / `--caomei-shadow-sm`；② `target` 用 `instanceof HTMLElement` + 选择器 `try/catch` + `null` 回退窗口，补两条不抛错用例；③ 补真实浏览器验证（两视口 + 暗色，读数见 §3）；④ watch 加 `flush: 'post'`；⑤ 补 target 切换、threshold 变更、默认窗口目标、阈值等值四类用例；⑥ SSR 用例改为移除全局 `window` 后渲染；⑦ `defineEmits<BackTopEmits>()` 复用导出类型。
- **R1-B（`standard`，记录 / 索引 / 文档 / 守卫）**：`Reject`（1 blocker：§1 与 §6 的用例数仍是 9，与 §3 的 13 冲突；4 warning：浏览器读数不可复现、夹具引用不存在的 E2E、§1 计数缺复算口径、消费统计绝对值不可复算；3 suggest）。
- **R1-B 修复**：① §1 / §6 统一为 13 例并以测试文件 `it` 为逐点清单；② §3 补夹具 / 阈值 / 入口 / 两视口 / 测量方式，默认阈值边界注明由单测锁定；③ 夹具注释改为「供 M5-4 使用」；④ §1 补 `git status --porcelain -uall` 口径、快照日期与拆分依据；⑤ 消费统计改为工作区口径 + 可复算命令 + 增量；⑥ 守卫注释与 JSDoc 同步、flaky 补归因、档位命名 bullet 补齐。
- **R2（`quick`，A/B 修复点）**：`Reject`（2 blocker：消费统计转引到不含该口径的 §2.4 且 `git grep` 命令对未跟踪文件恒为 0、§1 的 `git status` 输出与声明值不符；4 follow-up：§4 占位、守卫注释失真、测试未卸载 / 未 unstub、夹具措辞）。已按条修复：统计改为 `rg` 工作区口径并就地给值，§1 改 `-uall` 并列出扣除路径，测试补齐卸载与 `unstubAllGlobals`。
- **R3（`quick`，R2 修复点）**：`Pass`（0 blocker；B1 / B2 / W2 / S1 / S4 关闭；提交前回填本节并同步消费统计基线为 `b046f8e`、§1 的章节引用改为「§2.5 档位行 + §2.3 消费统计」）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | 本阶段 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 / F17 | 承接 M1-6 | 见 M1-6 记录遗留节 |
| F18 | 承接 M3-1：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert` | 见 M3-1 记录遗留节 |

## 6. 复查基线

本记录 §1 ~ §5；`back-top.vue` 的 `resolveTarget` / `handleScroll` / `attach` / `scrollToTop`；`types.ts` 的四个导出；`back-top.test.ts` 13 个用例；`src/index.ts` 与 `src/nuxt/components.ts` 的登记行。
