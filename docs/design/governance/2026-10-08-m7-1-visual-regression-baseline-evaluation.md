# M7-1 视觉回归基线立项评估

> 创建时间：2026-10-08
> 关联条目：[待办事项](../../plan/todo.md) Phase 20 **M7-1**（视觉回归基线立项评估）
> 依据：Phase 20 范围评估 [D9](./2026-10-07-next-stage-scope-evaluation-4.md)（2026-10-07 用户裁定「**上收 M7 立项评估**」）；[测试规范](../../standards/testing.md) §1 / §2.1 / §6；[M4 测试回归记录](./2026-09-28-m4-test-regression.md) §7（视觉回归基线当时作为独立候选延后）；Playwright 官方「Visual comparisons」文档（`https://playwright.dev/docs/test-snapshots` 与 `PageAssertions#toHaveScreenshot`，抓取于 2026-10-08）
> **边界**：**只出立项建议**——**不建实体基线、不改代码**（零 `src/**` 零 `test/**`）。生产者侧形态与阈值按官方文档与下游实证描述，**本轮不实际生成任何基线**。
> 快照：本仓 `ac21a46`；下游只读取证（**测量时点 2026-10-08 19:32 +08:00**）——dependfix `f48bb74`、momei `a5b8274b`（两仓工作区干净）。下游状态为**时点快照**，可能随并行会话推进。

---

## 1. 结论摘要

- **可行、成本可控，且不需引入外部服务**：caomei-ui 已具备承载条件——`@playwright/test@1.63.0` 已在 devDependencies、E2E 夹具与三视口 project 已就位、CI 已有 e2e 作业形态。采用 **Playwright 内置 `expect(page).toHaveScreenshot()`** + **仓库内冻结基线**即可落地，与两个下游（dependfix / momei）的既有实现**同构**。
- **定位是补足、不是替代**：现有装置覆盖**计算样式等价**（`capture:styles` 冻结基线）与**几何 / 像素采样断言**（E2E），但**无截图基线**；截图比对补的是「真实渲染结果整体像素」这一层。
- **建议形态（最小可用）**：独立 `playwright.visual.config.ts`（与 `test:e2e` 隔离）+ 仓库内 `__screenshots__` 冻结基线 + **固定环境** + **双轴容差** + 基线随源码同批评审；CI **先非阻断、稳定后转阻断**（复刻 dependfix 已跑通的转正路径）。
- **成本**：一次性建基线（夹具 + 若干用例 × 亮 / 暗 × 视口）；每次运行每 runner 约数分钟；基线 PNG 随仓库增长（可选 WebP 压体积）。
- **本轮不建实体基线**（条目非目标）；是否立项、取何形态由用户裁定（§9）。

---

## 2. 现状盘点（caomei-ui 已有回归装置与缺口）

> 装置以 [测试规范 §1](../../standards/testing.md#_1-测试分层) 分层为纲；「像素视觉面」指对**渲染结果整体像素**的比对。

| 装置 | 载体 | 覆盖 | 像素视觉面 |
|:---|:---|:---|:---:|
| 单元 / 组件交互 | Vitest + `@vue/test-utils`（`test/`） | props / emits / slots / composables 行为 | ❌ |
| 可访问性 | axe-core（`test/a11y`） | 组件级 a11y（例外清单外零违规） | ❌ |
| E2E（几何 + 采样） | Playwright（`test/e2e/*.e2e.ts`，**16 文件**） | 关键路径、响应式、浮层、焦点、禁用态几何；`tabs-indicator.e2e.ts` 有**局部 3 行像素采样** | ⚠️ 仅局部采样 |
| 计算样式等价 | `test/capture/`（`capture:styles` + `baseline.json`） | 声明式样式面**逐属性**比对（302 → 308 项） | ❌（非像素） |
| 文档站画廊回归 | `playwright.gallery.config.ts`（`test:e2e:gallery`） | 组件画廊渲染存在性与隔离 | ❌ |

**缺口**：**无通用截图基线**——真实渲染的「整体像素」无冻结基线；现有像素级断言仅 `tabs-indicator` 一处（**常驻**但**局部、非通用基线**，仅 3 行采样）。[M4 记录](./2026-09-28-m4-test-regression.md) §7 已将其登记为独立延后候选；Phase 19 的 Tabs 指示条视觉变更当时靠 `@ui-validator` 逐行像素**一次性**取证（该一次性探针不等同常驻基线）。

---

## 3. 形态对照

> A / B / C 三形态；B / C 的**精确成本未逐一实测**（本条目不建实体、不引入依赖），仅按机制与公开定位给对照。

| 形态 | 机制 | 优点 | 代价 / 风险 | 结论 |
|:---|:---|:---|:---|:---|
| **A. Playwright 内置 `toHaveScreenshot`** | 官方 [Visual comparisons](https://playwright.dev/docs/test-snapshots)：`pixelmatch` 比对；基线落仓库 `*-snapshots` / 自定义 `snapshotPathTemplate`；`--update-snapshots` 更新 | **零外部服务 / 零新依赖**；基线随仓库可 PR 评审；容差参数完备；与既有 E2E 同栈 | 需自管基线存储与固定环境；跨平台渲染差异须以「同环境生成基线」规避 | **推荐** |
| **B. 托管视觉服务**（Argos / Chromatic / Percy 等） | 上传截图到第三方，服务端比对 + 看板 | 有审查看板 / 历史趋势；不占仓库 | 引入外部账号 / 计费 / 数据外发；与「本仓无外部服务依赖」取向相悖；离线 / 内网不可用 | 备选（暂不取） |
| **C. 自托管 OSS**（lost-pixel / reg-suit / BackstopJS 等） | 额外工具链，自管存储（部分可对接 Figma / S3） | 灵活 | 引入第三方工具与维护面；与「内置已够用」重复 | 备选（暂不取） |

**取向**：形态 A 已由**两个下游实证跑通**（见 §6），是成本最低、与仓库既有技术栈最一致的选择。

---

## 4. 容差与稳定性策略

> 参数取自官方文档（默认值）与下游实证（收敛值）；**具体数值须在立项批次以本仓真实截图复标**，本节只给口径。

- **渲染确定化（官方默认 / 下游配置）**：`animations: 'disabled'`（停 CSS 动画 / 过渡 / Web Animations，默认即 disabled）、`caret: 'hide'`（隐藏光标，默认即 hide）、`scale: 'css'`（每个 CSS 像素一图点，默认即 css）。
- **双轴容差**（官方 [maxDiffPixels / threshold](https://playwright.dev/docs/test-snapshots#maxdiffpixels-and-threshold)）：
  - `threshold`（0 严格 ~ 1 宽松，**默认 0.2**，pixelmatch 的 YIQ 感知色差）——**色差轴**；
  - `maxDiffPixels`（可接受的不同像素**绝对数**）或 `maxDiffPixelRatio`（比例）——**面积轴**。
  - 下游取「**绝对 `maxDiffPixels`** + 收敛 `threshold`」：细粒度 token 改动（圆角 / 间距 / 色）不会被视口比例吞掉（详见 §6）。
- **固定环境矩阵**：chromium、固定 `viewport` / `deviceScaleFactor: 1`、`locale: 'zh-CN'`、固定 `timezoneId`、`colorScheme`、`reducedMotion: 'reduce'`（与既有 E2E 同口径，减少动效抖动）。
- **跨平台渲染（官方 warning）**：浏览器渲染随 OS / 版本 / 硬件 / 电源 / 无头模式而变——**基线必须在与 CI 相同的环境生成**（本仓 CI 为 `ubuntu-latest`；本地为 Windows / WSL2，环境不同）。未遵守会引入**假阳性**。
- **动态 / 易变区域**：`mask`（以纯色块遮盖，官方遮罩色默认 `#FF00FF`，可 `maskColor` 覆盖）或 `stylePath`（注入样式隐藏易变元素）；对 toast / 时间戳 / 随机 id 等须显式遮蔽。
- **快照命名**：默认名含 `browser-platform`（如 `-chromium-darwin`），多 project 时用 project 名；可用 `snapshotPathTemplate` 统一路径模板。
- **稳定性纪律**：**串行**（`workers: 1`）+ **不做重试**（`retries: 0`）——不稳定即失败并归因，不用重试掩盖抖动（下游口径）。

---

## 5. CI 集成与成本

- **独立作业**：与 `test:e2e` 隔离的独立 config / 作业，跑**构建产物**（如文档站 `docs:build` 产物或 `examples/` 夹具），避免与功能 E2E 的 `testMatch` / 断言语义混用（下游同构做法）。
- **基线存储**：**随仓库提交**（官方推荐 commit snapshots 目录），PR 中可直接 review 像素差异；失败产物 `-actual` / `-diff` 落 **gitignored** 目录（如 `test-results/visual/`），不污染工作区。
- **阻断策略**：**先非阻断**（`continue-on-error`，观测环境一致性），**首个全绿 run + 字体渲染一致性实证后转阻断**——dependfix 的转正依据即「首个 `ubuntu-latest` 全绿 run + 基线采集环境与 runner 字体渲染一致性已实证」。
- **成本画像**（估算，非实测）：
  - 一次性：建夹具 + 首批用例 + 采集并提交基线。
  - 每次运行：视觉用例数 × 视图数 ×（启动 + 截图比对），单 runner 约**数分钟**；串行会放大墙钟时间。
  - 存储：基线 PNG 随仓库增长（可选 `.webp` 无损压体积，官方支持）。
- **不进 `pnpm verify` 常驻链**：视觉比对需浏览器与构建产物，与 `capture:styles` / `test:e2e` 同类落位（独立命令 + CI / 周期回归承载）。

---

## 6. 下游参照（dependfix / momei 既有实证）

> 两下游**只读取证**，未修改其仓库。形态：Playwright 内置 `toHaveScreenshot` + 仓库内冻结基线 + 独立 config。

| 维度 | dependfix（`apps/platform`） | momei |
|:---|:---|:---|
| 配置 | `playwright.visual.config.ts`（独立 testDir / 端口 / SQLite / 认证态） | `playwright.visual.config.ts`（独立入口，`test:visual` / `test:visual:update`） |
| 基线 | `tests/visual/__screenshots__/`，**11 张 PNG**，随仓库提交 | `tests/visual/__screenshots__/`，**8 张 PNG**，随仓库提交 |
| 容差 | `threshold: 0.1` + `maxDiffPixels: 100` + `scale: 'css'` | `threshold: 0.2` + `maxDiffPixels: 200` + `scale: 'css'` |
| 确定化 | `animations: 'disabled'` / `caret: 'hide'` / `reducedMotion: 'reduce'` / 固定 viewport 1440×900、DPR 1、locale zh-CN、tz Asia/Shanghai | 同族配置（+ 动态区域 `[data-visual-mask]` 显式遮蔽） |
| 稳定性 | `workers: 1` / `retries: 0` | `workers: 1` / `retries: 0` |
| 阻断 | **已转阻断**（首个全绿 run `36602407382` 为转正依据） | `continue-on-error`（非阻断观测期） |

**关键实证（可复用口径）**：
- **绝对 `maxDiffPixels` 优于比例**：细粒度 token 改动（圆角 / 间距 / 颜色）方能被检出，而非被视口比例吞掉。
- **`threshold` 需收敛**：dependfix 记录「同明度色相 / 灰度替换」类实底色变在默认档可能逃逸（`neutral 实底 → 主色` 的色对 delta ≈ 1084）；收敛到 0.1 后可检出，抗噪由 Playwright `includeAA: false`（抗锯齿邻域判定）承担。
- **面积轴需收紧**：「少面积 × 高色差」变更（开关拇指 164 px）会被 `maxDiffPixels: 200` 吞掉，降至 100 后可检出。

**结论**：形态 A 在两下游已跑通并沉淀了阈值口径 → caomei-ui 采用**同构形态**的技术风险低、可复用其参数取舍经验。

---

## 7. 最小可用形态建议（MVP，供立项批次细化）

- **范围**：选**代表面**而非全量——核心组件 / 组合 × **亮 / 暗** × **1 ~ 3 视口**。
  - 候选组件：Button / Tag / Card / 字段族（Input / Select）/ DataTable / Tabs / 浮层（Dialog / DropdownMenu）/ 主题预设（`caomei` / `minimal`）。
  - 候选页面：文档站组件画廊或 `examples/` 首页（与既有 `test:e2e:gallery` 同源，减少新夹具）。
- **口径**：与 `capture:styles` **互补**——`capture:styles` 管**声明式样式逐属性等价**（改样式不动渲染时最灵），截图管**真实渲染整体像素**（组合 / 布局 / 字体 / 层叠的综合结果）。
- **纪律**：负向对照自证判别力（故意改一个 token / 几何 → 必须报差异）；受检面登记且不得静默收窄（下界守卫）；有意视觉变更须**同批** `--update-snapshots` 并 review 基线 diff。
- **接入**：独立命令（如 `test:visual` / `test:visual:update`）+ CI 作业（先非阻断）。
- **非目标**：不做全组件 × 全视口 × 全状态的全矩阵（成本高、维护重）；不引入外部视觉服务；不替代 `capture:styles` 与功能 E2E。

---

## 8. 风险与反面验证

| # | 风险 | 影响 | 缓解 |
|:-:|:---|:---|:---|
| R1 | **跨平台渲染差异**（字体 / 抗锯齿 / OS） | 本地生化基线在 CI 大量假阳性 | 基线**只在 CI 同环境生成**；固定环境矩阵；`includeAA` / 容差吸收抗锯齿 |
| R2 | **容差过松 → 假阴性** | 真视觉回归被吞（色变 / 小面积高色差） | 双轴口径（`threshold` 收敛 + 绝对 `maxDiffPixels`）+ **负向对照**自证（下游已实证） |
| R3 | **flaky**（并行渲染 / 动态内容 / 动画） | 噪声红、信任度下降 | 串行 + `retries: 0` + 禁动画 + `mask` / `stylePath` 显式遮蔽易变区域 |
| R4 | **基线维护成本** | 每次有意视觉变更需更新 + review 基线 | 与 UI 变更**同批**更新；基线 diff 纳入 Review Gate 面 |
| R5 | **仓库体积增长**（PNG） | 仓库膨胀 | 限定抽样面；可选 `.webp`；失败产物不入库 |
| R6 | **覆盖失衡**（只采样「稳定的少数」） | 重大区域无基线 | 受检面**登记 + 下界守卫**；未纳入面显式登记 |

**反面验证（不建基线的现状代价）**：现有像素面仅 `tabs-indicator` 一处局部采样，Phase 19 的 Tabs 指示条视觉变更（1px → 2px）只能靠 `@ui-validator` **一次性**逐行像素取证，无法常驻防回归；`capture:styles` 覆盖声明式样式面但**不覆盖渲染整体像素**（组合 / 布局 / 层叠）。故「截图基线」是当前装置矩阵中的明确空白。

---

## 9. 立项建议与待决策（供用户裁定，本记录不自行裁定）

> 本评估按 M7-1 边界**只出立项建议**。若裁定立项，按 [规划规范 §4](../../standards/planning.md) 另行分配阶段 / 条目并落地。

- **建议**：**立项**（成本可控、下游已跑通同构形态、装置矩阵有明确空白）。可按容量排在后续阶段或作为独立条目。
- **待决策**：
  | # | 决策点 | 选项 |
  |:-:|:---|:---|
  | D1 | **是否立项** | ① 立项（推荐）② 维持登记（继续以 `capture:styles` + 局部采样承接） |
  | D2 | **形态** | ① Playwright 内置 `toHaveScreenshot`（推荐）② 托管视觉服务 ③ 自托管 OSS |
  | D3 | **首批范围** | ① 核心组件抽样 × 亮暗 × 单视口（最小）② 含浮层 / 主题预设 / 多视口 |
  | D4 | **阻断策略** | ① 先非阻断、稳定后转阻断（推荐，同 dependfix）② 直接阻断 ③ 周期性非阻断 |
  | D5 | **容差初值** | ① 复用 dependfix 口径（`threshold 0.1` + `maxDiffPixels 100`）② 本仓重新复标 |
  | D6 | **基线存储** | ① 随仓库提交（推荐）② 产物 / artifact 存储 |

---

## 10. 质量门

> 纯文档 / 规划批次（零 `src/**` 零 `test/**`）；门禁以 `pnpm verify` 整链复跑为准；新记录须先 `git add` 才进入 `docs:check` 的受版本控制受检面。

- [x] `pnpm verify` exit 0（lint / lint:css / lint:md / typecheck / typecheck:docs / test / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿）
- [x] `lint:md:check` exit 0
- [x] `docs:check` 全绿（含 `links` / `structure` / `interpolation` / `line-count`）
- [x] `governance:check` exit 0（`check-governance-records` 记录与索引双向对账一致）
- [x] 零 `src/**` / 零 `test/**` 改动（本批为纯文档 / 规划批次）

---

## 11. Review Gate

- **结论**：R1 `standard` **`Pass`**（0 blocker / 0 warning / 1 suggest）。
- **轮次 / 范围**：第 1 轮，审本批 2 文件（新增记录 + 索引条目）diff。
- **实测用时**：发起 `2026-10-08T19:40:2x+08:00`、约 3 ~ 4 分钟，**未超** `standard` ≤ 10 分钟时间盒。
- **findings 处置**：
  - **RG-S1（suggest）**：§2 称 `tabs-indicator` 采样「一次性性质」与其文件自述「常驻回归」冲突 → **已修**：改为「**常驻**但局部、非通用基线」；「一次性」仅保留给 Phase 19 的 `@ui-validator` 探针。
- **审计核验（阶段性）**：官方文档转述（`toHaveScreenshot` / 默认 `threshold 0.2` / `animations`·`caret`·`scale` 默认 / `pixelmatch` / `includeAA: false` / OS warning）、本仓事实（`1.63.0` / 16 e2e / 无 `__screenshots__` / 302→308 采样）、下游参数（dependfix 11 基线 + 已阻断 / momei 8 基线 + `continue-on-error`）、门禁计数（136 记录 / 326 指针 / 288 页 / 329 md）逐项可复现。
- **未覆盖边界**：审计未复跑 `pnpm verify` 整链（按 `standard` 收敛到最相关分项）；未联网复核 GitHub run 页面；未运行下游视觉套件。
- **留痕**：`artifacts/review-gate/2026-10-08-phase20-m7-1.md`（本地态，git-ignored）。

---

## 12. 未覆盖边界

- **未实际生成任何截图基线**：本记录按官方文档与下游配置描述形态，容差数值为**下游口径引用**，须在立项批次以本仓真实截图**复标**。
- **未运行下游视觉套件**：dependfix / momei 的 config 与基线数为**只读静态取证**，未取本轮 run 结果。
- **托管 / 自托管形态（B / C）未逐一实测**：其精确成本、离线可用性与维护面仅按公开定位对照，未做 PoC。
- **未评估与既有 `capture:styles` / E2E 的用例级去重**：属立项批次的实现面。
- **规划编号**：本记录为评估，不分配阶段编号、不登记 `todo.md` 新条目；`todo.md` 的 M7-1 状态随本批回填。
