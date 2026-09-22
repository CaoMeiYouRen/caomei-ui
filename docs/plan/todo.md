# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

### Phase 12：发布就绪、文档对外与一致性收官

- **授权**：2026-09-21 用户授权启动；编号按 [规划规范 §4](../standards/planning.md) 取已有最大编号 +1（已有最大为 Phase 11）。范围依据见[下一阶段范围评估](../design/governance/2026-09-21-next-stage-scope-evaluation.md) §5 / §6。
- **定位**：收敛「`main` 与已发布版本」的包形态口径分叉并清零已登记的规范偏差，同时把文档站做成可对外引用的门面；工程可信度按容量**选摘**（只取 a11y 回归）。
- **目标**：① 手动发布 0.2.0（含 Phase 11 的破坏性包形态变更）并完成发布前后校验；② 文档对外可用性（版本信息与兼容策略 + 文档守卫）；③ 样式一致性收官；④ 可访问性自动化回归；⑤ 治理守卫精选。
- **非目标**：**不启用 CI 自动发布**（用户裁定，保持手动发布）；**不启动 Phase 8**（用户裁定：等待下游完成接入）；不执行 momei 侧迁移（外部执行）；不做 E2E 常驻 / 浮层入门禁、视觉回归基线与 flaky 治理（容量所限，留 [Backlog](./backlog.md)）；**不改任何 token 色值**（对比度遗留项与实底前景配对复核须另行裁定，留 Backlog）；不新增组件能力（条件触发项留 Backlog）；不修改 `AGENTS.md`（受保护文件，AI 资产指针须用户指示）。
- **用户决策（2026-09-21，对应评估记录 D1~D8）**：① 取向取组合 **P / Q / R 混合**；② 主线收敛为 **3~6 条**；③ **授权启动**；④ **不启用 CI 自动发布**，保持手动发布；⑤ **执行一次发布，版本号 0.2.0**；⑥ **28 条尺寸档位块收敛**；⑦ 文档站观感与展示力「**如有空间可以纳入**」（登记为条件条目 M2-5）；⑧ Phase 8 **等待下游完成接入**。
- **执行顺序**：M3（样式收敛）与 M4（a11y 回归）先行并完成 → M1 手动发布（使 0.2.0 覆盖本阶段全部代码改动）→ M2（版本信息页依赖 `v0.2.0` 基线，其余条目可并行）→ M5 全程可并行。同一主线内条目按本表自上而下顺序执行；跨主线改同一文件时串行（`docs` 守卫脚本：M2-2 / M2-4 与 M5-2）；`check:design` 规则面与单测由 M3-2 与 M3-3 同文件改动，二者串行，且 M3-2 依赖 M3-1 的收敛面。
- **阶段验收**：阶段验收通则见[路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面 / 样式 / 交互时另经 `@ui-validator` 验证；**本阶段含发布动作，故收口前与发布前各需执行一轮[长期任务](./recurring.md)门槛复核并留痕**。

#### M1 手动发布与版本基线（0.2.0）

- 执行范围：版本基线置 0.2.0、生成 CHANGELOG 与 annotated tag、按 runbook 手动发布到 npm、发布后校验与状态同步；在发布说明中披露包形态破坏性变更（`styles.css` → `theme.css`）与下游修复指引。
- 非目标：不启用 / 不修改 `release.yml` 的发布步骤；不配置 `NPM_TOKEN` 或 Trusted Publisher / OIDC；不做下游接入验证（外部反馈驱动）。
- 最小验收标准：npm `latest = 0.2.0`；annotated tag `v0.2.0` 指向发布提交；tarball 含 `dist/styles/index.css`（`theme.css` 的落点）且**不含**旧单体 `dist/styles.css`；干净目录安装 + `caomei-ui` / `caomei-ui/theme.css` / `caomei-ui/resolver` / `caomei-ui/nuxt` 四项子路径导入冒烟通过；发布记录登记治理索引。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M1-1 | 0.2.0 版本基线与发布说明 | `package.json` 版本置 0.2.0；`pnpm changelog` 生成 CHANGELOG；建 annotated tag `v0.2.0`；披露包形态破坏性变更与下游修复指引 | 版本 / CHANGELOG / tag 三者一致；破坏性变更在 CHANGELOG 与发布指南中明示 | M3、M4 |
| M1-2 | 手动发布执行 | 按[发布指南](../guide/release.md) runbook 本地发布；发布前核验凭据可用性 | 发布命令与产物核验记录留痕；401 / 版本已存在等失败路径在指南中有对应说明 | M1-1 |
| M1-3 | 发布后校验与状态同步 | `npm view` / `npm pack --dry-run` / 干净目录安装与四项子路径导入冒烟；README / roadmap / 指南状态同步 | 与首发执行记录同口径通过；无「未发布 / 旧形态」残留表述 | M1-2 |

状态（M1）：**M1-1 / M1-2 / M1-3 已交付（2026-09-22）**——`package.json` 置 `0.2.0`（提交 `80df3b4`）、`CHANGELOG.md` 含 `# [0.2.0]` 段并在 `💥 BREAKING CHANGES` 明示形态变更（提交 `3ef4182`）、**annotated** tag `v0.2.0` 指向发布提交；用户完成本地手动 `npm publish`（**未启用 CI 自动发布**）。**发布后校验**：registry `latest = 0.2.0`（发布时间 2026-09-22T12:21:29Z）；从 registry 下载的 tarball 含 `dist/styles/index.css`、不含旧单体 `dist/styles.css`（345 文件 / unpacked 779,993 B / shasum `d29c75bd…`）；干净目录安装 + 四项子路径冒烟（根 88 导出 / resolver / nuxt（需可选 peer `@nuxt/kit`）/ theme.css 5,880 B）+ Vite 消费方构建冒烟均通过；`exports` 键无 `./styles.css`。**破坏性变更披露**：CHANGELOG 破坏性段 + 发布指南 §9（下游修复指引：`styles.css` → `theme.css`、注入点唯一、裸 Node ESM 须经打包器）；§4 补失败路径（401 / 403 版本已存在 / prepublishOnly 中止）。**状态同步**：README（中英）/ 快速上手（中英）/ 路线图 §1 / 发布指南 §4·§9（英文侧新增等价小节）/ Backlog（CHANGELOG 生成器空 `Unreleased` 段候选）。**偏差登记**：tag 视图不含 0.2.0 的 CHANGELOG 段（tag 指向版本提交、CHANGELOG 提交在其后；指南 §3 已规定正确次序，已发布 tag 不重写）。证据见[发布执行记录](../design/governance/2026-09-22-phase12-m1-release-execution.md)。

#### M2 文档对外可用性（版本信息与文档守卫）

- 执行范围：版本信息与兼容策略（轻量形态）；锚点校验与侧栏不变式；英文文档同步治理；nav / sidebar 链接校验；文档站观感与展示力（条件条目）。
- 非目标：**不做多版本托管 / 版本切换器 / 历史版本站点**（2026-09-22 用户裁定 D1-B，退回 [Backlog](./backlog.md)）；不改组件源码；不改构建产物形态；不做无判定口径的「美化」。
- 最小验收标准：版本信息与兼容策略——站点内可见当前版本、版本号与 `package.json` 机检一致、中英同步；文档守卫——新增守卫带正反例语料、「受检范围未被静默收窄」可断言并接入 `docs:check`；四档视口（1440 / 1024 / 768 / 375）无横向溢出。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M2-1 | 版本信息与兼容策略（**轻量形态，2026-09-22 改写自「文档站版本化」**） | 中英「版本与兼容策略」页（当前版本 + 获取渠道 npm / GitHub releases / CHANGELOG + 0.x 破坏性变更策略与下游 pin 建议）；站点内可见的当前版本展示；版本号单一来源（`package.json`）并机检。**不做多版本托管**（依据见[形态再评估](../design/governance/2026-09-22-docs-versioning-reevaluation.md)） | 中英页面齐备三项（当前版本 / 获取渠道 / 0.x 策略）且中英同步；站点内可见位置展示当前版本（经 `@ui-validator` 验证）；版本号与 `package.json` 一致由机检覆盖（带正反例语料、全库零误报、「受检范围未被静默收窄」可断言）；`docs:build` 通过 | M1-1 |
| M2-2 | 锚点校验与侧栏不变式 | VitePress slug 不匹配检测 + 侧栏不变量脚本，并修复既有断锚（**2026-09-22 重新取证为 11 处**，原登记「7 处」只计数字开头类） | 守卫带正反例语料、全库零误报、接入 `docs:check` | — |
| M2-3 | 英文文档同步治理 | parity / freshness 校验与未翻译页回链策略 | 规则可判定且机检落地；「受检范围未被静默收窄」可断言 | — |
| M2-4 | nav / sidebar 链接校验 | 把 `themeConfig.nav` / `sidebar` 链接纳入链接校验覆盖面 | 校验覆盖面含 nav / sidebar 且零误报 | — |
| M2-5 | 文档站观感与展示力（**条件条目**） | 画廊 / demo 外壳等展示力提升。**启动门槛（可判定）**：M1、M3、M4、M5 与 M2-1 ~ M2-4 **全部验收通过后**，由用户确认是否启动；开工前须先给出可判定的验收口径 | 门槛满足且用户确认后才开工；口径可判定；视觉改动经 `@ui-validator` 真机验证；门槛不满足则不启动、留 [Backlog](./backlog.md) | M1 / M3 / M4 / M5 / M2-1 ~ M2-4 全部通过 + 用户裁定 D7 |

状态（M2-1）：**M2-1 已交付（2026-09-22）**——新增中英「版本与兼容策略」页（`docs/guide/version-policy.md` + en）与站点版本展示：**单一来源 = 仓库根 `package.json`**（`config.ts` 读取并经 `themeConfig.version` 暴露、页面用 `useData()` 的 `theme.version` 插值；`defineConfigWithTheme` 声明自定义字段），中英导航新增 `v0.2.0` 条目链至该页、指南侧栏加入入口；`getting-started`（中英）顶部提示改为派生值（**发版不再需要手改站点文档**）。新增 `docs:check:version`（`scripts/docs/check-site-version.mjs`，接入 `docs:check`）：① 已解析配置的 `themeConfig.version` 必须等于 `package.json`（`resolveConfig` 取实际生效值）；② 版本展示面**不得出现三段式版本字面量**（登记表 5 项）；③ 展示面须按类型接线；④ 抗静默收窄。正反例语料 **13 tests**；仓库级负向对照（版本页写入 `0.9.9` → exit 1 且行号精确，还原后 exit 0）。**口径说明**：机检的「零误报」指**受检面（5 个登记展示面）零误报**——整库扫描必然命中历史版本引用（如 `reka-ui 2.10.4`、`release.md` 的 `0.1.0`），故不采用整库口径；受检面另有抗静默收窄断言（须含配置面 + 中英页面面）与**逐 locale 断言**（各 locale 的已解析 `themeConfig.version` 必须等于 `package.json`，防依赖合并语义的静默缺失）。**V 阶段（`@ui-validator`）9 项核对 8 项通过**（zh/en 导航版本项可见且可跳转、版本页三节与链接齐备、快速上手提示、侧栏入口、暗色对比度 12.81:1 / 8.50:1、console / pageerror / HTTP 0）；**1 项未通过**：768px 下 `/en-US/**` 横向溢出 146px（既有 79px + M2-1 放大 67px）→ **用户裁定方案 b 修复并复验通过**：仅窄档（<960px）收敛切换器标签与导航项内边距，两处展示保留，768px 溢出 **146px → 0**、其余三档与 959/960 断点无回归（证据见[溢出修复记录](../design/governance/2026-09-22-m2-1-nav-overflow-fix.md)）——**M2 主线「四档视口无横向溢出」已满足**。质量门：`lint:check` / `typecheck` / `typecheck:docs` / `lint:md:check` / `docs:check` / `docs:build`（exit 0、0 TypeError、0 dead link）全绿。规模：**13 文件（M2-1 自身：4 新增 + 9 修改）**，按粒度阈值拆三次提交；另含同批 revision 的 M1 记录 dead-link 修复 1 文件（合计 14）。

状态（M2）：**M2-2 已交付（2026-09-22）**——新增 `docs:check:structure`（`scripts/docs/check-docs-structure.mjs` + 共享解析器 `scripts/docs/vitepress-site.mjs`），两类规则：① **锚点按 VitePress 实算 slug 校验**（用 `createMarkdownRenderer` 实算，不复刻算法以免版本漂移；受检面为 `docs/` 内链接，源不在 `docs/` 或目标越出 `docs/` 者与行号锚点跳过）；② **组件区侧栏分区不变式**（以[文档与演示站 §11](../design/documentation-site.md) 登记表为单一事实源，对账中英 sidebar 的分组顺序 / 组内成员与字母序 / 「总览 · 能力说明」首尾位次）。**首跑命中并全部修复**：11 处真实断锚（**7 处涉及数字开头标题缺 `_` 前缀，其中 1 处兼含标点归一；4 处标点归一缺 `-`**，总数 11 两桶不严格互斥，涉及 `ai-collaboration` 与 4 份记录；原登记口径「全库 7 处」只计数字开头类，本次重新取证为 11 处并已披露差异）+ §11 登记表漏登 `CheckboxGroup`（侧栏已含该组件，表与实现分叉）。正反例语料 **26 tests**（含 `kebabCase` 映射、§11 表解析边界、侧栏偏差注入、实算 slug 的锚点对账、nav/sidebar 展平、slug 来源分叉检测）；仓库不变量断言页面数 ≥150 / 锚点链接 ≥20 / 分组数 = 6 / 组件条目 ≥45。**遗留 follow-up（已登记 Backlog）**：中英组件总览页缺 `CheckboxGroup`（§11 要求与侧栏一致）。规模：12 文件（3 新增 + 9 修改），按粒度阈值拆两次提交（先修正既有断锚与登记缺口，再落守卫与接线）。**Review Gate R1 Pass（0 blocker / 2 warning / 4 suggest）→ R2 Pass（0 blocker / 2 warning / 2 suggest）**；R2 后的修复点（`createSlugResolver` JSDoc 与单例约束口径、§13 关于 nav / sidebar 覆盖面的不实括注、记录份数 3→4、`slug-source-diverged` 集成负例）已同批修正，记为「已修复未复审」。 **M2-4 已交付（2026-09-22）**——新增 `docs:check:config-links`（`scripts/docs/check-config-links.mjs`）：用 VitePress **已解析**配置取 nav / sidebar 链接（不静态解析 `config.ts`，避免计算式配置被静默排除在受检面外），校验「站点绝对路径 → 页面存在」与「锚点按实算 slug 有效」；纯锚点 / 非站点绝对路径 / `..` 路径穿越 / 目标缺失 / 锚点失效逐类报出，外部链接（含协议相对）跳过；分面空扫描（`empty-nav-scan` / `empty-sidebar-scan`）与 `slug-source-diverged` 按失败退出。受检面 **152 条**（nav 10 / sidebar 142，零问题）。共享解析器 `vitepress-site.mjs` 同步收敛：抽出 `buildSitePageCandidates` / `firstExistingPage` 统一越界收敛（消除与 `resolveDocsPageTarget` 的口径分叉）、新增 `normalizeSidebar`（数组形态侧栏归一，防顶层 `link` 被静默吞掉）、`EXTERNAL_LINK_RE` 单点定义。正反例语料 **14 tests**（夹具站点坏链接 / 逐类判定 / 越界与穿越 / 数组形态展平 / 分面空扫描 / slugify 分叉）。仓库级负向对照：临时注入不存在的侧栏链接 → exit 1 且消息精确，还原后 exit 0。同步[文档与演示站 §13](../design/documentation-site.md)（nav / sidebar 链接面改由该守卫覆盖）。**Review Gate R1 Pass（0 blocker / 3 warning / 4 suggest）→ R2 Pass（0 blocker / 2 warning / 2 suggest）**；R2 后的修复点（`empty-nav-scan` 对称测试、外部链接谓词单点化）已同批修正，记为「已修复未复审」。规模：6 文件（2 新增 + 4 修改）。 **M2-3 已交付（2026-09-22）**——新增 `docs:check:i18n-parity`（`scripts/docs/check-i18n-parity.mjs`）：以[文档与演示站 §10](../design/documentation-site.md)「同步范围」（指南 / 组件介绍）为单一事实源，三类规则且**全部两向断言**——① 范围内中文页缺英文版 → `missing-translation`（当前豁免为空）；② 英文页缺中文源页 → `orphan-translation`（纯英文区落地页登记 `plan/index.md` 并附理由）；③ 已配对页面 H2/H3 章节数不一致 → `structure-drift`（登记 2 处有意差异：英文概览页按翻译覆盖组织、发布指南按主题重组）；反向校验分别报 `stale-exemption` / `stale-en-only` / `stale-structure-exemption`（防清单腐烂）；另设同步范围页数下界（≥50）与空扫描拒绝。**新鲜度口径**：内容级（git 时间戳）不入门禁——依赖完整历史、浅克隆 CI 下静默失效；门禁面取「章节数」这一可机检代理，本地实测 3 对页面中文晚于英文仅作观察记录。受检面：同步范围 **56 页全部有英文版**、**56 对已对账**（中文 134 / 英文 60 页）。正反例语料 **24 tests**；`check-i18n-routing.test.mjs` 补「回链策略受检面未静默收窄」断言（三类规则各有用例 + 受检页源文件存在）。仓库级负向对照**三向**：新增范围内中文页 → exit 1（`missing-translation`）；给英文页加一节 → exit 1（`structure-drift`）；注入无页面的范围前缀 → exit 1（`scope-prefix-empty`，探针为未跟踪文件、已手工还原并复跑）；均还原。同步[文档与演示站 §10](../design/documentation-site.md)。规模：6 文件（2 新增 + 4 修改）。**Review Gate R1 Pass（0 blocker / 3 warning / 4 suggest）→ R2 Pass（0 blocker / 3 follow-up）**；R2 后的修复点（交付记录计数与负向对照方向数更正、§10 补逐前缀下限描述、`stale-exemption` 源缺失分支单测）已同批修正，记为「已修复未复审」。 **M2-5 已交付（2026-09-22，条件条目经用户确认启动）**——新增中英「组件画廊」页（`/components/showcase` + `/en-US/components/showcase`），以登记表 `docs/.vitepress/showcase-registry.json`（12 项，覆盖 §11 全部 6 分组）驱动真实组件预览卡片；入口走中英总览页与指南侧栏，**不进组件侧栏**（§11 侧栏不变式为机器校验面）。新增 `docs:check:showcase`（`scripts/docs/check-showcase-registry.mjs`，20 tests）：对账结构 / `example` 形态 / 分组归属 / 中英组件页与示例存在性 / 登记顺序 / 挂载点，并设项数与分组数下界；仓库级负向对照两次（未知分组、示例目录错配 → exit 1，还原后 exit 0）。**V 阶段（`@ui-validator`）7 项全通过**（四档溢出 0px、列数 2/2/2/1、亮暗一致、12×2 链接 200 且 locale 正确、console / pageerror 0）。**Review Gate 两分区并行 R1 双 Pass（0 blocker）**；修复点（`withBase` 链接、挂载点边界正则、描述与文档措辞）已同批修正并复验（含 `VITEPRESS_BASE=/caomei-ui/` 实机构建），记为「已修复未复审」。规模：13 文件 / 985 行新增，拆两次提交；残留 follow-up 入 [Backlog](./backlog.md)。证据见 [M2-5 记录](../design/governance/2026-09-22-m2-5-component-gallery.md)。

#### M3 样式一致性收官

- 执行范围：28 条非 `:where()` 尺寸档位块归一化；`check:design` 规则面扩围与等价取证入库；重复声明（死声明）机检守卫与同类残留清理；触发器 `unstyled` 遗留收敛。
- 非目标：不改任何 token 色值；不顺手归并不同值档位；不改组件公开 API 与视觉表现。
- 最小验收标准：收敛类改动以**可复现**的计算样式逐项等价取证（真实浏览器矩阵口径——本次为新增 26 项 + 既有主矩阵 216 项；[M3-1 记录 §5](../design/governance/2026-09-21-m3-1-size-tier-normalization.md) 说明它与 M2-2「226 项」的差异，允许的差异须逐条声明）；新增守卫带正反例语料并接入 `check:design`。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M3-1 | 尺寸档位 `:where()` 归一化 | 28 条（27 单一 + 1 复合）非 `:where()` 尺寸档位块改 `:where()` 并把默认值落基类 fallback；按组件面取证（input-number 6 / textarea 3 / tag 3 / select 3 / input 3 / date-picker 3 / button 3 / badge 4）。**本条目只含 8 个组件样式文件的归一化改动**（守卫与取证装置分别另列 M3-2 / M3-5，以满足[规划规范 §5](../standards/planning.md) 的粒度约束） | 计算样式逐项等价（226 项口径）；非 `:where()` 档位块归零；零视觉回归（`@ui-validator`） | 用户裁定 D6 |
| M3-2 | `check:design` 规则面扩围 | 新增「尺寸档位类必须以 `:where(...)` 出现」的守卫（G1 只审查已用 `:where()` 的块、G2 只管变量声明，二者都无法拦截「档位类直接作为选择器主体」的形态——M3-1 收敛的 28 条正是此类）；接入 `runChecks` 与开发规范 §7 | 守卫可阻断回流（带正反例语料：档位类裸用 / 后代限定 / 复合块未包裹命中，`:where()` 包裹 / `:where()` 内分组 / `:not(:where(...))` 放行）；全库零误报 | M3-1 |
| M3-3 | 重复声明（死声明）守卫 + 同类残留清理 | 先重新取证残留面（Phase 11 M2-2 已删 4 处，原登记 8 处 / 4 组件）；新增同类属性重复覆盖机检规则并清理残留 | 守卫带正反例语料并接入 `check:design`；残留归零或逐条登记例外 | — |
| M3-4 | 触发器 `unstyled` 遗留收敛 | 收敛 date-picker / color-picker / split-button 的 `as-child` 绕过（Reka primitive `unstyled` 遗留） | 触发结构与可访问性断言 / 浏览器验证通过；零视觉回归 | — |
| M3-5 | 计算样式取证装置入库 | **自 M3-2 拆出**（[规划规范 §5](../standards/planning.md) 的 10 文件 / 800 行阈值：守卫与取证装置合计超阈值；**交付时回填实测文件数 / 行数，生成物基线按 §5 不计入**）：把 M2-2 / M3-1 使用的一次性夹具与脚本（`.temp/capture/`，gitignored）迁入仓库，含聚焦化后的 fixture、`capture` / `diff` 运行器与**冻结基线**；接入周期回归调用 | 等价取证可从仓库复算（脚本 + 冻结基线入库，一条命令重跑并与基线比对）；冻结基线由 `--freeze` 生成并随脚本同提交；周期回归中生效 | M3-2 |

状态（M3）：**M3-1 已交付（2026-09-21）**——8 个组件的 28 条非 `:where()` 尺寸档位块归一化（基类 `var(…, fallback)` 消费 + 档位块只声明变量），真实浏览器计算样式 **242 项逐属性 0 差异**（新增 26 项 + 既有主矩阵 216 项）、`rg` 归零核验 0 命中；`pnpm verify` exit 0（1415 tests）、`pnpm test:e2e` exit 0（54 passed）；Review Gate 两轮（R1 Reject：记录覆盖构成错述 → R2 Pass）。证据见 [M3-1 记录](../design/governance/2026-09-21-m3-1-size-tier-normalization.md)。**M3-2 已交付（2026-09-21）**——`check:design` 新增尺寸档位选择器守卫 `[tier-where]`（拦「档位类直接作为选择器主体」——G1 / G2 均无法覆盖的 28 条收敛面形态），正反例语料 14 条（该守卫单测文件 44 tests 全过）、全库零误报、负向对照（注入裸档位块 → exit 1）确认可阻断；同步开发规范 §7 与设计规范 §8 检查项清单（补 5~9 = G1~G5）；Review Gate 三轮（R1 Reject：规划编号写入测试名与注释 + 执行期拆分后指针失效 4 处 → R2 Reject：预写 M3-2 交付结论 → R3 Pass，blocker 归零）。**M3-3 已交付（2026-09-21）**——重新取证「同规则同名属性重复声明」为 **8 处 / 4 组件**（input / input-number / select / textarea 各 2，与 Backlog 登记口径一致），全部清理并落地 `[dup-decl]` 守卫（预算 0，含自定义属性；平铺规则面，不展开 CSS 嵌套）；正反例语料 6 条（该守卫单测文件 50 tests 全过）、全库零误报。**技术结论（已写入开发规范 §7）**：后写声明含 `var()` 时不构成渐进增强回退——它不会被解析期丢弃，而是级联选中后在计算值期非法 → `unset`，故被删的先写值在任何引擎都不生效，本清理为零行为变化；真实浏览器 A/B（8 个聚焦态用例）**250 项逐属性 0 差异**，负向对照（`20%` → `25%`）确认探针灵敏。**M3-4 已交付（2026-09-21）**——date-picker / color-picker / split-button 三处「直连 Reka primitive 触发器 + `as-child`」收敛为本库 `CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger`（`as-child` + `unstyled`）；真实 Chromium 触发结构 A/B **262 项逐属性 0 差异**（属性快照 + 计算样式，含闭合 / 开合两态），负向对照（去掉 `unstyled`）报 5 处差异证明探针灵敏且 `unstyled` 生效；新增 6 条回归断言（date-picker 1 / split-button 2 / color-picker 3，date-picker 开合由既有用例承担）；Review Gate R1 Pass → R2 Pass（修复点复审）。证据见 [M3-4 记录](../design/governance/2026-09-21-m3-4-trigger-unstyled-convergence.md)。**M3-5 实现完成、Review Gate 已放行（2026-09-22）**——R1 并发分区（A 装置本体 Pass / B 接线与收口 Reject：§3 项数双重计入 1 处）→ 修复（含分区 A 的静默路径 W1「强制伪类 / 聚焦失败入 `errors`」与 W2「`--freeze` 严格参数解析」及 3 条 suggest）→ **R2 Pass（blocker 归零）**。一次性采集装置（`.temp/capture/`，gitignored）迁入 `test/capture/`：聚焦夹具（独立 Vite 应用，消费 `src/` 源码，`CAOMEI_SRC` 支持改动前 A/B 采集）+ `capture.mjs`（采样 → 受检面自检 → 与冻结基线逐属性比对）/ `diff.mjs`（纯函数 + CLI）/ 冻结基线 `baseline.json`（`--freeze` 生成，随装置同提交）；命令 `pnpm capture:styles` / `pnpm capture:styles:freeze`，接入 `regression-weekly.yml`（沿用该 job 已装好的 Chromium）。采样面 **239 项**（size 21 / tier 26 / state 8 / trigger 12 / variant 50 / button 54 / button-focus 54 / 局部层叠 6 / 浮层 8），相对一次性装置 262 项**未纳入 23 项并逐条登记依据与触发点**（浮层面板 z-index 9 / toast 视口与 tone 6 / confirm-dialog 2 / 小屏媒体查询档位 6）。**等价证据**：一次性装置在当前 HEAD 复跑与其历史产物 `.temp/capture/m34-after.json` **262 项 0 差异（同源确认）** → 与入库装置按语义前缀映射对照 **交集 239 项逐属性 0 差异**、仅存于旧装置 23 项（与登记一致）、仅存于新装置 0 项；**负向对照**（md 档 input 高度 `+1px`）报 1 处差异、还原后 0 差异；冻结基线自一致复跑 0 差异。**交叉复算捕获两处真实缺陷**（聚焦采样目标写错致 `:focus-within` 未触发；Reka 实例计数器 `-v-<n>` 随夹具漂移未归一）。**规模回填（§5）**：计入阈值的新增 1323 行 / 13 文件（装置 1198 + 接线与配置 7 + 文档与规划 118；`baseline.json` 1806 行为生成物不计入），实测 `git diff --cached --stat` = +3129 −1；超阈值说明见记录 §8。证据见 [M3-5 记录](../design/governance/2026-09-22-m3-5-computed-style-capture-landing.md)。

#### M4 可访问性自动化回归

- 执行范围：引入 axe-core 做**组件级**可访问性断言（受检面 = 组件族根组件，对外导出穷尽登记，见 [M4-1 记录](../design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md)）；先建立并登记既有例外清单，再接入门禁。
- 非目标：不引入 E2E 入门禁与视觉回归基线；不做 flaky 治理。
- 最小验收标准：既有例外登记外零违规；例外清单可复验（含组件集 / 规则集 / 判定依据）；守卫连续 ≥5 次零失败、无新增 flaky。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M4-1 | 既有例外清单建立 | 对受检面（组件族根组件，对外导出穷尽登记）跑 axe-core，登记既有违规、判定依据与例外范围 | 清单可复验（组件集 / 规则集 / 快照日期）；未裁定项不静默豁免 | — |
| M4-2 | a11y 断言接入门禁 | 以 axe-core 对受检面做断言并接入门禁路径（门禁强度相对现状只增不减） | 例外外零违规；门禁路径可复现；连续 ≥5 次零失败 | M4-1 |

状态（M4）：**M4-1 已交付并提交 901297f（2026-09-22）**——以 `axe-core`（devDependency）× Vitest `happy-dom` 建立组件级审计装置（`test/a11y/`：受检面声明 / 规则面 / 审计器 / 测试；命令 `pnpm test:a11y`，53 tests / 6 秒级）。**受检面口径可复验**：受检单位为组件族根组件（47 夹具），对外导出（`caomeiComponents`，79 个）按四组穷尽登记并由单测机检——47 夹具根 + 19 个由夹具组合渲染（运行期断言）+ 12 个需交互展开面板（逐条理由 + 触发点）+ 1 个不渲染自有 DOM；子部件不再以「随族组合覆盖」一句概括，改为逐条登记 + 运行期断言。**规则面**：16 条禁用规则逐条带理由（6 条页面级结构 + 10 条依赖布局引擎，依 axe 的 JSDOM 支持说明与 axe-core#4021 逐条自证），其余默认规则全部生效。**既有例外清单 3 条，全部已裁定、无静默豁免**：`CaomeiToastProvider` 的 `aria-hidden-focus` ×2（Reka `Toast/FocusProxy` 焦点哨兵，上游有意模式）、`CaomeiMultiSelect` 的 `aria-valid-attr-value`（关闭态 `aria-controls=""`；真实 Chromium 实测开启态指向正确面板 id）、`CaomeiCalendar` 的 `aria-prohibited-attr`（`aria-label` 落在 `role=generic`；真实 Chromium AX 树实测名称可解析为 `日历, 2026年9月`）。**边界**：受检状态为默认（关闭）态（Dialog / Drawer 以 `:open` 挂载），12 个面板内导出与依赖布局的规则（对比度 / 触摸目标 / 焦点顺序）不在受检面并已登记触发点；`passes` 计数不等于覆盖充分；「例外外零违规」断言与门禁接线留 M4-2。另发现「无 `CaomeiStepperDescription` 的步骤产生悬空 `aria-describedby`」，与 3 条例外修复候选一并入 [Backlog](./backlog.md)（含浮层展开态断言候选）。证据见 [M4-1 记录](../design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md)。 **M4-2 实现完成（2026-09-22，待 Review Gate 放行）**——把 M4-1 的例外清单从记录搬进机检数据（`test/a11y/exceptions.ts`，含判定依据指针）并落**两向断言**：① 每个组件的 `violations` / `incomplete` 必须 ⊆ 已登记例外（**例外外零违规**）；② 已登记的例外**必须仍然命中**（防清单腐烂：修复落地后须重新裁定并删除该条）；③ 清单自身守卫（组件 ∈ 受检夹具 / 键唯一 / 逐条带依据）。**门禁路径**：断言位于 `pnpm test` → 随 `pnpm verify` 与 CI 合并门禁（`test.yml` 的 `test-build` job 跑 `pnpm test:coverage`）生效；定向入口 `pnpm test:a11y`；**门禁强度相对现状只增不减**（新增会失败的断言，未放宽既有检查、未把浏览器依赖引入 `verify`）。**负向对照两向实测灵敏**：删掉 Toast 例外 → 报「未登记的 violation」；加一条不命中的例外 → 报「未再命中」。**连续零失败**：`pnpm test:a11y` 连续 5 次 54 passed；全量 `pnpm test` 连续 2 次 1506 passed（并行负载无新增 flaky）。**边界**：例外判定证据仍以 [M4-1 记录](../design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md) §3 为准；`incomplete` 与 `violation` 分开断言；axe 版本敏感，升级后须重跑并重新裁定。证据见 [M4-2 记录](../design/governance/2026-09-22-m4-2-a11y-gate-wiring.md)。

#### M5 治理守卫精选

- 执行范围：规划编号守卫；治理记录索引与指针守卫；文档完整性守卫的归档误报；wisdom 蒸馏机检完备性；Phase 11 M2-2 记录 §9 载体一致性缺口。
- 非目标：不修改 `AGENTS.md`；不做与守卫无关的规则重写。
- 最小验收标准：每项守卫带正反例语料、接入 `governance:check` 或 `docs:check`，且「受检范围未被静默收窄」可断言。

| 编号 | 条目 | 范围 | 最小验收标准 | 依赖 |
| :-: | --- | --- | --- | :-: |
| M5-1 | 规划编号守卫 | 代码注释 / 测试名不得含规划编号（如 `T001` / `P1-1`）的机检规则 | 守卫带正反例语料；全库零误报；接入 `governance:check` | — |
| M5-2 | 治理记录索引与指针守卫 | 治理索引完整性（`index.md` 与记录文件集合对账）+ 历史规划指针失效（归档后指针指向已清空段落） | 两类守卫带正反例语料、接入 `governance:check`，全库零误报 | — |
| M5-3 | 文档完整性守卫的归档误报 | 修正 `check-docs-integrity.mjs` 在阶段归档后常驻的缩减告警（区分「归档移除阶段标题」与「正文被截断」） | 阶段归档后零误报；「受检范围未被静默收窄」可断言 | — |
| M5-4 | wisdom 蒸馏机检完备性 | 蒸馏计数对账脚本化 | 计数对账可复现并接入门禁；零误报 | — |
| M5-5 | M2-2 §9 载体一致性缺口 | 复核并修正 Phase 11 M2-2 记录 §9 中「scanner 漏检路径已登记 Backlog」的断言（`docs/plan/` 下无对应载体） | 断言与载体一致（补登记或修正措辞），不留双口径 | — |

状态（M5）：**M5-1 已交付（2026-09-22）**——新增 `check:planning-numbers`（`scripts/governance/check-planning-numbers.mjs`）：受检面为代码注释（`//` / 块注释 / 模板注释）与测试名（`describe` / `it` / `test` 首个字符串参数，含 `.each` 等修饰链），四段形态（条目 / 三位编号 / 审计编号 / 阶段）；测试名只在代码位置识别（以词法屏蔽区间过滤字符串内伪调用），未闭合单 / 双引号按非字符串放弃，避免正则字面量引号与模板撇号吞掉其后注释；文档路径编号为小写故不命中，代码字面量不扫（真实常量例外）。接入 `governance:check`；正反例语料 **39 tests**（含 `UTF-8` / `ISO-8601` / `SHA-256` 等规范名与型号撞车边界）；负向对照两规则各一次实测 exit 1；首跑即修复 `tsdown.config.ts` 注释内既有规划编号（改为文档路径指针）。同步规划规范 §4 单点声明。**Review Gate R1 Pass（0 blocker / 2 warning / 3 suggest）→ R2 Pass（RG-W01 / RG-W02 / RG-S03 关闭，RG-S01 / RG-S02 以显式边界声明关闭；3 项 follow-up 不阻断）**。规模：5 文件 / +752 −4（新增守卫 446 行 + 单测 299 行）。 **M5-2 已交付（2026-09-22）**——新增 `check:governance-records`（`scripts/governance/check-governance-records.mjs`）：① 治理索引**双向对账**（记录集 ↔ `index.md` 链接：`missing-from-index` / `dangling-index-entry`；索引缺失 / 记录集为空 / 索引无记录链接三类拒绝空扫描通过）；② 历史规划指针失效（链接文字含阶段 / 条目编号而 `docs/plan/` 目标已无该标识，兼容省略 `.md` 与带 title 写法）。首跑命中 4 处失效指针（`[Phase 10](../../plan/todo.md)`，阶段归档后段落已清空）→ 改指 `todo-archive.md`。正反例语料 **24 tests**；仓库级负向对照（临时记录文件：未登记 + 失效指针）双类型 exit 1。单点定义落规划规范 §7（归档后回扫历史规划指针），ai-collaboration §8 改为链接引用。**Review Gate R1 Pass（0 blocker / 2 warning / 5 suggest）→ R2 Pass**（S01 带 title 链接 / S02 嵌套路径口径 / S03 单点定义关闭；W01 / W02 为**已披露的有意边界**——跨阶段编号复用 fail-open、散文断言不在受检面，均为假阴性且未突破「全库零误报」）。规模：7 文件（2 新增 + 5 修改）/ +680 −6。 **M5-3 已交付（2026-09-22）**——`check-docs-integrity` 的豁免口径由「全标题数不得减少」改为「**H1/H2 骨架标题数不得减少**」（层级由 `STRUCTURAL_HEADING_MAX_LEVEL` 单点派生，计数实现随常量变化）：阶段 / 条目标题写在 H3/H4、属归档正常移除面，「正文被截断」由骨架（H1/H2）缺失识别。**双向仓库级对照**：模拟归档形态（115 → 19 行、移除 H3/H4 阶段段）**零告警**；其上去掉一个 H2 → 告警 1 条。单测 **24 tests**（含「归档不告警而全标题数确实下降」的收窄证据与常量-行为绑定断言）。未采纳项转 follow-up：告警文案未随常量派生（F1）、`maxLevel` 非法值无校验（F2）。规模：2 文件 / +108 −27。**Review Gate R1 Pass（0 blocker / 1 warning / 4 suggest）→ R2 Pass（0 blocker / 0 warning / 2 suggest）**。 **M5-4 已交付（2026-09-22）**——`distill-wisdom` 新增 `--reconcile` 与 `check:distill-archive`（接入 `governance:check`）：归档批次段**前言**声明的「活跃 N 条」（可选「归档摘要 N 行」）须与该段内顶层 bullet 数一致，声明缺失 / 数值不符 / 归档缺失均 exit 1；对账起始批次 `2026-09-14`，更早旧格式段不强制声明。**仓库级负向对照两向**（改声明数值 / 删声明行）均 exit 1 且消息精确，还原后 exit 0。单测 **17 tests**；同步 Session Wisdom 蒸馏机制 §3~§6（声明基准、工作流、输出契约、集成点）。未采纳项转 follow-up：测试 helper 的仓库根锚定口径（与既有守卫测试族一致）。规模：4 文件 / +262 −13。**Review Gate R1 Pass（0 blocker / 1 warning / 3 suggest）→ R2 Pass（0 blocker / 0 warning / 3 follow-up）**。 **M5-5 已交付（2026-09-22）**——复核 Phase 11 M2-2 记录 §9 的「已登记 Backlog」断言，判定为**措辞错误**并拆分修正：「D1 同类残留 8 处 / 4 组件」确以「重新取证」口径登记于 Backlog（后续已由重复声明守卫条目清理并落地机检）；「scanner 漏检路径」实为 M2-2 内修复（记录 §3.5 的 S2 收口），**非 Backlog 载体**。下一阶段范围评估 §2 该行同步补复核结论，不留双口径。规模：2 文件 / +2 −2。

#### 不纳入本阶段（含依据）

| 项 | 依据 |
| --- | --- |
| CI 自动发布启用 | 用户裁定 ④：不启用，保持手动发布 |
| Phase 8 下游兼容性回归机制 | 用户裁定 ⑧：等待下游完成接入 |
| momei 侧迁移（B0b / B2 / B3 / B4） | 执行主体为 momei 仓库（外部） |
| E2E 常驻 / 浮层规格入门禁、视觉回归基线、flaky 治理 | 容量所限，留 [Backlog](./backlog.md) |
| 对比度遗留项盘点、实底前景 token 配对复核 | 涉改色 / 跨主题配对，须另行裁定，留 [Backlog](./backlog.md) |
| 迁移口径一致性守卫、等价验证产物入库 | 未纳入本阶段（后者已折入 M3-5 的取证装置入库） |
| 组件长尾与能力（Sidebar / DatePicker 范围选择 / ColorPicker 色板导航等） | 条件触发，留 [Backlog](./backlog.md) |
| 文档站演示动画遗留项、示例外部图片依赖、首页 hydration mismatch | 未纳入本阶段，留 [Backlog](./backlog.md) |
| 覆盖率进入日常 `test` / `verify` | 用户 2026-09-20 既有裁定维持 |
| RTL / `useDialog` / 语言矩阵长期 / @iconify/vue / Tailwind preset / Storybook / 富文本与图表 | 条件触发或已有裁定（不纳入） |
| 触摸目标 ≥44px | 用户既有裁定：暂不提升 |
| AI 资产指针（`AGENTS.md`） | 受保护文件，须用户明确指示 |
| T1~T6 中未列入 M1~M5 的其余已盘点候选 | **未取用**（容量所限），原行保留于 [Backlog](./backlog.md) 待另行决策——含 Review Gate 证据留存、滚动容器键盘聚焦、locale 守卫能力演进、执行层规则重述与失效引用收敛、ui-validator 资产 follow-up、CHANGELOG 生成器健壮性收口等 |

## 未完成项汇总

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- **未启动 / 未完成阶段**：Phase 8（下游兼容性回归机制）——用户 2026-09-21 裁定维持未启动，等待下游完成接入。范围见[路线图](./roadmap.md)。
- **等待外部反馈**：momei 侧迁移（B0b 视觉基线 / B2 / B3 / B4）由 momei 项目在其仓库执行，本仓不触碰 momei 文件；本仓等待其反馈后再决定下一轮动作。
- **后置项**：Phase 5 第二阶段的下游接入验证（发布后由下游实际迁移反馈驱动）。
- **未纳入任何阶段的候选**：见 [Backlog](./backlog.md)（组件增强、国际化与 RTL、移动端与响应式、基建与治理、服务层、下游协同等分组）。
- **已完成阶段的遗留项与已知偏差**：见[待办归档](./todo-archive.md) 与 [Backlog](./backlog.md)（后者承载其中仍待决策的候选）。
