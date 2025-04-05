export class Tabs {
    static async getCurrentTab() {
        return browser.tabs.query({ active: true, currentWindow: true })
    }

    static async getActiveTabIndex() {
        const [{ index }] = await Tabs.getCurrentTab()

        return index
    }

    static async setActiveTabByIndex(index) {
        const [{id}] = await browser.tabs.query({index, currentWindow: true})
        await browser.tabs.update(id, {active: true})
    }

    static async nextTab() {
        const index = await Tabs.getActiveTabIndex()
        const [nextTab] = await browser.tabs.query({index: index + 1, currentWindow: true})
        let nextTabIndex = nextTab ? nextTab.index : 0

        await Tabs.setActiveTabByIndex(nextTabIndex)
    }

    static async prevTab() {
        let index = await Tabs.getActiveTabIndex()

        if (!index) {
            const allTabs = await browser.tabs.query({ currentWindow: true })
            index = allTabs.length
        }

        await Tabs.setActiveTabByIndex(index - 1)
    }

    static async newBackgroundTab(url) {
        const [{index}] = await Tabs.getCurrentTab()
        await browser.tabs.create({ url, active: false, index: index + 1 })
    }

    static async moveCurrentTabToLeft() {
        const [{id, index}] = await Tabs.getCurrentTab()

        await browser.tabs.move(id, { index: index === 0 ? 0 : index - 1 })
    }

    static async moveCurrentTabToRight() {
        const [{id, index}] = await Tabs.getCurrentTab()

        await browser.tabs.move(id, { index: index + 1 })
    }

    static async duplicateTab(active) {
        const [{id}] = await Tabs.getCurrentTab()

        await browser.tabs.duplicate(id, { active })
    }

    static async closeCurrentTab() {
        const [{id}] = await Tabs.getCurrentTab()

        await browser.tabs.remove(id)
    }

    static async reloadCurrentTab() {
        const [{id}] = await Tabs.getCurrentTab()

        await browser.tabs.reload(id)
    }

    static async newTab() {
        await browser.tabs.create({ active: true })
    }
}
