import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { LOCAL_ENV_FILE, loadEnvFile, loadLocalEnv, parseEnv } from './env.mjs'

const tempDirs = []

function tempDir(prefix) {
    const dir = mkdtempSync(join(tmpdir(), prefix))
    tempDirs.push(dir)
    return dir
}

afterAll(() => {
    for (const dir of tempDirs) {
        rmSync(dir, { recursive: true, force: true })
    }
})

describe('parseEnv', () => {
    it('解析注释、空行、export 与成对引号', () => {
        expect(parseEnv([
            '# 本地凭据',
            '',
            'SECURITY_ALERTS_TOKEN=ghp_abc',
            'export GITHUB_REPOSITORY="o/r"',
            'QUOTED=\'a b\'',
            'WITH_EQUALS=a=b',
        ].join('\n'))).toEqual({
            SECURITY_ALERTS_TOKEN: 'ghp_abc',
            GITHUB_REPOSITORY: 'o/r',
            QUOTED: 'a b',
            WITH_EQUALS: 'a=b',
        })
    })

    it('缺 KEY=VALUE 时 fail-closed 并给出行号', () => {
        expect(() => parseEnv('SECURITY_ALERTS_TOKEN')).toThrow(`${LOCAL_ENV_FILE}:1`)
    })

    it('解析错误不回显行内容（避免把凭据写进日志）', () => {
        let message = ''
        try {
            parseEnv('SECURITY_ALERTS_TOKEN ghp_SECRET123')
        } catch (error) {
            message = error.message
        }
        expect(message).toContain(`${LOCAL_ENV_FILE}:1`)
        expect(message).not.toContain('ghp_SECRET123')
    })

    it('引号不配对时不回显值', () => {
        let message = ''
        try {
            parseEnv('SECURITY_ALERTS_TOKEN="ghp_SECRET123')
        } catch (error) {
            message = error.message
        }
        expect(message).toContain('引号不配对')
        expect(message).not.toContain('ghp_SECRET123')
    })

    it('重复键报错，不静默覆盖', () => {
        expect(() => parseEnv('KEY=a\nKEY=b')).toThrow('重复出现')
    })

    it('键名非法时报错', () => {
        expect(() => parseEnv('1BAD=x')).toThrow('键名非法')
    })

    it('空值保留为空串（由调用方判空，不在此静默丢弃）', () => {
        expect(parseEnv('KEY=')).toEqual({ KEY: '' })
    })
})

describe('loadEnvFile', () => {
    it('文件不存在时静默跳过', () => {
        expect(loadEnvFile(join(tmpdir(), 'not-exist.env.local'))).toEqual([])
    })

    it('只补缺失键，真实环境变量优先', () => {
        const dir = tempDir('caomei-env-')
        const file = join(dir, LOCAL_ENV_FILE)
        writeFileSync(file, 'SECURITY_ALERTS_TOKEN=from-file\nOTHER=file-value\n', 'utf8')
        const env = { SECURITY_ALERTS_TOKEN: 'from-shell' }

        expect(loadEnvFile(file, { env })).toEqual(['OTHER'])
        expect(env.SECURITY_ALERTS_TOKEN).toBe('from-shell')
        expect(env.OTHER).toBe('file-value')
    })

    it('空串环境变量视为已设置，不被文件覆盖（fail-closed）', () => {
        const dir = tempDir('caomei-env-')
        const file = join(dir, LOCAL_ENV_FILE)
        writeFileSync(file, 'SECURITY_ALERTS_TOKEN=from-file\n', 'utf8')
        const env = { SECURITY_ALERTS_TOKEN: '' }

        expect(loadEnvFile(file, { env })).toEqual([])
        expect(env.SECURITY_ALERTS_TOKEN).toBe('')
    })
})

describe('loadLocalEnv', () => {
    it('读取仓库根的 .env.local', () => {
        const dir = tempDir('caomei-env-')
        writeFileSync(join(dir, LOCAL_ENV_FILE), 'SECURITY_ALERTS_TOKEN=ghp_local\n', 'utf8')
        const env = {}

        expect(loadLocalEnv(dir, { env })).toEqual(['SECURITY_ALERTS_TOKEN'])
        expect(env.SECURITY_ALERTS_TOKEN).toBe('ghp_local')
    })
})
