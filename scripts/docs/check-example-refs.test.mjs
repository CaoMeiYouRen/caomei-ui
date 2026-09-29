import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    collectMarkdownFiles,
    docsRoot,
    findDemoRefs,
    findSfcShapeIssues,
    MIN_DEMO_REFS,
    MIN_EXAMPLE_FILES,
    MIN_SCANNED_FILES,
    projectRoot,
    REQUIRED_SCAN_PREFIXES,
    rootTemplateRange,
    runExampleRefsCheck,
    stripCode,
} from './check-example-refs.mjs'

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-example-refs-'))
    tempDirs.push(dir)
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

const RELAXED = { minFiles: 0, minRefs: 0, minExamples: 0, requiredPrefixes: [] }

describe('示例引用提取', () => {
    it('解析单行与多行 <demo vue>', () => {
        const file = '/tmp/x/components/a.md'
        const raw = [
            '<demo vue="../examples/a.vue" ssg="true" />',
            '',
            '<demo',
            '    vue="../examples/b.vue"',
            '    ssg="true"',
            '/>',
            '',
        ].join('\n')
        const refs = findDemoRefs(file, raw)
        expect(refs.map((r) => r.target)).toEqual(['../examples/a.vue', '../examples/b.vue'])
        expect(refs[0].line).toBe(1)
        expect(refs[1].line).toBe(3)
    })

    it('围栏代码块与行内代码内的 <demo> 视为语法描述、不提取', () => {
        const raw = [
            '```md',
            '<demo vue="../examples/a.vue" />',
            '```',
            '',
            '正文 ` <demo vue="../examples/b.vue" /> ` 说明',
            '',
        ].join('\n')
        expect(findDemoRefs('/tmp/x/components/a.md', raw)).toEqual([])
    })

    it('无 vue 属性的 <demo> 不产生引用', () => {
        expect(findDemoRefs('/tmp/x/components/a.md', '<demo ssg="true" />')).toEqual([])
    })

    it('stripCode 移除围栏与行内代码并保留换行', () => {
        expect(stripCode('a `b` c')).toBe('a  c')
        expect(stripCode('```\n<demo vue="x" />\n```').split('\n')).toHaveLength(3)
    })

    it('围栏代码块之后的引用行号不因剥离而偏移', () => {
        const raw = ['```ts', 'const a = 1', '```', '', '<demo vue="../examples/ok.vue" />', ''].join('\n')
        const refs = findDemoRefs('/tmp/x/components/a.md', raw)
        expect(refs).toHaveLength(1)
        expect(refs[0].line).toBe(5)
    })
})

describe('示例引用存在性', () => {
    it('缺失示例报 missing-example 并带行号', () => {
        const root = createFixture({
            'docs/components/a.md': '# A\n\n<demo vue="../examples/missing.vue" />\n',
        })
        const { issues, refs } = runExampleRefsCheck({ root, ...RELAXED })
        expect(refs).toBe(1)
        expect(issues).toHaveLength(1)
        expect(issues[0].type).toBe('missing-example')
        expect(issues[0].message).toContain('docs/components/a.md:3')
        expect(issues[0].message).toContain('../examples/missing.vue')
    })

    it('存在的示例不报问题', () => {
        const root = createFixture({
            'docs/components/a.md': '# A\n\n<demo vue="../examples/ok.vue" />\n',
            'docs/examples/ok.vue': '<template><div /></template>\n',
        })
        const { issues, refs } = runExampleRefsCheck({ root, ...RELAXED })
        expect(refs).toBe(1)
        expect(issues).toEqual([])
    })

    it('英文镜像缺失时报错（跨 locale 目录解析）', () => {
        const root = createFixture({
            'docs/i18n/en-US/components/a.md': '# A\n\n<demo vue="../examples/only-zh.vue" />\n',
            'docs/examples/only-zh.vue': '<template><div /></template>\n',
        })
        const { issues } = runExampleRefsCheck({ root, ...RELAXED })
        expect(issues).toHaveLength(1)
        expect(issues[0].type).toBe('missing-example')
    })
})

describe('示例 SFC 形态', () => {
    it('根 template 按标签深度配对（嵌套 v-if template 不提前闭合）', () => {
        const source = [
            '<template>',
            '  <div>',
            '    <template v-if="ok"><span>a</span></template>',
            '  </div>',
            '</template>',
            '<style scoped>.a { color: red; }</style>',
        ].join('\n')
        const range = rootTemplateRange(source)
        expect(range).not.toBeNull()
        expect(source.slice(range.end)).toContain('<style scoped>')
    })

    it('根 template 未闭合时返回 null', () => {
        expect(rootTemplateRange('<template><div>a</div>')).toBeNull()
    })

    it('合法示例（style 在 template 之外）不报问题', () => {
        const source = '<template><div class="a" /></template>\n\n<style scoped>.a { color: red; }</style>\n'
        expect(findSfcShapeIssues('docs/examples/x.vue', source)).toEqual([])
    })

    it('template 内嵌 style 报 example-sfc-shape 并带行号', () => {
        const source = ['<template>', '  <div />', '', '  <style scoped>.a { color: red; }</style>', '</template>', ''].join('\n')
        const issues = findSfcShapeIssues('docs/examples/x.vue', source)
        expect(issues).toHaveLength(1)
        expect(issues[0].type).toBe('example-sfc-shape')
        expect(issues[0].message).toContain('docs/examples/x.vue:4')
        expect(issues[0].message).toContain('<style>')
    })

    it('template 内嵌 script 同样报错', () => {
        const issues = findSfcShapeIssues('docs/examples/x.vue', '<template><script>1</script></template>')
        expect(issues).toHaveLength(1)
        expect(issues[0].message).toContain('<script>')
    })

    it('缺少根 template 报 example-sfc-shape', () => {
        const issues = findSfcShapeIssues('docs/examples/x.vue', '<style scoped>.a { color: red; }</style>\n')
        expect(issues).toHaveLength(1)
        expect(issues[0].message).toContain('未找到成对的根 <template>')
    })

    it('template 内 HTML 注释里的 <style> 不算副作用标签（已剥离注释）', () => {
        const source = ['<template>', '  <div />', '  <!-- <style scoped>.a { color: red; }</style> -->', '</template>', ''].join('\n')
        expect(findSfcShapeIssues('docs/examples/x.vue', source)).toEqual([])
    })
})

describe('示例 SFC 形态（守卫集成）', () => {
    it('引用到 template 内嵌 style 的示例时报 example-sfc-shape', () => {
        const root = createFixture({
            'docs/components/a.md': '# A\n\n<demo vue="../examples/bad.vue" />\n',
            'docs/examples/bad.vue': '<template>\n  <div />\n\n  <style scoped>.a { color: red; }</style>\n</template>\n',
        })
        const { issues, examples } = runExampleRefsCheck({ root, ...RELAXED })
        expect(examples).toBe(1)
        expect(issues).toHaveLength(1)
        expect(issues[0].type).toBe('example-sfc-shape')
        expect(issues[0].message).toContain('docs/examples/bad.vue:4')
    })
})

describe('受检面抗静默收窄', () => {
    it('文件数低于下界报 scan-scope-narrowed', () => {
        const root = createFixture({ 'docs/components/a.md': '# A\n' })
        const { issues } = runExampleRefsCheck({ root, minFiles: 5, minRefs: 0, minExamples: 0, requiredPrefixes: [] })
        expect(issues.some((i) => i.type === 'scan-scope-narrowed' && i.message.includes('文件数'))).toBe(true)
    })

    it('引用数低于下界报 scan-scope-narrowed', () => {
        const root = createFixture({
            'docs/components/a.md': '# A\n\n<demo vue="../examples/ok.vue" />\n',
            'docs/examples/ok.vue': '<template><div /></template>\n',
        })
        const { issues } = runExampleRefsCheck({ root, minFiles: 0, minRefs: 5, minExamples: 0, requiredPrefixes: [] })
        expect(issues.some((i) => i.type === 'scan-scope-narrowed' && i.message.includes('示例引用数'))).toBe(true)
    })

    it('缺少中英前缀报 scan-scope-narrowed', () => {
        const root = createFixture({ 'docs/components/a.md': '# A\n' })
        const { issues } = runExampleRefsCheck({ root, minFiles: 0, minRefs: 0, minExamples: 0, requiredPrefixes: ['i18n/en-US/components/'] })
        expect(issues.some((i) => i.type === 'scan-scope-narrowed' && i.message.includes('i18n/en-US/components/'))).toBe(true)
    })

    it('受检示例文件数低于下界报 scan-scope-narrowed', () => {
        const root = createFixture({
            'docs/components/a.md': '# A\n\n<demo vue="../examples/ok.vue" />\n',
            'docs/examples/ok.vue': '<template><div /></template>\n',
        })
        const { issues } = runExampleRefsCheck({ root, minFiles: 0, minRefs: 0, minExamples: 5, requiredPrefixes: [] })
        expect(issues.some((i) => i.type === 'scan-scope-narrowed' && i.message.includes('受检示例文件数'))).toBe(true)
    })
})

describe('仓库现状', () => {
    it('受检面下界与真实仓库一致（未收窄）', () => {
        const files = collectMarkdownFiles(docsRoot)
        expect(files.length).toBeGreaterThanOrEqual(MIN_SCANNED_FILES)
        const { refs, examples } = runExampleRefsCheck()
        expect(refs).toBeGreaterThanOrEqual(MIN_DEMO_REFS)
        expect(examples).toBeGreaterThanOrEqual(MIN_EXAMPLE_FILES)
    })

    it('真实仓库示例引用全部存在且 SFC 形态合法', () => {
        const { issues } = runExampleRefsCheck()
        expect(issues).toEqual([])
    })

    it('前缀常量与中英组件页约定一致', () => {
        expect(REQUIRED_SCAN_PREFIXES).toEqual(['components/', 'i18n/en-US/components/'])
        expect(existsSync(projectRoot)).toBe(true)
    })
})
