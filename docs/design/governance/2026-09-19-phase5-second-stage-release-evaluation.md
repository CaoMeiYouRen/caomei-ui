# Phase 5 第二阶段发版评估（首版发布：本地手动发布，0.x）

- 类型：阶段分段范围与发版就绪度评估（Phase 5 第二阶段启动前置）
- 触发：2026-09-19 用户就「是否可以正式发版」提问并作出 4 项决策
- 关联：[路线图](../../plan/roadmap.md) ｜ [待办事项](../../plan/todo.md) ｜ [发布指南](../../guide/release.md)

## 1. 结论

首版发布**技术质量面已就绪、发布链路未就绪**：质量门全链路通过、npm 打包内容完整；但存在硬前置（npm 凭据）与发布机制缺口（semantic-release 首版恒 1.0.0）。**该结论为 2026-09-19 评估时快照；首版已于同日完成本地手动发布，最新状态见 §6 / §7 与[首发执行记录](./2026-09-19-phase5-first-release-execution.md)。** 经用户 2026-09-19 决策（授权启动 Phase 5 第二阶段、首版 0.x、本地手动发布、CI 自动发布暂缓、下游接入验证后置），范围收敛为「0.x 首个版本 + 本地手动发布流程」。

## 2. 发版就绪度取证（2026-09-19，HEAD `d3b85c8`）

- 质量门：`pnpm verify` 全链路通过（lint / lint:css / lint:md / typecheck / typecheck:docs / 全量 test / build / check:build / check:nuxt / docs:build / i18n-routing / governance）。
- 打包内容：`npm pack --dry-run` → 11 文件（dist 入口与子路径、`styles.css`、类型声明、`LICENSE`、`THIRD-PARTY-LICENSES`、`README`、`package.json`），145 kB 打包 / 676 kB 解包。
- 子路径导出：`check:build` 通过（8 个 exports 产物齐全、入口可加载）。
- 许可合规：`check:licenses` 通过；`prepublishOnly` 随发布复跑。
- 包名：npm `caomei-ui@0.0.0` 为同作者占位（2026-09-11 发布），名称可用。
- 硬前置：本机 `NPM_TOKEN` / `GH_TOKEN` 未设置，`npm whoami` 返回 `401`；CI 发布步骤未启用。

## 3. 0.x 首发机制（技术取证）

- semantic-release 首版恒为 `1.0.0`（`FIRST_RELEASE` 常量，无 `initialVersion` 选项），无法直接产出 0.x。
- 停在 0.x 的做法：手工发布首个 0.x 版本并建立 **annotated** 基线 tag `v0.1.0`；此后以该 tag 为基线按 Conventional Commits 在 0.x 递增（`fix` → `0.1.1`，`feat` → `0.2.0`）。
- 出现 `BREAKING CHANGE` / `!` 时 semantic-release 仍会升到 `1.0.0`；是否进入 1.0.0 须单独决策。
- `git push --follow-tags` 只推送 **annotated** tag；轻量 tag 不会被推送（静默），故基线 tag 必须用 annotated。

## 4. 用户决策（2026-09-19）

1. 授权启动 Phase 5 第二阶段。
2. 首版版本号取 0.x（后续再议 1.0.0）。
3. 发布方式为本地手动发布，暂不启动 CI 自动发布流程。
4. 下游接入验证等待发布后下游实际迁移反馈；测试 flaky 按「多次出现再处理」跟踪。

## 5. 范围与非目标

- 范围：F5-1 首版发布指南（本地手动 0.x）；F5-2 0.1.0 版本基线与发布说明；F5-3 首发执行与发布后校验；F5-4 发布后状态同步与占位处置。条目见[待办事项](../../plan/todo.md)。
- 非目标：不启用 CI 自动发布（`release.yml` 发布步骤保持关闭）；不把下游接入验证作为本阶段准入；不做文档站版本化；不追求 1.0.0。

## 6. 风险与后续

- 凭据：首发已使用有效 npm 凭据完成 `npm publish`（结论见[首发执行记录](./2026-09-19-phase5-first-release-execution.md)）；CI 自动发布凭据仍未配置（`release.yml` 发布步骤保持关闭）。
- 偶发失败：release job 会执行 `pnpm verify`，已知全量偶发失败（隔离即过）；按用户决策「多次出现再处理」，暂不单列条目。
- 对比度遗留项（[Backlog](../../plan/backlog.md)，中）：默认主题亮色 soft primary 文本 4.37:1 未达 AA，建议在发布说明披露。
- 下游接入验证：后置为发布后由下游实际迁移反馈驱动，归属[路线图 Phase 8](../../plan/roadmap.md)。

## 7. 状态

2026-09-19：用户授权启动并登记为当前阶段（授权范围 F5-1 ~ F5-4）；F5-1 随首版发布指南交付；**F5-2 已交付**（commit `f26388e`、annotated tag `v0.1.0`——版本基线 `0.1.0`、`CHANGELOG.md` 由 `pnpm changelog` 基于 `conventional-changelog` + `conventional-changelog-cmyr-config` 预设生成）；**F5-3 已交付**（本地手动 `npm publish` 首发成功：`latest = 0.1.0`、tarball 与 `files` 一致、安装与子路径导入冒烟通过，见[首发执行记录](./2026-09-19-phase5-first-release-execution.md)）；**F5-4 主体已交付**（README / roadmap / guides 及 en-US 镜像状态同步，无「未发布」残留；npm `0.0.0` 占位 deprecate 处置待决策）。F5-2 复审 follow-up（生成器健壮性：无 remote 降级、语言源自 `root`）超出原授权范围，**已登记 [Backlog](../../plan/backlog.md)**、未登记为本阶段条目。
