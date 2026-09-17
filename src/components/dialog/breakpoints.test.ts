import { describe, expect, it } from 'vitest'
import { buildDialogBreakpointCss, parseDialogBreakpoints } from './breakpoints'

describe('parseDialogBreakpoints', () => {
    it('未提供时返回空数组', () => {
        expect(parseDialogBreakpoints()).toEqual([])
        expect(parseDialogBreakpoints(undefined)).toEqual([])
        expect(parseDialogBreakpoints({})).toEqual([])
    })

    it('按视口上限从宽到窄排序，与键顺序无关', () => {
        expect(parseDialogBreakpoints({ '575px': '95vw', '1199px': '85vw' })).toEqual([
            { maxWidth: '1199px', width: '85vw' },
            { maxWidth: '575px', width: '95vw' },
        ])
    })

    it('去除键值两侧空白', () => {
        expect(parseDialogBreakpoints({ ' 640px ': ' 100vw ' })).toEqual([
            { maxWidth: '640px', width: '100vw' },
        ])
    })

    it.each([
        ['非 px 键', { '5em': '80vw' }],
        ['无单位键', { '640': '80vw' }],
        ['非数值键', { small: '80vw' }],
        ['空键', { '': '80vw' }],
        ['不安全的长度值', { '640px': 'expression(alert(1))' }],
        ['含分号的注入值', { '640px': '100vw; color: red' }],
        ['空值', { '640px': '' }],
    ])('忽略非法条目：%s', (_name, breakpoints) => {
        expect(parseDialogBreakpoints(breakpoints as Record<string, string>)).toEqual([])
    })

    it('保留合法条目并忽略同对象内的非法条目', () => {
        expect(
            parseDialogBreakpoints({ '640px': '100vw', '5em': '80vw', '768px': '90vw' }),
        ).toEqual([
            { maxWidth: '768px', width: '90vw' },
            { maxWidth: '640px', width: '100vw' },
        ])
    })
})

describe('buildDialogBreakpointCss', () => {
    it('生成实例选择器限定的媒体查询，窄档在后', () => {
        const css = buildDialogBreakpointCss(
            '.caomei-dialog__content[data-caomei-dialog-breakpoint="v-0"]',
            parseDialogBreakpoints({ '1199px': '85vw', '575px': '95vw' }),
        )

        expect(css).toBe(
            '@media (width <= 1199px) { .caomei-dialog__content[data-caomei-dialog-breakpoint="v-0"] { width: 85vw; } }\n'
            + '@media (width <= 575px) { .caomei-dialog__content[data-caomei-dialog-breakpoint="v-0"] { width: 95vw; } }',
        )
    })

    it('空条目生成空串', () => {
        expect(buildDialogBreakpointCss('.x', [])).toBe('')
    })
})
