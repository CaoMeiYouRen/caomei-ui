# Phase 40 登记批次：国际化收口、P1 组件广度与 `1.4.0` 发布

> 创建时间：2026-11-21
> 触发：用户就[下一阶段范围评估（第二十四轮）](./2026-11-21-next-stage-scope-evaluation-24.md) 的 D0 ~ D3 作出裁定：D0 ③（推荐 + P1 组件）、D1 ④（Form 校验不纳入）、D2 ①（阶段末发 `1.4.0` + 下游复验）、D3 ①（issue #71 作本阶段独立机械批次）。
> **本记录是 Phase 40 范围与验收口径的唯一载体**；`todo.md` / `roadmap.md` 只做状态指针与阶段摘要。

## 1. 阶段构成

- **编号推导**：取授权启动时已有最大编号 Phase 39 + 1 = **Phase 40**（[规划规范 §4](../../standards/planning.md)）。
- **4 条主线 / 15 条原子条目**：国际化收口 **4** / P1 组件广度 **6** / 发布收口 **3** / 规划载体收口 **2**；构成对账 4 + 6 + 3 + 2 = 15。
- **主线性质**：M1 ~ M3 为功能与发布主线；**M4 为用户 D3 ① 授权的独立机械批次**（不占功能主线），为可跟踪性仍占一条主线行。功能主线 3 条、治理主线 1 条，均落在[规划规范 §6](../../standards/planning.md) 的 3–6 条区间；15 条在建议区间 10–15。
- **相对评估草案的构成变化**：D1 ④ 移出 Form 校验能力（-3 条）；D3 ① 纳入规划载体收口（+2 条）；P1 组件按实施粒度每件拆为「实现与测试 / 文档与登记面」两条（3 件 × 2 = 6 条，替代评估草案的 3 条合并条目，避免单条越过 10 文件阈值）。评估草案的 13 条为提名期时点值，本记录以 15 条为准。
- **范围来源**：国际化缺口与状态表见[三问调研 §3.3 / §3.5](./2026-11-18-i18n-component-and-mobile-research.md) 与 Backlog §1.4 / §1.6；P1 组件见 Backlog §1.11；发布见 Phase 39 遗留；规划载体改名见 issue #71 与[研判记录 §3.6](./2026-11-20-planning-doc-model-v1-evaluation.md)。
- **阶段级非目标**：不做 Form 校验能力（D1 ④）；不做国际化二期 7 语（D0 ③）；不做 Tree / TreeSelect、RTL、DataTable 虚拟滚动、移动端第二波、宽屏视觉基线 / `xl` 断点、P2 高级组件、P2 单 Demo 抽屉、依赖与工具链升级；不新增运行时依赖；不做破坏性 API；不自动发布；不进入 2.0。
- **主线级非目标**：
  - M1：不做二期语言扩容、复数 / 插值、RTL、通用格式化 API、键级运行期兜底，不改 `ConfigProvider` 的模块级注册模型。
  - M2：不做 Tree / TreeSelect、P2 组件、业务件。
  - M3：不改发布触发模型，不自动发布，不重指 tag，不强制下游升级。
  - M4：不引入 `roadmap-phases-*.md`，不改索引倒序，不动 400 行阈值。

## 2. 条目与验收口径

| 编号 | 主线 | 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|:---|:---|
| **M1-1** | 国际化收口 | 日期 / 时间 locale 跟随与语言惯例默认值 | `DatePicker` / `Calendar` 的 `locale` 缺省消费 `useLocaleCode()`，显式 prop 优先；`weekdayFormat` / `hourFormat` 缺省按语言惯例推导；`en-US` 下月份 / 星期 / 12 小时制正确，`zh-CN` 行为不变；单测 + 定向 E2E；迁移注意事项声明缺省行为变更 | ≈ 8 | 无 |
| **M1-2** | 国际化收口 | 数字 / 体积本地化 | `InputNumber` 向 `NumberFieldRoot` 透传 `locale`；`Paginator` 每页条数与页码改用注入 locale 的 `Intl.NumberFormat`；`FileUpload` 体积格式化随 locale；`en-US` 显示 `1,234.56` / `1,000`，`de-DE` 显示 `1.234,56`；单测断言字面值 | ≈ 8 | 无 |
| **M1-3** | 国际化收口 | 可访问名补口与 10 语台账 | `DataTable` 列宽手柄与 `FileUpload` 移除按钮补 `table` / `fileUpload` 键并纳入 10 语；`check:locale-keys` / `check:locale-ledger` 绿；英文站点读屏与提示为英文；单测覆盖键存在与回退 | ≈ 14 | M1-1 / M1-2（同批 locale 文件，串行改同一组文件） |
| **M1-4** | 国际化收口 | 支持语言与翻译状态表 | 中英双页新增「支持语言 + 分发形态 + 键覆盖 + 复核状态」总表；键覆盖取 `check:locale-keys` 实测，不手写估计；README 中英各补一行回链；`docs:check` 全绿 | ≈ 4 | M1-1 ~ M1-3（键覆盖读数在代码落地后生成） |
| **M2-1** | P1 组件广度 | Transfer 实现与测试 | 封装左右穿梭、受控 / 非受控 `v-model`、搜索、禁用、自定义字段与插槽；键盘与读屏路径；320 / 768 / 1280；亮暗；单测 + 定向 E2E | ≈ 6 | 无 |
| **M2-2** | P1 组件广度 | Transfer 文档与登记面 | 中英组件页、示例、设计清单 / 侧栏 / 总览 / 画廊、10 语可访问名与台账；与 `DataTable` 选择能力的边界说明 | ≈ 8 | M2-1 |
| **M2-3** | P1 组件广度 | Cascader 实现与测试 | 组合封装（触发器 + 面板 + 多级列表；Reka 2.11 无 Cascader primitive）；多级展开、搜索、`change-on-select`、清除、禁用；键盘与读屏路径；单测 + 定向 E2E | ≈ 6 | 无 |
| **M2-4** | P1 组件广度 | Cascader 文档与登记面 | 中英组件页、示例、设计清单 / 侧栏 / 总览 / 画廊、10 语可访问名与台账；与 `Select` 的边界说明 | ≈ 8 | M2-3 |
| **M2-5** | P1 组件广度 | Timeline 实现与测试 | 时间轴节点、方向、交替布局、图标 / 自定义内容、语气色；320 不溢出；亮暗；单测 + 定向 E2E | ≈ 6 | 无 |
| **M2-6** | P1 组件广度 | Timeline 文档与登记面 | 中英组件页、示例、设计清单 / 侧栏 / 总览 / 画廊；与 `Steps` / `Descriptions` 的边界说明 | ≈ 7 | M2-5 |
| **M3-1** | 发布收口 | 发布前门槛复核 | 重跑 `Weekly Regression` 并确认 `success`；安全告警 0；`pnpm verify` + 覆盖率门禁；复核 `1.3.0` 后 14 个组件包的登记面（包根导出 / resolver / Nuxt 模块 / 侧栏 / 画廊 / locale 台账）；`pnpm build` 产物冒烟；漏项在本条修正 | ≈ 3 | M1-4 / M2-6 / M4-2 |
| **M3-2** | 发布收口 | `1.4.0` 发布与发布后校验 | 经 `release.yml` `workflow_dispatch` 发布；npm `1.4.0` 可解析、`v1.4.0` tag 与 GitHub Release 存在；CHANGELOG / 版本句 / `package.json` 一致；发布记录留痕 | ≈ 4 | M3-1 |
| **M3-3** | 发布收口 | 下游兼容复验与记录 | 复核发布后自动 dispatch 的 `downstream-compat` run（dependfix / caomei-auth / momei）；记录三仓 revision 与结论（success 或红因已归因）；回写下游锁定版本读数 | ≈ 2 | M3-2 |
| **M4-1** | 规划载体收口 | 存量分片改名与链接 / 锚点重指 | `docs/plan/archive/` 的 19 个 `phase-*.md` → `todo-archive-phases-*.md`；单提交 `git mv` + 链接 / 锚点重指；`git diff -M` 只含 rename 与链接 / 锚点行；剥离链接目标后非空行多重集相等；链接门禁 exit 0 | 23 文件（含 19 个 `phase-*.md` rename） | 无 |
| **M4-2** | 规划载体收口 | 索引一致性与命名机检接入 | 新增 / 扩展守卫校验归档索引覆盖、命名形如 `todo-archive-phases-*`、无重复；存量豁免清单随改名前移；失败路径单测 + 负向对照；接入 `governance:check` | ≈ 5 | M4-1 |

> 文件面为登记估算，实施时按[规划规范 §5](../../standards/planning.md) 的 10 文件阈值拆分。**两处已声明例外**：① M1-3 的 10 语条目按键集合守卫要求整批提交，不按语言拆分（先例：Phase 35 M3-2 为 19 文件）；② M4-1 是单一机械改名语义，拆分会留下半新半旧的命名与死链，`git diff -M` 的 rename 面不计入「新增行」口径，链接行约 135 处、远低于 800 行。

## 3. 阶段规则

- **任务粒度**：单条 ≤ 10 文件 / 800 行；§2 表注声明的两处例外除外。计数回扫按[规划规范 §3.9](../../standards/planning.md) 覆盖 `todo.md` / `roadmap.md` / 本记录 / 索引摘要 / `.session`。
- **执行顺序建议**：先做 M4（机械改名，避免后续文档批次与分片链接交叉），再做 M1 / M2，最后 M3；M3 严格依赖前三者完成。
- **质量门**：每条目 `lint` / `typecheck` / 定向测试 / 必要 E2E / Review Gate；阶段末 `pnpm verify`。
- **状态词**：条目表沿用 `待执行 / 已交付`；进度表用 `未开始` / `进行中` / `已闭环` / `已阻塞`。映射：未开始 / 进行中 → 待执行，已闭环 → 已交付；已阻塞 → 待执行（归档前须转为已交付或移出）。
- **Review Gate**：每条目至少一轮 `@code-reviewer`；未 `Pass` 不得提交。
- **文档**：组件能力变化同步中英组件页与设计登记；不虚构未实现能力。
- **发布**：D2 ① 已授权阶段末发 `1.4.0`；执行前仍须确认周回归 `success`、安全告警 0，并以当时用户指令为准；不改发布触发模型。
- **依赖**：不新增运行时依赖。

## 4. 载体同步与候选流转

- `backlog.md`：迁出已登记候选——§1.4 的「DatePicker / Calendar 默认 locale 跟随 ConfigProvider」「InputNumber 数字本地化」「可访问名文案补口」三行（7 → **4**）；§1.6 的「国际化支持与翻译状态表」「规划文档模型 v1 存量分片改名 + 机检」两行（15 → **13**）；§1.11 的 Transfer / Cascader / Timeline 三行（15 → **12**）。迁出后候选池 50 → **42** 行；不写 `→ Phase 40` 迁出标注（[规划规范 §7](../../standards/planning.md)）。
- `todo.md`：新增 Phase 40 状态句、6 列进度表与 15 条条目表。
- `roadmap.md`：§1 当前态与 Phase 40 行（4 条主线 / 15 条原子条目）。
- 治理索引：本记录登记一行。
- `.session`：`current_phase` / `plan_state` 同批切到 Phase 40（15 条待执行）。
- **未纳入项**：Form 校验能力（D1 ④；保留 Backlog §1.11）、国际化二期 7 语（D0 ③；保留 Backlog §1.4）、Tree / TreeSelect 与 P2 组件（Backlog §1.11）、虚拟滚动（Backlog §1.6 对应评估）、移动第二波（Backlog §1.5）、宽屏 / `xl`（Backlog §1.6）、依赖升级（Backlog §1.6）、RTL（Backlog §1.4）、P2 文档预览（Backlog §1.6）。
- **回扫**：对 8 个迁出候选名做 `rg`，活载体 0 处仍以现在时指向原 Backlog 行（治理 / 评估记录为点时快照，不回改）；`§1.6` / `§1.11` 行数变化同批在相关叙述句核对。

## 5. 风险与前置

| 项 | 风险 / 前置 | 处置 |
|:---|:---|:---|
| 国际化行为变更 | `locale` 缺省由 `zh-CN` 改为注入语言；`weekdayFormat` / `hourFormat` 缺省变化 | 迁移注意事项单点声明「显式 prop 优先」；中英示例与文档断言同步；`capture:styles` / 定向 E2E |
| `Intl` 环境差异 | Node / 浏览器 ICU 版本不同导致分组与小数点不一致 | 测试固定 locale 与 `NumberFormat` 选项；单测断言字面值 |
| 10 语同批 | M1-3 跨 10 个 locale 文件 | 按先例整批提交；`check:locale-keys` / `check:locale-ledger` 作为硬门禁 |
| P1 组件无下游用量 | API 易按生态对照过度设计；Transfer / Cascader / Timeline 均无 Reka 对应 primitive，需组合封装 | 插槽优先、受控 props 最小；先做一次性交互探针再定 API；文档示例覆盖真实场景；下游落地后按反馈再扩 |
| 发布前置 | 2026-11-20 周回归 `cancelled`；`check:weekly-regression` 非绿即中止 | M3-1 重跑周回归；未绿则 M3-2 阻塞，不降级发布 |
| 14 个组件包登记面 | 包根导出 / resolver / Nuxt 模块 / 侧栏 / 画廊 / locale 台账漏项 | M3-1 用机检 + `rg` 逐载体核对；漏项在发布前修正 |
| 改名链接面 | 19 个分片 / 135 处链接，漏改会留下静默死链 | 单提交 `git mv` + 链接重指；`git diff -M` 与链接门禁双重校验；`check:governance-records` 兜底 |
| 阶段容量 | 4 主线 / 15 条（建议上限） | 每件组件拆为「实现 / 文档」两条；实施按 10 文件 / 800 行阈值继续拆分 |
| wisdom 阈值 | 20 条活跃 = 阈值 | 阶段归档前执行 `pnpm distill:wisdom` 并留痕 |

## 6. Review Gate

**结论：R1 Pass**（`standard`，2026-11-21）。

- 轮次：R1 `standard` **Pass**（0 blocker / 1 warning / 1 suggest；warning 与 suggest 均在同轮修正并复核）。
- audit-depth：**`standard`**——登记批次含阶段构成计数、跨载体对账与跨仓事实（14 个组件包 / 19 个分片），按[AI 协作规范 §3.1](../../standards/ai-collaboration.md)不得降为 `quick`。
- 时间盒：≤ 10 分钟；实际用时约 1 分钟（17:39:42 → 17:40:30），未超。
- 复查基线：本记录 §1 / §2 / §4 + `todo.md` 当前态 / 进度表 / 条目表 + `roadmap.md` §1 / 阶段表 / §5 + `backlog.md` 改动行 + 治理索引首条。

### Findings

#### blocker

无。

#### warning

1. **RG-W01**（首次）M2-3 写「Reka 现成 primitive 或组合封装」，但 Reka 2.11 无 Cascader 导出（`node -e` 实测仅 `Tree*` 命中）。
    - 风险：把自研组合封装误记为「现成 primitive」，会低估 M2-3 的交互与测试成本。
    - 修复方向：改为「组合封装（触发器 + 面板 + 多级列表；Reka 2.11 无 Cascader primitive）」，并在 §5 风险表补「Transfer / Cascader / Timeline 均无 Reka 对应 primitive」；已修正。

#### suggest

1. **RG-S01**（首次）M4-1 文件面写「23 文件（19 rename + 链接面）」，易被读成 19 + 23 = 42 个文件。
    - 风险：与 §1「链接面 135 处 / 23 文件」的同一事实出现两种读法。
    - 修复方向：改为「23 文件（含 19 个 `phase-*.md` rename）」；已修正。

### 验证证据

- 已执行验证：`check:stage-counts`（Phase 40 构成 4 / 15，条目行 15，载体 2）；`check:stage-progress`（进度表与条目表一致）；`check:planning-numbers`（0 处）；`check:governance-records`（395 个治理记录与索引一致，652 个 md 指针无失效）；`check:governance-counts`；`check:standards-redundant:strict`；`check:audit-protocol`；`check:ai-asset-links`；`lint:md:check`；`docs:check:links`（655 md）；`docs:check:integrity`（652 md）；`docs:check:line-count`；`check:final-newline`。
- 结果摘要：全部 exit 0；Backlog 迁出 8 行后逐节 1 / 2 / 0 / 4 / 7 / 13 / 1 / 1 / 1 / 0 / 12 = **42 行**，与 §4 的 50 → 42 一致；`todo.md` 条目 15 行，与登记 §2 的 15 条一致。
- 未覆盖边界：未运行代码类门禁与 E2E（本批零 `src/**` 改动）；M4-2 机检尚未实现，改名批次的 `git diff -M` 断言将在 M4-1 执行时验证；`.session` 为 gitignored、未进 diff。
- 后续补跑计划：M4 / M1 / M2 / M3 每条目独立走对应验证与 Review Gate；阶段末 `pnpm verify`；发布前重跑周回归。

## 7. 验收与回扫

- 阶段完成时按[规划规范 §7](../../standards/planning.md) 归档：`todo.md` 清空、`roadmap.md` 更新、`todo-archive.md` 入窗、`recurring.md` 门槛复核、三段式回扫。
- `.session` 阶段态在登记 / 范围变更 / 归档三类事件同批同步。
- 阶段末发布 `1.4.0`；发布后确认 `latest` 与版本句一致。
