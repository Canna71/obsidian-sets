import { Component, For, Show, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";

import { ObjectData } from "src/Data/ObjectData";
import { Cell } from "./Cell";
// import { useGrid } from "./GridProvider";
import HeaderRow from "./HeaderRow";
import { useSet } from "./SetProvider";
import needsLink from "src/Utils/needsLink";
import MiniLink from "./MiniLink";


export interface SetViewProps {
    data: ObjectData[];
    attributes: AttributeDefinition[];
}

// TODO: use https://github.com/minht11/solid-virtual-container
// TODO: use https://tanstack.com/table/v8/docs/guide/introduction
const GridView: Component<SetViewProps> = (props) => {
    // const gridContext = useGrid();


    const { definition } = useSet()!;

    // const { state } = gridContext!;
    const fields = () => definition().fields || props.attributes.map(at => (at.key));
    let colSizes = () => {
        let tmp = fields().map(field =>
            definition().grid?.columnWidths?.[field]
            || "minmax(max-content, 200px)"// "minmax(max-content,250px)"
        ).join(" ")

        if (needsLink(props.attributes)) {
            // adds a column for the link
            tmp = "24px " + tmp;
        }

        return tmp;
    }

    // hide grid when there are no fields and no data
    const showGrid = () => {
        return definition().fields && definition().fields?.length || props.data.length;
    }




    let scroller: HTMLDivElement;


    onMount(() => {
        requestAnimationFrame(() => { scroller && scroller.scroll(definition()?.transientState?.scroll || 0, 0); })
    });




    return (
        <Show when={showGrid()}>
            <div

                class="sets-gridview"
            >
                <div class="sets-gridview-scroller sets-view-scroller" ref={scroller!}>
                    <div class="sets-gridview-scrollwrapper">
                        <div class="sets-gridview-table"
                            style={{ "grid-template-columns": colSizes() }}
                        >
                            <HeaderRow attributes={props.attributes} />


                            <div class="sets-gridview-body">


                                <For each={props.data}>{(item, i) =>
                                    <div class="sets-gridview-row" >
                                        <Show when={needsLink(props.attributes)}>
                                            <div class="sets-grid-cell">
                                                <div class="sets-grid-mini-link">
                                                    <MiniLink data={item} />
                                                </div>
                                            </div>
                                        </Show>
                                        <For each={props.attributes}>{
                                            (attribute, i) => <Cell data={item} attribute={attribute} />
                                        }
                                        </For>
                                    </div>
                                }</For>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    );
}

export default GridView;



