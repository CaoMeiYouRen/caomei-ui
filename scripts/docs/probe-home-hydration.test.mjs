// @vitest-environment node
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { request } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
    assertDistReady,
    assertSnapshotReady,
    compareSnapshots,
    createStaticServer,
    formatSnapshot,
    normalizeText,
    readPresetStorageKey,
} from './probe-home-hydration.mjs'

let root

beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'probe-hydration-'))
    await mkdir(join(root, 'guide'), { recursive: true })
    await writeFile(join(root, 'index.html'), '<p>home</p>')
    await writeFile(join(root, 'guide', 'index.html'), '<p>guide</p>')
})

afterAll(async () => {
    await rm(root, { recursive: true, force: true })
})

/** 原始 HTTP 请求：Node 客户端不对 `..` 段做规范化，能真正命中服务端防护 */
function rawRequest(port, path) {
    return new Promise((resolvePromise, rejectPromise) => {
        const req = request({ host: '127.0.0.1', port, path, method: 'GET' }, (res) => {
            let body = ''
            res.setEncoding('utf8')
            res.on('data', (chunk) => {
                body += chunk
            })
            res.on('end', () => resolvePromise({ status: res.statusCode, body }))
        })
        req.on('error', rejectPromise)
        req.end()
    })
}

describe('probe-home-hydration 快照工具', () => {
    it('归一化文本折叠空白', () => {
        expect(normalizeText('  a\n  b\t c ')).toBe('a b c')
    })

    it('未命中的目标记为 missing', () => {
        expect(formatSnapshot([null, { text: ' x ', length: 3 }])).toEqual(['missing', 'x|3'])
    })

    it('快照一致时无差异', () => {
        expect(compareSnapshots(['a|1', 'b|2'], ['a|1', 'b|2'])).toEqual([])
    })

    it('文本或长度变化均判为不一致', () => {
        expect(compareSnapshots(['a|1'], ['b|1'])).toHaveLength(1)
        expect(compareSnapshots(['a|1'], ['a|2'])).toHaveLength(1)
        expect(compareSnapshots(['a|1'], ['a|1', 'b|2'])[0]).toContain('n/a')
    })

    it('空快照面判为未就绪，不得被当成一致', () => {
        expect(assertSnapshotReady(['missing', 'missing', 'missing'])).toHaveLength(3)
        expect(assertSnapshotReady(['|0', 'b|2', 'c|3'])).toHaveLength(1)
        expect(assertSnapshotReady(['a|1', 'b|2', 'c|3'])).toEqual([])
    })
})

describe('probe-home-hydration 构建产物前置校验', () => {
    it('缺失时 fail-closed', async () => {
        await expect(assertDistReady(join(root, 'nope'))).rejects.toThrow(/构建产物缺失/)
    })

    it('存在时返回根目录', async () => {
        await expect(assertDistReady(root)).resolves.toBe(root)
    })
})

describe('probe-home-hydration 主题预设键读取', () => {
    it('从主题层源文件解析存储键', async () => {
        await expect(readPresetStorageKey(join(process.cwd(), 'docs', '.vitepress', 'theme', 'components', 'theme-preset-switcher.vue')))
            .resolves.toBe('caomei-docs-preset')
    })

    it('解析失败时 fail-closed', async () => {
        const file = join(root, 'missing.vue')
        await expect(readPresetStorageKey(file)).rejects.toThrow()
    })
})

describe('probe-home-hydration 静态服务', () => {
    it('目录请求返回 index.html，缺失与越界返回 404', async () => {
        const server = await createStaticServer(root)
        await new Promise((done) => server.listen(0, '127.0.0.1', done))
        const { port } = server.address()
        try {
            const home = await rawRequest(port, '/')
            expect(home.body).toBe('<p>home</p>')

            const guide = await rawRequest(port, '/guide/')
            expect(guide.body).toBe('<p>guide</p>')

            const missing = await rawRequest(port, '/nope.html')
            expect(missing.status).toBe(404)

            const traversal = await rawRequest(port, '/../package.json')
            expect(traversal.status).toBe(404)
            expect(traversal.body).not.toContain('"name"')

            const encodedTraversal = await rawRequest(port, '/..%2f..%2fpackage.json')
            expect(encodedTraversal.status).toBe(404)
        } finally {
            await new Promise((done) => server.close(done))
        }
    })
})
