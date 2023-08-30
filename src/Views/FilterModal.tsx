import { App, Modal } from "obsidian";
import { SetDefinition } from "./components/renderCodeBlock";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { FilterEditor } from "./components/FilterEditor";
import { VaultDB } from "src/Data/VaultDB";



export class FilterModal extends Modal {
    message: string;
    definition: SetDefinition;
    private _db: VaultDB;
    constructor(app: App,db:VaultDB, definition: SetDefinition) {
        super(app);
        this.definition = definition;
        this._db = db;
    }

    onOpen() {
        const { contentEl } = this;

        // contentEl.createEl("h3", { text: "Filter Editor" });
        // contentEl.setText(this.message);
        // const clauseContainer = contentEl.createDiv();


        render(() => <AppProvider app={this.app}><FilterEditor db={this._db} /></AppProvider>, contentEl);

        // new Setting(contentEl)
        //     .addButton((btn) =>
        //         btn
        //             .setButtonText("OK")
        //             .setCta()
        //             .onClick(() => {
        //                 this.close();
        //             }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
