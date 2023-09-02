import { useApp } from "./AppProvider";
import { useBlock } from "./BlockProvider";
import { Component, For, createSignal } from "solid-js";
import { PropertyData, getPropertyData } from "src/Data/PropertyData";
import { Property } from "./Property";


export interface FieldSelectProps {
    // selected: FieldDefinition[];
    exit: () => void;
}

export const FieldSelect: Component<FieldSelectProps> = (props) => {
    const { definition, save, addField, removeField } = useBlock()!;
    // https://docs.solidjs.com/references/api-reference/stores/using-stores
    // const [state] = createStore(definition() || []);
    const { app } = useApp()!;
    const [keyword, setKeyword] = createSignal("");
    const onSave = () => {
        // const newDef = {...definition(), }
        // console.log(state);
        // setDefinition(state);
        save();
        props.exit();
        // TODO: close
    };

    // const update = () => {
        
    // };

    const available = () => {
        const pd = getPropertyData(app);
        return pd.filter(pd => !(definition().fields || []).includes(pd.key))
                .filter(pd => pd.name.toLowerCase().includes(keyword().toLowerCase()));
    };

    const selected = () => {
        const pd = getPropertyData(app);
        return pd.filter(pd => (definition().fields || []).includes(pd.key))
            .filter(pd => pd.name.toLowerCase().includes(keyword().toLowerCase()));
    };

    const onSelect = (e:PropertyData) => {
        addField(e.key);
    }

    const onUnselect = (e:PropertyData) => {
        removeField(e.key);
    }

    return (<div class="sets-fields-select">
        <h4>Select Fields</h4>
        <input class="sets-field-search" 
        value={keyword()} 
        type="search"
        placeholder="Search for a property"
        onInput={(e) => {
          setKeyword(e.target.value)
        }}></input>
        <div class="sets-fields-label">Visible:</div>
        <div class="sets-fields-list selected-props">
            <For each={selected()}>{(pd) => <Property {...pd} icon="toggle-right" onItemClick={onUnselect} />}</For>
        </div>
        <div class="sets-fields-label">Available:</div>

        <div class="sets-fields-list available-props">
            <For each={available()}>{(pd) => <Property {...pd} icon="toggle-left" onItemClick={onSelect} />}</For>
        </div>
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
        

    </div>);
};
