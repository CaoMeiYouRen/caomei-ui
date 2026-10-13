# Phase 23 M1-1：视觉基线受检面扩面（拉丁 / 跨字体回退路径）

> 创建时间：2026-10-13
> 阶段条目：Phase 23 M1-1（主线 M1 视觉基线收口；候选来源 = Backlog §1.6「视觉基线受检面扩面」）
> 前序：[Phase 22 M1-2 记录](./2026-10-12-phase22-m1-2-visual-baseline-first-ci-run.md)（转阻断 + 该记录 §4 登记的「拉丁文本零覆盖」缺口）

## 1. 结论摘要

- **交付**：视觉回归基线受检面由 **8 个静态组件 × 亮暗**（16 张基线）扩为 **8 个组件面 + 3 段字体路径面 × 亮暗**（**22 张基线**，新增 6 张）；受检面登记表（`SAMPLE_SECTIONS`）新增 3 项，下界守卫 `MIN_SECTIONS` 8 → **11**，并新增**字体路径面仍在登记表内**的定向断言（防「只保下界、悄悄删掉字体面」）。
- **覆盖的路径**（此前零覆盖，见 M1-2 §4）：① **拉丁字形**（纯拉丁按钮文本 / 纯拉丁占位符）；② **同流跨字体回退**（CJK + 拉丁混排，一段文本命中两个字体）。
- **判别力已自证**（两类负向对照，见 §3）：① 常驻结构性对照（`VISUAL_NEGATIVE_CONTROL=1`）**22 / 22 采样面失败**；② **定向字体对照**（临时覆盖字体 token）**恰好 6 / 6 新字体面失败、16 / 16 旧 CJK 面通过**——证明新面覆盖的是**新路径**而非重复覆盖。
- **覆盖证明**（CDP 平台字体，见 §4）：新增面实际由 **DejaVu Sans** 渲染（拉丁路径），对照的旧面由 **WenQuanYi Zen Hei** 渲染（CJK 路径）；混排面**同时命中两个字体**（跨字体回退链）。

## 2. 受检面与变更

| 采样面 | 文本 | 覆盖路径 |
|:---|:---|:---|
| `ds-font-latin`（新增） | `Save changes` | 拉丁字形（按钮文本） |
| `ds-font-latin-input`（新增） | `Enter your email`（占位符） | 拉丁字形（字段族 / 占位符色与字号） |
| `ds-font-mixed`（新增） | `保存 Save changes 取消 Cancel` | 同流跨字体回退（CJK + 拉丁） |
| 既有 8 面（button / tag / checkbox / switch / radio-button / input / select / slider） | 全 CJK | 保持原覆盖（对照） |

- 夹具：`test/e2e/fixtures/app.vue` 新增 `#visual-font-path` 段（三段 `fixture__state`，纵向排列 + 定宽），**追加在模板末尾**，不改动既有 DOM 顺序约定；新增 `fontLatinInput` ref 与 `#visual-font-path` 布局规则。
- 装置：`test/visual/components.visual.ts` 登记表 + 下界 + 字体面定向断言；`playwright.visual.config.ts` 未改动（环境 / 容差 / 串行口径沿用）。
- **基线 diff 纪律**：`test:visual:update` 后 `git status` 只出现 **6 个新增 PNG**（`font-latin-button` / `font-latin-input` / `font-mixed-button` × 亮暗），**既有 16 张基线零改动**（符合「扩面只增不改」的比对纪律）。

## 3. 判别力（两类负向对照）

1. **常驻结构性对照**：`VISUAL_NEGATIVE_CONTROL=1 pnpm test:visual` → 注入 `.fixture__state { padding: 24px }`，**22 / 22 采样面失败**、2 个守卫用例通过（exit 1）。证明比对器对结构性覆盖具判别力（沿用既有开关，不留常驻）。
2. **定向字体对照**（本条目新增的取证，**一次性**；注入规则已移除，**不可从仓库直接复算**，复算须按本节口径临时注入两条 token 覆盖后再还原）：临时在 `#visual-font-path` 上覆盖**两条字体消费链**——
   `--caomei-font-sans: 'DejaVu Serif', serif`（组件根规则直接消费）与 `--caomei-field-font-family: 'DejaVu Serif', serif`（字段族经 `field-shell.css` 间接消费）——
   实测 **6 failed / 18 passed**：失败面恰为 3 段字体面 × 亮暗；既有 8 个 CJK 面 × 亮暗（16 项）全部通过。取证后移除临时规则并复跑全绿（`git diff` 复核仅剩本条目预期改动）。
3. **过程中发现并修正的判别力不足**：混排面初版文本为 `保存 Save 取消`（拉丁仅 4 字形），字体替换后差异像素**低于面积轴 `maxDiffPixels: 100`** → 该面在字体覆盖上**无判别力**（表现为「对照通过」）。修正为 `保存 Save changes 取消 Cancel`（拉丁 20 字形）后，同对照下该面转为失败。**口径**：新增采样面的判别力必须在**最严容差轴**下自证，不能以「基线稳定」代替。
4. **两条字体消费链**（本轮实测）：直接消费 `--caomei-font-sans` 的组件（如 button / tag）与经 `--caomei-field-font-family: var(--caomei-font-sans)` 间接消费的字段族（`src/styles/field-shell.css`）**不共享同一处覆盖点**——只覆盖前者时字段族面**不报差异**（本轮实测 4 / 6 失败）。凡「字体路径」类扩面，负向对照须**同时覆盖两条链**。

## 4. V 阶段取证（CDP 平台字体，2026-10-13）

取数方式：CDP `CSS.getPlatformFontsForNode`（Chromium 渲染器报告的**实际命中字体 + 字形数**；CSS 声明值恒为 token 栈，不能证明路径被覆盖）。探针与产物为本地态（`test-results/visual-font-probe.mjs` / `.json`，gitignored）：

| 采样面 | 文本 | 实际字体（familyName × glyphCount） |
|:---|:---|:---|
| `#ds-button-default`（**对照：首批 CJK 面**） | 提交操作 | `WenQuanYi Zen Hei` × 4 |
| `#ds-font-latin`（新增） | Save changes | `DejaVu Sans` × 12 |
| `#ds-font-latin-input`（新增） | Enter your email | `DejaVu Sans` × 16 |
| `#ds-font-mixed`（新增） | 保存 Save changes 取消 Cancel | `DejaVu Sans` × 20 + `WenQuanYi Zen Hei` × 4 |

- 字形数自洽：`Save changes` = 12、`Enter your email` = 16、混排面拉丁 20 + CJK 4 = 24。
- 结论：新增面**确实**渲染在拉丁字体上（旧面对照为 CJK 字体），混排面**确实**走跨字体回退 → 覆盖成立，且与旧面**不同源**（非重复覆盖）。
- 容器字体环境：CJK 回退 `fonts-wqy-zenhei`、拉丁 `DejaVu Sans`（CI 侧字体包口径见 M1-2 §3.4；基线生成环境须与 CI 一致，本条目沿用该纪律）。

## 5. 载体同步

- `docs/standards/testing.md` §2.1（视觉回归基线条）：受检面构成与「字体路径面」口径同步。
- `docs/plan/todo-archive.md`：M1-1 状态回填（与本节 Review Gate 结论同批）。
- `docs/design/governance/index.md`：本记录登记。
- `test/visual/__screenshots__/components.visual.ts/`：**新增 6 张冻结基线**随仓库提交。
- Backlog：§1.6「视觉基线受检面扩面」已随 Phase 23 登记迁出（本条目 + M1-2 承载），不新增行。

## 6. 质量门

- `pnpm verify` **exit 0**（117 文件 / 2301 例；含 lint / lint:css / lint:md / typecheck / test / build / docs / governance 全链）。
- `pnpm test:visual` **24 passed**（22 采样面 + 2 守卫；0 差异）；`pnpm test:visual:update` 生成 6 张新基线。
- `pnpm test:e2e` **318 passed**（夹具新增段未破坏既有 E2E；共享夹具的 DOM 顺序假设不受影响）。
- `pnpm lint:md:check` exit 0；`pnpm governance:check` exit 0。
- 零 `src/**` 改动（本条目只动夹具 / 视觉装置 / 基线 / 文档）。

## 7. Review Gate

- audit-depth：`standard`（测试装置 + 共享夹具 + 冻结基线）。时间盒：≤ 10 分钟。

### 7.1 结论（2026-10-13）

- **R1 `standard` `Pass`**（**0 blocker / 0 warning / 2 suggest**；实测约 **3 分 31 秒**，未超时间盒）。
- 审计方独立抽验：`pnpm test:visual` 24 passed / 0 差异；`VISUAL_NEGATIVE_CONTROL=1` → 22 失败 / 2 守卫通过（exit 1）；`pnpm governance:check` exit 0（`check-governance-records` 158 / 348）；受检面 ↔ 基线一一对应（11 × 亮暗 = 22 = 实际 PNG 22，id / 文件名零漂移）；基线 diff 仅 6 个新增、既有 16 张零改动；零 `src/**`；`todo.md` 的 M1-1 未被提前标为完成。
- suggest 处置（同批收口）：
  - **F1**（记录 §7 引用不存在的 §7.1）→ 已由本节回填闭合。
  - **F2**（一次性取证不可复算）→ §3 已补「一次性 / 规则已移除 / 不可从仓库直接复算」口径。
- 审计工件：`artifacts/review-gate/2026-10-13-phase23-m1-1-visual-font-path-expansion.md`（本地态、gitignored）。

## 8. 未覆盖边界（显式登记）

1. **组件与形态维度未纳入**（属 M1-2）：日期 / 浮层组件、多视口、主题预设（`caomei` / `momei` / `minimal`）——按条目拆分各自重冻结。
2. **字体族覆盖限本容器 / 本镜像**：仅证明「拉丁路径由 DejaVu Sans 渲染、CJK 由 WenQuanYi Zen Hei 渲染」这一环境事实；换镜像（Ubuntu 26.04 迁移）须按既定检测点重冻结基线。
3. **`system-ui` 与 `-apple-system` 的具体解析结果未逐项区分**：CDP 只报最终命中字体；不同 OS 上 `system-ui` 指向不同族，属环境变量而非本库契约。
4. **未做「字体缺失」负向场景**（如移除拉丁字体后回退到 CJK 字体）——属环境构造，未纳入常驻面。
