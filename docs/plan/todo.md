# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> Phase 0 / Phase 1 / Phase 2 已完成并归档（见 [待办归档](./todo-archive.md)）。Phase 3（Tier 2 组件）已由用户决策启动。
>
> 用户决策：优先推进 Tier 2 组件实现（清单见 [组件设计 §4](../design/components.md)）；文档站增强、首版发布与下游接入顺延至 Phase 4+。
> 验收沿用前阶段基线；覆盖率 ≥80% 作为目标，现阶段不强制（门禁启用见 [Backlog](./backlog.md)）。

### Phase 3：Tier 2 组件

状态：**进行中**

> 实现粒度：单条目若超过 10 文件 / 800 行，按子件拆分（如 TabList / TabTrigger / TabPanel、菜单条目类型）为多次提交。

#### 主线 A：内容切换（Tabs / Accordion）

- 执行范围：Tabs（含 TabList / TabPanel，封装 Reka UI `Tabs`）、Accordion（封装 Reka UI `Accordion`）
- 非目标：Tabs 不做路由联动；Accordion 不提供跨项动画编排 API
- 最小验收：两组件均具备实现、单元测试、组件文档与示例、浏览器验证（含键盘导航与 a11y），并通过 Review Gate

- [ ] **Tabs**：封装 Reka UI `Tabs`，支持 `v-model` 当前项、TabList / TabTrigger / TabContent 组合、禁用项与键盘导航。
- [ ] **Accordion**：封装 Reka UI `Accordion`，支持 single / multiple、`collapsible`、默认展开项与禁用项。

#### 主线 B：浮层菜单（DropdownMenu）

- 执行范围：DropdownMenu（封装 Reka UI `DropdownMenu`），支持分组、禁用、勾选 / 单选条目、快捷键提示展示与分隔线
- 非目标：不做 Menubar / ContextMenu；多级子菜单暂不封装
- 最小验收：实现、单元测试、组件文档与示例、浏览器验证（焦点圈定、键盘导航、层级与滚动锁），并通过 Review Gate

- [ ] **DropdownMenu**：封装 Reka UI `DropdownMenu`，提供 trigger / item / checkbox-item / radio-item / separator / label 等组合。

#### 主线 C：分段选择（SelectButton / SegmentedControl）

- 执行范围：封装 Reka UI `ToggleGroup`，支持 single / multiple 两种模式与 `v-model` 值
- 非目标：不做复杂富内容条目（仅支持文本 / 图标插槽）
- 最小验收：实现、单元测试、组件文档与示例、浏览器验证（选中态、键盘导航、禁用），并通过 Review Gate

- [ ] **SelectButton / SegmentedControl**：封装 Reka UI `ToggleGroup`；以 `SelectButton` 命名（对齐 PrimeVue 迁移），`SegmentedControl` 作为等价语义说明。

#### 主线 D：媒体与文件（Image / FileUpload）

- 执行范围：Image（自建 `img` + 懒加载 + 加载 / 失败占位，可选比例容器）；FileUpload（自建：点击 / 拖拽选择、`v-model` 文件列表、`accept` / `multiple` 约束与移除）
- 非目标：Image 不做 `srcset` 与跨域处理；FileUpload 不做上传传输（分片 / 断点续传由业务层负责，组件只负责选择与列表管理）
- 最小验收：两组件均具备实现、单元测试、组件文档与示例、浏览器验证，并通过 Review Gate

- [ ] **Image**：自建懒加载图片，支持 `src` / `alt` / `ratio`、加载中与失败占位。
- [ ] **FileUpload**：自建文件选择 / 拖拽，支持 `v-model` 文件列表、`accept` / `multiple` / 禁用与列表移除。
