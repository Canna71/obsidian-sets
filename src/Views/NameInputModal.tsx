import { create } from "domain";
import { App, Modal, Setting } from "obsidian";
import { Accessor, Component, createSignal } from "solid-js";
import { render } from "solid-js/web";



export class NameInputModal extends Modal {
    message: string;
    placeholder: string;
    onSubmit: (result: string) => void;
    result: any;
    private _moreInfo: Component<{ value: Accessor<string>; }> | undefined;
    
    constructor(app: App, message:string,placeholder:string, 
        onSubmit: (result: string) => void,
        moreInfo?: Component<{value:Accessor<string>}>
        ) {
        super(app);
        this.message = message;
        this.placeholder = placeholder;
        this.onSubmit = onSubmit;
        this.result = createSignal("");
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
                this.result[1](input.value);
                this.onSubmit && this.onSubmit(this.result[0]());
                this.close();
                e.preventDefault();
            }
        });
        input.addEventListener("change", (e) => {
            // this.result = input.value;
            this.result[1](input.value);
        });

        if(this._moreInfo) {
            const mi = contentEl.createDiv();
            render(() => this._moreInfo!({value: this.result[0]}), mi);
        }
        // new Setting(contentEl)
        // .addText((text) =>
        //   text.onChange((value) => {
        //     this.result = value
        //   }));
        

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("OK")
                    .setCta()
                    .onClick(() => {
                        this.onSubmit && this.onSubmit(this.result);
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
