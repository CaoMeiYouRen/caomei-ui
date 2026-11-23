# Phase 42 登记批次：发布收口、浏览器模拟移动验收、治理收尾与 P2 / 宽屏基线

> 创建时间：2026-11-23
> 触发：用户就[第二十七轮范围评估](./2026-11-23-next-stage-scope-evaluation-27.md) D0 ~ D4 裁定 **① / ② / ② / ③ / ①**（M1 + M2 + M3 / 不做真机 / 纳入宽屏基线 / P2 两件 / 国际化二期维持候选），并备注「真机验收采用浏览器模拟移动端的分辨率」。
> **本记录是 Phase 42 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权启动时已有最大编号 Phase 41 + 1 = **Phase 42**（[规划规范 §4](../../standards/planning.md)）。
- **5 条主线 / 15 条原子条目**：发布收口 **3** / 浏览器模拟移动验收 **2** / 治理与文档收尾 **3** / P2 组件 **5** / 宽屏视觉基线 **2**；构成对账 3 + 2 + 3 + 5 + 2 = 15。
- **裁定到构成的映射**：
  - D0 ① 给出 M1 + M2 + M3（3 主线 / 8 条）。
  - D2 ② 追加 **M5 宽屏视觉基线**（+2 条）——该候选原触发条件为「宽屏出现真实回归或下一次视觉基线批次」，本轮由用户明确授权作为「下一次基线批次」。
  - D3 ③ 追加 **M4 P2 两件**（+5 条：两件各「实现 / 文档」4 条 + 共用登记面 1 条），对应评估记录 D0 ④ 的构成。
  - D4 ① 使国际化二期维持 Backlog，不进入本阶段。
  - 故最终为 **5 主线 / 15 条**（8 + 2 + 5），落在[规划规范 §6](../../standards/planning.md) 的主线 3–6 条与条目建议 10–15 条区间内。
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
| **M3-3** | 治理与文档收尾 | NavBar / Tabbar 同页 landmark 提示 | NavBar 与 Tabbar 组件页中英各补一句「同页组合时 `label` 默认同名，会出现两个同名 `nav` landmark，需显式区分」；不改组件默认值 | ≈ 4 | 无 |
| **M4-1** | P2 组件 | Statistic 实现与测试 | 数值展示组件：`value` / 精度 / 千分位 / 前缀后缀 / 加载态；空值与非法输入降级；单测覆盖边界（0 / 负数 / 大数 / 非数字）；a11y 不引入多余 landmark | ≈ 6 | 无 |
| **M4-2** | P2 组件 | Statistic 文档面 | 中英组件页 + 示例 + 侧栏 / 总览 / 画廊 / 设计清单 §5 登记；`check:design` / `docs:check` 绿 | ≈ 8 | M4-1 |
| **M4-3** | P2 组件 | Countdown 实现与测试 | 目标时间倒计时：秒级刷新、`finish` 事件、自定义格式、卸载清理定时器；单测用假时钟覆盖跨秒 / 到点 / 回拨；SSR 下无 `window` 依赖 | ≈ 6 | 无 |
| **M4-4** | P2 组件 | Countdown 文档面 | 中英组件页 + 示例 + 侧栏 / 总览 / 画廊 / 设计清单 §5 登记；`check:design` / `docs:check` 绿 | ≈ 8 | M4-3 |
| **M4-5** | P2 组件 | P2 组件共用登记面 | `Statistic` / `Countdown` 的 locale 命名空间与台账、根导出、Nuxt 注册、a11y 夹具同批；`check:locale-keys` / `check:nuxt` / `test:a11y` / `docs:check` 绿 | ≈ 6 | M4-1 / M4-3 |
| **M5-1** | 宽屏视觉基线 | 宽屏视口参数化与 `DataTable` 基线 | 为 `test/visual` 增加宽屏视口参数化，并新增**独立宽屏夹具段**（不改 `SAMPLE_SECTIONS` 的 1280 循环，避免多产 2 张）；采集 `DataTable` 在 1536 / 1920 的亮暗共 **4 张**基线；基线在与 CI 相同环境生成；断言沿用 `threshold 0.1` + `maxDiffPixels 100` | ≈ 5 | 无 |
| **M5-2** | 宽屏视觉基线 | `Form` 宽屏用例与口径同步 | 追加 `Form` 的 1536 / 1920 亮暗 4 张基线；[测试规范](../../standards/testing.md) 与 `playwright.visual.config.ts` 注释补宽屏用例说明；`pnpm test:visual` 全绿（既有 **46** 例 + 本阶段新增 8 例 = **54**） | ≈ 5 | M5-1 |

> 文件面为登记估算，实施时按[规划规范 §5](../../standards/planning.md) 的 10 文件阈值拆分。**M2 的「模拟」口径与 M4 / M5 的条目拆分若在实施中越阈值，按同一规则拆分并回填进度表。**

## 3. 阶段规则

- **任务粒度**：单条 ≤ 10 文件 / 800 行；计数回扫按[规划规范 §3.9](../../standards/planning.md) 覆盖 `todo.md` / `roadmap.md` / 本记录 / 索引摘要 / `.session`。
- **执行顺序建议**：先 M3（治理与文档，无依赖）与 M2（模拟验收，产出的边界会影响升级注意），再 M1（发布收口，必须最后做），M4 / M5 可与 M1 并行但须在发布前收口，避免发布后追加未验证变更。
- **发布口径**：本阶段**发布 `1.5.0`**（D0 ① 含 M1）。发布前必须满足：周回归在 HEAD `success`、安全告警 0、`pnpm verify` 全绿；周回归未绿则 M1-2 阻塞，**不得降级发布**。版本判定来自 8 个 `feat`，为 minor；不采用 `1.4.x` 人工覆盖。
- **M2 表述纪律**：所有移动验收记录必须写「模拟（非真机）」；`mobile.md` 与组件页不得出现「真机通过」类表述；真机三项（iOS `dvh` 真实视口收缩、触摸滚动惯性、系统 OTP 自动填充）的未覆盖原因必须逐项写明。
- **质量门**：每条目 `lint` / `typecheck` / `typecheck:docs`（M3-1 落地后为固定项）/ 定向测试 / 必要 E2E / Review Gate；阶段末 `pnpm verify` + `pnpm test:visual`。
- **状态词**：条目表沿用 `待执行 / 已交付`；进度表用 `未开始` / `进行中` / `已闭环` / `已阻塞`。
- **Review Gate**：每条目至少一轮 `@code-reviewer`；未 `Pass` 不得提交；发布条目（M1-2）额外要求发布前门槛证据入记录。
- **文档**：组件能力变化同步中英组件页与设计登记；不虚构未实现能力；移动文档标注「模拟（非真机）」。
- **长期任务**：按[规划规范 §8](../../standards/planning.md)，阶段收口前与发布前各执行一轮门槛复核（`recurring.md`）并留痕。
- **依赖**：不新增运行时依赖。

## 4. 载体同步与候选流转

- `backlog.md`：迁出已登记候选——§1.6 的「宽屏视觉基线（1536 / 1920）」1 行 +「`typecheck:docs` 纳入阶段验证集」「移动就绪矩阵 §3 回填」「NavBar / Tabbar 同页 landmark 提示」3 行、§1.11 的 `Statistic` / `Countdown` 2 行，共 **6** 行（候选池 42 → **36**；§1.6 17 → **13**、§1.11 10 → **8**）。不写 `→ Phase 42` 迁出标注（[规划规范 §7](../../standards/planning.md)）。`xl` 断点、通用 Picker、国际化二期与其余候选维持。
- `todo.md`：新增 Phase 42 当前状态句、进度表与 15 条条目表；下游锁定版本指针维持三仓 `1.4.0`（2026-11-22 读数），待 M1-3 更新。
- `roadmap.md`：§1 当前态切到 Phase 42；阶段表新增 Phase 42 行（5 条主线 / 15 条原子条目；构成对账 3 + 2 + 3 + 5 + 2 = 15）。
- 治理索引：本记录登记一行。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 42（15 条待执行）。
- **发布**：登记 Release 条目（M1-2），不改 `release.yml` 触发模型。

## 5. Review Gate

- **R1（2026-11-23，`standard`，时间盒 ≤10 分钟）**：**Reject**（1 blocker / 6 warning / 5 suggest）。blocker：已登记的 M3 三项候选（`typecheck:docs` / 矩阵回填 / landmark 提示）仍留在 Backlog 候选池，且 §4 迁出计数不可复算（42 已含这 3 项，应迁出 6 行 → 36）。warning：提名期 `M4` / `M5` 与登记编号缺显式映射（同日两份文档 `M5` 两义）；进度表「容量」列 `N → N` 与「未开始」互斥；M5-1 体量约 12 张 PNG / 14 文件超阈值；M3-1 指向不存在的「阶段收口检查清单」；`.session` 的 `active_plan.feature` / `verification_state.reason` 仍为 Phase 41 残留；D1 ② 覆盖评估记录交付形态未声明。修复：删除 Backlog 6 行并改计数；补映射句与覆盖声明；容量列改 `N → 0`；M5 拆为「`DataTable` 4 张」+「视口参数化与 `Form` 4 张」；M3-1 点名 `development.md` 质量红线表与 `ai-collaboration.md` D 阶段自检句；`.session` 同步；suggest（设备预设、登记面补 locale / Nuxt / a11y、升级注意载体、长期任务轮次）同批落实。
- **R2（2026-11-23，`standard` delta，时间盒 ≤10 分钟）**：**Pass**（0 blocker / 3 warning / 3 suggest）。B1 与 W1 ~ W6 闭合；S1 ~ S4 落实，S5（阶段表行序）维持既有「按登记追加」约定。新增 warning 同批修：① M1-1 的「升级注意」载体应为 `docs/release-notes/1.5.0.md`（CHANGELOG 由 semantic-release 重写，直接写入会被覆盖）；② M5-1 需写明「独立宽屏夹具段、不改 `SAMPLE_SECTIONS`」，且视口参数化应前置到 M5-1；③ M4-2 / M4-4 补登记面后文件面约 14，超单条阈值——抽出 **M4-5 共用登记面**（locale / 根导出 / Nuxt / a11y），M4 变 5 条、阶段变 **15 条**（3 + 2 + 3 + 5 + 2 = 15）。suggest：`development.md` 节名改为 §11「质量门」；`todo.md` 条目名按登记名回填。
- **R3（2026-11-23，`quick` delta，时间盒 ≤5 分钟）**：**Pass**（0 blocker / 2 warning / 1 suggest）。W7 / W8 / W9 / S6 / S7 闭合；15 条在登记 / `todo` / `roadmap` / 索引 / `.session` 一致，M4 = 5 条不超单主线上限，Backlog 36 行不变，PNG 总数 8 自洽。warning 同批修：① `.session/runtime-state.json` 的 `current_item` / `verification_state.reason` 仍写「14 条」，改 15；② M5-2 的「既有 50 例」应为 **46**（`SAMPLE_SECTIONS` 16 × 2 + `FORM_AXIS_CASES` 7 × 2），收口后 54。suggest：M3-1 去掉行号定位，改为点名两条命令。
