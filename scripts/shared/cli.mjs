import path from 'node:path'
import { pathToFileURL } from 'node:url'

export function getCliArgs(argv = process.argv) {
    if (argv.length > 0 && argv.every((arg) => typeof arg === 'string' && arg.startsWith('-'))) {
        return [...argv]
    }

    return argv.slice(2)
}

export function getArgValue(argv, name) {
    const prefix = `${name}=`
    return argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) ?? null
}

export function hasFlag(argv, name) {
    return argv.includes(name)
}

export function ensureAllowedValue(value, allowedValues, invalidMessage) {
    if (allowedValues.includes(value)) {
        return value
    }

    throw new Error(typeof invalidMessage === 'function' ? invalidMessage(value) : invalidMessage)
}

/**
 * 把命令行原始字符串转换为声明值。
 *
 * `type: 'number'` 走 fail-closed：空串 / 非数字 / `Infinity` 一律抛错，避免
 * `NaN` 参与阈值比较时恒为 false 而静默放行（`check-coverage --threshold=abc`）。
 *
 * @param {string} optionName
 * @param {{ parse?: (raw: string) => unknown, type?: string }} definition
 * @param {string} rawValue
 * @returns {unknown}
 */
function coerceOptionValue(optionName, definition, rawValue) {
    if (definition.parse) {
        return definition.parse(rawValue)
    }
    if (definition.type === 'number') {
        const value = rawValue.trim() === '' ? Number.NaN : Number(rawValue)
        if (!Number.isFinite(value)) {
            throw new Error(`Unsupported value for ${optionName}: ${rawValue}（期望有限数字）`)
        }
        return value
    }
    return rawValue
}

export function parseCliOptions(argv, config = {}) {
    const cliArgs = getCliArgs(argv)
    const defaults = config.defaults ?? {}
    const flags = config.flags ?? {}
    const values = config.values ?? {}
    const allowUnknown = config.allowUnknown ?? false
    const options = { ...defaults }

    for (const arg of cliArgs) {
        if (arg === '--') {
            continue
        }

        if (!arg.startsWith('--')) {
            if (allowUnknown) {
                continue
            }

            throw new Error(`Unsupported argument: ${arg}`)
        }

        if (arg.includes('=')) {
            const separatorIndex = arg.indexOf('=')
            const optionName = arg.slice(0, separatorIndex)
            const rawValue = arg.slice(separatorIndex + 1)
            const definition = values[optionName]

            if (!definition) {
                if (allowUnknown) {
                    continue
                }

                throw new Error(`Unsupported argument: ${arg}`)
            }

            const nextValue = coerceOptionValue(optionName, definition, rawValue)

            if (definition.allowedValues) {
                ensureAllowedValue(nextValue, definition.allowedValues, definition.invalidMessage ?? ((value) => `Unsupported value for ${optionName}: ${value}`))
            }

            if (definition.collect) {
                options[definition.key] = definition.collect(options[definition.key], nextValue)
                continue
            }

            options[definition.key] = nextValue
            continue
        }

        const definition = flags[arg]
        if (!definition) {
            if (allowUnknown) {
                continue
            }

            throw new Error(`Unsupported argument: ${arg}`)
        }

        const nextValue = definition.value ?? true

        if (definition.collect) {
            options[definition.key] = definition.collect(options[definition.key], nextValue)
            continue
        }

        options[definition.key] = nextValue
    }

    return options
}

export function isDirectExecution(importMetaUrl, argvEntry = process.argv[1]) {
    if (!argvEntry) {
        return false
    }

    return importMetaUrl === pathToFileURL(path.resolve(argvEntry)).href
}
