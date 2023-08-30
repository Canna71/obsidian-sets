import { Component, Show, createEffect, createSignal } from "solid-js";
import { useApp } from "./AppProvider";
import { AttributeModal, PropertyData } from "./AttributeModal";
import { Operator, getOperatorsForType } from "src/Data/Operator";
import { DropdownComponent } from "obsidian";
import { mapBy } from "src/Utils/indexBy";
import { VaultDB } from "src/Data/VaultDB";

export interface FilterEditorProps {
    db: VaultDB
}

export const FilterEditor: Component<FilterEditorProps> = (props) => {

    const app = useApp();

    const [prop, setProp] = createSignal<PropertyData>();
    const [operators, setOperators] = createSignal([] as Operator[]);
    const [operator, setOperator] = createSignal<Operator>();
    const [val, setVal] = createSignal<any>();

    let ddOps: HTMLDivElement;
    let divValue: HTMLDivElement;

    // app.metadataTypeManager.properties
    const addClause = (e: MouseEvent) => {
        const am = new AttributeModal(app!,(pd:PropertyData)=>{
            const key = pd.typeIcon;
            const type = pd.typeKey;
            const _ops = getOperatorsForType(type);
            setOperators(_ops);
            setProp(pd);
            setOperator(_ops[0]);
            const attr = props.db.getAttributeDefinition(prop()?.typeKey || "text");
            const widget = attr.getPropertyWidget();

            widget && setVal(widget?.default());
        });
        am.open();
    };

    const ddlIsVisible = () => {
        return prop() !== undefined;
    }

    const divValueIsVisible = () => {
        return operator() !== undefined && !operator()?.isUnary;
    }

    createEffect(()=>{
        if(ddlIsVisible()){
            const options = mapBy("op", operators(), op=>op.displayName())
            ddOps.empty()
            new DropdownComponent(ddOps)
            .addOptions(options)
            .onChange((value:string)=>{
                setOperator(operators().find(op => op.op === value)!);
            })
            .setValue(operator()?.op || operators()[0].op)
        }
    })

    createEffect(()=>{
        if(divValueIsVisible()) {
            if(!prop()?.name) return;
            const attr = props.db.getAttributeDefinition(prop()!.name);
            const widget = attr.getPropertyWidget();
            if(widget){
                divValue.empty();
                widget.render(divValue!,
                  {key: prop()?.name,
                    type: prop()?.typeKey,
                    value: val()
                },
                {
                    app,
                    key: prop()?.name,
                    onChange: (val) => {
                        setVal(val);
                    },
                    rerender: () => {
                        console.log(`re-render called`);
                    },
                    sourcePath: "/",
                    blur: () => {
                        console.log(`blur called`);
                    },
                    metadataEditor: null
                }
                );
            }
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
                <Show when={ddlIsVisible()}>
                    {/* <div ref={ref => updateDDc(ref)}></div> */}
                    <div ref={ddOps!}></div>
                </Show>
                <Show when={divValueIsVisible()} >
                    <div class="metadata-property-value" ref={divValue!}></div>
                </Show>
            </div>
            <div><button onClick={addClause}>Add Clause</button></div>
        </div>
    );
};
