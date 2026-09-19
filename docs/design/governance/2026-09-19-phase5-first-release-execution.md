# 0.1.0 首发执行与发布后校验（Phase 5 第二阶段 F5-3 / F5-4）

- 类型：发布执行结论与状态同步记录
- 触发：2026-09-19 首版本地手动发布（`npm publish`）后，对 F5-3 发布后校验与 F5-4 状态同步收口
- 关联：[路线图](../../plan/roadmap.md) ｜ [待办事项](../../plan/todo.md) ｜ [发布指南](../../guide/release.md) ｜ [发版评估记录](./2026-09-19-phase5-second-stage-release-evaluation.md)

## 1. 结论

- **首发成功**：npm `caomei-ui@0.1.0` 已发布，`latest` 指向 `0.1.0`；包内容与 `package.json` 的 `files` 一致；新目录安装与子路径导入冒烟通过。
- **发布方式**：本地手动 `npm publish`，CI 自动发布保持关闭（与用户 2026-09-19 决策一致）。
- **条目状态**：F5-3 达成；F5-4 主体（README / roadmap / guides 状态同步）达成，npm `0.0.0` 占位处置待决策。

## 2. 发布事实取证（2026-09-19）

- registry 版本与时间（`npm view caomei-ui`）：`dist-tags.latest = 0.1.0`；`versions = [0.0.0, 0.1.0]`；`0.1.0` 发布时间 `2026-09-19T14:49:05.600Z`。
- 版本基线：`package.json` `version = 0.1.0`；annotated 基线 tag `v0.1.0` 存在（F5-2 交付）。
- 打包内容（`npm pack caomei-ui@0.1.0 --dry-run --json`）：11 文件 —— `LICENSE`、`README.md`、`THIRD-PARTY-LICENSES`、`dist/index.{js,d.ts}`、`dist/nuxt.{js,d.ts}`、`dist/resolver.{js,d.ts}`、`dist/styles.css`、`package.json`。
- 新目录安装冒烟（干净临时目录，`npm install caomei-ui@0.1.0 vue@^3.5.0`，成功）：
  - `import 'caomei-ui'` 成功（87 个导出）；
  - `import 'caomei-ui/resolver'` 成功（1 个导出）；
  - `dist/styles.css` 与 `THIRD-PARTY-LICENSES` 均随包分发。
- 结论：满足 F5-3 验收标准（`latest` 指向 0.1.0；安装后组件与子路径导出可用；发布结论落本文件）。

## 3. 发布后状态同步（F5-4）

- `README.md`：项目状态压缩为概述 + 外链；安装栏改为已发布事实；License 段补充 `THIRD-PARTY-LICENSES` 链接；4 处标题去除「（目标形态）」，技术栈发布行更正为「本地手动 npm publish（semantic-release / CI 自动发布暂缓）」。
- `docs/guide/getting-started.md`、`docs/guide/local-linking.md` 及其中英（en-US）镜像：清除「尚未发布 / 未发布包 / 接入目标形态」表述，改为 0.1.0 已发布口径。
- `docs/plan/roadmap.md` §1：事实更正为「首版 0.1.0 已于 2026-09-19 发布到 npm（`latest`），npm 仍存同作者 `0.0.0` 占位，待 deprecate 决策」。
- 验收核对：上述文档已无「未发布 / 尚未发布」残留（历史日期快照与 CHANGELOG 生成产物除外，不回改）。

## 4. 未覆盖边界与后续

- **npm `0.0.0` 占位**：仍在线且未 deprecate，处置（deprecate / 保留）待用户决策。
- **下游接入验证**：按用户决策后置为发布后由下游实际迁移反馈驱动，归属路线图 Phase 8。
- **npm / GitHub 网页渲染**：README、License 与 `THIRD-PARTY-LICENSES` 的相对链接已由仓库内链接检查覆盖；网页端实际渲染未单独验证。
- **对比度遗留项**：默认主题亮色 soft primary 文本 4.37:1 未达 AA，已在 [Backlog](../../plan/backlog.md) 跟踪。

## 5. 状态

2026-09-19：F5-3 已交付（`npm publish` 首发成功、安装与子路径导入冒烟通过）；F5-4 主体已交付（README / roadmap / guides 状态同步，无「未发布」残留），npm `0.0.0` 占位处置待决策。
