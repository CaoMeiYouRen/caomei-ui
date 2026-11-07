# 升级到 1.0

本页面向把 `caomei-ui` 从 0.x 升到 **1.0.0** 的消费方，给出逐版本段的升级注意、对外披露的已知限制与升级检查表。

> 事实源：版本变更以仓库根 [CHANGELOG](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/CHANGELOG.md) 对应段为准；兼容承诺与冻结面见[版本与兼容策略](./version-policy.md)；从 PrimeVue 迁移的组件差异见[从 PrimeVue 迁移](./primevue-migration.md)。本页不重复映射表，也不承诺 CHANGELOG 之外的行为。

## 升级路径与版本段

### 0.6.0 → 0.7.0

- **新增组件**：`Alert`、`Chart`、`Tooltip`、`Menu`、`Breadcrumb`、`Row` / `Col`；`Chart` 为可选 peer 按需加载。
- **locale 形态**：内建语言改为「预注册 + 按需子路径」；`zh-CN` / `en-US` 预注册，其余语言从 `caomei-ui/locale/<code>` 引入并调用 `registerLocale()`。0.x 不承诺语义化兼容，该形态变更未列入 `BREAKING CHANGES`；直接引用过旧语言聚合入口的消费方仍需按[内建文案与语言](../components/locale.md)改写。
- **响应式**：修复 769–1023px 空档并扩面视口矩阵；在该区间自定义断点的页面需要复核。
- 其他为新增能力与内部重构，不改变既有组件契约。

### 0.7.0 → 1.0.0

- **1.x 兼容承诺**：公开 props / events / slots、`exports` 13 键、包根导出名、`--caomei-*` token、locale 命名空间与 `InputNumber` 的 `step` 语义进入冻结面；破坏性变更只随 `major` 发布并给弃用期（见[版本与兼容策略](./version-policy.md)）。
- **主题与颜色角色**：新增 `sakura` / `forest` / `ink` 三套预设；新增 `--caomei-color-<tone>-text` 与 `--caomei-color-control-border`，控件边界与语义色文本改用新角色。
- **DataTable 行为收口**：表头全选只作用当前页；`lazy` 下选择 / 展开须显式 `rowKey`；横向滚动容器键盘可达。
- **Button 状态与语言**：hover / active 由既有 token 派生（默认预设三态对比度 ≥ 4.5:1）；内建 10 语。
- **运行时要求**：`engines.node` ≥ 22。

## 1.0 升级注意

以下 4 条来自 CHANGELOG 的「升级注意」段，升级前逐条确认：

1. **Node ≥ 22**：`0.7.0` 为 ≥ 20，Node 20 已于 2026-04 EOL；先升级运行时再升级依赖。
2. **DataTable 全选语义收窄**：表头全选由「整表」改为「当前页」；`lazy` 下选择 / 展开须显式 `rowKey`，跨页不再沿用页内索引键。依赖「全选全部筛选结果」的页面需改为父级 `selection` 聚合或自建选择栏。
3. **可见外观变化**：控件边界改用更深的 `--caomei-color-control-border`；`soft` / `outline` 语义色文本改用 `*-text` 角色，部分预设文字色略有加深。视觉基线需按新角色复核。
4. **覆盖过 token 的消费方**（对外 7 条中的「升级注意」）：若曾用 `--caomei-color-border` 承担控件边界，需改用 `--caomei-color-control-border`；覆盖后的对比度由使用方自行保证。

## 对外披露的 6 条已知限制 + 1 条升级注意（共 7 条）

以下与 1.0.0 CHANGELOG 的「已知限制」6 条 + 「升级注意」末条（token 覆盖责任边界）逐条对应；只说明升级时的影响与动作，不改变原文结论。

| 条目 | 事实 | 升级时的影响与动作 |
| --- | --- | --- |
| 品牌预设的既有对比度缺口 | `caomei` `primary-solid` 4.17（`-solid` 配对唯一例外）；例如，亮色下把非 `-solid` 的 `--caomei-color-success` 直接作实底并配白字时，推算值为 2.279 / 2.643 / 3.045（库内无该配对消费点） | 既有品牌裁定保留，本版未修复也未恶化；`-solid` 配对（默认 / hover / active）自 1.1.0 起纳入常驻断言，`caomei` `primary-solid` 以 4.0 下限留痕。要求 AA 的项目改用默认预设或覆盖对应 token |
| Calendar / RichTextEditor 的交互边界 | 上 / 下月导航按钮与编辑器容器描边 < 3:1 | 未纳入本次对比度断言面；有非文本对比度要求时自行覆盖并复核 |
| Chromium-only 回归 | 常驻 390 / 768 / 1280（另 320 / 900 定向档）；375px 仅画廊与 DataTable 键盘滚动专项；Firefox / WebKit 未纳入 | 升级后在目标内核自测；不要把 Chromium 结论外推为三内核一致 |
| 禁用态豁免 | 按 WCAG 1.4.3 / 1.4.11 豁免 | 禁用态对比度不作保证；不要把禁用态纳入对比度验收 |
| 视觉回归容差 | 快照比对 `threshold: 0.1` + `maxDiffPixels: 100` | 极小尺寸组件的细微色差可能不触发差异；颜色类回归以计算样式采样为准 |
| 一期 5 语由 AI 生成 | `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`，母语审校待完成 | 措辞可能不地道；发现措辞问题请提 issue，不要把该 5 语当作已母语审校 |
| 覆盖 token 的对比度责任（升级注意） | 消费方覆盖 `--caomei-*` 后的对比度由使用方负责 | 升级时复核 token 覆盖面；旧 `--caomei-color-border` 控件边界改用 `--caomei-color-control-border` |

## 升级检查表

- [ ] 读目标版本 CHANGELOG 的 `BREAKING CHANGES` / 升级注意 / 已知限制，并记录当前锁定版本与业务仓库 revision；
- [ ] 精确锁定目标版本（不用 `^` / `~` 跨 minor），升级单独提交，避免与功能改动混在一起；
- [ ] Node 升到 22 及以上；
- [ ] 检索 `DataTable` 的 `selectAll` / `lazy` / `rowKey` 用法，确认全选语义与跨页选择符合预期；
- [ ] 检索 `--caomei-color-border` 与语义色文本覆盖，切到 `control-border` / `*-text`；
- [ ] 非 `zh-CN` / `en-US` 的语言改用 `caomei-ui/locale/<code>` + `registerLocale()`；
- [ ] 使用 Tooltip 时在应用根部放置 `CaomeiTooltipProvider`；
- [ ] 在业务仓库复跑 `typecheck` 与 `build`；
- [ ] 重跑视觉回归 / 计算样式断言；颜色差异按新角色归因，不直接放宽阈值；
- [ ] 在升级记录中写明版本、业务仓库 revision、验证结果与未覆盖项。

## 适用范围

本页只说明库侧的升级影响。页面级迁移、运行时验证与视觉回归由使用方在自己的项目中完成；不同项目的升级节奏与验证范围可能不同。

例如：先确认实际锁定版本（如 `pnpm why caomei-ui`），再在业务仓库复跑 `typecheck` / `build` 与视觉回归，并把版本、revision 与结果记录到自己的升级记录中。

## 相关阅读

- [版本与兼容策略](./version-policy.md)（1.x 承诺、冻结面与 pin 建议）
- [从 PrimeVue 迁移](./primevue-migration.md)（组件映射与迁移陷阱）
- [主题与样式设计](../design/theming.md)（token 语义与覆盖配方）
- [内建文案与语言](../components/locale.md)（locale 子路径与注册）
- [CHANGELOG](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/CHANGELOG.md) / [GitHub Releases](https://github.com/CaoMeiYouRen/caomei-ui/releases)
