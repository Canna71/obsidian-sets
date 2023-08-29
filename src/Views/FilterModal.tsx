import { App, Modal } from "obsidian";
import { SetDefinition } from "./components/renderCodeBlock";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { FilterEditor } from "./components/FilterEditor";



export class FilterModal extends Modal {
    message: string;
    definition: SetDefinition;
    constructor(app: App, definition: SetDefinition) {
        super(app);
        this.definition = definition;
    }

    onOpen() {
        const { contentEl } = this;

        // contentEl.createEl("h3", { text: "Filter Editor" });
        // contentEl.setText(this.message);
        // const clauseContainer = contentEl.createDiv();


        render(() => <AppProvider app={this.app}><FilterEditor /></AppProvider>, contentEl);

        // new Setting(contentEl)
        //     .addButton((btn) =>
        //         btn
        //             .setButtonText("OK")
        //             .setCta()
        //             .onClick(() => {
        //                 this.close();
        //             }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
