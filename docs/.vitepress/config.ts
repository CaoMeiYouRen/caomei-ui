import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { vitepressDemoPlugin } from 'vitepress-demo-plugin/markdown'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(dirname, '../../src')

// GitHub Pages 项目站点部署在 /<repo>/ 子路径下，需要设置 base；
// 本地开发与自定义域名部署保持默认 '/'。由 VITEPRESS_BASE 环境变量控制。
const base = process.env.VITEPRESS_BASE ?? '/'

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
                        { text: 'Select 选择器', link: '/components/select' },
                        { text: 'Dialog 对话框', link: '/components/dialog' },
                        { text: 'Toast 轻提示', link: '/components/toast' },
                        { text: 'Card 卡片', link: '/components/card' },
                        { text: 'Checkbox 复选框', link: '/components/checkbox' },
                        { text: 'Switch 开关', link: '/components/switch' },
                        { text: 'DataTable 表格', link: '/components/data-table' },
                        { text: 'Paginator 分页', link: '/components/paginator' },
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
