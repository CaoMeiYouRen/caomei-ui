# 待办归档（深度归档）：Phase 27

> 自 [todo-archive.md](../todo-archive.md) 主窗口迁出；迁移为机械操作（相对链接深度 `../` → `../../`，同目录 `./` → `../`），正文不改写。阶段交付权威记录见[治理索引](../../design/governance/index.md)。

## Phase 27：移动端密度轴、`Form` 组合层、迁移护航、机制收口与 CI 发布（**2026-11-06 完成并发布 `1.1.0`**）

- 时间：2026-11-03 用户就[第十一轮范围评估](../../design/governance/2026-11-03-next-stage-scope-evaluation-11.md) §3 裁定后登记，同日执行期追加 CI 发布链路；2026-11-06 交付 **6 条主线 / 18 条原子条目**，发布 `1.1.0` 并完成阶段归档（用户指令「发布成功，请开始对相应待办进行收尾」）。
- 范围与授权：取 **A + B + C + D + E** + 执行期追加 **F CI 发布链路**，构成对账 **4 + 2 + 2 + 4 + 1 + 5 = 18**。逐条裁定——**D1** ① 五条主线全取；**D2** ① 密度轴 + P0；**D3** ① 本阶段实现；**D4** ① 阶段末发 `1.1.0`；**D5** ① 国际化二期 / RTL 维持范围外；执行期 **D6** CI 发布触发模型 = `workflow_dispatch`（2026-11-06 简化为 semantic-release 直连 + OIDC，无 `environment` 审批 / `dry_run` / `NPM_TOKEN`，见[简化记录](../../design/governance/2026-11-06-phase27-release-workflow-oidc-simplification.md)）。范围与验收口径的单一事实源见 [Phase 27 登记批次记录](../../design/governance/2026-11-03-phase27-registration.md) §1 / §2。
- 非目标：P1 / P2 命中区、RTL、二期语言、长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker）、`Form` rules 引擎、push 触发自动发布、`next` 预发布分支、破坏性 API 变更、Tailwind / UnoCSS、文档站多版本托管、Storybook、除 CI 发布提交与 tag 外不自动推送。

### M1 移动端与响应式二期（4 条）

- **M1-1 `data-density="touch"` 轴**：控件高度 36 / 44 / 52、字号 14 / 16 / 18、内容宽度上限 `none`；与预设 / 明暗正交，缺省路径零变化（提交 `1fcd32c`）。
- **M1-2 `--caomei-hit-target-min` P0 命中区**：值片删除 / 清空 / 密码 / Tag / Message 共 **37** 个目标，`::after` 扩到 ≥24×24，按钮视觉盒不变；多行值片行距 +2px（提交 `88bf50b`）。
- **M1-3 常驻回归与视觉基线**：390 / 768 / 1280 三档密度轴与命中区用例 + 视觉受检面扩入三个多值字段与 `#hit-target`，基线重冻结（提交 `3529475`）。
- **M1-4 指南与设计口径同步**：响应式设计 / 移动端指南（中英）/ 组件页密度节 / 计数与冻结面回扫（含 token 380 → 381），关闭三处旧心智表述（提交 `a195abe`）。

### M2 `Form` / `FormItem` 组合层（2 条）

- **M2-1 实现与单测**：独立组合层 + 插槽作用域（`id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`）；12 个字段组件逐项绑定；无 rules 引擎，不扩既有字段契约（提交 `b5496ef`）。
- **M2-2 文档、示例与计数回扫**：中英组件页 / 示例 / E2E / 组件总览 · 画廊 · locale 台账 · API 基线；「含内联同名字段」32 → 36（+`form/types.ts`；`Form` 为独立组合层、不继承字段契约，条件触发结论不变）（提交 `d6ae100`）。

### M3 下游迁移护航（2 条）

- **M3-1 PrimeVue 迁移经验回收**：指南「常见陷阱」「迁移后自检」「逐组件对照入口」补 Tooltip 行与直接替换 / 桥接策略，缺口分类登记（提交 `09cdde6`、`138a3d0`）。
- **M3-2 1.0 升级护航**：下游版本快照、跨 minor 升级注意与对外 7 条（6 已知限制 + 1 升级注意）转指南，momei 反馈边界声明（提交 `d448de8`）。

### M4 机制与质量收口（4 条）

- **M4-1 API 表面差分接入发布链**：`diff-api.mjs` 入 `manual-release.mjs`；删除 / 重命名 / required 收紧判 breaking，新增不阻断（提交 `6f60021`、`f39f613`）。
- **M4-2 品牌预设 `-solid` 对比度治理**：`-solid` 配对（默认 / hover / active）纳入常驻断言面（6 预设 × 明暗 × 2 背景）；`momei` success 三态与 `caomei` `primary-solid` 维持既有品牌裁定（提交 `6bb250d`）。
- **M4-3 阶段构成计数跨载体机检**：覆盖 `todo.md` 口径句 / 条目表与 `roadmap.md` §1 当前态句 / 阶段表行，带负向对照与受检面下界（提交 `d74aafa`）。
- **M4-4 依赖告警收口**：`minimatch` medium 覆盖评估与 `deepmerge` low 留痕，不阻塞 1.1.0 发布（提交 `37fbcae`）。

### M5 发布收口（1 条）

- **M5-1 `1.1.0` 经 CI 发布**：`Release` run [`42249119570`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/42249119570) **success**——semantic-release 直连 + npm Trusted Publishing（provenance 签名），`dist-tags.latest = 1.1.0`；tag `v1.1.0` / GitHub Release / 回推提交 `66e94fa` 到位；tarball `shasum 87cedc9…`、`exports` 13、解包 README 版本句 = 1.1.0；下游复验 run [`42251067161`](https://github.com/CaoMeiYouRen/caomei-ui/actions/runs/42251067161) 全绿（`dependfix @ ad592c92…`）。证据见 [M5-1 记录](../../design/governance/2026-11-07-phase27-m5-1-1.1.0-release.md) §2 / §3。

### M6 CI 发布链路（5 条）

- **M6-1 工作流接线与凭据**：`release.yml` 直接调用 `pnpm release`；npm OIDC（`id-token: write`，无 `NPM_TOKEN`）、GitHub `GITHUB_TOKEN` 回推；`concurrency` 固定 group 串行；首个真实 run 取证通过（提交 `da35a0e`；2026-11-06 简化 `44231bb`）。
- **M6-2 版本句与发布说明同步**：`@semantic-release/exec` 在 npm bump 后、git 提交前同步 README 中英 + roadmap 版本句，里程碑段注入；发布后 `docs:check:version` 绿（提交 `b3e6471`）。
- **M6-3 前置门禁**：publish 前安全告警门禁 + `pnpm verify` + 覆盖率门禁；1.1.0 run 中全部通过，失败即中止（提交 `f9a30be`）。
- **M6-4 事件链与下游复验**：`GITHUB_TOKEN` 事件排除 → 显式 `workflow_dispatch`；**运行时补口**——首次自动 dispatch 因 npm 传播延迟报 `ERR_PNPM_NO_MATCHING_VERSION`，已在 dispatch 前加入版本可见性轮询（600s 预算），重跑全绿（提交 `95010cb` + 收尾批次）。
- **M6-5 `CHANGELOG` 生成器健壮性**：空 `# Unreleased` 段、无 remote 降级、语言源自 root（提交 `d6e9a64`）。

### 阶段总结

- **提交**：阶段登记 → `1.1.0` 发布共 **28** 个提交（`git log --oneline 2515e7a^..66e94fa | wc -l`）；收口批次提交另计。
- **质量门**：`pnpm verify` exit 0；`test:e2e` **466 passed / 4 skipped**；`test:visual` **38 passed**（字体确定化后，含 / 不含 `fonts-noto-cjk` 均绿）；`docs:check:version` / `lint:md:check` / `governance:check` exit 0。
- **长期任务**：阶段收口 / 发布后触发**第 30 轮**门槛复核——待执行批次 **0 项**；条件触发 **1 项维持**；计数无漂移；证据见[长期任务](../recurring.md) §3 第 30 轮。
- **wisdom 蒸馏**：**19 条活跃条目**（阈值 20，未达阈值、不蒸馏；`pnpm distill:wisdom --check` → `WISDOM_OK`）。
- **归档批次审计**：经 `@code-reviewer` Review Gate **单分区 `standard`**；结论见 [M5-1 记录](../../design/governance/2026-11-07-phase27-m5-1-1.1.0-release.md) §7。
- **已知观察**：① npm publish 成功到 registry 可解析存在分钟级延迟（1.1.0 约 3 分钟），已由发布链轮询承接；② 下游兼容检查仍只覆盖 `dependfix` 的 `typecheck` + `build`；③ `next` 通道未启用，预发布继续走本地 `pnpm release:manual --tag=next`；④ 1.1.0 里程碑的旧发布流文案已订正（`CHANGELOG` / GitHub Release body / `docs/release-notes/1.1.0.md`）。
- **后续候选**：见 [Backlog](../backlog.md)（含下游 compat 实际安装版本断言、`conventional-changelog` 8 升级等）。
