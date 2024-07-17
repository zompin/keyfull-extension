const PANEL_ID = 'keyfull-panel'

class Panel {
    static createElement(config) {
        const el = document.createElement('div')

        Object.entries(config).forEach(([k, v]) => {
            el.setAttribute(k, v)
        })

        return el
    }

    static renderTemplate() {
        let el = document.getElementById(PANEL_ID)

        if (window.top !== window || el) {
            return
        }

        const mode = Panel.createElement({ id: 'keyfull-panel_mode' })
        const command = Panel.createElement({ id: 'keyfull-panel_action' })

        el = Panel.createElement({ id: PANEL_ID })

        mode.innerHTML = '<span>Z</span><span></span><span>+</span>'

        el.append(mode)
        el.append(command)

        document.body.append(el)
    }

    static setMode(mode) {
        const interval = setInterval(() => {
            if (!document.body) {
                return
            }

            clearInterval(interval)
            Panel.renderTemplate()
            const el = document.getElementById('keyfull-panel_mode')

            el?.setAttribute('data-mode', mode)
        }, 50)
    }

    static setCommand(command) {
        Panel.renderTemplate()
        const el = document.querySelector(PANEL_ID)

        if (!el) {
            return
        }

        el.innerHTML = command
    }
}