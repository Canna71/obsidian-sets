import { Component, For } from "solid-js";
import { VaultDB } from "src/Data/VaultDB";
import { useBlock } from "./components/BlockProvider";
import ClauseEditor from "./components/ClauseEditor";
import { createStore } from "solid-js/store";
import { Clause } from "src/Data/Query";

export interface QueryEditorProps {
    db: VaultDB,
    exit: () => void
}

const QueryEditor:Component<QueryEditorProps> = (props) => {

    const {definition,setDefinition,save} = useBlock()!;
    // https://docs.solidjs.com/references/api-reference/stores/using-stores
    const [state, setState] = createStore(definition()|| [])

    const onSave = () => {
        // const newDef = {...definition(), }
        console.log(state);
        setDefinition(state);
        save();
        props.exit();
        // TODO: close
    }

    const update = (index: number, clause: Clause) => {
        setState("filter", index,  clause);
    }

    return (<div class="sets-query-editor">
        <h3>Query Editor</h3>
        <div>Filters:</div>
        <For each={state.filter || []}>
            {
            (clause, index) => {
                return <ClauseEditor db={props.db} clause={clause} update={(clause)=>update(index(),clause)} />
            }
            }
        </For>
        <button class="mod-cta" onClick={onSave}>Save</button>
        <button class="" onClick={props.exit}>Cancel</button>

    </div>)
}

export default QueryEditor;
