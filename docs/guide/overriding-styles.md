# 下游样式覆盖指引

本页面向把 caomei-ui 接进业务项目的开发者，说明**在不复制组件样式、不滥用 `!important`** 的前提下覆盖外观。

> `@layer` 的评估结论记录于[组件库 CSS `@layer` 策略评估](../design/governance/2026-11-24-phase43-m2-3-layer-strategy.md)（结论：**不落地**）；**覆盖口径以本页为准**。1.5.0 的消费方可见变化见[1.5.0 升级注意](../release-notes/1.5.0.md)。

## 覆盖顺序：先选轻的

1. **token**（首选）：`--caomei-*` 主题变量与 `--caomei-<组件>-*` 覆盖钩子。库内规则以 `var(--caomei-button-bg, var(--caomei-color-primary))` 这种「带默认回退」的形态读取，**不需要提高特异性**。两级变量的生效位置不同：
   - **全局语义 token**（`--caomei-color-*` / `--caomei-control-height-*` / `--caomei-space-*` / `--caomei-radius-*`）：定义在 `:root` 或任意祖先作用域都会生效（元素自身声明的那条会把继承值当默认回退读进去）。
   - **组件钩子**（`--caomei-button-bg` / `--caomei-button-height` 等）：若该钩子已被档位类（`--sm|md|lg`）或 `tone` 在**按钮元素自身**声明，祖先作用域的声明会被元素自身声明盖过（自定义属性的继承值永远输给元素自身声明，与特异性无关）。此时把它写在组件的根类上（如 `.social-btn { --caomei-button-height: 40px }`），或改覆盖档位来源 token（`--caomei-control-height-md`）。
2. **组件 API**：`variant` / `tone` / `size` / `wrap` / `block` / `rounded` 等已覆盖的形态优先用 API，而不是改样式。
3. **自定义类**：在组件根上加自己的类，用业务作用域把特异性抬到库规则之上（见下节）。
4. **`!important`**：最后手段，使用时须写明回收条件（上游修复后删除）。

常用 token 类别：

| 类别 | 示例 | 说明 |
| :--- | :--- | :--- |
| 语义色 | `--caomei-color-primary` / `--caomei-color-danger-text` | 品牌色、文字色；预设见[主题与样式设计 §4](../design/theming.md) |
| 控件尺寸 | `--caomei-control-height-sm/md/lg` | 影响字段与按钮高度；`data-density="touch"` 会整体抬档 |
| 组件钩子 | `--caomei-button-bg` / `--caomei-popover-radius` | 组件专属；`--caomei-button-bg` 只被**实底**变体读取（`secondary` / `ghost` 走 `--caomei-button-text` / `--caomei-button-border`） |
| 间距 / 圆角 / 动效 | `--caomei-space-*` / `--caomei-radius-*` / `--caomei-motion-*` | 改动面大，建议只在应用根部覆盖 |

> 覆盖实底 / 状态色 token 后，**状态对比度由使用方负责**（等值改写不受影响，改色值需自行校验 WCAG）；预设与对比度口径见[主题与样式设计](../design/theming.md)。

## 特异性基线（为什么「双类」不保证生效）

- 组件的根规则编译为 **类 + scoped 属性**，即 `.caomei-button[data-v-<hash>]` = **(0,2,0)**；尺寸 / 语气档位选择器用 `:where()` 归零，只声明变量。
- 下游的**双类**（`.caomei-button.social-btn`）同样落在 (0,2,0)，与库规则**同档**——谁生效取决于样式源序，而源序会随打包器、代码分割与 CSS 注入顺序（含基础层经 `sideEffects` 进入模块序）变化，**不保证**在升级后仍然成立。
- 库的**状态规则更高**：`:hover` / `:active` 是 `(0,4,0)`（`.caomei-button--primary[data-v-*]:hover:not(:disabled)`），`:disabled` / `:focus-visible` 与内部部件是 `(0,3,0)`。按 (0,3,0) 覆盖只能赢下静态根规则，**状态仍由库取胜**。

| 覆盖目标 | 库规则示例 | 库特异性 | 推荐做法 |
| :--- | :--- | :-: | :--- |
| 根盒 / 静态颜色 | `.caomei-button[data-v-*]` | (0,2,0) | (0,3,0) 起，或 `:deep()` 锚定祖先 |
| 组合形态（`--block` / `--icon-only`） | `.caomei-button--block[data-v-*]` | (0,2,0) | 同上 |
| 内部部件 | `.caomei-button--icon-only .caomei-button__icon[data-v-*]` | (0,3,0) | `:deep()` + 祖先再加一级（≥ (0,4,0)） |
| 换行档 `--wrap` | `.caomei-button--wrap:not(.caomei-button--icon-only)[data-v-*]` | (0,3,0) | (0,4,0) 起，或改 `--caomei-button-wrap-padding-y` / `--caomei-button-wrap-line-height` |
| `hover` / `active` | `.caomei-button--primary[data-v-*]:hover:not(:disabled)` | (0,4,0) | **优先改 token**（状态色由 token 经 `color-mix()` 派生，改 token 即覆盖三态） |
| `disabled` / `focus-visible` | `.caomei-button[data-v-*]:disabled` | (0,3,0) | 同上（`--caomei-disabled-opacity` / `--caomei-button-focus`） |

> `tone="neutral"` 的实底状态规则为 (0,5,0)（基类 + 语气类 + scoped 属性 + `:hover` + `:not()`）——**状态一律建议改 token**，不要在类上逐档比特异性。

```css
/* 不保证：与库根规则同为 (0,2,0)，靠源序取胜 */
.caomei-button.social-btn { border: 0 }

/* 生效（静态属性）：0,3,0，与源序解耦 */
.account-page .caomei-button.social-btn { border: 0 }

/* 生效（三态一起改）：优先动 token，别和状态选择器比特异性。
   实底换品牌色时同时给 --caomei-button-fg，字色与底色的对比度由使用方保证 */
.social-btn {
    --caomei-button-bg: #1da1f2;
    --caomei-button-fg: #fff;
}
```

```vue
<!-- 生效：scoped 只锚定祖先，`:deep()` 下钻到组件内部 -->
<style scoped>
.actions :deep(.caomei-button) {
    border-radius: var(--caomei-radius-full);
}
</style>
```

> 不要依赖「库后加载」这一隐性顺序前提：构建器、按需加载、CSS 注入位置与 resolver 的基础层 `sideEffects` 都会改变它。库内选择器一旦变更（例如把某条规则收进 `:where()`），顺序型覆盖会静默失效。

## 可执行示例：scoped 样式命中按钮根

**1.5.0 起**，未启用内建提示的 `CaomeiButton` 根节点就是 `<button>`（启用 `tooltip` 时仍是多根，见下），父组件的 scoped 规则可直接命中：

```vue
<script setup lang="ts">
import { CaomeiButton } from 'caomei-ui'
</script>

<template>
    <div class="actions">
        <CaomeiButton class="submit">
            提交
        </CaomeiButton>
    </div>
</template>

<style scoped>
/* 0,2,0（自定义类 + 父级 scope）→ 直接作用于按钮元素 */
.submit {
    width: 100%;
}
</style>
```

**启用 `tooltip` 时**根节点是按钮与提示面板构成的 Fragment（多根；触发器经 `as-child` 复用按钮本身，不额外产生元素），父级 scoped 规则没有落点，此时需 `:deep()`：

```vue
<style scoped>
.actions :deep(.caomei-button) { width: 100% }
</style>
```

> `:deep()` 只在 scoped / CSS Modules 样式块内编译；直接写进全局样式表不会生效。全局样式可用 `.actions .caomei-button`（`:deep()` 的必要性来自父级 scope，而非类名位置）。

## 内部类与结构：哪些是稳定契约

- **类名是当前的覆盖入口，但不是冻结面**：`caomei-<组件>`、`caomei-<组件>--<变体|档位>`（BEM）是覆盖时优先使用的选择器；按[版本与兼容策略](./version-policy.md)，DOM 结构与类名同属**非冻结面**——升级前请按当版发布说明复核，不要把它们当作永不变更的契约。
- **内部部件类名可见但不承诺稳定**：如 `.caomei-button__content`（文本承接层，承担单行截断 / 换行）。它属于组件 scope，父级 scoped 规则需要 `:deep()` 才能命中；内部结构调整时类名可能变化。
- **元素层级、兄弟顺序、标签名不是契约**：用 `div > button`、`button + span` 这类结构 / 标签选择器会在内部结构调整时静默失效。

## 反例清单

| 反例 | 问题 | 替代 |
| :--- | :--- | :--- |
| `div > button { … }` | 依赖元素层级与标签名 | 用组件类名 |
| `.caomei-button.caomei-button--primary { … }` | 复制库内部组合，档位改走 `:where()` 后会失配 | 用 `tone` / `variant` 或组件钩子变量 |
| 双类覆盖后依赖加载顺序 | 顺序变化即失效 | 抬到 (0,3,0) 或 `:deep()` |
| `!important` 无登记 | 上游修复后长期残留、难以回收 | 登记回收条件，随上游版本删除 |
| 直接改 `theme.css` 或复制组件样式 | 升级后与库脱钩 | 覆盖变量 |
| 在 `@layer` 内放覆盖规则 | 未分层规则会压过分层规则，导致覆盖反而失效 | 覆盖规则保持未分层（库当前也未分层） |

## 与升级注意的关系

1.4.0 起把表头与单元格文本包进 `CaomeiTooltipText`、把按钮文本改为单行截断，产生了一批需要下游适配的变化；`1.5.0` 又恢复了 Button / `CaomeiTooltipText` 的单元素根，并收窄了 Popover / Popconfirm 打开态的背景隔离面。**每次升级前请先读当版升级注意**，再决定是否回收 `:deep()` / `!important` 之类的临时写法：

- [1.5.0 升级注意](../release-notes/1.5.0.md)
- [1.4.0 升级注意](../release-notes/1.4.0.md)
- [版本与兼容策略](./version-policy.md)
