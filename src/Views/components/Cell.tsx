import { Component, Show } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import { EditProp } from "./EditProp";
import clickOutside from "./clickoutside";
import FileName from "./FileName";

false && clickOutside;

export const Cell: Component<{ data: ObjectData; attribute: AttributeDefinition; }> = (props) => {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // const value = () => getAttribute(props.data, props.attribute) as any;

    // const value = () => props.attribute.getValue(props.data);
    const text = () => props.attribute.format(props.data);

  

    return (<div class="sets-grid-cell" >
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
    </div>);
};
