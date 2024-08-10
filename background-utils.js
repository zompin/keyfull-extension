export function parseParams(message) {
    let res = {}

    try {
        res = JSON.parse(message)
    } catch (e) {}

    return res
}
