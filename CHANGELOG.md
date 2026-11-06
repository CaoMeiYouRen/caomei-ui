# caomei-ui

# [1.1.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/v1.0.0...v1.1.0) (2026-11-06)


### ✨ 新功能

* **a11y:** P0 清除 / 关闭按钮命中区扩到 24px ([88bf50b](https://github.com/CaoMeiYouRen/caomei-ui/commit/88bf50b))
* **ai-check:** 补 metadata.internal 与 references 索引守卫 ([1cb41bb](https://github.com/CaoMeiYouRen/caomei-ui/commit/1cb41bb))
* **form:** 新增 CaomeiForm 与 CaomeiFormItem 组合层 ([b5496ef](https://github.com/CaoMeiYouRen/caomei-ui/commit/b5496ef))
* **release:** 发布链内置安全告警门禁 ([5752ee0](https://github.com/CaoMeiYouRen/caomei-ui/commit/5752ee0))
* **release:** 发布链自动同步版本句与里程碑 ([b3e6471](https://github.com/CaoMeiYouRen/caomei-ui/commit/b3e6471))
* **release:** 安全门禁纳入 dismissed 并收紧豁免分类 ([45a0938](https://github.com/CaoMeiYouRen/caomei-ui/commit/45a0938))
* **release:** 将 API 差分接入发布链 ([6f60021](https://github.com/CaoMeiYouRen/caomei-ui/commit/6f60021))
* **release:** 补齐 API 差分的 required 收紧判定 ([f39f613](https://github.com/CaoMeiYouRen/caomei-ui/commit/f39f613))
* **skills:** 任务开局增加 CI 回执检查 ([1f49e1f](https://github.com/CaoMeiYouRen/caomei-ui/commit/1f49e1f))
* **styles:** 新增触摸密度轴 data-density ([1fcd32c](https://github.com/CaoMeiYouRen/caomei-ui/commit/1fcd32c))


### 🐛 Bug 修复

* **release:** 加固 CHANGELOG 生成器的空段与降级路径 ([d6e9a64](https://github.com/CaoMeiYouRen/caomei-ui/commit/d6e9a64))


## 1.1.0 里程碑

本版本聚焦移动端可用性、表单组合层与发布链路收口。

### 移动端与响应式

- 新增 `data-density="touch"` 密度轴：控件高度 36 / 44 / 52、字号 14 / 16 / 18、内容宽度上限 `none`，与预设和明暗正交；未设置属性时逐值不变。
- 新增 `--caomei-hit-target-min` 与不可见命中区：值片删除 / 清空、密码显隐、Tag 关闭、Message 关闭等 P0 目标扩到 ≥ 24×24，按钮视觉盒不变。

### 表单

- 新增 `CaomeiForm` / `CaomeiFormItem` 独立组合层：`Form` 负责布局与提交编排，`FormItem` 通过插槽作用域提供 `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`；12 个字段组件逐项绑定；无 rules 引擎，未扩既有字段契约。

### 发布链路

- 1.1.0 起通过 CI 发布：`workflow_dispatch` 触发 semantic-release 直连，npm 走 Trusted Publishing（OIDC，无需 `NPM_TOKEN`），GitHub 走 `GITHUB_TOKEN`；版本推断、tag、GitHub Release 与回推提交均由发布链完成。
- 版本句（README 中英 / roadmap）与里程碑段由发布链自动同步，发布后 `docs:check:version` 保持绿色。

### 升级注意

- 移动端命中区只做 P0；P1 / P2 仍为候选。
- `Form` 不提供 rules 引擎；校验仍由消费方或字段组件承接。
- `next` 通道未启用：CI 只发 `latest`，预发布继续使用本地 `pnpm release:manual --tag=next`。

### 已知限制

- 品牌预设 `caomei` 的 `primary-solid` 实底白字对比度为 4.17:1（既有品牌裁定，保留）。
- `commitizen` 依赖的 `glob@7` 链仍保留 `minimatch@3.1.5`，对应安全告警维持 open medium。

# [1.0.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/v1.0.0-rc.1...v1.0.0) (2026-11-03)

> **首个正式版**。相较 `0.7.0`，本版完成 1.x 兼容承诺、DataTable 行为收口与颜色 / 可访问性收口；**组件集合与包根导出不变**（发布前 API 差分 exit 0：0 删除 / 0 重命名，导出数 328），但有 4 项升级前需确认的注意事项，见「升级注意」。

### 🎉 1.0 里程碑

- **1.x 兼容承诺**：组件公开 props / events / slots、`exports` 13 键、包根导出名、`--caomei-*` token（冻结面 380 个名称）、10 语 locale 命名空间与 `InputNumber` 的 `step` 语义进入冻结面；破坏性变更只随 `major` 发布并给弃用期（见 [`docs/guide/version-policy.md`](https://github.com/CaoMeiYouRen/caomei-ui/blob/master/docs/guide/version-policy.md)）。
- **主题预设**：新增 `sakura` / `forest` / `ink` 三套设计向预设，`momei` 按 momei 运行时口径同步；缺省仍为 `minimal`。
- **颜色角色拆分**：新增 `--caomei-color-<tone>-text`（Tag / Badge / Message / Alert / Button 文字型变体 / toast action）与 `--caomei-color-control-border`（字段族 / Checkbox / Radio / Switch / Slider / SelectButton / 上传区 / 分页 / 步骤指示器）；6 预设 × 明暗的文本与控件边界对比度矩阵纳入常驻回归。
- **DataTable 行为收口**：表头全选只作用当前页（可访问名同步改为「全选当前页」，10 语）；`lazy` 下选择与展开在受控 / 自持两侧均按页收敛；`lazy` 启用选择或展开须显式 `rowKey`（缺省时开发期告警）；横向滚动容器键盘可达（常驻 `tabindex="0"`，有 `caption` 时补 `role="group"` 与可访问名）。
- **Button 状态反馈**：hover / active 由既有 token 经 `color-mix()` 派生，**默认预设（`minimal`）**下亮暗三态对比度仍 ≥ 4.5:1；`:disabled` / `:focus-visible` 与减动效行为不变（品牌预设的既有缺口见「已知限制」）。
- **语言**：内建 10 语。`zh-CN` / `en-US` 预注册；`zh-TW` / `ja-JP` / `ko-KR` / `es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR` 经 `caomei-ui/locale/<code>` 按需引入。

### ⚠️ 升级注意

- **`engines.node` ≥ 22**：`0.7.0` 为 ≥ 20，Node 20 已于 2026-04 EOL。
- **DataTable 全选语义收窄**：表头全选由「整表」改为「当前页」；`lazy` 下选择 / 展开须显式 `rowKey`，跨页不再沿用页内索引键。
- **可见外观变化**：控件边界改用更深的 `--caomei-color-control-border`（满足 3:1 非文本对比度）；`soft` / `outline` 语义色文本改用 `*-text` 角色，部分预设文字色略有加深。
- **覆盖过 token 的消费方**：若曾用 `--caomei-color-border` 承担控件边界，需改用 `--caomei-color-control-border`；覆盖后的对比度由使用方自行保证。

### 已知限制

- **品牌预设的既有对比度缺口**：`momei` 亮色 `success` 三态为 2.279 / 2.643 / 3.045，`caomei` `primary-solid` 为 4.17；均为既有品牌裁定保留项，本版未修复也未恶化，见 Backlog「品牌预设的 `-solid` 对比度缺口」与 G1-F 记录 §6。
- **Calendar / RichTextEditor 的交互边界**：上 / 下月导航按钮与编辑器容器描边的对比度未达 3:1，属可交互边界，本版未覆盖（见 Backlog「Calendar / RichTextEditor 交互边界对比度」）。
- 视觉与无障碍回归只覆盖 Chromium（常驻档 390 / 768 / 1280，另 320 / 900 定向档；375px 仅用于画廊与 DataTable 键盘滚动专项）；**Firefox / WebKit 未纳入本次 1.0 回归矩阵**。
- 禁用态按 WCAG 1.4.3 / 1.4.11 豁免，不参与对比度断言。
- 视觉回归为快照比对（`toHaveScreenshot`，双轴容差 `threshold: 0.1` + `maxDiffPixels: 100`），对极小尺寸组件的细微色差不敏感；颜色类回归以 `capture:styles` 计算样式采样为准。
- 一期 5 语（`es-ES` / `fr-FR` / `de-DE` / `ru-RU` / `pt-BR`）文案由 AI 生成，母语审校仍待完成；发现措辞问题请提 issue。

### 🐛 Bug 修复

* **release:** 修正 CHANGELOG 段落抽取的版本边界 ([4fb0c52](https://github.com/CaoMeiYouRen/caomei-ui/commit/4fb0c52))
* **release:** 将版本句同步前置于发布并补齐 G4 证据 ([fd4ad8e](https://github.com/CaoMeiYouRen/caomei-ui/commit/fd4ad8e))
* **release:** 支持预发布版本句并阻止静态 dist-tag ([03d6726](https://github.com/CaoMeiYouRen/caomei-ui/commit/03d6726))

# [1.0.0-rc.1](https://github.com/CaoMeiYouRen/caomei-ui/compare/v0.7.0...v1.0.0-rc.1) (2026-10-30)

### ✨ 新功能

* **button:** 新增 hover 与 active 状态反馈 ([2b7af3a](https://github.com/CaoMeiYouRen/caomei-ui/commit/2b7af3a))
* **ci:** 接入安全告警门禁并读取用户 PAT ([34084cf](https://github.com/CaoMeiYouRen/caomei-ui/commit/34084cf))
* **docs:** 新增 axe 抽检脚本并补齐 Select 示例可访问名 ([013b647](https://github.com/CaoMeiYouRen/caomei-ui/commit/013b647))
* **release:** 支持 --tag 预发布通道并加入覆盖率预检 ([b8a2086](https://github.com/CaoMeiYouRen/caomei-ui/commit/b8a2086))
* **scripts:** 新增发布时 API 表面差分 ([1786029](https://github.com/CaoMeiYouRen/caomei-ui/commit/1786029))
* **theme:** 同步 momei 预设并新增三套设计向预设 ([7cdacfc](https://github.com/CaoMeiYouRen/caomei-ui/commit/7cdacfc))
* **theme:** 拆分文字与控件边界的颜色角色 ([5c260a2](https://github.com/CaoMeiYouRen/caomei-ui/commit/5c260a2))

### 🐛 Bug 修复

* **data-table:** 修复横向滚动容器键盘不可达 ([d59800a](https://github.com/CaoMeiYouRen/caomei-ui/commit/d59800a))
* **data-table:** 收口行选择全选作用域与 lazy 页内状态 ([17bf41e](https://github.com/CaoMeiYouRen/caomei-ui/commit/17bf41e))
* **release:** 修复空 Unreleased、OTP 与 tag 预检 ([a0e91f5](https://github.com/CaoMeiYouRen/caomei-ui/commit/a0e91f5))
* **scripts:** 修复文档守卫的标签与文本判定缺陷 ([991330d](https://github.com/CaoMeiYouRen/caomei-ui/commit/991330d))

# [0.7.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/v0.6.0...v0.7.0) (2026-10-20)

### ✨ 新功能

* **components:** Chart 主题与语言联动（token 派生 + 格式跟随） ([052c840](https://github.com/CaoMeiYouRen/caomei-ui/commit/052c840))
* **components:** 新增 Alert 提示框并复核正文对比度 ([caecc1c](https://github.com/CaoMeiYouRen/caomei-ui/commit/caecc1c))
* **components:** 新增 Chart 图表封装（可选 peer 按需加载） ([3f7ae73](https://github.com/CaoMeiYouRen/caomei-ui/commit/3f7ae73))
* **components:** 新增 Tooltip 工具提示封装 ([0e297a4](https://github.com/CaoMeiYouRen/caomei-ui/commit/0e297a4))
* **components:** 新增导航骨架 Menu 与 Breadcrumb ([6012e7a](https://github.com/CaoMeiYouRen/caomei-ui/commit/6012e7a))
* **components:** 新增栅格与布局族 CaomeiRow / CaomeiCol ([27f0bf3](https://github.com/CaoMeiYouRen/caomei-ui/commit/27f0bf3))
* **docs:** Phase 23 M5-1 文档站示例外部图片源守卫 ([5e76d82](https://github.com/CaoMeiYouRen/caomei-ui/commit/5e76d82))
* **governance:** 扩展 locale 台账与子路径清单对账 ([aaf5f7d](https://github.com/CaoMeiYouRen/caomei-ui/commit/aaf5f7d))
* **locale:** 内建语言改为预注册加按需子路径，并重写台账守卫 ([8206b01](https://github.com/CaoMeiYouRen/caomei-ui/commit/8206b01))
* **locale:** 新增一期 5 语并接入按需子路径 ([8a6ddf9](https://github.com/CaoMeiYouRen/caomei-ui/commit/8a6ddf9))
* **release:** 新增统一手动发布流单入口脚本 ([05d830c](https://github.com/CaoMeiYouRen/caomei-ui/commit/05d830c))

### 🐛 Bug 修复

* **responsive:** 修复 769–1023px 空档并扩面视口矩阵 ([0b4849c](https://github.com/CaoMeiYouRen/caomei-ui/commit/0b4849c))

### 📦 代码重构

* **shared:** 提取跨层共享的开发期告警工具 warnDev ([1eb562b](https://github.com/CaoMeiYouRen/caomei-ui/commit/1eb562b))

# [0.6.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/v0.5.0...v0.6.0) (2026-10-08)

### ✨ 新功能

* **governance:** 新增组件设计 §5 清单对账守卫 ([27c9700](https://github.com/CaoMeiYouRen/caomei-ui/commit/27c9700))
* **governance:** 规划编号守卫豁免进行中阶段条目表 ([7cf0747](https://github.com/CaoMeiYouRen/caomei-ui/commit/7cf0747))
* **governance:** 规划载体编号守卫扩面 ([5ac4100](https://github.com/CaoMeiYouRen/caomei-ui/commit/5ac4100))

### 🐛 Bug 修复

* **a11y:** 消除分组标签与折叠内容的悬空引用 ([5d3ce82](https://github.com/CaoMeiYouRen/caomei-ui/commit/5d3ce82))
* **accordion:** 修正自定义触发器示例无法收起并补开合回归 ([f41a2e2](https://github.com/CaoMeiYouRen/caomei-ui/commit/f41a2e2))
* **data-table:** 排序指示条常驻占位，列宽不再随排序变化 ([449068e](https://github.com/CaoMeiYouRen/caomei-ui/commit/449068e))
* **docs:** 隔离文档站正文列表样式对 RichTextEditor 内核浮层的泄漏 ([35c6731](https://github.com/CaoMeiYouRen/caomei-ui/commit/35c6731))
* **governance:** 修正 ref-attr 守卫在捕获模式下崩溃 ([a3591a0](https://github.com/CaoMeiYouRen/caomei-ui/commit/a3591a0))
* **style:** 更新组件背景色和阴影样式 ([89c4d82](https://github.com/CaoMeiYouRen/caomei-ui/commit/89c4d82))
* **tabs:** 修复 TabList 多余纵向滚动条 ([568b042](https://github.com/CaoMeiYouRen/caomei-ui/commit/568b042))
* **tabs:** 修复激活指示条被裁剪并同步分隔线契约 ([7b71b2e](https://github.com/CaoMeiYouRen/caomei-ui/commit/7b71b2e))

# [0.5.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/v0.4.0...v0.5.0) (2026-09-30)

### ✨ 新功能

* **components:** 新增 CaomeiRichTextEditor 富文本编辑器封装 ([023e30c](https://github.com/CaoMeiYouRen/caomei-ui/commit/023e30c))
* **docs:** 画廊进组件侧栏、RichTextEditor 独立分组并修复卡片对齐 ([25f79fa](https://github.com/CaoMeiYouRen/caomei-ui/commit/25f79fa))
* **governance:** 新增 docs 取证命令 revision 钉定守卫 ([1c26cd3](https://github.com/CaoMeiYouRen/caomei-ui/commit/1c26cd3))
* **governance:** 新增浮层档位语义门禁 check:overlay-z-index ([17ff31f](https://github.com/CaoMeiYouRen/caomei-ui/commit/17ff31f))
* **governance:** 新增类名前缀拼写守卫 ([0378fd4](https://github.com/CaoMeiYouRen/caomei-ui/commit/0378fd4))
* **locale:** 新增 richTextEditor 文案命名空间 ([46b8f12](https://github.com/CaoMeiYouRen/caomei-ui/commit/46b8f12))
* **theme:** 新增极简具名预设 minimal（缺省即极简） ([50c1f0e](https://github.com/CaoMeiYouRen/caomei-ui/commit/50c1f0e))

### 🐛 Bug 修复

* **components:** 修正模态内浮层面板层级并补齐 z-index 覆盖钩子 ([79e4ef9](https://github.com/CaoMeiYouRen/caomei-ui/commit/79e4ef9))
* **docs:** 修正版本策略页版本口径并补两条弱守卫 ([bca8db8](https://github.com/CaoMeiYouRen/caomei-ui/commit/bca8db8))

# [0.4.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/v0.3.0...v0.4.0) (2026-09-29)

### ✨ 新功能

* **button:** 新增 iconOnly prop 实现纯图标按钮形态 ([d182da0](https://github.com/CaoMeiYouRen/caomei-ui/commit/d182da0))
* **data-table:** 新增分页对齐 token ([b19f077](https://github.com/CaoMeiYouRen/caomei-ui/commit/b19f077))
* **docs:** 新增示例引用存在性守卫 ([cf19133](https://github.com/CaoMeiYouRen/caomei-ui/commit/cf19133))
* **docs:** 链接守卫拦截站点范围外链接 ([8b24074](https://github.com/CaoMeiYouRen/caomei-ui/commit/8b24074))
* **governance:** 指针守卫覆盖紧邻编号形态 ([d60a867](https://github.com/CaoMeiYouRen/caomei-ui/commit/d60a867))
* **governance:** 新增 Review Gate 落盘阻断守卫 ([ca7acea](https://github.com/CaoMeiYouRen/caomei-ui/commit/ca7acea))
* **governance:** 旧尺寸命名扩到样式选择器并加固声明解析 ([f8598d7](https://github.com/CaoMeiYouRen/caomei-ui/commit/f8598d7))
* M4 治理守卫精选交付 ([5f52ee4](https://github.com/CaoMeiYouRen/caomei-ui/commit/5f52ee4))
* **select:** 新增 #value 插槽自定义触发器显示 ([f3b6de1](https://github.com/CaoMeiYouRen/caomei-ui/commit/f3b6de1))

### 🐛 Bug 修复

* **calendar:** 根容器补显式 role 使可访问名合法 ([7a77bd5](https://github.com/CaoMeiYouRen/caomei-ui/commit/7a77bd5))
* **components:** 下拉触发器与 SelectGroup 的引用型属性收口 ([2e75e53](https://github.com/CaoMeiYouRen/caomei-ui/commit/2e75e53))
* **components:** 修复 caumei 选择器拼写致规则永不命中 ([dbfb7ca](https://github.com/CaoMeiYouRen/caomei-ui/commit/dbfb7ca))
* **components:** 修复多行输入高度固定致内容与滚动条溢出边框 ([658bca2](https://github.com/CaoMeiYouRen/caomei-ui/commit/658bca2))
* **components:** 多选字段关闭态不输出空 aria-controls 并持有面板 id ([f6f5341](https://github.com/CaoMeiYouRen/caomei-ui/commit/f6f5341))
* **components:** 触发器 disabled 透传与包装层归一化 ([b4d0d0d](https://github.com/CaoMeiYouRen/caomei-ui/commit/b4d0d0d))
* **docs:** 修复 Select #value 示例文件缺失与类型错误 ([f777d43](https://github.com/CaoMeiYouRen/caomei-ui/commit/f777d43))
* **docs:** 修复图标按钮示例 SFC 结构并补示例形态守卫 ([f31ee34](https://github.com/CaoMeiYouRen/caomei-ui/commit/f31ee34))
* **governance:** 修复 Review Gate 守卫对版本号提交的误拦截 ([e128aa6](https://github.com/CaoMeiYouRen/caomei-ui/commit/e128aa6))
* **governance:** 发布元数据豁免扩展至 CHANGELOG 生成制品 ([d07fd8c](https://github.com/CaoMeiYouRen/caomei-ui/commit/d07fd8c))
* **stepper:** 关联目标缺席时条件输出 aria-describedby 与 aria-labelledby ([f95b715](https://github.com/CaoMeiYouRen/caomei-ui/commit/f95b715))
* **style:** soft 变体底色调整为 8% 以达正文对比度 ([661b67d](https://github.com/CaoMeiYouRen/caomei-ui/commit/661b67d))
* **toast,switch:** 统一回退口径并对齐滑块前景契约 ([8fc5cda](https://github.com/CaoMeiYouRen/caomei-ui/commit/8fc5cda))
* **toast:** 中性强调描边回退色改 text-muted 以达图形对比度 ([728a03d](https://github.com/CaoMeiYouRen/caomei-ui/commit/728a03d))

### 📦 代码重构

* **styles:** 抽离字段外壳共享样式层并迁移 4 组件 ([0dc4116](https://github.com/CaoMeiYouRen/caomei-ui/commit/0dc4116))

# [0.3.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/v0.2.0...v0.3.0) (2026-09-24)

### ✨ 新功能

* **data-table:** 支持可折叠分组 ([b18fe85](https://github.com/CaoMeiYouRen/caomei-ui/commit/b18fe85))
* **data-table:** 支持多列排序与降序优先 ([22fc0aa](https://github.com/CaoMeiYouRen/caomei-ui/commit/22fc0aa))
* **data-table:** 支持行展开 ([d3749e0](https://github.com/CaoMeiYouRen/caomei-ui/commit/d3749e0))
* **data-table:** 新增行分组能力 ([24eaa16](https://github.com/CaoMeiYouRen/caomei-ui/commit/24eaa16))
* **docs:** 新增文档站双花括号插值机检守卫 ([3fd2f36](https://github.com/CaoMeiYouRen/caomei-ui/commit/3fd2f36))
* **docs:** 新增登记表驱动的组件画廊页 ([e801d64](https://github.com/CaoMeiYouRen/caomei-ui/commit/e801d64))
* **docs:** 新增站点版本信息与兼容策略 ([5643447](https://github.com/CaoMeiYouRen/caomei-ui/commit/5643447))
* **docs:** 新增站点版本单一来源守卫 ([d486747](https://github.com/CaoMeiYouRen/caomei-ui/commit/d486747))
* **docs:** 新增组件画廊登记表对账守卫 ([899eaf4](https://github.com/CaoMeiYouRen/caomei-ui/commit/899eaf4))
* **tags-input:** 新增 TagsInput 标签输入组件 ([fdbfa1f](https://github.com/CaoMeiYouRen/caomei-ui/commit/fdbfa1f))

### 🐛 Bug 修复

* **docs:** 修复导航栏 768–959px 横向溢出并更正历史归因 ([3213a01](https://github.com/CaoMeiYouRen/caomei-ui/commit/3213a01))

# [0.2.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/v0.1.0...v0.2.0) (2026-09-22)

### ✨ 新功能

* **components:** M3 组件能力增强 ([38398b3](https://github.com/CaoMeiYouRen/caomei-ui/commit/38398b3))
* **docs:** 把 nav 与 sidebar 链接纳入链接校验覆盖面 ([193d01d](https://github.com/CaoMeiYouRen/caomei-ui/commit/193d01d))
* **docs:** 新增英文文档 parity 与结构新鲜度守卫 ([7051006](https://github.com/CaoMeiYouRen/caomei-ui/commit/7051006))
* **docs:** 新增锚点与侧栏分区不变式守卫 ([158a1ea](https://github.com/CaoMeiYouRen/caomei-ui/commit/158a1ea))
* **governance:** M4 质量门与文档守卫 ([0591cad](https://github.com/CaoMeiYouRen/caomei-ui/commit/0591cad))
* **governance:** 新增同规则重复声明守卫并清理死声明残留 ([6b2ac42](https://github.com/CaoMeiYouRen/caomei-ui/commit/6b2ac42))
* **governance:** 新增尺寸档位选择器归一守卫 ([e96903e](https://github.com/CaoMeiYouRen/caomei-ui/commit/e96903e))
* **governance:** 新增治理索引与历史规划指针守卫 ([3173e2e](https://github.com/CaoMeiYouRen/caomei-ui/commit/3173e2e))
* **governance:** 新增蒸馏计数对账守卫并接入门禁 ([02b29fd](https://github.com/CaoMeiYouRen/caomei-ui/commit/02b29fd))
* **governance:** 新增规划编号守卫拦截注释与测试名编号 ([e95b547](https://github.com/CaoMeiYouRen/caomei-ui/commit/e95b547))
* **governance:** 新增计算样式取证装置并接入周级回归 ([7575375](https://github.com/CaoMeiYouRen/caomei-ui/commit/7575375))
* **styles:** 改用逐模块产物与 CSS 注入并调整样式入口 ([a869b8f](https://github.com/CaoMeiYouRen/caomei-ui/commit/a869b8f))

### 🐛 Bug 修复

* **docs:** 修正 11 处 VitePress 断锚并补 §11 登记缺口 ([9167eaf](https://github.com/CaoMeiYouRen/caomei-ui/commit/9167eaf))
* **docs:** 修正文档完整性守卫的阶段归档误报 ([b88d6e3](https://github.com/CaoMeiYouRen/caomei-ui/commit/b88d6e3))

### 📦 代码重构

* **components:** 尺寸档位块归一到 :where() 并改由基类回退消费 ([046c53e](https://github.com/CaoMeiYouRen/caomei-ui/commit/046c53e))
* **components:** 触发器收敛为本库包装组件并启用 unstyled ([72fa5aa](https://github.com/CaoMeiYouRen/caomei-ui/commit/72fa5aa))
* **styles:** 归一化档位与变体声明并 token 化层级 ([ad0eae7](https://github.com/CaoMeiYouRen/caomei-ui/commit/ad0eae7))

### 💥 BREAKING CHANGES

* **styles:** 移除 caomei-ui/styles.css 子路径导出，改用 caomei-ui/theme.css
（基础层）。产物不再提供单体全量样式，组件样式随模块自带；基础层需显式引入或
由 resolver / Nuxt 模块注入。产物以打包器消费为前提，裸 Node ESM 不能直接导入。

# [0.1.0](https://github.com/CaoMeiYouRen/caomei-ui/compare/6b64969...v0.1.0) (2026-09-19)

### ✨ 新功能

* **accordion:** 新增折叠面板组件 ([d2f28bf](https://github.com/CaoMeiYouRen/caomei-ui/commit/d2f28bf))
* **auto-complete:** 新增自动补全组件 ([b71c1d5](https://github.com/CaoMeiYouRen/caomei-ui/commit/b71c1d5))
* **avatar:** 新增头像组件 ([9480c54](https://github.com/CaoMeiYouRen/caomei-ui/commit/9480c54))
* **badge:** 实现徽标组件 ([a4d8946](https://github.com/CaoMeiYouRen/caomei-ui/commit/a4d8946))
* **button-group:** 新增按钮组组件 ([440e152](https://github.com/CaoMeiYouRen/caomei-ui/commit/440e152))
* **button:** 实现 Tier 0 Button 组件 ([8b7c1d1](https://github.com/CaoMeiYouRen/caomei-ui/commit/8b7c1d1))
* **button:** 新增语义色调、胶囊圆角与图标位置 ([5f01b79](https://github.com/CaoMeiYouRen/caomei-ui/commit/5f01b79))
* **button:** 补 badge 角标 ([b13a465](https://github.com/CaoMeiYouRen/caomei-ui/commit/b13a465))
* **calendar:** 新增 CaomeiCalendar 日历组件 ([0fc539f](https://github.com/CaoMeiYouRen/caomei-ui/commit/0fc539f))
* **card:** 新增卡片组件 ([b5e61d3](https://github.com/CaoMeiYouRen/caomei-ui/commit/b5e61d3))
* **checkbox-group:** 新增复选框组容器 ([55e6897](https://github.com/CaoMeiYouRen/caomei-ui/commit/55e6897))
* **checkbox:** 支持数组模型的分组语义 ([32639cf](https://github.com/CaoMeiYouRen/caomei-ui/commit/32639cf))
* **checkbox:** 新增复选框组件 ([c189d6e](https://github.com/CaoMeiYouRen/caomei-ui/commit/c189d6e))
* **color-picker:** 新增颜色选择器组件 ([07c71fa](https://github.com/CaoMeiYouRen/caomei-ui/commit/07c71fa))
* **confirm-dialog:** 支持 icon 并按 tone 回退默认图标 ([f334d86](https://github.com/CaoMeiYouRen/caomei-ui/commit/f334d86))
* **confirm-dialog:** 新增确认对话框组件 ([0a23462](https://github.com/CaoMeiYouRen/caomei-ui/commit/0a23462))
* **confirm:** 新增 useConfirm 确认对话框服务 ([bcbd326](https://github.com/CaoMeiYouRen/caomei-ui/commit/bcbd326))
* **data-table:** 支持冻结列 ([b4bcf65](https://github.com/CaoMeiYouRen/caomei-ui/commit/b4bcf65))
* **data-table:** 支持分页与 Lazy 分页集成 ([644a7a5](https://github.com/CaoMeiYouRen/caomei-ui/commit/644a7a5))
* **data-table:** 支持列能力、排序与加载态 ([5c9d2ed](https://github.com/CaoMeiYouRen/caomei-ui/commit/5c9d2ed))
* **data-table:** 支持按列 key 命名的单元格与表头插槽 ([ef6dd48](https://github.com/CaoMeiYouRen/caomei-ui/commit/ef6dd48))
* **data-table:** 支持行选择 ([a520c5a](https://github.com/CaoMeiYouRen/caomei-ui/commit/a520c5a))
* **data-table:** 新增表格组件与列定义 ([88169df](https://github.com/CaoMeiYouRen/caomei-ui/commit/88169df))
* **data-table:** 透出每页条数选择 ([d6826a9](https://github.com/CaoMeiYouRen/caomei-ui/commit/d6826a9))
* **data-view:** 新增数据视图组件 ([4af9168](https://github.com/CaoMeiYouRen/caomei-ui/commit/4af9168))
* **date-picker:** 支持面板内时间选择 ([e0876e4](https://github.com/CaoMeiYouRen/caomei-ui/commit/e0876e4))
* **date-picker:** 新增 CaomeiDatePicker 日期选择器 ([a514ce6](https://github.com/CaoMeiYouRen/caomei-ui/commit/a514ce6))
* **dialog:** 支持 showHeader、title 可选化、hide 与 breakpoints ([daf09ce](https://github.com/CaoMeiYouRen/caomei-ui/commit/daf09ce))
* **dialog:** 补全对话框组件 ([44ddf1c](https://github.com/CaoMeiYouRen/caomei-ui/commit/44ddf1c))
* **divider:** 新增分隔线组件 ([8496d4a](https://github.com/CaoMeiYouRen/caomei-ui/commit/8496d4a))
* **docs-site:** 演示区 opt-in 恢复入场退出动画 ([0c59f16](https://github.com/CaoMeiYouRen/caomei-ui/commit/0c59f16))
* **docs:** 接入 demo 渲染与 API 自动生成并新增 Button 样板页 ([428901e](https://github.com/CaoMeiYouRen/caomei-ui/commit/428901e))
* **docs:** 组件 API 元数据开发期热更新 ([d4da879](https://github.com/CaoMeiYouRen/caomei-ui/commit/d4da879))
* **drawer:** 新增四向侧滑抽屉组件 ([4e3922f](https://github.com/CaoMeiYouRen/caomei-ui/commit/4e3922f))
* **dropdown-menu:** 支持 model 项模型与 Trigger 外观豁免 ([b3b9b1a](https://github.com/CaoMeiYouRen/caomei-ui/commit/b3b9b1a))
* **dropdown-menu:** 新增下拉菜单组件骨架 ([9317f81](https://github.com/CaoMeiYouRen/caomei-ui/commit/9317f81))
* **dropdown-menu:** 新增条目、分组、勾选与单选部件 ([26199b3](https://github.com/CaoMeiYouRen/caomei-ui/commit/26199b3))
* **file-upload:** 支持上传模式、大小上限与自定义上传 ([9714107](https://github.com/CaoMeiYouRen/caomei-ui/commit/9714107))
* **file-upload:** 新增文件上传组件 ([ab706d4](https://github.com/CaoMeiYouRen/caomei-ui/commit/ab706d4))
* **form:** 新增输入框组合与浮动标签组件 ([4b4f91c](https://github.com/CaoMeiYouRen/caomei-ui/commit/4b4f91c))
* **governance:** 新增审计协议单点声明守卫 ([43b7b53](https://github.com/CaoMeiYouRen/caomei-ui/commit/43b7b53))
* **governance:** 新增文档完整性机检守卫并接入 docs:check ([304370a](https://github.com/CaoMeiYouRen/caomei-ui/commit/304370a))
* **i18n:** 新增 CaomeiConfigProvider 与 useLocale 注入机制 ([afcd8f4](https://github.com/CaoMeiYouRen/caomei-ui/commit/afcd8f4))
* **image:** 新增 preview 点击放大与遮罩 ([62672dd](https://github.com/CaoMeiYouRen/caomei-ui/commit/62672dd))
* **image:** 新增图片组件 ([305082f](https://github.com/CaoMeiYouRen/caomei-ui/commit/305082f))
* **input-number:** 实现数字输入框组件 ([ff887f2](https://github.com/CaoMeiYouRen/caomei-ui/commit/ff887f2))
* **input-number:** 支持分组与小数位配置 ([3ba2e76](https://github.com/CaoMeiYouRen/caomei-ui/commit/3ba2e76))
* **input:** 新增 Tier 0 输入框组件 CaomeiInput 与文档示例 ([dfdcf5b](https://github.com/CaoMeiYouRen/caomei-ui/commit/dfdcf5b))
* **locale:** 新增日文内建文案 ([8f230e7](https://github.com/CaoMeiYouRen/caomei-ui/commit/8f230e7))
* **locale:** 新增繁体中文内建文案 ([bd34117](https://github.com/CaoMeiYouRen/caomei-ui/commit/bd34117))
* **locale:** 新增韩文内建文案 ([e2bd99b](https://github.com/CaoMeiYouRen/caomei-ui/commit/e2bd99b))
* **locale:** 注册五语内建文案并补键集合守卫 ([e2ef930](https://github.com/CaoMeiYouRen/caomei-ui/commit/e2ef930))
* **locale:** 补 checkbox.selectAll 内建文案 ([38860b8](https://github.com/CaoMeiYouRen/caomei-ui/commit/38860b8))
* **locale:** 补 multiSelect.clear 与 pagination.rowsPerPage 内建文案 ([29044c1](https://github.com/CaoMeiYouRen/caomei-ui/commit/29044c1))
* **message:** 支持 simple 变体与 size 尺寸 ([2d6daca](https://github.com/CaoMeiYouRen/caomei-ui/commit/2d6daca))
* **message:** 新增提示条组件 ([4121ee4](https://github.com/CaoMeiYouRen/caomei-ui/commit/4121ee4))
* **multi-select:** 支持对象选项字段映射与非字符串值 ([df6fdcc](https://github.com/CaoMeiYouRen/caomei-ui/commit/df6fdcc))
* **multi-select:** 新增多选选择器组件 ([5490b34](https://github.com/CaoMeiYouRen/caomei-ui/commit/5490b34))
* **multi-select:** 补 #option 插槽与 showClear ([45fa047](https://github.com/CaoMeiYouRen/caomei-ui/commit/45fa047))
* **nuxt:** 实现 caomei-ui/nuxt 模块真实集成 ([1a00524](https://github.com/CaoMeiYouRen/caomei-ui/commit/1a00524))
* **nuxt:** 新增 primary-foreground 语义别名 ([edc996c](https://github.com/CaoMeiYouRen/caomei-ui/commit/edc996c))
* **nuxt:** 新增最小 Nuxt 消费冒烟 fixture 与校验脚本 ([f9201b8](https://github.com/CaoMeiYouRen/caomei-ui/commit/f9201b8))
* **paginator:** 新增分页组件 ([803390f](https://github.com/CaoMeiYouRen/caomei-ui/commit/803390f))
* **paginator:** 补每页条数选择 ([f14d49b](https://github.com/CaoMeiYouRen/caomei-ui/commit/f14d49b))
* **password:** 支持 feedback 强度反馈 ([f9a7336](https://github.com/CaoMeiYouRen/caomei-ui/commit/f9a7336))
* **password:** 新增密码输入框组件 ([07a6de8](https://github.com/CaoMeiYouRen/caomei-ui/commit/07a6de8))
* **popover:** Trigger 增加 unstyled 外观豁免 ([c66e398](https://github.com/CaoMeiYouRen/caomei-ui/commit/c66e398))
* **popover:** 新增浮层组件 ([efad9e6](https://github.com/CaoMeiYouRen/caomei-ui/commit/efad9e6))
* **progress-bar:** 新增进度条组件 ([f44b938](https://github.com/CaoMeiYouRen/caomei-ui/commit/f44b938))
* **progress-spinner:** 支持 strokeWidth 并白名单校验 ([2b6cab0](https://github.com/CaoMeiYouRen/caomei-ui/commit/2b6cab0))
* **progress-spinner:** 新增加载指示组件 ([adb6d76](https://github.com/CaoMeiYouRen/caomei-ui/commit/adb6d76))
* **radio-group:** 新增单选组组件 ([ce25973](https://github.com/CaoMeiYouRen/caomei-ui/commit/ce25973))
* **select-button:** 支持对象选项字段映射与非字符串值 ([2e03aa5](https://github.com/CaoMeiYouRen/caomei-ui/commit/2e03aa5))
* **select-button:** 新增分段选择组件 ([5ef3cac](https://github.com/CaoMeiYouRen/caomei-ui/commit/5ef3cac))
* **select:** 实现选择器组件 ([b229130](https://github.com/CaoMeiYouRen/caomei-ui/commit/b229130))
* **select:** 支持 showClear 清空与 #option 自定义选项 ([d2d01ce](https://github.com/CaoMeiYouRen/caomei-ui/commit/d2d01ce))
* **select:** 支持对象选项字段映射与非字符串值 ([dbd6418](https://github.com/CaoMeiYouRen/caomei-ui/commit/dbd6418))
* **session:** 引入 .session 任务态与 wisdom 蒸馏脚本 ([652a401](https://github.com/CaoMeiYouRen/caomei-ui/commit/652a401))
* **skeleton:** 新增骨架屏组件 ([fbd9a97](https://github.com/CaoMeiYouRen/caomei-ui/commit/fbd9a97))
* **slider:** 新增滑块组件 ([e22f817](https://github.com/CaoMeiYouRen/caomei-ui/commit/e22f817))
* **split-button:** 新增分裂按钮组件 ([9bc70f4](https://github.com/CaoMeiYouRen/caomei-ui/commit/9bc70f4))
* **stepper:** 新增步骤条组件 ([3be1edf](https://github.com/CaoMeiYouRen/caomei-ui/commit/3be1edf))
* **styles:** 为 InputNumber 与 Select 增加可覆盖的默认最大宽度 ([8a549c3](https://github.com/CaoMeiYouRen/caomei-ui/commit/8a549c3))
* **switch:** 补 change 事件 ([d3ddf84](https://github.com/CaoMeiYouRen/caomei-ui/commit/d3ddf84))
* **switch:** 补齐开关组件封装、文档与测试 ([8a23d1e](https://github.com/CaoMeiYouRen/caomei-ui/commit/8a23d1e))
* **tabs:** 新增选项卡组件 ([a7d24e4](https://github.com/CaoMeiYouRen/caomei-ui/commit/a7d24e4))
* **tag:** 实现标签组件 ([35bab11](https://github.com/CaoMeiYouRen/caomei-ui/commit/35bab11))
* **tag:** 支持 rounded 胶囊形态 ([e8aa2d8](https://github.com/CaoMeiYouRen/caomei-ui/commit/e8aa2d8))
* **textarea:** 支持 autoResize 自动增高 ([0ef6178](https://github.com/CaoMeiYouRen/caomei-ui/commit/0ef6178))
* **textarea:** 新增 Tier 0 多行输入组件 CaomeiTextarea 与文档示例 ([864da55](https://github.com/CaoMeiYouRen/caomei-ui/commit/864da55))
* **theme:** 落地 caomei / momei 品牌预设与暗色机制 ([59fcee5](https://github.com/CaoMeiYouRen/caomei-ui/commit/59fcee5))
* **theme:** 默认主色改蓝并将实底前景统一到 on-solid ([d4e4725](https://github.com/CaoMeiYouRen/caomei-ui/commit/d4e4725))
* **toast:** 新增轻提示组件与 useToast 服务 ([9accc00](https://github.com/CaoMeiYouRen/caomei-ui/commit/9accc00))
* **toggle-button:** 新增开关按钮组件 ([c006414](https://github.com/CaoMeiYouRen/caomei-ui/commit/c006414))
* **toggle-button:** 补 onLabel / offLabel 两态文案 ([ee989c3](https://github.com/CaoMeiYouRen/caomei-ui/commit/ee989c3))
* **tokens:** 补充 ComponentTone 与语义色、实底色 token ([963e393](https://github.com/CaoMeiYouRen/caomei-ui/commit/963e393))
* **toolbar:** 支持 start / center / end 三分区插槽 ([ba1de50](https://github.com/CaoMeiYouRen/caomei-ui/commit/ba1de50))
* **toolbar:** 新增工具条组件 ([81e6ccc](https://github.com/CaoMeiYouRen/caomei-ui/commit/81e6ccc))
* 补齐组件库骨架并收敛开发环境 ([6b64969](https://github.com/CaoMeiYouRen/caomei-ui/commit/6b64969))

### 🐛 Bug 修复

* **badge:** 单字符徽标按尺寸渲染为正圆 ([ca4be37](https://github.com/CaoMeiYouRen/caomei-ui/commit/ca4be37))
* **button:** 纯图标按钮不再渲染空内容容器 ([329a342](https://github.com/CaoMeiYouRen/caomei-ui/commit/329a342))
* **checkbox, radio-group:** 修正尺寸档位字号被基类覆盖 ([f260d32](https://github.com/CaoMeiYouRen/caomei-ui/commit/f260d32))
* **color-picker:** 修复可访问名本地化、取值同源与色板选中态 ([1982d6c](https://github.com/CaoMeiYouRen/caomei-ui/commit/1982d6c))
* **components:** 收敛日历面板的可用空间上限 ([b9036c6](https://github.com/CaoMeiYouRen/caomei-ui/commit/b9036c6))
* **components:** 收敛横向布局与定宽面板的窄屏表现 ([9b2de72](https://github.com/CaoMeiYouRen/caomei-ui/commit/9b2de72))
* **components:** 收敛浮层面板窄屏宽度 ([bc0d167](https://github.com/CaoMeiYouRen/caomei-ui/commit/bc0d167))
* **data-table:** 消除选中行导致的 1px 行高抖动 ([46e20b5](https://github.com/CaoMeiYouRen/caomei-ui/commit/46e20b5))
* **date-picker:** 为触发按钮补默认宽度上限 ([45765eb](https://github.com/CaoMeiYouRen/caomei-ui/commit/45765eb))
* **dialog:** 修正媒体查询范围记法 ([8f3ae31](https://github.com/CaoMeiYouRen/caomei-ui/commit/8f3ae31))
* **docs:** Image 错误态示例改用不可解码 data URI ([5713775](https://github.com/CaoMeiYouRen/caomei-ui/commit/5713775))
* **docs:** 修复 M2 验证记录中指向仓库外的死链 ([c4fb0ad](https://github.com/CaoMeiYouRen/caomei-ui/commit/c4fb0ad))
* **docs:** 修复 reduced-motion 下加载指示演示静止 ([9ec3b41](https://github.com/CaoMeiYouRen/caomei-ui/commit/9ec3b41))
* **docs:** 文档站按页面语言注入组件内建文案 ([b865ec5](https://github.com/CaoMeiYouRen/caomei-ui/commit/b865ec5))
* **docs:** 语言切换回切对应翻译页而非固定回首页 ([d525155](https://github.com/CaoMeiYouRen/caomei-ui/commit/d525155))
* **input-group:** 修复 Select 成员在组合中的圆角与宽度失配 ([b681a4a](https://github.com/CaoMeiYouRen/caomei-ui/commit/b681a4a))
* **input-number:** 收窄 precision 取值域并修复取整溢出 ([06b31db](https://github.com/CaoMeiYouRen/caomei-ui/commit/06b31db))
* **input:** 修正 invalid 聚焦边框被 primary 覆盖 ([a1d46ac](https://github.com/CaoMeiYouRen/caomei-ui/commit/a1d46ac))
* **lint:** 忽略 VitePress 构建中间产物 ([521d52f](https://github.com/CaoMeiYouRen/caomei-ui/commit/521d52f))
* **paginator:** 修正 hover 选择器写法以通过 stylelint ([98d16bc](https://github.com/CaoMeiYouRen/caomei-ui/commit/98d16bc))
* **select:** 展开时不锁定页面滚动 ([a1183e5](https://github.com/CaoMeiYouRen/caomei-ui/commit/a1183e5))
* **toggle-button:** 修正尺寸档位内边距被宿主样式覆盖 ([31d626f](https://github.com/CaoMeiYouRen/caomei-ui/commit/31d626f))

### 📦 代码重构

* **checkbox:** label 统一为可访问名，可见文本改用 text ([4dd9714](https://github.com/CaoMeiYouRen/caomei-ui/commit/4dd9714))
* **components:** 抽取 useFocusControl 统一聚焦控制 ([ab9be57](https://github.com/CaoMeiYouRen/caomei-ui/commit/ab9be57))
* **components:** 抽取 useLabelAttrs 统一标签属性转发 ([69ae005](https://github.com/CaoMeiYouRen/caomei-ui/commit/69ae005))
* **components:** 抽取表单控件公共 props 契约 ([a7f9230](https://github.com/CaoMeiYouRen/caomei-ui/commit/a7f9230))
* **components:** 收敛标签属性转发到 useLabelAttrs 基座形态 ([c96966d](https://github.com/CaoMeiYouRen/caomei-ui/commit/c96966d))
* **components:** 收敛模板级 aria-label 转发契约 ([409c8ce](https://github.com/CaoMeiYouRen/caomei-ui/commit/409c8ce))
* **components:** 统一全库 label 优先级契约 ([18c45be](https://github.com/CaoMeiYouRen/caomei-ui/commit/18c45be))
* **components:** 统一根可访问控件的 label 优先级 ([b7d9613](https://github.com/CaoMeiYouRen/caomei-ui/commit/b7d9613))
* **components:** 表单控件公共 props 契约第二批 ([69cfece](https://github.com/CaoMeiYouRen/caomei-ui/commit/69cfece))
* **components:** 迁移其余组件的标签属性转发 ([b1ba958](https://github.com/CaoMeiYouRen/caomei-ui/commit/b1ba958))
* **i18n:** 反馈浮层类组件消费注入 locale（批次二） ([f11312e](https://github.com/CaoMeiYouRen/caomei-ui/commit/f11312e))
* **i18n:** 数据展示类组件消费注入 locale（批次三） ([0a6bc61](https://github.com/CaoMeiYouRen/caomei-ui/commit/0a6bc61))
* **i18n:** 表单类组件消费注入 locale（批次一） ([e70bb77](https://github.com/CaoMeiYouRen/caomei-ui/commit/e70bb77))
* **input-number:** 迁移为封装 Reka UI NumberField ([c5238db](https://github.com/CaoMeiYouRen/caomei-ui/commit/c5238db))
* **input:** 抽取 useAttrForwarding 共享 attrs 透传 ([0afd6e5](https://github.com/CaoMeiYouRen/caomei-ui/commit/0afd6e5))
* **styles:** 归并禁用态 0.5 档至语义 token ([5e1caf2](https://github.com/CaoMeiYouRen/caomei-ui/commit/5e1caf2))
* **styles:** 收敛禁用态不透明度至语义 token ([89f9f6c](https://github.com/CaoMeiYouRen/caomei-ui/commit/89f9f6c))
* **styles:** 迁移阴影与遮罩至 token 并收紧预算 ([c51eef8](https://github.com/CaoMeiYouRen/caomei-ui/commit/c51eef8))

### 💥 BREAKING CHANGES

* **checkbox:** Checkbox 的 label 由可见标签文本改为可访问名，可见标签请改用 text。组件尚未发布，无下游影响。
