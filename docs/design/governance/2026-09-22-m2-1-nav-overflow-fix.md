# 文档站导航栏 768–959px 横向溢出修复（Phase 12 M2-1 后续）

> 状态：修复交付记录（2026-09-22）。**结论**：按用户裁定**方案 b**（收敛主题预设切换器标签 + 收紧导航项内边距，**保留导航版本项与切换器两处展示**）修复后，`/en-US/**` 在 768px 的横向溢出由 **146px → 0**；1440 / 1024 / 375 三档与 959 / 960 断点无回归；两处展示仍可见且可用。

## 1. 问题与归因

**问题**：M2-1 交付后，768px 下 `/en-US/**` 页面 `documentElement.scrollWidth 914 vs clientWidth 768`（溢出 146px）。

**归因（DOM 隔离实测，`@ui-validator` 与修复期各复现一次）**：

- 基线 914 → 仅移除 M2-1 新增导航版本项 → 847（**既有 79px**：既有英文导航 + `ThemePresetSwitcher`）→ 两者都移除 → 768。
- **归因更正（相对早期记录）**：早期记录（[m6-6 / m6-7](./2026-09-18-m6-6-m6-7-migration-docs-ui-validation.md)、[m6-8 各批](./2026-09-18-m6-8-group-a-ui-validation.md) 的「观察项」）把同一 79px 归因于 VitePress **内容列** `.content`（并据此在 `caomei-demo.css` 加了 `.vp-doc .content { min-width: 0 }`）。本次复核以 DOM 实测更正：该选择器在构建产物中**匹配 0 个元素**（`.vp-doc` 位于 `.VPDoc .content` **内部**；8 个原列为命中的页面实测 `.vp-doc .content` 与 `.vp-doc .content-container` 均为 `no-element`），属**死规则**，已随本次修复移除；真实成因是**导航栏** `.VPNavBar .content-body`。
- 即 **既有 79px + M2-1 版本项放大 67px**；越界区域为导航栏 `.content-body` 右侧（`VPNavBarMenu` → `VPNavBarExtra` → `theme-preset-switcher`）。

**修复期实测的横向构成（768px，en）**：`VPNavBarSearch` 176 + `VPNavBarMenu` 470（6 项、每项 `padding: 0 12px`）+ `VPNavBarExtra` 44 + `theme-preset-switcher` 114（标签 48 + 左边距 12）= 超出可用宽度。

## 2. 修复（方案 b）

仅**窄档**（`max-width: 959px`）生效，≥960px 保持默认主题原样：

| 载体 | 改动 | 节省 |
| --- | --- | --- |
| `docs/.vitepress/theme/components/theme-preset-switcher.vue` | 隐藏标签 `.theme-preset-switcher__label`；左边距 12px → 4px | ≈ 56px |
| `docs/.vitepress/theme/caomei-demo.css` | `.VPNavBar .VPNavBarMenuLink { padding: 0 5px; font-size: 13px; }` | ≈ 90px |

**两处展示均保留**：导航 `v0.2.0` 条目仍在（点击进入版本页）、主题预设 `<select>` 仍可见可交互（仅其文本标签隐藏）。

## 3. 复验（`@ui-validator`，服务 `pnpm docs:preview`）

| 核对项 | 实测 |
| --- | --- |
| 768px 无横向溢出 | 目标页 `scrollWidth - clientWidth = 0`（`/en-US/guide/version-policy` 由 **914/146 → 768/0**）；补测 `/en-US/standards/`、`/en-US/components/`、`/en-US/plan/`、`/en-US/design/` 均 0 |
| 三档不回归 | 1440 / 1024 / 375 × 9 路径共 27 组全部 diff = **0** |
| 两处展示仍在 | 导航含 `v0.2.0`（rect 在视口内、点击跳转成功）；`select` 可见可交互（L=678 R=736 W=58 H=30）；仅标签 `display: none` |
| 切换器功能 | 选 `caomei` → `dataset.preset=caomei`、`localStorage` 保持、刷新后仍生效；主色 `rgb(37,99,235)` → `rgb(230,57,70)` |
| ≥960px 未受影响 | 1440px 导航项 `padding: 0 12px` / `font-size: 14px`，标签回到 `display: block`，切换器 `margin-left: 12px` |
| 断点边界 | 959px 命中收敛值、960px 命中默认值（精确切换、无叠加空档） |
| **原失败页类补测** | 历史记录列为命中的 en 组件详情页/专题页共 8 条（`components/data-table`、`components/paginator`、`components/button`、`components/avatar`、`components/date-picker`、`components/data-view`、`guide/primevue-migration`、`guide/getting-started`）在 768px 均 **diff = 0**（修复后复测） |
| 可访问名（窄档） | ≤959px 时可见标签 `display: none`，但 `<select>` 带 `aria-label`（zh `主题预设` / en `Theme preset`，与可见文案同源）；≥960px 标签可见且 `aria-label` 一致 |
| 暗色 | 768px 暗色下版本页与导航无破损、diff = 0 |
| console / pageerror | 有效页集合上均为 0（观测到的 4 条错误全部来自探针清单里误列的 404 路径，见 §5） |

## 4. 边界

- 修复只覆盖**文档站导航栏的窄档布局**，不改变组件库产物与任何公开契约。
- 窄档断点取 **959px**（VitePress 默认主题在 960px 切换导航形态）：该字面量不在组件库宽度查询白名单（640 / 768 / 1024）适用范围内——该白名单是 `src/` 组件的**实现约束**（见[响应式设计「字面量白名单」](../responsive.md)、[开发规范 §7](../../standards/development.md) 与[设计规范 §2.3](../design-spec.md)，三处取值须一致），**无对应机检**；文档站主题 CSS 不受其约束（本条为口径声明，避免后续误判）。
- `font-size: 13px` 与 `padding: 0 5px` 为窄档取值（≤959px），≥960px 一律回到默认主题值。
- 复验未覆盖 Safari / Firefox / WebKit、真实移动触摸与 >1440px；复验记录与截图落 `test-results/` 与 `.temp/`（gitignored），关键实测值已摘录至本节。

## 4.1 历史观察项闭环

本次修复**同时关闭**以下历史记录中长期挂账的「观察项」（其叙述保留，不回改历史快照）：

- [m6-6 / m6-7 UI 验证记录 §3](./2026-09-18-m6-6-m6-7-migration-docs-ui-validation.md)：`en-US 文档页 @768 横向溢出（847 / 768）`——本记录 §1 更正其归因，§3 补测其列举的页类（含 `/en-US/guide/primevue-migration`）。
- [m6-8 A / B / C 组 UI 验证记录](./2026-09-18-m6-8-group-a-ui-validation.md) 的同源观察项：已随同一修复关闭。
- `caomei-demo.css` 中基于错误归因的 `.vp-doc .content { min-width: 0 }` 死规则：本批移除。

## 5. 过程发现（非本修复引入）

- 探针清单误列 `/en-US/standards/development`（英文规范子页**按 §10 不本地化**，仅 `standards/index.md` 为英文入口）与 `/en-US/guide/`（英文指南无 `index.md`，导航直接指向 `getting-started`）→ 二者 404 属设计口径，非缺陷；配置内链接（`check:config-links`，156 条）均为有效页面。
