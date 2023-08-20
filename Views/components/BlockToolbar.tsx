import { Accessor, Component } from "solid-js";
import { ObjectData } from "src/ObjectData";
import { Attribute, Query } from "src/Query";
import { ViewMode } from "./CodeBlock";

const BlockToolbar: Component<{query: Query, data: ObjectData[], attributes: Attribute[], viewMode: {viewMode:Accessor<ViewMode>, setViewMode: (vm:ViewMode)=>void}}> = (props) => {

    const onAdd= () => {
        
    }

    return <div class="sets-codeblock-toolbar">
        <button onClick={onAdd}>Add</button>
    </div>
}

export default BlockToolbar;
