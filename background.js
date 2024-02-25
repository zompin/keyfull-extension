class Tabs {
    async getActiveTabIndex() {
        const [{ index }] = await browser.tabs.query({ active: true, currentWindow: true })

        return index
    }

    async setActiveTabByIndex(index) {
        const [{id}] = await browser.tabs.query({index, currentWindow: true})
        await browser.tabs.update(id, {active: true})
    }

    async nextTab() {
        const index = await this.getActiveTabIndex()
        const [nextTab] = await browser.tabs.query({index: index + 1, currentWindow: true})
        let nextTabIndex = nextTab ? nextTab.index : 0

        await this.setActiveTabByIndex(nextTabIndex)
    }

    async prevTab() {
        let index = await this.getActiveTabIndex()

        if (!index) {
            const allTabs = await browser.tabs.query({ currentWindow: true })
            index = allTabs.length
        }

        await this.setActiveTabByIndex(index - 1)
    }

    async newBackgroundTab(url) {
        await browser.tabs.create({ url, active: false })
    }
}

async function main() {
    const tabControl = new Tabs()

    browser.runtime.onMessage.addListener(async (params) => {
        const [key, arg1] = JSON.parse(params)
        switch (key) {
            case 'TAB_PREV':
                await tabControl.prevTab()
                break
            case 'TAB_NEXT':
                await tabControl.nextTab()
                break
            case 'TAB_NEW_BACKGROUND':
                await tabControl.newBackgroundTab(arg1)
                break
        }
    })
}

main().catch(console.log)
