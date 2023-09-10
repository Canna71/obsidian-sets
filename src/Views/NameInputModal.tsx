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
        // contentEl.setText(this.message);

        new Setting(contentEl)
        .addText((text) =>
          text.onChange((value) => {
            this.result = value
          }));
        

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("OK")
                    .setCta()
                    .onClick(() => {
                        this.close();
                    }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
