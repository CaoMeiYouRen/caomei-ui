# Phase 16 M5-2：0.4.0 发布执行、发布后校验与文档同步

> 创建时间：2026-09-29
> 条目：Phase 16 **M5-2**（发布交付；用户 2026-09-29 决策追加，「仅登记发布范围与前置条件，执行须由用户明确指令」）
> 快照：本仓 HEAD `c8a6eca`，发布提交链 `701d4c0`（版本号）→ `c8a6eca`（CHANGELOG）。本记录为 0.4.0 发布的唯一交付口径。
> 发布前门槛复核：[长期任务](../../plan/recurring.md) §3 第 16 轮（2026-09-29，已留痕）。

---

## 1. 执行分工

- **用户本地执行**：`package.json` bump（提交 `701d4c0 chore(package): 更新版本号至 0.4.0`）、`pnpm changelog`（提交 `c8a6eca chore(changelog): 更新 CHANGELOG.md 以记录版本 0.4.0 的新功能和修复`）、`npm publish`。
- **本批承担**：发布后校验、发布后文档同步（README 中英 / roadmap / todo）、annotated tag 补齐与治理留痕。
- **执行期暴露的守卫缺陷**：`npm version`（版本号提交）与 semantic-release 形态的 `CHANGELOG.md` 提交先后被 `pre-commit` 的 Review Gate 落盘守卫误拦截；以**非阶段条目**修复（`e128aa6` / `d07fd8c`），详见[阶段归档](../../plan/todo-archive.md) Phase 16「附带交付」。

## 2. 发布执行结果

- **版本基线**：`package.json` `0.3.0` → `0.4.0`（`701d4c0`）。
- **发布说明**：`pnpm changelog` 生成 `CHANGELOG.md` 0.4.0 段（`c8a6eca`）。
- **annotated tag**：`v0.4.0` → **`c8a6eca`**（tag object `5e2a51f`）——指向含版本号 + CHANGELOG 的发布提交，**未沿用 0.3.0 的「tag 指向版本提交、CHANGELOG 提交在其后」偏差**（本批次序已对齐[发布指南 §3](../../guide/release.md)）。
- **发布**：`npm publish`（用户本地执行，registry `https://registry.npmjs.org/`，tag `latest`）。
- **推送状态**：截至本记录时点，发布提交与 tag `v0.4.0` 均为**本地态**（未 `git push`）——按 [Git 规范](../../standards/git.md)，推送须用户明确授权；远端建立该 tag 前，发布基线以本地 tag 为准。

## 3. 发布后校验

| 项 | 实测 | 结果 |
| :--- | :--- | :--- |
| `npm view caomei-ui version dist-tags` | `0.4.0` / `latest = 0.4.0` | 一致 |
| tarball shasum（registry） | `9df574112d5cd1e69e9dac9267b9409106c25934` | 与发布日志一致（registry 为权威来源，日志为辅助留痕） |
| tarball 完整性 | `sha512-OUVv9qc7+KWpSTlXqaq6kjrCF01cqjXoKf3DF+ueNuU9CCrLbHVZKxH+SCniftVawfF3WLL0DmEYMGcKVBIkag==` | 与发布日志一致（同上） |
| 文件数 / 解包体积 | **352** 文件 / **831,957 B**（约 832.0 kB） | 与发布日志一致 |
| 子路径导出 | `.` / `./nuxt` / `./resolver` / `./theme.css`（→ `dist/styles/index.css`）/ `./package.json` 共 **5** 键 | 一致 |
| tarball 内容 | 含 `dist/styles/index.css`，**不含**旧单体 `dist/styles.css`（命中 0） | 一致 |
| 子路径冒烟（registry tarball 解包） | 根 **89** 导出 + `resolverFactory` + `nuxtModuleFactory` + `stylesOk` 全 `true` | 通过 |

- shasum 复算命令：`npm pack caomei-ui@0.4.0 --pack-destination <dir> --registry=https://registry.npmjs.org && sha1sum caomei-ui-0.4.0.tgz`。
- 冒烟复用本仓 `scripts/release/smoke-runtime.mjs` + `register-css-stub.mjs`（消费前提见[发布指南 §9](../../guide/release.md)：产物 JS 保留逐模块 CSS import，裸 Node 不能直接 `import` 包根，故以 CSS stub loader 加载）。

## 4. 发布后文档同步

- `README.md` / `README.en-US.md`：版本 `0.3.0` → `0.4.0` + 0.4.0 能力摘要（`iconOnly` 按钮方形几何 / `Select` 非法态聚焦色修复、soft 变体与 toast 描边对比度、`DataTable` 分页对齐 token）。
- `docs/plan/roadmap.md`：§1 版本句补 0.4.0、Phase 16 状态与归档、§2 阶段表行、§5 归档索引、状态行改「当前无进行中阶段」。
- `docs/plan/todo.md`：Phase 16 归档后清为「无进行中阶段 + 未完成项汇总」。
- 站点内展示版本号由 `themeConfig.version` 从 `package.json` **自动派生**（`pnpm docs:check:version` 看守），**无需手改站点文档**（M2-1 口径）。

## 5. 质量门（终态）

- `pnpm verify` **exit 0**（2026-09-29 终态复跑）：lint / lint:css / lint:md / typecheck / typecheck:docs / test **92 文件 1921 tests** / build / check:build（8 exports 产物齐全）/ check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿。
- `docs:check` **11 段**链全绿：integrity **270** md / links **270** md / structure 232 页 + 侧栏 6 组 47 条目 / config-links 160 条（nav 12 / sidebar 148）/ i18n-parity 59 对 / version 0.4.0（5 个展示面均派生自 `package.json`）/ interpolation **231** md / example-refs 232 md·378 引用·359 示例 / showcase 13 项 / line-count（`todo-archive.md` 594 行仅 warn）/ i18n。
- `check:governance-records`：**85 记录与索引一致 / 270 md 指针无失效**；`capture:styles` **245 项 0 差异**；`test:a11y` **58**；`docs:build` exit 0。
- **计数口径注**：上列 `docs:check` 的 `integrity 270 / links 270` 为**提交前工作区口径**——`integrity` 计受版本控制 md **270**（含 `CHANGELOG.md`、不含本未入库记录），`links` 计工作区 md **270**（含本记录、不含 `CHANGELOG.md`），两者恰好相等；本记录入库后为 **integrity 271 / links 270**（历史 1 差不变式回归）。
- tag `v0.4.0` 已在发布执行中创建（→ `c8a6eca`）；registry 校验见 §3。

## 6. 边界与偏差

- 发布校验在本地通过 registry 完成；registry 曾由用户切至镜像（`nrm use taobao`），本记录的 `npm view` / tarball 校验显式使用官方源 `https://registry.npmjs.org/`。
- `pnpm changelog` 的已知残留（空 `# Unreleased` 段、标题内 `#<数字>` 误判 issue 链接）仍按 [Backlog](../../plan/backlog.md) §1.6 跟踪，本批不扩面。
- 发布面不包含 CI 自动发布（`release.yml` 发布步骤保持关闭，[发布指南 §5](../../guide/release.md)）。

## 7. Review Gate 记录

- **第 1 轮（两分区并发，`standard`，时间盒各 ≤ 10 分钟；总时间盒取最大值）**：分区 A 规划载体 **Reject**（1 blocker：`todo.md` 归档后残留交付摘要与归档指针；2 warning：条件候选编号复发、`roadmap.md` 非目标与「已发布」矛盾；1 suggest）；分区 B 治理记录·索引·对外文档 **Pass**（0 blocker / 0 warning / 3 suggest）。合并取最严 → **Reject**。
- **R1 修复点（同批）**：`todo.md` 重写为 Phase 15 归档模板；条件候选去编号 + [规划规范 §7](../../standards/planning.md) 补 Review Gate 必查项（约束载体）；`roadmap.md` 非目标改写为「本地手动发布」；本记录 §2 补推送状态、§快照句与本 §3 措辞采纳 3 条 suggest；另修正本记录 1 处跨根链接（`../../standards/git.md`）。
- **第 2 轮（复审，只审修复点，`standard`，≤ 10 分钟）**：**Pass**（0 blocker / 0 warning / 2 suggest）。R2 新提 2 条（索引摘要同缺陷表述、`integrity/links` 计数为提交前工作区口径）**已同批采纳，记为「已修复未复审」**。
- **实测用时（调用方回填）**：R1 发起 `2026-09-29T21:55:09+08:00` → 修复完成 / R2 发起 `22:03:17`（上界 **≤ 8 分 08 秒**，含调用方阅读与修复）；R2 发起 `22:03:17` → 处理完成取戳 `22:10:03`（上界 **≤ 6 分 46 秒**，含 suggest 采纳与复跑）。均未超 10 分钟。
- **未覆盖边界**：两轮均未复跑完整 `pnpm verify` / `test` / `build` / `capture:styles`；`npm publish` 本体与用户本地发布日志不可核（外部既成事实）；远端 push 状态未核。
