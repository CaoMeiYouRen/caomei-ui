# Phase 30 M1-1：表单输入动效交付

> 创建时间：2026-11-10
> 触发：Phase 30 M1-1（[Phase 30 登记批次](./2026-11-10-phase30-registration.md) §2）。
> 依据：[动效体系评估](./2026-11-08-motion-system-evaluation.md) §5 / §6 / §8；基础层见 [Phase 29 M1-1 记录](./2026-11-08-phase29-m1-1-motion-foundation.md)。

## 1. 交付清单

| 组件 | 模式 | 动效 |
|:---|:---|:---|
| InputGroup | `expressive` 新增 | 聚焦成员上移 2px（`--caomei-motion-distance-sm` 的一半，`transform` 不触发布局）；成员过渡沿用字段层的边框 / 阴影并追加 `transform` |
| CheckboxGroup | `expressive` 新增（复用） | 勾选 / 半选指示器以 `scale-from → 1` + 淡入入场；分组自身无自有视觉状态，动效由组合的 Checkbox 单点实现（含全选项） |
| Form / FormItem | `expressive` 新增 | 标签颜色随 invalid 状态过渡；错误行出现时淡入 + 由上方 4px 下移归位 |
| Slider | `expressive` 新增 | 手柄悬浮 `scale(1.08)`、按下 `scale-from`；轨道 / 已选区间保留颜色过渡 |
| InputNumber | `expressive` 新增 | 步进按钮按下轻微缩放 + 颜色过渡 |
| 既有表单控件 | 审计 | Checkbox / RadioButton / Switch / Select / MultiSelect / TagsInput / Password / FloatLabel / FileUpload 等既有过渡已由 Phase 29 A1 统一消费 `--caomei-motion-*`；本批未重复迁移 |
| TagsInput | 审计 | reduced-motion 兜底已在 Phase 29 A1 落地（`transition: none`），本批无新增缺口 |
| Input / InputNumber / Textarea 共享层 | 不在本批 | 由 Phase 29 A1 统一，未重复改动 |

- **缺省 `minimal` 零差异**：新增规则全部以 `:where([data-motion='expressive'])` 前缀隔离，`minimal` 无对应选择器。
- **reduce 压平**：新增关键帧与缩放均有显式媒体查询兜底；Slider 的 `scale`、InputGroup 的 `transform`、InputNumber 的按压缩放在 reduce 下归零。
- **无裸时长**：新增过渡 / 动画全部消费 `--caomei-motion-*`，`check:motion-contract` 通过。

## 2. 实现要点

1. **Slider 使用独立 `scale` 属性而非 `transform`**：Reka 在滑块手柄内联写入定位 `transform`，CSS `transform` 无法覆盖内联值；改为独立 `scale` 属性后与定位组合，且仍只影响合成层、不触发布局。
2. **InputGroup 过渡特异性**：成员自身的字段过渡为 `.caomei-field[data-v]`；组规则用 `.caomei-input-group[class]` 把特异性稳定抬到成员之上，不依赖样式源序。过渡属性沿用 `border-color` / `box-shadow` 并追加 `transform`，保留既有聚焦边框反馈。
3. **CheckboxGroup / Form 的委托边界**：两者没有自有视觉状态，勾选动效落在 Checkbox 指示器、invalid 动效落在 FormItem 标签与错误行；不在分组 / 表单容器上叠加装饰性动画。
4. **入场动画只做一次性状态**：Checkbox 指示器与 Form 错误行均在挂载时播放，不引入常驻装饰；卸载不做退场（避免侵入列表 DOM 契约）。
5. **关键帧只含合成层属性**：新增 `@keyframes` 仅使用 `opacity` / `transform`（或 `scale`），不触发布局属性白名单。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm lint` / `pnpm lint:css:check` | 通过 |
| `pnpm typecheck` | 通过 |
| `pnpm check:motion-contract` | 通过（受检面未收窄） |
| 定向 `vitest`（slider / checkbox / checkbox-group / form / input-group / input-number 等 10 文件） | 通过 |
| `pnpm exec playwright test test/e2e/form-motion.e2e.ts` | **21 passed**（7 用例 × 3 project：勾选 / invalid / 滑块 / 聚焦 / 步进 / minimal / reduce） |
| 既有 `form` / `field-overflow` / `focus-and-motion` E2E | **60 passed** |
| 响应式矩阵 `responsive.e2e.ts` | **106 passed / 4 skipped**（新增夹具 section 未造成页面横向溢出） |
| `pnpm capture:styles` | **0 差异**（`minimal` 计算样式与冻结基线一致） |
| `pnpm test:visual` | **42 passed**（亮暗 / 视口 / 预设 / 区间面板基线不变） |
| `pnpm verify` | 通过（含 build / docs:build / governance:check） |

### 3.1 真实浏览器采样（Chromium，1280×800 / 390×844）

| 状态 | 实测值 |
|:---|:---|
| `data-motion="expressive"` token | `--caomei-motion-duration-base = 220ms` |
| Slider 手柄悬浮 | `scale = 1.08` |
| InputGroup 聚焦成员 | `transform = matrix(1, 0, 0, 1, 0, -2)`；`transition-property = border-color, box-shadow, transform` |
| Checkbox 勾选指示器 | `animation-name = caomei-checkbox-indicator-in-*` |
| CheckboxGroup 勾选 | 同一指示器动画（复用实现） |
| Form 错误行 / 标签 | 错误行入场动画存在；标签 `transition-duration = 0.22s` |
| InputNumber 步进按钮 | `transition` 非零 |
| reduce（expressive + reduce） | Slider `scale = none`；InputGroup `transform = none`；勾选 `animation-name = none`；步进过渡 `0s` |
| 页面横向溢出 | 桌面 / 移动均 `scrollWidth == clientWidth` |

- 截图与可复跑脚本：`test-results/ui-validate/desktop-light-form.png`、`desktop-dark-form.png`、`mobile-light-form.png`、`desktop-reduce-form.png`；脚本 `test-results/ui-validate/phase30-motion-validate.mjs`（均为 gitignored，结论与关键实测值已回写本节）。
- 验证窗口内无源码改动；亮 / 暗、桌面 / 移动、reduce 三面均采样，console error 为 0。

## 4. 风险与边界

1. **Slider `scale` 属性基线**：独立 `scale` 属性需 Chromium 104+ / Safari 14.1+ / Firefox 72+；低于该基线时缩放不生效，但滑块定位与轨道过渡不受影响。
2. **InputGroup 过渡覆盖**：组规则以字段层属性清单为准；成员若自行声明额外过渡属性，进入组后会被组规则收敛为「边框 / 阴影 / transform」三项。当前组内成员（Input / InputNumber / Textarea / Select）无额外过渡。
3. **CheckboxGroup / Form 动效位置**：勾选与 invalid 的动效分别在子组件实现，分组 / 表单本体不新增动画；下游若自定义子组件需自行提供等价动效。
4. **只做入场**：Checkbox 指示器与错误行为 `v-if` 卸载，未实现退场；避免与列表 / 表单 DOM 契约耦合。
5. **任务粒度**：本批 7 文件（5 组件 + 夹具 + E2E），新增约 430 行，未超 10 文件阈值；`app.vue` 的 M2 节在本条之后单独提交。
6. **范围**：未实现 M2-1 之外的基础 / 选择器 / 数据展示动效；未做逐组件人工录屏复核（属动效验收批次）。

## 5. Review Gate

- **audit-depth**：`standard`（5 个 `src/**` 组件 + 夹具 + E2E；含 Slider 内联 transform 冲突与 reduce 优先级）；时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 1 warning / 2 suggest；实测约 3 分钟，未超时间盒）——
  - W1 InputGroup 过渡依赖样式源序：**已修**——改用 `.caomei-input-group[class]` 稳定抬高特异性，并补注释说明。
  - S1 Slider 使用独立 `scale` 属性：**已登记**——记录浏览器基线边界，定位与过渡不受影响。
  - S2 CheckboxGroup / Form 动效委托子组件：**已登记**——避免容器级装饰性动画，交付清单写明实现位置。
- **R2（`quick` delta）**：`Pass`（0 blocker / 0 warning / 1 nit；实测约 2 分钟，未超 ≤ 6 分钟时间盒）——W1 关闭；nit 为记录内截图清单仅列代表图，未逐张复述 index 摘要。
- **复查基线**：本记录 §1 ~ §3；`src/components/{slider,checkbox,form,input-group,input-number}`；`test/e2e/form-motion.e2e.ts`；`test/e2e/fixtures/app.vue` 的 `#form-motion`。

## 6. 未覆盖边界

- 未逐组件做人工录屏 / 0.25 倍速复核（属动效验收批次）。
- 未验证 Slider `scale` 基线以下的旧浏览器降级观感。
- 未覆盖 InputGroup 内自定义成员（非库内字段组件）的过渡合并。
- 未新增 Checkbox / Form 的退场动画。
