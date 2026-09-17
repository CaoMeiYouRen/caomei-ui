# Session 经验归档

> 用途：承接 `.session/wisdom.md` 中**已蒸馏条目**（知识点已迁移到 `docs/` 后的摘要与链接），使跨 session 发现可跨机器、跨分支留存。
>
> 活跃条目仍在 `.session/wisdom.md`；蒸馏机制见 [Session Wisdom 蒸馏机制](./session-wisdom-distillation.md)。条目格式：`- [YYYY-MM-DD] [type] 摘要 → docs/path`。

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
- [2026-09-15] [pitfall] Review Gate 缺轮次上限会无限循环（单条目最多 2 轮） → [AI 协作规范 §3.4](../../standards/ai-collaboration.md)
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
