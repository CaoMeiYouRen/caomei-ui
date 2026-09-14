/**
 * 文案覆盖：按命名空间浅合并到基准语言之上，未提供的键回退基准文案。
 * @en Locale message overrides: shallow-merged per namespace onto the base locale; missing keys fall back to the base text.
 */
export type CaomeiLocaleMessageOverrides = {
    [K in keyof CaomeiLocaleMessages]?: Partial<CaomeiLocaleMessages[K]>
}

export interface CaomeiLocaleMessages {
    autoComplete: {
        empty: string
        open: string
    }
    confirm: {
        confirm: string
        cancel: string
    }
    dialog: {
        close: string
    }
    input: {
        clear: string
    }
    inputNumber: {
        increase: string
        decrease: string
    }
    message: {
        close: string
    }
    multiSelect: {
        open: string
        remove: string
        empty: string
    }
    pagination: {
        label: string
        first: string
        previous: string
        next: string
        last: string
        page: string
    }
    password: {
        show: string
        hide: string
    }
    progress: {
        loading: string
        bar: string
    }
    select: {
        clear: string
    }
    slider: {
        thumb: string
        minimum: string
        maximum: string
    }
    stepper: {
        label: string
    }
    tag: {
        close: string
    }
    table: {
        empty: string
        selectAll: string
        selectRow: string
    }
    toast: {
        label: string
        viewport: string
        close: string
    }
}
