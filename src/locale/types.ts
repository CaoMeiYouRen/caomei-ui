/**
 * 文案覆盖：按命名空间浅合并到基准语言之上，未提供的键回退基准文案。
 * @en Locale message overrides: shallow-merged per namespace onto the base locale; missing keys fall back to the base text.
 */
export type CaomeiLocaleMessageOverrides = {
    [K in keyof CaomeiLocaleMessages]?: Partial<CaomeiLocaleMessages[K]>
}

export interface CaomeiLocaleMessages {
    actionSheet: {
        label: string
        cancel: string
    }
    backTop: {
        label: string
    }
    timePicker: {
        hour: string
        minute: string
        second: string
        am: string
        pm: string
    }
    qrcode: {
        label: string
        loading: string
        loadFailed: string
    }
    rating: {
        label: string
        readonlyLabel: string
        valueLabel: string
    }
    anchor: {
        label: string
    }
    autoComplete: {
        empty: string
        open: string
    }
    chart: {
        loading: string
        loadFailed: string
    }
    calendar: {
        prev: string
        next: string
        label: string
    }
    cascader: {
        empty: string
        clear: string
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
        range: string
        rangeStart: string
        rangeEnd: string
        time: string
        hour: string
        minute: string
        second: string
        prevYear: string
        nextYear: string
    }
    navBar: {
        label: string
        back: string
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
        /** 移除文件按钮的提示与可访问名；`{name}` 为文件名 */
        remove: string
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
    inputOtp: {
        cellLabel: string
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
    richTextEditor: {
        loading: string
        loadFailed: string
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
    splitter: {
        resize: string
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
        expandRow: string
        collapseRow: string
        /** 列宽拖拽手柄的可访问名；`{column}` 为列标题 */
        columnResize: string
    }
    tabbar: {
        label: string
    }
    tagsInput: {
        clear: string
    }
    transfer: {
        source: string
        target: string
        search: string
        empty: string
        moveToTarget: string
        moveToSource: string
    }
    toast: {
        label: string
        viewport: string
        close: string
    }
    tour: {
        label: string
        next: string
        prev: string
        skip: string
        finish: string
    }
}
