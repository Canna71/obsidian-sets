import { App, Modal, Setting } from "obsidian";
import { SetDefinition } from "./components/renderCodeBlock";

export class FilterEditor extends Modal {
    message: string;
    constructor(definition: SetDefinition) {
        super(app);
        this.definition = definition;
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h3", { text: "Filter Editor" });
        // contentEl.setText(this.message);
        const clauseContainer = contentEl.createDiv();

        new Setting(clauseContainer)
            // .addSearch(search => {
            //     search.registerOptionListener({
            //         "uno": ()=>"One"
            //     }, "two");
            // })
            .addDropdown(dd=>{
                dd.addOptions({
                    "one":"UNO",
                    "twp": "DUE"
                })
            })

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
