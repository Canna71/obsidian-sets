import { useApp } from "./AppProvider";
import { useSet } from "./SetProvider";
import { Component, For, createSignal, onMount } from "solid-js";
import { PropertyData, getPropertyData } from "src/Data/PropertyData";
import { Property, PropertyProps } from "./Property";
import { DragDropProvider, DragDropSensors, DragOverlay, SortableProvider, closestCenter, createSortable } from "@thisbeyond/solid-dnd";
import { setIcon } from "obsidian";
import { indexBy } from "src/Utils/indexBy";
import { CalculatedModal } from "../CalculatedModal";


export interface FieldSelectProps {
    // selected: FieldDefinition[];
    exit: () => void;
}

const SortableProperty: Component<PropertyProps> = (props) => {
    const sortable = createSortable(props.key, props);

    // onMount(() => {
    //     setIcon(drag, "grip-vertical");
    // })

    // wrap following in a div
    return <div class="sortable-property-wrapper" use: sortable>
        <Property {...props} />
    </div>
}


export const FieldSelect: Component<FieldSelectProps> = (props) => {
    const { definition, save, addField, removeField, reorder, setDefinition } = useSet()!;
    // https://docs.solidjs.com/references/api-reference/stores/using-stores
    // const [state] = createStore(definition() || []);
    const { app } = useApp()!;
    const [keyword, setKeyword] = createSignal("");
    // const [activeItem, setActiveItem] = createSignal<any>(null);

    const onSave = () => {
        save();
        props.exit();
    };

    // const update = () => {

    // };

    const available = () => {
        const pd = getPropertyData(app);
        return pd.filter(pd => !(definition().fields || []).includes(pd.key))
            .filter(pd => pd.name.toLowerCase().includes(keyword().toLowerCase()));
    };

    const selected = ():PropertyData[] => {
        const pd = getPropertyData(app);
        const idxPd = indexBy<PropertyData>("key", pd);
        const ret : PropertyData[] =  (definition().fields || []).map(
            key => {
                const pd = idxPd[key]
                if (pd) return pd;
                const cf = definition().calculatedFields![key];
                if(cf) return {
                    key: key,
                    name: key,
                    typeName: "Calculated",
                    typeIcon: "function-square",
                    typeKey: "func",
                    calculated: true,
                } as PropertyData;
            }
            )
            .filter(pd =>  pd?.name.toLowerCase().includes(keyword().toLowerCase())) as PropertyData[]
            
            ;
        
        return [...ret];
    };

    const onSelect = (e: PropertyData) => {
        addField(e.key);
    }

    const isValidPropName = (key:string) => (name: string) => {
        name = name.trim();
        if (name === "") return false;
        const otherProperties = definition().fields?.filter(k => k !== key) || [];
        if (otherProperties.includes(name)) return false;
        const otherCalculated = Object.keys(definition().calculatedFields || {}).filter(k => k !== key);
        if (otherCalculated.includes(name)) return false;
        return true;
    }

    const onPropertyAction = (e: PropertyData, action?: string, key?: string) => {

        switch (action) {
            case "edit":
                new CalculatedModal(app, [e.key, definition().calculatedFields![e.key]], 
                isValidPropName(e.key),
                (cf) => {
                    const cfs = {...definition().calculatedFields || {}};
                    key && delete cfs[key];
                    const fields = [...definition().fields || []];
                    const idx = fields.indexOf(e.key);
                    if (idx > -1) fields.splice(idx, 1);
                    // insert the new field at the same index
                    fields.splice(idx, 0, cf[0]);
                    // cfs[cf[0]] = cf[1];
                    setDefinition({...definition(), 
                        calculatedFields: {...cfs, [cf[0]]: cf[1]},
                        fields: fields
                    });
                }).open();
            break; 
            case "delete":
                // removes the calculated field
                if (e.calculated) {
                    const cf = {...definition().calculatedFields || {}};
                    delete cf[e.key];
                    setDefinition({...definition(), calculatedFields: cf});
                }
                removeField(e.key);
                break;
            default:
                removeField(e.key);
                break;
        }
    }

    const onDragStart = ({ draggable }) => {
    }

    const onDragEnd = ({ draggable, droppable }) => {
        if (draggable && droppable) {
            if (draggable.id !== droppable.id) {
                // reorderSort(draggable.id, droppable.id);
                reorder(draggable.id, droppable.id, false);
            }
        }

        // setActiveItem(null);
    };

    const addCalculatedField = () => {
        new CalculatedModal(app, ["", ""], isValidPropName(""), (cf) => {
            const cfs = {...definition().calculatedFields || {}};
            cfs[cf[0]] = cf[1];
            // also add it to the fields
            const fields = [...definition().fields || []];
            fields.push(cf[0]);


            setDefinition({...definition(), calculatedFields: cfs,
                fields: fields
            });
        }).open();
    }

    const ids = () => {

        return selected().map(pd => pd.key);
    }

    return (<div class="sets-fields-select">
        <h4>Select Fields</h4>
        <input class="sets-field-search"
            value={keyword()}
            type="search"
            placeholder="Search for a property"
            onInput={(e) => {
                setKeyword(e.target.value)
            }}></input>
        <div class="sets-fields-columns">
            <div class="sets-fields-column">
                <div class="sets-fields-label">Available:</div>

                <div class="sets-fields-list available-props">
                    <For each={available()}>{(pd) => <Property {...pd} icon="toggle-left" onIconClick={onSelect} />}</For>
                </div>
            </div>
            <div class="sets-fields-column">
                <div class="sets-fields-label">Visible:</div>
                <div class="sets-fields-list selected-props">
                    <DragDropProvider
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        collisionDetector={closestCenter}
                    >
                        <DragDropSensors />
                        <SortableProvider ids={ids()}>
                            <For each={selected()}>{(pd,index) => <SortableProperty  {...pd} icon="toggle-right" onIconClick={(e,action) => onPropertyAction(e, action,pd.key)} />}</For>
                        </SortableProvider>

                    </DragDropProvider>
                </div>
                <div class="clickable-icon" onClick={addCalculatedField}>Add Calc</div>
            </div>
        </div>


        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>


    </div>);
};
