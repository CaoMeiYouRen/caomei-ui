# Paginator 每页条数选择器尺寸评估

> 创建时间：2026-11-08
> 触发：用户截图反馈「分页大小的选择框高度与旁边页码不一致；宽度也偏宽，是否调整」。
> 性质：**评估记录**；零实现、零 `src/**` / `test/**` 改动。候选见 §7，Backlog 为唯一候选载体。

## 1. 结论

- **高度需要调整**：页码控件高度固定 `32px`、最小宽 `32px`（`--caomei-paginator-control-size`；2 位页码实测 32×32，3 位会自然变宽），每页条数选择器使用全局 `size="sm"`（默认 28px、`data-density="touch"` 下 36px），两者高度始终相差 4px，且方向随密度轴翻转。
- **宽度建议收窄**：默认 `--caomei-paginator-rows-width` 为 `6rem`（96px），对「10 / 20 / 50」这类 2–3 位数值偏宽；实测 `5rem`（80px）在 3 位数下无裁切，建议作为新默认。
- **圆角可选对齐**：页码控件 `radius-sm`（4px），选择器字段默认 `radius-md`（8px）。不属于本次「高度 / 宽度」诉求，但同批调整可让外观更一致。
- **建议纳入 Backlog**，优先级「中」；属于低风险视觉一致性修复，可在下一次 Paginator 相关批次顺带交付。

## 2. 实测（2026-11-08，Chromium，docs build 产物，1280 视口）

同一 Paginator 实例内测量：

| 元素 | 默认密度 | `data-density="touch"` |
| --- | --- | --- |
| 页码控件 | 高 **32px** / 最小宽 32px（实测 32×32）；radius 4px；font 12px；padding `0 6px` | 高 **32px** / 最小宽 32px（实测 32×32）；radius 4px；font 14px；padding `0 6px` |
| 每页条数选择器 | **96 × 28**；radius 8px；font 12px；padding `0 8px` | **96 × 36**；radius 8px；font 14px；padding `0 8px` |
| 差值 | 选择器矮 **4px** | 选择器高 **4px** |

- **截图形态与 touch 密度一致**：选择器 36 / 页码 32，视觉上就是「选择框更高」。
- **根因**：
  1. 页码控件走 Paginator 自有 token `--caomei-paginator-control-size: 32px`；
  2. 每页条数选择器走全局 `size="sm"` → `--caomei-control-height-sm`（默认 28 / touch 36）；
  3. 两套尺寸系统没有交叉约束，密度轴一开就反向。
- 选择器 `size="sm"` 同时决定字号与图标尺寸，默认 / touch 下字号（12 / 14）与页码控件一致；**只需覆盖高度，不必改 size**。

## 3. 宽度实测

在同一选择器上注入不同宽度，读取容器宽度与内容盒可用宽：

| 宽度 | 容器 / 字段 | 值区可用宽（非文本宽） | 3 位数「100」 | 结论 |
| --- | --- | --- | --- | --- |
| `6rem`（96px，现值） | 96 / 96 | 62 | 无裁切 | 偏宽 |
| `5.5rem`（88px） | 88 / 88 | 54 | 无裁切 | 可用 |
| **`5rem`（80px）** | **80 / 80** | **46** | **无裁切** | **建议默认** |
| `4.5rem`（72px） | 72 / 72 | 38 | 无裁切 | 更紧，可作覆盖值 |
| `4rem`（64px） | 64 / 64 | 30 | 无裁切 | 接近下限，不建议默认 |

> 选择器只显示数值，2–3 位是常见形态；`5rem` 给 3 位数留出余量，同时比现值窄 16px（约 17%）。长标签 / 4 位数仍可通过 `--caomei-paginator-rows-width` 覆盖。**4 位数未单独实测**：按 5rem 的值区可用宽 46px 与 12px 字号估算，「1000」约 28px，仍可容纳；「≥5 位或高字号场景」建议覆盖为 5.5rem 复测（5.5rem 是留白余量，不代表 4 位数本身需要更宽）。

## 4. 方案比较

| 方案 | 做法 | 结果 | 结论 |
| --- | --- | --- | --- |
| A 改 `size="md"` | 选择器用 36px | 默认 32 vs 36（更高）；touch 36 vs 32（更矮）；字号变 14 与页码 12 不一致 | 不推荐 |
| B 改页码控件为 28 / 36 | 让 Paginator 跟随全局尺寸 | 页码视觉变小 / 触控目标变化，影响现有基线 | 不推荐 |
| **C 组件内覆盖选择器高度** | 在 Paginator 作用域把选择器 `--caomei-field-height` 设为 `--caomei-paginator-control-size` | 默认与 touch 都统一为 32；字号 / 图标继续由 `size="sm"` 决定 | **推荐** |
| D 新增 `--caomei-paginator-rows-height` | 独立高度 token | 多一个与 `control-size` 平行的 token，消费方需同时改两处 | 不推荐；复用 `control-size` 更简单 |

**推荐实现轮廓（本轮未执行；落点 `paginator.vue` 的 `<style scoped>`）**：

```css
.caomei-paginator__rows-per-page {
    width: var(--caomei-paginator-rows-width, 5rem);
}

.caomei-paginator__rows-per-page :deep(.caomei-field) {
    --caomei-field-height: var(--caomei-paginator-control-size, 32px);

    /* 可选：与页码控件圆角一致 */
    --caomei-field-border-radius: var(--caomei-paginator-radius, var(--caomei-radius-sm));
}
```

- 选择器触发器自身的 `.caomei-field--sm` 用 `:where()`（特异性 0），组件内覆盖规则经 scoped 编译后为 (0,3,0)，胜出且不需要 `!important`。
- 不改变 `size="sm"`：字号、图标、内边距仍走既有档位；只覆盖高度与可选圆角。
- 文档同步：`--caomei-paginator-rows-width` 默认值 6rem → 5rem；说明高度跟随 `--caomei-paginator-control-size`；圆角跟随 `--caomei-paginator-radius`（若采纳）。**覆盖变量落在触发器自身，会遮蔽祖先继承的同名变量**，今后调高度应走 `--caomei-paginator-control-size`；默认宽度变更属已披露 token 默认值变化，随 release note 说明。

## 5. 测试建议

| 层 | 断言 |
| --- | --- |
| E2E 尺寸 | 同一 Paginator 内页码控件与选择器高度相等（容差 ≤ 0.5px）；默认与 `data-density="touch"` 各测一遍；3 档视口（390 / 768 / 1280） |
| 宽度 / 裁切 | 选择器宽度 = `5rem`；「100」不裁切；长标签覆盖 token 后不溢出 |
| 键盘 / a11y | 选择器可访问名仍为「每页条数」；Tab / 方向键 / 选择后焦点与页码不回归；`disabled` 下高度同样为 32px |
| 面板 | 触发器收窄到 5rem 后，选项面板 `min-width` 收敛但选项文本不裁切 |
| 不渲染 | 未提供 `rowsPerPageOptions` 时不渲染选择器，既有单测覆盖（`paginator.test.ts`） |
| 视觉基线 | Paginator 亮 / 暗、默认 / touch 重冻结；确认只有选择器几何变化 |
| 回归 | 页码按钮高度仍 32px、宽度 ≥ 32px（不是固定宽）、字号与命中区不变 |

## 6. 风险与边界

- `data-density="touch"` 下页码控件仍是 32px；把选择器统一到 32 会让它低于 touch 尺寸（36），但与同一分页器内的页码一致。**这是既有密度缺口**，本次不扩面；如需触控优先，另立「Paginator 控件在 touch 下跟随 36/44」候选。
- 收窄宽度可能影响自定义长标签（如「每页显示 100 条」）。选择器显示的是纯数值，当前 API 不支持自定义选项文案；若未来支持，应改用 `min-width` + `auto`。
- 圆角对齐会改变选择器外观，需与视觉基线同批重冻结；不采纳则仅改高度 / 宽度。
- 未验证真实下游应用中的 `data-density` 配置；截图形态与 touch 实测一致，但具体来源需下游确认。

## 7. Backlog 映射

- 候选：**Paginator 每页条数选择器尺寸对齐**（§1.1 组件增强候选），优先级 **中**。
- 范围：高度统一到 `--caomei-paginator-control-size`；默认宽度 6rem → 5rem；圆角对齐为可选项；补 E2E 尺寸断言与视觉基线。
- 候选池：45 → 46。

## 8. Review Gate

- **audit-depth**：`quick`（尺寸实测 + 方案比较 + 一行 Backlog；零代码改动）。时间盒 ≤ 5 分钟。
- **R1（`quick`）**：`Pass`（0 blocker / 1 warning / 5 suggest）。**已修**：W1 页码控件改为「高度 32px / 最小宽 32px」，E2E 只断言高度与最小宽；S1 表头改为「值区可用宽」；S2 补 4 位数估算边界；S3 测试计划补 disabled / 面板收敛 / 不渲染；S4 补覆盖变量遮蔽与 release note；S5 标注 scoped 落点、特异性订正为 (0,3,0)、Backlog 行压缩。
- **R2（`quick` delta）**：`Pass`（0 blocker / 0 warning / 1 suggest）；W1 与 S1 ~ S5 全部关闭。S1 采纳：4 位数估算与 5.5rem 建议的边界改为「≥5 位或高字号」并说明留白；§3 引言改为「容器宽度与内容盒可用宽」。
- **实测用时**：R1 起于 `2026-11-08T10:46:33+08:00`，返回约 `10:51`（≈5 分钟，≤5 分钟时间盒）；R2 起于 `10:53:39`，返回约 `10:57`（≈4 分钟，≤3 分钟时间盒，含调度等待）。
