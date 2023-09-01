import { useApp } from "./AppProvider";
import { useBlock } from "./BlockProvider";
import { Component, For, createSignal } from "solid-js";
import { PropertyData, getPropertyData } from "src/Data/PropertyData";
import { Property } from "./Property";


export interface SortingEditorProps {
    // selected: FieldDefinition[];
    exit: () => void;
}

const SortingEditor: Component<SortingEditorProps> = (props) => {
    const { definition, save } = useBlock()!;
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

    const selected = () => {
        const pd = getPropertyData(app);
        return pd.filter(pd => (definition().fields || []).includes(pd.key))
            .filter(pd => pd.name.toLowerCase().includes(keyword().toLowerCase()));
    };

    const addToSort = (e:PropertyData) => {
        
    }

    return (<div class="sets-fields-select">
        <h4>Sort by:</h4>
        <input class="sets-field-search" 
        value={keyword()} 
        type="search"
        placeholder="Search for a property"
        onInput={(e) => {
          setKeyword(e.target.value)
        }}></input>
        <div class="sets-fields-label">Visible:</div>
        <div class="sets-fields-list selected-props">
            <For each={selected()}>{(pd) => <Property {...pd} icon="arrow-up-down" onClick={addToSort} />}</For>
        </div>
        
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
        

    </div>);
};

export default SortingEditor;
