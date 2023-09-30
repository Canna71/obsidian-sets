import { App, Modal } from "obsidian";
import { SetDefinition } from "./components/SetDefinition";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";
import { SetProvider } from "./components/SetProvider";
import { Component, Show, createSignal } from "solid-js";
import InputEditor from "./components/InputEditor";


const CalculatedEditor: Component<{
    value: [string, string];
    update: (def: [string, string]) => void;
    close: () => void;
    validateName: (val: string) => string;
    validateDef: (val: string) => string;
}> = (props) => {
    // track the value here and update it when the user changes it
    // then when the user clicks save, we can update the set definition
    // with the new value
    const [name, setName] = createSignal(props.value[0]);
    const [def, setDef] = createSignal(props.value[1]);

    const isValidName = () => {
        return props.validateName(name());
    }

    const isValidDef = () => {
        return props.validateDef(def());
    }

    return (<div class="sets-calculated-editor">
        <div class="sets-calculated-editor-name">
            <div class="sets-fields-label">Calculated Field Name</div>
            <input type="text"
                classList={{
                    "sets-invalid": isValidName().length > 0
                }}
                value={name()} onInput={(e) => { setName(e.currentTarget.value) }} />
            <span class="sets-calculated-editor-error">{isValidName()}</span>
        </div>
        <div class="sets-calculated-editor-value">
            <div class="sets-fields-label">Calculated Field Definition</div>

            <textarea
                classList={{
                    "sets-invalid": isValidDef().length > 0
                }}
                class="sets-calculated-textarea" value={def()} onInput={(e) => { setDef(e.currentTarget.value) }} />
            <div class="sets-calculated-editor-error">{isValidDef()}</div>
            {/* <InputEditor value={def} onInput={(e)=>{setDef(e)}} /> */}

            {/* <input type="text" value={def()} onInput={(e)=>{setDef(e.currentTarget.value)}} /> */}
        </div>
        <div class="sets-calculated-editor-buttons">
            <Show when={isValidName()=="" && isValidDef()==""}>
                <button class="mod-cta" onClick={() => { props.update([name(), def()]), props.close() }}>Save</button>
            </Show>
            <button onClick={() => { props.close() }}>Cancel</button>
        </div>
    </div>)
}


export class CalculatedModal extends Modal {
    message: string;
    cf: [string, string];
    private _update: (def: [string, string]) => void;
    private _validateName: (val: string) => string;
    private _validatecode: (val: string) => string;
    constructor(app: App, value: [string, string],
        validname: (val: string) => string,
        validatecode: (val: string) => string,
        update: (def: [string, string]) => void) {
        super(app);
        this.cf = value;
        this._validateName = validname;
        this._validatecode = validatecode;
        this._update = update;
    }

    onOpen() {
        const { contentEl } = this;

        // contentEl.createEl("h3", { text: "Filter Editor" });
        // contentEl.setText(this.message);
        // const clauseContainer = contentEl.createDiv();


        render(() =>
            <CalculatedEditor
                value={this.cf}
                update={this._update}
                close={() => { this.close() }}
                validateName={this._validateName}
                validateDef={this._validatecode}
            />
            , contentEl);


    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
