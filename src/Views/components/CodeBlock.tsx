import { Accessor, Component } from "solid-js";
import GridView from "./GridView";
import { AttributeDefinition } from "src/Data/Query";
import BlockToolbar from "./BlockToolbar";
import { QueryResult } from "src/Data/VaultDB";

export type ViewMode = "grid";

const CodeBlock: Component<{queryResult: QueryResult, attributes: AttributeDefinition[], 
    viewMode: {viewMode: Accessor<ViewMode>, setViewMode: (vm:ViewMode)=>void}
}> = (props) => {

    return <div class="sets-codeblock">
        <BlockToolbar queryResult={props.queryResult}  attributes={props.attributes} viewMode={props.viewMode} />
        <GridView data={props.queryResult.data} attributes={props.attributes} />
    </div>
        
}

export default CodeBlock;
