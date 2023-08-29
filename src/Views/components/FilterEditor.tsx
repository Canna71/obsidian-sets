import { Component, Show, createEffect, createSignal, onMount } from "solid-js";
import { useApp } from "./AppProvider";
import { AttributeModal, PropertyData } from "./AttributeModal";
import { Operator, getOperatorsForType } from "src/Data/Operator";
import { Clause } from "src/Data/Query";
import { DropdownComponent } from "obsidian";
import { mapBy } from "src/Utils/indexBy";

export const FilterEditor: Component = (props) => {

    const app = useApp();

    const [prop, setProp] = createSignal<PropertyData>();
    const [operators, setOperators] = createSignal([] as Operator[]);

    let ddOps: HTMLDivElement;

    // app.metadataTypeManager.properties
    const addClause = (e: MouseEvent) => {
        const am = new AttributeModal(app!,(pd:PropertyData)=>{
            const key = pd.typeIcon;
            const type = pd.typeKey;
            const _ops = getOperatorsForType(type);
            setOperators(_ops);
            setProp(pd)
        });
        am.open();
    };

    const ddlIsVisible = () => {
        return prop() !== undefined;
    }

    createEffect(()=>{
        if(ddlIsVisible()){
            const options = mapBy("op", operators(), op=>op.displayName())
            ddOps.empty()
            new DropdownComponent(ddOps).addOptions(options)
        }
    })

    // const updateDDc= ((ref)=>{
    //     const options = mapBy("op", operators(), op=>op.displayName())
    //     new DropdownComponent(ref).addOptions(options)
    // })

    return (
        <div>
            <h3>Filter Editor</h3>
            <div>TODO: list existing clauses</div>
            <div class="metadata-property">
                <Show when={prop()}>
                    <input type="text" class="metadata-property-key" onClick={addClause} readOnly value={prop()?.name}></input>
                </Show>
                <Show when={prop() && operators().length}>
                    {/* <div ref={ref => updateDDc(ref)}></div> */}
                    <div ref={ddOps!}></div>
                </Show>
            </div>
            <div><button onClick={addClause}>Add Clause</button></div>
        </div>
    );
};
