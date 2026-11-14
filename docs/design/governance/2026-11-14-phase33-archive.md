# Phase 33 归档批次：依赖与工具链升级、下游适配、组件增强与质量守卫

> 创建时间：2026-11-14
> 触发：Phase 33 收口（用户指令「开始归档」）。
> 依据：[Phase 33 登记批次记录](./2026-11-13-phase33-registration.md) §1 / §2；[规划规范 §7 / §8](../../standards/planning.md)。

## 1. 范围与结果

- **6 条主线 / 14 条原子条目**全部交付：依赖与工具链 4 / 下游适配 1 / 组件增强与可访问性 4 / 质量守卫与对比度 2 / 发布收口 1 / 协作测试 2（构成对账 4 + 1 + 4 + 2 + 1 + 2 = 14）。
- **本阶段收口发布 `1.3.0`**：`latest = 1.3.0`、`v1.3.0` tag 与 GitHub Release 到位，下游兼容三仓 success（见 [M5-1 发布记录](./2026-11-14-phase33-m5-1-1.3.0-release.md)）。
- 归档落点：[待办归档](../../plan/todo-archive.md) Phase 33 块；主窗口由 `Phase 27 ~ Phase 33` 7 块 + 归档索引构成，**388 行**（前态 331 + 块 56 + 分节空行 1；口径 = `docs:check:line-count` 脚本值，按 `split(/\r?\n/)` 计数，尾随换行计 1 个空段——同文件 `wc -l` 得 387，属同一内容的两种计数），未越 warn 400，按「迁移触发 = 越过阈值」**本轮无迁出**（`archive/` 未新增文件）。下一阶段入窗预计越过 400，届时按口径迁出最早块。

## 2. 提交对账

| 条目 | 提交 |
|:---|:---|
| 范围评估与登记 | `2e3d6d5`（评估）/ `dab3e3d`（候选扩充）/ `5c694f3`（登记）/ `ca847aa` + `db9ec6c`（协作测试与 Tooltip 调研）/ `326c539`（协作测试登记）/ `4c83d19`（Tooltip 候选登记） |
| M1-1 `eslint` 10 | `06880dc` |
| M1-2 `vitest` 5 + coverage 5 | `f0e604a` |
| M1-3 `stylelint` 18 + config 1.1 | `312307c` |
| M1-4 `fontkit` 3 | `669f4b8` |
| M2-1 DataTable `autoResetPageIndex` | `31f9787` |
| M3-1 ColorPicker `radiogroup` | `2319ed6` |
| M3-2 Select 选项告警 | `2714ead` |
| M3-3 Paginator `#report` | `d2d0322` |
| M3-4 Select 长列表面板滚动（执行期插队） | `3b4f7c3` |
| M4-1 transition 副本守卫 | `b2fb929` |
| M4-2 Calendar / RTE 边界对比度 | `05b722c` |
| M5-1 发布收口 | `af6b022`（发布说明与就绪度）/ `2a67c46`（字体基线重冻结）/ `1c418b4`（Playwright 钉版本）/ `8bd939a`（发布前置门禁）/ `8931801`（视觉回归纳入自动合并）/ `5b5c2c7`（roadmap 版本句修复）/ `d3a8b85`（发布回推，计入下表「发布回推 1」）/ `b158fa7` + `7ad48a7`（发布记录与回填） |
| M6-1 / M6-2 协作测试 P0 | `7456aa7` |
| 阶段内背景（dependabot 自动合并） | `3e3a7aa` / `32d64e7` / `cbd752e` |

- 窗口口径：`git log --oneline --no-merges 48fcbfa..7ad48a7 | wc -l` → **31**；分组 = 条目交付与回填 20 + 评估与登记 7 + dependabot 自动合并 3 + 发布回推 1。

## 3. 质量门

- 末条提交（`7ad48a7`）前的发布链：`Release` run `43590300810` success（`pnpm verify` + 覆盖率 + 安全告警门禁 + semantic-release）；`Test` run `43590296728`（Quality / Test & Build / Visual）success。
- 发布链与就绪度读数（沿用 [1.3.0 就绪度记录](./2026-11-14-phase33-m5-1-release-readiness.md) §3，本批零代码改动未重跑）：`pnpm verify` exit 0（164 文件 / **3187** 例）；`test:coverage` 通过（93.52 / 86.35 / 95.40 / 92.92）；`test:a11y` 68；全量 E2E **772 passed / 4 skipped**；`test:visual` **42 passed**；`capture:styles` **399 项** 0 差异；API 差分 203 → 205 声明文件 / 337 → 349 导出，无 breaking。
- 发布后：`docs:check:version` OK（`1.3.0`）；周回归 `43591838970`（`d3a8b85`，2026-11-14）三 job success；下游兼容 `43590922508`（2026-11-14）三仓 success。
- 归档改动面（纯规划 / 文档）：`lint:md`、`docs:check:integrity`（1 条预期缩减告警：`todo.md` H1/H2 结构标题 4 → 3，属归档正常移除面）、`docs:check:links`、`check:governance-records`、`check:planning-numbers`、`check:stage-counts`（无进行中阶段分支）、`check:archive-rg-counts`、`governance:check` 全部通过。

## 4. Wisdom 蒸馏

- `pnpm distill:wisdom --check` → **12 条活跃（< 阈值 20，不蒸馏）**；`check:distill-archive` → 14 段归档对账通过。
- 本阶段新增 **3** 条可复用发现（`.session/wisdom.md`，gitignored）：
  1. **负向验证前须确认复用中的夹具 dev server 已加载改动**：Playwright `reuseExistingServer` 会继续服务旧模块，使「移除样式后的负向对照」假通过（M3-4 实测）。
  2. **Playwright minor 升级会改 Chromium 栅格化**：冻结的视觉基线必须同批重冻结；判定 = 本地与 CI 的差异像素数逐项一致、CJK 面全绿、无 `src/**` 改动（本轮误判为「本地字体族问题」直至周回归暴露）。
  3. **第三方编辑器根元素自写 `data-theme` 会命中本库暗色 token**（`:is(.dark, [data-theme='dark'])`）：在包装层用 `:where()` 声明桥接变量、深规则消费它，避免预设 token 被回退到基础主题。

## 5. 载体回扫

- `todo.md`：清空阶段状态句与条目表，恢复「当前无进行中阶段」+ Backlog / 长期任务指针；「未完成项汇总」补 `1.3.0` 下游兼容 run `43590922508`。
- `roadmap.md`：§1 改为「当前无进行中阶段」并写入 Phase 33 交付 / 发布 / 归档段；§2 Phase 33 行置「完成、发布 `1.3.0` 并归档」；§5 深度归档清单不变（本轮无迁出）。
- `todo-archive.md`：Phase 33 块入窗（主窗口 331 → **388 行**，块 56 + 分节空行 1；口径 = `docs:check:line-count`）；主窗口口径更新为 `Phase 27 ~ Phase 33` 7 块，并记录「未越 warn 400、本轮无迁出」。
- `archive/index.md`：无新增文件与迁出记录（本轮无迁出）。
- `recurring.md`：§3 第 37 轮门槛复核留痕 + 触发义务句补记 + §2「上次执行」列。
- `.session`：阶段态同步为「无进行中阶段」。
- 治理索引：本记录入索引。

## 6. 长期任务（第 37 轮）

- **触发**：Phase 33 收口（用户指令「开始归档」）；零代码改动域。
- **结论**：待执行批次 **0 项**；未达门槛 → 条件触发 **1 项维持**（表单控件公共 props 契约后续候选）；已判定不纳入 **5 项维持**。
- **取证**（2026-11-14 实测，与第 36 轮逐项一致、无漂移）：`useLabelAttrs` 15 / `labelAttrs` 11 / 模板级 `:aria-label="label"` 0 / 继承契约 12 / 含内联同名字段 36 / `useFocusControl` 4 / `useAttrs()` 14；数值钳位 2 处（`input-number.vue` / `date-picker/time-input.vue`）；§2.2 复跑 `node test-results/m3-1/field-shell-overlap.mjs` → `input 0 / textarea 1 / input-number 0 / tags-input 17`、四组件共有声明 **0**；`capture:styles` **399 项** 0 差异。

## 7. Review Gate

- **audit-depth**：R1 `standard`（多载体归档 + 规划回填，≤10 分钟）+ R2 `quick`（修复点 delta，≤5 分钟）；单分区。
- **R1：`Reject`**（3 blocker / 3 warning / 3 suggest）
  - blocker：① 行数口径混用（脚本值 388、`wc -l` 387）且块数少计 1 → 统一为「331 → **388**（块 56 + 分节空行 1；口径 = `docs:check:line-count`）」；② wisdom 新增条数写 2，实际 3（漏 M3-4 的夹具 dev server 发现）→ 补第 3 条；③ 治理索引摘要复述行数读数 → 改为结论式。
  - warning：「归档批次复跑」改为「沿用 1.3.0 就绪度记录读数（本批零代码改动未重跑）」；`.session` 阶段态 / 交付日志残留 → 重写为当前态；integrity 告警措辞改为「H1/H2 结构标题 4 → 3」。
  - suggest：M5-1 行标注 `d3a8b85` 计入发布回推、run id 补测量日期、补「下一阶段入窗预计越过 400」前瞻 → 均已采纳。
- **R2：`Reject`**（1 blocker / 0 warning / 2 suggest）——§5 载体回扫仍写「331 → 387 行」，与 §1 / 文首的 388 打架 → 已统一为 388 并标注口径；S1 §7「见下方回填」断链 → 已回填；S2 `.session/wisdom.md` 空行（gitignored）判定不处理。
- **R3：`Pass`**（`quick` delta，0 blocker / 0 warning / 3 suggest）——三处行数统一 388、计算式自洽；补「脚本值 = `wc -l` + 1」成因说明，供后续按任一工具复核；余 2 条为追溯完整性建议，已随本段落地或转后续治理。
- **复查基线**：本记录 §1 ~ §6 / §8；`docs/plan/{todo,roadmap,todo-archive,recurring}.md`；`docs/design/governance/index.md`；`.session`（gitignored）。

## 8. 已知观察与后续候选

1. `latest = 1.3.0`；`next` 仍为 `1.0.0-rc.1`（未启用）。
2. 依赖告警：`node-forge` low（dependabot #69）仍 open；`@tanstack/vue-table` / `@lucide/vue` / `vue` 三个 dependabot PR 因许可证台账标题未随安装版本更新导致 `Quality` 红，待人工处理。
3. 发布前置门禁（周回归绿）当前靠人工执行；`release.yml` 未接入机检，是否接入需用户决策（[就绪度记录](./2026-11-14-phase33-m5-1-release-readiness.md) §7）。
4. `test:visual` 的字体路径基线已按当前 Chromium 重冻结；后续 Playwright 升级须同批复核（[测试规范](../../standards/testing.md) 已补纪律）。
5. 下一阶段候选见 [Backlog](../../plan/backlog.md)；启动需用户明确授权。
