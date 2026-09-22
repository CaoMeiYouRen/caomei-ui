# M2-5 组件画廊交付与验证记录（Phase 12）

本记录承载 Phase 12 M2-5（文档站观感与展示力，条件条目）的**开工口径、交付内容、守卫对账证据、V 阶段实测与 Review Gate 结论**。设计口径的权威归属是[文档与演示站 §16](../documentation-site.md)，本记录不另立规则、只记录本次交付与证据。

## 1. 开工口径（用户确认后实施）

- **范围**：新增中英「组件画廊」页（`/components/showcase` + `/en-US/components/showcase`），以**登记表驱动的策展集合**渲染真实组件预览卡片（名称 + 一句话描述 + 链到组件页），并在组件总览页与指南侧栏加入口。
- **非目标**：不做全 46 个组件的画廊（构建 / 水合成本高、窄档溢出风险大）；不改组件源码；不引入截图或视觉回归基线。
- **策展集**：12 项，覆盖 §11 全部 6 个分组（基础与布局 Button / Card / Tag；表单输入 Input / Switch；选择器 DatePicker / Select；反馈与浮层 Dialog / Message；数据展示 DataTable / ProgressBar；导航与操作 Tabs）。
- **最小验收标准**：① 登记表 ↔ 真实页面对账机检并接入 `docs:check`（含抗静默收窄断言、正反例语料、仓库级负向对照）；② 卡片为真实组件渲染（`@ui-validator` 浏览器核对）；③ 四档视口 1440 / 1024 / 768 / 375 无横向溢出、亮暗一致、窄档单列宽档多列；④ 中英同步（`docs:check:i18n-parity` 覆盖）；⑤ nav / 侧栏入口有效（`docs:check:config-links` 覆盖）；⑥ `docs:build` exit 0（0 dead link / 0 TypeError）。

## 2. 交付内容（13 文件 / 985 行新增 / 3 行删除）

| 面 | 文件 | 说明 |
| --- | --- | --- |
| 登记表 | `docs/.vitepress/showcase-registry.json` | 单一事实源：`name` / `group{zh,en}` / `example` / `description{zh,en}`，12 项 |
| 渲染 | `docs/.vitepress/theme/components/showcase-grid.vue` | `import.meta.glob` 取中英示例、`defineAsyncComponent` 渲染、`withBase` 生成链接、`min(280px, 100%)` 网格 |
| 渲染接线 | `docs/.vitepress/theme/index.ts`、`docs/.vitepress/shims-vite.d.ts` | 全局注册 `ShowcaseGrid`；为 `import.meta.glob` 引入 `vite/client` 类型 |
| 页面 | `docs/components/showcase.md`、`docs/i18n/en-US/components/showcase.md` | 正文仅一个 `<ShowcaseGrid />` 挂载点 |
| 入口 | `docs/.vitepress/config.ts`、`docs/components/index.md`、`docs/i18n/en-US/components/index.md` | 中英指南侧栏各一条 + 中英总览页正文链接；**不进组件侧栏**（§11 侧栏不变式为机器校验面，非组件页混入会破坏该不变式） |
| 守卫 | `scripts/docs/check-showcase-registry.mjs`、`scripts/docs/check-showcase-registry.test.mjs` | 对账守卫 + 20 个用例 |
| 门禁接线 | `package.json` | 新增 `docs:check:showcase`，插入 `docs:check` 链（位于 version 段之后） |
| 文档 | `docs/design/documentation-site.md` | §13 增「登记表驱动的页面另需专项对账」；新增 §16「组件画廊」登记节 |

## 3. 守卫规则与负向对照

`pnpm docs:check:showcase` 以登记表 + §11 为事实源逐项对账：结构合法性、`example` 形态（两级 `.vue`、目录等于组件名 kebab-case、禁 `.` / `..` / 绝对路径）、分组归属（`group.zh` ∈ §11 分组、`group.en` 与之一致、`name` ∈ 该分组组件清单）、中英组件页与中英示例存在性、登记顺序（§11 分组顺序 + 组内字母序）、中英画廊页 `<ShowcaseGrid />` 挂载点（带边界正则）、抗静默收窄（非空 / 项数 ≥ 9 / 覆盖分组 ≥ 3 / §11 解析为空即失败）。

- 受检面：**12 项登记 / 覆盖 6 个分组 / §11 登记 6 组**，零问题。
- 仓库级负向对照（两次，均从 `/tmp` 备份还原，还原后 `diff` 逐字节一致且 exit 0）：
  - 首项 `group.zh` 改为「不存在的分组」→ exit 1：`showcase:showcase-unknown-group: 登记表第 1 项（Button）：分组「不存在的分组」不在 docs/design/documentation-site.md §11 的登记分组中`。
  - 首项 `example` 改为 `tag/basic.vue` → exit 1：`showcase:showcase-example-invalid: 登记表第 1 项（Button）：example 的目录必须等于组件名的 kebab-case（button），实为 tag`。
- 正反例语料 **20 tests**（结构逐类非法 / 分组三类偏差 / 重复项 / 分组与组内顺序倒置 / 示例与组件页缺失 / 挂载点缺失与同前缀伪命中 / 空登记与下界 / 登记表与设计文档不可读 / CLI 退出码 / 仓库不变量）。

## 4. V 阶段实测（`@ui-validator`，prod preview）

7 项核对**全部通过**，0 失败，console error / pageerror / HTTP ≥ 400 均为 0。关键数值：

| 核对项 | 实测值 |
| --- | --- |
| 真实渲染 | 12/12 stage 非空；根类名命中 button 3 / card 1 / tag 2 / input 1 / switch 2 / select 1 / date-picker 1 / message 2 / data-table 1 / progress-bar 1 / tabs 1；Dialog 初始 `__content`=0，点开后=1、`role=dialog`、`aria-modal=true`、Portal 到 body |
| 四档溢出 | 1440 / 1024 / 768 / 375 均 `scrollWidth === clientWidth`（0px）；另扫 800 / 900 / 959 / 960 / 976 / 992 / 1008 / 1100 / 1280 共 40 例（中英 × 亮暗）全 0 |
| 列数 | 1440 → 2、1024 → 2、768 → 2、375 → 1（960px 起侧栏展开、内容区 560px 而 2 列需 ≥576px，故 960 档回落单列，符合网格数学） |
| 亮 / 暗 | 暗色四档溢出 0；预览区 bg 亮 `rgb(246,246,247)` / 暗 `rgb(32,33,39)`，卡片 bg 亮 `rgb(255,255,255)` / 暗 `rgb(27,27,31)`；卡片名对比度 10.94 / 12.81，描述 5.62 / 5.99 |
| 中英同步 | 两页各 12 卡 / 6 分组标题逐字匹配；预览文案随 locale（zh「默认按钮」/ en「Default button」） |
| 交互 | Switch `aria-checked` 切换且文案同步；Tabs 切页（可见面板唯一、`aria-selected=true`）；Select 展开 3 选项后折叠；DatePicker 面板 Portal 出现、Esc 关闭；Dialog 可见 1→0 |
| 卡片链接 | 12×2 全 HTTP 200、locale 前缀正确；点击 Button 卡 zh→`/components/button`、en→`/en-US/components/button` |

**观察项（均非本批缺陷，不阻断）**：① 亮色下 `--caomei-color-text-muted` 在站点 `--vp-c-bg-soft` 上为 4.48:1（略低于 AA 4.5，同色在纯白上 5.1）——归因库 token × 站点 soft 底，非画廊引入；② 列数在 960px 回落单列属网格数学（见上表）；③ Input 示例仅以 placeholder 提供可访问名——示例层问题，非画廊引入。

**补充复验（本批自测，覆盖 V 阶段未覆盖边界）**：以 `VITEPRESS_BASE=/caomei-ui/` 构建，画廊卡片链接正确带 base 前缀（`/caomei-ui/components/button`、`/caomei-ui/en-US/components/button`），修复后已回退到 `base=/` 重新构建。

## 5. Review Gate（第 1 轮，两分区并行）

- 声明：`audit-depth = standard`（理由：站点运行面 + 脚本/门禁面，无安全 / 发布 / 依赖版本变更）；单分区时间盒 ≤ 10 分钟；两分区并行，总时间盒 = 各分区最大值。
- 结论：**两分区均 Pass，0 blocker**。分区 1：1 warning + 4 suggest；分区 2：1 warning + 6 suggest。
- 实测用时：宿主时钟发起 `2026-09-22T23:42:59+08:00` → 返回后 `23:50:36+08:00`，**≤ 7 分 37 秒**，未超时间盒（分区 2 自报约 8 分钟，为估算值，不作核验依据）。
- 已同批修正的修复点（记为「已修复未复审」）：
  - **W-1（分区 1）**：卡片链接未过 `withBase`，非根 base 部署下 24 条链接会静默 404 → 改为 `withBase(...)`，并以 `VITEPRESS_BASE=/caomei-ui/` 实机构建复验（见 §4 末）。
  - **S-2（分区 1）**：DataTable 英文描述漏「与空态」→ 补齐。
  - **S-3 / S-2（分区 2）**：挂载点裸子串匹配（`<ShowcaseGridLegacy />` 会误命中）→ 改带边界正则并补反例；`group` / `description` 真值判断改为 `isNonEmptyString`（纯空白字符串不再绕过）。
  - **W1（分区 2）**：§16「某 locale 缺示例时预览退化为空」易被读成「可只写单侧」→ 明确「中英示例齐备由构建期守卫强制，渲染层只是兜底」。
  - 另采纳：§13 摘要补「细则见 §16」；§16 增「分组标题不进 outline」的已知取舍；单测补常量耦合注释与同前缀反例。
- 未采纳（留档）：kebab 规则在渲染组件与 `check-docs-structure.mjs` 各有一份实现（跨 Node / 浏览器边界，且守卫会以「目录 ≠ kebab」「组件页缺失」阻断漂移，非静默风险）。

## 6. 残留 follow-up（已登记 [Backlog](../../plan/backlog.md)）

- 画廊浏览器回归断言（把 V 阶段断言清单沉淀为 Playwright 用例）。
- 对比度遗留项盘点扩展：亮色 `--caomei-color-text-muted` × 站点 `--vp-c-bg-soft` = 4.48:1。
- Input 示例可访问名（仅 placeholder，无 label / `aria-label`）。

## 7. 未覆盖边界

- 非目标面（全 46 组件画廊、demo 外壳、视觉回归基线）未实现，按 §1 非目标。
- 未做 axe-core 扫描、未验浮层 Tab 焦点陷阱与焦点归还、未测默认动效（`no-preference`）路径、未做移动端真机触摸验证。
- `docs:dev` 下未复验（V 阶段取 prod 产物）；768 / 1024 档无整页截图（仅几何断言）。
