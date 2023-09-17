import { App, Modal, Setting } from "obsidian";
import { FieldDefinition, SetDefinition } from "./components/SetDefinition";
import { render } from "solid-js/web";
import { AppProvider, useApp } from "./components/AppProvider";
import { VaultDB } from "src/Data/VaultDB";

import { SetProvider, useSet } from "./components/SetProvider";
import { FieldSelect } from "./components/FieldSelect";
import { Accessor, Component, For, createSignal, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { Property } from "./components/Property";
import { getPropertyData, getPropertyDataById } from "src/Data/PropertyData";

type TobbleProps = {
    value: Accessor<boolean>,
    onChange: (value: boolean) => void
}

const Toggle: Component<TobbleProps> = (props) => {
    let el: HTMLDivElement;
    const onClick = (e) => {
        console.log("toggle", props.value());
        props.onChange(!props.value());
    }

    return (
        // <div ref={el!}></div>
        <div class="checkbox-container" 
            classList={{"is-enabled": props.value()}}
            onClick={onClick}
        >
            <input type="checkbox" tabIndex={0}  checked={props.value()} />
        </div>
    )
}

type GalleryProps = {
    exit: () => void
    attributes: AttributeDefinition[]
}

const GalleryProps: Component<GalleryProps> = (props) => {
    const { definition, save, setDefinition } = useSet()!;

    const [transclude, setTransclude] = createSignal<string[]>(definition().gallery?.transclude || []);

    // get app
    const { app } = useApp()!;

    const onSave = () => {
        setDefinition({
            ...definition(),
            gallery: {...definition().gallery || {}, 
        
                transclude: transclude()
            }
        });

        save();
        props.exit();
    };

    const ontoggle = (key: string, value: boolean) => {
        const ret = transclude().slice();
        if (value) {
            ret.push(key);
        } else {
            const idx = ret.indexOf(key);
            if (idx >= 0) {
                ret.splice(idx, 1);
            }
        }
        setTransclude(ret);
        // save();
    }

    return <div class="sets-fields-select">
        <div class="modal-header">
            <h4>Gallery Properties</h4>
        </div>
        <div>Select which properties to transclude</div>
        <div class="sets-fields-list selected-props">
            <For each={props.attributes} >{attr => {
                const pd = getPropertyDataById(app, attr.key);
                return <div class="sets-field-selectable">
                    <Property {...pd!} /><Toggle value={
                        () => transclude().includes(attr.key) || false
                    } onChange={(value) => ontoggle(attr.key, value)} />
                </div>}
            }</For>    
        </div>
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
    </div>


}

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

