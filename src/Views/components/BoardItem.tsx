import { Component } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import { CardItem } from "./CardItem";
import { ItemProps } from "./CardItem";


export const BoardItem: Component<ItemProps> = (props) => {
    const draggable = createDraggable(props.data.file.path, props.data);

    return (
        <div class="sets-board-item" use: draggable>
            <CardItem {...props} />
        </div>
    );
};


