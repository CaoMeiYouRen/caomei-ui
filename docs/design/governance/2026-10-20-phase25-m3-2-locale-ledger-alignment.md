# Phase 25 M3-2：locale 台账、守卫与子路径导出对齐

- 关联条目：Phase 25 **M3-2**（locale 命名空间台账、守卫与子路径导出对齐）
- 性质：实现交付记录（台账守卫扩面 + 负向对照与受检面下界 + 文档口径消缺）
- 依据：[Phase 25 登记批次记录](./2026-10-16-phase25-registration.md) §2；[locale 分包方案设计](./2026-10-16-phase25-m3-1-package-split-design.md) §5 步骤 4 / 7
- 范围：`scripts/governance/check-locale-ledger.mjs`、新增 `check-locale-ledger.test.mjs`、`docs/standards/development.md`、`docs/components/locale.md` 及英文镜像、`docs/plan/todo.md`

## 1. 交付内容

### 1.1 台账守卫扩面

`check-locale-ledger` 由「中英台账表 ↔ `types.ts`」两维扩为三维：

1. `docs/components/locale.md` 的「命名空间 → 文案键 → 消费组件」表 ↔ `src/locale/types.ts`；
2. 英文镜像同上；
3. 中英文档的「预注册 / 按需引入」语言表与子路径表 ↔ `src/locale/index.ts` 的 `CaomeiLocale` 联合 + `PRE_REGISTERED_LOCALES`。

新增对账：

- 文档预注册集合必须与 `PRE_REGISTERED_LOCALES` 完全一致（双向）；
- 文档按需集合必须与「联合 − 预注册」完全一致（双向）；
- 子路径表的每个语言标识必须映射到 `caomei-ui/locale/<小写语言标识>`，且不得多列 / 漏列；
- 受检面下界：`MIN_NAMESPACES = 28`、`MIN_PRE_REGISTERED_LOCALES = 2`、`MIN_ON_DEMAND_LOCALES = 8`、`MIN_SUBPATH_ROWS = 8`。

### 1.2 可测试性与负向对照

- `checkLocaleLedger(root, options)` 现在真正使用 `root` 解析夹具路径（原实现忽略 `root`）；下界可通过 `options` 覆盖，便于小夹具正反例。
- 导出 `parseLocaleLedger` / `parseLocaleTypes` / `parseLocaleLanguageTables`，供测试与后续守卫复用。
- 新增 `scripts/governance/check-locale-ledger.test.mjs`，**19 例**覆盖：
  - 正向：台账与语言清单一致时通过；
  - 缺命名空间 / 少列键 / 多出键 / 消费组件为空；
  - 命名空间数、预注册语言数、按需语言数、子路径行数低于下界；
  - 文档预注册集合多出 / 按需集合缺少；
  - 子路径不同源 / 子路径表缺少；
  - 缺少台账表 / 台账表为空 / 空表不吞入下一张表；
  - 缺少按需语言表 / 语言表缺少预注册行；
  - 四个受检面下界常量的钉定。
- `check-locale-keys` 既有的缺键 / 占位符 / 子路径登记负向对照与下界保持不变，两个守卫分别覆盖「文案文件」与「文档台账」两面。

### 1.3 文档口径消缺

- `docs/standards/development.md` 的「新增 locale 文案键有 3 处载体」由「5 个语种文件 / 台账无任何机检 / 守卫见 Backlog」更正为「10 个语种文件 / `check-locale-ledger` 对账 / 守卫会拦截漏列多列」。
- `docs/design/governance/experience-archive.md` 的活载体条目补「该判据已于 2026-10-20 失效」标注，保留点时语义、不回改历史结论。
- `docs/components/locale.md` 与英文镜像在命名空间表、按需语言表前标注 `check-locale-ledger` 对账契约，使「预注册集合与子路径清单在册」可追溯到机检。

## 2. 质量门

- `pnpm check:locale-ledger`：通过（28 命名空间；预注册 `zh-CN` / `en-US`；按需 8 语 / 8 条子路径）。
- `pnpm check:locale-keys`：通过（28 命名空间 / 80 条；10 语；8 条子路径）。
- `pnpm vitest run scripts/governance/check-locale-ledger.test.mjs scripts/governance/check-locale-keys.test.mjs`：2 文件 / 65 例通过。
- `pnpm test`：135 文件 / 2621 例通过。
- `pnpm lint:check` / `pnpm lint:md:check` / `pnpm typecheck`：exit 0。
- `pnpm docs:check` / `pnpm governance:check`：exit 0。
- `pnpm build` + `pnpm check:build`：通过。
- Review Gate 结论见 §3。

## 3. Review Gate

**R1（`standard`）**：**Reject**（1 blocker / 3 warning / 3 suggest）。

- blocker：`experience-archive.md` 活载体仍写「locale 台账无任何机检」；已补「该判据已于 2026-10-20 失效」标注，并在本记录 §1.3 / 索引摘要登记。
- warning：① 测试未覆盖「少列键」、预注册 / 按需下界、台账表缺失 / 空表与下界常量钉定；已补至 **19 例**。② `parseTable` 对空表不终止、可能吞入下一张表；已改为遇空行 / 非表格行无条件终止，并补空表 / 不吞表用例。③ `todo.md` / 索引先于 Gate 标记完成；已在 §2 补齐全量门禁读数，待 R2 回填后保持状态一致。
- suggest：① 中文「下表」改为「下列两张表」；已采纳。② 回滚描述改为「撤销脚本改动 / 删除新增测试 / 撤销文档标注」；已采纳。③ 预注册集合的「精确 2 语」与下界口径；已在 §4 明确「以 `PRE_REGISTERED_LOCALES` 为单一事实源、不硬编码 2 语」。

**R2（delta `quick`）**：**Reject**（1 blocker / 1 warning / 1 suggest）。

- blocker：`todo.md` / 索引仍写「12 例」，实际为 19 例；已统一为 19 例，并在 `todo.md` 补 `experience-archive.md` 旧口径消缺。
- warning：完成状态先于 R2 结论；已把 `todo.md` 临时改为「审查中（R3 delta 复审）」，R3 回填后转「已完成」。
- suggest：英文侧下界分支未单独覆盖；保留为边界（与中文侧同构，英文台账 / 集合不一致已有用例覆盖）。

**R3（delta `quick`）**：**Pass**（0 blocker / 0 warning / 1 suggest）。

- R2 blocker / warning 已闭合：19 例在 `todo.md` / 索引 / 记录 / 测试文件四处一致；`todo.md` 状态在 R3 前保持「审查中」，不再先于 Gate 宣称完成。
- R2 suggest（英文侧下界分支未单独覆盖）保留为 §4 边界；不构成正确性缺陷。

## 4. 未覆盖边界

- 本守卫只校验文档台账与语言清单的**结构 / 集合 / 映射**，不校验译文质量；译文母语审校仍待用户复核。
- 预注册集合以 `PRE_REGISTERED_LOCALES` 为单一事实源；本守卫要求文档与代码**完全一致**，但不硬编码「恰好 2 语」，以免与未来经裁定的预注册面变更耦合。
- 英文侧 `minPreRegistered` / `minOnDemand` 分支与中文侧同构，未单独设例；英文台账 / 集合不一致已有用例覆盖。
- 不校验真实下游打包环境下的子路径解析；该面由 `check:build` 与发布冒烟覆盖。
- 不新增运行时依赖、不改组件 API、不改文案结构。

## 5. 回滚与兼容

- 新增守卫为增量能力，不改变 `src/**` 运行时行为；回滚需撤销 `check-locale-ledger.mjs` 的本批改动、删除新增测试文件，并撤销文档标注（该脚本已在 `governance:check` 中，不能整体删除）。
- `check-locale-ledger` 的 CLI 输出由「台账表与 types.ts 结构一致」扩为「命名空间 + 预注册 + 按需 / 子路径」读数，退出码语义不变。
