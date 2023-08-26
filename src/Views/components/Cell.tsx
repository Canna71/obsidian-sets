import { Component, Show } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import { EditProp } from "./EditProp";
import clickOutside from "./clickoutside";
import FileName from "./FileName"; 
import { useGrid } from "./GridProvider";

false && clickOutside;

export const Cell: Component<{ data: ObjectData; attribute: AttributeDefinition; }> = (props) => {
    
    const gridContext = useGrid();

    const {state} = gridContext!;

    const isHovering = () => {
        return state?.().hovering === props.attribute.key;
    }
    const text = () => props.attribute.format(props.data);

  

    return (<td class="sets-grid-cell" 
                classList={{
                    "hovered": isHovering()
                }}
            >
        <div classList={
            {
                "sets-cell-content": true,
                "editable": !props.attribute.readonly
            }
            
            }>
            <Show when={props.attribute.readonly}>
               <div class="sets-cell-read">{text()}</div>
            </Show>
            <Show when={!props.attribute.isIntrinsic}>
                <EditProp data={props.data} attribute={props.attribute} />
            </Show>
            <Show when={props.attribute.isIntrinsic && !props.attribute.readonly}>
                <FileName data={props.data} attribute={props.attribute} />
            </Show>
            
        </div>
    </td>);
};
