class Commands {
    static async message(m) {
        return browser.runtime.sendMessage(JSON.stringify(m))
    }

    static scroll(direction) {
        let top = document.documentElement.scrollTop

        switch (direction) {
            case SCROLL_DIRECTIONS.TOP:
                top -= window.innerHeight * 0.3
                break
            case SCROLL_DIRECTIONS.BOTTOM:
                top += window.innerHeight * 0.3
                break
        }

        document.documentElement.scroll({
            top,
            left: 0,
            behavior: 'smooth'
        })
    }

    static scrollTop() {
        Commands.scroll(SCROLL_DIRECTIONS.TOP)
    }

    static scrollBottom() {
        Commands.scroll(SCROLL_DIRECTIONS.BOTTOM)
    }

    static scrollToTop() {
        document.documentElement.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
    }

    static scrollToBottom() {
        document.documentElement.scroll({
            top: document.documentElement.scrollHeight,
            left: 0,
            behavior: 'smooth'
        })
    }

    static nextTab() {
        Commands.message([ACTIONS.TAB_NEXT])
    }

    static prevTab() {
        Commands.message([ACTIONS.TAB_PREV])
    }

    static moveCurrentTabToLeft() {
        Commands.message([ACTIONS.TAB_MOVE_TO_LEFT])
    }

    static moveCurrentTabToRight() {
        Commands.message([ACTIONS.TAB_MOVE_TO_RIGHT])
    }

    static duplicateTab() {
        Commands.message([ACTIONS.TAB_DUPLICATE])
    }

    static duplicateAndActiveTab() {
        Commands.message([ACTIONS.TAB_DUPLICATE, true])
    }

    static closeCurrentTab() {
        Commands.message([ACTIONS.TAB_CLOSE])
    }

    static updateCurrentTab() {
        Commands.message([ACTIONS.TAB_RELOAD])
    }

    static newTab() {
        Commands.message([ACTIONS.TAB_NEW])
    }

    static getVisibleControls() {
        return [...document.querySelectorAll('a, button, input, textarea, select, [role="button"]')]
        .filter(e => {
            const { top, bottom} = e.getBoundingClientRect()

            return top > 0 && bottom < window.innerHeight && e.checkVisibility()
        })
    }

    static unmark() {
        const elements = document.querySelectorAll('[data-keyfull-control-id]')

        elements.forEach(e => e.remove())
    }

    static createLabel(value, targetId) {
        const el = document.createElement('span')

        el.setAttribute('data-keyfull-control-id', value)
        el.style.position = 'absolute'
        el.style.background = '#000'
        el.style.color = '#fff'
        el.style.padding = '0 5px'
        el.style.lineHeight = '20px'
        el.style.fontSize = '16px'
        el.style.fontWeight = 'normal'
        el.style.fontFamily = 'monospace'
        el.style.zIndex = 'calc(infinity)'

        if (!targetId) {
            el.textContent = value.slice(0, 1)
        } else if (value.indexOf(targetId) === 0) {
            el.innerHTML = `<span style="background:#fff; color:#000">${targetId}</span><span>${value.slice(targetId.length)}</span>`
        } else {
            return null
        }

        return el
    }

    static *generateLabelGenerator(count) {
        const keys = { 0: 'j', 1: 'k', 2: 'l' }
        const pow = Math.ceil(Math.log(count) / Math.log(3))

        for (let i = 0; i < count; i++) {
            const res = []
            let n = i;

            for (let j = 0; j < pow; j++) {
                res.push(keys[n % 3])
                n = Math.floor(n / 3)
            }

            yield res
        }
    }

    static markControls(id = '') {
        const controls = Commands.getVisibleControls()
        const gen = Commands.generateLabelGenerator(controls.length)

        Commands.unmark()

        for (const c of controls) {
            const linkId = gen.next().value.join('')
            const label = Commands.createLabel(linkId, id)

            if (linkId === id) {
                c.setAttribute('data-keyfull-target-id', id)
            }

            try {
                if (label) {
                    c.firstChild.before(label)
                }
            } catch (e) {}
        }
    }

    static getTargetControl(id) {
        const el = document.querySelector(`[data-keyfull-target-id="${id}"]`)

        el?.removeAttribute('data-keyfull-target-id')

        return el
    }

    static controlClick(id) {
        const el = Commands.getTargetControl(id)
        Commands.unmark()

        if (!el) {
            return
        }

        if (el.href) {
            location.href = el.href
        } else {
            el.click()
        }
    }

    static openInNewTab(id) {
        const link = Commands.getTargetControl(id)?.href
        Commands.unmark()

        if (link) {
            Commands.message([ACTIONS.TAB_NEW_BACKGROUND, link])
        }
    }
}
