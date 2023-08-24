import { Component } from "solid-js";
import { useGrid } from "./GridProvider";

export const Header: Component<{ name: string; key: string; }> = (props) => {
    const gridContext = useGrid();
    const { state, onHover, onExit, shift } = gridContext!;

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
    const drag = (e:DragEvent) => {
        e.dataTransfer?.setData("text", props.key);
    }

    const allowDrop = (e:DragEvent) => {
        
        const data = e.dataTransfer?.getData("text");
        console.log(`allowDrop`, data);
        if(data !== props.key){
            e.preventDefault();
        }
    }

    const drop = (e:DragEvent) => {
        const data = e.dataTransfer?.getData("text");
        console.log(`drop`, data);
        e.preventDefault();
        data && shift(data, props.key)
    }

    return (<div class="sets-header-cell"
        draggable={true}
        classList={{
            hovered: isHovering()
        }}
        ondragover={allowDrop}
        ondragstart={drag}
        onmouseover={onMouseOver} 
        onmouseleave={onMouseLeave}
        ondrop={drop}
        >
        <div class="sets-cell-content">
            <div>{props.name}</div>
            <div class="sets-column-resizer"></div>
        </div>
    </div>);
};
