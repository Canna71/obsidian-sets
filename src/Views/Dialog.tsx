import { App, Modal, Setting } from "obsidian";

export class Dialog extends Modal {
    message: string;
    constructor(app: App, message: string) {
        super(app);
        this.message = message;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h3", { text: this.message });
        // contentEl.setText(this.message);

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
