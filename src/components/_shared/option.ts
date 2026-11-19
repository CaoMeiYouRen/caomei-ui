import { warnDev } from '../../_shared/dev-warn'

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
    return narrowOptionValue(value)
}

/**
 * 把任意原始值收窄为 `OptionValue`：仅字符串 / 数字通过，其余（`null`、布尔、对象、缺省）返回 `undefined`。
 * @en Narrow any raw value to `OptionValue`: only strings / numbers pass; everything else (`null`, booleans,
 * objects, missing) returns `undefined`.
 */
export function narrowOptionValue(raw: unknown): OptionValue | undefined {
    return typeof raw === 'string' || typeof raw === 'number' ? raw : undefined
}

/**
 * 判断选项值是否为空字符串（契约外值）：模型侧的 `''` 表示「未选中」，因此默认不允许选项侧用 `''`
 * 承载真实值，且 Reka UI 的 Select / Combobox 选项禁止空串（面板渲染即抛断言）。
 * 开启 `allowEmptyValue` 后由内部 token 承载，本判断不再触发丢弃。
 * @en Whether an option value is the empty string (an out-of-contract value by default): `''` on the model
 * side means "nothing selected", so options cannot carry it as a real value, and Reka UI's Select / Combobox
 * items reject empty strings (rendering the panel throws). With `allowEmptyValue` the internal token carries
 * it instead and this check no longer drops the option.
 */
export function isEmptyOptionValue(value: OptionValue | undefined): value is '' {
    return value === ''
}

/**
 * 空值选项的内部承载 token：Reka 的 Select / Combobox 选项拒绝空串 value，开启 `allowEmptyValue`
 * 时以该字符串代替 `''` 送往面板，模型、插槽与事件载荷仍只见 `''`。
 *
 * 仅内部使用（不从包入口导出）。开启该开关时该字符串被视为保留值：值与之相同的非空选项会被
 * 丢弃并开发期告警，避免与空值项互相顶替。
 * @en Internal carrier token for the empty-value option: Reka's Select / Combobox items reject empty-string
 * values, so with `allowEmptyValue` this string replaces `''` on the panel side while the model, slots and
 * event payloads still see `''`. Internal only; while the flag is on this string is reserved.
 */
export const EMPTY_OPTION_TOKEN = '__caomei_empty_value__'

/**
 * 面板值 → 对外值：token 还原为空串，其余原样返回（仅 `allowEmptyValue` 路径使用）。
 * @en Panel value → public value: the token maps back to the empty string; everything else passes through.
 */
export function fromPanelValue(value: unknown): unknown {
    return value === EMPTY_OPTION_TOKEN ? '' : value
}

/**
 * 判断选项值是否与保留 token 冲突（开启 `allowEmptyValue` 时由调用方丢弃并告警）。
 * @en Whether an option value collides with the reserved token (callers drop and warn it while
 * `allowEmptyValue` is on).
 */
export function isReservedEmptyToken(value: OptionValue): boolean {
    return value === EMPTY_OPTION_TOKEN
}

/**
 * 开发期提示：选项值为空字符串时该选项会被丢弃。
 * 只做提示，不改变解析结果与生产输出（`warnDev` 在生产构建中静默）。
 * @en Dev-time notice: an option whose value is the empty string is discarded. This only warns; it does not
 * change the resolved result or production output (`warnDev` is silent in production builds).
 */
export function warnEmptyOptionValue(componentName: string, index: number, groupLabel?: string): void {
    const position = groupLabel === undefined
        ? `第 ${index + 1} 个选项`
        : `分组「${groupLabel}」的第 ${index + 1} 个选项`
    warnDev(
        `[${componentName}] ${position}的 value 为空字符串，该选项不会渲染；如需「全部 / 不限」，请改用非空哨兵值。`,
    )
}

/**
 * 解析选项禁用态：仅 `disabled === true` 视为禁用，字段缺省或为其它真值时均不禁用。
 * @en Resolve an option's disabled state: only `disabled === true` counts as disabled; a missing field
 * or any other truthy value leaves the option enabled.
 */
export function resolveOptionDisabled(option: object): boolean {
    return (option as Record<string, unknown>).disabled === true
}
