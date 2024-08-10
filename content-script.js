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
                [createKey(PRIMARY_KEYS.K)]: [ep, this.scrollTop],
                [createKey(PRIMARY_KEYS.J)]: [ep, this.scrollBottom],
                [createKey(PRIMARY_KEYS.K, { isShift: true })]: [ep, this.scrollToTop],
                [createKey(PRIMARY_KEYS.J, { isShift: true })]: [ep, this.scrollToBottom],
                [createKey(PRIMARY_KEYS.MORE)]: [ep, Commands.nextTab],
                [createKey(PRIMARY_KEYS.LESS)]: [ep, Commands.prevTab],
                [createKey(PRIMARY_KEYS.MORE, { isShift: true })]: [ep, Commands.moveCurrentTabToRight],
                [createKey(PRIMARY_KEYS.LESS, { isShift: true })]: [ep, Commands.moveCurrentTabToLeft],
                [createKey(PRIMARY_KEYS.D)]: [ep, Commands.duplicateTab],
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
                [createKey(PRIMARY_KEYS.I)]: [ep, this.handleControlClick],
                [createKey(PRIMARY_KEYS.O)]: [ep, this.handleOpenInNewTab],
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
        this.subscribe()

        browser.runtime.sendMessage(JSON.stringify({ action: ACTIONS.GET_MODE }))
    }

    scrollTop() {
        Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: {
                command: COMMANDS.SCROLL_TOP
            }
        })
    }

    scrollBottom() {
        Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: {
                command: COMMANDS.SCROLL_BOTTOM
            }
        })
    }

    scrollToTop() {
        Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: {
                command: COMMANDS.SCROLL_TO_TOP
            }
        })
    }

    scrollToBottom() {
        Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: {
                command: COMMANDS.SCROLL_TO_BOTTOM
            }
        })
    }

    setCommandMode() {
        clearTimeout(this.timer)
        this.setGlobalMode(MODES.COMMAND)
    }

    setShadowToCommandMode() {
        this.setGlobalMode(MODES.SHADOW_TO_COMMAND)
        this.timer = setTimeout(() => this.setShadowMode(), DOUBLE_KEY_TIMEOUT)
    }

    setCommandToShadowMode() {
        this.setGlobalMode(MODES.COMMAND_TO_SHADOW)
        this.timer = setTimeout(() => this.setCommandMode(), DOUBLE_KEY_TIMEOUT)
    }

    setSelectToShadowMode() {
        this.setGlobalMode(MODES.SELECT_TO_SHADOW)
        this.timer = setTimeout(() => this.setControlSelectMode(), DOUBLE_KEY_TIMEOUT)
    }

    setShadowMode() {
        clearTimeout(this.timer)
        this.setGlobalMode(MODES.SHADOW)
    }

    selectModeToCommandMode() {
        this.setCommandMode()
    }

    setControlSelectMode() {
        this.setGlobalMode(MODES.CONTROL_SELECT)

        Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: {
                command: COMMANDS.MARK_CONTROLS
            }
        })
    }

    setGlobalMode(mode) {
        Commands.message({
            action: ACTIONS.SET_MODE,
            params: { mode }
        })
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
        Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: {
                command: COMMANDS.CHANGE_CONTROL_ID,
                code: e.code,
            }
        })
    }

    handleControlClick() {
        Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: {
                command: COMMANDS.CONTROL_INTERACT,
            }
        })
    }

    controlClick() {
        const el = document.querySelector(`[data-keyfull-target-id="${this.controlId}"]`)
        Commands.controlClick(this.controlId)
        this.setCommandMode()

        if (isControlEditable(el)) {
            this.setShadowMode()
        }
    }

    cleanControls() {
        Commands.unmark()
        this.controlId = ''
    }

    handleOpenInNewTab() {
        Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: {
                command: COMMANDS.OPEN_IN_NEW_TAB,
            }
        })
    }

    openInNewTab() {
        Commands.openInNewTab(this.controlId)
        this.setCommandMode()
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

    handleKeyDown(e) {
        const keyString = this.eventToKeyString(e)
        let queue = this.transitions[this.mode]?.[keyString] || []

        if (this.mode === MODES.COMMAND_TO_SHADOW && !queue.length) {
            queue = this.transitions[MODES.COMMAND]?.[keyString] || []
        } else if (this.mode === MODES.SHADOW_TO_COMMAND && !queue.length) {
            this.setGlobalMode(MODES.SHADOW)
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
            this.setGlobalMode(MODES.SHADOW)
        }
    }

    executeCommand(params) {
        switch (params.command) {
            case COMMANDS.SCROLL_TOP:
                Commands.scrollTop()
                break
            case COMMANDS.SCROLL_BOTTOM:
                Commands.scrollBottom()
                break
            case COMMANDS.SCROLL_TO_TOP:
                Commands.scrollToTop()
                break
            case COMMANDS.SCROLL_TO_BOTTOM:
                Commands.scrollToBottom()
                break
            case COMMANDS.MARK_CONTROLS:
                Commands.markControls(this.controlId)
                break
            case COMMANDS.CHANGE_CONTROL_ID:
                this.changeControlId(params.code)
                break
            case COMMANDS.CONTROL_INTERACT:
                this.controlClick()
                break
            case COMMANDS.OPEN_IN_NEW_TAB:
                this.openInNewTab()
                break
            case COMMANDS.CLEAN_CONTROLS:
                this.cleanControls()
                break;
        }
    }

    handleMessage(message) {
        const { action, params } = parseParams(message)

        switch (action) {
            case ACTIONS.SET_MODE:
                if (MODES[params?.mode]) {
                    this.mode = params.mode
                }

                if (params.mode !== MODES.CONTROL_SELECT) {
                    this.executeCommand({
                        command: COMMANDS.CLEAN_CONTROLS,
                    })
                }

                break
            case ACTIONS.PROXY_TO_PARENT:
                this.executeCommand(params)
                break
        }
    }

    subscribe() {
        window.addEventListener(EVENTS.KEYPRESS, this.handleKeyPress.bind(this), { capture: true })
        window.addEventListener(EVENTS.KEYDOWN, this.handleKeyDown.bind(this), { capture: true })
        window.addEventListener(EVENTS.KEYUP, this.handleKeyUp.bind(this), { capture: true })
        window.addEventListener(EVENTS.CLICK, this.handleClick.bind(this))
        window.addEventListener(EVENTS.MESSAGE, this.handleMessage.bind(this))
        browser.runtime.onMessage.addListener(this.handleMessage.bind(this))
    }
}

new DocumentControl(new Panel())
