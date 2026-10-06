# Phase 19 M3-3：Button `iconOnly` 示例形态修复（图标改走 `#icon` 插槽）

> 创建时间：2026-10-06
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 19 **M3-3**（组件观感缺陷处置）
> 依据：用户裁定 D6 = **改示例**（组件契约不变）；[组件设计 §6 / Button](../design-spec.md)
> 边界：只改文档站示例 `docs/examples/button/icon-only.vue`；**不改组件库 `src/**`、单测与 `types.ts` JSDoc**。

---

## 1. 结论

- 文档站「纯图标按钮」节不再渲染空白方块：示例中 22 个 `<CaomeiButton icon-only>` 的图标由**默认插槽**改为 **`#icon` 插槽**。
- 组件契约不变：`iconOnly` 模式本就不渲染默认插槽（模板 `v-else-if="iconOnly && $slots.icon"`），故缺陷在示例而非组件。
- 中英页共用同一示例源（`docs/components/button.md` 与 `docs/i18n/en-US/components/button.md` 均 `vue` 指向 `examples/button/icon-only.vue`），一处修复即双语生效。

## 2. 改动

`docs/examples/button/icon-only.vue`：把每个纯图标按钮的默认插槽图标包裹为 `#icon` 插槽（22 处）：

```vue
<CaomeiButton icon-only label="搜索">
    <template #icon>
        <Search />
    </template>
</CaomeiButton>
```

## 3. V 阶段（文档站真实 Chromium）

| 观测量 | 模拟修复前（移除图标节点） | 修复后 |
| --- | --- | --- |
| 纯图标按钮总数 | 22 | 22 |
| 有可见内容（`svg` 尺寸 > 0 或 `loading` spinner） | 21 | **22** |
| 空白按钮（`blank`） | **`搜索`** | **`[]`** |

- 说明：`加载中` 按钮的 `loading` 分支渲染的是 spinner（非图标），计入「有可见内容」。
- 探针 `test-results/m3-3/verify.mjs`（gitignored，本地态）。

## 4. 常驻守卫

- `test/contracts/button-icon-only-example.test.ts`：断言示例中每个纯图标按钮均使用 `#icon` 插槽、`#icon` 之外无残留内容，并设**受检面下界**（≥ 20 个纯图标按钮，防示例被静默清空后守卫空转）。含 4 条正反用例。
- **判别力（负向对照）**：还原示例（图标回到默认插槽）→ 仓库现状断言 **1 failed**；恢复后 5 passed。

## 5. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm lint:check` / `typecheck` | exit 0 |
| 新契约单测 | 5 passed |
| `pnpm docs:check` | 11 段 exit 0 |
| 组件库 `src/**` | **零改动**（`git diff -- src/` 为空） |
| 单测 / `types.ts` JSDoc / 组件语义 | 未改动（符合 D6 边界） |

## 6. 载体与边界

- 载体：本记录 + 治理索引 + `todo.md` 状态回填（Backlog 无对应候选行）。
- 边界：示例为单一源（中英共用），无独立 en 示例文件；文档站主题 CSS / 其余示例未触及。

## 7. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 0 warning / 3 suggest。审计方独立复跑契约（5 passed；负向对照还原示例 → 1 failed）、示例计数（`icon-only` 22 / `#icon` 22 / 无遗漏）、中英同源确认、独立复算 V 证据（真实 Chromium：22/22 有可见内容、blank `[]`；模拟修复前 blank `搜索`）；`git diff -- src/` 为空；`docs:check` / `check:governance-records`（120/310）/ `check:planning-numbers`（0）/ `lint:md:check` exit 0。
- **同批收口**：suggest ② `#icon` 判定正则放宽为兼容 `v-slot:icon` 与标签名后空白（已改，契约复跑通过）；suggest ①（`todo.md` 完成态早于 RG）与 ③（V 探针 gitignored）维持现状（前者由待开工的 M4-2 约束载体统一，后者记录已注明本地态）。
- 留痕：`artifacts/review-gate/2026-10-06-phase19-m3-3-button-icon-only-example.md`（本地态）。
