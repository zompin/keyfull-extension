class Panel {
    static createElement(config) {
        const el = document.createElement('div')

        Object.entries(config).forEach(([k, v]) => {
            el.setAttribute(k, v)
        })

        return el
    }

    static renderTemplate() {
        let el = document.querySelector('#keyfull-panel')

        if (window.top !== window || el) {
            return
        }

        const mode = Panel.createElement({ id: 'keyfull-panel_mode' })
        const command = Panel.createElement({ id: 'keyfull-panel_action' })

        el = Panel.createElement({ id: 'keyfull-panel' })
        el.append(mode)
        el.append(command)

        document.body.append(el)
    }

    static setMode(mode) {
        if (![MODES.COMMAND, MODES.SHADOW].includes(mode)) {
            return
        }

        const interval = setInterval(() => {
            if (!document.body) {
                return
            }

            clearInterval(interval)
            Panel.renderTemplate()
            const el = document.querySelector('#keyfull-panel_mode')

            el.setAttribute('data-mode', mode)
            // el.innerHTML = mode
        }, 50)
    }

    static setCommand(command) {
        Panel.renderTemplate()
        const el = document.querySelector('#keyfull-panel_action')

        if (!el) {
            return
        }

        el.innerHTML = command
    }
}