import { App, Modal, Setting } from "obsidian";



export class NameInputModal extends Modal {
    message: string;
    onSubmit: (result: string) => void;
    result: any;
    
    constructor(app: App, message:string, onSubmit: (result: string) => void) {
        super(app);
        this.message = message;
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h3", { text: this.message });

        const input = contentEl.createEl("input", { attr: { type: "text" },
            placeholder: this.message,
        });
        input.focus();
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.result = input.value;
                this.onSubmit && this.onSubmit(this.result);
                this.close();
            }
        });
        input.addEventListener("change", (e) => {
            this.result = input.value;
        });

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
