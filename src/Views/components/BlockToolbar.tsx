import { Accessor, Component } from "solid-js";
import { AttributeDefinition } from "src/Data/Query";
import { ViewMode } from "./CodeBlock";
import { QueryResult } from "src/Data/VaultDB";

const BlockToolbar: Component<{queryResult: QueryResult, attributes: AttributeDefinition[], viewMode: {viewMode:Accessor<ViewMode>, setViewMode: (vm:ViewMode)=>void}}> = (props) => {

    const onAdd= async () => {
        //TODO: move elsewhere
        const type = props.queryResult.query.inferSetType();
        if(!type) return;
        // TODO: find the right path
        const db = props.queryResult.db;
        db.addToSet(type);
    }

    return <div class="sets-codeblock-toolbar">
        <button onClick={onAdd}>Add</button>
    </div>
}

export default BlockToolbar;
