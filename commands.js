class Commands {
    static async message(m) {
        return browser.runtime.sendMessage(JSON.stringify(m))
    }

    static async messageToParent(command) {
        await Commands.message({
            action: ACTIONS.PROXY_TO_PARENT,
            params: { command }
        })
    }

    static scroll(direction) {
        let top = Math.max(document.body.scrollTop, document.documentElement.scrollTop)

        switch (direction) {
            case SCROLL_DIRECTIONS.TOP:
                top -= window.innerHeight * 0.3
                break
            case SCROLL_DIRECTIONS.BOTTOM:
                top += window.innerHeight * 0.3
                break
        }

        const options = {
            top,
            left: 0,
            behavior: 'smooth'
        }

        document.body.scroll(options)
        document.documentElement.scroll(options)
    }

    static scrollTop() {
        Commands.scroll(SCROLL_DIRECTIONS.TOP)
    }

    static scrollBottom() {
        Commands.scroll(SCROLL_DIRECTIONS.BOTTOM)
    }

    static scrollToTop() {
        const options = {
            top: 0,
            left: 0,
            behavior: 'smooth'
        }

        document.body.scroll(options)
        document.documentElement.scroll(options)
    }

    static scrollToBottom() {
        const top = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
        const options = {
            top,
            left: 0,
            behavior: 'smooth'
        }

        document.body.scroll(options)
        document.documentElement.scroll(options)
    }

    static nextTab() {
        Commands.message({ action: ACTIONS.TAB_NEXT })
    }

    static prevTab() {
        Commands.message({ action: ACTIONS.TAB_PREV })
    }

    static moveCurrentTabToLeft() {
        Commands.message({ action: ACTIONS.TAB_MOVE_TO_LEFT })
    }

    static moveCurrentTabToRight() {
        Commands.message({ action: ACTIONS.TAB_MOVE_TO_RIGHT })
    }

    static duplicateTab() {
        Commands.message({ action: ACTIONS.TAB_DUPLICATE })
    }

    static closeCurrentTab() {
        Commands.message({ action: ACTIONS.TAB_CLOSE })
    }

    static updateCurrentTab() {
        Commands.message({ action: ACTIONS.TAB_RELOAD })
    }

    static newTab() {
        Commands.message({ action: ACTIONS.TAB_NEW })
    }

    static filterControls (elements) {
        const cache = {}
        const canBeInvisible = (e) => !['input', 'select'].includes(e.tagName.toLowerCase())

        return elements.filter((e) => {
            const { top, bottom} = e.getBoundingClientRect()

            if (!(top >= 0 && bottom <= window.innerHeight && e.checkVisibility({
                opacityProperty: canBeInvisible(e),
                visibilityProperty: canBeInvisible(e),
            }))) {
                return false
            }

            if (e.href) {
                if (cache[e.href]) {
                    return false
                } else {
                    cache[e.href] = true
                }
            }

            return true
        })
    }

    static getVisibleControls() {
        const links = [...document.querySelectorAll('a')]
        const fields = [...document.querySelectorAll('input, textarea, select, [contenteditable]')]
        const other = [...document.querySelectorAll('button, summary, [role], [aria-label]')]

        return {
            links: Commands.filterControls(links),
            fields: Commands.filterControls(fields),
            other: Commands.filterControls(other),
        }
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

    static getCanvas() {
        const el = document.createElement('div')
        Commands.unmark()
        el.id = 'keyfull-canvas'
        el.style.pointerEvents = 'none'
        el.style.position = 'fixed'
        el.style.top = '0'
        el.style.right = '0'
        el.style.bottom = '0'
        el.style.left = '0'
        el.style.fontFamily = 'monospace'
        el.style.zIndex = 'calc(infinity)'
        el.style.color = '#fff'
        el.style.lineHeight = '16px'
        el.style.fontSize = '12px'
        el.style.fontWeight = 'normal'
        document.body.append(el)
        el.attachShadow({mode: 'open'})

        return el.shadowRoot
    }

    static markControlGroup(controls, prefix, id, canvas) {
        const gen = Commands.generateLabelGenerator(controls.length)

        for (const c of controls) {
            const linkId = prefix + gen.next().value.join('')
            const label = Commands.createLabel(linkId, id, c)

            if (linkId === id) {
                c.setAttribute('data-keyfull-target-id', id)
            }

            if (label) {
                canvas.append(label)
            }
        }
    }

    static markControls(id = '') {
        const { links, fields, other } = Commands.getVisibleControls()
        const canvas = Commands.getCanvas()

        Commands.markControlGroup(links, 'l', id, canvas)
        Commands.markControlGroup(fields, 'k', id, canvas)
        Commands.markControlGroup(other, 'j', id, canvas)
    }

    static unmark() {
        document.querySelector('#keyfull-canvas')?.remove()
    }

    static createLabel(value, targetId, control) {
        const el = document.createElement('span')
        const { top, left } = control.getBoundingClientRect()

        el.setAttribute('data-keyfull-control-id', value)
        el.style.position = 'absolute'
        el.style.background = '#000'
        el.style.padding = '0 5px'
        el.style.top = `${top}px`
        el.style.left = `${left}px`
        el.style.borderRadius = '5px'
        el.style.letterSpacing = '1px'
        el.style.paddingBottom = '1px'

        if (!targetId) {
            el.textContent = value.slice(0, 1)
        } else if (value.indexOf(targetId) === 0) {
            el.innerHTML = `<span style="background:#fff; color:#000">${targetId}</span><span>${value.slice(targetId.length)}</span>`
        } else {
            return null
        }

        return el
    }

    static getTargetControl(id) {
        const el = document.querySelector(`[data-keyfull-target-id="${id}"]`)

        el?.removeAttribute('data-keyfull-target-id')

        return el
    }

    static controlClick(id) {
        const el = Commands.getTargetControl(id)

        if (!el) {
            return
        }

        if (isControlEditable(el)) {
            el.focus()
        }

        el.click()
    }

    static openInNewTab(id) {
        const url = Commands.getTargetControl(id)?.href

        if (url) {
            Commands.message({
                action: ACTIONS.TAB_NEW_BACKGROUND,
                params: {
                    url
                }
            })
        }
    }
}
