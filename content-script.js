const DOUBLE_KEY_TIMEOUT = 400

class DocumentControl {
    constructor() {
        const createKey = this.createKey.bind(this)
        const ep = this.enablePreventEvent.bind(this)

        this.mode = MODES.SHADOW
        this.preventEnabled = false
        this.controlId = ''
        this.transitions = {
            [MODES.SHADOW]: {
                [createKey(MODIFICATIONS_KEYS.ShiftLeft)]: [this.setShadowToCommandMode],
                [createKey(MODIFICATIONS_KEYS.ShiftRight)]: [this.setShadowToCommandMode],
            },
            [MODES.SHADOW_TO_COMMAND]: {
                [createKey(MODIFICATIONS_KEYS.ShiftLeft)]: [this.setCommandMode],
                [createKey(MODIFICATIONS_KEYS.ShiftRight)]: [this.setCommandMode],
            },
            [MODES.COMMAND]: {
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
                [createKey(PRIMARY_KEYS.T)]: [ep, Commands.newTab],
                [createKey(MODIFICATIONS_KEYS.ShiftLeft)]: [ep, this.setCommandToShadowMode],
                [createKey(MODIFICATIONS_KEYS.ShiftRight)]: [ep, this.setCommandToShadowMode],
                [createKey(PRIMARY_KEYS.Semicolon)]: [ep, this.setControlSelectMode],
                [createKey(PRIMARY_KEYS.Space)]: [],
            },
            [MODES.COMMAND_TO_SHADOW]: {
                [createKey(MODIFICATIONS_KEYS.ShiftLeft)]: [this.setShadowMode],
                [createKey(MODIFICATIONS_KEYS.ShiftRight)]: [this.setShadowMode],
            },
            [MODES.CONTROL_SELECT]: {
                [createKey(PRIMARY_KEYS.Semicolon)]: [ep, this.selectModeToCommandMode],
                [createKey(PRIMARY_KEYS.J)]: [ep, this.handleControlSelect],
                [createKey(PRIMARY_KEYS.K)]: [ep, this.handleControlSelect],
                [createKey(PRIMARY_KEYS.L)]: [ep, this.handleControlSelect],
                [createKey(PRIMARY_KEYS.Backspace)]: [ep, this.handleControlSelect],
                [createKey(PRIMARY_KEYS.I)]: [ep, this.controlClick],
                [createKey(PRIMARY_KEYS.O)]: [ep, this.openInNewTab],
                [createKey(MODIFICATIONS_KEYS.ShiftLeft)]: [this.setSelectToShadowMode],
                [createKey(MODIFICATIONS_KEYS.ShiftRight)]: [this.setSelectToShadowMode],
            },
            [MODES.SELECT_TO_SHADOW]: {
                [createKey(MODIFICATIONS_KEYS.ShiftLeft)]: [this.setCommandMode],
                [createKey(MODIFICATIONS_KEYS.ShiftRight)]: [this.setCommandMode],
            }
        }

        this.blockKeys(MODES.COMMAND)
        this.blockKeys(MODES.CONTROL_SELECT)

        window.addEventListener(EVENTS.KEYPRESS, this.handleKeyPress.bind(this), { capture: true })
        window.addEventListener(EVENTS.KEYDOWN, this.handleKeyDown.bind(this), { capture: true })
        window.addEventListener(EVENTS.KEYUP, this.handleKeyUp.bind(this), { capture: true })
        window.addEventListener(EVENTS.CLICK, this.handleClick.bind(this))
        browser.runtime.onMessage.addListener(this.handleMessage.bind(this))
    }

    setShadowToCommandMode() {
        this.setMode(MODES.SHADOW_TO_COMMAND)
        this.timer = setTimeout(() => this.setShadowMode(), DOUBLE_KEY_TIMEOUT)
    }

    setCommandToShadowMode() {
        this.setMode(MODES.COMMAND_TO_SHADOW)
        this.timer = setTimeout(() => this.setCommandMode(), DOUBLE_KEY_TIMEOUT)
    }

    setSelectToShadowMode() {
        this.setMode(MODES.SELECT_TO_SHADOW)
        this.timer = setTimeout(() => this.setControlSelectMode(), DOUBLE_KEY_TIMEOUT)
    }

    setCommandMode() {
        clearTimeout(this.timer)
        this.setMode(MODES.COMMAND)
        Commands.proxyToParent(Commands.unmark, 'unmark')
    }

    setShadowMode() {
        clearTimeout(this.timer)
        this.setMode(MODES.SHADOW)
    }

    setControlId(id) {
        this.controlId = id || ''
    }

    setControlSelectMode() {
        Commands.proxyToParent(() => this.setControlId(), 'setControlId', )
        Commands.proxyToParent(() => Commands.markControls(this.controlId), 'markControls', [this.controlId])
        this.setMode(MODES.CONTROL_SELECT)
    }

    changeControlId(key) {
        const map = {
            [PRIMARY_KEYS.J]: 'j',
            [PRIMARY_KEYS.K]: 'k',
            [PRIMARY_KEYS.L]: 'l',
        }

        if (key === PRIMARY_KEYS.Backspace) {
            const id = this.controlId
            this.controlId = id.slice(0, id.length - 1)
        } else {
            this.controlId += map[key]
        }

        Commands.markControls(this.controlId)
    }

    handleControlSelect(e) {
        Commands.proxyToParent(() => this.changeControlId(e.code), 'changeControlId', [e.code])
    }

    selectModeToCommandMode() {
        this.setCommandMode()
        Commands.proxyToParent(Commands.unmark, 'unmark')
    }

    controlClick() {
        Commands.proxyToParent(() => {
            const el = document.querySelector(`[data-keyfull-target-id="${this.controlId}"]`)
            Commands.controlClick(this.controlId)
            this.setCommandMode()
            this.setControlId()

            if (isControlEditable(el)) {
                this.setShadowMode()
            }
        }, 'controlClick')
    }

    openInNewTab() {
        Commands.proxyToParent(() => {
            Commands.openInNewTab(this.controlId)
            this.setCommandMode()
            this.setControlId()
        }, 'openInNewTab')
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
        Commands.proxyToParent(() => Panel.setMode(mode), 'setMode', [mode])
    }

    handleMessage(m) {
        const [_, mode] = JSON.parse(m)
        this.setMode(mode)
    }

    handleKeyDown(e) {
        const keyString = this.eventToKeyString(e)
        let queue = this.transitions[this.mode]?.[keyString] || []

        if (this.mode === MODES.COMMAND_TO_SHADOW && !queue.length) {
            queue = this.transitions[MODES.COMMAND]?.[keyString] || []
        } else if (this.mode === MODES.SHADOW_TO_COMMAND && !queue.length) {
            this.setMode(MODES.SHADOW)
        }

        queue.forEach(q => q.call(this, e))
        this.preventEvent(e)
    }

    handleKeyPress(e) {
        this.preventEvent(e)
    }

    handleKeyUp(e) {
        this.preventEvent(e)
        this.disablePreventEvent()
    }

    handleClick(e) {
        if (isControlEditable(e.target)) {
            this.setMode(MODES.SHADOW)
        }
    }
}

browser.runtime.sendMessage(JSON.stringify([ACTIONS.GET_MODE])).then(res => {
    const panel = new Panel()
    const control = new DocumentControl(panel)

    window.onmessage = (m) => {
        if (m.data?.type !== 'keyfull') {
            return
        }

        const {action, args} = m.data

        if (['setMode', 'changeControlId', 'setControlId', 'controlClick', 'openInNewTab'].includes(action)) {
            control[action](...(args || []))
        } else {
            Commands[action](...(args || []))
        }
    }

    control.setMode(res)
})
