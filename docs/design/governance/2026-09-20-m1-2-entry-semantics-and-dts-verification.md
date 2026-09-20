# M1-2 入口语义与 dts 验证（Phase 11）

- 类型：待验项消除 + 入口语义落定（前置决策记录）
- 触发：Phase 11 M1-2 条目——① 消费方 `tsc` 验证 unbundled `dts` 可解析；② 确定 `theme.css` 与全量入口语义；③ 评估 Nuxt 双注入去重与样式顺序
- 关联：[待办事项 M1-2](../../plan/todo.md) ｜ [M1-1 构建路径 POC](./2026-09-20-m1-1-build-path-poc.md) ｜ [架构设计 §3 / §4](../architecture.md) ｜ [CSS 按需引入评估 §7](./2026-09-20-css-on-demand-evaluation.md)
- 环境：tsdown 0.23.0 + @tsdown/css 0.23.0 + vite 8.2.2 + nuxt 4；快照 2026-09-20，代码快照 HEAD `6ca869c`（实验期间对 `tsdown.config.ts`、`playground/nuxt/nuxt.config.ts` 的临时改动已还原，`git diff` 为空；`dist/` 已重建为基线态）
- 复现材料：见[附录 A](#附录-a可复现材料)

## 1. 结论速览

| 待验项 | 结论 |
| --- | --- |
| ① 消费方 `tsc` 解析 unbundled `dts` | **通过**（`moduleResolution: bundler` 与 `node16` 双模式 exit 0；含负向对照证明类型真被校验；与基线 bundled 产物对照同为通过） |
| ② `theme.css` 与全量入口语义 | **提出方案**（§3，推荐方案 A：稳定 `theme.css` 入口 + 不提供单体全量聚合）——**待用户确认后**才写入[架构设计 §3 / §4](../architecture.md) |
| ③ Nuxt 双注入与样式顺序 | **发现关键约束**：Nuxt 侧不得依赖 JS 图携带 tokens，模块须注入 theme 入口；顺序敏感（覆盖须后置）；`check:nuxt` 现有标记缺「基础 token 存在」断言——该缺口**只在 M1-3 的双通道形态下才暴露**（基线形态下 token 与组件类名同源注入，不会被漏判），见 §4 |

## 2. ① 消费方 `tsc` 解析验证

**方法**：在仓库外建消费方 fixture（`package.json` `"type": "module"` + `node_modules/caomei-ui` 软链指向仓库根 + `node_modules/vue` 软链），用一个真实使用类型的入口文件（命名导入组件 + 使用 `ButtonProps` / `DataTableColumn<T>` / `ComponentSize` / `CaomeiLocale` / `CaomeiLocaleMessages`）跑 `tsc --noEmit`。

| 场景 | 结果 |
| --- | --- |
| unbundled 产物 + `moduleResolution: bundler` | **exit 0** |
| unbundled 产物 + `moduleResolution: node16`（`"type": "module"`） | **exit 0** |
| 基线 bundled 产物 + 两种模式（对照） | exit 0 |
| 负向对照：`const bad: ButtonProps = { variant: 'nope' }` | **exit 2**（`TS2322: '"nope"' is not assignable to 'ComponentVariant \| undefined'`）→ 类型确实在生效 |

**口径说明（避免误读）**：

- 早期以 tsconfig `paths` 映射（而非真实 `node_modules` 布局）跑 `node16` 时失败（`TS1479` / `TS2307`）——那是 **fixture 构造方式的假象**（paths + node16 不按包布局解析），不是产物缺陷；改用真实软链布局后通过。
- 验证使用 `skipLibCheck: true`（消费方常规设置）；`dist/**` 自身未被完整 lib 检查。

## 3. ② 入口语义方案（待用户确认）

**已确立的事实**（M1-1 + 本次实测）：

1. `unbundle` 下产物镜像 `src/`，`dist/styles/index.css`（5,640 字节 = tokens + 暗色 + `.caomei-root` + 两个品牌预设）**路径稳定**，可直接作为 `exports` 目标；
2. `dist/index.js` 保留 `import './styles/index.css'`；**是否随图生效取决于消费管线**——Vite 消费者从包根命名导入时生效（[M1-1 §3.2](./2026-09-20-m1-1-build-path-poc.md) 实测产物含 tokens / 预设），Nuxt 组件自动导入**同样走包根**（`.nuxt/components.d.ts` 内为 `typeof import("caomei-ui")['CaomeiButton']`）却**未携带**（§4 场景 A）；
3. 因此 Nuxt 侧不得依赖该 import 携带 tokens（本 fixture 实测；机制未定位，见 §5 第 1 条）；
4. `unbundle` 不再产出单体聚合 CSS（无 `dist/styles.css`）。

| 方案 | 内容 | 评价 |
| --- | --- | --- |
| **A（推荐）** | 新增 `exports["./theme.css"] = "./dist/styles/index.css"`；**不提供**单体全量聚合；全量场景由 `import 'caomei-ui'` 承担（**非 Nuxt 打包器消费路径**下 JS 图自带组件 CSS 与 theme；Nuxt 侧 tokens 由模块注入 theme 入口承担）；移除 `./styles.css` 导出 | 入口最少、无双份风险；代价是「CSS-only 消费」（如纯静态页只想 `<link>` 一份全量 CSS）失去单体文件 |
| B | A + 额外构建步骤生成单体 `dist/styles.css`（theme + 全部组件 CSS，固定顺序），保留 `./styles.css` | 保留单体便利，但引入第二个产出步骤与顺序不变量，维护面更大 |
| C | `./styles.css` 指向 `dist/index.css` | **不可行**——`unbundle` 形态下不存在该文件 |

**预设层**：两个品牌预设目前随 theme 一并交付（`caomei` 2,029 B / `momei` 1,948 B，合计 **3.98 KB raw / 1.33 KB gzip**）。建议**不拆** `presets/*.css` 独立入口（与 [CSS 评估 §7.2](./2026-09-20-css-on-demand-evaluation.md) 的默认口径一致：省下的体积小于引入多入口的复杂度）。

## 4. ③ Nuxt 双注入与样式顺序（实测）

**场景 A：`injectStyles: false` + unbundle/inject**（`pnpm check:nuxt` → **exit 0**）

- 组件样式**在**：`.caomei-button` 63 处、`.caomei-tag` 35 处；模块虚拟覆盖在（`--caomei-color-primary: #123456` ×1）。
- **基础 token 全部缺失**：`--caomei-color-bg` / `--caomei-font-sans` / `.caomei-root` 在产物 CSS、`index.html` 与 JS bundle 中**均为 0 命中**（HTML、`_nuxt/*.css`、`_nuxt/*.js` 三处扫描）。
- 推论：**Nuxt 组件自动导入路径不会携带 `dist/styles/index.css`**——组件自带 CSS 随各自模块加载，但 tokens / 预设不会。故「模块不再注入样式」不可行。

**场景 B：显式导入 theme CSS（模拟模块同时注入 theme 入口）**

- 基础 token 出现 **2 次**（`#2563eb` ×2）→ **重复注入可观测**；
- 模块虚拟覆盖**消失**（`#123456` 计数 0）→ 注入顺序 / 入口组合会决定覆盖是否生效。
- 该场景经 fixture 直连文件导入构造，**非产品路径**，仅用于暴露「双份 + 顺序」风险，不作为产物结论。

**结论（③）**：

1. `injectStyles` 语义应改为「注入 **theme 入口**（tokens + 预设）」，默认 `true`；不再注入全量样式；
2. 注入点必须**唯一**，且模块的虚拟 theme 覆盖须排在 theme 之后（覆盖依赖层叠顺序，须由断言固定）；
3. **`check:nuxt` 的断言面在双通道形态下存在缺口**——场景 A 缺全部基础 token 仍然 exit 0（其 `CSS_MARKERS` 只断言组件类名与两个覆盖值）。**限定**：基线形态（模块注入全量样式）下 token 与组件类名同源注入，该缺口不成立；它只在 M1-3 的「JS 图带组件 CSS + 模块注入 theme」双通道形态下才真实暴露。
4. **建议**（非既定）：M1-3 补「基础 token 存在（如 `--caomei-color-bg`）」与「覆盖晚于 theme（依据：CSS 层叠原理 + 场景 B 佐证，后者为 fixture 构造、非同源证据）」两条断言；该断言增强**属 M1-3 已登记范围之外**，见 §6 D6，**须用户确认**。

## 5. 未覆盖边界

1. **场景 A 的机制未定位**：为何 Nuxt 组件导入路径未携带 `dist/index.js` 的 theme CSS import（疑与组件自动导入的 tree-shaking / `sideEffects` 交互有关），本次只记录可观测结果，未定位根因；
2. 未测其它打包器（webpack / rspack）与 SSR 样式内联口径（Nuxt `inlineStyles`）对 tokens 可达性的影响；
3. 未测 `presets/*.css` 独立入口的收益（本记录建议不拆）；
4. 场景 B 的失败（`check:nuxt` 缺「theme 覆盖生效」标记）为 fixture 直连导入的产物，**未据此判定产品缺陷**；
5. 未验证「CSS-only 消费」在方案 A 下的替代路径（纯 `<link>` 场景）；
6. **CJS 消费不可用属既有行为**：`module: Node16` 且无 `"type": "module"` 时 `TS1541`（type-only import 需 `resolution-mode`）——在基线 bundled 产物上同样失败，**非本次形态引入的回归**；
7. `skipLibCheck: false`（bundler 模式）复测通过；但**未测其它 Vue 版本**与更严格的 lib 检查组合。

## 6. 待用户确认（入口语义）

| # | 决策项 | 选项 |
| :-: | --- | --- |
| D1 | theme 入口 | `caomei-ui/theme.css` → `dist/styles/index.css`（tokens + 暗色 + `.caomei-root` + 两预设） |
| D2 | 全量入口 | 方案 A：不提供单体聚合（推荐）／方案 B：额外构建步骤生成 `dist/styles.css` |
| D3 | `./styles.css` 导出 | 移除（A 的必然结果）／保留但改指（若选 B） |
| D4 | 品牌预设 | 随 theme 一并交付（建议）／拆 `presets/*.css` |
| D5 | `injectStyles` 语义 | 改为「注入 theme 入口」，默认 `true`（建议）／保留 boolean 但改注入目标 |
| D6 | M1-3 是否纳入 **`check:nuxt` 断言增强**（补「基础 token 存在」与「覆盖晚于 theme」） | 纳入（建议——否则双通道形态的 token 缺失不会被门禁拦下）／不纳入（留 follow-up） |

**确认后动作**：把 D1~D6 结论写入[架构设计](../architecture.md) **§3（包导出）/ §4（构建方案）/ §5（Nuxt 模块选项表，`injectStyles` 语义）**，并在 M1-3 落地实现与四处适配（D6 纳入时另补 `check:nuxt` 断言）。

## 7. 状态

2026-09-20：M1-2 **已产出**本记录——① `dts` 解析验证通过（含负向对照与基线对照）；② 入口语义方案成形（§3）与 ③ Nuxt 双注入 / 顺序结论（§4）落档，并识别出 `check:nuxt` 的**覆盖漏洞**。**②③ 的方案与语义待用户确认（§6）**，确认前不写入架构设计、不启动 M1-3 的对应适配。实验期间对 `tsdown.config.ts` 与 `playground/nuxt/**` 的临时改动已还原（`git diff` 为空），`dist/` 已重建为基线态且 `pnpm check:build` 通过。

## 附录 A：可复现材料

### A.1 实验配置差异

```ts
// tsdown.config.ts（实验态）
outDir: 'dist',
clean: true,
unbundle: true,          // 新增
css: {
    fileName: 'styles.css',
    inject: true,        // 新增
},
```

```ts
// playground/nuxt/nuxt.config.ts（场景 A）
caomeiUI: { injectStyles: false },
```

```vue
<!-- playground/nuxt/app.vue（场景 B：额外显式导入 theme CSS，模拟双注入） -->
<script setup lang="ts">
import '../../dist/styles/index.css'
// 不显式 import：验证组件与 composables 自动导入
const { mode } = useTheme('auto')
</script>
```

### A.2 消费方 `tsc` fixture

```jsonc
// /tmp/.../consumer/package.json
{ "name": "caomei-ui-consumer-probe", "private": true, "type": "module" }
```

```jsonc
// tsconfig.bundlerb.json
{
    "compilerOptions": {
        "target": "ES2020", "module": "ESNext", "moduleResolution": "bundler",
        "strict": true, "noEmit": true, "skipLibCheck": true, "types": []
    },
    "include": ["check-types.ts"]
}
```

```jsonc
// tsconfig.node16b.json（仅 module / moduleResolution 与上者不同）
{
    "compilerOptions": {
        "target": "ES2020", "module": "Node16", "moduleResolution": "node16",
        "strict": true, "noEmit": true, "skipLibCheck": true, "types": []
    },
    "include": ["check-types.ts"]
}
```

```jsonc
// tsconfig.negative.json（负向对照）
{
    "compilerOptions": {
        "target": "ES2020", "module": "ESNext", "moduleResolution": "bundler",
        "strict": true, "noEmit": true, "skipLibCheck": true, "types": [],
        "baseUrl": ".", "paths": { "caomei-ui": ["/root/projects/caomei-ui"] }
    },
    "include": ["negative.ts"]
}
```

```ts
// check-types.ts（节选）
import { CaomeiButton, CaomeiDataTable, CaomeiDialog, CaomeiSelect, caomeiLocales, useTheme, useToast } from 'caomei-ui'
import type { ButtonProps, ComponentSize, DataTableColumn, CaomeiLocale, CaomeiLocaleMessages } from 'caomei-ui'

const size: ComponentSize = 'md'
const buttonProps: ButtonProps = { variant: 'primary', size }
const columns: DataTableColumn<{ name: string }>[] = [{ key: 'name', header: '名称', width: '120px' }]
```

```ts
// negative.ts（负向对照，预期报错）
import type { ButtonProps } from 'caomei-ui'
export const bad: ButtonProps = { variant: 'nope' }
```

### A.3 命令序列

```sh
# 实验态构建
node -e "…改 tsdown.config.ts（unbundle + css.inject）"
pnpm build

# ① dts
mkdir -p node_modules && ln -sfn /root/projects/caomei-ui node_modules/caomei-ui
ln -sfn /root/projects/caomei-ui/node_modules/vue node_modules/vue
node_modules/.bin/tsc --noEmit -p tsconfig.bundlerb.json   # exit 0
node_modules/.bin/tsc --noEmit -p tsconfig.node16b.json    # exit 0
node_modules/.bin/tsc --noEmit -p tsconfig.negative.json   # exit 2（预期）

# ③ Nuxt
sed -i 's/injectStyles: true/injectStyles: false/' playground/nuxt/nuxt.config.ts
pnpm check:nuxt            # 场景 A：exit 0（但基础 token 缺失）
# 场景 B：在 app.vue 增加 `import '../../dist/styles/index.css'` 后复跑

# 计数口径：HTML + 全部产物 CSS + JS bundle 三处扫描
cd playground/nuxt/.output/public
cat _nuxt/*.css > /tmp/all.css
for pat in '--caomei-color-bg:' '--caomei-font-sans:' '.caomei-root' '--caomei-color-primary:'; do
    echo "$pat  CSS=$(grep -o -- "$pat" /tmp/all.css | wc -l)  HTML=$(grep -o -- "$pat" index.html | wc -l)  JS=$(grep -o -- "$pat" _nuxt/*.js | wc -l)"
done
# 场景 A 期望：三个位置的基础 token 均为 0；组件类名与模块覆盖在
grep -o '.caomei-button' /tmp/all.css | wc -l                 # 场景 A：63
grep -o '.caomei-tag' /tmp/all.css | wc -l                    # 场景 A：35
grep -o -- '--caomei-color-primary: *#123456' /tmp/all.css | wc -l   # 场景 A：1
# 场景 B 期望：--caomei-color-primary: #2563eb 出现 2 次（重复），#123456 为 0（覆盖丢失）

# 还原
cp /tmp/…/tsdown.config.ts tsdown.config.ts
sed -i 's/injectStyles: false/injectStyles: true/' playground/nuxt/nuxt.config.ts
pnpm build && pnpm check:build
```

> 证据声明：本记录的机检覆盖为 `lint-md` 与 `pnpm governance:check`（含 `docs:check`）；`docs:check` 的三部分扫描面不同——`docs-check-integrity` / `docs-line-count` 只扫受跟踪文件，`docs-check-links` 按工作树遍历（排除 `CHANGELOG.md`）。
