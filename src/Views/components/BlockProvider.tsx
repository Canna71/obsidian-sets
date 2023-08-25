
import { createSignal, createContext, useContext, JSX, Accessor } from "solid-js";
import { FieldDefinition, SetDefinition } from "./renderCodeBlock";
import { Clause } from "src/Data/Query";



export interface BlockStateContext {
    definition: Accessor<SetDefinition>
    reorder: (from: number, to: number) => void

}
const BlockContext = createContext<BlockStateContext>();



export function BlockProvider(props: { setDefinition: SetDefinition, updateDefinition: (definition: SetDefinition)=>void, children?: JSX.Element }) {

    const [definition, setState] = createSignal(props.setDefinition);
    const blockState = {
        definition,
        reorder: (from: number, to: number) => {
            let updatedItems = definition().fields?.slice();
            if (updatedItems) {
                updatedItems.splice(to, 0, ...updatedItems.splice(from, 1));
            }
            const newDef = {...definition(), fields: updatedItems}
            props.updateDefinition(newDef)
            // setItems(updatedItems);
        }
    };


    return (
        <BlockContext.Provider value={blockState as BlockStateContext}>
            {props.children}
        </BlockContext.Provider>
    );
}

export function useBlock() { return useContext(BlockContext); }
