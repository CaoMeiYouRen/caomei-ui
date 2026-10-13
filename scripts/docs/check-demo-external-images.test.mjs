import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import {
    EXAMPLE_DIR_PREFIXES,
    MIN_SCANNED_EXAMPLES,
    checkScannedScope,
    collectExampleFiles,
    findExternalImageSources,
    resolveTargetRoot,
    runDemoExternalImageCheck,
} from './check-demo-external-images.mjs'

/** 自工作目录向上定位仓库根（以 `.github/skills` 为锚点）。 */
function resolveRepoRoot() {
    let dir = process.cwd()
    while (!existsSync(join(dir, '.github/skills'))) {
        const parent = dirname(dir)
        if (parent === dir) {
            throw new Error('未能定位仓库根目录')
        }
        dir = parent
    }
    return dir
}

const PROJECT_ROOT = resolveRepoRoot()
const SCRIPT_PATH = join(PROJECT_ROOT, 'scripts/docs/check-demo-external-images.mjs')

const tempDirs = []

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

function createFixture(files) {
    const dir = mkdtempSync(join(tmpdir(), 'check-demo-external-images-'))
    tempDirs.push(dir)
    writeFileSync(join(dir, 'package.json'), '{}\n')
    for (const [relativePath, content] of Object.entries(files)) {
        const file = join(dir, relativePath)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
    return dir
}

/** 构造足量示例文件路径（供受检面下界断言使用）。 */
function manyPaths(count, prefix = 'docs/examples/demo') {
    return Array.from({ length: count }, (_, index) => `${prefix}-${index}.vue`)
}

describe('外部图片源识别', () => {
    it('命中外链字面量并报出行号', () => {
        const issues = findExternalImageSources([
            { file: 'docs/examples/a/demo.vue', content: '<script setup>\nconst src = \'https://picsum.photos/300\'\n</script>' },
        ])
        expect(issues).toHaveLength(1)
        expect(issues[0]).toMatchObject({ type: 'external-image-source', file: 'docs/examples/a/demo.vue', line: 2 })
    })

    it('命中 http / https 两种协议', () => {
        const issues = findExternalImageSources([
            { file: 'a.vue', content: 'const a = \'http://example.org/x.png\'' },
            { file: 'b.vue', content: 'const b = \'https://example.org/y.png\'' },
        ])
        expect(issues.map((issue) => issue.file)).toEqual(['a.vue', 'b.vue'])
    })

    it('命中属性绑定与样式 url() 形态', () => {
        const issues = findExternalImageSources([
            { file: 'a.vue', content: '<img :src="\'https://cdn.host/x.png\'" />' },
            { file: 'b.vue', content: '.x { background-image: url(https://cdn.host/y.png); }' },
        ])
        expect(issues).toHaveLength(2)
    })

    it('命中模板字符串拼接出的外链', () => {
        const issues = findExternalImageSources([
            { file: 'a.vue', content: 'files.map((f) => `https://cdn.example.com/${f.name}`)' },
        ])
        expect(issues).toHaveLength(1)
    })

    it('不命中本地占位图、data URI 与普通相对路径', () => {
        const issues = findExternalImageSources([
            { file: 'a.vue', content: 'const src = withBase(\'/demo/image-square.svg\')' },
            { file: 'b.vue', content: 'const broken = \'data:image/png;base64,invalid\'' },
            { file: 'c.vue', content: 'import { ref } from \'vue\'' },
        ])
        expect(issues).toEqual([])
    })

    it('同一行多处外链只报 1 处（避免噪声）', () => {
        const issues = findExternalImageSources([
            { file: 'a.vue', content: 'const [a, b] = [\'https://x/1.png\', \'https://y/2.png\']' },
        ])
        expect(issues).toHaveLength(1)
    })
})

describe('受检面未静默收窄', () => {
    it('文件数低于下界即失败', () => {
        const issues = checkScannedScope(manyPaths(10), 300)
        expect(issues.some((issue) => issue.type === 'scan-scope-narrowed')).toBe(true)
    })

    it('缺中英任一侧示例目录即失败', () => {
        const onlyZh = [...manyPaths(200, 'docs/examples/demo'), ...manyPaths(200, 'docs/examples/other')]
        const issues = checkScannedScope(onlyZh, 300)
        expect(issues.some((issue) => issue.message.includes('docs/i18n/en-US/examples/'))).toBe(true)
    })

    it('两侧覆盖且达下界时通过', () => {
        const paths = [...manyPaths(200, 'docs/examples/demo'), ...manyPaths(200, 'docs/i18n/en-US/examples/demo')]
        expect(checkScannedScope(paths, 300)).toEqual([])
    })

    it('前缀常量覆盖中英两侧', () => {
        expect(EXAMPLE_DIR_PREFIXES).toEqual(['docs/examples/', 'docs/i18n/en-US/examples/'])
    })
})

describe('runDemoExternalImageCheck（夹具注入）', () => {
    it('注入外链命中，移除后通过（负向对照）', () => {
        const dir = createFixture({
            'docs/examples/a/demo.vue': 'const src = \'https://picsum.photos/300\'\n',
            'docs/i18n/en-US/examples/a/demo.vue': 'const src = withBase(\'/demo/image-square.svg\')\n',
        })
        const files = ['docs/examples/a/demo.vue', 'docs/i18n/en-US/examples/a/demo.vue']
        const hit = runDemoExternalImageCheck(dir, { files, minScannedFiles: 1 })
        expect(hit.issues.map((issue) => issue.type)).toContain('external-image-source')

        writeFileSync(join(dir, 'docs/examples/a/demo.vue'), 'const src = withBase(\'/demo/image-square.svg\')\n')
        const clean = runDemoExternalImageCheck(dir, { files, minScannedFiles: 1 })
        expect(clean.issues).toEqual([])
        expect(clean.scannedFiles).toBe(2)
    })

    it('下界不足时即使无外链也失败（防空扫描通过）', () => {
        const dir = createFixture({ 'docs/examples/a/demo.vue': 'const src = \'/demo/x.svg\'\n' })
        const result = runDemoExternalImageCheck(dir, { files: ['docs/examples/a/demo.vue'], minScannedFiles: 10 })
        expect(result.issues.some((issue) => issue.type === 'scan-scope-narrowed')).toBe(true)
    })
})

describe('CLI 退出码', () => {
    it('非法目标目录按失败退出', () => {
        const missing = spawnSync(process.execPath, [SCRIPT_PATH, join(tmpdir(), 'missing-root-xyz')], { encoding: 'utf8' })
        expect(missing.status).toBe(1)
        expect(missing.stderr).toContain('不是仓库根')
    })

    it('仓库自身通过时 exit 0 并打印受检面', () => {
        const result = spawnSync(process.execPath, [SCRIPT_PATH], { encoding: 'utf8' })
        expect(result.status).toBe(0)
        expect(result.stdout).toContain('无外部图片源')
    })

    it('含 package.json 但非 git 仓库的目标目录给受控错误而非堆栈', () => {
        const root = createFixture({ 'docs/examples/a/demo.vue': 'const src = \'/demo/x.svg\'\n' })
        const result = spawnSync(process.execPath, [SCRIPT_PATH, root], { encoding: 'utf8' })
        expect(result.status).toBe(1)
        expect(result.stderr).toContain('不是 git 仓库')
        expect(result.stderr).not.toContain('at ')
    })
})

describe('目标根解析', () => {
    it('无参回落默认根', () => {
        expect(resolveTargetRoot(undefined)).toEqual({ root: PROJECT_ROOT, error: null })
    })

    it('拒绝未知参数', () => {
        expect(resolveTargetRoot('-x').error).toContain('不支持的参数')
    })

    it('拒绝非仓库根目录', () => {
        const dir = mkdtempSync(join(tmpdir(), 'check-demo-external-images-bad-'))
        tempDirs.push(dir)
        expect(resolveTargetRoot(dir).error).toContain('不是仓库根')
    })
})

describe('仓库现状（回归保护）', () => {
    it('受检示例文件数达下界且当前零外部图片源', () => {
        const files = collectExampleFiles(PROJECT_ROOT)
        expect(files.length).toBeGreaterThanOrEqual(MIN_SCANNED_EXAMPLES)
        expect(checkScannedScope(files, MIN_SCANNED_EXAMPLES)).toEqual([])
        expect(findExternalImageSources(files.map((file) => ({
            file,
            content: readFileSync(join(PROJECT_ROOT, file), 'utf8'),
        })))).toEqual([])
    })
})
