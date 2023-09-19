import { create } from "domain";
import { App, ButtonComponent, Modal, Setting } from "obsidian";
import { Accessor, Component, Setter, createSignal } from "solid-js";
import { render } from "solid-js/web";



export class NameInputModal extends Modal {
    message: string;
    placeholder: string;
    onSubmit: (result: string) => void;
    
    value: Accessor<string>;
    setValue: Setter<string>;
    
    protected _moreInfo: Component<{ value: Accessor<string>; }> | undefined;
    
    constructor(app: App, message:string,placeholder:string, 
        onSubmit: (result: string) => void,
        moreInfo?: Component<{value:Accessor<string>}>
        ) {
        super(app);
        this.message = message;
        this.placeholder = placeholder;
        this.onSubmit = onSubmit;
        [this.value, this.setValue] = createSignal("");
        this._moreInfo = moreInfo;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("div", { text: this.message, cls: "sets-modal-title" });

        const input = contentEl.createEl("input", { attr: { type: "text" },
            placeholder: this.placeholder,
            cls: "sets-name-input"
        });
        input.focus();
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.setValue(input.value);
                if(input.value.length > 0 ){
                    this.onSubmit && this.onSubmit(this.value());
                    this.close();
                }
                e.preventDefault();
            }
        });
        input.addEventListener("change", (e) => {
            // this.result = input.value;
            this.setValue(input.value);
        });
        input.addEventListener("input", (e) => {
            // this.result = input.value;
            this.setValue(input.value);
            if(input.value.length > 0) {
                setting.components[0].setDisabled(false);
                (setting.components[0] as ButtonComponent).buttonEl.removeClass("hidden");
            }
            else {
                setting.components[0].setDisabled(true);
                (setting.components[0] as ButtonComponent).setClass("hidden");

            }

        });

        if(this._moreInfo) {
            const mi = contentEl.createDiv();
            render(() => this._moreInfo!({value: this.value}), mi);
        }
        

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

            
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
