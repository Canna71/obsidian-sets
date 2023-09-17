import { App, Modal, Setting } from "obsidian";
import { FieldDefinition, SetDefinition } from "./components/SetDefinition";
import { render } from "solid-js/web";
import { AppProvider } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";

import { SetProvider } from "./components/SetProvider";
import { FieldSelect } from "./components/FieldSelect";
import { onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { getPropertyData } from "src/Data/PropertyData";
import { GalleryProps } from "./GalleryProps";



export class GalleryPropsModal extends Modal {
    message: string;
    definition: SetDefinition;
    private _db: VaultDB;
    private _update: (def: SetDefinition) => void;
    private _attributes: AttributeDefinition[];

    constructor(app: App, db: VaultDB, definition: SetDefinition, attributes: AttributeDefinition[], update: (def: SetDefinition) => void) {
        super(app);
        this.definition = definition;
        this._attributes = attributes;
        this._db = db;
        this._update = update;
    }

    onOpen() {
        const { contentEl } = this;

        // contentEl.createEl("h3", { text: "Filter Editor" });
        // contentEl.setText(this.message);
        // const clauseContainer = contentEl.createDiv();


        render(() => <AppProvider app={{ app: this.app, db: this._db }}>
            {/* <ClauseEditor db={this._db} /> */}
            <SetProvider setDefinition={this.definition}

                updateDefinition={this._update} >
                <GalleryProps
                    attributes={this._attributes}
                    exit={() => { this.close() }}
                />
            </SetProvider>

        </AppProvider>, contentEl);


    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

