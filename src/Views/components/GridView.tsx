import { Component, For, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";

import { ObjectData } from "src/Data/ObjectData";
import { Cell } from "./Cell";
import { useGrid } from "./GridProvider";
import HeaderRow from "./HeaderRow";
import { useBlock } from "./BlockProvider";


// TODO: use https://github.com/minht11/solid-virtual-container
// TODO: use https://tanstack.com/table/v8/docs/guide/introduction
const GridView: Component<{ data: ObjectData[], attributes: AttributeDefinition[] }> = (props) => {
    const gridContext = useGrid();


    const {definition} = useBlock()!;

    const { state } = gridContext!;
    const fields = () => state().fields!;
    const colSizes = () => {
        return fields().map(field =>
            field.width || "200px" 
        ).join(" ")
    }
    let div:HTMLDivElement;

    // const orderedAttributes = () => {
    //     return fields().map(field => props.attributes.find(att => att.key === field.key)!);
    // }
    // const autoSize = attributes.map(attr => "200px").join(" ")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
   
    onMount(() => {
        // div.scrollLeft = definition().scroll || 0;
        //TODO: get saved scroll position from somewhere
        requestAnimationFrame(()=>{div.scroll(definition()?.transientState?.scroll || 0, 0);})
        // console.log(ctx.)
    });

    return <div ref={div!}
        class="sets-codeblock sets-gridview"
       
    >
        
       <HeaderRow colSizes={colSizes()} attributes={props.attributes} />
        
        
        <div class="sets-gridview-body">
                <div class="sets-gridview-grid" >
                    <For each={props.data}>{(item, i) =>
                        <div class="sets-gridview-row" style={{ "grid-template-columns": colSizes() }}>
                            <For each={props.attributes}>{
                                (attribute, i) => <Cell data={item} attribute={attribute} />
                            }
                            </For>
                        </div>
                    }</For>
                </div>
            </div>
    </div>
}

export default GridView;



