import { Component, For, createSignal } from "solid-js";
import { Attribute } from "src/Data/Query";

import { ObjectData } from "src/Data/ObjectData";
import { Cell } from "./Cell";
import { Header } from "./Header";


// TODO: use https://github.com/minht11/solid-virtual-container
// TODO: use https://tanstack.com/table/v8/docs/guide/introduction
const GridView: Component<{ data: ObjectData[], attributes: Attribute[] }> = (props) => {


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [colSizes, setColSizes] = createSignal("200px auto")

    return <div
        class="sets-codeblock sets-gridview"
    >
        <div class="sets-headers-row" style={{ "grid-template-columns": colSizes() }}>
            <For each={props.attributes}>{
                (attribute, i) => <Header name={attribute.displayName || attribute.attribute} />
            }
            </For>
            

        </div>
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
