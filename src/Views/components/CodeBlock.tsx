import { Accessor, Component, Show } from "solid-js";
import GridView from "./GridView";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import BlockToolbar from "./BlockToolbar";
import { QueryResult, limitResults } from "src/Data/VaultDB";
import { GridProvider } from "./GridProvider";
import { useSet } from "./SetProvider";
import ListView from "../ListView";
import BoardView from "./BoardView";
import GalleryView from "../GalleryView";
import { getSetsSettings } from "src/main";
// import { useBlock } from "./BlockProvider";


export interface CodeBlockProps {
    queryResult: QueryResult,
    attributes: AttributeDefinition[]
}


const CodeBlock: Component<CodeBlockProps> = (props) => {
    const { getNewFile, definition } = useSet()!;

    const scope = definition().scope;
    const viewMode = definition().viewMode || "grid";
    // if newFile is set, put the new file in the first row

    const limitedResults = () => {
        // if (getNewFile()) {
        //     // props.queryResult.data.unshift(getNewFile());
        //     const newFileRowIndex = props.queryResult.data.findIndex(row => row.file.path === getNewFile());

        //     // reorder props.queryResult.data so that the new file is at the top
        //     if (newFileRowIndex > 0) {
        //         const row = props.queryResult.data[newFileRowIndex];
        //         const newData = [row, ...props.queryResult.data.filter((c, i) => i !== newFileRowIndex)];

        //         return newData;
        //     }

        // }
        const limitedResults = limitResults(props.queryResult, getSetsSettings().topResults, getNewFile() );
        return limitedResults;

    }

    const data = () => limitedResults().data;

    // function that returns if more items were available
    const moreItemsAvailable = () => {
        return limitedResults().total > limitedResults().data.length;
    }

    return <div class="sets-codeblock">
        <BlockToolbar queryResult={props.queryResult} attributes={props.attributes} />
        <Show when={scope}>
            <Show when={definition().viewMode === "grid" || !definition().viewMode}>
                <GridProvider gridState={{
                    hovering: undefined,
                    // fields: definition().fields
                }}>
                    <GridView data={data()} attributes={props.attributes} />
                </GridProvider>
            </Show>
            <Show when={definition().viewMode === "list"}>
                <ListView data={data()} attributes={props.attributes} />
            </Show>
            <Show when={definition().viewMode === "board"}>
                <BoardView data={data()} attributes={props.attributes} />
            </Show>
            <Show when={definition().viewMode === "gallery"}>
                <GalleryView data={data()} attributes={props.attributes} />
            </Show>
            <Show when={data().length}>
                <div class="sets-codeblock-more">
                    {/* <button class="sets-codeblock-more-button" onClick={() => {
                        props.queryResult.more();
                    }
                    }> More
                    </button>
                    */}
                    Showing {data().length} items of {limitedResults().total}
                </div>
            </Show>
            <Show when={props.queryResult.data.length === 0}>
                <div class="sets-codeblock-empty">
                    <div class="sets-codeblock-empty-text">
                        No items found
                    </div>
                </div>
            </Show>
        </Show>
        <Show when={!scope}>
            <div class="sets-codeblock-empty">
                <div class="sets-codeblock-empty-text">
                    No scope selected
                </div>
            </div>
        </Show>

    </div>

}

export default CodeBlock;
