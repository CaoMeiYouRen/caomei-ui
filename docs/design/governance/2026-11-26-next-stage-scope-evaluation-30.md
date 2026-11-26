# 下一阶段范围评估（第三十轮）

> 时间：2026-11-26
> 触发：用户指令「开始规划下阶段待办」。
> 基线：`master` = `552a2059`（Phase 44 已归档、**当前无进行中阶段**；`latest` 维持 `1.4.0`）。
> 性质：**范围评估**（取证 + 候选盘点 + 主线草案 + 待裁定项）；**不登记阶段、不分配阶段编号**。阶段编号按[规划规范 §4](../../standards/planning.md#_4-阶段与条目命名)在用户授权启动时取「当时最大编号 + 1」。

## 1. 基线事实

- **阶段状态**：Phase 44（Tour / QRCode / ContextMenu / Splitter / Anchor）已于 2026-11-26 归档，10 条全部交付，本阶段不发布；`backlog.md` 中 `1.5.0` 发布收口处于「已决策待窗口」，**2026-11-29 之前不列入规划**。
- **版本**：`package.json` = `1.4.0`；`v1.4.0..HEAD` 共 **19 个 `feat` 提交**（`git log --oneline --no-merges v1.4.0..552a2059 | grep -c " feat"`），下一次发布为 minor `1.5.0`；发布窗口未到，本轮不纳入。
- **下游版本**：caomei-auth `1.4.0`、momei `^1.4.0`；dependfix 为 monorepo（`dependfix-monorepo@0.1.0`），未单独锁版本。
- **外部输入（2026-11-26 只读）**：open issues **0** / open PRs **0** / Dependabot open **0** / Code Scanning open **0**（`gh issue list --state open`、`gh pr list --state open`、`gh api .../dependabot/alerts?state=open`、`gh api .../code-scanning/alerts?state=open`）。
- **长期任务**：`recurring.md` 最近一轮门槛复核为第 47 轮（Phase 42 收口）；Phase 43 / 44 归档均按「不发布、留给发布窗口」未执行收口轮，**门槛复核已到期**（见 §4 风险与前置条件，不占阶段条目）。

## 2. 候选盘点

盘点口径：只取 `backlog.md` §1 在册候选（共 **38 条**：1.1 = 3 / 1.4 = 4 / 1.5 = 7 / 1.6 = 18 / 1.8 = 2 / 1.9 = 1 / 1.11 = 3；1.2 / 1.3 / 1.7 / 1.10 为 0）。逐条均有落点，无静默豁免；分数沿用 `backlog.md` 现行双轴评分（[规划规范 §3.1](../../standards/planning.md#_3-1-优先级双轴评估与排期-2026-11-25-用户裁定)）。

### 2.1 首排 / 排期（候选池前半）

| 候选 | 分数 | 象限 | 本轮判定 | 依据 |
|:---|:-:|:-:|:---|:---|
| `1.5.0` 发布收口 | 5 / 4 | 首排 | **本轮排除** | 用户裁定 2026-11-29 之前不列入规划；窗口未到，留待后续 |
| 可选 peer「未安装且未使用」阻断构建 | 4 / 2 | 排期 | **候选**（去留见 D3） | Phase 44 M2-1 实测：`chart` / `editor` / `qrcode` 三族同构，未安装即构建期报错；`pnpm check:optional-peer` 可复算 |
| `glob` 跨 major 覆盖（安全公告） | 5 / 3 | 排期 | **维持排期** | 2026-11-26 `pnpm why glob`：受影响链仅 `js-beautify` → `glob@13.0.6`、`@vercel/nft` → `glob@13.0.7`（均在 `9.0.0–14.0.1` 区间）；`commitizen` → 7.2.3 在区间外；`@lint-md/cli` 已随上游升到 **14.0.4**（区间外）。剩余两链的上游未支持 14.0.2，本轮无可行修复 |
| 版本升级影响面评估自动化 | 4 / 3 | 排期 | **维持排期** | 触发条件 = 用户裁定启动，**不绑定发布窗口**；当前无该裁定 |
| 三家下游 1.4.0 适配回收 | 4 / 2 | 排期 | **维持排期** | 触发条件 = `1.5.0` 发布后，本轮不满足 |
| Carousel | 4 / 2 | 排期 | **候选**（去留见 D1 / D2） | csv-token-analytics 有 `src/components/ui/carousel.tsx` 与 `embla-carousel-react@^8.6.0`（2026-11-26 复核），但**无页面引用**；按快速开发期新组件方向取 4 / 2 |
| Watermark | 4 / 2 | 排期 | **候选**（去留见 D5） | 库间对齐（Element Plus / TDesign / Vant / Varlet）；momei 检索到的 `watermark` 均为 AI 提示词文本，**无组件用量** |
| Menubar / NavigationMenu / HoverCard | 4 / 2 | 排期 | **候选**（去留见 D1） | Reka 2.11.0 原语现成；csv-token-analytics 有同名 shadcn 文件但**无页面引用** → 依据为快速开发期方向与库间对齐 |

### 2.2 快速评估 / 延后（候选池后半，逐条有落点）

- **组件增强（1.1）**：Rating 半星以外形态（2/1，延后，触发条件未命中）；浮层 `inert` 首击吞点击（3/2，延后，等下游真实反馈）；`CaomeiCascader` portal 样式失效（3/2，延后，用户未裁定观感问题）。
- **国际化（1.4）**：二期 7 语（3/2，延后）；长期扩容（2/1，延后）；复数与插值（3/2，延后）；RTL（3/1，延后，须单独立项）。
- **移动端（1.5）**：键盘聚焦完整可见（2/1）、Toolbar 769–1023 档（2/1）、通用 Picker（3/2）、Sticky 吸顶（2/2）、软键盘遮挡（3/2）、Stepper 极窄排版（2/1，用户已裁定暂不修复）、真机验收（3/2，等待外部条件）——全部维持延后。
- **基建治理（1.6 余项）**：单 Demo 抽屉预览（3/1）、文档站多版本（2/1，用户已裁定暂不启动）、ui-validator 资产 follow-up（2/1）、Tailwind preset（2/1）、Storybook（2/1）、`conventional-changelog` 8 升级（2/1，上游阻塞）、示例外链守卫漏判面（2/1）、CI 镜像迁移检测（3/2，待触发）、`typescript` 7（3/2，工具链阻塞）、dev hydration 守护（3/2）、`xl` 断点（3/1）、changelog `!` 补丁撤回（2/1）、英文总览镜像列表（2/1）、Phase 39 归档块缺「未覆盖边界」（2/1）——全部维持延后。
- **下游 / 图标 / 高级组件余项**：momei 页面级反馈（3/2，等外部输入）、I5 运行时图标 peer（2/1，条件触发）——延后；§1.11 拟纳入 A / B 案（映射见 §3；尚未登记）。

### 2.3 候选覆盖声明

逐小节计数：1.1 = 3、1.2 = 0、1.3 = 0、1.4 = 4、1.5 = 7、1.6 = 18、1.7 = 0、1.8 = 2、1.9 = 1、1.10 = 0、1.11 = 3，合计 **38**。

- **§2.1 = 8 条**（`1.5.0` 发布收口 / 可选 peer / `glob` / 版本升级影响面评估自动化 / 三家下游 1.4.0 适配回收 / Carousel / Watermark / Menubar·NavigationMenu·HoverCard）。
- **§2.2 = 30 条**：1.1 三条 + 1.4 四条 + 1.5 七条 + 1.6 余项十四条（18 − 4 条已列于 §2.1）+ 1.8 momei 一条 + 1.9 I5 一条 = 3 + 4 + 7 + 14 + 1 + 1 = 30。
- 8 + 30 = 38，**无未落点候选**。

## 3. 主线草案（唯一映射口径）

> 本节是「候选 → 主线」的唯一权威映射；§2 只提供分数与依据，不再重复列举。

### 方案 A（推荐）：新组件第二批（5 主线 / 10 条）

| 主线 | 原子条目 | 候选来源 |
|:---|:---|:---|
| M1 Carousel 轮播 | M1-1 实现与测试（`embla-carousel-vue` 运行时依赖）；M1-2 文档、locale 与回归 | §1.11 Carousel |
| M2 Watermark 水印 | M2-1 实现（自建 canvas / 防篡改观察）；M2-2 文档与回归 | §1.11 Watermark |
| M3 Menubar 菜单栏 | M3-1 实现（Reka `Menubar*` 封装）；M3-2 文档与回归 | §1.11 Menubar |
| M4 NavigationMenu 导航菜单 | M4-1 实现（Reka `NavigationMenu*` 封装）；M4-2 文档与回归 | §1.11 NavigationMenu |
| M5 HoverCard 悬停卡片 | M5-1 实现（Reka `HoverCard*` 封装）；M5-2 文档与回归 | §1.11 HoverCard |

- **容量**：5 主线 / 10 条，符合[规划规范 §6](../../standards/planning.md#_6-阶段容量)（3–6 主线 / 10–15 条）。
- **依赖决策（A / B 两案共用）**：Carousel 需引入 `embla-carousel-vue@8.6.0`（`peerDependencies.vue = ^3.2.37`，2026-11-26 `pnpm view` 复核；下游 csv-token-analytics 已用 `embla-carousel-react@^8.6.0`，同内核）；这是 Reka 之外新增的第二个运行时依赖，登记时须写明供应链边界；其余四条零新增运行时依赖。
- **不发布**：与 Phase 44 一致，发布收口仍留窗口（2026-11-29 之后）。

### 方案 B：四组件 + 可选 peer 改进（5 主线 / 10 条）

- M1 Carousel（2）、M2 Menubar（2）、M3 NavigationMenu（2）、M4 HoverCard（2）、M5 可选 peer「未安装且未使用」改进（2：子路径 / 运行期加载方案落地 + 三族消费方 fixture 与文档）。
- 取舍：去掉 Watermark（无真实下游用量），换取解决 `chart` / `editor` / `qrcode` 消费方构建阻断的结构问题。

### 方案 C：质量与治理批次（3 主线 / 7 条）

- M1 打包与依赖（可选 peer 改进 2 条；`glob` 跨 major 评估 1 条，若上游仍未支持则只评估）。
- M2 组件缺陷与文档一致性（`cascader` portal 样式 1 条；英文总览镜像列表 1 条；Phase 39 归档块边界 1 条）。
- M3 治理守卫补强（归档格式守卫 1 条：6 项小节 / 行数口径机检）。
- 取舍：不新增组件，适合维护期；7 条低于[规划规范 §6](../../standards/planning.md#_6-阶段容量)建议的 10–15 条下限，与当前快速开发期取向不一致，因此不推荐；`glob` 若上游仍未支持 14.0.2，则该条交付物为「评估结论 + 阻塞点与解禁触发」而非覆盖实现。

## 4. 推荐与非目标

- **推荐 A**：快速开发期取向（新组件优先）+ 用户 2026-11-25 指定方向；容量 10 条；风险集中在 Carousel 的运行时依赖（D2）与 5 个组件的文档 / E2E 面。
- **非目标（A 案）**：发布（`1.5.0` 收口留窗口）、可选 peer 结构改进、`glob` 覆盖、真机验收、国际化二期 / RTL、`xl` 断点、质量与治理存量（只留 Backlog）、破坏性 API。
- **风险与前置条件**：① **门槛复核欠 2 轮**（`recurring.md` 最近为第 47 轮 / Phase 42 收口；Phase 43、Phase 44 收口均无执行记录，§8 未提供「不发布免执行」豁免）。两轮合并为**一次复核轮**（同一门槛、同一取证基线，2026-11-26），作为下阶段**登记前置条件**，执行记录写入 `recurring.md`，不占阶段条目；② Watermark / Menubar / NavigationMenu / HoverCard 无真实下游用量，若用户在 D5 改判可替换为方案 B。

## 5. 待用户裁定（≤ 5 项）

**依赖说明**：D2 在 **D1 = A / B** 时生效（B 案同样含 Carousel）；D3 / D5 仅在 **D1 = A** 时生效——D1 = B 时 D3 自动并入、D5 不适用（B 案不含 Watermark）；D1 = C 时 D2 / D5 不适用。

| 编号 | 问题 | 默认落定 |
|:---|:---|:---|
| D1 | 主线组合：A（5 新组件）/ B（4 组件 + 可选 peer）/ C（质量治理） | A |
| D2 | Carousel 实现：`embla-carousel-vue` 运行时依赖 / 自建（零依赖）/ 本轮不做 Carousel | `embla-carousel-vue` |
| D3 | 可选 peer 结构改进是否并入本阶段；若并入，修法取 ① 拆独立子路径入口 / ② 运行期说明符 + 强制安装文档 / ③ 提升为 `dependencies` | A 案下不并入（留 Backlog 排期）；B 案下并入并取 ①（子路径入口，类型与构建最干净） |
| D4 | 发布窗口：本阶段明确不发布，11-29 后是否允许「执行期追加」发布收口主线 | 不发布；窗口到期后另行评估 |
| D5 | Watermark 去留：保留 / 替换为可选 peer 改进条（Watermark 无真实用量证据） | 保留 |

## 6. Review Gate

- **R1**（2026-11-26，`standard`，时间盒 ≤ 10 分钟）：**Reject** —— 1 blocker（§2.3 覆盖声明 6 / 32 与表格实际 8 / 30 不符）+ 6 warning（映射重复且 B 案编号错、版本影响面依据与 Backlog 矛盾、glob 证据过时、D 项默认对 D1 的依赖未标注、证据命令不可复算、门槛复核欠账口径）。修复后转 R2（`quick`）。

## 7. 候选证据复核记录（2026-11-26）

- `gh search code "Carousel" --owner CaoMeiYouRen` → csv-token-analytics `src/components/ui/carousel.tsx`（`embla-carousel-react@^8.6.0`），无页面引用。
- `gh search code "Menubar" --owner CaoMeiYouRen`、`gh search code "NavigationMenu" --owner CaoMeiYouRen`、`gh search code "HoverCard" --owner CaoMeiYouRen` → 仅 csv-token-analytics 的 shadcn 同名文件，无页面引用。
- `gh search code "watermark" --owner CaoMeiYouRen` → momei 4 个文件（`utils/shared/ai-visual-asset.ts` / `utils/shared/volcengine-protocol.ts` / `server/utils/ai/tts-volcengine.ts` / `server/utils/ai/gemini-provider.ts`）均为 AI 提示词 / 协议文本，无组件用量。
- `gh issue list --state open` / `gh pr list --state open` / `gh api repos/CaoMeiYouRen/caomei-ui/dependabot/alerts?state=open` / `gh api repos/CaoMeiYouRen/caomei-ui/code-scanning/alerts?state=open` → 全部 0（2026-11-26）。
- `pnpm why glob` → `13.0.6`（js-beautify）/ `13.0.7`（@vercel/nft）仍在公告区间；`7.2.3`（commitizen）与 `14.0.4`（@lint-md/cli）在区间外。
