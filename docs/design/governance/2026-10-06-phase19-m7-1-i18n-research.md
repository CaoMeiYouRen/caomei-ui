# Phase 19 M7-1：国际化调研（主流组件库语言覆盖与文案分包 / 体积）

> 创建时间：2026-10-06
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 19 **M7-1**（国际化调研；用户 D10 上收）
> 性质：**只调研、不承诺实现**——不改代码、不改 `src/**`、不改规划载体（除登记索引与 `todo.md` 状态）。
> 来源分级：**L1 = 官方文档 / 官方仓库**（本记录优先 L1，共 6 项 L1 来源）；取证入口与命令见 §4。

---

## 1. 结论

- **语言覆盖范围**：主流组件库内建语言条目为 **43 ~ 72** 个（含地区变体）：Ant Design（React）**72**、Element Plus **67**、Ant Design Vue **66**、PrimeLocale（PrimeVue 社区语言包）**63**、MUI **59**、Vuetify **43**。本库当前 **5** 种（`zh-CN` / `zh-TW` / `ja-JP` / `ko-KR` / `en-US`），处于「聚焦型库」的合理区间——覆盖多寡并不与库质量线性相关，**真正决定边界的是下游实际需要**（本库 Backlog §1.4 已列 `ru` / `fr` / `de` / `es` / `pt`）。
- **文案分包与体积**：主流做法是**按语言拆成独立模块、由消费方按需导入**（AntD `antd/locale/*`、Element Plus `element-plus/es/locale/lang/*`、Ant Design Vue `ant-design-vue/es/locale/*`、MUI `@mui/material/locale` 逐语言具名导出、Vuetify `vuetify/locale` 具名导出），配合构建器 tree-shaking；日期 / 时间本地化**外置**给日期库（dayjs / 日期适配器）。
- **本库现状与启示**：本库 5 语言**全部汇入单一 `caomeiLocales` 对象并经根入口导出**、无按语言子路径 → 消费方**无法 tree-shake 掉未用语言**；但当前 5 语言合计仅 **854 行 / 20,269 B ≈ 19.8 KiB 内容**（`wc -c`；每语言约 138 行），膨胀压力很小。若长期扩展语言，可选（调研结论、非承诺）：**① 按语言拆子路径导出**（对齐 AntD / Element Plus 模式）或 **② 保留单包 + 按需动态导入**；两者均属工程方案，**本阶段不实施**。
- **差异化观察**：本库日期 / 时间**不依赖 dayjs 等全局日期语言库**（Calendar / DatePicker 走 `@internationalized/date`（Reka）与原生 `Date` / `Intl`），故**没有**「组件语言 + 日期库语言需两处同步」的经典陷阱；代价是日期格式本地化依赖 `Intl` 与 `locale` prop。

---

## 2. 主流组件库语言覆盖（L1）

| 库 | 生态 | 语言条目 | 来源（L1） | 分级 |
| --- | --- | --- | --- | --- |
| Ant Design | React | **72**（含 `en-GB` / `es-US` / `zh-HK` 等地区变体） | 官方 i18n 文档「Supported languages」表 | L1 |
| Element Plus | Vue | **67**（含 `zh-mo` / `ar-eg` / `ug-cn` 等） | 官方 i18n 文档「Supported Language List」 | L1 |
| Ant Design Vue | Vue | **66** | 官方仓库 `components/locale/`（`LocaleReceiver.tsx` 除外） | L1 |
| PrimeLocale（PrimeVue 生态语言包） | Vue | **63** | 官方仓库根目录 `*.json` 语言文件 | L1 |
| MUI (Material UI) | React | **59**（官方称目标支持「最常见 100 种」） | 官方仓库 `packages/mui-material/src/locale/` + 官方 localization 文档 | L1 |
| Vuetify | Vue | **43** | 官方仓库 `packages/vuetify/src/locale/`（排除 `index.ts` / `adapters` / `__tests__`） | L1 |
| **caomei-ui（本库）** | Vue | **5**（`zh-CN` / `zh-TW` / `ja-JP` / `ko-KR` / `en-US`） | 本仓 `src/locale/` | — |

**分布观察**：Vue 生态头部（Element Plus 67 / Ant Design Vue 66）与 React 头部（AntD 72 / MUI 59）大致同量级；地区变体（`zh-HK` / `zh-TW` / `pt-BR` / `fr-CA` 等）是条目数拉高的主因，核心语言集合通常 **30 ~ 60**。RTL 语言（`ar` / `he` / `fa` / `ur`）在 AntD、Element Plus、Vuetify、PrimeLocale 中均有内建。

---

## 3. 分包模式与体积

| 库 | 分发形态 | 按需 / 拆分 | 日期本地化 |
| --- | --- | --- | --- |
| Ant Design | `antd/locale/<locale>`（每语言独立模块） | 按需导入 + tree-shaking | dayjs locale 单独导入 |
| Ant Design Vue | `ant-design-vue/es/locale/<locale>` | 按需导入 + tree-shaking | dayjs locale 单独导入 |
| Element Plus | `element-plus/es/locale/lang/<locale>` | 按需导入 + tree-shaking | dayjs locale 单独导入 |
| MUI | `@mui/material/locale` 逐语言具名导出（如 `zhCN`） | 具名导出 + tree-shaking；目标「最常见 100 种」 | date adapter（`@mui/x-date-pickers` + adapterLocale） |
| Vuetify | `vuetify/locale` 具名导出（如 `zhHans` / `pl`） | 具名导出；应用自组 `messages` 对象 | 自带 `useLocale` / adapter |
| PrimeVue | 应用根传入 locale 对象；社区包 PrimeLocale 单独发布 | 语言包**独立于核心包**（可单独按需获取） | 组件内建日期文案 + 应用 locale |

**本库现状（实测）**：

- `src/locale/index.ts` 将 5 语言**全部**汇入 `caomeiLocales` 对象，经**根入口** `caomei-ui` 导出（`package.json` `exports` 无 `./locale/*` 子路径，仅 `.` / `./theme.css` / `./resolver` / `./nuxt`）。
- 体量：`src/locale/` 共 **854 行 / 20,269 B ≈ 19.8 KiB 内容**（`wc -c` 合计；每语言约 138 行；`types.ts` 142 行；`index.ts` 22 行）。**`du -sh` 的 32K 为文件系统块占用、非内容字节**（7 个文件各按 4K 块舍入）。**每新增一种语言约 +138 行**，线性增长。
- 含守卫：`check:locale-keys`（以 `zh-CN` 为基准，27 命名空间 / 78 条键集合一致性，5 语言各 78）、`check:locale-ledger`（中英台账 ↔ `types.ts` 结构对账）。

**体积结论**：当前 5 语言的绝对体量很小（内容约 19.8 KiB），**尚无拆分必要**；但**结构上**（单对象 + 根入口）确实令未用语言无法被 tree-shake。若语言数量长期上升（如扩到 §2 头部库同量级），单包全量导出会线性变大——这是「按语言拆子路径 / 按需导入」方案的主要动机。

---

## 4. 取证入口（可复现）与来源分级

| 来源（L1） | 取证方式 |
| --- | --- |
| Ant Design i18n 文档 | 抓取 `https://ant.design/docs/react/i18n`，计 `Supported languages` 表行数（本记录逐行计数 **72**；**以官方文档表为准**——仓库 `components/locale` 另有文档未列出的 1 项 `ku_IQ.ts`，两者口径不同） |
| Element Plus i18n 文档 | 抓取 `https://element-plus.org/en-US/guide/i18n.html`，计 `Supported Language List` 条目（**67**） |
| Ant Design Vue 仓库 | `GET https://api.github.com/repos/vueComponent/ant-design-vue/contents/components/locale`（68 个 `.ts` / `.tsx` − `LocaleReceiver.tsx` − `index.tsx` = 语言文件 **66**） |
| MUI 仓库 / 文档 | `GET https://api.github.com/repos/mui/material-ui/contents/packages/mui-material/src/locale`（计语言模块 **59**）；官方 localization 指南 |
| Vuetify 仓库 | `GET https://api.github.com/repos/vuetifyjs/vuetify/contents/packages/vuetify/src/locale`（计 `*.ts` **43**，排除 `index.ts` / `adapters` / `__tests__`） |
| PrimeLocale 仓库 | `GET https://api.github.com/repos/primefaces/primelocale/contents`（66 个 `*.json` − `package.json` / `package-lock.json` / `tsconfig.json` = 语言文件 **63**） |

- 计数为**抓取时点快照**（2026-10-06）；上游会持续增语言，引用时须重取。
- 本库现状取证：`ls src/locale`、`wc -l src/locale/*.ts`、`node -e "require('./package.json').exports"`。

---

## 5. 对本库语言矩阵长期边界的启示（只调研）

1. **覆盖边界不追头部量级**：头部库的 43 ~ 72 含大量地区变体与低使用语言；本库应按**下游真实需求**扩语言（当前候选见 Backlog §1.4：`ru` / `fr` / `de` / `es` / `pt`），而非对标数量。
2. **每语言成本已量化**：约 138 行 / 语言 + 键集合守卫开销（`check:locale-keys` 基线同步），扩展是**机械、低风险**的。
3. **工程方案两条路线**（择一，待将来按规模触发）：
   - **A. 按语言子路径导出**（对齐 AntD / Element Plus）：`caomei-ui/locale/zh-cn` 等，消费方按需导入 + tree-shaking；代价是新增 `exports` 子路径与构建入口。
   - **B. 保留单包 + 按需动态导入**：维持根入口，提供 `import('caomei-ui/locale/<x>')` 或文档引导动态加载；改动更小。
4. **RTL 是独立维度**：内建 RTL 语言需 `dir="rtl"` 与逻辑属性贯通，风险高于「加一门 LTR 语言」，应单独立项评估（Backlog §1.4 已列）。
5. **日期库耦合已规避**：本库不依赖 dayjs，故无「组件语言 / 日期库语言双同步」陷阱；文档需继续声明日期格式经 `Intl` / `locale` prop 驱动。

---

## 6. 边界

- **只调研、不承诺实现**：不改 `src/**`、不新增 `exports` 子路径、不改密钥 / 构建；结论供将来阶段评估。
- 未实测各库**产物体积**（归档体积 / gzip 分语言增量），只取「分发形态」与「本库源码行数」；分语言 gzip 增量的精确测量留待方案实施前专项。
- 语言条目计数为抓取时点快照，上游变动需重取（§4）。

## 7. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 2 warning / 3 suggest。审计方独立复算 **6/6 库计数与记录一致**（AntD 72 / Element Plus 67 / Ant Design Vue 66 / PrimeLocale 63 / MUI 59 / Vuetify 43），核验 `git diff -- src/` 为空、`exports` 无 `./locale/*`、`caomeiLocales` 单对象根导出、无 dayjs 依赖；门禁 `check:planning-numbers`（0）/ `check:governance-records`（123/313）/ `check:locale-keys` / `check:locale-ledger` / `docs:check:integrity` / `docs:check:links`（316）/ `lint:md:check` exit 0。
- **同批收口**：warning ① §7 占位（M4-2 / Step 1.7 再次实际受检）→ 本 §7 回填；warning ② 「32 KB」为 `du` 块占用、高估约 60% → 改为 `wc -c` 20,269 B ≈ **19.8 KiB**（record §1/§3 + 索引摘要同批）；suggest ① Ant Design Vue 计数补 `index.tsx` 排除项；suggest ② PrimeLocale 计数补 3 个非语言 json 排除项；suggest ③ AntD 注明「以文档表为准」。
- 留痕：`artifacts/review-gate/2026-10-06-phase19-m7-1-i18n-research.md`（本地态）。
