class DocumentControl {
    constructor() {
        const createKey = this.createKey.bind(this)
        const ep = this.enablePreventEvent.bind(this)

        this.mode = MODES.SHADOW
        this.preventEnabled = false
        this.controlId = ''
        this.transitions = {
            [MODES.SHADOW]: {
                [createKey(PRIMARY_KEYS.Semicolon, { isMeta: true })]: [this.setCommandMode],
            },
            [MODES.COMMAND]: {
                [createKey(PRIMARY_KEYS.Semicolon, { isMeta: true })]: [this.setShadowMode],
                [createKey(PRIMARY_KEYS.Semicolon)]: [ep, this.setControlSelectMode],
                [createKey(PRIMARY_KEYS.K)]: [ep, () => Commands.messageToParent(COMMANDS.SCROLL_TOP)],
                [createKey(PRIMARY_KEYS.J)]: [ep, () => Commands.messageToParent(COMMANDS.SCROLL_BOTTOM)],
                [createKey(PRIMARY_KEYS.K, { isShift: true })]: [ep, () => Commands.messageToParent(COMMANDS.SCROLL_TO_TOP)],
                [createKey(PRIMARY_KEYS.J, { isShift: true })]: [ep, () => Commands.messageToParent(COMMANDS.SCROLL_TO_BOTTOM)],
                [createKey(PRIMARY_KEYS.MORE)]: [ep, Commands.nextTab],
                [createKey(PRIMARY_KEYS.LESS)]: [ep, Commands.prevTab],
                [createKey(PRIMARY_KEYS.MORE, { isShift: true })]: [ep, Commands.moveCurrentTabToRight],
                [createKey(PRIMARY_KEYS.LESS, { isShift: true })]: [ep, Commands.moveCurrentTabToLeft],
                [createKey(PRIMARY_KEYS.D)]: [ep, Commands.duplicateTab],
                [createKey(PRIMARY_KEYS.X)]: [ep, Commands.closeCurrentTab],
                [createKey(PRIMARY_KEYS.Quote)]: [ep, Commands.closeCurrentTab],
                [createKey(PRIMARY_KEYS.R)]: [ep, Commands.updateCurrentTab],
                [createKey(PRIMARY_KEYS.T)]: [ep, Commands.newTab],
                [createKey(PRIMARY_KEYS.Backspace)]: [ep, this.setShadowMode],
                [createKey(PRIMARY_KEYS.Space)]: [],
            },
            [MODES.CONTROL_SELECT]: {
                [createKey(PRIMARY_KEYS.Semicolon, { isMeta: true })]: [this.setShadowMode],
                [createKey(PRIMARY_KEYS.Semicolon)]: [ep, this.setCommandMode],
                [createKey(PRIMARY_KEYS.J)]: [ep, this.handleControlSelect],
                [createKey(PRIMARY_KEYS.K)]: [ep, this.handleControlSelect],
                [createKey(PRIMARY_KEYS.L)]: [ep, this.handleControlSelect],
                [createKey(PRIMARY_KEYS.Backspace)]: [ep, this.handleControlSelect],
                [createKey(PRIMARY_KEYS.I)]: [ep, () => Commands.messageToParent(COMMANDS.CONTROL_INTERACT)],
                [createKey(PRIMARY_KEYS.O)]: [ep, () => Commands.messageToParent(COMMANDS.OPEN_IN_NEW_TAB)],
            },
        }

        this.blockKeys(MODES.COMMAND)
        this.blockKeys(MODES.CONTROL_SELECT)
        this.subscribe()

        browser.runtime.sendMessage(JSON.stringify({ action: ACTIONS.GET_MODE }))
    }

    setCommandMode() {
        this.setGlobalMode(MODES.COMMAND)
    }

    setShadowMode() {
        this.setGlobalMode(MODES.SHADOW)
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

    controlClick() {
        const el = document.querySelector(`[data-keyfull-target-id="${this.controlId}"]`)
        Commands.controlClick(this.controlId)

        if (isControlEditable(el)) {
            this.setShadowMode()
        } else {
            setTimeout(() => {
                if (isControlEditable(document.activeElement)) {
                    this.setShadowMode()
                } else {
                    this.setCommandMode()
                }
            }, 300)
        }
    }

    cleanControls() {
        Commands.unmark()
        this.controlId = ''
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
            this.setShadowMode()
        } else {
            setTimeout(() => {
                if (isControlEditable(document.activeElement)) {
                    this.setShadowMode()
                } else {
                    this.setCommandMode()
                }
            }, 300)
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
