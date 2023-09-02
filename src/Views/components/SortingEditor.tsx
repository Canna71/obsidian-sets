import { useApp } from "./AppProvider";
import { useBlock } from "./BlockProvider";
import { Component, For, createSignal } from "solid-js";
import { PropertyData, getPropertyData, getPropertyDataById } from "src/Data/PropertyData";
import { Property } from "./Property";


export interface SortingEditorProps {
    // selected: FieldDefinition[];
    exit: () => void;
}

interface SortingPropertyProps {
    key: string,
    descending: boolean
}

export const SortingProperty: Component<SortingPropertyProps> = (props) => {
    const { removeSort  } = useBlock()!;
    const {app} = useApp()!;

    const propertyDate = () => {
        const pd = getPropertyDataById(app, props.key);
        return pd;
    }

    const onRemove = (e:PropertyData) => {
        removeSort(e.key);
    }

    return (
        <div class="sets-sorting-property">
            <Property {...propertyDate()!} onIconClick={onRemove} icon="x" />
        </div>
    )
}

const SortingEditor: Component<SortingEditorProps> = (props) => {
    const { definition, save, setSort  } = useBlock()!;
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
    };

    // const update = () => {
        
    // };

    const sortFields = () => {
        return definition().sortby || [];
    }

    const available = () => {
        const pd = getPropertyData(app);
        return pd
            .filter(pd => (definition().fields || []).includes(pd.key)) // selected in this view
            .filter(pd => !sortFields().map(([field]) => field).includes(pd.key)) // not already in sorting fields
            .filter(pd => pd.name.toLowerCase().includes(keyword().toLowerCase())); // that matches query
    };

    const addToSort = (e:PropertyData) => {
        setSort(e.key,false);
    }

    return (<div class="sets-sorting-editor">
        <h4>Sort by:</h4>
        <div class="sets-sorting-fields">
            <For each={sortFields()}>
                {(sortField)=><SortingProperty  key={sortField[0]} descending={sortField[1]} />}
            </For>
        </div>
        <input class="sets-field-search" 
        value={keyword()} 
        type="search"
        placeholder="Search for a property"
        onInput={(e) => {
          setKeyword(e.target.value)
        }}></input>
        <div class="sets-fields-label">Visible:</div>
        <div class="sets-fields-list selected-props">
            <For each={available()}>{(pd) => <Property {...pd} icon="arrow-up-down" onItemClick={addToSort} />}</For>
        </div>
        
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
        

    </div>);
};

export default SortingEditor;
