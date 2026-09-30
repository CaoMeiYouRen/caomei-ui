#!/usr/bin/env node

/**
 * 引用型 ARIA 属性变更守卫。
 *
 * 检测当前工作区是否有涉及引用型 ARIA 属性的改动：
 * - aria-controls / aria-describedby / aria-labelledby / aria-owns / aria-activedescendant
 * 若有，强制跑 `capture:styles` 并要求 0 差异（阻断模式）。
 *
 * 设计约束：
 * - 仅检测已跟踪文件的改动（`git diff --name-only`）
 * - 仅当改动文件包含组件源码 / 样式 / 夹具 / 测试时触发
 * - `capture:styles` 失败直接 exit 1，阻断 `verify` 链
 *
 * 关联文档：docs/design/governance/2026-09-27-next-stage-scope-evaluation.md
 */
import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const REF_ATTRS = [
    'aria-controls',
    'aria-describedby',
    'aria-labelledby',
    'aria-owns',
    'aria-activedescendant',
]

const TRIGGER_EXTS = ['.vue', '.ts', '.tsx', '.css', '.scss', '.mjs']

function run(cmd, opts = {}) {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...opts }).trim()
}

function logInfo(message) {
    console.info(message)
}

function logError(message) {
    console.error(message)
}

function main() {
    try {
        // 1. 获取已跟踪文件的变更列表
        const changed = run('git diff --name-only HEAD')
            .split('\n')
            .filter((f) => f && TRIGGER_EXTS.some((ext) => f.endsWith(ext)))
            .filter((f) => existsSync(f))

        if (changed.length === 0) {
            logInfo('[ref-attr-guard] 无相关文件变更，跳过')
            return 0
        }

        // 2. 检查变更是否涉及引用型属性
        let hasRefAttrChange = false
        for (const file of changed) {
            try {
                const diff = run(`git diff HEAD -- "${file}"`)
                for (const attr of REF_ATTRS) {
                    const pattern = new RegExp(`[+-].*${attr}`)
                    if (pattern.test(diff)) {
                        logInfo(`[ref-attr-guard] 检测到 ${file} 涉及 ${attr} 变更`)
                        hasRefAttrChange = true
                        break
                    }
                }
                if (hasRefAttrChange) {
                    break
                }
            } catch {
                // 文件可能是新增/删除，忽略错误
            }
        }

        if (!hasRefAttrChange) {
            logInfo('[ref-attr-guard] 变更未涉及引用型 ARIA 属性，跳过 capture:styles')
            return 0
        }

        // 3. 强制跑 capture:styles
        // 注：此处必须以 `stdio: 'inherit'` 直连终端（保留 capture 的进度输出），
        // 而 `execSync` 在 inherit 下返回 `null`，故不能用上面的 run() 包装（会 .trim() 崩溃）；
        // 失败判定改由异常承担（非零退出码会抛出）。
        logInfo('[ref-attr-guard] 触发 capture:styles（阻断模式）...')
        try {
            execSync('pnpm capture:styles', { stdio: 'inherit' })
        } catch {
            logError('[ref-attr-guard] capture:styles 失败：存在计算样式差异，阻断提交/发布')
            return 1
        }

        logInfo('[ref-attr-guard] capture:styles 通过：0 差异')
        return 0
    } catch (error) {
        logError(`[ref-attr-guard] 执行异常：${error.message}`)
        return 1
    }
}

process.exit(main())
