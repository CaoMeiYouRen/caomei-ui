import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    ALLOWED_TOKENS,
    SENTINEL_FILES,
    checkClassPrefix,
    extractStyleRegions,
    findAllowlistRot,
    findScopeIssues,
    findSentinelIssues,
    scanSource,
    stripNonSelectorText,
} from './check-class-prefix.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

/** 构造一个最小 src 树（校验器以目录为受检面）。 */
function makeTree(files) {
    const root = mkdtempSync(join(tmpdir(), 'check-class-prefix-'))
    tempDirs.push(root)
    for (const [rel, content] of Object.entries(files)) {
        const file = join(root, rel)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return root
}

describe('extractStyleRegions', () => {
    it('.vue 取全部 <style> 块并记录块体起始行（块体从 <style> 标签行起算）', () => {
        const source = [
            '<template><i class="caomei-x" /></template>',
            '<style>',
            '.caomei-x { color: red }',
            '</style>',
        ].join('\n')
        const regions = extractStyleRegions('a.vue', source)
        expect(regions).toHaveLength(1)
        expect(regions[0].startLine).toBe(2)
        expect(regions[0].body.trim()).toBe('.caomei-x { color: red }')
    })

    it('.css 整份文件作为一个样式区', () => {
        expect(extractStyleRegions('a.css', '.caomei-x {}')).toEqual([
            { body: '.caomei-x {}', startLine: 1 },
        ])
    })
})

describe('stripNonSelectorText', () => {
    it('剥离注释与字符串且保留换行', () => {
        const cleaned = stripNonSelectorText('/* .caumei-a */\ncontent: ".caumei-b"\n.caomei-c {}')
        expect(cleaned).not.toContain('caumei-a')
        expect(cleaned).not.toContain('caumei-b')
        expect(cleaned).toContain('.caomei-c')
        expect(cleaned.split('\n')).toHaveLength(3)
    })
})

describe('scanSource 正例（前缀拼写错误必须命中）', () => {
    it.each([
        ['.caumei-button--icon-only { color: red }', 'caumei-button--icon-only'],
        ['.caomei-select .caum-field { color: red }', 'caum-field'],
        ['.caomei-x { } .caomei { }', 'caomei'],
        ['.camei-tag { color: red }', 'camei-tag'],
    ])('命中：%s', (source, token) => {
        const { violations } = scanSource(source)
        expect(violations).toHaveLength(1)
        expect(violations[0].token.toLowerCase()).toBe(token)
    })
})

describe('scanSource 反例（合法形态不得误报）', () => {
    it.each([
        '.caomei-button { color: red }',
        '.caomei-rich-text-editor :deep(.md-editor) { color: red }',
        '.cm-editor { color: red }',
        '.vp-doc .caomei-tag { color: red }',
        '[data-caumei="x"] { color: red }',
        'background: url(caumei.png)',
        '.caomei-a::after { content: ".caumei-typo" }',
        '/* .caumei-typo */ .caomei-a { color: red }',
    ])('不误报：%s', (source) => {
        expect(scanSource(source).violations).toEqual([])
    })

    it('统计 ca 前缀令牌数与合法前缀数（非 ca 前缀令牌不计入）', () => {
        const { occurrences } = scanSource('.caomei-a { } .caomei-b { } .card { } .cm-editor { }')
        expect(occurrences).toEqual({ total: 3, prefixed: 2 })
    })

    it('报告准确行号（含 .vue 样式块偏移）', () => {
        const source = [
            '<template><div /></template>',
            '<style>',
            '.caomei-a { color: red }',
            '.caumei-b { color: red }',
            '</style>',
        ].join('\n')
        const { violations } = scanSource(source, { file: 'x.vue' })
        expect(violations).toHaveLength(1)
        expect(violations[0].line).toBe(4)
    })

    it('允许名单内的令牌不报错，但仍计入 nonPrefixedTokens', () => {
        const result = scanSource('.card { color: red }', { allowlist: ['card'] })
        expect(result.violations).toEqual([])
        expect([...result.nonPrefixedTokens]).toEqual(['card'])
    })
})

describe('findAllowlistRot', () => {
    it('名单项形态非法即报错', () => {
        const errors = findAllowlistRot(['.card', 'CARD', 'md-editor'], new Set(['.card']))
        expect(errors).toHaveLength(3)
        expect(errors.join('\n')).toContain('形态非法')
    })

    it('名单项不再出现即报错（防永久豁免）', () => {
        expect(findAllowlistRot(['caret'], new Set())).toHaveLength(1)
        expect(findAllowlistRot(['caret'], new Set(['caret']))).toEqual([])
    })
})

describe('findScopeIssues', () => {
    it('低于下界即报错（三项各一条）', () => {
        expect(findScopeIssues({ files: 1, regions: 1, occurrences: 1 })).toHaveLength(3)
    })

    it('达到下界不报错', () => {
        expect(findScopeIssues({ files: 90, regions: 81, occurrences: 914 })).toEqual([])
    })
})

describe('checkClassPrefix（合成受检面）', () => {
    const tinyBounds = { files: 1, regions: 1, occurrences: 1 }

    it('发现违规并给出文件:行号', () => {
        const root = makeTree({
            'a.vue': '<template><i /></template>\n<style>\n.caumei-typo { color: red }\n</style>',
            'b.css': '.caomei-ok {}',
        })
        const result = checkClassPrefix(root, { bounds: tinyBounds })
        expect(result.ok).toBe(false)
        expect(result.errors.join('\n')).toContain('a.vue:3')
    })

    it('干净受检面通过', () => {
        const root = makeTree({
            'a.vue': '<style>.caomei-ok { color: red }</style>',
            'b.scss': '.caomei-x { color: red }',
        })
        const result = checkClassPrefix(root, { bounds: tinyBounds })
        expect(result.ok).toBe(true)
        expect(result.details).toMatchObject({ files: 2, regions: 2 })
    })
})

describe('仓库不变量', () => {
    it('当前仓库零前缀拼写违规且受检面未收窄', () => {
        const result = checkClassPrefix()
        expect(result.errors).toEqual([])
        expect(result.details.files).toBeGreaterThanOrEqual(70)
        expect(result.details.regions).toBeGreaterThanOrEqual(65)
        expect(result.details.occurrences).toBeGreaterThanOrEqual(700)
    })

    it('允许名单当前为空（零例外）', () => {
        expect(ALLOWED_TOKENS).toEqual([])
    })
})

describe('SCSS 行注释与 URL 边界（W2）', () => {
    it('剥离 `//` 行注释，但不误伤 `https://` 与转义', () => {
        const cleaned = stripNonSelectorText(
            ['// .caumei-typo', '.caomei-a { background: url(https://x/a.png) }', '.caomei-b {} // .caumei-typo2'].join('\n'),
        )
        expect(cleaned).not.toContain('caumei-typo')
        expect(cleaned).not.toContain('caumei-typo2')
        expect(cleaned).toContain('.caomei-a')
        expect(cleaned).toContain('https://x/a.png')
        expect(cleaned.split('\n')).toHaveLength(3)
    })

    it('字符串 / 协议相对 URL 内的 `//` 不截断整行（真实违规仍命中）', () => {
        for (const line of [
            '.caomei-a { content: "x//y" } .caumei-typo { color: red }',
            '.caomei-a { background: url(//cdn/x.png) } .caumei-typo {}',
            '.caomei-a { background: url(https://x/a.png) } .caumei-typo {}',
        ]) {
            const { violations } = scanSource(line)
            expect(violations, line).toHaveLength(1)
            expect(violations[0].token.toLowerCase()).toBe('caumei-typo')
        }
    })

    it('`//` 注释中的拼写反例不误报，真实违规仍命中', () => {
        const source = ['// .caumei-typo', '.caomei-ok { color: red }', '.caumei-real { color: red }'].join('\n')
        const { violations } = scanSource(source)
        expect(violations).toHaveLength(1)
        expect(violations[0].token.toLowerCase()).toBe('caumei-real')
    })
})

describe('哨兵文件断言（W1：防止受检根被收窄）', () => {
    it('默认受检面（仓库 src）含全部哨兵文件且零问题', () => {
        const result = checkClassPrefix()
        expect(result.errors).toEqual([])
        expect(result.details.files).toBeGreaterThanOrEqual(70)
    })

    it('受检根收窄到子目录时哨兵断言报错（数量下界此时仍通过）', () => {
        const narrow = checkClassPrefix('src/components', {
            bounds: { files: 1, regions: 1, occurrences: 1 },
            enforceSentinels: true,
        })
        expect(narrow.ok).toBe(false)
        expect(narrow.errors.join('\n')).toContain('哨兵文件')
        expect(narrow.errors.join('\n')).toContain('src/styles/theme.css')
    })

    it('哨兵清单非空且形如仓库相对路径', () => {
        expect(SENTINEL_FILES.length).toBeGreaterThanOrEqual(3)
        for (const file of SENTINEL_FILES) {
            expect(file.startsWith('src/'), file).toBe(true)
        }
    })
})

describe('允许名单形态校验（S2）', () => {
    it.each(['ca.', 'ca me', '-ca', 'caomei-x'])('形态非法：%s', (entry) => {
        expect(findAllowlistRot([entry], new Set([entry]))[0]).toContain('形态非法')
    })

    it('合法令牌形态不报错', () => {
        expect(findAllowlistRot(['card', 'caret'], new Set(['card', 'caret']))).toEqual([])
    })
})

describe('CLI 退出码（负向对照端到端，S3）', () => {
    const script = join(process.cwd(), 'scripts/governance/check-class-prefix.mjs')

    function runCli(args) {
        return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' })
    }

    it('干净合成受检面 exit 0，并提示已跳过下界与哨兵', () => {
        const root = makeTree({ 'a.vue': '<style>.caomei-ok { color: red }</style>' })
        const result = runCli(['--fixture', root])
        expect(result.stderr).toContain('--fixture 模式已跳过受检面下界与哨兵断言')
        expect(result.status).toBe(0)
    })

    it('注入拼写错误 exit 1 并输出文件与行号', () => {
        const root = makeTree({ 'a.vue': '<template><i /></template>\n<style>\n.caumei-typo { color: red }\n</style>' })
        const result = runCli(['--fixture', root])
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('a.vue:3')
        expect(result.stderr).toContain('caumei-typo')
    })

    it('无参数（默认仓库 src 路径，gate 链调用形态）exit 0', () => {
        const result = runCli([])
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('check-class-prefix] 通过')
    })

    it('非 --fixture 的位置参数 exit 2（不存在静默逃生门）', () => {
        const result = runCli([join(process.cwd(), 'src')])
        expect(result.status).toBe(2)
        expect(result.stderr).toContain('不支持的参数')
    })

    it('--fixture 缺受检根 exit 2', () => {
        expect(runCli(['--fixture']).status).toBe(2)
    })
})
