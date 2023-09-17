
import { createSignal, createContext, useContext, JSX, Accessor } from "solid-js";
import { AttributeKey, Clause, SetDefinition, SortField } from "./SetDefinition";



export interface SetStateContext {
    definition: Accessor<SetDefinition>;
    refresh: () => void;
    reorder: (from: string, to: string, save?: boolean) => void;
    reorderSort: (from: string, to: string) => void;
    // updateFields: (fields: FieldDefinition[]) => void;
    updateSize: (field: string, size?: string) => void;
    setDefinition: (def: SetDefinition) => void;
    addField: (field: string) => void;
    removeField: (field: string) => void;
    setSortDirection: (field: string, deseending: boolean) => void;
    addSort: (field: string, deseending: boolean) => void;

    removeSort: (field: string) => void;
    save: () => void;
    setNewFile: (path: string) => void;
    getNewFile: () => string;
    addFilter: (clause: Clause) => void;
    updateFilter: (index: number, clause: Clause) => void;
    removeFilter: (index: number) => void;
}
const SetContext = createContext<SetStateContext>();



export function SetProvider(props: { setDefinition: SetDefinition, 
    updateDefinition: (definition: SetDefinition) => void, 
    refresh?: () => void,
    children?: JSX.Element }) {

    const [definition, setState] = createSignal(props.setDefinition);

    const hiddenState = {
        newFile: ""
    }

    const blockState = {
        definition,
        refresh: props.refresh? props.refresh : () => {},
        reorder: (from: string, to: string, save?: boolean) => {
            const updatedItems = definition().fields?.slice();
            if (!updatedItems) throw Error("No items to reoreder!")
            const ids = updatedItems;
            const fromIndex = ids?.indexOf(from);
            const toIndex = ids?.indexOf(to);
            if (updatedItems) {
                updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
            }
            const newDef = { ...definition(), fields: updatedItems }
            if(!save) setState(newDef);
            else props.updateDefinition(newDef)
            // setItems(updatedItems);
        },
        reorderSort: (from: string, to: string) => {
            const updatedItems = definition().sortby?.slice();
            if (!updatedItems) throw Error("No items to reoreder!")
            const ids = updatedItems.map(s => s[0]);
            const fromIndex = ids?.indexOf(from);
            const toIndex = ids?.indexOf(to);
            if (updatedItems) {
                updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
            }
            setState(state => ({
                ...state,
                sortby: updatedItems
            }))


        },
        
        addField: (field: string) => {
            setState(state => ({
                ...state,
                fields: state.fields?.includes(field) ? state.fields : [...state.fields || [], field]
            }))
        },
        removeField: (field: string) => {
            setState(state => ({
                ...state,
                fields: state.fields?.filter(f => f !== field)
            }))
        },
        setSortDirection: (field: AttributeKey, descending: boolean) => {
            setState(state => ({
                ...state,
                sortby: [...(state.sortby || []).map(s => s[0] === field ? [field, descending] as SortField : s)]
            }))
        },
        addSort: (field: AttributeKey, descending: boolean) => {
            setState(state => ({
                ...state,
                sortby: [...(state.sortby || []).filter(([f]) => f !== field), [field, descending]]
            }))
        },
        removeSort: (field: string) => {
            setState(state => ({
                ...state,
                sortby: [...(state.sortby || []).filter(([f]) => f !== field)]
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
        setDefinition: (def: SetDefinition) => { setState(def); },
        save: () => {
            setState(state => ({ ...state, timestamp: Date.now() }))
            props.updateDefinition(definition())
        },
        setNewFile: (path: string) => {
            hiddenState.newFile = path;
        },
        getNewFile: () => hiddenState.newFile,
        addFilter: (clause: Clause) => {
            setState(state => ({
                ...state,
                filter: [...(state.filter || []), clause]
            }))
        },
        updateFilter: (index: number, clause: Clause) => {
            setState(state => ({
                ...state,
                filter: [...(state.filter || []).map((c, i) => i === index ? clause : c)]
            }))
        },
        removeFilter: (index: number) => {
            setState(state => ({
                ...state,
                filter: [...(state.filter || []).filter((c, i) => i !== index)]
            }))
        }
    };


    return (
        <SetContext.Provider value={blockState as SetStateContext}>
            {props.children}
        </SetContext.Provider>
    );
}

export function useBlock() { return useContext(SetContext); }
