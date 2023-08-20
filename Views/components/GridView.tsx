import { Component, For, createSignal } from "solid-js";
import { Attribute, getAttribute } from "src/Query";
import { ObjectData } from "src/main";

const Header: Component<{ name: string }> = (props) => {

    return (<div class="sets-header-cell" >
        <div class="sets-cell-content">
            <div>{props.name}</div>
            <div class="sets-column-resizer"></div>
        </div>
    </div>);
}

const Cell: Component<{data: ObjectData, attribute:Attribute }> = (props) => {

    const value = () => getAttribute(props.data, props.attribute) as any;
    
    return (<div class="sets-grid-cell" >
        <div class="sets-cell-content">
            <div>{value()}</div>
            
        </div>
    </div>);
}

// TODO: use https://github.com/minht11/solid-virtual-container
// TODO: use https://tanstack.com/table/v8/docs/guide/introduction
const GridView: Component<{ data: ObjectData[], attributes: Attribute[] }> = (props) => {


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
