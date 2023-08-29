import { Accessor, Component, Show, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ViewMode } from "./CodeBlock";
import { QueryResult } from "src/Data/VaultDB";
import { setIcon } from "obsidian";
import { FilterModal } from "../FilterModal";
import { useBlock } from "./BlockProvider";
import { useApp } from "./AppProvider";

const BlockToolbar: Component<{queryResult: QueryResult,  attributes: AttributeDefinition[], viewMode: {viewMode:Accessor<ViewMode>, setViewMode: (vm:ViewMode)=>void}}> = (props) => {

    let filterBtn : HTMLDivElement;
    const app = useApp()!;

    const {definition} = useBlock()!;

    const onAdd= async () => {
        //TODO: move elsewhere
        
        // TODO: find the right path
        const db = props.queryResult.db;
        db.addToSet(props.queryResult);
    }

    const canAdd = () => {
        return props.queryResult.db.canAdd(props.queryResult);
    }

    const onFilter = () => {
        const filterModal = new FilterModal(app, definition());
        filterModal.open();
    }

    onMount(()=>{
        setIcon(filterBtn, "filter")
    })

    return <div class="sets-codeblock-toolbar">
        <Show when={canAdd()}>
            <button  class="sets-toolbar-addbutton mod-cta"  onClick={onAdd}>Add</button>
            <div ref={filterBtn!} class="clickable-icon" 
                onClick={onFilter}
            ></div>
        </Show>
    </div> 
} 

export default BlockToolbar;
