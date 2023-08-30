import { Accessor, Component, Setter, Show, createEffect, createSignal } from "solid-js";
import { useApp } from "./AppProvider";
import { AttributeModal } from "./AttributeModal";
import { OperatorName, getOperatorById, getOperatorsForType } from "src/Data/Operator";
import { DropdownComponent, setIcon } from "obsidian";
import { mapBy } from "src/Utils/indexBy";
import { VaultDB } from "src/Data/VaultDB";
import { Clause } from "src/Data/Query";
import { PropertyData, getPropertyData } from "src/Data/PropertyData";

export interface ClauseEditorProps {
    db: VaultDB,
    clause: Accessor<Clause>
    update: Setter<Clause>
}

export const ClauseEditor: Component<ClauseEditorProps> = (props) => {

    const app = useApp();

    const propertyData = () => {
        const pds = getPropertyData(app!);
        const pd = pds.find(p => p.name === props.clause()[0]);
        return pd;
    }

    const operators = () => {
        
        const type = prop()?.typeKey;
        if(!type) return [];
        return getOperatorsForType(type);
    }

    const getOperator = () => {
        return getOperatorById(props.clause()[1]);
    }

    const [prop, setProp] = createSignal(propertyData());
    // const [operators, setOperators] = createSignal(getOperators());
    // const [operator, setOperator] = createSignal<Operator>(getOperator());
    // const [val, setVal] = createSignal<any>(props.clause()[2]);

    let spanIcon: HTMLSpanElement;
    let ddOps: HTMLDivElement;
    let divValue: HTMLDivElement;

    // app.metadataTypeManager.properties
    const onClickProp = (e: MouseEvent) => {
        const am = new AttributeModal(app!,(pd:PropertyData)=>{
            // const type = pd.typeKey;
            // const _ops = getOperatorsForType(type);
            // setOperators(_ops);
            setProp(pd);
            // setOperator(_ops[0]);
            const attr = props.db.getAttributeDefinition(prop()?.typeKey || "text");
            const widget = attr.getPropertyWidget();
            const op = operators()[0].op
            // widget && setVal(widget?.default());
            widget && props.update(clause => [pd.name,op,widget?.default()])
        });
        am.open();
    };

    const operatorsSelectIsVisible = () => {
        return prop() !== undefined;
    }

    const divValueIsVisible = () => {
        return props.clause()[1] !== undefined && !getOperator()?.isUnary;
    }

    createEffect(()=>{
        const p = prop();
        if(p){
            const icon = p.typeIcon;
            setIcon(spanIcon, icon || "help-circle")
        }
    })

    createEffect(()=>{
        if(operatorsSelectIsVisible()){
            const options = mapBy("op", operators(), op=>op.displayName())
            ddOps.empty()
            new DropdownComponent(ddOps)
            .addOptions(options)
            .onChange((value:string)=>{
                // TODO: check if we should reset the value
                props.update(clause => [clause[0], value as OperatorName, clause[2]])
                // setOperator(operators().find(op => op.op === value)!);
            })
            .setValue(props.clause()[1] || operators()[0].op)
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
                    value: props.clause()[2] || widget.default()
                },
                {
                    app,
                    key: prop()?.name,
                    onChange: (val) => {
                        props.update(clause => [clause[0], clause[1], val])
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

            <div class="metadata-property">
                <Show when={prop()}>
                    <span ref={spanIcon!} class="metadata-property-icon"></span>
                    <input type="text" class="metadata-property-key" onClick={onClickProp} readOnly value={prop()?.name}></input>
                </Show>
                <Show when={operatorsSelectIsVisible()}>
                    {/* <div ref={ref => updateDDc(ref)}></div> */}
                    <div ref={ddOps!}></div>
                </Show>
                <Show when={divValueIsVisible()} >
                    <div class="metadata-property-value" ref={divValue!}></div>
                </Show>
            </div>


    );
};

export default ClauseEditor;
