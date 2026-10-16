/**
 * 开发期告警：生产构建（`NODE_ENV === 'production'`）下静默。
 *
 * 逐级可选访问 `globalThis.process`：兼容消费者注入「不含 `env` 的 process shim」，
 * 保证告警路径自身不抛错。代价是无法依赖打包器静态替换 `process.env.NODE_ENV`
 * 做生产裁剪——消费者未定义 `globalThis.process` 时按非生产处理、照常输出。
 *
 * 本模块只承载**故障诊断**输出，不承载任何运行期语义（静默与否不改变行为）。
 *
 * 落在 `src/_shared/`（而非 `src/components/_shared/`）：本工具供 **composables 与 components 跨层共用**，
 * 置于 `src/components/` 之下会形成「composables 反向依赖 components」的层级回路。
 */
export function warnDev(message: string): void {
    const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    if (env?.NODE_ENV === 'production') {
        return
    }
    console.warn(message)
}
