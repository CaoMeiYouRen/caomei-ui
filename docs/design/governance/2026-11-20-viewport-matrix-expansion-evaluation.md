# 验收视口矩阵扩面评估（宽屏与主流移动档）

> 创建时间：2026-11-20
> 触发：用户指出当前验收视口上限 1280 与 1024 断点不符合 1080p / 2K / 4K 的实际使用情况，要求调查主流分辨率与组件库断点，并评估工作量与归属。
> 性质：**评估记录，不构成阶段登记**。决策落点为 Phase 38 执行期追加 M4-3（[登记批次](./2026-11-20-phase38-registration.md) §1.1）与 [Backlog](../../plan/backlog.md) §1.6 / §3。

## 1. 口径：物理分辨率与 CSS 视口

浏览器布局使用 CSS px，等于物理分辨率除以显示缩放：

- 1920×1080 @125% → 1536×864
- 1920×1080 @150% → 1280×720
- 2560×1440 @100% → 2560×1440
- 3840×2160 @150% → 2560×1440
- 3840×2160 @200% → 1920×1080

因此「4K 支持」在多数缩放设置下实际是「1920 或 2560 CSS px 支持」；3840 CSS px 的使用场景很少。依据：[MDN devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)。

**当前口径澄清**：caomei-ui 的 `1024` 是最后一档断点，不是支持上限；`1280` 是验收视口上限。宽于 1024 的视口沿用桌面默认形态，问题是**未验证**与**缺少宽屏档语义**，不是硬性截断。

## 2. 主流分辨率读数

| 端 | 视口 | 占比 | 来源 |
|:---|:---|:---|:---|
| 桌面 | 1920×1080 | 27.82% | StatCounter 2026-10 |
| 桌面 | 1536×864 | 9.13% | StatCounter 2026-10 |
| 桌面 | 1366×768 | 7.48% | StatCounter 2026-10 |
| 桌面 | 1280×720 | 4.44% | StatCounter 2026-10 |
| 桌面 | 2560×1440 | 3.79% | StatCounter 2026-10 |
| 桌面 | 1920×1080 | 50.23% | Steam 2026-09 |
| 桌面 | 2560×1440 | 21.82% | Steam 2026-09 |
| 桌面 | 2560×1600 | 5.46% | Steam 2026-09 |
| 桌面 | 3440×1440 | 3.23% | Steam 2026-09 |
| 桌面 | 3840×2160 | 5.05% | Steam 2026-09 |
| 移动 | 414×896 | 12.67% | StatCounter 2026-10 |
| 移动 | 360×800 | 8.57% | StatCounter 2026-10 |
| 移动 | 384×832 | 7.24% | StatCounter 2026-10 |
| 移动 | 390×844 | 5.33% | StatCounter 2026-10 |
| 移动 | 393×873 | 4.43% | StatCounter 2026-10 |

**读数结论**：

- 桌面 CSS 视口集中在 **1920 与 1536**（StatCounter 合计约 37%）；当前验收上限 1280 两者都未覆盖。1536×864 正是 1920×1080 在 125% 缩放下的结果。
- 2K（2560×1440）在一般 Web 流量约 3.79%，在 Steam 硬件样本约 21.82%；4K 在 Steam 约 5.05%。「2K/4K 不少」在桌面性能用户中成立，但不能把 Steam 样本外推到全部 Web 流量。
- 移动端前两名是 **414×896（12.67%）与 360×800（8.57%）**；当前矩阵的 390×844 只排第四（5.33%）。
- StatCounter 的 800×600（8.85%）属异常 / 嵌入式流量，不纳入判断。

## 3. 主流组件库断点

| 库 | 断点（min-width） | 最宽档 | 说明 |
|:---|:---|:---|:---|
| Tailwind CSS | 640 / 768 / 1024 / 1280 / 1536 | 1536 | mobile-first |
| Bootstrap 5 | 576 / 768 / 992 / 1200 / 1400 | 1400 | 容器 max-width 1320 |
| Ant Design | 576 / 768 / 992 / 1200 / 1600 / 1920 | 1920 | Grid 七档（xs <576） |
| Element Plus | 768 / 992 / 1200 / 1920 | 1920 | xs <768 |
| MUI | 600 / 900 / 1200 / 1536 | 1536 | xs 0 |
| Vuetify | 600 / 840 / 1145 / 1545 / 2138 | 2138 | `xxl` >2138，覆盖 4K / 超宽 |
| Varlet | 768 / 992 / 1200 / 1920 | 1920 | xs <768 |
| PrimeFlex | 576 / 768 / 992 / 1200 | 1200 | PrimeVue 自身无布局断点表 |
| Vant | 无桌面断点 | — | 移动优先，375 设计宽 + `px → vw` |

**结论**：桌面向组件库的「最宽档」集中在 1200–1920；只有 Vuetify 明确给出 >2138 的档位。多数库对 2K/4K 的处理是「流式布局 + 容器 max-width」，不新增断点。caomei-ui 的 3 档（≤640 / ≤768 / 默认 ≥1024）低于这一区间；但它的桌面优先 `max-width` 写法与多数库的 mobile-first `min-width` 不是同一坐标系，不能只比数字。

## 4. 工作量估算

| 方案 | 内容 | 估算文件 / 行 | 用时 | 运行成本 | 风险 |
|:---|:---|:---|:---|:---|:---|
| **A 验收扩面** | 新增 4 个**定向**档（1536×960、1920×1080、360×800、414×896），只跑 `responsive.e2e.ts`；矩阵守卫改为定向档清单；[响应式设计](../responsive.md) §4 同步 | 6–8 / 150–250 | **0.5–1.5 天** | 单档 22 个实例 × 4 = **88 个新增实例**；仅周回归 | 低；可能暴露宽屏缺陷 |
| **B 宽屏视觉** | A + 2–3 个 1920 视觉用例（DataTable / Dialog / Form）× 亮暗 | +3–5 文件、+4–6 PNG | +1–2 天 | 视觉 job 增加用例 | 中；基线维护 |
| **C `xl` 断点** | A + `Col` 新增 `xl`（建议 ≥1536）与容器 / 分栏 / 表格密度规则 | 10–15 / 300–600 | +3–5 天 | 运行时无感；公共 API 变更 | 中高；需设计决策与迁移 |
| **D 全量宽屏** | 1536 / 1920 进入全量矩阵 | 配置少量 | — | 用例实例接近翻倍；周回归 +5–10 分钟 | 高；flaky / 成本 |

**A 的边界**：零 `src/**`、零运行时改动、不改断点、不改全量矩阵、不改视觉基线；E2E 不在 PR CI，只在周回归执行，因此 PR 反馈成本不变。若新档暴露既有宽屏缺陷，按缺陷另立修复条目，不混入 M4-3。

## 5. 决策

- **A → Phase 38 M4-3**（执行期追加）：范围与验收见[登记批次](./2026-11-20-phase38-registration.md) §2；阶段构成 10 → 11 条（4 条主线 / 11 条原子条目；2 + 3 + 3 + 3 = 11）。
- **B 宽屏视觉基线 → Backlog §1.6**：触发 = 宽屏布局出现真实回归，或下一次视觉基线批次。
- **C `xl` 断点 → Backlog §1.6**：触发 = 用户裁定或出现 1536+ 宽屏布局需求；未定规则前不加空断点。
- **D 全量矩阵宽屏化 → Backlog §3 不纳入**：实例接近翻倍、flaky 风险显著上升；定向档已覆盖宽屏形态。

## 6. Review Gate

**R5（`quick`，2026-11-20）**：**Pass** —— 0 blocker / 0 warning / 0 suggest。

- 审查范围：分辨率读数、九库断点、A/B/C/D 工作量估算与归属决策；抽查 StatCounter 1920×1080 27.82% / 移动 414×896 12.67% / Steam 4K 5.05%，以及 Tailwind 1536 / Ant 1920 / Vuetify 2138 / PrimeFlex 1200，均一致。
- 验证：`check:planning-numbers` 0 命中、`check:stage-counts` 4 主线 / 11 条、`check:governance-records` / `docs:check:links` / `lint-md` 全绿。
- 未覆盖：未实跑新增 4 档 E2E（属 M4-3 交付面）；Vuetify 页面为 JS 渲染，其读数按点时快照采信。
- 证据记录：`artifacts/review-gate/2026-11-20-phase38-registration.md` Round 5。

## 7. 来源

- [StatCounter Desktop Screen Resolution](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide)（2026-10 读数，2026-11-20 抓取）
- [StatCounter Mobile Screen Resolution](https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide)（2026-10 读数，2026-11-20 抓取）
- [Steam Hardware & Software Survey](https://store.steampowered.com/hwsurvey/)（2026-09 读数，2026-11-20 抓取）
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Bootstrap Breakpoints](https://getbootstrap.com/docs/5.3/layout/breakpoints/)
- [Ant Design Grid](https://ant.design/components/grid)
- [Element Plus Layout](https://element-plus.org/en-US/component/layout.html)
- [MUI Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [Vuetify Display & Platform](https://vuetifyjs.com/en/features/display-and-platform/)
- [Varlet Col](https://github.com/varletjs/varlet/blob/main/packages/varlet-ui/src/col/docs/en-US.md)
- [PrimeFlex Setup](https://primeflex.org/installation)
- [Vant Advanced Usage](https://github.com/youzan/vant/blob/main/packages/vant/docs/markdown/advanced-usage.en-US.md)
- [MDN devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)
