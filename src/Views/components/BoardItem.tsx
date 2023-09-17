import { Component, onMount } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import { CardItem } from "./CardItem";
import { ItemProps } from "./CardItem";
import { setIcon } from "obsidian";


export const BoardItem: Component<ItemProps> = (props) => {
    const draggable = createDraggable(props.data.file.path, props.data);

    let grabHandle: HTMLDivElement | null = null;

    onMount(() => {
        if(grabHandle) setIcon(grabHandle, "grip-horizontal");
    });

    return (
        <div class="sets-board-item" use: draggable >
            <div ref={grabHandle!} class="sets-board-item-handle">

            </div>
            <CardItem {...props} />
        </div>
    );
};


