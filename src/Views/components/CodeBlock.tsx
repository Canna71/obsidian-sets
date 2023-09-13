import { Accessor, Component, Show } from "solid-js";
import GridView from "./GridView";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import BlockToolbar from "./BlockToolbar";
import { QueryResult } from "src/Data/VaultDB";
import { GridProvider } from "./GridProvider";
import { useBlock } from "./BlockProvider";
// import { useBlock } from "./BlockProvider";

export type ViewMode = "grid";

export interface CodeBlockProps {
    queryResult: QueryResult,
    attributes: AttributeDefinition[],
    viewMode: { viewMode: Accessor<ViewMode>, setViewMode: (vm: ViewMode) => void },
}


const CodeBlock: Component<CodeBlockProps> = (props) => {
    const { getNewFile } = useBlock()!;

    // if newFile is set, put the new file in the first row

    const reorderedResults = () => {
        if (getNewFile()) {
            // props.queryResult.data.unshift(getNewFile());
            const newFileRowIndex = props.queryResult.data.findIndex(row => row.file.path === getNewFile());

            // reorder props.queryResult.data so that the new file is at the top
            if (newFileRowIndex > 0) {
                const row = props.queryResult.data[newFileRowIndex];
                const newData = [row, ...props.queryResult.data.filter((c, i) => i !== newFileRowIndex)];

                return newData;
            }

        }
        return props.queryResult.data;

    }

    // function that returns if more items were available
    const moreItemsAvailable = () => {
        return props.queryResult.total > props.queryResult.data.length;
    }

    return <div class="sets-codeblock">
        <BlockToolbar queryResult={props.queryResult} attributes={props.attributes} viewMode={props.viewMode} />
        <GridProvider gridState={{
            hovering: undefined,
            // fields: definition().fields
        }}>
            <GridView data={reorderedResults()} attributes={props.attributes} />
        </GridProvider>
        <Show when={moreItemsAvailable()}>
            <div class="sets-codeblock-more">
                {/* <button class="sets-codeblock-more-button" onClick={() => {
                    props.queryResult.more();
                }
                }> More
                </button>
                */}
                Showing first {props.queryResult.data.length} items of {props.queryResult.total} 
            </div>
        </Show>


    </div>

}

export default CodeBlock;
