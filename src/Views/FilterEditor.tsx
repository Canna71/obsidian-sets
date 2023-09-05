import { Component, For, onMount } from "solid-js";
import { useBlock } from "./components/BlockProvider";
import ClauseEditor from "./components/ClauseEditor";
import { Clause, IntrinsicAttributeKey } from "src/Data/Query";
import { setIcon } from "obsidian";

export interface FilterEditorProps {

    exit: () => void
}

const FilterEditor: Component<FilterEditorProps> = (props) => {
    const { definition, save, addFilter, updateFilter, removeFilter } = useBlock()!;
    // https://docs.solidjs.com/references/api-reference/stores/using-stores
    // const [state, setState] = createStore(definition() || [])
    let addBtn: HTMLDivElement;

    onMount(() => {
        setIcon(addBtn, "plus");
    })

    const onSave = () => {
        // const newDef = {...definition(), }
        // console.log(state);
        // setDefinition(state);
        save();
        props.exit();
        // TODO: close
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

    return (<div class="sets-filter-editor">
        <div class="sets-filter-header">
            <div class="sets-modal-title">Filters</div>

        </div>
        {/* <div>Filters:</div> */}
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
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
    </div>)
}

export default FilterEditor;
