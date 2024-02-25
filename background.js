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
}

async function main() {
    const tabControl = new Tabs()

    browser.runtime.onMessage.addListener(async (key) => {
        switch (key) {
            case 'Comma':
                await tabControl.prevTab()
                break
            case 'Period':
                await tabControl.nextTab()
                break
        }
    })
}

main().catch(console.log)
