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

    // static indexToString(i) {
    //     const symbols = ['a', 's', 'd']
    //     const res = []
    //
    //      do {
    //         const ost = i % symbols.length
    //
    //         i = Math.floor(i / 3)
    //         res.push(symbols[ost])
    //     } while (i)
    //
    //     return res.join('')
    // }

    // static unmarkControl() {
    //     const controls = document.querySelectorAll('[data-mark]')
    //
    //     for (const c of controls) {
    //         c.removeAttribute('data-mark')
    //     }
    // }

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
            const label = Commands.createLabel(gen.next().value.join(''), id)

            try {
                if (label) {
                    c.firstChild.before(label)
                }
            } catch (e) {}
        }
        // const controls = Commands.getFilteredControls()

        // Commands.unmarkControl()

        // for (let i = 0; i < controls.length; i++) {
        //     const control = controls[i]
        //
        //     // if (control.getAttribute('data-mark')) {
        //     //     control.removeAttribute('data-mark')
        //     // } else {
        //         control.setAttribute('data-mark', Commands.indexToString(i))
        //     // }
        //
        //     // control.setAttribute('data-mark', Commands.indexToString(i))
        // }
    }

    static controlClick(id) {
        document.querySelector(`[data-keyfull-control-id="${id}"]`)?.click()
    }

    static showLinksBlocks() {
        // const controls = Commands.getFilteredControls()
        //
        // const setOfElements = new Set(controls)
        // const branches = Commands.getBranches(controls)
        // const tree = Commands.getTree(branches)
        //
        //
        // while (Commands.removeSingle(tree)) {}
        // Commands.unMix(tree, setOfElements)
        // // while (Commands.unMix(tree, setOfElements) || Commands.removeSingle(tree)) {}
        //
        // console.log(controls)

        // const bunches = Commands.getBunches(tree, setOfElements)
        // const selectedBunchIndex = bunches.findIndex(b => b.key.getAttribute('data-current-bunch'));

        // if (selectedBunchIndex !== -1) {
        //     bunches[selectedBunchIndex].key.removeAttribute('data-current-bunch')
        // }

        // ;(bunches[selectedBunchIndex + 1] || bunches[0])?.key.setAttribute('data-current-bunch', 'true')

        // console.log((bunches[selectedBunchIndex + 1] || bunches[0]))

        // return Commands.getBunches(tree, setOfElements)
    }

    // static getBunches(tree, controls) {
    //     const res = []
    //     const queue = [tree]
    //
    //     while (queue.length) {
    //         const node = queue.pop()
    //
    //         if (node.children.find(ch => controls.has(ch.key))) {
    //             res.push(node)
    //         }
    //
    //         for (let i = node.children.length - 1; i >= 0; i--) {
    //             queue.push(node.children[i])
    //         }
    //     }
    //
    //     return res
    // }

    // static getTree(branches) {
    //     const root = { key: null, children: [] }
    //     const queue = [root]
    //
    //     while (queue.length) {
    //         const node = queue.pop()
    //         const children = branches.get(node.key)
    //
    //         if (children) {
    //             for (const ch of children) {
    //                 const tmp = { key: ch, children: [] }
    //
    //                 queue.push(tmp)
    //                 node.children.push(tmp)
    //             }
    //         }
    //     }
    //
    //     return root
    // }

    // static getBranches(elements) {
    //     const branches = new Map()
    //
    //     for (let el of elements) {
    //         while (el) {
    //             const parent = el.parentElement
    //
    //             if (!branches.get(parent)) {
    //                 branches.set(parent, new Set())
    //             }
    //
    //             branches.get(parent).add(el)
    //             el = parent
    //         }
    //     }
    //
    //     return branches
    // }

    // static removeSingle(tree) {
    //     const queue = [tree]
    //     let res = false
    //     while (queue.length) {
    //         const node = queue.pop()
    //         const index = node.children.findIndex(n => n.children.length === 1)
    //
    //         if (index !== -1) {
    //             node.children[index] = node.children[index].children[0]
    //             res = true
    //         }
    //
    //         queue.push(...node.children)
    //     }
    //
    //     return res
    // }

    // static unMix(tree, controls) {
    //     const queue = [tree]
    //     let res = false
    //
    //     while(queue.length) {
    //         const node = queue.pop()
    //         const filteredChildren = node.children.filter(c => !controls.has(c.key))
    //         const isMixed = filteredChildren.length > 0 && filteredChildren.length !== node.children.length
    //
    //         if (isMixed) {
    //             const index = node.children.findIndex(c => filteredChildren.find(f => f.key === c.key))
    //             const subs = node.children[index].children
    //
    //             node.children.splice(index, 1, ...subs)
    //             res = true
    //         }
    //
    //         queue.push(...node.children)
    //     }
    //
    //     return res
    // }

    // static nextBunch() {
    //     const KEY = 'data-current-bunch'
    //     const allBunches = Commands.showLinksBlocks()
    //
    //     const nextIndex = allBunches.findIndex(b => b.key.getAttribute(KEY) === 'true') + 1
    //
    //     const nextBunch = allBunches.slice(nextIndex)
    //         .find(b => b.children.find(({ key }) => {
    //             const visible = key.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })
    //             const { top, bottom} = key.getBoundingClientRect()
    //
    //             return top >= 0 && bottom <= window.innerHeight && visible
    //         }))
    //
    //     document.querySelectorAll(`[${KEY}="true"]`).forEach(t => t.removeAttribute(KEY))
    //
    //     console.log(nextBunch)
    //
    //     nextBunch?.key.setAttribute(KEY, 'true')
    //     // console.log(tmp)
    //
    //     // const nextIndex = bunches
    //     //     .filter(({ key }) => {
    //     //         const { top, bottom} = key.getBoundingClientRect()
    //     //
    //     //         return key.checkVisibility({
    //     //             checkOpacity: true,
    //     //             checkVisibilityCSS: true,
    //     //         })
    //     //         // return top >= 0 && bottom <= window.innerHeight // && key.checkVisibility()
    //     //     })
    //     //     .findIndex(b => b.key.getAttribute(KEY) === 'true') + 1
    //
    //
    //     // document.querySelectorAll(`[${KEY}="true"]`).forEach(t => t.removeAttribute(KEY))
    //
    //     // ;(bunches[nextIndex] || bunches[0])?.key.setAttribute(KEY, 'true')
    //     // console.log(nextIndex)
    //
    //     // next?.key.setAttribute(KEY, 'true')
    //     // console.log(tmp[nextIndex].key)
    // }
}
