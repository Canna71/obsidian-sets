import { Component } from "solid-js";
import { useGrid } from "./GridProvider";
import {
   
    createSortable,
} from "@thisbeyond/solid-dnd";

export const Header: Component<{ name: string; key: string; }> = (props) => {
    const gridContext = useGrid();
    const { state, onHover, onExit } = gridContext!;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sortable = createSortable(props.key);

    const onMouseOver = (e) => {
        if (gridContext !== undefined) {

            onHover(props.key);
        }
    }

    const onMouseLeave = (e) => {
        if (gridContext !== undefined) {
            onExit();
        }
    }

    const isHovering = () => {
        return state?.().hovering === props.key;
    }


    return (

            <div class="sets-header-cell"
                classList={{
                    hovered: isHovering()
                }}
                // use: draggable
                use:sortable
                onmouseover={onMouseOver}
                onmouseleave={onMouseLeave}

            >
                <div class="sets-header-cell-content">
                    <div class="sets-column-name">{props.name}</div>
                    <div class="sets-column-resizer">&nbsp;</div>
                </div>
            </div>
        );
};
