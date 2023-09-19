
// creates class NewTypeModal that hinerint from NameInputModal

import { Show } from "solid-js";
import { slugify } from "src/Utils/slugify";
import SetsPlugin from "src/main";
import { NameInputModal } from "./NameInputModal";
import { App, Notice } from "obsidian";

// and implements the logic in main.tsx for creating a new collection
export class NewCollectionModal extends NameInputModal {
    plugin: SetsPlugin;

    constructor(app: App, plugin: SetsPlugin) {
        super(app, "Enter Collection Name", "Collection name", async (name) => {
            try {
                const newFile = await this.plugin.vaultDB.createNewCollection(name);
                await this.app.workspace.openLinkText(newFile.path, "/", "tab");
            }
            catch (e) {
                new Notice(e.message);
            }
        });
        this.plugin = plugin;

        super._moreInfo = (props) => {
            return <Show when={props.value()}> <div>
                <div>Collection will be created as: <code>{`${this.plugin.settings.setsRoot}/${this.plugin.settings.collectionsRoot}/${props.value()}/${props.value()}.md`}</code></div>
            </div></Show>
        }

    }


}
