import { App, Modal } from "obsidian";
import { SetDefinition } from "./components/SetDefinition";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";
import { SetProvider } from "./components/SetProvider";
import ScopeEditor from "./ScopeEditor";



export class ScopeEditorModal extends Modal {
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

        render(() => <AppProvider app={{app: this.app, db:this._db}}>
            {/* <ClauseEditor db={this._db} /> */}
            <SetProvider setDefinition={this.definition} 
            
            updateDefinition={this._update} >
                <ScopeEditor exit={()=>{this.close()}} />
            </SetProvider>
            
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
