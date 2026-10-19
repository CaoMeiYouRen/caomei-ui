# Phase 25 M3-1b：一期 5 语落地

- 关联条目：Phase 25 **M3-1b**（一期 5 语落地：`es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`）
- 性质：实现交付记录（文案 + 子路径登记 + 两处全函数映射 + 守卫下界与测试 + 文档同步）
- 依据：[locale 分包方案设计](./2026-10-16-phase25-m3-1-package-split-design.md) §3.1 / §3.2 / §5 步骤 7；[Phase 25 登记批次记录](./2026-10-16-phase25-registration.md) §1 / §2
- 范围：`src/locale/*`、`src/components/chart/chart-locale.ts`、`src/components/rich-text-editor/editor-language.ts`、构建入口与 `exports`、locale 守卫与测试、中英文档

## 1. 交付内容

### 1.1 文案与集合

- 新增 5 套完整文案：`src/locale/{es-es,fr-fr,de-de,ru-ru,pt-br}.ts`，每套 **28 命名空间 / 80 条文案**，键集合与占位符以 `zh-CN` 为基准。
- `CaomeiLocale` 扩展为 **10 语显式字面量联合**（原 5 + 一期 5）；仍不由注册表派生。
- `PRE_REGISTERED_LOCALES` 维持 `['zh-CN', 'en-US']`；`caomeiLocales` 初值仍只含预注册两语，新语言不静态进入包根。
- 译文由 AI 基于 `zh-CN` 生成，**待用户复核**；键位、占位符与结构由 `check:locale-keys` 机检，译文质量不在机检范围。

### 1.2 分发与映射

- `tsdown.config.ts` 与 `package.json` 的 `exports` 各新增 5 条语言子路径，按需语言合计 **8 条**：`zh-tw` / `ja-jp` / `ko-kr` / `es-es` / `fr-fr` / `de-de` / `ru-ru` / `pt-br`。
- 图表 ECharts 映射补齐 5 语：`es-ES → ES`、`fr-FR → FR`、`de-DE → DE`、`ru-RU → RU`、`pt-BR → PT-br`；`EXTRA_LOCALE_LOADERS` 同步登记 5 个官方语言包。
- 富文本 `@vavt/cm-extension` 映射补齐 5 语：`es-ES` / `fr-FR` / `de-DE` / `pt-BR` 同名，`ru-RU → ru`（扩展包键名转换）；`hasExtensionLocale` 覆盖全部 8 门按需语言。
- 新增 `src/shims-echarts-i18n.d.ts` 的 5 个模块声明，保持可选 peer 未安装时的类型可解析性。

### 1.3 守卫与测试

- `check-locale-keys`：受检面下界由 **5 语 / 3 子路径** 提升为 **10 语 / 8 子路径**；显式联合解析支持**单行与多行**两种形态。
- 测试夹具同步到 10 语 / 8 子路径；非联合文件与悬空子路径的负向对照改用真正未登记的语言（`it-it`），避免扩语后负向用例失效。
- 新增 / 更新用例：新语言注册与文案解析、图表 5 语映射与语言包注册、RTE 5 语映射与扩展包加载、`ru-RU → ru` 转换、富文本 5 语注册循环。

### 1.4 文档

- `docs/components/locale.md` + 英文镜像：`CaomeiLocale` 10 语、按需引入表与会话加载示例补 5 语、momei 口径改为「5 语是 10 语子集」。
- `docs/design/architecture.md`：子路径清单与语义更新为 8 条按需语言。
- `docs/standards/development.md`、`README.md`：目录说明改为 10 语。
- `docs/components/rich-text-editor.md` + 英文镜像：语言映射、扩展包依赖范围与「10 语全覆盖」更新。
- `docs/components/chart.md` + 英文镜像：ECharts 语言映射补 5 语（含 `pt-BR → PT-br`）与 7 门动态语言包说明。
- `docs/guide/version-policy.md`、`docs/guide/release.md`：按需语言清单与下游修复指引补 5 语。

## 2. 质量门

- `pnpm lint:check`：exit 0。
- `pnpm typecheck`：exit 0。
- `pnpm test`：134 文件 / 2602 例全通过。
- `pnpm verify` 首次并行跑命中 **2 例与本批无关的既有 flaky**（`color-picker` / `dropdown-menu`）；隔离复跑 2 文件 / 60 例通过、全量 `--maxWorkers=2` 134 文件 / 2602 例通过，判定为非本批引入（并行负载 flaky 类）。
- `pnpm build` + `pnpm check:build`：通过（24 个 exports 产物齐全，语言子路径与导出目标同源，注册表未静态引入按需语言）。
- `node scripts/governance/check-locale-keys.mjs`：通过（基准 28 命名空间 / 80 条；内建 10 语；8 条子路径）。
- `pnpm check:locale-ledger`：通过（台账表与 `types.ts` 结构一致）。
- `pnpm lint:md:check` / `pnpm docs:check`：通过（12 段）。
- `pnpm lint:css:check` / `pnpm typecheck:docs` / `pnpm check:resolver` / `pnpm check:nuxt` / `pnpm docs:build` / `pnpm docs:check:i18n-routing`：exit 0（补齐 `verify` 链的其余步骤）。

## 3. Review Gate

**R1（`standard`，代码交付面 18 文件）**：**Pass**（0 blocker / 1 warning / 3 suggest）。审计方独立复算 10 语 / 8 子路径、两处映射键名与扩展包文件、负向对照未被放宽；warning = 多行联合正则可能把紧邻注释中的语言字面量计为伪成员。

**R1 收口**：warning 已闭合——`parseLocaleRegistry` 先用 `stripComments` 处理，联合正则支持单行 / 多行 / 文件末尾；补「联合后紧邻注释」「联合位于文件末尾」两条回归用例。suggest 中的译文润色（`einklappen` / `Prévisualiser l’image` / `Fuerza`）与导入排布已采纳；批次粒度提示按设计记录 §5 步骤 7 的同批口径保留，不拆条。

**R2（delta `quick`）**：**Pass**（0 blocker）。审计方独立探针确认「注释伪成员」「文件末尾」「单行 / 多行 / 后接声明」四种形态均正确，且新用例对 `stripComments` 具备判别力。

**审计工件**：`artifacts/review-gate/2026-10-20-phase25-m3-1b-code.md`（本地态、git-ignored）。

## 4. 未覆盖边界

- 译文质量未做人工逐条复核；本轮只保证结构、键集合与占位符一致。
- 未在真实下游消费方（Vite / Nuxt / webpack）验证 5 语子路径的 tree-shaking 与运行时加载；体积结论沿用 M3-1a 的 provider / 非 provider 对照口径。
- 未执行发布动作；`BREAKING CHANGE` footer 与发布说明由 M4-1 发布条目承接。
- 未评估 RTL 与二期 7 语，维持既有 Backlog。

## 5. 回滚与兼容

- 新增 5 语为**增量能力**，不移除现有导出；`zh-CN` / `en-US` 零回归。
- 现有 3 门按需语言（`zh-TW` / `ja-JP` / `ko-KR`）行为不变。
- 新增语言均需 `registerLocale` 后使用；未注册时仍回落 `zh-CN` 并给非生产环境告警。
