# Phase 26 G4：`1.0.0` 回滚方案与 known limitations

- 时点：2026-10-31
- 范围：G4 发布证据中的**回滚方案**与 **known limitations 汇总**（含安全复核口径、用户授权清单）
- 状态：回滚方案与 known limitations **已就绪**；安全告警复核**已完成（2026-11-02，§4）**；用户授权待发布当日（§5）
- 上游：G3 收口见 [G3 记录](./2026-10-29-phase26-g3-rc-release-readiness.md) §6.1；1.0.0 里程碑文案见 [M3-2 记录](./2026-10-31-phase26-m3-2-1.0.0-release-notes.md)
- 下游：`M3-3` 1.0.0 交付执行

## 1. G4 证据清单

| 证据 | 状态 | 载体 |
| --- | --- | --- |
| 1.0.0 CHANGELOG 里程碑段 | 文案定稿；实际落盘在 `M3-3` 的 `changelog` 步骤后（生成器会重写文件） | [M3-2 记录](./2026-10-31-phase26-m3-2-1.0.0-release-notes.md) §2 |
| GitHub Release note | 与 CHANGELOG 同源，`announce` 抽取 | 同上 §4 |
| version policy（1.x 承诺 / 冻结面 380 / 弃用政策） | 已完成（2026-10-24） | [版本与兼容策略](../../guide/version-policy.md)（中英） |
| known limitations | 已就绪（§3）：11 条，其中 7 条对外披露（6 条「已知限制」+ 1 条「升级注意」） | 本记录 §3 |
| 回滚方案 | 已就绪（§2），运行手册同步 | 本记录 §2、[发布指南](../../guide/release.md) §8 |
| 产物 README 版本句（流程修复） | 已修复：`sync` 前置于 `publish`（§2.6） | `scripts/release/manual-release.mjs` `STEPS` + 单测 |
| 安全告警复核（§2.1） | **已完成（2026-11-02）**：`Security Alerts` run [`41438930655`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/41438930655) success（§4） | `Security Alerts` workflow / `pnpm check:security-alerts` |
| 用户明确授权 | **待**（授权项见 §5；推送范围已完成并随 `652dc23` 同步，本批回填待提交） | 会话记录 |

## 2. 回滚方案

### 2.1 触发分级与决策权

| 级别 | 判据 | 目标动作 |
| --- | --- | --- |
| **P0** | **下游无法安装**：解析失败、tarball 损坏、`engines` 误伤等（`npm install` 直接失败） | **立即（分钟级）**：`deprecate` + `dist-tag` 回退 `latest`，随后修 patch |
| **P1** | 下游可安装但 `typecheck` / `build` 失败，或核心组件运行时阻断业务 | 24 小时内 `deprecate` 并给出计划；72 小时内 patch 或完成回退 |
| **P2** | 视觉 / 文案 / 非阻断缺陷 | 常规 patch，不 `deprecate` |

- **决策权在维护者（用户）**：AI 只准备命令与证据；执行回滚、回退 `latest`、编辑 Release 均需逐项授权。
- **P0 不再等 24 小时**：最高优先级的**止血动作**是 `dist-tag` 回退（`deprecate` 同批执行、只负责告知）——`deprecate` 只产生安装告警、不阻断安装，对「装不上」无效。

### 2.2 处置阶梯与命令

阶梯（`deprecate` → patch → `dist-tag` 回退 → 恢复）、回退的作用范围、三处信号对齐、`--otp` 与命令细节的唯一事实源是[发布指南 §8](../../guide/release.md)；禁止项见本记录 §2.3。本记录只保留 `1.0.0` 特有的执行要点：

- **P0 的两个动作同批在分钟级完成**：`deprecate` 负责告知、`dist-tag` 回退负责止血；后者才真正阻止新安装拿到问题版本（`deprecate` 只产生安装告警）。
- **回退的作用边界**：`dist-tag` 只改不带范围的新安装；已锁 `1.0.0` 或 `^1.0.0` / `~1.0.0` 的下游仍解析到问题版本，只能靠 patch 或显式 pin —— 因此回退必须与下游通知同时进行。
- **信号对齐**：`npm view caomei-ui dist-tags --json`、GitHub Release 的 Latest 归属、README / roadmap 的「当前版本」句三者一致；回退期间用 `gh release edit v1.0.0 --latest=false` 让最新版让位。
- **`next` 通道**：1.0.0 转正后 `next` 仍停在 `1.0.0-rc.1`，`@next` 用户会拿到更旧且无修复的预发布；由下一次预发布或 `npm dist-tag add caomei-ui@1.0.0 next` 前移。

### 2.3 禁止项

- **不 `npm unpublish`**：受 72 小时 / 依赖方数量 / 所有权政策约束，且会让已锁定的下游出现不可预期解析；替代是 `deprecate` + patch。
- **不重写、不移动已推送 tag**（`v1.0.0` 永久指向其提交）；**不覆盖已发布 tarball**。
- **可编辑 GitHub Release 正文与 Latest 标记**（`gh release edit`），tag 与产物不动。
- 不通过删除 GitHub Release 来「撤回」。

### 2.4 回滚后的文档与版本句

- 「当前版本」句（`README.md` / `README.en-US.md` / `docs/plan/roadmap.md`）必须与**对外实际版本**一致，且**不得声明 dist-tag**（`dist-tag-in-statement` 守卫）。
- 修正后必须 `pnpm docs:check:version` 通过；`sync` 具 fail-closed 行为，改完未提交时不得继续 `announce`。
- 回滚结论（触发级别、执行动作、恢复版本、下游复验 run）写入发布治理记录。

### 2.5 近例判据：什么情况**不需要**回滚

- `1.0.0-rc.1` 的 tarball 内 README 仍声明 `0.7.0`：属**产物文案缺陷**，不影响安装 / 构建 / 运行 → 不回滚、不 `deprecate`。判据 = **是否影响安装 / 构建 / 运行**，而非「是否与仓库内容不一致」。
- 该缺陷的根因是发布链中 `sync` 位于 `publish` 之后（`npm publish` 打包当前工作区），导致**每个** tarball 的 README 都落后一版；已在 `1.0.0` 前修复（§2.6），rc.1 的已发布产物本身不可修。

### 2.6 产物 README 版本句（流程修复 + 发布后核对）

- **修复**：`STEPS` 调整为 `preflight → bump → changelog → sync → publish → verify → announce`，`sync` 的版本句随工作区进入 tarball；并有双重 fail-closed 兜底——`publish` 前断言 `package.json` 版本与全部「当前版本」句（分步执行绕过顺序时仍拦住），`verify` 解包后断言包内 README 版本句。单测覆盖顺序、纯函数与缺文件分支。
- **发布后核对（每次发布）**：
  ```bash
  npm pack caomei-ui@<version> --pack-destination /tmp/chk >/dev/null
  tar -xzOf /tmp/chk/caomei-ui-<version>.tgz package/README.md | grep -n '当前版本'
  ```
  断言解包 README 的「当前版本」句 = 目标版本；不一致即登记缺陷并按 §2.1 判级。
- **tag 视图不是有效信号**：`bump` 打 tag、`sync` 提交在其后，故 `git show v1.0.0:README.md` 仍是上一版版本句；权威校验以解包 tarball（或 `verify` 的自动断言）为准。
- **首次真实验证**：`1.0.0` 发布即该修复的首个真实 run（此前仅单测覆盖）。
- **Release note 抽取边界修复（2026-11-03，发布链就绪检查发现）**：`extractChangelogSection` 的标题匹配原为黑名单 `(?![\d.])`，`1.0.0` 会**静默命中 `1.0.0-rc.1` 段**（实测返回 rc.1 正文 16 行）——CHANGELOG 缺 `1.0.0` 段时 `announce` 会把 rc.1 内容当作 1.0.0 Release note（fail-open）。已改为「合法后继」白名单 `(?=$|\s|\()`，并补 3 例边界测试（`1.0.0` × `1.0.0-rc.1`、`1.0.0-beta` × `1.0.0-betamax`、两段并存各取本段）。修复后对当前 CHANGELOG 复算 `1.0.0` → `null`，`announce --dry-run` 走既有 fail-closed 分支（打印「尚无 v1.0.0 段落」）。

## 3. known limitations 汇总

> 「进 note」= 已写入 [M3-2 记录](./2026-10-31-phase26-m3-2-1.0.0-release-notes.md) §2，将随 1.0.0 Release note 对外披露。

| ID | 面 | 事实与证据 | 影响 | 处置 / 载体 | 进 note |
| --- | --- | --- | --- | --- | --- |
| KL-1 | 主题 · 品牌预设实底 | `momei` 亮色 `success` 三态 2.279 / 2.643 / 3.045；`caomei` `primary-solid` 4.17（G1-F §3 / §6、M5-4 §2） | 品牌预设实底元素文字可读性低于 4.5:1 | 既有品牌裁定保留，未修复未恶化；Backlog「品牌预设的 `-solid` 对比度缺口」 | ✅ 已知限制 |
| KL-2 | 组件 · 可交互边界与断言面 | Calendar 上 / 下月导航按钮、RichTextEditor 容器描边 < 3:1；装饰性分隔线、图标与插画不在 3:1 断言面内（G1-F §6） | 属交互边界未达 WCAG 1.4.11；装饰面不承诺 | 未纳入 G1-F 的 4 条断言面；Backlog「Calendar / RichTextEditor 交互边界对比度」 | ✅ 已知限制 |
| KL-3 | 回归覆盖面 | 常驻矩阵 390 / 768 / 1280（另 320 / 900 定向档），375px 仅画廊与 DataTable 键盘滚动专项；全部 Chromium（`playwright.config.ts`、`playwright.gallery.config.ts`） | Firefox / WebKit 的 `color-mix()`、焦点环、方向键滚动未取证 | 后续矩阵扩展；本轮不承诺三内核一致 | ✅ 已知限制 |
| KL-4 | a11y 断言面 | 禁用态按 WCAG「非活动控件」豁免（G1-F §6） | 禁用态对比度不作保证 | 维持豁免口径 | ✅ 已知限制 |
| KL-5 | 视觉回归精度 | 快照比对双轴容差 `threshold: 0.1` + `maxDiffPixels: 100`（`playwright.visual.config.ts`） | 极小尺寸组件的细微色差可能不触发差异 | 颜色类回归以 `capture:styles` 计算样式采样为主证据 | ✅ 已知限制 |
| KL-6 | 下游自定义 | 消费方覆盖 `--caomei-*` 后的对比度由使用方负责（G1-F §6） | 覆盖 token 后可能低于 4.5 / 3:1 | 已在「升级注意」声明责任边界 | ✅ 升级注意 |
| KL-7 | 国际化 | 一期 5 语（es / fr / de / ru / pt）文案由 AI 生成，母语审校待完成（Phase 25 M3-1b） | 措辞可能不地道 | **M4-2 已裁定（2026-11-01）：未复核，保留保守表述、不带默认质量承诺**；措辞已冻结进 M3-2 §2 文案（将随 1.0.0 Release note 披露） | ✅ 已知限制 |
| KL-8 | 产物（仅 rc.1） | `1.0.0-rc.1` tarball 内 README 声明 `0.7.0`：`sync` 在 `publish` 之后导致 | 仅影响 rc.1 的 npm 页面文案；已发布 tarball 不可修 | 流程已修（§2.6），`1.0.0` 起正确；不重发布 rc.1 | ❌（仅 rc.1） |
| KL-9 | 文档站示例 | `/components/input-group` 的 `CaomeiSelect` 仍以 placeholder 代替可访问名；该页不在 `check-docs-axe` 的 5 页矩阵内 | 仅文档站示例，不影响库内组件 | Backlog「文档站 a11y 抽检矩阵外示例」 | ❌ |
| KL-10 | 依赖冻结 | `reka-ui` 钉 `2.10.4`（2.10.5+ 导致 `InputNumber` 步进 emit 回归） | 无法受益于上游补丁版本 | Backlog 触发条件：`reka-ui ≥ 2.11.0` 下 4 例回归测试全过 | ❌（内部依赖） |
| KL-11 | 供应链 | Dependabot 1 项 `low`（`deepmerge`，上游无补丁，开发作用域） | 不进入运行时产物 | 按安全规范 §2.1 可暂缓；豁免清单为空、未豁免任何 high+ | ❌（安全记录） |

**关于 G1「明确接受」分支的披露要求**：[门禁规划](./2026-10-26-phase26-ui-gate-planning.md) §4.2 要求「明确接受」时在 version-policy 与 CHANGELOG 列出四项对比度缺口。本次用户已裁定**修复分支**（G1-F），该条不适用；其中 `caomei` `text-muted` 4.02、品牌预设 soft / outline 状态文本、默认预设 soft warning 贴线项均已随 G1-F 收敛，残余仅 KL-1 / KL-2，按上表与 Backlog 登记。

## 4. 安全告警复核（§2.1）

- **前次读数**（`852bdcb` 推送触发，`Security Alerts` run `41030304849`，2026-10-30T09:00:41Z）：**success**。
  - Dependabot open：**1**（`deepmerge`，`low`，上游无补丁，开发作用域）。
  - Code Scanning open：**0**。
  - 豁免清单：`.github/security-alerts-exemptions.json` = `{"exemptions": []}`（未豁免任何 high+）。
- **发布前读数（2026-11-02，`652dc23`）**：`Security Alerts` run [`41438930655`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/41438930655) **success**，日志读数为 `critical 0 / high 0 / medium 0 / low 1 / note 0`，豁免 0 项（输出「无 critical / high 阻塞（1 项可暂缓，0 项豁免）」）。与 10-30 读数一致，无新增告警面。
- **判据**：critical = 0；high 全部修复或按 §2.1 留痕豁免。当前无 high / critical，判据满足。

### 4.1 发布前 CI 取证（2026-11-02，提交 `652dc23`）

| run | workflow | 结果 | 用途与读数 |
| --- | --- | --- | --- |
| [`41438930655`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/41438930655) | `Security Alerts`（`workflow_dispatch`） | success | G4 §2.1 安全复核：critical / high / medium 均 0，low 1（`deepmerge`），豁免 0（见上） |
| [`41438974434`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/41438974434) | `Weekly Regression`（`workflow_dispatch`） | success | 运行器 `Image: ubuntu-24.04`（三作业一致，未出现 `ubuntu-26.04`，CI 镜像检测点仍未命中）；`test:visual` 33 / 33、`capture:styles` 0 差异（349 项逐属性与冻结基线一致）、画廊回归 13 / 13；`test:e2e` 见 §4.2 |
| [`41438865491`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/41438865491) | `Downstream Compat`（`workflow_dispatch`） | success | dependfix `dependfix/dependfix @ 08ad8f1`，目标版本 `caomei-ui 0.7.0`（缺省入参，**旧于 rc.1**），`typecheck` + `build` 绿。**非 1.0 兼容证据**，仅证明下游 revision 前移后仍可构建 |

- 三个 run 均落在 `master` 的 `652dc23`，与 `origin/master` 一致。
- 下游复验口径说明：本次为**缺省版本入参**（`0.7.0`）的下游 revision 复验，目标版本旧于 `1.0.0-rc.1`，**不替代也不充实** G3 / M4-1 的 rc.1 结论；1.0.0 tag 的下游 run 仍是 G4 判据里的首次真实验证。下游 revision `08ad8f1` 仅作记录，M4-1 的 `a95c1068` 结论不变。

### 4.2 判别力说明：周级 `test:e2e` 为非阻断步骤

`regression-weekly.yml` 的 `Run E2E tests` / `Run docs site browser regression` 两步为 `continue-on-error: true`，**作业与 run 的 success 不等于该步骤零失败**。本次实测：

- `test:e2e`（run `41438974434`）：`2 failed / 3 flaky / 4 skipped / 430 passed`（合计 439）。失败为 `mobile-320` 定向档 `responsive.e2e.ts` 的两例（`DatePicker` / `DatePicker 右缘窄触发器`），读数 `scrollHeight=267 > clientHeight=258`，含 retry #1。
- 对照 run [`41053510073`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/41053510073)（`852bdcb`，2026-10-30）为 `0 failed / 0 flaky / 4 skipped / 435 passed`（合计 439）；`852bdcb..652dc23` 区间 `src/**` 与 `test/e2e/**` 零变更（该区间改动为 `.github/workflows/release.yml`、`docs/**`、`scripts/release/**`）。
- **复跑复核**（run [`41450700126`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/41450700126)，同日 `652dc23`，`workflow_dispatch`，13:10Z 起约 10.3 分钟）：`2 failed / 4 flaky / 4 skipped / 429 passed`，失败用例与读数**逐字相同**（267 > 258，含 retry #1）；429 与 430 的 1 例差异来自 retry 面（本次多 1 例首次失败后重试通过，`flaky` 3 → 4）。两轮运行器镜像版本一致（`20261025.353.1`）。
- 判读：同日同输入下两轮均稳定失败（2 / 2，读数一致）⇒ 该 2 例不是单次偶发；同日套件另有 flaky（两轮分别为 3 例 / 4 例，均为 `menu-navigation` 重试通过），与本失败无关。
- **根因（2026-11-02 本地实测，Chromium / 320×568）**：日历行数随月份变化（`fixedWeeks` 默认 `false`，zh-CN 周一起始）：2026-10 为 5 行、内容高 **235**（面板收缩到 235，无滚动）；2026-11 为 6 行、内容高 **267**（`padding 12 + 12` + 日历 243）。可用高（border box）由触发器位置决定，本次实测 **260**（触发器 `y=308`、视口高 568、面板贴底），面板 client 高 **258**（上下边框各 1px）⇒ 6 行月内容 267 溢出 **9px**（按 client box）；`overflow-y: auto` 下滚 9px 即见末行（实测 `scrollTop 0 → 9`，末行 `bottom=555 ≤ clientBottom=567`）。
- 因此 **10-30 的 run（10 月，5 行）通过、11-02 的 run（11 月，6 行）失败**，由内容高差直接解释，此前的「月份 / 周行数」假设成立。
- 但判定不变：矩阵 #6 明写「最多占满可用高」+ `overflow: auto` 滚动降级，6 行月在小屏滚动 9px 属**设计内行为**；失败的是「不得有任何纵向溢出」这一比契约更严的断言。
- **处置**：断言改为「内容完整 **或** 滚动可达」双分支，并新增「滚到底后末位成员完整落在面板 client rect 内」检查（`expectCappedPanelContentReachable`）；矩阵 #6 与 §4 断言 3 同步。Backlog 的缺陷候选因非产品缺陷而移除。**仍不作「E2E 全绿」证据引用**（该步骤另有 flaky），见 §6。

## 5. 用户授权清单（逐项）

1. 推送本地提交到 `origin/master`。**推送范围已完成（2026-11-02）：含 `3b76903` 在内的提交已在 `652dc23`；本批 G4 回填尚未提交，待其落盘并推送后另行确认。**
2. 执行 `1.0.0` 发布链：`bump → changelog → 插入里程碑段并单独提交 → sync → publish --tag=latest → verify → announce`（`sync` 在 `publish` 之前，版本句才随 tarball 发布）。
3. 推送 tag `v1.0.0`（annotated tag 已由 `bump` 创建，此处只推送；`announce` 前需已推送）。
4. 创建 GitHub Release `v1.0.0`（正式版，占 Latest）。
5. 若发布后需回滚：`deprecate` / `dist-tag` 回退 / Release 正文与 Latest 编辑（按 §2 分级）。

## 6. 未覆盖边界

- **回滚未演练**：无预发 registry，§2.3 的命令只做语义核对；首次真实执行即回滚现场。
- **回退后的版本句修正**未固定到具体命令：`sync` 以 `package.json` 版本为锚点，回退场景需人工判断对外版本并以 `docs:check:version` 兜底。
- **`sync` 前置**由三层兜底：`STEPS` 顺序单测、`publish` 前置断言（`package.json` 版本 + 全部「当前版本」句）、`verify` 产物断言（解包 tarball README），首次真实发布验证落在 `1.0.0`。
- **KL-7** 的措辞已按 `M4-2` 裁定（未复核）冻结为保守表述；若后续完成母语审校，在下个 patch 的 Release note 中更新，不回改本记录。
- **安全读数**已以 2026-11-02 的 `Security Alerts` run `41438930655` 覆盖 10-30 读数（§4）；`1.0.0` `publish` 当日若再触发提交，该 run 不自动覆盖——按需复跑一次并回填 §4。
- **周级 `test:e2e` 的 2 例失败已定位并处置**（§4.2）：6 行月份内容高 267 > 面板 client 高 258（border box 260），滚动 9px 可达末行，属矩阵 #6 的设计内降级；原断言比契约更严。已改为「内容完整或滚动可达」双分支（含滚到底末行可见检查），矩阵 #6 与 §4 断言 3 同步；Backlog 缺陷候选因**非产品缺陷**移除，**本条不再作为待决策候选**——若将来出现「小屏 6 行月不得滚动」的产品裁定，按新条目重开。不判 1.0 回归，但仍**不得表述为「E2E 全绿」**（该步骤另有 `menu-navigation` 的 flaky：ArrowLeft / Escape，两轮分别为 mobile ×2 + tablet ×1 与 mobile ×2 + tablet ×1 + desktop ×1）。
- **`test:e2e` / 画廊回归 / `pnpm audit` 的 `continue-on-error`** 是既有设计（周级作业长期非阻断），本次未改动；因此周级 run 的 success 只代表阻断步骤全绿——即 `capture:styles`、`test:visual`、`Check licenses` 及各 `Core Regression` 步骤，不代表 `test:e2e` / 画廊回归 / `pnpm audit` 零失败。
- **run id 字面不可机检**：`governance:check` / `docs:check` 都不校验 run id 是否存在或与 URL 一致（本轮回填即出现 1 处过手误），复核时须 `gh run view <id>` 实开一次。

## 7. Review Gate

- **R1（standard）：Reject**（1 blocker / 3 warning / 6 suggest）：blocker 为「`1.0.0` 重建自然修复 rc.1 README」与发布链顺序相反（`publish` 先于 `sync`）；用户裁定**改发布链**。
- **R2（standard）：Pass**（0 blocker / 5 warning / 4 suggest）：B1 闭环；残留英文回滚段旧模型、脚本 docblock / `todo` M3-3 旧顺序、tag 视图残差、`publish` 缺版本句前置断言。
- **R3（standard）：Pass**（0 blocker / 1 warning / 6 suggest）：新增断言在缺文件时 fail-open，已改为全量读取 + 显式缺 README 报错，并补 4 例集成级单测。
- **R4（quick）：Pass**（0 blocker / 0 warning / 4 suggest）：fail-open 闭环；3 条措辞同批修正，1 条（版本句判定与 `check-site-version` 去重）登记后续。
- **2026-11-01（quick，M4-2 = 未复核裁定回填）：Pass**（0 blocker / 2 warning / 4 suggest）；KL-7 冻结为保守表述。
- **2026-11-02 R1（standard，G4 取证回填）：Reject**（1 blocker / 6 warning / 5 suggest）：blocker = 下游 run id 手误（`41438965491` → 实为 `41438865491`，链接 404）；warning = §4.2 归因越界（「子像素」定性 + 失效归档引用）与 §6「未定性」矛盾、阻断步骤清单误含 `pnpm audit`、§5 推送完成范围混入未提交载体、`todo` 的「G4 收口」与门禁表「进行中」口径分裂、对照 run 未给 id 且「同提交」措辞错误、下游 run 目标版本旧于 rc.1 未标注。
- **2026-11-02 R2（standard，delta）：Pass**（0 blocker / 0 warning / 5 suggest）；B1 + W1 ~ W6 全闭环，5 条 suggest 同批修正（标题前空行、§1 授权行口径、处置①登记名、第二个失败用例名、`M4-1` 反向指针）。
- **2026-11-02 R1（quick，复跑复核与 320px 缺陷候选登记）：Reject**（2 blocker / 3 warning / 4 suggest）：blocker = 「排除随机 flaky」结论越界（同日套件另有 3 / 4 例 flaky，且日期相关性未排除）、两轮读数把 flaky 计成 skipped 并与「总例数 439」自相矛盾；warning = Backlog 断言「纵向裁切」未取证可见性、「唯一差异是日历日期」写成事实、§6 把处置 ② 写成部分已执行。
- **2026-11-02 R2（standard，delta）：Pass**（0 blocker / 0 warning / 3 suggest）；B1 / B2 / W1 ~ W5 / S6 / S8 / S9 全闭环，3 条 suggest 同批修正（「失败读数」措辞、来源补日期、flaky 计数表述）。
- **2026-11-02 R1（standard，日历面板内容完整性断言口径修正）：Reject**（1 blocker / 3 warning / 3 suggest）：blocker = 根因段把「日历行数随月份变化（`fixedWeeks` 默认 false）」写成「恒 6 周、与日期无关」；warning = 双 JSDoc 悬空、flaky 用例名缺证据、Backlog 删行缺终局含义。
- **2026-11-02 R2（standard，delta）：Pass**（0 blocker / 1 warning / 2 suggest）；B1 + W1 ~ W4 / S5 ~ S7 闭环，RG-W5（260 为 border box / 258 为 client 高）与 S2（判别力三分表述）同批修正。
- **2026-11-03 R1（deep，Release note 抽取边界修复）：Pass**（0 blocker / 1 warning / 2 suggest）：warning = 黑名单仍会漏 `1.0.0-beta` × `1.0.0-betamax`（字母续接），已改为白名单并补该例；suggest = M3-2 预演段补「插入前返回 `null` 属预期」。
- 证据与未覆盖边界见 `artifacts/review-gate/2026-10-31-g4-rollback-known-limitations.md`、`artifacts/review-gate/2026-11-01-m4-2-locale-verdict.md` 与 `artifacts/review-gate/2026-11-02-g4-evidence-backfill.md` 与 `artifacts/review-gate/2026-11-02-g4-e2e-rerun-and-320px-defect.md` 与 `artifacts/review-gate/2026-11-02-320px-calendar-assertion.md`。
