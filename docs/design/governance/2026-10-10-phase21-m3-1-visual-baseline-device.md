# Phase 21 M3-1：Playwright 视觉回归基线装置与首批基线

> 创建时间：2026-10-10
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 21 **M3-1**（视觉基线落地）
> 依据：用户 2026-10-10 裁定 D10（**立项落地**）；[M7-1 视觉回归基线立项评估](./2026-10-08-m7-1-visual-regression-baseline-evaluation.md) §4 / §5 / §7
> 边界：本批为**装置与首批基线**（配置 / 规格 / 基线 PNG）；CI 接入与文档归 **M3-2**；**不改组件行为**（零 `src/**`）。

---

## 1. 交付

- 新增 **`playwright.visual.config.ts`**：视觉回归基线专用配置（与 `playwright.config.ts` / `playwright.gallery.config.ts` 隔离）。
- 新增 **`test/visual/components.visual.ts`**：首批规格（受检面登记 + 下界守卫 + 亮暗两态 + 负向对照开关）。
- 新增 **`test/visual/__screenshots__/components.visual.ts/`**：**16 张冻结基线 PNG**（8 组件 × 亮 / 暗），随仓库提交。
- `package.json` 新增脚本：**`test:visual`** / **`test:visual:update`**。
- `tsconfig.node.json` 的 `include` 增补 `playwright.visual.config.ts`（与既有根配置同处，供 typecheck / eslint 解析）。

## 2. 设计

### 2.1 固定环境（评估 §4）

chromium（Playwright 1.63.0 绑定）· viewport **1280×800** · `deviceScaleFactor: 1` · `locale: zh-CN` · `timezoneId: Asia/Shanghai` · `colorScheme: light` · `reducedMotion: reduce`；暗色由用例设 `document.documentElement[data-theme=dark]` 切换。

### 2.2 容差与确定化（评估 §4，双轴）

- `expect.toHaveScreenshot`：`threshold: 0.1`（**色差轴**，检出实底色变）+ `maxDiffPixels: 100`（**面积轴**，绝对像素数，不被视口比例吞掉）+ `animations: 'disabled'` + `caret: 'hide'` + `scale: 'css'`。
- **串行 + 不重试**：`workers: 1` / `retries: 0`（不稳定即失败并归因）。
- **基线路径模板**：`{testDir}/__screenshots__/{testFileName}/{arg}{ext}`（单 project，不带 platform 后缀）。
- 失败产物落 gitignored 的 `test-results/visual/`（`outputDir`）。

### 2.3 受检面与判别力纪律（评估 §7）

- **受检面登记**：`SAMPLE_SECTIONS`（8 个核心静态组件默认态：Button / Tag / Checkbox / Switch / RadioButton / Input / Select / Slider）× 亮暗。
- **下界守卫**：`MIN_SECTIONS = 8`——登记表被静默收窄即失败。
- **抽样原则**：只取**静态、确定性**默认态，避开日期 / 随机内容；日期类组件（Calendar / DatePicker）不在首批。
- **负向对照**：`VISUAL_NEGATIVE_CONTROL=1` 注入结构性覆盖（`.fixture__state` padding），应使全部截图用例报差异——用于自证比对具判别力（**非常驻**）。
- **互补定位**：`capture:styles` 管声明式样式逐属性等价、E2E 管几何 / 交互，本套管**真实渲染整体像素**。

### 2.4 夹具复用

复用既有 E2E 夹具（`test/e2e/fixtures/`，Vite 即时编译 `src/`），经 CLI `--port 4601` 独立探活（避开主 E2E 4501 与画廊 4173），不新增夹具。

## 3. 验证

- **基线生成**：`pnpm test:visual:update` → 17 passed（写 16 张基线 + 1 条下界守卫）。
- **可复现**：`pnpm test:visual` 连续两次 → **17 passed**（0 差异）。
- **判别力（负向对照）**：`VISUAL_NEGATIVE_CONTROL=1 pnpm test:visual` → **16 张截图用例全部报差异**、exit 1（仅下界守卫用例通过）；撤去开关后复跑 17 passed。
- **静态检查**：`npx eslint playwright.visual.config.ts test/visual/components.visual.ts` 0 error；`pnpm typecheck`（`vue-tsc --noEmit`）通过。
- `check:planning-numbers` 0 命中（规格 / 配置注释与测试名无规划编号）。
- **V 阶段（`@ui-validator`）**：本批为**测试装置**（零 `src/**`、无可见 UI 改动），浏览器侧验证由 `test:visual` 的 Chromium 实渲承担，**未另走 `@ui-validator`**（按「无 UI 影响时显式说明跳过」口径登记）。

## 4. 边界与未覆盖

- **基线生成环境 = 本地 Linux 容器**（非 `ubuntu-latest`）：浏览器渲染随 OS / 字体 / 版本而变，**CI 上可能假阳性**。按评估 §5 **CI 先非阻断**（M3-2），首个 CI run 后按需重冻结基线；本地生成仅为「装置可用 + 判别力自证」。
- **首批为最小代表面**（8 组件 × 亮暗 × 单视口）；**未纳入**：日期 / 时间类组件（含时间漂移）、浮层类（需交互开合）、多视口、主题预设（`caomei` / `minimal`）——按容量后续扩面（登记 + 下界守卫）。
- **不进 `pnpm verify` 常驻链**（需真实浏览器），与 `capture:styles` / `test:e2e` 同类落位。
- **未纳入与既有装置的用例级去重**：本批为新增独立层。

## 5. 质量门

- [x] `pnpm test:visual` **17 passed**（可复现，0 差异）
- [x] 负向对照 `VISUAL_NEGATIVE_CONTROL=1` → **16 失败**（判别力自证）
- [x] `npx eslint`（新增文件）0 error；`pnpm typecheck` 通过
- [x] 零 `src/**` 改动（本批为测试装置 / 配置 / 基线）

## 6. Review Gate

- **结论**：R1 `standard` **`Pass`**（0 blocker / 1 warning / 3 suggest）。
- **轮次 / 范围**：第 1 轮，审本批 23 文件（装置 + 16 基线 + 配置 / 脚本 + 文档）。
- **findings 处置**：
  - **RG-W01（warning）**：基线生成环境（本地 Linux 容器）与 CI（`ubuntu-latest`）不一致 → **已登记并延期**：本批按设计不接线 CI（`test:visual` 未进 `pnpm verify`），M3-2 先非阻断接入，首个 CI run 后按需重冻结基线（§4）。
  - **RG-S01（suggest）**：记录未显式声明 V 阶段处置 → **已修**：§3 补「浏览器侧验证由 `test:visual` 承担、未另走 `@ui-validator`（零 UI 影响）」。
  - **RG-S02（suggest）**：提交信息须说明生成物来源与拆分依据 → **采纳**：提交 body 注明 16 基线由 `test:visual:update` 生成、与装置同提交，批次按 M3-1 拆分。
  - **RG-S03（suggest）**：`MIN_SECTIONS` 守卫语义可再收紧 → **不采纳**：基线缺失会由 `toHaveScreenshot` 比对阶段兜底失败，加文件存在断言收益有限。
- **审计核验**：装置参数 / 固定环境 / 串行不重试 / `snapshotPathTemplate` / `outputDir`（gitignored）/ 端口不冲突 / 基线入库与体积（72 K，无产物误入库）/ 判别力（负向对照 16 失败）/ 与主 E2E 互不干扰 / 未进 `verify` 链 / `tsconfig.node.json` 增补必要性，均独立复核通过。
- **未覆盖边界**：未在 CI 实跑（RG-W01 延期 M3-2）；未跑 `pnpm verify` 全量（采信调用方 exit 0）。
- **留痕**：`artifacts/review-gate/2026-10-10-phase21-m3-1.md`（本地态，git-ignored）。
