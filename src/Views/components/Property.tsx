import { setIcon } from "obsidian";
import { Component, onMount } from "solid-js";
import { PropertyData } from "src/Data/PropertyData";

export type PropertyProps = PropertyData & {
    icon:string
    onClick: (e:PropertyData) => void
}

export const Property: Component<PropertyProps> = (props) => {

    let typeicon:HTMLDivElement;
    let toggleicon:HTMLDivElement;

    onMount(()=>{
        setIcon(typeicon, props.typeIcon || "help-circle");
        setIcon(toggleicon, props.icon);
    })

    const onClick = (e:MouseEvent) => {
        props.onClick && props.onClick(
            props
        )
    }

    return <div class="sets-field-item">
        
        
            <div ref={typeicon!} class="sets-field-property-icon"></div>
            <div class="sets-field-property-name">{props.name}</div>
            {/* <div class="sets-field-type-name">{props.typeName || "unknown"}</div> */}
            <div ref={toggleicon!} class="sets-field-property-toggle clickable-icon" onClick={onClick}></div>
        
    </div>;
};
