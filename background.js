import { Tabs } from "./tabs.js";
import { ACTIONS, MODES } from './background-constants.js'
import { parseParams } from './background-utils.js'
let mode = MODES.SHADOW

async function handleMessage(message, { tab }) {
    const { action, params } = parseParams(message)

    switch (action) {
        case ACTIONS.TAB_PREV:
            await Tabs.prevTab()
            break
        case ACTIONS.TAB_NEXT:
            await Tabs.nextTab()
            break
        case ACTIONS.TAB_NEW_BACKGROUND:
            if (params?.url) {
                await Tabs.newBackgroundTab(params.url)
            }

            break
        case ACTIONS.TAB_MOVE_TO_LEFT:
            await Tabs.moveCurrentTabToLeft()
            break
        case ACTIONS.TAB_MOVE_TO_RIGHT:
            await Tabs.moveCurrentTabToRight()
            break
        case ACTIONS.TAB_DUPLICATE:
            if (params?.url) {
                await Tabs.duplicateTab(params.url)
            }

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
            if (MODES[params?.mode]) {
                mode = params.mode

                await browser.tabs.sendMessage(tab.id, JSON.stringify({
                    action: ACTIONS.SET_MODE,
                    params: { mode }
                }))
            }

            break
        case ACTIONS.GET_MODE:
            await browser.tabs.sendMessage(tab.id, JSON.stringify({
                action: ACTIONS.SET_MODE,
                params: { mode }
            }))

            break
        case ACTIONS.PROXY_TO_PARENT:
            await browser.tabs.sendMessage(tab.id, JSON.stringify({
                action: ACTIONS.PROXY_TO_PARENT,
                params
            }))

            break
    }
}

function handleActivate({ tabId }) {
    browser.tabs.sendMessage(tabId, JSON.stringify({
        action: ACTIONS.SET_MODE,
        params: { mode }
    }))
}

browser.tabs.onActivated.addListener(handleActivate)
browser.runtime.onMessage.addListener(handleMessage)
