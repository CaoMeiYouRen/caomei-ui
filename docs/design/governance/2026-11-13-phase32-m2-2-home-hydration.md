# Phase 32 M2-2：文档站首页 hydration mismatch 定性

> 创建时间：2026-11-13
> 触发：Phase 32 M2-2（[Phase 32 登记批次](./2026-11-12-phase32-registration.md) §2）。
> 取证口径：按用户 2026-11-13 裁定，以「**SSG HTML 结构快照 + dev 真机对照**」结案（容器内 `vitepress preview` 有既有 crash 限制）。

## 1. 结论

**当前版本（VitePress `1.6.4`）+ 本判别面下未复现**：首页 SSG 与 hydration 后的静态区域逐项一致，dev 与生产构建、明暗主题、默认与已存主题预设下均无 hydration 告警。

**不声称「已消除」**：本批无修复实现，也没有「曾复现版本」的可比对基线；判别面只覆盖内容级差异（见 §3 边界）。

**Backlog 分支闭合**：登记 §2 的条款是「可修则修，不可修则登记 Backlog」。本批结论为「未复现」，既不属可修也不属不可修，故**不触发 Backlog 登记分支**；残余风险由 §4 的再评估触发承接（VitePress 大版本 / 首页结构 / 主题层新增客户端状态）。

## 2. 取证

探针：`pnpm docs:build && pnpm docs:probe:hydration`（新增 `scripts/docs/probe-home-hydration.mjs`）。做法 = 关闭 JS 取 SSG 静态快照 → 开启 JS 等待 Vue 挂载（`#app.__vue_app__`）后取同一组快照 → 逐项比较；同时采集 hydration 告警与页面错误。

快照字段：`归一化文本 | innerHTML 长度`（长度用于捕捉「元素/结构增减而文本相同」的差异）。

| 场景（可复跑命令） | 结果 |
|:---|:---|
| `pnpm docs:probe:hydration`（`/`，亮色） | `.VPHero` `761`、`.VPFeatures` `1458`、`.VPNavBarTitle` `129`，文本与长度**逐项一致**；告警 0 |
| `--page=/en-US/` | **逐项一致**；告警 0 |
| `--color-scheme=dark` | 静态侧无 JS、恒为缺省外观；水合侧 `html.dark` 由 VitePress 内联脚本写入——本场景验证「暗色客户端状态注入后内容不变」；**逐项一致**；告警 0 |
| `--color-scheme=dark --stored-preset=sakura` | 预设键从主题层源文件读取，`data-preset` 在 `onMounted` 后写入；**逐项一致**；告警 0 |
| dev 真机（`vitepress dev` + Chromium，`/`） | 控制台 hydration / mismatch 告警 **0 条**（一次性流程，未固化为命令） |

**负向验证**：`node scripts/docs/probe-home-hydration.mjs --dist=<空目录>` → `[probe-home-hydration][error] 构建产物缺失…`，**exit 1**；受检选择器未命中或文本为空同样 exit 1（单测覆盖）。

## 3. 归因与三层排除

| 层 | 排除依据 |
|:---|:---|
| VitePress 上游 | 首页 `layout: home`，hero / features / nav-bar 全部由默认主题渲染；SSG 与水合后同区域文本与结构长度一致，说明默认主题 SSG 输出即客户端首帧。 |
| 主题层 | `docs/.vitepress/theme/layout.vue` 的包装层（`CaomeiConfigProvider` / `CaomeiToastProvider` / `CaomeiConfirmDialog`）不在首页静态区域产生分支；`ThemePresetSwitcher` 的唯一客户端状态（`localStorage` + `documentElement.dataset.preset`）在 `onMounted` 后写入，SSR 输出为缺省预设；「已存预设」场景实测零告警。 |
| 示例层 | 首页源 `docs/index.md` 只有 frontmatter + 快速链接，**不含任何 demo / 组件示例引用**（可 `rg "Demo|examples/" docs/index.md` 复核）；首页快照面无组件节点。 |

**历史登记的成因判断**：旧记录（2026-09 起多次评估）只写「疑似上游、定位成本高」，未留可复现命令；生产构建的 Vue 为静默修补版本，不打印 mismatch 告警，只有 dev 构建会告警——这是该问题长期无法定性、也未被证伪的直接原因。

## 4. 可复现与再评估

- 复现命令：`pnpm docs:build && pnpm docs:probe:hydration`；参数 `--page` / `--color-scheme` / `--stored-preset` / `--dist` / `--port`。差异、告警或受检面归零时脚本 exit 1。
- **抗静默假通过**：启动前校验 `dist/index.html`；受检选择器必须全部命中且文本非空；水合就绪以 `#app.__vue_app__` 轮询（30s 超时 fail-closed）。约定同步写入[文档站设计 §9](../documentation-site.md)。
- **耦合点**：`--stored-preset` 的存储键从 `theme-preset-switcher.vue` 的 `STORAGE_KEY` 解析，键名漂移时 fail-closed（不会写到无人读取的键）。
- **再评估触发**：VitePress 大版本升级、首页结构（hero / features）调整、主题层新增客户端专属状态（`window` / `localStorage` / `matchMedia` 在 setup 期读取）。

## 5. 已知边界

1. **判别面为内容级**：文本 + `innerHTML` 长度只能捕捉元素增减与文本变化；属性级差异（`class` / `href` / `data-*`）与 DOM 顺序外的结构差异不在面内。
2. **页面面**：仅 `/` 与 `/en-US/` 的 3 个静态选择器，不宣称整站一致。
3. **告警面**：生产构建的 Vue 静默修补使告警采集在该形态下恒为 0，告警维度实际由 dev 真机承担；该流程是一次性的，未固化为命令。
4. **无基线**：没有「曾复现版本」的 before/after 对照，故只作「当前版本未复现」的定性，不构成回归修复的因果证据。

## 6. Review Gate

- **audit-depth**：R1 `standard`（新增取证脚本 + 单测 + 治理记录，≤10 分钟），R2 `quick`（只复查修复点）。
- **R1**（`standard`）：`Reject`（2 blocker / 6 warning / 4 suggest）。
  - blocker：① 探针可静默假通过（构建产物缺失 / 选择器改名时「空对空」判一致）→ 补产物前置校验、快照就绪断言、`__vue_app__` 就绪轮询与两条负向单测；② 结论「已消除」超出证据与登记取向 → 改为「当前版本 + 本判别面下未复现」，补边界与 Backlog 分支闭合。
  - warning：读数不可复跑 → 补 `--color-scheme` 并改表格为可复跑命令、示例层排除改静态依据；越界用例未命中防护 → 改 `node:http` 原始路径并收紧前缀判定；预设键两处字面量 → 从主题层源文件解析、失败 fail-closed；水合判据为固定等待 → 确定性标记轮询；登记条款未闭合 → §1 补闭合句；§5 占位 → 本段。
  - 约定落点：`docs/design/documentation-site.md` §9 新增「取证脚本约定」（产物前置校验 + 选择器下界 + 探针 exit 1 + 声明判别面）。
- **R2**（`quick`）：`Pass`（0 blocker / 1 warning / 3 suggest）——R1 两项 blocker 与六项 warning 全部关闭；warning 为索引 Review Gate 指针指向 §5（章节重编号后）→ 已改 §6；suggest 为暗色行表述、`decodeURIComponent` 失败处理、产物错误文案 → 前两项已处置，文案问题不阻断。
- **复查基线**：本记录 §1 / §2 / §5 / §6；`scripts/docs/probe-home-hydration.mjs` 与同名测试；`docs/design/governance/index.md` 新增条目；`docs/plan/todo.md` M2-2 行；`docs/design/documentation-site.md` §9 约定条目。
