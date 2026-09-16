/**
 * 选项字段访问器：字段名（支持 `a.b` 点号路径），或从选项对象取值的函数。
 * @en Option field accessor: a field name (with `a.b` dot-path support), or a function reading the value
 * from an option object.
 */
export type OptionFieldAccessor<T, V> = string | ((option: T) => V)

/**
 * 选项值：字符串或数字，对齐 Reka UI `AcceptableValue` 中可稳定比较的子集。
 * @en Option value: string or number, aligning with the stably comparable subset of Reka UI's `AcceptableValue`.
 */
export type OptionValue = string | number

/** 支持 `a.b.c` 点号嵌套取值（对齐 DataTable 的行取值语义）。 */
function readByPath(source: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, segment) => {
        if (acc === null || acc === undefined) {
            return undefined
        }
        return (acc as Record<string, unknown>)[segment]
    }, source)
}

/**
 * 解析单个选项字段：
 * 函数访问器直接调用，字符串访问器按字段名（或 `a.b` 点号路径）读取，
 * 未提供时回退到 `defaultKey` 字段。
 * @en Resolve a single option field: a function accessor is called directly, a string accessor reads that
 * field name (or `a.b` dot-path), and when neither is provided it falls back to the `defaultKey` field.
 */
export function resolveOptionField<T extends object, V>(
    option: T,
    accessor: OptionFieldAccessor<T, V> | undefined,
    defaultKey: string,
): V | undefined {
    if (typeof accessor === 'function') {
        return accessor(option)
    }
    const key = typeof accessor === 'string' ? accessor : defaultKey
    return readByPath(option as Record<string, unknown>, key) as V | undefined
}

/**
 * 解析选项值并收窄到 `OptionValue`：
 * 解析结果非字符串 / 数字（如 `null`、布尔、对象或字段缺省）时返回 `undefined`，
 * 由调用方按契约丢弃该选项。
 * @en Resolve an option value and narrow it to `OptionValue`: when the resolved result is not a string
 * or number (such as `null`, a boolean, an object, or a missing field) it returns `undefined` so the
 * caller can discard the option per contract.
 */
export function resolveOptionValue<T extends object>(
    option: T,
    accessor: OptionFieldAccessor<T, OptionValue> | undefined,
    defaultKey: string,
): OptionValue | undefined {
    const value: unknown = resolveOptionField(option, accessor, defaultKey)
    return typeof value === 'string' || typeof value === 'number' ? value : undefined
}

/**
 * 解析选项禁用态：仅 `disabled === true` 视为禁用，字段缺省或为其它真值时均不禁用。
 * @en Resolve an option's disabled state: only `disabled === true` counts as disabled; a missing field
 * or any other truthy value leaves the option enabled.
 */
export function resolveOptionDisabled(option: object): boolean {
    return (option as Record<string, unknown>).disabled === true
}
