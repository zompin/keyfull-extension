function isControlEditable(el) {
    if (!el) {
        return false
    }

    const { tagName, type } = el

    if (tagName === 'TEXTAREA' || (
        ['text', 'search', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'tel', 'time', 'url', 'week'].includes(type) && tagName === 'INPUT'
    )) {
        return true
    }

    while (el) {
        if (el.getAttribute('contenteditable')) {
            return true
        }

        el = el.parentElement
    }

    return false
}

function parseParams(message) {
    let res = {}

    try {
        res = JSON.parse(message)
    } catch (e) {}

    return res
}