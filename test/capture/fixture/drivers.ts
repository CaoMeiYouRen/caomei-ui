import { defineComponent, onMounted } from 'vue'
import { ui } from './ui'
import { useConfirm, useToast } from '@/index'

/**
 * Toast 驱动：在 Provider 后代中取得 `useToast()`，把「按语气各入队一条常驻提示」
 * 暴露给采集脚本（`duration: 0` 表示不自动关闭，保证末段采样时提示仍在）。
 * 不渲染任何节点；提示本体由 Provider 经 Teleport 注入 `.caomei-toast-viewport`。
 */
export const ToastDriver = defineComponent({
    name: 'CaptureToastDriver',
    setup() {
        const toast = useToast()
        onMounted(() => {
            ui.showToasts = () => {
                toast.show({ tone: 'neutral', title: '中性', duration: 0 })
                toast.show({ tone: 'primary', title: '主要', duration: 0 })
                toast.show({ tone: 'success', title: '成功', duration: 0 })
                toast.show({ tone: 'warning', title: '警告', duration: 0 })
                toast.show({ tone: 'danger', title: '危险', duration: 0 })
            }
        })
        return () => null
    },
})

/**
 * ConfirmDialog 驱动：在 `<CaomeiConfirmDialog>` 后代中取得 `useConfirm()`，
 * 把命令式打开暴露给采集脚本（浮层视觉契约 11 面之一）。
 */
export const ConfirmDriver = defineComponent({
    name: 'CaptureConfirmDriver',
    setup() {
        const confirmApi = useConfirm()
        onMounted(() => {
            ui.confirm = () => {
                void confirmApi.confirm({ title: '确认操作', description: '采集确认框面板背景。' })
            }
        })
        return () => null
    },
})
