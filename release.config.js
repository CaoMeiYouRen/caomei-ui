/**
 * @type {import('semantic-release').GlobalConfig}
 *
 * 注意：保留 `extends` 是为了让 shareable config 声明的插件按其目录解析（pnpm 严格布局下
 * 从仓库根直接解析会 MODULE_NOT_FOUND）；本地 `plugins` 会**整体覆盖** extends 的插件数组，
 * 因此必须与上游集合保持一致，并额外插入 `@semantic-release/exec`。
 * `release.config.test.mjs` 会对插件集合 / 顺序 / assets 做机检，升级上游后若不一致会失败。
 */
export default {
    extends: ['semantic-release-cmyr-config'],
    plugins: [
        ['@semantic-release/commit-analyzer', { config: 'conventional-changelog-cmyr-config' }],
        ['@semantic-release/release-notes-generator', { config: 'conventional-changelog-cmyr-config' }],
        ['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md', changelogTitle: '# caomei-ui' }],
        '@semantic-release/npm',
        '@semantic-release/github',
        [
            '@semantic-release/exec',
            {
                // 里程碑 / 升级注意：输出会追加在 release-notes-generator 的提交分组之后。
                generateNotesCmd: 'node scripts/release/release-notes.mjs --version=${nextRelease.version}',
                // 必须在 npm prepare（bump package.json）之后、git（提交 assets）之前执行。
                prepareCmd: 'node scripts/release/sync-version-statements.mjs --version=${nextRelease.version}',
            },
        ],
        [
            '@semantic-release/git',
            {
                assets: [
                    'CHANGELOG.md',
                    'package.json',
                    'README.md',
                    'README.en-US.md',
                    'docs/plan/roadmap.md',
                ],
            },
        ],
    ],
}
