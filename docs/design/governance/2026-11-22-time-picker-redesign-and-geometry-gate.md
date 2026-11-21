# TimePicker 重做与组件尺寸门禁

> 日期：2026-11-22
> 范围：`TimePicker` 字段结构 / 默认值 / 宽度策略，`DatePicker` 默认宽度，以及新增的真实浏览器尺寸门禁。
> 状态：已实现，待提交。

## 1. 背景

用户反馈 TimePicker 存在五类问题：

1. 没有补 0 展示模式（期望 `09:30:00`）。
2. 输入 / 滚轮 / 输入 + 滚轮的字段 UI 差异过大：箭头位置、弹层锚点、数字布局不一致。
3. 默认只到分钟，期望默认保留秒、只到分钟改为显式设置。
4. 时间 / 日期选择器默认过宽（继承选择器家族 `20rem`），与可预见的内容长度不匹配。
5. 缺少可真实检测「对齐 / 对称 / 布局 / 边距 / 默认宽度」等尺寸规范的门禁。

## 2. 决策

| 议题 | 决策 |
| --- | --- |
| 补 0 | 新增 `pad?: boolean`，默认 `true`；内联输入、滚轮显示与滚轮列共用同一开关 |
| 秒精度 | `showSeconds` 默认改为 `true`；`false` 显式回退到分钟精度 |
| 字段结构 | 三种模式共用同一 `.caomei-time-picker__field` 外壳与 `.caomei-time-picker__segments` 段位布局；输入改为 `type="text"` + `inputmode="numeric"`，消除 number 输入固有 spinner 占位导致的冒号偏移 |
| 箭头位置 | `wheel` / `both` 的入口固定在字段内容盒右缘；`input` 不渲染入口 |
| 弹层锚点 | 以整条字段为 `PopoverAnchor`，`align="start"`，两种滚轮模式相对位置一致 |
| TimePicker 宽度 | 内容档位封顶：分钟 `8.5rem`、含秒 `11.5rem`、12 小时制再加 `3.75rem`；`width: 100%` 仍保留，窄容器内收缩 |
| DatePicker 宽度 | 内容档位封顶：日期 `12rem`、含时间 `15rem`、区间 `18rem` |
| 表单对齐 | 覆盖 `--caomei-time-picker-max-width` / `--caomei-date-picker-max-width` 为 `100%` 或 `none`，不再默认继承 `--caomei-select-max-width` |
| 门禁 | 声明层：`test/contracts/time-picker-width.test.ts`；几何层：`test/e2e/component-geometry.e2e.ts`（`pnpm test:e2e:geometry`）；随 Test 工作流 `Visual` job 阻断 |

## 3. 变更文件

- `src/components/time-picker/time-picker.vue`：统一字段外壳、段位布局、箭头位置、锚点、宽度档位。
- `src/components/time-picker/time-wheel.vue`：`pad` 透传；`showSeconds` 内部默认同步为 `true`。
- `src/components/time-picker/types.ts`：新增 `pad`，调整 `showSeconds` 默认值与文档。
- `src/components/date-picker/date-picker.vue`：默认宽度改为内容档位。
- `test/contracts/time-picker-width.test.ts`：声明层宽度契约。
- `test/e2e/component-geometry.e2e.ts`：真实浏览器几何门禁。
- `test/e2e/fixtures/app.vue`：新增 `#component-geometry` 夹具（三种模式 / 分钟 / 不补 0 / 12 小时制 / 禁用 / DatePicker / Select / Input / InputNumber / Button）。
- `.github/workflows/test.yml`、`package.json`：新增 `test:e2e:geometry` 并在 `Visual` job 运行。
- 组件文档、设计规范、主题规范、测试规范、GitHub 协作规范与视觉基线同步更新。

## 4. 门禁内容

`component-geometry.e2e.ts` 断言：

- 时间三模式字段宽 / 高 / 内边距 / 圆角 / 字号 / 段位宽度与起点一致；
- 左右内边距对称，标签与字段间距一致；
- 每个冒号中心与相邻段位盒边界重合（容差 0.5px），即冒号位于两个数字正中间；
- 滚轮箭头 / 入口贴字段内容盒右缘；
- 两种滚轮模式的弹层水平偏移为 0、垂直偏移一致；
- 时间 / 日期默认宽度按内容档位封顶，且明显窄于 `Select` 的 `20rem`；
- Input / InputNumber / Select / DatePicker / TimePicker / Button 高度均为 `control-height-md`（36px），圆角一致；
- 禁用态不改变布局尺寸；
- 320px 视口下字段不横向溢出，并留档整段几何截图。

## 5. 验证证据

| 检查 | 结果 |
| --- | --- |
| `pnpm exec vitest run src/components/time-picker src/components/date-picker test/contracts/time-picker-width.test.ts test/contracts/time-picker-attrs.test.ts` | 4 文件 / 74 用例通过 |
| `pnpm test` | 195 文件 / 3690 用例通过 |
| `pnpm test:a11y` | 83 / 83 通过（TimePicker 文本段保留 `role="spinbutton"` 语义） |
| `pnpm exec playwright test test/e2e/time-picker.e2e.ts --project=desktop` | 9 / 9 通过 |
| `pnpm exec playwright test test/e2e/component-geometry.e2e.ts --project=desktop` | 8 / 8 通过（含冒号居中 0.5px 容差） |
| `pnpm test:visual`（time-picker 定向更新后） | time-picker 亮 / 暗基线重新生成；滚轮面板基线未变 |
| `pnpm lint:check` / `pnpm lint:css:check` / `pnpm typecheck` | 通过 |
| `pnpm check:design` / `pnpm check:class-prefix` | 通过 |
| `pnpm lint:md:check` / `pnpm docs:check:integrity` / `pnpm docs:check:i18n-parity` | 通过 |
| `pnpm build` / `pnpm check:build` | 通过 |
| 门禁负向对照 | 临时把含秒档位宽度改回 `20rem`、把入口 `margin-inline-start` 改为 `0` → 几何门禁 2 项失败（默认宽度 / 入口贴右缘）；还原后 8 / 8 通过 |

## 6. 发布口径

按用户决定，本次默认值调整（`showSeconds` / 默认宽度）**不标记为 BREAKING CHANGE**；仅在 TimePicker / DatePicker 组件页的「升级说明」中披露旧行为恢复方式。

## 7. 边界与后续

- `TimePicker` 默认值变更（`showSeconds: true`）会改变未显式关闭秒的下游外观；属于用户明确要求的默认行为调整，迁移时按组件页「从 PrimeVue 迁移」表核对。
- 时间 / 日期选择器不再继承 `--caomei-select-max-width`；依赖旧 `20rem` 默认宽度的页面需要显式覆盖到 `100%` / `none` 或具体宽度。
- 自定义 `DatePicker.dateFormat` 明显更长时，内容档位可能不足，需按实际文案覆盖 `--caomei-date-picker-max-width`。
- 门禁当前只覆盖时间 / 日期选择器与字段外壳高度；后续新增尺寸规范时按同一夹具扩面，并保持受检面下界。
