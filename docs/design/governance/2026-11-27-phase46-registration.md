# Phase 46 登记批次：依赖治理与新组件第三批（合并）

> 创建时间：2026-11-27
> 触发：用户就[第三十一轮范围评估](./2026-11-27-next-stage-scope-evaluation-31.md) 裁定 **D1 = B（新组件第三批）并在备注中要求「A + B」**；同时确认 D2 = 运行期说明符 + 强制安装文档、D4 = Editable / TagGroup / TreeVirtualizer / Picker / Sticky、D5 = 治理五项全取。
> 性质：**阶段登记批次记录**（含取证与决策）；范围与验收口径的唯一载体。
> 基线：`master` = `d21e04c1`（第三十一轮评估合入）；阶段编号按[规划规范 §4](../../standards/planning.md#_4-阶段与条目命名)取「已有最大编号 + 1」= **Phase 46**。

## 1. 取向与决策

- **取向**：A（依赖与治理收口）与 B（新组件第三批）**合并为同一阶段**，按用户备注「A+B」执行；治理项先行、组件批次随后，避免组件实现被治理装置的返工反复打断。
- **容量重排**：A 原 5 主线 / 11 条 + B 原 5 主线 / 10 条 = 10 主线 / 21 条，**超过 §6 的 8 主线上限**；本批次按语义合并为 **7 主线 / 20 条**（条目数 21 → 20 的差额来自 A 的 M1：原 3 条按「取证 + 改造 / 回归 + 文档」压缩为 2 条）：
  - A 的「浮层样式与交互收口」与「规划文档小口」合并为 M4（4 条，仍在主线 1–5 条内）；
  - B 的五组件按族合并为 M5（Editable + TagGroup，4 条）与 M6（TreeVirtualizer + Picker，4 条），Sticky 单列 M7（2 条）。
- **B 批用量取证**：沿用[第三十一轮评估](./2026-11-27-next-stage-scope-evaluation-31.md) §1 / §7 的 2026-11-26 复核（下游无页面引用），本批组件按用户 D4 授权与快速开发期方向纳入，不声称下游需求。
- **已裁定项**：
  - **D2**：可选 peer 采用「运行期说明符 + 强制安装文档」修法（M1-1）。
  - **D3（默认落定）**：`1.5.0` 发布收口不纳入本阶段，继续留 [Backlog](../../plan/backlog.md) §1.6「已决策待窗口」，2026-11-29 之后且用户明确授权时另立条目。
  - **D4**：组件集 = Editable / TagGroup / TreeVirtualizer / Picker / Sticky。
  - **D5**：治理五项全取（可选 peer、许可证门禁、版本升级影响面、浮层收口、文档小口）。

## 2. 条目与验收口径

> 拆分口径：单条核心文件 ≤ 10（[规划规范 §5](../../standards/planning.md#_5-任务粒度约束)）；`src/locale/*` 等文案小改动不单独计数；含中英页面 / 示例 / 共用登记面的文档条目按 §5 注记计 **8–12 文件**（E2E 夹具 `test/e2e/fixtures/app.vue` 与用例同批、按 Phase 45 先例在登记记录 §6 的执行期偏差中说明，不额外计入）。

**归属约定（防重复计）**：五个组件的**包根导出**（`src/index.ts`）、**Nuxt 清单**（`src/nuxt/components.ts`）与 **a11y 夹具**（`test/a11y/fixtures.ts`）随各自**实现条目**（M5-1 / M5-3 / M6-1 / M6-3 / M7-1）落地，不并入文档条目（否则文档条目会从 12 文件升到 15）；若守卫强制在实现条目内同批，按 Phase 45 先例在 §6 记执行期偏差。**locale**：本批五个组件均复用既有键，不新增文案；**共用登记面（5）** = `documentation-site.md` §11、中英侧栏、中英总览、组件设计 §5、locale 台账。

### M1 可选 peer 结构改进（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M1-1 三路径取证与加载器改造 | 三族（chart / editor / qrcode）消费方 fixture 实测「未安装且未使用」「未安装但使用」「已安装」三条路径；按 D2 把字面量动态 `import()` 改为**运行期说明符 + 强制安装文档**（或等价的打包器安全写法），未安装时**构建通过**、使用时给出清晰错误（错误文案含包名与安装命令，由 `optional-peers.test.ts` 断言）；`pnpm check:optional-peer` 覆盖新形态并保留反向断言，输出为可断言的 JSON 键集合 | `scripts/release/check-optional-peer-consumer.mjs`、`src/components/chart/chart-loader.ts`、`src/components/rich-text-editor/editor-language.ts`、`src/components/qrcode/qrcode-loader.ts`、`test/contracts/optional-peers.test.ts`、`docs/guide/getting-started.md` | 裁定 D2 |
| M1-2 回归与口径同步 | 全量 `pnpm test` / `pnpm typecheck` / `pnpm build` / `pnpm check:build` / `pnpm check:nuxt` / `pnpm check:resolver` 绿；架构文档「可选 peer 边界」、发布指南与组件页的安装说明同步为实测事实；「未安装即降级」类旧句逐处回扫 | `docs/design/architecture.md`、`docs/guide/release.md`、组件页（chart / rich-text-editor / qrcode）中英 | M1-1 |

### M2 直接依赖许可证策略门禁（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M2-1 SPDX 判定与测试 | 按[评估记录](./2026-11-26-dependency-license-policy-evaluation.md) §4 落地：阻断（GPL / AGPL / SSPL / BUSL / Elastic-* / CC-BY-NC / `UNLICENSED` / `SEE LICENSE IN` / `LicenseRef-*` / 无 `license` / 未知）、告警（MPL / LGPL / EPL / CC-BY / Artistic / Python）、通过三档；`EXTRA_ALLOWED_LICENSES` 放行路径先于档位匹配；约 10 例测试 | `scripts/governance/license-policy.mjs`（新）、`scripts/governance/check-licenses.mjs`、`scripts/governance/check-licenses.test.mjs` | 评估记录 |
| M2-2 规范与发布口径 | [安全规范 §6](../../standards/security.md) 把「引入 copyleft 前须确认并记录」改写为可执行门禁并注明入口（该页为中文单语）；发布指南中英同步；`governance:check` 绿 | `docs/standards/security.md`、`docs/guide/release.md`、`docs/i18n/en-US/guide/release.md` | M2-1 |

### M3 版本升级影响面评估自动化（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M3-1 消费方可见变化清单 | 新增 `scripts/release/diff-consumer-impact.mjs`（复用 `diff-api.mjs` 的声明解析，不扩展其单一职责）：公共 props / 默认值 / 事件、DOM 结构关键类名、`--caomei-*` 变量增删；输出 JSON 并以 `1.4.0` 历史差异回放做断言；是否把 `check:api-surface` 纳入发布链在本条内裁定并留痕 | `scripts/release/diff-consumer-impact.mjs`（新）、`scripts/release/diff-api.mjs`（只读复用）、`package.json`、对应测试 | — |
| M3-2 下游回归接入与文档 | `Downstream Compat` 增补关键流 / 视觉回归入口；可用下游 = 矩阵内 dependfix / caomei-auth / momei 中具备关键流或视觉回归能力者，其余记为「未覆盖 + 风险」而非视为已覆盖；[发布指南 §10.1](../../guide/release.md) 升级为「清单 + 回归」流程；workflow 校验 = `actionlint`（本地无则 `gh workflow view` + YAML 解析）+ 手动 dispatch 冒烟 | `.github/workflows/*`（Downstream Compat 所在文件）、`docs/guide/release.md`、中英 | M3-1 |

### M4 浮层样式与文档收口（4 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M4-1 Cascader 面板改 TreeSelect 口径 | `cascader.vue` 面板样式改为非 scoped 命名空间块（与 TreeSelect 一致），真实浏览器下 `padding` / `max-width` 生效；补几何守卫防回退 | `src/components/cascader/cascader.vue`、`test/e2e/cascader*.e2e.ts`（或几何契约） | — |
| M4-2 浮层 `inert` 首击语义 | 取证方式 = 下游代码检索 + 浏览器复现（首击命中目标）记录；实现不吞首击（仅拦截焦点 / 重派发点击）或书面裁定不改并留痕；改动收敛在共享模块（必要时只改 `select` 一族作为首个消费方），a11y / E2E 回归绿 | `src/_shared/open-state-inert.ts`、`src/components/_shared/use-open-state-isolation.ts`、`select` 一族（如需）、a11y / E2E | — |
| M4-3 英文总览镜像列表对齐 | 英文总览「Chinese documentation」列表与中文总览成员一致；`check-components-overview` 扩展为机检两侧镜像 | `docs/i18n/en-US/components/index.md`、`scripts/governance/check-components-overview.mjs` | — |
| M4-4 Phase 39 归档块补节与守卫 | 在 Phase 39 深度归档块补「未覆盖边界」（Phase 39 的质量门 / 逐条 RG 现写在「阶段总结」内，补节时一并明确两处口径）；新增 `check-archive-sections.mjs` 机检 6 项必填，受检面 = **显式块清单（Phase 39 起）**，豁免与字段位置写进脚本注释；Phase 39 归档文件的「正文逐字保留」说明同步加例外注记 | `docs/plan/archive/todo-archive-phases-39.md`、`docs/plan/todo-archive.md`（仅归档索引行同步）、`scripts/governance/check-archive-sections.mjs`（新）与测试、`package.json`（接入 `governance:check`） | — |

### M5 Editable 与 TagGroup（4 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M5-1 Editable 实现与测试 | 封装 Reka `Editable*`：行内编辑、`v-model`、进入编辑（点击 / 双击 / 键盘）、提交 / 取消、Esc 回退、只读与禁用、激活态焦点管理；单测覆盖提交 / 取消 / Esc / 禁用 | `src/components/editable/*` | Reka `Editable*` |
| M5-2 Editable 文档与 E2E | 中英组件页 + 双语示例（基础 / 受控）；E2E 覆盖进入编辑、提交、Esc 回退与焦点 | 中英页（2）、中英示例（4）、`test/e2e/editable.e2e.ts`、共用登记面（5） | M5-1 |
| M5-3 TagGroup 实现与测试 | 封装 Reka `TagGroup*`：选择 / 多选、方向键与 Delete 移除、禁用项、`v-model`；单测覆盖键盘与移除 | `src/components/tag-group/*` | Reka `TagGroup*` |
| M5-4 TagGroup 文档与 E2E | 中英组件页 + 双语示例（基础 / 可移除）；E2E 覆盖键盘选择与移除 | 中英页（2）、中英示例（4）、`test/e2e/tag-group.e2e.ts`、共用登记面（5） | M5-3 |

### M6 TreeVirtualizer 与 Picker（4 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M6-1 TreeVirtualizer 实现与测试 | 封装 Reka `TreeVirtualizer`：大列表仅渲染可视区（单测以 mock 虚拟化尺寸驱动区间断言）、展开 / 折叠容器高度正确、键盘导航可用（键盘断言下沉 M6-2 E2E） | `src/components/tree-virtualizer/*` | Reka `TreeVirtualizer`（2.11.0 已导出，2026-11-27 核对） |
| M6-2 TreeVirtualizer 文档与 E2E | 中英组件页 + 双语示例（基础 / 大数据）；E2E 验证渲染节点数上界与滚动后更新 | 中英页（2）、中英示例（4）、`test/e2e/tree-virtualizer.e2e.ts`、共用登记面（5） | M6-1 |
| M6-3 Picker 实现与测试 | 通用非时间滚轮选择器：单列 / 多列、`v-model`、循环、吸附与动量滚动、键盘；与 `TimePicker` 的 wheel 模式共享口径不重复实现；单测覆盖索引 / 边界 / 动量收敛（滚动结束后吸附到最近项） | `src/components/picker/*` | — |
| M6-4 Picker 文档与 E2E | 中英组件页 + 双语示例（单列 / 多列）；E2E 覆盖滚轮吸附与键盘 | 中英页（2）、中英示例（4）、`test/e2e/picker.e2e.ts`、共用登记面（5） | M6-3 |

### M7 Sticky（2 条）

| 条目 | 验收口径 | 文件面 | 依赖 |
|:---|:---|:---|:---|
| M7-1 实现与测试 | 吸顶工具：`sticky` 容器 / 偏移 / 层级、容器边界内吸附、与滚动容器协作；单测覆盖偏移与边界 | `src/components/sticky/*` | — |
| M7-2 文档与 E2E | 中英组件页 + 双语示例（基础 / 容器内）；E2E 覆盖滚动吸附与边界释放 | 中英页（2）、中英示例（4）、`test/e2e/sticky.e2e.ts`、共用登记面（5） | M7-1 |

## 3. 非目标

- **发布**：不执行 `1.5.0` 发布收口（D3 默认落定，窗口 2026-11-29 后另行授权）；`latest` 维持 `1.4.0`。
- **国际化二期 / RTL / 真机验收 / `xl` 断点 / DataTable 虚拟滚动 / Form rules**：维持 Backlog 或条件触发。
- **依赖**：除既有可选 peer 的加载形态改造外不新增运行时依赖；`embla-carousel-vue` 等既有依赖不升大版本；不做破坏性 API 与自动发布。
- **组件**：不纳入 Sticky 以外的移动端候选（软键盘遮挡、焦点完整可见、Toolbar md 档、Stepper 窄容器）。

## 4. 容量与排序

- **规模**：**7 条主线 / 20 条原子条目**（M1 2 / M2 2 / M3 2 / M4 4 / M5 4 / M6 4 / M7 2；构成对账 2 + 2 + 2 + 4 + 4 + 4 + 2 = 20）。
- **为何不拆阶段（用到第 7 条主线）**：A 与 B 均为用户同批指定；M1–M4 与 M5–M7 之间除中英总览登记面外无文件交叠（组件族内部共用登记面按序追加），且 M4-3 先于 M5–M7 执行（其机检扩展需覆盖后续新增组件）；拆分会让 B 批空等 A 批归档。
- **20 条的拆分判断（>15 条）**：组件族按「实现与测试 / 文档与 E2E」各 2 条（与 Phase 45 同型）；治理项已压在各自最小可验收粒度（M1–M3 各 2 条、M4 的四件事互不相关各 1 条）。若执行期容量不足，**优先保 A 批（M1–M4）**，组件条目按 M5 → M6 → M7 顺序顺延，不缩减单条验收。
- **排序**：M1 → M2 → M3 → M4 → M5 → M6 → M7；主线内先实现后文档与回归。
- **上限纪律**：20 条已达 §6 上限，执行期**不得追加条目**；确需追加须拆阶段或替换等量条目。
- **计量**：条目与验收口径为准，不写人日。

## 5. 载体同步

- `docs/plan/todo.md`：登记当前阶段、7 行进度表（6 列）与 20 条条目表。
- `docs/plan/roadmap.md`：§1 当前态改为进行中阶段；阶段表追加 Phase 46 行。
- `docs/plan/backlog.md`：迁出 9 行候选（§1.1 两条：`inert` 首击、Cascader 面板；§1.5 两条：Picker、Sticky；§1.6 五条：可选 peer、许可证门禁、版本升级影响面、英文总览镜像、Phase 39 归档缺节）。
- `docs/design/governance/index.md`：登记本记录。
- `.session/`：切到 Phase 46 任务态（gitignored，不入库）。

## 6. Review Gate

- **R1（`standard`，2026-11-27）**：**Pass** —— 0 blocker；7 warning（容量 21→20 推导缺项、「无文件交叠」前提不成立、文件面口径缺口、M1-1 / M4-2 文件面未点名、M1-2 / M3-2 验证不足、M3-1 与 `diff-api` 职责未定、M3-2 / M4-4 / M6-1 / M6-3 验收可判定性）+ 5 suggest。
- **R2（`quick`，2026-11-27）**：**Pass** —— R1 的 7 warning / 5 suggest 全部闭合；新增 4 warning（文档条目文件面 + 夹具说明、M4-4 判定面会误伤 Phase 38、§6 未回填、backlog §1.11 Sticky 指针残留）+ 6 suggest。
- **R3（`quick`，2026-11-27）**：**Pass** —— R2 的 4 warning 与 6 suggest 同批采纳（§6 回填、M4-4 显式块清单与守卫定名、backlog 指针改写、文档条目夹具口径、M3-2 下游措辞、M1-1 错误文案断言、`check-archive-sections.mjs`）；本轮新增 1 warning（§2 缺归属约定：包根导出 / Nuxt 清单 / a11y 夹具与 locale 台账未归属、「共用登记面（5）」未定义）已按执行期澄清处理：归属约定写入 §2，导出与 a11y 随各实现条目落地、不增条目、不破 20 条上限。
