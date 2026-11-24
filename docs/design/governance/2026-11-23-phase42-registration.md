# Phase 42 登记批次：发布收口、浏览器模拟移动验收、治理收尾与 P2 / 宽屏基线

> 创建时间：2026-11-23
> 触发：用户就[第二十七轮范围评估](./2026-11-23-next-stage-scope-evaluation-27.md) D0 ~ D4 裁定 **① / ② / ② / ③ / ①**（M1 + M2 + M3 / 不做真机 / 纳入宽屏基线 / P2 两件 / 国际化二期维持候选），并备注「真机验收采用浏览器模拟移动端的分辨率」。
> **本记录是 Phase 42 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权启动时已有最大编号 Phase 41 + 1 = **Phase 42**（[规划规范 §4](../../standards/planning.md)）。
- **5 条主线 / 15 条原子条目**：发布收口 **3** / 浏览器模拟移动验收 **2** / 治理与文档收尾 **3** / P2 组件 **5** / 宽屏视觉基线 **2**；构成对账 3 + 2 + 3 + 5 + 2 = 15。
- **执行期追加（2026-11-23）**：原登记 **5 条主线 / 15 条原子条目**；2026-11-23 依据 [caomei-ui 1.4.0 下游升级反馈研判](./2026-11-23-caomei-ui-1.4.0-downstream-feedback.md) 追加 **M6 下游升级兼容修复 2 条**，追加后为 **6 条主线 / 17 条原子条目**（构成对账 3 + 2 + 3 + 5 + 2 + 2 = 17）。17 条超过建议 15 条但未超上限 20 条；M6 为发布前必须收口的兼容性问题，拆阶段会把已知回归留在 `1.5.0` 之后，故不拆阶段；主线数当时为 6（位于规划规范 §6 建议区间 3–6 的上界；硬上限为 8）。
- **执行期追加（2026-11-24）**：用户裁定「文档站修复」后追加 **M7 文档站窄屏修复 1 条**，追加后为 **18 条**；2026-11-24 缺陷报告再追加 **M7-2 / M7-3 2 条**，**执行期末（归档前）时点值 7 条主线 / 20 条原子条目**（3 + 2 + 3 + 5 + 2 + 2 + 3 = 20；归档口径见下条）。范围 = 文档站在 320 档的页面级横向溢出（VitePress 导航栏）与示例源码 / 按钮示例在 360 / 390 档的溢出；不改变组件库源码。**为何不拆阶段**：第 7 条主线落在规划规范 §6 的上限 8 条内；M7 与 M1 ~ M6 共用同一发布窗口，且改动仅限文档站（不触及组件产物），独立拆阶段会把已知 UI 缺陷留在 `1.5.0` 之后。**20 条的拆分判断**：超过建议区间 10 ~ 15 条、已达上限 20 条，逐条文件面均 ≤ 10 文件、可按条独立提交与审计，故不拆；后续新增须先拆阶段或移出。**2026-11-24 用户缺陷报告追加 M7-2**（设备预览选中态前景色与实底同色）与 **M7-3**（示例中 `--caomei-color-success` 作实底配白字，暗色 1.74:1），同属文档站窄屏修复主线。
- **归档前范围变更（2026-11-24，用户裁定）**：`1.5.0` 发布收口 3 条（M1-1 ~ M1-3）移出本阶段、转入 [Backlog §1.6](../../plan/backlog.md) 待发布窗口，故**归档口径 = 6 条主线 / 17 条原子条目**（2 + 3 + 5 + 2 + 2 + 3 = 17）；M1-1 ~ M1-3 不记为已交付条目，随发布窗口另行执行。归档动作与载体同步见 [Phase 42 归档批次](./2026-11-24-phase42-archive.md)。
- **裁定到构成的映射**：
  - D0 ① 给出 M1 + M2 + M3（3 主线 / 8 条）。
  - D2 ② 追加 **M5 宽屏视觉基线**（+2 条）——该候选原触发条件为「宽屏出现真实回归或下一次视觉基线批次」，本轮由用户明确授权作为「下一次基线批次」。
  - D3 ③ 追加 **M4 P2 两件**（+5 条：两件各「实现 / 文档」4 条 + 共用登记面 1 条），对应评估记录 D0 ④ 的构成。
  - D4 ① 使国际化二期维持 Backlog，不进入本阶段。
  - 故**登记时点**最终为 **5 主线 / 15 条**（8 + 2 + 5），当时落在[规划规范 §6](../../standards/planning.md) 的主线 3–6 条与条目建议 10–15 条区间内；M6 追加后 17 条、M7-1 追加后 18 条、M7-2 / M7-3 追加后 20 条（见上两段）。
- **D1 ② 的执行口径（关键）**：用户选「本轮不做真机验收」，备注「真机验收采用浏览器模拟移动端的分辨率」。因此 **M2 的执行形态是浏览器设备视口模拟**（Playwright `devices` / `page.setViewportSize` + 移动 UA / DPR / `hasTouch`），**所有记录必须标注「模拟（非真机）」**，不得写成「真机通过」；iOS `dvh`、真实触摸滚动惯性、系统 OTP 自动填充这三项只能取「模拟可得部分」，其余显式记为未覆盖。
- **提名期 → 登记映射**：评估记录的 **M4 = P2 组件**，登记后仍为 **M4**；评估记录的 **M5 = 国际化二期**（D4 ②），因 D4 ① 不进入本阶段，登记后 **M5 改记宽屏视觉基线**（评估 D2 ② / C4）。故同日两份文档的 M5 指代不同，以本记录为准。
- **D1 ② 覆盖评估记录的交付形态**：评估记录 §3 对 D1 ② 写「清单 / 模板 + 未执行记录，不计为已完成验收」；本阶段按用户备注改为「浏览器模拟执行 + 记录」，**该口径以本记录为准**。M2 的「已交付」仅指模拟执行与记录完成，**不代表真机验收通过**。
- **主线性质**：M1 为发布主线；M2 为验收主线；M3 为治理主线；M4 为功能主线；M5 为质量基线主线。
- **阶段级非目标**：不做国际化二期 7 语、RTL、Tree / TreeSelect、通用 Picker 实现、手势件、单 Demo 抽屉、`xl` 断点与宽屏布局规则（C5 维持 Backlog）、依赖与工具链升级（`typescript` 7 / `conventional-changelog` 8 / `glob` 覆盖）、CI 运行器镜像迁移；不做破坏性 API；不新增运行时依赖；不进入 2.0。
- **主线级非目标**：
  - M1：不改发布触发模型（仍为 tag / 手动触发链）、不重指 tag、不强制下游升级、不为发版专门改业务代码；`1.4.x` 人工覆盖不采用（版本判定为 minor）。
  - M2：不申请真机执行、不把模拟结论表述为真机结论、不做通用 Picker、不做手势件、不改移动断点语义。
  - M3：不改组件行为、不做全库同类机械扫描、不改 400 行归档阈值。
  - M4：不做其余 P2（Tour / Carousel / Watermark / Splitter / Anchor / QRCode / ContextMenu 系列）、不引入动画库、不改既有组件契约。
  - M5：不改既有 768 / 390 基线、不把宽屏用例塞进 `pnpm verify` 常驻链、不改 `test:visual` 的容差口径。

## 2. 条目与验收口径

| 编号 | 主线 | 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|:---|:---|
| **M1-1** | 发布收口 | 发布前门槛复核与升级注意 | 在 HEAD 重跑 `Weekly Regression`（最近 success 为 `7ee8f7c`，距 `8038ab40` 已 32 个提交）；复核 Dependabot / Code Scanning 为 0；`pnpm verify` 全绿；升级注意写入 `docs/release-notes/1.5.0.md` 的「### 升级注意」段（发布时由 `generateNotesCmd` 注入 CHANGELOG，CHANGELOG 重写不会覆盖该文件），写明 Form 内建校验与 `submit` 语义（校验失败不抛出）、DatePicker `month` / `year` 值归一化、NavBar 例外项、`labelAttrs` 收口；补下游迁移最小示例（`validate` / `errors`），不改下游代码 | ≈ 6 | 无 |
| **M1-2** | 发布收口 | `1.5.0` 发布与发布后校验 | 经 `release.yml` 发布；npm `1.5.0` 可解析（`npm view caomei-ui@1.5.0 version`）；`v1.5.0` tag 与 GitHub Release 存在；CHANGELOG / `package.json` / 版本句一致；发布后文档站与 CDN 入口抽查 | ≈ 3 | M1-1 |
| **M1-3** | 发布收口 | 下游兼容复验与记录 | 记录自动 dispatch 的 `Downstream Compat` run 结论与三仓 revision（dependfix / caomei-auth / momei）；红因须归因；把三仓锁定版本指针更新到新版本（或记录仍未升级的原因） | ≈ 2 | M1-2 |
| **M2-1** | 模拟移动验收 | 设备视口模拟执行与记录 | 用 Playwright 设备预设（`devices['iPhone 12']` / `devices['iPhone SE']`，含移动 UA / DPR / `hasTouch`）执行 Phase 41 M5-4 清单：`dvh` 单位下的吸顶 / 底部条是否可见、`overflow` 滚动容器是否可滚、输入框 `autocomplete="one-time-code"` 属性与焦点行为；每条记「模拟结果 + 未覆盖原因」；产出记录文件 | ≈ 3 | 无 |
| **M2-2** | 模拟移动验收 | 依结果的修复或文档化 | 模拟发现的问题修复，或在 `mobile.md` 中英写明边界；真机清单的「未执行（无真机）」改为「模拟已执行（非真机）+ 真机未执行」；`docs:check:i18n-parity` 绿 | ≈ 4 | M2-1 |
| **M3-1** | 治理与文档收尾 | `typecheck:docs` 纳入阶段收口验证集 | 在[开发规范](../../standards/development.md) §11「质量门」的两条命令（`pnpm typecheck` / `pnpm typecheck:docs`）与[AI 协作规范](../../standards/ai-collaboration.md) §1 D 阶段自检句写入「阶段收口必须执行 `pnpm typecheck:docs`」；说明 `pnpm verify` 与 CI `Test` 的 Quality 作业已覆盖该命令，本项只补阶段收口验证集；本阶段执行至少一次并留痕 | ≈ 3 | 无 |
| **M3-2** | 治理与文档收尾 | 移动就绪矩阵 §3 回填 7 行 | 把矩阵中「源码有窄屏规则、§3 未登记」的 7 行（`transfer` / `popover` / `popconfirm` / `tooltip` / `cascader` / `time-picker` / `descriptions`）补进 `responsive.md` §3，矩阵「依据」列由「未登记」改为 `§3 #N`；中英同步；`check:design` / `docs:check` 绿 | ≈ 3 | 无 |
| **M3-3** | 治理与文档收尾 | NavBar / Tabbar 同页 landmark 提示 | NavBar 与 Tabbar 组件页中英各补一句「两者默认可访问名不同名（当前语言的「导航栏」/「主导航」），若显式设为同名 `label` 或透传同名 `aria-label`，同页会出现两个同名 `nav` landmark，需显式区分」（执行期事实修正：登记原文「`label` 默认同名」与实现及 locale 断言不符）；不改组件默认值 | ≈ 4 | 无 |
| **M4-1** | P2 组件 | Statistic 实现与测试 | 数值展示组件：`value` / 精度 / 千分位 / 前缀后缀 / 加载态；空值与非法输入降级；单测覆盖边界（0 / 负数 / 大数 / 非数字）；a11y 不引入多余 landmark | ≈ 6 | 无 |
| **M4-2** | P2 组件 | Statistic 文档面 | 中英组件页 + 示例 + 侧栏 / 总览 / 画廊 / 设计清单 §5 登记；`check:design` / `docs:check` 绿 | ≈ 8 | M4-1 |
| **M4-3** | P2 组件 | Countdown 实现与测试 | 目标时间倒计时：秒级刷新、`finish` 事件、自定义格式、卸载清理定时器；单测用假时钟覆盖跨秒 / 到点 / 回拨；SSR 下无 `window` 依赖 | ≈ 6 | 无 |
| **M4-4** | P2 组件 | Countdown 文档面 | 中英组件页 + 示例 + 侧栏 / 总览 / 画廊 / 设计清单 §5 登记；`check:design` / `docs:check` 绿 | ≈ 8 | M4-3 |
| **M4-5** | P2 组件 | P2 组件共用登记面 | `Statistic` / `Countdown` 的根导出、Nuxt 注册、a11y 夹具同批（**执行期事实修正**，对应 R2 提法中的 locale 项：两组件无语言兜底文案——`Statistic` 的数字 / 前后缀与 `Countdown` 的 `finishText` 均由使用方提供；且新增命名空间需同改 10 个语种文件 + `types.ts` + 中英台账共 13 文件，超单条 10 文件阈值，故不新增命名空间、台账维持）；`check:locale-keys` / `check:locale-ledger` / `check:nuxt` / `test:a11y` / `docs:check` / `check:build` 绿，导出后重跑 `pnpm build` 并做产物冒烟 | ≈ 6 | M4-1 / M4-3 |
| **M5-1** | 宽屏视觉基线 | 宽屏视口参数化与 `DataTable` 基线 | 为 `test/visual` 增加宽屏视口参数化，并新增**独立宽屏夹具段**（不改 `SAMPLE_SECTIONS` 的 1280 循环，避免多产 2 张）；采集 `DataTable` 在 1536 / 1920 的亮暗共 **4 张**基线；基线在与 CI 相同环境生成；断言沿用 `threshold 0.1` + `maxDiffPixels 100` | ≈ 5 | 无 |
| **M5-2** | 宽屏视觉基线 | `Form` 宽屏用例与口径同步 | 追加 `Form` 的 1536 / 1920 亮暗 4 张基线；[测试规范](../../standards/testing.md) 与 `playwright.visual.config.ts` 注释补宽屏用例说明；`pnpm test:visual` 全绿（既有 **46** 例 + 本阶段新增 8 例 = **54**） | ≈ 5 | M5-1 |
| **M6-1** | 下游升级兼容修复 | `DataTable` 表头行高回归修复与守卫 | 在 `CaomeiTooltipText` 包装下恢复 1.3.0 表头行高（momei 实测 32.59px；以真实浏览器计算样式或视觉基线断言）；不改 `cellTooltips` 默认值与 `mode="auto"` 语义；新增能区分修复前后的回归守卫；`pnpm test` / 定向 E2E / `pnpm test:visual` 通过 | ≈ 6 | 无 |
| **M6-2** | 下游升级兼容修复 | 1.4.0 消费方可见变化升级注意补录 | 新增 `docs/release-notes/1.4.0.md`，覆盖 Button 根节点 `Passthrough`、内容 `nowrap`、DataTable 表头 / 单元格 `TooltipText`、浮层 `inert`、Paginator / Select 几何、下游适配写法；每家下游至少一条可复现证据与链接；`pnpm lint:md:check` / `pnpm docs:check` 通过 | ≈ 4 | 无 |
| **M7-1** | 文档站窄屏修复 | 320 / 360 / 390 档横向溢出修复与复验 | 3 文件：`docs/.vitepress/theme/caomei-demo.css`（≤959px 隐藏设备预览、≤359px 隐藏主题预设切换）、`docs/examples/button/tooltip.vue`、`docs/i18n/en-US/examples/button/tooltip.vue`（`.demo-truncate` 改 `:global()` 使 220px 上限真正命中按钮）。验收：对 `pnpm docs:build` 产物按 320 / 360 / 390 / 768 四档扫描 `docs/components/*.md` 全部页面 + `guide/mobile` / `guide/mobile-readiness` / `guide/getting-started` + `plan/todo` / `plan/backlog` 的中英版本，断言每页 `document.documentElement.scrollWidth === window.innerWidth`；不改组件库源码 | ≈ 3 | 无 |
| **M7-2** | 文档站窄屏修复 | 设备预览选中态前景色修复 | `docs/.vitepress/theme/components/device-preview.vue` 的 `.device-preview__option[aria-pressed='true']` 前景由 `--caomei-color-primary-text`（柔和底蓝字）改为 `--caomei-color-primary-foreground`；验收 = **缺省（minimal）预设**下设备预览抽屉选中项亮暗两主题对比度 ≥ 4.5:1（修复前亮 1.3:1 / 暗 1.0:1；`caomei` 亮色 `primary` × `primary-foreground` 与在册 `primary-solid` 例外同色同值（4.17:1），风险等价；该配对不在 `preset-contrast` 常驻矩阵受检面（该矩阵只覆盖 `-solid` 配对），本句不新增例外登记），并回扫同类「实底 + 柔和底前景」配对（范围 `src/` + `docs/`，判据 = 0 处残留；复算 = 以 `background: var(--caomei-color-` 检索 `src/` 与 `docs/` 的样式声明（2026-11-24 快照），逐条命中须配对 `primary-foreground` / `on-solid` 或为无文本元素） | ≈ 1 | 无 |
| **M7-3** | 文档站窄屏修复 | 示例实底前景回扫修复 | `docs/examples/select/value-slot.vue` 与英文镜像的 `.selected-tag`：`--caomei-color-success`（暗色翻浅绿）作实底配字面量 `white`，暗色仅 1.74:1；改为 `--caomei-color-success-solid` + `--caomei-color-on-solid`（两态 5.02:1）。验收 = 该示例亮暗两主题下选中标签文字对比度 ≥ 4.5:1；全仓「自适应 tone 作实底 + 字面量白字」回扫 0 处残留 | ≈ 2 | 无 |

> 文件面为登记估算，实施时按[规划规范 §5](../../standards/planning.md) 的 10 文件阈值拆分。**M2 的「模拟」口径与 M4 / M5 / M6 的条目拆分若在实施中越阈值，按同一规则拆分并回填进度表。**

## 3. 阶段规则

- **任务粒度**：单条 ≤ 10 文件 / 800 行；计数回扫按[规划规范 §3.9](../../standards/planning.md) 覆盖 `todo.md` / `roadmap.md` / 本记录 / 索引摘要 / `.session`。
- **执行顺序建议**：先 M3（治理与文档，无依赖）与 M2（模拟验收，产出的边界会影响升级注意），再 M1（发布收口，必须最后做），M4 / M5 可与 M1 并行但须在发布前收口，避免发布后追加未验证变更。
- **发布口径**：本阶段**发布 `1.5.0`**（D0 ① 含 M1）。发布前必须满足：周回归在 HEAD `success`、安全告警 0、`pnpm verify` 全绿；周回归未绿则 M1-2 阻塞，**不得降级发布**。版本判定来自 8 个 `feat`，为 minor；不采用 `1.4.x` 人工覆盖。
- **2026-11-24 用户裁定**：本阶段**不执行 `1.5.0` 发布**，**初步计划 2026-11-29 前后发布**。M1-1 的门槛部分（周回归 / 安全告警 / `pnpm verify` 复核）与 M1-2 / M1-3 转为「待用户发布授权」；升级注意草稿已入库（`docs/release-notes/1.5.0.md`，文件顶部标注草稿、发布说明目录暂不登记）。
- **M2 表述纪律**：所有移动验收记录必须写「模拟（非真机）」；`mobile.md` 与组件页不得出现「真机通过」类表述；真机三项（iOS `dvh` 真实视口收缩、触摸滚动惯性、系统 OTP 自动填充）的未覆盖原因必须逐项写明。
- **质量门**：每条目 `lint` / `typecheck` / `typecheck:docs`（M3-1 落地后为固定项）/ 定向测试 / 必要 E2E / Review Gate；阶段末 `pnpm verify` + `pnpm test:visual`。
- **状态词**：条目表沿用 `待执行 / 已交付`；进度表用 `未开始` / `进行中` / `已闭环` / `已阻塞`。
- **Review Gate**：每条目至少一轮 `@code-reviewer`；未 `Pass` 不得提交；发布条目（M1-2）额外要求发布前门槛证据入记录。
- **文档**：组件能力变化同步中英组件页与设计登记；不虚构未实现能力；移动文档标注「模拟（非真机）」。
- **长期任务**：按[规划规范 §8](../../standards/planning.md)，阶段收口前与发布前各执行一轮门槛复核（`recurring.md`）并留痕。
- **版本升级兼容性**：后续版本升级按[发布指南](../../guide/release.md) §10.1 执行升级影响面评估——逐条分级 `BREAKING` / 消费方可见非 `BREAKING` / 仅内部；消费方可见变化必须写升级注意；涉及 DOM / 默认样式 / 交互时序时须跑下游视觉或关键流回归；下游反馈须回流 Backlog 或治理记录。
- **依赖**：不新增运行时依赖。

## 4. 载体同步与候选流转

- `backlog.md`：登记时迁出已登记候选——§1.6 的「宽屏视觉基线（1536 / 1920）」1 行 +「`typecheck:docs` 纳入阶段验证集」「移动就绪矩阵 §3 回填」「NavBar / Tabbar 同页 landmark 提示」3 行、§1.11 的 `Statistic` / `Countdown` 2 行，共 **6** 行（**登记时点**：候选池 42 → **36**；§1.6 17 → **13**、§1.11 10 → **8**）。不写 `→ Phase 42` 迁出标注（[规划规范 §7](../../standards/planning.md)）。**执行期追加（2026-11-23）**：回流 1.4.0 下游反馈的 P1 / P2 共 **6** 项——§1.6 4 项（Button 单元素根、Button 换行开关、CSS `@layer`、升级影响面评估自动化）、§1.1 1 项（`inert` 首击）、§1.8 1 项（三家下游 1.4.0 适配回收）；候选池 36 → **42**（36 + 6 = 42）。`xl` 断点、通用 Picker、国际化二期与其余候选维持。
- **归档时点（2026-11-24）**：`todo.md` 切到「当前无进行中阶段」并清空阶段段；`roadmap.md` §1 / 阶段行改为已完成并归档（6 条主线 / 17 条）；`todo-archive.md` 写入归档块并把 Phase 36 / Phase 37 迁入深度归档；`backlog.md` 新增 `1.5.0` 发布收口候选。登记时点的载体动作见下条（历史快照，不回改）。
- `todo.md`：新增 Phase 42 当前状态句、进度表与 **20** 条条目表（原登记 15 条 + 执行期追加 M6 2 条 + M7 3 条）；下游锁定版本指针维持三仓 `1.4.0`（2026-11-22 读数），待 M1-3 更新；下游反馈指针改为「已归集 + momei 页面级反馈待补」。
- `roadmap.md`：§1 当前态切到 Phase 42；阶段表新增 Phase 42 行（**7 条主线 / 20 条原子条目**；构成对账 3 + 2 + 3 + 5 + 2 + 2 + 3 = 20，原登记 5 条主线 / 15 条原子条目）。
- 治理索引：本记录登记一行；另登记 [caomei-ui 1.4.0 下游升级反馈研判](./2026-11-23-caomei-ui-1.4.0-downstream-feedback.md)。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 42（**20 条**，M7 追加后）。
- **M7 的来源**：用户 2026-11-24 直接裁定「文档站修复」，不经 Backlog 候选池，故 §4 的候选池计数不变。
- **事实修正（2026-11-24）**：`docs/release-notes/1.4.0.md` 的新增组件清单移除 `NavBar`（该组件首次随 `1.5.0` 发布），依据用户裁定「修正文档」。
- **发布**：登记 Release 条目（M1-2），不改 `release.yml` 触发模型。

## 5. Review Gate

- **R1（2026-11-23，`standard`，时间盒 ≤10 分钟）**：**Reject**（1 blocker / 6 warning / 5 suggest）。blocker：已登记的 M3 三项候选（`typecheck:docs` / 矩阵回填 / landmark 提示）仍留在 Backlog 候选池，且 §4 迁出计数不可复算（42 已含这 3 项，应迁出 6 行 → 36）。warning：提名期 `M4` / `M5` 与登记编号缺显式映射（同日两份文档 `M5` 两义）；进度表「容量」列 `N → N` 与「未开始」互斥；M5-1 体量约 12 张 PNG / 14 文件超阈值；M3-1 指向不存在的「阶段收口检查清单」；`.session` 的 `active_plan.feature` / `verification_state.reason` 仍为 Phase 41 残留；D1 ② 覆盖评估记录交付形态未声明。修复：删除 Backlog 6 行并改计数；补映射句与覆盖声明；容量列改 `N → 0`；M5 拆为「`DataTable` 4 张」+「视口参数化与 `Form` 4 张」；M3-1 点名 `development.md` 质量红线表与 `ai-collaboration.md` D 阶段自检句；`.session` 同步；suggest（设备预设、登记面补 locale / Nuxt / a11y、升级注意载体、长期任务轮次）同批落实。
- **R2（2026-11-23，`standard` delta，时间盒 ≤10 分钟）**：**Pass**（0 blocker / 3 warning / 3 suggest）。B1 与 W1 ~ W6 闭合；S1 ~ S4 落实，S5（阶段表行序）维持既有「按登记追加」约定。新增 warning 同批修：① M1-1 的「升级注意」载体应为 `docs/release-notes/1.5.0.md`（CHANGELOG 由 semantic-release 重写，直接写入会被覆盖）；② M5-1 需写明「独立宽屏夹具段、不改 `SAMPLE_SECTIONS`」，且视口参数化应前置到 M5-1；③ M4-2 / M4-4 补登记面后文件面约 14，超单条阈值——抽出 **M4-5 共用登记面**（locale / 根导出 / Nuxt / a11y），M4 变 5 条、阶段变 **15 条**（3 + 2 + 3 + 5 + 2 = 15）。suggest：`development.md` 节名改为 §11「质量门」；`todo.md` 条目名按登记名回填。
- **R3（2026-11-23，`quick` delta，时间盒 ≤5 分钟）**：**Pass**（0 blocker / 2 warning / 1 suggest）。W7 / W8 / W9 / S6 / S7 闭合；15 条在登记 / `todo` / `roadmap` / 索引 / `.session` 一致，M4 = 5 条不超单主线上限，Backlog 36 行不变，PNG 总数 8 自洽。warning 同批修：① `.session/runtime-state.json` 的 `current_item` / `verification_state.reason` 仍写「14 条」，改 15；② M5-2 的「既有 50 例」应为 **46**（`SAMPLE_SECTIONS` 16 × 2 + `FORM_AXIS_CASES` 7 × 2），收口后 54。suggest：M3-1 去掉行号定位，改为点名两条命令。
- **R4（2026-11-23，`standard` delta，时间盒 ≤10 分钟；实测约 4 分钟）**：**Pass**（0 blocker / 1 warning / 2 suggest）。P0 插队 M6 后 **6 条主线 / 17 条原子条目**在 `todo` / `roadmap` / 索引 / `.session` 一致；`check-stage-counts` / `check-stage-progress` 通过。warning（发布指南 §10.1 的升级注意要求缺「自本规则生效起」）已同批修复；suggest 见 [1.4.0 下游反馈研判记录](./2026-11-23-caomei-ui-1.4.0-downstream-feedback.md) §7。
