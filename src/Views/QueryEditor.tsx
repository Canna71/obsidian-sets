import { Component, For, createSignal } from "solid-js";
import { VaultDB } from "src/Data/VaultDB";
import { useBlock } from "./components/BlockProvider";
import ClauseEditor from "./components/ClauseEditor";

export interface QueryEditorProps {
    db: VaultDB,

}

const QueryEditor:Component<QueryEditorProps> = (props) => {

    const {definition} = useBlock()!;

    const onSave = () => {
        console.log(definition())
    }

    return (<div class="sets-query-editor">
        <h3>Query Editor</h3>
        <div>Filters:</div>
        <For each={definition().filter}>
            {
            (clause, index) => {
                const [cl,setCl] = createSignal(clause);
                return <ClauseEditor db={props.db} clause={cl} update={setCl} />
            }
            }
        </For>
        <button class="mod-cta" onClick={onSave}>Save</button>
    </div>)
}

export default QueryEditor;
