import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin/markdown'
import { normalizePath, type Plugin, type ViteDevServer } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(dirname, '../../src')
const componentsDir = path.resolve(srcDir, 'components')

// GitHub Pages 项目站点部署在 /<repo>/ 子路径下，需要设置 base；
// 本地开发与自定义域名部署保持默认 '/'。由 VITEPRESS_BASE 环境变量控制。
const base = process.env.VITEPRESS_BASE ?? '/'

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
async function setupComponentMetaWatch(server: ViteDevServer): Promise<void> {
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

    const flush = () => {
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
                    if (mod) {
                        server.moduleGraph.invalidateModule(mod)
                    }
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

    const schedule = (file: string) => {
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
        configureServer(server) {
            setupComponentMetaWatch(server).catch((error) => {
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
            },
        },
    },
    themeConfig: {
        nav: [
            { text: '指南', link: '/guide/getting-started' },
            { text: '组件', link: '/components/button' },
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
                        { text: '开发指南', link: '/guide/development' },
                        { text: '发布指南', link: '/guide/release' },
                        { text: 'AI 协同开发', link: '/guide/ai-development' },
                    ],
                },
            ],
            '/components/': [
                {
                    text: '基础组件',
                    items: [
                        { text: 'Button 按钮', link: '/components/button' },
                        { text: 'Avatar 头像', link: '/components/avatar' },
                        { text: 'Input 输入框', link: '/components/input' },
                        { text: 'Textarea 多行输入', link: '/components/textarea' },
                        { text: 'InputNumber 数字输入框', link: '/components/input-number' },
                        { text: 'Password 密码输入框', link: '/components/password' },
                        { text: 'Select 选择器', link: '/components/select' },
                        { text: 'MultiSelect 多选选择器', link: '/components/multi-select' },
                        { text: 'SelectButton 分段选择', link: '/components/select-button' },
                        { text: 'Image 图片', link: '/components/image' },
                        { text: 'FileUpload 文件上传', link: '/components/file-upload' },
                        { text: 'Dialog 对话框', link: '/components/dialog' },
                        { text: 'ConfirmDialog 确认对话框', link: '/components/confirm-dialog' },
                        { text: 'Toast 轻提示', link: '/components/toast' },
                        { text: 'Message 提示条', link: '/components/message' },
                        { text: 'Card 卡片', link: '/components/card' },
                        { text: 'Checkbox 复选框', link: '/components/checkbox' },
                        { text: 'Switch 开关', link: '/components/switch' },
                        { text: 'RadioGroup 单选组', link: '/components/radio-group' },
                        { text: 'Slider 滑块', link: '/components/slider' },
                        { text: 'ToggleButton 开关按钮', link: '/components/toggle-button' },
                        { text: 'Toolbar 工具条', link: '/components/toolbar' },
                        { text: 'DataTable 表格', link: '/components/data-table' },
                        { text: 'Paginator 分页', link: '/components/paginator' },
                        { text: 'ProgressSpinner 加载指示', link: '/components/progress-spinner' },
                        { text: 'Tabs 选项卡', link: '/components/tabs' },
                        { text: 'Accordion 折叠面板', link: '/components/accordion' },
                        { text: 'DropdownMenu 下拉菜单', link: '/components/dropdown-menu' },
                        { text: 'Tag 标签', link: '/components/tag' },
                        { text: 'Badge 徽标', link: '/components/badge' },
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
                        { text: '组件设计', link: '/design/components' },
                        { text: '文档与演示站', link: '/design/documentation-site' },
                        { text: 'Session Wisdom 蒸馏', link: '/design/governance/session-wisdom-distillation' },
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
