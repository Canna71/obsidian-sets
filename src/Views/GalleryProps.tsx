import { useApp } from "./components/AppProvider";
import { useSet } from "./components/SetProvider";
import { Component, For, createSignal, onMount } from "solid-js";
import { Property } from "./components/Property";
import { getPropertyDataById } from "src/Data/PropertyData";
import { Toggle } from "./Toggle";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { Setting } from "obsidian";

type GalleryProps = {
    exit: () => void
    attributes: AttributeDefinition[]
}

export const GalleryProps: Component<GalleryProps> = (props) => {
    const { definition, save, setDefinition } = useSet()!;

    const [transclude, setTransclude] = createSignal<string[]>(definition().gallery?.transclude || []);
    let sliderEl: HTMLDivElement;

    onMount(() => {
        new Setting(sliderEl)
        .setName("Min width")
        .setDesc("Minimum width of each card in the gallery")
        .addSlider(s => {
            s.setLimits(100, 1000, 10)
            .setValue(definition().gallery?.minWidth || 250)
            .setDynamicTooltip()
            
            .onChange((value) => {
                setDefinition({
                    ...definition(),
                    gallery: {
                        ...definition().gallery || {},
                        minWidth: value
                    }
                });
                
            })
            .showTooltip()
        })
    });

    // get app
    const { app } = useApp()!;

    const onSave = () => {
        setDefinition({
            ...definition(),
            gallery: {
                ...definition().gallery || {},

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
    };

    return <div class="sets-fields-select">
        <div class="modal-header">
            <h4>Gallery Properties</h4>
        </div>
        <div>Select which properties to transclude</div>
        <div class="sets-fields-list selected-props">
            <For each={props.attributes}>{attr => {
                const pd = getPropertyDataById(app, attr.key);
                return <div class="sets-field-selectable">
                    <Property {...pd!} /><Toggle value={() => transclude().includes(attr.key) || false} onChange={(value) => ontoggle(attr.key, value)} />
                </div>;
            }}</For>
        </div>
        <div ref={sliderEl!}></div>
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
    </div>;


};
