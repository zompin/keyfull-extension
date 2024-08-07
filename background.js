import { Tabs } from "./tabs.js";
import { ACTIONS, MODES } from './background-constants.js'

let mode = MODES.SHADOW

function handleActivate({ tabId }) {
    browser.tabs.sendMessage(tabId, JSON.stringify([ACTIONS.SET_MODE, mode]))
}

async function handleMessage(params, { tab }) {
    const [key, arg1] = JSON.parse(params)
    switch (key) {
        case ACTIONS.TAB_PREV:
            await Tabs.prevTab()
            break
        case ACTIONS.TAB_NEXT:
            await Tabs.nextTab()
            break
        case ACTIONS.TAB_NEW_BACKGROUND:
            await Tabs.newBackgroundTab(arg1)
            break
        case ACTIONS.TAB_MOVE_TO_LEFT:
            await Tabs.moveCurrentTabToLeft()
            break
        case ACTIONS.TAB_MOVE_TO_RIGHT:
            await Tabs.moveCurrentTabToRight()
            break
        case ACTIONS.TAB_DUPLICATE:
            await Tabs.duplicateTab(arg1)
            break
        case ACTIONS.TAB_CLOSE:
            await Tabs.closeCurrentTab()
            break
        case ACTIONS.TAB_RELOAD:
            await Tabs.reloadCurrentTab()
            break
        case ACTIONS.TAB_NEW:
            await Tabs.newTab()
            break
        case ACTIONS.SET_MODE:
            mode = arg1
            break
        case ACTIONS.GET_MODE:
            await browser.tabs.sendMessage(tab.id, JSON.stringify([ACTIONS.SET_MODE, mode]))
            break
    }
}

browser.tabs.onActivated.addListener(handleActivate)
browser.runtime.onMessage.addListener(handleMessage)
