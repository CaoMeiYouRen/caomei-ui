# 文档站版本化形态再评估（Phase 12 M2-1）

> 状态：单条目的形态再评估与决策记录（2026-09-22）。**已获用户裁定 D1-B**——原 M2-1「文档站版本化（多版本托管）」**改写为轻量形态「版本信息与兼容策略」**，多版本托管退回 [Backlog](../../plan/backlog.md) 并附触发条件。落地口径见 §7，载体同步见 §8。

## 1. 结论

- **原 M2-1 的前提在 0.x 开发期不成立**：库处 0.x、API 仍在变，且不存在「按版本 pin、需要旧版文档」的真实读者；而版本化文档的成本是**持续的**（每版快照 / 重建 + 旧版内容冻结漂移），收益当下为 0。
- **更关键的是架构性约束**：当前文档站与**工作区源码强绑定**（§3），「同一构建内托管多版本」在现有形态下不可实现；社区插件式方案恰恰要求旧版文档**自包含**，与本仓「文档与源码同源演进」的流程直接冲突。
- 据此裁定：**M2-1 改写为 C 形态（版本信息与兼容策略，不做多版本托管）**；多版本托管退回 Backlog（触发条件：同时维护 ≥2 个对外版本，或下游按版本 pin 并要求旧版文档）。

## 2. 触发

用户于 2026-09-22 对 M2-1 提出两点质疑并要求重新评估：

1. 现阶段仍处开发期，组件与 API 调整空间大，「是否要提供版本化文档」存疑；
2. 从文档站实现看，**多个版本的组件库似乎无法共存**。

§3 证实第 2 点成立；§5~§6 给出形态与价值判断。

## 3. 取证：当前文档站与源码强绑定（决定性约束）

| 事实 | 位置 |
| --- | --- |
| demo 由**工作区源码**编译：Vite 别名 `@ → src/`，示例统一以 `@/components/<name>` 导入 | `docs/.vitepress/config.ts:221`；`docs/examples/**/*.vue`（如 `docs/examples/button/basic.vue`） |
| 站点直接引入源码样式，而非包产物 | `docs/.vitepress/theme/index.ts:5`（`import '../../../src/styles/index.css'`） |
| API 表由 `src/` **现场生成**（`pnpm docs:gen` → `component-meta.json`，`.gitignore`） | `package.json:44`；`scripts/docs/gen-component-meta.mjs`；[文档与演示站 §6](../documentation-site.md) |
| 部署为单一 GitHub Pages 站点，`base = /`（由 `VITEPRESS_BASE` 控制，默认 `/`） | `.github/workflows/docs.yml:53-58`；`docs/.vitepress/config.ts:69` |

**推论**：把某一历史版本的文档副本放进同一构建时，该副本的 demo 与 API 表仍会解析到**当前** `src/`，渲染出的是新库行为 → 旧版文档不可信。要做到「单站多版本」，必须先把文档站改成「每个版本消费固定的版本产物」，这与现有「文档与源码同源、同批演进」的流程冲突（也正是本仓文档守卫与 `typecheck:docs` 的立足点）。

## 4. 取证：生态现状（Search-First 多源核对，检索于 2026-09-22）

- **VitePress 无内置版本化能力**：官方文档未提供版本化指南，仓库 Issues / Discussions 中亦无对应内置能力（社区以插件 / 多构建自行实现）。
- 社区方案分散且普遍年轻、采用度低：

| 方案 | 形态 | 状态（检索于 2026-09-22） |
| --- | --- | --- |
| `@viteplus/versions` | 单站**冻结副本**（`archive/<版本>/`）+ 自动路由 / 版本切换器 | npm 2.0.7、MPL-2.0、仓库 6 stars、2025-09 建库、周下载约 110；前身为 `vitepress-versioning-plugin` |
| `vitepress-versioning-plugin` | 同上前身，面向 VitePress v1 | 已被上者接续 |
| `vitepress-versions`（its-miroma/vpv） | CLI：按 git tag / 分支 / 本地目录**多构建** | 自述 alpha，「not yet suitable for production」 |
| `@lando/vitepress-theme-default-plus` 的 `mvb` | 按 git tag 多构建 + 版本索引页 | 绑定该主题，非通用 |

- **主流 Vue 生态项目走独立部署，而非单站插件**：Vue Router 用分域（`router.vuejs.org` 为 v4/v5、`v3.router.vuejs.org` 为 v3）；Pinia 用分支（v2 / v4）各自部署文档；VueUse 只托管最新版本。

## 5. 形态对照与成本（若将来要做多版本托管）

| 形态 | 做法 | 成本 | 与本仓的冲突 |
| --- | --- | --- | --- |
| **A 多构建归档** | 每个 tag 单独 checkout，`VITEPRESS_BASE=/vX.Y.Z/` 构建，产物合并进同一 Pages 站点 + 链接式版本切换器 | 中：新增 CI 步骤 + 版本清单维护 + 每版重建（或产物归档） | 低：`VITEPRESS_BASE` 在 `v0.1.0` 已存在（`git show v0.1.0:docs/.vitepress/config.ts`），技术可行 |
| **B 单站冻结副本（插件）** | 旧版 `docs` + `examples` + `component-meta` 整体冻结、切断 `src/` live 依赖 | 高 | 高：需重构文档站（demo 与 API 生成改为消费固定版本），与 §3 的现有流程冲突 |
| **C 版本信息与兼容策略（本次采纳）** | 站点展示当前版本 + 获取渠道（npm / GitHub releases / CHANGELOG）+ 0.x 破坏性变更策略与下游 pin 建议 | 低 | 无 |

## 6. 价值判断（当下）

- 库处 **0.x**：`package.json` 现为 `0.1.0`，M1 待发布的 **0.2.0 即首个破坏性形态版本**（`styles.css` → `theme.css`），API 仍会调整——保留每版文档的边际价值低。
- **下游尚未开始迁移**：momei 侧 Caomei 写法用量 0（[momei 迁移可行性 §4.2](./2026-09-17-momei-migration-feasibility.md)、[重量级组件质量盘点](./2026-09-20-m2-1-component-quality-audit.md)），当前不存在「按版本 pin 并需要旧版文档」的读者。
- 版本化文档的收益随「同时维护的对外版本数」增长：**现在为 0，成本却是持续的**（每版快照 / 重建 + 旧版内容冻结漂移 + 版本切换器与旧版守卫的维护面）。

## 7. 用户决策与落地口径

**决策（2026-09-22，D1-B）**：M2-1 降级为 **C 形态**，不做多版本托管；M2 主线 = M2-1（轻量形态）+ M2-2 ~ M2-4（+ M2-5 条件条目）。

改写后的 M2-1 口径（登记于[待办事项](../../plan/todo.md)；**范围 / 非目标 / 验收以该登记为准，本节为改写说明**）：

- **范围**：中英「版本与兼容策略」页（当前版本 + 获取渠道 npm / GitHub releases / CHANGELOG + 0.x 破坏性变更策略与下游 pin 建议）；站点内可见的当前版本展示；**版本号单一来源（`package.json`）并机检**。
- **非目标**：不做多版本托管 / 版本切换器 / 历史版本站点（退回 Backlog）。
- **最小验收标准**：中英页面齐备三项（当前版本 / 获取渠道 / 0.x 策略）且中英同步；站点内可见位置展示当前版本（经 `@ui-validator` 验证）；版本号与 `package.json` 一致由机检覆盖（带正反例语料、全库零误报、「受检范围未被静默收窄」可断言）；`docs:build` 通过。

## 8. 载体同步

| 载体 | 同步内容 |
| --- | --- |
| [待办事项](../../plan/todo.md) | Phase 12 目标②改写；M2 主线标题 / 执行范围 / 非目标 / 最小验收标准改写；M2-1 条目行改写为轻量形态 |
| [Backlog](../../plan/backlog.md) | 「文档站版本化」行改写为「文档站多版本托管」并附触发条件，标注轻量形态已取用 |
| [路线图](../../plan/roadmap.md) | Phase 12 行 M2 描述同步；Phase 5 行历史表述补 2026-09-22 再评估括注 |
| [文档与演示站设计 §8](../documentation-site.md) | 「版本化见 Backlog」改为指向本记录与 Backlog 的多版本托管候选 |
| [下一阶段范围评估 §9](./2026-09-21-next-stage-scope-evaluation.md) | M2 主线口径让渡至本记录（避免双权威）；§3 候选行同步补再评估指针（§1~§4 为决策前快照，已由该记录 header 声明，不回扫） |
| [治理索引](./index.md) | 本记录登记 |

## 9. 未覆盖边界

- 生态结论来自 2026-09-22 的检索快照（npm 下载量 / stars / 版本号随时间变化）；将来若要重启多版本托管，须按 [AI 协作规范 §2](../../standards/ai-collaboration.md) 重新做一次多源核对。
- 本记录只裁定**形态**，不含多版本托管的实现设计（形态 A / B 的落地细节须另行评估）。
- 未评估「站点内版本展示」的具体落点（导航 / 页脚 / 页面内）——属 M2-1 实现期决策，验收只要求「站点内可见」且经 `@ui-validator` 验证，版本号与 `package.json` 单点一致。
