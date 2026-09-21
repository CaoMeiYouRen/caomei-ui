# M3-5 计算样式取证装置入库（`test/capture/`）

- 类型：阶段内原子条目交付记录（含装置复算与等价证据）
- 触发：Phase 12 M3-5（**自 M3-2 拆出**：按 [规划规范 §5](../../standards/planning.md) 的任务粒度阈值，守卫与取证装置合计超阈值）
- 关联：[待办事项](../../plan/todo.md) Phase 12 ｜ [下一阶段范围评估](./2026-09-21-next-stage-scope-evaluation.md) §9 ｜ [测试规范 §2.1 / §4 / §6](../../standards/testing.md) ｜ [尺寸档位归一化记录](./2026-09-21-m3-1-size-tier-normalization.md) §5 ｜ [触发器收敛记录](./2026-09-21-m3-4-trigger-unstyled-convergence.md) §5

## 1. 结论

- **交付面**：M2-2 / M3-1 / M3-3 / M3-4 使用的一次性采集装置（`.temp/capture/`，gitignored）迁入仓库并集中到 `test/capture/`，成为可复算的常驻回归装置：
  - **夹具** `fixture/`：独立 Vite 应用（消费 `src/` 源码，端口 `4521`），覆盖声明式样式面；
  - **采集运行器** `capture.mjs`：驱动 Chromium 采样、写快照、按声明自检受检面，默认与冻结基线逐属性比对；
  - **比对运行器** `diff.mjs`：纯函数 + CLI（可比较任意两份快照）；
  - **冻结基线** `baseline.json`：由 `--freeze` 生成，须随装置同提交。
- **命令**：`pnpm capture:styles`（一条命令重跑并与基线比对，有差异 exit 1）、`pnpm capture:styles:freeze`（重写基线）。已接入周级回归 `regression-weekly.yml`（沿用该 job 已装好的 Chromium）。
- **采样面**：**239 项**，构成见 §2；相对一次性装置的 **262 项**，**未纳入 23 项，逐条登记于 §3**（不是静默收窄）。
- **等价证据（交叉复算）**：一次性装置在**当前 HEAD** 复跑 → 与其历史产物 `.temp/capture/m34-after.json` **262 项 0 差异**（确认两者同源）；与入库装置按语义前缀映射后对照 → **交集 239 项逐属性 0 差异**、`仅存于旧装置 23 项`（与 §3 登记一致）、`仅存于新装置 0 项`。
- **负向对照**：临时把 `input` 的 md 档高度改为 `calc(… + 1px)` → 报 **1 处差异**（`tier.input.md | height | 36px → 37px`）并 exit 1；还原后复跑 **0 差异**。证明探针对取值漂移灵敏、且「0 差异」不是工具空转。
- **迁移过程由交叉复算捕获的两处真实缺陷**（见 §5）：聚焦采样目标写错、Reka 实例计数器未归一。
- **质量门**：见 §6。**Review Gate（并发分区：A 装置本体 / B 接线与收口）**——R1：分区 A **Pass**（0 blocker / 3 warning / 3 suggest），分区 B **Reject**（1 blocker：本记录 §3 的「浮层面板 z-index」行记 10 而枚举手写 9 项，`z.toast.viewport` 被与 toast 行双重计入 → 已改为 9，使四行之和 = 23 并与交叉复算键集逐条一致）。同批采纳分区 A 的 W1（强制伪类未命中 / 聚焦未落到目标时入 `errors`，不再静默）、W2（`--freeze` 改严格参数解析，未知参数 exit 1）与 S1（`index.html` 注释口径），分区 B 的 S1 / S2 亦已收口。**R2 Pass**（0 blocker / 1 warning / 3 suggest）：B1、A-W1 / A-W2 / A-S1、B-S1 / B-S2 全部关闭，未采纳项 S2 / S3 的判定被复审确认成立；R2 的 W-R2-1（`.session/` 状态滞后）随本批收尾同步、S-R2-1（单测直接断言失败原因）已采纳，S-R2-2 / S-R2-3 按 follow-up 处理（前者会引入选择器不可聚焦的假失败风险，后者属诊断可读性）。审计与提交状态以 [待办事项](../../plan/todo.md) 与 `.session/` 任务态为准。

## 2. 装置结构与采样面

| 文件 | 职责 |
| --- | --- |
| `fixture/app.vue` | 采样夹具：每段以 `data-cap` 标记暴露一个用例，标记与运行器采样键一一对应 |
| `fixture/vite.config.mjs` | 独立 Vite 配置；`CAOMEI_SRC` 可指向 `HEAD` worktree，用于采集改动前基线（A/B） |
| `fixture/index.html` / `fixture/main.ts` | 应用外壳（`main.ts` 显式引入 `@/styles/index.css`，与一次性装置同口径） |
| `capture.mjs` | 采集运行器：启动夹具 → Chromium 采样 → 受检面自检 → 写快照 → 与基线比对（`--freeze` 写基线） |
| `diff.mjs` | 比对运行器：`diffEntries` / `formatDiffs` 纯函数 + CLI |
| `baseline.json` | **冻结基线**（生成物，按 [规划规范 §5](../../standards/planning.md) 不计入粒度阈值） |
| `capture.test.mjs` | 单测：采样面声明与预算、受检面自检、比对语义、Chromium 启动参数 |

采样面构成（合计 **239** 项，`declaredKeys()` 唯一性 + 预算由单测锁定）：

| 段 | 项数 | 覆盖内容 |
| --- | :-: | --- |
| `size.*` | 21 | 既有尺寸矩阵：auto-complete / multi-select / message / select（含 `__field`）/ select-button（含 `__item`）× sm / md / lg |
| `tier.*` | 26 | 档位归一化面：input / textarea（含 `__control`）/ input-number（含 `__button`）/ date-picker / tag / badge × sm / md / lg + badge `dot` 的 md / lg |
| `state.*` | 8 | 聚焦 / 非法态（input / textarea / input-number / select）的 `box-shadow` 与边框色（select 两态均强制 `:focus-visible`） |
| `trigger.*` | 12 | 触发器属性快照（闭合 / 开合）+ 外观计算样式：date-picker / color-picker / split-button |
| `variant.*` | 50 | 变体 × 语气矩阵：message（5 × 4）/ badge（5 × 3）/ tag（5 × 3） |
| `button.*` | 54 | 按钮矩阵：变体 × 语气 × 档位（含未聚焦的 outline 三属性） |
| `button-focus.*` | 54 | 同选择器强制 `:focus-visible` 后的描边三属性 |
| `z.*` / `radio-group-invalid.*` | 6 | 局部层叠（button-group / input-group 的 `:focus-within`、float-label、data-table 固定列）+ 单选组非法态指示器边框色 |
| `drawer.*` / `dialog.*` | 8 | 浮层尺寸档位（sm / md / lg 的宽高、动画与过渡时长）+ 遮罩 z-index |

**采样纪律（写入运行器头部注释，来自一次性装置的实测教训）**：

1. 参与 transition 的属性（`box-shadow` / `background-color`）须在状态稳定后读取（固定等待），否则基线 / 后测「双错同形」会得到 0 差异的假证据；
2. 需交互的采样（触发器开合、浮层开合）必须排在纯静态采样之后——模态遮罩会拦截点击。

## 3. 未纳入面（相对一次性装置 262 项，共 23 项）

| 未纳入面 | 项数 | 依据 |
| --- | :-: | --- |
| 浮层面板 z-index（select / multi-select / auto-complete / popover / dropdown-menu / color-picker / date-picker / image × 2） | 9 | 需逐个「点击开面板 → Esc 关闭」，是时序最脆弱的一段；层级字面量已由 `check:design` 的 G4 静态守卫（预算 0）拦截，计算样式侧无独有价值 |
| toast 视口 z-index + 各 tone 颜色 | 6 | toast 为瞬时元素，一次性装置曾因采样时序导致 6 项静默缺失（假通过先例）；颜色面由 `variant.*` 的 message / badge / tag 同源 token 覆盖 |
| confirm-dialog 内容与遮罩 | 2 | 需命令式 `useConfirm` + Provider 后代转发（`bus` 中继）才能构造，属交互面；几何与遮罩由常驻 E2E 覆盖 |
| 小屏媒体查询档位（select-button / `__item` × sm / md / lg） | 6 | 需切换视口并绑定第二套几何；断点行为由常驻 E2E 的三档视口用例覆盖 |

**纳入条件（触发点）**：若后续样式治理改动触及上述任一面（例如浮层面板引入新的层级 token、toast 配色重构），按同一装置扩入并 `--freeze`，扩入面在提交信息中说明。

## 4. 复算方法（可复现）

```text
pnpm capture:styles                # 采集并与冻结基线比对（0 差异 exit 0）
pnpm capture:styles:freeze         # 重写冻结基线（须随装置同提交）
node test/capture/diff.mjs <基线.json> <快照.json>          # 比对任意两份快照
CAOMEI_SRC=<HEAD worktree>/src node test/capture/capture.mjs  # 采集改动前基线（A/B）
```

本次交叉复算（一次性装置 vs 入库装置；**依赖 gitignored 的 `.temp/` 产物与一次性脚本，属迁移期取证、不可从仓库复算**，durable 证据由冻结基线 + 单测预算 + 受检面自检承接）：

```text
node .temp/capture/capture.mjs .temp/computed-styles/legacy-head.json
node .temp/capture/diff.mjs .temp/capture/m34-after.json .temp/computed-styles/legacy-head.json
node .temp/computed-styles/cross-check.mjs        # 前缀映射 m31→tier / m33→state / m34→trigger 后对照
```

## 5. 结果

- **一次性装置与当前 HEAD 同源**：复跑输出 `262 项 0 差异`（0 错误）。
- **交叉复算**：`旧装置 262 项 / 新装置 239 项 / 交集 239 项 / 逐属性差异 0 处 / 仅存于旧装置 23 项 / 仅存于新装置 0 项`（23 项与 §3 表逐条一致）。**该方法同时验证三件事**：旧装置在当前 revision 复跑与历史产物 0 差异（同源，避免拿陈旧基线当参照）、交集逐属性 0 差异（装置忠实）、两侧独有键集合与「未纳入 / 新增面」逐条相等（受检范围未静默收窄）——只做「跑通一次」无法区分「等价」与「采样面被悄悄削掉一块」。
- **负向对照**：`input` md 档高度 `+1px` → `1 处差异：tier.input.md | height | 基线=36px | 当前=37px`（exit 1）；还原后 `git diff` 为空且复跑 `0 差异：239 项逐属性与冻结基线一致`。
- **冻结基线自一致**：`--freeze` 写基线后立刻复跑 → 0 差异。
- **迁移期捕获的两处真实缺陷**（均由交叉复算发现，非推测）：
  1. **聚焦采样目标写错**：`z.input-group.focus-within` 迁移时把 `focus()` 打在包装层而非内层 `input`，`:focus-within` 未触发 → 采样值 `z-index: auto`（基线 `1`）。修正为聚焦内层元素后归零。
  2. **Reka 实例计数器未归一**：属性快照中的 `reka-dropdown-menu-content-v-<n>` 随夹具组件数量漂移，会把无关夹具改动报成差异。入库装置对 `-v-<n>` 归一为 `-v-*`（保留计数器以外的名称，故「`aria-controls` 指向哪一类面板」仍可断言），与既有的 `data-v-*` 过滤同口径。

## 6. 质量门

- `pnpm lint:check` / `pnpm lint:css:check` / `pnpm typecheck` / `pnpm test`（**75 文件 / 1452 tests**，含 `test/capture/capture.test.mjs` 17 tests）/ `pnpm lint:md:check` / `pnpm governance:check` / `pnpm docs:check`（links 229 md、integrity 230 md）均通过；**全链路 `pnpm verify` exit 0**（含 `build` / `check:build` / `check:resolver` / `check:nuxt` / `docs:build` / `typecheck:docs`）。
- **一次并发 flake（如实登记）**：全量 `pnpm test` 首轮有 1 处失败（`scripts/release/generate-changelog.test.mjs` 的临时 git fixture 创建），单文件复跑与全量复跑均通过；该测试与本次改动无调用关系，属既有并发脆弱点（flaky 治理按既有裁定「多次出现再处理」）。
- 装置自检：`capture.mjs` 在写结果前校验 `errors` 为空与受检面完整（缺失 / 选择器未命中即失败，不写结果）。
- 未纳入 `pnpm verify`：该装置需要真实浏览器，`verify` 必须在无浏览器环境可跑；调用点是周级回归 `regression-weekly.yml`（与 `check:coverage` 同类落位）。

## 7. 边界与未覆盖

- **不做像素级截图比对**：验收口径是「计算样式逐属性等价 + 属性快照等价」，与 M2-2 / M3-1 / M3-3 / M3-4 同口径。
- **基线绑定单一视口（1280×800）与 Chromium 版本**（快照记录 `chromiumVersion`）：小屏档位不在采样面内；`color-mix()` 等计算值的浏览器版本差异可能引起漂移，届时按 `--freeze` 重取并在提交信息说明。
- **语义前缀映射是迁移期的一次性口径**：`m31→tier` / `m33→state` / `m34→trigger` 只用于本次交叉复算，入库后的键名不再含规划性标记。
- 夹具未纳入 `pnpm typecheck` 的应用侧程序面（`tsconfig` 的 `include` 只含 `src` / `playground` / `test/**/*.ts` 与 `.vue`，本夹具在 `test/**` 内，`vite.config.mjs` 用 `.mjs` 后缀故不进 Node 侧程序）——运行器与夹具的 `data-cap` 对应关系由采集自检 + 单测预算共同保证。

## 8. 规模实测（[规划规范 §5](../../standards/planning.md) 回填）

- **实测**：`git diff --cached --stat` = 14 文件 / **+3129 −1** 行；其中 `baseline.json` 的 **1806 行**为生成物（按 §5 不计入），**计入阈值 = 13 文件 / 1323 行新增**。
- **构成**：装置 1198 行（夹具 482 / 运行器 `capture.mjs` 481 / 比对 `diff.mjs` 122 / 单测 113）+ 接线与配置 7 行 + 文档与规划 118 行（含本记录 113 行）。
- **超阈值说明（§5）**：本条目是**既有一次性装置的迁移**（非新增功能），规模下限由必须保留的取证面决定——239 项采样逐项对应 M2-2 起的等价证据；夹具 / 运行器 / 基线三者互为运行前提（夹具无运行器不能采集、运行器无夹具不能运行、基线无两者不能比对），进一步拆分只会产出不可独立复算的碎片。装置侧相对一次性装置的收窄已按 §3 逐面登记，**未做任何「为压行数」的采样面削减**。

## 9. 后续（登记范围）

- 周级回归已接线；`pnpm verify` 不含该装置（需浏览器），与 `check:coverage` 同类落位。
- 未纳入面的触发点见 §3；`backlog` 的「等价验证产物入库」候选行已标注迁出本条目，按 [规划规范 §7](../../standards/planning.md) 的归档清理规则保留至阶段归档。
