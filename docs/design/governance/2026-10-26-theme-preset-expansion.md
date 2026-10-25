# 主题预设同步与扩面

> 日期：2026-10-26。触发：用户三项指令——① 按 momei 实际主题颜色同步本地 `momei` 预设；② 提供更多有差异、有设计感的预设；③ 评估手机端优先主题预设。
> 关联：[设计规范 §5](../../design/design-spec.md#_5-主题预设-已实现)、[手机端优先预设评估](./2026-10-25-mobile-first-preset-evaluation.md)、[主题与样式设计](../../design/theming.md)。

## 1. momei 预设同步（源：momei 运行时）

`momei` 预设此前取 momei 的静态 `MomeiPreset` 语义值，与当前运行时主题（`composables/use-theme.ts` 生成色阶 + `styles/main.scss` 的 `--p-*` → `--caomei-*` 桥接）存在偏差。本次按运行时口径同步：

| 项 | 旧值（亮 / 暗） | 新值（亮 / 暗） | 依据 |
| --- | --- | --- | --- |
| `primary-solid` | `#64748b` / `#64748b` | `#3c4653` / `#59626e` | 桥接 `--p-primary-700`（随明暗派生） |
| `bg` | `#fff` / `#020617` | `#fff` / `#0c1020` | 暗色 `--p-surface-card = surface-100`（surface-0 混 4% 白） |
| `bg-elevated` | `#f8fafc` / `#0f172a` | `#f5f6f6` / `#151929` | `color-mix(surface-card 96%, text 4%)` |
| `text-muted` | `#64748b` / `#64748b` | `#6f747f` / `#91959f` | 运行时 `color-mix(text, surface 40%)` |
| `border` | `#e2e8f0` / `#334155` | `#ebebeb` / `#161a2a` | `content-border-color = surface-200` |
| `radius-sm/md/lg` | `4 / 6 / 12` | `4 / 8 / 16` | `content-border-radius = 0.5rem` 及 0.5× / 2× |
| 暗色状态色 | `#4ade80` / `#fb923c` / `#f87171` | `#22c55e` / `#f97316` / `#ef4444` | 桥接取 PrimeVue primitive 500，暗色不浅化 |

**有意例外**：`primary-solid` 不再跨明暗稳定，按源保真随 `--p-primary-700` 派生；两态配 `on-solid` 白字为 9.58:1 / 6.18:1，均达标。该例外已回写设计规范 §2.2 与 §5.2。

**对比度登记**：momei 亮色 `primary` 在 `bg-elevated` 上 4.40:1、`text-muted` 同面 4.33:1；由运行时面层派生引入，按源保真维持，已登记设计规范 §3.2 / §5.2。

**行为影响**：已使用 `data-preset="momei"` 的下游会看到暗色面层变亮、圆角变大、暗色状态色加深；属预 1.0 的视觉修正，须进入 1.0.0 发布说明。

## 2. 新增设计向预设

新增三套不绑定下游品牌的预设，均在 **primary 之外**改变中性面温度、正文 / 边框、圆角阶梯与投影：

| 预设 | 气质 | 亮色面层 | 暗色面层 | 形状 |
| --- | --- | --- | --- | --- |
| `sakura` | 梅樱 / 内容站 | `bg #fff8f9` / `elevated #ffeef2` / `primary #be123c` | `#1a0c12` / `#28131b` / `#fb7185` | `radius 6 / 12 / 18` + 梅色投影 |
| `forest` | 松林 / 工具型 | `#f6fbf8` / `#eaf5ef` / `#047857` | `#06180f` / `#0d2619` / `#34d399` | `radius 2 / 6 / 10` + 绿色小投影 |
| `ink` | 水墨 / 阅读型 | `#faf8f3` / `#f1eee6` / `#1f1b18` | `#121110` / `#1c1a17` / `#f4f1ea` | `radius 0 / 2 / 4` + 极弱投影 |

三套预设的主色配对、正文、次要文字与 `primary-solid` 配对均满足 AA（逐项值见设计规范 §5.3）；`primary-solid` 保持跨明暗稳定。状态色在 `bg-elevated` 上沿用库内既有口径，部分 tone 可能低于 4.5:1，已显式声明不纳入本次下界断言。

## 3. 手机端优先评估

结论与候选形态见[手机端优先主题预设评估](./2026-10-25-mobile-first-preset-evaluation.md)：**不把 `mobile` 塞进 `data-preset`**；推荐 1.0 后采用独立 `data-density="touch"` 密度轴 + `--caomei-hit-target-min` 不可见命中区。短期以 [移动端与响应式指南](../../guide/mobile.md) 的尺寸 token 覆盖配方承接；候选已登记 [Backlog §1.5](../../plan/backlog.md)。

## 4. 载体与验证

- 代码：`src/styles/presets/{momei,sakura,forest,ink}.css`、`src/styles/index.css`、`src/styles/theme.css`（注释）。
- 测试：`test/contracts/theme-presets.test.ts`（清单 / 必需 token / 对比度 / 切换器一致性）、`test/contracts/preset-minimal.test.ts`、`scripts/governance/check-design.test.mjs`。
- 文档：设计规范 §1 / §2.2 / §3.2 / §4 / §5、主题与样式、架构、README 中英、文档站切换器、移动端指南中英、Backlog、本索引。
- 验证：`pnpm test`（2715 passed / 141 files）、`pnpm typecheck`、`pnpm lint:css:check`、`pnpm governance:check`、`pnpm test:visual`（33 passed）、`pnpm build`；真实浏览器复核六套预设 × 亮暗 token 解析、390 / 768 / 1440 无横向溢出、文档站切换器六选项可用（一次性 Playwright 探针，工件在本地 `/tmp/opencode`，不入库）。

## 5. Review Gate

- **R1 `standard` Pass**（0 blocker / 5 warning / 6 suggest；独立审计）。Warning 处置：① 预设目录与切换器清单守卫收紧；② momei `primary × bg-elevated` 4.40:1 补登记；③ 本记录 + `todo.md` 执行期追加 + 1.0 发布说明登记；④ `-solid` 稳定例外在设计规范 §2.2 与 `theme.css` 头部交叉引用；⑤ 提交按「momei 同步 / 新增预设 / 评估与登记」拆分。建议项（措辞、计数、暗色 `-solid` 断言、状态色口径）已同批收口。
- **R2 `quick` Pass**（0 blocker；R1 五项 warning 与建议项全闭合）。复审新增 N01（测试计数）已改为 2715；N02 已补「一次性 Playwright 探针、工件不入库」口径；N03 的 `minimal.css` 专项断言保留为与全量清单守卫的双保险。
- 审计用时未单独计时，未超声明时间盒（R1 ≤10 分钟 / R2 ≤4 分钟）。

## 6. 残余风险

- momei 暗色 `border` 对 `bg` 约 1.09:1，按源取 `surface-200`；输入框 / 表格分隔线在暗色下会更不明显，需真实页面观感复核。
- `ink` 的主色与正文色非常接近，链接 / 操作的可达性依赖上下文而非色相；已在设计意图中声明。
- 新预设的 `bg-elevated` 上状态色对比度未纳入断言；如需严格 AA，使用层应覆盖对应 tone。
- 预设扩面不改变冻结的 token 名称与组件 API；若 `data-preset` 取值要进入 1.x 承诺，需在版本策略中显式补列。
