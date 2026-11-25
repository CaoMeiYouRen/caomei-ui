#!/usr/bin/env node

/**
 * check-optional-peer-consumer：可选 peer 的**消费方构建行为**实测。
 *
 * 为什么需要它：开发规范 §8 规定，「可选 peer 未安装时如何处理」不能只看本仓 `dist`
 * 里的动态 import 形态（那只证明「未使用面」），必须用最小消费方 fixture 实测两条路径。
 * 本脚本把 fixture 建在系统临时目录（不污染仓库），`caomei-ui` 取本仓 `dist` 副本，
 * 依赖以符号链接提供，唯独不提供被验证的 peer，从而让「未安装」成为真实条件。
 *
 * 受测结论（本仓当前形态，与 `vue-echarts` / `md-editor-v3` 同构）：
 * - 未安装 peer 时，**无论是否使用对应组件**，打包器在模块图中都会解析该动态 import 并失败
 *   （错误信息点名模块）——即「可选」只表示 `npm install` 不强制与类型面不静态引用；
 * - 安装 peer 后，使用对应组件的消费方可正常构建。
 *
 * 用法：
 *   node scripts/release/check-optional-peer-consumer.mjs   # 任一断言不符 exit 1
 */
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const VITE_BIN = join(REPO_ROOT, 'node_modules', '.bin', 'vite')

/** 消费方必需的运行时依赖（可选 peer 除外） */
const RUNTIME_DEPS = ['vue', 'reka-ui', '@internationalized', '@tanstack', '@lucide']

/**
 * 消费方构建配置：把其它可选 peer 一律 external，隔离出待测 peer。
 *
 * 必须用**正则**匹配 `echarts/i18n/*` 等子路径：external 的字符串项只匹配精确 id。
 */
const VITE_CONFIG = `export default {
    build: {
        rollupOptions: {
            external: [
                'vue-echarts', 'vue-echarts/style.css',
                'md-editor-v3', 'md-editor-v3/lib/style.css',
                'echarts', /^echarts\\//, '@vavt/cm-extension', /^@vavt\\//,
            ],
        },
    },
}
`

function linkDependency(root, name) {
    const target = join(REPO_ROOT, 'node_modules', name)
    const link = join(root, 'node_modules', name)
    mkdirSync(dirname(link), { recursive: true })
    symlinkSync(target, link, 'dir')
}

function createConsumer({ useQRCode, withQRCode }) {
    const root = mkdtempSync(join(tmpdir(), 'caomei-ui-consumer-'))
    mkdirSync(join(root, 'node_modules'), { recursive: true })
    cpSync(join(REPO_ROOT, 'dist'), join(root, 'node_modules', 'caomei-ui'), { recursive: true })
    for (const dep of RUNTIME_DEPS) {
        linkDependency(root, dep)
    }
    if (withQRCode) {
        linkDependency(root, 'qrcode')
    }
    writeFileSync(join(root, 'index.html'), '<!DOCTYPE html><html><body><div id="app"></div><script type="module" src="./main.js"></script></body></html>\n')
    writeFileSync(
        join(root, 'main.js'),
        useQRCode
            ? 'import { createApp, h } from \'vue\'\nimport { CaomeiQRCode } from \'caomei-ui\'\ncreateApp(() => h(CaomeiQRCode, { value: \'https://example.com\' })).mount(\'#app\')\n'
            : 'import { createApp, h } from \'vue\'\nimport { CaomeiButton } from \'caomei-ui\'\ncreateApp(() => h(CaomeiButton, null, () => \'ok\')).mount(\'#app\')\n',
    )
    writeFileSync(join(root, 'vite.config.mjs'), VITE_CONFIG)
    return root
}

function build(root) {
    return spawnSync(VITE_BIN, ['build', '--logLevel', 'warn'], {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, NO_COLOR: '1' },
    })
}

function assertCase(label, useQRCode, withQRCode, expectSuccess) {
    const root = createConsumer({ useQRCode, withQRCode })
    try {
        const result = build(root)
        const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
        const success = result.status === 0
        if (expectSuccess) {
            if (!success) {
                throw new Error(`${label}：预期构建成功，实际失败\n${output}`)
            }
            console.info(`[optional-peer] ${label}：构建成功（符合预期）`)
            return
        }
        if (success) {
            throw new Error(`${label}：预期构建失败，实际成功（可选 peer 未被解析？）`)
        }
        if (!/qrcode/.test(output)) {
            throw new Error(`${label}：构建失败但错误信息未点名 qrcode\n${output}`)
        }
        console.info(`[optional-peer] ${label}：构建失败且点名 qrcode（符合预期）`)
    } finally {
        rmSync(root, { recursive: true, force: true })
    }
}

export function runChecks() {
    assertCase('未安装 + 未使用', false, false, false)
    assertCase('未安装 + 使用', true, false, false)
    assertCase('已安装 + 未使用', false, true, true)
    assertCase('已安装 + 使用', true, true, true)
}

if (isDirectExecution(import.meta.url)) {
    try {
        runChecks()
        console.info('[optional-peer] 全部通过：可选 peer 的消费方构建行为与文档口径一致')
    } catch (error) {
        console.error(`[optional-peer] 失败：${error.message}`)
        process.exitCode = 1
    }
}
