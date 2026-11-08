# Phase 29 M4-1：CaomeiIcon 三态适配层与可访问名

> 创建时间：2026-11-08
> 触发：Phase 29 M4-1（[Phase 29 登记批次](./2026-11-08-phase29-registration.md) §2）。
> 依据：[图标体系调研](./2026-11-07-phase28-m4-1-icon-system-research.md) §2 / §3 / §8；用户裁定 D3 ①（I1 + I2 + I3 + I4 文档面）。

## 1. 交付清单

| 面 | 内容 |
|:---|:---|
| `IconProps` | `icon` 由必填改可选；新增 `name` / `strokeWidth` / `label` |
| 三态解析 | `icon` 组件 > 注册表 `name`；两者都缺省时渲染空占位并开发期告警；`name` 未注册同样告警 |
| 注册表 | 新增 `IconRegistry` / `IconRegistrySource` 类型与 `provideIconRegistry()` / `useIconRegistry()` / `caomeiIconRegistryKey`；支持对象 / `ref` / getter；provide/inject、无模块级单例，SSR 按请求隔离 |
| 可访问名 | 显式 `label`（`role="img"` + `aria-label`）> 透传 `aria-*` / `role` / `title` > 默认 `aria-hidden="true"` |
| 尺寸 / 线宽 | `size` 默认 `1em`；`strokeWidth` 透传给 stroke 型图标组件 |
| 导出 | `src/icons/index.ts` 与包根导出同步（`src/index.ts` 已 `export *`） |
| 文档 | 中英图标页补 registry / 可访问名章节、API 表与示例；新增 `examples/icons/registry.vue`（中英两份） |
| 冻结面 | 包根导出名 **333 → 338**（`use*` / `provide*` 7 → 9）；`exports` 13 键与组件面不变 |
| 构建守卫 | `check-build` 新增「产物不得残留裸 `import.meta.env`」扫描，防 SSR 崩溃回归 |

## 2. 实现要点

1. **类型取舍**：保持 `icon?: Component` 而非 `({ icon } | { name })` 联合类型，兼容既有 `:icon` 用法与 props 提取工具；`name` / `strokeWidth` / `label` 均为可选，属向后兼容增量。
2. **注册表作用域**：`provideIconRegistry()` 用 `computed(() => toValue(source))` 包装对象 / `ref` / getter，并通过 `InjectionKey` 注入；无 provider 时回退冻结的空对象，不写模块级可变状态。
3. **属性合并**：模板只保留一个 `v-bind="mergedAttrs"`（`$attrs` + 计算出的 a11y 属性），避免 Vue 对多个对象 `v-bind` 的重复属性报错；`label` 在合并时后置，覆盖透传 `aria-label`。
4. **空占位**：解析失败时渲染 `<span class="caomei-icon caomei-icon--empty" aria-hidden="true" data-caomei-icon-missing>`，保留 `caomei-icon` 类钩子；告警统一走 `warnDev()`（逐级读取 `globalThis.process`），**不依赖 `import.meta.env`**，Node SSR / 非 Vite 环境不会抛错。
5. **作用域边界**：`name` / 注册表只由 `CaomeiIcon` 支持；`use-confirm` 的 `icon`、DropdownMenu 条目 `icon`、Image `previewIcon` 等入口保持 `Component`（后续 I2 / I4 文档说明）。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm vitest run src/icons/icon.test.ts` | **16 passed**（三态解析 / icon 优先 / 响应式注册表 / size / strokeWidth / 两类告警 / 6 条 a11y 优先级含动态属性 / SSR 隔离 / 注入键） |
| `pnpm vitest run test/a11y` | **68 passed**（既有图标夹具 `<CaomeiIcon :icon="Bold" />` 零改动通过） |
| `pnpm vitest run scripts/release/check-build.test.mjs` | 通过（新增 `findUnsafeImportMetaEnv` 正 / 负例） |
| 浏览器验证（docs preview） | 中英图标页 registry 示例渲染：`收藏` / `喜欢` / `Favourite` / `Like` 可访问名命中，装饰性图标 `aria-hidden` 命中；中英亮 / 暗与 390 视口均无横向溢出；截图见 `/tmp/opencode/icons-registry-{zh-light,zh-dark,zh-mobile,en-light,en-dark}.png` |
| `pnpm typecheck` / `pnpm typecheck:docs` | 通过 |
| `pnpm docs:check` / `pnpm lint:md:check` | 通过（中英示例引用存在） |
| `pnpm verify` | 通过（含 build / docs:build / governance:check） |
| 包根导出复算 | **338**（`Caomei*` 100 / `use*`·`provide*` 9 / 其余 229） |

## 4. 风险与边界

1. **开发期告警**：对缺失 `icon` / `name` 或未注册 `name` 通过 `warnDev()` 告警；生产构建静默，SSR / 非 Vite 环境不会因 `import.meta.env` 抛错。
2. **注册表键名**：`name` 区分大小写；未注册名称按空占位处理，避免运行时崩溃。
3. **其他图标入口**：`use-confirm` / DropdownMenu / Image 等仍只接受组件，不接受字符串名；统一 resolver 不在本批范围。
4. **`strokeWidth`**：透传给所有图标组件；非 stroke 型组件可能忽略该属性。
5. **Nuxt 模块**：未新增 `iconRegistry` 配置项（调研中的可选能力），当前由使用方在应用根调用 `provideIconRegistry()`。

## 5. Review Gate

- **audit-depth**：`standard`（图标组件 / 注册表 / 类型 / 导出 / 文档 / 测试；含 SSR 与 a11y 优先级）；时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Reject`（1 blocker / 3 warning / 3 suggest；实测约 7 分钟，未超 ≤ 10 分钟时间盒）——
  - B1 构建产物残留裸 `import.meta.env.DEV`，Node SSR / 非 Vite 环境渲染即抛错：**已修**——改用 `warnDev()`，并在 `check-build` 新增产物扫描 + 正 / 负例单测。
  - W2 `attrs` 派生的 computed 不追踪新增属性：**已修**——改为渲染期函数 `resolveMergedAttrs()`，补「挂载后新增 aria-label」用例。
  - W3 `label` 未清除透传 `aria-hidden`：**已修**——label 分支显式置 `aria-hidden: undefined`，补用例。
  - W4 可见示例缺浏览器验证：**已修**——docs preview 中英页 / 亮暗 / 390 视口浏览器验证并留截图。
  - S1 ~ S3 已采纳：告警走 `warnDev`、图标页补 `useIconRegistry` / 注入键说明、空占位边界登记。
- **R2（`quick` delta）**：`Pass`（0 blocker / 1 warning / 0 suggest；实测约 4 分钟，未超 ≤ 6 分钟时间盒）——B1 / W2 / W3 / W4 / S6 全部关闭；W4 的英文页截图已同批补齐。
- **复查基线**：本记录 §1 ~ §3；`src/icons/{icon.vue,types.ts,registry.ts,index.ts,icon.test.ts}`；中英图标页与示例；冻结面记录 §2.3。

## 6. 未覆盖边界

- 未实现 I2 内置图标映射表 / `provideIconOverrides`（M4-2）。
- 未实现 I3 图标尺寸 token（M4-3）。
- 未新增 Nuxt `iconRegistry` 配置；未覆盖运行时字符串名加载（I5 条件触发）。
- 未逐组件替换内置图标引用（M4-2）。
