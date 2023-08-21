import { Component, Show, createSignal } from "solid-js";
import {  AttributeDefinition, getAttribute } from "src/Data/Query";
import { ObjectData } from "src/Data/ObjectData";
import { EditProp } from "./EditProp";
import clickOutside from "./clickoutside";

false && clickOutside;

export const Cell: Component<{ data: ObjectData; attribute: AttributeDefinition; }> = (props) => {
    const [isEdit, setEdit] = createSignal(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = () => getAttribute(props.data, props.attribute) as any;

    const onClick = (e: MouseEvent) => {
        if (!isEdit()) setEdit(true);
    };

    const exitEdit = () => {
        setEdit(false);
    };

    return (<div class="sets-grid-cell" onClick={onClick}>
        <div class="sets-cell-content">
            <Show when={isEdit()}
                fallback={<div class="sets-cell-read">{value()}</div>}
            >
                <div class="sets-cell-edit" use:clickOutside={exitEdit}>
                    <EditProp data={props.data} attribute={props.attribute} />

                </div>
            </Show>

        </div>
    </div>);
};
