/* eslint-disable @typescript-eslint/ban-types */
import { debounce, ItemView,  WorkspaceLeaf } from "obsidian";
import { render } from "solid-js/web";

import { SetsSettings } from "src/Settings";
import SetsPlugin, { getSetsSettings } from "src/main";
import Sidebar from "./components/Sidebar";
import { AppProvider } from "./components/AppProvider";
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
        this.icon = "database";
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
        const { contentEl } = this;
        contentEl.empty();
        render(() => <AppProvider 
            app={{app: this.plugin.app, db: this.plugin.vaultDB}}
        ><Sidebar plugin={this.plugin}  /></AppProvider>, contentEl)
        
        
    }



    async onOpen() {
        
        
        this.render();

        
    }

    async onClose() {

    }
}
