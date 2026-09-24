# Session 经验归档

> 用途：承接 `.session/wisdom.md` 中**已蒸馏条目**（知识点已迁移到 `docs/` 后的摘要与链接），使跨 session 发现可跨机器、跨分支留存。
>
> 活跃条目仍在 `.session/wisdom.md`；蒸馏机制见 [Session Wisdom 蒸馏机制](../../standards/session-wisdom-distillation.md)。条目格式：`- [YYYY-MM-DD] [type] 摘要 → docs/path`。

## 2026-09-24 阶段归档蒸馏（Phase 13）

> 本批活跃 **24 条全部处置**：分态 `migrate 24 / compress 0 / remove 0 / keep 0`。归档摘要 **24 行**（可复算：`awk '/^## 2026-09-24 阶段归档蒸馏（Phase 13）/{f=1;next} /^## /{if(f)exit} f' docs/design/governance/experience-archive.md | grep -c '^- \[2026'`）。迁移落点：`ai-collaboration §8`、`planning §7`、`testing §7/§8/§10`、`development §5`、`documentation-site §11/§13`、`design-spec §7`、`guide/release.md §3`、`session-wisdom-distillation §1`；其中 **2 条**（`current-task.yaml` 维护口径 / 计数多处载体漂移）的落点已在此前批次存在——本次仅补摘要与链接（对应摘要行末标「落点已存在」）；其余 **22 条**为本批新增或扩写落点。`wisdom.md` 活跃段清空并保留指针。

### 会话与规划载体（→ [Session Wisdom 蒸馏机制 §1](../../standards/session-wisdom-distillation.md)）

- [2026-09-23] [gotcha] `.session/current-task.yaml` 是「YAML 形态的纯文本任务态」（非严格 YAML），按文本读取 + `rg -n "^[a-z_]+:"` 核对顶层键唯一 + 缩进与所属键一致 → docs/standards/session-wisdom-distillation.md §1（落点已存在）
- [2026-09-23] [gotcha] 向按 `##` 分区的台账（`wisdom.md` / `experience-archive.md`）用 `cat >>` 追加会落进最后一个分区、计数脚本静默不命中；追加前先 `grep -n '^## '` 确认边界 → docs/standards/session-wisdom-distillation.md §1

### 取数与门禁（→ [AI 协作规范 §8](../../standards/ai-collaboration.md)）

- [2026-09-23] [gotcha] 归档清空 `todo.md` 会让「链接文字含条目编号 → `docs/plan/todo.md`」的历史规划指针集体失效；清理后立即跑 `check-governance-records` 并改指 `todo-archive.md` → docs/standards/planning.md §7 + docs/standards/ai-collaboration.md §8
- [2026-09-23] [gotcha] 治理记录「最终 revision」计数须区分 staged 与工作区：口径取「提交前最后一次全量暂存后的工作区」，并写明命令 + 范围 + 快照日期 → docs/standards/ai-collaboration.md §8
- [2026-09-23] [pattern] 同一批次的规模 / 计数写进多处载体必然漂移：计数只在治理记录一处定义并附可复算命令（钉持久 ref），索引与 `todo.md` 只留指针 → docs/standards/ai-collaboration.md §8（落点已存在）
- [2026-09-24] [gotcha] 调用方审计 prompt 不得预写「未发生的落点状态」：F 阶段产物一律写「待 F 阶段建立」，不用完成时 → docs/standards/ai-collaboration.md §8
- [2026-09-24] [gotcha] 同一批次内的修复点会改变 diff 行数，治理记录的规模口径必须在修复点全部落地后重算 → docs/standards/ai-collaboration.md §8
- [2026-09-24] [gotcha] 治理记录计数的两类自引用陷阱：① `git ls-files` 枚举受检面的守卫在记录 `git add` 后计入记录自身（交付态恒 +1）；② 「唯一口径」的复算命令缺 pathspec → docs/standards/ai-collaboration.md §8

### 测试与浏览器验证（→ [测试规范 §7](../../standards/testing.md)）

- [2026-09-23] [gotcha] 表格列「不渲染单元格」破坏 `table-layout: auto` 的列对齐（body 少一个 `td` → 数据整体左移），happy-dom 无布局引擎发现不了；列隐藏 / 占位类改动须取真实浏览器**逐列 x 区间** → docs/standards/testing.md §7
- [2026-09-23] [gotcha] 画廊 / 组件总览是「策展子集」，断言以登记表**实际相邻成员序列**为参照，不能用「A 与 B 之间」或完整组件集 → docs/standards/testing.md §7
- [2026-09-23] [gotcha] 容器内 `vitepress preview` 可能对所有页面 crash（环境限制非改动缺陷）；替代为 SSG 产物静态断言并与 dev 真机互补，结论须声明边界 → docs/standards/testing.md §7

### 组件测试写法（→ [测试规范 §8](../../standards/testing.md)）

- [2026-09-23] [gotcha] VTU `trigger` 的修饰键与 `key` 结论相反：`trigger('click', { metaKey: true })` / `trigger('click.meta')` 能设修饰键；`trigger('keydown.backspace')` 置**小写** key → 用 `trigger('keydown', { key: 'Backspace' })` → docs/standards/testing.md §8
- [2026-09-23] [gotcha] Reka `useCollection` 的 `collectionRef` 在异步 watch（pre-flush）中赋值，未就绪时 `getItems()` 返回 `[]`；依赖它的键盘交互须 `mount` 后 `await nextTick()` 再派发 → docs/standards/testing.md §8
- [2026-09-23] [pattern] 受控组件测试须区分「受控」与「自持」两种累积路径：受控模式下父级不回写时多次点击**不累积** → docs/standards/testing.md §8

### 守卫型测试（→ [测试规范 §10](../../standards/testing.md)）

- [2026-09-23] [pattern] 单个 `describe` 回调超 600 行会撞 `max-lines-per-function`：提为同文件顶层 describe 或落独立文件；`eslint --fix` 不会搬文件，拆分后同步 import → docs/standards/testing.md §10
- [2026-09-24] [pattern] 门禁脚本的「抗静默收窄」（文件数下界 + 关键前缀覆盖 + 空扫描拒绝）与「允许名单反向校验」（存在 + 仍含被放行形态 + 同类登记表集合相等断言） → docs/standards/testing.md §10

### 组件实现（→ [开发规范 §5](../../standards/development.md)）

- [2026-09-23] [gotcha] 新增 locale 文案键有 3 处载体，其中 `docs/components/locale.md` 中英台账**无任何机检**；加键前先 `rg` 台账行并同批更新 → docs/standards/development.md §5
- [2026-09-23] [pattern] Vue 3.5 `defineModel` 是「本地值 + prop 同步」而非「受控必须回写」；断言「受控不回写 → 渲染冻结」必然失败 → docs/standards/development.md §5
- [2026-09-23] [gotcha] Reka primitive 会在 `role=generic` 上输出命名属性（ARIA 1.2 禁止）；包装层改显式 `role="group"`（允许命名且无必需父级）即可免登记例外 → docs/standards/development.md §5
- [2026-09-23] [pattern] `aria-controls` 只在目标元素实际渲染时输出，否则形成悬空 idref（`aria-expanded` 则恒定输出） → docs/standards/development.md §5

### 迁移映射（→ [设计规范 §7](../design-spec.md)）

- [2026-09-23] [pattern] 迁移对齐「命名」不等于复制「行为」：取**一方源码**核对契约（而非只读文档），并把每处偏离登记为「有意差异」 → docs/design/design-spec.md §7

### 文档站（→ [文档与演示站设计 §11 / §13](../documentation-site.md)）

- [2026-09-23] [gotcha] 新增组件的登记面不止「§11 侧栏 / 总览页 / 画廊登记表」三项，还有组件清单 §5（无机检）；收口时须人工回扫 → docs/design/documentation-site.md §11
- [2026-09-24] [gotcha] VitePress 围栏代码块由 `v-pre` 豁免字面双花括号、**行内代码不豁免**（仅 `-vue` 后缀语言保留插值）——守卫受检面取「围栏外」的依据 → docs/design/documentation-site.md §13

### 发布流程（→ [发布指南 §3](../../guide/release.md)）

- [2026-09-24] [gotcha] `npm version <v>` 不是本仓的发布姿势：它直接提交（裸版本号，非 Conventional 形态）并打 annotated tag，tag 早于 `pnpm changelog` 提交 → tag 视图不含 CHANGELOG 段 → docs/guide/release.md §3

## 2026-09-23 阶段归档蒸馏（Phase 12）

> 本批活跃 **20 条全部处置**：分态 `migrate 20 / compress 0 / remove 0 / keep 0`。归档摘要 **20 行**（可复算：`awk '/^## 2026-09-23 阶段归档蒸馏/,/^## 2026-09-19 阶段归档蒸馏/' docs/design/governance/experience-archive.md | grep -c '^- \[2026'`）。迁移落点：`planning §3.8/§4/§9`、`ai-collaboration §8`、`testing §7/§10`、`development §7/§12`、`session-wisdom-distillation §1`；其中 **5 条**（编号规则 / 不得预写 Gate 结论 / 死声明机制 / 注释内 glob / 守卫生效性证据）的落点此前已存在——最后一条此前仅为 `ai-collaboration §3.5` 的通用要求，本批另向 `testing §10` 补专门化条款；其余 **15 条**为本批新增落点。`wisdom.md` 活跃段清空并保留指针。

### 规则与规范书写（→ [规划规范 §4 / §9](../../standards/planning.md)）

- [2026-09-21] [pattern] 候选盘点类文档最易漏「静默范围豁免」：盘点 N 条候选必须逐条给出落点（含「不纳入」的排除项），否则按 planning §9 判 warning。可判定写法：盘点节末尾加「候选覆盖声明」（逐小节计数 + 明示「逐条均有落点，无静默豁免」）。 → docs/standards/planning.md §9
- [2026-09-21] [failure] 条目重编号会连带打断所有「迁出标注」指针：中间插入新条目后 `backlog.md` 的 `→ M3-x` 仍按旧号书写 → Review Gate 判 blocker（映射错指会让后续 session 把工具 / 基线入库算进采样条目）。重编号后必须回查所有 `→ Mxx` 标注并逐条比对 todo 权威条目。 → docs/standards/planning.md §4
- [2026-09-21] [failure] 执行期拆分条目后必须回扫「原编号的全部引用」：拆分后漏改 4 处（todo「未纳入」表、M3 状态行区间、治理索引摘要、roadmap 阶段行括注）→ 同文件两套口径判 blocker。回扫命令 `rg -n "<原编号>" docs/`，并核对「状态词」在两载体是否互斥。 → docs/standards/planning.md §4
- [2026-09-21] [failure] 不得预写尚未发生的 Gate 结论：记录里写「已交付」而 todo 状态行仍写「待执行」→ 判 blocker。记录里描述变更应写「本次变更实现；交付以 Review Gate 放行与提交为准」。 → docs/standards/planning.md §9
- [2026-09-21] [failure] 证据记录里的「覆盖构成」等式必须按 JSON 键集合枚举写，不能按意图分组写：`m31` 段 26 项被写成「8 组件 × 3 档位」，实际是「6 组件 + 2 子部件 + badge dot ×2」，数字巧合掩盖了真实覆盖构成 → 判 blocker。写覆盖声明时逐组列出键数并对账总数。 → docs/standards/planning.md §9
- [2026-09-21] [pattern] 历史治理记录的「已登记 X」断言必须回查载体：记录称某漏检路径已登记 Backlog，实际 `docs/plan/` 下无对应载体。复核类盘点应把「断言 ↔ 载体」不一致记为待复核项，而不是照抄。 → docs/standards/planning.md §9

### 取数与门禁（→ [AI 协作规范 §8](../../standards/ai-collaboration.md)）

- [2026-09-21] [failure] `rg 'a\|b'` 里的 `\|` 是字面量管道，不是「或」：据此宣称「0 命中」不构成证明（判 warning）。多模式检索用 `rg -e a -e b`，或分别写明每条单模式命令的独立结果。 → docs/standards/ai-collaboration.md §8
- [2026-09-21] [gotcha] `docs:check:integrity` 以 `git ls-files` 枚举受检面，提交前的未跟踪新 md 不在其扫描面（计数 = 已跟踪数）。新页的兜底证据是 `lint-md` 的 glob、`docs:check:links` 与 `docs:build` 的死链校验；申报门禁前须先 `git add` 或显式声明该边界。 → docs/standards/ai-collaboration.md §8
- [2026-09-21] [pattern] 守卫类改动的生效性证据：注入一条反例 → 守卫 exit 1；还原后 `git diff --stat` 零输出并重新 exit 0。选择器 / 括号分析类守卫须先剥离属性选择器引号内容，否则 `[data-x="where("]` 会干扰括号判定。 → docs/standards/testing.md §10
- [2026-09-21] [failure] 规划编号不得写入代码注释与测试名（planning §4）：新增守卫时在测试名与 docstring 写「M3-1」→ 判 blocker。测试名用语义描述，注释只保留文档路径作导航指针（文件名里的编号为小写、不触发规则）。 → docs/standards/planning.md §4
- [2026-09-21] [pattern] 计算样式等价 A/B 的夹具复用：夹具 `vite.config.ts` 支持 `CAOMEI_SRC` 指向 `HEAD` worktree，可在同一夹具下采集改动前 / 改动后；worktree 缺 `node_modules` 时页面空白、`waitForSelector` 超时（软链 `<repo>/node_modules` 即可）。「0 差异」必须配负向对照。 → docs/standards/testing.md §7

### 测试与浏览器验证（→ [测试规范 §7](../../standards/testing.md)）

- [2026-09-21] [gotcha] 计算样式采集里插入交互会「偷走」瞬时元素的采样窗口：面板开合采样插在采集前段 → toast 在默认时长内消失、6 项静默缺失，两次采集同缺 → diff 仍报 0 差异（假通过）。瞬时元素须排在交互型采样之前，采集结束检查 `errors` 为空。 → docs/standards/testing.md §7
- [2026-09-21] [pattern] DOM 快照对比须先剔除无语义易变属性：`data-v-*` 跨构建必然变化，不过滤会把差异误报为回归；diff 工具须按属性名逐项比较，值序列化为**单属性对象**（字符串会被按字符索引展开成上百条假差异）。 → docs/standards/testing.md §7
- [2026-09-21] [gotcha] 探针读取参与 transition 的属性（`box-shadow` / `background-color`）必须等过渡结束：聚焦后立即读会取到插值中间态，基线 / 后测「双错同形」得到 0 差异的假证据。做法：`sleep(250)` 或注入 `transition: none !important` 再读，并配负向对照证明探针灵敏。 → docs/standards/testing.md §7
- [2026-09-22] [gotcha] DOM 属性快照的「易变属性」不止 `data-v-*`：Reka / 上游 `useId` 的实例计数器会随夹具中组件数量与挂载顺序漂移，使 `aria-controls` / `id` 被报成差异。过滤口径：归一计数、保留名称（`-v-\d+` → `-v-*`），使「指向哪一类面板」仍可断言。 → docs/standards/testing.md §7
- [2026-09-22] [failure] 聚焦态采样必须把 `focus()` 打在真实可聚焦元素上：落在包装层不会触发 `:focus-within`，采样静默拿到「未聚焦」值；基线与后测同法写错会出现双错同形的假通过。状态类采样须逐条核对「触发元素」而非只核对「读取元素」。 → docs/standards/testing.md §7

### 实现与样式（→ [开发规范 §7 / §12](../../standards/development.md)）

- [2026-09-21] [fact] 「先写安全值、后写 `color-mix()`」不是渐进增强回退，而是死声明：后写声明含 `var()` 时不在解析期被丢弃，级联选中后在计算值期非法 → 置 `unset`（IACVT），先写值在任何引擎都不生效。判断双声明是否真回退，关键看后写值是否含 `var()`。 → docs/standards/development.md §7
- [2026-09-23] [gotcha] 块注释里写 glob 通配 `*/*` 会提前闭合注释：在 Node 脚本 JSDoc 中描述示例 glob 时，`*/*` 内含的 `*/` 终止块注释 → `node --check` 报 `Unexpected token '*'`、vitest 报 import-analysis 解析失败（报错行指向注释之后的代码，易误判为模板字符串问题）。描述 glob 时改写为「两级目录通配」或拆开星号。 → docs/standards/development.md §12

### 会话与规划载体（→ [Session Wisdom 蒸馏机制 §1](../../standards/session-wisdom-distillation.md)）

- [2026-09-21] [gotcha] `.session/current-task.yaml` 曾出现两个顶层 `progress:` 键（YAML 后者覆盖前者，先写的阶段摘要被静默丢弃）；改动后按 `rg -n "^[a-z_]+:" .session/current-task.yaml` 核对顶层键无重复。 → docs/standards/session-wisdom-distillation.md §1
- [2026-09-21] [gotcha] 规划回扫（planning §3.8）的「全部受影响载体」包含 gitignored 的 `.session/`：`runtime-state.json` / `current-task.yaml` 会在下一个 session 开局被读取，仍以现在时写「无进行中阶段 / 未登记」会造成错误恢复起点（不进提交物，按 warning 处理）。 → docs/standards/planning.md §3.8

## 2026-09-19 阶段归档蒸馏（Phase 7 第二阶段 M5 / M6）

> 本批活跃 **83 条全部处置**：分态 `migrate 83 / compress 0 / remove 0 / keep 0`（其中 82 条于 M5 / M6 蒸馏，1 条于阶段收口补蒸馏；部分条目的落点在此前批次已存在于既有文档）。归档摘要 **83 行**（可复算：`awk '/^## 2026-09-19 阶段归档蒸馏/,/^## 2026-09-17 阶段归档蒸馏/' docs/design/governance/experience-archive.md | grep -c '^- \[2026'`）。迁移落点：`documentation-site §5/§13/§15`、`development §5/§7/§10/§12`、`testing §7/§8/§10`、`ai-collaboration §8`、`planning §3.7/§4/§9`、`design-spec §7`、`git §3`、`documentation §4`、`guide/development.md`；`wisdom.md` 活跃段清空并保留指针。

### 迁移文档撰写（→ [文档与演示站设计 §15](../documentation-site.md)）

- [2026-09-18] [pattern] 同一批次内「事实源登记」与「页面撰写」必须互校（未实现清单类字段尤甚） → docs/design/documentation-site.md
- [2026-09-18] [pattern] 「未实现清单」按三态判定（已实现 / 真未实现 / 已登记在途） → docs/design/documentation-site.md
- [2026-09-18] [bug] 「与既有条目保持一致」不等于正确：旧条目可能本身是错的，须独立回源并同批修正引用点 → docs/design/documentation-site.md
- [2026-09-18] [pattern] 通用行（跨组件表）的例外清单必须随组件级映射同步回扫 → docs/design/documentation-site.md
- [2026-09-18] [pattern] 页面「多写」也是漂移的一种，须回补 §7 或声明细化口径 → docs/design/documentation-site.md
- [2026-09-18] [bug] 迁移映射的 slot / props / emits 名必须回一方源码 `Slots` / `Props` / `Emits` 接口逐个核对 → docs/design/documentation-site.md
- [2026-09-18] [pattern] 迁移文档事实源是三方（PrimeVue 源码 / 本库 API / §7），必须同时核对 → docs/design/documentation-site.md
- [2026-09-18] [pattern] 同一映射双写时必须显式声明优先级（不一致以 §7 为准） → docs/design/documentation-site.md
- [2026-09-18] [pattern] 索引 / 入口类文档声明「不宣称穷尽」并尽量以集合差机检 → docs/design/documentation-site.md
- [2026-09-18] [pattern] 「A 会导致 B」类因果断言取一方源码的条件分支，写成机制而非结论 → docs/design/documentation-site.md
- [2026-09-18] [pattern] 「对齐 PrimeVue / 与 X 一致」类语义声明必须先取一方源码（并把「我实现了什么」与「上游怎么做」分两句） → docs/design/documentation-site.md
- [2026-09-19] [bug] 「语义反转 / 默认相反」须并列两侧默认值支撑：默认一致只能写「形态变化」（布尔 flag → 枚举） → docs/design/documentation-site.md
- [2026-09-19] [bug] 迁移映射表的「映射目标」与「本库新增」互斥，写完核对交集为空 → docs/design/documentation-site.md
- [2026-09-19] [pattern] 收口类改动要回扫同段「存活句」的旧口径，让索引 / 脚注 / 治理记录三处一致 → docs/design/documentation-site.md
- [2026-09-19] [process] 「不补节」的排除判据让位索引闭环；决策反转须在治理记录说明理由 → docs/design/documentation-site.md
- [2026-09-18] [pattern] 模板顺序约定要与有序列表自洽（迁移节与 FAQ 的相对位置一次写清） → docs/design/documentation-site.md
- [2026-09-18] [pattern] 中英镜像的双写修复必须逐文件核对，不能只声明「中英同步」 → docs/design/documentation-site.md

### 组件实现与样式（→ [开发规范 §5 / §7](../../standards/development.md)）

- [2026-09-19] [bug] Reka `DialogContent` 不自动输出 `aria-modal`，封装模态须显式声明 → docs/standards/development.md
- [2026-09-19] [bug] 自定义触发器封装 Reka Dialog 时须包进 `<DialogTrigger>`，否则未聚焦打开（Safari / 触摸）关闭后不回焦 → docs/standards/development.md
- [2026-09-17] [bug] `v-bind="attrs"` 后并列 `:prop="可能 undefined"` 会经 `mergeProps` 删除透传值；「有意见才输出」一律条件展开 → docs/standards/development.md
- [2026-09-18] [bug] 深层响应式数据里放 Vue 组件对象会触发代理告警；整体替换的归档对象用 `shallowRef` → docs/standards/development.md
- [2026-09-18] [pattern] 包装型触发器 `as-child` 复用自定义按钮时外观类会合并，须提供 `unstyled` 样式豁免而非静默跳过 → docs/standards/development.md
- [2026-09-18] [pattern] 受控 / 非受控：props 变化 → 同步内部；其他依赖变化 → 只钳位内部现值 → docs/standards/development.md
- [2026-09-18] [pattern] 事件载荷的派生值按本次载荷自身推算，不能用当前 props → docs/standards/development.md
- [2026-09-18] [pattern] 组件间复用会把被复用组件的交互契约带进宿主（`disabled` 须显式透传并补用例） → docs/standards/development.md
- [2026-09-18] [pattern] 组件默认值变更会证伪迁移台账既有结论，须回扫全部载体 → docs/standards/development.md
- [2026-09-18] [bug] CSS 变量被 `border` 简写消费时非法值会丢弃整条声明；prop 校验必须白名单，负向取证同时断言 `border-style` → docs/standards/development.md
- [2026-09-18] [pattern] 存量 CSS 钩子提升为 prop 时缺省路径逐值不变，仅提供时内联覆盖 → docs/standards/development.md
- [2026-09-17] [pattern] `useSlots()` 是实时对象（Vue 3.5 为内部原型链对象）而非 setup 期快照，插槽存在性判断放模板渲染期 → docs/standards/development.md
- [2026-09-17] [bug] `inheritAttrs: false` 下 `mergeProps` 不跳过 `undefined`（与上条同源，已在文档单点覆盖） → docs/standards/development.md
- [2026-09-17] [bug] Vue 模板同一元素只允许一个无参 `v-bind`，多个须脚本内合并 → docs/standards/development.md
- [2026-09-17] [pattern] 有语言兜底的可访问名会吞掉透传 `aria-label`，优先级 `props.label ?? attrs['aria-label'] ?? locale` → docs/standards/development.md
- [2026-09-17] [bug] 组合容器按「成员根元素」写的 `> *` 规则会因包装层静默失配（Select 圆角 / 宽度同时失效） → docs/design/design-spec.md §7
- [2026-09-18] [bug] 文档站 `.vp-doc li + li` 会污染 demo 列表项，组件列表须显式重置 `margin` → docs/standards/development.md
- [2026-09-17] [pattern] 渲染正确性依赖 CSS 层叠 tie-break 时，happy-dom 单测只能证明规则存在，必须在真实浏览器取 computed style → docs/standards/development.md
- [2026-09-17] [pattern] 语义 token 抽取后清掉同值字面量，但不同值档位不得顺手归并 → docs/standards/development.md

### 测试与浏览器验证（→ [测试规范 §7 / §8 / §10](../../standards/testing.md)）

- [2026-09-19] [env] 一次性 V 夹具必须引入库样式入口（否则 token 未定义、颜色断言失真），新增 CSS import 后须重启 Vite dev server → docs/standards/testing.md
- [2026-09-19] [pattern] 焦点类单测需 `mount(..., { attachTo: document.body })` → docs/standards/testing.md
- [2026-09-19] [pattern] 脚本点击前要给 Reka「外部点击」监听一拍（同 `setTimeout(0)` 既有条目） → docs/standards/testing.md
- [2026-09-18] [bug] `vitepress preview` 在 `docs:build` 重建 `dist` 后必须重启，端口先按 `ss -ltnp` 清场 → docs/guide/development.md
- [2026-09-18] [pattern] 判定「既有问题 vs 本批回归」用未改动同类页对照 → docs/standards/testing.md
- [2026-09-18] [bug] root 容器 Chromium zygote 致交互崩溃，`--no-zygote` 可恢复（已在 §7） → docs/standards/testing.md
- [2026-09-18] [bug] 不要用 `document.body.innerHTML = ''` 清理 teleport 内容（交给 `enableAutoUnmount`） → docs/standards/testing.md
- [2026-09-18] [pattern] 异步落位的 DOM / 焦点断言用 `vi.waitFor` 条件轮询而非猜 tick → docs/standards/testing.md
- [2026-09-18] [pattern] 断言要挑「随实现变化而变」的量（`RovingFocusItem` 的 `tabindex="-1"` 恒真；`.every()` 空集合恒真） → docs/standards/testing.md
- [2026-09-19] [process] 清单 / 枚举类内容断言覆盖全集关键词而非抽样 → docs/standards/testing.md
- [2026-09-18] [process] V 记录数值须可复现：探针脚本同时落盘 JSON 并输出原始数值 → docs/standards/testing.md
- [2026-09-18] [process] 浏览器面板 / 视觉通道不可用时，把一次性 Playwright 脚本放 gitignored 目录取证并声明「未做像素级比对」 → docs/standards/testing.md
- [2026-09-18] [pattern] demo 断言前须核对 `.demo-row` 索引 → docs/design/documentation-site.md
- [2026-09-17] [pattern] 可访问名 / 不透明度等「有效值」可能来自祖先链或 primitive 合成，须用 role+name / AX 树取证 → docs/standards/testing.md

### 评估、审计与协作流程（→ [AI 协作规范 §8](../../standards/ai-collaboration.md) 及既有 §3 / §5）

- [2026-09-18] [bug] 批量改文件脚本禁用 Python 字典字面量（重复键静默丢值），用列表 of tuples 并断言命中数 → docs/standards/ai-collaboration.md
- [2026-09-18] [process] 片段替换长行 Markdown 必须覆盖完整行边界，改完立即 grep 校验行首 / 标题 → docs/standards/ai-collaboration.md
- [2026-09-18] [process] 批量文本替换未命中会静默通过，须带 `assert old in s`（已在 §8） → docs/standards/ai-collaboration.md
- [2026-09-18] [process] 引用源码行号会随同批改动静默失效，优先写选择器 / 规则名并同批回扫 → docs/standards/ai-collaboration.md
- [2026-09-17] [pattern] 权威数值（轮次 / 时间盒 / 阈值）只在规范单点定义，其余载体链接引用 → docs/standards/ai-collaboration.md
- [2026-09-17] [pattern] 机检规则形态由语料矩阵驱动，并补「受检范围未静默收窄」断言 → docs/standards/ai-collaboration.md
- [2026-09-17] [pattern] 「某能力未实现」跨多载体时，改口径须回扫全部载体 → docs/standards/ai-collaboration.md
- [2026-09-17] [process] 多轮审查收束靠「声明轮次 + 新增预算 + 范围冻结 + 时间盒」（已在 §3.4） → docs/standards/ai-collaboration.md
- [2026-09-17] [pattern] 规划台账改轮次编号须全仓核对同一批次，且不预写尚未发生的 Gate 结论 → docs/standards/planning.md
- [2026-09-18] [process] 代码注释与测试名不得出现规划编号（已在 planning §4） → docs/standards/planning.md
- [2026-09-18] [process] 新增治理记录必须同批登记 `governance/index.md` → docs/standards/ai-collaboration.md
- [2026-09-18] [process] 「无可映射对象」的验收判据不得由实现方自行改写（已在 planning §3.7） → docs/standards/planning.md
- [2026-09-18] [process] 「命令式 API 是否补齐」的取证按调用点形态拆解，跨组件形态须单独给落点 → docs/design/design-spec.md §7
- [2026-09-19] [process] 评估授权范围要追实际下游用量（「能力 + 事件」类措辞按调用点确定最小落地形态） → docs/standards/ai-collaboration.md
- [2026-09-19] [process] 复审 prompt 引用上一轮编号须照抄原文 → docs/standards/ai-collaboration.md
- [2026-09-18] [process] 登记规模偏差前须 grep 规范原文核对条款与阈值，统计用 `--numstat` + 未跟踪 `wc -l`（已在 §3.2.1 / §8） → docs/standards/ai-collaboration.md
- [2026-09-18] [process] 交付面拆分可只按文件集合切分提交（已在 §3.2.1） → docs/standards/ai-collaboration.md
- [2026-09-17] [pattern] 相邻 hunk 分属两条目时，拆 commit 成本高于合并（已在 git §3） → docs/standards/git.md
- [2026-09-17] [process] 同根因未扫描面先登记为独立原子条目再修复 → docs/standards/ai-collaboration.md
- [2026-09-18] [process] 可见 UI 改动的 V 面应在 D 阶段一并规划，纯事件 / 数据面显式声明跳过 → docs/standards/ai-collaboration.md
- [2026-09-18] [pattern] 产物新鲜度：申报 Gate 证据前跑完整 `pnpm verify` → docs/standards/ai-collaboration.md
- [2026-09-18] [process] 规划批次号与段标题必须自洽（补交沿用原批次号） → docs/standards/planning.md
- [2026-09-18] [pattern] 规划状态段引用「某文档 §某节」时必须逐条回查实际改动位置（章节号是治理锚点） → docs/standards/planning.md
- [2026-09-17] [bug] 治理记录指向 `docs/` 之外的 Markdown 链接会被 VitePress 判死链（已在文档站 §13） → docs/design/documentation-site.md
- [2026-09-17] [pattern] 结论句全称判断须限定作用域（已在 §8） → docs/standards/ai-collaboration.md
- [2026-09-18] [pattern] 语义变更的用例必须能区分新旧两种语义（已在 testing §10 判别力条目） → docs/standards/testing.md
- [2026-09-17] [bug] 仓库内 `.md` 的成对花括号插值会被 VitePress 当 Vue 模板求值（已在文档站 §13） → docs/design/documentation-site.md
- [2026-09-17] [bug] ESLint 9 扁平配置不读 `.gitignore`，构建产物目录须显式 `ignores` → docs/standards/development.md §12
- [2026-09-18] [bug] 治理记录漏登记索引（规则见 §8 迁移条目） → docs/standards/ai-collaboration.md
- [2026-09-17] [pattern] 同一契约重复实现会静默漂移，收敛前先做全库机械审计 → docs/standards/development.md
- [2026-09-18] [pattern] 给「内容宽度」组件加分区插槽时示例须自行撑满容器 → docs/design/documentation-site.md
- [2026-09-17] [pattern] 组件文档页「可渲染性」无门禁，须用 `<demo>` 才能被断言覆盖 → docs/design/documentation-site.md

### 治理与流程（→ [文档规范 §4](../../standards/documentation.md)）

- [2026-09-19] [process] 向 `docs/standards/` 迁入内容前必须过 `pnpm check:standards-redundant:strict`：去行内代码后正文与链接文字（含链接 label）不得含 `教训` / `经验` / `实证` / `实战` / `背景` 五类关键词；「为什么」类说明改写成「载体与目标 / 现有做法」，案例数据留在 `docs/design/governance/` 并以文件名作链接 label → docs/standards/documentation.md

## 2026-09-17 阶段归档蒸馏（Phase 10）

> 阶段归档（2026-09-17）：活跃 **25 条全部迁移**（无删除、无保留），剩余活跃 0 条。本轮蒸馏同时把可复用规则外科式写入对应规范（`planning §3.8 / §7 / §9`、`ai-collaboration §8`、`testing §7 / §10`、`documentation §4`），下列条目即其来源与落点。

### 规则与规范书写

- [2026-09-16] [pattern] 必须留在源码但不得进产物的临时标注写成文件首行的 `//` 行注释：tsdown / rolldown 会剥离普通行注释、保留 `//#region` 与 JSDoc——「标注没进产物」按注释归属决定，须实测 `grep` 产物确认 → [语言矩阵评估记录 §9.1](./2026-09-16-language-matrix-midterm-evaluation.md)（标注本身已于复核后移除）
- [2026-09-16] [pattern] 行为矩阵 / 批次清单类规范必须每行带取证位置（含「无风险」排除项），且「现状」判定与取证方式口径自洽 → [规划规范 §9](../../standards/planning.md)
- [2026-09-16] [pattern] 注释与文档里的枚举能力清单会随扩展立即过期，且公开类型面的 JSDoc 会进产物；改为单点引用式表述 → [文档规范 §4](../../standards/documentation.md)
- [2026-09-16] [pattern] 用新权威文档承接旧文档的「未实现承诺」时须全库清理所有引用点（`rg` 扫残留） → [文档规范 §4](../../standards/documentation.md)
- [2026-09-16] [pattern] 用户对待决策项的答复须同步三处载体 + 受影响的组件文档，并回扫 AI 资产的「旧心智」表述 → [规划规范 §3.8](../../standards/planning.md)
- [2026-09-17] [pattern] 用户把「分批取舍」改成「全部完成」时，旧的分档数字必须一并删除（否则同一集合出现多个互斥计数） → [规划规范 §9](../../standards/planning.md)
- [2026-09-17] [pattern] 规划载体里「范围已登记」与「已交付」必须在同一句显式区分，避免后续 session 跳过实现 → [规划规范 §9](../../standards/planning.md)
- [2026-09-17] [pattern] 「唯一差距 / 最大盲区」这类全称判断须限定作用域（跨维度并列时不加限定会自相矛盾） → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-17] [pattern] 验收标准的放宽属「范围降级」，须先取证再交用户裁定；正确姿势是回滚口径放宽 + 权威文档标注「未达标待裁定」，不得静默改写已授权条目的验收承诺 → [规划规范 §3.7](../../standards/planning.md)

### 测试与浏览器验证

- [2026-09-16] [pattern] 断言只覆盖一个轴会漏检另一轴：换行容器的固定高度 + `overflow: hidden` 会裁掉新增行，必须同时断言 `scrollHeight <= clientHeight + 1` 与成员 rect 落在容器 client rect 内 → [测试规范 §10](../../standards/testing.md) 与[响应式设计 §4](../responsive.md)
- [2026-09-17] [pattern] 常驻几何用例必须守卫自己的前置条件（先构造状态再硬断言该状态成立），夹具几何留可判定余量，无判别力的用例删除 → [测试规范 §10](../../standards/testing.md)
- [2026-09-17] [pattern] 合成探针（极窄 / 极矮视口）除前置守卫外，`setViewportSize` 之后须**重新打开**浮层（点击把触发器滚入视口，否则 popper 锚定在视口外产生假失败） → [测试规范 §10](../../standards/testing.md)
- [2026-09-17] [pattern] 布局断言里容器的「可视区」取 client rect；`boundingBox()` 是 border box → [测试规范 §7](../../standards/testing.md)
- [2026-09-17] [pattern] E2E project 的 mobile / tablet 须用对应设备描述符（`devices['Desktop Chrome']` 会带入桌面 UA / screen）；容器内以 root 运行才需 `--no-sandbox` → [测试规范 §7](../../standards/testing.md)
- [2026-09-17] [pattern] 布局类 E2E 宜统一以 `reducedMotion: 'reduce'` 运行（入场动画 `scale` 会让 `boundingBox()` 读到中间尺寸），代价是默认动效路径失去常驻覆盖，须双向登记 → [测试规范 §7](../../standards/testing.md) 与 [Backlog §1.6](../../plan/backlog.md)
- [2026-09-17] [pattern] 真实页面验证（文档站产物预览）与合成夹具互补且不可互替，数值有差时逐项归因再判是否为组件缺陷 → [测试规范 §7](../../standards/testing.md)
- [2026-09-17] [pattern] 判别「上游行为 vs 组件缺陷」用无组件 CSS 的纯 HTML 夹具复现同构几何（Chromium 焦点滚动只在完全不相交时介入） → [测试规范 §7](../../standards/testing.md) 与[响应式设计 §4](../responsive.md)
- [2026-09-16] [pattern] 校验机器格式化源码的守卫用严格正则 + 遇未知行抛错，且按扩展名扫目录须排除同目录 `*.test.ts` → [测试规范 §10](../../standards/testing.md)
- [2026-09-16] [pattern] 由注册表派生的公开联合类型扩展后，d.ts 冒烟须带负向对照（`@ts-expect-error` 下未注册值应报错） → [测试规范 §10](../../standards/testing.md)

### 组件实现与响应式

- [2026-09-16] [pattern] 组件库响应式断点取值与目标下游既有断点变量对齐（momei 640 / 768 / 1024），更细的下游布局断点属使用方职责 → [响应式设计 §2](../responsive.md)
- [2026-09-16] [pattern] 档位高度由 `:where()` 声明时，窄屏释放固定高度只需普通类选择器；释放后须按档位补回成员 `min-height`（减去根元素边框宽） → [响应式设计 §3 矩阵 #8](../responsive.md)
- [2026-09-17] [pattern] 浮层「可用空间上限」要两轴都给（只补 `max-width` 会漏掉纵向越界），修法同源：`--reka-popover-content-available-{width,height}` + `overflow: auto`，并在验收视口确认几何零变化 → [响应式设计 §3 矩阵 #6](../responsive.md)

### 评估、审计与协作流程

- [2026-09-17] [pattern] 评估 / 审计类交付的计数必须给「命令 + 口径 + 范围 + 快照日期」，与上次口径的差异要在结论旁披露；同一集合的计数多处引用时须在定义处给可复算口径 → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-17] [pattern] 跨仓只读评估须写明目标仓 revision 与工作区脏状态（含「未触碰」声明与统计范围排除项） → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-17] [pattern] 批量改写脚本必须「读 → 改 → 写」分离：`open(path,'w').write(open(path).read())` 会先截断再读把文件写成空；写后须核验产物非空。**检测盲区**：空 `.md` 对 `lint-md` 与链接 / 行数检查天然放行 → [AI 协作规范 §8](../../standards/ai-collaboration.md) 与 [Backlog §1.6](../../plan/backlog.md)（守卫候选）

## 2026-09-16 阶段收口蒸馏（Phase 9）

> 阶段收口（2026-09-16）：活跃 24 条全部处置，全部迁移（无删除、无保留），剩余活跃 0 条。

- [2026-09-16] [pattern] 诊断「组件没有动画」须在默认与 reduced-motion 两种上下文各测一次 → [文档与演示站设计 §12](../documentation-site.md)
- [2026-09-16] [pitfall] 跨层覆盖动画的退出须用独立命名 keyframes（Reka Presence 以 animation-name 变化判定） → [文档与演示站设计 §12](../documentation-site.md)
- [2026-09-16] [pitfall] `animation-name` 用 `!important` 会破坏 Reka Collapsible 的测量窗口 → [文档与演示站设计 §12](../documentation-site.md)
- [2026-09-16] [pitfall] 取证计数须记录「命令 + 口径 + 范围 + 快照日期」，语义标签逐条人工核对 → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-16] [pitfall] lint 规则为 `off` 时报告 0 只代表未启用；口径须写成「启用后的配置 + 命令 + 范围」 → [开发规范 §12](../../standards/development.md)
- [2026-09-16] [pitfall] 站内跨节锚点须按 VitePress slugify 实算，链接检查通过不能证明锚点有效 → [文档与演示站设计 §13](../documentation-site.md)
- [2026-09-16] [pattern] 规则与注释禁止不可判定口径，同一事实只在一处定义 → [规划规范 §9](../../standards/planning.md)
- [2026-09-16] [pattern] 派发子代理须用 agent frontmatter 的完整 `name`（含中文括号） → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-16] [process] agent / skill 定义正文改动属 `deep` 档，降档须显式论证 → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-16] [pattern] 证据目录被 gitignore 时须点名排除，结论落可提交位置 → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-16] [pattern] 对比度实测须同页切换 token 并在测量期禁用过渡 → [主题与样式设计 §7](../theming.md)
- [2026-09-16] [pitfall] `git stash` 造改前状态会踩 Vite mtime 缓存，取证脚本须内置 token 自检 → [主题与样式设计 §7](../theming.md)
- [2026-09-16] [pattern] 改动前景 token 前须枚举三类消费点（实底 / 自适应底 / 就地覆写） → [主题与样式设计 §7](../theming.md)
- [2026-09-16] [pattern] 暗色下自适应主色与跨主题实底不得共用同一前景 token → [主题与样式设计 §7](../theming.md)
- [2026-09-16] [pitfall] `docs:check:links` 不能替代 VitePress dead-link 校验，doc 改动须纳入 `docs:build` → [文档与演示站设计 §13](../documentation-site.md)
- [2026-09-16] [pitfall] 批量文本替换未命中会静默通过，必须带 `assert old in s` → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-16] [pattern] 「标记表 + 样例」型守卫互为牵制，新增标记须同步样例 → [测试规范 §9](../../standards/testing.md)
- [2026-09-16] [pitfall] 批量脚本按同名首匹配改类型会误删同名字段，须锚定接口作用域 → [AI 协作规范 §8](../../standards/ai-collaboration.md)
- [2026-09-16] [pattern] props 接口继承对 `component-meta` 的影响需全字段比对 → [文档与演示站设计 §14](../documentation-site.md)
- [2026-09-16] [pattern] 抽取批次须先算净收益；表达式级重复抽 helper 常为负收益 → [开发规范 §10](../../standards/development.md)
- [2026-09-16] [pitfall] 块注释内写字面 glob 的 `*/` 会提前闭合注释 → [开发规范 §12](../../standards/development.md)
- [2026-09-16] [pattern] ESLint type-aware 与 vue-tsc 的类型解析链不同，无 `.vue` 声明时组件导入退化为 any → [开发规范 §12](../../standards/development.md)
- [2026-09-16] [pattern] 通配 `*.vue` 声明是取舍，须登记「吞掉路径解析错误」的边界 → [开发规范 §12](../../standards/development.md)
- [2026-09-16] [pitfall] `vitepress preview` 不消费 `--host`；`--single-process` 下 `newPage()` 报错 → [开发指南 - 注意事项](../../guide/development.md)

## 2026-09-16 阶段归档蒸馏

> 阶段归档 + 用户主动触发（2026-09-16）：活跃 39 条全部处置，迁移 28 条、删除 11 条，剩余活跃 0 条。

**迁移 28 条（知识点写入目标文档）**：

- [2026-09-14] [pitfall] Vitest / Vite 对脚本中不可静态分析的 `import(变量)` 注入 `/@vite/client` helper（含 shebang 的 `.mjs` 解析失败），产物加载冒烟应放子进程 → [开发指南 - 注意事项](../../guide/development.md)
- [2026-09-14] [pitfall] Nuxt 模块发布声明须显式标注 `NuxtModule<T>`，`@nuxt/schema` 提供类型并加入 tsdown `neverBundle` → [架构设计 §5](../architecture.md)
- [2026-09-14] [env] pnpm 11 不再读取 package.json 的 `pnpm` 字段，配置迁至 `pnpm-workspace.yaml`（`ERR_PNPM_IGNORED_BUILDS`） → [架构设计 §4.1](../architecture.md)
- [2026-09-14] [pattern] Nuxt fixture 以 `node_modules` 软链消费构建产物，脚本用 `realpath` 校验目标后再复用 / 重建 → [开发指南 - 注意事项](../../guide/development.md)
- [2026-09-14] [pitfall] 引入 Nuxt fixture 后须同步 `.gitignore` / ESLint `ignores` / 根 `tsconfig` `exclude` → [开发指南 - 注意事项](../../guide/development.md)
- [2026-09-14] [pattern] 浏览器 hydration 验证：Playwright + 本地静态服务器，点击计数判定完成，`emulateMedia({ colorScheme })` 验证暗色 token → [测试规范 §7](../../standards/testing.md)
- [2026-09-15] [pitfall] 条件兄弟节点使根变 Fragment、`v-show` 与组件级指令静默失效，需单元素包裹层 → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pattern] 自适应高度测量（先 `auto` 再读 `scrollHeight`、`ResizeObserver` 按 `clientWidth` 去重、不可见时清空） → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pitfall] scoped 规则声明几何属性会抬高特异性挡住消费方覆盖 → [开发规范 §7](../../standards/development.md)
- [2026-09-15] [pattern] happy-dom 无布局引擎，需 `defineProperty` 注入几何、stub `ResizeObserver` → [测试规范 §8](../../standards/testing.md)
- [2026-09-15] [pitfall] 相邻改动行无法用 `git add -p` 拆 hunk 时的临时移除法 → [Git 规范 §3](../../standards/git.md)
- [2026-09-15] [dependency] Reka 日期 primitive 模型为 `DateValue`，依赖 `@internationalized/date`（`reka-ui/date` 子路径不可解析） → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pitfall] `v-bind` 与 `v-model` 同元素时 `v-model` 须在后，半受控用例才有判别力 → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pattern] 包装 Reka 触发器需 `as-child` + 自持 `<button>` + `inheritAttrs: false` → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pattern] `rolldown-dts` 可能留下裸副作用导入，可接受但不得宣称类型面零第三方引用 → [开发规范 §8](../../standards/development.md)
- [2026-09-15] [pitfall] 上游未透传可访问名 prop 时应组合更底层 primitive 接管文案 → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pattern] 时间类输入自建要点（number 输入钳位、非法 / 空输入回滚、`Number('') === 0`） → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [process] 含多项能力的条目按真实用量分批交付，取证记录命令与快照日期 → [规划规范 §5](../../standards/planning.md)
- [2026-09-15] [process] 零用量子能力不自动升降级，范围降级须用户裁定并保留理由与触发条件 → [规划规范 §3](../../standards/planning.md)
- [2026-09-15] [process] 提交信息声明的状态变更须在 `git show` 有对应 hunk → [Git 规范 §3](../../standards/git.md)
- [2026-09-15] [pattern] happy-dom 事件须 `cancelable: true` 才能触发 `preventDefault` 语义（`DismissableLayer` / `update:open`） → [测试规范 §8](../../standards/testing.md)
- [2026-09-15] [pitfall] 颜色 / 几何类控件断言须位置与数值敏感，避免弱断言假阳性 → [测试规范 §8](../../standards/testing.md)
- [2026-09-15] [pitfall] Reka Alpha primitive 的动态可访问文案（`aria-valuetext` / `aria-label` / `aria-hidden`）需包装层接管 → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pitfall] primitive anatomy 不可改（`ColorAreaThumb` 须嵌套于 `ColorAreaArea`） → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pitfall] 浏览器断言前核对文档页 `.demo-row` 索引（`vitepress preview` 旧产物部分已由 [开发指南 - 注意事项](../../guide/development.md) 覆盖） → [文档与演示站设计 §5](../documentation-site.md)
- [2026-09-16] [pitfall] 迁移口径：API 是否生效以一方源码 props 列表为准，而非调用点是否传值 → [设计规范 §7](../design-spec.md)
- [2026-09-16] [pitfall] 规划台账规模数字须与同一 index 的 diff 同源，提交前用 `git show :<file>` 核验 → [Git 规范 §3](../../standards/git.md)
- [2026-09-16] [pattern] 需同时断言插槽内容与作用域参数时，插槽须用渲染函数 → [测试规范 §8](../../standards/testing.md)

**删除 11 条（判定已被现有文档覆盖）**：

- [2026-09-14] [pitfall] pnpm 11 移除 `pnpm link --global`、`pnpm link <dir>` 写回 `link:` 与移除链接 → [本地联调 §2](../../guide/local-linking.md)
- [2026-09-14] [pattern] `file:` 为硬链接、重建后须重装、可正常解析下游 peer（联调优先） → [本地联调 §2.1 / §2.2](../../guide/local-linking.md)
- [2026-09-14] [pattern] `@nuxt/kit` 声明为可选 peer 依赖 → [架构设计 §5](../architecture.md)
- [2026-09-14] [pitfall] 文档示例 prop 须与源码类型核对、列举能力须与 export 对齐（幽灵 API） → [文档规范 §2](../../standards/documentation.md)（已实现能力才写入） / [文档与演示站设计 §9](../documentation-site.md)（示例纳入 `typecheck:docs`）
- [2026-09-14] [pattern] 需求评估检索下游仓库真实用法（排除 `node_modules` / `dist` / `.nuxt`） → [momei 使用复核台账 §2](./2026-09-14-momei-usage-audit.md)
- [2026-09-15] [process] Review Gate 对布局 / CSS 级联改动要求真实浏览器证据，证据随 delta 过期 → [测试规范 §2.1](../../standards/testing.md) / [AI 协作规范 §3](../../standards/ai-collaboration.md)
- [2026-09-15] [pitfall] Reka `TimeField`（2.10.4）`dayPeriod` 仅识别英文、非英文 12 小时制误判 → [开发规范 §5](../../standards/development.md)
- [2026-09-15] [pattern] 封装前先确认 primitive 是否覆盖目标语义（Reka `Drawer` 不定位、未采用） → [组件设计 §1.1](../components.md) / [设计规范 §7](../design-spec.md)
- [2026-09-15] [pitfall] Review Gate 缺轮次上限会无限循环（当时的单条目预算为 2 轮，现行口径已更新，以链接处为准） → [AI 协作规范 §3.4](../../standards/ai-collaboration.md)
- [2026-09-15] [pattern] 单模块大改动按交付面拆批次、审查与实现可并行 → [AI 协作规范 §3.2.1](../../standards/ai-collaboration.md)
- [2026-09-16] [pattern] DataView 类容器 `layout` 只切插槽 + 根修饰类、列定义归内容层 → [设计规范 §6 / §7](../design-spec.md)

## 2026-09-14 蒸馏批次

> 用户主动触发（2026-09-14）：活跃 15 条全部处置，迁移 6 条、删除 9 条，剩余活跃 0 条。

**迁移 6 条（知识点写入目标文档）**：

- Playwright 与 Reka RadioGroup 的键盘选中时序（须真实按键节奏）→ [测试规范 §8](../../standards/testing.md)
- 计算样式校验须先禁用过渡、静态 HTML 无法复现 scoped 视觉、headless 需 `--single-process` → [测试规范 §7](../../standards/testing.md)
- UI 验证证据落盘 `test-results/`（gitignore）→ [测试规范 §7](../../standards/testing.md)
- 表格单元格 inline-flex 组件的基线 1px 抖动 → [开发规范 §7](../../standards/development.md)
- VitePress `.vp-doc table` 的 `display: block` 破坏冻结列 → [文档与演示站 §9](../documentation-site.md)
- 下游组件缺口的标签级统计方法 → [momei 使用复核台账 §2](./2026-09-14-momei-usage-audit.md)

**删除 9 条（判定已被现有文档覆盖）**：

- VitePress + vue-tsc 的 Vite 类型冲突 → [文档与演示站 §9](../documentation-site.md)
- 站内搜索中文分词与 OR 组合 → [文档与演示站 §9](../documentation-site.md)
- 文档翻译物理路径与 `i18nRouting` fallback → [文档与演示站 §10](../documentation-site.md)
- `vitepress-demo-plugin` 相对路径解析 → [文档与演示站 §5](../documentation-site.md) / §10
- 组件 API 双语 `@en` → [文档与演示站 §10](../documentation-site.md)、[开发规范 §6](../../standards/development.md)
- 组件内建文案固定 zh-CN → [Backlog §1.4](../../plan/backlog.md)
- tsdown 默认外置 `dependencies` → [架构设计 §4](../../design/architecture.md)
- 响应式 `@media` 与 `prefers-reduced-motion` 的区分统计 → [Backlog §1.5](../../plan/backlog.md)
- 下游组件统计的正则陷阱 → [momei 使用复核台账 §2](./2026-09-14-momei-usage-audit.md)

## 2026-09-13 阶段归档蒸馏

- [2026-09-13] [pattern] Reka 组件 provide 状态不随子组件卸载复位，按 `src` 用 `:key` 重挂 → docs/standards/development.md
- [2026-09-13] [pattern] Reka 内建英文可访问文案可经 `aria-label` fallthrough 覆盖 → docs/standards/development.md
- [2026-09-13] [pattern] 组件内列表项需显式 `margin: 0`（宿主列表样式会渗透） → docs/standards/development.md
- [2026-09-13] [pattern] vue-component-meta MetaChecker 增量刷新，`clearCache()` 反而陈旧 → docs/design/documentation-site.md
- [2026-09-13] [env] Vite/VitePress config `codeSplitting: false` 会内联动态 import → docs/guide/development.md
- [2026-09-13] [pattern] VitePress 监听 `src/` 需 `watcher.add`；`moduleGraph` 需 `normalizePath` → docs/design/documentation-site.md
- [2026-09-13] [pattern] Reka `ProgressRoot` `modelValue=null` → `indeterminate` → docs/standards/development.md
- [2026-09-13] [pattern] live region 只应包住文本内容 → docs/standards/development.md
- [2026-09-13] [env] VitePress `base.css` reduced-motion 会压静动画，修复在文档层 → docs/design/documentation-site.md
- [2026-09-13] [pattern] Vue scoped 会把 `@keyframes` 名重写为 `name-<hash>` → docs/standards/development.md
- [2026-09-13] [process] lint-staged 仅运行 ESLint，样式改动需手动跑 Stylelint → docs/standards/git.md
- [2026-09-13] [pattern] Stylelint `selector-not-notation: complex` 要求 `:not(a, b)` → docs/standards/development.md
- [2026-09-13] [pattern] Reka `AlertDialogContent` 不屏蔽 `escapeKeyDown` → docs/standards/development.md
- [2026-09-13] [pattern] `AlertDialogAction` 的 DialogClose onClick 先于包裹 click，需顺序无关结算 → docs/standards/development.md
- [2026-09-13] [process] Review Gate 10 文件 / 800 行阈值与 barrel 分步导出 → docs/standards/ai-collaboration.md
- [2026-09-13] [env] `docs:preview` 服务旧产物；`pkill` 进程名不匹配 → docs/guide/development.md
- [2026-09-13] [pattern] `ComboboxTrigger` 硬编码 `aria-label` 可经 fallthrough 覆盖 → docs/standards/development.md
- [2026-09-13] [pattern] Reka Combobox 多选表单语义（`required` 交 Root、`name[index]`） → docs/standards/development.md
- [2026-09-13] [pattern] 派生组件需剔除内部状态管理的保留属性 → docs/standards/development.md
- [2026-09-13] [pattern] `defineModel()` 与 `defineProps<接口>()` 不得同时声明 `modelValue` → docs/standards/development.md
- [2026-09-13] [pattern] VTU 受控组件需同时传 `modelValue` 与 `onUpdate:modelValue` → docs/standards/testing.md
- [2026-09-13] [pattern] Reka 触发方式差异（Tabs mousedown；Accordion/Dropdown click） → docs/standards/testing.md
- [2026-09-13] [pattern] Reka `Accordion`/`Collapsible` `hidden="until-found"` 保留收起内容 → docs/standards/development.md
- [2026-09-13] [pattern] Reka DropdownMenu `modal: true` 锁 body 滚动，非模态须 `modal=false` → docs/design/theming.md
- [2026-09-13] [process] 分批提交需保留「仅本批导出」的中间版本 → docs/standards/ai-collaboration.md
- [2026-09-13] [pattern] Reka `DismissableLayer` Escape 挂在 window，测试须内容元素冒泡派发 → docs/standards/testing.md
- [2026-09-13] [pattern] Reka portal 浮层子部件共享样式集中到 Content 非 scoped 块 → docs/standards/development.md
- [2026-09-13] [pattern] Reka `ToggleGroup` 的 `VisuallyHiddenInput` 会展开 `name[key]`/`name[i]` → docs/standards/development.md
- [2026-09-13] [pattern] Reka `ToggleGroup` 单选返回 `undefined`，必有一选中项需受控 + 忽略 → docs/standards/development.md
- [2026-09-13] [process] `docs/**` 不在 `tsconfig` include，typecheck 覆盖不到示例 → docs/standards/ai-collaboration.md
- [2026-09-13] [pattern] SSR 直出 `<img>` 需以 `img.complete` 兜底水合状态 → docs/standards/development.md
- [2026-09-13] [pattern] 包装型表单组件 attrs 细分（name/form/required 与 id/aria-* 分流） → docs/standards/development.md
- [2026-09-13] [pattern] WCAG 2.5.3：容器型控件 `label` 仅在自定义内容时生效 → docs/standards/development.md
- [2026-09-13] [env] happy-dom 文件输入 `value` 恒为空，需 setter 记录赋值 → docs/standards/testing.md

## 2026-09-12 与更早

- [2026-09-12] [env] 容器内 Chromium 崩溃需可写 TMPDIR（`/tmp` 不可写时 `Target crashed`）→ docs/standards/testing.md
- [2026-09-12] [pattern] 文档站链路：VitePress + `vitepress-demo-plugin` + `vue-component-meta`，一组件一页、demo 独立成文件 → docs/design/documentation-site.md
- [2026-09-12] [pattern] 包装型表单组件 attrs 透传：`class` / `style` 留根、其余原生属性进内层控件 → docs/standards/development.md
- [2026-09-12] [process] 审计证据须对齐最终 revision，源码变更后重跑 build 与浏览器验证 → docs/standards/ai-collaboration.md
- [2026-09-12] [env] 修改 `defineProps<ImportedType>()` 引用的 `types.ts` 后需重启 dev server 排除半陈旧 HMR → docs/guide/development.md
- [2026-09-12] [pattern] 受控数值输入：聚焦不回填，失焦 / 步进 `clamp(round(value))`，`step` / `precision` 校验 → docs/standards/development.md
- [2026-09-12] [pattern] 主题色区分自适应强调色与跨主题稳定 `-solid` 实底色 → docs/design/theming.md
- [2026-09-12] [pattern] Reka portal 组件 scoped `data-v` 落在包裹层，改用命名空间化非 scoped 规则 → docs/standards/development.md
- [2026-09-12] [process] 严格 A→F：提交必须晚于 Review Gate Pass，补救只用新提交 → docs/standards/ai-collaboration.md
- [2026-09-12] [pattern] 非模态 Select 须设 `bodyLock=false`，避免滚动条消失与布局跳动 → docs/design/theming.md
- [2026-09-12] [process] 浮层滚动锁测量集必须包含 fixed / 视口元素与遮罩 → docs/standards/testing.md
- [2026-09-12] [env] Playwright 默认 `--hide-scrollbars`，滚动锁位移检测需 `ignoreDefaultArgs` → docs/standards/testing.md
- [2026-09-12] [tradeoff] 遮罩完整覆盖与视口宽度稳定对滚动条预留区互斥，采用 body padding 方案 → docs/design/theming.md
- [2026-09-12] [pattern] Toast `<ol>` 几何重置用叠加类提升特异性，fixed 宽度用 `100%` 而非 `100vw` → docs/standards/development.md
- [2026-09-12] [pattern] 服务式 composable 状态用 provide/inject per-provider store，保证 SSR 隔离 → docs/design/components.md
- [2026-09-12] [process] UI 类改动可用「实现 → 验证 → ui-validator 收证据 → 带证据复审」闭环 → docs/standards/ai-collaboration.md
- [2026-09-12] [pattern] CSS 变量覆盖钩子：基类不预声明默认值、消费处 `var(--x, fallback)`，档位类用 `:where()` 归零特异性 → docs/standards/development.md
- [2026-09-12] [pattern] 区块间距压缩须覆盖全部合法邻接组合，避免条件渲染漏判 → docs/standards/development.md
- [2026-09-12] [pattern] Reka `CheckboxIndicator` 不回传父级 scoped `data-v`，可在默认插槽内自绘 → docs/standards/development.md
- [2026-09-12] [pattern] 布尔假值不输出到 ARIA，用 `value || undefined` → docs/standards/development.md
- [2026-09-12] [pattern] `label` 统一为不可见可访问名，全局约定先于新组件落地 → docs/standards/development.md
- [2026-09-12] [pattern] 同特异性规则由源码顺序决定胜负，`hover` 须在 `striped` 之后 → docs/standards/development.md
- [2026-09-12] [dependency] `@tanstack/vue-table` v9 为 feature-based API（`tableFeatures` / `useTable` / `FlexRender`）→ docs/standards/development.md
- [2026-09-12] [pattern] VTU 无法推断泛型 SFC 类型参数，测试内需强制具体化 → docs/standards/testing.md
- [2026-09-12] [process] 组件实现优先封装 Reka UI primitive，仅缺失或无法满足时自建 → docs/design/components.md
- [2026-09-12] [env] Reka UI 文档站无 `/docs/components` 索引页，以侧栏导航或本地导出为准 → docs/design/components.md
- [2026-09-12] [pattern] Reka `NumberFieldRoot.stepSnapping` 默认 `true`，保留「加 step」须显式 `false` → docs/standards/development.md
- [2026-09-12] [pattern] Reka `clampInputValue` 先钳制再 format→parse，`precision` 不映射 `maximumFractionDigits` → docs/standards/development.md
- [2026-09-12] [pattern] Reka 增减按钮用 pointer 事件（非 click），`pointerup` 监听在 `window` → docs/standards/testing.md
- [2026-09-12] [pattern] Reka NumberField `autocomplete` 需条件绑定（primitive 内建 `off`）→ docs/standards/development.md
- [2026-09-12] [pattern] VTU `trigger('keydown.enter')` 的 key 为小写，应传 `{ key: 'Enter' }` → docs/standards/testing.md
- [2026-09-12] [pattern] Vue 模板同一元素只允许一个无参 `v-bind`，多个须脚本内合并 → docs/standards/development.md
- [2026-09-12] [process] UI 验证证据须落盘到仓库内可提交位置或内联实测值（`dist/` 等被忽略） → docs/standards/testing.md
- [2026-09-15] [pattern] Reka NumberField 展示上限若低于取整精度（`maximumFractionDigits < precision`），失焦回读会按上限截断模型；上限应取 `maxFractionDigits` 与 `precision` 的较大值（取代 2026-09-12 的「`precision` 不映射 `maximumFractionDigits`」） → docs/standards/development.md
- [2026-09-15] [pitfall] 取整用的 `10 ** n` 在极大值上会溢出为 `Infinity` 并污染模型；`precision` 取值域应对齐 ES2023 Intl v3 之前的 `Intl.NumberFormat` 小数位上限（20），以消除旧运行时的 `RangeError`，取整前需做有限性守卫 → docs/standards/development.md
