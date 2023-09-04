import { App, Modal } from "obsidian";
import { SetDefinition } from "./components/renderCodeBlock";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";
import FilterEditor from "./FilterEditor";
import { BlockProvider } from "./components/BlockProvider";



export class FilterEditorModal extends Modal {
    message: string;
    definition: SetDefinition;
    private _db: VaultDB;
    private _update: (def: SetDefinition) => void;
    constructor(app: App,db:VaultDB, definition: SetDefinition, update: (def: SetDefinition)=> void) {
        super(app);
        this.definition = definition;
        this._db = db;
        this._update = update;
    }

    onOpen() {
        const { contentEl } = this;

        // contentEl.createEl("h3", { text: "Filter Editor" });
        // contentEl.setText(this.message);
        // const clauseContainer = contentEl.createDiv();


        render(() => <AppProvider app={{app: this.app, db:this._db}}>
            {/* <ClauseEditor db={this._db} /> */}
            <BlockProvider setDefinition={this.definition} updateDefinition={this._update} >
                <FilterEditor exit={()=>{this.close()}} />
            </BlockProvider>
            
        </AppProvider>, contentEl);

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
