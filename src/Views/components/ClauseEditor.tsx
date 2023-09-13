import { Component, Show, createEffect, createSignal, onMount } from "solid-js";
import { useApp } from "./AppProvider";
import { AttributeModal } from "./AttributeModal";
import { OperatorName, getOperatorById, getOperatorsForType } from "src/Data/Operator";
import { DropdownComponent, setIcon } from "obsidian";
import { mapBy } from "src/Utils/indexBy";
import { PropertyData, getPropertyData } from "src/Data/PropertyData";
import { getDynamicValuesForType, isDynamic } from "src/Data/DynamicValues";
import { Clause } from "./SetDefinition";

export interface ClauseEditorProps {
    // db: VaultDB,
    clause: Clause
    update: (clause: Clause) => void
    remove: () => void
}

export const ClauseEditor: Component<ClauseEditorProps> = (props) => {

    const {app, db} = useApp()!;

    const propertyData = () => {
        const pds = getPropertyData(app!);
        const pd = pds.find(p => p.key === props.clause[0]);
        return pd;
    }

    const operators = () => {
        
        const type = prop()?.typeKey;
        if(!type) return [];
        return getOperatorsForType(type);
    }

    const getOperator = () => {
        return getOperatorById(props.clause[1]);
    }

    const [prop, setProp] = createSignal(propertyData());
    // const [operators, setOperators] = createSignal(getOperators());
    // const [operator, setOperator] = createSignal<Operator>(getOperator());
    // const [val, setVal] = createSignal<any>(props.clause()[2]);

    const dynamicValues = () => {
        if(prop()?.typeKey){
            const dv = getDynamicValuesForType(prop()!.typeKey)
            return dv;
        }
        return [];
    }

    let spanIcon: HTMLSpanElement;
    let ddOps: HTMLDivElement;
    let ddDynamicValues: HTMLDivElement;
    let divValue: HTMLDivElement;
    let btnDelete: HTMLDivElement;

    onMount(()=>{
        setIcon(btnDelete, "x");
    })

    // app.metadataTypeManager.properties
    const onClickProp = (e: MouseEvent) => {
        const am = new AttributeModal(app!,(pd:PropertyData)=>{
            // const type = pd.typeKey;
            // setOperators(_ops);
            // setProp(pd); 
            // setOperator(_ops[0]);
            const attr = db.getAttributeDefinition(pd.key);
            const widget = attr.getPropertyWidget();
            const _ops = getOperatorsForType(pd.typeKey);
            const op = _ops[0].op;
            // widget && setVal(widget?.default());
            widget && props.update([pd.key,op,widget?.default()]);
            setProp(pd);

        });
        am.open();
    };

    const operatorsSelectIsVisible = () => {
        return prop() !== undefined;
    }

    const divValueIsVisible = () => {
        if(getOperator()?.isUnary) return false;
        if(dynamicValues().length === 0) return true;
        if(typeof props.clause[2] === "string" && isDynamic(props.clause[2])) return false;
        return true;
        // return props.clause[1] !== undefined 
    }

    

    createEffect(()=>{
        const p = prop();
        if(p){
            const icon = p.typeIcon;
            setIcon(spanIcon, icon || "file-question")
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
                props.update([props.clause[0], value as OperatorName, props.clause[2]])
                // setOperator(operators().find(op => op.op === value)!);
            })
            .setValue(props.clause[1] || operators[0].op)
        }
    })

    const ddlDynamicValuesIsVisible = () => {
        return (dynamicValues().length > 0) && (!getOperator()?.isUnary);
    }

    createEffect(()=>{
        if(ddlDynamicValuesIsVisible()){
            const options = mapBy("id", dynamicValues(), dv=>dv.displayName())
            options[""] = "Value:"
            ddDynamicValues.empty();
            let currentValue;
            if(props.clause[2] !== undefined && isDynamic(props.clause[2])) {
                currentValue = props.clause[2];
            } else {
                currentValue = ""
            }
            // const currentValue = isDynamic(props.clause[2]) ? props.clause[2]  !== undefined ? props.clause[2] : dynamicValues()[0].id
        
            new DropdownComponent(ddDynamicValues)
            .addOptions(options)
            .onChange((value:string)=>{
                // TODO: check if we should reset the value
                props.update([props.clause[0], props.clause[1], value])
                // setOperator(operators().find(op => op.op === value)!);
            })
            .setValue(currentValue)
        }
    })

    createEffect(()=>{
        if(divValueIsVisible()) {
            if(!prop()?.key) return;
            const attr = db.getAttributeDefinition(prop()!.key);
            const widget = attr.getPropertyWidget();
            if(widget){
                divValue.empty();
                widget.render(divValue!,
                  {key: prop()?.key,
                    type: prop()?.typeKey,
                    value: props.clause[2] || widget.default()
                },
                {
                    app,
                    key: prop()?.key,
                    onChange: (val) => {
                        props.update([props.clause[0], props.clause[1], val])
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

    const onDelete = () => {
        props.remove();
    }

    return (

            <div class="sets-clause">
                <Show when={prop()}>
                    <span ref={spanIcon!} class="metadata-property-icon"></span>
                    <input type="text" class="metadata-property-key" onClick={onClickProp} readOnly value={prop()?.name}></input>
                </Show>
                <Show when={operatorsSelectIsVisible()}>
                    {/* <div ref={ref => updateDDc(ref)}></div> */}
                    <div ref={ddOps!}></div>
                </Show>
                <Show when={ddlDynamicValuesIsVisible()}>
                    {/* <div ref={ref => updateDDc(ref)}></div> */}
                    <div ref={ddDynamicValues!}></div>
                </Show>
                <Show when={divValueIsVisible()} >
                    <div class="metadata-property-value" ref={divValue!}></div>
                </Show>
                <div ref={btnDelete!} onClick={onDelete} class="clickable-icon"></div>
            </div>


    );
};

export default ClauseEditor;
