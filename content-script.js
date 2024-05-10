class DocumentControl {
    constructor() {
        const createKey = this.createKey.bind(this)
        const ep = this.enablePreventEvent.bind(this)

        this.mode = MODES.SHADOW
        this.preventEnabled = false
        this.transitions = {
            [MODES.SHADOW]: {
                [createKey(MODIFICATIONS_KEYS.ShiftLeft)]: [this.setPendingMode],
                [createKey(MODIFICATIONS_KEYS.ShiftRight)]: [this.setPendingMode],
            },
            [MODES.PENDING]: {
                [createKey(MODIFICATIONS_KEYS.ShiftLeft)]: [this.setCommandMode],
                [createKey(MODIFICATIONS_KEYS.ShiftRight)]: [this.setCommandMode],
            },
            [MODES.COMMAND]: {
                [createKey(PRIMARY_KEYS.ESC)]: [ep, this.setShadowMode],
                [createKey(PRIMARY_KEYS.Z)]: [ep, this.setShadowMode],
                [createKey(PRIMARY_KEYS.K)]: [ep, Commands.scrollTop],
                [createKey(PRIMARY_KEYS.J)]: [ep, Commands.scrollBottom],
                [createKey(PRIMARY_KEYS.K, { isShift: true })]: [ep, Commands.scrollToTop],
                [createKey(PRIMARY_KEYS.J, { isShift: true })]: [ep, Commands.scrollToBottom],
                [createKey(PRIMARY_KEYS.MORE)]: [ep, Commands.nextTab],
                [createKey(PRIMARY_KEYS.LESS)]: [ep, Commands.prevTab],
                [createKey(PRIMARY_KEYS.MORE, { isShift: true })]: [ep, Commands.moveCurrentTabToRight],
                [createKey(PRIMARY_KEYS.LESS, { isShift: true })]: [ep, Commands.moveCurrentTabToLeft],
                [createKey(PRIMARY_KEYS.D)]: [ep, Commands.duplicateTab],
                [createKey(PRIMARY_KEYS.D, { isShift: true })]: [ep, Commands.duplicateAndActiveTab],
                [createKey(PRIMARY_KEYS.X)]: [ep, Commands.closeCurrentTab],
                [createKey(PRIMARY_KEYS.R)]: [ep, Commands.updateCurrentTab],
                [createKey(PRIMARY_KEYS.Semicolon)]: [ep, Commands.markControls],
                [createKey(PRIMARY_KEYS.T)]: [ep, Commands.newTab],
                // [createKey(PRIMARY_KEYS.A)]: [ep, Commands.showLinksBlocks],
            },
        }

        this.blockKeys(MODES.COMMAND)

        window.addEventListener(EVENTS.KEYPRESS, this.handleKeyPress.bind(this), { capture: true })
        window.addEventListener(EVENTS.KEYDOWN, this.handleKeyDown.bind(this), { capture: true })
        window.addEventListener(EVENTS.KEYUP, this.handleKeyUp.bind(this), { capture: true })
        browser.runtime.onMessage.addListener(this.handleMessage.bind(this))
    }

    setPendingMode() {
        this.setMode(MODES.PENDING)
        Commands.message([MODES.PENDING])
    }

    setCommandMode() {
        this.setMode(MODES.COMMAND)
        Commands.message(MODES.COMMAND)
    }

    setShadowMode() {
        this.setMode(MODES.SHADOW)
        Commands.message(MODES.SHADOW)
    }

    blockKeys(mode) {
        const BLOCK_COMMANDS = [this.enablePreventEvent]

        Object.values(PRIMARY_KEYS).forEach(k => {
            if (k === PRIMARY_KEYS.ESC) {
                return
            }

            [
                this.createKey(k),
                this.createKey(k, { isShift: true })
            ].forEach(comb => {
                this.transitions[mode][comb] = this.transitions[mode][comb] || BLOCK_COMMANDS
            })
        })

    }

    eventToKeyString(e) {
        const additionalKeys = { isMeta: e.metaKey, isCtrl: e.ctrlKey, isShift: e.shiftKey, isAlt: e.altKey }

        return this.createKey(e.code, additionalKeys)
    }

    createKey(code, additionalKeys = {}) {
        const { isMeta, isCtrl, isShift, isAlt } = additionalKeys
        const { ShiftLeft, ShiftRight } = MODIFICATIONS_KEYS

        return [
            code,
            !!isMeta,
            !!isCtrl,
            !!isShift || [ShiftLeft, ShiftRight].includes(code),
            !!isAlt,
        ].toString()
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

    setMode(mode) {
        this.mode = mode
        Commands.message([ACTIONS.SET_MODE, mode])
        Panel.setMode(mode)
    }

    handleMessage(m) {
        const [_, mode] = JSON.parse(m)
        this.setMode(mode)
    }

    handleKeyDown(e) {
        const keyString = this.eventToKeyString(e)
        const queue = this.transitions[this.mode]?.[keyString] || []

        if (this.mode === MODES.PENDING && !queue.length) {
            this.setMode(MODES.SHADOW)
        } else {
            queue.forEach(q => q.call(this))
        }

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

browser.runtime.sendMessage(JSON.stringify([ACTIONS.GET_MODE])).then(res => {
    const panel = new Panel()
    const control = new DocumentControl(panel)

    control.setMode(res)
})

window.document.onreadystatechange = (e) => {

}