# Phase 34 M5-4：BackTop 文档、示例、目录登记与 E2E

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M5-4 行。

## 1. 交付面（15 文件）

| 面 | 文件 |
|:---|:---|
| 组件页（中 / 英） | `docs/components/back-top.md` / `docs/i18n/en-US/components/back-top.md`：用法、目标与阈值、回顶行为、无障碍、样式定制、PrimeVue 迁移对照、自动 API 表 |
| 示例（中 / 英） | `docs/examples/back-top/basic.vue` / `docs/i18n/en-US/examples/back-top/basic.vue` |
| 画廊登记 | `docs/.vitepress/showcase-registry.json`：`BackTop`（基础与布局，组内字母序） |
| 侧栏 | `docs/.vitepress/config.ts`：中英两侧「基础与布局」组内按字母序加入 BackTop |
| 总览 | `docs/components/index.md` / `docs/i18n/en-US/components/index.md`：组内位置与 §11 一致 |
| 设计登记 | `docs/design/components.md` Tier 3 行（已实现）；`docs/design/documentation-site.md` §11 分组清单 |
| E2E | `test/e2e/back-top.e2e.ts`：阈值显隐、固定定位与视口内几何、点击回顶后重新隐藏、未过阈值保持隐藏 |
| 视觉基线 | `test/visual/components.visual.ts` 登记 `ds-back-top-button`（下界 13 → 14）；`test/e2e/fixtures/app.vue` 新增该面（阈值 -1，常显）；`test/visual/__screenshots__/components.visual.ts/back-top-{light,dark}.png` 两份冻结基线 |

治理索引、记录本体与规划状态位不计入上表。复算口径（2026-11-15）：`git status --porcelain -uall | wc -l` 为 18，扣除 3 个治理载体（本记录、`docs/design/governance/index.md`、`docs/plan/todo.md`）后为 15，与表中逐行求和一致。15 文件超过 10 文件阈值，按[规划规范 §5](../../standards/planning.md) 以提交粒度拆两层（文档 / 登记与视觉面 → E2E），条目粒度仍为 M5-4。

**视觉基线**：`ds-back-top-button` 用阈值 -1 让按钮常显，元素级截图（亮 / 暗两张）冻结外观契约；固定定位不在整页截图中参与布局，元素级截取不受页面滚动位置影响。

## 2. 决策

1. **侧栏与总览按字母序，不按「组件类型」直觉排序**：`docs:check:structure` 以 §11 为单一事实源校验组内字母序，BackTop（B）排在 Avatar 与 Badge 之间；画廊登记同样按英文名排序。
2. **画廊条目用「基础与布局」分组**：BackTop 是页面级常驻控件，不属表单或数据展示；分组与侧栏保持一致，`check-showcase-registry` 才能通过。
3. **组件页写明「阈值严格大于」与默认值 200**：与实现一致，避免消费方按 PrimeVue 的 400 误判。
4. **迁移表标注行为差异**：PrimeVue 的 `behavior` 开关在本库不提供（按 `prefers-reduced-motion` 自动选择），`threshold` 默认值不同；这是有意差异，写进迁移表而非隐藏。
5. **E2E 用元素目标而非 window**：夹具已有独立滚动容器，回顶与显隐都可确定化；window 目标的默认分支由 M5-1 单测覆盖。
6. **视觉基线截按钮本体**：固定定位控件放进整页截图会与内容重叠，故登记 `ds-back-top-button` 做元素级截图（亮 / 暗两份），并纳入负向对照（`#ds-back-top-button` 的 padding 注入须使该面报差异），避免「截到空 section」的假绿。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 定向 E2E | `npx playwright test test/e2e/back-top.e2e.ts` → `exit 0` |
| 视觉基线 | `pnpm test:visual` → `exit 0`（含新增 `back-top-light` / `back-top-dark` 两份冻结基线） |
| 文档结构 | `check-docs-structure` / `check-showcase-registry` / `check-components-overview` / `check-design-catalog` → `exit 0` |
| 文档引用 | `check-example-refs` / `check-i18n-parity` → 通过 |
| 文档站页面（V） | 复用组件级 E2E 的结论：文档 demo 与夹具使用同一组件实现，固定定位 / 显隐 / 回顶路径一致；文档站侧栏 / outline 的重叠属布局观感，已在画廊页与组件页的构建中检查，未做逐视口截图 |
| 未覆盖边界 | 阈值等值（`scrollTop === threshold` 隐藏）、缺省 `window` 目标与 `smooth` 行为由组件单测覆盖，E2E 只验证元素目标下的显隐与回顶 |
| `pnpm verify` | `exit 0`。首轮命中 `date-picker` 区间选择、后续一轮命中 `accordion` 单开收起各一例 flaky，隔离运行对应文件均通过、未改动这两个组件，复跑通过——归因为并行负载下的既有 flaky，与本批改动无因果 |

## 4. Review Gate

- **R1（`standard`，A 文档 / 示例 / 登记 / E2E，B 记录 / 索引）**：`Reject`（3 blocker：缺视觉基线、迁移表与 PrimeVue `ScrollTop` API 不符、记录复述门禁读数；3 warning：§1 复算口径、`verify` 占位与 flaky 未记、文档页 V 缺证据；3 suggest）。
- **R1 修复**：① 新增 `ds-back-top-button` 视觉面并冻结亮 / 暗基线，纳入负向对照；② 两语迁移表按 `ScrollTop` 实际 props 重写并补迁移指南链接；③ §3 改命令 + `exit 0`，索引去掉计数；④ §1 补 `git status -uall` 读数与扣除路径；⑤ §3 回填 `pnpm verify` 与两类 flaky 归因；⑥ §3 补文档页 V 的复用说明与 E2E 未覆盖边界。
- **R2（`quick`，A/B 修复点）**：`Reject`（1 blocker：视觉面截的是空 section，基线无按钮像素且负向对照不命中；2 blocker 级记录项：决策 6 与 §1 自相矛盾、§4 仍为占位）。已修复：截图目标改为按钮本体、负向对照补规则、决策 6 改写、§4 回填、§3 删残留计数并补 `accordion` flaky。
- **R3（`quick`，R2 修复点）**：`Pass`（0 blocker；视觉基线实测为 40×40 按钮本体、负向对照两例均报差异；决策 6 / §1 / 索引同口径；§4 无占位）。follow-up（已收口）：负向对照注释的类目数、`ds-back-top` 死样式、记录中的旧 id。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 承接 M1-1：可测量盒的真实布局级持久守卫 | 本阶段 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 / F17 | 承接 M1-6 | 见 M1-6 记录遗留节 |
| F18 | 承接 M3-1：Select 展开时兄弟节点仅 `aria-hidden`、未 `inert` | 见 M3-1 记录遗留节 |

## 6. 复查基线

本记录 §1 ~ §5；两语组件页与示例；`showcase-registry.json` 的 BackTop 项；`config.ts` 中英侧栏的 BackTop 行；两语总览页对应行；`design/components.md` 与 `documentation-site.md` §11 的登记；`test/e2e/back-top.e2e.ts` 两例。
