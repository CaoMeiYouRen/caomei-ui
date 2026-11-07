# Phase 28 M4-1 调研：图标体系接入、替换与迁移

> 创建时间：2026-11-07
> 条目：M4-1「图标体系调研（只调研）」。
> 口径来源：[Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §2；[下一阶段范围评估（第十二轮）](./2026-11-07-next-stage-scope-evaluation-12.md) §3.1 A-3。
> **边界：零实现、零依赖引入、零 `src/**` 改动**；本记录是图标体系的调研口径与实现候选唯一载体，Backlog §1.9 只引用本记录。

## 1. 现状取证（2026-11-07 HEAD `a19b3f1`）

| 项 | 读数 | 取证 |
|:---|:---|:---|
| 图标组件 | `CaomeiIcon`：`{ icon: Component, size?: number \| string = '1em' }`；`.caomei-icon` 为 `inline-block` + `flex-shrink: 0` + `vertical-align: -0.125em` | `src/icons/icon.vue` / `src/icons/types.ts` |
| 内置图标集 | `@lucide/vue`（声明 `^1.48.0`，当前安装 **1.54.0**，npm 最新 1.70.0；ISC） | `package.json` / `node_modules/@lucide/vue/package.json` |
| 引入面 | **25 个文件**有值导入；连同 4 个仅提及的文件（`src/icons/types.ts`、`src/composables/use-confirm.ts`、`src/components/image/types.ts`、`src/components/dropdown-menu/types.ts`）共 **29 个** | `rg "from '@lucide/vue'" src` |
| 去重图标 | **22 个**（`X` 12 处、`ChevronDown` 6、`Check` 5、`ChevronRight` 4、`Info` / `TriangleAlert` 3、`ChevronLeft` / `CircleCheck` / `Eye` / `Minus` 2，其余 1 处） | 逐文件解析 |
| 第三方接入面 | 外部可通过任意 Vue 组件传入 `icon`，或经 `#icon` / `#indicatoricon` 等插槽整块替换；无字符串名、无注册表、无统一覆盖入口 | 组件 props / 插槽 |
| 样式预设 | 设计规范 §2.5「层级 token 与规划新增 token」的规划新增 token（待实现）已登记 `--caomei-icon-size-sm/md/lg`；当前尺寸只靠 `size` prop / 容器 `font-size` | `docs/design/design-spec.md` §2.5（第 121 行） |
| 可访问名 | `CaomeiIcon` **不主动**输出 `aria-hidden` 或 `role`；`@lucide/vue` 图标自带 `aria-hidden="true"`，第三方组件不保证 | `src/icons/icon.vue` |

## 2. ① 第三方图标接入：三态与接口草案

### 2.1 三态比较

| 形态 | 优点 | 缺点 | 结论 |
|:---|:---|:---|:---|
| 组件（现状 `icon?: Component`） | 类型安全、tree-shakable、零运行时依赖、SSR 安全 | 需要 import；字符串配置（后端菜单 / 权限表）无法表达 | **保留为一等形态** |
| 字符串名 + 注册表 | 配置友好、可跨端下发；同一名字可映射不同图标集 | 需要注册表与命名约定；未注册名需开发期告警；SSR 需每请求注册，避免模块级可变全局 | **新增为可选形态** |
| 运行时图标库（Iconify 名 `prefix:name`） | 无需注册、图标集极多 | 运行时依赖 / 网络 / CSP / 离线 / 首屏闪烁；默认不引入 | **仅文档指引，库内不实现** |

### 2.2 接口草案（向后兼容）

```ts
// src/icons/types.ts（草案，未实现）
export interface IconProps {
    /** 直接传组件（现行形态，保持最高优先级） */
    icon?: Component
    /** 注册表中的名称（`icon` 缺省时使用） */
    name?: string
    /** 尺寸；数字按 px，字符串原样（默认 `1em`） */
    size?: number | string
    /** 线宽；仅对 stroke 型图标生效（Lucide / Iconify stroke 集） */
    strokeWidth?: number | string
    /** 有语义时的可访问名；提供后输出 `role="img"` + `aria-label` */
    label?: string
}
```

- `icon` 由必填改为可选（required → optional 属向后兼容），但**运行时至少提供 `icon` / `name` 之一**，否则开发期告警并渲染空占位。实现批可选方案：保留 `icon` 必填并新增独立形态，或改用 `({ icon: Component } | { name: string })` 的 props 联合以保留编译期约束（按 `defineProps` 能力择一，在 I1 文档写明取舍）。
- 解析优先级：`#icon` 插槽（使用方整体替换）> `icon` 组件 > `name` 注册表 > 开发期告警 + 空占位。
- **作用域边界**：`name` 与注册表只由 `CaomeiIcon` 支持；其余公开图标入口（`use-confirm` 的 `icon?: Component`、`dropdown-menu` 的条目 `icon`、`image` 的 `previewIcon`）在 I1 保持 `Component` 形态，并在文档中说明「这些入口不接受字符串名」。如需统一 resolver，须另立子项（不在 I1 规模内）。
- 注册表通过 **provide/inject** 注入（`provideIconRegistry(record)`），不使用模块级可变单例，避免 SSR 跨请求泄漏；Nuxt 模块可提供 `iconRegistry` 配置并自动 provide。
- 可访问名解析优先级：**`label` prop > 透传 attrs 中的任一 `aria-*` / `role` / `title` > 默认 `aria-hidden="true"`**（与 `@lucide/vue` 的 `hasA11yProp` 口径一致：任一 `aria-*` 前缀、`role` 或 `title` 均视为已标注）。即：任一显式语义属性存在时不加 `aria-hidden`，避免「已标注却被 `aria-hidden` 吞掉」；只有完全无标注时才按装饰性图标处理。提供 `label` 时输出 `role="img"` + `aria-label`。需在 I1 单测固化该优先级。

## 3. ② 内置图标可替换（`@lucide/vue` 解耦）

### 3.1 映射面

25 个导入文件（另有 4 个文件仅 JSDoc 提及，合计 29 处引用）、22 个去重图标。建议在 `src/icons/` 下建立**唯一映射表**（如 `internal-icons.ts`），组件只引用映射名（`icons.calendar` / `icons.chevronDown`），不直接 import `@lucide/vue`。映射表按语义命名，便于后续替换为任意图标集：

| 语义名 | 当前 Lucide | 使用文件数 |
|:---|:---|:-:|
| `dismiss` | `X` | 12 |
| `chevronDown` | `ChevronDown` | 6 |
| `check` | `Check` | 5 |
| `chevronRight` | `ChevronRight` | 4 |
| `info` / `warning` / `success` | `Info` / `TriangleAlert` / `CircleCheck` | 3 / 3 / 2 |
| `error`（Message 现值） / `danger`（Toast 现值） | `CircleAlert` / `CircleX` | 1 / 1 |
| `chevronLeft` / `eye` / `minus` | `ChevronLeft` / `Eye` / `Minus` | 2 / 2 / 2 |
| 其余 10 个 | `Calendar` / `ChevronUp` / `ChevronsLeft` / `ChevronsRight` / `CircleDot` / `EyeOff` / `FileUp` / `ImageOff` / `LoaderCircle` / `Plus` | 各 1 |

> 说明：实现批以脚本枚举为准；本表锁定「25 导入文件 / 29 处引用 / 22 图标」三个规模数，以及高频图标的收敛优先级（`X` / `ChevronDown` / `Check` / `ChevronRight`）。**I2 不得跨上下文合并现值**：Message 的 `error` 用 `CircleAlert`、Toast 的 `danger` 用 `CircleX`，二者语义相近但不得统一成同一个图标；视觉回归须覆盖 Message 与 Toast 四语气。

### 3.2 覆盖入口

- **应用级覆盖**：`provideIconOverrides({ close: MyClose, ... })`（合并映射表，未覆盖项保持 Lucide）。
- **不使用字符串类名**：保持现有组件契约（`icon?: Component`），不引入 `pi pi-*` 式类名解析。
- **保留插槽优先级**：组件级 `#icon` / `#indicatoricon` 等仍可整体替换单个实例。
- 风险：映射表若集中 re-export 全部 Lucide 图标，会破坏 tree-shaking；只允许映射表按语义逐项 import，禁止 `export * from '@lucide/vue'`。

## 4. ③ 样式预设与容器联动

| 项 | 建议 | 理由 |
|:---|:---|:---|
| 尺寸 | 实现 `--caomei-icon-size-sm/md/lg`，取值**由字号 token 派生**（如 `calc(var(--caomei-font-size-sm) + 2px)` 一类），不硬编码 px；`CaomeiIcon` 增加可选 `size` 档位类；默认仍 `1em` | 项目存在两套字号档位（12/14/16 与 14/16/18），独立图标若写死 px 会与容器 `1em` 比例漂移；派生可保持比例一致 |
| 线宽 | `--caomei-icon-stroke-width`（默认 `2`，Lucide 默认），仅对 stroke 型图标透传 `stroke-width` | Lucide 支持 `strokeWidth`；填充型图标（品牌 logo）无效，需文档说明 |
| 颜色 | 保持 `currentColor`（不新增 `color` prop） | 与文本 / 按钮状态天然联动；主题切换零成本 |
| 垂直对齐 | 保持 `vertical-align: -0.125em`；容器内由 flex 对齐 | 与现有视觉一致，避免基线回归 |
| 容器联动 | Button / Input / Tag / Menu 等继续用 `font-size` 档位驱动 `1em` 图标；**不**为每个容器新增图标尺寸 prop | 现有 `size` 档位已覆盖，避免 API 膨胀 |

## 5. ④ 运行时 vs 构建期

### 5.1 实测体积（esbuild 0.28.2，minify + gzip，external vue）

| 方案 | 产物 | 结论 |
|:---|:---|:---|
| `@lucide/vue` 单图标（`Calendar`） | **3.58 KB min / 1.67 KB gzip** | 组件化、tree-shakable；当前方案 |
| `@lucide/vue` 三图标 | 3.86 KB / 1.76 KB | 边际成本极低 |
| `@iconify/vue` 运行时核心（含 `addIcon`，不含图标数据） | **18.36 KB / 7.23 KB gzip** | 即使离线注册，也比 Lucide 单图标多约 5.5 KB gzip |
| `unplugin-icons` + `@iconify-json/*` | 构建期编译，产物只含使用到的图标组件 | 无运行时核心；离线 / CSP 安全 |

### 5.2 方案对照

| 维度 | 运行时 `@iconify/vue` 5.0.5 | 构建期 `unplugin-icons` 24.0.0 | `@nuxt/icon` 2.6.2 |
|:---|:---|:---|:---|
| 依赖形态 | 运行时依赖（MIT） | **devDependency**（MIT），不进产物 | Nuxt 模块（MIT） |
| 图标数据 | 默认从 Iconify API 拉取；离线需 `addIcon` / `addCollection` | `@iconify-json/*`（Lucide ISC / MDI Apache-2.0 等，按图标集许可） | serverBundle 本地 `@iconify-json/*` 或远程 CDN；clientBundle 扫描 |
| CSP | 需允许 `connect-src https://api.iconify.design`（在线模式） | 无网络请求 | 取决于 server / client bundle 配置 |
| 离线 / SSR | 在线模式首屏可能闪烁；离线需预注册 | 构建期确定，SSR 稳定 | 服务端 bundle 稳定；自定义集合需 `provider: 'server'` |
| 体积 | 核心 ~7.2 KB gzip + 拉取的图标数据 | 仅使用到的图标 | 模块 + 扫描逻辑，配置面较大 |
| Nuxt 兼容 | 需自行接线 / `@nuxt/icon` | 官方 `unplugin-icons/nuxt`（Nuxt 3/4） | 原生 |
| 许可 | Iconify MIT；图标集各自许可 | 同左 | 同左 |

### 5.3 推荐

1. **库内不新增运行时图标依赖**；`@lucide/vue` 继续作为内置集（现状即 `dependencies`，不因本调研移除；是否评估 optional peer / 无 Lucide 构建留作 I2 的取舍项）。
2. 第三方图标优先走**构建期**（`unplugin-icons` / `@iconify-json/*`）或**自备 SVG 组件**，由消费方在应用侧接入；本库只提供 `Component` / `name` 接口。
3. `@iconify/vue` 作为**可选 peer / 文档方案**，仅在出现「必须运行时按字符串加载」的真实下游需求时评估；届时须同时给出 CSP / 离线 / SSR 指引。
4. `@nuxt/icon` 不进入库依赖；在 Nuxt 指南中作为可选方案说明（`serverBundle` 本地集合 + `provider: 'server'`）。

## 6. ⑤ 下游迁移与品牌图标

- **PrimeVue `pi pi-*`**：复用[迁移资产记录](./2026-09-17-momei-migration-assets.md) 的 128 个图标映射（同名直取 68 / 语义改名 48 / 填充变体 1 / 品牌无对应 11）。实现批应把该表转为**可检索的迁移映射文档**，并在组件页「从 PrimeVue 迁移」补一行。
- **品牌 logo（社交登录等）**：不内置。三条路径：① Iconify 品牌集（`@iconify-json/logos`，注意各品牌商标许可）；② `unplugin-icons` 构建期引入；③ 自备 SVG 组件（推荐给需要严格许可控制的场景）。
- **自备 SVG**：以 Vue 组件形式传给 `icon`，或经 `#icon` 插槽；建议接收 `size` / `class` / `aria-hidden` 等透传属性。
- **可访问名**：装饰性图标 `aria-hidden="true"`；承载语义的图标提供 `label`（`role="img"` + `aria-label`）；仅图标按钮仍由按钮自身的 `label` 命名，不重复朗读图标。

## 7. 风险清单

1. **注册表 SSR 泄漏**：禁止模块级可变注册表；必须 provide/inject 或 Nuxt 模块按请求注入。
2. **Tree-shaking 回退**：映射表禁止桶导出全部图标；每个语义名单独 import。
3. **未注册名 / 未知名**：开发期 `warnDev` + 渲染空占位（或可配置 fallback 图标），不得静默渲染为文本。
4. **可访问名回归**：`CaomeiIcon` 默认 `aria-hidden` 会改变「自备 SVG 未声明 aria-hidden」的行为；需在实现批补 a11y 回归与文档迁移说明。
5. **许可**：新增任何图标集 / 运行时包须更新 `THIRD-PARTY-LICENSES` 与 `check:licenses`；品牌图标需提示商标许可。
6. **样式耦合**：`strokeWidth` 对填充图标无效；尺寸 token 与容器 `font-size` 可能双重缩放，需明确「容器内用 em、独立图标用档位」。

## 8. 实现候选拆分（回填 Backlog §1.9）

| 候选 | 范围 | 规模 | 优先级 |
|:---|:---|:---|:-:|
| I1 `CaomeiIcon` 三态适配层与可访问名 | `icon` / `name` / registry；provide/inject；`label` 与 `aria-hidden` 默认 | M（1 组件 + 单测 + 文档） | 中 |
| I2 内置图标映射表与覆盖入口 | 25 个导入文件收敛到语义映射（4 个仅提及文件改注释）；`provideIconOverrides`；保持插槽优先级 | M（25 文件重构 + 4 文件注释 + 回归） | 中 |
| I3 图标样式 token | `--caomei-icon-size-sm/md/lg`、`-stroke-width`；容器联动文档 | S（样式 + 文档） | 中 |
| I4 构建期接入与迁移指引 | `unplugin-icons` / `@iconify-json/*` / 自备 SVG / 品牌 logo；`pi pi-*` 映射文档化 | S（文档） | 低 |
| I5 可选运行时 `@iconify/vue` peer | 仅条件触发；CSP / 离线 / SSR 指引 | S（文档 + 可选 peer） | 低 |

> 触发条件：I1 ~ I3 需用户裁定后立项；I4 可随下一次迁移文档批次执行；I5 维持条件触发（出现必须运行时字符串加载的真实用例）。

## 9. 参考来源（版本 / 时间）

- `@iconify/vue` 5.0.5（MIT）、`unplugin-icons` 24.0.0（MIT）、`@nuxt/icon` 2.6.2（MIT）、`@iconify-json/lucide` 1.2.152（ISC，unpacked 668 KB）、`@iconify-json/mdi` 1.2.3（Apache-2.0，unpacked 3.47 MB）、`@lucide/vue` 1.70.0（ISC，unpacked 25.6 MB）；npm registry 读数 2026-11-07。
- 官方文档：Iconify（`@iconify/vue` 运行时 / 离线 `addIcon` / `addCollection`）、unplugin-icons（Nuxt 3/4 模块、`compiler: 'vue3'`、`autoInstall`）、Nuxt Icon（`serverBundle` / `clientBundle` / 自定义集合）、Lucide（`strokeWidth` / `nonScalingStroke`）。
- 体积实测：esbuild 0.28.2，`bundle + minify + gzip`，`vue` 设为 external；`@lucide/vue` 用仓库已装版本，`@iconify/vue` 安装于 `/tmp/icon-probe`（未进入项目依赖）。

## 10. Review Gate

- **audit-depth**：`standard`（调研记录 + 外部事实 + 体积实测；零代码改动）。时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 5 warning / 3 suggest）。**已修**：W1 规模口径改为「25 导入文件 + 4 仅提及 / 22 图标」；W2 明确 `name` / 注册表仅 `CaomeiIcon` 支持，其余入口保持 `Component`；W3 补可访问名优先级「`label` > 透传 a11y attrs > `aria-hidden`」；W4 设计规范引用改为 §2.5 与全路径；W5 标注 `error` / `danger` 现值分叉并禁止 I2 合并；S1 推荐改为「不新增运行时依赖」并留 optional peer 取舍；S2 图标档位由字号 token 派生；S3 补类型层「至少一态」的两种实现方案。
- **R2（`quick` delta）**：`Pass`（0 blocker / 0 warning / 2 suggest）。W1 ~ W5 / S1 ~ S3 全部关闭；补充修正：索引行规模口径改为「25 导入文件 / 22 图标」；a11y 枚举改为「任一 `aria-*` / `role` / `title`」；`@lucide/vue` 版本读数补「当前安装 1.54.0」。
- **实测用时**：R2 起于 `2026-11-08T00:05:54+08:00`，返回约 `00:16`（≈10 分钟，含调度等待，超 ≤5 分钟时间盒）。
- **实测用时**：R1 起于 `2026-11-07T23:39:27+08:00`，返回约 `2026-11-08T00:05`（≈26 分钟，含子代理调度等待，超 ≤10 分钟时间盒）。
