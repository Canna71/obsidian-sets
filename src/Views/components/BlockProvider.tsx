
import { createSignal, createContext, useContext, JSX, Accessor } from "solid-js";
import {  SetDefinition } from "./renderCodeBlock";



export interface BlockStateContext {
    definition: Accessor<SetDefinition>;
    reorder: (from: string, to: string) => void;
    // updateFields: (fields: FieldDefinition[]) => void;
    updateSize: (field: string, size?: string) => void;
    setDefinition: (def:SetDefinition) => void;

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
