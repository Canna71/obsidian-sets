import { Component, Show, onMount } from "solid-js";
import { createDraggable } from "@thisbeyond/solid-dnd";
import { CardItem } from "./CardItem";
import { ItemProps } from "./CardItem";
import { setIcon } from "obsidian";
import needsLink from "src/Utils/needsLink";
import MiniLink from "./MiniLink";


export const BoardItem: Component<ItemProps> = (props) => {
    const draggable = createDraggable(props.data.file.path, props.data);

    let grabHandle: HTMLDivElement | null = null;

    onMount(() => {
        if (grabHandle) setIcon(grabHandle, "grip-horizontal");
    });

    return (
        <div class="sets-board-item" use: draggable >
            <div ref={grabHandle!} class="sets-board-item-handle">

            </div>
            <CardItem {...props} />
            <Show when={needsLink(props.attributes)}>
                <div class="sets-board-mini-link">
                    <MiniLink data={props.data} />
                </div>
            </Show>
        </div>
    );
};


