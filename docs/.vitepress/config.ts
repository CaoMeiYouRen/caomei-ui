import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'caomei-ui',
  description: '基于 Vue 3 + Reka UI 的自建组件库',
  lang: 'zh-CN',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '组件', link: '/design/components' },
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
      '/design/': [
        {
          text: '设计',
          items: [
            { text: '设计索引', link: '/design/index' },
            { text: '架构设计', link: '/design/architecture' },
            { text: '主题与样式', link: '/design/theming' },
            { text: '组件设计', link: '/design/components' },
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
