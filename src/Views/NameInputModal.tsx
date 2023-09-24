import { create } from "domain";
import { App, ButtonComponent, Modal, Setting } from "obsidian";
import { Accessor, Component, Setter, Show, createSignal } from "solid-js";
import { render } from "solid-js/web";
import NameEditor, { isValidFileName } from "./components/NameEditor";
import { AppProvider } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";



export class NameInputModal extends Modal {
    message: string;
    placeholder: string;
    onSubmit: (result: string) => void;

    value: Accessor<string>;
    setValue: Setter<string>;

    protected _moreInfo: Component<{ value: Accessor<string>; }> | undefined;
    private _validateFileName: boolean;

    constructor(app: App, message: string, placeholder: string,initialValue: string,
        onSubmit: (result: string) => void,
        moreInfo?: Component<{ value: Accessor<string> }>,
        validateFileName?: boolean
    ) {
        super(app);
        this.message = message;
        this.placeholder = placeholder;
        this.onSubmit = onSubmit;
        [this.value, this.setValue] = createSignal(initialValue);
        this._moreInfo = moreInfo;
        this._validateFileName = validateFileName ?? true;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("div", { text: this.message, cls: "sets-modal-title" });

        

        const validFileName = () => {
            if (!this._validateFileName) return true;
            if (this.value().length === 0) return false;
            if(isValidFileName(this.app, this.value(), undefined)) return false;
            return true;
        }

        const onFinished = () => {
            if (this.value().length > 0) {
                this.onSubmit && this.onSubmit(this.value());
                this.close();
            }
        }

        const onInput = (value: string) => {
            this.setValue(value);
        }

        const mainEl = contentEl.createDiv({ cls: "sets-name-input" });
        render(() => {
            return (
                <AppProvider app={{ app: this.app, db: undefined as any as VaultDB }}>
                    <div class="metadata-input-longtext sets-input-editable">
                        <NameEditor 
                            value={this.value}  
                            setValue={this.setValue} 
                            enter={onFinished}
                            input={onInput}
                        />
                    </div>
                    { this._moreInfo && this._moreInfo!({ value: this.value })}
                    <div class="sets-button-bar">
                        <Show when={validFileName()}>
                            <button class="mod-cta" 
                                onClick={onFinished}
                            >Save</button>
                        </Show>
                        <button class=""
                            onClick={() => {
                                this.close();
                            }}
                        >Cancel</button>
                    </div>
                </AppProvider>
            )
        }, mainEl)


        // if (this._moreInfo) {
        //     const mi = contentEl.createDiv();
        //     render(() => this._moreInfo!({ value: this.value }), mi);
        // }

        /*
        const setting = new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("OK")
                    .setCta()
                    .setDisabled(true)
                    .setClass("hidden")
                    .onClick(() => {
                        this.onSubmit && this.onSubmit(this.value());
                        this.close();
                    }))
            .addButton((btn) =>
                btn
                    .setButtonText("Cancel")
                    .onClick(() => {
                        this.close();
                    }))
            ;
        */

    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
