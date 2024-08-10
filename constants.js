const MODES = {
    SHADOW: 'SHADOW',
    COMMAND: 'COMMAND',
    CONTROL_SELECT: 'CONTROL_SELECT',
}

const ACTIONS = {
    TAB_PREV: 'TAB_PREV',
    TAB_NEXT: 'TAB_NEXT',
    TAB_NEW_BACKGROUND: 'TAB_NEW_BACKGROUND',
    TAB_MOVE_TO_LEFT: 'TAB_MOVE_TO_LEFT',
    TAB_MOVE_TO_RIGHT: 'TAB_MOVE_TO_RIGHT',
    TAB_DUPLICATE: 'TAB_DUPLICATE',
    TAB_DUPLICATE_AND_ACTIVATE: 'TAB_DUPLICATE_AND_ACTIVATE',
    TAB_CLOSE: 'TAB_CLOSE',
    TAB_RELOAD: 'TAB_RELOAD',
    TAB_NEW: 'TAB_NEW',
    SET_MODE: 'SET_MODE',
    GET_MODE: 'GET_MODE',
    PROXY_TO_PARENT: 'PROXY_TO_PARENT',
}

const SCROLL_DIRECTIONS = {
    TOP: 'top',
    BOTTOM: 'bottom',
}

const EVENTS = {
    KEYDOWN: 'keydown',
    KEYUP: 'keyup',
    KEYPRESS: 'keypress',
    CLICK: 'click',
    MESSAGE: 'message',
}

const PRIMARY_KEYS = {
    Digit0: 'Digit0',
    Digit1: 'Digit1',
    Digit2: 'Digit2',
    Digit3: 'Digit3',
    Digit4: 'Digit4',
    Digit5: 'Digit5',
    Digit6: 'Digit6',
    Digit7: 'Digit7',
    Digit8: 'Digit8',
    Digit9: 'Digit9',
    A: 'KeyA',
    B: 'KeyB',
    C: 'KeyC',
    D: 'KeyD',
    E: 'KeyE',
    F: 'KeyF',
    G: 'KeyG',
    H: 'KeyH',
    I: 'KeyI',
    J: 'KeyJ',
    K: 'KeyK',
    L: 'KeyL',
    M: 'KeyM',
    N: 'KeyN',
    O: 'KeyO',
    P: 'KeyP',
    Q: 'KeyQ',
    R: 'KeyR',
    S: 'KeyS',
    T: 'KeyT',
    U: 'KeyU',
    V: 'KeyV',
    W: 'KeyW',
    X: 'KeyX',
    Y: 'KeyY',
    Z: 'KeyZ',
    BracketLeft: 'BracketLeft',
    BracketRight: 'BracketRight',
    Semicolon: 'Semicolon',
    Quote: 'Quote',
    Backquote: 'Backquote',
    Backslash: 'Backslash',
    Slash: 'Slash',
    Numpad0: 'Numpad0',
    Numpad1: 'Numpad1',
    Numpad2: 'Numpad2',
    Numpad3: 'Numpad3',
    Numpad4: 'Numpad4',
    Numpad5: 'Numpad5',
    Numpad6: 'Numpad6',
    Numpad7: 'Numpad7',
    Numpad8: 'Numpad8',
    Numpad9: 'Numpad9',
    NumpadAdd: 'NumpadAdd',
    NumpadSubtract: 'NumpadSubtract',
    NumpadMultiply: 'NumpadMultiply',
    NumpadDivide: 'NumpadDivide',
    NumpadDecimal: 'NumpadDecimal',
    NumpadComma: 'NumpadComma',
    NumpadEqual: 'NumpadEqual',
    Space: 'Space',
    Minus: 'Minus',
    Equal: 'Equal',
    LESS: 'Comma',
    MORE: 'Period',
    ESC: 'Escape',
    Backspace: 'Backspace',
}

const MODIFICATIONS_KEYS = {
    ShiftLeft: 'ShiftLeft',
    ShiftRight: 'ShiftRight',
    MetaLeft: 'MetaLeft',
    MetaRight: 'MetaRight',
}

const COMMANDS = {
    SCROLL_TO_TOP: 'SCROLL_TO_TOP',
    SCROLL_TO_BOTTOM: 'SCROLL_TO_BOTTOM',
    SCROLL_TOP: 'SCROLL_TOP',
    SCROLL_BOTTOM: 'SCROLL_BOTTOM',
    MARK_CONTROLS: 'MARK_CONTROLS',
    CHANGE_CONTROL_ID: 'CHANGE_CONTROL_ID',
    CONTROL_INTERACT: 'CONTROL_INTERACT',
    OPEN_IN_NEW_TAB: 'OPEN_IN_NEW_TAB',
}