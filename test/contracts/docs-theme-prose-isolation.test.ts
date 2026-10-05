import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 文档站正文排版隔离契约（第三方内核浮层）。
 *
 * 契约：`docs/.vitepress/theme/caomei-demo.css` 必须把 `md-editor-v3`（RichTextEditor 内核）
 * 的下拉菜单子树从 VitePress 的正文列表排版中排除——`.vp-doc ul` 的 `padding-left: 1.25rem`
 * （0-1-1）会压过内核自带的 `.md-editor-menu { padding-inline: 0 }`（0-1-0），把菜单顶入 20px；
 * `.vp-doc li + li` 另加 8px 间距。故须有 `.vp-doc .md-editor-menu`（复位内边距 / 列表样式）
 * 与 `.vp-doc .md-editor-menu-item`（复位 `margin-top`）两条隔离规则。
 *
 * 归因与实测见 `docs/design/governance/2026-10-02-rich-text-editor-dropdown-indent.md`；
 * 真实留白消除由文档站真实 Chromium 实测取证（V 阶段）。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const THEME_CSS = join(REPO_ROOT, 'docs', '.vitepress', 'theme', 'caomei-demo.css')

export interface IsolationIssue {
    reason: string
}

function styleRules(css: string): { selector: string, body: string }[] {
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '')
    return [...stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({ selector: match[1].trim(), body: match[2] }))
}

function bodyOf(css: string, selector: string): string | null {
    const rule = styleRules(css)
        .filter((item) => item.selector.split(',').map((part) => part.trim()).includes(selector))
    return rule.length > 0 ? rule.map((item) => item.body).join(';') : null
}

/**
 * 校验文档站正文排版隔离规则。
 *
 * @param css `caomei-demo.css` 文本
 * @returns 违约项（空数组即通过）
 */
export function checkDocsThemeProseIsolation(css: string): IsolationIssue[] {
    const issues: IsolationIssue[] = []
    const menu = bodyOf(css, '.vp-doc .md-editor-menu')
    if (menu === null) {
        issues.push({ reason: '缺少 `.vp-doc .md-editor-menu` 隔离规则（内核菜单会被正文列表排版顶入内边距）' })
    } else {
        if (!/(?:^|[;{\s])padding-(?:inline|left|inline-start)\s*:\s*0\b/.test(menu)) {
            issues.push({ reason: '内核菜单须复位内边距（`padding-inline: 0`）' })
        }
        if (!/(?:^|[;{\s])margin-block\s*:\s*0\b/.test(menu)) {
            issues.push({ reason: '内核菜单须复位纵向外边距（`margin-block: 0`）' })
        }
        if (!/(?:^|[;{\s])list-style\s*:\s*none\b/.test(menu)) {
            issues.push({ reason: '内核菜单须复位列表标记（`list-style: none`）' })
        }
    }
    const item = bodyOf(css, '.vp-doc .md-editor-menu-item')
    if (item === null || !/(?:^|[;{\s])margin-top\s*:\s*0\b/.test(item)) {
        issues.push({ reason: '内核菜单项须复位 `margin-top: 0`（`.vp-doc li + li` 的 8px 泄漏）' })
    }
    return issues
}

describe('文档站正文排版隔离契约（判定函数）', () => {
    const good = '.vp-doc .md-editor-menu { padding-inline: 0; margin-block: 0; list-style: none; }\n.vp-doc .md-editor-menu-item { margin-top: 0; }'
    const cases: { name: string, css: string, issues: number }[] = [
        { name: '菜单 + 菜单项隔离齐全 → 通过', css: good, issues: 0 },
        { name: '缺菜单隔离规则 → 违约', css: '.vp-doc .md-editor-menu-item { margin-top: 0; }', issues: 1 },
        { name: '菜单未复位内边距 → 违约', css: '.vp-doc .md-editor-menu { margin-block: 0; list-style: none; }\n.vp-doc .md-editor-menu-item { margin-top: 0; }', issues: 1 },
        { name: '缺菜单项隔离 → 违约', css: '.vp-doc .md-editor-menu { padding-inline: 0; margin-block: 0; list-style: none; }', issues: 1 },
        { name: '注释内出现选择器不算声明 → 违约（缺规则）', css: '/* .vp-doc .md-editor-menu { padding-inline: 0; } */', issues: 2 },
    ]

    it.each(cases)('$name', ({ css, issues }) => {
        expect(checkDocsThemeProseIsolation(css)).toHaveLength(issues)
    })
})

describe('文档站正文排版隔离契约（仓库现状）', () => {
    it('caomei-demo.css 含内核浮层隔离规则', () => {
        expect(checkDocsThemeProseIsolation(readFileSync(THEME_CSS, 'utf8'))).toEqual([])
    })
})
