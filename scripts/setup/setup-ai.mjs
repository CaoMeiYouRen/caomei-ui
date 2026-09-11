import { mkdir, lstat, realpath, symlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..', '..')

const linkMappings = [
    { linkRelPath: '.claude/agents', targetRelPath: '.github/agents' },
    { linkRelPath: '.claude/skills', targetRelPath: '.github/skills' },
    { linkRelPath: '.agents/agents', targetRelPath: '.github/agents' },
    { linkRelPath: '.agents/skills', targetRelPath: '.github/skills' },
    { linkRelPath: '.opencode/agents', targetRelPath: '.github/agents' },
    { linkRelPath: '.opencode/skills', targetRelPath: '.github/skills' },
]

function toSymlinkTarget(linkPath, targetPath) {
    if (process.platform === 'win32') {
        return targetPath
    }

    return path.relative(path.dirname(linkPath), targetPath)
}

async function ensureSymlink(linkPath, targetPath) {
    await mkdir(path.dirname(linkPath), { recursive: true })

    try {
        const existing = await lstat(linkPath)
        if (!existing.isSymbolicLink()) {
            console.warn(`  跳过: ${path.relative(repoRoot, linkPath)} 已存在且不是符号链接`)
            return
        }

        const resolvedLink = await realpath(linkPath)
        const resolvedTarget = await realpath(targetPath)
        if (resolvedLink === resolvedTarget) {
            console.info(`  已存在: ${path.relative(repoRoot, linkPath)}`)
            return
        }

        console.warn(`  跳过: ${path.relative(repoRoot, linkPath)} 已指向其他目标`)
        return
    } catch (error) {
        if (error?.code !== 'ENOENT') {
            throw error
        }
    }

    const symlinkType = process.platform === 'win32' ? 'junction' : 'dir'
    const symlinkTarget = toSymlinkTarget(linkPath, targetPath)
    await symlink(symlinkTarget, linkPath, symlinkType)
    console.info(`  创建: ${path.relative(repoRoot, linkPath)} -> ${path.relative(repoRoot, targetPath)}`)
}

async function main() {
    console.info(`同步 AI 平台镜像: ${repoRoot}`)

    for (const mapping of linkMappings) {
        const linkPath = path.join(repoRoot, mapping.linkRelPath)
        const targetPath = path.join(repoRoot, mapping.targetRelPath)

        await ensureSymlink(linkPath, targetPath)
    }

    console.info('\nAI 平台镜像同步完成！')
}

main().catch((error) => {
    console.error(error?.message || error)
    process.exit(1)
})
