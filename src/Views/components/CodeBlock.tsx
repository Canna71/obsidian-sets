import { Accessor, Component } from "solid-js";
import GridView from "./GridView";
import { ObjectData } from "src/Data/ObjectData";
import { Attribute, Query } from "src/Data/Query";
import BlockToolbar from "./BlockToolbar";

export type ViewMode = "grid";

const CodeBlock: Component<{query:Query, data: ObjectData[], attributes: Attribute[], 
    viewMode: {viewMode: Accessor<ViewMode>, setViewMode: (vm:ViewMode)=>void}
}> = (props) => {

    return <div class="sets-codeblock">
        <BlockToolbar query={props.query} data={props.data} attributes={props.attributes} viewMode={props.viewMode} />
        <GridView data={props.data} attributes={props.attributes} />
    </div>
        
}

export default CodeBlock;
