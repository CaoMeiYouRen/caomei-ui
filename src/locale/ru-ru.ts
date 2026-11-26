import type { CaomeiLocaleMessages } from './types'

const ruRU: CaomeiLocaleMessages = {
    qrcode: {
        label: 'QR-код',
        loading: 'Создание QR-кода…',
        loadFailed: 'Не удалось создать QR-код. Убедитесь, что qrcode установлен, а содержимое поддаётся кодированию.',
    },
    rating: {
        label: 'Оценка',
        readonlyLabel: 'Оценка только для чтения',
        valueLabel: '{value}',
    },
    anchor: {
        label: 'Навигация по якорям',
    },
    autoComplete: {
        empty: 'Нет подходящих предложений',
        open: 'Показать предложения',
    },
    calendar: {
        prev: 'Предыдущий месяц',
        next: 'Следующий месяц',
        label: 'Календарь',
    },
    chart: {
        loading: 'Загрузка диаграммы…',
        loadFailed: 'Не удалось загрузить диаграмму. Убедитесь, что vue-echarts установлен.',
    },
    cascader: {
        empty: 'Нет данных',
        clear: 'Очистить',
    },
    checkbox: {
        selectAll: 'Выбрать все',
    },
    colorPicker: {
        label: 'Цвет',
        hex: 'Шестнадцатеричный цвет',
        hue: 'Оттенок',
        area: 'Насыщенность и яркость',
        swatches: 'Предустановленные цвета',
        saturation: 'Насыщенность',
        brightness: 'Яркость',
        areaRole: 'Область выбора цвета',
        thumbRole: 'Ползунок цвета',
    },
    confirm: {
        confirm: 'Подтвердить',
        cancel: 'Отмена',
    },
    dataView: {
        empty: 'Нет данных',
    },
    datePicker: {
        label: 'Дата',
        range: 'Диапазон дат',
        rangeStart: 'Начало',
        rangeEnd: 'Конец',
        time: 'Время',
        hour: 'Час',
        minute: 'Минута',
        second: 'Секунда',
        prevYear: 'Предыдущий год',
        nextYear: 'Следующий год',
    },
    navBar: {
        label: 'Панель навигации',
        back: 'Назад',
    },
    dialog: {
        label: 'Диалог',
        close: 'Закрыть',
    },
    drawer: {
        label: 'Боковая панель',
        close: 'Закрыть',
    },
    fileUpload: {
        choose: 'Выбрать файл',
        prompt: 'Нажмите, чтобы выбрать файлы, или перетащите их сюда',
        noFileChosen: 'Файл не выбран',
        fileChosen: 'Выбрано файлов: {count}',
        sizeExceeded: '{name} превышает максимальный размер {max}',
        remove: 'Удалить {name}',
    },
    image: {
        label: 'Предпросмотр изображения',
        preview: 'Предпросмотр изображения',
        close: 'Закрыть',
    },
    input: {
        clear: 'Очистить',
    },
    inputNumber: {
        increase: 'Увеличить',
        decrease: 'Уменьшить',
    },
    inputOtp: {
        cellLabel: 'Цифра {index} из {total} кода подтверждения',
    },
    message: {
        close: 'Закрыть',
    },
    multiSelect: {
        open: 'Показать варианты',
        remove: 'Удалить',
        empty: 'Нет подходящих вариантов',
        clear: 'Очистить',
    },
    pagination: {
        label: 'Пагинация',
        first: 'Первая страница',
        previous: 'Предыдущая страница',
        next: 'Следующая страница',
        last: 'Последняя страница',
        page: 'Страница {page}',
        rowsPerPage: 'Строк на странице',
    },
    password: {
        show: 'Показать пароль',
        hide: 'Скрыть пароль',
        prompt: 'Введите пароль',
        weak: 'Надёжность: низкая',
        medium: 'Надёжность: средняя',
        strong: 'Надёжность: высокая',
    },
    progress: {
        loading: 'Загрузка',
        bar: 'Прогресс',
    },
    richTextEditor: {
        loading: 'Загрузка редактора…',
        loadFailed: 'Не удалось загрузить редактор. Убедитесь, что md-editor-v3 установлен.',
    },
    select: {
        clear: 'Очистить',
    },
    slider: {
        thumb: 'Ползунок',
        minimum: 'Минимум',
        maximum: 'Максимум',
    },
    splitButton: {
        menu: 'Другие действия',
    },
    splitter: {
        resize: 'Изменить размер панелей',
    },
    stepper: {
        label: 'Шаги',
    },
    tag: {
        close: 'Удалить',
    },
    table: {
        empty: 'Нет данных',
        selectAll: 'Выбрать текущую страницу',
        selectRow: 'Выбрать строку',
        expandRowGroup: 'Развернуть группу строк',
        collapseRowGroup: 'Свернуть группу строк',
        expandRow: 'Развернуть строку',
        collapseRow: 'Свернуть строку',
        columnResize: 'Изменить ширину столбца «{column}»',
    },
    tagsInput: {
        clear: 'Очистить',
    },
    transfer: {
        source: 'Источник',
        target: 'Цель',
        search: 'Поиск',
        empty: 'Нет данных',
        moveToTarget: 'Переместить вправо',
        moveToSource: 'Переместить влево',
    },
    toast: {
        label: 'Уведомление',
        viewport: 'Уведомления ({hotkey})',
        close: 'Закрыть',
    },
    backTop: {
        label: 'Наверх',
    },
    timePicker: {
        hour: 'Час',
        minute: 'Минута',
        second: 'Секунда',
        am: 'AM',
        pm: 'PM',
    },
    actionSheet: {
        label: 'Панель действий',
        cancel: 'Отмена',
    },
    tabbar: {
        label: 'Основная навигация',
    },
    tour: {
        label: 'Знакомство с продуктом',
        next: 'Далее',
        prev: 'Назад',
        skip: 'Пропустить',
        finish: 'Готово',
    },
    carousel: {
        prev: 'Предыдущий слайд',
        next: 'Следующий слайд',
        slide: 'Слайд {index} из {total}',
    },
}

export default ruRU
