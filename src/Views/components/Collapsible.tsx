import { setIcon } from "obsidian";
import { Component, JSX, Show, createSignal, onMount } from "solid-js";

export type CollapsibleProps = {
    title: string,
    isCollapsed?: boolean,
    children?: JSX.Element,
    onToggle?: (status:boolean) => void
}

// implements a solidjs collapsible component
// with a title and a content taken by props
const Collapsible: Component<CollapsibleProps> = (props) => {

    let collapse: HTMLDivElement;
    const [collapsed, setCollapsed] = createSignal(!!props.isCollapsed);

    onMount(() => {
        // setIcon(collapse, "chevron-down");
        setIcon(collapse, "right-triangle");

    });


    const onToggle = () => {
        const newState = !collapsed();
        setCollapsed(newState);
        props.onToggle && props.onToggle(newState);
    }

    return (
        <div class="sets-collapsible">


            <div class="sets-collapsible-header" onClick={onToggle}>
                <div ref={collapse!} class=" collapse-icon "
                    classList={{
                        "is-collapsed": collapsed()
                    }}
                ></div>
                <div class="sets-collapsible-title">
                    {props.title}
                </div>
            </div>
            <Show when={!collapsed()}>
                <div class="sets-collapsible-content">
                    {props.children}
                </div>
            </Show>
        </div>
    );

}

export default Collapsible;
