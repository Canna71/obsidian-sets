import { Component, For, onMount } from "solid-js";
import { useSet } from "./components/SetProvider";
import ClauseEditor from "./components/ClauseEditor";
import { setIcon } from "obsidian";
import { Clause, IntrinsicAttributeKey } from "./components/SetDefinition";

export interface FilterEditorProps {
    defaultTopResults: number
    exit: () => void
}

const FilterEditor: Component<FilterEditorProps> = (props) => {
    const { definition, save, addFilter, updateFilter, removeFilter, setDefinition } = useSet()!;
    // https://docs.solidjs.com/references/api-reference/stores/using-stores
    // const [state, setState] = createStore(definition() || [])
    let addBtn: HTMLDivElement;

    onMount(() => {
        setIcon(addBtn, "plus");
    })

    const onSave = () => {
        save();
        props.exit();
    }

    const update = (index: number, clause: Clause) => {
        // setState("filter", index, clause);
        updateFilter(index, clause);
    }


    const remove = (index: number) => {
        removeFilter(index);
    } 

    const onAdd = (e: MouseEvent) => {
        const defaultClause: Clause = [IntrinsicAttributeKey.FileName, "eq", ""];
        addFilter(defaultClause);
    }

    const onTopResultsChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        if(isNaN(value)){
            // remove topResults from definition
            setDefinition({...definition(), topResults: undefined});
        } else {
            setDefinition({...definition(), topResults: value});
        }
        
        
        // save();
    }

    return (<div class="sets-filter-editor">
        <div class="sets-filter-header">
            <div class="sets-modal-title">Filters</div>
            
        </div>
        <div class="sets-filters-scroller">
            <div class="sets-filters-wrapper">
                <For each={definition().filter || []}>
                    {
                        (clause, index) => {
                            return <ClauseEditor clause={clause} 
                            remove={() => remove(index())}
                            update={(clause) => update(index(), clause)} />
                        }
                    }
                </For>
            </div>
        </div>
        <div class="sets-filter-buttons clickable-icon" onClick={onAdd} >
            <div ref={addBtn!}
                
                class="sets-filter-add-btn clickable-icon"></div>
                Add filter
        </div>
        <div class="sets-filter-topresults">
            <div class="sets-modal-title">Max Results</div>
            <input type="number" 
                value={definition().topResults} 
                onInput={onTopResultsChange} 
                placeholder={`Max Results `}
            />
            <div class="sets-modal-info">{`(default:${props.defaultTopResults})`}</div>
        </div>
        
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
    </div>)
}

export default FilterEditor;
