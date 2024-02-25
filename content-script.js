class DocumentControl {
    constructor() {
        const {enablePreventEvent, scroll, lightControlsOn, nextControl, lightControlsOff, blurActiveElement, prevControl} = this
        const createKey = DocumentControl.createKey
        const setMode = this.setMode.bind(this)
        this.activeElement = null
        this.preventEnabled = false
        this.mode = MODES.COMMAND

        this.transitions = {
            [MODES.COMMAND]: {
                [createKey(KEYS.K)]: [enablePreventEvent, () => scroll(SCROLL_DIRECTIONS.TOP)],
                [createKey(KEYS.J)]: [enablePreventEvent, () => scroll(SCROLL_DIRECTIONS.BOTTOM)],
                [createKey(KEYS.I)]: [enablePreventEvent, () => setMode(MODES.INPUT)],
                [createKey(KEYS.L)]: [enablePreventEvent, () => setMode(MODES.LINK), lightControlsOn, nextControl],
                [createKey(KEYS.MORE)]: [enablePreventEvent, () => browser.runtime.sendMessage(JSON.stringify(['TAB_NEXT']))],
                [createKey(KEYS.LESS)]: [enablePreventEvent, () => browser.runtime.sendMessage(JSON.stringify(['TAB_PREV']))],
            },
            [MODES.LINK]: {
                [createKey(KEYS.ESC)]: [enablePreventEvent, () => setMode(MODES.COMMAND), lightControlsOff, blurActiveElement],
                [createKey(KEYS.K)]: [enablePreventEvent, prevControl],
                [createKey(KEYS.J)]: [enablePreventEvent, nextControl],
                [createKey(KEYS.I)]: [enablePreventEvent, () => setMode(MODES.INPUT)],
                [createKey(KEYS.L)]: [enablePreventEvent, () => setMode(MODES.COMMAND), lightControlsOff, blurActiveElement],
                [createKey(KEYS.O)]: [enablePreventEvent, () => DocumentControl.activate()],
                [createKey(KEYS.O, { isShift: true })]: [enablePreventEvent, () => DocumentControl.activate(true)],
            },
            [MODES.INPUT]: {
                [createKey(KEYS.ESC)]: [enablePreventEvent, () => setMode(MODES.COMMAND), blurActiveElement],
            },
        }

        this.blockKeys(MODES.COMMAND)
        this.blockKeys(MODES.LINK)

        window.addEventListener(EVENTS.KEYDOWN, this.handleKeyDown.bind(this), true)
        window.addEventListener(EVENTS.KEYUP, this.handleKeyUp.bind(this), true)
        window.addEventListener(EVENTS.KEYPRESS, this.handleKeyPress.bind(this), true)
    }

    static activate(self) {
        const el = document.querySelector('.light-current-element')

        if (!el) {
            return
        }

        if (el.tagName === 'A' && el.href && !el.href.startsWith('#') && !self) {
            browser.runtime.sendMessage(JSON.stringify(['TAB_NEW_BACKGROUND', el.href]))
            return
        }

        el.click()
    }

    blockKeys(mode) {
        const BLOCK_COMMANDS = [this.enablePreventEvent]

        Object.values(KEYS).forEach(k => {
            if (k === KEYS.ESC) {
                return
            }

            [
                DocumentControl.createKey(k),
                DocumentControl.createKey(k, { isShift: true })
            ].forEach(comb => {
                this.transitions[mode][comb] = this.transitions[mode][comb] || BLOCK_COMMANDS
            })
        })

    }

    static eventToKeyString(e) {
        const additionalKeys = { isMeta: e.metaKey, isCtrl: e.ctrlKey, isShift: e.shiftKey, isAlt: e.altKey }

        return DocumentControl.createKey(e.code, additionalKeys)
    }

    static createKey(code, additionalKeys = {}) {
        const { isMeta, isCtrl, isShift, isAlt } = additionalKeys

        return [code, !!isMeta, !!isCtrl, !!isShift, !!isAlt].toString()
    }

    get panel() {
        let el = document.querySelector('#key-palette')

        if (el) {
            return el
        }

        el = document.createElement('div')
        el.setAttribute('id', 'key-palette')
        el.setAttribute('style', 'position: fixed; top: 0; right: 0; z-index: 10000; color: #fff; background: #000;')
        document.body.append(el)

        return el
    }

    setMode(mode) {
        this.mode = mode
    }

    scroll(direction) {
        let top = document.documentElement.scrollTop

        switch (direction) {
            case SCROLL_DIRECTIONS.TOP:
                top -= 150
                break
            case SCROLL_DIRECTIONS.BOTTOM:
                top += 150
                break
        }

        document.documentElement.scroll({
            top,
            left: 0,
            behavior: 'smooth'
        })
    }

    preventEvent(e) {
        if (!this.preventEnabled) {
            return
        }

        e.stopImmediatePropagation()
        e.preventDefault()
    }

    enablePreventEvent() {
        this.preventEnabled = true
    }

    disablePreventEvent() {
        this.preventEnabled = false
    }

    lightControlsOn() {
        const elements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')

        elements.forEach((e) => {
            const { top, bottom} = e.getBoundingClientRect()

            if (top > 0 && bottom < window.innerHeight && e.checkVisibility({ checkVisibilityCSS: true })) {
                e.classList.add('light-element')
            }
        })
    }

    lightControlsOff() {
        const tmp = document.querySelectorAll('.light-element')

        tmp.forEach(e => {
            e.classList.remove('light-element')
        })

        this.activeElement = document.querySelector('.light-current-element')
        this.activeElement?.classList.remove('light-current-element')
    }

    nextControl() {
        const elements = [].slice.call(document.querySelectorAll('.light-element'))
        const index = elements.findIndex(e => e.classList.contains('light-current-element'))
        let nextElement = elements[index + 1] || elements[0]

        if (index === -1 && window.top !== window) {
            window.parent.top.focus()
            return;
        }

        if (index !== -1) {
            elements[index].classList.remove('light-current-element')
        }

        if (!nextElement) {
            return
        }

        nextElement = (this.activeElement && elements.find(e => e === this.activeElement)) || nextElement
        nextElement.classList.add('light-current-element')
        nextElement.focus()
        this.activeElement = null
    }

    prevControl() {
        const elements = [].slice.call(document.querySelectorAll('.light-element'))
        const index = elements.findIndex(e => e.classList.contains('light-current-element'))
        const prevElement = elements[index - 1] || elements[elements.length - 1]

        if (index !== -1) {
            elements[index].classList.remove('light-current-element')
        }

        if (!prevElement) {
            return
        }

        prevElement.classList.add('light-current-element')
        prevElement.focus()
    }

    blurActiveElement() {
        document.activeElement?.blur()
    }

    handleKeyDown(e) {
        const keyString = DocumentControl.eventToKeyString(e)
        const queue = this.transitions[this.mode]?.[keyString] || []

        queue.forEach(t => t.call(this, { code: e.code }))

        this.panel.innerHTML = `${this.mode}: ${e.code}`
        this.preventEvent(e)
    }

    handleKeyPress(e) {
        this.preventEvent(e)
    }

    handleKeyUp(e) {
        this.preventEvent(e)
        this.disablePreventEvent()
    }
}

const tmp = new DocumentControl()
