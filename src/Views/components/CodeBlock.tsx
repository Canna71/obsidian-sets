import { Accessor, Component } from "solid-js";
import GridView from "./GridView";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import BlockToolbar from "./BlockToolbar";
import { QueryResult } from "src/Data/VaultDB";
import { GridProvider } from "./GridProvider";
import { useBlock } from "./BlockProvider";
// import { useBlock } from "./BlockProvider";

export type ViewMode = "grid";

const CodeBlock: Component<{
    queryResult: QueryResult, attributes: AttributeDefinition[],

    viewMode: { viewMode: Accessor<ViewMode>, setViewMode: (vm: ViewMode) => void }
}> = (props) => {
    const { getNewFile } = useBlock()!;

    // if newFile is set, put the new file in the first row

    const reorderedResults = () => {
        if (getNewFile()) {
            // props.queryResult.data.unshift(getNewFile());
            const newFileRowIndex = props.queryResult.data.findIndex(row => row.file.path === getNewFile());

            // reorder props.queryResult.data so that the new file is at the top
            if (newFileRowIndex > 0) {
                const row = props.queryResult.data[newFileRowIndex];
                const newData = [row, ...props.queryResult.data.filter((c,i)=>i!==newFileRowIndex)];
                
                return newData;
            }

        }
        return props.queryResult.data;

    }

    return <div class="sets-codeblock">
        <BlockToolbar queryResult={props.queryResult} attributes={props.attributes} viewMode={props.viewMode} />
        <GridProvider gridState={{
            hovering: undefined,
            // fields: definition().fields
        }}>
            <GridView data={reorderedResults()} attributes={props.attributes} />
        </GridProvider>
    </div>

}

export default CodeBlock;
