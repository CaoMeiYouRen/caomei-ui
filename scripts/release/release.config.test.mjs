import { describe, expect, it } from 'vitest'
import shareable from 'semantic-release-cmyr-config'
import config from '../../release.config.js'

/** 取插件名（支持字符串与 `[name, options]` 两种形态）。 */
const pluginName = (plugin) => (Array.isArray(plugin) ? plugin[0] : plugin)

/** 取插件选项。 */
const pluginOptions = (plugin) => (Array.isArray(plugin) ? plugin[1] ?? {} : {})

const plugins = config.plugins
const names = plugins.map(pluginName)
const indexOf = (name) => names.indexOf(name)

describe('release.config', () => {
    it('复刻 shareable config 的全部插件，并额外包含 exec', () => {
        const upstream = shareable.plugins.map(pluginName)
        expect(new Set(names)).toEqual(new Set([...upstream, '@semantic-release/exec']))
    })

    it('prepare 顺序为 npm → exec → git', () => {
        expect(indexOf('@semantic-release/npm')).toBeLessThan(indexOf('@semantic-release/exec'))
        expect(indexOf('@semantic-release/exec')).toBeLessThan(indexOf('@semantic-release/git'))
    })

    it('exec 的版本句同步与里程碑命令指向对应脚本', () => {
        const exec = plugins.find((plugin) => pluginName(plugin) === '@semantic-release/exec')
        const options = pluginOptions(exec)
        expect(options.prepareCmd).toContain('scripts/release/sync-version-statements.mjs')
        expect(options.prepareCmd).toContain('${nextRelease.version}')
        expect(options.generateNotesCmd).toContain('scripts/release/release-notes.mjs')
        expect(options.generateNotesCmd).toContain('${nextRelease.version}')
    })

    it('git assets 覆盖 CHANGELOG / package.json / README 中英 / roadmap', () => {
        const git = plugins.find((plugin) => pluginName(plugin) === '@semantic-release/git')
        expect(new Set(pluginOptions(git).assets)).toEqual(new Set([
            'CHANGELOG.md',
            'package.json',
            'README.md',
            'README.en-US.md',
            'docs/plan/roadmap.md',
        ]))
    })

    it('changelog 使用 cmyr 预设与仓库标题', () => {
        const changelog = plugins.find((plugin) => pluginName(plugin) === '@semantic-release/changelog')
        expect(pluginOptions(changelog).changelogTitle).toBe('# caomei-ui')
        const analyzer = plugins.find((plugin) => pluginName(plugin) === '@semantic-release/commit-analyzer')
        expect(pluginOptions(analyzer).config).toBe('conventional-changelog-cmyr-config')
    })
})
