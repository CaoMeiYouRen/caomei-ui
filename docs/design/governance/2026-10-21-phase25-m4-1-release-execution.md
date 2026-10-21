# Phase 25 M4-1：0.7.0 发布执行与收口

- 关联条目：Phase 25 **M4-1**（推送 + 发布 0.7.0 + 发布后校验与版本句同步）
- 性质：发布执行记录 + 收口校验 + 发布说明补正
- 依据：[Phase 25 登记批次记录](./2026-10-16-phase25-registration.md) §2；[发布指南](../../guide/release.md) §3；[版本与兼容策略](../../guide/version-policy.md)

## 1. 发布事实

- **npm 发布时间**：`2026-10-20T12:29:13.630Z`（Downstream Compat run 日志中的 registry 时间）。
- **registry `latest`**：`0.7.0`（直连 `https://registry.npmjs.org/caomei-ui/latest` 复核）。
- **tarball**：`caomei-ui-0.7.0.tgz`，`dist.shasum` = `5b59e41aa400b0e59ade6f6f10984ebf1faf3622`，`fileCount` = 427。
- **GitHub Release**：`v0.7.0`，published `2026-10-20T12:38:47Z`，非 draft / prerelease，URL `https://github.com/CaoMeiYouRen/caomei-ui/releases/tag/v0.7.0`。
- **tag 落点**：annotated tag `v0.7.0` 指向 `c496f61`（`chore(release): 0.7.0`，版本提交）；CHANGELOG / README 提交在其后，属[发布指南 §3.3](../../guide/release.md) 已登记的 tag 落点形态，**未重写 tag**。
- **推送态**：`origin/master` = `a0e91f5` = 工作区 HEAD（含发布工具修复提交），本地领先 0。

## 2. 发布后校验

- **tarball 同源**：下载 registry tarball 后 `sha1sum` = `5b59e41aa400b0e59ade6f6f10984ebf1faf3622`，与 registry `dist.shasum` 一致。
- **解包版本**：`package/package.json` 的 `name` = `caomei-ui`、`version` = `0.7.0`。
- **exports**：13 键——`.` / `./theme.css` / `./locale/zh-tw` / `./locale/ja-jp` / `./locale/ko-kr` / `./locale/es-es` / `./locale/fr-fr` / `./locale/de-de` / `./locale/ru-ru` / `./locale/pt-br` / `./resolver` / `./nuxt` / `./package.json`。
- **GitHub Release**：`gh release view v0.7.0` 返回 `isDraft=false` / `isPrerelease=false`，body 与 0.7.0 发布内容一致。

## 3. 版本句与发布说明

- `README.md` / `README.en-US.md` 的当前版本句为 `0.7.0`；`docs/plan/roadmap.md` §1 的 `latest` = `0.7.0`。
- `docs/plan/todo.md` 的「已发布版本」行在本批由 `0.6.0` 更正为 `0.7.0`，并同步 git / tag / GitHub Release 事实。
- **BREAKING CHANGES 补正**：本阶段实现提交未带 `BREAKING CHANGE:` footer，导致 0.7.0 的 CHANGELOG 与 GitHub Release 初始 body 缺 `💥 BREAKING CHANGES` 段。本批按 M4-1 验收口径在 **CHANGELOG 与 GitHub Release 说明**补齐语言包按需化的破坏性披露（`registerLocale()` / 子路径 / 未注册回落），**不改 tag、不发新版本**。

## 4. 下游兼容检查

- Downstream Compat run `39423865750`（tag `v0.7.0`）在 `Override caomei-ui to target version` 步骤失败：下游 pnpm 11 `minimumReleaseAge` 拒绝安装刚发布 10 分钟的 `caomei-ui@0.7.0`，**未进入 `typecheck` / `build`**，不构成兼容性回归判定。
- 已在发布工具修复批次（`a0e91f5`）中为该步骤增加 `--config.minimumReleaseAge=0`，并在[发布指南 §10](../../guide/release.md) 登记 run #4 与「待下一次 tag 触发复验」。
- 本次未在真实 Actions 重跑；当前 tag 使用旧 workflow，重跑不会包含修复。

## 5. Review Gate

**R1（`standard`，归档批次）**：**Reject**（1 blocker / 2 warning / 2 suggest）。

- M4-1 发布事实（registry 0.7.0 / tarball shasum / exports 13 键 / GitHub Release / tag 落点 / 推送态 / BREAKING 补正）经审计核对无 blocker。
- blocker：`todo.md` 长期任务摘要仍写第 26 轮，与 `recurring.md` 第 27 轮矛盾；已改为第 27 轮。
- warning：① `recurring.md` §2.1 基线计数未同步（`labelAttrs` 10 / 内联 32 / `useAttrs()` 11 → 11 / 35 / 13）；已更新并保留漂移归因。② wisdom 指针悬空；已在归档记录 §6 与归档块给出 14 条活跃 / 13 段对账结论。
- suggest：① README / roadmap 补 0.7.0 版本亮点；已采纳。② `todo.md` 下游 0.6.0 快照标注「0.7.0 发布后未重测」；已采纳。

**R2（delta `quick`）**：**Pass**（0 blocker / 1 warning / 1 suggest）。

- R1 blocker / warning / suggest 全部闭合；1 warning 为「完成态先于 §5 回填」，本次回填后闭合；1 suggest 为 Phase 24 点时记录不回改，保留为历史说明。

## 6. 未覆盖边界

- 未重写已发布 tag，未重新发布 0.7.0；GitHub Release 说明为**编辑补正**，不是新发布。
- 未在真实 Actions 重跑 Downstream Compat；`minimumReleaseAge` 的运行时行为待下一次 tag 触发验证。
- 未做 0.7.0 下游真实升级验证（momei / dependfix 等由各仓自行执行）。
- 未审译文质量；语言包破坏性披露只覆盖接入形态，不替代下游逐项迁移评估。

## 7. 回滚与兼容

- 0.7.0 已发布，按[版本与兼容策略](../../guide/version-policy.md)不 unpublish / 不重写 tag；后续修复以新 patch / minor 版本发布。
- 本次仅补正 CHANGELOG / GitHub Release 说明与规划载体状态，不改运行时代码与产物。
