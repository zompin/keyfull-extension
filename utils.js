function isControlEditable(el) {
    if (!el) {
        return false
    }

    const { tagName, type } = el

    return tagName === 'TEXTAREA' || (
        ['text', 'search', 'date', 'datetime-local', 'email', 'month', 'number', 'password', 'tel', 'time', 'url', 'week'].includes(type) && tagName === 'INPUT'
    )
}