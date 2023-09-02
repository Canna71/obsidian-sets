import { setIcon } from "obsidian";
import { Component, Show, onMount } from "solid-js";
import { PropertyData } from "src/Data/PropertyData";

export type PropertyProps = PropertyData & {
    icon?:string
    onItemClick?: (e:PropertyData) => void
    onIconClick?: (e:PropertyData) => void
    sortable?:  boolean;
}

export const Property: Component<PropertyProps> = (props) => {

    let typeicon:HTMLDivElement;
    let toggleicon:HTMLDivElement;

    onMount(()=>{
        setIcon(typeicon, props.typeIcon || "help-circle");
        props.icon && setIcon(toggleicon, props.icon);
    })

    const onClick = (e:MouseEvent) => {
        props.onItemClick && props.onItemClick(
            props
        )
    }

    const onIconClick = (e:MouseEvent) => {
        if(props.onIconClick) props.onIconClick(props) 
        else {
            props.onItemClick && props.onItemClick(props)
        }
    }

    return <div class="sets-field-item" onClick={onClick}>
        
        
            <div ref={typeicon!} class="sets-field-property-icon"></div>
            <div class="sets-field-property-name">{props.name}</div>
            {/* <div class="sets-field-type-name">{props.typeName || "unknown"}</div> */}
            <Show when={props.icon}>
                <div ref={toggleicon!} 
                    onClick={onIconClick}
                    class="sets-field-property-toggle clickable-icon" ></div>
            </Show>
        
    </div>;
};
