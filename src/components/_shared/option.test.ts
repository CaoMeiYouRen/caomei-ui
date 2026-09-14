import { describe, expect, it, vi } from 'vitest'
import { resolveOptionDisabled, resolveOptionField, resolveOptionValue } from './option'

interface MappedOption {
    name: string
    id: number
    constant?: boolean
}

const option: MappedOption = { name: '苹果', id: 1 }

describe('resolveOptionField', () => {
    it('未提供访问器时按默认字段名读取', () => {
        expect(resolveOptionField<MappedOption, string>(option, undefined, 'name')).toBe('苹果')
        expect(resolveOptionField<MappedOption, number>(option, undefined, 'id')).toBe(1)
    })

    it('字符串访问器按指定字段名读取', () => {
        expect(resolveOptionField<MappedOption, string>(option, 'name', 'value')).toBe('苹果')
        expect(resolveOptionField<MappedOption, number>(option, 'id', 'value')).toBe(1)
    })

    it('函数访问器以选项对象为参数调用', () => {
        const accessor = vi.fn((item: MappedOption) => `#${item.id}`)

        expect(resolveOptionField(option, accessor, 'name')).toBe('#1')
        expect(accessor).toHaveBeenCalledWith(option)
    })

    it('字段不存在时返回 undefined', () => {
        expect(resolveOptionField<MappedOption, string>(option, 'missing', 'name')).toBeUndefined()
        expect(resolveOptionField<MappedOption, string>(option, undefined, 'missing')).toBeUndefined()
    })

    it('函数访问器返回 undefined 时保留 undefined，不回退默认字段', () => {
        const result = resolveOptionField(option, () => undefined, 'name')
        expect(result).toBeUndefined()
    })

    it('字符串访问器支持 a.b 点号嵌套路径', () => {
        const nested = { user: { name: '草梅' }, meta: null }
        expect(resolveOptionField<typeof nested, string>(nested, 'user.name', 'label')).toBe('草梅')
    })

    it('嵌套路径中途缺省时返回 undefined', () => {
        const nested = { meta: null }
        expect(resolveOptionField<typeof nested, string>(nested, 'meta.name', 'label')).toBeUndefined()
        expect(resolveOptionField<typeof nested, string>(nested, 'missing.name', 'label')).toBeUndefined()
    })
})

describe('resolveOptionValue', () => {
    it('字符串与数字原样返回', () => {
        expect(resolveOptionValue<MappedOption>({ id: 1, name: '一' }, 'id', 'value')).toBe(1)
        expect(resolveOptionValue<MappedOption>({ id: 1, name: '一' }, 'name', 'value')).toBe('一')
    })

    it('非字符串 / 数字的解析结果一律返回 undefined', () => {
        const dirty = { id: null, flag: true, nested: { id: 1 } }
        expect(resolveOptionValue<typeof dirty>(dirty, 'id', 'value')).toBeUndefined()
        expect(resolveOptionValue<typeof dirty>(dirty, 'flag', 'value')).toBeUndefined()
        expect(resolveOptionValue<typeof dirty>(dirty, 'nested', 'value')).toBeUndefined()
        expect(resolveOptionValue<typeof dirty>(dirty, 'missing', 'value')).toBeUndefined()
    })

    it('函数访问器返回契约外取值时同样返回 undefined', () => {
        const nullable = { id: null as unknown as number, name: '一' }
        expect(resolveOptionValue(nullable, (item) => item.id, 'value')).toBeUndefined()
    })
})

describe('resolveOptionDisabled', () => {
    it('仅 disabled === true 视为禁用', () => {
        expect(resolveOptionDisabled({ disabled: true })).toBe(true)
    })

    it('字段缺省、false 与非布尔真值均不禁用', () => {
        expect(resolveOptionDisabled({})).toBe(false)
        expect(resolveOptionDisabled({ disabled: false })).toBe(false)
        expect(resolveOptionDisabled({ disabled: 1 })).toBe(false)
        expect(resolveOptionDisabled({ disabled: 'true' })).toBe(false)
    })
})
