# 组件总览

组件按用途分为 6 组；组内顺序与侧栏一致。想先看效果，可前往[组件画廊](./showcase)浏览一批代表组件的真实预览。

## 基础与布局

- [Avatar 头像](./avatar)：头像用于展示用户或实体的图像，未提供图片或加载失败时显示回退内容，基于 Reka UI Avatar 封装。
- [Badge 徽标](./badge)：徽标用于展示数量或状态提示，可独立使用，也可叠加在其它元素右上角。
- [Button 按钮](./button)：按钮用于触发一个操作。
- [ButtonGroup 按钮组](./button-group)：按钮组把多个按钮拼接为单一控件：相邻按钮的边框自动合并、内侧圆角去除，常用于一组紧密相关的操作。
- [Card 卡片](./card)：卡片用于分组承载相关内容，作为纯布局容器不引入任何交互逻辑，自带边框 / 阴影 / 填充三种基础外观。
- [Divider 分隔线](./divider)：分隔线用于区隔内容区块，支持水平 / 垂直方向、内容插槽与线型。
- [Image 图片](./image)：图片组件基于原生 `img` 自建，提供比例占位、懒加载与加载 / 失败占位，避免加载过程引发布局跳动。
- [SplitButton 分裂按钮](./split-button)：分裂按钮由一个主按钮与一个下拉按钮组成：主按钮触发默认操作，下拉按钮展开一组次要操作。自建实现，内部组合 `CaomeiButton` 与 `CaomeiDropdownMenu`。
- [Tag 标签](./tag)：标签用于对内容进行分类或标记，支持语义色调、多种变体与可关闭交互。

## 表单输入

- [Checkbox 复选框](./checkbox)：复选框用于在多个选项中选择若干项，或表示单个布尔开关，基于 Reka UI Checkbox 封装。
- [FileUpload 文件上传](./file-upload)：文件上传组件基于原生 `input[type=file]` 自建，负责文件选择（点击 / 拖拽）与列表管理；`customUpload` 下抛出 `uploader` 交由业务层上传。
- [FloatLabel 浮动标签](./float-label)：浮动标签把 `<label>` 叠加在表单字段上：`over`（默认）在空值时居中充当占位提示，聚焦或有值时上浮到字段上方；`in` 让标签常驻字段顶部、字段内容下移。
- [Input 输入框](./input)：输入框用于接收用户的单行文本输入。
- [InputGroup 输入框组合](./input-group)：输入框组合把多个表单控件拼接为单一控件外观：自动消除相邻重复边框与内侧圆角，并让输入类成员占满剩余宽度。
- [InputNumber 数字输入框](./input-number)：数字输入框用于录入数值，支持范围限制、步进与小数精度。
- [Password 密码输入框](./password)：密码输入框由 [Input](/components/input) 衍生，在文本输入基础上提供明文可见性切换与密码自动填充语义。
- [RadioGroup 单选组](./radio-group)：单选组用于在一组互斥选项中选择一项，基于 Reka UI RadioGroup 封装，由 `CaomeiRadioGroup` 与 `CaomeiRadioButton` 组合使用。
- [Slider 滑块](./slider)：滑块用于在数值区间内拖动选择单个或多个值，基于 Reka UI Slider 封装。
- [Switch 开关](./switch)：开关用于切换单个选项的开启 / 关闭状态，基于 Reka UI Switch 封装。
- [Textarea 多行输入](./textarea)：多行文本输入框，适用于备注、描述等场景。

## 选择器

- [AutoComplete 自动补全](./auto-complete)：自动补全是一个「异步建议 + 自由输入」的输入框：既可以从建议列表中选择，也可以直接输入任意文本作为值。基于 Reka UI Combobox 封装。
- [Calendar 日历](./calendar)：月历选择组件（封装 Reka UI Calendar primitive），用于在页面内直接选择日期。对外统一使用原生 `Date`。
- [ColorPicker 颜色选择器](./color-picker)：颜色选择器由色块触发按钮与浮层面板组成，面板内提供饱和度 / 明度区域、色相滑条与十六进制输入框；组合 Reka UI 的 ColorArea / ColorSlider / ColorField primitive，预设色板为自建按钮组（Reka `ColorSwatchPicker` 未采用，见[设计规范 §7](../design/design-spec.md)）。
- [DatePicker 日期选择器](./date-picker)：由触发按钮与日历面板组合的日期选择器：点击触发器展开日历，选中后按 `dateFormat` 展示。对外统一使用原生 `Date`。
- [MultiSelect 多选选择器](./multi-select)：多选选择器基于 Reka UI `Combobox` 封装，支持多选、`v-model` 数组、已选项标签与输入过滤。展开后可直接输入关键字筛选本地选项。
- [Select 选择器](./select)：选择器用于从一组选项中选择单个值，基于 Reka UI Select 封装。
- [SelectButton 分段选择](./select-button)：分段选择在一组互斥或可多选的选项间切换，视觉上呈现为分段按钮组，等价于 SegmentedControl，基于 Reka UI ToggleGroup 封装。
- [ToggleButton 开关按钮](./toggle-button)：开关按钮用于在单个按钮上切换按下 / 未按下状态（如工具条中的加粗、斜体），基于 Reka UI Toggle 封装。

## 反馈与浮层

- [ConfirmDialog 确认对话框](./confirm-dialog)：确认对话框用于中断用户当前操作并获取明确确认，基于 Reka UI AlertDialog 封装，并提供 `useConfirm()` 服务式调用。弹层强制模态、锁定页面滚动，且**点击遮罩不会关闭**——用户必须显式选择确认或取消（Esc 视为取消）。
- [Dialog 对话框](./dialog)：对话框用于在当前页面之上承载需要用户聚焦处理的内容，基于 Reka UI Dialog 封装。
- [Drawer 抽屉](./drawer)：抽屉从页面边缘滑出，用于承载次要内容、设置面板或导航；封装 Reka UI 的 Dialog primitive，并提供四向 `position`。
- [Message 提示条](./message)：提示条用于在当前页面内展示一条与上下文相关的反馈信息（单组件同时承载 Message / Alert 语义）。
- [Popover 浮层](./popover)：浮层用于承载与触发元素相关的临时内容（说明、表单、操作），基于 Reka UI Popover 封装，由 `CaomeiPopover` 与 `CaomeiPopoverTrigger` / `CaomeiPopoverContent` / `CaomeiPopoverArrow` / `CaomeiPopoverClose` 组合使用。
- [Toast 轻提示](./toast)：轻提示用于对用户操作给出简短反馈，基于 Reka UI Toast 封装，并提供 `useToast()` 服务式调用。提示由视口内的可访问区域承载，支持自动关闭、滑动关闭、操作按钮与语义语气。

## 数据展示

- [DataTable 表格](./data-table)：表格用于展示结构化数据，基于 `@tanstack/vue-table` 的无头能力自建渲染，默认提供极简表样式与空态。
- [DataView 数据视图](./data-view)：数据视图用同一组数据在列表与网格两种布局间切换：`layout` 决定渲染 `list` 还是 `grid` 插槽，条目结构与网格列数由插槽内容自行定义。自建实现，不依赖 Reka UI。
- [Paginator 分页](./paginator)：分页用于在数据分片间切换，基于 Reka UI Pagination 封装。
- [ProgressBar 进度条](./progress-bar)：进度条用于展示确定的进度值或不确定的等待状态，基于 Reka UI Progress 封装，与 ProgressSpinner 同源。
- [ProgressSpinner 加载指示](./progress-spinner)：加载指示器用于表示正在进行的异步操作，基于 Reka UI Progress 封装（不确定进度）。
- [Skeleton 骨架屏](./skeleton)：骨架屏用于在内容加载完成前占位，降低布局跳动并提示加载状态。为纯样式自建组件，不依赖外部 primitive。

## 导航与操作

- [Accordion 折叠面板](./accordion)：折叠面板将内容分节收纳，点击标题逐项展开 / 收起，基于 Reka UI Accordion 封装。
- [DropdownMenu 下拉菜单](./dropdown-menu)：下拉菜单由触发器展开一组操作，支持分组、禁用、勾选、单选与分隔线，基于 Reka UI DropdownMenu 封装。
- [Stepper 步骤条](./stepper)：步骤条展示多步流程的进度，并在步骤之间导航。基于 Reka UI Stepper（稳定 primitive）封装，采用与 Tabs 一致的组合式 API。
- [Tabs 选项卡](./tabs)：选项卡在一组同级内容间切换，同一时刻只展示一个面板，基于 Reka UI Tabs 封装。
- [Toolbar 工具条](./toolbar)：工具条用于将一组操作控件组织为单一键盘导航区域，基于 Reka UI Toolbar 封装，由 `CaomeiToolbar` 与 `CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarSeparator` / `CaomeiToolbarToggleGroup` / `CaomeiToolbarToggleItem` 组合使用。

## 能力说明

- [组合式 API](./composables)：`useToast` / `useConfirm` / `useTheme` / `useLocale` 等库内能力
- [图标](./icons)：图标封装与 `@lucide/vue` 接入
- [内建文案与语言](./locale)：内建文案注入、语言切换与命名空间
