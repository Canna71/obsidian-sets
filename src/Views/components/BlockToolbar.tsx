import { Accessor, Component, Show } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ViewMode } from "./CodeBlock";
import { QueryResult } from "src/Data/VaultDB";

const BlockToolbar: Component<{queryResult: QueryResult, attributes: AttributeDefinition[], viewMode: {viewMode:Accessor<ViewMode>, setViewMode: (vm:ViewMode)=>void}}> = (props) => {

    const onAdd= async () => {
        //TODO: move elsewhere
        
        // TODO: find the right path
        const db = props.queryResult.db;
        db.addToSet(props.queryResult);
    }

    const canAdd = () => {
        return props.queryResult.db.canAdd(props.queryResult);
    }

    return <div class="sets-codeblock-toolbar">
        <Show when={canAdd()}>
            <button onClick={onAdd}>Add</button>
        </Show>
    </div>
} 

export default BlockToolbar;
