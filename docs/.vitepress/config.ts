import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin/markdown'
import { normalizePath } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(dirname, '../../src')
const componentsDir = path.resolve(srcDir, 'components')

/**
 * VitePress 1.6 的 `themeConfig.i18nRouting` 仅支持布尔值（函数形态自 2.0 起），
 * 因此用别名替换默认主题内部的 `composables/langs`，由站内实现按「该页是否已翻译」
 * 生成语言菜单链接；三个菜单消费者（桌面 / 平板 / 移动端）共用该实现，
 * 详见 theme/composables/langs.ts。
 */
const langsComposablePath = path.resolve(dirname, 'theme/composables/langs.ts')

// 漂移守卫：VitePress 若重命名 / 搬迁该内部模块，别名会静默失效（退回「切换回首页」），
// 这里让构建期显式失败，提示同步检查别名与实现。
const vitepressLangsPath = path.resolve(
    dirname,
    '../../node_modules/vitepress/dist/client/theme-default/composables/langs.js',
)
if (!existsSync(vitepressLangsPath)) {
    throw new Error(
        '[docs] 未找到 VitePress 内部模块 dist/client/theme-default/composables/langs.js，'
        + '语言菜单覆盖（config.ts 的 ../composables/langs 别名）可能已失效，请检查 VitePress 版本与内部结构。',
    )
}

/**
 * 收集某目录下所有 markdown 的路由路径（`index.md` → 目录路径），
 * 归一化方式与 VitePress `normalizeLink` 保持一致，供语言菜单判断目标页是否存在。
 */
function collectDocRoutes(rootDir: string): string[] {
    const routes: string[] = []
    const walk = (dir: string): void => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                walk(full)
            } else if (entry.name.endsWith('.md')) {
                const relative = path.relative(rootDir, full).split(path.sep).join('/')
                const normalized = relative
                    .replace(/(^|\/)index\.md$/, '$1')
                    .replace(/\.md$/, '')
                routes.push(normalized.startsWith('/') ? normalized : `/${normalized}`)
            }
        }
    }
    if (existsSync(rootDir)) {
        walk(rootDir)
    }
    return routes
}

/** 已翻译页面的路由表：语言标识 → 该语言存在的路由路径（源语言中文全量，无需列出） */
const routingPages: Record<string, string[]> = {
    'en-US': collectDocRoutes(path.resolve(dirname, '../i18n/en-US')),
}

// 复用 VitePress 内置 Vite 版本的开发服务器类型，避免与仓库根 Vite 类型冲突
type MetaWatchServer = Parameters<Extract<NonNullable<Plugin['configureServer']>, (server: never) => unknown>>[0]

// GitHub Pages 项目站点部署在 /<repo>/ 子路径下，需要设置 base；
// 本地开发与自定义域名部署保持默认 '/'。由 VITEPRESS_BASE 环境变量控制。
const base = process.env.VITEPRESS_BASE ?? '/'

/**
 * 站内搜索分词：用 `Intl.Segmenter` 补齐 minisearch 默认分词对中文的不足。
 *
 * VitePress 会把 themeConfig 中的函数序列化后在客户端用 `new Function` 重建，
 * 因此本函数必须自包含，不得引用模块级变量或其他函数。
 */
function tokenizeLocalSearch(text: string): string[] {
    const normalized = text.toLowerCase()
    if (typeof Intl.Segmenter !== 'function') {
        return normalized.split(/[\s\p{P}]+/u).filter(Boolean)
    }
    const tokens: string[] = []
    const segmenter = new Intl.Segmenter('zh', { granularity: 'word' })
    for (const segment of segmenter.segment(normalized)) {
        if (segment.isWordLike) {
            tokens.push(segment.segment)
        }
    }
    return tokens
}

const COMPONENT_FILE_RE = /\.(vue|ts)$/
const META_DEBOUNCE_MS = 200
const META_MAX_RETRY = 3

/**
 * 开发期热更新组件 API 元数据。
 *
 * 监听 `src/components` 变更，复用 checker 通过 `updateFile` 增量刷新
 * `component-meta.json`；仅在元数据实际变化时失效组件模块并整页刷新，
 * 其余变更（模板 / 样式）交由 Vite HMR 处理。
 */
async function setupComponentMetaWatch(server: MetaWatchServer): Promise<void> {
    const {
        collectComponentEntries,
        createComponentMetaCollector,
        getComponentMetaFile,
        projectRoot,
        writeComponentMetaFile,
    } = await import('../../scripts/docs/gen-component-meta.mjs')

    const collector = createComponentMetaCollector()
    // VitePress 的 Vite root 为 docs/，组件目录在仓库内，需显式纳入监听
    server.watcher.add(componentsDir)

    const pending = new Set<string>()
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0

    const flush = (): void => {
        timer = undefined
        if (pending.size === 0) {
            return
        }
        const files = [...pending]

        try {
            for (const file of files) {
                if (existsSync(file)) {
                    collector.updateFile(file, readFileSync(file, 'utf8'))
                } else {
                    collector.reset()
                }
            }

            const metaFile = getComponentMetaFile(projectRoot)
            const before = existsSync(metaFile) ? readFileSync(metaFile, 'utf8') : ''
            const meta = collector.collect()
            const after = `${JSON.stringify(meta, null, 2)}\n`

            pending.clear()
            attempts = 0

            if (before === after) {
                return
            }

            writeComponentMetaFile(meta, projectRoot)

            const targets = [metaFile, ...collectComponentEntries().map((entry) => entry.file)]
            for (const target of targets) {
                // moduleGraph 以 POSIX 路径为 key，Windows 下需归一化
                for (const mod of server.moduleGraph.getModulesByFile(normalizePath(target)) ?? []) {
                    server.moduleGraph.invalidateModule(mod)
                }
            }
            server.ws.send({ type: 'full-reload' })
        } catch (error) {
            server.config.logger.error(`[component-meta-watch] ${String(error)}`)
            for (const file of files) {
                pending.add(file)
            }
            attempts += 1
            if (attempts <= META_MAX_RETRY) {
                timer = setTimeout(flush, 1000)
            } else {
                attempts = 0
                pending.clear()
                server.config.logger.error('[component-meta-watch] 重试超限，跳过本批变更')
            }
        }
    }

    const schedule = (file: string): void => {
        const relative = path.relative(componentsDir, file)
        if (relative.startsWith('..') || path.isAbsolute(relative) || !COMPONENT_FILE_RE.test(file)) {
            return
        }
        pending.add(file)
        clearTimeout(timer)
        timer = setTimeout(flush, META_DEBOUNCE_MS)
    }

    server.watcher.on('change', schedule)
    server.watcher.on('add', schedule)
    server.watcher.on('unlink', schedule)
}

function componentMetaWatch(): Plugin {
    return {
        name: 'caomei-ui:component-meta-watch',
        apply: 'serve',
        configureServer(server): void {
            setupComponentMetaWatch(server).catch((error: unknown) => {
                server.config.logger.error(`[component-meta-watch] 初始化失败：${String(error)}`)
            })
        },
    }
}

export default defineConfig({
    title: 'caomei-ui',
    description: '基于 Vue 3 + Reka UI 的自建组件库',
    lang: 'zh-CN',
    base,
    cleanUrls: true,
    rewrites(id) {
        // 文档翻译物理路径约定：docs/i18n/<locale>/ → 站点路径 /<locale>/（对齐 momei）
        // 当前仅 en-US，新增 locale 时需同步扩展此处正则
        return id.replace(/^i18n\/(en-US)\//, '$1/')
    },
    markdown: {
        config(md) {
            md.use(vitepressDemoPlugin)
        },
    },
    vite: {
        plugins: [componentMetaWatch()],
        resolve: {
            alias: {
                '@': srcDir,
                // 覆盖默认主题的语言菜单（桌面 / 平板 / 移动端共用 composable），
                // 改为「已翻译页回切对应路由，未翻译页回退 locale 首页」
                '../composables/langs': langsComposablePath,
            },
        },
    },
    locales: {
        root: {
            label: '简体中文',
            lang: 'zh-CN',
            themeConfig: {
                // 顶层为共享项；语言切换按钮标签仅中文 locale 需要，英文走默认 Change language
                langMenuLabel: '切换语言',
            },
        },
        'en-US': {
            label: 'English',
            lang: 'en-US',
            link: '/en-US/',
            description: 'A Vue 3 component library built on Reka UI',
            themeConfig: {
                nav: [
                    { text: 'Guide', link: '/en-US/guide/getting-started' },
                    { text: 'Components', link: '/en-US/components/' },
                    { text: 'Design', link: '/en-US/design/' },
                    { text: 'Standards', link: '/en-US/standards/' },
                    { text: 'Plan', link: '/en-US/plan/' },
                ],
                sidebar: {
                    '/en-US/guide/': [
                        {
                            text: 'Guide',
                            items: [
                                { text: 'Getting Started', link: '/en-US/guide/getting-started' },
                                { text: 'Local Linking', link: '/en-US/guide/local-linking' },
                                { text: 'Development', link: '/en-US/guide/development' },
                                { text: 'Release', link: '/en-US/guide/release' },
                                { text: 'AI Development', link: '/en-US/guide/ai-development' },
                            ],
                        },
                    ],
                    // 与中文侧栏同分组、同组件、同顺序（组内按组件名字母序）；
                    // 分组命名与规则见 docs/design/documentation-site.md §11。
                    '/en-US/components/': [
                        { text: 'Overview', link: '/en-US/components/' },
                        {
                            text: 'Basics & Layout',
                            items: [
                                { text: 'Avatar', link: '/en-US/components/avatar' },
                                { text: 'Badge', link: '/en-US/components/badge' },
                                { text: 'Button', link: '/en-US/components/button' },
                                { text: 'ButtonGroup', link: '/en-US/components/button-group' },
                                { text: 'Card', link: '/en-US/components/card' },
                                { text: 'Divider', link: '/en-US/components/divider' },
                                { text: 'Image', link: '/en-US/components/image' },
                                { text: 'SplitButton', link: '/en-US/components/split-button' },
                                { text: 'Tag', link: '/en-US/components/tag' },
                            ],
                        },
                        {
                            text: 'Form Inputs',
                            items: [
                                { text: 'Checkbox', link: '/en-US/components/checkbox' },
                                { text: 'CheckboxGroup', link: '/en-US/components/checkbox-group' },
                                { text: 'FileUpload', link: '/en-US/components/file-upload' },
                                { text: 'FloatLabel', link: '/en-US/components/float-label' },
                                { text: 'Input', link: '/en-US/components/input' },
                                { text: 'InputGroup', link: '/en-US/components/input-group' },
                                { text: 'InputNumber', link: '/en-US/components/input-number' },
                                { text: 'Password', link: '/en-US/components/password' },
                                { text: 'RadioGroup', link: '/en-US/components/radio-group' },
                                { text: 'Slider', link: '/en-US/components/slider' },
                                { text: 'Switch', link: '/en-US/components/switch' },
                                { text: 'Textarea', link: '/en-US/components/textarea' },
                            ],
                        },
                        {
                            text: 'Selectors',
                            items: [
                                { text: 'AutoComplete', link: '/en-US/components/auto-complete' },
                                { text: 'Calendar', link: '/en-US/components/calendar' },
                                { text: 'ColorPicker', link: '/en-US/components/color-picker' },
                                { text: 'DatePicker', link: '/en-US/components/date-picker' },
                                { text: 'MultiSelect', link: '/en-US/components/multi-select' },
                                { text: 'Select', link: '/en-US/components/select' },
                                { text: 'SelectButton', link: '/en-US/components/select-button' },
                                { text: 'ToggleButton', link: '/en-US/components/toggle-button' },
                            ],
                        },
                        {
                            text: 'Feedback & Overlays',
                            items: [
                                { text: 'ConfirmDialog', link: '/en-US/components/confirm-dialog' },
                                { text: 'Dialog', link: '/en-US/components/dialog' },
                                { text: 'Drawer', link: '/en-US/components/drawer' },
                                { text: 'Message', link: '/en-US/components/message' },
                                { text: 'Popover', link: '/en-US/components/popover' },
                                { text: 'Toast', link: '/en-US/components/toast' },
                            ],
                        },
                        {
                            text: 'Data Display',
                            items: [
                                { text: 'DataTable', link: '/en-US/components/data-table' },
                                { text: 'DataView', link: '/en-US/components/data-view' },
                                { text: 'Paginator', link: '/en-US/components/paginator' },
                                { text: 'ProgressBar', link: '/en-US/components/progress-bar' },
                                { text: 'ProgressSpinner', link: '/en-US/components/progress-spinner' },
                                { text: 'Skeleton', link: '/en-US/components/skeleton' },
                            ],
                        },
                        {
                            text: 'Navigation & Actions',
                            items: [
                                { text: 'Accordion', link: '/en-US/components/accordion' },
                                { text: 'DropdownMenu', link: '/en-US/components/dropdown-menu' },
                                { text: 'Stepper', link: '/en-US/components/stepper' },
                                { text: 'Tabs', link: '/en-US/components/tabs' },
                                { text: 'Toolbar', link: '/en-US/components/toolbar' },
                            ],
                        },
                        {
                            text: 'Capabilities',
                            items: [
                                { text: 'Composables', link: '/en-US/components/composables' },
                                { text: 'Icons', link: '/en-US/components/icons' },
                                { text: 'Built-in text and locales', link: '/en-US/components/locale' },
                            ],
                        },
                    ],
                    '/en-US/design/': [
                        {
                            text: 'Design',
                            items: [
                                { text: 'Design Index', link: '/en-US/design/' },
                            ],
                        },
                    ],
                    '/en-US/standards/': [
                        {
                            text: 'Standards',
                            items: [
                                { text: 'Standards Index', link: '/en-US/standards/' },
                            ],
                        },
                    ],
                    '/en-US/plan/': [
                        {
                            text: 'Plan',
                            items: [
                                { text: 'Overview', link: '/en-US/plan/' },
                            ],
                        },
                    ],
                },
            },
        },
    },
    themeConfig: {
        search: {
            provider: 'local',
            options: {
                locales: {
                    root: {
                        translations: {
                            button: {
                                buttonText: '搜索',
                                buttonAriaLabel: '搜索',
                            },
                            modal: {
                                displayDetails: '显示详细列表',
                                resetButtonTitle: '重置搜索',
                                backButtonTitle: '关闭搜索',
                                noResultsText: '没有结果',
                                footer: {
                                    selectText: '选择',
                                    selectKeyAriaLabel: '回车',
                                    navigateText: '导航',
                                    navigateUpKeyAriaLabel: '上箭头',
                                    navigateDownKeyAriaLabel: '下箭头',
                                    closeText: '关闭',
                                    closeKeyAriaLabel: 'esc',
                                },
                            },
                        },
                    },
                },
                miniSearch: {
                    options: {
                        tokenize: tokenizeLocalSearch,
                    },
                },
            },
        },
        // 兜底：若别名覆盖未生效，语言切换仍保持「回首页」而非落到未翻译路由
        i18nRouting: false,
        // 已翻译路由表，供 theme/composables/langs.ts（语言菜单）判断目标页是否存在
        routingPages,
        nav: [
            { text: '指南', link: '/guide/getting-started' },
            { text: '组件', link: '/components/' },
            { text: '设计', link: '/design/architecture' },
            { text: '规范', link: '/standards/index' },
            { text: '规划', link: '/plan/roadmap' },
        ],
        sidebar: {
            '/guide/': [
                {
                    text: '指南',
                    items: [
                        { text: '快速上手', link: '/guide/getting-started' },
                        { text: '本地联调', link: '/guide/local-linking' },
                        { text: '开发指南', link: '/guide/development' },
                        { text: '发布指南', link: '/guide/release' },
                        { text: 'AI 协同开发', link: '/guide/ai-development' },
                    ],
                },
            ],
            // 组件侧栏定序规则：组间顺序固定为 docs/design/documentation-site.md §11 自上而下的登记顺序，
            // 组内按英文组件名字母序；中英两侧同分组、同组件、同顺序。
            '/components/': [
                { text: '总览', link: '/components/' },
                {
                    text: '基础与布局',
                    items: [
                        { text: 'Avatar 头像', link: '/components/avatar' },
                        { text: 'Badge 徽标', link: '/components/badge' },
                        { text: 'Button 按钮', link: '/components/button' },
                        { text: 'ButtonGroup 按钮组', link: '/components/button-group' },
                        { text: 'Card 卡片', link: '/components/card' },
                        { text: 'Divider 分隔线', link: '/components/divider' },
                        { text: 'Image 图片', link: '/components/image' },
                        { text: 'SplitButton 分裂按钮', link: '/components/split-button' },
                        { text: 'Tag 标签', link: '/components/tag' },
                    ],
                },
                {
                    text: '表单输入',
                    items: [
                        { text: 'Checkbox 复选框', link: '/components/checkbox' },
                        { text: 'CheckboxGroup 复选框组', link: '/components/checkbox-group' },
                        { text: 'FileUpload 文件上传', link: '/components/file-upload' },
                        { text: 'FloatLabel 浮动标签', link: '/components/float-label' },
                        { text: 'Input 输入框', link: '/components/input' },
                        { text: 'InputGroup 输入框组合', link: '/components/input-group' },
                        { text: 'InputNumber 数字输入框', link: '/components/input-number' },
                        { text: 'Password 密码输入框', link: '/components/password' },
                        { text: 'RadioGroup 单选组', link: '/components/radio-group' },
                        { text: 'Slider 滑块', link: '/components/slider' },
                        { text: 'Switch 开关', link: '/components/switch' },
                        { text: 'Textarea 多行输入', link: '/components/textarea' },
                    ],
                },
                {
                    text: '选择器',
                    items: [
                        { text: 'AutoComplete 自动补全', link: '/components/auto-complete' },
                        { text: 'Calendar 日历', link: '/components/calendar' },
                        { text: 'ColorPicker 颜色选择器', link: '/components/color-picker' },
                        { text: 'DatePicker 日期选择器', link: '/components/date-picker' },
                        { text: 'MultiSelect 多选选择器', link: '/components/multi-select' },
                        { text: 'Select 选择器', link: '/components/select' },
                        { text: 'SelectButton 分段选择', link: '/components/select-button' },
                        { text: 'ToggleButton 开关按钮', link: '/components/toggle-button' },
                    ],
                },
                {
                    text: '反馈与浮层',
                    items: [
                        { text: 'ConfirmDialog 确认对话框', link: '/components/confirm-dialog' },
                        { text: 'Dialog 对话框', link: '/components/dialog' },
                        { text: 'Drawer 抽屉', link: '/components/drawer' },
                        { text: 'Message 提示条', link: '/components/message' },
                        { text: 'Popover 浮层', link: '/components/popover' },
                        { text: 'Toast 轻提示', link: '/components/toast' },
                    ],
                },
                {
                    text: '数据展示',
                    items: [
                        { text: 'DataTable 表格', link: '/components/data-table' },
                        { text: 'DataView 数据视图', link: '/components/data-view' },
                        { text: 'Paginator 分页', link: '/components/paginator' },
                        { text: 'ProgressBar 进度条', link: '/components/progress-bar' },
                        { text: 'ProgressSpinner 加载指示', link: '/components/progress-spinner' },
                        { text: 'Skeleton 骨架屏', link: '/components/skeleton' },
                    ],
                },
                {
                    text: '导航与操作',
                    items: [
                        { text: 'Accordion 折叠面板', link: '/components/accordion' },
                        { text: 'DropdownMenu 下拉菜单', link: '/components/dropdown-menu' },
                        { text: 'Stepper 步骤条', link: '/components/stepper' },
                        { text: 'Tabs 选项卡', link: '/components/tabs' },
                        { text: 'Toolbar 工具条', link: '/components/toolbar' },
                    ],
                },
                {
                    text: '能力说明',
                    items: [
                        { text: '组合式 API', link: '/components/composables' },
                        { text: '图标', link: '/components/icons' },
                        { text: '内建文案与语言', link: '/components/locale' },
                    ],
                },
            ],
            '/design/': [
                {
                    text: '设计',
                    items: [
                        { text: '设计索引', link: '/design/index' },
                        { text: '架构设计', link: '/design/architecture' },
                        { text: '主题与样式', link: '/design/theming' },
                        { text: '响应式设计', link: '/design/responsive' },
                        { text: '设计规范', link: '/design/design-spec' },
                        { text: '组件设计', link: '/design/components' },
                        { text: '文档与演示站', link: '/design/documentation-site' },
                        { text: 'momei 使用复核台账', link: '/design/governance/2026-09-14-momei-usage-audit' },
                        { text: 'Phase 7 第一阶段评估', link: '/design/governance/2026-09-14-phase7-first-stage-evaluation' },
                        { text: '2026-09-16 新需求评估', link: '/design/governance/2026-09-16-new-requirements-evaluation' },
                        { text: '下一阶段评估（发布前收口）', link: '/design/governance/2026-09-16-pre-release-stage-evaluation' },
                        { text: 'Session Wisdom 蒸馏', link: '/design/governance/session-wisdom-distillation' },
                        { text: 'Session 经验归档', link: '/design/governance/experience-archive' },
                    ],
                },
            ],
            '/standards/': [
                {
                    text: '项目规范',
                    items: [
                        { text: '规范索引', link: '/standards/index' },
                        { text: '开发规范', link: '/standards/development' },
                        { text: '测试规范', link: '/standards/testing' },
                        { text: '文档规范', link: '/standards/documentation' },
                        { text: 'Git 规范', link: '/standards/git' },
                        { text: '安全规范', link: '/standards/security' },
                        { text: '规划规范', link: '/standards/planning' },
                        { text: 'AI 协作规范', link: '/standards/ai-collaboration' },
                        { text: 'AI 资产治理', link: '/standards/ai-governance' },
                    ],
                },
            ],
            '/plan/': [
                {
                    text: '规划',
                    items: [
                        { text: '路线图', link: '/plan/roadmap' },
                        { text: '待办事项', link: '/plan/todo' },
                        { text: 'Backlog', link: '/plan/backlog' },
                        { text: '长期任务', link: '/plan/recurring' },
                        { text: '待办归档', link: '/plan/todo-archive' },
                    ],
                },
            ],
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/CaoMeiYouRen/caomei-ui' },
        ],
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2026 CaoMeiYouRen',
        },
    },
})
