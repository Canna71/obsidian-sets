/* eslint-disable @typescript-eslint/ban-types */
import { debounce, ItemView,  WorkspaceLeaf } from "obsidian";
import { render } from "solid-js/web";

import { SetsSettings } from "src/Settings";
import SetsPlugin, { getSetsSettings } from "src/main";
import { MyComponent } from "./components/MyComponent";
export const SETS_VIEW = "Sets-view";

export class SetsView extends ItemView {
    settings: SetsSettings;
   
    state = {

    };

    plugin: SetsPlugin;
    

    constructor(leaf: WorkspaceLeaf, plugin: SetsPlugin) {
        super(leaf);
        this.plugin = plugin;
        // this.settings = (this.app as any).plugins.plugins["obsidian-Sets"].settings as SetsSettings;
        this.settings = getSetsSettings();
        this.state = {

        };
        this.icon = "sigma";
        console.log(`view ${SETS_VIEW} loaded`);
    }

    getViewType() {
        return SETS_VIEW;
    }

    getDisplayText() {
        return "Sets";
    }

    override onResize(): void {
        super.onResize();
        this.handleResize();
    }

    handleResize = debounce(() => {
        this.render();
    }, 300);




    render() {
        console.log(`rendering...`);
        const { contentEl } = this;
        contentEl.empty();
        render(() => <MyComponent name="Solid!" />, contentEl)
    }



    async onOpen() {
        
        
        this.render();

        this.plugin.queryVault([
            {
                operator: "eq",
                attribute: {tag:"metadata", attribute: "type"},
                value: "note"
            }
        ]);
    }

    async onClose() {

    }
}
