#!/usr/bin/env node

/**
 * check-demo-keyframes：文档站动效层 keyframes 副本一致性守卫。
 *
 * 为什么需要它：`docs/.vitepress/theme/motion.css` 为「演示区 opt-in」重声明了一批
 * `caomei-demo-*` keyframes（组件在 scoped 样式块中定义的 keyframes 名称会被编译期重写，
 * 无法跨文件引用）。这些副本**值同步自组件源码**，但此前只能靠注释约定「组件动画变更时一并更新」，
 * 无机检——组件改动画后副本静默漂移不会被发现。本守卫把该约定变为可判定门禁。
 *
 * 校验：
 * 1. `motion.css` 中的每个 `caomei-demo-*` keyframes 都必须在 `KEYFRAME_MAP` 中有映射
 *    （防新增副本时漏登记）；
 * 2. 每个映射的组件源文件内存在同名 `@keyframes`（防源改名后映射悬空）；
 * 3. 副本与源 keyframes 的 body **空白 / 注释无关地等价**（防值漂移）。
 *
 * 边界：只比较 keyframes body 的规范化文本，不校验 `animation-*` 引用处；`motion.css` 中
 * `caomei-demo-*` 之外的内容不在面内。
 *
 * 用法：
 *   node scripts/governance/check-demo-keyframes.mjs   # 有违规 exit 1
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

/** 文档站动效层（副本所在）。 */
export const MOTION_FILE = 'docs/.vitepress/theme/motion.css'

/** 副本前缀（只有此前缀的 keyframes 受本守卫约束）。 */
export const DEMO_PREFIX = 'caomei-demo-'

/** 受检面下界（防静默收窄；新增副本时同步上调）。 */
export const MIN_DEMO_KEYFRAMES = 14

/** 副本 → 组件源映射（`demo` 为文档站副本名，`source` 为组件内 keyframes 名）。 */
export const KEYFRAME_MAP = [
    { demo: 'caomei-demo-fade-in', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-fade-in' },
    { demo: 'caomei-demo-fade-out', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-fade-out' },
    { demo: 'caomei-demo-slide-in-left', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-in-left' },
    { demo: 'caomei-demo-slide-in-right', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-in-right' },
    { demo: 'caomei-demo-slide-in-top', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-in-top' },
    { demo: 'caomei-demo-slide-in-bottom', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-in-bottom' },
    { demo: 'caomei-demo-slide-out-left', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-out-left' },
    { demo: 'caomei-demo-slide-out-right', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-out-right' },
    { demo: 'caomei-demo-slide-out-top', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-out-top' },
    { demo: 'caomei-demo-slide-out-bottom', file: 'src/components/drawer/drawer.vue', source: 'caomei-drawer-out-bottom' },
    { demo: 'caomei-demo-accordion-down', file: 'src/components/accordion/accordion-item.vue', source: 'caomei-accordion-slide-down' },
    { demo: 'caomei-demo-accordion-up', file: 'src/components/accordion/accordion-item.vue', source: 'caomei-accordion-slide-up' },
    { demo: 'caomei-demo-image-pulse', file: 'src/components/image/image.vue', source: 'caomei-image-pulse' },
    { demo: 'caomei-demo-spin', file: 'src/components/button/button.vue', source: 'caomei-button-spin' },
]

/** 规范化 keyframes body：去除注释与全部空白，便于跨文件等价比对。 */
export function normalizeKeyframeBody(body) {
    return body.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '')
}

/**
 * 提取文本中全部 `@keyframes <name> { ... }`（括号配平），返回 `Map<name, normalizedBody>`。
 */
export function extractKeyframes(text) {
    // 先剥离注释，避免注释内不平衡的 `{` / `}` 计入配平深度。
    const source = text.replace(/\/\*[\s\S]*?\*\//g, '')
    const map = new Map()
    const re = /@keyframes\s+([A-Za-z][\w-]*)\s*\{/g
    let match
    while ((match = re.exec(source)) !== null) {
        const open = match.index + match[0].length - 1
        let depth = 0
        let index = open
        for (; index < source.length; index += 1) {
            const char = source[index]
            if (char === '{') {
                depth += 1
            } else if (char === '}') {
                depth -= 1
                if (depth === 0) {
                    index += 1
                    break
                }
            }
        }
        map.set(match[1], normalizeKeyframeBody(source.slice(open + 1, index - 1)))
    }
    return map
}

/** 执行校验，返回 { ok, errors, warnings }。`options` 仅供测试注入更小的受检面。 */
export function checkDemoKeyframes(root = REPO_ROOT, {
    motionFile = MOTION_FILE,
    keyframeMap = KEYFRAME_MAP,
    minDemoKeyframes = MIN_DEMO_KEYFRAMES,
} = {}) {
    const errors = []
    const warnings = []

    const motionText = readFileSync(join(root, motionFile), 'utf8')
    const motionKeyframes = extractKeyframes(motionText)
    const demoKeyframes = [...motionKeyframes.keys()].filter((name) => name.startsWith(DEMO_PREFIX))

    if (demoKeyframes.length < minDemoKeyframes) {
        errors.push(`受检面收窄：${motionFile} 中 ${DEMO_PREFIX}* keyframes 仅 ${demoKeyframes.length} 个（下界 ${minDemoKeyframes}）`)
    }

    const mappedDemos = new Set(keyframeMap.map((item) => item.demo))

    for (const name of demoKeyframes) {
        if (!mappedDemos.has(name)) {
            errors.push(`${motionFile} 的 ${name} 未在 KEYFRAME_MAP 登记（新增副本须补映射）`)
        }
    }

    const fileCache = new Map()
    for (const item of keyframeMap) {
        if (!motionKeyframes.has(item.demo)) {
            errors.push(`KEYFRAME_MAP 的 ${item.demo} 在 motion.css 中不存在（映射悬空）`)
            continue
        }
        if (!fileCache.has(item.file)) {
            fileCache.set(item.file, extractKeyframes(readFileSync(join(root, item.file), 'utf8')))
        }
        const sourceKeyframes = fileCache.get(item.file)
        if (!sourceKeyframes.has(item.source)) {
            errors.push(`${item.file} 中不存在源 keyframes ${item.source}（${item.demo} 的映射失效）`)
            continue
        }
        if (sourceKeyframes.get(item.source) !== motionKeyframes.get(item.demo)) {
            errors.push(`${item.demo} 与 ${item.file} 的 ${item.source} body 不等价（副本已漂移）`)
        }
    }

    return { ok: errors.length === 0, errors, warnings }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkDemoKeyframes()
    for (const warning of result.warnings) {
        console.warn(`[check-demo-keyframes][warn] ${warning}`)
    }
    if (result.ok) {
        console.info(`[check-demo-keyframes] 通过：${KEYFRAME_MAP.length} 个演示区 keyframes 副本与组件源一致`)
    } else {
        for (const error of result.errors) {
            console.error(`[check-demo-keyframes][error] ${error}`)
        }
        process.exit(1)
    }
}
