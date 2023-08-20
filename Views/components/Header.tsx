import { Component } from "solid-js";

export const Header: Component<{ name: string; }> = (props) => {

    return (<div class="sets-header-cell">
        <div class="sets-cell-content">
            <div>{props.name}</div>
            <div class="sets-column-resizer"></div>
        </div>
    </div>);
};
