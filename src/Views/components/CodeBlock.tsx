import { Accessor, Component } from "solid-js";
import GridView from "./GridView";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import BlockToolbar from "./BlockToolbar";
import { QueryResult } from "src/Data/VaultDB";
import { GridProvider } from "./GridProvider";
// import { useBlock } from "./BlockProvider";

export type ViewMode = "grid";

const CodeBlock: Component<{queryResult: QueryResult, attributes: AttributeDefinition[], 
    
    viewMode: {viewMode: Accessor<ViewMode>, setViewMode: (vm:ViewMode)=>void}
}> = (props) => {
    // const {definition} = useBlock()!;

    return <div class="sets-codeblock">
        <BlockToolbar queryResult={props.queryResult}  attributes={props.attributes} viewMode={props.viewMode} />
        <GridProvider gridState={{
            hovering: undefined,
            // fields: definition().fields
        }}>
            <GridView data={props.queryResult.data} attributes={props.attributes} />
        </GridProvider>
    </div>
        
}

export default CodeBlock;
