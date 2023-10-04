
// creates class NewTypeModal that hinerint from NameInputModal

import { Show } from "solid-js";
import { slugify } from "src/Utils/slugify";
import SetsPlugin from "src/main";
import { NameInputModal } from "./NameInputModal";
import { App, Notice } from "obsidian";

// and implements the logic in main.tsx for creating a new type
export class NewTypeModal extends NameInputModal {
    plugin: SetsPlugin;

    constructor(app: App, plugin: SetsPlugin) {
        super(app, "Enter type name", "Type name","", async (name) => {
            try {
                const newFile = await this.plugin.vaultDB.createNewType(name);
                await this.app.workspace.openLinkText(newFile.path, "/", "tab");
                plugin.registerNewInstancesCommands();
            }
            catch (e) {
                new Notice(e.message);
            }
        });
        this.plugin = plugin;

        super._moreInfo = (props) => {
            return <Show when={props.value()}><div class="sets-modal-info">
                <div>Type Archetype will be created as: <code>{`${this.plugin.settings.setsRoot}/${this.plugin.settings.typesFolder}/${this.plugin.vaultDB.getArchetypeName(props.value())}`}</code></div>
                <div>The Type will have the property: <code>{this.plugin.settings.typeAttributeKey}: {slugify(props.value())}</code></div>
                <div>Set Folder will be created as: <code>{this.plugin.vaultDB.getSetFolderName(slugify(props.value()))}</code></div>
            </div></Show>
        }

    }


}
