import { Component, For, Show } from "solid-js";
import { EditProp } from "./EditProp";
import FileName from "./FileName";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";

export type ItemProps = {
    attributes: AttributeDefinition[];
    data: ObjectData;
};

export const CardItem: Component<ItemProps> = (props) => {
    const { data } = props;

    return (
        <For each={props.attributes}>{(attribute, i) => <div class="sets-item-field" title={attribute.displayName()}>
            {/* <AttributeView attribute={attribute} data={item} /> */}
            <Show when={attribute.readonly}>
                <div class="sets-cell-read">{attribute.format(data)}</div>
            </Show>
            <Show when={!attribute.isIntrinsic}>

                <div class="sets-view-field">
                    <EditProp data={data} attribute={attribute} />
                </div>
            </Show>
            <Show when={attribute.isIntrinsic && !attribute.readonly}>
                <div class="sets-view-field">
                    <FileName data={data} attribute={attribute} />
                </div>
            </Show>
        </div>}
        </For>);
};



