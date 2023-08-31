import { App, Modal } from "obsidian";
import { SetDefinition } from "./components/renderCodeBlock";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";

import { BlockProvider, useBlock } from "./components/BlockProvider";
import { Component } from "solid-js";
import { createStore } from "solid-js/store";

export interface FieldSelectProps {
   
    exit: () => void
}

const FieldSelect:Component<FieldSelectProps> = (props) => {
    const {definition,setDefinition,save} = useBlock()!;
    // https://docs.solidjs.com/references/api-reference/stores/using-stores
    const [state, setState] = createStore(definition()|| [])

    const onSave = () => {
        // const newDef = {...definition(), }
        console.log(state);
        setDefinition(state);
        save();
        props.exit();
        // TODO: close
    }

    const update = () => {
        
    }

    return (<div class="sets-field-select">
        <h3>Select Fields</h3>
        
       
        <button class="mod-cta" onClick={onSave}>Save</button>
        <button class="" onClick={props.exit}>Cancel</button>

    </div>)
}

export class FieldSelectModal extends Modal {
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
                <FieldSelect exit={()=>{this.close()}} />
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
