#!/usr/bin/env node

/**
 * check-i18n-routing：校验文档站构建产物中的语言切换链接。
 *
 * 覆盖感知规则：已翻译页回切对应路由，未翻译页回退目标 locale 首页。
 * 该规则由 `docs/.vitepress/theme/composables/langs.ts`（经 Vite alias 覆盖默认主题）
 * 统一实现，桌面 / 平板 / 移动端三处菜单共用同一 composable，因此产物中同一语言的
 * 所有切换链接应完全一致——若别名静默失效，这里会因出现「回首页」链接而失败。
 *
 * 用法：node scripts/docs/check-i18n-routing.mjs（需先执行 docs:build）
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const distRoot = join(projectRoot, 'docs/.vitepress/dist')

/**
 * 文档站语言切换的期望链接（相对 dist 的页面路径 + 菜单语言名 + 期望 href）。
 *
 * 维护契约：当某页新增 / 移除翻译时，需同步更新对应用例的 `expected`
 * （未翻译页 → `/en-US/`，已翻译页 → `/en-US/<route>`），否则守卫会按预期失败。
 */
export const ROUTING_CASES = [
    { page: 'guide/locale.html', label: 'English', expected: '/en-US/guide/locale', reason: '已翻译页回切对应路由' },
    { page: 'components/button.html', label: 'English', expected: '/en-US/components/button', reason: '已翻译页回切对应路由' },
    { page: 'design/components.html', label: 'English', expected: '/en-US/', reason: '未翻译页回退 locale 首页' },
    { page: 'standards/development.html', label: 'English', expected: '/en-US/', reason: '未翻译页回退 locale 首页' },
    { page: 'plan/todo.html', label: 'English', expected: '/en-US/', reason: '未翻译页回退 locale 首页' },
    { page: 'en-US/guide/locale.html', label: '简体中文', expected: '/guide/locale', reason: '反向回切中文源页' },
    { page: 'en-US/design/index.html', label: '简体中文', expected: '/design/', reason: '反向回切中文源页' },
]

/**
 * 提取 HTML 中所有「文本等于 label」的锚点 href。
 *
 * 同时兼容三种菜单的标记：默认主题的桌面 / 平板菜单把文本包在 span 与注释标记中，
 * 移动端菜单为直接文本。
 */
export function collectHrefsForLabel(html, label) {
    const hrefs = []
    const anchorRe = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
    for (const match of html.matchAll(anchorRe)) {
        const text = match[2].replace(/<[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '').trim()
        if (text === label) {
            hrefs.push(match[1])
        }
    }
    return hrefs
}

/** 校验单个页面，返回错误信息列表（空数组表示通过） */
export function checkPage(distDir, testCase) {
    const file = join(distDir, testCase.page)
    if (!existsSync(file)) {
        return [`缺少构建产物：${testCase.page}（请先执行 pnpm docs:build）`]
    }
    const hrefs = collectHrefsForLabel(readFileSync(file, 'utf8'), testCase.label)
    if (hrefs.length === 0) {
        return [`${testCase.page}：未找到语言「${testCase.label}」的切换链接`]
    }
    return hrefs
        .filter((href) => href !== testCase.expected)
        .map((href) => `${testCase.page}：语言「${testCase.label}」链接为 ${href}，期望 ${testCase.expected}（${testCase.reason}）`)
}

export function runCheck(distDir = distRoot) {
    const errors = []
    for (const testCase of ROUTING_CASES) {
        errors.push(...checkPage(distDir, testCase))
    }
    return errors
}

function main() {
    const errors = runCheck()
    if (errors.length > 0) {
        for (const error of errors) {
            console.error(`[check-i18n-routing] ✖ ${error}`)
        }
        process.exit(1)
    }
    console.info(`[check-i18n-routing] 通过：${ROUTING_CASES.length} 条语言切换链接符合覆盖感知规则`)
}

if (isDirectExecution(import.meta.url)) {
    main()
}
