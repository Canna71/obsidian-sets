
import { createSignal, createContext, useContext, JSX, Accessor } from "solid-js";
import {  SetDefinition } from "./renderCodeBlock";
import { AttributeKey, SortField } from "src/Data/Query";



export interface BlockStateContext {
    definition: Accessor<SetDefinition>;
    reorder: (from: string, to: string) => void;
    // updateFields: (fields: FieldDefinition[]) => void;
    updateSize: (field: string, size?: string) => void;
    setDefinition: (def:SetDefinition) => void;
    addField: (field:string) => void;
    removeField: (field:string) => void;
    setSortDirection: (field: string, deseending:boolean) => void;
    addSort: (field: string, deseending:boolean) => void;

    removeSort: (field: string) => void;
    save: () => void;
}
const BlockContext = createContext<BlockStateContext>();



export function BlockProvider(props: { setDefinition: SetDefinition, updateDefinition: (definition: SetDefinition)=>void, children?: JSX.Element }) {

    const [definition, setState] = createSignal(props.setDefinition);
    const blockState = {
        definition,
        reorder: (from: string, to: string) => {
            const updatedItems = definition().fields?.slice();
            if(!updatedItems) throw Error("No items to reoreder!")
            const ids = updatedItems;
            const fromIndex = ids?.indexOf(from);
            const toIndex = ids?.indexOf(to);
            if (updatedItems) {
                updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
            }
            const newDef = {...definition(), fields: updatedItems}
            props.updateDefinition(newDef)
            // setItems(updatedItems);
        }, 
        // updateFields: (fields: FieldDefinition[]) => {
        //     console.log(`updateFields`, fields)
        //     setState(state => ({...state, fields}))
        // },
        addField: (field: string) => {
            setState(state => ({
                ...state,
                fields: state.fields?.includes(field) ? state.fields : [...state.fields || [], field]
            }))
        },
        removeField: (field: string) => {
            setState(state => ({
                ...state,
                fields: state.fields?.filter(f=>f!==field)
            }))
        },
        setSortDirection: (field: AttributeKey, descending:boolean) => {
            setState(state => ({
                ...state,
                sortby: [...(state.sortby||[]).map(s => s[0] === field ? [field, descending] as SortField : s) ]
            }))
        },
        addSort: (field: AttributeKey, descending:boolean) => {
            setState(state => ({
                ...state,
                sortby: [...(state.sortby||[]).filter(([f])=>f!==field), [field, descending] ]
            }))
        },
        removeSort: (field: string) => {
            setState(state => ({
                ...state,
                sortby: [...(state.sortby||[]).filter(([f])=>f!==field) ]
            }))
        },
        updateSize: (field: string, size: string) => {
            setState(state => ({
                ...state,
                grid: {
                    ...state.grid,
                    columnWidths: {
                        ...state.grid?.columnWidths,
                        [field]: size
                    }
                }
            }))
        },
        setDefinition: (def:SetDefinition) => {setState(def);},
        save: () => props.updateDefinition(definition())
    };


    return (
        <BlockContext.Provider value={blockState as BlockStateContext}>
            {props.children}
        </BlockContext.Provider>
    );
}

export function useBlock() { return useContext(BlockContext); }
