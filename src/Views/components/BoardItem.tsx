import { Component, For, Show } from "solid-js";
import { EditProp } from "./EditProp";
import FileName from "./FileName";
import { createDraggable } from "@thisbeyond/solid-dnd";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";


export const BoardItem: Component<BoardItemProps> = (props) => {
    const draggable = createDraggable(props.data.file.path, props.data);
    const { data } = props;

    return (
        <div class="sets-board-item" use: draggable>
            <For each={props.attributes}>{(attribute, i) => <div class="sets-board-item-field" title={attribute.displayName()}>
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
            </div>}</For>
        </div>
    );
};

export type BoardItemProps = {
    attributes: AttributeDefinition[];
    data: ObjectData;
};

