import { Accessor, Component, Match, Show, Switch, createSignal } from "solid-js";
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

    const [top, setTop] = createSignal(definition().topResults || getSetsSettings().topResults || 100);

    const scope = definition().scope;
    const viewMode = definition().viewMode || "grid";
    // if newFile is set, put the new file in the first row

    const limitedResults = () => {

        const topResults = top();
        const limitedResults = limitResults(props.queryResult, topResults, getNewFile());
        return limitedResults;
    }

    const data = () => limitedResults().data;

    // function that returns if more items were available
    const moreItemsAvailable = () => {
        return limitedResults().total > limitedResults().data.length;
    }

    const onMore = () => {
        // fetches more items
        const topResults = definition().topResults || getSetsSettings().topResults || 100;
        const newTop = top() + topResults;
        // const total = limitedResults().total;
        setTop(newTop);
    }

    return <div class="sets-codeblock">
        <BlockToolbar queryResult={props.queryResult} attributes={props.attributes} />
        <Show when={scope}>
            <Switch>
                <Match when={definition().viewMode === "grid" || !definition().viewMode}>
                    <GridProvider gridState={{
                        hovering: undefined,
                        // fields: definition().fields
                    }}>
                        <GridView data={data()} attributes={props.attributes} />
                    </GridProvider>
                </Match>
                <Match when={definition().viewMode === "list"}>
                    <ListView data={data()} attributes={props.attributes} />
                </Match>
                <Match when={definition().viewMode === "board"}>
                    <BoardView data={data()} attributes={props.attributes} />
                </Match>
                <Match when={definition().viewMode === "gallery"}>
                    <GalleryView data={data()} attributes={props.attributes} />
                </Match>
            </Switch>

            <Switch>
                <Match when={props.queryResult.data.length === 0}>
                    <div class="sets-codeblock-empty">
                        <div class="sets-codeblock-empty-text">
                            No items found
                        </div>
                    </div>
                </Match>
                <Match when={moreItemsAvailable()}>
                    <div class="sets-codeblock-more clickable-icon"
                        onClick={onMore}
                    >
                        {data().length} of {limitedResults().total}. Click for more.
                    </div>
                </Match>
                <Match when={data().length}>
                    <div class="sets-codeblock-more">
                        {data().length} items
                    </div>
                </Match>
            </Switch>

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
