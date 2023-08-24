import { Component } from "solid-js";
import { useGrid } from "./GridProvider";

export const Header: Component<{ name: string; key: string; }> = (props) => {
    const gridContext = useGrid();

    const {state, onHover,onExit} = gridContext!;

    const onMouseOver = (e) => {
        if(gridContext !== undefined){
            
            onHover(props.key);
        }
    }

    const onMouseLeave = (e) => {
        if(gridContext !== undefined){
            onExit();
        }
    }

    const isHovering = () => {
        return state?.().hovering === props.key;
    }

    return (<div class="sets-header-cell" 
        classList={{
            hovered: isHovering()
        }}
    onmouseover={onMouseOver} onmouseleave={onMouseLeave}>
        <div class="sets-cell-content">
            <div>{props.name}</div>
            <div class="sets-column-resizer"></div>
        </div>
    </div>);
};
