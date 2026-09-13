import { enableAutoUnmount, mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CaomeiFileUpload } from './index'

enableAutoUnmount(afterEach)

function makeFile(name: string, type = 'image/png', size = 1024): File {
    return new File([new Uint8Array(size)], name, { type })
}

function mountUpload(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
    return mount(CaomeiFileUpload, {
        props,
        attachTo: document.body,
        ...options,
    })
}

function getInput(wrapper: ReturnType<typeof mountUpload>) {
    return wrapper.get('.caomei-file-upload__input')
}

async function setInputFiles(wrapper: ReturnType<typeof mountUpload>, files: File[]) {
    const input = getInput(wrapper)
    Object.defineProperty(input.element, 'files', { value: files, configurable: true })
    await input.trigger('change')
}

function lastValue(wrapper: ReturnType<typeof mountUpload>): File[] {
    const emitted = wrapper.emitted('update:modelValue') as unknown[][] | undefined
    return (emitted?.at(-1)?.[0] ?? []) as File[]
}

describe('CaomeiFileUpload', () => {
    it('渲染选择按钮与隐藏文件输入', () => {
        const wrapper = mountUpload({ accept: 'image/*', multiple: true })

        const button = wrapper.get('.caomei-file-upload__dropzone')
        expect(button.element.tagName).toBe('BUTTON')

        const input = getInput(wrapper)
        expect(input.attributes('type')).toBe('file')
        expect(input.attributes('accept')).toBe('image/*')
        expect(input.attributes('multiple')).toBeDefined()
    })

    it('点击选择按钮触发 input.click', async () => {
        const wrapper = mountUpload()
        const input = getInput(wrapper)
        const spy = vi.spyOn(input.element as HTMLInputElement, 'click')

        await wrapper.get('.caomei-file-upload__dropzone').trigger('click')

        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('选择文件后更新列表并渲染文件名', async () => {
        const wrapper = mountUpload()

        await setInputFiles(wrapper, [makeFile('a.png')])

        expect(lastValue(wrapper).map((file) => file.name)).toEqual(['a.png'])
        expect(wrapper.get('.caomei-file-upload__name').text()).toBe('a.png')
    })

    it('非多选时用新选择替换旧列表', async () => {
        const wrapper = mountUpload({ modelValue: [makeFile('old.png')] })

        await setInputFiles(wrapper, [makeFile('new.png')])

        expect(lastValue(wrapper).map((file) => file.name)).toEqual(['new.png'])
    })

    it('多选时追加并去重', async () => {
        const wrapper = mountUpload({ multiple: true })
        const first = makeFile('a.png')

        await setInputFiles(wrapper, [first, makeFile('b.png')])
        expect(lastValue(wrapper).map((file) => file.name)).toEqual(['a.png', 'b.png'])

        // 重复添加同一文件应被去重，列表保持不变
        await setInputFiles(wrapper, [first])
        expect(lastValue(wrapper).map((file) => file.name)).toEqual(['a.png', 'b.png'])
    })

    it('accept 约束过滤不匹配的文件', async () => {
        const wildcard = mountUpload({ accept: 'image/*' })
        await setInputFiles(wildcard, [makeFile('doc.pdf', 'application/pdf')])
        expect(wildcard.emitted('update:modelValue')).toBeUndefined()

        const extension = mountUpload({ accept: '.pdf' })
        await setInputFiles(extension, [makeFile('doc.pdf', 'application/pdf')])
        expect(lastValue(extension).map((file) => file.name)).toEqual(['doc.pdf'])
    })

    it('拖拽文件更新列表，拖拽中显示状态类', async () => {
        const wrapper = mountUpload()
        const dropzone = wrapper.get('.caomei-file-upload__dropzone')

        await dropzone.trigger('dragenter')
        expect(dropzone.classes()).toContain('caomei-file-upload__dropzone--dragging')

        await dropzone.trigger('drop', { dataTransfer: { files: [makeFile('drop.png')] } })

        expect(dropzone.classes()).not.toContain('caomei-file-upload__dropzone--dragging')
        expect(lastValue(wrapper).map((file) => file.name)).toEqual(['drop.png'])
    })

    it('移除按钮从列表删除文件并具备可访问名', async () => {
        const wrapper = mountUpload({
            multiple: true,
            modelValue: [makeFile('a.png'), makeFile('b.png')],
        })

        const removeButtons = wrapper.findAll('.caomei-file-upload__remove')
        expect(removeButtons[0].attributes('aria-label')).toBe('移除 a.png')

        await removeButtons[0].trigger('click')

        expect(lastValue(wrapper).map((file) => file.name)).toEqual(['b.png'])
    })

    it('禁用时不可选择、不可拖拽、不可移除', async () => {
        const wrapper = mountUpload({ disabled: true, modelValue: [makeFile('a.png')] })

        expect(wrapper.get('.caomei-file-upload__dropzone').attributes('disabled')).toBeDefined()
        expect(getInput(wrapper).attributes('disabled')).toBeDefined()
        expect(wrapper.get('.caomei-file-upload__remove').attributes('disabled')).toBeDefined()

        await wrapper.get('.caomei-file-upload__dropzone').trigger('drop', {
            dataTransfer: { files: [makeFile('b.png')] },
        })
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('格式化文件大小', () => {
        const wrapper = mountUpload({
            modelValue: [
                makeFile('small.png', 'image/png', 512),
                makeFile('mid.png', 'image/png', 2048),
            ],
        })

        const sizes = wrapper.findAll('.caomei-file-upload__size').map((node) => node.text())
        expect(sizes).toEqual(['512 B', '2.0 KB'])
    })

    it('file 插槽可自定义列表项', () => {
        const wrapper = mountUpload(
            { modelValue: [makeFile('a.png')] },
            {
                slots: {
                    file: ({ file }: { file: File }) => h('span', { class: 'custom-file' }, file.name),
                },
            },
        )

        expect(wrapper.get('.custom-file').text()).toBe('a.png')
    })

    it('class 留根元素，控制与表单属性透传到内层控件', () => {
        const wrapper = mountUpload({}, {
            attrs: {
                class: 'custom-upload',
                'aria-describedby': 'hint',
                id: 'uploader',
                name: 'avatar',
                required: true,
            },
        })

        const root = wrapper.get('.caomei-file-upload')
        expect(root.classes()).toContain('custom-upload')
        expect(root.attributes('name')).toBeUndefined()
        expect(root.attributes('aria-describedby')).toBeUndefined()

        const button = wrapper.get('.caomei-file-upload__dropzone')
        expect(button.attributes('id')).toBe('uploader')
        expect(button.attributes('aria-describedby')).toBe('hint')

        const input = getInput(wrapper)
        expect(input.attributes('name')).toBe('avatar')
        expect(input.attributes('required')).toBeDefined()
    })

    it('选择后复位 input.value 以支持重选同一文件', async () => {
        const wrapper = mountUpload()
        const input = getInput(wrapper).element as HTMLInputElement
        // happy-dom 下文件输入 value 恒为空，改用实例 setter 记录赋值行为
        let assigned: string | undefined
        Object.defineProperty(input, 'value', {
            configurable: true,
            get: () => 'pending',
            set: (value: string) => {
                assigned = value
            },
        })

        await setInputFiles(wrapper, [makeFile('a.png')])

        expect(assigned).toBe('')
    })

    it('窗口内拖拽结束或释放时复位拖拽态', async () => {
        const wrapper = mountUpload()
        const dropzone = wrapper.get('.caomei-file-upload__dropzone')

        await dropzone.trigger('dragenter')
        expect(dropzone.classes()).toContain('caomei-file-upload__dropzone--dragging')

        window.dispatchEvent(new Event('dragend'))
        await nextTick()

        expect(dropzone.classes()).not.toContain('caomei-file-upload__dropzone--dragging')
    })

    it('accept 为 MIME 通配且浏览器未提供 type 时不匹配，扩展名可匹配', async () => {
        const wildcard = mountUpload({ accept: 'image/*' })
        await setInputFiles(wildcard, [new File(['x'], 'unknown.bin', { type: '' })])
        expect(wildcard.emitted('update:modelValue')).toBeUndefined()

        const extension = mountUpload({ accept: '.bin' })
        await setInputFiles(extension, [new File(['x'], 'unknown.bin', { type: '' })])
        expect(lastValue(extension).map((file) => file.name)).toEqual(['unknown.bin'])
    })

    it('label 仅在自定义提示内容时作为可访问名', () => {
        const withDefault = mountUpload({ label: '上传附件' })
        expect(withDefault.get('.caomei-file-upload__dropzone').attributes('aria-label')).toBeUndefined()

        const withCustom = mount(CaomeiFileUpload, {
            props: { label: '上传附件' },
            slots: { default: () => h('span', '图标提示') },
            attachTo: document.body,
        })
        expect(withCustom.get('.caomei-file-upload__dropzone').attributes('aria-label')).toBe('上传附件')
    })
})
