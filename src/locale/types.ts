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
    calendar: {
        prev: string
        next: string
        label: string
    }
    checkbox: {
        selectAll: string
    }
    colorPicker: {
        label: string
        hex: string
        hue: string
        area: string
        swatches: string
        saturation: string
        brightness: string
        areaRole: string
        thumbRole: string
    }
    confirm: {
        confirm: string
        cancel: string
    }
    dataView: {
        empty: string
    }
    datePicker: {
        label: string
        time: string
        hour: string
        minute: string
        second: string
    }
    dialog: {
        label: string
        close: string
    }
    drawer: {
        label: string
        close: string
    }
    fileUpload: {
        choose: string
        prompt: string
        noFileChosen: string
        fileChosen: string
        sizeExceeded: string
    }
    image: {
        label: string
        preview: string
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
        clear: string
    }
    pagination: {
        label: string
        first: string
        previous: string
        next: string
        last: string
        page: string
        rowsPerPage: string
    }
    password: {
        show: string
        hide: string
        prompt: string
        weak: string
        medium: string
        strong: string
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
    splitButton: {
        menu: string
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
        expandRowGroup: string
        collapseRowGroup: string
    }
    toast: {
        label: string
        viewport: string
        close: string
    }
}
