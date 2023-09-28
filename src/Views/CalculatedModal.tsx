import { App, Modal } from "obsidian";
import { SetDefinition } from "./components/SetDefinition";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";
import { SetProvider } from "./components/SetProvider";
import { Component } from "solid-js";


const CalculatedEditor:Component<{
    value: [string,string];
    update: (def: [ string, string ])=> void;
}> = (props) => {

    return (<div class="sets-calculated-editor">
        <div  class="sets-calculated-editor-name">
            <label>Calculated Field Name</label>
            <input type="text" value={props.value[0]} onChange={(e)=>{props.update([e.currentTarget.value, props.value[1]])}} />
        </div>
        <div class="sets-calculated-editor-value">
            <label>Calculated Field Definition</label>
            <input type="text" value={props.value[1]} onChange={(e)=>{props.update([props.value[0], e.currentTarget.value])}} />
        </div>
    </div>)
}


export class CalculatedModal extends Modal {
    message: string;
    cf: [ string, string ];
    private _update: (def: [string,string]) => void;
    constructor(app: App, value: [string,string], update: (def: [ string, string ])=> void) {
        super(app);
        this.cf = value;
        
        this._update = update;
    }

    onOpen() {
        const { contentEl } = this;

        // contentEl.createEl("h3", { text: "Filter Editor" });
        // contentEl.setText(this.message);
        // const clauseContainer = contentEl.createDiv();


        render(() => 
                <CalculatedEditor value={this.cf} update={this._update} />
           , contentEl);

       
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
