import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mount } from '@vue/test-utils'
import { type DefineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import type { DataTableProps } from './types'
import { CaomeiDataTable } from './index'

interface Row {
    name: string | null
    age: number
}

const DataTable = CaomeiDataTable as unknown as DefineComponent<DataTableProps<Row>>

const baseData: Row[] = [
    { name: 'Ada', age: 36 },
    { name: 'Bob', age: 24 },
]

describe('CaomeiDataTable 冻结列', () => {
    it('frozen 左侧列应用吸边 class 与累计偏移', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', frozen: 'left', width: '120px' },
                    { key: 'age', header: '年龄', frozen: 'left', width: '80px' },
                ],
            },
        })

        const headers = wrapper.findAll('.caomei-data-table__th')
        expect(headers[0].classes()).toContain('caomei-data-table__cell--pinned-start')
        expect(headers[1].classes()).toContain('caomei-data-table__cell--pinned-start')
        expect(headers[0].attributes('style')).toContain('left: 0px')
        expect(headers[1].attributes('style')).toContain('left: 120px')

        const cells = wrapper.findAll('.caomei-data-table__row')[0].findAll('.caomei-data-table__td')
        expect(cells[0].classes()).toContain('caomei-data-table__cell--pinned-start')
        expect(cells[1].attributes('style')).toContain('left: 120px')
    })

    it('frozen 右侧列应用 end 吸边 class 与偏移', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名' },
                    { key: 'age', header: '年龄', frozen: 'right', width: '100px' },
                ],
            },
        })

        const headers = wrapper.findAll('.caomei-data-table__th')
        expect(headers[0].classes()).not.toContain('caomei-data-table__cell--pinned-end')
        expect(headers[1].classes()).toContain('caomei-data-table__cell--pinned-end')
        expect(headers[1].attributes('style')).toContain('right: 0px')
    })

    it('frozen 同侧多列按末端累计偏移', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', frozen: 'right', width: '120px' },
                    { key: 'age', header: '年龄', frozen: 'right', width: '100px' },
                ],
            },
        })

        const headers = wrapper.findAll('.caomei-data-table__th')
        expect(headers[0].attributes('style')).toContain('right: 100px')
        expect(headers[1].attributes('style')).toContain('right: 0px')
    })

    it('非 px 宽度按默认值估算，不误解析为 px', () => {
        const wrapper = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', frozen: 'left', width: '20%' },
                    { key: 'age', header: '年龄', frozen: 'left', width: '80px' },
                ],
            },
        })

        expect(wrapper.findAll('.caomei-data-table__th')[1].attributes('style')).toContain('left: 150px')
    })

    it('仅存在冻结列时设置表格 min-width', () => {
        const plain = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', width: '120px' },
                    { key: 'age', header: '年龄', width: '80px' },
                ],
            },
        })
        expect(plain.get('table').attributes('style')).toBeUndefined()

        const frozen = mount(DataTable, {
            props: {
                data: [...baseData],
                columns: [
                    { key: 'name', header: '姓名', frozen: 'left', width: '120px' },
                    { key: 'age', header: '年龄', width: '80px' },
                ],
            },
        })
        expect(frozen.get('table').attributes('style')).toContain('min-width: 200px')
    })

    it('行悬浮 / 选中背景以不透明底色混合（冻结列不透视）', () => {
        const source = readFileSync(join(process.cwd(), 'src/components/data-table/data-table.vue'), 'utf8')

        expect(source).toContain('color-mix(in srgb, var(--caomei-color-text) 4%, var(--caomei-color-bg))')
        expect(source).toContain('color-mix(in srgb, var(--caomei-color-primary) 8%, var(--caomei-color-bg))')
        expect(source).not.toContain('4%, transparent')
        expect(source).not.toContain('8%, transparent')
    })
})
