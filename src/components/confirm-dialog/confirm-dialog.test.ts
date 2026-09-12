import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { useConfirm, type ConfirmApi } from '../../composables/use-confirm'
import type { ConfirmDialogProps } from './types'
import { CaomeiConfirmDialog } from './index'

let api: ConfirmApi | undefined

const consumer = defineComponent({
    setup() {
        api = useConfirm()
        return () => h('div', { 'data-test': 'consumer' })
    },
})

const mounted: ReturnType<typeof mount>[] = []

function createHost(props: ConfirmDialogProps & Record<string, unknown> = {}) {
    return defineComponent({
        setup() {
            return () =>
                h('div', null, [
                    h(CaomeiConfirmDialog, props, { default: () => h(consumer) }),
                ])
        },
    })
}

async function mountHost(
    props: ConfirmDialogProps & Record<string, unknown> = {},
): Promise<ReturnType<typeof mount>> {
    const wrapper = mount(createHost(props), { attachTo: document.body })
    mounted.push(wrapper)
    await flushPromises()
    return wrapper
}

function getDialog(): HTMLElement | null {
    return document.querySelector('[role="alertdialog"]')
}

function getButtons(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('.caomei-confirm-dialog__footer button'))
}

function getCancelButton(): HTMLButtonElement {
    return getButtons()[0]
}

function getConfirmButton(): HTMLButtonElement {
    return getButtons()[1]
}

afterEach(() => {
    api = undefined
    while (mounted.length > 0) {
        mounted.pop()?.unmount()
    }
    document.body.innerHTML = ''
})

describe('CaomeiConfirmDialog', () => {
    it('无待决请求时不渲染对话框', async () => {
        await mountHost()

        expect(getDialog()).toBeNull()
    })

    it('请求打开后渲染标题、描述与默认按钮文案并建立 aria 关联', async () => {
        await mountHost()

        api?.confirm({ title: '删除文件', description: '删除后不可恢复' })
        await flushPromises()

        const dialog = getDialog()
        expect(dialog).not.toBeNull()
        expect(dialog?.textContent).toContain('删除文件')
        expect(dialog?.textContent).toContain('删除后不可恢复')
        expect(getCancelButton().textContent?.trim()).toBe('取消')
        expect(getConfirmButton().textContent?.trim()).toBe('确定')

        const labelledby = dialog?.getAttribute('aria-labelledby')
        const describedby = dialog?.getAttribute('aria-describedby')
        expect(document.getElementById(labelledby as string)?.textContent).toBe('删除文件')
        expect(document.getElementById(describedby as string)?.textContent).toBe('删除后不可恢复')
        expect(dialog?.getAttribute('aria-modal')).toBe('true')
    })

    it('点击确认按钮以 true 结算并移除对话框', async () => {
        await mountHost()

        const pending = api?.confirm('继续操作？') as Promise<boolean>
        await flushPromises()

        getConfirmButton().click()
        await flushPromises()

        await expect(pending).resolves.toBe(true)
        expect(getDialog()).toBeNull()
    })

    it('点击取消按钮以 false 结算并移除对话框', async () => {
        await mountHost()

        const pending = api?.confirm('继续操作？') as Promise<boolean>
        await flushPromises()

        getCancelButton().click()
        await flushPromises()

        await expect(pending).resolves.toBe(false)
        expect(getDialog()).toBeNull()
    })

    it('按下 Esc 以 false 结算（AlertDialog 未屏蔽 Escape）', async () => {
        await mountHost()

        const pending = api?.confirm('继续操作？') as Promise<boolean>
        await flushPromises()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
        await flushPromises()

        await expect(pending).resolves.toBe(false)
        expect(getDialog()).toBeNull()
    })

    it('程序调用 cancel 关闭当前对话框', async () => {
        await mountHost()

        const pending = api?.confirm('继续操作？') as Promise<boolean>
        await flushPromises()
        expect(getDialog()).not.toBeNull()

        api?.cancel()
        await flushPromises()

        await expect(pending).resolves.toBe(false)
        expect(getDialog()).toBeNull()
    })

    it('单次请求的 label 覆盖组件默认值', async () => {
        await mountHost({ confirmLabel: '默认确定', cancelLabel: '默认取消' })

        api?.open({
            title: '删除',
            confirmLabel: '删除',
            cancelLabel: '保留',
        })
        await flushPromises()

        expect(getCancelButton().textContent?.trim()).toBe('保留')
        expect(getConfirmButton().textContent?.trim()).toBe('删除')
    })

    it('未提供单次 label 时回退到组件默认值', async () => {
        await mountHost({ confirmLabel: '好的', cancelLabel: '算了' })

        api?.confirm('继续操作？')
        await flushPromises()

        expect(getCancelButton().textContent?.trim()).toBe('算了')
        expect(getConfirmButton().textContent?.trim()).toBe('好的')
    })

    it('danger 语气为确认按钮附加危险强调类', async () => {
        await mountHost()

        api?.open({ title: '删除', tone: 'danger' })
        await flushPromises()

        expect(getConfirmButton().classList.contains('caomei-confirm-dialog__confirm--danger')).toBe(
            true,
        )
        expect(getCancelButton().className).not.toContain('confirm--danger')
    })

    it('neutral 语气不附加危险强调类', async () => {
        await mountHost()

        api?.confirm('继续操作？')
        await flushPromises()

        expect(getConfirmButton().className).not.toContain('confirm--danger')
    })

    it('透传原生属性到对话框内容', async () => {
        await mountHost({ 'data-test': 'confirm' })

        api?.confirm('继续操作？')
        await flushPromises()

        expect(getDialog()?.getAttribute('data-test')).toBe('confirm')
    })

    it('宿主卸载时以 false 结算待决请求', async () => {
        const wrapper = await mountHost()

        const pending = api?.confirm('继续操作？') as Promise<boolean>
        await flushPromises()
        expect(getDialog()).not.toBeNull()

        wrapper.unmount()
        mounted.pop()

        await expect(pending).resolves.toBe(false)
        expect(getDialog()).toBeNull()
    })

    it('确认点击的延后结算不会误结算随后同步开启的新请求', async () => {
        await mountHost()

        const first = api?.confirm('第一个') as Promise<boolean>
        await flushPromises()

        // 确认点击只排程 nextTick 结算；同一 tick 内立即开启新请求
        getConfirmButton().click()
        const second = api?.confirm('第二个') as Promise<boolean>
        await flushPromises()

        await expect(first).resolves.toBe(false)
        expect(getDialog()?.textContent).toContain('第二个')

        getConfirmButton().click()
        await flushPromises()

        await expect(second).resolves.toBe(true)
    })

    it('连续请求时旧请求以 false 结算，新请求独立结算', async () => {
        await mountHost()

        const first = api?.confirm('第一个') as Promise<boolean>
        await flushPromises()
        const second = api?.confirm('第二个') as Promise<boolean>
        await flushPromises()

        await expect(first).resolves.toBe(false)
        expect(getDialog()?.textContent).toContain('第二个')

        getConfirmButton().click()
        await flushPromises()

        await expect(second).resolves.toBe(true)
    })
})
