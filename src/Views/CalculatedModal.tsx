import { App, Modal } from "obsidian";
import { SetDefinition } from "./components/SetDefinition";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";
import { SetProvider } from "./components/SetProvider";
import { Component, Show, createSignal } from "solid-js";


const CalculatedEditor:Component<{
    value: [string,string];
    update: (def: [ string, string ])=> void;
    close: ()=> void;
    validate: (val: string) => boolean;
}> = (props) => {
    // track the value here and update it when the user changes it
    // then when the user clicks save, we can update the set definition
    // with the new value
    const [name, setName] = createSignal(props.value[0]);   
    const [def, setDef] = createSignal(props.value[1]); 

    const isValid = () => {
        return props.validate(name());
    }

    return (<div class="sets-calculated-editor">
        <div  class="sets-calculated-editor-name">
            <div class="sets-fields-label">Calculated Field Name</div>
            <input type="text" value={name()} onInput={(e)=>{setName(e.currentTarget.value)}} />
        </div>
        <div class="sets-calculated-editor-value">
            <div class="sets-fields-label">Calculated Field Definition</div>
            <input type="text" value={def()} onInput={(e)=>{setDef(e.currentTarget.value)}} />
        </div>
        <div class="sets-calculated-editor-buttons">
            <Show when={isValid()}>
                <button class="mod-cta" onClick={()=>{props.update([name(), def()]),props.close()}}>Save</button>
            </Show>
            <button onClick={()=>{props.close()}}>Cancel</button>
        </div>
    </div>)
}


export class CalculatedModal extends Modal {
    message: string;
    cf: [ string, string ];
    private _update: (def: [string,string]) => void;
    private _validate: (val: string) => boolean;
    constructor(app: App, value: [string,string], validprod:(val:string)=>boolean, update: (def: [ string, string ])=> void) {
        super(app);
        this.cf = value;
        this._validate = validprod;
        this._update = update;
    }

    onOpen() {
        const { contentEl } = this;

        // contentEl.createEl("h3", { text: "Filter Editor" });
        // contentEl.setText(this.message);
        // const clauseContainer = contentEl.createDiv();


        render(() => 
                <CalculatedEditor value={this.cf} update={this._update} close={()=>{this.close()}} validate={this._validate}/>
           , contentEl);

       
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
