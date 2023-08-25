import { Component, For } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";

import { ObjectData } from "src/Data/ObjectData";
import { Cell } from "./Cell";
import { Header } from "./Header";
import { useGrid } from "./GridProvider";
import { DragDropProvider, DragDropSensors } from "@thisbeyond/solid-dnd";
import HeaderRow from "./HeaderRow";


// TODO: use https://github.com/minht11/solid-virtual-container
// TODO: use https://tanstack.com/table/v8/docs/guide/introduction
const GridView: Component<{ data: ObjectData[], attributes: AttributeDefinition[] }> = (props) => {
    const gridContext = useGrid();
    const { state } = gridContext!;
    const fields = () => state().fields!;
    const colSizes = () => {
        return fields().map(field =>
            field.width || "200px" 
        ).join(" ")
    }

    // const orderedAttributes = () => {
    //     return fields().map(field => props.attributes.find(att => att.key === field.key)!);
    // }
    // const autoSize = attributes.map(attr => "200px").join(" ")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
   

    return <div
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



