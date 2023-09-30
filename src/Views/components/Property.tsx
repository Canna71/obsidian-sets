import { setIcon } from "obsidian";
import { Component, Match, Show, Switch, onMount } from "solid-js";
import { PropertyData } from "src/Data/PropertyData";

export type PropertyProps = PropertyData & {
    icon?:string
    onItemClick?: (e:PropertyData, action?: string) => void
    onIconClick?: (e:PropertyData, action?: string, key?: string) => void
    sortable?:  boolean;
}

export const Property: Component<PropertyProps> = (props) => {

    let typeicon:HTMLDivElement;
    let toggleicon:HTMLDivElement;
    let editIcon:HTMLDivElement;
    let deleteIcon:HTMLDivElement;

    onMount(()=>{
        typeicon && setIcon(typeicon, props.typeIcon || "file-question");
        editIcon && setIcon(editIcon, "pencil");
        deleteIcon && setIcon(deleteIcon, "cross");
        props.icon && toggleicon && setIcon(toggleicon, props.icon);
    })

    const onClick = (e:MouseEvent) => {
        props.onItemClick && props.onItemClick(
            props
        )
    }

    const onIconClick = (e:MouseEvent, action?:string) => {
        e.stopPropagation();
        
        if(props.onIconClick) props.onIconClick(props, action) 
        else {
            props.onItemClick && props.onItemClick(props, action)
        }
    }

    return <div class="sets-field-item" onClick={onClick}>
        
        
            <div ref={typeicon!} class="sets-field-property-icon"></div>
            <div class="sets-field-property-name">{props.name}</div>
            {/* <div class="sets-field-type-name">{props.typeName || "unknown"}</div> */}
            <Switch>
                <Match when={props.calculated}>
                <div ref={editIcon!} 
                        onClick={(e)=>onIconClick(e,"edit")}
                        class="sets-field-property-toggle clickable-icon" ></div>
                 <div ref={deleteIcon!} 
                        onClick={(e)=>onIconClick(e,"delete")}
                        class="sets-field-property-toggle clickable-icon" ></div>
                </Match>
                <Match when={props.icon}>
                    <div ref={toggleicon!} 
                        onClick={onIconClick}
                        class="sets-field-property-toggle clickable-icon" ></div>
                </Match>
            </Switch>
    </div>;
};
