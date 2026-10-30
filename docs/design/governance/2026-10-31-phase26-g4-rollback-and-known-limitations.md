# Phase 26 G4：`1.0.0` 回滚方案与 known limitations

- 时点：2026-10-31
- 范围：G4 发布证据中的**回滚方案**与 **known limitations 汇总**（含安全复核口径、用户授权清单）
- 状态：回滚方案与 known limitations **已就绪**；安全告警复核与用户授权待发布当日（§4 / §5）
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
| 安全告警复核（§2.1） | **待发布当日复跑**（当前读数见 §4） | `Security Alerts` workflow / `pnpm check:security-alerts` |
| 用户明确授权 | **待**（授权项见 §5） | 会话记录 |

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
| KL-7 | 国际化 | 一期 5 语（es / fr / de / ru / pt）文案由 AI 生成，母语审校待完成（Phase 25 M3-1b） | 措辞可能不地道 | **待 `M4-2` 裁定**：复核通过则改写该条 | ✅ 已知限制（可替换） |
| KL-8 | 产物（仅 rc.1） | `1.0.0-rc.1` tarball 内 README 声明 `0.7.0`：`sync` 在 `publish` 之后导致 | 仅影响 rc.1 的 npm 页面文案；已发布 tarball 不可修 | 流程已修（§2.6），`1.0.0` 起正确；不重发布 rc.1 | ❌（仅 rc.1） |
| KL-9 | 文档站示例 | `/components/input-group` 的 `CaomeiSelect` 仍以 placeholder 代替可访问名；该页不在 `check-docs-axe` 的 5 页矩阵内 | 仅文档站示例，不影响库内组件 | Backlog「文档站 a11y 抽检矩阵外示例」 | ❌ |
| KL-10 | 依赖冻结 | `reka-ui` 钉 `2.10.4`（2.10.5+ 导致 `InputNumber` 步进 emit 回归） | 无法受益于上游补丁版本 | Backlog 触发条件：`reka-ui ≥ 2.11.0` 下 4 例回归测试全过 | ❌（内部依赖） |
| KL-11 | 供应链 | Dependabot 1 项 `low`（`deepmerge`，上游无补丁，开发作用域） | 不进入运行时产物 | 按安全规范 §2.1 可暂缓；豁免清单为空、未豁免任何 high+ | ❌（安全记录） |

**关于 G1「明确接受」分支的披露要求**：[门禁规划](./2026-10-26-phase26-ui-gate-planning.md) §4.2 要求「明确接受」时在 version-policy 与 CHANGELOG 列出四项对比度缺口。本次用户已裁定**修复分支**（G1-F），该条不适用；其中 `caomei` `text-muted` 4.02、品牌预设 soft / outline 状态文本、默认预设 soft warning 贴线项均已随 G1-F 收敛，残余仅 KL-1 / KL-2，按上表与 Backlog 登记。

## 4. 安全告警复核（§2.1）

- **当前读数**（`852bdcb` 推送触发，`Security Alerts` run `41030304849`，2026-10-30T09:00:41Z）：**success**。
  - Dependabot open：**1**（`deepmerge`，`low`，上游无补丁，开发作用域）。
  - Code Scanning open：**0**。
  - 豁免清单：`.github/security-alerts-exemptions.json` = `{"exemptions": []}`（未豁免任何 high+）。
- **发布当日动作**：`1.0.0` `publish` 前重新执行一次（CI `Security Alerts` 手动触发，或本地 `SECURITY_ALERTS_TOKEN=<pat> pnpm check:security-alerts`），把各级 open 计数与豁免清单写回本记录 §4。
- **判据**：critical = 0；high 全部修复或按 §2.1 留痕豁免。当前无 high / critical。

## 5. 用户授权清单（逐项）

1. 推送本地提交到 `origin/master`（含 `3b76903` 及本批改动）。
2. 执行 `1.0.0` 发布链：`bump → changelog → 插入里程碑段并单独提交 → sync → publish --tag=latest → verify → announce`（`sync` 在 `publish` 之前，版本句才随 tarball 发布）。
3. 推送 tag `v1.0.0`（annotated tag 已由 `bump` 创建，此处只推送；`announce` 前需已推送）。
4. 创建 GitHub Release `v1.0.0`（正式版，占 Latest）。
5. 若发布后需回滚：`deprecate` / `dist-tag` 回退 / Release 正文与 Latest 编辑（按 §2 分级）。

## 6. 未覆盖边界

- **回滚未演练**：无预发 registry，§2.3 的命令只做语义核对；首次真实执行即回滚现场。
- **回退后的版本句修正**未固定到具体命令：`sync` 以 `package.json` 版本为锚点，回退场景需人工判断对外版本并以 `docs:check:version` 兜底。
- **`sync` 前置**由三层兜底：`STEPS` 顺序单测、`publish` 前置断言（`package.json` 版本 + 全部「当前版本」句）、`verify` 产物断言（解包 tarball README），首次真实发布验证落在 `1.0.0`。
- **KL-7** 的最终措辞取决于 `M4-2` 结论，本记录不预设结论。
- 安全读数以 2026-10-30 的 CI run 为准，发布当日必须以新 run 覆盖。

## 7. Review Gate

- **R1（standard）：Reject**（1 blocker / 3 warning / 6 suggest）：blocker 为「`1.0.0` 重建自然修复 rc.1 README」与发布链顺序相反（`publish` 先于 `sync`）；用户裁定**改发布链**。
- **R2（standard）：Pass**（0 blocker / 5 warning / 4 suggest）：B1 闭环；残留英文回滚段旧模型、脚本 docblock / `todo` M3-3 旧顺序、tag 视图残差、`publish` 缺版本句前置断言。
- **R3（standard）：Pass**（0 blocker / 1 warning / 6 suggest）：新增断言在缺文件时 fail-open，已改为全量读取 + 显式缺 README 报错，并补 4 例集成级单测。
- **R4（quick）：Pass**（0 blocker / 0 warning / 4 suggest）：fail-open 闭环；3 条措辞同批修正，1 条（版本句判定与 `check-site-version` 去重）登记后续。
- 证据与未覆盖边界见 `artifacts/review-gate/2026-10-31-g4-rollback-known-limitations.md`。
