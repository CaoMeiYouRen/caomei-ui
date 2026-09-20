#!/usr/bin/env node

/**
 * check-resolver 的纯函数与常量部分（被 vitest 直接导入，故**只允许静态 import**）。
 *
 * 需要动态 import（`vite`、`dist/resolver.js`）的运行器在 `check-resolver.run.mjs`——
 * 动态 import 会触发 Vite import-analysis 注入 `/@vite/client`，导致本文件（带 shebang）
 * 在 vitest 下解析失败。
 *
 * 断言语义见 `check-resolver.run.mjs` 的文件头。
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** 冒烟使用的组件名（覆盖一个组件及其依赖组件）。 */
export const PROBE_COMPONENTS = ['CaomeiButton']

/** 未引入的组件选择器（用于「按需生效」的反向断言）。 */
export const UNUSED_COMPONENT_SELECTOR = '.caomei-tag'

/** 生成消费入口源码（按 resolver 返回的 from / sideEffects 组装）。 */
export function renderEntry(resolved) {
    const imports = []
    const names = []
    for (const item of resolved) {
        imports.push(`import { ${item.name} } from '${item.from}'`)
        if (item.sideEffects) {
            imports.push(`import '${item.sideEffects}'`)
        }
        names.push(item.name)
    }
    return `${imports.join('\n')}\nconsole.log(${names.join(', ')})\n`
}

/** 统计字符串出现次数（非重叠）。 */
export function countOccurrences(text, pattern) {
    return text.split(pattern).length - 1
}

/**
 * 基础层文件中 `--caomei-color-bg:` 的出现次数（判定「只注入一份」的期望值）。
 *
 * 从产物基础层实时派生，避免基础层增删声明后硬编码值失效。
 *
 * @param {string} root 仓库根
 * @returns {number} 出现次数（读不到文件时返回 0，交由调用方报错）
 */
export function expectedBaseLayerTokenCount(root) {
    const file = join(root, 'dist', 'styles', 'index.css')
    if (!existsSync(file)) {
        return 0
    }
    return countOccurrences(readFileSync(file, 'utf8'), '--caomei-color-bg:')
}

/**
 * 校验产物 CSS 是否满足「基础层一份 + 组件样式在 + 未引入组件不混入」。
 *
 * @param {string} css 构建产物 CSS 拼接文本
 * @param {number} expectedBgTokens 基础层期望出现次数（由 `expectedBaseLayerTokenCount` 派生）
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function verifyProducedCss(css, expectedBgTokens) {
    const errors = []
    const bgTokens = countOccurrences(css, '--caomei-color-bg:')
    if (bgTokens === 0) {
        errors.push('产物 CSS 缺少基础层 token（--caomei-color-bg:）——resolver 的 sideEffects 未生效')
    } else if (expectedBgTokens === 0) {
        errors.push('无法从 dist/styles/index.css 派生基础层期望值（文件缺失或 token 已改名）')
    } else if (bgTokens !== expectedBgTokens) {
        errors.push(`基础层疑似重复注入：--caomei-color-bg: 出现 ${bgTokens} 次，期望 ${expectedBgTokens} 次`)
    }
    if (!css.includes('.caomei-button')) {
        errors.push('产物 CSS 缺少组件样式（.caomei-button）')
    }
    if (css.includes(UNUSED_COMPONENT_SELECTOR)) {
        errors.push(`按需失效：产物 CSS 含未引入组件样式（${UNUSED_COMPONENT_SELECTOR}）`)
    }
    return { ok: errors.length === 0, errors }
}
