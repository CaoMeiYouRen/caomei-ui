# M2-1 重量级组件质量盘点（Phase 11）

- 类型：质量盘点和门槛判定（只读取证 + 优化候选清单）
- 触发：Phase 11 M2-1 条目——对重量级组件固定清单做「样式 + 交互」盘点，并按门槛判定既有候选（ColorPicker 色板导航增强 / AutoComplete 严格选项模式）
- 关联：[待办事项归档 M2](../../plan/todo-archive.md) ｜ [CSS 按需引入评估 §7.2](./2026-09-20-css-on-demand-evaluation.md)（固定清单门槛来源）｜ [开发规范 §7](../../standards/development.md) ｜ [设计规范](../design-spec.md)
- 取证环境：主库 caomei-ui @ `5111b90`（工作区干净）；下游快照 momei @ `47cad194`（只读）；日期 2026-09-20
- 固定清单（依 [CSS 评估 §7.2](./2026-09-20-css-on-demand-evaluation.md) 批次 2 门槛「逐个 ≥ 4.5 KB 且不在 §2.6 依赖图中」）：auto-complete / drawer / multi-select / stepper / toolbar / file-upload / color-picker

## 1. 结论速览

| 项 | 结论 |
| --- | --- |
| 下游用量（7 组件） | **均在 momei 有真实用量**（PrimeVue 写法）：AutoComplete 2 / Drawer 3 / MultiSelect 8 / Stepper 1 / Toolbar 1 / FileUpload 1 / ColorPicker 2（文件数见 §2）。**Caomei 写法 0 命中**——momei 侧迁移尚未开工 |
| 候选「ColorPicker 色板导航增强」 | **不达标**：`swatches` **0 命中**、无键盘密集场景 → 留 [Backlog](../../plan/backlog.md)，触发条件不变 |
| 候选「AutoComplete 严格选项模式」 | **部分达标，需用户裁定**：受控字段用例成立（`translationId` 1 处，值须指向已有文章，且下游未用 `forceSelection`），但诉求为隐式；新增 props 属契约变更（门槛 ② 要求登记 + 用户确认）。**我的建议：暂不纳入**（本库自由文本为有意设计，差异已登记），触发条件细化为「下游明确要求限制取值 / 迁移实测暴露脏引用」 |
| 盘点发现的具体缺陷 | **2 类真实缺陷 + 3 类待收敛项**（§3），直接构成 M2-2 / M2-3 的实施清单 |
| 已达标项 | 7 组件样式块**无原始色值**（`check:design` 已覆盖）、**无 `opacity` 字面量**（前序批次已收敛）、**无 `!important`** |

## 2. 下游用量取证（momei @ `47cad194`）

命令口径：`cd /root/projects/momei && rg -n -g '!node_modules' -g '!.nuxt' -g '!dist' -g '!coverage' -g '!artifacts' -- '<模式>' .`

| 组件 | PrimeVue 写法命中 | 文件数 | Caomei 写法 | 代表位置 |
| --- | :-: | :-: | :-: | --- |
| AutoComplete | 2 | 1 | 0 | `components/admin/posts/post-editor-settings.vue:49,124` |
| Drawer | 3 | 3 | 0 | `components/app-header.vue:224`、`admin/posts/post-history-panel.vue:2`、`admin/users/user-sessions-drawer.vue:2` |
| MultiSelect | 8 | 4 | 0 | `admin/marketing-campaign-form.vue:64,79`、`admin/settings/ai-alert-thresholds-editor.vue:31,47,141` 等 |
| Stepper | 1 | 1 | 0 | `pages/installation.vue:72` |
| Toolbar | 1 | 1 | 0 | `components/admin/users/user-filters.vue:2` |
| FileUpload | 1 | 1 | 0 | `components/settings/settings-profile.vue:19` |
| ColorPicker | 2 | 2 | 0 | `admin/settings/theme-color-field.vue:12`、`theme-preview-section.vue:65` |

### 2.1 候选门槛判定（M2-1 门槛：① 下游实测用量 ≥ 1 处；② 不引入未登记的对外契约变更）

| 候选 | ① 用量 | ② 契约 | 判定与处置 |
| --- | --- | --- | --- |
| ColorPicker 色板导航增强（`radiogroup` + roving tabindex） | **0**（`swatches` 0 命中；键盘事件共 **25 行 / 9 文件**，逐条核对与色板无关） | 会新增键盘行为契约 | **不达标 → 留 Backlog**（触发条件不变，仅更新取证快照） |
| AutoComplete 严格选项模式 | **1**（`post-editor-settings.vue:49-59` 的 `translationId`：`v-model` + 自由文本 + `@complete` + `option-value`；值语义须指向已有文章，见 `types/post-version.ts:34` 与 `pages/admin/posts/index.vue:375`；`forceSelection` 全仓 0 命中） | 需新增 props（`strict` / `forceSelection` 一类）→ 属**对外契约变更** | **① 达标 / ② 需登记与用户确认** → 记录结论 + **建议暂不纳入**（理由：本库自由文本为有意设计、与 PrimeVue 的差异已登记[设计规范 §7](../design-spec.md)；下游未表达限制输入诉求）。**待用户裁定** |

## 3. 盘点发现（7 组件样式 + 交互，逐条含证据）

### 3.1 真实缺陷（建议同批修正）

| # | 缺陷 | 证据 | 影响 |
| :-: | --- | --- | --- |
| D1 | **同属性重复声明（死声明）**：同一规则内先写 token 色阴影、后写 `color-mix` 阴影，前者恒被覆盖 | `auto-complete.vue:403-404`、`413-414`；`multi-select.vue:269-270`、`279-280` | 死代码；后续调色时易误改被覆盖的那条 |
| D2 | **基类预声明 CSS 变量默认值**（违反 [开发规范 §7](../../standards/development.md)「基类不预声明默认值、消费处 `var(--x, fallback)`」） | `drawer.vue:124` `--caomei-drawer-size: 420px`；`drawer.vue:115`、`:125` `--caomei-drawer-duration: 200ms` | 消费方覆盖成本上升 |
| D3 | **档位类未用 `:where()`**（同规范「档位类用 `:where()` 归零特异性」） | `drawer.vue:140` `--sm` / `:144` `--md` / `:148` `--lg` 均为普通类 | 档位类以 (0,1,0) 参与层叠，覆盖难度高于规范预期 |
| D4 | **`:where()` 档位块内直接声明几何属性**——**定性更正（实施前枚举发现）**：库内暂无与之竞争的规则，故当前档位样式**是生效的**；风险是**潜在**的（`:where()` 特异性为 0，**任何特异性 > 0 的规则**——含元素选择器 `(0,0,1)` 与消费方覆盖——都会静默压过它；仓库内先例见 `src/components/toggle-button/toggle-button.vue:44-46` 的注释），且规范要求「档位只声明 CSS 变量」。**可复算口径**：对基类块扫 `min-height|padding|font-size`均为 0 命中——`rg -n 'min-height|padding|font-size' src/components/auto-complete/auto-complete.vue`（基类块`:384-399`）与`src/components/multi-select/multi-select.vue`（基类块`:250-265`） | auto-complete `:423-427`/`:429-433`/`:435-439`（`min-height` / `padding` / `font-size`）；multi-select `:289-293`/`:295-299`/`:301-305`（同上） | 修复属**等价重构**（`todo.md` M2-2 验收即「组件计算样式零漂移」），**不是**「无效 → 生效」的视觉变更 |

### 3.2 待收敛项（M2-3 范围）

| # | 项 | 证据 |
| :-: | --- | --- |
| Z1 | `z-index` 字面量 5 处（无 `--caomei-z-*` token） | `auto-complete.vue:562` `1000`；`drawer.vue:118` `1000`、`:128` `1001`；`multi-select.vue:411` `1000`；`color-picker.vue:191` `1001` |
| Z2 | 禁用态 `opacity` 字面量**已清零**，但**无回归守卫**（`check:design` 无 `opacity` 规则） | 7 组件 `rg 'opacity:\s*0?\.[0-9]+'` → 0 命中；`scripts/governance/check-design.mjs` 无 opacity 匹配 |

### 3.3 其他观察（记录不处理）

- portal 面板用**非 scoped** 样式块（`auto-complete.vue:559`、`multi-select.vue:408`、`color-picker.vue:189`）并在其中声明 `overflow: hidden`（`:563` / `:412`）——属既有设计，**不在本阶段改动**。
- 硬编码阴影几何但颜色走 token / `color-mix`（`auto-complete.vue:576`、`color-picker-panel.vue:233,295`）——`check:design` 预算内，**不改**。

## 3.5 实施前枚举（2026-09-20，范围决策依据）

实施方（`@frontend-developer`）在动手前按要求做了全量枚举，发现**同一缺陷类远超本记录 §3 列出的消费点**，据此暂停并上报（正确做法）：

| 规则面（拟） | 登记范围内 | 枚举出的额外消费点 | 影响 |
| --- | --- | --- | --- |
| **G1**：`:where()` **档位/变体块**内不得直接声明属性 | auto-complete、multi-select、message | **select**（`__field--sm/md/lg` 的 `font-size`，`select.vue:260/267/274`）、**select-button**（`height` / `padding` / `font-size` / `min-height`，`select-button.vue:189/193/197/221/230/239/225-226/234-235/243-244`） | 预算 0 必须连带收敛这 2 个组件 |
| **G2**：`--caomei-<comp>-*` 声明必须含 `:where(` | button、message、badge、tag、toast、drawer | **dialog**（`dialog.vue:163/186/190/194`，与 drawer 完全同型）、**confirm-dialog**（`:161`）、**radio-group**（`:102/103`） | 预算 0 必须连带收敛这 3 个组件 |
| **G4**：数字 `z-index` | 7 组件的 5 处 | **全量 15 处数字字面量 + 6 处变量 / 回退**；其中 **10 处属浮层层（≥1000）**（dialog / confirm-dialog / select / auto-complete / multi-select / drawer / color-picker，值 1000 / 1001），**5 处属局部层叠**（`1`：button-group / float-label / input-group 的 focus-within 抬升；`2`/`3`：data-table 冻结列）；6 处变量 / 回退为 date-picker `1050` / dropdown-menu `1050` / popover `1050` / image `1100` 与 `calc(… + 1)` / toast `1100` | token 设计需区分子语义层；局部层叠不宜混入浮层层 |
| **G3**：`opacity` 字面量 | 预期 0 | 0（禁用态）✓；`skeleton.vue:129` 的 `0.5` 在 `@keyframes` 内，**须排除**否则误报 | 规则需跳过关键帧块 |

**可复算命令（momei @ `47cad194`，只读）**

```bash
cd /root/projects/momei
# 色板功能开关用量
git grep -n "swatches" -- ':!node_modules' ':!.nuxt' | wc -l      # → 0
# 键盘事件总量（用于判断是否存在「键盘密集」迹象）
git grep -nE "keydown|keyup|keypress" -- ':!node_modules' ':!.nuxt' ':!dist' ':!coverage' ':!artifacts' | wc -l   # → 25 行
git grep -lE "keydown|keyup|keypress" -- ':!node_modules' ':!.nuxt' ':!dist' ':!coverage' ':!artifacts' | wc -l   # → 9 文件
# 其中与色板相关者
git grep -niE "keydown|keyup|keypress" -- ':!node_modules' ':!.nuxt' ':!dist' ':!coverage' ':!artifacts' | grep -ci "color\|swatch"   # → 0
```

> 口径说明：`25 行 / 9 文件` 为上述命令的**行数**口径（同一行多处命中按 1 计）；「与色板相关 0」由第三条命令直接判定。原稿曾写「35 处」但未给口径，已按上表更正。

**规则面收窄建议（避免误报）**：G1 只针对「**首个复合选择器**为 `:where(.caomei-<comp>[__<el>]--<variant>)`」的档位 / 变体块——**既含 BEM 块修饰符**（`:where(.caomei-select-button--sm)`）**也含元素修饰符**（`:where(.caomei-select__field--sm)`，`select.vue:256/263/270`）**与后代限定形态**（如 `:where(.caomei-select-button--sm) .caomei-select-button__item`，`select-button.vue:224-226 / 233-235 / 242-244`），否则会漏检已登记消费点——`data-table` / `tabs` / `stepper` / `skeleton` 的 `:where()` 属**结构型低特异性布局覆盖**，不属档位变量块；G2 只针对**组件自身命名空间**的变量，排除跨组件传参（paginator 传 `--caomei-select-max-width`）与全局 token 覆写（confirm-dialog 的 `--caomei-color-*`）。

> 范围影响：G1 / G2 全量收敛将连带改动 **select、select-button、dialog、confirm-dialog、radio-group 共 5 个组件**，超出 [待办事项归档](../../plan/todo-archive.md) M2-2 的行文枚举（其验收要求「`check:design` 扩展后可阻断回流」，预算 0 下无法只改登记面）。**属范围扩张，须用户裁定**（选项见 §7）。

## 4. 由盘点产生的实施清单（移交 M2-2 / M2-3）

| 目标条目 | 实施内容 | 依据 |
| --- | --- | --- |
| **M2-2** | ① 修 D2 / D3（drawer 基类改 fallback + 档位类 `:where()`）；② 修 D4（auto-complete / multi-select 档位改为「只声明 CSS 变量、基类以 `var(--x, fallback)` 消费」）；③ 收敛登记的 `button` 基类预声明与 `message`/`badge`/`tag`/`toast` 档位类偏差；④ `check:design` 扩展：**档位块直接声明属性**与**基类预声明**两类机检 + 正反例单测 | §3.1、[Backlog](../../plan/backlog.md) 的 scoped 变量声明治理行与样式档位死声明守护行 |
| **M2-3** | ① 修 D1（4 处死声明清理）；② 新增 `--caomei-z-*` token 并收敛 Z1 的 5 处字面量；③ `check:design` 扩展：`opacity` 与 `z-index` 预算守卫 + 正反例单测 | §3.1 D1、§3.2 |

> **与长期任务的交叉核对**（2026-09-20）：[长期任务 §2.2「样式重复收敛」](../../plan/recurring.md) 的门槛是「同一视觉效果在 ≥3 个组件重复，且已存在或可归纳为语义 token」，其候选池当前仅「Input 家族样式层共享」；本记录的 G1 / G2 / G4 属**声明方式与层叠层级治理**（非「同一视觉效果重复」），**与该任务无重叠**，故由 M2-2 / M2-3 承载、不新增长期任务批次。

## 5. 未覆盖边界

1. **交互面仅做证据化观察**：未做键盘 / 焦点 / a11y 的实测回归（属 `@ui-validator` 与常驻 E2E 范畴）；本次未发现需立即处理的交互缺陷，**不等于**已完成交互验收。
2. 文字类盘点未逐行通读全部 8 个 stepper 子组件样式（仅按 §3 的 4 类规则扫描）。
3. momei 用量为**迁移前快照**（PrimeVue 写法）；迁移后 Caomei 写法用量可能变化，届时需重新取证。
4. 门槛判定 ② 的「未登记契约变更」在本记录按「新增 props 即需登记 + 用户确认」理解；若用户对其他口径有不同认定，以用户裁定为准。

## 6. 状态

2026-09-20：M2-1 **已产出**——7 组件用量与质量取证完成（含证据命令与行号），两候选门槛判定落定（ColorPicker 不达标、AutoComplete 部分达标待用户裁定）。盘点发现的 D1~D4 与 Z1~Z2 已转为 M2-2 / M2-3 实施清单（§4），按该清单推进。

## 7. 待用户裁定（M2-2 / M2-3 范围）

| 选项 | 内容 | 代价 |
| --- | --- | --- |
| **A（实施方与本记录均推荐）** | 按同一缺陷类**全量收敛**：G1 含 select / select-button；G2 含 dialog / confirm-dialog / radio-group；G4 建 `--caomei-z-*` 并覆盖**全部 21 处**——浮层层（10 处字面量 + 6 处变量 / 回退）沿用[设计规范 §2.5](../design-spec.md) 已登记的 `--caomei-z-dropdown/-sticky/-overlay/-modal/-toast/-tooltip` 词表；**局部层叠档（`1` / `2` / `3` 共 5 处）另立 `--caomei-z-raise` / `--caomei-z-pinned` 一类 token，并在设计规范 §2.5 词表补登**（否则与 M2-3 登记的「浮层 z-index」验收面不一致，需一并让渡） | 触及 5 个登记外组件（同一缺陷类，与既有「禁用态 token 全量收敛 37 处」先例一致）；G4 需同步设计规范 §2.5 词表；规模超[规划规范 §5](../../standards/planning.md) 的文件阈值，按「单语义跨全部消费点、拆分会产生不可绿中间态」申请豁免 |
| B | 严格只改登记面（G1 仅 auto-complete / multi-select / message；G2 仅 button / message / badge / tag / toast / drawer；G4 仅浮层 10 处字面量），G1 / G2 / G4 降级为 warning 通道 + 基线计数 | 与 M2-2 验收「`check:design` 扩展后可**阻断**回流」冲突（需用户同意修改该验收措辞）；且存在**残留不一致**：select / select-button / dialog / confirm-dialog / radio-group 与登记面同缺陷却留存，局部层叠 5 处不入 token 词表 |

**建议：选 A** —— G1 / G2 规则一旦落地，预算 0 是唯一可维护形态（warning 通道会被忽略）；且 dialog / confirm-dialog 与 drawer 是同型缺陷，只修一半会留下「同缺陷两套写法」。

**用户裁定（2026-09-20）**：① **选 A（全面收敛）**——G1 / G2 / G4 按 §3.5 的扩张面执行，并将局部层叠 token 补登[设计规范 §2.5](../design-spec.md)；已在 [待办事项归档 M2](../../plan/todo-archive.md) 登记范围扩张。② **AutoComplete 严格选项模式：纳入**——登记为 [待办事项归档](../../plan/todo-archive.md) **M3-5**（组件能力增强，非 M2 范围：M2 非目标明确「不改组件公开 props」），Backlog 对应候选已迁出。
