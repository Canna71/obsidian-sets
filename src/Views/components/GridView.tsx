import { Component, For, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";

import { ObjectData } from "src/Data/ObjectData";
import { Cell } from "./Cell";
// import { useGrid } from "./GridProvider";
import HeaderRow from "./HeaderRow";
import { useBlock } from "./SetProvider";


export interface SetViewProps {
    data: ObjectData[];
    attributes: AttributeDefinition[];
}

// TODO: use https://github.com/minht11/solid-virtual-container
// TODO: use https://tanstack.com/table/v8/docs/guide/introduction
const GridView: Component<SetViewProps> = (props) => {
    // const gridContext = useGrid();


    const { definition } = useBlock()!;

    // const { state } = gridContext!;
    const fields = () => definition().fields || props.attributes.map(at => (at.key));
    const colSizes = () => {
        return fields().map(field =>
            definition().grid?.columnWidths?.[field]
             || "minmax(max-content, 200px)"// "minmax(max-content,250px)"
        ).join(" ")
    }
    let scroller: HTMLDivElement;


    onMount(() => {
        requestAnimationFrame(() => { scroller.scroll(definition()?.transientState?.scroll || 0, 0); })
    });

   


    return (
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
        </div>);
}

export default GridView;



