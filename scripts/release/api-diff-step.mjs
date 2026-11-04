#!/usr/bin/env node

/**
 * api-diff-step：发布链中的 API 表面差分步骤。
 *
 * 从上一已发布版本取解包 `dist`，与当前构建产物做 `.d.ts` 差分；判别口径与
 * `diff-api.mjs` 一致：删除 / 重命名 / 成员删除 / required 收紧 = breaking，
 * 新增不阻断，其余内容变化为 warning。
 *
 * 独立成模块的原因：`manual-release.mjs` 已接近 ESLint `max-lines` 上限，且本步骤
 * 需要独立的 `npm pack` / 解包逻辑与测试注入点。
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { compareApiSurfaces, formatReport } from './diff-api.mjs'

export const PACKAGE_NAME = 'caomei-ui'

function spawnOptions(options = {}) {
    return {
        cwd: options.cwd,
        shell: process.platform === 'win32',
        ...(options.capture ? { encoding: 'utf8' } : { stdio: 'inherit' }),
    }
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, spawnOptions(options))
    if (result.status !== 0) {
        throw new Error(`命令失败（exit ${result.status}）：${command} ${args.join(' ')}`)
    }
}

function capture(command, args, options = {}) {
    return spawnSync(command, args, spawnOptions({ ...options, capture: true }))
}

function output(result) {
    return `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
}

/**
 * 解析 `npm view <pkg> dist-tags --json` 输出。
 *
 * @param {string} text 命令输出
 * @returns {Record<string, string>}
 */
export function parseDistTags(text) {
    try {
        const parsed = JSON.parse(text)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {}
        }
        return parsed
    } catch {
        return {}
    }
}

/**
 * 解析 API 差分基线版本。
 *
 * 缺省按目标 dist-tag 取**同通道上一已发布版本**（与 API 表面基线评估记录 §3.3 一致，
 * 见 `docs/design/governance/2026-10-24-phase26-m1-3-api-surface-baseline-evaluation.md`）：
 * `latest` 对照上一 `latest`、`next` 对照上一 `next`，避免把多个预发布段合并比较。
 *
 * @param {{ targetVersion: string, tag: string, distTags?: Record<string, string>, explicitBase?: string }} input
 * @returns {{ version: string | null, reason: string | null, source: string | null }}
 */
export function resolveApiDiffBaseline({ targetVersion, tag, distTags, explicitBase }) {
    if (explicitBase) {
        if (explicitBase === targetVersion) {
            return {
                version: null,
                reason: `--base 与目标版本相同（${targetVersion}），无可对照的上一版本`,
                source: null,
            }
        }
        return { version: explicitBase, reason: null, source: '--base' }
    }
    const channelVersion = typeof distTags?.[tag] === 'string' ? distTags[tag] : null
    if (!channelVersion) {
        return {
            version: null,
            reason: `dist-tags.${tag} 不存在（该通道尚无已发布版本）`,
            source: null,
        }
    }
    if (channelVersion === targetVersion) {
        return {
            version: null,
            reason: `目标版本已是 dist-tags.${tag}（${targetVersion}），无可对照的上一版本`,
            source: null,
        }
    }
    return { version: channelVersion, reason: null, source: `dist-tags.${tag}` }
}

/**
 * 断言 dist-tags 解析结果非空；空对象 / 非法输出按「无法读取」处理，避免静默关闭门禁。
 *
 * @param {Record<string, string>} parsed 解析结果
 * @returns {Record<string, string>}
 */
export function ensureDistTags(parsed) {
    if (!parsed || typeof parsed !== 'object' || Object.keys(parsed).length === 0) {
        throw new Error('registry dist-tags 输出为空或无法解析')
    }
    if (Object.values(parsed).some((value) => typeof value !== 'string' || value.trim() === '')) {
        throw new Error('registry dist-tags 含非字符串版本值')
    }
    return parsed
}

function readDistTags(root) {
    const result = capture('npm', ['view', PACKAGE_NAME, 'dist-tags', '--json'], { cwd: root })
    if (result.status !== 0) {
        throw new Error(`无法读取 registry dist-tags：${output(result)}`)
    }
    return ensureDistTags(parseDistTags(result.stdout ?? ''))
}

/**
 * 取上一已发布版本的解包 `dist` 目录（临时目录，调用方负责清理）。
 *
 * @param {{ root: string, version: string }} input
 * @returns {{ dir: string, distRoot: string }}
 */
export function fetchApiBaseline({ root, version }) {
    const dir = mkdtempSync(join(tmpdir(), 'caomei-api-diff-'))
    try {
        const pack = capture('npm', ['pack', `${PACKAGE_NAME}@${version}`, '--pack-destination', dir], { cwd: root })
        if (pack.status !== 0) {
            throw new Error(`npm pack ${PACKAGE_NAME}@${version} 失败：${output(pack)}`)
        }
        const tarball = join(dir, `${PACKAGE_NAME}-${version}.tgz`)
        if (!existsSync(tarball)) {
            throw new Error(`未找到基线 tarball：${tarball}`)
        }
        const unpackDir = join(dir, 'unpack')
        mkdirSync(unpackDir)
        run('tar', ['-xzf', tarball, '-C', unpackDir], { cwd: root })
        const distRoot = join(unpackDir, 'package', 'dist')
        if (!existsSync(distRoot)) {
            throw new Error(`基线 tarball 内缺少 dist 目录：${version}`)
        }
        if (!existsSync(join(distRoot, 'index.d.ts'))) {
            throw new Error(`基线 tarball 内 dist 缺少 index.d.ts：${version}`)
        }
        return { dir, distRoot }
    } catch (error) {
        rmSync(dir, { recursive: true, force: true })
        throw error
    }
}

/**
 * API 表面差分步骤：对上一已发布版本做 `.d.ts` 差分。
 *
 * 判别口径：删除 / 重命名 / 成员删除 / required 收紧 = breaking；新增不阻断；
 * 其余内容变化 = warning（人工复核）。`--dry-run` 仍执行只读差分并打印结论；
 * 网络 / 基线不可用时降级为提示，不阻断预览。已批准的 major 可用
 * `--allow-breaking=<治理记录路径>` 显式放行并打印留痕。
 *
 * @param {{ root: string, version: string, tag: string, dryRun: boolean, base?: string, allowBreaking?: string, distTags?: Record<string, string>, fetchApiBaseline?: typeof fetchApiBaseline, compareApiSurfaces?: typeof compareApiSurfaces }} ctx 运行上下文
 * @returns {Promise<void>}
 */
export async function stepApiDiff(ctx) {
    const { root, version, tag, dryRun } = ctx
    if (ctx.base !== undefined && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(ctx.base)) {
        throw new Error(`Invalid --base: ${ctx.base}（期望 semver，如 1.0.0）`)
    }
    const currentRoot = join(root, 'dist')
    if (!existsSync(currentRoot)) {
        if (dryRun) {
            process.stdout.write('[api-diff] dry-run：当前工作区无 dist（preflight 的 verify 会构建），跳过差分\n')
            return
        }
        throw new Error('[api-diff] 当前构建产物 dist 不存在：请先运行 pnpm build（或 preflight 的 pnpm verify）')
    }
    if (dryRun) {
        process.stdout.write('[api-diff] dry-run：使用工作区现有 dist（未执行 verify 构建，可能与当前源码不一致）\n')
    } else if (!ctx.fromRun) {
        process.stdout.write('[api-diff] 注意：分步运行使用现有 dist；请确认已在当前源码上执行 pnpm build（run 链由 preflight 构建）\n')
    }

    let distTags
    try {
        const loadDistTags = ctx.readDistTags ?? readDistTags
        distTags = ctx.base ? undefined : (ctx.distTags ?? loadDistTags(root))
    } catch (error) {
        if (dryRun) {
            process.stdout.write(`[api-diff] dry-run：无法读取 dist-tags（${error.message}），跳过差分\n`)
            return
        }
        throw error
    }
    const baseline = resolveApiDiffBaseline({
        targetVersion: version,
        tag,
        distTags,
        explicitBase: ctx.base,
    })
    if (!baseline.version) {
        process.stdout.write(`[api-diff] 跳过：${baseline.reason}\n`)
        return
    }
    process.stdout.write(`[api-diff] 基线 ${baseline.version}（来源：${baseline.source}）→ 当前 dist\n`)

    const fetchBaseline = ctx.fetchApiBaseline ?? fetchApiBaseline
    let fetched
    try {
        fetched = await fetchBaseline({ root, version: baseline.version })
    } catch (error) {
        if (dryRun) {
            process.stdout.write(`[api-diff] dry-run：无法获取基线 ${baseline.version}（${error.message}），跳过差分\n`)
            return
        }
        throw error
    }

    try {
        const compare = ctx.compareApiSurfaces ?? compareApiSurfaces
        const result = compare({ baselineRoot: fetched.distRoot, currentRoot })
        process.stdout.write(`${formatReport(result)}\n`)
        if (!result.breaking) {
            if (ctx.allowBreaking) {
                process.stdout.write('[api-diff] 提示：--allow-breaking 已提供，但本次未命中 breaking\n')
            }
            return
        }
        if (ctx.allowBreaking) {
            const recordPath = resolve(root, ctx.allowBreaking)
            const relativePath = relative(root, recordPath).replaceAll('\\', '/')
            if (!relativePath.startsWith('docs/design/governance/') || !relativePath.endsWith('.md')) {
                throw new Error('[api-diff] --allow-breaking 须指向 docs/design/governance/ 下的 .md 治理记录')
            }
            let recordStat
            try {
                recordStat = statSync(recordPath)
            } catch {
                throw new Error(`[api-diff] --allow-breaking 指向的治理记录不存在：${ctx.allowBreaking}`)
            }
            if (!recordStat.isFile()) {
                throw new Error(`[api-diff] --allow-breaking 须指向文件：${ctx.allowBreaking}`)
            }
            process.stdout.write(`[api-diff] 警告：存在 breaking，已按 ${relativePath}（${recordPath}）显式放行（须为已批准的 major / 安全修复）\n`)
            return
        }
        const message = '[api-diff] 存在 breaking（删除 / 重命名 / 成员删除 / required 收紧）；'
            + '如为已批准的 major，使用 --allow-breaking=<治理记录路径> 显式放行'
        if (dryRun) {
            process.stdout.write(`[api-diff] dry-run：真实运行会中止。${message}\n`)
            return
        }
        throw new Error(message)
    } finally {
        rmSync(fetched.dir, { recursive: true, force: true })
    }
}
